# SIAB — A química das cores · versão de teste 0.1

Extraia o ZIP inteiro e abra `siab/index.html` em um navegador.
O pacote contém apenas os arquivos do SIAB, com HTML, CSS, JavaScript e SVG
separados. Não exige instalação, internet ou servidor. A pasta `siab/` pode
ser hospedada em um diretório independente ou colocada na raiz do laboratório.

Nome: **SIAB — Simulador Interativo de Ácidos e Bases**.
Nome fantasia: **A química das cores**.

## Primeiro teste

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
Os ensaios numéricos podem ser repetidos com `node tests/quimica.test.cjs`.
O teste de interação DOM requer jsdom 26.1.0.

## Validação e próximos ajustes

Conferidos cálculos com casos de referência e fluxos de estado por eventos DOM.
A pré-visualização de arquivos locais foi bloqueada pelo navegador de teste.
Por isso, aparência renderizada, gestos nativos, teclado virtual e a rotação em
celulares físicos ainda precisam da rodada visual de teste com este pacote.
