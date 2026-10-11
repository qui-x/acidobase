# SIAB 1.0.0

Simulador Interativo de Ácidos e Bases. Aplicação educacional estática com 140 substâncias, módulos Explorar, Medir e Calcular, instrumentos, atividades, Manual, relatórios e Caderno local.

Promove a RC.5 aprovada sem novas funcionalidades, alterações científicas, pedagógicas ou de interface. A linha 1.0.0 fica congelada para novas funcionalidades.

## Abrir e instalar

- **Distribuição modular:** extraia `SIAB-1.0.0.zip` e sirva a pasta `SIAB/` em um servidor web. Para uso local, nela execute `python3 -m http.server 8080` e abra `http://localhost:8080`.
- **Arquivo único:** abra o artefato separado `SIAB-1.0.0-standalone.html` no navegador. Contém os recursos essenciais e funciona sem servidor ou instalação.
- **PWA:** publique a pasta modular em HTTPS ou use localhost. Abra conectado e aguarde o cache antes de desconectar. Use Instalar no navegador ou no menu, quando disponível. O standalone não é uma PWA.

Requisitos: navegador moderno com JavaScript. Node, npm e ferramentas de teste não são exigidos para usar o programa. Python é somente uma opção para servir a versão modular localmente.

## Offline e atualização

Laboratório, Manual, Montagens, Relatório e Caderno são locais. Open-Meteo e VLibras são opcionais e precisam de internet. As fontes são do sistema.

Ao substituir os arquivos da RC.5 no mesmo endereço, o service worker prepara o cache `siab-1.0.0` e oferece **Recarregar**. A limpeza afeta apenas caches antigos desta publicação. Caderno, sessões, práticas, relatórios e preferências permanecem armazenados no navegador.

Mantenha a mesma origem, caminho e perfil para conservar os dados. Trocar domínio, aparelho ou perfil não transfere registros automaticamente. Exporte o Caderno e salve os relatórios antes de limpar dados do navegador.

## Estrutura

| Caminho | Finalidade |
|---|---|
| `index.html`, `a11y.js`, `css/`, `js/` | Aplicação e acessibilidade |
| `sw.js`, `manifest.webmanifest` | Cache offline e instalação |
| `assets/`, favicons | Marca e ícones utilizados |
| `vendor/dialog-polyfill/` | Compatibilidade local de diálogos e licença |
| `docs/` | Manual, modelo científico, migração e limitações |
| Documentos na raiz | Uso, validação, compatibilidade, dependências e mudanças |
| `FILES.txt`, `SHA256SUMS.txt`, `SHA512SUMS.txt` | Manifesto e integridade dos arquivos |

O standalone é separado para evitar duplicação no ZIP modular. `SIAB-1.0.0-source.zip` contém código, geradores, lockfile, testes e documentação técnica, sem node_modules nem navegadores.

## Documentação e limites

[Guia de uso](LEIA-ME.md) · [Manual](docs/MANUAL.md) · [Validação](VALIDACAO.md) · [Compatibilidade](COMPATIBILIDADE.md) · [Dependências](DEPENDENCIAS.md) · [Mudanças](CHANGELOG.md) · [Limitações](docs/LIMITACOES.md) · [Licença](LICENSE).

A validação usa Chromium, Firefox e WebKit Linux. Viewports mobile são emulados; aparelhos, leitores de tela, instalação pelo sistema e impressão física não são declarados como testados. O modelo é didático, com hipóteses descritas em [MODELO-CIENTIFICO.md](docs/MODELO-CIENTIFICO.md).
