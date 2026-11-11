"use strict";
/* Persistência sem perdas da bancada.
   A tabela compacta é apenas apresentação; a economia de armazenamento ocorre
   aqui, em cópias para salvar. O estado científico em memória nunca é alterado.
   Formatos antigos (JSON integral) continuam legíveis. */
SIAB.persistencia = (() => {
  const memoria = new Map(),
    pendentes = new Set(),
    avisos = new Set();
  const objeto = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  const proprio = (v, k) => Object.prototype.hasOwnProperty.call(v, k);

  // Compressão reversível de gotas consecutivas de mesmo volume.
  // Não arredonda os números e preserva a sequência e as meias gotas.
  function agruparGotas(v) {
    if (!Array.isArray(v) || v.length < 12 ||
        !v.every((x) => typeof x === "number" && Number.isFinite(x)))
      return v;
    const grupos = [];
    for (const n of v) {
      const ultimo = grupos.at(-1);
      if (ultimo && ultimo[0] === n) ultimo[1]++;
      else grupos.push([n, 1]);
    }
    const packed = { __siabGotasRleV1: grupos };
    return JSON.stringify(packed).length < JSON.stringify(v).length ? packed : v;
  }
  function empacotarValor(value) {
    if (Array.isArray(value)) return value.map(empacotarValor);
    if (!objeto(value)) return value;
    const o = {};
    for (const [k, v] of Object.entries(value))
      o[k] = k === "additions" ? agruparGotas(v) : empacotarValor(v);
    return o;
  }
  function expandirValor(value) {
    if (Array.isArray(value)) return value.map(expandirValor);
    if (!objeto(value)) return value;
    if (proprio(value, "__siabGotasRleV1")) {
      const resultado = [];
      for (const [n, vezes] of value.__siabGotasRleV1) {
        if (!Number.isFinite(n) || !Number.isSafeInteger(vezes) ||
            vezes < 1 || resultado.length + vezes > 2000000)
          throw new Error("Sequência de gotas inválida");
        for (let i = 0; i < vezes; i++) resultado.push(n);
      }
      return resultado;
    }
    if (value.__siabHistoricoDeltaV1 === 1) return expandirHistorico(value);
    const o = {};
    for (const [k, v] of Object.entries(value)) o[k] = expandirValor(v);
    return o;
  }

  // Diferenças entre cópias de Desfazer, sem alterar a precisão experimental.
  // Uma nova gota ou medição registra apenas o acréscimo à cópia anterior.
  function diferenca(antes, depois, path, changes) {
    if (Object.is(antes, depois)) return;
    if (Array.isArray(antes) && Array.isArray(depois)) {
      for (let i = 0; i < Math.min(antes.length, depois.length); i++)
        diferenca(antes[i], depois[i], [...path, i], changes);
      if (depois.length > antes.length)
        changes.push(["a", path, empacotarValor(depois.slice(antes.length))]);
      else if (depois.length < antes.length)
        changes.push(["l", path, depois.length]);
      return;
    }
    if (objeto(antes) && objeto(depois)) {
      for (const k of Object.keys(antes))
        if (!proprio(depois, k)) changes.push(["d", [...path, k]]);
      for (const [k, v] of Object.entries(depois)) {
        if (!proprio(antes, k)) changes.push(["s", [...path, k], empacotarValor(v)]);
        else diferenca(antes[k], v, [...path, k], changes);
      }
      return;
    }
    changes.push(["s", path, empacotarValor(depois)]);
  }
  function aplicarMudancas(base, changes) {
    let atual = base;
    const dentro = (path) => path.reduce((v, k) => v[k], atual);
    for (const [tipo, path, value] of changes) {
      if (tipo === "a") dentro(path).push(...expandirValor(value));
      else if (tipo === "l") dentro(path).length = value;
      else if (tipo === "s") {
        if (!path.length) atual = expandirValor(value);
        else dentro(path.slice(0, -1))[path.at(-1)] = expandirValor(value);
      } else if (tipo === "d") delete dentro(path.slice(0, -1))[path.at(-1)];
      else throw new Error("Operação do histórico inválida");
    }
    return atual;
  }
  function empacotarHistorico(history) {
    if (!Array.isArray(history) || history.length < 2) return history;
    // Se alguma entrada antiga não puder ser lida, salva a lista original.
    try {
      let anterior = JSON.parse(history[0].copia);
      const entradas = [];
      for (let i = 0; i < history.length; i++) {
        const { copia, ...campos } = history[i];
        if (typeof copia !== "string") return history;
        const changes = [];
        if (i) {
          const proxima = JSON.parse(copia);
          diferenca(anterior, proxima, [], changes);
          anterior = proxima;
        }
        entradas.push({ campos, changes });
      }
      const packed = {
        __siabHistoricoDeltaV1: 1,
        base: empacotarValor(JSON.parse(history[0].copia)),
        entradas,
      };
      return JSON.stringify(packed).length < JSON.stringify(history).length
        ? packed : history;
    } catch (_) {
      return history;
    }
  }
  function expandirHistorico(packed) {
    if (!Array.isArray(packed.entradas) || !packed.entradas.length)
      throw new Error("Histórico compactado inválido");
    let estado = expandirValor(packed.base);
    return packed.entradas.map((entrada, i) => {
      if (i) estado = aplicarMudancas(estado, entrada.changes);
      return { ...entrada.campos, copia: JSON.stringify(estado) };
    });
  }
  function bancada(v) {
    if (!objeto(v) || !Array.isArray(v.tubes) || !Array.isArray(v.history))
      return v;
    const resultado = JSON.parse(JSON.stringify(v));
    resultado.history = empacotarHistorico(resultado.history);
    return empacotarValor(resultado);
  }
  // Meta operacional (não é uma quota imposta ao IndexedDB).
  const META_BYTES = 100 * 1024 * 1024;
  const BANCO = "SIAB-Dados-Cientificos";
  const STORE = "registros";
  const registros = new Map();
  const gravacoes = new Map();
  const erros = new Map();
  let banco = null, inicializacao = null, processamento = null;
  let backend = "localStorage";

  function experimental(chave) {
    return chave === "siab_bancada_v2" ||
      chave === "siab_investigacao_v2" ||
      chave === "siab_relatorios_v1" ||
      chave.startsWith("siab_atividade_");
  }
  function chaveBancada(chave) {
    return chave === "siab_bancada_v2" || chave.startsWith("siab_atividade_");
  }
  function codificar(chave, valor) {
    if (!chaveBancada(chave) || !objeto(valor)) return valor;
    if (chave === "siab_bancada_v2") return bancada(valor);
    return { ...valor, bench: bancada(valor.bench) };
  }
  function decodificar(chave, valor) {
    if (!chaveBancada(chave) || !objeto(valor)) return valor;
    if (chave === "siab_bancada_v2") return expandirValor(valor);
    return { ...valor, bench: expandirValor(valor.bench) };
  }

  function abrirBanco() {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("IndexedDB indisponível"));
        return;
      }
      const req = indexedDB.open(BANCO, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE))
          req.result.createObjectStore(STORE, { keyPath: "chave" });
      };
      req.onsuccess = () => {
        const db = req.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };
      req.onerror = () => reject(req.error || new Error("IndexedDB indisponível"));
      req.onblocked = () => reject(new Error("Banco bloqueado por outra aba"));
    });
  }
  function consultar(chave) {
    return new Promise((resolve, reject) => {
      const tx = banco.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(chave);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }
  function listar() {
    return new Promise((resolve, reject) => {
      const tx = banco.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }
  function escrever(chave, conteudo) {
    return new Promise((resolve, reject) => {
      const tx = banco.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({ chave, conteudo, atualizadoEm: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error || new Error("Falha no IndexedDB"));
      tx.onabort = () => reject(tx.error || new Error("Gravação interrompida"));
    });
  }
  function aviso(chave, mensagem) {
    if (avisos.has(chave)) return;
    avisos.add(chave);
    SIAB.notice(mensagem);
  }
  function avisarFalha(chave, erro) {
    const quota = erro?.name === "QuotaExceededError" ||
      erro?.code === 22 || erro?.code === 1014;
    const bloqueado = erro?.name === "SecurityError";
    aviso(chave, quota
      ? "O navegador atingiu a quota real disponível para os dados científicos. Exporte seus registros; o SIAB não excluirá experimentos automaticamente."
      : bloqueado
        ? "O armazenamento do navegador está bloqueado. Seus resultados desta sessão ainda estão na memória; exporte antes de fechar."
        : "Não foi possível confirmar o salvamento. Preserve seus dados por exportação antes de fechar.");
  }

  // Carrega a base ANTES do início do laboratório. O simulador pode continuar
  // usando leituras síncronas do Map já hidratado durante a investigação.
  async function iniciar() {
    if (inicializacao) return inicializacao;
    inicializacao = (async () => {
      try {
        banco = await abrirBanco();
        const existentes = await listar();
        backend = "indexedDB";
        for (const item of existentes) {
          if (!experimental(item.chave)) continue;
          try {
            registros.set(item.chave, decodificar(item.chave, JSON.parse(item.conteudo)));
          } catch (erro) {
            erros.set(item.chave, erro);
            aviso(item.chave,
              "Há dados do SIAB que não puderam ser interpretados. A cópia não será sobrescrita; exporte seus registros.");
          }
        }
        // Migração não destrutiva e idempotente. Uma cópia antiga permanece
        // em localStorage para recuperação; todos os novos salvamentos usam IDB.
        let antigas = [];
        try {
          antigas = Array.from({ length: localStorage.length },
            (_, i) => localStorage.key(i)).filter(k => k && experimental(k));
        } catch (_) { /* O IndexedDB continua funcional. */ }
        for (const chave of antigas) {
          if (registros.has(chave) || erros.has(chave)) continue;
          try {
            const original = localStorage.getItem(chave);
            if (original === null) continue;
            const valor = decodificar(chave, JSON.parse(original));
            await escrever(chave, original);
            const verificado = await consultar(chave);
            if (!verificado || verificado.conteudo !== original)
              throw new Error("Cópia migrada não coincide com a origem");
            registros.set(chave, valor);
          } catch (erro) {
            erros.set(chave, erro);
            aviso(chave, "A migração de um registro não foi confirmada. Sua cópia original foi mantida no navegador.");
          }
        }
      } catch (erro) {
        backend = "localStorage";
        banco?.close();
        banco = null;
        // Fallback explícito: pode continuar limitado pelo localStorage.
        aviso("indexedDB", "IndexedDB indisponível neste navegador. O SIAB usará armazenamento local limitado; exporte suas investigações.");
      }
      return backend;
    })();
    return inicializacao;
  }

  function ler(chave, padrao) {
    if (registros.has(chave)) return registros.get(chave) ?? padrao;
    if (pendentes.has(chave)) return memoria.get(chave) ?? padrao;
    if (erros.has(chave)) return memoria.get(chave) ?? padrao;
    try {
      const valor = localStorage.getItem(chave);
      return valor === null ? (memoria.get(chave) ?? padrao)
        : decodificar(chave, JSON.parse(valor));
    } catch (_) {
      return memoria.get(chave) ?? padrao;
    }
  }
  function otimizarLegados(excluir) {
    let liberados = 0, keys;
    try { keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)); }
    catch (_) { return 0; }
    for (const chave of keys) {
      if (!chave || chave === excluir || !chaveBancada(chave)) continue;
      try {
        const antiga = localStorage.getItem(chave);
        if (!antiga || antiga.includes('"__siabHistoricoDeltaV1"')) continue;
        const atual = decodificar(chave, JSON.parse(antiga));
        const menor = JSON.stringify(codificar(chave, atual));
        if (menor && menor.length < antiga.length) {
          localStorage.setItem(chave, menor);
          liberados += antiga.length - menor.length;
        }
      } catch (_) { /* Preserva os legados ilegíveis. */ }
    }
    return liberados;
  }
  const ehQuota = erro => erro?.name === "QuotaExceededError" ||
    erro?.code === 22 || erro?.code === 1014;

  function salvarLocal(chave, valor) {
    memoria.set(chave, valor);
    try {
      const conteudo = JSON.stringify(codificar(chave, valor));
      try {
        localStorage.setItem(chave, conteudo);
      } catch (erro) {
        if (!ehQuota(erro) || otimizarLegados(chave) <= 0) throw erro;
        localStorage.setItem(chave, conteudo);
      }
      pendentes.delete(chave);
      avisos.delete(chave);
      return true;
    } catch (erro) {
      pendentes.add(chave);
      avisarFalha(chave, erro);
      return false;
    }
  }
  async function gravarPendentes() {
    while (gravacoes.size) {
      const lote = [...gravacoes.entries()];
      gravacoes.clear();
      for (const [chave, conteudo] of lote) {
        try {
          await escrever(chave, conteudo);
          erros.delete(chave);
          avisos.delete(chave);
        } catch (erro) {
          erros.set(chave, erro);
          avisarFalha(chave, erro);
        }
      }
    }
  }
  function agendarGravacao() {
    if (processamento) return;
    processamento = Promise.resolve().then(gravarPendentes).finally(() => {
      processamento = null;
      if (gravacoes.size) agendarGravacao();
    });
  }
  function salvar(chave, valor) {
    if (!experimental(chave) || backend !== "indexedDB")
      return salvarLocal(chave, valor);
    // Registro recebido em memória sem apagar o IDB anterior em caso de erro.
    if (erros.has(chave)) {
      registros.set(chave, valor);
      aviso(chave, "Este registro requer recuperação manual antes de poder substituir o banco.");
      return false;
    }
    registros.set(chave, valor);
    try {
      gravacoes.set(chave, JSON.stringify(codificar(chave, valor)));
      agendarGravacao();
      return true; // Enfileirado; aguarde quandoSalvar() para confirmar.
    } catch (erro) {
      erros.set(chave, erro);
      avisarFalha(chave, erro);
      return false;
    }
  }
  async function quandoSalvar() {
    // Contrato para exportação/testes: resolve apenas após o último commit.
    while (processamento || gravacoes.size) {
      if (processamento) await processamento;
      else agendarGravacao();
    }
    if (erros.size) throw new Error("Alguns registros não foram confirmados pelo armazenamento");
    return true;
  }
  async function situacao() {
    const estimate = await navigator.storage?.estimate?.().catch(() => null);
    const persisted = await navigator.storage?.persisted?.().catch(() => false);
    return {
      tecnologia: backend,
      metaBytes: META_BYTES,
      usadosOrigem: estimate?.usage ?? null,
      quotaOrigem: estimate?.quota ?? null,
      protegido: Boolean(persisted),
      pendentes: gravacoes.size + (processamento ? 1 : 0),
      falhas: [...erros.keys()],
    };
  }
  async function proteger() {
    if (typeof navigator.storage?.persist !== "function") return false;
    return Boolean(await navigator.storage.persist());
  }
  function diagnostico() {
    if (backend === "indexedDB") return {
      tecnologia: backend, chaves: [...registros.keys()].filter(experimental),
      metaBytes: META_BYTES, falhas: [...erros.keys()],
    };
    try {
      const chaves = [];
      for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        if (chave?.startsWith("siab_"))
          chaves.push({ chave, caracteres: localStorage.getItem(chave)?.length || 0 });
      }
      return chaves.sort((a,b) => b.caracteres - a.caracteres);
    } catch (_) { return null; }
  }
  return { iniciar, ler, salvar, quandoSalvar, situacao, proteger, diagnostico, META_BYTES };
})();
