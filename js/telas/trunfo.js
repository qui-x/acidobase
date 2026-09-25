'use strict';
/* Desafio M8 — Super Trunfo dos ácidos e bases.
   Três modos: duelo de atributos, classificar e jogo da memória.
   Os atributos vêm de js/data/funcoes.js (regras usuais do ensino médio). */
SIAB.desafios.trunfo = (() => {
  const FORCA = { forte: 3, moderado: 2, fraco: 1, fraca: 1 };
  const ATRIBUTOS = [
    { id: 'forca', rotulo: 'Força', formatar: c => `${c.forcaTexto} (${c.forca})` },
    { id: 'ions', rotulo: 'H⁺ ou OH⁻ liberados', formatar: c => String(c.ions) },
    { id: 'massa', rotulo: 'Massa molar (g/mol)', formatar: c => SIAB.format(c.massa, 1) },
    { id: 'atomos', rotulo: 'Átomos na fórmula', formatar: c => String(c.atomos) }
  ];
  let el = null, modo = 'menu', jogo = null;

  function cartas() {
    const acidos = SIAB.acidos.map(a => ({
      id: a.id, formula: a.formula, nome: a.nome, funcao: 'Ácido', forcaTexto: a.forca, forca: FORCA[a.forca],
      ions: a.h, massa: SIAB.massaMolar(a.atomos), atomos: SIAB.contarAtomos(a.atomos),
      detalhe: `${a.tipo} · ${a.volatil ? 'volátil' : 'fixo'}`, tipo: a.tipo, uso: a.uso, origem: a
    }));
    const bases = SIAB.bases.map(b => ({
      id: b.id, formula: b.formula, nome: b.nome, funcao: 'Base', forcaTexto: b.forca, forca: FORCA[b.forca],
      ions: b.oh, massa: SIAB.massaMolar(b.atomos), atomos: SIAB.contarAtomos(b.atomos),
      detalhe: b.solubilidade, solubilidade: b.solubilidade, uso: b.uso, origem: b
    }));
    return [...acidos, ...bases];
  }

  function cartaHTML(c, { oculta = false, destaque = null } = {}) {
    if (oculta) return '<div class="carta oculta" aria-label="Carta do computador, virada para baixo"><span aria-hidden="true">?</span></div>';
    return `<div class="carta ${c.funcao === 'Ácido' ? 'acido' : 'base'}">
      <p class="carta-funcao">${c.funcao}</p>
      <p class="carta-formula">${SIAB.escape(c.formula)}</p>
      <p class="carta-nome">${SIAB.escape(c.nome)}</p>
      <dl>${ATRIBUTOS.map(a => `<div class="${destaque === a.id ? 'destaque' : ''}"><dt>${a.rotulo}</dt><dd>${SIAB.escape(a.formatar(c))}</dd></div>`).join('')}</dl>
      <p class="carta-uso">${SIAB.escape(c.detalhe)} · ${SIAB.escape(c.uso)}</p>
    </div>`;
  }

  /* ---------- Duelo ---------- */
  function novoDuelo() {
    const baralho = SIAB.embaralhar(cartas()).slice(0, 16);
    jogo = { tipo: 'duelo', jogador: baralho.slice(0, 8), cpu: baralho.slice(8), monte: [], vez: 'jogador', rodada: 1, vitorias: 0, revelado: null, fim: false };
    render();
  }

  // O computador escolhe o atributo em que sua carta está mais perto do máximo.
  function escolhaCPU(c) {
    const todas = cartas();
    const maximo = id => Math.max(...todas.map(x => x[id]));
    return ATRIBUTOS.reduce((melhor, a) => (c[a.id] / maximo(a.id) > c[melhor.id] / maximo(melhor.id) ? a : melhor)).id;
  }

  function jogarAtributo(id) {
    const cj = jogo.jogador[0], cc = jogo.cpu[0];
    const vj = cj[id], vc = cc[id];
    const vencedor = Math.abs(vj - vc) < 1e-9 ? 'empate' : vj > vc ? 'jogador' : 'cpu';
    jogo.revelado = { id, vencedor, cj, cc };
    jogo.jogador.shift();
    jogo.cpu.shift();
    if (vencedor === 'empate') {
      jogo.monte.push(cj, cc);
    } else {
      const ganho = [cj, cc, ...jogo.monte];
      jogo.monte = [];
      jogo[vencedor].push(...ganho);
      jogo.vez = vencedor;
      if (vencedor === 'jogador') jogo.vitorias++;
    }
    const acabou = !jogo.jogador.length || !jogo.cpu.length || jogo.rodada >= 12;
    if (acabou) {
      jogo.fim = true;
      const venceu = jogo.jogador.length > jogo.cpu.length;
      jogo.pontos = jogo.vitorias * 10 + (venceu ? 50 : 0);
      jogo.recorde = SIAB.fimDePartida('trunfo', jogo.pontos, [['Modo', 'Duelo'], ['Rodadas vencidas', String(jogo.vitorias)], ['Cartas no fim', `você ${jogo.jogador.length} × computador ${jogo.cpu.length}`]]);
    }
    render();
    el.querySelector('#trunfo-revelado')?.focus();
  }

  function proximaRodada() {
    jogo.rodada++;
    jogo.revelado = null;
    render();
    if (jogo.vez === 'cpu') {
      el.querySelector('#trunfo-status')?.focus();
    } else {
      el.querySelector('[data-atributo]')?.focus();
    }
  }

  function renderDuelo() {
    if (jogo.fim) {
      const venceu = jogo.jogador.length > jogo.cpu.length;
      const r = jogo.revelado;
      return `<section class="jogo-painel fim"><h2 id="trunfo-revelado" tabindex="-1">${venceu ? 'Você venceu o duelo!' : jogo.jogador.length === jogo.cpu.length ? 'Empate!' : 'O computador venceu desta vez.'} ${jogo.pontos} pontos${jogo.recorde ? ' · novo recorde!' : ''}</h2>
        ${r ? `<p>Última rodada: ${SIAB.escape(r.cj.formula)} × ${SIAB.escape(r.cc.formula)} em ${SIAB.escape(ATRIBUTOS.find(a => a.id === r.id).rotulo)}.</p>` : ''}
        <p>Cartas no fim: você ${jogo.jogador.length} × computador ${jogo.cpu.length}. Rodadas vencidas: ${jogo.vitorias}.</p>
        <div class="jogo-acoes"><button type="button" class="primary-btn" data-acao="duelo">Jogar de novo</button><button type="button" class="secondary-btn" data-acao="menu">Outro modo</button></div></section>`;
    }
    const placar = `<p class="placar">Rodada ${jogo.rodada} · suas cartas: <strong>${jogo.jogador.length}</strong> · computador: <strong>${jogo.cpu.length}</strong>${jogo.monte.length ? ` · monte de empate: ${jogo.monte.length}` : ''}</p>`;
    if (jogo.revelado) {
      const r = jogo.revelado, a = ATRIBUTOS.find(x => x.id === r.id);
      const texto = r.vencedor === 'empate' ? 'Empate! As cartas vão para o monte.' : r.vencedor === 'jogador' ? 'Você venceu a rodada!' : 'O computador venceu a rodada.';
      return `${placar}<h2 id="trunfo-revelado" tabindex="-1">${texto} ${SIAB.escape(a.rotulo)}: ${SIAB.escape(a.formatar(r.cj))} × ${SIAB.escape(a.formatar(r.cc))}</h2>
        <div class="duelo-mesa">${cartaHTML(r.cj, { destaque: r.id })}<span class="versus" aria-hidden="true">×</span>${cartaHTML(r.cc, { destaque: r.id })}</div>
        <div class="jogo-acoes"><button type="button" class="primary-btn" data-acao="proxima">Próxima rodada</button></div>`;
    }
    const minha = jogo.jogador[0];
    if (jogo.vez === 'cpu') {
      const id = escolhaCPU(jogo.cpu[0]);
      const a = ATRIBUTOS.find(x => x.id === id);
      return `${placar}<h2 id="trunfo-status" tabindex="-1">Vez do computador: ele escolheu “${SIAB.escape(a.rotulo)}”.</h2>
        <div class="duelo-mesa">${cartaHTML(minha, { destaque: id })}<span class="versus" aria-hidden="true">×</span>${cartaHTML(null, { oculta: true })}</div>
        <div class="jogo-acoes"><button type="button" class="primary-btn" data-atributo="${id}">Revelar cartas</button></div>`;
    }
    return `${placar}<h2 id="trunfo-status" tabindex="-1">Sua vez: escolha um atributo da sua carta.</h2>
      <div class="duelo-mesa">${cartaHTML(minha)}<span class="versus" aria-hidden="true">×</span>${cartaHTML(null, { oculta: true })}</div>
      <div class="atributos">${ATRIBUTOS.map(a => `<button type="button" class="secondary-btn" data-atributo="${a.id}">${SIAB.escape(a.rotulo)}: ${SIAB.escape(a.formatar(minha))}</button>`).join('')}</div>
      <p class="field-hint">Vence quem tiver o maior valor. Força: forte 3, moderado 2, fraco 1.</p>`;
  }

  /* ---------- Classificar ---------- */
  function perguntasDe(c) {
    const lista = [{ id: 'funcao', texto: `${c.formula} é um ácido ou uma base?`, opcoes: ['Ácido', 'Base'], certa: c.funcao }];
    if (c.funcao === 'Ácido') {
      lista.push({ id: 'tipo', texto: `${c.formula}: hidrácido ou oxiácido?`, opcoes: ['hidrácido', 'oxiácido'], certa: c.tipo, porque: c.tipo === 'hidrácido' ? 'Não tem oxigênio.' : 'Tem oxigênio.' });
      lista.push({ id: 'h', texto: `Quantos H⁺ ionizáveis tem o ${c.formula}?`, opcoes: ['1', '2', '3'], certa: String(c.ions), porque: c.id === 'h3po3' || c.id === 'h3po2' ? 'Atenção: os H ligados diretamente ao fósforo não se ionizam.' : 'Nos oxiácidos, os H ionizáveis são os ligados ao oxigênio.' });
      lista.push({ id: 'forca', texto: `Qual é a força do ${c.formula}?`, opcoes: ['forte', 'moderado', 'fraco'], certa: c.forcaTexto, porque: c.tipo === 'oxiácido' ? 'Regra: nº de O − nº de H ionizáveis ≥ 2 forte; 1 moderado; 0 fraco (H₂CO₃ é exceção: fraco).' : 'Hidrácidos: HCl, HBr e HI fortes; HF moderado; os demais fracos.' });
    } else {
      lista.push({ id: 'oh', texto: `Quantos OH⁻ tem a fórmula ${c.formula}?`, opcoes: ['1', '2', '3'], certa: String(c.ions), porque: 'É o número de grupos OH na fórmula.' });
      lista.push({ id: 'forca', texto: `Qual é a força do ${c.formula}?`, opcoes: ['forte', 'fraca'], certa: c.forcaTexto, porque: 'Bases de metais alcalinos e alcalinoterrosos (exceto Be e Mg) são fortes.' });
      lista.push({ id: 'sol', texto: `Como é a solubilidade do ${c.formula} em água?`, opcoes: ['solúvel', 'pouco solúvel', 'praticamente insolúvel'], certa: c.solubilidade, porque: 'Solúveis: metais alcalinos e amônio. Pouco solúveis: alcalinoterrosos (exceto Mg). As demais: praticamente insolúveis.' });
    }
    return lista;
  }

  function novoClassificar() {
    const baralho = SIAB.embaralhar(cartas()).slice(0, 6);
    jogo = { tipo: 'classificar', baralho, carta: 0, pergunta: 0, acertos: 0, total: 0, resposta: null, fim: false };
    render();
  }

  function responderClassificar(valor) {
    const c = jogo.baralho[jogo.carta];
    const p = perguntasDe(c)[jogo.pergunta];
    jogo.resposta = { valor, certo: valor === p.certa, p };
    jogo.total++;
    if (jogo.resposta.certo) jogo.acertos++;
    render();
    el.querySelector('#classificar-feedback')?.focus();
  }

  function proximaClassificar() {
    const c = jogo.baralho[jogo.carta];
    jogo.resposta = null;
    jogo.pergunta++;
    if (jogo.pergunta >= perguntasDe(c).length) {
      jogo.pergunta = 0;
      jogo.carta++;
    }
    if (jogo.carta >= jogo.baralho.length) {
      jogo.fim = true;
      jogo.pontos = jogo.acertos * 10;
      jogo.recorde = SIAB.fimDePartida('trunfo', jogo.pontos, [['Modo', 'Classificar'], ['Acertos', `${jogo.acertos} de ${jogo.total}`]]);
    }
    render();
    el.querySelector('h2[tabindex]')?.focus();
  }

  function renderClassificar() {
    if (jogo.fim) {
      return `<section class="jogo-painel fim"><h2 tabindex="-1">${jogo.acertos} de ${jogo.total} acertos · ${jogo.pontos} pontos${jogo.recorde ? ' · novo recorde!' : ''}</h2>
        <div class="jogo-acoes"><button type="button" class="primary-btn" data-acao="classificar">Jogar de novo</button><button type="button" class="secondary-btn" data-acao="menu">Outro modo</button></div></section>`;
    }
    const c = jogo.baralho[jogo.carta];
    const p = perguntasDe(c)[jogo.pergunta];
    const r = jogo.resposta;
    return `<p class="placar">Carta ${jogo.carta + 1} de ${jogo.baralho.length} · acertos: ${jogo.acertos}/${jogo.total}</p>
      <div class="classificar-mesa">${r && jogo.pergunta === perguntasDe(c).length - 1 ? cartaHTML(c) : `<div class="carta neutra"><p class="carta-funcao">Classifique</p><p class="carta-formula">${SIAB.escape(c.formula)}</p></div>`}</div>
      <h2 tabindex="-1">${SIAB.escape(p.texto)}</h2>
      <div class="atributos">${p.opcoes.map(o => `<button type="button" class="secondary-btn" data-classe="${SIAB.escape(o)}" ${r ? 'disabled' : ''}>${SIAB.escape(o)}</button>`).join('')}</div>
      ${r ? `<div id="classificar-feedback" class="quiz-feedback ${r.certo ? 'certo' : 'errado'}" tabindex="-1" role="status"><strong>${r.certo ? '✓ Correto!' : `✗ Resposta: ${SIAB.escape(p.certa)}`}</strong>${p.porque ? `<p>${SIAB.escape(p.porque)}</p>` : ''}</div>
        <div class="jogo-acoes"><button type="button" class="primary-btn" data-acao="proxima-classe">Continuar</button></div>` : ''}`;
  }

  /* ---------- Memória ---------- */
  function novaMemoria() {
    const pares = SIAB.embaralhar(cartas()).slice(0, 6);
    const pecas = SIAB.embaralhar(pares.flatMap(c => [{ par: c.id, texto: c.formula, lado: 'fórmula' }, { par: c.id, texto: c.nome, lado: 'nome' }]))
      .map((p, i) => ({ ...p, indice: i, aberta: false, achada: false }));
    jogo = { tipo: 'memoria', pecas, abertas: [], jogadas: 0, fim: false };
    render();
  }

  function virar(i) {
    const peca = jogo.pecas[i];
    if (peca.aberta || peca.achada || jogo.abertas.length === 2) return;
    peca.aberta = true;
    jogo.abertas.push(peca);
    if (jogo.abertas.length === 2) {
      jogo.jogadas++;
      const [a, b] = jogo.abertas;
      if (a.par === b.par) {
        a.achada = b.achada = true;
        jogo.abertas = [];
        SIAB.announce(`Par encontrado: ${a.texto} e ${b.texto}.`);
        if (jogo.pecas.every(p => p.achada)) {
          jogo.fim = true;
          jogo.pontos = Math.max(0, 100 - 5 * (jogo.jogadas - 6));
          jogo.recorde = SIAB.fimDePartida('trunfo', jogo.pontos, [['Modo', 'Memória'], ['Jogadas', String(jogo.jogadas)]]);
        }
      } else {
        SIAB.announce(`${a.texto} e ${b.texto} não formam par.`);
        setTimeout(() => {
          if (!jogo || jogo.tipo !== 'memoria') return;
          a.aberta = b.aberta = false;
          jogo.abertas = [];
          render();
          el?.querySelector(`[data-peca="${b.indice}"]`)?.focus();
        }, 1100);
      }
    } else {
      SIAB.announce(`${peca.lado}: ${peca.texto}.`);
    }
    render();
    if (jogo.fim) el.querySelector('h2[tabindex]')?.focus();
    else el.querySelector(`[data-peca="${i}"]`)?.focus();
  }

  function renderMemoria() {
    if (jogo.fim) {
      return `<section class="jogo-painel fim"><h2 tabindex="-1">Todos os pares em ${jogo.jogadas} jogadas · ${jogo.pontos} pontos${jogo.recorde ? ' · novo recorde!' : ''}</h2>
        <div class="jogo-acoes"><button type="button" class="primary-btn" data-acao="memoria">Jogar de novo</button><button type="button" class="secondary-btn" data-acao="menu">Outro modo</button></div></section>`;
    }
    return `<p class="placar">Jogadas: ${jogo.jogadas} · pares: ${jogo.pecas.filter(p => p.achada).length / 2} de 6</p>
      <h2 tabindex="-1" class="sr-only">Jogo da memória: ligue cada fórmula ao seu nome</h2>
      <div class="memoria-grade">${jogo.pecas.map(p => `<button type="button" class="peca ${p.aberta || p.achada ? 'aberta' : ''} ${p.achada ? 'achada' : ''}" data-peca="${p.indice}" aria-label="${p.aberta || p.achada ? `${p.lado}: ${SIAB.escape(p.texto)}${p.achada ? ', par encontrado' : ''}` : `Carta ${p.indice + 1}, virada para baixo`}" ${p.achada ? 'aria-disabled="true"' : ''}>${p.aberta || p.achada ? SIAB.escape(p.texto) : '?'}</button>`).join('')}</div>`;
  }

  function render() {
    const cab = SIAB.cabecalhoJogo('trunfo', 'Ácidos e bases em cartas: duelo de atributos, classificação e memória.');
    let corpo = '';
    if (modo === 'menu') {
      corpo = `<section class="jogo-painel"><h2 tabindex="-1">Escolha o modo</h2>
        <div class="cartoes">
          <button type="button" class="cartao" data-acao="duelo"><strong>Duelo</strong><span>Contra o computador. O maior atributo vence a rodada.</span></button>
          <button type="button" class="cartao" data-acao="classificar"><strong>Classificar</strong><span>Função, força, H⁺ ionizáveis e solubilidade de 6 cartas.</span></button>
          <button type="button" class="cartao" data-acao="memoria"><strong>Memória</strong><span>Ligue 6 fórmulas aos seus nomes.</span></button>
        </div></section>`;
    } else {
      const trocar = jogo.fim ? '' : '<button type="button" class="quiet-btn trocar-modo" data-acao="menu">← Trocar de modo</button>';
      const miolo = jogo.tipo === 'duelo' ? renderDuelo() : jogo.tipo === 'classificar' ? renderClassificar() : renderMemoria();
      corpo = `<section class="jogo-painel ${jogo.tipo}">${trocar}${miolo}</section>`;
    }
    el.innerHTML = cab + corpo;
  }

  function aoClicar(evento) {
    const botao = evento.target.closest('button');
    if (!botao || !el) return;
    const acao = botao.dataset.acao;
    if (acao === 'menu') { modo = 'menu'; jogo = null; render(); el.querySelector('h2[tabindex]')?.focus(); return; }
    if (acao === 'duelo') { modo = 'jogo'; novoDuelo(); el.querySelector('#trunfo-status')?.focus(); return; }
    if (acao === 'classificar') { modo = 'jogo'; novoClassificar(); el.querySelector('h2[tabindex]')?.focus(); return; }
    if (acao === 'memoria') { modo = 'jogo'; novaMemoria(); el.querySelector('[data-peca]')?.focus(); return; }
    if (acao === 'proxima') proximaRodada();
    if (acao === 'proxima-classe') proximaClassificar();
    if (botao.dataset.atributo) jogarAtributo(botao.dataset.atributo);
    if (botao.dataset.classe) responderClassificar(botao.dataset.classe);
    if (botao.dataset.peca) virar(Number(botao.dataset.peca));
  }

  return {
    titulo: 'Super Trunfo químico', conteudo: 'Funções inorgânicas', resumo: 'Duelo de cartas, classificação e memória com ácidos e bases.',
    montar(elemento) {
      el = elemento;
      modo = 'menu';
      jogo = null;
      el.addEventListener('click', aoClicar);
      render();
    },
    desmontar() {
      el?.removeEventListener('click', aoClicar);
      el = null;
      jogo = null;
    },
    get jogo() { return jogo; },
    cartas
  };
})();
