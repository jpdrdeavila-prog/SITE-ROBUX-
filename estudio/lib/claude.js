// Chamada única ao Claude usada por todos os agentes.
// - streaming + finalMessage (respostas longas sem estourar tempo)
// - prompt caching no system (as referências da skill são grandes e se repetem todo dia)
// - web search do servidor da Anthropic quando o agente precisa pesquisar
// - saída estruturada (JSON Schema) quando o passo precisa de dados, não de texto
// - fallback automático no servidor se o modelo recusar
import Anthropic from '@anthropic-ai/sdk';

let cliente = null;
const api = () => (cliente ||= new Anthropic());
export const resetCliente = () => { cliente = null; };

// preço por 1M tokens (entrada, saída) só para mostrar o gasto estimado no painel
const PRECO = { 'claude-opus-5-5': [4, 20], 'claude-sonnet-5-5': [2, 10], 'claude-haiku-5-5': [0.1, 0.5], 'claude-fable-5-2': [8, 40] };

export async function perguntar({ modelo, sistema, cache = [], mensagens, web = 0, schema = null, esforco = 'high', maxTokens = 32000 }) {
  if (process.env.ESTUDIO_SIMULAR === '1') return (await import('./simulacao.js')).simular({ sistema, schema, mensagens });
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('Falta a chave ANTHROPIC_API_KEY (Configurações).');
  // blocos fixos primeiro (cacheados), instrução do agente por último
  const system = [
    ...cache.map((t, i) => ({ type: 'text', text: t, ...(i === cache.length - 1 ? { cache_control: { type: 'ephemeral', ttl: '1h' } } : {}) })),
    { type: 'text', text: sistema },
  ];
  const params = {
    model: modelo,
    max_tokens: maxTokens,
    // fallback no servidor se o modelo recusar (Haiku não tem fallback no servidor)
    ...(/haiku/.test(modelo) ? {} : { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' }),
    system,
    messages: [...mensagens],
    output_config: { effort: esforco, ...(schema ? { format: { type: 'json_schema', schema } } : {}) },
    ...(web ? { tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: web }] } : {}),
  };
  const uso = { entrada: 0, saida: 0, cacheLido: 0, cacheGravado: 0, custo: 0 };
  let resp;
  for (let volta = 0; volta < 6; volta++) {
    resp = await api().beta.messages.stream(params).finalMessage();
    const u = resp.usage || {};
    uso.entrada += u.input_tokens || 0; uso.saida += u.output_tokens || 0;
    uso.cacheLido += u.cache_read_input_tokens || 0; uso.cacheGravado += u.cache_creation_input_tokens || 0;
    if (resp.stop_reason !== 'pause_turn') break;
    // pesquisa longa: devolve o turno para o servidor continuar de onde parou
    params.messages = [...mensagens, { role: 'assistant', content: resp.content }];
  }
  const [pe, ps] = PRECO[modelo] || PRECO['claude-opus-5-5'];
  uso.custo = (uso.entrada * pe + uso.cacheGravado * pe * 2 + uso.cacheLido * pe * 0.1 + uso.saida * ps) / 1e6;

  if (resp.stop_reason === 'refusal') throw new Error('O modelo recusou este pedido' + (resp.stop_details?.category ? ` (${resp.stop_details.category})` : '') + '. Troque o tema.');
  if (resp.stop_reason === 'max_tokens') throw new Error('Resposta cortada no limite de tokens.');

  const texto = resp.content.filter(b => b.type === 'text').map(b => b.text).join('').trim();
  const fontes = [];
  for (const b of resp.content) {
    if (b.type === 'web_search_tool_result' && Array.isArray(b.content))
      for (const r of b.content) if (r.url) fontes.push({ titulo: r.title, url: r.url, data: r.page_age || '' });
  }
  let json = null;
  if (schema) {
    try { json = JSON.parse(texto); } catch { throw new Error('O agente devolveu um JSON inválido.'); }
  }
  return { texto, json, fontes, uso, modelo: resp.model };
}
