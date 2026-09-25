'use strict';
/* Desenho da vidraria em SVG (tubo de ensaio, béquer ou erlenmeyer), com o
   líquido na cor calculada pelo motor.

   Tamanho de verdade: cada recipiente é desenhado com as medidas reais de
   catálogo (diâmetro D e altura H, em mm), todos na MESMA escala e apoiados na
   mesma linha da bancada. Assim o béquer de 50 mL aparece mais baixo e bem
   mais largo que o tubo de ensaio, e o erlenmeyer de 250 mL quase o dobro da
   altura do tubo, como no laboratório.
   - Tubo de ensaio 12 × 75 mm: o tubo "de 5 mL" de catálogo.
   - Béquer forma baixa (Griffin), medidas da norma ISO 3819.
   - Erlenmeyer de gargalo estreito, medidas da norma ISO 1773 (o de 125 mL
     não está na norma: medidas aproximadas de catálogo).
   A altura do líquido vem do volume dentro da forma real (sólido de
   revolução, somado em fatias finas): no tubo e no béquer ela cresce por igual;
   no erlenmeyer, que é um cone, a mesma quantidade sobe mais perto do gargalo.
   Por isso a marca da capacidade fica a cerca de 2/3 da altura do béquer e na
   metade do erlenmeyer: vidraria de verdade tem folga acima da capacidade. */
SIAB.MEDIDAS_VIDRO = {
  tubo: { 5: { D: 12, H: 75 } },
  bequer: { 10: { D: 26, H: 35 }, 25: { D: 34, H: 50 }, 50: { D: 42, H: 60 }, 100: { D: 50, H: 70 }, 250: { D: 70, H: 95 }, 500: { D: 85, H: 120 }, 1000: { D: 105, H: 145 } },
  erlenmeyer: { 25: { D: 42, H: 75, d: 22 }, 50: { D: 51, H: 80, d: 22 }, 125: { D: 64, H: 120, d: 26 }, 250: { D: 85, H: 145, d: 34 } }
};

SIAB.formaVidro = (() => {
  const S = 2.4;          // unidades do desenho por mm
  const BASE = 350;       // linha da bancada (fundo de fora do recipiente)
  const ALTO = 145;       // o recipiente mais alto (erlenmeyer de 250 mL), em mm
  const TOPO = BASE - ALTO * S - 30;   // topo da cena: cabe o mais alto e o conta-gotas
  const ROTULOS = 34;     // espaço à direita para os números da escala
  const cache = new Map();

  // Medidas da capacidade pedida (ou da maior que existir, se não houver).
  function medidas(tipo, capacidade) {
    const tabela = SIAB.MEDIDAS_VIDRO[tipo] || SIAB.MEDIDAS_VIDRO.tubo;
    if (tabela[capacidade]) return tabela[capacidade];
    const lista = Object.keys(tabela).map(Number).sort((x, y) => x - y);
    return tabela[lista.find(c => c >= capacidade) || lista.at(-1)];
  }

  function criar(tipo, capacidade) {
    const m = medidas(tipo, capacidade);
    const ro = m.D / 2 * S, alto = m.H * S, yt = BASE - alto;
    const parede = (tipo === 'tubo' ? .8 : 1) * S, fundo = (tipo === 'tubo' ? .8 : 1.5) * S;
    const ri = ro - parede, yib = BASE - fundo;
    const bico = tipo === 'bequer' ? Math.min(3 * S, ro * .2) : 0;
    const largura = Math.max(100, 2 * (ro + bico + ROTULOS)), cx = largura / 2;
    const f = n => n.toFixed(1);
    let raio, contorno, interno, borda, reflexo, gargalo = 0;
    if (tipo === 'erlenmeyer') {
      const rno = m.d / 2 * S, rni = rno - parede, yn = yt + .2 * alto, rc = Math.min(4 * S, ro * .2);
      const hc = yib - yn;
      gargalo = rni;
      raio = z => (z <= hc ? ri - (ri - rni) * z / hc : rni);
      contorno = `M${f(cx - rno - 3)} ${f(yt)}h3V${f(yn)}L${f(cx - ro)} ${f(BASE - rc)}q-1 ${f(rc)} ${f(rc)} ${f(rc)}H${f(cx + ro - rc)}q${f(rc + 1)} 0 ${f(rc)} ${f(-rc)}L${f(cx + rno)} ${f(yn)}V${f(yt)}h3`;
      interno = `M${f(cx - rni)} ${f(yt + 1)}V${f(yn + 1)}L${f(cx - ri)} ${f(yib - rc * .8)}q-1 ${f(rc * .8)} ${f(rc * .8)} ${f(rc * .8)}H${f(cx + ri - rc * .8)}q${f(rc * .8 + 1)} 0 ${f(rc * .8)} ${f(-rc * .8)}L${f(cx + rni)} ${f(yn + 1)}V${f(yt + 1)}Z`;
      borda = `M${f(cx - rno - 3)} ${f(yt)}h${f(2 * rno + 6)}`;
      reflexo = `M${f(cx - ri * .72)} ${f(yib - 8)}L${f(cx - rni * .6)} ${f(yn + 12)}`;
    } else if (tipo === 'bequer') {
      const rc = Math.min(3 * S, ro * .25);
      raio = () => ri;
      contorno = `M${f(cx - ro - bico)} ${f(yt)}c${f(bico * .6)} ${f(bico * .4)} ${f(bico)} ${f(bico * 1.2)} ${f(bico)} ${f(bico * 2.4)}V${f(BASE - rc)}a${f(rc)} ${f(rc)} 0 0 0 ${f(rc)} ${f(rc)}H${f(cx + ro - rc)}a${f(rc)} ${f(rc)} 0 0 0 ${f(rc)} ${f(-rc)}V${f(yt)}h3`;
      interno = `M${f(cx - ri)} ${f(yt + 2)}V${f(yib - rc * .7)}a${f(rc * .7)} ${f(rc * .7)} 0 0 0 ${f(rc * .7)} ${f(rc * .7)}H${f(cx + ri - rc * .7)}a${f(rc * .7)} ${f(rc * .7)} 0 0 0 ${f(rc * .7)} ${f(-rc * .7)}V${f(yt + 2)}Z`;
      borda = `M${f(cx - ro - bico - 2)} ${f(yt)}h4`;
      reflexo = `M${f(cx - ri + 6)} ${f(yt + alto * .2)}V${f(yib - alto * .12)}`;
    } else {
      raio = z => (z < ri ? Math.sqrt(Math.max(0, ri * ri - (ri - z) ** 2)) : ri);
      contorno = `M${f(cx - ro)} ${f(yt)}V${f(BASE - ro)}A${f(ro)} ${f(ro)} 0 0 0 ${f(cx + ro)} ${f(BASE - ro)}V${f(yt)}`;
      interno = `M${f(cx - ri)} ${f(yt + 1)}V${f(yib - ri)}A${f(ri)} ${f(ri)} 0 0 0 ${f(cx + ri)} ${f(yib - ri)}V${f(yt + 1)}Z`;
      borda = `M${f(cx - ro - 3)} ${f(yt)}h${f(2 * ro + 6)}`;
      reflexo = `M${f(cx - ri * .55)} ${f(yt + 10)}V${f(yib - ri)}`;
    }
    // Volume acumulado do fundo de dentro até cada altura z (fatias de 0,5 unidade).
    const passo = .5, acumulado = [0];
    for (let z = 0; z < yib - yt; z += passo) acumulado.push(acumulado.at(-1) + Math.PI * raio(z + passo / 2) ** 2 * passo);
    const mL = 1000 * S ** 3;   // 1 mL = 1000 mm³, em unidades do desenho
    // Altura (y) da superfície para uma fração da capacidade.
    const altura = fracao => {
      const alvo = Math.max(0, fracao) * capacidade * mL;
      let i = 1;
      while (i < acumulado.length - 1 && acumulado[i] < alvo) i++;
      const a = acumulado[i - 1], b = acumulado[i];
      return yib - ((i - 1) + (b > a ? Math.min(1, (alvo - a) / (b - a)) : 0)) * passo;
    };
    return {
      tipo, capacidade, S, BASE, TOPO, cx, largura, yt, ro, ri, bico, gargalo,
      contorno, interno, borda, reflexo,
      liquido: [cx - ri - 2, 2 * ri + 4],
      sombra: ro + 4,
      altura, meia: y => (y > yib ? 0 : raio(yib - y)),
      // Ponta do conta-gotas: um pouco acima da boca (no mais alto, entra no gargalo).
      ponta: Math.max(yt - 12, TOPO + 58)
    };
  }

  return (tipo, capacidade) => {
    const chave = `${tipo}|${capacidade}`;
    if (!cache.has(chave)) cache.set(chave, criar(tipo, capacidade));
    return cache.get(chave);
  };
})();

// Marcas da escala: cerca de 5 marcas, com números redondos (1, 2, 5, 10, 25 ou 50 mL).
SIAB.marcasDeVolume = capacidade => {
  const passo = [1, 2, 5, 10, 25, 50, 100].find(p => capacidade / p <= 5) || 100;
  return Array.from({ length: Math.floor(capacidade / passo) }, (_, i) => (i + 1) * passo);
};

// Estado visual de um recipiente: altura e cor do líquido, marcas e cor das gotas.
function estadoDoVidro(tube, vidraria) {
  const tipo = SIAB.MEDIDAS_VIDRO[tube.vidraria || vidraria] ? (tube.vidraria || vidraria) : 'tubo';
  const capacidade = SIAB.capacidade(tube, tipo);
  const forma = SIAB.formaVidro(tipo, capacidade);
  const r = SIAB.chem.solve(tube);
  const c = SIAB.chem.liquid(tube, SIAB.state.indicatorOnly, r);
  const y = forma.altura(Math.min(1, r.volume / capacidade));
  // A gota tem a cor do que está no conta-gotas (quase sempre incolor: vidro-azulado).
  const natural = SIAB.solutions[tube.titrant]?.natural;
  const corGota = natural && natural.opacity > .05 ? `rgb(${natural.rgb.join(',')})` : 'rgba(214, 232, 255, .92)';
  const nome = SIAB.VIDRARIAS?.[tipo]?.nome || 'Tubo de ensaio';
  const m = SIAB.MEDIDAS_VIDRO[tipo][capacidade];
  return { tipo, forma, capacidade, r, c, y, meia: forma.meia(y), rgb: `rgb(${c.rgb.join(',')})`, corGota,
    rotulo: `${tube.name} (${nome.toLowerCase()} de ${capacidade} mL${m ? `, ${m.D} × ${m.H} mm` : ''}): solução ${c.name}, ${SIAB.format(r.volume)} mililitros` };
}

// prefix 'focus' desenha a cena da bancada: escala única (tamanho de verdade),
// conta-gotas acima da boca e camada de efeitos. Os outros (visão geral,
// desafios) enquadram só o recipiente, para caber no cartão.
SIAB.tubeSVG = (tube, prefix, small = false, vidraria = 'tubo') => {
  const v = estadoDoVidro(tube, vidraria);
  const { forma, capacidade, y } = v;
  const foco = prefix === 'focus';
  const id = `${prefix}-clip-${tube.id}`;
  const cx = forma.cx;
  const [x0, largura] = forma.liquido;
  const ticks = SIAB.marcasDeVolume(capacidade).map(vol => {
    const yy = forma.altura(vol / capacidade), dentro = cx + forma.meia(yy);
    const tamanho = Math.min(8, forma.meia(yy) * .6);
    return `<path class="tube-tick" d="M${(dentro - 1).toFixed(1)} ${yy.toFixed(1)}h-${tamanho.toFixed(1)}" stroke-width="1"/>${small ? '' : `<text class="tube-graduation" x="${(dentro + 3 * forma.S + 6).toFixed(1)}" y="${(yy + 4).toFixed(1)}">${vol}</text>`}`;
  }).join('');
  const contaGotas = foco ? `<g transform="translate(${(cx - 80).toFixed(1)} ${(forma.ponta - 12).toFixed(1)})"><g class="conta-gotas-vidro" aria-hidden="true">
      <path class="cg-bulbo" d="M70 -22v-11a10 10 0 0 1 20 0v11Z"/>
      <rect class="cg-colar" x="73" y="-23" width="14" height="4" rx="1"/>
      <path class="cg-vidro" d="M75 -19v21l3.4 10h3.2l3.4-10v-21Z"/>
      <path class="cg-liquido" d="M76.4 -8v10l2.6 7.6h2l2.6-7.6v-10Z" style="fill:${v.corGota}"/>
    </g></g>` : '';
  // Cena da bancada: altura fixa (mesma escala para toda vidraria). Fora dela: só o recipiente.
  const caixa = foco
    ? `0 ${forma.TOPO} ${forma.largura.toFixed(1)} ${(forma.BASE + 14 - forma.TOPO).toFixed(1)}`
    : `0 ${(forma.yt - 8).toFixed(1)} ${forma.largura.toFixed(1)} ${(forma.BASE + 14 - forma.yt + 8).toFixed(1)}`;
  return `<svg class="tube-svg vidro-${v.tipo}${foco ? ' vidro-foco' : ''}" viewBox="${caixa}" role="img" aria-label="${SIAB.escape(v.rotulo)}">
    <defs><clipPath id="${id}"><path d="${forma.interno}"/></clipPath>${foco ? `<clipPath id="${id}-abaixo"><rect x="0" y="0" width="${forma.largura.toFixed(1)}" height="400"/></clipPath>` : ''}</defs>
    ${contaGotas}
    <path class="tube-outline" d="${forma.contorno}" stroke-width="2"/>
    <g clip-path="url(#${id})">
      <g class="liquido" style="transform:translateY(${y.toFixed(1)}px)">
        <rect class="liquid-body" x="${x0.toFixed(1)}" y="0" width="${largura.toFixed(1)}" height="400" style="fill:${v.rgb};fill-opacity:${v.c.opacity}"/>
        <ellipse class="liquido-superficie" cx="${cx.toFixed(1)}" cy="0" rx="${v.meia.toFixed(1)}" ry="3" style="fill:${v.rgb};fill-opacity:${Math.min(1, v.c.opacity + .12)}"/>
        ${foco ? `<g class="efeitos-dentro" clip-path="url(#${id}-abaixo)"></g><g class="efeitos-superficie"></g>` : ''}
      </g>
    </g>
    <path d="${forma.borda}" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path class="tube-reflection" d="${forma.reflexo}" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${ticks}
    <ellipse cx="${cx.toFixed(1)}" cy="${forma.BASE + 5}" rx="${forma.sombra.toFixed(1)}" ry="4" fill="currentColor" opacity=".08"/>
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
    const chave = `${tube.id}|${tube.vidraria || vidraria}|${SIAB.capacidade(tube, tube.vidraria || vidraria)}|${SIAB.activeBench}`;
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
    const cx = v.forma.cx, ponta = v.forma.ponta;
    const queda = Math.max(12, v.y - ponta - 3);
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
      { transform: `translate(${cx}px, ${ponta}px) scale(.2)`, opacity: 1, offset: 0 },
      { transform: `translate(${cx}px, ${ponta + 3}px) scale(1)`, opacity: 1, offset: formar / total, easing: 'cubic-bezier(.55, 0, 1, .55)' },
      { transform: `translate(${cx}px, ${(ponta + 3 + queda).toFixed(1)}px) scale(.85, 1.25)`, opacity: 1, offset: 1 }
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
        { transform: `translate(${cx}px, 0) scale(.06, .3)`, opacity: .95 },
        { transform: `translate(${cx}px, 0) scale(1, 1.3)`, opacity: 0 }
      ], { duration: 520, delay: chegada + atraso, easing: 'cubic-bezier(.2, .7, .3, 1)', fill: 'forwards' }));
    });
    const nuvem = criar(dentro, 'circle', { class: 'nuvem-cor', cx: 0, cy: 0, r: Math.min(w, 34), fill: v.rgb });
    nuvem.style.opacity = 0;
    sumir(nuvem, nuvem.animate([
      { transform: `translate(${cx}px, 6px) scale(.08)`, opacity: viragem ? .95 : .6 },
      { transform: `translate(${cx}px, ${viragem ? 40 : 24}px) scale(${viragem ? 2.6 : 1.3})`, opacity: 0 }
    ], { duration: viragem ? 1100 : 650, delay: chegada, easing: 'ease-out', fill: 'forwards' }));
    [-1, 1, 0].forEach((lado, i) => {
      const pingo = criar(svg.querySelector('.efeitos'), 'circle', { class: 'respingo', cx: 0, cy: 0, r: i === 2 ? 1.3 : 1.7, fill: v.corGota });
      pingo.style.opacity = 0;
      const dx = lado * (6 + i * 2), alto = i === 2 ? 17 : 11;
      sumir(pingo, pingo.animate([
        { transform: `translate(${cx}px, ${v.y}px)`, opacity: 1 },
        { transform: `translate(${cx + dx * .6}px, ${v.y - alto}px)`, opacity: 1, offset: .45, easing: 'ease-in' },
        { transform: `translate(${cx + dx}px, ${v.y - 1}px)`, opacity: 0 }
      ], { duration: 380, delay: chegada, easing: 'ease-out', fill: 'forwards' }));
    });
    svg.querySelector('.liquido-superficie')?.animate([
      { transform: 'scale(1, 1)' }, { transform: 'scale(.97, 2.4)' }, { transform: 'scale(1.01, .5)' }, { transform: 'scale(1, 1.3)' }, { transform: 'scale(1, 1)' }
    ], { duration: 480, delay: chegada, easing: 'ease-out' });
    return chegada;
  }

  return { desenhar, gota, pingando };
})();
