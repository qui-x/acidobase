> Histórico de uma rodada anterior. Não descreve a entrega atual. Consulte [VALIDACAO.md](../../VALIDACAO.md) e [RC5.md](../RC5.md). Evidências antigas citadas podem não integrar este pacote.

# Manual interativo — arquitetura e auditoria da RC.4

A RC.4 parte do pacote entregue **1.0.0-rc.3**. O Manual é uma área de consulta integrada à identidade visual e à navegação do SIAB. A bancada, Montagens prontas, Roteiros Experimentais, Relatórios e Professor continuam sendo as áreas operacionais. A versão permanece candidata, `1.0.0-rc.4`.

## Auditoria e mudanças de conteúdo

| Situação anterior | Organização entregue | Verificação |
|---|---|---|
| Cerca de 30 blocos longos eram montados juntos, inclusive a tabela calculada de substâncias | 13 categorias, 51 tópicos e uma única página montada por vez; bibliotecas geradas apenas ao abrir seu tópico | `manual.json`: home, todas as páginas, 140 substâncias e carga sob demanda |
| A navegação lateral e o texto repetiam conceitos de modo, bancada e análise | Home por tarefas, títulos curtos, finalidade, até quatro passos, exemplo, detalhes expansíveis e links relacionados | Home, navegação, acordeões e capturas |
| “Layout” e guias descreviam barras e controles antigos | Montagem, Ver e Dados da RC.3; bancada que começa vazia, ou retoma um estado salvo | Tópicos bancada, começar, menu e testes de conteúdo |
| Indicadores, fita e pHmetro eram tratados de modo pouco distinto | Tópicos separados e comparação com precisão e limites didáticos: indicador mostra cor, fita estima 1 unidade, pHmetro simula 0,01 após estabilizar | Tópicos e testes de instrumentos |
| Histórico, tabela, gráfico e agrupamento apareciam misturados | Tópicos específicos: eventos cronológicos, leituras reais, gráfico por volume, ΔpH/ΔV e compactação reversível | Testes de ciência, compactação, Manual e regressão |
| Montagens e Roteiros compartilhavam um atalho equivocado | Explicações e rotas próprias, com links operacionais para `#/montagens` e `#/roteiros` | Links e aliases, teste de rota antiga |
| Ajuda da atividade e ajuda da bancada tinham dicionários separados | Mesmo registro editorial: resumo curto, finalidade, próximo passo e assunto exato do Manual quando autorizado | Ajuda livre e restrita, foco e estado do experimento |
| Lista de pH da antiga página Frascos poderia parecer uma medição | Referência gerada a 0,0100 mol/L e 25 °C identificada explicitamente como cálculo do modelo | Biblioteca e conteúdo editorial |

O Manual cobre preparo e vidraria; múltiplos recipientes; previsão e gotejamento; os três módulos independentes; VER/Observar/Medir/Analisar; instrumentos; gráficos e tabelas; relatórios e Caderno; acessibilidade, solução de problemas, Professor, projetor e operação offline. A ajuda não revela respostas de referência ao aluno. O tour preexistente de cinco passos continua na bancada livre e pode ser iniciado pela home.

## Fonte única de conteúdo

`js/data/manual.js` declara `SIAB.manualContent.categories`, `topics` e `aliases`, com identificadores estáveis. Cada tópico contém `id`, `category`, `title`, `summary`, `purpose`, `steps`, `example`, `related`, `keywords` e `details` e, quando cabível, `diagram`, `generated` e `actions`. `SIAB.manualRegistry` resolve tópicos/aliases, categoria, normalização, índice e busca. Links internos `[[id|rótulo]]` e relacionados são resolvidos pelo registro. Os testes percorrem todos os destinos, inclusive os onze aliases preservados.

`js/telas/manual.js` é o apresentador das páginas: home com categorias por finalidade, índice lateral no desktop, índice recolhível no celular, breadcrumbs, resultado de busca com categoria/trecho, tópico único, exemplos, diagramas SVG sem dependência de capturas e detalhes expansíveis. Atualizar a busca não desmonta o campo de texto. Voltar/Avançar usa o roteador existente; rotas têm a forma `#/manual/<id>`. Consulta digitada não altera a URL nem é persistida. Busca normaliza acentos/maiúsculas e plurais simples, ignora palavras de ligação e exige os demais termos; títulos recebem peso superior aos sinônimos editoriais. Exemplos: “medidor de pH” encontra pHmetro e “papel indicador” encontra Fita de pH.

A interface gera a biblioteca de 140 substâncias e a carta de indicadores **somente** ao abrir o respectivo tópico. O Manual não cria recipientes, leituras, respostas nem avaliações. Links “Usar a função no programa” saem para a página operacional correta, quando presentes; nunca aplicam uma montagem dentro da página de explicação.

`SIAB.ajuda` usa a mesma fonte editorial para os atalhos contextuais. O diálogo apresenta o mínimo para orientar o próximo passo e mantém o foco do acionador ao fechar. Em uma atividade restrita, não oferece link ao Manual externo nem ação de escape: a política de navegação continua no `ActivityContext` e no roteador. Revalidar a restrição no clique evita links que tenham ficado abertos após mudança de contexto. `js/ui/activity-ui.js` delega a orientação à ajuda comum; o conteúdo independente “Sobre a atividade” permanece no seu próprio diálogo.

`build_manual_docs.cjs` deriva deste registro `docs/MANUAL.md` (texto completo), `docs/PAGINAS-MANUAL.md` (51 rotas/aliases), `docs/TERMOS-BUSCA.md` (termos explícitos) e `docs/INDICE-BUSCA.json` (vocabulário e termos normalizados). Execute `npm run build:manual-docs` após editar tópicos; o build completo também o faz. Os documentos não são uma segunda fonte de navegação.

## Contrato visual e mobile

`css/manual.css` usa a paleta, tokens, contraste e tipografia do SIAB, com largura de leitura limitada, estados de foco e movimento reduzido. Os desenhos em SVG têm legenda e alternativa textual; nenhuma ação depende apenas da cor ou de hover. A home é um conjunto de escolhas, não um grid pensado como PDF. O botão de impressão prepara uma página linear somente na mídia impressa: tópico completo com detalhes ou guia rápido por categoria, sem painéis e botões da aplicação.

A correção visual final, solicitada antes de embalar, está em `css/mobile-controls.css` e nas regras móveis existentes de `css/workspace.css` e `css/mobile-study.css`. Para 320, 360, 390 e 414 px, Desfazer ocupa 44 px, Doses 76 px e Gotejar preenche o restante; os três medem 44 px de altura. Agitar e Medir pH têm dimensões, padding, borda e fonte iguais. A margem lateral de Agitar foi retirada apenas na barra contextual. Controles principais, chips, segmentados, capacidade, ferramentas, fonte e opções dinâmicas têm mínimo de 44 px; ações de linha cheia do painel chegam a 48 px e cards de família/ferramenta a 52 px. Desenhos decorativos e o checkbox interno não foram aumentados; seus rótulos têm área de toque. A navegação, geometria de docas e política do workspace da RC.3 foram preservadas.

## Integração, compatibilidade e reprodução

`index.html` carrega os CSS e scripts; `sw.js` pré-armazena todos os arquivos, incluindo a nova folha mobile; `build_standalone.py` embute estilos e scripts no HTML único. Os destinos antigos `layout`, `montagem`, `leitura`, `ver`, `representacoes`, `phmeter`, `ph-strip`, `titration`, `mounts`, `reports` e `equacoes` resolvem para tópicos existentes. A rota `#/manual/roteiros` deixou de redirecionar para `montagens`.

Testes específicos: `tests/manual.test.cjs` e `tests/mobile-controls.test.cjs`. O segundo mede caixas reais, alvo de toque, intervalo entre controles, overflow e igualdade entre irmãos nos quatro tamanhos solicitados. Capturas mobile estão em `tests/results/mobile-*-bancada.png`, `mobile-montagem.png`, `mobile-medir.png` e `mobile-dados.png`; a comparação com a RC.3 acompanha `comparacao-mobile-rc3-rc4.json` e as quatro capturas `mobile-*-antes-rc3.png`. Os resultados completos e as versões exatas dos motores estão em `VALIDACAO.md` e `tests/results/`; histórico RC.3 em `docs/WORKSPACE-RC3.md`. A matriz do prompt está em `docs/COBERTURA-RC4.md`.

Continuam pendentes a homologação em aparelhos, Safari/iOS, navegadores comerciais, leitores de tela reais, teclado virtual real, instalação física da PWA e impressão em papel. A busca é lexical, não semântica; detalhes editoriais podem ser ampliados em versões futuras. Consulte `docs/LIMITACOES.md`.
