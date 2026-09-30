# Migração e persistência

## Origem e destino

O progresso antigo `siab_progresso_v1` é lido e convertido para `siab_investigacao_v2`, schema 2. O destino reúne conclusões de missões, Temas, Caderno e última referência. A chave original permanece intacta, inclusive quando ocorre falha de gravação.

| Informação antiga | Tratamento |
|---|---|
| Missão concluída, data e respostas | Preservadas |
| Notas, títulos, datas e identificação | Preservados |
| Previsões e leituras | Classificadas como exploração |
| Descobertas e registros de desafios aproveitáveis | Classificados como anotação |
| Tabela histórica separada por ponto e vírgula e barra vertical | Convertida para colunas e linhas estruturadas |
| Tabelas já estruturadas | Preservadas, inclusive as já compactadas na versão antiga |
| Pontos, recordes e progressão de jogos | Não importados para a nova interface; origem legada conservada |
| Preferência Bancada/Completo | Convertida em preferência de tela inicial; não restringe conteúdo |

A execução é idempotente: se existe schema 2 válido, o destino é reutilizado. A migração não apaga notas para reduzir o tamanho. Na exploração atual não há o antigo corte automático de 300 notas. A suíte verifica 351 registros, recarga, execução repetida, JSON inválido e falha de quota.

## Chaves novas

- `siab_bancada_v2`: bancada livre.
- `siab_relatorios_v1`: relatórios identificados por experiência/bancada.
- `siab_atividades_criadas`: configurações preparadas pelo professor.
- `siab_atividade_<identificador>`: contexto de cada atividade aberta.
- `siab_atividade_ativa` no sessionStorage: contexto ativo na aba.
- `siab_inicializacao`: preferência de entrada.
- `siab_migracao_v2`: registro da conversão concluída.

Uma atividade salva seu contexto separadamente; ao encerrá-la, a bancada livre é recuperada. O Caderno aponta para relatórios por identificador, sem duplicar todas as medições. Um registro antigo que não se encaixa em um filtro continua disponível em Todos como registro preservado.

## Falhas e recuperação

JSON inválido usa um estado inicial seguro. Falha de quota ou bloqueio de armazenamento mostra aviso e mantém alterações em memória na sessão; não permite garantir retenção depois de fechar. A chave antiga não é apagada para tentar liberar espaço. Exporte Caderno/relatórios antes de limpar dados. Não há restauração de informações que já tenham sido descartadas por uma versão anterior ou pelo navegador.

Migrar de `file://` para HTTPS, mudar de domínio ou de perfil do navegador muda o local de armazenamento. Não há sincronização automática entre origens.
