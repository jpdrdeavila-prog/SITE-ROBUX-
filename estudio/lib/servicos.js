// Serviços externos: ElevenLabs (voz), Instagram Graph API (postar, comentar, métricas), Telegram (avisos).
import fs from 'node:fs';

const GRAPH = 'https://graph.facebook.com/v21.0';

async function http(url, opt = {}) {
  const r = await fetch(url, opt);
  const tipo = r.headers.get('content-type') || '';
  const corpo = tipo.includes('json') ? await r.json() : await r.text();
  if (!r.ok) {
    const msg = typeof corpo === 'string' ? corpo.slice(0, 300) : (corpo.error?.message || corpo.detail?.message || JSON.stringify(corpo).slice(0, 300));
    throw new Error(`${new URL(url).host} respondeu ${r.status}: ${msg}`);
  }
  return corpo;
}

// ---------- ElevenLabs ----------
export async function gerarVoz(texto, destino) {
  const key = process.env.ELEVENLABS_API_KEY, voz = process.env.ELEVENLABS_VOICE_ID;
  if (!key || !voz) throw new Error('Falta ELEVENLABS_API_KEY ou ELEVENLABS_VOICE_ID (Configurações). Ou envie o MP3 pelo painel.');
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voz)}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ text: texto, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true } }),
  });
  if (!r.ok) throw new Error(`ElevenLabs respondeu ${r.status}: ${(await r.text()).slice(0, 300)}`);
  fs.writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
}

// ---------- Instagram ----------
const ig = () => {
  const token = process.env.INSTAGRAM_TOKEN, user = process.env.INSTAGRAM_USER_ID;
  if (!token || !user) throw new Error('Falta INSTAGRAM_TOKEN ou INSTAGRAM_USER_ID (Configurações).');
  return { token, user };
};
const form = obj => new URLSearchParams(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null));

export async function postarReels({ videoUrl, legenda, capaUrl, log = () => {} }) {
  const { token, user } = ig();
  const c = await http(`${GRAPH}/${user}/media`, { method: 'POST', body: form({ media_type: 'REELS', video_url: videoUrl, caption: legenda, share_to_feed: 'true', cover_url: capaUrl, access_token: token }) });
  log(`Instagram recebeu o vídeo (contêiner ${c.id}). Processando...`);
  for (let i = 0; i < 60; i++) { // até ~10 min
    await new Promise(r => setTimeout(r, 10000));
    const st = await http(`${GRAPH}/${c.id}?fields=status_code,status&access_token=${encodeURIComponent(token)}`);
    if (st.status_code === 'FINISHED') break;
    if (st.status_code === 'ERROR' || st.status_code === 'EXPIRED') throw new Error('Instagram não processou o vídeo: ' + (st.status || st.status_code));
    if (i === 59) throw new Error('Instagram demorou demais para processar o vídeo.');
  }
  const pub = await http(`${GRAPH}/${user}/media_publish`, { method: 'POST', body: form({ creation_id: c.id, access_token: token }) });
  const info = await http(`${GRAPH}/${pub.id}?fields=permalink&access_token=${encodeURIComponent(token)}`).catch(() => ({}));
  return { id: pub.id, link: info.permalink || '' };
}

export async function comentar(mediaId, texto) {
  const { token } = ig();
  return http(`${GRAPH}/${mediaId}/comments`, { method: 'POST', body: form({ message: texto, access_token: token }) });
}

// métricas dos últimos posts (cada métrica é pedida separada para uma que não exista não derrubar as outras)
const METRICAS = ['views', 'reach', 'likes', 'comments', 'shares', 'saved', 'total_interactions', 'ig_reels_avg_watch_time', 'ig_reels_video_view_total_time'];
export async function metricasRecentes(qtd = 12) {
  const { token, user } = ig();
  const lista = await http(`${GRAPH}/${user}/media?fields=id,caption,timestamp,media_type,media_product_type,permalink&limit=${qtd}&access_token=${encodeURIComponent(token)}`);
  const out = [];
  for (const m of lista.data || []) {
    const met = {};
    for (const k of METRICAS) {
      try {
        const r = await http(`${GRAPH}/${m.id}/insights?metric=${k}&access_token=${encodeURIComponent(token)}`);
        const v = r.data?.[0]?.values?.[0]?.value ?? r.data?.[0]?.total_value?.value;
        if (v !== undefined) met[k] = k.startsWith('ig_reels') ? Math.round(v / 100) / 10 : v; // ms -> s
      } catch {}
    }
    out.push({ id: m.id, data: m.timestamp, tipo: m.media_product_type || m.media_type, link: m.permalink, legenda: (m.caption || '').slice(0, 160), metricas: met });
  }
  return out;
}

// ---------- Telegram (opcional) ----------
export async function avisar(texto) {
  const t = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (!t || !chat) return false;
  try {
    await http(`https://api.telegram.org/bot${t}/sendMessage`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chat_id: chat, text: texto.slice(0, 4000), disable_web_page_preview: true }) });
    return true;
  } catch { return false; }
}
