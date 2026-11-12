// routes/publico.js — rotas sem login: cadastro de escola e login.
import express from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import * as db from '../db.js';
import { gerarToken } from '../auth.js';
import { ErroHttp, txt, obrigatorio, senhaForte, MSG_SENHA, rota } from '../util.js';
import { semearTipos } from '../tipos.js';
import { VERSAO } from '../versao.js';

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

// Bloqueio por usuário: o limite por endereço (acima) fica na memória de cada instância da Vercel,
// então quem insiste a partir de vários endereços ainda esbarraria neste, que fica no banco.
export const MAX_FALHAS = 8;
const BLOQUEIO_MIN = 15;
// Hash de uma senha qualquer: comparado quando o usuário não existe, para a resposta demorar o mesmo
// tempo (senão daria para descobrir quais logins existem pela demora).
const HASH_FALSO = bcrypt.hashSync('senha-que-ninguem-usa-0', 10);
// Cadastros de escola por dia (todas juntas): protege o banco gratuito contra robôs. 0 = sem limite.
const LIMITE_CADASTROS_DIA = Number(process.env.LIMITE_CADASTROS_DIA ?? 50);

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
  res.setHeader('Cache-Control', 'no-store');
  res.json({ cadastroExigeChave: !!process.env.CADASTRO_CHAVE, versao: VERSAO });
});

// Cadastro de uma escola nova + primeiro usuário (direção).
r.post('/escolas', limiteCadastro, rota(async (req, res) => {
  const b = req.body || {};
  if (process.env.CADASTRO_CHAVE && b.chave !== process.env.CADASTRO_CHAVE) {
    throw new ErroHttp(403, 'Chave de cadastro inválida. Peça a chave a quem administra o sistema.');
  }
  // Campo invisível para pessoas: só robôs preenchem.
  if (b.site) throw new ErroHttp(400, 'Não foi possível concluir o cadastro.');
  if (LIMITE_CADASTROS_DIA > 0) {
    const ontem = new Date(Date.now() - 86400000).toISOString();
    const { qtd } = await db.one('SELECT COUNT(*) AS qtd FROM escolas WHERE criado_em > ?', [ontem]);
    if (Number(qtd) >= LIMITE_CADASTROS_DIA) {
      throw new ErroHttp(429, 'Muitas escolas foram cadastradas hoje. Tente de novo amanhã.');
    }
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
  // Quem cadastra a escola pode ser a direção ou o usuário master (que faz a configuração inicial).
  const perfil = ['vice', 'master'].includes(a.perfil) ? a.perfil : 'diretor';

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
  const u = escola ? await db.one('SELECT * FROM usuarios WHERE escola_id = ? AND login = ?', [escola.id, login]) : null;
  if (u?.bloqueado_ate && u.bloqueado_ate > db.agora()) {
    throw new ErroHttp(429, `Muitas tentativas com senha errada para este usuário. Aguarde ${BLOQUEIO_MIN} minutos ou peça à direção ou à coordenação uma nova senha.`);
  }
  const senhaOk = await bcrypt.compare(senha, u?.senha_hash || HASH_FALSO);
  if (!u || !u.ativo || !senhaOk) {
    if (u && u.ativo) {
      const falhas = Number(u.falhas_login || 0) + 1;
      const bloquear = falhas >= MAX_FALHAS;
      await db.run('UPDATE usuarios SET falhas_login = ?, bloqueado_ate = ? WHERE id = ? AND escola_id = ?',
        [bloquear ? 0 : falhas, bloquear ? new Date(Date.now() + BLOQUEIO_MIN * 60000).toISOString() : null, u.id, escola.id]);
      if (bloquear) await db.auditar(escola.id, u, 'login_bloqueado', { tentativas: MAX_FALHAS });
    }
    falha();
  }
  if (u.falhas_login || u.bloqueado_ate) {
    await db.run('UPDATE usuarios SET falhas_login = 0, bloqueado_ate = NULL WHERE id = ? AND escola_id = ?', [u.id, escola.id]);
  }

  await db.auditar(escola.id, u, 'login');
  res.json({
    token: gerarToken(u),
    usuario: { id: u.id, nome: u.nome, login: u.login, perfil: u.perfil, trocar_senha: !!u.trocar_senha },
  });
}));

export default r;
