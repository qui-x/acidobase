"use strict";
/* Menu lateral (gaveta), no estilo do Laboratório Virtual: navegação, modos,
   roteiros de teste, acessibilidade e aplicativo.
   É um <dialog> aberto com showModal(): o navegador leva o foco para dentro,
   fecha com Esc e deixa o resto da página inerte. Fecha também com ×, com
   toque fora e depois de escolher um destino. */
SIAB.gaveta = (() => {
  const $ = SIAB.$;

  function expandir(botao, aberto) {
    botao.setAttribute("aria-expanded", String(aberto));
    $(botao.getAttribute("aria-controls")).hidden = !aberto;
  }

  // secao: 'acessibilidade' abre direto no painel de acessibilidade.
  function abrir(secao) {
    const gaveta = $("app-drawer");
    if (!gaveta.open) gaveta.showModal();
    $("menu-btn").setAttribute("aria-expanded", "true");
    if (secao === "acessibilidade") {
      expandir($("a11y-toggle"), true);
      $("a11y-toggle").focus();
      $("a11y-toggle").scrollIntoView({ block: "start" });
    } else {
      $("drawer-title").parentElement.querySelector(".drawer-close").focus();
    }
  }

  function fechar() {
    if ($("app-drawer").open) $("app-drawer").close();
  }

  function ligar() {
    const gaveta = $("app-drawer");
    $("drawer-versao").textContent = SIAB.version;

    $("menu-btn").addEventListener("click", () => abrir());
    $("access-btn").addEventListener("click", () => abrir("acessibilidade"));
    gaveta.addEventListener("close", () =>
      $("menu-btn").setAttribute("aria-expanded", "false"),
    );

    gaveta.addEventListener("click", (evento) => {
      // Toque no fundo escurecido (fora da caixa da gaveta).
      const caixa = gaveta.getBoundingClientRect();
      if (
        evento.target === gaveta &&
        (evento.clientX > caixa.right || evento.clientX < caixa.left)
      ) {
        fechar();
        return;
      }
      const expansor = evento.target.closest(
        ".drawer-cat-expand, #a11y-toggle",
      );
      if (expansor) {
        expandir(expansor, expansor.getAttribute("aria-expanded") !== "true");
        return;
      }
      const roteiro = evento.target.closest("[data-montar]");
      if (roteiro) {
        fechar();
        SIAB.manualTela.montar(roteiro.dataset.montar);
        return;
      }
      // Escolheu um destino: fecha, como no menu do Laboratório Virtual.
      if (evento.target.closest("a[href]")) fechar();
    });

    $("drawer-tour").addEventListener("click", () => {
      fechar();
      SIAB.tour.iniciar();
    });
    $("drawer-guia").addEventListener("click", () => {
      fechar();
      $("guide-dialog").showModal();
    });
    $("about-btn").addEventListener("click", () => {
      fechar();
      $("about-dialog").showModal();
    });
  }

  return { ligar, abrir, fechar };
})();
