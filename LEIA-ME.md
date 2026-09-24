# SIAB — A química das cores · versão de teste 0.2

Extraia o ZIP inteiro e abra `siab/index.html` em um navegador.
O pacote contém apenas os arquivos do SIAB, com HTML, CSS, JavaScript e SVG
separados. Não exige instalação, internet ou servidor. A pasta `siab/` pode
ser hospedada em um diretório independente ou colocada na raiz do laboratório.

Nome: **SIAB — Simulador Interativo de Ácidos e Bases**.
Nome fantasia: **A química das cores**.

## Novidades: cotidiano e caixas de diálogo

- 15 amostras novas: limão, laranja, abacaxi, maçã, morango, tomate, vinagre,
  café, leite, iogurte, refrigerante tipo cola, bicarbonato, sal, açúcar e sabão.
- Grupos no catálogo e seleção com busca por nome, inclusive sem acentos.
- Diluição própria para amostras; molaridade ajustável para reagentes puros.
- Extrato de repolho roxo, cores próprias dos alimentos e opção de realçar
  apenas a cor do indicador, sem alterar o cálculo do pH.
- Botão **Explorar o cotidiano** na tela inicial e ideias de atividades para aula.
- Diálogos de renomeação, confirmação, acessibilidade, informações, atividades
  e escolha com estilos próprios. Seletores e mensagens de validação seguem
  os temas do SIAB e aceitam navegação por teclado.

O pH e a resposta às gotas nas amostras do cotidiano são estimativas didáticas.
Uma fruta ou produto real pode apresentar resultados diferentes. Veja
`docs/cotidiano.md` para os parâmetros usados e suas limitações.

## Testar o cotidiano

1. Na tela inicial, toque em **Explorar o cotidiano**.
2. Observe limão diluído, água e bicarbonato com indicador de repolho roxo.
3. Em **Preparar**, toque no nome da solução e busque **café** ou **laranja**.
4. Escolha a diluição e aplique o preparo. Teste **Realçar indicador**.
5. Compare indicadores e navegue pelos tubos. As cópias conservam a diluição.
6. Abra **Ideias para uma aula acessível** para explorar atividades.

Nos menus: setas percorrem as opções, Home/End vão aos extremos, Enter ou
Espaço confirmam, Esc cancela e Tab percorre os controles. A busca permite
digitar nomes sem acentos. Há botão visível para fechar cada diálogo.

## Testar a titulação de laboratório

1. Toque em **Começar**. Há três tubos independentes com HCl, 0,01 mol/L, 1 mL.
2. No primeiro tubo, adicione 20 gotas de NaOH, 0,01 mol/L, com 0,05 mL por gota.
   O pH calculado chega a 7,00 e o bromotimol fica verde.
3. Renomeie o tubo. Vá ao próximo e volte: o preparo, o nome e as gotas permanecem.
4. Abra **Visão geral** e toque em uma miniatura para retomar a edição.
5. Em **Preparar**, use **Comparar indicadores**. Três cópias são criadas com
   indicadores diferentes e adições vinculadas. O tubo original é preservado.
6. Experimente o tema claro, a fonte ampliada e o pH oculto.

No celular, **Preparar** abre o painel inferior. Adicionar gotas fica na área
principal. A visão geral contém miniaturas e navegação; o preparo é feito na
edição individual. O limite é dez tubos. Renomeação: até quarenta caracteres.

As experiências são mantidas durante a página aberta; atualizar inicia outra
bancada. Preferências de acessibilidade são guardadas localmente quando o
navegador permite. Não há contas nem envio de dados.

## Base e escopo

- Estrutura modular da família de simuladores: `core`, `data`, `simulation`,
  `ui`, `a11y` e `init`.
- Identidade e componentes inspirados no SIQC; navegação mobile e painel
  inferior adaptados do SIMA; conceito de gestão de tubos do SIFI.
- Motor `a11y.js` reaproveitado do projeto fornecido, com chave própria para
  preferências, escala até 200% e proteção do favicon incorporado.
- A neutralização do SIQI original permanece intacta.
- O cálculo de pH, a bancada, o estado dos tubos e a renderização das soluções
  foram escritos para este simulador.
- Nesta versão o painel de acessibilidade inclui tema, fonte, movimento e
  filtros de simulação da percepção. VLibras não foi incorporado ao pacote offline.

Veja `docs/modelo-quimico.md` para condições e limites do modelo.
Os ensaios numéricos podem ser repetidos com `node tests/quimica.test.cjs` e
`node tests/cotidiano.test.cjs`. Os testes `interface.test.cjs` e
`dialogos-cotidiano.test.cjs`, na pasta `tests/`, requerem jsdom 26.1.0.

## Validação e próximos ajustes

Conferidos cálculos com casos de referência e fluxos de estado por eventos DOM.
A pré-visualização de arquivos locais foi bloqueada pelo navegador de teste.
Por isso, aparência renderizada, gestos nativos, teclado virtual e a rotação em
celulares físicos ainda precisam da rodada visual de teste com este pacote.
