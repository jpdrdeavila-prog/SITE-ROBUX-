// Núcleo do motor "olá": tudo é função do tempo t (determinístico) -> dá pra renderizar em paralelo.
import * as THREE from 'three';
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
V.fps ??= 30;
V.cps ??= 15; // caracteres por segundo para tempo automático (sem voz)

// segs: "texto" ou [ini, fim, "texto"]
const SEGS = []; { let cur = 0.35;
  V.segs.forEach((s, i) => {
    let a, b, txt;
    if (Array.isArray(s)) [a, b, txt] = s; else { txt = s; const n = txt.replace(/\*/g, '').length; a = cur; b = a + Math.max(1.1, n / V.cps); }
    if (TEMPOS && TEMPOS[i]) [a, b] = TEMPOS[i];
    SEGS.push({ a, b, txt }); cur = b + 0.18;
  }); }
const DUR = V.dur ?? +(SEGS.at(-1).b + 1.4).toFixed(2);

// cenas: {from: índice da fala onde começa} ou {t0: segundos}
const SC_ = V.scenes.map(s => ({ ...s }));
SC_.forEach((s, i) => { s.T0 = s.t0 ?? (s.from != null ? (i === 0 ? 0 : SEGS[s.from].a - 0.12) : 0); });
SC_.forEach((s, i) => { s.T1 = i < SC_.length - 1 ? SC_[i + 1].T0 : DUR; });
// tempo local de um elemento: at = nº da fala dentro da cena (0 = primeira), ou t0 em segundos
function loc(sc, e, kAt = 'at', kT = 't0', def = 0) {
  if (e[kAt] != null && sc.from != null) { const sg = SEGS[sc.from + e[kAt]]; return sg ? sg.a - sc.T0 : def; }
  return e[kT] ?? def;
}

// ---------- three ----------
const cv = document.getElementById('gl');
const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
R.setPixelRatio(1); R.setSize(W * SC, H * SC, false);
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05; R.outputColorSpace = THREE.SRGBColorSpace;
const S = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
const hemi = new THREE.HemisphereLight(0xffffff, 0x444455, 1.35); S.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(2.5, 6, 4); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 20 });
sun.shadow.radius = 6; sun.shadow.bias = -0.0005; S.add(sun);
const floorM = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.95 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), floorM); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; S.add(floor);
S.fog = new THREE.Fog(0x000000, 8, 22);
const skyCv = document.createElement('canvas'); skyCv.width = 4; skyCv.height = 256;
const sky = new THREE.CanvasTexture(skyCv); sky.colorSpace = THREE.SRGBColorSpace; S.background = sky;

// ---------- utilidades ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const eOut = x => 1 - Math.pow(1 - clamp(x), 3);
const eBack = x => { x = clamp(x); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const mix = (a, b, k) => new THREE.Color(a).lerp(new THREE.Color(b), k);
const hex = c => '#' + c.getHexString();
function palFrom(bg) {
  const top = new THREE.Color(bg[0]), bot = new THREE.Color(bg[1]);
  const L = bot.getHSL({}).l, light = L > 0.6;
  return {
    c1: hex(mix(bot, '#ffffff', light ? 0.7 : 0.62)), c2: hex(mix(bot, '#ffffff', light ? 0.35 : 0.32)),
    c3: hex(mix(bot, light ? '#000' : '#fff', light ? 0.12 : 0.12)), c4: hex(mix(top, '#000', 0.35)),
    floor: hex(mix(bot, light ? '#ffffff' : '#000', light ? 0.2 : 0.1)), fog: hex(bot), light,
  };
}
function paintSky(top, bot) {
  const g = skyCv.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, top); gr.addColorStop(0.27, bot); gr.addColorStop(1, bot);
  g.fillStyle = gr; g.fillRect(0, 0, 4, 256); sky.needsUpdate = true;
}

// ---------- construção da cena ----------
let curIdx = -1, root = null, items = [];
function dispose(o) { o.traverse(n => { n.geometry?.dispose(); [].concat(n.material || []).forEach(m => { m.map?.dispose(); m.dispose(); }); }); }
function build(i) {
  if (root) { S.remove(root); dispose(root); }
  const sc = SC_[i]; const P = palFrom(sc.bg || ['#0a0a0c', '#202026']);
  Object.assign(PAL, P, { acc: sc.acc || '#7dffb0' });
  root = new THREE.Group(); S.add(root); items = [];
  (sc.objs || []).forEach(e => {
    let o;
    try { o = e.make ? e.make(LIB) : LIB[e.k](e.o || {}); } catch (err) { console.error('objeto', e.k, err); return; }
    const holder = new THREE.Group(); holder.add(o); root.add(holder);
    items.push({ e, o, holder, t0: loc(sc, e, 'at', 't0', 0), t1: e.until != null || e.t1 != null ? loc(sc, e, 'until', 't1', 1e9) : 1e9 });
  });
  curIdx = i;
}

// ---------- overlay ----------
const $ = id => document.getElementById(id);
$('handle').textContent = `${V.handle} · ${V.tema}`;
const fmt = (n, d = 0) => n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const star = (s, col) => String(s).replace(/\*(.+?)\*/g, `<span style="color:${col}">$1</span>`);
function hdrHTML(sc, lt) {
  const acc = sc.acc || '#7dffb0';
  return (sc.hdr || []).map(h => {
    const a = loc(sc, h, 'at', 't0', 0), b = h.until != null || h.t1 != null ? loc(sc, h, 'until', 't1', 1e9) : 1e9;
    if (lt < a || lt >= b) return '';
    const k = eBack((lt - a) / 0.35), op = clamp((lt - a) / 0.2) * clamp((b - lt) / 0.15);
    const st = `opacity:${op};transform:scale(${0.85 + 0.15 * k})${h.stamp ? ` rotate(${h.rot ?? -6}deg)` : ''}`;
    let inner = '';
    if (h.num || h.count) {
      let n = h.num;
      if (h.count) { const c = h.count, p = eOut((lt - a) / (c.dur || 1.4)); n = (c.pre || '') + fmt(c.from + (c.to - c.from) * p, c.dec || 0) + (c.suf || ''); }
      inner = `<div class="num"><b style="color:${h.col || '#fff'}">${star(n, acc)}</b>${h.sub ? `<small>${h.sub}</small>` : ''}</div>`;
    } else if (h.title) inner = `<div class="title ${h.box ? 'box' : ''}" style="color:${h.col || '#fff'}">${star(h.title, h.hl || acc)}</div>${h.sub ? `<div class="sub">${h.sub}</div>` : ''}`;
    else if (h.tag) inner = `<div class="tag" style="background:${h.tagc || acc};color:${h.tagf || '#08130d'}">${h.tag}</div>`;
    else if (h.chips) inner = `<div class="chips">${h.chips.map(([t, c, at]) => {
      const on = at == null || lt >= loc(sc, { at }, 'at', 't0', 0); return `<span style="background:${c};color:#fff;opacity:${on ? 1 : 0.25}">${t}</span>`; }).join('')}</div>`;
    else if (h.stamp) inner = `<div class="stamp" style="color:${h.stampc || '#ff5a5f'}">${h.stamp}</div>`;
    else if (h.rows) inner = `<div class="rows">${h.rows.filter(r => r[2] == null || lt >= loc(sc, { at: r[2] }, 'at', 't0', 0)).map(r => `<div><span>${r[0]}</span><span>${r[1]}</span></div>`).join('')}</div>`;
    return `<div class="h" style="${st}">${inner}</div>`;
  }).join('');
}
function capHTML(t, acc) {
  const s = SEGS.find(s => t >= s.a - 0.05 && t < s.b + 0.2);
  if (!s) return '';
  const words = s.txt.split(/\s+/), plain = words.map(w => w.replace(/\*/g, '')), tot = plain.join(' ').length;
  let acc_ = 0; const p = (t - s.a) / Math.max(0.3, s.b - s.a);
  return words.map((w, i) => {
    const on = acc_ / tot <= p + 0.02; acc_ += plain[i].length + 1;
    const k = /^\*.*\*[.,!?:;]*$/.test(w) || /^\*/.test(w);
    return `<w class="${on ? 'on' : ''} ${k ? 'k' : ''}">${plain[i]}</w>`;
  }).join(' ');
}
const fx = $('fx'); fx.width = W * SC; fx.height = H * SC; const fg = fx.getContext('2d');
function dots(t, light) {
  fg.clearRect(0, 0, fx.width, fx.height);
  for (let i = 0; i < 34; i++) {
    const sx = Math.abs(Math.sin(i * 91.7)) , sy = Math.abs(Math.sin(i * 47.3)), sp = 0.006 + 0.01 * Math.abs(Math.sin(i * 3.1));
    const x = (sx + Math.sin(t * 0.25 + i) * 0.02) * fx.width, y = ((sy - t * sp) % 1 + 1) % 1 * fx.height;
    const r = (1.2 + 2.6 * Math.abs(Math.sin(i * 5.7))) * SC;
    fg.globalAlpha = 0.25 + 0.45 * Math.abs(Math.sin(i * 2.2 + t * 0.6));
    fg.fillStyle = light ? '#9aa3b5' : '#ffffff'; fg.beginPath(); fg.arc(x, y, r, 0, 7); fg.fill();
  }
  fg.globalAlpha = 1;
}
const v3 = new THREE.Vector3(), bb = new THREE.Box3();
function labels(lt) {
  const out = [];
  items.forEach(it => {
    if (!it.e.label || !it.holder.visible || lt < it.t0 + 0.2) return;
    bb.setFromObject(it.holder); if (bb.isEmpty()) return;
    v3.set((bb.min.x + bb.max.x) / 2, bb.max.y + 0.12, (bb.min.z + bb.max.z) / 2).project(cam);
    out.push(`<div style="left:${(v3.x * 0.5 + 0.5) * W * SC}px;top:${(-v3.y * 0.5 + 0.5) * H * SC}px;color:${it.e.labelCol || '#fff'}">${it.e.label}</div>`);
  });
  $('lbl').innerHTML = out.join('');
}

// ---------- render ----------
function sceneAt(t) { let i = 0; SC_.forEach((s, k) => { if (t >= s.T0) i = k; }); return i; }
function renderAt(t) {
  const i = sceneAt(t), sc = SC_[i], lt = t - sc.T0, dur = sc.T1 - sc.T0;
  if (i !== curIdx) build(i);
  // cores com transição de 0,5 s
  const P = palFrom(sc.bg || ['#0a0a0c', '#202026']), prev = i > 0 ? SC_[i - 1] : sc, Pp = palFrom(prev.bg || ['#0a0a0c', '#202026']);
  const k = eOut(lt / 0.5), bg0 = sc.bg || ['#0a0a0c', '#202026'], bgp = prev.bg || bg0;
  const top = hex(mix(bgp[0], bg0[0], k)), bot = hex(mix(bgp[1], bg0[1], k));
  paintSky(top, bot); floorM.color.set(mix(Pp.floor, P.floor, k)); S.fog.color.set(bot);
  hemi.groundColor.set(mix(Pp.c4, P.c4, k));
  // câmera: leve aproximação durante a cena
  const c = Object.assign({ d: 6.5, h: 0.9, ty: 0.55, tx: 0, yaw: 0, push: 0.07, orbit: 0, fov: 30 }, V.cam || {}, sc.cam || {});
  const d = c.d * (1 + c.push * (1 - eOut(lt / Math.max(1, dur)))), yaw = (c.yaw + c.orbit * lt) * Math.PI / 180;
  cam.fov = c.fov; cam.updateProjectionMatrix();
  cam.position.set(c.tx + Math.sin(yaw) * d, c.ty + c.h, Math.cos(yaw) * d); cam.lookAt(c.tx, c.ty, 0);
  S.fog.near = d + 0.5; S.fog.far = d + 9;
  // objetos
  const out = clamp((dur - lt) / 0.22);
  items.forEach(it => {
    const e = it.e, a = lt - it.t0, h = it.holder;
    h.visible = a >= 0 && lt < it.t1 + 0.3;
    if (!h.visible) return;
    const ex = it.t1 < 1e8 ? clamp((it.t1 + 0.3 - lt) / 0.3) : 1;
    let x = e.x || 0, y = e.y || 0, z = e.z || 0, s = e.s ?? 1, yaw = (e.yaw || 0) * Math.PI / 180, sy = 1;
    const ty = e.type || 'pop', p = a / (e.in || 0.45);
    if (ty === 'pop') s *= eBack(p);
    else if (ty === 'drop') y += (1 - eOut(p)) * 2.6;
    else if (ty === 'slide') x += (1 - eOut(p)) * 2.4 * (e.from === 'left' ? -1 : 1);
    else if (ty === 'rise') sy = Math.max(0.001, eOut(p));
    if (e.upd) { const u = e.upd(a, t) || {}; x += u.x || 0; y += u.y || 0; z += u.z || 0; yaw += (u.yaw || 0) * Math.PI / 180; s *= u.s ?? 1; }
    s *= Math.max(0.001, Math.min(ex, sc.keep ? 1 : out));
    h.position.set(x, y, z); h.rotation.y = yaw; h.scale.set(s, s * sy, s);
    it.o.userData.tick?.(a, t); it.o.traverse(n => n !== it.o && n.userData.tick?.(a, t));
  });
  R.render(S, cam);
  // overlay
  const acc = sc.acc || '#7dffb0';
  document.documentElement.style.setProperty('--acc', acc);
  $('pill').querySelector('span').textContent = sc.pill || '';
  $('pill').querySelector('i').style.background = P.light ? '#1d1d25' : '#e9fff2';
  $('pill').style.background = P.light ? 'rgba(0,0,0,.08)' : 'rgba(0,0,0,.42)';
  $('pill').style.color = $('handle').style.color = P.light ? '#1d1d25' : '#fff';
  $('hdr').innerHTML = hdrHTML(sc, lt);
  const ch = capHTML(t, acc); $('cap').firstElementChild.innerHTML = ch; $('cap').style.opacity = ch ? 1 : 0;
  dots(t, P.light); labels(lt);
  $('vig').style.opacity = P.light ? 0.55 : 1;
}

await document.fonts.load('900 40px Inter'); await document.fonts.load('800 40px Inter'); await document.fonts.load('700 20px Mono'); await document.fonts.ready;
window.renderAt = t => { renderAt(t); return true; };
window.INFO = { dur: DUR, fps: V.fps, segs: SEGS, scenes: SC_.map(s => ({ pill: s.pill, t0: +s.T0.toFixed(2), t1: +s.T1.toFixed(2) })) };
renderAt(+(Q.get('t') || 0));
window.READY = true;
