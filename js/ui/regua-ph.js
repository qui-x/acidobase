'use strict';
/* Régua de pH de 0 a 14, com as cores da carta universal e um marcador. */
SIAB.regua = (() => {
  // Cores de referência da carta universal usada pelo simulador.
  const stops = [0, 2, 4, 6, 7, 8, 10, 12, 14].map(pH => [pH, SIAB.chem.color('universal', Math.max(1, pH)).rgb]);
  const gradiente = id => `<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0">${stops.map(([pH, rgb]) => `<stop offset="${pH / 14}" stop-color="rgb(${rgb.join(',')})"/>`).join('')}</linearGradient>`;
  let contador = 0;

  // pH null = leitura oculta (sem marcador). neutro: pH neutro na temperatura.
  function svg(pH, { neutro = 7, rotulo = 'Régua de pH' } = {}) {
    const id = `regua-grad-${++contador}`;
    const x = v => 8 + (v / 14) * 224;
    const marcador = pH === null ? '' : `<path class="regua-marcador" d="M${x(Math.max(0, Math.min(14, pH)))} 13l-6 -9h12Z"/>`;
    const neutroMarca = `<path class="regua-neutro" d="M${x(neutro)} 14v20" stroke-dasharray="2 2"/>`;
    const descricao = pH === null ? `${rotulo}: leitura oculta.` : `${rotulo}: marcador em pH ${SIAB.format(pH, 1)}. Neutro em ${SIAB.format(neutro, 1)}.`;
    return `<svg class="regua-svg" viewBox="0 0 240 48" role="img" aria-label="${descricao}">
      <defs>${gradiente(id)}</defs>
      <rect x="8" y="16" width="224" height="14" rx="7" fill="url(#${id})"/>
      ${neutroMarca}${marcador}
      <text x="8" y="44">0</text><text x="${x(7)}" y="44" text-anchor="middle">7</text><text x="232" y="44" text-anchor="end">14</text>
    </svg>`;
  }
  return { svg };
})();
