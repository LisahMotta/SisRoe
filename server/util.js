// util.js — pequenas funções de apoio às rotas.

/** Erro com código HTTP, para responder 400/404/409 de forma simples. */
export class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

/** Texto limpo: tira espaços das pontas e corta no tamanho máximo. */
export function txt(v, max = 200) {
  if (v === undefined || v === null) return '';
  return String(v).trim().slice(0, max);
}

/** Texto obrigatório: lança erro 400 se vier vazio. */
export function obrigatorio(v, nomeCampo, max = 200) {
  const s = txt(v, max);
  if (!s) throw new ErroHttp(400, `Preencha o campo: ${nomeCampo}.`);
  return s;
}

export function dataValida(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

export function horaValida(s) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}

export function senhaForte(s) {
  return typeof s === 'string' && s.length >= 8 && /[A-Za-z]/.test(s) && /\d/.test(s);
}
export const MSG_SENHA = 'A senha precisa ter pelo menos 8 caracteres, com letras e números.';

/** Envolve uma rota async para que erros virem respostas JSON. */
export const rota = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
