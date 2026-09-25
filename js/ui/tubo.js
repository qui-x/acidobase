'use strict';
/* Desenho do tubo de ensaio em SVG, com o líquido na cor calculada. */
SIAB.tubeSVG = (tube, prefix, small = false) => {
  const r = SIAB.chem.solve(tube);
  const c = SIAB.chem.liquid(tube, SIAB.state.indicatorOnly, r);
  const y = 325 - 280 * Math.min(1, r.volume / SIAB.CAPACITY_ML);
  const id = `${prefix}-clip-${tube.id}`;
  const rgb = `rgb(${c.rgb.join(',')})`;
  const ticks = [1, 2, 3, 4, 5].map(v => `<path class="tube-tick" d="M110 ${325 - 56 * v}h-8" stroke-width="1"/>${small ? '' : `<text class="tube-graduation" x="128" y="${329 - 56 * v}">${v}</text>`}`).join('');
  return `<svg class="tube-svg" viewBox="0 0 160 360" role="img" aria-label="${SIAB.escape(tube.name)}: solução ${c.name}, ${SIAB.format(r.volume)} mililitros">
    <defs><clipPath id="${id}"><path d="M48 31h64v262a32 32 0 0 1-64 0Z"/></clipPath></defs>
    <path class="tube-outline" d="M43 30v263a37 37 0 0 0 74 0V30" stroke-width="2"/>
    <g clip-path="url(#${id})"><rect class="liquid-body" x="48" y="${y}" width="64" height="${330 - y}" fill="${rgb}" fill-opacity="${c.opacity}"/><ellipse cx="80" cy="${y}" rx="32" ry="3" fill="${rgb}" fill-opacity="${Math.min(1, c.opacity + .12)}"/></g>
    <path d="M39 29h82" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path class="tube-reflection" d="M54 46v243a26 26 0 0 0 5 15" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${ticks}
    <ellipse cx="80" cy="346" rx="39" ry="4" fill="currentColor" opacity=".08"/>
  </svg>`;
};
