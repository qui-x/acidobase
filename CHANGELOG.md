# Histórico de versões

## 1.0.0

Versão estável oficial. Consolida a linha 1.0.x a partir da RC.5 aprovada e incorpora a correção da bancada mobile encontrada nos testes finais. Não introduz novas funcionalidades.

### Correção da bancada mobile

- Corrige a região central do Tubo em foco no mobile, com nome compacto e vidraria independente do crescimento dos textos científicos.
- Reutiliza o aviso existente para pH efetivamente medido (fita ou pHmetro) e para o volume real adicionado, consolidado ao final de cada sequência.
- Estabiliza a informação do conta-gotas ao alternar reagentes e preserva a rolagem por toque, inclusive em paisagem baixa.
- Evita a segunda sequência causada pelo clique de toque após pointerup, mantendo Enter e Espaço.
- Renova o cache offline (`siab-1.0.0+20261012`) para que instalações da publicação 1.0.0 anterior recebam a correção; a versão exibida continua 1.0.0.
- Gera `SIAB-1.0.0-standalone.html` do mesmo código corrigido, com a marca de arquivo único, a versão no cabeçalho, o favicon que acompanha o tema e o PWA desligado; atualiza guias de distribuição e manifestos de integridade.
- Elimina a rolagem de 1 px da página inteira ao tocar no conta-gotas (a região de anúncios para leitores de tela ficava abaixo da tela).
- Validação focal em Chromium: ver VALIDACAO.md. A suíte histórica abaixo não foi reexecutada integralmente nesta correção.

### Consolidação da linha 1.0.x

- Promove a RC.5 aprovada para a versão estável oficial.
- Inclui somente limpeza, consolidação e empacotamento final.
- Atualiza versão exibida, metadados e cache definitivo para 1.0.0.
- Exclui da distribuição testes, capturas, resultados brutos, documentação de processo e ferramentas de desenvolvimento.
- Remove `css/stylesqab.css` e `assets/sqab-icone.svg`, comprovadamente sem consumidores.
- Preserva ciência, catálogo, ActivityContext, Professor, Manual, Caderno, relatórios, controles e iconografia da RC.5.
- Reconstrói o standalone e reexecuta a regressão, incluindo ZIP extraído, offline e preservação de dados na atualização.
- Separa distribuição, código-fonte e standalone; acompanha manifestos SHA-256 e SHA-512.

## Base homologada: 1.0.0-rc.5

Inclui a correção final dos chevrons de Navegar e Acessibilidade. A base foi preservada integralmente antes da promoção; o histórico anterior permanece no pacote RC.5 original.

## Congelamento

Nenhuma nova funcionalidade entra na linha 1.0.0. Evoluções pertencem às linhas 2.0.x (perfis, identidade e controle de acesso) e 2.1.x (workspace adaptativo, sistema visual e experiência por perfil).
