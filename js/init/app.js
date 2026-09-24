'use strict';
(() => {
  const $=SIAB.$, s=SIAB.state, mobile=matchMedia('(max-width: 900px)');
  let toastTimer, confirmAction=null, lastSheetFocus=null;
  SIAB.notice = message => {$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3200);};
  const announce = message => {$('announcer').textContent=message;};
  const confirm = (title,message,action) => {$('confirm-title').textContent=title;$('confirm-text').textContent=message;confirmAction=action;$('confirm-dialog').showModal();};
  function closeSheet(restore=true){$('controls').classList.remove('open');$('sheet-backdrop').hidden=true;document.body.classList.remove('sheet-open');$('experiment').inert=false;$('bench-sidebar').inert=false;document.querySelector('.app-header').inert=false;if(mobile.matches){$('controls').inert=true;$('controls').setAttribute('aria-hidden','true');}if(restore&&lastSheetFocus?.isConnected)lastSheetFocus.focus();}
  function openSheet(){if(!mobile.matches)return;lastSheetFocus=document.activeElement;$('controls').hidden=false;$('controls').inert=false;$('controls').classList.add('open');$('controls').setAttribute('aria-hidden','false');$('controls').setAttribute('role','dialog');$('controls').setAttribute('aria-modal','true');$('sheet-backdrop').hidden=false;document.body.classList.add('sheet-open');$('experiment').inert=true;$('bench-sidebar').inert=true;document.querySelector('.app-header').inert=true;$('close-controls').focus();}
  function responsive(){closeSheet(false);if(!mobile.matches){$('controls').inert=false;$('controls').removeAttribute('aria-hidden');$('controls').removeAttribute('role');$('controls').removeAttribute('aria-modal');}}
  function selectTube(id){if(!s.tubes.some(t=>t.id===id))return;closeSheet(false);s.activeId=id;s.view='focus';SIAB.render(true);announce(`${SIAB.current().name} selecionado.`);}
  function showView(view){closeSheet(false);s.view=view;SIAB.render(true);}
  const options = Object.entries(SIAB.solutions).map(([id,x])=>`<option value="${id}">${x.formula} · ${x.name}</option>`).join('');
  $('solution-select').innerHTML=options; $('titrant-select').innerHTML=options;
  $('indicator-select').innerHTML=Object.entries(SIAB.indicators).map(([id,x])=>`<option value="${id}">${x.name}</option>`).join('');
  $('start-btn').addEventListener('click',()=>{s.started=true;$('start-screen').hidden=true;$('workspace').hidden=false;SIAB.render(true);responsive();$('focus-tab').focus();});
  $('focus-tab').addEventListener('click',()=>showView('focus'));
  $('overview-tab').addEventListener('click',()=>showView('overview'));
  $('all-tubes-btn').addEventListener('click',()=>showView('overview'));
  document.addEventListener('click',e=>{const b=e.target.closest('[data-tube]');if(b)selectTube(Number(b.dataset.tube));const c=e.target.closest('[data-close]');if(c)$(c.dataset.close).close();});
  $('previous-btn').addEventListener('click',()=>{const i=s.tubes.indexOf(SIAB.current());if(i>0)selectTube(s.tubes[i-1].id);});
  $('next-btn').addEventListener('click',()=>{const i=s.tubes.indexOf(SIAB.current());if(i<s.tubes.length-1)selectTube(s.tubes[i+1].id);});
  document.querySelectorAll('[data-action="add"]').forEach(b=>b.addEventListener('click',()=>{if(s.tubes.length>=SIAB.MAX_TUBES)return;const t=SIAB.newTube({solution:'water',indicator:'none'});selectTube(t.id);SIAB.notice(`${t.name} adicionado com água. Escolha o preparo.`);if(mobile.matches)openSheet();}));
  $('rename-btn').addEventListener('click',()=>{$('new-name').value=SIAB.current().name;$('new-name').setCustomValidity('');$('rename-dialog').showModal();$('new-name').select();});
  $('new-name').addEventListener('input',()=>{$('new-name').setCustomValidity('');});
  $('rename-form').addEventListener('submit',e=>{e.preventDefault();const name=$('new-name').value.trim().replace(/\s+/g,' ');if(!name){$('new-name').setCustomValidity('Digite um nome para o tubo.');$('new-name').reportValidity();return;}SIAB.current().name=name;$('rename-dialog').close();SIAB.render();announce(`Nome alterado para ${name}.`);});
  $('drop-btn').addEventListener('click',()=>{
    const t=SIAB.current(),targets=SIAB.targets(t);
    if(targets.some(x=>SIAB.chem.solve(x).volume+x.dropVolume>SIAB.CAPACITY_ML+1e-9)){SIAB.notice('Capacidade de 5 mL atingida.');return;}
    targets.forEach(x=>x.additions.push(x.dropVolume));SIAB.render();
    const drop=document.createElement('span');drop.className='falling-drop';drop.setAttribute('aria-hidden','true');$('large-tube').append(drop);setTimeout(()=>drop.remove(),450);
    const r=SIAB.chem.solve(t),color=SIAB.chem.color(t.indicator,r.pH);
    announce(`${r.drops} gotas${t.group?' em cada tubo do grupo':''}. Cor ${color.name}.${s.showPH?' pH '+SIAB.format(r.pH)+'.':''}`);
  });
  $('undo-btn').addEventListener('click',()=>{const t=SIAB.current();SIAB.targets(t).forEach(x=>x.additions.pop());SIAB.render();announce('Última gota desfeita.');});
  $('indicator-select').addEventListener('change',e=>{SIAB.current().indicator=e.target.value;SIAB.render();announce(`Indicador selecionado: ${SIAB.indicators[e.target.value].name}.`);});
  $('ph-toggle').addEventListener('click',()=>{s.showPH=!s.showPH;SIAB.render();});
  for(const id of ['solution-select','titrant-select'])$(id).addEventListener('change',SIAB.syncWaterFields);
  $('prepare-form').addEventListener('submit',e=>{
    e.preventDefault();if(!$('prepare-form').reportValidity())return;
    const settings={solution:$('solution-select').value,concentration:Number($('concentration').value),initialVolume:Number($('initial-volume').value),titrant:$('titrant-select').value,titrantConcentration:Number($('titrant-concentration').value),dropVolume:Number($('drop-volume').value)};
    if(settings.solution==='water')settings.concentration=0;
    if(settings.titrant==='water')settings.titrantConcentration=0;
    const t=SIAB.current(),targets=SIAB.targets(t);
    const apply=()=>{targets.forEach(x=>Object.assign(x,settings,{additions:[]}));closeSheet();SIAB.render(true);SIAB.notice(targets.length>1?'Preparo aplicado aos tubos vinculados.':'Preparo aplicado.');};
    if(targets.some(x=>x.additions.length))confirm('Recomeçar o preparo?',`As adições ${targets.length>1?'do grupo vinculado':'deste tubo'} serão removidas. Os nomes e indicadores serão mantidos.`,apply);else apply();
  });
  $('restart-btn').addEventListener('click',()=>{const targets=SIAB.targets(SIAB.current());confirm('Recomeçar titulação?',`Remover todas as gotas adicionadas ${targets.length>1?'aos tubos vinculados':'a este tubo'}?`,()=>{targets.forEach(t=>t.additions=[]);closeSheet();SIAB.render(true);});});
  $('remove-btn').addEventListener('click',()=>{if(s.tubes.length===1)return;const t=SIAB.current(),index=s.tubes.indexOf(t);confirm('Remover tubo?',`“${t.name}” e suas adições serão removidos desta bancada.`,()=>{closeSheet(false);s.tubes=s.tubes.filter(x=>x.id!==t.id);const rest=s.tubes.filter(x=>x.group&&x.group===t.group);if(rest.length===1)rest[0].group=null;selectTube(s.tubes[Math.min(index,s.tubes.length-1)].id);});});
  $('compare-btn').addEventListener('click',()=>{if(s.tubes.length+3>SIAB.MAX_TUBES)return;const t=SIAB.current();confirm('Comparar indicadores','Criar três cópias da solução atual com bromotimol, fenolftaleína e indicador universal? Cada nova gota será adicionada aos três tubos igualmente.',()=>{const group=s.nextGroup++;const clones=['btb','phenol','universal'].map(indicator=>SIAB.newTube({solution:t.solution,concentration:t.concentration,initialVolume:t.initialVolume,titrant:t.titrant,titrantConcentration:t.titrantConcentration,dropVolume:t.dropVolume,additions:t.additions,indicator,group}));selectTube(clones[0].id);SIAB.notice('Comparação criada: três tubos vinculados.');});});
  $('unlink-btn').addEventListener('click',()=>{const t=SIAB.current(),old=t.group;t.group=null;const rest=s.tubes.filter(x=>x.group===old);if(rest.length===1)rest[0].group=null;SIAB.render();SIAB.notice('Este tubo agora recebe gotas individualmente.');});
  $('prepare-btn').addEventListener('click',openSheet);$('close-controls').addEventListener('click',()=>closeSheet());$('sheet-backdrop').addEventListener('click',()=>closeSheet());
  document.addEventListener('keydown',e=>{if(!$('controls').classList.contains('open')||document.querySelector('dialog[open]'))return;if(e.key==='Escape')closeSheet();if(e.key==='Tab'){const nodes=[...$('controls').querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),summary')].filter(x=>x.offsetParent!==null);const a=nodes[0],b=nodes.at(-1);if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus();}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus();}}});
  $('confirm-yes').addEventListener('click',()=>{const action=confirmAction;confirmAction=null;$('confirm-dialog').close();if(action)action();});
  $('confirm-dialog').addEventListener('close',()=>{confirmAction=null;});
  $('about-btn').addEventListener('click',()=>$('about-dialog').showModal());
  $('history-details').addEventListener('toggle',()=>SIAB.renderHistory(SIAB.current()));
  if (typeof ResizeObserver !== 'undefined') {
    const observer=new ResizeObserver(()=>{
      document.documentElement.style.setProperty('--app-header-height',document.querySelector('.app-header').getBoundingClientRect().height+'px');
      if(!$('workspace').hidden)document.documentElement.style.setProperty('--view-tabs-height',document.querySelector('.view-tabs').getBoundingClientRect().height+'px');
    });
    observer.observe(document.querySelector('.app-header'));observer.observe(document.querySelector('.view-tabs'));
  }
  mobile.addEventListener('change',responsive);SIAB.initPreferences();SIAB.render(true);responsive();
})();
