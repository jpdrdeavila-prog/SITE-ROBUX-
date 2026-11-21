// "O Lula vai fazer o Brasil realmente andar?" · promessas × entregas · ~60 s · neutro (os dois lados)
// Fontes: TRE-SP/InfoMoney (eleição), Agência Gov (IR), InfoMoney (mínimo), B3/CNN (picanha),
// IBGE/CNN (desemprego), Copom: ata nº 282 no site do BC + Agência Brasil (Selic, confirmada), BC via Correio/Terra (dívida).

// estrada com faixas que correm (speed = velocidade do "Brasil")
const road = (speed) => L => {
  const g = L.group(L.box(9, 0.02, 1.3, '#26262e', { rd: 0, y: 0 }), L.box(9, 0.012, 0.04, '#e9e9ee', { rd: 0, y: 0.02, z: 0.6 }), L.box(9, 0.012, 0.04, '#e9e9ee', { rd: 0, y: 0.02, z: -0.6 }));
  const d = []; for (let i = 0; i < 14; i++) { const b = L.box(0.32, 0.012, 0.05, '#ffd24a', { rd: 0, y: 0.022, glow: 0.4 }); g.add(b); d.push(b); }
  g.userData.tick = (lt) => { const sp = typeof speed === 'function' ? speed(lt) : speed; d.forEach((b, i) => { b.position.x = ((i * 0.66 - lt * sp) % 9 + 9) % 9 - 4.5; }); };
  return g;
};
const ROAD = (speed) => ({ id: 'estrada', make: road(speed), morph: false, type: 'none', z: -0.15 });
const CAR = (extra = {}) => ({ id: 'brasil', k: 'car', o: { col: '#ffd24a' }, s: 1.15, label: 'BRASIL', labelCol: '#ffd24a', morph: false,
  upd: (lt) => ({ y: Math.abs(Math.sin(lt * 9)) * 0.008 }), ...extra });

// placar: IR, MÍNIMO, PICANHA, EMPREGO (verde = cumprida, amarelo = em parte)
const NOMES = ['IR', 'MÍNIMO', 'PICANHA', 'EMPREGO'], CORES = ['#2f9e5a', '#2f9e5a', '#c9a227', '#2f9e5a'];
const placar = (n, at) => ({ at, chips: NOMES.map((t, i) => (i < n - 1 ? [t, CORES[i]] : i === n - 1 ? [t, CORES[i], at] : [t, '#4a4d58'])) });

const picanha = L => { // peça de picanha: carne vermelha em formato de cunha + capa de gordura em cima, numa tábua
  const tabua = L.box(0.95, 0.06, 0.6, '#b07a46', { rd: 0.02 });
  const carne = L.box(0.7, 0.26, 0.42, '#b8342e', { y: 0.06, rd: 0.1 }); carne.rotation.z = 0.08;
  const gordura = L.box(0.72, 0.09, 0.44, '#f3e4d0', { y: 0.3, rd: 0.05 }); gordura.rotation.z = 0.08;
  const fatia = L.box(0.12, 0.3, 0.42, '#d9574f', { x: 0.42, y: 0.06, rd: 0.05 }); fatia.rotation.z = -0.25;
  return L.group(tabua, carne, gordura, fatia);
};

export default {
  tema: 'PROMESSAS × ENTREGAS',
  estilo: 'A',
  handle: '@ESTEREOLUDICO',
  cam: { d: 6.5 },
  segs: [
    'O Lula foi reeleito com *51,8%*',                    // 0
    'prometendo fazer o Brasil andar.',                   // 1
    'Mas o primeiro mandato andou?',                      // 2
    'Vem que eu te explico de forma estérea.',            // 3
    'Promessa um: *imposto zero* até 5 mil.',             // 4
    'Cumprida: vale desde janeiro,',                      // 5
    'pra cerca de *10 milhões* de pessoas.',              // 6
    'Promessa dois: mínimo acima da inflação.',           // 7
    'Subiu pra *R$ 1.621*,',                              // 8
    'uns *2,5%* acima da inflação.',                      // 9
    'Promessa três: a *picanha*.',                        // 10
    'Em 2025 ela ficou mais barata,',                     // 11
    'mas em 2026 voltou a subir.',                        // 12
    'Emprego: desemprego em *5,2%*,',                     // 13
    'o menor pra essa época desde 2012.',                 // 14
    'Agora, o outro lado:',                               // 15
    'os juros básicos estão em *13,75%*,',                // 16
    'e a dívida pública passou de *11 trilhões*.',        // 17
    'O governo diz que o país cresceu.',                  // 18
    'Os críticos dizem que foi às custas de mais dívida.',// 19
    'E você, sente o Brasil *andando*?',                  // 20
    'Quer aprender a fazer vídeos assim?',                // 21
    'Comenta *ESTÉREO*.',                                 // 22
  ],
  scenes: [
    // 1 · A REELEIÇÃO
    { from: 0, pill: 'A REELEIÇÃO', bg: ['#0a0a0c', '#24242c'],
      cam: { d: 7.8, h: 1.8, yaw: -28 }, cam2: { d: 6.2, h: 0.9, yaw: 8 },
      hdr: [{ count: { from: 0, to: 51.8, suf: '%', dec: 1, dur: 1.5 }, sub: 'VOTOS VÁLIDOS · 2º TURNO · TSE', col: '#ffd24a' }],
      objs: [ROAD(0), CAR({ type: 'drop' })] },
    { from: 2, pill: 'A REELEIÇÃO', bg: ['#0a0a0c', '#24242c'], trans: 'pop',
      cam: { d: 6.0, yaw: 18 },
      hdr: [{ title: 'O Brasil *andou*?', box: true, hl: '#ffd24a' }],
      objs: [ROAD(0), CAR(),
             { make: L => L.text({ txt: '?', h: 0.5, col: '#ffd24a' }), y: 0.75, upd: lt => ({ y: Math.sin(lt * 3) * 0.05 }) }],
      fx: ['sparkle'] },
    // 2 · O IMPOSTO
    { from: 4, pill: 'O IMPOSTO', bg: ['#06221a', '#0f4d37'], trans: 'pan',
      cam: { d: 6.4, yaw: -22, h: 1.1 },
      hdr: [{ tag: 'IR ZERO ATÉ R$ 5 MIL', tagc: '#7dffb0' }, placar(1, 1),
            { num: '~10 MI DE PESSOAS', sub: 'DEIXAM DE PAGAR · AGÊNCIA GOV · JAN/2026', at: 2, col: '#7dffb0' }],
      objs: [ROAD(1.6), CAR({ x: -0.35 }),
             { k: 'man', o: { pose: 'comemorando', col: '#e9e9ee' }, s: 0.55, x: 0.55, z: 0.75, at: 1 }],
      fx: ['bills'] },
    // 3 · O MÍNIMO
    { from: 7, pill: 'O MÍNIMO', bg: ['#06174a', '#0f3a9a'], trans: 'pan',
      cam: { d: 6.6, h: 2.0, ty: 0.5 }, cam2: { d: 6.0, h: 1.0 },
      hdr: [{ tag: 'MÍNIMO ACIMA DA INFLAÇÃO', until: 1 }, placar(2, 1),
            { num: 'R$ 1.621', sub: '+6,79% · JANEIRO DE 2026', at: 1, col: '#7dffb0', sfx: 'cash' },
            { tag: '≈ 2,5% ACIMA DA INFLAÇÃO', at: 2 }],
      objs: [ROAD(1.8), CAR({ x: -0.45, s: 0.95 }),
             { k: 'bars', o: { vals: [0.55, 0.62], cols: ['@1', '#5dff9e'], g: lt => lt / 1.6 }, x: 0.55, z: -0.9, at: 1, type: 'none', label: '2025 → 2026', labelCol: '#cfe0ff' }] },
    // 4 · A PICANHA
    { from: 10, pill: 'A PICANHA', bg: ['#2a1405', '#8a4110'], trans: 'pan', acc: '#ffd24a',
      cam: { d: 6.2, orbit: 4, yaw: -10 },
      hdr: [{ title: 'E a *picanha*?', box: true, until: 1 },
            { chips: [['2025: FICOU MAIS BARATA', '#2f9e5a'], ['2026: VOLTOU A SUBIR', '#c43b3b', 2]], at: 1 },
            { stamp: 'EM PARTE', stampc: '#ffd24a', at: 2 }, placar(3, 2)],
      objs: [ROAD(0.7), CAR({ x: -0.55, s: 0.85 }),
             { make: picanha, x: 0.42, z: 0.4, s: 0.85, yaw: -15, label: 'PICANHA', labelCol: '#ffd24a' },
             { k: 'lineChart', o: { vals: [0.7, 0.55, 0.45, 0.6, 0.85], col: '#ffd24a', g: lt => lt / 3.2 }, x: 0.2, z: -1.1, s: 0.75, at: 1, type: 'none' }] },
    // 5 · O EMPREGO
    { from: 13, pill: 'O EMPREGO', bg: ['#1f0b2e', '#4a1a62'], trans: 'up',
      cam: { d: 6.8, h: 1.3, yaw: 15 },
      hdr: [{ num: '5,2%', sub: 'DESEMPREGO · IBGE · TRIMESTRE ATÉ SET/2026', col: '#7dffb0' },
            { tag: 'MENOR PRA ESSA ÉPOCA DESDE 2012', at: 1 }, placar(4, 1)],
      objs: [ROAD(1.6), CAR({ x: -0.5, s: 0.85 }),
             { make: L => { const g = L.group(); for (let i = 0; i < 10; i++) { const m = L.man({ col: i === 7 ? '#8d92a6' : '#5dff9e', glow: i === 7 ? 0 : 0.25 }); m.position.set((i % 5 - 2) * 0.42, 0, -Math.floor(i / 5) * 0.5); g.add(m); } return g; },
               s: 0.46, x: 0.22, z: -1.0, at: 0 }] },
    // 6 · O OUTRO LADO
    { from: 15, pill: 'O OUTRO LADO', bg: ['#2a0b18', '#6a1a2a'], trans: 'pan', acc: '#ff8f86',
      cam: { d: 6.3, h: 0.9, shake: 0.6 },
      hdr: [{ tag: 'O OUTRO LADO', tagc: '#ff8f86', tagf: '#2a0b18' },
            { num: '13,75%', sub: 'SELIC (JUROS BÁSICOS) · COPOM · NOV/2026', col: '#ff8f86', at: 1, until: 2 },
            { num: 'R$ 11 TRI', sub: 'DÍVIDA PÚBLICA · 82,9% DO PIB · BC', col: '#ff8f86', at: 2 }],
      objs: [ROAD(0), CAR({ x: -0.4, upd: lt => ({ x: Math.sin(lt * 30) * 0.006 }) }),
             { k: 'cashBlock', o: { n: 4, h: 0.6, col: '#ff8f86', glow: 0.25 }, x: 0.45, z: -0.3, s: 0.7, at: 1, until: 2, label: 'JUROS', labelCol: '#ff8f86' },
             { k: 'cashBlock', o: { n: 4, h: 1.25, col: '#ff8f86', glow: 0.3 }, x: 0.45, z: -0.3, s: 0.7, at: 2, type: 'rise', label: 'DÍVIDA', labelCol: '#ff8f86' }],
      fx: ['rain'] },
    // 7 · OS DOIS LADOS
    { from: 18, pill: 'OS DOIS LADOS', bg: ['#16161a', '#3a3a44'], trans: 'zoom',
      cam: { d: 7.4, h: 1.1, ty: 0.75 }, cam2: { d: 6.9, yaw: 6 },
      hdr: [{ chips: [['O GOVERNO DIZ: CRESCEU', '#2f9e5a'], ['OS CRÍTICOS: COM MAIS DÍVIDA', '#c43b3b', 1]] }],
      objs: [{ make: L => { const c = L.car({ col: '#ffd24a' }); c.scale.setScalar(0.42); const d = L.cashBlock({ n: 4, h: 0.6, col: '#ff8f86', glow: 0.25 }); d.scale.setScalar(0.5);
               return L.scaleBal({ tilt: lt => Math.sin(lt * 1.3) * 0.13, left: c, right: d }); }, s: 1.0 }] },
    // 8 · COMENTA
    { from: 20, pill: 'COMENTA', bg: ['#06221a', '#0f4d37'], trans: 'flash',
      cam: { d: 6.6, h: 1.2, yaw: -15, orbit: 5 },
      hdr: [{ title: 'E você, sente o Brasil *andando*?', box: true, hl: '#ffd24a', until: 1 },
            { title: 'Quer aprender a fazer vídeos assim?', box: true, at: 1 }, { tag: 'COMENTA ESTÉREO', at: 2 }],
      objs: [ROAD(1.4), CAR()], fx: ['confetti'] },
  ],
};
