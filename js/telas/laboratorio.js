'use strict';
/* Tela do laboratório livre: a bancada com prateleira e níveis. */
SIAB.telas.laboratorio = {
  secao: 'bancada',
  menu: 'laboratorio',
  titulo: () => 'Bancada',
  entrar() {
    SIAB.usarBancada('lab');
    SIAB.bancada.configurar({ modo: 'laboratorio' });
    SIAB.render(true);
    SIAB.progresso.marcarUltima('#/laboratorio', 'Laboratório livre');
    SIAB.$('boas-vindas').hidden = SIAB.ajuda.jaViu();
    SIAB.ajuda.aplicarPendente();
  },
  sair() {
    SIAB.bancada.closeSheet(false);
  }
};
