# Validação da versão 0.2 — 24/09/2026

## Cálculo: aprovado

11 verificações numéricas independentes: ácido/base forte antes, na e após a
equivalência; ácido acético no início, na meia-equivalência e na equivalência;
amônia na equivalência; água pura; ácido extremamente diluído; 20 gotas de
0,05 mL em 1 mL de HCl, com concentrações iguais de 0,01 mol/L.

Conferidos também a identificação da equivalência e os estados de cor
verde do bromotimol, incolor da fenolftaleína e amarelo do alaranjado de metila.

Para as 15 novas amostras: conservação ao misturar a mesma preparação;
equivalência entre diluição por preparo e adição de água; aproximação ao neutro
ao diluir; pH crescente ao adicionar NaOH e decrescente ao adicionar HCl;
ausência de marcador de equivalência quantitativa para misturas; referência
analítica anfiprótica do bicarbonato; cor própria e realce do indicador.
Esses testes verificam o modelo implementado, não sua validade quantitativa
como representação de um alimento ou produto comercial real.

## Interação por DOM: aprovada

Ambiente jsdom 26.1.0. Cliques e eventos reais da interface acionam os controles
do aplicativo. Foram conferidos início, gotas, desfazer, renomeação com
caracteres especiais, navegação com preservação de dados, visão geral,
abertura/fechamento do painel, cópias vinculadas e gotas em grupo, pH oculto,
repreparo de grupo, rejeição de volume negativo, mudança de modo mobile/desktop,
temas, fonte de 200%, limite de dez tubos e remoção do tubo ativo.

Adicionalmente: entrada do cotidiano; diluição preservada nas cópias;
aplicação de novas amostras ao grupo; busca por nome sem acentos; seleção com
teclado; retorno de foco; seleção de tema dentro de outro diálogo; rótulos dos
diálogos; pH aproximado/oculto; realce de cores sem alterar pH; erros de nome
e volume apresentados no próprio formulário. Os testes rejeitam chamadas a
alert/prompt/confirm nativos e a reportValidity.

As primitivas de diálogo e a consulta de largura foram simuladas neste teste.
Ele não substitui a conferência da aparência ou dos gestos em navegador real.

## Conferência visual: pendente

A pré-visualização bloqueou o protocolo local dos arquivos. Não foi possível
validar a aparência renderizada em navegador nesta sessão. Preparados no CSS:
celular de 320 px, celular de 390 px, paisagem, desktop, fontes ampliadas,
painel inferior, áreas seguras e rolagem. O usuário deve conferir esses casos
ao abrir a versão de teste; não foram tratados como testes visuais aprovados.
