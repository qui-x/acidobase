'use strict';
/* Tour guiado da bancada (coachmark), no estilo do Laboratório Virtual:
   escurece a tela, contorna uma parte por vez e explica em um cartão com
   "Pular tour", "Voltar" e "Próximo". Abre pelo aviso de boas-vindas ou pelo
   menu ☰ → Tour guiado. É um <dialog> modal: Esc encerra. */
SIAB.tour = (() => {
  const $ = SIAB.$;

  // alvoCelular: o que contornar quando a parte fica em outro lugar no celular.
  const PASSOS = [
    { alvo: '#menu-btn', titulo: 'Menu ☰', texto: 'Roteiros de teste prontos, modos (missões, desafios e professor) e acessibilidade ficam aqui.' },
    { alvo: '#controls', alvoCelular: '#prepare-btn', titulo: 'Prateleira', texto: 'Escolha o módulo (Explorar, Medir ou Calcular), a vidraria e, nos menus Tubo e Conta-gotas, os frascos. Depois, o indicador.' },
    { alvo: '#bancada-vazia', titulo: 'Comece por aqui', texto: 'A bancada começa vazia. Toque num frasco da prateleira e ele vira o Tubo 1. Depois escolha o indicador.' },
    { alvo: '.stage-stats', titulo: 'Leitura', texto: 'pH, régua de cores e volume do tubo em foco. A cor observada também aparece escrita.' },
    { alvo: '#drop-btn', titulo: 'Conta-gotas', texto: 'Segure para gotejar e solte para parar. Um toque põe 1 gota. “Desfazer” volta qualquer ação.' },
    { alvo: '#ver-panel', alvoCelular: '.view-tabs', titulo: 'Painel VER', texto: 'Gráfico da titulação, partículas, equação e histórico mudam a cada gota.' },
    { alvo: '.tube-strip', titulo: 'Tubos da bancada', texto: 'Até 10 tubos. Toque em um para colocá-lo em foco. “Visão geral” mostra todos lado a lado.' },
    { alvo: '#controls .ajuda-link, #experiment .ajuda-link', titulo: 'Ajuda em cada parte', texto: 'Os botões “?” abrem o manual na parte certa. O manual também tem 10 roteiros de teste.' }
  ];
  let passos = [], atual = 0;

  function visivel(elemento) {
    const r = elemento.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(elemento).visibility !== 'hidden';
  }

  function alvoDe(passo) {
    const seletor = (SIAB.bancada.mobile.matches && passo.alvoCelular) || passo.alvo;
    return [...document.querySelectorAll(seletor)].find(visivel) || null;
  }

  // Contorna o alvo e põe o cartão abaixo, acima ou ao lado, sem sair da tela.
  function posicionar() {
    const dialogo = $('tour');
    if (!dialogo.open) return;
    const alvo = alvoDe(passos[atual]);
    const anel = dialogo.querySelector('.tour-anel');
    const cartao = dialogo.querySelector('.tour-cartao');
    const L = window.innerWidth, A = window.innerHeight, M = 12;
    const c = cartao.getBoundingClientRect();
    if (!alvo) {
      anel.hidden = true;
      cartao.style.left = `${(L - c.width) / 2}px`;
      cartao.style.top = `${(A - c.height) / 2}px`;
      return;
    }
    const r = alvo.getBoundingClientRect();
    const topo = Math.max(r.top - 6, 4), base = Math.min(r.bottom + 6, A - 4);
    anel.hidden = false;
    Object.assign(anel.style, {
      left: `${Math.max(r.left - 6, 4)}px`, top: `${topo}px`,
      width: `${Math.min(r.right + 6, L - 4) - Math.max(r.left - 6, 4)}px`, height: `${base - topo}px`
    });
    const limitarX = x => Math.min(Math.max(x, M), L - c.width - M);
    const limitarY = y => Math.min(Math.max(y, M), A - c.height - M);
    let x, y;
    if (base + M + c.height <= A - M) { x = limitarX(r.left + r.width / 2 - c.width / 2); y = base + M; }
    else if (topo - M - c.height >= M) { x = limitarX(r.left + r.width / 2 - c.width / 2); y = topo - M - c.height; }
    else if (r.right + M + c.width <= L - M) { x = r.right + M; y = limitarY(r.top); }
    else if (r.left - M - c.width >= M) { x = r.left - M - c.width; y = limitarY(r.top); }
    else { x = limitarX((L - c.width) / 2); y = A - c.height - M; }
    cartao.style.left = `${x}px`;
    cartao.style.top = `${y}px`;
  }

  function mostrar(n) {
    atual = n;
    const passo = passos[n];
    $('tour-passo').textContent = `PASSO ${n + 1} DE ${passos.length}`;
    $('tour-titulo').textContent = passo.titulo;
    $('tour-texto').textContent = passo.texto;
    $('tour-pontos').innerHTML = passos.map((_, i) => `<span${i === n ? ' class="atual"' : ''}></span>`).join('');
    $('tour-voltar').hidden = n === 0;
    $('tour-proximo').textContent = n === passos.length - 1 ? 'Concluir' : 'Próximo';
    alvoDe(passo)?.scrollIntoView({ block: 'center', behavior: 'auto' });
    requestAnimationFrame(posicionar);
    $('tour-proximo').focus();
  }

  function comecar() {
    // Painéis recolhidos ficam fixos durante o tour (os alvos moram neles).
    SIAB.trilho.suspender();
    passos = PASSOS.filter(alvoDe);
    if (!passos.length) SIAB.trilho.retomar();
    if (!passos.length) return;
    $('tour').showModal();
    mostrar(0);
  }

  function iniciar() {
    if (SIAB.rota.nome === 'laboratorio') {
      comecar();
      return;
    }
    window.addEventListener('hashchange', () => requestAnimationFrame(comecar), { once: true });
    SIAB.irPara('#/laboratorio');
  }

  function encerrar() {
    if ($('tour').open) $('tour').close();
  }

  function ligar() {
    $('tour-proximo').addEventListener('click', () => {
      if (atual < passos.length - 1) mostrar(atual + 1);
      else encerrar();
    });
    $('tour-voltar').addEventListener('click', () => mostrar(Math.max(0, atual - 1)));
    $('tour-pular').addEventListener('click', encerrar);
    $('tour').addEventListener('close', () => {
      SIAB.trilho.retomar();
      SIAB.ajuda.marcarVisto();
      $('boas-vindas').hidden = true;
      // O foco volta ao botão que abriu o tour; se ele sumiu, vai para o nome do tubo.
      requestAnimationFrame(() => {
        const foco = document.activeElement;
        if (!foco || foco === document.body || !visivel(foco)) $(SIAB.current() ? 'tube-name' : 'vazia-titulo').focus();
      });
    });
    window.addEventListener('resize', posicionar);
    document.addEventListener('scroll', posicionar, true);
    $('boas-vindas-tour').addEventListener('click', iniciar);
  }

  return { ligar, iniciar, encerrar, PASSOS };
})();
