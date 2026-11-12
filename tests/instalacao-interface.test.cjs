"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { chromium, firefox, webkit } = require("playwright");
const browserName = process.env.SIAB_BROWSER || "chromium";
const launcher = { chromium, firefox, webkit }[browserName];
if (!launcher) throw Error("Navegador invalido: " + browserName);
const origin = process.env.SIAB_TEST_URL || "http://127.0.0.1:8765";

async function abrir(page) {
  await page.goto(origin + "/#/laboratorio", { waitUntil: "load" });
  await page.waitForFunction(
    () => window.SIAB?.workspace?.ready &&
      document.documentElement.dataset.appPronto === "true",
    null, { timeout: 45000 },
  );
  await page.evaluate(() => {
    window.SIAB.abertura?.encerrar?.();
    document.querySelector("#abertura")?.remove();
    document.querySelectorAll("dialog[open]").forEach((dialog) => dialog.close());
  });
}

test("Navegador oferece instaladores sem exibir detalhes tecnicos no menu", async () => {
  const browser = await launcher.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36",
    });
    const page = await context.newPage();
    try {
      await abrir(page);
      assert.equal(await page.locator("#drawer-storage-status").count(), 0);
      assert.equal(await page.locator("#drawer-modo").count(), 0);
      assert.equal(await page.locator("#about-modo").count(), 0);
      assert.equal(await page.locator("#selo-app").count(), 0);
      await page.locator("#menu-btn").click();
      assert.equal(await page.locator("#drawer-install").isVisible(), true);
      await page.locator("#drawer-install").click();
      assert.equal(await page.locator("#install-choice-dialog").isVisible(), true);
      assert.equal(await page.locator("#install-choice-pwa").isVisible(), true);
      for (const tipo of ["android", "windows", "windows-extra", "linux"]) {
        assert.ok(await page.locator('[data-install-system="' + tipo + '"]').count());
      }
      assert.equal(await page.locator('[data-install-system="android"].recomendado').count(), 1);
      assert.match(await page.locator('[data-install-system="android"]').getAttribute("href"), /drive\.google\.com\/file\/d\//);
      await page.locator("#install-choice-dialog [data-close]").click();
      assert.equal(await page.locator("#install-choice-dialog").isVisible(), false);
    } finally { await context.close(); }
  } finally { await browser.close(); }
});

test("A opcao PWA sem prompt encaminha as instrucoes de instalacao", async () => {
  const browser = await launcher.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    try {
      await abrir(page);
      await page.locator("#drawer-install").evaluate(el => el.click());
      await page.locator("#install-choice-pwa").click();
      assert.equal(await page.locator("#install-choice-dialog").isVisible(), false);
      await page.waitForFunction(() => location.hash === "#/manual/app");
    } finally { await page.close(); }
  } finally { await browser.close(); }
});

test("No aplicativo nativo, instalar app fica oculto, sem informativos", async () => {
  const browser = await launcher.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(() => {
      window.Capacitor = {
        isNativePlatform: () => true,
        getPlatform: () => "android",
      };
    });
    const page = await context.newPage();
    try {
      await abrir(page);
      assert.equal(await page.locator("#drawer-install").isVisible(), false);
      assert.equal(await page.locator("#install-btn").isVisible(), false);
      assert.equal(await page.locator("#drawer-storage-status").count(), 0);
      assert.equal(await page.locator("#drawer-modo").count(), 0);
      assert.equal(await page.locator("#selo-app").count(), 0);
    } finally { await context.close(); }
  } finally { await browser.close(); }
});
