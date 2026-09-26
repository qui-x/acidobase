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

  // Quando uma versão nova assume, a página em uso ainda é a antiga:
  // avisa e recarrega só quando o usuário pedir (nada se perde no meio de uma missão).
  function avisarAtualizacao() {
    const toast = SIAB.$('toast');
    toast.innerHTML = 'Nova versão do SIAB instalada. <button type="button" class="text-btn" id="pwa-recarregar">Recarregar</button>';
    toast.hidden = false;
    SIAB.$('pwa-recarregar').addEventListener('click', () => location.reload());
  }

  function iniciar() {
    // Dois botões: no cabeçalho (computador) e no menu ☰ → Aplicativo.
    const botoes = [SIAB.$('install-btn'), SIAB.$('drawer-install')];
    const mostrar = visivel => botoes.forEach(botao => { botao.hidden = !visivel; });
    window.addEventListener('beforeinstallprompt', evento => {
      evento.preventDefault();
      pedidoInstalacao = evento;
      mostrar(true);
    });
    botoes.forEach(botao => botao.addEventListener('click', async () => {
      if (!pedidoInstalacao) return;
      SIAB.gaveta.fechar();
      pedidoInstalacao.prompt();
      const escolha = await pedidoInstalacao.userChoice;
      pedidoInstalacao = null;
      mostrar(false);
      if (escolha.outcome === 'accepted') SIAB.notice('SIAB instalado. Ele abre mesmo sem internet.');
    }));
    window.addEventListener('appinstalled', () => {
      mostrar(false);
      pedidoInstalacao = null;
    });
    if (!podeUsarServiceWorker()) return;
    // Na primeira visita não há controlador: a instalação não precisa de aviso.
    const tinhaVersaoAnterior = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (tinhaVersaoAnterior) avisarAtualizacao();
    });
    navigator.serviceWorker.register('sw.js').catch(() => { /* sem service worker: o app continua funcionando online */ });
  }

  return { iniciar, podeUsarServiceWorker };
})();
