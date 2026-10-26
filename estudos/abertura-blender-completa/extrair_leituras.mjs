// Exportar do verdadeiro motor SIAB.chem (nunca inventar valores de pH/cores).
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(String(e)));
await page.addInitScript(()=>{localStorage.setItem('siab_abertura','off');localStorage.setItem('siab_inicializacao','inicio')});
await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForFunction(()=>window.SIAB?.abertura?.leitura && window.SIAB?.chem?.solve,{timeout:30000});
const results=await page.evaluate(()=>{
  return SIAB.abertura.TUBOS.map(t=>t.etapas.map(([id,formula])=>{
    const reading=SIAB.abertura.leitura(id,t.indicador);
    const nums=reading.cor.match(/rgba?\(([^)]+)\)/)?.[1].split(',').map(Number)??[];
    if(nums.length<3)throw new Error('Cor ausente de '+id+': '+reading.cor);
    const color='#'+nums.slice(0,3).map(n=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0')).join('');
    return {formula,ph:reading.pH,color,sample:id,indicator:t.indicador};
  })));
});
assert.equal(results.length,5);
assert(results.every(row=>row.length===3));
assert(results.flat().every(row=>Number.isFinite(row.ph)&&row.ph>=0&&row.ph<=14));
mkdirSync('estudos/abertura-blender-completa/data',{recursive:true});
writeFileSync('estudos/abertura-blender-completa/data/leituras.json',JSON.stringify(results,null,2)+'\n');
console.log('SIAB_CHEM_READINGS_OK',results.flat().length,'amostras');
await browser.close();
if(errors.length)console.error('Avisos do aplicativo: ',errors.slice(0,5));
