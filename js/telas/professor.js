'use strict';
/* Modo professor: montar aula (link com a sequência), modo projetor,
   roteiro impresso e respostas esperadas de cada missão. */
SIAB.professor = (() => {
  const $ = SIAB.$;
  const selecao = new Set();

  function itens() {
    return SIAB.trilhas.flatMap(trilha => trilha.itens.map(item => ({ ...item, trilha })));
  }
  const chave = item => `${item.tipo}:${item.id}`;
  const tituloDe = item => (item.tipo === 'missao' ? SIAB.missoes.find(m => m.id === item.id).titulo : SIAB.desafios[item.id].titulo);

  function renderItens() {
    $('aula-itens').innerHTML = SIAB.trilhas.map(trilha => `<fieldset class="aula-trilha">
      <legend>Trilha ${trilha.id} · ${SIAB.escape(trilha.titulo)} <span class="small">(${trilha.serie})</span></legend>
      ${trilha.itens.map(item => `<label class="check-row"><input type="checkbox" name="aula-item" value="${chave(item)}" ${selecao.has(chave(item)) ? 'checked' : ''}>${item.tipo === 'missao' ? 'Missão' : 'Desafio'}: ${SIAB.escape(tituloDe(item))}</label>`).join('')}
    </fieldset>`).join('');
  }

  // Respostas esperadas: previsões com gabarito fixo, quizzes e respostas-modelo.
  function respostas(def) {
    return def.passos.map(p => {
      if (p.tipo === 'prever') {
        const g = typeof p.gabarito === 'function' ? 'calculado na bancada (depende do pH de cada tubo)' : typeof p.gabarito === 'object' ? Object.entries(p.gabarito).map(([k, v]) => `${k}: ${v}`).join('; ') : p.gabarito;
        return `<li><strong>Prever:</strong> ${SIAB.escape(p.pergunta)} → ${SIAB.escape(g)}</li>`;
      }
      if (p.tipo === 'quiz') return `<li><strong>Quiz:</strong> ${SIAB.escape(p.pergunta)} → ${SIAB.escape(p.opcoes[p.correta])}</li>`;
      if (p.tipo === 'explicar') return `<li><strong>Explicar:</strong> ${SIAB.escape(p.pergunta)} → ${SIAB.escape(p.modelo)}</li>`;
      if (p.tipo === 'agir') return `<li><strong>Agir:</strong> ${SIAB.escape(p.texto)}</li>`;
      return '';
    }).join('');
  }

  function renderGabaritos() {
    $('gabaritos').innerHTML = SIAB.missoes.map(def => `<details class="gabarito">
      <summary><span>Trilha ${def.trilha} · <strong>${SIAB.escape(def.titulo)}</strong></span></summary>
      <p><strong>Objetivo:</strong> ${SIAB.escape(def.professor.objetivo)}</p>
      <p><strong>Concepções alternativas:</strong> ${def.professor.concepcoes.map(c => `${c} — ${SIAB.escape(SIAB.concepcoes[c])}`).join(' ')}</p>
      <p><strong>BNCC:</strong> ${def.professor.bncc.map(c => `${c} (${SIAB.escape(SIAB.bncc[c])})`).join('; ')}</p>
      <ol class="gabarito-passos">${respostas(def)}</ol>
      <a class="secondary-btn" href="#/missao/${def.id}">Abrir missão</a>
    </details>`).join('');
  }

  function montarRoteiro() {
    const escolhidos = itens().filter(item => selecao.has(chave(item)));
    const lista = escolhidos.length ? escolhidos : itens();
    const blocos = lista.map((item, n) => {
      if (item.tipo === 'desafio') {
        const d = SIAB.desafios[item.id];
        return `<section><h2>${n + 1}. Desafio: ${SIAB.escape(d.titulo)}</h2><p>${SIAB.escape(d.resumo)}</p><p>Pontuação obtida: ________</p></section>`;
      }
      const def = SIAB.missoes.find(m => m.id === item.id);
      const perguntas = def.passos.filter(p => ['prever', 'quiz', 'explicar'].includes(p.tipo)).map(p => {
        const opcoes = p.opcoes && !p.porTubo ? `<ul class="roteiro-opcoes">${p.opcoes.map(o => `<li>( ) ${SIAB.escape(o)}</li>`).join('')}</ul>` : '';
        const tubos = p.porTubo ? `<ul class="roteiro-opcoes">${def.bancada.tubos.map(t => `<li>${SIAB.escape(t.name)}: ____________</li>`).join('')}</ul>` : '';
        const linhas = p.tipo === 'explicar' ? '<div class="roteiro-linhas"></div>' : '';
        return `<li><p>${SIAB.escape(p.pergunta)}</p>${opcoes}${tubos}${linhas}</li>`;
      }).join('');
      return `<section><h2>${n + 1}. Missão: ${SIAB.escape(def.titulo)}</h2><p><em>Objetivo:</em> ${SIAB.escape(def.professor.objetivo)}</p><ol>${perguntas}</ol></section>`;
    }).join('');
    $('roteiro-impressao').innerHTML = `<header><h1>SIAB — Roteiro de aula</h1><p>Nome: ______________________________ Turma: ________ Data: ___/___/_____</p></header>${blocos}`;
  }

  function ligar() {
    $('aula-itens').addEventListener('change', evento => {
      if (evento.target.name !== 'aula-item') return;
      if (evento.target.checked) selecao.add(evento.target.value); else selecao.delete(evento.target.value);
      $('aula-erro').hidden = true;
    });
    $('aula-form').addEventListener('submit', evento => {
      evento.preventDefault();
      const escolhidos = itens().filter(item => selecao.has(chave(item))).map(chave);
      if (!escolhidos.length) {
        $('aula-erro').textContent = 'Escolha pelo menos uma missão ou desafio.';
        $('aula-erro').hidden = false;
        return;
      }
      const rota = `#/aula/${escolhidos.join(',')}`;
      $('aula-url').value = location.href.split('#')[0] + rota;
      $('abrir-aula').href = rota;
      $('aula-link').hidden = false;
      $('aula-url').focus();
      $('aula-url').select();
    });
    $('copiar-link').addEventListener('click', async () => {
      const campo = $('aula-url');
      try {
        await navigator.clipboard.writeText(campo.value);
      } catch (erro) {
        campo.select();
        document.execCommand?.('copy');
      }
      SIAB.notice('Link copiado.');
    });
    $('limpar-aula').addEventListener('click', () => {
      selecao.clear();
      renderItens();
      $('aula-link').hidden = true;
    });
    $('imprimir-roteiro').addEventListener('click', () => {
      montarRoteiro();
      document.body.classList.add('imprimindo-roteiro');
      window.print();
    });
    window.addEventListener('afterprint', () => document.body.classList.remove('imprimindo-roteiro'));
    const projetor = SIAB.armazenamento.ler('siab_projetor', false);
    document.documentElement.dataset.projetor = projetor ? 'on' : 'off';
    $('projetor-check').checked = projetor;
    $('projetor-check').addEventListener('change', evento => {
      document.documentElement.dataset.projetor = evento.target.checked ? 'on' : 'off';
      SIAB.armazenamento.gravar('siab_projetor', evento.target.checked);
      SIAB.notice(evento.target.checked ? 'Modo projetor ligado.' : 'Modo projetor desligado.');
    });
    $('apagar-progresso').addEventListener('click', () => {
      SIAB.confirmar('Apagar progresso?', 'Missões concluídas, recordes e caderno deste aparelho serão apagados. Esta ação não pode ser desfeita.', () => {
        SIAB.progresso.apagarTudo();
        SIAB.notice('Progresso apagado.');
      }, 'Apagar tudo', 'danger');
    });
  }

  return { renderItens, renderGabaritos, ligar, montarRoteiro, selecao };
})();

SIAB.telas.professor = {
  completo: true,
  secao: 'professor',
  titulo: () => 'Professor',
  entrar() {
    SIAB.professor.renderItens();
    SIAB.professor.renderGabaritos();
  }
};

SIAB.telas.aula = {
  completo: true,
  secao: 'aula',
  menu: 'aprender',
  titulo: () => 'Aula',
  entrar(parametro) {
    const itens = parametro.split(',').map(x => x.split(':')).filter(([tipo, id]) => (tipo === 'missao' && SIAB.missoes.some(m => m.id === id)) || (tipo === 'desafio' && Object.hasOwn(SIAB.desafios, id)));
    SIAB.$('aula-sequencia').innerHTML = itens.length
      ? itens.map(([tipo, id], n) => {
        const x = SIAB.itemDaTrilha({ tipo, id });
        return `<li><a class="item-trilha ${x.feito ? 'feito' : ''}" href="${x.rota}"><span class="item-numero" aria-hidden="true">${x.feito ? '✓' : n + 1}</span><span class="item-texto"><span class="item-tipo">${x.tipo}</span><strong>${SIAB.escape(x.titulo)}</strong><span>${SIAB.escape(x.resumo)}</span></span><span class="item-status">${SIAB.escape(x.status)}</span></a></li>`;
      }).join('')
      : '<li class="vazio">Este link de aula não tem itens válidos. Peça um novo link ao professor.</li>';
    if (itens.length) SIAB.progresso.marcarUltima(`#/aula/${parametro}`, 'Aula montada pelo professor');
  }
};
