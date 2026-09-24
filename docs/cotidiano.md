# Amostras do cotidiano — SIAB 0.2

O catálogo contém 15 amostras do cotidiano, além dos cinco reagentes/referências
da versão inicial. Podem ser usadas tanto no tubo quanto no conta-gotas.

## O que os números significam

Frutas, alimentos e sabão são misturas. Os valores abaixo são **amostras de
referência escolhidas para ensino**, não medições do alimento do aluno, de uma
marca nem de uma receita universal. A literatura fundamenta a ordem de grandeza
do pH e as famílias químicas; ela não valida as curvas de titulação do programa.

O pH inicial, sozinho, não determina a acidez titulável nem a capacidade tampão.
Por isso, o programa não transforma cada alimento em HCl com o mesmo pH, nem
calcula misturas pela média dos valores de pH. Resolve o equilíbrio de sistemas
representativos com quantidades totais conservadas, água e contraíons. As
concentrações CT da tabela são **parâmetros didáticos escolhidos**, não dados
analíticos extraídos das referências. Não devem ser usadas para dosar uma
neutralização real. Café, leite e sabão usam tampões efetivos simplificados.

| Amostra | pH de referência antes da diluição | Sistema representativo | CT adotada (mol/L) |
| --- | --- | --- | --- |
| Suco de limão | 2,3 | Citrato | 0,250 |
| Suco de laranja | 3,6 | Citrato | 0,040 |
| Suco de abacaxi | 3,5 | Citrato | 0,035 |
| Suco de maçã | 3,6 | Malato | 0,025 |
| Suco de morango | 3,4 | Citrato | 0,040 |
| Suco de tomate | 4,3 | Citrato | 0,020 |
| Vinagre branco | 2,5 | Acetato; referência próxima de 4% de acidez | 0,666 |
| Café coado | 5,0 | Tampão efetivo com pKa 4,8 | 0,010 |
| Leite | 6,6 | Tampão efetivo com pKa 6,8 | 0,020 |
| Iogurte natural | 4,4 | Lactato | 0,080 |
| Refrigerante tipo cola | 2,5 | Fosfato | 0,007 |
| Bicarbonato em água | Cerca de 8,3, calculado | Carbonato/bicarbonato + sódio | 0,11904 |
| Sal em água | 7,0, referência ideal | NaCl sem hidrólise | Não se aplica |
| Açúcar em água | 7,0, referência ideal | Sacarose sem dissociação ácido-base | Não se aplica |
| Sabão em água | 9,5 | Tampão efetivo com pKa 9,5 | 0,010 |

O pH do bicarbonato é calculado a partir do sistema diprótico e do sódio, sem
calibração por pH alvo. A referência equivale a aproximadamente 1 g de NaHCO₃
em 100 mL de solução. Sal e açúcar em água representam preparos ideais, sem
CO₂ atmosférico, aditivos ou impurezas. O sabão é um caso representativo de
formulação alcalina; não é uma propriedade de qualquer produto de limpeza.

## Equilíbrio e diluição

Para um sistema com n etapas, as proporções relativas são
`w₀ = 1` e `wᵢ = wᵢ₋₁ × 10^(pH − pKaᵢ)`.
A carga negativa média é `Σ(i × wᵢ) / Σ(wᵢ)`.

Nas amostras calibradas, a carga líquida dos íons fixos é escolhida para
satisfazer o balanço de cargas no pH alvo. Tanto essa carga quanto CT são
conservadas durante mistura e diluição. Um preparo de 1 parte de amostra e
9 de água divide ambas por dez; o volume inicial indicado já é o volume final
dessa preparação. Não se adiciona um segundo volume de água ao tubo.

Constantes a 25 °C, na aproximação ideal:

- Citrato: pKa 3,13; 4,76; 6,40.
- Malato: pKa 3,46; 5,10.
- Acetato: Ka 1,8 × 10⁻⁵.
- Lactato: pKa 3,86.
- Fosfato: pKa 2,15; 7,20; 12,35.
- Carbonato: Ka₁ 4,3 × 10⁻⁷ e Ka₂ 4,7 × 10⁻¹¹.

Nos resultados com amostras do cotidiano, a interface usa `≈` e uma casa
decimal. Não exibe ponto de equivalência para essas misturas. Os reagentes
puros mantêm os cálculos e a equivalência da versão anterior.

Não são modelados escape de CO₂, espuma, fermentação, precipitação, coagulação,
interações com proteínas, atividade iônica ou evolução temporal. Em especial,
a reação ácido–bicarbonato é calculada como um sistema de carbono fechado:
a curva não representa uma experiência aberta na qual o gás escapa.

## Cores e indicador natural

O extrato de repolho roxo acrescenta uma carta didática contínua: cores rosadas
em meio ácido, violeta/azul perto do neutro e verde/amarelo em meio básico.
Não existe uma carta universal exata para qualquer extrato. Quantidade,
preparo e envelhecimento do extrato afetam a experiência real. O modelo o
trata como traço e não calcula seu efeito sobre o pH.

As cores naturais de café, sucos e leite são ilustrações. A mistura de cores
RGB indica interferência visual, não absorção espectral. O programa não calcula
as reações dos pigmentos do próprio alimento com o pH. “Realçar indicador”
oculta essa contribuição visual, sem alterar o estado químico. Na ausência
de indicador, a cor própria continua aparecendo.

## Referências e origem dos exemplos

1. Clemson Extension, *pH Values of Common Foods and Ingredients*. Faixas
   de frutas, sucos, tomate e vinagre; variabilidade entre preparos.
   https://www.clemson.edu/extension/food/_files/ph-of-common-foods-table.pdf
2. USDA/ARS, *pH of Selected Foods*. Exemplos de leituras em alimentos e
   bebidas, incluindo sucos e leite reconstituído. Não é uma especificação
   universal de leite ou fruta.
   https://pmp.ars.usda.gov/phOfSelectedFoods.aspx
3. Rao e Fuller (2018), *Acidity and Antioxidant Activity of Cold Brew Coffee*.
   Exemplos de pH de café e distinção entre pH e acidez titulável.
   https://www.nature.com/articles/s41598-018-34392-w
4. Reddy et al. (2016), *The pH of beverages in the United States*.
   Exemplos de pH em bebidas comerciais, incluindo refrigerantes tipo cola.
   https://pubmed.ncbi.nlm.nih.gov/26653863/
5. *Impact of soy- and milk-based yogurts on enamel preservation: erosion and
   abrasion under simulated conditions*. Exemplo de iogurte lácteo com pH 4,4.
   https://pmc.ncbi.nlm.nih.gov/articles/PMC13236783/
6. ACS, *Red Cabbage Indicator*. Indicador natural e materiais domésticos
   adequados à atividade; fundamenta o guia breve da interface.
   https://www.acs.org/education/activities/red-cabbage-indicator.html
7. OpenStax, *Chemistry 2e*, 14.5, *Polyprotic Acids*. Equilíbrios em etapas,
   incluindo ácido carbônico e fosfórico.
   https://openstax.org/books/chemistry-2e/pages/14-5-polyprotic-acids
8. Sigma-Aldrich, fichas de ácido cítrico C0759 e ácido málico M1000: constantes.
   https://www.sigmaaldrich.com/BR/en/product/sial/c0759
   https://www.sigmaaldrich.com/BR/pt/product/sigma/m1000
9. PubChem, Lactic Acid, CID 612: constante de dissociação.
   https://pubchem.ncbi.nlm.nih.gov/compound/lactic_acid

Consulta: 24/09/2026. As escolhas numéricas e suas limitações estão expostas
acima para permitir revisão pedagógica, sem atribuí-las às medições das fontes.
