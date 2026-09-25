'use strict';
/* Missões guiadas, escritas como dados.
   Para criar uma missão nova, copie uma existente e mude os textos e os tubos.

   bancada: tubos (como em SIAB.newTube; "grupo" vincula tubos), mostrarPH,
            nivel (explorar/medir/calcular), ver (abas do painel VER),
            controles (gotas, atalhos, indicador, realcar, temperatura, ph).
   passos:  ler · prever · observar · agir · explicar · quiz
            - prever: pergunta, opcoes, gabarito (texto, mapa ou função), porTubo
            - observar: revelar ['ph'], ver (aba), conferir (id de um prever)
            - agir: concluido(ctx) → true/false; demo() faz a ação (testes e "Mostrar como")
            - quiz: opcoes, correta (índice), explicacao
            - explicar: pergunta, modelo (resposta possível, mostrada depois)
   ctx (contexto): tubos, tubo(nome) → { tube, r (resultado), cor }, ativo, estado. */

// Ajudantes das demonstrações: agem na bancada da missão como o estudante faria.
SIAB.demo = {
  tubo: nome => SIAB.state.tubes.find(t => t.name === nome),
  gotas(nome, n) {
    const tubo = SIAB.demo.tubo(nome);
    const alvos = tubo.group ? SIAB.state.tubes.filter(t => t.group === tubo.group) : [tubo];
    for (let i = 0; i < n; i++) {
      if (alvos.some(x => SIAB.chem.solve(x).volume + x.dropVolume > SIAB.CAPACITY_ML + 1e-9)) break;
      alvos.forEach(x => x.additions.push(x.dropVolume));
    }
    SIAB.loja.avisar();
  },
  selecionar(nome, aba) {
    SIAB.state.activeId = SIAB.demo.tubo(nome).id;
    if (aba) SIAB.state.verTab = aba;
    SIAB.loja.avisar();
  }
};

// Concepções alternativas que as missões confrontam (ver docs/proposta-conteudo-e-mecanicas.md).
SIAB.concepcoes = {
  C1: 'Ácido forte é o mesmo que ácido concentrado.',
  C2: 'Neutralização sempre dá pH 7.',
  C3: 'Todo sal é neutro.',
  C4: 'Diluir bastante um ácido o torna básico.',
  C5: 'A cor do indicador informa o pH exato.',
  C6: 'A escala de pH é linear.',
  C7: 'HCl continua como molécula dentro da água.',
  C8: 'Tampão impede qualquer mudança de pH.',
  C9: 'Ponto de viragem e ponto de equivalência são a mesma coisa.',
  C10: 'Neutro é sempre pH 7.'
};
// Habilidades da BNCC citadas (resumo; confira a redação oficial).
SIAB.bncc = {
  EM13CNT104: 'Avaliar benefícios e riscos de materiais e produtos à saúde e ao ambiente.',
  EM13CNT205: 'Interpretar resultados e fazer previsões, reconhecendo incertezas e limites das ciências.',
  EM13CNT301: 'Construir questões, hipóteses e previsões; interpretar modelos e dados experimentais.',
  EM13CNT302: 'Comunicar resultados com gráficos, tabelas e equações, usando tecnologias digitais.',
  EM13CNT307: 'Analisar propriedades dos materiais para avaliar seu uso e propor soluções seguras.'
};

// Classificação calculada pelo motor ("ácida", "neutra" ou "básica") para cada tubo.
const meioDosTubos = ctx => Object.fromEntries(ctx.tubos.map(x => [x.nome, x.r.phase.toLowerCase()]));
const MEIOS = ['ácida', 'neutra', 'básica'];

SIAB.missoes = [
  /* ---------------- Trilha 1 · Cores e indicadores ---------------- */
  {
    id: 'repolho-roxo', trilha: 1, titulo: 'O que o repolho roxo revela',
    resumo: 'Classifique amostras do cotidiano pela cor de um indicador natural.',
    professor: { objetivo: 'Reconhecer ácido, base e neutro pela cor de um indicador natural.', concepcoes: ['C5'], bncc: ['EM13CNT301'] },
    bancada: {
      tubos: [
        { name: 'Limão', solution: 'lemon', titrant: 'water', indicator: 'cabbage' },
        { name: 'Vinagre', solution: 'vinegar', titrant: 'water', indicator: 'cabbage' },
        { name: 'Água', solution: 'water', titrant: 'water', indicator: 'cabbage' },
        { name: 'Bicarbonato', solution: 'bicarbonate', titrant: 'water', indicator: 'cabbage' },
        { name: 'Sabão', solution: 'soap', titrant: 'water', indicator: 'cabbage' }
      ],
      mostrarPH: false, nivel: 'explorar', ver: [], controles: []
    },
    passos: [
      { tipo: 'ler', titulo: 'Um indicador na cozinha', texto: 'O extrato de repolho roxo muda de cor conforme o meio. Os cinco tubos têm amostras do cotidiano com algumas gotas do extrato. Toque em cada tubo na bancada para ver a cor.' },
      { tipo: 'prever', id: 'meios', porTubo: true, titulo: 'Prever', pergunta: 'Classifique cada amostra.', opcoes: MEIOS, gabarito: meioDosTubos },
      { tipo: 'observar', titulo: 'Observar', revelar: ['ph'], conferir: 'meios', texto: 'O pH agora aparece. pH menor que 7: ácido. Igual a 7: neutro. Maior que 7: básico. Compare com suas previsões.' },
      { tipo: 'quiz', id: 'cor-acida', titulo: 'Conferir', pergunta: 'Que cor o repolho roxo mostra em meio ácido?', opcoes: ['Rosa ou vermelho', 'Violeta', 'Verde ou amarelo'], correta: 0, explicacao: 'No limão e no vinagre (pH 2,3 e 2,5) o extrato fica rosa. Perto do neutro, violeta; em meio básico, azul e depois verde.' },
      { tipo: 'explicar', id: 'porque', titulo: 'Explicar', pergunta: 'Por que o bicarbonato e o sabão ficaram de cor diferente do limão?', modelo: 'Bicarbonato e sabão formam soluções básicas (mais OH⁻ que H₃O⁺). Os pigmentos do repolho mudam de estrutura, e de cor, conforme a quantidade de H₃O⁺ do meio.' }
    ]
  },
  {
    id: 'tres-indicadores', trilha: 1, titulo: 'Um tubo, três olhares',
    resumo: 'A mesma titulação vista por três indicadores diferentes.',
    professor: { objetivo: 'Relacionar a mudança de cor à faixa de viragem de cada indicador.', concepcoes: ['C5', 'C9'], bncc: ['EM13CNT301', 'EM13CNT205'] },
    bancada: {
      tubos: [
        { name: 'Alaranjado de metila', solution: 'hcl', concentration: .01, titrant: 'naoh', titrantConcentration: .01, dropVolume: .05, indicator: 'methyl', grupo: 'A' },
        { name: 'Azul de bromotimol', solution: 'hcl', concentration: .01, titrant: 'naoh', titrantConcentration: .01, dropVolume: .05, indicator: 'btb', grupo: 'A' },
        { name: 'Fenolftaleína', solution: 'hcl', concentration: .01, titrant: 'naoh', titrantConcentration: .01, dropVolume: .05, indicator: 'phenol', grupo: 'A' }
      ],
      mostrarPH: false, nivel: 'medir', ver: ['grafico'], controles: ['gotas', 'atalhos']
    },
    passos: [
      { tipo: 'ler', titulo: 'Mesma solução, três indicadores', texto: 'Os três tubos têm 1 mL de HCl 0,01 mol/L, cada um com um indicador. As gotas de NaOH 0,01 mol/L caem nos três ao mesmo tempo (adições vinculadas).' },
      { tipo: 'prever', id: 'ordem', titulo: 'Prever', pergunta: 'Ao gotejar NaOH, qual indicador muda de cor primeiro?', opcoes: ['Alaranjado de metila', 'Azul de bromotimol', 'Fenolftaleína', 'Os três ao mesmo tempo'], gabarito: 'Alaranjado de metila' },
      {
        tipo: 'agir', titulo: 'Agir', texto: 'Segure o botão de gotejar até a fenolftaleína ficar rosa.',
        concluido: ctx => ['rosa claro', 'rosa'].includes(ctx.tubo('Fenolftaleína').cor),
        progresso: ctx => `${ctx.tubos[0].r.drops} gotas · fenolftaleína ${ctx.tubo('Fenolftaleína').cor}`,
        demo: () => SIAB.demo.gotas('Fenolftaleína', 21)
      },
      { tipo: 'observar', titulo: 'Observar', revelar: ['ph'], ver: 'grafico', conferir: 'ordem', texto: 'O alaranjado de metila muda entre pH 3,1 e 4,4; o bromotimol entre 6,0 e 7,6; a fenolftaleína entre 8,2 e 10. No gráfico, a faixa colorida mostra a viragem do indicador do tubo selecionado.' },
      { tipo: 'quiz', id: 'equivalencia', titulo: 'Conferir', pergunta: 'Na 20ª gota, as quantidades de HCl e NaOH ficaram iguais (pH 7). Qual indicador estava na cor de transição nesse ponto?', opcoes: ['Alaranjado de metila (amarelo)', 'Azul de bromotimol (verde)', 'Fenolftaleína (incolor)'], correta: 1, explicacao: 'O verde do bromotimol aparece entre pH 6,0 e 7,6. Por isso ele é uma boa escolha para titular ácido forte com base forte.' },
      { tipo: 'explicar', id: 'porque', titulo: 'Explicar', pergunta: 'Por que os três indicadores mudaram de cor em momentos diferentes, se a solução era a mesma?', modelo: 'Cada indicador tem sua própria faixa de viragem. Conforme o pH sobe, a solução atravessa primeiro a faixa do alaranjado de metila, depois a do bromotimol e por último a da fenolftaleína.' }
    ]
  },
  {
    id: 'cor-que-engana', trilha: 1, titulo: 'Nem toda cor é do indicador',
    resumo: 'Pigmentos de alimentos podem esconder a cor do indicador.',
    professor: { objetivo: 'Distinguir a cor própria da amostra da cor do indicador.', concepcoes: ['C5'], bncc: ['EM13CNT205'] },
    bancada: {
      tubos: [
        { name: 'Café', solution: 'coffee', titrant: 'water', indicator: 'cabbage' },
        { name: 'Suco de morango', solution: 'strawberry', titrant: 'water', indicator: 'cabbage' }
      ],
      mostrarPH: false, nivel: 'explorar', ver: [], controles: ['realcar']
    },
    passos: [
      { tipo: 'ler', titulo: 'Amostras com cor própria', texto: 'Café e suco de morango têm pigmentos. Os dois tubos também têm extrato de repolho roxo. A cor que você vê é uma mistura.' },
      { tipo: 'prever', id: 'olhar', titulo: 'Prever', pergunta: 'Dá para saber, só olhando, se o café é ácido?', opcoes: ['Sim, pela cor marrom', 'Não, a cor própria atrapalha a leitura', 'Só se estiver quente'], gabarito: 'Não, a cor própria atrapalha a leitura' },
      {
        tipo: 'agir', titulo: 'Agir', texto: 'Ative “Realçar indicador” (abaixo, neste cartão) para ver só a cor do indicador.',
        concluido: ctx => ctx.estado.indicatorOnly === true,
        demo: () => { SIAB.state.indicatorOnly = true; SIAB.loja.avisar(); }
      },
      { tipo: 'observar', titulo: 'Observar', revelar: ['ph'], conferir: 'olhar', texto: 'Com o realce, o repolho mostra violeta no café (pH ≈ 5,0, levemente ácido) e rosa no morango (pH ≈ 3,4). O realce é um recurso do simulador: no laboratório real a cor própria continua lá.' },
      { tipo: 'quiz', id: 'real', titulo: 'Conferir', pergunta: 'No laboratório real, o que pode ajudar a ler o indicador em uma amostra muito colorida?', opcoes: ['Diluir a amostra com água', 'Acrescentar mais corante', 'Aquecer a amostra'], correta: 0, explicacao: 'Diluir clareia os pigmentos. Mas atenção: diluir também aproxima o pH de 7, então a leitura muda um pouco. Outra saída é usar um medidor de pH.' },
      { tipo: 'explicar', id: 'porque', titulo: 'Explicar', pergunta: 'Por que a cor do café não basta para dizer se ele é ácido?', modelo: 'A cor marrom vem dos pigmentos do café, não do meio ácido. A cor observada mistura pigmento e indicador; é preciso separar as duas contribuições.' }
    ]
  },

  /* ---------------- Trilha 2 · Ácidos, bases e sais ---------------- */
  {
    id: 'ionizacao', trilha: 2, titulo: 'Dentro da água: ionização',
    resumo: 'Use a lupa para ver o que acontece com as moléculas de ácido na água.',
    professor: { objetivo: 'Representar a ionização de ácidos fortes e fracos no nível das partículas.', concepcoes: ['C7'], bncc: ['EM13CNT301'] },
    bancada: {
      tubos: [
        { name: 'HCl', solution: 'hcl', concentration: .01, titrant: 'water', indicator: 'universal' },
        { name: 'Ácido acético', solution: 'acetic', concentration: .01, titrant: 'water', indicator: 'universal' }
      ],
      mostrarPH: false, nivel: 'medir', ver: ['particulas', 'equacao'], verInicial: 'particulas', controles: []
    },
    passos: [
      { tipo: 'ler', titulo: 'A mesma concentração', texto: 'Os dois tubos têm ácido a 0,01 mol/L. O painel Partículas funciona como uma lupa: mostra íons e moléculas dissolvidos (a água fica de fora).' },
      { tipo: 'prever', id: 'hcl', titulo: 'Prever', pergunta: 'Na água, o que acontece com as moléculas de HCl?', opcoes: ['Quase todas se ionizam em H₃O⁺ e Cl⁻', 'Quase todas continuam inteiras', 'Cerca de metade se ioniza'], gabarito: 'Quase todas se ionizam em H₃O⁺ e Cl⁻' },
      { tipo: 'observar', titulo: 'Observar', ver: 'particulas', conferir: 'hcl', texto: 'Na lupa do tubo HCl só há íons: H₃O⁺ e Cl⁻. O HCl é um ácido forte: HCl + H₂O → H₃O⁺ + Cl⁻.' },
      { tipo: 'prever', id: 'acetico', titulo: 'Prever', pergunta: 'E o ácido acético, na mesma concentração?', opcoes: ['Quase todas se ionizam', 'Quase todas continuam inteiras', 'Cerca de metade se ioniza'], gabarito: 'Quase todas continuam inteiras' },
      {
        tipo: 'agir', titulo: 'Agir', texto: 'Selecione o tubo “Ácido acético” na bancada e veja suas partículas.',
        concluido: ctx => ctx.ativo === 'Ácido acético' && ctx.estado.verTab === 'particulas',
        demo: () => SIAB.demo.selecionar('Ácido acético', 'particulas')
      },
      { tipo: 'observar', titulo: 'Observar', revelar: ['ph'], conferir: 'acetico', texto: 'Só cerca de 4 % das moléculas de ácido acético se ionizam (α ≈ 4,2 %). Por isso o pH dele (3,38) é maior que o do HCl (2,00), mesmo com a mesma concentração.' },
      { tipo: 'quiz', id: 'seta', titulo: 'Conferir', pergunta: 'Qual equação representa um ácido fraco?', opcoes: ['HCl + H₂O → H₃O⁺ + Cl⁻', 'CH₃COOH + H₂O ⇌ H₃O⁺ + CH₃COO⁻'], correta: 1, explicacao: 'A seta dupla (⇌) indica equilíbrio: a maior parte das moléculas continua inteira. A seta simples indica ionização praticamente completa.' },
      { tipo: 'explicar', id: 'porque', titulo: 'Explicar', pergunta: 'Explique, com partículas, a diferença entre um ácido forte e um ácido fraco.', modelo: 'No ácido forte, praticamente todas as moléculas doam H⁺ à água e viram íons. No fraco, a maioria das moléculas continua inteira; só uma pequena fração se ioniza.' }
    ]
  },
  {
    id: 'forte-ou-concentrado', trilha: 2, titulo: 'Forte ou concentrado?',
    resumo: 'Um ácido forte diluído contra um ácido fraco concentrado.',
    professor: { objetivo: 'Diferenciar força (fração ionizada) de concentração (quantidade por litro).', concepcoes: ['C1'], bncc: ['EM13CNT301'] },
    bancada: {
      tubos: [
        { name: 'Tubo A', solution: 'hcl', concentration: .001, titrant: 'naoh', titrantConcentration: .1, dropVolume: .01, indicator: 'universal' },
        { name: 'Tubo B', solution: 'acetic', concentration: .1, titrant: 'naoh', titrantConcentration: .1, dropVolume: .01, indicator: 'universal' }
      ],
      mostrarPH: false, nivel: 'medir', ver: ['particulas', 'grafico'], controles: ['gotas', 'atalhos']
    },
    passos: [
      { tipo: 'ler', titulo: 'O duelo', texto: 'Tubo A: ácido clorídrico, forte, diluído (0,001 mol/L). Tubo B: ácido acético, fraco, concentrado (0,1 mol/L). Os dois têm 1 mL.' },
      { tipo: 'prever', id: 'menor', titulo: 'Prever', pergunta: 'Qual tubo tem o menor pH (mais ácido)?', opcoes: ['Tubo A', 'Tubo B', 'Iguais'], gabarito: ctx => (ctx.tubo('Tubo A').r.pH < ctx.tubo('Tubo B').r.pH ? 'Tubo A' : 'Tubo B') },
      { tipo: 'observar', titulo: 'Observar', revelar: ['ph'], conferir: 'menor', texto: 'O ácido fraco concentrado tem pH um pouco menor: 2,88 contra 3,00. Força não é o mesmo que concentração.' },
      { tipo: 'prever', id: 'quantidade', titulo: 'Prever', pergunta: 'Qual tubo vai precisar de mais NaOH para chegar à equivalência?', opcoes: ['Tubo A', 'Tubo B', 'Os dois, igual'], gabarito: 'Tubo B' },
      {
        tipo: 'agir', titulo: 'Agir', texto: 'Goteje NaOH 0,1 mol/L nos dois tubos até o pH de cada um passar de 7. Selecione um tubo de cada vez. Use +1 mL se quiser ir mais rápido.',
        concluido: ctx => ctx.tubo('Tubo A').r.pH > 6.99 && ctx.tubo('Tubo B').r.pH > 6.99,
        progresso: ctx => `A: ${SIAB.format(ctx.tubo('Tubo A').r.added)} mL · B: ${SIAB.format(ctx.tubo('Tubo B').r.added)} mL`,
        demo: () => { SIAB.demo.gotas('Tubo A', 1); SIAB.demo.gotas('Tubo B', 100); }
      },
      { tipo: 'observar', titulo: 'Observar', conferir: 'quantidade', ver: 'grafico', texto: 'O tubo B precisou de 100 vezes mais NaOH: 1,00 mL contra 0,01 mL. Ele tinha 100 vezes mais ácido, embora só cerca de 1,3 % estivesse ionizado no início.' },
      { tipo: 'explicar', id: 'porque', titulo: 'Explicar', pergunta: 'Qual é a diferença entre um ácido forte e um ácido concentrado?', modelo: 'Forte: quase todas as moléculas se ionizam. Concentrado: há muito ácido por litro. Um ácido fraco pode ser concentrado, e um forte pode estar diluído.' }
    ]
  },
  {
    id: 'sais-cores', trilha: 2, titulo: 'Todo sal é neutro?',
    resumo: 'Quatro sais, quatro cores de repolho roxo.',
    professor: { objetivo: 'Relacionar o caráter da solução de um sal ao ácido e à base de origem.', concepcoes: ['C3'], bncc: ['EM13CNT301', 'EM13CNT307'] },
    bancada: {
      tubos: [
        { name: 'NaCl', solution: 'nacl', concentration: .1, titrant: 'water', indicator: 'cabbage' },
        { name: 'NH₄Cl', solution: 'nh4cl', concentration: .1, titrant: 'water', indicator: 'cabbage' },
        { name: 'CH₃COONa', solution: 'ch3coona', concentration: .1, titrant: 'water', indicator: 'cabbage' },
        { name: 'Na₂CO₃', solution: 'na2co3', concentration: .1, titrant: 'water', indicator: 'cabbage' }
      ],
      mostrarPH: false, nivel: 'explorar', ver: ['equacao'], controles: []
    },
    passos: [
      { tipo: 'ler', titulo: 'Sais da neutralização', texto: 'Sal é um produto da reação entre um ácido e uma base. Os quatro tubos têm sais dissolvidos (0,1 mol/L) com extrato de repolho roxo.' },
      { tipo: 'prever', id: 'sais', porTubo: true, titulo: 'Prever', pergunta: 'Classifique a solução de cada sal.', opcoes: MEIOS, gabarito: meioDosTubos },
      { tipo: 'observar', titulo: 'Observar', revelar: ['ph'], conferir: 'sais', ver: 'equacao', texto: 'NaCl: neutro (7,00). NH₄Cl: ácido (5,13). CH₃COONa: básico (8,87). Na₂CO₃: básico (11,65). No painel Equação, veja de que ácido e de que base cada sal vem.' },
      { tipo: 'quiz', id: 'nh4cl', titulo: 'Conferir', pergunta: 'O NH₄Cl vem do HCl (ácido forte) e da NH₃ (base fraca). Qual é o caráter da solução?', opcoes: ['Ácido: predomina o forte', 'Básico: predomina a base', 'Sempre neutro'], correta: 0, explicacao: 'O íon NH₄⁺ doa H⁺ à água (NH₄⁺ + H₂O ⇌ NH₃ + H₃O⁺). O Cl⁻, que vem de um ácido forte, não reage.' },
      { tipo: 'explicar', id: 'porque', titulo: 'Explicar', pergunta: 'Use a origem dos sais (ácido e base, fortes ou fracos) para explicar as cores.', modelo: 'Sal de ácido forte e base forte dá solução neutra. De ácido forte e base fraca, ácida. De ácido fraco e base forte, básica: o ânion recebe H⁺ da água e libera OH⁻.' }
    ]
  },
  {
    id: 'chuva-acida', trilha: 2, titulo: 'Chuva ácida e calagem',
    resumo: 'Óxidos ácidos na chuva e a correção com cal.',
    professor: { objetivo: 'Relacionar óxidos ácidos à acidez da chuva e aplicar a neutralização na correção de águas e solos.', concepcoes: ['C6'], bncc: ['EM13CNT104', 'EM13CNT307'] },
    bancada: {
      tubos: [
        { name: 'Chuva limpa', solution: 'cleanRain', initialVolume: 2, titrant: 'water', indicator: 'universal' },
        { name: 'Chuva ácida', solution: 'acidRain', initialVolume: 2, titrant: 'water', indicator: 'universal' },
        { name: 'Lago', solution: 'acidRain', initialVolume: 2, titrant: 'limewater', titrantConcentration: .0005, dropVolume: .01, indicator: 'universal' }
      ],
      mostrarPH: false, nivel: 'medir', ver: ['equacao', 'grafico'], controles: ['gotas']
    },
    passos: [
      { tipo: 'ler', titulo: 'Óxidos ácidos', texto: 'CO₂, SO₂ e NO₂ são óxidos ácidos: com a água, formam ácidos. CO₂ + H₂O ⇌ H₂CO₃. O SO₂ poluente vira SO₃ e depois H₂SO₄ (SO₃ + H₂O → H₂SO₄).' },
      { tipo: 'prever', id: 'limpa', titulo: 'Prever', pergunta: 'A chuva sem poluição é neutra (pH 7)?', opcoes: ['Sim, é água pura', 'Não, é levemente ácida por causa do CO₂', 'Não, é básica'], gabarito: 'Não, é levemente ácida por causa do CO₂' },
      { tipo: 'observar', titulo: 'Observar', revelar: ['ph'], conferir: 'limpa', texto: 'A chuva limpa tem pH ≈ 5,6, pelo CO₂ dissolvido. Chama-se chuva ácida a que fica abaixo disso: aqui, pH ≈ 4,3.' },
      { tipo: 'quiz', id: 'vezes', titulo: 'Conferir', pergunta: 'Quantas vezes a [H₃O⁺] da chuva ácida (pH 4,3) é maior que a da chuva limpa (pH 5,6)?', opcoes: ['Cerca de 1,3 vez', 'Cerca de 20 vezes', 'Cerca de 1 000 vezes'], correta: 1, explicacao: 'Cada unidade de pH vale 10 vezes. A diferença de 1,3 unidade dá 10^1,3 ≈ 20 vezes mais H₃O⁺.' },
      {
        tipo: 'agir', titulo: 'Agir', texto: 'O lago recebeu chuva ácida. Selecione o tubo “Lago” e goteje água de cal, Ca(OH)₂, até o pH ficar entre 6 e 8. Cuidado para não passar do ponto.',
        concluido: ctx => ctx.tubo('Lago').r.pH >= 6 && ctx.tubo('Lago').r.pH <= 8,
        progresso: ctx => `Lago: pH ${SIAB.phFormat(ctx.tubo('Lago').r)} · ${ctx.tubo('Lago').r.drops} gotas`,
        demo: () => SIAB.demo.gotas('Lago', 11)
      },
      { tipo: 'explicar', id: 'porque', titulo: 'Explicar', pergunta: 'Por que a cal corrige a acidez? Escreva a equação da neutralização.', modelo: 'A cal é uma base: Ca(OH)₂ + H₂SO₄ → CaSO₄ + 2 H₂O. O OH⁻ consome o H₃O⁺. Cal em excesso deixaria a água básica, o que também prejudica a vida no lago.' }
    ]
  },

  /* ---------------- Trilha 3 · Quantidades e titulação ---------------- */
  {
    id: 'diluicao', trilha: 3, titulo: 'Diluir muda o quê?',
    resumo: 'Acrescente água e acompanhe o pH se aproximar de 7.',
    professor: { objetivo: 'Reconhecer que diluir aproxima o pH de 7 sem inverter o caráter da solução.', concepcoes: ['C4', 'C6'], bncc: ['EM13CNT301'] },
    bancada: {
      tubos: [
        { name: 'Vinagre puro', solution: 'vinegar', titrant: 'water', indicator: 'universal' },
        { name: 'Vinagre 1 + 9', solution: 'vinegar', dilution: 10, titrant: 'water', indicator: 'universal' },
        { name: 'HCl + água', solution: 'hcl', concentration: .01, titrant: 'water', dropVolume: .1, indicator: 'universal' }
      ],
      mostrarPH: true, nivel: 'medir', ver: ['grafico', 'equacao'], controles: ['gotas', 'atalhos']
    },
    passos: [
      { tipo: 'ler', titulo: 'Diluir', texto: 'Diluir é acrescentar solvente. A quantidade de ácido continua a mesma, mas fica espalhada em mais água: a concentração diminui.' },
      { tipo: 'prever', id: 'vinagre', titulo: 'Prever', pergunta: 'Diluindo o vinagre 10 vezes (1 parte + 9 de água), o pH…', opcoes: ['diminui', 'aumenta, aproximando-se de 7', 'fica igual', 'passa de 7 e fica básico'], gabarito: 'aumenta, aproximando-se de 7' },
      { tipo: 'observar', titulo: 'Observar', conferir: 'vinagre', texto: 'Vinagre puro: pH ≈ 2,5. Diluído 10 vezes: pH ≈ 3,0. Continua ácido, só que menos.' },
      {
        tipo: 'agir', titulo: 'Agir', texto: 'Selecione “HCl + água” e goteje água até o volume chegar a pelo menos 4 mL. Observe o pH a cada etapa.',
        concluido: ctx => ctx.tubo('HCl + água').r.volume >= 4 - 1e-9,
        progresso: ctx => `${SIAB.format(ctx.tubo('HCl + água').r.volume)} mL · pH ${SIAB.phFormat(ctx.tubo('HCl + água').r)}`,
        demo: () => SIAB.demo.gotas('HCl + água', 30)
      },
      { tipo: 'quiz', id: 'limite', titulo: 'Conferir', pergunta: 'Se você continuasse diluindo o HCl sem parar, o pH chegaria a…', opcoes: ['14', '7, sem passar dele', '0'], correta: 1, explicacao: 'Com muita água, o H₃O⁺ do ácido fica cada vez mais raro e o pH se aproxima do da água pura (7). Diluir nunca transforma um ácido em base.' },
      { tipo: 'explicar', id: 'porque', titulo: 'Explicar', pergunta: 'O pH mudou, mas a quantidade de ácido no tubo mudou? Explique.', modelo: 'A quantidade (em mol) de ácido ficou a mesma; só o volume aumentou. A concentração de H₃O⁺ diminuiu, por isso o pH aumentou.' }
    ]
  },
  {
    id: 'curva-titulacao', trilha: 3, titulo: 'A curva da titulação',
    resumo: 'Desenhe as curvas de um ácido forte e de um fraco.',
    professor: { objetivo: 'Interpretar curvas de titulação: salto de pH, equivalência e meia-equivalência.', concepcoes: ['C2', 'C9'], bncc: ['EM13CNT302', 'EM13CNT301'] },
    bancada: {
      tubos: [
        { name: 'HCl', solution: 'hcl', concentration: .01, titrant: 'naoh', titrantConcentration: .01, dropVolume: .05, indicator: 'btb' },
        { name: 'Ácido acético', solution: 'acetic', concentration: .01, titrant: 'naoh', titrantConcentration: .01, dropVolume: .05, indicator: 'phenol' }
      ],
      mostrarPH: true, nivel: 'medir', ver: ['grafico', 'historico', 'equacao'], verInicial: 'grafico', controles: ['gotas', 'atalhos']
    },
    passos: [
      { tipo: 'ler', titulo: 'Titular', texto: 'Titular é adicionar, gota a gota, uma solução de concentração conhecida até reagir todo o ácido. O gráfico registra o pH a cada gota.' },
      { tipo: 'prever', id: 'eq7', titulo: 'Prever', pergunta: 'No ponto de equivalência (ácido e base em quantidades iguais), o pH é sempre 7?', opcoes: ['Sim, sempre', 'Não, depende do ácido e da base'], gabarito: 'Não, depende do ácido e da base' },
      {
        tipo: 'agir', titulo: 'Agir', texto: 'Titule o HCl até adicionar 1,5 mL de NaOH. Observe o salto no gráfico.',
        concluido: ctx => ctx.tubo('HCl').r.added >= 1.5 - 1e-9,
        progresso: ctx => `HCl: ${SIAB.format(ctx.tubo('HCl').r.added)} mL de NaOH`,
        demo: () => SIAB.demo.gotas('HCl', 30)
      },
      {
        tipo: 'agir', titulo: 'Agir', texto: 'Agora selecione o ácido acético e titule até 1,5 mL.',
        concluido: ctx => ctx.tubo('Ácido acético').r.added >= 1.5 - 1e-9,
        progresso: ctx => `Ácido acético: ${SIAB.format(ctx.tubo('Ácido acético').r.added)} mL de NaOH`,
        demo: () => { SIAB.demo.selecionar('Ácido acético', 'grafico'); SIAB.demo.gotas('Ácido acético', 30); }
      },
      { tipo: 'observar', titulo: 'Observar', ver: 'grafico', conferir: 'eq7', texto: 'Com HCl, a equivalência (1,00 mL) tem pH 7,00. Com ácido acético, 8,22: o acetato formado é uma base. O ponto marcado “pH = pKa” (meia-equivalência) tem pH 4,75. No Histórico você pode baixar a tabela em CSV.' },
      { tipo: 'quiz', id: 'indicador', titulo: 'Conferir', pergunta: 'Para titular ácido acético com NaOH, qual indicador é mais adequado?', opcoes: ['Alaranjado de metila (3,1–4,4)', 'Fenolftaleína (8,2–10)'], correta: 1, explicacao: 'A viragem precisa acontecer no salto de pH, que aqui fica acima de 7. O alaranjado de metila mudaria de cor logo no início.' },
      { tipo: 'explicar', id: 'porque', titulo: 'Explicar', pergunta: 'Por que a equivalência do ácido acético tem pH maior que 7?', modelo: 'Na equivalência sobra acetato de sódio. O íon CH₃COO⁻ recebe H⁺ da água (hidrólise) e libera OH⁻, deixando o meio básico.' }
    ]
  },
  {
    id: 'estomago', trilha: 3, titulo: 'Estômago virtual',
    resumo: 'Dose três antiácidos e compare.',
    professor: { objetivo: 'Aplicar a neutralização a antiácidos e comparar bases solúveis e pouco solúveis.', concepcoes: ['C2'], bncc: ['EM13CNT307', 'EM13CNT104'] },
    bancada: {
      tubos: [
        { name: 'Com Al(OH)₃', solution: 'hcl', concentration: .1, titrant: 'aloh3', titrantConcentration: .1, dropVolume: .02, indicator: 'universal' },
        { name: 'Com Mg(OH)₂', solution: 'hcl', concentration: .1, titrant: 'mgoh2', titrantConcentration: .1, dropVolume: .02, indicator: 'universal' },
        { name: 'Com bicarbonato', solution: 'hcl', concentration: .1, titrant: 'bicarbonate', dropVolume: .02, indicator: 'universal' }
      ],
      mostrarPH: true, nivel: 'medir', ver: ['grafico', 'particulas', 'equacao'], controles: ['gotas', 'atalhos']
    },
    passos: [
      { tipo: 'ler', titulo: 'Suco gástrico', texto: 'Cada tubo é um “estômago” com 1 mL de HCl 0,1 mol/L (pH 1). Antiácidos são bases que neutralizam parte desse ácido. Atividade didática: não é orientação de saúde.' },
      { tipo: 'prever', id: 'facil', titulo: 'Prever', pergunta: 'Qual antiácido deve ser mais fácil de dosar sem passar do ponto (pH acima de 5)?', opcoes: ['Hidróxido de alumínio, Al(OH)₃', 'Hidróxido de magnésio, Mg(OH)₂', 'Bicarbonato de sódio'], gabarito: 'Hidróxido de alumínio, Al(OH)₃' },
      {
        tipo: 'agir', titulo: 'Agir', texto: 'No tubo “Com Al(OH)₃”, goteje até o pH ficar entre 3 e 5.',
        concluido: ctx => ctx.tubo('Com Al(OH)₃').r.pH >= 3 && ctx.tubo('Com Al(OH)₃').r.pH <= 5,
        progresso: ctx => `Al(OH)₃: pH ${SIAB.phFormat(ctx.tubo('Com Al(OH)₃').r)}`,
        demo: () => SIAB.demo.gotas('Com Al(OH)₃', 20)
      },
      {
        tipo: 'agir', titulo: 'Agir', texto: 'Agora tente o mesmo com Mg(OH)₂ e com bicarbonato: goteje pelo menos 0,5 mL de Mg(OH)₂ e 0,9 mL de bicarbonato.',
        concluido: ctx => ctx.tubo('Com Mg(OH)₂').r.added >= .5 - 1e-9 && ctx.tubo('Com bicarbonato').r.added >= .9 - 1e-9,
        progresso: ctx => `Mg(OH)₂: ${SIAB.format(ctx.tubo('Com Mg(OH)₂').r.added)} mL · bicarbonato: ${SIAB.format(ctx.tubo('Com bicarbonato').r.added)} mL`,
        demo: () => { SIAB.demo.gotas('Com Mg(OH)₂', 26); SIAB.demo.gotas('Com bicarbonato', 45); }
      },
      { tipo: 'observar', titulo: 'Observar', ver: 'particulas', conferir: 'facil', texto: 'O Al(OH)₃ é pouco solúvel: só dissolve enquanto há ácido para consumi-lo, e o pH para perto de 4. O Mg(OH)₂ passa de 9 logo após a equivalência. O bicarbonato forma H₂CO₃ (no estômago real, parte vira CO₂ e escapa; aqui o sistema é fechado).' },
      { tipo: 'quiz', id: 'trava', titulo: 'Conferir', pergunta: 'Por que o pH com Al(OH)₃ “trava” perto de 4?', opcoes: ['Porque ele é pouco solúvel e só dissolve enquanto há H₃O⁺ para consumi-lo', 'Porque ele é um ácido', 'Porque acabou o HCl e sobrou água pura'], correta: 0, explicacao: 'Com Kps = 2 × 10⁻³², quase nada de Al(OH)₃ se dissolve quando o meio deixa de ser ácido. Na lupa, os quadrados mostram o sólido que sobrou.' },
      { tipo: 'explicar', id: 'porque', titulo: 'Explicar', pergunta: 'Escreva a equação da neutralização do HCl pelo Mg(OH)₂ e diga por que é possível exagerar na dose.', modelo: 'Mg(OH)₂ + 2 HCl → MgCl₂ + 2 H₂O. O Mg(OH)₂ é mais solúvel que o Al(OH)₃: depois de neutralizar todo o ácido, ainda dissolve e deixa o meio básico.' }
    ]
  },

  /* ---------------- Trilha 4 · Equilíbrio, hidrólise e tampão ---------------- */
  {
    id: 'grau-ionizacao', trilha: 4, titulo: 'Grau de ionização e diluição',
    resumo: 'α do ácido acético em três concentrações (lei de Ostwald).',
    professor: { objetivo: 'Calcular e interpretar o grau de ionização e a lei da diluição de Ostwald.', concepcoes: ['C1', 'C7'], bncc: ['EM13CNT301'] },
    bancada: {
      tubos: [
        { name: '0,1 mol/L', solution: 'acetic', concentration: .1, titrant: 'water', indicator: 'universal' },
        { name: '0,01 mol/L', solution: 'acetic', concentration: .01, titrant: 'water', indicator: 'universal' },
        { name: '0,001 mol/L', solution: 'acetic', concentration: .001, titrant: 'water', indicator: 'universal' }
      ],
      mostrarPH: true, nivel: 'calcular', ver: ['particulas', 'equacao'], verInicial: 'particulas', controles: []
    },
    passos: [
      { tipo: 'ler', titulo: 'Grau de ionização', texto: 'Grau de ionização (α) é a fração das moléculas de ácido que se ionizam: α = moléculas ionizadas ÷ moléculas dissolvidas.' },
      { tipo: 'prever', id: 'alfa', titulo: 'Prever', pergunta: 'Diluindo o ácido acético, α…', opcoes: ['aumenta', 'diminui', 'não muda'], gabarito: 'aumenta' },
      {
        tipo: 'agir', titulo: 'Agir', texto: 'Veja na lupa as partículas dos três tubos: selecione um de cada vez.',
        concluido: ctx => ctx.tubos.every(x => ctx.visitados.has(x.nome)),
        progresso: ctx => `${ctx.tubos.filter(x => ctx.visitados.has(x.nome)).length} de 3 tubos vistos`,
        demo: () => ['0,1 mol/L', '0,01 mol/L', '0,001 mol/L'].forEach(nome => SIAB.demo.selecionar(nome, 'particulas'))
      },
      { tipo: 'observar', titulo: 'Observar', ver: 'equacao', conferir: 'alfa', texto: 'α = 1,3 % (0,1 mol/L), 4,2 % (0,01) e 12,5 % (0,001). É a lei da diluição de Ostwald: para ácidos fracos, α ≈ √(Ka/C).' },
      { tipo: 'quiz', id: 'ph', titulo: 'Conferir', pergunta: 'Se α aumenta com a diluição, por que o pH também aumenta (2,88 → 3,38 → 3,90)?', opcoes: ['Porque a [H₃O⁺] total diminui, mesmo com uma fração ionizada maior', 'Porque o ácido vira base', 'Porque o Ka diminui'], correta: 0, explicacao: '[H₃O⁺] ≈ α · C. Diluir 10 vezes aumenta α cerca de 3 vezes (√10), mas divide C por 10: o produto diminui.' },
      { tipo: 'explicar', id: 'porque', titulo: 'Explicar', pergunta: 'Explique com suas palavras a lei da diluição de Ostwald.', modelo: 'Quanto mais diluído um ácido fraco, maior a fração das moléculas que se ionizam (α ≈ √(Ka/C)); a concentração de H₃O⁺, porém, diminui.' }
    ]
  },
  {
    id: 'hidrolise', trilha: 4, titulo: 'Por que o sal muda o pH?',
    resumo: 'Hidrólise salina com equações e partículas.',
    professor: { objetivo: 'Explicar a hidrólise salina com equações e pares conjugados.', concepcoes: ['C3'], bncc: ['EM13CNT301'] },
    bancada: {
      tubos: [
        { name: 'NH₄Cl', solution: 'nh4cl', concentration: .1, titrant: 'water', indicator: 'universal' },
        { name: 'CH₃COONa', solution: 'ch3coona', concentration: .1, titrant: 'water', indicator: 'universal' },
        { name: 'Na₂CO₃', solution: 'na2co3', concentration: .1, titrant: 'water', indicator: 'universal' }
      ],
      mostrarPH: true, nivel: 'calcular', ver: ['equacao', 'particulas'], verInicial: 'equacao', controles: []
    },
    passos: [
      { tipo: 'ler', titulo: 'Hidrólise salina', texto: 'Na hidrólise, um íon do sal reage com a água e produz H₃O⁺ ou OH⁻. Íons vindos de ácido forte (Cl⁻) ou de base forte (Na⁺) não reagem.' },
      { tipo: 'prever', id: 'ions', porTubo: true, titulo: 'Prever', pergunta: 'Qual íon de cada sal reage com a água?', opcoes: ['o cátion', 'o ânion', 'nenhum'], gabarito: { 'NH₄Cl': 'o cátion', 'CH₃COONa': 'o ânion', 'Na₂CO₃': 'o ânion' } },
      { tipo: 'observar', titulo: 'Observar', ver: 'equacao', conferir: 'ions', texto: 'NH₄⁺ + H₂O ⇌ NH₃ + H₃O⁺ (ácida). CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻ (básica). CO₃²⁻ + H₂O ⇌ HCO₃⁻ + OH⁻ (básica). Veja a equação de cada tubo.' },
      {
        tipo: 'agir', titulo: 'Agir', texto: 'Na lupa (Partículas), encontre o NH₃ formado no tubo de NH₄Cl.',
        concluido: ctx => ctx.ativo === 'NH₄Cl' && ctx.estado.verTab === 'particulas',
        demo: () => SIAB.demo.selecionar('NH₄Cl', 'particulas')
      },
      { tipo: 'quiz', id: 'carbonato', titulo: 'Conferir', pergunta: 'Por que Na₂CO₃ 0,1 mol/L (pH 11,65) é mais básico que CH₃COONa 0,1 mol/L (pH 8,87)?', opcoes: ['CO₃²⁻ é uma base mais forte que CH₃COO⁻, porque o HCO₃⁻ é um ácido muito mais fraco que o CH₃COOH', 'Porque tem dois íons Na⁺', 'Porque o carbonato é um ácido'], correta: 0, explicacao: 'Quanto mais fraco o ácido conjugado (Ka do HCO₃⁻ = 4,7 × 10⁻¹¹; do CH₃COOH = 1,8 × 10⁻⁵), mais forte a base.' },
      { tipo: 'explicar', id: 'porque', titulo: 'Explicar', pergunta: 'Explique a hidrólise do acetato de sódio usando pares conjugados.', modelo: 'O CH₃COO⁻ é a base conjugada do ácido acético (fraco). Ele recebe H⁺ da água, formando CH₃COOH e OH⁻. O Na⁺ não reage. Sobra OH⁻: meio básico.' }
    ]
  },
  {
    id: 'tampao', trilha: 4, titulo: 'Laboratório do tampão',
    resumo: 'Água contra tampão: as mesmas gotas de ácido.',
    professor: { objetivo: 'Caracterizar a solução-tampão e sua capacidade limitada.', concepcoes: ['C8'], bncc: ['EM13CNT301', 'EM13CNT205'] },
    bancada: {
      tubos: [
        { name: 'Água', solution: 'water', titrant: 'hcl', titrantConcentration: .01, dropVolume: .05, indicator: 'universal', grupo: 'A' },
        { name: 'Tampão acetato', solution: 'acetateBuffer', concentration: .01, titrant: 'hcl', titrantConcentration: .01, dropVolume: .05, indicator: 'universal', grupo: 'A' }
      ],
      mostrarPH: true, nivel: 'medir', ver: ['grafico', 'equacao', 'particulas'], controles: ['gotas', 'atalhos']
    },
    passos: [
      { tipo: 'ler', titulo: 'Tampão', texto: 'Uma solução-tampão tem um ácido fraco e sua base conjugada: aqui, ácido acético e acetato (0,01 mol/L de cada). As mesmas gotas de HCl 0,01 mol/L caem na água e no tampão.' },
      { tipo: 'prever', id: 'duas', titulo: 'Prever', pergunta: 'Depois de 2 gotas de HCl, o que acontece?', opcoes: ['Os dois mudam o mesmo tanto', 'A água muda muito; o tampão quase não muda', 'O tampão muda mais que a água'], gabarito: 'A água muda muito; o tampão quase não muda' },
      {
        tipo: 'agir', titulo: 'Agir', texto: 'Adicione 2 gotas de HCl (toque duas vezes no botão de gotejar).',
        concluido: ctx => ctx.tubo('Água').r.drops >= 2,
        progresso: ctx => `${ctx.tubo('Água').r.drops} gotas`,
        demo: () => SIAB.demo.gotas('Água', 2)
      },
      { tipo: 'observar', titulo: 'Observar', conferir: 'duas', ver: 'equacao', texto: 'Água: 7,00 → 3,04. Tampão: 4,75 → 4,66. O acetato consome o H₃O⁺: CH₃COO⁻ + H₃O⁺ → CH₃COOH + H₂O.' },
      {
        tipo: 'agir', titulo: 'Agir', texto: 'Continue gotejando até o tampão “quebrar”: pH abaixo de 4.',
        concluido: ctx => ctx.tubo('Tampão acetato').r.pH < 4,
        progresso: ctx => `Tampão: pH ${SIAB.phFormat(ctx.tubo('Tampão acetato').r)} · ${ctx.tubo('Tampão acetato').r.drops} gotas`,
        demo: () => SIAB.demo.gotas('Água', 16)
      },
      { tipo: 'quiz', id: 'quebra', titulo: 'Conferir', pergunta: 'Por que o tampão deixou de funcionar?', opcoes: ['O CH₃COO⁻ que consumia o H₃O⁺ foi acabando', 'Acabou a água', 'O ácido acético evaporou'], correta: 0, explicacao: 'O tampão tem capacidade limitada. O sangue, por exemplo, fica entre pH 7,35 e 7,45 graças a tampões como H₂CO₃/HCO₃⁻, dentro de certos limites.' },
      { tipo: 'explicar', id: 'porque', titulo: 'Explicar', pergunta: 'Como o tampão resiste à adição de ácido? E por que tem limite?', modelo: 'A base conjugada (CH₃COO⁻) reage com o H₃O⁺ adicionado e forma ácido fraco. Quando a base conjugada se esgota, o H₃O⁺ sobra e o pH cai.' }
    ]
  },
  {
    id: 'temperatura', trilha: 4, titulo: 'Neutro nem sempre é 7',
    resumo: 'Aqueça a água e acompanhe Kw.',
    professor: { objetivo: 'Definir neutralidade como [H₃O⁺] = [OH⁻] e relacionar Kw à temperatura.', concepcoes: ['C10'], bncc: ['EM13CNT301', 'EM13CNT205'] },
    bancada: {
      tubos: [
        { name: 'Água pura', solution: 'water', titrant: 'water', indicator: 'universal' },
        { name: 'HCl 0,0001 mol/L', solution: 'hcl', concentration: .0001, titrant: 'water', indicator: 'universal' },
        { name: 'NaOH 0,0001 mol/L', solution: 'naoh', concentration: .0001, titrant: 'water', indicator: 'universal' }
      ],
      mostrarPH: true, nivel: 'calcular', ver: ['equacao'], controles: ['temperatura']
    },
    passos: [
      { tipo: 'ler', titulo: 'Neutro', texto: 'Neutro significa [H₃O⁺] = [OH⁻]. A autoionização da água (2 H₂O ⇌ H₃O⁺ + OH⁻) é endotérmica: aumenta com a temperatura. A 25 °C, Kw = 1,0 × 10⁻¹⁴.' },
      { tipo: 'prever', id: 'quente', titulo: 'Prever', pergunta: 'Aquecendo água pura a 50 °C, o pH…', opcoes: ['continua 7', 'fica menor que 7, e a água continua neutra', 'fica menor que 7, e a água fica ácida'], gabarito: 'fica menor que 7, e a água continua neutra' },
      {
        tipo: 'agir', titulo: 'Agir', texto: 'Use o controle de temperatura (neste cartão) para levar os tubos a 50 °C ou mais.',
        concluido: ctx => ctx.tubos.every(x => x.tube.temperature >= 50),
        progresso: ctx => `${SIAB.format(ctx.tubos[0].tube.temperature, 0)} °C · água pura: pH ${SIAB.phFormat(ctx.tubos[0].r)}`,
        demo: () => { SIAB.state.tubes.forEach(t => { t.temperature = 50; }); SIAB.loja.avisar(); }
      },
      { tipo: 'observar', titulo: 'Observar', conferir: 'quente', ver: 'equacao', texto: 'A 50 °C, pKw = 13,26: a água pura tem pH 6,63 e continua neutra ([H₃O⁺] = [OH⁻]). O HCl quase não muda (pH 4,00); o NaOH cai de 10,00 para 9,26, porque pH = pKw − pOH.' },
      { tipo: 'quiz', id: 'corpo', titulo: 'Conferir', pergunta: 'A 37 °C (temperatura do corpo), o pH neutro é…', opcoes: ['7,00', '6,81', '7,40'], correta: 1, explicacao: 'A 37 °C, pKw ≈ 13,62, e o neutro é pKw/2 ≈ 6,81. O sangue (pH 7,35 a 7,45) é levemente básico.' },
      { tipo: 'explicar', id: 'porque', titulo: 'Explicar', pergunta: 'Por que a água quente tem pH menor que 7 e mesmo assim é neutra?', modelo: 'O aquecimento aumenta a autoionização: formam-se mais H₃O⁺ e OH⁻, sempre na mesma quantidade. O pH cai, mas [H₃O⁺] continua igual a [OH⁻].' }
    ]
  }
];
