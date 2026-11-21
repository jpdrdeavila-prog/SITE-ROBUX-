// Núcleo do motor "olá": tudo é função do tempo t (determinístico) -> dá pra renderizar em paralelo.
// Recursos: bloom + desfoque de fundo, câmera com keyframes, transições (pan/up/zoom/pop/morph),
// objetos que atravessam cenas (id), partículas, legenda karaokê e lista de eventos de som (INFO.events).
import * as THREE from 'three';
import { EffectComposer } from './lib/postprocessing/EffectComposer.js';
import { RenderPass } from './lib/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './lib/postprocessing/UnrealBloomPass.js';
import { BokehPass } from './lib/postprocessing/BokehPass.js';
import { OutputPass } from './lib/postprocessing/OutputPass.js';
import { LIB, PAL, C } from './objects.js';

const Q = new URLSearchParams(location.search);
const W = 720, H = 1280, SC = +(Q.get('scale') || 1);
document.documentElement.style.setProperty('--W', W * SC + 'px');
document.documentElement.style.setProperty('--H', H * SC + 'px');
document.documentElement.style.setProperty('--u', SC + 'px');

// ---------- carregar vídeo ----------
const V = (await import(Q.get('video'))).default;
let TEMPOS = null;
if (Q.get('tempos')) TEMPOS = await (await fetch(Q.get('tempos'))).json();
V.handle ??= '@ESTEREOLUDICO';
// ESTILOS (a skill pergunta ao João qual usar): preenchem só o que o vídeo não definiu
const ESTILOS = {
  A: { acc: '#7dffb0', trans: 'pan', fx: { bloom: 0.55, aperture: 0.0016, maxblur: 0.006 } },                       // Mundo colorido (bg por cena)
  B: { acc: '#ffe14a', dust: '#ffe14a', bg: ['#0b0b0d', '#1f2026'], trans: 'move', fx: { bloom: 0.45, aperture: 0.003, maxblur: 0.009 } }, // Palco amarelo
  C: { acc: '#b6ff3b', dust: '#b6ff3b', bg: ['#07080b', '#15171d'], trans: V.set ? 'move' : 'pan', fx: { bloom: 0.5, aperture: 0.0026, maxblur: 0.008 } }, // Neon lima
};
const EST = ESTILOS[String(V.estilo || '').toUpperCase()];
if (EST) { for (const k of ['acc', 'dust', 'bg', 'trans']) if (V[k] == null && EST[k] != null) V[k] = EST[k]; V.fx = Object.assign({}, EST.fx, V.fx || {}); }
V.fps ??= 30;
V.cps ??= 15;
const FX = Object.assign({ bloom: 0.55, dof: true, aperture: 0.0016, maxblur: 0.006, shadows: 'pcf' }, V.fx || {});
if (Q.get('fast')) Object.assign(FX, { bloom: 0, dof: false, shadows: 'pcf' });
if (Q.get('dof') === '0') FX.dof = false; if (Q.get('bloom') === '0') FX.bloom = 0; if (Q.get('vsm') === '0') FX.shadows = 'pcf';
const TR = V.transDur ?? 0.75; // duração da transição entre cenas

// segs: "texto" ou [ini, fim, "texto"]
const SEGS = []; { let cur = 0.35;
  V.segs.forEach((s, i) => {
    let a, b, txt;
    if (Array.isArray(s)) [a, b, txt] = s; else { txt = s; const n = txt.replace(/\*/g, '').length; a = cur; b = a + Math.max(1.1, n / V.cps); }
    if (TEMPOS && TEMPOS[i]) [a, b] = TEMPOS[i];
    SEGS.push({ a, b, txt }); cur = b + 0.18;
  }); }
const DUR = V.dur ?? +(SEGS.at(-1).b + 1.4).toFixed(2);

const SC_ = V.scenes.map(s => ({ ...s }));
SC_.forEach((s, i) => { s.T0 = s.t0 ?? (s.from != null ? (i === 0 ? 0 : SEGS[s.from].a - 0.12) : 0); s.trans = i === 0 ? 'none' : (s.trans || V.trans || 'pan'); });
SC_.forEach((s, i) => { s.T1 = i < SC_.length - 1 ? SC_[i + 1].T0 : DUR; });
function loc(sc, e, kAt = 'at', kT = 't0', def = 0) {
  if (e[kAt] != null && sc.from != null) { const sg = SEGS[sc.from + e[kAt]]; return sg ? sg.a - sc.T0 : def; }
  return e[kT] ?? def;
}

// ---------- three ----------
const cv = document.getElementById('gl');
const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
R.setPixelRatio(1); R.setSize(W * SC, H * SC, false);
R.shadowMap.enabled = true; R.shadowMap.type = FX.shadows === 'vsm' ? THREE.VSMShadowMap : THREE.PCFSoftShadowMap;
R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05; R.outputColorSpace = THREE.SRGBColorSpace;
const S = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
const hemi = new THREE.HemisphereLight(0xffffff, 0x444455, 1.35); S.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(2.5, 6, 4); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 24 });
sun.shadow.radius = 9; sun.shadow.blurSamples = 16; sun.shadow.bias = -0.0008; S.add(sun);
const rim = new THREE.DirectionalLight(0xffffff, 0.45); rim.position.set(-3, 3, -4); S.add(rim);
const floorM = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.95 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), floorM); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; S.add(floor);
S.fog = new THREE.Fog(0x000000, 8, 22);
const skyCv = document.createElement('canvas'); skyCv.width = 4; skyCv.height = 256;
const sky = new THREE.CanvasTexture(skyCv); sky.colorSpace = THREE.SRGBColorSpace; S.background = sky;

// pós-processamento
const composer = new EffectComposer(R);
composer.setPixelRatio(1); composer.setSize(W * SC, H * SC);
composer.addPass(new RenderPass(S, cam));
const bokeh = new BokehPass(S, cam, { focus: 7, aperture: FX.aperture, maxblur: FX.maxblur });
if (FX.dof) composer.addPass(bokeh);
const bloom = new UnrealBloomPass(new THREE.Vector2(W * SC / 2, H * SC / 2), FX.bloom, 0.55, 0.78);
if (FX.bloom > 0) composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------- utilidades ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const eOut = x => 1 - Math.pow(1 - clamp(x), 3);
const eIO = x => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eBack = x => { x = clamp(x); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const mix = (a, b, k) => new THREE.Color(a).lerp(new THREE.Color(b), k);
const hex = c => '#' + c.getHexString();
const DEFBG = V.bg || ['#0a0a0c', '#24242c'];
function palFrom(bg) {
  const top = new THREE.Color(bg[0]), bot = new THREE.Color(bg[1]);
  const L = bot.getHSL({}).l, light = L > 0.6;
  return {
    c1: hex(mix(bot, '#ffffff', light ? 0.7 : 0.62)), c2: hex(mix(bot, '#ffffff', light ? 0.35 : 0.32)),
    c3: hex(mix(bot, light ? '#000' : '#fff', 0.12)), c4: hex(mix(top, '#000', 0.35)),
    floor: hex(mix(bot, light ? '#ffffff' : '#000', light ? 0.2 : 0.1)), fog: hex(bot), light,
  };
}
function paintSky(top, bot) {
  const g = skyCv.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, top); gr.addColorStop(0.27, bot); gr.addColorStop(1, bot);
  g.fillStyle = gr; g.fillRect(0, 0, 4, 256); sky.needsUpdate = true;
}

// ---------- câmera ----------
const CAMDEF = { d: 6.5, h: 0.9, ty: 0.55, tx: 0, tz: 0, yaw: 0, push: 0.07, orbit: 0, fov: 30, shake: 0 };
function camAt(sc, lt) {
  const dur = sc.T1 - sc.T0, a = Object.assign({}, CAMDEF, V.cam || {}, sc.cam || {});
  let c = a;
  if (sc.cam2) { // keyframe final: interpola de cam -> cam2 entre cam2.from e cam2.to (segundos locais; padrão: cena toda)
    const b = Object.assign({}, a, sc.cam2), f = sc.cam2.from ?? 0, t = sc.cam2.to ?? dur;
    const k = eIO((lt - f) / Math.max(0.1, t - f)); c = {}; for (const key in a) c[key] = typeof a[key] === 'number' ? lerp(a[key], b[key], k) : a[key];
  }
  const push = sc.cam2 ? 0 : c.push;
  return { ...c, d: c.d * (1 + push * (1 - eOut(lt / Math.max(1, dur)))), yaw: c.yaw + c.orbit * lt };
}
function placeCam(c, T) {
  const yaw = c.yaw * Math.PI / 180, sh = c.shake ? Math.sin(T * 37) * c.shake * 0.02 : 0;
  cam.fov = c.fov; cam.updateProjectionMatrix();
  cam.position.set(c.tx + Math.sin(yaw) * c.d + sh, c.ty + c.h + sh * 0.6, c.tz + Math.cos(yaw) * c.d);
  cam.lookAt(c.tx, c.ty, c.tz);
  return Math.hypot(c.d, c.h);
}

// ---------- construção das cenas ----------
function dispose(o) { o?.traverse(n => { n.geometry?.dispose(); [].concat(n.material || []).forEach(m => { m.map?.dispose(); m.dispose(); }); }); }
function makeObj(e) {
  try { return e.make ? e.make(LIB) : LIB[e.k](e.o || {}); } catch (err) { console.error('objeto', e.k, err); return new THREE.Group(); }
}
function fxObjs(sc) { // atalhos de partículas: fx: ['rain','coins','bills','confetti','sparkle']
  const map = { rain: 'rain', coins: 'coinRain', bills: 'billRain', confetti: 'confetti', sparkle: 'sparkles' };
  return (sc.fx || []).map(f => (typeof f === 'string' ? { k: map[f] || f, type: 'none', fxp: true } : { type: 'none', fxp: true, ...f }));
}
function makeScene(i) {
  const sc = SC_[i];
  Object.assign(PAL, palFrom(sc.bg || DEFBG), { acc: sc.acc || V.acc || '#7dffb0' });
  const root = new THREE.Group(), pers = new THREE.Group(); S.add(root, pers);
  const items = [...(sc.objs || []), ...fxObjs(sc)].map(e => {
    const holder = new THREE.Group(), o = makeObj(e); holder.add(o); root.add(holder);
    return { e, o, holder, t0: loc(sc, e, 'at', 't0', 0), t1: e.until != null || e.t1 != null ? loc(sc, e, 'until', 't1', 1e9) : 1e9 };
  });
  return { i, sc, root, pers, items };
}
function dropScene(s) { if (!s) return; S.remove(s.root, s.pers); dispose(s.root); dispose(s.pers); }
let cur = null, prev = null;
// PALCO: objetos de V.set ficam montados o vídeo inteiro (a câmera passeia entre eles)
// SEGA(i) = segundo em que a fala i começa (use nas funções do set: t => (t - SEGA(9)) / 1)
globalThis.SEGA = i => (SEGS[i] ? SEGS[i].a : 0);
const SET = [];
if (V.set) { Object.assign(PAL, palFrom(V.bg || DEFBG), { acc: V.acc || '#7dffb0' });
  V.set.forEach(e => { const holder = new THREE.Group(), o = makeObj(e); holder.add(o); S.add(holder);
    holder.position.set(e.x || 0, e.y || 0, e.z || 0); holder.rotation.y = (e.yaw || 0) * Math.PI / 180; holder.scale.setScalar(e.s ?? 1);
    SET.push({ e, o, holder }); }); }
function tickSet(t) { SET.forEach(it => { const e = it.e; let x = e.x || 0, y = e.y || 0, z = e.z || 0, yaw = e.yaw || 0, s = e.s ?? 1;
  if (e.upd) { const u = e.upd(t, t) || {}; x += u.x || 0; y += u.y || 0; z += u.z || 0; yaw += u.yaw || 0; s *= u.s ?? 1; }
  it.holder.position.set(x, y, z); it.holder.rotation.y = yaw * Math.PI / 180; it.holder.scale.setScalar(s);
  it.o.traverse(n => n.userData.tick?.(t, t)); }); }
function ensure(i) {
  if (cur && cur.i === i) return;
  if (cur && cur.i === i - 1) { dropScene(prev); prev = cur; }
  else { dropScene(prev); dropScene(cur); prev = i > 0 ? makeScene(i - 1) : null; }
  cur = makeScene(i);
  // objetos com o mesmo id atravessam a cena (movem/transformam em vez de sumir)
  if (prev) cur.items.forEach(it => {
    if (!it.e.id) return; const p = prev.items.find(q => q.e.id === it.e.id); if (!p) return;
    it.from = p; p.taken = true; it.morph = it.e.morph ?? (p.e.k !== it.e.k || !!p.e.make || !!it.e.make);
    cur.pers.add(it.holder);
    if (it.morph) { p.ghost = p.holder; cur.pers.add(p.holder); it.burst = new THREE.Group(); it.burst.add(LIB.sparkles({ n: 40, burst: true })); cur.pers.add(it.burst); }
  });
}

// transformação de um item no tempo local lt da sua cena
function xform(sc, it, lt, T, { outro = true, entry = true } = {}) {
  const e = it.e, a = lt - it.t0, dur = sc.T1 - sc.T0;
  const vis = a >= 0 && lt < it.t1 + 0.3;
  let x = e.x || 0, y = e.y || 0, z = e.z || 0, s = e.s ?? 1, yaw = e.yaw || 0, sy = 1;
  if (entry) {
    const ty = e.type || 'pop', p = a / (e.in || 0.45);
    if (ty === 'pop') s *= eBack(p);
    else if (ty === 'drop') y += (1 - eOut(p)) * 2.6;
    else if (ty === 'slide') x += (1 - eOut(p)) * 2.4 * (e.from === 'left' ? -1 : 1);
    else if (ty === 'rise') sy = Math.max(0.001, eOut(p));
    else if (ty === 'grow') s *= eOut(p);
  }
  if (e.upd) { const u = e.upd(Math.max(0, a), T) || {}; x += u.x || 0; y += u.y || 0; z += u.z || 0; yaw += u.yaw || 0; s *= u.s ?? 1; }
  if (it.t1 < 1e8) s *= clamp((it.t1 + 0.3 - lt) / 0.3);
  const nx = SC_[sc._i + 1];
  if (outro && !sc.keep && nx && (nx.trans === 'pop' || nx.trans === 'flash') && !it.taken) s *= clamp((dur - lt) / 0.22);
  return { vis, a, x, y, z, s: Math.max(0.0001, s), sy, yaw };
}
SC_.forEach((s, i) => (s._i = i));
function apply(it, f, T) {
  const h = it.holder; h.visible = f.vis; if (!f.vis) return;
  h.position.set(f.x, f.y, f.z); h.rotation.y = f.yaw * Math.PI / 180; h.scale.set(f.s, f.s * f.sy, f.s);
  it.o.traverse(n => n.userData.tick?.(Math.max(0, f.a), T));
}

// ---------- overlay ----------
const $ = id => document.getElementById(id);
$('handle').textContent = `${V.handle} · ${V.tema}`;
const fmt = (n, d = 0) => n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const star = (s, col) => String(s).replace(/\*(.+?)\*/g, `<span style="color:${col}">$1</span>`);
const posOf = h => h.pos || (h.big || h.share || h.handlePill ? 'mid' : 'top');
function hdrHTML(sc, lt, pos = 'top') {
  const acc = sc.acc || V.acc || '#7dffb0';
  return (sc.hdr || []).map(h => {
    if (posOf(h) !== pos) return '';
    const a = loc(sc, h, 'at', 't0', 0), b = h.until != null || h.t1 != null ? loc(sc, h, 'until', 't1', 1e9) : 1e9;
    if (lt < a || lt >= b) return '';
    const k = eBack((lt - a) / 0.35), op = clamp((lt - a) / 0.2) * clamp((b - lt) / 0.15);
    const st = `opacity:${op};transform:scale(${0.85 + 0.15 * k})${h.stamp || h.sticker || h.seal ? ` rotate(${h.rot ?? (h.sticker ? -4 : h.seal ? -3 : -6)}deg)` : ''}${h.align === 'left' ? ';align-self:flex-start;align-items:flex-start;margin-left:calc(40*var(--u))' : ''}${h.quote || h.card ? ';align-self:stretch;align-items:stretch' : ''}`;
    let inner = '';
    if (h.big) {
      let n = h.big; if (h.count) { const c = h.count, p = eOut((lt - a) / (c.dur || 1.4)); n = (c.pre || '') + fmt(c.from + (c.to - c.from) * p, c.dec || 0) + (c.suf || ''); }
      inner = `<div class="big" style="color:${h.col || acc}">${n}</div>${h.sub ? `<div class="bigsub">${h.sub}</div>` : ''}`;
    } else if (h.num || h.count) {
      let n = h.num;
      if (h.count) { const c = h.count, p = eOut((lt - a) / (c.dur || 1.4)); n = (c.pre || '') + fmt(c.from + (c.to - c.from) * p, c.dec || 0) + (c.suf || ''); }
      const strike = h.strike && lt >= a + (h.strike === true ? 0.6 : h.strike);
      inner = `<div class="num"><b style="color:${h.col || '#fff'};${strike ? 'text-decoration:line-through;text-decoration-color:#ff5a5f;text-decoration-thickness:.12em' : ''}">${star(n, acc)}</b>${h.sub ? `<small>${h.sub}</small>` : ''}</div>`;
    } else if (h.share) inner = `<div class="share" style="background:${acc}"><svg viewBox="0 0 24 24"><path d="M3 11 21 3l-6 18-3-8z" fill="#111"/></svg></div>`;
    else if (h.handlePill) inner = `<div class="hpill">${V.handle}</div>`;
    else if (h.card) { const c = h.card;
      inner = `<div class="card" style="border-color:${acc}">${c.head ? `<b style="color:${acc}">${star(c.head, acc)}</b>` : ''}${(c.lines || []).map(l => `<div>${star(l, acc)}</div>`).join('')}</div>`; }
    else if (h.quote) inner = `<div class="quote" style="border-color:${acc}">${h.who ? `<b style="color:${acc}">${h.who}</b>` : ''}<div>“${star(h.quote, acc)}”</div></div>`;
    else if (h.seal) { const SEAL = { 'CONFIRMADO': ['#2f9e5a', '✓'], 'VERDADEIRO': ['#2f9e5a', '✓'], 'FALSO': ['#d93c3c', '✕'], 'BOATO': ['#d93c3c', '✕'], 'EXAGERADO': ['#e07b1f', '!'], 'NÃO CONFIRMADO': ['#c9a227', '?'], 'EM PARTE': ['#c9a227', '≈'] };
      const [c, ic] = SEAL[h.seal] || [h.sealc || acc, '•'];
      inner = `<div class="seal" style="background:${c}"><span>${ic}</span>${h.seal}${h.sub ? `<small>${h.sub}</small>` : ''}</div>`; }
    else if (h.bubble) inner = `<div class="bubble ${h.hl ? 'hl' : ''}" style="${h.hl ? `background:${acc};color:#111` : ''}">${star(h.bubble, acc)}</div>`;
    else if (h.sticker) inner = `<div class="sticker">${star(h.sticker, '#b8860b')}${h.sub ? `<small>${h.sub}</small>` : ''}</div>`;
    else if (h.title) {
      const strike = h.strike && lt >= a + (h.strike === true ? 0.6 : h.strike);
      inner = `${h.kicker ? `<div class="kicker" style="color:${acc};border-color:${acc}">${h.kicker}</div>` : ''}<div class="title ${h.box ? 'box' : ''} ${h.small ? 'small' : ''}" style="color:${h.col || '#fff'};${h.align === 'left' ? 'text-align:left;' : ''}${strike ? 'text-decoration:line-through;text-decoration-color:#ff5a5f;text-decoration-thickness:.1em' : ''}">${star(h.title, h.hl || acc)}</div>${h.sub ? `<div class="sub">${h.sub}</div>` : ''}`;
    }
    else if (h.tag) inner = `<div class="tag" style="background:${h.tagc || acc};color:${h.tagf || '#08130d'}">${h.tag}</div>`;
    else if (h.chips) inner = `<div class="chips">${h.chips.map(([t, c, at]) => {
      const on = at == null || lt >= loc(sc, { at }, 'at', 't0', 0); return `<span style="background:${c};color:#fff;opacity:${on ? 1 : 0.25}">${t}</span>`; }).join('')}</div>`;
    else if (h.stamp) inner = `<div class="stamp" style="color:${h.stampc || '#ff5a5f'}">${h.stamp}</div>`;
    else if (h.rows) inner = `<div class="rows">${h.rows.filter(r => r[2] == null || lt >= loc(sc, { at: r[2] }, 'at', 't0', 0)).map(r => `<div><span>${r[0]}</span><span>${r[1]}</span></div>`).join('')}</div>`;
    else if (h.timeline) { const [ys, act] = [h.timeline, h.active ?? 0];
      inner = `<div class="rows" style="flex-direction:row;gap:calc(16*var(--u))">${ys.map((y, j) => `<div style="opacity:${j <= (typeof act === 'function' ? act(lt - a) : act) ? 1 : 0.35}">${y}</div>`).join('')}</div>`; }
    return `<div class="h" style="${st}">${inner}</div>`;
  }).join('');
}
function capHTML(t) {
  const s = SEGS.find(s => t >= s.a - 0.05 && t < s.b + 0.2);
  if (!s) return '';
  const words = s.txt.split(/\s+/), plain = words.map(w => w.replace(/\*/g, '')), tot = plain.join(' ').length;
  let acc_ = 0; const p = (t - s.a) / Math.max(0.3, s.b - s.a);
  return words.map((w, i) => {
    const on = acc_ / tot <= p + 0.02; acc_ += plain[i].length + 1;
    return `<w class="${on ? 'on' : ''} ${/^\*/.test(w) ? 'k' : ''}">${plain[i]}</w>`;
  }).join(' ');
}
const fx = $('fx'); fx.width = W * SC; fx.height = H * SC; const fg = fx.getContext('2d');
function dots(t, light, flash) {
  fg.clearRect(0, 0, fx.width, fx.height);
  for (let i = 0; i < 34; i++) {
    const sx = Math.abs(Math.sin(i * 91.7)), sy = Math.abs(Math.sin(i * 47.3)), sp = 0.006 + 0.01 * Math.abs(Math.sin(i * 3.1));
    const x = (sx + Math.sin(t * 0.25 + i) * 0.02) * fx.width, y = ((sy - t * sp) % 1 + 1) % 1 * fx.height;
    const r = (1.2 + 2.6 * Math.abs(Math.sin(i * 5.7))) * SC;
    fg.globalAlpha = 0.25 + 0.45 * Math.abs(Math.sin(i * 2.2 + t * 0.6));
    fg.fillStyle = V.dust || (light ? '#9aa3b5' : '#ffffff'); fg.beginPath(); fg.arc(x, y, r, 0, 7); fg.fill();
  }
  if (flash > 0) { fg.globalAlpha = flash; fg.fillStyle = '#fff'; fg.fillRect(0, 0, fx.width, fx.height); }
  // grão de filme sutil (determinístico)
  fg.globalAlpha = 0.035;
  for (let i = 0; i < 900; i++) { const v = Math.sin(i * 12.9898 + Math.floor(t * 30) * 78.233) * 43758.5453; const r = v - Math.floor(v);
    fg.fillStyle = r > 0.5 ? '#fff' : '#000'; fg.fillRect((r * 7919 % 1) * fx.width, ((r * 104729) % 1) * fx.height, 2 * SC, 2 * SC); }
  fg.globalAlpha = 1;
}
const v3 = new THREE.Vector3(), bb = new THREE.Box3();
function anchorOf(target) {
  if (Array.isArray(target)) return new THREE.Vector3(...target);
  const it = cur.items.find(q => q.e.id === target) || SET.find(q => q.e.id === target);
  if (!it || !it.holder.visible) return null;
  bb.setFromObject(it.holder); if (bb.isEmpty()) return null;
  const ay = it.e.anchorY ?? 1;
  return new THREE.Vector3((bb.min.x + bb.max.x) / 2, bb.min.y + (bb.max.y - bb.min.y) * ay, (bb.min.z + bb.max.z) / 2);
}
function callouts(sc, lt) {
  const acc = sc.acc || V.acc || '#7dffb0', svg = [], box = [], U = SC;
  (sc.callouts || []).forEach(c => {
    const a = loc(sc, c, 'at', 't0', 0), b = c.until != null || c.t1 != null ? loc(sc, c, 'until', 't1', 1e9) : 1e9;
    if (lt < a || lt >= b) return;
    const pr = anchorOf(c.target); if (!pr) return;
    if (c.off) pr.add(new THREE.Vector3(...c.off));
    pr.project(cam); if (pr.z > 1) return;
    const ax = (pr.x * 0.5 + 0.5) * W * U, ay = (-pr.y * 0.5 + 0.5) * H * U;
    const bx = ax + (c.dx ?? 80) * U, by = ay + (c.dy ?? -90) * U;
    const k = clamp((lt - a) / 0.35), op = clamp((lt - a) / 0.2) * clamp((b - lt) / 0.15);
    const ex = ax + (bx - ax) * k, ey = ay + (by - ay) * k;
    svg.push(`<line x1="${ax}" y1="${ay}" x2="${ex}" y2="${ey}" stroke="${acc}" stroke-width="${1.6 * U}" opacity="${op}"/><circle cx="${ax}" cy="${ay}" r="${3.2 * U}" fill="${acc}" opacity="${op}"/>`);
    box.push(`<div class="callout" style="left:${bx}px;top:${by}px;opacity:${op * k};transform:translate(${(c.dx ?? 80) < 0 ? '-100%' : '0'},-50%)"><b>${c.t}</b>${c.s ? `<small>${c.s}</small>` : ''}</div>`);
  });
  return `<svg width="${W * U}" height="${H * U}" style="position:absolute;inset:0">${svg.join('')}</svg>` + box.join('');
}
function labels(scn) {
  const out = [];
  scn.items.forEach(it => {
    if (!it.e.label || !it.holder.visible || it.holder.scale.x < 0.5) return;
    bb.setFromObject(it.holder); if (bb.isEmpty()) return;
    v3.set((bb.min.x + bb.max.x) / 2, bb.max.y + 0.12, (bb.min.z + bb.max.z) / 2).project(cam);
    out.push(`<div style="left:${(v3.x * 0.5 + 0.5) * W * SC}px;top:${(-v3.y * 0.5 + 0.5) * H * SC}px;color:${it.e.labelCol || '#fff'}">${it.e.label}</div>`);
  });
  $('lbl').innerHTML = callouts(scn.sc, lastLt) + out.join('');
}

// ---------- render ----------
let lastLt = 0;
function sceneAt(t) { let i = 0; SC_.forEach((s, k) => { if (t >= s.T0) i = k; }); return i; }
const OFF = { pan: [3.4, 0, 0], up: [0, -3.2, 0], left: [-3.4, 0, 0] };
function renderAt(t) {
  const i = sceneAt(t), sc = SC_[i], lt = t - sc.T0;
  ensure(i);
  const tr = sc.trans, inT = i > 0 && lt < TR && !['pop', 'none', 'flash'].includes(tr) && !(tr === 'zoom' && lt > TR * 0.5), k = eIO(lt / TR);
  // cores
  const bg0 = sc.bg || DEFBG, bgp = (SC_[i - 1] || sc).bg || bg0, P = palFrom(bg0), Pp = palFrom(bgp), kc = i > 0 ? eOut(lt / (tr === 'pop' ? 0.5 : TR)) : 1;
  const top = hex(mix(bgp[0], bg0[0], kc)), bot = hex(mix(bgp[1], bg0[1], kc));
  paintSky(top, bot); floorM.color.set(mix(Pp.floor, P.floor, kc)); S.fog.color.set(bot); hemi.groundColor.set(mix(Pp.c4, P.c4, kc));
  // câmera
  const MV = V.moveDur ?? 1.1, inMove = i > 0 && tr === 'move' && lt < MV;
  let c = camAt(sc, lt);
  if (inMove) { const pc = camAt(SC_[i - 1], SC_[i - 1].T1 - SC_[i - 1].T0), km = eIO(lt / MV); const m = {}; for (const key in c) m[key] = typeof c[key] === 'number' ? lerp(pc[key], c[key], km) : c[key]; c = m; }
  else if (inT && prev) { const pc = camAt(prev.sc, prev.sc.T1 - prev.sc.T0); const m = {}; for (const key in c) m[key] = typeof c[key] === 'number' ? lerp(pc[key], c[key], k) : c[key]; c = m; }
  const focus = placeCam(c, t);
  S.fog.near = c.d + 0.5; S.fog.far = c.d + 9;
  bokeh.uniforms.focus.value = focus; bloom.strength = P.light ? FX.bloom * 0.25 : FX.bloom;
  // offsets de transição
  const off = OFF[tr] || [0, 0, 0];
  cur.root.position.set(0, 0, 0); cur.root.scale.setScalar(1);
  if (prev) { prev.root.visible = prev.pers.visible = inT; prev.root.position.set(0, 0, 0); prev.root.scale.setScalar(1); }
  if (inT) {
    if (tr === 'zoom') { const kz = eOut(lt / (TR * 0.5)); prev.root.scale.setScalar(1 + kz * 0.9); prev.root.position.z = kz * 2.2; cur.root.scale.setScalar(0.4 + 0.6 * k); }
    else { prev.root.position.set(-off[0] * k, -off[1] * k, 0); cur.root.position.set(off[0] * (1 - k), off[1] * (1 - k), 0); }
  }
  if (tr === 'zoom' && i > 0 && lt < TR) cur.root.scale.setScalar(0.4 + 0.6 * k);
  if (prev) { prev.pers.position.copy(prev.root.position); prev.pers.scale.copy(prev.root.scale);
    prev.items.forEach(it => { if (it.burst) it.burst.visible = false; if (it.from && it.morph) it.from.holder.visible = false; }); }
  // itens da cena anterior durante a transição
  if (prev) prev.items.forEach(it => {
    if (it.taken && !it.ghost) { it.holder.visible = false; return; }
    if (it.ghost) return; // tratado pelo item novo
    if (!inT) { it.holder.visible = false; return; }
    apply(it, xform(prev.sc, it, prev.sc.T1 - prev.sc.T0 + lt, t, { outro: false }), t);
  });
  // itens da cena atual
  cur.items.forEach(it => {
    if (it.from) {
      const f = xform(sc, it, lt, t, { entry: false }), pf = xform(prev.sc, it.from, prev.sc.T1 - prev.sc.T0, t, { outro: false });
      const km = eIO(lt / TR);
      const g = { ...f, x: lerp(pf.x, f.x, km), y: lerp(pf.y, f.y, km), z: lerp(pf.z, f.z, km), s: lerp(pf.s, f.s, km), yaw: lerp(pf.yaw, f.yaw, km) };
      if (it.morph) {
        const kk = clamp(lt / (TR * 0.9));
        apply(it, { ...g, vis: true, s: g.s * eBack(clamp((kk - 0.35) / 0.65)) }, t);
        const gh = it.from; gh.holder.visible = kk < 0.5; gh.holder.position.set(g.x, g.y, g.z); gh.holder.scale.setScalar(Math.max(0.0001, pf.s * (1 - eOut(kk / 0.5))));
        gh.o.traverse(n => n.userData.tick?.(prev.sc.T1 - prev.sc.T0, t));
        it.burst.visible = lt < 1.1; it.burst.position.set(g.x, g.y + 0.4, g.z); it.burst.traverse(n => n.userData.tick?.(lt, t));
      } else apply(it, { ...g, vis: true }, t);
      return;
    }
    apply(it, xform(sc, it, lt, t), t);
  });
  // sombra calculada 1x por quadro (o passe de desfoque renderiza a cena de novo e não precisa recalcular)
  tickSet(t);
  R.shadowMap.autoUpdate = false; R.shadowMap.needsUpdate = true;
  if (FX.bloom > 0 || FX.dof) composer.render(); else R.render(S, cam);
  // overlay
  const acc = sc.acc || V.acc || '#7dffb0';
  document.documentElement.style.setProperty('--acc', acc);
  const pillK = i > 0 ? eOut(lt / 0.35) : 1;
  $('pill').querySelector('span').textContent = sc.pill || '';
  $('pill').style.opacity = pillK; $('pill').style.transform = `translateX(${(1 - pillK) * -20 * SC}px)`;
  $('pill').querySelector('i').style.background = V.acc && !P.light ? V.acc : P.light ? '#1d1d25' : '#e9fff2';
  $('pill').querySelector('i').style.boxShadow = `0 0 calc(10*var(--u)) ${acc}`;
  $('pill').style.background = P.light ? 'rgba(0,0,0,.08)' : 'rgba(0,0,0,.42)';
  $('pill').style.color = $('handle').style.color = P.light ? '#1d1d25' : '#fff';
  lastLt = lt;
  $('hdr').innerHTML = hdrHTML(sc, lt);
  $('mid').innerHTML = hdrHTML(sc, lt, 'mid');
  const fon = sc.fontes ?? V.fontes; $('fontes').textContent = fon ? 'FONTES: ' + fon : ''; $('hdr').style.top = fon ? 'calc(182*var(--u))' : '';
  const leg = sc.legenda === false ? null : (sc.legenda || V.legenda);
  $('leg').innerHTML = leg ? leg.map(l => `<div>${l}</div>`).join('') : ''; $('leg').style.display = leg ? 'block' : 'none';
  const ch = capHTML(t); $('cap').firstElementChild.innerHTML = ch; $('cap').style.opacity = ch ? 1 : 0;
  dots(t, P.light, i > 0 && tr === 'flash' ? 0.85 * (1 - eOut(lt / 0.35)) : i > 0 && tr === 'zoom' ? 0.35 * Math.max(0, 1 - Math.abs(lt - TR * 0.45) / (TR * 0.25)) : 0); labels(cur);
  $('vig').style.opacity = P.light ? 0.55 : 1;
}

// ---------- eventos de som (usados pelo render.js para montar a trilha de efeitos) ----------
function events() {
  const ev = [], add = (t, type, g = 1) => ev.push({ t: +t.toFixed(3), type, g });
  SC_.forEach((sc, i) => {
    if (i > 0 && sc.trans !== 'none' && sc.sfx !== false) add(sc.T0, sc.trans === 'pop' ? 'pop' : sc.trans === 'flash' ? 'ding' : 'whoosh', 0.8);
    (sc.hdr || []).forEach(h => {
      if (h.sfx === false) return; const a = sc.T0 + loc(sc, h, 'at', 't0', 0);
      if (h.sfx) return add(a, h.sfx);
      if (h.count) { const n = Math.round((h.count.dur || 1.4) / 0.07); for (let j = 0; j < n; j++) add(a + j * 0.07 * (1 + j / n), 'tick', 0.5); }
      else if (h.stamp || h.sticker || h.seal) add(a, 'stamp', h.sticker ? 0.6 : 1);
      else if (h.quote || h.bubble) add(a, 'pop', 0.8);
      else if (h.num || h.title || h.big) add(a, 'pop', 0.9);
      else if (h.share) add(a, 'ding', 0.7);
      else if (h.tag || h.chips || h.rows || h.card) add(a, 'tick', 0.8);
    });
    (sc.callouts || []).forEach(c => add(sc.T0 + loc(sc, c, 'at', 't0', 0), 'tick', 0.45));
    (sc.objs || []).forEach(e => {
      if (e.sfx === false || e.id && i > 0 && (SC_[i - 1].objs || []).some(q => q.id === e.id)) return;
      const a = sc.T0 + loc(sc, e, 'at', 't0', 0);
      if (e.sfx) return add(a, e.sfx);
      if (a - sc.T0 < 0.05 && sc.trans !== 'pop') return; // entra junto com a transição
      if (e.type === 'drop') add(a + (e.in || 0.45) * 0.85, 'thud', 0.8); else if (!e.type || e.type === 'pop') add(a, 'pop', 0.45);
    });
  });
  return ev.sort((a, b) => a.t - b.t);
}

await document.fonts.load('900 40px Inter'); await document.fonts.load('800 40px Inter'); await document.fonts.load('700 20px Mono'); await document.fonts.ready;
window.renderAt = t => { renderAt(t); return true; };
window.INFO = { dur: DUR, fps: V.fps, segs: SEGS, events: events(), scenes: SC_.map(s => ({ pill: s.pill, trans: s.trans, t0: +s.T0.toFixed(2), t1: +s.T1.toFixed(2) })) };
renderAt(+(Q.get('t') || 0));
window.READY = true;
