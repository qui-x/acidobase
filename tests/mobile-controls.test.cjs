/* Contrato geométrico da RC.4.1, medido no DOM real em três motores. */
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
const sizes = [
  [320, 568],
  [360, 800],
  [390, 844],
  [414, 896],
];
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
        viewport: { width: 390, height: 844 },
        reducedMotion: "reduce",
        hasTouch: true,
      });
      await context.addInitScript(() => {
        localStorage.setItem("siab_abertura", "off");
        localStorage.setItem("siab_inicializacao", '"inicio"');
      });
      const p = await context.newPage();
      p.setDefaultTimeout(8500);
      const entry = {
        engine,
        version: browser.version(),
        cases: [],
        geometry: [],
        errors: [],
      };
      result.engines.push(entry);
      p.on("pageerror", (e) => entry.errors.push(e.message));
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
      async function shot(name) {
        if (engine === "chromium")
          await p.screenshot({ path: path.join(out, name + ".png") });
      }
      async function settle() {
        await p.evaluate(
          () =>
            new Promise((r) =>
              requestAnimationFrame(() => requestAnimationFrame(r)),
            ),
        );
      }
      async function bench(width, height) {
        await p.setViewportSize({ width, height });
        await p.goto(url + "/#/laboratorio");
        await p.waitForFunction(
          () => document.documentElement.dataset.appPronto === "true",
        );
        await p.evaluate(() => {
          SIAB.atividades.encerrar();
          SIAB.benches.lab = SIAB.criarBancada();
          SIAB.usarBancada("lab");
          SIAB.state.level = "calcular";
          SIAB.newTube({
            solution: "hcl",
            concentration: 0.01,
            titrant: "naoh",
            indicator: "universal",
          });
          SIAB.state.activeId = SIAB.state.tubes[0].id;
          SIAB.state.verTab = "ph";
          SIAB.bancada.configurar();
          SIAB.$("boas-vindas").hidden = true;
          SIAB.render(true);
          SIAB.workspace.close("left", false);
          SIAB.workspace.close("right", false);
        });
        await settle();
      }
      async function scan(stage, scope = "#workspace") {
        const data = await p.evaluate((selector) => {
          const box = (el) => {
            const r = el.getBoundingClientRect();
            const s = getComputedStyle(el);
            return {
              name:
                el.id ||
                el.getAttribute("aria-label") ||
                el.textContent.trim().slice(0, 28),
              width: r.width,
              height: r.height,
              x: r.x,
              right: r.right,
              y: r.y,
              bottom: r.bottom,
              radius: s.borderRadius,
              padding: s.padding,
              marginLeft: s.marginLeft,
              scrollWidth: el.scrollWidth,
              clientWidth: el.clientWidth,
            };
          };
          const visible = (el) =>
            el.getClientRects().length > 0 &&
            !el.closest(
              "[inert], [hidden], details:not([open]) > :not(summary)",
            ) &&
            getComputedStyle(el).visibility !== "hidden" &&
            getComputedStyle(el).display !== "none";
          const candidates = [
            ...document.querySelectorAll(
              `${selector} button, ${selector} summary, ${selector} .chip, ${selector} .segmented label, ${selector} .capacidade-opcoes label, ${selector} .opcoes-tubo .opcao, ${selector} .ajuda-link`,
            ),
          ];
          return {
            viewport: innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            controls: candidates.filter(visible).map(box),
          };
        }, scope);
        entry.geometry.push({
          stage,
          width: data.viewport,
          count: data.controls.length,
        });
        assert.ok(
          data.scrollWidth <= data.viewport + 1,
          `${stage}: overflow da página ${data.scrollWidth} > ${data.viewport}`,
        );
        assert.ok(data.controls.length, `${stage}: sem controles`);
        for (const c of data.controls) {
          assert.ok(c.height >= 43.75, `${stage}: ${c.name} com ${c.height}px`);
          assert.ok(
            c.width >= 43.75,
            `${stage}: ${c.name} com largura de toque ${c.width}px`,
          );
          assert.ok(
            c.x >= -1 && c.right <= data.viewport + 1,
            `${stage}: ${c.name} fora da viewport [${c.x}, ${c.right}] de ${data.viewport}px`,
          );
        }
        return data;
      }
      async function scanGlobal(stage) {
        const data = await p.evaluate(() => {
          const controls = [
            ...document.querySelectorAll(
              'button, summary, a[href], input, select, textarea, [role="button"], [role="tab"], label:has(input), .chip, .opcoes-tubo .opcao',
            ),
          ].filter((el) => {
            if (
              !el.getClientRects().length ||
              el.closest('[inert], [hidden], details:not([open]) > :not(summary)')
            )
              return false;
            const css = getComputedStyle(el);
            return css.display !== "none" && css.visibility === "visible";
          });
          return {
            viewport: innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            controls: controls.map((el) => {
              const r = el.getBoundingClientRect();
              const wrapper = el.closest("label");
              return {
                name:
                  el.id ||
                  el.getAttribute("aria-label") ||
                  el.textContent.trim().replace(/\s+/g, " ").slice(0, 34),
                tag: el.tagName,
                overlayChoice:
                  el.tagName === "INPUT" &&
                  ["checkbox", "radio"].includes(el.type) &&
                  Boolean(wrapper),
                wrapperHeight: wrapper?.getBoundingClientRect().height,
                width: r.width,
                height: r.height,
                x: r.x,
                right: r.right,
                scrollWidth: el.scrollWidth,
                clientWidth: el.clientWidth,
              };
            }),
          };
        });
        entry.geometry.push({
          stage,
          viewport: data.viewport,
          count: data.controls.length,
        });
        assert.ok(data.controls.length > 5, `${stage}: poucos controles`);
        assert.ok(
          data.scrollWidth <= data.viewport + 1,
          `${stage}: overflow horizontal da página`,
        );
        for (const c of data.controls) {
          if (c.overlayChoice) {
            assert.ok(c.wrapperHeight >= 43.75, `${stage}: label ${c.name}`);
            continue; // O desenho de checkbox/radio é menor; a área clicável é o label.
          }
          assert.ok(c.height >= 43.75, `${stage}: ${c.name} tem ${c.height}px`);
          assert.ok(c.width >= 43.75, `${stage}: ${c.name} tem ${c.width}px de largura`);
          assert.ok(
            c.x >= -1 && c.right <= data.viewport + 1,
            `${stage}: ${c.name} ultrapassa ${data.viewport}px`,
          );
          assert.ok(
            c.scrollWidth <= c.clientWidth + 2,
            `${stage}: conteúdo recortado em ${c.name}`,
          );
        }
        return data;
      }
      async function contract(stage) {
        const g = await p.evaluate(() => {
          const x = (id) => {
            const el = document.getElementById(id),
              b = el.getBoundingClientRect(),
              s = getComputedStyle(el);
            return {
              x: b.x,
              y: b.y,
              right: b.right,
              width: b.width,
              height: b.height,
              radius: s.borderRadius,
              padding: s.padding,
              margin: s.marginLeft,
              font: s.fontFamily,
            };
          };
          return {
            undo: x("undo-btn"),
            drop: x("drop-btn"),
            doses: x("mobile-doses-toggle"),
            agitar: x("agitar-btn"),
            ph: x("workspace-quick-measure"),
            viewport: innerWidth,
          };
        });
        entry.geometry.push({ stage, ...g });
        assert.ok(
          g.undo.width >= 44 && g.undo.width <= 48,
          `${stage}: Desfazer ${g.undo.width}px`,
        );
        assert.ok(
          g.doses.width >= 72 && g.doses.width <= 80,
          `${stage}: Doses ${g.doses.width}px`,
        );
        assert.ok(
          g.drop.width > g.doses.width && g.drop.width < g.viewport - 120,
          `${stage}: proporção do gotejamento`,
        );
        assert.ok(
          Math.max(g.undo.height, g.drop.height, g.doses.height) -
            Math.min(g.undo.height, g.drop.height, g.doses.height) <
            0.5,
          `${stage}: alturas das doses`,
        );
        assert.ok(
          Math.abs(g.agitar.height - g.ph.height) <= 0.5,
          `${stage}: alturas da ação contextual`,
        );
        assert.ok(
          Math.abs(g.agitar.width - g.ph.width) <= 2,
          `${stage}: larguras da ação contextual`,
        );
        assert.equal(g.agitar.radius, g.ph.radius, `${stage}: radius`);
        assert.equal(g.agitar.padding, g.ph.padding, `${stage}: padding`);
        assert.equal(g.agitar.font, g.ph.font, `${stage}: fonte`);
        assert.equal(
          g.agitar.margin,
          "0px",
          `${stage}: margem lateral do Agitar`,
        );
        assert.ok(
          g.agitar.height >= 44 && g.agitar.right + 5 <= g.ph.x,
          `${stage}: distância entre irmãos`,
        );
        for (const c of [g.undo, g.drop, g.doses, g.agitar, g.ph])
          assert.ok(
            c.x >= 0 && c.right <= g.viewport + 1,
            `${stage}: botão fora da viewport`,
          );
        return g;
      }
      for (const [width, height] of sizes) {
        const tag = `${width}×${height}`;
        await test(`${tag}: barra, irmãos e enquadramento`, async () => {
          await bench(width, height);
          await contract(`bancada-${width}`);
          await scan(`bancada-${width}`);
          await shot(`mobile-${width}-bancada`);
        });
        await test(`${tag}: Doses e ações de linha`, async () => {
          await p.click("#mobile-doses-toggle");
          assert.equal(
            await p
              .locator("#mobile-doses-toggle")
              .getAttribute("aria-expanded"),
            "true",
          );
          await scan(`doses-${width}`);
          await contract(`doses-${width}`);
          await p.click("#mobile-doses-toggle");
        });
        await test(`${tag}: Montagem, chips e opções`, async () => {
          await p.click("#workspace-montagem");
          await p.click("#dock-left-preparo");
          const data = await scan(`montagem-${width}`);
          assert.ok(
            data.controls.some((c) => c.name.includes("Mais indicadores")),
          );
          assert.ok(
            data.controls.filter(
              (c) =>
                c.name.includes("indicador") || c.name.includes("Tornassol"),
            ).length > 0,
          );
          if (width === 390) await shot("mobile-montagem");
          await p.click("#dock-left-objetos");
          await scan(`objetos-${width}`);
          await p
            .locator('#vidraria-grupo label:has(input[value="bequer"])')
            .click();
          const capacities = await scan(`capacidades-${width}`);
          assert.ok(
            (await p.locator("#capacidade-opcoes label:visible").count()) >=
              2 &&
              capacities.controls.filter((c) =>
                ["50", "100", "250", "500"].includes(c.name),
              ).length >= 2,
            "Seletores de capacidade devem ficar visíveis e alcançáveis",
          );
          await p.click("#close-controls");
        });
        await test(`${tag}: Medir, ferramentas e ações`, async () => {
          await p.click("#workspace-ver");
          await scan(`familias-${width}`);
          for (const h of await p.locator('[data-ver-family]:visible').evaluateAll(
            (items) => items.map((el) => el.getBoundingClientRect().height),
          ))
            assert.ok(h >= 48 && h <= 53, `card de família: ${h}px`);
          await p.click("[data-ver-family=medir]");
          await scan(`ferramentas-${width}`);
          for (const h of await p.locator('[data-ver]:visible').evaluateAll(
            (items) => items.map((el) => el.getBoundingClientRect().height),
          ))
            assert.ok(h >= 48 && h <= 53, `card de ferramenta: ${h}px`);
          await p.click("#tab-ph");
          const g = await scan(`medir-${width}`);
          assert.ok(g.controls.some((c) => c.name.includes("Medir uma vez")));
          assert.ok(
            g.controls.some((c) => c.name.includes("Medição contínua")),
          );
          if (width === 390) await shot("mobile-medir");
          await p.click("#dock-close-right");
        });
        await test(`${tag}: escala das partículas e alternância`, async () => {
          await p.click("#workspace-ver");
          await p.click("[data-ver-family=observar]");
          await p.click("[data-ver=particulas]");
          const g = await scan(`particulas-${width}`);
          const scale = g.controls.find((c) =>
            c.name.includes("Escala logarítmica"),
          );
          assert.ok(
            scale && scale.height >= 44,
            "Escala de partículas com alvo >=44 px",
          );
          await p.click("#dock-close-right");
        });
        await test(`${tag}: Dados e ações do bottom sheet`, async () => {
          await p.click("#workspace-dados");
          const g = await scan(`dados-${width}`);
          for (const name of ["dock-history", "dock-table"])
            assert.ok(g.controls.find((c) => c.name === name).height >= 48);
          if (width === 390) await shot("mobile-dados");
          await p.click("#dock-close-right");
        });
        await test(`${tag}: Visão geral e ordenação`, async () => {
          await p.click("#overview-tab");
          const g = await scan(`visao-geral-${width}`);
          assert.ok(g.controls.some((c) => c.name === "ordenar-ph-btn"));
          await p.click("#focus-tab");
        });
        await test(`${tag}: preferência de fonte e controle compacto`, async () => {
          await p.click("#menu-btn");
          await p.click("#a11y-toggle");
          const g = await scan(`preferencias-${width}`, "#app-drawer");
          for (const id of ["font-minus", "font-plus"]) {
            const c = g.controls.find((x) => x.name === id);
            assert.ok(c && c.width >= 44 && c.height >= 44);
          }
          await p.locator("#app-drawer [data-close=app-drawer]").click();
        });
        await test(`${tag}: navegação, Manual e formulários`, async () => {
          for (const route of [
            "inicio",
            "aprender",
            "missoes",
            "roteiros",
            "montagens",
            "caderno",
            "manual",
            "manual/phmetro",
            "manual/indicadores",
            "professor",
            "relatorio",
          ]) {
            await p.goto(`${url}/#/${route}`);
            const [name, ...topic] = route.split("/");
            await p.waitForFunction(
              ({ name, topic }) =>
                SIAB.rota.nome === name &&
                SIAB.rota.parametro === topic,
              { name, topic: topic.join("/") },
            );
            await settle();
            await scanGlobal(`${route}-${width}`);
          }
        });
      }
      await test("320–414 px: proporção contínua na barra", async () => {
        const measures = sizes.map(([w]) =>
          entry.geometry.find((g) => g.stage === `bancada-${w}`),
        );
        assert.ok(measures.every(Boolean));
        for (let i = 1; i < measures.length; i++) {
          const a = measures[i - 1],
            b = measures[i];
          assert.ok(
            Math.abs(b.drop.width - a.drop.width - (b.viewport - a.viewport)) <= 2,
            `salto desproporcional entre ${a.viewport} e ${b.viewport}px`,
          );
          assert.ok(Math.abs(b.undo.width - a.undo.width) <= 1);
          assert.ok(Math.abs(b.doses.width - a.doses.width) <= 1);
        }
      });
      await context.close();
      await browser.close();
    }
  } finally {
    server.close();
    fs.writeFileSync(
      path.join(out, "mobile-controls.json"),
      JSON.stringify(result, null, 2) + "\n",
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
