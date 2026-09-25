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

// Estado visual de um recipiente: altura e cor do líquido, marcas e cor das gotas.
function estadoDoVidro(tube, vidraria) {
  const tipo = SIAB.VIDRO[tube.vidraria || vidraria] ? (tube.vidraria || vidraria) : 'tubo';
  const forma = SIAB.VIDRO[tipo];
  const capacidade = tube.capacidade || SIAB.CAPACITY_ML;
  const r = SIAB.chem.solve(tube);
  const c = SIAB.chem.liquid(tube, SIAB.state.indicatorOnly, r);
  const y = forma.altura(Math.min(1, r.volume / capacidade));
  // A gota tem a cor do que está no conta-gotas (quase sempre incolor: vidro-azulado).
  const natural = SIAB.solutions[tube.titrant]?.natural;
  const corGota = natural && natural.opacity > .05 ? `rgb(${natural.rgb.join(',')})` : 'rgba(214, 232, 255, .92)';
  const nome = SIAB.VIDRARIAS?.[tipo]?.nome || 'Tubo de ensaio';
  return { tipo, forma, capacidade, r, c, y, meia: forma.meia(y), rgb: `rgb(${c.rgb.join(',')})`, corGota,
    rotulo: `${tube.name} (${nome.toLowerCase()}): solução ${c.name}, ${SIAB.format(r.volume)} mililitros` };
}

// prefix 'focus' desenha também o conta-gotas acima da boca e a camada de efeitos.
SIAB.tubeSVG = (tube, prefix, small = false, vidraria = 'tubo') => {
  const v = estadoDoVidro(tube, vidraria);
  const { forma, capacidade, y } = v;
  const foco = prefix === 'focus';
  const id = `${prefix}-clip-${tube.id}`;
  const [x0, largura] = forma.liquido;
  const ticks = SIAB.marcasDeVolume(capacidade).map(vol => {
    const yy = forma.altura(vol / capacidade), borda = 80 + forma.meia(yy);
    return `<path class="tube-tick" d="M${(borda - 2).toFixed(1)} ${yy.toFixed(1)}h-8" stroke-width="1"/>${small ? '' : `<text class="tube-graduation" x="${(borda + 12).toFixed(1)}" y="${(yy + 4).toFixed(1)}">${vol}</text>`}`;
  }).join('');
  const contaGotas = foco ? `<g class="conta-gotas-vidro" aria-hidden="true">
      <path class="cg-bulbo" d="M70 -22v-11a10 10 0 0 1 20 0v11Z"/>
      <rect class="cg-colar" x="73" y="-23" width="14" height="4" rx="1"/>
      <path class="cg-vidro" d="M75 -19v21l3.4 10h3.2l3.4-10v-21Z"/>
      <path class="cg-liquido" d="M76.4 -8v10l2.6 7.6h2l2.6-7.6v-10Z" style="fill:${v.corGota}"/>
    </g>` : '';
  return `<svg class="tube-svg vidro-${v.tipo}${foco ? ' vidro-foco' : ''}" viewBox="0 ${foco ? -44 : 0} 160 ${foco ? 404 : 360}" role="img" aria-label="${SIAB.escape(v.rotulo)}">
    <defs><clipPath id="${id}"><path d="${forma.interno}"/></clipPath>${foco ? `<clipPath id="${id}-abaixo"><rect x="0" y="0" width="160" height="400"/></clipPath>` : ''}</defs>
    ${contaGotas}
    <path class="tube-outline" d="${forma.contorno}" stroke-width="2"/>
    <g clip-path="url(#${id})">
      <g class="liquido" style="transform:translateY(${y.toFixed(1)}px)">
        <rect class="liquid-body" x="${x0}" y="0" width="${largura}" height="400" style="fill:${v.rgb};fill-opacity:${v.c.opacity}"/>
        <ellipse class="liquido-superficie" cx="80" cy="0" rx="${v.meia.toFixed(1)}" ry="3" style="fill:${v.rgb};fill-opacity:${Math.min(1, v.c.opacity + .12)}"/>
        ${foco ? `<g class="efeitos-dentro" clip-path="url(#${id}-abaixo)"></g><g class="efeitos-superficie"></g>` : ''}
      </g>
    </g>
    <path d="${forma.borda}" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path class="tube-reflection" d="${forma.reflexo}" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${ticks}
    <ellipse cx="80" cy="346" rx="${forma.sombra}" ry="4" fill="currentColor" opacity=".08"/>
    ${foco ? '<g class="efeitos"></g>' : ''}
  </svg>`;
};

/* Vidraria da bancada (tubo em foco) com movimento.
   O desenho é ATUALIZADO, não recriado, a cada gota: assim o nível sobe e a
   cor muda com transição, e os efeitos de uma gota não somem no meio.
   Cada gota: forma-se na ponta do conta-gotas (a borracha aperta), cai
   acelerando até a superfície e, ao bater, faz ondas, respingos e uma nuvem da
   nova cor que se espalha. Na viragem do indicador, a nuvem é maior. O nível
   e a cor do líquido mudam quando a gota chega. Sem nada disso com
   "Reduzir animações" ou "Leitura simples". */
SIAB.vidro = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  let impacto = 0, pendente = null, proximaGota = 0, fimPingando = null;

  const semMovimento = () => {
    const e = window.A11Y?.estado || {};
    return e.motion || e.reading === 'on' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  };

  function aplicar(caixa, tube, vidraria) {
    const svg = caixa.querySelector('svg');
    const v = estadoDoVidro(tube, vidraria);
    svg.setAttribute('aria-label', v.rotulo);
    svg.querySelector('.liquido').style.transform = `translateY(${v.y.toFixed(1)}px)`;
    const corpo = svg.querySelector('.liquid-body'), sup = svg.querySelector('.liquido-superficie');
    corpo.style.fill = v.rgb;
    corpo.style.fillOpacity = v.c.opacity;
    sup.style.fill = v.rgb;
    sup.style.fillOpacity = Math.min(1, v.c.opacity + .12);
    sup.setAttribute('rx', v.meia.toFixed(1));
    const cg = svg.querySelector('.cg-liquido');
    if (cg) cg.style.fill = v.corGota;
  }

  // Desenha o tubo em foco: recria só quando muda o tubo, a vidraria ou a capacidade.
  function desenhar(caixa, tube, vidraria) {
    const chave = `${tube.id}|${tube.vidraria || vidraria}|${tube.capacidade || ''}|${SIAB.activeBench}`;
    if (caixa.dataset.chave !== chave || !caixa.querySelector('svg .liquido')) {
      clearTimeout(pendente);
      caixa.innerHTML = SIAB.tubeSVG(tube, 'focus', false, vidraria);
      caixa.dataset.chave = chave;
      return;
    }
    // Uma gota ainda está caindo: o líquido muda quando ela chegar.
    const falta = impacto - performance.now();
    clearTimeout(pendente);
    if (falta > 0) pendente = setTimeout(() => { const t = SIAB.current(); if (t) aplicar(caixa, t, SIAB.state.vidraria); }, falta);
    else aplicar(caixa, tube, vidraria);
  }

  function criar(pai, tag, atributos) {
    const el = document.createElementNS(NS, tag);
    Object.entries(atributos).forEach(([k, v]) => el.setAttribute(k, v));
    pai.append(el);
    return el;
  }
  const sumir = (el, animacao) => { animacao.onfinish = () => el.remove(); };

  // Conta-gotas visível enquanto uma sequência de gotas acontece.
  function pingando(caixa, ligado) {
    clearTimeout(fimPingando);
    if (ligado) caixa.classList.add('pingando');
    else fimPingando = setTimeout(() => caixa.classList.remove('pingando'), 500);
  }

  // Uma gota (o tubo já tem a gota a mais: o motor calcula o destino).
  function gota(caixa, tube, vidraria, { viragem = false } = {}) {
    const svg = caixa.querySelector('svg.vidro-foco');
    if (!svg || semMovimento() || !svg.animate) return 0;
    const agora = performance.now();
    const inicio = Math.max(agora, proximaGota);
    if (inicio - agora > 560) return Math.max(0, impacto - agora); // rajada grande: basta ~8 gotas visíveis
    proximaGota = inicio + 70;
    const espera = inicio - agora;
    const v = estadoDoVidro(tube, vidraria);
    const queda = Math.max(20, v.y - 16);
    const formar = 90, cair = Math.round(120 + 14 * Math.sqrt(queda)), total = formar + cair;
    impacto = Math.max(impacto, agora + espera + total);

    // Borracha do conta-gotas aperta.
    svg.querySelector('.cg-bulbo')?.animate(
      [{ transform: 'scale(1, 1)' }, { transform: 'scale(.78, .9)', offset: .45 }, { transform: 'scale(1, 1)' }],
      { duration: 240, delay: espera, easing: 'ease-out' });

    // A gota: forma-se na ponta e cai acelerando, esticando um pouco.
    const g = criar(svg.querySelector('.efeitos'), 'path', {
      class: 'gota-caindo', d: 'M0 -5.5c2.6 4 4.2 6.4 4.2 8.5a4.2 4.2 0 0 1-8.4 0c0-2.1 1.6-4.5 4.2-8.5Z', fill: v.corGota
    });
    g.style.opacity = 0;
    sumir(g, g.animate([
      { transform: 'translate(80px, 12px) scale(.2)', opacity: 1, offset: 0 },
      { transform: 'translate(80px, 15px) scale(1)', opacity: 1, offset: formar / total, easing: 'cubic-bezier(.55, 0, 1, .55)' },
      { transform: `translate(80px, ${(15 + queda).toFixed(1)}px) scale(.85, 1.25)`, opacity: 1, offset: 1 }
    ], { duration: total, delay: espera, fill: 'forwards' }));

    // Chegada: ondas, respingos, nuvem de cor e a superfície balançando.
    const chegada = espera + total;
    // Ondas e nuvem ficam no sistema do líquido (superfície em y = 0): acompanham o
    // nível; a nuvem só aparece abaixo da superfície.
    const superficie = svg.querySelector('.efeitos-superficie'), dentro = svg.querySelector('.efeitos-dentro');
    const w = Math.max(8, v.meia);
    [0, 130].forEach((atraso, i) => {
      const onda = criar(superficie, 'ellipse', { class: 'onda', cx: 0, cy: 0, rx: w * .9, ry: 3, 'vector-effect': 'non-scaling-stroke', stroke: i ? v.rgb : v.corGota });
      onda.style.opacity = 0;
      sumir(onda, onda.animate([
        { transform: 'translate(80px, 0) scale(.06, .3)', opacity: .95 },
        { transform: 'translate(80px, 0) scale(1, 1.3)', opacity: 0 }
      ], { duration: 520, delay: chegada + atraso, easing: 'cubic-bezier(.2, .7, .3, 1)', fill: 'forwards' }));
    });
    const nuvem = criar(dentro, 'circle', { class: 'nuvem-cor', cx: 0, cy: 0, r: Math.min(w, 34), fill: v.rgb });
    nuvem.style.opacity = 0;
    sumir(nuvem, nuvem.animate([
      { transform: 'translate(80px, 6px) scale(.08)', opacity: viragem ? .95 : .6 },
      { transform: `translate(80px, ${viragem ? 40 : 24}px) scale(${viragem ? 2.6 : 1.3})`, opacity: 0 }
    ], { duration: viragem ? 1100 : 650, delay: chegada, easing: 'ease-out', fill: 'forwards' }));
    [-1, 1, 0].forEach((lado, i) => {
      const pingo = criar(svg.querySelector('.efeitos'), 'circle', { class: 'respingo', cx: 0, cy: 0, r: i === 2 ? 1.3 : 1.7, fill: v.corGota });
      pingo.style.opacity = 0;
      const dx = lado * (6 + i * 2), alto = i === 2 ? 17 : 11;
      sumir(pingo, pingo.animate([
        { transform: `translate(80px, ${v.y}px)`, opacity: 1 },
        { transform: `translate(${80 + dx * .6}px, ${v.y - alto}px)`, opacity: 1, offset: .45, easing: 'ease-in' },
        { transform: `translate(${80 + dx}px, ${v.y - 1}px)`, opacity: 0 }
      ], { duration: 380, delay: chegada, easing: 'ease-out', fill: 'forwards' }));
    });
    svg.querySelector('.liquido-superficie')?.animate([
      { transform: 'scale(1, 1)' }, { transform: 'scale(.97, 2.4)' }, { transform: 'scale(1.01, .5)' }, { transform: 'scale(1, 1.3)' }, { transform: 'scale(1, 1)' }
    ], { duration: 480, delay: chegada, easing: 'ease-out' });
    return chegada;
  }

  return { desenhar, gota, pingando };
})();
