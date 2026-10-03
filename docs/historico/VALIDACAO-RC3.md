> Histórico de uma rodada anterior. Não descreve a entrega atual. Consulte [VALIDACAO.md](../../VALIDACAO.md) e [RC5.md](../RC5.md). Evidências antigas citadas podem não integrar este pacote.

# Validação — SIAB 1.0.0-rc.3

Executado em **01/10/2026**, sobre a RC.2 entregue. Testes com binários reais em Linux: Chromium Headless Shell 141.0.7390.37 (build 1194), Firefox/Gecko 142.0.1 (1495) e WebKit MiniBrowser 26.0 (2215), distribuídos pelo Playwright 1.56.1. Chromium e dependências foram instalados para a validação.

## Resultados automatizados

| Suíte | Chromium | Firefox | WebKit | Execuções | Evidência |
|---|---:|---:|---:|---:|---|
| Fluxos gerais | 16 | 16 | 16 | 48 | `tests/results/navegadores.json` |
| Regressão e acessibilidade | 12 | 12 | 12 | 36 | `tests/results/regressao.json` |
| Contexto, permissões e compactação RC.2 | 23 | 23 | 23 | 69 | `tests/results/rc2.json` |
| HTTPS, toque, tour e ambiente | 5 | 5 | 5 | 15 | `tests/results/ambiente.json` |
| Impressão | 3 | 3 | 3 | 9 | `tests/results/impressao.json` |
| Menu e standalone final | 4 | 4 | 4 | 12 | `tests/results/entrega.json` |
| Workspace e responsividade RC.3 | 30 | 30 | 30 | 90 | `tests/results/workspace.json` |
| **Total** | **93** | **93** | **93** | **279** | **Sem falhas** |

São 93 cenários executados em três motores. Além deles: **25 testes científicos**, **12 verificações de migração**, **18 testes de compactação** e a suíte de enquadramento (10 vidrarias/capacidades, 1–10 recipientes, seleção, projetor e redimensionamento). O catálogo de 140 substâncias foi revalidado.

## RC.3 — Workspace e Responsividade

| Viewport | Navegador | Funcionalidade | Resultado | Evidência |
|---|---|---|---|---|
| 320×568 | Chromium | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → geometry` |
| 320×568 | Firefox | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → firefox → geometry` |
| 320×568 | WebKit | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → webkit → geometry` |
| 360×800 | Chromium | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → geometry` |
| 360×800 | Firefox | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → firefox → geometry` |
| 360×800 | WebKit | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → webkit → geometry` |
| 390×844 | Chromium | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/rc3-mobile-bancada.png` |
| 390×844 | Firefox | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → firefox → geometry` |
| 390×844 | WebKit | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → webkit → geometry` |
| 414×896 | Chromium | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → geometry` |
| 414×896 | Firefox | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → firefox → geometry` |
| 414×896 | WebKit | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → webkit → geometry` |
| 768×1024 | Chromium | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/rc3-tablet-portrait.png` |
| 768×1024 | Firefox | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → firefox → geometry` |
| 768×1024 | WebKit | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → webkit → geometry` |
| 1024×768 | Chromium | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/rc3-tablet-landscape.png` |
| 1024×768 | Firefox | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → firefox → geometry` |
| 1024×768 | WebKit | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → webkit → geometry` |
| 1280×720 | Chromium | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → geometry` |
| 1280×720 | Firefox | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → firefox → geometry` |
| 1280×720 | WebKit | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → webkit → geometry` |
| 1366×768 | Chromium | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/rc3-desktop-foco.png` |
| 1366×768 | Firefox | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → firefox → geometry` |
| 1366×768 | WebKit | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → webkit → geometry` |
| 1440×900 | Chromium | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → geometry` |
| 1440×900 | Firefox | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → firefox → geometry` |
| 1440×900 | WebKit | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → webkit → geometry` |
| 1920×1080 | Chromium | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → geometry` |
| 1920×1080 | Firefox | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → firefox → geometry` |
| 1920×1080 | WebKit | Bancada, ações, Montagem, Ver, limites e overflow | OK | `tests/results/workspace.json → webkit → geometry` |

As entradas `geometry` registram retângulos reais e largura da página. A verificação de sobreposição considera o recipiente e cada botão experimental, excluindo o padding reservado às docas. Em telas compactas, ações e navegação ficam acessíveis enquanto a região do recipiente pode rolar.

## Interações verificadas

- Montagem recolhida/resumo/controles, família única com várias ferramentas, função única, nenhuma função, fallback e preferências incompatíveis.
- Observar, Medir e Analisar substituem conteúdo; tabela compacta/completa e expansão; gráfico amplo, fullscreen interno e restauração.
- Fechar, Esc, Enter, Space, Tab/Shift+Tab; foco de retorno, inércia, regiões ARIA e axe WCAG 2/2.1 A/AA em docas e painéis inferiores.
- Ações rápidas autorizadas, gotejamento, agitação, leitura estabilizada; abrir/fechar não recria a vidraria/gráfico nem modifica química ou registros.
- Três recipientes, grupos, indicação de foco e troca de tubo conservando ferramenta; 1–10 recipientes na suíte de layout.
- Teclado virtual **simulado** por alteração de `visualViewport.height`, campo visível, rotação e redimensionamento; safe areas definidas em CSS.
- Modo projetor, contraste, cores forçadas e preservação do modo daltônico original.
- Todas as regressões da RC.2 reexecutadas: guardas de rotas/recipientes/recursos, refresh, outra aba, armazenamento incompatível, relatórios, CSV e compactação.
- PWA, cache offline, atualização, HTTPS local, manifesto e standalone por `file://`; menu inicial e marca sobre fundo desfocado continuam funcionais.

## Evidências visuais

Capturas principais (Chromium) em `tests/results/`:

- Tubo em foco: `rc3-desktop-foco.png`.
- Visão geral: `rc3-desktop-visao-geral.png`.
- Montagem aberta: `rc3-desktop-dock-esquerda.png`.
- Doca Medir: `rc3-desktop-medir.png`.
- Doca Analisar: `rc3-desktop-analisar.png`.
- Tabela expandida: `rc3-tabela-expandida.png`.
- Bancada mobile: `rc3-mobile-bancada.png`.
- Montagem mobile: `rc3-mobile-montagem.png`.
- Ver → Medir mobile: `rc3-mobile-ver-medir.png`.
- Dados mobile: `rc3-mobile-dados.png`.
- Tablet portrait: `rc3-tablet-portrait.png`.
- Tablet landscape: `rc3-tablet-landscape.png`.
- Área do Professor: `rc3-professor.png`.
- Modo projetor: `rc3-projetor.png`.

Há capturas adicionais de atividade somente fita, alto contraste e comparação RC.2 × RC.3. O prefixo `rc2-` nos arquivos de regressão identifica a suíte de origem: eles foram gerados novamente executando a RC.3. Somente `rc2-comparacao-*` provém do pacote anterior.

PDFs gerados pelo Chromium: guia do professor, relatório de fita/pHmetro, relatório compactado e versões preenchida/em branco. Revisão visual confirmou papel branco, texto legível, tabelas, campos e rodapés; docas e menus não aparecem. Nos três motores, testes verificaram conteúdo e mídia de impressão.

## Comparação com a RC.2

No cenário HCl 0,0100 mol/L, 1366×768, a região da bancada passou de **706 para 1366 px** de largura (+93,5%); a área interna do palco, de **651,4 para 1318 px** (+102,3%). Os controles com layout visível no workspace caíram de **52 para 15** (−71,2%). São medidas de um cenário controlado, não índices universais de usabilidade. A vidraria aumentou de 183,3 para 197,3 px de altura (+7,7%).

No mobile, os botões visíveis aumentaram de 10 para 13 porque Montagem/Ver/Dados, Agitar e Medir têm acesso direto. A prioridade é a acessibilidade das ações e a substituição dos níveis do painel. A comparação completa e as imagens estão em `docs/COMPARACAO-VISUAL.html` e `comparacao-rc2-rc3.json`.

## Reprodução

```sh
npm ci
npx playwright install --with-deps chromium firefox webkit
npm run build
npm test
npm run test:layout
```

Os testes iniciam seus próprios servidores. `SIAB_TEST_ENGINES` seleciona motores; `SIAB_PLAYWRIGHT_MODULE` e `SIAB_AXE_MODULE` permitem módulos instalados em outro diretório. Ajustes de sandbox dos browsers pertencem apenas à execução automatizada. `tests/results/execucao-final.log` consolida os resultados dos JSON finais.

## Limitações e homologação

Permanecem pendentes aparelhos Android/iOS reais, teclado virtual real, NVDA/VoiceOver/TalkBack, Safari e navegadores comerciais por sistema, instalação nativa da PWA e impressão física. Testes de motor, toque simulado, cache e mídia de impressão não substituem esses ensaios. Nenhuma pendência manual foi marcada como OK.

A entrega permanece **1.0.0-rc.3**, sem promoção para 1.0.0. Arquitetura, auditoria de redundância e limites estão em `docs/WORKSPACE-RC3.md` e `docs/LIMITACOES.md`. A cobertura das 179 orientações está em `docs/COBERTURA-RC3.md`; `preservacao-rc2.json` documenta os arquivos maduros inalterados por SHA-256.
