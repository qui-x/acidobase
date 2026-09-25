'use strict';
/* Tela do laboratório livre: a bancada com prateleira e níveis. */
SIAB.telas.laboratorio = {
  secao: 'bancada',
  menu: 'laboratorio',
  titulo: () => 'Laboratório',
  entrar() {
    SIAB.usarBancada('lab');
    SIAB.bancada.configurar({ modo: 'laboratorio' });
    SIAB.render(true);
    SIAB.progresso.marcarUltima('#/laboratorio', 'Laboratório livre');
  },
  sair() {
    SIAB.bancada.closeSheet(false);
  }
};
