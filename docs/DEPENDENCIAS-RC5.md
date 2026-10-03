# Dependências — SIAB 1.0.0-rc.5

Inventário derivado dos arquivos distribuídos e de `package-lock.json`. O aplicativo é GPL-3.0-only, conforme `LICENSE`; componentes de terceiros mantêm suas licenças próprias.

| Componente | Versão | Licença registrada | Uso/distribuição |
|---|---|---|---|
| dialog-polyfill | 0.5.6 | BSD-3-Clause, texto em `vendor/dialog-polyfill/LICENSE` | Compatibilidade de diálogo; JS/CSS locais, incorporados no standalone |
| Playwright | 1.56.1 | Apache-2.0 | Desenvolvimento/testes; pacote não embutido no aplicativo |
| playwright-core | 1.56.1 | Apache-2.0 | Executor; versão fixada também em overrides |
| @axe-core/playwright | 4.10.2 | MPL-2.0 | Auditoria automatizada de acessibilidade |
| axe-core | 4.10.3 | MPL-2.0 | Dependência de testes fixada pelo lockfile |
| fsevents | 2.3.2 | MIT | Dependência opcional de desenvolvimento em macOS; não usada na execução Linux |

Os binários Chromium 141.0.7390.37, Firefox 142.0.1 e WebKit 26.0 foram instalados separadamente pelo Playwright para testes. Não integram o ZIP. Python/Node/OpenSSL pertencem às ferramentas de geração/validação; não são exigidos para abrir o standalone.

## Serviços e URLs

Foram pesquisados `http://`, `https://`, `cdn`, `unpkg`, `jsdelivr`, `cdnjs` e `googleapis` em index, JS, CSS, a11y e vendor. As **17 ocorrências** estão classificadas com caminho/linha em [DEPENDENCIAS-OCORRENCIAS-RC5.json](DEPENDENCIAS-OCORRENCIAS-RC5.json).

- Open-Meteo: duas URLs opcionais, geocodificação e temperatura. API v1 nos endereços; serviço remoto sem versão de distribuição fixada. Licença/termos do serviço não são fornecidos neste projeto; não é código redistribuído no ZIP. Falha tratada, com controle manual/referência.
- VLibras: script/plugin e endereço do widget, opcionais e acionados pelo usuário. Versão/licença do serviço remoto não estão fixadas no projeto; o serviço não é redistribuído. Falha de rede ou construtor tratada com aviso.
- Oito referências do Manual: links bibliográficos abertos pelo usuário. O conteúdo essencial do Manual permanece local.
- Namespaces SVG: identificadores `http://www.w3.org/2000/svg`, sem requisição de rede.
- URLs em vendor: atribuição/licença da dependência local, sem carregamento remoto.

Não há fonte, biblioteca de gráfico, motor científico ou interface essencial dependente de CDN. URLs do npm em `package-lock.json` são downloads para desenvolvimento via `npm ci`, não chamadas do aplicativo. Documentação, testes, namespace XML em SVG e endereços localhost de exemplo não são dependências essenciais de execução.

O cache real foi auditado na transição RC.4.5 → RC.5 e reaberto sem servidor/rede opcional. Evidência em [OFFLINE-RC5.md](OFFLINE-RC5.md).
