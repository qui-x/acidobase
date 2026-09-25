'use strict';
/* Roteador por endereço. A parte depois de # indica a tela:
   #/inicio, #/aprender, #/missao/<id>, #/desafios, #/desafio/<id>,
   #/laboratorio, #/professor, #/aula/<ids>, #/caderno.
   Funciona abrindo o arquivo direto do computador e com o botão voltar. */
SIAB.telas = {};
SIAB.rota = { nome: null, parametro: '' };

SIAB.irPara = rota => {
  if (location.hash === rota) SIAB.rotear();
  else location.hash = rota;
};

SIAB.rotear = () => {
  const partes = location.hash.replace(/^#\/?/, '').split('/');
  const pedido = partes[0] || 'inicio';
  const nome = Object.hasOwn(SIAB.telas, pedido) ? pedido : 'inicio';
  const parametro = decodeURIComponent(partes.slice(1).join('/'));
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
