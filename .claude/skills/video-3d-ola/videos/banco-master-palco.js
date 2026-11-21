// "Quem pagou a conta do Banco Master?" · ESTILO B (palco único) · ~93 s · neutro ("ser citado não é ser acusado")
// Mesmas falas de banco-master.js (a narração do ElevenLabs serve para os dois).
// Fontes: Forbes/B3 (liquidação 18/11/2025 e prisão), Valor via Diário do Comércio (maior intervenção),
// Suno (FGC ~R$ 40 bi; Master R$ 28,8 bi a 570 mil credores), Agência Brasil (teto R$ 250 mil),
// Jornal Opção/Revista Fórum/WSCOM (10 relatórios, 4 à PGR, 6 arquivados, 15 dias), UOL via Jornal Opção (Mendonça).
const MESA = 0.78;

// pasta de relatório
const pasta = (L, col) => {
  const g = L.group(L.box(0.5, 0.64, 0.05, col, { rd: 0.02 }), L.box(0.2, 0.06, 0.05, col, { x: -0.13, y: 0.64, rd: 0.02 }));
  for (let i = 0; i < 4; i++) g.add(L.box(0.3, 0.03, 0.005, '#8a7f66', { y: 0.45 - i * 0.08, z: 0.028, rd: 0 }));
  return g;
};
// 10 relatórios na mesa: depois de SEGA(19) 6 ficam cinzas (arquivados) e depois de SEGA(20) 4 ficam amarelos (PGR)
const relatorios = L => {
  const g = L.group(), ps = [];
  for (let i = 0; i < 10; i++) { const p = pasta(L, '#efe6cf'); p.position.set((i % 5 - 2) * 0.58, 0, -Math.floor(i / 5) * 0.7); p.rotation.y = (i % 3 - 1) * 0.1; g.add(p); ps.push(p); }
  g.userData.tick = (t) => ps.forEach((p, i) => {
    const amarelo = i < 4 && t > SEGA(20), cinza = i >= 4 && t > SEGA(19);
    p.children.forEach((c, j) => { if (j < 2) c.material.color.set(amarelo ? '#ffe14a' : cinza ? '#5d6069' : '#efe6cf'); if (j < 2) c.material.emissive.set(amarelo ? '#ffe14a' : '#000'); if (j < 2) c.material.emissiveIntensity = amarelo ? 0.35 : 0; });
    p.position.y = amarelo ? Math.min(0.12, (t - SEGA(20)) * 0.3) : cinza ? -Math.min(0.06, (t - SEGA(19)) * 0.2) : 0;
  });
  return g;
};
// plenário: 11 cadeiras em arco num tablado
const plenario = L => {
  const g = L.group(L.box(3.4, 0.18, 1.5, '#2a2c33', { rd: 0.02, z: -0.2 }));
  for (let i = 0; i < 11; i++) { const a = (i / 10 - 0.5) * 2.2, c = L.group(L.box(0.24, 0.22, 0.22, '#3d4a6b', { rd: 0.04 }), L.box(0.24, 0.36, 0.06, '#3d4a6b', { y: 0.22, z: -0.1, rd: 0.03 }));
    c.position.set(Math.sin(a) * 1.35, 0.18, -Math.cos(a) * 0.75 + 0.2); c.rotation.y = -a; g.add(c); }
  const t = L.text({ txt: 'STF', h: 0.22, col: '#8a8f99' }); t.position.set(0, 1.0, -0.9); g.add(t);
  return g;
};
const celular = L => {
  const g = L.phone({ screen: '#e9fff2' });
  [0.5, 0.36, 0.22, 0.08].forEach((y, i) => g.add(L.box(i % 2 ? 0.2 : 0.26, 0.07, 0.01, i % 2 ? '#ffe14a' : '#cfd2dc', { x: i % 2 ? 0.05 : -0.03, y, z: 0.035, rd: 0.02, glow: i % 2 ? 0.5 : 0 })));
  g.userData.tick = (t) => { g.rotation.y = Math.sin(t * 0.8) * 0.15; };
  return g;
};

// câmeras (pontos do palco)
const CAM = {
  geral:   { tx: 0, ty: 0.8, tz: -0.9, d: 7.6, h: 2.6, yaw: -16 },
  calc:    { tx: 0.62, ty: 0.85, tz: 0.15, d: 2.3, h: 1.2, yaw: 18 },
  banco:   { tx: -2.45, ty: 0.65, tz: 0.1, d: 6.8, h: 1.5, yaw: -8 },
  cofre:   { tx: 2.45, ty: 0.55, tz: -0.2, d: 4.8, h: 1.0, yaw: 18 },
  fila:    { tx: 2.3, ty: 0.55, tz: 0.6, d: 5.8, h: 1.3, yaw: 8 },
  celular: { tx: -0.62, ty: 0.98, tz: 0.15, d: 2.0, h: 0.5, yaw: -16 },
  pastas:  { tx: 0.05, ty: 0.9, tz: -0.4, d: 2.6, h: 1.5, yaw: 4 },
  stf:     { tx: 0, ty: 0.55, tz: -3.2, d: 4.4, h: 1.3, yaw: 0 },
  cadeado: { tx: -0.05, ty: 0.85, tz: 0.35, d: 1.9, h: 0.9, yaw: -10 },
};

export default {
  tema: 'CASO BANCO MASTER',
  estilo: 'B',
  handle: '@ESTEREOLUDICO',
  acc: '#ffe14a',
  bg: ['#0b0b0d', '#1f2026'],
  dust: '#ffe14a',
  fontes: 'BC · FGC · PF · STF · AGÊNCIA BRASIL',
  legenda: ['BANCO = O MASTER', 'COFRE = FGC (O SEGURO)', 'PASTAS = RELATÓRIOS DA PF'],
  fx: { bloom: 0.45, aperture: 0.003, maxblur: 0.009 },
  trans: 'move',
  set: [
    { make: L => L.box(9, 3.4, 0.1, '#25262c', { rd: 0 }), z: -4.3 },
    { make: plenario, z: -3.0, id: 'stf', anchorY: 0.6 },
    { k: 'filingCabinet', o: { n: 4 }, x: -3.9, z: -2.6, yaw: 20 },
    { k: 'filingCabinet', o: { n: 4 }, x: 3.9, z: -2.6, yaw: -20 },
    { make: L => L.desk({ w: 2.0 }), id: 'mesa' },
    { make: celular, x: -0.62, y: MESA, z: 0.15, s: 0.38, id: 'celular' },
    { k: 'calculator', x: 0.62, y: MESA, z: 0.2, s: 0.65, yaw: -14, id: 'calc' },
    { make: relatorios, x: 0.05, y: MESA, z: -0.15, s: 0.3, id: 'pastas', anchorY: 1 },
    { k: 'padlock', o: { open: t => (t - SEGA(25)) / 0.6 }, x: -0.1, y: MESA, z: 0.38, s: 1.1, id: 'cadeado' },
    { k: 'calendar', o: { txt: '15', sub: 'DIAS' }, x: 0.22, y: MESA, z: 0.38, s: 0.3, yaw: -10, id: 'calendario' },
    { k: 'lamp', x: 0.85, y: MESA, z: -0.35, yaw: 200 },
    { k: 'bank', o: { txt: 'BANCO MASTER', col: '#b9bcc4' }, x: -2.7, z: -0.5, s: 0.95, yaw: 12, id: 'banco', anchorY: 0.95 },
    { k: 'safe', o: { open: t => (t - SEGA(8) - 0.3) / 1.0 }, x: 2.7, z: -0.5, yaw: -22, id: 'cofre', anchorY: 0.7 },
  ],
  segs: [
    'Um banco quebrou e deixou uma conta de *40 bilhões* de reais.', // 0
    'E agora, essa história chegou ao *Supremo*.',                // 1
    'Quem pagou essa conta?',                                     // 2
    'Vem que eu te explico de forma estérea.',                    // 3
    'Em novembro de 2025, o Banco Central',                       // 4
    'fechou o *Banco Master*, do banqueiro Daniel Vorcaro.',      // 5
    'No mesmo dia, ele foi preso pela Polícia Federal.',          // 6
    'Foi a maior intervenção bancária da história do país.',      // 7
    'Quem tinha dinheiro lá foi salvo pelo *FGC*,',               // 8
    'o seguro que devolve até *R$ 250 mil* por CPF.',             // 9
    'Até agora, cerca de *40 bilhões* já foram pagos.',           // 10
    'Só no Master, mais de *570 mil* pessoas receberam.',         // 11
    'E quem banca o FGC? Os próprios bancos.',                    // 12
    'Mas quem tinha mais de *250 mil*',                           // 13
    'entrou numa fila pra tentar receber o resto.',               // 14
    'Agora, a parte que chegou a Brasília:',                      // 15
    'a Polícia Federal achou nomes de ministros do STF',          // 16
    'nas mensagens do celular de Vorcaro.',                       // 17
    'Foram *10 relatórios*.',                                     // 18
    'O presidente do STF, Edson Fachin, arquivou *6*',            // 19
    'e mandou *4* para a Procuradoria-Geral da República.',       // 20
    'Eles citam Moraes, Toffoli, Kassio Nunes Marques e André Mendonça.', // 21
    'Atenção: ser citado *não é* ser acusado.',                   // 22
    'A Procuradoria tem *15 dias* pra decidir',                   // 23
    'se pede ou não uma investigação.',                           // 24
    'Mendonça já pediu que o relatório sobre ele seja público.',  // 25
    'O dinheiro dos clientes já voltou, quase todo.',             // 26
    'A pergunta que falta é: quem vai responder pelo *rombo*?',   // 27
    'E você, confia no seu banco?',                               // 28
    'Quer aprender a fazer vídeos assim?',                        // 29
    'Comenta *ESTÉREO*.',                                         // 30
  ],
  scenes: [
    // GANCHO: plano geral, a câmera viaja do banco até o plenário
    { from: 0, pill: 'A CONTA', cam: CAM.geral, cam2: { ...CAM.geral, tz: -1.8, d: 6.0, h: 2.0, yaw: 10 },
      hdr: [{ title: 'A conta de um banco que *quebrou*', align: 'left', small: true, until: 1 },
            { title: 'Chegou ao *Supremo*', align: 'left', small: true, at: 1 },
            { big: 'R$ 40 BI', count: { from: 0, to: 40, pre: 'R$ ', suf: ' BI', dur: 1.6 }, sub: 'PAGOS PELO FGC · GRUPO MASTER', until: 1 }],
      callouts: [{ target: 'banco', t: 'BANCO MASTER', s: 'LIQUIDADO EM 2025', dx: 30, dy: -120 },
                 { target: 'cofre', t: 'FGC', s: 'O SEGURO DOS DEPÓSITOS', dx: -40, dy: -130 },
                 { target: 'stf', t: 'STF', s: 'ONDE O CASO CHEGOU', dx: 60, dy: -110, at: 1 }] },
    { from: 2, pill: 'A PERGUNTA', cam: CAM.calc,
      hdr: [{ title: 'Quem pagou *a conta*?', align: 'left', small: true, kicker: 'A PERGUNTA' }],
      callouts: [{ target: 'calc', t: '40 BILHÕES', s: 'QUEM PAGOU?', dx: -50, dy: -130 }] },
    // A QUEBRA
    { from: 4, pill: 'A QUEBRA', cam: CAM.banco, cam2: { ...CAM.banco, d: 6.2, yaw: 2 },
      hdr: [{ title: 'O Banco Central *fecha* o banco', align: 'left', small: true, kicker: '18/11/2025' },
            { sticker: 'MAIOR INTERVENÇÃO DA HISTÓRIA', pos: 'mid', at: 3 }],
      callouts: [{ target: 'banco', t: 'LIQUIDAÇÃO', s: 'BANCO CENTRAL · 18/11/2025', dx: 40, dy: -120, until: 2 },
                 { target: 'vorcaro', t: 'DANIEL VORCARO', s: 'PRESO PELA PF NO MESMO DIA', dx: 50, dy: -150, at: 2 }],
      objs: [{ k: 'xMark', x: -2.7, y: 0.4, z: 0.1, s: 1.0, at: 1, until: 2, sfx: 'stamp' },
             { k: 'cage', x: -2.1, z: 0.75, s: 0.6, at: 2, type: 'drop' },
             { id: 'vorcaro', k: 'person', o: { suit: '#1d1d25' }, x: -2.1, z: 0.75, s: 0.42, at: 2 }] },
    // O SEGURO
    { from: 8, pill: 'O SEGURO', cam: CAM.cofre, cam2: { ...CAM.cofre, d: 4.2, yaw: 8 },
      hdr: [{ title: 'Quem tinha dinheiro foi *salvo*', align: 'left', small: true, kicker: 'O FGC' },
            { big: 'ATÉ R$ 250 MIL', sub: 'POR CPF · AGÊNCIA BRASIL', at: 1, until: 2 },
            { big: '≈ R$ 40 BI', count: { from: 0, to: 40, pre: '≈ R$ ', suf: ' BI', dur: 1.5 }, sub: 'JÁ PAGOS · FGC · GRUPO MASTER', at: 2, until: 3, sfx: 'cash' },
            { big: '+570 MIL', count: { from: 0, to: 570, pre: '+', suf: ' MIL', dur: 1.5 }, sub: 'PESSOAS PAGAS · SÓ O BANCO MASTER', at: 3 }],
      callouts: [{ target: 'cofre', t: 'FGC', s: 'FUNDO GARANTIDOR DE CRÉDITOS', dx: -60, dy: -150 }],
      objs: [{ k: 'crowd', o: { n: 8, cols: 4, col: '#cfd2dc', hi: 1, hiCol: '#ffe14a' }, x: 1.5, z: 0.5, s: 0.3, at: 3 }], fx: ['bills'] },
    // QUEM BANCA
    { from: 12, pill: 'QUEM BANCA', cam: CAM.fila,
      hdr: [{ title: 'Quem banca o FGC? *Os bancos*', align: 'left', small: true, until: 1 },
            { title: 'Acima de 250 mil: *fila*', align: 'left', small: true, kicker: 'TRADUZINDO', at: 1 },
            { sticker: 'FILA DA MASSA FALIDA', pos: 'mid', at: 2 }],
      objs: [{ make: L => { const g = L.group(); [-0.8, 0, 0.8].forEach((x, i) => { const b = L.bank({ txt: 'BANCO', col: '#b9bcc4' }); b.scale.setScalar(0.32); b.position.set(x, 0, -(i % 2) * 0.3); g.add(b); }); return g; }, x: 2.2, z: 1.4, until: 1 },
             { k: 'crowd', o: { n: 6, cols: 6, gap: 0.42, col: '#8d92a6', pose: 'parado' }, x: 2.0, z: 1.1, s: 0.32, at: 1, upd: lt => ({ x: -Math.min(0.15, lt * 0.03) }) }],
      callouts: [{ target: 'cofre', t: 'LIMITE', s: 'R$ 250 MIL POR CPF', dx: -60, dy: -120, at: 1 }] },
    // BRASÍLIA
    { from: 15, pill: 'BRASÍLIA', cam: CAM.celular, cam2: { ...CAM.celular, d: 1.7 },
      hdr: [{ title: 'A parte que chegou a *Brasília*', align: 'left', small: true, until: 3 },
            { title: '*10* relatórios da PF', align: 'left', small: true, kicker: 'O NÚMERO', at: 3 }],
      callouts: [{ target: 'celular', t: 'CELULAR DE VORCARO', s: 'MENSAGENS APREENDIDAS', dx: 60, dy: -140, at: 1 }] },
    { from: 18, pill: 'BRASÍLIA', cam: CAM.pastas, trans: 'move',
      hdr: [{ big: '10 RELATÓRIOS', sub: 'POLÍCIA FEDERAL' }],
      callouts: [{ target: 'pastas', t: 'MENÇÕES A MINISTROS', s: 'NAS MENSAGENS', dx: 40, dy: -150 }] },
    // O STF
    { from: 19, pill: 'O STF', cam: CAM.stf, cam2: { ...CAM.stf, d: 3.8, yaw: 8 },
      hdr: [{ chips: [['6 ARQUIVADOS', '#5d6069'], ['4 PARA A PGR', '#b8960c', 1]] },
            { card: { head: '4 relatórios na *PGR*', lines: ['ALEXANDRE DE MORAES', 'DIAS TOFFOLI', 'KASSIO NUNES MARQUES', 'ANDRÉ MENDONÇA'] }, at: 2 }],
      callouts: [{ target: 'stf', t: 'EDSON FACHIN', s: 'PRESIDENTE DO STF', dx: 50, dy: -120 }] },
    // ATENÇÃO
    { from: 22, pill: 'ATENÇÃO', cam: CAM.cadeado, cam2: { ...CAM.cadeado, yaw: 10 },
      hdr: [{ title: 'Ser citado *não é* ser acusado', align: 'left', small: true, kicker: 'ATENÇÃO' },
            { big: '15 DIAS', sub: 'PRAZO DA PGR PARA DECIDIR', at: 1, until: 3 },
            { sticker: 'MENDONÇA PEDIU RELATÓRIO PÚBLICO', pos: 'mid', at: 3 }],
      callouts: [{ target: 'calendario', t: 'PRAZO', s: 'PEDE OU NÃO INVESTIGAÇÃO', dx: 50, dy: -130, at: 1 },
                 { target: 'cadeado', t: 'SIGILO', s: 'RELATÓRIOS FECHADOS', dx: -50, dy: -120, until: 3 }] },
    // A PERGUNTA
    { from: 26, pill: 'A PERGUNTA', cam: { ...CAM.geral, d: 6.6, yaw: 12 }, cam2: { ...CAM.geral, d: 7.4, yaw: -8 },
      hdr: [{ title: 'O dinheiro dos clientes *voltou*', align: 'left', small: true, until: 1 },
            { title: 'Quem vai responder pelo *rombo*?', align: 'left', small: true, kicker: 'A PERGUNTA', at: 1 }],
      callouts: [{ target: 'cofre', t: 'CLIENTES', s: 'QUASE TODOS PAGOS', dx: -60, dy: -110, until: 1 },
                 { target: 'banco', t: 'O ROMBO', s: 'QUEM RESPONDE?', dx: 40, dy: -110, at: 1 }] },
    // MANDA LÁ
    { from: 28, pill: 'MANDA LÁ', cam: { ...CAM.geral, tz: -0.4, d: 5.6, h: 1.8, yaw: 0 },
      hdr: [{ title: 'E você, *confia* no seu banco?', align: 'left', small: true },
            { share: true, at: 1 }, { handlePill: true, at: 2 }] },
  ],
};
