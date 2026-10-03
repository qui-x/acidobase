# Compatibilidade — SIAB 1.0.0-rc.5

## Correção pontual chevron-1

Acessibilidade e Navegar usam exclusivamente o chevron SVG central. A regra de rotação foi consolidada, o standalone foi reconstruído e o cache passou a `siab-1.0.0-rc.5-chevron-1`, mantendo a versão RC.5. **51 cenários executados nesta correção: 36 focados e 15 de atualização/offline, todos aprovados em Chromium, Firefox e WebKit.**

Veja o [relatório com capturas e DOM](docs/CORRECAO-CHEVRON-RC5.html) e o [relatório técnico](docs/CORRECAO-CHEVRON-RC5.md). `npm run test:chevron` reproduz a nova regressão; a variável `SIAB_CHEVRON_BASELINE_DIR` habilita a atualização a partir do pacote anexado.

Os resultados completos da entrega anterior, descritos abaixo, foram recebidos na base e não representam uma repetição de toda a bateria nesta correção.


Execução em Linux, 03/10/2026, com binários efetivamente instalados e Playwright 1.56.1.

| Ambiente | Evidência | Limite |
|---|---|---|
| Chromium Headless Shell 141.0.7390.37 | 227 cenários aprovados | Não homologa automaticamente Chrome/Edge comerciais |
| Firefox/Gecko 142.0.1 | 227 cenários aprovados | Não substitui sistemas/aparelhos físicos |
| WebKit MiniBrowser 26.0 | 227 cenários aprovados | Não é Safari macOS/iOS |
| Mobile 320×568, 360×800, 390×844, 414×896 | Irmãos, dimensões, painéis e overflow verificados | Toque e viewport simulados |
| Tablet 768×1024 e 1024×768 | Docas, navegação e resize verificados | Orientação física pendente |
| Desktop 1280×720, 1366×768, 1440×900, 1920×1080 | Geometria e expansão verificados | Não é uma matriz de todos os sistemas comerciais |
| PWA/Service Worker | Atualização RC.4.5 → RC.5 e reabertura offline nos três motores | Instalação pelo sistema pendente |
| Standalone por file:// | Fluxos, versão, permissões, Manual e atividade nos três motores | PWA requer localhost/HTTPS |
| Impressão/PDF | Conteúdo nos três motores e três PDFs Chromium | Impressão física pendente |
| Teclado, ARIA e axe | Sem violações detectadas nas telas exercitadas | Não certifica WCAG integral nem leitores de tela reais |

As dependências e os navegadores de teste não são necessários para usar o HTML único. Veja [VALIDACAO.md](VALIDACAO.md) para contagens e [docs/LIMITACOES.md](docs/LIMITACOES.md) para pendências. A conclusão é **APTO PARA HOMOLOGAÇÃO FINAL**, permanecendo RC.5.
