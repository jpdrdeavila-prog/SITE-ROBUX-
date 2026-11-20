// EXEMPLO DO MOTOR (números ilustrativos, não é roteiro real). Serve de modelo de formato.
// Teste: node scripts/shot.js videos/exemplo.js   |   node scripts/render.js videos/exemplo.js
export default {
  tema: 'EXEMPLO DO MOTOR',
  handle: '@ESTEREOLUDICO',
  cam: { d: 6.5 },
  // Cada item = 1 legenda (3 a 9 palavras). *palavra* = destaque colorido.
  // Sem voz: tempo automático (15 letras/s). Com voz: node scripts/sync.js gera exemplo.tempos.json.
  segs: [
    'Se você deixar *mil reais* parados',        // 0
    'por cinco anos,',                            // 1
    'ele perde *um quarto* do valor.',            // 2
    'Vem que eu te explico de forma estérea.',    // 3
    'O vilão tem nome: *inflação*.',              // 4
    'Os preços sobem um pouco todo ano',          // 5
    'e o seu dinheiro compra menos.',             // 6
    'Agora, onde colocar?',                       // 7
    'Numa torneira que *rende* todo mês.',        // 8
    'E você, guarda ou gasta?',                   // 9
    'Quer aprender a fazer vídeos assim?',        // 10
    'Comenta *ESTÉREO*.',                         // 11
  ],
  scenes: [
    { from: 0, pill: 'O DINHEIRO PARADO', bg: ['#0a0a0c', '#24242c'],
      hdr: [{ count: { from: 1000, to: 750, pre: 'R$ ', dur: 1.6 }, sub: 'EM 5 ANOS · ILUSTRATIVO', at: 2 }],
      objs: [{ k: 'cashCrumble', o: { n: 7, h: 0.85, p: lt => (lt - 3) / 2 }, x: 0.15 },
             { k: 'clock', x: -0.6, s: 0.7, at: 1, type: 'drop' }] },
    { from: 3, pill: 'O DINHEIRO PARADO', bg: ['#0a0a0c', '#24242c'],
      hdr: [{ title: 'Vem que eu te explico', box: true }],
      objs: [{ k: 'man', o: { pose: 'aceno' }, s: 0.72 }] },
    { from: 4, pill: 'A INFLAÇÃO', bg: ['#2a0b18', '#6a1a2a'], acc: '#ff8f86',
      hdr: [{ tag: 'PREÇOS SOBEM TODO ANO', tagc: '#ff8f86', tagf: '#2a0b18' },
            { chips: [['ANO 1', '#a8323e'], ['ANO 3', '#a8323e', 1], ['ANO 5', '#a8323e', 2]] }],
      objs: [{ k: 'bars', o: { vals: [0.4, 0.6, 0.85], cols: ['@1', '@1', '#ff8f86'], g: lt => lt / 2 }, x: -0.35 },
             { k: 'arrow', o: { col: '#ff8f86' }, x: 0.55, at: 1, type: 'rise' },
             { k: 'sign', o: { txt: 'MAIS CARO', col: 'red', y: 1.25 }, x: 0.1, at: 2, type: 'drop' }] },
    { from: 7, pill: 'ONDE COLOCAR', bg: ['#06174a', '#0f3a9a'],
      hdr: [{ tag: 'EXEMPLO, NÃO RECOMENDAÇÃO' }, { num: 'RENDE TODO MÊS', sub: 'JUROS COMPOSTOS', at: 1 }],
      objs: [{ k: 'faucetBucket', o: { level: lt => 0.15 + lt * 0.12 }, x: 0.15 },
             { k: 'cashBlock', o: { n: 3, h: 0.6 }, x: -0.55, at: 1 }] },
    { from: 9, pill: 'COMENTA', bg: ['#0a0a0c', '#1d2a22'],
      hdr: [{ title: 'E você, *guarda* ou *gasta*?', box: true, until: 1 }, { title: 'Quer aprender a fazer vídeos assim?', box: true, at: 1 }, { tag: 'COMENTA ESTÉREO', at: 2 }],
      objs: [{ k: 'crowd', o: { n: 6, cols: 3, hi: 1 }, s: 0.55, x: 0 }] },
  ],
};
