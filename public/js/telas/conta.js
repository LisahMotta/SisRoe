// telas/conta.js — troca de senha (voluntária ou obrigatória no 1º acesso).
import { api } from '../api.js';
import { $, esc, lerForm, avisar, avisarErro, comCarregando } from '../ui.js';
import { estado, navegar, sair, recarregarCadastros } from '../app.js';
import { PERFIS } from '../catalogo.js';
import { situacaoPush, ativarPush, desativarPush } from '../notificacoes.js';

function formSenha(titulo, explicacao) {
  return `<form id="form-senha" class="cartao estreito" novalidate>
      <h2>${esc(titulo)}</h2>
      ${explicacao ? `<p>${esc(explicacao)}</p>` : ''}
      <label>Senha atual <input name="atual" type="password" required autocomplete="current-password"></label>
      <label>Nova senha <input name="nova" type="password" required autocomplete="new-password">
        <small>Pelo menos 8 caracteres, com letras e números.</small></label>
      <label>Repita a nova senha <input name="nova2" type="password" required autocomplete="new-password"></label>
      <button class="btn btn-primario btn-largo" type="submit">Salvar nova senha</button>
    </form>`;
}

function ligarForm(el, aoConcluir) {
  const form = $('#form-senha', el);
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const d = lerForm(form);
    if (d.nova !== d.nova2) return avisar('A nova senha e a repetição não conferem.', 'erro');
    await comCarregando(form.querySelector('button'), async () => {
      try {
        await api('/minha-senha', { metodo: 'POST', corpo: { atual: d.atual, nova: d.nova } });
        avisar('Senha alterada com sucesso.');
        form.reset();
        await aoConcluir();
      } catch (e) { avisarErro(e); }
    });
  });
}

export async function render(el) {
  const u = estado.usuario;
  const e = estado.escola;
  el.innerHTML = `
    <h1>Minha conta</h1>
    <div class="cartao estreito">
      <dl class="dados">
        <dt>Nome</dt><dd>${esc(u.nome)}</dd>
        <dt>Usuário</dt><dd>${esc(u.login)}</dd>
        <dt>Perfil</dt><dd>${esc(PERFIS[u.perfil])}</dd>
        <dt>Escola</dt><dd>${esc(e.nome)} <small>(código de acesso: <b>${esc(e.codigo)}</b>)</small></dd>
      </dl>
    </div>
    <section class="cartao estreito" id="push-caixa">
      <h2>Notificações neste aparelho</h2>
      <p class="carregando">Verificando…</p>
    </section>
    ${formSenha('Trocar senha')}`;
  ligarForm(el, async () => {});
  desenharPush($('#push-caixa', el));
}

// Ativar/desativar notificações do aparelho (chegam mesmo com o SisRoe fechado).
async function desenharPush(caixa) {
  const s = await situacaoPush().catch(() => ({ suportado: false }));
  const texto = !s.suportado
    ? 'Este navegador não aceita notificações. No iPhone, adicione o SisRoe à Tela de Início (Compartilhar → Adicionar à Tela de Início) e abra por lá.'
    : !s.servidor
      ? 'As notificações do aparelho ainda não foram configuradas no servidor. Enquanto isso, os avisos aparecem dentro do sistema, com o SisRoe aberto.'
      : s.inscrito ? 'Ativadas. Você recebe aviso de ocorrências novas (equipe gestora) e de mensagens no chat, mesmo com o SisRoe fechado.'
        : 'Receba aviso de ocorrências novas (equipe gestora) e de mensagens no chat, mesmo com o SisRoe fechado. Por privacidade, a notificação não mostra nomes de estudantes.';
  caixa.innerHTML = `<h2>Notificações neste aparelho</h2><p class="ajuda">${esc(texto)}</p>
    ${s.suportado && s.servidor ? `<button class="btn ${s.inscrito ? '' : 'btn-primario'}" id="btn-push">${s.inscrito ? 'Desativar neste aparelho' : 'Ativar notificações'}</button>` : ''}`;
  $('#btn-push', caixa)?.addEventListener('click', (ev) => comCarregando(ev.currentTarget, async () => {
    try {
      if (s.inscrito) { await desativarPush(); avisar('Notificações desativadas neste aparelho.'); }
      else { await ativarPush(); avisar('Notificações ativadas neste aparelho.'); }
    } catch (e) { avisarErro(e); }
    await desenharPush(caixa);
  }));
}

export async function renderTrocaObrigatoria(el) {
  el.innerHTML = `${formSenha('Crie sua senha', 'Você entrou com uma senha provisória. Para continuar, crie uma senha pessoal. Ela é só sua: não compartilhe.')}
    <p class="centro"><button class="btn-link" id="btn-sair-troca">Sair</button></p>`;
  $('#btn-sair-troca', el).addEventListener('click', sair);
  ligarForm(el, async () => {
    estado.usuario.trocar_senha = false;
    await recarregarCadastros();
    navegar(estado.usuario.tutorial_visto ? '#/painel' : '#/tutorial');
  });
}
