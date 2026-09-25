'use strict';
/* Caderno de laboratório (M14): previsões, missões, leituras e desafios. */
SIAB.cadernoCSV = () => {
  const aspas = texto => `"${String(texto).replace(/"/g, '""')}"`;
  const linhas = ['data;tipo;titulo;campo;valor'];
  SIAB.progresso.dados.caderno.forEach(nota => {
    const data = SIAB.dataHora(new Date(nota.data));
    (nota.linhas || []).forEach(([campo, valor]) => {
      linhas.push([data, nota.tipo, nota.titulo, campo, valor].map(aspas).join(';'));
    });
  });
  return linhas.join('\n');
};

SIAB.telas.caderno = {
  secao: 'caderno',
  titulo: () => 'Caderno',
  entrar() {
    const notas = SIAB.progresso.dados.caderno;
    const TIPOS = { previsao: 'Previsão', missao: 'Missão', leitura: 'Leitura', desafio: 'Desafio' };
    SIAB.$('caderno-csv').disabled = !notas.length;
    SIAB.$('caderno-limpar').disabled = !notas.length;
    SIAB.$('caderno-lista').innerHTML = notas.length
      ? notas.map(nota => `<article class="nota" data-tipo="${nota.tipo}">
          <header><span class="eyebrow">${TIPOS[nota.tipo] || 'Nota'} · ${SIAB.dataHora(new Date(nota.data))}</span><h2>${SIAB.escape(nota.titulo)}</h2></header>
          <dl>${(nota.linhas || []).map(([campo, valor]) => `<div><dt>${SIAB.escape(campo)}</dt><dd>${SIAB.escape(valor)}</dd></div>`).join('')}</dl>
          <button type="button" class="quiet-btn" data-apagar-nota="${nota.id}" aria-label="Apagar a nota ${SIAB.escape(nota.titulo)}">Apagar nota</button>
        </article>`).join('')
      : `<p class="vazio">O caderno está vazio. Na bancada, use “Prever e gotejar” ou, no painel VER → Histórico, “Registrar no caderno”${SIAB.MODO === 'completo' ? '. Missões e desafios também anotam aqui' : ''}.</p>`;
  },
  ligar() {
    const $ = SIAB.$;
    $('caderno-csv').addEventListener('click', () => {
      SIAB.baixarArquivo('siab-caderno.csv', SIAB.cadernoCSV());
      SIAB.notice('Caderno baixado em CSV.');
    });
    $('caderno-imprimir').addEventListener('click', () => window.print());
    $('caderno-limpar').addEventListener('click', () => {
      SIAB.confirmar('Apagar caderno?', 'Todas as notas deste aparelho serão apagadas. Esta ação não pode ser desfeita.', () => {
        SIAB.progresso.limparCaderno();
        SIAB.telas.caderno.entrar();
        SIAB.notice('Caderno apagado.');
      }, 'Apagar caderno', 'danger');
    });
    $('caderno-lista').addEventListener('click', evento => {
      const botao = evento.target.closest('[data-apagar-nota]');
      if (!botao) return;
      SIAB.progresso.removerNota(botao.dataset.apagarNota);
      SIAB.telas.caderno.entrar();
      SIAB.announce('Nota apagada.');
      $('caderno-titulo').focus();
    });
  }
};
