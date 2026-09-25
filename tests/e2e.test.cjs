// Testes de ponta a ponta no Chromium (Playwright): usam o SIAB como um aluno.
// Rodar: npm run test:e2e   (ou: node tests/e2e.test.cjs)
// Sobe um servidor local próprio, porque o service worker exige http(s).
const fs = require('node:fs'), assert = require('node:assert/strict');
const { chromium } = require('playwright');

const { criarServidor } = require('../tools/servidor.cjs');
const servidor = () => new Promise(resolve => { const s = criarServidor(); s.listen(0, '127.0.0.1', () => resolve(s)); });

const resultados = [];
const errosConsole = [];
async function teste(nome, fn) {
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

  async function novaPagina(opcoes = {}) {
    const context = await browser.newContext({ viewport: { width: 1360, height: 900 }, acceptDownloads: true, ...opcoes });
    const page = await context.newPage();
    page.on('console', m => { if (m.type() === 'error') errosConsole.push(`${m.text()} (${page.url()})`); });
    page.on('pageerror', e => errosConsole.push(`[pageerror] ${e.message}`));
    page.on('dialog', d => { errosConsole.push(`diálogo nativo usado: ${d.message()}`); d.dismiss(); });
    await page.goto(BASE);
    await page.waitForFunction(() => window.SIAB && SIAB.rota.nome);
    return { context, page };
  }
  const ir = (page, rota) => page.evaluate(r => { location.hash = r; }, rota).then(() => page.waitForFunction(r => location.hash === r && SIAB.rota.nome, rota));
  const texto = (page, seletor) => page.locator(seletor).first().textContent().then(x => x.trim());
  const estado = (page, fn, arg) => page.evaluate(fn, arg);

  /* ------------------------------------------------------------------ */
  console.log('Navegação e telas');
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

  await teste('bancada inicial: três tubos do cotidiano e tira de tubos', async () => {
    assert.equal(await page.locator('#tube-list button').count(), 3);
    assert.equal(await texto(page, '#tube-name'), 'Limão diluído');
    assert.match(await texto(page, '#ph-value'), /≈ 2,6/);
  });
  await teste('segurar o conta-gotas goteja várias vezes; soltar para', async () => {
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
  await teste('chip de variação do pH aparece depois das gotas', async () => {
    assert.equal(await page.isVisible('#ph-delta'), true);
    assert.match(await texto(page, '#ph-delta'), /→/);
  });
  await teste('prateleira: frasco vai para o tubo, gotas recomeçam e Desfazer restaura', async () => {
    await page.click('#shelf [data-solution="vinegar"]');
    let x = await t();
    assert.equal(x.sol, 'vinegar');
    assert.equal(x.gotas, 0);
    assert.match(await texto(page, '#toast'), /Vinagre branco no tubo/);
    await page.click('#undo-btn');
    x = await t();
    assert.equal(x.sol, 'lemon');
    assert.ok(x.gotas > 0);
  });
  await teste('prateleira: destino conta-gotas', async () => {
    await page.check('input[name="destino"][value="titrant"]');
    await page.click('#shelf [data-solution="naoh"]');
    const x = await t();
    assert.equal(x.tit, 'naoh');
    assert.match(await texto(page, '#titrant-label'), /NaOH/);
    await page.check('input[name="destino"][value="tube"]');
  });
  await teste('busca da prateleira sem acentos encontra "Suco de limão"', async () => {
    await page.fill('#shelf-search', 'limao');
    assert.equal(await page.locator('#shelf .bottle').count(), 1);
    assert.match(await texto(page, '#shelf .bottle'), /Suco de limão/);
    await page.fill('#shelf-search', '');
  });
  await teste('níveis: Explorar esconde ajustes; Medir mostra volume; Calcular mostra concentração', async () => {
    assert.equal(await page.isVisible('#ajustes'), false);
    await page.check('input[name="nivel"][value="medir"]');
    assert.equal(await page.isVisible('#initial-volume'), true);
    await page.click('#shelf [data-solution="hcl"]');
    assert.equal(await page.isVisible('#concentration'), false);
    await page.check('input[name="nivel"][value="calcular"]');
    assert.equal(await page.isVisible('#concentration'), true);
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
  await teste('registrar leitura no caderno', async () => {
    await page.click('#ver-conteudo [data-acao="registrar"]');
    assert.ok(await estado(page, () => SIAB.progresso.dados.caderno.some(n => n.tipo === 'leitura')));
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
    assert.equal(await texto(page, '#tube-name'), 'Limão diluído');
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
    assert.match(fs.readFileSync(await download.path(), 'utf8'), /data;tipo;titulo;campo;valor/);
    await page.click('.nota [data-apagar-nota] >> nth=0');
    assert.equal(await page.locator('.nota').count(), notas - 1);
    await page.click('#caderno-limpar');
    await page.click('#confirm-yes');
    assert.equal(await page.locator('.nota').count(), 0);
  });
  await teste('acessibilidade: tema claro, fonte 200 %, som e vibração salvos', async () => {
    await page.click('#access-btn');
    await page.click('#theme-select-trigger');
    await page.click('#choice-options [role="option"]:has-text("Claro")');
    assert.equal(await page.getAttribute('html', 'data-theme'), 'light');
    for (let i = 0; i < 12; i++) if (!(await page.isDisabled('#font-plus'))) await page.click('#font-plus');
    assert.equal(await texto(page, '#font-output'), '200%');
    await page.check('#sound-check');
    await page.check('#vibrate-check');
    await page.keyboard.press('Escape');
    await page.reload();
    await page.waitForFunction(() => SIAB.rota.nome);
    assert.equal(await estado(page, () => SIAB.som.prefs.som && SIAB.som.prefs.vibrar), true);
    assert.equal(await page.getAttribute('html', 'data-theme'), 'light');
    await page.click('#access-btn');
    await page.click('#theme-select-trigger');
    await page.click('#choice-options [role="option"]:has-text("Escuro")');
    for (let i = 0; i < 12; i++) if (!(await page.isDisabled('#font-minus'))) await page.click('#font-minus');
    for (let i = 0; i < 2; i++) await page.click('#font-plus');
    await page.uncheck('#sound-check');
    await page.uncheck('#vibrate-check');
    await page.keyboard.press('Escape');
  });
  await teste('com fonte ampliada, a bancada não cria rolagem horizontal', async () => {
    await ir(page, '#/laboratorio');
    const sobra = await estado(page, () => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(sobra <= 1, `rolagem horizontal de ${sobra}px`);
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
    await m.click('#shelf [data-solution="soap"]');
    assert.equal(await estado(m, () => SIAB.current().solution), 'soap');
    await m.keyboard.press('Escape');
    await m.waitForFunction(() => !document.querySelector('#controls').classList.contains('open'));
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
  console.log('PWA e uso sem internet');
  const { context: ctxP, page: p } = await novaPagina();
  await teste('service worker registra e assume a página', async () => {
    await p.waitForFunction(() => navigator.serviceWorker.controller || navigator.serviceWorker.ready.then(() => true), null, { timeout: 15000 });
    await p.evaluate(() => navigator.serviceWorker.ready);
    await p.reload();
    await p.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 15000 });
    const chaves = await p.evaluate(async () => (await caches.keys()));
    assert.ok(chaves.includes('siab-0.3.0'));
    const guardados = await p.evaluate(async () => (await (await caches.open('siab-0.3.0')).keys()).length);
    assert.ok(guardados >= 50, `arquivos no cache: ${guardados}`);
  });
  await teste('manifesto válido é servido', async () => {
    const manifesto = await p.evaluate(async () => (await fetch(document.querySelector('link[rel="manifest"]').href)).json());
    assert.equal(manifesto.short_name, 'SIAB');
  });
  await teste('sem internet: recarrega e usa laboratório, missão e desafio', async () => {
    await ctxP.setOffline(true);
    await p.reload();
    await p.waitForFunction(() => window.SIAB && SIAB.rota.nome);
    await ir(p, '#/laboratorio');
    await p.click('#drop5-btn');
    assert.equal(await estado(p, () => SIAB.current().additions.length), 5);
    await ir(p, '#/missao/tampao');
    assert.match(await texto(p, '#missao-titulo'), /Laboratório do tampão/);
    await ir(p, '#/desafio/regua');
    assert.equal(await p.locator('[data-palpite]').count(), 6);
    await p.goto(BASE + '?theme=dark#/aprender');
    await p.waitForFunction(() => SIAB.rota.nome === 'aprender');
    await ctxP.setOffline(false);
  });
  await ctxP.close();

  /* ------------------------------------------------------------------ */
  await teste('nenhum erro no console nem diálogo nativo durante os testes', async () => {
    assert.deepEqual(errosConsole, []);
  });

  await browser.close();
  server.close();
  const falhas = resultados.filter(r => !r.ok);
  console.log(`\n${resultados.length - falhas.length} de ${resultados.length} testes de ponta a ponta passaram.`);
  process.exit(falhas.length ? 1 : 0);
})().catch(erro => { console.error(erro); process.exit(1); });
