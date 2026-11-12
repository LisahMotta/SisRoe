// tutorial.js — passo a passo de uso do SisRoe para cada perfil.
// Cada passo: titulo, texto (pode ter mais de um parágrafo, separado por \n) e,
// opcionalmente, rota (link "Ir para a tela") e icone.

const ACESSO = {
  icone: 'cadeado',
  titulo: 'Entrar no sistema',
  texto: 'Use o código da escola, o seu usuário (o número do seu RG ou da CIN, só os números) e a senha.\n'
    + 'No primeiro acesso você entra com uma senha provisória e o sistema pede para criar a sua senha pessoal. Ela é só sua: não compartilhe.\n'
    + 'Esqueceu a senha? Procure a direção ou a coordenação da escola: eles geram uma nova senha provisória para você.',
};

const REGISTRAR = {
  icone: 'mais',
  rota: '#/nova',
  guia: true,
  titulo: 'Registrar uma ocorrência',
  texto: 'Clique em "Nova ocorrência" e siga os 3 passos: escolha a categoria (Emergência, Protocolo 179 ou Indisciplina), o tipo (dá para buscar digitando, ex.: "boné", "celular", "intervalo") e preencha data, local, turma, estudantes e o relato.\n'
    + 'No relato, descreva fatos: o que aconteceu, quem, onde e como, sem opiniões. O relato não pode ser editado depois (complementos entram como notas).\n'
    + 'Em situação de risco, primeiro acione o socorro (PM 190, SAMU 192, Bombeiros 193) e a direção. O registro vem depois.',
};

const CHAT_PROF = {
  icone: 'nota',
  titulo: 'Conversar com a equipe gestora',
  texto: 'Assim que você registra, a equipe gestora recebe um aviso e uma conversa aparece no topo da ocorrência. Use-a para avisar o que está acontecendo e combinar as providências.\n'
    + 'Quando alguém responder, aparece um aviso na tela e um número vermelho em "Ocorrências".',
};

const MINHAS = {
  icone: 'lista',
  rota: '#/ocorrencias',
  titulo: 'Acompanhar as suas ocorrências',
  texto: 'Em "Ocorrências" você vê as que registrou, a situação de cada uma (aberta, em acompanhamento, encerrada) e as mensagens novas. Dentro de cada uma, dá para acrescentar notas e baixar o PDF.',
};

const CAROMETRO = {
  icone: 'pessoa',
  rota: '#/carometro',
  titulo: 'Reconhecer os estudantes no carômetro',
  texto: 'O carômetro mostra a foto e o nome dos estudantes de cada turma. Use para identificar corretamente quem estava envolvido antes de registrar.',
};

const NOTIF = {
  icone: 'conta',
  rota: '#/conta',
  titulo: 'Avisos no celular e senha',
  texto: 'Em "Minha conta" você troca a sua senha e pode ativar as notificações neste aparelho, para receber avisos mesmo com o SisRoe fechado (no iPhone, primeiro adicione o SisRoe à Tela de Início).',
};

const AVISOS_GESTAO = {
  icone: 'alerta',
  titulo: 'Receber os avisos de ocorrência nova',
  texto: 'Cada ocorrência registrada pela equipe (professores, agentes, gerente de organização escolar e secretaria) gera um aviso na sua tela ("Nova ocorrência"). Clique em "Abrir ocorrência e chat" para ver os detalhes e responder quem registrou.\n'
    + 'Ative as notificações em "Minha conta" para ser avisado(a) mesmo com o sistema fechado.',
};

const ACOMPANHAR = {
  icone: 'lista_check',
  rota: '#/ocorrencias',
  titulo: 'Fazer o acompanhamento',
  texto: 'Na ocorrência, desça até "Acompanhamento — equipe gestora":\n'
    + '• registre a síntese da análise inicial e a manifestação do estudante;\n'
    + '• classifique o nível de resposta (I, II ou III — Res. SEDUC nº 68/2026);\n'
    + '• marque os procedimentos do Protocolo 179 (ou as intervenções do Art. 7º) já feitos;\n'
    + '• registre a comunicação à família, o registro na Plataforma CONVIVA, o Conselho Tutelar e a devolutiva da rede;\n'
    + '• encerre só quando todas as providências estiverem concluídas.',
};

const HISTORICO = {
  icone: 'alunos',
  rota: '#/alunos',
  titulo: 'Consultar o histórico do estudante',
  texto: 'Em "Alunos", busque pelo nome ou RA e veja todas as ocorrências do estudante. A partir de 3 registros o sistema alerta para reincidência.',
};

const BUSCA = {
  icone: 'busca',
  rota: '#/busca',
  titulo: 'Busca ativa de faltosos',
  texto: 'Em "Busca ativa", clique em "Registrar faltosos", escolha a turma, marque os estudantes e o número de faltas.\n'
    + 'Na ficha de cada caso, confira o telefone do responsável e clique em "Abrir no WhatsApp": a mensagem abre pronta no seu aparelho e você confere antes de enviar. Registre também ligações, visitas e encaminhamentos.',
};

const EQUIPE = {
  icone: 'chave',
  rota: '#/equipe',
  titulo: 'Ajudar quem esqueceu a senha',
  texto: 'Em "Equipe e senhas", encontre a pessoa (professor, agente, gerente de organização escolar ou secretário) e clique em "Nova senha". O sistema gera uma senha provisória: entregue pessoalmente. No primeiro acesso a pessoa é obrigada a criar uma senha nova.',
};

const PDF = {
  icone: 'documento',
  titulo: 'Imprimir e arquivar',
  texto: 'Em cada ocorrência, "Baixar PDF" gera o documento completo com espaço para as assinaturas. Arquive na escola, em caráter reservado (ECA e LGPD).',
};

const PAINEL = {
  icone: 'inicio',
  rota: '#/painel',
  titulo: 'Painel e indicadores',
  texto: 'O "Início" mostra as ocorrências do ano por categoria, mês, tipo e turma, e os indicadores de convivência do Art. 9º, § 4º da Res. SEDUC nº 68/2026. Em "Ocorrências" há filtros e o botão "Exportar planilha".',
};

const ADMIN_USUARIOS = {
  icone: 'admin',
  rota: '#/admin/usuarios',
  titulo: 'Cadastrar a equipe',
  texto: 'Em "Administração → Usuários", use "Importar lista" e envie a planilha com o nome e o RG ou CIN de cada professor (pode colar direto da planilha). O RG/CIN vira o usuário de acesso.\n'
    + 'Escolha uma senha provisória comum ou deixe o sistema gerar uma para cada pessoa, e imprima a lista de acessos para entregar. Todos são obrigados a trocar a senha no primeiro acesso.',
};

const ADMIN_SED = {
  icone: 'baixar',
  rota: '#/admin/sed',
  titulo: 'Importar turmas e alunos da SED',
  texto: 'Em "Administração → Importar da SED", envie os arquivos CSV exportados da Secretaria Escolar Digital. O sistema cria as turmas e os alunos, mostra uma prévia e ignora quem não está ativo. Depois, coloque as fotos no carômetro.',
};

const AFASTAMENTO = {
  icone: 'balanca',
  titulo: 'Afastamento preventivo e relatório circunstanciado',
  texto: 'Em situações de Nível III, a direção pode registrar o afastamento preventivo temporário (máx. 5 dias letivos, Cap. IV da Res. SEDUC nº 68/2026), imprimir a comunicação formal à família e gerar o rascunho do relatório circunstanciado (Art. 15) no histórico do aluno.',
};

const ADMIN_GERAL = {
  icone: 'escola',
  rota: '#/admin',
  titulo: 'Administrar a escola',
  texto: 'Em "Administração" você mantém os dados da escola (aparecem nos documentos), as turmas, os tipos de ocorrência (as 50 situações do Protocolo 179 já vêm prontas), a mensagem de WhatsApp da busca ativa e consulta a auditoria. Só a direção pode cancelar um registro (com motivo).',
};

const MASTER_INICIO = {
  icone: 'escola',
  rota: '#/admin/primeiros-passos',
  titulo: 'Configuração inicial da escola',
  texto: 'Em "Administração → Primeiros passos" siga a lista: dados da escola (aparecem nos documentos), turmas e alunos (importe os CSV da SED em "Importar da SED"), fotos do carômetro e a mensagem de WhatsApp da busca ativa.',
};
const MASTER_EQUIPE = {
  icone: 'alunos',
  rota: '#/admin/usuarios',
  titulo: 'Cadastrar a direção e a equipe',
  texto: 'Em "Administração → Usuários", cadastre primeiro o(a) diretor(a) e depois use "Importar lista" com o nome e o RG/CIN da equipe. Imprima a lista de acessos e entregue à direção.\n'
    + 'Cada escola tem um único usuário master. Só o(a) diretor(a) pode alterar ou desativar o master.',
};
const MASTER_APOIO = {
  icone: 'chave',
  rota: '#/equipe',
  titulo: 'Apoiar a direção',
  texto: 'Em "Equipe e senhas" você gera nova senha provisória para qualquer pessoa da escola, inclusive a direção, quando alguém esquecer. Você não pode desativar nem mudar o perfil da direção.',
};
const MASTER_ATUALIZAR = {
  icone: 'tendencia',
  rota: '#/admin/tipos',
  titulo: 'Atualizações do sistema',
  texto: 'Quando sair uma nova versão do Protocolo 179 ou uma atualização do SisRoe, use "Administração → Tipos de ocorrência → Atualizar catálogo do Protocolo 179" (as ocorrências já registradas não mudam). Confira em "Auditoria" o que foi feito no sistema e por quem.',
};
const MASTER_PRIVACIDADE = {
  icone: 'cadeado',
  titulo: 'O que o master não acessa',
  texto: 'Por privacidade (ECA e LGPD), o usuário master não vê ocorrências, histórico de estudantes nem a busca ativa, e não decide medidas da Res. SEDUC nº 68/2026 (afastamento preventivo, relatório circunstanciado, cancelamento de registros): essas são atribuições da direção e da equipe gestora.',
};

export const TUTORIAIS = {
  professor: {
    resumo: 'Você registra as ocorrências da sua sala e conversa com a equipe gestora sobre cada uma.',
    passos: [ACESSO, REGISTRAR, CHAT_PROF, MINHAS, CAROMETRO, NOTIF],
  },
  agente: {
    resumo: 'Você registra o que acontece nos corredores, no pátio e no intervalo (incidentes, acidentes, saídas sem permissão) e avisa a equipe gestora.',
    passos: [ACESSO, { ...REGISTRAR, texto: REGISTRAR.texto.replace('(dá para buscar digitando, ex.: "boné", "celular", "intervalo")', '(no intervalo use "Incidente no intervalo" ou "Acidente leve"; dá para buscar digitando)') }, CHAT_PROF, MINHAS, BUSCA, CAROMETRO, NOTIF],
  },
  gerente: {
    resumo: 'Como Gerente de Organização Escolar, você registra o que acontece nos espaços da escola (pátio, corredores, entrada e saída, intervalo), acompanha os registros dos agentes e conversa com a equipe gestora.',
    passos: [ACESSO, { ...REGISTRAR, texto: REGISTRAR.texto.replace('(dá para buscar digitando, ex.: "boné", "celular", "intervalo")', '(para os espaços da escola: "Incidente no intervalo", "Acidente leve", "Saiu da escola mais cedo"; dá para buscar digitando)') }, CHAT_PROF, MINHAS, BUSCA, CAROMETRO, NOTIF],
  },
  secretaria: {
    resumo: 'Como Secretário(a) de Escola, você registra ocorrências que chegam à secretaria (atendimento a famílias, saídas antecipadas, documentos) e conversa com a equipe gestora sobre cada uma.',
    passos: [ACESSO, { ...REGISTRAR, texto: REGISTRAR.texto.replace('(dá para buscar digitando, ex.: "boné", "celular", "intervalo")', '(ex.: "Saiu da escola mais cedo sem autorização", "Alerta de desaparecimento", "Evasão escolar"; dá para buscar digitando)') }, CHAT_PROF, MINHAS, BUSCA, CAROMETRO, NOTIF],
  },
  poc: {
    resumo: 'Como Professor(a) Orientador(a) de Convivência, você acompanha as ocorrências, faz a escuta e a mediação e ajuda a equipe com as senhas dos professores.',
    passos: [ACESSO, AVISOS_GESTAO, ACOMPANHAR, HISTORICO, BUSCA, EQUIPE, PDF, REGISTRAR],
  },
  coordenador: {
    resumo: 'Você acompanha todas as ocorrências da escola, responde aos professores, cuida da busca ativa e ajuda com as senhas dos professores.',
    passos: [ACESSO, AVISOS_GESTAO, ACOMPANHAR, PAINEL, HISTORICO, BUSCA, EQUIPE, PDF],
  },
  vice: {
    resumo: 'Você acompanha as ocorrências e administra o sistema da escola: equipe, turmas, alunos e medidas da Res. SEDUC nº 68/2026.',
    passos: [ACESSO, AVISOS_GESTAO, ACOMPANHAR, ADMIN_USUARIOS, ADMIN_SED, BUSCA, AFASTAMENTO, PAINEL, PDF],
  },
  master: {
    resumo: 'Você é o usuário master da escola: faz a configuração inicial do SisRoe, cadastra a equipe e ajuda a direção nas atualizações e com senhas esquecidas.',
    passos: [ACESSO, MASTER_INICIO, MASTER_EQUIPE, MASTER_APOIO, MASTER_ATUALIZAR, NOTIF, MASTER_PRIVACIDADE],
  },
  diretor: {
    resumo: 'Você administra o SisRoe da escola: cadastra a equipe, importa as turmas, acompanha as ocorrências e decide as medidas excepcionais.',
    passos: [ACESSO, ADMIN_USUARIOS, ADMIN_SED, AVISOS_GESTAO, ACOMPANHAR, AFASTAMENTO, BUSCA, PAINEL, ADMIN_GERAL, PDF],
  },
};
