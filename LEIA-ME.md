# SIAB 1.0.0-rc.4.5 — guia de uso

Abra **SIAB-standalone.html** para usar o aplicativo sem instalar nada. Para uma instalação PWA, use a pasta modular em localhost ou HTTPS. Esta entrega é uma candidata à homologação: os testes automatizados e as verificações pendentes estão em COMPATIBILIDADE.md.

## Primeira investigação

1. Abra Laboratório → Montagem → Módulo e escolha Explorar, Medir ou Calcular. Nenhum módulo depende dos outros.
2. Em Montagem → Preparo, escolha a solução, o indicador e o conta-gotas. Objetos reúne vidraria e recipientes.
3. Observe a cor. No VER, abra Medir → pH e mergulhe a fita ou use o pHmetro.
4. Aguarde o eletrodo estabilizar. Adicione gotas e compare observações e leituras. Uma medida pontual anterior permanece identificada como anterior.
5. Consulte partículas, espécies, equações e distribuição. Esses valores representam o modelo; não são medições adicionais realizadas automaticamente.
6. Registre no Caderno quando desejar ou abra o Relatório para reunir os dados e escrever sua interpretação.

Em celular, a barra inferior oferece **Montagem**, **Ver** e **Dados**, conforme a atividade permite. Cada painel tem Fechar e, quando há níveis, Voltar. O experimento mantém sua faixa de ações. Os campos se adaptam à área visível; teclados virtuais reais ainda devem ser verificados nos aparelhos usados pela turma.

## Escolher um caminho

- **Aprender:** Temas conceituais, conexões com a bancada e marcador Revisado.
- **Missões:** problema, objetivos e condições de sucesso. Investigue e escreva uma conclusão; não há pontuação.
- **Roteiros Experimentais:** ficha com problema, pergunta, objetivo, tarefas e montagem. Preencha a identificação antes de iniciar.
- **Montagens prontas:** configurações rápidas para exploração.
- **Caderno:** histórico pessoal, filtros, anotações, referências a relatórios, CSV e impressão.
- **Professor:** preparação de atividades, orientações e links. Modo projetor disponível também no menu → Preferências.

## Selecionar e misturar

Na Visão geral, clique em Selecionar recipientes e marque os desejados. Comparar não cria vínculo. Vincular sincroniza o reagente e a quantidade adicionada, preservando as preparações existentes. Misturar pede um destino; os conteúdos das origens são transferidos por inteiro. Se ultrapassarem a capacidade, a operação é recusada sem modificar a bancada. Use Desfazer no experimento para recuperar o estado anterior.

## Prever e gotejar

Escolha aumenta, diminui ou permanece, ou escreva uma previsão aberta. Depois da adição, compare os registros antes/depois. A explicação é opcional na exploração livre e solicitada em atividades e missões. Marque Registrar no Caderno se quiser conservar a investigação. O sistema não classifica automaticamente uma previsão aberta como certa ou errada.

## Relatórios

Roteiros produzem Relatório da Experiência, com a proposta da ficha. Uma investigação livre produz Relatório da Bancada, sem pergunta ou objetivo inventados. Textos e identificação podem ser editados; os resultados automáticos são capturas da bancada. Atualize os dados após novas medições. Escolha Relatório completo ou Para preencher à mão: ambos mantêm os dados científicos. Na preparação livre, Atividade de análise permite ao professor selecionar dados, campos vazios e, opcionalmente, uma fonte hipotética identificada. O padrão é 10 linhas por campo; há opções de 5 a 25 e valor personalizado de 5 a 60. Baixe o HTML ou imprima. Registrar no Caderno guarda uma referência para reabri-lo neste navegador. O Histórico cronológico permanece em Dados na bancada.

## Atividades do professor

Escolha Missão, Roteiro ou Montagem. Configure instrumentos, temperatura, identificação, formato do relatório e navegação livre ou restrita. Gere o link e abra como aluno para revisar. O link transporta a configuração sem respostas do professor. Para compartilhar entre aparelhos, todos precisam acessar o mesmo endereço do aplicativo; um caminho `file://` do computador não é um endereço público.

Na atividade restrita, o cabeçalho permite Finalizar ou Encerrar. A recarga e a abertura do mesmo link preservam o contexto salvo naquele navegador. Orientações do professor ficam em sua área; a restrição organiza a aula, sem autenticação de prova. Atividades recentes podem ser editadas, duplicadas com nome “Cópia de…” ou excluídas após confirmação. A exclusão remove o registro local, mas não revoga links já compartilhados; cada link contém sua configuração.

## Guardar o trabalho

O salvamento é local. Fechar uma aba preserva dados quando o navegador permite armazenamento. Limpar os dados do site ou usar outro perfil pode removê-los. Em caso de quota cheia ou armazenamento bloqueado, o SIAB avisa e conserva a sessão em memória; exporte antes de fechar.

O HTML único funciona offline. Na versão modular, primeiro abra conectado para instalar o cache. Clima e VLibras dependem de internet. Não há sincronização entre aparelhos, coleta automática ou servidor de relatórios.

Veja também `docs/MANUAL.md`, `docs/MIGRACAO.md`, `docs/MODELO-CIENTIFICO.md` e `docs/LIMITACOES.md`.


## Novidades de uso na RC.2

- **Início:** laboratório em destaque; caminhos Aprender, Missões, Roteiros e Caderno. Na escolha de inicialização, o ícone do SIAB aparece sobre o fundo desfocado.
- **Atividade restrita:** consulte Montagem, use as intervenções liberadas e abra Ajuda. Manual, Professor e outros roteiros ficam fora desse contexto. Finalizar salva o relatório e mantém a atividade; Encerrar confirma a saída. Reabrir o mesmo link recupera os dados locais.
- **Professor:** selecione a proposta, escolha instrumentos/representações/análises, confira os requisitos e defina as alterações de preparo permitidas. Fita OU pHmetro satisfaz uma exigência de medir pH. O painel inicial só oferece funções autorizadas. Ver orientações abre um diálogo; Imprimir Guia produz material separado.
- **Painel:** escolha Observar, Medir ou Analisar, depois a função. O conteúdo e os submenus acompanham essa seleção. Uma única função dispensa navegação redundante; sem funções autorizadas, o painel desaparece.
- **Histórico:** intervenções e medições em ordem cronológica. **Tabela:** medições, com Compacta ou Completa. Clique em Ver medições para expandir um grupo. O CSV permanece bruto. O Caderno guarda registros voluntários.
- **Relatório:** reúne os instrumentos efetivamente usados e os dados permitidos. Sem medições suficientes, não inventa um gráfico. Campos de interpretação e conclusão pertencem ao estudante.

A compactação automática começa em 24 registros. Para pHmetro, a faixa de um grupo é no máximo 0,03; para fita, somente estimativas iguais; termômetro, 0,2 °C; condutividade, 0,5 µS/cm. A cor do indicador exige estado visual igual. Trocas de técnica, contexto, etapa, temperatura relevante ou reinício de volume interrompem o grupo. Grandes variações de pH e proximidade de equivalência preservam leituras individuais. Os valores originais nunca são substituídos pela média.

## Apresentação na RC.3

No desktop, clique em Montagem ou Ver para abrir a doca. Ao recolher, a bancada recupera a área. Tabela, Gráfico e outras análises usam largura ampliada; Expandir e Restaurar alternam a área de leitura sem perder medidas. No tablet, a interface abre uma doca por vez. Em telas pequenas, uma única região rola dentro do painel, com o cabeçalho sempre disponível.

Dados → Relatório abre o documento em sua própria tela. No modo restrito, as docas exibem apenas recursos autorizados; a montagem fixa é um resumo informativo. Uma única ferramenta abre diretamente. Preferências de apresentação pertencem ao workspace, separadas dos dados químicos.

## Consultar o Manual na RC.4

Abra Manual e escolha uma categoria ou digite sua dúvida na busca. “Medidor de pH” encontra pHmetro; “papel indicador” encontra Fita de pH. Cada página apresenta uma explicação curta, passos, exemplo e detalhes que você pode expandir. No celular, use Índice do Manual para navegar entre categorias.

Os botões de ajuda da bancada abrem uma orientação curta. Abrir no Manual leva diretamente ao assunto, quando esse acesso está disponível. Em atividades restritas, a ajuda mantém você na investigação.

As páginas Montagens prontas e Roteiros Experimentais explicam os recursos. Seus botões abrem os catálogos correspondentes. O tour continua sendo uma orientação sobre a bancada real, acessível pela home do Manual.

Imprimir tópico inclui os detalhes da página. Imprimir guia rápido organiza as categorias em uma sequência para papel; não imprime a grade de cartões.

## Controles no celular

Desfazer, Gotejar e Doses formam uma linha equilibrada. Agitar e Medir pH ocupam metades iguais da linha seguinte. Os controles de toque principais têm pelo menos 44 px de altura; os botões que ocupam toda a linha do painel têm pelo menos 48 px. Essa mudança de aparência não altera suas medições.
