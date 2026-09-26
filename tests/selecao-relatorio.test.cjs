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
    assert.equal($('relatorio-imprimir-btn'), null, 'A visão geral não duplica a impressão');
    assert.ok($('imprimir-relatorio').closest('#controls'));
    let impressa;
    w.print = () => {
      w.dispatchEvent(new w.Event('beforeprint'));
      impressa = $('folha-impressao').innerHTML;
      w.dispatchEvent(new w.Event('afterprint'));
    };

    // Clique comum ainda abre o recipiente; Ctrl/Cmd liga seleção sem mudar o foco químico.
    abrir(); clicar(cartao(ids[0])); assert.equal(s.view, 'focus');
    s.activeId = ids[1]; abrir(); clicar(cartao(ids[0]), { ctrlKey: true });
    assert.equal(s.view, 'overview'); assert.equal(s.activeId, ids[1]);
    assert.deepEqual(selecionados(), [ids[0]]);
    assert.equal($('workspace').classList.contains('selecting-tubes'), true);
    clicar(cartao(ids[2]), { metaKey: true });
    assert.deepEqual(selecionados(), [ids[0], ids[2]]);
    // O botão já existente imprime a seleção em andamento, sem confirmação extra.
    if (largura <= 900) clicar('prepare-btn');
    clicar('imprimir-relatorio');
    assert.ok(impressa.includes('Recipientes selecionados (2)'));
    assert.ok(!impressa.includes('Água de controle'));
    if (largura <= 900) clicar('close-controls');
    const antes = JSON.stringify(s.tubes);
    clicar('selecao-relatorio-btn');
    assert.equal(JSON.stringify(s.tubes), antes);
    assert.deepEqual(Array.from(s.relatorioIds), [ids[0], ids[2]]);
    assert.equal($('overview-relatorio').hidden, false);
    assert.equal(d.activeElement.id, 'imprimir-relatorio');
    assert.equal($('controls').inert, false);
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
    clicar('imprimir-relatorio');
    assert.ok(impressa.includes('Recipientes selecionados (2)'));
    assert.ok(!impressa.includes('Água de controle'));
    assert.equal($('folha-impressao').innerHTML, '');
    if (largura <= 900) clicar('close-controls');

    // Revisão, selecionar todos, desmarcar e Cancelar não alteram a escolha confirmada.
    clicar('relatorio-editar-btn'); clicar('selecao-todos-btn');
    assert.equal(selecionados().length, 3);
    clicar('selecao-todos-btn'); assert.equal(selecionados().length, 0);
    assert.equal($('selecao-relatorio-btn').disabled, true);
    assert.equal($('imprimir-relatorio').disabled, true);
    w.dispatchEvent(new w.Event('beforeprint'));
    assert.ok(!$('folha-impressao').querySelector('.folha-detalhe'), 'Ctrl+P com seleção vazia não imprime todos');
    w.dispatchEvent(new w.Event('afterprint'));
    tecla(cartao(ids[1]), 'a', { ctrlKey: true }); assert.equal(selecionados().length, 3);
    clicar(cartao(ids[0])); assert.equal(selecionados().length, 2);
    tecla(cartao(ids[1]), 'Escape');
    assert.deepEqual(Array.from(s.relatorioIds), [ids[0], ids[2]]);
    assert.equal($('selecao-tubos').hidden, true);
    assert.equal(d.activeElement.id, 'selecionar-tubos-btn');

    // Ordem de pH não troca IDs. Renomear e ocultar pH refletem no relatório.
    clicar('relatorio-editar-btn'); clicar('ordenar-ph-btn');
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
    // Com os tubos escolhidos, todos são analisados: nenhum fica destacado no resumo.
    assert.equal(folha().querySelectorAll('.folha-resumo .folha-em-foco').length, 0);
    if (largura <= 900) clicar('close-controls');
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
    // No relatório padrão, a linha do tubo em foco continua destacada (é o tubo detalhado).
    assert.equal(folha().querySelectorAll('.folha-resumo .folha-em-foco').length, 1);

    // Laboratório e missão têm relatórios independentes.
    s.relatorioIds = [s.activeId];
    S.benches.mission = S.criarBancada(); S.usarBancada('mission');
    const tuboMissao = S.newTube({ name: 'Missão isolada' }); S.state.activeId = tuboMissao.id;
    S.render(); assert.equal(S.state.relatorioIds, null);
    assert.ok(folha().textContent.includes('Missão isolada'));
    S.usarBancada('lab'); S.render();
    assert.deepEqual(Array.from(S.state.relatorioIds), [s.activeId]);

    // Vínculos manuais entre amostras diferentes: volume comum, preparos intactos.
    S.benches.lab = S.criarBancada();
    const b = S.state;
    const novos = ['hcl', 'acetic', 'water', 'bicarbonate', 'nacl'].map((solution, i) => S.newTube({
      name: `Amostra ${i + 1}`, solution, titrant: i === 0 ? 'water' : 'naoh',
      indicator: i % 2 ? 'phenol' : 'btb', additions: [.05], dropVolume: i === 1 ? .1 : .02
    }).id);
    const tubo = id => S.state.tubes.find(t => t.id === id);
    const conteudo = t => JSON.stringify({ solution: t.solution, concentration: t.concentration, initialVolume: t.initialVolume,
      dilution: t.dilution, indicator: t.indicator, titrant: t.titrant, titrantConcentration: t.titrantConcentration, additions: t.additions });
    const marcar = lista => {
      S.selecaoTubos.sair(); abrir(); clicar('selecionar-tubos-btn');
      assert.equal(selecionados().length, 0, 'Nova seleção não herda os tubos do relatório');
      lista.forEach(id => clicar(cartao(id)));
    };
    b.activeId = novos[1]; S.render(true);
    const antesVinculo = b.tubes.map(conteudo);
    const phAntes = b.tubes.map(t => S.chem.solve(t).pH);
    marcar(novos.slice(0, 2)); clicar('selecao-vincular-btn');
    const grupo = tubo(novos[0]).group;
    assert.ok(grupo); assert.equal(tubo(novos[1]).group, grupo);
    assert.equal(tubo(novos[2]).group, null);
    assert.deepEqual(b.tubes.map(conteudo), antesVinculo);
    assert.deepEqual(b.tubes.map(t => S.chem.solve(t).pH), phAntes);
    assert.equal(tubo(novos[0]).dropVolume, .1);
    assert.equal($('selecao-vincular-btn').disabled, true);
    assert.match(cartao(novos[0]).querySelector('.overview-group').textContent, /Grupo/);
    assert.equal(b.relatorioIds, null, 'Vincular não confirma nem altera o relatório');
    const depoisVinculo = JSON.stringify(b.tubes);
    clicar('focus-tab');
    assert.match($('group-notice').textContent, /próprio conta-gotas/);
    S.bancada.gotejar(1);
    assert.deepEqual(Array.from(tubo(novos[0]).additions), [.05, .1]);
    assert.deepEqual(Array.from(tubo(novos[1]).additions), [.05, .1]);
    assert.deepEqual(Array.from(tubo(novos[2]).additions), [.05]);
    clicar('undo-btn'); assert.equal(JSON.stringify(b.tubes), depoisVinculo);
    clicar('unlink-btn');
    assert.equal(tubo(novos[0]).group, null); assert.equal(tubo(novos[1]).group, null);
    clicar('undo-btn'); assert.equal(JSON.stringify(b.tubes), depoisVinculo);

    // Trocar o frasco de um tubo não apaga a experiência do parceiro.
    const parceiroAntes = conteudo(tubo(novos[0]));
    b.destination = 'tube'; S.bancada.colocar('lemon');
    assert.equal(tubo(novos[1]).solution, 'lemon');
    assert.equal(conteudo(tubo(novos[0])), parceiroAntes);
    clicar('undo-btn');
    b.level = 'calcular'; S.render(true);
    $('initial-volume').value = '1.3';
    $('drop-volume').value = '0.02';
    $('prepare-form').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    assert.equal(tubo(novos[1]).initialVolume, 1.3);
    assert.equal(tubo(novos[0]).dropVolume, .02);
    assert.equal(conteudo(tubo(novos[0])), parceiroAntes);
    clicar('undo-btn');

    // Reorganizar grupos afeta só os escolhidos; grupos com dois restantes sobrevivem.
    marcar(novos.slice(0, 3)); clicar('selecao-vincular-btn');
    const grupoAntigo = tubo(novos[1]).group;
    marcar([novos[0], novos[3]]); clicar('selecao-vincular-btn');
    assert.notEqual(tubo(novos[0]).group, grupoAntigo);
    assert.equal(tubo(novos[0]).group, tubo(novos[3]).group);
    assert.equal(tubo(novos[1]).group, grupoAntigo);
    assert.equal(tubo(novos[2]).group, grupoAntigo);
    assert.equal(tubo(novos[4]).group, null);
    clicar('selecao-desvincular-btn');
    assert.equal(tubo(novos[0]).group, null); assert.equal(tubo(novos[3]).group, null);
    assert.equal(tubo(novos[1]).group, grupoAntigo);

    // Um recipiente sem espaço interrompe a dose para todo o grupo, sem adição parcial.
    clicar('focus-tab'); b.activeId = novos[1];
    tubo(novos[2]).initialVolume = 4.95; tubo(novos[2]).additions = [];
    S.render(true); const cheios = JSON.stringify(b.tubes);
    assert.equal($('drop-btn').disabled, true);
    assert.equal(S.bancada.gotejar(1), 0);
    assert.equal(JSON.stringify(b.tubes), cheios);
    assert.match($('toast').textContent, /Amostra 3/);
    S.bancada.meiaGota();
    assert.equal(S.chem.solve(tubo(novos[2])).volume, 5);
    assert.equal(tubo(novos[1]).additions.at(-1), .05);

    // Comparar indicadores continua criando cópias com o preparo compartilhado.
    b.activeId = novos[4]; S.render(true); clicar('compare-btn');
    const copias = S.targets(S.current());
    assert.equal(copias.length, 3);
    assert.ok(copias.every(t => !t.groupMode));
    S.bancada.colocar('acetic');
    assert.ok(copias.every(t => t.solution === 'acetic' && !t.additions.length));
    assert.equal(tubo(novos[4]).solution, 'nacl');

    // Missões mantêm suas restrições e continuam acessando a mesma impressão lateral.
    S.bancada.configurar({ modo: 'missao', controles: ['gotas'] }); abrir(); clicar('selecionar-tubos-btn');
    assert.equal($('selecao-vincular-btn').hidden, true);
    assert.equal(S.bancada.vincularTubos(novos.slice(0, 2)), false);
    assert.equal($('imprimir-relatorio').closest('#painel-laboratorio'), null);
    assert.deepEqual(erros, [], 'Nenhum erro de execução nos eventos');
    console.log(`OK: ${largura}px — seleção e gestos, impressão lateral, vínculos manuais, preparos individuais, desfazer, capacidade do grupo e comparação de indicadores.`);
  } finally { w.close(); }
}
(async () => { await verificar(1440); await verificar(390); })().catch(erro => { console.error(erro); process.exitCode = 1; });
