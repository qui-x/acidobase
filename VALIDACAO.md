# Validação final — SIAB 1.0.0

**STATUS: APROVADO**  
**VERSÃO: 1.0.0**  
Data de consolidação: 2026-10-03T23:08:07-03:00 (America/Sao_Paulo).

795 cenários aprovados: 55 verificações não-browser e 740 cenários em navegadores, incluindo 21 cenários da distribuição extraída. As 18 suítes herdadas/adaptadas da RC.5 foram reexecutadas integralmente; os resultados não foram reaproveitados da entrega anterior. A suíte adicional de layout também passou, sem ser somada artificialmente ao contador.

| Suíte | Cenários | Executor | Resultado |
|---|---:|---|---|
| ciencia | 25 | Node | Aprovado |
| migracao | 12 | Node | Aprovado |
| compactacao | 18 | Node | Aprovado |
| rc2 | 69 | Chromium, Firefox, WebKit | Aprovado |
| navegadores | 48 | Chromium, Firefox, WebKit | Aprovado |
| regressao | 36 | Chromium, Firefox, WebKit | Aprovado |
| ambiente | 15 | Chromium, Firefox, WebKit | Aprovado |
| impressao | 9 | Chromium, Firefox, WebKit | Aprovado |
| entrega | 12 | Chromium, Firefox, WebKit | Aprovado |
| workspace | 90 | Chromium, Firefox, WebKit | Aprovado |
| manual | 90 | Chromium, Firefox, WebKit | Aprovado |
| mobile-controls | 111 | Chromium, Firefox, WebKit | Aprovado |
| rc45 | 111 | Chromium, Firefox, WebKit | Aprovado |
| rc5 | 75 | Chromium, Firefox, WebKit | Aprovado |
| offline-rc5 | 15 | Chromium, Firefox, WebKit | Aprovado |
| chevron/resultados | 36 | Chromium, Firefox, WebKit | Aprovado |
| artefatos | 2 | Chromium | Aprovado |
| pacote-extraido | 21 | Chromium, Firefox, WebKit | Aprovado |

O catálogo de 140 substâncias é verificado dentro da suíte científica e comparado nos três motores. Os 25 testes científicos, 12 de migração e 18 de compactação passaram integralmente.

## Cobertura final

- Chromium Headless Shell 141.0.7390.37, Firefox 142.0.1 e WebKit 26.0, binários efetivamente instalados em Linux, via Playwright 1.56.1.
- Navegar/Acessibilidade, chevrons, foco, teclado, fechamento, navegação restrita e compatibilidade de links anteriores.
- Mobile 320×568, 360×800, 390×844 e 414×896: proporções, dimensões entre irmãos, radius, padding, alvos de toque e overflow. Tablet e desktop também cobertos pelas suítes herdadas.
- Relatórios completo, para preencher à mão e análise; conteúdo de impressão nos três motores e PDFs Chromium. Caderno, reabertura, finalização e tentativas independentes.
- Atualização real RC.5 → 1.0.0 no mesmo endereço: cache novo, bytes dos recursos conferidos, cache anterior removido e caches de outro aplicativo/publicação preservados.
- Caderno, nota pessoal, prática finalizada, relatório anterior, atividade do Professor, preferências, sessão ativa e medições preservados na promoção.
- Offline depois de fechar/reabrir: Laboratório, Manual, Montagens, Relatório e Caderno. Chromium em contexto offline; nos três motores, servidor indisponível e HTTPS externo bloqueado.
- Standalone reconstruído e aberto localmente, sem rede: mesma versão, CSS, catálogo, ícones, Manual e ActivityContext; sem manifest/PWA, por definição do formato.
- Distribuição extraída em diretório vazio e servida isoladamente por HTTP. Zero 404 necessários e zero exceções JavaScript não tratadas nos testes finais.
- Manifest, ícones, scope, start_url, cores e SW conferidos; Chromium não reportou erros de instalabilidade via CDP. Isso não equivale à instalação física pelo sistema operacional.

## Limites e método

Não foram testados Safari em macOS/iOS, dispositivos Android/iOS físicos, leitores de tela reais, impressora ou instalação/atualização pela interface nativa do sistema. Emulação não é homologação física. Não se declara certificação WCAG integral.

Durante a preparação do teste do pacote, um script de fixture tentou usar localStorage de uma página vazia no Chromium. O preparo foi restringido a documentos com origem e repetido com aprovação; nenhum código funcional do SIAB foi alterado por isso. A contagem considera somente a execução final aprovada, não repetições ou asserts internos.

Testes, capturas e perfis temporários não acompanham a distribuição. O source conserva testes, instruções de reprodução e documentação consolidada. Hashes finais identificam os arquivos entregues. A RC.5 original permanece intacta.
