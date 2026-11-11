"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { chromium, firefox, webkit } = require("playwright");

const name = process.env.SIAB_BROWSER || "chromium";
const launcher = { chromium, firefox, webkit }[name];
if (!launcher) throw Error("Browser inválido: " + name);
const origin = process.env.SIAB_TEST_URL || "http://127.0.0.1:8765";

test("salva dezenas de sequências, recarrega resultados e mantém Desfazer", async () => {
  const browser = await launcher.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1366, height: 768 }, reducedMotion: "reduce",
    });
    try {
      await page.goto(origin + "/#/laboratorio", { waitUntil: "load" });
      await page.waitForFunction(() => window.SIAB?.workspace?.ready);
      const before = await page.evaluate(() => {
        const S = window.SIAB;
        S.abertura?.encerrar?.();
        document.querySelector("#abertura")?.remove();
        document.querySelectorAll("dialog[open]").forEach(el => el.close());
        if (!S.current()) S.bancada.adicionarTubo();
        S.workspace.close("left", false);
        const t = S.current();
        S.state.vidraria = "erlenmeyer";
        t.capacidade = 125;
        t.initialVolume = 25;
        const countStart = t.additions.length;
        const historyStart = S.state.history.length;
        for (let i = 0; i < 12; i++) {
          const n = S.bancada.gotejar(20);
          if (n !== 20) throw Error("Gotejamento inesperadamente interrompido: " + n);
        }
        if (!S.persistencia.salvar("siab_bancada_v2", S.benches.lab))
          throw Error("Bancada compacta não pôde ser salva");
        const serialized = localStorage.getItem("siab_bancada_v2");
        return {
          volume: S.chem.solve(S.current()).volume,
          count: S.current().additions.length,
          history: S.state.history.length,
          events: S.current().observacao?.eventos?.length || 0,
          storedBytes: serialized.length,
          compactHistory: serialized.includes("__siabHistoricoDeltaV1"),
          packedAdditions: serialized.includes("__siabGotasRleV1"),
          countStart, historyStart,
        };
      });
      assert.equal(before.count - before.countStart, 240);
      assert.equal(before.history - before.historyStart, 12);
      assert.equal(before.compactHistory, true, "Não usou histórico delta");
      assert.equal(before.packedAdditions, true, "Não agrupou gotas repetidas");
      await page.reload({ waitUntil: "load" });
      await page.waitForFunction(() =>
        window.SIAB?.workspace?.ready && window.SIAB.current()?.additions?.length >= 240,
        null, { timeout: 20000 },
      );
      const after = await page.evaluate(() => {
        const S = window.SIAB;
        const current = S.current();
        const initial = {
          count: current.additions.length,
          volume: S.chem.solve(current).volume,
          history: S.state.history.length,
          events: current.observacao?.eventos?.length || 0,
        };
        const desc = S.desfazer();
        return {
          ...initial,
          undoDescription: desc,
          afterUndoCount: S.current().additions.length,
          afterUndoHistory: S.state.history.length,
        };
      });
      assert.equal(after.count, before.count);
      assert.ok(Math.abs(after.volume - before.volume) < 1e-8);
      assert.equal(after.history, before.history);
      assert.equal(after.events, before.events);
      assert.equal(after.undoDescription, "gotas");
      assert.equal(after.afterUndoCount, after.count - 20);
      assert.equal(after.afterUndoHistory, before.history - 1);
    } finally { await page.close(); }
  } finally { await browser.close(); }
});
