# Limitações — SIAB 1.0.0

Versão estável com os limites de validação abaixo. Há testes executados em Linux com Chromium, Firefox e WebKit instalados; não há declaração de homologação de aparelhos ou leitores de tela reais.

## Pendências externas

| Verificação | Situação |
|---|---|
| Safari macOS, iOS e iPadOS | Não testado em plataforma real; WebKit Linux não substitui Safari |
| Android, Chrome móvel e Samsung Internet | Não testado em aparelho físico |
| Chrome/Edge/Firefox comerciais em Windows/macOS | Não homologados por inferência dos motores Linux |
| NVDA + Chrome/Edge, TalkBack + Chrome, VoiceOver + Safari | Não testados; axe/teclado/ARIA não substituem leitores reais |
| PWA instalada, aberta e atualizada pelo sistema | Pendente; cache/SW e reabertura offline foram testados separadamente |
| Teclado virtual, safe areas, barras do navegador e rotação física | Emulação exercitada; ergonomia em aparelho pendente |
| Zoom nativo do navegador em aparelho | Refluxo CSS equivalente a 200% e fonte 200% testados; interação física pendente |
| Impressão em papel e diálogo de cada sistema | PDFs Chromium e mídia de impressão testados; impressora física pendente |
| VLibras online com tradução efetiva | Falhas de carregamento/inicialização tratadas e testadas; serviço real não homologado |
| Publicação HTTPS e atualização de PWA instalada em domínio real | HTTPS local e troca RC.5 → 1.0.0 testados; distribuição real pendente |
| Desempenho em celular de pouca memória | Testes de estabilidade Linux não substituem hardware limitado |

Pendente significa ausência de evidência, não incompatibilidade comprovada. A promoção não transforma emulação em homologação física.

## Dados e compartilhamento

- Armazenamento local, sem servidor, conta ou sincronização. Trocar origem/perfil/aparelho ou limpar dados pode remover registros. Exporte antes.
- Em armazenamento bloqueado ou cheio, o aviso e a sessão em memória não garantem recuperação após fechar.
- O link autocontido não pode ser revogado remotamente. Excluir atividade remove o registro local; links enviados permanecem válidos com a configuração original.
- A restrição é pedagógica, não autenticação ou ambiente de prova inviolável. O destinatário recebe o código/configuração do aplicativo.
- Impressão/PDF usa o diálogo do navegador. Não há exportação HTML do relatório nem serviço remoto de conversão.
- Clima e VLibras requerem internet e são opcionais. O núcleo essencial continua offline.

## Ciência e relatório

- O modelo é didático. Precipitação/redissolução depende de parâmetros cadastrados; amostras reais são representativas; temperatura não corrige todas as constantes. Consulte [MODELO-CIENTIFICO.md](MODELO-CIENTIFICO.md).
- Instrumentos têm resolução e tolerância didáticas determinísticas. Compactação conserva originais, contagem e intervalo; uma média não implica maior precisão.
- Condições iniciais usam o contexto do primeiro registro instrumental disponível. Dados antigos sem esse contexto são identificados; não são reconstruídas medidas inexistentes.
- Misturas apresentam preparos por componente, sem concentração única fictícia. Dados hipotéticos da folha de análise são identificados, limitados a 200 linhas e separados das medições reais.
- Linhas por campo variam de 5 a 60; papel, fontes, dados e navegador influenciam paginação. Os PDFs de validação são exemplos, não uma promessa de número fixo de páginas.
- Histórico e leituras não são truncados pela compactação; sessões longas continuam sujeitas à memória/quota local.

## Apresentação

Em 320×568 ou orientação de pouca altura, o recipiente pode exigir rolagem vertical dentro da cena. Essa adaptação já existia na base aprovada e foi preservada. Tabelas largas têm rolagem horizontal local; controles não ultrapassam a viewport nos cenários verificados. Docas usam botões de expandir/restaurar, sem arrasto livre ou redimensionamento manual.

A busca do Manual é local e editorial, sem correção semântica. O tour permanece na bancada livre. Os diagramas explicam o uso e não executam experiências. A homologação em aparelhos e tecnologias assistivas reais continua necessária.
