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
    if (SIAB.ActivityContext.restricted()) return;
    const tipo = $("prof-tipo").value;
    $("prof-item").innerHTML = catalogo(tipo)
      .map((x) => `<option value="${x.id}">${esc(x.titulo)}</option>`)
      .join("");
    SIAB.refreshSelects?.();
    guia(true);
  }
  function guia(resetPermissions = false) {
    if (SIAB.ActivityContext.restricted()) return;
    const tipo = $("prof-tipo").value,
      r = catalogo(tipo).find((x) => x.id === $("prof-item").value);
    if (!r) return;
    const req = SIAB.ActivityContext.requirements({ tipo, item: r.id });
    const nomes = {
      "ph.measurement": "Medição de pH: fita ou pHmetro",
      observation: "Uma técnica de observação",
      "color.observation": "Indicador para comparar cores",
      "representation.particles": "Representação de partículas",
      "representation.equations": "Equações",
      "temperature.measurement": "Termômetro",
      "temperature.change": "Alteração de temperatura",
    };
    $("prof-requisitos").innerHTML =
      `<strong>Recursos necessários</strong><ul>${req.requiredCapabilities.map((id) => `<li>${esc(nomes[id] || id)}</li>`).join("")}</ul><p>Módulo: ${SIAB.MODULOS[r.modulo || r.bancada?.nivel || r.nivel || "explorar"].nome}. Recursos opcionais ficam a seu critério.</p>`;
    const temperatura = $("prof-form").querySelector(
      '[name="bench.changeTemperature"]',
    );
    if (temperatura && resetPermissions)
      temperatura.checked = tipo === "missao" && r.id === "temperatura";
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
    $("prof-guide-content").innerHTML =
      `<article id="teacher-guide"><h1>${esc(r.titulo)}</h1><h2>Objetivo pedagógico</h2><p>${esc(objetivos)}</p><h2>Conceitos</h2><p>Equilíbrio ácido-base, conservação de matéria e carga, evidências e limites do modelo.</p><h2>Preparação e montagem</h2><ul>${(r.tubos || r.bancada?.tubos || []).map((t) => `<li>${esc(SIAB.solutions[t.solution].name)} · ${SIAB.format(t.initialVolume || 1)} mL</li>`).join("")}</ul><h2>Desenvolvimento</h2><p>Solicite uma hipótese, acompanhe a técnica e discuta o que cada evidência permite concluir. Adapte a ordem ao problema.</p><h2>Interpretação esperada</h2>${respostas.map((x) => `<p>${esc(x)}</p>`).join("")}${previsoes(r)}<h2>Erros comuns</h2><p>${esc(p.erros || "Confundir força e concentração; usar cor como pH exato; assumir neutralidade sempre em 7.")}</p><h2>Questões para discussão</h2><p>${esc(p.discussao || "Compare previsões e dados, considerando resolução instrumental e aproximações.")}</p><h2>BNCC</h2><p>${esc((r.bncc || ["EM13CNT301", "EM13CNT302"]).join(" · "))}</p><h2>Observações</h2><p>Experimento virtual educacional. As orientações não constituem um procedimento de laboratório real.</p></article>`;
  }
  function previsoes(r) {
    const tubos = r.tubos || r.bancada?.tubos || [];
    if (!tubos.length) return "";
    const f = new FormData($("prof-form")),
      modo = f.get("temperaturaModo");
    const temperature =
      modo === "referencia"
        ? 25
        : modo === "local"
          ? SIAB.ambiente.bancada
          : Number(f.get("temperatura"));
    return `<h3>Referências iniciais do modelo a ${SIAB.format(temperature, 1)} °C</h3><p>Use como apoio à discussão. Mudanças de concentração, temperatura e composição exigem novo cálculo; a previsão não substitui a medição do aluno.</p><div class="table-scroll" tabindex="0" role="region" aria-label="Dados da investigação"><table><thead><tr><th>Solução</th><th>pH calculado</th><th>Caráter</th><th>Modelo</th></tr></thead><tbody>${tubos
      .map((spec) => {
        const t = {
            ...SIAB.TUBE_DEFAULTS,
            ...spec,
            temperature,
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
    if (SIAB.ActivityContext.restricted()) return;
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
    const permissions = SIAB.ActivityContext.permissions(c);
    const resources = Object.entries(SIAB.ActivityContext.resources).flatMap(
      ([group, values]) =>
        Object.entries(values)
          .filter(([key]) => permissions[group][key])
          .map(([, value]) => value.label),
    );
    $("prof-resumo").textContent =
      `${c.titulo} · ${c.tipo} · ${SIAB.MODULOS[c.modulo].nome} · ${SIAB.format(c.temperatura, 1)} °C · Relatório ${c.relatorio} · Navegação ${c.navegacao} · Recursos: ${resources.join(", ")}`;
    $("prof-abrir").href = SIAB.atividades.link(token);
  }
  async function criar(c) {
    if (SIAB.ActivityContext.restricted())
      throw new Error("Encerre a atividade antes de criar outra.");
    const token = await SIAB.atividades.codificar(c);
    const list = recentes();
    list.unshift({ token, config: c, criada: new Date().toISOString() });
    SIAB.persistencia.salvar("siab_atividades_criadas", list);
    resumo(SIAB.atividades.validar(c), token);
    renderRecentes();
  }
  function imprimir() {
    if (SIAB.ActivityContext.restricted()) return false;
    guia();
    SIAB.$("folha-impressao").innerHTML = $("teacher-guide").outerHTML;
    document.body.classList.add("imprimindo-roteiro", "imprimindo-folha");
    window.print();
    document.body.classList.remove("imprimindo-roteiro", "imprimindo-folha");
  }
  function ligar() {
    $("prof-tipo").onchange = opcoes;
    $("prof-item").onchange = () => guia(true);
    $("prof-copy").onclick = () => copiar(tokenAtual);
    $("prof-orientacoes").onclick = abrirGuia;
    $("prof-ver-guia").onclick = abrirGuia;
    $("prof-print").onclick = imprimir;
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
          schema: 2,
          tipo,
          item: r.id,
          titulo: f.get("titulo") || r.titulo,
          modulo: r.modulo || r.bancada?.nivel || r.nivel || "explorar",
          temperatura: temp,
          temperaturaModo: f.get("temperaturaModo"),
          instrumentos: f.getAll("instrumentos"),
          permissions: lerPermissoes(f),
          initialView: f.get("initialView") || null,
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
  const ajustes = {
    bench: {
      changeInitialSolution: "Solução inicial",
      changeTitrant: "Reagente do conta-gotas",
      changeGlassware: "Vidraria da bancada",
      changeInitialVolume: "Volume inicial",
      changeConcentration: "Concentrações",
      changeIndicator: "Indicador",
      changeTemperature: "Temperatura",
      changePreparation: "Diluição e volume da gota",
    },
    vessels: {
      add: "Adicionar recipiente",
      remove: "Remover recipiente",
      rename: "Renomear",
      changeContent: "Misturar conteúdos",
      changeGlassware: "Vidraria de recipientes",
      changeVolume: "Volume dos recipientes",
    },
  };
  function montarRecursos() {
    const targets = {
      measurements: "prof-instrumentos",
      representations: "prof-representacoes",
      analysis: "prof-analises",
    };
    for (const [group, resources] of Object.entries(
      SIAB.ActivityContext.resources,
    )) {
      $(targets[group]).insertAdjacentHTML(
        "beforeend",
        Object.entries(resources)
          .map(
            ([key, value]) =>
              `<label class="check-row"><input type="checkbox" name="${group === "measurements" ? "instrumentos" : group}" value="${group === "measurements" ? value.id : key}" checked>${value.label}</label>`,
          )
          .join(""),
      );
    }
    $("prof-permissoes").innerHTML = Object.entries(ajustes)
      .map(
        ([group, fields]) =>
          `<fieldset><legend>${group === "bench" ? "Preparo" : "Recipientes"}</legend>${Object.entries(
            fields,
          )
            .map(
              ([key, label]) =>
                `<label class="check-row"><input type="checkbox" name="${group}.${key}">${label}</label>`,
            )
            .join("")}</fieldset>`,
      )
      .join("");
    $("prof-initial-view").insertAdjacentHTML(
      "beforeend",
      SIAB.VER_SECTIONS.map(
        (g) =>
          `<optgroup label="${g.label}">${g.items.map((item) => `<option value="${item.id}">${item.label}</option>`).join("")}</optgroup>`,
      ).join(""),
    );
    function syncViews() {
      const p = lerPermissoes(new FormData($("prof-form"))),
        select = $("prof-initial-view");
      for (const item of SIAB.VER_SECTIONS.flatMap((g) => g.items)) {
        const available =
          (!item.permission ||
            item.permission.split(".").reduce((v, k) => v?.[k], p)) &&
          (item.capability !== "ph" ||
            p.measurements.phStrip ||
            p.measurements.phMeter ||
            (item.id === "ph" && p.measurements.indicator));
        const option = [...select.options].find((x) => x.value === item.id);
        option.disabled = !available;
      }
      if (select.selectedOptions[0]?.disabled) select.value = "";
      SIAB.refreshSelects?.();
    }
    $("prof-form").addEventListener("change", syncViews);
    syncViews();
    $("prof-form").elements.navegacao.addEventListener("change", (e) => {
      $("prof-permissoes")
        .querySelectorAll("input")
        .forEach((el) => {
          el.checked =
            e.target.value === "livre" ||
            (el.name === "bench.changeTemperature" &&
              $("prof-tipo").value === "missao" &&
              $("prof-item").value === "temperatura");
        });
    });
  }
  function lerPermissoes(f) {
    const p = {};
    for (const [group, resources] of Object.entries(
      SIAB.ActivityContext.resources,
    )) {
      const list = f.getAll(group === "measurements" ? "instrumentos" : group);
      p[group] = Object.fromEntries(
        Object.entries(resources).map(([key, v]) => [
          key,
          list.includes(group === "measurements" ? v.id : key),
        ]),
      );
    }
    for (const [group, fields] of Object.entries(ajustes))
      p[group] = Object.fromEntries(
        Object.keys(fields).map((key) => [key, f.has(`${group}.${key}`)]),
      );
    return p;
  }
  function abrirGuia() {
    if (SIAB.ActivityContext.restricted()) return;
    guia();
    $("teacher-guide-dialog").showModal();
  }
  return {
    ligar,
    montarRecursos,
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
