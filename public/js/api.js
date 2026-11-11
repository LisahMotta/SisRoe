// api.js — conversa com o servidor e guarda a sessão no navegador.

const CHAVE = 'sisroe_sessao';

export function getSessao() {
  try { return JSON.parse(localStorage.getItem(CHAVE)) || null; } catch { return null; }
}
export function salvarSessao(s) {
  try { localStorage.setItem(CHAVE, JSON.stringify(s)); } catch { /* navegador sem armazenamento */ }
}
export function limparSessao() {
  try { localStorage.removeItem(CHAVE); } catch { /* idem */ }
}
// Lembra o código da escola para o próximo login (comodidade).
export function ultimoCodigo(c) {
  try {
    if (c !== undefined) localStorage.setItem('sisroe_codigo', c);
    return localStorage.getItem('sisroe_codigo') || '';
  } catch { return ''; }
}

/**
 * Chama a API. Lança Error com a mensagem do servidor em caso de falha.
 * Se a sessão expirou, limpa e volta para o login.
 */
export async function api(caminho, { metodo = 'GET', corpo } = {}) {
  const s = getSessao();
  let r;
  try {
    r = await fetch('/api' + caminho, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        ...(s?.token ? { Authorization: `Bearer ${s.token}` } : {}),
      },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new Error('Sem conexão com o servidor. Verifique a internet.');
  }
  const dados = await r.json().catch(() => ({}));
  if (r.status === 401 && s) {
    limparSessao();
    location.hash = '#/login';
  }
  if (r.status === 403 && dados.trocarSenha) location.hash = '#/trocar-senha';
  if (!r.ok) throw new Error(dados.erro || `Erro ${r.status}`);
  return dados;
}

/** Baixa um arquivo da API (ex.: CSV) usando o token. */
export async function baixar(caminho, nomeArquivo) {
  const s = getSessao();
  const r = await fetch('/api' + caminho, { headers: { Authorization: `Bearer ${s?.token}` } });
  if (!r.ok) throw new Error('Não foi possível gerar o arquivo.');
  const url = URL.createObjectURL(await r.blob());
  const a = Object.assign(document.createElement('a'), { href: url, download: nomeArquivo });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
