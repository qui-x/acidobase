# Termos e sinônimos do Manual — 1.0.0-rc.5

A busca indexa título, resumo, finalidade, palavras-chave, passos, exemplo e detalhes. A tabela lista os termos editoriais explícitos; o vocabulário normalizado completo está em [INDICE-BUSCA.json](INDICE-BUSCA.json).

| Tópico | Termos e sinônimos explícitos |
|---|---|
| Primeiros passos | inicio; começar; primeira visita; bancada livre |
| Usar a bancada | layout; montagem; docas; painel; celular; mobile; tablet; workspace |
| Página inicial e navegação | menu; inicialização; tela inicial |
| Escolher um módulo | modo; módulos; nível |
| Explorar: observar e manipular | observação; cor; manipulação |
| Medir: coletar evidências | medida; medição; medidor; coletar |
| Calcular: interpretar quantidades | concentração; mol; cálculo; quantitativo |
| Escolher soluções e reagentes | solução; reagente; frasco; preparo; prateleira |
| Vidrarias e capacidade | recipiente; béquer; erlenmeyer; tubo; capacidade |
| Volumes, diluição e concentração | volume; concentração; diluir; diluição; gota |
| Gotejar, adicionar volume e agitar | conta gotas; gotejamento; gotas; agitação; agitar; dose; desfazer |
| Selecionar e comparar recipientes | múltiplos tubos; grupo; comparação; mistura; vincular; selecionar |
| Prever e gotejar | previsão; hipótese; investigação |
| O que o pH informa | acidez; basicidade; ácido; base; como medir ph |
| Usar Ver → Medir | painel medir; instrumentação; ferramenta; medição |
| Escolher um instrumento | instrumento; aparelho; técnica |
| Indicadores ácido-base | indicador; cor; viragem; fenolftaleína; bromotimol; repolho |
| Fita de pH | papel indicador; papel de ph; fita de ph; tira; estimativa |
| pHmetro | medidor de ph; ph meter; eletrodo; calibração; estabilização; medição contínua |
| Condutivímetro | condutividade; condutivimetro; condutimetro; condução; eletricidade; ions |
| Temperatura da solução | termômetro; temperatura; ambiente; cidade; neutralidade |
| Usar Ver → Observar | representações; microscópico; macroscópico; simbólico |
| Partículas | moléculas; íons; lupa; microscópico |
| Espécies em solução | espécie; concentração; carga; predominância |
| Equações | equação; reação; equilíbrio; neutralização |
| Transferência de próton | proton; prótons; Brønsted; par conjugado |
| Usar Ver → Analisar | análise; analisar; dados |
| Gráfico de pH por volume | gráfico; curva; eixo; volume; ponto |
| ΔpH/ΔV: mudança por volume | derivada; delta; ΔpH/ΔV; salto; equivalência |
| Distribuição de espécies | distribuição; fração; percentual |
| Histórico da sessão | histórico; eventos; cronologia; registro |
| Tabela de medições | tabela; medições; CSV; exportar; dados |
| Tabela compacta e completa | compactação; agrupar; agrupamento; expandir; completa; compacta; repetidos |
| Titulação ácido-base | titulação; titular; titulante; equivalência; ácido base |
| Montagens prontas | montagem; montagens prontas; pré-configurada; catálogo |
| Roteiros Experimentais | roteiro; experimento; atividade estruturada; identificação; ficha |
| Temas e Missões | tema; missão; missões; aprender; objetivo |
| Relatórios | relatório; imprimir; exportar; PDF; conclusão |
| Caderno de investigação | caderno; anotação; notas; salvar |
| Ajustar a experiência de uso | acessível; contraste; daltonismo; tema claro; escuro; fonte; movimento; Libras |
| Navegação por teclado | teclado; atalho; Tab; Shift; Enter; Espaço; Esc; setas |
| Ajuda e solução de problemas | erro; problema; não aparece; não consigo; travado |
| Atividades por link e modo restrito | restrito; restrita; permissão; link do aluno; professor; bloqueado |
| Preparar uma atividade | docente; professor; criar atividade; configurar; gerar link; orientações; impressão |
| Modo projetor | projeção; projetor; aula; ampliar |
| Instalação e uso offline | offline; sem internet; PWA; instalar; standalone; arquivo HTML |
| Guardar e recuperar registros | salvamento; salvar; recuperar; armazenamento; backup |
| O que o modelo representa | modelo; limitação; ideal; precisão |
| Precipitação e redissolução | precipitação; precipitado; solubilidade; sólido; Kps; redissolução |
| Biblioteca de substâncias | substância; catálogo; biblioteca; frascos; ácidos; bases; sais |
| Biblioteca de indicadores | biblioteca indicadores; carta de cores; faixa de viragem |
| Referências e créditos | referências; créditos; licença; bibliografia |

## Normalização e ordem

- Sem distinção entre acentos e maiúsculas/minúsculas.
- Redução simples de plurais (`-s`, `-ões`, `-ais`), sem promessa de análise linguística completa.
- Palavras de ligação são ignoradas; os demais termos precisam encontrar correspondência.
- Correspondência no título recebe prioridade; palavras-chave e sinônimos elevam a relevância.
- Prefixos com mais de dois caracteres também encontram termos.
- Exemplos: “medidor de pH” → pHmetro; “papel indicador” → Fita de pH.
- Nenhuma consulta é enviada a servidor; não há dependência externa.
