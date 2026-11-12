"use strict";
/**
 * Capturas reais da interface publicada do SIAB para os READMEs.
 * Execute com o app servido em SIAB_TEST_URL e Playwright Chromium instalado.
 * Somente gera PNG: não simula imagens nem modifica dados científicos.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const base = process.env.SIAB_TEST_URL || "http://127.0.0.1:8765";
const destino = path.resolve(__dirname, "../.github/midia");
fs.mkdirSync(destino, { recursive: true });

async function carregar(page, rota) {
  await page.goto(base + "/#/" + rota, { waitUntil: "load" });
  await page.waitForFunction(
    () => Boolean(window.SIAB?.workspace?.ready) &&
      document.documentElement.dataset.appPronto === "true",
    null, { timeout: 45000 }
  );
  await page.evaluate(() => {
    window.SIAB.abertura?.encerrar?.();
    document.querySelector("#abertura")?.remove();
    document.querySelectorAll("dialog[open]").forEach(el => el.close());
  });
  assert.equal(await page.locator("#falha-abertura").count(), 0,
    "A tela apresentou erro de abertura");
  await page.waitForTimeout(200);
}

async function deixarBancadaEmFoco(page) {
  // A primeira adição abre o painel Preparo no celular e mostra o tour inicial.
  // Reproduzir a ação de fechar o aviso e recolher os painéis antes da foto.
  const dispensar = page.locator("#boas-vindas-fechar");
  if (await dispensar.isVisible()) await dispensar.click();
  await page.evaluate(() => {
    window.SIAB.workspace.close("left", false);
    window.SIAB.workspace.close("right", false);
    const aviso = document.getElementById("toast");
    if (aviso) aviso.hidden = true;
  });
  await page.waitForTimeout(350);
}

async function fotografar(page, nome, larguraMinima = 350) {
  const arquivo = path.join(destino, nome);
  await page.screenshot({ path: arquivo, type: "png", fullPage: false,
    animations: "disabled", caret: "hide" });
  const png = fs.readFileSync(arquivo);
  assert.equal(png.subarray(1, 4).toString("ascii"), "PNG");
  assert.ok(png.length > 15000, nome + " inesperadamente pequeno");
  assert.ok(png.readUInt32BE(16) >= larguraMinima, nome + ": largura inesperada");
  console.log("CAPTURA " + nome + ": " + png.readUInt32BE(16) + "x" + png.readUInt32BE(20) + ", " + png.length + " bytes");
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const desktop = await browser.newPage({
      viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
      reducedMotion: "reduce", colorScheme: "dark",
    });
    await carregar(desktop, "inicio");
    await desktop.locator('[data-tela="inicio"] #inicio-titulo').waitFor({ state:"visible" });
    await fotografar(desktop, "inicio-atual.png", 1400);

    await carregar(desktop, "laboratorio");
    if (!await desktop.evaluate(() => Boolean(window.SIAB.current?.())))
      await desktop.evaluate(() => window.SIAB.bancada.adicionarTubo());
    await desktop.locator('main [data-tela]:not([hidden])').waitFor({ state:"visible" });
    await deixarBancadaEmFoco(desktop);
    await fotografar(desktop, "bancada-atual.png", 1400);

    await carregar(desktop, "missoes");
    await desktop.locator('#missoes-lista').waitFor({ state:"visible" });
    await desktop.waitForFunction(() =>
      document.querySelector("#missoes-lista")?.children.length > 0);
    await fotografar(desktop, "missoes.png", 1400);

    await carregar(desktop, "manual");
    await desktop.locator(".manual-hero").waitFor({ state:"visible" });
    await fotografar(desktop, "manual.png", 1400);

    await carregar(desktop, "professor");
    await desktop.locator(".prof-steps").waitFor({ state:"visible" });
    await fotografar(desktop, "professor.png", 1400);

    await carregar(desktop, "roteiros");
    await desktop.locator("#roteiros-lista").waitFor({ state:"visible" });
    await fotografar(desktop, "roteiros-atual.png", 1400);

    await carregar(desktop, "laboratorio");
    await desktop.locator("#access-btn").click();
    await desktop.locator("#a11y-panel").waitFor({ state:"visible" });
    await desktop.locator("#a11y-toggle").scrollIntoViewIfNeeded();
    await fotografar(desktop, "acessibilidade.png", 1400);

    await carregar(desktop, "inicio");
    await desktop.locator("#install-btn").click();
    await desktop.locator("#install-choice-dialog").waitFor({ state:"visible" });
    await fotografar(desktop, "instalacao-desktop.png", 1400);

    const contextoMobile = await browser.newContext({
      viewport: { width: 390, height: 844 }, deviceScaleFactor: 1,
      reducedMotion: "reduce", colorScheme: "dark",
      hasTouch: true, isMobile: true,
      userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36",
    });
    const celular = await contextoMobile.newPage();
    await carregar(celular, "laboratorio");
    if (!await celular.evaluate(() => Boolean(window.SIAB.current?.())))
      await celular.evaluate(() => window.SIAB.bancada.adicionarTubo());
    await deixarBancadaEmFoco(celular);
    await fotografar(celular, "celular-atual.png", 390);

    await carregar(celular, "inicio");
    await celular.locator("#menu-btn").click();
    await celular.locator("#app-drawer").waitFor({ state:"visible" });
    await fotografar(celular, "menu-mobile-atual.png", 390);
    await celular.locator("#drawer-install").click();
    await celular.locator("#install-choice-dialog").waitFor({ state:"visible" });
    assert.equal(await celular.locator('[data-install-system="android"].recomendado').count(), 1,
      "O APK deveria ser sugerido no navegador Android");
    await fotografar(celular, "instalacao-mobile.png", 390);
    await contextoMobile.close();
    await desktop.close();
    console.log("Todas as 11 capturas foram extraídas da interface real do SIAB.");
  } finally {
    await browser.close();
  }
}

main().catch(erro => {
  console.error(erro);
  process.exitCode = 1;
});
