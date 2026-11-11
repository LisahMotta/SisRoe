// index.js — servidor web do SisRoe.
import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as db from './db.js';
import { autenticar } from './auth.js';
import publico from './routes/publico.js';
import escola from './routes/escola.js';
import ocorrencias from './routes/ocorrencias.js';
import medidas from './routes/medidas.js';

const raiz = path.dirname(fileURLToPath(import.meta.url));
const pastaPublica = path.join(raiz, '..', 'public');

export async function criarApp() {
  await db.init();
  const app = express();
  app.set('trust proxy', 1); // o Render (e similares) fica atrás de um proxy
  app.use(helmet({
    contentSecurityPolicy: {
      directives: { 'default-src': ["'self'"], 'img-src': ["'self'", 'data:'], 'script-src': ["'self'"] },
    },
  }));
  app.use(express.json({ limit: '1mb' }));

  // Rotas da API. As públicas vêm antes do "autenticar".
  app.use('/api', publico);
  app.use('/api', autenticar, escola, ocorrencias, medidas);
  app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

  // Arquivos do site (HTML, CSS, JS).
  app.use(express.static(pastaPublica, { extensions: ['html'] }));
  app.get('*', (req, res) => res.sendFile(path.join(pastaPublica, 'index.html')));

  // Tratamento de erros: sempre responde JSON com a mensagem em português.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'Dados enviados em formato inválido.' });
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ erro: status >= 500 ? 'Erro interno no servidor. Tente novamente.' : err.message });
  });
  return app;
}

// Só inicia o servidor quando este arquivo é executado diretamente
// (os testes importam criarApp sem abrir a porta padrão).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const porta = Number(process.env.PORT) || 3000;
  const app = await criarApp();
  app.listen(porta, () => console.log(`SisRoe rodando em http://localhost:${porta}`));
}
