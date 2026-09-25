'use strict';
/* Desafio M6 — Missão titulação: acerte o ponto.
   1) calcular o volume de equivalência (n = C · V); 2) escolher o indicador;
   3) titular com o pH oculto e parar na viragem. Pontuação máxima: 100. */
SIAB.desafios.titulacao = (() => {
  const CENARIOS = [
    { solution: 'hcl', titrant: 'naoh', nomes: ['HCl', 'NaOH'] },
    { solution: 'acetic', titrant: 'naoh', nomes: ['CH₃COOH', 'NaOH'] },
    { solution: 'ammonia', titrant: 'hcl', nomes: ['NH₃', 'HCl'] }
  ];
  const INDICADORES = ['methyl', 'btb', 'phenol'];
  let el = null, jogo = null, gotas = null;

  function novaPartida() {
    const base = SIAB.embaralhar(CENARIOS)[0];
    const combinacoes = [];
    for (const c of [.01, .02]) for (const v of [1, 1.5, 2]) for (const ct of [.01, .02]) {
      const eq = c * v / ct;
      if (eq >= .5 && eq <= 2.5 && v + eq * 1.3 <= SIAB.CAPACITY_ML) combinacoes.push({ c, v, ct });
    }
    const escolha = SIAB.embaralhar(combinacoes)[0];
    const tube = {
      id: 950, name: 'Titulação', ...SIAB.TUBE_DEFAULTS,
      solution: base.solution, concentration: escolha.c, initialVolume: escolha.v,
      titrant: base.titrant, titrantConcentration: escolha.ct, dropVolume: .05, indicator: 'none', additions: []
    };
    const eq = SIAB.chem.solve(tube).equivalenceVolume;
    jogo = { base, tube, eq, fase: 'calcular', pontos: { calculo: 0, indicador: 0, titulacao: 0 }, respostaV: null, parada: null };
    render();
  }

  // Volume em que a cor muda pela primeira vez, gota a gota.
  function viragem(indicador) {
    const t = { ...jogo.tube, indicator: indicador, additions: [] };
    const inicial = SIAB.chem.color(indicador, SIAB.chem.solve(t).pH).name;
    const maximo = Math.floor((SIAB.CAPACITY_ML - t.initialVolume) / t.dropVolume);
    for (let n = 1; n <= maximo; n++) {
      const pH = SIAB.chem.solve({ ...t, additions: Array(n).fill(t.dropVolume) }).pH;
      if (SIAB.chem.color(indicador, pH).name !== inicial) return n * t.dropVolume;
    }
    return null;
  }

  function conferirCalculo() {
    const valor = Number(String(el.querySelector('#tit-volume').value).replace(',', '.'));
    if (!Number.isFinite(valor) || valor <= 0) {
      const erro = el.querySelector('#tit-erro');
      erro.textContent = 'Digite o volume em mL, por exemplo 1,5.';
      erro.hidden = false;
      el.querySelector('#tit-volume').focus();
      return;
    }
    const erroRel = Math.abs(valor - jogo.eq) / jogo.eq;
    jogo.respostaV = valor;
    jogo.pontos.calculo = erroRel <= .02 ? 30 : erroRel <= .1 ? 15 : 0;
    jogo.fase = 'indicador';
    render();
  }

  function escolherIndicador(id) {
    const v = viragem(id);
    const erros = INDICADORES.map(x => ({ x, v: viragem(x) })).map(o => ({ ...o, erro: o.v === null ? Infinity : Math.abs(o.v - jogo.eq) }));
    const melhor = erros.reduce((a, b) => (b.erro < a.erro ? b : a));
    const erro = v === null ? Infinity : Math.abs(v - jogo.eq);
    jogo.pontos.indicador = erro <= jogo.tube.dropVolume + 1e-9 ? 20 : erro <= 3 * jogo.tube.dropVolume + 1e-9 ? 10 : 0;
    jogo.indicadorInfo = { id, v, melhor: melhor.x, erros };
    jogo.tube.indicator = id;
    jogo.fase = 'titular';
    render();
  }

  function parar() {
    const v = SIAB.chem.added(jogo.tube);
    const erroRel = Math.abs(v - jogo.eq) / jogo.eq;
    jogo.parada = v;
    jogo.pontos.titulacao = Math.round(50 * Math.max(0, 1 - erroRel / .2));
    jogo.fase = 'fim';
    const total = jogo.pontos.calculo + jogo.pontos.indicador + jogo.pontos.titulacao;
    jogo.recorde = SIAB.fimDePartida('titulacao', total, [
      ['Titulação', `${SIAB.format(jogo.tube.initialVolume)} mL de ${jogo.base.nomes[0]} ${SIAB.format(jogo.tube.concentration, 2)} mol/L com ${jogo.base.nomes[1]} ${SIAB.format(jogo.tube.titrantConcentration, 2)} mol/L`],
      ['Equivalência', `${SIAB.format(jogo.eq, 2)} mL (você calculou ${SIAB.format(jogo.respostaV, 2)} mL)`],
      ['Indicador', `${SIAB.indicators[jogo.tube.indicator].name}`],
      ['Parada', `${SIAB.format(v, 2)} mL`]
    ]);
    render();
    el.querySelector('#tit-resultado')?.focus();
  }

  function enunciado() {
    const t = jogo.tube;
    return `${SIAB.format(t.initialVolume, 1)} mL de ${SIAB.solutions[t.solution].name} (${jogo.base.nomes[0]}) ${SIAB.format(t.concentration, 2)} mol/L, titulado com ${SIAB.solutions[t.titrant].name} (${jogo.base.nomes[1]}) ${SIAB.format(t.titrantConcentration, 2)} mol/L.`;
  }

  function render() {
    gotas?.parar();
    gotas = null;
    const cab = SIAB.cabecalhoJogo('titulacao', 'Calcule, escolha o indicador e titule com o pH escondido.');
    const t = jogo.tube;
    const etapas = ['calcular', 'indicador', 'titular', 'fim'];
    const passo = etapas.indexOf(jogo.fase) + 1;
    const pontos = jogo.pontos.calculo + jogo.pontos.indicador + jogo.pontos.titulacao;
    let corpo = '';
    if (jogo.fase === 'calcular') {
      corpo = `<h2 tabindex="-1">1. Calcule o volume de equivalência</h2>
        <p>${enunciado()}</p>
        <p class="field-hint">Na equivalência, a quantidade de ácido (mol) é igual à de base: C₁ · V₁ = C₂ · V₂.</p>
        <label class="field">Volume de ${jogo.base.nomes[1]} até a equivalência (mL)<input id="tit-volume" inputmode="decimal" autocomplete="off"></label>
        <p id="tit-erro" class="form-error" role="alert" hidden></p>
        <div class="jogo-acoes"><button type="button" class="primary-btn" data-acao="calculo">Conferir cálculo</button></div>`;
    }
    if (jogo.fase === 'indicador') {
      const certo = jogo.pontos.calculo === 30;
      corpo = `<div class="quiz-feedback ${certo ? 'certo' : 'errado'}" role="status"><strong>${certo ? '✓' : '✗'} V = ${SIAB.format(t.concentration, 2)} × ${SIAB.format(t.initialVolume, 1)} ÷ ${SIAB.format(t.titrantConcentration, 2)} = ${SIAB.format(jogo.eq, 2)} mL</strong><p>Você respondeu ${SIAB.format(jogo.respostaV, 2)} mL · ${jogo.pontos.calculo} de 30 pontos.</p></div>
        <h2 tabindex="-1">2. Escolha o indicador</h2>
        <p>${enunciado()} Qual indicador muda de cor mais perto da equivalência?</p>
        <div class="detetive-botoes">${INDICADORES.map(id => `<button type="button" class="secondary-btn" data-indicador="${id}">${SIAB.escape(SIAB.indicators[id].name)} (${SIAB.format(SIAB.indicators[id].low, 1)}–${SIAB.format(SIAB.indicators[id].high, 1)})</button>`).join('')}</div>`;
    }
    if (jogo.fase === 'titular') {
      const info = jogo.indicadorInfo;
      const r = SIAB.chem.solve(t);
      const cor = SIAB.chem.color(t.indicator, r.pH).name;
      const cheio = r.volume + t.dropVolume > SIAB.CAPACITY_ML + 1e-9;
      corpo = `<div class="quiz-feedback ${jogo.pontos.indicador === 20 ? 'certo' : 'errado'}" role="status"><strong>${jogo.pontos.indicador} de 20 pontos pelo indicador.</strong><p>${info.melhor === info.id ? 'Boa escolha: é o que muda mais perto da equivalência.' : `O mais adequado aqui é ${SIAB.escape(SIAB.indicators[info.melhor].name)}.`} Siga com o que você escolheu.</p></div>
        <h2 tabindex="-1">3. Titule e pare na viragem</h2>
        <div class="titulacao-bancada">
          <div class="titulacao-tubo">${SIAB.tubeSVG(t, 'titulacao')}</div>
          <div>
            <p class="titulacao-leitura"><strong>Cor: ${SIAB.escape(cor)}</strong><br><span class="small">pH oculto · ${r.drops} gotas · ${SIAB.format(r.added)} mL</span></p>
            <div class="dose-actions"><button type="button" class="primary-btn drop-btn" id="tit-gota" ${cheio ? 'disabled' : ''}>＋ Segure para gotejar</button></div>
            <p class="field-hint">Gotas de ${SIAB.format(t.dropVolume)} mL. Solte o botão para parar. Teclado: Enter adiciona 1 gota; segure Espaço.</p>
            <div class="jogo-acoes"><button type="button" class="secondary-btn" data-acao="desfazer" ${r.drops ? '' : 'disabled'}>↶ Tirar 1 gota</button><button type="button" class="primary-btn" data-acao="parar" ${r.drops ? '' : 'disabled'}>Parei na viragem</button></div>
          </div>
        </div>`;
    }
    if (jogo.fase === 'fim') {
      const erro = jogo.parada - jogo.eq;
      const maxV = Math.min(SIAB.CAPACITY_ML - t.initialVolume, Math.max(jogo.eq * 1.6, jogo.parada * 1.1));
      const teorica = SIAB.grafico.curvaTeorica({ ...t, additions: [] }, maxV, maxV / 120);
      const pontosAluno = SIAB.grafico.serie(t);
      corpo = `<div id="tit-resultado" class="jogo-painel fim" tabindex="-1">
        <h2>${pontos} de 100 pontos${jogo.recorde ? ' · novo recorde!' : ''}</h2>
        <dl class="resumo-missao">
          <div><dt>Cálculo</dt><dd>${jogo.pontos.calculo} / 30</dd></div>
          <div><dt>Indicador</dt><dd>${jogo.pontos.indicador} / 20</dd></div>
          <div><dt>Titulação</dt><dd>${jogo.pontos.titulacao} / 50 · você parou em ${SIAB.format(jogo.parada)} mL (${erro >= 0 ? '+' : '−'}${SIAB.format(Math.abs(erro))} mL da equivalência)</dd></div>
        </dl>
        ${SIAB.grafico.svg({ ...t }, { pontos: pontosAluno, teorica, maxVolume: maxV, paradaVolume: jogo.parada })}
        <p class="field-hint">Linha fina: curva completa. Linha grossa: suas gotas. A viragem do indicador e a equivalência podem não coincidir.</p>
        <div class="jogo-acoes"><button type="button" class="primary-btn" data-acao="nova">Nova titulação</button><a class="secondary-btn" href="#/desafios">Outros desafios</a></div>
      </div>`;
    }
    el.innerHTML = `${cab}<section class="jogo-painel titulacao"><p class="eyebrow">ETAPA ${passo} DE 4 · ${pontos} PONTOS</p>${corpo}</section>`;
    if (jogo.fase === 'titular') {
      gotas = SIAB.contaGotas.ligar(el.querySelector('#tit-gota'), {
        gotejar() {
          const r = SIAB.chem.solve(jogo.tube);
          if (r.volume + jogo.tube.dropVolume > SIAB.CAPACITY_ML + 1e-9) return false;
          jogo.tube.additions.push(jogo.tube.dropVolume);
          atualizarTitulacao();
          return true;
        }
      });
    }
  }

  // Atualiza só o tubo e a leitura, para não perder o foco do botão durante o gotejamento.
  function atualizarTitulacao() {
    const t = jogo.tube, r = SIAB.chem.solve(t);
    const cor = SIAB.chem.color(t.indicator, r.pH).name;
    el.querySelector('.titulacao-tubo').innerHTML = SIAB.tubeSVG(t, 'titulacao');
    el.querySelector('.titulacao-leitura').innerHTML = `<strong>Cor: ${SIAB.escape(cor)}</strong><br><span class="small">pH oculto · ${r.drops} gotas · ${SIAB.format(r.added)} mL</span>`;
    el.querySelectorAll('[data-acao="desfazer"],[data-acao="parar"]').forEach(b => { b.disabled = !r.drops; });
    SIAB.som.tocar(r.pH);
    SIAB.announce(`${r.drops} gotas. Cor ${cor}.`);
  }

  function aoClicar(evento) {
    const botao = evento.target.closest('button');
    if (!botao) return;
    if (botao.dataset.acao === 'calculo') conferirCalculo();
    if (botao.dataset.indicador) escolherIndicador(botao.dataset.indicador);
    if (botao.dataset.acao === 'desfazer') { jogo.tube.additions.pop(); atualizarTitulacao(); }
    if (botao.dataset.acao === 'parar') parar();
    if (botao.dataset.acao === 'nova') novaPartida();
    if (botao.dataset.acao !== 'desfazer' && (botao.dataset.acao || botao.dataset.indicador)) el?.querySelector('h2[tabindex]')?.focus();
  }
  function aoTeclar(evento) {
    if (evento.key === 'Enter' && evento.target.id === 'tit-volume') {
      evento.preventDefault();
      conferirCalculo();
    }
  }

  return {
    titulo: 'Missão titulação', conteudo: 'Estequiometria', resumo: 'Calcule a equivalência, escolha o indicador e pare a titulação na hora certa.',
    montar(elemento) {
      el = elemento;
      el.addEventListener('click', aoClicar);
      el.addEventListener('keydown', aoTeclar);
      novaPartida();
    },
    desmontar() {
      gotas?.parar();
      el?.removeEventListener('click', aoClicar);
      el?.removeEventListener('keydown', aoTeclar);
      el = null;
    },
    get jogo() { return jogo; },
    viragem
  };
})();
