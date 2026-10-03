const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path");
const pw = require(process.env.SIAB_PLAYWRIGHT_MODULE || "playwright");
const out = path.join(__dirname, "results"),
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
      const p = await b.newPage({
        viewport: { width: 1366, height: 900 },
        reducedMotion: "reduce",
      });
      await p.addInitScript(() => {
        localStorage.setItem("siab_abertura", "off");
        localStorage.setItem("siab_inicializacao", '"inicio"');
      });
      const entry = { engine, cases: [] };
      results.engines.push(entry);
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
      await p.goto(url + "/#/laboratorio");
      await p.waitForFunction(
        () => document.documentElement.dataset.appPronto === "true",
      );
      await test("Relatório Calcular usa quantidades dos componentes da mistura", async () => {
        const x = await p.evaluate(() => {
          SIAB.benches.lab = SIAB.criarBancada();
          SIAB.usarBancada("lab");
          SIAB.state.level = "calcular";
          SIAB.newTube({
            solution: "hcl",
            concentration: 0.1,
            initialVolume: 1,
          });
          SIAB.newTube({
            solution: "naoh",
            concentration: 0.1,
            initialVolume: 1,
          });
          SIAB.state.activeId = SIAB.state.tubes[0].id;
          const ids = SIAB.state.tubes.map((t) => t.id);
          SIAB.selecaoTubos.misturar(ids, ids[0]);
          SIAB.relatorios.capturar();
          return SIAB.relatorios.atual.recipientes[0].calculos.preparos.map(
            (x) => x.mmol,
          );
        });
        assert.deepEqual(x, [0.1, 0.1]);
      });
      await p.evaluate(() =>
        SIAB.montarExperimento(
          SIAB.experimentos.find((r) => r.id === "titulacao-forte"),
          {
            nome: "Estudante de teste",
            turma: "Turma de verificação",
            professor: "Professor de teste",
            data: "2026-09-30",
          },
        ),
      );
      await p.waitForFunction(() => SIAB.rota.nome === "laboratorio");
      await p.evaluate(() =>
        SIAB.instrumentos.medir(SIAB.current(), "phmetro"),
      );
      await p.waitForTimeout(650);
      await p.goto(url + "/#/relatorio");
      await p.waitForSelector("[data-report-field=observacoes]");
      await p.fill(
        "[data-report-field=observacoes]",
        "Leitura inicial registrada com pHmetro estabilizado.",
      );
      await p.fill(
        "[data-report-field=conclusao]",
        "A interpretação considera a técnica utilizada e as condições da montagem.",
      );
      await p.evaluate(() => {
        window.print = () => {};
        SIAB.relatorios.imprimir(false);
      });
      await test("Impressão preenchida: texto e dados preservados", async () => {
        const text = await p.locator("#folha-impressao").textContent();
        assert.match(text, /pH medido = 2,00/);
        assert.match(text, /A interpretação considera/);
        assert.equal(await p.locator("#folha-impressao textarea").count(), 0);
        await p.emulateMedia({ media: "print" });
        assert.equal(
          await p.evaluate(
            () => getComputedStyle(document.documentElement).colorScheme,
          ),
          "light",
        );
        assert.equal(
          await p.evaluate(
            () => getComputedStyle(document.body).backgroundColor,
          ),
          "rgb(255, 255, 255)",
        );
        if (engine === "chromium")
          await p.pdf({
            path: path.join(out, "relatorio-preenchido.pdf"),
            format: "A4",
            printBackground: true,
          });
        await p.emulateMedia({ media: "screen" });
      });
      await test("Impressão em branco: campos livres e mesma proposta", async () => {
        await p.evaluate(() => SIAB.relatorios.imprimir(true));
        const text = await p.locator("#folha-impressao").textContent();
        assert.match(text, /Uma gota faz a diferença/);
        assert.ok(!text.includes("A interpretação considera"));
        assert.equal(
          await p.locator("#folha-impressao .writing-space").count(),
          5,
        );
        await p.emulateMedia({ media: "print" });
        assert.equal(await p.locator("#folha-impressao").isVisible(), true);
        assert.equal(await p.locator("#relatorio-conteudo").isVisible(), false);
        assert.equal(
          await p.evaluate(() => getComputedStyle(document.body).backgroundColor),
          "rgb(255, 255, 255)",
        );
        if (engine === "chromium")
          await p.pdf({
            path: path.join(out, "relatorio-em-branco.pdf"),
            format: "A4",
            printBackground: true,
          });
        await p.emulateMedia({ media: "screen" });
      });
      await b.close();
    }
  } finally {
    server.close();
    fs.writeFileSync(
      path.join(out, "impressao.json"),
      JSON.stringify(results, null, 2),
    );
  }
  if (results.engines.some((e) => e.cases.some((c) => c.status === "Falha")))
    process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
