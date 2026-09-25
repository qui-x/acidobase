# Validação da versão 0.5.0 — 25/09/2026

## Resumo

| Verificação | Resultado |
| --- | --- |
| Química (`quimica.test.cjs`) | 11 verificações contra OpenStax: aprovado |
| Amostras do cotidiano (`cotidiano.test.cjs`) | 15 amostras: aprovado |
| Sais, tampões, antiácidos, chuva, temperatura, espécies e funções (`sais-ambiente.test.cjs`) | 62 verificações: aprovado |
| Missões (`missoes.test.cjs`) | 14 missões e 88 passos percorridos: aprovado |
| Manual (`manual.test.cjs`) | 79 verificações de seções, links de ajuda, alvos e roteiros: aprovado |
| PWA (`pwa.test.cjs`) | 224 verificações de cache, arquivos, manifesto, ícones e versão: aprovado |
| Ponta a ponta no Chromium (`e2e.test.cjs`) | 104 de 104 testes: aprovado |
| Acessibilidade (axe-core 4, WCAG 2.2 A/AA) | nenhuma violação em 36 estados: bancada vazia e com tubo, menu ☰, painel de acessibilidade, prateleira no celular, trilhos, tour, caderno com tabela e abertura; temas escuro, claro e alto contraste; computador e celular |
| Abrir como arquivo (`file://`) e HTML único (`npm run build`) | funcionam, com a animação de abertura e sem erros no console |

## O que foi testado nesta versão (Chromium, Playwright)

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
