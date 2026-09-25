// Modelos acrescentados na versão 0.3: sais, tampões, antiácidos, chuva e temperatura.
// Cada verificação compara o motor com um valor independente (livro ou cálculo direto).
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), assert = require('node:assert/strict');
const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
for (const name of ['core/namespace', 'data/catalogo', 'data/cotidiano', 'data/sais', 'data/ambiente-saude', 'data/funcoes', 'simulation/quimica']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', name + '.js'), 'utf8'), ctx);
}
const { chem, funcoes, acidos, bases } = ctx.SIAB;
const tube = (solution, extra = {}) => ({ solution, concentration: .1, initialVolume: 1, dilution: 1,
  titrant: 'water', titrantConcentration: .1, titrantDilution: 1, additions: [], indicator: 'universal', ...extra });
let count = 0;
const near = (actual, expected, tol, label) => { assert.ok(Math.abs(actual - expected) < tol, `${label}: ${actual} ≠ ${expected}`); count++; };
const pH = (id, extra) => chem.solve(tube(id, extra)).pH;

// Hidrólise salina a 0,1 mol/L: aproximações de livro √(Ka·C) e √(Kb·C).
near(pH('nacl'), 7, 1e-6, 'NaCl');
near(pH('nh4cl'), -Math.log10(Math.sqrt(1e-14 / 1.8e-5 * .1)), .01, 'NH₄Cl');
near(pH('ch3coona'), 14 + Math.log10(Math.sqrt(1e-14 / 1.8e-5 * .1)), .01, 'CH₃COONa');
near(pH('na2co3'), 14 + Math.log10(Math.sqrt(1e-14 / 4.7e-11 * .1)), .02, 'Na₂CO₃');

// Tampões: pH = pKa com componentes iguais; Henderson-Hasselbalch após ácido.
near(pH('acetateBuffer', { concentration: .01 }), -Math.log10(1.8e-5), .01, 'tampão acetato');
near(pH('phosphateBuffer', { concentration: .01 }), 7.20, .02, 'tampão fosfato');
const hh = -Math.log10(1.8e-5) + Math.log10((.01 - .001) / (.01 + .001));
near(pH('acetateBuffer', { concentration: .01, titrant: 'hcl', titrantConcentration: .01, additions: [.1] }), hh, .01, 'Henderson-Hasselbalch');
// O mesmo ácido em água pura: queda muito maior.
near(pH('water', { titrant: 'hcl', titrantConcentration: .01, additions: [.1] }), -Math.log10(.001 / 1.1), 1e-3, 'água + HCl');

// Base pouco solúvel saturada: s = (Kps/4)^(1/3); [OH⁻] = 2s.
near(pH('mgoh2'), 14 + Math.log10(2 * Math.cbrt(8.9e-12 / 4)), .01, 'Mg(OH)₂ saturado');
// Com ácido em excesso, o Mg(OH)₂ se dissolve todo: sobra HCl.
near(pH('hcl', { titrant: 'mgoh2', titrantConcentration: .1, additions: [.25] }), -Math.log10((.1 - .05) / 1.25), 1e-3, 'Mg(OH)₂ dissolvido');
// Al(OH)₃ em excesso limita o pH perto de 4 (Kps = 2 × 10⁻³²).
const al = pH('hcl', { titrant: 'aloh3', titrantConcentration: .1, additions: [1] });
assert.ok(al > 3.8 && al < 4.3, 'Al(OH)₃ se autolimita perto de pH 4: ' + al); count++;
// Água de cal: base forte com 2 OH⁻ por fórmula.
near(pH('limewater', { concentration: .001 }), 14 + Math.log10(.002), 1e-3, 'água de cal');

// Chuva: pH ≈ 5,6 pelo CO₂ do ar; chuva ácida abaixo disso.
near(pH('cleanRain'), 5.65, .05, 'chuva limpa');
assert.ok(pH('acidRain') < 5.6); count++;

// Temperatura: a água pura continua neutra, com pH = pKw/2.
for (const [T, pkw] of [[0, 14.95], [25, 14], [50, 13.26], [100, 12.25]]) {
  const r = chem.solve(tube('water', { temperature: T }));
  near(r.pH, pkw / 2, 1e-3, `água a ${T} °C`);
  assert.equal(r.phase, 'Neutra'); count++;
}
near(pH('naoh', { concentration: 1e-4, temperature: 50 }), 13.26 - 4, .01, 'NaOH a 50 °C');
near(pH('hcl', { concentration: 1e-4, temperature: 50 }), 4, .01, 'HCl a 50 °C');

// Espécies da lupa: balanço de massa e carga do ácido acético.
const acetic = tube('acetic', { concentration: .01 });
const species = chem.species(acetic);
const conc = f => species.find(x => x.formula === f)?.conc || 0;
near(conc('CH₃COOH') + conc('CH₃COO⁻'), .01, 1e-12, 'balanço de massa do acetato');
near(conc('H₃O⁺'), conc('CH₃COO⁻') + conc('OH⁻'), 1e-12, 'balanço de cargas');
near(chem.alpha(1.8e-5, chem.solve(acetic).pH), .042, .001, 'grau de ionização 0,01 mol/L');
near(chem.alpha(1.8e-5, pH('acetic')), .013, .001, 'grau de ionização 0,1 mol/L');
assert.equal(chem.species(tube('hcl')).some(x => x.formula === 'HCl'), false); count++;

// Equivalência com bases de 2 e 3 OH⁻ por fórmula.
const eq = chem.solve(tube('hcl', { titrant: 'mgoh2', titrantConcentration: .1 })).equivalenceVolume;
near(eq, .5, 1e-12, 'volume de equivalência com Mg(OH)₂');

// Detetive: a faixa de cada cor é coerente com a cor calculada.
for (const ind of ['methyl', 'btb', 'phenol', 'litmus', 'cabbage']) {
  for (const name of chem.colorNames(ind)) {
    const [a, b] = chem.colorRange(ind, name);
    assert.equal(chem.color(ind, (a + b) / 2).name, name, `${ind} ${name}`); count++;
  }
}

// Construtor de neutralização: coeficientes e fórmulas.
const A = id => acidos.find(x => x.id === id), B = id => bases.find(x => x.id === id);
assert.equal(funcoes.total(A('h3po4'), B('caoh2')).equacao, '2 H₃PO₄ + 3 Ca(OH)₂ → Ca₃(PO₄)₂ + 6 H₂O'); count++;
assert.equal(funcoes.total(A('h2so4'), B('naoh')).equacao, 'H₂SO₄ + 2 NaOH → Na₂SO₄ + 2 H₂O'); count++;
assert.equal(funcoes.total(A('h2so4'), B('caoh2')).sal, 'CaSO₄'); count++;
assert.equal(funcoes.total(A('h2so4'), B('aloh3')).sal, 'Al₂(SO₄)₃'); count++;
assert.equal(funcoes.total(A('h2so4'), B('nh4oh')).sal, '(NH₄)₂SO₄'); count++;
assert.equal(funcoes.total(A('hcl'), B('nh4oh')).nomeSal, 'cloreto de amônio'); count++;
const parciais = funcoes.parciais(A('h3po4'), B('naoh')).map(x => x.sal + ' ' + x.nomeSal);
assert.equal(parciais.join(' | '), ['NaH₂PO₄ di-hidrogenofosfato de sódio', 'Na₂HPO₄ hidrogenofosfato de sódio'].join(' | ')); count++;
assert.equal(funcoes.parciais(A('h2so4'), B('naoh'))[0].equacao, 'H₂SO₄ + NaOH → NaHSO₄ + H₂O'); count++;
assert.equal(funcoes.parciais(A('hcl'), B('caoh2'))[0].nomeSal, 'hidroxicloreto de cálcio'); count++;
assert.equal(funcoes.parciais(A('hcl'), B('aloh3'))[1].equacao, '2 HCl + Al(OH)₃ → Al(OH)Cl₂ + 2 H₂O'); count++;
assert.equal(A('h3po3').h, 2); assert.equal(A('h3po2').h, 1); count++;
near(ctx.SIAB.massaMolar(A('h2so4').atomos), 98.07, .01, 'massa molar H₂SO₄');

console.log(`${count} verificações de sais, tampões, antiácidos, chuva, temperatura, espécies e funções: OK`);
