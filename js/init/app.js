'use strict';
/* Inicialização: liga os módulos, os diálogos e o roteador. */
(() => {
  const $ = SIAB.$;

  // Fechar diálogos pelo botão × e botões com data-close.
  document.addEventListener('click', evento => {
    const fechar = evento.target.closest('[data-close]');
    if (fechar) $(fechar.dataset.close).close();
  });
  $('about-btn').addEventListener('click', () => $('about-dialog').showModal());
  $('about-version').textContent = SIAB.version;

  SIAB.initSelects();
  SIAB.initPreferences();
  SIAB.bancada.ligar();
  SIAB.missaoTela.ligar();
  SIAB.telas.caderno.ligar();
  SIAB.professor.ligar();
  SIAB.pwa.iniciar();

  // Altura real do cabeçalho (muda com a fonte ampliada): usada pelo layout.
  if (typeof ResizeObserver !== 'undefined') {
    const cabecalho = document.querySelector('.app-header');
    new ResizeObserver(() => {
      document.documentElement.style.setProperty('--header-h', `${cabecalho.getBoundingClientRect().height}px`);
    }).observe(cabecalho);
  }

  window.addEventListener('hashchange', SIAB.rotear);
  SIAB.rotear();
})();
