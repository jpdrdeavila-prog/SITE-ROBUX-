// "Pablo Escobar: como ele construiu o império do crime" · ~90 s · documentário, sem glamourizar
// Fontes: Wikipédia (nascimento, morte), Wikipédia ES (cartel, ~80%, estimativa), Mob Museum (Forbes),
// Business Insider/Yahoo (elásticos, Roberto Escobar), Las2orillas/Caracol (casas, Congresso 1982),
// La FM (Plano Pistola, estimativas de mortes), El Colombiano (Avianca 203), Infobae (La Catedral), Live Science (hipopótamos).

// hipopótamo low-poly
const hipo = (col = '#8c7f9c') => L => {
  const body = L.sph(0.3, col, { y: 0.4 }); body.scale.set(1.65, 1, 1.05);
  const head = L.sph(0.2, col, { x: 0.5, y: 0.46 }); head.scale.set(1.3, 0.92, 1.0);
  const snout = L.sph(0.16, col, { x: 0.7, y: 0.38 }); snout.scale.set(1, 0.8, 1.12);
  const g = L.group(body, head, snout);
  [-1, 1].forEach(s => {
    g.add(L.sph(0.045, col, { x: 0.42, y: 0.64, z: s * 0.11 }));
    g.add(L.sph(0.03, '#ffffff', { x: 0.6, y: 0.56, z: s * 0.1 }));
    g.add(L.sph(0.017, '#111111', { x: 0.625, y: 0.56, z: s * 0.1 }));
    g.add(L.cyl(0.075, 0.2, col, { x: 0.28, z: s * 0.16 }), L.cyl(0.075, 0.2, col, { x: -0.3, z: s * 0.16 }));
  });
  g.add(L.sph(0.02, '#3a2f45', { x: 0.84, y: 0.42, z: 0.05 }), L.sph(0.02, '#3a2f45', { x: 0.84, y: 0.42, z: -0.05 }));
  return g;
};
const manada = (n) => L => {
  const g = L.group(); const P = [[0, 0, 0], [-0.9, 0, -0.7], [0.9, 0, -0.9], [-0.4, 0, -1.6], [0.6, 0, -2.0], [-1.3, 0, -2.2], [1.4, 0, -2.6]];
  for (let i = 0; i < n; i++) { const h = hipo(i % 2 ? '#7d7190' : '#8c7f9c')(L); h.position.set(...P[i]); h.rotation.y = (i % 3 - 1) * 0.5; h.userData.tick = lt => { h.position.y = -0.13 + Math.sin(lt * 1.5 + i) * 0.02; }; g.add(h); }
  return g;
};
// dinheiro amarrado com elásticos
const grana = (n = 7, h = 0.85) => L => {
  const g = L.cashBlock({ n, h });
  const W = n * 0.16 + (n - 1) * 0.018;
  [0.25, 0.7].forEach(f => g.add(L.box(W + 0.03, 0.035, 0.53, '#ff8a5a', { y: h * f, rd: 0.012, glow: 0.2 })));
  return g;
};
const caixa = (txt) => L => {
  const g = L.group(L.box(0.75, 0.5, 0.55, '#b8895a', { rd: 0.03 }), L.box(0.77, 0.04, 0.57, '#8a6438', { y: 0.46, rd: 0.01 }));
  const t = L.text({ txt, h: 0.08, col: '#3a2410' }); t.position.set(0, 0.2, 0.28); g.add(t); return g;
};
const AGUA = { k: 'water', o: { col: '#2b7f86', w: 6, d: 5 }, type: 'none', z: -1 };

export default {
  tema: 'PABLO ESCOBAR',
  estilo: 'A',
  handle: '@ESTEREOLUDICO',
  cam: { d: 6.5 },
  segs: [
    'O cartel dele gastava *2.500 dólares* por mês',        // 0
    'só com elástico pra amarrar dinheiro.',                 // 1
    'Ele colocou a Colômbia inteira em *guerra*,',           // 2
    'e deixou de herança, *hipopótamos*.',                   // 3
    'Essa é a história de *Pablo Escobar*.',                 // 4
    'Vem que eu te explico de forma estérea.',               // 5
    'Pablo nasceu em *1949*, perto de Medellín.',            // 6
    'Começou com contrabando e pequenos golpes,',            // 7
    'até descobrir um produto que valia ouro: a *cocaína*.', // 8
    'Nos anos 80, o Cartel de Medellín',                     // 9
    'controlava cerca de *80%* da cocaína',                  // 10
    'que saía da Colômbia para os Estados Unidos.',          // 11
    'Era tanto dinheiro que a Forbes',                       // 12
    'o colocou entre os *bilionários* do mundo.',            // 13
    'Pra ganhar o povo, ele construiu casas',                // 14
    'pra famílias pobres e campos de futebol.',              // 15
    'Em *1982*, chegou ao Congresso como suplente.',         // 16
    'Mas a máscara caiu rápido.',                            // 17
    'Pablo declarou guerra contra o Estado.',                // 18
    'Pagava recompensa por *policial morto*',                // 19
    'e explodiu um avião com *110 pessoas*.',                // 20
    'As estimativas falam em *milhares* de mortes.',         // 21
    'Em 1991, se entregou numa prisão que ele mesmo construiu.', // 22
    'Um ano depois, fugiu.',                                 // 23
    'Em *1993*, foi morto num telhado em Medellín,',         // 24
    'um dia depois de fazer *44 anos*.',                     // 25
    'O império acabou, e o crime não compensou.',            // 26
    'Sobraram os *hipopótamos* do zoológico dele.',          // 27
    'Eram 4. Hoje são mais de *200* soltos na Colômbia.',    // 28
    'Você já sabia dessa história?',                         // 29
    'Quer aprender a fazer vídeos assim?',                   // 30
    'Comenta *ESTÉREO*.',                                    // 31
  ],
  scenes: [
    // GANCHO
    { from: 0, pill: 'PABLO ESCOBAR', bg: ['#0a0a0c', '#24242c'],
      cam: { d: 7.4, h: 1.7, yaw: -25 }, cam2: { d: 5.8, h: 0.8, yaw: 10 },
      hdr: [{ num: 'US$ 2.500/MÊS', sub: 'SÓ EM ELÁSTICOS · SEGUNDO O IRMÃO, ROBERTO ESCOBAR', col: '#7dffb0', sfx: 'cash' }],
      objs: [{ id: 'grana', make: grana(7, 0.85), morph: false, type: 'drop' }], fx: ['bills'] },
    { from: 2, pill: 'PABLO ESCOBAR', bg: ['#2a0b18', '#6a1a2a'], trans: 'pan', acc: '#ff8f86',
      cam: { d: 6.8, h: 1.3, shake: 0.5 },
      hdr: [{ stamp: 'GUERRA', until: 1 }, { title: 'Herança: *hipopótamos*', box: true, hl: '#7dffb0', at: 1 }],
      objs: [{ k: 'field', o: { nx: 9, nz: 6, col: '@3', roof: '@2', lit: lt => lt / 2, litCol: '#3a3a44', litRoof: '#ff5a5f' }, z: -0.6, type: 'none', until: 1 },
             { make: hipo(), at: 1, s: 1.1, x: -0.1, yaw: 20, upd: lt => ({ yaw: Math.sin(lt * 1.2) * 8 }) }], fx: ['rain'] },
    { from: 4, pill: 'PABLO ESCOBAR', bg: ['#0a0a0c', '#1d1d25'], trans: 'zoom',
      cam: { d: 6.0, orbit: 5, yaw: -15 },
      hdr: [{ title: 'A história de *Pablo Escobar*', box: true, hl: '#ffd24a' }],
      objs: [{ id: 'pablo', k: 'man', o: { col: '#2a2a33', pose: 'parado' }, s: 0.75, label: 'PABLO ESCOBAR', labelCol: '#ffd24a' }], fx: ['sparkle'] },
    // O COMEÇO
    { from: 6, pill: 'O COMEÇO', bg: ['#2a1405', '#8a4110'], trans: 'pan', acc: '#ffd24a',
      cam: { d: 6.6, h: 1.2, yaw: 20 },
      hdr: [{ num: '1949', sub: 'NASCE PERTO DE MEDELLÍN, COLÔMBIA', col: '#ffd24a', until: 1 }, { tag: 'CONTRABANDO E PEQUENOS GOLPES', at: 1, until: 2, tagc: '#ffd24a', tagf: '#2a1405' },
            { title: 'Um produto que *valia ouro*', box: true, hl: '#ffd24a', at: 2 }],
      objs: [{ k: 'skyline', o: { n: 9, col: '@2', lit: 0.4 }, z: -1.8, s: 0.9, type: 'none', label: 'MEDELLÍN', labelCol: '#ffd24a' },
             { id: 'pablo', k: 'man', o: { col: '#2a2a33', pose: 'parado' }, s: 0.55, x: -0.55 },
             { k: 'suitcase', o: { col: '#3a2a20' }, x: 0.2, s: 0.7, at: 1, until: 2, type: 'drop' },
             { make: caixa('EXPORTAÇÃO'), x: 0.3, s: 0.85, at: 2, type: 'drop' }] },
    // O IMPÉRIO
    { from: 9, pill: 'O IMPÉRIO', bg: ['#06221a', '#0f4d37'], trans: 'pan',
      cam: { d: 7.0, h: 1.5, yaw: -20 }, cam2: { d: 6.0, h: 0.9, yaw: 12 },
      hdr: [{ count: { from: 0, to: 80, suf: '%', dur: 1.6 }, sub: 'DA COCAÍNA DA COLÔMBIA PARA OS EUA', col: '#7dffb0', at: 1, until: 3 }, { tag: 'ESTIMATIVA', at: 1, until: 3 },
            { num: 'FORBES', sub: '7 ANOS NA LISTA DOS BILIONÁRIOS DO MUNDO', col: '#ffd24a', at: 3 }],
      objs: [{ k: 'globe', o: { col: '#3a6ad9' }, x: 0.45, z: -0.6, s: 1.0, until: 3 },
             { k: 'plane', x: -0.4, y: 0.6, s: 0.7, until: 3, upd: lt => ({ x: lt * 0.12, y: Math.sin(lt * 2) * 0.05 }) },
             { id: 'grana', make: grana(9, 1.15), at: 3, type: 'rise' }], fx: ['bills'] },
    // A MÁSCARA
    { from: 14, pill: 'A MÁSCARA', bg: ['#06174a', '#0f3a9a'], trans: 'up',
      cam: { d: 7.0, h: 2.6, ty: 0.3 }, cam2: { d: 6.4, h: 1.1, ty: 0.55, yaw: 10 },
      hdr: [{ chips: [['CASAS', '#3a4bff'], ['CAMPOS DE FUTEBOL', '#2f9e5a', 1]], until: 2 },
            { tag: 'SUPLENTE NO CONGRESSO · 1982', at: 2, until: 3 }, { stamp: 'A MÁSCARA CAIU', at: 3 }],
      objs: [{ k: 'field', o: { nx: 8, nz: 6, col: '@2', roof: '@1', lit: lt => lt / 3, litCol: '#e9e9ee', litRoof: '#ff8a5a' }, z: -0.3, type: 'none', until: 2 },
             { k: 'bank', o: { txt: 'CONGRESSO' }, s: 0.9, at: 2 }] },
    // A GUERRA
    { from: 18, pill: 'A GUERRA', bg: ['#2a0b18', '#6a1a2a'], trans: 'pan', acc: '#ff8f86',
      cam: { d: 6.6, h: 1.0, shake: 0.7 },
      hdr: [{ title: 'Guerra contra o *Estado*', box: true, hl: '#ff8f86', until: 1 }, { tag: 'RECOMPENSA POR POLICIAL MORTO', at: 1, until: 2, tagc: '#ff8f86', tagf: '#2a0b18' },
            { num: '110 MORTOS', sub: 'AVIÃO DA AVIANCA · 27/11/1989', col: '#ff8f86', at: 2, until: 3 },
            { num: 'MILHARES', sub: 'ESTIMATIVAS: DE 3 MIL A 5,5 MIL MORTES', col: '#ff8f86', at: 3 }],
      objs: [{ k: 'bank', o: { txt: 'ESTADO' }, s: 0.85, until: 2 },
             { k: 'sign', o: { txt: 'RECOMPENSA', col: 'red', y: 1.35 }, at: 1, until: 2, type: 'drop' },
             { k: 'plane', s: 0.9, x: -0.05, at: 2, until: 3 }, { k: 'xMark', s: 1.2, y: 0.25, at: 2, until: 3, sfx: 'stamp' },
             { k: 'crowd', o: { n: 10, cols: 5, col: '#5a4650' }, s: 0.5, z: -0.3, at: 3 }], fx: ['rain'] },
    // A QUEDA
    { from: 22, pill: 'A QUEDA', bg: ['#1f0b2e', '#4a1a62'], trans: 'zoom',
      cam: { d: 6.4, h: 1.1, yaw: 15 },
      hdr: [{ tag: 'PRISÃO CONSTRUÍDA POR ELE · 1991', until: 1 }, { tag: 'FUGA · 1992', at: 1, until: 2 },
            { num: '2/12/1993', sub: 'MORTO NUM TELHADO EM MEDELLÍN', col: '#e9e9ee', at: 2, until: 3 }, { num: '44 ANOS', sub: 'UM DIA DEPOIS DO ANIVERSÁRIO', at: 3 }],
      objs: [{ k: 'cage', s: 0.9, label: 'LA CATEDRAL', labelCol: '#e9e9ee', until: 2 },
             { id: 'pablo', k: 'man', o: { col: '#2a2a33', walk: true }, s: 0.55, until: 2, upd: (lt, T) => ({ x: Math.max(0, lt - 2.2) * 0.6 }) },
             { k: 'house', o: { col: '@1', roof: '#8a7f9a' }, s: 1.4, at: 2 }] },
    // A HERANÇA
    { from: 26, pill: 'A HERANÇA', bg: ['#06221f', '#0f5a55'], trans: 'pan',
      cam: { d: 6.6, h: 1.3, orbit: 4, yaw: -20 },
      hdr: [{ title: 'O crime *não compensou*', box: true, until: 1 }, { tag: 'ZOOLÓGICO PARTICULAR DELE', at: 1, until: 2 },
            { count: { from: 4, to: 200, pre: '+', dur: 1.8 }, sub: 'HIPOPÓTAMOS SOLTOS · CENSO DE 2023', col: '#7dffb0', at: 2 }],
      objs: [AGUA, { k: 'cashCrumble', o: { n: 7, h: 0.9, p: lt => lt / 1.8 }, until: 1, upd: lt => ({ s: 1 - Math.min(0.5, lt * 0.15) }) },
             { make: manada(1), at: 1, until: 2, s: 0.9 }, { make: manada(7), at: 2, s: 0.8, type: 'grow' }] },
    // COMENTA
    { from: 29, pill: 'COMENTA', bg: ['#0a1414', '#16302e'], trans: 'flash',
      cam: { d: 6.8, h: 1.2, orbit: 5 },
      hdr: [{ title: 'Você já sabia dessa história?', box: true, until: 1 }, { title: 'Quer aprender a fazer vídeos assim?', box: true, at: 1 }, { tag: 'COMENTA ESTÉREO', at: 2 }],
      objs: [AGUA, { make: manada(5), s: 0.8 }], fx: ['sparkle'] },
  ],
};
