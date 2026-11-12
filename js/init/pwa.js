"use strict";
/* Aplicativo instalável (PWA): registra o service worker, oferece a
   instalação e avisa quando há uma versão nova.
   Só funciona aberto por HTTPS ou localhost; aberto como arquivo
   (file://) o SIAB continua funcionando, mas sem instalação. */
SIAB.pwa = (() => {
  let pedidoInstalacao = null;

  function podeUsarServiceWorker() {
    return (
      "serviceWorker" in navigator &&
      (location.protocol === "https:" ||
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1")
    );
  }

  // Quando uma versão nova assume, a página em uso ainda é a antiga:
  // avisa e recarrega só quando o usuário pedir (nada se perde no meio de uma missão).
  function avisarAtualizacao() {
    const toast = SIAB.$("toast");
    toast.innerHTML =
      'Nova versão do SIAB instalada. <button type="button" class="text-btn" id="pwa-recarregar">Recarregar</button>';
    toast.hidden = false;
    SIAB.$("pwa-recarregar").addEventListener("click", () => location.reload());
  }

  function sistemaDoNavegador() {
    // navigator.platform pode indicar Linux mesmo em Android: priorizar userAgent.
    const ua = (navigator.userAgent || "") + " " +
      (navigator.userAgentData?.platform || "");
    if (/Android/i.test(ua)) return "android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
    if (/Windows|Win32|Win64|WinNT/i.test(ua)) return "windows";
    if (/Linux|X11/i.test(ua)) return "linux";
    return "pwa";
  }

  function iniciar() {
    const botoes = [SIAB.$("install-btn"), SIAB.$("drawer-install")].filter(Boolean);
    const modal = SIAB.$("install-choice-dialog");
    const escolhaPwa = SIAB.$("install-choice-pwa");

    // Instaladores nativos já foram instalados; não mostrar escolha ou prompt.
    if (window.SIABPlataforma?.empacotado) {
      botoes.forEach((botao) => { botao.hidden = true; });
      try {
        if ("serviceWorker" in navigator)
          navigator.serviceWorker
            .getRegistrations()
            .then((lista) => lista.forEach((r) => r.unregister()))
            .catch(() => {});
        if (window.caches)
          caches
            .keys()
            .then((chaves) =>
              chaves
                .filter((c) => c.indexOf("siab@") === 0)
                .forEach((c) => caches.delete(c)),
            )
            .catch(() => {});
      } catch (erro) {
        /* limpeza opcional */
      }
      return;
    }

    const publicavel =
      Boolean(document.querySelector('link[rel="manifest"]')) &&
      podeUsarServiceWorker();
    const modoApp = matchMedia("(display-mode: standalone)");
    let instalado = modoApp.matches || navigator.standalone === true;
    const atualizarBotoes = () => {
      // O menu de escolha também serve para baixar EXE/APK/AppImage.
      // Não depende de beforeinstallprompt (indisponível em alguns navegadores).
      botoes.forEach((botao) => { botao.hidden = instalado; });
      if (escolhaPwa) escolhaPwa.hidden = !publicavel || instalado;
    };
    const abrirEscolha = () => {
      SIAB.gaveta.fechar();
      const sistema = sistemaDoNavegador();
      const recomendado = ["android", "windows", "linux"].includes(sistema)
        ? sistema : "pwa";
      modal.querySelectorAll("[data-install-system]").forEach((opcao) => {
        const sugerir = opcao.dataset.installSystem === recomendado;
        opcao.classList.toggle("recomendado", sugerir);
        const indicador = opcao.querySelector(".install-choice-recommendation");
        if (indicador) indicador.hidden = !sugerir;
      });
      if (!modal.open) modal.showModal();
    };

    botoes.forEach((botao) => botao.addEventListener("click", abrirEscolha));
    modal.querySelectorAll("a[href]").forEach((link) =>
      link.addEventListener("click", () => modal.close()),
    );
    escolhaPwa.addEventListener("click", async () => {
      modal.close();
      if (!pedidoInstalacao) {
        SIAB.irPara("#/manual/app");
        return;
      }
      try {
        await pedidoInstalacao.prompt();
        const escolha = await pedidoInstalacao.userChoice;
        instalado = escolha.outcome === "accepted";
        if (instalado)
          SIAB.notice(
            "SIAB instalado. Abra uma vez com internet antes de usar offline.",
          );
      } catch (erro) {
        SIAB.irPara("#/manual/app");
      } finally {
        pedidoInstalacao = null;
        atualizarBotoes();
      }
    });
    atualizarBotoes();
    modoApp.addEventListener("change", (evento) => {
      instalado = evento.matches || navigator.standalone === true;
      atualizarBotoes();
    });
    window.addEventListener("beforeinstallprompt", (evento) => {
      evento.preventDefault();
      pedidoInstalacao = evento;
      atualizarBotoes();
    });
    window.addEventListener("appinstalled", () => {
      instalado = true;
      pedidoInstalacao = null;
      atualizarBotoes();
    });

    if (!publicavel) return;
    const tinhaVersaoAnterior = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (tinhaVersaoAnterior) avisarAtualizacao();
    });
    navigator.serviceWorker.register("sw.js").catch(() => {
      /* sem service worker: o app continua funcionando online */
    });
  }

  return { iniciar, podeUsarServiceWorker };
})();
