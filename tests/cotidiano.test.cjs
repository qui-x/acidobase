const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), assert = require('node:assert/strict');
const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
for (const name of ['core/namespace', 'data/catalogo', 'data/cotidiano', 'simulation/quimica']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', name + '.js'), 'utf8'), ctx);
}
const { chem, solutions } = ctx.SIAB;
const tube = (solution, extra = {}) => ({ solution, concentration: .01, dilution: 1, initialVolume: 1,
  titrant: 'water', titrantConcentration: .1, titrantDilution: 1, additions: [], indicator: 'cabbage', ...extra });
const samples = Object.keys(solutions).filter(id => solutions[id].kind === 'sample');
assert.equal(samples.length, 15);
// Independently known amphiprotic limit: 1/2(pKa1 + pKa2), not pH interpolation.
const carbonate = chem.solve(tube('bicarbonate')).pH;
const amphiprotic = -.5 * Math.log10(4.3e-7 * 4.7e-11);
assert.ok(Math.abs(carbonate - amphiprotic) < .01);
for (const id of samples) {
  const base = chem.solve(tube(id));
  assert.ok(Number.isFinite(base.pH) && base.pH >= 0 && base.pH <= 14, id);
  assert.equal(base.approximate, true);
  assert.equal(base.atEquivalence, false);
  // Mixing equal preparations preserves composition and pH.
  const same = chem.solve(tube(id, { titrant: id, additions: [.5] }));
  assert.ok(Math.abs(base.pH - same.pH) < 1e-9, id + ' same-stock conservation');
  // Adding water and preparing the corresponding twofold dilution agree.
  const water = chem.solve(tube(id, { additions: [1] }));
  const dilution = chem.solve(tube(id, { dilution: 2 }));
  assert.ok(Math.abs(water.pH - dilution.pH) < 1e-9, id + ' dilution conservation');
  for (const factor of [2, 5, 10]) {
    const result = chem.solve(tube(id, { dilution: factor }));
    assert.ok(Math.abs(result.pH - 7) <= Math.abs(base.pH - 7) + 1e-8, id + ' toward neutral');
  }
  // A strong base must not lower the equilibrium pH; acid must not raise it.
  for (const [titrant, direction] of [['naoh', 1], ['hcl', -1]]) {
    let previous = base.pH;
    for (let count = 1; count <= 12; count++) {
      const result = chem.solve(tube(id, { titrant, additions: Array(count).fill(.05) }));
      assert.ok(Number.isFinite(result.pH), id);
      assert.ok((result.pH - previous) * direction >= -1e-8, id + ' monotonic ' + titrant);
      assert.equal(result.atEquivalence, false);
      previous = result.pH;
    }
  }
}
const coffee = tube('coffee', { indicator: 'none' });
assert.equal(chem.liquid(coffee).name, 'marrom escuro');
coffee.indicator = 'btb';
const native = chem.liquid(coffee, false), isolated = chem.liquid(coffee, true);
assert.notDeepEqual(native.rgb, isolated.rgb);
assert.deepEqual(isolated.rgb, chem.color('btb', chem.solve(coffee).pH).rgb);
assert.equal(chem.solve(tube('hcl')).approximate, false);
assert.equal(chem.solve(tube('hcl', { titrant: 'lemon', additions: [.05] })).approximate, true);
assert.match(chem.color('cabbage', 2).name, /rosa|vermelho/);
assert.match(chem.color('cabbage', 11).name, /verde/);
console.log('15 amostras: conservação, diluição, resposta a ácidos/bases, bicarbonato, cores e limites de equivalência: OK');
