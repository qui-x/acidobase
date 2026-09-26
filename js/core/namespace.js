'use strict';
// Espaço de nomes único do SIAB. Todos os módulos penduram suas funções aqui.
// Ao mudar a versão, mude também o ?v= dos arquivos no index.html e a VERSAO
// do sw.js.
window.SIAB = { version: '0.6.5', MAX_TUBES: 10, CAPACITY_ML: 5 };

// Modo do programa:
//   'bancada'  → só a bancada, o caderno e o manual (padrão);
//   'completo' → também missões, desafios e a área do professor.
// O usuário troca no menu ☰ → Modos (SIAB.definirModo, em roteador.js). A
// escolha fica no armazenamento local "siab_modo". Para mudar o padrão de
// quem abre pela primeira vez, troque o texto abaixo.
SIAB.MODO = 'bancada';
try {
  const salvo = localStorage.getItem('siab_modo');
  if (salvo === 'bancada' || salvo === 'completo') SIAB.MODO = salvo;
} catch (erro) { /* sem armazenamento: fica o padrão */ }
if (typeof document !== 'undefined') document.documentElement.dataset.modo = SIAB.MODO;
