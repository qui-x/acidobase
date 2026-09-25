# Validação da versão 0.3.1 — 25/09/2026

## Resumo

| Verificação | Resultado |
| --- | --- |
| Química (`quimica.test.cjs`) | 11 verificações contra OpenStax: aprovado |
| Amostras do cotidiano (`cotidiano.test.cjs`) | 15 amostras: aprovado |
| Sais, tampões, antiácidos, chuva, temperatura, espécies e funções (`sais-ambiente.test.cjs`) | 62 verificações: aprovado |
| Missões (`missoes.test.cjs`) | 14 missões e 88 passos percorridos: aprovado |
| PWA (`pwa.test.cjs`) | 200 verificações de cache, arquivos, manifesto, ícones e versão: aprovado |
| Ponta a ponta no Chromium (`e2e.test.cjs`) | 74 de 74 testes: aprovado |
| Instalabilidade (Chromium, `Page.getInstallabilityErrors`) | nenhum erro |
| Acessibilidade (axe-core 4, WCAG 2.2 A/AA) | nenhuma violação em 12 telas (tema escuro) e em 8 estados nos temas claro, alto contraste e no celular |
| Abrir como arquivo (`file://`) e HTML único (`npm run build`) | funcionam, sem erros no console |

## Química

Hidrólise salina a 0,1 mol/L comparada com √(Ka·C) e √(Kb·C): NH₄Cl 5,13;
CH₃COONa 8,87; Na₂CO₃ 11,65; NaCl 7,00. Tampão acetato com pH = pKa e
Henderson-Hasselbalch após adição de ácido (4,66). Mg(OH)₂ saturado com
[OH⁻] = 2·(Kps/4)^(1/3) (pH 10,42). Al(OH)₃ em excesso limita o pH perto de 4.
Chuva limpa com pH 5,65. Água pura neutra com pH = pKw/2 a 0, 25, 50 e 100 °C.
Balanços de massa e de carga das espécies da lupa. Grau de ionização do ácido
acético: 1,3 % (0,1 mol/L) e 4,2 % (0,01 mol/L). Coerência entre as faixas de
cor do detetive e a função de cor. Equações e nomes de sais: totais e parciais.

Esses testes verificam o modelo implementado. Não validam quantitativamente
alimentos, produtos comerciais ou o organismo humano.

## Interface (Chromium, Playwright)

- **Navegação:** menu, voltar do navegador, títulos, uma tela visível por vez e endereços inválidos tratados.
- **Laboratório:** segurar para gotejar e soltar para parar; Desfazer da
  sequência inteira; toque simples = 1 gota; Enter e Espaço; +5 e +1 mL; chip
  de variação do pH; prateleira no tubo e no conta-gotas; busca sem acentos;
  níveis; erro de validação no formulário; titulação até a equivalência (pH
  7,00, bromotimol verde); gráfico com um ponto por gota; lupa, equação e
  histórico; CSV; abas com setas; caderno; pH oculto; prever e gotejar;
  indicadores; renomear com caracteres especiais; tubos vinculados; remover com
  confirmação e desfazer; limite de 10 tubos; visão geral.
- **Missões:** as 14 missões concluídas pela interface. Também foram feitas
  ações reais sem demonstração: conta-gotas até a fenolftaleína ficar rosa,
  controle de temperatura a 60 °C (pH 6,51, neutra) e realce do indicador.
- **Desafios:** detetive (300/300), titulação (≥ 90), Super Trunfo nos três
  modos, régua do pH (≥ 90) e construtor (100/100 e treino parcial).
- **Professor e caderno:** link da aula, sequência, gabaritos, roteiro
  impresso, modo projetor salvo, CSV do caderno, apagar nota e apagar tudo.
- **Acessibilidade:** tema claro e fonte de 200 % mantidos depois de recarregar;
  som e vibração salvos; sem rolagem horizontal.
- **Celular (390 × 844):** barra inferior; nenhuma rolagem horizontal em 9
  telas; prateleira no painel inferior com foco no botão fechar e bancada
  inerte; toque = 1 gota; barra da missão abre o cartão.
- **PWA:** service worker ativo, 55 entradas no cache e manifesto válido. Todos
  os scripts e estilos são pedidos com `?v=` da versão. Uma versão nova do
  service worker assume sozinha, apaga o cache antigo e mostra "Recarregar".
  **Sem internet:** recarregar, gotejar, abrir missão e desafio.
- Nenhum erro no console nem diálogo nativo (alert, confirm, prompt) em todo o percurso.

## Problemas encontrados e corrigidos durante a validação

1. O roteador marcava o `<body>` com o atributo das telas e podia escondê-lo.
2. Na primeira visita, a ativação do service worker recarregava a página.
3. Tema e fonte voltavam ao padrão ao recarregar: o endereço guardava os
   parâmetros antigos, que têm prioridade no `a11y.js`. Defeito já existente
   na versão 0.2.
4. No celular, o painel inferior abria sem receber o foco, por causa da
   transição de visibilidade. Defeito já existente na versão 0.2.
5. Um toque rápido no conta-gotas podia gerar 2 gotas, e segurar por mais de
   1 s gerava uma gota a mais no fim.
6. O gabarito de uma previsão mudava depois das gotas. Agora fica fixo quando o
   estudante confirma.
7. O detetive dava 99 pontos para um palpite igual ao pH mostrado.
8. O Super Trunfo não permitia trocar de modo no meio da partida.

## Correção da versão 0.3.1: erro depois de atualizar

Relato: ao abrir a 0.3.0 onde antes estava a 0.2, apareciam
`Cannot set properties of undefined (setting 'ammonium')` em `sais.js` e
`Cannot set properties of null (setting 'innerHTML')` em `app.js`.

Causa, reproduzida no Chromium: o navegador recarregou o `index.html` novo,
mas continuou usando o `app.js` e o `cotidiano.js` da 0.2 guardados no cache.
Os endereços eram os mesmos, e o servidor não enviou nenhuma instrução de
cache. O `sais.js`, que é novo, veio do servidor e procurou uma estrutura que
só existe no `cotidiano.js` novo.

Correção:
1. Endereços com versão (`?v=0.3.1`).
2. O service worker baixa sem o cache do navegador (`cache: 'reload'`).
3. A versão nova assume sozinha e a página avisa "Recarregar".

Depois da correção, a mesma reprodução (abrir a 0.2, trocar os arquivos e
recarregar normalmente) carrega sem erros. O `pwa.test.cjs` confere se a
versão é igual nos três lugares, e o `e2e.test.cjs` testa a atualização do
service worker.

## Não verificado

Aparelhos físicos (iPhone e Android), leitores de tela reais (NVDA, TalkBack,
VoiceOver) e instalação na tela inicial de um celular. Recomenda-se uma rodada
com estudantes e o questionário SUS descrito em `docs/proposta-ui-ux.md`.
