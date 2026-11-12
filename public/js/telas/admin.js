// telas/admin.js — administração da escola (direção e vice-direção).
// Abas: primeiros passos, escola, usuários, turmas e alunos, SED, carômetro, tipos, auditoria.
import { api } from '../api.js';
import { $, $$, esc, lerForm, avisar, avisarErro, comCarregando, abrirModal, fecharModal, dataHoraBR, seloGravidade, aplicarIcones, imprimirAvulso } from '../ui.js';
import { estado, ehAdmin, ehMaster, recarregarCadastros } from '../app.js';
import { PERFIS, CATEGORIAS, GRAVIDADES, MACROS } from '../catalogo.js';
import { lerArquivoSED, lerListaEquipe, lerArquivoTexto } from '../sed.js';
import { MODELO_PADRAO, CAMPOS_MODELO } from '../whatsapp.js';
import { reduzirFoto, casarFoto, enviarCarometro, tipoCarometro, abrirCarometro, tamanhoLegivel, MAX_CAROMETRO } from '../imagem.js';

const ABAS = {
  'primeiros-passos': 'Primeiros passos',
  escola: 'Escola',
  usuarios: 'Usuários',
  turmas: 'Turmas e alunos',
  sed: 'Importar da SED',
  carometro: 'Carômetro',
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
  const telas = { 'primeiros-passos': primeirosPassos, escola, usuarios, turmas, sed, carometro, tipos, auditoria };
  await telas[aba](alvo, resto);
}

/** Mostra a senha provisória para a direção repassar à pessoa. */
function mostrarSenha(nome, login, senha) {
  abrirModal('Senha provisória', `
    <p>Entregue estes dados pessoalmente a <b>${esc(nome)}</b>. No primeiro acesso, o sistema obriga a criar uma senha própria.</p>
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

/** Nova senha: a da direção só o master gera; a do master só a direção. */
function podeNovaSenha(u) {
  if (u.id === estado.usuario.id) return false;
  if (u.perfil === 'diretor') return ehMaster();
  if (u.perfil === 'master') return estado.usuario.perfil === 'diretor';
  return true;
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
      ${item(temAlunos, 'Importar os alunos: envie as listas CSV exportadas da SED (cria as turmas sozinho)', '#/admin/sed')}
      ${item(usuarios.some((u) => u.perfil === 'diretor'), 'Cadastrar o(a) diretor(a) da escola (se quem configurou foi o usuário master)', '#/admin/usuarios')}
      ${item(usuarios.length > 2, 'Cadastrar professores, agentes, gerente de organização escolar, secretaria, POC, coordenação e vice-direção', '#/admin/usuarios')}
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
    <label>Mensagem de WhatsApp da busca ativa
      <textarea name="modelo_whatsapp" rows="4" maxlength="1000">${esc(e.modelo_whatsapp || MODELO_PADRAO)}</textarea>
      <small>Campos que o sistema preenche: ${CAMPOS_MODELO.join(' ')}. A mensagem pode ser revisada antes de cada envio.</small></label>
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
  const souVice = estado.usuario.perfil === 'vice';
  const box = novoContainer(el);
  const lista = await api('/usuarios');
  box.innerHTML = `
    <section class="cartao destaque-lote">
      <div class="cab-tela"><div><h2>Cadastrar a equipe de uma vez</h2>
        <p class="ajuda">Envie ou cole a lista com o <b>nome</b> e o <b>RG ou CIN</b> de cada professor. O RG/CIN vira o usuário de acesso.</p></div>
        <button class="btn btn-primario" id="btn-lote" type="button" data-icone="baixar">Importar lista</button></div>
    </section>
    <form id="form-usuario" class="cartao">
      <h2>Novo usuário</h2>
      <p class="ajuda">O <b>usuário master</b> (um por escola) faz a configuração e as atualizações do sistema e ajuda a direção, mas não vê
        ocorrências nem dados de estudantes. Só o(a) diretor(a) cadastra, altera ou desativa o master.</p>
      <div class="grade-3">
        <label>Nome completo * <input name="nome" required maxlength="120"></label>
        <label>Usuário: RG ou CIN * <input name="login" required maxlength="30" autocapitalize="none" inputmode="text" placeholder="ex.: 12.345.678-X">
          <small>Pode digitar com ou sem pontos; o sistema guarda só os números.</small></label>
        <label>Perfil *
          <select name="perfil">${Object.entries(PERFIS).filter(([k]) => !(souVice && k === 'diretor')).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
      </div>
      <button class="btn btn-primario" type="submit">Cadastrar e gerar senha provisória</button>
    </form>
    <section class="cartao">
      <h2>Usuários da escola (${lista.length})</h2>
      <div class="tabela-rolagem"><table class="tabela">
        <thead><tr><th>Nome</th><th>Usuário</th><th>Perfil</th><th>Situação</th><th></th></tr></thead>
        <tbody>${lista.map((u) => `<tr class="${u.ativo ? '' : 'inativo'}">
          <td>${esc(u.nome)}</td><td>${esc(u.login)}</td>
          <td><select data-perfil="${u.id}" aria-label="Perfil de ${esc(u.nome)}" ${souVice && u.perfil === 'diretor' ? 'disabled' : ''}>${Object.entries(PERFIS)
            .filter(([k]) => !(souVice && k === 'diretor' && u.perfil !== 'diretor')).map(([k, v]) =>
            `<option value="${k}" ${u.perfil === k ? 'selected' : ''}>${v}</option>`).join('')}</select></td>
          <td>${u.ativo ? (u.trocar_senha ? 'Aguardando 1º acesso' : 'Ativo') : 'Inativo'}</td>
          <td class="linha-btn">
            ${podeNovaSenha(u) ? `<button class="btn btn-peq" data-reset="${u.id}" data-nome="${esc(u.nome)}" data-login="${esc(u.login)}">Nova senha</button>` : ''}
            ${souVice && u.perfil === 'diretor' ? '' : `<button class="btn btn-peq" data-ativo="${u.id}" data-valor="${u.ativo ? 0 : 1}">${u.ativo ? 'Desativar' : 'Reativar'}</button>`}
          </td></tr>`).join('')}</tbody></table></div>
      ${souVice ? '<p class="ajuda">A vice-direção não altera a conta da direção. Nova senha para o(a) diretor(a): só pelo usuário master.</p>' : ''}
    </section>`;

  $('#btn-lote', box).addEventListener('click', () => modalLote(el));
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


// Mesmo critério do servidor: documento (RG/CIN) vira só números (e o X final).
function loginDoDocumento(d) {
  const t = String(d || '').toLowerCase().replace(/\s+/g, '');
  return /^[\d.\-/]+x?$/.test(t) ? t.replace(/[^\dx]/g, '') : t.replace(/[^a-z0-9-]/g, '');
}

/** Cadastro em lote: lista com nome + RG/CIN (arquivo CSV ou colado da planilha). */
function modalLote(el) {
  let pessoas = [];
  const m = abrirModal('Importar lista da equipe', `
    <p class="ajuda">Formato: uma pessoa por linha, com <b>Nome</b> e <b>RG ou CIN</b> (e, se quiser, <b>Cargo</b>: professor, agente,
      gerente de organização escolar, secretário, coordenador, POC, vice ou diretor). Pode copiar as colunas do Excel/Planilhas Google e colar aqui, ou escolher um arquivo CSV.</p>
    <label>Colar a lista
      <textarea id="lote-texto" rows="6" placeholder="Nome;RG ou CIN;Cargo&#10;MARIA DA SILVA;12.345.678-X;Professora&#10;JOÃO SOUZA;123.456.789-09;Agente"></textarea></label>
    <label class="arquivo">ou escolher arquivo CSV <input type="file" id="lote-arquivo" accept=".csv,.txt,text/csv"></label>
    <div id="lote-previa"></div>`);
  const previa = $('#lote-previa', m);

  const desenhar = (texto) => {
    const r = lerListaEquipe(texto);
    if (r.erro) { previa.innerHTML = texto.trim() ? `<p class="texto-alerta">${esc(r.erro)}</p>` : ''; pessoas = []; return; }
    pessoas = r.pessoas;
    previa.innerHTML = `
      <p class="rotulo">${pessoas.length} pessoa(s) — confira o perfil de cada uma:</p>
      <div class="tabela-rolagem"><table class="tabela">
        <thead><tr><th>Nome</th><th>Usuário (RG/CIN)</th><th>Perfil</th></tr></thead>
        <tbody>${pessoas.map((p, i) => {
          const login = loginDoDocumento(p.documento);
          return `<tr><td>${esc(p.nome) || '<span class="texto-alerta">sem nome</span>'}</td>
            <td>${login.length >= 5 ? esc(login) : '<span class="texto-alerta">sem documento</span>'}</td>
            <td><select data-perfil-lote="${i}" aria-label="Perfil de ${esc(p.nome)}">${Object.entries(PERFIS).map(([k, v]) => `<option value="${k}" ${k === p.perfil ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></td></tr>`;
        }).join('')}</tbody></table></div>
      <fieldset class="senha-lote">
        <legend>Senha provisória</legend>
        <label class="check"><input type="radio" name="tipo-senha" value="aleatoria" checked> Gerar uma senha diferente para cada pessoa (mais seguro)</label>
        <label class="check"><input type="radio" name="tipo-senha" value="comum"> Usar a mesma senha provisória para todos</label>
        <label id="lote-senha-comum" hidden>Senha provisória comum <input id="lote-senha" maxlength="40" autocomplete="off" placeholder="ex.: Escola2026">
          <small>Pelo menos 8 caracteres, com letras e números. Em qualquer caso, cada pessoa é obrigada a criar a própria senha no primeiro acesso.</small></label>
      </fieldset>
      <div class="acoes"><button class="btn btn-primario" id="lote-importar">Cadastrar ${pessoas.length} pessoa(s)</button>
        <button class="btn" data-fechar>Cancelar</button></div>`;
    $$('input[name=tipo-senha]', previa).forEach((r2) => r2.addEventListener('change', () => {
      $('#lote-senha-comum', previa).hidden = $('input[name=tipo-senha]:checked', previa).value !== 'comum';
    }));
    $$('[data-perfil-lote]', previa).forEach((sel) => sel.addEventListener('change', () => { pessoas[Number(sel.dataset.perfilLote)].perfil = sel.value; }));
    $('#lote-importar', previa).addEventListener('click', (ev) => comCarregando(ev.currentTarget, async () => {
      const comum = $('input[name=tipo-senha]:checked', previa).value === 'comum' ? $('#lote-senha', previa).value : '';
      if ($('input[name=tipo-senha]:checked', previa).value === 'comum' && !comum) return avisar('Digite a senha provisória comum.', 'erro');
      try {
        const r2 = await api('/usuarios/lote', { metodo: 'POST', corpo: { usuarios: pessoas, senhaComum: comum } });
        fecharModal();
        await usuarios(el);
        mostrarResultadoLote(r2);
      } catch (e) { avisarErro(e); }
    }));
  };
  $('#lote-texto', m).addEventListener('input', (e) => desenhar(e.target.value));
  $('#lote-arquivo', m).addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try { const t = await lerArquivoTexto(f); $('#lote-texto', m).value = t; desenhar(t); } catch (err) { avisarErro(err); }
  });
}

/** Resultado do cadastro em lote, com a lista de acessos para imprimir e entregar. */
function mostrarResultadoLote({ criados, ignorados }) {
  const e = estado.escola;
  const imprimir = () => imprimirAvulso(`
    <header class="doc-cab"><div><div class="doc-escola">${esc(e.nome)}</div><div class="doc-sub">SisRoe · Acesso ao sistema</div></div>
      <div class="doc-num"><small>Código da escola</small><b>${esc(e.codigo)}</b></div></header>
    <h1 class="doc-titulo">Acessos ao SisRoe</h1>
    <p class="centro"><small>Endereço: ${esc(location.origin)} · Entregue cada linha pessoalmente e destrua esta folha depois.
      No primeiro acesso, cada pessoa cria a própria senha. Esqueceu a senha? Procure a direção ou a coordenação.</small></p>
    <div class="recortes">${criados.map((c) => `<div class="recorte"><b>${esc(c.nome)}</b> · ${esc(PERFIS[c.perfil])}<br>
      Código da escola: <b>${esc(e.codigo)}</b> · Usuário: <b>${esc(c.login)}</b> · Senha provisória: <b class="senha">${esc(c.senhaProvisoria)}</b></div>`).join('')}</div>`);
  const m = abrirModal('Equipe cadastrada', `
    <p><b>${criados.length}</b> pessoa(s) cadastrada(s).${ignorados.length ? ` <b>${ignorados.length}</b> linha(s) não cadastrada(s):` : ''}</p>
    ${ignorados.length ? `<ul class="ajuda">${ignorados.map((i) => `<li>${esc(i.nome)} — ${esc(i.motivo)}</li>`).join('')}</ul>` : ''}
    ${criados.length ? `<p class="ajuda">Imprima a lista de acessos agora: por segurança, as senhas provisórias não serão mostradas de novo.</p>
      <div class="acoes"><button class="btn btn-primario" id="lote-imprimir" data-icone="imprimir">Imprimir lista de acessos</button>
      <button class="btn" data-fechar>Fechar</button></div>` : '<div class="acoes"><button class="btn" data-fechar>Fechar</button></div>'}`);
  $('#lote-imprimir', m)?.addEventListener('click', imprimir);
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


// ─── Importar listas da SED (CSV) ────────────────────────────────────────────
async function sed(el) {
  const box = novoContainer(el);
  const existentes = new Map(estado.turmas.map((t) => [t.nome.toLowerCase(), t]));
  box.innerHTML = `
    <section class="cartao">
      <h2>Importar listas de alunos da SED</h2>
      <ol class="passos-texto">
        <li>Na SED, abra a relação de alunos da turma e exporte em <b>CSV</b> (ou salve a planilha como CSV).</li>
        <li>Escolha um ou vários arquivos abaixo (um por turma, ou um arquivo com a coluna "Turma").</li>
        <li>Confira a prévia, ajuste o nome das turmas se precisar e clique em <b>Importar</b>.</li>
      </ol>
      <p class="ajuda">O arquivo é lido no seu computador; só os dados dos alunos são enviados. Alunos com situação diferente de
        "Ativo" (transferido, remanejado, abandono…) são ignorados. Se o RA já existir, o aluno é atualizado e movido de turma.
        Colunas reconhecidas: nome, RA, dígito, turma, situação, data de nascimento, responsável e telefone.</p>
      <label class="arquivo">Arquivos CSV da SED
        <input type="file" id="sed-arquivos" accept=".csv,.txt,text/csv" multiple></label>
    </section>
    <div id="sed-previa"></div>`;

  let grupos = []; // [{ turma, alunos: [...] }]
  $('#sed-arquivos', box).addEventListener('change', async (ev) => {
    const prev = $('#sed-previa', box);
    const arquivos = [...ev.target.files];
    if (!arquivos.length) { prev.innerHTML = ''; return; }
    prev.innerHTML = '<p class="carregando">Lendo arquivos…</p>';
    const porTurma = new Map();
    const erros = [];
    let ignorados = 0;
    for (const f of arquivos) {
      const r = await lerArquivoSED(f);
      if (r.erro) { erros.push(`${f.name}: ${r.erro}`); continue; }
      ignorados += r.ignorados.length;
      for (const a of r.alunos) {
        if (!porTurma.has(a.turma)) porTurma.set(a.turma, []);
        porTurma.get(a.turma).push(a);
      }
    }
    grupos = [...porTurma.entries()].map(([turma, alunos]) => ({ turma, alunos }));
    const total = grupos.reduce((n, g) => n + g.alunos.length, 0);
    prev.innerHTML = `
      ${erros.map((e) => `<div class="alerta alerta-perigo" data-icone="alerta"><span>${esc(e)}</span></div>`).join('')}
      ${grupos.length ? `<section class="cartao">
        <div class="cab-tela"><h2>Prévia: ${total} aluno(s) em ${grupos.length} turma(s)</h2>
          ${ignorados ? `<span class="selo grav-leve">${ignorados} não ativo(s) ignorado(s)</span>` : ''}</div>
        <div class="tabela-rolagem"><table class="tabela">
          <thead><tr><th>Turma no SisRoe</th><th>Alunos</th><th>Situação</th><th>Exemplo</th></tr></thead>
          <tbody>${grupos.map((g, i) => {
            const existe = existentes.has(g.turma.toLowerCase());
            return `<tr><td><input class="sed-turma" data-i="${i}" value="${esc(g.turma)}" maxlength="60" aria-label="Nome da turma"></td>
              <td>${g.alunos.length}</td>
              <td class="sed-sit" data-i="${i}">${existe ? '<span class="selo st-encerrada">já existe</span>' : '<span class="selo st-em_acompanhamento">nova turma</span>'}</td>
              <td><small>${esc(g.alunos.slice(0, 2).map((a) => a.nome).join(', '))}${g.alunos.length > 2 ? '…' : ''}</small></td></tr>`;
          }).join('')}</tbody></table></div>
        <label class="check" style="margin-top:14px"><input type="checkbox" id="sed-desativar">
          Desativar alunos dessas turmas que <b>não</b> estão na lista (transferidos/remanejados). O histórico deles continua guardado.</label>
        <div class="acoes"><button class="btn btn-primario" id="sed-importar" data-icone="baixar">Importar ${total} aluno(s)</button></div>
      </section>` : ''}`;
    aplicarIcones(prev);
    $$('.sed-turma', prev).forEach((inp) => inp.addEventListener('input', () => {
      const i = Number(inp.dataset.i);
      grupos[i].turma = inp.value.trim();
      $(`.sed-sit[data-i="${i}"]`, prev).innerHTML = existentes.has(grupos[i].turma.toLowerCase())
        ? '<span class="selo st-encerrada">já existe</span>' : '<span class="selo st-em_acompanhamento">nova turma</span>';
    }));
    $('#sed-importar', prev)?.addEventListener('click', async (e) => {
      const linhas = grupos.flatMap((g) => g.alunos.map((a) => ({ ...a, turma: g.turma })));
      if (linhas.some((l) => !l.turma)) return avisar('Preencha o nome de todas as turmas.', 'erro');
      await comCarregando(e.currentTarget, async () => {
        try {
          const r = await api('/alunos/importar-sed', { metodo: 'POST', corpo: { linhas, desativarAusentes: $('#sed-desativar', prev).checked } });
          await recarregarCadastros();
          prev.innerHTML = `<section class="cartao"><div class="alerta alerta-info" data-icone="ok"><span><b>Importação concluída.</b>
            ${r.criados} aluno(s) novo(s), ${r.atualizados} atualizado(s), ${r.turmasCriadas} turma(s) criada(s)${r.desativados ? `, ${r.desativados} desativado(s)` : ''}${r.ignorados ? `, ${r.ignorados} linha(s) sem nome/turma` : ''}.</span></div>
            <a class="btn" href="#/admin/turmas">Ver turmas</a> <a class="btn" href="#/carometro">Abrir o carômetro</a></section>`;
          aplicarIcones(prev);
          $('#sed-arquivos', box).value = '';
        } catch (err) { avisarErro(err); }
      });
    });
  });
}

// ─── Tipos de ocorrência ─────────────────────────────────────────────────────
// ─── Carômetro: fotos em lote (JPG) e carômetro da turma (PDF ou JPG) ────────
async function carometro(el) {
  el = novoContainer(el);
  const [arquivos, alunos] = await Promise.all([api('/carometros'), api('/alunos-lista')]);
  const comFoto = alunos.filter((a) => Number(a.tem_foto)).length;
  const opcoesTurma = estado.turmas.map((t) => `<option value="${t.id}">${esc(t.nome)}</option>`).join('');
  el.innerHTML = `
    <section class="cartao">
      <h2>Fotos dos estudantes em lote (JPG)</h2>
      <p>Escolha várias fotos de uma vez. Cada foto é ligada ao estudante pelo <b>nome do arquivo</b>:</p>
      <ul class="guia-lista">
        <li>pelo <b>RA</b>: <code>000123456789.jpg</code>, <code>123456789-5.jpg</code> ou <code>RA 123456789.jpg</code>;</li>
        <li>ou pelo <b>nome completo</b>: <code>Ana Beatriz Souza.jpg</code> (acentos e maiúsculas não importam).</li>
      </ul>
      <p class="ajuda">${alunos.length} estudante(s) ativo(s), ${comFoto} com foto. As fotos são recortadas em retrato e reduzidas
        antes do envio. Quem já tem foto fica com a nova. Use apenas fotos autorizadas pela escola (ECA e LGPD).</p>
      <label class="btn btn-primario" for="lote-fotos" data-icone="camera">Escolher fotos (JPG ou PNG)</label>
      <input type="file" id="lote-fotos" accept="image/jpeg,image/png" multiple class="visualmente-oculto">
      <div id="lote-previa"></div>
    </section>

    <section class="cartao">
      <h2>Carômetro da turma (PDF ou JPG)</h2>
      <p>Envie o carômetro já pronto, por exemplo o PDF gerado pela SED ou a foto da folha da turma.
        Ele aparece para toda a equipe na tela <a href="#/carometro">Carômetro</a>, com o botão <b>Abrir</b>.</p>
      <div class="grade-2">
        <label>Turma
          <select id="caro-turma-arq"><option value="">Escola toda (várias turmas no mesmo arquivo)</option>${opcoesTurma}</select></label>
        <label>Arquivo (PDF ou JPG, até ${tamanhoLegivel(MAX_CAROMETRO)})
          <input type="file" id="caro-arquivo" accept="application/pdf,.pdf,image/jpeg,image/png"></label>
      </div>
      <div class="linha-btn"><button class="btn btn-primario" id="caro-enviar" data-icone="enviar" disabled>Enviar carômetro</button>
        <span class="ajuda" id="caro-progresso"></span></div>
      <p class="ajuda">Se a turma já tiver um carômetro, o novo substitui o anterior. PDF com várias turmas? Escolha "Escola toda"
        ou, melhor, envie um arquivo por turma (fica mais leve para abrir no celular).</p>
      ${arquivos.length ? `<h3>Enviados (${arquivos.length})</h3>
        <table class="tabela"><thead><tr><th>Turma</th><th>Arquivo</th><th>Enviado</th><th></th></tr></thead><tbody>
        ${arquivos.map((c) => `<tr><td>${c.turma_id ? esc(c.turma_nome || '') : 'Escola toda'}</td>
          <td>${esc(c.nome_arquivo)} <small>(${c.mime === 'application/pdf' ? 'PDF' : 'imagem'}, ${tamanhoLegivel(c.tamanho)})</small></td>
          <td><small>${esc(c.enviado_por_nome || '')}<br>${dataHoraBR(c.criado_em)}</small></td>
          <td><div class="linha-btn"><button class="btn btn-peq" data-abrir-arq="${c.id}" data-icone="olho">Abrir</button>
            <button class="btn btn-peq btn-perigo-claro" data-remover-arq="${c.id}" data-icone="lixeira">Remover</button></div></td></tr>`).join('')}
        </tbody></table>` : '<p class="vazio">Nenhum carômetro em arquivo enviado ainda.</p>'}
    </section>`;
  aplicarIcones(el);

  // ── Fotos em lote ──
  let fila = [];
  const previa = $('#lote-previa', el);
  const desenharPrevia = () => {
    const ok = fila.filter((f) => f.aluno);
    const falta = fila.filter((f) => !f.aluno);
    previa.innerHTML = `
      <div class="lote-resumo"><b>${ok.length}</b> foto(s) reconhecida(s)${falta.length ? ` · <b class="txt-perigo">${falta.length}</b> sem estudante correspondente` : ''}</div>
      <div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Arquivo</th><th>Estudante</th><th>Situação</th></tr></thead><tbody>
      ${fila.map((f) => `<tr class="${f.aluno ? '' : 'linha-alerta'}"><td><small>${esc(f.arquivo.name)}</small></td>
        <td>${f.aluno ? `${esc(f.aluno.nome)} <small>${esc(f.aluno.turma_nome || '')} · pelo ${f.por}${Number(f.aluno.tem_foto) ? ' · troca a foto atual' : ''}</small>` : '—'}</td>
        <td>${f.status ? esc(f.status) : (f.aluno ? 'pronta' : esc(f.motivo))}</td></tr>`).join('')}
      </tbody></table></div>
      ${falta.length ? '<p class="ajuda">As fotos sem estudante não serão enviadas. Renomeie o arquivo com o RA ou o nome completo do estudante e escolha de novo.</p>' : ''}
      <div class="linha-btn"><button class="btn btn-primario" id="lote-enviar" data-icone="enviar" ${ok.length ? '' : 'disabled'}>Enviar ${ok.length} foto(s)</button>
        <button class="btn" id="lote-cancelar">Cancelar</button></div>`;
    aplicarIcones(previa);
  };
  $('#lote-fotos', el).addEventListener('change', (ev) => {
    const arquivosEscolhidos = [...ev.target.files];
    ev.target.value = '';
    if (!arquivosEscolhidos.length) return;
    // Duas fotos para o mesmo estudante: fica a última da lista.
    const vistos = new Map();
    fila = arquivosEscolhidos.map((arquivo) => ({ arquivo, ...casarFoto(arquivo.name, alunos) }));
    fila.forEach((f, i) => { if (f.aluno) { if (vistos.has(f.aluno.id)) { const ant = fila[vistos.get(f.aluno.id)]; ant.motivo = 'outra foto do mesmo estudante foi escolhida'; ant.aluno = null; } vistos.set(f.aluno.id, i); } });
    desenharPrevia();
  });
  previa.addEventListener('click', async (ev) => {
    if (ev.target.closest('#lote-cancelar')) { fila = []; previa.innerHTML = ''; return; }
    const botao = ev.target.closest('#lote-enviar');
    if (!botao) return;
    botao.disabled = true;
    let enviadas = 0, erros = 0;
    for (const f of fila.filter((x) => x.aluno)) {
      f.status = 'enviando…'; desenharPrevia(); $('#lote-enviar', previa).disabled = true;
      try {
        await api(`/alunos/${f.aluno.id}/foto`, { metodo: 'PUT', corpo: { imagem: await reduzirFoto(f.arquivo) } });
        f.status = 'enviada ✓'; enviadas++;
      } catch (e) { f.status = `erro: ${e.message}`; erros++; }
    }
    desenharPrevia();
    $('#lote-enviar', previa).remove();
    avisar(`${enviadas} foto(s) enviada(s)${erros ? `, ${erros} com erro` : ''}.`, erros ? 'erro' : 'ok');
  });

  // ── Carômetro em arquivo ──
  const inpArq = $('#caro-arquivo', el);
  inpArq.addEventListener('change', () => {
    const f = inpArq.files[0];
    if (f && !tipoCarometro(f)) { avisar('Escolha um arquivo PDF ou JPG.', 'erro'); inpArq.value = ''; }
    else if (f && tipoCarometro(f) === 'application/pdf' && f.size > MAX_CAROMETRO) { avisar('O PDF tem mais de 20 MB. Divida por turma.', 'erro'); inpArq.value = ''; }
    $('#caro-enviar', el).disabled = !inpArq.files[0];
  });
  $('#caro-enviar', el).addEventListener('click', async (ev) => {
    const botao = ev.currentTarget;
    const prog = $('#caro-progresso', el);
    botao.disabled = true;
    try {
      await enviarCarometro(inpArq.files[0], $('#caro-turma-arq', el).value, (p) => { prog.textContent = `Enviando… ${Math.round(p * 100)}%`; });
      avisar('Carômetro enviado. Ele já aparece na tela Carômetro.');
      await carometro(el.parentElement);
    } catch (e) { avisarErro(e); prog.textContent = ''; botao.disabled = false; }
  });
  el.addEventListener('click', async (ev) => {
    const abrir = ev.target.closest('[data-abrir-arq]');
    const remover = ev.target.closest('[data-remover-arq]');
    if (abrir) {
      const c = arquivos.find((x) => x.id === Number(abrir.dataset.abrirArq));
      try { await abrirCarometro(c); } catch (e) { avisarErro(e); }
    }
    if (remover) {
      const c = arquivos.find((x) => x.id === Number(remover.dataset.removerArq));
      if (!confirm(`Remover o carômetro "${c.nome_arquivo}"? As fotos individuais dos estudantes não são afetadas.`)) return;
      try { await api(`/carometros/${c.id}`, { metodo: 'DELETE' }); avisar('Carômetro removido.'); await carometro(el.parentElement); }
      catch (e) { avisarErro(e); }
    }
  });
}

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
