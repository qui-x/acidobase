# SIAB — Simulador Interativo de Ácidos e Bases · versão 0.7.0

**SIAB — Simulador Interativo de Ácidos e Bases.** Missões guiadas, desafios e
uma bancada de laboratório para ensinar ácidos e bases no ensino médio.
Funciona no computador e no celular, com ou sem internet, e pode ser instalado
como aplicativo.

## Como abrir

| Forma | Como | Instala como app? |
| --- | --- | --- |
| Arquivo | Abra `index.html` no navegador | Não, mas funciona igual |
| Servidor local | `npm start` e acesse http://localhost:8080 | Sim |
| Publicado | Publique a pasta em um endereço https (por exemplo, GitHub Pages) | Sim |
| Arquivo único | `npm run build` gera um HTML só | Não |

**Para instalar:** abra pelo endereço http(s) e use **Instalar app** (no topo,
no computador, ou em Menu ☰ → Aplicativo), ou o menu do navegador ("Instalar aplicativo" / "Adicionar à tela de
início"). Depois da primeira visita, o SIAB abre sem internet. Quando houver
versão nova, ela é baixada sozinha e aparece o aviso "Nova versão do SIAB
instalada · Recarregar".

**Se aparecer erro depois de trocar a versão** (por exemplo, `Cannot set
properties of undefined`), o navegador está usando arquivos antigos guardados
no cache. Recarregue com **Ctrl + Shift + R** (no Mac, Cmd + Shift + R). Se
continuar, feche todas as abas do SIAB e abra de novo, ou apague os dados do
site (F12 → Application → Storage → Clear site data). Desde a versão 0.3.1,
cada arquivo é pedido com a versão no endereço (`app.js?v=0.7.0`), o que evita
essa mistura.

## O que há na versão 0.7: muito mais substâncias

A prateleira passou de 31 para **140 frascos** (85 reagentes e 55 amostras), em 16 grupos
recolhíveis, e de 7 para 12 indicadores.
As constantes vêm de tabelas usuais: Harris, CRC Handbook, Lehninger para os
aminoácidos e Baes e Mesmer para os cátions metálicos.

- **Ácidos e bases:**
  - fortes: HNO₃, HBr, HI, HClO₄, H₂SO₄, KOH, LiOH, Ba(OH)₂;
  - ácidos fracos: fórmico, benzoico, propanoico, láctico, cloroacético,
    HF, HNO₂, HClO, HCN, bórico, fenol e AAS;
  - bases fracas: metilamina, etilamina, dimetilamina, trimetilamina,
    piridina, anilina, hidroxilamina, hidrazina, etanolamina, imidazol e
    Tris.
- **Ácidos polipróticos:** H₃PO₄, H₂CO₃, H₂SO₃, oxálico, cítrico, tartárico e
  ascórbico (vitamina C).
- **Sais:**
  - neutros, ácidos, básicos e anfóteros: KCl, NH₄NO₃, (NH₄)₂SO₄, NaHSO₄,
    NaHCO₃, fosfatos, NaF, NaClO, acetato de amônio, citrato…;
  - sais de metais que acidificam a água: AlCl₃, FeCl₃, CuSO₄, ZnCl₂ e
    pedra-ume.
- **Tampões e aminoácidos:**
  - tampões amônia, carbonato, citrato, bórax e Tris;
  - glicina, alanina, ácido glutâmico e lisina, com o pH perto do ponto
    isoelétrico.
- **Amostras do dia a dia:**
  - sucos (maracujá, uva, acerola, caju…);
  - vinho, cerveja, água com gás, refrigerantes, chás, mel, shoyu e clara de
    ovo;
  - água sanitária, amoníaco, detergente, creme dental e xampu;
  - antiácido efervescente, vitamina C e soro fisiológico;
  - suco gástrico, saliva, plasma, urina, suor e lágrima;
  - água do mar, mineral, da torneira, de piscina, destilada exposta ao ar
    e extrato de solo ácido.
- **Íons que não mudam o pH** (o sal da água do mar, do soro, do plasma)
  aparecem na lupa e conduzem corrente: o sal de cozinha acende a lâmpada, e
  o açúcar não.
- **Titulação com várias equivalências:**
  - o H₃PO₄ e o Na₂CO₃ mostram dois saltos, cada um com sua meia-etapa
    (pH = pKa₁, pKa₂);
  - o H₂SO₄ gasta 2 NaOH por fórmula;
  - a Equação mostra a reação etapa por etapa, com a seta do H⁺.
- **Cinco indicadores novos** em "Mais indicadores": vermelho de metila,
  verde de bromocresol, vermelho de fenol, timolftaleína e cúrcuma
  (açafrão-da-terra).
- **Verificação:** um teste compara o pH de cada substância nova com a conta
  independente do livro-texto (quadrática para ácidos e bases fracos,
  anfóteros, ponto isoelétrico, tampões). São 1490 verificações.

## Seleção, vínculos e relatório · 0.6.5

Na **Visão geral**, use **Ctrl + clique** (⌘ + clique no Mac), pressione um
recipiente por cerca de meio segundo ou use **Selecionar tubos**. Marque e
desmarque com um toque, ou use **Selecionar todos**. Arrastar ou rolar cancela
a espera do gesto. Uma nova seleção começa vazia; **Revisar seleção** recupera
somente a lista já confirmada para o relatório.

No celular (até 900 px), os recipientes se organizam em **lista vertical, um
por linha**, com miniatura, nome e marca de seleção. As ações ficam na parte
inferior da tela, acima da navegação; a lista reserva espaço para essa barra.
No computador, a seleção mantém a grade da visão geral.

### Imprimir pelo botão da barra lateral

O único botão **Imprimir relatório** fica no painel esquerdo (no celular,
abra **Prateleira**). Ele usa os tubos marcados na seleção em andamento,
inclusive antes de usar **Adicionar ao relatório**. O contador no próprio
botão informa quantos recipientes serão impressos. Uma seleção vazia não
imprime todos por engano; Ctrl+P segue o mesmo critério.

**Adicionar ao relatório** confirma a lista para uso posterior e mostra esse
mesmo botão na prateleira. Cada recipiente escolhido ganha preparo, leitura,
gráfico e histórico no documento. **Revisar seleção** permite trocar a lista;
**Usar relatório padrão** volta ao resumo da bancada e ao detalhe do tubo em
foco. São usadas as leituras atuais, não um registro congelado. A lista vale
até recarregar a página e fica separada entre laboratório livre e missão.

### Vincular tubos já preparados

Selecione pelo menos dois tubos e use **Vincular tubos**. Os cartões, a tira
da bancada e o tubo em foco mostram **Grupo 1**, **Grupo 2** etc. Cada comando
de gotejamento adiciona a mesma dose a todos os integrantes do grupo.

- Amostra, indicador, conta-gotas e gotas anteriores são preservados.
- O volume de cada nova gota é igualado ao do tubo em foco, se ele estiver
  selecionado; caso contrário, ao primeiro selecionado na ordem da bancada.
  O texto da seleção informa a referência antes de vincular.
- Cada tubo utiliza seu próprio reagente do conta-gotas. Para comparar amostras
  usando o mesmo titulante, prepare esse conta-gotas nos tubos desejados.
- Nos vínculos manuais, trocar frasco ou aplicar preparo afeta só o tubo em
  foco. O volume da gota continua comum ao grupo. Recomeçar gotas afeta só o
  tubo em foco. **Comparar indicadores** mantém o preparo compartilhado das
  três cópias, como antes.
- **Desvincular**, na seleção, retira os tubos marcados dos grupos.
  **Desvincular este tubo**, na prateleira, retira apenas o tubo em foco.
  Grupos que ficarem com um único integrante são desfeitos automaticamente.
- Ao vincular integrantes de grupos diferentes, só os marcados formam o novo
  grupo; os demais mantêm seus vínculos se ainda houver pelo menos dois.
- **Desfazer** restaura vínculos e volume de gota anteriores. Se algum tubo não
  comportar uma dose, ela não é adicionada a nenhum integrante do grupo.

Nas missões, os vínculos definidos pelo roteiro continuam protegidos.

Teclado: Tab navega pelos controles; Enter/Espaço marca um cartão em modo de
seleção; Ctrl/⌘ + A seleciona todos quando o foco está nessa área; Esc cancela.

Verificação: `tests/selecao-relatorio.test.cjs` cobre seleção, gestos, impressão
pelo painel, vinculação, desfazer e capacidade dos grupos com jsdom. Esses
testes verificam eventos e estado; não substituem inspeção visual e uso em
um aparelho com tela de toque.

## O que há na versão 0.6

Melhorias didáticas nas animações e visualizações, cada uma apoiada no que a
pesquisa em ensino de química aponta como difícil de enxergar (a ligação entre
o que se vê, as partículas e os símbolos; a escala logarítmica; o equilíbrio
dinâmico; a diferença entre ponto final e ponto de equivalência).

- **Cor onde a gota cai:** antes de se misturar, a gota forma uma zona com pH
  próprio. O simulador calcula essa zona em etapas (a gota misturada a 1,5, 3,
  6… 96 vezes o próprio volume) e mostra a cor de cada etapa até o recipiente
  todo. Numa titulação com fenolftaleína, o rosa some logo longe do ponto
  final, demora perto dele e fica depois dele: é o critério usado no
  laboratório (a cor clara que dura cerca de 30 s).
- **Agitar:** botão ao lado da cor que termina a mistura na hora, girando o
  recipiente como se gira o erlenmeyer.
- **Ponto final observado × equivalência calculada:** a bancada anota a gota em
  que a cor do indicador mudou ("incolor → rosa claro com 10,05 mL") e, nos
  módulos Medir e Calcular, a equivalência calculada ao lado. A diferença é o
  erro de titulação.
- **Cor do indicador pela química:** a fração da forma básica vem do pKIn
  (α = 1 / (1 + 10^(pKIn − pH))) e a cor soma as absorções das duas formas
  (lei de Beer–Lambert). Assim o bromotimol passa por verde, o tornassol por
  violeta e o alaranjado de metila por laranja, sem cores inventadas. A cor
  não escurece nos recipientes largos, porque no laboratório a quantidade de
  indicador acompanha o recipiente.
- **Lupa de partículas:**
  - escala logarítmica opcional (cada 3 partículas = 10 vezes), que mostra os
    íons raros, como o OH⁻ em meio ácido;
  - íons espectadores vazados (Na⁺, Cl⁻);
  - partículas que se movem devagar (difusão);
  - depois das gotas, partículas entram e reagem (H₃O⁺ + OH⁻ → 2 H₂O, ou o
    ácido fraco com o OH⁻);
  - com ácido fraco e base conjugada, um próton pula de uma partícula para
    outra sem mudar as quantidades (equilíbrio dinâmico).
- **Escala de pH com [H₃O⁺]:** uma segunda linha mostra 10⁰, 10⁻⁷ e
  10⁻¹⁴ mol/L sob pH 0, 7 e 14 (cada unidade de pH = 10 vezes em [H₃O⁺]).
- **Celular:** o conta-gotas fica preso acima da barra de baixo mesmo quando
  você rola até o painel VER.
- **Condução (nova aba do VER):** teste de condução com lâmpada e
  condutímetro (µS/cm ou mS/cm) pela lei de Kohlrausch, κ = Σ λ° · c, com os
  valores de λ° do CRC Handbook. A barra "Quem carrega a corrente" mostra a
  parte de cada íon, nas cores da lupa. A curva κ × volume faz o "V" da
  titulação condutométrica: H₃O⁺ e OH⁻ conduzem de 4 a 7 vezes mais que Na⁺ e
  Cl⁻. No módulo Calcular aparece a conta íon por íon.
- **Gráfico mais completo:**
  - losango no ponto final observado;
  - faixa da região tampão (pH = pKa ± 1) nas titulações de ácido ou base
    fraca;
  - no módulo Calcular, duas vistas a mais: ΔpH/ΔV, cujo pico marca a
    equivalência, e o diagrama de distribuição das espécies (α × pH), com o
    pH do momento.
- **Turvação:** Mg(OH)₂ e Al(OH)₃ sem dissolver deixam o líquido leitoso, na
  cor do indicador. O líquido clareia quando o ácido dissolve o sólido, o
  sólido assenta se o recipiente fica parado, e Agitar suspende de novo.
- **Bolhas de CO₂ (ilustração):** com carbonato ou bicarbonato em meio ácido,
  aparecem bolhas quando o CO₂ dissolvido passa da solubilidade (0,034 mol/L,
  lei de Henry). Se isso acontece só onde a gota cai, sobe um jorro de bolhas
  ali. O cálculo do pH continua com o gás dissolvido.
- **Gota de verdade e menisco:** a gota desenhada tem o diâmetro de uma
  esfera do mesmo volume, d = ∛(6V/π) (0,05 mL = 4,6 mm), na escala da
  vidraria. A superfície do líquido sobe junto do vidro (menisco côncavo), e
  o volume se lê pela parte de baixo dele.
- **Bureta no erlenmeyer:** a ponta da bureta fica presa sobre o frasco, e a
  torneira abre enquanto você goteja. O botão "½ gota" simula a meia gota
  encostada na parede e lavada com a pisseta, para chegar ao ponto final com
  mais precisão.
- **Pontes entre representações:** tocar numa fórmula da Equação, num íon da
  Condução ou numa espécie do diagrama de distribuição abre a lupa com
  aquela espécie em destaque.
- **Seta do próton:** na Equação, uma seta curva com "H⁺" vai do doador
  (ácido) ao receptor (base). O programa acha os dois comparando reagentes e
  produtos: um perde um H e o outro ganha um.
- **Ordenar por pH:** na visão geral, os recipientes ficam do mais ácido ao
  mais básico, sobre uma régua de pH que marca cada um com a cor e o número.
- **Tabela de gotas compacta:** no caderno, na aba Histórico e na folha
  impressa, gotas seguidas com a mesma cor e pH quase igual (até 0,2 de
  diferença) viram um registro só, como "51–100 | 2,55–5,00 | 2,31–2,48 |
  vermelho". Cada registro junta até 50 gotas, ou 100 quando a tabela passa
  de 1000 gotas. Perto do ponto final cada gota continua numa linha. Uma
  titulação de 620 gotas cabe em 30 linhas. Tabelas de até 60 linhas ficam
  gota a gota, as leituras antigas longas são compactadas ao abrir o caderno
  e o CSV do Histórico continua com todas as gotas.

## O que há na versão 0.5

O SIAB abre na **bancada de testes**, e ela **começa vazia**: você toca num
frasco da prateleira e ele vira o "Tubo 1".

- **Módulos Explorar, Medir e Calcular:** três cartões recolhíveis na
  prateleira, como os cartões de modelo do SIMA, nas cores da marca: os
  ícones dos três módulos, lado a lado, refazem o degradê do SIAB (vermelho →
  rosa → fúcsia → violeta). Cada um mostra o número, o
  selo "Ativo", o que propõe, o que libera na bancada e o botão "Ativar
  módulo". A química é a mesma nos três; muda só quantos controles e números
  aparecem (do qualitativo ao quantitativo).
- **Menus Tubo e Conta-gotas:** a prateleira mostra dois menus recolhíveis com
  o frasco em uso. A lista abre logo abaixo do menu escolhido e fecha depois
  da escolha; os grupos de frascos também se recolhem, e a busca abre os que
  têm resultado. Com isso a prateleira ficou cerca de 63 % mais curta
  (de 3.281 para 1.208 px no computador).
- **Vidraria em tamanho de verdade:** tubo (12 × 75 mm), béqueres (ISO 3819)
  e erlenmeyers (ISO 1773) são desenhados com as medidas reais, todos na mesma
  escala e na mesma linha da bancada: o béquer de 50 mL aparece mais baixo e
  bem mais largo que o tubo, e o erlenmeyer de 250 mL quase com o dobro da
  altura. O nível do líquido vem do volume dentro da forma real.
- **Responsivo de 320 px a 2K:** em telas grandes a letra cresce um pouco, os
  painéis alargam e leitura, vidraria e conta-gotas ficam juntos no centro; no
  celular, os atalhos cabem numa linha e o manual não passa da tela.
- **Centro da bancada mais limpo:** a escala de pH saiu do centro e foi para o
  topo do painel VER, com a leitura e a faixa de viragem do indicador; "Ocultar
  pH" virou um botão de olho ao lado de "pH"; o tamanho da gota só aparece nos
  módulos Medir e Calcular.
- **Impressão de verdade:** "Imprimir relatório" (ou Ctrl+P na bancada) gera
  um relatório A4 com cabeçalho (logotipo, título, data, Nome e Turma),
  tabela dos recipientes, o recipiente em foco (desenho, preparo, leitura,
  gráfico e tabela de gotas em duas colunas), linhas para observações e a nota
  do modelo. Caderno, manual e roteiro do professor saem com o mesmo
  cabeçalho, paleta clara em qualquer tema e "Página X de Y" no rodapé. Botões,
  painéis e o VLibras nunca vão para o papel.
- **Escala do recipiente:** os números acompanham a capacidade escolhida. O
  volume aparece com a precisão que o vidro permite (centésimos no tubo de
  5 mL, décimos de 10 a 125 mL, mL inteiros em 250 mL, já que as marcas de
  béquer e erlenmeyer têm cerca de ± 5 % de incerteza). Os atalhos em mL ficam
  perto de 1/10 da capacidade (+1 mL no tubo; +10 e +25 mL no béquer de
  250 mL), e "Prever e gotejar" oferece de 1 % a 10 % da capacidade em gotas.
  A capacidade aparece uma vez só ("10,3 mL de 50 mL").
- **Gotas com movimento:** o conta-gotas aparece sobre a vidraria, a gota se
  forma na ponta, cai e, ao chegar, faz ondas, respingos e espalha a nova cor;
  o nível sobe nesse momento. Na viragem, a cor se espalha mais.
- **Vidraria e capacidade:** tubo de ensaio (5 mL, sempre o padrão ao abrir),
  béquer (10 a 250 mL) ou erlenmeyer (25 a 250 mL). O volume inicial acompanha
  a capacidade e, a partir de 25 mL, aparece o atalho "+5 mL". No erlenmeyer, que é
  cônico, as marcas de 1 a 5 mL se afastam perto do gargalo, como no vidro de
  verdade.

- **Animação de abertura:** ao abrir o app ou recarregar a página, cinco tubos
  de ensaio (fenolftaleína, bromotimol, repolho roxo, metilorange e universal)
  recebem gotas e trocam de composto, de ácido a neutro e depois a básico. As
  cores e os pH vêm do próprio motor químico. Um toque ou uma tecla pula a
  animação. Ela não toca com "Reduzir animações" e pode ser desligada.
- **Barra superior compacta** (inspirada no Laboratório Virtual): botão ☰, a sigla
  SIAB com o nome por extenso (Simulador Interativo de Ácidos e Bases) e o botão
  de acessibilidade. No celular, também um
  botão para a prateleira. Se faltar espaço (texto ampliado), os botões ficam só
  com o ícone e as abas descem para uma segunda linha.
- **Menu ☰ (gaveta lateral):** navegar, os 10 roteiros de teste (montam com um
  toque), **Modos**, **Acessibilidade** e Aplicativo (tour, instalar, sobre).
- **Painel de acessibilidade com interruptores:** modo escuro, alto contraste,
  tamanho do texto, espaçamento de letras, reduzir animações, animação de
  abertura, leitura simples, simular daltonismo, som do pH, vibração, tradutor
  de Libras (VLibras, precisa de internet) e restaurar padrões.
- **Celular:** barra de chips rolável e presa abaixo do cabeçalho, que leva ao
  painel VER. A prateleira fecha sozinha depois de escolher o frasco.
- **Computador:** a prateleira e o painel VER recolhem num trilho de ícones,
  como no SIMA. Um ícone traz só aquela parte, num cartão que flutua por cima
  da bancada sem mudar o tamanho dela: dá para deixar o gráfico flutuando e
  gotejar enquanto ele muda. O mesmo ícone, o ×, Esc ou um toque na bancada
  fecham o cartão; o primeiro ícone fixa o painel de novo.
- **Tour guiado da bancada:** contorna cada parte e explica em um cartão.
- **Caderno:** a tabela de gotas fica guardada como tabela de verdade, com
  colunas, na tela, na impressão e no CSV. As notas antigas são convertidas
  sozinhas.

### Segredos da bancada (para professores: não conte aos alunos)

- **Arco-íris do pH:** toque 7 vezes seguidas no logotipo (7 é o pH neutro) ou
  digite "arco-íris" na busca da prateleira. Aparecem 7 tubos com indicador
  universal, do pH 1 ao 13.
- **Mistura geral:** digite "misturar" na busca da prateleira ou, no celular,
  agite o aparelho três vezes. Todos os tubos da bancada são despejados num
  béquer de 50 mL e o motor calcula a mistura de verdade: soluções, gotas e
  indicadores. Por exemplo, o arco-íris inteiro misturado dá pH 9,25, o pKa do
  par NH₄⁺/NH₃ que sobra depois da neutralização.

Os dois ficam no caderno como "Descoberta", e "Desfazer" volta aos tubos de
antes.

### Como acessar missões, desafios e professor

Abra o **Menu ☰ → Modos** e ligue **"Missões, desafios e professor"**. Aparecem
Início, Aprender (14 missões), Desafios (5 jogos) e Professor no menu, nas abas
do topo e na barra de baixo do celular. A escolha fica salva neste navegador.
Desligando, volta a ficar só a bancada. Um link de aula enviado pelo professor
(`#/aula/...`) liga esse modo sozinho.

## Modo completo (desde a versão 0.3)

Com o modo completo ligado, a tela inicial oferece quatro caminhos:

- **Aprender:** 4 trilhas com 14 missões guiadas (ler → prever → observar →
  agir → explicar → conferir). As respostas vão para o caderno.
- **Desafios:** 5 jogos com pontuação e recorde: Amostra misteriosa, Missão
  titulação, Super Trunfo químico, Régua do pH e Construtor de neutralização.
- **Laboratório:** bancada livre com prateleira de frascos e os módulos
  Explorar, Medir e Calcular.
- **Professor:** montar aula com link para a turma, roteiro impresso,
  respostas esperadas e modo projetor.

Na bancada:

- **Conta-gotas dinâmico:** segure para gotejar; +5 gotas; +1 mL. No teclado,
  Enter adiciona 1 gota e segurar Espaço goteja.
- **Painel VER:** gráfico da titulação ao vivo, lupa de partículas, equações e
  histórico. Tudo muda junto a cada gota.
- **Prever e gotejar:** registra previsão, resultado e explicação no caderno.
- **Desfazer amplo:** desfaz qualquer ação (gotas, frascos, medidas, remoção).
- **Novos frascos:** sais (NaCl, NH₄Cl, CH₃COONa, Na₂CO₃), tampões acetato e
  fosfato, antiácidos Mg(OH)₂ e Al(OH)₃, água de cal e água da chuva (limpa e
  ácida).
- **Caderno de laboratório:** previsões, missões, leituras e pontuações, com
  download em CSV.

Acessibilidade: veja o painel acima. A cor é sempre descrita em texto, todos os
controles funcionam pelo teclado, e o som do pH (tom mais agudo com pH maior)
e a vibração na viragem são opcionais.

## Mapa das mecânicas

| Mecânica | Onde está |
| --- | --- |
| M1 Prever antes da gota | "Prever e gotejar" no laboratório; passos "prever" das missões |
| M2 Amostra misteriosa | Desafios |
| M3 Régua do pH | Desafios |
| M4 Lupa molecular | Painel VER → Partículas; missões "Dentro da água" e "Grau de ionização" |
| M5 Gráfico ao vivo | Painel VER → Gráfico; missão "A curva da titulação" |
| M6 Missão titulação | Desafios |
| M7 Construtor de neutralização | Desafios |
| M8 Super Trunfo | Desafios |
| M9 Laboratório do tampão | Missão "Laboratório do tampão" |
| M10 Todo sal é neutro? | Missões "Todo sal é neutro?" e "Por que o sal muda o pH?" |
| M11 Estômago virtual | Missão "Estômago virtual" |
| M12 Chuva ácida e calagem | Missão "Chuva ácida e calagem" |
| M13 Duelo força × concentração | Missão "Forte ou concentrado?" |
| M14 Caderno de laboratório | Caderno; Histórico → CSV |
| M15 Neutro nem sempre é 7 | Missão "Neutro nem sempre é 7" |

## Documentação

- **Manual** (no próprio programa, aba "Manual"): cada parte da bancada, os
  módulos, a vidraria, os roteiros de teste e os limites do modelo.
- **Referências** das constantes e equações: Menu ☰ → Aplicativo → Sobre o SIAB.

## Para quem vai mexer no código

- Ao publicar uma versão nova, troque o número nos três lugares: `version` em
  `js/core/namespace.js`, o final `?v=…` de cada arquivo em `index.html` e
  `VERSAO` em `sw.js`. Assim o navegador não mistura arquivos novos e antigos.
- Arquivo `.js` novo? Inclua também na lista de arquivos do `sw.js`, para ele
  funcionar sem internet.

## Limites

Os valores são referências didáticas. Soluções ideais a 25 °C (só uma missão
muda Kw), volumes aditivos e equilíbrio imediato. Amostras do cotidiano e da
chuva são representativas (símbolo ≈). Não se simulam escape de CO₂, espuma,
precipitação, coagulação nem a velocidade das reações. As atividades sobre
antiácidos são didáticas e não são orientação de saúde.

O progresso fica guardado só no navegador deste aparelho. Não há contas nem
envio de dados.

Base: estrutura modular da família de simuladores (SIQC, SIMA, SIFI); motor
`a11y.js` compartilhado. Licença: GNU GPL v3 (arquivo `LICENSE`).
