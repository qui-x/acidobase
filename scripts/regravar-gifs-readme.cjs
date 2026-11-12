"use strict";
/* Regrava demonstrações em quadros reais do SIAB, sem desenho artificial.
   As sequências são capturadas no Chromium por Playwright e convertidas em GIF
   com scripts/montar-gifs-readme.py.
*/
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const URL = process.env.SIAB_TEST_URL || "http://127.0.0.1:8765";
const framesDir = path.resolve(".readme-frames");
fs.mkdirSync(framesDir, { recursive: true });
const specs = [];
const delay = ms => new Promise(r => setTimeout(r, ms));

async function entrar(page, rota = "laboratorio") {
  await page.goto(URL + "/#/" + rota, { waitUntil: "load" });
  await page.waitForFunction(() => window.SIAB?.workspace?.ready &&
    document.documentElement.dataset.appPronto === "true", null,
    { timeout: 45000 });
  await page.evaluate(() => {
    window.SIAB.abertura?.encerrar?.();
    document.querySelector("#abertura")?.remove();
    document.querySelectorAll("dialog[open]").forEach(x => x.close());
  });
  assert.equal(await page.locator("#falha-abertura").count(), 0);
}

async function arrumarBancada(page) {
  await page.evaluate(() => {
    window.SIAB.workspace.close("left", false);
    window.SIAB.workspace.close("right", false);
    const toast = document.querySelector("#toast");
    if (toast) toast.hidden = true;
    const boas = document.querySelector("#boas-vindas");
    if (boas) boas.hidden = true;
  });
  await delay(150);
}

async function montar(page, id, ferramenta) {
  await entrar(page);
  await page.evaluate(({ id, ferramenta }) => {
    window.SIAB.montarMontagem(id);
    window.SIAB.workspace.close("left", false);
    window.SIAB.workspace.close("right", false);
    if (ferramenta) window.SIAB.workspace.open("right", ferramenta);
    const toast = document.querySelector("#toast");
    if (toast) toast.hidden = true;
    const boas = document.querySelector("#boas-vindas");
    if (boas) boas.hidden = true;
  }, { id, ferramenta });
  await delay(400);
  assert.ok(await page.evaluate(() => window.SIAB.current()?.solution));
}

async function snap(page, name, ms = 700) {
  const directory = path.join(framesDir, name);
  fs.mkdirSync(directory, { recursive: true });
  const index = fs.readdirSync(directory).filter(x => x.endsWith(".png")).length;
  const filename = path.join(directory, String(index).padStart(3,"0")+".png");
  await page.screenshot({ path: filename, animations: "disabled", caret: "hide",
    fullPage: false });
  assert.ok(fs.statSync(filename).size > 10000, "Captura vazia: "+filename);
  specs.push({ name, filename, ms });
  console.log("FRAME "+name+" "+index+" "+ms+"ms");
}

async function gotas(page, n) {
  const actual = await page.evaluate(n => window.SIAB.bancada.gotejar(n), n);
  assert.equal(actual, n, "Quantidade de gotas inesperada");
  await delay(300);
}

async function medirPh(page) {
  const result = await page.evaluate(() => {
    const t = window.SIAB.current();
    return window.SIAB.instrumentos.medir(t, "phmetro", "pontual");
  });
  assert.ok(result, "Falha ao iniciar leitura pelo pHmetro");
  await delay(700);
}

async function titracao(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 780 },
    reducedMotion: "reduce", colorScheme: "dark" });
  try {
    await montar(page, "titulacao-forte", "grafico");
    await medirPh(page);
    await snap(page, "titulacao-atual", 1000);
    let anterior = 0;
    for(const total of [4,8,12,16,18,19,20,21,23,25,30]) {
      await gotas(page, total-anterior);
      await medirPh(page);
      await snap(page, "titulacao-atual", total===20?1500:650);
      anterior = total;
    }
    const leitura = await page.evaluate(() => ({
      count: window.SIAB.current().additions.length,
      measurements: window.SIAB.instrumentos.dados(window.SIAB.current()).rawMeasurements.length,
    }));
    assert.equal(leitura.count,30);
    assert.ok(leitura.measurements >= 10);
  } finally { await page.close(); }
}

async function agitar(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 780 },
    colorScheme: "dark" });
  try {
    await montar(page, "titulacao-forte", null);
    await snap(page,"agitar-atual",800);
    let prev=0;
    for(const total of [3,9,15,18,19,20,21,23]) {
      await gotas(page,total-prev);
      await snap(page,"agitar-atual",650);
      prev=total;
    }
    await page.evaluate(() => window.SIAB.bancada.agitar());
    await snap(page,"agitar-atual",600);
    await delay(300);
    await snap(page,"agitar-atual",950);
  } finally { await page.close(); }
}

async function particulas(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 780 },
    colorScheme: "dark" });
  try {
    await montar(page,"titulacao-forte","particulas");
    const visible = await page.locator("#ver-conteudo .lupa-svg").count();
    assert.ok(visible > 0, "A visão real de partículas não apareceu");
    await snap(page,"particulas-atual",900);
    let prev=0;
    for(const total of [3,6,10,15,18,19,20,21,22,25]) {
      await gotas(page,total-prev);
      await snap(page,"particulas-atual",700);
      prev=total;
    }
  } finally { await page.close(); }
}

async function arcoIris(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 780 },
    reducedMotion:"reduce",colorScheme:"dark" });
  try {
    await montar(page, "arco-iris-ph", null);
    await page.evaluate(() => {
      window.SIAB.state.view = "overview";
      window.SIAB.render(true);
    });
    await snap(page,"arco-iris-atual",1250);
    const ids = await page.evaluate(() => window.SIAB.state.tubes.map(t => t.id));
    assert.equal(ids.length,7,"Arco-íris precisa de sete tubos");
    for(const id of ids) {
      await page.evaluate(id => window.SIAB.bancada.selecionarTubo(id),id);
      await delay(250);
      await snap(page,"arco-iris-atual",600);
    }
    await page.evaluate(() => { window.SIAB.state.view="overview"; window.SIAB.render(true); });
    await snap(page,"arco-iris-atual",1400);
  } finally { await page.close(); }
}

async function celular(browser) {
  const context=await browser.newContext({ viewport: {width:390,height:844},
    reducedMotion:"reduce", colorScheme:"dark", deviceScaleFactor:1,
    isMobile:true,hasTouch:true,
    userAgent:"Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36" });
  const page=await context.newPage();
  try {
    await montar(page,"titulacao-forte",null);
    await arrumarBancada(page);
    await snap(page,"celular-atual",950);
    let prev=0;
    for(const total of [3,8,13,18,19,20,21,23,25]) {
      await gotas(page,total-prev);
      await page.evaluate(() => {
        window.SIAB.workspace.close("left",false);
        window.SIAB.workspace.close("right",false);
        const toast=document.querySelector("#toast");
        if(toast)toast.hidden=true;
      });
      await snap(page,"celular-atual",680);
      prev=total;
    }
  } finally {await context.close();}
}

async function abertura(browser) {
  const page=await browser.newPage({viewport:{width:1280,height:780},colorScheme:"dark"});
  try {
    await page.goto(URL+"/#/inicio",{waitUntil:"domcontentloaded"});
    for(let i=0;i<8;i++){
      await delay(500);
      await snap(page,"abertura-atual",650);
    }
    await page.evaluate(() => {
      window.SIAB?.abertura?.encerrar?.();
      document.querySelectorAll("dialog[open]").forEach(d=>d.close());
    });
    await snap(page,"abertura-atual",1600);
  }finally{await page.close();}
}

(async()=>{
 const browser=await chromium.launch();
 try{
   await abertura(browser);
   await titracao(browser);
   await agitar(browser);
   await particulas(browser);
   await arcoIris(browser);
   await celular(browser);
   const target=path.join(framesDir,"manifest.json");
   fs.writeFileSync(target,JSON.stringify(specs,null,2));
   console.log("GIF FRAMES RECORDED "+specs.length);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
