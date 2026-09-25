// Mistura geral (modo secreto): o motor aceita um recipiente com vários
// componentes e a função SIAB.misturarTubos junta tudo o que há nos tubos.
// Valores conferidos com o balanço de cargas feito à mão.
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), assert = require('node:assert/strict');
const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
for (const nome of ['core/namespace', 'core/util', 'data/catalogo', 'data/cotidiano', 'data/sais', 'data/ambiente-saude', 'data/funcoes', 'simulation/quimica', 'core/estado']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', nome + '.js'), 'utf8'), ctx);
}
const { SIAB } = ctx;
let count = 0;
const tubo = (solution, extra = {}) => ({ ...SIAB.TUBE_DEFAULTS, solution, concentration: .01, initialVolume: 1, titrant: 'water', indicator: 'none', additions: [], ...extra });
const gotas = mL => Array(Math.round(mL / .05)).fill(.05);
const pHMistura = tubos => {
  const spec = SIAB.misturarTubos(tubos);
  return { spec, r: SIAB.chem.solve({ ...tubo('water'), initialVolume: spec.volume, componentes: spec.componentes, indicadores: spec.indicadores, indicator: spec.indicator }) };
};
const perto = (a, b, tol, msg) => { assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a.toFixed(3)} ≠ ${b}`); count++; };

// 1. Ácido forte + base forte em quantidades iguais: neutro.
perto(pHMistura([tubo('hcl'), tubo('naoh')]).r.pH, 7, .01, 'HCl + NaOH (mesma quantidade)');
// 2. Diluição: 1 mL de HCl 0,01 + 1 mL de água → [H₃O⁺] = 0,005 → pH 2,30.
perto(pHMistura([tubo('hcl'), tubo('water')]).r.pH, 2.30, .01, 'HCl diluído pela metade');
// 3. Tampão: ácido acético + acetato de sódio 0,1 mol/L, volumes iguais → pH = pKa (4,76).
perto(pHMistura([tubo('acetic', { concentration: .1 }), tubo('ch3coona', { concentration: .1 })]).r.pH, 4.76, .03, 'tampão acetato');
// 4. Um só tubo "despejado" dá o mesmo pH que ele tinha (gotas viram componente).
const t4 = tubo('hcl', { titrant: 'naoh', titrantConcentration: .01, additions: gotas(.6) });
perto(pHMistura([t4]).r.pH, SIAB.chem.solve(t4).pH, 1e-6, 'conservação: tubo com gotas');
// 5. Excesso de base: (1 mL HCl + 0,5 mL NaOH) + 1 mL NaOH → sobra 0,005 mmol de OH⁻ em 2,5 mL → pH 11,30.
perto(pHMistura([tubo('hcl', { titrant: 'naoh', titrantConcentration: .01, additions: gotas(.5) }), tubo('naoh')]).r.pH, 11.30, .01, 'excesso de base');
// 6. Componentes iguais somam volume; volume total conservado.
const { spec: s6 } = pHMistura([tubo('hcl'), tubo('hcl'), tubo('naoh', { additions: [] })]);
assert.equal(s6.componentes.length, 2); count++;
assert.equal(s6.componentes.find(x => x.id === 'hcl').volume, 2); count++;
assert.equal(s6.volume, 3); count++;
// 7. Mistura de indicadores: fenolftaleína + bromotimol, meio a meio.
const { spec: s7 } = pHMistura([tubo('naoh', { indicator: 'phenol' }), tubo('naoh', { indicator: 'btb' })]);
assert.equal(JSON.stringify(s7.indicadores.map(x => [x.id, x.fracao])), JSON.stringify([['phenol', .5], ['btb', .5]])); count++;
const rosa = SIAB.chem.color('phenol', 12).rgb, azul = SIAB.chem.color('btb', 12).rgb;
const misto = SIAB.chem.colorMix(s7.indicadores, 12);
assert.ok(misto.rgb.every((v, i) => v >= Math.min(rosa[i], azul[i]) - 1 && v <= Math.max(rosa[i], azul[i]) + 1), 'cor entre rosa e azul'); count++;
assert.equal(misto.name, 'cor composta'); count++;
// Em meio ácido a fenolftaleína é incolor: sobra só o amarelo do bromotimol.
assert.equal(SIAB.chem.colorMix(s7.indicadores, 3).name, 'amarelo'); count++;
// 8. Tubo sem indicador dilui a cor: mesmo nome, cor mais fraca.
const { spec: s8 } = pHMistura([tubo('naoh', { indicator: 'btb' }), tubo('naoh')]);
assert.equal(s8.indicator, 'btb'); count++;
const fraca = SIAB.chem.colorMix(s8.indicadores, 12), cheia = SIAB.chem.color('btb', 12);
assert.equal(fraca.name, cheia.name); count++;
assert.ok(fraca.opacity < cheia.opacity, 'cor mais fraca'); count++;
// 9. Recipiente da mistura: sem equivalência única; amostras deixam o resultado aproximado.
const { r: r9 } = pHMistura([tubo('hcl'), tubo('lemon')]);
assert.equal(r9.equivalenceVolume, null); count++;
assert.equal(r9.approximate, true); count++;
// 10. Espécies da lupa: balanço de cargas fecha na mistura.
const t10 = { ...tubo('water'), ...(() => { const s = SIAB.misturarTubos([tubo('hcl'), tubo('naoh', { concentration: .005 })]); return { initialVolume: s.volume, componentes: s.componentes }; })() };
const r10 = SIAB.chem.solve(t10);
perto(r10.h, .0025, 2e-5, '[H₃O⁺] depois de neutralizar metade');

console.log(`${count} verificações da mistura geral (pH, tampão, conservação, excesso, indicadores misturados): OK`);
