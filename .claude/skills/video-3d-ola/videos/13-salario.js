// "13º salário: a 2ª parcela pode vir maior esse ano" · ESTILO B (Palco amarelo)
// Fontes: Fast Company Brasil, Valor Final, Ledware, ContaAzul (1ª parcela até 30/11 sem descontos = metade do salário;
// 2ª até 18/12 porque 20/12 é domingo; INSS e IR na 2ª parcela); Terra, Seu Crédito Digital (Lei 15.270/2025: isenção de IR até R$ 5 mil
// vale para o 13º, redução gradual até R$ 7.350). Exemplo de R$ 4 mil = ilustrativo.
const MESA = 0.78;

const calendario = L => {
  const g = L.group(L.box(1.9, 0.9, 0.05, '#25262c', { rd: 0.03, base: false }));
  const mk = (txt, x) => { const c = L.card({ txt, w: 0.78, h: 0.55, col: '#e9e9ee', ink: '#1d1d25' }); c.position.set(x, -0.3, 0.04); g.add(c); return c; };
  const a = mk('30/11\n1ª PARCELA', -0.45), b = mk('18/12\n2ª PARCELA', 0.45);
  g.userData.tick = (t) => [[a, SEGA(4)], [b, SEGA(8)]].forEach(([c, s]) => { const on = t > s; const m = c.children[0].material; m.color.set(on ? '#ffe14a' : '#e9e9ee'); m.emissive.set(on ? '#ffe14a' : '#000'); m.emissiveIntensity = on ? 0.4 : 0; });
  return g;
};
const holerite = L => { const g = L.receipt({ lines: 9, hl: 6, redacted: false, w: 0.55, h: 0.8 }); const t = L.text({ txt: 'HOLERITE', h: 0.06, col: '#1d1d25' }); t.rotation.x = -Math.PI / 2; t.position.set(0, 0.02, -0.35); g.add(t); return g; };
const envelope13 = L => { const g = L.envelope({ col: '#f1e7d0' }); const t = L.text({ txt: '13º', h: 0.12, col: '#2a2410' }); t.position.set(0, 0.1, 0.025); g.add(t); return g; };
// plaquinhas de desconto: INSS fica, IR encolhe depois da fala 13 (isenção até R$ 5 mil)
const placa = (txt, col, encolhe) => L => {
  const g = L.card({ txt, w: 0.32, h: 0.22, col, ink: '#fff', legs: false });
  if (encolhe) g.userData.tick = (t) => { const k = Math.max(0.25, 1 - Math.max(0, (t - SEGA(13)) / 0.8) * 0.75); g.scale.setScalar(k); };
  return g;
};

const CAM = {
  geral:    { tx: 0, ty: 0.95, tz: -0.4, d: 6.8, h: 1.6, yaw: -12 },
  cal:      { tx: 0, ty: 1.45, tz: -1.7, d: 5.4, h: 0.1, yaw: 0 },
  holerite: { tx: -0.2, ty: 0.85, tz: 0.15, d: 2.8, h: 1.6, yaw: -6 },
  env:      { tx: 0.45, ty: 0.9, tz: 0.2, d: 2.4, h: 0.8, yaw: 14 },
  placas:   { tx: 0.62, ty: 0.9, tz: -0.15, d: 2.4, h: 1.0, yaw: 16 },
  pessoa:   { tx: -1.1, ty: 0.9, tz: 0.5, d: 3.6, h: 0.6, yaw: -12 },
};

export default {
  estilo: 'B',
  tema: '13º SALÁRIO',
  handle: '@ESTEREOLUDICO',
  fontes: 'LEI 15.270/2025 · CLT · TERRA · VALOR FINAL',
  legenda: ['ENVELOPE = O 13º', 'PLACAS = DESCONTOS (INSS E IR)'],
  set: [
    { make: L => L.box(9, 3.4, 0.1, '#1d1f25', { rd: 0 }), z: -1.85 },
    { make: calendario, y: 1.6, z: -1.78, s: 0.72, id: 'cal', anchorY: 0.5 },
    { make: L => L.desk({ w: 1.9 }), id: 'mesa' },
    { make: holerite, x: -0.2, y: MESA, z: 0.15, yaw: 4, id: 'holerite' },
    { make: envelope13, x: 0.45, y: MESA, z: 0.25, s: 0.7, yaw: -10, id: 'env' },
    { k: 'calculator', x: -0.7, y: MESA, z: 0.2, s: 0.55, yaw: 15, id: 'calc' },
    { make: placa('INSS', '#3d7be0'), x: 0.45, y: MESA, z: -0.2, yaw: -12, id: 'inss' },
    { make: placa('IR', '#d93c3c', true), x: 0.8, y: MESA, z: -0.2, yaw: -18, id: 'ir' },
    { k: 'lamp', x: 0.85, y: MESA, z: -0.45, yaw: 200 },
    { k: 'person', o: { badge: true }, x: -1.15, z: 0.5, s: 0.68, yaw: 25, id: 'pessoa' },
  ],
  segs: [
    'Na segunda cai a primeira parcela do *13º*.',   // 0
    'E esse ano a segunda pode vir *maior*.',        // 1
    'Sabe por quê?',                                 // 2
    'Vem que eu te explico de forma estérea.',       // 3
    'A primeira parcela é paga até *30 de novembro*,', // 4
    'e vem *sem desconto nenhum*:',                  // 5
    'é metade do salário.',                          // 6
    'Quem ganha 4 mil recebe *2 mil* agora.',        // 7
    'A segunda vem até *18 de dezembro*,',           // 8
    'porque o dia 20 cai num domingo.',              // 9
    'E é nela que entram os descontos:',             // 10
    '*INSS* e Imposto de Renda.',                    // 11
    'Só que em 2026 mudou uma coisa:',               // 12
    'quem ganha até *5 mil* não paga mais IR,',      // 13
    'e isso vale também pro 13º.',                   // 14
    'Até 7.350, o desconto fica *menor*.',           // 15
    'Traduzindo: o INSS continua, o leão diminuiu.', // 16
    'Confere no holerite de dezembro.',              // 17
    'Manda pra quem tá esperando o 13º.',            // 18
    'Comenta *ESTÉREO*.',                            // 19
  ],
  scenes: [
    { from: 0, pill: 'O 13º', cam: CAM.geral, cam2: { ...CAM.geral, d: 5.6, yaw: 6 },
      hdr: [{ title: 'A 1ª parcela cai *segunda*', align: 'left', small: true, until: 1 },
            { title: 'E a 2ª pode vir *maior*', align: 'left', small: true, kicker: 'A NOVIDADE', at: 1 }],
      callouts: [{ target: 'env', t: '13º SALÁRIO', s: 'EM 2 PARCELAS', dx: 50, dy: -130 }, { target: 'ir', t: 'MUDOU EM 2026', s: '?', dx: 40, dy: -110, at: 2 }] },
    { from: 3, pill: 'O 13º', cam: CAM.pessoa, cam2: { ...CAM.pessoa, d: 3.2 },
      hdr: [{ title: 'Vem que eu te *explico*', align: 'left', small: true }] },
    { from: 4, pill: 'A 1ª PARCELA', cam: CAM.cal, cam2: { ...CAM.cal, d: 4.9 },
      hdr: [{ title: 'Até *30 de novembro*', align: 'left', small: true, kicker: 'A 1ª PARCELA' },
            { sticker: 'SEM DESCONTO NENHUM', pos: 'mid', at: 1 }] },
    { from: 6, pill: 'A 1ª PARCELA', cam: CAM.env, cam2: { ...CAM.env, d: 2.1, yaw: 4 },
      hdr: [{ title: 'Metade do *salário*', align: 'left', small: true, kicker: 'QUANTO' },
            { big: 'R$ 2 MIL', sub: 'PRA QUEM GANHA R$ 4 MIL · ANO TODO · EXEMPLO', at: 1, sfx: 'cash' }],
      callouts: [{ target: 'env', t: '1ª PARCELA', s: '50% DO SALÁRIO', dx: -60, dy: -130 }],
      objs: [{ k: 'coinStack', o: { n: 14, r: 0.1 }, x: 0.15, y: MESA, z: 0.35, at: 1, type: 'drop' }] },
    { from: 8, pill: 'A 2ª PARCELA', cam: CAM.cal, cam2: { ...CAM.cal, d: 4.9, yaw: 4 },
      hdr: [{ title: 'Até *18 de dezembro*', align: 'left', small: true, kicker: 'A 2ª PARCELA' },
            { sticker: 'DIA 20 É DOMINGO', pos: 'mid', at: 1 }] },
    { from: 10, pill: 'OS DESCONTOS', cam: CAM.placas, cam2: { ...CAM.placas, d: 2.0 },
      hdr: [{ title: 'Os descontos vêm *na 2ª*', align: 'left', small: true, kicker: 'ATENÇÃO' }],
      callouts: [{ target: 'inss', t: 'INSS', s: 'DESCONTA NA 2ª PARCELA', dx: -50, dy: -130, at: 1 },
                 { target: 'ir', t: 'IMPOSTO DE RENDA', s: 'DESCONTA NA 2ª PARCELA', dx: 30, dy: -170, at: 1 }] },
    { from: 12, pill: 'A MUDANÇA', cam: { ...CAM.placas, d: 2.6, yaw: 24 },
      hdr: [{ title: 'Até *R$ 5 mil*: IR zero', align: 'left', small: true, kicker: 'LEI 15.270/2025', until: 2 },
            { title: 'Vale também *pro 13º*', align: 'left', small: true, kicker: 'A NOVIDADE', at: 2, until: 3 },
            { card: { head: 'Até *R$ 7.350*', lines: ['DESCONTO DE IR MENOR', 'ACIMA DISSO: REGRA ANTIGA'] }, at: 3 }],
      callouts: [{ target: 'ir', t: 'IR ENCOLHEU', s: 'ATÉ R$ 5 MIL: ZERO', dx: -60, dy: -140, at: 1 }], fx: ['sparkle'] },
    { from: 16, pill: 'TRADUZINDO', cam: CAM.holerite, cam2: { ...CAM.holerite, d: 2.4 },
      hdr: [{ title: 'O INSS continua, *o leão diminuiu*', align: 'left', small: true, kicker: 'TRADUZINDO' }],
      callouts: [{ target: 'holerite', t: 'HOLERITE DE DEZEMBRO', s: 'CONFIRA A LINHA DO IR', dx: 50, dy: -150, at: 1 }] },
    { from: 18, pill: 'MANDA LÁ', cam: { ...CAM.geral, d: 5.8, h: 1.6, yaw: 0, orbit: 4 },
      hdr: [{ title: 'Quem tá *esperando o 13º*?', align: 'left', small: true }, { share: true }, { handlePill: true, at: 1 }, { tag: 'COMENTA ESTÉREO', at: 1 }],
      fx: ['coins'] },
  ],
};
