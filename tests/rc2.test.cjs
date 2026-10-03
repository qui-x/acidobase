/* Regressões da RC.2: permissões, tentativas de desvio, representações,
   dados brutos, documentos e contrato visual. Executa nos três motores. */
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path");
const pw = require(process.env.SIAB_PLAYWRIGHT_MODULE || "playwright");
const AxeBuilder = require(
  process.env.SIAB_AXE_MODULE || "@axe-core/playwright",
).default;
const out = path.join(__dirname, "results"),
  results = { date: new Date().toISOString(), engines: [] };
(async () => {
  const { server, url } = await require("./server.cjs").start();
  try {
    for (const engine of (
      process.env.SIAB_TEST_ENGINES || "chromium,firefox,webkit"
    ).split(",")) {
      const browser = await pw[engine].launch({
        headless: true,
        ...(engine === "chromium"
          ? { args: ["--no-sandbox"] }
          : { env: { ...process.env, MOZ_DISABLE_CONTENT_SANDBOX: "1" } }),
      });
      const ctx = await browser.newContext({
        viewport: { width: 1366, height: 900 },
        reducedMotion: "reduce",
      });
      await ctx.addInitScript(() => {
        localStorage.setItem("siab_abertura", "off");
        localStorage.setItem("siab_inicializacao", '"inicio"');
      });
      const p = await ctx.newPage(),
        entry = { engine, version: browser.version(), cases: [], errors: [] };
      results.engines.push(entry);
      p.setDefaultTimeout(6000);
      p.on("pageerror", (e) => entry.errors.push(e.message));
      const shot = async (name) => {
        if (engine === "chromium")
          await p.screenshot({
            path: path.join(out, "rc2-" + name + ".png"),
            fullPage: true,
          });
      };
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
                engine + "-rc2-falha-" + entry.cases.length + ".png",
              ),
            })
            .catch(() => {});
        }
      }
      async function ready() {
        await p.waitForFunction(
          () => document.documentElement.dataset.appPronto === "true",
        );
      }
      async function free(route = "professor") {
        await p.evaluate(() => SIAB.atividades.encerrar()).catch(() => {});
        await p.goto(url + "/#/" + route);
        await ready();
      }
      async function start(extra = {}) {
        await free();
        const token = await p.evaluate(
          async (extra) =>
            SIAB.atividades.codificar({
              schema: 2,
              tipo: "roteiro",
              item: "titulacao-forte",
              titulo: "Investigação com técnicas autorizadas",
              modulo: "medir",
              temperatura: 25,
              instrumentos: ["fita"],
              navegacao: "restrita",
              relatorio: "digital",
              identificacao: {},
              permissions: {
                measurements: { phStrip: true },
                representations: {},
                analysis: {},
              },
              ...extra,
            }),
          extra,
        );
        await p.goto(url + "/#/atividade/" + token);
        await p.locator("#atividade-iniciar button").click();
        await p.waitForFunction(
          () => SIAB.rota.nome === "laboratorio" || SIAB.rota.nome === "missao",
        );
        if (await p.locator("#workspace-ver").isVisible())
          await p.click("#workspace-ver");
        return token;
      }
      const all = {
        measurements: {
          indicator: true,
          phStrip: true,
          phMeter: true,
          temperature: true,
          conductivity: true,
        },
        representations: {
          particles: true,
          species: true,
          equations: true,
          protonTransfer: true,
        },
        analysis: {
          graph: true,
          derivative: true,
          distribution: true,
          history: true,
          table: true,
        },
      };
      const sig = () =>
        p.evaluate(() => ({
          tubes: SIAB.state.tubes.map(
            ({
              id,
              name,
              solution,
              titrant,
              initialVolume,
              concentration,
              titrantConcentration,
              temperature,
              indicator,
              vidraria,
              capacidade,
            }) => ({
              id,
              name,
              solution,
              titrant,
              initialVolume,
              concentration,
              titrantConcentration,
              temperature,
              indicator,
              vidraria,
              capacidade,
            }),
          ),
          module: SIAB.state.level,
          glass: SIAB.state.vidraria,
        }));
      await test("Professor: grupos separados, guia modal e permissões preservadas", async () => {
        await free();
        for (const id of [
          "prof-instrumentos",
          "prof-representacoes",
          "prof-analises",
        ])
          assert.ok(await p.locator("#" + id + " input").count());
        assert.equal(
          await p.locator("#teacher-guide-dialog").isVisible(),
          false,
        );
        await p.evaluate(() => {
          document.querySelector('[name="bench.changeTemperature"]').checked =
            true;
        });
        await p.click("#prof-ver-guia");
        assert.equal(
          await p.locator("#teacher-guide-dialog").isVisible(),
          true,
        );
        assert.equal(
          await p.locator('[name="bench.changeTemperature"]').isChecked(),
          true,
        );
        await p.keyboard.press("Escape");
        await shot("professor");
        await p.evaluate(() => {
          window.print = () => {};
          SIAB.professor.imprimir();
        });
        assert.match(
          await p.locator("#folha-impressao").textContent(),
          /Objetivo pedagógico/,
        );
        if (engine === "chromium") {
          await p.evaluate(() =>
            document.body.classList.add(
              "imprimindo-roteiro",
              "imprimindo-folha",
            ),
          );
          await p.pdf({
            path: path.join(out, "rc2-guia-professor.pdf"),
            format: "A4",
            printBackground: true,
          });
          await p.evaluate(() =>
            document.body.classList.remove(
              "imprimindo-roteiro",
              "imprimindo-folha",
            ),
          );
        }
      });
      await test("Capacidades: fita OU pHmetro; configuração inviável recusada", async () => {
        const x = await p.evaluate(() => {
          const c = {
            schema: 2,
            tipo: "roteiro",
            item: "titulacao-forte",
            modulo: "medir",
            temperatura: 25,
            navegacao: "restrita",
            relatorio: "digital",
          };
          const errors = [];
          for (const instrumentos of [["fita"], ["phmetro"], []]) {
            try {
              SIAB.atividades.validar({ ...c, instrumentos });
              errors.push(null);
            } catch (e) {
              errors.push(e.message);
            }
          }
          return errors;
        });
        assert.deepEqual(x.slice(0, 2), [null, null]);
        assert.match(x[2], /Fita de pH ou pHmetro/);
      });
      let token;
      await test("Somente fita: montagem informativa e função única", async () => {
        token = await start();
        await p.click("#workspace-montagem");
        assert.equal(await p.locator("#painel-laboratorio").isVisible(), false);
        assert.equal(await p.locator("#activity-montagem").isVisible(), true);
        await p.click("#close-controls");
        assert.equal(await p.locator("[data-ver-family]").count(), 0);
        assert.match(await p.locator("#ver-tabs").innerText(), /MEDIR · pH/);
        assert.equal(await p.locator("[data-instrumento=phmetro]").count(), 0);
        await shot("somente-fita");
        await shot("aluno-desktop");
      });
      await test("Bancada fechada: solução, reagente, vidro, volume, concentração e recipiente", async () => {
        const before = await sig();
        await p.evaluate(() => {
          SIAB.state.shelfTarget = "solution";
          SIAB.bancada.colocar("naoh");
          SIAB.state.shelfTarget = "titrant";
          SIAB.bancada.colocar("hcl");
          SIAB.bancada.trocarVidraria("bequer");
          SIAB.newTube({ solution: "water" });
          SIAB.bancada.removerTubo();
          SIAB.alterar("tentativa", (s) => {
            const t = SIAB.current();
            Object.assign(t, {
              solution: "naoh",
              titrant: "hcl",
              concentration: 0.09,
              titrantConcentration: 0.09,
              initialVolume: 4,
              temperature: 99,
              name: "Mudado",
              vidraria: "bequer",
              capacidade: 250,
            });
            s.level = "calcular";
            s.tubes.push({ ...t, id: 99 });
          });
        });
        assert.deepEqual(await sig(), before);
      });
      await test("Desvio: rotas externas, Manual e outro roteiro não escapam", async () => {
        for (const route of [
          "inicio",
          "professor",
          "manual",
          "aprender",
          "tema/acidos",
          "missoes",
          "missao/temperatura",
          "roteiros",
          "roteiro/cotidiano",
          "montagens",
        ]) {
          await p.evaluate((route) => SIAB.irPara("#/" + route), route);
          await p.waitForTimeout(35);
          assert.equal(
            await p.evaluate(() => SIAB.rota.nome),
            "atividade",
            route,
          );
          assert.equal(
            await p.evaluate(() => SIAB.atividades.ativa.token),
            token,
          );
        }
        await p.click("[data-activity-resume]");
        const before = await sig();
        await p.evaluate(() => {
          SIAB.montarExperimento(SIAB.experimentos[1]);
          SIAB.motor.iniciar(SIAB.missoes[1].id);
          SIAB.motor.restaurar({ id: SIAB.missoes[1].id });
          SIAB.usarBancada("mission");
        });
        assert.deepEqual(await sig(), before);
        assert.equal(await p.evaluate(() => SIAB.activeBench), "lab");
      });
      await test("Instrumentos proibidos e fallback não reativam recursos", async () => {
        await p.evaluate(() => {
          SIAB.instrumentos.medir(SIAB.current(), "phmetro");
          SIAB.instrumentos.medir(SIAB.current(), "condutividade");
          SIAB.state.verTab = "particulas";
          SIAB.renderVer();
        });
        await p.waitForTimeout(600);
        assert.equal(
          await p.evaluate(() => SIAB.instrumentos.raw(SIAB.current()).length),
          0,
        );
        assert.equal(await p.evaluate(() => SIAB.state.verTab), "ph");
        await p.locator("[data-instrumento=fita]").click();
        assert.equal(
          await p.evaluate(() => document.activeElement.dataset.instrumento),
          "fita",
        );
      });
      await test("Ajuda contextual mantém a bancada", async () => {
        await p.evaluate(() => SIAB.activityUI.dialog());
        assert.equal(
          await p.locator("#activity-help-dialog").isVisible(),
          true,
        );
        assert.equal(await p.evaluate(() => SIAB.rota.nome), "laboratorio");
        await p.keyboard.press("Escape");
      });
      await test("Refresh e nova aba preservam contexto, gota e leitura", async () => {
        await p.click("#drop-btn");
        await p.locator("[data-instrumento=fita]").click();
        const before = await p.evaluate(() => ({
          raw: SIAB.instrumentos.raw(SIAB.current()),
          drops: SIAB.current().additions,
        }));
        await p.reload();
        await p.waitForFunction(() => SIAB.rota.nome === "laboratorio");
        assert.deepEqual(
          await p.evaluate(() => ({
            raw: SIAB.instrumentos.raw(SIAB.current()),
            drops: SIAB.current().additions,
          })),
          before,
        );
        const q = await ctx.newPage();
        await q.goto(url + "/#/atividade/" + token);
        await q.locator("[data-session-continue]:visible").click();
        assert.equal(
          await q.evaluate(
            () => SIAB.ActivityContext.current.permissions.measurements.phMeter,
          ),
          false,
        );
        assert.deepEqual(
          await q.evaluate(() => SIAB.current().additions),
          before.drops,
        );
        await q.close();
      });
      await test("Restauração ignora permissões e preparo incompatíveis do armazenamento", async () => {
        await p.evaluate(() => {
          const a = SIAB.atividades.ativa,
            key = "siab_atividade_" + a.token.split(".")[1],
            saved = JSON.parse(localStorage.getItem(key));
          saved.config.navegacao = "livre";
          saved.bench.tubes[0].solution = "naoh";
          saved.bench.tubes.push({ ...saved.bench.tubes[0], id: 42 });
          localStorage.setItem(key, JSON.stringify(saved));
        });
        await p.reload();
        await p.waitForFunction(() => SIAB.rota.nome === "laboratorio");
        assert.equal(await p.evaluate(() => SIAB.current().solution), "hcl");
        assert.equal(await p.evaluate(() => SIAB.state.tubes.length), 1);
        assert.equal(
          await p.evaluate(() => SIAB.ActivityContext.restricted()),
          true,
        );
      });
      await test("Relatório somente fita: técnicas reais sem instrução de pHmetro", async () => {
        await p.evaluate(() => SIAB.irPara("#/relatorio"));
        await p.waitForSelector("[data-report-field=observacoes]");
        const text = await p.locator("#relatorio-conteudo").innerText();
        assert.match(text, /fita/i);
        assert.doesNotMatch(text, /pHmetro|condutividade|eletrodo/);
        await shot("relatorio-fita");
        await p.evaluate(() => {
          window.print = () => {};
          SIAB.relatorios.imprimir(false);
        });
        assert.doesNotMatch(
          await p.locator("#folha-impressao").textContent(),
          /pHmetro|eletrodo/,
        );
        if (engine === "chromium")
          await p.pdf({
            path: path.join(out, "rc2-relatorio-fita.pdf"),
            format: "A4",
            printBackground: true,
          });
      });
      await test("Finalizar preserva contexto; encerramento exige ação deliberada", async () => {
        await p.evaluate(() => SIAB.atividades.finalizar());
        await p.waitForSelector("[data-activity-close]");
        assert.equal(
          await p.evaluate(() => SIAB.ActivityContext.current.stage),
          "finalizada",
        );
        await p.click("[data-activity-close]");
        assert.equal(await p.locator("#confirm-dialog").isVisible(), true);
        await p.click("#confirm-yes");
        await p.waitForFunction(() => SIAB.rota.nome === "inicio");
        assert.equal(
          await p.evaluate(() => SIAB.ActivityContext.current),
          null,
        );
      });
      await test("Observar, Medir e Analisar mostram só os próprios submenus", async () => {
        await start({ permissions: all, initialView: "especies" });
        assert.equal(await p.evaluate(() => SIAB.state.verTab), "especies");
        const cases = [
          ["observar", ["particulas", "especies", "equacao", "proton"]],
          ["medir", ["ph", "temperatura", "condutividade"]],
          [
            "analisar",
            ["grafico", "derivada", "distribuicao", "historico", "tabela"],
          ],
        ];
        for (const [family, items] of cases) {
          await p.click("[data-ver-family=" + family + "]");
          assert.deepEqual(
            await p
              .locator("[data-ver]")
              .evaluateAll((els) => els.map((e) => e.dataset.ver)),
            items,
          );
          for (const id of items) {
            await p.click("[data-ver=" + id + "]");
            assert.equal(await p.evaluate(() => SIAB.state.verTab), id);
            assert.ok(
              (await p.locator("#ver-conteudo").innerText()).length > 10,
            );
          }
          await shot("painel-" + family);
        }
        await p.click("[data-ver-family=observar]");
        await p.keyboard.press("ArrowRight");
        assert.equal(
          await p.evaluate(() => document.activeElement.id),
          "family-medir",
        );
        await p.keyboard.press("End");
        assert.equal(
          await p.evaluate(() => document.activeElement.id),
          "family-analisar",
        );
      });
      await test("Histórico cronológico é diferente da tabela; compactação reversível e CSV bruto", async () => {
        await p.evaluate(() => {
          for (let i = 0; i < 28; i++)
            SIAB.instrumentos.medir(SIAB.current(), "fita");
          SIAB.selecionarVer("historico");
        });
        assert.equal(
          await p.locator("#ver-conteudo .experiment-timeline").count(),
          1,
        );
        assert.equal(await p.locator("#ver-conteudo table").count(), 0);
        const raw = await p.evaluate(() =>
          SIAB.instrumentos.raw(SIAB.current()),
        );
        await p.evaluate(() => SIAB.selecionarVer("tabela"));
        await p.click("[data-measurement-table=compact]");
        await shot("tabela-compactada");
        const n = await p.locator(".measurement-group summary").count();
        assert.ok(n > 0);
        await p.locator(".measurement-group summary").first().click();
        assert.ok((await p.locator(".measurement-group[open] li").count()) > 1);
        await shot("tabela-expandida");
        await p.click("[data-measurement-table=complete]");
        assert.equal(
          await p.locator("#ver-conteudo tbody tr").count(),
          raw.length,
        );
        assert.deepEqual(
          await p.evaluate(() => SIAB.instrumentos.raw(SIAB.current())),
          raw,
        );
        const csv = await p.evaluate(() => SIAB.historyCSV(SIAB.current()));
        assert.equal(csv.trim().split("\n").length, raw.length + 1);
      });
      await test("PDF compactado preserva faixa, contagem e dados brutos", async () => {
        const before = await p.evaluate(() =>
          JSON.stringify(SIAB.instrumentos.raw(SIAB.current())),
        );
        await p.evaluate(() => SIAB.irPara("#/relatorio"));
        await p.waitForSelector("[data-report-field=observacoes]");
        await p.evaluate(() => {
          window.print = () => {};
          SIAB.relatorios.imprimir(false);
        });
        assert.match(await p.locator("#folha-impressao").textContent(), /28/);
        assert.equal(
          await p.locator("#folha-impressao .measurement-table").count(),
          1,
        );
        assert.equal(
          await p.evaluate(() =>
            JSON.stringify(SIAB.instrumentos.raw(SIAB.current())),
          ),
          before,
        );
        if (engine === "chromium")
          await p.pdf({
            path: path.join(out, "rc2-relatorio-compactado.pdf"),
            format: "A4",
            printBackground: true,
          });
        await p.evaluate(() => SIAB.atividades.retomar());
      });
      await test("Gráfico não conecta preparos nem deriva através de troca de técnica", async () => {
        const counts = await p.evaluate(() => {
          const t = JSON.parse(JSON.stringify(SIAB.current())),
            template = SIAB.instrumentos
              .raw(t)
              .find((x) => x.tecnica === "fita");
          t.observacao.rawMeasurements = [
            { ...template, valor: 4, adicionado: 0 },
            { ...template, valor: 5, adicionado: 1 },
            {
              ...template,
              valor: 10,
              adicionado: 2,
              context: { ...template.context, solucao: "naoh" },
            },
            {
              ...template,
              valor: 11,
              adicionado: 3,
              context: { ...template.context, solucao: "naoh" },
            },
          ];
          const d = document.createElement("div");
          d.innerHTML = SIAB.graficoMedido(t);
          const n = d.querySelectorAll("polyline").length;
          d.innerHTML = SIAB.graficoMedido(t, true);
          return [n, d.querySelectorAll("circle").length];
        });
        assert.deepEqual(counts, [2, 2]);
      });
      await test("Painel sem função desaparece e não reabre Partículas", async () => {
        await start({
          tipo: "roteiro",
          item: "cotidiano",
          modulo: "explorar",
          permissions: {
            measurements: { indicator: true },
            representations: {},
            analysis: {},
          },
          verAccess: { observar: [], medir: [], analisar: [] },
        });
        assert.equal(await p.locator("#ver-panel").isVisible(), false);
        assert.equal(
          await p.evaluate(() => SIAB.selecionarVer("particulas")),
          false,
        );
        assert.equal(await p.evaluate(() => SIAB.state.verTab), null);
      });
      await test("Permissão parcial: temperatura editável, solução e preparo bloqueados", async () => {
        await start({
          tipo: "missao",
          item: "temperatura",
          modulo: "calcular",
          permissions: {
            measurements: { temperature: true },
            representations: { equations: true },
            analysis: {},
            bench: { changeTemperature: true },
          },
          initialView: "temperatura",
        });
        await p.fill("#temperatura-form input", "50");
        await p.click("#temperatura-form button");
        assert.equal(await p.evaluate(() => SIAB.current().temperature), 50);
        assert.equal(await p.locator("#painel-laboratorio").isVisible(), false);
        await p.reload();
        await p.waitForFunction(() => SIAB.rota.nome === "missao");
        assert.equal(await p.evaluate(() => SIAB.current().temperature), 50);
      });
      await test("Semirrestrita: volume e vidro do recipiente são liberados separadamente", async () => {
        await start({
          permissions: {
            measurements: { phStrip: true },
            representations: {},
            analysis: {},
            vessels: { changeVolume: true, changeGlassware: true },
          },
        });
        const solution = await p.evaluate(() => SIAB.current().solution);
        await p.evaluate(() => {
          SIAB.syncForm();
          SIAB.$("initial-volume").value = "2";
          SIAB.bancada.aplicarMedidas({ preventDefault() {} });
        });
        assert.equal(await p.evaluate(() => SIAB.current().initialVolume), 2);
        assert.equal(
          await p.locator("#concentration-field").isVisible(),
          false,
        );
        await p.evaluate(() => SIAB.bancada.trocarVidraria("bequer"));
        assert.equal(await p.evaluate(() => SIAB.current().vidraria), "bequer");
        assert.equal(await p.evaluate(() => SIAB.state.vidraria), "tubo");
        await p.evaluate(() => SIAB.bancada.trocarVidraria("tubo"));
        assert.equal(await p.evaluate(() => SIAB.current().vidraria), "tubo");
        assert.equal(await p.evaluate(() => SIAB.current().solution), solution);
      });
      await test("Relatório pHmetro contém leituras estabilizadas e gráfico medido", async () => {
        await start({
          permissions: {
            measurements: { phMeter: true },
            representations: {},
            analysis: { graph: true, table: true },
          },
        });
        for (let i = 0; i < 2; i++) {
          await p.evaluate(() =>
            SIAB.instrumentos.medir(SIAB.current(), "phmetro"),
          );
          await p.waitForTimeout(600);
          if (i === 0) await p.click("#drop-btn");
        }
        await p.evaluate(() => SIAB.irPara("#/relatorio"));
        await p.waitForSelector("[data-report-field=observacoes]");
        assert.match(
          await p.locator("#relatorio-conteudo").innerText(),
          /pHmetro/,
        );
        assert.equal(
          await p.locator("#relatorio-conteudo .grafico-medido").count(),
          1,
        );
        await shot("relatorio-phmetro");
        await p.evaluate(() => {
          window.print = () => {};
          SIAB.relatorios.imprimir(false);
        });
        if (engine === "chromium")
          await p.pdf({
            path: path.join(out, "rc2-relatorio-phmetro.pdf"),
            format: "A4",
            printBackground: true,
          });
      });
      await test("Matriz de telas: atividade e painéis 320–1920 px, sem overflow", async () => {
        await start({ permissions: all });
        for (const [width, height] of [
          [320, 740],
          [360, 800],
          [390, 844],
          [414, 896],
          [768, 1024],
          [1024, 768],
          [1366, 768],
          [1920, 1080],
        ]) {
          await p.setViewportSize({ width, height });
          await p.waitForTimeout(60);
          assert.ok(
            await p.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
            "overflow " + width,
          );
          if (width < 768) {
            assert.ok(
              await p
                .locator(".app-header")
                .evaluate((el) => el.getBoundingClientRect().height < 100),
              "cabeçalho cresce após redimensionar",
            );
            await p.evaluate(() => SIAB.workspace.open("left"));
            assert.equal(
              await p.locator("#activity-montagem").isVisible(),
              true,
            );
            await p.click("#close-controls");
            await p.evaluate(() => SIAB.workspace.open("right"));
          }
          for (const id of ["ph", "especies", "tabela"]) {
            await p.evaluate((id) => SIAB.workspace.open("right", id), id);
            assert.ok(
              await p.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth + 1,
              ),
              "painel " + width + " " + id,
            );
          }
          if (width === 390 && engine === "chromium")
            await p.screenshot({
              path: path.join(out, "rc2-aluno-mobile.png"),
            });
        }
        await p.setViewportSize({ width: 1366, height: 900 });
      });
      await test("Acessibilidade automática: atividade, Professor, contraste e teclado", async () => {
        for (const target of ["atividade", "professor"]) {
          if (target === "professor") await free();
          const issues = (
            await new AxeBuilder({ page: p })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze()
          ).violations;
          assert.deepEqual(
            issues.map((v) => ({
              id: v.id,
              impact: v.impact,
              nodes: v.nodes.map((n) => n.target),
            })),
            [],
          );
        }
        await start({ permissions: all });
        await p.evaluate(
          () => (document.documentElement.dataset.contrast = "on"),
        );
        await shot("alto-contraste");
        for (const mode of ["contrast", "light"]) {
          if (mode === "light")
            await p.evaluate(() => {
              document.documentElement.dataset.contrast = "off";
              document.documentElement.dataset.theme = "light";
            });
          const violations = (
            await new AxeBuilder({ page: p })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze()
          ).violations;
          assert.deepEqual(
            violations.map((v) => ({
              id: v.id,
              nodes: v.nodes.map((n) => n.target),
            })),
            [],
            mode,
          );
        }
        await shot("tema-claro");
        await p.evaluate(
          () => (document.documentElement.dataset.theme = "dark"),
        );
        await p.evaluate(
          () => delete document.documentElement.dataset.contrast,
        );
        await p.keyboard.press("Tab");
        assert.ok(
          await p.evaluate(() => document.activeElement !== document.body),
        );
      });
      await test("button-style-contract: botões visíveis têm classe visual reconhecida", async () => {
        const failures = [];
        async function audit(where) {
          const bad = await p.locator("button:visible").evaluateAll((els) =>
            els
              .filter(
                (b) =>
                  ![...b.classList].some((c) =>
                    [
                      "primary-btn",
                      "secondary-btn",
                      "quiet-btn",
                      "danger-btn",
                      "tab-btn",
                      "inline-btn",
                      "chemical-token-btn",
                      "tube-item-btn",
                      "view-tab-btn",
                      "icon-btn",
                      "header-btn",
                      "trilho-btn",
                      "chip",
                      "bottle",
                      "especie-btn",
                      "eq-especie",
                      "dropper-btn",
                      "tube-card",
                      "notebook-tab",
                      "drawer-close",
                      "mobile-study-tab",
                      "select-trigger",
                      "select-option",
                      "inicio-escolha",
                      "menu-btn",
                      "recolher-btn",
                      "agitar-btn",
                      "lupa-escala",
                      "themed-select",
                      "modulo-cab",
                      "menu-frasco-cab",
                    ].includes(c),
                  ),
              )
              .map((b) => ({
                id: b.id,
                classes: b.className,
                text: b.textContent.trim().slice(0, 60),
              })),
          );
          if (bad.length) failures.push({ where, bad });
        }
        await start({ permissions: all });
        for (const id of [
          "ph",
          "particulas",
          "especies",
          "equacao",
          "proton",
          "temperatura",
          "condutividade",
          "tabela",
        ]) {
          await p.evaluate((id) => SIAB.workspace.open("right", id), id);
          await audit(id);
        }
        for (const route of [
          "inicio",
          "professor",
          "laboratorio",
          "missoes",
          "aprender",
          "roteiros",
          "caderno",
          "manual",
        ]) {
          await free(route);
          await audit(route);
        }
        assert.deepEqual(failures, []);
      });
      await test("Sem erros de execução na RC.2", async () =>
        assert.deepEqual(entry.errors, []));
      await ctx.close();
      await browser.close();
    }
  } finally {
    server.close();
    fs.writeFileSync(
      path.join(out, "rc2.json"),
      JSON.stringify(results, null, 2),
    );
  }
  if (results.engines.some((e) => e.cases.some((c) => c.status === "Falha")))
    process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
