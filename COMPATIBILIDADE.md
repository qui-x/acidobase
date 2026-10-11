# Compatibilidade — SIAB 1.0.0

Data: 2026-10-03T23:08:07-03:00. Execução Linux com Playwright 1.56.1. Consulte [VALIDACAO.md](VALIDACAO.md).

| Ambiente | Evidência executada | Limite |
|---|---|---|
| Chromium Headless Shell 141.0.7390.37 | 248 cenários browser aprovados, PDF e zero erros de instalabilidade CDP | Não é homologação de Chrome/Edge em todos os sistemas |
| Firefox 142.0.1 | 246 cenários aprovados | Sem aparelhos físicos |
| WebKit MiniBrowser 26.0 | 246 cenários aprovados | Não é Safari macOS/iOS |
| Mobile 320×568, 360×800, 390×844, 414×896 | Dimensões, irmãos, touch targets, painéis e overflow | Viewport/toque emulados |
| Tablet 768×1024, 1024×768; desktop 1280–1920 px | Docas, resize, navegação e geometria | Sem rotação física |
| PWA e offline | SW, manifest, atualização RC.5 → 1.0.0, cache isolado e reabertura sem rede | Instalação nativa pelo sistema não testada |
| Standalone local | Versão, ciência, estilos, ícones, Manual, relatórios e atividades | Sem instalação PWA |
| Impressão/PDF | Conteúdo nos três motores e PDFs Chromium | Sem impressão física |
| Teclado, ARIA e axe | Suítes aprovadas nas telas exercitadas | Não substitui leitores de tela reais |

Aplicação sem dependência essencial de internet. Clima e VLibras opcionais requerem rede. Leia [LIMITACOES.md](docs/LIMITACOES.md) para os limites científicos, de armazenamento e de plataforma.
