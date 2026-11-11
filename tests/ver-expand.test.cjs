"use strict";
// Regressão real do painel VER em um navegador (Chromium, Firefox ou WebKit).
const test = require("node:test");
const assert = require("node:assert/strict");
const { chromium, firefox, webkit } = require("playwright");

const browsers = { chromium, firefox, webkit };
const name = process.env.SIAB_BROWSER || "chromium";
const launcher = browsers[name];
if (!launcher) throw Error("Navegador não suportado: " + name);
const origin = process.env.SIAB_TEST_URL || "http://127.0.0.1:8765";

async function setup(browser, viewport = { width: 1440, height: 900 }) {
  const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
  await page.goto(origin + "/#/laboratorio", { waitUntil: "load" });
  await page.waitForFunction(
    () => Boolean(window.SIAB?.workspace?.ready),
    null,
    { timeout: 20000 },
  );
  await page.evaluate(() => {
    window.SIAB.abertura?.encerrar?.();
    document.querySelector("#abertura")?.remove();
    document.querySelectorAll("dialog[open]").forEach((el) => el.close());
    if (!window.SIAB.current()) window.SIAB.bancada.adicionarTubo();
  });
  await page.waitForFunction(() => Boolean(window.SIAB.current()), null, { timeout: 10000 });
  return page;
}

async function presentation(page) {
  return page.locator("#ver-panel").getAttribute("data-presentation");
}
async function select(page, id) {
  // Usa a seleção real do programa para provocar a troca de família e conteúdo.
  const allowed = await page.evaluate((view) => window.SIAB.selecionarVer(view), id);
  assert.equal(allowed, true, "Visualização indisponível: " + id);
  assert.equal(await page.evaluate(() => window.SIAB.state.verTab), id);
}

test("expandir persiste entre ferramentas, famílias e módulos; restaurar usa tamanho corrente", async () => {
  const browser = await launcher.launch({ headless: true });
  try {
    const page = await setup(browser);
    try {
      await page.locator("#workspace-ver").click();
      await select(page, "particulas");
      await page.locator("#dock-expand").click();
      assert.equal(await presentation(page), "fullscreen", "Partículas não expandiu");
      assert.equal(await page.locator("#dock-expand").getAttribute("aria-expanded"), "true");

      for (const view of ["equacao", "especies", "proton", "ph", "temperatura", "condutividade", "grafico", "derivada", "distribuicao", "historico", "tabela", "particulas"]) {
        await select(page, view);
        assert.equal(await presentation(page), "fullscreen", "Expansão perdida ao abrir: " + view);
        const panel = await page.locator("#ver-panel").boundingBox();
        assert.ok(panel && panel.width > 1150 && panel.height > 530,
          "Dimensão do painel expandido foi reduzida em: " + view + " (" + JSON.stringify(panel) + ")");
      }

      // Troca de conteúdo pelas próprias abas da interface (não somente API).
      await page.locator('[data-ver-family="analisar"]').click();
      assert.equal(await presentation(page), "fullscreen", "Expansão perdida ao clicar na família");
      await page.locator('[data-ver="grafico"]').click();
      assert.equal(await presentation(page), "fullscreen", "Expansão perdida ao clicar na ferramenta");

      for (const module of ["medir", "calcular", "explorar"]) {
        await page.evaluate((id) => window.SIAB.modulos.ativar(id), module);
        assert.equal(await page.evaluate(() => window.SIAB.state.level), module);
        assert.equal(await presentation(page), "fullscreen", "Expansão perdida no módulo: " + module);
      }

      await page.locator("#dock-expand").click(); // Restaurar
      assert.equal(await presentation(page), "wide", "Gráfico deveria restaurar para wide");
      const restored = await page.locator("#ver-panel").boundingBox();
      assert.ok(restored && restored.width <= 770, "Restaurar não reduziu o painel: " + JSON.stringify(restored));
      assert.equal(await page.locator("#dock-expand").getAttribute("aria-expanded"), "false");

      await select(page, "particulas");
      assert.equal(await presentation(page), "standard", "Modo automático não acompanhou Partículas");
      await select(page, "ph");
      assert.equal(await presentation(page), "compact", "Modo automático não acompanhou pH");

      await page.locator("#dock-expand").click();
      assert.equal(await presentation(page), "fullscreen");
      await page.locator("#dock-close-right").click();
      assert.equal(await page.evaluate(() => window.SIAB.workspace.state.right), "collapsed");
      await page.locator("#workspace-ver").click();
      assert.equal(await presentation(page), "fullscreen", "Fechar/reabrir perdeu a expansão");
      assert.equal(await page.locator("#dock-close-right").getAttribute("aria-label"), "Fechar painel Ver");
      assert.equal(await page.locator("#dock-close-right svg[data-icon='close']").count(), 1);
      assert.equal((await page.locator("#dock-close-right").innerText()).trim(), "");
      const closeSize = await page.locator("#dock-close-right").boundingBox();
      assert.ok(closeSize.width >= 43 && closeSize.height >= 43, "Alvo de fechamento menor que 44px");
      await page.keyboard.press("Escape");
      assert.equal(await page.evaluate(() => window.SIAB.workspace.state.right), "collapsed", "Escape não fechou painel");
    } finally {
      await page.close();
    }
  } finally {
    await browser.close();
  }
});

test("responsividade preserva conteúdo ao alternar desktop/mobile, sem alterar rolagem de tabelas", async () => {
  const browser = await launcher.launch({ headless: true });
  try {
    const page = await setup(browser);
    try {
      await page.locator("#workspace-ver").click();
      await select(page, "particulas");
      await page.locator("#dock-expand").click();
      assert.equal(await presentation(page), "fullscreen");
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForFunction(() => matchMedia("(max-width: 900px)").matches);
      for (const view of ["particulas", "equacao", "tabela", "grafico"]) {
        await select(page, view);
        const rect = await page.locator("#ver-panel").boundingBox();
        assert.ok(rect && rect.width > 200, "Painel mobile invisível: " + view);
        assert.ok(rect.x >= -1 && rect.x + rect.width <= 391, "Painel vazou lateralmente: " + view);
      }
      // Registra uma medição real: sem dados, a interface corretamente mostra
      // apenas uma mensagem, e não deve criar uma tabela vazia.
      const registered = await page.evaluate(() => {
        const S = window.SIAB;
        return Boolean(S.instrumentos.medir(S.current(), "fita", "pontual"));
      });
      assert.equal(registered, true, "Não foi possível medir com a fita");
      await select(page, "tabela");
      assert.equal(await page.locator("#ver-conteudo .table-scroll").count() > 0, true);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.waitForFunction(() => !matchMedia("(max-width: 900px)").matches);
      assert.equal(await presentation(page), "fullscreen", "Expansão perdida após voltar ao desktop");
    } finally {
      await page.close();
    }
  } finally {
    await browser.close();
  }
});
