# Implementação — SIAB 1.0.0-rc.5

Base RC.4.5; organização modular preservada. Consulte [RC5.md](RC5.md) e a [cobertura das 145 seções](COBERTURA-RC5.md).

## Sessões e dados

`js/core/atividades.js` controla os estados de apresentação, bancada, relatório e finalização. Cada tentativa possui `sessionId`; `bench.reportId` usa essa identidade. Ao ler uma sessão antiga, o identificador existente do relatório/experiência é reaproveitado quando disponível. A chave legada `siab_atividade_<parte do token>` continua válida. `siab_atividade_ativa` em sessionStorage indica o contexto da aba; Encerrar a remove. A bancada livre usa `siab_bancada_v2` e é restaurada na saída.

A escolha de continuar/nova sessão é transitória, separada dos dados científicos. Reabrir o link solicita essa escolha; recarregar a bancada atual restaura a sessão. Iniciar outra tentativa requer confirmação. Antes de substituir a sessão ativa, os dados relevantes são consolidados e referenciados no Caderno.

`temDados()` considera intervenções, leituras instrumentais, respostas autorais e alterações do preparo. A cor inicial automática do indicador, isoladamente, não cria uma prática vazia. `consolidar()` interrompe temporizadores instrumentais, captura o relatório e persiste a sessão. Finalizar marca a etapa/timestamp e abre o relatório. Encerrar registra a prática quando pertinente, remove o contexto ativo e navega para Início sem escrever na preferência de inicialização.

As práticas são notas estruturadas com `tipo: pratica`, `sessaoId`, `relatorioId`, `estadoPratica`, atividade e data de atualização. A busca por sessão ou relatório faz atualização em vez de inserir duplicata. `js/telas/caderno.js` oferece Abrir dados/Abrir relatório; a consulta de dados usa uma captura salva e não altera a bancada livre. Relatórios antigos continuam separados das novas tentativas.

## Relatório e Professor

`js/telas/relatorios.js` conserva os dados automáticos e os campos do aluno, captura respostas da missão e abre relatórios arquivados por ID. Histórico cronológico e `rawMeasurements` permanecem separados da apresentação compactada. Os três modos, dez seções, linhas por resposta, cálculos e condições iniciais/finais vêm da base e foram revalidados.

O Professor não grava mais uma escolha digital/impresso nos novos links. A decodificação de links antigos continua aceitando o campo. A interface do relatório oferece impressão/PDF pelo navegador. A confirmação compartilhada aceita rótulo de cancelamento e uma terceira ação, mantendo foco inicial na opção segura.

## Contrato visual

`js/ui/icons.js` centraliza SVGs e aliases de funções equivalentes. Os consumidores incluem navegação, cabeçalhos de docas, Manual, seletores, tour e cards. Os SVGs decorativos são ocultos da árvore acessível; o controle conserva nome textual/ARIA. A família de setas usa o mesmo viewBox/stroke, com formas distintas conforme a direção/ação.

`css/mobile-controls.css` e `css/workspace.css` estão idênticos à RC.4.5. Os ajustes desta rodada reutilizam essas regras, incluindo 44/48/52 px. `quiet-btn` mantém superfície, borda e foco nos temas; Sobre usa a mesma família.

## Limpeza e compatibilidade

O inventário [SELETORES-REMOVIDOS-RC5.json](SELETORES-REMOVIDOS-RC5.json) registra seletores antigos de trilhas, aulas, jogos e gabaritos sem consumidores no HTML/JS. Foi retirada também a escrita morta de última localização. Migrações, leitura conservadora de dados antigos e aliases de rotas continuam presentes. Não foram apagados dados de usuários para simplificar o código.

Os 31 arquivos listados em [PRESERVACAO-RC5.json](PRESERVACAO-RC5.json) têm bytes idênticos à base: ciência/instrumentos, catálogos de conteúdo, ActivityContext, persistência, migrações, roteador, abertura, ativos oficiais e contratos mobile/workspace. O documento também lista os arquivos de fonte alterados.

## Build e testes

`npm run build` gera documentos do Manual, inventário de ícones e standalone. O Service Worker usa versão RC.5 e recursos locais. A auditoria de atualização compara o conteúdo cacheado com SHA-256 dos arquivos da distribuição. Detalhes em [OFFLINE-RC5.md](OFFLINE-RC5.md) e [DEPENDENCIAS-RC5.md](DEPENDENCIAS-RC5.md).

As suítes históricas são regressões atuais: seus nomes não indicam uso de resultados antigos. Esta execução resultou em 681 cenários de navegador e 55 verificações sem navegador aprovados. Resultados, datas e versões estão nos JSON. As verificações físicas não disponíveis são declaradas em [LIMITACOES.md](LIMITACOES.md).
