const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path");
const pw = require(process.env.SIAB_PLAYWRIGHT_MODULE || "playwright");
const Axe = require(
  process.env.SIAB_AXE_MODULE || "@axe-core/playwright",
).default;
const engines = (
  process.env.SIAB_TEST_ENGINES || "chromium,firefox,webkit"
).split(",");
const out = path.join(__dirname, "results"),
  results = { date: new Date().toISOString(), engines: [] };
(async () => {
  const { server, url } = await require("./server.cjs").start();
  let baseline;
  try {
    for (const engine of engines) {
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
        localStorage.setItem("siab_abertura", "off");
        localStorage.setItem("siab_inicializacao", '"inicio"');
      });
      const p = await ctx.newPage();
      p.setDefaultTimeout(8000);
      const entry = { engine, cases: [], errors: [] };
      results.engines.push(entry);
      p.on("pageerror", (e) => entry.errors.push(e.message));
      const route = async (name) => {
        await p.goto(url + "/#/" + name);
        await p.waitForFunction(
          () => document.documentElement.dataset.appPronto === "true",
        );
      };
      const test = async (name, fn) => {
        try {
          await fn();
          entry.cases.push({ name, status: "OK" });
          console.log(engine, "OK", name);
        } catch (e) {
          entry.cases.push({ name, status: "Falha", error: e.message });
          console.log(engine, "FAIL", name, e.message);
        }
      };
      await route("laboratorio");
      await test("140 soluções: mesma ciência nos três motores", async () => {
        const values = await p.evaluate(() =>
          Object.keys(SIAB.solutions).map((solution) => {
            const t = {
                ...SIAB.TUBE_DEFAULTS,
                solution,
                concentration: 0.01,
                additions: [],
                temperature: 25,
              },
              s = SIAB.chem.solve(t);
            return [solution, s.pH, s.conductivity.kappa];
          }),
        );
        assert.equal(values.length, 140);
        assert.ok(
          values.every((x) => Number.isFinite(x[1]) && Number.isFinite(x[2])),
        );
        if (!baseline) baseline = values;
        else
          values.forEach((x, i) => {
            assert.equal(x[0], baseline[i][0]);
            assert.ok(Math.abs(x[1] - baseline[i][1]) < 1e-10);
            assert.ok(Math.abs(x[2] - baseline[i][2]) < 1e-7);
          });
        entry.chemicalSolutions = values.length;
      });
      await test("Todas as missões e temas abrem", async () => {
        const ids = await p.evaluate(() => ({
          missoes: SIAB.missoes.map((x) => x.id),
          temas: SIAB.temas.map((x) => x.id),
        }));
        for (const id of ids.missoes) {
          await route("missao/" + id);
          assert.equal(await p.evaluate(() => SIAB.motor.ativa.def.id), id);
          assert.equal(await p.locator("#missao-conclusao").count(), 1);
        }
        for (const id of ids.temas) {
          await route("tema/" + id);
          assert.ok(
            (await p.locator("#tema-conteudo").innerText()).length > 100,
          );
        }
        entry.content = ids;
      });
      await test("Conclusão sem pontuação e sem duplicar o Caderno", async () => {
        await route("missao/amostra-misteriosa");
        const n = await p.evaluate(() => SIAB.progresso.dados.caderno.length);
        await p.fill("#missao-conclusao", "Conclusão apoiada na leitura.");
        assert.equal(await p.evaluate(() => SIAB.motor.concluir()), false);
        await p.evaluate(() => SIAB.instrumentos.medir(SIAB.current(), "fita"));
        await p.click("#missao-concluir");
        await p.click("#missao-concluir");
        assert.equal(
          await p.evaluate(() => SIAB.progresso.dados.caderno.length),
          n + 1,
        );
        assert.ok(
          await p.evaluate(
            () => SIAB.progresso.dados.missoes["amostra-misteriosa"].concluida,
          ),
        );
      });
      await test("Vínculo preserva conteúdo já adicionado", async () => {
        await route("laboratorio");
        const r = await p.evaluate(() => {
          SIAB.benches.lab = SIAB.criarBancada();
          SIAB.usarBancada("lab");
          SIAB.bancada.configurar();
          SIAB.newTube({
            solution: "hcl",
            initialVolume: 1,
            titrant: "naoh",
            additions: [0.1],
          });
          SIAB.newTube({
            solution: "acetic",
            initialVolume: 1,
            titrant: "water",
            additions: [0.2, 0.2],
          });
          SIAB.state.activeId = SIAB.state.tubes[0].id;
          const before = SIAB.state.tubes.map((t) => SIAB.chem.solve(t));
          SIAB.bancada.vincularTubos(SIAB.state.tubes.map((t) => t.id));
          return {
            before: before.map((x) => [x.pH, x.volume]),
            after: SIAB.state.tubes.map((t) => {
              const x = SIAB.chem.solve(t);
              return [x.pH, x.volume];
            }),
          };
        });
        r.before.forEach((x, i) =>
          x.forEach((v, j) => assert.ok(Math.abs(v - r.after[i][j]) < 1e-9)),
        );
      });
      await test("Permissões de instrumentos, módulo e retorno da bancada livre", async () => {
        await route("laboratorio");
        const x = await p.evaluate(async () => {
          SIAB.state.tubes[0].name = "Minha bancada preservada";
          SIAB.loja.avisar();
          const free = JSON.stringify(SIAB.benches.lab),
            r = SIAB.experimentos[0],
            c = {
              schema: 1,
              tipo: "roteiro",
              item: r.id,
              modulo: r.modulo,
              titulo: "Teste de permissão",
              temperatura: 50,
              instrumentos: ["fita"],
              navegacao: "restrita",
              relatorio: "digital",
              identificacao: {},
            };
          const token = await SIAB.atividades.codificar(c);
          await SIAB.atividades.abrir(token);
          SIAB.atividades.iniciar({ nome: "Teste" });
          const level = SIAB.state.level;
          SIAB.modulos.ativar(level === "explorar" ? "calcular" : "explorar");
          const moduleBlocked = SIAB.state.level === level;
          const indicators = SIAB.state.tubes.every(
            (t) => t.indicator === "none",
          );
          const input = document.querySelector(
            "#indicator-chips input[value=phenol]",
          );
          if (input) {
            input.checked = true;
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
          const blockIndicator = SIAB.current().indicator === "none";
          SIAB.instrumentos.medir(SIAB.current(), "phmetro");
          const meterBlocked = !SIAB.current().observacao?.ph;
          SIAB.atividades.encerrar();
          return {
            moduleBlocked,
            indicators,
            blockIndicator,
            meterBlocked,
            freeKept: JSON.stringify(SIAB.benches.lab) === free,
          };
        });
        Object.entries(x).forEach(([k, v]) => assert.equal(v, true, k));
      });
      await test("Token alterado rejeitado", async () => {
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
            }),
            a = token.split(".");
          a[3] = (a[3][0] === "A" ? "B" : "A") + a[3].slice(1);
          try {
            await SIAB.atividades.decodificar(a.join("."));
            return false;
          } catch (_) {
            return true;
          }
        });
        assert.ok(ok);
      });
      await test("Caderno: anotação e exportação CSV", async () => {
        await route("caderno");
        await p.evaluate(() =>
          SIAB.progresso.anotar({
            tipo: "anotacao",
            titulo: "Hipótese",
            linhas: [["Texto", "Amostra contém ácido; testar."]],
          }),
        );
        await route("caderno");
        assert.match(
          await p.locator("#caderno-lista").innerText(),
          /Amostra contém ácido/,
        );
        const csv = await p.evaluate(() =>
          SIAB.tabelaCSV({
            colunas: ["Evento", "pH"],
            linhas: [["Medição", "2,00"]],
          }),
        );
        assert.equal(csv, "Evento;pH\nMedição;2,00");
      });
      await test("Sem armazenamento: aviso e sessão utilizável", async () => {
        const noStore = await b.newContext();
        await noStore.addInitScript(() => {
          for (const k of ["getItem", "setItem", "removeItem"])
            Storage.prototype[k] = () => {
              throw new DOMException("bloqueado", "SecurityError");
            };
        });
        const q = await noStore.newPage(),
          errs = [];
        q.on("pageerror", (e) => errs.push(e.message));
        await q.goto(url + "/#/laboratorio");
        await q.waitForFunction(
          () => document.documentElement.dataset.appPronto === "true",
        );
        await q.evaluate(() => {
          SIAB.bancada.colocar("hcl");
          SIAB.progresso.anotar({
            tipo: "anotacao",
            titulo: "Memória",
            linhas: [],
          });
        });
        assert.equal(
          await q.evaluate(() => SIAB.progresso.dados.caderno.length),
          1,
        );
        assert.deepEqual(errs, []);
        await noStore.close();
      });
      await test("Teclado: abas e fechamento de diálogo", async () => {
        await route("laboratorio");
        await p.evaluate(() => {
          SIAB.state.view = "focus";
          SIAB.state.verTab = "ph";
          SIAB.render();
        });
        await p.locator("#tab-ph").focus();
        await p.keyboard.press("ArrowRight");
        assert.ok(
          await p.evaluate(
            () => document.activeElement.getAttribute("role") === "tab",
          ),
        );
        await p.click("#rename-btn");
        await p.fill("#new-name", "Nome por teclado");
        await p.keyboard.press("Escape");
        assert.equal(
          await p.locator("#rename-dialog").evaluate((d) => d.open),
          false,
        );
      });
      await test("Carga: dez recipientes e 500 gotas em lote", async () => {
        await route("laboratorio");
        const perf = await p.evaluate(() => {
          SIAB.benches.lab = SIAB.criarBancada();
          SIAB.usarBancada("lab");
          SIAB.state.vidraria = "bequer";
          SIAB.state.capacidades.bequer = 250;
          SIAB.state.verTab = "ph";
          for (let i = 0; i < 10; i++)
            SIAB.newTube({
              solution: i % 2 ? "acetic" : "hcl",
              initialVolume: 10,
              titrant: "naoh",
              dropVolume: 0.05,
            });
          SIAB.state.activeId = SIAB.state.tubes[0].id;
          SIAB.render(true);
          const before = document.querySelectorAll("*").length,
            start = performance.now();
          const n = SIAB.bancada.gotejar(500);
          return {
            ms: performance.now() - start,
            drops: n,
            nodesBefore: before,
            nodesAfter: document.querySelectorAll("*").length,
            pH: SIAB.chem.solve(SIAB.current()).pH,
          };
        });
        assert.equal(perf.drops, 500);
        assert.ok(Number.isFinite(perf.pH));
        assert.ok(perf.ms < 12000, "Operação em lote excedeu 12 s");
        assert.ok(perf.nodesAfter - perf.nodesBefore < 150);
        entry.performance = perf;
      });
      await test("Acessibilidade automática: WCAG 2 A/AA", async () => {
        entry.a11y = [];
        for (const name of ["inicio", "roteiros", "professor", "laboratorio"]) {
          await route(name);
          const r = await new Axe({ page: p })
            .withTags(["wcag2a", "wcag2aa"])
            .analyze();
          entry.a11y.push({
            route: name,
            violations: r.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              nodes: v.nodes.map((n) => n.target),
            })),
          });
        }
        assert.deepEqual(
          entry.a11y.flatMap((x) =>
            x.violations.filter((v) =>
              ["critical", "serious"].includes(v.impact),
            ),
          ),
          [],
        );
      });
      await test("Sem exceções JavaScript", async () =>
        assert.deepEqual(entry.errors, []));
      await ctx.close();
      await b.close();
      fs.writeFileSync(
        path.join(out, "regressao.json"),
        JSON.stringify(results, null, 2),
      );
    }
  } finally {
    server.close();
    fs.writeFileSync(
      path.join(out, "regressao.json"),
      JSON.stringify(results, null, 2),
    );
  }
  if (results.engines.some((x) => x.cases.some((t) => t.status === "Falha")))
    process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
