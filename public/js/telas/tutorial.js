// telas/tutorial.js — tutorial de uso para cada perfil.
// Abre sozinho no primeiro acesso; depois fica em "Tutorial" no menu.
// Qualquer perfil pode ser consultado e impresso (útil para a direção distribuir à equipe).
import { api } from '../api.js';
import { $, esc, icone, imprimirAvulso, avisarErro } from '../ui.js';
import { estado, navegar } from '../app.js';
import { PERFIS } from '../catalogo.js';
import { TUTORIAIS } from '../tutorial.js';

const paragrafos = (t) => t.split('\n').map((p) => `<p>${esc(p)}</p>`).join('');

export async function render(el, [perfilParam]) {
  const meu = estado.usuario.perfil;
  const perfil = TUTORIAIS[perfilParam] ? perfilParam : meu;
  const t = TUTORIAIS[perfil];
  const primeiraVez = !estado.usuario.tutorial_visto;

  el.innerHTML = `
    <div class="cab-tela">
      <h1>${primeiraVez ? `Bem-vindo(a), ${esc(estado.usuario.nome.split(' ')[0])}!` : 'Tutorial'}</h1>
      <div class="linha-btn">
        <label class="rotulo-inline">Perfil
          <select id="tut-perfil">${Object.entries(PERFIS).map(([k, v]) => `<option value="${k}" ${k === perfil ? 'selected' : ''}>${esc(v)}${k === meu ? ' (o seu)' : ''}</option>`).join('')}</select></label>
        <button class="btn" id="tut-imprimir" data-icone="imprimir">Imprimir</button>
      </div>
    </div>
    <section class="cartao tut-intro">
      <h2>${esc(PERFIS[perfil])}</h2>
      <p>${esc(t.resumo)}</p>
      ${primeiraVez && perfil === meu ? '<p class="ajuda">Leia os passos abaixo (leva uns 3 minutos). Você pode voltar a este tutorial quando quiser, pelo menu "Tutorial".</p>' : ''}
    </section>
    ${perfil !== 'master' ? `<a class="cartao guia-chamada" href="#/guia">
      ${icone('livro')}<span><b>Guia ilustrado: como registrar uma ocorrência</b>
      <small>Passo a passo com as telas do sistema, exemplos de relato e dúvidas comuns.</small></span>${icone('seta')}</a>` : ''}
    <ol class="tutorial">
      ${t.passos.map((p, i) => `
        <li class="cartao tut-passo">
          <span class="tut-num" aria-hidden="true">${i + 1}</span>
          <div class="tut-corpo">
            <h3>${p.icone ? icone(p.icone) : ''}${esc(p.titulo)}</h3>
            ${paragrafos(p.texto)}
            <div class="linha-btn">
              ${p.guia ? '<a class="btn-link" href="#/guia" data-icone="livro">Ver o guia ilustrado</a>' : ''}
              ${p.rota && perfil === meu ? `<a class="btn-link" href="${p.rota}">Ir para a tela</a>` : ''}
            </div>
          </div>
        </li>`).join('')}
    </ol>
    ${primeiraVez ? '<div class="acoes tut-fim"><button class="btn btn-primario" id="tut-comecar" data-icone="check">Entendi, começar a usar</button></div>' : ''}`;

  $('#tut-perfil', el).addEventListener('change', (e) => navegar(`#/tutorial/${e.target.value}`));
  $('#tut-imprimir', el).addEventListener('click', () => {
    const e = estado.escola;
    imprimirAvulso(`
      <header class="doc-cab"><div><div class="doc-escola">${esc(e.nome)}</div><div class="doc-sub">SisRoe · Registro de Ocorrências Escolares</div></div>
        <div class="doc-num"><small>Código da escola</small><b>${esc(e.codigo)}</b></div></header>
      <h1 class="doc-titulo">Tutorial — ${esc(PERFIS[perfil])}</h1>
      <p class="centro">${esc(t.resumo)}</p>
      ${t.passos.map((p, i) => `<h2>${i + 1}. ${esc(p.titulo)}</h2>${paragrafos(p.texto)}`).join('')}
      <p class="doc-rodape">Endereço do sistema: ${esc(location.origin)} · Usuário: número do RG ou da CIN · Esqueceu a senha? Procure a direção ou a coordenação.</p>`);
  });
  $('#tut-comecar', el)?.addEventListener('click', async () => {
    try {
      await api('/tutorial-visto', { metodo: 'POST' });
      estado.usuario.tutorial_visto = true;
      navegar('#/painel');
    } catch (err) { avisarErro(err); }
  });
}
