const fs = require("node:fs"),
  vm = require("node:vm"),
  path = require("node:path");
const root = path.resolve(__dirname, "..");
const files = [
  "js/core/namespace.js",
  "js/core/util.js",
  "js/data/catalogo.js",
  "js/data/cotidiano.js",
  "js/data/sais.js",
  "js/data/ambiente-saude.js",
  "js/data/reagentes.js",
  "js/data/amostras.js",
  "js/data/funcoes.js",
  "js/simulation/quimica.js",
  "js/simulation/condutividade.js",
  "js/core/estado.js",
];
function load(extra = [], storage = {}) {
  const ctx = {
    console,
    Map,
    Set,
    WeakMap,
    Date,
    Math,
    JSON,
    Number,
    Object,
    Array,
    String,
    Boolean,
    Infinity,
    performance,
    structuredClone,
    setTimeout,
    clearTimeout,
    document: { documentElement: { dataset: {} }, getElementById: () => null },
    localStorage: {
      getItem: (k) => storage[k] ?? null,
      setItem: (k, v) => {
        storage[k] = v;
      },
    },
  };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const f of [...files, ...extra])
    vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, {
      filename: f,
    });
  return { SIAB: ctx.SIAB, ctx, storage };
}
const tube = (SIAB, options = {}) => ({
  ...SIAB.TUBE_DEFAULTS,
  additions: [],
  ...options,
});
module.exports = { root, load, tube };
