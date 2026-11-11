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
  function ler(chave, padrao) {
    if (pendentes.has(chave)) return memoria.get(chave) ?? padrao;
    try {
      const v = localStorage.getItem(chave);
      return v === null
        ? (memoria.get(chave) ?? padrao)
        : decodificar(chave, JSON.parse(v));
    } catch (_) {
      // Não descarta o registro antigo: evita sobrescrevê-lo nesta leitura.
      return memoria.get(chave) ?? padrao;
    }
  }
  function salvar(chave, valor) {
    memoria.set(chave, valor);
    try {
      localStorage.setItem(chave, JSON.stringify(codificar(chave, valor)));
      pendentes.delete(chave);
      avisos.delete(chave);
      return true;
    } catch (erro) {
      pendentes.add(chave);
      if (!avisos.has(chave)) {
        avisos.add(chave);
        const quota = erro?.name === "QuotaExceededError" ||
          erro?.code === 22 || erro?.code === 1014;
        const bloqueado = erro?.name === "SecurityError";
        SIAB.notice(quota
          ? "O armazenamento local atingiu seu limite. Exporte seus registros antes de fechar; nada será apagado automaticamente."
          : bloqueado
            ? "Este navegador bloqueou o armazenamento local. Habilite os dados do site ou exporte seus registros antes de fechar."
            : "Não foi possível salvar os dados no navegador. Exporte seus registros antes de fechar.");
      }
      return false;
    }
  }
  // Diagnóstico apenas de tamanhos, sem revelar o conteúdo das investigações.
  function diagnostico() {
    try {
      const chaves = [];
      for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        if (chave?.startsWith("siab_"))
          chaves.push({ chave, caracteres: localStorage.getItem(chave)?.length || 0 });
      }
      return chaves.sort((a, b) => b.caracteres - a.caracteres);
    } catch (_) { return null; }
  }
  return { ler, salvar, diagnostico };
})();
