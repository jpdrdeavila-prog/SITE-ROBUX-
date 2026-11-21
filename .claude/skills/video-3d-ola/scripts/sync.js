#!/usr/bin/env node
// Sincroniza as falas do vídeo com a narração gravada.
//   node sync.js videos/tema.js voz.mp3 [--db -35] [--pausa 0.22]
// Mede o volume da voz a cada 20 ms, acha as pausas e as "respiradas" entre palavras e escolhe os cortes
// que melhor batem com o tamanho FALADO de cada fala (números contados por extenso) e grava videos/tema.tempos.json (o motor usa automaticamente).
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process'), { pathToFileURL } = require('url');
const argv = process.argv.slice(2), opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };

// número por extenso (pt-BR) só para estimar o tamanho falado: "2.500" -> "dois mil e quinhentos"
const U = ['zero','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
const D = ['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
const CEN = ['','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];
function ate999(n) { if (n === 100) return 'cem'; const c = Math.floor(n / 100), r = n % 100, p = [];
  if (c) p.push(CEN[c]); if (r) p.push(r < 20 ? U[r] : D[Math.floor(r / 10)] + (r % 10 ? ' e ' + U[r % 10] : '')); return p.join(' e ') || 'zero'; }
function extenso(n) { if (n >= 1e9) return ate999(Math.floor(n / 1e9)) + ' bilhões ' + extenso(n % 1e9);
  if (n >= 1e6) return ate999(Math.floor(n / 1e6)) + ' milhões ' + (n % 1e6 ? extenso(n % 1e6) : '');
  if (n >= 1000) { const m = Math.floor(n / 1000), r = n % 1000; return (m === 1 ? 'mil' : ate999(m) + ' mil') + (r ? ' e ' + ate999(r) : ''); }
  return ate999(n); }
function falado(t) {
  return t.replace(/R\$\s?/g, '').replace(/(\d[\d.]*)(,(\d+))?/g, (_, a, __, b) => {
    const n = parseInt(a.replace(/\./g, ''), 10); return extenso(n) + (b ? ' vírgula ' + extenso(parseInt(b, 10)) : '');
  }).replace(/%/g, ' por cento') + (/R\$/.test(t) ? ' reais' : '');
}
(async () => {
  const [video, voz] = argv;
  if (!video || !voz) { console.log('uso: node sync.js videos/tema.js voz.mp3'); process.exit(1); }
  const tmp = path.join(os.tmpdir(), 'v' + Date.now() + '.mjs'); fs.copyFileSync(video, tmp);
  const V = (await import(pathToFileURL(tmp))).default; fs.unlinkSync(tmp);
  const txt = V.segs.map(s => (Array.isArray(s) ? s[2] : s).replace(/\*/g, ''));
  const fal = txt.map(falado); // tamanho como é FALADO (números por extenso)
  // 1) envelope de volume (dB) a cada 20 ms
  const SR = 16000, HOP = 320;
  const pcm = execFileSync('ffmpeg', ['-v', 'error', '-i', voz, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
  const x = new Float32Array(pcm.buffer, pcm.byteOffset, pcm.byteLength / 4);
  const F = Math.floor(x.length / HOP), db = new Float32Array(F);
  for (let f = 0; f < F; f++) { let e = 0; for (let k = 0; k < HOP; k++) { const v = x[f * HOP + k]; e += v * v; } db[f] = 10 * Math.log10(e / HOP + 1e-10); }
  const ft = f => f * HOP / SR, dur = x.length / SR;
  const SIL = +opt('--db', -35);
  // suavizar (janela de 60 ms)
  const sm = db.map((_, f) => { let s = 0, c = 0; for (let k = -1; k <= 1; k++) if (db[f + k] !== undefined) { s += db[f + k]; c++; } return s / c; });
  const speech = Array.from(sm, v => v > SIL);
  let first = speech.indexOf(true), last = speech.lastIndexOf(true); if (first < 0) { first = 0; last = F - 1; }
  // 2) candidatos a corte: silêncios (fortes) e vales de volume entre palavras (fracos)
  const cand = [];
  for (let f = first + 1; f < last; ) {
    if (!speech[f]) { let g = f; while (g < last && !speech[g]) g++; const len = ft(g - f);
      if (len >= 0.08) cand.push({ a: ft(f), b: ft(g), s: Math.min(1, 0.55 + len * 1.6) }); f = g; continue; }
    const W = 6; let isMin = true; for (let k = -W; k <= W; k++) if (k && sm[f + k] !== undefined && sm[f + k] < sm[f]) { isMin = false; break; }
    if (isMin) { let L = -99, Rr = -99; for (let k = 1; k <= 15; k++) { if (sm[f - k] !== undefined) L = Math.max(L, sm[f - k]); if (sm[f + k] !== undefined) Rr = Math.max(Rr, sm[f + k]); }
      const depth = Math.min(L, Rr) - sm[f]; if (depth > 6) cand.push({ a: ft(f), b: ft(f), s: Math.min(0.45, depth / 40) }); }
    f++;
  }
  const B = [{ a: ft(first), b: ft(first), s: 1 }, ...cand, { a: ft(last + 1), b: ft(last + 1), s: 1 }];
  // 3) programação dinâmica: escolher n-1 cortes entre os candidatos
  const n = txt.length, m = B.length, Ctot = fal.reduce((q, t) => q + t.length, 0);
  const total = B[m - 1].a - B[0].b, rate = Ctot / total;
  const exp = fal.map(t => Math.max(0.6, t.length / rate));
  const INF = 1e18, dp = Array.from({ length: n + 1 }, () => new Float64Array(m).fill(INF)), bk = Array.from({ length: n + 1 }, () => new Int32Array(m));
  dp[0][0] = 0;
  for (let i = 1; i <= n; i++) for (let j = 1; j < m; j++) {
    if (i === n && j !== m - 1) continue;
    for (let k = j - 1; k >= 0; k--) {
      if (dp[i - 1][k] >= INF) continue;
      const len = B[j].a - B[k].b; if (len > exp[i - 1] * 3 + 1.5) break;
      if (len < 0.25) continue;
      // pausas longas DENTRO da fala custam caro (exceto onde o texto tem vírgula/dois-pontos)
      const inner = []; for (let q = k + 1; q < j; q++) { const pl = B[q].b - B[q].a; if (pl >= 0.3) inner.push(Math.min(1.2, (pl - 0.25) * 2.5)); }
      inner.sort((u, v) => v - u); const free = (txt[i - 1].trim().slice(0, -1).match(/[,:;?!.]/g) || []).length; // pontuação no MEIO da fala permite pausa
      const pin = inner.slice(free).reduce((u, v) => u + v, 0);
      const e = (len - exp[i - 1]) / exp[i - 1], c = dp[i - 1][k] + e * e + pin + (j === m - 1 ? 0 : (1 - B[j].s) * 0.9);
      if (c < dp[i][j]) { dp[i][j] = c; bk[i][j] = k; }
    }
  }
  if (dp[n][m - 1] >= INF) throw new Error('não consegui alinhar: confira se o roteiro e a narração têm as mesmas falas');
  const T = []; { let j = m - 1; for (let i = n; i >= 1; i--) { const k = bk[i][j]; T.unshift([B[k].b, B[j].a]); j = k; } }
  T.forEach(t => { t[0] = +Math.max(0, t[0] - 0.03).toFixed(2); t[1] = +Math.max(t[1], t[0] + 0.4).toFixed(2); });
  const ch = cand.filter(c => c.a !== c.b), S = total;
  const out = path.resolve(path.dirname(video), path.basename(video, '.js') + '.tempos.json');
  fs.writeFileSync(out, JSON.stringify(T));
  console.log(`voz ${dur.toFixed(1)} s | ${ch.length} pausas + ${cand.length - ch.length} respiradas | ${txt.length} falas | ${rate.toFixed(1)} letras/s`);
  T.forEach((t, i) => console.log(`${String(i).padStart(3)}  ${t[0].toFixed(2).padStart(6)}–${t[1].toFixed(2).padEnd(6)} ${txt[i]}`));
  console.log('ok ->', out, '\nConfira: se alguma fala ficou deslocada, edite o JSON à mão (pares [início, fim]).');
  T.forEach((t, i) => { const r = (t[1] - t[0]) / exp[i]; if (r < 0.55 || r > 1.8) console.log(`AVISO: fala ${i} com duração estranha (${(t[1] - t[0]).toFixed(1)} s, esperado ~${exp[i].toFixed(1)} s). Confira.`); });
})().catch(e => { console.error(e.message || e); process.exit(1); });
