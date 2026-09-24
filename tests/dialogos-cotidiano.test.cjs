/* Functional DOM checks; no claim of real mobile layout or native focus trapping. */
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { JSDOM } = require(process.env.SIAB_JSDOM_MODULE || 'jsdom');
const root = path.join(__dirname, '..');
const dom = new JSDOM(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), {
  url: 'https://siab.test/', runScripts: 'outside-only', pretendToBeVisual: true
});
const w = dom.window, doc = w.document;
w.matchMedia = () => ({ matches: true, addEventListener() {} });
w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
w.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new w.Event('close')); };
for (const name of ['alert', 'confirm', 'prompt']) w[name] = () => { throw new Error('Native dialog: ' + name); };
w.HTMLFormElement.prototype.reportValidity = () => { throw new Error('Native validation bubble'); };
w.HTMLInputElement.prototype.reportValidity = () => { throw new Error('Native validation bubble'); };
const $ = id => doc.getElementById(id), click = id => $(id).click();
const change = (id, value) => { $(id).value = value; $(id).dispatchEvent(new w.Event('change', { bubbles: true })); };
const submit = id => $(id).dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
const key = (id, name) => $(id).dispatchEvent(new w.KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
const search = text => { $('choice-search').value = text; $('choice-search').dispatchEvent(new w.Event('input', { bubbles: true })); };
try {
  for (const script of doc.querySelectorAll('script[src]')) w.eval(fs.readFileSync(path.join(root, script.getAttribute('src')), 'utf8'));
  assert.equal(doc.querySelectorAll('.themed-select').length, 8);
  for (const select of doc.querySelectorAll('select')) {
    assert.ok(select.hidden);
    assert.equal($(select.id + '-trigger').getAttribute('aria-haspopup'), 'dialog');
  }
  for (const dialog of doc.querySelectorAll('dialog')) {
    assert.ok(dialog.classList.contains('siab-dialog'));
    assert.ok($(dialog.getAttribute('aria-labelledby')));
  }
  assert.equal(doc.querySelectorAll('#start-screen button').length, 1);
  click('start-btn');
  assert.ok([...$('solution-select').options].some(option => option.value === 'hcl'));
  assert.ok([...$('solution-select').options].some(option => option.value === 'lemon'));
  const api = w.SIAB, s = api.state;
  assert.equal(s.tubes.length, 3); assert.equal(api.current().solution, 'lemon');
  assert.equal(api.current().dilution, 10); assert.equal(api.current().indicator, 'cabbage');
  assert.match($('ph-value').textContent, /^≈ /);
  const initialPH = api.chem.solve(api.current()).pH;
  click('drop-btn'); assert.ok(api.chem.solve(api.current()).pH > initialPH);
  click('undo-btn'); assert.ok(Math.abs(api.chem.solve(api.current()).pH - initialPH) < 1e-10);
  click('compare-btn'); click('confirm-yes');
  const group = api.targets(api.current()); assert.equal(group.length, 3);
  assert.ok(group.every(t => t.dilution === 10 && t.solution === 'lemon'));
  click('drop-btn'); assert.ok(group.every(t => t.additions.length === 1));
  click('prepare-btn'); click('solution-select-trigger');
  assert.ok($('choice-dialog').open); assert.equal($('choice-title').textContent, 'Solução inicial');
  search('CAFE'); assert.equal(doc.querySelectorAll('[data-choice-index]').length, 1);
  key('choice-options', 'Enter');
  assert.equal($('solution-select').value, 'coffee');
  assert.equal($('choice-dialog').open, false);
  assert.equal($('solution-select-trigger').getAttribute('aria-expanded'), 'false');
  assert.equal(doc.activeElement.id, 'solution-select-trigger');
  assert.ok($('concentration-field').hidden); assert.equal($('dilution-field').hidden, false);
  change('dilution-select', '2'); $('initial-volume').value = '1';
  submit('prepare-form'); click('confirm-yes');
  assert.ok(group.every(t => t.solution === 'coffee' && t.dilution === 2 && t.additions.length === 0));
  const before = api.chem.solve(api.current()).pH;
  const colorBefore = $('color-swatch').style.background;
  $('indicator-only').checked = true; $('indicator-only').dispatchEvent(new w.Event('change', { bubbles: true }));
  assert.equal(api.chem.solve(api.current()).pH, before);
  assert.notEqual($('color-swatch').style.background, colorBefore);
  click('ph-toggle'); assert.equal($('ph-value').textContent, '—');
  click('overview-tab'); assert.ok(!$('overview-grid').textContent.includes('pH'));
  doc.querySelector('.overview-tube').click();
  click('rename-btn'); $('new-name').value = '   '; submit('rename-form');
  assert.equal($('rename-error').hidden, false); assert.equal($('new-name').getAttribute('aria-invalid'), 'true');
  $('new-name').value = 'Meu café'; $('new-name').dispatchEvent(new w.Event('input')); submit('rename-form');
  assert.equal(api.current().name, 'Meu café');
  click('prepare-btn'); $('initial-volume').value = '-1'; submit('prepare-form');
  assert.equal($('prepare-error').hidden, false); assert.equal(api.current().initialVolume, 1);
  click('close-controls'); click('access-btn'); click('theme-select-trigger');
  assert.ok($('access-dialog').open && $('choice-dialog').open);
  assert.ok($('choice-search-field').hidden);
  key('choice-options', 'End'); key('choice-options', 'Enter');
  assert.equal(doc.documentElement.dataset.contrast, 'on');
  assert.ok($('access-dialog').open); assert.equal($('choice-dialog').open, false);
  assert.equal(doc.activeElement.id, 'theme-select-trigger');
  $('access-dialog').close();
  console.log('Cotidiano e diálogos: busca, teclado, foco, temas, erro inline, diluição, comparação e cores: OK');
} finally { w.close(); }
