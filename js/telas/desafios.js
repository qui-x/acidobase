'use strict';
/* Desafios: registro dos jogos, lista e tela de jogo.
   Cada jogo (detetive.js, titulacao.js…) registra-se em SIAB.desafios com
   titulo, resumo, conteudo, montar(elemento) e, se precisar, desmontar(). */
SIAB.desafios = {};

// Cabeçalho comum dos jogos, com título focável e recorde.
SIAB.cabecalhoJogo = (id, subtitulo) => {
  const d = SIAB.desafios[id];
  const registro = SIAB.progresso.desafio(id);
  return `<header class="jogo-cabecalho">
    <a class="quiet-btn voltar" href="#/desafios">← Desafios</a>
    <p class="eyebrow">DESAFIO · ${SIAB.escape(d.conteudo.toUpperCase())}</p>
    <h1 data-foco tabindex="-1">${SIAB.escape(d.titulo)}</h1>
    <p>${SIAB.escape(subtitulo || d.resumo)}</p>
    <p class="recorde">${registro ? `Seu recorde: <strong>${registro.recorde}</strong> pontos · ${registro.vezes} ${registro.vezes === 1 ? 'partida' : 'partidas'}` : 'Primeira partida'}</p>
  </header>`;
};

// Fim de partida: registra a pontuação e anota no caderno.
SIAB.fimDePartida = (id, pontos, linhas) => {
  const recorde = SIAB.progresso.registrarPartida(id, pontos);
  SIAB.progresso.anotar({ tipo: 'desafio', titulo: `Desafio · ${SIAB.desafios[id].titulo}`, linhas: [['Pontuação', `${pontos}${recorde ? ' (novo recorde!)' : ''}`], ...linhas] });
  SIAB.announce(`Fim de partida: ${pontos} pontos.${recorde ? ' Novo recorde!' : ''}`);
  return recorde;
};

SIAB.telas.desafios = {
  secao: 'desafios',
  titulo: () => 'Desafios',
  entrar() {
    SIAB.$('desafios-lista').innerHTML = Object.entries(SIAB.desafios).map(([id, d]) => {
      const registro = SIAB.progresso.desafio(id);
      return `<a class="cartao" href="#/desafio/${id}">
        <span class="eyebrow">${SIAB.escape(d.conteudo.toUpperCase())}</span>
        <strong>${SIAB.escape(d.titulo)}</strong>
        <span>${SIAB.escape(d.resumo)}</span>
        <span class="cartao-meta">${registro ? `Recorde: ${registro.recorde} pontos` : 'Ainda não jogado'}</span>
      </a>`;
    }).join('');
  }
};

SIAB.telas.desafio = {
  secao: 'jogo',
  menu: 'desafios',
  titulo: id => (Object.hasOwn(SIAB.desafios, id) ? SIAB.desafios[id].titulo : 'Desafio'),
  atual: null,
  entrar(id) {
    const d = Object.hasOwn(SIAB.desafios, id) ? SIAB.desafios[id] : null;
    if (!d) { SIAB.irPara('#/desafios'); return; }
    this.atual = d;
    SIAB.progresso.marcarUltima(`#/desafio/${id}`, `Desafio: ${d.titulo}`);
    d.montar(SIAB.$('jogo'));
  },
  sair() {
    this.atual?.desmontar?.();
    this.atual = null;
    SIAB.$('jogo').innerHTML = '';
  }
};
