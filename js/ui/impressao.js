'use strict';
/* Folha de impressão do SIAB.
   Imprimir não é tirar uma foto da tela: a folha tem cabeçalho de documento
   (logotipo, título, data e campos Nome e Turma), cores claras para papel,
   medidas em pontos e numeração de página (css/stylesiab.css, @media print).

   - Bancada (laboratório ou missão): em vez dos botões e painéis, sai um
     RELATÓRIO DA BANCADA: resumo de todos os recipientes, o recipiente em foco
     (desenho, preparo, leitura, gráfico e tabela de gotas), espaço para
     observações e a nota sobre o modelo químico.
   - Caderno, manual e demais telas: o conteúdo da tela, com o cabeçalho da folha.
   Funciona pelo botão "Imprimir relatório", pelos botões de imprimir de cada
   tela e pelo Ctrl+P do navegador (eventos beforeprint e afterprint).
   O VLibras e os controles da tela nunca saem no papel. */
SIAB.impressao = (() => {
  const $ = SIAB.$;
  const esc = SIAB.escape;
  const TITULOS = {
    laboratorio: 'Relatório da bancada', missao: 'Relatório da missão', caderno: 'Caderno de laboratório',
    manual: 'Manual da bancada', professor: 'Plano de aula', aula: 'Aula', aprender: 'Trilhas de aprendizagem',
    desafios: 'Desafios', desafio: 'Desafio', inicio: 'SIAB'
  };
  let inserido = null;   // cabeçalho posto numa tela durante a impressão

  const agora = () => new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  // Logotipo no próprio HTML (uma imagem externa pode não carregar a tempo da impressão).
  const LOGO = `<svg class="folha-logo" viewBox="0 0 32 32" fill="none" aria-hidden="true"><defs>
    <linearGradient id="folha-contorno" x1="9" y1="10" x2="23" y2="29" gradientUnits="userSpaceOnUse"><stop stop-color="#DC2626"/><stop offset=".34" stop-color="#DB2777"/><stop offset=".65" stop-color="#C026D3"/><stop offset="1" stop-color="#7C3AED"/></linearGradient>
    <linearGradient id="folha-liquido" x1="12" y1="18" x2="20" y2="26" gradientUnits="userSpaceOnUse"><stop stop-color="#DC2626"/><stop offset=".48" stop-color="#C026D3"/><stop offset="1" stop-color="#7C3AED"/></linearGradient>
    <linearGradient id="folha-gota" x1="13.3" y1="2" x2="18.7" y2="9" gradientUnits="userSpaceOnUse"><stop stop-color="#DC2626"/><stop offset="1" stop-color="#DB2777"/></linearGradient></defs>
    <path d="M16 2C15.2 3.5 13.3 5.6 13.3 7a2.7 2.7 0 0 0 5.4 0c0-1.4-1.9-3.5-2.7-5Z" fill="url(#folha-gota)"/>
    <path d="M10 11v12a6 6 0 0 0 12 0V11M8.5 11h15" stroke="url(#folha-contorno)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 18c2.5-1.5 5.5 1.5 8 0v5a4 4 0 0 1-8 0Z" fill="url(#folha-liquido)"/></svg>`;

  // Cabeçalho de documento, comum a todas as folhas.
  function cabecalho(titulo, { aluno = true, subtitulo = '' } = {}) {
    return `<header class="folha-cabecalho">
      <div class="folha-titulo">
        <div class="folha-marca">${LOGO}<div><strong>SIAB</strong><span>Simulador Interativo de Ácidos e Bases</span></div></div>
        <h1>${esc(titulo)}</h1>
        <p class="folha-sub">${subtitulo ? `${esc(subtitulo)} · ` : ''}impresso em ${agora()} · versão ${SIAB.version}</p>
      </div>
      ${aluno ? '<div class="folha-aluno"><p><span>Nome</span></p><p><span>Turma</span></p><p><span>Data</span></p></div>' : ''}
    </header>`;
  }

  // Tabela de gotas: todas as linhas até 40; acima disso, 30 linhas espaçadas
  // (sempre a primeira e a última). A tabela completa sai no CSV do Histórico.
  function tabelaGotas(t) {
    const tabela = SIAB.historicoTabela(t);
    const total = tabela.linhas.length;
    let linhas = tabela.linhas;
    if (total > 40) {
      const passo = (total - 1) / 29;
      const escolhidas = new Set(Array.from({ length: 30 }, (_, i) => Math.round(i * passo)));
      linhas = [...escolhidas].sort((a, b) => a - b).map(i => tabela.linhas[i]);
    }
    const nota = total > 40 ? `<p class="folha-nota">Mostrando ${linhas.length} de ${total} linhas, espaçadas. A tabela completa sai em Histórico → Baixar tabela (CSV).</p>` : '';
    const tabelaHTML = parte => `<table class="folha-tabela folha-gotas"><thead><tr>${tabela.colunas.map((c, i) => `<th scope="col"${i < 3 ? ' class="num"' : ''}>${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${parte.map(l => `<tr>${l.map((v, i) => `<td${i < 3 ? ' class="num"' : ''}>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    // Mais de 16 linhas: duas colunas lado a lado, para caber na página.
    if (linhas.length > 16) {
      const meio = Math.ceil(linhas.length / 2);
      return `<div class="folha-gotas-colunas">${tabelaHTML(linhas.slice(0, meio))}${tabelaHTML(linhas.slice(meio))}</div>${nota}`;
    }
    return tabelaHTML(linhas) + nota;
  }

  const linha = (rotulo, valor) => `<div><dt>${esc(rotulo)}</dt><dd>${valor}</dd></div>`;

  function nomeRecipiente(t, s) {
    const tipo = t.vidraria || s.vidraria;
    const cap = SIAB.capacidade(t);
    const m = SIAB.MEDIDAS_VIDRO[tipo]?.[cap];
    return `${SIAB.VIDRARIAS[tipo]?.nome || 'Tubo de ensaio'} de ${cap} mL${m ? ` (${m.D} × ${m.H} mm)` : ''}`;
  }

  // Relatório da bancada em uso (laboratório livre ou missão).
  function relatorioBancada() {
    const s = SIAB.state, foco = SIAB.current();
    const missao = SIAB.bancada.config.modo === 'missao';
    const nivel = missao ? SIAB.bancada.config.nivel : s.level;
    const titulo = missao ? TITULOS.missao : TITULOS.laboratorio;
    const subtitulo = missao ? $('mission-bar')?.textContent.trim() || '' : `Módulo ${SIAB.MODULOS[nivel]?.nome || ''}`;
    if (!foco) {
      return `${cabecalho(titulo, { subtitulo })}<p class="folha-vazia">A bancada está vazia: nenhum recipiente para relatar.</p>`;
    }
    const ph = r => (s.showPH ? `${SIAB.phFormat(r)} <span class="folha-fase">(${r.phase.toLowerCase()})</span>` : 'oculto');
    const resumo = s.tubes.map((t, n) => {
      const r = SIAB.chem.solve(t), c = SIAB.chem.liquid(t, s.indicatorOnly, r);
      const cap = SIAB.capacidade(t), vid = SIAB.VIDRARIAS[t.vidraria || s.vidraria]?.curto || 'Tubo';
      return `<tr${t.id === s.activeId ? ' class="folha-em-foco"' : ''}><td class="num">${n + 1}</td><td>${esc(t.name)}</td><td>${esc(`${vid} ${cap} mL`)}</td>
        <td>${esc(SIAB.resumoConteudo(t))}</td><td>${esc(SIAB.solutionSummary(t.titrant, t.titrantConcentration, t.titrantDilution))}</td>
        <td>${esc(SIAB.nomeIndicador(t, true))}</td><td class="num">${r.drops} (${SIAB.format(r.added)} mL)</td>
        <td class="num">${ph(r)}</td><td><span class="folha-cor" style="background:rgb(${c.rgb.join(',')});opacity:${Math.max(.25, c.opacity)}"></span>${esc(c.name)}</td></tr>`;
    }).join('');

    const t = foco, r = SIAB.chem.solve(t), c = SIAB.chem.liquid(t, s.indicatorOnly, r);
    const cap = SIAB.capacidade(t);
    const preparo = [
      linha('Recipiente', esc(nomeRecipiente(t, s))),
      linha('Conteúdo inicial', esc(SIAB.resumoConteudo(t))),
      linha('Conta-gotas', esc(SIAB.solutionSummary(t.titrant, t.titrantConcentration, t.titrantDilution))),
      linha('Volume da gota', `${SIAB.format(t.dropVolume)} mL`),
      linha('Indicador', esc(SIAB.nomeIndicador(t))),
      r.temperature !== 25 ? linha('Temperatura', `${SIAB.format(r.temperature, 0)} °C`) : ''
    ].join('');
    const leitura = [
      linha('pH', ph(r)),
      nivel === 'calcular' && s.showPH ? linha('[H₃O⁺]', `${SIAB.cientifico(r.h)} mol/L`) : '',
      linha('Cor', `<span class="folha-cor" style="background:rgb(${c.rgb.join(',')});opacity:${Math.max(.25, c.opacity)}"></span>${esc(c.name)}`),
      linha('Volume no recipiente', `${SIAB.volumeTexto(r.volume, cap)} mL de ${cap} mL`),
      linha('Adicionado', `${r.drops} ${r.drops === 1 ? 'gota' : 'gotas'} · ${SIAB.format(r.added)} mL`),
      nivel !== 'explorar' && r.equivalenceVolume !== null ? linha('Equivalência prevista', `${SIAB.format(r.equivalenceVolume)} mL`) : ''
    ].join('');
    const grafico = s.showPH && t.additions.length
      ? `<figure class="folha-grafico">${SIAB.grafico.svg(t)}<figcaption>Curva de pH × volume adicionado. Faixa colorida: viragem do indicador; linha tracejada: pH neutro.</figcaption></figure>`
      : `<p class="folha-nota">${s.showPH ? 'Sem gotas ainda: o gráfico aparece depois das primeiras gotas.' : 'O pH estava oculto na bancada; o gráfico não foi impresso.'}</p>`;

    return `${cabecalho(titulo, { subtitulo })}
      <section class="folha-secao">
        <h2>Recipientes na bancada</h2>
        <table class="folha-tabela folha-resumo"><thead><tr><th scope="col">#</th><th scope="col">Nome</th><th scope="col">Recipiente</th><th scope="col">Conteúdo</th><th scope="col">Conta-gotas</th><th scope="col">Indicador</th><th scope="col">Gotas</th><th scope="col">pH</th><th scope="col">Cor</th></tr></thead><tbody>${resumo}</tbody></table>
      </section>
      <section class="folha-secao folha-detalhe">
        <h2>Em foco: ${esc(t.name)}</h2>
        <div class="folha-foco">
          <figure class="folha-vidro">${SIAB.tubeSVG(t, 'impressao', false, s.vidraria)}<figcaption>${esc(c.name)}</figcaption></figure>
          <div class="folha-dados"><h3>Preparo</h3><dl>${preparo}</dl><h3>Leitura</h3><dl>${leitura}</dl></div>
        </div>
        ${grafico}
        <div class="folha-bloco"><h3>Tabela de gotas</h3>
        ${tabelaGotas(t)}</div>
      </section>
      <section class="folha-secao folha-observacoes">
        <h2>Observações e conclusão</h2>
        <div class="folha-linhas" aria-hidden="true">${'<span></span>'.repeat(5)}</div>
      </section>
      <p class="folha-rodape">Valores calculados pelo modelo do SIAB: equilíbrio em solução ideal, pelo balanço de cargas, a 25 °C (salvo indicação). “≈” marca amostras do cotidiano, que são representativas: amostras reais variam. Fontes: Sobre o SIAB → Referências.</p>`;
  }

  // Antes de imprimir: monta a folha certa para a tela em uso.
  function preparar() {
    limpar();
    document.body.classList.add('imprimindo');
    const nome = SIAB.rota?.nome;
    // Roteiro do professor: já tem folha própria (js/telas/professor.js).
    if (document.body.classList.contains('imprimindo-roteiro')) return;
    if ((nome === 'laboratorio' || nome === 'missao') && !$('workspace').hidden) {
      $('folha-impressao').innerHTML = relatorioBancada();
      document.body.classList.add('imprimindo-folha');
      return;
    }
    const tela = document.querySelector('main [data-tela]:not([hidden])');
    if (!tela) return;
    const titulo = TITULOS[nome] || tela.querySelector('h1')?.textContent.trim() || 'SIAB';
    inserido = document.createElement('div');
    inserido.className = 'so-impressao';
    inserido.innerHTML = cabecalho(titulo, { aluno: nome === 'caderno' });
    tela.prepend(inserido);
  }
  function limpar() {
    document.body.classList.remove('imprimindo', 'imprimindo-folha');
    inserido?.remove();
    inserido = null;
  }

  function imprimir() {
    preparar();
    window.print();
  }

  function ligar() {
    window.addEventListener('beforeprint', preparar);
    window.addEventListener('afterprint', () => { limpar(); $('folha-impressao').innerHTML = ''; });
    $('imprimir-relatorio')?.addEventListener('click', imprimir);
  }

  return { ligar, imprimir, preparar, limpar, cabecalho, relatorioBancada };
})();
