// Modo simulação (ESTUDIO_SIMULAR=1): respostas falsas para testar a esteira sem gastar API.
import fs from 'node:fs';
import path from 'node:path';
import { SKILL } from './agentes.js';

const FATOS = [{ fato: 'Exemplo de fato', numero: '10%', fonte: 'Fonte de teste', titulo: 'Título', data: '2026-11-26', url: 'https://example.com' }];
export function simular({ sistema, schema }) {
  const uso = { entrada: 0, saida: 0, cacheLido: 0, cacheGravado: 0, custo: 0 };
  const r = (texto, json = null) => ({ texto: json ? JSON.stringify(json) : texto, json, fontes: [{ titulo: 'Exemplo', url: 'https://example.com', data: '' }], uso, modelo: 'simulacao' });
  const p = schema?.properties || {};
  if (sistema.includes('DIRETOR')) return r('```js\n' + fs.readFileSync(path.join(SKILL, 'videos', 'exemplo-formatos.js'), 'utf8') + '\n```');
  if (!schema) return r('(simulação) Pesquisa feita: tema de teste com 8 fatos e fontes.');
  if (p.fatos) return r('', { tema: 'Tema de teste', pergunta_gancho: 'Isso mexe no seu bolso?', por_que_agora: 'teste', formato: 'E na sua vida?', angulo_bolso: 'teste', fatos: FATOS, cuidados: [] });
  if (p.fatos_confirmados) return r('', { aprovado: true, resumo: 'Tudo confere (simulação).', problemas: [], fatos_confirmados: FATOS });
  if (p.segs) return r('', { titulo: 'Vídeo de teste', formato: 'E na sua vida?', metafora: 'cofre', segs: ['Fala um *teste*.', 'Fala dois.', 'Fala três?', 'Vem que eu te explico de forma estérea.', 'Comenta *ESTÉREO*.'], narracao: 'Fala um teste.\nFala dois.', capitulos: [] });
  if (p.nota) return r('', { nota: 9, aprovado: true, elogios: ['bom gancho'], ajustes: [] });
  if (p.legenda) return r('', { legenda: 'Legenda de teste. Vem que eu te explico de forma estérea.', primeiro_comentario: '📚 Fontes: teste', hashtags: ['teste', 'dinheiro'] });
  if (p.resumo && p.proximas_ideias) return r('', { resumo: 'Relatório simulado.', destaques: [], aprendizados: ['teste'], proximas_ideias: [{ tema: 'Ideia teste', formato: 'Dominó', gancho: 'E se...?' }], recado_para_pesquisador: 'teste' });
  return r('ok', schema ? {} : null);
}
