// routes/ocorrencias.js — registro, consulta e acompanhamento de ocorrências.
//
// Permissões:
//  • Todos os perfis registram ocorrências.
//  • Professor, agente, gerente de organização escolar e secretário(a) veem apenas as que registraram.
//  • Equipe gestora (POC, coordenação, vice, direção) vê todas da escola,
//    faz o acompanhamento (protocolo, família, status) e vê o histórico do aluno.
//  • O relato original não pode ser editado depois de registrado (valor de
//    documento). Correções e novidades entram como "notas de acompanhamento".
//  • A gravidade só pode subir. Ocorrência não é apagada: a direção pode cancelar
//    informando o motivo (fica na auditoria).
import express from 'express';
import * as db from '../db.js';
import { exigeGestao, exigeDirecao, ehGestao } from '../auth.js';
import { ErroHttp, txt, obrigatorio, dataValida, horaValida, rota } from '../util.js';
import { ORDEM_GRAVIDADE, PAPEIS_ALUNO, PROCEDIMENTOS, STATUS, CATEGORIAS, GRAVIDADES, NIVEIS, MACROS } from '../../public/js/catalogo.js';
import { passosDoTipo } from '../tipos.js';
import { notificar, idsGestao } from '../push.js';
import { gerarPdfOcorrencia } from '../pdf.js';

const r = express.Router();

export const numero = (o) => `${o.ano}/${String(o.seq).padStart(4, '0')}`;

/** Busca a ocorrência garantindo escola e permissão de leitura. */
export async function carregar(req, id) {
  const o = await db.one('SELECT * FROM ocorrencias WHERE id = ? AND escola_id = ?', [Number(id), req.usuario.escola_id]);
  if (!o) throw new ErroHttp(404, 'Ocorrência não encontrada.');
  if (!ehGestao(req.usuario) && o.registrado_por_id !== req.usuario.id) {
    throw new ErroHttp(404, 'Ocorrência não encontrada.');
  }
  return o;
}

/** Passos da ocorrência: a cópia gravada no registro (ou os padrão da categoria, em registros antigos). */
function passosDaOcorrencia(o) {
  let p = [];
  try { p = JSON.parse(o.passos || '[]'); } catch { /* ignora */ }
  return p.length ? p : PROCEDIMENTOS[o.categoria] || [];
}

export function formatar(o) {
  return {
    ...o,
    numero: numero(o),
    passos: o.passos !== undefined ? passosDaOcorrencia(o) : undefined,
    bo_orientado: !!o.bo_orientado,
    protocolo: (() => { try { return JSON.parse(o.protocolo || '[]'); } catch { return []; } })(),
    familia_comunicada: !!o.familia_comunicada,
    conselho_tutelar: !!o.conselho_tutelar,
    conviva_registrado: !!o.conviva_registrado,
  };
}

/** Monta o WHERE da listagem a partir dos filtros da tela. */
function filtros(req) {
  const q = req.query;
  const w = ['o.escola_id = ?'];
  const p = [req.usuario.escola_id];
  if (!ehGestao(req.usuario)) { w.push('o.registrado_por_id = ?'); p.push(req.usuario.id); }
  if (STATUS[q.status]) { w.push('o.status = ?'); p.push(q.status); }
  else if (q.status !== 'todas') { w.push("o.status <> 'cancelada'"); }
  if (CATEGORIAS[q.categoria]) { w.push('o.categoria = ?'); p.push(q.categoria); }
  if (GRAVIDADES[q.gravidade]) { w.push('o.gravidade = ?'); p.push(q.gravidade); }
  if (q.turma_id) { w.push('o.turma_id = ?'); p.push(Number(q.turma_id)); }
  if (dataValida(q.de || '')) { w.push('o.data >= ?'); p.push(q.de); }
  if (dataValida(q.ate || '')) { w.push('o.data <= ?'); p.push(q.ate); }
  const busca = txt(q.busca, 60).toLowerCase();
  if (busca) {
    w.push(`(LOWER(o.tipo_descricao) LIKE ? OR LOWER(o.relato) LIKE ? OR EXISTS (
      SELECT 1 FROM ocorrencia_alunos x WHERE x.ocorrencia_id = o.id AND LOWER(x.nome) LIKE ?))`);
    p.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
  }
  return { where: w.join(' AND '), params: p };
}

async function anexarAlunos(eid, lista) {
  if (!lista.length) return lista;
  const ids = lista.map((o) => o.id);
  const al = await db.all(
    `SELECT ocorrencia_id, nome, ra, papel, turma_nome FROM ocorrencia_alunos
     WHERE escola_id = ? AND ocorrencia_id IN (${ids.map(() => '?').join(',')}) ORDER BY id`,
    [eid, ...ids]
  );
  const mapa = {};
  for (const a of al) (mapa[a.ocorrencia_id] ||= []).push(a);
  return lista.map((o) => ({ ...formatar(o), alunos: mapa[o.id] || [] }));
}

// ─── Listagem ────────────────────────────────────────────────────────────────
r.get('/ocorrencias', rota(async (req, res) => {
  const { where, params } = filtros(req);
  const limite = Math.min(Number(req.query.limite) || 200, 500);
  const lista = await db.all(
    `SELECT o.id, o.ano, o.seq, o.tipo_codigo, o.tipo_descricao, o.categoria, o.macro, o.gravidade, o.data, o.hora,
       o.local, o.turma_nome, o.status, o.registrado_por_nome, o.criado_em
     FROM ocorrencias o WHERE ${where} ORDER BY o.data DESC, o.hora DESC, o.id DESC LIMIT ${limite}`,
    params
  );
  res.json(await anexarAlunos(req.usuario.escola_id, lista));
}));

// Exportação em CSV (abre no Excel / Planilhas Google).
r.get('/ocorrencias.csv', exigeGestao, rota(async (req, res) => {
  const { where, params } = filtros(req);
  const lista = await anexarAlunos(req.usuario.escola_id, await db.all(
    `SELECT o.* FROM ocorrencias o WHERE ${where} ORDER BY o.data, o.hora, o.id LIMIT 5000`, params));
  // Texto que começa com = + - @ vira fórmula no Excel (ex.: =HYPERLINK no relato): o apóstrofo neutraliza.
  const cel = (v) => {
    let s = String(v ?? '').replace(/\r?\n/g, ' ');
    if (/^[=+\-@\t]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const cab = ['Número', 'Data', 'Hora', 'Categoria', 'Macrocategoria (Protocolo 179)', 'Código', 'Tipo', 'Gravidade', 'Turma', 'Local', 'Alunos',
    'Status', 'Família comunicada', 'Conselho Tutelar', 'Registro CONVIVA', 'B.O.', 'Registrado por', 'Relato'];
  const linhas = lista.map((o) => [
    o.numero, o.data.split('-').reverse().join('/'), o.hora, CATEGORIAS[o.categoria]?.nome, MACROS[o.macro] || '', o.tipo_codigo,
    o.tipo_descricao, GRAVIDADES[o.gravidade], o.turma_nome, o.local,
    o.alunos.map((a) => `${a.nome} (${PAPEIS_ALUNO[a.papel] || a.papel})`).join('; '),
    STATUS[o.status], o.familia_comunicada ? 'Sim' : 'Não', o.conselho_tutelar ? 'Sim' : 'Não',
    o.conviva_registrado ? 'Sim' : 'Não', o.bo_numero, o.registrado_por_nome, o.relato,
  ].map(cel).join(';'));
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="ocorrencias.csv"');
  // O "﻿" no início faz o Excel reconhecer os acentos.
  res.send('﻿' + [cab.map(cel).join(';'), ...linhas].join('\r\n'));
}));

// ─── Detalhe ─────────────────────────────────────────────────────────────────
/** Ocorrência completa (alunos, notas, afastamentos), usada na tela e no PDF. */
export async function detalheCompleto(req, id) {
  const o = await carregar(req, id);
  const eid = req.usuario.escola_id;
  const alunos = await db.all(
    'SELECT aluno_id, ra, nome, turma_nome, papel FROM ocorrencia_alunos WHERE escola_id = ? AND ocorrencia_id = ? ORDER BY id',
    [eid, o.id]);
  const notas = await db.all(
    'SELECT usuario_nome, texto, criado_em FROM ocorrencia_notas WHERE escola_id = ? AND ocorrencia_id = ? ORDER BY id',
    [eid, o.id]);
  const afastamentos = await db.all(
    'SELECT * FROM afastamentos WHERE escola_id = ? AND ocorrencia_id = ? ORDER BY id', [eid, o.id]);
  // Art. 5º §1º: o histórico pesa na classificação — conta ocorrências anteriores dos alunos.
  const ids = alunos.map((a) => a.aluno_id).filter(Boolean);
  const anteriores = ids.length ? await db.all(
    `SELECT x.aluno_id, COUNT(*) AS qtd FROM ocorrencia_alunos x JOIN ocorrencias oc ON oc.id = x.ocorrencia_id
     WHERE x.escola_id = ? AND x.aluno_id IN (${ids.map(() => '?').join(',')}) AND oc.id <> ? AND oc.status <> 'cancelada'
     GROUP BY x.aluno_id`, [eid, ...ids, o.id]) : [];
  const mapa = Object.fromEntries(anteriores.map((r) => [r.aluno_id, Number(r.qtd)]));
  // Atenção especial: só a equipe gestora vê (a tela usa; o PDF não imprime).
  const atencao = ehGestao(req.usuario) && ids.length ? Object.fromEntries((await db.all(
    `SELECT id, atencao_motivo FROM alunos WHERE escola_id = ? AND atencao_em IS NOT NULL AND id IN (${ids.map(() => '?').join(',')})`,
    [eid, ...ids])).map((r) => [r.id, r.atencao_motivo || ''])) : {};
  return {
    ...formatar(o),
    alunos: alunos.map((a) => ({ ...a, anteriores: a.aluno_id ? mapa[a.aluno_id] || 0 : null,
      ...(a.aluno_id in atencao ? { atencao: true, atencao_motivo: atencao[a.aluno_id] } : {}) })),
    notas,
    afastamentos: afastamentos.map((a) => ({ ...a, hipoteses: JSON.parse(a.hipoteses || '[]') })),
  };
}

r.get('/ocorrencias/:id', rota(async (req, res) => {
  res.json(await detalheCompleto(req, req.params.id));
}));

// PDF da ocorrência (mesmas permissões de quem pode ver a ocorrência).
r.get('/ocorrencias/:id/pdf', rota(async (req, res) => {
  const o = await detalheCompleto(req, req.params.id);
  const escola = await db.one('SELECT nome, cie, municipio, diretoria FROM escolas WHERE id = ?', [req.usuario.escola_id]);
  const pdf = await gerarPdfOcorrencia(o, escola, req.usuario.nome);
  await db.auditar(req.usuario.escola_id, req.usuario, 'pdf_emitido', { id: o.id });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="ocorrencia-${o.ano}-${String(o.seq).padStart(4, '0')}.pdf"`);
  res.setHeader('Cache-Control', 'no-store');
  res.send(pdf);
}));

// ─── Registro ────────────────────────────────────────────────────────────────
r.post('/ocorrencias', rota(async (req, res) => {
  const b = req.body || {};
  const u = req.usuario;
  const eid = u.escola_id;

  const tipo = await db.one('SELECT * FROM tipos WHERE id = ? AND escola_id = ? AND ativo = 1', [Number(b.tipo_id), eid]);
  if (!tipo) throw new ErroHttp(400, 'Escolha o tipo de ocorrência.');
  if (!dataValida(b.data || '')) throw new ErroHttp(400, 'Informe uma data válida.');
  if (b.data > new Date(Date.now() + 86400000).toISOString().slice(0, 10)) throw new ErroHttp(400, 'A data não pode estar no futuro.');
  if (!horaValida(b.hora || '')) throw new ErroHttp(400, 'Informe um horário válido.');
  // Art. 9º §3º (Res. 68/2026): ciência tardia não afasta o registro; guarda a data em que a escola soube.
  let dataConhecimento = null;
  if (b.data_conhecimento && b.data_conhecimento !== b.data) {
    if (!dataValida(b.data_conhecimento) || b.data_conhecimento < b.data) {
      throw new ErroHttp(400, 'A data em que a escola tomou conhecimento deve ser igual ou posterior à data do fato.');
    }
    dataConhecimento = b.data_conhecimento;
  }
  const local = obrigatorio(b.local, 'local', 80);
  const relato = obrigatorio(b.relato, 'relato', 8000);
  if (relato.length < 15) throw new ErroHttp(400, 'Descreva melhor o que aconteceu no relato (pelo menos 15 caracteres).');

  let turma = null;
  if (b.turma_id) {
    turma = await db.one('SELECT id, nome FROM turmas WHERE id = ? AND escola_id = ?', [Number(b.turma_id), eid]);
    if (!turma) throw new ErroHttp(400, 'Turma inválida.');
  }

  // Alunos: os que vieram com id precisam ser da escola; também aceitamos
  // nomes digitados (aluno de outra turma, visitante etc.).
  const alunosIn = Array.isArray(b.alunos) ? b.alunos.slice(0, 40) : [];
  const alunos = [];
  for (const a of alunosIn) {
    const papel = PAPEIS_ALUNO[a.papel] ? a.papel : 'envolvido';
    if (a.id) {
      const al = await db.one(
        'SELECT a.id, a.ra, a.nome, t.nome AS turma_nome FROM alunos a LEFT JOIN turmas t ON t.id = a.turma_id WHERE a.id = ? AND a.escola_id = ?',
        [Number(a.id), eid]);
      if (!al) throw new ErroHttp(400, 'Aluno inválido na lista.');
      alunos.push({ ...al, papel });
    } else if (txt(a.nome, 120)) {
      alunos.push({ id: null, ra: null, nome: txt(a.nome, 120).toUpperCase(), turma_nome: txt(a.turma_nome, 60) || null, papel });
    }
  }
  if (!alunos.length && tipo.categoria === 'administrativa') {
    throw new ErroHttp(400, 'Selecione pelo menos um aluno envolvido.');
  }

  // Guarda uma cópia dos passos do tipo: se o catálogo mudar depois, o registro continua fiel.
  const passos = passosDoTipo(tipo);
  const protocolo = Array.isArray(b.protocolo) ? b.protocolo.filter((k) => passos.some((p) => p.k === k)) : [];
  const ano = Number(b.data.slice(0, 4));
  const agora = db.agora();

  const criar = () => db.transacao(async (tx) => {
    const { prox } = await tx.one('SELECT COALESCE(MAX(seq), 0) + 1 AS prox FROM ocorrencias WHERE escola_id = ? AND ano = ?', [eid, ano]);
    const id = await tx.insert(
      `INSERT INTO ocorrencias (escola_id, ano, seq, tipo_id, tipo_codigo, tipo_descricao, categoria, gravidade,
         data, hora, data_conhecimento, local, turma_id, turma_nome, relato, providencias, protocolo, status,
         registrado_por_id, registrado_por_nome, registrado_por_perfil, criado_em, atualizado_em, macro, passos, bo_regra)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'aberta',?,?,?,?,?,?,?,?)`,
      [eid, ano, Number(prox), tipo.id, tipo.codigo, tipo.descricao, tipo.categoria, tipo.gravidade,
       b.data, b.hora, dataConhecimento, local, turma?.id ?? null, turma?.nome ?? null, relato, txt(b.providencias, 4000),
       JSON.stringify(protocolo), u.id, u.nome, u.perfil, agora, agora, tipo.macro || null, JSON.stringify(passos), tipo.bo || null]
    );
    for (const a of alunos) {
      await tx.run(
        'INSERT INTO ocorrencia_alunos (escola_id, ocorrencia_id, aluno_id, ra, nome, turma_nome, papel) VALUES (?,?,?,?,?,?,?)',
        [eid, id, a.id, a.ra, a.nome, a.turma_nome ?? turma?.nome ?? null, a.papel]);
    }
    return { id, seq: Number(prox) };
  });

  let criado;
  try { criado = await criar(); }
  catch (e) {
    // Dois registros ao mesmo tempo podem disputar o mesmo número: tenta de novo.
    if (/unique|duplicate/i.test(e.message)) criado = await criar();
    else throw e;
  }
  await db.auditar(eid, u, 'ocorrencia_registrada', { id: criado.id, tipo: tipo.codigo });
  // Avisa a equipe gestora (notificação do sistema; o pop-up na página vem de /notificacoes).
  await notificar(eid, await idsGestao(eid, u.id), {
    titulo: `Nova ocorrência ${numero({ ano, seq: criado.seq })}`,
    corpo: `${tipo.codigo} · ${tipo.descricao}${turma ? ` · ${turma.nome}` : ''} — registrada por ${u.nome}`,
    url: `/#/ocorrencia/${criado.id}`,
    tag: `occ-${criado.id}`,
  });
  res.status(201).json({ id: criado.id, numero: numero({ ano, seq: criado.seq }), categoria: tipo.categoria });
}));

// ─── Acompanhamento (equipe gestora) ─────────────────────────────────────────
r.put('/ocorrencias/:id/acompanhamento', exigeGestao, rota(async (req, res) => {
  const o = await carregar(req, req.params.id);
  if (o.status === 'cancelada') throw new ErroHttp(400, 'Ocorrência cancelada não pode ser alterada.');
  const b = req.body || {};
  const u = req.usuario;

  let gravidade = o.gravidade;
  if (b.gravidade && b.gravidade !== o.gravidade) {
    if (!GRAVIDADES[b.gravidade]) throw new ErroHttp(400, 'Gravidade inválida.');
    if (ORDEM_GRAVIDADE.indexOf(b.gravidade) < ORDEM_GRAVIDADE.indexOf(o.gravidade)) {
      throw new ErroHttp(400, 'A gravidade não pode ser reduzida.');
    }
    gravidade = b.gravidade;
  }
  let status = o.status;
  if (b.status && b.status !== o.status) {
    if (!['aberta', 'em_acompanhamento', 'encerrada'].includes(b.status)) throw new ErroHttp(400, 'Status inválido.');
    status = b.status;
  }
  // Art. 5º (Res. 68/2026): nível de resposta. Nível III exige análise registrada (§ 3º veda
  // medidas baseadas em receios genéricos ou percepções não documentadas).
  let nivel = o.nivel ?? null;
  if (b.nivel !== undefined) {
    nivel = b.nivel === '' || b.nivel === null ? null : Number(b.nivel);
    if (nivel !== null && !NIVEIS[nivel]) throw new ErroHttp(400, 'Nível de resposta inválido.');
  }
  const analise = b.analise_inicial !== undefined ? txt(b.analise_inicial, 4000) : (o.analise_inicial || '');
  const manifestacao = b.manifestacao_estudante !== undefined ? txt(b.manifestacao_estudante, 4000) : (o.manifestacao_estudante || '');
  if (nivel === 3 && analise.length < 20) {
    throw new ErroHttp(400, 'Para o Nível III, registre a síntese da análise inicial com os elementos objetivos da situação (Art. 5º, § 3º).');
  }
  const encerrando = status === 'encerrada' && o.status !== 'encerrada';
  const passos = passosDaOcorrencia(o);
  const protocolo = Array.isArray(b.protocolo)
    ? b.protocolo.filter((k) => passos.some((p) => p.k === k))
    : JSON.parse(o.protocolo || '[]');
  const conselho = b.conselho_tutelar !== undefined ? !!b.conselho_tutelar : !!o.conselho_tutelar;
  const devolutiva = b.rede_devolutiva !== undefined ? txt(b.rede_devolutiva, 2000) : (o.rede_devolutiva || '');
  // Protocolo 179, seção 1.2: só encerrar depois de concluídas as providências; quando houve
  // encaminhamento à rede protetiva, registrar a comunicação e a devolutiva recebida.
  if (encerrando && conselho && devolutiva.length < 5) {
    throw new ErroHttp(400, 'Para encerrar, registre a devolutiva recebida do Conselho Tutelar / rede protetiva (Protocolo 179, seção 1.2).');
  }
  const familiaData = b.familia_data && dataValida(b.familia_data) ? b.familia_data : null;

  await db.run(
    `UPDATE ocorrencias SET gravidade = ?, status = ?, protocolo = ?, providencias = ?,
       familia_comunicada = ?, familia_data = ?, familia_meio = ?, familia_obs = ?,
       conselho_tutelar = ?, bo_numero = ?, conviva_registrado = ?,
       nivel = ?, analise_inicial = ?, manifestacao_estudante = ?, bo_orientado = ?, rede_devolutiva = ?,
       encerrado_por_nome = ?, encerrado_em = ?, atualizado_em = ?
     WHERE id = ? AND escola_id = ?`,
    [gravidade, status, JSON.stringify(protocolo),
     b.providencias !== undefined ? txt(b.providencias, 4000) : o.providencias,
     b.familia_comunicada ? 1 : 0, familiaData, txt(b.familia_meio, 40), txt(b.familia_obs, 1000),
     conselho ? 1 : 0, txt(b.bo_numero, 40), b.conviva_registrado ? 1 : 0,
     nivel, analise || null, manifestacao || null,
     b.bo_orientado !== undefined ? (b.bo_orientado ? 1 : 0) : (o.bo_orientado || 0), devolutiva || null,
     encerrando ? u.nome : (status === 'encerrada' ? o.encerrado_por_nome : null),
     encerrando ? db.agora() : (status === 'encerrada' ? o.encerrado_em : null),
     db.agora(), o.id, u.escola_id]
  );
  await db.auditar(u.escola_id, u, 'ocorrencia_acompanhada', { id: o.id, status, gravidade, nivel });
  res.json({ ok: true });
}));

r.post('/ocorrencias/:id/notas', rota(async (req, res) => {
  const o = await carregar(req, req.params.id); // quem registrou também pode anotar
  const texto = obrigatorio(req.body?.texto, 'texto da nota', 4000);
  await db.insert(
    'INSERT INTO ocorrencia_notas (escola_id, ocorrencia_id, usuario_id, usuario_nome, texto, criado_em) VALUES (?,?,?,?,?,?)',
    [req.usuario.escola_id, o.id, req.usuario.id, req.usuario.nome, texto, db.agora()]);
  await db.run('UPDATE ocorrencias SET atualizado_em = ? WHERE id = ? AND escola_id = ?', [db.agora(), o.id, req.usuario.escola_id]);
  res.status(201).json({ ok: true });
}));

r.post('/ocorrencias/:id/cancelar', exigeDirecao, rota(async (req, res) => {
  const o = await carregar(req, req.params.id);
  const motivo = obrigatorio(req.body?.motivo, 'motivo do cancelamento', 500);
  await db.run("UPDATE ocorrencias SET status = 'cancelada', motivo_cancelamento = ?, atualizado_em = ? WHERE id = ? AND escola_id = ?",
    [motivo, db.agora(), o.id, req.usuario.escola_id]);
  await db.auditar(req.usuario.escola_id, req.usuario, 'ocorrencia_cancelada', { id: o.id, motivo });
  res.json({ ok: true });
}));

// ─── Histórico do aluno (equipe gestora) ─────────────────────────────────────
r.get('/alunos/:id/historico', exigeGestao, rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  const aluno = await db.one(
    'SELECT a.id, a.ra, a.nome, a.incluido_por, a.incluido_em, a.atencao_motivo, a.atencao_por, a.atencao_em, t.nome AS turma_nome FROM alunos a LEFT JOIN turmas t ON t.id = a.turma_id WHERE a.id = ? AND a.escola_id = ?',
    [Number(req.params.id), eid]);
  if (!aluno) throw new ErroHttp(404, 'Aluno não encontrado.');
  const lista = await db.all(
    `SELECT o.id, o.ano, o.seq, o.tipo_codigo, o.tipo_descricao, o.categoria, o.gravidade, o.data, o.hora,
       o.status, o.turma_nome, x.papel
     FROM ocorrencia_alunos x JOIN ocorrencias o ON o.id = x.ocorrencia_id
     WHERE x.escola_id = ? AND x.aluno_id = ? AND o.status <> 'cancelada'
     ORDER BY o.data DESC, o.hora DESC`,
    [eid, aluno.id]);
  res.json({ aluno, ocorrencias: lista.map(formatar) });
}));

// ─── Painel ──────────────────────────────────────────────────────────────────
r.get('/painel', rota(async (req, res) => {
  const u = req.usuario;
  const ano = Number(req.query.ano) || new Date().getFullYear();
  const w = ['escola_id = ?', 'ano = ?', "status <> 'cancelada'"];
  const p = [u.escola_id, ano];
  if (!ehGestao(u)) { w.push('registrado_por_id = ?'); p.push(u.id); }
  const linhas = await db.all(
    `SELECT id, categoria, macro, gravidade, status, tipo_codigo, tipo_descricao, turma_nome, data, protocolo,
       conselho_tutelar, nivel FROM ocorrencias WHERE ${w.join(' AND ')}`, p);

  const mesAtual = new Date().toISOString().slice(0, 7);
  const conta = (f) => linhas.filter(f).length;
  const agrupa = (chave) => {
    const m = {};
    for (const l of linhas) { const k = chave(l); if (k) m[k] = (m[k] || 0) + 1; }
    return Object.entries(m).map(([nome, qtd]) => ({ nome, qtd })).sort((a, b) => b.qtd - a.qtd);
  };
  const porMes = Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1, qtd: conta((l) => Number(l.data.slice(5, 7)) === i + 1),
  }));

  // Indicadores do Art. 9º, § 4º da Res. SEDUC nº 68/2026.
  const intervencoes = {};
  let articulacoesRede = 0;
  for (const l of linhas) {
    let prot = [];
    try { prot = JSON.parse(l.protocolo || '[]'); } catch { /* ignora */ }
    if (l.categoria === 'administrativa') for (const k of prot) intervencoes[k] = (intervencoes[k] || 0) + 1;
    if (l.conselho_tutelar || prot.includes('rede') || prot.includes('conselho')) articulacoesRede++;
  }
  const passosAdm = PROCEDIMENTOS.administrativa;
  let reincidentes = 0;
  if (linhas.length) {
    const r = await db.one(
      `SELECT COUNT(*) AS qtd FROM (SELECT x.aluno_id FROM ocorrencia_alunos x JOIN ocorrencias o ON o.id = x.ocorrencia_id
         WHERE x.escola_id = ? AND x.aluno_id IS NOT NULL AND o.ano = ? AND o.status <> 'cancelada'
         ${ehGestao(u) ? '' : 'AND o.registrado_por_id = ?'}
         GROUP BY x.aluno_id HAVING COUNT(*) >= 2) t`,
      ehGestao(u) ? [u.escola_id, ano] : [u.escola_id, ano, u.id]);
    reincidentes = Number(r.qtd);
  }

  res.json({
    ano,
    indicadores: {
      reincidentes,
      resolvidas: conta((l) => l.status === 'encerrada'),
      articulacoesRede,
      porNivel: [1, 2, 3].map((n) => ({ nivel: n, qtd: conta((l) => Number(l.nivel) === n) })),
      intervencoes: passosAdm.map((p) => ({ nome: p.t, qtd: intervencoes[p.k] || 0 })).filter((i) => i.qtd),
    },
    total: linhas.length,
    mes: conta((l) => l.data.startsWith(mesAtual)),
    abertas: conta((l) => l.status === 'aberta'),
    acompanhamento: conta((l) => l.status === 'em_acompanhamento'),
    encerradas: conta((l) => l.status === 'encerrada'),
    urgentesAbertas: conta((l) => l.status !== 'encerrada' && ['urgencia', 'grave'].includes(l.categoria)),
    porCategoria: Object.keys(CATEGORIAS).map((c) => ({ categoria: c, qtd: conta((l) => l.categoria === c) })),
    porMacro: Object.keys(MACROS).map((m) => ({ macro: m, qtd: conta((l) => l.macro === m) })).filter((m) => m.qtd),
    porTipo: agrupa((l) => `${l.tipo_codigo} · ${l.tipo_descricao}`).slice(0, 8),
    porTurma: agrupa((l) => l.turma_nome).slice(0, 10),
    porMes,
  });
}));

export default r;
