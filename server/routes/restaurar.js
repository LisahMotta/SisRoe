// routes/restaurar.js — restaura o backup JSON da própria escola, SEM sobrescrever nada.
//
// Regra de ouro: só ACRESCENTA o que falta. O que já existe no sistema não é alterado nem apagado.
// O navegador lê o arquivo e envia em lotes (limite de ~4,5 MB por envio na Vercel), na ordem:
// turmas → tipos → alunos → ocorrências (com estudantes, notas, conversas e afastamentos) → busca ativa
// (com as ações). Cada resposta devolve o "mapa" de ids antigos → ids no sistema, que o navegador
// usa nos lotes seguintes. Com simular=true nada é gravado: serve para a prévia.
// Ocorrência e busca ativa vão junto com os seus "filhos", na mesma transação: se a conexão cair
// no meio, é só restaurar de novo (o que já entrou é reconhecido e não duplica).
//
// Como cada registro é reconhecido como "já existe":
//   turmas: nome · tipos: código · alunos: RA (ou nome + turma, sem RA)
//   ocorrências: ano + data/hora de criação + relato · busca ativa: aluno + data de abertura
// Equipe e senhas não são restauradas (por segurança); fotos e arquivos do carômetro não estão no backup.
import express from 'express';
import * as db from '../db.js';
import { exigeDirecao } from '../auth.js';
import { ErroHttp, rota } from '../util.js';

const r = express.Router();
r.use('/restaurar', exigeDirecao);

const MAX_LINHAS = 500;
const NOVO = -1; // na simulação: "vai ser criado" (ainda não tem id)

const ehValor = (v) => v === null || ['string', 'number', 'boolean'].includes(typeof v);
const num = (v) => (Number.isInteger(Number(v)) && v !== null && v !== '' ? Number(v) : null);

/** Monta o INSERT só com colunas que existem na tabela e valores simples. */
async function inserir(tx, tabela, linha, fixos) {
  const cols = await db.colunas(tabela);
  const dados = {};
  for (const [k, v] of Object.entries(linha)) {
    if (k === 'id' || k === 'escola_id' || !cols.has(k) || !ehValor(v)) continue;
    dados[k] = typeof v === 'boolean' ? (v ? 1 : 0) : v;
  }
  Object.assign(dados, fixos);
  const nomes = Object.keys(dados);
  return tx.insert(`INSERT INTO ${tabela} (${nomes.join(', ')}) VALUES (${nomes.map(() => '?').join(', ')})`, nomes.map((k) => dados[k]));
}

/** Confere que o id pertence à escola (senão vira null). */
async function daEscola(tx, tabela, id, eid) {
  const n = num(id);
  if (!n || n < 1) return null;
  return (await tx.one(`SELECT id FROM ${tabela} WHERE id = ? AND escola_id = ?`, [n, eid])) ? n : null;
}

const ETAPAS = {
  async turmas(tx, eid, l, simular) {
    const nome = String(l.nome || '').trim();
    if (!nome) return { ignorado: true };
    const existe = await tx.one('SELECT id FROM turmas WHERE escola_id = ? AND nome = ?', [eid, nome]);
    if (existe) return { id: existe.id };
    return { novo: true, id: simular ? NOVO : await inserir(tx, 'turmas', { ...l, nome }, { escola_id: eid }) };
  },

  async tipos(tx, eid, l, simular) {
    const codigo = String(l.codigo || '').trim();
    if (!codigo || !l.descricao || !l.categoria || !l.gravidade) return { ignorado: true };
    const existe = await tx.one('SELECT id FROM tipos WHERE escola_id = ? AND codigo = ?', [eid, codigo]);
    if (existe) return { id: existe.id };
    return { novo: true, id: simular ? NOVO : await inserir(tx, 'tipos', { ...l, codigo }, { escola_id: eid }) };
  },

  // turma_id já vem trocado pelo navegador (id no sistema, NOVO na simulação, ou null).
  async alunos(tx, eid, l, simular) {
    const nome = String(l.nome || '').trim().toUpperCase();
    if (!nome) return { ignorado: true };
    const turmaNova = num(l.turma_id) === NOVO;
    const turmaId = turmaNova ? null : await daEscola(tx, 'turmas', l.turma_id, eid);
    const ra = String(l.ra || '').replace(/\D/g, '').replace(/^0+/, '');
    let existe = ra ? await tx.one("SELECT id FROM alunos WHERE escola_id = ? AND LTRIM(ra, '0') = ?", [eid, ra]) : null;
    if (!existe && !ra && !turmaNova) {
      existe = await tx.one(`SELECT id FROM alunos WHERE escola_id = ? AND nome = ? AND ${turmaId ? 'turma_id = ?' : 'turma_id IS NULL'}`,
        turmaId ? [eid, nome, turmaId] : [eid, nome]);
    }
    if (existe) return { id: existe.id };
    return { novo: true, id: simular ? NOVO : await inserir(tx, 'alunos', { ...l, nome }, { escola_id: eid, turma_id: turmaId }) };
  },

  // tipo_id, turma_id e aluno_id (dos estudantes/afastamentos) já vêm trocados pelo navegador.
  async ocorrencias(tx, eid, l, simular, usuario) {
    const ano = num(l.ano), seq = num(l.seq);
    if (!ano || !seq || !l.relato || !l.criado_em) return { ignorado: true };
    const filhos = { alunos: arr(l.alunos), notas: arr(l.notas), chat: arr(l.chat), afastamentos: arr(l.afastamentos) };
    const contagem = Object.fromEntries(Object.entries(filhos).map(([k, v]) => [k, v.length]));
    const existe = await tx.one('SELECT id FROM ocorrencias WHERE escola_id = ? AND ano = ? AND criado_em = ? AND relato = ?',
      [eid, ano, l.criado_em, l.relato]);
    if (existe) return { id: existe.id };
    // Número já usado por outra ocorrência (registrada depois da perda dos dados): recebe o próximo número livre.
    const ocupado = await tx.one('SELECT id FROM ocorrencias WHERE escola_id = ? AND ano = ? AND seq = ?', [eid, ano, seq]);
    let novoSeq = seq;
    if (ocupado) novoSeq = Number((await tx.one('SELECT COALESCE(MAX(seq), 0) + 1 AS prox FROM ocorrencias WHERE escola_id = ? AND ano = ?', [eid, ano])).prox);
    if (simular) return { novo: true, id: NOVO, renumerada: !!ocupado, filhos: contagem };

    const usuarioValido = async (id) => (await daEscola(tx, 'usuarios', id, eid)) || usuario.id;
    const id = await inserir(tx, 'ocorrencias', l, {
      escola_id: eid, seq: novoSeq,
      tipo_id: await daEscola(tx, 'tipos', l.tipo_id, eid),
      turma_id: await daEscola(tx, 'turmas', l.turma_id, eid),
      registrado_por_id: await usuarioValido(l.registrado_por_id),
    });
    for (const a of filhos.alunos) {
      if (!a?.nome) continue;
      await inserir(tx, 'ocorrencia_alunos', a, { escola_id: eid, ocorrencia_id: id, aluno_id: await daEscola(tx, 'alunos', a.aluno_id, eid) });
    }
    for (const n of filhos.notas) {
      if (!n?.texto) continue;
      await inserir(tx, 'ocorrencia_notas', n, { escola_id: eid, ocorrencia_id: id, usuario_id: await usuarioValido(n.usuario_id) });
    }
    for (const m of filhos.chat) {
      if (!m?.texto) continue;
      await inserir(tx, 'chat_mensagens', m, { escola_id: eid, ocorrencia_id: id, usuario_id: await usuarioValido(m.usuario_id) });
    }
    for (const a of filhos.afastamentos) {
      if (!a?.aluno_nome) continue;
      await inserir(tx, 'afastamentos', a, { escola_id: eid, ocorrencia_id: id, aluno_id: await daEscola(tx, 'alunos', a.aluno_id, eid) });
    }
    return { novo: true, id, renumerada: !!ocupado, filhos: contagem };
  },

  // aluno_id já vem trocado pelo navegador; as ações vêm em "acoes".
  async busca_ativa(tx, eid, l, simular) {
    const alunoNovo = num(l.aluno_id) === NOVO;
    const alunoId = alunoNovo ? null : await daEscola(tx, 'alunos', l.aluno_id, eid);
    if ((!alunoId && !(alunoNovo && simular)) || !l.criado_em || !l.aluno_nome) return { ignorado: true };
    const acoes = arr(l.acoes);
    if (alunoId) {
      const existe = await tx.one('SELECT id FROM busca_ativa WHERE escola_id = ? AND aluno_id = ? AND criado_em = ?', [eid, alunoId, l.criado_em]);
      if (existe) return { id: existe.id };
    }
    if (simular) return { novo: true, id: NOVO, filhos: { acoes: acoes.length } };
    const id = await inserir(tx, 'busca_ativa', l, { escola_id: eid, aluno_id: alunoId });
    for (const a of acoes) {
      if (!a?.tipo) continue;
      await inserir(tx, 'busca_ativa_acoes', a, { escola_id: eid, busca_id: id });
    }
    return { novo: true, id, filhos: { acoes: acoes.length } };
  },
};
const arr = (v) => (Array.isArray(v) ? v.slice(0, 5000) : []);

r.post('/restaurar/:etapa', rota(async (req, res) => {
  const etapa = req.params.etapa;
  const fazer = Object.hasOwn(ETAPAS, etapa) ? ETAPAS[etapa] : null;
  if (!fazer) throw new ErroHttp(404, 'Etapa desconhecida.');
  const eid = req.usuario.escola_id;
  const b = req.body || {};
  // O backup precisa ser desta escola.
  const escola = await db.one('SELECT codigo FROM escolas WHERE id = ?', [eid]);
  if (!b.codigo || b.codigo !== escola.codigo) {
    throw new ErroHttp(400, `Este backup é de outra escola (código "${b.codigo || '?'}"). Só é possível restaurar o backup da própria escola.`);
  }
  const linhas = Array.isArray(b.linhas) ? b.linhas : [];
  if (linhas.length > MAX_LINHAS) throw new ErroHttp(400, `Envie no máximo ${MAX_LINHAS} registros por vez.`);
  const simular = !!b.simular;

  const resumo = { mapa: {}, novos: 0, existentes: 0, ignorados: 0, renumeradas: 0, filhos: {} };
  const processar = async (tx) => {
    for (const l of linhas) {
      if (!l || typeof l !== 'object') { resumo.ignorados++; continue; }
      const x = await fazer(tx, eid, l, simular, req.usuario);
      if (x.ignorado) { resumo.ignorados++; continue; }
      if (l.id !== undefined) resumo.mapa[l.id] = x.id;
      if (x.novo) {
        resumo.novos++;
        if (x.renumerada) resumo.renumeradas++;
        for (const [k, n] of Object.entries(x.filhos || {})) resumo.filhos[k] = (resumo.filhos[k] || 0) + n;
      } else resumo.existentes++;
    }
  };
  if (simular) await processar(db); else await db.transacao(processar);
  res.json(resumo);
}));

// Fim da restauração: registro na auditoria.
r.post('/restaurar-concluido', exigeDirecao, rota(async (req, res) => {
  const resumo = req.body?.resumo && typeof req.body.resumo === 'object' ? req.body.resumo : {};
  await db.auditar(req.usuario.escola_id, req.usuario, 'backup_restaurado', resumo);
  res.json({ ok: true });
}));

export default r;
