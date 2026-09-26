'use strict';
/* Manual digital da bancada, escrito como dados.
   Cada seção: id (endereço #/manual/<id>), titulo, resumo, alvo (elemento da
   bancada destacado por "Mostrar na bancada"), painel (true se o alvo fica na
   prateleira, que no celular é um painel inferior), nivel (módulo necessário
   para o alvo aparecer: explorar, medir ou calcular) e blocos de conteúdo:
     { p }            parágrafo
     { lista: [] }    lista de itens ("Rótulo: texto" deixa o rótulo em negrito)
     { passos: [] }   passo a passo numerado
     { dica }         observação destacada
     { teclas: [[tecla, ação]] }
     { faq: [[pergunta, resposta]] }
     { gerado }       conteúdo montado pelo programa: diagrama, roteiros, frascos, indicadores
   Para mudar um texto, edite aqui. O "alvo" precisa existir no index.html,
   senão "Mostrar na bancada" não encontra a parte. */
SIAB.manual = [
  {
    id: 'comecar', titulo: 'Primeiros passos',
    resumo: 'O que é a bancada e como fazer o primeiro teste em um minuto.',
    blocos: [
      { p: 'A bancada é um laboratório virtual de ácidos e bases. Você escolhe o que vai no tubo, escolhe o que vai no conta-gotas e acompanha, a cada gota, a cor, o pH, as partículas e o gráfico.' },
      { gerado: 'diagrama' },
      { p: 'A bancada começa vazia: nenhum tubo, nenhuma amostra. Você monta o teste do zero.' },
      { passos: [
        'Na Prateleira (1), abra o menu “Tubo” e toque em um frasco: ele vira o “Tubo 1”.',
        'Abra o menu “Conta-gotas” e toque no frasco que vai gotejar.',
        'Escolha um indicador, logo abaixo dos frascos.',
        'Segure o botão “Segure para gotejar” (3) e observe a leitura (2) e o painel VER (4).',
        'Se algo sair diferente do que queria, toque em “Desfazer”.'
      ] },
      { dica: 'No celular, a prateleira abre pelo botão de ajustes no alto da tela (ícone de controles deslizantes, ao lado do botão de acessibilidade). A barra de chips logo abaixo do cabeçalho leva ao painel VER; a tira de tubos (5) fica no fim da tela.' },
      { p: 'Para um passeio de 1 minuto por cada parte, use Menu ☰ → “Tour guiado da bancada”. Quer começar com um teste já montado? Veja “Roteiros de teste prontos”.' }
    ]
  },
  {
    id: 'menu', titulo: 'Menu ☰, modos e tela', alvo: '#menu-btn',
    resumo: 'O que há no menu lateral, como ligar missões e desafios e como a tela se adapta.',
    blocos: [
      { p: 'O botão ☰, no canto esquerdo do cabeçalho, abre o menu lateral. Ele fecha com ×, com Esc, com um toque fora dele ou depois que você escolhe um destino.' },
      { lista: [
        'Navegar: bancada de testes, manual e caderno.',
        'Roteiros de teste: a seta ao lado mostra os 10 roteiros; tocar em um monta os tubos na bancada (dá para desfazer).',
        'Modos: o interruptor “Missões, desafios e professor” mostra as 14 missões guiadas, os 5 jogos e o painel do professor. Desligado, fica só a bancada. A escolha fica salva. Um link de aula enviado pelo professor liga esse modo sozinho.',
        'Preferências → Acessibilidade: interruptores de tema, contraste, texto, animações, cores, som e Libras (veja “Acessibilidade e teclado”).',
        'Aplicativo: tour guiado da bancada, instalar o app, ideias para a aula e informações sobre o SIAB.'
      ] },
      { lista: [
        'Cabeçalho: “SIAB” com o nome por extenso, Simulador Interativo de Ácidos e Bases. A aba destacada (ou, no celular, a barra de baixo) mostra em que parte você está. Se faltar espaço (texto ampliado), os botões ficam só com o ícone e as abas descem para uma segunda linha.',
        'Computador: o botão com seta ao lado de “Prateleira” e de “VER” recolhe o painel num trilho de ícones, e a bancada ganha espaço (a escolha fica salva). Tocar num ícone traz só aquela parte, num cartão flutuando por cima da bancada, sem mudar o tamanho dela: dá, por exemplo, para deixar o gráfico flutuando e gotejar enquanto ele muda. O mesmo ícone, o ×, Esc ou um toque na bancada (no caso da prateleira) fecham o cartão. O primeiro ícone do trilho, ou o botão com seta no cartão, fixa o painel de novo.',
        'Celular e tablet: a barra de chips (Tubo em foco, Visão geral, Gráfico, Partículas, Equação, Histórico) rola para os lados e fica presa abaixo do cabeçalho.',
        'Celular: a prateleira abre por baixo e fecha sozinha depois que você escolhe um frasco, para o resultado aparecer na hora.'
      ] }
    ]
  },
  {
    id: 'modulos', titulo: 'Módulos: Explorar, Medir e Calcular', alvo: '#modulos', painel: true,
    resumo: 'O que cada módulo propõe e o que ele libera na bancada.',
    blocos: [
      { p: 'A bancada tem três módulos, do qualitativo ao quantitativo. A química é sempre a mesma (o mesmo balanço de cargas calcula o pH); o módulo só decide quantos controles e números aparecem, para não sobrecarregar quem está começando.' },
      { lista: [
        'Explorar (módulo 1): frascos, indicadores e vidraria. Você observa a cor, o pH e as partículas; os números do preparo ficam escondidos.',
        'Medir (módulo 2): acrescenta os ajustes de diluição, volume inicial e volume da gota. O gráfico prevê o volume de equivalência e a Equação mostra pOH e pH + pOH.',
        'Calcular (módulo 3): acrescenta as concentrações em mol/L no preparo; a Equação mostra [H₃O⁺], [OH⁻], Ka ou Kb, grau de ionização α e n = C · V; a lupa mostra a concentração de cada espécie.'
      ] },
      { passos: [
        'Toque no nome de um módulo para abrir o cartão dele.',
        'Leia o que ele propõe e o que libera.',
        'Toque em “Ativar módulo”. O selo “Ativo” mostra o módulo em uso, e a barra da bancada também (por exemplo, “MÓDULO · MEDIR”).'
      ] },
      { dica: 'Trocar de módulo não mexe nos tubos: as gotas e as medidas continuam como estavam.' }
    ]
  },
  {
    id: 'prateleira', titulo: 'Prateleira de frascos', alvo: '#painel-laboratorio', painel: true,
    resumo: 'Menus Tubo e Conta-gotas, busca e grupos de frascos.',
    blocos: [
      { p: 'A prateleira guarda todos os frascos, separados em grupos: frutas e sucos, alimentos e bebidas, soluções do cotidiano, reagentes de laboratório, sais e tampões, saúde e ambiente, e referência (água pura).' },
      { lista: [
        'Menus Tubo e Conta-gotas: cada um mostra o frasco em uso. Toque no menu para abrir a lista logo abaixo dele; tocar em um frasco coloca a solução ali e o menu se fecha. Esc também fecha.',
        'Grupos recolhíveis: a lista abre só o grupo do frasco em uso. Toque no nome de um grupo para abrir ou fechar; o número ao lado diz quantos frascos ele tem.',
        'Buscar frasco: digite parte do nome ou da fórmula, com ou sem acento (“limao” encontra “Suco de limão”; “NaOH” encontra o hidróxido de sódio). Os grupos com resultado se abrem sozinhos.',
        'Etiquetas: “no tubo” e “conta-gotas” mostram o que está em uso no tubo selecionado.'
      ] },
      { dica: 'Trocar o frasco recomeça as gotas do tubo. Se foi sem querer, toque em “Desfazer”.' }
    ]
  },
  {
    id: 'vidraria', titulo: 'Vidraria', alvo: '#vidraria-grupo', painel: true,
    resumo: 'Tubo de ensaio, béquer ou erlenmeyer: o que muda e o que não muda.',
    blocos: [
      { p: 'Na prateleira, “Vidraria” troca o recipiente de todos os tubos da bancada. O SIAB sempre abre com o tubo de ensaio.' },
      { lista: [
        'Tubo de ensaio: microescala (5 mL), o clássico dos testes rápidos com poucas gotas.',
        'Béquer: boca larga, usado para misturar, aquecer e transferir. As marcas de volume de um béquer são aproximadas (cerca de ± 5 % da capacidade).',
        'Erlenmeyer: o frasco das titulações. A boca estreita evita respingos quando se agita a mistura. Como ele é cônico, 1 mL a mais sobe pouco perto do fundo largo e sobe mais perto do gargalo: por isso as marcas ficam cada vez mais afastadas.'
      ] },
      { lista: [
        'Capacidade: o tubo de ensaio tem sempre 5 mL. O béquer pode ter 10, 25, 50, 100 ou 250 mL (começa com 50) e o erlenmeyer 25, 50, 125 ou 250 mL (começa com 125, o tamanho clássico das titulações).',
        'Ao trocar a vidraria ou a capacidade, o volume inicial acompanha: o líquido continua na mesma altura (1 mL no tubo vira 10 mL no béquer de 50 mL e 25 mL no erlenmeyer de 125 mL). As gotas recomeçam, e “Desfazer” volta tudo, inclusive a vidraria.',
        'Num recipiente novo, o volume inicial é 20 % da capacidade. No módulo Medir, “Volume inicial” vai até 80 % dela.',
      ] },
      { p: 'Tamanho de verdade: na bancada, cada recipiente aparece com as medidas reais de catálogo e todos na mesma escala, apoiados na mesma linha. O tubo de 5 mL tem 12 × 75 mm; o béquer de 50 mL, 42 × 60 mm (mais baixo e bem mais largo que o tubo); o erlenmeyer de 250 mL, 85 × 145 mm (quase o dobro da altura do tubo). A marca da capacidade fica a cerca de 2/3 da altura do béquer e perto da metade do erlenmeyer, porque vidraria de verdade tem folga acima da capacidade. Béqueres seguem a norma ISO 3819 e erlenmeyers a ISO 1773.' },
      { p: 'A escala da bancada acompanha a capacidade escolhida:' },
      { lista: [
        'Precisão do volume: centésimos de mL no tubo de 5 mL, décimos de 10 a 125 mL e mL inteiros em 250 mL. Béquer e erlenmeyer têm marcas com incerteza de cerca de 5 % da capacidade: mostrar “50,25 mL” num béquer de 250 mL seria uma precisão que o vidro não tem. O que sai do conta-gotas continua contado em centésimos, gota a gota.',
        'Atalhos em mL, perto de 1/10 da capacidade: +1 mL no tubo e no béquer de 10 mL; +1 e +5 mL em 25 e 50 mL; +5 e +10 mL em 100 e 125 mL; +10 e +25 mL em 250 mL.',
        'Prever e gotejar: as gotas oferecidas vão de cerca de 1 % a 10 % da capacidade (de 1 a 20 gotas no tubo, de 50 a 500 no recipiente de 250 mL), para a previsão ter efeito visível.',
        'A capacidade aparece uma vez só, ao lado do volume (“10,3 mL de 50 mL”).'
      ] },
      { dica: 'A concentração não muda com a vidraria: o pH e a cor de cada frasco são os mesmos. O que muda com o volume é quanto é preciso gotejar para neutralizar (mais amostra pede mais gotas).' },
      { p: 'Os nomes que o programa dá (“Tubo 2”) acompanham a troca (“Béquer 2”). Nomes escolhidos por você não mudam.' }
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
      { p: 'Como a cor é calculada: o indicador é um ácido fraco (HIn ⇌ H⁺ + In⁻) cujas duas formas têm cores diferentes. A fração da forma básica é α = 1 / (1 + 10^(pKIn − pH)) (equação de Henderson–Hasselbalch; pKIn ≈ 9,4 na fenolftaleína, 7,1 no bromotimol, 6,5 no tornassol e 3,7 no alaranjado de metila). A cor vista é a soma das absorções das duas formas (lei de Beer–Lambert): por isso o bromotimol passa por verde (amarelo + azul), o tornassol por violeta e o alaranjado de metila por laranja. O olho percebe a troca quando uma forma é cerca de 10 vezes mais abundante que a outra: daí a faixa de viragem de mais ou menos 1 unidade em torno do pKIn.' },
      { dica: 'Repolho roxo e indicador universal são cartas aproximadas: servem para comparar amostras, não para medir o pH exato. A cor também não escurece nos recipientes largos: no laboratório, a quantidade de indicador acompanha o recipiente (poucas gotas no tubo, algumas a mais no béquer), e assim a intensidade fica parecida.' }
    ]
  },
  {
    id: 'medidas', titulo: 'Ajustes de medida', alvo: '#ajustes', painel: true, nivel: 'calcular',
    resumo: 'Concentração, diluição, volume inicial e tamanho da gota.',
    blocos: [
      { p: 'Os ajustes aparecem nos módulos Medir e Calcular. Valem para o tubo selecionado e para os tubos vinculados a ele.' },
      { lista: [
        'Concentração no tubo e no conta-gotas (módulo Calcular): de 0,0001 a 0,1 mol/L. Aparece para reagentes de laboratório, sais, tampões e antiácidos.',
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
    resumo: 'pH, olho, variação, volume, cor e equivalência.',
    blocos: [
      { lista: [
        'pH: duas casas decimais para reagentes; “≈” e uma casa para amostras do cotidiano e da chuva, que são estimativas.',
        'Ácida, Neutra ou Básica: comparação com o pH neutro (7 a 25 °C).',
        'Variação: depois das gotas, aparece por alguns segundos, por exemplo “3,59 → 7,00 (+3,41)”.',
        'Olho, ao lado de “pH”: oculta o pH (o número, a escala e o gráfico) e mostra de novo. Use para prever antes de ver.',
        'Escala de pH: fica no painel VER, acima das abas (veja “Painel VER”).',
        'Volume: quanto líquido há no recipiente e a capacidade dele (5 mL no tubo de ensaio).',
        'Cor: nome da cor e do indicador, abaixo do tubo.',
        'Ponto final observado: quando a cor do indicador muda e fica, aparece “Ponto final observado: incolor → rosa claro com 10,05 mL”. Nos módulos Medir e Calcular, vem junto a equivalência calculada (quantidades estequiométricas). Os dois nem sempre coincidem: a diferença é o erro de titulação, e depende do indicador escolhido.',
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
        '+5 gotas e os atalhos em mL: para ir mais rápido. Os mL acompanham a capacidade (+1 mL no tubo; +10 e +25 mL no béquer de 250 mL; veja “Vidraria”).',
        'Desfazer: desfaz a última ação inteira (uma sequência de gotas, a troca de frasco, as medidas, a remoção de um tubo…).',
        'Linha acima do botão: o que está no conta-gotas, quantas gotas já caíram, o volume e o tamanho de cada gota.',
        'Capacidade: quando o recipiente fica cheio, os botões de gotejar ficam desativados.',
        'Na vidraria: enquanto você goteja, o conta-gotas aparece sobre a boca do recipiente. Cada gota se forma na ponta, cai e, ao chegar, faz ondas; o nível sobe nesse momento. “Reduzir animações” desliga esse movimento.',
        'Tamanho da gota: a gota desenhada tem o tamanho de verdade, na mesma escala da vidraria. Uma gota de volume V é uma esfera de diâmetro d = ∛(6V/π): 0,01 mL dá 2,7 mm; 0,05 mL, 4,6 mm; 0,10 mL, 5,8 mm.',
        'Bureta (no erlenmeyer): nas titulações, o titulante vem de uma bureta presa sobre o erlenmeyer; a torneira abre enquanto você goteja, e a linha do conta-gotas passa a dizer “Bureta”. O botão “½ gota” adiciona meia gota: no laboratório, abre-se a torneira só até a gota ficar pendurada na ponta, encosta-se a gota na parede do frasco e ela é lavada para dentro com a pisseta. Perto do ponto final, isso deixa a leitura mais precisa.',
        'Menisco: a água molha o vidro e sobe um pouco junto da parede, formando uma superfície curva (menisco côncavo). O volume se lê pela parte de baixo do menisco, na altura dos olhos.',
        'Cor onde a gota cai: antes de se misturar, a gota forma uma zona com pH próprio. Numa titulação com fenolftaleína, o NaOH deixa essa zona rosa mesmo com o resto ainda ácido; o rosa some quando a gota se mistura. Longe do ponto final, some logo; perto dele, demora; depois dele, fica. O simulador calcula essa zona em etapas (a gota com 1,5, 3, 6… 96 gotas de volume do líquido), até virar o recipiente todo.',
        'Agitar (ao lado da cor): termina a mistura na hora, como girar o erlenmeyer ou mexer o béquer. No laboratório, o ponto final é quando a cor clara dura cerca de 30 segundos, agitando.',
        'Turvação: bases pouco solúveis, como Mg(OH)₂ e Al(OH)₃, deixam o líquido leitoso enquanto sobra sólido sem dissolver; com ácido, o sólido dissolve e o líquido clareia. Parado por uns segundos, o sólido assenta no fundo (na vida real leva minutos); uma gota ou Agitar suspende de novo.',
        'Bolhas de CO₂: com carbonato ou bicarbonato em meio ácido, forma-se CO₂. Quando o CO₂ dissolvido passa da solubilidade (cerca de 0,034 mol/L a 25 °C e 1 atm, lei de Henry), aparecem bolhas; se isso acontece só onde a gota cai, sobe um jorro de bolhas ali. É uma ilustração: o cálculo do pH mantém o gás dissolvido (sistema fechado).'
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
        'Escolha quantas gotas (no tubo, 1, 5, 10 ou 20; em recipientes maiores, mais gotas, com o volume em mL embaixo), se a solução ficará ácida, neutra ou básica e, se quiser, a cor esperada.',
        'Toque em “Gotejar e conferir”: as gotas caem e aparece a comparação com ✓ ou ✗.',
        'Escreva a explicação e toque em “Salvar no caderno”.'
      ] },
      { dica: 'A previsão é salva no caderno mesmo se você fechar sem escrever a explicação.' }
    ]
  },
  {
    id: 'ver', titulo: 'Painel VER', alvo: '#ver-panel',
    resumo: 'Escala de pH, gráfico, partículas, condução, equação e histórico do tubo selecionado.',
    blocos: [
      { p: 'No alto do painel fica a Escala de pH: o triângulo marca o pH na escala de 0 a 14, o tracejado marca o neutro e o colchete embaixo mostra a faixa de viragem do indicador (onde ele muda de cor). A segunda linha mostra [H₃O⁺] em potências de 10 (10⁰, 10⁻⁷, 10⁻¹⁴ mol/L): a escala de pH é logarítmica, e cada unidade de pH é 10 vezes mais ou menos H₃O⁺. Com o pH oculto, a escala some junto com o número e o gráfico.' },
      { lista: [
        'Gráfico: pH × volume adicionado, um ponto por gota. Faixa colorida: viragem do indicador. Linha tracejada vertical: equivalência. Losango: ponto final observado (a gota em que a cor mudou). Círculo “pH = pKa”: meia-equivalência (ácido ou base fraca). Faixa clara “região tampão”: onde a razão base/ácido conjugado vai de 0,1 a 10 (pH = pKa ± 1) e o pH quase não muda. Tracejado horizontal: pH neutro.',
        'No módulo Calcular, o gráfico tem mais duas vistas. ΔpH/ΔV: a variação de pH por mL entre gotas seguidas (a conta que se faz com a tabela do Histórico); o pico marca a equivalência, onde a curva é mais íngreme. Espécies: o diagrama de distribuição, com a fração α de cada espécie do ácido ou base fraca em função do pH, dada por α = [espécie] / total; duas espécies vizinhas se cruzam em α = 0,5 quando pH = pKa, e a linha “pH agora” mostra a mistura do momento.',
        'Partículas: a lupa mostra íons e moléculas dissolvidos, em proporção à concentração (a espécie mais abundante tem 36 partículas). Círculo com contorno: molécula; círculo vazado: íon espectador (Na⁺, Cl⁻…, que não troca prótons); quadrado: sólido não dissolvido; “traço”: menos de 1 partícula nesta escala. A água não aparece. As partículas passeiam devagar (difusão).',
        'Escala logarítmica (botão na lupa): o número de partículas passa a acompanhar o expoente da concentração (cada 3 partículas = 10 vezes), e aparecem os íons raros, como o OH⁻ em meio ácido.',
        'Acontecimentos na lupa: depois das gotas, partículas do conta-gotas entram e reagem (H₃O⁺ + OH⁻ → 2 H₂O, ou CH₃COOH + OH⁻ → CH₃COO⁻ + H₂O com um ácido fraco). Com um ácido fraco e sua base conjugada presentes, um próton pula de uma partícula para a outra de tempos em tempos e as quantidades não mudam: o equilíbrio é dinâmico.',
        'Condução: o teste de condução elétrica e o condutímetro. A lâmpada acende mais quando há mais íons, ou íons mais rápidos. A leitura (µS/cm ou mS/cm) vem da lei de Kohlrausch, κ = Σ λ° · c: cada íon contribui com a própria condutividade molar (λ°) vezes a concentração. A barra “Quem carrega a corrente” mostra a parte de cada íon, com as cores da lupa (listrado: íon espectador).',
        'H₃O⁺ (λ° = 349,6) e OH⁻ (198) conduzem de 4 a 7 vezes mais que Na⁺ (50,1) ou Cl⁻ (76,3): o próton salta de uma molécula de água para a vizinha (mecanismo de Grotthuss). Por isso a curva κ × volume faz um “V” numa titulação de ácido forte com base forte, com o vértice na equivalência: é a titulação condutométrica, que dispensa indicador. No módulo Calcular aparece a conta íon por íon. Os valores são ideais (diluição infinita); acima de 0,01 mol/L o medido é um pouco menor.',
        'Pontes entre representações: toque numa fórmula da Equação, num íon da Condução ou numa espécie do diagrama de distribuição, e a lupa abre com aquela espécie em destaque (as outras ficam apagadas). Na lupa, tocar no nome da espécie liga e desliga o destaque.',
        'Equação: ionização do que está no tubo e no conta-gotas, reação ao misturar e números. Uma seta curva laranja, com “H⁺”, vai do doador de próton (ácido) ao receptor (base): em CH₃COOH + H₂O ⇌ H₃O⁺ + CH₃COO⁻, o H⁺ passa do ácido acético para a água. pOH aparece no módulo Medir; [H₃O⁺], Ka, α e quantidades em mmol, no módulo Calcular.',
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
        'Visão geral (aba no alto): todos os tubos lado a lado, com cor e pH. O número no canto é a posição do tubo na bancada.',
        'Ordenar por pH (na visão geral, com o pH à vista): os recipientes ficam do mais ácido ao mais básico, e uma régua de pH marca cada um com a cor do líquido e o número dele. Bom para montar uma escala de pH com amostras do cotidiano.',
        'Comparar indicadores (na prateleira): cria 3 cópias do tubo com bromotimol, fenolftaleína e indicador universal, vinculadas: cada gota cai nas três.',
        'Desvincular este tubo: o tubo volta a receber gotas sozinho.',
        'Recomeçar gotas: tira todas as gotas do tubo.',
        'Imprimir relatório (na prateleira, ou Ctrl+P na bancada): uma folha A4 com cabeçalho (Nome, Turma e Data), a tabela de todos os recipientes, o recipiente em foco (desenho, preparo, leitura, gráfico e tabela de gotas), linhas para observações e a nota sobre o modelo. Botões, painéis e o VLibras não saem no papel.',
        'Remover tubo: pede confirmação; “Desfazer” traz o tubo de volta. Removendo o último, a bancada fica vazia de novo.'
      ] }
    ]
  },
  {
    id: 'caderno', titulo: 'Caderno de laboratório', link: ['#/caderno', 'Abrir o caderno'],
    resumo: 'Onde ficam previsões e leituras.',
    blocos: [
      { lista: [
        'O que entra: previsões do “Prever e gotejar”, leituras de “Registrar no caderno” e, no modo completo, missões e desafios. Cada nota tem data e hora.',
        'Leituras: guardam a tabela de gotas como tabela (Gota, Adicionado, pH, Cor), com rolagem própria e “Baixar esta tabela (CSV)”. Com o pH oculto, a coluna pH fica “—”.',
        'Baixar caderno (CSV): uma planilha com todas as notas. As linhas da tabela de gotas ocupam as colunas gota, volume_adicionado_mL, pH e cor.',
        'Imprimir: imprime as notas numa folha com cabeçalho (Nome, Turma e Data) e número de página; tabelas longas continuam na página seguinte, repetindo o cabeçalho.',
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
    resumo: 'Painel com interruptores, som do pH, Libras e uso sem mouse.',
    blocos: [
      { p: 'O botão de acessibilidade (figura humana), no alto da tela, abre o menu ☰ direto no painel “Acessibilidade”. Cada linha tem um interruptor; tudo fica salvo neste navegador.' },
      { lista: [
        'Modo escuro: desligado, a tela fica clara.',
        'Alto contraste: fundo preto, texto branco e destaques amarelos.',
        'Tamanho do texto: A− e A+, de 80 % a 200 %.',
        'Espaçamento de letras: mais espaço entre letras e palavras.',
        'Reduzir animações: desliga gota caindo, partículas se mexendo e a animação de abertura.',
        'Animação de abertura: tubos de ensaio mudando de cor ao abrir ou recarregar. Um toque ou uma tecla pula.',
        'Leitura simples: texto um pouco maior, cores mais firmes e nada se mexendo.',
        'Simular daltonismo: filtros para ver como a bancada aparece para pessoas com daltonismo. Não são correções.',
        'Som do pH: um tom a cada gota, mais agudo quanto maior o pH.',
        'Vibrar na viragem: o celular vibra quando o indicador muda de cor (em aparelhos compatíveis).',
        'Tradutor de Libras (VLibras): o tradutor oficial do governo federal. Precisa de internet.',
        'Restaurar padrões: volta tudo ao início.'
      ] },
      { teclas: [['Tab / Shift + Tab', 'avançar / voltar entre controles'], ['Enter ou Espaço', 'acionar botões e interruptores'], ['← →', 'trocar de aba no painel VER'], ['↑ ↓', 'percorrer listas de escolha'], ['Esc', 'fechar diálogos, o menu ☰, o painel da prateleira e o tour'], ['Qualquer tecla', 'pular a animação de abertura']] },
      { dica: 'Leitores de tela anunciam a cor, o pH e o número de gotas depois de cada sequência de gotas.' }
    ]
  },
  {
    id: 'app', titulo: 'Instalar e usar sem internet',
    resumo: 'Aplicativo no computador ou no celular.',
    blocos: [
      { lista: [
        'Aberto como arquivo (index.html): tudo funciona, mas não dá para instalar.',
        'Aberto por um endereço http(s), como o GitHub Pages ou “npm start”: aparece “Instalar app” no cabeçalho (computador) e em Menu ☰ → Aplicativo (ou use o menu do navegador, “Instalar aplicativo” / “Adicionar à tela de início”).',
        'Ao abrir: a animação de abertura mostra tubos de ensaio mudando de composto e de cor (as cores vêm do próprio simulador). Toque para pular; dá para desligar em Acessibilidade.',
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
        ['Por que vinagre com bicarbonato não faz espuma?', 'O cálculo não retira gases: o CO₂ formado fica dissolvido (sistema fechado). Quando ele passa da solubilidade (cerca de 0,034 mol/L), a vidraria mostra bolhas, só como ilustração. Na vida real o gás escapa, e o pH final fica um pouco mais alto.'],
        ['A condutividade é exata?', 'É o valor ideal da lei de Kohlrausch (diluição infinita, 25 °C). Em soluções mais concentradas que 0,01 mol/L, os íons se atrapalham e o condutímetro de verdade mostra um valor menor. Íons sem valor tabelado (ânions orgânicos dos alimentos) usam uma estimativa pela carga, marcada com ≈.'],
        ['Por que a fenolftaleína não muda na equivalência do HCl?', 'Ela muda entre pH 8,2 e 10. Na titulação de HCl com NaOH, o pH salta de cerca de 3,6 para 10,4 em duas gotas; a cor rosa aparece logo depois da equivalência.'],
        ['Diluir muito um ácido deixa a solução básica?', 'Não. Com mais água, o pH se aproxima de 7, sem passar dele.'],
        ['As cores são exatas?', 'Não. São representações didáticas das faixas de viragem. O repolho roxo real varia com o preparo do extrato.'],
        ['A vidraria muda o resultado?', 'O pH de cada frasco não muda: ele depende da concentração, não do volume. Com mais amostra (um recipiente maior), é preciso gotejar mais para neutralizar, e a curva do gráfico se estica no eixo do volume.'],
        ['Posso mudar a temperatura?', 'Na bancada, não: tudo está a 25 °C. A temperatura só muda na missão “Neutro nem sempre é 7”, no modo completo.'],
        ['Antiácidos: posso usar isso para saber a dose?', 'Não. É uma atividade didática, não uma orientação de saúde.']
      ] },
      { p: 'Fontes das constantes e equações: Menu ☰ → Aplicativo → Sobre o SIAB (OpenStax, Chemistry 2e).' }
    ]
  }
];

/* Roteiros de teste prontos: tubos (como em SIAB.newTube; "grupo" vincula
   tubos), módulo da bancada, aba do painel VER e o que fazer depois de montar.
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
