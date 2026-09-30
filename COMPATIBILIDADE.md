# Matriz de compatibilidade — SIAB 1.0.0-rc.1

Execução em **Ubuntu 24.04.3 LTS, x86_64**, com os binários reais de teste do Playwright 1.56.1 instalados para esta validação. Modo headless. O Chromium foi baixado e instalado explicitamente; não se usou apenas uma prévia estática.

| Motor/binário executado | Versão observada |
|---|---|
| Chromium Headless Shell | 141.0.7390.37, build Playwright 1194 |
| Firefox / Gecko de teste | 142.0.1, build Playwright 1495 |
| WebKit MiniBrowser de teste | 26.0, build Playwright 2215 |

## Resultados efetivamente executados

| Recurso | Chromium | Gecko/Firefox | WebKit |
|---|---|---|---|
| Inicialização e rotas públicas | OK | OK | OK |
| 35 Roteiros, cobertura de 140 soluções | OK | OK | OK |
| 19 Missões e 14 Temas | OK | OK | OK |
| Fita, pHmetro pontual/contínuo e estabilização | OK | OK | OK |
| VER, temperatura e condutividade | OK | OK | OK |
| Comparação, vínculo, mistura e desfazer | OK | OK | OK |
| Prever e gotejar e registro voluntário | OK | OK | OK |
| Professor, criação e duplicação de links | OK | OK | OK |
| Restrição, URL direta, módulo, instrumentos | OK | OK | OK |
| Recarga, outra aba e bancada livre preservada | OK | OK | OK |
| Relatórios, Caderno e CSV | OK | OK | OK |
| CSS e conteúdo de impressão | OK | OK | OK |
| PDF A4 preenchido e em branco | OK | Pendente de impressão nativa | Pendente de impressão nativa |
| Offline após cache, servidor indisponível | OK | OK | OK |
| HTML único por file:// | OK | OK | OK |
| HTTPS local, contexto seguro e token | OK com limitação¹ | OK com limitação¹ | OK com limitação¹ |
| Larguras 320, 360, 390, 414, 768, 1024, 1366, 1920 e 2560 px | OK | OK | OK |
| Toque simulado em 390 px | OK com limitação² | OK com limitação² | OK com limitação² |
| Teclado, diálogos e cinco passos do tour | OK | OK | OK |
| Animação de abertura e redução de movimento | OK | OK | OK |
| Falha de armazenamento e clima indisponível | OK com limitação³ | OK com limitação³ | OK com limitação³ |
| axe WCAG 2 A/AA, rotas principais | OK com limitação⁴ | OK com limitação⁴ | OK com limitação⁴ |
| 10 recipientes e lote de 500 gotas | OK | OK | OK |
| PWA instalada pelo sistema operacional | Pendente | Pendente | Pendente |

¹ Servidor TLS local com certificado de teste aceito no contexto de automação. Não é uma publicação em domínio HTTPS real nem validação de cadeia de certificados de produção.

² Emulação de viewport e eventos de toque; não substitui teclado virtual, orientação, barras móveis, GPU ou limitações de um aparelho Android/iOS.

³ Armazenamento bloqueado mantém a sessão em memória e mostra aviso; consulta meteorológica abortada retorna 25 °C/manual. Não se testou a disponibilidade real do serviço meteorológico em todas as redes.

⁴ Varredura automática nas rotas Início, Roteiros, Professor e Laboratório, somada a navegação por teclado. Não equivale a auditoria completa de WCAG nem leitura com NVDA/VoiceOver/TalkBack. Detalhes e eventuais apontamentos estão nos JSON.

## Evidência e reprodução

- `tests/results/navegadores.json`: 16 cenários por motor, 48 execuções.
- `tests/results/regressao.json`: 12 cenários por motor, 36 execuções, comparação científica, acessibilidade e desempenho.
- `tests/results/ambiente.json`: cinco cenários por motor, 15 execuções, incluindo HTTPS local e toque.
- `tests/results/impressao.json`: três cenários por motor, nove execuções.
- `tests/results/execucao-final.log`: saída da bateria, ciência, migração e layout.
- PNGs: telas reais nas larguras indicadas; PDFs: impressões geradas no Chromium com dados fictícios.

Total: **108 cenários de navegador**, além de **25 testes científicos**, **12 verificações de migração** e uma bateria de layout com 10 vidrarias/capacidades, 1–10 recipientes, projetor e celular. Os números de cenários não representam 108 funcionalidades diferentes; incluem a repetição intencional nos três motores.

O teste offline interrompe as respostas do servidor depois de o service worker controlar a página. Uma tentativa anterior com a API de desconexão do Playwright gerou erro interno no WebKit; o teste foi repetido cortando a rede no servidor, com êxito. Essa diferença de método está registrada, não foi convertida em homologação por suposição.

A impressão foi inspecionada em PDF. Layout e áreas de escrita foram conferidos por renderização. O teste de carga mede uma operação em lote; não afirma 60 fps em aparelhos móveis nem ausência de todo vazamento de memória.

## Navegadores comerciais e plataformas

| Alvo do prompt | Homologação oficial desta entrega |
|---|---|
| Chrome / Edge, Windows e macOS, versão atual e anterior | Pendente; não inferida de Chromium |
| Firefox comercial, Windows/macOS, versão atual e anterior | Pendente; o teste foi da distribuição automatizada em Linux |
| Safari macOS | Pendente; não inferida de WebKit |
| Safari iPhone/iPad | Pendente |
| Chrome Android / Samsung Internet | Pendente |
| PWA instalada e atualização entre versões | Pendente nos sistemas reais |

**Nenhum navegador comercial foi declarado oficialmente homologado por esta entrega.** Os três motores listados acima têm validação automatizada no ambiente descrito. `1.0.0-rc.1` conserva essa distinção.

Classificação: **OK** = caso executado passou; **OK com limitação** = passou dentro do escopo indicado; **Não suportado** = API ausente comprovada, como service worker/PWA em file://; **Falha** = caso reprovado. **Pendente** indica que não houve execução e não deve ser convertido em OK ou Não suportado.

Para liberar 1.0.0, execute as verificações de `docs/LIMITACOES.md` e complete a matriz com aparelho, sistema, navegador, versão, data e evidência real.
