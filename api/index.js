// api/index.js — entrada do SisRoe na Vercel (plano gratuito "Hobby").
// Na Vercel não há servidor ligado o tempo todo: cada requisição para /api/...
// aciona esta função. O app Express é criado uma vez por instância e reaproveitado.
// As páginas (public/) são servidas direto pela rede da Vercel, sem passar por aqui.
import { criarApp } from '../server/index.js';

let appPronto = null;

export default async function handler(req, res) {
  if (!appPronto) {
    appPronto = criarApp().catch((e) => { appPronto = null; throw e; });
  }
  const app = await appPronto;
  return app(req, res);
}
