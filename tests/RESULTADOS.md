# Validação da versão 0.5.5 — 25/09/2026

## Resumo

| Verificação | Resultado |
| --- | --- |
| Química (`quimica.test.cjs`) | 11 verificações contra OpenStax: aprovado |
| Amostras do cotidiano (`cotidiano.test.cjs`) | 15 amostras: aprovado |
| Sais, tampões, antiácidos, chuva, temperatura, espécies e funções (`sais-ambiente.test.cjs`) | 62 verificações: aprovado |
| Missões (`missoes.test.cjs`) | 14 missões e 88 passos percorridos: aprovado |
| Manual (`manual.test.cjs`) | 88 verificações de seções, links de ajuda, alvos e roteiros: aprovado |
| Mistura geral (`mistura.test.cjs`) | 18 verificações: HCl + NaOH = 7,00; diluição 2,30; tampão acetato 4,76; conservação; excesso de base 11,30; indicadores misturados: aprovado |
| PWA (`pwa.test.cjs`) | 232 verificações de cache, arquivos, manifesto, ícones e versão: aprovado |
| Ponta a ponta no Chromium (`e2e.test.cjs`) | 113 de 113 testes: aprovado |
| Acessibilidade (axe-core 4, WCAG 2.2 A/AA) | nenhuma violação em 36 estados da 0.5.0 (bancada vazia e com tubo, menu ☰, painel de acessibilidade, prateleira no celular, trilhos, tour, caderno com tabela e abertura) e em mais 26 da 0.5.1 (frasco secreto, arco-íris, despejo, mistura, erlenmeyer e cartões flutuantes) e 12 da 0.5.4 (menus Tubo e Conta-gotas abertos, busca, os três módulos abertos e ativos, no celular); temas escuro, claro e alto contraste; computador e celular |
| Abrir como arquivo (`file://`) e HTML único (`npm run build`) | funcionam, com a animação de abertura e sem erros no console |

## Novidades da 0.5.5 testadas

- **Cores dos módulos na estética do SIAB:** cada ícone de módulo leva um
  trecho do degradê da marca (Explorar: vermelho → rosa; Medir: rosa →
  fúcsia; Calcular: fúcsia → violeta), e lado a lado os três refazem o
  degradê do botão "Segure para gotejar". Os textos usam os tons pastel do
  mesmo trecho, como o lilás de destaque, e os selos e o botão ativo são
  contornados, como as etiquetas e os botões do resto do programa. Sem fundo
  tingido atrás do texto, o axe não acusa nada nos temas escuro e claro nem
  no alto contraste (onde tudo vira amarelo sobre preto).

## Novidades da 0.5.4 testadas

- **Menus Tubo e Conta-gotas:** fechados, mostram o frasco em uso e escondem
  a lista. Abrir um fecha o outro e leva a lista para baixo dele, com só o
  grupo do frasco em uso aberto. Escolher um frasco coloca no lugar certo,
  fecha o menu e devolve o foco ao cabeçalho; Esc também fecha. A busca abre
  os grupos com resultado, e fechar o menu limpa a busca. "Escolher um frasco"
  (bancada vazia) abre o menu Tubo com o foco na busca. No celular, o painel
  fecha depois da escolha, como antes.
- **Módulos:** começam recolhidos, com o selo "Ativo" no Explorar. Abrir um
  cartão não troca o módulo; "Ativar módulo" troca, marca o botão como
  pressionado e muda a barra para "MÓDULO · MEDIR". Um só cartão abre por vez.
  O manual ("Mostrar na bancada" em Ajustes de medida) ativa o Calcular.
- **Tamanho da prateleira:** com um tubo, o conteúdo caiu de 3.281 para
  1.208 px no computador (1360×900) e de 3.016 para 1.097 px no celular
  (390×844).
- **Cores dos módulos no tema claro:** o axe apontou contraste baixo do azul
  do Calcular sobre o fundo tingido; os três tons claros foram escurecidos
  até passar de 4,5:1 também nesse fundo.
- **Teste mais robusto:** o teste de "fonte 200 % sem rolagem horizontal"
  agora espera o quadro em que o cabeçalho se adapta, em vez de medir antes.

## Novidades da 0.5.3 testadas

- **Capacidade:** o tubo tem 5 mL e não oferece escolha. O erlenmeyer oferece
  25, 50, 125 (padrão) e 250 mL. Ao trocar, o volume inicial acompanha
  (1 → 25 → 50 mL) e as gotas recomeçam. As marcas passam a 50, 100, 150, 200
  e 250 mL, e "+5 mL" põe 100 gotas. "Desfazer" devolve a capacidade e a
  vidraria. No módulo Medir, o volume inicial vai até 80 % (40 mL no béquer
  de 50 mL). A mistura geral escolhe o menor béquer em que a mistura cabe.
- **Bancada organizada:** em 1280×720 e 1360×900 o botão de gotejar e os
  atalhos ficam acima da tira de tubos. No celular (390×844) a barra do
  conta-gotas fica presa embaixo mesmo rolando até o VER. O aviso de amostra
  representativa virou "≈ estimativa", que abre ao tocar, e os avisos (toasts)
  foram para o alto da tela.
- **Desempenho:** 10 × "+5 mL" (1.000 gotas num erlenmeyer de 250 mL) caiu de
  8 s para 0,76 s, porque as rajadas redesenham e tocam o som uma vez só, e o
  gráfico e o histórico passaram a ser lineares no número de gotas.

## Novidades da 0.5.2 testadas

- **Movimento das gotas na vidraria:** o conta-gotas aparece sobre a boca do
  recipiente enquanto se goteja e some depois. A gota cai e os efeitos somem
  sozinhos. O desenho é atualizado, não recriado, e o nível só muda quando a
  gota chega. No "+5 gotas" as gotas caem uma depois da outra, e com "Reduzir
  animações" nenhuma é desenhada. O axe não acusou nada durante o gotejamento.
- **Defeito corrigido:** até a 0.5.1 a gota animada era apagada pelo
  redesenho da tela logo depois de criada, e por isso quase não aparecia.

## Novidades da 0.5.1 testadas

- **Nome por extenso:** "Simulador Interativo de Ácidos e Bases" embaixo da
  sigla, em até duas linhas no celular, sem cortar.
- **Painéis recolhidos como no SIMA:** o ícone traz só a parte escolhida
  flutuando e a largura da bancada não muda. O cartão do VER fica aberto
  enquanto se goteja. O mesmo ícone, o ×, Esc (com o foco de volta no ícone)
  e um toque na bancada (prateleira) fecham. A escolha fica salva, e "fixar"
  volta ao painel inteiro.
- **Vidraria:** começa no tubo de ensaio e volta a ele ao recarregar. Béquer e
  erlenmeyer mudam o desenho e o nome padrão ("Béquer 1"), mas não o pH. As
  marcas do erlenmeyer se afastam para cima (cone). Nomes escolhidos pelo
  estudante não mudam.
- **Segredos:** 7 toques no logotipo e a busca "arco-íris" montam o Arco-íris
  do pH (indicador universal, pH crescente e 7 cores diferentes); 6 toques com
  pausa não bastam. A busca "misturar" despeja os tubos num béquer de 50 mL:
  com HCl e NaOH na mesma quantidade o pH é 7,00 e o bromotimol fica verde. Com
  um tubo só, o SIAB avisa. Dá para continuar gotejando, e "Desfazer" devolve
  os tubos. A nota "Descoberta" vai para o caderno.

## O que foi testado na 0.5.0 (Chromium, Playwright)

- **Bancada vazia:** abre sem tubos, com o aviso "Bancada vazia"; leitura,
  conta-gotas, indicador e ajustes ficam escondidos. O primeiro frasco cria o
  "Tubo 1". Remover o último tubo volta ao vazio, com o foco no aviso, e
  "Desfazer" traz o tubo de volta. "Mostrar na bancada" do manual destaca o
  aviso quando falta um tubo. No computador, o trilho mostra só Nível e Frascos.
- **Menu ☰:** abre como gaveta, com o foco dentro. Fecha com Esc, com ×, com
  toque fora ou ao escolher um destino, e o foco volta ao botão ☰. Os 10
  roteiros montam na bancada.
- **Modos:** o interruptor liga e desliga missões, desafios e professor (menu,
  abas e contagens 14 e 5). Desligar numa tela do modo completo leva à bancada.
  O link de uma aula liga o modo completo sozinho.
- **Acessibilidade:** os interruptores têm `role="switch"`. Tema claro,
  contraste, espaçamento, animações, leitura simples, daltonismo, fonte de 200 %,
  som e vibração ficam salvos ao recarregar; "Restaurar padrões" volta tudo.
  Com fonte de 200 % e espaçamento ligado não há rolagem horizontal. O tradutor
  de Libras avisa quando não consegue carregar.
- **Computador:** a prateleira e o VER recolhem em trilho (a bancada ganha mais
  de 500 px). A escolha fica salva, e um ícone reabre o painel na parte
  escolhida, com o foco nela.
- **Celular (390 × 844):** cabeçalho com ☰, prateleira e acessibilidade (até
  60 px de altura). O botão da prateleira só aparece na bancada. A prateleira
  fecha sozinha ao escolher o frasco e devolve o foco. A barra de chips fica
  presa abaixo do cabeçalho e leva ao VER na aba escolhida. Nenhuma rolagem
  horizontal em 9 telas.
- **Tour guiado:** 7 passos com tubo, ou 6 com a bancada vazia (com "Comece por
  aqui"). O contorno acompanha a parte explicada, sem o cartão cobri-la. Tem
  Voltar, Próximo, Pular e Esc; pelo menu, fora da bancada, vai para a bancada e
  começa.
- **Animação de abertura:** 5 tubos trocam de composto (HCl → H₂O → NaOH, e
  outros) e de cor. A cor de cada etapa é igual à do motor químico: NaOH com
  fenolftaleína fica rosa, com pH 12,0. Some sozinha em cerca de 3,5 s. Um toque
  ou uma tecla pulam, e o toque não atravessa para a bancada. Desligada no menu
  ou com "Reduzir animações", não aparece ao recarregar.
- **Caderno:** "Registrar no caderno" guarda a tabela de gotas como tabela
  (4 colunas, uma linha por gota, a partir da gota 0). O caderno mostra uma
  tabela com cabeçalho e "Baixar esta tabela (CSV)". O CSV do caderno tem as
  colunas gota, volume_adicionado_mL, pH e cor. Nota antiga com a tabela em
  texto é convertida ao abrir.
- **Continuam aprovados:** gotejar segurando, toque = 1 gota, teclado, +5 e
  +1 mL, desfazer, renomear, comparar indicadores, limite de 10 tubos, visão
  geral, 14 missões, 5 desafios, professor, manual, PWA sem internet e
  atualização do service worker.
- Nenhum erro no console nem diálogo nativo em todo o percurso. A única
  exceção é o aviso do navegador no teste que bloqueia o VLibras de propósito,
  que é esperado.

## Problemas encontrados e corrigidos nesta versão

1. **Tabela do caderno desconfigurada** (relatado pelo usuário): a tabela de
   gotas era salva como um texto só (`0;0,00;2,57;rosa | 1;0,05;…`) e aparecia
   assim na tela, na impressão e no CSV. Agora é guardada com colunas e linhas.
2. **Cabeçalho largo demais** com fonte de 200 % e espaçamento de letras no modo
   completo: 164 px de rolagem horizontal. O cabeçalho agora se adapta (só
   ícones; depois, abas numa segunda linha).
3. **Interruptores invisíveis no alto contraste:** trilho e bolinha eram brancos
   sobre branco.
4. Com o pH oculto, "Registrar no caderno" gravava o pH mesmo assim. Agora grava
   "oculto" e "—", como aparece na tela.

## Versões anteriores

- **0.4.0:** modo só bancada e manual digital integrado.
- **0.3.1:** erro ao atualizar (arquivos antigos no cache do navegador),
  corrigido com endereços com versão (`?v=`), `cache: 'reload'` no service
  worker e o aviso "Recarregar".
- **0.3.0:** missões, desafios, nova interface e PWA. Os problemas corrigidos
  naquela validação estão no histórico do git.

## Não verificado

Aparelhos físicos (iPhone e Android), leitores de tela reais (NVDA, TalkBack,
VoiceOver), instalação na tela inicial de um celular e o VLibras carregando de
verdade (o ambiente de teste não acessa vlibras.gov.br). Recomenda-se uma rodada
com estudantes e o questionário SUS descrito em `docs/proposta-ui-ux.md`.
