// telas/lista.js — lista de ocorrências com filtros e exportação para planilha.
import { api, baixar } from '../api.js';
import { $, esc, dataBR, seloCategoria, seloGravidade, seloStatus, lerForm, avisarErro } from '../ui.js';
import { estado, ehGestao } from '../app.js';
import { CATEGORIAS, GRAVIDADES, STATUS } from '../catalogo.js';

// Os filtros ficam guardados enquanto a página estiver aberta.
let filtrosSalvos = {};

export async function render(el) {
  el.innerHTML = `
    <div class="cab-tela">
      <h1>${ehGestao() ? 'Ocorrências da escola' : 'Minhas ocorrências'}</h1>
      <div class="linha-btn">
        ${ehGestao() ? '<button class="btn" id="btn-csv">⬇ Exportar planilha</button>' : ''}
        <a class="btn btn-primario" href="#/nova">+ Nova</a>
      </div>
    </div>
    <form id="filtros" class="cartao filtros">
      <label>Buscar <input type="search" name="busca" placeholder="aluno, tipo ou trecho do relato"></label>
      <label>Situação
        <select name="status"><option value="">Ativas (sem canceladas)</option>
          ${Object.entries(STATUS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}
          <option value="todas">Todas</option></select></label>
      <label>Categoria
        <select name="categoria"><option value="">Todas</option>
          ${Object.entries(CATEGORIAS).map(([k, v]) => `<option value="${k}">${esc(v.nome)}</option>`).join('')}</select></label>
      <label>Gravidade
        <select name="gravidade"><option value="">Todas</option>
          ${Object.entries(GRAVIDADES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
      <label>Turma
        <select name="turma_id"><option value="">Todas</option>
          ${estado.turmas.map((t) => `<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
      <label>De <input type="date" name="de"></label>
      <label>Até <input type="date" name="ate"></label>
      <div class="filtros-acoes"><button class="btn btn-primario" type="submit">Filtrar</button>
        <button class="btn" type="button" id="limpar">Limpar</button></div>
    </form>
    <div id="resultado"></div>`;

  const form = $('#filtros', el);
  for (const [k, v] of Object.entries(filtrosSalvos)) if (form[k]) form[k].value = v;

  const query = () => {
    const d = lerForm(form);
    filtrosSalvos = d;
    return new URLSearchParams(Object.entries(d).filter(([, v]) => v)).toString();
  };

  const buscar = async () => {
    const res = $('#resultado', el);
    res.innerHTML = '<p class="carregando">Buscando…</p>';
    try {
      const lista = await api(`/ocorrencias?${query()}`);
      res.innerHTML = lista.length ? `
        <p class="contagem">${lista.length} ocorrência(s)${lista.length >= 200 ? ' — mostrando as 200 mais recentes; use os filtros para refinar' : ''}</p>
        <ul class="lista-occ">${lista.map((o) => `
          <li class="occ cat-borda-${o.categoria}"><a href="#/ocorrencia/${o.id}">
            <div class="occ-topo"><span class="num">${esc(o.numero)}</span>
              <span>${dataBR(o.data)} ${esc(o.hora)}</span> ${seloStatus(o.status)}</div>
            <strong>${esc(o.tipo_codigo)} · ${esc(o.tipo_descricao)}</strong>
            <div class="occ-info">${esc(o.turma_nome || 'Sem turma')} · ${esc(o.local)}
              ${o.alunos.length ? ` · <b>${esc(o.alunos.map((a) => a.nome).join(', '))}</b>` : ''}</div>
            <div class="occ-selos">${seloCategoria(o.categoria)} ${seloGravidade(o.gravidade)}
              <small>por ${esc(o.registrado_por_nome)}</small></div>
          </a></li>`).join('')}</ul>`
        : '<div class="cartao vazio">Nenhuma ocorrência encontrada com esses filtros.</div>';
    } catch (e) { res.innerHTML = ''; avisarErro(e); }
  };

  form.addEventListener('submit', (ev) => { ev.preventDefault(); buscar(); });
  form.addEventListener('change', (ev) => { if (ev.target.tagName === 'SELECT') buscar(); });
  $('#limpar', el).addEventListener('click', () => { form.reset(); buscar(); });
  $('#btn-csv', el)?.addEventListener('click', () => baixar(`/ocorrencias.csv?${query()}`, 'ocorrencias.csv').catch(avisarErro));
  await buscar();
}
