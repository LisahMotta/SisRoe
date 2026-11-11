// app.js — ponto de partida do site: sessão, menu e troca de telas.
//
// As telas ficam na pasta /js/telas. Cada uma exporta uma função
// render(conteudo, parametros) que desenha a tela dentro de <main>.
// O endereço depois do "#" decide a tela: #/painel, #/ocorrencia/12 …
import { api, getSessao, limparSessao } from './api.js';
import { $, $$, esc, avisarErro } from './ui.js';
import { PERFIS, PERFIS_GESTAO, PERFIS_ADMIN } from './catalogo.js';

// Dados carregados após o login e usados por várias telas.
export const estado = { usuario: null, escola: null, turmas: [], tipos: [] };

export const ehGestao = () => PERFIS_GESTAO.includes(estado.usuario?.perfil);
export const ehAdmin = () => PERFIS_ADMIN.includes(estado.usuario?.perfil);

const ROTAS = {
  login: () => import('./telas/login.js'),
  cadastro: () => import('./telas/login.js').then((m) => ({ render: m.renderCadastro })),
  'trocar-senha': () => import('./telas/conta.js').then((m) => ({ render: m.renderTrocaObrigatoria })),
  painel: () => import('./telas/painel.js'),
  nova: () => import('./telas/nova.js'),
  ocorrencias: () => import('./telas/lista.js'),
  ocorrencia: () => import('./telas/detalhe.js'),
  alunos: () => import('./telas/alunos.js'),
  admin: () => import('./telas/admin.js'),
  conta: () => import('./telas/conta.js'),
};
const PUBLICAS = ['login', 'cadastro'];

/** Recarrega turmas e tipos (chamado após login e após mudanças na administração). */
export async function recarregarCadastros() {
  const [turmas, tipos] = await Promise.all([api('/turmas'), api('/tipos')]);
  estado.turmas = turmas;
  estado.tipos = tipos;
}

async function carregarSessao() {
  const dados = await api('/eu');
  estado.usuario = dados.usuario;
  estado.escola = dados.escola;
  if (!dados.usuario.trocar_senha) await recarregarCadastros();
}

function montarTopo() {
  const u = estado.usuario;
  $('#topo').hidden = false;
  $('#topo-escola-nome').textContent = estado.escola?.nome || 'SisRoe';
  $('#topo-usuario').textContent = `${u.nome} · ${PERFIS[u.perfil] || u.perfil}`;
  $$('[data-gestao]').forEach((el) => { el.hidden = !ehGestao(); });
  $$('[data-admin]').forEach((el) => { el.hidden = !ehAdmin(); });
}

export function navegar(hash) {
  if (location.hash === hash) roteador();
  else location.hash = hash;
}

let renderizando = 0;
async function roteador() {
  const [nome = '', ...params] = location.hash.replace(/^#\/?/, '').split('/');
  const rota = ROTAS[nome] ? nome : (getSessao() ? 'painel' : 'login');
  const conteudo = $('#conteudo');
  const minha = ++renderizando;

  // Sem login: só telas públicas.
  if (!PUBLICAS.includes(rota)) {
    if (!getSessao()) return navegar('#/login');
    if (!estado.usuario) {
      try { await carregarSessao(); } catch (e) { avisarErro(e); limparSessao(); return navegar('#/login'); }
    }
    if (estado.usuario.trocar_senha && rota !== 'trocar-senha') return navegar('#/trocar-senha');
    montarTopo();
  } else {
    $('#topo').hidden = true;
  }

  $$('#menu a').forEach((a) => a.classList.toggle('ativo', a.dataset.rota === rota));
  fecharMenu();
  conteudo.innerHTML = '<p class="carregando">Carregando…</p>';
  try {
    const modulo = await ROTAS[rota]();
    if (minha !== renderizando) return; // o usuário já trocou de tela
    await modulo.render(conteudo, params);
    conteudo.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  } catch (e) {
    console.error(e);
    conteudo.innerHTML = `<div class="cartao erro-tela"><h2>Não foi possível abrir esta tela</h2><p>${esc(e.message)}</p>
      <p><a href="#/painel" class="btn">Voltar ao início</a></p></div>`;
  }
}

export function sair() {
  limparSessao();
  estado.usuario = null;
  estado.escola = null;
  navegar('#/login');
}

function fecharMenu() {
  $('#menu').classList.remove('aberto');
  $('#btn-menu').setAttribute('aria-expanded', 'false');
}

$('#btn-menu').addEventListener('click', () => {
  const aberto = $('#menu').classList.toggle('aberto');
  $('#btn-menu').setAttribute('aria-expanded', String(aberto));
});
$('#btn-sair').addEventListener('click', sair);
window.addEventListener('hashchange', roteador);
roteador();
