"use strict";
SIAB.segredo = (() => {
  const ARCO_IRIS = [
    { solution: "hcl", concentration: 0.1 },
    { solution: "hcl", concentration: 0.001 },
    { solution: "nh4cl", concentration: 0.1 },
    { solution: "water" },
    { solution: "ch3coona", concentration: 0.1 },
    { solution: "ammonia", concentration: 0.1 },
    { solution: "naoh", concentration: 0.1 },
  ];
  const palavraSecreta = (q) =>
    ["arcoiris", "rainbow"].includes(SIAB.normalizar(q).replace(/[^a-z]/g, ""));
  function arcoIris() {
    if (SIAB.atividades?.ativa) return;
    SIAB.usarBancada("lab");
    SIAB.alterar("arco-íris do pH", (s) => {
      s.tubes = [];
      delete s.experiencia;
      ARCO_IRIS.forEach((t, i) =>
        SIAB.newTube(
          {
            ...t,
            name: `Cor ${i + 1}`,
            indicator: "universal",
            titrant: "water",
          },
          s,
        ),
      );
      s.activeId = s.tubes[0].id;
      s.view = "overview";
    });
    SIAB.irPara("#/laboratorio");
    SIAB.notice(
      "Descoberta: Arco-íris do pH. Compare as cores e investigue com instrumentos.",
    );
    SIAB.progresso.anotar({
      tipo: "anotacao",
      titulo: "Descoberta · Arco-íris do pH",
      linhas: [
        [
          "Observação",
          "Soluções diferentes formam uma sequência de cores com indicador universal.",
        ],
      ],
    });
  }
  function ligar() {
    let n = 0,
      last = 0;
    document.querySelector(".header-brand").addEventListener("click", (e) => {
      const now = Date.now();
      n = now - last < 1500 ? n + 1 : 1;
      last = now;
      if (n === 7) {
        n = 0;
        e.preventDefault();
        arcoIris();
      }
    });
    SIAB.$("shelf").addEventListener("click", (e) => {
      if (e.target.closest("[data-segredo]")) arcoIris();
    });
  }
  return {
    ligar,
    arcoIris,
    ARCO_IRIS,
    palavraSecreta,
    frascoSecreto: (q) =>
      palavraSecreta(q)
        ? '<button class="bottle" data-segredo="arco-iris">Arco-íris do pH</button>'
        : "",
  };
})();
