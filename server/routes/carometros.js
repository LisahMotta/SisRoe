// routes/carometros.js — carômetro da turma em arquivo (PDF ou JPG) e lista para fotos em lote.
//
// O arquivo é guardado no banco em partes (base64), porque a hospedagem gratuita não tem disco
// permanente e a Vercel limita cada envio e cada resposta a ~4,5 MB. O navegador envia parte por
// parte e, para abrir, baixa parte por parte e junta tudo.
// Quem vê: todos os servidores da escola (como as fotos do carômetro). Quem envia: a administração.
import express from 'express';
import * as db from '../db.js';
import { exigeAdmin, exigeGestaoOuAdmin } from '../auth.js';
import { ErroHttp, txt, rota } from '../util.js';

const r = express.Router();

export const MAX_ARQUIVO = 20 * 1024 * 1024; // 20 MB
export const TAM_PARTE = 2_800_000; // caracteres base64 por parte (múltiplo de 4, ~2,1 MB)
const TIPOS = ['application/pdf', 'image/jpeg', 'image/png'];

async function carometroDaEscola(id, eid) {
  const c = await db.one('SELECT * FROM carometros WHERE id = ? AND escola_id = ?', [Number(id), eid]);
  if (!c) throw new ErroHttp(404, 'Carômetro não encontrado.');
  return c;
}

async function apagar(eid, ids) {
  for (const id of ids) {
    await db.run('DELETE FROM carometro_partes WHERE escola_id = ? AND carometro_id = ?', [eid, id]);
    await db.run('DELETE FROM carometros WHERE escola_id = ? AND id = ?', [eid, id]);
  }
}

// Lista dos carômetros enviados (sem o conteúdo).
r.get('/carometros', rota(async (req, res) => {
  res.json(await db.all(
    `SELECT c.id, c.turma_id, t.nome AS turma_nome, c.nome_arquivo, c.mime, c.tamanho, c.partes, c.enviado_por_nome, c.criado_em
     FROM carometros c LEFT JOIN turmas t ON t.id = c.turma_id AND t.escola_id = c.escola_id
     WHERE c.escola_id = ? AND c.completo = 1 ORDER BY t.nome, c.criado_em DESC`, [req.usuario.escola_id]));
}));

// 1) Começa o envio: informa o arquivo e quantas partes virão.
r.post('/carometros', exigeAdmin, rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  const b = req.body || {};
  if (!TIPOS.includes(b.mime)) throw new ErroHttp(400, 'Envie o carômetro em PDF ou JPG.');
  const tamanho = Number(b.tamanho);
  if (!(tamanho > 0)) throw new ErroHttp(400, 'Arquivo vazio.');
  if (tamanho > MAX_ARQUIVO) throw new ErroHttp(400, 'Arquivo grande demais (máximo 20 MB). Divida o PDF por turma.');
  const partes = Number(b.partes);
  const esperado = Math.ceil(Math.ceil(tamanho / 3) * 4 / TAM_PARTE);
  if (!Number.isInteger(partes) || partes < 1 || partes !== esperado) throw new ErroHttp(400, 'Número de partes inválido.');
  let turmaId = null;
  if (b.turma_id) {
    const t = await db.one('SELECT id FROM turmas WHERE id = ? AND escola_id = ?', [Number(b.turma_id), eid]);
    if (!t) throw new ErroHttp(404, 'Turma não encontrada.');
    turmaId = t.id;
  }
  // Limpa envios que ficaram pela metade (conexão caiu) há mais de um dia.
  const ontem = new Date(Date.now() - 86400000).toISOString();
  const velhos = await db.all('SELECT id FROM carometros WHERE escola_id = ? AND completo = 0 AND criado_em < ?', [eid, ontem]);
  await apagar(eid, velhos.map((v) => v.id));

  const id = await db.insert(
    'INSERT INTO carometros (escola_id, turma_id, nome_arquivo, mime, tamanho, partes, completo, enviado_por_nome, criado_em) VALUES (?,?,?,?,?,?,0,?,?)',
    [eid, turmaId, txt(b.nome_arquivo, 150) || 'carometro', b.mime, tamanho, partes, req.usuario.nome, db.agora()]);
  res.status(201).json({ id, tam_parte: TAM_PARTE });
}));

// 2) Envia cada parte (base64).
r.put('/carometros/:id/partes/:ordem', exigeAdmin, rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  const c = await carometroDaEscola(req.params.id, eid);
  if (c.completo) throw new ErroHttp(409, 'Este envio já foi concluído.');
  const ordem = Number(req.params.ordem);
  if (!Number.isInteger(ordem) || ordem < 0 || ordem >= c.partes) throw new ErroHttp(400, 'Parte inválida.');
  const dados = String(req.body?.dados || '');
  if (!dados || dados.length > TAM_PARTE || !/^[A-Za-z0-9+/=]+$/.test(dados)) throw new ErroHttp(400, 'Parte do arquivo inválida.');
  await db.run('DELETE FROM carometro_partes WHERE escola_id = ? AND carometro_id = ? AND ordem = ?', [eid, c.id, ordem]);
  await db.insert('INSERT INTO carometro_partes (escola_id, carometro_id, ordem, dados) VALUES (?,?,?,?)', [eid, c.id, ordem, dados]);
  res.json({ ok: true });
}));

// 3) Conclui: confere as partes e substitui o carômetro anterior da mesma turma.
r.post('/carometros/:id/concluir', exigeAdmin, rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  const c = await carometroDaEscola(req.params.id, eid);
  const { qtd } = await db.one('SELECT COUNT(*) AS qtd FROM carometro_partes WHERE escola_id = ? AND carometro_id = ?', [eid, c.id]);
  if (Number(qtd) !== c.partes) throw new ErroHttp(400, 'O envio não terminou. Tente de novo.');
  const anteriores = await db.all(
    `SELECT id FROM carometros WHERE escola_id = ? AND completo = 1 AND id <> ? AND ${c.turma_id ? 'turma_id = ?' : 'turma_id IS NULL'}`,
    c.turma_id ? [eid, c.id, c.turma_id] : [eid, c.id]);
  await apagar(eid, anteriores.map((a) => a.id));
  await db.run('UPDATE carometros SET completo = 1 WHERE id = ? AND escola_id = ?', [c.id, eid]);
  await db.auditar(eid, req.usuario, 'carometro_enviado', { id: c.id, turma: c.turma_id, arquivo: c.nome_arquivo });
  res.json({ ok: true });
}));

// Para abrir: o navegador baixa parte por parte.
r.get('/carometros/:id/partes/:ordem', rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  const c = await carometroDaEscola(req.params.id, eid);
  if (!c.completo) throw new ErroHttp(404, 'Carômetro não encontrado.');
  const p = await db.one('SELECT dados FROM carometro_partes WHERE escola_id = ? AND carometro_id = ? AND ordem = ?', [eid, c.id, Number(req.params.ordem)]);
  if (!p) throw new ErroHttp(404, 'Parte não encontrada.');
  res.json({ dados: p.dados });
}));

r.delete('/carometros/:id', exigeAdmin, rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  const c = await carometroDaEscola(req.params.id, eid);
  await apagar(eid, [c.id]);
  await db.auditar(eid, req.usuario, 'carometro_removido', { id: c.id, arquivo: c.nome_arquivo });
  res.json({ ok: true });
}));

// Todos os alunos ativos (id, nome, RA, turma), para ligar as fotos em lote aos alunos pelo nome do arquivo.
r.get('/alunos-lista', exigeGestaoOuAdmin, rota(async (req, res) => {
  res.json(await db.all(
    `SELECT a.id, a.nome, a.ra, a.turma_id, t.nome AS turma_nome,
       CASE WHEN f.id IS NULL THEN 0 ELSE 1 END AS tem_foto
     FROM alunos a LEFT JOIN turmas t ON t.id = a.turma_id
     LEFT JOIN fotos_alunos f ON f.aluno_id = a.id AND f.escola_id = a.escola_id
     WHERE a.escola_id = ? AND a.ativo = 1 ORDER BY a.nome`, [req.usuario.escola_id]));
}));

export default r;
