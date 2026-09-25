'use strict';
/* Desenho da vidraria em SVG (tubo de ensaio, béquer ou erlenmeyer), com o
   líquido na cor calculada pelo motor.
   Todas usam a mesma caixa (160 × 360) para o layout não mudar ao trocar.
   A altura do líquido segue o volume de verdade de cada forma:
     - tubo e béquer são cilindros: altura proporcional ao volume;
     - o erlenmeyer é um cone: a mesma quantidade sobe mais perto do gargalo,
       por isso as marcas de 1 a 5 mL ficam cada vez mais afastadas. */
SIAB.VIDRO = (() => {
  // Cone do erlenmeyer: meia-largura interna em cada altura y (gargalo 9, base 52,5).
  const ERL = { gargalo: 129, base: 313, fundo: 326, marca5: 168 };
  const meiaErl = y => (y <= ERL.gargalo ? 9 : y >= ERL.base ? 52.5 : 9 + (y - ERL.gargalo) * (43.5 / (ERL.base - ERL.gargalo)));
  // Volume acumulado do fundo até cada altura (fatias de 1 unidade, sólido de revolução).
  const acumulado = [];
  for (let y = ERL.fundo, v = 0; y >= 30; y--) {
    acumulado[y] = v;
    v += Math.PI * meiaErl(y - .5) ** 2;
  }
  const alturaErl = fracao => {
    const alvo = fracao * acumulado[ERL.marca5];
    let y = ERL.fundo;
    while (y > ERL.marca5 && acumulado[y - 1] <= alvo) y--;
    const a = acumulado[y], b = acumulado[y - 1];
    return y - (b > a ? (alvo - a) / (b - a) : 0);
  };

  return {
    tubo: {
      contorno: 'M43 30v263a37 37 0 0 0 74 0V30', borda: 'M39 29h82',
      interno: 'M48 31h64v262a32 32 0 0 1-64 0Z', reflexo: 'M54 46v243a26 26 0 0 0 5 15',
      liquido: [48, 64], sombra: 39,
      altura: f => 325 - 280 * f, meia: () => 32
    },
    bequer: {
      contorno: 'M20 58c6 2 10 7 10 16v246a10 10 0 0 0 10 10h80a10 10 0 0 0 10-10V64h5', borda: 'M17 57h4',
      interno: 'M34 66v253a7 7 0 0 0 7 7h78a7 7 0 0 0 7-7V66Z', reflexo: 'M42 88v214',
      liquido: [34, 92], sombra: 56,
      altura: f => 326 - 220 * f, meia: () => 46
    },
    erlenmeyer: {
      contorno: 'M64 40h4v88L24 314q-4 16 14 16h84q18 0 14-16L92 128V40h4', borda: 'M62 40h36',
      interno: 'M71 42v87L27.5 313q-3 13 11 13h83q14 0 11-13L89 129V42Z', reflexo: 'M40 298 72 140',
      liquido: [24, 112], sombra: 58,
      altura: alturaErl, meia: meiaErl
    }
  };
})();

// Marcas da escala: de 1 em 1 mL até 5 mL; em recipientes maiores, de 10 em 10.
SIAB.marcasDeVolume = capacidade => {
  const passo = capacidade <= 5 ? 1 : capacidade <= 20 ? 5 : 10;
  return Array.from({ length: Math.floor(capacidade / passo) }, (_, i) => (i + 1) * passo);
};

SIAB.tubeSVG = (tube, prefix, small = false, vidraria = 'tubo') => {
  const forma = SIAB.VIDRO[tube.vidraria || vidraria] || SIAB.VIDRO.tubo;
  const capacidade = tube.capacidade || SIAB.CAPACITY_ML;
  const r = SIAB.chem.solve(tube);
  const c = SIAB.chem.liquid(tube, SIAB.state.indicatorOnly, r);
  const y = forma.altura(Math.min(1, r.volume / capacidade));
  const id = `${prefix}-clip-${tube.id}`;
  const rgb = `rgb(${c.rgb.join(',')})`;
  const [x0, largura] = forma.liquido;
  const ticks = SIAB.marcasDeVolume(capacidade).map(v => {
    const yy = forma.altura(v / capacidade), borda = 80 + forma.meia(yy);
    return `<path class="tube-tick" d="M${(borda - 2).toFixed(1)} ${yy.toFixed(1)}h-8" stroke-width="1"/>${small ? '' : `<text class="tube-graduation" x="${(borda + 12).toFixed(1)}" y="${(yy + 4).toFixed(1)}">${v}</text>`}`;
  }).join('');
  const nome = SIAB.VIDRARIAS?.[tube.vidraria || vidraria]?.nome || 'Tubo de ensaio';
  return `<svg class="tube-svg vidro-${tube.vidraria || vidraria}" viewBox="0 0 160 360" role="img" aria-label="${SIAB.escape(tube.name)} (${nome.toLowerCase()}): solução ${c.name}, ${SIAB.format(r.volume)} mililitros">
    <defs><clipPath id="${id}"><path d="${forma.interno}"/></clipPath></defs>
    <path class="tube-outline" d="${forma.contorno}" stroke-width="2"/>
    <g clip-path="url(#${id})"><rect class="liquid-body" x="${x0}" y="${y.toFixed(1)}" width="${largura}" height="${(335 - y).toFixed(1)}" fill="${rgb}" fill-opacity="${c.opacity}"/><ellipse cx="80" cy="${y.toFixed(1)}" rx="${forma.meia(y).toFixed(1)}" ry="3" fill="${rgb}" fill-opacity="${Math.min(1, c.opacity + .12)}"/></g>
    <path d="${forma.borda}" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path class="tube-reflection" d="${forma.reflexo}" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${ticks}
    <ellipse cx="80" cy="346" rx="${forma.sombra}" ry="4" fill="currentColor" opacity=".08"/>
  </svg>`;
};
