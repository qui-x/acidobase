'use strict';
/* Modelo ideal, aquoso e isotérmico a 25 °C. A raiz da eletroneutralidade
   considera a autoionização da água, balanços de massa e diluição.
   Amostras do cotidiano: equilíbrios representativos, com parâmetros didáticos.
   Fontes e limites: docs/modelo-quimico.md e docs/cotidiano.md. */
SIAB.chem = (() => {
  const KW = 1e-14;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function added(tube) { return tube.additions.reduce((sum, v) => sum + v, 0); }
  function meanCharge(pH, pKa) {
    let weight = 1, denominator = 1, numerator = 0;
    pKa.forEach((pk, index) => {
      weight *= 10 ** (pH - pk);
      denominator += weight;
      numerator += (index + 1) * weight;
    });
    return numerator / denominator;
  }
  function sampleStock(solution) {
    const model = solution.model;
    const systems = model.systems.map(x => ({ total: x.total, pKa: SIAB.acidFamilies[x.family] }));
    const h = 10 ** -(model.targetPH ?? 7);
    const fixedCharge = model.fixedCharge ?? (KW / h - h + systems.reduce((sum, x) => sum + x.total * meanCharge(model.targetPH, x.pKa), 0));
    return { systems, fixedCharge };
  }
  function solve(tube) {
    const va = added(tube), volume = tube.initialVolume + va;
    let positive = 0, negative = 0;
    const acids = [], bases = [], polyAcids = [];
    [[tube.solution, tube.concentration, tube.initialVolume, tube.dilution], [tube.titrant, tube.titrantConcentration, va, tube.titrantDilution]].forEach(([id, concentration, v, dilution]) => {
      const s = SIAB.solutions[id];
      const fraction = v / volume, c = concentration * fraction;
      if (s.kind === 'sample' && fraction > 0) {
        const stock = sampleStock(s), scale = fraction / (dilution || 1);
        positive += stock.fixedCharge * scale;
        stock.systems.forEach(x => polyAcids.push({ total: x.total * scale, pKa: x.pKa }));
      }
      if (s.kind === 'strongAcid') negative += c;
      if (s.kind === 'strongBase') positive += c;
      if (s.kind === 'weakAcid') acids.push([c, s.ka]);
      if (s.kind === 'weakBase') bases.push([c, s.ka]);
    });
    function charge(pH) {
      const h = 10 ** -pH;
      return h + positive + bases.reduce((sum, [c, ka]) => sum + c * h / (ka + h), 0)
        - KW / h - negative - acids.reduce((sum, [c, ka]) => sum + c * ka / (ka + h), 0)
        - polyAcids.reduce((sum, x) => sum + x.total * meanCharge(pH, x.pKa), 0);
    }
    let lo = -2, hi = 16;
    for (let i = 0; i < 90; i++) {
      const mid = (lo + hi) / 2;
      if (charge(mid) > 0) lo = mid; else hi = mid;
    }
    const pH = (lo + hi) / 2;
    const typeA = SIAB.solutions[tube.solution].kind;
    const typeB = SIAB.solutions[tube.titrant].kind;
    const opposite = (typeA.endsWith('Acid') && typeB.endsWith('Base')) || (typeA.endsWith('Base') && typeB.endsWith('Acid'));
    const equivalenceVolume = opposite ? tube.concentration * tube.initialVolume / tube.titrantConcentration : null;
    const approximate = typeA === 'sample' || (va > 0 && typeB === 'sample');
    return { pH, approximate, added: va, volume, drops: tube.additions.length, equivalenceVolume,
      atEquivalence: equivalenceVolume !== null && Math.abs(va - equivalenceVolume) < 1e-8,
      phase: Math.abs(pH - 7) < 0.005 ? 'Neutra' : pH < 7 ? 'Ácida' : 'Básica' };
  }
  function mix(a, b, t) { return a.map((v, i) => Math.round(v + (b[i] - v) * t)); }
  function color(indicator, pH) {
    if (indicator === 'none') return { rgb: [233,237,243], opacity: .14, name: 'incolor', progress: null };
    if (indicator === 'universal' || indicator === 'cabbage') {
      // Paleta didática representativa: o indicador universal é uma mistura
      // cuja carta de cores depende da formulação, não um medidor exato.
      const stops = indicator === 'cabbage'
        ? [[1,[205,40,77],'vermelho'],[3,[219,65,130],'rosa'],[5,[156,77,172],'violeta'],[7,[99,88,180],'violeta azulado'],[8,[54,119,177],'azul'],[9,[44,155,126],'verde azulado'],[11,[123,176,68],'verde'],[13,[215,198,60],'amarelo'],[14,[223,203,75],'amarelo']]
        : [[1,[210,43,58],'vermelho'],[3,[239,91,41],'vermelho alaranjado'],[5,[246,203,39],'amarelo'],[7,[73,167,86],'verde'],[9,[32,153,177],'azul esverdeado'],[11,[65,95,210],'azul'],[14,[129,62,181],'roxo']];
      const p = clamp(pH, 1, 14);
      let i = 0; while (i < stops.length - 2 && p > stops[i + 1][0]) i++;
      const t = (p - stops[i][0]) / (stops[i + 1][0] - stops[i][0]);
      return { rgb: mix(stops[i][1], stops[i + 1][1], t), opacity: .86, name: t < .5 ? stops[i][2] : stops[i + 1][2], progress: null };
    }
    const ind = SIAB.indicators[indicator];
    // Interpolação visual suave APENAS da cor, na faixa declarada.
    let t = clamp((pH - ind.low) / (ind.high - ind.low), 0, 1);
    t = t * t * (3 - 2 * t);
    const rgb = t < .5 ? mix(ind.acid, ind.middle, t * 2) : mix(ind.middle, ind.base, (t - .5) * 2);
    const name = t < .02 ? ind.acidName : t > .98 ? ind.baseName : ind.middleName;
    return { rgb, opacity: indicator === 'phenol' ? .14 + .74 * t : .86, name, progress: t };
  }
  function liquid(tube, indicatorOnly = false, result = solve(tube)) {
    const indicator = color(tube.indicator, result.pH);
    const components = [[tube.solution, tube.initialVolume, tube.dilution], [tube.titrant, result.added, tube.titrantDilution]]
      .map(([id, v, dilution]) => ({ natural: SIAB.solutions[id].natural, fraction: v / result.volume / (dilution || 1) }))
      .filter(x => x.natural && x.fraction > 0 && x.natural.opacity > .025);
    const weight = components.reduce((sum, x) => sum + x.natural.opacity * x.fraction, 0);
    if (!weight || (indicatorOnly && tube.indicator !== 'none')) return { ...indicator, indicatorName: indicator.name, masked: false };
    const rgb = [0,1,2].map(i => Math.round(components.reduce((sum, x) => sum + x.natural.rgb[i] * x.natural.opacity * x.fraction, 0) / weight));
    const pigmentName = components.length === 1 ? components[0].natural.name : 'cor das amostras';
    const dye = tube.indicator === 'none' ? 0 : tube.indicator === 'phenol' ? (indicator.progress || 0) * .8 : .75;
    return {
      rgb: mix(rgb, indicator.rgb, dye / (dye + weight)),
      opacity: Math.max(.14, Math.min(.97, weight + dye * (1 - weight))),
      name: dye > .02 ? 'cor composta' : pigmentName,
      indicatorName: indicator.name, masked: dye > .02, pigmentName
    };
  }
  return { solve, color, liquid, added, KW, meanCharge };
})();
