'use strict';
/* Motor químico do SIAB.
   Modelo ideal, aquoso e com equilíbrio imediato. O pH é a raiz do balanço de
   cargas (eletroneutralidade), com balanços de massa, diluição e autoionização
   da água. A temperatura padrão é 25 °C; só a missão "Neutro nem sempre é 7"
   altera Kw. Amostras do cotidiano usam equilíbrios representativos.
   Fontes e limites: docs/modelo-quimico.md e docs/cotidiano.md. */
SIAB.chem = (() => {
  const KW = 1e-14;

  // pKw da água líquida (Bandura e Lvov, 2006). A 25 °C o modelo usa 14,00.
  const PKW_TABLE = [
    [0, 14.95], [10, 14.53], [20, 14.17], [25, 14.00], [30, 13.83], [40, 13.54],
    [50, 13.26], [60, 13.02], [70, 12.80], [80, 12.60], [90, 12.42], [100, 12.25]
  ];

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function pKw(temperature = 25) {
    const t = clamp(Number(temperature), 0, 100);
    for (let i = 0; i < PKW_TABLE.length - 1; i++) {
      const [t0, p0] = PKW_TABLE[i];
      const [t1, p1] = PKW_TABLE[i + 1];
      if (t <= t1) return p0 + (p1 - p0) * (t - t0) / (t1 - t0);
    }
    return PKW_TABLE.at(-1)[1];
  }

  function added(tube) {
    return tube.additions.reduce((sum, v) => sum + v, 0);
  }

  // Frações de cada espécie de um sistema com n etapas de desprotonação.
  // w₀ = 1 e wᵢ = wᵢ₋₁ × 10^(pH − pKaᵢ).
  function fractions(pH, pKa) {
    const weights = [1];
    pKa.forEach(pk => weights.push(weights.at(-1) * 10 ** (pH - pk)));
    const total = weights.reduce((sum, w) => sum + w, 0);
    return weights.map(w => w / total);
  }

  // Carga negativa média gerada pelas desprotonações: Σ(i × wᵢ) / Σ(wᵢ).
  function meanCharge(pH, pKa) {
    let weight = 1, denominator = 1, numerator = 0;
    pKa.forEach((pk, index) => {
      weight *= 10 ** (pH - pk);
      denominator += weight;
      numerator += (index + 1) * weight;
    });
    return numerator / denominator;
  }

  // Amostras calibradas: a carga dos íons fixos satisfaz o balanço no pH alvo.
  function sampleStock(solution) {
    const model = solution.model;
    const systems = model.systems.map(x => ({ total: x.total, pKa: SIAB.acidFamilies[x.family], family: x.family }));
    const h = 10 ** -(model.targetPH ?? 7);
    const fixedCharge = model.fixedCharge ?? (KW / h - h + systems.reduce((sum, x) => sum + x.total * meanCharge(model.targetPH, x.pKa), 0));
    return { systems, fixedCharge };
  }

  // O que foi posto no recipiente antes das gotas: a solução inicial ou, depois
  // de misturar tubos, a lista de componentes { id, concentration, volume, dilution }.
  function base(tube) {
    return tube.componentes?.length
      ? tube.componentes
      : [{ id: tube.solution, concentration: tube.concentration, volume: tube.initialVolume, dilution: tube.dilution }];
  }

  // Reúne o que há no tubo depois da mistura: a base e as gotas.
  // Cada componente entra no balanço de cargas diluído pelo volume total.
  function mixture(tube) {
    const va = added(tube);
    const inicio = base(tube);
    const volume = inicio.reduce((sum, x) => sum + x.volume, 0) + va;
    const sources = [
      ...inicio.map(x => ({ role: tube.componentes?.length ? 'mistura' : 'inicial', ...x })),
      { role: 'gotas', id: tube.titrant, concentration: tube.titrantConcentration, volume: va, dilution: tube.titrantDilution }
    ];
    const terms = { positive: 0, negative: 0, acids: [], bases: [], systems: [], suspensions: [], spectators: [] };
    for (const source of sources) {
      const s = SIAB.solutions[source.id];
      const fraction = source.volume / volume;
      if (!s || !(fraction > 0)) continue;
      const c = source.concentration * fraction;
      const n = s.n || 1;
      if (s.kind === 'strongAcid') {
        terms.negative += n * c;
        terms.spectators.push({ formula: s.anion, conc: c });
      }
      if (s.kind === 'strongBase') {
        terms.positive += n * c;
        terms.spectators.push({ formula: s.cation, conc: c });
      }
      if (s.kind === 'weakAcid') terms.acids.push({ c, ka: s.ka, solution: s });
      if (s.kind === 'weakBase') terms.bases.push({ c, ka: s.ka, solution: s });
      if (s.kind === 'suspension') terms.suspensions.push({ c, ksp: s.ksp, n, solution: s });
      if (s.kind === 'salt') {
        terms.positive += s.chargePerUnit * c;
        s.systems.forEach(x => terms.systems.push({ total: x.perUnit * c, pKa: SIAB.acidFamilies[x.family], family: x.family }));
        (s.spectators || []).forEach(x => terms.spectators.push({ formula: x.formula, conc: x.perUnit * c }));
      }
      if (s.kind === 'sample') {
        const stock = sampleStock(s);
        const scale = fraction / (source.dilution || 1);
        terms.positive += stock.fixedCharge * scale;
        stock.systems.forEach(x => terms.systems.push({ total: x.total * scale, pKa: x.pKa, family: x.family }));
        if (Math.abs(stock.fixedCharge * scale) > 0) {
          terms.spectators.push({
            formula: s.fixedIon || (stock.fixedCharge > 0 ? 'cátions de sais' : 'ânions de sais'),
            conc: Math.abs(stock.fixedCharge * scale)
          });
        }
      }
    }
    return { va, volume, terms };
  }

  // Base pouco solúvel M(OH)ₙ: dissolve até o limite de Kps = [Mⁿ⁺][OH⁻]ⁿ.
  function dissolved(suspension, oh) {
    return Math.min(suspension.c, suspension.ksp / oh ** suspension.n);
  }

  // Balanço de cargas: positivo quando o pH testado é baixo demais.
  function charge(terms, pH, kw) {
    const h = 10 ** -pH;
    const oh = kw / h;
    return h + terms.positive
      + terms.bases.reduce((sum, x) => sum + x.c * h / (x.ka + h), 0)
      + terms.suspensions.reduce((sum, x) => sum + x.n * dissolved(x, oh), 0)
      - oh - terms.negative
      - terms.acids.reduce((sum, x) => sum + x.c * x.ka / (x.ka + h), 0)
      - terms.systems.reduce((sum, x) => sum + x.total * meanCharge(pH, x.pKa), 0);
  }

  // Papel de cada solução no cálculo estequiométrico da equivalência.
  function role(solution) {
    if (!solution) return null;
    if (solution.kind === 'strongAcid' || solution.kind === 'weakAcid') return { type: 'acid', n: solution.n || 1 };
    if (solution.kind === 'strongBase' || solution.kind === 'weakBase' || solution.kind === 'suspension') return { type: 'base', n: solution.n || 1 };
    return null;
  }

  function solve(tube) {
    const { va, volume, terms } = mixture(tube);
    const temperature = tube.temperature ?? 25;
    const pkw = pKw(temperature);
    const kw = 10 ** -pkw;
    let lo = -2, hi = 16;
    for (let i = 0; i < 90; i++) {
      const mid = (lo + hi) / 2;
      if (charge(terms, mid, kw) > 0) lo = mid; else hi = mid;
    }
    const pH = (lo + hi) / 2;
    const initial = SIAB.solutions[tube.solution];
    const drops = SIAB.solutions[tube.titrant];
    const a = role(initial), b = role(drops);
    // Numa mistura de vários tubos não há uma única "equivalência" prevista.
    const opposite = Boolean(a && b && a.type !== b.type && !tube.componentes?.length);
    const equivalenceVolume = opposite && tube.titrantConcentration > 0
      ? tube.concentration * a.n * tube.initialVolume / (tube.titrantConcentration * b.n)
      : null;
    const weak = initial && (initial.kind === 'weakAcid' || initial.kind === 'weakBase');
    const approximate = base(tube).some(x => SIAB.solutions[x.id]?.kind === 'sample') || (va > 0 && drops?.kind === 'sample');
    const neutralPH = pkw / 2;
    return {
      pH, pOH: pkw - pH, pKw: pkw, neutralPH, temperature,
      h: 10 ** -pH, oh: kw / 10 ** -pH,
      approximate, added: va, volume, drops: tube.additions.length,
      equivalenceVolume,
      halfEquivalenceVolume: equivalenceVolume !== null && weak ? equivalenceVolume / 2 : null,
      atEquivalence: equivalenceVolume !== null && Math.abs(va - equivalenceVolume) < 1e-8,
      phase: Math.abs(pH - neutralPH) < 0.005 ? 'Neutra' : pH < neutralPH ? 'Ácida' : 'Básica'
    };
  }

  // Espécies dissolvidas no pH calculado (para a lupa molecular).
  // A água não entra na lista: há cerca de 55,5 mol/L dela.
  function species(tube, result = solve(tube)) {
    const { terms } = mixture(tube);
    const h = result.h, oh = result.oh;
    const list = [];
    const add = (formula, conc, type) => {
      if (!(conc > 0)) return;
      const found = list.find(x => x.formula === formula);
      if (found) found.conc += conc;
      else list.push({ formula, conc, type });
    };
    add('H₃O⁺', h, 'ion');
    add('OH⁻', oh, 'ion');
    terms.spectators.forEach(x => add(x.formula, x.conc, 'ion'));
    terms.acids.forEach(x => {
      add(x.solution.acidForm, x.c * h / (x.ka + h), 'molecule');
      add(x.solution.baseForm, x.c * x.ka / (x.ka + h), 'ion');
    });
    terms.bases.forEach(x => {
      add(x.solution.acidForm, x.c * h / (x.ka + h), 'ion');
      add(x.solution.baseForm, x.c * x.ka / (x.ka + h), 'molecule');
    });
    terms.systems.forEach(x => {
      const names = SIAB.familySpecies?.[x.family] || [];
      fractions(result.pH, x.pKa).forEach((f, i) => {
        const name = names[i] || `${x.family} (${i})`;
        add(name, x.total * f, /[⁺⁻]/.test(name) ? 'ion' : 'molecule');
      });
    });
    terms.suspensions.forEach(x => {
      const d = dissolved(x, oh);
      add(x.solution.cation, d, 'ion');
      add(`${x.solution.formula} sólido`, x.c - d, 'solid');
    });
    return list.sort((p, q) => q.conc - p.conc);
  }

  // Grau de ionização de um ácido fraco monoprótico: α = Ka / (Ka + [H₃O⁺]).
  function alpha(ka, pH) {
    const h = 10 ** -pH;
    return ka / (ka + h);
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

  // Vários indicadores no mesmo recipiente (depois de misturar tubos): cada um
  // contribui com a própria cor na proporção do volume que trouxe; tubo sem
  // indicador não contribui, e a fenolftaleína incolor (meio ácido) também não.
  // Aproximação didática da mistura de corantes.
  function colorMix(indicadores, pH) {
    const partes = indicadores.filter(x => x.id !== 'none' && x.fracao > 0).map(x => {
      const c = color(x.id, pH);
      return { c, peso: x.fracao * (x.id === 'phenol' ? (c.progress || 0) : 1) };
    });
    const forca = partes.reduce((sum, x) => sum + x.peso, 0);
    if (forca < .02) return { ...color('none', pH), forca: 0 };
    const rgb = [0, 1, 2].map(i => Math.round(partes.reduce((sum, x) => sum + x.c.rgb[i] * x.peso, 0) / forca));
    const principal = partes.reduce((a, b) => (b.peso > a.peso ? b : a));
    return { rgb, opacity: .14 + .72 * Math.min(1, forca), name: principal.peso / forca > .8 ? principal.c.name : 'cor composta', progress: null, forca };
  }

  // Cor do indicador de um recipiente: um indicador, ou a mistura deles.
  function indicatorColor(tube, pH) {
    return tube.indicadores?.length > 1 ? colorMix(tube.indicadores, pH) : color(tube.indicator, pH);
  }

  // Faixa de pH (entre 0 e 14) em que um indicador exibe uma cor com esse nome.
  // Usada pelo detetive: a pista é sempre coerente com a cor desenhada.
  function colorRange(indicator, name) {
    let min = null, max = null;
    for (let i = 0; i <= 1400; i++) {
      const pH = i / 100;
      if (color(indicator, pH).name === name) {
        if (min === null) min = pH;
        max = pH;
      }
    }
    return min === null ? null : [min, max];
  }

  // Nomes de cor que um indicador pode exibir, do meio ácido ao básico.
  function colorNames(indicator) {
    const names = [];
    for (let i = 0; i <= 140; i++) {
      const name = color(indicator, i / 10).name;
      if (!names.includes(name)) names.push(name);
    }
    return names;
  }

  function liquid(tube, indicatorOnly = false, result = solve(tube)) {
    const misto = tube.indicadores?.length > 1;
    const indicator = indicatorColor(tube, result.pH);
    const components = [...base(tube).map(x => [x.id, x.volume, x.dilution]), [tube.titrant, result.added, tube.titrantDilution]]
      .map(([id, v, dilution]) => ({ natural: SIAB.solutions[id].natural, fraction: v / result.volume / (dilution || 1) }))
      .filter(x => x.natural && x.fraction > 0 && x.natural.opacity > .025);
    const weight = components.reduce((sum, x) => sum + x.natural.opacity * x.fraction, 0);
    if (!weight || (indicatorOnly && tube.indicator !== 'none')) return { ...indicator, indicatorName: indicator.name, masked: false };
    const rgb = [0,1,2].map(i => Math.round(components.reduce((sum, x) => sum + x.natural.rgb[i] * x.natural.opacity * x.fraction, 0) / weight));
    const pigmentName = components.length === 1 ? components[0].natural.name : 'cor das amostras';
    const dye = misto ? .75 * Math.min(1, indicator.forca) : tube.indicator === 'none' ? 0 : tube.indicator === 'phenol' ? (indicator.progress || 0) * .8 : .75;
    return {
      rgb: mix(rgb, indicator.rgb, dye / (dye + weight)),
      opacity: Math.max(.14, Math.min(.97, weight + dye * (1 - weight))),
      name: dye > .02 ? 'cor composta' : pigmentName,
      indicatorName: indicator.name, masked: dye > .02, pigmentName
    };
  }

  return { solve, color, colorMix, indicatorColor, colorRange, colorNames, liquid, added, species, alpha, fractions, pKw, KW, meanCharge, base };
})();
