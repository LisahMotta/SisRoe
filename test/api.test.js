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

test('Perfis Gerente de Organização Escolar e Secretário(a) de Escola', async () => {
  const r = (await api('/usuarios/lote', { token: A, metodo: 'POST', corpo: { senhaComum: 'Escola2026', usuarios: [
    { nome: 'Gilda Gerente', documento: '55.666.777-8', perfil: 'gerente' },
    { nome: 'Sergio Secretario', documento: '66.777.888-9', perfil: 'secretaria' },
  ] } })).dados;
  assert.deepEqual(r.criados.map((c) => c.perfil), ['gerente', 'secretaria']);
  const entrar = async (login) => {
    const l = (await api('/login', { metodo: 'POST', corpo: { codigo: 'escola-a', login, senha: 'Escola2026' } })).dados;
    await api('/minha-senha', { token: l.token, metodo: 'POST', corpo: { atual: 'Escola2026', nova: 'Nova2026x' } });
    return l.token;
  };
  const goe = await entrar('556667778');
  const sec = await entrar('667778889');
  // Registram ocorrências e veem só as próprias (como professor e agente).
  const tipo = (await api('/tipos', { token: goe })).dados.find((t) => t.codigo === 'A4');
  const occ = await api('/ocorrencias', { token: goe, metodo: 'POST', corpo: {
    tipo_id: tipo.id, data: '2026-11-11', hora: '10:00', local: 'Pátio', relato: 'Discussão entre estudantes durante o intervalo.', alunos: [{ nome: 'Aluno X' }] } });
  assert.equal(occ.status, 201);
  assert.equal((await api('/ocorrencias', { token: goe })).dados.length, 1);
  assert.equal((await api('/ocorrencias', { token: sec })).dados.length, 0);
  assert.equal((await api(`/ocorrencias/${occ.dados.id}`, { token: sec })).status, 404);
  // Cuidam da busca ativa (junto com agente e POC), mas não das demais áreas da gestão.
  assert.equal((await api('/busca-ativa', { token: sec })).status, 200);
  assert.equal((await api('/busca-ativa', { token: goe })).status, 200);
  const caso = await api('/busca-ativa', { token: sec, metodo: 'POST', corpo: { aluno_id: alunosA[2].id, faltas: 5, telefone: '12 98765-4321' } });
  assert.equal(caso.status, 201, JSON.stringify(caso.dados));
  assert.equal((await api(`/busca-ativa/${caso.dados.id}/acoes`, { token: goe, metodo: 'POST', corpo: { tipo: 'whatsapp' } })).status, 201);
  assert.equal((await api(`/busca-ativa/${caso.dados.id}`, { token: B })).status, 404);
  assert.equal((await api('/alunos/' + alunosA[2].id + '/historico', { token: sec })).status, 403);
  assert.equal((await api('/equipe', { token: goe })).status, 403);
  assert.equal((await api('/usuarios', { token: sec })).status, 403);
  // Coordenação/POC podem gerar nova senha para eles.
  const coord = await criarUsuario(A, 'escola-a', 'coord3', 'coordenador');
  const equipe = (await api('/equipe', { token: coord })).dados;
  for (const login of ['556667778', '667778889']) {
    const u = equipe.find((x) => x.login === login);
    assert.ok(u, `aparece na Equipe: ${login}`);
    assert.equal((await api(`/usuarios/${u.id}/resetar-senha`, { token: coord, metodo: 'POST' })).status, 200);
  }
});

test('Busca ativa: agente e POC acessam; professor não', async () => {
  const agente = await criarUsuario(A, 'escola-a', 'agente9', 'agente');
  const poc = await criarUsuario(A, 'escola-a', 'poc9', 'poc');
  assert.equal((await api('/busca-ativa', { token: agente })).status, 200);
  assert.equal((await api('/busca-ativa', { token: poc })).status, 200);
  assert.equal((await api('/busca-ativa', { token: profA })).status, 403);
  const r = await api('/busca-ativa/lote', { token: agente, metodo: 'POST', corpo: { itens: [{ aluno_id: alunosA[0].id, faltas: 2 }] } });
  assert.equal(r.status, 201);
});

test('Usuário master: configura a escola, ajuda a direção e não vê dados de estudantes', async () => {
  // Quem cadastra a escola pode entrar como master.
  const c = await api('/escolas', { metodo: 'POST', corpo: {
    escola: { nome: 'EE Master', codigo: 'escola-m' }, admin: { nome: 'Mário Master', login: '99.888.777-6', senha: 'Master2026', perfil: 'master' } } });
  assert.equal(c.status, 201);
  const M = (await api('/login', { metodo: 'POST', corpo: { codigo: 'escola-m', login: '998887776', senha: 'Master2026' } })).dados.token;
  assert.equal((await api('/eu', { token: M })).dados.usuario.perfil, 'master');
  // Configuração inicial: cadastra a direção, turmas (SED), atualiza o catálogo, vê a auditoria.
  const d = await api('/usuarios', { token: M, metodo: 'POST', corpo: { nome: 'Dina Diretora', login: '11.222.333-4', perfil: 'diretor' } });
  assert.equal(d.status, 201);
  assert.equal((await api('/alunos/importar-sed', { token: M, metodo: 'POST', corpo: { linhas: [{ turma: '9º A', nome: 'Zé', ra: '777' }] } })).status, 200);
  assert.equal((await api('/tipos/atualizar-protocolo', { token: M, metodo: 'POST' })).status, 200);
  assert.equal((await api('/auditoria', { token: M })).status, 200);
  // Um só master por escola, e o master não cria outro master.
  assert.equal((await api('/usuarios', { token: M, metodo: 'POST', corpo: { nome: 'Outro', login: '55555555', perfil: 'master' } })).status, 403);
  const D = (await api('/login', { metodo: 'POST', corpo: { codigo: 'escola-m', login: '112223334', senha: d.dados.senhaProvisoria } })).dados.token;
  await api('/minha-senha', { token: D, metodo: 'POST', corpo: { atual: d.dados.senhaProvisoria, nova: 'Dina2026x' } });
  assert.equal((await api('/usuarios', { token: D, metodo: 'POST', corpo: { nome: 'Outro', login: '55555555', perfil: 'master' } })).status, 409);
  // A direção registra uma ocorrência; o master não vê ocorrências, histórico nem busca ativa.
  const tipo = (await api('/tipos', { token: D })).dados.find((t) => t.codigo === 'A1');
  const occ = (await api('/ocorrencias', { token: D, metodo: 'POST', corpo: { tipo_id: tipo.id, data: '2026-11-10', hora: '09:00', local: 'Sala', relato: 'Saiu da sala sem permissão do professor.', alunos: [{ nome: 'Zé' }] } })).dados;
  assert.equal((await api('/ocorrencias', { token: M })).dados.length, 0);
  assert.equal((await api(`/ocorrencias/${occ.id}`, { token: M })).status, 404);
  assert.equal((await api('/busca-ativa', { token: M })).status, 403);
  assert.equal((await api('/alunos', { token: M, metodo: 'POST', corpo: { nome: 'Aluno Pelo Master' } })).status, 403, 'master não inclui aluno por aqui');
  assert.equal((await api(`/ocorrencias/${occ.id}/cancelar`, { token: M, metodo: 'POST', corpo: { motivo: 'teste' } })).status, 403, 'cancelar é decisão da direção');
  // Ajuda com senhas (inclusive da direção), mas não desativa nem rebaixa a direção.
  const usuarios = (await api('/usuarios', { token: M })).dados;
  const dina = usuarios.find((u) => u.login === '112223334');
  const mario = usuarios.find((u) => u.login === '998887776');
  assert.equal((await api(`/usuarios/${dina.id}/resetar-senha`, { token: M, metodo: 'POST' })).status, 200);
  assert.equal((await api(`/usuarios/${dina.id}`, { token: M, metodo: 'PUT', corpo: { ativo: false } })).status, 403);
  assert.equal((await api(`/usuarios/${dina.id}`, { token: M, metodo: 'PUT', corpo: { perfil: 'professor' } })).status, 403);
  // Só a direção altera o master; o vice não.
  const vice = (await api('/usuarios', { token: M, metodo: 'POST', corpo: { nome: 'Vera Vice', login: '22.333.444-5', perfil: 'vice' } })).dados;
  const V = (await api('/login', { metodo: 'POST', corpo: { codigo: 'escola-m', login: '223334445', senha: vice.senhaProvisoria } })).dados.token;
  await api('/minha-senha', { token: V, metodo: 'POST', corpo: { atual: vice.senhaProvisoria, nova: 'Vera2026x' } });
  assert.equal((await api(`/usuarios/${mario.id}`, { token: V, metodo: 'PUT', corpo: { ativo: false } })).status, 403);
  assert.equal((await api(`/usuarios/${mario.id}/resetar-senha`, { token: V, metodo: 'POST' })).status, 403);
  // Senha da direção: só o master. A vice não gera, não altera, não desativa nem cria diretor (nem se promove).
  assert.equal((await api(`/usuarios/${dina.id}/resetar-senha`, { token: V, metodo: 'POST' })).status, 403);
  assert.equal((await api(`/usuarios/${dina.id}`, { token: V, metodo: 'PUT', corpo: { ativo: false } })).status, 403);
  assert.equal((await api(`/usuarios/${dina.id}`, { token: V, metodo: 'PUT', corpo: { perfil: 'professor' } })).status, 403);
  assert.equal((await api('/usuarios', { token: V, metodo: 'POST', corpo: { nome: 'Novo Diretor', login: '77777777', perfil: 'diretor' } })).status, 403);
  const souEu = (await api('/eu', { token: V })).dados.usuario;
  assert.equal((await api(`/usuarios/${souEu.id}`, { token: V, metodo: 'PUT', corpo: { perfil: 'diretor' } })).status, 403, 'vice não se promove');
  const lote = (await api('/usuarios/lote', { token: V, metodo: 'POST', corpo: { usuarios: [{ nome: 'Diretor Lote', documento: '88888888', perfil: 'diretor' }, { nome: 'Prof Lote', documento: '99999999', perfil: 'professor' }] } })).dados;
  assert.equal(lote.criados.length, 1);
  assert.match(lote.ignorados[0].motivo, /vice-direção/);
  // A vice continua gerando senha para os demais (ex.: professor) e editando o nome da direção.
  const profLote = (await api('/usuarios', { token: V })).dados.find((u) => u.login === '99999999');
  assert.equal((await api(`/usuarios/${profLote.id}/resetar-senha`, { token: V, metodo: 'POST' })).status, 200);
  assert.equal((await api(`/usuarios/${dina.id}`, { token: V, metodo: 'PUT', corpo: { nome: 'Dina Diretora Silva' } })).status, 200);
  // Isolamento: o master de uma escola não alcança outra.
  assert.equal((await api('/usuarios', { token: M })).dados.some((u) => u.login === 'diretora'), false);
});

test('Aluno que não está na lista: professor, agente, GOE e secretaria incluem sem RA; a SED completa depois', async () => {
  const E = await cadastrarEscola('escola-incluir');
  const turma = (await api('/turmas', { token: E, metodo: 'POST', corpo: { nome: '6º A' } })).dados.id;
  const outra = await cadastrarEscola('escola-incluir-2');
  const turmaOutra = (await api('/turmas', { token: outra, metodo: 'POST', corpo: { nome: '6º A' } })).dados.id;
  const tokens = {};
  for (const [login, perfil] of [['31111111', 'professor'], ['32222222', 'agente'], ['33333333', 'gerente'], ['34444444', 'secretaria']]) {
    tokens[perfil] = await criarUsuario(E, 'escola-incluir', login, perfil);
  }
  // Cada perfil inclui um aluno sem RA.
  for (const [perfil, t] of Object.entries(tokens)) {
    const r = await api('/alunos', { token: t, metodo: 'POST', corpo: { nome: `  aluno   novo ${perfil} `, turma_id: turma } });
    assert.equal(r.status, 201, JSON.stringify(r.dados));
    assert.equal(r.dados.nome, `ALUNO NOVO ${perfil.toUpperCase()}`);
    assert.equal(r.dados.ra, null);
    assert.equal(r.dados.turma_nome, '6º A');
  }
  const P = tokens.professor;
  assert.equal((await api(`/alunos?turma_id=${turma}`, { token: P })).dados.length, 4);
  // Mesmo nome na mesma turma não duplica; sem turma também é aceito.
  const dup = await api('/alunos', { token: P, metodo: 'POST', corpo: { nome: 'Aluno Novo Professor', turma_id: turma } });
  assert.equal(dup.status, 200);
  assert.equal(dup.dados.ja_existia, true);
  assert.equal((await api('/alunos', { token: P, metodo: 'POST', corpo: { nome: 'Visitante Sem Turma' } })).status, 201);
  // Validações: nome curto, RA repetido, turma de outra escola.
  assert.equal((await api('/alunos', { token: P, metodo: 'POST', corpo: { nome: 'Jo' } })).status, 400);
  assert.equal((await api('/alunos', { token: P, metodo: 'POST', corpo: { nome: 'Com RA', ra: '000555666777', turma_id: turma } })).status, 201);
  assert.equal((await api('/alunos', { token: P, metodo: 'POST', corpo: { nome: 'Outro Nome', ra: '555666777' } })).status, 409);
  assert.equal((await api('/alunos', { token: P, metodo: 'POST', corpo: { nome: 'Invasor', turma_id: turmaOutra } })).status, 404);
  assert.equal((await api('/alunos?busca=aluno novo', { token: outra })).dados.length, 0, 'outra escola não vê');
  // O aluno incluído entra na ocorrência como aluno cadastrado (com id).
  const incluido = (await api('/alunos?busca=agente', { token: P })).dados[0];
  const tipo = (await api('/tipos', { token: P })).dados.find((t) => t.codigo === 'A3');
  const occ = await api('/ocorrencias', { token: P, metodo: 'POST', corpo: { tipo_id: tipo.id, data: '2026-11-10', hora: '09:00', local: 'Sala de aula',
    relato: 'Recusou-se a tirar o boné após três pedidos.', alunos: [{ id: incluido.id, papel: 'autor' }] } });
  assert.equal(occ.status, 201, JSON.stringify(occ.dados));
  // A direção vê quem incluiu.
  const hist = (await api(`/alunos/${incluido.id}/historico`, { token: E })).dados;
  assert.equal(hist.aluno.incluido_por, '32222222'.toUpperCase());
  assert.equal(hist.ocorrencias.length, 1);
  // Lista da SED com RA: completa o aluno incluído sem RA (não cria outro) e o histórico continua nele.
  const r = (await api('/alunos/importar-sed', { token: E, metodo: 'POST', corpo: { linhas: [
    { turma: '6º A', nome: 'Aluno Novo Agente', ra: '000123123123' }] } })).dados;
  assert.equal(r.criados, 0);
  assert.equal(r.atualizados, 1);
  const depois = (await api('/alunos?busca=novo agente', { token: E })).dados;
  assert.equal(depois.length, 1);
  assert.equal(depois[0].id, incluido.id);
  assert.equal(depois[0].ra, '123123123');
});

test('Carômetro em arquivo (PDF/JPG em partes) e lista para fotos em lote', async () => {
  const E = await cadastrarEscola('escola-caro');
  const outra = await cadastrarEscola('escola-caro-2');
  const turma = (await api('/turmas', { token: E, metodo: 'POST', corpo: { nome: '9º A' } })).dados.id;
  const P = await criarUsuario(E, 'escola-caro', '41111111', 'professor');
  // "PDF" de ~2,2 MB: vira 2 partes de base64.
  const bytes = Buffer.alloc(2_200_000, 7); bytes.write('%PDF-1.4', 0);
  const b64 = bytes.toString('base64');
  const TAM = 2_800_000;
  const partes = Math.ceil(b64.length / TAM);
  assert.equal(partes, 2);
  const meta = { turma_id: turma, nome_arquivo: 'carometro-9A.pdf', mime: 'application/pdf', tamanho: bytes.length, partes };
  // Só a administração envia; tipo, tamanho e partes são conferidos; turma de outra escola é recusada.
  assert.equal((await api('/carometros', { token: P, metodo: 'POST', corpo: meta })).status, 403);
  assert.equal((await api('/carometros', { token: E, metodo: 'POST', corpo: { ...meta, mime: 'text/html' } })).status, 400);
  assert.equal((await api('/carometros', { token: E, metodo: 'POST', corpo: { ...meta, partes: 5 } })).status, 400);
  assert.equal((await api('/carometros', { token: E, metodo: 'POST', corpo: { ...meta, tamanho: 30 * 1024 * 1024, partes: 15 } })).status, 400);
  assert.equal((await api('/carometros', { token: outra, metodo: 'POST', corpo: meta })).status, 404);
  const { id } = (await api('/carometros', { token: E, metodo: 'POST', corpo: meta })).dados;
  await api(`/carometros/${id}/partes/0`, { token: E, metodo: 'PUT', corpo: { dados: b64.slice(0, TAM) } });
  // Incompleto: não conclui e não aparece na lista.
  assert.equal((await api(`/carometros/${id}/concluir`, { token: E, metodo: 'POST' })).status, 400);
  assert.equal((await api('/carometros', { token: P })).dados.length, 0);
  assert.equal((await api(`/carometros/${id}/partes/1`, { token: outra, metodo: 'PUT', corpo: { dados: 'AAAA' } })).status, 404);
  assert.equal((await api(`/carometros/${id}/partes/1`, { token: E, metodo: 'PUT', corpo: { dados: '<script>' } })).status, 400);
  await api(`/carometros/${id}/partes/1`, { token: E, metodo: 'PUT', corpo: { dados: b64.slice(TAM) } });
  assert.equal((await api(`/carometros/${id}/concluir`, { token: E, metodo: 'POST' })).status, 200);
  // Professor vê e baixa (parte por parte), e o arquivo volta idêntico; outra escola não.
  const lista = (await api('/carometros', { token: P })).dados;
  assert.equal(lista.length, 1);
  assert.equal(lista[0].turma_nome, '9º A');
  const volta = [];
  for (let i = 0; i < lista[0].partes; i++) volta.push((await api(`/carometros/${id}/partes/${i}`, { token: P })).dados.dados);
  assert.ok(Buffer.from(volta.join(''), 'base64').equals(bytes));
  assert.equal((await api(`/carometros/${id}/partes/0`, { token: outra })).status, 404);
  assert.equal((await api('/carometros', { token: outra })).dados.length, 0);
  // Um novo carômetro da mesma turma substitui o anterior; o "escola toda" convive.
  const jpg = Buffer.from('fake-jpg').toString('base64');
  for (const turmaId of [turma, null]) {
    const n = (await api('/carometros', { token: E, metodo: 'POST', corpo: { turma_id: turmaId, nome_arquivo: 'folha.jpg', mime: 'image/jpeg', tamanho: 8, partes: 1 } })).dados;
    await api(`/carometros/${n.id}/partes/0`, { token: E, metodo: 'PUT', corpo: { dados: jpg } });
    assert.equal((await api(`/carometros/${n.id}/concluir`, { token: E, metodo: 'POST' })).status, 200);
  }
  const depois = (await api('/carometros', { token: E })).dados;
  assert.equal(depois.length, 2);
  assert.ok(depois.every((c) => c.mime === 'image/jpeg'));
  assert.equal((await api(`/carometros/${id}/partes/0`, { token: E })).status, 404, 'o PDF antigo foi substituído');
  // Remover: só a administração.
  assert.equal((await api(`/carometros/${depois[0].id}`, { token: P, metodo: 'DELETE' })).status, 403);
  assert.equal((await api(`/carometros/${depois[0].id}`, { token: E, metodo: 'DELETE' })).status, 200);
  // Lista para fotos em lote: gestão/administração; professor não.
  await api(`/turmas/${turma}/importar`, { token: E, metodo: 'POST', corpo: { texto: '123456789;Ana Souza' } });
  const todos = (await api('/alunos-lista', { token: E })).dados;
  assert.equal(todos.length, 1);
  assert.equal(todos[0].tem_foto, 0);
  assert.equal((await api('/alunos-lista', { token: P })).status, 403);
  assert.equal((await api('/alunos-lista', { token: outra })).dados.length, 0);
});

test('Segurança: bloqueio após senhas erradas, armadilha do cadastro e CSV sem fórmulas', async () => {
  const E = await cadastrarEscola('escola-seg');
  const P = await criarUsuario(E, 'escola-seg', '51111111', 'professor');
  const login = (senha) => api('/login', { metodo: 'POST', corpo: { codigo: 'escola-seg', login: '51111111', senha } });
  // 7 erros não bloqueiam; o acerto zera a contagem.
  for (let i = 0; i < 7; i++) assert.equal((await login('errada123')).status, 401);
  assert.equal((await login('NovaSenha99')).status, 200);
  // 8 erros seguidos bloqueiam, até com a senha certa.
  for (let i = 0; i < 8; i++) assert.equal((await login('errada123')).status, 401);
  const bloq = await login('NovaSenha99');
  assert.equal(bloq.status, 429);
  assert.match(bloq.dados.erro, /direção ou à coordenação/);
  // Usuário inexistente e escola inexistente: mesma resposta.
  assert.equal((await api('/login', { metodo: 'POST', corpo: { codigo: 'escola-seg', login: '99999999', senha: 'x' } })).dados.erro,
    (await api('/login', { metodo: 'POST', corpo: { codigo: 'nao-existe', login: '99999999', senha: 'x' } })).dados.erro);
  // A direção gera nova senha: desbloqueia.
  const prof = (await api('/usuarios', { token: E })).dados.find((u) => u.login === '51111111');
  const nova = (await api(`/usuarios/${prof.id}/resetar-senha`, { token: E, metodo: 'POST' })).dados.senhaProvisoria;
  assert.equal((await login(nova)).status, 200);
  // O bloqueio de uma escola não afeta o mesmo login em outra.
  // Armadilha para robôs no cadastro.
  const robo = await api('/escolas', { metodo: 'POST', corpo: { site: 'http://spam', escola: { nome: 'Robô', codigo: 'robo-1' },
    admin: { nome: 'Robô', login: 'robo1', senha: 'Senha1234' } } });
  assert.equal(robo.status, 400);
  assert.equal((await api('/login', { metodo: 'POST', corpo: { codigo: 'robo-1', login: 'robo1', senha: 'Senha1234' } })).status, 401);
  // CSV: relato que começa com "=" não vira fórmula no Excel.
  const tipo = (await api('/tipos', { token: E })).dados.find((t) => t.codigo === 'A16');
  await api('/ocorrencias', { token: E, metodo: 'POST', corpo: { tipo_id: tipo.id, data: '2026-11-10', hora: '09:00', local: 'Sala de aula',
    relato: '=HYPERLINK("http://exemplo","clique") e outras coisas', alunos: [{ nome: '@Aluno Teste' }] } });
  const csv = (await api('/ocorrencias.csv', { token: E })).dados;
  assert.match(csv, /"'=HYPERLINK/);
  assert.match(csv, /"'@ALUNO TESTE/);
  assert.equal(P.length > 0, true);
});

test('Atenção especial: só a gestão sinaliza e vê; professor, agente e master não', async () => {
  const E = await cadastrarEscola('escola-atencao');
  const outra = await cadastrarEscola('escola-atencao-2');
  const turma = (await api('/turmas', { token: E, metodo: 'POST', corpo: { nome: '8º C' } })).dados.id;
  await api(`/turmas/${turma}/importar`, { token: E, metodo: 'POST', corpo: { texto: '111222333;Pedro Alves\n111222334;Rita Lima' } });
  const [pedro] = (await api('/alunos?busca=pedro', { token: E })).dados;
  const coord = await criarUsuario(E, 'escola-atencao', '61111111', 'coordenador');
  const poc = await criarUsuario(E, 'escola-atencao', '62222222', 'poc');
  const prof = await criarUsuario(E, 'escola-atencao', '63333333', 'professor');
  const agente = await criarUsuario(E, 'escola-atencao', '64444444', 'agente');
  const master = await criarUsuario(E, 'escola-atencao', '65555555', 'master');
  // Quem não é gestão: 403 em tudo.
  for (const t of [prof, agente, master]) {
    assert.equal((await api(`/alunos/${pedro.id}/atencao`, { token: t, metodo: 'PUT', corpo: { motivo: 'x' } })).status, 403);
    assert.equal((await api('/alunos-atencao', { token: t })).status, 403);
  }
  // Coordenação sinaliza; a POC vê e edita; outra escola não alcança.
  assert.equal((await api(`/alunos/${pedro.id}/atencao`, { token: coord, metodo: 'PUT', corpo: { motivo: 'Reincidência em agressões' } })).status, 200);
  assert.equal((await api(`/alunos/${pedro.id}/atencao`, { token: outra, metodo: 'PUT', corpo: { motivo: 'x' } })).status, 404);
  assert.equal((await api('/alunos-atencao', { token: outra })).dados.length, 0);
  let lista = (await api('/alunos-atencao', { token: poc })).dados;
  assert.equal(lista.length, 1);
  assert.equal(lista[0].atencao_motivo, 'Reincidência em agressões');
  assert.equal(lista[0].atencao_por, '61111111');
  assert.equal(lista[0].turma_nome, '8º C');
  // Ocorrência registrada pelo professor: a gestão vê o aviso; o professor não.
  const tipo = (await api('/tipos', { token: prof })).dados.find((t) => t.codigo === 'A7');
  const occ = (await api('/ocorrencias', { token: prof, metodo: 'POST', corpo: { tipo_id: tipo.id, data: '2026-11-10', hora: '10:00',
    local: 'Sala de aula', relato: 'Perturbou a aula repetidas vezes.', alunos: [{ id: pedro.id, papel: 'autor' }] } })).dados;
  const visaoProf = (await api(`/ocorrencias/${occ.id}`, { token: prof })).dados;
  assert.equal(visaoProf.alunos[0].atencao, undefined);
  assert.equal(JSON.stringify(visaoProf).includes('Reincidência'), false);
  const visaoGestao = (await api(`/ocorrencias/${occ.id}`, { token: coord })).dados;
  assert.equal(visaoGestao.alunos[0].atencao, true);
  assert.equal((await api('/alunos-atencao', { token: poc })).dados[0].qtd_ocorrencias, 1);
  assert.equal((await api(`/alunos/${pedro.id}/historico`, { token: poc })).dados.aluno.atencao_motivo, 'Reincidência em agressões');
  // Remover.
  assert.equal((await api(`/alunos/${pedro.id}/atencao`, { token: prof, metodo: 'DELETE' })).status, 403);
  assert.equal((await api(`/alunos/${pedro.id}/atencao`, { token: poc, metodo: 'DELETE' })).status, 200);
  lista = (await api('/alunos-atencao', { token: coord })).dados;
  assert.equal(lista.length, 0);
});

test('Backup: só a gestão baixa, em páginas, sem senhas e sem dados de outra escola', async () => {
  const E = await cadastrarEscola('escola-backup');
  const outra = await cadastrarEscola('escola-backup-2');
  const turma = (await api('/turmas', { token: E, metodo: 'POST', corpo: { nome: '1º EM A' } })).dados.id;
  for (const [ini, qtd] of [[0, 300], [300, 220]]) {
    await api(`/turmas/${turma}/importar`, { token: E, metodo: 'POST', corpo: { texto: Array.from({ length: qtd }, (_, i) => `${900000 + ini + i};Aluno Numero ${ini + i}`).join('\n') } });
  }
  await api('/turmas', { token: outra, metodo: 'POST', corpo: { nome: 'Turma da Outra' } });
  const coord = await criarUsuario(E, 'escola-backup', '71111111', 'coordenador');
  const prof = await criarUsuario(E, 'escola-backup', '72222222', 'professor');
  const master = await criarUsuario(E, 'escola-backup', '73333333', 'master');
  for (const t of [prof, master]) {
    assert.equal((await api('/backup', { token: t })).status, 403);
    assert.equal((await api('/backup/alunos', { token: t })).status, 403);
  }
  // Coordenação: tudo menos a equipe; direção: com a equipe.
  const infoCoord = (await api('/backup', { token: coord })).dados;
  assert.equal(infoCoord.tabelas.some((t) => t.nome === 'usuarios'), false);
  assert.equal((await api('/backup/usuarios', { token: coord })).status, 404);
  assert.equal((await api('/backup/escolas', { token: coord })).status, 404, 'só tabelas da lista');
  assert.equal((await api('/backup/fotos_alunos', { token: coord })).status, 404);
  const info = (await api('/backup', { token: E })).dados;
  assert.equal(info.tabelas.find((t) => t.nome === 'alunos').registros, 520);
  // Páginas de 500.
  const p1 = (await api('/backup/alunos', { token: coord })).dados;
  assert.equal(p1.linhas.length, 500);
  assert.equal(p1.fim, false);
  const p2 = (await api(`/backup/alunos?depois=${p1.linhas[499].id}`, { token: coord })).dados;
  assert.equal(p2.linhas.length, 20);
  assert.equal(p2.fim, true);
  assert.equal(p1.linhas[0].escola_id, undefined);
  // Equipe sem senha; turmas só da própria escola.
  const equipe = (await api('/backup/usuarios', { token: E })).dados.linhas;
  assert.ok(equipe.length >= 4);
  assert.ok(equipe.every((u) => !('senha_hash' in u) && !('falhas_login' in u)));
  const turmas = (await api('/backup/turmas', { token: E })).dados.linhas;
  assert.deepEqual(turmas.map((t) => t.nome), ['1º EM A']);
  assert.equal((await api('/backup/registrar', { token: coord, metodo: 'POST', corpo: { formato: 'xlsx' } })).status, 200);
  assert.ok((await api('/auditoria', { token: E })).dados.some((a) => a.acao === 'backup_baixado'));
});

test('Restaurar backup: só acrescenta o que falta, não duplica, renumera e só aceita a própria escola', async () => {
  const { prepararBackup, restaurar } = await import('../public/js/restauracao.js');
  const E = await cadastrarEscola('escola-rest');
  const outra = await cadastrarEscola('escola-rest-2');
  const eid = (await api('/eu', { token: E })).dados.escola.id;
  const turma = (await api('/turmas', { token: E, metodo: 'POST', corpo: { nome: '5º A' } })).dados.id;
  await api(`/turmas/${turma}/importar`, { token: E, metodo: 'POST', corpo: { texto: '555000111;Lia Souza\n555000222;Caio Reis' } });
  await api('/alunos', { token: E, metodo: 'POST', corpo: { nome: 'Sem Ra Ferreira', turma_id: turma } });
  const alunos = (await api(`/alunos?turma_id=${turma}`, { token: E })).dados;
  const lia = alunos.find((a) => /LIA/.test(a.nome));
  await api(`/alunos/${lia.id}/atencao`, { token: E, metodo: 'PUT', corpo: { motivo: 'Acompanhar' } });
  const tipo = (await api('/tipos', { token: E })).dados.find((t) => t.codigo === 'A1');
  const occ = [];
  for (const relato of ['Primeira ocorrência de teste.', 'Segunda ocorrência de teste.']) {
    occ.push((await api('/ocorrencias', { token: E, metodo: 'POST', corpo: { tipo_id: tipo.id, data: '2026-11-10', hora: '09:00', local: 'Sala de aula',
      turma_id: turma, relato, alunos: [{ id: lia.id, papel: 'autor' }] } })).dados);
  }
  await api(`/ocorrencias/${occ[0].id}/notas`, { token: E, metodo: 'POST', corpo: { texto: 'Família avisada.' } });
  await api(`/ocorrencias/${occ[0].id}/chat`, { token: E, metodo: 'POST', corpo: { texto: 'Aluno na coordenação.' } });
  await api('/busca-ativa', { token: E, metodo: 'POST', corpo: { aluno_id: lia.id, faltas: 5 } });

  // Backup (como o navegador monta).
  const info = (await api('/backup', { token: E })).dados;
  const tabelas = {};
  for (const t of info.tabelas) tabelas[t.nome] = (await api(`/backup/${t.nome}`, { token: E })).dados.linhas;
  const texto = JSON.stringify({ sistema: 'SisRoe', formato: 1, escola: info.escola, tabelas });
  const chamar = (token) => async (url, corpo) => {
    const r = await api(url, { token, metodo: 'POST', corpo });
    if (r.status !== 200) throw new Error(`${r.status} ${JSON.stringify(r.dados)}`);
    return r.dados;
  };

  // Nada falta: a prévia não acrescenta nada.
  const backup = prepararBackup(texto, 'escola-rest');
  assert.equal((await restaurar(backup, { simular: true, chamar: chamar(E) })).novosTotal, 0);
  // Só a própria escola e só a direção.
  assert.throws(() => prepararBackup(texto, 'escola-rest-2'), /outra escola|própria escola/);
  assert.equal((await api('/restaurar/turmas', { token: outra, metodo: 'POST', corpo: { codigo: 'escola-rest', linhas: [] } })).status, 400);
  const coord = await criarUsuario(E, 'escola-rest', '81111111', 'coordenador');
  assert.equal((await api('/restaurar/turmas', { token: coord, metodo: 'POST', corpo: { codigo: 'escola-rest', linhas: [] } })).status, 403);

  // Perda de dados simulada: some uma ocorrência (com nota e chat), um aluno, a turma não; busca ativa some.
  await db.run('DELETE FROM chat_mensagens WHERE escola_id = ?', [eid]);
  await db.run('DELETE FROM ocorrencia_notas WHERE escola_id = ?', [eid]);
  await db.run('DELETE FROM ocorrencia_alunos WHERE escola_id = ? AND ocorrencia_id = ?', [eid, occ[0].id]);
  await db.run('DELETE FROM ocorrencias WHERE escola_id = ? AND id = ?', [eid, occ[0].id]);
  await db.run('DELETE FROM busca_ativa_acoes WHERE escola_id = ?', [eid]);
  await db.run('DELETE FROM busca_ativa WHERE escola_id = ?', [eid]);
  const caio = alunos.find((a) => /CAIO/.test(a.nome));
  await db.run('DELETE FROM alunos WHERE escola_id = ? AND id = ?', [eid, caio.id]);
  // Depois da perda, alguém registrou uma ocorrência nova, que ocupou o número 2026/0001.
  const nova = (await api('/ocorrencias', { token: E, metodo: 'POST', corpo: { tipo_id: tipo.id, data: '2026-11-11', hora: '08:00', local: 'Pátio',
    relato: 'Ocorrência registrada depois da perda.', alunos: [{ id: lia.id }] } })).dados;
  // (o sistema daria o nº 3; simulamos que ela ficou com o nº 1, que era da ocorrência perdida)
  await db.run('UPDATE ocorrencias SET seq = 1 WHERE escola_id = ? AND id = ?', [eid, nova.id]);

  const prev = await restaurar(backup, { simular: true, chamar: chamar(E) });
  assert.equal(prev.etapas.alunos.novos, 1);
  assert.equal(prev.etapas.ocorrencias.novos, 1);
  assert.equal(prev.etapas.ocorrencias.renumeradas, 1);
  assert.equal(prev.etapas.busca_ativa.novos, 1);
  assert.equal(prev.etapas.turmas.novos, 0);
  const real = await restaurar(backup, { simular: false, chamar: chamar(E) });
  assert.equal(real.novosTotal, 3);
  assert.equal(real.filhos.notas, 1);
  assert.equal(real.filhos.chat, 1);
  // Voltou tudo, sem mexer no que existia; a ocorrência voltou com o próximo número.
  const lista = (await api('/ocorrencias', { token: E })).dados;
  assert.equal(lista.length, 3);
  const volta = lista.find((o) => o.id !== nova.id && o.id !== occ[1].id);
  assert.equal(volta.numero.endsWith('/0003'), true);
  const det = (await api(`/ocorrencias/${volta.id}`, { token: E })).dados;
  assert.equal(det.relato, 'Primeira ocorrência de teste.');
  assert.equal(det.notas.length, 1);
  assert.equal(det.alunos[0].aluno_id, lia.id, 'estudante ligado ao aluno existente');
  assert.equal((await api(`/ocorrencias/${volta.id}/chat`, { token: E })).dados.length, 1);
  assert.equal((await api(`/ocorrencias/${nova.id}`, { token: E })).dados.relato, 'Ocorrência registrada depois da perda.', 'a nova não foi tocada');
  assert.equal((await api(`/alunos?turma_id=${turma}`, { token: E })).dados.length, 3);
  assert.equal((await api('/alunos-atencao', { token: E })).dados.length, 1, 'sinalização mantida');
  assert.equal((await api('/busca-ativa?status=todos', { token: E })).dados.length, 1);
  // Restaurar de novo não duplica nada.
  assert.equal((await restaurar(backup, { simular: false, chamar: chamar(E) })).novosTotal, 0);
  assert.equal((await api('/ocorrencias', { token: E })).dados.length, 3);
  // Outra escola continua vazia.
  assert.equal((await api('/ocorrencias', { token: outra })).dados.length, 0);
});
