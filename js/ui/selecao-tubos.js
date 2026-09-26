'use strict';
/* Seleção de recipientes na visão geral. A seleção é uma interação de tela;
   relatorioIds guarda, por bancada, os recipientes confirmados no relatório.
   Os cartões não são recriados ao selecionar: foco e gesto ficam no lugar. */
SIAB.selecaoTubos = (() => {
  const $ = SIAB.$;
  const estados = new WeakMap();
  const ESPERA = 550, DISTANCIA = 12;
  let gesto = null, cliqueBloqueado = null;

  function estado() {
    const bancada = SIAB.state;
    if (!estados.has(bancada)) estados.set(bancada, { ativa: false, ids: new Set() });
    return estados.get(bancada);
  }
  const visivel = () => SIAB.state.view === 'overview' && !$('workspace').hidden && !$('overview-view').hidden;
  const cartao = evento => evento.target.closest?.('#overview-grid .overview-tube[data-tube]');
  function cancelarGesto() {
    if (gesto) clearTimeout(gesto.timer);
    gesto = null;
  }
  function normalizar() {
    const s = SIAB.state, e = estado(), existentes = new Set(s.tubes.map(t => t.id));
    e.ids.forEach(id => { if (!existentes.has(id)) e.ids.delete(id); });
    if (Array.isArray(s.relatorioIds)) s.relatorioIds = [...new Set(s.relatorioIds)].filter(id => existentes.has(id));
    return e;
  }

  function atualizar() {
    const s = SIAB.state, e = normalizar();
    if (!visivel() || !s.tubes.length) {
      e.ativa = false;
      e.ids.clear();
      cancelarGesto();
    }
    const total = s.tubes.length, quantidade = e.ids.size;
    $('selecao-tubos').hidden = !e.ativa;
    $('selecionar-tubos-btn').hidden = e.ativa;
    $('selecionar-tubos-btn').disabled = !total;
    $('selecionar-tubos-btn').setAttribute('aria-pressed', String(e.ativa));
    $('overview-hint').textContent = e.ativa
      ? 'Toque nos tubos para marcar ou desmarcar. “Selecionar todos” inclui todos os recipientes desta bancada.'
      : 'Toque em um tubo para editar. Para selecionar vários, use Ctrl + clique (⌘ no Mac) ou pressione e segure um tubo.';
    $('selecao-tubos-contagem').textContent = `${quantidade} de ${total} ${total === 1 ? 'tubo selecionado' : 'tubos selecionados'}`;
    $('selecao-todos-btn').textContent = quantidade === total && total ? 'Limpar seleção' : 'Selecionar todos';
    $('selecao-todos-btn').disabled = !total;
    $('selecao-relatorio-btn').disabled = !quantidade;
    $('selecao-relatorio-btn').textContent = Array.isArray(s.relatorioIds) ? 'Atualizar relatório' : 'Adicionar ao relatório';
    const escolhidos = s.tubes.filter(t => e.ids.has(t.id));
    const podeVincular = SIAB.bancada.config.controles.has('tubos');
    const primeiro = escolhidos[0];
    const mesmoGrupo = primeiro?.group && escolhidos.every(t => t.group === primeiro.group) && SIAB.targets(primeiro).length === quantidade;
    const opcoes = opcoesVinculo();
    const igual = quantidade >= 2 && SIAB.bancada.vinculoIgual(escolhidos, opcoes);
    $('selecao-vincular-btn').hidden = !podeVincular;
    $('selecao-desvincular-btn').hidden = !podeVincular;
    $('selecao-vincular-btn').disabled = quantidade < 2 || igual;
    // Os mesmos tubos já vinculados, com outras partes marcadas: atualiza o vínculo.
    $('selecao-vincular-btn').textContent = mesmoGrupo && !igual ? 'Atualizar vínculo' : 'Vincular tubos';
    $('selecao-desvincular-btn').disabled = !escolhidos.some(t => t.group);
    $('selecao-vinculo-opcoes').hidden = !e.ativa || !podeVincular || quantidade < 2;
    $('selecao-vinculo-dica').hidden = !e.ativa || !podeVincular;
    const referencia = quantidade ? SIAB.bancada.referenciaDe(escolhidos) : null;
    const partes = [opcoes.substancia && 'a substância do tubo', opcoes.contaGotas && 'o conta-gotas'].filter(Boolean);
    const recomecam = quantidade >= 2 ? SIAB.bancada.mudariam(escolhidos, opcoes) : [];
    $('selecao-vinculo-dica').textContent = quantidade < 2
      ? 'Marque pelo menos dois tubos para vincular o gotejamento.'
      : igual ? `Os tubos selecionados já formam o ${SIAB.nomeGrupo(primeiro)}${SIAB.textoCompartilhado(primeiro) ? `, compartilhando ${SIAB.textoCompartilhado(primeiro)}` : ''}.`
        : `Vincular reúne somente os tubos marcados, com gotas de ${SIAB.format(referencia.dropVolume)} mL (como em ${referencia.name}). `
          + (partes.length
            ? `Todos passam a usar ${partes.join(' e ')} de ${referencia.name}${recomecam.length ? `; ${recomecam.map(t => t.name).join(', ')} ${recomecam.length === 1 ? 'recomeça' : 'recomeçam'} as gotas` : ''}. Cada um mantém o indicador.`
            : 'Cada um mantém sua amostra, seu indicador e seu conta-gotas.');
    $('overview-grid').classList.toggle('selecting', e.ativa);
    $('workspace').classList.toggle('selecting-tubes', e.ativa);
    const incluidos = new Set(s.relatorioIds || []);
    $('overview-grid').querySelectorAll('.overview-tube').forEach(botao => {
      const id = Number(botao.dataset.tube), tubo = s.tubes.find(t => t.id === id);
      if (!tubo) return;
      const nome = `${tubo.name}${tubo.group ? ', ' + SIAB.nomeGrupo(tubo) : ''}`;
      botao.setAttribute('aria-label', e.ativa ? nome : `Abrir ${nome}${incluidos.has(id) ? ', incluído no relatório' : ''}`);
      if (e.ativa) botao.setAttribute('aria-pressed', String(e.ids.has(id)));
      else botao.removeAttribute('aria-pressed');
      let marca = botao.querySelector('.overview-check');
      if (!marca) {
        marca = document.createElement('span');
        marca.className = 'overview-check';
        marca.setAttribute('aria-hidden', 'true');
        botao.append(marca);
      }
      marca.hidden = !e.ativa;
      marca.textContent = e.ids.has(id) ? '✓' : '';
      let nota = botao.querySelector('.overview-report-mark');
      if (!nota) {
        nota = document.createElement('span');
        nota.className = 'overview-report-mark';
        nota.textContent = 'No relatório';
        botao.append(nota);
      }
      nota.hidden = !incluidos.has(id);
    });
    const personalizado = Array.isArray(s.relatorioIds), n = incluidos.size;
    $('overview-relatorio').hidden = !personalizado || e.ativa;
    $('relatorio-tubos-contagem').textContent = `${n} ${n === 1 ? 'tubo no relatório' : 'tubos no relatório'}`;
    const idsImpressao = idsRelatorio(), quantidadeImpressao = idsImpressao?.length;
    $('imprimir-relatorio').disabled = idsImpressao !== null ? !quantidadeImpressao : !total;
    $('imprimir-relatorio').textContent = idsImpressao !== null ? `Imprimir relatório (${quantidadeImpressao})` : 'Imprimir relatório';
    $('relatorio-selecao-resumo').textContent = idsImpressao !== null
      ? `${quantidadeImpressao} ${quantidadeImpressao === 1 ? 'tubo escolhido' : 'tubos escolhidos'} na visão geral. Cada um terá preparo, leitura, gráfico e histórico.`
      : 'Resumo da bancada e detalhes do tubo em foco. Escolha tubos na visão geral para personalizar.';
  }

  // Partes marcadas para compartilhar ao vincular (além das gotas).
  function opcoesVinculo() {
    return { substancia: Boolean($('vincular-substancia')?.checked), contaGotas: Boolean($('vincular-contagotas')?.checked) };
  }

  // O botão lateral e Ctrl+P usam a seleção em andamento, quando houver;
  // fora dela, usam a lista já confirmada pelo estudante.
  function idsRelatorio() {
    const e = normalizar();
    return e.ativa && visivel() ? [...e.ids] : SIAB.state.relatorioIds ?? null;
  }

  function iniciar(doRelatorio = false) {
    const e = normalizar();
    if (!e.ativa) {
      e.ativa = true;
      e.ids = new Set(doRelatorio ? SIAB.state.relatorioIds || [] : []);
    }
    return e;
  }
  function alternar(id) {
    if (!visivel() || !SIAB.state.tubes.some(t => t.id === id)) return;
    const e = iniciar();
    if (e.ids.has(id)) e.ids.delete(id);
    else e.ids.add(id);
    atualizar();
  }
  function sair(focar = false) {
    cancelarGesto();
    const e = estado();
    e.ativa = false;
    e.ids.clear();
    atualizar();
    if (focar) $('selecionar-tubos-btn').focus();
  }
  function todos() {
    const e = iniciar(), tubos = SIAB.state.tubes;
    e.ids = e.ids.size === tubos.length ? new Set() : new Set(tubos.map(t => t.id));
    atualizar();
  }
  function adicionar() {
    const e = normalizar();
    if (!e.ativa || !e.ids.size) return;
    SIAB.state.relatorioIds = SIAB.state.tubes.filter(t => e.ids.has(t.id)).map(t => t.id);
    const n = SIAB.state.relatorioIds.length;
    sair(true);
    // Conduz ao mesmo botão do painel esquerdo, inclusive no painel móvel.
    if (SIAB.bancada.mobile.matches) SIAB.bancada.openSheet();
    else SIAB.trilho.mostrar('controls', 'relatorio');
    $('imprimir-relatorio').scrollIntoView({ block: 'nearest' });
    $('imprimir-relatorio').focus({ preventScroll: true });
    SIAB.notice(`${n} ${n === 1 ? 'tubo incluído' : 'tubos incluídos'}. Use “Imprimir relatório” no painel da prateleira.`);
  }

  function ligar() {
    const grade = $('overview-grid');
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(() => {
        document.documentElement.style.setProperty('--selection-h', `${Math.ceil($('selecao-tubos').getBoundingClientRect().height)}px`);
      }).observe($('selecao-tubos'));
    }
    $('selecionar-tubos-btn').addEventListener('click', () => {
      iniciar(); atualizar();
      grade.querySelector('button')?.focus();
    });
    $('selecao-todos-btn').addEventListener('click', todos);
    // Marcar ou desmarcar uma parte atualiza o texto e o botão de vincular.
    $('selecao-vinculo-opcoes').addEventListener('change', atualizar);
    $('selecao-cancelar-btn').addEventListener('click', () => sair(true));
    $('selecao-relatorio-btn').addEventListener('click', adicionar);
    $('selecao-vincular-btn').addEventListener('click', () => {
      if (SIAB.bancada.vincularTubos([...normalizar().ids], opcoesVinculo())) $('selecao-desvincular-btn').focus();
    });
    $('selecao-desvincular-btn').addEventListener('click', () => {
      if (SIAB.bancada.desvincularTubos([...normalizar().ids])) {
        ($('selecao-vincular-btn').disabled ? $('selecao-todos-btn') : $('selecao-vincular-btn')).focus();
      }
    });
    $('relatorio-editar-btn').addEventListener('click', () => {
      iniciar(true); atualizar();
      grade.querySelector('button')?.focus();
    });
    $('relatorio-limpar-btn').addEventListener('click', () => {
      SIAB.state.relatorioIds = null;
      sair(true);
      SIAB.notice('Relatório padrão: resumo de toda a bancada e detalhes do tubo em foco.');
    });

    // Intercepta só a seleção. O clique simples continua chegando à bancada.js.
    grade.addEventListener('click', evento => {
      const botao = cartao(evento);
      if (!botao || !visivel()) return;
      const id = Number(botao.dataset.tube);
      if (cliqueBloqueado && Date.now() <= cliqueBloqueado.ate) {
        evento.preventDefault(); evento.stopPropagation();
        cliqueBloqueado = null;
        return;
      }
      if (evento.ctrlKey || evento.metaKey || estado().ativa) {
        evento.preventDefault(); evento.stopPropagation();
        cancelarGesto();
        alternar(id);
      }
    });

    document.addEventListener('pointerdown', evento => {
      // Um novo toque é sempre intencional. Dois dedos cancelam a espera.
      cliqueBloqueado = null;
      if (gesto && evento.pointerId !== gesto.pointerId) cancelarGesto();
    }, { capture: true, passive: true });
    grade.addEventListener('pointerdown', evento => {
      cancelarGesto();
      cliqueBloqueado = null;
      const botao = cartao(evento);
      if (!botao || !visivel() || evento.button !== 0 || evento.isPrimary === false) return;
      const atual = { id: Number(botao.dataset.tube), pointerId: evento.pointerId,
        x: evento.clientX, y: evento.clientY, bancada: SIAB.state, disparado: false };
      gesto = atual;
      atual.timer = setTimeout(() => {
        if (gesto !== atual || atual.bancada !== SIAB.state || !visivel() || !botao.isConnected) return;
        atual.disparado = true;
        cliqueBloqueado = { id: atual.id, ate: Infinity };
        // Segurar inicia a seleção e mantém o tubo marcado, mesmo se já estava.
        iniciar().ids.add(atual.id);
        atualizar();
        SIAB.announce('Seleção de tubos ativada. Marque outros tubos ou use Selecionar todos.');
      }, ESPERA);
    });
    window.addEventListener('pointermove', evento => {
      if (!gesto || evento.pointerId !== gesto.pointerId) return;
      if (Math.hypot(evento.clientX - gesto.x, evento.clientY - gesto.y) > DISTANCIA) cancelarGesto();
    }, { passive: true });
    const terminar = evento => {
      if (gesto && evento.pointerId !== gesto.pointerId) return;
      if (cliqueBloqueado) cliqueBloqueado.ate = Date.now() + 800;
      cancelarGesto();
    };
    window.addEventListener('pointerup', terminar, { passive: true });
    window.addEventListener('pointercancel', terminar, { passive: true });
    window.addEventListener('scroll', cancelarGesto, { capture: true, passive: true });
    window.addEventListener('blur', cancelarGesto);
    window.addEventListener('hashchange', () => sair());
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancelarGesto(); });
    grade.addEventListener('contextmenu', evento => {
      if (cartao(evento) && (gesto || cliqueBloqueado || estado().ativa)) evento.preventDefault();
    });
    grade.addEventListener('keydown', evento => {
      const botao = cartao(evento);
      if (botao && (evento.ctrlKey || evento.metaKey) && [' ', 'Enter'].includes(evento.key)) {
        evento.preventDefault();
        if (!evento.repeat) alternar(Number(botao.dataset.tube));
      }
    });
    document.addEventListener('keydown', evento => {
      if (!visivel() || !estado().ativa || $('controls').classList.contains('open') || document.querySelector('dialog[open]')) return;
      if (evento.key === 'Escape') { evento.preventDefault(); sair(true); }
      else if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === 'a' && evento.target.closest('#overview-view')) {
        evento.preventDefault();
        iniciar().ids = new Set(SIAB.state.tubes.map(t => t.id));
        atualizar();
      }
    });
  }
  return { ligar, atualizar, sair, idsRelatorio };
})();
