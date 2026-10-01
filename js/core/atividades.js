"use strict";
SIAB.atividades = (() => {
  let ativa = null,
    loading = 0,
    restoringToken = null,
    restoringRoute = null;
  const instrumentos = [
    "indicador",
    "fita",
    "phmetro",
    "condutividade",
    "temperatura",
    "particulas",
    "equacoes",
    "graficos",
  ];
  const base64 = (a) =>
    btoa(String.fromCharCode(...a))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  const bytes = (s) =>
    Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) =>
      c.charCodeAt(0),
    );
  function validar(c) {
    if (
      !c ||
      ![1, 2].includes(c.schema) ||
      !["roteiro", "missao", "montagem"].includes(c.tipo) ||
      !["livre", "restrita"].includes(c.navegacao) ||
      !["digital", "impresso"].includes(c.relatorio)
    )
      throw new Error("Configuração de atividade inválida.");
    const entry =
      c.tipo === "roteiro"
        ? SIAB.experimentos.find((x) => x.id === c.item)
        : c.tipo === "missao"
          ? SIAB.missoes.find((x) => x.id === c.item)
          : SIAB.montagens.find((x) => x.id === c.item);
    if (
      !entry ||
      c.modulo !==
        (entry.modulo || entry.bancada?.nivel || entry.nivel || "explorar")
    )
      throw new Error("Atividade incompatível com este catálogo.");
    if (
      !Number.isFinite(c.temperatura) ||
      c.temperatura < 0 ||
      c.temperatura > 100 ||
      !Array.isArray(c.instrumentos) ||
      c.instrumentos.some(
        (x) =>
          !instrumentos.includes(x) && !SIAB.ActivityContext.resourcePaths[x],
      )
    )
      throw new Error("Instrumentos ou temperatura inválidos.");
    SIAB.ActivityContext.validate(c);
    return {
      ...c,
      titulo: String(c.titulo || entry.titulo).slice(0, 200),
      identificacao: Object.fromEntries(
        ["nome", "turma", "data", "professor", "grupo"].map((k) => [
          k,
          String(c.identificacao?.[k] || "").slice(0, 160),
        ]),
      ),
    };
  }
  async function codificar(config) {
    if (!crypto?.subtle)
      throw new Error(
        "Geração de links requer contexto seguro (HTTPS, localhost ou arquivo local compatível).",
      );
    const c = validar(config),
      raw = crypto.getRandomValues(new Uint8Array(32)),
      iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, [
      "encrypt",
    ]);
    const body = new TextEncoder().encode(JSON.stringify(c));
    const cipher = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      body,
    );
    return `v1.${base64(raw)}.${base64(iv)}.${base64(new Uint8Array(cipher))}`;
  }
  async function decodificar(token) {
    if (typeof token !== "string" || token.length > 18000)
      throw new Error("Link inválido.");
    const [v, k, i, c, ...extra] = token.split(".");
    if (v !== "v1" || extra.length || !k || !i || !c)
      throw new Error("Link incompleto.");
    const raw = bytes(k),
      iv = bytes(i);
    if (raw.length !== 32 || iv.length !== 12)
      throw new Error("Link inválido.");
    const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, [
      "decrypt",
    ]);
    const json = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      bytes(c),
    );
    return validar(JSON.parse(new TextDecoder().decode(json)));
  }
  const chave = (token) => "siab_atividade_" + token.split(".")[1];
  const rotaAtividade = () => `#/atividade/${ativa.token}`;
  function guardarRota(nome, parametro) {
    if (restoringToken) return { nome: "atividade", parametro: restoringToken };
    if (!SIAB.ActivityContext.restricted()) return { nome, parametro };
    const go = () => ({ nome: "atividade", parametro: ativa.token });
    if (nome === "atividade")
      return parametro === ativa.token ? { nome, parametro } : go();
    if (["bancada", "relatorio", "finalizada"].includes(ativa.etapa)) {
      if (
        nome === "relatorio" &&
        (!parametro || parametro === SIAB.state?.reportId)
      )
        return { nome, parametro };
      if (
        ativa.config.tipo === "missao" &&
        (nome === "laboratorio" ||
          (nome === "missao" && parametro === ativa.config.item))
      )
        return { nome: "missao", parametro: ativa.config.item };
      if (ativa.config.tipo !== "missao" && nome === "laboratorio")
        return { nome, parametro: "" };
    }
    SIAB.notice("Navegação limitada à atividade em andamento.");
    return go();
  }
  function salvarSessao() {
    if (!ativa) return;
    const a = SIAB.motor.ativa;
    if (ativa.etapa !== "apresentacao") ativa.bench = SIAB.state;
    ativa.missao =
      a && ativa.config.tipo === "missao"
        ? {
            id: a.def.id,
            respostas: a.respostas,
            evidencias: a.evidencias,
            visitados: a.visitados,
            concluida: a.concluida,
          }
        : null;
    ativa.context.stage = ativa.etapa;
    ativa.context.identity = { ...ativa.identificacao };
    SIAB.persistencia.salvar(chave(ativa.token), {
      ...ativa,
      context: undefined,
    });
    try {
      sessionStorage.setItem("siab_atividade_ativa", ativa.token);
    } catch (_) {}
  }
  function restaurar() {
    try {
      restoringToken = sessionStorage.getItem("siab_atividade_ativa");
      restoringRoute = restoringToken ? location.hash : null;
    } catch (_) {
      restoringToken = null;
    }
  }
  function restaurarBancada() {
    if (!ativa?.bench) return;
    const type = ativa.config.tipo === "missao" ? "mission" : "lab";
    ativa.bench = SIAB.ActivityContext.sanitize(
      ativa.bench,
      ativa.config,
      ativa.context,
    );
    SIAB.benches[type] = ativa.bench;
    SIAB.usarBancada(type);
    if (ativa.missao) SIAB.motor.restaurar(ativa.missao);
  }
  async function abrir(token) {
    if (SIAB.ActivityContext.restricted() && ativa.token !== token) {
      SIAB.notice("Encerre a atividade antes de abrir outra.");
      return false;
    }
    if (!ativa) SIAB.persistencia.salvar("siab_bancada_v2", SIAB.benches.lab);
    const turn = ++loading;
    SIAB.$("atividade-conteudo").innerHTML =
      '<p role="status">Abrindo atividade…</p>';
    try {
      const config = await decodificar(token);
      if (turn !== loading) return;
      const stored = SIAB.persistencia.ler(chave(token), null);
      const saved = stored?.token === token ? stored : null;
      if (ativa?.token !== token)
        ativa = saved?.config
          ? { ...saved, config, token }
          : {
              token,
              config,
              etapa: "apresentacao",
              identificacao: { ...config.identificacao },
            };
      ativa.context = SIAB.ActivityContext.create(
        config,
        ativa.identificacao,
        ativa.etapa,
      );
      const returnRoute = restoringRoute;
      restoringToken = null;
      restoringRoute = null;
      restaurarBancada();
      salvarSessao();
      render();
      atualizarCabecalho();
      if (
        ativa.etapa === "bancada" &&
        /^#\/(laboratorio|missao)(?:\/|$)/.test(returnRoute || "")
      )
        retomar();
      if (
        returnRoute?.startsWith("#/relatorio") &&
        ativa.etapa !== "apresentacao"
      )
        SIAB.irPara(returnRoute);
    } catch (_) {
      restoringToken = null;
      SIAB.$("atividade-conteudo").innerHTML =
        '<h1 data-foco tabindex="-1">Não foi possível abrir a atividade</h1><p>O link está incompleto, foi alterado ou usa uma versão incompatível. Solicite o link completo ao professor.</p>';
    }
  }
  function render() {
    if (!ativa) return;
    const a = ativa,
      c = a.config,
      e = SIAB.escape;
    SIAB.$("atividade-conteudo").innerHTML =
      `<h1 data-foco tabindex="-1">${e(c.titulo)}</h1><p>${{ roteiro: "Roteiro Experimental", missao: "Missão", montagem: "Montagem pronta" }[c.tipo]} · ${SIAB.MODULOS[c.modulo].nome}</p><p>${SIAB.format(c.temperatura, 1)} °C · Relatório ${c.relatorio} · Navegação ${c.navegacao}</p>${a.etapa === "finalizada" ? '<h2>Atividade finalizada</h2><p>Seu relatório permanece salvo neste navegador.</p><button class="primary-btn" data-activity-close>Encerrar atividade</button>' : ["bancada", "relatorio"].includes(a.etapa) ? '<button class="primary-btn" data-activity-resume>Continuar na bancada</button><button class="secondary-btn" data-open-report>Abrir relatório</button>' : `<p>Prepare sua identificação para começar a investigação.</p><form id="atividade-iniciar">${SIAB.identificacaoHTML(a.identificacao)}<button class="primary-btn">Iniciar atividade</button></form>`}`;
  }
  function iniciar(ident) {
    if (!ativa || ativa.etapa !== "apresentacao") return false;
    const c = ativa.config;
    ativa.identificacao = ident;
    ativa.context.identity = { ...ident };
    const b = SIAB.ActivityContext.buildBench(c, ident);
    ativa.bench = SIAB.ActivityContext.sanitize(b, c, ativa.context);
    const type = c.tipo === "missao" ? "mission" : "lab";
    SIAB.benches[type] = ativa.bench;
    SIAB.usarBancada(type);
    if (c.tipo === "missao") SIAB.motor.restaurar({ id: c.item });
    ativa.etapa = "bancada";
    ativa.context.stage = "bancada";
    SIAB.loja.avisar();
    salvarSessao();
    atualizarCabecalho();
    retomar();
    return true;
  }
  function retomar() {
    if (!ativa) return;
    SIAB.irPara(
      ativa.config.tipo === "missao"
        ? `#/missao/${ativa.config.item}`
        : "#/laboratorio",
    );
  }
  function finalizar() {
    if (!ativa) return;
    SIAB.relatorios.capturar();
    ativa.etapa = "finalizada";
    salvarSessao();
    SIAB.irPara(rotaAtividade());
  }
  function encerrar() {
    if (!ativa) return;
    salvarSessao();
    ativa = null;
    restoringToken = null;
    try {
      sessionStorage.removeItem("siab_atividade_ativa");
    } catch (_) {}
    document.body.removeAttribute("data-restrita");
    SIAB.$("activity-banner").hidden = true;
    SIAB.benches.lab =
      SIAB.persistencia.ler("siab_bancada_v2", null) || SIAB.criarBancada();
    SIAB.usarBancada("lab");
    SIAB.activityUI?.render();
    SIAB.irPara("#/inicio");
  }
  function atualizarCabecalho() {
    const b = SIAB.$("activity-banner");
    if (!b) return;
    b.hidden = !ativa;
    document.body.dataset.restrita =
      ativa?.config.navegacao === "restrita" ? "true" : "false";
    SIAB.activityUI?.render();
    if (ativa) {
      SIAB.$("activity-caption").textContent =
        `ATIVIDADE EXPERIMENTAL${ativa.config.navegacao === "restrita" ? " · MODO RESTRITO" : ""} · ${ativa.config.titulo}`;
      SIAB.$("activity-finish").hidden =
        ativa.etapa === "apresentacao" || ativa.etapa === "finalizada";
    }
  }
  function ligar() {
    SIAB.$("atividade-conteudo").addEventListener("submit", (e) => {
      if (e.target.id !== "atividade-iniciar") return;
      e.preventDefault();
      iniciar(Object.fromEntries(new FormData(e.target)));
    });
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-activity-resume]")) retomar();
      if (e.target.closest("[data-activity-close]"))
        SIAB.$("activity-exit").click();
    });
    SIAB.$("activity-finish").onclick = finalizar;
    SIAB.$("activity-exit").onclick = () =>
      SIAB.confirmar(
        "Encerrar atividade?",
        "Seus registros ficam salvos neste navegador. Você poderá reabrir o mesmo link.",
        encerrar,
        "Encerrar atividade",
      );
    SIAB.loja.assinar(salvarSessao);
    window.addEventListener("pagehide", salvarSessao);
  }
  return {
    instrumentos,
    validar,
    codificar,
    decodificar,
    guardarRota,
    salvarSessao,
    restaurar,
    abrir,
    iniciar,
    retomar,
    finalizar,
    encerrar,
    atualizarCabecalho,
    ligar,
    link: (token) => `${location.href.split("#")[0]}#/atividade/${token}`,
    get ativa() {
      return ativa;
    },
  };
})();
SIAB.telas.atividade = {
  secao: "atividade",
  titulo: () => "Atividade",
  entrar: (token) => SIAB.atividades.abrir(token),
};
