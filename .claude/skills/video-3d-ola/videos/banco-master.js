// "Quem pagou a conta do Banco Master?" · ~90 s · bolso + STF, neutro ("ser citado não é ser acusado")
// Fontes: Forbes/B3 (liquidação 18/11/2025 e prisão), Valor via Diário do Comércio (maior intervenção),
// Suno (FGC ~R$ 40 bi; Master R$ 28,8 bi a 570 mil credores), Agência Brasil (teto R$ 250 mil),
// Jornal Opção/Revista Fórum/WSCOM (10 relatórios, 4 à PGR, 6 arquivados, 15 dias), UOL via Jornal Opção (Mendonça pede publicidade).

const banco = (txt, col = '#e9e9ee') => L => L.bank({ txt, col });
const celular = L => {
  const g = L.phone({ screen: '#e9fff2' });
  [0.5, 0.36, 0.22].forEach((y, i) => g.add(L.box(i % 2 ? 0.2 : 0.26, 0.07, 0.01, i % 2 ? '#5dff9e' : '#cfd2dc', { x: i % 2 ? 0.05 : -0.03, y, z: 0.035, rd: 0.02 })));
  return g;
};
const pasta = (txt, col = '#f1e7d0') => L => {
  const g = L.group(L.box(0.5, 0.64, 0.06, col, { rd: 0.02 }), L.box(0.2, 0.06, 0.06, col, { x: -0.13, y: 0.64, rd: 0.02 }));
  const t = L.text({ txt, h: 0.07, col: '#3a2f20' }); t.position.set(0, 0.3, 0.035); g.add(t); return g;
};
const relatorios = (n, cols) => L => {
  const g = L.group();
  const nc = Math.min(n, 5); for (let i = 0; i < n; i++) { const p = pasta('')(L); p.position.set((i % nc - (nc - 1) / 2) * 0.62, 0, -Math.floor(i / nc) * 0.8); p.rotation.y = (i % 3 - 1) * 0.12; p.children[0].material.color.set(cols ? cols(i) : '#f1e7d0'); g.add(p); }
  return g;
};
const STF = L => {
  const g = L.group(); const n = 11;
  for (let i = 0; i < n; i++) { const a = (i / (n - 1) - 0.5) * 2.2; const c = L.group(L.box(0.2, 0.2, 0.2, '#3a5bbf', { rd: 0.03 }), L.box(0.2, 0.3, 0.05, '#3a5bbf', { y: 0.2, z: -0.09, rd: 0.02 }));
    c.position.set(Math.sin(a) * 1.3, 0, -Math.cos(a) * 0.8 + 0.4); c.rotation.y = -a; g.add(c); }
  return g;
};

export default {
  tema: 'CASO BANCO MASTER',
  estilo: 'A',
  handle: '@ESTEREOLUDICO',
  cam: { d: 6.5 },
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
    // GANCHO
    { from: 0, pill: 'A CONTA', bg: ['#0a0a0c', '#24242c'],
      cam: { d: 7.6, h: 1.8, yaw: -25 }, cam2: { d: 6.0, h: 0.9, yaw: 8 },
      hdr: [{ count: { from: 0, to: 40, pre: 'R$ ', suf: ' BI', dur: 1.6 }, sub: 'PAGOS PELO FGC · CASO MASTER', col: '#7dffb0', until: 1 },
            { title: 'Chegou ao *Supremo*', box: true, hl: '#ffd24a', at: 1 }],
      objs: [{ id: 'grana', k: 'cashCrumble', o: { n: 8, h: 1.0, p: lt => (lt - 0.6) / 2.2 }, until: 1 },
             { make: STF, at: 1, s: 0.9, z: -0.3 }], fx: ['bills'] },
    { from: 2, pill: 'A CONTA', bg: ['#0a0a0c', '#24242c'], trans: 'pop',
      cam: { d: 6.0, yaw: 15 },
      hdr: [{ title: 'Quem pagou *a conta*?', box: true, hl: '#ffd24a' }],
      objs: [{ k: 'questionBox', s: 1.2, y: 0.2, upd: lt => ({ yaw: Math.sin(lt * 1.5) * 10 }) }], fx: ['sparkle'] },
    // A QUEBRA
    { from: 4, pill: 'A QUEBRA', bg: ['#2a0b18', '#6a1a2a'], trans: 'pan', acc: '#ff8f86',
      cam: { d: 6.6, h: 1.1, yaw: -15, shake: 0.4 },
      hdr: [{ num: '18/11/2025', sub: 'BANCO CENTRAL LIQUIDA O BANCO MASTER', col: '#ff8f86', until: 2 },
            { tag: 'VORCARO PRESO PELA PF · MESMO DIA', at: 2, until: 3, tagc: '#ff8f86', tagf: '#2a0b18' },
            { stamp: 'MAIOR INTERVENÇÃO DA HISTÓRIA', at: 3 }],
      objs: [{ make: banco('BANCO MASTER'), s: 0.95, until: 2, label: 'BANCO MASTER', labelCol: '#ff8f86' },
             { k: 'xMark', s: 1.3, y: 0.3, z: 0.4, at: 1, until: 2, sfx: 'stamp' },
             { k: 'cage', s: 0.85, at: 2, label: 'VORCARO', labelCol: '#ff8f86' },
             { k: 'man', o: { col: '#2a2a33' }, s: 0.5, at: 2, type: 'drop' }], fx: ['rain'] },
    // O SEGURO
    { from: 8, pill: 'O SEGURO', bg: ['#06174a', '#0f3a9a'], trans: 'pan',
      cam: { d: 6.6, h: 1.3, yaw: 18 }, cam2: { d: 6.0, h: 1.0, yaw: -5 },
      hdr: [{ num: 'FGC', sub: 'FUNDO GARANTIDOR DE CRÉDITOS', col: '#7dffb0', until: 1 },
            { num: 'ATÉ R$ 250 MIL', sub: 'POR CPF', col: '#7dffb0', at: 1, until: 2 },
            { count: { from: 0, to: 40, pre: '≈ R$ ', suf: ' BI', dur: 1.5 }, sub: 'JÁ PAGOS · GRUPO MASTER', col: '#7dffb0', at: 2, until: 3, sfx: 'cash' },
            { count: { from: 0, to: 570, pre: '+', suf: ' MIL', dur: 1.5 }, sub: 'PESSOAS PAGAS · SÓ O BANCO MASTER', col: '#7dffb0', at: 3 }],
      objs: [{ k: 'dome', o: { r: 0.55, col: '#5dff9e', stick: 1.1 }, s: 1.0, z: -0.1 },
             { id: 'grana', k: 'cashBlock', o: { n: 6, h: 0.7 }, s: 0.9 },
             { k: 'crowd', o: { n: 10, cols: 5, col: '#cfd2dc', hi: 2 }, s: 0.42, z: -1.0, at: 3 }], fx: ['bills'] },
    // QUEM BANCA
    { from: 12, pill: 'O SEGURO', bg: ['#1f0b2e', '#4a1a62'], trans: 'pop',
      cam: { d: 6.4, yaw: -12 },
      hdr: [{ title: 'Quem banca o FGC? *Os bancos*', box: true, until: 1 },
            { tag: 'ACIMA DE R$ 250 MIL: FILA DA MASSA FALIDA', at: 1, tagc: '#ffd24a', tagf: '#2a1405' }],
      objs: [{ make: L => { const g = L.group(); [-0.7, 0, 0.7].forEach((x, i) => { const b = L.bank({ txt: 'BANCO', col: '#e9e9ee' }); b.scale.setScalar(0.42); b.position.set(x, 0, -0.4 - (i % 2) * 0.3); g.add(b); }); return g; }, until: 1 },
             { k: 'crowd', o: { n: 6, cols: 6, gap: 0.42, col: '#8d92a6' }, s: 0.5, at: 1, upd: lt => ({ x: -Math.min(0.2, lt * 0.03) }), label: 'FILA', labelCol: '#ffd24a' }] },
    // BRASÍLIA
    { from: 15, pill: 'BRASÍLIA', bg: ['#16161a', '#3a3a44'], trans: 'up',
      cam: { d: 6.6, h: 1.2, yaw: 12 },
      hdr: [{ tag: 'A PARTE QUE CHEGOU A BRASÍLIA', until: 1 }, { tag: 'MENSAGENS DO CELULAR DE VORCARO', at: 1 },
            { num: '10 RELATÓRIOS', sub: 'DA POLÍCIA FEDERAL', col: '#ffd24a', at: 3 }],
      objs: [{ make: celular, s: 1.1, until: 3, upd: lt => ({ yaw: Math.sin(lt) * 12 }) },
             { make: relatorios(10), s: 0.6, at: 3, z: 0.2 }] },
    // O STF
    { from: 19, pill: 'O STF', bg: ['#06174a', '#14286a'], trans: 'pan',
      cam: { d: 6.8, h: 1.4, yaw: -15 }, cam2: { d: 6.2, h: 1.0, yaw: 10 },
      hdr: [{ chips: [['6 ARQUIVADOS', '#4a4d58'], ['4 PARA A PGR', '#c9a227', 1]] },
            { rows: [['MORAES', 'CITADO'], ['TOFFOLI', 'CITADO'], ['KASSIO', 'CITADO'], ['MENDONÇA', 'CITADO']], at: 2 }],
      objs: [{ make: relatorios(10, i => (i < 4 ? '#ffd24a' : '#6a6e7a')), s: 0.6, z: 0.2, until: 2 },
             { make: STF, s: 0.95, at: 2, z: -0.3 },
             { make: relatorios(4, () => '#ffd24a'), s: 0.5, z: 0.7, at: 2, type: 'drop' }] },
    // ATENÇÃO
    { from: 22, pill: 'O STF', bg: ['#16161a', '#3a3a44'], trans: 'pop',
      cam: { d: 6.2, orbit: 4 },
      hdr: [{ stamp: 'SER CITADO ≠ SER ACUSADO', stampc: '#ffd24a', until: 1 },
            { num: '15 DIAS', sub: 'PRAZO DA PGR PARA DECIDIR', col: '#ffd24a', at: 1, until: 3 },
            { tag: 'MENDONÇA PEDIU RELATÓRIO PÚBLICO', at: 3 }],
      objs: [{ k: 'scaleBal', o: { tilt: lt => Math.sin(lt * 1.2) * 0.1 }, s: 1.0, until: 1 },
             { k: 'calendar', o: { txt: '15', sub: 'DIAS' }, s: 1.2, at: 1, until: 3 },
             { make: pasta('PÚBLICO', '#ffd24a'), s: 1.3, at: 3 }] },
    // A PERGUNTA
    { from: 26, pill: 'A PERGUNTA', bg: ['#06221a', '#0f4d37'], trans: 'zoom',
      cam: { d: 6.6, h: 1.1, orbit: 5 },
      hdr: [{ tag: 'DINHEIRO DOS CLIENTES: QUASE TODO DE VOLTA', until: 1 },
            { title: 'Quem vai responder pelo *rombo*?', box: true, hl: '#ffd24a', at: 1 }],
      objs: [{ id: 'grana', k: 'cashBlock', o: { n: 7, h: 0.9 }, until: 1 },
             { k: 'questionBox', s: 1.2, y: 0.15, at: 1 }], fx: ['sparkle'] },
    // COMENTA
    { from: 28, pill: 'COMENTA', bg: ['#0a0a0c', '#1d2a22'], trans: 'flash',
      cam: { d: 6.8, h: 1.2, orbit: 5 },
      hdr: [{ title: 'E você, *confia* no seu banco?', box: true, until: 1 }, { title: 'Quer aprender a fazer vídeos assim?', box: true, at: 1 }, { tag: 'COMENTA ESTÉREO', at: 2 }],
      objs: [{ make: banco('SEU BANCO'), s: 0.95 }], fx: ['coins'] },
  ],
};
