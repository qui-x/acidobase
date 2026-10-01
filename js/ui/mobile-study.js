"use strict";
/* Complementos de leitura e enquadramento. Workspace controla todos os painéis,
   preservando uma única lógica para conteúdo, permissões, foco e apresentação. */
(() => {
  const S = SIAB,
    $ = S.$,
    root = document.documentElement;
  const mobile = matchMedia("(max-width: 900px)");
  let frame = 0;
  root.dataset.mobileStudy = "on";
  root.dataset.mobileCards = "lista";
  function button(id, label, cls = "secondary-btn") {
    const el = document.createElement("button");
    el.id = id;
    el.type = "button";
    el.textContent = label;
    el.className = `mobile-study-control ${cls}`;
    return el;
  }
  const doses = button("mobile-doses-toggle", "Doses");
  doses.setAttribute("aria-controls", "dose-shortcuts");
  doses.setAttribute("aria-expanded", "false");
  document.querySelector("#dose-area .dose-actions").append(doses);
  doses.addEventListener("click", () => {
    const expanded = root.dataset.mobileDoses !== "on";
    root.dataset.mobileDoses = expanded ? "on" : "off";
    doses.setAttribute("aria-expanded", String(expanded));
    update();
  });
  const index = button(
    "mobile-manual-toggle",
    "Abrir índice do manual",
    "quiet-btn",
  );
  index.setAttribute("aria-controls", "manual-indice");
  index.setAttribute("aria-expanded", "false");
  document.querySelector(".manual-indice").prepend(index);
  index.addEventListener("click", () => {
    const expanded = root.dataset.mobileIndex !== "on";
    root.dataset.mobileIndex = expanded ? "on" : "off";
    index.setAttribute("aria-expanded", String(expanded));
    index.textContent = expanded ? "Fechar índice" : "Abrir índice do manual";
  });
  const cards = button("mobile-card-toggle", "Ver em grade");
  cards.setAttribute("aria-controls", "overview-grid");
  cards.setAttribute("aria-pressed", "false");
  document.querySelector(".overview-heading-actions").append(cards);
  cards.addEventListener("click", () => {
    const grid = root.dataset.mobileCards !== "grade";
    root.dataset.mobileCards = grid ? "grade" : "lista";
    cards.setAttribute("aria-pressed", String(grid));
    cards.textContent = grid ? "Ver em lista" : "Ver em grade";
  });
  function update() {
    frame = 0;
    const vv = visualViewport;
    root.style.setProperty(
      "--mobile-visible-height",
      `${Math.round(vv?.height || innerHeight)}px`,
    );
    $("focus-tab").firstChild.textContent = "Tubo em foco";
    cards.hidden = $("overview-grid").classList.contains("selecting");
    if (!mobile.matches || $("workspace").hidden || $("focus-view").hidden)
      return;
    const stage = document.querySelector(".tube-stage");
    const h = (el) =>
      el?.getClientRects().length ? el.getBoundingClientRect().height : 0;
    const fixed = [...$("focus-view").children]
      .filter((el) => el !== stage)
      .reduce((n, el) => n + h(el), 0);
    const remaining =
      (vv?.height || innerHeight) -
      h(document.querySelector(".app-header")) -
      h($("activity-banner")) -
      h($("workspace-toolbar")) -
      h($("workspace-launchers")) -
      h(document.querySelector(".tube-strip")) -
      h($("dose-area")) -
      fixed -
      Math.max(
        h(document.querySelector(".stage-stats")),
        h(document.querySelector(".volume-readout")),
      ) -
      44;
    stage.style.setProperty(
      "--mobile-glass-height",
      `${Math.round(Math.max(130, Math.min(480, remaining)))}px`,
    );
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  window.addEventListener("resize", schedule);
  window.visualViewport?.addEventListener("resize", schedule);
  document.addEventListener("click", schedule);
  S.loja.assinar(schedule);
  new MutationObserver(schedule).observe($("workspace"), {
    attributes: true,
    attributeFilter: ["hidden", "class"],
  });
  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(schedule);
    for (const el of [
      document.querySelector(".app-header"),
      $("dose-area"),
      document.querySelector(".focus-heading"),
    ])
      observer.observe(el);
    const banner = document.querySelector(".activity-banner");
    if (banner) observer.observe(banner);
  }
  window.SIABMobileStudy = {
    mostrar(area) {
      if (area === "analise") S.workspace.open("right");
      else $(area === "tubos" ? "overview-tab" : "focus-tab").click();
    },
    atualizar: schedule,
    prateleira(group) {
      S.workspace.open(
        "left",
        { medidas: "preparo", modulos: "modulo", acoes: "objetos" }[group] ||
          group,
      );
    },
  };
  schedule();
})();
