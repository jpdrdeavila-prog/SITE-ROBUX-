// "O robô do Musk carregando as malas: é real?" · ESTILO A (Mundo colorido) · formato boato ou fato
// Cena do vídeo viral RECRIADA em 3D (sem usar imagens de terceiros).
// Fontes: Sunday Guardian (vídeo do jato; autenticidade não confirmada; teleoperação em eventos anteriores),
// Fortune 2024 (Optimus teleoperados no evento We, Robot), X/Trending (vídeo do tapete vermelho apontado como IA),
// Wikipédia / IIoT World (venda ao público: meta fim de 2027; meta de preço US$ 20–30 mil em escala, não é preço oficial).

const robo = (o = {}) => L => {
  const g = L.person({ col: '#f4f4f6', pose: o.pose || 'parado', walk: !!o.walk });
  const visor = L.sph(0.108, '#111116', { y: 1.66 }); visor.scale.set(1.0, 0.78, 0.9); visor.position.z = 0.03; g.add(visor);
  g.add(L.box(0.3, 0.07, 0.19, '#1d1d22', { y: 0.96, rd: 0.02 }));
  if (o.malas) [-1, 1].forEach(s => { const m = L.suitcase({ col: '#26262c' }); m.scale.setScalar(0.85); m.position.set(s * 0.36, 0.5, 0.0); m.rotation.y = Math.PI / 2; g.add(m); });
  return g;
};
const musk = (o = {}) => L => { const g = L.person({ col: '#1d1d22', walk: !!o.walk }); g.add(L.sph(0.119, '#e9dccf', { y: 1.66 })); return g; };
const jato = L => {
  const m = '#eceef2', g = L.group();
  const fus = L.sph(0.42, m, { y: 0.95 }); fus.scale.set(4.2, 1, 1); g.add(fus);
  const wing = L.box(1.1, 0.05, 2.6, m, { x: 0.2, y: 0.75, rd: 0.02 }); g.add(wing);
  const tail = L.box(0.45, 0.6, 0.05, m, { x: 1.55, y: 1.15, rd: 0.02 }); tail.rotation.z = 0.45; g.add(tail);
  for (let i = 0; i < 6; i++) g.add(L.box(0.1, 0.12, 0.02, '#3a3d46', { x: -0.9 + i * 0.32, y: 1.0, z: 0.41, rd: 0.02 }));
  g.add(L.box(0.26, 0.5, 0.02, '#2a2c33', { x: -1.35, y: 0.75, z: 0.405, rd: 0.02 }));
  for (let i = 0; i < 5; i++) g.add(L.box(0.3, 0.04, 0.16, '#d9dbe2', { x: -1.35, y: 0.62 - i * 0.13, z: 0.5 + i * 0.13, rd: 0.01 }));
  [0.95, -1.2].forEach(x => g.add(L.cyl(0.08, 0.5, '#2a2a30', { x, z: 0.0 })));
  return g;
};
const ROBO_MALAS = { id: 'robo', make: robo({ walk: true, malas: true }), s: 0.62, label: 'ROBÔ OPTIMUS', labelCol: '#7dffb0' };

export default {
  estilo: 'A',
  tema: 'ROBÔ DO MUSK',
  handle: '@ESTEREOLUDICO',
  segs: [
    'Esse vídeo do robô do Elon Musk',                           // 0
    'carregando as malas dele tá *viralizando*.',                 // 1
    'Mas é *real*?',                                              // 2
    'Vem que eu te explico de forma estérea.',                    // 3
    'O robô é o *Optimus*, da Tesla:',                            // 4
    'um humanoide que o Musk promete',                            // 5
    'pra fazer tarefas que ninguém quer fazer.',                  // 6
    'Só que tem um detalhe:',                                     // 7
    'em eventos anteriores, os Optimus eram *controlados à distância*', // 8
    'por pessoas. Isso se chama teleoperação.',                   // 9
    'E nesse vídeo do jato,',                                     // 10
    'ninguém confirmou se ele andou sozinho, se tinha alguém controlando,', // 11
    'ou se a cena foi *editada*.',                                // 12
    'Tem até outro vídeo parecido, num tapete vermelho,',         // 13
    'que foi apontado como feito por *IA*.',                      // 14
    'E dá pra comprar um?',                                       // 15
    'Ainda não. A meta do Musk é vender no *fim de 2027*,',       // 16
    'por uns *20 a 30 mil dólares*. Mas isso é promessa.',        // 17
    'Traduzindo: o robô existe, o vídeo ainda é *dúvida*.',       // 18
    'Manda pra quem acreditou de primeira.',                      // 19
    'Comenta *ESTÉREO*.',                                         // 20
  ],
  scenes: [
    // O VÍDEO (cena recriada)
    { from: 0, pill: 'O VÍDEO', bg: ['#0a0a0c', '#2a2c33'],
      cam: { d: 7.6, h: 1.0, ty: 0.75, yaw: -20 }, cam2: { d: 6.2, h: 0.8, yaw: 4 },
      hdr: [{ tag: 'VIRALIZOU NAS REDES', until: 2 }, { title: 'Robô carregando as malas do *Musk*?', box: true, until: 2 },
            { title: 'Mas é *real*?', box: true, hl: '#ffd24a', at: 2 }],
      objs: [{ make: jato, x: -0.6, z: -1.6, s: 0.75, type: 'none' },
             { ...ROBO_MALAS, x: -0.4, z: 0.2, upd: lt => ({ x: lt * 0.03 }) },
             { make: musk({ walk: true }), x: 0.3, z: 0.5, s: 0.66, label: 'ELON MUSK', labelCol: '#fff', upd: lt => ({ x: lt * 0.03 }) }] },
    { from: 3, pill: 'O VÍDEO', bg: ['#0a0a0c', '#2a2c33'], trans: 'pop', cam: { d: 5.2, h: 0.7, ty: 0.75, yaw: 15 },
      hdr: [{ title: 'Vem que eu te *explico*', box: true }],
      objs: [{ ...ROBO_MALAS, upd: lt => ({ yaw: Math.sin(lt) * 10 }) }], fx: ['sparkle'] },
    // O OPTIMUS
    { from: 4, pill: 'O OPTIMUS', bg: ['#06174a', '#0f3a9a'], trans: 'pan', cam: { d: 5.6, h: 0.8, ty: 0.75, orbit: 8, yaw: -20 },
      hdr: [{ num: 'OPTIMUS', sub: 'ROBÔ HUMANOIDE DA TESLA', col: '#7dffb0', until: 2 }, { tag: 'TAREFAS QUE NINGUÉM QUER FAZER', at: 2 }],
      objs: [{ id: 'robo', make: robo({ pose: 'segurando' }), s: 0.75 }, { k: 'suitcase', x: 0.0, y: 0.95, z: 0.32, s: 0.5, at: 2, type: 'drop' }] },
    // O DETALHE: teleoperação
    { from: 7, pill: 'O DETALHE', bg: ['#1f0b2e', '#4a1a62'], trans: 'pan', cam: { d: 6.4, h: 1.0, ty: 0.7, yaw: 18 },
      hdr: [{ title: 'Só que tem *um detalhe*', box: true, until: 1 }, { num: 'TELEOPERAÇÃO', sub: 'UMA PESSOA CONTROLA À DISTÂNCIA', col: '#ff8af0', at: 1, until: 2 },
            { stamp: 'CONTROLADO À DISTÂNCIA', stampc: '#ff8af0', at: 2 }],
      objs: [{ id: 'robo', make: robo({ pose: 'aceno' }), x: 0.45, s: 0.6 },
             { make: L => { const g = L.person({ col: '#8d92a6', pose: 'segurando' }); return g; }, x: -0.55, z: -0.6, s: 0.55, at: 1, label: 'OPERADOR', labelCol: '#ff8af0' },
             { make: L => L.wire({ from: [-0.55, 0.85, -0.6], to: [0.45, 1.0, 0], sag: -0.25, col: '#ff8af0', prog: lt => lt / 1.2 }), at: 1, type: 'none' }] },
    // O VÍDEO DO JATO: 3 hipóteses
    { from: 10, pill: 'O VÍDEO DO JATO', bg: ['#2a0b18', '#6a1a2a'], trans: 'up', acc: '#ff8f86', cam: { d: 7.0, h: 1.1, ty: 0.7, yaw: -12 },
      hdr: [{ card: { head: '*3 hipóteses*', lines: ['1 · ANDOU SOZINHO?', '2 · ALGUÉM CONTROLANDO?', '3 · CENA EDITADA?'] }, until: 3 },
            { stamp: 'OUTRO VÍDEO: FEITO POR IA', stampc: '#ff5a5f', at: 3 }],
      objs: [{ make: jato, x: -0.5, z: -1.4, s: 0.65, type: 'none' }, { ...ROBO_MALAS, x: 0.2, z: 0.3 },
             { k: 'questionBox', x: 0.5, y: 1.3, z: 0.2, s: 0.55, at: 1, upd: lt => ({ yaw: Math.sin(lt * 2) * 10 }) }], fx: ['rain'] },
    // DÁ PRA COMPRAR?
    { from: 15, pill: 'DÁ PRA COMPRAR?', bg: ['#06221a', '#0f4d37'], trans: 'pan', cam: { d: 6.2, h: 1.0, ty: 0.7, yaw: 10 },
      hdr: [{ title: 'Dá pra *comprar* um?', box: true, until: 1 },
            { num: 'FIM DE 2027', sub: 'META DE VENDA AO PÚBLICO · MUSK', col: '#7dffb0', at: 1, until: 2 },
            { num: 'US$ 20 A 30 MIL', sub: 'META DE PREÇO · NÃO É PREÇO OFICIAL', col: '#7dffb0', at: 2 }],
      objs: [{ make: L => { const g = L.group(L.box(0.9, 1.5, 0.6, '#c9a46a', { rd: 0.03 })); const t = L.text({ txt: 'OPTIMUS', h: 0.12, col: '#3a2410' }); t.position.set(0, 0.9, 0.31); g.add(t); return g; }, x: -0.35, s: 0.8, label: 'AINDA NA CAIXA', labelCol: '#7dffb0' },
             { k: 'calendar', o: { txt: '2027', sub: 'FIM' }, x: 0.55, y: 0.3, s: 0.8, at: 1, type: 'drop' }, { k: 'coinStack', o: { n: 22 }, x: 0.55, z: 0.5, s: 0.9, at: 2 }], fx: ['coins'] },
    // TRADUZINDO
    { from: 18, pill: 'TRADUZINDO', bg: ['#06221f', '#0f5a55'], trans: 'pan', cam: { d: 5.6, h: 0.8, ty: 0.75, yaw: -8 },
      hdr: [{ title: 'O robô existe, o vídeo é *dúvida*', box: true }, { stamp: 'NÃO CONFIRMADO', stampc: '#ffd24a' }],
      objs: [{ id: 'robo', make: robo({ pose: 'pensando' }), x: -0.3, s: 0.7 }, { k: 'questionBox', x: 0.5, y: 0.6, s: 0.7 }] },
    // MANDA LÁ
    { from: 19, pill: 'MANDA LÁ', bg: ['#0a0a0c', '#1d2a22'], trans: 'flash', cam: { d: 6.0, h: 0.9, ty: 0.75, orbit: 6 },
      hdr: [{ title: 'Manda pra quem *acreditou* de primeira', box: true }, { share: true }, { handlePill: true, at: 1 }, { tag: 'COMENTA ESTÉREO', at: 1 }],
      objs: [{ id: 'robo', make: robo({ pose: 'aceno' }), s: 0.7 }], fx: ['confetti'] },
  ],
};
