// Testes da API. Rode com: npm test
// Por padrão usa um banco SQLite em memória, criado do zero a cada execução.
// Para testar no PostgreSQL (como em produção), aponte para um banco VAZIO:
//   TEST_DATABASE_URL=postgres://usuario@localhost:5432/sisroe_teste npm test
process.env.NODE_ENV = 'test';
process.env.SQLITE_FILE = ':memory:';
process.env.JWT_SECRET = 'segredo-de-teste';
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.PGSSL = process.env.PGSSL || 'false';
} else {
  delete process.env.DATABASE_URL;
}

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

test('Protocolo 179 — 3ª versão: 50 situações, passos próprios, devolutiva da rede e atualização do catálogo', async () => {
  const tipos = (await api('/tipos', { token: A })).dados;
  const prot = tipos.filter((t) => t.origem === 'protocolo');
  assert.equal(prot.length, 50);
  assert.ok(prot.some((t) => t.codigo === '4.50' && /Xenofobia/.test(t.descricao)));
  assert.ok(!tipos.some((t) => /^[IVXL]+$/.test(t.codigo)), 'sem numeração romana da versão antiga');
  assert.equal(tipos[0].passos, undefined, 'lista leve, sem passos');

  const arma = prot.find((t) => t.codigo === '4.33');
  assert.equal(arma.categoria, 'urgencia');
  assert.equal(arma.macro, 'g');
  assert.equal(arma.bo, 'escola');
  const det = (await api(`/tipos/${arma.id}`, { token: profA })).dados;
  assert.ok(det.passos.length >= 10 && det.passos[0].k === 'a');
  assert.equal((await api(`/tipos/${arma.id}`, { token: B })).status, 404);

  // Registro guarda a cópia dos passos; só aceita chaves que existem nesses passos.
  const r = await api('/ocorrencias', { token: A, metodo: 'POST', corpo: {
    tipo_id: arma.id, data: '2026-05-02', hora: '09:30', local: 'Pátio', turma_id: turmaA,
    relato: 'Estudante encontrado com estilete na mochila durante o intervalo.', protocolo: ['a', 'b', 'zz', 'acolhimento'],
    alunos: [{ id: alunosA[2].id, papel: 'autor' }] } });
  assert.equal(r.status, 201, JSON.stringify(r.dados));
  let o = (await api(`/ocorrencias/${r.dados.id}`, { token: A })).dados;
  assert.deepEqual(o.protocolo, ['a', 'b']);
  assert.equal(o.passos.length, det.passos.length);
  assert.equal(o.macro, 'g');
  assert.equal(o.bo_regra, 'escola');

  // Seção 1.2: Conselho Tutelar acionado exige devolutiva para encerrar.
  const enc = { status: 'encerrada', conselho_tutelar: true, conviva_registrado: true };
  assert.equal((await api(`/ocorrencias/${r.dados.id}/acompanhamento`, { token: A, metodo: 'PUT', corpo: enc })).status, 400);
  assert.equal((await api(`/ocorrencias/${r.dados.id}/acompanhamento`, { token: A, metodo: 'PUT',
    corpo: { ...enc, rede_devolutiva: 'CT informou acompanhamento da família em 05/05.', bo_orientado: true } })).status, 200);
  o = (await api(`/ocorrencias/${r.dados.id}`, { token: A })).dados;
  assert.equal(o.status, 'encerrada');
  assert.equal(o.bo_orientado, true);

  // Atualizar catálogo: desativa tipo antigo em numeração romana e mantém as 50 situações.
  await api('/tipos', { token: A, metodo: 'POST', corpo: { codigo: 'XXI', descricao: 'Tipo antigo', categoria: 'grave', gravidade: 'grave' } });
  assert.equal((await api('/tipos/atualizar-protocolo', { token: profA, metodo: 'POST' })).status, 403);
  const at = (await api('/tipos/atualizar-protocolo', { token: A, metodo: 'POST' })).dados;
  assert.equal(at.atualizados, 50);
  assert.equal(at.criados, 0);
  // O tipo "XXI" foi criado pela escola (origem escola): não é desativado.
  assert.equal(at.desativados, 0);
  // A ocorrência já registrada continua com seus passos.
  assert.equal((await api(`/ocorrencias/${r.dados.id}`, { token: A })).dados.passos.length, det.passos.length);
});

test('SED: importação de lista CSV (lida no navegador) com RA, contato e desativação de ausentes', async () => {
  const linhas = [
    { turma: '8º Ano B', nome: 'Eduarda Nunes', ra: '000123456789', ra_digito: '5', data_nascimento: '12/03/2012', responsavel: 'Rita Nunes', telefone: '(12) 98888-7777' },
    { turma: '8º Ano B', nome: 'Felipe Ramos', ra: '000123456790', data_nascimento: '2012-05-01' },
    { turma: '8º Ano B', nome: 'Gabi Torres', ra: '000123456791', telefone: 'abc' },
  ];
  assert.equal((await api('/alunos/importar-sed', { token: profA, metodo: 'POST', corpo: { linhas } })).status, 403);
  const r1 = (await api('/alunos/importar-sed', { token: A, metodo: 'POST', corpo: { linhas } })).dados;
  assert.deepEqual(r1, { turmasCriadas: 1, criados: 3, atualizados: 0, desativados: 0, ignorados: 0 });
  // Segunda importação: RA sem zeros à esquerda é o mesmo aluno; Gabi saiu da lista e é desativada.
  const r2 = (await api('/alunos/importar-sed', { token: A, metodo: 'POST', corpo: {
    desativarAusentes: true, linhas: [{ turma: '8º Ano B', nome: 'Eduarda Nunes', ra: '123456789' }, { turma: '8º Ano B', nome: 'Felipe Ramos', ra: '123456790' }] } })).dados;
  assert.equal(r2.atualizados, 2);
  assert.equal(r2.desativados, 1);
  const turma = (await api('/turmas', { token: A })).dados.find((t) => t.nome === '8º Ano B');
  const alunos = (await api(`/alunos?turma_id=${turma.id}`, { token: A })).dados;
  assert.equal(alunos.length, 2);
  const edu = (await api(`/alunos/${alunos.find((a) => /EDUARDA/.test(a.nome)).id}`, { token: A })).dados;
  assert.equal(edu.telefone, '12988887777', 'contato mantido (planilha nova veio sem telefone)');
  assert.equal(edu.data_nascimento, '2012-03-12');
  assert.equal((await api(`/alunos/${edu.id}`, { token: profA })).status, 403, 'contato é só da gestão');
  assert.equal((await api(`/alunos/${edu.id}`, { token: B })).status, 404);
  assert.equal((await api(`/alunos/${edu.id}/contato`, { token: A, metodo: 'PUT', corpo: { telefone: '123' } })).status, 400);
});

test('Carômetro: fotos por turma, só a gestão envia, isolamento entre escolas', async () => {
  const foto = 'data:image/jpeg;base64,' + Buffer.from('foto-de-teste').toString('base64');
  const aluno = alunosA[0];
  assert.equal((await api(`/alunos/${aluno.id}/foto`, { token: profA, metodo: 'PUT', corpo: { imagem: foto } })).status, 403);
  assert.equal((await api(`/alunos/${aluno.id}/foto`, { token: B, metodo: 'PUT', corpo: { imagem: foto } })).status, 404);
  assert.equal((await api(`/alunos/${aluno.id}/foto`, { token: A, metodo: 'PUT', corpo: { imagem: 'data:text/html;base64,PGI+' } })).status, 400);
  assert.equal((await api(`/alunos/${aluno.id}/foto`, { token: A, metodo: 'PUT', corpo: { imagem: foto } })).status, 200);
  const c = (await api(`/turmas/${turmaA}/carometro`, { token: profA })).dados;
  assert.equal(c.alunos.find((a) => a.id === aluno.id).foto, foto);
  assert.equal((await api(`/turmas/${turmaA}/carometro`, { token: B })).status, 404);
});

test('Busca ativa: abrir caso, lote, WhatsApp/ações, situação e permissões', async () => {
  const [a1, a2] = alunosA;
  assert.equal((await api('/busca-ativa', { token: profA })).status, 403);
  const r = await api('/busca-ativa', { token: A, metodo: 'POST', corpo: {
    aluno_id: a1.id, faltas: 6, periodo_inicio: '2026-10-01', periodo_fim: '2026-10-10', responsavel: 'Mãe da Ana', telefone: '+55 (12) 99999-0000', risco: 'medio' } });
  assert.equal(r.status, 201, JSON.stringify(r.dados));
  assert.equal((await api('/busca-ativa', { token: A, metodo: 'POST', corpo: { aluno_id: a1.id, faltas: 2 } })).status, 409);
  // O contato informado vai para o cadastro do aluno.
  assert.equal((await api(`/alunos/${a1.id}`, { token: A })).dados.telefone, '12999990000');
  const lote = (await api('/busca-ativa/lote', { token: A, metodo: 'POST', corpo: { itens: [{ aluno_id: a1.id, faltas: 1 }, { aluno_id: a2.id, faltas: 4 }] } })).dados;
  assert.equal(lote.criados, 1);
  assert.equal(lote.jaExistiam.length, 1);
  // Escola B não usa aluno da A nem vê o caso.
  assert.equal((await api('/busca-ativa', { token: B, metodo: 'POST', corpo: { aluno_id: a2.id } })).status, 400);
  assert.equal((await api(`/busca-ativa/${r.dados.id}`, { token: B })).status, 404);
  // Abrir o WhatsApp registra a ação e muda a situação para "família contatada".
  const ac = (await api(`/busca-ativa/${r.dados.id}/acoes`, { token: A, metodo: 'POST', corpo: { tipo: 'whatsapp', resultado: 'Mensagem aberta no WhatsApp' } })).dados;
  assert.equal(ac.status, 'contato');
  await api(`/busca-ativa/${r.dados.id}`, { token: A, metodo: 'PUT', corpo: { status: 'retornou' } });
  const det = (await api(`/busca-ativa/${r.dados.id}`, { token: A })).dados;
  assert.equal(det.status, 'retornou');
  assert.equal(det.acoes.length, 2);
  // Casos encerrados saem da lista padrão.
  assert.ok(!(await api('/busca-ativa', { token: A })).dados.some((b) => b.id === r.dados.id));
  assert.ok((await api('/busca-ativa?status=todos', { token: A })).dados.some((b) => b.id === r.dados.id));
});

test('Chat da ocorrência e avisos para a gestão', async () => {
  const profC = await criarUsuario(A, 'escola-a', 'prof3', 'professor');
  const coord = await criarUsuario(A, 'escola-a', 'coord1', 'coordenador');
  const inicio = (await api('/notificacoes', { token: coord })).dados;
  const tipo = (await api('/tipos', { token: profC })).dados.find((t) => t.codigo === 'A1');
  const occ = (await api('/ocorrencias', { token: profC, metodo: 'POST', corpo: {
    tipo_id: tipo.id, data: '2026-11-09', hora: '08:00', local: 'Sala de aula', relato: 'Saiu da sala sem permissão durante a explicação.',
    alunos: [{ id: alunosA[1].id }] } })).dados;
  // A gestão recebe o aviso da nova ocorrência (pop-up).
  const n1 = (await api(`/notificacoes?desde=${encodeURIComponent(inicio.agora)}&ultimaMsg=${inicio.ultimaMsg}`, { token: coord })).dados;
  assert.ok(n1.novas.some((x) => x.id === occ.id));
  // Professor que registrou escreve; coordenação lê e responde.
  assert.equal((await api(`/ocorrencias/${occ.id}/chat`, { token: profC, metodo: 'POST', corpo: { texto: 'Preciso de apoio da coordenação.' } })).status, 201);
  const n2 = (await api(`/notificacoes?desde=${encodeURIComponent(n1.agora)}&ultimaMsg=${n1.ultimaMsg}`, { token: coord })).dados;
  assert.equal(n2.mensagens.length, 1);
  assert.equal(n2.naoLidas[occ.id], 1);
  const msgs = (await api(`/ocorrencias/${occ.id}/chat`, { token: coord })).dados;
  assert.equal(msgs.length, 1);
  assert.equal(msgs[0].minha, false);
  assert.equal((await api('/notificacoes', { token: coord })).dados.naoLidas[occ.id], undefined, 'abrir o chat marca como lido');
  await api(`/ocorrencias/${occ.id}/chat`, { token: coord, metodo: 'POST', corpo: { texto: 'Estou indo à sala.' } });
  assert.equal((await api('/notificacoes', { token: profC })).dados.naoLidas[occ.id], 1);
  // Outro professor e outra escola não entram no chat.
  assert.equal((await api(`/ocorrencias/${occ.id}/chat`, { token: profA })).status, 404);
  assert.equal((await api(`/ocorrencias/${occ.id}/chat`, { token: B, metodo: 'POST', corpo: { texto: 'x' } })).status, 404);
  // Professor não recebe aviso de ocorrências dos outros.
  assert.equal((await api(`/notificacoes?desde=${encodeURIComponent(inicio.agora)}`, { token: profA })).dados.novas.length, 0);
  // Sem chaves VAPID, a notificação do sistema fica desligada (o pop-up continua).
  assert.equal((await api('/push/chave', { token: coord })).dados.ativo, false);
});

test('PDF da ocorrência', async () => {
  const id = (await api('/ocorrencias?status=todas', { token: A })).dados[0].id;
  const r = await fetch(`${base}/ocorrencias/${id}/pdf`, { headers: { Authorization: `Bearer ${A}` } });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('content-type'), 'application/pdf');
  const buf = Buffer.from(await r.arrayBuffer());
  assert.equal(buf.subarray(0, 5).toString(), '%PDF-');
  assert.ok(buf.length > 2000);
  assert.equal((await fetch(`${base}/ocorrencias/${id}/pdf`, { headers: { Authorization: `Bearer ${B}` } })).status, 404);
});

test('Usuários: lista com RG/CIN, senha provisória com troca obrigatória e nova senha pela coordenação/POC', async () => {
  const lista = [
    { nome: 'Paula Reis', documento: '12.345.678-X' },
    { nome: 'Rui Alves', documento: '123.456.789-09', perfil: 'agente' },
    { nome: 'Sem Doc', documento: '' },
    { nome: 'Paula Reis 2', documento: '12345678x' },
  ];
  assert.equal((await api('/usuarios/lote', { token: profA, metodo: 'POST', corpo: { usuarios: lista } })).status, 403);
  assert.equal((await api('/usuarios/lote', { token: A, metodo: 'POST', corpo: { usuarios: lista, senhaComum: 'fraca' } })).status, 400);
  const r = (await api('/usuarios/lote', { token: A, metodo: 'POST', corpo: { usuarios: lista, senhaComum: 'Escola2026' } })).dados;
  assert.equal(r.criados.length, 2);
  assert.equal(r.ignorados.length, 2, 'sem documento e documento repetido');
  assert.deepEqual(r.criados.map((c) => c.login), ['12345678x', '12345678909']);
  assert.equal(r.criados[1].perfil, 'agente');
  // Entra com o RG digitado com pontuação; a troca de senha é obrigatória.
  const l = (await api('/login', { metodo: 'POST', corpo: { codigo: 'escola-a', login: '12.345.678-X', senha: 'Escola2026' } })).dados;
  assert.equal(l.usuario.trocar_senha, true);
  assert.equal((await api('/ocorrencias', { token: l.token })).status, 403);
  await api('/minha-senha', { token: l.token, metodo: 'POST', corpo: { atual: 'Escola2026', nova: 'Paula2026x' } });
  assert.equal((await api('/eu', { token: l.token })).dados.usuario.tutorial_visto, false);
  await api('/tutorial-visto', { token: l.token, metodo: 'POST' });
  assert.equal((await api('/eu', { token: l.token })).dados.usuario.tutorial_visto, true);
  // A mensagem de erro de login orienta a procurar a direção/coordenação.
  assert.match((await api('/login', { metodo: 'POST', corpo: { codigo: 'escola-a', login: '12345678x', senha: 'errada' } })).dados.erro, /direção ou a coordenação/);

  // Coordenação gera nova senha para professor/agente, mas não para a direção.
  const coord = await criarUsuario(A, 'escola-a', 'coord2', 'coordenador');
  const poc = await criarUsuario(A, 'escola-a', 'poc1', 'poc');
  const equipe = (await api('/equipe', { token: coord })).dados;
  assert.ok(equipe.every((u) => ['professor', 'agente'].includes(u.perfil)));
  const paula = equipe.find((u) => u.login === '12345678x');
  const nova = await api(`/usuarios/${paula.id}/resetar-senha`, { token: poc, metodo: 'POST' });
  assert.equal(nova.status, 200);
  const l2 = (await api('/login', { metodo: 'POST', corpo: { codigo: 'escola-a', login: '12345678x', senha: nova.dados.senhaProvisoria } })).dados;
  assert.equal(l2.usuario.trocar_senha, true, 'nova senha provisória exige troca');
  const diretora = (await api('/usuarios', { token: A })).dados.find((u) => u.login === 'diretora');
  assert.equal((await api(`/usuarios/${diretora.id}/resetar-senha`, { token: coord, metodo: 'POST' })).status, 403);
  assert.equal((await api(`/usuarios/${paula.id}/resetar-senha`, { token: profA, metodo: 'POST' })).status, 403);
  assert.equal((await api(`/usuarios/${paula.id}/resetar-senha`, { token: B, metodo: 'POST' })).status, 404);
  assert.equal((await api('/usuarios', { token: coord })).status, 403, 'coordenação não administra usuários');
});
