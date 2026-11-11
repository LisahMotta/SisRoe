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
  routes/medidas.js   afastamento preventivo temporário e relatório circunstanciado (Res. SEDUC 68/2026)
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
