'use strict';
/* Segredos da bancada. Não aparecem no manual.

   1. "Arco-íris do pH"
      Como achar: tocar 7 vezes seguidas no logotipo do cabeçalho (7 = pH
      neutro) ou digitar "arco-íris" na busca da prateleira.
      O que acontece: 7 tubos com indicador universal, do pH 1 ao 13, formam um
      arco-íris na visão geral. Caem gotas coloridas e o caderno ganha a nota
      "Descoberta".

   2. "Mistura geral"
      Como achar: digitar "misturar" na busca da prateleira ou, no celular,
      agitar o aparelho (3 sacudidas fortes seguidas).
      O que acontece: todos os tubos da bancada são despejados num béquer de
      50 mL. O motor calcula a mistura de verdade: soluções, gotas e
      indicadores de todos os tubos (ácidos e bases se neutralizam pela
      quantidade em mol). O caderno registra o resultado.

   Cores e pH vêm sempre do motor químico. Sem animação com "Reduzir
   animações". "Desfazer" volta aos tubos de antes. */
SIAB.segredo = (() => {
  const $ = SIAB.$;
  const TITULO = 'Descoberta secreta · Arco-íris do pH';
  // Do ácido forte à base forte, todos com indicador universal.
  const ARCO_IRIS = [
    { name: 'HCl 0,1 mol/L', solution: 'hcl', concentration: .1 },
    { name: 'HCl 0,001 mol/L', solution: 'hcl', concentration: .001 },
    { name: 'NH₄Cl 0,1 mol/L', solution: 'nh4cl', concentration: .1 },
    { name: 'Água pura', solution: 'water' },
    { name: 'CH₃COONa 0,1 mol/L', solution: 'ch3coona', concentration: .1 },
    { name: 'NH₃ 0,1 mol/L', solution: 'ammonia', concentration: .1 },
    { name: 'NaOH 0,1 mol/L', solution: 'naoh', concentration: .1 }
  ];
  const TOQUES = 7, INTERVALO = 1500;

  // Palavras da busca da prateleira que revelam um frasco secreto.
  const letras = texto => SIAB.normalizar(texto).replace(/[^a-z]/g, '');
  const palavraSecreta = texto => ['arcoiris', 'rainbow'].includes(letras(texto));
  const palavraMistura = texto => ['misturar', 'misturartudo', 'mistura', 'misturageral'].includes(letras(texto));
  const semMovimento = () => {
    const e = window.A11Y?.estado || {};
    return e.motion || e.reading === 'on' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  };

  function frascoSecreto(query) {
    const frasco = (tipo, nome, detalhe, rotulo) => `<div class="shelf-group"><h3 class="shelf-title">Frasco secreto</h3><div class="shelf-bottles">
      <button type="button" class="bottle bottle-secreto" data-segredo="${tipo}" aria-label="${rotulo}">
        <span class="bottle-dot" aria-hidden="true"></span>
        <span class="bottle-text"><strong>${nome}</strong><small>${detalhe}</small></span>
      </button></div></div>`;
    if (palavraSecreta(query)) return frasco('arco-iris', 'Arco-íris do pH', 'Frasco secreto · 7 tubos do pH 1 ao 13', 'Arco-íris do pH. Frasco secreto: monta 7 tubos com indicador universal, do pH 1 ao 13.');
    if (palavraMistura(query)) return frasco('mistura', 'Misturar tudo', 'Frasco secreto · despeja todos os tubos num béquer', 'Misturar tudo. Frasco secreto: despeja todos os tubos da bancada num béquer de 50 mL.');
    return '';
  }

  const leitura = t => {
    const r = SIAB.chem.solve(t);
    const cor = SIAB.chem.liquid(t, false, r);
    return { pH: r.pH, nome: cor.name, rgb: `rgb(${cor.rgb.map(Math.round).join(',')})` };
  };

  function chuva(cores) {
    if (semMovimento()) return;
    const caixa = document.createElement('div');
    caixa.className = 'chuva-arco-iris';
    caixa.setAttribute('aria-hidden', 'true');
    caixa.innerHTML = Array.from({ length: 42 }, (_, i) =>
      `<span style="left:${(Math.random() * 98).toFixed(1)}%;--cor:${cores[i % cores.length]};animation-delay:${(Math.random() * .9).toFixed(2)}s;animation-duration:${(1.3 + Math.random() * .9).toFixed(2)}s"></span>`
    ).join('');
    document.body.append(caixa);
    setTimeout(() => caixa.remove(), 3400);
  }

  function arcoIris() {
    SIAB.usarBancada('lab');
    SIAB.bancada.closeSheet?.(false);
    SIAB.alterar('arco-íris do pH', estado => {
      estado.tubes = [];
      ARCO_IRIS.forEach(spec => SIAB.newTube({ ...spec, indicator: 'universal', titrant: 'water' }, estado));
      estado.activeId = estado.tubes[0].id;
      estado.view = 'overview';
      estado.showPH = true;
    });
    const faixa = SIAB.state.tubes.map(t => ({ tubo: t, ...leitura(t) }));
    $('segredo-faixa').innerHTML = faixa.map(x =>
      `<li><span class="segredo-cor" style="background:${x.rgb}" aria-hidden="true"></span><strong>pH ${SIAB.format(x.pH, 1)}</strong><span>${SIAB.escape(x.nome)}</span></li>`
    ).join('');
    $('segredo').hidden = false;
    if (SIAB.rota.nome === 'laboratorio') SIAB.render(true);
    else SIAB.irPara('#/laboratorio');
    chuva(faixa.map(x => x.rgb));
    if (!SIAB.progresso.dados.caderno.some(n => n.titulo === TITULO)) {
      SIAB.progresso.anotar({
        tipo: 'descoberta',
        titulo: TITULO,
        linhas: [
          ['O que é', 'O indicador universal mistura vários indicadores: cada faixa de pH ganha uma cor, do vermelho (ácido forte) ao roxo (base forte).'],
          ...faixa.map(x => [`pH ${SIAB.format(x.pH, 1)}`, `${x.tubo.name} · ${x.nome}`])
        ]
      });
    }
    SIAB.announce('Descoberta secreta: Arco-íris do pH. Sete tubos com indicador universal, do pH 1 ao 13. Use Desfazer para voltar.');
  }

  /* ---------- Mistura geral ---------- */
  // Animação: cada tubo vai até o béquer e é despejado; o béquer enche com a cor final.
  function animarDespejo(tubos, corFinal, depois) {
    if (semMovimento()) { depois(); return; }
    const caixa = document.createElement('div');
    caixa.className = 'despejo';
    caixa.setAttribute('aria-hidden', 'true');
    const n = tubos.length;
    caixa.innerHTML = `<div class="despejo-palco">
      ${tubos.map((t, i) => `<span class="despejo-tubo" style="--x:${((i - (n - 1) / 2) * Math.min(58, 300 / n)).toFixed(0)}px;--cor:${t.cor};animation-delay:${i * 110}ms"><i></i></span>`).join('')}
      <span class="despejo-bequer"><i style="--cor:${corFinal};transition-delay:${Math.max(0, n * 110 - 200)}ms"></i></span>
    </div><p class="despejo-texto">Misturando ${n} tubos…</p>`;
    document.body.append(caixa);
    requestAnimationFrame(() => caixa.classList.add('enchendo'));
    let feito = false;
    const fim = () => {
      if (feito) return;
      feito = true;
      caixa.remove();
      depois();
    };
    caixa.addEventListener('pointerdown', fim);
    setTimeout(fim, n * 110 + 1500);
  }

  function misturar() {
    SIAB.usarBancada('lab');
    SIAB.bancada.closeSheet?.(false);
    const s = SIAB.state;
    if (s.tubes.length < 2) {
      SIAB.notice('Para a mistura geral, a bancada precisa de pelo menos 2 tubos.');
      if (SIAB.rota.nome !== 'laboratorio') SIAB.irPara('#/laboratorio');
      return;
    }
    const antes = s.tubes.map(t => ({ tubo: t, ...leitura(t) }));
    const spec = SIAB.misturarTubos(s.tubes);
    const atual = SIAB.current() || s.tubes[0];
    let mistura;
    SIAB.alterar('misturar todos os tubos', estado => {
      estado.tubes = [];
      mistura = SIAB.newTube({
        name: 'Mistura', solution: 'water', initialVolume: spec.volume, dilution: 1,
        componentes: spec.componentes, indicadores: spec.indicadores, indicator: spec.indicator,
        titrant: atual.titrant, titrantConcentration: atual.titrantConcentration, titrantDilution: atual.titrantDilution,
        // O menor béquer em que a mistura cabe com folga.
        dropVolume: atual.dropVolume, vidraria: 'bequer', capacidade: [10, 25, 50, 100, 250, 500, 1000].find(ml => ml >= spec.volume * 1.25) || 1000, additions: []
      }, estado);
      estado.activeId = mistura.id;
      estado.view = 'focus';
    });
    const r = SIAB.chem.solve(mistura), fim = leitura(mistura);
    const cor = SIAB.chem.liquid(mistura, false, r).name;
    const mostrar = () => {
      $('mistura-titulo').textContent = `${antes.length} tubos num béquer de ${mistura.capacidade} mL`;
      $('mistura-texto').textContent = `Volume total ${SIAB.format(r.volume)} mL · pH ${SIAB.phFormat(r)} (${r.phase.toLowerCase()}) · ${cor}. Ácidos e bases se neutralizam na proporção das quantidades em mol, não do número de tubos. “Desfazer” devolve os tubos.`;
      $('mistura-aviso').hidden = false;
      if (SIAB.rota.nome === 'laboratorio') SIAB.render(true);
      else SIAB.irPara('#/laboratorio');
      SIAB.announce(`Mistura geral: ${antes.length} tubos num béquer. pH ${SIAB.phFormat(r)}, ${r.phase.toLowerCase()}, ${cor}.`);
    };
    SIAB.render(true);
    animarDespejo(antes.map(x => ({ cor: x.rgb })), fim.rgb, mostrar);
    SIAB.progresso.anotar({
      tipo: 'descoberta',
      titulo: 'Descoberta secreta · Mistura geral',
      linhas: [
        ['Tubos misturados', antes.map(x => `${x.tubo.name} (pH ${SIAB.format(x.pH, 1)})`).join('; ')],
        ['Volume total', `${SIAB.format(r.volume)} mL`],
        ['Indicador', SIAB.nomeIndicador(mistura)],
        ['Resultado', `pH ${SIAB.phFormat(r)}, ${r.phase.toLowerCase()}, ${cor}`]
      ]
    });
  }

  // Celular: 3 sacudidas fortes em até 1,2 s, na bancada, misturam tudo.
  function ouvirAgitar() {
    if (!('DeviceMotionEvent' in window) || typeof DeviceMotionEvent.requestPermission === 'function') return;
    let picos = [];
    window.addEventListener('devicemotion', evento => {
      const a = evento.accelerationIncludingGravity;
      if (!a || SIAB.rota.nome !== 'laboratorio' || document.querySelector('dialog[open]')) return;
      const forca = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
      if (forca < 25) return;
      const agora = Date.now();
      picos = picos.filter(t => agora - t < 1200);
      if (picos.length && agora - picos.at(-1) < 150) return;
      picos.push(agora);
      if (picos.length >= 3 && SIAB.state.tubes.length >= 2) {
        picos = [];
        misturar();
      }
    });
  }

  function ligar() {
    // 7 toques seguidos no logotipo (o sétimo não navega: quem abre a bancada é o segredo).
    let toques = 0, ultimo = 0;
    document.querySelector('.header-brand').addEventListener('click', evento => {
      const agora = Date.now();
      toques = agora - ultimo < INTERVALO ? toques + 1 : 1;
      ultimo = agora;
      if (toques < TOQUES) return;
      toques = 0;
      evento.preventDefault();
      arcoIris();
    });
    // Frasco secreto da prateleira.
    $('shelf').addEventListener('click', evento => {
      const botao = evento.target.closest('[data-segredo]');
      if (!botao) return;
      SIAB.prateleira.fechar(false);
      if (botao.dataset.segredo === 'mistura') misturar();
      else arcoIris();
    });
    $('mistura-fechar').addEventListener('click', () => {
      $('mistura-aviso').hidden = true;
      $('tube-name').focus();
    });
    ouvirAgitar();
    $('segredo-fechar').addEventListener('click', () => {
      $('segredo').hidden = true;
      $('overview-title').focus();
    });
    // A faixa só faz sentido na visão geral do arco-íris.
    SIAB.loja.assinar(estado => {
      if (estado.view !== 'overview' || SIAB.activeBench !== 'lab') $('segredo').hidden = true;
      // O aviso da mistura só vale enquanto o béquer da mistura está em foco.
      if (!SIAB.current()?.componentes?.length || estado.view !== 'focus' || SIAB.activeBench !== 'lab') $('mistura-aviso').hidden = true;
    });
  }

  return { ligar, arcoIris, misturar, frascoSecreto, palavraSecreta, palavraMistura, ARCO_IRIS };
})();
