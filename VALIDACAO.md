# Validação — SIAB 1.0.0-rc.5

**Conclusão: APTO PARA HOMOLOGAÇÃO FINAL.** Não houve promoção para 1.0.0. A iconografia aguarda avaliação do usuário; aparelhos físicos e leitores de tela permanecem pendentes, conforme os limites abaixo.

Base: RC.4.5, SHA-256 `82b43e881620f2123cd7fcc9733bdb9112fd2aeb957bc056a756236589ac3a57`. Prompt: `Texto colado(6).txt`, 145 seções. Execução final em **03/10/2026 UTC**, Linux, Playwright 1.56.1, Chromium Headless Shell **141.0.7390.37**, Firefox/Gecko **142.0.1** e WebKit MiniBrowser **26.0**. Os binários foram instalados e executados; não são resultados presumidos.

## Resultados finais

| Suíte | Chromium | Firefox | WebKit | Total | Registro |
|---|---:|---:|---:|---:|---|
| Permissões e contexto RC.2 | 23 | 23 | 23 | 69 | `tests/results/rc2.json` |
| Fluxos gerais | 16 | 16 | 16 | 48 | `tests/results/navegadores.json` |
| Regressão e acessibilidade | 12 | 12 | 12 | 36 | `tests/results/regressao.json` |
| HTTPS, toque e ambiente | 5 | 5 | 5 | 15 | `tests/results/ambiente.json` |
| Impressão e cálculos | 3 | 3 | 3 | 9 | `tests/results/impressao.json` |
| Entrada e standalone | 4 | 4 | 4 | 12 | `tests/results/entrega.json` |
| Workspace e responsividade | 30 | 30 | 30 | 90 | `tests/results/workspace.json` |
| Manual e ajuda | 30 | 30 | 30 | 90 | `tests/results/manual.json` |
| Contrato visual mobile | 37 | 37 | 37 | 111 | `tests/results/mobile-controls.json` |
| Regressões RC.4.5 | 37 | 37 | 37 | 111 | `tests/results/rc45.json` |
| Sessões, iconografia e RC.5 | 25 | 25 | 25 | 75 | `tests/results/rc5.json` |
| Atualização RC.4.5 → RC.5 e offline | 5 | 5 | 5 | 15 | `tests/results/offline-rc5.json` |
| **Total** | **227** | **227** | **227** | **681** | **0 falhas** |

Mais **25 testes científicos**, incluindo validação das **140 substâncias**, **12 verificações de migração** e **18 de compactação**: **55 aprovados, 0 falhas**. Soma: **736 casos aprovados**. Registros: `ciencia.json`, `migracao.json`, `compactacao.json` e `resumo-rc5.json` em `tests/results/`.

A suíte adicional de layout foi aprovada para dez vidrarias/capacidades, 1–10 cartões, projeção, resize, seleção e mobile. Capturas/PDF e integridade do pacote são verificações adicionais, não infladas na contagem de 736. Os JSON finais não registram exceções JavaScript de página não tratadas. Falhas de serviços opcionais foram simuladas deliberadamente e tratadas.

Os nomes RC.2/RC.4.5 nas suítes identificam regressões históricas executadas novamente sobre esta RC.5. Datas individuais constam nos JSON. Falhas preliminares de seletores de teste foram corrigidas para reconhecer a nova escolha de sessão, e as suítes afetadas foram repetidas; apenas resultados finais integram a distribuição.

## Contrato mobile

As quatro larguras foram medidas nos três motores e comparadas visualmente. Todos os cinco controles abaixo têm 44 px de altura; Agitar e Medir pH têm largura igual, radius 6 px, padding 8 × 12 px e margem esquerda 0. O ícone de Agitar foi preservado.

| Viewport | Desfazer | Gotejar | Doses | Agitar = Medir pH |
|---|---:|---:|---:|---:|
| 320×568 | 44 px | 164 px | 76 px | 145 px |
| 360×800 | 44 px | 204 px | 76 px | 165 px |
| 390×844 | 44 px | 234 px | 76 px | 180 px |
| 414×896 | 44 px | 258 px | 76 px | 192 px |

O botão central absorve progressivamente a diferença de largura. O gap entre irmãos é 6 px. Chips mantêm conteúdo sem compressão, padding coerente e intervalo de 8 px. Alvos principais têm mínimo de 44 px, ações inteiras de bottom sheet 48 px e cards de famílias/ferramentas 52 px. Os testes verificam enquadramento, dimensões, radius, padding, gap e continuidade das proporções. Nenhum controle dos cenários medidos excedeu a viewport.

Capturas exigidas: `mobile-320-bancada`, `mobile-360-bancada`, `mobile-390-bancada`, `mobile-414-bancada`, `mobile-montagem`, `mobile-medir` e `mobile-dados`, em PNG. `rc5-mobile-comparacao.png` reúne as quatro larguras. Em 320×568, o recipiente pode exigir rolagem interna da cena; comportamento existente na base, preservado sem refazer a arquitetura.

## Fluxos e relatório

Os 25 cenários RC.5 por motor abrangem Montagem, Missão e Roteiro: sem dados, diálogo com três alternativas, relatório antes de sair, encerramento, Caderno estruturado, finalização, reabertura, cancelamento e nova tentativa sem sobrescrever a anterior. Links legados digital/impresso continuam válidos. As permissões e o contexto restrito também passam nas regressões.

O relatório mantém dez seções e três modos. Foram exercitados dados iniciais/finais, medidas, representações, mistura, campos autorais e linhas 5/10/15/20/25/personalizado, incluindo ajustes independentes e limites 5–60. Histórico e dados brutos permanecem separados da apresentação. Os PDFs `rc5-relatorio-completo.pdf` (3 páginas), `rc5-relatorio-mao.pdf` (4) e `rc5-relatorio-analise.pdf` (4) foram renderizados e inspecionados. A suíte de paginação da base foi reexecutada; a interface não entra na folha impressa. Papel e diálogo nativo por sistema permanecem externos.

## Matriz, ícones e acessibilidade

Dez viewports: **320×568, 360×800, 390×844, 414×896, 768×1024, 1024×768, 1280×720, 1366×768, 1440×900 e 1920×1080**. Verificados docas/painéis, expansão, resize, foco, Enter/Space/Escape, anúncio de pH, fonte 200%, rotação e viewport reduzida para campo de formulário. O zoom 200% foi representado por viewport CSS 683×450 e escala 2 para uma tela 1366×900.

Axe com regras WCAG A/AA aplicáveis não detectou violações nas telas exercitadas; isso não é certificação integral de acessibilidade. Temas claro/escuro, contraste, deuteranopia e movimento reduzido integram as regressões. Inventário de 22 áreas, mesma função/mesmo SVG e nove usos de seta entregues em `docs/ICONOGRAFIA-RC5.html`. A aprovação visual final do usuário não foi presumida.

Foram capturados 37 arquivos na rodada de evidências. Quatro representavam cenas repetidas da bancada mobile e foram removidos do pacote; os **33 screenshots canônicos**, mais a composição comparativa, permanecem na [galeria](docs/EVIDENCIAS-RC5.html). A seleção e os nomes excluídos estão em `tests/results/evidencias-rc5.json`.

## Offline, atualização e standalone

Em cada motor, o teste instalou o cache da **RC.4.5 real**, abriu sessão com medidas, publicou os arquivos RC.5 no servidor temporário, atualizou o Service Worker e recarregou pela notificação. O cache antigo foi descartado; os recursos do novo cache foram comparados byte a byte via SHA-256 com a distribuição; dados e ActivityContext foram preservados.

A página foi fechada e reaberta com o servidor recusando conexões e serviços externos bloqueados. Chromium também usou contexto offline do Playwright. Firefox/WebKit usaram indisponibilidade real do servidor e bloqueio externo, pois a flag offline desses executores impedia a navegação antes do atendimento pelo SW. O teste percorreu as áreas essenciais, experimento, relatório, Professor e reload. Não se declara instalação física de PWA.

O standalone foi reconstruído após as alterações e exercitado por `file://` nos três motores, incluindo permissões, novo ciclo de sessão e serviços opcionais bloqueados. O núcleo usa recursos locais; clima/VLibras são opcionais. Veja [auditoria offline](docs/OFFLINE-RC5.md) e [inventário de dependências](docs/DEPENDENCIAS-RC5.md).

## Integridade e reprodução

31 arquivos preservados foram comparados com SHA-256 contra a RC.4.5 em `docs/PRESERVACAO-RC5.json`. Os manifestos `SHA256SUMS.txt` e `SHA512SUMS.txt` cobrem os arquivos distribuídos, exceto os próprios manifestos. O arquivo externo de hashes cobre ZIP, standalone, inventário visual e validação. Método: Python 3 `hashlib.sha256/sha512`; verificação adicional do conteúdo do ZIP.

Os comandos estão no [README](README.md). O teste de atualização requer a base RC.4.5 extraída, indicada por `SIAB_BASELINE_DIR`.

## Não testado em dispositivo real

Safari/iOS/iPadOS, Android, NVDA, TalkBack, VoiceOver, instalação da PWA pelo sistema, teclado/safe areas físicos, zoom nativo, impressão em papel e desempenho em aparelho limitado. O VLibras teve suas falhas tratadas/testadas, sem homologação da tradução online real. A iconografia foi inspecionada tecnicamente e apresentada para aprovação. Essas pendências constam em [LIMITACOES.md](docs/LIMITACOES.md), sem preenchimento fictício de resultados.
