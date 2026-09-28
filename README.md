# SIAB — Simulador Interativo de Ácidos e Bases

**Versão atual: 0.8.2**

O SIAB é um laboratório virtual de ácidos e bases para o ensino médio. Ele combina uma bancada experimental com motor químico, missões guiadas, desafios, caderno de laboratório e ferramentas para o professor. A aplicação funciona em português do Brasil, no computador, no celular e em modo projetor.

O programa não precisa de servidor ou conta para executar. A bancada fica em memória durante a sessão; o modo de navegação, as preferências, o progresso, os recordes e o caderno ficam armazenados no navegador deste aparelho. Quando publicado por HTTPS (ou executado em localhost), o SIAB pode ser instalado como PWA nos navegadores que oferecem esse recurso. O uso sem internet depende do carregamento completo e da manutenção do cache pelo navegador.

## Conteúdo

- [Visão rápida](#visão-rápida)
- [Executar localmente](#executar-localmente)
- [Modos e rotas](#modos-e-rotas)
- [Bancada de laboratório](#bancada-de-laboratório)
- [Preparar uma experiência](#preparar-uma-experiência)
- [Leituras e painel VER](#leituras-e-painel-ver)
- [Vários tubos, seleção e relatório](#vários-tubos-seleção-e-relatório)
- [Layout desktop, mobile e projetor](#layout-desktop-mobile-e-projetor)
- [Motor químico e limites do modelo](#motor-químico-e-limites-do-modelo)
- [Aprender: trilhas e missões](#aprender-trilhas-e-missões)
- [Desafios](#desafios)
- [Área do professor](#área-do-professor)
- [Caderno de laboratório](#caderno-de-laboratório)
- [Acessibilidade e teclado](#acessibilidade-e-teclado)
- [Instalação, PWA e uso offline](#instalação-pwa-e-uso-offline)
- [Compatibilidade com Android e iOS](#compatibilidade-com-android-e-ios)
- [Arquitetura do projeto](#arquitetura-do-projeto)
- [Testes](#testes)
- [Publicação e manutenção](#publicação-e-manutenção)
- [Privacidade, referências e licença](#privacidade-referências-e-licença)

## Visão rápida

| Área | O que oferece |
| --- | --- |
| Bancada | Preparo de soluções, escolha de vidraria e indicador, gotejamento, leitura de pH, cor e volume. |
| Motor químico | Equilíbrio ácido-base, dissociação, hidrólise, tampões, polipróticos, solubilidade, titulação, condutividade e temperatura. |
| Representações | Vidraria animada, cor calculada, régua de pH, gráfico, partículas, equações, condução e histórico. |
| Biblioteca | 140 frascos em 16 grupos, 12 opções de indicador e 10 roteiros de teste prontos. |
| Aprender | Quatro trilhas e 14 missões com prever, observar, agir, explicar e conferir. |
| Desafios | Cinco jogos curtos com pontuação, recorde e registro no caderno. |
| Professor | Seleção de atividades, link de aula, modo projetor, roteiro impresso, objetivos, BNCC e respostas esperadas. |
| Registros | Caderno local, tabela de gotas, CSV, impressão e relatório da bancada. |
| Acesso | Tema claro/escuro, alto contraste, texto ampliável, redução de movimento, filtros para daltonismo, som, vibração, VLibras e teclado. |
| Distribuição | Arquivos locais, servidor simples, GitHub Pages, PWA instalável e HTML único offline. |

## Executar localmente

### Abrir como arquivo

No computador, abra <code>index.html</code> diretamente em um navegador compatível. A instalação como aplicativo e o service worker exigem HTTPS ou localhost. No Android, iPhone e iPad, prefira o endereço publicado: a prévia de um HTML em Arquivos, e-mail ou mensageiros pode exibir a página sem executar JavaScript.

### Servidor local

Com Python 3:

~~~bash
cd siab
python3 -m http.server 8080
~~~

Acesse <http://localhost:8080>.

Com o script do projeto:

~~~bash
cd siab
npm start
~~~

O projeto não depende de framework ou bundler para executar. Node.js é necessário somente para os testes automatizados descritos mais adiante.

### Arquivo único

O build reúne CSS, JavaScript e o ícone principal em um único HTML sem dependências externas:

~~~bash
cd siab
python3 build_standalone.py ../SIAB-teste.html
~~~

No computador, o HTML único pode ser aberto diretamente em um navegador ou usado em uma aula sem internet. No celular, prefira o site publicado; visualizadores de arquivos não equivalem a navegadores. Ele não é instalável como PWA porque não possui manifesto e service worker separados.

### GitHub Pages

Publique **todo o conteúdo** da pasta <code>siab/</code>, incluindo <code>vendor/</code>, no diretório escolhido como origem do GitHub Pages. O arquivo de entrada deve se chamar exatamente <code>index.html</code>. Em Settings → Pages, selecione a origem de publicação correspondente (raiz, <code>docs/</code> ou artefato do Actions) e use o endereço HTTPS informado pelo GitHub.

Os caminhos são relativos: uma publicação em <code>https://usuario.github.io/repositorio/</code> não precisa estar na raiz do domínio. As rotas usam <code>#/</code>, portanto não exigem reescrita de URLs. Se o projeto ficar em uma subpasta da origem publicada, inclua essa subpasta no link compartilhado.

GitHub Pages serve arquivos estáticos; não há uma modalidade específica de publicação para iOS. As diferenças relevantes estão no navegador, no contexto de abertura do link, no HTTPS e nos recursos de armazenamento/instalação. Verifique a versão **0.8.2** em Menu → Sobre depois da publicação. Esta entrega não publica automaticamente no seu repositório.

## Modos e rotas

O SIAB possui dois modos de navegação:

- **Bancada:** modo padrão, com laboratório livre, manual e caderno.
- **Completo:** acrescenta início, trilhas, missões, desafios, professor e aulas montadas.

A escolha fica salva no navegador em <code>siab_modo</code>. Um link de aula em <code>#/aula/...</code> liga o modo completo automaticamente.

| Rota | Tela |
| --- | --- |
| <code>#/</code> | Entrada padrão: bancada no modo Bancada ou início no modo Completo. |
| <code>#/laboratorio</code> | Bancada livre de laboratório. |
| <code>#/manual</code> | Manual interativo, busca, índice e impressão. |
| <code>#/manual/&lt;seção&gt;</code> | Abre uma seção específica do manual e pode destacar o controle correspondente. |
| <code>#/caderno</code> | Caderno de laboratório e exportação de dados. |
| <code>#/inicio</code> | Tela inicial do modo Completo. |
| <code>#/aprender</code> | Trilhas de missões e desafios. |
| <code>#/missao/&lt;id&gt;</code> | Missão guiada individual. |
| <code>#/desafios</code> | Lista de jogos. |
| <code>#/desafio/&lt;id&gt;</code> | Jogo individual com pontuação e recorde. |
| <code>#/professor</code> | Montagem de aula e respostas esperadas. |
| <code>#/aula/&lt;itens&gt;</code> | Sequência de aula enviada pelo professor. |

O menu ☰ também reúne os 10 roteiros prontos, preferências, tour guiado, instalação, ideias para aula e informações do projeto.

## Bancada de laboratório

A bancada começa vazia. O primeiro frasco escolhido na prateleira cria o Tubo 1. É possível trabalhar com até 10 recipientes na mesma bancada, alternar o recipiente ativo, renomeá-lo e desfazer ações.

### Módulos

Os módulos controlam a quantidade de informação exibida, mantendo o mesmo motor químico:

| Módulo | Foco | Controles e resultados |
| --- | --- | --- |
| **Explorar** | Observação qualitativa | Frascos, indicadores, vidraria, cor, pH e partículas. Os ajustes numéricos ficam ocultos. |
| **Medir** | Medição e titulação | Volume inicial, diluição, tamanho da gota, equivalência, meia-equivalência, pOH e pH + pOH. |
| **Calcular** | Tratamento quantitativo | Concentrações, espécies, Ka/Kb, grau de ionização, n = C · V, ΔpH/ΔV, distribuição de espécies e conta de condutividade íon por íon. |

Trocar de módulo não apaga tubos, gotas, preparo ou vínculos. O módulo ativo aparece na barra da bancada e fica salvo no estado da experiência.

### Prateleira e biblioteca de frascos

A prateleira contém aproximadamente 140 soluções em 16 grupos recolhíveis:

- frutas e sucos;
- alimentos e bebidas;
- casa, limpeza e higiene;
- saúde e farmácia;
- corpo humano;
- água e ambiente;
- ácidos fortes;
- ácidos fracos;
- ácidos polipróticos;
- bases fortes;
- bases fracas;
- sais;
- sais de metais e cátions ácidos;
- tampões;
- aminoácidos;
- referência, incluindo água pura.

A busca procura nome, fórmula, grupo e tipo, aceita texto sem acento e abre automaticamente os grupos com resultados. Os menus **Tubo** e **Conta-gotas** mostram o frasco em uso e fecham depois da escolha.

A biblioteca inclui ácidos e bases fortes e fracos, sais neutros/ácidos/básicos/anfóteros, sais metálicos, tampões, aminoácidos, produtos domésticos, alimentos, bebidas, fluidos do corpo e águas representativas.

### Indicadores

Há 12 opções de indicador, contando a opção sem indicador:

- bromotimol;
- fenolftaleína;
- alaranjado de metila;
- tornassol;
- universal;
- repolho roxo;
- vermelho de metila;
- verde de bromocresol;
- vermelho de fenol;
- timolftaleína;
- cúrcuma;
- sem indicador.

A cor é acompanhada por nome textual. **Realçar indicador** oculta temporariamente a cor própria da amostra para que o estudante observe somente o indicador; isso não altera o pH.

### Vidrarias

A bancada trabalha com três recipientes:

| Vidraria | Capacidades disponíveis | Uso didático |
| --- | --- | --- |
| Tubo de ensaio | 5 mL | Microescala e testes rápidos. |
| Béquer | 10, 25, 50, 100 e 250 mL | Boca larga para misturar, aquecer e transferir. |
| Erlenmeyer | 25, 50, 125 e 250 mL | Titulações e agitação com menor risco de respingos. |

A forma, a escala e o nível do líquido acompanham a capacidade escolhida. O volume inicial padrão corresponde a 20% da capacidade. Trocar a vidraria reinicia as gotas; **Desfazer** restaura a vidraria, a capacidade e o preparo anterior.

O tubo tem capacidade fixa de 5 mL. Béqueres e erlenmeyers usam marcas aproximadas, com incerteza didática de cerca de 5% da capacidade. O tamanho visual é ajustado à área disponível sem alterar proporções, cálculos ou capacidade real.

### Ajustes de preparo

Nos módulos Medir e Calcular, o estudante pode ajustar:

- concentração do tubo e do conta-gotas, de 0,0001 a 0,1 mol/L;
- diluição da amostra, incluindo como preparada, 1 + 1, 1 + 4 e 1 + 9 partes de água;
- volume inicial;
- volume de cada gota: 0,01, 0,02, 0,05 ou 0,10 mL.

O formulário valida limites antes de alterar a bancada. Aplicar novas medidas registra uma ação para **Desfazer** e reinicia as gotas do recipiente afetado.

## Preparar uma experiência

1. Abra a prateleira e selecione o módulo.
2. Escolha a vidraria e, quando disponível, a capacidade.
3. No menu **Tubo**, escolha a solução ou amostra.
4. Selecione o indicador.
5. No menu **Conta-gotas**, escolha a solução titulante.
6. Ajuste medidas quando estiver em Medir ou Calcular.
7. Use **Segure para gotejar**, <code>+5 gotas</code>, <code>+1 mL</code> ou os atalhos da capacidade.
8. Observe a cor, pH, volume e as abas do painel VER.
9. Use **Desfazer** para retornar uma ação, uma sequência de gotas ou uma troca de preparo.

No erlenmeyer, o conta-gotas é representado por uma bureta e o botão **½ gota** permite aproximar o ponto final. Agitar mistura imediatamente e anima o recipiente.

## Leituras e painel VER

### Leitura do recipiente

A área de leitura mostra:

- pH com duas casas para reagentes e indicação aproximada para amostras representativas;
- classificação Ácida, Neutra ou Básica;
- pOH, pKw e temperatura quando liberados pelo módulo;
- volume atual e capacidade do recipiente;
- cor composta, cor própria da amostra e indicador;
- variação de pH depois das gotas;
- ponto final observado, quando a cor muda;
- equivalência calculada e meia-equivalência quando aplicável;
- botão de olho para ocultar pH, escala e gráfico antes da previsão.

O pH neutro é calculado como pKw/2, portanto não é sempre 7 fora da condição de 25 °C.

### Abas do painel VER

| Aba | Função |
| --- | --- |
| **Gráfico** | Curva pH × volume adicionado, faixa de viragem, ponto final observado, equivalência, região tampão e meia-equivalência. No Calcular, mostra ΔpH/ΔV e distribuição de espécies. |
| **Partículas** | Lupa molecular com íons, moléculas, sólidos e íons espectadores. A escala linear mostra proporções; a escala logarítmica revela espécies raras. |
| **Condução** | Lâmpada, condutímetro em µS/cm ou mS/cm, participação de cada íon e curva de condutividade durante a titulação. |
| **Equação** | Ionização, hidrólise, neutralização e reações por etapa. A seta curva identifica a transferência de H⁺. Fórmulas e espécies podem levar diretamente à lupa. |
| **Histórico** | Leitura gota a gota, ponto final, equivalência, tabela completa e exportação em CSV. |

A régua de pH fica acima das abas do VER e pode mostrar a concentração de H₃O⁺ em escala logarítmica.

### Visualizações químicas

O SIAB conecta três níveis de representação:

- **Macroscópico:** cor, volume, menisco, turvação, bolhas, gotas e vidraria;
- **Submicroscópico:** espécies dissolvidas, íons espectadores, transferência de prótons e sólidos;
- **Simbólico:** fórmulas, pKa, Ka, Kb, equações, gráfico e condutividade.

A lupa usa uma semente fixa para que as partículas não mudem de posição aleatoriamente a cada renderização. As animações mostram difusão, entrada da gota, neutralização e equilíbrio dinâmico; podem ser desativadas pela acessibilidade.

## Vários tubos, seleção e relatório

A tira de tubos fica abaixo da bancada e permite trocar rapidamente o recipiente em foco. Cada cartão pode ser renomeado, removido ou aberto na visão geral.

### Visão geral

A visão geral:

- mostra de 1 a 10 recipientes;
- calcula automaticamente colunas, linhas, tamanho de cartão e orientação;
- distribui a última linha pela largura disponível;
- permite ordenar por pH;
- apresenta cor, pH, número e grupo de cada recipiente;
- oferece uma grade no desktop e uma lista vertical com alvos grandes no mobile.

### Seleção

Para iniciar a seleção:

- use **Selecionar tubos**;
- faça Ctrl + clique no Windows/Linux ou ⌘ + clique no macOS;
- pressione e segure um cartão por cerca de meio segundo;
- no celular, toque nos itens da lista vertical.

A seleção oferece **Selecionar todos**, **Revisar seleção**, **Adicionar ao relatório**, **Vincular tubos**, **Desvincular**, **Recomeçar gotas** e outras ações compatíveis com a configuração da bancada.

### Vínculos

Dois ou mais tubos podem receber as mesmas gotas e o mesmo volume de gota. Ao vincular:

- a referência é o tubo em foco, se ele estiver selecionado, ou o primeiro selecionado;
- cada tubo mantém seu indicador;
- o preparo da amostra e do conta-gotas pode permanecer independente;
- as opções **Substância do tubo** e **Conta-gotas** permitem compartilhar esses componentes;
- mudar uma parte compartilhada atualiza o grupo e reinicia gotas feitas com o reagente anterior;
- desvincular um tubo ou um conjunto remove somente os integrantes selecionados;
- grupos com apenas um integrante são desfeitos;
- **Desfazer** restaura vínculos e volumes anteriores;
- se a dose não couber em qualquer integrante, ela não é aplicada a nenhum tubo do grupo.

**Comparar indicadores** cria três cópias vinculadas da mesma titulação, com bromotimol, fenolftaleína e indicador universal.

### Relatório

O botão **Imprimir relatório** fica no painel da prateleira. Ele usa a seleção atual, a lista confirmada ou, quando não há seleção personalizada, o resumo da bancada e o tubo em foco.

O relatório inclui:

- cabeçalho com logotipo, título, data, Nome e Turma;
- tabela dos recipientes;
- preparo e leitura;
- desenho da vidraria;
- gráfico;
- tabela de gotas;
- observações e conclusão;
- nota sobre limites do modelo.

O mesmo relatório pode ser acionado com Ctrl + P ou ⌘ + P. O conteúdo é montado para impressão A4 e os controles da aplicação não aparecem no papel.

## Layout desktop, mobile e projetor

### Desktop

Acima de 900 px, a bancada mantém o arranjo amplo:

- Prateleira à esquerda;
- Experimento e vidraria no centro;
- Conta-gotas abaixo da vidraria;
- Painel VER à direita;
- Tira de tubos na parte inferior.

Prateleira e VER podem ser recolhidos em trilhos de ícones. Um cartão flutuante permite manter um painel aberto sobre a bancada sem reduzir o espaço do experimento.

### Mobile e tablet

Até 900 px, a mesma estrutura é reorganizada por tarefa:

- **Experimento:** vidraria, leitura e gotejamento;
- **Tubos:** visão geral e seleção;
- **Análises:** painel VER e escala de pH;
- **Prateleira → Preparo:** vidraria, tubo, conta-gotas e indicador;
- **Prateleira → Medidas:** volumes, diluição, concentração e gota;
- **Prateleira → Módulos:** Explorar, Medir e Calcular;
- **Prateleira → Ações:** comparar, recomeçar, remover, relatório e roteiros.

A prateleira abre como painel inferior. A barra de doses permanece acima da navegação inferior e pode ser recolhida. A lista de tubos reserva espaço para as ações de seleção, sem cobrir os controles.

O manual possui índice recolhível no celular, busca, links de retorno e mapas visuais das duas disposições.

### Modo projetor

O modo projetor está na Área do professor. Ele aumenta textos e controles para uso em sala e fica salvo em <code>siab_projetor</code>. A distribuição da bancada se recalcula quando a projeção, o tamanho do texto ou os painéis mudam.

## Motor químico e limites do modelo

O motor resolve o pH pela eletroneutralidade, com balanços de massa, volume total e autoionização da água. A solução é tratada como aquosa, ideal e com equilíbrio imediato.

### Sistemas representados

- ácidos e bases fortes;
- ácidos e bases fracos;
- ácidos e bases polipróticos;
- sais neutros, ácidos, básicos e anfóteros;
- hidrólise de sais;
- tampões;
- aminoácidos e ponto isoelétrico;
- cátions metálicos hidratados;
- suspensões pouco solúveis com Kps;
- amostras calibradas do cotidiano, do corpo e do ambiente;
- água com temperatura variável na missão específica;
- carbonato, bicarbonato e CO₂ dissolvido.

### Grandezas calculadas

- pH, pOH, pKw, [H₃O⁺] e [OH⁻];
- frações de espécies e carga média;
- concentração e grau de ionização;
- Ka, Kb, pKa e meia-equivalência;
- volume de equivalência por etapa;
- estequiometria de neutralização;
- condutividade pela lei de Kohlrausch;
- fração de CO₂ acima da solubilidade ilustrada;
- massa/quantidade de sólidos que permanecem sem dissolver;
- cor do indicador pela fração ácido/base e absorção aproximada.

A titulação calcula etapas múltiplas para sistemas como H₃PO₄ e carbonato. A temperatura padrão é 25 °C; a missão **Neutro nem sempre é 7** altera pKw para mostrar que neutralidade significa [H₃O⁺] = [OH⁻], e não necessariamente pH 7.

### Limites

O SIAB é uma representação didática:

- volumes são aditivos e a mistura é imediata;
- não há velocidade real de reação ou transporte hidrodinâmico;
- amostras de alimentos, produtos, chuva e fluidos são referências representativas;
- cores são aproximações das faixas de viragem;
- o CO₂ permanece no sistema fechado do cálculo; as bolhas são ilustração;
- não é simulado o escape real de gás;
- precipitação formada após adicionar base não é modelada como reação completa;
- condutividade usa valores ideais de diluição infinita e estimativas para íons sem dado tabelado;
- a atividade de antiácidos é didática e não orienta dose ou tratamento de saúde.

## Aprender: trilhas e missões

O modo Aprender organiza 14 missões em quatro trilhas. Cada missão segue a sequência **ler → prever → observar → agir → explicar → conferir**. Respostas, explicações e leituras são registradas no caderno.

| Trilha | Série | Missões |
| --- | --- | --- |
| **1. Cores e indicadores** | 1ª série | O que o repolho roxo revela; Um tubo, três olhares; Nem toda cor é do indicador. |
| **2. Ácidos, bases e sais** | 1ª série | Dentro da água: ionização; Forte ou concentrado?; Todo sal é neutro?; Chuva ácida e calagem. |
| **3. Quantidades e titulação** | 2ª série | Diluir muda o quê?; A curva da titulação; Estômago virtual. |
| **4. Equilíbrio, hidrólise e tampão** | 2ª série | Grau de ionização e diluição; Por que o sal muda o pH?; Laboratório do tampão; Neutro nem sempre é 7. |

As missões montam bancadas próprias e podem restringir os controles para orientar o estudante. O estado da missão fica separado da bancada livre; concluir uma missão não apaga o laboratório do usuário.

## Desafios

Os desafios são partidas curtas com pontuação, recorde e registro automático no caderno:

| Desafio | Conteúdo |
| --- | --- |
| **Amostra misteriosa** | Usar faixas de indicadores para descobrir o pH de amostras ocultas. |
| **Missão titulação** | Calcular equivalência, escolher indicador e parar no momento adequado. |
| **Super Trunfo químico** | Comparar cartas, classificar funções inorgânicas e usar memória. |
| **Régua do pH** | Posicionar amostras na escala logarítmica e comparar diferenças de acidez. |
| **Construtor de neutralização** | Montar equação, fórmula e nome do sal formado. |

Cada jogo informa recorde, quantidade de partidas e progresso local.

## Área do professor

O modo Professor permite:

- selecionar missões e desafios de qualquer trilha;
- gerar um link de aula que funciona no mesmo endereço do SIAB;
- abrir a sequência da aula em qualquer aparelho;
- imprimir um roteiro com perguntas, alternativas e linhas para respostas;
- ativar o modo projetor;
- consultar objetivos, concepções alternativas, códigos da BNCC e respostas esperadas;
- apagar o progresso local quando necessário.

A aula montada pode ser enviada como rota <code>#/aula/missao:...,...</code>. Ao abrir esse endereço, o modo Completo é ativado automaticamente.

## Caderno de laboratório

O caderno usa armazenamento local e reúne:

- previsões do recurso **Prever e gotejar**;
- explicações sobre o resultado observado;
- leituras registradas pelo estudante;
- conclusões e tabelas de gotas;
- missões concluídas;
- pontuações e recordes de desafios.

Cada leitura pode ser:

- visualizada como tabela;
- exportada como CSV;
- impressa com cabeçalho e paginação;
- apagada individualmente.

Tabelas longas são compactadas visualmente quando gotas consecutivas possuem a mesma cor e pH quase igual. Próximo ao ponto final, cada gota continua em sua própria linha. O CSV preserva todas as gotas originais.

O caderno guarda até 300 notas e não é sincronizado com servidor. Baixe o CSV para manter uma cópia em outro local.

## Acessibilidade e teclado

O painel de acessibilidade fica no cabeçalho ou no menu ☰. As preferências são salvas no navegador:

- tema claro e escuro;
- alto contraste;
- texto entre 80% e 200%;
- maior espaçamento entre letras e palavras;
- redução de animações;
- controle da animação de abertura;
- modo de leitura simples;
- simulação de protanopia, deuteranopia, tritanopia e acromatopsia;
- som proporcional ao pH;
- vibração na viragem, em aparelhos compatíveis;
- tradutor VLibras, carregado somente quando ativado;
- restauração dos padrões.

| Tecla | Ação |
| --- | --- |
| Tab / Shift + Tab | Avançar ou voltar entre controles. |
| Enter / Espaço | Ativar botões, interruptores e opções. |
| Setas ← → | Trocar de aba no painel VER. |
| Setas ↑ ↓ | Percorrer listas de escolha. |
| Esc | Fechar diálogos, menu, prateleira, cartão flutuante e tour. |
| Enter | Adicionar uma gota. |
| Espaço pressionado | Gotejar continuamente. |
| Ctrl + A ou ⌘ + A | Selecionar todos os tubos quando o foco está na seleção. |

A cor, o pH e o estado dos controles também são descritos em texto para leitores de tela.

## Instalação, PWA e uso offline

O manifesto define nome, ícones e atalhos. O service worker guarda os arquivos da aplicação em um cache separado por endereço de publicação e versão. Atualizar uma publicação não remove os caches de outros projetos no mesmo domínio.

1. Abra o endereço **HTTPS** (ou localhost, durante o desenvolvimento) com conexão e espere o carregamento terminar.
2. **Android e desktop:** use **Instalar app** quando o navegador oferecer a instalação, ou a opção equivalente do menu do navegador.
3. **iPhone/iPad:** no Safari, use **Compartilhar → Adicionar à Tela de Início**. Ative **Abrir como App da Web**, se disponível. Na ausência de instalação automática, **Menu ☰ → Aplicativo → Instalar app** abre as instruções do manual.
4. Antes da aula, feche e reabra o endereço sem conexão para conferir o cache naquele aparelho.

Instalar não é requisito para usar a bancada online. O HTML único não registra service worker. Em outros aparelhos da rede, um endereço como <code>http://192.168.x.x:8080</code> pode abrir a página, mas não equivale a localhost para instalação/cache offline.

O navegador pode bloquear ou remover cache e dados locais por suas configurações, limpeza de dados, falta de espaço ou políticas de armazenamento. Navegação privada não oferece persistência confiável entre sessões. Exporte o caderno antes de limpar dados. O VLibras é opcional e precisa de internet.

Ao receber o aviso de atualização, termine ou exporte o experimento antes de recarregar: a bancada está em memória durante a sessão. A atualização não apaga automaticamente o caderno ou as preferências.

## Compatibilidade com Android e iOS

O projeto usa detecção de recursos, em vez de decidir apenas pelo nome do navegador. A versão 0.8.2 inclui alternativas locais para <code>Array.at</code>, <code>Object.hasOwn</code>, eventos de <code>matchMedia</code> e diálogos, além de cores, foco e seleção visual sem depender exclusivamente de CSS recente.

| Ambiente | Faixa de projeto e cuidados |
| --- | --- |
| Safari no iPhone/iPad | Alvo a partir de iOS/iPadOS 14.5 (Safari 14.1); prefira versões atualizadas do sistema. As APIs de diálogo, <code>at</code> e <code>hasOwn</code> têm alternativas quando ausentes. |
| Chrome/Edge no Android | Alvo a partir de Chromium 90; mantenha também o Android System WebView atualizado quando o link abrir dentro de outro aplicativo. |
| Outros navegadores | Teste os fluxos essenciais antes de distribuir. Compartilhar o motor não garante o mesmo comportamento de instalação, download ou impressão. |
| Prévias de arquivos e navegadores de mensageiros | Não fazem parte da distribuição garantida; abra o link HTTPS no navegador completo. |
| Versões anteriores à faixa de projeto | Sem garantia de sintaxe, layout ou recursos. Uma falha de abertura detectada passa a mostrar orientação e botão para recarregar. |

Esses limites são **alvos de compatibilidade, não certificação de cada versão ou aparelho**. A matriz e os resultados desta entrega ficam em [COMPATIBILIDADE.md](COMPATIBILIDADE.md). Emulação de tela/toque e remoção de APIs no teste não substituem um iPhone, iPad ou Android físico.

Som, vibração, instalação, impressão, clipboard e downloads dependem das permissões e capacidades do navegador/sistema. A bancada não exige som ou vibração; copiar links possui alternativa por seleção do texto.

### Se a página abrir e os botões não responderem

1. Abra o link publicado diretamente no navegador, fora da prévia de um arquivo ou mensageiro.
2. Com conexão, recarregue e confira a versão em **Menu → Sobre**; feche abas antigas após atualizar.
3. Confira se o sistema e o navegador atendem à faixa de projeto.
4. Na publicação, confira arquivos ausentes/404, maiúsculas e minúsculas nos caminhos, HTTPS e inclusão da pasta <code>vendor/</code>.
5. Registre URL, aparelho, versões do sistema/navegador e o botão que falhou. Erros de console ajudam a distinguir incompatibilidade, publicação incompleta e armazenamento indisponível.

Não recomende apagar todos os dados como primeiro passo: a limpeza também pode remover o caderno e o progresso.

## Mecânicas didáticas adicionais

- **Prever e gotejar:** registra hipótese sobre número de gotas, meio e cor antes de revelar o resultado; depois pede uma explicação.
- **Tour guiado:** destaca cada região da bancada e explica sua função, com alvo alternativo para o mobile.
- **Animação de abertura:** usa o próprio motor químico para animar cinco tubos com diferentes indicadores.
- **Desfazer amplo:** mantém uma pilha de ações para gotas, preparo, vidraria, capacidade, vínculos, remoção e roteiros.
- **Pontes entre representações:** fórmulas, íons e espécies clicáveis levam à lupa correspondente.
- **Mistura geral:** recurso de descoberta que reúne o conteúdo dos tubos em um béquer de 50 mL e calcula a mistura.
- **Arco-íris do pH:** recurso de descoberta que cria tubos de indicador universal em uma faixa de pH.

Os dois recursos de descoberta podem ser registrados no caderno e desfeitos. Eles são úteis para demonstrações e exploração livre.

## Arquitetura do projeto

O projeto é modular, mas roda sem etapa de compilação:

~~~text
siab/
├── index.html                 Página e estrutura principal da aplicação
├── a11y.js                   Memória compartilhada de acessibilidade
├── manifest.webmanifest       Configuração do PWA
├── sw.js                     Service worker e cache de versão
├── build_standalone.py        Geração do HTML único
├── package.json               Scripts e metadados
├── css/
│   ├── stylesiab.css          Tema, componentes e impressão
│   └── mobile-study.css       Organização mobile até 900 px
├── js/
│   ├── core/                  Estado, loja, progresso, roteador e utilitários
│   ├── data/                  Catálogo, soluções, missões, trilhas e manual
│   ├── simulation/            Motor químico e condutividade
│   ├── ui/                    Renderização, prateleira, gotejamento, gráfico, lupa,
│   │                          equação, caderno auxiliar e responsividade
│   ├── telas/                 Bancada, manual, caderno, missões, desafios e professor
│   ├── a11y/                  Preferências do painel de acessibilidade
│   └── init/                  Inicialização da aplicação e PWA
├── vendor/dialog-polyfill/    Alternativa local para diálogos, com licença
└── tests/                     Testes de layout, DOM e compatibilidade
~~~

O namespace global <code>SIAB</code> coordena os módulos. O estado da bancada livre e o estado da missão são separados. A loja avisa os componentes quando uma ação altera o estado, e o roteador trabalha com endereços hash para funcionar também em <code>file://</code>.

## Testes

### Dependências de desenvolvimento

O uso normal não precisa de dependências npm. Para executar os testes:

~~~bash
cd siab
npm install --no-save playwright jsdom
npx playwright install --with-deps chromium webkit
~~~

Em ambientes que já possuem Chromium, informe o executável pela variável <code>SIAB_BROWSER_EXECUTABLE</code>.

### Layout e bancada

~~~bash
SIAB_BROWSER_EXECUTABLE=/caminho/para/chromium npm run test:layout
~~~

O teste cobre:

- todas as capacidades das três vidrarias;
- de 1 a 10 cartões na visão geral;
- redimensionamento, modo projetor e painéis recolhidos;
- enquadramento da vidraria, escala e conta-gotas;
- seleção no celular;
- ausência de sobreposição e rolagem inesperada.

### Seleção, relatório e vínculos

~~~bash
SIAB_JSDOM_MODULE=/caminho/para/node_modules/jsdom npm run test:selection
~~~

O teste cobre:

- seleção por clique, Ctrl/⌘ e gesto prolongado;
- seleção vertical no celular;
- impressão pelo botão da prateleira;
- relatório personalizado;
- vínculos manuais e compartilhamento de preparo;
- desvinculação, remoção e desfazer;
- capacidade de grupos;
- comparação de indicadores.

Os testes automatizados verificam estado e eventos. A inspeção visual em navegador e o teste em aparelho de toque continuam recomendados para alterações de layout.

### Compatibilidade e carregamento

~~~bash
npm run test:compatibility
~~~

Executa os fluxos em Chromium e WebKit, em desktop, celular estreito, celular e tablet; remove APIs para exercitar alternativas; bloqueia localStorage; verifica publicação em subpasta, cache e aviso de falha. Use <code>SIAB_TEST_ENGINES=chromium</code> para executar apenas um motor e <code>SIAB_STANDALONE=/caminho/SIAB.html</code> para incluir o HTML único.

No WebKit do Playwright, a verificação do cache interrompe as respostas do servidor: há uma [falha conhecida na emulação de modo offline](https://github.com/microsoft/playwright/issues/42775). Isso não certifica o modo avião de um aparelho físico.

## Publicação e manutenção

Ao publicar uma nova versão:

1. atualize <code>version</code> em <code>js/core/namespace.js</code> e <code>package.json</code>;
2. atualize o sufixo <code>?v=...</code> de cada CSS e script no <code>index.html</code>;
3. atualize <code>VERSAO</code> em <code>sw.js</code>;
4. inclua novos arquivos na lista <code>ARQUIVOS</code> do service worker;
5. execute os testes;
6. gere o HTML único, se ele fizer parte da entrega;
7. publique a pasta e aguarde o aviso de atualização do PWA.

A versão atual é **0.8.2**. O manual dentro da aplicação documenta cada parte da bancada e possui mapas do layout desktop e mobile.

## Privacidade, referências e licença

### Privacidade

O SIAB não possui conta, backend, analytics ou envio automático de dados. O navegador armazena localmente:

- modo de navegação;
- preferências de acessibilidade;
- progresso das missões;
- recordes;
- caderno;
- última tela visitada;
- preferência de projetor e instalação.

O VLibras só é carregado quando o usuário ativa o recurso e requer conexão com a internet.

### Referências do motor

As constantes, faixas e modelos são documentados na janela **Sobre o SIAB → Referências**. O projeto utiliza, entre outras fontes:

- OpenStax, *Chemistry 2e*, capítulos de ácidos e bases, constantes de ionização, Kps e titulações;
- D. C. Harris, *Análise Química Quantitativa*;
- *CRC Handbook of Chemistry and Physics*, incluindo condutividade iônica limite;
- Nelson e Cox, *Princípios de Bioquímica de Lehninger*, para aminoácidos;
- Baes e Mesmer, *The Hydrolysis of Cations*, para cátions metálicos hidratados;
- Bandura e Lvov, para a variação de pKw da água com a temperatura.

Os valores representam uma aproximação educacional. Consulte a tela **Sobre o SIAB** para a lista de links e observações de cada fonte.

### Licença

Este projeto é distribuído sob a [GNU General Public License v3.0](LICENSE). A dependência local [dialog-polyfill 0.5.6](https://github.com/GoogleChrome/dialog-polyfill) é distribuída sob BSD-3-Clause; seu aviso está em [vendor/dialog-polyfill/LICENSE](vendor/dialog-polyfill/LICENSE) e permanece incluído no HTML único.


### Referências de compatibilidade

- [GitHub Pages: publicação estática](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) e [HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).
- [Safari 14.1 e iOS/iPadOS 14.5](https://webkit.org/blog/11648/new-webkit-features-in-safari-14-1/) e [APIs introduzidas no Safari 15.4](https://webkit.org/blog/12445/new-webkit-features-in-safari-15-4/).
- [Apple: adicionar sites à tela inicial](https://support.apple.com/pt-br/guide/iphone/iph42ab2f3a7/ios).
- [WebKit: políticas de armazenamento](https://webkit.org/blog/14403/updates-to-storage-policy/).
