# Arquitetura do SIAB 0.3 — guia para quem está começando

Este guia explica como o código está organizado e como fazer as mudanças mais
comuns: criar uma missão, acrescentar um frasco à prateleira e criar um desafio.

## 1. Ideia geral

O SIAB é uma página só (`index.html`) com várias **telas**. O endereço depois
do `#` diz qual tela aparece: `#/inicio`, `#/laboratorio`, `#/missao/tampao`…
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
| `js/ui/` | componentes: tubo, régua de pH, gráfico, lupa, equação, prateleira, conta-gotas, som |
| `js/telas/` | cada tela: bancada, laboratório, missão, início, trilhas, desafios (um arquivo por jogo), professor, caderno |
| `js/a11y/` | painel de acessibilidade (usa o `a11y.js` da raiz) |
| `js/init/` | inicialização (`app.js`) e aplicativo instalável (`pwa.js`) |
| `css/stylesiab.css` | estilos, em seções numeradas e comentadas |
| `sw.js`, `manifest.webmanifest`, `assets/icones/` | PWA: funcionamento sem internet e instalação |
| `tests/` | testes automáticos |
| `tools/servidor.cjs` | servidor local para testar o PWA |

A ordem dos `<script>` no `index.html` importa: primeiro dados e motor, depois
estado, interface, telas e, por último, `app.js`.

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
| `npm test` | química, amostras, sais e ambiente, todas as missões e o PWA (sem navegador) |
| `npm run test:e2e` | 72 testes no Chromium: laboratório, 14 missões, 5 desafios, professor, caderno, acessibilidade, celular e uso sem internet |
| `npm start` | servidor local em http://localhost:8080 |
| `npm run build` | gera um HTML único (sem instalação como app) |

Para os testes de navegador: `npm install` e depois `npx playwright install chromium`.

## 7. Onde o progresso fica guardado

No `localStorage` do navegador, sem conta e sem envio de dados:

- `siab_progresso_v1`: missões concluídas, recordes e caderno;
- `siab_a11y_prefs`: tema, fonte e filtros (via `a11y.js`);
- `siab_som_v1`: som do pH e vibração;
- `siab_projetor`: modo projetor.

Se o navegador bloquear o armazenamento, o SIAB funciona normalmente, mas sem
guardar o progresso.
