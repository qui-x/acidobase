'use strict';
/* Módulos da bancada: Explorar, Medir e Calcular.
   Cada módulo é um cartão recolhível, no estilo dos cartões de modelo do SIMA
   (Laboratório Virtual): o cabeçalho mostra o nome, o número e o selo "Ativo";
   o corpo explica o que o módulo propõe, o que ele libera na bancada e um
   botão "Ativar módulo". Um só cartão fica aberto por vez.
   Internamente o módulo em uso continua sendo SIAB.state.level.

   O que cada módulo libera (conferido em render.js, equacao.js e lupa.js):
   - Explorar: frascos, indicadores e vidraria; pH e cor; gráfico e partículas.
   - Medir: + ajustes de diluição, volume inicial e volume da gota; pOH e
     pH + pOH (Kw) na Equação; volume de equivalência previsto no Gráfico.
   - Calcular: + concentrações em mol/L no preparo; [H₃O⁺], [OH⁻], Ka ou Kb,
     grau de ionização α e quantidade de matéria n = C · V na Equação;
     concentração de cada espécie na lupa de partículas. */
SIAB.MODULOS = {
  explorar: {
    numero: 1, nome: 'Explorar',
    icone: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM16 16l4.5 4.5M8 11h6M11 8v6',
    define: 'Observar antes de medir: escolha frascos e indicadores e veja a cor mudar gota a gota. O pH aparece como leitura, sem contas.',
    fatos: [
      ['Você ajusta', 'Frascos, indicador e vidraria'],
      ['Você observa', 'Cor, pH e partículas'],
      ['Painel VER', 'Gráfico, Partículas, Equação e Histórico'],
      ['Bom para', 'Primeiro contato e comparação de amostras']
    ],
    nota: 'Os números do preparo ficam escondidos: o foco é a relação entre cor e pH.'
  },
  medir: {
    numero: 2, nome: 'Medir',
    icone: 'M4 17 17 4l3 3L7 20H4v-3ZM8 13l1.5 1.5M11 10l1.5 1.5M14 7l1.5 1.5',
    define: 'Controlar as quantidades: diluição, volume inicial e tamanho da gota. O gráfico prevê o volume de equivalência.',
    fatos: [
      ['Libera', 'Ajustes de medida'],
      ['Gráfico', 'Volume de equivalência previsto'],
      ['Equação', 'pOH e pH + pOH (Kw)'],
      ['Bom para', 'Titulações, diluições e tampões']
    ],
    nota: 'Gotas menores mostram melhor o salto de pH perto da equivalência.'
  },
  calcular: {
    numero: 3, nome: 'Calcular',
    icone: 'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01',
    define: 'Quantificar: concentrações em mol/L, [H₃O⁺] e [OH⁻], constantes de equilíbrio e quantidade de matéria.',
    fatos: [
      ['Libera', 'Concentração em mol/L no preparo'],
      ['Equação', '[H₃O⁺], [OH⁻], Ka ou Kb e α'],
      ['Estequiometria', 'n = C · V (mmol) e V de equivalência'],
      ['Partículas', 'Concentração de cada espécie']
    ],
    nota: 'Todos os valores seguem o mesmo balanço de cargas usado nos outros módulos; aqui eles só ficam visíveis.'
  }
};
// Frase curta de cada módulo (avisos para leitor de tela e manual).
SIAB.NIVEIS = Object.fromEntries(Object.entries(SIAB.MODULOS).map(([id, m]) => [id, `Módulo ${m.nome}: ${m.define}`]));

SIAB.modulos = (() => {
  const $ = SIAB.$;
  let aberto = null;   // módulo com o cartão aberto

  const svg = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;

  function montar() {
    const box = $('modulos');
    if (!box || box.childElementCount) return;
    box.innerHTML = Object.entries(SIAB.MODULOS).map(([id, m]) => `
      <section class="modulo" data-modulo="${id}">
        <button type="button" class="modulo-cab" id="modulo-cab-${id}" aria-expanded="false" aria-controls="modulo-corpo-${id}">
          <span class="modulo-icone">${svg(m.icone)}</span>
          <span class="modulo-nome">${m.nome}</span>
          <span class="modulo-selo"><span class="sr-only">, módulo </span>${m.numero}</span>
          <span class="modulo-ativo" hidden><span class="sr-only">, </span>Ativo</span>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="modulo-corpo" id="modulo-corpo-${id}" role="region" aria-labelledby="modulo-cab-${id}" hidden>
          <button type="button" class="modulo-ativar" data-nivel="${id}" aria-pressed="false" aria-describedby="modulo-def-${id}"><span class="modulo-ponto" aria-hidden="true"></span><span class="modulo-ativar-texto">Ativar módulo ${m.nome}</span></button>
          <p class="modulo-def" id="modulo-def-${id}">${m.define}</p>
          <dl class="fact-grid">${m.fatos.map(([rotulo, valor]) => `<div class="fact-cell"><dt class="fact-label">${rotulo}</dt><dd class="fact-value">${valor}</dd></div>`).join('')}</dl>
          <p class="modulo-nota">${m.nota}</p>
        </div>
      </section>`).join('');
  }

  function render() {
    const nivel = SIAB.state.level;
    document.querySelectorAll('#modulos .modulo').forEach(cartao => {
      const id = cartao.dataset.modulo, ativo = id === nivel, expandido = id === aberto;
      cartao.classList.toggle('ativo', ativo);
      cartao.querySelector('.modulo-ativo').hidden = !ativo;
      cartao.querySelector('.modulo-cab').setAttribute('aria-expanded', String(expandido));
      cartao.querySelector('.modulo-corpo').hidden = !expandido;
      const botao = cartao.querySelector('.modulo-ativar');
      botao.setAttribute('aria-pressed', String(ativo));
      botao.querySelector('.modulo-ativar-texto').textContent = ativo ? `Módulo ${SIAB.MODULOS[id].nome} em uso` : `Ativar módulo ${SIAB.MODULOS[id].nome}`;
    });
  }

  // Abre (ou fecha) o cartão de um módulo; só um fica aberto por vez.
  function alternar(id) {
    aberto = aberto === id ? null : id;
    render();
  }

  function ativar(id) {
    if (!SIAB.MODULOS[id]) return;
    if (SIAB.state.level === id) {
      SIAB.announce(`O módulo ${SIAB.MODULOS[id].nome} já está em uso.`);
      return;
    }
    SIAB.state.level = id;
    SIAB.render(true);
    SIAB.announce(`Módulo ${SIAB.MODULOS[id].nome} ativado. ${SIAB.MODULOS[id].define}`);
    SIAB.notice(`Módulo ${SIAB.MODULOS[id].nome} ativado.`);
  }

  function ligar() {
    montar();
    $('modulos').addEventListener('click', evento => {
      const cab = evento.target.closest('.modulo-cab');
      if (cab) alternar(cab.closest('.modulo').dataset.modulo);
      const botao = evento.target.closest('.modulo-ativar');
      if (botao) ativar(botao.dataset.nivel);
    });
    render();
  }

  return { ligar, montar, render, alternar, ativar, get aberto() { return aberto; } };
})();
