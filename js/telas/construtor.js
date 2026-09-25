'use strict';
/* Desafio M7 — Construtor de neutralização.
   Monta a equação em etapas: H⁺ ionizáveis, OH⁻, coeficientes, fórmula e nome do sal.
   Modo sorteio (5 reações, vale pontos) ou treino (você escolhe o ácido e a base). */
SIAB.desafios.construtor = (() => {
  const REACOES = 5;
  let el = null, jogo = null;
  const F = () => SIAB.funcoes;

  function reacaoPara(acido, base, preferirParcial) {
    const parciais = F().parciais(acido, base);
    if (preferirParcial && parciais.length) return SIAB.embaralhar(parciais)[0];
    return F().total(acido, base);
  }

  function sortearPar() {
    const acido = SIAB.embaralhar(SIAB.acidos)[0];
    const base = SIAB.embaralhar(SIAB.bases)[0];
    return { acido, base, reacao: reacaoPara(acido, base, Math.random() < .25) };
  }

  function novaPartida(modo = 'sorteio') {
    jogo = { modo, rodada: 0, pontos: 0, historico: [], etapa: 0, feedback: null, fim: false, par: modo === 'sorteio' ? sortearPar() : null };
    if (jogo.par) prepararOpcoes();
    render();
  }

  // Alternativas erradas plausíveis para a fórmula e o nome do sal.
  function formulasErradas() {
    const { acido, base, reacao } = jogo.par;
    const g = F().mdc(acido.h, base.oh);
    const nC = acido.h / g, nA = base.oh / g;
    const sub = F().indice;
    const candidatos = [
      F().parte(base.cation, nA) + F().parte(acido.anion, nC),
      base.cation.formula + sub(nC) + acido.anion.formula + sub(nA),
      base.cation.formula + acido.anion.formula,
      F().total(acido, base).sal,
      F().parte(base.cation, 2) + F().parte(acido.anion, 1),
      F().parte(base.cation, 1) + F().parte(acido.anion, 2),
      F().parte(base.cation, 3) + F().parte(acido.anion, 2)
    ];
    return [...new Set(candidatos)].filter(x => x !== reacao.sal).slice(0, 2);
  }
  function nomesErrados() {
    const { base, reacao } = jogo.par;
    const certo = reacao.nomeSal;
    const trocas = [[/ato\b/, 'ito'], [/ito\b/, 'ato'], [/eto\b/, 'ato']];
    const candidatos = [];
    for (const [de, para] of trocas) if (de.test(certo)) candidatos.push(certo.replace(de, para));
    const outra = SIAB.embaralhar(SIAB.bases.filter(b => b.cation.nome !== base.cation.nome))[0];
    candidatos.push(certo.replace(` de ${base.cation.nome}`, ` de ${outra.cation.nome}`));
    candidatos.push(`${certo.split(' de ')[0].replace(/(ato|ito|eto)\b/, 'ídrico')} de ${base.cation.nome}`);
    return [...new Set(candidatos)].filter(x => x !== certo).slice(0, 2);
  }

  function prepararOpcoes() {
    jogo.opcoesFormula = SIAB.embaralhar([jogo.par.reacao.sal, ...formulasErradas()]);
    jogo.opcoesNome = SIAB.embaralhar([jogo.par.reacao.nomeSal, ...nomesErrados()]);
  }

  const ETAPAS = ['h', 'oh', 'coef', 'formula', 'nome'];

  function corrigir(valor) {
    const { acido, base, reacao } = jogo.par;
    const etapa = ETAPAS[jogo.etapa];
    let certo = false, esperado = '';
    if (etapa === 'h') { certo = Number(valor) === acido.h; esperado = `${acido.h} H⁺ ionizáve${acido.h === 1 ? 'l' : 'is'}`; }
    if (etapa === 'oh') { certo = Number(valor) === base.oh; esperado = `${base.oh} OH⁻`; }
    if (etapa === 'coef') {
      certo = valor.acido === reacao.coefAcido && valor.base === reacao.coefBase && valor.agua === reacao.agua;
      esperado = reacao.equacao;
    }
    if (etapa === 'formula') { certo = valor === reacao.sal; esperado = reacao.sal; }
    if (etapa === 'nome') { certo = valor === reacao.nomeSal; esperado = reacao.nomeSal; }
    if (certo && jogo.modo === 'sorteio') jogo.pontos += 4;
    jogo.feedback = { certo, esperado };
    render();
    el.querySelector('#construtor-feedback')?.focus();
  }

  function continuar() {
    jogo.feedback = null;
    jogo.etapa++;
    if (jogo.etapa < ETAPAS.length) { render(); el.querySelector('h2[tabindex]')?.focus(); return; }
    const { acido, base, reacao } = jogo.par;
    jogo.historico.push([`${acido.formula} + ${base.formula}`, `${reacao.equacao} · ${reacao.nomeSal}`]);
    jogo.concluida = true;
    render();
    el.querySelector('#construtor-final')?.focus();
  }

  function proximaReacao() {
    jogo.rodada++;
    jogo.etapa = 0;
    jogo.concluida = false;
    if (jogo.modo === 'sorteio' && jogo.rodada >= REACOES) {
      jogo.fim = true;
      jogo.recorde = SIAB.fimDePartida('construtor', jogo.pontos, jogo.historico);
      render();
      el.querySelector('h2[tabindex]')?.focus();
      return;
    }
    jogo.par = jogo.modo === 'sorteio' ? sortearPar() : null;
    if (jogo.par) prepararOpcoes();
    render();
    el.querySelector('h2[tabindex]')?.focus();
  }

  function escolherPar() {
    const idA = el.querySelector('input[name="treino-acido"]:checked')?.value;
    const idB = el.querySelector('input[name="treino-base"]:checked')?.value;
    const parcial = el.querySelector('#treino-parcial')?.checked;
    const erro = el.querySelector('#construtor-erro');
    if (!idA || !idB) { erro.textContent = 'Escolha um ácido e uma base.'; erro.hidden = false; return; }
    const acido = SIAB.acidos.find(x => x.id === idA), base = SIAB.bases.find(x => x.id === idB);
    if (parcial && !F().parciais(acido, base).length) { erro.textContent = 'Esse par não tem neutralização parcial com os sais do ensino médio. Tente um ácido com 2 ou 3 H⁺ e uma base com 1 OH⁻, ou o contrário.'; erro.hidden = false; return; }
    jogo.par = { acido, base, reacao: reacaoPara(acido, base, parcial) };
    prepararOpcoes();
    render();
    el.querySelector('h2[tabindex]')?.focus();
  }

  function corpoEtapa() {
    const { acido, base, reacao } = jogo.par;
    const etapa = ETAPAS[jogo.etapa];
    const bloqueado = jogo.feedback ? 'disabled' : '';
    const botoes = (valores, attr) => `<div class="atributos">${valores.map(v => `<button type="button" class="secondary-btn" data-${attr}="${SIAB.escape(String(v))}" ${bloqueado}>${SIAB.escape(String(v))}</button>`).join('')}</div>`;
    if (etapa === 'h') return `<h2 tabindex="-1">Quantos H⁺ ionizáveis tem o ${SIAB.escape(acido.formula)} (${SIAB.escape(acido.nome)})?</h2>${botoes([1, 2, 3], 'resposta')}`;
    if (etapa === 'oh') return `<h2 tabindex="-1">Quantos OH⁻ tem o ${SIAB.escape(base.formula)} (${SIAB.escape(base.nome)})?</h2>${botoes([1, 2, 3], 'resposta')}`;
    if (etapa === 'coef') {
      const tipo = reacao.tipo === 'parcial' ? ' (neutralização parcial: forma um sal com H ou OH restante)' : '';
      return `<h2 tabindex="-1">Complete os coeficientes${tipo}</h2>
        <div class="coeficientes"><label><span class="sr-only">Coeficiente do ${SIAB.escape(acido.formula)}</span><input id="coef-acido" type="number" min="1" max="9" inputmode="numeric" ${bloqueado}></label> ${SIAB.escape(acido.formula)} + <label><span class="sr-only">Coeficiente do ${SIAB.escape(base.formula)}</span><input id="coef-base" type="number" min="1" max="9" inputmode="numeric" ${bloqueado}></label> ${SIAB.escape(base.formula)} → 1 sal + <label><span class="sr-only">Coeficiente da água</span><input id="coef-agua" type="number" min="1" max="9" inputmode="numeric" ${bloqueado}></label> H₂O</div>
        <p class="field-hint">Cada H⁺ que reage com um OH⁻ forma uma molécula de água.</p>
        <div class="jogo-acoes"><button type="button" class="primary-btn" data-acao="coef" ${bloqueado}>Conferir coeficientes</button></div>`;
    }
    if (etapa === 'formula') return `<h2 tabindex="-1">Qual é a fórmula do sal formado?</h2>${botoes(jogo.opcoesFormula, 'resposta')}`;
    return `<h2 tabindex="-1">Qual é o nome do sal ${SIAB.escape(reacao.sal)}?</h2>${botoes(jogo.opcoesNome, 'resposta')}
      <p class="field-hint">Ânions: -ídrico → -eto; -ico → -ato; -oso → -ito.</p>`;
  }

  function renderTreinoEscolha() {
    const lista = (nome, itens, campo) => itens.map(x => `<label class="chip"><input type="radio" name="${nome}" value="${x.id}"><span>${SIAB.escape(x.formula)} <small>${x[campo]}</small></span></label>`).join('');
    return `<h2 tabindex="-1">Escolha um ácido e uma base</h2>
      <fieldset class="chips"><legend>Ácido</legend><div class="chip-list">${lista('treino-acido', SIAB.acidos, 'h')}</div></fieldset>
      <fieldset class="chips"><legend>Base</legend><div class="chip-list">${lista('treino-base', SIAB.bases, 'oh')}</div></fieldset>
      <label class="check-row"><input type="checkbox" id="treino-parcial">Neutralização parcial (hidrogenossal ou hidroxissal)</label>
      <p id="construtor-erro" class="form-error" role="alert" hidden></p>
      <div class="jogo-acoes"><button type="button" class="primary-btn" data-acao="montar">Montar a equação</button></div>
      <p class="field-hint">Os números pequenos são os H⁺ ionizáveis de cada ácido e os OH⁻ de cada base.</p>`;
  }

  function render() {
    const cab = SIAB.cabecalhoJogo('construtor', 'Monte equações de neutralização e dê nome aos sais.');
    const modos = `<div class="segmented modo-construtor" role="group" aria-label="Modo de jogo">
      <button type="button" class="secondary-btn" data-modo="sorteio" aria-pressed="${jogo.modo === 'sorteio'}">Sorteio (vale pontos)</button>
      <button type="button" class="secondary-btn" data-modo="treino" aria-pressed="${jogo.modo === 'treino'}">Treino (você escolhe)</button></div>`;
    if (jogo.fim) {
      el.innerHTML = `${cab}${modos}<section class="jogo-painel fim"><h2 tabindex="-1">${jogo.pontos} de ${REACOES * 20} pontos${jogo.recorde ? ' · novo recorde!' : ''}</h2>
        <dl class="resumo-missao">${jogo.historico.map(([a, b]) => `<div><dt>${SIAB.escape(a)}</dt><dd>${SIAB.escape(b)}</dd></div>`).join('')}</dl>
        <div class="jogo-acoes"><button type="button" class="primary-btn" data-modo="sorteio">Jogar de novo</button><a class="secondary-btn" href="#/desafios">Outros desafios</a></div></section>`;
      return;
    }
    if (!jogo.par) {
      el.innerHTML = `${cab}${modos}<section class="jogo-painel">${renderTreinoEscolha()}</section>`;
      return;
    }
    const { acido, base, reacao } = jogo.par;
    const topo = jogo.modo === 'sorteio'
      ? `<p class="eyebrow">REAÇÃO ${jogo.rodada + 1} DE ${REACOES} · ETAPA ${Math.min(jogo.etapa + 1, 5)} DE 5 · ${jogo.pontos} PONTOS</p>`
      : `<p class="eyebrow">TREINO · ETAPA ${Math.min(jogo.etapa + 1, 5)} DE 5</p>`;
    const cartas = `<div class="construtor-cartas"><div class="carta acido"><p class="carta-funcao">Ácido</p><p class="carta-formula">${SIAB.escape(acido.formula)}</p><p class="carta-nome">${SIAB.escape(acido.nome)}</p></div><span class="versus" aria-hidden="true">+</span><div class="carta base"><p class="carta-funcao">Base</p><p class="carta-formula">${SIAB.escape(base.formula)}</p><p class="carta-nome">${SIAB.escape(base.nome)}</p></div></div>`;
    if (jogo.concluida) {
      el.innerHTML = `${cab}${modos}<section class="jogo-painel">${topo}${cartas}
        <div id="construtor-final" class="equacao-final" tabindex="-1"><p class="eq-formula">${SIAB.escape(reacao.equacao)}</p><p>${SIAB.escape(acido.nome)} + ${SIAB.escape(base.nome)} → ${SIAB.escape(reacao.nomeSal)} + água</p></div>
        <div class="jogo-acoes"><button type="button" class="primary-btn" data-acao="proxima">${jogo.modo === 'sorteio' ? (jogo.rodada === REACOES - 1 ? 'Ver resultado' : 'Próxima reação') : 'Escolher outro par'}</button></div></section>`;
      return;
    }
    const fb = jogo.feedback
      ? `<div id="construtor-feedback" class="quiz-feedback ${jogo.feedback.certo ? 'certo' : 'errado'}" tabindex="-1" role="status"><strong>${jogo.feedback.certo ? '✓ Correto!' : '✗ Resposta:'} ${SIAB.escape(jogo.feedback.esperado)}</strong></div>
        <div class="jogo-acoes"><button type="button" class="primary-btn" data-acao="continuar">Continuar</button></div>`
      : '';
    el.innerHTML = `${cab}${modos}<section class="jogo-painel">${topo}${cartas}${corpoEtapa()}${fb}</section>`;
  }

  function aoClicar(evento) {
    const botao = evento.target.closest('button');
    if (!botao || !el) return;
    if (botao.dataset.modo) { novaPartida(botao.dataset.modo); el.querySelector('h2[tabindex]')?.focus(); return; }
    if (botao.dataset.resposta !== undefined) corrigir(botao.dataset.resposta);
    if (botao.dataset.acao === 'coef') {
      const ler = id => Number(el.querySelector(id).value);
      corrigir({ acido: ler('#coef-acido'), base: ler('#coef-base'), agua: ler('#coef-agua') });
    }
    if (botao.dataset.acao === 'continuar') continuar();
    if (botao.dataset.acao === 'proxima') proximaReacao();
    if (botao.dataset.acao === 'montar') escolherPar();
  }

  return {
    titulo: 'Construtor de neutralização', conteudo: 'Equações e sais', resumo: 'Monte a equação de neutralização, a fórmula e o nome do sal.',
    montar(elemento) {
      el = elemento;
      el.addEventListener('click', aoClicar);
      novaPartida('sorteio');
    },
    desmontar() {
      el?.removeEventListener('click', aoClicar);
      el = null;
    },
    get jogo() { return jogo; }
  };
})();
