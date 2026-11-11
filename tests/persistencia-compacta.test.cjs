"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = fs.readFileSync(path.resolve(__dirname, "../js/core/persistencia.js"), "utf8");

function harness(limit = Number.POSITIVE_INFINITY, behavior = "quota") {
  const data = new Map();
  const avisos = [];
  const storage = {
    get length() { return data.size; },
    key(i) { return [...data.keys()][i] ?? null; },
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) {
      if (behavior === "blocked")
        throw Object.assign(new Error("denied"), { name: "SecurityError" });
      const usage = [...data.entries()].reduce((s, [k, v]) => s + (k === key ? 0 : v.length), 0);
      if (usage + String(value).length > limit)
        throw Object.assign(new Error("quota exceeded"), { name: "QuotaExceededError", code: 22 });
      data.set(key, String(value));
    },
    removeItem(key) { data.delete(key); },
  };
  const ctx = {
    SIAB: { notice(text) { avisos.push(text); } },
    localStorage: storage,
    Map, Set, JSON, Object, Number, Array,
  };
  vm.runInNewContext(source, ctx);
  return { p: ctx.SIAB.persistencia, storage, avisos, data };
}

function scenario(n = 500) {
  const tube = {
    id: 1, name: "Erlenmeyer 1", solution: "water", concentration: 0.01,
    initialVolume: 25, dilution: 1, titrant: "naoh", titrantConcentration: 0.01,
    titrantDilution: 1, dropVolume: 0.05, indicator: "btb",
    additions: [], temperatura: 25,
    observacao: { rawMeasurements: [], eventos: [], calibracao: "referência" },
  };
  tube.observacao.leituras = tube.observacao.rawMeasurements;
  const bench = {
    tubes: [tube], activeId: 1, nextId: 2, nextGroup: 1,
    vidraria: "erlenmeyer", capacidades: { bequer: 50, erlenmeyer: 125 },
    view: "focus", history: [],
  };
  const snap = () => JSON.stringify({
    tubes: bench.tubes, activeId: bench.activeId,
    nextId: bench.nextId, nextGroup: bench.nextGroup,
    vidraria: bench.vidraria, capacidades: bench.capacidades,
  });
  for (let i = 0; i < n; i++) {
    bench.history.push({ descricao: "gotas", copia: snap() });
    if (bench.history.length > 60) bench.history.shift();
    tube.additions.push(i % 23 === 0 ? 0.025 : 0.05);
    tube.observacao.eventos.push({
      em: "2026-11-11T12:00:00.000Z", acao: "1 gota adicionada",
      volume: 25 + i * 0.05, adicionado: i * 0.05,
      temperatura: 25, leitura: null,
    });
    if (i % 10 === 0) {
      tube.observacao.rawMeasurements.push({
        id: "1-" + i, tecnica: "phmetro", valor: 7 + i / 1000,
        unidade: "pH", resolucao: 0.01, signature: "estado-" + i,
        em: "2026-11-11T12:00:00.000Z", temperatura: 25,
        volume: 25 + i * 0.05, adicionado: i * 0.05,
        context: { recipiente: 1, solucao: "water", reagente: "naoh" },
      });
    }
  }
  return bench;
}
function plain(obj) { return JSON.parse(JSON.stringify(obj)); }

test("compressão sem perdas da bancada (500 gotas, medições, eventos e 60 desfazeres)", () => {
  const h = harness(5 * 1024 * 1024), original = scenario();
  const before = JSON.stringify(original).length;
  assert.ok(before > 5 * 1024 * 1024, "O exemplo deveria ultrapassar a quota simulada");
  assert.equal(h.p.salvar("siab_bancada_v2", original), true);
  const stored = h.storage.getItem("siab_bancada_v2");
  assert.ok(stored.length < before * 0.35,
    "Compressão insuficiente: " + before + " -> " + stored.length);
  assert.equal(original.history.length, 60, "O estado original foi alterado");
  assert.equal(original.tubes[0].additions.length, 500, "Gotas do motor foram alteradas");
  const h2 = harness();
  h2.storage.setItem("siab_bancada_v2", stored);
  const restored = h2.p.ler("siab_bancada_v2", null);
  assert.deepEqual(plain(restored), plain(original), "Restauração perdeu dados científicos ou desfazeres");
  assert.equal(restored.history.length, 60);
  assert.deepEqual(JSON.parse(restored.history.at(-1).copia),
    JSON.parse(original.history.at(-1).copia), "A última posição do Desfazer foi alterada");
  const diag = h.p.diagnostico();
  assert.equal(diag.length, 1);
  assert.equal(diag[0].caracteres, stored.length);
});

test("formatos antigos continuam legíveis e gravam compactados sem apagar registros", () => {
  const h = harness(), original = scenario(70);
  const oldFormat = JSON.stringify(original);
  h.storage.setItem("siab_bancada_v2", oldFormat);
  assert.deepEqual(plain(h.p.ler("siab_bancada_v2", null)), plain(original));
  assert.equal(h.p.salvar("siab_bancada_v2", original), true);
  assert.deepEqual(plain(h.p.ler("siab_bancada_v2", null)), plain(original));
  assert.ok(h.storage.getItem("siab_bancada_v2").length < oldFormat.length);
});

test("atividade orientada compacta bench sem mexer em relatório e metadados", () => {
  const h = harness(), original = {
    schema: 2, token: "2.abc", etapa: "investigacao",
    bench: scenario(250),
    dados: { nome: "Teste", respostas: ["previsão", "observação"] },
    contexto: { tipo: "roteiro" },
  };
  const key = "siab_atividade_abc";
  assert.equal(h.p.salvar(key, original), true);
  assert.deepEqual(plain(h.p.ler(key, null)), plain(original));
  assert.equal(original.bench.tubes[0].additions.length, 250);
});

test("volumes mistos e substituições nos snapshots preservam cada valor", () => {
  const h = harness();
  const b = scenario(70);
  const snap = o => JSON.stringify(o);
  const first = JSON.parse(b.history[0].copia);
  const second = JSON.parse(b.history[1].copia);
  second.tubes[0].additions.splice(0, 1, 0.075);
  second.tubes[0].temperatura = 35;
  second.tubes[0].groupShare = { substancia: true, contaGotas: false };
  delete second.tubes[0].indicator;
  b.history = [
    { descricao: "inicial", copia: snap(first) },
    { descricao: "alterar temperatura e concentração", copia: snap(second) },
  ];
  assert.equal(h.p.salvar("siab_bancada_v2", b), true);
  assert.deepEqual(plain(h.p.ler("siab_bancada_v2", null)), plain(b));
});

test("mensagens diferenciam quota cheia de bloqueio e não repetem alertas", () => {
  const h = harness(20);
  const key = "siab_bancada_v2", current = scenario(20);
  assert.equal(h.p.salvar(key, current), false);
  assert.equal(h.p.salvar(key, current), false);
  assert.equal(h.avisos.length, 1);
  assert.match(h.avisos[0], /atingiu seu limite/i);
  assert.equal(h.p.ler(key, null), current, "Falha não deveria descartar estado em memória");

  const blocked = harness(Infinity, "blocked");
  assert.equal(blocked.p.salvar(key, current), false);
  assert.match(blocked.avisos[0], /bloqueou o armazenamento/i);
});

test("nunca comprime nem altera chaves alheias ao armazenamento experimental", () => {
  const h = harness();
  const obj = { tabela: [1, 2, 3], settings: { theme: "dark" } };
  assert.equal(h.p.salvar("siab_investigacao_v2", obj), true);
  assert.equal(h.storage.getItem("siab_investigacao_v2"), JSON.stringify(obj));
  assert.deepEqual(plain(h.p.ler("siab_investigacao_v2", null)), obj);
});


test("quota ocupada por atividade antiga é recuperada com migração reversível", () => {
  const legacy = { token: "antigo", schema: 2, bench: scenario(400) };
  const legacyText = JSON.stringify(legacy);
  const h = harness(legacyText.length + 200);
  h.storage.setItem("siab_atividade_legada", legacyText);
  const current = scenario(40);
  assert.equal(h.p.salvar("siab_bancada_v2", current), true,
    "Deveria compactar sessão antiga antes de repetir gravação");
  assert.ok(h.storage.getItem("siab_atividade_legada").length < legacyText.length / 2,
    "Sessão antiga permaneceu integralmente duplicada");
  assert.deepEqual(plain(h.p.ler("siab_atividade_legada", null)), legacy,
    "A migração mudou dados da sessão antiga");
  assert.deepEqual(plain(h.p.ler("siab_bancada_v2", null)), current);
  assert.equal(h.avisos.length, 0, "Não deveria avisar quando a recuperação obteve sucesso");
});
