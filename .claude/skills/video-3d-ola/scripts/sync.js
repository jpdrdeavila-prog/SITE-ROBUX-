#!/usr/bin/env node
// Sincroniza as falas do vídeo com a narração gravada.
//   node sync.js videos/tema.js voz.mp3 [--db -35] [--pausa 0.22]
// Detecta os trechos de fala (silencedetect), distribui as falas pelos trechos proporcionalmente ao nº de letras,
// encaixa os inícios/fins nas pausas reais e grava videos/tema.tempos.json (o motor usa automaticamente).
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process'), { pathToFileURL } = require('url');
const argv = process.argv.slice(2), opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
(async () => {
  const [video, voz] = argv;
  if (!video || !voz) { console.log('uso: node sync.js videos/tema.js voz.mp3'); process.exit(1); }
  const tmp = path.join(os.tmpdir(), 'v' + Date.now() + '.mjs'); fs.copyFileSync(video, tmp);
  const V = (await import(pathToFileURL(tmp))).default; fs.unlinkSync(tmp);
  const txt = V.segs.map(s => (Array.isArray(s) ? s[2] : s).replace(/\*/g, ''));
  const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', voz]).toString();
  // ffmpeg escreve o silencedetect no stderr
  const r = require('child_process').spawnSync('ffmpeg', ['-i', voz, '-af', `silencedetect=noise=${opt('--db', -35)}dB:d=${opt('--pausa', 0.22)}`, '-f', 'null', '-']);
  const err = r.stderr.toString();
  const sil = []; let s0 = null;
  err.split('\n').forEach(l => { let m; if ((m = l.match(/silence_start: ([\d.]+)/))) s0 = +m[1]; if ((m = l.match(/silence_end: ([\d.]+)/))) { sil.push([s0 ?? 0, +m[1]]); s0 = null; } });
  if (s0 != null) sil.push([s0, dur]);
  const ch = []; let cur = 0;
  sil.forEach(([a, b]) => { if (a - cur > 0.05) ch.push([cur, a]); cur = b; }); if (dur - cur > 0.05) ch.push([cur, dur]);
  const S = ch.reduce((x, [a, b]) => x + b - a, 0), Ctot = txt.reduce((x, t) => x + t.length, 0);
  const real = (sp, end) => { let acc = 0; for (const [a, b] of ch) { const L = b - a; if (sp < acc + L || (end && sp <= acc + L + 1e-6)) return a + (sp - acc); acc += L; } return ch.at(-1)[1]; };
  let T;
  const n = txt.length, m = ch.length;
  if (m >= n) {
    // alinhamento ótimo: cada fala recebe 1+ trechos seguidos; minimiza diferença entre duração real e esperada (pelas letras)
    const exp = txt.map(t => t.length / Ctot), INF = 1e18;
    const dp = Array.from({ length: n + 1 }, () => new Float64Array(m + 1).fill(INF)), bk = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
    dp[0][0] = 0;
    for (let i = 1; i <= n; i++) for (let j = i; j <= m - (n - i); j++) for (let k = i - 1; k < j; k++) {
      if (dp[i - 1][k] >= INF) continue;
      const len = ch[j - 1][1] - ch[k][0], c = dp[i - 1][k] + Math.pow(len / S - exp[i - 1], 2);
      if (c < dp[i][j]) { dp[i][j] = c; bk[i][j] = k; }
    }
    T = []; let j = m; for (let i = n; i >= 1; i--) { const k = bk[i][j]; T.unshift([ch[k][0], ch[j - 1][1]]); j = k; }
  } else {
    // menos pausas que falas: distribui proporcionalmente às letras dentro da fala contínua
    let cum = 0; T = txt.map(t => { const a = real(S * cum / Ctot, false); cum += t.length; const b = real(S * cum / Ctot, true); return [a, b]; });
  }
  // encaixar nas pausas reais
  const starts = ch.map(c => c[0]), ends = ch.map(c => c[1]);
  const near = (arr, x, tol) => { let best = null; arr.forEach(v => { if (Math.abs(v - x) <= tol && (best == null || Math.abs(v - x) < Math.abs(best - x))) best = v; }); return best; };
  T.forEach(t => { const a = near(starts, t[0], 0.45); if (a != null) t[0] = a; const b = near(ends, t[1], 0.45); if (b != null) t[1] = b; });
  for (let i = 1; i < T.length; i++) { if (T[i][0] < T[i - 1][1]) T[i - 1][1] = T[i][0] - 0.02; if (T[i][0] <= T[i - 1][0]) T[i][0] = T[i - 1][0] + 0.3; }
  T.forEach(t => { t[0] = +t[0].toFixed(2); t[1] = +Math.max(t[1], t[0] + 0.4).toFixed(2); });
  const out = path.resolve(path.dirname(video), path.basename(video, '.js') + '.tempos.json');
  fs.writeFileSync(out, JSON.stringify(T));
  console.log(`voz ${dur.toFixed(1)} s | ${ch.length} trechos de fala | ${txt.length} falas | ${(Ctot / S).toFixed(1)} letras/s`);
  T.forEach((t, i) => console.log(`${String(i).padStart(3)}  ${t[0].toFixed(2).padStart(6)}–${t[1].toFixed(2).padEnd(6)} ${txt[i]}`));
  console.log('ok ->', out, '\nConfira: se alguma fala ficou deslocada, edite o JSON à mão (pares [início, fim]).');
  if (Math.abs(ch.length - txt.length) > txt.length * 0.6) console.log('AVISO: nº de trechos muito diferente do nº de falas; revise o roteiro x narração.');
})().catch(e => { console.error(e.message || e); process.exit(1); });
