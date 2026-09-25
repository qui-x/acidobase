'use strict';
/* Gráfico de titulação ao vivo (M5): pH × volume adicionado, em SVG.
   Camadas: faixa de viragem do indicador, equivalência e meia-equivalência. */
SIAB.grafico = (() => {
  const W = 340, H = 230, M = { left: 38, right: 12, top: 14, bottom: 34 };
  const largura = W - M.left - M.right, altura = H - M.top - M.bottom;

  // Pontos (volume, pH) a cada gota já adicionada. O pH só depende do volume
  // total gotejado, então cada ponto usa uma "gota" com a soma (rápido mesmo
  // com centenas de gotas num erlenmeyer grande).
  function serie(tube) {
    const pontos = [];
    let soma = 0;
    for (let i = 0; i <= tube.additions.length; i++) {
      if (i > 0) soma += tube.additions[i - 1];
      pontos.push({ v: soma, pH: SIAB.chem.solve({ ...tube, additions: soma > 0 ? [soma] : [] }).pH });
    }
    return pontos;
  }

  // Curva teórica completa até um volume máximo (usada ao fim do desafio).
  function curvaTeorica(tube, maxVolume, passo) {
    const pontos = [];
    for (let v = 0; v <= maxVolume + 1e-9; v += passo) {
      pontos.push({ v, pH: SIAB.chem.solve({ ...tube, additions: v > 0 ? [v] : [] }).pH });
    }
    return pontos;
  }

  function svg(tube, { pontos = serie(tube), teorica = null, maxVolume = null, mostrarMarcas = true, paradaVolume = null } = {}) {
    const r = SIAB.chem.solve(tube);
    const eq = r.equivalenceVolume;
    const ultimo = pontos.at(-1)?.v || 0;
    const xMax = maxVolume || Math.max(1, ultimo * 1.1, eq ? Math.min(SIAB.capacidade(tube) - tube.initialVolume, eq * 1.6) : 0);
    const x = v => M.left + (v / xMax) * largura;
    const y = pH => M.top + (1 - Math.max(0, Math.min(14, pH)) / 14) * altura;
    const partes = [];

    // Grade e eixos.
    for (let pH = 0; pH <= 14; pH += 2) {
      partes.push(`<path class="grafico-grade" d="M${M.left} ${y(pH)}H${W - M.right}"/><text class="grafico-rotulo" x="${M.left - 6}" y="${y(pH) + 4}" text-anchor="end">${pH}</text>`);
    }
    const passoX = [.2, .5, 1, 2, 5, 10, 20, 50, 100].find(p => xMax / p <= 7) || 100;
    for (let v = 0; v <= xMax + 1e-9; v += passoX) {
      partes.push(`<text class="grafico-rotulo" x="${x(v)}" y="${H - M.bottom + 16}" text-anchor="middle">${SIAB.format(v, passoX < 1 ? 1 : 0)}</text>`);
    }
    partes.push(`<text class="grafico-eixo" x="${M.left + largura / 2}" y="${H - 4}" text-anchor="middle">volume adicionado (mL)</text>`);
    partes.push(`<text class="grafico-eixo" x="10" y="${M.top + altura / 2}" transform="rotate(-90 10 ${M.top + altura / 2})" text-anchor="middle">pH</text>`);

    // Faixa de viragem do indicador escolhido.
    const ind = SIAB.indicators[tube.indicator];
    if (mostrarMarcas && ind && ind.acid && ind.base) {
      const cor = `rgb(${ind.middle.join(',')})`;
      partes.push(`<rect class="grafico-faixa" x="${M.left}" y="${y(ind.high)}" width="${largura}" height="${y(ind.low) - y(ind.high)}" fill="${cor}"/>`);
      partes.push(`<text class="grafico-legenda" x="${W - M.right - 4}" y="${y(ind.high) - 3}" text-anchor="end">viragem: ${SIAB.escape(ind.short)}</text>`);
    }
    // Neutro na temperatura do tubo.
    partes.push(`<path class="grafico-neutro" d="M${M.left} ${y(r.neutralPH)}H${W - M.right}"/>`);

    if (mostrarMarcas && eq !== null && eq <= xMax) {
      partes.push(`<path class="grafico-equivalencia" d="M${x(eq)} ${M.top}V${M.top + altura}"/><text class="grafico-legenda" x="${x(eq) + 4}" y="${M.top + 10}">equivalência</text>`);
      if (r.halfEquivalenceVolume !== null) {
        const meia = SIAB.chem.solve({ ...tube, additions: [r.halfEquivalenceVolume] }).pH;
        partes.push(`<circle class="grafico-meia" cx="${x(r.halfEquivalenceVolume)}" cy="${y(meia)}" r="4"/><text class="grafico-legenda" x="${x(r.halfEquivalenceVolume) + 6}" y="${y(meia) + 14}">pH = pKa</text>`);
      }
    }
    if (paradaVolume !== null) {
      partes.push(`<path class="grafico-parada" d="M${x(paradaVolume)} ${M.top}V${M.top + altura}"/><text class="grafico-legenda" x="${x(paradaVolume) - 4}" y="${M.top + 24}" text-anchor="end">você parou</text>`);
    }
    if (teorica) {
      partes.push(`<polyline class="grafico-teorica" points="${teorica.map(p => `${x(p.v)},${y(p.pH)}`).join(' ')}"/>`);
    }
    partes.push(`<polyline class="grafico-linha" points="${pontos.map(p => `${x(p.v)},${y(p.pH)}`).join(' ')}"/>`);
    const final = pontos.at(-1);
    if (final) partes.push(`<circle class="grafico-ponto" cx="${x(final.v)}" cy="${y(final.pH)}" r="4"/>`);

    const descricao = pontos.length > 1
      ? `Curva de titulação: pH de ${SIAB.format(pontos[0].pH)} até ${SIAB.format(final.pH)} depois de ${SIAB.format(final.v)} mL adicionados.${eq !== null ? ` Equivalência em ${SIAB.format(eq)} mL.` : ''}`
      : `Curva de titulação ainda sem gotas. pH inicial ${SIAB.format(pontos[0]?.pH ?? r.pH)}.`;
    return `<svg class="grafico-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${descricao}"><title>${descricao}</title>${partes.join('')}</svg>`;
  }

  return { svg, serie, curvaTeorica };
})();
