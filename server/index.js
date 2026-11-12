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
import alunos from './routes/alunos.js';
import busca from './routes/busca.js';
import chat from './routes/chat.js';
import carometros from './routes/carometros.js';

const raiz = path.dirname(fileURLToPath(import.meta.url));
const pastaPublica = path.join(raiz, '..', 'public');

export async function criarApp() {
  await db.init();
  const app = express();
  app.set('trust proxy', 1); // o Render (e similares) fica atrás de um proxy
  app.use(helmet({
    contentSecurityPolicy: {
      // blob: = foto escolhida no aparelho, lida antes de ser reduzida (carômetro).
      directives: { 'default-src': ["'self'"], 'img-src': ["'self'", 'data:', 'blob:'], 'script-src': ["'self'"], 'manifest-src': ["'self'"] },
    },
  }));
  app.use(express.json({ limit: '4mb' })); // listas da SED e fotos do carômetro

  // Rotas da API. As públicas vêm antes do "autenticar".
  app.use('/api', publico);
  app.use('/api', autenticar, escola, ocorrencias, medidas, alunos, busca, chat, carometros);
  app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

  // Arquivos do site (HTML, CSS, JS).
  // Páginas e scripts sempre conferidos com o servidor (evita ficar com versão antiga após atualizar).
  app.use(express.static(pastaPublica, {
    extensions: ['html'],
    setHeaders: (res, arquivo) => {
      if (/\.(html|js|css|json)$/.test(arquivo)) res.setHeader('Cache-Control', 'no-cache');
    },
  }));
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
