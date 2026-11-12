// telas/equipe.js — equipe gestora gera nova senha provisória para quem esqueceu.
// Coordenação e POC: professores, agentes, GOE e secretaria. Direção e vice: todos (também em Administração).
import { api } from '../api.js';
import { $, $$, esc, avisarErro, abrirModal } from '../ui.js';
import { estado, ehGestao, ehAdmin } from '../app.js';
import { PERFIS } from '../catalogo.js';

export function mostrarSenhaProvisoria(nome, login, senha) {
  abrirModal('Senha provisória', `
    <p>Entregue estes dados pessoalmente a <b>${esc(nome)}</b>. No primeiro acesso, o sistema obriga a criar uma senha nova.</p>
    <div class="senha-caixa">
      <div>Código da escola: <b>${esc(estado.escola.codigo)}</b></div>
      <div>Usuário: <b>${esc(login)}</b></div>
      <div>Senha provisória: <b class="senha">${esc(senha)}</b></div>
    </div>
    <p class="ajuda">Anote agora: por segurança, esta senha não será mostrada de novo.</p>
    <div class="acoes"><button class="btn btn-primario" data-fechar>Anotei</button></div>`);
}

export async function render(el) {
  if (!ehGestao() && !ehAdmin()) { el.innerHTML = '<div class="cartao">Área da equipe gestora.</div>'; return; }
  const lista = await api('/equipe');
  // Contêiner próprio: <main> é o mesmo em todas as telas, então os eventos ficam aqui dentro.
  const box = document.createElement('div');
  el.replaceChildren(box);
  box.innerHTML = `
    <div class="cab-tela"><h1>Equipe</h1>${ehAdmin() ? '<a class="btn" href="#/admin/usuarios" data-icone="admin">Cadastrar usuários</a>' : ''}</div>
    <p class="ajuda">Quando alguém esquecer a senha, clique em <b>Nova senha</b> e entregue a senha provisória pessoalmente.
      ${ehAdmin() ? '' : 'Coordenação e POC podem fazer isso para professores, agentes, gerente de organização escolar e secretário(a); para outros perfis, procure a direção.'}</p>
    <div class="cartao">
      <label>Buscar <input type="search" id="eq-busca" placeholder="Nome ou usuário"></label>
      <div class="tabela-rolagem"><table class="tabela">
        <thead><tr><th>Nome</th><th>Usuário (RG/CIN)</th><th>Perfil</th><th>Situação</th><th></th></tr></thead>
        <tbody>${lista.filter((u) => u.id !== estado.usuario.id).map((u) => `
          <tr data-busca="${esc((u.nome + ' ' + u.login).toLowerCase())}">
            <td>${esc(u.nome)}</td><td>${esc(u.login)}</td><td>${esc(PERFIS[u.perfil] || u.perfil)}</td>
            <td>${u.trocar_senha ? '<span class="selo st-aberta">Aguardando 1º acesso</span>' : '<span class="selo st-encerrada">Ativo</span>'}</td>
            <td>${(u.perfil === 'diretor' && estado.usuario.perfil !== 'master') || (u.perfil === 'master' && estado.usuario.perfil !== 'diretor') ? '<small class="ajuda">só pelo ' + (u.perfil === 'diretor' ? 'master' : 'diretor(a)') + '</small>'
              : `<button class="btn btn-peq" data-reset="${u.id}" data-nome="${esc(u.nome)}" data-login="${esc(u.login)}" data-icone="chave">Nova senha</button>`}</td>
          </tr>`).join('')}</tbody></table></div>
      ${lista.length ? '' : '<p class="vazio">Ninguém cadastrado ainda.</p>'}
    </div>`;
  $('#eq-busca', box).addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    $$('tbody tr', box).forEach((tr) => { tr.hidden = q && !tr.dataset.busca.includes(q); });
  });
  box.addEventListener('click', async (ev) => {
    const b = ev.target.closest('[data-reset]');
    if (!b) return;
    if (!confirm(`Gerar nova senha provisória para ${b.dataset.nome}? A senha atual deixa de funcionar.`)) return;
    try {
      const r = await api(`/usuarios/${b.dataset.reset}/resetar-senha`, { metodo: 'POST' });
      mostrarSenhaProvisoria(b.dataset.nome, b.dataset.login, r.senhaProvisoria);
    } catch (e) { avisarErro(e); }
  });
}
