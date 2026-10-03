const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const {chromium} = require(process.env.SIAB_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
  const context = await browser.newContext({viewport: {width: 1366, height: 900}, reducedMotion: 'reduce'});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const cases = [];
  try {
    await page.goto(pathToFileURL(path.join(root, 'docs/EVIDENCIAS-RC5.html')).href);
    assert.equal(await page.locator('.grid article').count(), 33);
    await page.click('[data-filter=mobile]');
    assert.equal(await page.locator('.grid article:visible').count(), 8);
    await page.click('[data-filter=icones]');
    assert.equal(await page.locator('.grid article:visible').count(), 2);
    await page.click('[data-filter=all]');
    await page.setViewportSize({width: 320, height: 568});
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    cases.push({name: 'Galeria local: 33 capturas, filtros e viewport 320 px', status: 'OK'});
    await page.goto(pathToFileURL(path.join(root, 'docs/ICONOGRAFIA-RC5.html')).href);
    await page.click('#theme');
    await page.click('#expand');
    assert.equal(await page.locator('#expand').getAttribute('aria-expanded'), 'true');
    cases.push({name: 'Inventário de ícones local: tema e expansão', status: 'OK'});
    await context.setOffline(true);
    await page.addInitScript(() => {
      localStorage.setItem('siab_abertura', 'off');
      localStorage.setItem('siab_inicializacao', '"inicio"');
      localStorage.setItem('siab_manual_visto', 'true');
    });
    await page.goto(pathToFileURL(path.join(root, 'SIAB-standalone.html')).href);
    await page.waitForFunction(() => document.documentElement.dataset.appPronto === 'true');
    assert.equal(await page.evaluate(() => SIAB.version), '1.0.0-rc.5');
    await page.evaluate(() => SIAB.irPara('#/manual'));
    await page.waitForFunction(() => SIAB.rota.nome === 'manual');
    assert.ok(await page.locator('#manual-conteudo').isVisible());
    cases.push({name: 'Standalone final reconstruído: abertura local offline e Manual', status: 'OK'});
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(root, 'tests/results/artefatos-rc5.json'), JSON.stringify({version: '1.0.0-rc.5', date: new Date().toISOString(), engine: 'chromium', browser: browser.version(), countedIn736: false, cases, errors}, null, 2) + '\n');
    console.log(JSON.stringify({cases, errors}));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
