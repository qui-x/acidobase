'use strict';
/* Trilhas de aprendizagem: missões e desafios em sequência. */
SIAB.itemDaTrilha = item => {
  const p = SIAB.progresso;
  if (item.tipo === 'missao') {
    const m = SIAB.missoes.find(x => x.id === item.id);
    const feita = p.missao(item.id)?.concluida;
    return { rota: `#/missao/${item.id}`, titulo: m.titulo, resumo: m.resumo, tipo: 'Missão', feito: feita, status: feita ? 'Concluída ✓' : `${m.passos.length} passos` };
  }
  const d = SIAB.desafios[item.id];
  const registro = p.desafio(item.id);
  return { rota: `#/desafio/${item.id}`, titulo: d.titulo, resumo: d.resumo, tipo: 'Desafio', feito: Boolean(registro), status: registro ? `Recorde: ${registro.recorde} pontos` : 'Ainda não jogado' };
};

SIAB.telas.aprender = {
  secao: 'aprender',
  titulo: () => 'Aprender',
  entrar() {
    SIAB.$('trilhas').innerHTML = SIAB.trilhas.map(trilha => {
      const itens = trilha.itens.map(SIAB.itemDaTrilha);
      const feitos = itens.filter(x => x.feito).length;
      return `<section class="trilha" aria-labelledby="trilha-${trilha.id}">
        <header class="trilha-cabecalho">
          <p class="eyebrow">TRILHA ${trilha.id} · ${SIAB.escape(trilha.serie.toUpperCase())}</p>
          <h2 id="trilha-${trilha.id}">${SIAB.escape(trilha.titulo)}</h2>
          <p>${SIAB.escape(trilha.descricao)}</p>
          <div class="barra" role="progressbar" aria-label="Progresso da trilha ${trilha.id}" aria-valuemin="0" aria-valuemax="${itens.length}" aria-valuenow="${feitos}" aria-valuetext="${feitos} de ${itens.length}"><span style="width:${(feitos / itens.length) * 100}%"></span></div>
        </header>
        <ol class="trilha-itens">${itens.map((x, i) => `<li><a class="item-trilha ${x.feito ? 'feito' : ''}" href="${x.rota}">
          <span class="item-numero" aria-hidden="true">${x.feito ? '✓' : i + 1}</span>
          <span class="item-texto"><span class="item-tipo">${x.tipo}</span><strong>${SIAB.escape(x.titulo)}</strong><span>${SIAB.escape(x.resumo)}</span></span>
          <span class="item-status">${SIAB.escape(x.status)}</span>
        </a></li>`).join('')}</ol>
      </section>`;
    }).join('');
  }
};
