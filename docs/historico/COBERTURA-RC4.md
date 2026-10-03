> Histórico de uma rodada anterior. Não descreve a entrega atual. Consulte [VALIDACAO.md](../../VALIDACAO.md) e [RC5.md](../RC5.md). Evidências antigas citadas podem não integrar este pacote.

# Cobertura das orientações da RC.4

Matriz das **169 seções numeradas** do prompt `Texto colado(4).txt`, aplicado sobre o pacote RC.3 entregue. A evidência automatizada é Linux/Playwright; ensaios físicos pendentes estão identificados em `VALIDACAO.md` e `docs/LIMITACOES.md`. As microcorreções mobile solicitadas depois do prompt constam do apêndice.

| Nº | Orientação | Atendimento | Arquivo | Evidência |
|---:|---|---|---|---|
| 1 | CONTEXTO | Identidade integrada, texto conciso e sem PDF/gamificação | `js/telas/manual.js`, `css/manual.css` | `manual.json: home, tópicos e capturas` |
| 2 | PROBLEMA ATUAL | Identidade integrada, texto conciso e sem PDF/gamificação | `js/telas/manual.js`, `css/manual.css` | `manual.json: home, tópicos e capturas` |
| 3 | PRINCÍPIO CENTRAL | Identidade integrada, texto conciso e sem PDF/gamificação | `js/telas/manual.js`, `css/manual.css` | `manual.json: home, tópicos e capturas` |
| 4 | NÃO TRANSFORMAR O MANUAL EM OUTRO PROGRAMA | Identidade integrada, texto conciso e sem PDF/gamificação | `js/telas/manual.js`, `css/manual.css` | `manual.json: home, tópicos e capturas` |
| 5 | NÃO USAR ESTÉTICA DE PDF | Identidade integrada, texto conciso e sem PDF/gamificação | `js/telas/manual.js`, `css/manual.css` | `manual.json: home, tópicos e capturas` |
| 6 | SEM GAMIFICAÇÃO | Identidade integrada, texto conciso e sem PDF/gamificação | `js/telas/manual.js`, `css/manual.css` | `manual.json: home, tópicos e capturas` |
| 7 | HOME DO MANUAL | Home temática, cards de tarefa, hierarquia, índice e leitura progressiva | `js/data/manual.js`, `js/telas/manual.js` | `manual.json: home, tópicos, índice e acordeões` |
| 8 | CARDS TEMÁTICOS | Home temática, cards de tarefa, hierarquia, índice e leitura progressiva | `js/data/manual.js`, `js/telas/manual.js` | `manual.json: home, tópicos, índice e acordeões` |
| 9 | NÃO CRIAR CARDS DECORATIVOS | Home temática, cards de tarefa, hierarquia, índice e leitura progressiva | `js/data/manual.js`, `js/telas/manual.js` | `manual.json: home, tópicos, índice e acordeões` |
| 10 | HIERARQUIA DE CONTEÚDO | Home temática, cards de tarefa, hierarquia, índice e leitura progressiva | `js/data/manual.js`, `js/telas/manual.js` | `manual.json: home, tópicos, índice e acordeões` |
| 11 | CONTEÚDO CURTO PRIMEIRO | Home temática, cards de tarefa, hierarquia, índice e leitura progressiva | `js/data/manual.js`, `js/telas/manual.js` | `manual.json: home, tópicos, índice e acordeões` |
| 12 | DIVULGAÇÃO PROGRESSIVA | Home temática, cards de tarefa, hierarquia, índice e leitura progressiva | `js/data/manual.js`, `js/telas/manual.js` | `manual.json: home, tópicos, índice e acordeões` |
| 13 | NÃO ESCONDER INFORMAÇÃO ESSENCIAL | Home temática, cards de tarefa, hierarquia, índice e leitura progressiva | `js/data/manual.js`, `js/telas/manual.js` | `manual.json: home, tópicos, índice e acordeões` |
| 14 | NAVEGAÇÃO INTERNA | Home temática, cards de tarefa, hierarquia, índice e leitura progressiva | `js/data/manual.js`, `js/telas/manual.js` | `manual.json: home, tópicos, índice e acordeões` |
| 15 | BREADCRUMBS | Home temática, cards de tarefa, hierarquia, índice e leitura progressiva | `js/data/manual.js`, `js/telas/manual.js` | `manual.json: home, tópicos, índice e acordeões` |
| 16 | BOTÃO VOLTAR | Home temática, cards de tarefa, hierarquia, índice e leitura progressiva | `js/data/manual.js`, `js/telas/manual.js` | `manual.json: home, tópicos, índice e acordeões` |
| 17 | BUSCA NO MANUAL | Busca local, normalização, sinônimos, resultados e estado vazio | `js/data/manual.js`, `js/telas/manual.js` | `manual.json: busca, acentos, plurais e injeção` |
| 18 | RESULTADOS DE BUSCA | Busca local, normalização, sinônimos, resultados e estado vazio | `js/data/manual.js`, `js/telas/manual.js` | `manual.json: busca, acentos, plurais e injeção` |
| 19 | BUSCA POR SINÔNIMOS | Sinônimos editoriais por tópico: medidor de pH, papel indicador | `js/data/manual.js`, `docs/TERMOS-BUSCA.md` | `manual.json: busca por sinônimos` |
| 20 | NORMALIZAÇÃO DA BUSCA | NFD/acentos, caixa, plurais simples e prefixos | `js/data/manual.js`, `docs/INDICE-BUSCA.json` | `manual.json: busca por acentos/plurais` |
| 21 | BUSCA SEM RESULTADOS | Busca local, normalização, sinônimos, resultados e estado vazio | `js/data/manual.js`, `js/telas/manual.js` | `manual.json: busca, acentos, plurais e injeção` |
| 22 | MANUAL EXPLICA, FUNÇÃO EXECUTA | Manual explicativo, destinos operacionais separados e assuntos relacionados | `js/data/manual.js`, `js/telas/manual.js` | `manual.json: destinos, aliases e links` |
| 23 | MONTAGENS PRONTAS | Montagens prontas: explicação própria e rota operacional #/montagens | `js/data/manual.js`, `js/telas/manual.js` | `manual.json: separação de destinos` |
| 24 | ROTEIRO EXPERIMENTAL | Roteiros Experimentais: #/manual/roteiros e operação #/roteiros | `js/data/manual.js`, `js/core/roteador.js` | `manual.json: links/aliases` |
| 25 | MONTAGEM PRONTA | Manual explicativo, destinos operacionais separados e assuntos relacionados | `js/data/manual.js`, `js/telas/manual.js` | `manual.json: destinos, aliases e links` |
| 26 | LINK CRUZADO | Manual explicativo, destinos operacionais separados e assuntos relacionados | `js/data/manual.js`, `js/telas/manual.js` | `manual.json: destinos, aliases e links` |
| 27 | VEJA TAMBÉM | Manual explicativo, destinos operacionais separados e assuntos relacionados | `js/data/manual.js`, `js/telas/manual.js` | `manual.json: destinos, aliases e links` |
| 28 | AJUDA CONTEXTUAL | Ajuda curta vinculada ao tópico correto, guardas e foco | `js/telas/manual.js`, `js/ui/activity-ui.js` | `manual.json: ajuda livre/restrita`, `rc2.json: permissões` |
| 29 | POPOVER/PANEL DE AJUDA | Ajuda curta vinculada ao tópico correto, guardas e foco | `js/telas/manual.js`, `js/ui/activity-ui.js` | `manual.json: ajuda livre/restrita`, `rc2.json: permissões` |
| 30 | AJUDA CURTA | Ajuda curta vinculada ao tópico correto, guardas e foco | `js/telas/manual.js`, `js/ui/activity-ui.js` | `manual.json: ajuda livre/restrita`, `rc2.json: permissões` |
| 31 | ABRIR NO MANUAL | Ajuda curta vinculada ao tópico correto, guardas e foco | `js/telas/manual.js`, `js/ui/activity-ui.js` | `manual.json: ajuda livre/restrita`, `rc2.json: permissões` |
| 32 | AJUDA EM ATIVIDADE RESTRITA | Restrição pedagógica preserva contexto e omite link externo | `js/telas/manual.js`, `js/core/activity-context.js` | `manual.json e rc2.json: guarda restrita` |
| 33 | MANUAL NA BANCADA LIVRE | Ajuda curta vinculada ao tópico correto, guardas e foco | `js/telas/manual.js`, `js/ui/activity-ui.js` | `manual.json: ajuda livre/restrita`, `rc2.json: permissões` |
| 34 | TOUR GUIADO | Tour original iniciado pela home, sem cópia de passos no texto | `js/ui/tour.js`, `js/telas/manual.js` | `manual.json: tour 5 passos`, `ambiente.json` |
| 35 | HOME DO MANUAL E TOUR | Tour original iniciado pela home, sem cópia de passos no texto | `js/ui/tour.js`, `js/telas/manual.js` | `manual.json: tour 5 passos`, `ambiente.json` |
| 36 | NÃO DUPLICAR TOUR DENTRO DO MANUAL | Tour original iniciado pela home, sem cópia de passos no texto | `js/ui/tour.js`, `js/telas/manual.js` | `manual.json: tour 5 passos`, `ambiente.json` |
| 37 | ILUSTRAÇÕES | Ilustrações SVG e fluxos com legendas e texto equivalente | `js/telas/manual.js`, `css/manual.css` | `manual.json: diagramas e axe`, `capturas RC.4` |
| 38 | NÃO DEPENDER SOMENTE DE SCREENSHOTS | Diagramas vetoriais acessíveis substituem dependência de screenshots | `js/telas/manual.js`, `css/manual.css` | `manual.json: imagens e capturas` |
| 39 | DIAGRAMAS SIMPLES | Ilustrações SVG e fluxos com legendas e texto equivalente | `js/telas/manual.js`, `css/manual.css` | `manual.json: diagramas e axe`, `capturas RC.4` |
| 40 | FLUXOS VISUAIS | Ilustrações SVG e fluxos com legendas e texto equivalente | `js/telas/manual.js`, `css/manual.css` | `manual.json: diagramas e axe`, `capturas RC.4` |
| 41 | MODOS EXPLORAR, MEDIR E CALCULAR | Módulos e técnicas descritos conforme instrumentação e limites | `js/data/manual.js`, `js/ui/modulos.js` | `manual.json: 51 tópicos`, `ciencia.test.cjs` |
| 42 | EXPLORAR | Módulos e técnicas descritos conforme instrumentação e limites | `js/data/manual.js`, `js/ui/modulos.js` | `manual.json: 51 tópicos`, `ciencia.test.cjs` |
| 43 | MEDIR | Módulos e técnicas descritos conforme instrumentação e limites | `js/data/manual.js`, `js/ui/modulos.js` | `manual.json: 51 tópicos`, `ciencia.test.cjs` |
| 44 | CALCULAR | Módulos e técnicas descritos conforme instrumentação e limites | `js/data/manual.js`, `js/ui/modulos.js` | `manual.json: 51 tópicos`, `ciencia.test.cjs` |
| 45 | INSTRUMENTOS | Módulos e técnicas descritos conforme instrumentação e limites | `js/data/manual.js`, `js/ui/modulos.js` | `manual.json: 51 tópicos`, `ciencia.test.cjs` |
| 46 | ESTRUTURA DE PÁGINA DE INSTRUMENTO | Módulos e técnicas descritos conforme instrumentação e limites | `js/data/manual.js`, `js/ui/modulos.js` | `manual.json: 51 tópicos`, `ciencia.test.cjs` |
| 47 | LIMITAÇÕES | Módulos e técnicas descritos conforme instrumentação e limites | `js/data/manual.js`, `js/ui/modulos.js` | `manual.json: 51 tópicos`, `ciencia.test.cjs` |
| 48 | NÃO PROMETER PRECISÃO INEXISTENTE | Módulos e técnicas descritos conforme instrumentação e limites | `js/data/manual.js`, `js/ui/modulos.js` | `manual.json: 51 tópicos`, `ciencia.test.cjs` |
| 49 | BANCADA | Preparo, tubos, Ver, medições, análise, registros e acessibilidade | `js/data/manual.js`, `js/telas/manual.js` | `manual.json`, `rc2.json`, `compactacao.test.cjs` |
| 50 | MULTIPLOS TUBOS | Selecionar, comparar, vincular e misturar explicados sem mutação pelo Manual | `js/data/manual.js` | `manual.json`, `rc2.json: múltiplos tubos` |
| 51 | AÇÕES EXPERIMENTAIS | Preparo, tubos, Ver, medições, análise, registros e acessibilidade | `js/data/manual.js`, `js/telas/manual.js` | `manual.json`, `rc2.json`, `compactacao.test.cjs` |
| 52 | OBSERVAR | Preparo, tubos, Ver, medições, análise, registros e acessibilidade | `js/data/manual.js`, `js/telas/manual.js` | `manual.json`, `rc2.json`, `compactacao.test.cjs` |
| 53 | MEDIR — PAINEL | Preparo, tubos, Ver, medições, análise, registros e acessibilidade | `js/data/manual.js`, `js/telas/manual.js` | `manual.json`, `rc2.json`, `compactacao.test.cjs` |
| 54 | ANALISAR | Preparo, tubos, Ver, medições, análise, registros e acessibilidade | `js/data/manual.js`, `js/telas/manual.js` | `manual.json`, `rc2.json`, `compactacao.test.cjs` |
| 55 | HISTÓRICO | Preparo, tubos, Ver, medições, análise, registros e acessibilidade | `js/data/manual.js`, `js/telas/manual.js` | `manual.json`, `rc2.json`, `compactacao.test.cjs` |
| 56 | TABELA | Preparo, tubos, Ver, medições, análise, registros e acessibilidade | `js/data/manual.js`, `js/telas/manual.js` | `manual.json`, `rc2.json`, `compactacao.test.cjs` |
| 57 | COMPACTAÇÃO DAS MEDIÇÕES | Compactação agrupa visualmente e conserva bruto/CSV | `js/data/manual.js`, `js/simulation/medicoes.js` | `compactacao.test.cjs: 18 casos`, `rc2.json` |
| 58 | COMPACTA × COMPLETA | Preparo, tubos, Ver, medições, análise, registros e acessibilidade | `js/data/manual.js`, `js/telas/manual.js` | `manual.json`, `rc2.json`, `compactacao.test.cjs` |
| 59 | GRÁFICOS | Preparo, tubos, Ver, medições, análise, registros e acessibilidade | `js/data/manual.js`, `js/telas/manual.js` | `manual.json`, `rc2.json`, `compactacao.test.cjs` |
| 60 | ΔpH/ΔV | Derivada por diferença entre leituras reais no mesmo contexto | `js/data/manual.js`, `js/simulation/medicoes.js` | `ciencia.test.cjs`, `rc2.json` |
| 61 | RELATÓRIOS | Preparo, tubos, Ver, medições, análise, registros e acessibilidade | `js/data/manual.js`, `js/telas/manual.js` | `manual.json`, `rc2.json`, `compactacao.test.cjs` |
| 62 | RELATÓRIO E DADOS REAIS | Relatório com dados medidos, interpretação do aluno | `js/data/manual.js`, `js/telas/relatorios.js` | `impressao.json`, `rc2.json` |
| 63 | CADERNO | Preparo, tubos, Ver, medições, análise, registros e acessibilidade | `js/data/manual.js`, `js/telas/manual.js` | `manual.json`, `rc2.json`, `compactacao.test.cjs` |
| 64 | ACESSIBILIDADE | Preparo, tubos, Ver, medições, análise, registros e acessibilidade | `js/data/manual.js`, `js/telas/manual.js` | `manual.json`, `rc2.json`, `compactacao.test.cjs` |
| 65 | ATALHOS | Preparo, tubos, Ver, medições, análise, registros e acessibilidade | `js/data/manual.js`, `js/telas/manual.js` | `manual.json`, `rc2.json`, `compactacao.test.cjs` |
| 66 | SOLUÇÃO DE PROBLEMAS | Ajuda e linguagem de usuário, registro único, IDs, links e aliases | `js/data/manual.js`, `js/core/roteador.js` | `manual.json: conteúdo, links, rotas e restrição` |
| 67 | EXPLICAR MODO RESTRITO | Ajuda e linguagem de usuário, registro único, IDs, links e aliases | `js/data/manual.js`, `js/core/roteador.js` | `manual.json: conteúdo, links, rotas e restrição` |
| 68 | NÃO EXPOR DETALHES TÉCNICOS DESNECESSÁRIOS | Implementação interna fora da orientação do aluno | `js/data/manual.js` | `manual.json: inspeção de termos privados` |
| 69 | DOCUMENTAÇÃO DO USUÁRIO × TÉCNICA | Ajuda e linguagem de usuário, registro único, IDs, links e aliases | `js/data/manual.js`, `js/core/roteador.js` | `manual.json: conteúdo, links, rotas e restrição` |
| 70 | LINGUAGEM | Ajuda e linguagem de usuário, registro único, IDs, links e aliases | `js/data/manual.js`, `js/core/roteador.js` | `manual.json: conteúdo, links, rotas e restrição` |
| 71 | CONSISTÊNCIA TERMINOLÓGICA | Ajuda e linguagem de usuário, registro único, IDs, links e aliases | `js/data/manual.js`, `js/core/roteador.js` | `manual.json: conteúdo, links, rotas e restrição` |
| 72 | REVISAR TERMOS | Ajuda e linguagem de usuário, registro único, IDs, links e aliases | `js/data/manual.js`, `js/core/roteador.js` | `manual.json: conteúdo, links, rotas e restrição` |
| 73 | NÃO REPETIR DEFINIÇÕES | Ajuda e linguagem de usuário, registro único, IDs, links e aliases | `js/data/manual.js`, `js/core/roteador.js` | `manual.json: conteúdo, links, rotas e restrição` |
| 74 | CONTEÚDO REUTILIZÁVEL | Ajuda e linguagem de usuário, registro único, IDs, links e aliases | `js/data/manual.js`, `js/core/roteador.js` | `manual.json: conteúdo, links, rotas e restrição` |
| 75 | ARQUITETURA DECLARATIVA | Um registro declarativo alimenta home, busca, ajuda e navegação | `js/data/manual.js`, `js/telas/manual.js` | `manual.json: 51 IDs válidos` |
| 76 | NÃO HARD-CODAR NAVEGAÇÃO EM VÁRIOS LUGARES | Ajuda e linguagem de usuário, registro único, IDs, links e aliases | `js/data/manual.js`, `js/core/roteador.js` | `manual.json: conteúdo, links, rotas e restrição` |
| 77 | IDS ESTÁVEIS | Ajuda e linguagem de usuário, registro único, IDs, links e aliases | `js/data/manual.js`, `js/core/roteador.js` | `manual.json: conteúdo, links, rotas e restrição` |
| 78 | ROTAS | Páginas #/manual/<id> e rotas operacionais distintas | `js/core/roteador.js`, `js/data/manual.js` | `manual.json: rotas e navegador` |
| 79 | COMPATIBILIDADE COM LINKS ANTIGOS | Onze aliases de tópicos antigos válidos | `js/data/manual.js`, `docs/PAGINAS-MANUAL.md` | `manual.json: endereços antigos` |
| 80 | NÃO USAR ROTAS DO MANUAL PARA FUNÇÕES | Ajuda e linguagem de usuário, registro único, IDs, links e aliases | `js/data/manual.js`, `js/core/roteador.js` | `manual.json: conteúdo, links, rotas e restrição` |
| 81 | DESKTOP | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 82 | LARGURA DE LEITURA | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 83 | ÍNDICE DESKTOP | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 84 | MOBILE | Índice mobile recolhível, cards em coluna e controles normalizados | `css/manual.css`, `css/mobile-controls.css` | `manual.json`, `mobile-controls.json` |
| 85 | MOBILE — TEXTO | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 86 | MOBILE — CARDS | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 87 | MOBILE — IMAGENS | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 88 | TABLET | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 89 | DESKTOP | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 90 | MOBILE | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 91 | ACESSIBILIDADE E HEADINGS | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 92 | NAVEGAÇÃO POR TECLADO | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 93 | FOCO | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 94 | BUSCA E LEITOR DE TELA | Status aria-live, resultado rotulado, foco em título no submit | `js/telas/manual.js` | `manual.json: teclado e axe` |
| 95 | ACCORDIONS | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 96 | LINKS | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 97 | CONTRASTE | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 98 | REDUCED MOTION | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 99 | ILUSTRAÇÕES ACESSÍVEIS | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 100 | ELEMENTOS DECORATIVOS | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 101 | NÃO DEPENDER DE HOVER | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 102 | BOTÕES | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 103 | ÍCONES | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 104 | BOTÃO “ÁREA DO PROFESSOR” | Layout, teclado, ARIA, foco, temas, toque e professor | `css/manual.css`, `css/mobile-controls.css`, `js/telas/manual.js` | `manual.json: 10 viewports/axe`, `mobile-controls.json: 4 viewports` |
| 105 | IMPRESSÃO DO MANUAL | Tópico completo ou guia rápido linear para papel | `js/telas/manual.js`, `css/manual.css` | `manual.json`, `rc4-manual-*.pdf` |
| 106 | NÃO IMPRIMIR A HOME COMO GRID CONFUSO | Impressão linear, PDF, arquivo único e cache offline | `js/telas/manual.js`, `css/manual.css`, `sw.js` | `manual.json: impressão/offline/file`, `PDFs` |
| 107 | PDF | Impressão linear, PDF, arquivo único e cache offline | `js/telas/manual.js`, `css/manual.css`, `sw.js` | `manual.json: impressão/offline/file`, `PDFs` |
| 108 | AJUDA OFFLINE | Impressão linear, PDF, arquivo único e cache offline | `js/telas/manual.js`, `css/manual.css`, `sw.js` | `manual.json: impressão/offline/file`, `PDFs` |
| 109 | NÃO DEPENDER DE SERVIDOR EXTERNO | Impressão linear, PDF, arquivo único e cache offline | `js/telas/manual.js`, `css/manual.css`, `sw.js` | `manual.json: impressão/offline/file`, `PDFs` |
| 110 | PWA | Impressão linear, PDF, arquivo único e cache offline | `js/telas/manual.js`, `css/manual.css`, `sw.js` | `manual.json: impressão/offline/file`, `PDFs` |
| 111 | STANDALONE | Standalone contém estilos e scripts incluindo contrato mobile | `build_standalone.py`, `SIAB-standalone.html` | `entrega.json`, `manual.json` |
| 112 | FILE:// | Manual e ajuda por file:// sem dependência de HTTP | `SIAB-standalone.html`, `js/telas/manual.js` | `manual.json: arquivo local` |
| 113 | PERFORMANCE | Renderização sob demanda, busca local, histórico e deep links | `js/data/manual.js`, `js/telas/manual.js`, `js/core/roteador.js` | `manual.json: on-demand/Voltar/offline` |
| 114 | BUSCA RÁPIDA | Renderização sob demanda, busca local, histórico e deep links | `js/data/manual.js`, `js/telas/manual.js`, `js/core/roteador.js` | `manual.json: on-demand/Voltar/offline` |
| 115 | NÃO RENDERIZAR TUDO SIMULTANEAMENTE | Renderização sob demanda, busca local, histórico e deep links | `js/data/manual.js`, `js/telas/manual.js`, `js/core/roteador.js` | `manual.json: on-demand/Voltar/offline` |
| 116 | HISTÓRICO DO NAVEGADOR | Renderização sob demanda, busca local, histórico e deep links | `js/data/manual.js`, `js/telas/manual.js`, `js/core/roteador.js` | `manual.json: on-demand/Voltar/offline` |
| 117 | DEEP LINKS | Renderização sob demanda, busca local, histórico e deep links | `js/data/manual.js`, `js/telas/manual.js`, `js/core/roteador.js` | `manual.json: on-demand/Voltar/offline` |
| 118 | AJUDA CONTEXTUAL → DEEP LINK | Renderização sob demanda, busca local, histórico e deep links | `js/data/manual.js`, `js/telas/manual.js`, `js/core/roteador.js` | `manual.json: on-demand/Voltar/offline` |
| 119 | LINKS QUEBRADOS | Renderização sob demanda, busca local, histórico e deep links | `js/data/manual.js`, `js/telas/manual.js`, `js/core/roteador.js` | `manual.json: on-demand/Voltar/offline` |
| 120 | TESTE DA HOME | Ensaios de navegação, conteúdo, visual e regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `tests/results/*.json`, `capturas RC.4` |
| 121 | TESTE DA BUSCA | Ensaios de navegação, conteúdo, visual e regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `tests/results/*.json`, `capturas RC.4` |
| 122 | TESTE DE BUSCA COM ACENTO | Ensaios de navegação, conteúdo, visual e regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `tests/results/*.json`, `capturas RC.4` |
| 123 | TESTE DE RESULTADO INEXISTENTE | Ensaios de navegação, conteúdo, visual e regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `tests/results/*.json`, `capturas RC.4` |
| 124 | TESTE DE MONTAGENS | Ensaios de navegação, conteúdo, visual e regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `tests/results/*.json`, `capturas RC.4` |
| 125 | TESTE DE AJUDA CONTEXTUAL | Ensaios de navegação, conteúdo, visual e regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `tests/results/*.json`, `capturas RC.4` |
| 126 | TESTE DE ATIVIDADE RESTRITA | Ensaios de navegação, conteúdo, visual e regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `tests/results/*.json`, `capturas RC.4` |
| 127 | TESTE DO TOUR | Ensaios de navegação, conteúdo, visual e regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `tests/results/*.json`, `capturas RC.4` |
| 128 | TESTE MOBILE | Ensaios de navegação, conteúdo, visual e regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `tests/results/*.json`, `capturas RC.4` |
| 129 | TESTE DE ACESSIBILIDADE | axe nos três motores e inspeção de foco; leitores reais pendentes | `css/manual.css`, `js/telas/manual.js` | `manual.json: axe`, `docs/LIMITACOES.md` |
| 130 | TESTE DE TEMA | Ensaios de navegação, conteúdo, visual e regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `tests/results/*.json`, `capturas RC.4` |
| 131 | TESTE DE ALTO CONTRASTE | Preferência de alto contraste e cores forçadas | `css/manual.css`, `a11y.js` | `manual.json: contraste/forced colors` |
| 132 | TESTE DALTONISMO | Ensaios de navegação, conteúdo, visual e regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `tests/results/*.json`, `capturas RC.4` |
| 133 | TESTE DE STANDALONE | Ensaios de navegação, conteúdo, visual e regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `tests/results/*.json`, `capturas RC.4` |
| 134 | TESTE OFFLINE | Ensaios de navegação, conteúdo, visual e regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `tests/results/*.json`, `capturas RC.4` |
| 135 | TESTES CIENTÍFICOS | Ensaios de navegação, conteúdo, visual e regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `tests/results/*.json`, `capturas RC.4` |
| 136 | TESTES DE PERMISSÃO | Ensaios de navegação, conteúdo, visual e regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `tests/results/*.json`, `capturas RC.4` |
| 137 | TESTES DO WORKSPACE | Ensaios de navegação, conteúdo, visual e regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `tests/results/*.json`, `capturas RC.4` |
| 138 | NÃO RECONSTRUIR A BANCADA | Workspace RC.3 mantido, apenas texto/ajuda/contrato de controles | `js/ui/workspace.js`, `css/mobile-controls.css` | `workspace.json`, `preservacao-rc3.json` |
| 139 | CAPTURAS DE HOMOLOGAÇÃO | 13 capturas do Manual mais sete capturas específicas de controles mobile | `tests/results/*.png` | `VALIDACAO.md: evidências visuais` |
| 140 | REVISÃO DE CONTEÚDO | Revisão factual RC.3, professor e estado inicial | `js/data/manual.js`, `docs/MANUAL-RC4.md` | `manual.json: auditoria dos textos e tópicos` |
| 141 | MANUAL DEVE DOCUMENTAR RC.3 | Revisão factual RC.3, professor e estado inicial | `js/data/manual.js`, `docs/MANUAL-RC4.md` | `manual.json: auditoria dos textos e tópicos` |
| 142 | TERMINOLOGIA DA NOVA INTERFACE | Revisão factual RC.3, professor e estado inicial | `js/data/manual.js`, `docs/MANUAL-RC4.md` | `manual.json: auditoria dos textos e tópicos` |
| 143 | TEXTO NÃO DEVE EXPLICAR IMPLEMENTAÇÃO | Revisão factual RC.3, professor e estado inicial | `js/data/manual.js`, `docs/MANUAL-RC4.md` | `manual.json: auditoria dos textos e tópicos` |
| 144 | CONTEÚDO DO PROFESSOR | Revisão factual RC.3, professor e estado inicial | `js/data/manual.js`, `docs/MANUAL-RC4.md` | `manual.json: auditoria dos textos e tópicos` |
| 145 | MANUAL DO PROFESSOR | Revisão factual RC.3, professor e estado inicial | `js/data/manual.js`, `docs/MANUAL-RC4.md` | `manual.json: auditoria dos textos e tópicos` |
| 146 | NÃO MISTURAR RESULTADO ESPERADO | Revisão factual RC.3, professor e estado inicial | `js/data/manual.js`, `docs/MANUAL-RC4.md` | `manual.json: auditoria dos textos e tópicos` |
| 147 | MODO PROJETOR | Revisão factual RC.3, professor e estado inicial | `js/data/manual.js`, `docs/MANUAL-RC4.md` | `manual.json: auditoria dos textos e tópicos` |
| 148 | BANCADA LIVRE | Revisão factual RC.3, professor e estado inicial | `js/data/manual.js`, `docs/MANUAL-RC4.md` | `manual.json: auditoria dos textos e tópicos` |
| 149 | ESTADO INICIAL DA BANCADA LIVRE | Nova bancada vazia; sessão salva pode restaurar recipiente | `js/data/manual.js` | `manual.json: primeiros passos`, `regressao.json` |
| 150 | NÃO DOCUMENTAR BUG COMO RECURSO | Revisão factual RC.3, professor e estado inicial | `js/data/manual.js`, `docs/MANUAL-RC4.md` | `manual.json: auditoria dos textos e tópicos` |
| 151 | CHANGELOG | Versionamento, docs técnicos e RC.4 candidata | `CHANGELOG.md`, `VALIDACAO.md`, `docs/IMPLEMENTACAO.md` | `docs/VERIFICACAO-FINAL.json`, `package.json` |
| 152 | VERSIONAMENTO | 1.0.0-rc.4 no pacote, SW, HTML e namespace | `package.json`, `sw.js`, `index.html`, `js/core/namespace.js` | `docs/VERIFICACAO-FINAL.json` |
| 153 | VALIDACAO.MD | Matriz de navegadores/cenários, evidência e limitações | `VALIDACAO.md`, `COMPATIBILIDADE.md` | `tests/results/*.json` |
| 154 | DOCUMENTAÇÃO TÉCNICA | Versionamento, docs técnicos e RC.4 candidata | `CHANGELOG.md`, `VALIDACAO.md`, `docs/IMPLEMENTACAO.md` | `docs/VERIFICACAO-FINAL.json`, `package.json` |
| 155 | NÃO PROMOVER PARA 1.0.0 | RC.4 sem promoção do número para 1.0.0 | `package.json`, `CHANGELOG.md` | `docs/VERIFICACAO-FINAL.json` |
| 156 | CRITÉRIO DE SUCESSO VISUAL | Critérios de sucesso visual, funcional e de regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `manual.json`, `workspace.json`, `mobile-controls.json` |
| 157 | CRITÉRIO DE SUCESSO DE NAVEGAÇÃO | Critérios de sucesso visual, funcional e de regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `manual.json`, `workspace.json`, `mobile-controls.json` |
| 158 | CRITÉRIO DE SUCESSO DE BUSCA | Critérios de sucesso visual, funcional e de regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `manual.json`, `workspace.json`, `mobile-controls.json` |
| 159 | CRITÉRIO DE SUCESSO DE CONTEÚDO | Critérios de sucesso visual, funcional e de regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `manual.json`, `workspace.json`, `mobile-controls.json` |
| 160 | CRITÉRIO DE SUCESSO OPERACIONAL | Critérios de sucesso visual, funcional e de regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `manual.json`, `workspace.json`, `mobile-controls.json` |
| 161 | CRITÉRIO DE SUCESSO CONTEXTUAL | Critérios de sucesso visual, funcional e de regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `manual.json`, `workspace.json`, `mobile-controls.json` |
| 162 | CRITÉRIO DE SUCESSO MOBILE | Critérios de sucesso visual, funcional e de regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `manual.json`, `workspace.json`, `mobile-controls.json` |
| 163 | CRITÉRIO DE SUCESSO DE ACESSIBILIDADE | Critérios de sucesso visual, funcional e de regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `manual.json`, `workspace.json`, `mobile-controls.json` |
| 164 | CRITÉRIO DE REGRESSÃO | Critérios de sucesso visual, funcional e de regressão | `tests/manual.test.cjs`, `tests/mobile-controls.test.cjs` | `manual.json`, `workspace.json`, `mobile-controls.json` |
| 165 | ENTREGA FINAL | ZIP, standalone, hashes e resultados incluídos | `output/SIAB-1.0.0-rc.4.zip`, `output/SIAB-standalone-1.0.0-rc.4.html` | `output/HASHES-SIAB-1.0.0-rc.4.txt` |
| 166 | FLUXO DE EXECUÇÃO | Empacotamento verificável da RC.4 e conclusão do escopo | `build_standalone.py`, `docs/MANUAL-RC4.md` | `docs/VERIFICACAO-FINAL.json`, `HASHES-SIAB-1.0.0-rc.4.txt` |
| 167 | NÃO ACEITAR REFORMA SUPERFICIAL | Empacotamento verificável da RC.4 e conclusão do escopo | `build_standalone.py`, `docs/MANUAL-RC4.md` | `docs/VERIFICACAO-FINAL.json`, `HASHES-SIAB-1.0.0-rc.4.txt` |
| 168 | PRINCÍPIO FINAL DA RC.4 | Empacotamento verificável da RC.4 e conclusão do escopo | `build_standalone.py`, `docs/MANUAL-RC4.md` | `docs/VERIFICACAO-FINAL.json`, `HASHES-SIAB-1.0.0-rc.4.txt` |
| 169 | RESULTADO ESPERADO | Empacotamento verificável da RC.4 e conclusão do escopo | `build_standalone.py`, `docs/MANUAL-RC4.md` | `docs/VERIFICACAO-FINAL.json`, `HASHES-SIAB-1.0.0-rc.4.txt` |

## Complemento obrigatório recebido antes do empacotamento

| Item | Contrato aplicado | Evidência |
|---|---|---|
| Desfazer / Gotejar / Doses | 44 px / flex restante / 76 px; três alturas idênticas | `mobile-controls.json` e quatro capturas de bancada |
| Agitar / Medir pH | Altura, largura, radius, padding e fonte iguais; Agitar sem margem lateral na barra | `mobile-controls.json` |
| Chips e opções | Altura mínima 44 px, espaço 8 px, labels sem compressão | Captura `mobile-montagem.png`; medidas da suíte mobile |
| Instrumentos e análises | Família/seleção 52 px; outros botões e escala pelo menos 44 px; ações de linha cheia 48 px | `mobile-controls.json` e capturas Medir/Dados |
| Quatro larguras | 320×568, 360×800, 390×844, 414×896 em Chromium, Firefox e WebKit | `mobile-controls.json`; quatro capturas `mobile-*-bancada.png` |
| Capturas específicas | Bancada nas quatro larguras, Montagem, Medir e Dados | `tests/results/mobile-*.png` |

Nenhum caso automatizado substitui toque e leitura assistiva em dispositivos físicos. O HTML único usa o mesmo CSS embutido; o projeto modular inclui a folha no precache.
