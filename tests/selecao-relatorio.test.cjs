/* Integração DOM: eventos reais do módulo, estado da bancada e HTML impresso.
   Não substitui verificação visual nem teste em aparelho com tela de toque.
   npm install --no-save jsdom; node tests/selecao-relatorio.test.cjs
   Também aceita SIAB_JSDOM_MODULE apontando para uma instalação externa. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM } = require(process.env.SIAB_JSDOM_MODULE || 'jsdom');
const root = path.join(__dirname, '..');
const pausa = ms => new Promise(resolve => setTimeout(resolve, ms));

async function verificar(largura) {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const dom = new JSDOM(html, { url: 'https://siab.test/#/laboratorio', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window, d = w.document;
  w.matchMedia = consulta => ({
    matches: consulta.includes('reduced-motion') ||
      (consulta.match(/max-width:\s*(\d+)/)?.[1] >= largura) ||
      (Number(consulta.match(/min-width:\s*(\d+)/)?.[1] || Infinity) <= largura),
    addEventListener() {}, removeEventListener() {}, addListener() {}
  });
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  w.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new w.Event('close')); };
  w.localStorage.setItem('siab_abertura', 'off');
  const erros = [];
  w.addEventListener('error', e => erros.push(e.error));
  const $ = id => d.getElementById(id);
  const clicar = (el, extras = {}) => (typeof el === 'string' ? $(el) : el).dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true, detail: 1, ...extras }));
  const ponteiro = (el, tipo, extras = {}) => {
    const ev = new w.MouseEvent(tipo, { bubbles: true, cancelable: true, button: 0, clientX: 60, clientY: 100, ...extras });
    Object.defineProperties(ev, { pointerId: { value: extras.pointerId ?? 1 }, pointerType: { value: largura <= 900 ? 'touch' : 'mouse' }, isPrimary: { value: extras.isPrimary ?? true } });
    el.dispatchEvent(ev);
  };
  const tecla = (el, key, extras = {}) => el.dispatchEvent(new w.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...extras }));
  try {
    for (const script of d.querySelectorAll('script[src]')) {
      const arquivo = script.getAttribute('src').split('?')[0];
      if (/^https?:/.test(arquivo)) continue;
      w.eval(fs.readFileSync(path.join(root, arquivo), 'utf8'));
    }
    const S = w.SIAB, s = S.state;
    for (const [name, solution] of [['Limão <A> & B', 'lemon'], ['Água de controle', 'water'], ['Bicarbonato', 'bicarbonate']]) S.newTube({ name, solution, indicator: 'cabbage', additions: [.05] });
    s.activeId = s.tubes[1].id;
    S.render(true);
    const ids = s.tubes.map(t => t.id);
    const cartao = id => $(`overview-grid`).querySelector(`[data-tube="${id}"]`);
    const selecionados = () => [...$('overview-grid').querySelectorAll('[aria-pressed=true]')].map(el => Number(el.dataset.tube));
    const abrir = () => clicar('overview-tab');
    const folha = () => { const el = d.createElement('div'); el.innerHTML = S.impressao.relatorioBancada(); return el; };

    // Clique comum ainda abre o recipiente; Ctrl/Cmd liga seleção sem mudar o foco químico.
    abrir(); clicar(cartao(ids[0])); assert.equal(s.view, 'focus');
    s.activeId = ids[1]; abrir(); clicar(cartao(ids[0]), { ctrlKey: true });
    assert.equal(s.view, 'overview'); assert.equal(s.activeId, ids[1]);
    assert.deepEqual(selecionados(), [ids[0]]);
    assert.equal($('workspace').classList.contains('selecting-tubes'), true);
    clicar(cartao(ids[2]), { metaKey: true });
    assert.deepEqual(selecionados(), [ids[0], ids[2]]);
    const antes = JSON.stringify(s.tubes);
    clicar('selecao-relatorio-btn');
    assert.equal(JSON.stringify(s.tubes), antes);
    assert.deepEqual(Array.from(s.relatorioIds), [ids[0], ids[2]]);
    assert.equal($('overview-relatorio').hidden, false);
    assert.equal(d.activeElement.id, 'relatorio-imprimir-btn');
    let relatorio = folha();
    assert.equal(relatorio.querySelectorAll('.folha-resumo tbody tr').length, 2);
    assert.equal(relatorio.querySelectorAll('.folha-detalhe').length, 2);
    assert.equal(relatorio.querySelectorAll('.folha-grafico').length, 2);
    assert.ok(relatorio.textContent.includes('Limão <A> & B'));
    assert.ok(!relatorio.textContent.includes('Água de controle'));
    assert.equal(relatorio.querySelectorAll('.folha-detalhe h2 a').length, 0);
    const svgIds = [...relatorio.querySelectorAll('[id]')].map(el => el.id);
    assert.equal(svgIds.length, new Set(svgIds).size, 'SVGs impressos têm IDs únicos');

    // O beforeprint deve preservar a escolha, inclusive quando disparado por Ctrl+P.
    let impressa;
    w.print = () => {
      w.dispatchEvent(new w.Event('beforeprint'));
      impressa = $('folha-impressao').innerHTML;
      w.dispatchEvent(new w.Event('afterprint'));
    };
    clicar('relatorio-imprimir-btn');
    assert.ok(impressa.includes('Recipientes selecionados (2)'));
    assert.ok(!impressa.includes('Água de controle'));
    assert.equal($('folha-impressao').innerHTML, '');

    // Revisão, selecionar todos, desmarcar e Cancelar não alteram a escolha confirmada.
    clicar('relatorio-editar-btn'); clicar('selecao-todos-btn');
    assert.equal(selecionados().length, 3);
    clicar('selecao-todos-btn'); assert.equal(selecionados().length, 0);
    assert.equal($('selecao-relatorio-btn').disabled, true);
    tecla(cartao(ids[1]), 'a', { ctrlKey: true }); assert.equal(selecionados().length, 3);
    clicar(cartao(ids[0])); assert.equal(selecionados().length, 2);
    tecla(cartao(ids[1]), 'Escape');
    assert.deepEqual(Array.from(s.relatorioIds), [ids[0], ids[2]]);
    assert.equal($('selecao-tubos').hidden, true);
    assert.equal(d.activeElement.id, 'selecionar-tubos-btn');

    // Ordem de pH não troca IDs. Renomear e ocultar pH refletem no relatório.
    clicar('selecionar-tubos-btn'); clicar('ordenar-ph-btn');
    assert.deepEqual(selecionados().sort(), [ids[0], ids[2]].sort());
    clicar('selecao-cancelar-btn');
    s.tubes[0].name = 'Limão renomeado'; s.showPH = false; S.render();
    relatorio = folha();
    assert.ok(relatorio.textContent.includes('Limão renomeado'));
    assert.equal(relatorio.querySelectorAll('.folha-grafico').length, 0);
    assert.ok(relatorio.textContent.includes('oculto'));
    s.showPH = true;

    // Segurar seleciona uma vez e não abre/desmarca ao soltar (click de compatibilidade).
    clicar('relatorio-limpar-btn'); abrir();
    ponteiro(cartao(ids[0]), 'pointerdown'); await pausa(600);
    assert.deepEqual(selecionados(), [ids[0]]);
    ponteiro(cartao(ids[0]), 'pointerup'); clicar(cartao(ids[0]));
    assert.deepEqual(selecionados(), [ids[0]]); assert.equal(s.view, 'overview');
    // Um novo toque deve funcionar imediatamente, sem ficar bloqueado pelo gesto anterior.
    ponteiro(cartao(ids[2]), 'pointerdown'); ponteiro(cartao(ids[2]), 'pointerup'); clicar(cartao(ids[2]));
    assert.deepEqual(selecionados().sort(), [ids[0], ids[2]].sort());
    clicar('selecao-cancelar-btn');

    // Rolar, arrastar, cancelar o ponteiro e usar dois dedos não ativam seleção.
    for (const cancelar of [
      () => ponteiro(w, 'pointermove', { clientY: 150 }),
      () => w.dispatchEvent(new w.Event('scroll')),
      () => ponteiro(w, 'pointercancel'),
      () => ponteiro(cartao(ids[1]), 'pointerdown', { pointerId: 2, isPrimary: false })
    ]) {
      ponteiro(cartao(ids[0]), 'pointerdown'); cancelar(); await pausa(600);
      assert.equal($('selecao-tubos').hidden, true);
      ponteiro(w, 'pointerup');
    }
    // Sair da visão geral durante a espera cancela o gesto.
    ponteiro(cartao(ids[0]), 'pointerdown'); clicar('focus-tab'); await pausa(600);
    assert.equal($('selecao-tubos').hidden, true);
    assert.equal(s.view, 'focus');
    abrir();

    // Teclado e todos os dez tubos, sem atingir os dados experimentais.
    tecla(cartao(ids[1]), ' ', { ctrlKey: true });
    assert.deepEqual(selecionados(), [ids[1]]);
    while (s.tubes.length < S.MAX_TUBES) S.newTube({ solution: 'water', name: 'Teste ' + s.nextId });
    S.render(); clicar('selecao-todos-btn'); clicar('selecao-relatorio-btn');
    assert.equal(s.relatorioIds.length, 10);
    assert.equal(folha().querySelectorAll('.folha-detalhe').length, 10);
    // Tubos removidos saem do relatório; nunca retorna silenciosamente a imprimir todos.
    s.tubes = s.tubes.filter(t => t.id === ids[1]); S.render();
    assert.deepEqual(Array.from(s.relatorioIds), [ids[1]]);
    s.tubes = []; s.activeId = null; S.render();
    assert.equal($('imprimir-relatorio').disabled, true);
    assert.equal(folha().querySelectorAll('.folha-detalhe').length, 0);
    S.newTube({ name: 'Novo sem seleção', solution: 'water' });
    s.activeId = s.tubes[0].id; S.render();
    assert.equal($('imprimir-relatorio').disabled, true);
    assert.ok(!folha().textContent.includes('Novo sem seleção'));
    clicar('relatorio-limpar-btn');
    assert.equal(folha().querySelectorAll('.folha-detalhe').length, 1);

    // Laboratório e missão têm relatórios independentes.
    s.relatorioIds = [s.activeId];
    S.benches.mission = S.criarBancada(); S.usarBancada('mission');
    const tuboMissao = S.newTube({ name: 'Missão isolada' }); S.state.activeId = tuboMissao.id;
    S.render(); assert.equal(S.state.relatorioIds, null);
    assert.ok(folha().textContent.includes('Missão isolada'));
    S.usarBancada('lab'); S.render();
    assert.deepEqual(Array.from(S.state.relatorioIds), [s.activeId]);
    assert.deepEqual(erros, [], 'Nenhum erro de execução nos eventos');
    console.log(`OK: ${largura}px — seleção, toque prolongado, rolagem/cancelamento, teclado, relatório filtrado, pH oculto e bancadas isoladas.`);
  } finally { w.close(); }
}
(async () => { await verificar(1440); await verificar(390); })().catch(erro => { console.error(erro); process.exitCode = 1; });
