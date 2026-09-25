# SIAB — A química das cores · versão 0.3.0

**SIAB — Simulador Interativo de Ácidos e Bases.** Missões guiadas, desafios e
uma bancada de laboratório para ensinar ácidos e bases no ensino médio.
Funciona no computador e no celular, com ou sem internet, e pode ser instalado
como aplicativo.

## Como abrir

| Forma | Como | Instala como app? |
| --- | --- | --- |
| Arquivo | Abra `index.html` no navegador | Não, mas funciona igual |
| Servidor local | `npm start` e acesse http://localhost:8080 | Sim |
| Publicado | Publique a pasta em um endereço https (por exemplo, GitHub Pages) | Sim |
| Arquivo único | `npm run build` gera um HTML só | Não |

**Para instalar:** abra pelo endereço http(s) e use o botão **Instalar app** no
topo, ou o menu do navegador ("Instalar aplicativo" / "Adicionar à tela de
início"). Depois da primeira visita, o SIAB abre sem internet. Quando houver
versão nova, aparece o aviso "Nova versão disponível · Atualizar".

## O que há na versão 0.3

Quatro caminhos a partir da tela inicial:

- **Aprender:** 4 trilhas com 14 missões guiadas (ler → prever → observar →
  agir → explicar → conferir). As respostas vão para o caderno.
- **Desafios:** 5 jogos com pontuação e recorde: Amostra misteriosa, Missão
  titulação, Super Trunfo químico, Régua do pH e Construtor de neutralização.
- **Laboratório:** bancada livre com prateleira de frascos e níveis
  Explorar, Medir e Calcular.
- **Professor:** montar aula com link para a turma, roteiro impresso,
  respostas esperadas e modo projetor.

Na bancada:

- **Conta-gotas dinâmico:** segure para gotejar; +5 gotas; +1 mL. No teclado,
  Enter adiciona 1 gota e segurar Espaço goteja.
- **Painel VER:** gráfico da titulação ao vivo, lupa de partículas, equações e
  histórico. Tudo muda junto a cada gota.
- **Prever e gotejar:** registra previsão, resultado e explicação no caderno.
- **Desfazer amplo:** desfaz qualquer ação (gotas, frascos, medidas, remoção).
- **Novos frascos:** sais (NaCl, NH₄Cl, CH₃COONa, Na₂CO₃), tampões acetato e
  fosfato, antiácidos Mg(OH)₂ e Al(OH)₃, água de cal e água da chuva (limpa e
  ácida).
- **Caderno de laboratório:** previsões, missões, leituras e pontuações, com
  download em CSV.

Acessibilidade: temas escuro, claro e alto contraste; fonte até 200 %;
filtros de percepção de cor; cor sempre descrita em texto; teclado em todos os
controles; som do pH (tom mais agudo com pH maior) e vibração na viragem,
ambos opcionais.

## Mapa das mecânicas (propostas em `docs/`)

| Mecânica | Onde está |
| --- | --- |
| M1 Prever antes da gota | "Prever e gotejar" no laboratório; passos "prever" das missões |
| M2 Amostra misteriosa | Desafios |
| M3 Régua do pH | Desafios |
| M4 Lupa molecular | Painel VER → Partículas; missões "Dentro da água" e "Grau de ionização" |
| M5 Gráfico ao vivo | Painel VER → Gráfico; missão "A curva da titulação" |
| M6 Missão titulação | Desafios |
| M7 Construtor de neutralização | Desafios |
| M8 Super Trunfo | Desafios |
| M9 Laboratório do tampão | Missão "Laboratório do tampão" |
| M10 Todo sal é neutro? | Missões "Todo sal é neutro?" e "Por que o sal muda o pH?" |
| M11 Estômago virtual | Missão "Estômago virtual" |
| M12 Chuva ácida e calagem | Missão "Chuva ácida e calagem" |
| M13 Duelo força × concentração | Missão "Forte ou concentrado?" |
| M14 Caderno de laboratório | Caderno; Histórico → CSV |
| M15 Neutro nem sempre é 7 | Missão "Neutro nem sempre é 7" |

## Testes

```
npm test            # química, sais, missões e PWA, sem navegador
npm install         # uma vez, para os testes no navegador
npx playwright install chromium
npm run test:e2e    # 72 testes no Chromium, incluindo celular e sem internet
```

Resultados da última validação: `tests/RESULTADOS.md`.

## Documentação

- `docs/arquitetura.md` — como o código está organizado e como criar missões, frascos e desafios.
- `docs/modelo-quimico.md` — equações, constantes, fontes e limites do modelo.
- `docs/cotidiano.md` — amostras do cotidiano e seus parâmetros.
- `docs/proposta-conteudo-e-mecanicas.md` e `docs/proposta-ui-ux.md` — propostas que deram origem a esta versão.

## Limites

Os valores são referências didáticas. Soluções ideais a 25 °C (só uma missão
muda Kw), volumes aditivos e equilíbrio imediato. Amostras do cotidiano e da
chuva são representativas (símbolo ≈). Não se simulam escape de CO₂, espuma,
precipitação, coagulação nem a velocidade das reações. As atividades sobre
antiácidos são didáticas e não são orientação de saúde.

O progresso fica guardado só no navegador deste aparelho. Não há contas nem
envio de dados.

Base: estrutura modular da família de simuladores (SIQC, SIMA, SIFI); motor
`a11y.js` compartilhado. Licença: GNU GPL v3 (arquivo `LICENSE`).
