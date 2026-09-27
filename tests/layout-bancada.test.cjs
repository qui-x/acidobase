/* Verificação em navegador real: npm install --no-save playwright.
   Execute node tests/layout-bancada.test.cjs depois de instalar o Chromium
   do Playwright, ou informe SIAB_BROWSER_EXECUTABLE para um navegador local. */
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.SIAB_PLAYWRIGHT_MODULE || 'playwright');
const url = pathToFileURL(path.join(__dirname, '..', 'index.html')).href + '?theme=light';
const assentar = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));

(async () => {
  const browser = await chromium.launch({ headless: true,
    ...(process.env.SIAB_BROWSER_EXECUTABLE ? { executablePath: process.env.SIAB_BROWSER_EXECUTABLE } : {}),
    args: ['--no-sandbox', '--disable-gpu'] });
  const erros = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 980 }, reducedMotion: 'reduce' });
    page.on('pageerror', e => erros.push(e.message));
    await page.addInitScript(() => {
      localStorage.setItem('siab_abertura', 'off');
      localStorage.setItem('siab_trilho_v1', JSON.stringify({ controls: true, 'ver-panel': true }));
    });
    await page.goto(url);
    await page.evaluate(() => {
      SIAB.$('boas-vindas').hidden = true;
      SIAB.newTube({ solution: 'hcl', indicator: 'universal', titrant: 'water' });
      SIAB.state.activeId = SIAB.state.tubes[0].id;
      SIAB.render(true);
    });
    // Todas as capacidades disponíveis: vidro e escala dentro do palco, botão
    // de gotejar acima da tira fixa. Enquadramento não muda o motor químico.
    const tipos = [['tubo', 5], ...[10, 25, 50, 100, 250].map(n => ['bequer', n]),
      ...[25, 50, 125, 250].map(n => ['erlenmeyer', n])];
    for (const [tipo, capacidade] of tipos) {
      await page.evaluate(({ tipo, capacidade }) => {
        const s = SIAB.state, t = SIAB.current();
        s.vidraria = tipo; s.capacidades[tipo] = capacidade;
        t.initialVolume = capacidade / 5; SIAB.render(true);
      }, { tipo, capacidade });
      await assentar(page);
      const quadro = await page.evaluate(() => {
        const r = el => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, right: b.right, bottom: b.bottom, height: b.height }; };
        const svg = document.querySelector('#large-tube svg');
        return { svg: r(svg), vidro: r(svg.querySelector('.tube-outline')),
          escala: [...svg.querySelectorAll('.tube-graduation')].map(r),
          gotas: r(SIAB.$('drop-btn')), tira: r(document.querySelector('.tube-strip')),
          ph: SIAB.chem.solve(SIAB.current()).pH };
      });
      for (const item of [quadro.vidro, ...quadro.escala]) {
        assert.ok(item.x >= quadro.svg.x - 1 && item.right <= quadro.svg.right + 1, `${tipo}: largura do desenho`);
        assert.ok(item.y >= quadro.svg.y - 1 && item.bottom <= quadro.svg.bottom + 1, `${tipo}: altura do desenho`);
      }
      assert.ok(quadro.gotas.bottom <= quadro.tira.y + 1, `${tipo}: conta-gotas acessível`);
      assert.ok(Math.abs(quadro.ph - 2) < .02, 'A ampliação preserva o pH do HCl 0,01 mol/L');
    }
    // Quantidades pares e ímpares ocupam linhas completas, sem sobreposição.
    for (let n = 1; n <= 10; n++) {
      await page.evaluate(n => {
        const s = SIAB.state; s.tubes = []; s.vidraria = 'tubo';
        for (let i = 0; i < n; i++) SIAB.newTube({ ...(SIAB.segredo.ARCO_IRIS[i % 7]), indicator: 'universal', titrant: 'water' });
        s.activeId = s.tubes[0].id; s.view = 'overview'; SIAB.render(true);
      }, n);
      await assentar(page);
      const grade = await page.evaluate(() => {
        const g = SIAB.$('overview-grid'), v = SIAB.$('overview-view'), rect = g.getBoundingClientRect();
        return { left: rect.left, right: rect.right, overflow: v.scrollHeight > v.clientHeight + 2,
          cards: [...g.children].map(el => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top }; }) };
      });
      assert.equal(grade.cards.length, n);
      assert.equal(grade.overflow, false, `${n} tubos cabem em Full HD com os painéis recolhidos`);
      const linhas = Map.groupBy(grade.cards, r => Math.round(r.top));
      for (const linha of linhas.values()) {
        assert.ok(Math.abs(linha[0].left - grade.left) < 2);
        assert.ok(Math.abs(linha.at(-1).right - grade.right) < 2, 'Última linha ocupa a largura');
        linha.slice(1).forEach((r, i) => assert.ok(r.left >= linha[i].right, 'Cartões não se sobrepõem'));
      }
      if (n === 10) assert.deepEqual([...linhas.values()].map(r => r.length), [5, 5]);
    }
    // Reorganizar e ordenar preservam a seleção e a identidade dos recipientes.
    await page.click('#selecionar-tubos-btn');
    await page.locator('#overview-grid .overview-tube').first().click();
    const selecionado = await page.locator('#overview-grid [aria-pressed=true]').getAttribute('data-tube');
    await page.click('#ordenar-ph-btn');
    await page.setViewportSize({ width: 1366, height: 768 });
    await assentar(page);
    assert.equal(await page.locator('#overview-grid [aria-pressed=true]').getAttribute('data-tube'), selecionado);
    await page.click('#selecao-cancelar-btn');
    await page.evaluate(() => { document.documentElement.dataset.projetor = 'on'; });
    await page.setViewportSize({ width: 1920, height: 1080 });
    await assentar(page);
    assert.equal(await page.evaluate(() => SIAB.$('overview-grid').style.getPropertyValue('--overview-columns')), '5');
    // Celular: desenho dentro do cartão e seleção em uma única coluna.
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.evaluate(() => { document.documentElement.dataset.projetor = 'off'; });
      await page.click('#selecionar-tubos-btn');
      await assentar(page);
      assert.ok(await page.evaluate(() => {
        const cards = [...document.querySelectorAll('#overview-grid .overview-tube')];
        return document.documentElement.scrollWidth <= innerWidth + 1 && cards.every(el => {
          const b = el.getBoundingClientRect(), svg = el.querySelector('svg').getBoundingClientRect();
          return b.width >= innerWidth - 34 && svg.left >= b.left && svg.right <= b.right && svg.bottom <= b.bottom;
        });
      }), `Lista e miniaturas cabem em ${width}px`);
      await page.click('#selecao-cancelar-btn');
    }
    assert.deepEqual(erros, [], 'Nenhum erro de execução');
    console.log('OK: enquadramento de 10 vidrarias/capacidades; 1–10 cartões; projeção, redimensionamento, seleção e celular.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
