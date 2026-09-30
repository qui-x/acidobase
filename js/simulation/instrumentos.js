"use strict";
SIAB.instrumentos = (() => {
  const timers = new Map();
  const permitido = (id) =>
    !SIAB.atividades?.ativa ||
    SIAB.atividades.ativa.config.instrumentos.includes(id);
  const dados = (t) =>
    (t.observacao ||= {
      modo: "pontual",
      calibracao: "Referência ideal de fábrica",
      leituras: [],
      eventos: [],
    });
  function evento(t, acao, leitura) {
    const d = dados(t),
      r = SIAB.chem.solve(t);
    d.eventos.push({
      em: new Date().toISOString(),
      acao,
      volume: r.volume,
      adicionado: r.added,
      temperatura: r.temperature,
      leitura: leitura || null,
    });
    if (d.eventos.length > 4000) d.eventos.shift();
  }
  function registrar(t, tecnica) {
    if (!permitido(tecnica)) return false;
    const d = dados(t),
      r = SIAB.chem.solve(t);
    const value =
      tecnica === "fita"
        ? Math.max(0, Math.min(14, Math.round(r.pH)))
        : Number(r.pH.toFixed(2));
    const m = {
      tecnica,
      valor: value,
      signature: r.signature,
      em: new Date().toISOString(),
      temperatura: r.temperature,
      volume: r.volume,
      adicionado: r.added,
      resolucao: tecnica === "fita" ? 1 : 0.01,
    };
    d.ph = m;
    d.status = "estável";
    d.leituras.push(m);
    evento(t, "Medição de pH", m);
    return m;
  }
  function medir(t, tecnica, modo = "pontual") {
    if (!t || !permitido(tecnica)) {
      SIAB.notice("Instrumento não disponível nesta atividade.");
      return;
    }
    if (SIAB.chem.solve(t).volume <= 0) {
      SIAB.notice(
        "O recipiente está vazio. Adicione uma solução antes de medir.",
      );
      return;
    }
    const d = dados(t);
    d.modo = tecnica === "phmetro" ? modo : "pontual";
    if (tecnica === "fita") {
      registrar(t, tecnica);
      SIAB.loja.avisar();
      return;
    }
    d.status = "estabilizando";
    agendar(t);
    SIAB.render();
  }
  function agendar(t) {
    const key = t;
    clearTimeout(timers.get(key));
    timers.set(
      key,
      setTimeout(() => {
        timers.delete(key);
        if (!SIAB.state.tubes.includes(t)) return;
        registrar(t, "phmetro");
        SIAB.loja.avisar();
      }, 500),
    );
  }
  function atualizar() {
    for (const t of SIAB.state.tubes) {
      const d = dados(t),
        r = SIAB.chem.solve(t);
      if (d.ultimoEstado !== r.signature) {
        if (d.ultimoEstado) evento(t, "Alteração da solução");
        d.ultimoEstado = r.signature;
        if (d.modo === "continuo" && permitido("phmetro")) {
          d.status = "estabilizando";
          agendar(t);
        }
      }
    }
  }
  function leitura(t) {
    if (!t)
      return { texto: "pH não medido", curto: "não medido", valida: false };
    const d = dados(t),
      m = d.ph,
      r = SIAB.chem.solve(t);
    if (!m)
      return { texto: "pH não medido", curto: "não medido", valida: false };
    const stale = m.signature !== r.signature;
    const str = SIAB.format(m.valor, m.tecnica === "fita" ? 0 : 2);
    const texto = `${m.tecnica === "fita" ? "pH estimado ≈" : "pH medido ="} ${str}${stale ? " · leitura anterior" : ""}`;
    return {
      ...m,
      texto,
      curto: `${m.tecnica === "fita" ? "≈ " : ""}${str}${stale ? " (anterior)" : ""}`,
      valida: !stale,
      anterior: stale,
    };
  }
  function indicador(t) {
    const r = SIAB.chem.solve(t),
      ind = SIAB.indicators[t.indicator];
    if (t.indicator === "none") return "Adicione um indicador à solução.";
    const range = SIAB.chem.colorRange(t.indicator, r.indicator.name);
    return `${ind.name}: ${r.indicator.name}${range ? ` · faixa de cor aproximada ${SIAB.format(range[0], 1)}–${SIAB.format(range[1], 1)}` : ""}. A cor não determina um pH exato.`;
  }
  function parar(t) {
    if (!t) return;
    dados(t).modo = "pontual";
    clearTimeout(timers.get(t));
    timers.delete(t);
  }
  return {
    dados,
    medir,
    registrar,
    atualizar,
    leitura,
    indicador,
    permitido,
    evento,
    parar,
  };
})();
SIAB.ambiente = { externa: null, bancada: 25, origem: "Referência 25 °C" };
SIAB.temperaturaLocal = async (cidade) => {
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), 6500);
  try {
    if (!cidade?.trim()) throw new Error("Informe a cidade, sem endereço.");
    const a = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade.trim())}&count=1&language=pt`,
      { signal: timeout.signal },
    );
    if (!a.ok) throw new Error("Consulta indisponível");
    const json = await a.json(),
      loc = json.results?.[0];
    if (!loc) throw new Error("Cidade não encontrada");
    // A coordenada da cidade existe somente nesta consulta; nunca é persistida.
    const b = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m`,
      { signal: timeout.signal },
    );
    if (!b.ok) throw new Error("Consulta indisponível");
    const w = await b.json(),
      v = Number(w.current?.temperature_2m);
    if (!Number.isFinite(v)) throw new Error("Temperatura indisponível");
    SIAB.ambiente = {
      externa: v,
      bancada: Math.max(0, Math.min(100, v)),
      origem: `Ambiente local: ${loc.name}`,
    };
    SIAB.notice(
      "Temperatura externa consultada. Aplique à solução quando desejar.",
    );
  } catch (e) {
    SIAB.ambiente = {
      externa: null,
      bancada: 25,
      origem: "Referência 25 °C (consulta indisponível)",
    };
    SIAB.notice(`${e.message}. Use 25 °C ou informe uma temperatura manual.`);
  } finally {
    clearTimeout(timer);
    SIAB.renderVer();
  }
};
