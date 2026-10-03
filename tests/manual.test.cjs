/* RC.4: contrato de conteúdo, consulta, foco, ajuda, permissões e distribuição. */
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  { pathToFileURL } = require("node:url");
const pw = require(process.env.SIAB_PLAYWRIGHT_MODULE || "playwright");
const Axe = require(
  process.env.SIAB_AXE_MODULE || "@axe-core/playwright",
).default;
const out = path.join(__dirname, "results"),
  result = {
    version: "1.0.0-rc.5",
    date: new Date().toISOString(),
    engines: [],
  };
(async () => {
  const service = await require("./server.cjs").start();
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
        hasTouch: true,
      });
      await ctx.addInitScript(() => {
        try {
          localStorage.setItem("siab_abertura", "off");
          localStorage.setItem("siab_inicializacao", '"inicio"');
        } catch (_) {}
      });
      const p = await ctx.newPage(),
        entry = {
          engine,
          version: browser.version(),
          cases: [],
          errors: [],
          geometry: [],
        };
      result.engines.push(entry);
      p.setDefaultTimeout(7000);
      p.on("pageerror", (e) => entry.errors.push(e.message));
      const ready = () =>
        p.waitForFunction(
          () => document.documentElement.dataset.appPronto === "true",
        );
      const settle = () =>
        p.evaluate(
          () =>
            new Promise((r) =>
              requestAnimationFrame(() => requestAnimationFrame(r)),
            ),
        );
      const go = async (id = "") => {
        await p.evaluate(
          (id) => SIAB.irPara("#/manual" + (id ? "/" + id : "")),
          id,
        );
        await p.waitForFunction(
          (id) =>
            SIAB.rota.nome === "manual" &&
            SIAB.rota.parametro === (SIAB.manualRegistry.aliases[id] || id),
          id,
        );
        await settle();
      };
      const shot = async (name) => {
        if (engine === "chromium")
          await p.screenshot({
            path: path.join(out, "rc4-" + name + ".png"),
            fullPage: true,
          });
      };
      const axe = async () => {
        const a = await new Axe({ page: p })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        assert.deepEqual(
          a.violations.map((x) => ({
            id: x.id,
            nodes: x.nodes.map((n) => n.target),
          })),
          [],
        );
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
                engine + "-manual-falha-" + entry.cases.length + ".png",
              ),
            })
            .catch(() => {});
        }
      }
      async function free() {
        await p.evaluate(() => SIAB.atividades.encerrar()).catch(() => {});
        await p.goto(service.url + "/#/laboratorio");
        await ready();
        await p.evaluate(() => {
          SIAB.benches.lab = SIAB.criarBancada();
          SIAB.usarBancada("lab");
          SIAB.bancada.colocar("hcl");
          SIAB.state.level = "calcular";
          SIAB.$("boas-vindas").hidden = true;
          SIAB.render(true);
          SIAB.workspace.close("left", false);
          SIAB.workspace.close("right", false);
        });
        await settle();
      }
      async function restricted() {
        await free();
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
        await p.waitForFunction(
          () =>
            SIAB.rota.nome === "laboratorio" &&
            SIAB.ActivityContext.restricted(),
        );
        await settle();
        return token;
      }
      await p.goto(service.url + "/#/manual");
      await ready();
      await test("Registro único: 52 tópicos, 13 categorias e destinos válidos", async () => {
        const audit = await p.evaluate(() => {
          const R = SIAB.manualRegistry,
            errors = [];
          const ids = R.topics.map((t) => t.id);
          if (new Set(ids).size !== ids.length) errors.push("id duplicado");
          for (const c of R.categories)
            if (!R.resolve(c.id)) errors.push("categoria " + c.id);
          for (const t of R.topics) {
            if (!R.category(t.category) || !t.summary || !t.steps.length)
              errors.push(t.id);
            for (const id of t.related)
              if (!R.resolve(id)) errors.push(t.id + " related " + id);
            for (const a of t.actions || [])
              if (
                a.route &&
                !SIAB.telas[a.route.replace("#/", "").split("/")[0]]
              )
                errors.push("route " + a.route);
            for (const m of JSON.stringify(t).matchAll(/\[\[([a-z0-9-]+)/g))
              if (!R.resolve(m[1])) errors.push("inline " + m[1]);
          }
          for (const id of Object.values(R.aliases))
            if (!R.resolve(id)) errors.push("alias " + id);
          return {
            topics: ids.length,
            categories: R.categories.length,
            errors,
          };
        });
        assert.deepEqual(audit, { topics: 52, categories: 13, errors: [] });
      });
      await test("Home temática, renderização sob demanda e controles de consulta", async () => {
        await go();
        assert.equal(await p.locator(".manual-category").count(), 13);
        assert.equal(await p.locator("[data-manual-topic]").count(), 0);
        assert.equal(await p.locator("#manual-conteudo table").count(), 0);
        assert.equal(await p.locator("#manual-print").textContent(), "");
        assert.ok(await p.locator("#manual-busca").isVisible());
        await axe();
        await shot("manual-home-dark");
        await p.evaluate(() => A11Y.definir("theme", "light"));
        await settle();
        await axe();
        await shot("manual-home-desktop");
        await p.evaluate(() => A11Y.definir("theme", "dark"));
      });
      await test("Busca: termos centrais, título, categoria e trecho", async () => {
        for (const [query, id] of [
          ["pH", "ph"],
          ["titulação", "titulacao"],
          ["fita", "fita"],
          ["condutividade", "condutividade"],
          ["montagem", "montagens"],
          ["relatório", "relatorios"],
        ]) {
          await p.locator("#manual-busca").fill(query);
          assert.ok(
            await p
              .locator('.manual-search-results a[href="#/manual/' + id + '"]')
              .count(),
          );
          assert.ok(
            (
              await p
                .locator(".manual-search-results li .eyebrow")
                .first()
                .textContent()
            ).length > 2,
          );
          assert.ok(
            (
              await p
                .locator(".manual-search-results li p")
                .first()
                .textContent()
            ).length > 15,
          );
          assert.match(
            await p.locator("#manual-status").textContent(),
            /tópicos? encontrado/,
          );
        }
        await shot("manual-busca");
        await axe();
      });
      await test("Busca: acentos, maiúsculas, plurais e sinônimos", async () => {
        const data = await p.evaluate(() => {
          const find = (q) => SIAB.manualRegistry.search(q).map((t) => t.id);
          return {
            a: find("TITULAÇÃO"),
            b: find("titulacao"),
            plural: find("titulações"),
            meter: find("medidor de pH"),
            strip: find("papel indicador"),
            reports: find("relatórios"),
          };
        });
        assert.deepEqual(data.a, data.b);
        assert.ok(data.plural.includes("titulacao"));
        assert.equal(data.meter[0], "phmetro");
        assert.equal(data.strip[0], "fita");
        assert.equal(data.reports[0], "relatorios");
      });
      await test("Busca vazia, sem resultados e entrada literal segura", async () => {
        await p.locator("#manual-busca").fill("zzzxxyyinexistente");
        assert.equal(
          await p.locator(".manual-search-results h1").textContent(),
          "Nenhum tópico encontrado",
        );
        assert.match(await p.locator("#manual-status").textContent(), /Nenhum/);
        await p
          .locator("#manual-busca")
          .fill('<img src=x onerror="window.manualInjected=1">');
        assert.equal(await p.evaluate(() => window.manualInjected), undefined);
        await p.locator("#manual-clear").click();
        assert.equal(await p.locator(".manual-category").count(), 13);
        assert.equal(
          await p.evaluate(() => document.activeElement.id),
          "manual-busca",
        );
      });
      await test("Busca por teclado e foco previsível ao abrir resultado", async () => {
        await p.locator("#manual-busca").fill("medidor de pH");
        await p.locator("#manual-busca").press("Enter");
        assert.equal(
          await p.evaluate(() => document.activeElement.id),
          "manual-titulo",
        );
        await p
          .locator('.manual-search-results a[href="#/manual/phmetro"]')
          .focus();
        await p.keyboard.press("Enter");
        await p.waitForFunction(() => SIAB.rota.parametro === "phmetro");
        assert.equal(
          await p.evaluate(() => document.activeElement.id),
          "manual-titulo",
        );
        await shot("manual-phmetro");
      });
      await test("Tópicos, bibliotecas e todos os links do Manual", async () => {
        const ids = await p.evaluate(() =>
          SIAB.manualRegistry.topics.map((t) => t.id),
        );
        for (const id of ids) {
          await go(id);
          assert.equal(
            await p.locator("#manual-conteudo [data-manual-topic]").count(),
            1,
          );
          assert.ok(
            (await p.locator("#manual-titulo").textContent()).length > 2,
          );
          const invalid = await p
            .locator('#manual-conteudo a[href^="#/manual/"]')
            .evaluateAll((as) =>
              as
                .map((a) =>
                  decodeURIComponent(
                    a.getAttribute("href").split("/").slice(2).join("/"),
                  ),
                )
                .filter((id) => !SIAB.manualRegistry.resolve(id)),
            );
          assert.deepEqual(invalid, []);
          if (id === "frascos")
            assert.equal(
              await p.locator("#manual-conteudo tbody tr").count(),
              140,
            );
        }
        assert.deepEqual(entry.errors, []);
      });
      await test("Links antigos e separação entre Roteiros e Montagens prontas", async () => {
        for (const id of [
          "layout",
          "leitura",
          "ver",
          "representacoes",
          "phmeter",
          "ph-strip",
        ])
          await go(id);
        await go("roteiros");
        assert.equal(
          await p.locator("[data-manual-topic=roteiros]").count(),
          1,
        );
        assert.equal(
          await p.locator('.manual-actions a[href="#/roteiros"]').count(),
          1,
        );
        await shot("manual-roteiros");
        await go("montagens");
        assert.equal(
          await p.locator('.manual-actions a[href="#/montagens"]').count(),
          1,
        );
        await shot("manual-montagens");
        await p.locator(".manual-actions a").click();
        await p.waitForFunction(() => SIAB.rota.nome === "montagens");
        assert.equal(await p.locator("[data-tela=manual]").isVisible(), false);
      });
      await test("Histórico Voltar/Avançar, breadcrumbs e rota desconhecida", async () => {
        await go("instrumentos");
        await p
          .locator(
            '#manual-conteudo .manual-topic-link[href="#/manual/phmetro"]',
          )
          .click();
        await p.waitForFunction(() => SIAB.rota.parametro === "phmetro");
        await p.goBack();
        await p.waitForFunction(() => SIAB.rota.parametro === "instrumentos");
        await p.goForward();
        await p.waitForFunction(() => SIAB.rota.parametro === "phmetro");
        await p
          .locator('.manual-breadcrumb a[href="#/manual/instrumentos"]')
          .click();
        await p.waitForFunction(() => SIAB.rota.parametro === "instrumentos");
        await go("nao-existe");
        assert.equal(
          await p.locator("#manual-titulo").textContent(),
          "Tópico não encontrado",
        );
        await p.locator(".manual-empty a").click();
        await p.waitForFunction(() => SIAB.rota.parametro === "");
      });
      await test("Acordeões com Enter, Espaço, estado ARIA e conteúdo acessível", async () => {
        await go("phmetro");
        const b = p.locator("[data-manual-expand]").first();
        await b.focus();
        await p.keyboard.press("Enter");
        assert.equal(await b.getAttribute("aria-expanded"), "true");
        assert.equal(
          await p
            .locator("#" + (await b.getAttribute("aria-controls")))
            .isVisible(),
          true,
        );
        await p.keyboard.press("Space");
        assert.equal(await b.getAttribute("aria-expanded"), "false");
        await p.keyboard.press("Tab");
        assert.equal(
          await p.evaluate(() => document.activeElement.id),
          "manual-toggle-phmetro-1",
        );
        await p.keyboard.press("Shift+Tab");
        assert.equal(
          await p.evaluate(() => document.activeElement.id),
          "manual-toggle-phmetro-0",
        );
      });
      for (const [width, height] of [
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
      ])
        await test(`Layout ${width}×${height}: home, tópico, índice e busca`, async () => {
          await p.setViewportSize({ width, height });
          await go();
          assert.equal(
            await p.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
            true,
          );
          if (width <= 800) {
            await p.locator("#manual-index-toggle").click();
            assert.equal(await p.locator("#manual-indice").isVisible(), true);
            await p.keyboard.press("Escape");
            assert.equal(await p.locator("#manual-indice").isVisible(), false);
            assert.equal(
              await p.evaluate(() => document.activeElement.id),
              "manual-index-toggle",
            );
          }
          if (width === 390) await shot("manual-mobile");
          await p.locator("#manual-busca").fill("fita");
          assert.equal(
            await p.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
            true,
          );
          if (width === 390) await shot("manual-busca-mobile");
          await p
            .locator('.manual-search-results a[href="#/manual/fita"]')
            .click();
          await p.waitForFunction(() => SIAB.rota.parametro === "fita");
          assert.equal(
            await p.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
            true,
          );
          await p.locator("[data-manual-expand]").first().click();
          await p.locator(".manual-back").click();
          await p.waitForFunction(() => SIAB.rota.parametro === "instrumentos");
          await go("phmetro");
          await p.locator("[data-manual-expand]").first().click();
          const geometry = await p.evaluate(() => ({
            viewport: [innerWidth, innerHeight],
            pageWidth: document.documentElement.scrollWidth,
            title: document
              .getElementById("manual-titulo")
              .getBoundingClientRect()
              .toJSON(),
            diagram: document
              .querySelector(".manual-diagram")
              .getBoundingClientRect()
              .toJSON(),
          }));
          entry.geometry.push(geometry);
          assert.ok(
            geometry.diagram.x >= 0 &&
              geometry.diagram.x + geometry.diagram.width <= width + 1,
          );
          if (width === 390) await shot("manual-topico-mobile");
          if (width === 768) await shot("manual-tablet-portrait");
          if (width === 1024) await shot("manual-tablet-landscape");
        });
      await test("Tema claro, escuro, contraste e filtros de cor com axe", async () => {
        await p.setViewportSize({ width: 1366, height: 900 });
        for (const theme of ["light", "dark"]) {
          await p.evaluate((t) => A11Y.definir("theme", t), theme);
          await go("phmetro");
          await axe();
        }
        await p.evaluate(() => A11Y.definir("contrast", true));
        await go("bancada");
        await axe();
        await shot("manual-alto-contraste");
        await p.evaluate(() => {
          A11Y.definir("contrast", false);
          A11Y.definir("colorblind", "deuteranopia");
        });
        await go();
        assert.equal(await p.locator(".manual-category h3").count(), 13);
        await axe();
        await p.evaluate(() => A11Y.definir("colorblind", "none"));
        await go("bancada");
        await shot("manual-bancada");
        await go("medir");
        await shot("manual-medir");
      });
      await test("Mobile acessível, fonte 200%, cores forçadas e movimento reduzido", async () => {
        await p.setViewportSize({ width: 390, height: 844 });
        await go("phmetro");
        await axe();
        await go();
        await axe();
        await p.evaluate(() => A11Y.definir("fontScale", 2));
        await go("phmetro");
        assert.equal(
          await p.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          true,
        );
        await p.evaluate(() => A11Y.definir("fontScale", 1));
        await p.emulateMedia({
          forcedColors: "active",
          reducedMotion: "reduce",
        });
        await go();
        assert.equal(
          await p.locator(".manual-category").first().isVisible(),
          true,
        );
        assert.equal(
          await p
            .locator(".manual-category")
            .first()
            .evaluate((el) => getComputedStyle(el).transitionDuration),
          "0s",
        );
        await p.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });
      });
      await test("Ajuda contextual de pH preserva experimento, foco e deep link", async () => {
        await p.setViewportSize({ width: 1366, height: 900 });
        await free();
        const before = await p.evaluate(() => JSON.stringify(SIAB.state));
        const link = p.locator(".stage-stats .ajuda-link");
        await link.click();
        assert.equal(
          await p.locator("#activity-help-dialog").isVisible(),
          true,
        );
        assert.match(
          await p.locator("#activity-help-title").textContent(),
          /pH/,
        );
        assert.ok(
          (await p.locator(".manual-context").textContent()).length < 1100,
        );
        assert.equal(
          await p
            .locator('[data-manual-help-link][href="#/manual/ph"]')
            .count(),
          1,
        );
        assert.equal(
          await p.evaluate(() => JSON.stringify(SIAB.state)),
          before,
        );
        await axe();
        await shot("ajuda-contextual");
        await p.keyboard.press("Escape");
        await settle();
        assert.equal(
          await link.evaluate((el) => el === document.activeElement),
          true,
        );
        await link.click();
        await p.locator('[data-manual-help-link][href="#/manual/ph"]').click();
        await p.waitForFunction(() => SIAB.rota.parametro === "ph");
        assert.equal(
          await p.locator("#activity-help-dialog").isVisible(),
          false,
        );
        assert.equal(
          await p.evaluate(() => JSON.stringify(SIAB.state)),
          before,
        );
      });
      await test("Ajuda correta para preparo, conta-gotas, tubos e ferramenta ativa", async () => {
        await free();
        await p.locator("#workspace-montagem").click();
        await p.locator("#controls .ajuda-link").first().click();
        assert.match(
          await p.locator("#activity-help-title").textContent(),
          /soluções|bancada/,
        );
        await p.keyboard.press("Escape");
        await p.evaluate(() => SIAB.workspace.close("left", false));
        await p.locator("#dose-area .ajuda-link").click();
        assert.match(
          await p.locator("#activity-help-title").textContent(),
          /Gotejar/,
        );
        await p.keyboard.press("Escape");
        await p.locator(".tube-strip .ajuda-link").click();
        assert.match(
          await p.locator("#activity-help-title").textContent(),
          /recipientes/,
        );
        await p.keyboard.press("Escape");
        await p.evaluate(() => SIAB.workspace.open("right", "derivada"));
        await p.locator("#ver-panel .ajuda-link").click();
        assert.match(
          await p.locator("#activity-help-title").textContent(),
          /ΔpH/,
        );
        await p.keyboard.press("Escape");
      });
      await test("Ajuda em atividade restrita não oferece saída nem altera permissões", async () => {
        await restricted();
        const before = await p.evaluate(() =>
          JSON.stringify({
            context: SIAB.ActivityContext.current,
            state: SIAB.state,
          }),
        );
        await p.locator(".stage-stats .ajuda-link").click();
        assert.equal(
          await p.locator("#activity-help-dialog").isVisible(),
          true,
        );
        assert.equal(await p.locator("#activity-help-content a").count(), 0);
        assert.match(
          await p.locator("#activity-help-content").textContent(),
          /professor/,
        );
        assert.equal(
          await p.evaluate(() =>
            JSON.stringify({
              context: SIAB.ActivityContext.current,
              state: SIAB.state,
            }),
          ),
          before,
        );
        await shot("ajuda-restrita");
        await p.keyboard.press("Escape");
        for (const id of ["phmetro", "roteiros", "montagens", "professor"]) {
          await p.evaluate((id) => SIAB.irPara("#/manual/" + id), id);
          await p.waitForFunction(() => SIAB.rota.nome === "atividade");
          assert.equal(
            await p.locator("[data-tela=manual]").isVisible(),
            false,
          );
        }
        await p.locator("[data-activity-resume]:visible").click();
        await p.reload();
        await p.waitForFunction(() => SIAB.rota.nome === "laboratorio");
        assert.equal(
          await p.evaluate(() => SIAB.ActivityContext.restricted()),
          true,
        );
        await p.locator(".stage-stats .ajuda-link").click();
        assert.equal(await p.locator("[data-manual-help-link]").count(), 0);
        await p.keyboard.press("Escape");
      });
      await test("Tour existente iniciado pelo Manual e cinco etapas preservadas", async () => {
        await free();
        await go();
        const before = await p.evaluate(() => JSON.stringify(SIAB.state.tubes));
        await p.locator(".manual-hero [data-manual-command=tour]").click();
        await p.waitForFunction(() => SIAB.$("tour").open);
        assert.equal(await p.evaluate(() => SIAB.tour.PASSOS.length), 5);
        for (let i = 0; i < 5; i++) await p.locator("#tour-proximo").click();
        await p.waitForFunction(() => !SIAB.$("tour").open);
        assert.equal(
          await p.evaluate(() => JSON.stringify(SIAB.state.tubes)),
          before,
        );
      });
      await test("Impressão linear: tópico completo e guia rápido sem controles", async () => {
        await go("phmetro");
        await p.evaluate(() => SIAB.manualTela.prepararImpressao());
        await p.emulateMedia({ media: "print" });
        assert.equal(await p.locator("#manual-print").isVisible(), true);
        assert.equal(await p.locator(".manual-topbar").isVisible(), false);
        assert.match(
          await p.locator("#manual-print").textContent(),
          /Calibração simulada/,
        );
        assert.equal(
          await p.locator("#manual-print [data-manual-expand]").count(),
          0,
        );
        if (engine === "chromium")
          await p.pdf({
            path: path.join(out, "rc4-manual-phmetro.pdf"),
            format: "A4",
            printBackground: true,
          });
        await p.emulateMedia({ media: "screen" });
        await go();
        await p.evaluate(() => SIAB.manualTela.prepararImpressao());
        await p.emulateMedia({ media: "print" });
        assert.equal(
          await p.locator("#manual-print .manual-print-category").count(),
          13,
        );
        assert.equal(
          await p.locator(".manual-category-grid").first().isVisible(),
          false,
        );
        if (engine === "chromium")
          await p.pdf({
            path: path.join(out, "rc4-manual-guia-rapido.pdf"),
            format: "A4",
            printBackground: true,
          });
        await p.emulateMedia({ media: "screen" });
      });
      await test("Manual, busca e deep links offline no cache da PWA", async () => {
        await p.goto(service.url + "/#/manual");
        await ready();
        await p.evaluate(() => navigator.serviceWorker.ready);
        await p.waitForFunction(() => !!navigator.serviceWorker.controller);
        service.setOffline(true);
        try {
          await p.reload();
          await ready();
          await p.locator("#manual-busca").fill("medidor de ph");
          await p
            .locator('.manual-search-results a[href="#/manual/phmetro"]')
            .click();
          await p.waitForFunction(() => SIAB.rota.parametro === "phmetro");
          assert.equal(await p.locator(".manual-instrument").isVisible(), true);
          await p.reload();
          await ready();
          assert.equal(
            await p.locator("[data-manual-topic=phmetro]").count(),
            1,
          );
        } finally {
          service.setOffline(false);
        }
      });
      await test("Standalone por arquivo: home, busca, deep link e ajuda contextual", async () => {
        const file = pathToFileURL(
          path.join(__dirname, "..", "SIAB-standalone.html"),
        ).href;
        await p.goto(file + "#/manual/phmetro");
        await ready();
        assert.equal(await p.evaluate(() => SIAB.version), "1.0.0-rc.5");
        assert.equal(await p.locator("[data-manual-topic=phmetro]").count(), 1);
        assert.equal(
          await p.locator("script[src],link[rel=stylesheet]").count(),
          0,
        );
        await go();
        await p.locator("#manual-busca").fill("papel indicador");
        await p
          .locator('.manual-search-results a[href="#/manual/fita"]')
          .click();
        await p.waitForFunction(() => SIAB.rota.parametro === "fita");
        await p.locator('.manual-topbar a[href="#/laboratorio"]').click();
        await p.waitForFunction(() => SIAB.rota.nome === "laboratorio");
        await p.evaluate(() => {
          SIAB.bancada.colocar("hcl");
          SIAB.$("boas-vindas").hidden = true;
          SIAB.render(true);
        });
        await p.locator(".stage-stats .ajuda-link").click();
        await p.locator('[data-manual-help-link][href="#/manual/ph"]').click();
        await p.waitForFunction(() => SIAB.rota.parametro === "ph");
      });
      await test("Sem erros de execução, IDs duplicados ou conteúdo privado no registro", async () => {
        assert.deepEqual(entry.errors, []);
        const audit = await p.evaluate(() => {
          const ids = [...document.querySelectorAll("[id]")].map((x) => x.id);
          return {
            duplicates: ids.filter((x, i) => ids.indexOf(x) !== i),
            text: JSON.stringify(SIAB.manualContent),
          };
        });
        assert.deepEqual(audit.duplicates, []);
        assert.doesNotMatch(
          audit.text,
          /ActivityContext|permission flags|localStorage|schema|professor\.resposta/,
        );
      });
      await ctx.close();
      await browser.close();
    }
  } finally {
    service.setOffline(false);
    service.server.close();
    fs.writeFileSync(
      path.join(out, "manual.json"),
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
  process.exitCode = 1;
});
