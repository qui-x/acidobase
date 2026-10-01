# Registro de integração — SIAB

## 1.0.0-rc.3 — 01/10/2026

- Workspace centrado no experimento; docas substituem as duas laterais permanentes.
- Montagem com estados recolhido, resumo e controles contextuais de preparo/objetos/módulo; montagem fixa informativa.
- Investigação compartilha os renderizadores da RC.2 entre doca desktop e painel inferior mobile; famílias e ferramentas seguem o ActivityContext.
- Apresentações compacta, padrão, ampla e fullscreen interno, com Expandir, Restaurar, Fechar e foco de retorno.
- Montagem, Ver e Dados na navegação inferior; níveis substituem conteúdo; família única e ferramenta única dispensam níveis redundantes.
- Ações experimentais em faixa própria, incluindo medição rápida autorizada; ajustes de visualViewport, safe areas, tablet, rotação e modo projetor.
- Cabeçalho e leituras mais concisos; atalhos duplicados removidos; descrição de grupos apresentada uma vez; indicação textual e contorno do tubo ativo.
- Ajuda contextual também no laboratório livre; anúncios de medidas; teclado, regiões inertes, contraste e movimento reduzido.
- Remoção do CSS antigo dos trilhos; adaptador mantém chamadas maduras do tour e dos atalhos.
- Ciência, catálogo, ActivityContext, instrumentos, compactação, relatório e Professor preservados por comparação dos arquivos com a RC.2.
- Suíte de workspace, capturas, comparação visual, atualização do cache/PWA, standalone e documentação. Permanece candidata RC.3.

## 1.0.0-rc.2 — 30/09/2026

- Menu inicial reorganizado e ícone oficial na tela com fundo desfocado, com adaptação para celular.
- ActivityContext único; guardas de bancada, recipientes, instrumentos, rotas, documentos e restauração a partir do link.
- Montagem informativa e menu contextual para o aluno; Manual geral sem exceção; Finalizar e Encerrar distintos.
- Validação pedagógica por capacidade, aceitando fita ou pHmetro quando a atividade exige pH.
- Painel exclusivo por família e função; `VER_SECTIONS`; fallback autorizado; histórico cronológico separado da tabela.
- Professor com três grupos de recursos, permissões explícitas, painel inicial e orientações em diálogo com impressão própria.
- Relatórios baseados no contexto e nas técnicas efetivamente registradas; gráficos separam contextos experimentais.
- `rawMeasurements` preservados; compactação contígua com tolerância por técnica, faixa, contagem, expansão e proteção de regiões críticas; CSV bruto.
- Contratos visuais dos botões, foco após atualização, tabelas acessíveis pelo teclado e correção da altura do cabeçalho ao redimensionar.
- `package-lock.json`, testes RC.2, evidências nos três motores e documentação atualizada. Continua candidata à homologação, sem promoção para 1.0.0.

## 1.0.0-rc.1 — 30/09/2026

Integração das revisões abaixo sobre o pacote 0.8.2 fornecido. Atualizados os arquivos modular e standalone, manifesto, cache, documentação e testes. Corrigidas falhas encontradas na migração das tabelas antigas, seleção da bancada, conservação de conteúdos vinculados, retorno da bancada livre, permissões de instrumentos, rótulos de seletores, impressão e CSV.

A versão **1.0.0 homologada não foi publicada**. Falta a matriz manual em dispositivos e navegadores comerciais reais, incluindo PWA instalada, teclado virtual e leitores de tela.

## Revisões das linhas históricas

| Linha lógica desta integração | Mudanças |
|---|---|
| 0.1.1 | Estado químico central, cache invalidado por composição e condições, classificação do modelo e saturação compartilhada de sólidos iguais |
| 0.3.2 | Migração idempotente, Caderno, inicialização, Temas, Missões, conclusão sem gamificação e Prever e gotejar |
| 0.5.1 | Montagens prontas, mistura oficial conservativa, descoberta do arco-íris e tour de cinco passos |
| 0.6.6 | VER em três grupos, fita/pHmetro/condutividade, temperatura, seleção e vínculo preservando conteúdo |
| 0.7.3 | Integração de navegação e contexto com os novos links de atividade; aliases de rotas antigas |
| 0.8.3 | Persistência integrada, responsividade, teclado/visualViewport, impressão, documentação e compatibilidade |

## Novas linhas previstas no prompt

| Linha | Implementação integrada |
|---|---|
| 0.9.0 | Roteiros Experimentais com narrativa, módulo único, ficha de identificação e cobertura de catálogo |
| 0.9.1 | Relatório da Experiência com resultados automáticos e textos do aluno |
| 0.9.2 | Relatório da Bancada livre e impressão preenchida/em branco |
| 0.9.3 | Área do Professor, configuração, orientações, referências do modelo, BNCC e projetor |
| 0.9.4 | Link opaco, validação de configuração, atividades recentes e duplicação |
| 0.9.5 | Guardas de rota, módulo e instrumentos, recarga, outra aba e encerramento |

## Auditoria do histórico recebido

A versão declarada em namespace, pacote e service worker era 0.8.2. Foram encontradas referências anteriores 0.3.1, 0.6.2, 0.6.5, 0.7.1, 0.7.2, 0.8.0 e 0.8.1. O pacote não continha histórico Git que permitisse comprovar todos os patches anteriores; as numerações acima refletem essa informação disponível, não uma cronologia completa de releases.

`0.5.6` identifica a biblioteca **dialog-polyfill**, não o SIAB. Ela foi excluída da contagem de patches. As revisões desta entrega são entradas de integração; não foram criadas tags ou publicações históricas fictícias. A auditoria estruturada está em `docs/versoes.json`.
