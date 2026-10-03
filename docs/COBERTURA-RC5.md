# Cobertura do prompt — SIAB 1.0.0-rc.5

Base RC.4.5; especificação local `Texto colado(6).txt`, 145 seções (0–144). Cada seção tem uma linha abaixo. “Preservado” identifica requisito já implementado na base e revalidado; não é apresentado como novidade. “Testado” refere-se às suítes/cenários vinculados, não a todos os aparelhos possíveis. Pendências externas e decisões futuras não recebem aprovação fictícia.

A conclusão da execução é **APTO PARA HOMOLOGAÇÃO FINAL**, permanecendo RC.5. A aprovação visual da iconografia pelo usuário e a homologação física estão explicitamente pendentes.

| Seção | Orientação | Situação | Implementação/evidência |
|---:|---|---|---|
| 0 | PROPÓSITO DESTA VERSÃO | Implementado | Consolidação da candidata sobre RC.4.5, sem reconstrução. [RC5.md](RC5.md); [VALIDACAO.md](../VALIDACAO.md) |
| 1 | FORA DO ESCOPO — VERSÃO 2.0.x | Escopo respeitado | Sem contas, servidor, nuvem, sincronização ou escopo 2.0.x. [RC5.md](RC5.md) |
| 2 | PRINCÍPIO DE CONGELAMENTO | Escopo respeitado | Ciência e arquitetura preservadas; somente consolidação solicitada. [PRESERVACAO-RC5.json](PRESERVACAO-RC5.json) |
| 3 | NÚCLEO CIENTÍFICO | Preservado e testado | Cinco arquivos de simulação idênticos à base; 25 testes científicos. [PRESERVACAO-RC5.json](PRESERVACAO-RC5.json); [ciencia.json](../tests/results/ciencia.json) |
| 4 | CATÁLOGO | Preservado e testado | 140 substâncias e registros de catálogo preservados. [ciencia.json](../tests/results/ciencia.json); [PRESERVACAO-RC5.json](PRESERVACAO-RC5.json) |
| 5 | ACTIVITYCONTEXT | Preservado e testado | Contrato central idêntico; restrições e restauração revalidadas. [rc2.json](../tests/results/rc2.json); [navegadores.json](../tests/results/navegadores.json) |
| 6 | FINALIZAR ATIVIDADE | Implementado e testado | Finalizar consolida, marca finalizada e abre diretamente o relatório. [atividades.js](../js/core/atividades.js); [rc5.json](../tests/results/rc5.json) |
| 7 | ENCERRAR ATIVIDADE | Implementado e testado | Encerrar preserva dados e remove contexto sem equivaler a Finalizar. [rc5.json](../tests/results/rc5.json) |
| 8 | ENCERRAR COM DADOS EXISTENTES | Implementado e testado | Diálogo com Continuar, relatório antes de sair e Encerrar. [rc5.json](../tests/results/rc5.json) |
| 9 | ABRIR RELATÓRIO ANTES DE SAIR | Implementado e testado | Relatório antes de sair mantém sessão e permite encerramento posterior. [rc5.json](../tests/results/rc5.json) |
| 10 | PDF | Implementado e testado | Imprimir/Salvar como PDF pelo diálogo do navegador. [impressao.json](../tests/results/impressao.json); [EVIDENCIAS-RC5.html](EVIDENCIAS-RC5.html) |
| 11 | REMOVER EXPORTAÇÃO HTML PARA O USUÁRIO | Implementado | Download HTML do relatório retirado da interface e do evento de UI. [index.html](../index.html); [relatorios.js](../js/telas/relatorios.js) |
| 12 | REGISTRO DA PRÁTICA NO CADERNO | Implementado e testado | Prática estruturada guarda referência a dados e relatório ao encerrar. [rc5.json](../tests/results/rc5.json); [caderno.js](../js/telas/caderno.js) |
| 13 | NÃO DUPLICAR PRÁTICA NO CADERNO | Implementado e testado | Atualiza por sessão/relatório em vez de duplicar prática. [rc5.json](../tests/results/rc5.json) |
| 14 | ENCERRAR SEM DADOS | Implementado e testado | Confirmação simples; sem prática vazia para cor inicial automática. [rc5.json](../tests/results/rc5.json) |
| 15 | RETORNO APÓS ENCERRAR | Implementado e testado | Saída sempre para a tela normal de Início. [rc5.json](../tests/results/rc5.json) |
| 16 | PREFERÊNCIA DE INICIALIZAÇÃO | Implementado e testado | Encerramento preserva preferência de inicialização. [rc5.json](../tests/results/rc5.json) |
| 17 | REABERTURA DO MESMO LINK | Implementado e testado | Reabrir link apresenta Continuar sessão/Nova sessão. [rc5.json](../tests/results/rc5.json) |
| 18 | INICIAR NOVA SESSÃO | Implementado e testado | Nova sessão confirmada, com novo ID e anterior preservada. [rc5.json](../tests/results/rc5.json) |
| 19 | ATIVIDADE JÁ FINALIZADA | Implementado e testado | Sessão finalizada oferece relatório anterior ou nova tentativa. [rc5.json](../tests/results/rc5.json) |
| 20 | NOVA TENTATIVA | Implementado e testado | Tentativa nova separa dados e mantém relatório anterior. [rc5.json](../tests/results/rc5.json) |
| 21 | ÁREA DO PROFESSOR — DIGITAL × IMPRESSO | Implementado | Professor não oferece nem grava escolha digital/impresso em novos links. [index.html](../index.html); [professor.js](../js/telas/professor.js) |
| 22 | COMPATIBILIDADE DE LINKS ANTIGOS | Testado | Links antigos digital e impresso aceitos nos três motores. [rc5.json](../tests/results/rc5.json); [offline-rc5.json](../tests/results/offline-rc5.json) |
| 23 | RELATÓRIO — ESTRUTURA FINAL | Preservado e testado | Dez seções do relatório preservadas e revalidadas. [rc45.json](../tests/results/rc45.json) |
| 24 | HISTÓRICO NÃO FAZ PARTE DO RELATÓRIO | Preservado e testado | Histórico cronológico permanece em Dados, separado do relatório. [rc45.json](../tests/results/rc45.json) |
| 25 | SEPARAÇÃO CONCEITUAL DEFINITIVA | Preservado e testado | Histórico, dados experimentais e Caderno mantêm funções distintas. [rc45.json](../tests/results/rc45.json); [rc5.json](../tests/results/rc5.json) |
| 26 | DADOS AUTOMÁTICOS | Preservado e testado | Dados automáticos capturados; textos do aluno separados. [rc45.json](../tests/results/rc45.json) |
| 27 | CONDIÇÕES INICIAIS | Preservado e testado | Condições iniciais incluem preparo, vidraria e componentes. [rc45.json](../tests/results/rc45.json) |
| 28 | DADOS EXPERIMENTAIS | Preservado e testado | Leituras reais usam técnica/unidade/contexto e estado instrumental. [rc45.json](../tests/results/rc45.json); [rc2.json](../tests/results/rc2.json) |
| 29 | TABELA | Preservado e testado | Tabela usa leituras registradas; não inventa medições. [rc45.json](../tests/results/rc45.json) |
| 30 | COMPACTAÇÃO NO RELATÓRIO | Preservado e testado | Compactação só apresenta; originais e faixas conservados. [compactacao.json](../tests/results/compactacao.json) |
| 31 | CONDIÇÕES FINAIS | Preservado e testado | Condições finais e pH lido/modelado mantêm identificação. [rc45.json](../tests/results/rc45.json) |
| 32 | REPRESENTAÇÕES | Preservado e testado | Representações existentes e gráficos usam dados/fontes indicados. [rc45.json](../tests/results/rc45.json) |
| 33 | MODOS DO RELATÓRIO | Preservado e testado | Três modos completos de relatório, mesma base científica. [rc45.json](../tests/results/rc45.json) |
| 34 | RELATÓRIO COMPLETO | Preservado e testado | Relatório completo com dados e campos autorais. [rc45.json](../tests/results/rc45.json); [EVIDENCIAS-RC5.html](EVIDENCIAS-RC5.html) |
| 35 | PARA PREENCHER À MÃO | Preservado e testado | Preencher à mão conserva dados científicos e oferece linhas. [rc45.json](../tests/results/rc45.json); [EVIDENCIAS-RC5.html](EVIDENCIAS-RC5.html) |
| 36 | ATIVIDADE DE ANÁLISE | Preservado e testado | Análise permite seleção de dados e hipótese explicitamente identificada. [rc45.json](../tests/results/rc45.json) |
| 37 | LINHAS PARA RESPOSTA | Preservado e testado | 5/10/15/20/25/personalizado; 10 linhas por padrão. [rc45.json](../tests/results/rc45.json) |
| 38 | CONFIGURAÇÃO INDEPENDENTE DE LINHAS | Preservado e testado | Ajustes independentes por campo, com limites 5–60. [rc45.json](../tests/results/rc45.json) |
| 39 | PAGINAÇÃO | Testado | Continuação entre páginas e três PDFs renderizados; papel real pendente. [rc45.json](../tests/results/rc45.json); [VALIDACAO.md](../VALIDACAO.md) |
| 40 | MONTAGEM / PREPARO / PRATELEIRA | Atualizado e testado | Montagem, Preparo e Prateleira descritos conforme os controles. [manual.js](../js/data/manual.js); [manual.json](../tests/results/manual.json) |
| 41 | TEXTOS DA INTERFACE | Atualizado | Terminologia revisada em Manual, tour e fluxos de atividade. [manual.js](../js/data/manual.js); [tour.js](../js/ui/tour.js) |
| 42 | BANCADA NOVA | Preservado e testado | Bancada nova vazia; montagem por escolha explícita. [rc45.json](../tests/results/rc45.json) |
| 43 | DEFAULT INTERNO | Preservado e testado | newTube genérico usa água; não injeta HCl na bancada nova. [rc45.json](../tests/results/rc45.json) |
| 44 | MONTAGENS PRONTAS | Preservado e testado | Montagens prontas abre catálogo operacional. [rc45.json](../tests/results/rc45.json) |
| 45 | ROTA DE MONTAGENS | Preservado e testado | Rota própria de Montagens mantida. [rc45.json](../tests/results/rc45.json) |
| 46 | VISUALIZAÇÃO DE MONTAGEM | Preservado e testado | Visualização informativa respeita contexto/permissões. [rc45.json](../tests/results/rc45.json) |
| 47 | COMPARAR INDICADORES | Preservado e testado | Comparar indicadores reutiliza a montagem oficial. [rc45.json](../tests/results/rc45.json) |
| 48 | ARCO-ÍRIS DO pH | Preservado e testado | Arco-íris integra o catálogo sem anotação automática no Caderno. [rc45.json](../tests/results/rc45.json) |
| 49 | APRENDER → TEMAS | Preservado e testado | Temas e marcador Revisado, sem progressão obrigatória. [rc45.json](../tests/results/rc45.json); [regressao.json](../tests/results/regressao.json) |
| 50 | MISSÕES | Preservado e testado | Missões mantêm investigação e conclusão sem pontos/ranking. [regressao.json](../tests/results/regressao.json) |
| 51 | REMOVER RESÍDUOS DE MISSÕES ANTIGAS | Limpeza aplicada | Resíduos de CSS sem consumidores retirados; sem retirar migrações. [SELETORES-REMOVIDOS-RC5.json](SELETORES-REMOVIDOS-RC5.json) |
| 52 | REFAZER MISSÃO | Preservado e testado | Refazer missão mantém separação de tentativa e dados. [rc45.json](../tests/results/rc45.json); [rc5.json](../tests/results/rc5.json) |
| 53 | ROTEIROS — EXPLORAR | Preservado e testado | Explorar mantém pergunta investigativa e registro autoral. [rc45.json](../tests/results/rc45.json) |
| 54 | ROTEIROS — MEDIR E CALCULAR | Preservado e testado | Medir/Calcular mantêm orientação própria e não copiam pergunta de Explorar. [rc45.json](../tests/results/rc45.json) |
| 55 | CADERNO | Atualizado e testado | Caderno apresenta notas e práticas com texto/filtros apropriados. [caderno.js](../js/telas/caderno.js); [rc5.json](../tests/results/rc5.json) |
| 56 | APAGAR NOTA | Testado | Apagar nota pede confirmação; cancelar não altera os dados. [rc5.json](../tests/results/rc5.json); [rc45.json](../tests/results/rc45.json) |
| 57 | APAGAR CADERNO | Testado | Apagar Caderno confirma e persiste, mantendo família danger. [rc45.json](../tests/results/rc45.json) |
| 58 | REGISTROS DE PRÁTICA NO CADERNO | Implementado e testado | Prática com Abrir dados/Abrir relatório, consulta sem mutar bancada. [rc5.json](../tests/results/rc5.json) |
| 59 | MODO PROJETOR | Preservado e testado | Projetor no menu/Professor; persistência e layout exercitados. [rc45.json](../tests/results/rc45.json); [EVIDENCIAS-RC5.html](EVIDENCIAS-RC5.html) |
| 60 | MENU HAMBÚRGUER | Preservado e testado | Menu contextual permanece acessível em desktop/mobile. [rc45.json](../tests/results/rc45.json) |
| 61 | ESTRUTURA DO MENU | Preservado e testado | Agora, Navegar, Recursos, Professor, Preferências e Aplicativo. [rc45.json](../tests/results/rc45.json) |
| 62 | MENU EM ATIVIDADE RESTRITA | Preservado e testado | Menu em atividade restrita respeita o ActivityContext. [rc2.json](../tests/results/rc2.json); [rc45.json](../tests/results/rc45.json) |
| 63 | ICONOGRAFIA — PRINCÍPIO GERAL | Implementado e testado | Biblioteca SVG central, inventário e usos revisados. [ICONOGRAFIA-RC5.md](ICONOGRAFIA-RC5.md); [rc5.json](../tests/results/rc5.json) |
| 64 | MESMA FUNÇÃO = MESMO ÍCONE | Implementado e testado | Mesma função usa o mesmo SVG e aliases explícitos. [rc5.json](../tests/results/rc5.json) |
| 65 | FUNÇÕES DIFERENTES = ÍCONES DIFERENTES | Implementado e testado | 22 conceitos de área com geometrias distintas. [rc5.json](../tests/results/rc5.json); [ICONOGRAFIA-RC5.html](ICONOGRAFIA-RC5.html) |
| 66 | ÁREAS QUE DEVEM POSSUIR IDENTIDADE PRÓPRIA | Implementado | 22 áreas incluídas no inventário visual e textual. [ICONOGRAFIA-RC5.md](ICONOGRAFIA-RC5.md) |
| 67 | FAMÍLIA DE SETAS — REESTILIZAÇÃO | Implementado | Setas reestilizadas no mesmo sistema de SVG. [icons.js](../js/ui/icons.js); [ICONOGRAFIA-RC5.html](ICONOGRAFIA-RC5.html) |
| 68 | TIPOS DE SETA | Implementado | Voltar, avançar, anterior/próximo, expandir/recolher, dropdown, fluxo e troca. [ICONOGRAFIA-RC5.html](ICONOGRAFIA-RC5.html) |
| 69 | CONTRATO VISUAL DAS SETAS | Implementado e testado | ViewBox/stroke e dimensões coerentes; controles mantêm nome acessível. [rc5.json](../tests/results/rc5.json); [ACESSIBILIDADE-RC5.md](ACESSIBILIDADE-RC5.md) |
| 70 | NÃO EXAGERAR NAS SETAS | Inspecionado | Setas ligadas a direção/ação, sem inserção decorativa generalizada. [ICONOGRAFIA-RC5.html](ICONOGRAFIA-RC5.html); [EVIDENCIAS-RC5.html](EVIDENCIAS-RC5.html) |
| 71 | AVALIAÇÃO VISUAL OBRIGATÓRIA | Apresentado; aprovação pendente | Inspeção técnica feita; avaliação visual final pertence ao usuário. [ICONOGRAFIA-RC5.html](ICONOGRAFIA-RC5.html); [LIMITACOES.md](LIMITACOES.md) |
| 72 | BOTTOM NAV MOBILE | Preservado e testado | Bottom nav reutiliza identidades Montagem/Ver/Dados e alvos de toque. [mobile-controls.json](../tests/results/mobile-controls.json) |
| 73 | QUIET-BTN | Preservado e testado | Quiet-btn com borda/superfície, sem aparência de hyperlink. [rc5.json](../tests/results/rc5.json) |
| 74 | QUIET-BTN GLOBAL | Auditado | Quiet-btn verificado nas telas públicas, Caderno, relatório e Sobre. [rc5.json](../tests/results/rc5.json) |
| 75 | SOBRE O SIAB — BOTÕES | Atualizado e testado | Sobre usa família quiet-btn compartilhada, com foco/contraste. [rc5.json](../tests/results/rc5.json) |
| 76 | SOBRE O SIAB — CONTEÚDO | Preservado e inspecionado | Sobre enxuto; referências científicas permanecem no Manual. [index.html](../index.html); [rc45.json](../tests/results/rc45.json) |
| 77 | MANUAL DO USUÁRIO | Atualizado e testado | Manual reflete sessões, relatórios/PDF, Caderno e terminologia vigente. [manual.json](../tests/results/manual.json); [MANUAL.md](MANUAL.md) |
| 78 | BIBLIOTECA DE SUBSTÂNCIAS | Preservado e testado | Biblioteca de substâncias local, parâmetros/contexto e 140 registros. [ciencia.json](../tests/results/ciencia.json); [manual.json](../tests/results/manual.json) |
| 79 | TOUR GUIADO | Atualizado e testado | Tour de cinco passos usa Montagem/Preparo/Prateleira, Ver e Dados. [ambiente.json](../tests/results/ambiente.json) |
| 80 | IDEIAS PARA AULA ACESSÍVEL | Preservado e testado | Ajuda pedagógica acessível continua no Professor/Manual. [rc2.json](../tests/results/rc2.json); [manual.json](../tests/results/manual.json) |
| 81 | CÓDIGO E CSS LEGADOS | Auditado | CSS legado removido apenas onde não havia consumidor. [SELETORES-REMOVIDOS-RC5.json](SELETORES-REMOVIDOS-RC5.json); [IMPLEMENTACAO.md](IMPLEMENTACAO.md) |
| 82 | REMOÇÃO DE CÓDIGO MORTO | Limpeza aplicada | Seletores mortos e escrita morta de última localização removidos. [SELETORES-REMOVIDOS-RC5.json](SELETORES-REMOVIDOS-RC5.json); [progresso.js](../js/core/progresso.js) |
| 83 | MIGRAÇÕES | Preservado e testado | Migrações/backup/legado intactos, 12 verificações aprovadas. [migracao.json](../tests/results/migracao.json) |
| 84 | ALIASES DE ROTAS | Preservado | Aliases de rotas antigos mantidos no roteador. [PRESERVACAO-RC5.json](PRESERVACAO-RC5.json); [roteador.js](../js/core/roteador.js) |
| 85 | ÚLTIMA LOCALIZAÇÃO | Limpeza aplicada | Escrita morta retirada; preservadas leituras necessárias de compatibilidade. [progresso.js](../js/core/progresso.js); [IMPLEMENTACAO.md](IMPLEMENTACAO.md) |
| 86 | ACESSIBILIDADE — REGRA | Auditado | Teclado, semântica, alvos e estados auditados; sem alegar certificação integral. [ACESSIBILIDADE-RC5.md](ACESSIBILIDADE-RC5.md) |
| 87 | TESTES DE ACESSIBILIDADE | Testado em ambiente automatizado | Foco, painéis, axe, zoom equivalente, fontes, motion e targets. [ACESSIBILIDADE-RC5.md](ACESSIBILIDADE-RC5.md); [rc5.json](../tests/results/rc5.json) |
| 88 | LEITORES DE TELA | Homologação externa pendente | NVDA, TalkBack e VoiceOver não executados em plataformas reais. [LIMITACOES.md](LIMITACOES.md) |
| 89 | RESULTADOS DINÂMICOS | Testado parcialmente | Anúncio de pH e regiões dinâmicas; fala assistiva real pendente. [ACESSIBILIDADE-RC5.md](ACESSIBILIDADE-RC5.md); [rc5.json](../tests/results/rc5.json) |
| 90 | ALTO CONTRASTE / DALTONISMO | Testado em cenários definidos | Temas, alto contraste e deuteranopia; avaliação física/humana pendente. [regressao.json](../tests/results/regressao.json); [LIMITACOES.md](LIMITACOES.md) |
| 91 | VLibras | Falhas testadas; serviço real pendente | VLibras opcional; erro de rede e construtor tratados. [rc5.json](../tests/results/rc5.json); [DEPENDENCIAS-RC5.md](DEPENDENCIAS-RC5.md) |
| 92 | MOBILE — CONGELAMENTO | Preservado | Arquitetura mobile mantida byte a byte nos contratos de layout. [PRESERVACAO-RC5.json](PRESERVACAO-RC5.json) |
| 93 | VIEWPORTS MOBILE | Testado | 320×568, 360×800, 390×844 e 414×896 nos três motores. [mobile-controls.json](../tests/results/mobile-controls.json) |
| 94 | MOBILE — TESTAR | Testado em emulação | Bancada/painéis/telas/menu/formulários; safe areas físicas pendentes. [mobile-controls.json](../tests/results/mobile-controls.json); [rc5.json](../tests/results/rc5.json) |
| 95 | TECLADO VIRTUAL | Testado em emulação | Viewport reduzida de 390×400 e campo visível; IME físico pendente. [rc5.json](../tests/results/rc5.json); [LIMITACOES.md](LIMITACOES.md) |
| 96 | DESKTOP / TABLET | Testado | Seis dimensões tablet/desktop solicitadas, até 1920×1080. [rc5.json](../tests/results/rc5.json); [workspace.json](../tests/results/workspace.json) |
| 97 | DOCAS | Testado | Docas, expansão, recolhimento, foco, persistência e resize. [workspace.json](../tests/results/workspace.json) |
| 98 | PWA / OFFLINE — REGRA | Testado | Núcleo essencial local; cache/SW e reabertura offline. [OFFLINE-RC5.md](OFFLINE-RC5.md) |
| 99 | DEPENDÊNCIAS EXTERNAS | Auditado | Pesquisa das sete expressões, 17 ocorrências classificadas. [DEPENDENCIAS-OCORRENCIAS-RC5.json](DEPENDENCIAS-OCORRENCIAS-RC5.json) |
| 100 | DEPENDÊNCIAS ESSENCIAIS | Preservado e testado | Nenhuma CDN essencial; recursos do núcleo locais. [DEPENDENCIAS-RC5.md](DEPENDENCIAS-RC5.md); [offline-rc5.json](../tests/results/offline-rc5.json) |
| 101 | DIRETÓRIO VENDOR | Preservado | dialog-polyfill local, versionado e com licença. [DEPENDENCIAS-RC5.md](DEPENDENCIAS-RC5.md); [LICENSE](../vendor/dialog-polyfill/LICENSE) |
| 102 | SERVIÇOS EXTERNOS OPCIONAIS | Auditado e testado | Clima/VLibras opcionais, falha clara e núcleo independente. [DEPENDENCIAS-RC5.md](DEPENDENCIAS-RC5.md); [ambiente.json](../tests/results/ambiente.json) |
| 103 | DOCUMENTAÇÃO DE DEPENDÊNCIAS | Documentado | Nome/versão/licença/finalidade e distinção runtime/desenvolvimento. [DEPENDENCIAS-RC5.md](DEPENDENCIAS-RC5.md) |
| 104 | TESTE OFFLINE REAL | Testado em navegadores Linux | Fechar/reabrir sem servidor, serviços bloqueados e uso do núcleo. [OFFLINE-RC5.md](OFFLINE-RC5.md); [offline-rc5.json](../tests/results/offline-rc5.json) |
| 105 | ATUALIZAÇÃO DO SERVICE WORKER | Testado | Atualização real RC.4.5 → RC.5, cache íntegro e sessão preservada. [offline-rc5.json](../tests/results/offline-rc5.json) |
| 106 | STANDALONE | Reconstruído e testado | Standalone gerado após alterações e exercitado por file://. [entrega.json](../tests/results/entrega.json); [rc5.json](../tests/results/rc5.json) |
| 107 | PARIDADE STANDALONE × MODULAR | Testado | Versão, estilos, permissões, Manual, Professor e ciclo de sessão. [entrega.json](../tests/results/entrega.json); [manual.json](../tests/results/manual.json); [rc5.json](../tests/results/rc5.json) |
| 108 | TESTES CIENTÍFICOS | Testado | 25/25 testes científicos aprovados. [ciencia.json](../tests/results/ciencia.json) |
| 109 | CATÁLOGO | Testado | 140 substâncias validadas novamente. [ciencia.json](../tests/results/ciencia.json); [regressao.json](../tests/results/regressao.json) |
| 110 | MIGRAÇÕES | Testado | 12/12 verificações de migração aprovadas. [migracao.json](../tests/results/migracao.json) |
| 111 | COMPACTAÇÃO | Testado | 18/18 verificações de compactação aprovadas. [compactacao.json](../tests/results/compactacao.json) |
| 112 | BROWSER TESTS | Testado | Chromium, Firefox e WebKit instalados; 227 casos por motor. [resumo-rc5.json](../tests/results/resumo-rc5.json) |
| 113 | CONSOLE | Testado | Zero exceções de página não tratadas nos resultados finais. [resumo-rc5.json](../tests/results/resumo-rc5.json) |
| 114 | RELATÓRIO — TESTES | Testado | Modos, impressão, linhas, condições, leituras, gráficos e Caderno. [rc45.json](../tests/results/rc45.json); [rc5.json](../tests/results/rc5.json) |
| 115 | ENCERRAR — TESTES | Testado | Encerrar sem/com dados, relatório antes, Caderno, Início e contexto removido. [rc5.json](../tests/results/rc5.json) |
| 116 | FINALIZAR — TESTES | Testado | Finalizar consolida/marca/abre relatório e permite consulta posterior. [rc5.json](../tests/results/rc5.json) |
| 117 | REABERTURA DE LINK | Testado | Reabertura ativa/finalizada, continuar, nova tentativa e cancelamento. [rc5.json](../tests/results/rc5.json) |
| 118 | CADERNO — TESTES DE PRÁTICA | Testado | Prática sem duplicação, dados/relatório e persistência após reload. [rc5.json](../tests/results/rc5.json) |
| 119 | ÁREA DO PROFESSOR | Testado | Professor criar/editar/duplicar/excluir/link/aluno/projetor/guia. [rc45.json](../tests/results/rc45.json); [rc2.json](../tests/results/rc2.json) |
| 120 | EXCLUSÃO | Testado | Confirmação/cancelamento/exclusão e persistência, sem revogar link autocontido. [rc45.json](../tests/results/rc45.json); [rc5.json](../tests/results/rc5.json) |
| 121 | QUIET-BTN | Testado e inspecionado | Quiet-btn com superfície/borda/raio/altura nas telas exercitadas. [rc5.json](../tests/results/rc5.json); [EVIDENCIAS-RC5.html](EVIDENCIAS-RC5.html) |
| 122 | DANGER-BTN | Testado | Ações destrutivas com danger, rótulo e confirmação. [rc45.json](../tests/results/rc45.json); [rc5.json](../tests/results/rc5.json) |
| 123 | ICONOGRAFIA — TESTES | Testado e documentado | Inventário central e identidade de 22 áreas; SVG/ARIA revisados. [ICONOGRAFIA-RC5.md](ICONOGRAFIA-RC5.md); [rc5.json](../tests/results/rc5.json) |
| 124 | SETAS — TESTES | Apresentado | Painel de setas com estados interativos e capturas claro/escuro. [ICONOGRAFIA-RC5.html](ICONOGRAFIA-RC5.html); [EVIDENCIAS-RC5.html](EVIDENCIAS-RC5.html) |
| 125 | SCREENSHOTS DE HOMOLOGAÇÃO | Entregue | 33 capturas canônicas cobrem as 24 categorias exigidas, além da comparação mobile. [EVIDENCIAS-RC5.html](EVIDENCIAS-RC5.html) |
| 126 | HOMOLOGAÇÃO VISUAL DA ICONOGRAFIA | Avaliação do usuário pendente | Iconografia entregue para homologação visual; sem congelamento automático. [ICONOGRAFIA-RC5.html](ICONOGRAFIA-RC5.html); [LIMITACOES.md](LIMITACOES.md) |
| 127 | DOCUMENTAÇÃO | Atualizado | README, CHANGELOG, VALIDACAO, Manual e documentação técnica atualizados. [README.md](../README.md); [VALIDACAO.md](../VALIDACAO.md) |
| 128 | VERSIONAMENTO | Atualizado | RC.5 em código, package/lock, SW, standalone, metadados e documentos atuais. [versoes.json](versoes.json); [sw.js](../sw.js) |
| 129 | CHANGELOG | Atualizado | Changelog RC.5 separado do histórico anterior. [CHANGELOG.md](../CHANGELOG.md) |
| 130 | HASHES | Gerado | SHA-256/SHA-512 dos artefatos e manifestos internos; método documentado. [SHA256SUMS.txt](../SHA256SUMS.txt); [SHA512SUMS.txt](../SHA512SUMS.txt); [VALIDACAO.md](../VALIDACAO.md) |
| 131 | LIMPEZA DE ARTEFATOS | Aplicado | Sem node_modules, caches, builds anteriores ou capturas preliminares no pacote. [LIMPEZA-RC5.json](LIMPEZA-RC5.json) |
| 132 | ZIP FINAL | Entregue | ZIP completo SIAB-1.0.0-rc.5.zip com modular/standalone/docs/testes. [README.md](../README.md) |
| 133 | RELATÓRIO DE VALIDAÇÃO | Entregue | Contagens, motores, dimensões, offline, a11y e limites documentados. [VALIDACAO.md](../VALIDACAO.md); [resumo-rc5.json](../tests/results/resumo-rc5.json) |
| 134 | PENDÊNCIAS EXTERNAS | Documentado | Testado separado de aparelhos/leitores reais não testados. [LIMITACOES.md](LIMITACOES.md); [COMPATIBILIDADE.md](../COMPATIBILIDADE.md) |
| 135 | NÃO CRIAR RC.6 AUTOMATICAMENTE | Escopo respeitado | Nenhuma RC.6 criada automaticamente. [RC5.md](RC5.md) |
| 136 | CRITÉRIOS PARA RC.6 | Documentado | RC.6 reservada a regressão/problema funcional relevante. [RC5.md](RC5.md) |
| 137 | MICROAJUSTES | Escopo respeitado | Microajustes desta rodada mantidos na RC.5 e revalidados. [CHANGELOG.md](../CHANGELOG.md) |
| 138 | CRITÉRIOS PARA CONGELAR 1.0.0 | Homologação externa pendente | Critérios técnicos exercitados; aprovação visual e ambientes reais ainda pendentes. [VALIDACAO.md](../VALIDACAO.md); [LIMITACOES.md](LIMITACOES.md) |
| 139 | APÓS CONGELAMENTO | Política preservada | Após congelamento, correções pontuais; expansão funcional fora desta entrega. [RC5.md](RC5.md) |
| 140 | PROMOÇÃO | Não promovido | Versão permanece RC.5; promoção exige homologação. [versoes.json](versoes.json); [VALIDACAO.md](../VALIDACAO.md) |
| 141 | LINHA 2.0.x | Fora do escopo | Linha 2.0.x não iniciada nesta rodada. [RC5.md](RC5.md) |
| 142 | RESULTADO ESPERADO | Entregue para homologação | Candidata consolidada, com pacote e evidências verificáveis. [VALIDACAO.md](../VALIDACAO.md) |
| 143 | ENTREGA OBRIGATÓRIA | Entregue | Modular, standalone, ZIP, documentos, testes, capturas, inventários e hashes. [README.md](../README.md); [VALIDACAO.md](../VALIDACAO.md) |
| 144 | REGRA FINAL | Concluído no ambiente disponível | Sem inventar testes físicos ou aprovação estética; pendências declaradas. [VALIDACAO.md](../VALIDACAO.md); [LIMITACOES.md](LIMITACOES.md) |
