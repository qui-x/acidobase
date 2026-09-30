const assert = require("node:assert/strict");
const { load, tube } = require("./helpers.cjs");
const { SIAB: S } = load();
let count = 0;
function test(name, fn) {
  try {
    fn();
    console.log("OK", name);
    count++;
  } catch (e) {
    console.error("FALHA", name);
    throw e;
  }
}
const solve = (o) => S.chem.solve(tube(S, o));
const near = (v, expected, tol = 0.02) =>
  assert.ok(Math.abs(v - expected) <= tol, `${v} != ${expected} ± ${tol}`);
test("HCl 0,1 M", () =>
  near(solve({ solution: "hcl", concentration: 0.1 }).pH, 1, 1e-8));
test("NaOH 0,1 M", () =>
  near(solve({ solution: "naoh", concentration: 0.1 }).pH, 13, 1e-8));
test("Acético: raiz analítica", () => {
  let C = 0.1,
    K = 1.8e-5;
  near(
    solve({ solution: "acetic", concentration: C }).pH,
    -Math.log10((-K + Math.sqrt(K * K + 4 * K * C)) / 2),
    1e-5,
  );
});
test("NH3: raiz analítica", () => {
  let C = 0.1,
    K = 1.8e-5;
  near(
    solve({ solution: "ammonia", concentration: C }).pOH,
    -Math.log10((-K + Math.sqrt(K * K + 4 * K * C)) / 2),
    1e-5,
  );
});
test("Tampão acetato", () =>
  near(
    solve({ solution: "acetateBuffer", concentration: 0.1 }).pH,
    -Math.log10(1.8e-5),
    0.005,
  ));
test("NH4Cl", () =>
  near(solve({ solution: "nh4cl", concentration: 0.1 }).pH, 5.128, 0.015));
test("CH3COONa", () =>
  near(solve({ solution: "ch3coona", concentration: 0.1 }).pH, 8.872, 0.015));
test("Bicarbonato", () =>
  near(solve({ solution: "nahco3", concentration: 0.1 }).pH, 8.34, 0.04));
test("Ácido fosfórico e balanço de frações", () => {
  let r = solve({ solution: "h3po4", concentration: 0.01 });
  assert.ok(r.pH > 2 && r.pH < 2.5);
  r.systems.forEach((x) =>
    near(
      x.fractions.reduce((a, b) => a + b, 0),
      1,
      1e-12,
    ),
  );
  assert.equal(r.systems[0].fractions.length, 4);
  assert.equal(r.equivalencias.length, 2);
});
test("Neutralização forte × forte", () =>
  near(
    solve({
      solution: "hcl",
      concentration: 0.1,
      titrantConcentration: 0.1,
      additions: [1],
    }).pH,
    7,
    1e-8,
  ));
test("Ácido fraco × base forte: equivalência básica", () => {
  let r = solve({
    solution: "acetic",
    concentration: 0.1,
    titrantConcentration: 0.1,
    additions: [1],
  });
  assert.ok(r.atEquivalence && r.pH > 8);
});
test("Meia-equivalência de ácido fraco", () =>
  near(
    solve({
      solution: "acetic",
      concentration: 0.1,
      titrantConcentration: 0.1,
      additions: [0.5],
    }).pH,
    -Math.log10(1.8e-5),
    0.002,
  ));
test("Mistura conserva volume, neutraliza por mols", () => {
  const a = tube(S, { solution: "hcl", concentration: 0.1 }),
    b = tube(S, { solution: "naoh", concentration: 0.01 });
  const m = S.misturarTubos([a, b]);
  near(m.volume, 2, 1e-12);
  near(solve({ componentes: m.componentes }).pH, -Math.log10(0.045), 1e-7);
});
test("Diluição com água", () =>
  near(
    solve({
      solution: "hcl",
      concentration: 0.01,
      titrant: "water",
      additions: [9],
    }).pH,
    3,
    1e-7,
  ));
test("Neutralidade por temperatura", () => {
  for (const T of [0, 10, 25, 37, 50, 100]) {
    let r = solve({ solution: "water", temperature: T });
    near(r.pH, r.pKw / 2, 1e-10);
    near(r.h, r.oh, 1e-12);
  }
  near(solve({ solution: "water", temperature: 50 }).pH, 6.63, 1e-8);
});
test("Kw consistente e qualidade declarada", () => {
  const r = solve({ solution: "vinegar" });
  near(r.pH + r.pOH, r.pKw, 1e-12);
  assert.equal(r.quality, "amostra representativa");
});
test("Saturação Mg(OH)2, Q=Kps", () => {
  let r = solve({ solution: "mgoh2", concentration: 0.01 }),
    mg = r.species.find((e) => e.formula === "Mg²⁺");
  near((mg.conc * r.oh * r.oh) / S.solutions.mgoh2.ksp, 1, 1e-9);
  assert.ok(r.solids.length);
});
test("Redissolução por ácido", () => {
  let r = solve({
    solution: "mgoh2",
    concentration: 0.01,
    titrant: "hcl",
    titrantConcentration: 0.1,
    additions: [1],
  });
  assert.equal(r.solids.length, 0);
  assert.ok(r.pH < 2);
});
test("Reprecipitação após redissolução", () => {
  const componentes = [
    { id: "mgoh2", concentration: 0.01, volume: 1 },
    { id: "hcl", concentration: 0.1, volume: 1 },
  ];
  let r = solve({
    componentes,
    titrant: "naoh",
    titrantConcentration: 1,
    additions: [0.2],
  });
  assert.ok(r.solids.length);
});
test("Mesmo sólido em duas fontes compartilha saturação", () => {
  const a = solve({ solution: "mgoh2", concentration: 0.01 });
  const b = solve({
    componentes: [
      { id: "mgoh2", concentration: 0.01, volume: 1 },
      { id: "mgoh2", concentration: 0.01, volume: 1 },
    ],
  });
  near(a.pH, b.pH, 1e-9);
});
test("Indicadores coerentes e mistura", () => {
  assert.equal(S.chem.color("btb", 2).name, "amarelo");
  assert.equal(S.chem.color("btb", 12).name, "azul");
  const r = solve({ indicator: "phenol" });
  assert.ok(r.indicator.rgb.every(Number.isFinite));
});
test("Condutividade de NaCl ideal", () =>
  near(
    solve({ solution: "nacl", concentration: 0.001 }).conductivity.kappa,
    126.45,
    0.03,
  ));
test("Condutividade da água", () =>
  near(solve({ solution: "water" }).conductivity.kappa, 0.05476, 1e-6));
test("Estado central em cache e invalidação", () => {
  const t = tube(S);
  const r = S.chem.solve(t);
  assert.equal(S.chem.estado(t), r);
  t.temperature = 50;
  assert.notEqual(S.chem.solve(t), r);
  assert.ok(r.species && r.conjugatePairs && r.color && r.gas);
});
test("Todas as 140 substâncias: resultados finitos e conservação de frações", () => {
  for (const id of Object.keys(S.solutions)) {
    const r = solve({ solution: id });
    assert.ok(
      Number.isFinite(r.pH) && Number.isFinite(r.conductivity.kappa),
      id,
    );
    r.systems.forEach((x) =>
      near(
        x.fractions.reduce((a, b) => a + b, 0),
        1,
        1e-10,
      ),
    );
  }
});
console.log(
  JSON.stringify({
    scientificTests: count,
    solutions: Object.keys(S.solutions).length,
  }),
);
