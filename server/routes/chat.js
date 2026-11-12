// routes/chat.js — chat da ocorrência, avisos (pop-up) e inscrição de notificações.
//
// Quem participa do chat: quem registrou a ocorrência + equipe gestora (mesma regra
// de quem pode ver a ocorrência). Tudo filtrado pela escola do usuário.
import express from 'express';
import * as db from '../db.js';
import { ehGestao } from '../auth.js';
import { ErroHttp, obrigatorio, txt, rota } from '../util.js';
import { carregar, numero } from './ocorrencias.js';
import { notificar, idsGestao, pushAtivo, chavePublica } from '../push.js';

const r = express.Router();

async function marcarLida(eid, occId, uid, ultimaId) {
  if (!ultimaId) return;
  await db.run(
    `INSERT INTO chat_leituras (escola_id, ocorrencia_id, usuario_id, ultima_lida) VALUES (?,?,?,?)
     ON CONFLICT (ocorrencia_id, usuario_id) DO UPDATE SET ultima_lida = excluded.ultima_lida`,
    [eid, occId, uid, ultimaId]);
}

// Mensagens do chat (depois=<id> traz só as novas). Abrir o chat marca como lido.
r.get('/ocorrencias/:id/chat', rota(async (req, res) => {
  const o = await carregar(req, req.params.id);
  const u = req.usuario;
  const depois = Number(req.query.depois) || 0;
  const msgs = await db.all(
    `SELECT id, usuario_id, usuario_nome, usuario_perfil, texto, criado_em FROM chat_mensagens
     WHERE escola_id = ? AND ocorrencia_id = ? AND id > ? ORDER BY id LIMIT 500`,
    [u.escola_id, o.id, depois]);
  if (msgs.length) await marcarLida(u.escola_id, o.id, u.id, msgs[msgs.length - 1].id);
  res.json(msgs.map((m) => ({ ...m, minha: m.usuario_id === u.id })));
}));

r.post('/ocorrencias/:id/chat', rota(async (req, res) => {
  const o = await carregar(req, req.params.id);
  const u = req.usuario;
  if (o.status === 'cancelada') throw new ErroHttp(400, 'Ocorrência cancelada: o chat está fechado.');
  const texto = obrigatorio(req.body?.texto, 'mensagem', 2000);
  const id = await db.insert(
    'INSERT INTO chat_mensagens (escola_id, ocorrencia_id, usuario_id, usuario_nome, usuario_perfil, texto, criado_em) VALUES (?,?,?,?,?,?,?)',
    [u.escola_id, o.id, u.id, u.nome, u.perfil, texto, db.agora()]);
  await marcarLida(u.escola_id, o.id, u.id, id);
  // Avisa quem registrou e a equipe gestora (menos quem escreveu).
  const destino = (await idsGestao(u.escola_id, u.id)).concat(o.registrado_por_id !== u.id ? [o.registrado_por_id] : []);
  await notificar(u.escola_id, destino, {
    titulo: `Mensagem na ocorrência ${numero(o)}`,
    // Sem o texto: a mensagem pode citar estudantes e a notificação aparece na tela bloqueada do celular.
    corpo: `${u.nome} enviou uma mensagem. Abra o SisRoe para ler.`,
    url: `/#/ocorrencia/${o.id}`,
    tag: `chat-${o.id}`,
  });
  res.status(201).json({ id });
}));

/**
 * Avisos para o pop-up da página (a página consulta a cada ~45 s, só com a aba visível).
 *  • novas ocorrências registradas por outras pessoas (só equipe gestora);
 *  • mensagens novas de outras pessoas nos chats que o usuário pode ver;
 *  • total de mensagens não lidas por ocorrência.
 */
r.get('/notificacoes', rota(async (req, res) => {
  const u = req.usuario;
  const eid = u.escola_id;
  const gestao = ehGestao(u);
  const agora = db.agora();
  const desde = typeof req.query.desde === 'string' && !Number.isNaN(Date.parse(req.query.desde))
    ? req.query.desde : agora;
  // Sem ultimaMsg é a primeira consulta da página: só informa o ponto de partida.
  // (Com ultimaMsg=0 — escola sem nenhuma mensagem ainda — as mensagens novas precisam aparecer.)
  const temReferencia = req.query.ultimaMsg !== undefined && req.query.ultimaMsg !== '';
  const ultimaMsg = Number(req.query.ultimaMsg) || 0;
  const restricao = gestao ? '' : 'AND o.registrado_por_id = ?';
  const pRestr = gestao ? [] : [u.id];

  const novas = gestao ? await db.all(
    `SELECT id, ano, seq, tipo_codigo, tipo_descricao, categoria, turma_nome, registrado_por_nome, criado_em
     FROM ocorrencias WHERE escola_id = ? AND registrado_por_id <> ? AND criado_em > ? AND status <> 'cancelada'
     ORDER BY id DESC LIMIT 10`, [eid, u.id, desde]) : [];

  const mensagens = temReferencia ? await db.all(
    `SELECT m.id, m.ocorrencia_id, m.usuario_nome, m.texto, o.ano, o.seq FROM chat_mensagens m
     JOIN ocorrencias o ON o.id = m.ocorrencia_id
     WHERE m.escola_id = ? AND m.usuario_id <> ? AND m.id > ? ${restricao}
     ORDER BY m.id DESC LIMIT 10`, [eid, u.id, ultimaMsg, ...pRestr]) : [];

  const naoLidas = await db.all(
    `SELECT m.ocorrencia_id, COUNT(*) AS qtd FROM chat_mensagens m
     JOIN ocorrencias o ON o.id = m.ocorrencia_id
     LEFT JOIN chat_leituras l ON l.ocorrencia_id = m.ocorrencia_id AND l.usuario_id = ?
     WHERE m.escola_id = ? AND m.usuario_id <> ? AND m.id > COALESCE(l.ultima_lida, 0) ${restricao}
     GROUP BY m.ocorrencia_id`, [u.id, eid, u.id, ...pRestr]);
  const maior = await db.one('SELECT COALESCE(MAX(id), 0) AS id FROM chat_mensagens WHERE escola_id = ?', [eid]);

  res.json({
    agora,
    ultimaMsg: Number(maior.id),
    novas: novas.map((o) => ({ ...o, numero: numero(o) })),
    mensagens: mensagens.map((m) => ({ ...m, numero: numero(m) })),
    naoLidas: Object.fromEntries(naoLidas.map((x) => [x.ocorrencia_id, Number(x.qtd)])),
    totalNaoLidas: naoLidas.reduce((s, x) => s + Number(x.qtd), 0),
  });
}));

// ─── Notificações do sistema (Web Push) ──────────────────────────────────────
r.get('/push/chave', (req, res) => res.json({ ativo: pushAtivo, chave: chavePublica() }));

r.post('/push/inscrever', rota(async (req, res) => {
  if (!pushAtivo) throw new ErroHttp(400, 'Notificações não configuradas neste servidor.');
  const s = req.body?.inscricao || {};
  const endpoint = txt(s.endpoint, 1000);
  if (!/^https:\/\//.test(endpoint) || !s.keys?.p256dh || !s.keys?.auth) throw new ErroHttp(400, 'Inscrição inválida.');
  const u = req.usuario;
  // Um aparelho por endpoint: se trocou de usuário/escola, a inscrição passa para o atual.
  await db.run('DELETE FROM push_inscricoes WHERE endpoint = ?', [endpoint]);
  await db.insert(
    'INSERT INTO push_inscricoes (escola_id, usuario_id, endpoint, p256dh, auth, criado_em) VALUES (?,?,?,?,?,?)',
    [u.escola_id, u.id, endpoint, txt(s.keys.p256dh, 200), txt(s.keys.auth, 100), db.agora()]);
  res.status(201).json({ ok: true });
}));

r.post('/push/cancelar', rota(async (req, res) => {
  const endpoint = txt(req.body?.endpoint, 1000);
  await db.run('DELETE FROM push_inscricoes WHERE endpoint = ? AND usuario_id = ?', [endpoint, req.usuario.id]);
  res.json({ ok: true });
}));

export default r;
