# Validação da correção — SIAB 1.0.0

Validação focal realizada em 11/10/2026, com Chromium 143.0.7499.0 e Playwright 1.62.1 em Linux.

- 13 cenários aprovados; zero exceções JavaScript e zero respostas HTTP de erro nos recursos solicitados.
- Casos A–C em 320×568, 360×800, 375×667, 390×844 e 414×896: uma gota, sequência contínua, pH após estabilização, leitura anterior, expiração do aviso, nomes curtos/longos e retenção dos registros.
- Toque para rolar, expansão de Doses e variação de altura; toque seguido de Enter e Espaço; fita, pHmetro contínuo, tabela, histórico e relatório; meia gota, capacidade parcial, tubos vinculados e desfazer.
- Paisagem 844×390 e 568×320: vidraria dentro da área visível, sem invadir seleção/navegação, estável ao gotejar e medir. Na paisagem estreita, os controles têm rolagem própria.
- Tema escuro, texto a 150%, preferência por movimento reduzido e atributos do anúncio acessível. Isso não equivale a auditoria WCAG ou teste com leitor de tela real.
- Desktop 1440×1000: geometria e captura idênticas à base no cenário comparado, com mesmo resultado químico.
- Atualização da publicação 1.0.0 anterior para a corrigida, ativação do novo service worker, remoção do cache anterior, retenção das medições e reabertura offline.

Firefox/Gecko e Safari/WebKit não estavam disponíveis nesta rodada. Aparelhos físicos, instalação pelo sistema, leitores de tela e impressão não foram homologados. A suíte histórica de 795 cenários não foi reexecutada; os arquivos científicos, de armazenamento e de relatórios foram preservados por comparação de bytes. O relatório externo contém causa, arquivos, capturas reais e SHA-512 do ZIP.

## Revalidação na publicação oficial — 16/10/2026

Chromium 141.0.7390.37 com Playwright 1.56.1 em Linux, viewports emulados com toque. Roteiro aplicado à versão modular e ao `SIAB-1.0.0-standalone.html`, com o mesmo resultado.

- Retrato 320×568, 360×800, 375×667, 390×844 e 414×896; paisagem 844×390 e 568×320. Um toque goteja uma gota. Segurar produz uma única sequência, e o clique atrasado do toque não acrescenta gota. Enter goteja uma gota e Espaço segurado goteja continuamente.
- O aviso "Adicionado" consolida a sequência e fica fora do desenho. A vidraria (tubo, béquer, erlenmeyer) fica dentro da área visível e não muda de tamanho ao gotejar, medir, trocar o reagente ou mostrar o aviso. Nome longo aparece com reticências, e Visão geral esconde o aviso.
- A página não rola ao tocar no conta-gotas: corrigida a rolagem de 1 px causada pela região de anúncios para leitores de tela.
- Computador 1440×1000, 1360×900 e 1024×768: o clique goteja uma gota e o duplo clique, duas. Enter e a ativação programática gotejam uma gota cada, sem aviso mobile.
- Atualização real no mesmo endereço, da publicação 1.0.0 anterior (cache `siab-1.0.0`) para esta (`siab-1.0.0+20261012`). O aviso Recarregar aparece e o cache anterior é removido. As 7 gotas e as 3 medições foram preservadas, e a reabertura offline usa o código corrigido.
- Standalone aberto como arquivo e por HTTP: versão 1.0.0 e 140 substâncias. Sem manifesto, service worker, pedidos externos ou erros.
- Todas as telas em 1360×900 e 390×844 abrem sem erros de console.

Firefox e WebKit não estavam disponíveis nesta rodada. Isso não substitui aparelhos físicos.

## Registro histórico fornecido com a base 1.0.0

O conteúdo abaixo veio no pacote original e documenta a validação daquela versão, antes da correção da bancada mobile.

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
