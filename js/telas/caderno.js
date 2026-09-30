"use strict";
/* Caderno de laboratório (M14): previsões, missões, leituras e desafios.
   Uma nota tem campos (linhas) e, nas leituras, a tabela de gotas. */

// CSV do caderno: uma linha por campo. As linhas da tabela de gotas usam as
// colunas próprias (gota, volume, pH, cor) para a planilha manter a tabela.
SIAB.cadernoCSV = () => {
  const linhas = [
    "data;tipo;titulo;campo;valor;gota;volume_adicionado_mL;pH;cor",
  ];
  SIAB.progresso.dados.caderno.forEach((nota) => {
    const inicio = [SIAB.dataHora(new Date(nota.data)), nota.tipo, nota.titulo];
    (nota.linhas || []).forEach(([campo, valor]) => {
      linhas.push(
        [...inicio, campo, valor, "", "", "", ""].map(SIAB.csvCampo).join(";"),
      );
    });
    (nota.tabela?.linhas || []).forEach((linha) => {
      linhas.push(
        [...inicio, "Tabela de gotas", "", ...linha]
          .map(SIAB.csvCampo)
          .join(";"),
      );
    });
  });
  return linhas.join("\n");
};

// Tabela de gotas de uma nota, com rolagem própria (a página não rola de lado).
SIAB.notaTabelaHTML = (nota) => {
  const t = nota.tabela;
  if (!t?.linhas?.length) return "";
  const nome = `Tabela de gotas: ${nota.titulo}`;
  return `<div class="nota-tabela" role="region" tabindex="0" aria-label="${SIAB.escape(nome)}">
    <table><caption>Tabela de gotas <span>${t.linhas.length} ${t.linhas.length === 1 ? "linha" : "linhas"}${t.compacta ? ` · ${t.gotas} gotas` : ""}</span></caption>
      <thead><tr>${t.colunas.map((c) => `<th scope="col">${SIAB.escape(c)}</th>`).join("")}</tr></thead>
      <tbody>${t.linhas.map((l) => `<tr>${l.map((v) => `<td>${SIAB.escape(v)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  </div>
  ${t.compacta ? `<p class="nota-compacta">${SIAB.escape(SIAB.notaCompacta(t))}</p>` : ""}
  <button type="button" class="quiet-btn" data-baixar-tabela="${nota.id}">Baixar esta tabela (CSV)</button>`;
};

let filtroCaderno = "todos";
SIAB.telas.caderno = {
  secao: "caderno",
  titulo: () => "Caderno",
  entrar() {
    const all = SIAB.progresso.dados.caderno,
      notas = all.filter(
        (n) => filtroCaderno === "todos" || n.tipo === filtroCaderno,
      ),
      esc = SIAB.escape;
    const tipos = {
      experiencia: "Experiência",
      missao: "Missão",
      exploracao: "Exploração livre",
      anotacao: "Anotação",
    };
    SIAB.$("caderno-lista").innerHTML = notas.length
      ? notas
          .map(
            (n) =>
              `<article class="nota timeline-entry"><header><p class="eyebrow">${tipos[n.tipo] || "Registro preservado"} · ${SIAB.dataHora(new Date(n.data))}</p><h2>${esc(n.titulo)}</h2></header><dl>${(n.linhas || []).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>${n.relatorioId ? `<a class="secondary-btn" href="#/relatorio/${encodeURIComponent(n.relatorioId)}">Abrir relatório</a>` : SIAB.notaTabelaHTML(n)}<button class="quiet-btn" data-apagar-nota="${esc(n.id)}">Apagar nota</button></article>`,
          )
          .join("")
      : "<p>Nenhum registro neste filtro. Registre uma exploração na bancada ou escreva uma anotação.</p>";
  },
  ligar() {
    SIAB.$("caderno-filtro").onchange = (e) => {
      filtroCaderno = e.target.value;
      SIAB.telas.caderno.entrar();
    };
    SIAB.$("caderno-anotacao").onsubmit = (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      SIAB.progresso.anotar({
        tipo: "anotacao",
        titulo: f.get("titulo"),
        linhas: [["Anotação / hipótese / descoberta", f.get("texto")]],
      });
      e.target.reset();
      SIAB.telas.caderno.entrar();
    };
    SIAB.$("caderno-csv").onclick = () =>
      SIAB.baixarArquivo("SIAB-caderno.csv", SIAB.cadernoCSV());
    SIAB.$("caderno-imprimir").onclick = () => window.print();
    SIAB.$("caderno-limpar").onclick = () =>
      SIAB.confirmar(
        "Apagar Caderno?",
        "Exporte o Caderno para preservar uma cópia antes de apagar.",
        () => {
          SIAB.progresso.limparCaderno();
          SIAB.telas.caderno.entrar();
        },
        "Apagar",
      );
    SIAB.$("caderno-lista").onclick = (e) => {
      const b = e.target.closest("[data-apagar-nota]");
      if (b) {
        SIAB.progresso.removerNota(b.dataset.apagarNota);
        SIAB.telas.caderno.entrar();
      }
      const t = e.target.closest("[data-baixar-tabela]");
      if (t) {
        const n = SIAB.progresso.dados.caderno.find(
          (x) => x.id === t.dataset.baixarTabela,
        );
        if (n?.tabela)
          SIAB.baixarArquivo("SIAB-tabela.csv", SIAB.tabelaCSV(n.tabela));
      }
    };
  },
};
