// restauracao.js — lê o backup JSON e envia ao servidor em lotes, só ACRESCENTANDO o que falta.
// A lógica de "já existe" fica no servidor (routes/restaurar.js); aqui o arquivo é conferido,
// os filhos são agrupados com os pais e os ids antigos são trocados pelos ids do sistema.
import { api } from './api.js';

export const ETAPAS = [
  { nome: 'turmas', titulo: 'Turmas', lote: 400 },
  { nome: 'tipos', titulo: 'Tipos de ocorrência', lote: 400 },
  { nome: 'alunos', titulo: 'Alunos', lote: 400 },
  { nome: 'ocorrencias', titulo: 'Ocorrências', lote: 40 },
  { nome: 'busca_ativa', titulo: 'Busca ativa', lote: 100 },
];
export const TITULOS_FILHOS = {
  alunos: 'estudante(s) nas ocorrências', notas: 'nota(s)', chat: 'mensagem(ns) das conversas',
  afastamentos: 'afastamento(s)', acoes: 'ação(ões) da busca ativa',
};
const MAX_BYTES = 2_500_000; // cada envio fica bem abaixo do limite da hospedagem

const agrupar = (lista, chave) => {
  const m = new Map();
  for (const x of lista || []) { if (!m.has(x[chave])) m.set(x[chave], []); m.get(x[chave]).push(x); }
  return m;
};

/** Confere o arquivo e organiza os dados. Lança erro com mensagem clara se não servir. */
export function prepararBackup(texto, codigoEscola) {
  let b;
  try { b = JSON.parse(texto); } catch { throw new Error('O arquivo não é um backup JSON válido do SisRoe.'); }
  if (b?.sistema !== 'SisRoe' || !b.tabelas || !b.escola) throw new Error('Este arquivo não é um backup do SisRoe.');
  if (b.escola.codigo !== codigoEscola) {
    throw new Error(`Este backup é da escola "${b.escola.nome}" (código ${b.escola.codigo}). Só é possível restaurar o backup da própria escola.`);
  }
  const t = b.tabelas;
  const porOcc = { alunos: agrupar(t.ocorrencia_alunos, 'ocorrencia_id'), notas: agrupar(t.ocorrencia_notas, 'ocorrencia_id'),
    chat: agrupar(t.chat_mensagens, 'ocorrencia_id'), afastamentos: agrupar(t.afastamentos, 'ocorrencia_id') };
  const acoes = agrupar(t.busca_ativa_acoes, 'busca_id');
  return {
    escola: b.escola,
    gerado_em: b.gerado_em,
    gerado_por: b.gerado_por,
    dados: {
      turmas: t.turmas || [],
      tipos: t.tipos || [],
      alunos: t.alunos || [],
      ocorrencias: (t.ocorrencias || []).map((o) => ({ ...o,
        alunos: porOcc.alunos.get(o.id) || [], notas: porOcc.notas.get(o.id) || [],
        chat: porOcc.chat.get(o.id) || [], afastamentos: porOcc.afastamentos.get(o.id) || [] })),
      busca_ativa: (t.busca_ativa || []).map((x) => ({ ...x, acoes: acoes.get(x.id) || [] })),
    },
  };
}

/** Troca os ids antigos pelos do sistema (mapas das etapas anteriores). */
function trocarIds(etapa, linha, mapas) {
  const m = (tabela, id) => (id === null || id === undefined ? null : mapas[tabela][id] ?? null);
  if (etapa === 'alunos') return { ...linha, turma_id: m('turmas', linha.turma_id) };
  if (etapa === 'ocorrencias') {
    return { ...linha, tipo_id: m('tipos', linha.tipo_id), turma_id: m('turmas', linha.turma_id),
      alunos: linha.alunos.map((a) => ({ ...a, aluno_id: m('alunos', a.aluno_id) })),
      afastamentos: linha.afastamentos.map((a) => ({ ...a, aluno_id: m('alunos', a.aluno_id) })) };
  }
  if (etapa === 'busca_ativa') return { ...linha, aluno_id: m('alunos', linha.aluno_id) };
  return linha;
}

function* lotes(linhas, max) {
  let atual = [], bytes = 0;
  for (const l of linhas) {
    const tam = JSON.stringify(l).length;
    if (atual.length && (atual.length >= max || bytes + tam > MAX_BYTES)) { yield atual; atual = []; bytes = 0; }
    atual.push(l); bytes += tam;
  }
  if (atual.length) yield atual;
}

/**
 * Executa a restauração (ou só a prévia, com simular=true).
 * Devolve { etapas: { turmas: {novos, existentes, ignorados, renumeradas}, ... }, filhos: {...}, novosTotal }.
 */
export async function restaurar(backup, { simular, progresso = () => {},
  chamar = (url, corpo) => api(url, { metodo: 'POST', corpo }) }) { // "chamar" pode ser trocado (testes)
  const mapas = { turmas: {}, tipos: {}, alunos: {} };
  const etapas = {}, filhos = {};
  let novosTotal = 0;
  for (const e of ETAPAS) {
    const linhas = backup.dados[e.nome];
    const soma = { total: linhas.length, novos: 0, existentes: 0, ignorados: 0, renumeradas: 0 };
    let feitos = 0;
    for (const lote of lotes(linhas.map((l) => trocarIds(e.nome, l, mapas)), e.lote)) {
      progresso(`${simular ? 'Conferindo' : 'Restaurando'} ${e.titulo.toLowerCase()}… ${feitos}/${linhas.length}`);
      const r = await chamar(`/restaurar/${e.nome}`, { codigo: backup.escola.codigo, simular, linhas: lote });
      if (mapas[e.nome]) Object.assign(mapas[e.nome], r.mapa);
      for (const k of ['novos', 'existentes', 'ignorados', 'renumeradas']) soma[k] += r[k];
      for (const [k, n] of Object.entries(r.filhos || {})) filhos[k] = (filhos[k] || 0) + n;
      feitos += lote.length;
    }
    etapas[e.nome] = soma;
    novosTotal += soma.novos;
  }
  return { etapas, filhos, novosTotal };
}
