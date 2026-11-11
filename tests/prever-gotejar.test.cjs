"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { chromium, firefox, webkit } = require("playwright");
const browserName = process.env.SIAB_BROWSER || "chromium";
const launcher = { chromium, firefox, webkit }[browserName];
if (!launcher) throw Error("Navegador não suportado: " + browserName);
const base = process.env.SIAB_TEST_URL || "http://127.0.0.1:8765";

async function setup(browser, viewport={width:1440,height:900}) {
  const page = await browser.newPage({viewport, reducedMotion:"reduce"});
  await page.goto(base + "/#/laboratorio", {waitUntil:"load"});
  await page.waitForFunction(() => window.SIAB?.workspace?.ready);
  await page.evaluate(() => {
    window.SIAB.abertura?.encerrar?.();
    document.querySelector("#abertura")?.remove();
    document.querySelectorAll("dialog[open]").forEach(el => el.close());
    if (!window.SIAB.current()) window.SIAB.bancada.adicionarTubo();
    if (window.SIAB.workspace.state.left !== "collapsed")
      window.SIAB.workspace.close("left", false);
  });
  await page.waitForFunction(() => !!window.SIAB.current());
  page.setDefaultTimeout(10000);
  if (viewport.width <= 900) await page.locator("#mobile-doses-toggle").click();
  return page;
}

async function prever(page, gotas=2) {
  await page.locator("#poe-btn").click();
  assert.equal(await page.locator("#poe-dialog").evaluate(el=>el.open), true);
  // O seletor semântico é mantido oculto pela interface personalizada do SIAB.
  // A escolha inicial visível já corresponde a "Aumenta".
  assert.equal(await page.locator('#poe-form select[name="direcao"]').inputValue(), "Aumenta");
  await page.locator('#poe-form textarea[name="aberta"]').fill("O indicador pode mudar de cor ao adicionar a base.");
  await page.locator('#poe-form input[name="gotas"]').fill(String(gotas));
  await page.locator('#poe-form button[type="submit"]').click();
  assert.equal(await page.locator("#poe-resultado").isVisible(), true);
  assert.match(await page.locator("#poe-comparacao").innerText(), /Previsão:.*O indicador pode mudar de cor/);
  assert.equal(await page.locator("#poe-observar").isVisible(), true);
}

test("Prever → gotejar → observar → medir → retomar → concluir sem gotejar novamente", async () => {
  const browser=await launcher.launch();
  try {
    const page=await setup(browser);
    try {
      const dropsBefore=await page.evaluate(()=>window.SIAB.chem.solve(window.SIAB.current()).drops);
      await prever(page, 2);
      const dropsAfter=await page.evaluate(()=>window.SIAB.chem.solve(window.SIAB.current()).drops);
      assert.equal(dropsAfter-dropsBefore, 2, "Deveria adicionar exatamente duas gotas");
      // A explicação torna-se obrigatória em atividades orientadas, mas isso
      // nunca pode bloquear o retorno à observação científica.
      await page.locator("#poe-explicacao").evaluate(el => { el.required=true; });
      await page.locator("#poe-observar").click();
      assert.equal(await page.locator("#poe-dialog").evaluate(el=>el.open), false,
        "Observar na bancada não fechou o diálogo");
      await page.locator("#workspace-ver").click();
      await page.evaluate(() => window.SIAB.selecionarVer("ph"));
      const measurement=await page.evaluate(() => {
        const S=window.SIAB;
        return Boolean(S.instrumentos.medir(S.current(), "fita", "pontual"));
      });
      assert.equal(measurement, true, "Fita de pH não pôde ser utilizada");
      await page.locator("#dock-close-right").click();

      await page.locator("#poe-btn").click();
      assert.equal(await page.locator("#poe-form").isVisible(), false, "Reabertura reiniciou previsão pendente");
      assert.equal(await page.locator("#poe-resultado").isVisible(), true);
      assert.match(await page.locator("#poe-comparacao").innerText(), /Leitura após medir/);
      const dropsOnResume=await page.evaluate(()=>window.SIAB.chem.solve(window.SIAB.current()).drops);
      assert.equal(dropsOnResume,dropsAfter,"Retomar repetiu o gotejamento");
      await page.locator("#poe-explicacao").fill("Medi novamente e comparei a variação do pH com minha hipótese.");
      await page.locator("#poe-registrar").check();
      await page.locator('#poe-resultado button[type="submit"]').click();
      assert.equal(await page.locator("#poe-dialog").evaluate(el=>el.open),false,
        "Concluir não fechou o diálogo");
      await page.locator("#poe-btn").click();
      assert.equal(await page.locator("#poe-form").isVisible(),true,
        "A previsão concluída permaneceu pendente");
    } finally {await page.close();}
  } finally {await browser.close();}
});

test("X, Escape e retomada conservam explicação, e nova previsão é explícita", async () => {
  const browser=await launcher.launch();
  try {
    const page=await setup(browser);
    try {
      await prever(page,1);
      const num=await page.evaluate(()=>window.SIAB.chem.solve(window.SIAB.current()).drops);
      await page.locator("#poe-explicacao").fill("Observarei os resultados na bancada.");
      await page.locator('#poe-dialog [data-close="poe-dialog"].icon-btn').click();
      assert.equal(await page.locator("#poe-dialog").evaluate(el=>el.open), false);
      await page.locator("#poe-btn").click();
      assert.equal(await page.locator("#poe-explicacao").inputValue(),"Observarei os resultados na bancada.");
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#poe-dialog").evaluate(el=>el.open), false);
      await page.locator("#poe-btn").click();
      assert.equal(await page.locator("#poe-explicacao").inputValue(),"Observarei os resultados na bancada.");
      assert.equal(await page.evaluate(()=>window.SIAB.chem.solve(window.SIAB.current()).drops),num);
      await page.locator("#poe-nova").click();
      assert.equal(await page.locator("#poe-form").isVisible(), true);
      assert.equal(await page.locator("#poe-resultado").isVisible(), false);
      assert.equal(await page.evaluate(()=>window.SIAB.chem.solve(window.SIAB.current()).drops),num,
        "Descartar previsão não deveria desfazer gotas já aplicadas");
    } finally {await page.close();}
  } finally {await browser.close();}
});

test("previsões de recipientes diferentes não são confundidas", async () => {
  const browser=await launcher.launch();
  try {
    const page=await setup(browser);
    try {
      const id1=await page.evaluate(()=>window.SIAB.current().id);
      await prever(page,1);
      await page.locator("#poe-observar").click();
      const id2=await page.evaluate(()=>{
        const S=window.SIAB;
        S.bancada.adicionarTubo();
        return S.current().id;
      });
      assert.notEqual(id2,id1);
      await page.evaluate(()=>window.SIAB.workspace.close("left",false));
      await page.locator("#poe-btn").click();
      assert.equal(await page.locator("#poe-form").isVisible(),true,"Outro tubo herdou a previsão anterior");
      await page.locator('#poe-dialog [data-close="poe-dialog"].icon-btn').click();
      await page.evaluate(id=>{const S=window.SIAB;S.state.activeId=id;S.loja.avisar();},id1);
      await page.locator("#poe-btn").click();
      assert.equal(await page.locator("#poe-resultado").isVisible(),true,"Perdeu a previsão do primeiro tubo");
    } finally {await page.close();}
  } finally {await browser.close();}
});

test("mobile permite observar e voltar sem a explicação obrigatória", async () => {
  const browser=await launcher.launch();
  try {
    const page=await setup(browser,{width:390,height:844});
    try {
      await prever(page,1);
      await page.locator("#poe-explicacao").evaluate(el => {el.required=true;});
      await page.locator("#poe-observar").click();
      assert.equal(await page.locator("#poe-dialog").evaluate(el=>el.open),false);
      const point=await page.locator("#poe-btn").boundingBox();
      assert.ok(point && point.x>=-1 && point.x+point.width<=391);
      await page.locator("#poe-btn").click();
      assert.equal(await page.locator("#poe-resultado").isVisible(),true);
    } finally {await page.close();}
  } finally {await browser.close();}
});
