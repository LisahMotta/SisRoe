# SisRoe — Registro de Ocorrências Escolares

Sistema web para registrar e acompanhar ocorrências escolares, feito para ser usado por **várias escolas**
no mesmo servidor. Cada escola tem seu próprio código de acesso, seus usuários, turmas, alunos e tipos de
ocorrência. Uma escola **nunca** vê os dados de outra.

Baseado no SisRoe da EE Professora Malba Thereza Ferraz Campaner, agora sem dados fixos de uma escola.

- **Protocolo 179 · CONVIVA SP — 3ª versão**: as 50 situações do documento, cada uma com seu passo a passo, macrocategoria
  e regra de Boletim de Ocorrência.
- **Ocorrências administrativas/disciplinares**: saiu da sala sem permissão, não abriu o caderno, recusou-se a
  tirar o boné, incidente ou acidente no intervalo, celular, atrasos e outras.

### Protocolo 179 — 3ª versão

O catálogo traz as **50 situações do capítulo 4 do DOC Conviva · Protocolo 179 — 3ª versão** (4.1 Acidentes e eventos
inesperados … 4.50 Xenofobia). Cada situação vem com:
- a **definição** do documento, para ajudar a escolher o tipo certo;
- os **passos a), b), c)…** do documento, com os subitens ("como fazer"), como checklist da ocorrência;
- a **macrocategoria** (a–j) do capítulo 4, a mesma lógica da Plataforma Conviva;
- a **regra de Boletim de Ocorrência** da seção 1.4.4: a escola registra, cabe à vítima/família, não é necessário, ou avaliar.

Também seguem o documento:
- seção 1.2: tudo que envolve convivência vai para a Plataforma Conviva, **inclusive indisciplina** (4.28 c);
- seção 1.2: para encerrar um caso com Conselho Tutelar acionado, é obrigatório registrar a **devolutiva** do serviço;
- seção 1.4.4: campo "família orientada sobre a possibilidade de registrar B.O.";
- ao encerrar com passos não marcados, o sistema avisa.

O SisRoe agrupa as situações em 3 blocos só para agilizar o registro (Emergência, Protocolo 179, Indisciplina). Essa
divisão é do sistema, não do documento. Cada ocorrência guarda uma cópia dos passos do momento do registro, então
atualizar o catálogo não altera registros antigos. Para gerar o catálogo de uma nova versão, veja `ferramentas/LEIAME.md`.

## O que o sistema faz

| Quem | O que pode fazer |
|---|---|
| Professor(a), Agente de Organização Escolar | Registrar ocorrências, ver as que registrou, acrescentar notas |
| POC, Coordenação | Tudo acima + ver todas as ocorrências da escola, fazer o acompanhamento, ver histórico dos alunos, exportar planilha |
| Vice-direção, Direção | Tudo acima + cadastrar usuários, turmas, alunos e tipos, cancelar registros e ver a auditoria |

- Intervenções, níveis de resposta e afastamento preventivo conforme a **Resolução SEDUC nº 68/2026** (detalhes abaixo).
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

## Resolução SEDUC nº 68/2026 (indisciplina escolar)

O sistema segue a Resolução SEDUC nº 68, de 19/06/2026 (DOE de 22/06/2026):

| Norma | Como aparece no SisRoe |
|---|---|
| Art. 7º, I a X | As 10 intervenções pedagógicas oficiais são o checklist das ocorrências administrativas |
| Art. 7º, IX e Art. 8º | Ao marcar "estudo dirigido", aparecem as regras (supervisão da gestão, proibição de usar como castigo, família em caso de repetição) e as atividades possíveis |
| Art. 5º | A equipe gestora classifica a resposta em **Nível I, II ou III**. O Nível III exige a análise inicial registrada (§ 3º) |
| Art. 5º, § 1º | A ficha mostra quantas ocorrências anteriores cada estudante tem e avisa quando há reincidência |
| Art. 9º, § 1º | Campo "síntese da análise inicial" |
| Art. 3º, V | Campo "manifestação do(a) estudante" |
| Art. 9º, § 3º | Campo opcional "data em que a escola tomou conhecimento" (ciência tardia) |
| Art. 9º, § 4º | Indicadores no painel: reincidência, situações resolvidas, intervenções adotadas, articulações com a rede, ocorrências por nível |
| Cap. IV (Arts. 11 e 12) | **Afastamento preventivo temporário**, com as regras descritas abaixo |
| Art. 12, § 1º | **Comunicação formal à família** pronta para imprimir, com os 5 itens obrigatórios |
| Art. 15 | **Rascunho do relatório circunstanciado** (itens I a XII), preenchido com o histórico do estudante |

**Regras do afastamento preventivo temporário que o sistema aplica:**
- só a direção e a vice-direção podem registrar (Art. 11);
- só em ocorrência classificada no Nível III (Art. 5º, III);
- exige ao menos uma hipótese do Art. 11, § 1º, motivação com elementos objetivos (Art. 28, I) e plano de estudos (Art. 11, § 3º);
- o prazo inicial é de no máximo 5 dias letivos (Art. 11, § 5º);
- para estudante da Educação Especial ou em sofrimento psíquico, exige as adaptações razoáveis documentadas (Art. 31);
- exige declarar que a medida não tem motivo discriminatório (Art. 28, VI);
- mostra o que está pendente: comunicação à família, à URE e registro na Plataforma CONVIVA (Art. 12);
- permite uma única prorrogação, por até o mesmo prazo, com data do Conselho de Escola, fundamento e família já comunicada (Art. 11, §§ 6º e 7º);
- o encerramento exige registrar o encaminhamento de retorno (Art. 11, § 8º).

A **transferência cautelar** (Cap. V) envolve Conselho de Escola, contraditório, recurso à URE e ao CEE. O sistema não conduz
esse processo: ele oferece o rascunho do relatório circunstanciado (Art. 15), que é a peça que inicia a análise.

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

Para testar também no PostgreSQL, como em produção, use um banco vazio:

```bash
TEST_DATABASE_URL=postgres://usuario@localhost:5432/sisroe_teste npm test
```

## Como publicar de graça

O banco de dados fica no **Neon** (gratuito). Para o site há duas opções gratuitas:

| Opção | Site | Prós | Contras |
|---|---|---|---|
| **A — recomendada** | [Vercel](https://vercel.com) (plano Hobby) | Não pede cartão; não "dorme" por 1 minuto; publica a cada commit | Plano grátis só para uso **não comercial** (é o caso de uma ferramenta escolar sem fins lucrativos) |
| B | [Render](https://render.com) (instância Free) | Servidor tradicional | Dorme após 15 min sem uso e leva até ~1 min para acordar; na criação, o plano pago vem marcado: escolha **Free** |

> Os limites dos planos gratuitos mudam com o tempo. Confira nas páginas de preço antes de publicar.
> Não use o banco gratuito do Render: ele **expira em 30 dias**.

### Passo 1 — Criar o banco no Neon (vale para as duas opções)

1. Crie uma conta em neon.com (dá para entrar com a conta do GitHub). Não pede cartão.
2. Crie um projeto chamado `sisroe`, região **AWS US East 1 (N. Virginia)**, a mesma região da Vercel e do Render.
3. No painel do projeto, clique em **Connect**, deixe ligada a opção **Connection pooling** e copie a
   *connection string*. Ela começa com `postgresql://` e tem `-pooler` no endereço. Guarde essa string com
   cuidado: ela é a senha do banco.

As tabelas são criadas sozinhas na primeira vez que o sistema liga.

### Passo 2 (opção A) — Publicar na Vercel

1. Crie uma conta em vercel.com com a conta do GitHub, no plano **Hobby** (gratuito).
2. Clique em **Add New… → Project** e importe o repositório `SisRoe`. A Vercel lê o arquivo `vercel.json`;
   não mude nada em *Build Settings*.
3. Antes de clicar em *Deploy*, abra **Environment Variables** e crie:
   - `DATABASE_URL`: a connection string do Neon;
   - `JWT_SECRET`: uma frase longa e aleatória, com 40 caracteres ou mais. Ninguém precisa decorar;
   - `CADASTRO_CHAVE`: uma senha que você passa só para as escolas autorizadas a se cadastrar;
   - `PG_MAX_CONEXOES`: `1` (cada instância da Vercel atende uma pessoa por vez).
4. Clique em **Deploy**. Em 1 ou 2 minutos o site fica no ar num endereço como `https://sisroe.vercel.app`.

Cada novo commit na branch `main` publica a nova versão sozinho.

### Passo 2 (opção B) — Publicar no Render

1. Crie uma conta em render.com com a conta do GitHub.
2. Clique em **New → Blueprint** e escolha o repositório `SisRoe`. O arquivo `render.yaml` já pede o plano **Free**.
   Se aparecer pedido de cartão, confira se o plano escolhido é *Free* e não *Starter*.
3. Preencha `DATABASE_URL` (connection string do Neon) e `CADASTRO_CHAVE`. O `JWT_SECRET` é criado sozinho.
4. Clique em **Apply**. O site fica num endereço como `https://sisroe.onrender.com`.

### O que esperar do plano gratuito

- **Banco que dorme.** O Neon dorme após 5 minutos parado; a primeira ação depois disso demora 1 ou 2 segundos a
  mais. O sistema reconecta sozinho se a conexão cair.
- **No Render**, além disso, o próprio site dorme: o primeiro acesso depois de 15 minutos sem uso pode levar até
  ~1 minuto. Avise as escolas: "se demorar, espere carregar; não clique de novo".
- **Espaço.** Cada ocorrência ocupa poucos KB, então o espaço gratuito comporta dezenas de milhares de registros.
  O painel do Neon mostra quanto já foi usado.
- **Faça cópia de segurança.** Serviço gratuito não tem garantia. Uma vez por mês, exporte a planilha
  (Ocorrências → Exportar planilha) ou, se souber usar o terminal, faça um `pg_dump` com a connection string.

| Variável | Para que serve | Padrão |
|---|---|---|
| `PORT` | Porta do servidor | 3000 |
| `DATABASE_URL` | Endereço do PostgreSQL (ativa o modo PostgreSQL) | — (usa SQLite) |
| `JWT_SECRET` | Chave que assina os logins | chave temporária (só fora de produção) |
| `CADASTRO_CHAVE` | Exige uma chave para cadastrar escola nova | — (cadastro livre) |
| `SQLITE_FILE` | Caminho do arquivo SQLite | `data/sisroe.db` |
| `PGSSL` | `false` para PostgreSQL local sem SSL | SSL ligado |
| `PG_MAX_CONEXOES` | Máximo de conexões abertas com o banco | 5 |

## Primeiro uso numa escola

1. Cadastre a escola e anote o **código de acesso** (ex.: `ee-exemplo`). Todos os servidores usam esse código no login.
2. **Administração → Turmas e alunos**: crie as turmas e cole a lista de alunos de cada uma.
3. **Administração → Usuários**: cadastre cada servidor. O sistema gera uma **senha provisória**, e no primeiro acesso
   a pessoa cria a própria senha. Se alguém esquecer a senha, use **"Nova senha"**.
4. **Administração → Tipos de ocorrência**: as 50 situações do Protocolo 179 já vêm prontas; acrescente indisciplinas próprias da escola, se quiser.

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
  routes/medidas.js   afastamento preventivo temporário e relatório circunstanciado (Res. SEDUC 68/2026)
  protocolo179.js     50 situações do Protocolo 179 — 3ª versão (gerado; ver ferramentas/)
  tipos.js            cria e atualiza o catálogo de tipos de cada escola
api/index.js          entrada do sistema na Vercel (vercel.json: rotas e cabeçalhos de segurança)
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
