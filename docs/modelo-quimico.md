# SIAB — modelo da versão 0.1

Soluções aquosas ideais a 25 °C. Volumes aditivos; mistura e equilíbrio imediatos.
HCl e NaOH são tratados como totalmente dissociados. Para ácido acético,
Ka = 1,8 × 10⁻⁵; para amônia, Kb = 1,8 × 10⁻⁵; Kw = 1,0 × 10⁻¹⁴.

O cálculo usa concentrações analíticas após a diluição e resolve numericamente
a eletroneutralidade. Para um ácido monoprótico, [A⁻] = CT·Ka/(Ka+[H⁺]);
para uma base fraca, [BH⁺] = CT·[H⁺]/(Ka+[H⁺]), com Ka = Kw/Kb.
São incluídos os contraíons dos eletrólitos fortes e a autoionização da água.
O pH não é incrementado por uma constante a cada gota.

As gotas armazenam o volume individual, em mL. Uma adição é bloqueada antes de
ultrapassar a capacidade de 5 mL. Equivalência estequiométrica e faixa de
viragem são conceitos distintos. A indicação de equivalência só aparece se
uma adição atingir esse volume; gotas discretas podem ultrapassá-lo.

Os indicadores são considerados traços sem alteração de pH ou volume.
As cores são interpoladas suavemente nas faixas informadas, de modo didático,
sem pretensão de reproduzir espectros de absorção ou todas as concentrações
de indicador. Tornassol: faixa aproximada de 4,5 a 8,3. Indicador universal:
carta representativa, dependente da formulação. Fenolftaleína: não inclui o
desbotamento lento em meio fortemente alcalino. O tema visual não muda o pH
nem a cor calculada do indicador; os filtros de percepção afetam a exibição.

Catálogo inicial: HCl, CH₃COOH, NaOH, NH₃ e água. Interface: 0,0001 a 0,1 mol/L,
0,1 a 4 mL iniciais, gotas de 0,01 / 0,02 / 0,05 / 0,10 mL.

## Referências

- OpenStax, Chemistry 2e, 14.3 — Relative Strengths of Acids and Bases:
  https://openstax.org/books/chemistry-2e/pages/14-3-relative-strengths-of-acids-and-bases
- OpenStax, Chemistry 2e, 14.7 — Acid-Base Titrations:
  https://openstax.org/books/chemistry-2e/pages/14-7-acid-base-titrations
- IUPAC Gold Book, equivalence-point:
  https://goldbook.iupac.org/terms/view/09042

Consultadas em 24/09/2026. Cálculos e código escritos especificamente para o SIAB.
