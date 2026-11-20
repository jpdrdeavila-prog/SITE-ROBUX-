#!/usr/bin/env node
// Render final:
//   node render.js videos/tema.js [--voz voz.mp3] [--musica trilha.mp3] [--out video.mp4] [--jobs 2] [--hd] [--sfx 1] [--sem-sfx]
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
  const P = await openPage(video); const { dur, fps, events } = P.info; await P.close();
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
  const voz = opt('--voz'), mus = opt('--musica'), semSfx = argv.includes('--sem-sfx');
  const sfxGain = +(opt('--sfx') || 1);
  const tracks = [];
  if (voz) tracks.push({ f: voz, vol: 1 });
  if (mus) tracks.push({ f: mus, vol: voz ? 0.12 : 0.35, loop: true });
  if (!semSfx && events.length) {
    const wav = require('./sfx').makeTrack(events, dur, base + '_sfx.wav', sfxGain);
    tracks.push({ f: wav, vol: voz ? 0.38 : 0.6 });
    console.log(`efeitos sonoros: ${events.length} eventos -> ${wav}`);
  }
  const a = ['-v', 'error', '-y', '-framerate', String(fps), '-i', path.join(dir, '%05d.jpg')];
  tracks.forEach(tk => { if (tk.loop) a.push('-stream_loop', '-1'); a.push('-i', tk.f); });
  if (tracks.length) {
    const parts = tracks.map((tk, j) => `[${j + 1}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=${tk.vol}${tk.loop ? `,afade=t=out:st=${(dur - 1.5).toFixed(2)}:d=1.5` : ''}[a${j}]`);
    a.push('-filter_complex', parts.join(';') + ';' + tracks.map((_, j) => `[a${j}]`).join('') + `amix=inputs=${tracks.length}:duration=longest:normalize=0[a]`, '-map', '0:v', '-map', '[a]');
  }
  a.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-movflags', '+faststart');
  if (tracks.length) a.push('-c:a', 'aac', '-b:a', '192k');
  a.push('-t', dur.toFixed(2), out);
  execFileSync('ffmpeg', a, { stdio: 'inherit' });
  console.log('VÍDEO PRONTO ->', out);
})().catch(e => { console.error(e.message || e); process.exit(1); });
