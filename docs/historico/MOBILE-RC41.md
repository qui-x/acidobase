> Histórico de uma rodada anterior. Não descreve a entrega atual. Consulte [VALIDACAO.md](../../VALIDACAO.md) e [RC5.md](../RC5.md). Evidências antigas citadas podem não integrar este pacote.

# Auditoria visual mobile — 1.0.0-rc.4.1

Esta revisão complementa a RC.4. O ZIP e o arquivo único anteriores já continham uma primeira regra de altura para botões, mas a suíte antiga media sobretudo a bancada e duas docas. A medição de mais telas encontrou links de navegação e ajuda abaixo de 44 px.

## Contrato aplicado

| Grupo | Dimensão no mobile | Verificação |
|---|---|---|
| Desfazer | 44 × 44 px | Ícone com área de toque completa |
| Segure para gotejar | Altura 44 px, `flex: 1 1 0` | Recebe o espaço que sobra, sem mínimo arbitrário |
| Doses | 76 × 44 px | Largura estável nas quatro viewports |
| Agitar e Medir pH | 44 px de altura, metades iguais da linha | `padding: 8px 12px`, radius 6 px e `margin-left: 0`; ícone preservado |
| Botão padrão, chip, segmentado e opções | Altura mínima 44 px | Labels inteiros atuam como alvo; desenhos internos de radio/checkbox continuam pequenos |
| Ação que ocupa uma linha inteira da doca | Altura mínima 48 px | Histórico, Tabela, Abrir relatório, Aplicar medidas |
| Família ou ferramenta apresentada como card | Altura mínima 52 px | Seleção nas etapas de Ver |

O mesmo contrato alcança `.chip`, `.capacidade-opcoes label`, `.segmented label`, `.opcoes-tubo .opcao`, `.fontstep-btn`, `.ordenar-ph-btn`, `.ver-acoes button`, `.grafico-modos button`, `.lupa-escala` e `.overview-heading-actions button`. A revisão adicional normalizou links do Manual, a ajuda de Montagem e a marca do cabeçalho. Na navegação inferior, o botão Montagem recebeu espaço interno ajustado até 370 px para caber sem recorte. O botão Buscar no Manual não encolhe no Firefox; o campo absorve a diferença.

## Medidas da barra e das ações irmãs

| Viewport | Desfazer | Gotejar | Doses | Agitar | Medir pH | Altura dos cinco |
|---|---:|---:|---:|---:|---:|---:|
| 320×568 | 44 | 164 | 76 | 145 | 145 | 44 px |
| 360×800 | 44 | 204 | 76 | 165 | 165 | 44 px |
| 390×844 | 44 | 234 | 76 | 180 | 180 | 44 px |
| 414×896 | 44 | 258 | 76 | 192 | 192 | 44 px |

Entre larguras vizinhas, o ganho da ação central equivale ao ganho da viewport; Desfazer e Doses permanecem estáveis. Agitar e Medir pH também têm fonte, borda e espaçamento internos iguais. Os valores são medições do Chromium; os mesmos critérios são afirmados pela suíte em Chromium, Firefox e WebKit.

## Evidência e reprodução

`tests/mobile-controls.test.cjs` testa as quatro viewports, 37 cenários por motor. Mede larguras, alturas, proporção, margem, radius, fonte, padding, alinhamento, intervalo, conteúdo recortado, limites da viewport e overflow horizontal. Percorre bancada, Montagem, capacidades, Medir, Dados, visão geral, gaveta e onze rotas incluindo Manual e Professor. Um input invisível de radio/checkbox é avaliado pelo respectivo label clicável, sem aumentar o desenho decorativo.

Uma varredura complementar de vinte estados por largura encontrou **21 instâncias** de alvos menores que 44 px na RC.4 e **zero** na RC.4.1. São instâncias repetidas entre estados, não 21 componentes diferentes. A sonda anterior não conseguiu abrir a etapa Partículas por um problema de sequência da própria sonda; a suíte oficial e a sonda corrigida cobrem essa etapa. Os totais e a ressalva estão em `tests/results/auditoria-rc41.json`.

As capturas finais são `mobile-320-bancada.png`, `mobile-360-bancada.png`, `mobile-390-bancada.png`, `mobile-414-bancada.png`, `mobile-montagem.png`, `mobile-medir.png` e `mobile-dados.png`, em `tests/results/`. As quatro capturas anteriores da RC.4 foram guardadas como `mobile-*-antes-rc4.png`. A comparação visual das quatro larguras confirmou a mesma família de controles, textos legíveis e nenhum controle sobreposto ou fora da tela. Em 320×568, a cena do tubo mantém a rolagem interna já documentada na RC.3; as ações permanecem visíveis.

Reprodução: `npm run build`, `npm test` e `npm run test:layout`, após `npm ci` e a instalação dos navegadores do Playwright. A homologação em aparelhos reais permanece descrita em `docs/LIMITACOES.md`.
