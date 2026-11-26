// Guarda configuração, execuções e relatórios em arquivos JSON na pasta dados/
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ } from './env.js';

export const DADOS = path.join(RAIZ, 'dados');
export const EXEC = path.join(DADOS, 'execucoes');
export const REL = path.join(DADOS, 'relatorios');
for (const d of [DADOS, EXEC, REL]) fs.mkdirSync(d, { recursive: true });

export const CONFIG_PADRAO = {
  ativo: false,                 // liga a agenda automática
  handle: '@ESTEREOLUDICO',
  nicho: 'dinheiro no bolso do brasileiro: economia, direitos, impostos, golpes, notícias que mexem com o bolso, explicadas de forma simples',
  horarioCriacao: '09:00',      // começa a pesquisar e montar o vídeo
  horarioPostagem: '18:00',     // publica (se aprovado)
  horarioRelatorio: '21:30',    // relatório diário
  estilos: ['A', 'B', 'C'],     // rodízio de estilos, um por dia
  duracaoAlvo: '60 a 75 segundos',
  aprovacaoHumana: true,        // segura a postagem até você aprovar no painel
  ideiasNaFila: [],             // ideias suas que passam na frente da pesquisa
  temasProibidos: 'conteúdo partidário de ataque, saúde com promessa de cura, apostas incentivadas',
  jobsRender: 3,
  modelos: {
    principal: 'claude-opus-5-5',   // pesquisador, checador, roteirista, diretor
    rapido: 'claude-opus-5-5',      // revisor, redator, analista (troque por claude-sonnet-5-5 para gastar menos)
  },
  esforco: 'high',
};

const ARQ_CFG = path.join(DADOS, 'config.json');

export function lerConfig() {
  let c = {};
  try { c = JSON.parse(fs.readFileSync(ARQ_CFG, 'utf8')); } catch {}
  return { ...CONFIG_PADRAO, ...c, modelos: { ...CONFIG_PADRAO.modelos, ...(c.modelos || {}) } };
}
export function salvarConfig(c) {
  const atual = lerConfig();
  const novo = { ...atual, ...c, modelos: { ...atual.modelos, ...(c.modelos || {}) } };
  fs.writeFileSync(ARQ_CFG, JSON.stringify(novo, null, 2));
  return novo;
}

export const pastaExec = id => path.join(EXEC, id);

export function lerExec(id) {
  try { return JSON.parse(fs.readFileSync(path.join(pastaExec(id), 'estado.json'), 'utf8')); } catch { return null; }
}
export function salvarExec(e) {
  fs.mkdirSync(pastaExec(e.id), { recursive: true });
  const tmp = path.join(pastaExec(e.id), 'estado.json.tmp');
  fs.writeFileSync(tmp, JSON.stringify(e, null, 2));
  fs.renameSync(tmp, path.join(pastaExec(e.id), 'estado.json'));
}
export function listarExecs() {
  return fs.readdirSync(EXEC).map(lerExec).filter(Boolean).sort((a, b) => b.criado.localeCompare(a.criado));
}

export function salvarRelatorio(r) { fs.writeFileSync(path.join(REL, r.dia + '.json'), JSON.stringify(r, null, 2)); }
export function listarRelatorios() {
  return fs.readdirSync(REL).filter(f => f.endsWith('.json')).sort().reverse()
    .map(f => { try { return JSON.parse(fs.readFileSync(path.join(REL, f), 'utf8')); } catch { return null; } }).filter(Boolean);
}
