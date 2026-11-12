// app.js — ponto de partida do site: sessão, menu e troca de telas.
//
// As telas ficam na pasta /js/telas. Cada uma exporta uma função
// render(conteudo, parametros) que desenha a tela dentro de <main>.
// O endereço depois do "#" decide a tela: #/painel, #/ocorrencia/12 …
import { api, getSessao, limparSessao } from './api.js';
import { $, $$, esc, avisarErro, aplicarIcones, fecharModal } from './ui.js';
import { PERFIS, PERFIS_GESTAO, PERFIS_ADMIN, PERFIS_BUSCA } from './catalogo.js';
import { iniciarAvisos, pararAvisos } from './notificacoes.js';

// Dados carregados após o login e usados por várias telas.
export const estado = { usuario: null, escola: null, turmas: [], tipos: [] };

export const ehGestao = () => PERFIS_GESTAO.includes(estado.usuario?.perfil);
export const ehAdmin = () => PERFIS_ADMIN.includes(estado.usuario?.perfil);
export const podeBuscaAtiva = () => PERFIS_BUSCA.includes(estado.usuario?.perfil);

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
  carometro: () => import('./telas/carometro.js'),
  tutorial: () => import('./telas/tutorial.js'),
  equipe: () => import('./telas/equipe.js'),
  busca: () => import('./telas/busca.js'),
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

// Iniciais para o avatar (ex.: "Maria da Silva" → "MS").
function iniciais(nome) {
  const partes = String(nome || '').split(/\s+/).filter((p) => p.length > 2 || /^[A-ZÀ-Ú]/.test(p));
  return ((partes[0]?.[0] || '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase() || '?';
}

function montarTopo() {
  const u = estado.usuario;
  document.body.classList.add('logado');
  $('#lateral').hidden = false;
  $('#topo').hidden = false;
  $('#topo-escola-nome').textContent = estado.escola?.nome || 'SisRoe';
  $('#topo-escola-nome').title = estado.escola?.nome || '';
  $('#usuario-nome').textContent = u.nome;
  $('#topo-usuario').textContent = PERFIS[u.perfil] || u.perfil;
  $('#usuario-avatar').textContent = iniciais(u.nome);
  $$('[data-gestao]').forEach((el) => { el.hidden = !ehGestao(); });
  $$('[data-busca-ativa]').forEach((el) => { el.hidden = !podeBuscaAtiva(); });
  $$('[data-admin]').forEach((el) => { el.hidden = !ehAdmin(); });
  if (!u.trocar_senha) iniciarAvisos(); // pop-ups de ocorrência nova / mensagem no chat
}

export function navegar(hash) {
  if (location.hash === hash) roteador();
  else location.hash = hash;
}

let renderizando = 0;
let tutorialMostrado = false;
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
    // Primeiro acesso: o tutorial do perfil abre sozinho (uma vez por sessão, até a pessoa concluir).
    if (!estado.usuario.trocar_senha && !estado.usuario.tutorial_visto && rota === 'painel' && !tutorialMostrado) {
      tutorialMostrado = true;
      return navegar('#/tutorial');
    }
    montarTopo();
  } else {
    document.body.classList.remove('logado');
    $('#topo').hidden = true;
    $('#lateral').hidden = true;
  }

  $$('#lateral a[data-rota]').forEach((a) => {
    const ativo = a.dataset.rota === rota;
    a.classList.toggle('ativo', ativo);
    if (ativo) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  fecharMenu();
  fecharModal(); // janela aberta numa tela não pode ficar por cima da próxima
  conteudo.innerHTML = '<p class="carregando">Carregando…</p>';
  try {
    const modulo = await ROTAS[rota]();
    if (minha !== renderizando) return; // o usuário já trocou de tela
    await modulo.render(conteudo, params);
    aplicarIcones(conteudo);
    conteudo.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  } catch (e) {
    console.error(e);
    conteudo.innerHTML = `<div class="cartao erro-tela"><h2>Não foi possível abrir esta tela</h2><p>${esc(e.message)}</p>
      <p><a href="#/painel" class="btn">Voltar ao início</a></p></div>`;
  }
}

export function sair() {
  pararAvisos();
  limparSessao();
  estado.usuario = null;
  estado.escola = null;
  navegar('#/login');
}

// No celular o menu lateral vira uma gaveta, com fundo escuro atrás.
function abrirMenu() {
  $('#lateral').classList.add('aberto');
  $('#lateral-fundo').hidden = false;
  $('#btn-menu').setAttribute('aria-expanded', 'true');
  $('#lateral a[data-rota]')?.focus();
}
function fecharMenu() {
  if (!$('#lateral').classList.contains('aberto')) return;
  $('#lateral').classList.remove('aberto');
  $('#lateral-fundo').hidden = true;
  $('#btn-menu').setAttribute('aria-expanded', 'false');
}

aplicarIcones(document);
// Clicar no link da tela em que a pessoa já está recomeça a tela (ex.: "Nova ocorrência" volta ao passo 1).
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#/"]');
  if (a && a.getAttribute('href') === location.hash && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    navegar(location.hash);
  }
});
$('#btn-menu').addEventListener('click', abrirMenu);
$('#btn-fechar-menu').addEventListener('click', () => { fecharMenu(); $('#btn-menu').focus(); });
$('#lateral-fundo').addEventListener('click', fecharMenu);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharMenu(); });
$('#btn-sair').addEventListener('click', sair);
window.addEventListener('hashchange', roteador);
roteador();
