# Proposta — reestruturação de interface e experiência (UI/UX)

Documento de planejamento do SIAB, escrito em 24/09/2026 a partir da versão 0.2.1.
Nada aqui está implementado. Complementa `proposta-conteudo-e-mecanicas.md`,
que descreve as mecânicas M1 a M15 citadas abaixo.

---

## 1. Diagnóstico da versão 0.2.1

### O que já funciona bem (manter)

- **Acessibilidade acima da média**: temas claro, escuro e alto contraste,
  fonte até 200 %, filtros de percepção de cor, diálogos próprios com teclado,
  cor descrita em texto e anúncios para leitor de tela.
- **Rigor do modelo**: limites declarados, símbolo ≈ nas estimativas, testes.
- **Mobile**: painel inferior de preparo e áreas de toque de 44 px.
- **Tubos vinculados**: "Comparar indicadores" é uma ótima ideia de interface.
- **Funciona sem internet e sem instalação.**

### Problemas encontrados

| # | Problema | Onde aparece | Efeito no aluno |
| --- | --- | --- | --- |
| P1 | "Começar" leva direto a uma bancada completa, sem objetivo | tela inicial | não sabe o que fazer; explora ao acaso |
| P2 | As atividades ficam escondidas no botão "Ideias para uma aula acessível", no fim do painel de preparo | painel direito | quase ninguém encontra |
| P3 | O preparo é um formulário com até 8 campos (substância, mol/L, diluição, volume, conta-gotas, gota…) | painel "Preparar tubo" | carga cognitiva alta; mol/L aparece antes de ser ensinado |
| P4 | Manipulação indireta: configurar → "Aplicar preparo" → gotejar; aplicar apaga as gotas | formulário | fluxo lento; medo de perder o trabalho |
| P5 | Uma gota por clique: a equivalência padrão exige 20 cliques; com gota de 0,01 mL, 100 | botão "Adicionar 1 gota" | cansativo; desestimula titular |
| P6 | Só dois níveis de representação: cor e número | tubo em foco | falta partícula, gráfico e equação (ver triângulo de Johnstone) |
| P7 | Sem progresso nem memória: recarregar apaga tudo | estado | aula dividida em dois dias recomeça do zero |
| P8 | Três colunas fixas no computador; o painel de preparo ocupa espaço mesmo sem uso | layout | o tubo, que é o protagonista, fica espremido |
| P9 | Não há modo para o professor (projetor, roteiro da aula) | — | o professor adapta tudo de improviso |
| P10 | `js/init/app.js` tem linhas muito longas, com várias instruções cada | código | difícil de ler e modificar para quem está aprendendo |

---

## 2. Princípios de design

Cada princípio tem fundamento e uma consequência prática.

| Princípio | Fundamento | Na prática |
| --- | --- | --- |
| **Objetivo claro em cada tela** | Simulações PhET: exploração com objetivo implícito (Wieman et al., 2008) | toda missão começa com uma pergunta |
| **Revelação progressiva** | Carga cognitiva (Sweller, 1988) | mol/L e volume de gota só aparecem no nível "Calcular" |
| **Manipulação direta** | Heurística de correspondência com o mundo real (Nielsen, 1994) | tocar no frasco para encher o tubo; segurar o conta-gotas para gotejar |
| **Representações ligadas** | Johnstone (1991); Mayer (2009) | tubo, partículas, gráfico e equação mudam juntos a cada gota |
| **Sinalizar o que mudou** | Princípio da sinalização (Mayer, 2009) | após cada gota: "pH 3,59 → 7,00 (+3,41)" |
| **Erro sem medo** | Controle e liberdade do usuário (Nielsen, 1994) | desfazer qualquer ação, não só a última gota |
| **Acessibilidade como requisito** | WCAG 2.2 | arrastar nunca é o único caminho (critério 2.5.7); cor sempre também em texto |

---

## 3. Nova arquitetura de informação

Hoje: `Início → Bancada` (tudo em uma tela).

Proposta: quatro caminhos a partir do início, com barra de navegação fixa.

```
Início
├── Aprender ........ Trilhas por nível → Missões guiadas (passos POE)
│   ├── Trilha 1  Cores e indicadores             (1ª série)
│   ├── Trilha 2  Ácidos, bases e sais            (1ª série)
│   ├── Trilha 3  Quantidades e titulação         (2ª série)
│   └── Trilha 4  Equilíbrio, hidrólise e tampão  (2ª série)
├── Desafios ........ Jogos curtos e rejogáveis
│   ├── Amostra misteriosa        (M2)
│   ├── Missão titulação          (M6)
│   ├── Super Trunfo              (M8)
│   └── Régua do pH               (M3)
├── Laboratório ..... Bancada livre (a atual, redesenhada)
└── Professor ....... Montar aula · Modo projetor · Roteiros impressos

Sempre disponíveis: Caderno · Acessibilidade · Sobre o modelo
```

### Trilhas e mecânicas

| Trilha | Missões (mecânicas) | O que o aluno controla |
| --- | --- | --- |
| 1 Cores e indicadores | M1 prever a cor · M2 simples · repolho roxo × cotidiano | amostra e indicador |
| 2 Ácidos, bases e sais | M13 duelo · M7 construtor · M8 cartas · M10 qualitativo | + conta-gotas |
| 3 Quantidades e titulação | M5 gráfico · M6 missão · M14 caderno | + mol/L, volume, gota |
| 4 Equilíbrio | M4 lupa · M9 tampão · M10 quantitativo · M3 escala log | + Ka, α, pOH |

A **mesma bancada** serve a todas as trilhas. O que muda é quantos controles
aparecem. Com isso o aluno aprende um único ambiente.

---

## 4. Telas (wireframes)

### 4.1 Início

```
┌───────────────────────────────────────────────────────────────┐
│  SIAB · A química das cores                 Acessibilidade  ? │
├───────────────────────────────────────────────────────────────┤
│              Uma gota, novas descobertas.                     │
│                                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐  │
│  │  APRENDER   │ │  DESAFIOS   │ │ LABORATÓRIO │ │PROFESSOR│  │
│  │ Missões     │ │ Jogos de    │ │ Bancada     │ │ Montar  │  │
│  │ guiadas     │ │ 5 minutos   │ │ livre       │ │ aula    │  │
│  │ ▓▓▓░░ 3/12  │ │ Recorde: 80 │ │             │ │         │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘  │
│                                                               │
│  Continuar de onde parei: Trilha 2 · "Forte ou concentrado?"  │
└───────────────────────────────────────────────────────────────┘
```

O progresso fica guardado no navegador (`localStorage`), sem conta e sem
envio de dados, como o SIAB já faz com as preferências.

### 4.2 Missão guiada (computador)

```
┌───────────────────────────────────────────────────────────────────────┐
│ ← Trilha 2   Forte ou concentrado?          Passo 2 de 4  ▓▓▓▓░░░░    │
├──────────────────────────────────────────┬────────────────────────────┤
│                                          │  PREVER                    │
│    Tubo A              Tubo B            │  Qual tubo tem o menor pH? │
│    HCl 0,001 mol/L     CH₃COOH 0,1 mol/L │                            │
│     ┌──┐                ┌──┐             │  ( ) Tubo A                │
│     │  │                │  │             │  ( ) Tubo B                │
│     │▒▒│                │▒▒│             │  ( ) Iguais                │
│     └──┘                └──┘             │                            │
│    cor nos dois: vermelho alaranjado     │  Por quê? ________________ │
│    pH: oculto           pH: oculto       │                            │
│                                          │        [ Confirmar ]       │
└──────────────────────────────────────────┴────────────────────────────┘
```

O cartão da missão, à direita, substitui o painel de preparo. Os controles que
a missão não usa não aparecem.

### 4.3 Laboratório livre redesenhado (computador)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ SIAB   Aprender  Desafios  [Laboratório]  Professor     Caderno  ♿  ?     │
├─────────────┬───────────────────────────────────────┬─────────────────────┤
│ PRATELEIRA  │  Tubo 2 · Limão diluído  ✎            │ VER:                │
│ [buscar…]   │                                       │ [Tubo][Partículas]  │
│             │        ┌──┐     pH ≈ 2,9  ÁCIDA       │ [Gráfico][Equação]  │
│ Frutas      │        │  │     0 ──●────────── 14    │ ┌─────────────────┐ │
│ ▢ Limão     │        │▒▒│     cor: rosa             │ │ pH              │ │
│ ▢ Laranja   │        │▒▒│     (repolho roxo)        │ │ 14┤      ····   │ │
│ Cozinha     │        └──┘                           │ │  7┤    ·        │ │
│ ▢ Vinagre   │   2,9 → 3,1  (+0,2)                   │ │  0┼·──────── mL │ │
│ Laboratório │                                       │ └─────────────────┘ │
│ ▢ HCl ▢ NaOH│  [Desfazer] [ Segure para gotejar ]   │                     │
│ INDICADORES │             [+1] [+5] [+1 mL]         │ Nível: Explorar ▾   │
│ ◉ Repolho   │  conta-gotas: Bicarbonato · 0,05 mL   │                     │
├─────────────┴───────────────────────────────────────┴─────────────────────┤
│ BANCADA  [T1 ▮] [T2 ▮•] [T3 ▮]  [+ tubo]  [Comparar indicadores]          │
└───────────────────────────────────────────────────────────────────────────┘
```

Mudanças em relação à 0.2.1:

- **Prateleira** no lugar do formulário: tocar em um frasco coloca a amostra no
  tubo (P3, P4). Um segundo toque, ou a opção "No conta-gotas", define o que
  será gotejado.
- **Tira de tubos** embaixo, com miniaturas, no lugar da coluna esquerda. O tubo
  em foco ganha espaço (P8).
- **Painel VER** com as quatro representações ligadas (P6).
- **Régua de pH** ao lado do número, com marcador que desliza.
- **Seletor de nível**: Explorar (amostra e indicador) → Medir (+ diluição e
  conta-gotas) → Calcular (+ mol/L, volume, gota, Ka). Isso resolve P3 sem
  retirar nada do que existe.

### 4.4 Celular

```
┌──────────────────────────┐
│ SIAB                ♿  ? │
├──────────────────────────┤
│ Missão 2/4  ▓▓▓▓░░░░     │
│ Tubo 2 · Vinagre      ✎  │
│   ┌──┐   pH ≈ 2,5        │
│   │▒▒│   ÁCIDA           │
│   │▒▒│   0 ─●──── 14     │
│   └──┘   cor: rosa       │
│ [Tubo][Partíc.][Gráfico] │
│                          │
│ [Desf.] [Segure: gotejar]│
├──────────────────────────┤
│ ▲ Prateleira             │  ← painel inferior (já existe no SIAB)
├──────────────────────────┤
│ Início Missão Lab Caderno│  ← barra de navegação inferior
└──────────────────────────┘
```

A regra de ouro do celular: **o tubo nunca sai da tela** enquanto o aluno goteja.

---

## 5. Componentes e microinterações

### 5.1 Conta-gotas dinâmico (resolve P5)

- **Segurar para gotejar**: enquanto o dedo ou o mouse estiver pressionado, cai
  uma gota a cada 250 ms.
- **Atalhos**: +1, +5 e +1 mL.
- **Teclado**: Enter adiciona 1 gota; manter Espaço pressionado goteja.
- Nas missões de titulação (M6), os atalhos +5 e +1 mL podem ficar desativados,
  para não esconder o salto de pH.

```js
// Segurar para gotejar: começa ao pressionar e para ao soltar ou sair do botão.
function gotejarSegurando(botao, adicionarGota, intervaloMs = 250) {
  let timer = null;
  const parar = () => { clearInterval(timer); timer = null; };
  botao.addEventListener('pointerdown', evento => {
    evento.preventDefault();
    adicionarGota();                                  // primeira gota imediata
    timer = setInterval(adicionarGota, intervaloMs);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(tipo => botao.addEventListener(tipo, parar));
}
```

### 5.2 Retorno imediato e sinalização

- Após cada gota: chip com a variação do pH (`3,59 → 7,00 (+3,41)`), visível
  por 2 s e anunciado pelo leitor de tela, que o SIAB já usa.
- A cor do líquido muda com transição suave (CSS `transition`), desligada em
  "Reduzir animações".
- Na viragem do indicador: a borda do tubo pulsa uma vez, e o texto diz
  "Viragem: amarelo → verde".
- Opcional, desligado por padrão: **vibração** na viragem (`navigator.vibrate`,
  não disponível no iPhone) e **sonificação** (tom que sobe com o pH, via Web
  Audio). A sonificação ajuda estudantes cegos a acompanhar a titulação.

### 5.3 Cartão de missão

Elemento único que mostra o passo atual: **Ler**, **Prever**, **Observar**,
**Agir** ou **Explicar**. Tem barra de progresso e botão "Voltar ao passo
anterior". As respostas vão para o caderno.

### 5.4 Desfazer amplo (resolve P4)

Hoje "Aplicar preparo" pede confirmação porque apaga as gotas. Proposta:
guardar uma **cópia do tubo** antes de cada ação e permitir desfazê-la pelo
botão Desfazer, que passa a desfazer a última ação, e não só a última gota.
A confirmação fica apenas para remover tubos.

```js
// Pilha de desfazer: guarda cópias do estado dos tubos antes de cada ação.
const pilha = [];
SIAB.registrar = () => pilha.push(structuredClone(SIAB.state.tubes));
SIAB.desfazer = () => { if (pilha.length) SIAB.state.tubes = pilha.pop(); SIAB.render(); };
```

---

## 6. Arquitetura de código para a interface dinâmica

A meta é permitir crescer sem perder o que o SIAB tem hoje: funciona sem
internet, sem instalação, e `build_standalone.py` gera um único HTML.

### 6.1 Pastas

```
js/
├── core/
│   ├── namespace.js
│   ├── estado.js          dados dos tubos (já existe)
│   ├── loja.js            NOVO: estado + avisar quem precisa redesenhar
│   ├── roteador.js        NOVO: troca de tela pelo endereço (#/inicio, #/lab…)
│   └── progresso.js       NOVO: missões concluídas, salvas no navegador
├── data/
│   ├── catalogo.js, cotidiano.js     (já existem)
│   ├── sais.js            NOVO (M10, M9)
│   ├── funcoes.js         NOVO: ácidos, bases, ânions e nomes (M7, M8)
│   ├── trilhas.js         NOVO: lista de trilhas
│   └── missoes.js         NOVO: missões descritas como dados
├── simulation/
│   ├── quimica.js         (já existe; + tipo 'salt', + α)
│   └── motor-missoes.js   NOVO: interpreta os passos das missões
├── ui/
│   ├── render.js, seletores.js       (já existem)
│   ├── prateleira.js, regua-ph.js, grafico.js, lupa.js, cartao-missao.js
└── telas/
    ├── inicio.js, trilhas.js, missao.js, laboratorio.js, professor.js
    └── desafios/detetive.js, titulacao.js, trunfo.js, regua.js
```

### 6.2 Roteador por endereço

A parte após `#` no endereço (`index.html#/missao/duelo-forca`) indica a tela.
Isso funciona abrindo o arquivo direto do computador, sem servidor. O botão
"voltar" do navegador também passa a funcionar.

```js
// Cada tela tem montar() e desmontar(). O roteador troca a tela conforme o #.
SIAB.telas = {};
function rotear() {
  const [nome, parametro] = location.hash.replace('#/', '').split('/');
  const tela = SIAB.telas[nome] || SIAB.telas.inicio;
  SIAB.telaAtual?.desmontar?.();
  SIAB.telaAtual = tela;
  tela.montar(document.getElementById('app'), parametro);
}
window.addEventListener('hashchange', rotear);
```

### 6.3 Loja de estado

Hoje cada ação precisa lembrar de chamar `SIAB.render()`. Com uma loja, quem
muda o estado avisa automaticamente as partes da tela interessadas. Isso evita
o erro de esquecer de redesenhar.

```js
// Loja mínima: guarda o estado e avisa os "assinantes" a cada mudança.
SIAB.loja = (() => {
  const assinantes = new Set();
  return {
    assinar: funcao => { assinantes.add(funcao); return () => assinantes.delete(funcao); },
    alterar: mudanca => { mudanca(SIAB.state); assinantes.forEach(funcao => funcao(SIAB.state)); }
  };
})();
// Uso: SIAB.loja.alterar(estado => SIAB.current().additions.push(0.05));
```

### 6.4 Missões como dados

A peça mais importante para quem está começando: **novas missões são escritas
como dados, sem programar lógica**. Um professor ou colega pode criar missões
editando só `js/data/missoes.js`.

```js
SIAB.missoes = [{
  id: 'duelo-forca',
  trilha: 2,
  titulo: 'Forte ou concentrado?',
  objetivo: 'Diferenciar força de concentração de um ácido.',
  nivel: 'medir',                        // controles visíveis na bancada
  tubos: [
    // NaOH 0,1 mol/L e gotas de 0,01 mL: A neutraliza com 1 gota; B, com 100.
    { name: 'Tubo A', solution: 'hcl',    concentration: 0.001, indicator: 'universal',
      titrant: 'naoh', titrantConcentration: 0.1, dropVolume: 0.01 },
    { name: 'Tubo B', solution: 'acetic', concentration: 0.1,   indicator: 'universal',
      titrant: 'naoh', titrantConcentration: 0.1, dropVolume: 0.01 }
  ],
  passos: [
    { tipo: 'prever',   pergunta: 'Qual tubo tem o menor pH?', opcoes: ['Tubo A', 'Tubo B', 'Iguais'] },
    { tipo: 'observar', revelar: ['pH'] },
    { tipo: 'agir',     instrucao: 'Neutralize o Tubo A com NaOH.',
                        concluido: ({ resultados }) => resultados[0].pH >= 7 },
    { tipo: 'explicar', pergunta: 'Por que o Tubo B precisaria de mais gotas?' }
  ]
}];
```

O motor (`simulation/motor-missoes.js`) só precisa saber tratar os cinco tipos
de passo: `ler`, `prever`, `observar`, `agir` e `explicar`.

### 6.5 Legibilidade do código (resolve P10)

Antes de reestruturar, reformatar `js/init/app.js` com uma instrução por linha
e comentários em português. Nada muda no funcionamento, e os testes em `tests/`
confirmam isso. É a tarefa ideal para começar a entender o projeto.

---

## 7. Roteiro de implementação

Cada fase termina com os testes passando e uma rodada curta de teste com
usuários.

| Fase | Entregas | Resolve | Química nova? |
| --- | --- | --- | --- |
| 0 · Base | reformatar `app.js`; roteador; tela inicial com 4 caminhos; progresso salvo | P1, P7, P10 | não |
| 1 · Bancada viva | conta-gotas dinâmico; prateleira; régua de pH; gráfico (M5); caderno e CSV (M14); desfazer amplo | P3, P4, P5, P6, P8 | não |
| 2 · Missões | motor de missões; cartão de missão; Trilhas 1 e 2 (M1, M13, M2, M8) | P2 | α (M13) |
| 3 · Sais e titulação | tipo `salt`; M10, M9, M6, M7; Trilha 3 | — | sim, com testes |
| 4 · Partículas | lupa (M4); régua log (M3); Trilha 4; modo professor e projetor | P9 | não |
| 5 · Cenários | M11, M12, M15 | — | sim, com notas de limitação |

**Por que essa ordem:** as fases 0 e 1 treinam a programação de interface sem
risco de errar a química. A química nova entra a partir da fase 3, sempre
acompanhada de teste comparado com valor de livro.

---

## 8. Como avaliar (base para relatório ou TCC)

| O que medir | Instrumento | Referência |
| --- | --- | --- |
| Usabilidade | Questionário SUS (10 perguntas; média de referência ≈ 68) | Brooke (1996) |
| Problemas de interface | Teste com 5 alunos pensando em voz alta | Nielsen (2000) |
| Aprendizagem | Teste diagnóstico de duas etapas (resposta + justificativa), antes e depois | Treagust (1988) |
| Uso real | Tempo até a primeira gota; % de missões concluídas; onde os alunos desistem | registros locais, sem envio de dados |

As concepções C1 a C9 de `proposta-conteudo-e-mecanicas.md` podem virar as
questões do teste diagnóstico. Assim a avaliação mede exatamente o que as
mecânicas pretendem ensinar.

---

## 9. Referências

- Brooke, J. (1996). SUS: a "quick and dirty" usability scale. Em P. W. Jordan
  et al. (org.), *Usability Evaluation in Industry* (p. 189–194). Taylor & Francis.
- Johnstone, A. H. (1991). Why is science difficult to learn? Things are seldom
  what they seem. *Journal of Computer Assisted Learning*, 7(2), 75–83.
- Mayer, R. E. (2009). *Multimedia Learning* (2ª ed.). Cambridge University Press.
- Nielsen, J. (1994). Enhancing the explanatory power of usability heuristics.
  *Proceedings of CHI '94*, 152–158.
- Nielsen, J. (2000). Why you only need to test with 5 users. Nielsen Norman
  Group. https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/
- Sweller, J. (1988). Cognitive load during problem solving: effects on
  learning. *Cognitive Science*, 12(2), 257–285.
- Treagust, D. F. (1988). Development and use of diagnostic tests to evaluate
  students' misconceptions in science. *International Journal of Science
  Education*, 10(2), 159–169.
- W3C (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*.
  https://www.w3.org/TR/WCAG22/
- Wieman, C. E., Adams, W. K. e Perkins, K. K. (2008). PhET: simulations that
  enhance learning. *Science*, 322(5902), 682–683.

Antes de citar em trabalho acadêmico, confira páginas e edições.
