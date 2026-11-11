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
    corpo: { gravidade: 'media', protocolo: ['acolhimento', 'familia', 'inexistente'], familia_comunicada: true, familia_data: '2026-03-10', familia_meio: 'Telefone' } });
  assert.equal(sobe.status, 200);
  const desce = await api(`/ocorrencias/${id}/acompanhamento`, { token: A, metodo: 'PUT', corpo: { gravidade: 'leve' } });
  assert.equal(desce.status, 400);
  await api(`/ocorrencias/${id}/acompanhamento`, { token: A, metodo: 'PUT', corpo: { status: 'encerrada', protocolo: ['acolhimento', 'familia'], familia_comunicada: true } });
  const o = (await api(`/ocorrencias/${id}`, { token: A })).dados;
  assert.equal(o.status, 'encerrada');
  assert.equal(o.gravidade, 'media');
  assert.deepEqual(o.protocolo, ['acolhimento', 'familia']);
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

test('Res. SEDUC 68/2026: nível, data de conhecimento e afastamento preventivo', async () => {
  const tipo = tiposA.find((t) => /sem permissão/.test(t.descricao));
  const nova = await api('/ocorrencias', { token: A, metodo: 'POST', corpo: {
    tipo_id: tipo.id, data: '2026-04-01', data_conhecimento: '2026-04-03', hora: '10:00', local: 'Corredor', turma_id: turmaA,
    relato: 'Aluno saiu da sala sem permissão pela quarta vez na semana.', alunos: [{ id: alunosA[1].id, papel: 'autor' }] } });
  assert.equal(nova.status, 201, JSON.stringify(nova.dados));
  const id = nova.dados.id;
  // Data de conhecimento anterior ao fato é recusada (Art. 9º §3º).
  const ruim = await api('/ocorrencias', { token: A, metodo: 'POST', corpo: {
    tipo_id: tipo.id, data: '2026-04-05', data_conhecimento: '2026-04-01', hora: '10:00', local: 'Corredor',
    relato: 'Relato de teste com tamanho suficiente.', alunos: [{ nome: 'X' }] } });
  assert.equal(ruim.status, 400);

  const corpoAfast = { aluno_id: alunosA[1].id, hipoteses: ['III'], data_inicio: '2026-04-06', dias_letivos: 3,
    motivacao: 'Recorrência grave registrada nas ocorrências 2026/0001 a 2026/0003, sem efeito das intervenções.',
    plano_estudos: 'Atividades da Plataforma, entregues diariamente à coordenação.', declara_nao_discriminatorio: true };
  // Sem Nível III não há afastamento (Art. 5º, III).
  assert.equal((await api(`/ocorrencias/${id}/afastamentos`, { token: A, metodo: 'POST', corpo: corpoAfast })).status, 400);
  // Nível III exige análise inicial registrada (Art. 5º §3º).
  assert.equal((await api(`/ocorrencias/${id}/acompanhamento`, { token: A, metodo: 'PUT', corpo: { nivel: 3 } })).status, 400);
  assert.equal((await api(`/ocorrencias/${id}/acompanhamento`, { token: A, metodo: 'PUT',
    corpo: { nivel: 3, analise_inicial: 'Quarta saída na semana; colegas relatam ameaças no corredor.' } })).status, 200);

  // Professor não decide afastamento (Art. 11: Direção).
  assert.equal((await api(`/ocorrencias/${id}/afastamentos`, { token: profA, metodo: 'POST', corpo: corpoAfast })).status, 403);
  // Escola B não alcança a ocorrência da escola A.
  assert.equal((await api(`/ocorrencias/${id}/afastamentos`, { token: B, metodo: 'POST', corpo: corpoAfast })).status, 404);
  // Prazo inicial acima de 5 dias letivos é recusado (Art. 11 §5º).
  assert.equal((await api(`/ocorrencias/${id}/afastamentos`, { token: A, metodo: 'POST', corpo: { ...corpoAfast, dias_letivos: 6 } })).status, 400);
  // Sem a declaração do Art. 28, VI, é recusado.
  assert.equal((await api(`/ocorrencias/${id}/afastamentos`, { token: A, metodo: 'POST', corpo: { ...corpoAfast, declara_nao_discriminatorio: false } })).status, 400);
  // Educação Especial sem adaptações documentadas é recusado (Art. 31).
  assert.equal((await api(`/ocorrencias/${id}/afastamentos`, { token: A, metodo: 'POST', corpo: { ...corpoAfast, educacao_especial: true } })).status, 400);
  // Estudante que não está na ocorrência é recusado.
  assert.equal((await api(`/ocorrencias/${id}/afastamentos`, { token: A, metodo: 'POST', corpo: { ...corpoAfast, aluno_id: alunosA[2].id } })).status, 400);

  const ok = await api(`/ocorrencias/${id}/afastamentos`, { token: A, metodo: 'POST', corpo: corpoAfast });
  assert.equal(ok.status, 201, JSON.stringify(ok.dados));
  const af = ok.dados.id;
  assert.equal((await api(`/afastamentos/${af}`, { token: B, metodo: 'PUT', corpo: { acao: 'encerrar', encerramento_obs: 'x' } })).status, 404);

  // Prorrogação: exige família comunicada, Conselho de Escola e fundamento; só uma vez e por igual período.
  const prorr = { acao: 'prorrogar', prorrogacao_dias: 3, prorrogacao_conselho_data: '2026-04-09',
    prorrogacao_fundamento: 'Risco persiste: novas ameaças relatadas por três estudantes em 08/04.' };
  assert.equal((await api(`/afastamentos/${af}`, { token: A, metodo: 'PUT', corpo: prorr })).status, 400, 'sem família');
  assert.equal((await api(`/afastamentos/${af}`, { token: A, metodo: 'PUT', corpo: { familia_comunicada_em: '2026-04-06', ure_comunicada_em: '2026-04-06' } })).status, 200);
  assert.equal((await api(`/afastamentos/${af}`, { token: A, metodo: 'PUT', corpo: { ...prorr, prorrogacao_dias: 4 } })).status, 400, 'maior que o inicial');
  assert.equal((await api(`/afastamentos/${af}`, { token: A, metodo: 'PUT', corpo: prorr })).status, 200);
  assert.equal((await api(`/afastamentos/${af}`, { token: A, metodo: 'PUT', corpo: prorr })).status, 400, 'segunda prorrogação');
  assert.equal((await api(`/afastamentos/${af}`, { token: A, metodo: 'PUT', corpo: { acao: 'encerrar', encerramento_obs: 'Retorno com plano de acompanhamento.' } })).status, 200);

  const o = (await api(`/ocorrencias/${id}`, { token: A })).dados;
  assert.equal(o.nivel, 3);
  assert.equal(o.data_conhecimento, '2026-04-03');
  assert.equal(o.afastamentos.length, 1);
  assert.equal(o.afastamentos[0].status, 'encerrado');
  assert.equal(o.afastamentos[0].prorrogado, 1);

  // Relatório circunstanciado: só a direção, e isolado por escola.
  assert.equal((await api(`/alunos/${alunosA[1].id}/relatorio`, { token: profA })).status, 403);
  assert.equal((await api(`/alunos/${alunosA[1].id}/relatorio`, { token: B })).status, 404);
  const rel = (await api(`/alunos/${alunosA[1].id}/relatorio`, { token: A })).dados;
  assert.equal(rel.ocorrencias.length, 1);
  assert.equal(rel.afastamentos.length, 1);

  const p = (await api('/painel?ano=2026', { token: A })).dados;
  assert.ok(p.indicadores);
  assert.equal(p.indicadores.porNivel.find((n) => n.nivel === 3).qtd, 1);
});
