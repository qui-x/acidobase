# Registro de integração — SIAB

## 1.0.0-rc.5 — 03/10/2026

- Ciclo de atividade: Finalizar consolida/marca/abre relatório; Encerrar oferece relatório antes da saída, preserva registros e sempre retorna ao Início sem alterar a preferência de inicialização.
- Sessões têm identidade estável; reabrir link apresenta continuar/nova sessão ou relatório anterior/nova tentativa. Cancelamento preserva a tentativa existente; novas tentativas não sobrescrevem os relatórios anteriores.
- Caderno recebe práticas estruturadas por sessão, sem duplicatas, com Abrir dados/Abrir relatório. Sessão sem dados relevantes não gera prática vazia.
- Removidas a escolha digital/impresso do Professor e a exportação HTML do relatório na interface. Links antigos continuam aceitos; impressão/PDF permanece no navegador.
- Iconografia compartilhada revista: 22 identidades de área e nova família de setas, com inventário visual para aprovação. Manual, tour, menus, cabeçalhos e Sobre atualizados.
- Tratada também a falha do construtor VLibras; removidos seletores legados sem consumidores e escrita morta de última localização, preservando migrações/aliases.
- Acrescentados 25 cenários RC.5 e cinco de atualização/offline por motor. Reexecutadas as regressões, incluindo o contrato mobile da base. Ciência, catálogo, ActivityContext, marca e abertura preservados por comparação de arquivos.
- Standalone, cache e metadados atualizados; inventários, evidências, auditorias, matriz de 145 seções e hashes entregues. Mantida RC.5, sem promover estável ou criar RC.6 automaticamente.

## 1.0.0-rc.4.5 — 02/10/2026

- `quiet-btn` passa a ter superfície, borda, altura e estados próprios de botão; famílias primary, secondary, quiet e danger compartilham o contrato visual. Ações destrutivas, inclusive notas e seleção de recipientes, usam danger e confirmação.
- Área do Professor: IDs permanentes, editar, duplicar com novo ID e nome “Cópia de…”, cancelar edição e excluir com confirmação. Links de aluno são autocontidos: excluir ou editar o registro local não altera links já enviados.
- Montagens prontas abre o catálogo operacional; objetivos, instrumentos, visualização e recursos recomendados são apresentados. Comparar indicadores usa a montagem oficial. Arco-íris do pH integra o catálogo, sem anotação automática.
- Nova bancada permanece vazia; `newTube()` genérico usa água. HCl só entra por escolha, montagem, roteiro, atividade ou restauração explícita.
- Relatório em dez seções, com condições iniciais, reagente, tabela de leituras, representações produzidas, cálculos e condições finais automáticos. Histórico permanece em Dados → Histórico.
- Três modos: Relatório completo, Para preencher à mão e Atividade de análise. Impressão à mão preserva os dados científicos. O professor escolhe os dados incluídos e campos em branco; valores hipotéticos são explicitamente identificados e não alteram medições reais.
- Linhas por resposta: 5, 10 (padrão), 15, 20, 25 ou personalizado de 5 a 60, com ajuste opcional por campo e continuação entre páginas.
- Menu: Agora, Navegar, Recursos, Professor, Preferências e Aplicativo. Contexto de bancada/roteiro/Manual, projetor persistente e navegação recolhida no desktop. O menu restrito segue o ActivityContext.
- Biblioteca SVG única para navegação, cards, bottom nav, Manual e atalhos de docas. Removido o Caderno duplicado no cabeçalho; Sobre enxuto com referências no Manual.
- Temas usam “Marcar como revisado”. Missões mantêm ações, evidências e perguntas abertas, sem campos de quiz/gabarito mortos. Pergunta central só aparece em Explorar. Texto da bancada vazia e onboarding atualizados.
- Preservadas as dimensões mobile RC.4.1 e o núcleo químico, catálogo, ActivityContext e compactação. O registro de medições recebe apenas metadados de vidraria/incremento para o relatório.
- Standalone reconstruído; PWA, cache e versão atualizados. Mantida a classificação de candidata, sem promoção para 1.0.0.

## 1.0.0-rc.4.1 — 02/10/2026

- Auditoria complementar de todos os controles visíveis na bancada, painéis, navegação, Manual e formulários em 320×568, 360×800, 390×844 e 414×896.
- Barra de gotejamento em flex: Desfazer 44 px, Doses 76 px e botão de gotejar ocupando o espaço restante; três alturas iguais.
- Alvos mobile de ajuda no preparo, atalhos do Manual, links contextuais e marca no cabeçalho normalizados para ao menos 44 px, sem ampliar os desenhos de radio/checkbox dentro dos labels.
- Ajustado o espaço interno de Montagem na navegação inferior em 320 px para impedir recorte da legenda.
- Campo de busca do Manual absorve a redução de largura no Firefox; o botão Buscar conserva seu texto e padding.
- Suíte de controles ampliada para telas gerais e continuidade da proporção entre larguras; screenshots e matriz de dimensões atualizados.

## 1.0.0-rc.4 — 01/10/2026

- Manual reformulado em 13 categorias e 51 tópicos; conteúdo curto, passos, exemplos, diagramas e detalhes expansíveis.
- Busca local com acentos normalizados, plurais simples, palavras-chave, sinônimos e resultados com categoria e trecho.
- Home, navegação contextual, breadcrumbs, foco, Voltar/Avançar, índice móvel e links diretos por tópico.
- Fonte única para Manual e ajuda contextual; acesso ao tópico exato, sem links de saída no modo restrito.
- Montagens prontas e Roteiros separados; removido o redirecionamento incorreto entre suas páginas explicativas.
- Tour existente integrado; terminologia revisada para Montagem, Ver e Dados. Texto do módulo Medir corrigido para descrever o gráfico de leituras reais.
- Impressão de tópico ou guia rápido linear; Manual essencial offline na PWA e no standalone.
- Documentação derivada do registro, catálogo de páginas, termos indexados e nova suíte do Manual nos três motores.
- Normalização visual mobile: Desfazer 44 px, Doses 76 px, Gotejar flexível; Agitar e Medir pH com mesmas dimensões, borda, fonte e espaçamento interno.
- Controles mobile, chips, segmentados e ferramentas com alvos de toque >=44 px; ações de linha cheia >=48 px; comparação de irmãos nas quatro larguras em Chromium, Firefox e WebKit.
- Mantida a versão candidata; nenhuma promoção para 1.0.0.

## 1.0.0-rc.3 — 01/10/2026

- Workspace centrado no experimento; docas substituem as duas laterais permanentes.
- Montagem com estados recolhido, resumo e controles contextuais de preparo/objetos/módulo; montagem fixa informativa.
- Investigação compartilha os renderizadores da RC.2 entre doca desktop e painel inferior mobile; famílias e ferramentas seguem o ActivityContext.
- Apresentações compacta, padrão, ampla e fullscreen interno, com Expandir, Restaurar, Fechar e foco de retorno.
- Montagem, Ver e Dados na navegação inferior; níveis substituem conteúdo; família única e ferramenta única dispensam níveis redundantes.
- Ações experimentais em faixa própria, incluindo medição rápida autorizada; ajustes de visualViewport, safe areas, tablet, rotação e modo projetor.
- Cabeçalho e leituras mais concisos; atalhos duplicados removidos; descrição de grupos apresentada uma vez; indicação textual e contorno do tubo ativo.
- Ajuda contextual também no laboratório livre; anúncios de medidas; teclado, regiões inertes, contraste e movimento reduzido.
- Remoção do CSS antigo dos trilhos; adaptador mantém chamadas maduras do tour e dos atalhos.
- Ciência, catálogo, ActivityContext, instrumentos, compactação, relatório e Professor preservados por comparação dos arquivos com a RC.2.
- Suíte de workspace, capturas, comparação visual, atualização do cache/PWA, standalone e documentação. Permanece candidata RC.3.

## 1.0.0-rc.2 — 30/09/2026

- Menu inicial reorganizado e ícone oficial na tela com fundo desfocado, com adaptação para celular.
- ActivityContext único; guardas de bancada, recipientes, instrumentos, rotas, documentos e restauração a partir do link.
- Montagem informativa e menu contextual para o aluno; Manual geral sem exceção; Finalizar e Encerrar distintos.
- Validação pedagógica por capacidade, aceitando fita ou pHmetro quando a atividade exige pH.
- Painel exclusivo por família e função; `VER_SECTIONS`; fallback autorizado; histórico cronológico separado da tabela.
- Professor com três grupos de recursos, permissões explícitas, painel inicial e orientações em diálogo com impressão própria.
- Relatórios baseados no contexto e nas técnicas efetivamente registradas; gráficos separam contextos experimentais.
- `rawMeasurements` preservados; compactação contígua com tolerância por técnica, faixa, contagem, expansão e proteção de regiões críticas; CSV bruto.
- Contratos visuais dos botões, foco após atualização, tabelas acessíveis pelo teclado e correção da altura do cabeçalho ao redimensionar.
- `package-lock.json`, testes RC.2, evidências nos três motores e documentação atualizada. Continua candidata à homologação, sem promoção para 1.0.0.

## 1.0.0-rc.1 — 30/09/2026

Integração das revisões abaixo sobre o pacote 0.8.2 fornecido. Atualizados os arquivos modular e standalone, manifesto, cache, documentação e testes. Corrigidas falhas encontradas na migração das tabelas antigas, seleção da bancada, conservação de conteúdos vinculados, retorno da bancada livre, permissões de instrumentos, rótulos de seletores, impressão e CSV.

A versão **1.0.0 homologada não foi publicada**. Falta a matriz manual em dispositivos e navegadores comerciais reais, incluindo PWA instalada, teclado virtual e leitores de tela.

## Revisões das linhas históricas

| Linha lógica desta integração | Mudanças |
|---|---|
| 0.1.1 | Estado químico central, cache invalidado por composição e condições, classificação do modelo e saturação compartilhada de sólidos iguais |
| 0.3.2 | Migração idempotente, Caderno, inicialização, Temas, Missões, conclusão sem gamificação e Prever e gotejar |
| 0.5.1 | Montagens prontas, mistura oficial conservativa, descoberta do arco-íris e tour de cinco passos |
| 0.6.6 | VER em três grupos, fita/pHmetro/condutividade, temperatura, seleção e vínculo preservando conteúdo |
| 0.7.3 | Integração de navegação e contexto com os novos links de atividade; aliases de rotas antigas |
| 0.8.3 | Persistência integrada, responsividade, teclado/visualViewport, impressão, documentação e compatibilidade |

## Novas linhas previstas no prompt

| Linha | Implementação integrada |
|---|---|
| 0.9.0 | Roteiros Experimentais com narrativa, módulo único, ficha de identificação e cobertura de catálogo |
| 0.9.1 | Relatório da Experiência com resultados automáticos e textos do aluno |
| 0.9.2 | Relatório da Bancada livre e impressão preenchida/em branco |
| 0.9.3 | Área do Professor, configuração, orientações, referências do modelo, BNCC e projetor |
| 0.9.4 | Link opaco, validação de configuração, atividades recentes e duplicação |
| 0.9.5 | Guardas de rota, módulo e instrumentos, recarga, outra aba e encerramento |

## Auditoria do histórico recebido

A versão declarada em namespace, pacote e service worker era 0.8.2. Foram encontradas referências anteriores 0.3.1, 0.6.2, 0.6.5, 0.7.1, 0.7.2, 0.8.0 e 0.8.1. O pacote não continha histórico Git que permitisse comprovar todos os patches anteriores; as numerações acima refletem essa informação disponível, não uma cronologia completa de releases.

`0.5.6` identifica a biblioteca **dialog-polyfill**, não o SIAB. Ela foi excluída da contagem de patches. As revisões desta entrega são entradas de integração; não foram criadas tags ou publicações históricas fictícias. A auditoria estruturada está em `docs/versoes.json`.
