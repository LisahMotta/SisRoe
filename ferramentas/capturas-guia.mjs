// capturas-guia.mjs — gera as imagens do guia "Como registrar uma ocorrência" (public/img/guia).
// Sobe o SisRoe com um banco temporário, cria uma escola fictícia e fotografa as telas com o Playwright.
// Uso: node ferramentas/capturas-guia.mjs   (precisa do Playwright com o Chromium instalado)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SAIDA = path.join(RAIZ, 'public/img/guia');
const PASTA = fs.mkdtempSync(path.join(os.tmpdir(), 'sisroe-guia-'));
const DBF = path.join(PASTA, 'guia.db');
fs.rmSync(DBF, { force: true });
fs.mkdirSync(SAIDA, { recursive: true });
const PORTA = 3917;
const URL0 = `http://localhost:${PORTA}`;

const srv = spawn('node', ['server/index.js'], {
  cwd: RAIZ, env: { ...process.env, PORT: PORTA, SQLITE_FILE: DBF, JWT_SECRET: 'guia-segredo-1234567890', NODE_ENV: 'test', DATABASE_URL: '' },
  stdio: ['ignore', 'pipe', 'inherit'],
});
await new Promise((ok) => srv.stdout.on('data', (d) => { if (String(d).includes('rodando')) ok(); }));

async function api(caminho, corpo, token, metodo = 'POST') {
  const r = await fetch(URL0 + '/api' + caminho, {
    method: metodo, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const j = await r.json();
  if (!r.ok) throw new Error(caminho + ': ' + JSON.stringify(j));
  return j;
}

try {
  await api('/escolas', { escola: { nome: 'EE Escola Modelo (exemplo)', codigo: 'modelo' }, admin: { nome: 'Diretora Exemplo', login: 'diretora', senha: 'Senha1234' } });
  const { token: td } = await api('/login', { codigo: 'modelo', login: 'diretora', senha: 'Senha1234' });
  const { id: turma } = await api('/turmas', { nome: '7º ano A', periodo: 'Manhã' }, td);
  await api('/turmas', { nome: '8º ano B', periodo: 'Manhã' }, td);
  const nomes = ['ANA BEATRIZ SOUZA', 'BRUNO HENRIQUE LIMA', 'CARLA DIAS FERREIRA', 'DANIEL ROCHA ALVES', 'EDUARDA MARTINS COSTA',
    'FELIPE GOMES SILVA', 'GABRIELA NUNES PEREIRA', 'HEITOR CARVALHO RAMOS', 'ISABELA MOREIRA SANTOS', 'JOÃO PEDRO OLIVEIRA'];
  await api(`/turmas/${turma}/importar`, { texto: nomes.map((n, i) => `${1000 + i};${n}`).join('\n') }, td);
  const prof = await api('/usuarios', { nome: 'Professora Exemplo', login: '12345678', perfil: 'professor' }, td);
  const { token: tp } = await api('/login', { codigo: 'modelo', login: '12345678', senha: prof.senhaProvisoria });
  await api('/minha-senha', { atual: prof.senhaProvisoria, nova: 'Senha1234' }, tp);
  await api('/tutorial-visto', {}, tp);

  const nav = await chromium.launch();
  const pg = await nav.newPage({ viewport: { width: 1180, height: 760 }, deviceScaleFactor: 1.5 });
  const foto = async (nome, alvo, opc = {}) => {
    await pg.waitForTimeout(300);
    const arq = path.join(SAIDA, nome + '.png');
    if (alvo) await pg.locator(alvo).first().screenshot({ path: arq, ...opc });
    else await pg.screenshot({ path: arq, ...opc });
    console.log('ok', nome);
  };
  await pg.goto(URL0 + '/#/login');
  await pg.fill('input[name=codigo]', 'modelo');
  await pg.fill('input[name=login]', '12345678');
  await pg.fill('input[name=senha]', 'Senha1234');
  await pg.click('button[type=submit]');
  await pg.waitForSelector('#lateral:not([hidden])');
  await pg.goto(URL0 + '/#/painel'); await pg.waitForTimeout(600);
  await foto('01-menu', null, { clip: { x: 0, y: 0, width: 1180, height: 420 } });

  await pg.goto(URL0 + '/#/nova'); await pg.waitForSelector('[data-cat]');
  await foto('02-categoria', '#conteudo');

  await pg.click('[data-cat=administrativa]'); await pg.waitForSelector('#busca-tipo');
  await pg.fill('#busca-tipo', 'boné'); await pg.dispatchEvent('#busca-tipo', 'input');
  await foto('03-tipo-busca', '#etapa .cartao');

  await pg.click('[data-cat]').catch(() => {});
  await pg.locator('[data-tipo]:visible').first().click(); await pg.waitForSelector('#form-occ');
  await foto('04-cabecalho', '#form-occ', { clip: undefined });
  // Recorta só a parte de cima (tipo + data/local)
  const box = await pg.locator('#form-occ').boundingBox();
  const fim = await pg.locator('#form-occ fieldset').first().boundingBox();
  await pg.screenshot({ path: path.join(SAIDA, '04-cabecalho.png'), clip: { x: box.x, y: box.y, width: box.width, height: fim.y - box.y - 4 } });

  await pg.selectOption('#sel-turma', { label: '7º ano A (Manhã)' });
  await pg.waitForSelector('.grade-alunos');
  await pg.check('.grade-alunos label:has-text("BRUNO") input');
  await pg.check('.grade-alunos label:has-text("CARLA") input');
  await pg.selectOption('[data-papel]:near(:text("BRUNO HENRIQUE"))', 'autor').catch(() => {});
  const sels = pg.locator('[data-papel]');
  await sels.nth(0).selectOption('autor');
  await sels.nth(1).selectOption('testemunha');
  await foto('05-alunos', '#form-occ fieldset >> nth=0');

  await pg.fill('textarea[name=relato]', 'Às 9h10, durante a aula de Matemática no 7º ano A, o aluno Bruno estava de boné. Pedi três vezes que retirasse, explicando a regra da escola. Na terceira vez ele respondeu: "Não vou tirar". A aluna Carla presenciou. Encaminhei o aluno à coordenação às 9h20.');
  await pg.click('details.dicas summary');
  const r1 = await pg.locator('label:has(textarea[name=relato])').boundingBox();
  const r2 = await pg.locator('details.dicas').boundingBox();
  await pg.screenshot({ path: path.join(SAIDA, '06-relato.png'), clip: { x: r1.x, y: r1.y, width: r1.width, height: r2.y + r2.height - r1.y } });
  console.log('ok 06-relato');

  await pg.locator('fieldset.protocolo input[type=checkbox]').first().check();
  await foto('07-procedimentos', 'fieldset.protocolo');

  await pg.fill('textarea[name=providencias]', 'Aluno encaminhado à coordenação às 9h20.');
  await pg.click('#form-occ [type=submit]');
  await pg.waitForURL(/ocorrencia\/\d+/); await pg.waitForTimeout(1200);
  await foto('08-registrada', null);
  await nav.close();
} finally {
  srv.kill();
}
