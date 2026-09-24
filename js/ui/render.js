'use strict';
SIAB.$ = id => document.getElementById(id);
SIAB.format = (v, digits = 2) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
SIAB.escape = str => String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
SIAB.phFormat = result => `${result.approximate ? '≈ ' : ''}${SIAB.format(result.pH, result.approximate ? 1 : 2)}`;
SIAB.solutionSummary = (id, concentration, dilution = 1) => {
  const solution = SIAB.solutions[id];
  if (solution.kind === 'sample') return `${solution.name} · ${dilution === 1 ? 'como preparada' : '1 parte + ' + (dilution - 1) + ' de água'}`;
  return solution.kind === 'water' ? 'Água pura' : `${solution.formula} · ${SIAB.format(concentration, 4)} mol/L`;
};
SIAB.tubeSVG = (tube, prefix, small = false) => {
  const r = SIAB.chem.solve(tube), c = SIAB.chem.liquid(tube, SIAB.state.indicatorOnly, r);
  const y = 325 - 280 * Math.min(1, r.volume / SIAB.CAPACITY_ML);
  const id = `${prefix}-clip-${tube.id}`, rgb = `rgb(${c.rgb.join(',')})`;
  return `<svg class="tube-svg" viewBox="0 0 160 360" role="img" aria-label="${SIAB.escape(tube.name)}: solução ${c.name}, ${SIAB.format(r.volume)} mililitros">
    <defs><clipPath id="${id}"><path d="M48 31h64v262a32 32 0 0 1-64 0Z"/></clipPath></defs>
    <path class="tube-outline" d="M43 30v263a37 37 0 0 0 74 0V30" stroke-width="2"/>
    <g clip-path="url(#${id})"><rect class="liquid-body" x="48" y="${y}" width="64" height="${330-y}" fill="${rgb}" fill-opacity="${c.opacity}"/><ellipse cx="80" cy="${y}" rx="32" ry="3" fill="${rgb}" fill-opacity="${Math.min(1,c.opacity+.12)}"/></g>
    <path d="M39 29h82" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path class="tube-reflection" d="M54 46v243a26 26 0 0 0 5 15" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${[1,2,3,4,5].map(v=>`<path class="tube-tick" d="M110 ${325-56*v}h-8" stroke-width="1"/>${small?'':`<text class="tube-graduation" x="128" y="${329-56*v}">${v}</text>`}`).join('')}
    <ellipse cx="80" cy="346" rx="39" ry="4" fill="currentColor" opacity=".08"/>
  </svg>`;
};
SIAB.renderHistory = tube => {
  const box = SIAB.$('history-table');
  if (!SIAB.$('history-details').open) return;
  if (!tube.additions.length) { box.innerHTML = '<p class="field-hint">Nenhuma gota adicionada.</p>'; return; }
  const rows = tube.additions.map((_,i) => {
    const r = SIAB.chem.solve({...tube, additions:tube.additions.slice(0,i+1)});
    return `<tr><td>${i+1}</td><td>${SIAB.format(r.added)}</td><td>${SIAB.state.showPH?SIAB.phFormat(r):'—'}</td></tr>`;
  }).reverse();
  box.innerHTML = `<table><caption class="sr-only">Histórico de ${SIAB.escape(tube.name)}</caption><thead><tr><th>Gota</th><th>Adicionado (mL)</th><th>pH</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
};
SIAB.syncForm = () => {
  const t = SIAB.current(), $ = SIAB.$;
  $('solution-select').value=t.solution; $('concentration').value=t.concentration; $('initial-volume').value=t.initialVolume;
  $('titrant-select').value=t.titrant; $('titrant-concentration').value=t.titrantConcentration; $('drop-volume').value=t.dropVolume;
  $('indicator-select').value=t.indicator;
  $('dilution-select').value=t.dilution || 1; $('titrant-dilution-select').value=t.titrantDilution || 1;
  SIAB.syncPreparationFields();
};
SIAB.syncPreparationFields = () => {
  const $ = SIAB.$;
  for (const prefix of ['', 'titrant-']) {
    const id = $(prefix ? 'titrant-select' : 'solution-select').value;
    const solution = SIAB.solutions[id], sample = SIAB.isEveryday(id);
    const concentration = $(prefix + 'concentration');
    concentration.disabled = sample || solution.kind === 'water';
    $(prefix + 'concentration-field').hidden = sample;
    $(prefix + 'dilution-field').hidden = !sample;
    $(prefix + 'dilution-select').disabled = !sample;
    if (!concentration.disabled && Number(concentration.value) <= 0) concentration.value = .01;
    const description = $(prefix ? 'titrant-description' : 'solution-description');
    description.hidden = !sample;
    description.textContent = sample ? `${solution.preparation} ${solution.note}` : '';
  }
  SIAB.refreshSelects?.();
};
SIAB.render = (syncForm = false) => {
  const $=SIAB.$, s=SIAB.state, t=SIAB.current(), i=s.tubes.indexOf(t), r=SIAB.chem.solve(t), c=SIAB.chem.liquid(t,s.indicatorOnly,r), targets=SIAB.targets(t);
  const rgb=`rgb(${c.rgb.join(',')})`, ind=SIAB.indicators[t.indicator];
  $('workspace').classList.toggle('overview',s.view==='overview');
  $('focus-view').hidden=s.view!=='focus'; $('overview-view').hidden=s.view!=='overview'; $('controls').hidden=s.view==='overview';
  $('focus-tab').setAttribute('aria-pressed',String(s.view==='focus')); $('overview-tab').setAttribute('aria-pressed',String(s.view==='overview'));
  $('tube-count').textContent=`${s.tubes.length} / ${SIAB.MAX_TUBES}`; $('overview-count').textContent=s.tubes.length;
  $('tube-index').textContent=`TUBO ${t.id}`; $('tube-name').textContent=t.name;
  $('sample-summary').textContent=`${SIAB.solutionSummary(t.solution,t.concentration,t.dilution)} · ${SIAB.format(t.initialVolume)} mL iniciais`;
  $('sample-model-note').hidden=!r.approximate;
  $('sample-model-note').textContent='Amostra do cotidiano · pH e resposta às gotas são estimativas. Amostras reais variam.';
  $('ph-value').textContent=s.showPH?SIAB.phFormat(r):'—'; $('ph-phase').textContent=s.showPH?r.phase:'Leitura oculta';
  $('ph-toggle').textContent=s.showPH?'Ocultar pH':'Mostrar pH'; $('ph-toggle').setAttribute('aria-pressed',String(s.showPH));
  $('volume-value').textContent=SIAB.format(r.volume); $('large-tube').innerHTML=SIAB.tubeSVG(t,'focus');
  $('color-name').textContent=c.name; $('color-swatch').style.background=rgb; $('color-swatch').style.opacity=c.opacity;
  $('indicator-name').textContent=c.masked?`${ind.name} · indicador ${c.indicatorName}; amostra ${c.pigmentName}`:ind.name;
  $('indicator-only').checked=s.indicatorOnly; $('indicator-select').value=t.indicator;
  $('indicator-range').textContent=ind.description || (t.indicator==='universal'?'Carta de cores aproximada de pH 1 a 14.':t.indicator==='none'?'A solução é observada sem indicador.':`Faixa de viragem: pH ${SIAB.format(ind.low,1)}–${SIAB.format(ind.high,1)} · ${ind.acidName} → ${ind.baseName}.`);
  $('titrant-label').textContent=SIAB.solutionSummary(t.titrant,t.titrantConcentration,t.titrantDilution);
  $('dose-summary').textContent=`${r.drops} ${r.drops===1?'gota':'gotas'} · ${SIAB.format(r.added)} mL`;
  $('dose-target').textContent=`${SIAB.format(t.dropVolume)} mL por gota · ${t.group?'em cada um dos '+targets.length+' tubos vinculados':t.name}`;
  $('drop-btn').textContent=t.group?'＋ 1 gota em cada tubo':'＋ Adicionar 1 gota';
  $('drop-btn').disabled=targets.some(x=>SIAB.chem.solve(x).volume+x.dropVolume>SIAB.CAPACITY_ML+1e-9);
  $('undo-btn').disabled=!t.additions.length;
  $('previous-btn').disabled=i===0; $('next-btn').disabled=i===s.tubes.length-1; $('all-tubes-btn').textContent=`${i+1} de ${s.tubes.length} · Ver todos`;
  $('equivalence-note').textContent=r.atEquivalence&&s.showPH?'Ponto de equivalência · quantidades estequiométricas':$('drop-btn').disabled?'Capacidade do tubo atingida.':'';
  $('group-notice').hidden=!t.group; $('group-notice').textContent=t.group?`Comparação vinculada · ${targets.length} tubos recebem as mesmas adições.`:'';
  $('unlink-btn').hidden=!t.group; $('compare-btn').disabled=s.tubes.length+3>SIAB.MAX_TUBES;
  $('remove-btn').disabled=s.tubes.length===1; $('restart-btn').disabled=!t.additions.length;
  document.querySelectorAll('[data-action="add"]').forEach(b=>b.disabled=s.tubes.length>=SIAB.MAX_TUBES);
  $('tube-list').innerHTML=s.tubes.map(x=>{const v=SIAB.chem.solve(x),color=SIAB.chem.liquid(x,s.indicatorOnly,v);return `<button data-tube="${x.id}" aria-current="${x.id===s.activeId}"><span class="mini-dot" style="background:rgb(${color.rgb.join(',')})"></span><span><strong>${SIAB.escape(x.name)}</strong><small>${SIAB.indicators[x.indicator].short}${x.group?' · vinculado':''}</small></span></button>`;}).join('');
  $('overview-grid').innerHTML=s.tubes.map(x=>{const v=SIAB.chem.solve(x),col=SIAB.chem.liquid(x,s.indicatorOnly,v);return `<button class="overview-tube" data-tube="${x.id}" aria-current="${x.id===s.activeId}" aria-label="Abrir ${SIAB.escape(x.name)}">${SIAB.tubeSVG(x,'overview',true)}<strong>${SIAB.escape(x.name)}</strong><span class="small overview-sample">${SIAB.escape(SIAB.solutions[x.solution].name)}</span><span class="small">${SIAB.indicators[x.indicator].name}</span><span class="overview-color"><span class="mini-dot" style="background:rgb(${col.rgb.join(',')})"></span>${col.name}</span><span class="overview-readout"><span>${SIAB.format(v.volume)} mL</span>${s.showPH?`<span>pH ${SIAB.phFormat(v)}</span>`:''}</span>${x.group?'<span class="small">Comparação vinculada</span>':''}</button>`;}).join('');
  SIAB.renderHistory(t);
  if(syncForm)SIAB.syncForm();
  SIAB.refreshSelects?.();
};
