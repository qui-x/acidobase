'use strict';
/* Desenho da bancada: tubo em foco, régua, conta-gotas, tira de tubos,
   visão geral, painel do laboratório e painel VER. */
SIAB.solutionSummary = (id, concentration, dilution = 1) => {
  const solution = SIAB.solutions[id];
  if (solution.kind === 'sample') return `${solution.name} · ${dilution === 1 ? 'como preparada' : '1 parte + ' + (dilution - 1) + ' de água'}`;
  if (solution.kind === 'water') return 'Água pura';
  return `${solution.formula} · ${SIAB.format(concentration, 4)} mol/L`;
};

SIAB.NIVEIS = {
  explorar: 'Explorar: escolha frascos e indicadores. Os números ficam para depois.',
  medir: 'Medir: diluição, volume inicial e tamanho da gota. O gráfico mostra a equivalência.',
  calcular: 'Calcular: concentrações em mol/L, [H₃O⁺], Ka, α e quantidades em mmol.'
};

SIAB.render = (syncForm = false) => {
  const $ = SIAB.$, s = SIAB.state, t = SIAB.current();
  if (!t || $('workspace').hidden) return;
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
  $('bench-mode').textContent = cfg.modo === 'missao' ? 'MISSÃO' : `BANCADA · ${s.level.toUpperCase()}`;
  $('tube-count').textContent = `${s.tubes.length} / ${SIAB.MAX_TUBES}`;
  $('prepare-btn').textContent = cfg.modo === 'missao' ? 'Missão' : 'Prateleira';

  // Cabeçalho do tubo.
  $('tube-index').textContent = `TUBO ${i + 1} DE ${s.tubes.length}`;
  $('tube-name').textContent = t.name;
  $('sample-summary').textContent = `${SIAB.solutionSummary(t.solution, t.concentration, t.dilution)} · ${SIAB.format(t.initialVolume)} mL iniciais`;
  $('sample-model-note').hidden = !r.approximate;
  $('sample-model-note').textContent = 'Amostra representativa · pH e resposta às gotas são estimativas. Amostras reais variam.';
  $('rename-btn').hidden = !pode('renomear');

  // Leitura.
  $('ph-value').textContent = s.showPH ? SIAB.phFormat(r) : '—';
  $('ph-phase').textContent = s.showPH ? r.phase : 'Leitura oculta';
  $('ph-toggle').textContent = s.showPH ? 'Ocultar pH' : 'Mostrar pH';
  $('ph-toggle').setAttribute('aria-pressed', String(s.showPH));
  $('ph-toggle').hidden = !pode('ph');
  $('ph-ruler').innerHTML = SIAB.regua.svg(s.showPH ? r.pH : null, { neutro: r.neutralPH });
  $('volume-value').textContent = SIAB.format(r.volume);
  $('temperature-value').hidden = r.temperature === 25;
  $('temperature-value').textContent = `${SIAB.format(r.temperature, 0)} °C`;
  $('large-tube').innerHTML = SIAB.tubeSVG(t, 'focus');
  $('color-name').textContent = c.name;
  $('color-swatch').style.background = rgb;
  $('color-swatch').style.opacity = c.opacity;
  $('indicator-name').textContent = c.masked ? `${ind.name} · indicador ${c.indicatorName}; amostra ${c.pigmentName}` : ind.name;

  // Conta-gotas.
  const cheio = targets.some(x => SIAB.chem.solve(x).volume + x.dropVolume > SIAB.CAPACITY_ML + 1e-9);
  $('dose-area').hidden = !pode('gotas');
  $('titrant-label').textContent = `Conta-gotas: ${SIAB.solutionSummary(t.titrant, t.titrantConcentration, t.titrantDilution)}`;
  $('dose-summary').textContent = `${r.drops} ${r.drops === 1 ? 'gota' : 'gotas'} · ${SIAB.format(r.added)} mL`;
  $('dose-target').textContent = `${SIAB.format(t.dropVolume)} mL por gota · ${t.group ? 'em cada um dos ' + targets.length + ' tubos vinculados' : t.name}`;
  $('drop-btn').textContent = t.group ? '＋ Segure: gotas em cada tubo' : '＋ Segure para gotejar';
  $('drop-btn').disabled = cheio;
  $('drop5-btn').disabled = cheio;
  $('drop1ml-btn').disabled = cheio;
  $('poe-btn').disabled = cheio;
  $('dose-shortcuts').hidden = !pode('atalhos') && !pode('poe');
  $('drop5-btn').hidden = !pode('atalhos');
  $('drop1ml-btn').hidden = !pode('atalhos');
  $('poe-btn').hidden = !pode('poe');
  const ultima = s.history.at(-1);
  $('undo-btn').disabled = !ultima;
  $('undo-btn').title = ultima ? `Desfazer: ${ultima.descricao}` : 'Nada para desfazer';
  $('equivalence-note').textContent = r.atEquivalence && s.showPH
    ? 'Ponto de equivalência · quantidades estequiométricas'
    : cheio ? 'Capacidade do tubo atingida.' : '';
  $('group-notice').hidden = !t.group;
  $('group-notice').textContent = t.group ? `Adições vinculadas · ${targets.length} tubos recebem as mesmas gotas.` : '';

  // Tira de tubos e visão geral.
  $('add-tube-btn').hidden = !pode('tubos');
  $('add-tube-btn').disabled = s.tubes.length >= SIAB.MAX_TUBES;
  $('tube-list').innerHTML = s.tubes.map((x, n) => {
    const v = SIAB.chem.solve(x), cor = SIAB.chem.liquid(x, s.indicatorOnly, v);
    return `<button type="button" data-tube="${x.id}" aria-current="${x.id === s.activeId}" aria-label="${SIAB.escape(x.name)}: ${cor.name}${s.showPH ? ', pH ' + SIAB.phFormat(v) : ''}">
      <span class="mini-tube" style="--cor:rgb(${cor.rgb.join(',')});--nivel:${Math.min(1, v.volume / SIAB.CAPACITY_ML)}" aria-hidden="true"></span>
      <span><strong>${SIAB.escape(x.name)}</strong><small>${n + 1} · ${SIAB.escape(SIAB.indicators[x.indicator].short)}${x.group ? ' · vinculado' : ''}</small></span>
    </button>`;
  }).join('');
  if (s.view === 'overview') {
    $('overview-grid').innerHTML = s.tubes.map(x => {
      const v = SIAB.chem.solve(x), cor = SIAB.chem.liquid(x, s.indicatorOnly, v);
      return `<button type="button" class="overview-tube" data-tube="${x.id}" aria-current="${x.id === s.activeId}" aria-label="Abrir ${SIAB.escape(x.name)}">${SIAB.tubeSVG(x, 'overview', true)}<strong>${SIAB.escape(x.name)}</strong><span class="small overview-sample">${SIAB.escape(SIAB.solutions[x.solution].name)}</span><span class="small">${SIAB.indicators[x.indicator].name}</span><span class="overview-color"><span class="mini-dot" style="background:rgb(${cor.rgb.join(',')})"></span>${cor.name}</span><span class="overview-readout"><span>${SIAB.format(v.volume)} mL</span>${s.showPH ? `<span>pH ${SIAB.phFormat(v)}</span>` : ''}</span>${x.group ? '<span class="small">Adições vinculadas</span>' : ''}</button>`;
    }).join('');
  }

  // Painel do laboratório.
  if (cfg.modo === 'laboratorio') {
    document.querySelectorAll('input[name="nivel"]').forEach(x => { x.checked = x.value === s.level; });
    document.querySelectorAll('input[name="destino"]').forEach(x => { x.checked = x.value === s.destination; });
    $('nivel-dica').textContent = SIAB.NIVEIS[s.level];
    SIAB.prateleira.render();
    SIAB.prateleira.renderIndicadores();
    $('indicator-range').textContent = ind.description || (t.indicator === 'universal' ? 'Carta de cores aproximada de pH 1 a 14.' : t.indicator === 'none' ? 'A solução é observada sem indicador.' : `Faixa de viragem: pH ${SIAB.format(ind.low, 1)}–${SIAB.format(ind.high, 1)} · ${ind.acidName} → ${ind.baseName}.`);
    $('indicator-only').checked = s.indicatorOnly;
    $('ajustes').hidden = s.level === 'explorar';
    const amostraTubo = SIAB.isEveryday(t.solution), amostraGotas = SIAB.isEveryday(t.titrant);
    $('concentration-field').hidden = s.level !== 'calcular' || amostraTubo || t.solution === 'water';
    $('titrant-concentration-field').hidden = s.level !== 'calcular' || amostraGotas || t.titrant === 'water';
    $('dilution-field').hidden = !amostraTubo;
    $('titrant-dilution-field').hidden = !amostraGotas;
    $('compare-btn').disabled = s.tubes.length + 3 > SIAB.MAX_TUBES;
    $('unlink-btn').hidden = !t.group;
    $('restart-btn').disabled = !t.additions.length;
    $('remove-btn').disabled = s.tubes.length === 1;
    if (syncForm) SIAB.syncForm();
  }

  SIAB.renderVer();
  SIAB.refreshSelects?.();
};

SIAB.syncForm = () => {
  const $ = SIAB.$, t = SIAB.current();
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
  const linhas = tube.additions.map((_, i) => {
    const r = SIAB.chem.solve({ ...tube, additions: tube.additions.slice(0, i + 1) });
    const cor = SIAB.chem.color(tube.indicator, r.pH).name;
    return `<tr><td>${i + 1}</td><td>${SIAB.format(r.added)}</td><td>${s.showPH ? SIAB.phFormat(r) : '—'}</td><td>${cor}</td></tr>`;
  }).reverse().slice(0, 200);
  return `${botoes}<table><caption class="sr-only">Histórico de ${SIAB.escape(tube.name)}</caption><thead><tr><th>Gota</th><th>Adicionado (mL)</th><th>pH</th><th>Cor</th></tr></thead><tbody>${linhas.join('')}</tbody></table>`;
};

// Tabela do histórico em CSV (M14), com ponto e vírgula e vírgula decimal.
SIAB.historyCSV = tube => {
  const linhas = ['gota;volume_adicionado_mL;pH;cor'];
  const inicial = SIAB.chem.solve({ ...tube, additions: [] });
  linhas.push(`0;${SIAB.format(0)};${SIAB.format(inicial.pH)};${SIAB.chem.color(tube.indicator, inicial.pH).name}`);
  tube.additions.forEach((_, i) => {
    const r = SIAB.chem.solve({ ...tube, additions: tube.additions.slice(0, i + 1) });
    linhas.push(`${i + 1};${SIAB.format(r.added)};${SIAB.format(r.pH)};${SIAB.chem.color(tube.indicator, r.pH).name}`);
  });
  return linhas.join('\n');
};
