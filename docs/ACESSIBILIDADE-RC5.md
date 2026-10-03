# Acessibilidade — SIAB 1.0.0-rc.5

Auditoria automatizada e inspeção da interface em Linux. Não constitui certificação de conformidade integral nem homologação de tecnologia assistiva real.

## Executado

- Axe via @axe-core/playwright 4.10.2 / axe-core 4.10.3, com regras WCAG 2 A/AA e 2.1 A/AA nas telas exercitadas. Na suíte RC.5: Início, Aprender, Missões, Roteiros, Montagens, Caderno, Professor, Manual, Relatório e diálogo Sobre, nos três motores; zero violações detectadas nessas execuções.
- Regressões adicionais de Manual e workspace: títulos, landmarks, nomes, ARIA de controles, diálogos e painéis.
- Enter, Space, Escape, Tab/Shift+Tab, contenção e retorno do foco. Cancelamento recebe foco seguro nas confirmações; ações destrutivas conservam família danger e texto explícito.
- Anúncio de medição de pH; regiões de aviso continuam presentes para erros, painéis e finalização. O teste de anúncio/DOM não reproduz a fala de um leitor real.
- Fonte ampliada a 200%, viewport equivalente a zoom 200%, contraste/temas, deuteranopia e movimento reduzido. A percepção humana de todos os filtros não foi inferida do teste automático.
- Touch targets de 44 px, irmãos equivalentes e controles dentro da viewport em 320/360/390/414 px. Painéis têm ações de 48 px ou mais quando ocupam a linha.
- Ícones decorativos com `aria-hidden`, controles com nome textual/ARIA e estado `aria-expanded`/`aria-controls` quando aplicável. Funções equivalentes reutilizam o SVG central.
- Falha de carregamento e de inicialização do VLibras: aviso e continuidade do programa; nenhuma dependência essencial desse serviço.

## Evidências

`tests/results/rc5.json`, `manual.json`, `workspace.json`, `mobile-controls.json` e `regressao.json`; [galeria](EVIDENCIAS-RC5.html); [inventário de ícones](ICONOGRAFIA-RC5.html). As geometrias e listas de violações estão nos JSON por motor.

## Pendências

NVDA + Chrome/Edge no Windows, TalkBack + Chrome no Android e VoiceOver + Safari em plataformas Apple não foram executados. Também faltam teclado virtual/safe areas físicos, leitura assistiva dos anúncios, zoom nativo em aparelho e VLibras online com tradução efetiva. A inspeção automática não é usada como substituto desses ensaios. Consulte [LIMITACOES.md](LIMITACOES.md).
