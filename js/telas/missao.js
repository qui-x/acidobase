'use strict';
/* Tela da missão: a bancada com o cartão da missão no lugar da prateleira.
   O cartão mostra o passo atual (ler, prever, observar, agir, explicar, quiz). */
SIAB.missaoTela = (() => {
  const $ = SIAB.$;
  const ROTULO = { ler: 'LER', prever: 'PREVER', observar: 'OBSERVAR', agir: 'AGIR', explicar: 'EXPLICAR', quiz: 'CONFERIR' };
  let rascunhos = {};          // textos ainda não salvos dos passos "explicar"
  let quizConferido = {};      // quizzes já corrigidos neste passo

  const trilhaDe = def => SIAB.trilhas.find(t => t.id === def.trilha);

  // Próximo item da trilha depois desta missão.
  function proximoItem(def) {
    const itens = trilhaDe(def).itens;
    const i = itens.findIndex(x => x.tipo === 'missao' && x.id === def.id);
    return itens[i + 1] || null;
  }
  const rotaDoItem = item => (item.tipo === 'missao' ? `#/missao/${item.id}` : `#/desafio/${item.id}`);
  const tituloDoItem = item => (item.tipo === 'missao'
    ? SIAB.missoes.find(m => m.id === item.id)?.titulo
    : SIAB.desafios[item.id]?.titulo);

  function opcoesHTML(nome, opcoes, marcada, valores = opcoes) {
    return opcoes.map((texto, i) => `<label class="opcao"><input type="radio" name="${SIAB.escape(nome)}" value="${SIAB.escape(String(valores[i]))}" ${String(marcada) === String(valores[i]) ? 'checked' : ''}><span>${SIAB.escape(texto)}</span></label>`).join('');
  }

  function conferirHTML(idPrever) {
    const a = SIAB.motor.ativa;
    const p = a.def.passos.find(x => x.id === idPrever);
    const resposta = a.respostas[idPrever];
    const esperado = SIAB.motor.gabarito(p);
    if (!p || resposta === undefined) return '';
    if (p.porTubo) {
      const linhas = Object.entries(resposta).map(([tubo, valor]) => {
        const certo = esperado[tubo] === valor;
        return `<li class="${certo ? 'certo' : 'errado'}"><strong>${SIAB.escape(tubo)}</strong>: você previu ${SIAB.escape(valor)} · resultado ${SIAB.escape(esperado[tubo])} <span aria-hidden="true">${certo ? '✓' : '✗'}</span><span class="sr-only">${certo ? 'acertou' : 'diferente'}</span></li>`;
      }).join('');
      return `<ul class="conferir">${linhas}</ul>`;
    }
    const certo = esperado === resposta;
    return `<p class="conferir-unico ${certo ? 'certo' : 'errado'}">Você previu: <strong>${SIAB.escape(resposta)}</strong>. ${certo ? '✓ Acertou.' : `✗ O resultado foi: <strong>${SIAB.escape(esperado)}</strong>.`}</p>`;
  }

  function controlesHTML(def) {
    const s = SIAB.state, t = SIAB.current();
    const partes = [];
    const ctrl = new Set(def.bancada.controles);
    if (ctrl.has('realcar')) {
      partes.push(`<label class="check-row"><input type="checkbox" id="missao-realcar" ${s.indicatorOnly ? 'checked' : ''}>Realçar indicador <span class="small">oculta a cor própria da amostra</span></label>`);
    }
    if (ctrl.has('temperatura')) {
      partes.push(`<label class="field">Temperatura dos tubos: <output id="missao-temp-valor">${SIAB.format(t.temperature, 0)} °C</output><input id="missao-temp" type="range" min="0" max="100" step="1" value="${t.temperature}"></label>`);
    }
    if (ctrl.has('indicador')) {
      partes.push(`<fieldset class="chips"><legend>Indicador do tubo</legend><div class="chip-list">${Object.entries(SIAB.indicators).map(([id, x]) => `<label class="chip"><input type="radio" name="missao-indicador" value="${id}" ${t.indicator === id ? 'checked' : ''}><span>${SIAB.escape(x.short)}</span></label>`).join('')}</div></fieldset>`);
    }
    return partes.length ? `<div class="missao-controles">${partes.join('')}</div>` : '';
  }

  function corpoDoPasso(p) {
    const a = SIAB.motor.ativa;
    const resposta = a.respostas[p.id];
    if (p.tipo === 'ler') return `<p>${SIAB.escape(p.texto)}</p>`;
    if (p.tipo === 'prever') {
      if (p.porTubo) {
        return SIAB.state.tubes.map(t => `<fieldset class="opcoes opcoes-tubo" data-tubo="${SIAB.escape(t.name)}"><legend>${SIAB.escape(t.name)}</legend>${opcoesHTML(`prever-${p.id}-${t.id}`, p.opcoes, resposta?.[t.name])}</fieldset>`).join('')
          + '<p class="field-hint">Toque nos tubos da bancada para ver as cores. Depois você confere.</p>';
      }
      return `<fieldset class="opcoes"><legend class="sr-only">${SIAB.escape(p.pergunta)}</legend>${opcoesHTML(`prever-${p.id}`, p.opcoes, resposta)}</fieldset><p class="field-hint">Sua previsão fica guardada. Depois você confere.</p>`;
    }
    if (p.tipo === 'observar') return `<p>${SIAB.escape(p.texto)}</p>${p.conferir ? conferirHTML(p.conferir) : ''}`;
    if (p.tipo === 'agir') {
      return '<p id="agir-status" class="agir-status" aria-live="polite"></p>';
    }
    if (p.tipo === 'explicar') {
      const texto = rascunhos[p.id] ?? resposta ?? '';
      const salvo = resposta !== undefined && resposta === texto && texto.trim().length >= 3;
      return `<label class="field"><span class="sr-only">${SIAB.escape(p.pergunta)}</span><textarea id="explicar-texto" rows="4" maxlength="800">${SIAB.escape(texto)}</textarea></label>
        ${salvo ? `<div class="modelo"><strong>Uma resposta possível</strong><p>${SIAB.escape(p.modelo)}</p></div>` : '<p class="field-hint">Escreva com suas palavras. Depois de salvar, aparece uma resposta possível para comparar.</p>'}`;
    }
    if (p.tipo === 'quiz') {
      const conferido = quizConferido[p.id] && resposta !== undefined;
      const feedback = conferido
        ? `<div class="quiz-feedback ${resposta === p.correta ? 'certo' : 'errado'}" role="status"><strong>${resposta === p.correta ? '✓ Correto!' : `✗ A resposta é: ${SIAB.escape(p.opcoes[p.correta])}`}</strong><p>${SIAB.escape(p.explicacao)}</p></div>`
        : '';
      return `<fieldset class="opcoes" ${conferido ? 'disabled' : ''}><legend class="sr-only">${SIAB.escape(p.pergunta)}</legend>${opcoesHTML(`quiz-${p.id}`, p.opcoes, resposta, p.opcoes.map((_, i) => i))}</fieldset>${feedback}`;
    }
    return '';
  }

  // Passos "agir" mostram a própria instrução como título.
  const tituloDoPasso = p => p.pergunta || (p.tipo === 'agir' ? p.texto : p.titulo);

  function rotuloBotao(p) {
    const a = SIAB.motor.ativa;
    const ultimo = a.indice === a.def.passos.length - 1;
    if (p.tipo === 'prever') return 'Confirmar previsão';
    if (p.tipo === 'explicar') {
      const texto = rascunhos[p.id] ?? a.respostas[p.id] ?? '';
      if (a.respostas[p.id] === undefined || a.respostas[p.id] !== texto) return 'Salvar resposta';
    }
    if (p.tipo === 'quiz' && !quizConferido[p.id]) return 'Conferir';
    return ultimo ? 'Concluir missão' : 'Continuar';
  }

  function renderConcluida(def) {
    const linhas = SIAB.motor.resumo();
    const proximo = proximoItem(def);
    $('painel-missao').innerHTML = `<div class="missao-card concluida">
      <p class="eyebrow">MISSÃO CONCLUÍDA</p>
      <h2 id="missao-titulo" tabindex="-1">${SIAB.escape(def.titulo)} ✓</h2>
      <p>Suas previsões, respostas e explicações foram salvas no caderno.</p>
      <dl class="resumo-missao">${linhas.map(([pergunta, resposta]) => `<div><dt>${SIAB.escape(pergunta)}</dt><dd>${SIAB.escape(resposta)}</dd></div>`).join('')}</dl>
      <div class="missao-acoes coluna">
        ${proximo ? `<a class="primary-btn" href="${rotaDoItem(proximo)}">Próximo: ${SIAB.escape(tituloDoItem(proximo))}</a>` : ''}
        <a class="secondary-btn" href="#/aprender">Voltar às trilhas</a>
        <button type="button" class="quiet-btn" id="missao-refazer">Refazer esta missão</button>
      </div>
    </div>`;
    $('mission-bar').textContent = 'Missão concluída · ver resumo';
    $('mission-bar').hidden = false;
  }

  function render() {
    const a = SIAB.motor.ativa;
    if (!a) return;
    const def = a.def;
    if (a.concluida) { renderConcluida(def); return; }
    const p = SIAB.motor.passo();
    const total = def.passos.length;
    const trilha = trilhaDe(def);
    $('painel-missao').innerHTML = `<div class="missao-card" data-tipo="${p.tipo}">
      <p class="eyebrow">TRILHA ${def.trilha} · ${SIAB.escape(trilha.titulo.toUpperCase())}</p>
      <h2 id="missao-titulo">${SIAB.escape(def.titulo)}</h2>
      <div class="missao-progresso" role="progressbar" aria-label="Progresso da missão" aria-valuemin="1" aria-valuemax="${total}" aria-valuenow="${a.indice + 1}" aria-valuetext="Passo ${a.indice + 1} de ${total}"><span style="width:${((a.indice + 1) / total) * 100}%"></span></div>
      <section class="passo">
        <p class="passo-tipo">${ROTULO[p.tipo]} · passo ${a.indice + 1} de ${total}</p>
        <h3 id="passo-titulo" tabindex="-1">${SIAB.escape(tituloDoPasso(p))}</h3>
        ${corpoDoPasso(p)}
      </section>
      ${controlesHTML(def)}
      <div class="missao-acoes">
        <button type="button" class="quiet-btn" id="passo-voltar" ${a.indice === 0 ? 'disabled' : ''}>Voltar</button>
        <button type="button" class="primary-btn" id="passo-avancar">${rotuloBotao(p)}</button>
      </div>
      ${p.tipo === 'agir' && p.demo ? '<button type="button" class="quiet-btn" id="passo-demo">Mostrar como (demonstração)</button>' : ''}
      <p id="missao-erro" class="form-error" role="alert" hidden></p>
    </div>`;
    atualizar();
  }

  // Partes que mudam a cada gota, sem redesenhar o cartão (preserva o foco).
  function atualizar() {
    const a = SIAB.motor.ativa;
    if (!a || SIAB.rota.nome !== 'missao') return;
    if (a.concluida) return;
    const p = SIAB.motor.passo();
    const pronto = SIAB.motor.concluido();
    const status = $('agir-status');
    if (status && p.tipo === 'agir') {
      const extra = p.progresso ? ` · ${p.progresso(SIAB.motor.contexto())}` : '';
      const texto = pronto ? `✓ Feito!${extra}` : `Ainda não.${extra}`;
      if (status.textContent !== texto) status.textContent = texto;
      status.classList.toggle('feito', pronto);
    }
    const botao = $('passo-avancar');
    if (botao) {
      const exigeCondicao = p.tipo === 'agir';
      botao.disabled = exigeCondicao && !pronto;
      botao.textContent = rotuloBotao(p);
    }
    const temp = $('missao-temp');
    if (temp && document.activeElement !== temp) temp.value = SIAB.current().temperature;
    const tempValor = $('missao-temp-valor');
    if (tempValor) tempValor.textContent = `${SIAB.format(SIAB.current().temperature, 0)} °C`;
    const realcar = $('missao-realcar');
    if (realcar) realcar.checked = SIAB.state.indicatorOnly;
    document.querySelectorAll('input[name="missao-indicador"]').forEach(x => { x.checked = x.value === SIAB.current().indicator; });
    const bar = $('mission-bar');
    bar.hidden = false;
    bar.textContent = `Passo ${a.indice + 1}/${a.def.passos.length} · ${ROTULO[p.tipo]}: ${tituloDoPasso(p)}${p.tipo === 'agir' && pronto ? ' ✓' : ''}`;
  }

  function erro(mensagem) {
    const box = $('missao-erro');
    box.textContent = mensagem;
    box.hidden = false;
  }

  function trocouPasso() {
    render();
    SIAB.render(true);
    $('passo-titulo')?.focus({ preventScroll: false });
  }

  function avancar() {
    const a = SIAB.motor.ativa;
    const p = SIAB.motor.passo();
    if (!p) return;
    if (p.tipo === 'explicar') {
      const texto = ($('explicar-texto')?.value || '').trim();
      if (a.respostas[p.id] !== texto) {
        if (texto.length < 3) { erro('Escreva pelo menos uma frase curta antes de salvar.'); $('explicar-texto').focus(); return; }
        SIAB.motor.responder(p.id, texto);
        rascunhos[p.id] = texto;
        render();
        $('passo-titulo')?.focus();
        SIAB.announce('Resposta salva. Compare com uma resposta possível.');
        return;
      }
    }
    if (p.tipo === 'quiz' && !quizConferido[p.id]) {
      if (a.respostas[p.id] === undefined) { erro('Escolha uma alternativa.'); return; }
      quizConferido[p.id] = true;
      render();
      $('passo-titulo')?.focus();
      SIAB.announce(a.respostas[p.id] === p.correta ? 'Correto!' : `A resposta é: ${p.opcoes[p.correta]}.`);
      return;
    }
    if (!SIAB.motor.concluido()) {
      erro(p.tipo === 'prever' ? 'Escolha uma opção para cada item antes de confirmar.' : 'Complete a tarefa na bancada para continuar.');
      return;
    }
    SIAB.motor.avancar();
    if (SIAB.motor.ativa.concluida) {
      render();
      SIAB.render(true);
      $('missao-titulo')?.focus();
      SIAB.announce('Missão concluída. Resumo salvo no caderno.');
      return;
    }
    trocouPasso();
  }

  function ligar() {
    const painel = $('painel-missao');
    painel.addEventListener('change', evento => {
      const alvo = evento.target;
      const p = SIAB.motor.passo();
      if (!p) return;
      if (alvo.name?.startsWith('prever-')) {
        const campo = alvo.closest('[data-tubo]');
        if (campo) SIAB.motor.responderTubo(p.id, campo.dataset.tubo, alvo.value);
        else SIAB.motor.responder(p.id, alvo.value);
        $('missao-erro').hidden = true;
      }
      if (alvo.name?.startsWith('quiz-')) {
        SIAB.motor.responder(p.id, Number(alvo.value));
        $('missao-erro').hidden = true;
      }
      if (alvo.id === 'missao-realcar') {
        SIAB.state.indicatorOnly = alvo.checked;
        SIAB.loja.avisar();
      }
      if (alvo.name === 'missao-indicador') {
        SIAB.alterar('trocar indicador', () => { SIAB.current().indicator = alvo.value; });
      }
    });
    painel.addEventListener('input', evento => {
      const alvo = evento.target;
      if (alvo.id === 'explicar-texto') {
        rascunhos[SIAB.motor.passo().id] = alvo.value;
        $('missao-erro').hidden = true;
        $('passo-avancar').textContent = rotuloBotao(SIAB.motor.passo());
      }
      if (alvo.id === 'missao-temp') {
        const valor = Number(alvo.value);
        SIAB.state.tubes.forEach(t => { t.temperature = valor; });
        SIAB.loja.avisar();
      }
    });
    painel.addEventListener('click', evento => {
      const alvo = evento.target.closest('button');
      if (!alvo) return;
      if (alvo.id === 'passo-avancar') avancar();
      if (alvo.id === 'passo-voltar') {
        SIAB.motor.voltar();
        trocouPasso();
      }
      if (alvo.id === 'passo-demo') {
        SIAB.registrar('demonstração');
        SIAB.motor.passo().demo();
        SIAB.render(true);
        SIAB.announce('Demonstração feita na bancada. Use Desfazer para voltar.');
      }
      if (alvo.id === 'missao-refazer') {
        const id = SIAB.motor.ativa.def.id;
        rascunhos = {};
        quizConferido = {};
        SIAB.motor.iniciar(id);
        SIAB.telas.missao.entrar(id);
      }
    });
    $('mission-bar').addEventListener('click', () => {
      if (SIAB.bancada.mobile.matches) SIAB.bancada.openSheet();
      else $('passo-titulo')?.focus();
    });
    SIAB.loja.assinar(atualizar);
  }

  return { render, ligar, reiniciarRascunhos() { rascunhos = {}; quizConferido = {}; } };
})();

SIAB.telas.missao = {
  completo: true,
  secao: 'bancada',
  menu: 'aprender',
  titulo: id => SIAB.missoes.find(m => m.id === id)?.titulo || 'Missão',
  entrar(id) {
    const def = SIAB.missoes.find(m => m.id === id);
    if (!def) { SIAB.irPara('#/aprender'); return; }
    const a = SIAB.motor.ativa;
    if (!a || a.def.id !== id || a.concluida) {
      SIAB.missaoTela.reiniciarRascunhos();
      SIAB.motor.iniciar(id);
    }
    SIAB.usarBancada('mission');
    SIAB.bancada.configurar({ modo: 'missao', controles: def.bancada.controles, ver: def.bancada.ver, nivel: def.bancada.nivel || 'medir' });
    SIAB.missaoTela.render();
    SIAB.render(true);
    SIAB.progresso.marcarUltima(`#/missao/${id}`, `Missão: ${def.titulo}`);
  },
  sair() {
    SIAB.bancada.closeSheet(false);
    SIAB.$('mission-bar').hidden = true;
  }
};
