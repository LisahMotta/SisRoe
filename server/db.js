// db.js — acesso ao banco de dados.
//
// Dois modos:
//  • PostgreSQL, quando existe a variável DATABASE_URL (ex.: Neon, gratuito).
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
    // Carômetro: foto do aluno guardada no próprio banco (hospedagem gratuita não tem disco permanente).
    // A imagem chega já reduzida pelo navegador (cerca de 15 a 30 KB).
    `CREATE TABLE IF NOT EXISTS fotos_alunos (
      ${ID},
      escola_id INTEGER NOT NULL,
      aluno_id INTEGER NOT NULL,
      mime TEXT NOT NULL,
      dados TEXT NOT NULL,
      enviado_por_nome TEXT,
      atualizado_em TEXT NOT NULL,
      UNIQUE (escola_id, aluno_id)
    )`,
    // Carômetro da turma em arquivo (PDF ou imagem), guardado em partes: a Vercel limita
    // cada envio e cada resposta a ~4,5 MB, então o arquivo vai e volta em pedaços.
    `CREATE TABLE IF NOT EXISTS carometros (
      ${ID},
      escola_id INTEGER NOT NULL,
      turma_id INTEGER,
      nome_arquivo TEXT NOT NULL,
      mime TEXT NOT NULL,
      tamanho INTEGER NOT NULL,
      partes INTEGER NOT NULL,
      completo INTEGER NOT NULL DEFAULT 0,
      enviado_por_nome TEXT,
      criado_em TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS carometro_partes (
      ${ID},
      escola_id INTEGER NOT NULL,
      carometro_id INTEGER NOT NULL,
      ordem INTEGER NOT NULL,
      dados TEXT NOT NULL,
      UNIQUE (carometro_id, ordem)
    )`,
    // Busca ativa: estudantes faltosos e as ações de contato com a família.
    `CREATE TABLE IF NOT EXISTS busca_ativa (
      ${ID},
      escola_id INTEGER NOT NULL,
      aluno_id INTEGER NOT NULL,
      aluno_nome TEXT NOT NULL,
      turma_nome TEXT,
      faltas INTEGER NOT NULL DEFAULT 0,
      periodo_inicio TEXT,
      periodo_fim TEXT,
      motivo TEXT,
      risco TEXT NOT NULL DEFAULT 'baixo',
      status TEXT NOT NULL DEFAULT 'aberto',
      responsavel TEXT,
      telefone TEXT,
      observacoes TEXT,
      aberto_por_nome TEXT NOT NULL,
      criado_em TEXT NOT NULL,
      atualizado_em TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS busca_ativa_acoes (
      ${ID},
      escola_id INTEGER NOT NULL,
      busca_id INTEGER NOT NULL REFERENCES busca_ativa(id),
      tipo TEXT NOT NULL,
      resultado TEXT,
      usuario_nome TEXT NOT NULL,
      criado_em TEXT NOT NULL
    )`,
    // Chat da ocorrência entre quem registrou e a equipe gestora.
    `CREATE TABLE IF NOT EXISTS chat_mensagens (
      ${ID},
      escola_id INTEGER NOT NULL,
      ocorrencia_id INTEGER NOT NULL REFERENCES ocorrencias(id),
      usuario_id INTEGER NOT NULL,
      usuario_nome TEXT NOT NULL,
      usuario_perfil TEXT NOT NULL,
      texto TEXT NOT NULL,
      criado_em TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS chat_leituras (
      escola_id INTEGER NOT NULL,
      ocorrencia_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      ultima_lida INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (ocorrencia_id, usuario_id)
    )`,
    // Inscrições de notificação (Web Push) de cada aparelho.
    `CREATE TABLE IF NOT EXISTS push_inscricoes (
      ${ID},
      escola_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      endpoint TEXT NOT NULL UNIQUE,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      criado_em TEXT NOT NULL
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
    'CREATE INDEX IF NOT EXISTS ix_chat_occ ON chat_mensagens (escola_id, ocorrencia_id, id)',
    'CREATE INDEX IF NOT EXISTS ix_busca_escola ON busca_ativa (escola_id, status)',
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
  // Dados do aluno vindos da lista da SED e contato da família (busca ativa / WhatsApp).
  'ALTER TABLE alunos ADD COLUMN ra_digito TEXT',
  'ALTER TABLE alunos ADD COLUMN data_nascimento TEXT',
  'ALTER TABLE alunos ADD COLUMN responsavel TEXT',
  'ALTER TABLE alunos ADD COLUMN telefone TEXT',
  'ALTER TABLE alunos ADD COLUMN telefone2 TEXT',
  // Modelo da mensagem de WhatsApp da busca ativa (cada escola pode ajustar o texto).
  'ALTER TABLE escolas ADD COLUMN modelo_whatsapp TEXT',
  // Tutorial por perfil: mostrado automaticamente no primeiro acesso.
  'ALTER TABLE usuarios ADD COLUMN tutorial_visto INTEGER NOT NULL DEFAULT 0',
  // Aluno incluído na hora do registro por quem não achou o nome na lista (RA opcional).
  'ALTER TABLE alunos ADD COLUMN incluido_por TEXT',
  'ALTER TABLE alunos ADD COLUMN incluido_em TEXT',
  // Bloqueio do usuário após muitas senhas erradas (vale entre instâncias da Vercel).
  'ALTER TABLE usuarios ADD COLUMN falhas_login INTEGER NOT NULL DEFAULT 0',
  'ALTER TABLE usuarios ADD COLUMN bloqueado_ate TEXT',
  // Aluno sinalizado para atenção especial pela equipe gestora (como no SisRoe da Malba).
  'ALTER TABLE alunos ADD COLUMN atencao_motivo TEXT',
  'ALTER TABLE alunos ADD COLUMN atencao_por TEXT',
  'ALTER TABLE alunos ADD COLUMN atencao_em TEXT',
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
      max: Number(process.env.PG_MAX_CONEXOES) || 5,
      // Bancos gratuitos (ex.: Neon) "dormem" e derrubam conexões paradas.
      // Fechamos as ociosas antes disso e esperamos o banco acordar.
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 20000,
      keepAlive: true,
    });
    // Sem este tratamento, uma conexão ociosa derrubada pelo banco DERRUBA o servidor inteiro.
    pool.on('error', (err) => console.warn('[db] conexão ociosa encerrada pelo banco:', err.message));
  } else {
    const { DatabaseSync } = await import('node:sqlite');
    const file = process.env.SQLITE_FILE || path.join(process.cwd(), 'data', 'sisroe.db');
    if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
    lite = new DatabaseSync(file);
    lite.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  }
  for (const stmt of schema()) {
    try {
      await run(stmt);
    } catch (e) {
      // Em hospedagem "serverless" (ex.: Vercel) várias instâncias podem ligar ao mesmo
      // tempo e criar a mesma tabela juntas; no PostgreSQL a segunda recebe "duplicate key".
      // A tabela já existe, então seguimos.
      if (!/already exists|duplicate key/i.test(e.message)) throw e;
    }
  }
  // Colunas acrescentadas depois da primeira versão. Bancos novos e antigos
  // passam por aqui; se a coluna já existe, o erro é ignorado.
  for (const m of MIGRACOES) {
    try { await run(m); } catch { /* coluna já existe */ }
  }
  console.log(`[db] usando ${USE_PG ? 'PostgreSQL' : 'SQLite'}`);
}

// Erro de conexão (banco reiniciou, acordou ou derrubou a conexão): vale tentar de novo uma vez.
const ERRO_CONEXAO = /Connection terminated|ECONNRESET|ECONNREFUSED|EPIPE|terminating connection|server closed the connection/i;
async function consultaPg(sql, params) {
  try {
    return await pool.query(sql, params);
  } catch (e) {
    if (!ERRO_CONEXAO.test(e.message) && !['57P01', '57P02', '57P03', '08006', '08003'].includes(e.code)) throw e;
    console.warn('[db] conexão perdida, tentando de novo:', e.message);
    return pool.query(sql, params);
  }
}

/** Retorna todas as linhas. */
export async function all(sql, params = []) {
  if (USE_PG) return (await consultaPg(toPg(sql), params)).rows;
  return lite.prepare(sql).all(...params);
}

/** Retorna a primeira linha (ou undefined). */
export async function one(sql, params = []) {
  return (await all(sql, params))[0];
}

/** Executa um comando sem retorno (UPDATE, DELETE, CREATE…). */
export async function run(sql, params = []) {
  if (USE_PG) { await consultaPg(toPg(sql), params); return; }
  lite.prepare(sql).run(...params);
}

/** INSERT que devolve o id criado. */
export async function insert(sql, params = []) {
  if (USE_PG) return (await consultaPg(toPg(sql) + ' RETURNING id', params)).rows[0].id;
  return Number(lite.prepare(sql).run(...params).lastInsertRowid);
}

/**
 * Executa várias operações como uma unidade (tudo ou nada).
 * fn recebe um objeto com all/one/run/insert que usam a mesma conexão.
 */
export async function transacao(fn) {
  if (USE_PG) {
    const client = await pool.connect();
    let quebrada = false;
    const aoErro = (err) => { quebrada = true; console.warn('[db] conexão perdida durante transação:', err.message); };
    client.on('error', aoErro);
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
      // Se a conexão caiu, o ROLLBACK também falha: guardamos o erro original
      // e descartamos a conexão quebrada em vez de devolvê-la ao pool.
      try { await client.query('ROLLBACK'); } catch { quebrada = true; }
      throw e;
    } finally {
      client.off('error', aoErro);
      client.release(quebrada);
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

/** Colunas reais de uma tabela (inclui as criadas pelas MIGRACOES). Usado na restauração do backup. */
const cacheColunas = new Map();
export async function colunas(tabela) {
  if (!/^[a-z_]+$/.test(tabela)) throw new Error('Tabela inválida.');
  if (!cacheColunas.has(tabela)) {
    const lista = USE_PG
      ? (await all('SELECT column_name AS nome FROM information_schema.columns WHERE table_name = ?', [tabela])).map((c) => c.nome)
      : (await all(`PRAGMA table_info(${tabela})`)).map((c) => c.name);
    cacheColunas.set(tabela, new Set(lista));
  }
  return cacheColunas.get(tabela);
}

export async function fechar() {
  if (pool) await pool.end();
  if (lite) lite.close();
}

export { agora, USE_PG };
