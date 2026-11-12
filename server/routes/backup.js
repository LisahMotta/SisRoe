// routes/backup.js — cópia de segurança dos dados da escola (equipe gestora).
//
// O navegador busca tabela por tabela, em páginas, e monta os arquivos Excel (.xlsx) e JSON
// no próprio aparelho: a Vercel limita cada resposta a ~4,5 MB, e uma escola com anos de
// registros passaria disso num arquivo só.
// Ficam fora: senhas (nem o código delas), fotos e arquivos do carômetro (pesados), avisos e push.
import express from 'express';
import * as db from '../db.js';
import { exigeGestao, ehAdmin } from '../auth.js';
import { ErroHttp, rota } from '../util.js';

const r = express.Router();

// Tabelas da cópia, na ordem em que aparecem nos arquivos. admin = só vice e direção (dados da equipe).
export const TABELAS = {
  turmas: { titulo: 'Turmas' },
  alunos: { titulo: 'Alunos' },
  ocorrencias: { titulo: 'Ocorrências' },
  ocorrencia_alunos: { titulo: 'Ocorrências - estudantes' },
  ocorrencia_notas: { titulo: 'Ocorrências - notas' },
  chat_mensagens: { titulo: 'Ocorrências - conversas' },
  afastamentos: { titulo: 'Afastamentos' },
  busca_ativa: { titulo: 'Busca ativa' },
  busca_ativa_acoes: { titulo: 'Busca ativa - ações' },
  tipos: { titulo: 'Tipos de ocorrência' },
  usuarios: { titulo: 'Equipe', admin: true, colunas: 'id, nome, login, perfil, ativo, criado_em' },
};
const OCULTAS = new Set(['escola_id', 'senha_hash', 'falhas_login', 'bloqueado_ate', 'trocar_senha', 'tutorial_visto']);
const POR_PAGINA = 500;

// O que entra na cópia para este usuário (a tela mostra antes de baixar).
r.get('/backup', exigeGestao, rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  const tabelas = [];
  for (const [nome, t] of Object.entries(TABELAS)) {
    if (t.admin && !ehAdmin(req.usuario)) continue;
    const { qtd } = await db.one(`SELECT COUNT(*) AS qtd FROM ${nome} WHERE escola_id = ?`, [eid]);
    tabelas.push({ nome, titulo: t.titulo, registros: Number(qtd) });
  }
  const escola = await db.one('SELECT id, nome, codigo, cie, municipio, diretoria, telefone, endereco, criado_em FROM escolas WHERE id = ?', [eid]);
  res.json({ escola, tabelas, por_pagina: POR_PAGINA });
}));

// Uma página de uma tabela (depois = último id recebido).
r.get('/backup/:tabela', exigeGestao, rota(async (req, res) => {
  const nome = req.params.tabela;
  const t = Object.hasOwn(TABELAS, nome) ? TABELAS[nome] : null; // nome da tabela só da lista acima
  if (!t || (t.admin && !ehAdmin(req.usuario))) throw new ErroHttp(404, 'Tabela não encontrada.');
  const depois = Math.max(0, Number(req.query.depois) || 0);
  const linhas = await db.all(
    `SELECT ${t.colunas || '*'} FROM ${nome} WHERE escola_id = ? AND id > ? ORDER BY id LIMIT ${POR_PAGINA}`,
    [req.usuario.escola_id, depois]);
  const limpas = linhas.map((l) => Object.fromEntries(Object.entries(l).filter(([k]) => !OCULTAS.has(k))));
  res.json({ linhas: limpas, fim: linhas.length < POR_PAGINA });
}));

// Registro na auditoria quando a cópia termina (quem baixou e o quê).
r.post('/backup/registrar', exigeGestao, rota(async (req, res) => {
  const formato = ['xlsx', 'json'].includes(req.body?.formato) ? req.body.formato : 'desconhecido';
  await db.auditar(req.usuario.escola_id, req.usuario, 'backup_baixado', { formato });
  res.json({ ok: true });
}));

export default r;
