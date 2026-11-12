// routes/busca.js — busca ativa de estudantes faltosos (gestão, agentes, GOE e secretaria).
//
// O WhatsApp é aberto no aparelho de quem clica, com a mensagem pronta: a pessoa confere
// e envia por lá. O sistema não dispara mensagens sozinho; ele registra a tentativa.
import express from 'express';
import * as db from '../db.js';
import { exigeBuscaAtiva } from '../auth.js';
import { ErroHttp, txt, dataValida, rota } from '../util.js';
import { normalizarTelefone } from './alunos.js';
import { STATUS_BUSCA, TIPOS_ACAO_BUSCA, RISCOS_BUSCA } from '../../public/js/catalogo.js';

const r = express.Router();
// Equipe gestora + agente, GOE e secretaria (PERFIS_BUSCA em catalogo.js).
r.use('/busca-ativa', exigeBuscaAtiva);

const TIPOS_ACAO = TIPOS_ACAO_BUSCA;
const RISCOS = Object.keys(RISCOS_BUSCA);
const data = (v) => (v && dataValida(v) ? v : null);

async function carregar(req) {
  const b = await db.one('SELECT * FROM busca_ativa WHERE id = ? AND escola_id = ?', [Number(req.params.id), req.usuario.escola_id]);
  if (!b) throw new ErroHttp(404, 'Registro de busca ativa não encontrado.');
  return b;
}

async function alunoDaEscola(eid, id) {
  const a = await db.one(
    `SELECT a.id, a.nome, a.responsavel, a.telefone, t.nome AS turma_nome FROM alunos a
     LEFT JOIN turmas t ON t.id = a.turma_id WHERE a.id = ? AND a.escola_id = ?`, [Number(id), eid]);
  if (!a) throw new ErroHttp(400, 'Aluno inválido.');
  return a;
}

async function abrir(req, item, comum) {
  const u = req.usuario;
  const a = await alunoDaEscola(u.escola_id, item.aluno_id);
  const aberto = await db.one(
    "SELECT id FROM busca_ativa WHERE escola_id = ? AND aluno_id = ? AND status NOT IN ('retornou','transferido','encerrado')",
    [u.escola_id, a.id]);
  if (aberto) return { aluno: a.nome, jaExistia: aberto.id };
  const faltas = Math.max(0, Math.min(200, Number(item.faltas) || 0));
  const telefone = item.telefone !== undefined ? normalizarTelefone(item.telefone) : (a.telefone || '');
  const responsavel = item.responsavel !== undefined ? txt(item.responsavel, 120) : (a.responsavel || '');
  // O contato informado aqui fica salvo no cadastro do aluno, para a próxima vez.
  if (item.telefone !== undefined || item.responsavel !== undefined) {
    await db.run('UPDATE alunos SET telefone = ?, responsavel = ? WHERE id = ? AND escola_id = ?',
      [telefone || null, responsavel || null, a.id, u.escola_id]);
  }
  const agora = db.agora();
  const id = await db.insert(
    `INSERT INTO busca_ativa (escola_id, aluno_id, aluno_nome, turma_nome, faltas, periodo_inicio, periodo_fim, motivo, risco,
       status, responsavel, telefone, observacoes, aberto_por_nome, criado_em, atualizado_em)
     VALUES (?,?,?,?,?,?,?,?,?,'aberto',?,?,?,?,?,?)`,
    [u.escola_id, a.id, a.nome, a.turma_nome, faltas, data(comum.periodo_inicio), data(comum.periodo_fim),
     txt(item.motivo ?? comum.motivo, 500) || null, RISCOS.includes(item.risco) ? item.risco : 'baixo',
     responsavel || null, telefone || null, txt(item.observacoes, 2000) || null, u.nome, agora, agora]);
  return { aluno: a.nome, id };
}

r.get('/busca-ativa', rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  const w = ['b.escola_id = ?'];
  const p = [eid];
  if (STATUS_BUSCA[req.query.status]) { w.push('b.status = ?'); p.push(req.query.status); }
  else if (req.query.status !== 'todos') w.push("b.status NOT IN ('retornou','transferido','encerrado')");
  const lista = await db.all(
    `SELECT b.*, (SELECT COUNT(*) FROM busca_ativa_acoes x WHERE x.busca_id = b.id) AS qtd_acoes,
       (SELECT MAX(x.criado_em) FROM busca_ativa_acoes x WHERE x.busca_id = b.id) AS ultima_acao
     FROM busca_ativa b WHERE ${w.join(' AND ')} ORDER BY b.faltas DESC, b.atualizado_em DESC LIMIT 500`, p);
  res.json(lista.map((b) => ({ ...b, qtd_acoes: Number(b.qtd_acoes) })));
}));

// Um aluno.
r.post('/busca-ativa', rota(async (req, res) => {
  const b = req.body || {};
  const r2 = await abrir(req, b, b);
  if (r2.jaExistia) throw new ErroHttp(409, `${r2.aluno} já tem um caso de busca ativa em andamento.`);
  await db.auditar(req.usuario.escola_id, req.usuario, 'busca_ativa_aberta', { id: r2.id });
  res.status(201).json({ id: r2.id });
}));

// Vários alunos de uma vez (faltosos marcados na lista da turma).
r.post('/busca-ativa/lote', rota(async (req, res) => {
  const b = req.body || {};
  const itens = Array.isArray(b.itens) ? b.itens.slice(0, 100) : [];
  if (!itens.length) throw new ErroHttp(400, 'Marque ao menos um aluno.');
  const criados = [], jaExistiam = [];
  for (const it of itens) {
    const r2 = await abrir(req, it, b);
    if (r2.jaExistia) jaExistiam.push(r2.aluno); else criados.push(r2.id);
  }
  await db.auditar(req.usuario.escola_id, req.usuario, 'busca_ativa_lote', { criados: criados.length });
  res.status(201).json({ criados: criados.length, jaExistiam });
}));

r.get('/busca-ativa/:id', rota(async (req, res) => {
  const b = await carregar(req);
  const acoes = await db.all(
    'SELECT tipo, resultado, usuario_nome, criado_em FROM busca_ativa_acoes WHERE escola_id = ? AND busca_id = ? ORDER BY id DESC',
    [req.usuario.escola_id, b.id]);
  res.json({ ...b, acoes });
}));

r.put('/busca-ativa/:id', rota(async (req, res) => {
  const b = await carregar(req);
  const c = req.body || {};
  const status = STATUS_BUSCA[c.status] ? c.status : b.status;
  const telefone = c.telefone !== undefined ? normalizarTelefone(c.telefone) : b.telefone;
  const responsavel = c.responsavel !== undefined ? txt(c.responsavel, 120) : b.responsavel;
  await db.run(
    `UPDATE busca_ativa SET faltas = ?, periodo_inicio = ?, periodo_fim = ?, motivo = ?, risco = ?, status = ?,
       responsavel = ?, telefone = ?, observacoes = ?, atualizado_em = ? WHERE id = ? AND escola_id = ?`,
    [c.faltas !== undefined ? Math.max(0, Math.min(200, Number(c.faltas) || 0)) : b.faltas,
     c.periodo_inicio !== undefined ? data(c.periodo_inicio) : b.periodo_inicio,
     c.periodo_fim !== undefined ? data(c.periodo_fim) : b.periodo_fim,
     c.motivo !== undefined ? txt(c.motivo, 500) || null : b.motivo,
     RISCOS.includes(c.risco) ? c.risco : b.risco, status, responsavel || null, telefone || null,
     c.observacoes !== undefined ? txt(c.observacoes, 2000) || null : b.observacoes, db.agora(), b.id, req.usuario.escola_id]);
  if (c.telefone !== undefined || c.responsavel !== undefined) {
    await db.run('UPDATE alunos SET telefone = ?, responsavel = ? WHERE id = ? AND escola_id = ?',
      [telefone || null, responsavel || null, b.aluno_id, req.usuario.escola_id]);
  }
  if (status !== b.status) {
    await db.insert('INSERT INTO busca_ativa_acoes (escola_id, busca_id, tipo, resultado, usuario_nome, criado_em) VALUES (?,?,?,?,?,?)',
      [req.usuario.escola_id, b.id, 'status', `Situação: ${STATUS_BUSCA[status]}`, req.usuario.nome, db.agora()]);
  }
  await db.auditar(req.usuario.escola_id, req.usuario, 'busca_ativa_atualizada', { id: b.id, status });
  res.json({ ok: true });
}));

// Registra uma ação de contato (inclusive a abertura do WhatsApp).
r.post('/busca-ativa/:id/acoes', rota(async (req, res) => {
  const b = await carregar(req);
  const tipo = TIPOS_ACAO[req.body?.tipo] ? req.body.tipo : null;
  if (!tipo) throw new ErroHttp(400, 'Tipo de ação inválido.');
  const agora = db.agora();
  await db.insert('INSERT INTO busca_ativa_acoes (escola_id, busca_id, tipo, resultado, usuario_nome, criado_em) VALUES (?,?,?,?,?,?)',
    [req.usuario.escola_id, b.id, tipo, txt(req.body?.resultado, 1000) || null, req.usuario.nome, agora]);
  // A primeira tentativa de contato muda a situação de "monitoramento" para "família contatada".
  const novoStatus = b.status === 'aberto' && ['whatsapp', 'ligacao', 'visita', 'reuniao'].includes(tipo) ? 'contato' : b.status;
  await db.run('UPDATE busca_ativa SET status = ?, atualizado_em = ? WHERE id = ? AND escola_id = ?',
    [novoStatus, agora, b.id, req.usuario.escola_id]);
  res.status(201).json({ ok: true, status: novoStatus });
}));

export default r;
