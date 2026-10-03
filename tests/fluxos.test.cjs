/* Integração em navegadores reais. Cada caso registra resultado e evidencia falhas.
   SIAB_TEST_ENGINES=chromium,firefox,webkit; instalação: npx playwright install --with-deps */
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path");
const { pathToFileURL } = require("node:url");
const pw = require(process.env.SIAB_PLAYWRIGHT_MODULE || "playwright");
const out = path.join(__dirname, "results");
fs.mkdirSync(out, { recursive: true });
const engines = (
  process.env.SIAB_TEST_ENGINES || "chromium,firefox,webkit"
).split(",");
const results = {
  date: new Date().toISOString(),
  platform: process.platform,
  version: "1.0.0-rc.5",
  engines: [],
};
(async () => {
  const { server, url, setOffline } = await require("./server.cjs").start();
  try {
    for (const engine of engines) {
      const b = await pw[engine].launch(
        engine === "chromium"
          ? { headless: true, args: ["--no-sandbox"] }
          : {
              headless: true,
              env: { ...process.env, MOZ_DISABLE_CONTENT_SANDBOX: "1" },
            },
      );
      const entry = { engine, version: b.version(), cases: [], errors: [] };
      results.engines.push(entry);
      const ctx = await b.newContext({
        viewport: { width: 1366, height: 900 },
        reducedMotion: "reduce",
      });
      await ctx.addInitScript(() => {
        try {
          localStorage.setItem("siab_abertura", "off");
          localStorage.setItem("siab_inicializacao", '"inicio"');
        } catch (_) {}
      });
      const p = await ctx.newPage();
      p.setDefaultTimeout(7000);
      p.on("pageerror", (e) => entry.errors.push(e.message));
      async function test(name, fn) {
        try {
          await fn();
          entry.cases.push({ name, status: "OK" });
          console.log(engine, "OK", name);
        } catch (e) {
          entry.cases.push({ name, status: "Falha", error: e.message });
          console.log(engine, "FAIL", name, e.message);
          await p
            .screenshot({
              path: path.join(
                out,
                engine + "-falha-" + entry.cases.length + ".png",
              ),
            })
            .catch(() => {});
        }
      }
      async function route(name) {
        await p.goto(url + "/#/" + name);
        await p.waitForFunction(
          () => document.documentElement.dataset.appPronto === "true",
        );
        await p.waitForTimeout(90);
      }
      async function chooseTab(id) {
        await p.evaluate(() => SIAB.workspace.open("right"));
        const family = await p.evaluate(
          (id) =>
            SIAB.VER_SECTIONS.find((g) => g.items.some((x) => x.id === id)).id,
          id,
        );
        const familyButton = p.locator(`[data-ver-family="${family}"]`);
        if (await familyButton.count()) await familyButton.click();
        const tab = p.locator(`[data-ver="${id}"]`);
        if (await tab.count()) await tab.click();
        assert.equal(await p.evaluate(() => SIAB.state.verTab), id);
      }
      async function fresh(
        tubes = [
          {
            solution: "hcl",
            titrant: "naoh",
            concentration: 0.01,
            indicator: "universal",
          },
        ],
        level = "medir",
      ) {
        await route("laboratorio");
        await p.evaluate(
          ({ tubes, level }) => {
            SIAB.atividades.encerrar();
            SIAB.benches.lab = SIAB.criarBancada();
            SIAB.usarBancada("lab");
            SIAB.state.level = level;
            SIAB.state.verTab = "ph";
            for (const t of tubes) SIAB.newTube(t);
            SIAB.state.activeId = SIAB.state.tubes[0]?.id;
            SIAB.bancada.configurar();
            SIAB.loja.avisar();
            SIAB.$("boas-vindas").hidden = true;
          },
          { tubes, level },
        );
      }
      await test("Inicialização e navegação pública", async () => {
        for (const r of [
          "inicio",
          "aprender",
          "missoes",
          "roteiros",
          "montagens",
          "caderno",
          "manual",
          "professor",
        ]) {
          await route(r);
          assert.equal(await p.evaluate(() => SIAB.rota.nome), r);
          assert.ok((await p.locator("main").innerText()).length > 20);
        }
        await p.screenshot({
          path: path.join(out, engine + "-professor.png"),
          fullPage: true,
        });
      });
      await test("Catálogo completo e roteiros montáveis", async () => {
        const x = await p.evaluate(() => {
          const used = new Set(
            SIAB.experimentos.flatMap((r) =>
              r.tubos.flatMap((t) => [t.solution, t.titrant]).filter(Boolean),
            ),
          );
          const bad = SIAB.experimentos.filter(
            (r) =>
              !["explorar", "medir", "calcular"].includes(r.modulo) ||
              r.tubos.length > 10 ||
              !r.titulo ||
              !r.problema ||
              !r.pergunta,
          );
          return {
            missing: Object.keys(SIAB.solutions).filter((s) => !used.has(s)),
            bad: bad.map((x) => x.id),
            ids: SIAB.experimentos.map((r) => r.id),
          };
        });
        assert.deepEqual(x.missing, []);
        assert.deepEqual(x.bad, []);
        for (const id of x.ids) {
          await route("roteiro/" + id);
          assert.equal(await p.locator("[data-start-experiment]").count(), 1);
          assert.ok(
            !/resultado esperado|máximo de 10/i.test(
              await p.locator("#roteiro-conteudo").innerText(),
            ),
          );
          await p.evaluate(
            (id) =>
              SIAB.montarExperimento(
                SIAB.experimentos.find((r) => r.id === id),
              ),
            id,
          );
          assert.ok(
            await p.evaluate(() =>
              SIAB.state.tubes.every((t) =>
                Number.isFinite(SIAB.chem.solve(t).pH),
              ),
            ),
          );
        }
      });
      await test("Medição explícita, fita, estabilização e leitura anterior", async () => {
        await fresh();
        assert.match(await p.locator("#ph-value").innerText(), /não medido/);
        await p.click("#workspace-ver");
        await p.click("[data-instrumento=fita]");
        assert.equal(
          await p.evaluate(
            () => SIAB.instrumentos.leitura(SIAB.current()).tecnica,
          ),
          "fita",
        );
        await p.click("[data-instrumento=phmetro][data-modo=pontual]");
        await p.waitForFunction(
          () => SIAB.instrumentos.dados(SIAB.current()).status === "estável",
        );
        assert.ok(
          Math.abs(
            (await p.evaluate(
              () => SIAB.instrumentos.leitura(SIAB.current()).valor,
            )) - 2,
          ) < 0.02,
        );
        await p.click("#drop-btn");
        assert.ok(
          await p.evaluate(
            () => SIAB.instrumentos.leitura(SIAB.current()).anterior,
          ),
        );
        await p.click("[data-instrumento=phmetro][data-modo=continuo]");
        await p.waitForTimeout(650);
        await p.click("#drop-btn");
        await p.waitForTimeout(650);
        assert.ok(
          await p.evaluate(
            () => SIAB.instrumentos.leitura(SIAB.current()).valida,
          ),
        );
        assert.ok(
          await p.evaluate(
            () => SIAB.current().observacao.leituras.length >= 4,
          ),
        );
        await p.click("[data-instrumento=calibrar]");
        assert.match(
          await p.evaluate(() => SIAB.current().observacao.calibracao),
          /Dois pontos/,
        );
        await p.click("[data-instrumento=parar]");
      });
      await test("VER: todas as representações e temperatura", async () => {
        await fresh(
          [
            {
              solution: "acetic",
              titrant: "naoh",
              indicator: "btb",
              concentration: 0.1,
            },
          ],
          "calcular",
        );
        const tabs = await p.evaluate(() =>
          Object.values(SIAB.verGrupos)
            .flat()
            .map((x) => x[0]),
        );
        for (const tab of tabs) {
          await chooseTab(tab);
          assert.ok((await p.locator("#ver-conteudo").innerText()).length > 10);
        }
        await chooseTab("temperatura");
        await p.fill("#temperatura-form input", "60");
        await p.click("#temperatura-form button");
        assert.equal(await p.evaluate(() => SIAB.current().temperature), 60);
        await chooseTab("condutividade");
        await p.click("[data-instrumento=condutividade]");
        assert.ok(
          await p.evaluate(
            () => SIAB.current().observacao.condutividade.valor > 0,
          ),
        );
        await chooseTab("especies");
        await p.locator("[data-species]").first().click();
        const selected = await p.evaluate(() => SIAB.state.destaque);
        await chooseTab("distribuicao");
        assert.ok(
          (await p.locator(".species-bridge").innerText()).includes(selected),
        );
      });
      await test("Prever e gotejar: registro voluntário", async () => {
        await fresh();
        const n = await p.evaluate(() => SIAB.progresso.dados.caderno.length);
        await p.click("#poe-btn");
        await p.fill("#poe-form textarea", "Espero uma mudança de cor");
        await p.click("#poe-form .primary-btn");
        await p.fill(
          "#poe-explicacao",
          "A adição altera as proporções das espécies.",
        );
        await p.click("#poe-resultado button");
        assert.equal(
          await p.evaluate(() => SIAB.progresso.dados.caderno.length),
          n,
        );
        await p.click("#poe-btn");
        await p.click("#poe-form .primary-btn");
        await p.check("#poe-registrar");
        await p.click("#poe-resultado button");
        assert.equal(
          await p.evaluate(() => SIAB.progresso.dados.caderno.length),
          n + 1,
        );
      });
      await test("Seleção, comparação, vínculo e mistura conservativa", async () => {
        await fresh([
          {
            solution: "hcl",
            concentration: 0.1,
            titrant: "naoh",
            initialVolume: 1,
          },
          {
            solution: "naoh",
            concentration: 0.1,
            titrant: "hcl",
            initialVolume: 1,
          },
        ]);
        await p.evaluate(() => {
          SIAB.state.view = "overview";
          SIAB.render();
        });
        await p.click("#selecionar-tubos-btn");
        await p.click("#selecao-todos-btn");
        await p.click("#selecao-comparar-btn");
        assert.equal(
          await p.evaluate(() => SIAB.state.tubes.some((t) => t.group)),
          false,
        );
        await p.locator("[data-close=comparacao-dialog]").click();
        const before = await p.evaluate(() =>
          SIAB.state.tubes.map((t) => SIAB.chem.solve(t).pH),
        );
        await p.click("#selecao-vincular-btn");
        assert.deepEqual(
          await p.evaluate(() =>
            SIAB.state.tubes.map((t) => SIAB.chem.solve(t).pH),
          ),
          before,
        );
        await p.evaluate(() => SIAB.bancada.gotejar(1));
        assert.deepEqual(
          await p.evaluate(() =>
            SIAB.state.tubes.map((t) => t.additions.length),
          ),
          [1, 1],
        );
        await p.click("#selecao-misturar-btn");
        await p.click("#mistura-destino-form .primary-btn");
        const mix = await p.evaluate(() =>
          SIAB.state.tubes.map((t) => ({
            v: SIAB.chem.solve(t).volume,
            ph: SIAB.chem.solve(t).pH,
          })),
        );
        assert.ok(Math.abs(mix[0].v - 2.1) < 1e-9);
        assert.equal(mix[1].v, 0);
        await p.locator("#overview-grid [data-tube]").first().click();
        await p.click("#undo-btn");
        assert.equal(
          await p.evaluate(
            () =>
              SIAB.state.tubes.filter((t) => SIAB.chem.solve(t).volume > 0)
                .length,
          ),
          2,
        );
      });
      await test("Mistura excedente não altera as origens", async () => {
        await fresh([
          { solution: "hcl", initialVolume: 4 },
          { solution: "water", initialVolume: 4 },
        ]);
        assert.equal(
          await p.evaluate(() => {
            const ids = SIAB.state.tubes.map((t) => t.id),
              old = JSON.stringify(SIAB.state.tubes);
            try {
              SIAB.selecaoTubos.misturar(ids, ids[0]);
            } catch (e) {
              return old === JSON.stringify(SIAB.state.tubes);
            }
            return false;
          }),
          true,
        );
      });
      await test("Roteiro, relatório editável, Caderno e impressão", async () => {
        await route("roteiro/titulacao-forte");
        await p.fill(
          "[data-start-experiment] [name=nome]",
          "Estudante de teste",
        );
        await p.click("[data-start-experiment] button");
        await p.waitForFunction(() => SIAB.rota.nome === "laboratorio");
        await chooseTab("ph");
        await p.click("[data-instrumento=phmetro][data-modo=pontual]");
        await p.waitForTimeout(650);
        await route("relatorio");
        await p.fill(
          "[data-report-field=observacoes]",
          "Registro de verificação 1,0 mL",
        );
        await p.fill(
          "[data-report-field=conclusao]",
          "Conclusão com evidências.",
        );
        const id = await p.evaluate(() => SIAB.relatorios.atual.id);
        await p.click("#relatorio-registrar");
        await route("caderno");
        assert.equal(
          await p.locator('a[href="#/relatorio/' + id + '"]').count(),
          1,
        );
        await route("relatorio/" + id);
        assert.equal(
          await p.locator("[data-report-field=observacoes]").inputValue(),
          "Registro de verificação 1,0 mL",
        );
        await p.evaluate(() => {
          window.print = () => {};
          SIAB.relatorios.imprimir(false);
        });
        assert.match(
          await p.locator("#folha-impressao").textContent(),
          /Conclusão com evidências/,
        );
        if (engine === "chromium")
          await p.pdf({
            path: path.join(out, "relatorio-preenchido.pdf"),
            format: "A4",
            printBackground: true,
          });
        await p.evaluate(() => SIAB.relatorios.imprimir(true));
        assert.ok(
          !(await p.locator("#folha-impressao").textContent()).includes(
            "Conclusão com evidências",
          ),
        );
        if (engine === "chromium")
          await p.pdf({
            path: path.join(out, "relatorio-em-branco.pdf"),
            format: "A4",
            printBackground: true,
          });
        await p.evaluate(() =>
          document.body.classList.remove("imprimindo", "imprimindo-folha"),
        );
      });
      await test("Professor: criar, duplicar e abrir link opaco", async () => {
        await route("professor");
        await p.fill("#prof-form [name=titulo]", "Investigação da turma");
        assert.equal(
          await p.locator("#prof-form [name=navegacao]").inputValue(),
          "restrita",
        );
        await p.uncheck("#prof-form [name=instrumentos][value=phmetro]");
        await p.click("#prof-form button[type=submit]");
        await p.waitForFunction(() =>
          document
            .getElementById("prof-link")
            .value.includes("#/atividade/v1."),
        );
        const link = await p.locator("#prof-link").inputValue();
        assert.ok(!link.includes("Investigação"));
        entry.activityLink = link;
        await p.locator("[data-duplicate-activity]").first().click();
        assert.equal(await p.locator(".recent-activity").count(), 2);
        await p.goto(link);
        await p.waitForSelector("#atividade-iniciar");
        await p.fill("#atividade-iniciar [name=nome]", "Aluno teste");
        await p.click("#atividade-iniciar button");
        await p.waitForFunction(
          () => SIAB.atividades.ativa?.etapa === "bancada",
        );
        assert.equal(
          await p.evaluate(() => SIAB.instrumentos.permitido("phmetro")),
          false,
        );
        assert.equal(await p.locator("[data-instrumento=phmetro]").count(), 0);
      });
      await test("Atividade restrita: URL, atualização, outra aba e encerramento", async () => {
        assert.ok(entry.activityLink);
        const link = entry.activityLink;
        await route("professor");
        assert.equal(await p.evaluate(() => SIAB.rota.nome), "atividade");
        await route("aprender");
        assert.equal(await p.evaluate(() => SIAB.rota.nome), "atividade");
        await p.reload();
        await p.waitForFunction(() => Boolean(SIAB.atividades.ativa));
        assert.equal(
          await p.evaluate(() => SIAB.atividades.ativa.config.navegacao),
          "restrita",
        );
        if (await p.locator("[data-session-continue]:visible").count()) await p.locator("[data-session-continue]:visible").click();
        const other = await ctx.newPage();
        await other.goto(link);
        await other.waitForFunction(
          () => SIAB.atividades.ativa?.etapa === "bancada",
        );
        assert.ok(
          await other.evaluate(() => document.body.dataset.restrita === "true"),
        );
        await other.locator("[data-session-continue]").click();
        await other.goto(url + "/#/laboratorio");
        await other.waitForFunction(() => SIAB.rota.nome === "laboratorio");
        assert.equal(
          await other.evaluate(() => SIAB.state.level),
          await p.evaluate(() => SIAB.atividades.ativa.config.modulo),
        );
        await other.close();
        await p.evaluate(() => SIAB.atividades.finalizar());
        await p.waitForFunction(
          () => SIAB.atividades.ativa.etapa === "finalizada",
        );
        await p.click("[data-activity-close]");
        await p.click("#confirm-yes");
        await p.waitForFunction(() => !SIAB.atividades.ativa);
        delete entry.activityLink;
      });
      await test("Links inválidos e rotas antigas", async () => {
        await route("atividade/v1.incompleto");
        await p.waitForFunction(() =>
          document
            .getElementById("atividade-conteudo")
            .textContent.includes("Não foi possível"),
        );
        await route("desafios");
        assert.equal(await p.evaluate(() => SIAB.rota.nome), "missoes");
        await route("trilhas");
        assert.equal(await p.evaluate(() => SIAB.rota.nome), "aprender");
        await route("%E0%A4%A");
        assert.equal(await p.evaluate(() => SIAB.rota.nome), "inicio");
      });
      await test("Persistência da bancada e relatório após recarga", async () => {
        await fresh();
        await p.click("#drop-btn");
        await p.reload();
        await p.waitForFunction(
          () => document.documentElement.dataset.appPronto === "true",
        );
        assert.equal(
          await p.evaluate(() => SIAB.current().additions.length),
          1,
        );
        assert.ok(
          await p.evaluate(
            () =>
              Object.keys(SIAB.persistencia.ler("siab_relatorios_v1", {}))
                .length > 0,
          ),
        );
      });
      await test("Responsividade 320 a 2560 px e campos de texto", async () => {
        for (const width of [320, 360, 390, 414, 768, 1024, 1366, 1920, 2560]) {
          await p.setViewportSize({ width, height: width < 500 ? 844 : 900 });
          for (const r of [
            "inicio",
            "roteiros",
            "professor",
            "relatorio",
            "laboratorio",
          ]) {
            await route(r);
            const dims = await p.evaluate(() => ({
              w: innerWidth,
              doc: document.documentElement.scrollWidth,
            }));
            assert.ok(
              dims.doc <= dims.w + 1,
              r + " transborda em " + width + ": " + dims.doc,
            );
          }
          if ([320, 390, 1366].includes(width))
            await p.screenshot({
              path: path.join(out, engine + "-bancada-" + width + ".png"),
              fullPage: true,
            });
        }
        await p.setViewportSize({ width: 1366, height: 900 });
      });
      await test("Offline com cache instalado", async () => {
        await route("laboratorio");
        await p.evaluate(() => navigator.serviceWorker.ready);
        await p.waitForFunction(() => !!navigator.serviceWorker.controller);
        setOffline(true);
        try {
          await p.reload();
          await p.waitForFunction(
            () => document.documentElement.dataset.appPronto === "true",
          );
          assert.equal(await p.evaluate(() => SIAB.version), "1.0.0-rc.5");
          await p.goto(url + "/#/roteiros");
          assert.equal(await p.locator("[data-start-experiment]").count(), 0);
          assert.equal(await p.locator("#roteiros-lista a").count(), 35);
        } finally {
          setOffline(false);
        }
      });
      await test("Standalone file://", async () => {
        const single = await ctx.newPage();
        const errs = [];
        single.on("pageerror", (e) => errs.push(e.message));
        await single.goto(
          pathToFileURL(path.join(__dirname, "..", "SIAB-standalone.html"))
            .href + "#/laboratorio",
        );
        await single.waitForFunction(
          () => document.documentElement.dataset.appPronto === "true",
        );
        await single.evaluate(() => SIAB.bancada.colocar("hcl"));
        assert.ok(
          Math.abs(
            (await single.evaluate(() => SIAB.chem.solve(SIAB.current()).pH)) -
              2,
          ) < 0.02,
        );
        assert.equal(
          await single.locator("script[src],link[rel=stylesheet]").count(),
          0,
        );
        assert.deepEqual(errs, []);
        await single.close();
      });
      await test("Sem erros de execução", async () =>
        assert.deepEqual(entry.errors, []));
      await ctx.close();
      await b.close();
      fs.writeFileSync(
        path.join(out, "navegadores.json"),
        JSON.stringify(results, null, 2),
      );
    }
  } finally {
    server.close();
    fs.writeFileSync(
      path.join(out, "navegadores.json"),
      JSON.stringify(results, null, 2),
    );
  }
  const failed = results.engines
    .flatMap((e) => e.cases)
    .filter((t) => t.status === "Falha");
  console.log(
    "RESULT",
    results.engines.reduce((n, e) => n + e.cases.length, 0),
    "cases;",
    failed.length,
    "failures",
  );
  if (failed.length) process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
