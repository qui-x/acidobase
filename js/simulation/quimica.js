'use strict';
/* Modelo ideal, aquoso e isotérmico a 25 °C. A raiz da eletroneutralidade
   considera a autoionização da água, balanços de massa e diluição.
   Fontes e limites: docs/modelo-quimico.md. Nenhuma interpolação de pH. */
SIAB.chem = (() => {
  const KW = 1e-14;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function added(tube) { return tube.additions.reduce((sum, v) => sum + v, 0); }
  function solve(tube) {
    const va = added(tube), volume = tube.initialVolume + va;
    let positive = 0, negative = 0;
    const acids = [], bases = [];
    [[tube.solution, tube.concentration * tube.initialVolume / volume], [tube.titrant, tube.titrantConcentration * va / volume]].forEach(([id, c]) => {
      const s = SIAB.solutions[id];
      if (s.kind === 'strongAcid') negative += c;
      if (s.kind === 'strongBase') positive += c;
      if (s.kind === 'weakAcid') acids.push([c, s.ka]);
      if (s.kind === 'weakBase') bases.push([c, s.ka]);
    });
    function charge(pH) {
      const h = 10 ** -pH;
      return h + positive + bases.reduce((sum, [c, ka]) => sum + c * h / (ka + h), 0)
        - KW / h - negative - acids.reduce((sum, [c, ka]) => sum + c * ka / (ka + h), 0);
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
    return { pH, added: va, volume, drops: tube.additions.length, equivalenceVolume,
      atEquivalence: equivalenceVolume !== null && Math.abs(va - equivalenceVolume) < 1e-8,
      phase: Math.abs(pH - 7) < 0.005 ? 'Neutra' : pH < 7 ? 'Ácida' : 'Básica' };
  }
  function mix(a, b, t) { return a.map((v, i) => Math.round(v + (b[i] - v) * t)); }
  function color(indicator, pH) {
    if (indicator === 'none') return { rgb: [233,237,243], opacity: .14, name: 'incolor', progress: null };
    if (indicator === 'universal') {
      // Paleta didática representativa: o indicador universal é uma mistura
      // cuja carta de cores depende da formulação, não um medidor exato.
      const stops = [[1,[210,43,58],'vermelho'],[3,[239,91,41],'vermelho alaranjado'],[5,[246,203,39],'amarelo'],[7,[73,167,86],'verde'],[9,[32,153,177],'azul esverdeado'],[11,[65,95,210],'azul'],[14,[129,62,181],'roxo']];
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
  return { solve, color, added, KW };
})();
