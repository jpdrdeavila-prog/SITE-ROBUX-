// Relatório diário: métricas do Instagram -> Analista -> painel (+ Telegram)
import { AGENTES } from './agentes.js';
import { perguntar } from './claude.js';
import { metricasRecentes, avisar } from './servicos.js';
import { lerConfig, salvarRelatorio, listarExecs } from './store.js';
import { diaBR } from './pipeline.js';

export async function gerarRelatorio() {
  const cfg = lerConfig();
  const dia = diaBR();
  const rel = { dia, criado: new Date().toISOString(), status: 'rodando' };
  salvarRelatorio(rel);
  try {
    const posts = await metricasRecentes(12);
    rel.posts = posts;
    const producao = listarExecs().slice(0, 7).map(e => ({ dia: e.id.slice(0, 10), tema: e.dados?.pauta?.tema, estilo: e.estilo, formato: e.dados?.roteiro?.formato, falas: e.dados?.roteiro?.segs?.length, status: e.status, custo_usd: +(e.custo || 0).toFixed(2) }));
    const a = AGENTES.analista;
    const r = await perguntar({
      modelo: cfg.modelos[a.modelo], cache: a.cache(), schema: a.schema, esforco: cfg.esforco,
      sistema: a.sistema + `\nHoje é ${dia}. Perfil: ${cfg.handle}.`,
      mensagens: [{ role: 'user', content: `Métricas dos últimos posts (tempo médio em segundos):\n${JSON.stringify(posts, null, 1)}\n\nProdução do estúdio na última semana:\n${JSON.stringify(producao, null, 1)}` }],
    });
    rel.analise = r.json; rel.custo = r.uso.custo; rel.status = 'ok';
    const txt = `📊 Relatório ${dia}\n\n${r.json.resumo}\n\n` + r.json.aprendizados.map(x => '• ' + x).join('\n') + '\n\nPróximas ideias:\n' + r.json.proximas_ideias.map(i => `→ ${i.tema} (${i.formato})`).join('\n');
    rel.texto = txt;
    await avisar(txt);
  } catch (err) {
    rel.status = 'erro'; rel.erro = String(err.message || err);
  }
  salvarRelatorio(rel);
  return rel;
}
