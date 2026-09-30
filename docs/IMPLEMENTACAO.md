# Acompanhamento do prompt de evolução SIAB

Base recebida: `SIAB.zip`, versão 0.8.2. Especificação: `Texto colado.txt`, 90 seções. Entrega: **1.0.0-rc.1**, 30/09/2026.

## Implementação por conjunto de requisitos

| Conjunto | Entrega e evidência |
|---|---|
| Auditoria, arquitetura e identidade | Estrutura modular mantida; logo, ativos e abertura preservados; mapa de versões em versoes.json; sem novos módulos de progressão |
| Ciência | Estado central e solver conservado/corrigido; 25 testes científicos; comparação de 140 soluções nos três motores |
| Armazenamento e migração | Conversão idempotente, chave legada intacta, tabelas antigas, conclusão, relatório e bancada persistidos; 12 verificações de migração |
| Entrada, menus e Aprender | Preferência de início; 14 Temas sem pré-requisitos; rotas antigas redirecionadas |
| Missões e retirada de jogos | 19 Missões; objetivos e conclusão; cinco propostas convertidas; arquivos das telas de jogos removidos; sem placar ou ranking |
| Prever e gotejar | Previsão fechada/aberta, antes/depois, explicação contextual e registro voluntário |
| Montagens, mistura e seleção | 10 Montagens; seleção temporária; comparação, vínculo, mistura com destino/capacidade, registro, remoção, desfazer e cancelamento |
| Segredo e tour | Arco-íris do pH; tour de cinco passos; sem tour automático em missões, roteiros ou atividades |
| VER e instrumentação | Observar/Medir/Analisar; leitura explícita, fita, eletrodo, estabilização, calibração, condutividade, temperatura e representações coerentes |
| Roteiros (0.9.0) | 35 fichas, módulo único, identificação e todas as 140 soluções contempladas; sem “resultado esperado” na ficha do aluno |
| Relatórios (0.9.1–0.9.2) | Bancada livre e experiência formal, resultados automáticos, textos editáveis, HTML baixável e impressão preenchida/em branco |
| Professor (0.9.3) | Configuração por contexto, instrumentos e temperatura; guias, referências iniciais do modelo, discussão, BNCC e projetor |
| Links (0.9.4) | Configuração em token opaco, validação, cópia/abertura, atividades recentes e duplicação; respostas não incluídas no token |
| Restrição (0.9.5) | Guardas de rota, módulo e instrumentos; recarga, outra aba, finalização e retorno à bancada livre |
| Integração e limpeza | Menu atualizado, implementações antigas de impressão/pH automático retiradas, estilos de modos globais e jogos removidos; aliases legados limitados à compatibilidade |
| Responsividade e acessibilidade | 320–2560 px, tablet, teclado, toque simulado, visualViewport, reduzido movimento e axe WCAG 2 A/AA |
| Execução e offline | Modular por localhost; standalone por file://; HTTPS local; cache com servidor indisponível; manifesto e service worker atualizados |
| Homologação final (60–88) | Bateria automatizada e inspeção visual realizadas; verificação manual em sistemas/aparelhos comerciais ainda pendente |
| Entrega (89–90) | Código, standalone, manifesto/cache, README, LEIA-ME, Manual, changelog, migração, modelo, testes, matriz e limitações |

## Ajustes motivados pelos testes

- Eliminada referência a uma régua antiga que impedia a visão geral de renderizar.
- Preservadas preparações já gotejadas antes de vincular recipientes.
- Mantida a bancada livre ao entrar/sair de atividade.
- Corrigidos nomes de controles e atualização de seletores criados dinamicamente.
- Guardadas medidas anteriores como anteriores; condutividade interna não aparece como medição automática.
- Recuperada a conversão de tabelas textuais do Caderno antigo.
- Impedida duplicação de notas ao concluir a mesma missão duas vezes.
- Corrigida a exportação CSV com colunas atuais do histórico.
- Removido fundo escuro da impressão, inclusive quando o tema define `color-scheme` no elemento raiz.
- Corrigidos cálculos de relatórios de misturas: quantidade de cada componente, sem atribuir mols fictícios a amostras representativas.
- Retirada a atualização da bancada ao reabrir um relatório que pertence a outro contexto.

## O que impede chamar esta versão de 1.0.0 homologada

Os testes exigidos em Safari, dispositivos móveis reais, versões comerciais atuais/anteriores, leitores de tela, teclado virtual e PWA instalada não podem ser substituídos por emulação. A ausência dessas plataformas está explicitada em LIMITACOES.md e na matriz. Não se inventaram resultados “OK” para completar a tabela.

As evidências são uma fotografia da execução nesta versão. Ao modificar os arquivos, gere novamente o standalone e execute a bateria antes de distribuir.
