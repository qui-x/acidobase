"""SIAB: abertura inteiramente modelada/animada em Blender.
Vidros, conta-gotas, reagentes, meniscos, bolhas, suporte, identidade e textos
sao geometria tridimensional real. Nenhum objeto SVG/Canvas 2D.
As leituras sao obtidas por extrair_leituras.mjs a partir do SIAB.chem.
Executar no Blender: blender -b -t 2 --python build_scene.py -- --values readings.json
  --out output --render-frames
"""
import argparse, json, math, re, sys
from pathlib import Path
import bpy
from mathutils import Vector

FPS=30
DURATION=3.65
FRAMES=110
STAGES=(.15,1.00,1.75)
INDICATORS=('Fenolftaleína','Bromotimol','Repolho','Metilorange','Universal')
SPACING=1.115
LEVELS=(.79,1.06,1.32)
COLOR_DARK=(.022,.044,.079,1)
def frame(t): return max(1,round(t*FPS)+1)
def hexcolor(h):
    s=h.removeprefix('#')
    return tuple(int(s[i:i+2],16)/255.0 for i in (0,2,4))
def mat(name,c,alpha=1.0,metal=0.0,rough=.25,transmission=0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=tuple(c[:3])+(1,)
    p.inputs['Metallic'].default_value=metal
    p.inputs['Roughness'].default_value=rough
    p.inputs['Alpha'].default_value=alpha
    for tr in ('Transmission Weight','Transmission'):
        if tr in p.inputs: p.inputs[tr].default_value=transmission; break
    m.diffuse_color=tuple(c[:3])+(alpha,)
    if alpha<1:
        if hasattr(m,'surface_render_method'):
            try:m.surface_render_method='BLENDED'
            except Exception:pass
        elif hasattr(m,'blend_method'):
            try:m.blend_method='BLEND'
            except Exception:pass
    return m
def lathe(name,coords,material,x=0,y=0,steps=48):
    verts=[(r*math.cos(2*math.pi*k/steps),r*math.sin(2*math.pi*k/steps),z)
        for r,z in coords for k in range(steps)]
    faces=[]
    for j in range(len(coords)):
        for k in range(steps):
            a=j*steps+k;b=j*steps+(k+1)%steps
            n=((j+1)%len(coords))*steps+(k+1)%steps
            q=((j+1)%len(coords))*steps+k
            faces.append((a,b,n,q))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
    obj.location=(x,y,0);obj.data.materials.append(material)
    for p in mesh.polygons:p.use_smooth=True
    return obj
def sph(name,pos,scale,material,seg=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=16,location=pos)
    o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(material)
    for p in o.data.polygons:p.use_smooth=True
    return o
def cyl(name,pos,r,depth,material,vertices=32):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=depth,location=pos)
    o=bpy.context.object;o.name=name;o.data.materials.append(material)
    bevel=o.modifiers.new('Rounded edges','BEVEL');bevel.width=.018;bevel.segments=3
    o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return o
def curve_label(name,message,pos,size,material):
    cu=bpy.data.curves.new(name,'FONT')
    cu.body=str(message);cu.size=size;cu.align_x='CENTER';cu.align_y='CENTER'
    cu.extrude=.0025;cu.bevel_depth=.00045
    o=bpy.data.objects.new(name,cu);bpy.context.collection.objects.link(o)
    o.location=pos;o.rotation_euler=(math.pi/2,0,0);cu.materials.append(material)
    # glTF requires mesh geometry for native 3D typography.
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True)
    bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
    return bpy.context.object
def k(obj,t,scale=None,location=None):
    if location is not None:
        obj.location=location;obj.keyframe_insert('location',frame=frame(t))
    if scale is not None:
        obj.scale=scale;obj.keyframe_insert('scale',frame=frame(t))
def staged_visibility(ob,appearance,exit_at=None,scale=(1,1,1),rise=.08):
    initial=tuple(.0001 for _ in scale)
    k(ob,0,scale=initial)
    if appearance>0:
        k(ob,max(.001,appearance-.06),scale=initial)
    k(ob,appearance+.12,scale=scale)
    if exit_at is not None:
        k(ob,max(appearance+.13,exit_at-.07),scale=scale)
        k(ob,exit_at+.06,scale=initial)
def profile_tube():
    outer=.214;inner=.191;bottom=.28
    p=[(outer,2.02),(outer,bottom)]
    p.extend((outer*math.cos(a),bottom-outer*math.sin(a)) for a in
        [math.pi*j/56 for j in range(1,29)])
    p.extend((inner*math.cos(a),bottom-inner*math.sin(a)) for a in
        [math.pi*j/56 for j in range(28,0,-1)])
    p.extend([(inner,bottom),(inner,2.02)])
    return p
def profile_liquid(top):
    r=.175;bottom=.27
    p=[(r,top),(r,bottom)]
    p.extend((r*math.cos(a),bottom-r*math.sin(a)) for a in
        [math.pi*j/32 for j in range(1,17)])
    p.append((0,top))
    return p
def profile_drop():
    return [(.005,.080),(.023,.050),(.045,.006),(.053,-.028),
            (.044,-.055),(.024,-.075),(.003,-.080)]
def build(readings):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene=bpy.context.scene
    scene.frame_start=1;scene.frame_end=FRAMES;scene.render.fps=FPS
    scene.render.resolution_x=840;scene.render.resolution_y=472
    scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG'
    scene.render.film_transparent=False
    # Cycles CPU suporta render headless; Eevee aborta sem GPU/EGL no runner.
    scene.render.engine='CYCLES'
    scene.cycles.device='CPU'
    scene.cycles.samples=10
    scene.cycles.use_denoising=False
    for layer in scene.view_layers:
        if hasattr(layer, "cycles"): layer.cycles.use_denoising=False
    scene.render.threads_mode='FIXED'
    scene.render.threads=2
    if scene.world is None:scene.world=bpy.data.worlds.new('SIAB dark studio')
    scene.world.use_nodes=True
    scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=COLOR_DARK
    scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.80
    glass=mat('Vidro transparente - paredes reais',(.78,.90,1),alpha=.30,rough=.055,transmission=.62)
    rubber=mat('Bulbo de borracha azul ardósia',(.085,.20,.30),rough=.42)
    reagent=mat('Reagente incolor em cada pipeta',(.80,.94,1),alpha=.35,rough=.065,transmission=.72)
    support=mat('Suporte aço azulado',(.24,.36,.49),metal=.66,rough=.30)
    bright=mat('Letras creme azulado',(.81,.91,1),rough=.70)
    secondary=mat('Letras auxiliares',(.64,.75,.85),rough=.70)
    pink=mat('Marca rosa do SIAB',(.86,.23,.56),metal=.17,rough=.28)
    dropmat=mat('Gotas incolores tridimensionais',(.76,.93,1),alpha=.76,rough=.07,transmission=.55)
    # Suportes construidos como cilindros reais com profundidade, atras dos tubos.
    for n,z in enumerate((.93,1.38)):
        rail=cyl(f'SUPORTE_TRIDIMENSIONAL_{n+1}',(0,.32,z),.035,5.60,support)
        rail.rotation_euler=(0,math.pi/2,0)
    for i,(label,measurements) in enumerate(zip(INDICATORS,readings)):
        x=(i-2)*SPACING
        # Vidro com espessura e cavidade aberta: nao um desenho plano.
        wall=lathe(f'TUBO_DE_VIDRO_3D_{i+1}',profile_tube(),glass,x)
        lip=lathe(f'BORDA_VIDRO_3D_{i+1}',[(.21,2.045),(.226,2.04),(.225,2.011),(.191,2.010)],glass,x)
        for ob in (wall,lip):
            staged_visibility(ob,.04+i*.045)
        curve_label(f'INDICADOR_{i+1}',label,(x,-.29,-.08),.115,bright)
        # Cada nivel/cor e um volume real, nao um rectangulo SVG.
        for j,item in enumerate(measurements):
            c=hexcolor(item['color'])
            liquid_mat=mat(f'INDICADOR_COR_{i+1}_{j+1}',c,alpha=.78,rough=.14,transmission=.22)
            level=LEVELS[j]
            body=lathe(f'LIQUIDO_VOLUMETRICO_{i+1}_{j+1}',profile_liquid(level),liquid_mat,x,0,48)
            meniscus=sph(f'MENISCO_ELIPSOIDAL_{i+1}_{j+1}',(x,-.002,level),(.177,.177,.013),liquid_mat,32)
            appear=(.37+i*.046) if j==0 else (STAGES[j]+.31+i*.043)
            disappear=(STAGES[j+1]+.31+i*.043) if j<2 else None
            staged_visibility(body,appear,disappear)
            staged_visibility(meniscus,appear,disappear)
            # Etiquetas cientificas sao malhas 3D, animadas junto com a cena.
            formula=curve_label(f'SUBSTANCIA_{i+1}_{j+1}',item['formula'],(x,-.28,3.92),.129,bright)
            ph=curve_label(f'PH_MEDIDO_{i+1}_{j+1}',f"pH {item['ph']:.1f}",(x,-.29,-.30),.114,secondary)
            start=(0 if j==0 else STAGES[j]+.22+i*.043)
            end=(STAGES[j+1]+.24+i*.043) if j<2 else None
            staged_visibility(formula,start,end)
            staged_visibility(ph,start+.12,end)
        # Pipeta volumetrica: borracha, ombro do tubo, vidro e ponta capilar.
        bulb=sph(f'CONTA_GOTAS_BULBO_{i+1}',(x,0,3.48),(.172,.151,.172),rubber,32)
        shaft=lathe(f'CONTA_GOTAS_VIDRO_{i+1}',[
            (.067,3.37),(.075,3.33),(.068,3.10),(.046,2.94),
            (.026,2.81),(.017,2.62),(.012,2.60),(.007,2.81),
            (.030,2.95),(.052,3.10),(.051,3.34)],glass,x)
        reagent_col=lathe(f'CONTA_GOTAS_CONTEUDO_{i+1}',[
            (.038,3.29),(.040,3.10),(.026,2.94),(.01,2.76),(0,2.76),(0,3.29)],reagent,x)
        for ob in (bulb,shaft,reagent_col):staged_visibility(ob,.08+i*.04)
        for j,start in enumerate(STAGES):
            s=start+i*.048
            for offset,v in ((-.035,1.0),(.065,.81),(.18,1.0)):
                k(bulb,max(0,s+offset),scale=(.172,.151,.172*v))
            drop=lathe(f'GOTA_3D_{i+1}_{j+1}',profile_drop(),dropmat,x,-.02,32)
            # Perfil criado em Z local; atravessa fisicamente ponta e boca do tubo.
            for tt,z,factor in [(0,2.52,.0001),(max(0,s-.01),2.52,.0001),
                                (s+.06,2.52,1),(s+.25,LEVELS[j]+.21,1),
                                (s+.34,LEVELS[j]+.035,.0001)]:
                k(drop,tt,location=(x,-.02,z),scale=(factor,factor,factor))
        for j in range(3):
            b=sph(f'BOLHA_3D_{i+1}_{j+1}',(x+(-.07+j*.065),-.05,.42),(.026,.026,.026),dropmat,16)
            base=.63+i*.043+j*.22
            for time,z,sz in [(0,.38,.0001),(base,.38,.0001),
                              (base+.22,.56,.026),(base+.7,1.11,.0001)]:
                k(b,time,location=(x+(-.07+j*.065),-.05,z),scale=(sz,sz,sz))
    # Marca institucional, tambem em geometria 3D, nao CSS nem SVG.
    brand=curve_label('SIAB_LOGOTIPO_TRIDIMENSIONAL','SIAB',(0,-.12,-.69),.365,pink)
    full=curve_label('SIAB_SUBTITULO_TRIDIMENSIONAL','Simulador Interativo de Ácidos e Bases',
                     (0,-.12,-.93),.145,bright)
    motto=curve_label('SIAB_LEMA_TRIDIMENSIONAL','A química das cores',(0,-.12,-1.12),.12,secondary)
    for obj in (brand,full,motto):staged_visibility(obj,2.34)
    # Camera fisica, luzes e volume real.
    target=Vector((0,0,1.38))
    bpy.ops.object.camera_add(location=(0,-11.5,1.9))
    cam=bpy.context.object;cam.name='SIAB_CAMERA_3D'
    cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
    cam.data.type='ORTHO';cam.data.ortho_scale=9.5;scene.camera=cam
    for name,pos,energy,color,size in (
        ('Key light glass',(-3.1,-4.8,5.2),930,(.77,.90,1),5.0),
        ('Pink accent',(3.5,-3.8,4.6),700,(1,.72,.92),4.8),
        ('Rim light',(0,3.1,5.3),1300,(.65,.84,1),4.0)):
        lamp=bpy.data.lights.new(name,'AREA')
        lamp.energy=energy;lamp.color=color;lamp.shape='DISK';lamp.size=size
        ob=bpy.data.objects.new(name,lamp)
        bpy.context.collection.objects.link(ob);ob.location=pos
        ob.rotation_euler=(target-ob.location).to_track_quat('-Z','Y').to_euler()
    for label,t in [('Primeira adição',.15),('Segunda adição',1),('Terceira adição',1.75),
                    ('Marca SIAB',2.35),('Encerramento',3.2)]:
        scene.timeline_markers.new(label,frame=frame(t))
    # Interpolacao fluida que tambem e exportada como glTF animation.
    for ob in bpy.data.objects:
        if not ob.animation_data or not ob.animation_data.action:continue
        for fc in ob.animation_data.action.fcurves:
            for point in fc.keyframe_points:
                point.interpolation='BEZIER'
                point.handle_left_type='AUTO_CLAMPED'
                point.handle_right_type='AUTO_CLAMPED'
    scene.frame_set(1)
    return scene

def main():
    args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    ap=argparse.ArgumentParser()
    ap.add_argument('--values',required=True)
    ap.add_argument('--out',required=True)
    ap.add_argument('--render-frames',action='store_true')
    options=ap.parse_args(args)
    vals=json.loads(Path(options.values).read_text(encoding='utf8'))
    assert len(vals)==5 and all(len(arr)==3 for arr in vals),'Deve ter 5 indicadores e 3 leituras cientificas'
    scene=build(vals)
    output=Path(options.out).resolve();output.mkdir(parents=True,exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(output/'SIAB_abertura_completa.blend'))
    bpy.ops.export_scene.gltf(filepath=str(output/'SIAB_abertura_completa.glb'),
        export_format='GLB',export_animations=True,export_extras=True)
    # Renders reais do Blender - nao simulacoes HTML.
    stills=output/'quadros';stills.mkdir(exist_ok=True)
    for t in (.6,1.45,2.25,2.86):
        scene.frame_set(frame(t))
        scene.render.filepath=str(stills/f'siab_{round(t*1000):04d}.png')
        bpy.ops.render.render(write_still=True)
    if options.render_frames:
        frames=output/'frames';frames.mkdir(exist_ok=True)
        scene.render.filepath=str(frames/'siab_')
        scene.frame_set(1)
        bpy.ops.render.render(animation=True)
    print('SIAB_BLENDER_RENDER_SUCCESS',output)

if __name__=='__main__':main()
