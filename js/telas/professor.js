"use strict";
SIAB.professor = (() => {
  const $ = SIAB.$,
    esc = SIAB.escape;
  let tokenAtual = null,
    configAtual = null;
  const recentes = () => SIAB.persistencia.ler("siab_atividades_criadas", []);
  function catalogo(tipo) {
    return tipo === "roteiro"
      ? SIAB.experimentos
      : tipo === "missao"
        ? SIAB.missoes
        : SIAB.montagens;
  }
  function opcoes() {
    const tipo = $("prof-tipo").value;
    $("prof-item").innerHTML = catalogo(tipo)
      .map((x) => `<option value="${x.id}">${esc(x.titulo)}</option>`)
      .join("");
    SIAB.refreshSelects?.();
    guia();
  }
  function guia() {
    const tipo = $("prof-tipo").value,
      r = catalogo(tipo).find((x) => x.id === $("prof-item").value);
    if (!r) return;
    const p = r.professor || {};
    const objetivos = p.objetivo || r.resumo || r.objetivo;
    const respostas =
      tipo === "missao"
        ? r.passos
            .filter((x) => x.modelo || x.explicacao)
            .map((x) => x.modelo || x.explicacao)
        : [
            "Interprete os resultados produzidos pelo motor nas condições configuradas; não use valores fixos fora dessas condições.",
          ];
    $("prof-guia").innerHTML =
      `<h2>Orientações do Professor</h2><p>Estas orientações permanecem nesta área e não integram o link do aluno.</p><article id="teacher-guide"><h1>${esc(r.titulo)}</h1><h2>Objetivo pedagógico</h2><p>${esc(objetivos)}</p><h2>Conceitos</h2><p>Equilíbrio ácido-base, conservação de matéria e carga, evidências e limites do modelo.</p><h2>Preparação e montagem</h2><ul>${(r.tubos || r.bancada?.tubos || []).map((t) => `<li>${esc(SIAB.solutions[t.solution].name)} · ${SIAB.format(t.initialVolume || 1)} mL</li>`).join("")}</ul><h2>Desenvolvimento</h2><p>Solicite uma hipótese, acompanhe a técnica e discuta o que cada evidência permite concluir. Adapte a ordem ao problema.</p><h2>Resultados possíveis e respostas de referência</h2>${respostas.map((x) => `<p>${esc(x)}</p>`).join("")}${previsoes(r)}<h2>Erros comuns</h2><p>${esc(p.erros || "Confundir força e concentração; usar cor como pH exato; assumir neutralidade sempre em 7.")}</p><h2>Discussão</h2><p>${esc(p.discussao || "Compare previsões e dados, considerando resolução instrumental e aproximações.")}</p><h2>BNCC</h2><p>${esc((r.bncc || ["EM13CNT301", "EM13CNT302"]).join(" · "))}</p><h2>Observações</h2><p>Experimento virtual educacional. As orientações não constituem um procedimento de laboratório real.</p></article><button class="secondary-btn" id="prof-print">Imprimir Guia do Professor</button>`;
    $("prof-print").onclick = imprimir;
  }
  function previsoes(r) {
    const tubos = r.tubos || r.bancada?.tubos || [];
    if (!tubos.length) return "";
    return `<h3>Referências iniciais do modelo a 25 °C</h3><p>Use como apoio à discussão. Mudanças de concentração, temperatura e composição exigem novo cálculo; a previsão não substitui a medição do aluno.</p><div class="table-scroll"><table><thead><tr><th>Solução</th><th>pH calculado</th><th>Caráter</th><th>Modelo</th></tr></thead><tbody>${tubos
      .map((spec) => {
        const t = {
            ...SIAB.TUBE_DEFAULTS,
            ...spec,
            temperature: 25,
            additions: [],
          },
          v = SIAB.chem.solve(t);
        return `<tr><td>${esc(SIAB.solutions[t.solution].name)}</td><td>${SIAB.format(v.pH)}</td><td>${esc(v.phase)}</td><td>${esc(v.quality)}</td></tr>`;
      })
      .join(
        "",
      )}</tbody></table></div><p>Em titulações, discuta a diferença entre equivalência e viragem. Nos tampões, compare a mudança por quantidade adicionada. Em sais e suspensões, conecte os dados às espécies e ao sólido previstos.</p>`;
  }
  function renderRecentes() {
    $("atividades-recentes").innerHTML =
      recentes()
        .map(
          (r, i) =>
            `<article class="recent-activity"><strong>${esc(r.config.titulo)}</strong><div class="actions"><a class="secondary-btn" href="${esc(SIAB.atividades.link(r.token))}">Abrir</a><button class="quiet-btn" data-copy-activity="${i}">Copiar link</button><button class="quiet-btn" data-duplicate-activity="${i}">Duplicar</button></div></article>`,
        )
        .join("") || "<p>Nenhuma atividade criada neste navegador.</p>";
  }
  async function copiar(token) {
    const link = SIAB.atividades.link(token);
    try {
      await navigator.clipboard.writeText(link);
      SIAB.notice("Link copiado.");
    } catch (_) {
      $("prof-link").value = link;
      $("prof-link").focus();
      $("prof-link").select();
      SIAB.notice("Selecione e copie o link exibido.");
    }
  }
  function resumo(c, token) {
    tokenAtual = token;
    configAtual = c;
    $("prof-resultado").hidden = false;
    $("prof-link").value = SIAB.atividades.link(token);
    $("prof-resumo").textContent =
      `${c.titulo} · ${c.tipo} · ${SIAB.MODULOS[c.modulo].nome} · ${SIAB.format(c.temperatura, 1)} °C · Relatório ${c.relatorio} · Navegação ${c.navegacao} · Instrumentos: ${c.instrumentos.join(", ")}`;
    $("prof-abrir").href = SIAB.atividades.link(token);
  }
  async function criar(c) {
    const token = await SIAB.atividades.codificar(c);
    const list = recentes();
    list.unshift({ token, config: c, criada: new Date().toISOString() });
    SIAB.persistencia.salvar("siab_atividades_criadas", list);
    resumo(c, token);
    renderRecentes();
  }
  function imprimir() {
    SIAB.$("folha-impressao").innerHTML = $("teacher-guide").outerHTML;
    document.body.classList.add("imprimindo-roteiro", "imprimindo-folha");
    window.print();
    document.body.classList.remove("imprimindo-roteiro", "imprimindo-folha");
  }
  function ligar() {
    $("prof-tipo").onchange = opcoes;
    $("prof-item").onchange = guia;
    $("prof-copy").onclick = () => copiar(tokenAtual);
    $("prof-orientacoes").onclick = imprimir;
    $("prof-form").onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(e.target),
        tipo = f.get("tipo"),
        r = catalogo(tipo).find((x) => x.id === f.get("item"));
      $("prof-erro").textContent = "";
      try {
        let temp = Number(f.get("temperatura"));
        if (f.get("temperaturaModo") === "referencia") temp = 25;
        if (f.get("temperaturaModo") === "local") {
          await SIAB.temperaturaLocal(f.get("cidade"));
          temp = SIAB.ambiente.bancada;
        }
        const c = {
          schema: 1,
          tipo,
          item: r.id,
          titulo: f.get("titulo") || r.titulo,
          modulo: r.modulo || r.bancada?.nivel || r.nivel || "explorar",
          temperatura: temp,
          temperaturaModo: f.get("temperaturaModo"),
          instrumentos: f.getAll("instrumentos"),
          navegacao: f.get("navegacao"),
          relatorio: f.get("relatorio"),
          identificacao: Object.fromEntries(
            ["nome", "turma", "data", "professor", "grupo"].map((k) => [
              k,
              f.get(k) || "",
            ]),
          ),
        };
        await criar(c);
      } catch (err) {
        $("prof-erro").textContent = err.message;
      }
    };
    $("projetor-check").onchange = (e) => {
      document.body.classList.toggle("projetor", e.target.checked);
      document.documentElement.dataset.projetor = e.target.checked
        ? "on"
        : "off";
    };
    $("atividades-recentes").onclick = async (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const copy = b.dataset.copyActivity,
        dup = b.dataset.duplicateActivity;
      const old = recentes()[Number(copy ?? dup)];
      if (!old) return;
      if (copy !== undefined) await copiar(old.token);
      else
        try {
          await criar({
            ...old.config,
            titulo: old.config.titulo + " (cópia)",
          });
        } catch (err) {
          $("prof-erro").textContent = err.message;
        }
    };
  }
  return {
    ligar,
    render() {
      opcoes();
      renderRecentes();
    },
    imprimir,
  };
})();
SIAB.telas.professor = {
  secao: "professor",
  titulo: () => "Área do Professor",
  entrar: () => SIAB.professor.render(),
};
