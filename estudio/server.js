// Estúdio Estéreo: painel estilo n8n + API. Rode com: npm start  (abre em http://localhost:3000)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ, carregarEnv, salvarChaves, statusChaves } from './lib/env.js';
carregarEnv();
const { lerConfig, salvarConfig, lerExec, listarExecs, listarRelatorios, pastaExec } = await import('./lib/store.js');
const P = await import('./lib/pipeline.js');
const { AGENTES, nomeEstilo } = await import('./lib/agentes.js');
const { gerarRelatorio } = await import('./lib/relatorio.js');
const { ligarAgenda } = await import('./lib/agenda.js');
const { perguntar, resetCliente } = await import('./lib/claude.js');

const PUB = path.join(RAIZ, 'public');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' };
const ARQUIVOS_OK = ['previa.jpg', 'video.mp4', 'voz.mp3', 'post.md', 'narracao.txt', 'video.js'];

const json = (res, obj, code = 200) => { res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); };
const corpo = (req, max = 50e6) => new Promise((ok, ko) => {
  const partes = []; let tam = 0;
  req.on('data', d => { tam += d.length; if (tam > max) { ko(new Error('arquivo grande demais')); req.destroy(); } else partes.push(d); });
  req.on('end', () => ok(Buffer.concat(partes))); req.on('error', ko);
});
const corpoJson = async req => { const b = await corpo(req, 1e6); return b.length ? JSON.parse(b.toString()) : {}; };

function enviarArquivo(req, res, f) {
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  const tam = fs.statSync(f).size, tipo = TIPOS[path.extname(f)] || 'application/octet-stream';
  const m = (req.headers.range || '').match(/bytes=(\d*)-(\d*)/);
  if (m) {
    const a = m[1] ? +m[1] : 0, b = m[2] ? +m[2] : tam - 1;
    res.writeHead(206, { 'content-type': tipo, 'content-range': `bytes ${a}-${b}/${tam}`, 'accept-ranges': 'bytes', 'content-length': b - a + 1 });
    return fs.createReadStream(f, { start: a, end: b }).pipe(res);
  }
  res.writeHead(200, { 'content-type': tipo, 'content-length': tam, 'accept-ranges': 'bytes' });
  fs.createReadStream(f).pipe(res);
}

function autorizado(req) {
  const senha = process.env.PAINEL_SENHA;
  if (!senha) return true;
  const [, b64] = (req.headers.authorization || '').split(' ');
  const [, s] = Buffer.from(b64 || '', 'base64').toString().split(':');
  return s === senha;
}

const resumo = e => ({ id: e.id, criado: e.criado, origem: e.origem, estilo: e.estilo, status: e.status, tema: e.dados?.pauta?.tema || e.ideia || '', titulo: e.dados?.roteiro?.titulo || '', custo: e.custo || 0, etapas: Object.fromEntries(Object.entries(e.etapas).map(([k, v]) => [k, v.status])), link: e.dados?.publicado?.link || '' });

const sse = new Set();
P.eventos.on('mudou', id => { const e = lerExec(id); if (!e) return; const msg = `data: ${JSON.stringify({ id, resumo: resumo(e) })}\n\n`; for (const r of sse) r.write(msg); });

async function rota(req, res) {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname, M = req.method;

  // vídeo público para o Instagram baixar (protegido por chave aleatória)
  let m = p.match(/^\/midia\/([\w-]+)\/([a-z0-9]+)\/video\.mp4$/);
  if (m) { const e = lerExec(m[1]); if (!e || e.dados?.chaveMidia !== m[2]) { res.writeHead(404); return res.end(); } return enviarArquivo(req, res, path.join(pastaExec(m[1]), 'video.mp4')); }

  if (!autorizado(req)) { res.writeHead(401, { 'www-authenticate': 'Basic realm="Estudio"' }); return res.end('Senha necessária'); }

  if (!p.startsWith('/api/')) {
    const f = path.join(PUB, p === '/' ? 'index.html' : path.normalize(p).replace(/^(\.\.[/\\])+/, ''));
    return enviarArquivo(req, res, f.startsWith(PUB) ? f : path.join(PUB, 'index.html'));
  }

  if (p === '/api/eventos') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
    res.write(': ok\n\n'); sse.add(res); req.on('close', () => sse.delete(res)); return;
  }
  if (p === '/api/estado' && M === 'GET') return json(res, {
    config: lerConfig(), chaves: statusChaves(), etapas: P.ETAPAS,
    agentes: Object.fromEntries(Object.entries(AGENTES).filter(([k]) => k !== 'extrator').map(([k, a]) => [k, { nome: a.nome, cor: a.cor, sistema: a.sistema, web: !!a.web, modelo: a.modelo }])),
    estilos: ['A', 'B', 'C'].map(k => ({ k, nome: nomeEstilo(k) })),
    execucoes: listarExecs().slice(0, 60).map(resumo), relatorios: listarRelatorios().slice(0, 30), agora: { dia: P.diaBR(), hora: P.horaBR() },
  });
  if (p === '/api/config' && M === 'POST') return json(res, salvarConfig(await corpoJson(req)));
  if (p === '/api/chaves' && M === 'POST') { salvarChaves(await corpoJson(req)); resetCliente(); return json(res, statusChaves()); }
  if (p === '/api/relatorio' && M === 'POST') { gerarRelatorio().catch(() => {}); return json(res, { ok: true }); }
  if (p === '/api/teste' && M === 'POST') return json(res, await testarConexoes());

  if (p === '/api/execucoes' && M === 'POST') {
    const b = await corpoJson(req);
    const e = P.novaExecucao({ ideia: (b.ideia || '').slice(0, 500), estilo: ['A', 'B', 'C'].includes(b.estilo) ? b.estilo : null });
    P.iniciar(e.id); return json(res, resumo(e));
  }
  m = p.match(/^\/api\/execucoes\/([\w-]+)(?:\/(\w+))?(?:\/([\w.]+))?$/);
  if (m) {
    const [, id, acao, arq] = m;
    const e = lerExec(id); if (!e) return json(res, { erro: 'não encontrado' }, 404);
    if (!acao && M === 'GET') return json(res, { ...e, rodando: P.estaRodando(id) });
    if (!acao && M === 'DELETE') { if (P.estaRodando(id)) return json(res, { erro: 'está rodando' }, 409); fs.rmSync(pastaExec(id), { recursive: true, force: true }); return json(res, { ok: true }); }
    if (acao === 'aprovar' && M === 'POST') { const b = await corpoJson(req); return json(res, P.aprovar(id, !!b.ok, b.motivo || '')); }
    if (acao === 'refazer' && M === 'POST') { const b = await corpoJson(req); return json(res, P.refazer(id, b.desde)); }
    if (acao === 'continuar' && M === 'POST') { P.iniciar(id); return json(res, { ok: true }); }
    if (acao === 'voz' && M === 'POST') return json(res, P.receberVoz(id, await corpo(req)));
    if (acao === 'postado' && M === 'POST') { const b = await corpoJson(req); e.etapas.publicar.status = 'ok'; e.dados.publicado = { link: b.link || '', manual: true }; e.status = 'publicado'; (await import('./lib/store.js')).salvarExec(e); P.eventos.emit('mudou', id); return json(res, { ok: true }); }
    if (acao === 'arquivo' && M === 'GET' && ARQUIVOS_OK.includes(arq)) return enviarArquivo(req, res, path.join(pastaExec(id), arq));
  }
  json(res, { erro: 'rota não existe' }, 404);
}

async function testarConexoes() {
  const r = {};
  const tenta = async (k, fn) => { try { r[k] = { ok: true, msg: await fn() }; } catch (e) { r[k] = { ok: false, msg: String(e.message || e).slice(0, 200) }; } };
  await tenta('claude', async () => { const x = await perguntar({ modelo: lerConfig().modelos.rapido, sistema: 'Responda só: ok', mensagens: [{ role: 'user', content: 'teste' }], esforco: 'low', maxTokens: 2000 }); return 'respondeu: ' + x.texto.slice(0, 30); });
  await tenta('elevenlabs', async () => { if (!process.env.ELEVENLABS_API_KEY) throw new Error('sem chave'); const x = await fetch('https://api.elevenlabs.io/v1/voices/' + encodeURIComponent(process.env.ELEVENLABS_VOICE_ID || ''), { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY } }); if (!x.ok) throw new Error('HTTP ' + x.status); return 'voz: ' + (await x.json()).name; });
  await tenta('instagram', async () => { if (!process.env.INSTAGRAM_TOKEN) throw new Error('sem token'); const x = await fetch(`https://graph.facebook.com/v21.0/${process.env.INSTAGRAM_USER_ID}?fields=username,followers_count&access_token=${encodeURIComponent(process.env.INSTAGRAM_TOKEN)}`); const j = await x.json(); if (!x.ok) throw new Error(j.error?.message || 'HTTP ' + x.status); return `@${j.username} · ${j.followers_count} seguidores`; });
  await tenta('telegram', async () => { const { avisar } = await import('./lib/servicos.js'); if (!(await avisar('✅ Teste do Estúdio Estéreo: avisos funcionando.'))) throw new Error('sem token/chat ou falhou'); return 'mensagem enviada'; });
  return r;
}

const PORTA = +(process.env.PORT || 3000);
http.createServer((req, res) => rota(req, res).catch(err => { console.error(err); if (!res.headersSent) json(res, { erro: String(err.message || err) }, 500); })).listen(PORTA, () => {
  console.log(`Estúdio Estéreo no ar: http://localhost:${PORTA}`);
  P.retomarPendentes();
  ligarAgenda();
});
