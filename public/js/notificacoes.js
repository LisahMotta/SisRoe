// notificacoes.js — avisos dentro do sistema (pop-up) e notificações do aparelho (Web Push).
//
// Pop-up: a cada 45 s (só com a aba visível) a página consulta /api/notificacoes.
//  • equipe gestora: aviso de cada ocorrência nova registrada por outra pessoa;
//  • todos: aviso de mensagem nova no chat das ocorrências que podem ver.
// Notificação do aparelho: chega mesmo com o SisRoe fechado, se a pessoa ativar em
// "Minha conta" e o servidor tiver as chaves VAPID configuradas.
import { api } from './api.js';
import { esc, icone } from './ui.js';

let timer = null;
let ref = null; // { desde, ultimaMsg }
export let naoLidas = {};
const ouvintes = new Set();

/** Telas podem pedir para ser avisadas quando os contadores mudarem (ex.: lista). */
export function aoMudarNaoLidas(fn) { ouvintes.add(fn); return () => ouvintes.delete(fn); }

function caixa() {
  let c = document.getElementById('popups');
  if (!c) {
    c = Object.assign(document.createElement('div'), { id: 'popups' });
    c.setAttribute('aria-live', 'polite');
    document.body.append(c);
  }
  return c;
}

function popup({ tipo, titulo, texto, url, occ }) {
  const el = document.createElement('div');
  el.className = `popup popup-${tipo}`;
  el.dataset.occ = String(occ);
  el.setAttribute('role', 'alert');
  el.innerHTML = `${icone(tipo === 'nova' ? 'alerta' : 'nota')}
    <div class="popup-corpo"><strong>${esc(titulo)}</strong><p>${esc(texto)}</p>
      <div class="popup-acoes"><a class="btn btn-primario btn-peq" href="${esc(url)}">${tipo === 'nova' ? 'Abrir ocorrência e chat' : 'Abrir conversa'}</a>
      <button class="btn btn-peq" data-fechar-popup>Depois</button></div></div>`;
  el.addEventListener('click', (e) => { if (e.target.closest('[data-fechar-popup], a')) el.remove(); });
  const c = caixa();
  c.append(el);
  while (c.children.length > 4) c.firstElementChild.remove();
  setTimeout(() => el.remove(), 60000);
}

function atualizarContador(total) {
  const link = document.querySelector('#menu a[data-rota="ocorrencias"]');
  if (!link) return;
  let b = link.querySelector('.contador');
  if (!total) { b?.remove(); return; }
  if (!b) { b = Object.assign(document.createElement('span'), { className: 'contador' }); link.append(b); }
  b.textContent = total > 99 ? '99+' : String(total);
  b.setAttribute('aria-label', `${total} mensagem(ns) não lida(s)`);
}

export async function atualizarAvisos() {
  if (document.hidden) return;
  try {
    const q = ref ? `?desde=${encodeURIComponent(ref.desde)}&ultimaMsg=${ref.ultimaMsg}` : '';
    const r = await api(`/notificacoes${q}`);
    if (ref) {
      for (const o of r.novas) {
        popup({ tipo: 'nova', titulo: `Nova ocorrência ${o.numero}`, texto: `${o.tipo_codigo} · ${o.tipo_descricao}${o.turma_nome ? ` · ${o.turma_nome}` : ''} — por ${o.registrado_por_nome}`, url: `#/ocorrencia/${o.id}`, occ: o.id });
      }
      for (const m of r.mensagens) {
        // Quem já está com a conversa aberta não precisa do pop-up.
        if (location.hash === `#/ocorrencia/${m.ocorrencia_id}`) continue;
        popup({ tipo: 'msg', titulo: `Mensagem na ocorrência ${m.numero}`, texto: `${m.usuario_nome}: ${m.texto.slice(0, 140)}`, url: `#/ocorrencia/${m.ocorrencia_id}`, occ: m.ocorrencia_id });
      }
    }
    ref = { desde: r.agora, ultimaMsg: r.ultimaMsg };
    naoLidas = r.naoLidas;
    atualizarContador(r.totalNaoLidas);
    ouvintes.forEach((fn) => fn(naoLidas));
  } catch { /* sem conexão: tenta de novo na próxima volta */ }
}

/** Ao abrir uma ocorrência, os pop-ups dela já não são necessários. */
export function fecharPopupsDa(occId) {
  document.querySelectorAll(`#popups .popup[data-occ="${Number(occId)}"]`).forEach((p) => p.remove());
}

export function iniciarAvisos() {
  if (timer) return;
  ref = null;
  atualizarAvisos();
  timer = setInterval(atualizarAvisos, 45000);
  document.addEventListener('visibilitychange', aoVoltar);
}
function aoVoltar() { if (!document.hidden) atualizarAvisos(); }

export function pararAvisos() {
  clearInterval(timer); timer = null; ref = null; naoLidas = {};
  document.removeEventListener('visibilitychange', aoVoltar);
  document.getElementById('popups')?.remove();
  atualizarContador(0);
}

// ─── Notificações do aparelho (Web Push) ─────────────────────────────────────
const suportado = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

function chaveParaBytes(base64) {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const bin = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export async function situacaoPush() {
  if (!suportado()) return { suportado: false };
  const servidor = await api('/push/chave').catch(() => ({ ativo: false }));
  const reg = await navigator.serviceWorker.getRegistration('/');
  const inscricao = reg ? await reg.pushManager.getSubscription() : null;
  return { suportado: true, servidor: servidor.ativo, chave: servidor.chave, permissao: Notification.permission, inscrito: !!inscricao };
}

export async function ativarPush() {
  const s = await situacaoPush();
  if (!s.suportado) throw new Error('Este navegador não aceita notificações. No iPhone, primeiro adicione o SisRoe à Tela de Início (Compartilhar → Adicionar à Tela de Início).');
  if (!s.servidor) throw new Error('As notificações do aparelho ainda não foram configuradas no servidor. Os avisos continuam aparecendo dentro do sistema.');
  const permissao = await Notification.requestPermission();
  if (permissao !== 'granted') throw new Error('Permissão negada. Para mudar, libere as notificações do site nas configurações do navegador.');
  const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await navigator.serviceWorker.ready;
  const inscricao = (await reg.pushManager.getSubscription())
    || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: chaveParaBytes(s.chave) });
  await api('/push/inscrever', { metodo: 'POST', corpo: { inscricao: inscricao.toJSON() } });
}

export async function desativarPush() {
  const reg = await navigator.serviceWorker.getRegistration('/');
  const inscricao = reg ? await reg.pushManager.getSubscription() : null;
  if (inscricao) {
    await api('/push/cancelar', { metodo: 'POST', corpo: { endpoint: inscricao.endpoint } }).catch(() => {});
    await inscricao.unsubscribe();
  }
}
