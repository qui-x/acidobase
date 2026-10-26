import { chromium, firefox, webkit } from 'playwright';
import { strict as assert } from 'node:assert';
import fs from 'node:fs/promises';

const BASE = 'http://127.0.0.1:8765/';
const ROWS = [
  {label:'desktop',width:1440,height:900},
  {label:'mobile',width:390,height:844,isMobile:true,hasTouch:true},
  {label:'paisagem',width:844,height:390,isMobile:true,hasTouch:true},
];
const report=[];
await fs.mkdir('test-results/abertura-v5',{recursive:true});
for (const [browserName,browserType] of Object.entries({chromium,firefox,webkit})) {
  const browser=await browserType.launch({headless:true});
  try {
    for (const viewport of ROWS) {
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},isMobile:!!viewport.isMobile,hasTouch:!!viewport.hasTouch,serviceWorkers:'allow'});
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
      await page.locator('#abertura .ab-contagotas').first().waitFor({timeout:10000});
      assert.equal(await page.locator('#abertura .ab-contagotas').count(),5,'5 conta-gotas');
      assert.equal(await page.locator('#abertura .ab-tubo').count(),5,'5 tubos');
      await page.waitForTimeout(680);
      const chem=await page.evaluate(()=>{
        const sample=SIAB.abertura.TUBOS.map(t=>t.etapas.map(([id])=>SIAB.abertura.leitura(id,t.indicador)));
        return {name:document.title,groups:sample.map(v=>v.length),values:sample.flat().map(x=>x.pH),colors:sample.flat().map(x=>x.cor),labels:Array.from(document.querySelectorAll('#abertura .ab-formula')).map(x=>x.textContent),ph:Array.from(document.querySelectorAll('#abertura .ab-ph')).map(x=>x.textContent)};
      });
      assert.deepEqual(chem.groups,[3,3,3,3,3]);
      assert(chem.values.every(n=>Number.isFinite(n)&&n>=0&&n<=14),'15 pH validos do motor cientifico');
      assert(chem.colors.every(c=>/^rgba\(/.test(c)),'15 cores do motor cientifico');
      assert.equal(chem.labels.length,5);
      assert(chem.ph.every(v=>v.includes('pH')),'pH dos cinco tubos');
      await page.waitForTimeout(2100);
      assert(await page.locator('#abertura.com-marca').count()>0,'identidade final apresentada');
      const last=await page.locator('#abertura .ab-formula').allTextContents();
      assert.equal(last[0],'NaOH');
      assert.equal(last[1],'NH₃');
      await page.screenshot({path:`test-results/abertura-v5/${browserName}-${viewport.label}.png`});
      await page.waitForTimeout(900);
      assert.equal(await page.locator('#abertura').count(),0,'abertura encerra sem bloquear uso');
      assert.equal(errors.length,0,'nenhuma excecao JS durante abertura: '+errors.join('; '));

      // A regressao focal inclui navegacao do proprio programa apos a abertura.
      for (const route of ['inicio','laboratorio','manual','caderno']) {
        await page.evaluate(hash=>{location.hash='#/'+hash},route);
        await page.waitForTimeout(160);
        assert.equal(errors.length,0,`nenhuma excecao JS na rota ${route}`);
      }
      report.push({browser:browserName,viewport:viewport.label,result:'pass',scientific_samples:15,navigated_routes:4});
      await context.close();
    }
    // Acessibilidade: movimento reduzido deve suprimir abertura.
    const reduced=await browser.newContext({reducedMotion:'reduce'});
    const pg=await reduced.newPage();
    await pg.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
    await pg.waitForTimeout(200);
    assert.equal(await pg.locator('#abertura').count(),0,'respeita prefers-reduced-motion');
    await reduced.close();
    // Preferencia salva: o usuario que desativou a abertura nao deve ve-la.
    const off=await browser.newContext();
    const offpage=await off.newPage();
    await offpage.addInitScript(()=>localStorage.setItem('siab_abertura','off'));
    await offpage.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
    await offpage.waitForTimeout(200);
    assert.equal(await offpage.locator('#abertura').count(),0,'respeita preferencia de abertura desligada');
    await off.close();
  } finally {await browser.close()}
}
await fs.writeFile('test-results/abertura-v5/resultados.json',JSON.stringify(report,null,2));
console.log('PASS: 3 motores × 3 viewports, 15 leituras quimicas por caso, navegacao, acessibilidade');
