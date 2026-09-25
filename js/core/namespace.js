'use strict';
// Espaço de nomes único do SIAB. Todos os módulos penduram suas funções aqui.
// Ao mudar a versão, mude também o ?v= dos arquivos no index.html e a VERSAO
// do sw.js (o teste tests/pwa.test.cjs confere os três).
window.SIAB = { version: '0.4.0', MAX_TUBES: 10, CAPACITY_ML: 5 };

// Modo do programa:
//   'bancada'  → só a bancada, o caderno e o manual (padrão);
//   'completo' → também missões, desafios e a área do professor.
// Para mudar, troque o texto abaixo. (Os testes automáticos usam o
// armazenamento local "siab_modo" para testar os dois modos.)
SIAB.MODO = 'bancada';
try {
  SIAB.MODO = localStorage.getItem('siab_modo') || SIAB.MODO;
} catch (erro) { /* sem armazenamento: fica o padrão */ }
if (typeof document !== 'undefined') document.documentElement.dataset.modo = SIAB.MODO;
