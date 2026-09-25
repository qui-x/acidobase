'use strict';
/* Progresso do estudante, guardado só neste navegador (sem conta e sem envio).
   Missões concluídas, recordes dos desafios e o caderno de laboratório. */
SIAB.progresso = (() => {
  const CHAVE = 'siab_progresso_v1';
  const dados = Object.assign({ missoes: {}, desafios: {}, caderno: [], ultima: null }, SIAB.armazenamento.ler(CHAVE, {}));
  const salvar = () => SIAB.armazenamento.gravar(CHAVE, dados);

  return {
    dados,
    salvar,
    missao: id => dados.missoes[id] || null,
    concluirMissao(id, respostas) {
      dados.missoes[id] = { concluida: true, data: new Date().toISOString(), respostas };
      salvar();
    },
    marcarUltima(rota, titulo) {
      dados.ultima = { rota, titulo };
      salvar();
    },
    desafio: id => dados.desafios[id] || null,
    // Registra uma partida e devolve true quando é um novo recorde.
    registrarPartida(id, pontos) {
      const anterior = dados.desafios[id] || { recorde: 0, vezes: 0 };
      dados.desafios[id] = { recorde: Math.max(anterior.recorde, pontos), vezes: anterior.vezes + 1, ultima: pontos };
      salvar();
      return pontos > anterior.recorde;
    },
    // entrada: { tipo, titulo, linhas: [[rótulo, valor], ...] }. Devolve o id da nota.
    anotar(entrada) {
      const id = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      dados.caderno.unshift({ id, data: new Date().toISOString(), ...entrada });
      if (dados.caderno.length > 300) dados.caderno.length = 300;
      salvar();
      return id;
    },
    atualizarNota(id, campos) {
      const nota = dados.caderno.find(x => x.id === id);
      if (nota) Object.assign(nota, campos);
      salvar();
    },
    removerNota(id) {
      dados.caderno = dados.caderno.filter(nota => nota.id !== id);
      salvar();
    },
    limparCaderno() {
      dados.caderno = [];
      salvar();
    },
    apagarTudo() {
      dados.missoes = {};
      dados.desafios = {};
      dados.caderno = [];
      dados.ultima = null;
      salvar();
    }
  };
})();
