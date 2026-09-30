"use strict";
SIAB.relatorios = (() => {
  const esc = SIAB.escape;
  let atual = null,
    emBranco = false;
  const campos = [
    ["observacoes", "Observações"],
    ["interpretacao", "Interpretação"],
    ["resposta", "Resposta à Pergunta central"],
    ["conclusao", "Conclusão"],
  ];
  const lerTodos = () => SIAB.persistencia.ler("siab_relatorios_v1", {});
  function capturar() {
    const b = SIAB.state,
      exp = b.experiencia,
      r = SIAB.experimentos.find((x) => x.id === exp?.roteiro);
    b.reportId ||=
      exp?.id || globalThis.crypto?.randomUUID?.() || String(Date.now());
    const old = lerTodos()[b.reportId];
    const rows = b.tubes.map((t) => {
      const c = SIAB.chem.solve(t),
        m = SIAB.instrumentos.leitura(t);
      return {
        nome: t.name,
        conteudo: SIAB.resumoConteudo(t),
        vidraria: SIAB.VIDRARIAS[t.vidraria || b.vidraria].nome,
        volume: c.volume,
        temperatura: c.temperature,
        ph: m.texto,
        instrumento: m.tecnica || "Não utilizado",
        indicador: SIAB.nomeIndicador(t),
        cor: c.color.name,
        qualidade: c.quality,
        condutividade: t.observacao?.condutividade || null,
        tabela: SIAB.historicoTabela(t),
        grafico: SIAB.graficoMedido(t),
        calculos:
          b.level === "calcular"
            ? {
                preparos: SIAB.chem
                  .base(t)
                  .map((x) => ({
                    nome: SIAB.solutions[x.id].name,
                    amostra: SIAB.isEveryday(x.id),
                    agua: x.id === "water",
                    concentracao: x.concentration,
                    volume: x.volume,
                    mmol: x.concentration * x.volume,
                  })),
                equivalencias: c.equivalencias,
                pKw: c.pKw,
              }
            : null,
      };
    });
    atual = {
      id: b.reportId,
      origem: r ? "roteiro" : "livre",
      roteiro: r
        ? {
            id: r.id,
            titulo: r.titulo,
            subtitulo: r.subtitulo,
            problema: r.problema,
            pergunta: r.pergunta,
            objetivo: r.objetivo,
          }
        : null,
      modulo: b.level,
      identificacao:
        old?.identificacao ||
        exp?.identificacao ||
        SIAB.atividades?.ativa?.identificacao ||
        {},
      aluno: old?.aluno || {},
      recipientes: rows,
      atualizado: new Date().toISOString(),
    };
    salvar();
    return atual;
  }
  function salvar() {
    if (!atual) return;
    const all = lerTodos();
    all[atual.id] = atual;
    SIAB.persistencia.salvar("siab_relatorios_v1", all);
  }
  function tabela(rows) {
    return `<div class="table-scroll"><table><thead><tr><th>Recipiente</th><th>Volume</th><th>T</th><th>pH</th><th>Técnica</th><th>Cor</th></tr></thead><tbody>${rows.map((t) => `<tr><td>${esc(t.nome)}</td><td>${SIAB.format(t.volume)} mL</td><td>${SIAB.format(t.temperatura, 1)} °C</td><td>${esc(t.ph)}</td><td>${esc(t.instrumento)}</td><td>${esc(t.cor)}</td></tr>`).join("")}</tbody></table></div>`;
  }
  function calculosHTML(c) {
    const partes = c.preparos || [
      {
        nome: "Solução inicial",
        concentracao: c.concentracao,
        volume: c.volumeInicial,
        mmol: c.mmol,
      },
    ];
    return `<h4>Cálculos do modelo</h4><p>Preparo inicial, antes das adições registradas nesta etapa:</p>${partes.map((x) => `<p>${esc(x.nome)}: ${x.agua ? "solvente" : x.amostra ? "composição representativa parcial; não se atribui um único número de mols à amostra" : `n = C·V = ${SIAB.format(x.concentracao, 4)} mol/L × ${SIAB.format(x.volume / 1000, 5)} L = ${SIAB.cientifico(x.mmol / 1000)} mol`}.</p>`).join("")}<p>pKw(T) = ${SIAB.format(c.pKw)}. Volumes de equivalência previstos: ${c.equivalencias.length ? c.equivalencias.map((v) => SIAB.format(v) + " mL").join(", ") : "não se aplica"}.</p>`;
  }
  function html({ editar = false, branco = false } = {}) {
    if (!atual) return "<p>Nenhum relatório disponível.</p>";
    const r = atual,
      ex = r.roteiro;
    const ident = editar
      ? SIAB.identificacaoHTML(r.identificacao)
      : `<dl class="report-ident">${[
          ["nome", "Nome"],
          ["turma", "Turma"],
          ["data", "Data"],
          ["professor", "Professor"],
          ["grupo", "Grupo"],
        ]
          .map(
            ([k, l]) =>
              `<div><dt>${l}</dt><dd>${branco ? "________________________________" : esc(r.identificacao[k] || "________________________________")}</dd></div>`,
          )
          .join("")}</dl>`;
    let content = `<article class="digital-report"><header><div class="report-brand"><img src="assets/siab-icone.svg" width="40" height="40" alt=""><strong>SIAB</strong></div><h1 data-foco tabindex="-1">${ex ? "Relatório da Experiência" : "Relatório da Bancada"}</h1>${ex ? `<h2>${esc(ex.titulo)}</h2><p>${esc(ex.subtitulo)}</p>` : ""}<p>Módulo ${SIAB.MODULOS[r.modulo].nome}</p>${ident}</header>`;
    if (ex)
      content += `<section><h2>1. Proposta</h2><h3>O problema</h3><p>${esc(ex.problema)}</p><h3>Pergunta central</h3><p>${esc(ex.pergunta)}</p><h3>Objetivo</h3><p>${esc(ex.objetivo)}</p></section>`;
    content += `<section><h2>${ex ? "2. " : ""}Montagem experimental</h2><ul>${r.recipientes.map((t) => `<li>${esc(t.nome)} · ${esc(t.vidraria)} · ${esc(t.conteudo)} · ${esc(t.indicador)}</li>`).join("")}</ul></section><section><h2>${ex ? "3. " : ""}Resultados experimentais</h2>${branco ? '<div class="writing-space"></div>' : tabela(r.recipientes)}`;
    if (!branco && r.modulo !== "explorar")
      content += r.recipientes
        .map(
          (t) =>
            `<section class="report-result"><h3>${esc(t.nome)}</h3>${t.grafico}<div class="table-scroll"><table><thead><tr>${t.tabela.colunas.map((x) => `<th>${esc(x)}</th>`).join("")}</tr></thead><tbody>${t.tabela.linhas.map((l) => `<tr>${l.map((x) => `<td>${esc(x)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${t.condutividade ? `<p>Condutividade registrada: ${SIAB.format(t.condutividade.valor)} µS/cm · mobilidades de referência a 25 °C.</p>` : ""}${t.calculos ? calculosHTML(t.calculos) : ""}</section>`,
        )
        .join("");
    content += "</section>";
    campos
      .filter(([k]) => ex || k !== "resposta")
      .forEach(([k, label], i) => {
        content += `<section><h2>${ex ? `${i + 4}. ` : ""}${label}</h2>${editar ? `<label class="sr-only" for="rel-${k}">${label}</label><textarea id="rel-${k}" data-report-field="${k}" rows="5" maxlength="16000">${esc(r.aluno[k] || "")}</textarea>` : branco ? '<div class="writing-space"></div>' : `<p class="student-text">${esc(r.aluno[k] || "Não preenchido.")}</p>`}</section>`;
      });
    content += `<section><h2>${ex ? "8. " : ""}Nota sobre o modelo</h2><p>Equilíbrio aquoso ideal. pKw varia com a temperatura; demais constantes e mobilidades usam referências a 25 °C. Amostras representativas têm composição parcial. CO₂ usa sistema fechado simplificado; bolhas são ilustrativas. Solubilidade modelada apenas quando há dados. Leituras instrumentais e cálculos estão identificados separadamente.</p></section></article>`;
    return content;
  }
  function render() {
    SIAB.$("relatorio-conteudo").innerHTML = html({ editar: true });
  }
  function abrir(id) {
    if (id) {
      atual = lerTodos()[id] || null;
      if (!atual) SIAB.notice("Relatório não encontrado neste navegador.");
    } else capturar();
    emBranco = false;
    SIAB.$("relatorio-atualizar").hidden = Boolean(
      id && id !== SIAB.state.reportId,
    );
    render();
  }
  function preparar() {
    if (!atual) capturar();
    SIAB.$("folha-impressao").innerHTML = html({ branco: emBranco });
    document.body.classList.add("imprimindo", "imprimindo-folha");
  }
  function imprimir(branco = false) {
    emBranco = branco;
    preparar();
    window.print();
  }
  function ligar() {
    const box = SIAB.$("relatorio-conteudo");
    box.addEventListener("input", (e) => {
      if (!atual) return;
      if (e.target.dataset.reportField)
        atual.aluno[e.target.dataset.reportField] = e.target.value;
      else if (e.target.name)
        atual.identificacao[e.target.name] = e.target.value;
      salvar();
    });
    SIAB.$("relatorio-print").onclick = () => imprimir();
    SIAB.$("relatorio-blank").onclick = () => imprimir(true);
    SIAB.$("relatorio-atualizar").onclick = () => {
      capturar();
      render();
      SIAB.notice("Dados experimentais atualizados.");
    };
    SIAB.$("relatorio-registrar").onclick = () => {
      salvar();
      const existe = SIAB.progresso.dados.caderno.find(
        (n) => n.relatorioId === atual.id,
      );
      if (!existe)
        SIAB.progresso.anotar({
          tipo: "experiencia",
          titulo: atual.roteiro?.titulo || "Experiência na bancada",
          relatorioId: atual.id,
          linhas: [["Relatório", "Disponível para reabrir"]],
        });
      SIAB.notice("Referência ao relatório registrada no Caderno.");
    };
    SIAB.$("relatorio-baixar").onclick = () => {
      salvar();
      SIAB.baixarArquivo(
        "SIAB-relatorio.html",
        `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Relatório SIAB</title><style>body{font:16px Georgia;max-width:900px;margin:35px auto;padding:20px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #bbb;padding:7px}svg{max-width:500px}img{display:none}.student-text{white-space:pre-wrap}@media print{button{display:none}section{break-inside:avoid}}</style>${html()}`,
        "text/html;charset=utf-8",
      );
    };
  }
  return {
    capturar,
    salvar,
    abrir,
    render,
    html,
    imprimir,
    preparar,
    ligar,
    get atual() {
      return atual;
    },
  };
})();
SIAB.telas.relatorio = {
  secao: "relatorio",
  titulo: () => "Relatório",
  entrar: (id) => SIAB.relatorios.abrir(id),
};
