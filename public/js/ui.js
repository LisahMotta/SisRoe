// ui.js — funções de interface reutilizadas por todas as telas.
import { CATEGORIAS, GRAVIDADES, STATUS } from './catalogo.js';
import { icone } from './icones.js';

export { icone };

/** Coloca o ícone em todo elemento com data-icone="nome" (uma vez só). */
export function aplicarIcones(raiz = document) {
  raiz.querySelectorAll('[data-icone]').forEach((el) => {
    if (!el.querySelector(':scope > .ico')) el.insertAdjacentHTML('afterbegin', icone(el.dataset.icone));
  });
}

/** Escapa texto antes de colocar no HTML (evita que um relato "quebre" a página ou injete código). */
export function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export const $ = (sel, raiz = document) => raiz.querySelector(sel);
export const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

export function dataBR(iso) {
  if (!iso) return '';
  const [a, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}
export function dataHoraBR(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
export function hojeISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
export function agoraHora() {
  return new Date().toTimeString().slice(0, 5);
}

export const seloCategoria = (c) => `<span class="selo cat-${esc(c)}">${esc(CATEGORIAS[c]?.nome || c)}</span>`;
export const seloGravidade = (g) => `<span class="selo grav-${esc(g)}">${esc(GRAVIDADES[g] || g)}</span>`;
export const seloStatus = (s) => `<span class="selo st-${esc(s)}">${esc(STATUS[s] || s)}</span>`;

// ─── Avisos rápidos (toast) ──────────────────────────────────────────────────
export function avisar(msg, tipo = 'ok') {
  let caixa = $('#avisos');
  if (!caixa) {
    caixa = Object.assign(document.createElement('div'), { id: 'avisos' });
    caixa.setAttribute('aria-live', 'polite');
    document.body.append(caixa);
  }
  const el = document.createElement('div');
  el.className = `aviso aviso-${tipo}`;
  el.setAttribute('role', tipo === 'erro' ? 'alert' : 'status');
  el.innerHTML = icone(tipo === 'erro' ? 'erro' : 'ok');
  el.append(document.createTextNode(msg));
  el.title = 'Clique para fechar';
  el.addEventListener('click', () => el.remove());
  caixa.append(el);
  while (caixa.children.length > 3) caixa.firstElementChild.remove();
  setTimeout(() => el.remove(), tipo === 'erro' ? 6000 : 3500);
}
export const avisarErro = (e) => avisar(e?.message || String(e), 'erro');

/** Mostra uma janela (modal) com HTML e devolve o elemento para ligar os eventos. */
export function abrirModal(titulo, html) {
  fecharModal();
  const fundo = document.createElement('div');
  fundo.className = 'modal-fundo';
  fundo.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
      <div class="modal-topo"><h2 id="modal-titulo">${esc(titulo)}</h2>
      <button class="btn-icone" data-fechar aria-label="Fechar">${icone('fechar')}</button></div>
      <div class="modal-corpo">${html}</div></div>`;
  fundo.addEventListener('click', (ev) => {
    if (ev.target === fundo || ev.target.closest('[data-fechar]')) fecharModal();
  });
  document.body.append(fundo);
  aplicarIcones(fundo);
  const primeiro = fundo.querySelector('input, select, textarea, button:not([data-fechar])');
  if (primeiro) primeiro.focus();
  return fundo;
}
export function fecharModal() {
  $$('.modal-fundo').forEach((m) => m.remove());
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharModal(); });

/** Lê os campos de um formulário como objeto { name: valor }. */
export function lerForm(form) {
  const o = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    if (el.type === 'checkbox') o[el.name] = el.checked;
    else o[el.name] = el.value;
  }
  return o;
}

/**
 * Imprime um documento avulso (ex.: comunicação à família, relatório) sem a tela atrás.
 * O HTML entra num contêiner próprio; o CSS de impressão esconde o resto da página.
 */
export function imprimirAvulso(html) {
  $('#impressao-avulsa')?.remove();
  const box = document.createElement('div');
  box.id = 'impressao-avulsa';
  box.className = 'documento';
  box.innerHTML = html;
  document.body.append(box);
  document.body.classList.add('modo-avulso');
  const limpar = () => {
    document.body.classList.remove('modo-avulso');
    box.remove();
    window.removeEventListener('afterprint', limpar);
  };
  window.addEventListener('afterprint', limpar);
  window.print();
}

/** Desativa o botão enquanto a ação roda (evita clique duplo = registro duplicado). */
export async function comCarregando(botao, fn) {
  const original = botao?.innerHTML; // guarda o ícone junto com o texto
  if (botao) { botao.disabled = true; botao.textContent = 'Aguarde…'; }
  try { return await fn(); }
  finally { if (botao) { botao.disabled = false; botao.innerHTML = original; } }
}
