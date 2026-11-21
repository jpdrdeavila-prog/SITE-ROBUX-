// Trilha de efeitos sonoros gerada a partir de INFO.events (whoosh, pop, tick, stamp, thud, ding, cash).
// Sons sintetizados pelo ffmpeg (sem arquivos externos, sem direitos autorais).
const { execFileSync } = require('child_process'), fs = require('fs');
const SR = 44100;
const RECIPES = {
  whoosh: ['anoisesrc=d=0.7:c=pink:a=0.9:seed=4', 'highpass=f=250,lowpass=f=2600,afade=t=in:d=0.32:curve=exp,afade=t=out:st=0.32:d=0.38,volume=0.55'],
  pop: ["aevalsrc='0.7*sin(2*PI*(520+900*exp(-t*45))*t)*exp(-t*28)':d=0.16:s=44100", 'volume=0.9'],
  tick: ["aevalsrc='0.5*sin(2*PI*2300*t)*exp(-t*140)':d=0.05:s=44100", 'volume=0.7'],
  stamp: ["aevalsrc='0.9*sin(2*PI*(55+140*exp(-t*28))*t)*exp(-t*9)+0.35*(random(0)-0.5)*exp(-t*40)':d=0.45:s=44100", 'lowpass=f=1800,volume=1.1'],
  thud: ["aevalsrc='0.8*sin(2*PI*(70+90*exp(-t*35))*t)*exp(-t*14)':d=0.3:s=44100", 'volume=0.9'],
  ding: ["aevalsrc='0.35*(sin(2*PI*1320*t)+0.5*sin(2*PI*1980*t)+0.25*sin(2*PI*2640*t))*exp(-t*4.5)':d=0.9:s=44100", 'volume=0.8'],
  cash: ["aevalsrc='0.4*(sin(2*PI*2100*t)+sin(2*PI*2800*t))*exp(-t*9)*if(lt(t,0.12),1,0.6)':d=0.5:s=44100", 'volume=0.7'],
};
function sound(name) {
  const r = RECIPES[name] || RECIPES.pop;
  const buf = execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', r[0], '-af', r[1] + `,aformat=sample_fmts=flt:sample_rates=${SR}:channel_layouts=mono`, '-f', 'f32le', '-'], { maxBuffer: 1 << 26 });
  return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
}
function makeTrack(events, dur, out, gain = 1) {
  const N = Math.ceil(dur * SR), mixb = new Float32Array(N), cache = {};
  events.forEach(e => {
    const s = (cache[e.type] ||= sound(e.type)), o = Math.round(e.t * SR), g = (e.g ?? 1) * gain;
    for (let i = 0; i < s.length && o + i < N; i++) if (o + i >= 0) mixb[o + i] += s[i] * g;
  });
  for (let i = 0; i < N; i++) mixb[i] = Math.tanh(mixb[i]); // limitador suave
  const raw = out + '.f32';
  fs.writeFileSync(raw, Buffer.from(mixb.buffer));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', raw, out]);
  fs.unlinkSync(raw);
  return out;
}
module.exports = { makeTrack, RECIPES };
