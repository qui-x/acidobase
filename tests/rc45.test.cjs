/* RC.4.5: fluxos reais, contratos visuais e documentos. Sem alterar química. */
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path");
const pw = require(process.env.SIAB_PLAYWRIGHT_MODULE || "playwright");
const out = path.join(__dirname, "results");
const result = {
  version: "1.0.0-rc.5",
  date: new Date().toISOString(),
  engines: [],
};
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
      const context = await browser.newContext({
        viewport: { width: 1366, height: 768 },
        reducedMotion: "reduce",
      });
      await context.addInitScript(() => {
        localStorage.setItem("siab_abertura", "off");
        localStorage.setItem("siab_inicializacao", '"inicio"');
      });
      const p = await context.newPage();
      p.setDefaultTimeout(7000);
      const entry = {
        engine,
        version: browser.version(),
        cases: [],
        errors: [],
        geometry: [],
      };
      result.engines.push(entry);
      p.on("pageerror", (e) => entry.errors.push(e.message));
      async function test(name, fn) {
        try {
          await fn();
          entry.cases.push({ name, status: "OK" });
          console.log(engine, "OK", name);
        } catch (e) {
          entry.cases.push({ name, status: "Falha", error: e.stack });
          console.log(engine, "FAIL", name, e.message);
        }
      }
      async function route(name) {
        await p.evaluate((name) => SIAB.irPara("#/" + name), name);
        await p.waitForFunction(
          (name) => SIAB.rota.nome === name.split("/")[0],
          name,
        );
      }
      async function shot(name, fullPage = false) {
        if (engine === "chromium")
          await p.screenshot({
            path: path.join(out, "rc45-" + name + ".png"),
            fullPage,
            animations: "disabled",
          });
      }
      const choose = async (selector, value) => {
        await p.locator(selector).selectOption(value);
      };
      await p.goto(url + "/#/laboratorio");
      await p.waitForFunction(
        () => document.documentElement.dataset.appPronto === "true",
      );
      await test("Nova bancada vazia e newTube genérico sem HCl", async () => {
        assert.deepEqual(
          await p.evaluate(() => [
            SIAB.state.tubes.length,
            SIAB.TUBE_DEFAULTS.solution,
          ]),
          [0, "water"],
        );
        assert.equal(await p.evaluate(() => SIAB.newTube().solution), "water");
      });
      await test("HCl escolhido é preservado na restauração de sessão", async () => {
        await p.evaluate(() => {
          SIAB.newTube({ solution: "hcl", name: "HCl deliberado" });
          SIAB.atividades.salvarSessao();
        });
        await p.reload();
        await p.waitForFunction(
          () => document.documentElement.dataset.appPronto === "true",
        );
        assert.equal(
          await p.evaluate(() => SIAB.state.tubes.at(-1).solution),
          "hcl",
        );
      });
      await test("Montagens prontas leva ao catálogo e respeita visualização", async () => {
        await p.evaluate(() => {
          SIAB.benches.lab = SIAB.criarBancada();
          SIAB.usarBancada("lab");
          SIAB.render(true);
        });
        await p.locator("#bancada-vazia a").click();
        await p.waitForFunction(() => SIAB.rota.nome === "montagens");
        assert.equal(await p.evaluate(() => SIAB.rota.nome), "montagens");
        await p.locator('[data-montagem="titulacao-forte"]').click();
        await p.waitForFunction(() => SIAB.rota.nome === "laboratorio");
        assert.equal(await p.evaluate(() => SIAB.state.verTab), "grafico");
        const setups = await p.evaluate(() =>
          SIAB.montagens.map((m) => ({ id: m.id, ver: m.ver })),
        );
        for (const m of setups) {
          await p.evaluate((id) => SIAB.montarMontagem(id), m.id);
          assert.equal(await p.evaluate(() => SIAB.state.verTab), m.ver);
        }
      });
      await test("Comparar indicadores reutiliza montagem e arco-íris não escreve no Caderno", async () => {
        const notes = await p.evaluate(
          () => SIAB.progresso.dados.caderno.length,
        );
        await p.locator("#compare-btn").evaluate((el) => el.click());
        assert.equal(
          await p.evaluate(() => SIAB.state.montagem.id),
          "tres-indicadores",
        );
        await p.evaluate(() => SIAB.montarMontagem("arco-iris-ph"));
        assert.equal(await p.evaluate(() => SIAB.state.tubes.length), 7);
        assert.equal(
          await p.evaluate(() => SIAB.progresso.dados.caderno.length),
          notes,
        );
      });
      let removedToken, originalId;
      await test("Professor cria, duplica com novo ID e permite edição independente", async () => {
        await route("professor");
        await p.fill('[name="titulo"]', "Atividade original");
        await p.locator('#prof-form [type="submit"]').click();
        await p.waitForFunction(
          () =>
            SIAB.persistencia.ler("siab_atividades_criadas", []).length === 1,
        );
        originalId = await p.evaluate(
          () => SIAB.persistencia.ler("siab_atividades_criadas", [])[0].id,
        );
        await p.locator("[data-duplicate-activity]").click();
        await p.waitForFunction(
          () =>
            SIAB.persistencia.ler("siab_atividades_criadas", []).length === 2,
        );
        const records = await p.evaluate(() =>
          SIAB.persistencia.ler("siab_atividades_criadas", []),
        );
        assert.notEqual(records[0].id, records[1].id);
        assert.equal(records[0].config.titulo, "Cópia de Atividade original");
        await p.locator("[data-edit-activity]").first().click();
        await p.fill('[name="titulo"]', "Cópia editada");
        await p.locator('#prof-form [type="submit"]').click();
        await p.waitForFunction(
          () =>
            SIAB.persistencia.ler("siab_atividades_criadas", [])[0].config
              .titulo === "Cópia editada",
        );
        assert.equal(
          await p.evaluate(
            () =>
              SIAB.persistencia.ler("siab_atividades_criadas", [])[1].config
                .titulo,
          ),
          "Atividade original",
        );
        removedToken = records[0].token;
        await shot("professor", true);
      });
      await test("Excluir: cancelar preserva; confirmar persiste após reload; link é autocontido", async () => {
        const id = await p
          .locator("[data-delete-activity]")
          .first()
          .getAttribute("data-delete-activity");
        await p.locator("[data-delete-activity]").first().click();
        assert.equal(
          await p.locator("#confirm-title").textContent(),
          "Excluir atividade?",
        );
        await p
          .locator('#confirm-dialog [data-close="confirm-dialog"]')
          .last()
          .click();
        assert.equal(await p.locator("[data-delete-activity]").count(), 2);
        await p.locator("[data-delete-activity]").first().click();
        await p.click("#confirm-yes");
        assert.equal(await p.locator("[data-delete-activity]").count(), 1);
        await p.reload();
        await p.waitForFunction(
          () => document.documentElement.dataset.appPronto === "true",
        );
        assert.equal(
          await p.evaluate(
            (id) =>
              SIAB.persistencia
                .ler("siab_atividades_criadas", [])
                .some((x) => x.id === id),
            id,
          ),
          false,
        );
        const cfg = await p.evaluate(
          (t) => SIAB.atividades.decodificar(t),
          removedToken,
        );
        assert.equal(cfg.titulo, "Cópia de Atividade original");
        await p.locator("[data-duplicate-activity]").click();
        await p.waitForFunction(
          () =>
            SIAB.persistencia.ler("siab_atividades_criadas", []).length === 2,
        );
        const nextId = await p.evaluate(
          () => SIAB.persistencia.ler("siab_atividades_criadas", [])[0].id,
        );
        assert.notEqual(nextId, id);
        assert.notEqual(nextId, originalId);
      });
      await test("Apagar nota exige confirmação e utiliza danger-btn", async () => {
        await p.evaluate(() =>
          SIAB.progresso.anotar({
            tipo: "anotacao",
            titulo: "Nota a preservar",
            linhas: [["Hipótese", "Exemplo"]],
          }),
        );
        await route("caderno");
        assert.equal(
          await p.locator("[data-apagar-nota]").getAttribute("class"),
          "danger-btn",
        );
        await p.locator("[data-apagar-nota]").click();
        await p
          .locator('#confirm-dialog [data-close="confirm-dialog"]')
          .last()
          .click();
        assert.equal(await p.locator("[data-apagar-nota]").count(), 1);
        await p.locator("[data-apagar-nota]").click();
        await p.click("#confirm-yes");
        assert.equal(await p.locator("[data-apagar-nota]").count(), 0);
      });
      await test("Relatório preserva concentrações declaradas e composição de misturas", async () => {
        const x = await p.evaluate(() => {
          SIAB.benches.lab = SIAB.criarBancada(); SIAB.usarBancada("lab");
          SIAB.newTube({solution:"hcl",concentration:.01,dilution:100,titrant:"naoh",titrantConcentration:.01,titrantDilution:5});
          SIAB.state.activeId=SIAB.state.tubes[0].id;
          const a=SIAB.relatorios.capturar().recipientes[0];
          const t=SIAB.current(); t.componentes=[{id:"hcl",concentration:.1,volume:1,dilution:1},{id:"naoh",concentration:.1,volume:2,dilution:1}];
          t.observacao=null;SIAB.instrumentos.atualizar();
          const b=SIAB.relatorios.capturar().recipientes[0];
          return {initial:a.inicial.concentracao,reagent:a.reagente.descricao,mix:b.inicial};
        });
        assert.equal(x.initial,"0,0100 mol/L");assert.equal(x.reagent,"0,0100 mol/L");
        assert.equal(x.mix.volume,3);assert.match(x.mix.concentracao,/0,1000 mol\/L em 1,00 mL/);assert.match(x.mix.concentracao,/0,1000 mol\/L em 2,00 mL/);
      });
      await test("Experimento gera condições iniciais, medições, gráficos e condições finais", async () => {
        await p.evaluate(() => {
          SIAB.montarMontagem("titulacao-fraco");
          SIAB.state.level = "calcular";
          SIAB.instrumentos.medir(SIAB.current(), "fita");
          SIAB.instrumentos.medir(SIAB.current(), "condutividade");
          SIAB.instrumentos.medir(SIAB.current(), "temperatura");
        });
        await p.evaluate(() => {
          SIAB.alterar("Adicionar uma gota", () =>
            SIAB.current().additions.push(0.05),
          );
          SIAB.instrumentos.medir(SIAB.current(), "fita");
          SIAB.instrumentos.medir(SIAB.current(), "condutividade");
          for (const v of [
            "distribuicao",
            "derivada",
            "condutividade",
            "historico",
          ])
            SIAB.selecionarVer(v);
        });
        assert.equal(
          await p.locator("#ver-conteudo .experiment-timeline").count(),
          1,
        );
        await route("relatorio");
        const report = await p.evaluate(() => SIAB.relatorios.atual),
          tube = report.recipientes[0];
        assert.equal(tube.inicial.volume, 1);
        assert.equal(tube.volume, 1.05);
        assert.equal(tube.inicial.vidraria, "Tubo de ensaio");
        assert.ok(tube.rawMeasurements.length >= 5);
        assert.ok(tube.grafico.includes("<svg"));
        assert.ok(tube.distribuicao.includes("<svg"));
        assert.ok(tube.graficoCondutividade.includes("<svg"));
        assert.equal(
          await p.locator(".digital-report .experiment-timeline").count(),
          0,
        );
        assert.ok((await p.locator(".digital-report table").count()) >= 4);
        await p.fill(
          '[data-report-field="observacoes"]',
          "Texto autoral OBSERVADO",
        );
        await p.fill('[data-report-field="analise"]', "Análise AUTORAL");
        await p.fill('[data-report-field="conclusao"]', "Conclusão AUTORAL");
        await shot("relatorio-completo", true);
      });
      await test("Para preencher à mão mantém ciência e apaga só texto autoral", async () => {
        const raw = await p.evaluate(() =>
          JSON.stringify(SIAB.relatorios.atual.recipientes[0].rawMeasurements),
        );
        await choose("#report-mode", "mao");
        const text = await p.locator(".digital-report").textContent();
        assert.ok(!text.includes("AUTORAL"));
        assert.ok(!text.includes("OBSERVADO"));
        assert.ok(text.includes("Ácido acético"));
        assert.equal(await p.locator(".writing-space").count(), 5);
        assert.equal(await p.locator(".response-line").count(), 50);
        assert.ok((await p.locator(".digital-report svg").count()) >= 3);
        assert.equal(
          await p.evaluate(() =>
            JSON.stringify(
              SIAB.relatorios.atual.recipientes[0].rawMeasurements,
            ),
          ),
          raw,
        );
        await shot("relatorio-mao", true);
      });
      for (const n of [5, 10, 15, 20, 25])
        await test("Linhas configuráveis: " + n, async () => {
          await choose("#report-lines", String(n));
          assert.equal(await p.locator(".response-line").count(), 5 * n);
        });
      await test("Linhas personalizadas, limites e configuração independente por campo", async () => {
        await choose("#report-lines", "custom");
        await p.fill("#report-custom-lines", "27");
        await p.locator("#report-custom-lines").dispatchEvent("change");
        assert.equal(await p.locator(".response-line").count(), 135);
        await p.locator(".report-settings summary").click();
        await p.fill('[data-lines-field="analise"]', "15");
        await p.locator('[data-lines-field="analise"]').dispatchEvent("change");
        assert.equal(
          await p
            .locator('[data-writing-field="analise"] .response-line')
            .count(),
          15,
        );
        const limits = await p.evaluate(() => {
          SIAB.relatorios.configure({ linhas: 1 });
          const min = SIAB.relatorios.atual.configuracao.linhas;
          SIAB.relatorios.configure({ linhas: 999 });
          return [min, SIAB.relatorios.atual.configuracao.linhas];
        });
        assert.deepEqual(limits, [5, 60]);
        await p.evaluate(() => {
          SIAB.relatorios.configure({ linhas: 25, porCampo: {} });
          SIAB.relatorios.render();
        });
      });
      await test("Impressão: campos 25+ linhas continuam entre páginas, sem controles", async () => {
        await p.evaluate(() => {
          window.print = () => {};
          SIAB.relatorios.imprimir(true);
        });
        await p.emulateMedia({ media: "print" });
        assert.equal(await p.locator("#relatorio-config").isVisible(), false);
        assert.equal(await p.locator(".bottom-nav").isVisible(), false);
        assert.equal(
          await p.locator("#folha-impressao .response-line").count(),
          125,
        );
        const css = await p
          .locator("#folha-impressao .writing-space")
          .first()
          .evaluate((el) => getComputedStyle(el).breakInside);
        assert.equal(css, "auto");
        if (engine === "chromium")
          await p.pdf({
            path: path.join(out, "rc45-relatorio-25-linhas.pdf"),
            format: "A4",
            printBackground: true,
          });
        await p.emulateMedia({ media: "screen" });
        // window.print foi substituído acima; simule também o encerramento
        // do diálogo. Só Chromium dispara afterprint ao gerar o PDF.
        await p.evaluate(() => window.dispatchEvent(new Event("afterprint")));
        assert.equal(await p.locator("#folha-impressao > *").count(), 0);
      });
      await test("Atividade de análise seleciona dados e campos em branco sem alterar originais", async () => {
        await choose("#report-mode", "analise");
        await p.locator('[data-report-include="dados"]').uncheck();
        await p.locator('[data-report-include="finais"]').uncheck();
        await p.locator('[data-report-blank="observacoes"]').uncheck();
        assert.equal(
          await p.locator('[data-report-section="finais"]').count(),
          0,
        );
        assert.equal(
          await p.locator('[data-writing-field="analise"]').count(),
          1,
        );
        assert.equal(
          await p.locator('[data-writing-field="conclusao"]').count(),
          1,
        );
        assert.ok(
          (await p.locator(".digital-report").textContent()).includes(
            "OBSERVADO",
          ),
        );
        assert.ok((await p.locator(".digital-report table").count()) >= 3);
        assert.ok((await p.locator(".digital-report svg").count()) >= 3);
        await p.fill(
          '[data-report-setting="proposta"]',
          "Compare as evidências e justifique sua interpretação.",
        );
        await p
          .locator('[data-report-setting="proposta"]')
          .dispatchEvent("change");
        await shot("relatorio-analise", true);
      });
      await test("Dados hipotéticos identificados, validados e separados das medições", async () => {
        const raw = await p.evaluate(() =>
          JSON.stringify(SIAB.relatorios.atual.recipientes),
        );
        await choose("#report-source", "hipoteticos");
        await p.fill(
          "#report-hypotheses",
          "0;2;25;1200\n0,5;3;25;900\n1;7;25;600",
        );
        await p.click("#report-use-hypotheses");
        assert.match(
          await p.locator(".digital-report").textContent(),
          /Dados hipotéticos fornecidos pelo professor/,
        );
        assert.equal(await p.locator(".digital-report circle").count(), 6);
        assert.equal(
          await p.evaluate(() =>
            JSON.stringify(SIAB.relatorios.atual.recipientes),
          ),
          raw,
        );
        await p.fill("#report-hypotheses", "0;99;25;1200");
        await p.click("#report-use-hypotheses");
        assert.match(
          await p.locator("#report-hypotheses-error").textContent(),
          /fora dos limites/,
        );
        await p.evaluate(() => {
          SIAB.relatorios.configure({ fonte: "bancada", modo: "completo" });
          SIAB.relatorios.render();
        });
      });
      await test("Menu: seis grupos, contexto de bancada, roteiro e Manual", async () => {
        await route("laboratorio");
        await p.click("#menu-btn");
        assert.match(
          await p.locator("#drawer-now-detail").textContent(),
          /Calcular/,
        );
        assert.equal(await p.locator("#drawer-navigation").isVisible(), false);
        const text = await p.locator("#app-drawer").textContent();
        for (const name of [
          "Agora",
          "Navegar",
          "Recursos",
          "Professor",
          "Preferências",
          "Aplicativo",
        ])
          assert.ok(text.includes(name));
        await shot("menu-desktop");
        await p.click("#drawer-continue");
        await route("roteiro/titulacao-forte");
        await p.click("#menu-btn");
        assert.match(
          await p.locator("#drawer-now-detail").textContent(),
          /Roteiro Experimental/,
        );
        await p.click("#drawer-continue");
        assert.equal(
          await p
            .locator("#roteiro-conteudo")
            .getByRole("heading", { name: "Pergunta central", exact: true })
            .count(),
          0,
        );
        await route("manual/phmetro");
        await p.click("#menu-btn");
        assert.match(
          await p.locator("#drawer-now-detail").textContent(),
          /pHmetro/,
        );
        await p.click("#drawer-continue");
      });
      await test("Biblioteca SVG reutilizada em cards, menu, bottom nav e Manual", async () => {
        await route("inicio");
        const icons = await p.evaluate(() =>
          [
            ...document.querySelectorAll(
              '.caminho-laboratorio [data-icon="lab"], #drawer-navigation [data-icon="lab"], .bottom-nav [data-icon="lab"]',
            ),
          ].map((el) => el.querySelector("path").getAttribute("d")),
        );
        assert.equal(icons.length, 3);
        assert.equal(new Set(icons).size, 1);
        assert.equal(await p.locator(".header-notebook").count(), 0);
        assert.notEqual(
          await p.evaluate(() => SIAB.icons.svg("notebook")),
          await p.evaluate(() => SIAB.icons.svg("manual")),
        );
        assert.notEqual(
          await p.evaluate(() => SIAB.icons.svg("protocol")),
          await p.evaluate(() => SIAB.icons.svg("manual")),
        );
      });
      const views = [
        [320, 568],
        [360, 800],
        [390, 844],
        [414, 896],
        [768, 1024],
        [1024, 768],
        [1280, 720],
        [1366, 768],
        [1440, 900],
        [1920, 1080],
      ];
      for (const [w, h] of views)
        await test(`Viewport ${w}×${h}: menu, quiet, danger e relatório sem overflow`, async () => {
          await p.setViewportSize({ width: w, height: h });
          await route("professor");
          const boxes = await p
            .locator("#atividades-recentes button")
            .evaluateAll((els) =>
              els.map((el) => {
                const r = el.getBoundingClientRect(),
                  s = getComputedStyle(el);
                return {
                  text: el.textContent,
                  width: r.width,
                  height: r.height,
                  left: r.left,
                  right: r.right,
                  decoration: s.textDecorationLine,
                  border: s.borderTopWidth,
                };
              }),
            );
          assert.ok(boxes.length);
          for (const b of boxes) {
            assert.ok(b.height >= 43.9);
            assert.ok(b.left >= -1 && b.right <= w + 1);
            assert.equal(b.decoration, "none");
            assert.notEqual(b.border, "0px");
          }
          entry.geometry.push({ viewport: [w, h], buttons: boxes });
          await p.click("#menu-btn");
          assert.equal(await p.locator("#app-drawer").isVisible(), true);
          const rect = await p.locator("#app-drawer").boundingBox();
          assert.ok(rect.x >= -1 && rect.x + rect.width <= w + 1);
          await shot("menu-" + w);
          await p.click("#drawer-continue");
          await route("relatorio");
          const reportLayout = await p.evaluate(() => ({
            viewport: innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            overflow: [...document.querySelectorAll(".digital-report *")]
              .filter((el) => {
                const b = el.getBoundingClientRect();
                return b.width && b.right > innerWidth + 1;
              })
              .slice(0, 8)
              .map((el) => ({
                tag: el.tagName,
                class: el.className,
                right: el.getBoundingClientRect().right,
              })),
          }));
          assert.ok(
            reportLayout.scrollWidth <= reportLayout.viewport + 1,
            JSON.stringify(reportLayout),
          );
        });
      await p.setViewportSize({ width: 390, height: 844 });
      for (const theme of ["light", "dark", "contrast", "cvd"])
        await test(
          "Tema " + theme + ": contraste de controles e navegação",
          async () => {
            await p.evaluate((theme) => {
              A11Y.definir("theme", theme === "light" ? "light" : "dark");
              A11Y.definir("contrast", theme === "contrast");
              A11Y.definir(
                "colorblind",
                theme === "cvd" ? "deuteranopia" : "none",
              );
            }, theme);
            await route("professor");
            await p.click("#menu-btn");
            await shot("tema-" + theme);
            await p.click("#drawer-continue");
            assert.ok(
              await p.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth + 1,
              ),
            );
          },
        );
      await test("Menu de atividade restrita bloqueia destinos e modo professor", async () => {
        const token = await p.evaluate(() =>
          SIAB.atividades.codificar({
            schema: 2,
            tipo: "roteiro",
            item: "titulacao-forte",
            titulo: "Turma restrita",
            modulo: "medir",
            temperatura: 25,
            instrumentos: ["fita"],
            navegacao: "restrita",
            relatorio: "digital",
            identificacao: {},
          }),
        );
        await p.goto(url + "/#/atividade/" + token);
        await p.waitForSelector("#atividade-iniciar button");
        await p.locator("#atividade-iniciar button").click();
        await p.waitForFunction(
          () => SIAB.ActivityContext.current?.stage === "bancada",
        );
        await p.click("#menu-btn");
        assert.match(
          await p.locator("#drawer-activity-context").textContent(),
          /Turma restrita/,
        );
        const links = await p.locator("#app-drawer a:visible").count();
        assert.equal(links, 0);
        assert.equal(await p.locator("#drawer-projector").isVisible(), false);
        await shot("menu-restrito");
        await p.locator("#app-drawer [data-activity-report]").click();
        await p.waitForSelector("#report-mode");
        assert.equal(
          await p.locator('#report-mode option[value="analise"]').count(),
          0,
        );
        assert.equal(
          await p.evaluate(() =>
            SIAB.relatorios.configure({ modo: "analise" }),
          ),
          false,
        );
        await p.evaluate(() => SIAB.irPara("#/montagens"));
        assert.notEqual(await p.evaluate(() => SIAB.rota.nome), "montagens");
      });
      await test("Nenhum erro JavaScript", async () =>
        assert.deepEqual(entry.errors, []));
      await browser.close();
    }
  } finally {
    server.close();
    fs.writeFileSync(
      path.join(out, "rc45.json"),
      JSON.stringify(result, null, 2),
    );
  }
  if (
    result.engines.some(
      (e) => e.errors.length || e.cases.some((c) => c.status !== "OK"),
    )
  )
    process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
