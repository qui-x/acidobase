'use strict';
/* Aplicativo instalável (PWA): registra o service worker, oferece a
   instalação e avisa quando há uma versão nova.
   Só funciona aberto por http(s) ou localhost; aberto como arquivo
   (file://) o SIAB continua funcionando, mas sem instalação. */
SIAB.pwa = (() => {
  let pedidoInstalacao = null;

  function podeUsarServiceWorker() {
    return 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');
  }

  // Só recarrega quando o próprio usuário pede a versão nova. Na primeira
  // visita o service worker assume a página sem recarregar nada.
  let atualizando = false;
  function avisarAtualizacao(registro) {
    const toast = SIAB.$('toast');
    toast.innerHTML = 'Nova versão do SIAB disponível. <button type="button" class="text-btn" id="pwa-atualizar">Atualizar</button>';
    toast.hidden = false;
    SIAB.$('pwa-atualizar').addEventListener('click', () => {
      atualizando = true;
      registro.waiting?.postMessage({ tipo: 'ATUALIZAR' });
    });
  }

  function iniciar() {
    const botao = SIAB.$('install-btn');
    window.addEventListener('beforeinstallprompt', evento => {
      evento.preventDefault();
      pedidoInstalacao = evento;
      botao.hidden = false;
    });
    botao.addEventListener('click', async () => {
      if (!pedidoInstalacao) return;
      pedidoInstalacao.prompt();
      const escolha = await pedidoInstalacao.userChoice;
      pedidoInstalacao = null;
      botao.hidden = true;
      if (escolha.outcome === 'accepted') SIAB.notice('SIAB instalado. Ele abre mesmo sem internet.');
    });
    window.addEventListener('appinstalled', () => {
      botao.hidden = true;
      pedidoInstalacao = null;
    });
    if (!podeUsarServiceWorker()) return;
    navigator.serviceWorker.register('sw.js').then(registro => {
      if (registro.waiting && navigator.serviceWorker.controller) avisarAtualizacao(registro);
      registro.addEventListener('updatefound', () => {
        const novo = registro.installing;
        novo?.addEventListener('statechange', () => {
          if (novo.state === 'installed' && navigator.serviceWorker.controller) avisarAtualizacao(registro);
        });
      });
    }).catch(() => { /* sem service worker: o app continua funcionando online */ });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!atualizando) return;
      atualizando = false;
      location.reload();
    });
  }

  return { iniciar, podeUsarServiceWorker };
})();
