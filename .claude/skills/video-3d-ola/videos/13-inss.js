// "Tem aposentado recebendo 13º agora?" · FORMATO 2 (boato ou fato) · palco único · fundo escuro + verde-lima
// Fontes: Correio da Manhã, InvestNews, Previdenciarista, DCI (nov/2026): 13º para benefícios concedidos a partir de maio/2026,
// pagos de 24/11 a 7/12 pelo final do benefício; proporcional aos meses; piso R$ 1.621 → R$ 135,08 por mês; consulta no Meu INSS.
// Cálculo próprio (marcado como ESTIMATIVA): maio a dezembro = 8 meses × R$ 135,08 ≈ R$ 1.080.
const ACC = '#b6ff3b', MESA = 0.78;

// calendário de parede: grade de dias; os dias de pagamento acendem um por um a partir da fala 8
const calendario = L => {
  const g = L.group(L.box(1.5, 1.15, 0.05, '#e9e9ee', { rd: 0.03, base: false }), L.box(1.5, 0.2, 0.06, '#3a3c44', { y: 0.5, rd: 0.02, base: false }));
  const t = L.text({ txt: 'NOV · DEZ', h: 0.09, col: '#f4f4f6' }); t.position.set(0, 0.46, 0.04); g.add(t);
  const tiles = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) { const b = L.box(0.17, 0.15, 0.02, '#c9ccd6', { x: -0.6 + c * 0.2, y: 0.28 - r * 0.18, z: 0.03, rd: 0.01, base: false }); g.add(b); tiles.push(b); }
  const pay = [21, 22, 23, 24, 25, 28, 29, 30, 31, 32]; // posições na grade que representam os dias de pagamento
  g.userData.tick = (t) => { const k = (t - SEGA(8)) / 2.2; pay.forEach((idx, i) => { const on = k * pay.length > i; const m = tiles[idx].material; m.color.set(on ? ACC : '#c9ccd6'); m.emissive.set(on ? ACC : '#000'); m.emissiveIntensity = on ? 0.5 : 0; }); };
  return g;
};
const envelope13 = L => { const g = L.envelope({ col: '#f1e7d0' }); const t = L.text({ txt: '13º', h: 0.12, col: '#2a2410' }); t.position.set(0, 0.1, 0.025); g.add(t); return g; };

const CAM = {
  geral:  { tx: -0.35, ty: 0.85, tz: -0.2, d: 7.4, h: 1.4, yaw: -12 },
  pessoa: { tx: -0.95, ty: 0.95, tz: 0.4, d: 3.4, h: 0.6, yaw: -10 },
  mesa:   { tx: 0.1, ty: 0.85, tz: 0.2, d: 3.3, h: 1.4, yaw: 10 },
  cal:    { tx: 0, ty: 1.45, tz: -1.6, d: 3.2, h: 0.1, yaw: 0 },
  calc:   { tx: 0.55, ty: 0.85, tz: 0.25, d: 2.3, h: 1.2, yaw: 18 },
  cel:    { tx: -0.35, ty: 0.98, tz: 0.3, d: 1.9, h: 0.45, yaw: -14 },
};

export default {
  tema: '13º DO INSS',
  estilo: 'C',
  handle: '@ESTEREOLUDICO',
  acc: ACC, dust: ACC,
  bg: ['#07080b', '#16181e'],
  fontes: 'INSS · CORREIO DA MANHÃ · INVESTNEWS',
  legenda: ['ENVELOPE = O 13º', 'CALENDÁRIO = DIAS DE PAGAMENTO'],
  fx: { bloom: 0.5, aperture: 0.0028, maxblur: 0.008 },
  trans: 'move',
  set: [
    { make: L => L.box(8, 3.4, 0.1, '#1d1f25', { rd: 0 }), z: -1.75 },
    { make: calendario, y: 1.55, z: -1.68, s: 0.72, id: 'cal', anchorY: 0.5 },
    { make: L => L.desk({ w: 1.9 }), id: 'mesa' },
    { k: 'phone', o: { txt: 'MEU INSS', screen: '#eaffd0' }, x: -0.35, y: MESA, z: 0.3, s: 0.36, yaw: 12, id: 'cel', anchorY: 0.8 },
    { k: 'calculator', x: 0.55, y: MESA, z: 0.25, s: 0.6, yaw: -16, id: 'calc' },
    { k: 'lamp', x: 0.8, y: MESA, z: -0.3, yaw: 200 },
    { k: 'cowBank', x: 0.15, y: MESA, z: -0.28, s: 0.38, yaw: -30 },
    { k: 'person', o: { glasses: true, col: '#e9e9ee' }, x: -1.05, z: 0.45, s: 0.68, yaw: 25, id: 'aposentada' },
    { k: 'filingCabinet', o: { n: 3 }, x: 1.7, z: -1.2, yaw: -15 },
  ],
  segs: [
    'Tem aposentado recebendo um *13º* agora em novembro.', // 0
    'É verdade ou é *boato*?',                             // 1
    'Vem que eu te explico de forma estérea.',             // 2
    'É verdade, mas não é pra todo mundo.',                // 3
    'Quem já recebia o benefício',                         // 4
    'ganhou o 13º *antecipado* em abril e maio.',          // 5
    'Agora é a vez de quem começou a receber',             // 6
    'a partir de *maio de 2026*.',                         // 7
    'O pagamento vai de *24 de novembro*',                 // 8
    'a *7 de dezembro*,',                                  // 9
    'pelo final do número do benefício.',                  // 10
    'E o valor é *proporcional*:',                         // 11
    'no piso de *R$ 1.621*,',                              // 12
    'são uns *R$ 135* por mês de benefício.',              // 13
    'Quem começou em maio recebe perto de *R$ 1.080*.',    // 14
    'Pra conferir, entra no *Meu INSS*,',                  // 15
    'no extrato do benefício.',                            // 16
    'E desconfie de quem liga pedindo seus dados.',        // 17
    'Manda pro grupo da família.',                         // 18
    'Comenta *ESTÉREO*.',                                  // 19
  ],
  scenes: [
    // O BOATO
    { from: 0, pill: 'O BOATO', cam: CAM.geral, cam2: { ...CAM.geral, d: 5.4, yaw: 8 },
      hdr: [{ bubble: 'TEM 13º EM NOVEMBRO?', hl: true, until: 1 }, { title: 'Verdade ou *boato*?', align: 'left', small: true, kicker: 'A PERGUNTA', at: 1 }],
      callouts: [{ target: 'aposentada', t: 'APOSENTADOS', s: 'BENEFÍCIO NOVO', dx: 60, dy: -120 }],
      objs: [{ k: 'spotlight', o: { r: 0.5 }, x: -1.05, z: 0.45, type: 'none' }] },
    { from: 2, pill: 'O BOATO', trans: 'pop', cam: CAM.pessoa,
      hdr: [{ title: 'Vem que eu te *explico*', align: 'left', small: true }],
      objs: [{ k: 'spotlight', o: { r: 0.5 }, x: -1.05, z: 0.45, type: 'none' }], fx: ['sparkle'] },
    // O VEREDITO
    { from: 3, pill: 'O VEREDITO', cam: CAM.mesa,
      hdr: [{ seal: 'CONFIRMADO', sub: 'MAS NÃO PRA TODO MUNDO', pos: 'mid', until: 1 },
            { title: 'Quem já recebia: *antecipado*', align: 'left', small: true, kicker: 'ABRIL E MAIO', at: 1 }],
      objs: [{ id: 'env', make: envelope13, x: 0.1, y: MESA, z: 0.3, s: 0.65, type: 'drop' }],
      callouts: [{ target: 'env', t: '13º ANTECIPADO', s: 'QUEM JÁ ERA APOSENTADO', dx: 50, dy: -130, at: 1 }] },
    // QUEM RECEBE
    { from: 6, pill: 'QUEM RECEBE', cam: { ...CAM.pessoa, yaw: 12, d: 3.0 },
      hdr: [{ title: 'Benefício que começou *a partir de maio*', align: 'left', small: true, kicker: 'QUEM RECEBE AGORA' }, { big: 'MAIO/2026', sub: 'EM DIANTE', at: 1 }],
      callouts: [{ target: 'aposentada', t: 'BENEFÍCIO NOVO', s: 'CONCEDIDO DESDE MAIO', dx: 60, dy: -140 }],
      objs: [{ k: 'halo', x: -1.05, y: 1.3, z: 0.45, s: 0.75, at: 1 }] },
    // QUANDO
    { from: 8, pill: 'QUANDO', cam: CAM.cal, cam2: { ...CAM.cal, d: 3.0 },
      hdr: [{ card: { head: '24/11 → 7/12', lines: ['PELO FINAL DO NÚMERO DO BENEFÍCIO', 'CONFIRA SUA DATA NO MEU INSS'] } }],
      callouts: [{ target: 'cal', off: [0.1, -0.25, 0.05], t: 'DIAS DE PAGAMENTO', s: '24/11 A 7/12', dx: 70, dy: 170, at: 1 }] },
    // QUANTO
    { from: 11, pill: 'QUANTO', cam: CAM.calc, cam2: { ...CAM.calc, d: 2.0, yaw: 8 },
      hdr: [{ title: 'O valor é *proporcional*', align: 'left', small: true, kicker: 'TRADUZINDO', until: 1 },
            { big: 'R$ 1.621', sub: 'PISO DO INSS · 2026', at: 1, until: 2 },
            { big: 'R$ 135', sub: 'POR MÊS DE BENEFÍCIO NO PISO', at: 2, until: 3, sfx: 'cash' },
            { big: 'R$ 1.080', count: { from: 0, to: 1080, pre: '≈ R$ ', dur: 1.4 }, sub: 'MAIO A DEZEMBRO · ESTIMATIVA', at: 3 },
            { sticker: '8 MESES × R$ 135', pos: 'mid', at: 3 }],
      callouts: [{ target: 'calc', t: '1.621 ÷ 12', s: '= R$ 135,08', dx: -60, dy: -130, at: 2 }],
      objs: [{ id: 'env', make: envelope13, x: 0.15, y: MESA, z: 0.35, s: 0.55, until: 3 },
             { id: 'env2', k: 'cashBlock', o: { n: 4, h: 0.32, col: ACC }, x: 0.15, y: MESA, z: 0.35, s: 0.6, at: 3, type: 'grow' }],
      fx: ['bills'] },
    // CONFERIR
    { from: 15, pill: 'CONFERIR', cam: CAM.cel, cam2: { ...CAM.cel, d: 1.6 },
      hdr: [{ title: 'Confere no *Meu INSS*', align: 'left', small: true, kicker: 'O QUE FAZER', until: 2 },
            { seal: 'GOLPE', sealc: '#d93c3c', sub: 'DESCONFIE DE LIGAÇÃO PEDINDO DADOS', pos: 'mid', at: 2 }],
      callouts: [{ target: 'cel', t: 'EXTRATO DO BENEFÍCIO', s: 'APP OU SITE MEU INSS', dx: 60, dy: -140, until: 2 }],
      objs: [{ k: 'padlock', x: -0.05, y: MESA, z: 0.45, s: 1.0, at: 2 }] },
    // MANDA LÁ
    { from: 18, pill: 'MANDA LÁ', trans: 'move', cam: { ...CAM.geral, d: 5.6, h: 1.6, yaw: 0, orbit: 4 },
      hdr: [{ title: 'Manda pro *grupo da família*', align: 'left', small: true }, { share: true }, { handlePill: true, at: 1 }, { tag: 'COMENTA ESTÉREO', at: 1 }],
      fx: ['confetti'] },
  ],
};
