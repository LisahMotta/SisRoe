// catalogo.js — catálogo padrão de tipos de ocorrência e procedimentos.
// Este arquivo é usado pelo servidor (para criar os tipos de cada escola nova)
// e pelo navegador (para mostrar os procedimentos do Protocolo 179).
//
// IMPORTANTE: a lista do Protocolo 179 abaixo veio do SisRoe original.
// Confira numeração e nomes com o PDF oficial da 3ª versão do Protocolo 179
// (CONVIVA SP / SEDUC-SP). Cada escola pode editar seus tipos pela tela
// Administração → Tipos de ocorrência, sem mexer neste código.

export const CATEGORIAS = {
  urgencia: {
    nome: 'Urgência / Emergência',
    resumo: 'Risco à vida ou à integridade. Protocolo 179 — agir imediatamente.',
  },
  grave: {
    nome: 'Grave (Protocolo 179)',
    resumo: 'Violência, violação de direitos ou possível crime. Protocolo 179.',
  },
  administrativa: {
    nome: 'Administrativa / Disciplinar',
    resumo: 'Indisciplina e rotina escolar: sair da sala, boné, caderno, intervalo…',
  },
};

export const GRAVIDADES = {
  leve: 'Leve',
  media: 'Média',
  grave: 'Grave',
  urgencia: 'Urgência/Emergência',
};
// Ordem crescente: a gravidade de uma ocorrência só pode subir, nunca descer.
export const ORDEM_GRAVIDADE = ['leve', 'media', 'grave', 'urgencia'];

export const STATUS = {
  aberta: 'Aberta',
  em_acompanhamento: 'Em acompanhamento',
  encerrada: 'Encerrada',
  cancelada: 'Cancelada',
};

export const PERFIS = {
  professor: 'Professor(a)',
  agente: 'Agente de Organização Escolar',
  poc: 'P.O.C. (Prof. Orientador de Convivência)',
  coordenador: 'Coordenador(a) Pedagógico(a)',
  vice: 'Vice-Diretor(a)',
  diretor: 'Diretor(a) de Escola',
};
// Quem vê todas as ocorrências da escola e faz o acompanhamento.
export const PERFIS_GESTAO = ['poc', 'coordenador', 'vice', 'diretor'];
// Quem administra usuários, turmas, alunos e tipos.
export const PERFIS_ADMIN = ['vice', 'diretor'];

export const PAPEIS_ALUNO = {
  envolvido: 'Envolvido(a)',
  autor: 'Autor(a)',
  vitima: 'Vítima',
  testemunha: 'Testemunha',
};

export const LOCAIS = [
  'Sala de aula', 'Pátio', 'Quadra', 'Corredor', 'Banheiro', 'Refeitório',
  'Biblioteca / Sala de leitura', 'Laboratório', 'Portão / Entrada',
  'Entorno da escola', 'Ambiente virtual / redes sociais', 'Outro',
];

// Procedimentos por categoria. A chave (k) é gravada na ocorrência quando o
// passo é marcado como feito, então não mude as chaves já em uso.
export const PROCEDIMENTOS = {
  urgencia: [
    { k: 'seguranca', t: 'Manter a calma e garantir a segurança de todos' },
    { k: 'acionar', t: 'Acionar PM (190), SAMU (192) ou Bombeiros (193), conforme o caso' },
    { k: 'direcao', t: 'Comunicar a direção imediatamente' },
    { k: 'familia', t: 'Comunicar a família / responsáveis' },
    { k: 'ure', t: 'Comunicar a Unidade Regional de Ensino (URE)' },
    { k: 'conviva', t: 'Registrar na Plataforma CONVIVA' },
    { k: 'imagens', t: 'Preservar imagens das câmeras (pedir o quanto antes)' },
    { k: 'conselho', t: 'Acionar o Conselho Tutelar quando houver criança/adolescente em risco' },
    { k: 'sigilo', t: 'Manter sigilo sobre os envolvidos' },
  ],
  grave: [
    { k: 'acolher', t: 'Acolher e escutar as partes envolvidas' },
    { k: 'gestao', t: 'Comunicar a equipe gestora' },
    { k: 'familia', t: 'Comunicar a família / responsáveis' },
    { k: 'conviva', t: 'Registrar na Plataforma CONVIVA' },
    { k: 'conselho', t: 'Avaliar a necessidade de acionar o Conselho Tutelar' },
    { k: 'bo', t: 'Orientar registro de Boletim de Ocorrência quando houver crime' },
    { k: 'acompanhar', t: 'Acompanhar o caso e registrar as providências' },
  ],
  administrativa: [
    { k: 'escuta', t: 'Acolhimento e escuta do(a) estudante' },
    { k: 'orientacao', t: 'Orientação individual e retomada dos combinados de convivência' },
    { k: 'compromisso', t: 'Repactuação de compromisso / plano de acompanhamento' },
    { k: 'familia', t: 'Comunicar a família (obrigatório em caso de reincidência)' },
    { k: 'mediacao', t: 'Mediação de conflitos / práticas restaurativas' },
    { k: 'reparacao', t: 'Ação de reparação (quando houver dano)' },
    { k: 'gestao', t: 'Encaminhar à gestão / coordenação' },
  ],
};

// Tipos padrão. categoria: urgencia | grave | administrativa.
// gravidade: gravidade inicial sugerida (a gestão pode aumentar depois).
export const TIPOS_PADRAO = [
  // ── Administrativas / disciplinares ─────────────────────────────────────
  { codigo: 'A1', categoria: 'administrativa', gravidade: 'leve', descricao: 'Saiu da sala sem permissão' },
  { codigo: 'A2', categoria: 'administrativa', gravidade: 'leve', descricao: 'Não abriu o caderno / recusou-se a realizar a atividade' },
  { codigo: 'A3', categoria: 'administrativa', gravidade: 'leve', descricao: 'Recusou-se a tirar o boné / chapéu / capuz' },
  { codigo: 'A4', categoria: 'administrativa', gravidade: 'leve', descricao: 'Incidente no intervalo' },
  { codigo: 'A5', categoria: 'administrativa', gravidade: 'media', descricao: 'Acidente no intervalo ou em aula (sem necessidade de pronto-socorro)' },
  { codigo: 'A6', categoria: 'administrativa', gravidade: 'leve', descricao: 'Uso indevido de celular / equipamento eletrônico' },
  { codigo: 'A7', categoria: 'administrativa', gravidade: 'leve', descricao: 'Perturbou / atrapalhou a aula' },
  { codigo: 'A8', categoria: 'administrativa', gravidade: 'leve', descricao: 'Dormiu durante a aula' },
  { codigo: 'A9', categoria: 'administrativa', gravidade: 'leve', descricao: 'Sem material escolar' },
  { codigo: 'A10', categoria: 'administrativa', gravidade: 'leve', descricao: 'Sem uniforme escolar' },
  { codigo: 'A11', categoria: 'administrativa', gravidade: 'leve', descricao: 'Atrasos repetidos' },
  { codigo: 'A12', categoria: 'administrativa', gravidade: 'media', descricao: 'Saiu da escola mais cedo sem autorização' },
  { codigo: 'A13', categoria: 'administrativa', gravidade: 'leve', descricao: 'Linguagem inadequada (palavrão)' },
  { codigo: 'A14', categoria: 'administrativa', gravidade: 'media', descricao: 'Comportamento desrespeitoso com professor(a) ou servidor(a)' },
  { codigo: 'A15', categoria: 'administrativa', gravidade: 'media', descricao: 'Danificou material da escola ou de colega' },
  { codigo: 'A16', categoria: 'administrativa', gravidade: 'leve', descricao: 'Outra ocorrência administrativa (descrever no relato)' },

  // ── Protocolo 179 — Urgência / Emergência ───────────────────────────────
  { codigo: 'I', categoria: 'urgencia', gravidade: 'urgencia', descricao: 'Ameaça / risco iminente à vida (atirador, massacre)' },
  { codigo: 'II', categoria: 'urgencia', gravidade: 'urgencia', descricao: 'Fenômenos naturais com risco à unidade escolar (inundação, desabamento)' },
  { codigo: 'XII', categoria: 'urgencia', gravidade: 'urgencia', descricao: 'Mal súbito com resultado morte' },
  { codigo: 'XX', categoria: 'urgencia', gravidade: 'urgencia', descricao: 'Fake news — ameaça de massacre / atentado' },
  { codigo: 'XXI', categoria: 'urgencia', gravidade: 'urgencia', descricao: 'Posse de arma (branca, de fogo, réplica ou objeto perigoso)' },
  { codigo: 'XXII', categoria: 'urgencia', gravidade: 'urgencia', descricao: 'Agressão física grave (lesão corporal)' },
  { codigo: 'XXIII', categoria: 'urgencia', gravidade: 'urgencia', descricao: 'Homicídio / tentativa de homicídio' },
  { codigo: 'XXV', categoria: 'urgencia', gravidade: 'urgencia', descricao: 'Importunação sexual' },
  { codigo: 'XXVII', categoria: 'urgencia', gravidade: 'urgencia', descricao: 'Violência contra criança/adolescente / abuso sexual' },

  // ── Protocolo 179 — Graves ──────────────────────────────────────────────
  { codigo: 'III', categoria: 'grave', gravidade: 'grave', descricao: 'Agressão verbal entre estudantes e/ou servidores' },
  { codigo: 'IV', categoria: 'grave', gravidade: 'grave', descricao: 'Uso de tabaco, cigarro eletrônico ou fumígeno' },
  { codigo: 'V', categoria: 'grave', gravidade: 'grave', descricao: 'Porte / uso de entorpecentes' },
  { codigo: 'VI', categoria: 'grave', gravidade: 'grave', descricao: 'Bullying / cyberbullying / humilhação sistemática' },
  { codigo: 'VII', categoria: 'grave', gravidade: 'grave', descricao: 'Estudante com sinais de maus-tratos ou abandono' },
  { codigo: 'VIII', categoria: 'grave', gravidade: 'grave', descricao: 'Sinais de alerta / tentativa de suicídio' },
  { codigo: 'IX', categoria: 'grave', gravidade: 'grave', descricao: 'Desaparecimento de estudante comunicado por familiares' },
  { codigo: 'X', categoria: 'grave', gravidade: 'grave', descricao: 'Mal súbito (comunidade escolar)' },
  { codigo: 'XI', categoria: 'grave', gravidade: 'grave', descricao: 'Mal súbito com necessidade de condução a pronto-socorro' },
  { codigo: 'XIII', categoria: 'grave', gravidade: 'grave', descricao: 'Estelionato / falso PIX' },
  { codigo: 'XIV', categoria: 'grave', gravidade: 'grave', descricao: 'Roubo / furto entre membros da unidade escolar' },
  { codigo: 'XV', categoria: 'grave', gravidade: 'grave', descricao: 'Racismo / injúria racial' },
  { codigo: 'XVI', categoria: 'grave', gravidade: 'grave', descricao: 'Homofobia / transfobia' },
  { codigo: 'XVII', categoria: 'grave', gravidade: 'grave', descricao: 'Dano ao patrimônio público' },
  { codigo: 'XVIII', categoria: 'grave', gravidade: 'grave', descricao: 'Invasão da unidade escolar' },
  { codigo: 'XIX', categoria: 'grave', gravidade: 'grave', descricao: 'Ameaça (palavra, escrito ou gesto)' },
  { codigo: 'XXIV', categoria: 'grave', gravidade: 'grave', descricao: 'Ato obsceno' },
  { codigo: 'XXVI', categoria: 'grave', gravidade: 'grave', descricao: 'Assédio moral ou sexual' },
];
