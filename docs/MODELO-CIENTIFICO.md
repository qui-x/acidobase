# Modelo científico e origem das observações

## Estado central

`SIAB.chem.estado(tubo)` (também exposto como `solve`) resolve o equilíbrio e retorna pH, pOH, pKw, temperatura, volume, espécies, frações, pares conjugados, sólidos, indicador, cor e condutividade. A assinatura depende da composição, concentração, volumes, adições, temperatura e indicadores. Alterações invalidam o cache. As representações consomem esse estado, sem um segundo cálculo empírico de pH.

O modelo pressupõe solução aquosa ideal, atividades aproximadas por concentrações, volumes aditivos e equilíbrio instantâneo. A raiz do balanço de cargas é resolvida numericamente com os balanços de massa das famílias ácido-base. Não se usa média de pH para misturas. Diluição conserva mols; neutralização e hidrólise emergem do novo equilíbrio.

## Classes de composição

- **Solução mecanística:** espécies e equilíbrios declarados no catálogo.
- **Modelo aproximado de suspensão:** equilíbrio de solubilidade disponível e hipóteses simplificadas.
- **Amostra representativa:** composição parcial calibrada para comportamento didático; não representa a composição completa de alimento, produto comercial, fluido biológico ou amostra ambiental real.

Não é instrumento de laboratório, diagnóstico, prescrição, controle de qualidade ou procedimento de manuseio de substâncias.

## Temperatura

A tabela de pKw da água é interpolada linearmente entre 0 e 100 °C. A referência usada a 25 °C é 14,00. A neutralidade é **pH = pKw(T)/2**, e pOH = pKw(T) − pH. Água pura permanece neutra a temperaturas nas quais seu pH não é 7.

Ka, parâmetros de pares conjugados, pKIn, Kps e mobilidades iônicas permanecem nas referências do catálogo a 25 °C. Não se acrescentam dependências térmicas arbitrárias. Portanto variar a temperatura não constitui um modelo termodinâmico completo desses equilíbrios. Temperatura externa, ambiente da bancada e solução são condições distintas. Mistura usa ponderação por volume para a temperatura, sem entalpia de reação ou capacidade calorífica específica.

## Solubilidade e gás

Hidróxidos com Kps cadastrado podem apresentar sólido, redissolução em ácido e reprecipitação. Fontes do mesmo sólido compartilham a saturação, evitando contá-la duas vezes. Não existe banco universal de precipitação para qualquer combinação de sais. Ausência de precipitado na simulação não prova solubilidade real.

CO₂ usa representação de sistema fechado simplificado. Bolhas são ilustrativas; não há cinética, pressão, transferência de massa com atmosfera nem cálculo de vazão de gás.

## Indicadores e instrumentos

As cores de indicadores seguem parâmetros e transições do catálogo, com misturas ópticas aproximadas. A concentração do indicador e sua perturbação do equilíbrio não são modeladas quantitativamente.

A fita arredonda o pH para uma unidade e limita a carta a 0–14, identificando valores extremos. O pHmetro simulado tem resolução de 0,01, estabilização visual de 500 ms, calibração didática de dois pontos e não adiciona ruído aleatório. A leitura pontual fica anterior quando a assinatura do sistema muda; o contínuo agenda uma nova estabilização. Não se mede um recipiente vazio.

Os gráficos de medição usam leituras de pHmetro registradas. A derivada é a diferença entre pares de leituras em volumes diferentes. Espécies, equações e distribuição são resultados do modelo, identificados como tal, mesmo quando números internos são apresentados para estudo.

## Condutividade

Soma ideal das contribuições iônicas, com mobilidades limite de referência a 25 °C. Algumas mobilidades são estimadas e identificadas no detalhamento. O valor não recebe correção térmica genérica. A amostra pode omitir íons reais; em concentrações elevadas as aproximações ideais se tornam menos adequadas. Uma leitura registrada não se transforma em nova medida automaticamente.

## Escalas de representação

Partículas são uma amostragem gráfica; espécies pouco abundantes podem usar escala ampliada/logarítmica. Água como solvente não é desenhada molécula a molécula. Misturas de pigmentos, turbidez, bolhas e sólidos são representações qualitativas. H⁺ é notação simplificada para o próton solvatado; em transferência aquosa, H₃O⁺ é a representação pertinente.

O ácido fosfórico tem três dissociações e quatro frações de espécies. O catálogo marca dois saltos de equivalência resolvidos na titulação aquosa representada; a terceira dissociação não foi transformada artificialmente em um terceiro salto observável.

## Verificações e referências

A suíte científica inclui raízes analíticas de ácidos/bases, sais, tampão, equivalência e meia-equivalência, mistura, diluição, temperatura, produto de solubilidade, redissolução/reprecipitação, indicadores, condutividade e todas as 140 soluções. Resultados nos três motores são comparados numericamente. Isso verifica o modelo implementado, sem validar composição de amostras reais.

Referências do catálogo original, preservadas no aplicativo:

- [OpenStax Chemistry 2e — ácidos e bases](https://openstax.org/books/chemistry-2e/pages/14-introduction), apêndices H, I e J para constantes, e capítulo 15 para precipitação.
- [IAPWS — ionização da água](https://www.iapws.org/relguide/Ionization.html), referência para a dependência física com temperatura. O SIAB usa a tabela simplificada documentada, não uma implementação completa da formulação IAPWS.
- D. C. Harris, *Análise Química Quantitativa*; *CRC Handbook of Chemistry and Physics*, condutividades iônicas limite.
- Nelson e Cox, *Princípios de Bioquímica de Lehninger*; Baes e Mesmer, *The Hydrolysis of Cations*.
- Bandura e Lvov (2006), origem indicada no código para a tabela de pKw.
