"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { chromium, firefox, webkit } = require("playwright");
const browserName = process.env.SIAB_BROWSER || "chromium";
const launcher = { chromium, firefox, webkit }[browserName];
if (!launcher) throw Error("Browser não suportado: " + browserName);
const origin = process.env.SIAB_TEST_URL || "http://127.0.0.1:8765";

async function abrir(page) {
  await page.goto(origin + "/#/laboratorio", { waitUntil: "load" });
  await page.waitForFunction(() => window.SIAB?.workspace?.ready && window.SIAB?.persistencia?.iniciar);
}
async function registroBanco(page, chave) {
  return page.evaluate(chave => new Promise((resolve,reject) => {
    const req = indexedDB.open("SIAB-Dados-Cientificos",1);
    req.onsuccess = () => {
      const db = req.result, tx = db.transaction("registros","readonly");
      const rd = tx.objectStore("registros").get(chave);
      rd.onsuccess = () => { resolve(rd.result || null); db.close(); };
      rd.onerror = () => reject(rd.error);
    };
    req.onerror = () => reject(req.error);
  }), chave);
}

test("IndexedDB persiste gotas, medições e Desfazer após recarregar", async () => {
  const browser=await launcher.launch();
  try {
    const page=await browser.newPage({ viewport:{ width:1366,height:768 }, reducedMotion:"reduce" });
    try {
      await abrir(page);
      const before=await page.evaluate(async () => {
        const S = window.SIAB;
        S.abertura?.encerrar?.();
        document.querySelector("#abertura")?.remove();
        document.querySelectorAll("dialog[open]").forEach(el => el.close());
        if (!S.current()) S.bancada.adicionarTubo();
        S.workspace.close("left",false);
        const t = S.current();
        S.state.vidraria = "erlenmeyer";
        t.capacidade = 125;
        t.initialVolume = 25;
        const countStart = t.additions.length;
        const historyStart = S.state.history.length;
        for(let i=0;i<12;i++) {
          const n = S.bancada.gotejar(20);
          if(n!==20)throw Error("Gotejamento interrompido: "+n);
        }
        S.instrumentos.medir(t,"fita","pontual");
        S.persistencia.salvar("siab_bancada_v2",S.benches.lab);
        await S.persistencia.quandoSalvar();
        const diag = await S.persistencia.situacao();
        return {
          backend:diag.tecnologia,meta:diag.metaBytes,
          volume:S.chem.solve(t).volume,
          count:t.additions.length,countStart,
          history:S.state.history.length,historyStart,
          measurements:t.observacao.rawMeasurements.length,
        };
      });
      assert.equal(before.backend,"indexedDB");
      assert.equal(before.meta,100*1024*1024);
      assert.equal(before.count-before.countStart,240);
      assert.equal(before.history-before.historyStart,12);
      assert.ok(before.measurements>=1);
      const dbBefore=await registroBanco(page,"siab_bancada_v2");
      assert.ok(dbBefore?.conteudo.includes("__siabHistoricoDeltaV1"),"Histórico não compactado");
      assert.ok(dbBefore?.conteudo.includes("__siabGotasRleV1"),"Gotas não compactadas");
      await page.reload({waitUntil:"load"});
      await page.waitForFunction(()=>window.SIAB?.workspace?.ready &&
        window.SIAB.current()?.additions?.length>=240,{},{timeout:45000});
      const after=await page.evaluate(async ()=>{
        const S=window.SIAB,t=S.current();
        const state={
          volume:S.chem.solve(t).volume, count:t.additions.length,
          history:S.state.history.length,measurements:t.observacao.rawMeasurements.length
        };
        const undone=S.desfazer();
        S.loja.avisar();
        await S.persistencia.quandoSalvar();
        return {...state,undone,remaining:S.current().additions.length};
      });
      assert.ok(Math.abs(after.volume-before.volume)<1e-8);
      assert.equal(after.count,before.count);
      assert.equal(after.history,before.history);
      assert.equal(after.measurements,before.measurements);
      assert.equal(after.undone,"gotas");
      assert.equal(after.remaining,after.count-20);
      await page.reload({waitUntil:"load"});
      await page.waitForFunction(()=>window.SIAB?.workspace?.ready &&
        window.SIAB.current()?.additions?.length===220,{},{timeout:45000});
    } finally { await page.close(); }
  } finally { await browser.close(); }
});

test("migração do localStorage preserva Caderno, relatórios e cópia anterior",async()=>{
  const browser=await launcher.launch();
  try {
    const context=await browser.newContext({viewport:{width:1440,height:900}});
    const page=await context.newPage();
    try {
      // Os registros pré-migração são inseridos antes de carregar qualquer script.
      await context.addInitScript(() => {
        if (!localStorage.getItem("siab_investigacao_v2")) {
          localStorage.setItem("siab_investigacao_v2",JSON.stringify({
            schema:2,missoes:{},temas:{},
            caderno:[{id:"legado-1",tipo:"anotacao",titulo:"Experimento antigo",
              linhas:[["Nota","Resultado preservado"]],data:"2026-11-10T12:00:00.000Z"}]
          }));
          localStorage.setItem("siab_relatorios_v1",JSON.stringify({
            relatorioAntigo:{id:"relatorioAntigo",nome:"Registro legado"}
          }));
        }
      });
      await abrir(page);
      const result=await page.evaluate(async()=>{
        const S=window.SIAB;
        await S.persistencia.quandoSalvar();
        return {
          backend:(await S.persistencia.situacao()).tecnologia,
          notes:S.progresso.dados.caderno,
          reports:S.persistencia.ler("siab_relatorios_v1",{}),
          raw:localStorage.getItem("siab_investigacao_v2")
        };
      });
      assert.equal(result.backend,"indexedDB");
      assert.equal(result.notes[0].titulo,"Experimento antigo");
      assert.equal(result.reports.relatorioAntigo.nome,"Registro legado");
      assert.match(result.raw,/"Experimento antigo"/);
      assert.ok(await registroBanco(page,"siab_investigacao_v2"));
      assert.ok(await registroBanco(page,"siab_relatorios_v1"));
      await page.evaluate(async ()=>{
        window.SIAB.progresso.anotar({tipo:"anotacao",titulo:"Novo experimento",
          linhas:[["Nota","Armazenado em IndexedDB"]]});
        await window.SIAB.persistencia.quandoSalvar();
      });
      await page.reload({waitUntil:"load"});
      await page.waitForFunction(()=>window.SIAB?.workspace?.ready);
      const titles=await page.evaluate(()=>window.SIAB.progresso.dados.caderno.map(n=>n.titulo));
      assert.deepEqual(titles,["Novo experimento","Experimento antigo"]);
      // A cópia legada não é excluída e não cresce com gravações novas.
      assert.ok(await page.evaluate(()=>localStorage.getItem("siab_investigacao_v2")
        .includes('"Experimento antigo"')));
      assert.equal(await page.evaluate(()=>localStorage.getItem("siab_investigacao_v2")
        .includes('"Novo experimento"')),false);
    } finally { await context.close(); }
  } finally { await browser.close(); }
});

test("controles de armazenamento exibem a quota real e meta de 100 MiB",async()=>{
  const browser=await launcher.launch();
  try {
    const page=await browser.newPage();
    try {
      await abrir(page);
      const s=await page.evaluate(()=>window.SIAB.persistencia.situacao());
      assert.equal(s.metaBytes,100*1024*1024);
      assert.equal(s.tecnologia,"indexedDB");
      assert.ok(s.quotaOrigem === null || s.quotaOrigem > 0);
      await page.locator("#menu-btn").click();
      await page.locator("#drawer-storage-status").waitFor();
      await page.waitForFunction(()=>document.querySelector("#drawer-storage-status")
        .textContent.includes("IndexedDB"));
      assert.match(await page.locator("#drawer-storage-status").innerText(),/Meta: 100 MiB/);
      assert.equal(await page.locator("#drawer-storage-protect").count(),1);
    } finally {await page.close();}
  } finally {await browser.close();}
});

if(process.env.SIAB_TEST_STRESS_100MIB === "1") {
  test("100 MiB experimentais na própria persistência são salvos e recuperados",async()=>{
    const browser=await launcher.launch();
    try {
      const page=await browser.newPage();
      try {
        await abrir(page);
        await page.evaluate(async()=>{
          const S=window.SIAB;
          // 100 MiB de texto: gera em memória somente na execução do estresse.
          const texto="S".repeat(100*1024*1024);
          if(!S.persistencia.salvar("siab_relatorios_v1",{
            teste100MiB:{payload:texto,checksum:texto.length}
          }))throw Error("Não foi possível agendar o registro de 100 MiB");
          await S.persistencia.quandoSalvar();
        });
        const rec=await registroBanco(page,"siab_relatorios_v1");
        assert.ok(rec && rec.conteudo.length>100*1024*1024);
        await page.reload({waitUntil:"load"});
        await page.waitForFunction(()=>window.SIAB?.workspace?.ready,{},{timeout:120000});
        const recovered=await page.evaluate(()=>{
          const p=window.SIAB.persistencia.ler("siab_relatorios_v1",{});
          return {length:p.teste100MiB?.payload.length,
            checksum:p.teste100MiB?.checksum};
        });
        assert.equal(recovered.length,100*1024*1024);
        assert.equal(recovered.checksum,100*1024*1024);
      } finally {await page.close();}
    } finally {await browser.close();}
  });
}
