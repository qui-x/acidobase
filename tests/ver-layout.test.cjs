"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { chromium, firefox, webkit } = require("playwright");
const browserName = process.env.SIAB_BROWSER || "chromium";
const launcher = { chromium, firefox, webkit }[browserName];
if (!launcher) throw Error("Navegador desconhecido: " + browserName);
const origin = process.env.SIAB_TEST_URL || "http://127.0.0.1:8765";

async function setup(browser, viewport) {
  const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
  await page.goto(origin + "/#/laboratorio", { waitUntil: "load" });
  await page.waitForFunction(() => window.SIAB?.workspace?.ready === true);
  await page.evaluate(() => {
    window.SIAB.abertura?.encerrar?.();
    document.querySelector("#abertura")?.remove();
    document.querySelectorAll("dialog[open]").forEach((el) => el.close());
    if (!window.SIAB.current()) window.SIAB.bancada.adicionarTubo();
  });
  await page.waitForFunction(() => !!window.SIAB.current());
  // Ao criar o primeiro tubo no celular, o SIAB abre Montagem por design.
  // Feche esse bottom sheet antes de interagir com Doses na bancada.
  await page.evaluate(() => {
    if (window.SIAB.workspace.state.left !== "collapsed")
      window.SIAB.workspace.close("left", false);
  });
  return page;
}
async function select(page, id) {
  assert.equal(await page.evaluate((value) => window.SIAB.selecionarVer(value), id), true);
}
async function metrics(page, selector) {
  return page.locator(selector).evaluate((el) => {
    const box = el.getBoundingClientRect(), style = getComputedStyle(el);
    return {
      width: box.width, height: box.height,
      x: box.x, y: box.y, display: style.display,
      clientHeight: el.clientHeight, scrollHeight: el.scrollHeight,
      clientWidth: el.clientWidth, scrollWidth: el.scrollWidth,
      overflowY: style.overflowY,
    };
  });
}

for (const viewport of [
  { width: 1648, height: 900 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1024, height: 768 },
]) {
  test("desktop " + viewport.width + "x" + viewport.height + ": ações proporcionais e sem controle Doses mobile", async () => {
    const browser = await launcher.launch();
    try {
      const page = await setup(browser, viewport);
      try {
        const hidden = await metrics(page, "#mobile-doses-toggle");
        assert.equal(hidden.display, "none", "Doses exclusivo do mobile apareceu no desktop");
        const selectors = ["#undo-btn", "#drop-btn", "#drop5-btn", "#drop1ml-btn", "#poe-btn", "#workspace-quick-measure"];
        for (const id of selectors) {
          const el = page.locator(id);
          if (!(await el.isVisible())) continue;
          const box = await metrics(page, id);
          assert.ok(box.height >= 43 && box.height <= 52,
            "Botão alto demais/pequeno: " + id + " => " + JSON.stringify(box));
        }
        const shortcuts = await metrics(page, "#dose-shortcuts");
        if (viewport.width >= 1400)
          assert.ok(shortcuts.height <= 52, "Atalhos esticados em tela ampla: " + JSON.stringify(shortcuts));
        for (const id of ["#drop-btn", "#drop5-btn", "#drop1ml-btn", "#poe-btn"]) {
          if (!(await page.locator(id).isVisible())) continue;
          assert.equal(await page.locator(id + " .siab-icon").count(), 1, "Faltou ícone: " + id);
        }
        await page.evaluate(() => window.SIAB.render(true));
        assert.equal(await page.locator("#drop-btn .siab-icon").count(), 1,
          "Atualização da bancada removeu ícone do gotejamento");
        assert.equal(await page.locator("#drop-btn span").count(), 1);
      } finally { await page.close(); }
    } finally { await browser.close(); }
  });
}

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1024, height: 768 },
]) {
  test("fullscreen " + viewport.width + "x" + viewport.height + ": representações adaptam sem cortar o desenho", async () => {
    const browser = await launcher.launch();
    try {
      const page = await setup(browser, viewport);
      try {
        await page.locator("#workspace-ver").click();
        // Dois registros em volumes distintos obrigam a desenhar SVGs reais,
        // em vez de apenas conferir o aviso "faltam medições".
        const readings = await page.evaluate(() => {
          const S = window.SIAB, t = S.current();
          S.instrumentos.medir(t, "fita", "pontual");
          S.bancada.gotejar(1);
          S.instrumentos.medir(t, "fita", "pontual");
          return S.instrumentos.raw(t).filter((m) => m.tecnica === "fita").length;
        });
        assert.ok(readings >= 2, "O teste precisa de duas medições de pH reais");
        await select(page, "particulas");
        await page.locator("#dock-expand").click();
        for (const view of ["particulas", "equacao", "ph", "grafico", "derivada", "distribuicao", "especies", "tabela"]) {
          await select(page, view);
          const panel = await metrics(page, "#ver-panel");
          assert.ok(panel.x >= 0 && panel.x + panel.width <= viewport.width + 1,
            "Painel saiu da viewport: " + view);
          assert.equal(await page.locator("#ver-panel").getAttribute("data-presentation"), "fullscreen");
          assert.equal(await page.locator("#ver-panel").getAttribute("data-tool"), view);
          const content = await metrics(page, "#ver-conteudo");
          assert.ok(content.width > 350 && content.height > 200, "Conteúdo muito pequeno: " + view);
          assert.ok(content.scrollWidth <= content.clientWidth + 3,
            "Conteúdo cortado na horizontal: " + view + " " + JSON.stringify(content));
          if (view === "particulas") {
            const drawing = await metrics(page, ".lupa-svg");
            const info = await metrics(page, ".lupa-info");
            assert.ok(drawing.width >= 150 && drawing.height >= 120,
              "Lupa pequena demais: " + JSON.stringify(drawing));
            assert.ok(info.width >= 200 && info.height >= 180,
              "Legenda inacessível: " + JSON.stringify(info));
            assert.ok(content.scrollHeight <= content.clientHeight + 5,
              "Lupa criou rolagem na área principal expandida");
          }
          if (view === "grafico" || view === "derivada") {
            assert.equal(await page.locator("#ver-conteudo .grafico-medido").count(), 1,
              "Gráfico não foi desenhado: " + view);
            const svg = await metrics(page, ".grafico-medido");
            assert.ok(svg.width > 220 && svg.height > 120 && svg.height <= content.height + 4,
              "Gráfico não coube na altura disponível: " + view + " " + JSON.stringify(svg));
          }
          if (view === "equacao")
            assert.ok(content.scrollHeight <= content.clientHeight + 4 ||
              content.overflowY === "auto",
              "Equações excedem sem oferecer rolagem");
        }
        await page.locator("#dock-expand").click();
        assert.notEqual(await page.locator("#ver-panel").getAttribute("data-presentation"), "fullscreen");
      } finally { await page.close(); }
    } finally { await browser.close(); }
  });
}

test("mobile: controles de toque e Doses continuam funcionando", async () => {
  const browser = await launcher.launch();
  try {
    const page = await setup(browser, { width: 390, height: 844 });
    try {
      assert.equal(await page.locator("#mobile-doses-toggle").isVisible(), true);
      assert.equal(await page.locator("#dose-shortcuts").isVisible(), false);
      await page.locator("#mobile-doses-toggle").click();
      assert.equal(await page.locator("#mobile-doses-toggle").getAttribute("aria-expanded"), "true");
      assert.equal(await page.locator("#dose-shortcuts").isVisible(), true);
      const btn = await metrics(page, "#drop-btn");
      assert.ok(btn.height >= 43, "Gotejamento mobile perdeu área de toque");
      await page.locator("#workspace-ver").click();
      await select(page, "particulas");
      assert.equal(await page.locator(".lupa-info").count(), 1);
      const panel = await metrics(page, "#ver-panel");
      assert.ok(panel.width <= 390 && panel.x >= -1, "Painel mobile ultrapassou viewport");
    } finally { await page.close(); }
  } finally { await browser.close(); }
});
