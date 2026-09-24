'use strict';
// Controles visíveis para a API A11Y já usada na Central/SIMA/SIQC.
SIAB.initPreferences = () => {
  const $=SIAB.$;
  function sync(){const e=window.A11Y.estado;document.documentElement.classList.toggle('large-text',e.fontScale>=1.4);$('theme-select').value=e.contrast?'contrast':e.theme;$('font-output').textContent=Math.round(e.fontScale*100)+'%';$('font-minus').disabled=e.fontScale<=.8;$('font-plus').disabled=e.fontScale>=2;$('motion-check').checked=e.motion;$('cvd-select').value=e.colorblind;}
  $('access-btn').addEventListener('click',()=>{sync();$('access-dialog').showModal();});
  $('theme-select').addEventListener('change',e=>{A11Y.definir('contrast',e.target.value==='contrast');if(e.target.value!=='contrast')A11Y.definir('theme',e.target.value);sync();});
  for(const [id,delta]of [['font-minus',-.1],['font-plus',.1]])$(id).addEventListener('click',()=>{A11Y.definir('fontScale',Math.max(.8,Math.min(2,A11Y.estado.fontScale+delta)));sync();});
  $('motion-check').addEventListener('change',e=>A11Y.definir('motion',e.target.checked));
  $('cvd-select').addEventListener('change',e=>A11Y.definir('colorblind',e.target.value));
  sync();
};
