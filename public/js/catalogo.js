// catalogo.js — listas e rótulos usados pelo servidor e pelo navegador.
//
// • As 50 situações do Protocolo 179 — 3ª versão (com os passos de cada uma)
//   ficam em server/protocolo179.js, gerado a partir do documento oficial.
// • As intervenções administrativas, os níveis de resposta e as regras do
//   afastamento preventivo seguem a Resolução SEDUC nº 68, de 19/06/2026.
// • Cada escola pode editar seus tipos em Administração → Tipos de ocorrência.

// Agrupamento do SisRoe para agilizar o registro (o Protocolo usa as macrocategorias abaixo).
export const CATEGORIAS = {
  urgencia: {
    nome: 'Emergência',
    resumo: 'Risco imediato à vida ou à segurança: acionar 190, 192, 193 ou o Botão do Pânico primeiro.',
  },
  grave: {
    nome: 'Protocolo 179',
    resumo: 'Violências, violência sexual, substâncias, patrimônio, alertas comportamentais e outras situações de risco.',
  },
  administrativa: {
    nome: 'Indisciplina / Administrativa',
    resumo: 'Descumprimento de normas: sair da sala, boné, caderno, celular, atrasos, intervalo…',
  },
};

// Macrocategorias do capítulo 4 do Protocolo 179 — 3ª versão (alinhadas à Plataforma Conviva).
export const MACROS = {
  a: 'Acidentes e eventos inesperados',
  b: 'Violências e conflitos interpessoais',
  c: 'Violência sexual',
  d: 'Envolvimento com substâncias psicoativas',
  e: 'Incidentes relacionados ao patrimônio',
  f: 'Alertas comportamentais',
  g: 'Porte ou posse de armas',
  h: 'Indisciplina e descumprimento de normas',
  i: 'Ataque ativo',
  j: 'Outras situações de vulnerabilidade e risco',
};

// Boletim de Ocorrência — seção 1.4.4 do Protocolo 179 (3ª versão).
export const REGRAS_BO = {
  escola: 'A escola deve registrar o B.O. (dever institucional): indício de crime, violência grave, arma, tráfico, invasão ou dano ao patrimônio.',
  interessado: 'O registro cabe à vítima/família: a escola orienta (e documenta a orientação), mas não registra em nome de terceiros.',
  nao: 'Não há necessidade de B.O.: tratar pedagogicamente e, quando for o caso, com a rede protetiva.',
  avaliar: 'Avaliar: se houver crime público, violência grave ou risco coletivo, a escola registra; se atinge a pessoa de forma individual, orientar a família sobre o direito de registrar.',
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

// Procedimentos usados quando o tipo não tem passos próprios (tipos criados pela
// escola e as indisciplinas administrativas). Os 50 tipos do Protocolo trazem os
// passos do documento. A chave (k) é gravada na ocorrência quando o passo é
// marcado, então não mude as chaves já em uso.
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
  // Intervenções pedagógicas do Art. 7º da Resolução SEDUC nº 68/2026 (incisos I a X).
  administrativa: [
    { k: 'acolhimento', t: 'I — Acolhimento e escuta dos envolvidos' },
    { k: 'orientacao', t: 'II — Orientação individual e retomada dos combinados de convivência' },
    { k: 'compromisso', t: 'III — Repactuação de compromisso e plano individual de acompanhamento' },
    { k: 'familia', t: 'IV — Articulação com a família ou responsáveis legais' },
    { k: 'adulto_ref', t: 'V — Acompanhamento por adulto de referência da unidade escolar' },
    { k: 'mediacao', t: 'VI — Mediação de conflitos e práticas restaurativas (adesão voluntária)' },
    { k: 'reparacao', t: 'VII — Ações proporcionais de reparação e recomposição das relações' },
    { k: 'rede', t: 'VIII — Articulação com a rede protetiva ou órgãos competentes' },
    { k: 'estudo_dirigido', t: 'IX — Encaminhamento temporário a outro espaço (estudo dirigido), sob supervisão da gestão' },
    { k: 'outras', t: 'X — Outras intervenções pedagógicas compatíveis com a proteção integral' },
    { k: 'conviva', t: 'Registrar o episódio na Plataforma Conviva (Protocolo 179, 4.28 c)' },
  ],
};

// ─── Resolução SEDUC nº 68/2026 (indisciplina escolar) ───────────────────────
export const RES68 = 'Res. SEDUC nº 68/2026';

// Art. 5º — gradação das respostas institucionais.
export const NIVEIS = {
  1: { nome: 'Nível I', desc: 'Situação ordinária de indisciplina ou conflito cotidiano: intervenções pedagógicas e fluxos do Protocolo 179.' },
  2: { nome: 'Nível II', desc: 'Situação recorrente ou complexa, sem risco imediato: intensificar acompanhamento, família, repactuação, plano individual, mediação, estudo dirigido quando necessário.' },
  3: { nome: 'Nível III', desc: 'Risco, grave ruptura da convivência ou esgotamento das intervenções: avaliar afastamento preventivo temporário e, excepcionalmente, transferência cautelar.' },
};

// Art. 8º — atividades do estudo dirigido.
export const ATIVIDADES_ESTUDO_DIRIGIDO = [
  'Leitura orientada e reflexão sobre a situação ocorrida',
  'Produção escrita reflexiva sobre a conduta, consequências e possibilidades de reparação',
  'Atividades curriculares orientadas (inclusive Plataformas Educacionais)',
  'Acompanhamento direto por profissional da equipe escolar designado',
];

// Art. 11, § 1º — hipóteses do afastamento preventivo temporário.
export const HIPOTESES_AFASTAMENTO = {
  I: 'I — A permanência imediata do estudante representa risco concreto, atual ou fundamentadamente previsível à integridade de outros membros da comunidade escolar',
  II: 'II — O estudante está em risco no ambiente escolar (retaliações, ameaças, intimidações, agravamento de conflitos ou vulnerabilidade)',
  III: 'III — Recorrência grave de indisciplina ou ruptura da convivência, com esgotamento ou insuficiência das estratégias anteriores',
};
// Art. 11, §§ 5º e 6º — prazo inicial máximo, prorrogável uma vez por igual período.
export const AFASTAMENTO_MAX_DIAS = 5;

// Indisciplinas do dia a dia (macrocategoria "h" do Protocolo, seção 4.28 Indisciplina).
// São criadas em toda escola nova, junto com as 50 situações do Protocolo 179.
// O uso de celular está na situação 4.46 do Protocolo.
export const TIPOS_ADMINISTRATIVOS = [
  { codigo: 'A1', macro: 'h', gravidade: 'leve', descricao: 'Saiu da sala sem permissão' },
  { codigo: 'A2', macro: 'h', gravidade: 'leve', descricao: 'Não abriu o caderno / recusou-se a realizar a atividade' },
  { codigo: 'A3', macro: 'h', gravidade: 'leve', descricao: 'Recusou-se a tirar o boné / chapéu / capuz' },
  { codigo: 'A4', macro: 'h', gravidade: 'leve', descricao: 'Incidente no intervalo' },
  { codigo: 'A5', macro: 'a', gravidade: 'media', descricao: 'Acidente leve no intervalo ou em aula (sem necessidade de pronto-socorro)' },
  { codigo: 'A7', macro: 'h', gravidade: 'leve', descricao: 'Perturbou / atrapalhou a aula' },
  { codigo: 'A8', macro: 'h', gravidade: 'leve', descricao: 'Dormiu durante a aula' },
  { codigo: 'A9', macro: 'h', gravidade: 'leve', descricao: 'Sem material escolar' },
  { codigo: 'A10', macro: 'h', gravidade: 'leve', descricao: 'Sem uniforme escolar' },
  { codigo: 'A11', macro: 'h', gravidade: 'leve', descricao: 'Atrasos repetidos' },
  { codigo: 'A12', macro: 'h', gravidade: 'media', descricao: 'Saiu da escola mais cedo sem autorização' },
  { codigo: 'A13', macro: 'h', gravidade: 'leve', descricao: 'Linguagem inadequada (palavrão)' },
  { codigo: 'A14', macro: 'h', gravidade: 'media', descricao: 'Comportamento desrespeitoso com professor(a) ou servidor(a)' },
  { codigo: 'A15', macro: 'h', gravidade: 'media', descricao: 'Danificou material da escola ou de colega' },
  { codigo: 'A16', macro: 'h', gravidade: 'leve', descricao: 'Outra indisciplina (descrever no relato)' },
];
