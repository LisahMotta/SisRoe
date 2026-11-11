// telas/alunos.js — busca de aluno e histórico de ocorrências (equipe gestora).
import { api } from '../api.js';
import { $, esc, dataBR, seloCategoria, seloGravidade, seloStatus, avisarErro } from '../ui.js';
import { estado, ehGestao } from '../app.js';
import { CATEGORIAS, PAPEIS_ALUNO } from '../catalogo.js';

export async function render(el, [id]) {
  if (!ehGestao()) {
    el.innerHTML = '<div class="cartao">O histórico de alunos é restrito à equipe gestora.</div>';
    return;
  }
  if (id) return historico(el, Number(id));

  el.innerHTML = `
    <h1>Histórico do aluno</h1>
    <div class="cartao">
      <div class="grade-2">
        <label>Buscar por nome ou RA <input type="search" id="busca" placeholder="Digite ao menos 2 letras" autofocus></label>
        <label>Ou escolha a turma
          <select id="turma"><option value="">—</option>
            ${estado.turmas.map((t) => `<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
      </div>
      <ul id="res" class="lista-simples"></ul>
    </div>`;

  const res = $('#res', el);
  const mostrar = (lista) => {
    res.innerHTML = lista.length
      ? lista.map((a) => `<li><a href="#/alunos/${a.id}"><span class="desc">${esc(a.nome)}
          <small>${esc(a.turma_nome || '')}${a.ra ? ` · RA ${esc(a.ra)}` : ''}</small></span></a></li>`).join('')
      : '<li class="vazio">Nenhum aluno encontrado.</li>';
  };
  let tempo;
  $('#busca', el).addEventListener('input', (ev) => {
    clearTimeout(tempo);
    const q = ev.target.value.trim();
    if (q.length < 2) { res.innerHTML = ''; return; }
    tempo = setTimeout(() => api(`/alunos?busca=${encodeURIComponent(q)}`).then(mostrar).catch(avisarErro), 300);
  });
  $('#turma', el).addEventListener('change', async (ev) => {
    if (!ev.target.value) { res.innerHTML = ''; return; }
    const nome = ev.target.selectedOptions[0].textContent;
    try { mostrar((await api(`/alunos?turma_id=${ev.target.value}`)).map((a) => ({ ...a, turma_nome: nome }))); }
    catch (e) { avisarErro(e); }
  });
}

async function historico(el, id) {
  const { aluno, ocorrencias } = await api(`/alunos/${id}/historico`);
  const porCat = Object.keys(CATEGORIAS).map((c) => [c, ocorrencias.filter((o) => o.categoria === c).length]);
  el.innerHTML = `
    <a href="#/alunos" class="btn-link">← Buscar outro aluno</a>
    <h1>${esc(aluno.nome)}</h1>
    <p>${esc(aluno.turma_nome || 'Sem turma')}${aluno.ra ? ` · RA ${esc(aluno.ra)}` : ''}</p>
    <div class="numeros">
      <div class="numero"><span>${ocorrencias.length}</span>ocorrências</div>
      ${porCat.map(([c, n]) => `<div class="numero cat-borda-${c}"><span>${n}</span>${esc(CATEGORIAS[c].nome)}</div>`).join('')}
    </div>
    ${ocorrencias.length >= 3 ? '<div class="alerta alerta-info">Reincidência: avalie conversa com a família, plano de acompanhamento e encaminhamentos.</div>' : ''}
    <section class="cartao">
      ${ocorrencias.length ? `<ul class="lista-simples">${ocorrencias.map((o) => `
        <li><a href="#/ocorrencia/${o.id}"><span class="num">${esc(o.numero)}</span>
          <span class="desc">${esc(o.tipo_codigo)} · ${esc(o.tipo_descricao)}
            <small>${dataBR(o.data)} ${esc(o.hora)} · ${esc(PAPEIS_ALUNO[o.papel] || o.papel)}</small></span>
          ${seloCategoria(o.categoria)} ${seloGravidade(o.gravidade)} ${seloStatus(o.status)}</a></li>`).join('')}</ul>`
        : '<p class="vazio">Nenhuma ocorrência registrada para este aluno.</p>'}
    </section>`;
}
