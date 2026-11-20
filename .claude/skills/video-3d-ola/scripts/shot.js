#!/usr/bin/env node
// Prévia: node shot.js videos/tema.js [pasta_saida] [t1 t2 ...]
// Sem tempos -> 1 quadro por cena (no meio de cada fala da cena, até 3) + folha de contato contact.jpg
const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const { openPage } = require('./_lib');
(async () => {
  const [video, outArg, ...ts] = process.argv.slice(2);
  if (!video) { console.log('uso: node shot.js videos/tema.js [saida] [t1 t2 ...]'); process.exit(1); }
  const out = path.resolve(outArg || path.join(path.dirname(video), 'previa_' + path.basename(video, '.js')));
  fs.mkdirSync(out, { recursive: true });
  const P = await openPage(video);
  let times = ts.map(Number);
  if (!times.length) {
    P.info.scenes.forEach(s => {
      const inside = P.info.segs.filter(g => g.a >= s.t0 - 0.01 && g.a < s.t1);
      const pick = inside.length ? inside.filter((_, i) => i % Math.ceil(inside.length / 3) === 0).map(g => (g.a + g.b) / 2 + 0.3) : [(s.t0 + s.t1) / 2];
      times.push(...pick);
    });
  }
  console.log(`duração ${P.info.dur.toFixed(1)} s | ${P.info.scenes.length} cenas | ${P.info.segs.length} falas`);
  P.info.scenes.forEach(s => console.log(`  ${s.t0.toFixed(1).padStart(6)}–${s.t1.toFixed(1).padEnd(6)} ${s.pill}`));
  for (const [i, t] of times.entries()) {
    await P.page.evaluate(t => window.renderAt(t), t);
    await P.page.screenshot({ path: path.join(out, `s_${String(i).padStart(2, '0')}.png`) });
  }
  if (P.errs.length) console.log('ERROS NO NAVEGADOR:\n' + P.errs.join('\n'));
  await P.close();
  const cols = 6, rows = Math.ceil(times.length / cols);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(out, 's_%02d.png'), '-vf', `scale=240:-1,tile=${cols}x${rows}:padding=4:color=black`, '-frames:v', '1', path.join(out, 'contact.jpg')]);
  console.log('ok ->', path.join(out, 'contact.jpg'), `(${times.length} quadros: ${times.map(t => t.toFixed(1)).join(', ')})`);
})().catch(e => { console.error(e.message || e); process.exit(1); });
