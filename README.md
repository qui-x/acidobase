# SIAB — A química das cores

**1.0.0-rc.5 · APTO PARA HOMOLOGAÇÃO FINAL.** Candidata construída sobre a RC.4.5. A aprovação visual dos ícones e as verificações em aparelhos/leitores de tela reais continuam pendentes. Não houve promoção para 1.0.0.

O SIAB é um simulador educacional de ácidos e bases, com 140 substâncias e três módulos independentes: Explorar, Medir e Calcular. A rodada preserva o núcleo científico, a marca, a abertura, o ActivityContext e a arquitetura de docas e painéis mobile.

## Abrir o programa

- **Arquivo único:** abra `SIAB-standalone.html`. Não requer instalação nem internet para o núcleo do programa.
- **Projeto modular:** nesta pasta, execute `python3 -m http.server 8080` e abra `http://localhost:8080`.
- **PWA:** sirva esta pasta em HTTPS ou localhost. Abra conectado uma vez e aguarde a preparação do cache. A instalação depende do navegador; não funciona por `file://`.

Os dados ficam no navegador. Trocar domínio, perfil ou aparelho não transfere o Caderno. Exporte os registros e imprima/salve os relatórios antes de limpar o armazenamento.

## Mudanças desta rodada

- **Finalizar atividade** consolida os dados, marca a sessão como finalizada e abre diretamente o relatório.
- **Encerrar atividade** oferece continuar, consultar o relatório antes de sair ou encerrar quando há dados. Registra a prática no Caderno e retorna sempre ao Início, preservando a preferência de inicialização. Uma sessão sem dados não gera prática vazia.
- A reabertura do mesmo link permite continuar a sessão ou iniciar outra. Uma sessão finalizada oferece relatório anterior ou nova tentativa. Novas tentativas têm identidade própria e preservam os relatórios anteriores.
- O Caderno distingue **Prática realizada** de notas pessoais e abre os dados e o relatório. Atualizações da mesma sessão não duplicam a prática.
- O Professor deixa de oferecer a escolha digital/impresso. Links antigos continuam aceitos. O relatório oferece **Imprimir / Salvar como PDF**; o download HTML do relatório saiu da interface.
- Biblioteca SVG compartilhada com 22 identidades de área e nova família de setas. Manual, tour, navegação e Sobre usam a terminologia atual.
- Tratamento de falha do VLibras e remoção de CSS sem consumidores; migrações e aliases históricos preservados.

As normalizações mobile aprovadas foram revalidadas: Desfazer 44 px, Doses 76 px e Gotejar flexível; Agitar/Medir pH com mesmas dimensões; alvos principais de 44 px, ações de linha inteira de 48 px. Não foi reconstruída a arquitetura mobile.

## Documentos e evidências

- [Guia de uso](LEIA-ME.md), [Manual](docs/MANUAL.md) e [modelo científico](docs/MODELO-CIENTIFICO.md).
- [Validação e quantidades](VALIDACAO.md), [compatibilidade](COMPATIBILIDADE.md) e [limitações](docs/LIMITACOES.md).
- [145 seções do prompt](docs/COBERTURA-RC5.md), [implementação](docs/IMPLEMENTACAO.md) e [mudanças RC.5](docs/RC5.md).
- [Galeria de evidências](docs/EVIDENCIAS-RC5.html) e [inventário visual de ícones](docs/ICONOGRAFIA-RC5.html).
- [Dependências](docs/DEPENDENCIAS-RC5.md), [auditoria offline](docs/OFFLINE-RC5.md), [acessibilidade](docs/ACESSIBILIDADE-RC5.md) e [preservação por SHA-256](docs/PRESERVACAO-RC5.json).

`docs/historico/` conserva documentação das versões anteriores, identificada como histórica. `tests/results/` contém os resultados desta execução, mesmo quando a suíte tem nome de uma rodada anterior.

## Reproduzir

Node.js 20 ou posterior, Python 3 e OpenSSL para a suíte HTTPS local. Dependências de teste não fazem parte do aplicativo em execução.

```sh
npm ci
npx playwright install --with-deps chromium firefox webkit
npm run build
npm test
npm run test:layout
npm run test:evidence
npm run test:artifacts
```

Para repetir a atualização entre versões, extraia separadamente a RC.4.5 e indique sua pasta modular:

```sh
SIAB_BASELINE_DIR=/caminho/RC45/SIAB npm run test:offline-upgrade
```

O pacote anterior não é duplicado neste ZIP. `SIAB_TEST_ENGINES=chromium` limita motores; `SIAB_PLAYWRIGHT_MODULE` e `SIAB_AXE_MODULE` permitem instalações externas das dependências. As suítes abrem servidores locais temporários e gravam JSON/capturas em `tests/results/`.

O executor usa `--no-sandbox` no Chromium e, quando necessário, `MOZ_DISABLE_CONTENT_SANDBOX=1` no Firefox. São opções do ambiente automatizado, não do aplicativo. Os navegadores usados nesta validação foram instalados efetivamente.

## Organização

| Arquivo/pasta | Função |
|---|---|
| `index.html`, `css/`, `assets/` | Aplicativo modular e identidade visual |
| `js/core/`, `js/simulation/`, `js/data/` | Estado, permissões, ciência e conteúdo |
| `js/telas/`, `js/ui/`, `js/a11y/` | Telas, interações e preferências |
| `vendor/` | Dependência de interface distribuída localmente |
| `sw.js`, `manifest.webmanifest` | Cache offline e metadados PWA |
| `build_standalone.py` | Geração do HTML único |
| `tests/`, `docs/` | Regressões, evidências e documentação |
| `SHA256SUMS.txt`, `SHA512SUMS.txt` | Integridade dos arquivos do pacote |
