'use strict';
/* Loja de estado: quem altera a bancada usa SIAB.alterar, e todas as partes
   da tela que assinaram a loja são redesenhadas automaticamente. */
SIAB.loja = (() => {
  const assinantes = new Set();
  return {
    assinar(funcao) {
      assinantes.add(funcao);
      return () => assinantes.delete(funcao);
    },
    avisar() {
      assinantes.forEach(funcao => funcao(SIAB.state));
    }
  };
})();

// descricao: texto do "Desfazer" (null quando a mudança não precisa ser desfeita).
SIAB.alterar = (descricao, mudanca) => {
  if (descricao) SIAB.registrar(descricao);
  mudanca(SIAB.state);
  SIAB.loja.avisar();
};
