# Compatibilidade — SIAB 1.0.0-rc.3

| Ambiente executado | Resultado | Limite da evidência |
|---|---|---|
| Chromium 141.0.7390.37 / Linux / Playwright 1.56.1 | 93 cenários, sem falhas | Não homologa automaticamente Chrome/Edge de outros sistemas |
| Firefox/Gecko 142.0.1 / Linux | 93 cenários, sem falhas | Não substitui aparelhos e versões comerciais |
| WebKit MiniBrowser 26.0 / Linux | 93 cenários, sem falhas | Não é Safari em macOS/iOS |
| 320–1920 px, incluindo tablet e rotação | Sem overflow global; limites de doca e ações verificados | Toque, teclado e área visível simulados |
| HTTP local e HTTPS local | Inicialização e links funcionais | Certificado local somente nos testes |
| PWA/service worker | Cache, offline e atualização verificados | Instalação pelo sistema operacional pendente |
| Standalone e entrada modular por file:// | Fluxos compatíveis testados | Sem instalação PWA; compartilhamento exige URL comum |
| Impressão | Conteúdo nos três motores; PDF Chromium revisado | Impressora física pendente |
| Teclado, axe, contraste e cores forçadas | Verificados no workspace | Leitores de tela reais pendentes |

O Chromium foi instalado para a execução; suas dependências e as de Firefox/WebKit estão fora do pacote do aplicativo. Não há dependência de browser automatizado para usar o SIAB.

A matriz por viewport, caso e arquivo de evidência está em [VALIDACAO.md](VALIDACAO.md). Os resultados completos estão em `tests/results`. A versão permanece candidata RC.3; nenhum navegador comercial em plataforma não testada foi declarado oficialmente homologado.
