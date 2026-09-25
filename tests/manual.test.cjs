// Manual digital: seções, links de ajuda, alvos na página e roteiros de teste.
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), assert = require('node:assert/strict');
const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
const arquivos = ['core/namespace', 'core/util', 'data/catalogo', 'data/cotidiano', 'data/sais', 'data/ambiente-saude', 'data/funcoes',
  'simulation/quimica', 'core/estado', 'core/loja', 'core/progresso', 'core/roteador', 'data/manual', 'ui/render', 'telas/manual'];
for (const nome of arquivos) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', nome + '.js'), 'utf8'), ctx);
const { SIAB } = ctx;
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let count = 0;

// Seções: ids únicos, conteúdo e alvos que existem no index.html.
const ids = SIAB.manual.map(s => s.id);
assert.equal(new Set(ids).size, ids.length, 'ids repetidos'); count++;
const existe = seletor => seletor.startsWith('#')
  ? new RegExp(`id="${seletor.slice(1)}"`).test(html)
  : new RegExp(`class="[^"]*\\b${seletor.slice(1)}\\b`).test(html);
for (const s of SIAB.manual) {
  assert.ok(s.titulo && s.resumo && s.blocos.length, s.id); count++;
  if (s.alvo) { assert.ok(existe(s.alvo), `${s.id}: alvo ${s.alvo} não existe na página`); count++; }
  if (s.nivel) { assert.ok(['explorar', 'medir', 'calcular'].includes(s.nivel), s.id); count++; }
  for (const b of s.blocos) {
    if (b.gerado) { assert.ok(['diagrama', 'roteiros', 'frascos', 'indicadores'].includes(b.gerado), `${s.id}: gerado ${b.gerado}`); count++; }
  }
}
// Cada parte da bancada tem seção; cada "?" da página leva a uma seção existente.
for (const parte of ['comecar', 'menu', 'prateleira', 'indicadores', 'medidas', 'leitura', 'conta-gotas', 'prever', 'ver', 'tubos', 'caderno', 'roteiros', 'frascos', 'tabela-indicadores', 'acessibilidade', 'app', 'limites']) {
  assert.ok(ids.includes(parte), `falta a seção ${parte}`); count++;
}
const links = [...html.matchAll(/href="#\/manual\/([^"]+)"/g)].map(m => m[1]);
assert.ok(links.length >= 7, 'links de ajuda na bancada');
for (const id of links) { assert.ok(ids.includes(id), `link de ajuda para seção inexistente: ${id}`); count++; }

// Roteiros: frascos válidos, cabem na bancada e resultados esperados de livro.
for (const r of SIAB.roteiros) {
  assert.ok(r.tubos.length >= 1 && r.tubos.length <= SIAB.MAX_TUBES, r.id);
  assert.ok(['explorar', 'medir', 'calcular'].includes(r.nivel), r.id);
  assert.ok(['grafico', 'particulas', 'equacao', 'historico'].includes(r.ver), r.id);
  const nomes = r.tubos.map(t => t.name);
  assert.equal(new Set(nomes).size, nomes.length, `${r.id}: nomes repetidos`);
  for (const t of r.tubos) {
    assert.ok(SIAB.solutions[t.solution] && SIAB.solutions[t.titrant], `${r.id}: frasco desconhecido`);
    assert.ok(SIAB.indicators[t.indicator], `${r.id}: indicador desconhecido`);
  }
  assert.ok(SIAB.manualTela.esperado(r).length >= r.tubos.length, r.id);
  count++;
}
const texto = id => SIAB.manualTela.esperado(SIAB.roteiros.find(r => r.id === id)).map(([a, b]) => `${a} ${b}`).join(' | ');
assert.match(texto('titulacao-forte'), /equivalência em 1,00 mL \(20 gotas\), pH 7,00/); count++;
assert.match(texto('titulacao-forte'), /Bromotimol muda na gota \d+ \(amarelo → verde\)/); count++;
assert.match(texto('titulacao-fraco'), /pH 8,22/); count++;
assert.match(texto('titulacao-fraco'), /meia-equivalência em 0,50 mL, pH 4,7\d \(= pKa\)/); count++;
assert.match(texto('titulacao-base-fraca'), /pH 5,78/); count++;
assert.match(texto('tampao'), /Depois de 2 gotas água pH 3,04 · tampão pH 4,66/); count++;
assert.match(texto('sais'), /NH₄Cl pH inicial 5,13/); count++;
assert.match(texto('chuva'), /Chuva limpa pH inicial ≈ 5,6/); count++;
assert.match(texto('antiacidos'), /Al\(OH\)₃ pH 4,0\d/); count++;
console.log(`${count} verificações do manual (seções, links de ajuda, alvos e roteiros): OK`);
