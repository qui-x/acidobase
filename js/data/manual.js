'use strict';
/* Manual digital da bancada, escrito como dados.
   Cada seção: id (endereço #/manual/<id>), titulo, resumo, alvo (elemento da
   bancada destacado por "Mostrar na bancada"), painel (true se o alvo fica na
   prateleira, que no celular é um painel inferior), nivel (nível necessário
   para o alvo aparecer) e blocos de conteúdo:
     { p }            parágrafo
     { lista: [] }    lista de itens ("Rótulo: texto" deixa o rótulo em negrito)
     { passos: [] }   passo a passo numerado
     { dica }         observação destacada
     { teclas: [[tecla, ação]] }
     { faq: [[pergunta, resposta]] }
     { gerado }       conteúdo montado pelo programa: diagrama, roteiros, frascos, indicadores
   Para mudar um texto, edite aqui; o teste tests/manual.test.cjs confere se os
   alvos existem na página. */
SIAB.manual = [
  {
    id: 'comecar', titulo: 'Primeiros passos',
    resumo: 'O que é a bancada e como fazer o primeiro teste em um minuto.',
    blocos: [
      { p: 'A bancada é um laboratório virtual de ácidos e bases. Você escolhe o que vai no tubo, escolhe o que vai no conta-gotas e acompanha, a cada gota, a cor, o pH, as partículas e o gráfico.' },
      { gerado: 'diagrama' },
      { passos: [
        'Na Prateleira (1), deixe “Tubo” selecionado e toque em um frasco: ele vai para o tubo.',
        'Troque para “Conta-gotas” e toque no frasco que vai gotejar.',
        'Escolha um indicador, logo abaixo dos frascos.',
        'Segure o botão “Segure para gotejar” (3) e observe a leitura (2) e o painel VER (4).',
        'Se algo sair diferente do que queria, toque em “Desfazer”.'
      ] },
      { dica: 'No celular, a prateleira abre pelo botão “Prateleira”, ao lado do nome do tubo. O painel VER fica abaixo do conta-gotas e a tira de tubos (5), no fim da tela.' },
      { p: 'Quer começar com um teste já montado? Veja “Roteiros de teste prontos”.' }
    ]
  },
  {
    id: 'prateleira', titulo: 'Prateleira de frascos', alvo: '#painel-laboratorio', painel: true,
    resumo: 'Níveis, destino do frasco, busca e grupos de frascos.',
    blocos: [
      { p: 'A prateleira guarda todos os frascos, separados em grupos: frutas e sucos, alimentos e bebidas, soluções do cotidiano, reagentes de laboratório, sais e tampões, saúde e ambiente, e referência (água pura).' },
      { lista: [
        'Nível: Explorar mostra só frascos e indicadores. Medir acrescenta diluição, volume inicial e tamanho da gota. Calcular acrescenta concentrações em mol/L e mais números no painel Equação.',
        'Tocar em um frasco coloca no: escolha “Tubo” ou “Conta-gotas” antes de tocar no frasco.',
        'Buscar frasco: digite parte do nome ou da fórmula, com ou sem acento (“limao” encontra “Suco de limão”; “NaOH” encontra o hidróxido de sódio).',
        'Etiquetas: “no tubo” e “conta-gotas” mostram o que está em uso no tubo selecionado.'
      ] },
      { dica: 'Trocar o frasco recomeça as gotas do tubo. Se foi sem querer, toque em “Desfazer”.' }
    ]
  },
  {
    id: 'indicadores', titulo: 'Indicadores e cor', alvo: '#indicator-group', painel: true,
    resumo: 'Como escolher o indicador e ler a cor.',
    blocos: [
      { p: 'O indicador muda de cor conforme o pH. Cada indicador muda em uma faixa diferente; a tabela “Indicadores disponíveis” mostra as faixas.' },
      { lista: [
        'Escolher: toque em um dos botões com a amostra de cores (bromotimol, fenolftaleína, alaranjado de metila, tornassol, universal, repolho roxo).',
        'Sem indicador: mostra só a cor própria da amostra.',
        'Realçar indicador: esconde a cor própria de alimentos como café e suco de morango, para ler só o indicador. Não muda o pH.',
        'Nome da cor: aparece sempre em texto, abaixo do tubo. “Cor composta” quer dizer que a amostra também tem cor própria.'
      ] },
      { dica: 'Repolho roxo e indicador universal são cartas aproximadas: servem para comparar amostras, não para medir o pH exato.' }
    ]
  },
  {
    id: 'medidas', titulo: 'Ajustes de medida', alvo: '#ajustes', painel: true, nivel: 'calcular',
    resumo: 'Concentração, diluição, volume inicial e tamanho da gota.',
    blocos: [
      { p: 'Os ajustes aparecem nos níveis Medir e Calcular. Valem para o tubo selecionado e para os tubos vinculados a ele.' },
      { lista: [
        'Concentração no tubo e no conta-gotas (nível Calcular): de 0,0001 a 0,1 mol/L. Aparece para reagentes de laboratório, sais, tampões e antiácidos.',
        'Diluição da amostra: para frutas, alimentos e chuva. Como preparada, 1 + 1, 1 + 4 ou 1 + 9 partes de água.',
        'Volume inicial: de 0,1 a 4 mL de solução no tubo.',
        'Volume da gota: 0,01, 0,02, 0,05 ou 0,10 mL. Gotas menores mostram melhor o salto de pH.'
      ] },
      { passos: [
        'Mude os valores.',
        'Toque em “Aplicar medidas”.',
        'As gotas do tubo recomeçam do zero (“Desfazer” volta ao estado anterior).'
      ] },
      { dica: 'Se um valor estiver fora do limite, aparece uma mensagem no próprio formulário e nada é alterado.' }
    ]
  },
  {
    id: 'leitura', titulo: 'Leitura do tubo', alvo: '.stage-stats',
    resumo: 'pH, régua, variação, volume, cor e equivalência.',
    blocos: [
      { lista: [
        'pH: duas casas decimais para reagentes; “≈” e uma casa para amostras do cotidiano e da chuva, que são estimativas.',
        'Ácida, Neutra ou Básica: comparação com o pH neutro (7 a 25 °C).',
        'Variação: depois das gotas, aparece por alguns segundos, por exemplo “3,59 → 7,00 (+3,41)”.',
        'Régua de pH: o triângulo marca o pH na escala de 0 a 14; o tracejado marca o neutro.',
        'Ocultar pH: esconde o número, a régua e o gráfico. Use para prever antes de ver.',
        'Volume: quanto líquido há no tubo. A capacidade é de 5 mL.',
        'Cor: nome da cor e do indicador, abaixo do tubo.',
        'Ponto de equivalência: aviso que aparece quando uma gota atinge exatamente a quantidade de base que reage com todo o ácido (ou o contrário).'
      ] },
      { dica: 'Equivalência (quantidades) e viragem (mudança de cor do indicador) são coisas diferentes e podem acontecer em gotas diferentes.' }
    ]
  },
  {
    id: 'conta-gotas', titulo: 'Conta-gotas', alvo: '#dose-area',
    resumo: 'Gotejar, atalhos, desfazer e teclado.',
    blocos: [
      { lista: [
        'Segure para gotejar: enquanto o botão estiver pressionado, cai uma gota a cada quarto de segundo; depois de 8 gotas, o ritmo acelera. Um toque rápido adiciona 1 gota.',
        '+5 gotas e +1 mL: atalhos para ir mais rápido.',
        'Desfazer: desfaz a última ação inteira (uma sequência de gotas, a troca de frasco, as medidas, a remoção de um tubo…).',
        'Linha acima do botão: o que está no conta-gotas e quantas gotas já caíram.',
        'Capacidade: quando o tubo chega a 5 mL, os botões de gotejar ficam desativados.'
      ] },
      { teclas: [['Enter', 'adiciona 1 gota'], ['Espaço (segurar)', 'goteja sem parar até soltar'], ['Tab', 'passa para o próximo controle']] },
      { dica: 'Tubos vinculados (veja “Tubos da bancada”) recebem as mesmas gotas ao mesmo tempo.' }
    ]
  },
  {
    id: 'prever', titulo: 'Prever e gotejar', alvo: '#poe-btn',
    resumo: 'Registrar uma hipótese antes de ver o resultado.',
    blocos: [
      { p: 'Serve para testar uma hipótese: prever → observar → explicar. Tudo fica registrado no caderno.' },
      { passos: [
        'Toque em “Prever e gotejar”, abaixo do botão de gotejar.',
        'Escolha quantas gotas (1, 5, 10 ou 20), se a solução ficará ácida, neutra ou básica e, se quiser, a cor esperada.',
        'Toque em “Gotejar e conferir”: as gotas caem e aparece a comparação com ✓ ou ✗.',
        'Escreva a explicação e toque em “Salvar no caderno”.'
      ] },
      { dica: 'A previsão é salva no caderno mesmo se você fechar sem escrever a explicação.' }
    ]
  },
  {
    id: 'ver', titulo: 'Painel VER', alvo: '#ver-panel',
    resumo: 'Gráfico, partículas, equação e histórico do tubo selecionado.',
    blocos: [
      { lista: [
        'Gráfico: pH × volume adicionado, um ponto por gota. Faixa colorida: viragem do indicador. Linha tracejada vertical: equivalência. Círculo “pH = pKa”: meia-equivalência (ácido ou base fraca). Tracejado horizontal: pH neutro.',
        'Partículas: a lupa mostra íons e moléculas dissolvidos, em proporção à concentração (a espécie mais abundante tem 36 partículas). Círculo com contorno: molécula; quadrado: sólido não dissolvido; “traço”: menos de 1 partícula nesta escala. A água não aparece.',
        'Equação: ionização do que está no tubo e no conta-gotas, reação ao misturar e números. pOH aparece no nível Medir; [H₃O⁺], Ka, α e quantidades em mmol, no nível Calcular.',
        'Histórico: tabela gota a gota. “Baixar tabela (CSV)” abre em planilha (ponto e vírgula, vírgula decimal). “Registrar no caderno” guarda a leitura atual.'
      ] },
      { dica: 'Com o teclado, use as setas ← e → para trocar de aba.' }
    ]
  },
  {
    id: 'tubos', titulo: 'Tubos da bancada', alvo: '.tube-strip',
    resumo: 'Vários tubos, comparação de indicadores e visão geral.',
    blocos: [
      { lista: [
        'Tira de tubos: fica embaixo e mostra todos os tubos (até 10). Toque em um para selecioná-lo.',
        '+ Novo tubo: cria um tubo com água; depois escolha o frasco na prateleira.',
        'Lápis ao lado do nome: renomeia o tubo (até 40 caracteres).',
        'Visão geral (aba no alto): todos os tubos lado a lado, com cor e pH.',
        'Comparar indicadores (na prateleira): cria 3 cópias do tubo com bromotimol, fenolftaleína e indicador universal, vinculadas: cada gota cai nas três.',
        'Desvincular este tubo: o tubo volta a receber gotas sozinho.',
        'Recomeçar gotas: tira todas as gotas do tubo.',
        'Remover tubo: pede confirmação; “Desfazer” traz o tubo de volta.'
      ] }
    ]
  },
  {
    id: 'caderno', titulo: 'Caderno de laboratório', link: ['#/caderno', 'Abrir o caderno'],
    resumo: 'Onde ficam previsões e leituras.',
    blocos: [
      { lista: [
        'O que entra: previsões do “Prever e gotejar”, leituras de “Registrar no caderno” e, no modo completo, missões e desafios. Cada nota tem data e hora.',
        'Baixar caderno (CSV): uma planilha com todas as notas.',
        'Imprimir: imprime as notas.',
        'Apagar nota ou apagar caderno: apagar o caderno pede confirmação.'
      ] },
      { dica: 'O caderno fica guardado só neste navegador, neste aparelho. Baixe o CSV para guardar uma cópia.' }
    ]
  },
  {
    id: 'roteiros', titulo: 'Roteiros de teste prontos',
    resumo: 'Testes montados com um toque, com o resultado esperado.',
    blocos: [
      { p: '“Montar na bancada” substitui os tubos atuais pelos do roteiro (use “Desfazer” na bancada para voltar). Os resultados esperados são calculados pelo próprio simulador.' },
      { gerado: 'roteiros' }
    ]
  },
  {
    id: 'frascos', titulo: 'Frascos disponíveis',
    resumo: 'Todos os frascos da prateleira, com o pH de cada um sozinho.',
    blocos: [
      { p: 'pH calculado para 1 mL do frasco sozinho, a 25 °C. Reagentes, sais e antiácidos a 0,01 mol/L; amostras como preparadas.' },
      { gerado: 'frascos' }
    ]
  },
  {
    id: 'tabela-indicadores', titulo: 'Indicadores disponíveis',
    resumo: 'Faixa de viragem e cores de cada indicador.',
    blocos: [{ gerado: 'indicadores' }]
  },
  {
    id: 'acessibilidade', titulo: 'Acessibilidade e teclado', alvo: '#access-btn',
    resumo: 'Tema, fonte, som do pH e uso sem mouse.',
    blocos: [
      { p: 'O botão “Acessibilidade”, no alto da tela, abre as preferências. Elas ficam salvas neste navegador.' },
      { lista: [
        'Tema: escuro, claro ou alto contraste.',
        'Tamanho do texto: de 80 % a 200 %.',
        'Reduzir animações: desliga gota caindo e partículas se mexendo.',
        'Som do pH: um tom a cada gota, mais agudo quanto maior o pH.',
        'Vibrar na viragem: o celular vibra quando o indicador muda de cor (em aparelhos compatíveis).',
        'Simulação da percepção de cores: filtros para ver como a bancada aparece para pessoas com daltonismo. Não são correções.'
      ] },
      { teclas: [['Tab / Shift + Tab', 'avançar / voltar entre controles'], ['Enter ou Espaço', 'acionar botões e opções'], ['← →', 'trocar de aba no painel VER'], ['↑ ↓', 'percorrer listas de escolha'], ['Esc', 'fechar diálogos e o painel da prateleira']] },
      { dica: 'Leitores de tela anunciam a cor, o pH e o número de gotas depois de cada sequência de gotas.' }
    ]
  },
  {
    id: 'app', titulo: 'Instalar e usar sem internet',
    resumo: 'Aplicativo no computador ou no celular.',
    blocos: [
      { lista: [
        'Aberto como arquivo (index.html): tudo funciona, mas não dá para instalar.',
        'Aberto por um endereço http(s), como o GitHub Pages ou “npm start”: aparece o botão “Instalar app” (ou use o menu do navegador, “Instalar aplicativo” / “Adicionar à tela de início”).',
        'Sem internet: depois da primeira visita pelo endereço, o SIAB abre mesmo offline.',
        'Atualização: quando há versão nova, ela é baixada sozinha e aparece “Nova versão do SIAB instalada · Recarregar”.'
      ] },
      { dica: 'Se aparecer um erro depois de trocar a versão, recarregue com Ctrl + Shift + R (no Mac, Cmd + Shift + R). Se continuar, feche todas as abas do SIAB e abra de novo.' }
    ]
  },
  {
    id: 'limites', titulo: 'Limites do modelo e dúvidas',
    resumo: 'O que o simulador calcula e o que ele não representa.',
    blocos: [
      { p: 'O simulador resolve o equilíbrio de soluções ideais a 25 °C, com volumes que se somam e mistura imediata. Os indicadores estão em quantidade muito pequena e não alteram o pH.' },
      { faq: [
        ['Por que alguns pH aparecem com “≈”?', 'Frutas, alimentos e chuva são amostras representativas. O pH delas é uma estimativa; amostras reais variam com marca, maturação e preparo.'],
        ['Por que vinagre com bicarbonato não faz espuma?', 'O simulador não representa gases: o CO₂ formado fica dissolvido (sistema fechado). Na vida real o gás escapa, e o pH final pode ser diferente.'],
        ['Por que a fenolftaleína não muda na equivalência do HCl?', 'Ela muda entre pH 8,2 e 10. Na titulação de HCl com NaOH, o pH salta de cerca de 3,6 para 10,4 em duas gotas; a cor rosa aparece logo depois da equivalência.'],
        ['Diluir muito um ácido deixa a solução básica?', 'Não. Com mais água, o pH se aproxima de 7, sem passar dele.'],
        ['As cores são exatas?', 'Não. São representações didáticas das faixas de viragem. O repolho roxo real varia com o preparo do extrato.'],
        ['Posso mudar a temperatura?', 'Na bancada, não: tudo está a 25 °C. A temperatura só muda na missão “Neutro nem sempre é 7”, no modo completo.'],
        ['Antiácidos: posso usar isso para saber a dose?', 'Não. É uma atividade didática, não uma orientação de saúde.']
      ] },
      { p: 'Detalhes das equações, constantes e fontes: docs/modelo-quimico.md, na pasta do projeto.' }
    ]
  }
];

/* Roteiros de teste prontos: tubos (como em SIAB.newTube; "grupo" vincula
   tubos), nível da bancada, aba do painel VER e o que fazer depois de montar.
   O resultado esperado é calculado pelo motor em js/telas/manual.js. */
SIAB.roteiros = [
  {
    id: 'titulacao-forte', titulo: 'Ácido forte × base forte', nivel: 'medir', ver: 'grafico',
    objetivo: 'Encontrar o ponto de equivalência de HCl com NaOH.',
    tubos: [{ name: 'HCl + NaOH', solution: 'hcl', concentration: .01, initialVolume: 1, titrant: 'naoh', titrantConcentration: .01, dropVolume: .05, indicator: 'btb' }],
    passos: ['Goteje até o bromotimol ficar verde.', 'Veja no gráfico o salto de pH perto da equivalência.']
  },
  {
    id: 'titulacao-fraco', titulo: 'Ácido fraco × base forte', nivel: 'medir', ver: 'grafico',
    objetivo: 'Comparar com o ácido forte: a equivalência fica acima de pH 7.',
    tubos: [{ name: 'CH₃COOH + NaOH', solution: 'acetic', concentration: .01, initialVolume: 1, titrant: 'naoh', titrantConcentration: .01, dropVolume: .05, indicator: 'phenol' }],
    passos: ['Goteje até passar da equivalência.', 'No gráfico, encontre o ponto “pH = pKa” (meia-equivalência).']
  },
  {
    id: 'titulacao-base-fraca', titulo: 'Base fraca × ácido forte', nivel: 'medir', ver: 'grafico',
    objetivo: 'A equivalência de amônia com HCl fica abaixo de pH 7.',
    tubos: [{ name: 'NH₃ + HCl', solution: 'ammonia', concentration: .01, initialVolume: 1, titrant: 'hcl', titrantConcentration: .01, dropVolume: .05, indicator: 'methyl' }],
    passos: ['Goteje HCl e observe o pH cair.', 'Compare o pH da equivalência com o da titulação de ácido fraco.']
  },
  {
    id: 'tres-indicadores', titulo: 'Mesma titulação, três indicadores', nivel: 'medir', ver: 'grafico',
    objetivo: 'Ver cada indicador mudar de cor em um momento diferente.',
    tubos: ['methyl', 'btb', 'phenol'].map(indicator => ({ name: SIAB.indicators[indicator].short, solution: 'hcl', concentration: .01, initialVolume: 1, titrant: 'naoh', titrantConcentration: .01, dropVolume: .05, indicator, grupo: 'A' })),
    passos: ['Os três tubos estão vinculados: cada gota cai nos três.', 'Goteje devagar e anote em que gota cada cor muda.']
  },
  {
    id: 'tampao', titulo: 'Tampão × água', nivel: 'medir', ver: 'grafico',
    objetivo: 'As mesmas gotas de HCl mudam muito o pH da água e pouco o do tampão.',
    tubos: [
      { name: 'Água', solution: 'water', initialVolume: 1, titrant: 'hcl', titrantConcentration: .01, dropVolume: .05, indicator: 'universal', grupo: 'A' },
      { name: 'Tampão acetato', solution: 'acetateBuffer', concentration: .01, initialVolume: 1, titrant: 'hcl', titrantConcentration: .01, dropVolume: .05, indicator: 'universal', grupo: 'A' }
    ],
    passos: ['Adicione 2 gotas e compare os dois tubos.', 'Continue até o tampão “quebrar” (pH abaixo de 4).'],
    extra: medir => [
      ['Depois de 2 gotas', `água ${medir('Água', 2)} · tampão ${medir('Tampão acetato', 2)}`],
      ['Depois de 20 gotas', `água ${medir('Água', 20)} · tampão ${medir('Tampão acetato', 20)}`]
    ]
  },
  {
    id: 'sais', titulo: 'Todo sal é neutro?', nivel: 'explorar', ver: 'equacao',
    objetivo: 'Comparar soluções de quatro sais com repolho roxo.',
    tubos: [
      { name: 'NaCl', solution: 'nacl', concentration: .1, titrant: 'water', indicator: 'cabbage' },
      { name: 'NH₄Cl', solution: 'nh4cl', concentration: .1, titrant: 'water', indicator: 'cabbage' },
      { name: 'CH₃COONa', solution: 'ch3coona', concentration: .1, titrant: 'water', indicator: 'cabbage' },
      { name: 'Na₂CO₃', solution: 'na2co3', concentration: .1, titrant: 'water', indicator: 'cabbage' }
    ],
    passos: ['Toque em cada tubo e compare as cores.', 'No painel Equação, veja qual íon reage com a água.']
  },
  {
    id: 'antiacidos', titulo: 'Antiácidos', nivel: 'medir', ver: 'grafico',
    objetivo: 'Comparar Al(OH)₃ e Mg(OH)₂ neutralizando HCl 0,1 mol/L.',
    tubos: [
      { name: 'HCl + Al(OH)₃', solution: 'hcl', concentration: .1, initialVolume: 1, titrant: 'aloh3', titrantConcentration: .1, dropVolume: .02, indicator: 'universal' },
      { name: 'HCl + Mg(OH)₂', solution: 'hcl', concentration: .1, initialVolume: 1, titrant: 'mgoh2', titrantConcentration: .1, dropVolume: .02, indicator: 'universal' }
    ],
    passos: ['Goteje 1 mL em cada tubo (+1 mL).', 'Compare: o Al(OH)₃ para perto de pH 4; o Mg(OH)₂ passa de 9.'],
    extra: medir => [['Depois de 1 mL', `Al(OH)₃ ${medir('HCl + Al(OH)₃', 50)} · Mg(OH)₂ ${medir('HCl + Mg(OH)₂', 50)}`]]
  },
  {
    id: 'diluicao', titulo: 'Diluição de um ácido', nivel: 'medir', ver: 'grafico',
    objetivo: 'Acrescentar água aproxima o pH de 7 sem passar dele.',
    tubos: [{ name: 'HCl + água', solution: 'hcl', concentration: .01, initialVolume: 1, titrant: 'water', dropVolume: .1, indicator: 'universal' }],
    passos: ['Goteje água até 5 mL.', 'Veja no gráfico o pH subir cada vez mais devagar.'],
    extra: medir => [['Com 4 mL de água (5 mL no tubo)', medir('HCl + água', 40)]]
  },
  {
    id: 'cotidiano', titulo: 'Cotidiano com repolho roxo', nivel: 'explorar', ver: 'particulas',
    objetivo: 'Classificar amostras do dia a dia pela cor do indicador natural.',
    tubos: [
      { name: 'Limão', solution: 'lemon', titrant: 'water', indicator: 'cabbage' },
      { name: 'Vinagre', solution: 'vinegar', titrant: 'water', indicator: 'cabbage' },
      { name: 'Água', solution: 'water', titrant: 'water', indicator: 'cabbage' },
      { name: 'Bicarbonato', solution: 'bicarbonate', titrant: 'water', indicator: 'cabbage' },
      { name: 'Sabão', solution: 'soap', titrant: 'water', indicator: 'cabbage' }
    ],
    passos: ['Oculte o pH e classifique cada amostra pela cor.', 'Depois mostre o pH e confira.']
  },
  {
    id: 'chuva', titulo: 'Chuva ácida e correção', nivel: 'medir', ver: 'grafico',
    objetivo: 'Comparar chuva limpa e ácida e corrigir um lago com água de cal.',
    tubos: [
      { name: 'Chuva limpa', solution: 'cleanRain', initialVolume: 2, titrant: 'water', indicator: 'universal' },
      { name: 'Chuva ácida', solution: 'acidRain', initialVolume: 2, titrant: 'water', indicator: 'universal' },
      { name: 'Lago', solution: 'acidRain', initialVolume: 2, titrant: 'limewater', titrantConcentration: .0005, dropVolume: .01, indicator: 'universal' }
    ],
    passos: ['Compare o pH das duas chuvas.', 'No tubo Lago, goteje água de cal até o pH ficar entre 6 e 8.'],
    extra: medir => [['Lago depois de 11 gotas', medir('Lago', 11)]]
  }
];
