// EXEMPLO DO ESTILO B, "PALCO ÚNICO" (números ilustrativos, não é roteiro real).
// Um cenário fixo (V.set) para o vídeo todo; cada cena só move a câmera até um "ponto" do cenário (trans: 'move'),
// acende etiquetas (callouts) nos objetos e troca a pergunta-tese no topo. Mundo neutro + UMA cor de destaque.
// Teste: node scripts/shot.js videos/exemplo-palco.js
const MESA = 0.78; // altura do tampo da mesa
export default {
  tema: 'EXEMPLO PALCO',
  estilo: 'B',
  handle: '@ESTEREOLUDICO',
  acc: '#ffe14a',                         // cor de destaque única
  bg: ['#0b0b0d', '#1f2026'],
  dust: '#ffe14a',                        // poeira flutuante na cor de destaque
  fontes: 'EXEMPLO ILUSTRATIVO',          // linha de fontes fixa (troque pelas fontes reais)
  legenda: ['LIVRO = O QUE ENTRA E SAI', 'COFRE = O QUE SOBRA'], // chave da metáfora (canto)
  fx: { bloom: 0.45, aperture: 0.0035, maxblur: 0.009 },         // desfoque forte = cara de "miniatura"
  trans: 'move',
  set: [
    { k: 'box', make: L => L.box(7, 3.2, 0.1, '#2a2b31', { y: 0, z: -2.2, rd: 0 }), id: 'parede' },
    { make: L => L.wallMap({ w: 2.6, h: 1.3, routes: [[-0.5, 0.2, 0.5, 0.3], [-0.3, -0.3, 0.6, -0.4]], prog: t => (t - 22) / 2 }), y: 1.9, z: -2.1, id: 'mapa' },
    { k: 'filingCabinet', o: { n: 4 }, x: -1.55, z: -1.5, id: 'arquivo' },
    { k: 'filingCabinet', o: { n: 4 }, x: 1.55, z: -1.5 },
    { make: L => L.desk({ open: t => (t - 15.2) / 0.8 }), id: 'mesa' },
    { k: 'ledger', o: { hl: 2, blank: 6 }, x: -0.42, y: MESA, z: 0.05, yaw: 4, id: 'livro', anchorY: 0.5 },
    { k: 'calculator', x: 0.38, y: MESA, z: 0.12, s: 0.8, yaw: -12, id: 'calc' },
    { k: 'lamp', x: 0.62, y: MESA, z: -0.25, yaw: 200, id: 'lampada' },
    { k: 'cowBank', x: -0.1, y: MESA, z: -0.3, s: 0.45, yaw: -25, id: 'vaca' },
    { k: 'safe', o: { open: t => (t - 18.8) / 1.0 }, x: -2.2, z: -0.4, yaw: 25, id: 'cofre', anchorY: 0.6 },
    { k: 'person', o: { glasses: true, badge: true }, x: 1.35, z: -0.4, s: 0.72, yaw: -20, id: 'contador' },
  ],
  segs: [
    'Pra onde vai o dinheiro de um *caixa*?',    // 0
    'Vem que eu te explico de forma estérea.',   // 1
    'Tudo começa no *livro-caixa*.',             // 2
    'De um lado, o que entrou,',                 // 3
    'do outro, o que saiu.',                     // 4
    'Faz a conta na calculadora:',               // 5
    'sobram *36 mil*.',                          // 6
    'Mas uma linha ficou em branco.',            // 7
    'Traduzindo: o balanço tá *incompleto*.',    // 8
    'E o que sobra vai pro *cofre*.',            // 9
    'Manda pra quem precisa ver isso.',          // 10
    'Comenta *ESTÉREO*.',                        // 11
  ],
  scenes: [
    { from: 0, pill: 'A PERGUNTA', cam: { d: 6.2, h: 1.3, ty: 0.9, yaw: -18 }, cam2: { d: 5.0, yaw: 6 },
      hdr: [{ title: 'Pra onde vai o *dinheiro*?', align: 'left', small: true }],
      callouts: [{ target: 'contador', t: 'O CONTADOR', s: 'PERSONAGEM', dx: -70, dy: -110, at: 1 }] },
    { from: 2, pill: 'O LIVRO', cam: { tx: -0.35, ty: 0.8, tz: 0.05, d: 2.7, h: 1.5, yaw: -10 },
      hdr: [{ title: 'O que *entrou* e o que *saiu*', align: 'left', small: true, kicker: 'O LIVRO-CAIXA' }],
      callouts: [{ target: 'livro', off: [-0.25, 0, 0], t: 'ENTROU · R$ 129 MIL', s: 'EXEMPLO', dx: -40, dy: -150, at: 1 },
                 { target: 'livro', off: [0.25, 0, 0], t: 'SAIU · R$ 93 MIL', s: 'EXEMPLO', dx: 40, dy: -110, at: 2 }] },
    { from: 5, pill: 'A CONTA', cam: { tx: 0.35, ty: 0.8, tz: 0.12, d: 2.5, h: 1.4, yaw: 18 },
      hdr: [{ title: 'Faz a conta', align: 'left', small: true, kicker: 'O NÚMERO' },
            { big: 'R$ 36 MIL', sub: '129 − 93 · ILUSTRATIVO', at: 1, sfx: 'cash' }],
      callouts: [{ target: 'calc', t: '129 − 93', s: 'NA CALCULADORA', dx: 60, dy: -120 }] },
    { from: 7, pill: 'A LINHA', cam: { tx: 0.55, ty: 0.5, tz: 0.4, d: 2.9, h: 0.6, yaw: 25 },
      hdr: [{ title: 'O balanço tá *incompleto*', align: 'left', small: true, kicker: 'TRADUZINDO', at: 1 },
            { sticker: 'BALANÇO INCOMPLETO', at: 1, pos: 'mid' }],
      callouts: [{ target: 'mesa', off: [0.63, -0.28, 0.6], t: 'LINHA EM BRANCO', s: 'NA GAVETA', dx: -60, dy: -120 }] },
    { from: 9, pill: 'O COFRE', cam: { tx: -2.2, ty: 0.5, tz: -0.4, d: 3.4, h: 0.8, yaw: 22 },
      hdr: [{ title: 'O que sobra vai pro *cofre*', align: 'left', small: true }],
      callouts: [{ target: 'cofre', t: 'O QUE SOBRA', s: 'BARRAS = SALDO', dx: 50, dy: -140, at: 0 }] },
    { from: 10, pill: 'MANDA LÁ', cam: { d: 5.6, h: 1.2, ty: 1.2, yaw: 0 }, cam2: { d: 5.0, yaw: -6 },
      hdr: [{ title: 'Quem do seu grupo *sabe*?', align: 'left', small: true }, { share: true }, { handlePill: true, at: 1 }] },
  ],
};
