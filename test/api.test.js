// Testes da API. Rode com: npm test
// Usa um banco SQLite em memória, criado do zero a cada execução.
process.env.NODE_ENV = 'test';
process.env.SQLITE_FILE = ':memory:';
process.env.JWT_SECRET = 'segredo-de-teste';
delete process.env.DATABASE_URL;

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

const { criarApp } = await import('../server/index.js');
const db = await import('../server/db.js');

let servidor, base;

before(async () => {
  const app = await criarApp();
  await new Promise((ok) => { servidor = app.listen(0, ok); });
  base = `http://127.0.0.1:${servidor.address().port}/api`;
});
after(async () => { servidor.close(); await db.fechar(); });

async function api(caminho, { token, metodo = 'GET', corpo } = {}) {
  const r = await fetch(base + caminho, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const tipo = r.headers.get('content-type') || '';
  return { status: r.status, dados: tipo.includes('json') ? await r.json() : await r.text() };
}

async function cadastrarEscola(codigo) {
  const r = await api('/escolas', { metodo: 'POST', corpo: {
    escola: { nome: `EE ${codigo}`, codigo },
    admin: { nome: 'Diretora Teste', login: 'diretora', senha: 'Senha1234' },
  } });
  assert.equal(r.status, 201, JSON.stringify(r.dados));
  const l = await api('/login', { metodo: 'POST', corpo: { codigo, login: 'diretora', senha: 'Senha1234' } });
  assert.equal(l.status, 200);
  return l.dados.token;
}

async function criarUsuario(tokenAdmin, codigo, login, perfil) {
  const c = await api('/usuarios', { token: tokenAdmin, metodo: 'POST', corpo: { nome: login.toUpperCase(), login, perfil } });
  assert.equal(c.status, 201, JSON.stringify(c.dados));
  const l = await api('/login', { metodo: 'POST', corpo: { codigo, login, senha: c.dados.senhaProvisoria } });
  assert.equal(l.dados.usuario.trocar_senha, true);
  // Antes de trocar a senha provisória, nada além da troca é permitido.
  assert.equal((await api('/tipos', { token: l.dados.token })).status, 403);
  const t = await api('/minha-senha', { token: l.dados.token, metodo: 'POST',
    corpo: { atual: c.dados.senhaProvisoria, nova: 'NovaSenha99' } });
  assert.equal(t.status, 200, JSON.stringify(t.dados));
  return l.dados.token;
}

let A, B, profA, profA2, turmaA, alunosA, tiposA;

test('cadastro de escola cria tipos padrão e login funciona', async () => {
  A = await cadastrarEscola('escola-a');
  B = await cadastrarEscola('escola-b');
  tiposA = (await api('/tipos', { token: A })).dados;
  assert.ok(tiposA.length > 40);
  assert.ok(tiposA.some((t) => /boné/.test(t.descricao)));
  const dup = await api('/escolas', { metodo: 'POST', corpo: {
    escola: { nome: 'X', codigo: 'escola-a' }, admin: { nome: 'Y', login: 'yyy', senha: 'Senha1234' } } });
  assert.equal(dup.status, 409);
  const ruim = await api('/login', { metodo: 'POST', corpo: { codigo: 'escola-a', login: 'diretora', senha: 'errada' } });
  assert.equal(ruim.status, 401);
});

test('turmas e importação de alunos', async () => {
  const t = await api('/turmas', { token: A, metodo: 'POST', corpo: { nome: '7º Ano A', periodo: 'Manhã' } });
  turmaA = t.dados.id;
  const imp = await api(`/turmas/${turmaA}/importar`, { token: A, metodo: 'POST',
    corpo: { texto: 'RA;Nome\n111;Ana Souza\n222\tBruno Lima\nCarla Dias' } });
  assert.deepEqual(imp.dados, { criados: 3, atualizados: 0 });
  alunosA = (await api(`/alunos?turma_id=${turmaA}`, { token: A })).dados;
  assert.equal(alunosA.length, 3);
});

test('professor registra e só vê as próprias ocorrências', async () => {
  profA = await criarUsuario(A, 'escola-a', 'prof1', 'professor');
  profA2 = await criarUsuario(A, 'escola-a', 'prof2', 'professor');
  const bone = tiposA.find((t) => /boné/.test(t.descricao));
  const r = await api('/ocorrencias', { token: profA, metodo: 'POST', corpo: {
    tipo_id: bone.id, data: '2026-03-10', hora: '08:15', local: 'Sala de aula', turma_id: turmaA,
    relato: 'O aluno recusou-se a tirar o boné após três pedidos.', alunos: [{ id: alunosA[0].id, papel: 'autor' }],
  } });
  assert.equal(r.status, 201, JSON.stringify(r.dados));
  assert.equal(r.dados.numero, '2026/0001');

  assert.equal((await api('/ocorrencias', { token: profA })).dados.length, 1);
  assert.equal((await api('/ocorrencias', { token: profA2 })).dados.length, 0);
  assert.equal((await api(`/ocorrencias/${r.dados.id}`, { token: profA2 })).status, 404);
  // Professor não faz acompanhamento nem vê histórico.
  assert.equal((await api(`/ocorrencias/${r.dados.id}/acompanhamento`, { token: profA, metodo: 'PUT', corpo: { status: 'encerrada' } })).status, 403);
  assert.equal((await api(`/alunos/${alunosA[0].id}/historico`, { token: profA })).status, 403);
  // Mas pode acrescentar nota à própria ocorrência.
  assert.equal((await api(`/ocorrencias/${r.dados.id}/notas`, { token: profA, metodo: 'POST', corpo: { texto: 'Família avisada por bilhete.' } })).status, 201);
});

test('isolamento entre escolas', async () => {
  const listaA = (await api('/ocorrencias', { token: A })).dados;
  assert.equal(listaA.length, 1);
  const id = listaA[0].id;
  assert.equal((await api('/ocorrencias', { token: B })).dados.length, 0);
  assert.equal((await api(`/ocorrencias/${id}`, { token: B })).status, 404);
  assert.equal((await api(`/ocorrencias/${id}/acompanhamento`, { token: B, metodo: 'PUT', corpo: { status: 'encerrada' } })).status, 404);
  assert.equal((await api(`/alunos?turma_id=${turmaA}`, { token: B })).dados.length, 0);
  assert.equal((await api(`/alunos/${alunosA[0].id}/historico`, { token: B })).status, 404);
  assert.equal((await api(`/turmas/${turmaA}/importar`, { token: B, metodo: 'POST', corpo: { texto: '1;X' } })).status, 404);
  // Escola B não consegue usar um tipo da escola A.
  const r = await api('/ocorrencias', { token: B, metodo: 'POST', corpo: {
    tipo_id: tiposA[0].id, data: '2026-03-10', hora: '08:15', local: 'Pátio', relato: 'Tentativa com tipo de outra escola.' } });
  assert.equal(r.status, 400);
  // Escola B não consegue usar aluno da escola A.
  const tipoB = (await api('/tipos', { token: B })).dados.find((t) => t.categoria === 'administrativa');
  const r2 = await api('/ocorrencias', { token: B, metodo: 'POST', corpo: {
    tipo_id: tipoB.id, data: '2026-03-10', hora: '08:15', local: 'Pátio',
    relato: 'Tentativa com aluno de outra escola.', alunos: [{ id: alunosA[0].id }] } });
  assert.equal(r2.status, 400);
});

test('acompanhamento: gravidade só sobe, encerramento e histórico', async () => {
  const id = (await api('/ocorrencias', { token: A })).dados[0].id;
  const sobe = await api(`/ocorrencias/${id}/acompanhamento`, { token: A, metodo: 'PUT',
    corpo: { gravidade: 'media', protocolo: ['escuta', 'familia', 'inexistente'], familia_comunicada: true, familia_data: '2026-03-10', familia_meio: 'Telefone' } });
  assert.equal(sobe.status, 200);
  const desce = await api(`/ocorrencias/${id}/acompanhamento`, { token: A, metodo: 'PUT', corpo: { gravidade: 'leve' } });
  assert.equal(desce.status, 400);
  await api(`/ocorrencias/${id}/acompanhamento`, { token: A, metodo: 'PUT', corpo: { status: 'encerrada', protocolo: ['escuta', 'familia'], familia_comunicada: true } });
  const o = (await api(`/ocorrencias/${id}`, { token: A })).dados;
  assert.equal(o.status, 'encerrada');
  assert.equal(o.gravidade, 'media');
  assert.deepEqual(o.protocolo, ['escuta', 'familia']);
  assert.equal(o.encerrado_por_nome, 'Diretora Teste');
  assert.equal(o.notas.length, 1);

  const h = (await api(`/alunos/${alunosA[0].id}/historico`, { token: A })).dados;
  assert.equal(h.ocorrencias.length, 1);
  assert.equal(h.ocorrencias[0].papel, 'autor');

  const p = (await api('/painel?ano=2026', { token: A })).dados;
  assert.equal(p.total, 1);
  assert.equal(p.encerradas, 1);

  const csv = await api('/ocorrencias.csv?status=todas', { token: A });
  assert.match(csv.dados, /2026\/0001/);
});

test('validações do registro', async () => {
  const tipo = tiposA.find((t) => t.categoria === 'administrativa');
  const base = { tipo_id: tipo.id, data: '2026-03-11', hora: '09:00', local: 'Pátio', relato: 'Relato suficientemente longo.' };
  assert.equal((await api('/ocorrencias', { token: profA, metodo: 'POST', corpo: { ...base } })).status, 400, 'administrativa sem aluno');
  assert.equal((await api('/ocorrencias', { token: profA, metodo: 'POST', corpo: { ...base, hora: '25:00', alunos: [{ nome: 'X' }] } })).status, 400);
  assert.equal((await api('/ocorrencias', { token: profA, metodo: 'POST', corpo: { ...base, data: '2999-01-01', alunos: [{ nome: 'X' }] } })).status, 400);
  const ok = await api('/ocorrencias', { token: profA, metodo: 'POST', corpo: { ...base, alunos: [{ nome: 'Aluno visitante' }] } });
  assert.equal(ok.dados.numero, '2026/0002');
});

test('só a direção administra e cancela; usuário desativado perde acesso', async () => {
  assert.equal((await api('/usuarios', { token: profA })).status, 403);
  const id = (await api('/ocorrencias', { token: A })).dados[0].id;
  assert.equal((await api(`/ocorrencias/${id}/cancelar`, { token: profA, metodo: 'POST', corpo: { motivo: 'x' } })).status, 403);
  assert.equal((await api(`/ocorrencias/${id}/cancelar`, { token: A, metodo: 'POST', corpo: { motivo: 'Registro duplicado' } })).status, 200);

  const usuarios = (await api('/usuarios', { token: A })).dados;
  const prof2 = usuarios.find((u) => u.login === 'prof2');
  await api(`/usuarios/${prof2.id}`, { token: A, metodo: 'PUT', corpo: { ativo: false } });
  assert.equal((await api('/tipos', { token: profA2 })).status, 401);
  const eu = usuarios.find((u) => u.login === 'diretora');
  assert.equal((await api(`/usuarios/${eu.id}`, { token: A, metodo: 'PUT', corpo: { ativo: false } })).status, 400);
});
