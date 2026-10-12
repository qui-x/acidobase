# Histórico de versões

## 1.0.0-rc.6

- Corrige a região central do Tubo em foco no mobile, com nome compacto e vidraria independente do crescimento dos textos científicos.
- Reutiliza o aviso existente para pH efetivamente medido (fita ou pHmetro) e para o volume real adicionado, consolidado ao final de cada sequência.
- Estabiliza a informação do conta-gotas ao alternar reagentes e preserva a rolagem por toque, inclusive em paisagem baixa.
- Evita a segunda sequência causada pelo clique de toque após pointerup, mantendo Enter e Espaço.
- Atualiza identificador de versão e cache, guias de distribuição e manifestos de integridade.
- Validação focal em Chromium: ver VALIDACAO.md e o relatório externo. Os testes históricos abaixo não foram reexecutados integralmente nesta correção.

## 1.0.0

- Consolida a linha 1.0.x e promove a RC.5 aprovada para a versão estável oficial.
- Não introduz novas funcionalidades: inclui somente limpeza, consolidação e empacotamento final.
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
