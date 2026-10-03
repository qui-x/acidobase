const assert = require("node:assert/strict");
const { load } = require("./helpers.cjs");
const files = [
  "js/core/persistencia.js",
  "js/core/migracoes.js",
  "js/core/progresso.js",
];
const original = {
  missoes: {
    agua: {
      concluida: true,
      data: "2025-01-01",
      respostas: { a: "Preservar" },
    },
    outra: { concluida: false },
  },
  desafios: { antigo: { recorde: 10 } },
  caderno: [
    {
      id: "nota-1",
      tipo: "previsao",
      titulo: "Legado",
      linhas: [
        ["Tabela", "0;0,00;2,57;rosa | 1;0,05;2,93;rosa"],
        ["Explicação", "Preservar texto"],
      ],
      data: "2025-01-01",
    },
  ],
};
const store = {
  siab_progresso_v1: JSON.stringify(original),
  siab_modo: "completo",
};
const a = load(files, store);
assert.equal(a.SIAB.progresso.dados.schema, 2);
assert.equal(a.SIAB.progresso.dados.caderno.length, 1);
assert.equal(a.SIAB.progresso.dados.caderno[0].tabela.linhas.length, 2);
assert.equal(a.SIAB.progresso.dados.caderno[0].linhas[0][1], "Preservar texto");
assert.equal(store.siab_progresso_v1, JSON.stringify(original));
assert.equal(a.SIAB.progresso.dados.missoes.agua.respostas.a, "Preservar");
assert.equal(JSON.parse(store.siab_inicializacao), "inicio");
const once = store.siab_investigacao_v2;
a.SIAB.migrarDados();
assert.equal(store.siab_investigacao_v2, once);
load(files, store);
assert.equal(store.siab_investigacao_v2, once);
for (let i = 0; i < 350; i++)
  a.SIAB.progresso.anotar({
    tipo: "anotacao",
    titulo: "Registro " + i,
    linhas: [],
  });
assert.equal(a.SIAB.progresso.dados.caderno.length, 351);
const corrupt = load(files, { siab_progresso_v1: "{incompleto" });
assert.equal(corrupt.SIAB.progresso.dados.caderno.length, 0);
a.SIAB.notice = () => {};
a.ctx.localStorage.setItem = () => {
  throw new Error("QuotaExceededError");
};
assert.equal(
  a.SIAB.persistencia.salvar("novo", { texto: "preservado" }),
  false,
);
assert.equal(a.SIAB.persistencia.ler("novo").texto, "preservado");
assert.equal(store.siab_progresso_v1, JSON.stringify(original));
console.log(
  JSON.stringify({
    migrationChecks: 12,
    status: "OK",
    cases: [
      "schema",
      "notes",
      "table",
      "text",
      "original backup",
      "mission",
      "startup",
      "idempotence",
      "reload",
      "351 records",
      "corrupt JSON",
      "quota fallback",
    ],
  }),
);
