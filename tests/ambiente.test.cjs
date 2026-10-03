const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  os = require("node:os"),
  path = require("node:path"),
  cp = require("node:child_process");
const pw = require(process.env.SIAB_PLAYWRIGHT_MODULE || "playwright");
const results = { date: new Date().toISOString(), engines: [] },
  out = path.join(__dirname, "results");
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "siab-tls-"));
  let http, tls;
  try {
    cp.execFileSync(
      "openssl",
      [
        "req",
        "-x509",
        "-newkey",
        "rsa:2048",
        "-nodes",
        "-sha256",
        "-days",
        "1",
        "-subj",
        "/CN=localhost",
        "-addext",
        "subjectAltName=IP:127.0.0.1,DNS:localhost",
        "-keyout",
        path.join(dir, "key.pem"),
        "-out",
        path.join(dir, "cert.pem"),
      ],
      { stdio: "ignore" },
    );
    http = await require("./server.cjs").start();
    tls = await require("./server.cjs").start({
      key: fs.readFileSync(path.join(dir, "key.pem")),
      cert: fs.readFileSync(path.join(dir, "cert.pem")),
    });
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
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        reducedMotion: "reduce",
        ignoreHTTPSErrors: true,
      });
      await ctx.addInitScript(() => {
        localStorage.setItem("siab_abertura", "off");
        localStorage.setItem("siab_inicializacao", '"inicio"');
      });
      const p = await ctx.newPage(),
        entry = { engine, cases: [] };
      results.engines.push(entry);
      p.setDefaultTimeout(8000);
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
      await test("HTTPS local: inicialização e link criptográfico", async () => {
        await p.goto(tls.url + "/#/laboratorio");
        await p.waitForFunction(
          () => document.documentElement.dataset.appPronto === "true",
        );
        assert.ok(await p.evaluate(() => isSecureContext && !!crypto.subtle));
        const ok = await p.evaluate(async () => {
          const r = SIAB.experimentos[0],
            token = await SIAB.atividades.codificar({
              schema: 1,
              tipo: "roteiro",
              item: r.id,
              modulo: r.modulo,
              temperatura: 25,
              instrumentos: ["fita"],
              navegacao: "restrita",
              relatorio: "digital",
            });
          return (await SIAB.atividades.decodificar(token)).item === r.id;
        });
        assert.ok(ok);
      });
      await test("Toque simulado: preparo, gota e leitura em 390 px", async () => {
        await p.goto(http.url + "/#/laboratorio");
        await p.waitForFunction(
          () => document.documentElement.dataset.appPronto === "true",
        );
        if (await p.locator("#boas-vindas-fechar").isVisible())
          await p.tap("#boas-vindas-fechar");
        await p.tap("#vazia-prateleira");
        await p.fill("#shelf-search", "clorídrico");
        await p.tap("#shelf [data-solution=hcl]");
        if (await p.locator("#close-controls").isVisible())
          await p.tap("#close-controls");
        await p.tap("#drop-btn");
        assert.equal(
          await p.evaluate(() => SIAB.current().additions.length),
          1,
        );
        await p.tap("#workspace-ver");
        await p.tap("[data-ver-family=medir]");
        await p.tap("#tab-ph");
        await p.tap("[data-instrumento=fita]");
        assert.equal(
          await p.evaluate(
            () => SIAB.instrumentos.leitura(SIAB.current()).tecnica,
          ),
          "fita",
        );
        await p.screenshot({
          path: path.join(out, engine + "-toque-390.png"),
          fullPage: true,
        });
      });
      await test("Tour completo: cinco passos", async () => {
        await p.setViewportSize({ width: 1366, height: 900 });
        await p.evaluate(() => SIAB.tour.iniciar());
        assert.equal(await p.evaluate(() => SIAB.tour.PASSOS.length), 5);
        for (let i = 0; i < 5; i++) {
          assert.ok(await p.locator("#tour").evaluate((d) => d.open));
          assert.ok((await p.locator("#tour-titulo").innerText()).length > 3);
          await p.click("#tour-proximo");
        }
        assert.equal(await p.locator("#tour").evaluate((d) => d.open), false);
      });
      await test("Clima indisponível: referência segura sem coordenadas salvas", async () => {
        // Simula indisponibilidade real do contexto. Interceptar só a página
        // pode ser ignorado por requisições mediadas por service workers.
        await ctx.setOffline(true);
        try {
          await p.evaluate(() => SIAB.temperaturaLocal("Recife"));
        } finally {
          await ctx.setOffline(false);
        }
        assert.deepEqual(
          await p.evaluate(() => [
            SIAB.ambiente.externa,
            SIAB.ambiente.bancada,
          ]),
          [null, 25],
        );
        assert.ok(
          await p.evaluate(
            () =>
              !Object.values(localStorage).some((x) =>
                /latitude|longitude/.test(x),
              ),
          ),
        );
      });
      await test("Abertura preservada e respeita movimento reduzido", async () => {
        const a = await b.newContext({ reducedMotion: "no-preference" });
        const q = await a.newPage();
        await q.goto(http.url + "/#/laboratorio");
        await q.waitForFunction(
          () => document.documentElement.dataset.appPronto === "true",
        );
        assert.equal(await q.evaluate(() => SIAB.abertura.TUBOS.length), 5);
        await q.waitForFunction(() => !document.getElementById("abertura"));
        await a.close();
        assert.equal(await p.locator("#abertura").count(), 0);
      });
      await ctx.close();
      await b.close();
    }
  } finally {
    http?.server.close();
    tls?.server.close();
    fs.rmSync(dir, { recursive: true, force: true });
    fs.writeFileSync(
      path.join(out, "ambiente.json"),
      JSON.stringify(results, null, 2),
    );
  }
  if (results.engines.some((e) => e.cases.some((c) => c.status === "Falha")))
    process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
