# Limitações e homologação pendente

## Situação da entrega

A versão é **1.0.0-rc.1**. Há implementação funcional e evidências automatizadas em Linux. O prompt exige também testes manuais em plataformas e aparelhos reais que não estão disponíveis neste ambiente. Por isso não se declara 1.0.0 homologada nem compatibilidade automática com marcas comerciais a partir do motor.

## Validações ainda necessárias

| Verificação | Situação |
|---|---|
| Chrome, Edge e Firefox comerciais nas versões atual e anterior, Windows/macOS | Pendente de execução nos navegadores e sistemas reais |
| Safari macOS e Safari iOS/iPadOS | Pendente; WebKit de teste em Linux não substitui Safari |
| Chrome Android e Samsung Internet | Pendente em aparelhos reais |
| Instalar, abrir e atualizar PWA pelo sistema operacional | Pendente; cache/service worker offline testados separadamente |
| Teclado virtual, orientação, barras do navegador e safe areas reais | Pendente; larguras e toque simulados não reproduzem o sistema móvel inteiro |
| Leitores de tela (NVDA, VoiceOver, TalkBack) | Pendente; axe e navegação por teclado não substituem leitura assistiva real |
| Impressão física e diálogos de impressão de cada sistema | Pendente; PDF Chromium e mídia de impressão nos três motores testados |
| Publicação em domínio HTTPS real e atualização de uma PWA já instalada | Pendente; HTTPS local foi exercitado com certificado de teste |
| Taxa de quadros e pressão de memória em celular limitado | Pendente; lote de 500 gotas e estabilidade do DOM testados em Linux |

“Pendente” identifica falta de evidência, não significa “Não suportado” nem “OK”. Não foram preenchidas células por inferência do motor ou marca.

## Limites funcionais e científicos

- Há somente armazenamento local. Trocar domínio, aparelho, perfil ou limpar dados não transfere os registros. Exporte antes de migrar.
- Armazenamento bloqueado ou cheio conserva a sessão em memória, com aviso, mas não permite garantir recuperação depois de fechar.
- Um link `file://` não distribui o arquivo para outro aparelho. Para compartilhar, hospede os arquivos no mesmo endereço HTTPS ou forneça o HTML aos participantes.
- O link é opaco e validado contra alteração acidental; a chave acompanha a configuração. Não oferece sigilo ao destinatário, autenticação ou proteção contra edição do código pelo próprio usuário.
- O modo restrito é uma ferramenta de organização pedagógica. As rotas e ações da interface são protegidas; não se trata de um ambiente de prova inviolável.
- A configuração “relatório impresso” identifica a modalidade indicada pelo professor; a impressão usa o diálogo do navegador, que continua sob controle do usuário.
- Clima e VLibras dependem de internet. Consulta meteorológica falha de forma explícita e mantém opção manual/referência.
- O histórico técnico limita eventos a 4.000 por recipiente. Leituras de pH e notas voluntárias não usam o antigo corte de 300 registros. Exporte investigações longas antes de atingir limites de armazenamento.
- Só há precipitação/redissolução para sistemas com parâmetros cadastrados; amostras reais são representativas; temperatura não corrige todas as constantes. Veja MODELO-CIENTIFICO.md.
- O marcador da terceira equivalência do ácido fosfórico não é exibido como salto resolvido; o equilíbrio mantém todas as dissociações.

A liberação 1.0.0 deve aguardar as validações acima, correções necessárias e atualização da matriz com resultados efetivamente observados.
