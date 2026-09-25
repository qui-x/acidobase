'use strict';
/* Manual digital: monta as seções de js/data/manual.js, as tabelas geradas a
   partir do catálogo e os roteiros de teste.
   "Mostrar na bancada" destaca a parte na bancada; "Montar na bancada"
   prepara os tubos de um roteiro (dá para desfazer na bancada). */
SIAB.ajuda = (() => {
  const VISTO = 'siab_manual_visto';
  let pendente = null;

  // Leva à bancada e destaca a parte descrita na seção do manual.
  function mostrar(id) {
    const secao = SIAB.manual.find(x => x.id === id);
    if (!secao?.alvo) return;
    pendente = secao;
    SIAB.irPara('#/laboratorio');
  }

  // Chamado pela tela da bancada. Espera o roteador terminar (foco e rolagem).
  function aplicarPendente() {
    if (!pendente) return;
    const secao = pendente;
    pendente = null;
    requestAnimationFrame(() => {
      const ordem = ['explorar', 'medir', 'calcular'];
      if (secao.nivel && ordem.indexOf(SIAB.state.level) < ordem.indexOf(secao.nivel)) {
        SIAB.state.level = secao.nivel;
        SIAB.render(true);
      }
      if (secao.painel && SIAB.bancada.mobile.matches) SIAB.bancada.openSheet();
      let alvo = document.querySelector(secao.alvo);
      if (!alvo) return;
      // Bancada vazia: leitura, conta-gotas e ajustes só aparecem com um tubo.
      if (!alvo.getClientRects().length && !SIAB.current()) {
        alvo = SIAB.$('bancada-vazia');
        SIAB.notice(`A bancada está vazia. Escolha um frasco na prateleira para ver: ${secao.titulo}.`);
        alvo.scrollIntoView({ block: 'center' });
        alvo.classList.add('ajuda-destaque');
        setTimeout(() => alvo.classList.remove('ajuda-destaque'), 4500);
        return;
      }
      if (alvo.tagName === 'DETAILS') alvo.open = true;
      alvo.scrollIntoView({ block: 'center', behavior: window.A11Y?.estado?.motion ? 'auto' : 'smooth' });
      alvo.classList.remove('ajuda-destaque');
      void alvo.offsetWidth;
      alvo.classList.add('ajuda-destaque');
      setTimeout(() => alvo.classList.remove('ajuda-destaque'), 4500);
      SIAB.notice(`Destacado na bancada: ${secao.titulo}.`);
    });
  }

  return {
    mostrar,
    aplicarPendente,
    jaViu: () => SIAB.armazenamento.ler(VISTO, false),
    marcarVisto: () => SIAB.armazenamento.gravar(VISTO, true)
  };
})();

SIAB.manualTela = (() => {
  const $ = SIAB.$, esc = SIAB.escape;
  const tubo = spec => {
    const { grupo, ...resto } = spec;
    return { id: 0, name: 'tubo', ...SIAB.TUBE_DEFAULTS, ...resto, additions: [] };
  };

  // "Rótulo: texto" vira rótulo em negrito.
  function rotulado(item) {
    const i = item.indexOf(': ');
    return i > 0 && i < 45 ? `<strong>${esc(item.slice(0, i))}:</strong> ${esc(item.slice(i + 2))}` : esc(item);
  }

  /* ---------- Conteúdo gerado ---------- */
  function diagrama() {
    // Caixas baixas (a tira de tubos) levam o número à esquerda do texto.
    const caixa = (x, y, w, h, n, texto, sub) => {
      const baixa = h < 40, by = baixa ? y + h / 2 : y + 14;
      return `<g><rect class="diag-caixa" x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/>
      <circle class="diag-bola" cx="${x + 14}" cy="${by}" r="9"/><text class="diag-num" x="${x + 14}" y="${by + 4}" text-anchor="middle">${n}</text>
      <text class="diag-texto" x="${x + w / 2 + (baixa ? 10 : 0)}" y="${baixa ? y + h / 2 + 4 : y + h / 2 + 2}" text-anchor="middle">${texto}</text>
      ${sub ? `<text class="diag-sub" x="${x + w / 2}" y="${y + h / 2 + 16}" text-anchor="middle">${sub}</text>` : ''}</g>`;
    };
    return `<figure class="manual-figura">
      <svg class="diagrama" viewBox="0 0 360 214" role="img" aria-label="Esquema da bancada no computador: 1 prateleira à esquerda; 2 tubo e leitura no centro; 3 conta-gotas abaixo do tubo; 4 painel VER à direita; 5 tira de tubos embaixo.">
        ${caixa(4, 4, 98, 170, 1, 'Prateleira', 'frascos e indicador')}
        ${caixa(108, 4, 144, 104, 2, 'Tubo e leitura', 'pH, régua, cor')}
        ${caixa(108, 114, 144, 60, 3, 'Conta-gotas', 'gotas e Desfazer')}
        ${caixa(258, 4, 98, 170, 4, 'Painel VER', 'gráfico, partículas')}
        ${caixa(108, 180, 144, 30, 5, 'Tubos da bancada', '')}
      </svg>
      <figcaption>A bancada no computador. No celular, as partes ficam uma embaixo da outra, e a prateleira abre pelo botão “Prateleira”.</figcaption>
    </figure>`;
  }

  // Primeira gota em que a cor do indicador muda.
  function viragem(t) {
    if (t.indicator === 'none') return null;
    const inicial = SIAB.chem.color(t.indicator, SIAB.chem.solve(t).pH).name;
    const maximo = Math.floor((SIAB.CAPACITY_ML - t.initialVolume) / t.dropVolume + 1e-9);
    for (let n = 1; n <= maximo; n++) {
      const nome = SIAB.chem.color(t.indicator, SIAB.chem.solve({ ...t, additions: Array(n).fill(t.dropVolume) }).pH).name;
      if (nome !== inicial) return { n, de: inicial, para: nome };
    }
    return null;
  }

  // Resultado esperado de um roteiro, calculado pelo motor.
  function esperado(roteiro) {
    const linhas = [];
    roteiro.tubos.forEach(spec => {
      const t = tubo(spec);
      const r = SIAB.chem.solve(t);
      const cor = SIAB.chem.color(t.indicator, r.pH).name;
      linhas.push([t.name, `pH inicial ${SIAB.phFormat(r)} · ${cor}`]);
      if (r.equivalenceVolume !== null && r.equivalenceVolume + t.initialVolume <= SIAB.CAPACITY_ML) {
        const veq = r.equivalenceVolume;
        const naEq = SIAB.chem.solve({ ...t, additions: [veq] });
        linhas.push(['', `equivalência em ${SIAB.format(veq)} mL (${Math.round(veq / t.dropVolume)} gotas), pH ${SIAB.phFormat(naEq)}`]);
        if (r.halfEquivalenceVolume !== null) {
          const meia = SIAB.chem.solve({ ...t, additions: [r.halfEquivalenceVolume] });
          linhas.push(['', `meia-equivalência em ${SIAB.format(r.halfEquivalenceVolume)} mL, pH ${SIAB.format(meia.pH)} (= pKa)`]);
        }
        const v = viragem(t);
        if (v) linhas.push(['', `${SIAB.indicators[t.indicator].short} muda na gota ${v.n} (${v.de} → ${v.para})`]);
      }
    });
    if (roteiro.extra) {
      const medir = (nome, n) => {
        const t = tubo(roteiro.tubos.find(x => x.name === nome));
        return `pH ${SIAB.phFormat(SIAB.chem.solve({ ...t, additions: Array(n).fill(t.dropVolume) }))}`;
      };
      linhas.push(...roteiro.extra(medir));
    }
    return linhas;
  }

  function descricaoTubo(spec) {
    const t = tubo(spec);
    const gotas = t.titrant === 'water' && spec.titrant === 'water' && !spec.dropVolume
      ? 'sem gotas'
      : `conta-gotas: ${SIAB.solutionSummary(t.titrant, t.titrantConcentration, t.titrantDilution)}, gota de ${SIAB.format(t.dropVolume)} mL`;
    return `<strong>${esc(t.name)}</strong>: ${esc(SIAB.solutionSummary(t.solution, t.concentration, t.dilution))}, ${SIAB.format(t.initialVolume)} mL · ${esc(gotas)} · ${esc(SIAB.indicators[t.indicator].name)}${spec.grupo ? ' · vinculado' : ''}`;
  }

  function roteiros() {
    return `<div class="roteiros">${SIAB.roteiros.map(r => `<article class="roteiro" id="roteiro-${r.id}">
      <h3>${esc(r.titulo)}</h3>
      <p>${esc(r.objetivo)}</p>
      <p class="eyebrow">MONTA · NÍVEL ${esc(r.nivel.toUpperCase())}</p>
      <ul class="manual-lista">${r.tubos.map(spec => `<li>${descricaoTubo(spec)}</li>`).join('')}</ul>
      <p class="eyebrow">DEPOIS DE MONTAR</p>
      <ol class="manual-passos">${r.passos.map(p => `<li>${esc(p)}</li>`).join('')}</ol>
      <p class="eyebrow">RESULTADO ESPERADO</p>
      <dl class="roteiro-esperado">${esperado(r).map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>
      <button type="button" class="primary-btn" data-roteiro="${r.id}">Montar na bancada</button>
    </article>`).join('')}</div>`;
  }

  function frascos() {
    const grupos = Object.entries(SIAB.solutionGroups).map(([grupo, rotulo]) => {
      const itens = Object.entries(SIAB.solutions).filter(([, x]) => x.group === grupo);
      if (!itens.length) return '';
      const linhas = itens.map(([id, x]) => {
        const reagente = x.kind !== 'sample' && x.kind !== 'water';
        const r = SIAB.chem.solve(tubo({ solution: id, concentration: reagente ? .01 : 0, titrant: 'water', indicator: 'none' }));
        return `<tr><td>${esc(x.name)}</td><td>${esc(x.kind === 'sample' ? '—' : x.formula || '—')}</td><td>${esc(x.label || '')}</td><td>${SIAB.phFormat(r)}</td></tr>`;
      }).join('');
      return `<tbody><tr class="tabela-grupo"><th colspan="4" scope="rowgroup">${esc(rotulo)}</th></tr>${linhas}</tbody>`;
    }).join('');
    return `<div class="tabela-rolagem"><table class="manual-tabela"><caption class="sr-only">Frascos da prateleira e pH de cada um sozinho</caption>
      <thead><tr><th scope="col">Frasco</th><th scope="col">Fórmula</th><th scope="col">Tipo</th><th scope="col">pH sozinho</th></tr></thead>${grupos}</table></div>`;
  }

  function indicadores() {
    const amostra = (id, pH) => `<span class="mini-dot" style="background:rgb(${SIAB.chem.color(id, pH).rgb.join(',')})" aria-hidden="true"></span>`;
    const linhas = Object.entries(SIAB.indicators).filter(([id]) => id !== 'none').map(([id, x]) => {
      let faixa, cores;
      if (x.acid) {
        faixa = `${SIAB.format(x.low, 1)} a ${SIAB.format(x.high, 1)}`;
        cores = `${amostra(id, 0)} ${esc(x.acidName)} → ${amostra(id, (x.low + x.high) / 2)} ${esc(x.middleName)} → ${amostra(id, 14)} ${esc(x.baseName)}`;
      } else {
        faixa = 'carta de 1 a 14 (aproximada)';
        const pontos = [];
        for (const nome of SIAB.chem.colorNames(id)) {
          const [a, b] = SIAB.chem.colorRange(id, nome);
          pontos.push(`${amostra(id, (a + b) / 2)} ${esc(nome)} (${SIAB.format(a, 0)}–${SIAB.format(b, 0)})`);
        }
        cores = pontos.join(' · ');
      }
      return `<tr><td>${esc(x.name)}</td><td>${faixa}</td><td class="celula-cores">${cores}</td></tr>`;
    }).join('');
    return `<div class="tabela-rolagem"><table class="manual-tabela"><caption class="sr-only">Indicadores, faixas de viragem e cores</caption>
      <thead><tr><th scope="col">Indicador</th><th scope="col">Faixa de viragem (pH)</th><th scope="col">Cores (ácido → básico)</th></tr></thead><tbody>${linhas}</tbody></table></div>`;
  }

  const GERADOS = { diagrama, roteiros, frascos, indicadores };

  function bloco(b) {
    if (b.p) return `<p>${esc(b.p)}</p>`;
    if (b.lista) return `<ul class="manual-lista">${b.lista.map(item => `<li>${rotulado(item)}</li>`).join('')}</ul>`;
    if (b.passos) return `<ol class="manual-passos">${b.passos.map(item => `<li>${esc(item)}</li>`).join('')}</ol>`;
    if (b.dica) return `<p class="manual-dica"><strong>Dica:</strong> ${esc(b.dica)}</p>`;
    if (b.teclas) return `<dl class="manual-teclas">${b.teclas.map(([tecla, acao]) => `<div><dt><kbd>${esc(tecla)}</kbd></dt><dd>${esc(acao)}</dd></div>`).join('')}</dl>`;
    if (b.faq) return `<dl class="manual-faq">${b.faq.map(([pergunta, resposta]) => `<dt>${esc(pergunta)}</dt><dd>${esc(resposta)}</dd>`).join('')}</dl>`;
    if (b.gerado) return GERADOS[b.gerado]();
    return '';
  }

  function render() {
    $('manual-indice').innerHTML = SIAB.manual.map((s, i) => `<li data-indice="${s.id}"><a href="#/manual/${s.id}">${i + 1}. ${esc(s.titulo)}</a></li>`).join('');
    $('manual-conteudo').innerHTML = SIAB.manual.map((s, i) => `<section class="manual-secao" id="manual-${s.id}" aria-labelledby="manual-h-${s.id}">
      <h2 id="manual-h-${s.id}" tabindex="-1">${i + 1}. ${esc(s.titulo)}</h2>
      <p class="manual-resumo">${esc(s.resumo)}</p>
      ${s.blocos.map(bloco).join('')}
      <div class="manual-acoes-secao">
        ${s.alvo ? `<button type="button" class="secondary-btn" data-mostrar="${s.id}">Mostrar na bancada</button>` : ''}
        ${s.link ? `<a class="secondary-btn" href="${s.link[0]}">${esc(s.link[1])}</a>` : ''}
        <a class="quiet-btn" href="#/manual">Voltar ao índice</a>
      </div>
    </section>`).join('');
  }

  function filtrar() {
    const busca = SIAB.normalizar($('manual-busca').value.trim());
    let visiveis = 0;
    SIAB.manual.forEach(s => {
      const secao = $(`manual-${s.id}`);
      const mostra = !busca || SIAB.normalizar(secao.textContent).includes(busca);
      secao.hidden = !mostra;
      document.querySelector(`[data-indice="${s.id}"]`).hidden = !mostra;
      if (mostra) visiveis++;
    });
    $('manual-vazio').hidden = visiveis > 0;
  }

  // Substitui os tubos da bancada pelos do roteiro (fica no Desfazer).
  function montar(id) {
    const roteiro = SIAB.roteiros.find(r => r.id === id);
    if (!roteiro) return;
    SIAB.usarBancada('lab');
    SIAB.alterar(`montar roteiro “${roteiro.titulo}”`, estado => {
      estado.tubes = [];
      const grupos = {};
      roteiro.tubos.forEach(spec => {
        const { grupo, ...resto } = spec;
        if (grupo && !grupos[grupo]) grupos[grupo] = estado.nextGroup++;
        SIAB.newTube({ ...resto, group: grupo ? grupos[grupo] : null }, estado);
      });
      estado.activeId = estado.tubes[0].id;
      estado.level = roteiro.nivel;
      estado.view = 'focus';
      estado.showPH = true;
      estado.verTab = roteiro.ver || 'grafico';
      estado.destination = 'tube';
      // Os roteiros foram calculados para o tubo de ensaio (5 mL).
      estado.vidraria = 'tubo';
    });
    SIAB.irPara('#/laboratorio');
    SIAB.notice(`Roteiro montado: ${roteiro.titulo}. “Desfazer” volta aos tubos anteriores.`);
  }

  function ligar() {
    $('manual-busca').addEventListener('input', filtrar);
    $('manual-imprimir').addEventListener('click', () => {
      $('manual-busca').value = '';
      filtrar();
      window.print();
    });
    $('manual-conteudo').addEventListener('click', evento => {
      const botao = evento.target.closest('button');
      if (!botao) return;
      if (botao.dataset.mostrar) SIAB.ajuda.mostrar(botao.dataset.mostrar);
      if (botao.dataset.roteiro) montar(botao.dataset.roteiro);
    });
    $('boas-vindas-fechar').addEventListener('click', () => {
      SIAB.ajuda.marcarVisto();
      $('boas-vindas').hidden = true;
      $(SIAB.current() ? 'tube-name' : 'vazia-titulo').focus();
    });
  }

  return { render, ligar, montar, esperado, viragem };
})();

SIAB.telas.manual = {
  secao: 'manual',
  titulo: () => 'Manual',
  montado: false,
  entrar(parametro) {
    SIAB.ajuda.marcarVisto();
    if (!this.montado) {
      SIAB.manualTela.render();
      this.montado = true;
    }
    const secao = parametro && document.getElementById(`manual-${parametro}`);
    if (secao) {
      // Depois que o roteador termina, rola até a seção pedida.
      requestAnimationFrame(() => {
        secao.hidden = false;
        secao.scrollIntoView({ block: 'start' });
        document.getElementById(`manual-h-${parametro}`).focus({ preventScroll: true });
      });
    }
  }
};
