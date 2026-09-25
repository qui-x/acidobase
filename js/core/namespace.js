'use strict';
// Espaço de nomes único do SIAB. Todos os módulos penduram suas funções aqui.
// Ao mudar a versão, mude também o ?v= dos arquivos no index.html e a VERSAO
// do sw.js (o teste tests/pwa.test.cjs confere os três).
window.SIAB = { version: '0.3.1', MAX_TUBES: 10, CAPACITY_ML: 5 };
