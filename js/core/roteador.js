'use strict';
/* Roteador por endereço. A parte depois de # indica a tela:
   #/laboratorio (bancada), #/caderno, #/manual/<seção> e, no modo completo,
   #/inicio, #/aprender, #/missao/<id>, #/desafios, #/desafio/<id>,
   #/professor e #/aula/<ids>.
   Telas marcadas com "completo: true" só existem no modo completo; no modo
   bancada, o endereço delas leva à bancada.
   Funciona abrindo o arquivo direto do computador e com o botão voltar. */
SIAB.telas = {};
SIAB.rota = { nome: null, parametro: '' };

SIAB.irPara = rota => {
  if (location.hash === rota) SIAB.rotear();
  else location.hash = rota;
};

SIAB.rotear = () => {
  const partes = location.hash.replace(/^#\/?/, '').split('/');
  const padrao = SIAB.MODO === 'bancada' ? 'laboratorio' : 'inicio';
  const pedido = partes[0] || padrao;
  let nome = Object.hasOwn(SIAB.telas, pedido) ? pedido : padrao;
  let parametro = decodeURIComponent(partes.slice(1).join('/'));
  if (SIAB.telas[nome].completo && SIAB.MODO === 'bancada') {
    nome = 'laboratorio';
    parametro = '';
    try { history.replaceState(null, '', `${location.pathname}${location.search}#/laboratorio`); } catch (erro) { /* file:// */ }
  }
  const anterior = SIAB.rota.nome;
  if (anterior && SIAB.telas[anterior].sair) SIAB.telas[anterior].sair(nome);
  const tela = SIAB.telas[nome];
  document.querySelectorAll('main > [data-tela]').forEach(secao => {
    secao.hidden = secao.dataset.tela !== tela.secao;
  });
  document.body.dataset.rota = nome;
  SIAB.rota = { nome, parametro };
  tela.entrar(parametro);
  const titulo = tela.titulo ? tela.titulo(parametro) : '';
  document.title = `${titulo ? titulo + ' · ' : ''}SIAB — A química das cores`;
  document.querySelectorAll('[data-nav]').forEach(link => {
    const ativo = link.dataset.nav === (tela.menu || nome);
    if (ativo) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  // Na troca de tela, o foco vai para o título (leitores de tela anunciam a nova tela).
  if (anterior) {
    window.scrollTo(0, 0);
    const titulo = document.querySelector(`[data-tela="${tela.secao}"] [data-foco]`);
    if (titulo) titulo.focus({ preventScroll: true });
  }
};
