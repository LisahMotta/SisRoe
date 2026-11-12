// whatsapp.js — mensagem da busca ativa e link do WhatsApp (wa.me).
// O link abre o WhatsApp (aplicativo no celular ou WhatsApp Web no computador) com a
// mensagem pronta. Quem envia é a pessoa, depois de conferir o texto.

export const MODELO_PADRAO =
  'Olá, {responsavel}! Aqui é da {escola}. Notamos que {aluno} ({turma}) teve {faltas} falta(s){periodo}. ' +
  'Está tudo bem? Queremos ajudar no retorno às aulas. Por favor, entre em contato com a escola' +
  '{telefone_escola}. Obrigado!';

export const CAMPOS_MODELO = ['{responsavel}', '{aluno}', '{turma}', '{faltas}', '{periodo}', '{escola}', '{telefone_escola}'];

const dataBR = (iso) => (iso ? iso.split('-').reverse().join('/') : '');

/** Troca os campos {aluno}, {faltas}… pelos dados do caso. */
export function montarMensagem(modelo, { responsavel, aluno, turma, faltas, inicio, fim, escola, telefoneEscola }) {
  const primeiroNome = (n) => String(n || '').trim().split(/\s+/)[0] || '';
  const titulo = (n) => primeiroNome(n).charAt(0).toUpperCase() + primeiroNome(n).slice(1).toLowerCase();
  const periodo = inicio && fim ? ` entre ${dataBR(inicio)} e ${dataBR(fim)}` : inicio ? ` desde ${dataBR(inicio)}` : '';
  return (modelo || MODELO_PADRAO)
    .replaceAll('{responsavel}', responsavel ? titulo(responsavel) : 'família')
    .replaceAll('{aluno}', titulo(aluno))
    .replaceAll('{turma}', turma || '')
    .replaceAll('{faltas}', String(faltas ?? ''))
    .replaceAll('{periodo}', periodo)
    .replaceAll('{escola}', escola || 'escola')
    .replaceAll('{telefone_escola}', telefoneEscola ? ` pelo telefone ${telefoneEscola}` : '');
}

/** Número só com dígitos, com 55 na frente (Brasil). Vazio se inválido. */
export function numeroWhatsApp(tel) {
  let d = String(tel || '').replace(/\D/g, '');
  if (d.length >= 12 && d.startsWith('55')) d = d.slice(2);
  return d.length === 10 || d.length === 11 ? `55${d}` : '';
}

export function linkWhatsApp(tel, mensagem) {
  const n = numeroWhatsApp(tel);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(mensagem)}` : '';
}

export function telefoneBR(tel) {
  const d = String(tel || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return tel || '';
}
