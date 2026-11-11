// routes/escola.js — dados da escola, usuários, turmas, alunos e tipos.
// Todas as consultas filtram por req.usuario.escola_id.
import express from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import * as db from '../db.js';
import { exigeAdmin, ehAdmin } from '../auth.js';
import { ErroHttp, txt, obrigatorio, senhaForte, MSG_SENHA, rota } from '../util.js';
import { normalizarCodigo } from './publico.js';
import { PERFIS, CATEGORIAS, GRAVIDADES, MACROS } from '../../public/js/catalogo.js';
import { atualizarProtocolo, passosDoTipo } from '../tipos.js';

const r = express.Router();

// ─── Sessão ──────────────────────────────────────────────────────────────────
r.get('/eu', rota(async (req, res) => {
  const escola = await db.one(
    'SELECT id, nome, codigo, cie, municipio, diretoria, telefone, endereco FROM escolas WHERE id = ?',
    [req.usuario.escola_id]
  );
  const u = req.usuario;
  res.json({
    usuario: { id: u.id, nome: u.nome, login: u.login, perfil: u.perfil, trocar_senha: !!u.trocar_senha },
    escola,
  });
}));

r.post('/minha-senha', rota(async (req, res) => {
  const { atual, nova } = req.body || {};
  const u = await db.one('SELECT senha_hash FROM usuarios WHERE id = ? AND escola_id = ?', [req.usuario.id, req.usuario.escola_id]);
  if (!(await bcrypt.compare(String(atual || ''), u.senha_hash))) throw new ErroHttp(400, 'Senha atual incorreta.');
  if (!senhaForte(nova)) throw new ErroHttp(400, MSG_SENHA);
  if (nova === atual) throw new ErroHttp(400, 'A nova senha precisa ser diferente da atual.');
  await db.run('UPDATE usuarios SET senha_hash = ?, trocar_senha = 0 WHERE id = ? AND escola_id = ?',
    [await bcrypt.hash(nova, 10), req.usuario.id, req.usuario.escola_id]);
  await db.auditar(req.usuario.escola_id, req.usuario, 'senha_alterada');
  res.json({ ok: true });
}));

// ─── Escola ──────────────────────────────────────────────────────────────────
r.put('/escola', exigeAdmin, rota(async (req, res) => {
  const e = req.body || {};
  await db.run(
    'UPDATE escolas SET nome = ?, cie = ?, municipio = ?, diretoria = ?, telefone = ?, endereco = ? WHERE id = ?',
    [obrigatorio(e.nome, 'nome da escola', 150), txt(e.cie, 20), txt(e.municipio, 80), txt(e.diretoria, 120),
     txt(e.telefone, 30), txt(e.endereco, 200), req.usuario.escola_id]
  );
  await db.auditar(req.usuario.escola_id, req.usuario, 'escola_editada');
  res.json({ ok: true });
}));

// ─── Usuários ────────────────────────────────────────────────────────────────
function senhaProvisoria() {
  // 10 caracteres legíveis + 2 dígitos (atende à regra de senha forte).
  const letras = 'abcdefghjkmnpqrstuvwxyz';
  let s = '';
  for (let i = 0; i < 8; i++) s += letras[crypto.randomInt(letras.length)];
  return s + crypto.randomInt(10, 100);
}

r.get('/usuarios', exigeAdmin, rota(async (req, res) => {
  res.json(await db.all(
    'SELECT id, nome, login, perfil, ativo, trocar_senha, criado_em FROM usuarios WHERE escola_id = ? ORDER BY ativo DESC, nome',
    [req.usuario.escola_id]
  ));
}));

r.post('/usuarios', exigeAdmin, rota(async (req, res) => {
  const b = req.body || {};
  const nome = obrigatorio(b.nome, 'nome', 120);
  const login = normalizarCodigo(b.login);
  if (login.length < 3) throw new ErroHttp(400, 'O usuário precisa ter ao menos 3 letras ou números (sem espaços).');
  if (!PERFIS[b.perfil]) throw new ErroHttp(400, 'Perfil inválido.');
  const eid = req.usuario.escola_id;
  if (await db.one('SELECT id FROM usuarios WHERE escola_id = ? AND login = ?', [eid, login])) {
    throw new ErroHttp(409, 'Já existe um usuário com esse login nesta escola.');
  }
  const provisoria = senhaProvisoria();
  const id = await db.insert(
    'INSERT INTO usuarios (escola_id, nome, login, perfil, senha_hash, ativo, trocar_senha, criado_em) VALUES (?,?,?,?,?,1,1,?)',
    [eid, nome, login, b.perfil, await bcrypt.hash(provisoria, 10), db.agora()]
  );
  await db.auditar(eid, req.usuario, 'usuario_criado', { id, login, perfil: b.perfil });
  res.status(201).json({ id, login, senhaProvisoria: provisoria });
}));

r.put('/usuarios/:id', exigeAdmin, rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  const id = Number(req.params.id);
  const alvo = await db.one('SELECT id, perfil, ativo FROM usuarios WHERE id = ? AND escola_id = ?', [id, eid]);
  if (!alvo) throw new ErroHttp(404, 'Usuário não encontrado.');
  const b = req.body || {};
  const perfil = b.perfil ?? alvo.perfil;
  const ativo = b.ativo === undefined ? alvo.ativo : (b.ativo ? 1 : 0);
  if (!PERFIS[perfil]) throw new ErroHttp(400, 'Perfil inválido.');
  if (id === req.usuario.id && (!ativo || !['vice', 'diretor'].includes(perfil))) {
    throw new ErroHttp(400, 'Você não pode desativar nem tirar a sua própria permissão de administração.');
  }
  await db.run('UPDATE usuarios SET nome = COALESCE(?, nome), perfil = ?, ativo = ? WHERE id = ? AND escola_id = ?',
    [b.nome ? txt(b.nome, 120) : null, perfil, ativo, id, eid]);
  await db.auditar(eid, req.usuario, 'usuario_editado', { id, perfil, ativo });
  res.json({ ok: true });
}));

r.post('/usuarios/:id/resetar-senha', exigeAdmin, rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  const id = Number(req.params.id);
  if (!(await db.one('SELECT id FROM usuarios WHERE id = ? AND escola_id = ?', [id, eid]))) {
    throw new ErroHttp(404, 'Usuário não encontrado.');
  }
  const provisoria = senhaProvisoria();
  await db.run('UPDATE usuarios SET senha_hash = ?, trocar_senha = 1 WHERE id = ? AND escola_id = ?',
    [await bcrypt.hash(provisoria, 10), id, eid]);
  await db.auditar(eid, req.usuario, 'senha_resetada', { id });
  res.json({ senhaProvisoria: provisoria });
}));

// ─── Turmas ──────────────────────────────────────────────────────────────────
r.get('/turmas', rota(async (req, res) => {
  const soAtivas = !(ehAdmin(req.usuario) && req.query.todas === '1');
  res.json(await db.all(
    `SELECT t.id, t.nome, t.periodo, t.ativa,
       (SELECT COUNT(*) FROM alunos a WHERE a.turma_id = t.id AND a.ativo = 1) AS qtd_alunos
     FROM turmas t WHERE t.escola_id = ? ${soAtivas ? 'AND t.ativa = 1' : ''} ORDER BY t.nome`,
    [req.usuario.escola_id]
  ));
}));

r.post('/turmas', exigeAdmin, rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  const nome = obrigatorio(req.body?.nome, 'nome da turma', 60);
  if (await db.one('SELECT id FROM turmas WHERE escola_id = ? AND nome = ?', [eid, nome])) {
    throw new ErroHttp(409, 'Já existe uma turma com esse nome.');
  }
  const id = await db.insert('INSERT INTO turmas (escola_id, nome, periodo, ativa) VALUES (?,?,?,1)',
    [eid, nome, txt(req.body?.periodo, 30)]);
  res.status(201).json({ id });
}));

r.put('/turmas/:id', exigeAdmin, rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  const t = await db.one('SELECT * FROM turmas WHERE id = ? AND escola_id = ?', [Number(req.params.id), eid]);
  if (!t) throw new ErroHttp(404, 'Turma não encontrada.');
  const b = req.body || {};
  await db.run('UPDATE turmas SET nome = ?, periodo = ?, ativa = ? WHERE id = ? AND escola_id = ?',
    [b.nome ? txt(b.nome, 60) : t.nome, b.periodo !== undefined ? txt(b.periodo, 30) : t.periodo,
     b.ativa === undefined ? t.ativa : (b.ativa ? 1 : 0), t.id, eid]);
  res.json({ ok: true });
}));

// ─── Alunos ──────────────────────────────────────────────────────────────────
r.get('/alunos', rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  if (req.query.turma_id) {
    return res.json(await db.all(
      'SELECT id, ra, nome, turma_id FROM alunos WHERE escola_id = ? AND turma_id = ? AND ativo = 1 ORDER BY nome',
      [eid, Number(req.query.turma_id)]
    ));
  }
  const busca = txt(req.query.busca, 60).toLowerCase();
  if (busca.length < 2) return res.json([]);
  res.json(await db.all(
    `SELECT a.id, a.ra, a.nome, a.turma_id, t.nome AS turma_nome
     FROM alunos a LEFT JOIN turmas t ON t.id = a.turma_id
     WHERE a.escola_id = ? AND a.ativo = 1 AND (LOWER(a.nome) LIKE ? OR a.ra LIKE ?)
     ORDER BY a.nome LIMIT 30`,
    [eid, `%${busca}%`, `%${busca}%`]
  ));
}));

/**
 * Importa a lista de alunos de uma turma colando texto.
 * Cada linha: "RA;Nome", "RA<tab>Nome" (copiado de planilha) ou só "Nome".
 * Se o RA já existir na escola, o aluno é atualizado e movido para a turma.
 */
r.post('/turmas/:id/importar', exigeAdmin, rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  const turma = await db.one('SELECT id FROM turmas WHERE id = ? AND escola_id = ?', [Number(req.params.id), eid]);
  if (!turma) throw new ErroHttp(404, 'Turma não encontrada.');
  const linhas = String(req.body?.texto || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (linhas.length > 300) throw new ErroHttp(400, 'Envie no máximo 300 alunos por vez.');

  let criados = 0, atualizados = 0;
  await db.transacao(async (tx) => {
    for (const linha of linhas) {
      const partes = linha.split(/[;\t,]/).map((p) => p.trim()).filter(Boolean);
      // Ignora a linha de cabeçalho da planilha (ex.: "RA;Nome", "Nome do aluno").
      if (partes.some((p) => /^(ra|nome|nome do aluno|aluno)$/i.test(p))) continue;
      let ra = '', nome = '';
      if (partes.length >= 2 && /\d/.test(partes[0])) { ra = partes[0].slice(0, 30); nome = partes[1]; }
      else nome = partes.join(' ');
      nome = nome.slice(0, 120).toUpperCase();
      if (!nome) continue;
      const existe = ra ? await tx.one('SELECT id FROM alunos WHERE escola_id = ? AND ra = ?', [eid, ra]) : null;
      if (existe) {
        await tx.run('UPDATE alunos SET nome = ?, turma_id = ?, ativo = 1 WHERE id = ?', [nome, turma.id, existe.id]);
        atualizados++;
      } else {
        await tx.insert('INSERT INTO alunos (escola_id, turma_id, ra, nome, ativo) VALUES (?,?,?,?,1)',
          [eid, turma.id, ra || null, nome]);
        criados++;
      }
    }
  });
  await db.auditar(eid, req.usuario, 'alunos_importados', { turma: turma.id, criados, atualizados });
  res.json({ criados, atualizados });
}));

r.delete('/alunos/:id', exigeAdmin, rota(async (req, res) => {
  // Não apaga de verdade (o histórico de ocorrências continua): só desativa.
  const eid = req.usuario.escola_id;
  await db.run('UPDATE alunos SET ativo = 0 WHERE id = ? AND escola_id = ?', [Number(req.params.id), eid]);
  res.json({ ok: true });
}));

// ─── Tipos de ocorrência ─────────────────────────────────────────────────────
r.get('/tipos', rota(async (req, res) => {
  const soAtivos = !(ehAdmin(req.usuario) && req.query.todos === '1');
  res.json(await db.all(
    // Lista leve (sem os passos). Os passos vêm em GET /tipos/:id.
    `SELECT id, codigo, descricao, categoria, gravidade, ativo, macro, bo, definicao, origem FROM tipos
     WHERE escola_id = ? ${soAtivos ? 'AND ativo = 1' : ''} ORDER BY categoria, id`,
    [req.usuario.escola_id]
  ));
}));

r.get('/tipos/:id', rota(async (req, res) => {
  const t = await db.one('SELECT * FROM tipos WHERE id = ? AND escola_id = ?', [Number(req.params.id), req.usuario.escola_id]);
  if (!t) throw new ErroHttp(404, 'Tipo não encontrado.');
  res.json({ ...t, passos: passosDoTipo(t), passos_proprios: t.origem === 'protocolo' });
}));

// Atualiza o catálogo da escola para a versão do Protocolo 179 que está no sistema.
r.post('/tipos/atualizar-protocolo', exigeAdmin, rota(async (req, res) => {
  const r2 = await db.transacao((tx) => atualizarProtocolo(tx, req.usuario.escola_id));
  await db.auditar(req.usuario.escola_id, req.usuario, 'catalogo_atualizado', r2);
  res.json(r2);
}));

function validarTipo(b) {
  if (!CATEGORIAS[b.categoria]) throw new ErroHttp(400, 'Categoria inválida.');
  if (!GRAVIDADES[b.gravidade]) throw new ErroHttp(400, 'Gravidade inválida.');
  if (b.macro && !MACROS[b.macro]) throw new ErroHttp(400, 'Macrocategoria inválida.');
  return { codigo: obrigatorio(b.codigo, 'código', 12), descricao: obrigatorio(b.descricao, 'descrição', 160) };
}

r.post('/tipos', exigeAdmin, rota(async (req, res) => {
  const b = req.body || {};
  const { codigo, descricao } = validarTipo(b);
  const id = await db.insert(
    "INSERT INTO tipos (escola_id, codigo, descricao, categoria, gravidade, ativo, macro, bo, origem) VALUES (?,?,?,?,?,1,?,?,'escola')",
    [req.usuario.escola_id, codigo, descricao, b.categoria, b.gravidade, b.macro || null, 'avaliar']
  );
  await db.auditar(req.usuario.escola_id, req.usuario, 'tipo_criado', { id, codigo });
  res.status(201).json({ id });
}));

r.put('/tipos/:id', exigeAdmin, rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  const t = await db.one('SELECT * FROM tipos WHERE id = ? AND escola_id = ?', [Number(req.params.id), eid]);
  if (!t) throw new ErroHttp(404, 'Tipo não encontrado.');
  const b = { ...t, ...(req.body || {}) };
  const { codigo, descricao } = validarTipo(b);
  await db.run('UPDATE tipos SET codigo = ?, descricao = ?, categoria = ?, gravidade = ?, macro = ?, ativo = ? WHERE id = ? AND escola_id = ?',
    [codigo, descricao, b.categoria, b.gravidade, b.macro || null, b.ativo ? 1 : 0, t.id, eid]);
  await db.auditar(eid, req.usuario, 'tipo_editado', { id: t.id });
  res.json({ ok: true });
}));

// ─── Auditoria ───────────────────────────────────────────────────────────────
r.get('/auditoria', exigeAdmin, rota(async (req, res) => {
  res.json(await db.all(
    'SELECT usuario_nome, acao, detalhes, criado_em FROM auditoria WHERE escola_id = ? ORDER BY id DESC LIMIT 200',
    [req.usuario.escola_id]
  ));
}));

export default r;
