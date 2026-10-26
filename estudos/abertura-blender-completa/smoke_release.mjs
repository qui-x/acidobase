import { chromium, firefox, webkit } from 'playwright';
import { strict as assert } from 'node:assert';
const url=process.env.SIAB_RELEASE_URL || 'http://127.0.0.1:8777/';
for (const [name, engine] of Object.entries({chromium,firefox,webkit})) {
  const browser = await engine.launch({headless:true});
  try {
    for (const viewport of [{width:1360,height:850},{width:390,height:844}]) {
      const context=await browser.newContext({viewport,hasTouch:viewport.width<500});
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.addInitScript(()=>localStorage.setItem('siab_abertura','on'));
      await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
      const video=page.locator('#abertura video.abertura-3d-video');
      await video.waitFor({state:'attached',timeout:12000});
      assert.equal(await video.count(),1,name+': tem filme do Blender');
      assert.equal(await page.locator('#abertura .ab-tubo').count(),0,name+': nenhum SVG substituto');
      assert.equal(await video.getAttribute('src'),'assets/abertura/siab-blender-intro.mp4');
      await page.waitForFunction(()=>{
        const v=document.querySelector('video.abertura-3d-video');
        return v && (v.readyState>1 || v.error);
      },{timeout:15000});
      const reading=await video.evaluate(v=>({code:v.error?.code??null,readyState:v.readyState,canPlay:v.canPlayType('video/mp4')}));
      assert.equal(reading.code,null,name+': erro de media '+JSON.stringify(reading));
      assert(reading.readyState>1,name+': video mp4 carregado');
      await page.waitForTimeout(4200);
      assert.equal(await page.locator('#abertura').count(),0,name+': fecha e libera aplicacao');
      assert.equal(errors.length,0,name+': nenhum erro JS: '+errors.join('; '));
      await page.evaluate(()=>{location.hash='#/laboratorio'});
      await page.waitForTimeout(200);
      assert.equal(errors.length,0);
      await context.close();
      console.log('PASS '+name+' '+viewport.width+'x'+viewport.height+' mp4 Blender + SIAB');
    }
    const red=await browser.newContext({reducedMotion:'reduce'});
    const p=await red.newPage();
    await p.goto(url,{waitUntil:'domcontentloaded'});
    await p.waitForTimeout(150);
    assert.equal(await p.locator('#abertura').count(),0,'respeita reduzir movimento');
    await red.close();
  } finally {await browser.close()}
}
console.log('PASS: todos os 3 motores e 2 tamanhos e acessibilidade');
