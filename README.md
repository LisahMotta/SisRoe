# SisRoe — Registro de Ocorrências Escolares

Sistema web para registrar e acompanhar ocorrências escolares, feito para ser usado por **várias escolas**
no mesmo servidor. Cada escola tem seu próprio código de acesso, seus usuários, turmas, alunos e tipos de
ocorrência. Uma escola **nunca** vê os dados de outra.

Baseado no SisRoe da EE Professora Malba Thereza Ferraz Campaner, agora sem dados fixos de uma escola.

- **Protocolo 179 · CONVIVA SP**: ocorrências de urgência/emergência e graves, com o passo a passo de procedimentos
  (PM 190, SAMU 192, Bombeiros 193, família, URE, Plataforma CONVIVA, Conselho Tutelar, imagens, sigilo).
- **Ocorrências administrativas/disciplinares**: saiu da sala sem permissão, não abriu o caderno, recusou-se a
  tirar o boné, incidente ou acidente no intervalo, celular, atrasos e outras.

> ⚠️ **Confira o catálogo com o documento oficial.** A lista de tipos do Protocolo 179 foi copiada do SisRoe original.
> Não foi possível conferir item por item com o PDF da 3ª versão. A direção de cada escola pode corrigir códigos e nomes
> em **Administração → Tipos de ocorrência**, sem mexer no código. Para mudar o padrão das escolas novas, edite
> `public/js/catalogo.js`.

## O que o sistema faz

| Quem | O que pode fazer |
|---|---|
| Professor(a), Agente de Organização Escolar | Registrar ocorrências, ver as que registrou, acrescentar notas |
| POC, Coordenação | Tudo acima + ver todas as ocorrências da escola, fazer o acompanhamento, ver histórico dos alunos, exportar planilha |
| Vice-direção, Direção | Tudo acima + cadastrar usuários, turmas, alunos e tipos, cancelar registros e ver a auditoria |

- Registro em 3 passos: **categoria → tipo → dados** (data, hora, local, turma, alunos e o papel de cada um, relato, providências).
- Numeração automática por escola e ano: `2026/0001`, `2026/0002`…
- **Ficha pronta para imprimir/salvar em PDF**, com cabeçalho da escola e espaço para assinaturas.
- **Acompanhamento:** checklist do protocolo, comunicação à família, Conselho Tutelar, CONVIVA, B.O. e situação
  (aberta → em acompanhamento → encerrada).
- **Regras de integridade:** o relato original não pode ser editado (complementos entram como notas), a gravidade
  só pode aumentar, nenhum registro é apagado (a direção cancela informando o motivo) e as ações ficam na auditoria.
- Painel com números do ano, gráficos por categoria, mês, tipo e turma.
- Histórico por aluno, com aviso de reincidência.
- Importação de alunos colando a lista da planilha (colunas RA e Nome).
- Exportação para planilha (CSV que abre no Excel/Google Planilhas).
- Funciona no celular.

## Como rodar no computador

Precisa do [Node.js](https://nodejs.org) **versão 22.13 ou mais nova**.

```bash
npm install
```

```bash
npm start
```

Abra **http://localhost:3000** e clique em **"Cadastre a escola"**. Quem cadastra vira administrador(a) da escola.

No computador, os dados ficam no arquivo `data/sisroe.db` (SQLite). Não precisa instalar banco de dados.

Para rodar os testes automáticos:

```bash
npm test
```

## Como publicar no Railway

1. No Railway: **New Project → Deploy from GitHub** e escolha este repositório.
2. Adicione um banco **PostgreSQL** ao projeto. O Railway cria a variável `DATABASE_URL` sozinho, e o sistema passa a usá-la.
   (Sem PostgreSQL os dados se perdem a cada nova publicação, porque o disco do Railway é apagado.)
3. Em **Variables**, adicione:
   - `JWT_SECRET`: uma frase longa e aleatória (obrigatória quando `NODE_ENV=production`).
   - `CADASTRO_CHAVE` *(recomendado)*: uma senha que você passa só para as escolas autorizadas. Sem ela, qualquer
     pessoa com o endereço do site consegue cadastrar uma escola.
4. Pronto. Não precisa rodar `seed`: cada escola se cadastra pela própria tela.

| Variável | Para que serve | Padrão |
|---|---|---|
| `PORT` | Porta do servidor | 3000 |
| `DATABASE_URL` | Endereço do PostgreSQL (ativa o modo PostgreSQL) | — (usa SQLite) |
| `JWT_SECRET` | Chave que assina os logins | chave temporária (só fora de produção) |
| `CADASTRO_CHAVE` | Exige uma chave para cadastrar escola nova | — (cadastro livre) |
| `SQLITE_FILE` | Caminho do arquivo SQLite | `data/sisroe.db` |
| `PGSSL` | `false` para PostgreSQL local sem SSL | SSL ligado |

## Primeiro uso numa escola

1. Cadastre a escola e anote o **código de acesso** (ex.: `ee-exemplo`). Todos os servidores usam esse código no login.
2. **Administração → Turmas e alunos**: crie as turmas e cole a lista de alunos de cada uma.
3. **Administração → Usuários**: cadastre cada servidor. O sistema gera uma **senha provisória**, e no primeiro acesso
   a pessoa cria a própria senha. Se alguém esquecer a senha, use **"Nova senha"**.
4. **Administração → Tipos de ocorrência**: confira a lista com a versão vigente do Protocolo 179.

## Estrutura

```
server/
  index.js            servidor Express: segurança, rotas, arquivos do site
  db.js               banco de dados (SQLite local ou PostgreSQL) e criação das tabelas
  auth.js             login (JWT) e permissões por perfil
  util.js             validações e funções de apoio
  routes/publico.js   cadastro de escola e login
  routes/escola.js    escola, usuários, turmas, alunos, tipos, auditoria
  routes/ocorrencias.js  registro, lista, detalhe, acompanhamento, notas, histórico, painel, CSV
public/
  index.html          página única do site
  css/app.css         aparência (inclui o modo de impressão)
  js/catalogo.js      tipos padrão, procedimentos do protocolo, perfis (usado pelo servidor e pelo navegador)
  js/app.js           sessão, menu e troca de telas
  js/api.js, ui.js    comunicação com o servidor e funções de tela
  js/telas/*.js       uma tela por arquivo (login, painel, nova, lista, detalhe, alunos, admin, conta)
test/api.test.js      testes da API (permissões e isolamento entre escolas)
```

## Privacidade (ECA e LGPD)

O sistema guarda dados de crianças e adolescentes. Por isso:
- só a equipe gestora vê todas as ocorrências e o histórico dos alunos;
- professores e agentes veem apenas o que registraram;
- usuário desativado perde o acesso na hora;
- toda ação relevante fica registrada na auditoria.

Cada escola continua responsável por definir quem recebe acesso e por arquivar os documentos impressos.
