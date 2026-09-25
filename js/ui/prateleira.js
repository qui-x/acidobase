'use strict';
/* Prateleira de frascos (substitui o antigo formulário de substância).
   Tocar em um frasco coloca a solução no tubo ou no conta-gotas. */
SIAB.prateleira = (() => {
  const VIDRO = [214, 226, 240];

  function corDoFrasco(solution) {
    if (solution.natural && solution.natural.opacity > .05) return `rgb(${solution.natural.rgb.join(',')})`;
    return `rgba(${VIDRO.join(',')},.35)`;
  }

  function render() {
    const box = SIAB.$('shelf');
    if (!box) return;
    const s = SIAB.state, t = SIAB.current();
    const query = SIAB.normalizar(SIAB.$('shelf-search').value);
    const destino = t
      ? (s.destination === 'tube' ? 'no tubo' : 'no conta-gotas')
      : (s.destination === 'tube' ? 'num tubo novo' : 'no conta-gotas de um tubo novo');
    const grupos = Object.entries(SIAB.solutionGroups).map(([grupo, rotulo]) => {
      const frascos = Object.entries(SIAB.solutions)
        .filter(([, x]) => x.group === grupo)
        .filter(([, x]) => !query || SIAB.normalizar(`${x.name} ${x.formula || ''} ${rotulo} ${x.label || ''}`).includes(query));
      if (!frascos.length) return '';
      const botoes = frascos.map(([id, x]) => {
        const marcas = [];
        if (id === t?.solution) marcas.push('<span class="tag tag-tubo">no tubo</span>');
        if (id === t?.titrant) marcas.push('<span class="tag tag-gotas">conta-gotas</span>');
        const detalhe = [x.formula && x.kind !== 'sample' ? x.formula : '', x.label].filter(Boolean).join(' · ');
        const estado = [id === t?.solution ? 'está no tubo' : '', id === t?.titrant ? 'está no conta-gotas' : ''].filter(Boolean).join(' e ');
        return `<button type="button" class="bottle" data-solution="${id}" aria-label="${SIAB.escape(x.name)}. ${SIAB.escape(x.label || '')}. Colocar ${destino}.${estado ? ' Atualmente ' + estado + '.' : ''}">
          <span class="bottle-dot" style="background:${corDoFrasco(x)}" aria-hidden="true"></span>
          <span class="bottle-text"><strong>${SIAB.escape(x.name)}</strong><small>${SIAB.escape(detalhe)}</small></span>
          <span class="bottle-tags" aria-hidden="true">${marcas.join('')}</span>
        </button>`;
      }).join('');
      return `<div class="shelf-group"><h3 class="shelf-title">${SIAB.escape(rotulo)}</h3><div class="shelf-bottles">${botoes}</div></div>`;
    }).join('');
    // Frasco secreto (easter egg, ver js/ui/segredo.js).
    const secreto = SIAB.segredo?.frascoSecreto(query) || '';
    box.innerHTML = secreto + grupos || '<p class="empty-choice">Nenhum frasco com esse nome. Tente outra busca.</p>';
  }

  function renderIndicadores() {
    const box = SIAB.$('indicator-chips');
    if (!box) return;
    const t = SIAB.current();
    box.innerHTML = Object.entries(SIAB.indicators).map(([id, x]) => {
      let amostra = 'transparent';
      if (x.acid) amostra = `linear-gradient(90deg,rgb(${x.acid.join(',')}),rgb(${x.middle.join(',')}),rgb(${x.base.join(',')}))`;
      if (id === 'universal' || id === 'cabbage') {
        const cores = [2, 5, 7, 9, 12].map(pH => `rgb(${SIAB.chem.color(id, pH).rgb.join(',')})`);
        amostra = `linear-gradient(90deg,${cores.join(',')})`;
      }
      return `<label class="chip"><input type="radio" name="indicador" value="${id}" ${t?.indicator === id ? 'checked' : ''}><span class="chip-cor" style="background:${amostra}" aria-hidden="true"></span><span>${SIAB.escape(x.short)}</span></label>`;
    }).join('');
  }

  return { render, renderIndicadores };
})();
