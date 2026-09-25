'use strict';
/* Estado das bancadas.
   Existem duas bancadas: a do laboratório livre e a da missão em andamento.
   SIAB.state sempre aponta para a bancada em uso, por isso as outras partes do
   programa não precisam saber em qual tela estão. */
SIAB.criarBancada = () => ({
  tubes: [],
  activeId: null,
  nextId: 1,
  nextGroup: 1,
  view: 'focus',          // 'focus' (tubo em foco) ou 'overview' (visão geral)
  showPH: true,
  indicatorOnly: false,   // "Realçar indicador": oculta a cor própria da amostra
  level: 'explorar',      // explorar, medir ou calcular (controles visíveis)
  destination: 'tube',    // a prateleira coloca o frasco no tubo ou no conta-gotas
  verTab: 'grafico',      // aba do painel VER
  vidraria: 'tubo',       // tubo, bequer ou erlenmeyer (sempre começa no tubo de ensaio)
  capacidades: { bequer: 50, erlenmeyer: 125 },  // mL escolhidos para cada vidraria (tubo: sempre 5)
  history: []             // pilha para desfazer ações
});

SIAB.benches = { lab: SIAB.criarBancada(), mission: null };
SIAB.activeBench = 'lab';
Object.defineProperty(SIAB, 'state', {
  get: () => SIAB.benches[SIAB.activeBench],
  configurable: true
});
SIAB.usarBancada = nome => { SIAB.activeBench = nome; };

SIAB.current = () => SIAB.state.tubes.find(t => t.id === SIAB.state.activeId);
// Tubos vinculados recebem as mesmas gotas.
SIAB.targets = tube => (tube.group ? SIAB.state.tubes.filter(t => t.group === tube.group) : [tube]);

SIAB.TUBE_DEFAULTS = {
  solution: 'hcl', concentration: .01, initialVolume: 1, dilution: 1,
  titrant: 'naoh', titrantConcentration: .01, titrantDilution: 1,
  dropVolume: .05, indicator: 'btb', additions: [], group: null, temperature: 25
};

// Vidrarias da bancada: nome, dica e capacidades (mL) que se pode escolher.
// O tubo de ensaio tem sempre 5 mL (microescala); béquer e erlenmeyer têm os
// tamanhos comuns de laboratório escolar.
SIAB.VIDRARIAS = {
  tubo: { nome: 'Tubo de ensaio', curto: 'Tubo', capacidades: [5],
    dica: 'Tubo de ensaio: o clássico dos testes rápidos com poucas gotas.' },
  bequer: { nome: 'Béquer', curto: 'Béquer', capacidades: [10, 25, 50, 100, 250],
    dica: 'Béquer: boca larga, para misturar e aquecer. Suas marcas de volume são aproximadas.' },
  erlenmeyer: { nome: 'Erlenmeyer', curto: 'Erlenmeyer', capacidades: [25, 50, 125, 250],
    dica: 'Erlenmeyer: o frasco das titulações; a boca estreita evita respingos ao agitar. Por ser cônico, as marcas se afastam perto do gargalo.' }
};

// Capacidade (mL) da vidraria em uso numa bancada.
SIAB.capacidadeDaBancada = (bench = SIAB.state) =>
  (bench?.vidraria && bench.vidraria !== 'tubo' ? bench.capacidades?.[bench.vidraria] : null) || SIAB.CAPACITY_ML;
// Volume inicial de um recipiente novo: 20 % da capacidade (1 mL no tubo de ensaio).
SIAB.volumePadrao = (bench = SIAB.state) => Math.round(SIAB.capacidadeDaBancada(bench) * .2 * 100) / 100;

SIAB.newTube = (options = {}, bench = SIAB.state) => {
  const id = bench.nextId++;
  const tube = { id, name: `${SIAB.VIDRARIAS[bench.vidraria]?.curto || 'Tubo'} ${id}`, ...SIAB.TUBE_DEFAULTS, initialVolume: SIAB.volumePadrao(bench), ...options };
  tube.additions = [...tube.additions];
  bench.tubes.push(tube);
  return tube;
};

// Capacidade de um recipiente: a própria (béquer da mistura geral) ou a da
// vidraria. Sem vidraria indicada, usa a da bancada em uso.
SIAB.capacidade = (tube, vidraria = SIAB.state?.vidraria) => tube.capacidade
  || (vidraria && vidraria !== 'tubo' ? SIAB.state?.capacidades?.[vidraria] : null)
  || SIAB.CAPACITY_ML;

// Mistura geral (modo secreto): junta tudo o que há nos tubos — soluções,
// gotas e indicadores — num só recipiente. Função pura, sem mexer na bancada.
// Componentes iguais (mesmo frasco, concentração e diluição) somam o volume.
SIAB.misturarTubos = tubos => {
  const componentes = new Map(), indicadores = new Map();
  let total = 0;
  for (const t of tubos) {
    const partes = SIAB.chem.base(t).map(x => ({ ...x }));
    const gotas = SIAB.chem.added(t);
    if (gotas > 0) partes.push({ id: t.titrant, concentration: t.titrantConcentration, volume: gotas, dilution: t.titrantDilution });
    for (const p of partes) {
      if (!(p.volume > 0)) continue;
      const chave = `${p.id}|${p.concentration}|${p.dilution || 1}`;
      const atual = componentes.get(chave);
      if (atual) atual.volume += p.volume;
      else componentes.set(chave, { id: p.id, concentration: p.concentration, volume: p.volume, dilution: p.dilution || 1 });
    }
    const volume = partes.reduce((sum, p) => sum + p.volume, 0);
    total += volume;
    const deste = t.indicadores?.length ? t.indicadores : [{ id: t.indicator, fracao: 1 }];
    for (const x of deste) indicadores.set(x.id, (indicadores.get(x.id) || 0) + x.fracao * volume);
  }
  const listaInd = [...indicadores].map(([id, v]) => ({ id, fracao: total ? v / total : 0 })).filter(x => x.fracao > 0);
  const comCor = listaInd.filter(x => x.id !== 'none').sort((a, b) => b.fracao - a.fracao);
  return {
    volume: total,
    componentes: [...componentes.values()],
    indicadores: listaInd,
    indicator: comCor[0]?.id || 'none'
  };
};

// Desfazer: guarda uma cópia dos tubos antes de cada ação.
SIAB.registrar = (descricao, bench = SIAB.state) => {
  bench.history.push({
    descricao,
    copia: JSON.stringify({ tubes: bench.tubes, activeId: bench.activeId, nextId: bench.nextId, nextGroup: bench.nextGroup, vidraria: bench.vidraria, capacidades: bench.capacidades })
  });
  if (bench.history.length > 60) bench.history.shift();
};
SIAB.desfazer = (bench = SIAB.state) => {
  const ultima = bench.history.pop();
  if (!ultima) return null;
  Object.assign(bench, JSON.parse(ultima.copia));
  if (!bench.tubes.some(t => t.id === bench.activeId)) bench.activeId = bench.tubes[0]?.id ?? null;
  return ultima.descricao;
};

// A bancada do laboratório começa vazia: o primeiro frasco escolhido na
// prateleira cria o "Tubo 1" (ver colocar, em js/telas/bancada.js).
