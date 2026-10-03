# SIAB 1.0.0-rc.5

Base: **1.0.0-rc.4.5**. Especificação: `Texto colado(6).txt`, seções 0–144. A rodada conclui o ciclo de atividades, uniformiza a iconografia e prepara a homologação. Não amplia o escopo para contas, servidor, sincronização ou funcionalidades 2.0.x.

## Ciclo de atividade

| Ação | Resultado |
|---|---|
| Finalizar | Consolida dados, marca finalizada e abre relatório; mantém contexto até Encerrar |
| Encerrar com dados | Permite continuar, ver relatório antes ou encerrar; atualiza a prática no Caderno |
| Encerrar sem dados | Confirma saída sem prática vazia |
| Relatório antes de sair | Mantém a sessão; permite impressão/PDF e Encerrar |
| Reabrir link ativo | Continuar sessão ou iniciar outra com confirmação |
| Reabrir link finalizado | Relatório anterior ou nova tentativa com confirmação |
| Nova tentativa | Novo ID; preserva dados/relatório da sessão anterior |

Encerrar sempre leva à tela normal de Início e recupera a bancada livre. A configuração de inicialização do usuário permanece intacta. Registros de prática têm identidade de sessão e referência ao relatório, evitando duplicação do conteúdo científico em notas de texto.

## Interface

A seleção digital/impresso saiu do Professor; o campo legado continua decodificável. O relatório mantém três modos e dez seções, com impressão/PDF e sem exportação HTML para o usuário. A família central de ícones diferencia 22 áreas e nove usos de setas. O inventário visual apresenta estados claro/escuro e exemplos interativos; a aprovação estética final é do usuário.

O contrato mobile vem da base aprovada: 44 px mínimos, ações inteiras de 48 px, cards de seleção de 52 px, barra com Desfazer 44 px/Doses 76 px, Agitar e Medir pH iguais. As docas, o painel inferior, o motor científico e o catálogo não foram reconstruídos.

## Entrega

[Cobertura](COBERTURA-RC5.md), [validação](../VALIDACAO.md), [evidências](EVIDENCIAS-RC5.html), [ícones](ICONOGRAFIA-RC5.html), [dependências](DEPENDENCIAS-RC5.md) e [limites](LIMITACOES.md) integram o pacote. A conclusão técnica é **APTO PARA HOMOLOGAÇÃO FINAL**, mantendo a identificação RC.5 e as pendências externas. RC.6 só se justifica por problema funcional relevante; ajustes de texto/espaçamento podem permanecer nesta candidata. A promoção para 1.0.0 depende da homologação e não foi executada automaticamente.
