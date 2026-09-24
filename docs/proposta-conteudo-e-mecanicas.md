# Proposta — conteúdo de ácidos e bases e mecânicas digitais

Documento de planejamento do SIAB, escrito em 24/09/2026 a partir da versão 0.2.1.
Nada aqui está implementado. Os números citados foram calculados com o próprio
motor do SIAB (`js/simulation/quimica.js`) e conferidos com valores de livro.

A proposta de reestruturação da interface está em `proposta-ui-ux.md`.

---

## 1. Como ler este documento

Cada mecânica traz:

- **Conteúdo**: o que o aluno aprende.
- **Como funciona**: o que o aluno faz na tela.
- **Química por trás**: equação ou número que o programa calcula.
- **Concepção alternativa combatida**: o erro comum de estudantes que a mecânica
  ajuda a corrigir.
- **Onde encaixa no código**: arquivos do projeto que seriam alterados.
- **Dificuldade de programação**: ★ fácil, ★★ média, ★★★ avançada.

Para quem está começando: as mecânicas ★ usam quase só dados e interface. Elas
permitem aprender a estrutura do projeto antes de mexer no cálculo químico.

---

## 2. Fundamentação pedagógica

Estes cinco referenciais sustentam as escolhas. Eles servem para justificar o
projeto em um relatório, TCC ou artigo.

### 2.1 Os três níveis da química (triângulo de Johnstone)

Johnstone (1991) mostrou que a química é difícil porque exige pensar ao mesmo
tempo em três níveis:

| Nível | O que é | No SIAB hoje |
| --- | --- | --- |
| **Macroscópico** | o que se vê: cor, volume, efervescência | ✅ tubo colorido, volume |
| **Submicroscópico** | partículas: íons, moléculas, H₃O⁺ | ❌ ausente |
| **Simbólico** | fórmulas, equações, pH, gráficos | ⚠️ parcial: pH e fórmula, sem equação nem gráfico |

**Consequência:** a maior lacuna do SIAB é o nível das partículas. As mecânicas
M4 (lupa molecular) e M5 (gráfico) completam o triângulo.

### 2.2 Concepções alternativas sobre ácidos e bases

A pesquisa em ensino de química documenta erros comuns e persistentes (Nakhleh,
1992; Demircioğlu, Ayas e Demircioğlu, 2005; Sheppard, 2006). Os mais
frequentes, que um simulador pode confrontar diretamente:

| # | Concepção alternativa | O que a química diz | Mecânica |
| --- | --- | --- | --- |
| C1 | "Ácido forte é o mesmo que ácido concentrado" | Força é a fração que ioniza; concentração é a quantidade por litro | M13 |
| C2 | "Neutralização sempre dá pH 7" | Ácido fraco + base forte tem equivalência acima de 7 | M5, M6 |
| C3 | "Todo sal é neutro" | NH₄Cl é ácido; CH₃COONa e Na₂CO₃ são básicos | M10 |
| C4 | "Diluir bastante um ácido o torna básico" | O pH se aproxima de 7, mas não passa de 7 | já existe; reforçar em M3 |
| C5 | "A cor do indicador informa o pH exato" | O indicador informa uma faixa de pH | M2 |
| C6 | "A escala de pH é linear" | Cada unidade de pH corresponde a 10× em [H₃O⁺] | M3 |
| C7 | "HCl continua como molécula dentro da água" | Ácido forte está praticamente todo ionizado | M4 |
| C8 | "Tampão é uma substância que impede qualquer mudança" | Tampão resiste a mudanças, com capacidade limitada | M9 |
| C9 | "Ponto de viragem e ponto de equivalência são a mesma coisa" | Viragem depende do indicador; equivalência, da estequiometria | M6 (o SIAB já distingue no texto) |

### 2.3 Prever, observar, explicar (POE)

White e Gunstone (1992) propõem que o aluno **registre uma previsão antes** de
ver o resultado, e depois **explique a diferença**. A previsão explícita torna a
concepção alternativa visível e cria o conflito cognitivo. O SIAB já sugere
isso ("Oculte o pH… registre sua hipótese"), mas não guarda a previsão. A
mecânica M1 transforma a sugestão em interação.

### 2.4 Carga cognitiva e aprendizagem multimídia

Sweller (1988) e Mayer (2009) mostram que excesso de informação simultânea
prejudica a aprendizagem de iniciantes. Na prática:

- **Revelação progressiva**: mostrar concentração, volume de gota e Ka só
  quando o nível de conteúdo pede.
- **Contiguidade**: pôr a legenda e o número junto do que representam, e não
  em outro painel.
- **Sinalização**: destacar o que mudou após cada gota.

Esses princípios sustentam a reestruturação de interface do outro documento.

### 2.5 Simulações para ensino

As simulações PhET (Wieman, Adams e Perkins, 2008) indicam o que funciona:
exploração com objetivo implícito, retorno imediato, representações múltiplas
ligadas entre si e poucos controles na tela.

---

## 3. Mapa do conteúdo do ensino médio

A BNCC não fixa série para cada tema no ensino médio. A distribuição abaixo é a
mais comum nos livros didáticos e nos currículos estaduais.

| Tema | Série usual | Nível de Johnstone | No SIAB 0.2.1 | Potencial digital |
| --- | --- | --- | --- | --- |
| Indicadores e cor (repolho roxo, fenolftaleína) | 1ª | macro | ✅ completo | alto |
| Ácido, base e neutro no cotidiano | 1ª | macro | ✅ 15 amostras | alto |
| Teoria de Arrhenius: ionização e dissociação | 1ª | submicro | ❌ | **alto** (partículas) |
| Classificação de ácidos: hidrácido/oxiácido, nº de H ionizáveis, força | 1ª | simbólico | ❌ | alto (cartas) |
| Classificação de bases: solubilidade, força, nº de OH⁻ | 1ª | simbólico | ❌ | alto (cartas) |
| Nomenclatura de ácidos, bases e sais | 1ª | simbólico | ❌ | alto (jogo de regras) |
| Neutralização total e parcial, formação de sal | 1ª | simbólico | ⚠️ só o pH | **alto** (montar equação) |
| Óxidos ácidos e básicos; chuva ácida | 1ª | macro + simbólico | ❌ | médio (cenário) |
| Escala de pH (qualitativa) | 1ª | simbólico | ✅ número | alto (régua log) |
| Concentração em mol/L, diluição | 2ª | simbólico | ✅ | alto |
| Titulação e estequiometria (n = C·V) | 2ª | macro + simbólico | ✅ sem gráfico | **alto** (gráfico, desafio) |
| Kw, pH, pOH, pH + pOH = 14 | 2ª | simbólico | ⚠️ só pH | alto |
| Ka, Kb, grau de ionização (α), lei de Ostwald | 2ª | submicro + simbólico | ⚠️ calcula, não mostra | alto |
| Brønsted-Lowry, pares conjugados | 2ª | submicro | ❌ | médio (arrastar H⁺) |
| Hidrólise salina | 2ª | simbólico | ❌ | alto |
| Solução-tampão | 2ª | simbólico | ⚠️ café/leite como tampões simplificados | alto |
| Lewis | 2ª/3ª | submicro | ❌ | baixo (pouco cobrado no EM) |
| Temperatura e neutralidade (Kw varia) | aprofundamento | simbólico | ❌ (modelo a 25 °C) | médio |

### O que **não** convém substituir pelo digital

- Manusear material real, observar efervescência e sentir cheiro. O simulador
  prepara e complementa a aula prática; ele não substitui a experiência.
- Cores exatas de indicadores naturais. O extrato real varia; o SIAB já declara
  a carta como aproximada.
- Liberação de gás e precipitação, até que sejam modeladas. O SIAB já declara
  que trata o sistema de carbono como fechado.

### Habilidades da BNCC relacionadas

- **EM13CNT301**: construir questões, elaborar hipóteses e previsões, interpretar
  modelos e dados experimentais. É a base de M1, M2 e M6.
- **EM13CNT205**: interpretar resultados e fazer previsões com noções de
  probabilidade e incerteza, reconhecendo os limites explicativos das ciências.
  Corresponde às faixas dos indicadores (M2) e ao símbolo ≈ das amostras.
- **EM13CNT307**: analisar propriedades dos materiais para avaliar seu uso e
  propor soluções seguras. Corresponde a antiácidos (M11) e calagem (M12).
- **EM13CNT104**: avaliar benefícios e riscos de materiais e produtos à saúde e
  ao ambiente. Corresponde a produtos de limpeza e chuva ácida.
- **EM13CNT302**: comunicar resultados com gráficos, tabelas e equações, usando
  tecnologias digitais. Corresponde ao gráfico (M5) e ao caderno exportável (M14).

> Confira a redação oficial de cada código em
> basenacionalcomum.mec.gov.br antes de citar em trabalho acadêmico.

---

## 4. Mecânicas propostas

### Visão geral e prioridade

| Mecânica | Conteúdo principal | Dificuldade | Prioridade |
| --- | --- | --- | --- |
| M1 Prever antes da gota | todos | ★ | 1 |
| M13 Duelo: força × concentração | Arrhenius, α | ★ | 1 |
| M14 Caderno de laboratório | comunicação de dados | ★ | 1 |
| M2 Amostra misteriosa | indicadores e faixas | ★★ | 2 |
| M5 Gráfico de titulação ao vivo | titulação, pKa | ★★ | 2 |
| M6 Missão titulação | estequiometria, viragem | ★★ | 2 |
| M7 Construtor de neutralização | equações, sais, nomenclatura | ★★ | 2 |
| M8 Super Trunfo dos ácidos e bases | classificação | ★ | 2 |
| M3 Régua do pH | escala logarítmica | ★★ | 3 |
| M10 Todo sal é neutro? | hidrólise | ★★ | 3 |
| M9 Laboratório do tampão | tampão | ★★ | 3 |
| M4 Lupa molecular | ionização, Brønsted | ★★★ | 3 |
| M11 Estômago virtual | antiácidos | ★★★ | 4 |
| M12 Chuva ácida e calagem | óxidos, ambiente | ★★★ | 4 |
| M15 Neutro nem sempre é 7 | Kw e temperatura | ★★ | 5 (aprofundamento) |

---

### M1 — Prever antes da gota (POE) ★

**Conteúdo:** qualquer experimento da bancada.

**Como funciona:**
1. Com o pH oculto, o botão "Adicionar gota" pede antes uma previsão:
   *"Depois de 10 gotas, a solução ficará: ácida / neutra / básica"* ou
   *"Que cor você espera?"*.
2. O aluno adiciona as gotas e vê o resultado.
3. Aparece um campo curto: *"O que aconteceu foi o que você esperava? Por quê?"*.
4. Previsão, resultado e explicação vão para o caderno (M14).

**Química por trás:** nenhuma nova; usa `SIAB.chem.solve` e `SIAB.chem.color`.

**Concepção combatida:** todas. O objetivo é tornar visível o raciocínio do aluno.

**Onde encaixa:** `js/core/estado.js` guarda um vetor `previsoes` no tubo;
um novo diálogo em `index.html`; tratamento em `js/init/app.js`.

---

### M13 — Duelo: força × concentração ★

**Conteúdo:** diferença entre ácido forte e ácido concentrado; grau de ionização.

**Como funciona:** dois tubos lado a lado, com pergunta fixa:
*"Qual solução tem o menor pH?"*

| Tubo | Solução | pH calculado |
| --- | --- | --- |
| A | HCl 0,001 mol/L (ácido forte, diluído) | **3,00** |
| B | CH₃COOH 0,1 mol/L (ácido fraco, concentrado) | **2,88** |

A maioria dos alunos aposta no HCl, "porque é forte". Em seguida, a segunda
pergunta: *"Quanto NaOH 0,1 mol/L cada tubo (1 mL) precisa para chegar à
equivalência?"*

| Tubo | NaOH 0,1 mol/L até a equivalência | pH na equivalência |
| --- | --- | --- |
| A | 0,01 mL (1 gota de 0,01 mL) | 7,00 |
| B | 1,00 mL (100 gotas de 0,01 mL) | 8,72 |

O ácido acético precisa de **100 vezes mais** base, porque há 100 vezes mais
ácido, embora só uma pequena fração esteja ionizada. O volume final do tubo B
é 2 mL, dentro da capacidade de 5 mL do SIAB.

**Química por trás:** grau de ionização α = [A⁻] / C. Para o ácido acético:

| C (mol/L) | α | pH |
| --- | --- | --- |
| 0,1 | 1,3 % | 2,88 |
| 0,01 | 4,2 % | 3,38 |
| 0,001 | 12,5 % | 3,90 |

α aumenta com a diluição: é a lei da diluição de Ostwald, α ≈ √(Ka / C).

**Concepção combatida:** C1.

**Onde encaixa:** um "cenário pronto" (lista de tubos pré-configurados, como os
três tubos iniciais de `estado.js`) mais um pequeno cálculo de α:

```js
// Grau de ionização de um ácido fraco monoprótico no pH calculado.
// α = [A⁻] / C = Ka / (Ka + [H₃O⁺])
SIAB.chem.alpha = (ka, pH) => {
  const h = 10 ** -pH;
  return ka / (ka + h);
};
```

---

### M14 — Caderno de laboratório ★

**Conteúdo:** registro e comunicação científica.

**Como funciona:** cada tubo tem um caderno com preparo, gotas, pH e cor a cada
etapa, e as previsões da M1. Um botão **Baixar tabela (CSV)** gera um arquivo
que abre em planilha, para o aluno fazer o próprio gráfico.

**Química por trás:** nenhuma; o histórico já existe em `SIAB.renderHistory`.

**Onde encaixa:** `js/ui/render.js`, que já monta a tabela do histórico.

```js
// Converte o histórico em CSV com ponto e vírgula, padrão das planilhas em português.
SIAB.historyCSV = tube => {
  const linhas = ['gota;volume_adicionado_mL;pH;cor'];
  tube.additions.forEach((_, i) => {
    const parcial = { ...tube, additions: tube.additions.slice(0, i + 1) };
    const r = SIAB.chem.solve(parcial);
    const cor = SIAB.chem.color(tube.indicator, r.pH).name;
    linhas.push(`${i + 1};${SIAB.format(r.added)};${SIAB.format(r.pH)};${cor}`);
  });
  return linhas.join('\n');
};
```

---

### M2 — Amostra misteriosa: o detetive dos indicadores ★★

**Conteúdo:** faixas de viragem e combinação de indicadores.

**Como funciona:**
1. O programa sorteia uma solução e esconde o nome e o pH.
2. O aluno tem **3 testes**. Cada teste coloca uma gota de um indicador
   escolhido em uma porção da amostra e mostra a cor.
3. Cada cor corresponde a uma faixa de pH. O programa desenha as faixas em uma
   régua de 0 a 14, e o aluno vê a região possível diminuir.
4. No fim, o aluno informa o pH estimado. A pontuação depende da largura do
   intervalo final e do acerto.

**Exemplo:** amostra com pH 5,5.

| Teste | Indicador | Cor | Conclusão |
| --- | --- | --- | --- |
| 1 | Alaranjado de metila (3,1–4,4) | amarelo | pH > 4,4 |
| 2 | Azul de bromotimol (6,0–7,6) | amarelo | pH < 6,0 |
| — | Interseção | — | **4,4 < pH < 6,0** |

**Química por trás:** as faixas `low` e `high` já estão em
`js/data/catalogo.js`. A lógica é a interseção de intervalos:

```js
// Converte a cor observada em um intervalo possível de pH.
function faixaPorCor(indicador, nomeDaCor) {
  const ind = SIAB.indicators[indicador];
  if (nomeDaCor === ind.acidName) return [0, ind.low];
  if (nomeDaCor === ind.baseName) return [ind.high, 14];
  return [ind.low, ind.high];               // cor intermediária
}
// Junta as pistas: o pH está na interseção de todas as faixas.
function intersecao(faixas) {
  return faixas.reduce(([a, b], [c, d]) => [Math.max(a, c), Math.min(b, d)], [0, 14]);
}
```

**Concepção combatida:** C5.

**Acessibilidade:** a cor é sempre anunciada em texto, como o SIAB já faz. O
desafio é resolvido com o nome da cor, sem exigir percepção de cor.

---

### M5 — Gráfico de titulação ao vivo ★★

**Conteúdo:** curva de titulação, salto de pH, equivalência, meia-equivalência.

**Como funciona:** abaixo do tubo, um gráfico pH × volume adicionado recebe um
ponto a cada gota. Camadas opcionais:

- faixa colorida da viragem do indicador escolhido;
- linha vertical no volume de equivalência, só para reagentes puros, como o SIAB
  já faz;
- marca da **meia-equivalência**, onde pH = pKa para ácido fraco.

**Química por trás:** 1 mL de ácido 0,01 mol/L titulado com NaOH 0,01 mol/L,
gotas de 0,05 mL (equivalência em 1,00 mL):

| Gotas | 18 | 19 | **20** | 21 | 22 |
| --- | --- | --- | --- | --- | --- |
| HCl | 3,28 | 3,59 | **7,00** | 10,39 | 10,68 |
| CH₃COOH | 5,70 | 6,03 | **8,22** | 10,39 | 10,68 |

Comparar as duas curvas mostra que **a equivalência do ácido fraco fica em pH
8,22, e não em 7**. A causa é o íon acetato, que é uma base.

**Concepção combatida:** C2.

**Onde encaixa:** novo arquivo `js/ui/grafico.js`, que gera um SVG como
`SIAB.tubeSVG` já faz. Não precisa de biblioteca externa, e o projeto continua
funcionando sem internet.

---

### M6 — Missão titulação: acerte o ponto ★★

**Conteúdo:** estequiometria (n = C · V), escolha de indicador, erro de titulação.

**Como funciona:**
1. A missão informa: *"1 mL de ácido acético 0,01 mol/L. NaOH 0,01 mol/L."*
2. O aluno **calcula** o volume esperado e **escolhe** o indicador.
3. O aluno titula até a viragem e para.
4. A pontuação compara o volume da viragem com o volume de equivalência.

**Química por trás:** volume em que cada indicador muda de cor (meio da faixa),
com gotas de 0,05 mL:

| Titulação | Alaranjado de metila | Bromotimol | Fenolftaleína |
| --- | --- | --- | --- |
| HCl + NaOH | 1,00 mL ✅ | 1,00 mL ✅ | 1,05 mL ✅ |
| CH₃COOH + NaOH | **0,10 mL ❌** | 1,00 mL ✅ | 1,05 mL ✅ |

Com o alaranjado de metila, o aluno pararia na **2ª gota** da titulação do
ácido acético: um erro de 90 %. A missão mostra, por experiência, por que a
escolha do indicador depende do pH de equivalência.

**Variação:** gotas maiores (0,10 mL) escondem o erro; gotas menores revelam o
salto. Isso ajuda a discutir precisão de medida.

**Concepção combatida:** C2 e C9.

**Onde encaixa:** "motor de missões" orientado por dados (ver `proposta-ui-ux.md`,
seção 5).

---

### M7 — Construtor de neutralização ★★

**Conteúdo:** equação de neutralização, balanceamento, fórmula e nome do sal.

**Como funciona:** o aluno escolhe um ácido e uma base em cartas. O programa
monta a equação em etapas, pedindo ao aluno cada parte:

```
H₂SO₄ + 2 NaOH → Na₂SO₄ + 2 H₂O
ácido sulfúrico + hidróxido de sódio → sulfato de sódio + água
```

- **Neutralização total**: todos os H⁺ e OH⁻ reagem.
- **Neutralização parcial**: `H₂SO₄ + NaOH → NaHSO₄ + H₂O` forma
  hidrogenossulfato de sódio.

**Química por trás:** regra de nomenclatura dos ânions e mínimo múltiplo comum
das cargas.

| Terminação do ácido | Terminação do ânion | Exemplo |
| --- | --- | --- |
| -ídrico | -eto | clorídrico → cloreto |
| -ico | -ato | sulfúrico → sulfato |
| -oso | -ito | sulfuroso → sulfito |

```js
// Máximo divisor comum e mínimo múltiplo comum: base do balanceamento.
const mdc = (a, b) => (b === 0 ? a : mdc(b, a % b));
const mmc = (a, b) => (a * b) / mdc(a, b);

// Um ácido com h H⁺ ionizáveis e uma base com o OH⁻:
// o cátion tem carga +o e o ânion tem carga −h.
function neutralizacaoTotal(acido, base) {
  const m = mmc(acido.h, base.oh);
  return {
    acido: m / acido.h,       // coeficiente do ácido
    base: m / base.oh,        // coeficiente da base
    agua: m,                  // cada H⁺ + OH⁻ forma uma H₂O
    cation: m / base.oh,      // índices da fórmula do sal
    anion: m / acido.h
  };
}
// Exemplo: H₃PO₄ (h = 3) + Ca(OH)₂ (oh = 2) → 2 H₃PO₄ + 3 Ca(OH)₂ → Ca₃(PO₄)₂ + 6 H₂O
```

**Atenção científica:** H₃PO₃ tem **2** H ionizáveis, e H₃PO₂ tem **1**. Os
dados devem guardar o número de H **ionizáveis**, e não o total de H da
fórmula. Esse é um erro clássico de prova e uma boa carta de desafio.

**Onde encaixa:** novo `js/data/funcoes.js`, com ácidos, bases e ânions e seus
nomes, e nova tela do construtor.

---

### M8 — Super Trunfo dos ácidos e bases ★

**Conteúdo:** classificação das funções inorgânicas.

**Como funciona:** baralho no formato do Super Trunfo, jogo de cartas conhecido
no Brasil. Cada carta tem atributos para disputar:

| Atributo | Ácido (ex.: HNO₃) | Base (ex.: Ca(OH)₂) |
| --- | --- | --- |
| Força | forte (α ≈ 100 %) | forte, pouco solúvel |
| H⁺ ionizáveis / OH⁻ | 1 | 2 |
| Tipo | oxiácido | — |
| Volatilidade / solubilidade | volátil | pouco solúvel |
| Onde aparece | fertilizantes, explosivos | cal hidratada, construção |

Modos: **duelo** (o maior atributo vence), **classificar** (arrastar a carta para
a caixa certa) e **memória** (ligar fórmula e nome).

**Onde encaixa:** usa os mesmos dados de `js/data/funcoes.js` da M7.

---

### M3 — Régua do pH e a escala de 10 em 10 ★★

**Conteúdo:** escala logarítmica, [H₃O⁺], pOH.

**Como funciona:**
1. O aluno arrasta as amostras do cotidiano para a posição que imagina na
   régua de pH.
2. O programa revela as posições calculadas.
3. Ao tocar em duas amostras, aparece a comparação:
   *"O vinagre tem [H₃O⁺] 10^(6,6 − 2,5) ≈ 12 600 vezes maior que o leite."*
4. Camada opcional: quadrados que se multiplicam por 10 a cada unidade de pH,
   e régua dupla pH/pOH (pH + pOH = 14 a 25 °C).

**Concepção combatida:** C6 e C4.

**Onde encaixa:** nova tela que lê `SIAB.solutions` e `SIAB.chem.solve`.

---

### M10 — Todo sal é neutro? (hidrólise) ★★

**Conteúdo:** hidrólise salina, pares conjugados.

**Como funciona:** quatro tubos com sais a 0,1 mol/L e repolho roxo. O aluno prevê
a cor, observa e classifica cada sal pela origem (ácido forte ou fraco, base
forte ou fraca).

| Sal | Origem | pH calculado | Repolho roxo |
| --- | --- | --- | --- |
| NaCl | ácido forte + base forte | 7,00 | violeta azulado |
| NH₄Cl | ácido forte + base fraca | **5,13** | violeta |
| CH₃COONa | ácido fraco + base forte | **8,87** | verde azulado |
| Na₂CO₃ | ácido fraco + base forte | **11,65** | verde |

**Química por trás:** o motor atual já resolve isso. Basta descrever o sal pelo
que ele libera em água, como as amostras do cotidiano já fazem
(`systems` + carga fixa):

```js
// Novo arquivo js/data/sais.js, carregado depois de cotidiano.js (que define acidFamilies).
// Sais descritos por sistemas ácido-base e carga dos íons fixos.
// A carga de referência é a da espécie mais protonada de cada sistema.
SIAB.acidFamilies.ammonium = [14 + Math.log10(1.8e-5)];       // pKa do NH₄⁺ = 9,26
Object.assign(SIAB.solutions, {
  nh4cl:    { name: 'Cloreto de amônio', formula: 'NH₄Cl', kind: 'salt',
              systems: [{ family: 'ammonium', perUnit: 1 }], chargePerUnit: 0 },  // +1 NH₄⁺ −1 Cl⁻
  ch3coona: { name: 'Acetato de sódio', formula: 'CH₃COONa', kind: 'salt',
              systems: [{ family: 'acetate', perUnit: 1 }], chargePerUnit: 1 },   // +1 Na⁺
  na2co3:   { name: 'Carbonato de sódio', formula: 'Na₂CO₃', kind: 'salt',
              systems: [{ family: 'carbonate', perUnit: 1 }], chargePerUnit: 2 }  // +2 Na⁺
});
// Em js/simulation/quimica.js, dentro de solve(), junto aos outros tipos:
if (s.kind === 'salt') {
  positive += s.chargePerUnit * c;
  s.systems.forEach(x => polyAcids.push({ total: x.perUnit * c, pKa: SIAB.acidFamilies[x.family] }));
}
```

Os quatro valores da tabela foram obtidos com esse mesmo balanço de cargas. Eles
coincidem com os valores de livro: NH₄Cl 0,1 mol/L tem pH 5,13 e CH₃COONa
0,1 mol/L tem pH 8,87.

**Concepção combatida:** C3.

**Teste a acrescentar** em `tests/quimica.test.cjs`:
`near(chem.solve(tube({solution:'nh4cl', concentration:.1})).pH, 5.13, .01)`.

---

### M9 — Laboratório do tampão ★★

**Conteúdo:** solução-tampão, capacidade tamponante, Henderson-Hasselbalch.

**Como funciona:** dois tubos recebem as **mesmas gotas** de HCl, com o recurso de
tubos vinculados que já existe:

| Tubo | Início | Após 0,1 mL de HCl 0,01 mol/L |
| --- | --- | --- |
| Água pura (1 mL) | 7,00 | **3,04** |
| Tampão acético 0,01 / acetato 0,01 mol/L (1 mL) | 4,75 | **4,66** |

Depois o aluno continua gotejando até o tampão "quebrar", o que mostra que a
capacidade tem limite. Contexto: o sangue é tamponado e fica entre pH 7,35 e
7,45 (OpenStax, *Chemistry 2e*, 14.6).

**Química por trás:** pH = pKa + log([A⁻]/[HA]). No simulador, o cálculo continua
sendo feito pelo balanço de cargas completo; a fórmula aparece como explicação.

**Concepção combatida:** C8.

**Onde encaixa:** depende do tipo `salt` da M10. O tampão é uma mistura de
ácido acético e acetato de sódio, que pode entrar como "solução pronta".

**Cuidado:** o tampão do sangue (H₂CO₃/HCO₃⁻, 37 °C, CO₂ trocado com os
pulmões) é um sistema aberto. Se for simulado, precisa de uma nota de
limitação como as que o projeto já escreve em `docs/cotidiano.md`.

---

### M4 — Lupa molecular (nível submicroscópico) ★★★

**Conteúdo:** ionização (Arrhenius), H₃O⁺, ácido forte × fraco, Brønsted-Lowry.

**Como funciona:** um botão de lupa abre, ao lado do tubo, um quadro com
partículas que representam as espécies dissolvidas:

- HCl 0,01 mol/L: quase só H₃O⁺ e Cl⁻; nenhuma molécula de HCl.
- CH₃COOH 0,01 mol/L: cerca de 23 moléculas inteiras para cada 1 par
  H₃O⁺/CH₃COO⁻ (α = 4,2 %).
- A cada gota de NaOH, pares H₃O⁺ + OH⁻ viram 2 H₂O, com animação curta.

**Química por trás:** as frações de cada espécie saem do mesmo cálculo de
equilíbrio. Para o ácido monoprótico: fração de A⁻ = Ka / (Ka + [H₃O⁺]).

**Limite a declarar na tela:** há cerca de 55,5 mol/L de água e 0,01 mol/L de
ácido. Não é possível desenhar tudo na proporção real. A lupa mostra **apenas
as espécies do soluto** e informa isso em texto, como o projeto já faz para as
cores.

**Concepção combatida:** C7.

**Onde encaixa:** novo `js/ui/lupa.js` (SVG). Com "Reduzir animações" ativado,
as partículas ficam paradas.

---

### M11 — Estômago virtual: dose do antiácido ★★★

**Conteúdo:** neutralização aplicada, bases fracas e pouco solúveis.

**Como funciona:** o "estômago" começa com HCl 0,1 mol/L (pH 1,00). O aluno
escolhe bicarbonato de sódio (já existe no catálogo), hidróxido de magnésio ou
hidróxido de alumínio e dosa até o pH ficar entre 3 e 4. O objetivo não é
chegar a 7: o estômago precisa de meio ácido para a digestão.

**Química por trás:** Mg(OH)₂ e Al(OH)₃ são pouco solúveis e se dissolvem à
medida que o ácido os consome. Modelar isso exige produto de solubilidade (Kps).
Por isso a dificuldade é ★★★.

**Avisos obrigatórios na tela:** atividade didática, não orientação de saúde. O
CO₂ do bicarbonato não escapa no modelo (sistema fechado, limitação já declarada).

---

### M12 — Chuva ácida e calagem do solo ★★★

**Conteúdo:** óxidos ácidos e básicos, chuva ácida, correção de solo.

**Como funciona:** cenário com três etapas:

1. **Chuva natural:** CO₂ do ar dissolvido na água. O pH calculado com
   CO₂ a 420 ppm é **≈ 5,6**. Por isso se chama de chuva ácida a que fica
   abaixo desse valor.
2. **Poluição:** SO₂ + H₂O → H₂SO₃ e NO₂ reduzem o pH do lago.
3. **Correção:** calcário (CaCO₃) ou cal (CaO + H₂O → Ca(OH)₂) elevam o pH.
   Contexto brasileiro: a calagem dos solos ácidos do Cerrado.

**Química por trás:** a etapa 1 usa o sistema carbonato já cadastrado:
[CO₂] = KH × pCO₂ = 3,3 × 10⁻² × 4,2 × 10⁻⁴ ≈ 1,4 × 10⁻⁵ mol/L, que dá pH 5,65.

**Cuidado:** o solo tem troca iônica e alumínio, que um tubo de ensaio não
representa. O cenário do solo deve ser qualitativo e trazer uma nota de
limitação.

---

### M15 — Neutro nem sempre é 7 (aprofundamento) ★★

**Conteúdo:** Kw depende da temperatura; neutro significa [H₃O⁺] = [OH⁻].

**Como funciona:** um controle de temperatura muda Kw. A 25 °C a água pura tem
pH 7,00; aquecida, tem pH menor que 7 e **continua neutra**.

**Cuidado:** hoje todo o modelo é isotérmico a 25 °C. Implementar exige valores
de Kw por temperatura com fonte citada e revisão de todas as constantes (Ka
também varia). Deixar por último.

---

## 5. Checklist científico para cada nova mecânica

O SIAB já tem uma cultura rigorosa: modelo declarado, limites e testes. Para
manter o padrão, cada mecânica nova deve cumprir:

- [ ] **Modelo**: equação usada, escrita em `docs/`.
- [ ] **Constantes**: cada Ka, Kb e pKa com fonte e data de consulta.
- [ ] **Limites**: o que o modelo não representa, escrito na tela e no documento.
- [ ] **Teste numérico**: pelo menos um caso comparado com valor de livro em
      `tests/`.
- [ ] **Objetivo**: concepção alternativa ou habilidade que a mecânica trabalha.
- [ ] **Acessibilidade**: resolvível sem perceber cores, com teclado e com
      leitor de tela.
- [ ] **Segurança**: atividades práticas sugeridas têm aviso e supervisão.

---

## 6. Referências

- Johnstone, A. H. (1991). Why is science difficult to learn? Things are seldom
  what they seem. *Journal of Computer Assisted Learning*, 7(2), 75–83.
- Nakhleh, M. B. (1992). Why some students don't learn chemistry: chemical
  misconceptions. *Journal of Chemical Education*, 69(3), 191–196.
- Demircioğlu, G., Ayas, A. e Demircioğlu, H. (2005). Conceptual change achieved
  through a new teaching program on acids and bases. *Chemistry Education
  Research and Practice*, 6(1), 36–51.
- Sheppard, K. (2006). High school students' understanding of titrations and
  related acid-base phenomena. *Chemistry Education Research and Practice*,
  7(1), 32–45.
- White, R. e Gunstone, R. (1992). *Probing Understanding*. Londres: Falmer Press.
- Sweller, J. (1988). Cognitive load during problem solving: effects on
  learning. *Cognitive Science*, 12(2), 257–285.
- Mayer, R. E. (2009). *Multimedia Learning* (2ª ed.). Cambridge University Press.
- Wieman, C. E., Adams, W. K. e Perkins, K. K. (2008). PhET: simulations that
  enhance learning. *Science*, 322(5902), 682–683.
- OpenStax. *Chemistry 2e*, capítulo 14 (Ácidos e bases), seções 14.3 a 14.7.
  https://openstax.org/books/chemistry-2e/pages/14-introduction
- Brasil. Ministério da Educação. *Base Nacional Comum Curricular — Ensino
  Médio*. Ciências da Natureza e suas Tecnologias.
  http://basenacionalcomum.mec.gov.br/

Os valores numéricos deste documento foram calculados com o motor do SIAB
0.2.1 (balanço de cargas, 25 °C, soluções ideais). Antes de citar as
referências em trabalho acadêmico, confira páginas e edições.
