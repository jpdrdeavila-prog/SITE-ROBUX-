// "Pra onde vai o dinheiro da sua aposta na Mega da Virada?" · ESTILO A (Mundo colorido) · formato dominó/"e na sua vida?"
// Fontes: InfoMoney e Seu Dinheiro (nov/2026: aposta R$ 6, prêmio estimado R$ 1 bi, apostas até 31/12, não acumula);
// Caixa Notícias (ago/2025: 43,79% prêmio, 19,13% custos) + Nexo (17,32% seguridade, 9,80% segurança, 7,05% esporte, 2,91% cultura);
// InfoMoney / Money Times (IR 30% retido na fonte). Chance: C(60,6) = 50.063.860. Valores em R$ = porcentagem × R$ 6 (conta própria).

// bilhete da aposta
const bilhete = L => { const g = L.card({ txt: 'MEGA\nDA VIRADA', w: 0.7, h: 0.5, col: '#f4f4f6', ink: '#1d7a4a' }); g.add(L.box(0.7, 0.07, 0.035, '#2f9e5a', { y: 0.43, rd: 0.01 })); return g; };
// 6 pilhas de moedas, uma por destino, na ordem em que aparecem
const FATIAS = [['PRÊMIO', 0.4379, '#ffd24a'], ['CAIXA E LOTÉRICAS', 0.1913, '#c9ccd6'], ['SEGURIDADE', 0.1732, '#5dff9e'], ['SEGURANÇA', 0.098, '#4d7cff'], ['ESPORTE', 0.0705, '#ff8a5a'], ['CULTURA', 0.0291, '#ff8af0']];
const pilhas = L => {
  const g = L.group(), ps = [];
  FATIAS.forEach(([n, f, c], i) => { const p = L.coinStack({ n: Math.max(2, Math.round(f * 60)), r: 0.12, col: c, th: 0.03 }); p.position.set((i - 2.5) * 0.3, 0, 0); g.add(p); ps.push(p); });
  g.userData.tick = (lt, T) => ps.forEach((p, i) => { const k = Math.min(1, Math.max(0.0001, (T - SEGA(7 + Math.min(i, 4)) - (i === 5 ? 1.0 : 0)) / 0.5)); p.scale.set(k, k, k); }); // T = tempo do vídeo
  return g;
};

export default {
  estilo: 'A',
  tema: 'MEGA DA VIRADA',
  handle: '@ESTEREOLUDICO',
  segs: [
    'De cada *6 reais* que você aposta na Mega da Virada,', // 0
    'menos da metade vira prêmio.',                         // 1
    'Pra onde vai o resto?',                                // 2
    'Vem que eu te explico de forma estérea.',              // 3
    'A aposta simples custa *6 reais*,',                    // 4
    'e o prêmio estimado é de *1 bilhão*.',                 // 5
    'Agora, a divisão:',                                    // 6
    'uns *2,63* vão pro prêmio.',                           // 7
    '*1,15* paga a Caixa e as lotéricas.',                  // 8
    '*1,04* vai pra seguridade social,',                    // 9
    'uns *59 centavos* pra segurança pública,',             // 10
    '42 pro esporte e 17 pra cultura.',                     // 11
    'E a chance de acertar as seis?',                       // 12
    '*1 em 50 milhões*.',                                   // 13
    'E se ganhar, o imposto de *30%*',                      // 14
    'já vem descontado do prêmio anunciado.',               // 15
    'Traduzindo: aposte com o dinheiro do *lazer*,',        // 16
    'nunca com o da conta de luz.',                         // 17
    'Manda pro grupo do bolão.',                            // 18
    'Comenta *ESTÉREO*.',                                   // 19
  ],
  scenes: [
    // GANCHO
    { from: 0, pill: 'A APOSTA', bg: ['#0a0a0c', '#24242c'],
      cam: { d: 7.0, h: 1.4, yaw: -20 }, cam2: { d: 5.6, h: 0.9, yaw: 8 },
      hdr: [{ count: { from: 0, to: 6, pre: 'R$ ', dur: 1.0 }, sub: 'CADA APOSTA SIMPLES', col: '#7dffb0', until: 1 },
            { title: 'Menos da metade vira *prêmio*', box: true, at: 1, until: 2 },
            { title: 'Pra onde vai *o resto*?', box: true, hl: '#ffd24a', at: 2 }],
      objs: [{ id: 'bilhete', make: bilhete, s: 1.2, y: 0.15, upd: lt => ({ yaw: Math.sin(lt * 1.2) * 12 }) },
             { k: 'cashCrumble', o: { n: 6, h: 0.5, p: lt => (lt - 2.5) / 1.5 }, x: 0.55, z: -0.4, s: 0.8, at: 1 }], fx: ['bills'] },
    { from: 3, pill: 'A APOSTA', bg: ['#0a0a0c', '#24242c'], trans: 'pop', cam: { d: 5.6, yaw: 18 },
      hdr: [{ title: 'Vem que eu te *explico*', box: true }],
      objs: [{ k: 'lotteryGlobe', s: 1.3 }], fx: ['sparkle'] },
    // O PRÊMIO
    { from: 4, pill: 'O PRÊMIO', bg: ['#06221a', '#0f4d37'], trans: 'pan', cam: { d: 6.4, h: 1.2, yaw: -14 }, cam2: { d: 5.4, yaw: 10 },
      hdr: [{ tag: 'APOSTA SIMPLES · R$ 6' }, { num: 'R$ 1 BI', count: { from: 0, to: 1, pre: 'R$ ', suf: ' BI', dur: 1.2 }, sub: 'PRÊMIO ESTIMADO · CAIXA', col: '#7dffb0', at: 1 }],
      objs: [{ k: 'lotteryGlobe', x: -0.45, s: 1.0 }, { k: 'cashBlock', o: { n: 6, h: 1.0 }, x: 0.5, z: -0.3, s: 0.85, at: 1, type: 'rise' }], fx: ['coins'] },
    // A DIVISÃO
    { from: 6, pill: 'A DIVISÃO', bg: ['#06174a', '#0f3a9a'], trans: 'up', cam: { d: 6.8, h: 1.5, ty: 0.25 }, cam2: { d: 6.0, h: 1.0, ty: 0.3, yaw: 6 },
      hdr: [{ title: 'De cada *R$ 6*', box: true, until: 1 },
            { rows: [['PRÊMIO', 'R$ 2,63', 1], ['CAIXA E LOTÉRICAS', 'R$ 1,15', 2], ['SEGURIDADE SOCIAL', 'R$ 1,04', 3], ['SEGURANÇA PÚBLICA', 'R$ 0,59', 4], ['ESPORTE', 'R$ 0,42', 5], ['CULTURA', 'R$ 0,17', 5]], at: 1 }],
      objs: [{ make: pilhas, s: 1.0, y: 0, z: 0.2, type: 'none' }] },
    // A CHANCE
    { from: 12, pill: 'A CHANCE', bg: ['#1f0b2e', '#4a1a62'], trans: 'zoom', cam: { d: 7.4, h: 3.0, ty: 0.2 }, cam2: { d: 6.4, h: 2.4 },
      hdr: [{ title: 'E a chance de acertar *as seis*?', box: true, until: 1 },
            { num: '1 EM 50.063.860', sub: 'APOSTA SIMPLES · 6 NÚMEROS', col: '#ff8af0', at: 1 }],
      objs: [{ k: 'field', o: { nx: 14, nz: 10, sp: 0.3, col: '@3', roof: '@2', lit: lt => (lt > 2.4 ? 1 / 140 : 0), litCol: '#ffd24a', litRoof: '#ffd24a' }, type: 'none' },
             { k: 'spotlight', o: { r: 0.25, col: '#ffd24a' }, x: -0.15, z: 0.4, at: 1, type: 'none' }] },
    // O IMPOSTO
    { from: 14, pill: 'O IMPOSTO', bg: ['#2a0b18', '#6a1a2a'], trans: 'pan', acc: '#ff8f86', cam: { d: 6.0, h: 1.0, yaw: 12 },
      hdr: [{ num: '30%', sub: 'IMPOSTO DE RENDA SOBRE O PRÊMIO', col: '#ff8f86' }, { tag: 'JÁ DESCONTADO DO VALOR ANUNCIADO', at: 1, tagc: '#ff8f86', tagf: '#2a0b18' }],
      objs: [{ k: 'cashCrumble', o: { n: 7, h: 0.9, p: lt => lt / 2.2 }, s: 1.0 }] },
    // TRADUZINDO
    { from: 16, pill: 'TRADUZINDO', bg: ['#06221f', '#0f5a55'], trans: 'pan', cam: { d: 6.2, h: 1.1, yaw: -10 },
      hdr: [{ title: 'Só o dinheiro do *lazer*', box: true }, { stamp: 'NUNCA O DA CONTA DE LUZ', at: 1, stampc: '#ffd24a' }],
      objs: [{ make: L => { const a = L.coinStack({ n: 8, r: 0.18 }); const b = L.card({ txt: 'CONTA\nDE LUZ', w: 0.45, h: 0.3, col: '#f4f4f6', ink: '#a8323e' }); b.scale.setScalar(0.8);
               return L.scaleBal({ tilt: lt => -0.18 + Math.sin(lt * 1.3) * 0.03, left: a, right: b }); }, s: 1.0 }] },
    // MANDA LÁ
    { from: 18, pill: 'MANDA LÁ', bg: ['#0a0a0c', '#1d2a22'], trans: 'flash', cam: { d: 6.4, h: 1.2, orbit: 6 },
      hdr: [{ title: 'Manda pro grupo do *bolão*', box: true }, { share: true }, { handlePill: true, at: 1 }, { tag: 'COMENTA ESTÉREO', at: 1 }],
      objs: [{ k: 'lotteryGlobe', s: 1.2 }], fx: ['confetti'] },
  ],
};
