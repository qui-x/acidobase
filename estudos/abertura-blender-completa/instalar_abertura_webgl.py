#!/usr/bin/env python3
"""Publica o GLB do Blender como abertura WebGL integrada sem modificar o SIAB.
Uso: python instalar_abertura_webgl.py /tmp/siab-site /path/para/glb.
O navegador apenas renderiza geometria 3D; não há vídeo na abertura."""
from pathlib import Path
import sys,shutil,struct,re
site=Path(sys.argv[1]).resolve()
model=Path(sys.argv[2]).resolve()
source=Path(__file__).resolve().parents[2]
assert model.is_file() and model.stat().st_size>10000
with model.open('rb') as f:
    h=f.read(12)
assert h[:4]==b'glTF' and struct.unpack_from('<I',h,8)[0]==model.stat().st_size,"GLB inválido"
asset=site/'assets/abertura'
asset.mkdir(parents=True,exist_ok=True)
shutil.copyfile(model,asset/'siab-abertura.glb')
for src,dst in [
    (source/'js/ui/abertura-webgl.js',site/'js/ui/abertura.js'),
    (source/'css/abertura-webgl.css',site/'css/abertura-webgl.css'),
    (source/'node_modules/babylonjs/babylon.js',site/'vendor/babylon/babylon.js'),
    (source/'node_modules/babylonjs-loaders/babylonjs.loaders.min.js',site/'vendor/babylon/babylonjs.loaders.min.js')
]:
    assert src.is_file(),str(src)+' ausente'
    dst.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(src,dst)
index=site/'index.html'
s=index.read_text(encoding='utf-8')
pattern=r'(<div id="abertura" class="abertura" aria-hidden="true">\s*<div class="abertura-palco">)(.*?)(</div>\s*<p class="abertura-pular">)'
s,num=re.subn(pattern,r'\1\3',s,count=1,flags=re.S)
assert num==1, 'Não foi possível simplificar o palco da abertura'
assert '<svg class="abertura-tubos"' not in s,'SVG da abertura ainda existe'
assert 'css/abertura-v5.css?v=' in s
s=re.sub(r'(<link rel="stylesheet" href="css/abertura-v5.css\?v=[^"]+" />)',
    r'\1\n    <link rel="stylesheet" href="css/abertura-webgl.css?v=1.0.0+20261026-webgl1" />',s,count=1)
s,count=re.subn(r'js/ui/abertura\.js\?v=[^"]+', 'js/ui/abertura.js?v=1.0.0+20261026-webgl1',s,count=1)
assert count==1,'Script de abertura ausente'
index.write_text(s,encoding='utf-8')
sw=site/'sw.js'
cache=sw.read_text(encoding='utf-8')
cache,count=re.subn(r'const VERSAO = "[^"]+";', 'const VERSAO = "siab-1.0.0+20261026-webgl1";',cache,count=1)
assert count==1,'Versão offline não localizada'
cache=cache.replace('  "./assets/abertura/siab-blender-intro.mp4",\n','')
cache=cache.replace('  "./assets/abertura/siab-blender-intro.webm",\n','')
required=['  "./assets/abertura/siab-abertura.glb",','  "./vendor/babylon/babylon.js",','  "./vendor/babylon/babylonjs.loaders.min.js",','  "./css/abertura-webgl.css",']
for item in required:
    if item not in cache:cache=cache.replace('  "./index.html",','  "./index.html",\n'+item,1)
sw.write_text(cache,encoding='utf-8')
# Retira os vídeos da distribuição nova; poster fica como alternativa estática.
for name in ('siab-blender-intro.mp4','siab-blender-intro.webm'):
    old=asset/name
    if old.exists():old.unlink()
assert (site/'js/ui/abertura.js').is_file()
assert 'createElement("video")' not in (site/'js/ui/abertura.js').read_text()
print('SIAB_WEBGL_INTEGRADO',site,'GLB',model.stat().st_size)
