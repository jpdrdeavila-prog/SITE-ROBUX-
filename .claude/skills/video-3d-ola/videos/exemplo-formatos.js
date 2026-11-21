// EXEMPLO DOS FORMATOS (conteúdo ilustrativo, não é roteiro real). Mostra os módulos da biblioteca de formatos
// (references/formatos.md): CHECAGEM, BOATO × FATO, RINGUE, DOMINÓ, GLOBO, LISTA DA PORTA, SALA NO ESCURO.
// Visual padrão do canal: fundo escuro + 1 cor de destaque (verde-lima @ESTEREOLUDICO) + objetos brancos/cinza.
const ACC = '#b6ff3b';
export default {
  tema: 'EXEMPLO FORMATOS',
  handle: '@ESTEREOLUDICO',
  acc: ACC, dust: ACC,
  bg: ['#07080b', '#15171d'],
  fontes: 'EXEMPLO ILUSTRATIVO',
  fx: { bloom: 0.5, aperture: 0.0022, maxblur: 0.007 },
  segs: [
    'Fulano disse que a taxa *triplicou*.',     // 0  CHECAGEM
    'Exagerado: subiu 40%.',                    // 1
    'Circula que o Pix vai ser *taxado*.',      // 2  BOATO × FATO
    'Não confirmado: não existe lei nenhuma.',  // 3
    'Round 1: quem decide o *preço*?',          // 4  RINGUE
    'Um banco cai na terça,',                   // 5  DOMINÓ
    'e na quinta *derruba* o resto.',           // 6
    'O mercado reagiu no mundo inteiro.',       // 7  GLOBO
    'O satélite manda sinal direto pro celular,', // 8 SINAL
    'mas nem todo app *entra na festa*.',       // 9  LISTA DA PORTA
    'E quando a luz cai, lanterna e calma.',    // 10 SALA NO ESCURO
    'Manda pra quem precisa ver isso.',         // 11
    'Comenta *ESTÉREO*.',                       // 12
  ],
  scenes: [
    { from: 0, pill: 'CHECAGEM 1/3', cam: { d: 6.8, h: 1.3, ty: 0.85 }, cam2: { d: 6.0 },
      hdr: [{ quote: 'A taxa *triplicou*', who: 'FULANO DISSE', until: 1 }, { seal: 'EXAGERADO', sub: 'SUBIU 40% · FONTE ILUSTRATIVA', at: 1, pos: 'mid' }],
      objs: [{ k: 'pulpit', o: { txt: 'FULANO' }, s: 1.0 }, { k: 'spotlight', o: { r: 0.55 }, type: 'none' }, { k: 'person', o: { suit: '#2c3a66' }, s: 0.66, z: -0.4 }] },
    { from: 2, pill: 'BOATO OU FATO?', cam: { d: 5.0, h: 1.0, yaw: -12 },
      hdr: [{ bubble: 'PIX VAI SER TAXADO?', until: 1 }, { seal: 'NÃO CONFIRMADO', sub: 'NÃO EXISTE LEI · ILUSTRATIVO', at: 1, pos: 'mid' }],
      objs: [{ k: 'phone', o: { txt: 'PIX' }, s: 1.1, upd: lt => ({ yaw: Math.sin(lt) * 12 }) }], fx: ['sparkle'] },
    { from: 4, pill: 'ROUND 1', cam: { d: 6.5, h: 2.2, ty: 0.5, yaw: -20 }, cam2: { d: 5.6, yaw: 15 },
      hdr: [{ title: 'Quem decide o *preço*?', box: true }],
      objs: [{ k: 'boxingRing', s: 0.8 }, { k: 'person', o: { pose: 'abertos' }, s: 0.5, x: -0.45, y: 0.16, yaw: 60 }, { k: 'person', o: { suit: '#1d1d25', pose: 'apontando' }, s: 0.5, x: 0.45, y: 0.16, yaw: -60 },
             { k: 'spotlight', o: { r: 0.35 }, x: -0.45, y: 0.17, type: 'none' }] },
    { from: 5, pill: 'O DOMINÓ', cam: { d: 5.4, h: 1.4, yaw: 25 },
      hdr: [{ title: 'Cai um, *cai o resto*', align: 'left', small: true, kicker: 'CAUSA E EFEITO' }],
      objs: [{ k: 'dominoes', o: { n: 8, key: 0, fall: lt => (lt - 1.2) / 2.2 }, s: 1.0 }] },
    { from: 7, pill: 'O MUNDO', cam: { d: 5.2, h: 1.0, ty: 0.9 },
      hdr: [{ big: '−20%', sub: 'EXEMPLO · NOVA YORK', at: 0 }],
      objs: [{ k: 'globeCities', o: { prog: lt => lt / 2 }, s: 0.72, type: 'grow' }] },
    { from: 8, pill: 'O SINAL', cam: { d: 6.2, h: 1.2, ty: 1.0 },
      hdr: [{ title: 'Sinal *de cima*', align: 'left', small: true, until: 1 }, { title: 'Quem *entra* na festa?', align: 'left', small: true, kicker: 'A LISTA', at: 1 }],
      objs: [{ k: 'satellite', o: { beam: lt => lt / 0.8 }, until: 1 }, { k: 'signalBars', o: { lit: lt => lt * 2.5 }, s: 1.3, until: 1 },
             { k: 'partyDoor', o: { lines: 5, ok: 3 }, s: 1.1, at: 1 }] },
    { from: 10, pill: 'APAGÃO', bg: ['#030304', '#0b0c0f'], cam: { d: 4.8, h: 0.9, yaw: -15 },
      hdr: [{ title: 'Lanterna e *calma*', align: 'left', small: true }],
      objs: [{ k: 'flashlight', o: { on: lt => (lt - 0.4) / 0.3 }, x: -0.6, y: 0.3, yaw: 10 }, { k: 'backpack', x: 0.5, s: 0.9 }, { k: 'bottle', x: 0.1, z: 0.3 }] },
    { from: 11, pill: 'MANDA LÁ', trans: 'flash', cam: { d: 6.0, h: 1.3, orbit: 5 },
      hdr: [{ title: 'Quem do seu grupo *precisa ver*?', box: true }, { share: true }, { handlePill: true, at: 1 }, { tag: 'COMENTA ESTÉREO', at: 1 }],
      objs: [{ k: 'replayButton', s: 1.4 }], fx: ['confetti'] },
  ],
};
