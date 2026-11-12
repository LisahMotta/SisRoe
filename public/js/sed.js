// sed.js — leitura das listas de alunos exportadas da SED (Secretaria Escolar Digital).
//
// Aceita CSV com separador ; , | ou tabulação, com ou sem título antes do cabeçalho,
// em UTF-8 ou Windows-1252 (padrão das exportações). Só alunos com situação "Ativo"
// (ou sem coluna de situação) são importados. Se não houver coluna de turma, a turma
// é o nome do arquivo (ex.: "7º Ano A.csv").

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

// Nomes de coluna aceitos (já normalizados: minúsculas, sem acento, sem pontuação).
const COLUNAS = {
  nome: ['nome do aluno', 'nome aluno', 'nome do estudante', 'nome', 'aluno', 'estudante'],
  ra: ['ra', 'r a', 'numero do ra', 'n ra', 'ra aluno'],
  ra_digito: ['dig ra', 'digito ra', 'dig', 'digito', 'dv'],
  turma: ['turma', 'classe', 'serie turma', 'nome da turma', 'descricao da turma', 'serie'],
  situacao: ['situacao', 'situacao do aluno', 'situacao da matricula', 'status'],
  data_nascimento: ['data de nascimento', 'data nascimento', 'nascimento', 'dt nascimento', 'data nasc'],
  responsavel: ['responsavel', 'nome do responsavel', 'nome da mae', 'mae', 'filiacao 1', 'filiacao'],
  telefone: ['telefone', 'celular', 'telefone 1', 'fone', 'tel', 'telefone celular', 'celular responsavel'],
  telefone2: ['telefone 2', 'telefone residencial', 'fone 2', 'tel 2', 'outro telefone'],
};

function acharColunas(cab) {
  const n = cab.map(norm);
  const idx = {};
  for (const [campo, nomes] of Object.entries(COLUNAS)) {
    let i = -1;
    for (const nome of nomes) { i = n.indexOf(nome); if (i >= 0) break; }
    // "nome" exato pode pegar "nome da mãe": se houver coluna de aluno, ela tem prioridade (ordem da lista acima).
    if (i >= 0 && !Object.values(idx).includes(i)) idx[campo] = i;
  }
  return idx;
}

function separador(linha) {
  const conta = (c) => linha.split(c).length - 1;
  return ['\t', ';', '|', ','].map((c) => [c, conta(c)]).sort((a, b) => b[1] - a[1])[0][0];
}

/** Divide uma linha CSV respeitando aspas ("Silva; Ana" fica numa coluna só). */
function dividir(linha, sep) {
  const out = [];
  let atual = '', aspas = false;
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (c === '"') {
      if (aspas && linha[i + 1] === '"') { atual += '"'; i++; } else aspas = !aspas;
    } else if (c === sep && !aspas) { out.push(atual.trim()); atual = ''; } else atual += c;
  }
  out.push(atual.trim());
  return out;
}

function lerTexto(texto, nomeArquivo) {
  const linhas = texto.replace(/^﻿/, '').split(/\r\n|\n|\r/).filter((l) => l.trim());
  // O cabeçalho pode não ser a primeira linha (a SED às vezes põe o título da turma antes).
  for (let i = 0; i < Math.min(15, linhas.length); i++) {
    const sep = separador(linhas[i]);
    const cab = dividir(linhas[i], sep);
    const idx = acharColunas(cab);
    if (idx.nome === undefined) continue;
    const turmaArquivo = (nomeArquivo || '').replace(/\.(csv|txt)$/i, '').replace(/[_]+/g, ' ').trim();
    // Linhas acima do cabeçalho com "Turma:" ou "Classe:" dão o nome da turma.
    const tituloTurma = linhas.slice(0, i).map((l) => l.match(/(?:turma|classe)\s*[:\-]\s*([^;,|\t]+)/i)?.[1]?.trim()).find(Boolean);
    const alunos = [], ignorados = [];
    for (const l of linhas.slice(i + 1)) {
      const c = dividir(l, sep);
      const val = (campo) => (idx[campo] !== undefined ? (c[idx[campo]] || '').trim() : '');
      const nome = val('nome');
      if (!nome || /^\d+$/.test(nome)) continue;
      const sit = norm(val('situacao'));
      if (sit && !/^ativ/.test(sit)) { ignorados.push({ nome, situacao: val('situacao') }); continue; }
      let turma = val('turma');
      if (!turma || /^[\dºª°\s]+$/.test(turma)) turma = tituloTurma || turmaArquivo;
      alunos.push({
        turma, nome, ra: val('ra'), ra_digito: val('ra_digito'), data_nascimento: val('data_nascimento'),
        responsavel: val('responsavel'), telefone: val('telefone'), telefone2: val('telefone2'),
      });
    }
    return { cabecalho: cab, colunas: Object.keys(idx), alunos, ignorados };
  }
  return { erro: 'Não encontrei a coluna com o nome do aluno. Confira se o arquivo é a lista de alunos exportada da SED.', primeiraLinha: linhas[0] || '' };
}

/** Lê um arquivo (File) e devolve { alunos, ignorados, colunas } ou { erro }. */
export async function lerArquivoSED(arquivo) {
  if (/\.xlsx?$/i.test(arquivo.name)) {
    return { erro: 'Arquivo do Excel (.xlsx). Abra no Excel ou Planilhas Google e use "Salvar como / Fazer download → CSV".' };
  }
  const buf = await arquivo.arrayBuffer();
  let texto;
  try { texto = new TextDecoder('utf-8', { fatal: true }).decode(buf); }
  catch { texto = new TextDecoder('windows-1252').decode(buf); } // acentos das exportações da SED
  return lerTexto(texto, arquivo.name);
}

export { lerTexto as _lerTexto };

// ─── Lista da equipe (nome + RG ou CIN) ──────────────────────────────────────
const COL_EQUIPE = {
  nome: ['nome', 'nome completo', 'professor', 'professora', 'servidor', 'nome do servidor', 'nome do professor', 'docente'],
  documento: ['rg', 'cin', 'rg ou cin', 'rg cin', 'cpf', 'documento', 'doc', 'identidade', 'numero do rg', 'n rg', 'cin cpf'],
  perfil: ['perfil', 'cargo', 'funcao', 'funcao cargo'],
};
// Palavras da planilha → perfil do SisRoe.
const PERFIL_TEXTO = [
  [/coorden/, 'coordenador'], [/\bpoc\b|orientador de conviv/, 'poc'], [/vice/, 'vice'],
  [/diretor|direcao/, 'diretor'], [/agente|aoe|inspetor|organizacao escolar/, 'agente'], [/prof/, 'professor'],
];
export function perfilDoTexto(t) {
  const n = norm(t);
  return n ? (PERFIL_TEXTO.find(([re]) => re.test(n))?.[1] || '') : '';
}

/**
 * Lê a lista da equipe colada da planilha ou de um arquivo CSV.
 * Com cabeçalho: colunas Nome e RG/CIN (e Perfil/Cargo, opcional), em qualquer ordem.
 * Sem cabeçalho: 1ª coluna = nome, 2ª = RG ou CIN, 3ª (opcional) = perfil.
 */
export function lerListaEquipe(texto) {
  const linhas = String(texto || '').replace(/^﻿/, '').split(/\r\n|\n|\r/).filter((l) => l.trim());
  if (!linhas.length) return { erro: 'A lista está vazia.' };
  const sep = separador(linhas[0]);
  const cab = dividir(linhas[0], sep).map(norm);
  const achar = (nomes) => { for (const n of nomes) { const i = cab.indexOf(n); if (i >= 0) return i; } return -1; };
  let iNome = achar(COL_EQUIPE.nome), iDoc = achar(COL_EQUIPE.documento), iPerfil = achar(COL_EQUIPE.perfil);
  let inicio = 1;
  if (iNome < 0 || iDoc < 0) { iNome = 0; iDoc = 1; iPerfil = 2; inicio = 0; } // sem cabeçalho
  const pessoas = [];
  for (const l of linhas.slice(inicio)) {
    const c = dividir(l, sep);
    const nome = (c[iNome] || '').trim();
    const documento = (c[iDoc] || '').trim();
    if (!nome && !documento) continue;
    pessoas.push({ nome, documento, perfil: perfilDoTexto(c[iPerfil]) || 'professor' });
  }
  if (!pessoas.length) return { erro: 'Não encontrei nomes na lista.' };
  return { pessoas };
}

/** Lê um arquivo de texto (CSV/TXT) em UTF-8 ou Windows-1252. */
export async function lerArquivoTexto(arquivo) {
  if (/\.xlsx?$/i.test(arquivo.name)) throw new Error('Arquivo do Excel (.xlsx): salve como CSV ou copie as colunas e cole na caixa de texto.');
  const buf = await arquivo.arrayBuffer();
  try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch { return new TextDecoder('windows-1252').decode(buf); }
}
