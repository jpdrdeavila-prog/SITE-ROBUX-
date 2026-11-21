// Biblioteca de objetos 3D low-poly do motor "olá".
// Convenção: unidades em metros, base do objeto em y=0, frente virada para +z (câmera).
// Toda função recebe um objeto de opções e devolve um THREE.Object3D.
// Objetos animados definem obj.userData.tick = (lt, T) => {...}
//   lt = segundos desde que o objeto entrou; T = segundos desde o início do vídeo.
// Opções numéricas que aceitam função (ex.: level, p, open, tilt, g) podem receber (lt)=>valor.
import * as THREE from 'three';
import { RoundedBoxGeometry } from './lib/RoundedBoxGeometry.js';

// ---------- cores ----------
export const PAL = { c1: '#ffffff', c2: '#cccccc', c3: '#888888', c4: '#333333', acc: '#7dffb0' };
export const CASH = '#8dffc0', GOLD = '#f2c94c', RED = '#ff5a5f', YEL = '#ffd24a', BLU = '#4d7cff', ORG = '#ff8a5a';
const NAMED = { red: RED, yel: YEL, grn: '#5dff9e', blu: BLU, org: ORG, cash: CASH, gold: GOLD, white: '#f4f4f6', black: '#1d1d25' };
export function C(c) {
  if (c == null) return new THREE.Color(PAL.c2);
  if (typeof c === 'string' && c[0] === '@') return new THREE.Color(PAL['c' + c[1]] || PAL.acc);
  if (NAMED[c]) return new THREE.Color(NAMED[c]);
  return new THREE.Color(c);
}
const val = (v, lt) => (typeof v === 'function' ? v(lt) : v);

// ---------- primitivas ----------
export function mat(col, o = {}) {
  const c = C(col);
  return new THREE.MeshStandardMaterial({
    color: c, roughness: o.r ?? 0.62, metalness: 0,
    emissive: o.glow ? c : new THREE.Color(0), emissiveIntensity: o.glow || 0,
    transparent: (o.op ?? 1) < 1, opacity: o.op ?? 1, side: o.side || THREE.FrontSide,
  });
}
function mesh(geo, m, sh = true) { const x = new THREE.Mesh(geo, m); x.castShadow = sh; x.receiveShadow = true; return x; }
export function box(w, h, d, col, o = {}) {
  const r = Math.min(o.rd ?? 0.04, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const g = r > 0.002 ? new RoundedBoxGeometry(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d);
  const x = mesh(g, o.m || mat(col, o)); x.position.set(o.x || 0, (o.y ?? 0) + (o.base === false ? 0 : h / 2), o.z || 0); return x;
}
export function sph(r, col, o = {}) { const x = mesh(new THREE.SphereGeometry(r, 28, 18), o.m || mat(col, o)); x.position.set(o.x || 0, o.y ?? r, o.z || 0); return x; }
export function cyl(r, h, col, o = {}) {
  const x = mesh(new THREE.CylinderGeometry(o.rt ?? r, r, h, o.seg || 32), o.m || mat(col, o));
  x.position.set(o.x || 0, (o.y ?? 0) + h / 2, o.z || 0); return x;
}
export function cap(r, len, col, o = {}) { const x = mesh(new THREE.CapsuleGeometry(r, len, 6, 14), o.m || mat(col, o)); return x; }
export function group(...ch) { const g = new THREE.Group(); ch.forEach(c => c && g.add(c)); return g; }

// Textura de texto (canvas) -> plano
export function textTex(txt, o = {}) {
  const fs = o.fs || 120, pad = fs * 0.35;
  const cv = document.createElement('canvas'), ctx = cv.getContext('2d');
  const font = `${o.weight || 900} ${fs}px Inter, sans-serif`;
  ctx.font = font;
  const lines = String(txt).split('\n');
  const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + pad * 2;
  const h = lines.length * fs * 1.08 + pad * 1.4;
  cv.width = Math.ceil(o.w || w); cv.height = Math.ceil(o.h || h);
  if (o.bg) { ctx.fillStyle = o.bg; ctx.fillRect(0, 0, cv.width, cv.height); }
  ctx.font = font; ctx.fillStyle = o.col || '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((l, i) => ctx.fillText(l, cv.width / 2, cv.height / 2 + (i - (lines.length - 1) / 2) * fs * 1.08));
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return { tex: t, aspect: cv.width / cv.height };
}
export function text({ txt = 'TEXTO', h = 0.16, col = '#fff', y = 0, glow = 0 } = {}) {
  const { tex, aspect } = textTex(txt, { col });
  const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(h * aspect, h), m); p.position.y = y + h / 2; p.renderOrder = 2; return p;
}

// ---------- DINHEIRO ----------
export function cashBlock({ n = 6, h = 0.9, w = 0.16, d = 0.5, gap = 0.018, col = CASH, glow = 0.35 } = {}) {
  const g = new THREE.Group(), m = mat(col, { glow, r: 0.45 }), band = mat('#5bd99a', { glow: 0.2 });
  const W = n * w + (n - 1) * gap;
  for (let i = 0; i < n; i++) {
    const x = -W / 2 + w / 2 + i * (w + gap);
    g.add(box(w, h, d, null, { m, x, rd: 0.02 }));
    g.add(box(w * 1.02, 0.03, d * 1.02, null, { m: band, x, y: h * 0.46, rd: 0.005 }));
  }
  return g;
}
export function cashCrumble({ n = 7, h = 0.9, p = 0.5 } = {}) {
  const g = cashBlock({ n, h }), bits = new THREE.Group(), m = mat(CASH, { glow: 0.3 });
  let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 26; i++) {
    const b = box(0.07, 0.035, 0.05, null, { m, rd: 0.008 });
    b.userData.o = [(rnd() - 0.5) * 1.3, rnd() * 0.04, 0.2 + rnd() * 0.45, rnd() * 6]; bits.add(b);
  }
  g.add(bits);
  g.userData.tick = (lt) => {
    const k = Math.min(1, Math.max(0, val(p, lt)));
    g.children.forEach(c => { if (c !== bits) c.scale.y = 1; });
    bits.children.forEach((b, i) => {
      const on = i / bits.children.length < k; b.visible = on;
      const [x, y, z, r] = b.userData.o; b.position.set(x, y + 0.02, z); b.rotation.set(r, r * 1.7, 0);
    });
  };
  return g;
}
export function coinStack({ n = 18, r = 0.28, col = GOLD, th = 0.035 } = {}) {
  const g = new THREE.Group(), m = mat(col, { r: 0.35, glow: 0.12 }), e = mat('#d9a92e');
  for (let i = 0; i < n; i++) {
    const c = cyl(r, th * 0.86, null, { m: i % 2 ? m : e, y: i * th, seg: 28 });
    c.position.x = Math.sin(i * 2.3) * 0.008; g.add(c);
  }
  return g;
}
export function bill({ col = CASH } = {}) { return box(0.34, 0.012, 0.16, null, { m: mat(col, { glow: 0.35 }), rd: 0.004 }); }
export function piggy({ col = '#f4eef0', broken = false } = {}) {
  const m = mat(col, { r: 0.4 });
  const body = sph(0.32, null, { m, y: 0.38 }); body.scale.set(1.15, 0.95, 0.95);
  const g = group(body, sph(0.13, null, { m, x: 0.36, y: 0.42 }));
  [[-.18, .14], [.18, .14], [-.18, -.14], [.18, -.14]].forEach(([x, z]) => { const l = cyl(0.05, 0.14, null, { m, x, z }); g.add(l); });
  [[.38, .58, .07], [.38, .58, -.07]].forEach(([x, y, z]) => { const e = sph(0.05, null, { m, x, y, z }); e.scale.set(.6, 1, 1); g.add(e); });
  g.add(box(0.14, 0.02, 0.03, '#333', { y: 0.7, rd: 0.005 }));
  if (broken) g.add(box(0.02, 0.32, 0.02, '#333', { x: -0.05, y: 0.25, z: 0.3, rd: 0.005 }));
  g.children.forEach(c => (c.position.x -= 0.05));
  return g;
}
export function card({ txt = '', w = 0.55, h = 0.32, col = '#f4f4f6', ink = '#1d1d25', easel = false, legs = false } = {}) {
  const g = group(box(w, h, 0.03, col, { y: easel ? 0.42 : 0, rd: 0.015 }));
  if (txt) {
    const { tex, aspect } = textTex(txt, { col: ink });
    const th = Math.min(h * 0.55, (w * 0.86) / aspect);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(th * aspect, th), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    p.position.set(0, (easel ? 0.42 : 0) + h / 2, 0.017); g.add(p);
  }
  if (easel || legs) [-w * 0.3, w * 0.3].forEach(x => g.add(box(0.03, 0.46, 0.03, '#c79a5a', { x, z: -0.03 })));
  return g;
}
export function questionBox({ txt = '?', col = YEL } = {}) { return card({ txt: '–   ' + txt, w: 0.62, h: 0.42, col, ink: '#4a3a10' }); }
export function ticket({ txt = 'INGRESSO', col = '#f3f0e6' } = {}) {
  const g = card({ txt, w: 0.7, h: 0.34, col, ink: '#555' }); g.add(box(0.1, 0.34, 0.035, '#2f7a4d', { x: 0.29 })); g.rotation.z = -0.06; return g;
}
export function sign({ txt = 'ALERTA', col = 'red', y = 0.9, w } = {}) {
  const { tex, aspect } = textTex(txt, { col: col === 'yel' ? '#3a2a00' : '#fff', fs: 110 });
  const hh = 0.17, ww = w || Math.max(0.5, hh * aspect * 0.9 + 0.12);
  const g = group(box(ww, hh, 0.03, col, { y, rd: 0.02, glow: 0.12 }));
  const p = new THREE.Mesh(new THREE.PlaneGeometry(hh * 0.8 * aspect, hh * 0.8), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  p.position.set(0, y + hh / 2, 0.017); g.add(p);
  [-ww * 0.35, ww * 0.35].forEach(x => { const s = box(0.006, 3, 0.006, '#ddd', { x, y: y + hh }); g.add(s); });
  g.userData.tick = (lt) => { g.rotation.z = Math.sin(lt * 1.6) * 0.035; };
  return g;
}

// ---------- PESSOAS ----------
const POSES = {
  parado: { la: [0, 0, 0.12], ra: [0, 0, -0.12] },
  aceno: { la: [0, 0, 0.12], ra: [0, 0, -2.6] },
  apontando: { la: [0, 0, 0.12], ra: [-1.45, 0, -0.1] },
  comemorando: { la: [0, 0, 2.6], ra: [0, 0, -2.6] },
  pensando: { la: [0, 0, 0.12], ra: [-2.3, 0, -0.5] },
  segurando: { la: [-1.2, 0, 0.2], ra: [-1.2, 0, -0.2] },
  abertos: { la: [0, 0, 1.1], ra: [0, 0, -1.1] },
};
export function man({ col = '#e9e9ee', pose = 'parado', walk = false, glow = 0 } = {}) {
  const m = mat(col, { r: 0.5, glow });
  const g = new THREE.Group();
  const head = sph(0.115, null, { m, y: 1.66 });
  const torso = sph(0.2, null, { m, y: 1.27 }); torso.scale.set(0.95, 1.45, 0.65);
  const hip = sph(0.15, null, { m, y: 0.98 }); hip.scale.set(1, 0.6, 0.7);
  g.add(head, torso, hip, box(0.025, 0.2, 0.02, '#ffd24a', { y: 1.2, z: 0.12, rd: 0.008 }));
  const limb = (x, y, len) => { const p = new THREE.Group(); p.position.set(x, y, 0); const c = cap(0.052, len, null, { m }); c.position.y = -len / 2 - 0.05; c.castShadow = true; p.add(c); g.add(p); return p; };
  const la = limb(0.215, 1.47, 0.5), ra = limb(-0.215, 1.47, 0.5), ll = limb(0.09, 0.95, 0.76), rl = limb(-0.09, 0.95, 0.76);
  const P = POSES[pose] || POSES.parado;
  la.rotation.set(...P.la); ra.rotation.set(...P.ra);
  g.userData.tick = (lt) => {
    if (pose === 'aceno') ra.rotation.z = -2.6 + Math.sin(lt * 7) * 0.35;
    if (pose === 'comemorando') { la.rotation.z = 2.5 + Math.sin(lt * 8) * 0.2; ra.rotation.z = -2.5 - Math.sin(lt * 8) * 0.2; }
    if (walk) { const s = Math.sin(lt * 7) * 0.5; ll.rotation.x = s; rl.rotation.x = -s; la.rotation.x = -s * 0.8; ra.rotation.x = s * 0.8; }
  };
  return g;
}
export function crowd({ n = 8, cols = 4, gap = 0.62, col = '#cfd2dc', hi = -1, hiCol = '#5dff9e', pose = 'parado' } = {}) {
  const g = new THREE.Group(), rows = Math.ceil(n / cols);
  for (let i = 0; i < n; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    const p = man({ col: i === hi ? hiCol : col, pose, glow: i === hi ? 0.3 : 0 });
    p.position.set((c - (cols - 1) / 2) * gap + (r % 2) * gap * 0.25, 0, -r * gap * 1.1 + (rows - 1) * gap * 0.55); g.add(p);
  }
  return g;
}
export function eyes({ nx = 6, ny = 4, sp = 0.32 } = {}) {
  const g = new THREE.Group(), w = mat('#fff', { glow: 0.5 }), k = mat('#111');
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    [-0.05, 0.05].forEach(dx => {
      const x = (i - (nx - 1) / 2) * sp + dx, y = 0.3 + j * sp * 0.8;
      const e = sph(0.045, null, { m: w, x, y, z: -j * 0.3 }); e.scale.z = 0.5; g.add(e);
      g.add(sph(0.02, null, { m: k, x: x + 0.01, y: y - 0.005, z: -j * 0.3 + 0.03 }));
    });
  }
  return g;
}

// ---------- PRÉDIOS / LUGARES ----------
export function house({ col = '@2', roof = ORG, door = '#2a2a3a', w = 0.62, h = 0.48 } = {}) {
  return group(box(w, h, 0.5, col, { rd: 0.03 }), box(w * 1.06, 0.1, 0.54, roof, { y: h, rd: 0.03 }),
    box(w * 0.26, h * 0.62, 0.02, door, { z: 0.25, rd: 0.01 }));
}
export function field({ nx = 9, nz = 7, sp = 0.36, col = '@3', roof = '@2', lit = 0, litCol = BLU, litRoof = ORG } = {}) {
  const g = new THREE.Group(), N = nx * nz;
  const mk = (geo, m) => { const im = new THREE.InstancedMesh(geo, m, N); im.castShadow = true; im.receiveShadow = true; g.add(im); return im; };
  const body = mk(new RoundedBoxGeometry(0.24, 0.2, 0.22, 2, 0.02), mat('#ffffff'));
  const top = mk(new RoundedBoxGeometry(0.26, 0.045, 0.24, 2, 0.015), mat('#ffffff'));
  const o = new THREE.Object3D(), cb = C(col), cr = C(roof), lb = C(litCol), lr = C(litRoof);
  const order = [];
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) order.push([i, k, Math.sin(i * 12.9898 + k * 78.233) * 43758.5453 % 1]);
  order.sort((a, b) => Math.abs(a[2]) - Math.abs(b[2]));
  order.forEach(([i, k], n) => {
    const x = (i - (nx - 1) / 2) * sp, z = -k * sp * 1.05 + 0.4;
    o.position.set(x, 0.1, z); o.updateMatrix(); body.setMatrixAt(n, o.matrix);
    o.position.set(x, 0.222, z); o.updateMatrix(); top.setMatrixAt(n, o.matrix);
  });
  g.userData.tick = (lt) => {
    const L = Math.round(Math.min(1, Math.max(0, val(lit, lt))) * N);
    for (let n = 0; n < N; n++) { body.setColorAt(n, n < L ? lb : cb); top.setColorAt(n, n < L ? lr : cr); }
    body.instanceColor.needsUpdate = true; top.instanceColor.needsUpdate = true;
  };
  return g;
}
export function tower({ h = 1.0, w = 0.3, col = '@2', win = '#ffe08a', lit = 0.3 } = {}) {
  const g = group(box(w, h, w, col, { rd: 0.02 })), mw = mat(win, { glow: 0.6 }), md = mat('#00000055', { op: 0.25 });
  const rows = Math.floor(h / 0.09);
  for (let r = 0; r < rows; r++) g.add(box(w * 0.7, 0.035, 0.01, null, { m: (Math.sin(r * 7.1 + h * 13) * 0.5 + 0.5) < lit ? mw : md, y: 0.06 + r * 0.09, z: w / 2 + 0.003, rd: 0 }));
  return g;
}
export function skyline({ n = 9, col = '@2', lit = 0.3 } = {}) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) { const t = tower({ h: 0.5 + Math.abs(Math.sin(i * 2.7)) * 0.8, w: 0.22, col, lit }); t.position.set((i - (n - 1) / 2) * 0.2, 0, -(i % 3) * 0.25); g.add(t); }
  return g;
}
export function pentaHouse({ txt = 'TESOURO', col = '#ff8f86', w = 1.2, h = 0.8 } = {}) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(0, h + w * 0.38); s.lineTo(-w / 2, h); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 }); geo.translate(0, 0, -0.25);
  const g = group(mesh(geo, mat(col, { glow: 0.08 })));
  const t = text({ txt, h: 0.13, col: '#8a2b2b' }); t.position.set(0, h * 0.45, 0.28); g.add(t); return g;
}
export function bank({ col = '#f1f1f4', txt = 'BANCO' } = {}) {
  const g = group(box(1.1, 0.08, 0.6, col), box(1.0, 0.12, 0.55, col, { y: 0.8 }));
  for (let i = 0; i < 5; i++) g.add(cyl(0.045, 0.72, col, { x: -0.4 + i * 0.2, y: 0.08 }));
  const r = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.62, 0.25, 3), mat(col)); r.rotation.y = Math.PI / 2; r.scale.z = 0.5; r.position.y = 1.04; r.castShadow = true; g.add(r);
  const t = text({ txt, h: 0.07, col: '#555' }); t.position.set(0, 0.83, 0.28); g.add(t); return g;
}
export function car({ col = '#ffd27a' } = {}) {
  const m = mat(col), w = mat('#3a3a44');
  const g = group(box(0.9, 0.2, 0.45, null, { m, y: 0.1, rd: 0.06 }), box(0.5, 0.17, 0.4, null, { m, x: -0.05, y: 0.29, rd: 0.05 }));
  [[-.3, .22], [.3, .22], [-.3, -.22], [.3, -.22]].forEach(([x, z]) => { const c = cyl(0.11, 0.08, null, { m: w, x, z }); c.rotation.x = Math.PI / 2; c.position.y = 0.11; g.add(c); });
  return g;
}
export function globe({ col = '#4d7cff', r = 0.4 } = {}) {
  const g = group(sph(r, col, { y: r, glow: 0.1 }));
  const ring = mesh(new THREE.TorusGeometry(r * 1.02, 0.02, 8, 48), mat('#5dff9e', { glow: 0.6 })); ring.position.y = r; ring.rotation.x = Math.PI / 2; g.add(ring);
  g.userData.tick = (lt) => { g.children[0].rotation.y = lt * 0.6; }; return g;
}
export function lotteryGlobe({ r = 0.45 } = {}) {
  const g = new THREE.Group(), gl = new THREE.Group(); gl.position.y = r + 0.18; g.add(gl);
  gl.add(mesh(new THREE.SphereGeometry(r, 32, 20), mat('#ffffff', { op: 0.18, r: 0.1 }), false));
  const ring = mesh(new THREE.TorusGeometry(r, 0.012, 8, 64), mat('#e8e8ee', { glow: 0.3 })); gl.add(ring);
  const bm = mat('#ffffff', { glow: 0.25 });
  for (let i = 0; i < 22; i++) { const a = i * 2.39996, y = -r * 0.75 + (i % 6) * 0.08; const b = sph(0.06, null, { m: bm, x: Math.cos(a) * (r * 0.55) * Math.abs(Math.sin(i * 7.3)), y, z: Math.sin(a) * r * 0.5 }); gl.add(b); }
  g.add(cyl(0.25, 0.08, '#d9d9e0'), cyl(0.04, 0.16, '#d9d9e0', { y: 0.06 }));
  g.userData.tick = (lt) => { gl.rotation.y = lt * 1.4; gl.rotation.z = Math.sin(lt) * 0.2; }; return g;
}

// ---------- FLUXO / INVESTIMENTO ----------
export function faucetBucket({ level = 0.4, flow = true, col = '#e8ecf4', fill = CASH } = {}) {
  const pipe = mat(col, { r: 0.3 });
  const g = group(box(0.08, 1.15, 0.08, null, { m: pipe, x: -0.42 }), box(0.5, 0.08, 0.08, null, { m: pipe, x: -0.21, y: 1.1 }),
    box(0.12, 0.16, 0.12, null, { m: pipe, x: 0, y: 0.98, rd: 0.03 }));
  const glass = mesh(new THREE.CylinderGeometry(0.3, 0.24, 0.55, 40, 1, true), mat('#ffffff', { op: 0.28, r: 0.05, side: THREE.DoubleSide }), false);
  glass.position.y = 0.275; g.add(glass, cyl(0.31, 0.02, '#ffffff', { y: 0.54, op: 0.6 }));
  const liq = cyl(0.235, 1, fill, { glow: 0.45 }); g.add(liq);
  const drops = new THREE.Group(), bm = mat(CASH, { glow: 0.45 }); g.add(drops);
  for (let i = 0; i < 6; i++) drops.add(box(0.1, 0.06, 0.02, null, { m: bm, rd: 0.01 }));
  g.userData.tick = (lt) => {
    const L = Math.max(0.02, Math.min(1, val(level, lt)));
    liq.scale.y = L * 0.5; liq.position.y = 0.01;
    drops.children.forEach((d, i) => {
      const ph = ((lt * 1.2 + i / 6) % 1); d.visible = !!val(flow, lt);
      d.position.set(Math.sin(i * 3) * 0.03, 0.9 - ph * (0.9 - L * 0.5), 0); d.rotation.set(ph * 5 + i, ph * 3, i);
    });
  };
  return g;
}
export function dome({ r = 0.32, col = '#ff8f86', stick = 0.7 } = {}) {
  const d = mesh(new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(col, { glow: 0.1 }));
  d.position.y = stick; return group(d, cyl(0.012, stick, '#ddd'));
}
export function scaleBal({ tilt = 0.15, left = null, right = null } = {}) {
  const m = mat('#f2eef2', { r: 0.3 }), g = group(box(0.4, 0.05, 0.3, '#a8323e'), box(0.06, 1.0, 0.06, null, { m }));
  const beam = new THREE.Group(); beam.position.y = 1.0; g.add(beam);
  beam.add(box(1.5, 0.05, 0.06, null, { m, y: -0.025 }));
  const pans = [-0.7, 0.7].map((x, i) => {
    const p = new THREE.Group(); p.position.x = x; beam.add(p);
    p.add(box(0.006, 0.3, 0.006, '#ddd', { y: -0.3 }));
    const pan = cyl(0.28, 0.03, null, { m, y: -0.33 }); p.add(pan);
    const it = [left, right][i]; if (it) { it.position.y = -0.3; p.add(it); }
    return p;
  });
  g.userData.tick = (lt) => { const a = val(tilt, lt); beam.rotation.z = a; pans.forEach(p => (p.rotation.z = -a)); };
  return g;
}
export function bars({ vals = [0.3, 0.6, 1], cols, g: grow = 1, w = 0.24, max = 1.2, labels } = {}) {
  const G = new THREE.Group(), bs = vals.map((v, i) => {
    const b = box(w, 1, w, (cols && cols[i]) || (i === vals.length - 1 ? CASH : '@1'), { x: (i - (vals.length - 1) / 2) * w * 1.5, glow: (cols && cols[i]) ? 0.1 : 0 });
    G.add(b); return b;
  });
  G.userData.tick = (lt) => { const k = Math.max(0.001, Math.min(1, val(grow, lt))); bs.forEach((b, i) => { const h = Math.max(0.001, vals[i] * max * k); b.scale.y = h; b.position.y = h / 2; }); };
  return G;
}
export function steps({ labels = ['PROTEGE', 'INVESTE', 'GASTA'], lit = 1, on = CASH, off = '#5a5a62' } = {}) {
  const g = new THREE.Group(), items = labels.map((t, i) => {
    const h = 0.25 + i * 0.22, b = box(0.5, h, 0.45, off, { x: (i - (labels.length - 1) / 2) * 0.54 });
    const tx = text({ txt: t, h: 0.07, col: '#123' }); tx.position.set(b.position.x, h * 0.35, 0.23);
    g.add(b, tx); return b;
  });
  g.userData.tick = (lt) => { const L = val(lit, lt); items.forEach((b, i) => { const o = i < L; b.material.color.copy(C(o ? on : off)); b.material.emissive.copy(o ? C(on) : new THREE.Color(0)); b.material.emissiveIntensity = o ? 0.35 : 0; }); };
  return g;
}
export function check({ col = '#5dff9e' } = {}) {
  const m = mat(col, { glow: 0.5 });
  const a = box(0.09, 0.22, 0.08, null, { m, base: false }); a.position.set(-0.08, 0.12, 0); a.rotation.z = 0.8;
  const b = box(0.09, 0.45, 0.08, null, { m, base: false }); b.position.set(0.1, 0.22, 0); b.rotation.z = -0.6;
  return group(a, b);
}
export function xMark({ col = RED } = {}) {
  const m = mat(col, { glow: 0.4 });
  const a = box(0.09, 0.5, 0.08, null, { m, base: false }); a.position.y = 0.25; a.rotation.z = 0.78;
  const b = box(0.09, 0.5, 0.08, null, { m, base: false }); b.position.y = 0.25; b.rotation.z = -0.78;
  return group(a, b);
}
export function arrow({ up = true, col = CASH, len = 0.7 } = {}) {
  const m = mat(col, { glow: 0.4 }), g = group(box(0.12, len, 0.1, null, { m }));
  const tip = mesh(new THREE.ConeGeometry(0.16, 0.24, 4), m); tip.position.y = len + 0.1; tip.rotation.y = Math.PI / 4; g.add(tip);
  if (!up) { g.rotation.z = Math.PI; g.position.y = len + 0.24; }
  return g;
}
export function clock({ col = '#f4f4f6', speed = 4 } = {}) {
  const face = cyl(0.36, 0.06, col, { y: 0 }); face.rotation.x = Math.PI / 2; face.position.y = 0.45;
  const k = mat('#333'), hh = new THREE.Group(), mh = new THREE.Group(); hh.position.set(0, 0.45, 0.04); mh.position.copy(hh.position);
  hh.add(box(0.025, 0.17, 0.01, null, { m: k })); mh.add(box(0.02, 0.27, 0.01, null, { m: k }));
  const g = group(face, hh, mh); g.userData.tick = (lt) => { mh.rotation.z = -lt * speed; hh.rotation.z = -lt * speed / 12; }; return g;
}
export function calendar({ txt = '90', sub = 'DIAS', col = '#f4f4f6' } = {}) {
  const g = card({ txt: txt + '\n' + sub, w: 0.5, h: 0.5, col, ink: '#1d1d25' });
  g.add(box(0.5, 0.09, 0.04, RED, { y: 0.45, rd: 0.015 })); return g;
}
export function table({ w = 1.2, col = '#b07a46' } = {}) {
  const g = group(box(w, 0.06, 0.6, col, { y: 0.5, rd: 0.02 }));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(box(0.06, 0.5, 0.06, col, { x: a * (w / 2 - 0.08), z: b * 0.22 })));
  return g;
}
export function phone({ txt = '', col = '#2a2a33', screen = '#f4f4f6' } = {}) {
  const g = group(box(0.42, 0.8, 0.05, col, { rd: 0.05 }), box(0.36, 0.7, 0.01, screen, { y: 0.05, z: 0.026, rd: 0.02, glow: 0.2 }));
  if (txt) { const t = text({ txt, h: 0.09, col: '#1d1d25' }); t.position.set(0, 0.34, 0.034); g.add(t); }
  return g;
}
export function curtain({ open = 0, col = '#e0343f' } = {}) {
  const m = mat(col, { r: 0.8 }), L = new THREE.Group(), R = new THREE.Group();
  for (let i = 0; i < 6; i++) { L.add(cyl(0.07, 2.2, null, { m, x: -0.07 - i * 0.13 })); R.add(cyl(0.07, 2.2, null, { m, x: 0.07 + i * 0.13 })); }
  const g = group(L, R); g.userData.tick = (lt) => { const o = Math.min(1, Math.max(0, val(open, lt))); L.position.x = -o * 1.0; R.position.x = o * 1.0; }; return g;
}
export function cage({ r = 0.5, h = 1.2, col = '#c9ccd6' } = {}) {
  const m = mat(col, { r: 0.3 }), g = group(cyl(r, 0.06, null, { m }), cyl(r, 0.06, null, { m, y: h }));
  for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; g.add(cyl(0.015, h, null, { m, x: Math.cos(a) * r, z: Math.sin(a) * r })); }
  return g;
}
export function scaffold({ col = '#7dffb0' } = {}) {
  const m = mat(col, { glow: 0.6 }), g = group(house({ col: '#c9cbe8', roof: ORG, w: 0.9, h: 0.6 }));
  [-0.55, 0.55].forEach(x => [-0.3, 0.3].forEach(z => g.add(box(0.025, 1.0, 0.025, null, { m, x, z }))));
  [0.33, 0.66, 0.99].forEach(y => g.add(box(1.12, 0.025, 0.025, null, { m, y, z: 0.3 })));
  return g;
}
export function envelope({ col = '#f1e7d0' } = {}) {
  const g = group(box(0.5, 0.32, 0.03, col, { rd: 0.01 }));
  const f = mesh(new THREE.ConeGeometry(0.29, 0.18, 3), mat('#e3d6b8')); f.rotation.set(0, 0, Math.PI); f.scale.z = 0.1; f.position.set(0, 0.25, 0.02); g.add(f);
  return g;
}
export function doc({ col = '#f4f4f6', lines = 5 } = {}) {
  const g = group(box(0.42, 0.56, 0.02, col, { rd: 0.01 }));
  for (let i = 0; i < lines; i++) g.add(box(0.3 - (i % 2) * 0.08, 0.025, 0.005, '#9aa0b0', { y: 0.42 - i * 0.07, z: 0.012, rd: 0 }));
  return g;
}

// ---------- PARTÍCULAS (usar em fx:[...] da cena ou como objeto) ----------
const rng = seed => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
function particles({ n, geo, m, area = [3.4, 4, 5], speed = [0.6, 1.2], spin = 0, seed = 3, col }) {
  const g = new THREE.Group(), im = new THREE.InstancedMesh(geo, m, n); im.castShadow = false; g.add(im);
  const r = rng(seed), P = Array.from({ length: n }, () => [(r() - 0.5) * area[0], r(), (r() - 0.7) * area[2], lerpN(speed[0], speed[1], r()), r() * 6]);
  if (col) P.forEach((_, i) => im.setColorAt(i, C(col[i % col.length])));
  const o = new THREE.Object3D();
  g.userData.tick = (lt, T) => {
    P.forEach(([x, y0, z, sp, ph], i) => {
      const y = ((y0 - T * sp / area[1]) % 1 + 1) % 1 * area[1];
      o.position.set(x + Math.sin(T * 0.8 + ph) * 0.05 * spin, y, z); o.rotation.set(spin * (T * 2 + ph), spin * (T * 3 + ph), spin * ph);
      o.updateMatrix(); im.setMatrixAt(i, o.matrix);
    });
    im.instanceMatrix.needsUpdate = true;
  };
  return g;
}
const lerpN = (a, b, k) => a + (b - a) * k;
export function rain({ n = 160 } = {}) {
  return particles({ n, geo: new THREE.BoxGeometry(0.008, 0.22, 0.008), m: new THREE.MeshBasicMaterial({ color: '#dfe6f0', transparent: true, opacity: 0.55 }), speed: [6, 9], area: [5, 4, 6] });
}
export function coinRain({ n = 40 } = {}) {
  const geo = new THREE.CylinderGeometry(0.07, 0.07, 0.015, 20); geo.rotateX(Math.PI / 2);
  return particles({ n, geo, m: mat(GOLD, { glow: 0.25, r: 0.3 }), speed: [1.2, 2], spin: 1, seed: 11, area: [3.4, 4, 4] });
}
export function billRain({ n = 36 } = {}) {
  return particles({ n, geo: new THREE.BoxGeometry(0.2, 0.01, 0.1), m: mat(CASH, { glow: 0.4 }), speed: [0.8, 1.4], spin: 1, seed: 21, area: [3.4, 4, 4] });
}
export function confetti({ n = 90 } = {}) {
  return particles({ n, geo: new THREE.PlaneGeometry(0.05, 0.03), m: new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, color: '#ffffff' }), speed: [0.7, 1.3], spin: 1, seed: 5, area: [3.4, 4, 4], col: ['#ff5a5f', '#ffd24a', '#5dff9e', '#4d7cff', '#ff8af0'] });
}
export function sparkles({ n = 30, burst = false, col = '#ffffff' } = {}) {
  const g = new THREE.Group(), m = mat(col, { glow: 0.8 }), r = rng(9), ps = [];
  for (let i = 0; i < n; i++) { const p = sph(0.008 + r() * 0.012, null, { m }); p.castShadow = false; p.userData.d = [r() * 6.28, r() * 3.14, 0.4 + r() * 0.8, r() * 6]; g.add(p); ps.push(p); }
  g.userData.tick = (lt, T) => ps.forEach(p => {
    const [a, b, sp, ph] = p.userData.d;
    if (burst) { const k = 1 - Math.pow(1 - Math.min(1, lt / 0.8), 3), rr = k * sp * 0.9; p.position.set(Math.cos(a) * Math.sin(b) * rr, Math.cos(b) * rr * 0.7, Math.sin(a) * Math.sin(b) * rr); p.scale.setScalar(Math.max(0.001, 1 - lt / 1.0)); }
    else { p.position.set(Math.cos(a) * sp, 0.3 + Math.sin(b) * sp * 0.8, Math.sin(a) * 0.4); p.scale.setScalar(Math.max(0.001, Math.abs(Math.sin(T * 2 + ph)))); }
  });
  return g;
}

// ---------- OBJETOS EXTRAS ----------
export function f1car({ col = '#5dff9e', glow = 0.35 } = {}) {
  const m = mat(col, { glow, r: 0.35 }), k = mat('#26262e', { r: 0.8 }), w = mat('#e9e9ee');
  const g = group(box(1.7, 0.12, 0.34, null, { m, y: 0.1, rd: 0.05 }), box(0.5, 0.16, 0.3, null, { m, x: 0.05, y: 0.18, rd: 0.06 }),
    box(0.12, 0.04, 0.9, null, { m, x: 0.95, y: 0.08, rd: 0.015 }), box(0.14, 0.2, 0.8, null, { m, x: -0.85, y: 0.32, rd: 0.02 }),
    box(0.06, 0.2, 0.06, null, { m: k, x: -0.8, y: 0.12 }), sph(0.075, null, { m: w, x: 0.08, y: 0.36 }));
  [[0.6, 0.38], [-0.6, 0.38], [0.6, -0.38], [-0.6, -0.38]].forEach(([x, z]) => { const c = cyl(0.16, 0.16, null, { m: k, seg: 24 }); c.rotation.x = Math.PI / 2; c.position.set(x, 0.16, z); g.add(c); });
  g.userData.tick = (lt) => { g.position.y = Math.abs(Math.sin(lt * 18)) * 0.006; };
  return g;
}
export function boat({ col = '#f3e9da', hull = '#f0d2b4', label = '' } = {}) {
  const g = group(box(1.4, 0.22, 0.5, hull, { rd: 0.1 }), box(0.7, 0.3, 0.38, col, { x: -0.05, y: 0.22, rd: 0.04 }), box(0.4, 0.14, 0.3, col, { x: -0.05, y: 0.52, rd: 0.03 }),
    box(0.3, 0.05, 0.01, BLU, { x: -0.05, y: 0.36, z: 0.195, rd: 0.01 }));
  if (label) { const t = text({ txt: label, h: 0.06, col: '#333' }); t.position.set(-0.05, 0.27, 0.2); g.add(t); }
  g.userData.tick = (lt) => { g.rotation.z = Math.sin(lt * 1.4) * 0.03; g.position.y = Math.sin(lt * 1.8) * 0.02; };
  return g;
}
export function water({ col = '#4d7cff', w = 4, d = 3 } = {}) { const p = box(w, 0.04, d, col, { rd: 0, glow: 0.1 }); p.material.roughness = 0.2; return p; }
export function truck({ col = '#f4f4f6', cab = BLU, txt = '' } = {}) {
  const w = mat('#2a2a33'), g = group(box(1.0, 0.5, 0.5, col, { x: -0.2, y: 0.12, rd: 0.03 }), box(0.36, 0.4, 0.48, cab, { x: 0.52, y: 0.12, rd: 0.06 }),
    box(0.02, 0.16, 0.36, '#bfe2ff', { x: 0.7, y: 0.32, rd: 0.01, glow: 0.2 }));
  [[-0.45, .25], [0.1, .25], [0.52, .25], [-0.45, -.25], [0.1, -.25], [0.52, -.25]].forEach(([x, z]) => { const c = cyl(0.11, 0.08, null, { m: w }); c.rotation.x = Math.PI / 2; c.position.set(x, 0.11, z); g.add(c); });
  if (txt) { const t = text({ txt, h: 0.09, col: '#333' }); t.position.set(-0.2, 0.32, 0.256); g.add(t); }
  return g;
}
export function storeFront({ col = '#4b5cff', sign = ORG, door = '#1d1d25', txt = '', w = 1.0, h = 0.75 } = {}) {
  const g = group(box(w, h, 0.5, col, { rd: 0.03 }), box(w * 0.86, 0.18, 0.06, sign, { y: h - 0.08, z: 0.26, rd: 0.03, glow: 0.25 }),
    box(w * 0.28, h * 0.55, 0.02, door, { z: 0.255, rd: 0.01 }));
  if (txt) { const t = text({ txt, h: 0.09, col: '#fff' }); t.position.set(0, h - 0.05, 0.3); g.add(t); }
  return g;
}
export function logoCard({ txt = 'MARCA', sub = '', col = '#ffffff', ink = '#1f3fbf', w = 0.95, h = 0.36 } = {}) {
  const g = card({ txt, w, h, col, ink });
  if (sub) { const t = text({ txt: sub, h: 0.04, col: '#667' }); t.position.set(0, h - 0.07, 0.02); g.add(t); }
  return g;
}
export function trophy({ col = GOLD } = {}) {
  const m = mat(col, { glow: 0.25, r: 0.25 });
  const cup = mesh(new THREE.CylinderGeometry(0.22, 0.1, 0.3, 28), m); cup.position.y = 0.55;
  return group(box(0.32, 0.08, 0.32, '#3a3a44'), cyl(0.04, 0.32, null, { m, y: 0.08 }), cup,
    ...[-1, 1].map(s => { const h = mesh(new THREE.TorusGeometry(0.08, 0.02, 8, 20), m); h.position.set(s * 0.24, 0.57, 0); h.rotation.y = Math.PI / 2; return h; }));
}
export function podium({ cols = ['@2', '@1', '@3'], labels = ['2', '1', '3'] } = {}) {
  const hs = [0.32, 0.48, 0.22], g = new THREE.Group();
  hs.forEach((h, i) => { const b = box(0.42, h, 0.4, cols[i], { x: (i - 1) * 0.44 }); g.add(b); const t = text({ txt: labels[i], h: 0.1, col: '#1d1d25' }); t.position.set((i - 1) * 0.44, h * 0.3, 0.205); g.add(t); });
  return g;
}
export function magnifier({ col = '#e9e9ee' } = {}) {
  const ring = mesh(new THREE.TorusGeometry(0.22, 0.035, 12, 40), mat(col, { r: 0.3 })); ring.position.y = 0.62;
  const glass = mesh(new THREE.CircleGeometry(0.2, 32), mat('#bfe2ff', { op: 0.35, r: 0.05 }), false); glass.position.y = 0.62;
  const h = box(0.06, 0.34, 0.06, '#3a3a44', { base: false }); h.position.set(0.22, 0.3, 0); h.rotation.z = 0.7;
  return group(ring, glass, h);
}
export function laptop({ txt = '', screen = '#f4f4f6' } = {}) {
  const lid = new THREE.Group(); lid.position.set(0, 0.04, -0.22); lid.rotation.x = -0.25;
  lid.add(box(0.8, 0.5, 0.03, '#3a3a44', { rd: 0.02 }), box(0.72, 0.42, 0.01, screen, { y: 0.04, z: 0.017, rd: 0.01, glow: 0.25 }));
  if (txt) { const t = text({ txt, h: 0.08, col: '#1d1d25' }); t.position.set(0, 0.18, 0.025); lid.add(t); }
  return group(box(0.82, 0.04, 0.5, '#4a4a55', { rd: 0.015 }), lid);
}
export function suitcase({ col = '#3a3a44', open = 0 } = {}) {
  const g = group(box(0.7, 0.45, 0.22, col, { rd: 0.05 }), box(0.22, 0.06, 0.05, '#222', { y: 0.47, rd: 0.02 }));
  return g;
}
export function bed({ col = '#6a4fc9', sheet = '#ff8f86' } = {}) {
  return group(box(1.0, 0.22, 0.6, col, { rd: 0.04 }), box(0.9, 0.08, 0.56, '#f4f4f6', { y: 0.22, rd: 0.03 }), box(0.6, 0.04, 0.58, sheet, { x: 0.15, y: 0.3, rd: 0.02 }),
    box(0.06, 0.45, 0.6, col, { x: -0.5, rd: 0.03 }), box(0.18, 0.08, 0.36, '#ffffff', { x: -0.36, y: 0.3, rd: 0.03 }));
}
export function plane({ col = '#f4f4f6' } = {}) {
  const m = mat(col), body = cap(0.09, 0.9, null, { m }); body.rotation.z = Math.PI / 2; body.position.y = 0.5;
  return group(body, box(0.25, 0.02, 1.0, null, { m, y: 0.48 }), box(0.12, 0.02, 0.36, null, { m, x: -0.48, y: 0.52 }), box(0.12, 0.18, 0.02, null, { m, x: -0.5, y: 0.6 }));
}
export function bigCoin({ txt = 'R$', col = GOLD } = {}) {
  const c = cyl(0.42, 0.08, col, { glow: 0.2, seg: 48 }); c.rotation.x = Math.PI / 2; c.position.y = 0.45;
  const t = text({ txt, h: 0.22, col: '#8a6a10' }); t.position.set(0, 0.34, 0.045);
  const g = group(c, t); g.userData.tick = (lt) => { g.rotation.y = Math.sin(lt * 1.5) * 0.4; }; return g;
}
export function gavel({ col = '#8a5a34' } = {}) {
  const head = cyl(0.08, 0.36, col); head.rotation.z = Math.PI / 2; head.position.set(0.18, 0.5, 0);
  const handle = box(0.04, 0.5, 0.04, col, { base: false }); handle.position.set(0, 0.3, 0); handle.rotation.z = -0.5;
  const g = group(cyl(0.2, 0.06, col), head, handle); return g;
}
export function lineChart({ vals = [0.2, 0.35, 0.3, 0.6, 0.9], col = CASH, g: grow = 1 } = {}) {
  const G = new THREE.Group(), n = vals.length, pts = vals.map((v, i) => new THREE.Vector3((i / (n - 1) - 0.5) * 1.4, 0.1 + v * 1.1, 0));
  const segs = pts.slice(1).map((p, i) => { const a = pts[i], d = p.clone().sub(a), b = box(d.length(), 0.05, 0.05, col, { glow: 0.5, base: false });
    b.position.copy(a).add(d.clone().multiplyScalar(0.5)); b.rotation.z = Math.atan2(d.y, d.x); G.add(b); return b; });
  const dots = pts.map(p => { const s = sph(0.045, col, { glow: 0.6 }); s.position.copy(p); G.add(s); return s; });
  G.add(box(1.6, 0.02, 0.02, '@1', { y: 0.05 }));
  G.userData.tick = (lt) => { const k = Math.min(1, Math.max(0, val(grow, lt))) * (n - 1); segs.forEach((s, i) => (s.visible = i < k)); dots.forEach((d, i) => (d.visible = i <= k)); };
  return G;
}

// ---------- PALCO (estilo B): objetos de cenário realista-estilizado ----------
const ACC = () => PAL.acc || '#ffe14a';
const WOOD = '#b07a46', STEEL = '#8a8f99', PAPER = '#f2f0ea', INK = '#2a2a30';
// papel/recibo com linhas tarjadas (sigilo); hl = índice da linha destacada na cor de destaque
export function receipt({ lines = 9, hl = -1, w = 0.42, h = 0.9, redacted = true } = {}) {
  const g = group(box(w, 0.012, h, PAPER, { rd: 0.004 }));
  for (let i = 0; i < lines; i++) { const z = -h / 2 + 0.1 + i * ((h - 0.16) / lines);
    g.add(box(w * (redacted ? 0.8 : 0.55 + (i % 3) * 0.1), 0.006, 0.045, i === hl ? ACC() : (redacted ? INK : '#9aa0b0'), { y: 0.012, z, rd: 0.002, glow: i === hl ? 0.6 : 0 })); }
  [-1, 1].forEach(sx => { for (let i = 0; i < 9; i++) g.add(cyl(0.008, 0.004, '#cfcfd6', { x: sx * (w / 2 - 0.025), y: 0.012, z: -h / 2 + 0.06 + i * (h - 0.12) / 8, seg: 8 })); });
  return g;
}
export function padlock({ col, open = 0 } = {}) {
  const c = col || ACC(), m = mat(c, { glow: 0.35, r: 0.3 });
  const shackle = mesh(new THREE.TorusGeometry(0.07, 0.016, 8, 24, Math.PI), mat('#c9ccd6', { r: 0.25 }));
  shackle.position.y = 0.16;
  const g = group(box(0.2, 0.16, 0.09, null, { m, rd: 0.025 }), shackle, cyl(0.016, 0.03, '#333', { y: 0.06, z: 0.04 }));
  g.children[2].rotation.x = Math.PI / 2; g.children[2].position.set(0, 0.07, 0.046);
  g.userData.tick = (lt) => { const o = clamp01(val(open, lt)); shackle.position.y = 0.16 + o * 0.06; shackle.rotation.y = o * 1.2; };
  return g;
}
const clamp01 = x => Math.min(1, Math.max(0, x));
// livro-caixa aberto: linhas escritas; hl = linha destacada; blank = linha em branco (vazia)
export function ledger({ hl = -1, blank = -1, w = 1.0, d = 0.66 } = {}) {
  const g = group(box(w, 0.03, d, '#3a2f2a', { rd: 0.01 }));
  [-1, 1].forEach(sx => {
    const pg = box(w / 2 - 0.03, 0.025, d - 0.05, PAPER, { x: sx * (w / 4), y: 0.03, rd: 0.006 }); pg.rotation.z = sx * -0.04; g.add(pg);
    for (let i = 0; i < 9; i++) { if (sx > 0 && i === blank) continue;
      const on = sx > 0 && i === hl; g.add(box((w / 2 - 0.12) * (0.6 + 0.4 * Math.abs(Math.sin(i * 3.3 + sx))), 0.004, 0.018, on ? ACC() : '#8d8f9a', { x: sx * (w / 4) - 0.02, y: 0.058, z: -d / 2 + 0.07 + i * 0.058, rd: 0.002, glow: on ? 0.6 : 0 })); }
  });
  if (blank >= 0) g.add(box(w / 2 - 0.12, 0.006, 0.04, ACC(), { x: w / 4 - 0.02, y: 0.058, z: -d / 2 + 0.07 + blank * 0.058, rd: 0.004, glow: 0.7 }));
  return g;
}
export function calculator({ col = '#2a2a33', screen } = {}) {
  const g = group(box(0.5, 0.06, 0.62, col, { rd: 0.04 }), box(0.4, 0.012, 0.12, screen || ACC(), { y: 0.06, z: -0.2, rd: 0.01, glow: 0.6 }));
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) g.add(box(0.075, 0.025, 0.07, r === 3 && c === 3 ? ACC() : '#f1f1f4', { x: -0.14 + c * 0.093, y: 0.06, z: -0.02 + r * 0.09, rd: 0.012, glow: r === 3 && c === 3 ? 0.4 : 0 }));
  return g;
}
export function register({ txt = '' } = {}) { // caixa registradora / contador de doações
  const g = group(box(0.8, 0.32, 0.5, '#3a3a44', { rd: 0.04 }), box(0.66, 0.2, 0.06, '#1d1d25', { y: 0.33, z: -0.1, rd: 0.02 }), box(0.56, 0.12, 0.012, ACC(), { y: 0.37, z: -0.065, rd: 0.01, glow: 0.7 }));
  if (txt) { const t = text({ txt, h: 0.09, col: '#111' }); t.position.set(0, 0.38, -0.055); g.add(t); }
  return g;
}
export function cowBank({ col = '#f4f4f6', spots = '#1d1d25' } = {}) { // cofrinho de vaquinha
  const m = mat(col, { r: 0.4 }), k = mat(spots);
  const body = sph(0.3, null, { m, y: 0.38 }); body.scale.set(1.3, 0.95, 0.9);
  const g = group(body, sph(0.17, null, { m, x: 0.4, y: 0.48 }), sph(0.1, '#f3a6b8', { x: 0.54, y: 0.42 }));
  [[-0.1, 0.55, 0.2, 0.12], [0.15, 0.45, -0.22, 0.1], [-0.25, 0.35, -0.15, 0.09], [0.05, 0.3, 0.25, 0.08]].forEach(([x, y, z, r]) => { const sp = sph(r, null, { m: k, x, y, z }); sp.scale.set(1, 0.8, 0.35); g.add(sp); });
  [[-.2, .15], [.2, .15], [-.2, -.15], [.2, -.15]].forEach(([x, z]) => g.add(cyl(0.05, 0.16, null, { m, x, z })));
  [-1, 1].forEach(s => { const h = cap(0.02, 0.06, '#f1e3c0'); h.position.set(0.42, 0.66, s * 0.07); h.rotation.z = -0.5; g.add(h); });
  g.add(box(0.12, 0.015, 0.03, '#333', { y: 0.66, rd: 0.004 }));
  return g;
}
export function ballotBox({ col = '#f4f4f6' } = {}) { // urna eletrônica (genérica)
  const g = group(box(0.7, 0.2, 0.46, col, { rd: 0.04 }), box(0.3, 0.012, 0.22, '#1d1d25', { x: -0.14, y: 0.2, rd: 0.01 }));
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) g.add(box(0.045, 0.015, 0.035, '#2a2a33', { x: 0.13 + c * 0.06, y: 0.2, z: -0.09 + r * 0.055, rd: 0.006 }));
  g.add(box(0.06, 0.016, 0.035, '#2f9e5a', { x: 0.25, y: 0.2, z: 0.14, rd: 0.006 }));
  return g;
}
// mesa de escritório com gaveta que abre (open: 0..1, pode ser função)
export function desk({ w = 1.8, d = 0.85, h = 0.78, col = WOOD, open = 0, drawerItem = null } = {}) {
  const m = mat(col, { r: 0.55 }), g = group(box(w, 0.06, d, null, { m, y: h - 0.06, rd: 0.02 }));
  g.add(box(0.5, h - 0.06, d - 0.04, null, { m, x: w / 2 - 0.27, rd: 0.02 }), box(0.06, h - 0.06, d - 0.06, null, { m, x: -w / 2 + 0.05, rd: 0.01 }));
  const dr = new THREE.Group(); dr.position.set(w / 2 - 0.27, h - 0.22, 0); g.add(dr);
  dr.add(box(0.44, 0.13, d - 0.1, '#9a6a3c', { y: -0.06, rd: 0.012 }), box(0.46, 0.15, 0.03, null, { m, y: -0.075, z: d / 2 - 0.03, rd: 0.012 }), box(0.12, 0.02, 0.02, '#d9d9e0', { y: 0.0, z: d / 2 - 0.005, rd: 0.006 }));
  if (drawerItem) { drawerItem.position.set(0, 0.0, 0); dr.add(drawerItem); }
  for (let i = 1; i < 3; i++) g.add(box(0.46, 0.15, 0.03, null, { m, x: w / 2 - 0.27, y: h - 0.22 - i * 0.2 - 0.075, z: d / 2 - 0.03, rd: 0.012 }), box(0.12, 0.02, 0.02, '#d9d9e0', { x: w / 2 - 0.27, y: h - 0.22 - i * 0.2, z: d / 2 - 0.01, rd: 0.006 }));
  g.userData.tick = (lt) => { dr.position.z = clamp01(val(open, lt)) * (d * 0.55); };
  return g;
}
export function filingCabinet({ n = 4, col = STEEL, open = -1, k = 0 } = {}) { // arquivo de aço; open = índice da gaveta aberta
  const m = mat(col, { r: 0.35 }), g = group(box(0.62, n * 0.3 + 0.04, 0.6, null, { m, rd: 0.015 })); const drs = [];
  for (let i = 0; i < n; i++) { const d = new THREE.Group(); d.position.set(0, 0.04 + i * 0.3 + 0.13, 0.3); g.add(d); drs.push(d);
    d.add(box(0.56, 0.26, 0.03, '#a4a9b3', { y: -0.13, rd: 0.01 }), box(0.16, 0.025, 0.03, '#d9d9e0', { y: 0.03, z: 0.02, rd: 0.008 }), box(0.12, 0.05, 0.01, '#f4f4f6', { y: -0.05, z: 0.017, rd: 0.004 })); }
  g.userData.tick = (lt) => drs.forEach((d, i) => { d.position.z = 0.3 + (i === open ? clamp01(val(k, lt)) * 0.35 : 0); });
  return g;
}
// painel de mapa na parede: grade de pontos + rotas em arco ([[x1,y1,x2,y2],...] em -1..1) que se desenham (prog 0..1)
export function wallMap({ w = 3.2, h = 1.7, routes = [], prog = 1, col = '#2a2c33' } = {}) {
  const g = group(box(w + 0.12, h + 0.12, 0.05, '#1a1b20', { rd: 0.02, base: false }), box(w, h, 0.02, col, { z: 0.03, rd: 0.01, base: false }));
  const dm = mat('#6b6f7a', { glow: 0.15 }), dg = new THREE.SphereGeometry(0.012, 6, 4);
  const blobs = [[-0.55, 0.25, 0.28, 0.32], [-0.35, -0.35, 0.16, 0.3], [0.05, 0.35, 0.18, 0.22], [0.1, -0.15, 0.17, 0.32], [0.5, 0.3, 0.38, 0.28], [0.75, -0.45, 0.14, 0.12]];
  for (let x = -0.95; x <= 0.95; x += 0.045) for (let y = -0.9; y <= 0.9; y += 0.08) {
    if (!blobs.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1)) continue;
    const d = new THREE.Mesh(dg, dm); d.position.set(x * w / 2, y * h / 2, 0.045); g.add(d); }
  const am = mat(ACC(), { glow: 0.8 }), arcs = routes.map(([x1, y1, x2, y2]) => {
    const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push(new THREE.Vector3((x1 + (x2 - x1) * t) * w / 2, ((y1 + (y2 - y1) * t) + Math.sin(t * Math.PI) * 0.35) * h / 2, 0.05)); }
    const ms = pts.map(p => { const s_ = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 4), am); s_.position.copy(p); g.add(s_); return s_; }); return ms; });
  g.userData.tick = (lt) => { const k = clamp01(val(prog, lt)); arcs.forEach(ms => ms.forEach((m_, i) => (m_.visible = i / ms.length <= k))); };
  return g;
}
export function lamp({ col = '#1d1d25' } = {}) { // luminária de mesa
  const m = mat(col, { r: 0.3 }), arm1 = box(0.03, 0.42, 0.03, null, { m, base: false }), arm2 = box(0.03, 0.34, 0.03, null, { m, base: false });
  arm1.position.set(0.02, 0.22, 0); arm1.rotation.z = -0.25; arm2.position.set(0.18, 0.45, 0); arm2.rotation.z = 1.1;
  const shade = mesh(new THREE.ConeGeometry(0.13, 0.17, 24, 1, true), mat(col, { side: THREE.DoubleSide, r: 0.3 })); shade.position.set(0.33, 0.4, 0); shade.rotation.z = 0.6;
  const bulb = sph(0.04, '#fff6cc', { x: 0.36, y: 0.36, glow: 1.2 });
  return group(cyl(0.11, 0.025, null, { m }), arm1, arm2, shade, bulb);
}
export function safe({ open = 0, bars = 6, col = '#55585f' } = {}) { // cofre oco que abre e mostra barras de ouro
  const m = mat(col, { r: 0.4 }), inner = mat('#26272c', { r: 0.9 }), W = 0.9, H = 1.0, D = 0.7, T = 0.06;
  const g = group(box(W, T, D, null, { m, rd: 0.02 }), box(W, T, D, null, { m, y: H - T, rd: 0.02 }),
    box(T, H, D, null, { m, x: -W / 2 + T / 2, rd: 0.02 }), box(T, H, D, null, { m, x: W / 2 - T / 2, rd: 0.02 }),
    box(W - 2 * T, H - 2 * T, T, null, { m: inner, y: T, z: -D / 2 + T / 2, rd: 0 }), box(W - 2 * T, 0.03, D - T, '#3a3c42', { y: 0.47, z: T / 2, rd: 0 }));
  for (let i = 0; i < bars; i++) g.add(box(0.2, 0.08, 0.14, ACC(), { x: -0.24 + (i % 3) * 0.24, y: i < 3 ? T : 0.5, z: 0.02, rd: 0.015, glow: 0.7 }));
  const door = new THREE.Group(); door.position.set(-W / 2, 0, D / 2 + 0.04); g.add(door);
  door.add(box(W, H, 0.07, null, { m, x: W / 2, rd: 0.02 }));
  const wheel = mesh(new THREE.TorusGeometry(0.11, 0.022, 8, 24), mat(ACC(), { glow: 0.5 })); wheel.position.set(W / 2, H / 2, 0.05); door.add(wheel);
  for (let i = 0; i < 3; i++) { const sp = box(0.2, 0.02, 0.02, ACC(), { base: false, glow: 0.4 }); sp.position.set(W / 2, H / 2, 0.05); sp.rotation.z = i * Math.PI / 3; door.add(sp); }
  g.userData.tick = (lt) => { door.rotation.y = -clamp01(val(open, lt)) * 1.9; wheel.rotation.z = lt * 0.6; };
  return g;
}
export function goldBars({ n = 3, col } = {}) { const g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(box(0.36, 0.14, 0.2, col || ACC(), { x: (i - (n - 1) / 2) * 0.4, rd: 0.02, glow: 0.7 })); return g; }
// casa de tijolos com pilares (metáfora de "estrutura"): crack 0..1 (rachadura), collapse 0..1 (desaba)
export function brickHouse({ col = '#e9e4da', roof = '#d8d2c6', crack = 0, collapse = 0, w = 1.3, h = 0.95 } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const mb = mat(col, { r: 0.8 }), mr = mat('#c9c2b4');
  body.add(box(w, h, 0.8, null, { m: mb, rd: 0.02 }));
  for (let r = 0; r < 9; r++) for (let c = 0; c < 6; c++) if ((r + c) % 2) body.add(box(w / 6 - 0.02, h / 9 - 0.02, 0.01, null, { m: mr, x: -w / 2 + (c + 0.5) * w / 6 + (r % 2 ? 0.05 : 0), y: (r + 0.5) * h / 9, z: 0.405, rd: 0 }));
  [-0.45, -0.15, 0.15, 0.45].forEach(x => body.add(box(0.08, h * 0.9, 0.08, '#f8f6f0', { x: x * w, z: 0.44, rd: 0.02 })));
  const rf = mesh(new THREE.CylinderGeometry(0.01, w * 0.78, 0.55, 4, 1), mat(roof)); rf.rotation.y = Math.PI / 4; rf.scale.z = 0.7; rf.position.y = h + 0.27; rf.castShadow = true; body.add(rf);
  body.add(box(0.22, 0.32, 0.03, '#3a3a44', { y: 0, z: 0.42, rd: 0.01 }), box(0.26, 0.2, 0.03, '#3a3a44', { x: 0.35 * w, y: h * 0.55, z: 0.42, rd: 0.01 }), box(0.12, 0.3, 0.12, col, { x: -0.3 * w, y: h + 0.25, rd: 0.01 }));
  const cr = new THREE.Group(); body.add(cr); const cm = mat(ACC(), { glow: 1.0 });
  for (let i = 0; i < 8; i++) { const sgm = box(0.025, h / 8 + 0.02, 0.012, null, { m: cm, base: false }); sgm.position.set(0.05 + (i % 2 ? 0.05 : -0.04), (i + 0.5) * h / 8, 0.415); sgm.rotation.z = i % 2 ? 0.5 : -0.5; cr.add(sgm); }
  g.userData.tick = (lt) => { const c_ = clamp01(val(crack, lt)); cr.children.forEach((sg, i) => (sg.visible = i / 8 < c_));
    const k = clamp01(val(collapse, lt)); body.rotation.z = -k * 0.35; body.position.y = -k * 0.15; body.scale.y = 1 - k * 0.55; body.rotation.x = k * 0.12; };
  return g;
}
// boneco com acessórios: sash (faixa verde-amarela), badge (crachá), glasses, capCol (boné), suit (terno escuro)
export function person({ col = '#e9e9ee', pose = 'parado', walk = false, sash = false, badge = false, glasses = false, capCol = null, suit = null, glow = 0 } = {}) {
  const g = man({ col: suit || col, pose, walk, glow });
  if (suit) { g.add(sph(0.119, col, { y: 1.66 })); g.add(box(0.1, 0.26, 0.02, '#f4f4f6', { y: 1.28, z: 0.125, rd: 0.01 }), box(0.03, 0.2, 0.025, '#b8342e', { y: 1.3, z: 0.135, rd: 0.008 })); }
  if (sash) { const s1 = box(0.07, 0.62, 0.02, '#2f9e5a', { base: false }); s1.position.set(0, 1.25, 0.14); s1.rotation.z = 0.6; const s2 = box(0.025, 0.62, 0.022, '#ffd24a', { base: false }); s2.position.set(0.01, 1.25, 0.15); s2.rotation.z = 0.6; g.add(s1, s2); }
  if (badge) g.add(box(0.07, 0.1, 0.01, '#f4f4f6', { x: 0.07, y: 1.24, z: 0.135, rd: 0.01 }), box(0.004, 0.12, 0.004, '#333', { x: 0.07, y: 1.33, z: 0.13 }));
  if (glasses) [-1, 1].forEach(sx => { const r = mesh(new THREE.TorusGeometry(0.035, 0.008, 6, 16), mat('#111')); r.position.set(sx * 0.045, 1.67, 0.105); g.add(r); });
  if (capCol) { g.add(sph(0.12, capCol, { y: 1.7 })); g.children.at(-1).scale.y = 0.6; g.add(box(0.15, 0.012, 0.12, capCol, { y: 1.72, z: 0.1, rd: 0.005 })); }
  return g;
}

export const LIB = {
  receipt, padlock, ledger, calculator, register, cowBank, ballotBox, desk, filingCabinet, wallMap, lamp, safe, goldBars, brickHouse, person,
  rain, coinRain, billRain, confetti, sparkles, f1car, boat, water, truck, storeFront, logoCard, trophy, podium, magnifier,
  laptop, suitcase, bed, plane, bigCoin, gavel, lineChart,
  cashBlock, cashCrumble, coinStack, bill, piggy, card, questionBox, ticket, sign, man, crowd, eyes, house, field, tower, skyline,
  pentaHouse, bank, car, globe, lotteryGlobe, faucetBucket, dome, scaleBal, bars, steps, check, xMark, arrow, clock, calendar,
  table, phone, curtain, cage, scaffold, envelope, doc, text, box, sph, cyl, group,
};
