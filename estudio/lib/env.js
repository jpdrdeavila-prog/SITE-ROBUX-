// Lê e grava o arquivo .env (chaves secretas). As chaves nunca são devolvidas ao navegador.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARQ = process.env.ESTUDIO_ENV_FILE || path.join(RAIZ, '.env');

export const CHAVES = [
  ['PAINEL_SENHA', 'Senha do painel'],
  ['ANTHROPIC_API_KEY', 'Claude (Anthropic)'],
  ['ELEVENLABS_API_KEY', 'ElevenLabs'],
  ['ELEVENLABS_VOICE_ID', 'ID da voz ElevenLabs'],
  ['INSTAGRAM_TOKEN', 'Token do Instagram (Graph API)'],
  ['INSTAGRAM_USER_ID', 'ID da conta do Instagram'],
  ['PUBLIC_BASE_URL', 'Endereço público do painel'],
  ['TELEGRAM_BOT_TOKEN', 'Telegram: token do bot'],
  ['TELEGRAM_CHAT_ID', 'Telegram: ID do chat'],
];

function ler() {
  const out = {};
  if (!fs.existsSync(ARQ)) return out;
  for (const linha of fs.readFileSync(ARQ, 'utf8').split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

export function carregarEnv() {
  for (const [k, v] of Object.entries(ler())) if (v && !process.env[k]) process.env[k] = v;
}

// Atualiza só as chaves enviadas (valor vazio = mantém a atual; "-" = apaga)
export function salvarChaves(novas) {
  const atual = ler();
  for (const [k] of CHAVES) {
    const v = (novas[k] ?? '').trim();
    if (!v) continue;
    if (v === '-') { delete atual[k]; delete process.env[k]; } else { atual[k] = v; process.env[k] = v; }
  }
  const txt = Object.entries(atual).map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
  fs.writeFileSync(ARQ, txt, { mode: 0o600 });
}

export function statusChaves() {
  return CHAVES.map(([k, nome]) => ({ k, nome, ok: !!process.env[k], dica: k === 'PUBLIC_BASE_URL' || k === 'INSTAGRAM_USER_ID' || k === 'ELEVENLABS_VOICE_ID' || k === 'TELEGRAM_CHAT_ID' ? (process.env[k] || '') : '' }));
}
