'use strict';
/* Painéis recolhíveis no computador (telas acima de 1200 px), no estilo do
   Laboratório Virtual: a prateleira e o painel VER viram um trilho estreito
   de ícones e a bancada ganha espaço. Um toque num ícone reabre o painel
   já na parte escolhida. A escolha fica salva neste navegador. */
SIAB.trilho = (() => {
  const $ = SIAB.$;
  const CHAVE = 'siab_trilho_v1';
  const largo = window.matchMedia('(min-width: 1201px)');
  const recolhido = Object.assign({ controls: false, 'ver-panel': false }, SIAB.armazenamento.ler(CHAVE, {}));
  const assinaturas = {};

  const ic = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
  const ICONES = {
    abrirEsq: 'm10 6 6 6-6 6M5 6v12',
    abrirDir: 'm14 6-6 6 6 6M19 6v12',
    nivel: 'M4 16a8 8 0 1 1 16 0M12 16l4-5M4 20h16',
    frascos: 'M9 3h6M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3M7 15h10',
    indicador: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z',
    ajustes: 'M4 7h9M17 7h3M4 17h3M11 17h9M13 4v6M7 14v6',
    missao: 'M5 21V4M5 4h11l-2 4 2 4H5',
    grafico: 'M4 4v16h16M7 15l4-5 3 3 5-7',
    particulas: 'M7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM10 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
    equacao: 'M4 9h12m0 0-3-3m3 3-3 3M20 15H8m0 0 3-3m-3 3 3 3',
    historico: 'M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4M12 8v4l3 2'
  };
  const ROTULOS_VER = { grafico: 'Gráfico', particulas: 'Partículas', equacao: 'Equação', historico: 'Histórico' };

  // Itens de cada trilho conforme o modo da bancada (laboratório ou missão).
  function itens(painel) {
    const cfg = SIAB.bancada.config;
    if (painel === 'ver-panel') return cfg.ver.map(id => ({ id, rotulo: ROTULOS_VER[id], icone: ICONES[id], ver: id }));
    if (cfg.modo === 'missao') return [{ id: 'missao', rotulo: 'Missão', icone: ICONES.missao, alvo: '#painel-missao' }];
    const lista = [
      { id: 'nivel', rotulo: 'Nível', icone: ICONES.nivel, alvo: '#nivel-grupo' },
      { id: 'frascos', rotulo: 'Frascos', icone: ICONES.frascos, alvo: '#shelf-search' }
    ];
    // Indicador e ajustes só existem quando há um tubo na bancada.
    if (SIAB.current()) lista.push(
      { id: 'indicador', rotulo: 'Indicador', icone: ICONES.indicador, alvo: '#indicator-group' },
      { id: 'ajustes', rotulo: 'Ajustes de medida', icone: ICONES.ajustes, alvo: '#ajustes' }
    );
    return lista;
  }

  function desenhar(painel) {
    const lista = itens(painel);
    const assinatura = lista.map(x => x.id).join();
    if (assinaturas[painel] === assinatura) return;
    assinaturas[painel] = assinatura;
    const esquerda = painel === 'controls';
    const nome = esquerda ? 'prateleira' : 'painel VER';
    const botao = (x, extra = '') => `<button type="button" class="trilho-btn"${extra} aria-label="${x.rotulo}">${ic(x.icone)}<span class="trilho-dica" aria-hidden="true">${x.rotulo}</span></button>`;
    $(esquerda ? 'trilho-controls' : 'trilho-ver').innerHTML =
      botao({ rotulo: `Abrir ${nome}`, icone: esquerda ? ICONES.abrirEsq : ICONES.abrirDir }, ` data-expandir aria-controls="${painel}" aria-expanded="false"`) +
      '<span class="trilho-sep" aria-hidden="true"></span>' +
      lista.map(x => botao({ ...x, rotulo: esquerda ? x.rotulo : `VER: ${x.rotulo}` }, ` data-item="${x.id}"`)).join('');
  }

  function aplicar() {
    for (const painel of ['controls', 'ver-panel']) {
      const ativo = largo.matches && recolhido[painel];
      const trilho = $(painel === 'controls' ? 'trilho-controls' : 'trilho-ver');
      if (ativo) desenhar(painel);
      trilho.hidden = !ativo;
      $(painel).classList.toggle('recolhido', ativo);
      $('workspace').classList.toggle(`recolhido-${painel}`, ativo);
      $(painel).querySelector('[data-recolher]').setAttribute('aria-expanded', String(!ativo));
    }
  }

  function definir(painel, valor) {
    recolhido[painel] = valor;
    SIAB.armazenamento.gravar(CHAVE, recolhido);
    aplicar();
  }

  function recolher(painel) {
    definir(painel, true);
    $(painel).querySelector('[data-expandir]')?.focus();
    SIAB.announce(painel === 'controls' ? 'Prateleira recolhida.' : 'Painel VER recolhido.');
  }

  // Reabre o painel e, se veio de um ícone, vai direto à parte escolhida.
  function expandir(painel, item) {
    definir(painel, false);
    const escolhido = item && itens(painel).find(x => x.id === item);
    if (escolhido?.ver) {
      SIAB.state.verTab = escolhido.ver;
      SIAB.loja.avisar();
      $(`tab-${escolhido.ver}`).focus();
      return;
    }
    const alvo = escolhido && document.querySelector(escolhido.alvo);
    if (!alvo) {
      $(painel).querySelector('[data-recolher]').focus();
      return;
    }
    if (alvo.tagName === 'DETAILS') alvo.open = true;
    const foco = alvo.matches('input, button, summary') ? alvo : alvo.querySelector('input:not([disabled]), button:not([disabled]), summary');
    alvo.scrollIntoView({ block: 'start', behavior: A11Y.estado.motion ? 'auto' : 'smooth' });
    foco?.focus({ preventScroll: true });
    alvo.classList.remove('ajuda-destaque');
    void alvo.offsetWidth;
    alvo.classList.add('ajuda-destaque');
    setTimeout(() => alvo.classList.remove('ajuda-destaque'), 2500);
  }

  function ligar() {
    document.querySelectorAll('[data-recolher]').forEach(botao => {
      botao.addEventListener('click', () => recolher(botao.dataset.recolher));
    });
    for (const painel of ['controls', 'ver-panel']) {
      $(painel === 'controls' ? 'trilho-controls' : 'trilho-ver').addEventListener('click', evento => {
        const botao = evento.target.closest('.trilho-btn');
        if (botao) expandir(painel, botao.dataset.item);
      });
    }
    largo.addEventListener('change', aplicar);
    // A missão muda os itens do trilho (e as abas do VER disponíveis).
    SIAB.loja.assinar(() => {
      if (!largo.matches) return;
      for (const painel of ['controls', 'ver-panel']) if (recolhido[painel]) desenhar(painel);
    });
    aplicar();
  }

  return { ligar, recolher, expandir, estado: recolhido };
})();
