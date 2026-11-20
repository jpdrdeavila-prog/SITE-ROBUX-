// EXEMPLO DO MOTOR (números ilustrativos, não é roteiro real). Mostra os recursos principais:
// transições pan/up/zoom/pop/flash, objeto que atravessa cenas (id), transformação (morph), câmera com cam2,
// partículas (fx), contador, título riscado, carimbo, rótulos e efeitos sonoros automáticos.
// Teste: node scripts/shot.js videos/exemplo.js   |   node scripts/render.js videos/exemplo.js --jobs 3
export default {
  tema: 'EXEMPLO DO MOTOR',
  handle: '@ESTEREOLUDICO',
  cam: { d: 6.5 },
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
    'E o dinheiro vira *patrimônio*.',            // 9
    'A lição: dinheiro parado',                   // 10
    'não *descansa*,',                            // 11
    'ele *encolhe*.',                             // 12
    'E você, guarda ou gasta?',                   // 13
    'Quer aprender a fazer vídeos assim?',        // 14
    'Comenta *ESTÉREO*.',                         // 15
  ],
  scenes: [
    { from: 0, pill: 'O DINHEIRO PARADO', bg: ['#0a0a0c', '#24242c'],
      cam: { d: 7.2, h: 1.4, yaw: -18 }, cam2: { d: 6.0, h: 0.8, yaw: 8 },        // câmera viajando durante a cena
      hdr: [{ count: { from: 1000, to: 750, pre: 'R$ ', dur: 1.6 }, sub: 'EM 5 ANOS · ILUSTRATIVO', at: 2, col: '#ff8f86' }],
      objs: [{ id: 'grana', k: 'cashCrumble', o: { n: 7, h: 0.85, p: lt => (lt - 3) / 2 }, x: 0.1 },
             { k: 'clock', x: -0.75, s: 0.6, at: 1, type: 'drop' }] },
    { from: 3, pill: 'O DINHEIRO PARADO', bg: ['#0a0a0c', '#24242c'], trans: 'pop',
      hdr: [{ title: 'Vem que eu te explico', box: true }],
      objs: [{ k: 'man', o: { pose: 'aceno' }, s: 0.72 }], fx: ['sparkle'] },
    { from: 4, pill: 'A INFLAÇÃO', bg: ['#2a0b18', '#6a1a2a'], acc: '#ff8f86', trans: 'up',
      hdr: [{ tag: 'PREÇOS SOBEM TODO ANO', tagc: '#ff8f86', tagf: '#2a0b18' },
            { chips: [['ANO 1', '#a8323e'], ['ANO 3', '#a8323e', 1], ['ANO 5', '#a8323e', 2]] }],
      objs: [{ k: 'lineChart', o: { vals: [0.15, 0.3, 0.42, 0.6, 0.85], col: '#ff8f86', g: lt => lt / 3 }, x: 0, s: 0.95 },
             { k: 'sign', o: { txt: 'MAIS CARO', col: 'red', y: 1.3 }, x: 0.35, at: 2, type: 'drop' }] },
    { from: 7, pill: 'ONDE COLOCAR', bg: ['#06174a', '#0f3a9a'], trans: 'pan',
      hdr: [{ tag: 'EXEMPLO, NÃO RECOMENDAÇÃO' }, { num: 'RENDE TODO MÊS', sub: 'JUROS COMPOSTOS', at: 1 }],
      objs: [{ k: 'faucetBucket', o: { level: lt => 0.15 + lt * 0.12 }, x: 0.3 },
             { id: 'grana', k: 'cashBlock', o: { n: 4, h: 0.6 }, x: -0.5, s: 0.9 }] },
    { from: 9, pill: 'ONDE COLOCAR', bg: ['#06221a', '#0f4d37'], trans: 'pan',
      hdr: [{ num: '+ PATRIMÔNIO', col: '#7dffb0' }],
      objs: [{ id: 'grana', k: 'house', o: { col: '#e9fff2', roof: '#5dff9e' }, x: 0, s: 1.3, label: 'SEU', labelCol: '#7dffb0' }],
      fx: ['coins'] },
    { from: 10, pill: 'A LIÇÃO', bg: ['#0a0a0c', '#1a1a20'], trans: 'zoom',
      cam: { d: 6.2, orbit: 3 },
      hdr: [{ title: 'NÃO DESCANSA', strike: 0.9, until: 2 }, { stamp: 'ELE ENCOLHE', at: 2 }],
      objs: [{ k: 'cashCrumble', o: { n: 6, h: 0.8, p: lt => lt / 2.5 }, upd: (lt) => ({ s: 1 - Math.min(0.35, lt * 0.08) }) },
             { k: 'eyes', o: { nx: 5, ny: 3 }, z: -1.6, y: 0.2, type: 'none' }] },
    { from: 13, pill: 'COMENTA', bg: ['#0a0a0c', '#1d2a22'], trans: 'flash',
      hdr: [{ title: 'E você, *guarda* ou *gasta*?', box: true, until: 1 }, { title: 'Quer aprender a fazer vídeos assim?', box: true, at: 1 }, { tag: 'COMENTA ESTÉREO', at: 2 }],
      objs: [{ k: 'crowd', o: { n: 6, cols: 3, hi: 1 }, s: 0.55 }], fx: ['confetti'] },
  ],
};
