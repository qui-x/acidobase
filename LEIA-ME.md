# SIAB — Simulador Interativo de Ácidos e Bases · versão 0.5.7

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
cada arquivo é pedido com a versão no endereço (`app.js?v=0.5.7`), o que evita
essa mistura.

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
