# SIAB — A química das cores

**Versão entregue: 1.0.0-rc.1.** Evolução integrada da base 0.8.2 recebida. Candidata à homologação; não é uma declaração de validação em Safari/iOS, Android ou em todos os navegadores comerciais.

O SIAB é um simulador educacional de ácidos e bases. A interface organiza a investigação: observar, medir, interpretar, registrar e explicar. Preserva a marca, a abertura e os três módulos independentes **Explorar**, **Medir** e **Calcular**.

## Abrir

- Sem instalação: abra `SIAB-standalone.html` no navegador. O arquivo reúne código, estilos e imagens essenciais e funciona sem internet.
- Projeto modular: na pasta deste README, execute `python3 -m http.server 8080` e visite `http://localhost:8080`.
- PWA: sirva esta mesma pasta por HTTPS ou localhost, abra uma vez conectado e aguarde o cache. Instalação na tela inicial depende do navegador. Não há PWA via `file://`.

Não é necessário Node, Python ou acesso à internet para usar o HTML único. Python é uma opção para servir a versão modular. Dados ficam no navegador; exporte relatórios e Caderno antes de limpar o armazenamento.

## O que mudou

- Estado químico central, com equilíbrio, espécies, frações, sólidos, indicadores e condutividade coerentes. Mistura conserva quantidades de matéria e volumes.
- A bancada inicia com **pH não medido**. Indicador, fita e pHmetro têm comportamentos distintos. O eletrodo estabiliza; medidas pontuais ficam marcadas como anteriores após alterações; o modo contínuo registra novas leituras.
- VER organizado em Observar, Medir e Analisar. Gráficos de medição usam leituras realizadas; valores internos em representações são identificados como modelo.
- Temperatura manual e consulta opcional por cidade; neutralidade por pKw(T)/2. Falha da consulta retorna referência de 25 °C.
- 14 Temas, 19 Missões, 10 Montagens prontas e 35 Roteiros Experimentais. As 140 substâncias aparecem na coleção de roteiros. Conclusão simples, sem pontos, ranking ou sequência obrigatória.
- Seleção temporária para comparar, vincular, misturar, registrar e remover. Vínculos sincronizam gotas e conservam os conteúdos anteriores.
- Caderno com anotações, explorações voluntárias, sínteses de missões e referências a relatórios.
- Relatórios digital e impresso gerados do mesmo conteúdo, com campos do aluno editáveis e dados experimentais protegidos.
- Professor configura atividades por link opaco: contexto, instrumentos, temperatura, identificação, navegação e relatório. Respostas de referência ficam na área do professor.
- Modo restrito verifica rotas, módulo e instrumentos; conserva contexto após recarga e reabertura do link. Encerrar recupera a bancada livre.

## Organização

| Pasta/arquivo | Função |
|---|---|
| `index.html`, `css/`, `assets/` | Entrada modular, interface e identidade visual |
| `js/core/` | Estado, armazenamento, migração, rotas e atividades |
| `js/data/` | Catálogos, Temas, Missões, Montagens, Roteiros e Manual |
| `js/simulation/` | Equilíbrio químico, condutividade, instrumentos e missões |
| `js/ui/`, `js/telas/` | Representações, interações, navegação e relatórios |
| `sw.js`, `manifest.webmanifest` | Cache offline e configuração PWA |
| `build_standalone.py` | Geração reproduzível do HTML único |
| `tests/` | Ciência, migração, fluxos, regressão, acessibilidade e layout |
| `tests/results/` | Resultados reais, capturas e amostras de impressão |
| `docs/` | Manual, migração, modelo, limites e acompanhamento do prompt |

## Reproduzir os testes

Node.js 20 ou posterior, Python 3 para gerar o HTML único e OpenSSL para o teste HTTPS local. As dependências são somente de desenvolvimento; o aplicativo não usa Playwright nem axe em produção.

```sh
npm install
npx playwright install --with-deps chromium firefox webkit
npm run build
npm test
npm run test:layout
```

Em ambiente Linux que não permita o sandbox de conteúdo do Firefox, o executor de testes usa `MOZ_DISABLE_CONTENT_SANDBOX=1`. O Chromium de testes usa `--no-sandbox`; essas opções pertencem ao processo automatizado, não ao aplicativo distribuído.

Os testes iniciam seu próprio servidor HTTP. `SIAB_TEST_ENGINES=chromium` limita a execução; `SIAB_PLAYWRIGHT_MODULE` e `SIAB_AXE_MODULE` permitem indicar dependências já instaladas. A suíte grava os JSON em `tests/results`. As PDFs são amostras com identificação fictícia.

## Versões e validação

Consulte [CHANGELOG.md](CHANGELOG.md), [COMPATIBILIDADE.md](COMPATIBILIDADE.md) e [docs/IMPLEMENTACAO.md](docs/IMPLEMENTACAO.md). As revisões históricas são entradas lógicas desta integração; não são tags ou releases publicados. O arquivo original não contém histórico Git completo.

A validação automatizada usa Chromium 141.0.7390.37, Firefox/Gecko 142.0.1 e WebKit 26.0, nas distribuições de teste do Playwright 1.56.1 para Linux. Esses resultados não homologam automaticamente Chrome, Edge, Safari ou Samsung Internet, nem suas versões atuais e anteriores.

## Privacidade e licenças

Sem conta, servidor de dados ou analytics. Caderno, relatórios, atividades e preferências são locais. A consulta meteorológica contata Open-Meteo somente quando solicitada. VLibras é opcional e depende de conexão.

O token contém a configuração da atividade. A chave que permite abri-lo acompanha o token; a opacidade evita parâmetros legíveis, mas **não é sigilo contra quem recebe o link**. A restrição é pedagógica no cliente, não uma plataforma de provas com autenticação. Não coloque informações sigilosas na configuração.

Licença do projeto: [GNU GPL v3](LICENSE). `dialog-polyfill` 0.5.6: BSD-3-Clause, aviso em `vendor/dialog-polyfill/LICENSE`. A versão dessa dependência não é uma versão histórica do SIAB. As referências científicas originais permanecem em Sobre o SIAB e em [docs/MODELO-CIENTIFICO.md](docs/MODELO-CIENTIFICO.md).
