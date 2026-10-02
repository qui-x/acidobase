# Validação — SIAB 1.0.0-rc.4.5

Base: `SIAB(2).zip`, RC.4.1. Esta rodada implementa os 118 itens documentados em [docs/COBERTURA-RC45.md](docs/COBERTURA-RC45.md). Não há promoção para 1.0.0.

Testes executados em 02/10/2026 UTC, em Linux, com binários reais instalados: **Chromium Headless Shell 141.0.7390.37**, **Firefox/Gecko 142.0.1** e **WebKit MiniBrowser 26.0**, via Playwright 1.56.1. As datas individuais constam nos JSON. Os testes foram executados por suíte; as suítes afetadas por correções foram repetidas.

## Resultados

| Suíte | Chromium | Firefox | WebKit | Execuções | Registro |
|---|---:|---:|---:|---:|---|
| Permissões e contexto RC.2 | 23 | 23 | 23 | 69 | `tests/results/rc2.json` |
| Fluxos gerais | 16 | 16 | 16 | 48 | `tests/results/navegadores.json` |
| Regressão e acessibilidade | 12 | 12 | 12 | 36 | `tests/results/regressao.json` |
| HTTPS, toque, tour e ambiente | 5 | 5 | 5 | 15 | `tests/results/ambiente.json` |
| Impressão e cálculos | 3 | 3 | 3 | 9 | `tests/results/impressao.json` |
| Entrada, standalone e PWA | 4 | 4 | 4 | 12 | `tests/results/entrega.json` |
| Workspace e responsividade | 30 | 30 | 30 | 90 | `tests/results/workspace.json` |
| Manual e ajuda | 30 | 30 | 30 | 90 | `tests/results/manual.json` |
| Contrato visual mobile | 37 | 37 | 37 | 111 | `tests/results/mobile-controls.json` |
| Refinamentos RC.4.5 | 37 | 37 | 37 | 111 | `tests/results/rc45.json` |
| **Total** | **197** | **197** | **197** | **591** | **Sem falhas ou erros de página nos registros finais** |

Além dos casos de navegador: **25 testes científicos cobrindo 140 substâncias**, **12 verificações de migração** e **18 testes de compactação**, registrados em `tests/results/ciencia.json` e `unitarios-rc45.log`. A suíte de layout passou para 10 vidrarias/capacidades, 1–10 cartões, projeção, seleção, redimensionamento e celular (`layout-rc45.log`). `execucao-rc45.log` consolida os resultados finais dos JSON, com suas datas.

Quinze arquivos do núcleo químico, catálogo, permissões, persistência, abertura e símbolo oficial permanecem idênticos à base, conforme `preservacao-rc45.json`. Os metadados adicionados aos instrumentos não mudam o cálculo de leituras. O empacotamento verifica hashes, ativos do service worker e reprodução do standalone.

## Controles mobile

Auditoria em **320×568, 360×800, 390×844 e 414×896**, nos três motores. Foram comparados altura, largura, radius, padding, margem e fonte de controles irmãos; alvos interativos, espaçamentos e enquadramento. O teste também exige progressão contínua da largura do botão central entre as quatro telas.

| Largura | Desfazer | Gotejar | Doses | Agitar = Medir pH (largura) | Altura dos cinco controles |
|---|---:|---:|---:|---:|---:|
| 320 px | 44 px | 164 px | 76 px | 145 px | 44 px |
| 360 px | 44 px | 204 px | 76 px | 165 px | 44 px |
| 390 px | 44 px | 234 px | 76 px | 180 px | 44 px |
| 414 px | 44 px | 258 px | 76 px | 192 px | 44 px |

Agitar e Medir pH têm `margin-left:0`, radius de 6 px, padding de 8 × 12 px e a mesma fonte. A nova família de botões herda a fonte da aplicação. As ações da barra têm gap de 6 px; chips usam 8 px de intervalo. Controles principais móveis têm alvo mínimo de 44 px; ações inteiras do bottom sheet, 48 px; cards de seleção mantêm 52 px. Elementos decorativos não são ampliados.

As quatro capturas de bancada e os painéis Montagem, Medir e Dados foram comparados visualmente. Não há controles fora da viewport, sobreposição de ações ou compressão de rótulos nas telas verificadas. Em 320×568, a cena central pode rolar para mostrar o recipiente; essa adaptação já existente foi mantida, com as ações e a navegação disponíveis.

Evidências: `mobile-320-bancada.png`, `mobile-360-bancada.png`, `mobile-390-bancada.png`, `mobile-414-bancada.png`, `mobile-montagem.png`, `mobile-medir.png`, `mobile-dados.png`. Composições para comparação: `rc45-mobile-comparacao.png` e `rc45-mobile-paineis.png`. Os arquivos estão em `tests/results/`; a [galeria](docs/EVIDENCIAS-RC45.html) abre as capturas originais.

## Relatório, atividades e navegação

Os 37 cenários novos por motor verificam bancada vazia, água como padrão genérico, restauração de HCl escolhido, montagens/visualização, comparador oficial, arco-íris sem anotações automáticas, duplicação/edição/exclusão com UUID e persistência, confirmação de notas, menu contextual/restrito e reutilização dos ícones SVG.

Os três modos de relatório mantêm os dados automáticos e distinguem texto autoral. A análise permite selecionar conteúdo e usar dados hipotéticos identificados, sem alterar as medições. Há teste específico de concentração declarada e composição de misturas. As linhas são verificadas em 5, 10, 15, 20, 25, valor personalizado e configuração por campo; os limites 5–60 também são exercitados.

A amostra `rc45-relatorio-25-linhas.pdf` foi renderizada e inspecionada em todas as **7 páginas A4**. A contagem vetorial encontrou **125 linhas de resposta completas**: 31, 36, 33 e 25 nas páginas 4 a 7, respectivamente. A análise continua na página seguinte. Gráficos mantêm legendas, tabelas continuam legíveis e controles da interface não são impressos. Detalhes e hash do PDF em `pdf-layout-rc45.json`.

A suíte simula o encerramento do diálogo de impressão com o evento `afterprint` nos três motores; assim a cópia temporária da folha é retirada também onde a API de geração de PDF não está disponível.

## Matriz de apresentação

Dez viewports: **320×568, 360×800, 390×844, 414×896, 768×1024, 1024×768, 1280×720, 1366×768, 1440×900 e 1920×1080**. Temas claro, escuro, alto contraste e filtro de deuteranopia; teclado, foco, fonte ampliada e axe nas suítes Manual/workspace. O Manual contém 52 tópicos em 13 categorias, incluindo Referências científicas.

PWA/cache offline, HTTPS local e arquivo único por `file://` foram exercitados nos três motores. O teste de indisponibilidade do clima usa o contexto realmente offline, incluindo requisições mediadas pelo service worker.

## Reproduzir

```sh
npm ci
npx playwright install --with-deps chromium firefox webkit
npm run build
npm test
npm run test:layout
```

As suítes iniciam servidores locais temporários. `SIAB_TEST_ENGINES` limita motores; `SIAB_PLAYWRIGHT_MODULE` e `SIAB_AXE_MODULE` permitem dependências externas à pasta. O runtime de testes não é necessário para usar o aplicativo e não integra o ZIP.

## Limites da homologação

A evidência é de motores em Linux, com viewports e toque simulados. Testes em Safari/iOS, navegadores comerciais por sistema, aparelhos físicos, leitores de tela, instalação nativa da PWA e impressão em papel permanecem pendentes em [docs/LIMITACOES.md](docs/LIMITACOES.md). A entrega é **1.0.0-rc.4.5**.
