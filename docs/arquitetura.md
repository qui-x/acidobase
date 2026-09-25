# Arquitetura do SIAB 0.5.5 — guia para quem está começando

Este guia explica como o código está organizado e como fazer as mudanças mais
comuns: criar uma missão, acrescentar um frasco à prateleira e criar um desafio.

## 1. Ideia geral

O SIAB é uma página só (`index.html`) com várias **telas**. O endereço depois
do `#` diz qual tela aparece: `#/laboratorio`, `#/manual/prateleira`, `#/missao/tampao`…
Não há servidor nem biblioteca externa: HTML, CSS e JavaScript puros, que
funcionam até abrindo o arquivo direto no navegador.

```
            dados (js/data)          motor químico (js/simulation)
                 │                            │
                 ▼                            ▼
  estado da bancada (js/core/estado.js) ──► SIAB.chem.solve(tubo) → pH, cor…
                 │
     SIAB.alterar(…)   (js/core/loja.js: guarda para Desfazer e avisa)
                 │
                 ▼
   desenho da tela (js/ui/render.js, js/ui/*.js)  ◄── telas (js/telas)
```

Toda mudança na bancada passa por `SIAB.alterar(descrição, função)`. Ela guarda
uma cópia para o botão **Desfazer** e avisa as partes da tela que precisam ser
redesenhadas. Assim ninguém esquece de atualizar a tela.

## 2. Pastas

| Pasta | O que tem |
| --- | --- |
| `js/core/` | espaço de nomes, utilidades, estado, loja, progresso salvo e roteador |
| `js/data/` | catálogo de soluções e indicadores, amostras, sais, funções inorgânicas, missões e trilhas |
| `js/simulation/` | motor químico (`quimica.js`) e motor de missões (`motor-missoes.js`) |
| `js/ui/` | componentes: tubo, régua de pH, gráfico, lupa, equação, prateleira, módulos (`modulos.js`), conta-gotas, som; menu ☰ (`gaveta.js`), painéis recolhíveis (`trilho.js`), tour guiado (`tour.js`) e animação de abertura (`abertura.js`) |
| `js/telas/` | cada tela: bancada, laboratório, missão, início, trilhas, desafios (um arquivo por jogo), professor, caderno |
| `js/a11y/` | interruptores do painel de acessibilidade e o tradutor de Libras (usa o `a11y.js` da raiz) |
| `js/init/` | inicialização (`app.js`) e aplicativo instalável (`pwa.js`) |
| `css/stylesiab.css` | estilos, em seções numeradas e comentadas |
| `sw.js`, `manifest.webmanifest`, `assets/icones/` | PWA: funcionamento sem internet e instalação |
| `tests/` | testes automáticos |
| `tools/servidor.cjs` | servidor local para testar o PWA |

A ordem dos `<script>` no `index.html` importa: primeiro dados e motor, depois
estado, interface, telas e, por último, `app.js`. A exceção é o
`js/ui/abertura.js`, que vem logo depois do estado: a animação começa enquanto
o resto carrega.

### Modos: só a bancada ou completo

`SIAB.MODO` vale `'bancada'` (padrão) ou `'completo'`. O usuário troca em Menu ☰
→ Modos, que chama `SIAB.definirModo(modo)` (em `js/core/roteador.js`). A
escolha fica no armazenamento local `siab_modo`.

- No HTML, o que só existe no modo completo tem o atributo `data-completo` e o
  CSS esconde no modo bancada. `data-so-bancada` faz o contrário.
- Uma tela com `completo: true` (por exemplo `SIAB.telas.desafios`) leva à
  bancada no modo bancada. Com `ligaCompleto: true` (a tela da aula), o
  endereço liga o modo completo sozinho.

### Vidraria

`SIAB.state.vidraria` vale `'tubo'` (padrão, e não fica salvo), `'bequer'` ou
`'erlenmeyer'`. Os nomes e dicas estão em `SIAB.VIDRARIAS` (`js/core/estado.js`)
e os desenhos, em `SIAB.VIDRO` (`js/ui/tubo.js`). Cada forma diz a altura do
líquido para cada fração do volume: tubo e béquer são cilindros (reta); o
erlenmeyer calcula o volume de um cone fatia por fatia, por isso as marcas não
ficam igualmente espaçadas. A capacidade escolhida fica em `SIAB.state.capacidades`
(`{ bequer, erlenmeyer }`; o tubo tem sempre 5 mL) e as opções, em
`SIAB.VIDRARIAS[v].capacidades`. Um tubo pode ter vidraria e capacidade próprias
(`t.vidraria`, `t.capacidade`): é o caso do béquer da mistura geral. Use
`SIAB.capacidade(t)` em vez de `SIAB.CAPACITY_ML`. O "Desfazer" guarda também a
vidraria e as capacidades.

### Movimento das gotas

O tubo em foco é desenhado por `SIAB.vidro.desenhar` (em `js/ui/tubo.js`), que
ATUALIZA o SVG em vez de recriá-lo: o grupo `.liquido` sobe com transição e a
cor muda suavemente. `SIAB.vidro.gota` anima uma gota com a Web Animations API
(formação, queda, ondas, respingos e nuvem de cor) e devolve em quantos ms ela
chega. Até lá, o nível e a cor esperam. Não há movimento com "Reduzir
animações".

### Painéis recolhidos (trilho)

`js/ui/trilho.js` segue o trilho do SIMA: recolhido, cada ícone abre só uma
`.painel-secao` (Módulos, Vidraria, Frascos, Indicador, Ajustes, Ações) num
cartão flutuante (`.flutuando`), ou a aba escolhida do VER. `SIAB.trilho.mostrar(painel, parte)`
serve aos dois casos: flutua se estiver recolhido, rola até a parte se não. O
tour chama `suspender()` e `retomar()`.

### Módulos e menus de frascos (prateleira)

`js/ui/modulos.js` guarda em `SIAB.MODULOS` o texto de cada módulo (o que
propõe, o que libera, uma nota) e monta os três cartões recolhíveis em
`#modulos`. Um cartão aberto por vez; "Ativar módulo" muda
`SIAB.state.level` ('explorar', 'medir' ou 'calcular') e redesenha. O resto
do programa continua lendo `state.level`, então nada mais precisou mudar.

`js/ui/prateleira.js` mostra dois menus, `#menu-tubo` e `#menu-gotas`, com o
frasco em uso. `SIAB.prateleira.abrir(destino)` move a lista
(`#menu-frasco-corpo`, com a busca e `#shelf`) para baixo do menu escolhido e
define `state.destination`; `fechar()` esconde e limpa a busca. A lista só é
desenhada com o menu aberto. Os grupos são `<details>`: abre o do frasco em
uso, a busca abre os que têm resultado, e os que a pessoa abre ou fecha ficam
lembrados enquanto o menu está aberto.

### Mistura de vários componentes (motor)

Um tubo pode ter `componentes: [{ id, concentration, volume, dilution }]` no
lugar da solução inicial. O balanço de cargas soma todos, cada um diluído pelo
volume total. `indicadores: [{ id, fracao }]` guarda vários indicadores, e
`SIAB.chem.colorMix` mistura as cores na proporção de cada um.
`SIAB.misturarTubos(tubos)` (função pura, em `estado.js`) junta tudo o que há
nos tubos; os testes estão em `tests/mistura.test.cjs`.

### Segredos

`js/ui/segredo.js` guarda os dois segredos (Arco-íris do pH e Mistura geral),
descritos no comentário do topo do arquivo. Eles não aparecem no manual.

### A bancada começa vazia

`js/core/estado.js` não cria tubos. Com a bancada vazia, `SIAB.render` chama
`SIAB.renderVazia` (em `js/ui/render.js`), que mostra o aviso "Bancada vazia".
O CSS (`.workspace.vazia`) esconde o que precisa de um tubo: leitura,
conta-gotas, indicador e ajustes. Tocar num frasco (`colocar`, em
`js/telas/bancada.js`) cria o "Tubo 1". Remover o último tubo volta ao vazio, e
"Desfazer" traz o tubo de volta. Quem usa `SIAB.current()` precisa aceitar que
ele seja `undefined`.

## 3. Como criar uma missão

As missões são **dados**, não lógica. Abra `js/data/missoes.js`, copie uma
missão parecida e troque os textos. O comentário no topo do arquivo explica
cada campo. Resumo:

```js
{
  id: 'minha-missao', trilha: 2, titulo: 'Título curto',
  resumo: 'Uma frase para a lista de trilhas.',
  professor: { objetivo: '…', concepcoes: ['C1'], bncc: ['EM13CNT301'] },
  bancada: {
    tubos: [{ name: 'Tubo A', solution: 'hcl', concentration: .01, titrant: 'naoh', indicator: 'btb' }],
    mostrarPH: false, nivel: 'medir', ver: ['grafico'], controles: ['gotas']
  },
  passos: [
    { tipo: 'ler', titulo: '…', texto: '…' },
    { tipo: 'prever', id: 'p1', titulo: 'Prever', pergunta: '…?', opcoes: ['A', 'B'], gabarito: 'A' },
    { tipo: 'agir', titulo: 'Agir', texto: 'Goteje até…',
      concluido: ctx => ctx.tubo('Tubo A').r.pH > 7,
      demo: () => SIAB.demo.gotas('Tubo A', 21) },
    { tipo: 'observar', titulo: 'Observar', revelar: ['ph'], conferir: 'p1', texto: '…' },
    { tipo: 'quiz', id: 'q1', titulo: 'Conferir', pergunta: '…?', opcoes: ['…', '…'], correta: 0, explicacao: '…' },
    { tipo: 'explicar', id: 'e1', titulo: 'Explicar', pergunta: '…?', modelo: 'Resposta possível.' }
  ]
}
```

Depois:

1. Coloque o `id` em uma trilha, em `js/data/trilhas.js`.
2. Rode `npm test`. O teste `tests/missoes.test.cjs` percorre a missão sozinho.
   Ele confere se a demonstração conclui cada passo "agir" e se os gabaritos
   estão entre as opções.
3. Use `ctx.tubo(nome).r` para ler o resultado do motor: `pH`, `volume`,
   `added` (mL gotejados), `drops` e `phase` (Ácida, Neutra ou Básica).

## 4. Como acrescentar um frasco à prateleira

Os frascos vêm de `SIAB.solutions`. Reagentes estão em `js/data/catalogo.js`;
sais e tampões em `js/data/sais.js`; antiácidos e chuva em
`js/data/ambiente-saude.js`. Cada frasco tem `group`, que define a prateleira
onde ele aparece. Um sal novo, por exemplo:

```js
kno3: { name: 'Nitrato de potássio', formula: 'KNO₃', kind: 'salt', label: 'Sal de ácido forte e base forte',
        group: 'salts', systems: [], chargePerUnit: 0,
        spectators: [{ formula: 'K⁺', perUnit: 1 }, { formula: 'NO₃⁻', perUnit: 1 }],
        ionization: 'KNO₃ → K⁺ + NO₃⁻', hydrolysis: 'Nenhum íon reage com a água.' }
```

Toda constante nova precisa de fonte em `docs/modelo-quimico.md` e de um teste
em `tests/sais-ambiente.test.cjs` comparando com um valor de livro.

## 5. Como criar um desafio

Crie `js/telas/meu-jogo.js` registrando o jogo:

```js
SIAB.desafios.meujogo = {
  titulo: 'Nome do jogo', conteudo: 'Tema', resumo: 'Uma frase.',
  montar(elemento) { /* desenha dentro de elemento e liga os eventos */ },
  desmontar() { /* remove eventos e para cronômetros */ }
};
```

Use `SIAB.cabecalhoJogo(id)` para o cabeçalho e `SIAB.fimDePartida(id, pontos, linhas)`
para salvar o recorde e anotar no caderno. Depois:

1. Acrescente o `<script>` no `index.html`.
2. Acrescente o arquivo à lista `ARQUIVOS` do `sw.js`. O teste `tests/pwa.test.cjs`
   avisa se você esquecer.
3. Coloque o desafio em uma trilha, se quiser.

## 6. Testes

| Comando | O que faz |
| --- | --- |
| `npm test` | química, amostras, sais e ambiente, todas as missões, manual, mistura geral e o PWA (sem navegador) |
| `npm run test:e2e` | 113 testes no Chromium: bancada (começando vazia), vidraria, 14 missões, 5 desafios, professor, caderno, menu ☰, modos, acessibilidade, painéis recolhidos, tour, animação de abertura, segredos, celular, uso sem internet e atualização |
| `npm start` | servidor local em http://localhost:8080 |
| `npm run build` | gera um HTML único (sem instalação como app) |

Para os testes de navegador: `npm install` e depois `npx playwright install chromium`.

## 7. Publicar uma versão nova

O navegador guarda arquivos no cache. Se o `index.html` for novo e o `app.js`
continuar antigo, o app quebra. Para evitar isso, a versão aparece em três
lugares, que precisam ser iguais:

1. `js/core/namespace.js`: `version: '0.5.4'`;
2. `index.html`: o final `?v=0.5.4` de cada `<script>` e do CSS;
3. `sw.js`: `const VERSAO = 'siab-0.5.4'`.

Ao publicar, troque os três (no `index.html`, use "substituir tudo" de
`?v=0.5.4` pela versão nova). Arquivo `.js` novo? Acrescente também na lista
`ARQUIVOS` do `sw.js`. O `npm test` avisa se algum ficou diferente. O
service worker novo baixa tudo direto do servidor (`cache: 'reload'`), assume
sozinho e a página mostra "Recarregar".

## 8. Onde o progresso fica guardado

No `localStorage` do navegador, sem conta e sem envio de dados:

- `siab_progresso_v1`: missões concluídas, recordes e caderno. Uma leitura
  guarda a tabela de gotas em `tabela: { colunas, linhas }`; notas antigas, com
  a tabela em texto, são convertidas ao abrir;
- `siab_a11y_prefs`: tema, contraste, fonte, espaçamento, leitura simples,
  animações e filtros (via `a11y.js`);
- `siab_som_v1`: som do pH e vibração;
- `siab_modo`: `bancada` ou `completo`;
- `siab_trilho_v1`: painéis recolhidos no computador;
- `siab_abertura`: `off` desliga a animação de abertura;
- `siab_libras_v1`: tradutor de Libras ligado;
- `siab_manual_visto`: o aviso de boas-vindas já foi fechado;
- `siab_projetor`: modo projetor.

Se o navegador bloquear o armazenamento, o SIAB funciona normalmente, mas sem
guardar o progresso.
