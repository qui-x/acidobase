# Compatibilidade — SIAB 1.0.0-rc.4.5

| Ambiente verificado | Resultado | Limite da evidência |
|---|---|---|
| Chromium Headless Shell 141.0.7390.37 / Linux / Playwright 1.56.1 | 197 cenários, sem falhas | Não homologa Chrome/Edge comerciais por plataforma |
| Firefox/Gecko 142.0.1 / Linux | 197 cenários, sem falhas | Não substitui aparelhos e versões comerciais |
| WebKit MiniBrowser 26.0 / Linux | 197 cenários, sem falhas | Não é Safari de macOS/iOS |
| Dez viewports 320–1920 px para Manual/workspace | Sem overflow global; foco e limites verificados | Toque, teclado e viewport de teste são simulados |
| Quatro larguras 320/360/390/414 px para controles | Altura mínima, irmãos, proporção e capturas verificados nos três motores | Requer avaliação em aparelhos reais para ergonomia final |
| HTTP, HTTPS local, PWA e cache offline | Inicialização, links, cache e atualização exercitados | Certificado e atualização apenas no ambiente de teste |
| Standalone e entrada modular por file:// | Manual e fluxos funcionais | PWA requer localhost/HTTPS; link file:// não distribui |
| Impressão | Conteúdo nos três motores; PDFs Chromium inspecionados | Papel e impressoras pendentes |
| Teclado, axe, tema, contraste e cores forçadas | Manual e workspace validados | Leitores de tela reais pendentes |

O Chromium foi instalado para executar a validação. Bibliotecas de teste não fazem parte do aplicativo e não são necessárias para abrir o HTML único. Consulte [VALIDACAO.md](VALIDACAO.md) para matriz/capturas e [docs/LIMITACOES.md](docs/LIMITACOES.md) para verificações físicas pendentes. Esta entrega permanece candidata RC.4.5.
