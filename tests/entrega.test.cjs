const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  { pathToFileURL } = require("node:url");
const pw = require(process.env.SIAB_PLAYWRIGHT_MODULE || "playwright"),
  out = path.join(__dirname, "results"),
  results = { date: new Date().toISOString(), engines: [] };
(async () => {
  const { server, url } = await require("./server.cjs").start();
  try {
    for (const engine of (
      process.env.SIAB_TEST_ENGINES || "chromium,firefox,webkit"
    ).split(",")) {
      const b = await pw[engine].launch({
        headless: true,
        ...(engine === "chromium"
          ? { args: ["--no-sandbox"] }
          : { env: { ...process.env, MOZ_DISABLE_CONTENT_SANDBOX: "1" } }),
      });
      const ctx = await b.newContext({
        viewport: { width: 1366, height: 900 },
        reducedMotion: "reduce",
      });
      await ctx.addInitScript(() => {
        try {
          localStorage.setItem("siab_abertura", "off");
        } catch (_) {}
      });
      const p = await ctx.newPage(),
        entry = { engine, version: b.version(), cases: [] };
      results.engines.push(entry);
      p.setDefaultTimeout(6000);
      async function test(name, fn) {
        try {
          await fn();
          entry.cases.push({ name, status: "OK" });
          console.log(engine, "OK", name);
        } catch (e) {
          entry.cases.push({ name, status: "Falha", error: e.message });
          console.log(engine, "FAIL", name, e.message);
        }
      }
      await test("Menu inicial: cinco caminhos, ícone oficial e fundo desfocado", async () => {
        await p.goto(url);
        await p.locator("#startup-dialog").waitFor({ state: "visible" });
        assert.equal(await p.locator(".startup-brand img").isVisible(), true);
        assert.ok(
          await p
            .locator(".startup-brand img")
            .evaluate((el) => el.complete && el.naturalWidth > 0),
        );
        assert.match(
          await p.evaluate(
            () =>
              getComputedStyle(
                document.querySelector("#startup-dialog"),
                "::backdrop",
              ).backdropFilter,
          ),
          /blur/,
        );
        if (engine === "chromium")
          await p.screenshot({
            path: path.join(out, "inicializacao-desktop.png"),
          });
        await p.click("[data-startup=inicio]");
        assert.equal(await p.locator(".inicio-caminhos > a").count(), 5);
        assert.match(await p.locator("#inicio-temas-meta").textContent(), /14/);
        if (engine === "chromium")
          await p.screenshot({ path: path.join(out, "inicio.png") });
      });
      await test("Entrada em 320–414 px: opções, rolagem, foco e fechamento", async () => {
        for (const width of [320, 360, 390, 414]) {
          await p.setViewportSize({ width, height: width === 320 ? 568 : 844 });
          await p.locator(".inicio-nota [data-startup-settings]").click();
          assert.ok(
            await p.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          );
          assert.equal(await p.locator(".startup-brand img").isVisible(), true);
          if (engine === "chromium" && [320, 390].includes(width))
            await p.screenshot({
              path: path.join(
                out,
                width === 320
                  ? "inicializacao-320.png"
                  : "inicializacao-mobile.png",
              ),
            });
          const close = p.getByRole("button", { name: "Agora não" });
          await close.focus();
          const visible = await close.boundingBox();
          assert.ok(
            visible.y >= 0 &&
              visible.y + visible.height <= p.viewportSize().height + 1,
          );
          await p.keyboard.press("Enter");
          assert.equal(await p.locator("#startup-dialog").isVisible(), false);
        }
        if (engine === "chromium")
          await p.screenshot({
            path: path.join(out, "inicio-mobile.png"),
            fullPage: true,
          });
      });
      await test("Standalone final: arquivo local, sem dependências externas", async () => {
        await p.setViewportSize({ width: 1366, height: 900 });
        await p.goto(
          pathToFileURL(path.join(__dirname, "..", "SIAB-standalone.html"))
            .href + "#/professor",
        );
        await p.waitForFunction(
          () => document.documentElement.dataset.appPronto === "true",
        );
        assert.equal(await p.evaluate(() => SIAB.version), "1.0.0-rc.5");
        assert.equal(
          await p
            .locator("script[src],link[rel=stylesheet],link[rel=manifest]")
            .count(),
          0,
        );
        assert.deepEqual(
          await p.evaluate(() => [
            SIAB.temas.length,
            SIAB.missoes.length,
            SIAB.experimentos.length,
            Object.keys(SIAB.solutions).length,
          ]),
          [14, 19, 35, 140],
        );
      });
      await test("Standalone: contexto restrito, leitura, guarda e refresh", async () => {
        const token = await p.evaluate(() =>
          SIAB.atividades.codificar({
            schema: 2,
            tipo: "roteiro",
            item: "titulacao-forte",
            modulo: "medir",
            temperatura: 25,
            instrumentos: ["fita"],
            navegacao: "restrita",
            relatorio: "digital",
            permissions: {
              measurements: { phStrip: true },
              representations: {},
              analysis: {},
            },
          }),
        );
        await p.evaluate((token) => SIAB.irPara("#/atividade/" + token), token);
        await p.locator("#atividade-iniciar button").click();
        await p.waitForFunction(() => SIAB.rota.nome === "laboratorio");
        await p.click("#workspace-ver");
        await p.click("[data-instrumento=fita]");
        await p.evaluate(() => {
          SIAB.alterar("tentativa", () => (SIAB.current().solution = "naoh"));
          SIAB.irPara("#/manual");
        });
        await p.waitForFunction(() => SIAB.rota.nome === "atividade");
        assert.equal(await p.evaluate(() => SIAB.current().solution), "hcl");
        await p.locator("[data-activity-resume]:visible").click();
        await p.reload();
        await p.waitForFunction(() => SIAB.rota.nome === "laboratorio");
        assert.equal(
          await p.evaluate(() => SIAB.instrumentos.raw(SIAB.current()).length),
          1,
        );
        assert.equal(await p.locator("[data-instrumento=phmetro]").count(), 0);
      });
      await ctx.close();
      await b.close();
    }
  } finally {
    server.close();
    fs.writeFileSync(
      path.join(out, "entrega.json"),
      JSON.stringify(results, null, 2),
    );
  }
  if (results.engines.some((e) => e.cases.some((c) => c.status !== "OK")))
    process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
