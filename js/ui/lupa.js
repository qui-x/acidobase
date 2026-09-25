'use strict';
/* Lupa molecular (M4): nível submicroscópico.
   Desenha as espécies dissolvidas em proporção às concentrações calculadas.
   Limite declarado na tela: as moléculas de água não aparecem (≈ 55,5 mol/L). */
SIAB.lupa = (() => {
  const MAX = 36;                       // partículas da espécie mais abundante
  const COLUNAS = 18, LINHAS = 10;
  // Cores bem diferentes entre si; H₃O⁺ (vermelho) e OH⁻ (azul) têm cores fixas.
  const CORES = ['#e879f9', '#34d399', '#fbbf24', '#22d3ee', '#fb923c', '#a78bfa', '#a3e635', '#f9a8d4', '#94a3b8'];

  // Sorteio com semente fixa: as partículas não "pulam" a cada gota.
  function celulas() {
    let semente = 7;
    const aleatorio = () => (semente = (semente * 16807) % 2147483647) / 2147483647;
    const lista = [];
    for (let l = 0; l < LINHAS; l++) for (let c = 0; c < COLUNAS; c++) lista.push([c, l]);
    for (let i = lista.length - 1; i > 0; i--) {
      const j = Math.floor(aleatorio() * (i + 1));
      [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    return lista.map(([c, l]) => [c, l, aleatorio(), aleatorio()]);
  }
  const POSICOES = celulas();

  function corDa(formula, indice) {
    if (formula === 'H₃O⁺') return '#f87171';
    if (formula === 'OH⁻') return '#60a5fa';
    return CORES[indice % CORES.length];
  }

  function dados(tube, result = SIAB.chem.solve(tube)) {
    const especies = SIAB.chem.species(tube, result);
    const maior = Math.max(...especies.map(e => e.conc));
    return especies.map((e, i) => ({
      ...e,
      cor: corDa(e.formula, i),
      quantidade: maior > 0 ? Math.round(MAX * e.conc / maior) : 0
    }));
  }

  function html(tube, { nivel = 'explorar', result = SIAB.chem.solve(tube) } = {}) {
    const lista = dados(tube, result);
    const desenho = [];
    let posicao = 0;
    for (const especie of lista) {
      for (let k = 0; k < especie.quantidade && posicao < POSICOES.length; k++, posicao++) {
        const [c, l, dx, dy] = POSICOES[posicao];
        const cx = 12 + c * 17.6 + dx * 6, cy = 12 + l * 17.6 + dy * 6;
        const atraso = ((c * 7 + l * 3) % 10) / 10;
        if (especie.type === 'solid') {
          desenho.push(`<rect class="particula solido" x="${cx - 6}" y="${cy - 6}" width="12" height="12" rx="2" fill="${especie.cor}"/>`);
        } else {
          const carga = /⁺/.test(especie.formula) ? '+' : /⁻/.test(especie.formula) ? '−' : '';
          desenho.push(`<g class="particula" style="animation-delay:-${atraso}s"><circle cx="${cx}" cy="${cy}" r="${especie.type === 'molecule' ? 7 : 6}" fill="${especie.cor}" ${especie.type === 'molecule' ? 'stroke="currentColor" stroke-width="1.5"' : ''}/>${carga ? `<text x="${cx}" y="${cy + 3.5}" text-anchor="middle">${carga}</text>` : ''}</g>`);
        }
      }
    }
    const legenda = lista.map(e => {
      const numero = e.quantidade > 0 ? `${e.quantidade} ${e.quantidade === 1 ? 'partícula' : 'partículas'}` : 'traço (menos de 1 nesta escala)';
      const conc = nivel === 'calcular' ? ` · ${SIAB.cientifico(e.conc)} mol/L` : '';
      const tipo = e.type === 'solid' ? 'sólido' : e.type === 'molecule' ? 'molécula' : 'íon';
      return `<li><span class="legenda-cor ${e.type}" style="background:${e.cor}" aria-hidden="true"></span><strong>${SIAB.escape(e.formula)}</strong> <span class="small">${tipo} · ${numero}${conc}</span></li>`;
    }).join('');

    const inicial = SIAB.solutions[tube.solution];
    let destaque = '';
    if (inicial.kind === 'weakAcid') {
      const alfa = SIAB.chem.alpha(inicial.ka, result.pH);
      const inteiras = Math.round((1 - alfa) / alfa);
      destaque = `<p class="lupa-destaque">Grau de ionização α ≈ ${SIAB.format(alfa * 100, 1)} %: para cada ${inteiras} moléculas de ${inicial.acidForm} inteiras, cerca de 1 se ionizou.</p>`;
    } else if (inicial.kind === 'strongAcid' && !tube.additions.length) {
      destaque = `<p class="lupa-destaque">Ácido forte: praticamente não sobra ${inicial.formula} inteiro. As moléculas se ionizaram em H₃O⁺ e ${inicial.anion}.</p>`;
    } else if (inicial.kind === 'suspension') {
      destaque = '<p class="lupa-destaque">Quadrados: sólido não dissolvido. Ele dissolve à medida que o ácido consome OH⁻.</p>';
    }
    const descricao = lista.filter(e => e.quantidade > 0).map(e => `${e.quantidade} ${e.formula}`).join(', ');
    return `<div class="lupa">
      <svg class="lupa-svg" viewBox="0 0 320 180" role="img" aria-label="Partículas dissolvidas nesta escala: ${SIAB.escape(descricao)}.">${desenho.join('')}</svg>
      ${destaque}
      <ul class="lupa-legenda">${legenda}</ul>
      <p class="field-hint">Escala: a espécie mais abundante tem ${MAX} partículas. Moléculas de água não aparecem: há cerca de 55,5 mol/L delas, muito mais que o soluto.</p>
    </div>`;
  }

  return { html, dados };
})();
