'use strict';
/* Trilhas de aprendizagem: sequência de missões e desafios por série.
   A BNCC não fixa série para cada tema; a divisão segue o uso mais comum. */
SIAB.trilhas = [
  {
    id: 1, titulo: 'Cores e indicadores', serie: '1ª série',
    descricao: 'Ácido, base e neutro pela cor. Indicadores naturais e de laboratório.',
    itens: [
      { tipo: 'missao', id: 'repolho-roxo' },
      { tipo: 'missao', id: 'tres-indicadores' },
      { tipo: 'missao', id: 'cor-que-engana' },
      { tipo: 'desafio', id: 'detetive' }
    ]
  },
  {
    id: 2, titulo: 'Ácidos, bases e sais', serie: '1ª série',
    descricao: 'Ionização, força, neutralização, sais e óxidos na chuva ácida.',
    itens: [
      { tipo: 'missao', id: 'ionizacao' },
      { tipo: 'missao', id: 'forte-ou-concentrado' },
      { tipo: 'desafio', id: 'construtor' },
      { tipo: 'desafio', id: 'trunfo' },
      { tipo: 'missao', id: 'sais-cores' },
      { tipo: 'missao', id: 'chuva-acida' }
    ]
  },
  {
    id: 3, titulo: 'Quantidades e titulação', serie: '2ª série',
    descricao: 'Diluição, curvas de titulação, estequiometria e antiácidos.',
    itens: [
      { tipo: 'missao', id: 'diluicao' },
      { tipo: 'missao', id: 'curva-titulacao' },
      { tipo: 'missao', id: 'estomago' },
      { tipo: 'desafio', id: 'titulacao' }
    ]
  },
  {
    id: 4, titulo: 'Equilíbrio, hidrólise e tampão', serie: '2ª série',
    descricao: 'Escala logarítmica, grau de ionização, hidrólise salina, tampões e Kw.',
    itens: [
      { tipo: 'desafio', id: 'regua' },
      { tipo: 'missao', id: 'grau-ionizacao' },
      { tipo: 'missao', id: 'hidrolise' },
      { tipo: 'missao', id: 'tampao' },
      { tipo: 'missao', id: 'temperatura' }
    ]
  }
];
