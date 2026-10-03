# Auditoria offline — SIAB 1.0.0-rc.5

O núcleo científico, bancada, gráficos, relatórios, Manual, Missões, Roteiros, Professor e interface usam arquivos locais. `vendor/dialog-polyfill/` acompanha JS, CSS e licença. O standalone incorpora os recursos necessários. Não há CDN essencial.

## Evidência executada

`tests/offline-rc5.test.cjs` e `tests/results/offline-rc5.json` registram **5 cenários por motor, 15 aprovados**. A base RC.4.5 foi servida de uma extração real, não emulada pela troca do número de versão.

1. Abrir RC.4.5 online, instalar o cache e criar sessão restrita com medição.
2. Recarregar e confirmar o controlador anterior.
3. Trocar o conteúdo do servidor para RC.5, atualizar o SW e acionar a notificação de recarga.
4. Confirmar novo cache, remoção do anterior e preservação dos dados/contexto.
5. Comparar o SHA-256 de cada resposta cacheada com o arquivo RC.5 correspondente, sem mistura de builds.
6. Fechar a página, tornar o servidor indisponível e bloquear requisições HTTPS opcionais.
7. Abrir outra página da origem e usar Início, Laboratório, Manual, Montagens, Roteiros, Professor e Caderno.
8. Gotejar, medir, abrir relatório, editar resposta, recarregar e confirmar persistência; gerar atividade do Professor offline.

Chromium usou adicionalmente `context.setOffline(true)`. Firefox e WebKit usaram o servidor encerrando as conexões e a rede externa bloqueada: a flag offline dos executores causava erro antes de o Service Worker responder à navegação. O mecanismo exato consta por motor no JSON. A disponibilidade do servidor permaneceu desativada durante os passos offline.

## Serviços opcionais

Open-Meteo fornece consulta de temperatura por cidade. Sua falha mantém referência/controle manual e informa indisponibilidade. VLibras só é carregado por ativação do usuário; falha no script ou no construtor é tratada, sem derrubar a interface. Links de referências científicas abrem páginas externas somente por iniciativa do usuário.

## Escopo

O teste usa processos de navegador Linux e cache/SW reais. Não valida instalar a PWA pelo sistema operacional, reiniciar o aparelho ou atualizar uma PWA publicada em domínio de produção. Essas etapas permanecem em [LIMITACOES.md](LIMITACOES.md). PWA requer HTTPS ou localhost; o HTML único por `file://` usa seus recursos incorporados e não precisa de SW.

Reproduzir: `SIAB_BASELINE_DIR=/caminho/RC45/SIAB npm run test:offline-upgrade`. O ZIP anterior não é embutido no pacote novo. Os binários de navegador e dependências de desenvolvimento são instalados separadamente, conforme README.
