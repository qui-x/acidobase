const assert = require("node:assert/strict");
const { load } = require("./helpers.cjs");
const { SIAB: S } = load(["js/simulation/medicoes.js"]);
const results = [];
const equal = (actual, expected) =>
  assert.deepEqual(
    JSON.parse(JSON.stringify(actual)),
    JSON.parse(JSON.stringify(expected)),
  );
const make = (values, tech = "phmetro", extra = {}) =>
  values.map((valor, i) => ({
    id: String(i),
    tecnica: tech,
    valor,
    unidade:
      tech === "temperatura"
        ? "°C"
        : tech === "condutividade"
          ? "µS/cm"
          : tech === "indicador"
            ? "cor"
            : "pH",
    adicionado: 0,
    temperatura: 25,
    em: new Date(1000 * i).toISOString(),
    context: {
      recipiente: 1,
      solucao: "hcl",
      reagente: "naoh",
      modulo: "medir",
      etapa: "bancada",
      volumeInicial: 1,
    },
    ...extra,
  }));
function test(name, fn) {
  fn();
  results.push({ name, status: "OK" });
  console.log("OK", name);
}
test("pHmetro: próximos preservam faixa e média", () => {
  const g = S.medicoes.compact(make([7.01, 7.02, 7.01, 7.03]));
  assert.equal(g.length, 1);
  assert.equal(g[0].count, 4);
  assert.equal(g[0].min, 7.01);
  assert.equal(g[0].max, 7.03);
  assert.ok(Math.abs(g[0].representativeValue - 7.0175) < 1e-12);
});
test("Fita discreta: quatro, três e uma leitura", () =>
  equal(
    S.medicoes
      .compact(make([4, 4, 4, 4, 5, 5, 5, 6], "fita"))
      .map((g) => g.count),
    [4, 3, 1],
  ));
test("Tolerância usa faixa completa, não encadeia deriva", () =>
  assert.equal(S.medicoes.compact(make([7.0, 7.02, 7.04])).length, 2));
test("Sequência interrompida não agrupa regiões distantes", () =>
  equal(
    S.medicoes.compact(make([7, 7, 8, 7, 7])).map((g) => g.count),
    [2, 1, 2],
  ));
test("Troca de instrumento quebra grupo", () => {
  const raw = make([7, 7, 7]);
  raw[1].tecnica = "fita";
  assert.equal(S.medicoes.compact(raw).length, 3);
});
for (const [field, value] of [
  ["solucao", "acetic"],
  ["recipiente", 2],
  ["etapa", "nova"],
  ["modulo", "calcular"],
  ["reagente", "hcl"],
])
  test("Contexto: " + field, () => {
    const raw = make([7, 7]);
    raw[1].context = { ...raw[1].context, [field]: value };
    assert.equal(S.medicoes.compact(raw).length, 2);
  });
test("Mudança térmica relevante quebra grupo", () => {
  const raw = make([7, 7]);
  raw[1].temperatura = 26;
  assert.equal(S.medicoes.compact(raw).length, 2);
});
test("Termômetro tem política própria", () =>
  equal(
    S.medicoes
      .compact(make([25, 25.1, 25.2, 26], "temperatura"))
      .map((g) => g.count),
    [3, 1],
  ));
test("Condutivímetro tem política própria", () =>
  equal(
    S.medicoes
      .compact(make([100, 100.2, 100.4, 101], "condutividade"))
      .map((g) => g.count),
    [3, 1],
  ));
test("Indicador agrupa estados visuais contíguos", () =>
  equal(
    S.medicoes
      .compact(
        make(
          ["amarelo", "amarelo", "amarelo", "laranja", "laranja"],
          "indicador",
        ),
      )
      .map((g) => g.count),
    [3, 2],
  ));
test("Região de equivalência conserva registros individuais", () => {
  const raw = make([6.98, 7, 7.01]);
  raw.forEach((m, i) => (m.adicionado = 0.95 + i * 0.05));
  assert.equal(S.medicoes.compact(raw, { equivalencias: [1] }).length, 3);
});
test("Aumento da derivada conserva detalhe", () => {
  const raw = make([2, 2.01, 2.02, 2.08, 4, 7, 10]);
  raw.forEach((m, i) => (m.adicionado = i * 0.05));
  assert.ok(S.medicoes.compact(raw).filter((g) => g.count === 1).length >= 5);
});
test("Adição volumosa inicia outro grupo", () => {
  const raw = make([7, 7]);
  raw[1].adicionado = 1;
  assert.equal(S.medicoes.compact(raw).length, 2);
});
test("Dados brutos intactos e expansão reversível", () => {
  const raw = make([7.01, 7.02, 7.03]),
    before = JSON.stringify(raw),
    g = S.medicoes.compact(raw);
  assert.equal(JSON.stringify(raw), before);
  equal(
    g.flatMap((x) => x.records),
    raw,
  );
  equal(
    g.flatMap((x) => x.indices),
    [0, 1, 2],
  );
  assert.equal(S.medicoes.table(raw).linhas.length, 3);
});
require("node:fs").writeFileSync(
  require("node:path").join(__dirname, "results", "compactacao.json"),
  JSON.stringify({ date: new Date().toISOString(), cases: results }, null, 2),
);
