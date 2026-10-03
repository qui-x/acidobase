> Histórico de uma rodada anterior. Não descreve a entrega atual. Consulte [VALIDACAO.md](../../VALIDACAO.md) e [RC5.md](../RC5.md). Evidências antigas citadas podem não integrar este pacote.

# Workspace RC.3 — arquitetura e responsabilidades

## Estrutura

`js/ui/workspace.js` controla apresentação e foco. `css/workspace.css` controla a cena, as larguras e os breakpoints. O módulo não calcula pH nem define permissões. `js/ui/trilho.js` é somente um adaptador para chamadas já usadas pelo tour e pelos atalhos. O CSS antigo do trilho foi removido depois da busca de dependências.

| Componente | Responsabilidade |
|---|---|
| Workspace / workspace-stage | Cena central, tubo em foco, visão geral e faixa de recipientes |
| Dock / dock-left, dock-right | Estado de abertura, geometria, foco, inércia e apresentação |
| DockHeader / dock-header | Título contextual, ajuda, voltar, expandir/restaurar e fechar |
| DockTabs / dock-tabs, ver-tabs | Preparação ou família/ferramenta selecionada |
| DockPanel / dock-scroll | Uma região vertical rolável, com o conteúdo funcional original |
| BottomSheet / bottom-sheet | Mesma doca em viewport compacto, com diálogo acessível e fundo inerte |
| ContextActionBar / workspace-actions | Gotas, doses, agitar, medir, com ações perto da cena |

A faixa de ações foi retirada de dentro da região rolável do tubo e tornou-se uma região própria da bancada. Abrir e fechar uma doca atualiza classes, atributos e geometria; não chama `SIAB.render`, não reconstrói a vidraria e não altera medidas. Selecionar uma ferramenta chama apenas `renderVer` e a sincronização de apresentação. Instrumentos continuam usando as ações e os temporizadores originais.

## Estado e persistência

`left`: `collapsed`, `compact` ou `expanded`. Resumo mostra a montagem; Preparo, Objetos e Módulo filtram grupos autorizados. Atividades fixas entram em `compact`.

`right`: `collapsed` ou `open`. `activeFamily` e `activeTool` refletem a seleção autorizada. `level` representa `families`, `tools`, `tool` ou `data`; `source` distingue a entrada Ver/Dados. A preferência `siab_workspace_v1` guarda a apresentação do último contexto, separada de `tubes`, `history` e `rawMeasurements`.

Ao mudar de contexto, as preferências só são restauradas se o identificador de contexto for compatível. A ferramenta passa novamente por `verDisponivel`. Uma opção proibida não substitui o fallback autorizado da RC.2. O resumo e as abas não concedem permissões: `ActivityContext` continua responsável por todas as ações.

## DockPresentation

| Apresentação | Ferramentas | Comportamento |
|---|---|---|
| compact | pH, temperatura, condutividade | Largura entre 300 e 360 px, adaptada à tela |
| standard | partículas, espécies, equações, próton | Largura entre 330 e 420 px |
| wide | gráfico, derivada, distribuição, histórico, tabela | Cerca de 46% da tela, com limites de 440–760 px |
| fullscreen | expansão solicitada pelo usuário | Ocupa o workspace interno; Restaurar preserva conteúdo e contexto |

As larguras usam `clamp`. As docas flutuam sobre o workspace; insets temporários deslocam a cena útil para evitar cobrir recipientes e botões. Recolher remove esses insets. O modo wide fecha a montagem quando necessário. Não há sidebar reservada no estado inicial.

## Apresentação responsiva

- Compacta, até 900 px: barra Montagem/Ver/Dados, uma doca por vez, painel inferior com cabeçalho fixo e conteúdo rolável. Famílias, ferramentas e conteúdo se substituem. Uma família com várias ferramentas abre diretamente a lista; uma única função abre o conteúdo.
- Média, 901–1279 px: docas ancoradas e uma por vez. A navegação global permanece no menu; a cena tem prioridade.
- Expandida, a partir de 1280 px: duas docas pequenas podem coexistir. Análises amplas recolhem a outra doca para conservar o espaço útil.

O tamanho do painel inferior usa `visualViewport.height`, `offsetTop`, `100dvh` e `safe-area-inset`. Redimensionamento mantém o contexto; o campo focado volta à região visível. Não há gesto obrigatório nem blur pesado.

## Compartilhamento de conteúdo

`VER_SECTIONS` e `verRenderers` da RC.2 continuam sendo a única declaração de instrumentos, representações e análises. O mesmo `#ver-conteudo` aparece no desktop e no mobile. Montagem usa os controles existentes, apenas reorganizados por responsabilidade; Dados reaproveita o botão de relatório e os renderizadores de histórico/tabela. Não existem motores científicos ou painéis de instrumentos duplicados por plataforma.

Histórico permanece uma sequência de eventos. Tabela preserva Compacta/Completa, expansão de grupos e CSV bruto. Relatório usa sua tela própria e impressão própria. As regras de impressão ocultam docas, barras e controles.

## Acessibilidade e camadas

Controles de abertura têm `aria-controls` e `aria-expanded`. Docas recolhidas ficam inertes e fora da ordem de Tab. No desktop são regiões; no mobile são diálogos com `aria-modal`, fundo inerte e ciclo de foco. Fechar/Esc retorna ao acionador. Fullscreen interno mantém uma saída explícita e o foco dentro da leitura.

Os resultados novos são anunciados no `announcer`; a seleção é indicada por texto, borda e estado ARIA. Alto contraste, cores forçadas e `prefers-reduced-motion` foram verificados automaticamente. Isso não substitui a revisão com leitores de tela reais.

Camadas: cena 0, ações 10, docas 30, backdrop 60, sheet 70 e menu global 80. Dialogs de confirmação/ajuda usam a top layer do navegador. O tour agora aponta para a seção correspondente, abrindo apenas a doca necessária.

## Auditoria de redundância

| Informação | Local principal | Ajuste RC.3 |
|---|---|---|
| Atividade, restrição, Finalizar/Encerrar | Faixa da atividade | Permanece visível; altura medida para o workspace |
| Nome, solução, concentração e temperatura | Cabeçalho compacto do tubo | Temperatura retirada da leitura de volume |
| Volume atual e capacidade | Ao lado da vidraria | Volume inicial detalhado no resumo de montagem |
| Indicador e cor | Junto ao recipiente | Cards da visão geral têm identificação própria |
| Grupo e compartilhamento | Aviso do foco ou resumo da visão geral | Descrição longa eliminada de cada miniatura |
| Módulo | Barra da bancada; configuração em Montagem | Sem repetição em cards de resultado |
| pH medido | Cena ou instrumento aberto | Leitura central recolhida enquanto pH está aberto; fase não repete valor |
| Gráfico, partículas, histórico | Doca de investigação | Chips duplicados da barra central removidos |
| Relatório | Dados | Retirado da doca de preparação |
| Acesso ao Caderno | Navegação global | Duplicata do cabeçalho retirada durante a bancada |

## Evidência

`tests/workspace.test.cjs` exercita geometria, retorno de foco, famílias, fullscreen, conservação de objetos/dados, tabelas, grupos, 10 viewports, teclado virtual simulado, rotação, permissões, projetor e axe. `tests/results/preservacao-rc2.json` compara os arquivos maduros por hash. `tests/results/comparacao-rc2-rc3.json` registra as medidas da comparação controlada. Resultado consolidado em `VALIDACAO.md`.
