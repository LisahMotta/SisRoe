// telas/busca.js — busca ativa de estudantes faltosos (equipe gestora).
// Lista de casos, registro de faltosos por turma e ficha do caso com WhatsApp.
import { api } from '../api.js';
import { $, $$, esc, dataBR, dataHoraBR, lerForm, avisar, avisarErro, abrirModal, fecharModal, comCarregando, hojeISO, aplicarIcones } from '../ui.js';
import { estado, ehGestao } from '../app.js';
import { STATUS_BUSCA, STATUS_BUSCA_FINAIS, TIPOS_ACAO_BUSCA, RISCOS_BUSCA } from '../catalogo.js';
import { montarMensagem, linkWhatsApp, telefoneBR, numeroWhatsApp } from '../whatsapp.js';

const seloStatus = (s) => `<span class="selo bs-${esc(s)}">${esc(STATUS_BUSCA[s] || s)}</span>`;
const seloRisco = (r) => `<span class="selo risco-${esc(r)}">${esc(RISCOS_BUSCA[r] || r)}</span>`;
let filtroStatus = '';

export async function render(el, [id]) {
  if (!ehGestao()) { el.innerHTML = '<div class="cartao">A busca ativa é restrita à equipe gestora.</div>'; return; }
  if (id) return ficha(el, Number(id));

  el.innerHTML = `
    <div class="cab-tela"><h1>Busca ativa</h1>
      <button class="btn btn-primario" id="btn-faltosos" data-icone="mais">Registrar faltosos</button></div>
    <p class="ajuda">Acompanhe os estudantes faltosos e o contato com as famílias. A mensagem de WhatsApp abre pronta no seu
      aparelho; você confere e envia por lá.</p>
    <div class="cartao filtros-linha">
      <label>Situação
        <select id="busca-status"><option value="">Em andamento</option>
          ${Object.entries(STATUS_BUSCA).map(([k, v]) => `<option value="${k}" ${k === filtroStatus ? 'selected' : ''}>${esc(v)}</option>`).join('')}
          <option value="todos" ${filtroStatus === 'todos' ? 'selected' : ''}>Todos</option></select></label>
      <label>Buscar <input type="search" id="busca-texto" placeholder="Nome do estudante ou turma"></label>
    </div>
    <div id="busca-lista"></div>`;
  $('#btn-faltosos', el).addEventListener('click', () => modalFaltosos(el));
  $('#busca-status', el).addEventListener('change', (e) => { filtroStatus = e.target.value; carregarLista(el); });
  $('#busca-texto', el).addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    $$('.busca-item', el).forEach((li) => { li.hidden = q && !li.dataset.busca.includes(q); });
  });
  await carregarLista(el);
}

async function carregarLista(el) {
  const caixa = $('#busca-lista', el);
  caixa.innerHTML = '<p class="carregando">Carregando…</p>';
  try {
    const lista = await api(`/busca-ativa${filtroStatus ? `?status=${filtroStatus}` : ''}`);
    caixa.innerHTML = lista.length ? `
      <p class="contagem">${lista.length} caso(s)</p>
      <ul class="lista-occ">${lista.map((b) => `
        <li class="occ busca-item risco-borda-${esc(b.risco)}" data-busca="${esc((b.aluno_nome + ' ' + (b.turma_nome || '')).toLowerCase())}">
          <a href="#/busca/${b.id}">
            <div class="occ-topo"><span>${esc(b.turma_nome || 'Sem turma')}</span>
              <span>${b.periodo_inicio ? `${dataBR(b.periodo_inicio)}${b.periodo_fim ? ` a ${dataBR(b.periodo_fim)}` : ''}` : ''}</span>
              ${seloStatus(b.status)}</div>
            <strong>${esc(b.aluno_nome)}</strong>
            <div class="occ-info"><b>${b.faltas}</b> falta(s) · ${b.qtd_acoes} ação(ões)${b.ultima_acao ? ` · última em ${dataHoraBR(b.ultima_acao)}` : ' · nenhum contato ainda'}
              ${b.telefone ? '' : ' · <span class="texto-alerta">sem telefone</span>'}</div>
            <div class="occ-selos">${seloRisco(b.risco)}</div>
          </a></li>`).join('')}</ul>`
      : '<div class="cartao vazio">Nenhum caso de busca ativa nesta situação.</div>';
  } catch (e) { caixa.innerHTML = ''; avisarErro(e); }
}

// Registrar vários faltosos de uma turma de uma vez.
function modalFaltosos(el) {
  const m = abrirModal('Registrar estudantes faltosos', `
    <form id="form-faltosos">
      <div class="grade-3">
        <label>Turma * <select name="turma" required><option value="">— escolha —</option>
          ${estado.turmas.map((t) => `<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
        <label>Faltas desde <input type="date" name="periodo_inicio" max="${hojeISO()}"></label>
        <label>Até <input type="date" name="periodo_fim" max="${hojeISO()}" value="${hojeISO()}"></label>
      </div>
      <label>Motivo / observação (opcional) <input name="motivo" maxlength="500" placeholder="ex.: faltas consecutivas sem justificativa"></label>
      <div id="faltosos-alunos"><p class="ajuda">Escolha a turma para marcar os estudantes faltosos.</p></div>
      <div class="acoes"><button class="btn btn-primario" type="submit">Registrar</button><button class="btn" type="button" data-fechar>Cancelar</button></div>
    </form>`);
  const f = $('#form-faltosos', m);
  f.turma.addEventListener('change', async () => {
    const caixa = $('#faltosos-alunos', m);
    if (!f.turma.value) { caixa.innerHTML = ''; return; }
    caixa.innerHTML = '<p class="carregando">Carregando alunos…</p>';
    try {
      const alunos = await api(`/alunos?turma_id=${f.turma.value}`);
      caixa.innerHTML = alunos.length ? `
        <p class="rotulo">Marque os faltosos e informe o número de faltas:</p>
        <div class="faltosos-lista">${alunos.map((a) => `
          <div class="faltoso"><label class="check"><input type="checkbox" data-aluno="${a.id}"> ${esc(a.nome)}</label>
            <input type="number" min="1" max="200" value="3" data-faltas="${a.id}" aria-label="Faltas de ${esc(a.nome)}"></div>`).join('')}</div>`
        : '<p class="vazio">Turma sem alunos cadastrados.</p>';
    } catch (e) { avisarErro(e); }
  });
  f.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const d = lerForm(f);
    const itens = $$('input[data-aluno]:checked', m).map((c) => ({
      aluno_id: Number(c.dataset.aluno), faltas: Number($(`input[data-faltas="${c.dataset.aluno}"]`, m).value) || 0,
    }));
    if (!itens.length) return avisar('Marque ao menos um estudante.', 'erro');
    await comCarregando(f.querySelector('[type=submit]'), async () => {
      try {
        const r = await api('/busca-ativa/lote', { metodo: 'POST', corpo: { itens, periodo_inicio: d.periodo_inicio, periodo_fim: d.periodo_fim, motivo: d.motivo } });
        fecharModal();
        avisar(`${r.criados} caso(s) registrado(s).${r.jaExistiam.length ? ` Já em andamento: ${r.jaExistiam.join(', ')}.` : ''}`);
        await carregarLista(el);
      } catch (e) { avisarErro(e); }
    });
  });
}

// ─── Ficha do caso ───────────────────────────────────────────────────────────
async function ficha(el, id) {
  const b = await api(`/busca-ativa/${id}`);
  const e = estado.escola;
  const final = STATUS_BUSCA_FINAIS.includes(b.status);
  const msg = montarMensagem(e.modelo_whatsapp, {
    responsavel: b.responsavel, aluno: b.aluno_nome, turma: b.turma_nome, faltas: b.faltas,
    inicio: b.periodo_inicio, fim: b.periodo_fim, escola: e.nome, telefoneEscola: e.telefone,
  });
  el.innerHTML = `
    <a href="#/busca" class="btn-link" data-icone="voltar">Voltar à busca ativa</a>
    <div class="cab-tela"><h1>${esc(b.aluno_nome)}</h1><div class="linha-btn">${seloRisco(b.risco)} ${seloStatus(b.status)}</div></div>
    <p class="occ-info">${esc(b.turma_nome || 'Sem turma')} · <b>${b.faltas}</b> falta(s)
      ${b.periodo_inicio ? ` · ${dataBR(b.periodo_inicio)}${b.periodo_fim ? ` a ${dataBR(b.periodo_fim)}` : ''}` : ''} · aberto por ${esc(b.aberto_por_nome)} em ${dataHoraBR(b.criado_em)}</p>

    <div class="grade-2 grade-painel">
      <section class="cartao">
        <h2>Contato da família</h2>
        <form id="form-contato">
          <label>Responsável <input name="responsavel" maxlength="120" value="${esc(b.responsavel || '')}"></label>
          <label>WhatsApp do responsável (com DDD) <input name="telefone" inputmode="tel" maxlength="20" value="${esc(telefoneBR(b.telefone) || '')}" placeholder="(12) 98888-7777"></label>
          <button class="btn" type="submit">Salvar contato</button>
          <p class="ajuda">O contato também fica salvo no cadastro do estudante.</p>
        </form>
      </section>
      <section class="cartao">
        <h2>Mensagem de WhatsApp</h2>
        <label>Texto (pode editar antes de abrir)
          <textarea id="msg-whats" rows="6" maxlength="1500">${esc(msg)}</textarea></label>
        <div class="acoes">
          <a class="btn btn-whats ${numeroWhatsApp(b.telefone) ? '' : 'desativado'}" id="btn-whats" target="_blank" rel="noopener" data-icone="enviar"
            href="${esc(linkWhatsApp(b.telefone, msg))}">Abrir no WhatsApp</a>
        </div>
        <p class="ajuda" id="whats-ajuda">${numeroWhatsApp(b.telefone) ? `Para ${esc(telefoneBR(b.telefone))}. A tentativa fica registrada no histórico.` : 'Cadastre o telefone do responsável para liberar o botão.'}</p>
      </section>
    </div>

    <section class="cartao">
      <h2>Registrar ação</h2>
      <form id="form-acao" class="grade-acao">
        <label>Tipo <select name="tipo">${Object.entries(TIPOS_ACAO_BUSCA).filter(([k]) => k !== 'whatsapp').map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</select></label>
        <label>Resultado / observação <input name="resultado" maxlength="1000" placeholder="ex.: mãe atendeu; aluno doente, retorna segunda"></label>
        <div class="alinhar-base"><button class="btn btn-primario" type="submit">Registrar</button></div>
      </form>
    </section>

    <section class="cartao">
      <h2>Situação do caso</h2>
      <form id="form-caso">
        <div class="grade-4">
          <label>Situação <select name="status">${Object.entries(STATUS_BUSCA).map(([k, v]) => `<option value="${k}" ${k === b.status ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>
          <label>Faltas <input type="number" name="faltas" min="0" max="200" value="${b.faltas}"></label>
          <label>Risco <select name="risco">${Object.entries(RISCOS_BUSCA).map(([k, v]) => `<option value="${k}" ${k === b.risco ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>
          <label>Faltas desde <input type="date" name="periodo_inicio" value="${esc(b.periodo_inicio || '')}"></label>
        </div>
        <label>Observações <textarea name="observacoes" rows="2" maxlength="2000">${esc(b.observacoes || '')}</textarea></label>
        <button class="btn btn-primario" type="submit">Salvar situação</button>
        ${!final ? '<p class="ajuda">Faltas que persistem sem contato com a família podem exigir comunicação ao Conselho Tutelar (Protocolo 179, 4.19 Evasão escolar).</p>' : ''}
      </form>
    </section>

    <section class="cartao">
      <h2>Histórico</h2>
      ${b.acoes.length ? `<ul class="notas">${b.acoes.map((a) => `<li><div class="nota-cab"><b>${esc(TIPOS_ACAO_BUSCA[a.tipo] || (a.tipo === 'status' ? 'Mudança de situação' : a.tipo))}</b> · ${esc(a.usuario_nome)} · ${dataHoraBR(a.criado_em)}</div>
        ${a.resultado ? `<p>${esc(a.resultado)}</p>` : ''}</li>`).join('')}</ul>` : '<p class="vazio">Nenhuma ação registrada ainda.</p>'}
    </section>`;

  const recarregar = () => ficha(el, id).then(() => aplicarIcones(el));
  const txtMsg = $('#msg-whats', el);
  const btnWhats = $('#btn-whats', el);
  txtMsg.addEventListener('input', () => { btnWhats.href = linkWhatsApp(b.telefone, txtMsg.value) || '#'; });
  btnWhats.addEventListener('click', async (ev) => {
    if (!numeroWhatsApp(b.telefone)) { ev.preventDefault(); return avisar('Cadastre o telefone do responsável.', 'erro'); }
    // O link abre em nova aba; aqui só registramos a tentativa (o envio é feito pela pessoa).
    try {
      await api(`/busca-ativa/${id}/acoes`, { metodo: 'POST', corpo: { tipo: 'whatsapp', resultado: `Mensagem aberta no WhatsApp para ${telefoneBR(b.telefone)}.` } });
      setTimeout(recarregar, 600);
    } catch (e) { avisarErro(e); }
  });
  $('#form-contato', el).addEventListener('submit', async (ev) => {
    ev.preventDefault();
    try { await api(`/busca-ativa/${id}`, { metodo: 'PUT', corpo: lerForm(ev.target) }); avisar('Contato salvo.'); await recarregar(); }
    catch (e) { avisarErro(e); }
  });
  $('#form-acao', el).addEventListener('submit', async (ev) => {
    ev.preventDefault();
    try { await api(`/busca-ativa/${id}/acoes`, { metodo: 'POST', corpo: lerForm(ev.target) }); avisar('Ação registrada.'); await recarregar(); }
    catch (e) { avisarErro(e); }
  });
  $('#form-caso', el).addEventListener('submit', async (ev) => {
    ev.preventDefault();
    try { await api(`/busca-ativa/${id}`, { metodo: 'PUT', corpo: lerForm(ev.target) }); avisar('Situação salva.'); await recarregar(); }
    catch (e) { avisarErro(e); }
  });
}
