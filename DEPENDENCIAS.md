# Dependências de execução — SIAB 1.0.0

| Componente distribuído | Versão | Licença | Uso |
|---|---|---|---|
| dialog-polyfill | 0.5.6 | BSD-3-Clause | Compatibilidade de diálogos; JS/CSS locais em `vendor/dialog-polyfill/`, incorporados no standalone |

A licença obrigatória permanece em `vendor/dialog-polyfill/LICENSE` e no cabeçalho do JavaScript, inclusive dentro do standalone. O SIAB mantém GPL-3.0-only em [LICENSE](LICENSE). Nenhuma dependência runtime foi removida ou adicionada.

O programa usa APIs do navegador para SVG/gráficos, áudio, armazenamento, compactação quando disponível e impressão. Não exige runtime Node nem bibliotecas remotas essenciais. Usa Segoe UI/system-ui/sans-serif e Consolas/monospace; não distribui fontes nem carrega Google Fonts.

## Serviços opcionais

- Open-Meteo: geocodificação e temperatura externa, acionadas pelo usuário. Sem rede, continuam os ajustes manuais.
- VLibras: widget remoto opcional, ativado pelo usuário. Indisponibilidade tratada pelo programa.
- Referências do Manual: links bibliográficos externos; o conteúdo operacional é local.

Esses serviços não são código redistribuído. URLs XML dos SVGs são namespaces, sem carregamento pela rede. Não há CDN essencial. Ferramentas de desenvolvimento são documentadas no source, não são dependências do usuário final.
