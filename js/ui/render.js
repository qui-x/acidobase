'use strict';
SIAB.$ = id => document.getElementById(id);
SIAB.format = (v, digits = 2) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
SIAB.escape = str => String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
SIAB.tubeSVG = (tube, prefix, small = false) => {
  const r = SIAB.chem.solve(tube), c = SIAB.chem.color(tube.indicator, r.pH);
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
    return `<tr><td>${i+1}</td><td>${SIAB.format(r.added)}</td><td>${SIAB.state.showPH?SIAB.format(r.pH):'—'}</td></tr>`;
  }).reverse();
  box.innerHTML = `<table><caption class="sr-only">Histórico de ${SIAB.escape(tube.name)}</caption><thead><tr><th>Gota</th><th>Adicionado (mL)</th><th>pH</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
};
SIAB.syncForm = () => {
  const t = SIAB.current(), $ = SIAB.$;
  $('solution-select').value=t.solution; $('concentration').value=t.concentration; $('initial-volume').value=t.initialVolume;
  $('titrant-select').value=t.titrant; $('titrant-concentration').value=t.titrantConcentration; $('drop-volume').value=t.dropVolume;
  $('indicator-select').value=t.indicator;
  SIAB.syncWaterFields();
};
SIAB.syncWaterFields = () => {
  SIAB.$('concentration').disabled=SIAB.$('solution-select').value==='water';
  SIAB.$('titrant-concentration').disabled=SIAB.$('titrant-select').value==='water';
  for (const id of ['concentration','titrant-concentration']) if (!SIAB.$(id).disabled && Number(SIAB.$(id).value)<=0) SIAB.$(id).value=.01;
};
SIAB.render = (syncForm = false) => {
  const $=SIAB.$, s=SIAB.state, t=SIAB.current(), i=s.tubes.indexOf(t), r=SIAB.chem.solve(t), c=SIAB.chem.color(t.indicator,r.pH), targets=SIAB.targets(t);
  const rgb=`rgb(${c.rgb.join(',')})`, ind=SIAB.indicators[t.indicator];
  $('workspace').classList.toggle('overview',s.view==='overview');
  $('focus-view').hidden=s.view!=='focus'; $('overview-view').hidden=s.view!=='overview'; $('controls').hidden=s.view==='overview';
  $('focus-tab').setAttribute('aria-pressed',String(s.view==='focus')); $('overview-tab').setAttribute('aria-pressed',String(s.view==='overview'));
  $('tube-count').textContent=`${s.tubes.length} / ${SIAB.MAX_TUBES}`; $('overview-count').textContent=s.tubes.length;
  $('tube-index').textContent=`TUBO ${t.id}`; $('tube-name').textContent=t.name;
  $('sample-summary').textContent=`${SIAB.solutions[t.solution].formula} · ${SIAB.solutions[t.solution].kind==='water'?'água pura':SIAB.format(t.concentration,4)+' mol/L'} · ${SIAB.format(t.initialVolume)} mL iniciais`;
  $('ph-value').textContent=s.showPH?SIAB.format(r.pH):'—'; $('ph-phase').textContent=s.showPH?r.phase:'Leitura oculta';
  $('ph-toggle').textContent=s.showPH?'Ocultar pH':'Mostrar pH'; $('ph-toggle').setAttribute('aria-pressed',String(s.showPH));
  $('volume-value').textContent=SIAB.format(r.volume); $('large-tube').innerHTML=SIAB.tubeSVG(t,'focus');
  $('color-name').textContent=c.name; $('color-swatch').style.background=rgb; $('color-swatch').style.opacity=c.opacity;
  $('indicator-name').textContent=ind.name; $('indicator-select').value=t.indicator;
  $('indicator-range').textContent=t.indicator==='universal'?'Carta de cores aproximada de pH 1 a 14.':t.indicator==='none'?'A solução é observada sem indicador.':`Faixa de viragem: pH ${SIAB.format(ind.low,1)}–${SIAB.format(ind.high,1)} · ${ind.acidName} → ${ind.baseName}.`;
  $('titrant-label').textContent=`${SIAB.solutions[t.titrant].formula}${t.titrant==='water'?'':' · '+SIAB.format(t.titrantConcentration,4)+' mol/L'}`;
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
  $('tube-list').innerHTML=s.tubes.map(x=>{const v=SIAB.chem.solve(x),color=SIAB.chem.color(x.indicator,v.pH);return `<button data-tube="${x.id}" aria-current="${x.id===s.activeId}"><span class="mini-dot" style="background:rgb(${color.rgb.join(',')})"></span><span><strong>${SIAB.escape(x.name)}</strong><small>${SIAB.indicators[x.indicator].short}${x.group?' · vinculado':''}</small></span></button>`;}).join('');
  $('overview-grid').innerHTML=s.tubes.map(x=>{const v=SIAB.chem.solve(x),col=SIAB.chem.color(x.indicator,v.pH);return `<button class="overview-tube" data-tube="${x.id}" aria-current="${x.id===s.activeId}" aria-label="Abrir ${SIAB.escape(x.name)}">${SIAB.tubeSVG(x,'overview',true)}<strong>${SIAB.escape(x.name)}</strong><span class="small">${SIAB.indicators[x.indicator].name}</span><span class="overview-color"><span class="mini-dot" style="background:rgb(${col.rgb.join(',')})"></span>${col.name}</span><span class="overview-readout"><span>${SIAB.format(v.volume)} mL</span>${s.showPH?`<span>pH ${SIAB.format(v.pH)}</span>`:''}</span>${x.group?'<span class="small">Comparação vinculada</span>':''}</button>`;}).join('');
  SIAB.renderHistory(t);
  if(syncForm)SIAB.syncForm();
};
