// telas/admin.js — administração da escola (direção e vice-direção).
// Abas: primeiros passos, escola, usuários, turmas e alunos, tipos, auditoria.
import { api } from '../api.js';
import { $, $$, esc, lerForm, avisar, avisarErro, comCarregando, abrirModal, fecharModal, dataHoraBR, seloGravidade } from '../ui.js';
import { estado, ehAdmin, recarregarCadastros } from '../app.js';
import { PERFIS, CATEGORIAS, GRAVIDADES, MACROS } from '../catalogo.js';

const ABAS = {
  'primeiros-passos': 'Primeiros passos',
  escola: 'Escola',
  usuarios: 'Usuários',
  turmas: 'Turmas e alunos',
  tipos: 'Tipos de ocorrência',
  auditoria: 'Auditoria',
};

export async function render(el, [aba = 'primeiros-passos', ...resto]) {
  if (!ehAdmin()) {
    el.innerHTML = '<div class="cartao">Área restrita à direção da escola.</div>';
    return;
  }
  if (!ABAS[aba]) aba = 'primeiros-passos';
  el.innerHTML = `
    <h1>Administração</h1>
    <nav class="abas" aria-label="Seções da administração">
      ${Object.entries(ABAS).map(([k, v]) => `<a href="#/admin/${k}" class="${k === aba ? 'ativo' : ''}">${v}</a>`).join('')}
    </nav>
    <div id="aba"></div>`;
  const alvo = $('#aba', el);
  const telas = { 'primeiros-passos': primeirosPassos, escola, usuarios, turmas, tipos, auditoria };
  await telas[aba](alvo, resto);
}

/** Mostra a senha provisória para a direção repassar à pessoa. */
function mostrarSenha(nome, login, senha) {
  abrirModal('Senha provisória', `
    <p>Repasse estes dados a <b>${esc(nome)}</b>. No primeiro acesso, o sistema vai pedir que a pessoa crie uma senha própria.</p>
    <div class="senha-caixa">
      <div>Código da escola: <b>${esc(estado.escola.codigo)}</b></div>
      <div>Usuário: <b>${esc(login)}</b></div>
      <div>Senha provisória: <b class="senha">${esc(senha)}</b></div>
    </div>
    <p class="ajuda">Anote agora: por segurança, esta senha não será mostrada de novo.</p>
    <div class="acoes"><button class="btn btn-primario" data-fechar>Anotei</button></div>`);
}

/** Cria um contêiner novo a cada redesenho, para os eventos não se acumularem. */
function novoContainer(el) {
  const box = document.createElement('div');
  el.replaceChildren(box);
  return box;
}

// ─── Primeiros passos ────────────────────────────────────────────────────────
async function primeirosPassos(el) {
  const usuarios = await api('/usuarios');
  const temAlunos = estado.turmas.some((t) => Number(t.qtd_alunos) > 0);
  const item = (ok, texto, link) => `<li class="${ok ? 'ok' : ''}"><span data-icone="${ok ? 'ok' : 'relogio'}" aria-label="${ok ? 'Feito' : 'Pendente'}"></span>
    <div>${texto} ${ok ? '' : `<a href="${link}">Fazer agora</a>`}</div></li>`;
  el.innerHTML = `<section class="cartao">
    <h2>Deixe a escola pronta para usar</h2>
    <ol class="checklist-inicio">
      ${item(!!estado.escola.municipio, 'Conferir os dados da escola (aparecem no cabeçalho dos documentos impressos)', '#/admin/escola')}
      ${item(estado.turmas.length > 0, 'Cadastrar as turmas', '#/admin/turmas')}
      ${item(temAlunos, 'Importar os alunos de cada turma (copiar e colar da planilha da Secretaria Escolar Digital)', '#/admin/turmas')}
      ${item(usuarios.length > 1, 'Cadastrar professores, agentes, POC, coordenação e vice-direção', '#/admin/usuarios')}
      ${item(false, 'Conhecer os tipos de ocorrência: as 50 situações do Protocolo 179 (3ª versão) e as indisciplinas do dia a dia', '#/admin/tipos')}
    </ol>
    <p class="ajuda">Código de acesso da escola: <b>${esc(estado.escola.codigo)}</b>. Todos os servidores usam esse código para entrar.</p>
  </section>`;
}

// ─── Escola ──────────────────────────────────────────────────────────────────
async function escola(el) {
  const e = estado.escola;
  el.innerHTML = `<form id="form-escola" class="cartao">
    <label>Nome da escola * <input name="nome" required maxlength="150" value="${esc(e.nome)}"></label>
    <div class="grade-3">
      <label>Código CIE <input name="cie" maxlength="20" value="${esc(e.cie || '')}"></label>
      <label>Município <input name="municipio" maxlength="80" value="${esc(e.municipio || '')}"></label>
      <label>Telefone <input name="telefone" maxlength="30" value="${esc(e.telefone || '')}"></label>
    </div>
    <label>Unidade Regional de Ensino <input name="diretoria" maxlength="120" value="${esc(e.diretoria || '')}"></label>
    <label>Endereço <input name="endereco" maxlength="200" value="${esc(e.endereco || '')}"></label>
    <p class="ajuda">Código de acesso (não pode ser alterado): <b>${esc(e.codigo)}</b></p>
    <button class="btn btn-primario" type="submit">Salvar</button>
  </form>`;
  $('#form-escola', el).addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const d = lerForm(ev.target);
    await comCarregando(ev.target.querySelector('button'), async () => {
      try {
        await api('/escola', { metodo: 'PUT', corpo: d });
        Object.assign(estado.escola, d);
        $('#topo-escola-nome').textContent = d.nome;
        avisar('Dados da escola salvos.');
      } catch (err) { avisarErro(err); }
    });
  });
}

// ─── Usuários ────────────────────────────────────────────────────────────────
async function usuarios(el) {
  const box = novoContainer(el);
  const lista = await api('/usuarios');
  box.innerHTML = `
    <form id="form-usuario" class="cartao">
      <h2>Novo usuário</h2>
      <div class="grade-3">
        <label>Nome completo * <input name="nome" required maxlength="120"></label>
        <label>Usuário (login) * <input name="login" required maxlength="30" autocapitalize="none" placeholder="ex.: maria.silva"></label>
        <label>Perfil *
          <select name="perfil">${Object.entries(PERFIS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
      </div>
      <button class="btn btn-primario" type="submit">Cadastrar e gerar senha provisória</button>
    </form>
    <section class="cartao">
      <h2>Usuários da escola (${lista.length})</h2>
      <div class="tabela-rolagem"><table class="tabela">
        <thead><tr><th>Nome</th><th>Usuário</th><th>Perfil</th><th>Situação</th><th></th></tr></thead>
        <tbody>${lista.map((u) => `<tr class="${u.ativo ? '' : 'inativo'}">
          <td>${esc(u.nome)}</td><td>${esc(u.login)}</td>
          <td><select data-perfil="${u.id}" aria-label="Perfil de ${esc(u.nome)}">${Object.entries(PERFIS).map(([k, v]) =>
            `<option value="${k}" ${u.perfil === k ? 'selected' : ''}>${v}</option>`).join('')}</select></td>
          <td>${u.ativo ? (u.trocar_senha ? 'Aguardando 1º acesso' : 'Ativo') : 'Inativo'}</td>
          <td class="linha-btn">
            <button class="btn btn-peq" data-reset="${u.id}" data-nome="${esc(u.nome)}" data-login="${esc(u.login)}">Nova senha</button>
            <button class="btn btn-peq" data-ativo="${u.id}" data-valor="${u.ativo ? 0 : 1}">${u.ativo ? 'Desativar' : 'Reativar'}</button>
          </td></tr>`).join('')}</tbody></table></div>
    </section>`;

  $('#form-usuario', box).addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const d = lerForm(ev.target);
    await comCarregando(ev.target.querySelector('button'), async () => {
      try {
        const r = await api('/usuarios', { metodo: 'POST', corpo: d });
        await usuarios(el);
        mostrarSenha(d.nome, r.login, r.senhaProvisoria);
      } catch (err) { avisarErro(err); }
    });
  });
  box.addEventListener('change', async (ev) => {
    const s = ev.target.closest('[data-perfil]');
    if (!s) return;
    try { await api(`/usuarios/${s.dataset.perfil}`, { metodo: 'PUT', corpo: { perfil: s.value } }); avisar('Perfil alterado.'); }
    catch (err) { avisarErro(err); await usuarios(el); }
  });
  box.addEventListener('click', async (ev) => {
    const r = ev.target.closest('[data-reset]');
    if (r) {
      if (!confirm(`Gerar nova senha provisória para ${r.dataset.nome}? A senha atual deixará de funcionar.`)) return;
      try {
        const x = await api(`/usuarios/${r.dataset.reset}/resetar-senha`, { metodo: 'POST' });
        await usuarios(el);
        mostrarSenha(r.dataset.nome, r.dataset.login, x.senhaProvisoria);
      } catch (err) { avisarErro(err); }
      return;
    }
    const a = ev.target.closest('[data-ativo]');
    if (a) {
      try {
        await api(`/usuarios/${a.dataset.ativo}`, { metodo: 'PUT', corpo: { ativo: a.dataset.valor === '1' } });
        await usuarios(el);
      } catch (err) { avisarErro(err); }
    }
  }, { once: false });
}

// ─── Turmas e alunos ─────────────────────────────────────────────────────────
async function turmas(el, [turmaId]) {
  const lista = await api('/turmas?todas=1');
  el.innerHTML = `
    <form id="form-turma" class="cartao">
      <h2>Nova turma</h2>
      <div class="grade-3">
        <label>Nome * <input name="nome" required maxlength="60" placeholder="ex.: 7º Ano A"></label>
        <label>Período <select name="periodo">${['', 'Manhã', 'Tarde', 'Noite', 'Integral'].map((p) => `<option>${p}</option>`).join('')}</select></label>
        <div class="alinhar-base"><button class="btn btn-primario" type="submit">Adicionar turma</button></div>
      </div>
    </form>
    <section class="cartao">
      <h2>Turmas (${lista.length})</h2>
      ${lista.length ? `<ul class="lista-simples">${lista.map((t) => `
        <li class="${t.ativa ? '' : 'inativo'}"><a href="#/admin/turmas/${t.id}"><span class="desc">${esc(t.nome)}
          <small>${esc(t.periodo || '')} · ${t.qtd_alunos} aluno(s)${t.ativa ? '' : ' · arquivada'}</small></span></a></li>`).join('')}</ul>`
        : '<p class="vazio">Nenhuma turma cadastrada.</p>'}
    </section>
    <div id="turma-detalhe"></div>`;

  $('#form-turma', el).addEventListener('submit', async (ev) => {
    ev.preventDefault();
    try {
      const r = await api('/turmas', { metodo: 'POST', corpo: lerForm(ev.target) });
      await recarregarCadastros();
      location.hash = `#/admin/turmas/${r.id}`;
    } catch (err) { avisarErro(err); }
  });

  const t = lista.find((x) => x.id === Number(turmaId));
  if (t) await detalheTurma($('#turma-detalhe', el), t, el);
}

async function detalheTurma(caixa, t, el) {
  const alunos = await api(`/alunos?turma_id=${t.id}`);
  caixa.innerHTML = `<section class="cartao" id="turma-sel">
    <div class="cab-tela"><h2>${esc(t.nome)}</h2>
      <button class="btn btn-peq" id="arquivar">${t.ativa ? 'Arquivar turma' : 'Reativar turma'}</button></div>
    <form id="form-importar">
      <label>Colar lista de alunos
        <textarea name="texto" rows="6" placeholder="Um aluno por linha. Formatos aceitos:&#10;123456789;MARIA DA SILVA&#10;123456789[tab]JOÃO SOUZA   (copiado de planilha: coluna RA e coluna Nome)&#10;ANA LIMA   (só o nome)"></textarea>
      </label>
      <p class="ajuda">Dica: na planilha, selecione as colunas <b>RA</b> e <b>Nome</b>, copie (Ctrl+C) e cole aqui. Se o RA já existir, o aluno é atualizado e movido para esta turma.</p>
      <button class="btn btn-primario" type="submit">Importar alunos</button>
    </form>
    <h3>Alunos (${alunos.length})</h3>
    ${alunos.length ? `<ul class="lista-alunos">${alunos.map((a) => `<li><span>${esc(a.nome)} <small>${esc(a.ra || '')}</small></span>
      <button class="btn-icone" data-remover-aluno="${a.id}" aria-label="Remover ${esc(a.nome)} da turma" data-icone="fechar"></button></li>`).join('')}</ul>`
      : '<p class="vazio">Nenhum aluno nesta turma.</p>'}
  </section>`;
  caixa.scrollIntoView({ behavior: 'smooth', block: 'start' });

  $('#form-importar', caixa).addEventListener('submit', async (ev) => {
    ev.preventDefault();
    await comCarregando(ev.target.querySelector('button'), async () => {
      try {
        const r = await api(`/turmas/${t.id}/importar`, { metodo: 'POST', corpo: { texto: ev.target.texto.value } });
        avisar(`${r.criados} aluno(s) novo(s), ${r.atualizados} atualizado(s).`);
        await recarregarCadastros();
        await turmas(el, [t.id]);
      } catch (err) { avisarErro(err); }
    });
  });
  $('#arquivar', caixa).addEventListener('click', async () => {
    try {
      await api(`/turmas/${t.id}`, { metodo: 'PUT', corpo: { ativa: !t.ativa } });
      await recarregarCadastros();
      await turmas(el, [t.id]);
    } catch (err) { avisarErro(err); }
  });
  caixa.addEventListener('click', async (ev) => {
    const b = ev.target.closest('[data-remover-aluno]');
    if (!b || !confirm('Remover este aluno da lista? O histórico de ocorrências dele é mantido.')) return;
    try { await api(`/alunos/${b.dataset.removerAluno}`, { metodo: 'DELETE' }); await turmas(el, [t.id]); }
    catch (err) { avisarErro(err); }
  });
}

// ─── Tipos de ocorrência ─────────────────────────────────────────────────────
async function tipos(el) {
  const box = novoContainer(el);
  const lista = await api('/tipos?todos=1');
  const optsCat = (sel) => Object.entries(CATEGORIAS).map(([k, v]) => `<option value="${k}" ${sel === k ? 'selected' : ''}>${esc(v.nome)}</option>`).join('');
  const optsMacro = (sel) => '<option value="">—</option>' + Object.entries(MACROS)
    .map(([k, v]) => `<option value="${k}" ${sel === k ? 'selected' : ''}>${k}) ${esc(v)}</option>`).join('');
  const optsGrav = (sel) => Object.entries(GRAVIDADES).map(([k, v]) => `<option value="${k}" ${sel === k ? 'selected' : ''}>${v}</option>`).join('');
  box.innerHTML = `
    <div class="alerta alerta-info" data-icone="info"><div>Os tipos marcados <b>P179</b> são as 50 situações do <b>Protocolo 179 — 3ª versão</b>,
      com os passos de cada uma tirados do documento. Os tipos <b>A</b> são indisciplinas do dia a dia (seção 4.28).
      Tipos já usados não devem ser apagados: desative-os.
      <div class="acoes"><button class="btn btn-peq" id="btn-atualizar-cat" type="button">Atualizar catálogo do Protocolo 179</button></div></div></div>
    <form id="form-tipo" class="cartao">
      <h2>Novo tipo</h2>
      <div class="grade-4">
        <label>Código * <input name="codigo" required maxlength="12" placeholder="A17"></label>
        <label class="col-2">Descrição * <input name="descricao" required maxlength="160"></label>
        <label>Categoria <select name="categoria">${optsCat('administrativa')}</select></label>
        <label>Gravidade inicial <select name="gravidade">${optsGrav('leve')}</select></label>
      </div>
      <label>Macrocategoria do Protocolo 179 <select name="macro">${optsMacro('h')}</select></label>
      <p class="ajuda">Tipos criados pela escola usam o checklist padrão da categoria (para indisciplina: Art. 7º da Res. SEDUC 68/2026).</p>
      <button class="btn btn-primario" type="submit">Adicionar tipo</button>
    </form>
    ${Object.entries(CATEGORIAS).map(([cat, c]) => `<section class="cartao">
      <h2>${esc(c.nome)}</h2>
      <ul class="lista-tipos-admin">${lista.filter((t) => t.categoria === cat).map((t) => `
        <li class="${t.ativo ? '' : 'inativo'}"><span class="cod">${esc(t.codigo)}</span>
          <span class="desc">${esc(t.descricao)}${t.origem === 'protocolo' ? ' <span class="selo selo-p179">P179</span>' : ''}
            ${t.macro ? `<small>${esc(t.macro)}) ${esc(MACROS[t.macro] || '')}</small>` : ''}</span>
          ${seloGravidade(t.gravidade)}
          <button class="btn btn-peq" data-editar="${t.id}">Editar</button>
          <button class="btn btn-peq" data-toggle="${t.id}">${t.ativo ? 'Desativar' : 'Ativar'}</button></li>`).join('')}</ul>
    </section>`).join('')}`;

  $('#form-tipo', box).addEventListener('submit', async (ev) => {
    ev.preventDefault();
    try {
      await api('/tipos', { metodo: 'POST', corpo: lerForm(ev.target) });
      avisar('Tipo adicionado.');
      await recarregarCadastros();
      await tipos(el);
    } catch (err) { avisarErro(err); }
  });

  $('#btn-atualizar-cat', box).addEventListener('click', async (ev) => {
    if (!confirm('Atualizar os tipos do Protocolo 179 para a versão que está no sistema? Ocorrências já registradas não mudam.')) return;
    await comCarregando(ev.target, async () => {
      try {
        const r = await api('/tipos/atualizar-protocolo', { metodo: 'POST' });
        avisar(`Catálogo atualizado: ${r.atualizados} atualizado(s), ${r.criados} novo(s), ${r.desativados} antigo(s) desativado(s).`);
        await recarregarCadastros();
        await tipos(el);
      } catch (err) { avisarErro(err); }
    });
  });

  box.addEventListener('click', async (ev) => {
    const tg = ev.target.closest('[data-toggle]');
    if (tg) {
      const t = lista.find((x) => x.id === Number(tg.dataset.toggle));
      try { await api(`/tipos/${t.id}`, { metodo: 'PUT', corpo: { ativo: !t.ativo } }); await recarregarCadastros(); await tipos(el); }
      catch (err) { avisarErro(err); }
      return;
    }
    const ed = ev.target.closest('[data-editar]');
    if (!ed) return;
    const t = lista.find((x) => x.id === Number(ed.dataset.editar));
    const m = abrirModal('Editar tipo', `<form id="form-editar-tipo">
      <label>Código <input name="codigo" required maxlength="12" value="${esc(t.codigo)}"></label>
      <label>Descrição <input name="descricao" required maxlength="160" value="${esc(t.descricao)}"></label>
      <div class="grade-2"><label>Categoria <select name="categoria">${optsCat(t.categoria)}</select></label>
      <label>Gravidade inicial <select name="gravidade">${optsGrav(t.gravidade)}</select></label></div>
      <label>Macrocategoria <select name="macro">${optsMacro(t.macro)}</select></label>
      ${t.origem === 'protocolo' ? '<p class="ajuda">Os passos desta situação vêm do Protocolo 179 e não são alterados aqui.</p>' : ''}
      <p class="ajuda">Ocorrências já registradas mantêm o nome que tinham no momento do registro.</p>
      <div class="acoes"><button class="btn btn-primario" type="submit">Salvar</button><button class="btn" type="button" data-fechar>Cancelar</button></div>
    </form>`);
    $('#form-editar-tipo', m).addEventListener('submit', async (e2) => {
      e2.preventDefault();
      try {
        await api(`/tipos/${t.id}`, { metodo: 'PUT', corpo: lerForm(e2.target) });
        fecharModal();
        await recarregarCadastros();
        await tipos(el);
      } catch (err) { avisarErro(err); }
    });
  });
}

// ─── Auditoria ───────────────────────────────────────────────────────────────
const ACOES = {
  login: 'Entrou no sistema', escola_cadastrada: 'Cadastrou a escola', escola_editada: 'Editou dados da escola',
  senha_alterada: 'Alterou a própria senha', senha_resetada: 'Gerou senha provisória', usuario_criado: 'Criou usuário',
  usuario_editado: 'Editou usuário', alunos_importados: 'Importou alunos', tipo_criado: 'Criou tipo de ocorrência',
  tipo_editado: 'Editou tipo de ocorrência', ocorrencia_registrada: 'Registrou ocorrência',
  ocorrencia_acompanhada: 'Atualizou acompanhamento', ocorrencia_cancelada: 'Cancelou ocorrência',
  catalogo_atualizado: 'Atualizou o catálogo do Protocolo 179', afastamento_registrado: 'Registrou afastamento preventivo',
  afastamento_atualizado: 'Atualizou afastamento', afastamento_prorrogar: 'Prorrogou afastamento', afastamento_encerrar: 'Encerrou afastamento',
};
async function auditoria(el) {
  const lista = await api('/auditoria');
  el.innerHTML = `<section class="cartao"><h2>Últimas 200 ações</h2>
    <div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Quando</th><th>Quem</th><th>Ação</th><th>Detalhes</th></tr></thead>
    <tbody>${lista.map((a) => `<tr><td>${dataHoraBR(a.criado_em)}</td><td>${esc(a.usuario_nome || '')}</td>
      <td>${esc(ACOES[a.acao] || a.acao)}</td><td><small>${esc(a.detalhes || '')}</small></td></tr>`).join('')}</tbody></table></div></section>`;
}
