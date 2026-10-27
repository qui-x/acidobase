"use strict";
/* SIAB: modelos, tipografia e animações Blender/GLB em WebGL real.
   O navegador NÃO reproduz vídeos para apresentar a abertura. */
SIAB.abertura=(()=>{
 const CHAVE="siab_abertura",REV="babylon-r1";
 const TUBOS=[
  {indicador:"phenol",nome:"Fenolftaleína",etapas:[["hcl","HCl"],["water","H₂O"],["naoh","NaOH"]]},
  {indicador:"btb",nome:"Bromotimol",etapas:[["acetic","CH₃COOH"],["nacl","NaCl"],["ammonia","NH₃"]]},
  {indicador:"cabbage",nome:"Repolho",etapas:[["lemon","Limão"],["water","H₂O"],["bicarbonate","NaHCO₃"]]},
  {indicador:"methyl",nome:"Metilorange",etapas:[["hcl","HCl"],["acetic","CH₃COOH"],["na2co3","Na₂CO₃"]]},
  {indicador:"universal",nome:"Universal",etapas:[["hcl","HCl"],["nacl","NaCl"],["naoh","NaOH"]]}
 ];
 const TEMPOS={etapas:[150,1000,1750],marca:2350,sair:3650,fim:3650};
 const scripts=new Map();
 let ativa=false,cena=null,motor=null,canvas=null,timer=null,limite=null,onResize=null,stage="idle",grupoCount=0,meshCount=0;
 const ligada=()=>{try{return localStorage.getItem(CHAVE)!=="off";}catch{return true}};
 const status=()=>({ativo:ativa,fase:stage,backend:motor?"Babylon.js/WebGL":null,objetos:meshCount,grupos:grupoCount,versao:REV});
 function leitura(solucao,indicador){
  const tubo={...SIAB.TUBE_DEFAULTS,solution:solucao,indicator:indicador,concentration:0.01,additions:[]};
  const resultado=SIAB.chem.solve(tubo),cor=SIAB.chem.liquid(tubo,false,resultado);
  return {pH:resultado.pH,cor:"rgba("+cor.rgb.map(Math.round).join(",")+","+Math.round(Math.max(cor.opacity,.22)*100)/100+")",nome:cor.name};
 }
 function obterScript(url){
  if(scripts.has(url))return scripts.get(url);
  const promise=new Promise((resolve,reject)=>{
   const s=document.createElement("script");
   s.src=url;s.async=true;s.onload=resolve;s.onerror=()=>reject(new Error("Biblioteca 3D indisponível"));document.head.append(s);
  });
  scripts.set(url,promise);return promise;
 }
 function descartar(){
  if(timer!==null){clearTimeout(timer);timer=null}
  if(limite!==null){clearTimeout(limite);limite=null}
  if(onResize){window.removeEventListener("resize",onResize);onResize=null}
  if(motor){try{motor.stopRenderLoop()}catch{}}
  if(cena){try{cena.dispose()}catch{}cena=null}
  if(motor){try{motor.dispose()}catch{}motor=null}
  canvas=null;
 }
 function encerrar(){
  if(!ativa)return;
  ativa=false;descartar();document.removeEventListener("keydown",encerrar,true);
  const caixa=document.getElementById("abertura");
  if(caixa){caixa.classList.add("saindo");setTimeout(()=>caixa.remove(),250)}
  document.documentElement.dataset.abertura="fim";stage="closed";
 }
 function fallback(){
  if(!ativa)return;
  stage="unsupported";
  const palco=document.querySelector("#abertura .abertura-palco");
  if(palco){const img=new Image();img.src="assets/abertura/siab-blender-poster.png";
   img.alt="Cinco tubos e conta-gotas da abertura tridimensional";img.className="abertura-3d-poster";palco.replaceChildren(img)}
  limite=setTimeout(encerrar,700);
 }
 function atualizarCores(scene,B){
  // As quinze cores vêm do motor químico, não de uma tabela inventada.
  TUBOS.forEach((t,i)=>t.etapas.forEach(([amostra],j)=>{
   const dado=leitura(amostra,t.indicador);
   const rgba=dado.cor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
   if(!rgba)return;
   const material=scene.getMaterialByName("INDICADOR_COR_"+(i+1)+"_"+(j+1));
   if(material&&material.albedoColor){material.albedoColor=B.Color3.FromInts(+rgba[1],+rgba[2],+rgba[3]);material.alpha=.93}
  }));
 }
 async function montar3D(){
  try{
   await obterScript("vendor/babylon/babylon.js?v="+REV);
   if(!ativa)return;
   await obterScript("vendor/babylon/babylonjs.loaders.min.js?v="+REV);
   if(!ativa)return;
   const B=window.BABYLON;
   if(!B||!B.Engine.isSupported()){fallback();return}
   motor=new B.Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true},true);
   cena=new B.Scene(motor);cena.clearColor=new B.Color4(.021,.043,.076,1);
   const camera=new B.FreeCamera("SIAB-câmera",new B.Vector3(0,1.7,11.5),cena);
   camera.setTarget(new B.Vector3(0,1.36,0));camera.mode=B.Camera.ORTHOGRAPHIC_CAMERA;cena.activeCamera=camera;
   onResize=()=>{
    if(!ativa||!motor)return;
    const ratio=Math.max(.6,canvas.clientWidth/Math.max(1,canvas.clientHeight)),half=Math.max(2.86,3.15/ratio);
    camera.orthoTop=half;camera.orthoBottom=-half;camera.orthoLeft=-half*ratio;camera.orthoRight=half*ratio;motor.resize();
   };
   window.addEventListener("resize",onResize,{passive:true});onResize();
   const light=new B.HemisphericLight("SIAB-luz-suave",new B.Vector3(0,1,0),cena);
   light.intensity=.96;light.diffuse=new B.Color3(.83,.91,1);
   const fill=new B.PointLight("SIAB-luz-vidro",new B.Vector3(-2.2,4.2,4.4),cena);
   fill.intensity=125;fill.diffuse=new B.Color3(.82,.89,1);
   const accent=new B.PointLight("SIAB-luz-rosa",new B.Vector3(2.6,3.8,3.8),cena);
   accent.intensity=57;accent.diffuse=new B.Color3(1,.7,.88);
   const data=await B.SceneLoader.ImportMeshAsync(null,"assets/abertura/","siab-abertura.glb",cena);
   if(!ativa)return;
   meshCount=data.meshes.filter(m=>m.name!=="__root__").length;
   grupoCount=data.animationGroups.length;
   if(meshCount<100||grupoCount<100)throw new Error("GLB incompleto: "+meshCount+" objetos, "+grupoCount+" animações");
   atualizarCores(cena,B);
   data.animationGroups.forEach(g=>{g.stop();g.reset()});
   motor.runRenderLoop(()=>{if(ativa&&cena)cena.render()});
   // As marcações de tempo exportadas do Blender são preservadas.
   data.animationGroups.forEach(g=>g.start(false,1,g.from,g.to));
   stage="running";timer=setTimeout(encerrar,TEMPOS.fim+320);
  }catch(error){console.warn("SIAB: cena WebGL indisponível",error);descartar();fallback()}
 }
 function iniciar(){
  const caixa=document.getElementById("abertura");if(!caixa)return;
  const reduzir=window.A11Y?.estado?.motion||window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if(!ligada()||reduzir||getComputedStyle(caixa).display==="none"){
   caixa.remove();document.documentElement.dataset.abertura="fim";stage="skipped";return;
  }
  ativa=true;stage="loading";caixa.classList.add("abertura-webgl");
  const palco=caixa.querySelector(".abertura-palco");if(!palco){encerrar();return}
  canvas=document.createElement("canvas");canvas.className="abertura-3d-canvas";
  canvas.setAttribute("aria-label","Animação tridimensional dos cinco indicadores ácido-base");
  canvas.setAttribute("role","img");palco.replaceChildren(canvas);
  caixa.addEventListener("pointerdown",encerrar,{once:true});
  document.addEventListener("keydown",encerrar,true);
  limite=setTimeout(encerrar,12000);montar3D();
 }
 function definir(ligar){try{localStorage.setItem(CHAVE,ligar?"on":"off")}catch{}}
 return {iniciar,encerrar,definir,ligada,leitura,TUBOS,TEMPOS,status};
})();
SIAB.abertura.iniciar();
