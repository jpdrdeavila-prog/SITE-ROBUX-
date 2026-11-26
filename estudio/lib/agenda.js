// Agenda diária (horário de Brasília): cria o vídeo, posta e manda o relatório sozinho.
import { lerConfig, listarExecs, listarRelatorios } from './store.js';
import { novaExecucao, iniciar, diaBR, horaBR } from './pipeline.js';
import { gerarRelatorio } from './relatorio.js';

let feito = {};
export function ligarAgenda() {
  setInterval(() => {
    const cfg = lerConfig();
    if (!cfg.ativo) return;
    const dia = diaBR(), hora = horaBR();
    if (hora >= cfg.horarioCriacao && !feito['v' + dia] && !listarExecs().some(e => e.origem === 'agenda' && e.id.startsWith(dia))) {
      feito['v' + dia] = true;
      const e = novaExecucao({ origem: 'agenda' });
      iniciar(e.id);
    }
    if (hora >= cfg.horarioRelatorio && !feito['r' + dia] && !listarRelatorios().some(r => r.dia === dia && r.status === 'ok')) {
      feito['r' + dia] = true;
      gerarRelatorio().catch(() => {});
    }
  }, 30000);
}
