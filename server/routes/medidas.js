// routes/medidas.js — medidas da Resolução SEDUC nº 68/2026:
//  • afastamento preventivo temporário (Cap. IV, Arts. 11 e 12);
//  • dados para o relatório circunstanciado (Art. 15).
//
// O afastamento é decisão da Direção (Art. 11): só vice-direção e direção.
// Regras aplicadas aqui:
//  • só para ocorrência classificada no Nível III (Art. 5º, III);
//  • motivação expressa e registro formal (Art. 28, I) e ao menos uma hipótese do Art. 11, § 1º;
//  • prazo inicial de no máximo 5 dias letivos (Art. 11, § 5º);
//  • plano de estudos obrigatório (Art. 11, § 3º);
//  • estudante da Educação Especial / sofrimento psíquico: adaptações documentadas (Art. 31);
//  • declaração de que a medida não decorre de motivo discriminatório (Art. 28, VI);
//  • uma única prorrogação, por igual período, com apreciação do Conselho de Escola,
//    reavaliação fundamentada e família comunicada (Art. 11, §§ 6º e 7º).
import express from 'express';
import * as db from '../db.js';
import { exigeAdmin } from '../auth.js';
import { ErroHttp, txt, obrigatorio, dataValida, rota } from '../util.js';
import { HIPOTESES_AFASTAMENTO, AFASTAMENTO_MAX_DIAS } from '../../public/js/catalogo.js';

const r = express.Router();

async function carregarAfastamento(req) {
  const a = await db.one('SELECT * FROM afastamentos WHERE id = ? AND escola_id = ?', [Number(req.params.id), req.usuario.escola_id]);
  if (!a) throw new ErroHttp(404, 'Afastamento não encontrado.');
  return a;
}

function dias(v, rotulo) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > AFASTAMENTO_MAX_DIAS) {
    throw new ErroHttp(400, `${rotulo}: de 1 a ${AFASTAMENTO_MAX_DIAS} dias letivos (Art. 11, § 5º).`);
  }
  return n;
}

r.post('/ocorrencias/:id/afastamentos', exigeAdmin, rota(async (req, res) => {
  const u = req.usuario;
  const eid = u.escola_id;
  const o = await db.one('SELECT * FROM ocorrencias WHERE id = ? AND escola_id = ?', [Number(req.params.id), eid]);
  if (!o) throw new ErroHttp(404, 'Ocorrência não encontrada.');
  if (o.status === 'cancelada') throw new ErroHttp(400, 'Ocorrência cancelada.');
  if (Number(o.nivel) !== 3) {
    throw new ErroHttp(400, 'O afastamento preventivo só pode ser avaliado em situação classificada no Nível III (Art. 5º, III). Classifique a ocorrência no acompanhamento.');
  }
  const b = req.body || {};

  // O estudante precisa estar entre os envolvidos da ocorrência.
  const envolvidos = await db.all('SELECT aluno_id, nome FROM ocorrencia_alunos WHERE escola_id = ? AND ocorrencia_id = ?', [eid, o.id]);
  const aluno = envolvidos.find((e) => (b.aluno_id ? e.aluno_id === Number(b.aluno_id) : e.nome === txt(b.aluno_nome, 120)));
  if (!aluno) throw new ErroHttp(400, 'Selecione um estudante envolvido nesta ocorrência.');

  const hipoteses = Array.isArray(b.hipoteses) ? b.hipoteses.filter((h) => HIPOTESES_AFASTAMENTO[h]) : [];
  if (!hipoteses.length) throw new ErroHttp(400, 'Indique ao menos uma hipótese do Art. 11, § 1º.');
  const motivacao = obrigatorio(b.motivacao, 'motivação', 4000);
  if (motivacao.length < 30) {
    throw new ErroHttp(400, 'Descreva a motivação com elementos objetivos (Art. 28, I, e Art. 5º, § 3º).');
  }
  if (!dataValida(b.data_inicio || '')) throw new ErroHttp(400, 'Informe a data de início.');
  const diasLetivos = dias(b.dias_letivos, 'Prazo inicial');
  const plano = obrigatorio(b.plano_estudos, 'plano de estudos (Art. 11, § 3º)', 4000);
  const educEsp = !!b.educacao_especial;
  const adaptacoes = txt(b.adaptacoes, 4000);
  if (educEsp && adaptacoes.length < 20) {
    throw new ErroHttp(400, 'Para estudante da Educação Especial ou em sofrimento psíquico, documente as adaptações razoáveis e os apoios já adotados (Art. 31).');
  }
  if (!b.declara_nao_discriminatorio) {
    throw new ErroHttp(400, 'Confirme que a medida não decorre de deficiência, saúde, vulnerabilidade, raça, religião, orientação sexual, identidade de gênero ou outra forma de discriminação (Art. 28, VI).');
  }
  const vigente = await db.one(
    "SELECT id FROM afastamentos WHERE escola_id = ? AND ocorrencia_id = ? AND aluno_nome = ? AND status = 'vigente'",
    [eid, o.id, aluno.nome]);
  if (vigente) throw new ErroHttp(409, 'Já existe afastamento vigente deste estudante nesta ocorrência.');

  const agora = db.agora();
  const id = await db.insert(
    `INSERT INTO afastamentos (escola_id, ocorrencia_id, aluno_id, aluno_nome, hipoteses, motivacao, data_inicio, dias_letivos,
       plano_estudos, educacao_especial, adaptacoes, status, criado_por_nome, criado_em, atualizado_em)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,'vigente',?,?,?)`,
    [eid, o.id, aluno.aluno_id, aluno.nome, JSON.stringify(hipoteses), motivacao, b.data_inicio, diasLetivos,
     plano, educEsp ? 1 : 0, adaptacoes || null, u.nome, agora, agora]);
  await db.auditar(eid, u, 'afastamento_registrado', { id, ocorrencia: o.id, aluno: aluno.nome, dias: diasLetivos });
  res.status(201).json({ id });
}));

// Atualiza comunicações / manifestação, prorroga ou encerra.
r.put('/afastamentos/:id', exigeAdmin, rota(async (req, res) => {
  const u = req.usuario;
  const a = await carregarAfastamento(req);
  const b = req.body || {};
  const data = (v, campo) => {
    if (v === undefined) return a[campo];
    if (!v) return null;
    if (!dataValida(v)) throw new ErroHttp(400, 'Data inválida.');
    return v;
  };
  const upd = {
    familia_comunicada_em: data(b.familia_comunicada_em, 'familia_comunicada_em'),
    ure_comunicada_em: data(b.ure_comunicada_em, 'ure_comunicada_em'),
    rede_protetiva: b.rede_protetiva !== undefined ? txt(b.rede_protetiva, 500) || null : a.rede_protetiva,
    conviva_registrado: b.conviva_registrado !== undefined ? (b.conviva_registrado ? 1 : 0) : a.conviva_registrado,
    manifestacao: b.manifestacao !== undefined ? txt(b.manifestacao, 4000) || null : a.manifestacao,
    prorrogado: a.prorrogado,
    prorrogacao_dias: a.prorrogacao_dias,
    prorrogacao_conselho_data: a.prorrogacao_conselho_data,
    prorrogacao_fundamento: a.prorrogacao_fundamento,
    status: a.status,
    encerramento_obs: a.encerramento_obs,
  };

  if (b.acao && a.status !== 'vigente') throw new ErroHttp(400, 'Este afastamento já foi encerrado.');
  if (b.acao === 'prorrogar') {
    if (a.prorrogado) throw new ErroHttp(400, 'A prorrogação só pode ocorrer uma vez, por igual período (Art. 11, § 6º).');
    upd.prorrogacao_dias = dias(b.prorrogacao_dias, 'Prorrogação');
    if (upd.prorrogacao_dias > a.dias_letivos) throw new ErroHttp(400, 'A prorrogação não pode exceder o prazo inicial (Art. 11, § 6º).');
    if (!dataValida(b.prorrogacao_conselho_data || '')) {
      throw new ErroHttp(400, 'Informe a data da apreciação pelo Conselho de Escola (Art. 11, § 7º).');
    }
    const fundamento = txt(b.prorrogacao_fundamento, 4000);
    if (fundamento.length < 30) throw new ErroHttp(400, 'Registre a reavaliação formal e fundamentada da Direção (Art. 11, § 6º).');
    if (!upd.familia_comunicada_em) throw new ErroHttp(400, 'A prorrogação deve ser comunicada formalmente à família (Art. 11, § 7º). Registre a comunicação.');
    upd.prorrogado = 1;
    upd.prorrogacao_conselho_data = b.prorrogacao_conselho_data;
    upd.prorrogacao_fundamento = fundamento;
  } else if (b.acao === 'encerrar') {
    upd.status = 'encerrado';
    upd.encerramento_obs = obrigatorio(b.encerramento_obs, 'encaminhamento após o encerramento (Art. 11, § 8º)', 2000);
  }

  await db.run(
    `UPDATE afastamentos SET familia_comunicada_em = ?, ure_comunicada_em = ?, rede_protetiva = ?, conviva_registrado = ?,
       manifestacao = ?, prorrogado = ?, prorrogacao_dias = ?, prorrogacao_conselho_data = ?, prorrogacao_fundamento = ?,
       status = ?, encerramento_obs = ?, atualizado_em = ? WHERE id = ? AND escola_id = ?`,
    [upd.familia_comunicada_em, upd.ure_comunicada_em, upd.rede_protetiva, upd.conviva_registrado, upd.manifestacao,
     upd.prorrogado, upd.prorrogacao_dias, upd.prorrogacao_conselho_data, upd.prorrogacao_fundamento,
     upd.status, upd.encerramento_obs, db.agora(), a.id, u.escola_id]);
  await db.auditar(u.escola_id, u, b.acao ? `afastamento_${b.acao}` : 'afastamento_atualizado', { id: a.id });
  res.json({ ok: true });
}));

// Dados reunidos para o rascunho do relatório circunstanciado (Art. 15).
r.get('/alunos/:id/relatorio', exigeAdmin, rota(async (req, res) => {
  const eid = req.usuario.escola_id;
  const aluno = await db.one(
    'SELECT a.id, a.ra, a.nome, t.nome AS turma_nome FROM alunos a LEFT JOIN turmas t ON t.id = a.turma_id WHERE a.id = ? AND a.escola_id = ?',
    [Number(req.params.id), eid]);
  if (!aluno) throw new ErroHttp(404, 'Aluno não encontrado.');
  const ocorrencias = await db.all(
    `SELECT o.*, x.papel FROM ocorrencia_alunos x JOIN ocorrencias o ON o.id = x.ocorrencia_id
     WHERE x.escola_id = ? AND x.aluno_id = ? AND o.status <> 'cancelada' ORDER BY o.data, o.hora`,
    [eid, aluno.id]);
  const ids = ocorrencias.map((o) => o.id);
  const em = ids.length ? `IN (${ids.map(() => '?').join(',')})` : 'IN (NULL)';
  const notas = await db.all(
    `SELECT ocorrencia_id, usuario_nome, texto, criado_em FROM ocorrencia_notas WHERE escola_id = ? AND ocorrencia_id ${em} ORDER BY id`,
    [eid, ...ids]);
  const afastamentos = await db.all(
    'SELECT * FROM afastamentos WHERE escola_id = ? AND aluno_id = ? ORDER BY data_inicio', [eid, aluno.id]);
  res.json({
    aluno,
    ocorrencias: ocorrencias.map((o) => ({
      ...o,
      numero: `${o.ano}/${String(o.seq).padStart(4, '0')}`,
      protocolo: JSON.parse(o.protocolo || '[]'),
      notas: notas.filter((n) => n.ocorrencia_id === o.id),
    })),
    afastamentos: afastamentos.map((a) => ({ ...a, hipoteses: JSON.parse(a.hipoteses || '[]') })),
  });
}));

export default r;
