// routes/publico.js — rotas sem login: cadastro de escola e login.
import express from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import * as db from '../db.js';
import { gerarToken } from '../auth.js';
import { ErroHttp, txt, obrigatorio, senhaForte, MSG_SENHA, rota } from '../util.js';
import { semearTipos } from '../tipos.js';

const r = express.Router();

// Limita tentativas para dificultar adivinhação de senha.
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false,
  message: { erro: 'Muitas tentativas. Aguarde 15 minutos.' },
  skip: () => process.env.NODE_ENV === 'test',
});
const limiteCadastro = rateLimit({
  windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false,
  message: { erro: 'Muitos cadastros a partir deste endereço. Tente mais tarde.' },
  skip: () => process.env.NODE_ENV === 'test',
});

export const normalizarCodigo = (s) => txt(s, 30).toLowerCase().replace(/[^a-z0-9-]/g, '');

/**
 * Login do usuário. Quando é um documento (RG ou CIN/CPF), fica só com os números
 * (e o X final de alguns RGs): "12.345.678-X" e "12345678x" viram o mesmo login.
 * Outros logins seguem a regra de antes (letras, números e hífen).
 */
export function normalizarLogin(s) {
  const t = txt(s, 40).toLowerCase().replace(/\s+/g, '');
  if (/^[\d.\-\/]+x?$/.test(t) && /\d{5,}/.test(t.replace(/\D/g, ''))) return t.replace(/[^\dx]/g, '').slice(0, 30);
  return normalizarCodigo(t);
}

// Informa ao navegador se o cadastro exige chave de convite.
r.get('/config', (req, res) => {
  res.json({ cadastroExigeChave: !!process.env.CADASTRO_CHAVE });
});

// Cadastro de uma escola nova + primeiro usuário (direção).
r.post('/escolas', limiteCadastro, rota(async (req, res) => {
  const b = req.body || {};
  if (process.env.CADASTRO_CHAVE && b.chave !== process.env.CADASTRO_CHAVE) {
    throw new ErroHttp(403, 'Chave de cadastro inválida. Peça a chave a quem administra o sistema.');
  }
  const e = b.escola || {};
  const a = b.admin || {};
  const nome = obrigatorio(e.nome, 'nome da escola', 150);
  const codigo = normalizarCodigo(e.codigo);
  if (codigo.length < 3) throw new ErroHttp(400, 'O código da escola precisa ter ao menos 3 letras ou números (sem espaços).');
  const adminNome = obrigatorio(a.nome, 'seu nome', 120);
  const login = normalizarLogin(a.login);
  if (login.length < 3) throw new ErroHttp(400, 'O usuário precisa ter ao menos 3 letras ou números (sem espaços).');
  if (!senhaForte(a.senha)) throw new ErroHttp(400, MSG_SENHA);
  const perfil = a.perfil === 'vice' ? 'vice' : 'diretor';

  if (await db.one('SELECT id FROM escolas WHERE codigo = ?', [codigo])) {
    throw new ErroHttp(409, 'Já existe uma escola com esse código. Escolha outro.');
  }
  const hash = await bcrypt.hash(a.senha, 10);
  const agora = db.agora();

  const escolaId = await db.transacao(async (tx) => {
    const id = await tx.insert(
      'INSERT INTO escolas (nome, codigo, cie, municipio, diretoria, telefone, endereco, criado_em) VALUES (?,?,?,?,?,?,?,?)',
      [nome, codigo, txt(e.cie, 20), txt(e.municipio, 80), txt(e.diretoria, 120), txt(e.telefone, 30), txt(e.endereco, 200), agora]
    );
    await tx.insert(
      'INSERT INTO usuarios (escola_id, nome, login, perfil, senha_hash, ativo, trocar_senha, criado_em) VALUES (?,?,?,?,?,1,0,?)',
      [id, adminNome, login, perfil, hash, agora]
    );
    await semearTipos(tx, id);
    return id;
  });
  await db.auditar(escolaId, { nome: adminNome }, 'escola_cadastrada', { codigo });
  res.status(201).json({ ok: true, codigo });
}));

r.post('/login', limiteLogin, rota(async (req, res) => {
  const b = req.body || {};
  const codigo = normalizarCodigo(b.codigo);
  const login = normalizarLogin(b.login);
  const senha = typeof b.senha === 'string' ? b.senha : '';
  const falha = () => { throw new ErroHttp(401, 'Código da escola, usuário ou senha incorretos. Se esqueceu a senha, procure a direção ou a coordenação da escola.'); };

  const escola = await db.one('SELECT id, nome FROM escolas WHERE codigo = ?', [codigo]);
  if (!escola) falha();
  const u = await db.one('SELECT * FROM usuarios WHERE escola_id = ? AND login = ?', [escola.id, login]);
  if (!u || !u.ativo || !(await bcrypt.compare(senha, u.senha_hash))) falha();

  await db.auditar(escola.id, u, 'login');
  res.json({
    token: gerarToken(u),
    usuario: { id: u.id, nome: u.nome, login: u.login, perfil: u.perfil, trocar_senha: !!u.trocar_senha },
  });
}));

export default r;
