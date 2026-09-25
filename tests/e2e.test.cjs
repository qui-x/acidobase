// Testes de ponta a ponta no Chromium (Playwright): usam o SIAB como um aluno.
// Rodar: npm run test:e2e   (ou: node tests/e2e.test.cjs)
// Sobe um servidor local próprio, porque o service worker exige http(s).
const fs = require('node:fs'), assert = require('node:assert/strict');
const { chromium } = require('playwright');

const { criarServidor } = require('../tools/servidor.cjs');
// sobrescrever['sw.js'] = texto => novoTexto simula a publicação de uma versão nova.
let sobrescrever = {};
const transformar = (caminho, conteudo) => (sobrescrever[caminho] ? Buffer.from(sobrescrever[caminho](conteudo.toString())) : conteudo);
const servidor = () => new Promise(resolve => { const s = criarServidor({ transformar }); s.listen(0, '127.0.0.1', () => resolve(s)); });

const resultados = [];
const errosConsole = [];
let testeAtual = '(abertura)';
async function teste(nome, fn) {
  testeAtual = nome;
  const inicio = Date.now();
  try {
    await fn();
    resultados.push({ nome, ok: true, ms: Date.now() - inicio });
    console.log(`  ✓ ${nome}`);
  } catch (erro) {
    resultados.push({ nome, ok: false, erro });
    console.log(`  ✗ ${nome}\n    ${String(erro.stack || erro).split('\n').slice(0, 4).join('\n    ')}`);
  }
}

(async () => {
  const server = await servidor();
  const BASE = `http://127.0.0.1:${server.address().port}/index.html`;
  const browser = await chromium.launch();

  // modo 'completo' liga missões, desafios e professor (o padrão do programa é 'bancada').
  async function novaPagina(opcoes = {}, modo = 'completo') {
    const context = await browser.newContext({ viewport: { width: 1360, height: 900 }, acceptDownloads: true, ...opcoes });
    // A animação de abertura tem testes próprios; nos demais, fica desligada.
    await context.addInitScript(() => { try { localStorage.setItem('siab_abertura', 'off'); } catch (erro) { /* sem armazenamento */ } });
    if (modo === 'completo') await context.addInitScript(() => { try { localStorage.setItem('siab_modo', 'completo'); } catch (erro) { /* sem armazenamento */ } });
    const page = await context.newPage();
    page.on('console', m => { if (m.type() === 'error') errosConsole.push(`[${testeAtual}] ${m.text()} (${page.url()})`); });
    page.on('pageerror', e => errosConsole.push(`[${testeAtual}] [pageerror] ${e.message}`));
    page.on('dialog', d => { errosConsole.push(`diálogo nativo usado: ${d.message()}`); d.dismiss(); });
    await page.goto(BASE);
    await page.waitForFunction(() => window.SIAB && SIAB.rota.nome);
    return { context, page };
  }
  const ir = (page, rota) => page.evaluate(r => { location.hash = r; }, rota).then(() => page.waitForFunction(r => location.hash === r && SIAB.rota.nome, rota));
  const texto = (page, seletor) => page.locator(seletor).first().textContent().then(x => x.trim());
  const estado = (page, fn, arg) => page.evaluate(fn, arg);
  // Escolhe um frasco nos menus recolhíveis da prateleira (Tubo ou Conta-gotas):
  // abre o menu, abre o grupo do frasco e toca nele.
  const frasco = async (pg, id, destino = 'tube') => {
    const menu = destino === 'tube' ? '#menu-tubo' : '#menu-gotas';
    if (await pg.getAttribute(menu, 'aria-expanded') !== 'true') await pg.click(menu);
    await pg.evaluate(x => { document.querySelector(`#shelf [data-solution="${x}"]`).closest('details').open = true; }, id);
    await pg.click(`#shelf [data-solution="${id}"]`);
  };
  // Abre o cartão de um módulo e toca em "Ativar módulo".
  const modulo = async (pg, id) => {
    if (await pg.getAttribute(`#modulo-cab-${id}`, 'aria-expanded') !== 'true') await pg.click(`#modulo-cab-${id}`);
    await pg.click(`#modulos [data-nivel="${id}"]`);
  };

  /* ------------------------------------------------------------------ */
  console.log('Modo completo · navegação e telas');
  const { context: ctxA, page } = await novaPagina();

  await teste('início mostra quatro caminhos e o título correto', async () => {
    assert.equal(await page.locator('.caminho').count(), 4);
    assert.equal(await page.title(), 'SIAB — A química das cores');
    assert.match(await texto(page, '#meta-aprender'), /0 de 14 missões/);
  });
  await teste('menu principal troca de tela e marca a seção atual', async () => {
    for (const [link, secao, titulo] of [['aprender', 'aprender', 'Trilhas de missões'], ['desafios', 'desafios', 'Jogos de ácidos e bases'], ['professor', 'professor', 'Montar aula'], ['laboratorio', 'bancada', null]]) {
      await page.click(`.main-nav a[data-nav="${link}"]`);
      await page.waitForFunction(s => !document.querySelector(`main > [data-tela="${s}"]`).hidden, secao);
      assert.equal(await page.getAttribute(`.main-nav a[data-nav="${link}"]`, 'aria-current'), 'page');
      if (titulo) assert.equal(await texto(page, `main > [data-tela="${secao}"] h1`), titulo);
      const visiveis = await page.locator('main > [data-tela]:not([hidden])').count();
      assert.equal(visiveis, 1, 'só uma tela visível');
    }
  });
  await teste('botão voltar do navegador retorna à tela anterior', async () => {
    await ir(page, '#/aprender');
    await ir(page, '#/desafios');
    await page.goBack();
    await page.waitForFunction(() => SIAB.rota.nome === 'aprender');
  });
  await teste('endereços inválidos voltam ao início ou à lista, sem erro', async () => {
    for (const rota of ['#/__proto__', '#/desafio/__proto__', '#/missao/constructor', '#/aula/desafio:__proto__']) {
      await page.evaluate(r => { location.hash = r; }, rota);
      await page.waitForTimeout(150);
      assert.equal(await page.locator('main > [data-tela]:not([hidden])').count(), 1, rota);
    }
  });
  await teste('trilhas listam 4 trilhas e 19 itens (14 missões e 5 desafios)', async () => {
    await ir(page, '#/aprender');
    assert.equal(await page.locator('.trilha').count(), 4);
    assert.equal(await page.locator('.item-trilha').count(), 19);
  });

  /* ------------------------------------------------------------------ */
  console.log('Laboratório');
  await ir(page, '#/laboratorio');
  const t = () => estado(page, () => { const x = SIAB.current(); const r = SIAB.chem.solve(x); return { nome: x.name, sol: x.solution, gotas: x.additions.length, pH: r.pH, ind: x.indicator, tit: x.titrant, vol: r.volume }; });

  await teste('bancada começa vazia e o primeiro frasco cria o Tubo 1', async () => {
    assert.equal(await estado(page, () => SIAB.state.tubes.length), 0);
    assert.equal(await page.locator('#tube-list button').count(), 0);
    assert.equal(await page.isVisible('#bancada-vazia'), true);
    for (const escondido of ['#drop-btn', '#tube-name', '#indicator-group', '#remove-btn']) assert.equal(await page.isVisible(escondido), false, escondido);
    assert.equal(await texto(page, '#tube-count'), '0 / 10');
    assert.match(await texto(page, '#ver-conteudo'), /Coloque um frasco num tubo/);
    await page.click('#vazia-prateleira');
    assert.equal(await estado(page, () => document.activeElement.id), 'shelf-search');
    assert.equal(await page.getAttribute('#menu-tubo', 'aria-expanded'), 'true', '"Escolher um frasco" abre o menu Tubo');
    await frasco(page, 'lemon');
    assert.equal(await texto(page, '#tube-name'), 'Tubo 1');
    assert.equal(await page.isVisible('#bancada-vazia'), false);
    assert.equal((await t()).ind, 'none');
    // Conta-gotas com bicarbonato e indicador de repolho roxo, como na aula.
    await frasco(page, 'bicarbonate', 'titrant');
    await page.check('#indicator-chips input[value="cabbage"]', { force: true });
    const x = await t();
    assert.deepEqual([x.sol, x.tit, x.ind], ['lemon', 'bicarbonate', 'cabbage']);
    assert.match(await texto(page, '#ph-value'), /≈ 2,/);
    await page.click('#add-tube-btn');
    await page.click('#add-tube-btn');
    assert.equal(await page.locator('#tube-list button').count(), 3);
    await page.click('#tube-list [data-tube="1"]');
  });
  await teste('segurar o conta-gotas goteja várias vezes; soltar para', async () => {
    await page.locator('#drop-btn').scrollIntoViewIfNeeded();
    const box = await page.locator('#drop-btn').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(1200);
    await page.mouse.up();
    const depois = (await t()).gotas;
    assert.ok(depois >= 4, `esperava várias gotas, veio ${depois}`);
    await page.waitForTimeout(500);
    assert.equal((await t()).gotas, depois, 'continuou gotejando depois de soltar');
  });
  await teste('desfazer volta a sequência inteira de gotas', async () => {
    await page.click('#undo-btn');
    assert.equal((await t()).gotas, 0);
  });
  await teste('toque simples adiciona exatamente 1 gota', async () => {
    await page.click('#drop-btn');
    await page.waitForTimeout(350);
    assert.equal((await t()).gotas, 1);
  });
  await teste('teclado: Enter adiciona 1 gota; segurar Espaço goteja', async () => {
    await page.focus('#drop-btn');
    await page.keyboard.press('Enter');
    assert.equal((await t()).gotas, 2);
    await page.keyboard.down(' ');
    await page.waitForTimeout(900);
    await page.keyboard.up(' ');
    assert.ok((await t()).gotas >= 4);
  });
  await teste('atalhos +5 gotas e +1 mL', async () => {
    const antes = (await t()).gotas;
    await page.click('#drop5-btn');
    assert.equal((await t()).gotas, antes + 5);
    await page.click('#drop1ml-btn');
    assert.equal((await t()).gotas, antes + 25);
  });
  await teste('gota animada: conta-gotas aparece, a gota cai e some; o desenho é atualizado, não recriado', async () => {
    // Espera as gotas do teste anterior (+1 mL) terminarem de cair.
    await page.waitForFunction(() => !document.querySelector('#large-tube .gota-caindo, #large-tube .nuvem-cor') && !document.querySelector('#large-tube').classList.contains('pingando'), null, { timeout: 5000 });
    await page.waitForTimeout(400);
    const svg = await page.evaluateHandle(() => document.querySelector('#large-tube svg'));
    const nivel = () => estado(page, () => getComputedStyle(document.querySelector('#large-tube .liquido')).transform);
    const antes = await nivel();
    await page.focus('#drop-btn');
    await page.keyboard.press('Enter');
    assert.equal(await estado(page, () => document.querySelector('#large-tube').classList.contains('pingando')), true, 'conta-gotas visível');
    assert.equal(await estado(page, () => document.querySelectorAll('#large-tube .gota-caindo').length), 1);
    assert.equal(await page.evaluate(x => x === document.querySelector('#large-tube svg'), svg), true, 'o mesmo desenho continua');
    // O nível só muda quando a gota chega; depois, os efeitos somem sozinhos.
    assert.equal(await nivel(), antes);
    await page.waitForFunction(a => getComputedStyle(document.querySelector('#large-tube .liquido')).transform !== a, antes, { timeout: 2000 });
    await page.waitForFunction(() => !document.querySelector('#large-tube .gota-caindo, #large-tube .onda, #large-tube .nuvem-cor, #large-tube .respingo'), null, { timeout: 3000 });
    await page.waitForFunction(() => !document.querySelector('#large-tube').classList.contains('pingando'));
    // +5 gotas: as gotas caem em sequência, não todas juntas.
    await page.click('#drop5-btn');
    const atrasos = await estado(page, () => [...document.querySelectorAll('#large-tube .gota-caindo')].map(g => g.getAnimations()[0]?.effect.getTiming().delay));
    assert.ok(atrasos.length >= 2 && new Set(atrasos).size === atrasos.length, `atrasos ${atrasos}`);
    // Com "Reduzir animações", nenhuma gota é desenhada.
    await page.waitForTimeout(1200);
    await page.evaluate(() => A11Y.definir('motion', true));
    await page.focus('#drop-btn');
    await page.keyboard.press('Enter');
    assert.equal(await estado(page, () => document.querySelectorAll('#large-tube .gota-caindo').length), 0);
    await page.evaluate(() => A11Y.definir('motion', false));
  });
  await teste('chip de variação do pH aparece depois das gotas', async () => {
    assert.equal(await page.isVisible('#ph-delta'), true);
    assert.match(await texto(page, '#ph-delta'), /→/);
  });
  await teste('prateleira: frasco vai para o tubo, gotas recomeçam e Desfazer restaura', async () => {
    await frasco(page, 'vinegar');
    let x = await t();
    assert.equal(x.sol, 'vinegar');
    assert.equal(x.gotas, 0);
    assert.match(await texto(page, '#toast'), /Vinagre branco no tubo/);
    await page.click('#undo-btn');
    x = await t();
    assert.equal(x.sol, 'lemon');
    assert.ok(x.gotas > 0);
  });
  await teste('prateleira: menus Tubo e Conta-gotas recolhíveis', async () => {
    // Fechados, mostram o frasco em uso e a lista não aparece.
    assert.equal(await page.isVisible('#shelf'), false);
    assert.match(await texto(page, '#menu-tubo'), /Tubo.*Suco de limão/s);
    assert.match(await texto(page, '#menu-gotas'), /Conta-gotas.*Bicarbonato/s);
    // Abrir o Conta-gotas: a lista vai para baixo dele e só o grupo do frasco em uso abre.
    await page.click('#menu-gotas');
    assert.equal(await page.getAttribute('#menu-gotas', 'aria-expanded'), 'true');
    assert.equal(await page.getAttribute('#menu-tubo', 'aria-expanded'), 'false');
    assert.equal(await estado(page, () => document.querySelector('#menu-frasco-corpo').parentElement.contains(document.querySelector('#menu-gotas'))), true);
    assert.deepEqual(await estado(page, () => [...document.querySelectorAll('#shelf details[open]')].map(d => d.dataset.grupo)), ['home']);
    // Tocar no frasco coloca no conta-gotas, fecha o menu e devolve o foco ao cabeçalho.
    await frasco(page, 'naoh', 'titrant');
    const x = await t();
    assert.equal(x.tit, 'naoh');
    assert.match(await texto(page, '#titrant-label'), /NaOH/);
    assert.equal(await page.getAttribute('#menu-gotas', 'aria-expanded'), 'false');
    assert.equal(await page.isVisible('#shelf'), false);
    assert.equal(await estado(page, () => document.activeElement.id), 'menu-gotas');
    assert.match(await texto(page, '#menu-gotas'), /Hidróxido de sódio/);
    // Esc fecha o menu aberto.
    await page.click('#menu-tubo');
    await page.keyboard.press('Escape');
    assert.equal(await page.getAttribute('#menu-tubo', 'aria-expanded'), 'false');
    assert.equal(await estado(page, () => document.activeElement.id), 'menu-tubo');
  });
  await teste('busca da prateleira sem acentos encontra "Suco de limão" e abre o grupo', async () => {
    await page.click('#menu-tubo');
    await page.fill('#shelf-search', 'limao');
    assert.equal(await page.locator('#shelf .bottle').count(), 1);
    assert.match(await texto(page, '#shelf .bottle'), /Suco de limão/);
    assert.equal(await page.isVisible('#shelf .bottle'), true, 'o grupo com resultado se abre sozinho');
    await page.fill('#shelf-search', '');
    await page.click('#menu-tubo');
    assert.equal(await page.inputValue('#shelf-search'), '', 'fechar limpa a busca');
  });
  await teste('módulos: cartões recolhíveis; Explorar esconde ajustes; Medir mostra volume; Calcular mostra concentração', async () => {
    assert.equal(await page.isVisible('#ajustes'), false);
    assert.equal(await page.locator('#modulos .modulo').count(), 3);
    assert.equal(await page.isVisible('#modulos .modulo-corpo'), false, 'começam recolhidos');
    assert.equal(await page.isVisible('#modulos [data-modulo="explorar"] .modulo-ativo'), true);
    assert.equal(await page.isVisible('#modulos [data-modulo="medir"] .modulo-ativo'), false);
    // Abrir um cartão só mostra o que o módulo oferece; ativar é outro toque.
    await page.click('#modulo-cab-medir');
    assert.equal(await page.isVisible('#modulo-corpo-medir'), true);
    assert.match(await texto(page, '#modulo-corpo-medir .fact-grid'), /equivalência/);
    assert.equal(await estado(page, () => SIAB.state.level), 'explorar');
    await page.click('#modulos [data-nivel="medir"]');
    assert.equal(await estado(page, () => SIAB.state.level), 'medir');
    assert.equal(await page.getAttribute('#modulos [data-nivel="medir"]', 'aria-pressed'), 'true');
    assert.equal(await page.isVisible('#modulos [data-modulo="medir"] .modulo-ativo'), true);
    assert.equal(await texto(page, '#bench-mode'), 'MÓDULO · MEDIR');
    assert.equal(await page.isVisible('#initial-volume'), true);
    await frasco(page, 'hcl');
    assert.equal(await page.isVisible('#concentration'), false);
    // Um só cartão aberto por vez.
    await modulo(page, 'calcular');
    assert.equal(await page.isVisible('#modulo-corpo-medir'), false);
    assert.equal(await page.isVisible('#concentration'), true);
    await page.click('#modulo-cab-calcular');
    assert.equal(await page.isVisible('#modulos .modulo-corpo'), false);
  });
  await teste('ajustes: volume inválido mostra erro no formulário', async () => {
    await page.fill('#initial-volume', '9');
    await page.click('#prepare-form button[type="submit"]');
    assert.match(await texto(page, '#prepare-error'), /entre 0,1 e 4 mL/);
    assert.equal(await page.getAttribute('#initial-volume', 'aria-invalid'), 'true');
  });
  await teste('titulação HCl + NaOH chega à equivalência com pH 7,00', async () => {
    await page.fill('#initial-volume', '1');
    await page.fill('#concentration', '0.01');
    await page.fill('#titrant-concentration', '0.01');
    await page.click('#prepare-form button[type="submit"]');
    await page.check('#indicator-chips input[value="btb"]', { force: true });
    for (let i = 0; i < 4; i++) await page.click('#drop5-btn');
    assert.equal(await texto(page, '#ph-value'), '7,00');
    assert.match(await texto(page, '#equivalence-note'), /Ponto de equivalência/);
    assert.equal(await texto(page, '#color-name'), 'verde');
  });
  await teste('VER · gráfico tem um ponto por gota e marca a equivalência', async () => {
    await page.click('#tab-grafico');
    const pontos = await page.getAttribute('.grafico-linha', 'points');
    assert.equal(pontos.trim().split(/\s+/).length, 21);
    assert.equal(await page.locator('.grafico-equivalencia').count(), 1);
    assert.equal(await page.locator('.grafico-faixa').count(), 1);
  });
  await teste('VER · partículas, equação e histórico', async () => {
    await page.click('#tab-particulas');
    assert.match(await texto(page, '.lupa-legenda'), /Na⁺/);
    await page.click('#tab-equacao');
    assert.match(await texto(page, '.equacao'), /HCl \+ NaOH → NaCl \+ H₂O/);
    assert.match(await texto(page, '.equacao'), /\[H₃O⁺\]/);
    await page.click('#tab-historico');
    assert.equal(await page.locator('#ver-conteudo tbody tr').count(), 20);
  });
  await teste('VER · baixar CSV do histórico', async () => {
    const [download] = await Promise.all([page.waitForEvent('download'), page.click('#ver-conteudo [data-acao="csv"]')]);
    const conteudo = fs.readFileSync(await download.path(), 'utf8');
    assert.match(conteudo, /gota;volume_adicionado_mL;pH;cor/);
    assert.match(conteudo, /20;1,00;7,00;verde/);
  });
  await teste('abas VER respondem às setas do teclado', async () => {
    await page.focus('#tab-historico');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.getAttribute('#tab-grafico', 'aria-selected'), 'true');
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.getAttribute('#tab-historico', 'aria-selected'), 'true');
  });
  await teste('registrar leitura no caderno guarda a tabela de gotas como tabela', async () => {
    await page.click('#ver-conteudo [data-acao="registrar"]');
    const nota = await estado(page, () => SIAB.progresso.dados.caderno.find(n => n.tipo === 'leitura'));
    assert.ok(nota);
    assert.deepEqual(nota.tabela.colunas, ['Gota', 'Adicionado (mL)', 'pH', 'Cor']);
    assert.equal(nota.tabela.linhas.length, await estado(page, () => SIAB.current().additions.length + 1));
    assert.ok(nota.tabela.linhas.every(l => l.length === 4));
    assert.ok(!nota.linhas.some(([campo]) => campo === 'Tabela'));
  });
  await teste('ocultar pH esconde leitura, régua e gráfico', async () => {
    await page.click('#ph-toggle');
    assert.equal(await texto(page, '#ph-value'), '—');
    await page.click('#tab-grafico');
    assert.match(await texto(page, '#ver-conteudo'), /quando o pH é revelado/);
    await page.click('#ph-toggle');
  });
  await teste('prever e gotejar (POE) registra previsão, resultado e explicação', async () => {
    await page.click('#restart-btn');
    await page.click('#poe-btn');
    await page.check('input[name="poe-gotas"][value="10"]', { force: true });
    await page.check('input[name="poe-meio"][value="Neutra"]', { force: true });
    await page.fill('#poe-porque', 'Metade do ácido');
    await page.click('#poe-form button[type="submit"]');
    assert.match(await texto(page, '#poe-comparacao'), /Você previu[\s\S]*Resultado/);
    assert.match(await texto(page, '#poe-comparacao'), /ácida/);
    await page.fill('#poe-explicacao', 'Só metade do HCl foi neutralizada.');
    await page.click('#poe-resultado button[type="submit"]');
    const nota = await estado(page, () => SIAB.progresso.dados.caderno.find(n => n.tipo === 'previsao'));
    assert.ok(nota.linhas.some(([r, v]) => r === 'Explicação' && v.includes('metade')));
    assert.equal((await t()).gotas, 10);
  });
  await teste('indicador e realce de cor', async () => {
    await page.click('#tube-list button:nth-child(2)');
    await page.check('#indicator-chips input[value="phenol"]', { force: true });
    assert.equal((await t()).ind, 'phenol');
    assert.match(await texto(page, '#indicator-name'), /Fenolftaleína/);
  });
  await teste('renomear aceita caracteres especiais como texto', async () => {
    await page.click('#rename-btn');
    await page.fill('#new-name', '<b>Teste & 1</b>');
    await page.click('#rename-form button[type="submit"]');
    assert.equal(await texto(page, '#tube-name'), '<b>Teste & 1</b>');
    assert.equal(await page.locator('#tube-name b').count(), 0);
    await page.click('#rename-btn');
    await page.fill('#new-name', '   ');
    await page.click('#rename-form button[type="submit"]');
    assert.match(await texto(page, '#rename-error'), /1 a 40 caracteres/);
    await page.click('#rename-dialog [data-close="rename-dialog"] >> nth=0');
  });
  await teste('comparar indicadores cria 3 tubos vinculados que recebem a mesma gota', async () => {
    await page.click('#compare-btn');
    const grupo = await estado(page, () => SIAB.targets(SIAB.current()).map(x => x.indicator).join(','));
    assert.equal(grupo, 'btb,phenol,universal');
    await page.click('#drop5-btn');
    const gotas = await estado(page, () => SIAB.targets(SIAB.current()).map(x => x.additions.length).join(','));
    const [a, b, c] = gotas.split(',').map(Number);
    assert.ok(a === b && b === c && a >= 5);
  });
  await teste('desvincular e remover tubo (com confirmação) e desfazer a remoção', async () => {
    await page.click('#unlink-btn');
    assert.equal(await estado(page, () => SIAB.current().group), null);
    const antes = await page.locator('#tube-list button').count();
    await page.click('#remove-btn');
    assert.equal(await page.isVisible('#confirm-dialog'), true);
    await page.click('#confirm-yes');
    assert.equal(await page.locator('#tube-list button').count(), antes - 1);
    await page.click('#undo-btn');
    assert.equal(await page.locator('#tube-list button').count(), antes);
  });
  await teste('limite de 10 tubos desativa "Novo tubo"', async () => {
    while ((await page.locator('#tube-list button').count()) < 10) await page.click('#add-tube-btn');
    assert.equal(await page.isDisabled('#add-tube-btn'), true);
  });
  await teste('visão geral mostra miniaturas e abre um tubo', async () => {
    await page.click('#overview-tab');
    assert.equal(await page.locator('.overview-tube').count(), 10);
    await page.click('.overview-tube >> nth=0');
    assert.equal(await page.isVisible('#focus-view'), true);
    assert.equal(await texto(page, '#tube-name'), await estado(page, () => SIAB.state.tubes[0].name));
  });

  /* ------------------------------------------------------------------ */
  console.log('Missões (14), pela interface');
  const ids = await estado(page, () => SIAB.missoes.map(m => m.id));
  for (const id of ids) {
    await teste(`missão ${id}`, async () => {
      await ir(page, `#/missao/${id}`);
      for (let volta = 0; volta < 30; volta++) {
        const info = await estado(page, () => {
          const a = SIAB.motor.ativa;
          if (a.concluida) return { fim: true };
          const p = SIAB.motor.passo();
          return { tipo: p.tipo, id: p.id, porTubo: Boolean(p.porTubo), gabarito: SIAB.motor.gabarito(p), correta: p.correta, tubos: SIAB.state.tubes.map(x => ({ id: x.id, nome: x.name })) };
        });
        if (info.fim) break;
        if (info.tipo === 'prever') {
          if (info.porTubo) {
            for (const tb of info.tubos) await page.check(`input[name="prever-${info.id}-${tb.id}"][value="${info.gabarito[tb.nome]}"]`, { force: true });
          } else {
            await page.check(`input[name="prever-${info.id}"][value="${info.gabarito}"]`, { force: true });
          }
        }
        if (info.tipo === 'agir') {
          assert.equal(await page.isDisabled('#passo-avancar'), true, 'agir começa bloqueado');
          await page.click('#passo-demo');
          await page.waitForFunction(() => !document.querySelector('#passo-avancar').disabled);
          assert.match(await texto(page, '#agir-status'), /Feito/);
        }
        if (info.tipo === 'explicar') {
          await page.fill('#explicar-texto', 'Explicação do aluno com as partículas.');
          await page.click('#passo-avancar');
          assert.equal(await page.isVisible('.modelo'), true, 'resposta modelo aparece depois de salvar');
        }
        if (info.tipo === 'quiz') {
          await page.check(`input[name="quiz-${info.id}"][value="${info.correta}"]`, { force: true });
          await page.click('#passo-avancar');
          assert.match(await texto(page, '.quiz-feedback'), /Correto/);
        }
        await page.click('#passo-avancar');
      }
      assert.match(await texto(page, '#painel-missao'), /MISSÃO CONCLUÍDA/);
      assert.ok(!(await texto(page, '.resumo-missao')).includes('✗'));
      assert.ok(await estado(page, i => SIAB.progresso.missao(i)?.concluida, id));
    });
  }
  await teste('missão: ações reais na bancada (sem demonstração)', async () => {
    // Três indicadores: segurar o conta-gotas até a fenolftaleína ficar rosa.
    await ir(page, '#/missao/tres-indicadores');
    await page.click('#missao-refazer').catch(() => {});
    await page.waitForFunction(() => SIAB.motor.passo()?.tipo === 'ler');
    await page.click('#passo-avancar');
    await page.check('input[name="prever-ordem"][value="Alaranjado de metila"]', { force: true });
    await page.click('#passo-avancar');
    for (let i = 0; i < 4; i++) await page.click('#drop5-btn');
    assert.equal(await page.isDisabled('#passo-avancar'), true, 'com 20 gotas a fenolftaleína ainda é incolor');
    await page.focus('#drop-btn');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => !document.querySelector('#passo-avancar').disabled);
    assert.match(await texto(page, '#agir-status'), /rosa/);
    // Temperatura: o controle deslizante muda Kw.
    await ir(page, '#/missao/temperatura');
    await page.click('#missao-refazer').catch(() => {});
    await page.click('#passo-avancar');
    await page.check('input[name="prever-quente"][value="fica menor que 7, e a água continua neutra"]', { force: true });
    await page.click('#passo-avancar');
    await page.fill('#missao-temp', '60');
    await page.waitForFunction(() => !document.querySelector('#passo-avancar').disabled);
    assert.equal(await texto(page, '#ph-value'), '6,51');
    assert.equal(await texto(page, '#ph-phase'), 'Neutra');
    assert.match(await texto(page, '#temperature-value'), /60 °C/);
    // Cor que engana: a caixa "Realçar indicador" do cartão.
    await ir(page, '#/missao/cor-que-engana');
    await page.click('#missao-refazer').catch(() => {});
    await page.click('#passo-avancar');
    await page.check('input[name="prever-olhar"][value="Não, a cor própria atrapalha a leitura"]', { force: true });
    await page.click('#passo-avancar');
    await page.check('#missao-realcar');
    await page.waitForFunction(() => !document.querySelector('#passo-avancar').disabled);
    assert.equal(await texto(page, '#color-name'), 'violeta');
  });
  await teste('missão: prever exige resposta; explicar exige texto', async () => {
    await ir(page, '#/missao/ionizacao');
    await page.click('#missao-refazer').catch(() => {});
    await page.click('#passo-avancar');
    await page.click('#passo-avancar');
    assert.match(await texto(page, '#missao-erro'), /Escolha uma opção/);
  });
  await teste('trilhas mostram as 14 missões concluídas', async () => {
    await ir(page, '#/aprender');
    assert.equal(await page.locator('.item-trilha.feito[href^="#/missao/"]').count(), 14);
    await ir(page, '#/inicio');
    assert.match(await texto(page, '#meta-aprender'), /14 de 14/);
  });

  /* ------------------------------------------------------------------ */
  console.log('Desafios');
  await teste('detetive: três amostras, testes com indicadores e pontuação', async () => {
    await ir(page, '#/desafio/detetive');
    for (let rodada = 0; rodada < 3; rodada++) {
      await page.click('[data-testar="methyl"]');
      await page.click('[data-testar="phenol"]');
      assert.equal(await page.locator('.detetive-resultados li').count(), 2);
      const real = await estado(page, () => SIAB.desafios.detetive.jogo.amostras[SIAB.desafios.detetive.jogo.rodada].pH);
      const [a, b] = await estado(page, () => { const j = SIAB.desafios.detetive.jogo; return j.testes.reduce(([x, y], t) => [Math.max(x, t.faixa[0]), Math.min(y, t.faixa[1])], [0, 14]); });
      assert.ok(real >= a - 1e-9 && real <= b + 1e-9, `pH ${real} fora da faixa ${a}–${b}`);
      await page.fill('#detetive-palpite', String(Math.round(real * 10) / 10));
      await page.click('[data-acao="responder"]');
      assert.match(await texto(page, '#detetive-feedback'), /100 pontos/);
      await page.click('[data-acao="proxima"]');
    }
    assert.match(await texto(page, '.jogo-painel.fim h2'), /300 de 300/);
    assert.equal(await estado(page, () => SIAB.progresso.desafio('detetive').recorde), 300);
  });
  await teste('titulação: cálculo, indicador e parada na equivalência', async () => {
    await ir(page, '#/desafio/titulacao');
    const eq = await estado(page, () => SIAB.desafios.titulacao.jogo.eq);
    await page.fill('#tit-volume', String(eq).replace('.', ','));
    await page.click('[data-acao="calculo"]');
    const melhor = await estado(page, () => ['methyl', 'btb', 'phenol'].map(i => ({ i, v: SIAB.desafios.titulacao.viragem(i) })).map(o => ({ ...o, e: o.v === null ? 99 : Math.abs(o.v - SIAB.desafios.titulacao.jogo.eq) })).sort((x, y) => x.e - y.e)[0].i);
    await page.click(`[data-indicador="${melhor}"]`);
    const gotas = Math.round(eq / .05);
    await page.focus('#tit-gota');
    for (let i = 0; i < gotas; i++) await page.keyboard.press('Enter');
    await page.click('[data-acao="parar"]');
    const pontos = await estado(page, () => { const p = SIAB.desafios.titulacao.jogo.pontos; return p.calculo + p.indicador + p.titulacao; });
    assert.ok(pontos >= 90, `pontuação ${pontos}`);
    assert.equal(await page.locator('#tit-resultado .grafico-teorica').count(), 1);
  });
  await teste('super trunfo: duelo até o fim', async () => {
    await ir(page, '#/desafio/trunfo');
    await page.click('[data-acao="duelo"]');
    for (let i = 0; i < 40; i++) {
      if (await estado(page, () => SIAB.desafios.trunfo.jogo.fim)) break;
      if (await page.locator('[data-acao="proxima"]').count()) await page.click('[data-acao="proxima"]');
      else await page.click('[data-atributo] >> nth=0');
    }
    assert.equal(await estado(page, () => SIAB.desafios.trunfo.jogo.fim), true);
  });
  await teste('super trunfo: classificar 6 cartas', async () => {
    await page.click('[data-acao="menu"]');
    await page.click('[data-acao="classificar"]');
    for (let i = 0; i < 40; i++) {
      if (await estado(page, () => SIAB.desafios.trunfo.jogo.fim)) break;
      await page.click('[data-classe] >> nth=0');
      assert.equal(await page.isVisible('#classificar-feedback'), true);
      await page.click('[data-acao="proxima-classe"]');
    }
    assert.match(await texto(page, '.jogo-painel.fim h2'), /acertos/);
  });
  await teste('super trunfo: memória com todos os pares = 100 pontos', async () => {
    await page.click('[data-acao="menu"]');
    await page.click('[data-acao="memoria"]');
    const pares = await estado(page, () => { const g = {}; SIAB.desafios.trunfo.jogo.pecas.forEach(p => { (g[p.par] = g[p.par] || []).push(p.indice); }); return Object.values(g); });
    for (const [a, b] of pares) { await page.click(`[data-peca="${a}"]`); await page.click(`[data-peca="${b}"]`); }
    assert.match(await texto(page, '.jogo-painel.fim h2'), /100 pontos/);
  });
  await teste('régua do pH: palpites exatos = 100 pontos e comparação logarítmica', async () => {
    await ir(page, '#/desafio/regua');
    const reais = await estado(page, () => SIAB.desafios.regua.jogo.amostras.map(a => a.pH));
    for (let i = 0; i < reais.length; i++) await page.fill(`[data-palpite="${i}"]`, String(Math.round(reais[i] * 2) / 2));
    await page.click('[data-acao="revelar"]');
    const pontos = await estado(page, () => SIAB.desafios.regua.jogo.pontos);
    assert.ok(pontos >= 90, `pontos ${pontos}`);
    await page.check('input[name="regua-b"][value="2"]', { force: true });
    assert.match(await texto(page, '.comparacao-resultado'), /vezes/);
  });
  await teste('construtor: 5 reações certas = 100 pontos', async () => {
    await ir(page, '#/desafio/construtor');
    for (let r = 0; r < 5; r++) {
      const par = await estado(page, () => { const j = SIAB.desafios.construtor.jogo; return { h: j.par.acido.h, oh: j.par.base.oh, ...j.par.reacao }; });
      await page.click(`[data-resposta="${par.h}"]`); await page.click('[data-acao="continuar"]');
      await page.click(`[data-resposta="${par.oh}"]`); await page.click('[data-acao="continuar"]');
      await page.fill('#coef-acido', String(par.coefAcido));
      await page.fill('#coef-base', String(par.coefBase));
      await page.fill('#coef-agua', String(par.agua));
      await page.click('[data-acao="coef"]'); await page.click('[data-acao="continuar"]');
      await page.locator(`[data-resposta="${par.sal}"]`).click(); await page.click('[data-acao="continuar"]');
      await page.locator(`[data-resposta="${par.nomeSal}"]`).click(); await page.click('[data-acao="continuar"]');
      assert.match(await texto(page, '#construtor-final'), /→/);
      await page.click('[data-acao="proxima"]');
    }
    assert.match(await texto(page, '.jogo-painel.fim h2'), /100 de 100/);
  });
  await teste('construtor: treino com neutralização parcial (H₃PO₄ + NaOH)', async () => {
    await page.click('[data-modo="treino"]');
    await page.check('input[name="treino-acido"][value="h3po4"]', { force: true });
    await page.check('input[name="treino-base"][value="naoh"]', { force: true });
    await page.check('#treino-parcial');
    await page.click('[data-acao="montar"]');
    const sal = await estado(page, () => SIAB.desafios.construtor.jogo.par.reacao.sal);
    assert.ok(['NaH₂PO₄', 'Na₂HPO₄'].includes(sal));
  });
  await teste('lista de desafios mostra recordes', async () => {
    await ir(page, '#/desafios');
    assert.equal(await page.locator('#desafios-lista .cartao').count(), 5);
    assert.match(await texto(page, '#desafios-lista'), /Recorde: 300 pontos/);
  });

  /* ------------------------------------------------------------------ */
  console.log('Professor, caderno e acessibilidade');
  await teste('professor: montar aula, link e sequência', async () => {
    await ir(page, '#/professor');
    await page.click('#aula-form button[type="submit"]');
    assert.match(await texto(page, '#aula-erro'), /pelo menos uma/);
    await page.check('input[name="aula-item"][value="missao:tampao"]');
    await page.check('input[name="aula-item"][value="desafio:regua"]');
    await page.click('#aula-form button[type="submit"]');
    assert.match(await page.inputValue('#aula-url'), /#\/aula\/desafio:regua,missao:tampao$/);
    await page.click('#abrir-aula');
    await page.waitForFunction(() => SIAB.rota.nome === 'aula');
    assert.equal(await page.locator('#aula-sequencia .item-trilha').count(), 2);
  });
  await teste('professor: gabaritos e roteiro impresso', async () => {
    await ir(page, '#/professor');
    assert.equal(await page.locator('.gabarito').count(), 14);
    await page.evaluate(() => { window.print = () => { window.__impresso = true; }; });
    await page.click('#imprimir-roteiro');
    assert.ok(await estado(page, () => window.__impresso));
    assert.match(await page.locator('#roteiro-impressao').innerHTML(), /Roteiro de aula/);
  });
  await teste('modo projetor aumenta a fonte e fica salvo', async () => {
    const antes = await estado(page, () => parseFloat(getComputedStyle(document.documentElement).fontSize));
    await page.check('#projetor-check');
    const depois = await estado(page, () => parseFloat(getComputedStyle(document.documentElement).fontSize));
    assert.ok(depois > antes);
    await page.reload();
    await page.waitForFunction(() => SIAB.rota.nome);
    assert.equal(await page.getAttribute('html', 'data-projetor'), 'on');
    await ir(page, '#/professor');
    await page.uncheck('#projetor-check');
  });
  await teste('caderno: notas, CSV e apagar', async () => {
    await ir(page, '#/caderno');
    const notas = await page.locator('.nota').count();
    assert.ok(notas >= 20, `notas: ${notas}`);
    const [download] = await Promise.all([page.waitForEvent('download'), page.click('#caderno-csv')]);
    const csv = fs.readFileSync(await download.path(), 'utf8');
    assert.match(csv, /data;tipo;titulo;campo;valor;gota;volume_adicionado_mL;pH;cor/);
    assert.match(csv, /;Tabela de gotas;;0;0,00;\d+,\d\d;[a-zà-ú ]+\n/);
    assert.ok(!csv.includes(' | '), 'tabela não pode virar texto corrido');
    // Tabela de gotas: colunas de verdade, com rolagem própria (sem rolagem da página).
    const tabela = page.locator('.nota-tabela').first();
    assert.equal(await tabela.locator('thead th').count(), 4);
    assert.ok(await tabela.locator('tbody tr').count() >= 2);
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-baixar-tabela] >> nth=0')]);
    assert.match(fs.readFileSync(await dl.path(), 'utf8'), /^\uFEFF?gota;volume_adicionado_mL;pH;cor\n0;0,00;/);
    await page.click('.nota [data-apagar-nota] >> nth=0');
    assert.equal(await page.locator('.nota').count(), notas - 1);
    await page.click('#caderno-limpar');
    await page.click('#confirm-yes');
    assert.equal(await page.locator('.nota').count(), 0);
  });
  await teste('caderno: nota antiga (tabela em texto) vira tabela ao abrir', async () => {
    await page.evaluate(() => {
      const dados = JSON.parse(localStorage.getItem('siab_progresso_v1'));
      dados.caderno.unshift({ id: 'antiga', data: new Date().toISOString(), tipo: 'leitura', titulo: 'Leitura antiga',
        linhas: [['pH', '2,00'], ['Tabela', '0;0,00;2,00;amarelo | 1;0,05;2,05;amarelo']] });
      localStorage.setItem('siab_progresso_v1', JSON.stringify(dados));
    });
    await page.reload();
    await page.waitForFunction(() => SIAB.rota.nome === 'caderno');
    const nota = await estado(page, () => SIAB.progresso.dados.caderno.find(n => n.id === 'antiga'));
    assert.deepEqual(nota.tabela.linhas, [['0', '0,00', '2,00', 'amarelo'], ['1', '0,05', '2,05', 'amarelo']]);
    assert.deepEqual(nota.linhas, [['pH', '2,00']]);
    assert.equal(await page.locator('.nota').first().locator('.nota-tabela tbody tr').count(), 2);
    await page.click('.nota [data-apagar-nota] >> nth=0');
  });
  await teste('acessibilidade no menu ☰: interruptores, fonte 200 %, som e vibração salvos', async () => {
    await page.click('#access-btn');
    assert.equal(await estado(page, () => document.querySelector('#app-drawer').open), true);
    assert.equal(await page.getAttribute('#a11y-toggle', 'aria-expanded'), 'true');
    assert.equal(await estado(page, () => document.activeElement.id), 'a11y-toggle');
    await page.uncheck('#tema-escuro');
    assert.equal(await page.getAttribute('html', 'data-theme'), 'light');
    for (let i = 0; i < 12; i++) if (!(await page.isDisabled('#font-plus'))) await page.click('#font-plus');
    assert.equal(await texto(page, '#font-output'), '200%');
    await page.check('#sound-check');
    await page.check('#vibrate-check');
    for (const [id, atributo, valor] of [['#contraste-check', 'data-contrast', 'on'], ['#espacamento-check', 'data-spacing', 'on'], ['#motion-check', 'data-motion', 'on'], ['#leitura-check', 'data-reading', 'on']]) {
      await page.check(id);
      assert.equal(await page.getAttribute('html', atributo), valor, id);
      assert.equal(await page.getAttribute(id, 'role'), 'switch');
    }
    await page.click('#cvd-select-trigger');
    await page.click('#choice-options [role="option"]:has-text("Tritanopia")');
    assert.equal(await page.getAttribute('html', 'data-colorblind'), 'tritanopia');
    assert.equal(await estado(page, () => document.querySelector('#app-drawer').open), true);
    await page.keyboard.press('Escape');
    assert.equal(await estado(page, () => document.querySelector('#app-drawer').open), false);
    await page.reload();
    await page.waitForFunction(() => SIAB.rota.nome);
    assert.equal(await estado(page, () => SIAB.som.prefs.som && SIAB.som.prefs.vibrar), true);
    assert.equal(await page.getAttribute('html', 'data-theme'), 'light');
    assert.equal(await page.getAttribute('html', 'data-spacing'), 'on');
    assert.equal(await estado(page, () => document.querySelector('#tema-escuro').checked), false);
    await page.click('#access-btn');
    await page.click('#a11y-restaurar');
    for (const [atributo, valor] of [['data-theme', 'dark'], ['data-contrast', 'off'], ['data-spacing', 'off'], ['data-motion', 'off'], ['data-reading', 'off'], ['data-colorblind', 'none']]) {
      assert.equal(await page.getAttribute('html', atributo), valor, atributo);
    }
    assert.equal(await texto(page, '#font-output'), '100%');
    assert.equal(await estado(page, () => SIAB.som.prefs.som || SIAB.som.prefs.vibrar), false);
    await page.keyboard.press('Escape');
  });
  await teste('com fonte 200 % e espaçamento de letras, nenhuma rolagem horizontal', async () => {
    await page.evaluate(() => { A11Y.definir('fontScale', 2); A11Y.definir('spacing', true); });
    for (const rota of ['#/laboratorio', '#/caderno', '#/manual', '#/inicio']) {
      await ir(page, rota);
      // O cabeçalho se adapta no quadro seguinte (ResizeObserver + requestAnimationFrame).
      await estado(page, () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      const sobra = await estado(page, () => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(sobra <= 1, `${rota}: rolagem horizontal de ${sobra}px`);
    }
    await page.evaluate(() => { A11Y.definir('fontScale', 1); A11Y.definir('spacing', false); });
  });
  await ctxA.close();

  /* ------------------------------------------------------------------ */
  console.log('Celular (390 × 844)');
  const { context: ctxM, page: m } = await novaPagina({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await teste('celular: barra inferior de navegação e menu superior oculto', async () => {
    assert.equal(await m.isVisible('.bottom-nav'), true);
    assert.equal(await m.isVisible('.main-nav'), false);
    await m.click('.bottom-nav a[data-nav="laboratorio"]');
    await m.waitForFunction(() => SIAB.rota.nome === 'laboratorio');
  });
  await teste('celular: sem rolagem horizontal em nenhuma tela', async () => {
    for (const rota of ['#/inicio', '#/aprender', '#/desafios', '#/laboratorio', '#/missao/estomago', '#/desafio/trunfo', '#/desafio/detetive', '#/professor', '#/caderno']) {
      await ir(m, rota);
      const sobra = await estado(m, () => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(sobra <= 1, `${rota}: rolagem horizontal de ${sobra}px`);
    }
  });
  await teste('celular: prateleira abre como painel inferior, aplica frasco e fecha com Esc', async () => {
    await ir(m, '#/laboratorio');
    await m.click('#prepare-btn');
    await m.waitForFunction(() => document.querySelector('#controls').classList.contains('open'));
    assert.equal(await estado(m, () => document.activeElement.id), 'close-controls');
    assert.equal(await estado(m, () => document.querySelector('#experiment').inert), true);
    assert.equal(await m.getAttribute('#prepare-btn', 'aria-expanded'), 'true');
    await frasco(m, 'soap');
    assert.equal(await estado(m, () => SIAB.current().solution), 'soap');
    // Fecha sozinha depois de escolher o frasco e devolve o foco ao botão do cabeçalho.
    await m.waitForFunction(() => !document.querySelector('#controls').classList.contains('open'));
    assert.equal(await estado(m, () => document.activeElement.id), 'prepare-btn');
    assert.equal(await m.getAttribute('#prepare-btn', 'aria-expanded'), 'false');
    await m.click('#prepare-btn');
    await m.waitForFunction(() => document.querySelector('#controls').classList.contains('open'));
    await m.keyboard.press('Escape');
    await m.waitForFunction(() => !document.querySelector('#controls').classList.contains('open'));
  });
  await teste('celular: cabeçalho com ☰, prateleira e acessibilidade; botão da prateleira só na bancada', async () => {
    for (const id of ['#menu-btn', '#prepare-btn', '#access-btn']) assert.equal(await m.isVisible(id), true, id);
    const altura = await estado(m, () => document.querySelector('.app-header').getBoundingClientRect().height);
    assert.ok(altura <= 60, `cabeçalho com ${altura}px`);
    // Nome por extenso embaixo da sigla, em até duas linhas, sem cortar.
    assert.equal(await texto(m, '#header-nome'), 'Simulador Interativo de Ácidos e Bases');
    const nome = await estado(m, () => { const e = document.querySelector('#header-nome'); return { linhas: Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)), cortado: e.scrollWidth > e.clientWidth + 1 }; });
    assert.ok(nome.linhas <= 2 && !nome.cortado, JSON.stringify(nome));
    await ir(m, '#/caderno');
    assert.equal(await m.isVisible('#prepare-btn'), false);
    await ir(m, '#/laboratorio');
  });
  await teste('celular: barra de chips fixa leva ao painel VER na aba escolhida', async () => {
    await ir(m, '#/laboratorio');
    assert.equal(await m.isVisible('.chip-ver[data-ir-ver="particulas"]'), true);
    await m.click('.chip-ver[data-ir-ver="particulas"]');
    await m.waitForFunction(() => SIAB.state.verTab === 'particulas');
    assert.equal(await m.getAttribute('.chip-ver[data-ir-ver="particulas"]', 'aria-pressed'), 'true');
    assert.equal(await estado(m, () => document.activeElement.id), 'tab-particulas');
    await m.waitForFunction(() => { const r = document.querySelector('#ver-panel').getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; });
    // A barra continua visível logo abaixo do cabeçalho.
    const topo = await estado(m, () => document.querySelector('.view-tabs').getBoundingClientRect().top);
    const cabecalho = await estado(m, () => document.querySelector('.app-header').getBoundingClientRect().bottom);
    assert.ok(Math.abs(topo - cabecalho) <= 2, `chips em ${topo}, cabeçalho até ${cabecalho}`);
    await m.evaluate(() => scrollTo(0, 0));
  });
  await teste('celular: menu ☰ abre como gaveta e fecha com ×', async () => {
    await m.click('#menu-btn');
    assert.equal(await estado(m, () => document.querySelector('#app-drawer').open), true);
    const largura = await estado(m, () => document.querySelector('#app-drawer').getBoundingClientRect().width);
    assert.ok(largura <= 344 && largura >= 300, `gaveta com ${largura}px`);
    await m.click('.drawer-close');
    assert.equal(await estado(m, () => document.querySelector('#app-drawer').open), false);
    assert.equal(await estado(m, () => document.activeElement.id), 'menu-btn');
  });
  await teste('celular: toque no conta-gotas adiciona 1 gota', async () => {
    const antes = await estado(m, () => SIAB.current().additions.length);
    await m.tap('#drop-btn');
    await m.waitForTimeout(300);
    assert.equal(await estado(m, () => SIAB.current().additions.length), antes + 1);
  });
  await teste('celular: barra da missão abre o cartão da missão', async () => {
    await ir(m, '#/missao/tampao');
    assert.equal(await m.isVisible('#mission-bar'), true);
    await m.click('#mission-bar');
    await m.waitForFunction(() => document.querySelector('#controls').classList.contains('open'));
    assert.equal(await m.isVisible('#passo-avancar'), true);
    await m.click('#close-controls');
  });
  await ctxM.close();

  /* ------------------------------------------------------------------ */
  console.log('Modo bancada (padrão) e manual');
  const { context: ctxB, page: b } = await novaPagina({}, 'bancada');
  const naBancada = pg => pg.waitForFunction(() => SIAB.rota.nome === 'laboratorio' && location.hash === '#/laboratorio' || (SIAB.rota.nome === 'laboratorio' && !location.hash));
  const nomes = pg => pg.evaluate(() => SIAB.state.tubes.map(t => t.name));
  await teste('abre direto na bancada, com menu de Bancada, Manual e Caderno', async () => {
    assert.equal(await estado(b, () => SIAB.MODO), 'bancada');
    assert.equal(await estado(b, () => SIAB.rota.nome), 'laboratorio');
    for (const nav of ['laboratorio', 'manual']) assert.equal(await b.isVisible(`.main-nav a[data-nav="${nav}"]`), true, nav);
    for (const nav of ['aprender', 'desafios', 'professor']) assert.equal(await b.isVisible(`.main-nav a[data-nav="${nav}"]`), false, nav);
    assert.equal(await b.isVisible('.header-notebook'), true);
  });
  await teste('endereços do modo completo levam à bancada', async () => {
    for (const rota of ['#/inicio', '#/aprender', '#/missao/tampao', '#/desafios', '#/desafio/trunfo', '#/professor']) {
      await b.evaluate(r => { location.hash = r; }, rota);
      await b.waitForFunction(() => SIAB.rota.nome === 'laboratorio' && location.hash === '#/laboratorio');
      assert.equal(await b.locator('main > [data-tela]:not([hidden])').count(), 1, rota);
    }
    await ir(b, '#/caderno');
    await b.click('.header-brand');
    await b.waitForFunction(() => SIAB.rota.nome === 'laboratorio');
  });
  await teste('aviso de boas-vindas aparece na primeira vez e "Agora não" fica guardado', async () => {
    assert.equal(await b.isVisible('#boas-vindas'), true);
    assert.equal(await b.isVisible('#boas-vindas-tour'), true);
    await b.click('#boas-vindas-fechar');
    assert.equal(await b.isVisible('#boas-vindas'), false);
    await b.reload();
    await b.waitForFunction(() => window.SIAB && SIAB.rota.nome);
    assert.equal(await b.isVisible('#boas-vindas'), false);
  });
  await teste('menu ☰: gaveta com navegação, fecha com Esc e devolve o foco', async () => {
    await b.click('#menu-btn');
    assert.equal(await b.getAttribute('#menu-btn', 'aria-expanded'), 'true');
    assert.equal(await estado(b, () => document.querySelector('#app-drawer').open), true);
    assert.equal(await estado(b, () => document.querySelector('#app-drawer').contains(document.activeElement)), true);
    assert.equal(await b.getAttribute('.drawer-link[data-nav="laboratorio"]', 'aria-current'), 'page');
    for (const nav of ['aprender', 'desafios', 'professor']) assert.equal(await b.isVisible(`.drawer-link[data-nav="${nav}"]`), false, nav);
    await b.keyboard.press('Escape');
    assert.equal(await estado(b, () => document.querySelector('#app-drawer').open), false);
    await b.waitForFunction(() => document.querySelector('#menu-btn').getAttribute('aria-expanded') === 'false');
    assert.equal(await estado(b, () => document.activeElement.id), 'menu-btn');
    // Escolher um destino fecha a gaveta.
    await b.click('#menu-btn');
    await b.click('.drawer-link[data-nav="manual"]');
    await b.waitForFunction(() => SIAB.rota.nome === 'manual');
    assert.equal(await estado(b, () => document.querySelector('#app-drawer').open), false);
    assert.equal(await b.getAttribute('.main-nav a[data-nav="manual"]', 'aria-current'), 'page');
    assert.equal(await texto(b, '#header-nome'), 'Simulador Interativo de Ácidos e Bases');
    // Toque fora (no fundo escurecido) também fecha.
    await b.click('#menu-btn');
    await b.mouse.click(1200, 450);
    assert.equal(await estado(b, () => document.querySelector('#app-drawer').open), false);
    await ir(b, '#/laboratorio');
  });
  await teste('menu ☰: roteiros de teste montam na bancada', async () => {
    await b.click('#menu-btn');
    assert.equal(await texto(b, '#drawer-roteiros-total'), '10');
    await b.click('.drawer-cat-expand');
    assert.equal(await b.locator('#drawer-roteiros [data-montar]').count(), 10);
    await b.click('#drawer-roteiros [data-montar="tres-indicadores"]');
    await b.waitForFunction(() => SIAB.state.tubes.length === 3 && SIAB.state.tubes.every(t => t.solution === 'hcl'));
    assert.equal(await estado(b, () => document.querySelector('#app-drawer').open), false);
    await b.click('#undo-btn');
  });
  await teste('menu ☰ → Modos: liga e desliga missões, desafios e professor', async () => {
    await b.click('#menu-btn');
    assert.equal(await b.isChecked('#modo-completo'), false);
    await b.check('#modo-completo');
    assert.equal(await estado(b, () => [SIAB.MODO, document.documentElement.dataset.modo, localStorage.getItem('siab_modo')].join()), 'completo,completo,completo');
    for (const nav of ['inicio', 'aprender', 'desafios', 'professor']) assert.equal(await b.isVisible(`.drawer-link[data-nav="${nav}"]`), true, nav);
    assert.equal(await texto(b, '#drawer-total-missoes'), '14');
    assert.equal(await texto(b, '#drawer-total-desafios'), '5');
    await b.click('.drawer-link[data-nav="desafios"]');
    await b.waitForFunction(() => SIAB.rota.nome === 'desafios');
    assert.equal(await b.isVisible('.main-nav a[data-nav="desafios"]'), true);
    // Desligar numa tela do modo completo leva de volta à bancada.
    await b.click('#menu-btn');
    await b.uncheck('#modo-completo');
    await b.waitForFunction(() => SIAB.rota.nome === 'laboratorio');
    assert.equal(await estado(b, () => localStorage.getItem('siab_modo')), 'bancada');
    assert.equal(await b.isVisible('.drawer-link[data-nav="desafios"]'), false);
    await b.keyboard.press('Escape');
  });
  await teste('link de aula do professor liga o modo completo sozinho', async () => {
    await ir(b, '#/aula/missao:tampao');
    await b.waitForFunction(() => SIAB.rota.nome === 'aula');
    assert.equal(await estado(b, () => SIAB.MODO), 'completo');
    assert.equal(await b.locator('#aula-sequencia a').count(), 1);
    await b.evaluate(() => SIAB.definirModo('bancada'));
    await b.waitForFunction(() => SIAB.rota.nome === 'laboratorio');
  });
  await teste('painéis recolhidos como no SIMA: o ícone traz só aquela parte flutuando, sem mudar a bancada', async () => {
    await ir(b, '#/laboratorio');
    assert.equal(await estado(b, () => SIAB.state.tubes.length), 0);
    const largura = () => estado(b, () => Math.round(document.querySelector('#experiment').getBoundingClientRect().width));
    const flutuante = () => estado(b, () => JSON.stringify(SIAB.trilho.flutuante));
    const antes = await largura();
    await b.click('[data-recolher="controls"]');
    const recolhida = await largura();
    assert.ok(recolhida > antes + 200, 'a bancada ganha espaço');
    // Bancada vazia: o trilho mostra módulos, vidraria e frascos.
    assert.deepEqual(await estado(b, () => [...document.querySelectorAll('#trilho-controls [data-item]')].map(x => x.dataset.item)), ['nivel', 'vidraria', 'frascos']);
    await b.click('#trilho-controls [data-item="frascos"]');
    assert.equal(await flutuante(), '{"painel":"controls","item":"frascos"}');
    assert.equal(await largura(), recolhida, 'o cartão flutua: a bancada não muda de largura');
    assert.equal(await estado(b, () => document.activeElement.id), 'menu-tubo');
    assert.equal(await b.isVisible('#menu-gotas'), true);
    assert.equal(await b.isVisible('#modulos'), false, 'só a parte escolhida aparece');
    assert.equal(await b.getAttribute('#trilho-controls [data-item="frascos"]', 'aria-expanded'), 'true');
    await frasco(b, 'lemon');
    assert.equal(await flutuante(), '{"painel":"controls","item":"frascos"}', 'continua aberto depois de escolher');
    assert.equal(await b.getAttribute('#menu-tubo', 'aria-expanded'), 'false', 'o menu Tubo se fecha');
    // Um toque na bancada fecha o cartão da prateleira.
    await b.click('#experiment', { position: { x: 700, y: 500 } });
    assert.equal(await flutuante(), 'null');
    // Com um tubo, o trilho ganha indicador e ações; Esc fecha e devolve o foco ao ícone.
    await b.click('#trilho-controls [data-item="indicador"]');
    assert.equal(await estado(b, () => document.activeElement.closest('#indicator-group') !== null), true);
    await b.keyboard.press('Escape');
    assert.equal(await flutuante(), 'null');
    assert.equal(await estado(b, () => document.activeElement.getAttribute('aria-label')), 'Indicador');
    // VER flutuando continua aberto enquanto se goteja; o ícone da aba em uso fica marcado.
    await b.click('[data-recolher="ver-panel"]');
    await b.click('#trilho-ver [data-item="grafico"]');
    await b.click('#drop5-btn');
    assert.equal(await flutuante(), '{"painel":"ver-panel","item":"grafico"}');
    assert.equal(await b.getAttribute('#trilho-ver [data-item="grafico"]', 'aria-current'), 'true');
    await b.click('#trilho-ver [data-item="grafico"]');
    assert.equal(await flutuante(), 'null', 'o mesmo ícone fecha');
    // O × do cartão fecha; a escolha de recolher fica salva; o primeiro ícone fixa de novo.
    await b.click('#trilho-ver [data-item="particulas"]');
    assert.equal(await estado(b, () => SIAB.state.verTab), 'particulas');
    await b.click('#ver-panel .fechar-flutuante');
    assert.equal(await flutuante(), 'null');
    await b.reload();
    await b.waitForFunction(() => SIAB.rota.nome === 'laboratorio');
    assert.equal(await b.isVisible('#trilho-controls'), true);
    assert.equal(await b.isVisible('#trilho-ver'), true);
    await b.click('#trilho-controls [data-fixar]');
    await b.click('#trilho-ver [data-fixar]');
    assert.equal(await b.isVisible('#menu-tubo'), true);
    assert.equal(await b.isVisible('#modulos'), true);
    assert.equal(await estado(b, () => JSON.stringify(SIAB.trilho.estado)), '{"controls":false,"ver-panel":false}');
  });
  await teste('vidraria: começa no tubo de ensaio; béquer e erlenmeyer mudam o desenho, não a química', async () => {
    await ir(b, '#/laboratorio');
    assert.equal(await estado(b, () => SIAB.state.vidraria), 'tubo');
    assert.equal(await b.isChecked('input[name="vidraria"][value="tubo"]'), true);
    if (!(await estado(b, () => SIAB.state.tubes.length))) await b.click('#vazia-agua');
    await frasco(b, 'hcl');
    const ph = await estado(b, () => SIAB.chem.solve(SIAB.current()).pH);
    await b.check('input[name="vidraria"][value="bequer"]', { force: true });
    assert.equal(await texto(b, '#tube-index'), await estado(b, () => `BÉQUER DE 50 mL · ${SIAB.state.tubes.indexOf(SIAB.current()) + 1} DE ${SIAB.state.tubes.length}`));
    assert.match(await texto(b, '#tube-name'), /^Béquer \d+$/);
    assert.equal(await b.locator('#large-tube svg.vidro-bequer').count(), 1);
    assert.match(await texto(b, '#vidraria-dica'), /Béquer/);
    await b.check('input[name="vidraria"][value="erlenmeyer"]', { force: true });
    assert.match(await texto(b, '#tube-name'), /^Erlenmeyer \d+$/);
    // Erlenmeyer é cônico: as marcas de 1 a 5 mL se afastam perto do gargalo.
    const ys = await estado(b, () => [...document.querySelectorAll('#large-tube .tube-tick')].map(p => parseFloat(p.getAttribute('d').split(' ')[1])));
    const passos = ys.slice(1).map((y, i) => ys[i] - y);
    assert.equal(ys.length, 5);
    assert.ok(passos.every((p, i) => i === 0 || p > passos[i - 1]), `espaços ${passos.map(p => p.toFixed(1))}`);
    assert.equal(await estado(b, () => SIAB.chem.solve(SIAB.current()).pH), ph, 'o pH não muda com a vidraria');
    // Nome escolhido pelo estudante não muda; ao recarregar, volta o tubo de ensaio.
    await b.click('#rename-btn');
    await b.fill('#new-name', 'Meu teste');
    await b.click('#rename-form button[type="submit"]');
    await b.check('input[name="vidraria"][value="tubo"]', { force: true });
    assert.equal(await texto(b, '#tube-name'), 'Meu teste');
    await b.check('input[name="vidraria"][value="bequer"]', { force: true });
    await b.reload();
    await b.waitForFunction(() => SIAB.rota.nome === 'laboratorio');
    assert.equal(await estado(b, () => SIAB.state.vidraria), 'tubo');
  });
  await teste('tour guiado: passos com contorno, voltar, próximo e Esc', async () => {
    await b.evaluate(() => SIAB.tour.iniciar());
    assert.equal(await estado(b, () => document.querySelector('#tour').open), true);
    // Bancada vazia: o tour mostra o aviso "Comece por aqui" e pula leitura e conta-gotas.
    const total = Number((await texto(b, '#tour-passo')).match(/PASSO 1 DE (\d+)/)[1]);
    assert.equal(total, await estado(b, () => SIAB.state.tubes.length ? 7 : 6));
    assert.equal(await estado(b, () => document.activeElement.id), 'tour-proximo');
    await b.click('#tour-proximo');
    assert.equal(await texto(b, '#tour-titulo'), 'Prateleira');
    // O contorno envolve a prateleira (limitado às bordas da tela).
    await b.waitForFunction(() => {
      const anel = document.querySelector('.tour-anel').getBoundingClientRect();
      const alvo = document.querySelector('#controls').getBoundingClientRect();
      return anel.left <= Math.max(alvo.left, 4) && anel.right >= alvo.right && anel.top <= alvo.top;
    });
    // O cartão não cobre o contorno.
    const [anel, cartao] = await estado(b, () => ['.tour-anel', '.tour-cartao'].map(x => document.querySelector(x).getBoundingClientRect().toJSON()));
    assert.ok(cartao.left >= anel.right || cartao.top >= anel.bottom || cartao.bottom <= anel.top, 'cartão fora do contorno');
    await b.click('#tour-voltar');
    assert.equal(await texto(b, '#tour-titulo'), 'Menu ☰');
    const titulos = [];
    for (let i = 0; i < total - 1; i++) { await b.click('#tour-proximo'); titulos.push(await texto(b, '#tour-titulo')); }
    if (total === 6) assert.ok(titulos.includes('Comece por aqui'), titulos.join());
    assert.equal(await texto(b, '#tour-proximo'), 'Concluir');
    await b.keyboard.press('Escape');
    assert.equal(await estado(b, () => document.querySelector('#tour').open), false);
    // Pelo menu ☰, fora da bancada: volta para a bancada e começa.
    await ir(b, '#/caderno');
    await b.click('#menu-btn');
    await b.click('#drawer-tour');
    await b.waitForFunction(() => SIAB.rota.nome === 'laboratorio' && document.querySelector('#tour').open);
    await b.click('#tour-pular');
    assert.equal(await estado(b, () => document.querySelector('#tour').open), false);
  });
  await teste('Libras (VLibras) é opcional e avisa quando não carrega', async () => {
    await b.route('https://vlibras.gov.br/**', rota => rota.abort());
    await b.click('#access-btn');
    await b.check('#libras-check');
    await b.waitForFunction(() => /VLibras não pôde ser carregado/.test(document.querySelector('#toast').textContent));
    assert.equal(await estado(b, () => document.querySelector('#vlibras-script')), null);
    await b.uncheck('#libras-check');
    await b.keyboard.press('Escape');
    await b.unroute('https://vlibras.gov.br/**');
    // O bloqueio proposital gera o aviso "Failed to load resource" do navegador: esperado aqui.
    for (let i = errosConsole.length - 1; i >= 0; i--) {
      if (errosConsole[i].startsWith('[Libras') && errosConsole[i].includes('net::ERR_FAILED')) errosConsole.splice(i, 1);
    }
  });
  await teste('remover o último tubo deixa a bancada vazia; Desfazer traz de volta', async () => {
    await ir(b, '#/laboratorio');
    if (!(await estado(b, () => SIAB.state.tubes.length))) await b.click('#vazia-agua');
    while (await estado(b, () => SIAB.state.tubes.length)) {
      await b.click('#remove-btn');
      await b.click('#confirm-yes');
    }
    assert.equal(await b.isVisible('#bancada-vazia'), true);
    assert.equal(await estado(b, () => document.activeElement.id), 'vazia-titulo');
    assert.equal(await b.isVisible('#vazia-desfazer'), true);
    await b.click('#vazia-desfazer');
    assert.equal(await estado(b, () => SIAB.state.tubes.length), 1);
    assert.equal(await estado(b, () => document.activeElement.id), 'tube-name');
  });
  await teste('"Mostrar na bancada" com a bancada vazia destaca o aviso', async () => {
    await b.evaluate(() => { SIAB.state.tubes = []; SIAB.state.activeId = null; SIAB.state.history = []; SIAB.loja.avisar(); });
    await ir(b, '#/manual/leitura');
    await b.click('#manual-leitura [data-mostrar]');
    await b.waitForSelector('#bancada-vazia.ajuda-destaque');
    assert.match(await texto(b, '#toast'), /bancada está vazia/);
    await b.click('#vazia-agua');
  });
  await teste('botões "?" da bancada abrem a seção certa do manual', async () => {
    for (const [seletor, secao] of [['.stage-stats .ajuda-link', 'leitura'], ['#ver-panel .ajuda-link', 'ver'], ['.dose-info .ajuda-link', 'conta-gotas'], ['.strip-heading .ajuda-link', 'tubos'], ['.controls-heading .ajuda-link', 'prateleira']]) {
      await ir(b, '#/laboratorio');
      await b.click(seletor);
      await b.waitForFunction(s => location.hash === `#/manual/${s}`, secao);
      await b.waitForFunction(s => document.activeElement?.id === `manual-h-${s}`, secao);
    }
  });
  await teste('manual: todas as seções, índice e busca sem acentos', async () => {
    await ir(b, '#/manual');
    const total = await estado(b, () => SIAB.manual.length);
    assert.equal(await b.locator('.manual-secao').count(), total);
    assert.equal(await b.locator('#manual-indice li').count(), total);
    await b.fill('#manual-busca', 'fenolftaleina');
    const visiveis = await b.locator('.manual-secao:not([hidden])').count();
    assert.ok(visiveis > 0 && visiveis < total, `visíveis: ${visiveis}`);
    await b.fill('#manual-busca', 'palavra-que-nao-existe');
    assert.equal(await b.isVisible('#manual-vazio'), true);
    await b.fill('#manual-busca', '');
    assert.equal(await b.locator('.manual-secao:not([hidden])').count(), total);
  });
  await teste('manual: tabelas de frascos e indicadores geradas do catálogo', async () => {
    const frascos = await estado(b, () => Object.keys(SIAB.solutions).length);
    assert.equal(await b.locator('#manual-frascos tbody tr:not(.tabela-grupo)').count(), frascos);
    const indicadores = await estado(b, () => Object.keys(SIAB.indicators).length - 1);
    assert.equal(await b.locator('#manual-tabela-indicadores tbody tr').count(), indicadores);
    assert.match(await texto(b, '#manual-tabela-indicadores'), /8,2 a 10,0/);
  });
  await teste('"Mostrar na bancada" destaca a parte e ativa o módulo necessário', async () => {
    await ir(b, '#/manual/medidas');
    await b.click('#manual-medidas [data-mostrar]');
    await naBancada(b);
    await b.waitForSelector('#ajustes.ajuda-destaque');
    assert.equal(await estado(b, () => SIAB.state.level), 'calcular');
    assert.equal(await b.getAttribute('#modulos [data-nivel="calcular"]', 'aria-pressed'), 'true', 'o cartão Calcular fica ativo');
    assert.equal(await estado(b, () => document.querySelector('#ajustes').open), true);
    assert.equal(await b.isVisible('#initial-volume'), true);
    await ir(b, '#/manual/conta-gotas');
    await b.click('#manual-conta-gotas [data-mostrar]');
    await b.waitForSelector('#dose-area.ajuda-destaque');
  });
  await teste('roteiro "Ácido forte × base forte": montar, chegar a pH 7,00 e desfazer', async () => {
    await b.evaluate(() => { SIAB.usarBancada('lab'); });
    const antes = await nomes(b);
    await ir(b, '#/manual/roteiros');
    assert.match(await texto(b, '#roteiro-titulacao-forte'), /equivalência em 1,00 mL \(20 gotas\), pH 7,00/);
    await b.click('[data-roteiro="titulacao-forte"]');
    await naBancada(b);
    assert.deepEqual(await nomes(b), ['HCl + NaOH']);
    assert.equal(await estado(b, () => SIAB.state.level), 'medir');
    for (let i = 0; i < 4; i++) await b.click('#drop5-btn');
    assert.equal(await texto(b, '#ph-value'), '7,00');
    assert.equal(await texto(b, '#color-name'), 'verde');
    for (let i = 0; i < 5; i++) await b.click('#undo-btn');
    assert.deepEqual(await nomes(b), antes);
  });
  await teste('roteiro "Ácido fraco × base forte" confere com o previsto (8,22 na equivalência)', async () => {
    await ir(b, '#/manual/roteiros');
    assert.match(await texto(b, '#roteiro-titulacao-fraco'), /pH 8,22/);
    await b.click('[data-roteiro="titulacao-fraco"]');
    await naBancada(b);
    for (let i = 0; i < 4; i++) await b.click('#drop5-btn');
    assert.equal(await texto(b, '#ph-value'), '8,22');
  });
  await teste('roteiro "Mesma titulação, três indicadores" cria tubos vinculados', async () => {
    await ir(b, '#/manual/roteiros');
    await b.click('[data-roteiro="tres-indicadores"]');
    await naBancada(b);
    await b.click('#drop5-btn');
    const gotas = await estado(b, () => SIAB.state.tubes.map(t => `${t.group}:${t.additions.length}`));
    assert.equal(new Set(gotas).size, 1, gotas.join(' '));
    assert.equal(gotas.length, 3);
  });
  await teste('todos os roteiros montam sem erro', async () => {
    const ids = await estado(b, () => SIAB.roteiros.map(r => r.id));
    for (const id of ids) {
      await ir(b, '#/manual/roteiros');
      await b.click(`[data-roteiro="${id}"]`);
      await naBancada(b);
      const esperado = await estado(b, i => SIAB.roteiros.find(r => r.id === i).tubos.map(t => t.name), id);
      assert.deepEqual(await nomes(b), esperado, id);
    }
  });
  await teste('imprimir manual', async () => {
    await ir(b, '#/manual');
    await b.evaluate(() => { window.print = () => { window.__impresso = true; }; });
    await b.click('#manual-imprimir');
    assert.ok(await estado(b, () => window.__impresso));
  });
  await teste('capacidade: tubo com 5 mL; béquer e erlenmeyer com tamanhos à escolha, e o volume acompanha', async () => {
    await ir(b, '#/laboratorio');
    await b.evaluate(() => { SIAB.state.tubes = []; SIAB.state.activeId = null; SIAB.state.vidraria = 'tubo'; SIAB.loja.avisar(); });
    await frasco(b, 'hcl');
    await b.click('#drop5-btn');
    assert.equal(await b.isVisible('#capacidade-grupo'), false, 'tubo: sem escolha de capacidade');
    assert.equal(await b.isVisible('#drop5ml-btn'), false);
    await b.check('input[name="vidraria"][value="erlenmeyer"]', { force: true });
    assert.equal(await estado(b, () => [...document.querySelectorAll('input[name="capacidade"]')].map(x => x.value + (x.checked ? '*' : '')).join()), '25,50,125*,250');
    const t = () => estado(b, () => ({ v0: SIAB.current().initialVolume, gotas: SIAB.current().additions.length, cap: SIAB.capacidade(SIAB.current()), pH: SIAB.chem.solve(SIAB.current()).pH }));
    let x = await t();
    assert.deepEqual([x.v0, x.gotas, x.cap], [25, 0, 125], 'o volume acompanha (1 → 25 mL) e as gotas recomeçam');
    assert.match(await texto(b, '#tube-index'), /^ERLENMEYER DE 125 mL/);
    assert.equal(await b.getAttribute('#initial-volume', 'max'), '100');
    await b.check('input[name="capacidade"][value="250"]', { force: true });
    x = await t();
    assert.deepEqual([x.v0, x.cap], [50, 250]);
    assert.equal(await b.isVisible('#drop5ml-btn'), true);
    await b.click('#drop5ml-btn');
    assert.equal((await t()).gotas, 100, '+5 mL = 100 gotas de 0,05 mL');
    // As marcas acompanham a capacidade (50, 100, 150, 200 e 250 mL).
    assert.deepEqual(await estado(b, () => [...document.querySelectorAll('#large-tube .tube-graduation')].map(e => e.textContent)), ['50', '100', '150', '200', '250']);
    // Desfazer volta a capacidade e a vidraria junto com os volumes.
    await b.click('#undo-btn');
    await b.click('#undo-btn');
    x = await t();
    assert.deepEqual([x.v0, x.cap], [25, 125]);
    await b.click('#undo-btn');
    assert.equal(await estado(b, () => SIAB.state.vidraria), 'tubo');
    assert.equal((await t()).v0, 1);
    // No módulo Medir, o volume inicial vai até 80 % da capacidade.
    await b.check('input[name="vidraria"][value="bequer"]', { force: true });
    await modulo(b, 'medir');
    await b.fill('#initial-volume', '45');
    await b.click('#prepare-form button[type="submit"]');
    assert.match(await texto(b, '#prepare-error'), /entre 0,1 e 40 mL/);
    await b.fill('#initial-volume', '30');
    await b.click('#prepare-form button[type="submit"]');
    assert.equal((await t()).v0, 30);
    await modulo(b, 'explorar');
    await b.check('input[name="vidraria"][value="tubo"]', { force: true });
  });
  await teste('segredo: 7 toques no logotipo montam o Arco-íris do pH (indicador universal, pH 1 a 13)', async () => {
    await ir(b, '#/caderno');
    const antes = await estado(b, () => SIAB.state.tubes.map(t => t.name));
    for (let i = 0; i < 7; i++) await b.click('.header-brand');
    await b.waitForFunction(() => SIAB.rota.nome === 'laboratorio' && SIAB.state.tubes.length === 7);
    const tubos = await estado(b, () => SIAB.state.tubes.map(t => ({ ind: t.indicator, pH: SIAB.chem.solve(t).pH, cor: SIAB.chem.liquid(t, false, SIAB.chem.solve(t)).name })));
    assert.ok(tubos.every(t => t.ind === 'universal'));
    assert.ok(tubos.every((t, i) => i === 0 || t.pH > tubos[i - 1].pH), 'pH crescente');
    assert.ok(tubos[0].pH < 1.5 && tubos[6].pH > 12.5);
    assert.equal(new Set(tubos.map(t => t.cor)).size, 7, 'sete cores diferentes');
    assert.equal(await estado(b, () => SIAB.state.view), 'overview');
    assert.equal(await b.isVisible('#segredo'), true);
    assert.equal(await b.locator('#segredo-faixa li').count(), 7);
    assert.ok(await estado(b, () => SIAB.progresso.dados.caderno.some(n => n.tipo === 'descoberta')));
    // Com a bancada vazia antes, "Desfazer" volta ao vazio; o aviso some fora da visão geral.
    await b.click('#focus-tab');
    assert.equal(await b.isVisible('#segredo'), false);
    await b.click('#undo-btn');
    assert.deepEqual(await estado(b, () => SIAB.state.tubes.map(t => t.name)), antes);
  });
  await teste('segredo: "arco-íris" na busca mostra o frasco secreto; 6 toques não bastam', async () => {
    await ir(b, '#/laboratorio');
    if (await b.getAttribute('#menu-tubo', 'aria-expanded') !== 'true') await b.click('#menu-tubo');
    await b.fill('#shelf-search', 'arco');
    assert.equal(await b.locator('[data-segredo]').count(), 0);
    await b.fill('#shelf-search', 'Arco-íris');
    await b.click('[data-segredo]');
    await b.waitForFunction(() => SIAB.state.tubes.length === 7 && SIAB.state.view === 'overview');
    assert.equal(await b.inputValue('#shelf-search'), '');
    assert.equal(await estado(b, () => SIAB.progresso.dados.caderno.filter(n => n.tipo === 'descoberta').length), 1, 'a nota não se repete');
    await b.click('#segredo-fechar');
    assert.equal(await b.isVisible('#segredo'), false);
    await b.click('#focus-tab');
    await b.click('#undo-btn');
    const n = await estado(b, () => SIAB.state.tubes.length);
    for (let i = 0; i < 6; i++) await b.click('.header-brand');
    await b.waitForTimeout(1600);
    await b.click('.header-brand');
    assert.equal(await estado(b, () => SIAB.state.tubes.length), n, 'com pausa, a contagem recomeça');
  });
  await teste('segredo: "misturar" despeja todos os tubos num béquer de 50 mL e o motor calcula a mistura', async () => {
    await ir(b, '#/laboratorio');
    await b.evaluate(() => { SIAB.state.tubes = []; SIAB.state.activeId = null; SIAB.state.vidraria = 'tubo'; SIAB.loja.avisar(); });
    await b.click('#vazia-agua');
    await frasco(b, 'hcl');
    await b.click('#menu-tubo');
    await b.fill('#shelf-search', 'misturar');
    await b.click('[data-segredo="mistura"]');
    await b.waitForFunction(() => /pelo menos 2 tubos/.test(document.querySelector('#toast').textContent));
    assert.equal(await estado(b, () => SIAB.state.tubes.length), 1);
    await b.click('#add-tube-btn');
    await frasco(b, 'naoh');
    await b.check('#indicator-chips input[value="btb"]', { force: true });
    await b.click('#menu-tubo');
    await b.fill('#shelf-search', 'Misturar tudo');
    await b.click('[data-segredo="mistura"]');
    await b.waitForFunction(() => SIAB.state.tubes.length === 1 && SIAB.current().componentes?.length === 2);
    const m = await estado(b, () => { const t = SIAB.current(), r = SIAB.chem.solve(t); return { nome: t.name, vidro: t.vidraria, cap: t.capacidade, pH: r.pH, vol: r.volume, cor: SIAB.chem.liquid(t, false, r).name }; });
    assert.equal(m.nome, 'Mistura');
    assert.equal(m.vidro, 'bequer');
    assert.equal(m.cap, 10, 'o menor béquer em que 2 mL cabem com folga');
    assert.ok(Math.abs(m.pH - 7) < .01, `HCl + NaOH na mesma quantidade: pH ${m.pH}`);
    assert.equal(m.vol, 2);
    assert.equal(m.cor, 'verde', 'bromotimol em meio neutro');
    await b.waitForSelector('#mistura-aviso:not([hidden])', { timeout: 5000 });
    assert.equal(await texto(b, '#capacity-value'), '10,00');
    await b.click('#tab-equacao');
    assert.match(await texto(b, '#ver-conteudo'), /Na mistura · 2 componentes[\s\S]*H₃O⁺ \+ OH⁻ → 2 H₂O/);
    assert.ok(await estado(b, () => SIAB.progresso.dados.caderno.some(n => n.titulo === 'Descoberta secreta · Mistura geral')));
    // Dá para continuar gotejando no béquer; "Desfazer" devolve os dois tubos.
    await b.click('#drop5-btn');
    assert.equal(await estado(b, () => SIAB.current().additions.length), 5);
    await b.click('#undo-btn');
    await b.click('#undo-btn');
    assert.equal(await estado(b, () => SIAB.state.tubes.length), 2);
    assert.equal(await b.isVisible('#mistura-aviso'), false);
  });
  await ctxB.close();

  const { context: ctxBM, page: bm } = await novaPagina({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, 'bancada');
  await teste('celular, modo bancada: barra inferior com 3 itens e manual sem rolagem lateral', async () => {
    assert.equal(await bm.locator('.bottom-nav a:visible').count(), 3);
    for (const rota of ['#/manual', '#/manual/roteiros', '#/manual/frascos', '#/laboratorio', '#/caderno']) {
      await ir(bm, rota);
      const sobra = await estado(bm, () => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(sobra <= 1, `${rota}: rolagem horizontal de ${sobra}px`);
    }
  });
  await teste('celular, modo bancada: "Mostrar na bancada" da prateleira abre o painel', async () => {
    await ir(bm, '#/manual/prateleira');
    await bm.click('#manual-prateleira [data-mostrar]');
    await bm.waitForFunction(() => document.querySelector('#controls').classList.contains('open'));
    await bm.waitForSelector('#painel-laboratorio.ajuda-destaque');
    await bm.click('#close-controls');
  });
  await ctxBM.close();

  /* ------------------------------------------------------------------ */
  console.log('Organização da bancada');
  for (const [largura, altura, celular] of [[1280, 720, false], [1360, 900, false], [390, 844, true]]) {
    await teste(`bancada em ${largura}×${altura}: conta-gotas e atalhos visíveis, sem texto por cima`, async () => {
      const ctx = await browser.newContext({ viewport: { width: largura, height: altura }, isMobile: celular, hasTouch: celular });
      await ctx.addInitScript(() => { localStorage.setItem('siab_abertura', 'off'); localStorage.setItem('siab_manual_visto', 'true'); });
      const pg = await ctx.newPage();
      pg.on('pageerror', e => errosConsole.push(`[${testeAtual}] [pageerror] ${e.message}`));
      await pg.goto(BASE + '#/laboratorio');
      await pg.waitForFunction(() => window.SIAB && SIAB.rota.nome === 'laboratorio');
      await pg.evaluate(() => { SIAB.bancada.colocar('lemon'); SIAB.current().indicator = 'cabbage'; SIAB.loja.avisar(); });
      const caixas = () => pg.evaluate(() => {
        const r = s => document.querySelector(s).getBoundingClientRect();
        const baixo = [...document.querySelectorAll('.tube-strip, .bottom-nav')].filter(e => getComputedStyle(e).position !== 'static' && e.getBoundingClientRect().height).map(e => e.getBoundingClientRect().top);
        return { gotejar: r('#drop-btn'), atalhos: r('#dose-shortcuts'), limite: Math.min(innerHeight, ...baixo) };
      });
      let c = await caixas();
      assert.ok(c.gotejar.bottom <= c.limite + 1 && c.atalhos.bottom <= c.limite + 1, `botões até ${Math.round(c.atalhos.bottom)}, limite ${Math.round(c.limite)}`);
      // Aviso de amostra representativa: curto, abre ao tocar.
      assert.equal(await texto(pg, '#sample-model-note summary'), '≈ estimativa');
      if (celular) {
        // Rolando até o VER, a barra do conta-gotas continua à mão.
        await pg.evaluate(() => document.querySelector('#ver-panel').scrollIntoView());
        c = await caixas();
        assert.ok(c.gotejar.top >= 0 && c.gotejar.bottom <= c.limite + 1, 'barra do conta-gotas presa embaixo');
      }
      await ctx.close();
    });
  }

  /* ------------------------------------------------------------------ */
  console.log('Animação de abertura');
  const ctxAb = await browser.newContext({ viewport: { width: 1360, height: 900 } });
  const ab = await ctxAb.newPage();
  ab.on('console', m => { if (m.type() === 'error') errosConsole.push(`[${testeAtual}] ${m.text()} (${ab.url()})`); });
  ab.on('pageerror', e => errosConsole.push(`[${testeAtual}] [pageerror] ${e.message}`));
  await teste('abertura: 5 tubos trocam de composto e de cor, com as cores do motor, e somem sozinhos', async () => {
    await ab.goto(BASE);
    await ab.waitForSelector('#abertura .ab-tubo');
    assert.equal(await ab.locator('#abertura .ab-tubo').count(), 5);
    const formula = n => ab.locator(`#abertura .ab-tubo[data-n="${n}"] .ab-formula`).textContent();
    await ab.waitForFunction(() => document.querySelector('#abertura .ab-tubo[data-n="0"] .ab-formula').textContent === 'HCl');
    assert.equal(await ab.getAttribute('#abertura .ab-tubo[data-n="0"]', 'data-cor'), 'incolor');
    // Última etapa: NaOH com fenolftaleína fica rosa e NH₃ com bromotimol, azul — como na bancada.
    // Os tubos recebem a gota um depois do outro: espera o último.
    await ab.waitForFunction(() => document.querySelector('#abertura .ab-tubo[data-n="4"] .ab-formula').textContent === 'NaOH');
    assert.equal(await formula(0), 'NaOH');
    assert.equal(await formula(1), 'NH₃');
    assert.equal(await ab.getAttribute('#abertura .ab-tubo[data-n="0"]', 'data-cor'), 'rosa');
    assert.equal(await ab.getAttribute('#abertura .ab-tubo[data-n="1"]', 'data-cor'), 'azul');
    const [cor, esperada] = await estado(ab, () => [document.querySelector('#abertura .ab-tubo[data-n="0"] .ab-liquido').style.fill, SIAB.abertura.leitura('naoh', 'phenol').cor]);
    assert.equal(cor.replace(/\s/g, ''), esperada.replace(/\s/g, ''));
    assert.match(await texto(ab, '#abertura .ab-tubo[data-n="0"] .ab-ph'), /pH 12,0/);
    await ab.waitForSelector('#abertura', { state: 'detached', timeout: 6000 });
    assert.equal(await estado(ab, () => SIAB.rota.nome), 'laboratorio');
  });
  await teste('abertura: toque ou tecla pulam; o toque não atravessa para a bancada', async () => {
    await ab.reload();
    await ab.waitForSelector('#abertura .ab-tubo');
    await ab.mouse.click(680, 450);
    await ab.waitForSelector('#abertura', { state: 'detached', timeout: 1500 });
    assert.equal(await estado(ab, () => SIAB.state.tubes.length), 0);
    await ab.reload();
    await ab.waitForSelector('#abertura .ab-tubo');
    await ab.keyboard.press('Escape');
    await ab.waitForSelector('#abertura', { state: 'detached', timeout: 1500 });
  });
  await teste('abertura: desligar no menu ☰ e "Reduzir animações" valem ao recarregar', async () => {
    await ab.click('#access-btn');
    assert.equal(await ab.isChecked('#abertura-check'), true);
    await ab.uncheck('#abertura-check');
    await ab.keyboard.press('Escape');
    await ab.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await ab.getAttribute('html', 'data-abertura'), 'off');
    assert.equal(await ab.isVisible('#abertura'), false);
    await ab.waitForFunction(() => window.SIAB && SIAB.rota.nome);
    // Restaurar padrões liga de novo; com "Reduzir animações", não toca.
    await ab.click('#access-btn');
    await ab.click('#a11y-restaurar');
    assert.equal(await ab.isChecked('#abertura-check'), true);
    await ab.check('#motion-check');
    await ab.keyboard.press('Escape');
    await ab.reload();
    await ab.waitForFunction(() => window.SIAB && SIAB.rota.nome);
    assert.equal(await ab.locator('#abertura').count(), 0);
    assert.equal(await ab.locator('.ab-tubo').count(), 0);
  });
  await ctxAb.close();

  /* ------------------------------------------------------------------ */
  console.log('PWA e uso sem internet (modo bancada)');
  const { context: ctxP, page: p } = await novaPagina({}, 'bancada');
  await teste('service worker registra e assume a página', async () => {
    await p.waitForFunction(() => navigator.serviceWorker.controller || navigator.serviceWorker.ready.then(() => true), null, { timeout: 15000 });
    await p.evaluate(() => navigator.serviceWorker.ready);
    await p.reload();
    await p.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 15000 });
    const versao = await p.evaluate(() => 'siab-' + SIAB.version);
    const chaves = await p.evaluate(async () => (await caches.keys()));
    assert.ok(chaves.includes(versao), `cache ${versao} ausente: ${chaves}`);
    const guardados = await p.evaluate(async v => (await (await caches.open(v)).keys()).length, versao);
    assert.ok(guardados >= 50, `arquivos no cache: ${guardados}`);
    assert.equal(await p.isVisible('#pwa-recarregar'), false, 'primeira visita não pede para recarregar');
  });
  await teste('scripts e estilos são pedidos com ?v= da versão (sem misturar cache antigo)', async () => {
    const versao = await p.evaluate(() => SIAB.version);
    const enderecos = await p.evaluate(() => [...document.querySelectorAll('script[src], link[rel="stylesheet"]')].map(x => x.getAttribute('src') || x.getAttribute('href')));
    assert.ok(enderecos.length > 40);
    for (const e of enderecos) assert.ok(e.endsWith(`?v=${versao}`), e);
  });
  await teste('manifesto válido é servido', async () => {
    const manifesto = await p.evaluate(async () => (await fetch(document.querySelector('link[rel="manifest"]').href)).json());
    assert.equal(manifesto.short_name, 'SIAB');
  });
  await teste('sem internet: recarrega e usa bancada, roteiro, caderno e manual', async () => {
    await ctxP.setOffline(true);
    await p.reload();
    await p.waitForFunction(() => window.SIAB && SIAB.rota.nome);
    await ir(p, '#/laboratorio');
    await frasco(p, 'vinegar');
    await p.click('#drop5-btn');
    assert.equal(await estado(p, () => SIAB.current().additions.length), 5);
    await ir(p, '#/manual/roteiros');
    await p.click('[data-roteiro="tampao"]');
    await p.waitForFunction(() => SIAB.rota.nome === 'laboratorio' && SIAB.state.tubes.length === 2);
    await ir(p, '#/caderno');
    await p.goto(BASE + '?theme=dark#/manual');
    await p.waitForFunction(() => SIAB.rota.nome === 'manual');
    assert.ok((await p.locator('.manual-secao').count()) > 10);
    await ctxP.setOffline(false);
  });
  await teste('versão nova do service worker assume, troca o cache e avisa "Recarregar"', async () => {
    const antiga = await p.evaluate(() => 'siab-' + SIAB.version);
    sobrescrever['sw.js'] = texto => texto.replace(/const VERSAO = '[^']+'/, "const VERSAO = 'siab-teste-atualizacao'");
    await p.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
    await p.waitForSelector('#pwa-recarregar', { timeout: 20000 });
    // O aviso chega quando a versão nova assume; a limpeza do cache antigo termina logo depois.
    let chaves = [];
    for (let i = 0; i < 50; i++) {
      chaves = await p.evaluate(async () => caches.keys());
      if (!chaves.includes(antiga)) break;
      await p.waitForTimeout(100);
    }
    assert.ok(chaves.includes('siab-teste-atualizacao'), `cache novo ausente: ${chaves}`);
    assert.ok(!chaves.includes(antiga), 'cache antigo não foi apagado');
    await Promise.all([p.waitForEvent('load'), p.click('#pwa-recarregar')]);
    await p.waitForFunction(() => window.SIAB && SIAB.rota.nome);
    sobrescrever = {};
  });
  await ctxP.close();

  /* ------------------------------------------------------------------ */
  await teste('nenhum erro no console nem diálogo nativo durante os testes', async () => {
    if (errosConsole.length) console.log(errosConsole.join('\n'));
    assert.deepEqual(errosConsole, []);
  });

  await browser.close();
  server.close();
  const falhas = resultados.filter(r => !r.ok);
  console.log(`\n${resultados.length - falhas.length} de ${resultados.length} testes de ponta a ponta passaram.`);
  process.exit(falhas.length ? 1 : 0);
})().catch(erro => { console.error(erro); process.exit(1); });
