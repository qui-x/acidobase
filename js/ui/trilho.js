'use strict';
/* Painéis recolhíveis no computador (telas acima de 1200 px), com o mesmo
   comportamento do trilho do SIMA (Laboratório Virtual):
   - recolhido, o painel vira um trilho de ícones e a bancada ganha espaço;
   - um ícone traz SÓ aquela parte de volta, FLUTUANDO por cima da bancada:
     a largura da bancada não muda. Dá, por exemplo, para deixar o gráfico
     flutuando e gotejar enquanto ele muda;
   - o mesmo ícone, o ×, Esc ou (na prateleira) um toque na bancada fecham o
     cartão, e o foco volta ao ícone;
   - o primeiro ícone (ou o botão com seta no cartão) FIXA o painel de novo;
   - o ícone da aba do VER em uso fica marcado;
   - durante o tour, os painéis ficam fixos e depois voltam ao que eram.
   A escolha de recolher fica salva neste navegador. */
SIAB.trilho = (() => {
  const $ = SIAB.$;
  const CHAVE = 'siab_trilho_v1';
  const largo = window.matchMedia('(min-width: 1201px)');
  const recolhido = Object.assign({ controls: false, 'ver-panel': false }, SIAB.armazenamento.ler(CHAVE, {}));
  const assinaturas = {};
  let flutuante = null;   // { painel, item, botao }
  let suspenso = null;    // estado guardado enquanto o tour roda

  const ic = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
  const ICONES = {
    abrirEsq: 'm10 6 6 6-6 6M5 6v12',
    abrirDir: 'm14 6-6 6 6 6M19 6v12',
    nivel: 'M4 16a8 8 0 1 1 16 0M12 16l4-5M4 20h16',
    vidraria: 'M9 3h6M10 3v6L5 19a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2L14 9V3',
    frascos: 'M7 21h10M8 21V10l-1-3h10l-1 3v11M10 4h4v3h-4ZM8 14h8',
    indicador: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z',
    ajustes: 'M4 7h9M17 7h3M4 17h3M11 17h9M13 4v6M7 14v6',
    acoes: 'M12 5v.5M12 12v.5M12 19v.5',
    missao: 'M5 21V4M5 4h11l-2 4 2 4H5',
    grafico: 'M4 4v16h16M7 15l4-5 3 3 5-7',
    particulas: 'M7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM10 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
    condutividade: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.9.7 1.6 1.8 1.6 3.2h4c0-1.4.7-2.5 1.6-3.2A6 6 0 0 0 12 3Z',
    equacao: 'M4 9h12m0 0-3-3m3 3-3 3M20 15H8m0 0 3-3m-3 3 3 3',
    historico: 'M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4M12 8v4l3 2'
  };
  const ROTULOS_VER = { grafico: 'Gráfico', particulas: 'Partículas', condutividade: 'Condutividade', equacao: 'Equação', historico: 'Histórico' };
  const trilhoDe = painel => $(painel === 'controls' ? 'trilho-controls' : 'trilho-ver');
  const nomeDe = painel => (painel === 'controls' ? 'prateleira' : 'painel VER');

  // Partes de cada painel, conforme o modo e o estado da bancada.
  function itens(painel) {
    const cfg = SIAB.bancada.config;
    if (painel === 'ver-panel') return cfg.ver.map(id => ({ id, rotulo: ROTULOS_VER[id], icone: ICONES[id], ver: id }));
    if (cfg.modo === 'missao') return [{ id: 'missao', rotulo: 'Missão', icone: ICONES.missao, foco: '#painel-missao button' }];
    const temTubo = Boolean(SIAB.current());
    return [
      { id: 'nivel', rotulo: 'Módulos', icone: ICONES.nivel, foco: '#modulos .modulo.ativo .modulo-cab' },
      { id: 'vidraria', rotulo: 'Vidraria', icone: ICONES.vidraria, foco: '#vidraria-grupo input:checked' },
      { id: 'frascos', rotulo: 'Frascos', icone: ICONES.frascos, foco: '#menu-tubo' },
      temTubo && { id: 'indicador', rotulo: 'Indicador', icone: ICONES.indicador, foco: '#indicator-chips input:checked, #indicator-chips input' },
      temTubo && SIAB.state.level !== 'explorar' && { id: 'ajustes', rotulo: 'Ajustes de medida', icone: ICONES.ajustes, foco: '#ajustes summary' },
      temTubo && { id: 'acoes', rotulo: 'Ações do tubo', icone: ICONES.acoes, foco: '#compare-btn' }
    ].filter(Boolean);
  }

  function desenhar(painel) {
    const lista = itens(painel);
    const assinatura = lista.map(x => x.id).join();
    if (assinaturas[painel] === assinatura) return;
    assinaturas[painel] = assinatura;
    if (flutuante?.painel === painel && !lista.some(x => x.id === flutuante.item)) fecharFlutuante(false);
    const esquerda = painel === 'controls';
    const botao = (x, extra) => `<button type="button" class="trilho-btn"${extra} aria-label="${x.rotulo}">${ic(x.icone)}<span class="trilho-dica" aria-hidden="true">${x.rotulo}</span></button>`;
    trilhoDe(painel).innerHTML =
      botao({ rotulo: `Fixar ${nomeDe(painel)}`, icone: esquerda ? ICONES.abrirEsq : ICONES.abrirDir }, ` data-fixar aria-controls="${painel}"`) +
      '<span class="trilho-sep" aria-hidden="true"></span>' +
      lista.map(x => botao({ ...x, rotulo: esquerda ? x.rotulo : `VER: ${x.rotulo}` }, ` data-item="${x.id}" aria-expanded="false"`)).join('');
    // Redesenhado com um cartão aberto: o novo ícone herda a marca de aberto.
    if (flutuante?.painel === painel) {
      const b = trilhoDe(painel).querySelector(`[data-item="${flutuante.item}"]`);
      b?.setAttribute('aria-expanded', 'true');
      flutuante.botao = b;
    }
    marcarAtivo();
  }

  // O ícone da aba do VER em uso fica marcado (é o "onde estou" com o painel recolhido).
  function marcarAtivo() {
    trilhoDe('ver-panel').querySelectorAll('[data-item]').forEach(b => {
      const ativo = b.dataset.item === SIAB.state.verTab;
      b.classList.toggle('is-active', ativo);
      if (ativo) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
  }

  function aplicar() {
    for (const painel of ['controls', 'ver-panel']) {
      const ativo = largo.matches && recolhido[painel] && !suspenso;
      if (ativo) desenhar(painel);
      trilhoDe(painel).hidden = !ativo;
      $(painel).classList.toggle('recolhido', ativo);
      $('workspace').classList.toggle(`recolhido-${painel}`, ativo);
      const b = $(painel).querySelector('[data-recolher]');
      b.setAttribute('aria-expanded', String(!ativo));
      b.setAttribute('aria-label', `${ativo ? 'Fixar' : 'Recolher'} ${nomeDe(painel)}`);
      b.title = b.getAttribute('aria-label');
    }
    if (flutuante && !$(flutuante.painel).classList.contains('recolhido')) fecharFlutuante(false);
  }

  function definir(painel, valor) {
    recolhido[painel] = valor;
    SIAB.armazenamento.gravar(CHAVE, recolhido);
    fecharFlutuante(false);
    aplicar();
  }

  /* ---------- Cartão flutuante ---------- */
  function fecharFlutuante(devolverFoco = true) {
    if (!flutuante) return;
    const { painel, botao } = flutuante;
    flutuante = null;
    $(painel).classList.remove('flutuando');
    $(painel).querySelectorAll('.rail-oculto').forEach(x => x.classList.remove('rail-oculto'));
    trilhoDe(painel).querySelectorAll('[aria-expanded]').forEach(b => b.setAttribute('aria-expanded', 'false'));
    if (devolverFoco && botao?.isConnected) botao.focus();
  }

  function abrirFlutuante(painel, item) {
    const escolhido = itens(painel).find(x => x.id === item);
    if (!escolhido) return;
    fecharFlutuante(false);
    const botao = trilhoDe(painel).querySelector(`[data-item="${item}"]`);
    if (escolhido.ver) {
      SIAB.state.verTab = escolhido.ver;
      SIAB.loja.avisar();
    } else {
      // Só a parte escolhida aparece no cartão.
      $(painel).querySelectorAll('.painel-secao').forEach(secao => {
        secao.classList.toggle('rail-oculto', secao.dataset.secao !== item);
      });
      if (item === 'ajustes') $('ajustes').open = true;
    }
    $(painel).classList.add('flutuando');
    botao?.setAttribute('aria-expanded', 'true');
    flutuante = { painel, item, botao };
    const foco = escolhido.ver ? $(`tab-${escolhido.ver}`) : $(painel).querySelector(escolhido.foco);
    (foco || $(painel).querySelector('.painel-conteudo button'))?.focus();
  }

  function alternar(painel, item) {
    if (flutuante?.painel === painel && flutuante.item === item) fecharFlutuante();
    else abrirFlutuante(painel, item);
  }

  // Mostra uma parte: flutuando se o painel estiver recolhido, ou no próprio painel.
  function mostrar(painel, item) {
    if (largo.matches && recolhido[painel] && !suspenso) {
      desenhar(painel);
      abrirFlutuante(painel, item);
      return;
    }
    const escolhido = itens(painel).find(x => x.id === item);
    const secao = $(painel).querySelector(`.painel-secao[data-secao="${item}"]`);
    const foco = escolhido && $(painel).querySelector(escolhido.foco);
    if (!secao) return;
    secao.scrollIntoView({ block: 'start', behavior: A11Y.estado.motion ? 'auto' : 'smooth' });
    foco?.focus({ preventScroll: true });
    secao.classList.remove('ajuda-destaque');
    void secao.offsetWidth;
    secao.classList.add('ajuda-destaque');
    setTimeout(() => secao.classList.remove('ajuda-destaque'), 2500);
  }

  /* ---------- Tour: painéis fixos enquanto ele roda ---------- */
  function suspender() {
    if (suspenso) return;
    suspenso = true;
    fecharFlutuante(false);
    aplicar();
  }
  function retomar() {
    if (!suspenso) return;
    suspenso = null;
    aplicar();
  }

  function ligar() {
    // Botão com seta no cabeçalho do painel: recolhe; com o painel recolhido, fixa.
    document.querySelectorAll('[data-recolher]').forEach(botao => {
      botao.addEventListener('click', () => {
        const painel = botao.dataset.recolher;
        const recolher = !$(painel).classList.contains('recolhido');
        definir(painel, recolher);
        if (recolher) trilhoDe(painel).querySelector('[data-fixar]')?.focus();
        else botao.focus();
        SIAB.announce(`${painel === 'controls' ? 'Prateleira' : 'Painel VER'} ${recolher ? 'recolhido' : 'fixado'}.`);
      });
    });
    document.querySelectorAll('.fechar-flutuante').forEach(b => b.addEventListener('click', () => fecharFlutuante()));
    for (const painel of ['controls', 'ver-panel']) {
      trilhoDe(painel).addEventListener('click', evento => {
        const botao = evento.target.closest('.trilho-btn');
        if (!botao) return;
        if (botao.hasAttribute('data-fixar')) {
          definir(painel, false);
          $(painel).querySelector('[data-recolher]').focus();
          SIAB.announce(`${painel === 'controls' ? 'Prateleira' : 'Painel VER'} fixado.`);
        } else alternar(painel, botao.dataset.item);
      });
    }
    // Esc fecha o cartão (antes dos diálogos: só age quando não há diálogo aberto).
    document.addEventListener('keydown', evento => {
      if (evento.key === 'Escape' && flutuante && !document.querySelector('dialog[open]')) {
        evento.preventDefault();
        fecharFlutuante();
      }
    });
    // Tocar na bancada fecha o cartão da prateleira (o do VER fica, para acompanhar as gotas).
    $('experiment').addEventListener('pointerdown', () => {
      if (flutuante?.painel === 'controls') fecharFlutuante(false);
    });
    largo.addEventListener('change', () => { fecharFlutuante(false); aplicar(); });
    // Modo, tubos e módulo mudam as partes do trilho; a aba do VER muda a marca.
    SIAB.loja.assinar(() => {
      if (largo.matches) for (const painel of ['controls', 'ver-panel']) if (recolhido[painel] && !suspenso) desenhar(painel);
      marcarAtivo();
    });
    aplicar();
  }

  return {
    ligar, mostrar, suspender, retomar, fecharFlutuante, estado: recolhido,
    // Compatibilidade: reabrir o painel fixo e ir direto a uma parte.
    expandir(painel, item) { definir(painel, false); if (item) mostrar(painel, item); },
    get flutuante() { return flutuante && { painel: flutuante.painel, item: flutuante.item }; }
  };
})();
