// tipos.js — criação e atualização do catálogo de tipos de cada escola.
import { SITUACOES_PROTOCOLO } from './protocolo179.js';
import { TIPOS_ADMINISTRATIVOS, PROCEDIMENTOS } from '../public/js/catalogo.js';

const INSERIR = `INSERT INTO tipos (escola_id, codigo, descricao, categoria, gravidade, ativo, macro, bo, definicao, passos, origem)
  VALUES (?,?,?,?,?,1,?,?,?,?,?)`;

function paramsProtocolo(escolaId, t) {
  return [escolaId, t.codigo, t.descricao, t.categoria, t.gravidade, t.macro, t.bo, t.definicao || null,
    JSON.stringify(t.passos), 'protocolo'];
}

/** Cria os tipos de uma escola nova: 50 situações do Protocolo + indisciplinas administrativas. */
export async function semearTipos(tx, escolaId) {
  for (const t of SITUACOES_PROTOCOLO) await tx.run(INSERIR, paramsProtocolo(escolaId, t));
  for (const t of TIPOS_ADMINISTRATIVOS) {
    await tx.run(INSERIR, [escolaId, t.codigo, t.descricao, 'administrativa', t.gravidade, t.macro, 'nao', null, null, 'escola']);
  }
}

/**
 * Atualiza o catálogo de uma escola para a versão atual do Protocolo 179:
 *  • situações que já existem (mesmo código, origem protocolo) recebem nome, passos e regras novos;
 *  • situações que faltam são criadas;
 *  • tipos antigos do Protocolo (numeração romana da 2ª versão) são desativados, não apagados.
 * Ocorrências já registradas não mudam: elas guardam o tipo e os passos do momento do registro.
 */
export async function atualizarProtocolo(tx, escolaId) {
  const existentes = await tx.all('SELECT id, codigo, origem FROM tipos WHERE escola_id = ?', [escolaId]);
  let criados = 0, atualizados = 0, desativados = 0;
  for (const t of SITUACOES_PROTOCOLO) {
    const e = existentes.find((x) => x.codigo === t.codigo && x.origem === 'protocolo');
    if (e) {
      await tx.run(
        `UPDATE tipos SET descricao = ?, categoria = ?, macro = ?, bo = ?, definicao = ?, passos = ?, ativo = 1
         WHERE id = ? AND escola_id = ?`,
        [t.descricao, t.categoria, t.macro, t.bo, t.definicao || null, JSON.stringify(t.passos), e.id, escolaId]);
      atualizados++;
    } else {
      await tx.run(INSERIR, paramsProtocolo(escolaId, t));
      criados++;
    }
  }
  for (const e of existentes) {
    if (/^[IVXL]+$/.test(e.codigo) && e.origem !== 'escola') {
      await tx.run('UPDATE tipos SET ativo = 0 WHERE id = ? AND escola_id = ?', [e.id, escolaId]);
      desativados++;
    }
  }
  return { criados, atualizados, desativados };
}

/** Passos de um tipo: os próprios (Protocolo) ou os padrão da categoria. */
export function passosDoTipo(tipo) {
  let p = [];
  try { p = JSON.parse(tipo.passos || '[]'); } catch { /* ignora */ }
  return p.length ? p : PROCEDIMENTOS[tipo.categoria] || [];
}
