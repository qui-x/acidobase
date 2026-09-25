'use strict';
/* Controles visíveis para a API A11Y (a11y.js) e para som e vibração. */
SIAB.initPreferences = () => {
  const $ = SIAB.$;
  // O a11y.js dá prioridade aos parâmetros do endereço (?theme=…) ao abrir a página.
  // Mantê-los iguais à escolha atual faz a preferência valer depois de recarregar.
  function atualizarEndereco() {
    try {
      history.replaceState(null, '', location.pathname + A11Y.query() + location.hash);
    } catch (erro) { /* file:// pode bloquear; a memória local continua valendo */ }
  }
  function sync() {
    atualizarEndereco();
    const e = window.A11Y.estado;
    document.documentElement.classList.toggle('large-text', e.fontScale >= 1.4);
    $('theme-select').value = e.contrast ? 'contrast' : e.theme;
    $('font-output').textContent = Math.round(e.fontScale * 100) + '%';
    $('font-minus').disabled = e.fontScale <= .8;
    $('font-plus').disabled = e.fontScale >= 2;
    $('motion-check').checked = e.motion;
    $('cvd-select').value = e.colorblind;
    $('sound-check').checked = SIAB.som.prefs.som;
    $('vibrate-check').checked = SIAB.som.prefs.vibrar;
    const tema = e.contrast ? '#000000' : e.theme === 'light' ? '#e4eaf2' : '#0c1520';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema);
    SIAB.refreshSelects?.();
  }
  $('access-btn').addEventListener('click', () => { sync(); $('access-dialog').showModal(); });
  $('theme-select').addEventListener('change', evento => {
    A11Y.definir('contrast', evento.target.value === 'contrast');
    if (evento.target.value !== 'contrast') A11Y.definir('theme', evento.target.value);
    sync();
    SIAB.loja.avisar();
  });
  for (const [id, delta] of [['font-minus', -.1], ['font-plus', .1]]) {
    $(id).addEventListener('click', () => {
      A11Y.definir('fontScale', Math.max(.8, Math.min(2, A11Y.estado.fontScale + delta)));
      sync();
    });
  }
  $('motion-check').addEventListener('change', evento => { A11Y.definir('motion', evento.target.checked); atualizarEndereco(); });
  $('cvd-select').addEventListener('change', evento => { A11Y.definir('colorblind', evento.target.value); atualizarEndereco(); });
  $('sound-check').addEventListener('change', evento => {
    SIAB.som.definir('som', evento.target.checked);
    if (evento.target.checked) SIAB.som.tocar(7);
  });
  $('vibrate-check').addEventListener('change', evento => {
    SIAB.som.definir('vibrar', evento.target.checked);
    if (evento.target.checked) SIAB.som.vibrar();
  });
  sync();
};
