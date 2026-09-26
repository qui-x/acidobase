'use strict';
/* Bancada compartilhada pelo laboratório livre e pelas missões.
   Aqui ficam as ações (gotejar, colocar frasco, desfazer, renomear…) e os
   eventos dos botões. A configuração diz quais controles cada modo mostra. */
SIAB.bancada = (() => {
  const $ = SIAB.$;
  const TODOS = ['gotas', 'atalhos', 'poe', 'ph', 'indicador', 'realcar', 'tubos', 'renomear', 'comparar'];
  const config = {
    modo: 'laboratorio',
    controles: new Set(TODOS),
    ver: ['grafico', 'particulas', 'condutividade', 'equacao', 'historico'],
    nivel: 'explorar'
  };
  const mobile = matchMedia('(max-width: 900px)');
  let confirmAction = null, lastSheetFocus = null, deltaTimer = null, sequencia = null;

  function configurar({ modo = 'laboratorio', controles = TODOS, ver = ['grafico', 'particulas', 'condutividade', 'equacao', 'historico'], nivel = 'explorar' } = {}) {
    config.modo = modo;
    config.controles = new Set(controles);
    config.ver = ver;
    config.nivel = nivel;
    $('painel-laboratorio').hidden = modo !== 'laboratorio';
    $('painel-missao').hidden = modo !== 'missao';
    $('controls-title').textContent = modo === 'missao' ? 'Missão' : 'Prateleira';
    closeSheet(false);
  }

  /* ---------- Confirmação e painel inferior (celular) ---------- */
  SIAB.confirmar = (titulo, mensagem, acao, rotulo = 'Confirmar', intencao = 'default') => {
    $('confirm-title').textContent = titulo;
    $('confirm-text').textContent = mensagem;
    $('confirm-yes').textContent = rotulo;
    $('confirm-dialog').dataset.intent = intencao;
    confirmAction = acao;
    $('confirm-dialog').showModal();
  };

  const bloqueaveis = () => [$('experiment'), $('ver-panel'), document.querySelector('.app-header'), document.querySelector('.bottom-nav')];
  function closeSheet(restore = true) {
    $('controls').classList.remove('open');
    $('prepare-btn').setAttribute('aria-expanded', 'false');
    $('sheet-backdrop').hidden = true;
    document.body.classList.remove('sheet-open');
    bloqueaveis().forEach(el => { el.inert = false; });
    if (mobile.matches) {
      $('controls').inert = true;
      $('controls').setAttribute('aria-hidden', 'true');
    }
    if (restore && lastSheetFocus?.isConnected) lastSheetFocus.focus();
  }
  function openSheet() {
    if (!mobile.matches) return;
    lastSheetFocus = document.activeElement;
    $('controls').inert = false;
    $('controls').classList.add('open');
    $('prepare-btn').setAttribute('aria-expanded', 'true');
    $('controls').setAttribute('aria-hidden', 'false');
    $('controls').setAttribute('role', 'dialog');
    $('controls').setAttribute('aria-modal', 'true');
    $('sheet-backdrop').hidden = false;
    document.body.classList.add('sheet-open');
    bloqueaveis().forEach(el => { el.inert = true; });
    $('close-controls').focus();
  }
  function responsive() {
    closeSheet(false);
    if (!mobile.matches) {
      $('controls').inert = false;
      $('controls').removeAttribute('aria-hidden');
      $('controls').removeAttribute('role');
      $('controls').removeAttribute('aria-modal');
    }
  }

  /* ---------- Gotas ---------- */
  function cabeMaisUma() {
    return !SIAB.targets(SIAB.current()).some(x => SIAB.chem.solve(x).volume + x.dropVolume > SIAB.capacidade(x) + 1e-9);
  }

  function leitura() {
    const t = SIAB.current(), r = SIAB.chem.solve(t);
    return { pH: r.pH, cor: SIAB.chem.indicatorColor(t, r.pH).name, r };
  }

  // Uma sequência de gotas (um toque, um "segurar" ou +5) vira uma única ação de desfazer.
  function iniciarSequencia() {
    if (sequencia) return;
    sequencia = { ...leitura(), n: 0, viragem: null };
    SIAB.registrar('gotas');
    SIAB.vidro.pingando($('large-tube'), true);
  }
  function gotaDaSequencia(fracao = 1) {
    if (!sequencia) iniciarSequencia();
    if (!cabeMaisUma()) {
      SIAB.notice(`Capacidade de ${SIAB.format(SIAB.capacidade(SIAB.current()), 0)} mL atingida.`);
      return false;
    }
    SIAB.targets(SIAB.current()).forEach(x => x.additions.push(x.dropVolume * fracao));
    sequencia.n++;
    const agora = leitura();
    const virou = SIAB.current().indicator !== 'none' && !sequencia.viragem && agora.cor !== sequencia.cor;
    const chegada = SIAB.vidro.gota($('large-tube'), SIAB.current(), SIAB.state.vidraria, { viragem: virou });
    if (virou) {
      sequencia.viragem = `${sequencia.cor} → ${agora.cor}`;
      // Viragem: a cor mudou e ficou (ponto final observado). Sem piscar o
      // contorno: o sinal é a própria cor, que agora não some ao misturar.
      setTimeout(() => SIAB.som.vibrar(), chegada);
    }
    // Numa rajada (+5 gotas, +1 mL, +5 mL) a tela e o som ficam para o fim.
    if (!emLote) {
      SIAB.som.tocar(agora.pH);
      SIAB.loja.avisar();
    }
    return true;
  }
  function fimSequencia() {
    if (!sequencia) return;
    const feita = sequencia;
    sequencia = null;
    SIAB.vidro.pingando($('large-tube'), false);
    if (feita.n === 0) {
      SIAB.state.history.pop();
      SIAB.loja.avisar();
      return;
    }
    const s = SIAB.state, t = SIAB.current(), agora = leitura();
    const cor = SIAB.chem.liquid(t, s.indicatorOnly, agora.r);
    mostrarDelta(feita.pH, agora.pH, feita.n);
    // Na lupa, as partículas das gotas entram e reagem.
    if (s.verTab === 'particulas') requestAnimationFrame(() => SIAB.lupa.reagir($('ver-conteudo'), t));
    const texto = `${feita.n} ${feita.n === 1 ? 'gota' : 'gotas'}${t.group ? ' em cada tubo vinculado' : ''}. Total ${agora.r.drops}. Cor ${cor.name}.${s.showPH ? ' pH ' + SIAB.phFormat(agora.r) + '.' : ''}${feita.viragem ? ` Viragem: ${feita.viragem}. A cor ficou: ponto final com ${SIAB.format(agora.r.added)} mL.` : ''}`;
    SIAB.announce(texto);
    SIAB.loja.avisar();
  }
  let emLote = false;
  function gotejar(n) {
    iniciarSequencia();
    let feitas = 0;
    emLote = n > 1;
    try {
      for (let k = 0; k < n; k++) {
        if (!gotaDaSequencia()) break;
        feitas++;
      }
    } finally {
      emLote = false;
    }
    if (feitas > 0) SIAB.som.tocar(leitura().pH);
    fimSequencia();
    return feitas;
  }

  // Meia gota (bureta): perto do ponto final, abre-se a torneira só até a gota
  // ficar pendurada na ponta; ela é encostada na parede do erlenmeyer e lavada
  // para dentro com a pisseta. Metade do volume de uma gota.
  function meiaGota() {
    iniciarSequencia();
    const ok = gotaDaSequencia(.5);
    if (ok) SIAB.som.tocar(leitura().pH);
    fimSequencia();
    if (ok) setTimeout(() => SIAB.announce(`Meia gota (${SIAB.format(SIAB.current().dropVolume / 2, 3)} mL): pendurada na ponta, encostada na parede e lavada para dentro.`), 50);
  }

  // Agitar: termina a mistura (as cores locais das gotas somem na cor do todo).
  function agitar() {
    const t = SIAB.current();
    if (!t) return;
    const ms = SIAB.vidro.agitar($('large-tube'));
    const c = SIAB.chem.liquid(t, SIAB.state.indicatorOnly);
    setTimeout(() => SIAB.announce(`Agitado: a cor ficou ${c.name} por igual no recipiente.`), ms);
  }

  function mostrarDelta(antes, depois, n) {
    const chip = $('ph-delta');
    const s = SIAB.state;
    const r = SIAB.chem.solve(SIAB.current());
    const casas = r.approximate ? 1 : 2;
    const diferenca = depois - antes;
    // Variação que some no arredondamento ("+0,0") não diz nada: o chip não aparece.
    // Acontece muito em recipientes grandes, onde poucas gotas quase não mudam o pH.
    if (s.showPH && Math.abs(diferenca) < .5 * 10 ** -casas) {
      chip.hidden = true;
      return;
    }
    chip.textContent = s.showPH
      ? `${SIAB.format(antes, casas)} → ${SIAB.format(depois, casas)} (${diferenca >= 0 ? '+' : '−'}${SIAB.format(Math.abs(diferenca), casas)})`
      : `+${n} ${n === 1 ? 'gota' : 'gotas'}`;
    chip.hidden = false;
    chip.classList.remove('pulsar');
    void chip.offsetWidth;
    chip.classList.add('pulsar');
    clearTimeout(deltaTimer);
    deltaTimer = setTimeout(() => { chip.hidden = true; }, 2800);
  }

  /* ---------- Prateleira e preparo ---------- */
  const eReagente = id => !SIAB.isEveryday(id) && id !== 'water';
  function colocar(id) {
    const s = SIAB.state, x = SIAB.solutions[id];
    if (!x) return;
    const alvo = s.destination === 'titrant' ? 'titrant' : 'tube';
    // Bancada vazia: o frasco escolhido cria o primeiro tubo (com água e sem indicador).
    const primeiro = !SIAB.current();
    SIAB.alterar(alvo === 'tube' ? `colocar ${x.name} no tubo` : `colocar ${x.name} no conta-gotas`, estado => {
      if (primeiro) {
        estado.activeId = SIAB.newTube({ solution: 'water', indicator: 'none' }).id;
        estado.view = 'focus';
      }
      SIAB.targets(SIAB.current()).forEach(tubo => {
        if (alvo === 'tube') {
          // Um frasco novo substitui o conteúdo (também o de uma mistura).
          delete tubo.componentes;
          delete tubo.indicadores;
          tubo.solution = id;
          tubo.dilution = 1;
          if (eReagente(id) && !(tubo.concentration > 0)) tubo.concentration = .01;
        } else {
          tubo.titrant = id;
          tubo.titrantDilution = 1;
          if (eReagente(id) && !(tubo.titrantConcentration > 0)) tubo.titrantConcentration = .01;
        }
        tubo.additions = [];
      });
    });
    SIAB.syncForm();
    const onde = alvo === 'tube' ? 'no tubo' : 'no conta-gotas';
    SIAB.notice(primeiro
      ? `${SIAB.current().name} criado com ${x.name} ${onde}. Agora escolha um indicador.`
      : `${x.name} ${onde}. As gotas recomeçaram; use Desfazer para voltar.`);
    SIAB.announce(`${x.name} ${onde}.`);
    // O menu da prateleira se fecha depois da escolha (o foco volta ao cabeçalho
    // dele). No celular, o painel também fecha: o resultado aparece na hora.
    const noCelular = mobile.matches && $('controls').classList.contains('open');
    SIAB.prateleira.fechar(!noCelular);
    if (noCelular) closeSheet();
  }

  function erroForm(form, campo, mensagem) {
    const box = $(form + '-error');
    box.textContent = mensagem;
    box.hidden = false;
    if (campo) {
      $(campo).setAttribute('aria-invalid', 'true');
      $(campo).setAttribute('aria-describedby', box.id);
      $(campo).focus();
    }
  }
  function limparErros(form) {
    $(form + '-error').hidden = true;
    $(form + '-form').querySelectorAll('[aria-invalid]').forEach(el => {
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    });
  }

  function aplicarMedidas(evento) {
    evento.preventDefault();
    limparErros('prepare');
    const t = SIAB.current();
    const medidas = {
      concentration: Number($('concentration').value),
      initialVolume: Number($('initial-volume').value),
      titrantConcentration: Number($('titrant-concentration').value),
      dropVolume: Number($('drop-volume').value),
      dilution: Number($('dilution-select').value),
      titrantDilution: Number($('titrant-dilution-select').value)
    };
    const maximo = Math.round(SIAB.capacidade(t) * .8 * 100) / 100;
    if (!Number.isFinite(medidas.initialVolume) || medidas.initialVolume < .1 || medidas.initialVolume > maximo) {
      erroForm('prepare', 'initial-volume', `O volume inicial deve ficar entre 0,1 e ${SIAB.format(maximo, maximo % 1 ? 2 : 0)} mL (80 % da capacidade).`);
      return;
    }
    if (![.01, .02, .05, .1].includes(medidas.dropVolume)) {
      erroForm('prepare', 'drop-volume-trigger', 'Escolha um dos volumes de gota disponíveis.');
      return;
    }
    const checar = [[t.solution, medidas.concentration, 'concentration'], [t.titrant, medidas.titrantConcentration, 'titrant-concentration']];
    for (const [id, c, campo] of checar) {
      if (eReagente(id) && (!Number.isFinite(c) || c < .0001 || c > .1)) {
        erroForm('prepare', SIAB.state.level === 'calcular' ? campo : null, 'A concentração deve ficar entre 0,0001 e 0,1 mol/L.');
        return;
      }
    }
    if (!eReagente(t.solution)) medidas.concentration = t.solution === 'water' ? 0 : t.concentration;
    if (!eReagente(t.titrant)) medidas.titrantConcentration = t.titrant === 'water' ? 0 : t.titrantConcentration;
    if (!SIAB.isEveryday(t.solution)) medidas.dilution = 1;
    if (!SIAB.isEveryday(t.titrant)) medidas.titrantDilution = 1;
    SIAB.alterar('aplicar medidas', () => {
      SIAB.targets(t).forEach(x => Object.assign(x, medidas, { additions: [] }));
    });
    closeSheet();
    SIAB.notice(SIAB.targets(t).length > 1 ? 'Medidas aplicadas aos tubos vinculados.' : 'Medidas aplicadas. Use Desfazer para voltar.');
  }

  /* ---------- Vidraria e capacidade ---------- */
  // Troca o desenho de todos os recipientes. Nomes padrão acompanham
  // ("Tubo 2" vira "Béquer 2"); nomes dados pelo estudante ficam como estão.
  // Se a capacidade muda, o volume inicial acompanha na mesma proporção (o
  // recipiente continua cheio até a mesma altura) e as gotas recomeçam.
  // Tudo numa só ação de "Desfazer" (que também devolve a vidraria).
  function mudarRecipiente(descricao, mudar) {
    const s = SIAB.state;
    const antes = SIAB.capacidadeDaBancada(s);
    const aviso = [];
    SIAB.alterar(descricao, estado => {
      mudar(estado);
      const depois = SIAB.capacidadeDaBancada(estado);
      const curtos = Object.values(SIAB.VIDRARIAS).map(x => x.curto).join('|');
      const padrao = new RegExp(`^(${curtos}) (\\d+)$`);
      estado.tubes.forEach(t => {
        if (t.vidraria) return; // o béquer da mistura geral tem vidraria própria
        const m = t.name.match(padrao);
        if (m) t.name = `${SIAB.VIDRARIAS[estado.vidraria].curto} ${m[2]}`;
        if (depois !== antes) {
          const novo = Math.round(t.initialVolume * depois / antes * 100) / 100;
          if (!aviso.length) aviso.push(`${SIAB.volumeTexto(t.initialVolume, antes)} → ${SIAB.volumeTexto(novo, depois)} mL`);
          t.initialVolume = Math.min(depois * .8, Math.max(.1, novo));
          t.additions = [];
        }
      });
    });
    SIAB.render(true);
    const v = SIAB.VIDRARIAS[s.vidraria];
    const tamanho = s.vidraria === 'tubo' ? '5 mL' : `${SIAB.capacidadeDaBancada(s)} mL`;
    SIAB.announce(`${v.nome} de ${tamanho}.`);
    if (aviso.length) SIAB.notice(`${v.nome} de ${tamanho}: volume inicial ${aviso[0]}. As gotas recomeçaram; use Desfazer para voltar.`);
  }
  function trocarVidraria(valor) {
    if (!SIAB.VIDRARIAS[valor] || SIAB.state.vidraria === valor) return;
    mudarRecipiente('trocar vidraria', estado => { estado.vidraria = valor; });
  }
  function trocarCapacidade(ml) {
    const s = SIAB.state;
    if (s.vidraria === 'tubo' || !SIAB.VIDRARIAS[s.vidraria].capacidades.includes(ml) || s.capacidades[s.vidraria] === ml) return;
    mudarRecipiente('trocar capacidade', estado => { estado.capacidades = { ...estado.capacidades, [estado.vidraria]: ml }; });
  }

  /* ---------- Tubos ---------- */
  function selecionarTubo(id) {
    const s = SIAB.state;
    if (!s.tubes.some(t => t.id === id)) return;
    limparErros('prepare');
    closeSheet(false);
    s.activeId = id;
    s.view = 'focus';
    SIAB.render(true);
    SIAB.loja.avisar();
    SIAB.announce(`${SIAB.current().name} selecionado.`);
  }

  function adicionarTubo() {
    const s = SIAB.state;
    if (s.tubes.length >= SIAB.MAX_TUBES) return;
    let novo;
    // O novo tubo usa o mesmo conta-gotas do tubo atual (ou o padrão, se a bancada estiver vazia).
    const atual = SIAB.current();
    SIAB.alterar('novo tubo', () => {
      novo = SIAB.newTube({ solution: 'water', indicator: 'none', ...(atual && { titrant: atual.titrant, titrantConcentration: atual.titrantConcentration, titrantDilution: atual.titrantDilution }) });
    });
    selecionarTubo(novo.id);
    SIAB.notice(`${novo.name} adicionado com água. Escolha um frasco na prateleira.`);
    if (mobile.matches) openSheet();
  }

  function removerTubo() {
    const s = SIAB.state;
    const t = SIAB.current();
    if (!t) return;
    SIAB.confirmar('Remover tubo?', `“${t.name}” e suas gotas serão removidos. Você pode desfazer depois.`, () => {
      closeSheet(false);
      const indice = s.tubes.indexOf(t);
      SIAB.alterar('remover tubo', estado => {
        estado.tubes = estado.tubes.filter(x => x.id !== t.id);
        const resto = estado.tubes.filter(x => x.group && x.group === t.group);
        if (resto.length === 1) resto[0].group = null;
        estado.activeId = estado.tubes.length ? estado.tubes[Math.min(indice, estado.tubes.length - 1)].id : null;
      });
      SIAB.render(true);
      // Sem tubos, a bancada volta ao início (vazia); o foco vai para o aviso.
      if (!s.tubes.length) $('vazia-titulo').focus();
      SIAB.notice(s.tubes.length ? 'Tubo removido.' : 'Tubo removido. A bancada está vazia; use Desfazer para voltar.');
    }, 'Remover tubo', 'danger');
  }

  function compararIndicadores() {
    const s = SIAB.state;
    if (s.tubes.length + 3 > SIAB.MAX_TUBES) return;
    const t = SIAB.current();
    let primeiro;
    SIAB.alterar('comparar indicadores', estado => {
      const grupo = estado.nextGroup++;
      ['btb', 'phenol', 'universal'].forEach((indicator, n) => {
        const copia = SIAB.newTube({
          name: `${t.name} · ${SIAB.indicators[indicator].short}`.slice(0, 40),
          solution: t.solution, concentration: t.concentration, initialVolume: t.initialVolume,
          titrant: t.titrant, titrantConcentration: t.titrantConcentration, dropVolume: t.dropVolume,
          dilution: t.dilution, titrantDilution: t.titrantDilution, additions: t.additions,
          temperature: t.temperature, indicator, group: grupo
        });
        if (n === 0) primeiro = copia;
      });
    });
    selecionarTubo(primeiro.id);
    SIAB.notice('Comparação criada: três tubos vinculados. Cada gota cai nos três.');
  }

  function desvincular() {
    const t = SIAB.current();
    SIAB.alterar('desvincular', estado => {
      const antigo = t.group;
      t.group = null;
      const resto = estado.tubes.filter(x => x.group === antigo);
      if (resto.length === 1) resto[0].group = null;
    });
    SIAB.notice('Este tubo agora recebe gotas individualmente.');
  }

  function recomecar() {
    SIAB.alterar('recomeçar gotas', () => {
      SIAB.targets(SIAB.current()).forEach(x => { x.additions = []; });
    });
    closeSheet();
    SIAB.notice('Gotas removidas. Use Desfazer para voltar.');
  }

  function desfazer() {
    const descricao = SIAB.desfazer();
    if (!descricao) return;
    SIAB.render(true);
    SIAB.loja.avisar();
    SIAB.announce(`Desfeito: ${descricao}.`);
    // Se o botão usado sumiu (a bancada ficou vazia ou deixou de estar), o foco vai para o título visível.
    if (document.activeElement?.closest('[hidden]') || document.activeElement === document.body) {
      $(SIAB.current() ? 'tube-name' : 'vazia-titulo').focus();
    }
  }

  /* ---------- Prever, observar, explicar (M1) ---------- */
  let previsao = null;
  function abrirPrevisao() {
    const t = SIAB.current(), ind = SIAB.indicators[t.indicator];
    $('poe-contexto').textContent = `${t.name}: ${SIAB.solutionSummary(t.solution, t.concentration, t.dilution)}. Conta-gotas: ${SIAB.solutionSummary(t.titrant, t.titrantConcentration, t.titrantDilution)}. Indicador: ${ind.name}.`;
    const cores = t.indicator === 'none' ? [] : SIAB.chem.colorNames(t.indicator);
    $('poe-cor-grupo').hidden = !cores.length;
    $('poe-cores').innerHTML = [...cores, 'não sei'].map((nome, n) => `<label class="chip"><input type="radio" name="poe-cor" value="${SIAB.escape(nome)}" ${n === cores.length ? 'checked' : ''}><span>${SIAB.escape(nome)}</span></label>`).join('');
    // Quantidades de gotas conforme a capacidade (SIAB.ESCALAS): num béquer
    // grande, 20 gotas quase não mudam o pH. Fora do tubo, mostra também os mL.
    const cap = SIAB.capacidade(t);
    const opcoes = SIAB.escala(cap).previsao;
    const marcada = Number(document.querySelector('input[name="poe-gotas"]:checked')?.value);
    $('poe-gotas-opcoes').innerHTML = opcoes.map((n, k) => `<label><input type="radio" name="poe-gotas" value="${n}"${(opcoes.includes(marcada) ? n === marcada : k === 2) ? ' checked' : ''}><span>${n}${cap > SIAB.CAPACITY_ML ? `<small>${(Math.round(n * t.dropVolume * 100) / 100).toLocaleString('pt-BR')} mL</small>` : ''}</span></label>`).join('');
    const livre = (cap - SIAB.chem.solve(t).volume) / t.dropVolume;
    document.querySelectorAll('input[name="poe-gotas"]').forEach(x => {
      x.disabled = Number(x.value) > livre + 1e-9;
      if (x.disabled && x.checked) x.checked = false;
    });
    if (!document.querySelector('input[name="poe-gotas"]:checked')) {
      const primeiro = document.querySelector('input[name="poe-gotas"]:not(:disabled)');
      if (primeiro) primeiro.checked = true;
    }
    document.querySelectorAll('input[name="poe-meio"]').forEach(x => { x.checked = false; });
    $('poe-porque').value = '';
    $('poe-explicacao').value = '';
    $('poe-erro').hidden = true;
    $('poe-form').hidden = false;
    $('poe-resultado').hidden = true;
    $('poe-title').textContent = 'Antes de gotejar, preveja';
    $('poe-dialog').showModal();
  }
  function conferirPrevisao(evento) {
    evento.preventDefault();
    const gotas = Number(document.querySelector('input[name="poe-gotas"]:checked')?.value || 0);
    const meio = document.querySelector('input[name="poe-meio"]:checked')?.value;
    const cor = document.querySelector('input[name="poe-cor"]:checked')?.value || 'não sei';
    if (!gotas || !meio) {
      $('poe-erro').textContent = !gotas ? 'Não cabem mais gotas neste recipiente.' : 'Escolha se a solução ficará ácida, neutra ou básica.';
      $('poe-erro').hidden = false;
      return;
    }
    const t = SIAB.current();
    const feitas = gotejar(gotas);
    const r = SIAB.chem.solve(t);
    const corReal = SIAB.chem.indicatorColor(t, r.pH).name;
    const acertouMeio = meio === r.phase;
    const acertouCor = cor === 'não sei' ? null : cor === corReal;
    const marca = ok => (ok ? '✓' : '✗');
    $('poe-comparacao').innerHTML = `<p><strong>${feitas} gotas adicionadas.</strong></p>
      <dl class="eq-numeros">
        <div class="eq-linha"><dt>Você previu</dt><dd>${SIAB.escape(meio.toLowerCase())}${cor !== 'não sei' ? ', ' + SIAB.escape(cor) : ''}</dd></div>
        <div class="eq-linha"><dt>Resultado</dt><dd>${r.phase.toLowerCase()}, ${SIAB.escape(corReal)} (pH ${SIAB.phFormat(r)})</dd></div>
        <div class="eq-linha"><dt>Meio</dt><dd>${marca(acertouMeio)} ${acertouMeio ? 'acertou' : 'diferente do previsto'}</dd></div>
        ${acertouCor === null ? '' : `<div class="eq-linha"><dt>Cor</dt><dd>${marca(acertouCor)} ${acertouCor ? 'acertou' : 'diferente do previsto'}</dd></div>`}
      </dl>`;
    previsao = SIAB.progresso.anotar({
      tipo: 'previsao',
      titulo: `Previsão · ${t.name}`,
      linhas: [
        ['Tubo', SIAB.solutionSummary(t.solution, t.concentration, t.dilution)],
        ['Conta-gotas', SIAB.solutionSummary(t.titrant, t.titrantConcentration, t.titrantDilution)],
        ['Indicador', SIAB.indicators[t.indicator].name],
        ['Gotas', String(feitas)],
        ['Previsão', `${meio}${cor !== 'não sei' ? ', ' + cor : ''}`],
        ['Por quê', $('poe-porque').value.trim() || '—'],
        ['Resultado', `${r.phase}, ${corReal}, pH ${SIAB.phFormat(r)}`]
      ]
    });
    $('poe-title').textContent = 'Observe e explique';
    $('poe-form').hidden = true;
    $('poe-resultado').hidden = false;
    $('poe-explicacao').focus();
  }
  function salvarExplicacao(evento) {
    evento.preventDefault();
    if (previsao) {
      const nota = SIAB.progresso.dados.caderno.find(x => x.id === previsao);
      if (nota) {
        nota.linhas = nota.linhas.filter(([rotulo]) => rotulo !== 'Explicação');
        nota.linhas.push(['Explicação', $('poe-explicacao').value.trim() || '—']);
        SIAB.progresso.salvar();
      }
    }
    $('poe-dialog').close();
    SIAB.notice('Previsão e explicação salvas no caderno.');
  }

  /* ---------- Eventos ---------- */
  function ligar() {
    SIAB.contaGotas.ligar($('drop-btn'), {
      inicio: iniciarSequencia,
      gotejar: gotaDaSequencia,
      fim: fimSequencia
    });
    $('drop5-btn').addEventListener('click', () => gotejar(5));
    $('meia-gota-btn').addEventListener('click', meiaGota);
    // Os atalhos em mL mudam com a capacidade (data-ml, escrito por render.js).
    $('drop1ml-btn').addEventListener('click', evento => gotejar(Math.round(Number(evento.currentTarget.dataset.ml || 1) / SIAB.current().dropVolume)));
    $('drop5ml-btn').addEventListener('click', evento => gotejar(Math.round(Number(evento.currentTarget.dataset.ml || 5) / SIAB.current().dropVolume)));
    $('poe-btn').addEventListener('click', abrirPrevisao);
    $('poe-form').addEventListener('submit', conferirPrevisao);
    $('poe-resultado').addEventListener('submit', salvarExplicacao);
    $('undo-btn').addEventListener('click', desfazer);
    $('agitar-btn').addEventListener('click', agitar);
    // Altura da barra do conta-gotas (fixa no celular): a página reserva esse espaço.
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(() => {
        document.documentElement.style.setProperty('--dose-h', `${Math.ceil($('dose-area').getBoundingClientRect().height)}px`);
      }).observe($('dose-area'));
      // Setas de transferência de próton: redesenha quando o painel muda de largura.
      let larguraVer = 0;
      new ResizeObserver(([item]) => {
        const w = Math.round(item.contentRect.width);
        if (w === larguraVer) return;
        larguraVer = w;
        if (SIAB.state.verTab === 'equacao') SIAB.equacao.setas($('ver-conteudo'));
      }).observe($('ver-conteudo'));
    }

    $('focus-tab').addEventListener('click', () => { closeSheet(false); SIAB.state.view = 'focus'; SIAB.render(true); });
    $('overview-tab').addEventListener('click', () => { closeSheet(false); SIAB.state.view = 'overview'; SIAB.render(true); });
    $('ordenar-ph-btn').addEventListener('click', () => {
      SIAB.state.ordemPH = !SIAB.state.ordemPH;
      SIAB.render(true);
      SIAB.announce(SIAB.state.ordemPH ? 'Recipientes em ordem de pH, do mais ácido ao mais básico.' : 'Recipientes na ordem da bancada.');
    });
    document.addEventListener('click', evento => {
      const tubo = evento.target.closest('[data-tube]');
      if (tubo) selecionarTubo(Number(tubo.dataset.tube));
      const frasco = evento.target.closest('[data-solution]');
      if (frasco && frasco.closest('#shelf')) colocar(frasco.dataset.solution);
    });
    $('add-tube-btn').addEventListener('click', adicionarTubo);
    // Botões do aviso "Bancada vazia".
    $('vazia-agua').addEventListener('click', adicionarTubo);
    $('vazia-desfazer').addEventListener('click', desfazer);
    $('vazia-prateleira').addEventListener('click', () => {
      if (mobile.matches) openSheet();
      else SIAB.trilho.mostrar('controls', 'frascos');
      SIAB.prateleira.abrir('tube', { foco: 'busca' });
    });

    $('rename-btn').addEventListener('click', () => {
      $('new-name').value = SIAB.current().name;
      limparErros('rename');
      $('rename-dialog').showModal();
      $('new-name').select();
    });
    $('new-name').addEventListener('input', () => limparErros('rename'));
    $('rename-form').addEventListener('submit', evento => {
      evento.preventDefault();
      const nome = $('new-name').value.trim().replace(/\s+/g, ' ');
      if (!nome || nome.length > 40) {
        erroForm('rename', 'new-name', 'Digite um nome com 1 a 40 caracteres.');
        return;
      }
      SIAB.alterar('renomear', () => { SIAB.current().name = nome; });
      $('rename-dialog').close();
      SIAB.announce(`Nome alterado para ${nome}.`);
    });

    $('ph-toggle').addEventListener('click', () => {
      SIAB.state.showPH = !SIAB.state.showPH;
      SIAB.loja.avisar();
    });
    $('indicator-only').addEventListener('change', evento => {
      SIAB.state.indicatorOnly = evento.target.checked;
      SIAB.loja.avisar();
    });
    $('indicator-chips').addEventListener('change', evento => {
      if (evento.target.name !== 'indicador') return;
      const valor = evento.target.value;
      // Escolher um indicador substitui a mistura de indicadores, se houver.
      SIAB.alterar('trocar indicador', () => { SIAB.current().indicator = valor; delete SIAB.current().indicadores; });
      SIAB.announce(`Indicador: ${SIAB.indicators[valor].name}.`);
      document.querySelector(`#indicator-chips input[value="${valor}"]`)?.focus();
    });
    SIAB.modulos.ligar();
    document.querySelectorAll('input[name="vidraria"]').forEach(x => x.addEventListener('change', () => trocarVidraria(x.value)));
    $('capacidade-opcoes').addEventListener('change', evento => {
      if (evento.target.name === 'capacidade') trocarCapacidade(Number(evento.target.value));
    });
    SIAB.prateleira.ligar();
    $('prepare-form').addEventListener('input', () => limparErros('prepare'));
    $('prepare-form').addEventListener('change', () => limparErros('prepare'));
    $('prepare-form').addEventListener('submit', aplicarMedidas);
    $('compare-btn').addEventListener('click', compararIndicadores);
    $('unlink-btn').addEventListener('click', desvincular);
    $('restart-btn').addEventListener('click', recomecar);
    $('remove-btn').addEventListener('click', removerTubo);
    $('guide-btn').addEventListener('click', () => $('guide-dialog').showModal());

    // Chips do VER (celular e tablet): escolhem a aba e rolam até o painel.
    document.querySelector('.view-tabs').addEventListener('click', evento => {
      const chip = evento.target.closest('[data-ir-ver]');
      if (!chip) return;
      SIAB.state.verTab = chip.dataset.irVer;
      SIAB.loja.avisar();
      $('ver-panel').scrollIntoView({ block: 'start', behavior: A11Y.estado.motion ? 'auto' : 'smooth' });
      $(`tab-${chip.dataset.irVer}`).focus({ preventScroll: true });
    });

    // Abas do painel VER, com setas do teclado.
    const abas = () => [...document.querySelectorAll('#ver-tabs [data-ver]')].filter(x => !x.hidden);
    $('ver-tabs').addEventListener('click', evento => {
      const aba = evento.target.closest('[data-ver]');
      if (!aba) return;
      SIAB.state.verTab = aba.dataset.ver;
      SIAB.loja.avisar();
    });
    $('ver-tabs').addEventListener('keydown', evento => {
      const lista = abas(), atual = lista.indexOf(document.activeElement);
      if (atual < 0 || !['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(evento.key)) return;
      evento.preventDefault();
      let proxima = atual;
      if (evento.key === 'ArrowRight') proxima = (atual + 1) % lista.length;
      if (evento.key === 'ArrowLeft') proxima = (atual - 1 + lista.length) % lista.length;
      if (evento.key === 'Home') proxima = 0;
      if (evento.key === 'End') proxima = lista.length - 1;
      SIAB.state.verTab = lista[proxima].dataset.ver;
      SIAB.loja.avisar();
      lista[proxima].focus();
    });
    $('ver-conteudo').addEventListener('click', evento => {
      const botao = evento.target.closest('[data-acao]');
      if (!botao) return;
      const t = SIAB.current();
      if (botao.dataset.acao === 'lupa-escala') {
        SIAB.state.lupaLog = !SIAB.state.lupaLog;
        SIAB.loja.avisar();
        SIAB.$('ver-conteudo').querySelector('[data-acao="lupa-escala"]')?.focus();
        SIAB.announce(SIAB.state.lupaLog ? 'Lupa em escala logarítmica: os íons raros aparecem.' : 'Lupa em escala linear.');
        return;
      }
      // Ponte entre representações: uma espécie tocada na Equação, na Condução,
      // no diagrama de espécies ou na legenda da lupa fica em destaque na lupa.
      if (botao.dataset.acao === 'destacar') {
        const s = SIAB.state, f = botao.dataset.especie, naLupa = s.verTab === 'particulas';
        s.destaque = naLupa && s.destaque === f ? null : f;
        s.verTab = 'particulas';
        SIAB.loja.avisar();
        [...SIAB.$('ver-conteudo').querySelectorAll('.lupa-legenda [data-especie]')].find(b => b.dataset.especie === f)?.focus();
        SIAB.announce(s.destaque ? `Lupa de partículas: ${f} em destaque.` : 'Lupa de partículas: todas as espécies.');
        return;
      }
      if (botao.dataset.acao === 'grafico-modo') {
        SIAB.state.graficoModo = botao.dataset.modo;
        SIAB.loja.avisar();
        SIAB.$('ver-conteudo').querySelector(`[data-modo="${botao.dataset.modo}"]`)?.focus();
        SIAB.announce({ ph: 'Gráfico: pH × volume.', derivada: 'Gráfico: derivada ΔpH/ΔV; o pico marca a equivalência.', especies: 'Gráfico: fração de cada espécie × pH.' }[botao.dataset.modo]);
        return;
      }
      if (botao.dataset.acao === 'csv') {
        const nome = SIAB.normalizar(t.name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tubo';
        SIAB.baixarArquivo(`siab-${nome}.csv`, SIAB.historyCSV(t));
        SIAB.notice('Tabela baixada em CSV.');
      }
      if (botao.dataset.acao === 'registrar') {
        const r = SIAB.chem.solve(t);
        SIAB.progresso.anotar({
          tipo: 'leitura',
          titulo: `Leitura · ${t.name}`,
          linhas: [
            ['Tubo', SIAB.solutionSummary(t.solution, t.concentration, t.dilution)],
            ['Conta-gotas', SIAB.solutionSummary(t.titrant, t.titrantConcentration, t.titrantDilution)],
            ['Gotas', `${r.drops} (${SIAB.format(r.added)} mL)`],
            ['Indicador', `${SIAB.nomeIndicador(t)}: ${SIAB.chem.indicatorColor(t, r.pH).name}`],
            ['pH', SIAB.state.showPH ? SIAB.phFormat(r) : 'oculto']
          ],
          tabela: SIAB.historicoTabela(t)
        });
        SIAB.notice('Leitura registrada no caderno.');
      }
    });

    $('prepare-btn').addEventListener('click', openSheet);
    $('close-controls').addEventListener('click', () => closeSheet());
    $('sheet-backdrop').addEventListener('click', () => closeSheet());
    document.addEventListener('keydown', evento => {
      if (!$('controls').classList.contains('open') || document.querySelector('dialog[open]')) return;
      if (evento.key === 'Escape') closeSheet();
      if (evento.key === 'Tab') {
        const nos = [...$('controls').querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea,summary,a[href]')].filter(x => x.offsetParent !== null);
        const primeiro = nos[0], ultimo = nos.at(-1);
        if (evento.shiftKey && document.activeElement === primeiro) { evento.preventDefault(); ultimo.focus(); }
        else if (!evento.shiftKey && document.activeElement === ultimo) { evento.preventDefault(); primeiro.focus(); }
      }
    });
    $('confirm-yes').addEventListener('click', () => {
      const acao = confirmAction;
      confirmAction = null;
      $('confirm-dialog').close();
      if (acao) acao();
    });
    $('confirm-dialog').addEventListener('close', () => { confirmAction = null; });
    mobile.addEventListener('change', responsive);
    SIAB.loja.assinar(() => SIAB.render());
    responsive();
  }

  return { config, configurar, ligar, gotejar, meiaGota, agitar, colocar, selecionarTubo, trocarVidraria, trocarCapacidade, openSheet, closeSheet, responsive, TODOS, mobile };
})();
