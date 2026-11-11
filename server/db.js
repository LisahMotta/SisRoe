// db.js — acesso ao banco de dados.
//
// Dois modos:
//  • PostgreSQL, quando existe a variável DATABASE_URL (ex.: Railway).
//  • SQLite em arquivo (data/sisroe.db), para rodar no computador sem instalar nada.
//
// Todo o SQL do sistema é escrito com "?" nos parâmetros; no modo PostgreSQL
// eles são convertidos para $1, $2… automaticamente.
//
// REGRA DE OURO (várias escolas no mesmo banco): toda consulta a dados de
// escola DEVE filtrar por escola_id. Os arquivos de rotas fazem isso sempre.

import fs from 'node:fs';
import path from 'node:path';

const USE_PG = !!process.env.DATABASE_URL;
let pool = null;   // PostgreSQL
let lite = null;   // SQLite

const agora = () => new Date().toISOString();

function idCol() {
  return USE_PG ? 'id SERIAL PRIMARY KEY' : 'id INTEGER PRIMARY KEY AUTOINCREMENT';
}

function schema() {
  const ID = idCol();
  return [
    `CREATE TABLE IF NOT EXISTS escolas (
      ${ID},
      nome TEXT NOT NULL,
      codigo TEXT NOT NULL UNIQUE,
      cie TEXT, municipio TEXT, diretoria TEXT, telefone TEXT, endereco TEXT,
      criado_em TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS usuarios (
      ${ID},
      escola_id INTEGER NOT NULL REFERENCES escolas(id),
      nome TEXT NOT NULL,
      login TEXT NOT NULL,
      perfil TEXT NOT NULL,
      senha_hash TEXT NOT NULL,
      ativo INTEGER NOT NULL DEFAULT 1,
      trocar_senha INTEGER NOT NULL DEFAULT 0,
      criado_em TEXT NOT NULL,
      UNIQUE (escola_id, login)
    )`,
    `CREATE TABLE IF NOT EXISTS turmas (
      ${ID},
      escola_id INTEGER NOT NULL REFERENCES escolas(id),
      nome TEXT NOT NULL,
      periodo TEXT,
      ativa INTEGER NOT NULL DEFAULT 1,
      UNIQUE (escola_id, nome)
    )`,
    `CREATE TABLE IF NOT EXISTS alunos (
      ${ID},
      escola_id INTEGER NOT NULL REFERENCES escolas(id),
      turma_id INTEGER REFERENCES turmas(id),
      ra TEXT,
      nome TEXT NOT NULL,
      ativo INTEGER NOT NULL DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS tipos (
      ${ID},
      escola_id INTEGER NOT NULL REFERENCES escolas(id),
      codigo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      categoria TEXT NOT NULL,
      gravidade TEXT NOT NULL,
      ativo INTEGER NOT NULL DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS ocorrencias (
      ${ID},
      escola_id INTEGER NOT NULL REFERENCES escolas(id),
      ano INTEGER NOT NULL,
      seq INTEGER NOT NULL,
      tipo_id INTEGER,
      tipo_codigo TEXT NOT NULL,
      tipo_descricao TEXT NOT NULL,
      categoria TEXT NOT NULL,
      gravidade TEXT NOT NULL,
      data TEXT NOT NULL,
      hora TEXT NOT NULL,
      local TEXT NOT NULL,
      turma_id INTEGER,
      turma_nome TEXT,
      relato TEXT NOT NULL,
      providencias TEXT,
      protocolo TEXT NOT NULL DEFAULT '[]',
      familia_comunicada INTEGER NOT NULL DEFAULT 0,
      familia_data TEXT, familia_meio TEXT, familia_obs TEXT,
      conselho_tutelar INTEGER NOT NULL DEFAULT 0,
      bo_numero TEXT,
      conviva_registrado INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'aberta',
      motivo_cancelamento TEXT,
      registrado_por_id INTEGER NOT NULL,
      registrado_por_nome TEXT NOT NULL,
      registrado_por_perfil TEXT NOT NULL,
      encerrado_por_nome TEXT, encerrado_em TEXT,
      criado_em TEXT NOT NULL,
      atualizado_em TEXT NOT NULL,
      UNIQUE (escola_id, ano, seq)
    )`,
    `CREATE TABLE IF NOT EXISTS ocorrencia_alunos (
      ${ID},
      escola_id INTEGER NOT NULL,
      ocorrencia_id INTEGER NOT NULL REFERENCES ocorrencias(id),
      aluno_id INTEGER,
      ra TEXT,
      nome TEXT NOT NULL,
      turma_nome TEXT,
      papel TEXT NOT NULL DEFAULT 'envolvido'
    )`,
    `CREATE TABLE IF NOT EXISTS ocorrencia_notas (
      ${ID},
      escola_id INTEGER NOT NULL,
      ocorrencia_id INTEGER NOT NULL REFERENCES ocorrencias(id),
      usuario_id INTEGER NOT NULL,
      usuario_nome TEXT NOT NULL,
      texto TEXT NOT NULL,
      criado_em TEXT NOT NULL
    )`,
    // Afastamento preventivo temporário — Cap. IV da Res. SEDUC nº 68/2026.
    `CREATE TABLE IF NOT EXISTS afastamentos (
      ${ID},
      escola_id INTEGER NOT NULL,
      ocorrencia_id INTEGER NOT NULL REFERENCES ocorrencias(id),
      aluno_id INTEGER,
      aluno_nome TEXT NOT NULL,
      hipoteses TEXT NOT NULL,
      motivacao TEXT NOT NULL,
      data_inicio TEXT NOT NULL,
      dias_letivos INTEGER NOT NULL,
      plano_estudos TEXT NOT NULL,
      educacao_especial INTEGER NOT NULL DEFAULT 0,
      adaptacoes TEXT,
      familia_comunicada_em TEXT,
      ure_comunicada_em TEXT,
      rede_protetiva TEXT,
      conviva_registrado INTEGER NOT NULL DEFAULT 0,
      manifestacao TEXT,
      prorrogado INTEGER NOT NULL DEFAULT 0,
      prorrogacao_dias INTEGER,
      prorrogacao_conselho_data TEXT,
      prorrogacao_fundamento TEXT,
      status TEXT NOT NULL DEFAULT 'vigente',
      encerramento_obs TEXT,
      criado_por_nome TEXT NOT NULL,
      criado_em TEXT NOT NULL,
      atualizado_em TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS auditoria (
      ${ID},
      escola_id INTEGER,
      usuario_id INTEGER,
      usuario_nome TEXT,
      acao TEXT NOT NULL,
      detalhes TEXT,
      criado_em TEXT NOT NULL
    )`,
    'CREATE INDEX IF NOT EXISTS ix_occ_escola ON ocorrencias (escola_id, data)',
    'CREATE INDEX IF NOT EXISTS ix_occal_aluno ON ocorrencia_alunos (escola_id, aluno_id)',
    'CREATE INDEX IF NOT EXISTS ix_alunos_turma ON alunos (escola_id, turma_id)',
  ];
}

// Res. SEDUC nº 68/2026: nível de resposta (Art. 5º), data de conhecimento
// (Art. 9º §3º), síntese da análise inicial (Art. 9º §1º) e manifestação do
// estudante (Art. 3º V).
const MIGRACOES = [
  'ALTER TABLE ocorrencias ADD COLUMN nivel INTEGER',
  'ALTER TABLE ocorrencias ADD COLUMN data_conhecimento TEXT',
  'ALTER TABLE ocorrencias ADD COLUMN analise_inicial TEXT',
  'ALTER TABLE ocorrencias ADD COLUMN manifestacao_estudante TEXT',
  // Protocolo 179 — 3ª versão: passos próprios de cada situação, macrocategoria,
  // regra de B.O. (seção 1.4.4) e devolutiva da rede protetiva (seção 1.2).
  'ALTER TABLE tipos ADD COLUMN macro TEXT',
  'ALTER TABLE tipos ADD COLUMN bo TEXT',
  'ALTER TABLE tipos ADD COLUMN definicao TEXT',
  'ALTER TABLE tipos ADD COLUMN passos TEXT',
  'ALTER TABLE tipos ADD COLUMN origem TEXT',
  'ALTER TABLE ocorrencias ADD COLUMN macro TEXT',
  'ALTER TABLE ocorrencias ADD COLUMN passos TEXT',
  'ALTER TABLE ocorrencias ADD COLUMN bo_regra TEXT',
  'ALTER TABLE ocorrencias ADD COLUMN bo_orientado INTEGER',
  'ALTER TABLE ocorrencias ADD COLUMN rede_devolutiva TEXT',
];

// Converte "?" em "$1, $2…" para o PostgreSQL.
function toPg(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

export async function init() {
  if (USE_PG) {
    const { default: pg } = await import('pg');
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
    });
  } else {
    const { DatabaseSync } = await import('node:sqlite');
    const file = process.env.SQLITE_FILE || path.join(process.cwd(), 'data', 'sisroe.db');
    if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
    lite = new DatabaseSync(file);
    lite.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  }
  for (const stmt of schema()) await run(stmt);
  // Colunas acrescentadas depois da primeira versão. Bancos novos e antigos
  // passam por aqui; se a coluna já existe, o erro é ignorado.
  for (const m of MIGRACOES) {
    try { await run(m); } catch { /* coluna já existe */ }
  }
  console.log(`[db] usando ${USE_PG ? 'PostgreSQL' : 'SQLite'}`);
}

/** Retorna todas as linhas. */
export async function all(sql, params = []) {
  if (USE_PG) return (await pool.query(toPg(sql), params)).rows;
  return lite.prepare(sql).all(...params);
}

/** Retorna a primeira linha (ou undefined). */
export async function one(sql, params = []) {
  return (await all(sql, params))[0];
}

/** Executa um comando sem retorno (UPDATE, DELETE, CREATE…). */
export async function run(sql, params = []) {
  if (USE_PG) { await pool.query(toPg(sql), params); return; }
  lite.prepare(sql).run(...params);
}

/** INSERT que devolve o id criado. */
export async function insert(sql, params = []) {
  if (USE_PG) return (await pool.query(toPg(sql) + ' RETURNING id', params)).rows[0].id;
  return Number(lite.prepare(sql).run(...params).lastInsertRowid);
}

/**
 * Executa várias operações como uma unidade (tudo ou nada).
 * fn recebe um objeto com all/one/run/insert que usam a mesma conexão.
 */
export async function transacao(fn) {
  if (USE_PG) {
    const client = await pool.connect();
    const tx = {
      all: async (s, p = []) => (await client.query(toPg(s), p)).rows,
      one: async (s, p = []) => (await client.query(toPg(s), p)).rows[0],
      run: async (s, p = []) => { await client.query(toPg(s), p); },
      insert: async (s, p = []) => (await client.query(toPg(s) + ' RETURNING id', p)).rows[0].id,
    };
    try {
      await client.query('BEGIN');
      const r = await fn(tx);
      await client.query('COMMIT');
      return r;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
  // SQLite é síncrono e de conexão única: BEGIN/COMMIT diretos.
  lite.exec('BEGIN');
  try {
    const r = await fn({ all, one, run, insert });
    lite.exec('COMMIT');
    return r;
  } catch (e) {
    lite.exec('ROLLBACK');
    throw e;
  }
}

export async function auditar(escolaId, usuario, acao, detalhes = '') {
  await run(
    'INSERT INTO auditoria (escola_id, usuario_id, usuario_nome, acao, detalhes, criado_em) VALUES (?,?,?,?,?,?)',
    [escolaId, usuario?.id ?? null, usuario?.nome ?? null, acao,
     typeof detalhes === 'string' ? detalhes : JSON.stringify(detalhes), agora()]
  );
}

export async function fechar() {
  if (pool) await pool.end();
  if (lite) lite.close();
}

export { agora, USE_PG };
