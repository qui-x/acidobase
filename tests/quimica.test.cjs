const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const ctx={};ctx.window=ctx;vm.createContext(ctx);
for(const f of ['js/core/namespace.js','js/data/catalogo.js','js/simulation/quimica.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),ctx);
const {chem}=ctx.SIAB;
const tube=(o={})=>({solution:'hcl',concentration:.1,initialVolume:25,titrant:'naoh',titrantConcentration:.1,additions:[],...o});
let count=0;const near=(actual,expected,tol=1e-6)=>{assert.ok(Math.abs(actual-expected)<tol,`${actual} ≠ ${expected}`);count++;};
// Benchmarks from OpenStax 14.7, ex. 14.21–14.22; mL outside the UI
// capacity are valid here to compare the published textbook quantities.
near(chem.solve(tube()).pH,1);
near(chem.solve(tube({additions:[12.5]})).pH,-Math.log10(.0025-.00125)+Math.log10(.0375));
near(chem.solve(tube({additions:[25]})).pH,7);
near(chem.solve(tube({additions:[37.5]})).pH,14+Math.log10(.02));
near(chem.solve(tube({solution:'acetic'})).pH,2.87,.01);
near(chem.solve(tube({solution:'acetic',additions:[12.5]})).pH,4.74,.01);
near(chem.solve(tube({solution:'acetic',additions:[25]})).pH,8.72,.01);
near(chem.solve(tube({solution:'ammonia',titrant:'hcl',additions:[25]})).pH,5.28,.01);
near(chem.solve(tube({solution:'water',titrant:'water'})).pH,7);
near(chem.solve(tube({concentration:1e-10})).pH,6.99978285,1e-6);
const twenty=tube({concentration:.01,initialVolume:1,titrantConcentration:.01,additions:Array(20).fill(.05)});
near(chem.solve(twenty).pH,7);assert.ok(chem.solve(twenty).atEquivalence);
assert.equal(chem.color('btb',6.8).name,'verde');
assert.equal(chem.color('phenol',7).name,'incolor');
assert.equal(chem.color('methyl',5).name,'amarelo');
console.log(`${count} verificações numéricas + equivalência e cores: OK`);
