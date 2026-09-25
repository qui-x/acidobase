'use strict';
/* Caderno de laboratório (M14): previsões, missões, leituras e desafios.
   Uma nota tem campos (linhas) e, nas leituras, a tabela de gotas. */

// CSV do caderno: uma linha por campo. As linhas da tabela de gotas usam as
// colunas próprias (gota, volume, pH, cor) para a planilha manter a tabela.
SIAB.cadernoCSV = () => {
  const linhas = ['data;tipo;titulo;campo;valor;gota;volume_adicionado_mL;pH;cor'];
  SIAB.progresso.dados.caderno.forEach(nota => {
    const inicio = [SIAB.dataHora(new Date(nota.data)), nota.tipo, nota.titulo];
    (nota.linhas || []).forEach(([campo, valor]) => {
      linhas.push([...inicio, campo, valor, '', '', '', ''].map(SIAB.csvCampo).join(';'));
    });
    (nota.tabela?.linhas || []).forEach(linha => {
      linhas.push([...inicio, 'Tabela de gotas', '', ...linha].map(SIAB.csvCampo).join(';'));
    });
  });
  return linhas.join('\n');
};

// Tabela de gotas de uma nota, com rolagem própria (a página não rola de lado).
SIAB.notaTabelaHTML = nota => {
  const t = nota.tabela;
  if (!t?.linhas?.length) return '';
  const nome = `Tabela de gotas: ${nota.titulo}`;
  return `<div class="nota-tabela" role="region" tabindex="0" aria-label="${SIAB.escape(nome)}">
    <table><caption>Tabela de gotas <span>${t.linhas.length} ${t.linhas.length === 1 ? 'linha' : 'linhas'}</span></caption>
      <thead><tr>${t.colunas.map(c => `<th scope="col">${SIAB.escape(c)}</th>`).join('')}</tr></thead>
      <tbody>${t.linhas.map(l => `<tr>${l.map(v => `<td>${SIAB.escape(v)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
  </div>
  <button type="button" class="quiet-btn" data-baixar-tabela="${nota.id}">Baixar esta tabela (CSV)</button>`;
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
          ${SIAB.notaTabelaHTML(nota)}
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
      const tabela = evento.target.closest('[data-baixar-tabela]');
      if (tabela) {
        const nota = SIAB.progresso.dados.caderno.find(x => x.id === tabela.dataset.baixarTabela);
        const nome = SIAB.normalizar(nota.titulo).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'leitura';
        SIAB.baixarArquivo(`siab-${nome}.csv`, SIAB.tabelaCSV(nota.tabela));
        SIAB.notice('Tabela baixada em CSV.');
        return;
      }
      const botao = evento.target.closest('[data-apagar-nota]');
      if (!botao) return;
      SIAB.progresso.removerNota(botao.dataset.apagarNota);
      SIAB.telas.caderno.entrar();
      SIAB.announce('Nota apagada.');
      $('caderno-titulo').focus();
    });
  }
};
