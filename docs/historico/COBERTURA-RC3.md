> Histórico de uma rodada anterior. Não descreve a entrega atual. Consulte [VALIDACAO.md](../../VALIDACAO.md) e [RC5.md](../RC5.md). Evidências antigas citadas podem não integrar este pacote.

# Cobertura — 179 orientações da RC.3

Base: RC.2 entregue. A numeração corresponde a Texto colado(2).txt. “Testado” significa execução automatizada no ambiente descrito em VALIDACAO.md; não declara homologação manual.

| Item | Orientação | Situação | Implementação / evidência |
|---:|---|---|---|
| 1 | CONTEXTO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 2 | PRINCÍPIO CENTRAL DA RC.3 | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 3 | NÃO ALTERAR O MOTOR CIENTÍFICO | Preservado e revalidado | `preservacao-rc2.json`, ciência, migração, compactação, `rc2.json` e `workspace.json`. Motor, dados e política maduros inalterados. |
| 4 | PRESERVAR ACTIVITYCONTEXT | Preservado e revalidado | `preservacao-rc2.json`, ciência, migração, compactação, `rc2.json` e `workspace.json`. Motor, dados e política maduros inalterados. |
| 5 | NOVO CONCEITO DE WORKSPACE DESKTOP | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 6 | ÁREA CENTRAL COMO PROTAGONISTA | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 7 | DOCA ESQUERDA — RESPONSABILIDADE | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 8 | DOCA ESQUERDA EM ATIVIDADE RESTRITA | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 9 | ESTADOS DA DOCA ESQUERDA | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 10 | DOCA DIREITA — RESPONSABILIDADE | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 11 | ESTRUTURA DA DOCA DIREITA | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 12 | OBSERVAR | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 13 | MEDIR | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 14 | ANALISAR | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 15 | UMA FAMÍLIA DE CADA VEZ | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 16 | FAMÍLIAS SEM FUNÇÃO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 17 | UMA ÚNICA FUNÇÃO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 18 | NÃO REPETIR INFORMAÇÃO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 19 | RESPONSABILIDADE DE CADA REGIÃO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 20 | CABEÇALHO DO TUBO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 21 | AÇÕES EXPERIMENTAIS PERTO DO OBJETO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 22 | DIFERENCIAR AÇÃO DE CONFIGURAÇÃO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 23 | DOCA DIREITA NÃO É DASHBOARD | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 24 | DOCKPRESENTATION | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 25 | COMPACT | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 26 | STANDARD | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 27 | WIDE | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 28 | FULLSCREEN | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 29 | TABELAS | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 30 | GRÁFICOS | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 31 | FECHAR/RECOLHER | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 32 | REABRIR | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 33 | DESKTOP — POSICIONAMENTO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 34 | TRANSLUCIDEZ | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 35 | CAMADAS | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 36 | NÃO COBRIR OBJETOS IMPORTANTES | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 37 | MOBILE — NÃO COPIAR O DESKTOP | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 38 | MOBILE — ESTRUTURA PRINCIPAL | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 39 | MOBILE — BARRA INFERIOR | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 40 | MONTAGEM MOBILE | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 41 | VER MOBILE | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 42 | NAVEGAÇÃO EM NÍVEIS MOBILE | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 43 | CABEÇALHO DO BOTTOM SHEET | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 44 | DADOS MOBILE | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 45 | AÇÕES RÁPIDAS MOBILE | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 46 | TECLADO VIRTUAL | Implementado; verificação simulada | `visualViewport`, safe areas e orientação; `workspace.json`. Teclado e aparelhos reais pendentes em LIMITACOES.md. |
| 47 | TOUCH TARGETS | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 48 | GESTOS | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 49 | TABLET | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 50 | BREAKPOINTS | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 51 | RESPONSIVIDADE CENTRAL | Verificado nos três motores | Casos identificados por funcionalidade e viewport em `workspace.json`; geometria, overflow, limites, objetos e dados. |
| 52 | VISÃO GERAL DE TUBOS | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 53 | MÚLTIPLOS TUBOS | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 54 | TUBO EM FOCO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 55 | BANDEJA/GRUPO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 56 | INFORMAÇÃO DE GRUPO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 57 | INDICADORES | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 58 | CORES | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 59 | MENU GLOBAL | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 60 | NÃO DUPLICAR MENU GLOBAL E DOCAS | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 61 | ORIENTAÇÕES CONTEXTUAIS | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 62 | BOTÕES DE AJUDA | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 63 | ESTÉTICA | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 64 | TOKENS | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 65 | CONSISTÊNCIA DE BORDAS | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 66 | SOMBRAS | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 67 | TIPOGRAFIA | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 68 | NÚMEROS E MEDIDAS | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 69 | NÃO EXAGERAR NO TAMANHO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 70 | ESPAÇO EM BRANCO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 71 | ANIMAÇÕES | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 72 | VELOCIDADE DAS ANIMAÇÕES | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 73 | ESTADO DAS DOCAS | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 74 | ATIVIDADE RESTRITA E PERSISTÊNCIA | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 75 | ABA NÃO AUTORIZADA SALVA | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 76 | HISTÓRICO | Preservado e revalidado | `preservacao-rc2.json`, ciência, migração, compactação, `rc2.json` e `workspace.json`. Motor, dados e política maduros inalterados. |
| 77 | TABELA | Preservado e revalidado | `preservacao-rc2.json`, ciência, migração, compactação, `rc2.json` e `workspace.json`. Motor, dados e política maduros inalterados. |
| 78 | COMPACTAÇÃO | Preservado e revalidado | `preservacao-rc2.json`, ciência, migração, compactação, `rc2.json` e `workspace.json`. Motor, dados e política maduros inalterados. |
| 79 | TABELA MOBILE | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 80 | COLUNAS MOBILE | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 81 | RELATÓRIO | Preservado e integrado | Relatório em tela própria; Professor mantém formulário e abre aluno no workspace; `rc2.json`, `impressao.json` e `workspace.json`. |
| 82 | IMPRESSÃO | Preservado e integrado | Relatório em tela própria; Professor mantém formulário e abre aluno no workspace; `rc2.json`, `impressao.json` e `workspace.json`. |
| 83 | ÁREA DO PROFESSOR | Preservado e integrado | Relatório em tela própria; Professor mantém formulário e abre aluno no workspace; `rc2.json`, `impressao.json` e `workspace.json`. |
| 84 | ÁREA DO PROFESSOR — CONFIGURAÇÃO | Preservado e integrado | Relatório em tela própria; Professor mantém formulário e abre aluno no workspace; `rc2.json`, `impressao.json` e `workspace.json`. |
| 85 | ABRIR COMO ALUNO | Preservado e integrado | Relatório em tela própria; Professor mantém formulário e abre aluno no workspace; `rc2.json`, `impressao.json` e `workspace.json`. |
| 86 | MODO PROJETOR | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 87 | ACESSIBILIDADE | Implementado e verificado | ARIA, teclado, foco, inércia, anúncios, SVG, ajuda e contraste; `workspace.json`, `rc2.json`. Leitores de tela reais pendentes. |
| 88 | NAVEGAÇÃO POR TECLADO | Implementado e verificado | ARIA, teclado, foco, inércia, anúncios, SVG, ajuda e contraste; `workspace.json`, `rc2.json`. Leitores de tela reais pendentes. |
| 89 | ESC | Implementado e verificado | ARIA, teclado, foco, inércia, anúncios, SVG, ajuda e contraste; `workspace.json`, `rc2.json`. Leitores de tela reais pendentes. |
| 90 | FOCO | Implementado e verificado | ARIA, teclado, foco, inércia, anúncios, SVG, ajuda e contraste; `workspace.json`, `rc2.json`. Leitores de tela reais pendentes. |
| 91 | TAB ORDER | Implementado e verificado | ARIA, teclado, foco, inércia, anúncios, SVG, ajuda e contraste; `workspace.json`, `rc2.json`. Leitores de tela reais pendentes. |
| 92 | LEITOR DE TELA | Implementado e verificado | ARIA, teclado, foco, inércia, anúncios, SVG, ajuda e contraste; `workspace.json`, `rc2.json`. Leitores de tela reais pendentes. |
| 93 | ALTO CONTRASTE | Implementado e verificado | ARIA, teclado, foco, inércia, anúncios, SVG, ajuda e contraste; `workspace.json`, `rc2.json`. Leitores de tela reais pendentes. |
| 94 | COLOR BLIND | Implementado e verificado | ARIA, teclado, foco, inércia, anúncios, SVG, ajuda e contraste; `workspace.json`, `rc2.json`. Leitores de tela reais pendentes. |
| 95 | DESKTOP — TESTE DE DOCA ESQUERDA | Verificado nos três motores | Casos identificados por funcionalidade e viewport em `workspace.json`; geometria, overflow, limites, objetos e dados. |
| 96 | DESKTOP — TESTE DE DOCA DIREITA | Verificado nos três motores | Casos identificados por funcionalidade e viewport em `workspace.json`; geometria, overflow, limites, objetos e dados. |
| 97 | TESTE DE ATIVIDADE SOMENTE MEDIR | Verificado nos três motores | Casos identificados por funcionalidade e viewport em `workspace.json`; geometria, overflow, limites, objetos e dados. |
| 98 | TESTE SEM DOCA ESQUERDA EDITÁVEL | Verificado nos três motores | Casos identificados por funcionalidade e viewport em `workspace.json`; geometria, overflow, limites, objetos e dados. |
| 99 | TESTE DE BANCADA LIVRE | Verificado nos três motores | Casos identificados por funcionalidade e viewport em `workspace.json`; geometria, overflow, limites, objetos e dados. |
| 100 | TESTE DE VISÃO GERAL | Verificado nos três motores | Casos identificados por funcionalidade e viewport em `workspace.json`; geometria, overflow, limites, objetos e dados. |
| 101 | TESTE DE TABELA WIDE | Verificado nos três motores | Casos identificados por funcionalidade e viewport em `workspace.json`; geometria, overflow, limites, objetos e dados. |
| 102 | TESTE DE GRÁFICO WIDE | Verificado nos três motores | Casos identificados por funcionalidade e viewport em `workspace.json`; geometria, overflow, limites, objetos e dados. |
| 103 | TESTES MOBILE | Verificado nos três motores | Casos identificados por funcionalidade e viewport em `workspace.json`; geometria, overflow, limites, objetos e dados. |
| 104 | MOBILE — TESTAR | Implementado; verificação simulada | `visualViewport`, safe areas e orientação; `workspace.json`. Teclado e aparelhos reais pendentes em LIMITACOES.md. |
| 105 | TABLET | Verificado nos três motores | Casos identificados por funcionalidade e viewport em `workspace.json`; geometria, overflow, limites, objetos e dados. |
| 106 | DESKTOP | Verificado nos três motores | Casos identificados por funcionalidade e viewport em `workspace.json`; geometria, overflow, limites, objetos e dados. |
| 107 | OVERFLOW | Verificado nos três motores | Casos identificados por funcionalidade e viewport em `workspace.json`; geometria, overflow, limites, objetos e dados. |
| 108 | SOBREPOSIÇÃO | Verificado nos três motores | Casos identificados por funcionalidade e viewport em `workspace.json`; geometria, overflow, limites, objetos e dados. |
| 109 | CONSOLE | Verificado nos três motores | Casos identificados por funcionalidade e viewport em `workspace.json`; geometria, overflow, limites, objetos e dados. |
| 110 | RESIZE | Verificado nos três motores | Casos identificados por funcionalidade e viewport em `workspace.json`; geometria, overflow, limites, objetos e dados. |
| 111 | ORIENTATION CHANGE | Verificado nos três motores | Casos identificados por funcionalidade e viewport em `workspace.json`; geometria, overflow, limites, objetos e dados. |
| 112 | ESTADO DO EXPERIMENTO | Preservado e revalidado | `preservacao-rc2.json`, ciência, migração, compactação, `rc2.json` e `workspace.json`. Motor, dados e política maduros inalterados. |
| 113 | DESEMPENHO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 114 | LAYOUT SHIFT | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 115 | NÃO RECRIAR OBJETOS | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 116 | CSS | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 117 | NOMENCLATURA | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 118 | COMPONENTIZAÇÃO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 119 | NÃO DUPLICAR IMPLEMENTAÇÃO DESKTOP/MOBILE | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 120 | CONTENT COMPONENTS | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 121 | ACTIVITYCONTEXT E COMPONENTES | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 122 | PWA | Implementado e testado | Cache e namespace RC.3, build determinístico, package-lock, `navegadores.json`, `entrega.json` e `ambiente.json`. |
| 123 | STANDALONE | Implementado e testado | Cache e namespace RC.3, build determinístico, package-lock, `navegadores.json`, `entrega.json` e `ambiente.json`. |
| 124 | FILE:// | Implementado e testado | Cache e namespace RC.3, build determinístico, package-lock, `navegadores.json`, `entrega.json` e `ambiente.json`. |
| 125 | VERSIONAMENTO | Implementado e testado | Cache e namespace RC.3, build determinístico, package-lock, `navegadores.json`, `entrega.json` e `ambiente.json`. |
| 126 | PACKAGE-LOCK | Implementado e testado | Cache e namespace RC.3, build determinístico, package-lock, `navegadores.json`, `entrega.json` e `ambiente.json`. |
| 127 | TESTES CIENTÍFICOS | Preservado e revalidado | `preservacao-rc2.json`, ciência, migração, compactação, `rc2.json` e `workspace.json`. Motor, dados e política maduros inalterados. |
| 128 | CATÁLOGO | Preservado e revalidado | `preservacao-rc2.json`, ciência, migração, compactação, `rc2.json` e `workspace.json`. Motor, dados e política maduros inalterados. |
| 129 | MIGRAÇÃO | Preservado e revalidado | `preservacao-rc2.json`, ciência, migração, compactação, `rc2.json` e `workspace.json`. Motor, dados e política maduros inalterados. |
| 130 | COMPACTAÇÃO | Preservado e revalidado | `preservacao-rc2.json`, ciência, migração, compactação, `rc2.json` e `workspace.json`. Motor, dados e política maduros inalterados. |
| 131 | PERMISSÕES | Preservado e revalidado | `preservacao-rc2.json`, ciência, migração, compactação, `rc2.json` e `workspace.json`. Motor, dados e política maduros inalterados. |
| 132 | ESCAPE DA ATIVIDADE | Preservado e revalidado | `preservacao-rc2.json`, ciência, migração, compactação, `rc2.json` e `workspace.json`. Motor, dados e política maduros inalterados. |
| 133 | BROWSERS | Verificado nos três motores | Casos identificados por funcionalidade e viewport em `workspace.json`; geometria, overflow, limites, objetos e dados. |
| 134 | SCREENSHOTS DE HOMOLOGAÇÃO | Documentado e entregue | Capturas `rc3-*.png`, comparação interativa, WORKSPACE-RC3.md, changelog, VALIDACAO.md e arquivo de hashes externo ao ZIP. |
| 135 | COMPARAÇÃO VISUAL | Documentado e entregue | Capturas `rc3-*.png`, comparação interativa, WORKSPACE-RC3.md, changelog, VALIDACAO.md e arquivo de hashes externo ao ZIP. |
| 136 | TESTE DE REPETIÇÃO | Documentado e entregue | Capturas `rc3-*.png`, comparação interativa, WORKSPACE-RC3.md, changelog, VALIDACAO.md e arquivo de hashes externo ao ZIP. |
| 137 | TOOLTIP | Implementado e verificado | ARIA, teclado, foco, inércia, anúncios, SVG, ajuda e contraste; `workspace.json`, `rc2.json`. Leitores de tela reais pendentes. |
| 138 | ÍCONES | Implementado e verificado | ARIA, teclado, foco, inércia, anúncios, SVG, ajuda e contraste; `workspace.json`, `rc2.json`. Leitores de tela reais pendentes. |
| 139 | BOTÕES | Implementado e verificado | ARIA, teclado, foco, inércia, anúncios, SVG, ajuda e contraste; `workspace.json`, `rc2.json`. Leitores de tela reais pendentes. |
| 140 | HEADER | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 141 | STATUS DE MODO RESTRITO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 142 | FINALIZAR | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 143 | ENCERRAR ATIVIDADE | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 144 | BANCADA INFERIOR | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 145 | LISTA DE TUBOS | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 146 | MUITOS TUBOS | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 147 | INDICAÇÃO DE TUBO ATIVO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 148 | ESTADO "NÃO MEDIDO" | Implementado e verificado | ARIA, teclado, foco, inércia, anúncios, SVG, ajuda e contraste; `workspace.json`, `rc2.json`. Leitores de tela reais pendentes. |
| 149 | AJUDA DE pH | Implementado e verificado | ARIA, teclado, foco, inércia, anúncios, SVG, ajuda e contraste; `workspace.json`, `rc2.json`. Leitores de tela reais pendentes. |
| 150 | RELAÇÃO ENTRE DOCK E BANCADA | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 151 | TROCAR TUBO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 152 | CONTEXTO INVÁLIDO | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 153 | VISÃO GERAL | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 154 | PERFORMANCE MOBILE | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 155 | REDUCED MOTION | Implementado e verificado | ARIA, teclado, foco, inércia, anúncios, SVG, ajuda e contraste; `workspace.json`, `rc2.json`. Leitores de tela reais pendentes. |
| 156 | ÁREA ÚTIL | Implementado; verificação simulada | `visualViewport`, safe areas e orientação; `workspace.json`. Teclado e aparelhos reais pendentes em LIMITACOES.md. |
| 157 | SCROLL | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 158 | BOTTOM SHEET | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 159 | DRAG DO BOTTOM SHEET | Alternativa explícita implementada | Arrasto e resize manual são opcionais. Fechar, Expandir, Restaurar e larguras responsivas cobrem as operações. |
| 160 | DESKTOP DOCK RESIZE | Alternativa explícita implementada | Arrasto e resize manual são opcionais. Fechar, Expandir, Restaurar e larguras responsivas cobrem as operações. |
| 161 | DOCK WIDE | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 162 | FULLSCREEN PANEL | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 163 | MODAL | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 164 | DOCK | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 165 | BOTTOM SHEET | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 166 | CRITÉRIO DE SUCESSO DESKTOP | Implementado e testado | `js/ui/workspace.js`, `css/workspace.css`, renderizadores RC.2 e `tests/workspace.test.cjs`; detalhes em WORKSPACE-RC3.md. |
| 167 | CRITÉRIO DE SUCESSO MOBILE | Implementado e testado | Conteúdo compartilhado em bottom sheet, barra contextual, níveis, scroll local e adaptação compacta/média; `workspace.json`. |
| 168 | CRITÉRIO DE SUCESSO DE PERMISSÕES | Preservado e revalidado | `preservacao-rc2.json`, ciência, migração, compactação, `rc2.json` e `workspace.json`. Motor, dados e política maduros inalterados. |
| 169 | CRITÉRIO DE SUCESSO CIENTÍFICO | Preservado e revalidado | `preservacao-rc2.json`, ciência, migração, compactação, `rc2.json` e `workspace.json`. Motor, dados e política maduros inalterados. |
| 170 | CRITÉRIO DE SUCESSO DE REGRESSÃO | Preservado e revalidado | `preservacao-rc2.json`, ciência, migração, compactação, `rc2.json` e `workspace.json`. Motor, dados e política maduros inalterados. |
| 171 | NÃO PROMOVER PARA 1.0.0 DURANTE IMPLEMENTAÇÃO | Implementado e testado | Cache e namespace RC.3, build determinístico, package-lock, `navegadores.json`, `entrega.json` e `ambiente.json`. |
| 172 | CHANGELOG | Documentado e entregue | Capturas `rc3-*.png`, comparação interativa, WORKSPACE-RC3.md, changelog, VALIDACAO.md e arquivo de hashes externo ao ZIP. |
| 173 | VALIDACAO.MD | Documentado e entregue | Capturas `rc3-*.png`, comparação interativa, WORKSPACE-RC3.md, changelog, VALIDACAO.md e arquivo de hashes externo ao ZIP. |
| 174 | DOCUMENTAÇÃO TÉCNICA | Documentado e entregue | Capturas `rc3-*.png`, comparação interativa, WORKSPACE-RC3.md, changelog, VALIDACAO.md e arquivo de hashes externo ao ZIP. |
| 175 | ENTREGA FINAL | Documentado e entregue | Capturas `rc3-*.png`, comparação interativa, WORKSPACE-RC3.md, changelog, VALIDACAO.md e arquivo de hashes externo ao ZIP. |
| 176 | EXECUÇÃO | Documentado e entregue | Capturas `rc3-*.png`, comparação interativa, WORKSPACE-RC3.md, changelog, VALIDACAO.md e arquivo de hashes externo ao ZIP. |
| 177 | NÃO ACEITAR CORREÇÃO PARCIAL | Documentado e entregue | Capturas `rc3-*.png`, comparação interativa, WORKSPACE-RC3.md, changelog, VALIDACAO.md e arquivo de hashes externo ao ZIP. |
| 178 | PRINCÍPIO FINAL DA RC.3 | Documentado e entregue | Capturas `rc3-*.png`, comparação interativa, WORKSPACE-RC3.md, changelog, VALIDACAO.md e arquivo de hashes externo ao ZIP. |
| 179 | RESULTADO ESPERADO | Documentado e entregue | Capturas `rc3-*.png`, comparação interativa, WORKSPACE-RC3.md, changelog, VALIDACAO.md e arquivo de hashes externo ao ZIP. |
