// auth.js — login com JWT e verificação de permissões.
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import * as db from './db.js';
import { PERFIS_GESTAO, PERFIS_ADMIN } from '../public/js/catalogo.js';

let SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Defina a variável de ambiente JWT_SECRET antes de iniciar em produção.');
  }
  SECRET = crypto.randomBytes(32).toString('hex');
  console.warn('[auth] JWT_SECRET não definido: usando chave temporária (logins expiram ao reiniciar).');
}

const DURACAO = '10h'; // um dia de trabalho na escola

export function gerarToken(u) {
  return jwt.sign({ uid: u.id, eid: u.escola_id }, SECRET, { expiresIn: DURACAO });
}

/**
 * Exige um token válido. Recarrega o usuário do banco a cada requisição, assim
 * um usuário desativado perde o acesso na hora (e não só quando o token vence).
 * Deixa em req.usuario: { id, escola_id, nome, login, perfil, trocar_senha }.
 */
export async function autenticar(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ erro: 'Faça login para continuar.' });
  let dados;
  try {
    dados = jwt.verify(token, SECRET);
  } catch {
    return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.' });
  }
  const u = await db.one(
    'SELECT id, escola_id, nome, login, perfil, ativo, trocar_senha FROM usuarios WHERE id = ? AND escola_id = ?',
    [dados.uid, dados.eid]
  );
  if (!u || !u.ativo) return res.status(401).json({ erro: 'Usuário inativo ou inexistente.' });
  req.usuario = u;
  // Enquanto a senha provisória não for trocada, só a troca de senha é permitida.
  if (u.trocar_senha && !req.path.endsWith('/minha-senha') && !req.path.endsWith('/eu')) {
    return res.status(403).json({ erro: 'Troque sua senha provisória para continuar.', trocarSenha: true });
  }
  next();
}

export const ehGestao = (u) => PERFIS_GESTAO.includes(u.perfil);
export const ehAdmin = (u) => PERFIS_ADMIN.includes(u.perfil);

export function exigeGestao(req, res, next) {
  if (!ehGestao(req.usuario)) return res.status(403).json({ erro: 'Acesso restrito à equipe gestora.' });
  next();
}

export function exigeAdmin(req, res, next) {
  if (!ehAdmin(req.usuario)) return res.status(403).json({ erro: 'Acesso restrito à direção.' });
  next();
}
