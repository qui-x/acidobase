'use strict';
/* Desafio M3 — Régua do pH: posicione amostras na escala e descubra
   quantas vezes a [H₃O⁺] de uma é maior que a de outra (escala logarítmica). */
SIAB.desafios.regua = (() => {
  const POOL = [
    { solution: 'hcl', concentration: .1, rotulo: 'HCl 0,1 mol/L' }, { solution: 'lemon' }, { solution: 'vinegar' },
    { solution: 'cola' }, { solution: 'orange' }, { solution: 'tomato' }, { solution: 'yogurt' }, { solution: 'coffee' },
    { solution: 'cleanRain' }, { solution: 'acidRain' }, { solution: 'milk' }, { solution: 'water' }, { solution: 'bicarbonate' },
    { solution: 'soap' }, { solution: 'ammonia', concentration: .01, rotulo: 'Amônia 0,01 mol/L' },
    { solution: 'na2co3', concentration: .1, rotulo: 'Na₂CO₃ 0,1 mol/L' }, { solution: 'naoh', concentration: .01, rotulo: 'NaOH 0,01 mol/L' }
  ];
  let el = null, jogo = null;

  function novaRodada() {
    const comPH = POOL.map(spec => {
      const tube = { id: 960, name: 'régua', ...SIAB.TUBE_DEFAULTS, titrant: 'water', indicator: 'none', additions: [], concentration: .01, ...spec };
      return { spec, nome: spec.rotulo || SIAB.solutions[spec.solution].name, pH: SIAB.chem.solve(tube).pH };
    });
    // Seis amostras com pH separados por pelo menos 0,8.
    const escolhidas = [];
    for (const x of SIAB.embaralhar(comPH)) {
      if (escolhidas.every(y => Math.abs(y.pH - x.pH) >= .8)) escolhidas.push(x);
      if (escolhidas.length === 6) break;
    }
    jogo = { amostras: escolhidas.map(x => ({ ...x, palpite: 7 })), revelado: false, pontos: 0, a: 0, b: 1 };
    render();
  }

  function revelar() {
    el.querySelectorAll('[data-palpite]').forEach(input => { jogo.amostras[Number(input.dataset.palpite)].palpite = Number(input.value); });
    let soma = 0;
    jogo.amostras.forEach(x => {
      x.erro = Math.abs(x.palpite - x.pH);
      x.pontos = Math.max(0, Math.round(20 - 5 * x.erro));
      soma += x.pontos;
    });
    jogo.pontos = Math.round(soma / 1.2);
    jogo.revelado = true;
    jogo.recorde = SIAB.fimDePartida('regua', jogo.pontos, jogo.amostras.map(x => [x.nome, `palpite ${SIAB.format(x.palpite, 1)} · pH ${SIAB.format(x.pH, 1)}`]));
    render();
    el.querySelector('#regua-resultado')?.focus();
  }

  // Uma linha por amostra: círculo vazado no palpite, cheio no pH calculado.
  function reguaSVG() {
    const x = v => 34 + (v / 14) * 316;
    const grad = [0, 2, 4, 6, 7, 8, 10, 12, 14].map(v => `<stop offset="${v / 14}" stop-color="rgb(${SIAB.chem.color('universal', Math.max(1, v)).rgb.join(',')})"/>`).join('');
    const numeros = [0, 2, 4, 6, 7, 8, 10, 12, 14].map(v => `<text x="${x(v)}" y="12" text-anchor="middle" class="faixa-rotulo">${v}</text>`).join('');
    const linhas = jogo.amostras.map((a, i) => {
      const y = 38 + i * 22;
      return `<text x="4" y="${y + 4}" class="regua-num">${i + 1}</text>
        <path d="M${x(0)} ${y}H${x(14)}" class="grafico-grade"/>
        <path d="M${x(a.palpite)} ${y}H${x(a.pH)}" class="regua-erro"/>
        <circle cx="${x(a.palpite)}" cy="${y}" r="6" class="regua-palpite"/>
        <circle cx="${x(a.pH)}" cy="${y}" r="6" class="regua-real"/>`;
    }).join('');
    const altura = 38 + jogo.amostras.length * 22;
    return `<svg class="regua-jogo" viewBox="0 0 360 ${altura}" role="img" aria-label="Régua de pH: em cada linha, o círculo cheio é o pH calculado e o vazado é o seu palpite.">
      <defs><linearGradient id="regua-jogo-grad">${grad}</linearGradient></defs>
      ${numeros}<rect x="${x(0)}" y="18" width="${x(14) - x(0)}" height="6" rx="3" fill="url(#regua-jogo-grad)"/>${linhas}</svg>
      <p class="field-hint">Em cada linha: ● pH calculado · ○ seu palpite.</p>`;
  }

  function comparacaoHTML() {
    const A = jogo.amostras[jogo.a], B = jogo.amostras[jogo.b];
    const [acida, outra] = A.pH <= B.pH ? [A, B] : [B, A];
    const delta = outra.pH - acida.pH;
    const vezes = 10 ** delta;
    const blocos = Math.floor(delta + 1e-9);
    const resto = delta - blocos;
    const vezesTexto = vezes >= 1000 ? Math.round(vezes).toLocaleString('pt-BR') : SIAB.format(vezes, vezes < 10 ? 1 : 0);
    const escolhas = (nome, marcado) => jogo.amostras.map((x, i) => `<label class="chip"><input type="radio" name="${nome}" value="${i}" ${i === marcado ? 'checked' : ''}><span>${i + 1}. ${SIAB.escape(x.nome)}</span></label>`).join('');
    return `<section class="comparacao" aria-labelledby="comparacao-titulo">
      <h2 id="comparacao-titulo">Quantas vezes mais ácida?</h2>
      <fieldset class="chips"><legend>Amostra A</legend><div class="chip-list">${escolhas('regua-a', jogo.a)}</div></fieldset>
      <fieldset class="chips"><legend>Amostra B</legend><div class="chip-list">${escolhas('regua-b', jogo.b)}</div></fieldset>
      <p class="comparacao-resultado" aria-live="polite">${jogo.a === jogo.b ? 'Escolha duas amostras diferentes.' : `<strong>${SIAB.escape(acida.nome)}</strong> (pH ${SIAB.format(acida.pH, 1)}) tem [H₃O⁺] cerca de <strong>${vezesTexto} vezes</strong> maior que <strong>${SIAB.escape(outra.nome)}</strong> (pH ${SIAB.format(outra.pH, 1)}): 10<sup>${SIAB.format(delta, 1)}</sup>.`}</p>
      ${jogo.a === jogo.b ? '' : `<div class="potencias" aria-hidden="true">${Array.from({ length: blocos }, () => '<span>×10</span>').join('')}${resto > .05 ? `<span class="parcial">×${SIAB.format(10 ** resto, 1)}</span>` : ''}</div>
      <p class="field-hint">Cada unidade de pH vale 10 vezes em [H₃O⁺]. pOH = 14 − pH a 25 °C: ${SIAB.escape(A.nome)} tem pOH ${SIAB.format(14 - A.pH, 1)}; ${SIAB.escape(B.nome)}, pOH ${SIAB.format(14 - B.pH, 1)}.</p>`}
    </section>`;
  }

  function render() {
    const cab = SIAB.cabecalhoJogo('regua', 'Arraste cada marcador para onde você acha que a amostra fica na escala de pH.');
    if (!jogo.revelado) {
      el.innerHTML = `${cab}<section class="jogo-painel regua"><h2 tabindex="-1">Onde fica cada amostra?</h2>
        <ol class="regua-lista">${jogo.amostras.map((a, i) => `<li><label class="field">${i + 1}. ${SIAB.escape(a.nome)} · pH <output id="regua-out-${i}">${SIAB.format(a.palpite, 1)}</output>
          <input type="range" min="0" max="14" step="0.5" value="${a.palpite}" data-palpite="${i}" aria-valuetext="pH ${SIAB.format(a.palpite, 1)}"></label></li>`).join('')}</ol>
        <div class="jogo-acoes"><button type="button" class="primary-btn" data-acao="revelar">Revelar posições</button></div></section>`;
      return;
    }
    el.innerHTML = `${cab}<section class="jogo-painel regua">
      <h2 id="regua-resultado" tabindex="-1">${jogo.pontos} de 100 pontos${jogo.recorde ? ' · novo recorde!' : ''}</h2>
      ${reguaSVG()}
      <table><caption class="sr-only">Seus palpites e os valores calculados</caption><thead><tr><th>Amostra</th><th>Palpite</th><th>pH</th><th>Pontos</th></tr></thead>
      <tbody>${jogo.amostras.map((a, i) => `<tr><td>${i + 1}. ${SIAB.escape(a.nome)}</td><td>${SIAB.format(a.palpite, 1)}</td><td>${SIAB.format(a.pH, 1)}</td><td>${a.pontos}</td></tr>`).join('')}</tbody></table>
      ${comparacaoHTML()}
      <div class="jogo-acoes"><button type="button" class="primary-btn" data-acao="nova">Nova rodada</button><a class="secondary-btn" href="#/desafios">Outros desafios</a></div>
    </section>`;
  }

  function aoMudar(evento) {
    const alvo = evento.target;
    if (alvo.dataset.palpite !== undefined) {
      const i = Number(alvo.dataset.palpite);
      jogo.amostras[i].palpite = Number(alvo.value);
      el.querySelector(`#regua-out-${i}`).textContent = SIAB.format(Number(alvo.value), 1);
      alvo.setAttribute('aria-valuetext', `pH ${SIAB.format(Number(alvo.value), 1)}`);
    }
    if (alvo.name === 'regua-a' || alvo.name === 'regua-b') {
      jogo[alvo.name === 'regua-a' ? 'a' : 'b'] = Number(alvo.value);
      const foco = alvo.name + ':' + alvo.value;
      render();
      const [nome, valor] = foco.split(':');
      el.querySelector(`input[name="${nome}"][value="${valor}"]`)?.focus();
    }
  }
  function aoClicar(evento) {
    const botao = evento.target.closest('button');
    if (!botao) return;
    if (botao.dataset.acao === 'revelar') revelar();
    if (botao.dataset.acao === 'nova') { novaRodada(); el.querySelector('h2[tabindex]')?.focus(); }
  }

  return {
    titulo: 'Régua do pH', conteudo: 'Escala logarítmica', resumo: 'Posicione amostras na escala e compare: cada unidade de pH vale 10 vezes.',
    montar(elemento) {
      el = elemento;
      el.addEventListener('input', aoMudar);
      el.addEventListener('change', aoMudar);
      el.addEventListener('click', aoClicar);
      novaRodada();
    },
    desmontar() {
      el?.removeEventListener('input', aoMudar);
      el?.removeEventListener('change', aoMudar);
      el?.removeEventListener('click', aoClicar);
      el = null;
    },
    get jogo() { return jogo; }
  };
})();
