"use strict";
SIAB.verGrupos = {
  observar: [
    ["particulas", "Partículas"],
    ["especies", "Espécies"],
    ["equacao", "Equações"],
    ["proton", "Transferência de próton"],
  ],
  medir: [
    ["ph", "pH"],
    ["temperatura", "Temperatura"],
    ["condutividade", "Condutividade"],
  ],
  analisar: [
    ["grafico", "Gráfico"],
    ["derivada", "ΔpH/ΔV"],
    ["distribuicao", "Distribuição de espécies"],
    ["historico", "Histórico"],
    ["tabela", "Tabela"],
  ],
};
SIAB.verPermissao = {
  particulas: "particulas",
  especies: "particulas",
  proton: "particulas",
  equacao: "equacoes",
  temperatura: "temperatura",
  condutividade: "condutividade",
  grafico: "graficos",
  derivada: "graficos",
  distribuicao: "graficos",
  historico: null,
  tabela: null,
};
SIAB.verDisponivel = (id) =>
  id === "ph"
    ? ["indicador", "fita", "phmetro"].some(SIAB.instrumentos.permitido)
    : !SIAB.verPermissao[id] ||
      SIAB.instrumentos.permitido(SIAB.verPermissao[id]);
SIAB.graficoMedido = (t, derivada = false) => {
  const ms = SIAB.instrumentos
    .dados(t)
    .leituras.filter((x) => x.tecnica === "phmetro");
  const points = ms
    .map((m) => ({ x: m.adicionado, y: m.valor }))
    .filter((m, i, a) => !i || m.x !== a[i - 1].x || m.y !== a[i - 1].y);
  let pts = points;
  if (derivada)
    pts = points
      .slice(1)
      .map((p, i) => ({ x: p.x, y: (p.y - points[i].y) / (p.x - points[i].x) }))
      .filter((p) => Number.isFinite(p.y));
  if (pts.length < 2)
    return "<p>Faça ao menos duas medições com o pHmetro em volumes distintos. O modo contínuo registra novas leituras após cada estabilização.</p>";
  const xmax = Math.max(0.05, ...pts.map((p) => p.x)),
    ymin = derivada ? Math.min(0, ...pts.map((p) => p.y)) : 0,
    ymax = derivada ? Math.max(1, ...pts.map((p) => p.y)) : 14;
  const x = (v) => 42 + (v / xmax) * 280,
    y = (v) => 170 - ((v - ymin) / (ymax - ymin)) * 145;
  return `<svg class="grafico-medido" viewBox="0 0 340 210" role="img" aria-label="${derivada ? "Derivada das leituras de pH por volume" : "Leituras medidas de pH por volume adicionado"}"><path d="M42 20V170H325" fill="none" stroke="currentColor"/><polyline fill="none" stroke="#b0479a" stroke-width="2.5" points="${pts.map((p) => `${x(p.x)},${y(p.y)}`).join(" ")}"/>${pts.map((p) => `<circle cx="${x(p.x)}" cy="${y(p.y)}" r="3" fill="#b0479a"/>`).join("")}<text x="45" y="195">0</text><text x="260" y="195">${SIAB.format(xmax)} mL</text><text x="2" y="30">${SIAB.format(ymax, 1)}</text><text x="2" y="173">${SIAB.format(ymin, 1)}</text></svg><p class="field-hint">${derivada ? "ΔpH/ΔV calculado entre medições sucessivas." : "Pontos do pHmetro; a linha conecta as medições."}</p>`;
};
SIAB.historicoTabela = (t) => ({
  colunas: ["Evento", "Adicionado (mL)", "pH medido", "Temperatura (°C)"],
  linhas: SIAB.instrumentos
    .dados(t)
    .eventos.map((x) => [
      x.acao,
      SIAB.format(x.adicionado),
      x.leitura
        ? `${x.leitura.tecnica === "fita" ? "≈ " : ""}${SIAB.format(x.leitura.valor, x.leitura.tecnica === "fita" ? 0 : 2)}`
        : "—",
      SIAB.format(x.temperatura, 1),
    ]),
});
SIAB.historicoHTML = (t) => {
  const tabela = SIAB.historicoTabela(t);
  return `<div class="ver-acoes"><button class="secondary-btn" data-acao="csv">Baixar tabela (CSV)</button><button class="secondary-btn" data-acao="registrar">Registrar no Caderno</button></div><div class="table-scroll"><table><caption>Sessão experimental · dados observados</caption><thead><tr>${tabela.colunas.map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>${tabela.linhas.map((l) => `<tr>${l.map((x) => `<td>${SIAB.escape(x)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
};
SIAB.historyCSV = (t) => {
  const tb = SIAB.historicoTabela(t);
  return [tb.colunas, ...tb.linhas]
    .map((l) => l.map(SIAB.csvCampo).join(";"))
    .join("\n");
};
SIAB.renderRegua = () => {
  SIAB.$("ver-regua").hidden = true;
};
SIAB.renderVer = () => {
  const $ = SIAB.$,
    s = SIAB.state,
    t = SIAB.current(),
    esc = SIAB.escape;
  let tab = s.verTab || "ph";
  const todos = Object.values(SIAB.verGrupos).flat();
  if (!todos.some(([id]) => id === tab) || !SIAB.verDisponivel(tab))
    tab = todos.find(([id]) => SIAB.verDisponivel(id))?.[0] || "historico";
  s.verTab = tab;
  const grupo = Object.keys(SIAB.verGrupos).find((g) =>
    SIAB.verGrupos[g].some(([id]) => id === tab),
  );
  $("ver-panel").hidden = false;
  $("workspace").classList.remove("sem-ver");
  $("ver-regua").hidden = true;
  $("ver-tabs").innerHTML = Object.entries(SIAB.verGrupos)
    .map(
      ([g, items]) =>
        `<div class="ver-familia"><span>${g.toUpperCase()}</span><div>${items
          .filter(([id]) => SIAB.verDisponivel(id))
          .map(
            ([id, label]) =>
              `<button type="button" role="tab" id="tab-${id}" data-ver="${id}" aria-selected="${id === tab}" tabindex="${id === tab ? 0 : -1}" aria-controls="ver-conteudo">${label}</button>`,
          )
          .join("")}</div></div>`,
    )
    .join("");
  $("ver-conteudo").setAttribute("aria-labelledby", `tab-${tab}`);
  if (!t) {
    $("ver-conteudo").innerHTML =
      "<p>Escolha uma solução e prepare um recipiente.</p>";
    return;
  }
  const r = SIAB.chem.solve(t),
    d = SIAB.instrumentos.dados(t),
    m = SIAB.instrumentos.leitura(t),
    permitido = SIAB.instrumentos.permitido;
  let html = "";
  if (tab === "ph") {
    html = `<p class="instrument-reading" aria-live="polite">${esc(m.texto)}</p>`;
    if (permitido("indicador"))
      html += `<section class="instrument-section"><h3>Indicador</h3><p>${esc(SIAB.instrumentos.indicador(t))}</p></section>`;
    if (permitido("fita"))
      html += `<section class="instrument-section"><h3>Fita de pH</h3><p>Toque para mergulhar a fita no recipiente em foco. Compare a cor com a escala.</p><button class="secondary-btn" data-instrumento="fita">Mergulhar fita em ${esc(t.name)}</button>${d.ph?.tecnica === "fita" ? `<div class="ph-strip" style="--strip-color:rgb(${SIAB.chem.color("universal", d.ph.valor).rgb.join(",")})"><span></span><strong>≈ ${d.ph.valor}</strong></div><div class="strip-scale">${Array.from({ length: 15 }, (_, p) => `<span style="background:rgb(${SIAB.chem.color("universal", p).rgb.join(",")})">${p}</span>`).join("")}</div><p class="field-hint">Resolução didática: 1 unidade; escala 0–14. ${d.ph.valor === 0 || d.ph.valor === 14 ? "Leitura no extremo da escala." : ""}</p>` : ""}</section>`;
    if (permitido("phmetro"))
      html += `<section class="instrument-section"><h3>pHmetro</h3><svg class="ph-meter" viewBox="0 0 260 105" role="img" aria-label="pHmetro com display, cabo e eletrodo"><rect x="6" y="8" width="142" height="90" rx="13"/><rect x="17" y="20" width="120" height="42" class="display"/><text x="30" y="46">${d.status === "estabilizando" ? "···" : d.ph?.tecnica === "phmetro" ? SIAB.format(d.ph.valor) : "—"}</text><path d="M147 30Q220 0 220 60"/><rect x="212" y="60" width="16" height="35" rx="5"/><text x="20" y="85">${SIAB.format(r.temperature, 1)} °C</text></svg><p aria-live="polite">${d.status === "estabilizando" ? "Estabilizando…" : d.ph?.tecnica === "phmetro" ? (m.anterior ? "Leitura anterior · medir novamente" : "Leitura estável") : "Eletrodo disponível"} · resolução 0,01</p><div class="ver-acoes"><button class="secondary-btn" data-instrumento="phmetro" data-modo="pontual">Medir uma vez</button><button class="secondary-btn" data-instrumento="phmetro" data-modo="continuo">Medição contínua</button>${d.modo === "continuo" ? '<button class="quiet-btn" data-instrumento="parar">Retirar eletrodo</button>' : ""}</div><p class="field-hint">Calibração: ${esc(d.calibracao)}. Sem ruído aleatório.</p><button class="quiet-btn" data-instrumento="calibrar">Calibrar com padrões 4,00 e 7,00</button></section>`;
  }
  if (tab === "temperatura")
    html = `<h3>Temperatura</h3><dl class="eq-numeros"><div><dt>Externa</dt><dd>${SIAB.ambiente.externa === null ? "Não consultada" : SIAB.format(SIAB.ambiente.externa, 1) + " °C"}</dd></div><div><dt>Ambiente da bancada</dt><dd>${SIAB.format(SIAB.ambiente.bancada, 1)} °C</dd></div><div><dt>Solução</dt><dd>${SIAB.format(r.temperature, 1)} °C</dd></div></dl><p>Neutralidade do modelo: pH = pKw(T)/2 = ${SIAB.format(r.neutralPH)}.</p>${SIAB.atividades?.ativa ? "<p>Temperatura definida pela atividade.</p>" : `<form id="temperatura-form"><label class="field">Temperatura da solução (°C)<input name="temperatura" type="number" min="0" max="100" step="0.1" value="${r.temperature}" required></label><button class="secondary-btn">Aplicar à solução</button></form><div class="ver-acoes"><button class="quiet-btn" data-temp-ref="25">Referência 25 °C</button><button class="quiet-btn" data-temp-ref="${SIAB.ambiente.bancada}">Usar ambiente da bancada</button></div><form id="temperatura-local"><label class="field">Cidade para referência meteorológica<input name="cidade" maxlength="80" autocomplete="off" required></label><button class="secondary-btn">Usar temperatura local</button></form><p class="field-hint">Consulta opcional por cidade. Sem geolocalização precisa e sem salvar coordenadas. Offline: 25 °C ou valor manual.</p>`}<p class="field-hint">Ka, Kb, pKIn, Kps e mobilidades usam referências a 25 °C; não há correção térmica empírica adicionada.</p>`;
  if (tab === "condutividade")
    html = `<h3>Condutivímetro</h3><button class="secondary-btn" data-instrumento="condutividade">Medir condutividade</button>${d.condutividade ? `<p class="instrument-reading">${SIAB.format(d.condutividade.valor)} µS/cm</p><p>${d.condutividade.signature === r.signature ? "Estável" : "Leitura anterior"} · solução ${SIAB.format(d.condutividade.temperatura, 1)} °C</p>` : ""}<p class="field-hint">Estimativa ideal com mobilidades a 25 °C, sem correção térmica. Íons transportam a carga.</p>${s.level === "calcular" ? "<details><summary>Contribuições calculadas pelo modelo</summary>" + SIAB.condutimetro.html(t, { nivel: s.level, result: r }) + "</details>" : ""}`;
  if (tab === "particulas")
    html =
      '<p class="field-hint">Representação proporcional simplificada. Moléculas pouco abundantes podem usar escala ampliada/logarítmica. Valores internos do modelo.</p>' +
      SIAB.lupa.html(t, { nivel: s.level, result: r });
  if (tab === "especies")
    html = `<p>${esc(r.quality)} · ${esc(r.modelNote)}</p><div class="table-scroll"><table><thead><tr><th>Espécie</th><th>Concentração do modelo</th><th>Carga</th></tr></thead><tbody>${r.species.map((e) => `<tr class="${s.destaque === e.formula ? "species-selected" : ""}"><td><button data-species="${esc(e.formula)}">${esc(e.formula)}</button></td><td>${SIAB.cientifico(e.conc)} mol/L</td><td>${e.charge}</td></tr>`).join("")}</tbody></table></div>`;
  if (tab === "equacao")
    html =
      '<p class="field-hint">Representação simbólica do modelo; não equivale a uma leitura instrumental.</p>' +
      SIAB.equacao.html(t, { nivel: s.level, result: r });
  if (tab === "proton")
    html = `<h3>Transferência de próton</h3><p>Ácido doa H⁺; base recebe H⁺. As espécies resultantes são os pares conjugados.</p>${r.conjugatePairs.length ? r.conjugatePairs.map((p) => `<div class="proton-pair"><button data-species="${esc(p.acid)}">${esc(p.acid)} · ácido</button><span>⇌ H⁺ +</span><button data-species="${esc(p.base)}">${esc(p.base)} · base conjugada</button></div>`).join("") : `<p>${esc(SIAB.solutions[t.solution].ionization || "H₃O⁺ + OH⁻ → 2 H₂O")}</p>`}<p class="field-hint">H⁺ é uma notação simplificada do próton solvatado. Em água, represente H₃O⁺ nas equações de transferência.</p>`;
  if (tab === "grafico" || tab === "derivada")
    html = SIAB.graficoMedido(t, tab === "derivada");
  if (tab === "distribuicao")
    html = `<p class="field-hint">Distribuição calculada pelo mesmo equilíbrio das partículas.</p>${SIAB.grafico.distribuicao(t, r) || "<p>Nenhuma família fraca no sistema atual.</p>"}${r.systems.map((x) => `<div>${x.nomes.map((n, i) => `<button class="${s.destaque === n ? "species-selected" : ""}" data-species="${esc(n)}">${esc(n)}: ${SIAB.format(x.fractions[i] * 100, 1)}%</button>`).join(" ")}</div>`).join("")}`;
  if (tab === "historico" || tab === "tabela") html = SIAB.historicoHTML(t);
  if (
    s.destaque &&
    ["particulas", "equacao", "distribuicao", "proton", "especies"].includes(
      tab,
    )
  )
    html =
      `<p class="species-bridge">Espécie em destaque: <strong>${esc(s.destaque)}</strong> · mesma seleção nas partículas, equações, distribuição e pares conjugados.</p>` +
      html;
  $("ver-conteudo").innerHTML = html;
  if (tab === "particulas") SIAB.lupa.equilibrio($("ver-conteudo"));
  if (tab === "equacao") SIAB.equacao.setas($("ver-conteudo"));
};
SIAB.ligarVer = () => {
  const pane = SIAB.$("ver-panel");
  pane.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const t = SIAB.current();
    if (b.dataset.ver) {
      if (!SIAB.verDisponivel(b.dataset.ver)) return;
      e.stopPropagation();
      SIAB.state.verTab = b.dataset.ver;
      SIAB.renderVer();
      SIAB.$(`tab-${b.dataset.ver}`)?.focus();
    }
    if (b.dataset.species) {
      SIAB.state.destaque = b.dataset.species;
      SIAB.renderVer();
    }
    if (!t) return;
    if (b.dataset.instrumento) {
      const a = b.dataset.instrumento;
      if (a === "parar") SIAB.instrumentos.parar(t);
      else if (a === "calibrar") {
        SIAB.instrumentos.dados(t).calibracao =
          "Dois pontos simulados: pH 4,00 e 7,00 a 25 °C";
        SIAB.instrumentos.evento(t, "Calibração de dois pontos");
      } else if (a === "condutividade") {
        if (!SIAB.instrumentos.permitido(a)) return;
        const r = SIAB.chem.solve(t);
        SIAB.instrumentos.dados(t).condutividade = {
          valor: r.conductivity.kappa,
          signature: r.signature,
          temperatura: r.temperature,
        };
        SIAB.instrumentos.evento(t, "Condutividade medida");
      } else SIAB.instrumentos.medir(t, a, b.dataset.modo);
      SIAB.renderVer();
    }
    if (b.dataset.tempRef && !SIAB.atividades?.ativa)
      SIAB.alterar("temperatura", () => {
        t.temperature = Number(b.dataset.tempRef);
      });
  });
  pane.addEventListener("submit", (e) => {
    if (e.target.id === "temperatura-form") {
      e.preventDefault();
      const v = Number(new FormData(e.target).get("temperatura"));
      if (!SIAB.atividades?.ativa && Number.isFinite(v) && v >= 0 && v <= 100)
        SIAB.alterar("temperatura", () => {
          SIAB.current().temperature = v;
        });
    }
    if (e.target.id === "temperatura-local") {
      e.preventDefault();
      SIAB.temperaturaLocal(new FormData(e.target).get("cidade"));
    }
  });
};

SIAB.tabelaCSV = (tabela) =>
  [tabela.colunas, ...tabela.linhas]
    .map((l) => l.map(SIAB.csvCampo).join(";"))
    .join("\n");
