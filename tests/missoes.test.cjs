// Percorre todas as missões sem navegador: cada passo "agir" precisa estar
// pendente no início e ficar concluído depois da demonstração; as respostas
// esperadas dos passos "prever" precisam existir entre as opções.
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), assert = require('node:assert/strict');
const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
const arquivos = ['core/namespace', 'core/util', 'data/catalogo', 'data/cotidiano', 'data/sais', 'data/ambiente-saude', 'data/funcoes',
  'simulation/quimica', 'core/estado', 'core/loja', 'core/progresso', 'data/missoes', 'data/trilhas', 'simulation/motor-missoes'];
for (const nome of arquivos) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', nome + '.js'), 'utf8'), ctx);
const { SIAB } = ctx;
let passos = 0;
const ids = new Set();
for (const def of SIAB.missoes) {
  assert.ok(!ids.has(def.id), 'id repetido ' + def.id); ids.add(def.id);
  assert.ok(def.bancada.tubos.length && def.passos.length, def.id);
  for (const spec of def.bancada.tubos) assert.ok(SIAB.solutions[spec.solution] && SIAB.solutions[spec.titrant || 'naoh'], `${def.id}: solução desconhecida`);
  SIAB.motor.iniciar(def.id);
  SIAB.usarBancada('mission');
  const nomes = SIAB.state.tubes.map(t => t.name);
  assert.equal(new Set(nomes).size, nomes.length, `${def.id}: nomes de tubos repetidos`);
  while (!SIAB.motor.ativa.concluida) {
    const p = SIAB.motor.passo();
    if (p.tipo === 'prever') {
      const esperado = SIAB.motor.gabarito(p);
      if (p.porTubo) {
        assert.ok(esperado, `${def.id}/${p.id}: gabarito por tubo`);
        for (const nome of nomes) {
          assert.ok(p.opcoes.includes(esperado[nome]), `${def.id}/${p.id}: ${nome} → ${esperado[nome]}`);
          SIAB.motor.responderTubo(p.id, nome, esperado[nome]);
        }
      } else {
        assert.ok(p.opcoes.includes(esperado), `${def.id}/${p.id}: gabarito "${esperado}" fora das opções`);
        SIAB.motor.responder(p.id, esperado);
      }
    }
    if (p.tipo === 'quiz') {
      assert.ok(p.correta >= 0 && p.correta < p.opcoes.length, `${def.id}/${p.id}`);
      SIAB.motor.responder(p.id, p.correta);
    }
    if (p.tipo === 'explicar') {
      assert.equal(SIAB.motor.concluido(), false, `${def.id}/${p.id}: explicação vazia não conclui`);
      assert.ok(p.modelo, `${def.id}/${p.id}: resposta modelo`);
      SIAB.motor.responder(p.id, 'Minha explicação.');
    }
    if (p.tipo === 'agir') {
      assert.equal(SIAB.motor.concluido(), false, `${def.id}: "${p.texto}" já começa concluído`);
      p.demo();
      assert.equal(SIAB.motor.concluido(), true, `${def.id}: demonstração não conclui "${p.texto}"`);
      if (p.progresso) assert.equal(typeof p.progresso(SIAB.motor.contexto()), 'string');
    }
    if (p.tipo === 'observar' && p.conferir) {
      assert.ok(def.passos.some(x => x.id === p.conferir), `${def.id}: conferir ${p.conferir}`);
    }
    assert.ok(SIAB.motor.avancar(), `${def.id}: não avançou no passo ${p.tipo}`);
    passos++;
  }
  // Com as respostas esperadas, o resumo não deve ter nenhum ✗.
  assert.ok(!SIAB.motor.resumo().some(([, valor]) => valor.includes('✗')), `${def.id}: resumo com erro`);
  assert.ok(SIAB.progresso.missao(def.id)?.concluida, def.id);
}
// Toda missão e todo desafio das trilhas existem.
const desafios = ['detetive', 'titulacao', 'trunfo', 'regua', 'construtor'];
for (const trilha of SIAB.trilhas) for (const item of trilha.itens) {
  if (item.tipo === 'missao') assert.ok(ids.has(item.id), 'trilha → missão ' + item.id);
  else assert.ok(desafios.includes(item.id), 'trilha → desafio ' + item.id);
}
assert.equal(SIAB.trilhas.flatMap(t => t.itens).filter(i => i.tipo === 'missao').length, SIAB.missoes.length);
console.log(`${SIAB.missoes.length} missões e ${passos} passos percorridos; gabaritos coerentes com o motor: OK`);
