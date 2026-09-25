'use strict';
/* Desenho da bancada: tubo em foco, régua, conta-gotas, tira de tubos,
   visão geral, painel do laboratório e painel VER. */
SIAB.solutionSummary = (id, concentration, dilution = 1) => {
  const solution = SIAB.solutions[id];
  if (solution.kind === 'sample') return `${solution.name} · ${dilution === 1 ? 'como preparada' : '1 parte + ' + (dilution - 1) + ' de água'}`;
  if (solution.kind === 'water') return 'Água pura';
  return `${solution.formula} · ${SIAB.format(concentration, 4)} mol/L`;
};

// Nome do indicador de um recipiente (ou da mistura de indicadores).
SIAB.nomeIndicador = (t, curto = false) => {
  const lista = (t.indicadores || []).filter(x => x.id !== 'none');
  if (lista.length > 1) return curto ? 'Mistura' : `Mistura de indicadores (${lista.map(x => SIAB.indicators[x.id].name).join(', ')})`;
  return SIAB.indicators[t.indicator][curto ? 'short' : 'name'];
};

// Resumo do que há no recipiente (uma solução ou a mistura de vários tubos).
// O volume usa as casas da escala do recipiente; amostra como preparada mostra
// só o nome (a diluição aparece quando existe).
SIAB.resumoConteudo = t => {
  const cap = SIAB.capacidade(t);
  if (t.componentes?.length) {
    return `Mistura de ${t.componentes.length} ${t.componentes.length === 1 ? 'componente' : 'componentes'} · ${SIAB.volumeTexto(SIAB.chem.base(t).reduce((s, x) => s + x.volume, 0), cap)} mL`;
  }
  const x = SIAB.solutions[t.solution];
  const conteudo = x.kind === 'sample' && (t.dilution || 1) === 1 ? x.name : SIAB.solutionSummary(t.solution, t.concentration, t.dilution);
  return `${conteudo} · ${SIAB.volumeTexto(t.initialVolume, cap)} mL iniciais`;
};


SIAB.render = (syncForm = false) => {
  const $ = SIAB.$, s = SIAB.state, t = SIAB.current();
  if ($('workspace').hidden) return;
  if (!t) {
    SIAB.renderVazia();
    return;
  }
  $('workspace').classList.remove('vazia');
  $('bancada-vazia').hidden = true;
  $('overview-tab').disabled = false;
  const cfg = SIAB.bancada.config;
  const pode = controle => cfg.controles.has(controle);
  const i = s.tubes.indexOf(t);
  const r = SIAB.chem.solve(t);
  const c = SIAB.chem.liquid(t, s.indicatorOnly, r);
  const targets = SIAB.targets(t);
  const ind = SIAB.indicators[t.indicator];
  const rgb = `rgb(${c.rgb.join(',')})`;

  $('workspace').dataset.modo = cfg.modo;
  $('workspace').classList.toggle('overview', s.view === 'overview');
  $('focus-view').hidden = s.view !== 'focus';
  $('overview-view').hidden = s.view !== 'overview';
  $('focus-tab').setAttribute('aria-pressed', String(s.view === 'focus'));
  $('overview-tab').setAttribute('aria-pressed', String(s.view === 'overview'));
  $('overview-count').textContent = s.tubes.length;
  $('bench-mode').textContent = cfg.modo === 'missao' ? 'MISSÃO' : `MÓDULO · ${s.level.toUpperCase()}`;
  $('tube-count').textContent = `${s.tubes.length} / ${SIAB.MAX_TUBES}`;
  // Botão do cabeçalho que abre o painel no celular (texto visível dentro do nome acessível).
  $('prepare-btn').querySelector('.header-btn-texto').textContent = cfg.modo === 'missao' ? 'Missão' : 'Prateleira';
  $('prepare-btn').setAttribute('aria-label', cfg.modo === 'missao' ? 'Abrir painel da missão' : 'Abrir prateleira e ajustes');

  // Cabeçalho do tubo.
  const vidro = SIAB.VIDRARIAS[t.vidraria || s.vidraria] || SIAB.VIDRARIAS.tubo;
  const capacidade = SIAB.capacidade(t);
  const escala = SIAB.escala(capacidade);
  // A capacidade aparece uma vez só, junto do volume ("10,3 mL de 50 mL").
  $('tube-index').textContent = `${vidro.curto.toUpperCase()} · ${i + 1} DE ${s.tubes.length}`;
  $('tube-name').textContent = t.name;
  $('sample-summary').textContent = SIAB.resumoConteudo(t);
  $('sample-model-note').hidden = !r.approximate;
  $('rename-btn').hidden = !pode('renomear');

  // Leitura.
  $('ph-value').textContent = s.showPH ? SIAB.phFormat(r) : '—';
  $('ph-phase').textContent = s.showPH ? r.phase : 'Leitura oculta';
  $('ph-toggle').textContent = s.showPH ? 'Ocultar pH' : 'Mostrar pH';
  $('ph-toggle').setAttribute('aria-pressed', String(s.showPH));
  $('ph-toggle').hidden = !pode('ph');
  $('ph-ruler').innerHTML = SIAB.regua.svg(s.showPH ? r.pH : null, { neutro: r.neutralPH });
  $('volume-value').textContent = SIAB.format(r.volume, escala.casas);
  $('temperature-value').hidden = r.temperature === 25;
  $('temperature-value').textContent = `${SIAB.format(r.temperature, 0)} °C`;
  // Atualiza (não recria) o desenho: o nível e a cor mudam com movimento.
  SIAB.vidro.desenhar($('large-tube'), t, s.vidraria);
  $('color-name').textContent = c.name;
  $('color-swatch').style.background = rgb;
  $('color-swatch').style.opacity = c.opacity;
  const nomeInd = SIAB.nomeIndicador(t);
  $('indicator-name').textContent = c.masked ? `${nomeInd}: ${c.indicatorName} + amostra ${c.pigmentName}` : nomeInd;
  $('capacity-value').textContent = SIAB.format(capacidade, 0);

  // Conta-gotas.
  const cheio = targets.some(x => SIAB.chem.solve(x).volume + x.dropVolume > SIAB.capacidade(x) + 1e-9);
  $('dose-area').hidden = !pode('gotas');
  $('titrant-label').textContent = `Conta-gotas: ${SIAB.solutionSummary(t.titrant, t.titrantConcentration, t.titrantDilution)}`;
  // Uma linha só: quantas gotas, quanto volume e o tamanho da gota.
  $('dose-summary').textContent = `${r.drops} ${r.drops === 1 ? 'gota' : 'gotas'} · ${SIAB.format(r.added)} mL · gota de ${SIAB.format(t.dropVolume)} mL${t.group ? ` · em cada um dos ${targets.length} tubos vinculados` : ''}`;
  $('drop-btn').textContent = t.group ? '＋ Segure: gotas em cada tubo' : '＋ Segure para gotejar';
  $('drop-btn').disabled = cheio;
  $('drop5-btn').disabled = cheio;
  $('drop1ml-btn').disabled = cheio;
  // Atalhos em mL conforme a capacidade (ver SIAB.ESCALAS em estado.js).
  const [atalho1, atalho2] = escala.atalhos;
  const rotuloMl = ml => `+${SIAB.format(ml, 0)} mL`;
  $('drop1ml-btn').dataset.ml = atalho1;
  $('drop1ml-btn').textContent = rotuloMl(atalho1);
  $('poe-btn').disabled = cheio;
  $('dose-shortcuts').hidden = !pode('atalhos') && !pode('poe');
  $('drop5-btn').hidden = !pode('atalhos');
  $('drop1ml-btn').hidden = !pode('atalhos');
  // Segundo atalho: só nos recipientes maiores (encher 25 mL de gota em gota levaria minutos).
  $('drop5ml-btn').hidden = !pode('atalhos') || !atalho2;
  $('drop5ml-btn').disabled = cheio;
  if (atalho2) {
    $('drop5ml-btn').dataset.ml = atalho2;
    $('drop5ml-btn').textContent = rotuloMl(atalho2);
  }
  $('poe-btn').hidden = !pode('poe');
  const ultima = s.history.at(-1);
  $('undo-btn').disabled = !ultima;
  $('undo-btn').title = ultima ? `Desfazer: ${ultima.descricao}` : 'Nada para desfazer';
  $('equivalence-note').textContent = r.atEquivalence && s.showPH
    ? 'Ponto de equivalência · quantidades estequiométricas'
    : cheio ? `${vidro.curto} cheio: ${SIAB.format(capacidade, 0)} mL.` : '';
  $('group-notice').hidden = !t.group;
  $('group-notice').textContent = t.group ? `Adições vinculadas · ${targets.length} tubos recebem as mesmas gotas.` : '';

  // Tira de tubos e visão geral.
  $('add-tube-btn').hidden = !pode('tubos');
  $('add-tube-btn').disabled = s.tubes.length >= SIAB.MAX_TUBES;
  $('tube-list').innerHTML = s.tubes.map((x, n) => {
    const v = SIAB.chem.solve(x), cor = SIAB.chem.liquid(x, s.indicatorOnly, v);
    return `<button type="button" data-tube="${x.id}" aria-current="${x.id === s.activeId}" aria-label="${SIAB.escape(x.name)}: ${cor.name}${s.showPH ? ', pH ' + SIAB.phFormat(v) : ''}">
      <span class="mini-tube mini-${x.vidraria || s.vidraria}" style="--cor:rgb(${cor.rgb.join(',')});--nivel:${Math.min(1, v.volume / SIAB.capacidade(x))}" aria-hidden="true"></span>
      <span><strong>${SIAB.escape(x.name)}</strong><small>${n + 1} · ${SIAB.escape(SIAB.nomeIndicador(x, true))}${x.group ? ' · vinculado' : ''}</small></span>
    </button>`;
  }).join('');
  if (s.view === 'overview') {
    $('overview-grid').innerHTML = s.tubes.map(x => {
      const v = SIAB.chem.solve(x), cor = SIAB.chem.liquid(x, s.indicatorOnly, v);
      return `<button type="button" class="overview-tube" data-tube="${x.id}" aria-current="${x.id === s.activeId}" aria-label="Abrir ${SIAB.escape(x.name)}">${SIAB.tubeSVG(x, 'overview', true, s.vidraria)}<strong>${SIAB.escape(x.name)}</strong><span class="small overview-sample">${SIAB.escape(x.componentes?.length ? `Mistura de ${x.componentes.length} componentes` : SIAB.solutions[x.solution].name)}</span><span class="small">${SIAB.escape(SIAB.nomeIndicador(x))}</span><span class="overview-color"><span class="mini-dot" style="background:rgb(${cor.rgb.join(',')})"></span>${cor.name}</span><span class="overview-readout"><span>${SIAB.volumeTexto(v.volume, SIAB.capacidade(x))} mL</span>${s.showPH ? `<span>pH ${SIAB.phFormat(v)}</span>` : ''}</span>${x.group ? '<span class="small">Adições vinculadas</span>' : ''}</button>`;
    }).join('');
  }

  // Painel do laboratório.
  if (cfg.modo === 'laboratorio') {
    SIAB.modulos.render();
    SIAB.renderVidraria();
    SIAB.prateleira.render();
    SIAB.prateleira.renderIndicadores();
    $('indicator-range').textContent = ind.description || (t.indicator === 'universal' ? 'Carta de cores aproximada de pH 1 a 14.' : t.indicator === 'none' ? 'A solução é observada sem indicador.' : `Faixa de viragem: pH ${SIAB.format(ind.low, 1)}–${SIAB.format(ind.high, 1)} · ${ind.acidName} → ${ind.baseName}.`);
    $('indicator-only').checked = s.indicatorOnly;
    // Recipiente de mistura: os números do preparo não se aplicam.
    $('ajustes').hidden = s.level === 'explorar' || Boolean(t.componentes?.length);
    const amostraTubo = SIAB.isEveryday(t.solution), amostraGotas = SIAB.isEveryday(t.titrant);
    $('concentration-field').hidden = s.level !== 'calcular' || amostraTubo || t.solution === 'water';
    $('titrant-concentration-field').hidden = s.level !== 'calcular' || amostraGotas || t.titrant === 'water';
    $('dilution-field').hidden = !amostraTubo;
    $('titrant-dilution-field').hidden = !amostraGotas;
    $('compare-btn').disabled = s.tubes.length + 3 > SIAB.MAX_TUBES;
    $('unlink-btn').hidden = !t.group;
    $('restart-btn').disabled = !t.additions.length;
    if (syncForm) SIAB.syncForm();
  }

  SIAB.renderVer();
  SIAB.refreshSelects?.();
};

// Bancada sem tubos (é assim que o laboratório começa): orienta o primeiro
// passo e deixa a prateleira pronta. Tocar num frasco cria o Tubo 1.
SIAB.renderVazia = () => {
  const $ = SIAB.$, s = SIAB.state;
  s.view = 'focus';
  $('workspace').dataset.modo = SIAB.bancada.config.modo;
  $('workspace').classList.add('vazia');
  $('workspace').classList.remove('overview');
  $('bancada-vazia').hidden = false;
  $('focus-view').hidden = false;
  $('overview-view').hidden = true;
  $('focus-tab').setAttribute('aria-pressed', 'true');
  $('overview-tab').setAttribute('aria-pressed', 'false');
  $('overview-tab').disabled = true;
  $('overview-count').textContent = '0';
  $('bench-mode').textContent = `MÓDULO · ${s.level.toUpperCase()}`;
  $('tube-count').textContent = `0 / ${SIAB.MAX_TUBES}`;
  $('tube-list').innerHTML = '';
  $('add-tube-btn').hidden = false;
  $('add-tube-btn').disabled = false;
  $('prepare-btn').querySelector('.header-btn-texto').textContent = 'Prateleira';
  $('prepare-btn').setAttribute('aria-label', 'Abrir prateleira e ajustes');
  const ultima = s.history.at(-1);
  $('vazia-desfazer').hidden = !ultima;
  $('vazia-desfazer').title = ultima ? `Desfazer: ${ultima.descricao}` : '';
  SIAB.modulos.render();
  SIAB.renderVidraria();
  SIAB.prateleira.render();
  SIAB.renderVer();
};

// Escolha da vidraria e da capacidade na prateleira.
SIAB.renderVidraria = () => {
  const $ = SIAB.$, s = SIAB.state, v = s.vidraria;
  document.querySelectorAll('input[name="vidraria"]').forEach(x => { x.checked = x.value === v; });
  const opcoes = SIAB.VIDRARIAS[v].capacidades;
  const capacidade = SIAB.capacidadeDaBancada(s);
  $('capacidade-grupo').hidden = opcoes.length < 2;
  const atual = [...document.querySelectorAll('input[name="capacidade"]')].map(x => x.value).join();
  if (atual !== opcoes.join()) {
    $('capacidade-opcoes').innerHTML = opcoes.map(ml => `<label><input type="radio" name="capacidade" value="${ml}"><span>${ml}</span></label>`).join('');
  }
  document.querySelectorAll('input[name="capacidade"]').forEach(x => { x.checked = Number(x.value) === capacidade; });
  // Uma frase curta; o resto (volume inicial, atalhos, precisão) está no manual.
  $('vidraria-dica').textContent = SIAB.VIDRARIAS[v].dica;
  // O volume inicial pode ir até 80 % da capacidade.
  $('initial-volume').max = String(Math.round(capacidade * .8 * 100) / 100);
};

SIAB.syncForm = () => {
  const $ = SIAB.$, t = SIAB.current();
  if (!t) return;
  $('concentration').value = t.concentration;
  $('initial-volume').value = t.initialVolume;
  $('titrant-concentration').value = t.titrantConcentration;
  $('drop-volume').value = String(t.dropVolume);
  $('dilution-select').value = String(t.dilution || 1);
  $('titrant-dilution-select').value = String(t.titrantDilution || 1);
  SIAB.refreshSelects?.();
};

// Painel VER: gráfico, partículas, equação e histórico do tubo em foco.
SIAB.renderVer = () => {
  const $ = SIAB.$, s = SIAB.state, t = SIAB.current();
  const disponiveis = SIAB.bancada.config.ver;
  if (!disponiveis.includes(s.verTab)) s.verTab = disponiveis[0];
  $('ver-panel').hidden = !disponiveis.length;
  $('workspace').classList.toggle('sem-ver', !disponiveis.length);
  document.querySelectorAll('#ver-tabs [data-ver]').forEach(tab => {
    tab.hidden = !disponiveis.includes(tab.dataset.ver);
    tab.setAttribute('aria-selected', String(tab.dataset.ver === s.verTab));
    tab.tabIndex = tab.dataset.ver === s.verTab ? 0 : -1;
  });
  $('ver-conteudo').setAttribute('aria-labelledby', `tab-${s.verTab}`);
  if (!t) {
    $('ver-conteudo').innerHTML = '<p class="ver-oculto">Coloque um frasco num tubo para ver o gráfico, as partículas, a equação e o histórico.</p>';
    return;
  }
  // Atalhos do VER na barra de chips (celular e tablet).
  document.querySelectorAll('[data-ir-ver]').forEach(chip => {
    chip.hidden = !disponiveis.includes(chip.dataset.irVer);
    chip.setAttribute('aria-pressed', String(chip.dataset.irVer === s.verTab));
  });
  const r = SIAB.chem.solve(t);
  const nivel = SIAB.bancada.config.modo === 'missao' ? SIAB.bancada.config.nivel : s.level;
  let conteudo = '';
  if (s.verTab === 'grafico') {
    const eqTexto = r.equivalenceVolume !== null && nivel !== 'explorar'
      ? `Equivalência prevista em ${SIAB.format(r.equivalenceVolume)} mL.` : '';
    const semGotas = t.additions.length ? '' : '<p class="field-hint">Adicione gotas para desenhar a curva.</p>';
    conteudo = s.showPH
      ? `${SIAB.grafico.svg(t)}${semGotas}<p class="field-hint">Faixa colorida: viragem do indicador. Linha tracejada horizontal: pH neutro. ${eqTexto}</p>`
      : '<p class="ver-oculto">O gráfico aparece quando o pH é revelado.</p>';
  }
  if (s.verTab === 'particulas') {
    conteudo = s.showPH || SIAB.bancada.config.modo === 'missao'
      ? SIAB.lupa.html(t, { nivel, result: r })
      : '<p class="ver-oculto">Mostre o pH para ver as partículas.</p>';
  }
  if (s.verTab === 'equacao') conteudo = SIAB.equacao.html(t, { nivel, result: r });
  if (s.verTab === 'historico') conteudo = SIAB.historicoHTML(t);
  $('ver-conteudo').innerHTML = conteudo;
};

SIAB.historicoHTML = tube => {
  const s = SIAB.state;
  const botoes = `<div class="ver-acoes"><button type="button" class="secondary-btn" data-acao="csv">Baixar tabela (CSV)</button><button type="button" class="secondary-btn" data-acao="registrar">Registrar no caderno</button></div>`;
  if (!tube.additions.length) return `<p class="field-hint">Nenhuma gota adicionada.</p>${botoes}`;
  // Só as 200 gotas mais recentes aparecem; o pH depende apenas do volume total.
  let acumulado = 0;
  const somas = tube.additions.map(v => (acumulado += v));
  const linhas = somas.slice(-200).map((soma, j) => {
    const i = somas.length - Math.min(200, somas.length) + j;
    const r = SIAB.chem.solve({ ...tube, additions: [soma] });
    const cor = SIAB.chem.indicatorColor(tube, r.pH).name;
    return `<tr><td>${i + 1}</td><td>${SIAB.format(r.added)}</td><td>${s.showPH ? SIAB.phFormat(r) : '—'}</td><td>${cor}</td></tr>`;
  }).reverse();
  return `${botoes}<table><caption class="sr-only">Histórico de ${SIAB.escape(tube.name)}</caption><thead><tr><th>Gota</th><th>Adicionado (mL)</th><th>pH</th><th>Cor</th></tr></thead><tbody>${linhas.join('')}</tbody></table>`;
};

// Tabela de gotas do tubo: da gota 0 (antes de gotejar) até a última.
// Com o pH oculto, a coluna pH fica "—" (o que não aparece na tela não sai no arquivo).
SIAB.COLUNAS_GOTAS = ['Gota', 'Adicionado (mL)', 'pH', 'Cor'];
SIAB.historicoTabela = tube => {
  const linhas = [];
  let soma = 0;
  for (let i = 0; i <= tube.additions.length; i++) {
    if (i > 0) soma += tube.additions[i - 1];
    const r = SIAB.chem.solve({ ...tube, additions: soma > 0 ? [soma] : [] });
    linhas.push([String(i), SIAB.format(r.added), SIAB.state.showPH ? SIAB.format(r.pH) : '—', SIAB.chem.indicatorColor(tube, r.pH).name]);
  }
  return { colunas: [...SIAB.COLUNAS_GOTAS], linhas };
};

// Tabela do histórico em CSV (M14), com ponto e vírgula e vírgula decimal.
SIAB.tabelaCSV = tabela => ['gota;volume_adicionado_mL;pH;cor', ...tabela.linhas.map(linha => linha.map(SIAB.csvCampo).join(';'))].join('\n');
SIAB.historyCSV = tube => SIAB.tabelaCSV(SIAB.historicoTabela(tube));
