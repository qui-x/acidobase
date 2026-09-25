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

SIAB.newTube = (options = {}, bench = SIAB.state) => {
  const id = bench.nextId++;
  const tube = { id, name: `Tubo ${id}`, ...SIAB.TUBE_DEFAULTS, ...options };
  tube.additions = [...tube.additions];
  bench.tubes.push(tube);
  return tube;
};

// Desfazer: guarda uma cópia dos tubos antes de cada ação.
SIAB.registrar = (descricao, bench = SIAB.state) => {
  bench.history.push({
    descricao,
    copia: JSON.stringify({ tubes: bench.tubes, activeId: bench.activeId, nextId: bench.nextId, nextGroup: bench.nextGroup })
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
