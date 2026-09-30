"use strict";
/* Adaptação mobile: não substitui o roteador, o renderizador nem as funções de
   química. Os controles novos usam as ações públicas já existentes. */
(() => {
  const S = window.SIAB,
    $ = S.$,
    root = document.documentElement;
  const mobile = matchMedia("(max-width: 900px)");
  let area = "experimento",
    agendado = 0,
    ajudaDestino = null;
  root.dataset.mobileStudy = "on";
  root.dataset.mobileShelf = "preparo";
  root.dataset.mobileCards = "lista";

  function botao(id, texto, classe = "secondary-btn") {
    const el = document.createElement("button");
    el.type = "button";
    el.id = id;
    el.className = `mobile-study-control ${classe}`;
    el.textContent = texto;
    return el;
  }
  const analise = botao("mobile-analysis-tab", "Análises", "");
  analise.setAttribute("aria-controls", "ver-panel");
  document.querySelector(".view-tabs").append(analise);
  const doses = botao("mobile-doses-toggle", "Doses ▾");
  doses.setAttribute("aria-controls", "dose-shortcuts");
  doses.setAttribute("aria-expanded", "false");
  document.querySelector("#dose-area .dose-actions").append(doses);
  const grupos = document.createElement("nav");
  grupos.className = "mobile-study-control mobile-shelf-tabs";
  grupos.setAttribute("aria-label", "Áreas da prateleira");
  for (const [id, nome] of [
    ["preparo", "Preparo"],
    ["medidas", "Medidas"],
    ["modulos", "Módulos"],
    ["acoes", "Ações"],
  ]) {
    const b = botao(`mobile-shelf-${id}`, nome);
    b.dataset.mobileGroup = id;
    b.setAttribute("aria-controls", "painel-laboratorio");
    b.addEventListener("click", () => {
      prateleira(id);
      $("controls").scrollTop = 0;
    });
    grupos.append(b);
  }
  document.querySelector(".controls-heading").after(grupos);
  const indice = botao(
    "mobile-manual-toggle",
    "Abrir índice do manual ▾",
    "quiet-btn",
  );
  indice.setAttribute("aria-controls", "manual-indice");
  indice.setAttribute("aria-expanded", "false");
  document.querySelector(".manual-indice").prepend(indice);
  const grade = botao("mobile-card-toggle", "Ver em grade");
  grade.setAttribute("aria-pressed", "false");
  grade.setAttribute("aria-controls", "overview-grid");
  document.querySelector(".overview-heading-actions").append(grade);
  const contexto = document.createElement("span");
  contexto.className = "mobile-study-control mobile-analysis-context";
  document.querySelector(".ver-cabecalho").append(contexto);
  const escala = botao("mobile-scale-toggle", "Escala de pH ▾", "quiet-btn");
  escala.setAttribute("aria-controls", "ver-regua");
  escala.setAttribute("aria-expanded", "false");
  $("ver-regua").before(escala);

  function prateleira(id) {
    root.dataset.mobileShelf = id;
    grupos
      .querySelectorAll("button")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.mobileGroup === id)),
      );
  }
  function agendar() {
    if (!agendado) agendado = requestAnimationFrame(atualizar);
  }
  function atualizar() {
    agendado = 0;
    if (!mobile.matches) {
      delete root.dataset.mobileArea;
      $("focus-tab").firstChild.textContent = "Tubo em foco";
      $("overview-tab").firstChild.textContent = "Visão geral ";
      return;
    }
    if (!S.current() || !S.bancada.config.ver.length)
      area = S.state.view === "overview" ? "tubos" : "experimento";
    if (S.state.view === "overview") area = "tubos";
    else if (area === "tubos") area = "experimento";
    root.dataset.mobileArea = area;
    $("focus-tab").firstChild.textContent =
      innerWidth <= 360 ? "Foco" : "Experimento";
    $("focus-tab").setAttribute("aria-label", "Experimento: tubo em foco");
    $("overview-tab").firstChild.textContent = "Tubos ";
    $("focus-tab").setAttribute("aria-pressed", String(area === "experimento"));
    $("overview-tab").setAttribute("aria-pressed", String(area === "tubos"));
    analise.setAttribute("aria-pressed", String(area === "analise"));
    analise.disabled = !S.current() || !S.bancada.config.ver.length;
    contexto.textContent = S.current()?.name || "";
    escala.hidden = true;
    const leitura = $("ver-regua").querySelector("strong")?.textContent || "";
    escala.textContent = `Escala de pH${leitura ? " · " + leitura : ""} ${root.dataset.mobileScale === "on" ? "▴" : "▾"}`;
    grade.hidden = $("overview-grid").classList.contains("selecting");
    const vv = window.visualViewport;
    root.style.setProperty(
      "--mobile-visible-height",
      `${Math.round(vv?.height || innerHeight)}px`,
    );
    if (
      $("workspace").hidden ||
      $("focus-view").hidden ||
      area !== "experimento"
    )
      return;
    const stage = document.querySelector(".tube-stage"),
      foco = $("focus-view");
    const h = (el) =>
      el?.getClientRects().length ? el.getBoundingClientRect().height : 0;
    const fixos = [...foco.children]
      .filter((el) => el !== stage && el.id !== "dose-area")
      .reduce((n, el) => {
        if (!el.getClientRects().length) return n;
        const css = getComputedStyle(el);
        return (
          n +
          h(el) +
          (parseFloat(css.marginTop) || 0) +
          (parseFloat(css.marginBottom) || 0)
        );
      }, 0);
    const stats = Math.max(
      h(document.querySelector(".stage-stats")),
      h(document.querySelector(".volume-readout")),
    );
    const livre =
      innerHeight -
      h(document.querySelector(".app-header")) -
      h(document.querySelector(".view-tabs")) -
      h(document.querySelector(".bottom-nav")) -
      h($("dose-area")) -
      h(document.querySelector(".tube-strip")) -
      fixos -
      stats -
      36;
    stage.style.setProperty(
      "--mobile-glass-height",
      `${Math.round(Math.max(140, Math.min(420, livre)))}px`,
    );
  }
  function mostrar(valor) {
    if (!mobile.matches || $("workspace").hidden) return;
    if (valor === "analise") {
      if (!S.current() || !S.bancada.config.ver.length) return;
      if (S.state.view === "overview") $("focus-tab").click();
      area = "analise";
    } else {
      area = valor;
      $(valor === "tubos" ? "overview-tab" : "focus-tab").click();
    }
    atualizar();
    window.scrollTo(0, 0);
  }
  analise.addEventListener("click", () => mostrar("analise"));
  escala.addEventListener("click", () => {
    const aberto = root.dataset.mobileScale !== "on";
    root.dataset.mobileScale = aberto ? "on" : "off";
    escala.setAttribute("aria-expanded", String(aberto));
    agendar();
  });
  $("focus-tab").addEventListener("click", () => {
    area = "experimento";
    atualizar();
    window.scrollTo(0, 0);
  });
  $("overview-tab").addEventListener("click", () => {
    area = "tubos";
    atualizar();
    window.scrollTo(0, 0);
  });
  doses.addEventListener("click", () => {
    const aberto = root.dataset.mobileDoses !== "on";
    root.dataset.mobileDoses = aberto ? "on" : "off";
    doses.setAttribute("aria-expanded", String(aberto));
    doses.textContent = aberto ? "Doses ▴" : "Doses ▾";
    agendar();
  });
  indice.addEventListener("click", () => {
    const aberto = root.dataset.mobileIndex !== "on";
    root.dataset.mobileIndex = aberto ? "on" : "off";
    indice.setAttribute("aria-expanded", String(aberto));
    indice.textContent = aberto
      ? "Fechar índice ▴"
      : "Abrir índice do manual ▾";
  });
  grade.addEventListener("click", () => {
    const emGrade = root.dataset.mobileCards !== "grade";
    root.dataset.mobileCards = emGrade ? "grade" : "lista";
    grade.setAttribute("aria-pressed", String(emGrade));
    grade.textContent = emGrade ? "Ver em lista" : "Ver em grade";
  });
  document.addEventListener(
    "click",
    (e) => {
      if (!mobile.matches) return;
      if (e.target.closest("#selecao-relatorio-btn")) prateleira("acoes");
      const ajudar = e.target.closest("[data-mostrar]");
      if (ajudar) {
        const destino = ajudar.dataset.mostrar;
        prateleira(
          { modulos: "modulos", medidas: "medidas" }[destino] || "preparo",
        );
        ajudaDestino = destino === "ver" ? "analise" : "experimento";
        if (destino === "prever" && root.dataset.mobileDoses !== "on")
          doses.click();
      }
    },
    true,
  );
  document.addEventListener("click", agendar);
  window.addEventListener("hashchange", () => {
    const destino = ajudaDestino;
    ajudaDestino = null;
    if (destino && !$("workspace").hidden && S.state.view === "overview")
      $("focus-tab").click();
    area = destino || "experimento";
    atualizar();
  });
  window.addEventListener("resize", agendar);
  window.visualViewport?.addEventListener("resize", agendar);
  mobile.addEventListener("change", agendar);
  S.loja.assinar(agendar);
  const observer = new MutationObserver(agendar);
  for (const id of ["workspace", "focus-view", "overview-view", "ver-panel"])
    observer.observe($(id), {
      attributes: true,
      attributeFilter: ["hidden", "class"],
    });
  if (typeof ResizeObserver !== "undefined") {
    const resize = new ResizeObserver(agendar);
    for (const el of [
      document.querySelector(".app-header"),
      document.querySelector(".view-tabs"),
      $("dose-area"),
      document.querySelector(".focus-heading"),
      document.querySelector(".color-reading"),
    ])
      resize.observe(el);
  }
  window.SIABMobileStudy = { mostrar, atualizar: agendar, prateleira };
  prateleira("preparo");
  agendar();
})();
