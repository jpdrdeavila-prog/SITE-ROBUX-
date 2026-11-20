#!/usr/bin/env node
// Render final:
//   node render.js videos/tema.js [--voz voz.mp3] [--musica trilha.mp3] [--out video.mp4] [--jobs 2] [--hd]
// Gera os quadros em paralelo (--jobs navegadores) e monta o MP4 com ffmpeg.
const path = require('path'), fs = require('fs'), { spawn, execFileSync } = require('child_process');
const { openPage } = require('./_lib');
const argv = process.argv.slice(2), opt = k => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };

async function worker(video, dir, a, b, scale) {
  const P = await openPage(video, { scale });
  const fps = P.info.fps;
  for (let f = a; f < b; f++) {
    await P.page.evaluate(t => window.renderAt(t), f / fps);
    await P.page.screenshot({ path: path.join(dir, `${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
    if (f % 60 === 0) process.stdout.write(`[${a}-${b}] quadro ${f}\n`);
  }
  if (P.errs.length) console.log('ERROS:\n' + P.errs.join('\n'));
  await P.close();
}

(async () => {
  const video = argv[0];
  if (argv[1] === '--worker') return worker(video, argv[2], +argv[3], +argv[4], +argv[5]);
  if (!video) { console.log('uso: node render.js videos/tema.js [--voz voz.mp3] [--musica m.mp3] [--out v.mp4] [--jobs 2] [--hd]'); process.exit(1); }
  const scale = argv.includes('--hd') ? 1.5 : 1, jobs = +(opt('--jobs') || 2);
  const base = path.resolve(path.dirname(video), path.basename(video, '.js'));
  const dir = base + '_quadros', out = path.resolve(opt('--out') || base + '.mp4');
  fs.mkdirSync(dir, { recursive: true });
  const P = await openPage(video); const { dur, fps } = P.info; await P.close();
  const N = Math.ceil(dur * fps), t0 = Date.now();
  const todo = []; for (let f = 0; f < N; f++) if (!fs.existsSync(path.join(dir, `${String(f).padStart(5, '0')}.jpg`))) todo.push(f);
  console.log(`${dur.toFixed(1)} s = ${N} quadros (${todo.length} faltando) em ${jobs} processos -> ${dir}`);
  if (todo.length) {
    const a0 = todo[0], per = Math.ceil((N - a0) / jobs);
    await Promise.all(Array.from({ length: jobs }, (_, j) => new Promise((ok, ko) => {
      const a = a0 + j * per, b = Math.min(N, a + per); if (a >= b) return ok();
      const c = spawn(process.execPath, [__filename, video, '--worker', dir, a, b, scale], { stdio: 'inherit' });
      c.on('exit', code => (code ? ko(new Error('worker ' + j + ' falhou')) : ok()));
    })));
  }
  console.log(`quadros prontos em ${((Date.now() - t0) / 60000).toFixed(1)} min. Montando MP4...`);
  const voz = opt('--voz'), mus = opt('--musica');
  const a = ['-v', 'error', '-y', '-framerate', String(fps), '-i', path.join(dir, '%05d.jpg')];
  if (voz) a.push('-i', voz);
  if (mus) a.push('-stream_loop', '-1', '-i', mus);
  if (voz && mus) a.push('-filter_complex', `[2:a]volume=0.12[m];[1:a][m]amix=inputs=2:duration=first:normalize=0[a]`, '-map', '0:v', '-map', '[a]');
  else if (mus) a.push('-filter_complex', `[1:a]volume=0.35,afade=t=out:st=${(dur - 1.5).toFixed(2)}:d=1.5[a]`, '-map', '0:v', '-map', '[a]');
  a.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-movflags', '+faststart');
  if (voz || mus) a.push('-c:a', 'aac', '-b:a', '192k');
  a.push('-t', dur.toFixed(2), out);
  execFileSync('ffmpeg', a, { stdio: 'inherit' });
  console.log('VÍDEO PRONTO ->', out);
})().catch(e => { console.error(e.message || e); process.exit(1); });
