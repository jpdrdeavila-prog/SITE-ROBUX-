// "Vender imóvel vai exigir nota fiscal em dezembro?" · ESTILO C (Neon lima) · formato "E na sua vida?" com abertura de checagem
// Fontes: Ato Conjunto RFB/CGIBS nº 7/2026 (DOU 13/11/2026) via Fenacon, GSGA, Paggo, Grupo Assessor (NF-e ABI modelo 77: 1º/12/2026 → 1º/03/2027);
// Contmatic / Radar da Reforma (quem emite); LC 214/2025 art. 251 via Migalhas, Trade Cavalcanti, Barbieri (gatilhos da pessoa física).
const MESA = 0.78, LIMA = '#b6ff3b';

// calendário de parede: "1º DEZ 2026" (riscado) → "1º MAR 2027" (aceso) a partir da fala 5
const calendario = L => {
  const g = L.group(L.box(1.9, 0.9, 0.05, '#1f2128', { rd: 0.03, base: false }));
  const mk = (txt, x) => { const c = L.card({ txt, w: 0.75, h: 0.55, col: '#e9e9ee', ink: '#1d1d25' }); c.position.set(x, -0.3, 0.04); g.add(c); return c; };
  const dez = mk('1º DEZ\n2026', -0.45), mar = mk('1º MAR\n2027', 0.45);
  const risco = L.box(0.85, 0.05, 0.02, '#ff5a5f', { base: false, glow: 0.6 }); risco.position.set(-0.45, 0, 0.08); risco.rotation.z = -0.5; g.add(risco);
  g.userData.tick = (t) => { const k = Math.min(1, Math.max(0, (t - SEGA(5)) / 0.5)); risco.scale.x = Math.max(0.001, k);
    mar.children[0].material.color.set(k > 0.5 ? LIMA : '#e9e9ee'); mar.children[0].material.emissive.set(k > 0.5 ? LIMA : '#000'); mar.children[0].material.emissiveIntensity = k > 0.5 ? 0.45 : 0; };
  return g;
};
// 4 casinhas em fila: a 4ª acende (gatilho: mais de 3 vendas no ano)
const casas = L => {
  const g = L.group(), hs = [];
  for (let i = 0; i < 4; i++) { const h = L.house({ col: '#e9e9ee', roof: '#8d92a6', w: 0.5, h: 0.4 }); h.position.set((i - 1.5) * 0.62, 0, 0); g.add(h); hs.push(h); }
  g.userData.tick = (t) => { const on = t > SEGA(13) + 1.0; const roof = hs[3].children[1].material; roof.color.set(on ? LIMA : '#8d92a6'); roof.emissive.set(on ? LIMA : '#000'); roof.emissiveIntensity = on ? 0.6 : 0;
    hs.forEach((h, i) => { h.position.y = t > SEGA(13) ? Math.max(0, Math.sin(Math.min(1, (t - SEGA(13) - i * 0.25) / 0.3) * Math.PI) * 0.12) : 0; }); };
  return g;
};
const nota = L => { const g = L.receipt({ lines: 8, hl: 2, redacted: false, w: 0.5, h: 0.72 }); const t = L.text({ txt: 'NOTA FISCAL', h: 0.06, col: '#1d1d25' }); t.rotation.x = -Math.PI / 2; t.position.set(0, 0.02, -0.31); g.add(t); return g; };
const matricula = L => { const g = L.doc({ lines: 6 }); const t = L.text({ txt: 'MATRÍCULA', h: 0.05, col: '#1d1d25' }); t.position.set(0, 0.47, 0.012); g.add(t); return g; };

const CAM = {
  geral:  { tx: 0, ty: 0.9, tz: -0.3, d: 7.4, h: 1.6, yaw: -10 },
  cel:    { tx: -0.6, ty: 0.98, tz: 0.2, d: 2.0, h: 0.4, yaw: -12 },
  nota:   { tx: 0.25, ty: 0.85, tz: 0.1, d: 3.2, h: 1.7, yaw: 8 },
  cal:    { tx: 0, ty: 1.45, tz: -1.7, d: 4.4, h: 0.1, yaw: 0 },
  obras:  { tx: 2.4, ty: 0.7, tz: -0.4, d: 5.0, h: 1.2, yaw: 14 },
  casas:  { tx: -2.3, ty: 0.35, tz: 0.6, d: 6.6, h: 1.4, yaw: -12 },
};

export default {
  estilo: 'C',
  tema: 'NOTA FISCAL NO IMÓVEL',
  handle: '@ESTEREOLUDICO',
  fontes: 'RECEITA FEDERAL · CGIBS · ATO CONJUNTO 7/2026 · LC 214/2025',
  legenda: ['NOTA = NF-e DE IMÓVEL (MODELO 77)', 'FIO = LIGADA À MATRÍCULA'],
  set: [
    { make: L => L.box(9, 3.4, 0.1, '#14161b', { rd: 0 }), z: -1.85 },
    { make: calendario, y: 1.6, z: -1.78, s: 0.72, id: 'cal', anchorY: 0.5 },
    { make: L => L.desk({ w: 1.9 }), id: 'mesa' },
    { k: 'phone', o: { txt: 'NOTA EM DEZ?', screen: '#eaffd0' }, x: -0.6, y: MESA, z: 0.2, s: 0.36, yaw: 14, id: 'cel', anchorY: 0.8 },
    { make: nota, x: 0.05, y: MESA, z: 0.15, s: 1.0, yaw: -6, id: 'nota', anchorY: 1 },
    { make: matricula, x: 0.62, y: MESA, z: 0.0, s: 0.9, yaw: -12, id: 'matricula' },
    { make: L => L.wire({ from: [0.18, MESA + 0.03, 0.05], to: [0.55, MESA + 0.25, 0.02], sag: 0.05, prog: t => (t - SEGA(6)) / 1.0 }) },
    { k: 'stamp', make: L => L.gavel({}), x: -0.25, y: MESA, z: -0.25, s: 0.6 },
    { make: L => L.skyline({ n: 6, col: '#3a3d46', lit: 0.5 }), x: 2.4, z: -0.8, id: 'obras', anchorY: 0.9 },
    { k: 'scaffold', x: 2.0, z: 0.1, s: 0.7, id: 'obra' },
    { make: casas, x: -2.4, z: 0.4, s: 0.68, id: 'casas', anchorY: 0.9 },
  ],
  segs: [
    'Tá circulando que, a partir de 1º de dezembro,',          // 0
    'vender imóvel vai exigir *nota fiscal*.',                  // 1
    'É verdade?',                                               // 2
    'Vem que eu te explico de forma estérea.',                  // 3
    'A nota existe, mas a data mudou:',                         // 4
    'a Receita *adiou* pra 1º de março de 2027.',               // 5
    'O nome é nota fiscal de alienação de imóveis,',            // 6
    'e vale pra venda e outras transferências de imóvel.',      // 7
    'Quem entra primeiro é quem vende imóvel *como negócio*:',  // 8
    'incorporadora, loteadora e construtora.',                  // 9
    'E a pessoa física que vende a própria casa?',              // 10
    'Em regra, *fica de fora*.',                                // 11
    'Mas tem dois gatilhos:',                                   // 12
    'vender *mais de três* imóveis no ano,',                    // 13
    'ou mais de um que você mesmo construiu em cinco anos.',    // 14
    'Aí, no ano seguinte, você vira contribuinte do novo imposto.', // 15
    'Traduzindo: vendeu sua casa uma vez? *Nada muda* agora.',  // 16
    'Manda pra quem tá vendendo imóvel.',                       // 17
    'Comenta *ESTÉREO*.',                                       // 18
  ],
  scenes: [
    { from: 0, pill: 'O BOATO', cam: CAM.geral, cam2: { ...CAM.geral, d: 6.0, yaw: 6 },
      hdr: [{ bubble: 'VENDER IMÓVEL VAI EXIGIR NOTA?', hl: true }],
      callouts: [{ target: 'casas', t: 'SUA CASA', s: 'PRECISA DE NOTA?', dx: 50, dy: -110 }],
      objs: [{ k: 'spotlight', o: { r: 0.95 }, x: -2.4, z: 0.4, type: 'none' }] },
    { from: 2, pill: 'O BOATO', trans: 'move', cam: CAM.cel, cam2: { ...CAM.cel, d: 1.7 },
      hdr: [{ title: 'É *verdade*?', align: 'left', small: true, kicker: 'A PERGUNTA' }],
      callouts: [{ target: 'cel', t: 'CIRCULA NAS REDES', s: '"A PARTIR DE 1º DE DEZEMBRO"', dx: 60, dy: -140 }], fx: ['sparkle'] },
    { from: 4, pill: 'A DATA', cam: CAM.cal, cam2: { ...CAM.cal, d: 3.9 },
      hdr: [{ title: 'A nota existe, mas a *data mudou*', align: 'left', small: true, until: 1 },
            { seal: 'ADIADO', sub: 'PARA 1º DE MARÇO DE 2027', pos: 'mid', at: 1 },
            { quote: 'NF-e de alienação de imóveis: de 1º/12/2026 para 1º/03/2027', who: 'ATO CONJUNTO RFB/CGIBS Nº 7/2026', at: 1 }] },
    { from: 6, pill: 'A NOTA', cam: CAM.nota, cam2: { ...CAM.nota, d: 2.8, yaw: -4 },
      hdr: [{ title: 'Nota fiscal de *alienação de imóveis*', align: 'left', small: true, kicker: 'O NOME' }],
      callouts: [{ target: 'nota', t: 'NF-e MODELO 77', s: 'VENDA E OUTRAS TRANSFERÊNCIAS', dx: -60, dy: -150 },
                 { target: 'matricula', t: 'MATRÍCULA', s: 'LIGADA AO IMÓVEL', dx: 40, dy: -120, at: 1 }] },
    { from: 8, pill: 'QUEM ENTRA', cam: CAM.obras, cam2: { ...CAM.obras, d: 4.4, yaw: 4 },
      hdr: [{ title: 'Quem vende *como negócio*', align: 'left', small: true, kicker: 'PRIMEIRO' },
            { chips: [['INCORPORADORA', '#2b2e36'], ['LOTEADORA', '#2b2e36', 1], ['CONSTRUTORA', '#2b2e36', 1]], at: 1 }],
      callouts: [{ target: 'obra', t: 'ATIVIDADE IMOBILIÁRIA', s: 'EMITE A NOTA', dx: -60, dy: -130 }] },
    { from: 10, pill: 'E VOCÊ?', cam: CAM.casas, cam2: { ...CAM.casas, d: 5.8 },
      hdr: [{ title: 'Vende a *própria casa*?', align: 'left', small: true, until: 1 },
            { seal: 'EM PARTE', sub: 'EM REGRA, A PESSOA FÍSICA FICA DE FORA', pos: 'mid', at: 1 }],
      objs: [{ k: 'person', o: { glasses: false }, x: -1.6, z: 0.9, s: 0.55, yaw: -30 }] },
    { from: 12, pill: 'OS GATILHOS', cam: { ...CAM.casas, d: 6.0, yaw: 6 },
      hdr: [{ card: { head: 'Os *2 gatilhos*', lines: ['1 · MAIS DE 3 IMÓVEIS VENDIDOS NO ANO', '2 · MAIS DE 1 CONSTRUÍDO POR VOCÊ EM 5 ANOS', '→ NO ANO SEGUINTE: CONTRIBUINTE DO IBS/CBS'] } }],
      callouts: [{ target: 'casas', t: 'GATILHO 1', s: 'MAIS DE 3 NO ANO', dx: 50, dy: -120, at: 1, until: 2 },
                 { target: 'casas', t: 'GATILHO 2', s: 'CONSTRUIU E VENDEU', dx: -50, dy: -120, at: 2 }],
      objs: [{ k: 'scaffold', x: -1.6, z: 1.0, s: 0.45, at: 2, type: 'rise' }] },
    { from: 16, pill: 'TRADUZINDO', cam: { ...CAM.casas, d: 5.2, yaw: -8 },
      hdr: [{ title: 'Vendeu uma vez? *Nada muda*', align: 'left', small: true, kicker: 'TRADUZINDO' },
            { sticker: 'VENDA EVENTUAL: NADA MUDA AGORA', pos: 'mid' }],
      objs: [{ k: 'check', x: -2.4, y: 0.7, z: 0.6, s: 1.0 }], fx: ['sparkle'] },
    { from: 17, pill: 'MANDA LÁ', cam: { ...CAM.geral, d: 6.2, h: 1.6, yaw: 0, orbit: 4 },
      hdr: [{ title: 'Manda pra quem tá *vendendo imóvel*', align: 'left', small: true }, { share: true }, { handlePill: true, at: 1 }, { tag: 'COMENTA ESTÉREO', at: 1 }],
      fx: ['confetti'] },
  ],
};
