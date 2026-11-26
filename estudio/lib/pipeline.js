// A esteira do vídeo do dia. Cada etapa é um "nó" no painel (estilo n8n).
// O estado fica salvo em dados/execucoes/<id>/estado.json: se cair, continua de onde parou.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { AGENTES, SKILL, nomeEstilo } from './agentes.js';
import { perguntar } from './claude.js';
import { gerarVoz, postarReels, comentar, avisar } from './servicos.js';
import { RAIZ } from './env.js';
import { lerConfig, salvarExec, lerExec, pastaExec, listarExecs, listarRelatorios } from './store.js';

export const eventos = new EventEmitter(); // o painel escuta (tempo real)

export const ETAPAS = [
  { id: 'pauta', nome: 'Pesquisa de pauta', agente: 'pesquisador', x: 0, y: 0 },
  { id: 'checagem', nome: 'Checagem de fatos', agente: 'checador', x: 1, y: 0 },
  { id: 'roteiro', nome: 'Roteiro', agente: 'roteirista', x: 2, y: 0 },
  { id: 'revisao', nome: 'Revisão', agente: 'revisor', x: 3, y: 0 },
  { id: 'cenas', nome: 'Cenas 3D', agente: 'diretor', x: 3, y: 1 },
  { id: 'voz', nome: 'Voz (ElevenLabs)', agente: null, x: 2, y: 1 },
  { id: 'sync', nome: 'Sincronizar', agente: null, x: 1, y: 1 },
  { id: 'render', nome: 'Render MP4', agente: null, x: 0, y: 1 },
  { id: 'legenda', nome: 'Legenda e fontes', agente: 'redator', x: 0, y: 2 },
  { id: 'aprovacao', nome: 'Sua aprovação', agente: null, x: 1, y: 2 },
  { id: 'publicar', nome: 'Postar no Instagram', agente: null, x: 2, y: 2 },
];

const hojeBR = () => new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'full', timeStyle: 'short' });
export const diaBR = (d = new Date()) => d.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' }); // AAAA-MM-DD
export const horaBR = (d = new Date()) => d.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
const slug = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'video';

const rodando = new Map(); // id -> promessa

// ---------- criar / controlar ----------
export function novaExecucao({ ideia = '', estilo = null, origem = 'manual' } = {}) {
  const cfg = lerConfig();
  const n = listarExecs().length;
  const est = estilo || cfg.estilos[n % cfg.estilos.length] || 'A';
  const id = diaBR() + '-' + Date.now().toString(36);
  const e = {
    id, criado: new Date().toISOString(), origem, ideia, estilo: est, status: 'na fila',
    etapas: Object.fromEntries(ETAPAS.map(s => [s.id, { status: 'esperando', log: [] }])),
    conversa: [], dados: {}, custo: 0,
  };
  salvarExec(e);
  eventos.emit('mudou', id);
  return e;
}

export function iniciar(id) {
  if (rodando.has(id)) return;
  const p = executar(id).catch(err => console.error('execução', id, err)).finally(() => rodando.delete(id));
  rodando.set(id, p);
}
export const estaRodando = id => rodando.has(id);

export function aprovar(id, ok, motivo = '') {
  const e = lerExec(id); if (!e) return null;
  const a = e.etapas.aprovacao;
  if (a.status !== 'aguardando') return e;
  a.status = ok ? 'ok' : 'erro';
  a.log.push({ t: new Date().toISOString(), msg: ok ? 'Aprovado pelo João.' : 'Reprovado pelo João' + (motivo ? ': ' + motivo : '.') });
  e.dados.aprovado = ok;
  e.status = ok ? 'aprovado' : 'reprovado';
  salvarExec(e); eventos.emit('mudou', id);
  if (ok) iniciar(id);
  return e;
}

// refazer a partir de uma etapa (limpa ela e as seguintes)
export function refazer(id, desde) {
  const e = lerExec(id); if (!e || rodando.has(id)) return e;
  const i = ETAPAS.findIndex(s => s.id === desde);
  if (i < 0) return e;
  for (const s of ETAPAS.slice(i)) e.etapas[s.id] = { status: 'esperando', log: [] };
  e.status = 'na fila';
  salvarExec(e); eventos.emit('mudou', id);
  iniciar(id);
  return e;
}

// MP3 enviado pelo painel (gravado fora / ElevenLabs no site)
export function receberVoz(id, buf) {
  const e = lerExec(id); if (!e) return null;
  fs.writeFileSync(path.join(pastaExec(id), 'voz.mp3'), buf);
  return refazer(id, 'voz');
}

// ---------- motor ----------
async function executar(id) {
  let e = lerExec(id);
  const cfg = lerConfig();
  const pasta = pastaExec(id);
  const salvar = () => { salvarExec(e); eventos.emit('mudou', id); };
  const log = (etapa, msg) => { e.etapas[etapa].log.push({ t: new Date().toISOString(), msg }); salvar(); };
  const fala = (agente, texto, extra = {}) => { e.conversa.push({ t: new Date().toISOString(), agente, nome: AGENTES[agente]?.nome || agente, cor: AGENTES[agente]?.cor || '#aaa', texto, ...extra }); salvar(); };

  // um agente responde a uma conversa
  const agente = async (nomeAg, etapa, mensagens, extra = {}) => {
    const a = AGENTES[nomeAg];
    const sistema = a.sistema.replace('{DURACAO}', cfg.duracaoAlvo) + `\nHoje é ${hojeBR()} (Brasília). Estilo do vídeo de hoje: ${nomeEstilo(e.estilo)}. Perfil: ${cfg.handle}. Nicho: ${cfg.nicho}. Temas proibidos: ${cfg.temasProibidos}.`;
    log(etapa, `${a.nome} pensando...`);
    const r = await perguntar({
      modelo: cfg.modelos[a.modelo] || cfg.modelos.principal, sistema, cache: a.cache(), mensagens,
      web: a.web || 0, schema: extra.schema === false ? null : a.schema || null, esforco: cfg.esforco, maxTokens: extra.maxTokens || 32000,
    });
    e.custo = (e.custo || 0) + r.uso.custo;
    log(etapa, `${a.nome} respondeu (${r.uso.entrada + r.uso.cacheLido} tokens lidos, ${r.uso.cacheLido} do cache, ${r.uso.saida} escritos, ~US$ ${r.uso.custo.toFixed(3)}).`);
    return r;
  };

  const etapas = {
    // 1. PESQUISADOR escolhe e pesquisa a pauta
    pauta: async () => {
      const fila = cfg.ideiasNaFila || [];
      let ideia = e.ideia;
      if (!ideia && fila.length && e.origem === 'agenda') { ideia = fila[0]; const { salvarConfig } = await import('./store.js'); salvarConfig({ ideiasNaFila: fila.slice(1) }); e.ideia = ideia; }
      const ultimos = listarExecs().filter(x => x.id !== id && x.dados?.pauta?.tema).slice(0, 10).map(x => '- ' + x.dados.pauta.tema).join('\n') || '(nenhum)';
      const rel = listarRelatorios()[0];
      const recado = rel?.analise?.recado_para_pesquisador ? `\nRecado do Analista (métricas de ontem): ${rel.analise.recado_para_pesquisador}\nIdeias sugeridas: ${(rel.analise.proximas_ideias || []).map(i => i.tema).join('; ')}` : '';
      const pedido = (ideia ? `O João pediu este tema: "${ideia}". Pesquise a fundo os fatos atuais sobre ele.` : 'Escolha o melhor tema de hoje e pesquise a fundo.')
        + `\nNão repita estes temas recentes:\n${ultimos}${recado}\nEntregue: tema, pergunta-gancho, por que agora, formato da biblioteca, ângulo "no seu bolso", e uma lista de 8 a 15 fatos com número, fonte, título, data e link.`;
      fala('pesquisador', pedido, { de: 'Estúdio' });
      const r = await agente('pesquisador', 'pauta', [{ role: 'user', content: pedido }], { schema: false });
      fala('pesquisador', r.texto, { fontes: r.fontes.slice(0, 20) });
      const j = await agente('extrator', 'pauta', [{ role: 'user', content: 'Pesquisa:\n\n' + r.texto + '\n\nLinks encontrados:\n' + r.fontes.map(f => `${f.titulo} | ${f.url} | ${f.data}`).join('\n') }]);
      e.dados.pauta = j.json;
      log('pauta', `Tema: ${j.json.tema} (formato: ${j.json.formato}, ${j.json.fatos.length} fatos).`);
    },

    // 2. CHECADOR confere; se reprovar, PESQUISADOR responde e o CHECADOR confere de novo
    checagem: async () => {
      let pauta = e.dados.pauta;
      const hist = [{ role: 'user', content: 'Confira esta pauta do Pesquisador:\n' + JSON.stringify(pauta, null, 2) }];
      for (let rodada = 1; rodada <= 3; rodada++) {
        const r = await agente('checador', 'checagem', hist);
        const c = r.json;
        fala('checador', (c.aprovado ? '✅ Aprovado. ' : '❌ Reprovado. ') + c.resumo + (c.problemas.length ? '\n' + c.problemas.map(p => `• ${p.fato}: ${p.problema} → ${p.correcao} (${p.fonte})`).join('\n') : ''));
        if (c.aprovado || rodada === 3) {
          if (!c.aprovado && c.fatos_confirmados.length < 5) throw new Error('O Checador não aprovou a pauta depois de 3 rodadas. Peça outro tema.');
          e.dados.fatos = c.fatos_confirmados;
          log('checagem', `${c.fatos_confirmados.length} fatos confirmados.`);
          return;
        }
        hist.push({ role: 'assistant', content: r.texto });
        const resp = await agente('pesquisador', 'checagem', [{ role: 'user', content: `O Checador reprovou sua pauta:\n${JSON.stringify(c.problemas, null, 2)}\nPauta original:\n${JSON.stringify(pauta, null, 2)}\nPesquise de novo, corrija ou retire os fatos com problema e devolva a pauta corrigida completa.` }], { schema: false });
        fala('pesquisador', resp.texto, { fontes: resp.fontes.slice(0, 10) });
        hist.push({ role: 'user', content: 'Resposta do Pesquisador com a pauta corrigida:\n' + resp.texto + '\nConfira de novo.' });
      }
    },

    // 3. ROTEIRISTA escreve
    roteiro: async () => {
      const p = e.dados.pauta;
      const pedido = `Tema: ${p.tema}\nPergunta-gancho: ${p.pergunta_gancho}\nFormato: ${p.formato}\nÂngulo no bolso: ${p.angulo_bolso}\nCuidados: ${p.cuidados.join('; ')}\nFATOS CONFIRMADOS (use só estes):\n${JSON.stringify(e.dados.fatos, null, 2)}${e.ideia ? `\nPedido do João: ${e.ideia}` : ''}`;
      e.dados.roteiroPedido = pedido;
      const r = await agente('roteirista', 'roteiro', [{ role: 'user', content: pedido }]);
      e.dados.roteiro = r.json;
      fala('roteirista', `Roteiro "${r.json.titulo}" (${r.json.segs.length} falas):\n` + r.json.segs.map((s, i) => `${i}. ${s}`).join('\n'));
    },

    // 4. REVISOR ↔ ROTEIRISTA até nota 8 (máx. 2 reescritas)
    revisao: async () => {
      for (let rodada = 1; rodada <= 3; rodada++) {
        const rt = e.dados.roteiro;
        const r = await agente('revisor', 'revisao', [{ role: 'user', content: `Fatos confirmados:\n${JSON.stringify(e.dados.fatos)}\nDuração alvo: ${cfg.duracaoAlvo}\nRoteiro:\n${rt.segs.map((s, i) => `${i}. ${s}`).join('\n')}` }]);
        const v = r.json;
        fala('revisor', `Nota ${v.nota}/10. ${v.aprovado && v.nota >= 8 ? 'Aprovado.' : 'Precisa de ajustes:'}\n` + v.ajustes.map(a => '• ' + a).join('\n'));
        if ((v.aprovado && v.nota >= 8) || rodada === 3) { e.dados.revisao = v; return; }
        const nr = await agente('roteirista', 'revisao', [
          { role: 'user', content: e.dados.roteiroPedido },
          { role: 'assistant', content: JSON.stringify(rt) },
          { role: 'user', content: 'O Revisor pediu estes ajustes. Reescreva o roteiro completo aplicando-os:\n' + v.ajustes.join('\n') },
        ]);
        e.dados.roteiro = nr.json;
        fala('roteirista', `Versão ${rodada + 1}:\n` + nr.json.segs.map((s, i) => `${i}. ${s}`).join('\n'));
      }
    },

    // 5. DIRETOR escreve o arquivo 3D; o motor testa; se der erro o DIRETOR corrige
    cenas: async () => {
      const rt = e.dados.roteiro;
      const arq = path.join(pasta, 'video.js');
      const hist = [{ role: 'user', content: `ESTILO: ${e.estilo}\nTEMA (pílula do topo): ${slug(e.dados.pauta.tema).replace(/-/g, ' ').toUpperCase().slice(0, 22)}\nHANDLE: ${cfg.handle}\nMetáfora: ${rt.metafora}\nCapítulos sugeridos: ${JSON.stringify(rt.capitulos)}\nFontes (para o campo fontes no estilo B): ${[...new Set(e.dados.fatos.map(f => f.fonte))].slice(0, 4).join(' · ')}\nFALAS (copie exatamente):\n${JSON.stringify(rt.segs, null, 1)}` }];
      for (let tentativa = 1; tentativa <= 3; tentativa++) {
        const r = await agente('diretor', 'cenas', hist, { maxTokens: 64000 });
        const m = r.texto.match(/```(?:js|javascript)?\s*\n([\s\S]*?)```/);
        const codigo = m ? m[1] : r.texto;
        fs.writeFileSync(arq, codigo);
        fala('diretor', `Arquivo de cenas pronto (tentativa ${tentativa}, ${codigo.split('\n').length} linhas). Testando no motor 3D...`);
        const t = await rodar('node', [path.join(SKILL, 'scripts', 'shot.js'), arq, path.join(pasta, 'previa'), '--rapido'], l => log('cenas', l), 10 * 60e3);
        const erros = /ERROS|Error|não carregou/i.test(t.saida) || t.codigo !== 0;
        if (!erros) {
          fs.copyFileSync(path.join(pasta, 'previa', 'contact.jpg'), path.join(pasta, 'previa.jpg'));
          e.dados.previa = true;
          fala('diretor', 'Motor rodou sem erro. Prévia das cenas gerada.');
          return;
        }
        hist.push({ role: 'assistant', content: r.texto });
        hist.push({ role: 'user', content: 'O motor deu erro com esse arquivo. Corrija e mande o arquivo completo de novo.\nSaída do motor:\n' + t.saida.slice(-4000) });
      }
      throw new Error('O Diretor não conseguiu um arquivo sem erro em 3 tentativas.');
    },

    // 6. VOZ: ElevenLabs (ou MP3 enviado pelo painel)
    voz: async () => {
      const mp3 = path.join(pasta, 'voz.mp3');
      if (fs.existsSync(mp3)) { log('voz', 'Usando o MP3 enviado.'); return; }
      fs.writeFileSync(path.join(pasta, 'narracao.txt'), e.dados.roteiro.narracao);
      if (!process.env.ELEVENLABS_API_KEY) {
        e.etapas.voz.status = 'aguardando';
        log('voz', 'Sem chave da ElevenLabs: envie o MP3 pelo painel (o texto está em "narração").');
        await avisar(`🎙️ Estúdio: o roteiro "${e.dados.roteiro.titulo}" está pronto. Gere a voz e envie o MP3 no painel.`);
        return 'pausa';
      }
      await gerarVoz(e.dados.roteiro.narracao, mp3);
      log('voz', 'Narração gerada na ElevenLabs.');
    },

    sync: async () => {
      const t = await rodar('node', [path.join(SKILL, 'scripts', 'sync.js'), path.join(pasta, 'video.js'), path.join(pasta, 'voz.mp3')], l => log('sync', l), 5 * 60e3);
      if (t.codigo !== 0) throw new Error('Falha ao sincronizar:\n' + t.saida.slice(-800));
    },

    render: async () => {
      const t = await rodar('node', [path.join(SKILL, 'scripts', 'render.js'), path.join(pasta, 'video.js'), '--voz', path.join(pasta, 'voz.mp3'), '--out', path.join(pasta, 'video.mp4'), '--jobs', String(cfg.jobsRender || 3)], l => { if (!/quadro \d+$/.test(l) || Math.random() < 0.15) log('render', l); }, 3 * 3600e3);
      if (t.codigo !== 0 || !fs.existsSync(path.join(pasta, 'video.mp4'))) throw new Error('Falha no render:\n' + t.saida.slice(-800));
      fs.rmSync(path.join(pasta, 'video_quadros'), { recursive: true, force: true });
    },

    // 9. REDATOR: legenda + 1º comentário com fontes
    legenda: async () => {
      const r = await agente('redator', 'legenda', [{ role: 'user', content: `Roteiro:\n${e.dados.roteiro.segs.join('\n')}\nFatos e fontes:\n${JSON.stringify(e.dados.fatos, null, 2)}\nHorário da postagem: ${cfg.horarioPostagem}` }]);
      const j = r.json;
      const tags = j.hashtags.map(h => (h.startsWith('#') ? h : '#' + h)).join(' ');
      e.dados.post = { legenda: j.legenda.includes('#') ? j.legenda : j.legenda + '\n\n' + tags, comentario: j.primeiro_comentario };
      fs.writeFileSync(path.join(pasta, 'post.md'), `# ${e.dados.roteiro.titulo}\n\n## Legenda\n\n${e.dados.post.legenda}\n\n## 1º comentário: fontes\n\n${j.primeiro_comentario}\n`);
      fala('redator', e.dados.post.legenda + '\n\n— 1º comentário —\n' + j.primeiro_comentario);
    },

    // 10. APROVAÇÃO humana (pode desligar em Configurações)
    aprovacao: async () => {
      if (!cfg.aprovacaoHumana) { log('aprovacao', 'Aprovação humana desligada: segue direto.'); e.dados.aprovado = true; return; }
      if (e.dados.aprovado) return;
      e.etapas.aprovacao.status = 'aguardando';
      e.status = 'aguardando aprovação';
      log('aprovacao', 'Esperando você assistir e aprovar no painel.');
      const base = process.env.PUBLIC_BASE_URL;
      await avisar(`🎬 Vídeo pronto para aprovar: "${e.dados.roteiro.titulo}" (estilo ${e.estilo}).${base ? `\n${base}/#/execucao/${id}` : ''}`);
      return 'pausa';
    },

    // 11. PUBLICAR no horário configurado
    publicar: async () => {
      if (!process.env.INSTAGRAM_TOKEN) {
        e.etapas.publicar.status = 'manual';
        log('publicar', 'Sem token do Instagram: baixe o MP4 e a legenda no painel e poste pelo app (aí você também escolhe a música).');
        return 'pausa';
      }
      const base = process.env.PUBLIC_BASE_URL;
      if (!base) throw new Error('Falta PUBLIC_BASE_URL: o Instagram precisa baixar o vídeo de um endereço público.');
      if (e.origem === 'agenda' && horaBR() < cfg.horarioPostagem && diaBR() === e.id.slice(0, 10)) {
        log('publicar', `Aguardando o horário de postagem (${cfg.horarioPostagem}).`);
        while (horaBR() < cfg.horarioPostagem) await new Promise(r => setTimeout(r, 30000));
      }
      const chave = e.dados.chaveMidia ||= Math.random().toString(36).slice(2) + Date.now().toString(36);
      salvar();
      const r = await postarReels({ videoUrl: `${base}/midia/${id}/${chave}/video.mp4`, legenda: e.dados.post.legenda, log: m => log('publicar', m) });
      e.dados.publicado = r;
      log('publicar', `Publicado! ${r.link}`);
      try { await comentar(r.id, e.dados.post.comentario); log('publicar', 'Fontes publicadas no 1º comentário.'); } catch (err) { log('publicar', 'Não consegui comentar as fontes: ' + err.message); }
      await avisar(`✅ Publicado: ${e.dados.roteiro.titulo}\n${r.link}`);
    },
  };

  e.status = 'rodando'; salvar();
  for (const s of ETAPAS) {
    const st = e.etapas[s.id];
    if (st.status === 'ok') continue;
    if (st.status === 'aguardando' || st.status === 'manual') { e.status = s.id === 'aprovacao' ? 'aguardando aprovação' : s.id === 'voz' ? 'aguardando voz' : 'pronto para postar'; salvar(); return; }
    st.status = 'rodando'; st.inicio = new Date().toISOString(); salvar();
    try {
      const r = await etapas[s.id]();
      if (r === 'pausa') { if (st.status === 'rodando') st.status = 'aguardando'; e.status = s.id === 'aprovacao' ? 'aguardando aprovação' : s.id === 'voz' ? 'aguardando voz' : 'pronto para postar'; salvar(); return; }
      st.status = 'ok'; st.fim = new Date().toISOString(); salvar();
    } catch (err) {
      st.status = 'erro'; st.erro = String(err.message || err); e.status = 'erro';
      log(s.id, '❌ ' + st.erro);
      await avisar(`⚠️ Estúdio: erro na etapa "${s.nome}" do vídeo de hoje: ${st.erro.slice(0, 300)}`);
      return;
    }
  }
  e.status = 'publicado'; salvar();
}

// roda um script da skill e repassa as linhas para o log
function rodar(cmd, args, onLinha, limite) {
  return new Promise(res => {
    const nodePath = [path.join(RAIZ, 'node_modules'), process.env.NODE_PATH].filter(Boolean).join(path.delimiter);
    const c = spawn(cmd, args, { cwd: SKILL, env: { ...process.env, NODE_PATH: nodePath } });
    let saida = '';
    const tratar = d => { const t = d.toString(); saida += t; t.split('\n').map(x => x.trim()).filter(Boolean).forEach(onLinha); };
    c.stdout.on('data', tratar); c.stderr.on('data', tratar);
    const timer = setTimeout(() => { c.kill('SIGKILL'); saida += '\n(tempo esgotado)'; }, limite);
    c.on('close', codigo => { clearTimeout(timer); res({ codigo, saida }); });
  });
}

// ao ligar o servidor: o que estava rodando volta para a fila e continua
export function retomarPendentes() {
  for (const e of listarExecs()) {
    if (e.status === 'rodando' || e.status === 'na fila' || e.status === 'aprovado') {
      for (const s of Object.values(e.etapas)) if (s.status === 'rodando') s.status = 'esperando';
      salvarExec(e);
      iniciar(e.id);
    }
  }
}
