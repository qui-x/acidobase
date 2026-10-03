> Histórico de uma rodada anterior. Não descreve a entrega atual. Consulte [VALIDACAO.md](../../VALIDACAO.md) e [RC5.md](../RC5.md). Evidências antigas citadas podem não integrar este pacote.

# Bugs corrigidos e ajustes por versão

## RC.4.1 — conclusão da normalização mobile

| Problema ainda presente na RC.4 | Correção | Evidência |
|---|---|---|
| Auditoria limitada sobretudo à bancada/docas deixava links de ajuda e navegação de 15–43,375 px | Alvos de 44 px para marca, atalhos e links contextuais do Manual e preparo; o desenho interno de radio/checkbox continua menor dentro de um label de 44 px | `auditoria-rc41.json`; 37 cenários por motor em `mobile-controls.json` |
| Montagem podia recortar alguns pixels do conteúdo em 320 px | Menor gap e padding interno nesse botão até 370 px | Capturas `mobile-320-antes-rc4.png` e `mobile-320-bancada.png` |
| Firefox reduzia a largura do botão Buscar e apertava seu texto no Manual mobile | Botão mantém a largura natural; campo de entrada adapta sua largura | `mobile-controls.json`: telas do Manual nos três motores |
| Barra proporcional era expressa por colunas de grid, sem `flex: 1` explícito para Gotejar | Faixa flex com extremidades fixas em 44 e 76 px, centro flexível, mesma altura e espaço de 6 px | Medidas em `docs/MOBILE-RC41.md`; screenshots das quatro larguras |

## RC.4 — Manual e controles mobile

| Problema | Correção | Evidência |
|---|---|---|
| Manual longo e destoante, com todos os tópicos ao mesmo tempo | Home por categorias, tópico sob demanda, busca, detalhes e diagramas usando a identidade SIAB | `manual.json`; capturas `rc4-manual-*.png` |
| Busca e ajuda da atividade sem fonte editorial comum | Registro único com títulos, sinônimos, aliases, links e ajuda contextual | `manual.json`; docs gerados |
| Roteiros redirecionava para Montagens na rota antiga | Rotas explicativas distintas, cada uma levando à operação correta | `manual.json`: rotas e aliases |
| Texto de Medir dizia que o gráfico previa equivalência automaticamente | Descrição coerente com as leituras realizadas | Inspeção editorial e `manual.json` |
| Impressão do tópico podia criar folha quase vazia só com “Veja também” | Omitida navegação entre tópicos na mídia de impressão; detalhes permanecem | PDF `rc4-manual-phmetro.pdf` e guia rápido |
| Doses ocupava 58 px enquanto Gotejar crescia; Agitar tinha margem e radius diferente de Medir pH | Doses 76 px, Gotejar flexível e ações contextuais iguais | `mobile-controls.json`; capturas nas quatro larguras |
| Chips, fontes, opções e análises ficavam abaixo de 44 px no mobile | Contrato mínimo de 44 px; ação em linha cheia 48 px; cards de família 52 px | `mobile-controls.json`; capturas Montagem/Medir/Dados |

O contrato visual final altera apenas apresentação. Os 19 arquivos críticos de ciência, permissões, persistência e relatórios listados em `preservacao-rc3.json` permanecem idênticos à RC.3 entregue.

## RC.3 — workspace e apresentação

| Problema | Correção | Evidência |
|---|---|---|
| Laterais permanentes comprimiam a cena | Docas contextuais, insets somente enquanto abertas | Comparação visual e `workspace.json` |
| Trilho reunia todas as análises ao mesmo tempo | Famílias e uma ferramenta ativa; navegação por níveis no mobile | Famílias, função única, lista de família única |
| Relatório misturado à preparação e chips repetidos | Montagem, Ver e Dados com responsabilidades próprias | Capturas desktop/mobile |
| Instrumentos e doses competiam com a rolagem do tubo | Faixa de ações independente e medição rápida autorizada | 10 viewports e toque |
| Regra `align-self:start` antiga aumentava a doca no tablet | Alinhamento e altura da doca explicitamente definidos | 1024×768 nos três motores |
| Abertura de uma família única com várias ferramentas poderia exibir nível vazio | Lista direta e retorno ao nível válido | Caso específico mobile nos três motores |
| Conteúdo oculto poderia manter foco/tabulação | Inércia, regiões/modal, fechamento e retorno ao acionador | Teclado e axe |
| Tour apontava para controles movidos | Abertura da seção pertinente e acionadores novos | Tour de cinco passos |

Os ensaios iniciais detectaram as falhas acima; os JSON entregues são da execução final corrigida. As evidências de desenvolvimento com falhas foram retiradas do pacote final.


| Problema | Correção | Regressão/evidência |
|---|---|---|
| Aluno podia acessar preparo e trocar a montagem prevista | Guardas explícitas e aplicação das condições autorizadas no estado | RC.2: solução, reagente, vidro, volume, concentração e recipiente |
| Manual e rotas externas quebravam o contexto restrito | Guarda única de navegação; ajuda contextual em diálogo | RC.2: desvio por dez rotas e comandos de montagem/missão |
| Estado local podia restaurar condições incompatíveis | Decodificação do link como autoridade e sanitização da bancada | RC.2: armazenamento incompatível, refresh e nova aba |
| Recarregar voltava ao resumo em vez da bancada | Restauração da rota e do contexto experimental | RC.2: gota e leitura preservadas após refresh |
| Recursos de famílias diferentes apareciam juntos | Declaração VER_SECTIONS, submenus exclusivos e função ativa única | RC.2: três famílias, doze funções e teclado |
| Fallback reabria Partículas sem autorização | Seleção da primeira função autorizada; painel vazio oculto | RC.2: somente fita e painel sem função |
| Histórico repetia a tabela | Linha do tempo de eventos e tabela de medições separadas | RC.2: tipos de conteúdo distintos |
| Fita era rejeitada por exigência fixa de pHmetro | Validação por capacidade com técnicas alternativas | RC.2: fita, pHmetro e configuração inviável |
| Guia do professor ocupava toda a tela e redefinia permissões | Diálogo próprio, impressão separada e preservação de escolhas | RC.2: Professor, permissão térmica e guia PDF |
| Relatório podia mencionar instrumentos não usados/liberados | Captura contextual das técnicas e dados reais | RC.2: relatórios de fita e pHmetro; PDFs |
| Gráfico conectava preparos diferentes | Segmentação por técnica, contexto e reinício do volume | RC.2: duas séries e derivadas sem cruzar contexto |
| Registros repetitivos enchiam a tabela e a impressão | Compactador contíguo e reversível, sem substituir dados brutos | 18 casos de compactação; RC.2: expansão, CSV e PDF |
| Mudanças discretas da fita eram excessivamente isoladas | Proteção crítica depende de variação com volume; faixas iguais agrupadas | Compactação: sequência 4/5/6 e regiões críticas |
| Instrumento perdia foco após atualizar o painel | Recuperação do foco pela ação, além dos IDs das abas | RC.2: foco na fita e navegação por setas |
| Tabela rolável não recebia foco de teclado | Região nomeada com tabindex | axe nos três motores; tabela e Professor |
| Cabeçalho ficava alto após reduzir a largura | Altura mínima independente da medida anterior | RC.2: matriz de larguras e limite do cabeçalho |
| Troca de vidro por recipiente não permitia retorno ao tubo | Comparação com a vidraria do recipiente quando a permissão é local | RC.2: atividade semirrestrita |
| Captura automatizada do PDF em branco usava mídia de tela | Teste força mídia de impressão e verifica fundo branco, folha visível e formulário oculto | Impressão nos três motores e PDF revisado |
| Botões dinâmicos sem contrato visual verificável | Classes explícitas e teste de contrato em telas e funções | button-style-contract |

As falhas intermediárias de seletores antigos foram corrigidas nos testes para usar primeiro a família do painel. Uma tentativa de iniciar WebKit falhou por biblioteca nativa ausente; após instalar a dependência, a execução nos três motores foi repetida. Esses problemas não foram marcados como sucesso sem nova execução.

## RC.4.5

| Problema | Correção | Verificação |
|---|---|---|
| Ações auxiliares pareciam links | Quiet com superfície, borda, estados e dimensões da família | Estilos e geometrias em dez viewports |
| Atividades sem exclusão e sem identidade independente | UUID, editar, duplicar e confirmar exclusão persistente | Cancelamento, reload, IDs e token anterior |
| Montagens encaminhavam ao Manual | Catálogo operacional e visualização específica | Todas as montagens e comparação de indicadores |
| newTube introduzia HCl implicitamente | Default água; bancada nova vazia | Novo estado e restauração de HCl deliberado |
| Relatório vazio retirava ciência; Histórico ocupava o documento | Três modos, dez seções, ciência automática e Histórico fora da síntese | Texto, tabelas, gráficos e medições preservados |
| Escrita tinha uma área fixa indivisível | Linhas configuráveis e quebra por linha | 5/10/15/20/25/personalizado; PDF multipágina |
| Menu antigo e ícones divergentes | Seis grupos, contexto, permissões e biblioteca SVG | Contextos livres/restritos, igualdade dos paths |
| Nota apagada sem confirmação | Danger com confirmação e cancelamento | Fluxo de apagar/cancelar |
| Impressão trazia expansor da derivada | Captions científicos; controle da tabela de origem removido da representação impressa | PDF renderizado e inspeção visual |
