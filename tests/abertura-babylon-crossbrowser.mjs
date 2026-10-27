import {chromium,firefox,webkit} from 'playwright';
import {strict as assert} from 'node:assert';
import {mkdirSync} from 'node:fs';
const BASE='http://127.0.0.1:8777/';
mkdirSync('test-results/siab-webgl',{recursive:true});
for(const [name,engine] of Object.entries({chromium,firefox,webkit})){
 const opts=name==='chromium'?{headless:true,args:['--use-angle=swiftshader','--enable-webgl']} : name==='firefox'?{headless:true,firefoxUserPrefs:{'webgl.force-enabled':true,'webgl.disabled':false,'gfx.webrender.software':true}}:{headless:true};
 const browser=await engine.launch(opts);
 try{
  for(const v of [{width:1440,height:900},{width:390,height:844}]){
   const context=await browser.newContext({viewport:v,serviceWorkers:'block'});
   const p=await context.newPage(),errors=[];
   p.on('pageerror',e=>errors.push(e.message));
   await p.addInitScript(()=>{
    localStorage.setItem('siab_abertura','on');
    localStorage.setItem('siab_inicializacao','inicio');
   });
   await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:45000});
   await p.locator('#abertura canvas.abertura-3d-canvas').waitFor({timeout:10000});
   assert.equal(await p.locator('#abertura video').count(),0,'O vídeo pré-renderizado foi retirado');
   await p.waitForFunction(()=>{
    const s=window.SIAB?.abertura?.status?.();
    return s?.fase==='running'||s?.fase==='unsupported'||s?.fase==='closed';
   },null,{timeout:45000});
   const s=await p.evaluate(()=>SIAB.abertura.status());
   assert.equal(errors.length,0,'Exceção JS ao carregar 3D: '+errors.join('|'));
   if(s.fase==='unsupported'){
    // Alguns runners Linux bloqueiam WebGL em Firefox/WebKit headless.
    // Nesses casos, comprovar que o fallback é só uma imagem, nunca um vídeo.
    const support=await p.evaluate(()=>({
      webgl:!!document.createElement('canvas').getContext('webgl'),
      webgl2:!!document.createElement('canvas').getContext('webgl2')
    }));
    assert(!support.webgl&&!support.webgl2,name+': WebGL disponível mas o renderer não carregou: '+JSON.stringify(s));
    await p.screenshot({path:'test-results/siab-webgl/'+name+'-'+v.width+'-fallback.png'});
    await p.waitForTimeout(1150);
    assert.equal(await p.locator('#abertura').count(),0,'Fallback deve liberar navegação');
    console.log('FALLBACK SEM WEBGL',name,v.width,'modo estático validado');
   }else{
    assert.equal(s.fase,'running',name+' '+v.width+': Babylon GLB não iniciou: '+JSON.stringify(s));
    assert.equal(s.backend,'Babylon.js/WebGL');
    assert(s.objetos>=120,'Malhas 3D ausentes: '+s.objetos);
    assert(s.grupos>=120,'Grupos Blender não sincronizados: '+s.grupos);
    await p.screenshot({path:'test-results/siab-webgl/'+name+'-'+v.width+'.png'});
    await p.waitForTimeout(4600);
    assert.equal(await p.locator('#abertura').count(),0,'Animação deve liberar a navegação');
    assert.equal((await p.evaluate(()=>SIAB.abertura.status())).fase,'closed');
   }
   assert.equal(errors.length,0,'Erros JS ao encerrar WebGL: '+errors.join('|'));
   await p.evaluate(()=>{location.hash='#/laboratorio'});
   await p.waitForTimeout(150);
   assert.equal(errors.length,0);
   console.log('PASS',name,v.width,v.height,s.objetos,'malhas',s.grupos,'animações');
   await context.close();
  }
  const reduced=await browser.newContext({reducedMotion:'reduce',serviceWorkers:'block'});
  const p=await reduced.newPage();await p.goto(BASE,{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(200);
  assert.equal(await p.locator('#abertura').count(),0,'Reduzir movimento');
  await reduced.close();
 }finally{await browser.close()}
}
console.log('PASS: Chromium, Firefox, WebKit e acessibilidade sem vídeo');
