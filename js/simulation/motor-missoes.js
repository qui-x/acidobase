'use strict';
/* Motor de missões: interpreta as missões escritas como dados em
   js/data/missoes.js. Não desenha nada; a tela da missão (js/telas/missao.js)
   pergunta ao motor qual é o passo atual e se já dá para avançar.

   Tipos de passo: ler, prever, observar, agir, explicar e quiz. */
SIAB.motor = (() => {
  let ativa = null;

  // Tudo o que as condições das missões podem consultar.
  function contexto() {
    const s = SIAB.state;
    const tubos = s.tubes.map(tube => {
      const r = SIAB.chem.solve(tube);
      return { tube, r, nome: tube.name, cor: SIAB.chem.color(tube.indicator, r.pH).name };
    });
    return {
      tubos,
      tubo: nome => tubos.find(x => x.nome === nome),
      ativo: SIAB.current()?.name,
      estado: s,
      respostas: ativa?.respostas || {},
      visitados: ativa?.visitados || new Set()
    };
  }

  // Monta a bancada da missão a partir da descrição dos tubos.
  function montarBancada(def) {
    const bancada = SIAB.criarBancada();
    const grupos = {};
    def.bancada.tubos.forEach(spec => {
      const { grupo, ...resto } = spec;
      if (grupo && !grupos[grupo]) grupos[grupo] = bancada.nextGroup++;
      SIAB.newTube({ ...resto, group: grupo ? grupos[grupo] : null }, bancada);
    });
    bancada.activeId = bancada.tubes[0].id;
    bancada.showPH = def.bancada.mostrarPH ?? false;
    bancada.level = def.bancada.nivel || 'medir';
    bancada.verTab = def.bancada.verInicial || def.bancada.ver?.[0] || 'grafico';
    return bancada;
  }

  function iniciar(id) {
    const def = SIAB.missoes.find(m => m.id === id);
    if (!def) return null;
    SIAB.benches.mission = montarBancada(def);
    ativa = { def, indice: 0, respostas: {}, gabaritos: {}, visitados: new Set(), concluida: false };
    aoEntrar();
    return ativa;
  }

  const passo = () => (ativa && !ativa.concluida ? ativa.def.passos[ativa.indice] : null);

  // Resposta esperada de um passo "prever" (texto ou mapa tubo → texto).
  // Fica "congelada" quando o estudante confirma a previsão: gotas posteriores
  // não mudam o que era correto no momento da pergunta.
  function gabarito(p) {
    if (!p || p.gabarito === undefined) return null;
    if (ativa?.gabaritos[p.id] !== undefined) return ativa.gabaritos[p.id];
    return typeof p.gabarito === 'function' ? p.gabarito(contexto()) : p.gabarito;
  }

  function concluido(p = passo()) {
    if (!p) return false;
    const resposta = ativa.respostas[p.id];
    if (p.tipo === 'ler' || p.tipo === 'observar') return true;
    if (p.tipo === 'prever') {
      if (p.porTubo) return SIAB.state.tubes.every(t => resposta?.[t.name]);
      return Boolean(resposta);
    }
    if (p.tipo === 'agir') return Boolean(p.concluido(contexto()));
    if (p.tipo === 'explicar') return Boolean(resposta && resposta.trim().length >= 3);
    if (p.tipo === 'quiz') return resposta !== undefined;
    return true;
  }

  function responder(id, valor) {
    if (!ativa) return;
    ativa.respostas[id] = valor;
  }
  function responderTubo(id, tubo, valor) {
    if (!ativa) return;
    ativa.respostas[id] = { ...(ativa.respostas[id] || {}), [tubo]: valor };
  }

  // Efeitos ao entrar em um passo: revelar o pH e abrir uma aba do painel VER.
  function aoEntrar() {
    const p = passo();
    if (!p) return;
    const s = SIAB.state;
    if (p.revelar?.includes('ph')) s.showPH = true;
    if (p.ver) s.verTab = p.ver;
  }

  function avancar() {
    if (!ativa || !concluido()) return false;
    const atual = passo();
    if (atual.tipo === 'prever' && atual.gabarito !== undefined) ativa.gabaritos[atual.id] = gabarito(atual);
    if (ativa.indice < ativa.def.passos.length - 1) {
      ativa.indice++;
      aoEntrar();
    } else {
      concluir();
    }
    return true;
  }

  function voltar() {
    if (!ativa || ativa.indice === 0 || ativa.concluida) return;
    ativa.indice--;
  }

  // Resumo para o caderno: perguntas e respostas da missão.
  function resumo() {
    const linhas = [];
    ativa.def.passos.forEach(p => {
      const resposta = ativa.respostas[p.id];
      if (p.tipo === 'prever' && resposta) {
        const esperado = gabarito(p);
        if (p.porTubo) {
          Object.entries(resposta).forEach(([tubo, valor]) => {
            const certo = esperado ? esperado[tubo] === valor : null;
            linhas.push([`${p.pergunta} · ${tubo}`, `${valor}${certo === null ? '' : certo ? ' ✓' : ` ✗ (resultado: ${esperado[tubo]})`}`]);
          });
        } else {
          const certo = esperado ? esperado === resposta : null;
          linhas.push([p.pergunta, `${resposta}${certo === null ? '' : certo ? ' ✓' : ` ✗ (resultado: ${esperado})`}`]);
        }
      }
      if (p.tipo === 'quiz' && resposta !== undefined) {
        linhas.push([p.pergunta, `${p.opcoes[resposta]}${resposta === p.correta ? ' ✓' : ` ✗ (correta: ${p.opcoes[p.correta]})`}`]);
      }
      if (p.tipo === 'explicar' && resposta) linhas.push([p.pergunta, resposta]);
    });
    return linhas;
  }

  function concluir() {
    ativa.concluida = true;
    const linhas = resumo();
    SIAB.progresso.concluirMissao(ativa.def.id, ativa.respostas);
    SIAB.progresso.anotar({ tipo: 'missao', titulo: `Missão · ${ativa.def.titulo}`, linhas });
  }

  // Marca os tubos vistos na lupa (algumas missões pedem para olhar todos).
  SIAB.loja.assinar(() => {
    if (!ativa || SIAB.activeBench !== 'mission') return;
    if (SIAB.state.verTab === 'particulas' && SIAB.current()) ativa.visitados.add(SIAB.current().name);
  });

  return {
    iniciar, passo, concluido, responder, responderTubo, avancar, voltar, contexto, gabarito, resumo,
    get ativa() { return ativa; }
  };
})();
