'use strict';
/* Tela inicial: quatro caminhos e "continuar de onde parei". */
SIAB.telas.inicio = {
  completo: true,
  secao: 'inicio',
  titulo: () => '',
  entrar() {
    const $ = SIAB.$, p = SIAB.progresso;
    const feitas = SIAB.missoes.filter(m => p.missao(m.id)?.concluida).length;
    $('meta-aprender').textContent = `${feitas} de ${SIAB.missoes.length} missões concluídas`;
    const jogados = Object.keys(SIAB.desafios).filter(id => p.desafio(id)).length;
    $('meta-desafios').textContent = `${jogados} de ${Object.keys(SIAB.desafios).length} desafios jogados`;
    const ultima = p.dados.ultima;
    $('continuar').hidden = !ultima;
    if (ultima) {
      $('continuar').href = ultima.rota;
      $('continuar').innerHTML = `<span class="eyebrow">CONTINUAR DE ONDE PAROU</span><strong>${SIAB.escape(ultima.titulo)}</strong><span aria-hidden="true">→</span>`;
    }
  }
};
