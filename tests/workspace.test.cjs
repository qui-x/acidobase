/* RC.3: geometria real, navegação contextual, foco, conservação de estado e
   evidências nos três motores. Os testes RC.2 continuam em sua suíte original. */
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path");
const pw = require(process.env.SIAB_PLAYWRIGHT_MODULE || "playwright");
const AxeBuilder = require(
  process.env.SIAB_AXE_MODULE || "@axe-core/playwright",
).default;
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
        hasTouch: true,
      });
      await context.addInitScript(() => {
        localStorage.setItem("siab_abertura", "off");
        localStorage.setItem("siab_inicializacao", '"inicio"');
      });
      const p = await context.newPage(),
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
      async function shot(name) {
        if (engine === "chromium")
          await p.screenshot({ path: path.join(out, "rc3-" + name + ".png") });
      }
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
                engine + "-workspace-falha-" + entry.cases.length + ".png",
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
      async function settle() {
        await p.evaluate(
          () =>
            new Promise((r) =>
              requestAnimationFrame(() => requestAnimationFrame(r)),
            ),
        );
      }
      async function free(n = 1) {
        await p.evaluate(() => SIAB.atividades.encerrar()).catch(() => {});
        await p.goto(url + "/#/laboratorio");
        await ready();
        await p.evaluate((n) => {
          document.body.classList.remove("projetor");
          delete document.documentElement.dataset.projetor;
          SIAB.benches.lab = SIAB.criarBancada();
          SIAB.usarBancada("lab");
          SIAB.state.level = "calcular";
          for (let i = 0; i < n; i++)
            SIAB.newTube({
              solution: "hcl",
              concentration: 0.01,
              titrant: "naoh",
              indicator: ["universal", "btb", "phenol"][i % 3],
            });
          SIAB.state.activeId = SIAB.state.tubes[0].id;
          SIAB.state.verTab = "ph";
          SIAB.bancada.configurar();
          SIAB.$("boas-vindas").hidden = true;
          SIAB.render(true);
          SIAB.workspace.close("left", false);
          SIAB.workspace.close("right", false);
        }, n);
        await settle();
      }
      async function start(extra = {}) {
        await free();
        const token = await p.evaluate(
          async (extra) =>
            SIAB.atividades.codificar({
              schema: 2,
              tipo: "roteiro",
              item: "titulacao-forte",
              titulo: "Investigação da bancada",
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
        await p.click("#atividade-iniciar button");
        await p.waitForFunction(
          () => SIAB.rota.nome === "laboratorio" || SIAB.rota.nome === "missao",
        );
        await settle();
        return token;
      }
      const snapshot = () =>
        p.evaluate(() =>
          JSON.stringify({
            tubes: SIAB.state.tubes,
            history: SIAB.state.history,
            ph: SIAB.state.tubes.map((t) => SIAB.chem.solve(t).pH),
          }),
        );
      async function geometry(label, checkStage = true) {
        const g = await p.evaluate(() => {
          const box = (el) => {
            if (!el?.getClientRects().length) return null;
            const r = el.getBoundingClientRect();
            return {
              x: r.x,
              y: r.y,
              right: r.right,
              bottom: r.bottom,
              width: r.width,
              height: r.height,
            };
          };
          return {
            viewport: [innerWidth, innerHeight],
            scrollWidth: document.documentElement.scrollWidth,
            stage: box(SIAB.$("large-tube")),
            actions: box(SIAB.$("dose-area")),
            buttons: [...SIAB.$("dose-area").querySelectorAll("button")]
              .map(box)
              .filter(Boolean),
            drop: box(SIAB.$("drop-btn")),
            nav: box(SIAB.$("workspace-launchers")),
            panels: [
              ...document.querySelectorAll(
                ".dock:not(.dock-collapsed):not([hidden])",
              ),
            ].map(box),
          };
        });
        entry.geometry.push({ label, ...g });
        assert.ok(
          g.scrollWidth <= g.viewport[0] + 1,
          label + ": overflow global",
        );
        for (const panel of g.panels) {
          assert.ok(
            panel.x >= -1 && panel.right <= g.viewport[0] + 1,
            label + ": dock fora da largura",
          );
          assert.ok(
            panel.y >= -1 && panel.bottom <= g.viewport[1] + 1,
            label + ": dock fora da altura",
          );
        }
        if (checkStage && g.viewport[0] > 900) {
          for (const panel of g.panels) {
            for (const [name, r] of [
              ["recipiente", g.stage],
              ...g.buttons.map((r, i) => ["botão de ação " + i, r]),
            ]) {
              if (!r) continue;
              const overlap =
                Math.min(r.right, panel.right) - Math.max(r.x, panel.x) > 1 &&
                Math.min(r.bottom, panel.bottom) - Math.max(r.y, panel.y) > 1;
              assert.ok(!overlap, label + ": dock cobre " + name);
            }
          }
        }
        return g;
      }
      await test("Bancada ocupa a largura disponível com docas recolhidas", async () => {
        await free();
        const b = await p.locator("#focus-view").boundingBox();
        assert.ok(b.width > 1280);
        assert.equal(await p.locator(".dock:visible").count(), 0);
        await geometry("desktop-foco");
        await shot("desktop-foco");
      });
      await test("Montagem: compacto, controles contextuais e ganho de área ao recolher", async () => {
        const before = await snapshot();
        await p.evaluate(() => {
          window.originalGlass = SIAB.$("large-tube").firstElementChild;
          window.originalReadings = SIAB.current().observacao;
        });
        await p.click("#workspace-montagem");
        await p.click("#dock-left-resumo");
        assert.equal(await p.locator("#dock-setup-summary").isVisible(), true);
        assert.equal(
          await p.locator("#painel-laboratorio input:visible").count(),
          0,
        );
        await p.click("#dock-left-preparo");
        assert.equal(await p.locator("#menu-tubo").isVisible(), true);
        assert.equal(await p.locator("#modulos").isVisible(), false);
        await shot("desktop-dock-esquerda");
        const narrow = await p.locator(".tube-stage").boundingBox();
        await geometry("desktop-montagem");
        await p.click("#close-controls");
        const wide = await p.locator(".tube-stage").boundingBox();
        assert.ok(wide.width > narrow.width + 200);
        assert.equal(
          await p.evaluate(() => document.activeElement.id),
          "workspace-montagem",
        );
        assert.equal(await snapshot(), before);
        assert.equal(
          await p.evaluate(
            () =>
              window.originalGlass === SIAB.$("large-tube").firstElementChild &&
              window.originalReadings === SIAB.current().observacao,
          ),
          true,
        );
      });
      await test("Famílias substituem conteúdo; apresentação respeita ferramenta ativa", async () => {
        await p.click("#workspace-ver");
        for (const [family, tool, mode] of [
          ["observar", "especies", "standard"],
          ["medir", "ph", "compact"],
          ["analisar", "grafico", "wide"],
        ]) {
          await p.click(`[data-ver-family=${family}]`);
          await p.click(`[data-ver=${tool}]`);
          assert.equal(
            await p.evaluate(() => SIAB.workspace.state.activeFamily),
            family,
          );
          assert.equal(
            await p.locator("#ver-panel").getAttribute("data-presentation"),
            mode,
          );
          assert.equal(
            await p.locator("[data-ver]").count(),
            family === "medir" ? 3 : family === "observar" ? 4 : 5,
          );
          await geometry("familia-" + family);
          await shot("desktop-" + family);
        }
      });
      await test("Gráfico wide expande e restaura sem recriar dados ou instrumento", async () => {
        await p.evaluate(() => {
          SIAB.instrumentos.medir(SIAB.current(), "fita");
          SIAB.bancada.gotejar(1);
          SIAB.instrumentos.medir(SIAB.current(), "fita");
          SIAB.selecionarVer("grafico");
        });
        const data = await snapshot();
        await p.evaluate(
          () =>
            (window.chartNode = SIAB.$("ver-conteudo").querySelector("svg")),
        );
        const old = await p.locator("#ver-panel").boundingBox();
        assert.ok(old.width >= 600);
        await p.click("#dock-expand");
        assert.ok((await p.locator("#ver-panel").boundingBox()).width > 1300);
        assert.equal(await p.locator("#dock-expand").innerText(), "Restaurar");
        await geometry("grafico-fullscreen", false);
        await p.click("#dock-expand");
        assert.ok(
          Math.abs(
            (await p.locator("#ver-panel").boundingBox()).width - old.width,
          ) < 2,
        );
        assert.equal(await snapshot(), data);
        assert.equal(
          await p.evaluate(
            () =>
              window.chartNode === SIAB.$("ver-conteudo").querySelector("svg"),
          ),
          true,
        );
      });
      await test("Tabela ampla: compacta, expansão de grupo, completa e restauração", async () => {
        await p.evaluate(() => {
          for (let i = 0; i < 30; i++)
            SIAB.instrumentos.medir(SIAB.current(), "fita");
          SIAB.selecionarVer("tabela");
        });
        await p.click("#dock-expand");
        await p.click("[data-measurement-table=compact]");
        const n = await p.evaluate(
          () => SIAB.instrumentos.raw(SIAB.current()).length,
        );
        await p.locator(".measurement-group summary").first().click();
        assert.ok((await p.locator(".measurement-group[open] li").count()) > 1);
        await shot("tabela-expandida");
        await p.click("[data-measurement-table=complete]");
        assert.equal(await p.locator("#ver-conteudo tbody tr").count(), n);
        await p.click("#dock-expand");
        await p.click("#dock-close-right");
        assert.equal(
          await p.evaluate(() => SIAB.instrumentos.raw(SIAB.current()).length),
          n,
        );
      });
      await test("Teclado: Enter, Space, Esc, foco e controles recolhidos", async () => {
        await p.locator("#workspace-montagem").focus();
        await p.keyboard.press("Enter");
        assert.equal(
          await p.evaluate(() => document.activeElement.id),
          "close-controls",
        );
        await p.keyboard.press("Escape");
        assert.equal(
          await p.evaluate(() => document.activeElement.id),
          "workspace-montagem",
        );
        assert.equal(
          await p.locator("#controls").evaluate((el) => el.inert),
          true,
        );
        await p.locator("#workspace-ver").focus();
        await p.keyboard.press("Space");
        assert.equal(
          await p.evaluate(() => document.activeElement.id),
          "dock-close-right",
        );
        await p.keyboard.press("Escape");
        assert.equal(
          await p.evaluate(() => document.activeElement.id),
          "workspace-ver",
        );
      });
      await test("Troca de tubo conserva ferramenta e atualiza o contexto", async () => {
        await free(3);
        await p.click("#workspace-ver");
        await p.click("[data-ver-family=medir]");
        await p.click("[data-ver=ph]");
        await p.locator("#tube-list [data-tube]").nth(1).click();
        assert.equal(
          await p.evaluate(() => SIAB.workspace.state.activeTool),
          "ph",
        );
        assert.match(
          await p.locator("[data-instrumento=fita]").innerText(),
          /Tubo 2/,
        );
        await p.click("#dock-close-right");
        await p.evaluate(() => {
          SIAB.state.tubes.forEach((t) => (t.group = 1));
          SIAB.render();
        });
        await p.click("#overview-tab");
        await settle();
        assert.equal(await p.locator(".overview-tube").count(), 3);
        assert.equal(await p.locator("#overview-group-summary p").count(), 1);
        assert.equal(await p.locator("#dose-area").isVisible(), false);
        await shot("desktop-visao-geral");
        await p.locator(".overview-tube").nth(2).click();
        assert.equal(await p.evaluate(() => SIAB.current().id), 3);
        assert.equal(await p.locator("#dose-area").isVisible(), true);
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
      ]) {
        await test(`Viewport ${width}×${height}: ações, docas, limites e ausência de sobreposição`, async () => {
          await p.setViewportSize({ width, height });
          await free();
          await settle();
          const g = await geometry("bancada-" + width);
          if (width <= 900) {
            assert.ok(g.drop.bottom <= g.nav.y + 1, "ação essencial coberta");
            assert.ok(g.drop.y >= 0);
            assert.equal(
              await p.locator("#workspace-montagem").isVisible(),
              true,
            );
          }
          await p.click("#workspace-montagem");
          await geometry("montagem-" + width, width > 900);
          await p.click("#close-controls");
          await p.click("#workspace-ver");
          await geometry("ver-" + width, width > 900);
          await p.click("#dock-close-right");
          if (width === 390) await shot("mobile-bancada");
          if (width === 768) await shot("tablet-portrait");
          if (width === 1024) await shot("tablet-landscape");
        });
      }
      await test("Mobile: navegação Ver → Medir → pH, voltar níveis e foco modal", async () => {
        await p.setViewportSize({ width: 390, height: 844 });
        await free();
        await p.tap("#workspace-montagem");
        await shot("mobile-montagem");
        assert.equal(
          await p.locator("#controls").getAttribute("role"),
          "dialog",
        );
        await p.keyboard.press("Escape");
        await p.tap("#workspace-ver");
        assert.equal(await p.locator("#ver-conteudo").isVisible(), false);
        await p.tap("[data-ver-family=medir]");
        assert.equal(await p.locator(".ver-family-tabs").isVisible(), false);
        await shot("mobile-ver-medir");
        await p.tap("[data-ver=ph]");
        assert.equal(await p.locator("#ver-subpanel").isVisible(), false);
        assert.equal(await p.locator("#ver-conteudo").isVisible(), true);
        await p.tap("[data-instrumento=fita]");
        assert.equal(
          await p.evaluate(
            () => SIAB.instrumentos.leitura(SIAB.current()).tecnica,
          ),
          "fita",
        );
        await p.click("#dock-back");
        assert.equal(await p.locator(".ver-item-tabs").isVisible(), true);
        await p.click("#dock-back");
        assert.equal(await p.locator(".ver-family-tabs").isVisible(), true);
        await p.locator("#dock-close-right").focus();
        await p.keyboard.press("Shift+Tab");
        assert.equal(
          await p.evaluate(
            () => !!document.activeElement.closest("#ver-panel"),
          ),
          true,
        );
        await p.keyboard.press("Escape");
        assert.equal(
          await p.evaluate(() => document.activeElement.id),
          "workspace-ver",
        );
      });
      await test("Mobile: Dados, histórico, tabela e relatório usam fluxo próprio", async () => {
        await p.tap("#workspace-dados");
        await shot("mobile-dados");
        await p.tap("#dock-history");
        assert.equal(await p.locator(".experiment-timeline").count(), 1);
        await p.tap("#dock-back");
        await p.tap("#dock-table");
        await geometry("mobile-tabela", false);
        assert.ok((await p.locator(".table-scroll").count()) > 0);
        await p.tap("#dock-back");
        await p.tap("#imprimir-relatorio");
        await p.waitForSelector("[data-report-field=observacoes]");
        assert.equal(await p.locator(".dock:visible").count(), 0);
        assert.equal(
          await p.locator(".app-header").evaluate((el) => el.inert),
          false,
        );
      });
      await test("Mobile: agitação, medição rápida e gotas junto ao recipiente", async () => {
        await free();
        await p.tap("#drop-btn");
        await p.tap("#agitar-btn");
        await p.tap("#workspace-quick-measure");
        await p.waitForTimeout(620);
        assert.equal(
          await p.evaluate(() => SIAB.current().additions.length),
          1,
        );
        assert.ok(
          await p.evaluate(() =>
            SIAB.instrumentos
              .raw(SIAB.current())
              .some((m) => m.tecnica === "phmetro"),
          ),
        );
        await p.tap("#mobile-doses-toggle");
        await p.tap("#drop5-btn");
        assert.equal(
          await p.evaluate(() => SIAB.current().additions.length),
          6,
        );
      });
      await test("Teclado virtual simulado: visualViewport mantém campo dentro do sheet", async () => {
        await p.evaluate(() => SIAB.workspace.open("right", "temperatura"));
        await p.locator("#temperatura-form input").focus();
        await p.evaluate(() => {
          Object.defineProperty(visualViewport, "height", {
            configurable: true,
            value: 400,
          });
          visualViewport.dispatchEvent(new Event("resize"));
        });
        await settle();
        const box = await p.locator("#temperatura-form input").boundingBox();
        const sheet = await p.locator("#ver-panel").boundingBox();
        assert.ok(sheet.y + sheet.height <= 400 + 1);
        assert.ok(
          box.y >= sheet.y && box.y + box.height <= sheet.y + sheet.height,
        );
        await p.fill("#temperatura-form input", "35");
        await p.click("#temperatura-form button");
        assert.equal(await p.evaluate(() => SIAB.current().temperature), 35);
        await p.evaluate(() => {
          delete visualViewport.height;
          visualViewport.dispatchEvent(new Event("resize"));
        });
        await p.click("#dock-close-right");
      });
      await test("Rotação e redimensionamento preservam atividade, gotas e medições", async () => {
        const before = await snapshot();
        for (const [width, height] of [
          [844, 390],
          [390, 844],
          [768, 1024],
          [1024, 768],
          [1366, 768],
          [1440, 900],
          [1280, 720],
        ]) {
          await p.setViewportSize({ width, height });
          await settle();
          await geometry("rotacao-" + width);
          assert.equal(await snapshot(), before);
        }
      });
      await test("Somente fita: montagem fixa, ferramenta única e restauração autorizada", async () => {
        await p.setViewportSize({ width: 1366, height: 768 });
        await start();
        await p.click("#workspace-montagem");
        assert.equal(
          await p.locator("#controls").getAttribute("data-dock-state"),
          "compact",
        );
        assert.equal(
          await p
            .locator("#controls input:visible,#controls select:visible")
            .count(),
          0,
        );
        await p.click("#close-controls");
        await p.click("#workspace-ver");
        assert.equal(await p.locator("[data-ver-family]").count(), 0);
        assert.match(await p.locator(".ver-single").innerText(), /MEDIR · pH/);
        assert.equal(await p.locator("[data-instrumento=phmetro]").count(), 0);
        await p.evaluate(() => {
          const prefs = JSON.parse(localStorage.getItem("siab_workspace_v1"));
          prefs.tool = "particulas";
          prefs.right = "open";
          localStorage.setItem("siab_workspace_v1", JSON.stringify(prefs));
        });
        await p.reload();
        await ready();
        await p.waitForFunction(() => SIAB.rota.nome === "laboratorio");
        assert.equal(
          await p.evaluate(() => SIAB.workspace.state.activeTool),
          "ph",
        );
        assert.equal(await p.locator("[data-ver=particulas]").count(), 0);
        await shot("atividade-somente-fita");
      });
      await test("Mobile: família única com várias ferramentas abre a lista diretamente", async () => {
        await p.setViewportSize({width:390,height:844});
        await start({permissions:{measurements:{phStrip:true,temperature:true},representations:{},analysis:{}}});
        await p.click("#workspace-ver");
        assert.equal(await p.locator("[data-ver-family]").count(),0);
        assert.equal(await p.locator("#tab-temperatura").isVisible(),true);
        assert.equal(await p.locator("#dock-back").isVisible(),false);
        await p.click("#tab-temperatura");
        assert.equal(await p.locator("[data-instrumento=temperatura]").isVisible(),true);
        await p.click("#dock-back");
        assert.equal(await p.locator("#tab-ph").isVisible(),true);
        await p.click("#dock-close-right");
        await p.setViewportSize({width:1366,height:768});
        await start();
      });
      await test("restricted-activity-escape: docas, ação rápida e navegação não ampliam permissões", async () => {
        const before = await snapshot();
        await p.evaluate(() => {
          SIAB.workspace.open("right", "particulas");
          SIAB.selecionarVer("equacao");
          SIAB.workspace.open("left", "modulo");
          SIAB.modulos.ativar("calcular");
          SIAB.newTube({ solution: "naoh" });
          SIAB.bancada.trocarVidraria("bequer");
        });
        assert.equal(await snapshot(), before);
        assert.equal(await p.locator("#modulos").isVisible(), false);
        assert.equal(
          await p.evaluate(() => SIAB.workspace.state.activeTool),
          "ph",
        );
        await p.evaluate(() => SIAB.irPara("#/manual"));
        await p.waitForFunction(() => SIAB.rota.nome === "atividade");
        assert.ok(await p.evaluate(() => SIAB.ActivityContext.restricted()));
        await p.click("[data-activity-resume]");
      });
      await test("Dados continuam acessíveis sem família autorizada no VER", async () => {
        await start({
          item: "cotidiano",
          modulo: "explorar",
          permissions: {
            measurements: { indicator: true },
            representations: {},
            analysis: {},
          },
          verAccess: { observar: [], medir: [], analisar: [] },
        });
        assert.equal(await p.locator("#workspace-ver").isVisible(), false);
        await p.click("#workspace-dados");
        assert.equal(await p.locator("#dock-history").isVisible(), false);
        assert.equal(await p.locator("#dock-table").isVisible(), false);
        assert.equal(await p.locator("#imprimir-relatorio").isVisible(), true);
      });
      await test("Projetor começa com cena livre e permite reabrir ferramentas", async () => {
        await free(3);
        await p.click("#workspace-montagem");
        await p.evaluate(() => {
          document.body.classList.add("projetor");
          document.documentElement.dataset.projetor = "on";
        });
        await settle();
        assert.equal(await p.locator(".dock:visible").count(), 0);
        await shot("projetor");
        await p.click("#workspace-ver");
        await settle();
        assert.equal(await p.locator("#ver-panel").isVisible(), true);
        await p.click("#dock-close-right");
        await p.evaluate(() => {
          document.body.classList.remove("projetor");
          delete document.documentElement.dataset.projetor;
        });
      });
      await test("Acessibilidade: docas desktop, sheet mobile, contraste e foco", async () => {
        for (const width of [1366, 390]) {
          await p.setViewportSize({ width, height: 900 });
          await free();
          await p.click("#workspace-ver");
          if (width < 900) {
            await p.click("[data-ver-family=medir]");
            await p.click("[data-ver=ph]");
          }
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
          );
          await p.click("#dock-close-right");
          await p.click("#workspace-montagem");
          const left = (
            await new AxeBuilder({ page: p })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze()
          ).violations;
          assert.deepEqual(
            left.map((v) => ({
              id: v.id,
              nodes: v.nodes.map((n) => n.target),
            })),
            [],
          );
          await p.click("#close-controls");
        }
        await p.setViewportSize({ width: 1366, height: 900 });
        await p.evaluate(() => {
          document.documentElement.dataset.contrast = "on";
          document.documentElement.dataset.colorblind = "protanopia";
        });
        await p.click("#workspace-ver");
        await shot("alto-contraste");
        await p.emulateMedia({ forcedColors: "active" });
        await geometry("forced-colors");
        await p.emulateMedia({ forcedColors: "none" });
        await p.evaluate(() => {
          delete document.documentElement.dataset.contrast;
          delete document.documentElement.dataset.colorblind;
        });
      });
      await test("Professor mantém configuração e abre aluno no workspace novo", async () => {
        await p.evaluate(() => SIAB.workspace.close("right", false));
        await p.goto(url + "/#/professor");
        await ready();
        await shot("professor");
        await p.click("#prof-form button[type=submit]");
        assert.ok(await p.locator("#prof-link").inputValue());
        const link = await p.locator("#prof-link").inputValue();
        await p.goto(link);
        await p.click("#atividade-iniciar button");
        await p.waitForFunction(() => !SIAB.$("workspace").hidden);
        assert.equal(await p.locator("#workspace-launchers").isVisible(), true);
      });
      await test("Sem erros JavaScript e IDs únicos no workspace", async () => {
        assert.deepEqual(entry.errors, []);
        assert.deepEqual(
          await p.evaluate(() =>
            [...document.querySelectorAll("[id]")]
              .map((el) => el.id)
              .filter((id, i, a) => a.indexOf(id) !== i),
          ),
          [],
        );
      });
      await browser.close();
    }
  } finally {
    server.close();
    fs.writeFileSync(
      path.join(out, "workspace.json"),
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
