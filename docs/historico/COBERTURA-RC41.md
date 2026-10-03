> Histórico de uma rodada anterior. Não descreve a entrega atual. Consulte [VALIDACAO.md](../../VALIDACAO.md) e [RC5.md](../RC5.md). Evidências antigas citadas podem não integrar este pacote.

# Cobertura da correção mobile — RC.4.1

Esta folha complementa a matriz histórica `COBERTURA-RC4.md`. Os números da RC.4 ali registram o pacote anterior; a versão e os arquivos finais desta revisão constam abaixo.

| Requisito do prompt | Implementação e medida | Evidência |
|---|---|---|
| Barra: Desfazer com ícone de 44–48 px | 44×44 px; texto oculto somente nesta largura | `mobile-controls.json` e quatro capturas de bancada |
| Barra: Gotejar com `flex: 1` | `flex: 1 1 0`, largura 164/204/234/258 px nas quatro viewports | `css/workspace.css`; continuidade entre larguras na suíte |
| Barra: Doses de 72–80 px e alturas iguais | 76×44 px; três botões de 44 px de altura | `mobile-controls.json` |
| Agitar e Medir pH com mesma altura, largura, radius, padding, família | Duas colunas iguais; 44 px de altura; radius 6 px; padding 8×12 px; fonte igual; margem esquerda 0 e ícone SVG preservado | `css/workspace.css`; comparações automáticas |
| Alvos principais de pelo menos 44 px | `button`, `summary`, chips, opções, campos, links de ajuda e navegação; desenhos internos não alterados | `css/mobile-controls.css`; varredura de rotas em `mobile-controls.json` |
| Chips sem compressão | 44 px mínimos, 12 px nas laterais e gap de 8 px | Captura `mobile-montagem.png`; varredura da etapa Montagem |
| Ação em linha inteira e cards | 48 px mínimos para ações inteiras; 52 px para famílias/ferramentas como cards | `css/workspace.css`, `css/mobile-controls.css`; teste de cards e Dados |
| Largura, quebra, overflow, alinhamento, espaçamento e viewport | Medição de elementos visíveis em quatro tamanhos; zero recorte e zero overflow global nos estados medidos | `auditoria-rc41.json`, `mobile-controls.json` |
| Comparação entre irmãos | Igualdade de alturas, largura Agitar × Medir pH com tolerância 2 px, radius/padding/fonte/margem e proporção contínua da barra | `tests/mobile-controls.test.cjs` |
| Sete capturas específicas e comparação visual | `mobile-320-bancada.png`, `mobile-360-bancada.png`, `mobile-390-bancada.png`, `mobile-414-bancada.png`, `mobile-montagem.png`, `mobile-medir.png`, `mobile-dados.png`; quatro bancadas anteriores guardadas | `tests/results/`, `MOBILE-RC41.md` |
| Entrega corrigida | ZIP `SIAB-1.0.0-rc.4.1.zip` e arquivo único `SIAB-standalone-1.0.0-rc.4.1.html`, sem promoção a 1.0.0 | `docs/VERIFICACAO-FINAL.json`, hashes da entrega |

Os controles são verificados no DOM renderizado, inclusive painéis dinâmicos. A plataforma física ainda requer a homologação descrita em `LIMITACOES.md`.
