'use strict';
/* Desafio M2 — Amostra misteriosa: o detetive dos indicadores.
   Três amostras por partida. Em cada uma, até três testes com indicadores;
   cada cor limita o pH a uma faixa, e a interseção das faixas é a pista. */
SIAB.desafios.detetive = (() => {
  const INDICADORES = ['methyl', 'litmus', 'btb', 'phenol', 'cabbage'];
  const AMOSTRAS = [
    { solution: 'hcl', concentration: .1 }, { solution: 'hcl', concentration: .001 },
    { solution: 'lemon' }, { solution: 'vinegar', dilution: 10 }, { solution: 'acetic', concentration: .01 },
    { solution: 'coffee' }, { solution: 'nh4cl', concentration: .1 }, { solution: 'cleanRain' },
    { solution: 'milk' }, { solution: 'water' }, { solution: 'bicarbonate' },
    { solution: 'ch3coona', concentration: .1 }, { solution: 'soap' }, { solution: 'ammonia', concentration: .01 },
    { solution: 'na2co3', concentration: .1 }, { solution: 'naoh', concentration: .01 }
  ];
  const RODADAS = 3, TESTES = 3;
  let el = null, jogo = null;

  const tuboDe = (spec, indicator = 'none', id = 900) => ({
    id, name: 'Amostra misteriosa', ...SIAB.TUBE_DEFAULTS, titrant: 'water', concentration: .01, dilution: 1,
    ...spec, indicator, additions: []
  });

  function novaPartida() {
    // Sorteia amostras de faixas diferentes de pH (ácida, perto do neutro, básica).
    const faixas = [a => a < 4.5, a => a >= 4.5 && a <= 8, a => a > 8];
    const comPH = AMOSTRAS.map(spec => ({ spec, pH: SIAB.chem.solve(tuboDe(spec)).pH }));
    const escolhidas = SIAB.embaralhar(faixas).map(f => SIAB.embaralhar(comPH.filter(x => f(x.pH)))[0]);
    jogo = { amostras: escolhidas, rodada: 0, testes: [], respondida: null, pontos: 0, historico: [] };
    render();
  }

  function intersecao() {
    return jogo.testes.reduce(([a, b], t) => [Math.max(a, t.faixa[0]), Math.min(b, t.faixa[1])], [0, 14]);
  }

  function testar(indicador) {
    const amostra = jogo.amostras[jogo.rodada];
    const pH = amostra.pH;
    const cor = SIAB.chem.color(indicador, pH).name;
    const faixa = SIAB.chem.colorRange(indicador, cor);
    jogo.testes.push({ indicador, cor, faixa });
    render();
    const [a, b] = intersecao();
    SIAB.announce(`${SIAB.indicators[indicador].name}: ${cor}. pH entre ${SIAB.format(faixa[0], 1)} e ${SIAB.format(faixa[1], 1)}. Faixa possível agora: ${SIAB.format(a, 1)} a ${SIAB.format(b, 1)}.`);
    el.querySelector('#detetive-resultados')?.focus();
  }

  function responder() {
    const palpite = Number(el.querySelector('#detetive-palpite').value);
    // O palpite tem uma casa decimal; compara com o pH mostrado (uma casa).
    const real = jogo.amostras[jogo.rodada].pH;
    const erro = Math.abs(palpite - Math.round(real * 10) / 10);
    const pontos = Math.max(0, Math.round(100 - 25 * erro));
    jogo.respondida = { palpite, real, erro, pontos };
    jogo.pontos += pontos;
    const s = SIAB.solutions[jogo.amostras[jogo.rodada].spec.solution];
    jogo.historico.push([`Amostra ${jogo.rodada + 1}: ${s.name}`, `palpite ${SIAB.format(palpite, 1)} · pH ${SIAB.format(real, 1)} · ${pontos} pontos · ${jogo.testes.length} testes`]);
    render();
    el.querySelector('#detetive-feedback')?.focus();
  }

  function proxima() {
    jogo.rodada++;
    jogo.testes = [];
    jogo.respondida = null;
    if (jogo.rodada >= RODADAS) {
      jogo.recorde = SIAB.fimDePartida('detetive', jogo.pontos, jogo.historico);
    }
    render();
    el.querySelector('h2[tabindex]')?.focus();
  }

  function reguaFaixas() {
    const x = v => 10 + (v / 14) * 300;
    const [a, b] = intersecao();
    const linhas = jogo.testes.map((t, i) => {
      const y = 44 + i * 16;
      return `<rect x="${x(t.faixa[0])}" y="${y}" width="${Math.max(2, x(t.faixa[1]) - x(t.faixa[0]))}" height="10" rx="3" class="faixa-teste"/><text x="${x(t.faixa[1]) + 4 > 290 ? x(t.faixa[0]) - 4 : x(t.faixa[1]) + 4}" y="${y + 9}" text-anchor="${x(t.faixa[1]) + 4 > 290 ? 'end' : 'start'}" class="faixa-rotulo">${SIAB.escape(SIAB.indicators[t.indicador].short)}</text>`;
    }).join('');
    const possivel = a <= b ? `<rect x="${x(a)}" y="14" width="${Math.max(3, x(b) - x(a))}" height="18" rx="4" class="faixa-possivel"/>` : '';
    const marcas = [0, 2, 4, 6, 7, 8, 10, 12, 14].map(v => `<text x="${x(v)}" y="10" text-anchor="middle" class="faixa-rotulo">${v}</text>`).join('');
    const altura = 50 + jogo.testes.length * 16;
    return `<svg class="detetive-regua" viewBox="0 0 320 ${altura}" role="img" aria-label="Faixa possível de pH: de ${SIAB.format(a, 1)} a ${SIAB.format(b, 1)}.">
      ${marcas}<rect x="10" y="14" width="300" height="18" rx="4" class="faixa-fundo"/>${possivel}${linhas}</svg>`;
  }

  function render() {
    const cab = SIAB.cabecalhoJogo('detetive', 'Descubra o pH de cada amostra com no máximo três testes de indicador.');
    if (jogo.rodada >= RODADAS) {
      el.innerHTML = `${cab}<section class="jogo-painel fim"><h2 tabindex="-1">Fim da investigação: ${jogo.pontos} de ${RODADAS * 100} pontos${jogo.recorde ? ' · novo recorde!' : ''}</h2>
        <dl class="resumo-missao">${jogo.historico.map(([a, b]) => `<div><dt>${SIAB.escape(a)}</dt><dd>${SIAB.escape(b)}</dd></div>`).join('')}</dl>
        <p class="field-hint">Resultado salvo no caderno.</p>
        <div class="jogo-acoes"><button type="button" class="primary-btn" data-acao="nova">Jogar de novo</button><a class="secondary-btn" href="#/desafios">Outros desafios</a></div></section>`;
      return;
    }
    const amostra = jogo.amostras[jogo.rodada];
    const restantes = TESTES - jogo.testes.length;
    const [a, b] = intersecao();
    const usados = new Set(jogo.testes.map(t => t.indicador));
    const botoes = INDICADORES.map(id => {
      const ind = SIAB.indicators[id];
      const faixa = ind.low ? ` (${SIAB.format(ind.low, 1)}–${SIAB.format(ind.high, 1)})` : ' (carta de 1 a 14)';
      return `<button type="button" class="secondary-btn" data-testar="${id}" ${usados.has(id) || restantes === 0 || jogo.respondida ? 'disabled' : ''}>${SIAB.escape(ind.short)}${faixa}</button>`;
    }).join('');
    const resultados = jogo.testes.map(t => {
      const cor = SIAB.chem.color(t.indicador, amostra.pH);
      return `<li><span class="mini-tube" style="--cor:rgb(${cor.rgb.join(',')});--nivel:.6" aria-hidden="true"></span><span><strong>${SIAB.escape(SIAB.indicators[t.indicador].name)}: ${SIAB.escape(t.cor)}</strong><small>pH entre ${SIAB.format(t.faixa[0], 1)} e ${SIAB.format(t.faixa[1], 1)}</small></span></li>`;
    }).join('');
    const palpiteInicial = SIAB.format((a + b) / 2, 1).replace(',', '.');
    const feedback = jogo.respondida
      ? `<div id="detetive-feedback" class="quiz-feedback ${jogo.respondida.erro <= .5 ? 'certo' : 'errado'}" tabindex="-1" role="status">
          <strong>pH real: ${SIAB.format(jogo.respondida.real, 1)} · seu palpite: ${SIAB.format(jogo.respondida.palpite, 1)} → ${jogo.respondida.pontos} pontos</strong>
          <p>A amostra era: ${SIAB.escape(SIAB.solutions[amostra.spec.solution].name)}${amostra.spec.concentration && SIAB.solutions[amostra.spec.solution].kind !== 'sample' ? ` ${SIAB.format(amostra.spec.concentration, 3)} mol/L` : ''}.</p>
        </div>
        <div class="jogo-acoes"><button type="button" class="primary-btn" data-acao="proxima">${jogo.rodada === RODADAS - 1 ? 'Ver resultado' : 'Próxima amostra'}</button></div>`
      : `<label class="field palpite">Seu palpite de pH: <output id="detetive-valor">${SIAB.format(Number(palpiteInicial), 1)}</output>
          <input id="detetive-palpite" type="range" min="0" max="14" step="0.1" value="${palpiteInicial}"></label>
        <div class="jogo-acoes"><button type="button" class="primary-btn" data-acao="responder">Responder</button></div>`;
    el.innerHTML = `${cab}
      <section class="jogo-painel detetive">
        <h2 tabindex="-1">Amostra ${jogo.rodada + 1} de ${RODADAS} · ${restantes} ${restantes === 1 ? 'teste restante' : 'testes restantes'}</h2>
        <div class="detetive-grade">
          <div class="detetive-tubo">${SIAB.tubeSVG(tuboDe(amostra.spec), 'detetive', true)}<p class="small">Sem indicador: ${SIAB.escape(SIAB.chem.liquid(tuboDe(amostra.spec)).name)}</p></div>
          <div>
            <h3>Testar com</h3>
            <div class="detetive-botoes">${botoes}</div>
            <h3>Pistas</h3>
            <ul id="detetive-resultados" class="detetive-resultados" tabindex="-1">${resultados || '<li class="field-hint">Nenhum teste ainda.</li>'}</ul>
            ${reguaFaixas()}
            <p class="faixa-texto">${a <= b ? `Faixa possível: pH de <strong>${SIAB.format(a, 1)}</strong> a <strong>${SIAB.format(b, 1)}</strong>.` : 'As pistas não se cruzam. Confira as faixas.'}</p>
            ${feedback}
          </div>
        </div>
      </section>`;
    const palpite = el.querySelector('#detetive-palpite');
    palpite?.addEventListener('input', () => { el.querySelector('#detetive-valor').textContent = SIAB.format(Number(palpite.value), 1); });
  }

  function aoClicar(evento) {
    const botao = evento.target.closest('button');
    if (!botao) return;
    if (botao.dataset.testar) testar(botao.dataset.testar);
    if (botao.dataset.acao === 'responder') responder();
    if (botao.dataset.acao === 'proxima') proxima();
    if (botao.dataset.acao === 'nova') { novaPartida(); el.querySelector('h2[tabindex]')?.focus(); }
  }

  return {
    titulo: 'Amostra misteriosa', conteudo: 'Indicadores', resumo: 'Use as faixas de viragem para descobrir o pH de amostras escondidas.',
    montar(elemento) {
      el = elemento;
      el.addEventListener('click', aoClicar);
      novaPartida();
    },
    desmontar() {
      el?.removeEventListener('click', aoClicar);
      el = null;
    },
    get jogo() { return jogo; }
  };
})();
