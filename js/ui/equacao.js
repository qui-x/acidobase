'use strict';
/* Painel "Equação": nível simbólico. Mostra ionização, reação ao misturar e,
   conforme o nível, os números do equilíbrio (pH, pOH, concentrações, α, Ka). */
SIAB.equacao = (() => {
  // Equação iônica da reação entre o que está no tubo e o que cai do conta-gotas.
  function reacaoIonica(a, b) {
    const par = [a, b];
    const tem = kind => par.find(s => s.kind === kind);
    const acidoForte = tem('strongAcid'), acidoFraco = tem('weakAcid');
    const baseForte = tem('strongBase'), baseFraca = tem('weakBase'), suspensao = tem('suspension');
    if (acidoForte && baseForte) return 'H₃O⁺ + OH⁻ → 2 H₂O';
    if (acidoFraco && baseForte) return `${acidoFraco.acidForm} + OH⁻ → ${acidoFraco.baseForm} + H₂O`;
    if (acidoForte && baseFraca) return `${baseFraca.baseForm} + H₃O⁺ → ${baseFraca.acidForm} + H₂O`;
    if (acidoFraco && baseFraca) return `${acidoFraco.acidForm} + ${baseFraca.baseForm} ⇌ ${acidoFraco.baseForm} + ${baseFraca.acidForm}`;
    if ((acidoForte || acidoFraco) && suspensao) {
      const n = suspensao.n;
      return `${suspensao.formula}(s) + ${n} H₃O⁺ → ${suspensao.cation} + ${2 * n} H₂O`;
    }
    const ids = par.map(s => s.id);
    if (ids.includes('bicarbonate') && (acidoForte || acidoFraco)) return 'HCO₃⁻ + H₃O⁺ → H₂CO₃ + H₂O  (H₂CO₃ ⇌ CO₂ + H₂O)';
    if (ids.includes('bicarbonate') && ids.includes('vinegar')) return 'CH₃COOH + HCO₃⁻ → CH₃COO⁻ + H₂CO₃  (H₂CO₃ ⇌ CO₂ + H₂O)';
    if (ids.includes('bicarbonate') && par.some(s => s.kind === 'sample' && s.id !== 'bicarbonate' && s.model?.targetPH < 7)) {
      return 'Ácidos da amostra + HCO₃⁻ → ânions da amostra + H₂CO₃  (H₂CO₃ ⇌ CO₂ + H₂O)';
    }
    if (ids.includes('acetateBuffer') && (acidoForte || acidoFraco)) return 'CH₃COO⁻ + H₃O⁺ → CH₃COOH + H₂O  (o tampão consome o ácido)';
    if (ids.includes('acetateBuffer') && (baseForte || suspensao)) return 'CH₃COOH + OH⁻ → CH₃COO⁻ + H₂O  (o tampão consome a base)';
    if (ids.includes('phosphateBuffer') && (acidoForte || acidoFraco)) return 'HPO₄²⁻ + H₃O⁺ → H₂PO₄⁻ + H₂O  (o tampão consome o ácido)';
    if (ids.includes('phosphateBuffer') && (baseForte || suspensao)) return 'H₂PO₄⁻ + OH⁻ → HPO₄²⁻ + H₂O  (o tampão consome a base)';
    if (par.some(s => s.kind === 'sample') && (baseForte || acidoForte)) {
      return baseForte ? 'Ácidos da amostra + OH⁻ → ânions da amostra + H₂O' : 'Bases da amostra + H₃O⁺ → formas protonadas + H₂O';
    }
    return null;
  }

  // Equação completa ("molecular") quando as duas substâncias estão na tabela de funções.
  const PARA_FUNCOES = { hcl: 'hcl', naoh: 'naoh', mgoh2: 'mgoh2', aloh3: 'aloh3', limewater: 'caoh2', ammonia: 'nh4oh' };
  function reacaoCompleta(a, b) {
    const ida = PARA_FUNCOES[a.id], idb = PARA_FUNCOES[b.id];
    const acido = SIAB.acidos.find(x => x.id === ida || x.id === idb);
    const base = SIAB.bases.find(x => x.id === ida || x.id === idb);
    if (acido && base) return SIAB.funcoes.total(acido, base);
    const nomes = [a.id, b.id].sort().join('+');
    if (nomes === 'acetic+naoh') return { equacao: 'CH₃COOH + NaOH → CH₃COONa + H₂O', nomeSal: 'acetato de sódio' };
    if (nomes === 'acetic+ammonia') return { equacao: 'CH₃COOH + NH₃ → CH₃COONH₄', nomeSal: 'acetato de amônio' };
    if (nomes === 'bicarbonate+hcl') return { equacao: 'NaHCO₃ + HCl → NaCl + H₂O + CO₂', nomeSal: 'cloreto de sódio' };
    return null;
  }

  function linha(rotulo, valor) {
    return `<div class="eq-linha"><dt>${rotulo}</dt><dd>${valor}</dd></div>`;
  }

  function html(tube, { nivel = 'explorar', result = SIAB.chem.solve(tube) } = {}) {
    const a = { id: tube.solution, ...SIAB.solutions[tube.solution] };
    const b = { id: tube.titrant, ...SIAB.solutions[tube.titrant] };
    const blocos = [];
    const ionizacao = s => s.ionization || (s.kind === 'sample' ? 'Mistura com equilíbrios representativos (ver nota da amostra).' : '');
    const componentes = tube.componentes || [];
    if (componentes.length) {
      // Mistura geral: o que foi despejado e a neutralização entre ácidos e bases.
      const papel = s => (['strongAcid', 'weakAcid'].includes(s.kind) ? 'ácido' : ['strongBase', 'weakBase', 'suspension'].includes(s.kind) ? 'base' : '');
      const itens = componentes.map(x => {
        const s = SIAB.solutions[x.id];
        return `<li><strong>${SIAB.escape(SIAB.solutionSummary(x.id, x.concentration, x.dilution))}</strong> · ${SIAB.format(x.volume)} mL${papel(s) ? ` · ${papel(s)}` : ''}${ionizacao(s) ? `<br><span class="eq-formula">${SIAB.escape(ionizacao(s))}</span>` : ''}</li>`;
      }).join('');
      blocos.push(`<section class="eq-bloco"><h3>Na mistura · ${componentes.length} componentes</h3><ul class="eq-lista">${itens}</ul></section>`);
      const temAcido = componentes.some(x => papel(SIAB.solutions[x.id]) === 'ácido');
      const temBase = componentes.some(x => papel(SIAB.solutions[x.id]) === 'base');
      if (temAcido && temBase) {
        blocos.push('<section class="eq-bloco eq-reacao"><h3>Reação ao misturar</h3><p class="eq-formula">H₃O⁺ + OH⁻ → 2 H₂O</p><p class="small">Ácidos e bases se neutralizam na proporção das quantidades em mol, não do número de tubos. O pH final mostra o que sobrou em excesso.</p></section>');
      }
    } else {
      blocos.push(`<section class="eq-bloco"><h3>No tubo · ${SIAB.escape(a.name)}</h3><p class="eq-formula">${SIAB.escape(ionizacao(a))}</p>${a.hydrolysis ? `<p class="eq-formula">${SIAB.escape(a.hydrolysis)}</p>` : ''}${a.explain ? `<p class="small">${SIAB.escape(a.explain)}</p>` : ''}</section>`);
    }
    if (result.added > 0 || tube.titrant !== 'water') {
      blocos.push(`<section class="eq-bloco"><h3>No conta-gotas · ${SIAB.escape(b.name)}</h3><p class="eq-formula">${SIAB.escape(ionizacao(b))}</p></section>`);
    }
    const ionica = componentes.length ? null : reacaoIonica(a, b);
    const completa = componentes.length ? null : reacaoCompleta(a, b);
    if (ionica || completa) {
      blocos.push(`<section class="eq-bloco eq-reacao"><h3>Reação ao misturar</h3>${completa ? `<p class="eq-formula">${SIAB.escape(completa.equacao)}</p><p class="small">Sal formado: ${SIAB.escape(completa.nomeSal)}.</p>` : ''}${ionica ? `<p class="eq-formula">${SIAB.escape(ionica)}</p><p class="small">Equação iônica: só as partículas que reagem.</p>` : ''}</section>`);
    }

    const numeros = [];
    const phTexto = SIAB.state.showPH ? SIAB.phFormat(result) : 'oculto';
    numeros.push(linha('pH', phTexto));
    if (nivel !== 'explorar' && SIAB.state.showPH) {
      numeros.push(linha('pOH', SIAB.format(result.pOH, result.approximate ? 1 : 2)));
      numeros.push(linha('pH + pOH', `${SIAB.format(result.pKw, 2)} (a ${SIAB.format(result.temperature, 0)} °C)`));
    }
    if (nivel === 'calcular' && SIAB.state.showPH) {
      numeros.push(linha('[H₃O⁺]', `${SIAB.cientifico(result.h)} mol/L`));
      numeros.push(linha('[OH⁻]', `${SIAB.cientifico(result.oh)} mol/L`));
      if (a.kind === 'weakAcid') {
        numeros.push(linha('Ka', SIAB.cientifico(a.ka)));
        numeros.push(linha('α (ionização)', `${SIAB.format(SIAB.chem.alpha(a.ka, result.pH) * 100, 1)} %`));
      }
      if (a.kind === 'weakBase') numeros.push(linha('Kb', SIAB.cientifico(a.kb)));
      if (a.kind === 'suspension') numeros.push(linha('Kps', SIAB.cientifico(a.ksp)));
      if (b.kind === 'suspension') numeros.push(linha('Kps do conta-gotas', SIAB.cientifico(b.ksp)));
      const nA = tube.concentration * tube.initialVolume;
      if (a.kind !== 'sample' && a.kind !== 'water') numeros.push(linha('Quantidade no tubo', `n = C · V = ${SIAB.format(tube.concentration, 4)} × ${SIAB.format(tube.initialVolume)} = ${SIAB.format(nA, 5)} mmol`));
      if (result.equivalenceVolume !== null) {
        numeros.push(linha('Volume de equivalência', `V = ${SIAB.format(result.equivalenceVolume, 3)} mL`));
      }
    }
    blocos.push(`<section class="eq-bloco"><h3>Números</h3><dl class="eq-numeros">${numeros.join('')}</dl>${nivel === 'explorar' ? '<p class="field-hint">Mais números nos níveis Medir e Calcular.</p>' : ''}${result.temperature !== 25 ? `<p class="field-hint">A ${SIAB.format(result.temperature, 0)} °C, o neutro é pH ${SIAB.format(result.neutralPH)}.</p>` : ''}</section>`);
    return `<div class="equacao">${blocos.join('')}</div>`;
  }

  return { html, reacaoIonica, reacaoCompleta };
})();
