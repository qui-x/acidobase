# SIAB — Estudo de profundidade da abertura existente

**Escopo restrito ao SIAB.** O SILM já está concluído e não é alterado. Esta ramificação é experimental: a versão oficial `acidosebases1.0.0` permanece intacta.

## Fontes originais preservadas

- `assets/siab-icone.svg`: gota sobre tubo de ensaio, gradiente vermelho → rosa → roxo, símbolo institucional.
- `index.html`: abertura e hierarquia `SIAB / Simulador Interativo de Ácidos e Bases / A química das cores`.
- `js/ui/abertura.js`: cinco tubos, seus indicadores e três trocas de solução, dados obtidos de `SIAB.chem.solve` e `SIAB.chem.liquid`.
- `css/stylesiab.css`: fundo escuro radial, vidro, líquido, bolhas, gotas e transições.
- Duração atual: 3,65 segundos. Início das mudanças: 150 ms, 1000 ms e 1750 ms; marca em 2350 ms, saída iniciada em 3200 ms.

## Refinamento previsto no Blender

A modelagem adicionará apenas profundidade à mesma cena: paredes transparentes com espessura, base arredondada, menisco de líquido, gotas volumétricas, pequenas bolhas, luz de contorno e refração com intensidade controlada. Manter cinco tubos nas mesmas posições e a mesma câmera frontal ortográfica; não transformar a marca em outro símbolo.

## Restrições

1. **Nunca calcular pH nem cor indicadora dentro do Blender.** São dados do motor químico existente; as tonalidades usadas em estudos isolados são ilustrativas.
2. Preservar integralmente nome SIAB, subtítulo, logo, sequência e linguagem visual, inclusive modos claro/escuro e contraste.
3. Evitar controles de desenvolvimento no programa oficial.
4. Respeitar preferências de animação, toque/clique/teclado para pular e encerramento seguro.
5. Validar em mobile, Chromium, Firefox/WebKit, PWA e offline antes de substituir os efeitos SVG originais.
6. O resultado Blender (.blend) é fonte de modelagem; a aplicação web poderá receber GLB, sprites prerenderizados ou um overlay leve, após comparação e aprovação.

**Situação:** auditoria do funcionamento original concluída; estudo experimental em elaboração. Nenhuma alteração na abertura oficial foi feita nesta branch até esta etapa.
