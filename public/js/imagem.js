// imagem.js — redução de imagens no navegador e envio/abertura do carômetro em arquivo.
import { api } from './api.js';

function carregar(arquivo) {
  return new Promise((ok, falha) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); ok(img); };
    img.onerror = () => { URL.revokeObjectURL(url); falha(new Error(`Não foi possível ler a imagem "${arquivo.name || ''}".`)); };
    img.src = url;
  });
}

/** Foto de aluno: recorte central em retrato 3:4 (como foto de documento), no máximo `lado` px, JPEG. */
export async function reduzirFoto(arquivo, lado = 360, qualidade = 0.82) {
  const img = await carregar(arquivo);
  const alvoProp = 3 / 4;
  let sw = img.naturalWidth, sh = img.naturalHeight, sx = 0, sy = 0;
  if (sw / sh > alvoProp) { const nw = sh * alvoProp; sx = (sw - nw) / 2; sw = nw; }
  else { const nh = sw / alvoProp; sy = (sh - nh) / 2; sh = nh; }
  const h = Math.min(lado / alvoProp, sh), w = h * alvoProp;
  const c = document.createElement('canvas');
  c.width = Math.round(w); c.height = Math.round(h);
  c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', qualidade);
}

/** Folha do carômetro em JPG: mantém a página inteira, só reduz se for muito grande (lado maior ≤ 2400 px). */
async function reduzirFolha(arquivo) {
  if (arquivo.size < 1.5 * 1024 * 1024) return arquivo;
  const img = await carregar(arquivo);
  const escala = Math.min(1, 2400 / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * escala); c.height = Math.round(img.naturalHeight * escala);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  const blob = await new Promise((ok) => c.toBlob(ok, 'image/jpeg', 0.85));
  return blob && blob.size < arquivo.size ? new File([blob], arquivo.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : arquivo;
}

function emBase64(blob) {
  return new Promise((ok, falha) => {
    const leitor = new FileReader();
    leitor.onload = () => ok(String(leitor.result).split(',')[1] || '');
    leitor.onerror = () => falha(new Error('Não foi possível ler o arquivo.'));
    leitor.readAsDataURL(blob);
  });
}

const TAM_PARTE = 2_800_000; // igual ao servidor (routes/carometros.js)
export const MAX_CAROMETRO = 20 * 1024 * 1024;

export function tipoCarometro(arquivo) {
  const n = arquivo.name.toLowerCase();
  if (arquivo.type === 'application/pdf' || n.endsWith('.pdf')) return 'application/pdf';
  if (arquivo.type === 'image/jpeg' || /\.jpe?g$/.test(n)) return 'image/jpeg';
  if (arquivo.type === 'image/png' || n.endsWith('.png')) return 'image/png';
  return null;
}

/** Envia o carômetro (PDF/JPG) em partes. progresso(0..1) é chamado a cada parte. */
export async function enviarCarometro(arquivoOriginal, turmaId, progresso = () => {}) {
  let mime = tipoCarometro(arquivoOriginal);
  if (!mime) throw new Error('Escolha um arquivo PDF ou JPG.');
  const arquivo = mime === 'application/pdf' ? arquivoOriginal : await reduzirFolha(arquivoOriginal);
  if (arquivo !== arquivoOriginal) mime = 'image/jpeg';
  if (arquivo.size > MAX_CAROMETRO) throw new Error(`"${arquivo.name}" tem mais de 20 MB. Divida o PDF por turma.`);
  const b64 = await emBase64(arquivo);
  const partes = Math.max(1, Math.ceil(b64.length / TAM_PARTE));
  const { id } = await api('/carometros', { metodo: 'POST', corpo: {
    turma_id: turmaId || null, nome_arquivo: arquivo.name, mime, tamanho: arquivo.size, partes } });
  for (let i = 0; i < partes; i++) {
    await api(`/carometros/${id}/partes/${i}`, { metodo: 'PUT', corpo: { dados: b64.slice(i * TAM_PARTE, (i + 1) * TAM_PARTE) } });
    progresso((i + 1) / partes);
  }
  await api(`/carometros/${id}/concluir`, { metodo: 'POST' });
}

/** Baixa o carômetro parte por parte e devolve um Blob. */
export async function baixarCarometro(c, progresso = () => {}) {
  const pedacos = [];
  for (let i = 0; i < c.partes; i++) {
    const { dados } = await api(`/carometros/${c.id}/partes/${i}`);
    const bin = atob(dados);
    const bytes = new Uint8Array(bin.length);
    for (let j = 0; j < bin.length; j++) bytes[j] = bin.charCodeAt(j);
    pedacos.push(bytes);
    progresso((i + 1) / c.partes);
  }
  return new Blob(pedacos, { type: c.mime });
}

/**
 * Abre o carômetro numa nova aba (o PDF no leitor do navegador). A aba é aberta já no clique,
 * para o navegador não bloquear como pop-up; se mesmo assim for bloqueada, o arquivo é baixado.
 */
export async function abrirCarometro(c, progresso) {
  const aba = window.open('', '_blank');
  if (aba) aba.document.write('<p style="font-family:sans-serif;padding:24px">Abrindo o carômetro…</p>');
  try {
    const url = URL.createObjectURL(await baixarCarometro(c, progresso));
    if (aba) aba.location.href = url;
    else salvar(url, c.nome_arquivo);
    setTimeout(() => URL.revokeObjectURL(url), 10 * 60 * 1000);
  } catch (e) { aba?.close(); throw e; }
}

export async function baixarArquivoCarometro(c, progresso) {
  const url = URL.createObjectURL(await baixarCarometro(c, progresso));
  salvar(url, c.nome_arquivo);
  setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
}

function salvar(url, nome) {
  const a = document.createElement('a');
  a.href = url; a.download = nome || 'carometro';
  document.body.append(a); a.click(); a.remove();
}

export const tamanhoLegivel = (n) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1).replace('.', ',')} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

// ─── Fotos em lote: liga cada arquivo a um aluno pelo nome do arquivo ────────
const normalizar = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();

/**
 * Procura o aluno pelo nome do arquivo:
 *  • números (6 ou mais dígitos) = RA, com ou sem zeros à esquerda e com ou sem o dígito final;
 *  • senão, o nome do aluno (sem acentos, maiúsculas/minúsculas e separadores tanto faz).
 */
export function casarFoto(nomeArquivo, alunos) {
  const base = nomeArquivo.replace(/\.[^.]+$/, '');
  const numeros = (base.match(/\d{6,}/g) || []).sort((a, b) => b.length - a.length);
  for (const n of numeros) {
    const semZeros = n.replace(/^0+/, '');
    const a = alunos.find((x) => x.ra && [semZeros, semZeros.slice(0, -1)].includes(String(x.ra).replace(/^0+/, '')));
    if (a) return { aluno: a, por: 'RA' };
  }
  const nome = normalizar(base.replace(/\d+/g, ' '));
  if (nome.length >= 5) {
    const iguais = alunos.filter((x) => normalizar(x.nome) === nome);
    if (iguais.length === 1) return { aluno: iguais[0], por: 'nome' };
    if (iguais.length > 1) return { aluno: null, motivo: 'mais de um aluno com esse nome — use o RA no nome do arquivo' };
  }
  return { aluno: null, motivo: 'nenhum aluno com esse RA ou nome' };
}
