// Confere o PWA sem navegador: todo arquivo referenciado pela página está na
// lista do service worker, os arquivos existem e o manifesto tem os ícones exigidos.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(raiz, 'sw.js'), 'utf8');
const lista = [...sw.matchAll(/'\.\/([^']*)'/g)].map(m => m[1]).filter(Boolean);
const semVersao = endereco => endereco.split('?')[0];
const referenciados = [
  ...[...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]),
  ...[...html.matchAll(/<link rel="(?:stylesheet|icon|apple-touch-icon|manifest)"[^>]*href="([^"]+)"/g)].map(m => m[1]),
  ...[...html.matchAll(/<img src="([^"]+)"/g)].map(m => m[1])
].map(semVersao);
let count = 0;

// A mesma versão em três lugares: SIAB.version, ?v= dos arquivos e VERSAO do sw.js.
// Sem isso, o navegador pode misturar arquivos de versões diferentes guardados no cache.
const versao = fs.readFileSync(path.join(raiz, 'js/core/namespace.js'), 'utf8').match(/version: '([^']+)'/)[1];
assert.match(sw, new RegExp(`const VERSAO = 'siab-${versao.replace(/\./g, '\\.')}'`), 'VERSAO do sw.js diferente de SIAB.version'); count++;
for (const [, endereco] of html.matchAll(/<(?:script src|link rel="stylesheet" href)="([^"]+)"/g)) {
  assert.ok(endereco.endsWith(`?v=${versao}`), `${endereco} sem ?v=${versao} no index.html`); count++;
}
assert.match(sw, /cache: 'reload'/, 'o service worker deve baixar sem o cache do navegador'); count++;
for (const arquivo of new Set(referenciados)) {
  assert.ok(lista.includes(arquivo), `sw.js não guarda ${arquivo}`); count++;
}
for (const arquivo of lista) {
  assert.ok(fs.existsSync(path.join(raiz, arquivo)), `arquivo ausente: ${arquivo}`); count++;
}
const manifesto = JSON.parse(fs.readFileSync(path.join(raiz, 'manifest.webmanifest'), 'utf8'));
for (const campo of ['name', 'short_name', 'start_url', 'scope', 'display', 'icons', 'theme_color', 'background_color']) {
  assert.ok(manifesto[campo], `manifesto sem ${campo}`); count++;
}
const tamanhos = manifesto.icons.map(i => i.sizes);
assert.ok(tamanhos.includes('192x192') && tamanhos.includes('512x512'), 'ícones 192 e 512'); count++;
assert.ok(manifesto.icons.some(i => i.purpose === 'maskable'), 'ícone maskable'); count++;
for (const icone of manifesto.icons) {
  assert.ok(lista.includes(icone.src), `ícone fora do cache: ${icone.src}`);
  const buffer = fs.readFileSync(path.join(raiz, icone.src));
  if (icone.type === 'image/png') {
    const largura = buffer.readUInt32BE(16), altura = buffer.readUInt32BE(20);
    assert.equal(`${largura}x${altura}`, icone.sizes, `tamanho real de ${icone.src}`);
  }
  count++;
}
// Todo arquivo .js do projeto deve estar na página (evita módulo esquecido).
const todos = [];
const varrer = pasta => fs.readdirSync(path.join(raiz, pasta), { withFileTypes: true }).forEach(e => {
  const rel = `${pasta}/${e.name}`;
  if (e.isDirectory()) varrer(rel); else if (rel.endsWith('.js')) todos.push(rel);
});
varrer('js');
for (const arquivo of todos) { assert.ok(html.includes(`src="${arquivo}?v=`), `index.html não carrega ${arquivo}`); count++; }
console.log(`${count} verificações do PWA (cache, arquivos, manifesto e ícones): OK`);
