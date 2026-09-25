# SIAB — modelo químico da versão 0.3

Soluções aquosas ideais, volumes aditivos, mistura e equilíbrio imediatos.
Temperatura de 25 °C em todo o programa, exceto na missão "Neutro nem sempre
é 7", que altera apenas Kw (seção 6).

O código está em `js/simulation/quimica.js`. Os testes que comparam o motor
com valores independentes estão em `tests/quimica.test.cjs`,
`tests/cotidiano.test.cjs` e `tests/sais-ambiente.test.cjs`.

## 1. Como o pH é calculado

O pH é a raiz do **balanço de cargas** (eletroneutralidade). Para cada pH
testado, o programa soma as cargas positivas e subtrai as negativas; a busca
por bisseção (90 iterações entre pH −2 e 16) encontra o pH em que a soma é zero.

```
[H₃O⁺] + cátions fixos + Σ bases protonadas + Σ n·[Mⁿ⁺ dissolvido]
  = [OH⁻] + ânions fixos + Σ ácidos desprotonados + Σ cargas dos sistemas polipróticos
```

As concentrações analíticas já incluem a diluição causada pela mistura das
gotas. O pH não aumenta uma constante a cada gota.

## 2. Tipos de solução (`kind`)

| Tipo | Exemplos | Como entra no balanço |
| --- | --- | --- |
| `strongAcid` | HCl | ânion fixo: n·C |
| `strongBase` | NaOH; água de cal Ca(OH)₂ (n = 2) | cátion fixo: n·C |
| `weakAcid` | CH₃COOH (Ka = 1,8 × 10⁻⁵) | [A⁻] = C·Ka / (Ka + [H₃O⁺]) |
| `weakBase` | NH₃ (Kb = 1,8 × 10⁻⁵) | [BH⁺] = C·[H₃O⁺] / (Ka + [H₃O⁺]), com Ka = Kw/Kb |
| `salt` | NaCl, NH₄Cl, CH₃COONa, Na₂CO₃, tampões | sistemas ácido-base + carga fixa por fórmula |
| `suspension` | Mg(OH)₂, Al(OH)₃ | dissolve até o limite do Kps |
| `sample` | frutas, alimentos, chuva | sistemas representativos (ver `cotidiano.md`) |
| `water` | água pura | só a autoionização |

### Sistemas polipróticos e sais

Para um sistema com n etapas, os pesos relativos são `w₀ = 1` e
`wᵢ = wᵢ₋₁ × 10^(pH − pKaᵢ)`. A carga negativa média é `Σ(i · wᵢ) / Σ(wᵢ)`.

Um sal é descrito pelo que libera em água. A **carga de referência** é a da
espécie mais protonada de cada sistema. Exemplos:

| Sal | Sistema | Carga fixa por fórmula |
| --- | --- | --- |
| NaCl | nenhum | 0 (+1 do Na⁺, −1 do Cl⁻) |
| NH₄Cl | amônio (pKa 9,26) | 0 (+1 do NH₄⁺ de referência, −1 do Cl⁻) |
| CH₃COONa | acetato (pKa 4,74) | +1 (Na⁺) |
| Na₂CO₃ | carbonato (pKa 6,37 e 10,33) | +2 (2 Na⁺) |
| Tampão acetato | acetato, 2 por unidade | +1: ácido acético + acetato de sódio em quantidades iguais |
| Tampão fosfato | fosfato, 2 por unidade | +3: NaH₂PO₄ + Na₂HPO₄ em quantidades iguais |

### Bases pouco solúveis (antiácidos)

Para M(OH)ₙ, a quantidade dissolvida é `min(C, Kps / [OH⁻]ⁿ)`, e o cátion
contribui com n cargas. Enquanto há ácido, o sólido se dissolve; quando o meio
deixa de ser ácido, a dissolução para. O limite de pH depende do Kps:
Al(OH)₃ trava perto de pH 4, e o Mg(OH)₂ passa de 9.

Não são modelados: velocidade de dissolução, hidrólise do Al³⁺, complexos de
alumínio, forma cristalina do sólido e escape de CO₂.

## 3. Constantes (25 °C)

| Constante | Valor | Fonte |
| --- | --- | --- |
| Kw | 1,0 × 10⁻¹⁴ | OpenStax, *Chemistry 2e*, 14.1 |
| Ka do ácido acético | 1,8 × 10⁻⁵ | OpenStax, *Chemistry 2e*, Apêndice H |
| Kb da amônia | 1,8 × 10⁻⁵ (pKa do NH₄⁺ = 9,26) | OpenStax, *Chemistry 2e*, Apêndice I |
| Ka₁ e Ka₂ do ácido carbônico | 4,3 × 10⁻⁷ e 4,7 × 10⁻¹¹ | OpenStax, *Chemistry 2e*, 14.5 |
| Ka₂ do ácido sulfúrico (HSO₄⁻) | 1,2 × 10⁻² (1ª etapa tratada como forte) | OpenStax, *Chemistry 2e*, Apêndice H |
| Ácido fosfórico | pKa 2,15; 7,20; 12,35 | ver `cotidiano.md` |
| Kps do Mg(OH)₂ | 8,9 × 10⁻¹² | OpenStax, *Chemistry 2e*, Apêndice J |
| Kps do Al(OH)₃ | 2 × 10⁻³² | OpenStax, *Chemistry 2e*, Apêndice J |
| Constante de Henry do CO₂ | 3,3 × 10⁻² mol/(L·atm) | Sander (2015) |
| CO₂ atmosférico | ≈ 420 ppm | NOAA, média global recente |

## 4. Amostras ambientais

- **Chuva sem poluição:** CO₂ dissolvido, [CO₂] = 3,3 × 10⁻² × 4,2 × 10⁻⁴
  ≈ 1,4 × 10⁻⁵ mol/L, sistema carbonato fechado. pH calculado: 5,65.
- **Chuva ácida:** o mesmo CO₂ mais H₂SO₄ 2,5 × 10⁻⁵ mol/L (amostra
  representativa). pH calculado: 4,30. HNO₃ e H₂SO₃ não estão incluídos.
- **Água de cal:** Ca(OH)₂ dissolvido, base forte com 2 OH⁻ por fórmula,
  sempre abaixo da solubilidade (cerca de 0,02 mol/L). O calcário (CaCO₃), mais
  usado na calagem, não é modelado.

## 5. Equivalência e viragem

O volume de equivalência só é calculado quando o tubo e o conta-gotas são
um ácido e uma base de laboratório (fortes, fracos ou suspensões):

`V = C_tubo · n_tubo · V_tubo / (C_gotas · n_gotas)`, com n = H⁺ ou OH⁻ por fórmula.

A meia-equivalência (pH = pKa) aparece no gráfico quando o tubo contém ácido
ou base fraca. Equivalência (estequiometria) e viragem (indicador) são
conceitos distintos: a indicação de equivalência só aparece se uma gota
atingir exatamente esse volume.

## 6. Temperatura (só na missão "Neutro nem sempre é 7")

pKw da água líquida (Bandura e Lvov, 2006), interpolado linearmente:

| °C | 0 | 10 | 20 | 25 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| pKw | 14,95 | 14,53 | 14,17 | 14,00 | 13,83 | 13,54 | 13,26 | 13,02 | 12,80 | 12,60 | 12,42 | 12,25 |

O pH neutro é pKw/2, e a classificação ácida/neutra/básica usa esse valor. Os
Ka, os Kps e as faixas dos indicadores **não** são corrigidos pela temperatura;
por isso a missão usa só água pura, HCl e NaOH, cujos valores dependem apenas de Kw.

## 7. Lupa molecular (espécies)

A lupa usa as mesmas frações do equilíbrio. Para cada espécie dissolvida, o
número de partículas é proporcional à concentração, com 36 partículas para a
mais abundante. Espécies abaixo de meia partícula aparecem como "traço" na
legenda. A água não é desenhada: há cerca de 55,5 mol/L dela. O grau de
ionização de um ácido fraco monoprótico é α = Ka / (Ka + [H₃O⁺]).

## 8. Indicadores

Os indicadores são traços, sem efeito sobre pH ou volume. As cores são
interpoladas de forma suave nas faixas declaradas, sem pretensão de reproduzir
espectros. Tornassol: faixa aproximada de 4,5 a 8,3. Indicador universal e
repolho roxo: cartas representativas, que dependem da formulação. A
fenolftaleína não desbota em meio fortemente alcalino neste modelo.

No desafio "Amostra misteriosa", a faixa de pH de cada cor é calculada
varrendo a própria função de cor (de 0,01 em 0,01). Assim a pista é sempre
coerente com a cor desenhada.

## 9. Interface

Reagentes: 0,0001 a 0,1 mol/L; volume inicial de 0,1 a 4 mL; gotas de
0,01, 0,02, 0,05 ou 0,10 mL; capacidade de 5 mL por tubo; até 10 tubos.

## Referências

- OpenStax. *Chemistry 2e*. Cap. 14 (ácidos e bases) e Apêndices H, I e J.
  https://openstax.org/books/chemistry-2e/pages/14-introduction
- OpenStax, *Chemistry 2e*, Apêndice J — Solubility Products.
  https://openstax.org/books/chemistry-2e/pages/j-solubility-products
- Bandura, A. V. e Lvov, S. N. (2006). The ionization constant of water over
  wide ranges of temperature and density. *Journal of Physical and Chemical
  Reference Data*, 35(1), 15–30.
- Sander, R. (2015). Compilation of Henry's law constants (version 4.0) for
  water as solvent. *Atmospheric Chemistry and Physics*, 15, 4399–4981.
- IUPAC Gold Book, *equivalence point*. https://goldbook.iupac.org/terms/view/09042

Consultadas em setembro de 2026. As escolhas numéricas das amostras do
cotidiano estão em `cotidiano.md`. Confira páginas e edições antes de citar
em trabalho acadêmico.
