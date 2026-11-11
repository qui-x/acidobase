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


test("centralização dos controles em breakpoints desktop e módulos", async () => {
  const browser = await launcher.launch();
  try {
    const page = await setup(browser, { width: 1648, height: 900 });
    try {
      const viewports = [
        [901, 768], [1024, 768], [1199, 800], [1280, 800],
        [1366, 768], [1399, 800], [1400, 800], [1499, 800],
        [1500, 900], [1512, 900], [1648, 900], [1920, 1080], [2560, 1080],
      ];
      async function check(width, height, mode) {
        await page.setViewportSize({ width, height });
        const layout = await page.evaluate(() => {
          const rect = (el) => {
            const b = el.getBoundingClientRect();
            return { x: b.left, y: b.top, right: b.right, bottom: b.bottom, width: b.width, height: b.height };
          };
          const area = document.querySelector("#dose-area"), a = rect(area);
          const cs = getComputedStyle(area);
          const center = (a.x + Number.parseFloat(cs.paddingLeft) + a.right - Number.parseFloat(cs.paddingRight)) / 2;
          const ids = [
            "undo-btn", "drop-btn", "meia-gota-btn", "drop5-btn",
            "drop1ml-btn", "drop5ml-btn", "poe-btn", "agitar-btn",
            "workspace-quick-measure",
          ];
          const buttons = ids.flatMap(id => {
            const el = document.getElementById(id);
            if (!el || !el.getClientRects().length || getComputedStyle(el).visibility !== "visible") return [];
            return [{ id, ...rect(el) }];
          });
          const min = Math.min(...buttons.map(b => b.x));
          const max = Math.max(...buttons.map(b => b.right));
          const strip = rect(document.querySelector(".tube-strip"));
          return {
            center, actual: (min + max) / 2, area: a, buttons, strip,
            doseToggle: getComputedStyle(document.querySelector("#mobile-doses-toggle")).display,
          };
        });
        assert.equal(layout.doseToggle, "none", "Doses apareceu no desktop " + width);
        assert.ok(layout.buttons.length >= 5, "Poucos botões em " + width + " modo " + mode);
        assert.ok(Math.abs(layout.actual - layout.center) <= 18,
          "Controles deslocados: " + width + " modo " + mode + " " + JSON.stringify(layout));
        for (let i = 0; i < layout.buttons.length; i++) {
          const a = layout.buttons[i];
          assert.ok(a.x >= -1 && a.right <= width + 1, "Botão horizontalmente cortado em " + width + ": " + a.id);
          assert.ok(a.height >= 43 && a.height <= 53, "Altura incorreta em " + width + ": " + a.id + "=" + a.height);
          for (let j = i + 1; j < layout.buttons.length; j++) {
            const b = layout.buttons[j];
            const dx = Math.min(a.right, b.right) - Math.max(a.x, b.x);
            const dy = Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y);
            assert.ok(dx < 2 || dy < 2, "Botões sobrepostos em " + width + ": " + a.id + " e " + b.id);
          }
        }
        assert.ok(layout.area.bottom <= layout.strip.y + 2, "Ações invadiram faixa de tubos em " + width);
        const limit = width >= 1500 ? 125 : width >= 1100 ? 180 : 240;
        assert.ok(layout.area.height <= limit, "Barra muito alta em " + width + ": " + layout.area.height);
      }
      for (const [width, height] of viewports) await check(width, height, "explorar");
      for (const mod of ["medir", "calcular", "explorar"]) {
        await page.evaluate(id => window.SIAB.modulos.ativar(id), mod);
        for (const width of [1024, 1366, 1648]) await check(width, 900, mod);
      }
    } finally { await page.close(); }
  } finally { await browser.close(); }
});

test("controles permanecem acessíveis durante a mudança mobile-desktop e orientação", async () => {
  const browser = await launcher.launch();
  try {
    const page = await setup(browser, { width: 390, height: 844 });
    try {
      for (const [width, height] of [[360, 780], [390, 844], [768, 900], [900, 700], [844, 390], [901, 700]]) {
        await page.setViewportSize({ width, height });
        const state = await page.evaluate(() => ({
          isMobile: matchMedia("(max-width:900px)").matches,
          doses: getComputedStyle(document.querySelector("#mobile-doses-toggle")).display,
          buttons: ["undo-btn", "drop-btn"].map(id => {
            const r = document.getElementById(id).getBoundingClientRect();
            return { id, x: r.left, right: r.right, height: r.height };
          }),
        }));
        assert.equal(state.isMobile, width <= 900);
        assert.equal(state.doses === "none", width > 900, "Visibilidade de Doses incorreta: " + width);
        for (const b of state.buttons) {
          assert.ok(b.height >= 43 && b.right <= width + 2 && b.x >= -2,
            "Botão cortado em " + width + "x" + height + ": " + JSON.stringify(b));
        }
      }
    } finally { await page.close(); }
  } finally { await browser.close(); }
});
