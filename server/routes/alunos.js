// routes/alunos.js — importação das listas da SED, contato da família e carômetro.
import express from 'express';
import * as db from '../db.js';
import { exigeAdmin, exigeGestao, exigeGestaoOuAdmin } from '../auth.js';
import { ErroHttp, txt, dataValida, rota } from '../util.js';

const r = express.Router();

/** Só dígitos; aceita DDD + número (10 ou 11 dígitos), com ou sem 55 na frente. */
export function normalizarTelefone(v) {
  let d = String(v || '').replace(/\D/g, '');
  if (d.length >= 12 && d.startsWith('55')) d = d.slice(2);
  if (d.length === 0) return '';
  if (d.length < 10 || d.length > 11) throw new ErroHttp(400, `Telefone inválido: "${v}". Use DDD + número, ex.: 12 98888-7777.`);
  return d;
}

/** "dd/mm/aaaa" ou "aaaa-mm-dd" → "aaaa-mm-dd" (ou vazio). */
function dataISO(v) {
  const s = txt(v, 20);
  let m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m && dataValida(`${m[1]}-${m[2]}-${m[3]}`) ? `${m[1]}-${m[2]}-${m[3]}` : '';
}

/**
 * Importa alunos já lidos do CSV da SED (a leitura do arquivo é feita no navegador).
 * linhas: [{ turma, nome, ra, ra_digito, data_nascimento, responsavel, telefone, telefone2 }]
 * desativarAusentes: alunos das turmas importadas que não vieram na lista são desativados
 * (transferidos/remanejados). O histórico de ocorrências deles continua guardado.
 */
r.post('/alunos/importar-sed', exigeAdmin, rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  const linhas = Array.isArray(req.body?.linhas) ? req.body.linhas : [];
  if (!linhas.length) throw new ErroHttp(400, 'Nenhum aluno para importar.');
  if (linhas.length > 3000) throw new ErroHttp(400, 'Envie no máximo 3.000 alunos por vez.');
  const desativar = !!req.body?.desativarAusentes;

  const resumo = { turmasCriadas: 0, criados: 0, atualizados: 0, desativados: 0, ignorados: 0 };
  await db.transacao(async (tx) => {
    const turmas = new Map((await tx.all('SELECT id, nome FROM turmas WHERE escola_id = ?', [eid])).map((t) => [t.nome.toLowerCase(), t.id]));
    const vistosPorTurma = new Map();
    for (const l of linhas) {
      const nome = txt(l.nome, 120).toUpperCase();
      const turmaNome = txt(l.turma, 60);
      if (!nome || !turmaNome) { resumo.ignorados++; continue; }
      let turmaId = turmas.get(turmaNome.toLowerCase());
      if (!turmaId) {
        turmaId = await tx.insert('INSERT INTO turmas (escola_id, nome, periodo, ativa) VALUES (?,?,?,1)', [eid, turmaNome, '']);
        turmas.set(turmaNome.toLowerCase(), turmaId);
        resumo.turmasCriadas++;
      }
      const ra = txt(l.ra, 20).replace(/\D/g, '').replace(/^0+(?=\d{6,})/, '') || null;
      let tel = '', tel2 = '';
      try { tel = normalizarTelefone(l.telefone); } catch { tel = ''; }
      try { tel2 = normalizarTelefone(l.telefone2); } catch { tel2 = ''; }
      const campos = [nome, turmaId, txt(l.ra_digito, 2) || null, dataISO(l.data_nascimento) || null,
        txt(l.responsavel, 120) || null, tel || null, tel2 || null];
      // RA pode vir com ou sem zeros à esquerda (000113444149 = 113444149).
      const existe = ra ? await tx.one("SELECT id FROM alunos WHERE escola_id = ? AND LTRIM(ra, '0') = ?", [eid, ra])
        : await tx.one('SELECT id FROM alunos WHERE escola_id = ? AND turma_id = ? AND nome = ?', [eid, turmaId, nome]);
      let id;
      if (existe) {
        // Contato só é sobrescrito se a planilha trouxer um valor (não apaga o que a escola já cadastrou).
        await tx.run(
          `UPDATE alunos SET nome = ?, turma_id = ?, ra_digito = COALESCE(?, ra_digito), data_nascimento = COALESCE(?, data_nascimento),
             responsavel = COALESCE(?, responsavel), telefone = COALESCE(?, telefone), telefone2 = COALESCE(?, telefone2), ativo = 1
           WHERE id = ? AND escola_id = ?`, [...campos, existe.id, eid]);
        id = existe.id; resumo.atualizados++;
      } else {
        id = await tx.insert(
          `INSERT INTO alunos (escola_id, nome, turma_id, ra_digito, data_nascimento, responsavel, telefone, telefone2, ra, ativo)
           VALUES (?,?,?,?,?,?,?,?,?,1)`, [eid, ...campos, ra]);
        resumo.criados++;
      }
      if (!vistosPorTurma.has(turmaId)) vistosPorTurma.set(turmaId, new Set());
      vistosPorTurma.get(turmaId).add(id);
    }
    if (desativar) {
      for (const [turmaId, vistos] of vistosPorTurma) {
        const atuais = await tx.all('SELECT id FROM alunos WHERE escola_id = ? AND turma_id = ? AND ativo = 1', [eid, turmaId]);
        for (const a of atuais) {
          if (!vistos.has(a.id)) {
            await tx.run('UPDATE alunos SET ativo = 0 WHERE id = ? AND escola_id = ?', [a.id, eid]);
            resumo.desativados++;
          }
        }
      }
    }
  });
  await db.auditar(eid, req.usuario, 'alunos_importados_sed', resumo);
  res.json(resumo);
}));

// Dados do aluno com contato da família (equipe gestora).
r.get('/alunos/:id', exigeGestao, rota(async (req, res) => {
  const a = await db.one(
    `SELECT a.id, a.ra, a.ra_digito, a.nome, a.data_nascimento, a.responsavel, a.telefone, a.telefone2, a.turma_id, t.nome AS turma_nome
     FROM alunos a LEFT JOIN turmas t ON t.id = a.turma_id WHERE a.id = ? AND a.escola_id = ?`,
    [Number(req.params.id), req.usuario.escola_id]);
  if (!a) throw new ErroHttp(404, 'Aluno não encontrado.');
  res.json(a);
}));

r.put('/alunos/:id/contato', exigeGestao, rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  const a = await db.one('SELECT id FROM alunos WHERE id = ? AND escola_id = ?', [Number(req.params.id), eid]);
  if (!a) throw new ErroHttp(404, 'Aluno não encontrado.');
  const b = req.body || {};
  await db.run('UPDATE alunos SET responsavel = ?, telefone = ?, telefone2 = ? WHERE id = ? AND escola_id = ?',
    [txt(b.responsavel, 120) || null, normalizarTelefone(b.telefone) || null, normalizarTelefone(b.telefone2) || null, a.id, eid]);
  await db.auditar(eid, req.usuario, 'contato_atualizado', { aluno: a.id });
  res.json({ ok: true });
}));

// ─── Carômetro ───────────────────────────────────────────────────────────────
// Todos os servidores da escola veem (para reconhecer os estudantes); só a equipe gestora envia fotos.
r.get('/turmas/:id/carometro', rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  const t = await db.one('SELECT id, nome, periodo FROM turmas WHERE id = ? AND escola_id = ?', [Number(req.params.id), eid]);
  if (!t) throw new ErroHttp(404, 'Turma não encontrada.');
  const alunos = await db.all(
    `SELECT a.id, a.nome, a.ra, f.mime, f.dados FROM alunos a
     LEFT JOIN fotos_alunos f ON f.aluno_id = a.id AND f.escola_id = a.escola_id
     WHERE a.escola_id = ? AND a.turma_id = ? AND a.ativo = 1 ORDER BY a.nome`, [eid, t.id]);
  res.json({
    turma: t,
    alunos: alunos.map((a) => ({ id: a.id, nome: a.nome, ra: a.ra, foto: a.dados ? `data:${a.mime};base64,${a.dados}` : null })),
  });
}));

const MAX_FOTO = 400 * 1024; // após a redução no navegador, uma foto fica bem abaixo disso

r.put('/alunos/:id/foto', exigeGestaoOuAdmin, rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  const a = await db.one('SELECT id FROM alunos WHERE id = ? AND escola_id = ?', [Number(req.params.id), eid]);
  if (!a) throw new ErroHttp(404, 'Aluno não encontrado.');
  const m = String(req.body?.imagem || '').match(/^data:(image\/(?:jpeg|webp|png));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) throw new ErroHttp(400, 'Envie uma imagem JPG, PNG ou WebP.');
  if (m[2].length * 0.75 > MAX_FOTO) throw new ErroHttp(400, 'Imagem grande demais. Use uma foto menor.');
  await db.run('DELETE FROM fotos_alunos WHERE escola_id = ? AND aluno_id = ?', [eid, a.id]);
  await db.insert('INSERT INTO fotos_alunos (escola_id, aluno_id, mime, dados, enviado_por_nome, atualizado_em) VALUES (?,?,?,?,?,?)',
    [eid, a.id, m[1], m[2], req.usuario.nome, db.agora()]);
  await db.auditar(eid, req.usuario, 'foto_enviada', { aluno: a.id });
  res.json({ ok: true });
}));

r.delete('/alunos/:id/foto', exigeGestaoOuAdmin, rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  await db.run('DELETE FROM fotos_alunos WHERE escola_id = ? AND aluno_id = ?', [eid, Number(req.params.id)]);
  await db.auditar(eid, req.usuario, 'foto_removida', { aluno: Number(req.params.id) });
  res.json({ ok: true });
}));

export default r;
