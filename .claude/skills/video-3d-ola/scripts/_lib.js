// Servidor local + navegador compartilhados pelos scripts shot.js e render.js
const http = require('http'), fs = require('fs'), path = require('path');
const ENGINE = path.resolve(__dirname, '..', 'engine');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png' };

function serve(videoFile) {
  const vdir = path.dirname(path.resolve(videoFile));
  return new Promise(res => {
    const srv = http.createServer((q, r) => {
      const u = decodeURIComponent(q.url.split('?')[0]);
      let f = null;
      if (u.startsWith('/engine/')) f = path.join(ENGINE, u.slice(8));
      else if (u.startsWith('/v/')) f = path.join(vdir, u.slice(3));
      if (!f || !(f.startsWith(ENGINE) || f.startsWith(vdir)) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
      fs.createReadStream(f).pipe(r);
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}

async function openPage(videoFile, { scale = 1, fast = false, extra = '' } = {}) {
  const { chromium } = require('playwright');
  const srv = await serve(videoFile);
  const base = path.basename(videoFile), tj = base.replace(/\.js$/, '.tempos.json');
  const hasT = fs.existsSync(path.join(path.dirname(path.resolve(videoFile)), tj));
  const url = `http://127.0.0.1:${srv.address().port}/engine/index.html?video=/v/${encodeURIComponent(base)}&scale=${scale}${fast ? '&fast=1' : ''}${extra}` + (hasT ? `&tempos=/v/${encodeURIComponent(tj)}` : '');
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 720 * scale, height: 1280 * scale }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(url);
  try { await page.waitForFunction('window.READY === true', null, { timeout: 60000 }); }
  catch (e) { throw new Error('Motor não carregou:\n' + errs.join('\n')); }
  const info = await page.evaluate('window.INFO');
  return { browser, page, info, errs, close: async () => { await browser.close(); srv.close(); } };
}
module.exports = { openPage };
