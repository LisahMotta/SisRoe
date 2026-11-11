// telas/nova.js — registro de uma nova ocorrência em 3 passos:
// 1) categoria  2) tipo  3) dados, alunos e relato.
import { api } from '../api.js';
import { $, $$, esc, avisar, avisarErro, comCarregando, hojeISO, agoraHora, seloGravidade } from '../ui.js';
import { estado, navegar } from '../app.js';
import { CATEGORIAS, PROCEDIMENTOS, LOCAIS, PAPEIS_ALUNO } from '../catalogo.js';

// Estado desta tela (zera a cada abertura).
let passo, categoria, tipo, selecionados;

export async function render(el) {
  passo = 1; categoria = null; tipo = null;
  selecionados = new Map(); // chave → { id?, nome, ra?, turma_nome?, papel }
  desenhar(el);
}

function desenhar(el) {
  el.innerHTML = `
    <div class="cab-tela"><h1>Nova ocorrência</h1></div>
    <ol class="passos" aria-label="Etapas">
      <li class="${passo >= 1 ? 'feito' : ''}">Categoria</li>
      <li class="${passo >= 2 ? 'feito' : ''}">Tipo</li>
      <li class="${passo >= 3 ? 'feito' : ''}">Registro</li>
    </ol>
    <div id="etapa"></div>`;
  const etapa = $('#etapa', el);
  if (passo === 1) etapaCategoria(etapa, el);
  else if (passo === 2) etapaTipo(etapa, el);
  else etapaForm(etapa, el);
}

// ─── 1. Categoria ────────────────────────────────────────────────────────────
function etapaCategoria(etapa, el) {
  etapa.innerHTML = `<div class="cards-categoria">
    ${Object.entries(CATEGORIAS).map(([k, c]) => `
      <button class="card-cat cat-borda-${k}" data-cat="${k}">
        <strong>${esc(c.nome)}</strong><span>${esc(c.resumo)}</span>
      </button>`).join('')}
    </div>
    <p class="ajuda">Em caso de risco à vida, <b>primeiro</b> acione o socorro (PM 190 · SAMU 192 · Bombeiros 193) e a direção. O registro vem depois.</p>`;
  $$('[data-cat]', etapa).forEach((b) => b.addEventListener('click', () => {
    categoria = b.dataset.cat; passo = 2; desenhar(el);
  }));
}

// ─── 2. Tipo ─────────────────────────────────────────────────────────────────
function etapaTipo(etapa, el) {
  const tipos = estado.tipos.filter((t) => t.categoria === categoria);
  etapa.innerHTML = `
    <div class="cartao">
      <div class="cab-tela"><h2>${esc(CATEGORIAS[categoria].nome)}</h2>
        <button class="btn-link" id="voltar1">← trocar categoria</button></div>
      <input type="search" id="busca-tipo" placeholder="Digite para filtrar (ex.: boné, intervalo, celular)…" aria-label="Filtrar tipos">
      <ul class="lista-tipos" id="lista-tipos">
        ${tipos.map((t) => `<li><button data-tipo="${t.id}" data-busca="${esc((t.codigo + ' ' + t.descricao).toLowerCase())}">
            <span class="cod">${esc(t.codigo)}</span><span>${esc(t.descricao)}</span>${seloGravidade(t.gravidade)}</button></li>`).join('')}
      </ul>
      ${tipos.length ? '' : '<p class="vazio">Nenhum tipo ativo nesta categoria. A direção pode cadastrar em Administração.</p>'}
    </div>`;
  $('#voltar1', etapa).addEventListener('click', () => { passo = 1; desenhar(el); });
  const busca = $('#busca-tipo', etapa);
  busca.focus();
  busca.addEventListener('input', () => {
    const q = busca.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    $$('[data-tipo]', etapa).forEach((b) => {
      const alvo = b.dataset.busca.normalize('NFD').replace(/[̀-ͯ]/g, '');
      b.parentElement.hidden = q && !alvo.includes(q);
    });
  });
  $$('[data-tipo]', etapa).forEach((b) => b.addEventListener('click', () => {
    tipo = estado.tipos.find((t) => t.id === Number(b.dataset.tipo));
    passo = 3; desenhar(el);
  }));
}

// ─── 3. Formulário ───────────────────────────────────────────────────────────
function caixaProtocolo() {
  const passos = PROCEDIMENTOS[categoria];
  const urg = categoria === 'urgencia';
  const titulo = categoria === 'administrativa'
    ? 'Intervenções já realizadas (marque o que foi feito)'
    : 'Protocolo 179 — procedimentos (marque o que já foi feito)';
  return `<fieldset class="protocolo prot-${categoria}">
      <legend>${titulo}</legend>
      ${urg ? `<div class="telefones">
          <a href="tel:190">🚓 PM <b>190</b></a><a href="tel:192">🚑 SAMU <b>192</b></a><a href="tel:193">🚒 Bombeiros <b>193</b></a></div>` : ''}
      ${passos.map((p) => `<label class="check"><input type="checkbox" name="prot" value="${p.k}"> ${esc(p.t)}</label>`).join('')}
      ${categoria !== 'administrativa' ? '<small>A equipe gestora completa os demais passos na tela de acompanhamento.</small>' : ''}
    </fieldset>`;
}

function etapaForm(etapa, el) {
  etapa.innerHTML = `
    <form id="form-occ" class="cartao" novalidate>
      <div class="tipo-escolhido cat-borda-${categoria}">
        <div><small>${esc(CATEGORIAS[categoria].nome)}</small>
          <strong>${esc(tipo.codigo)} · ${esc(tipo.descricao)}</strong></div>
        <button type="button" class="btn-link" id="voltar2">trocar</button>
      </div>

      <div class="grade-3">
        <label>Data * <input type="date" name="data" required value="${hojeISO()}" max="${hojeISO()}"></label>
        <label>Horário * <input type="time" name="hora" required value="${agoraHora()}"></label>
        <label>Local *
          <select name="local" required>
            ${LOCAIS.map((l) => `<option>${esc(l)}</option>`).join('')}
          </select>
        </label>
      </div>
      <label id="local-outro" hidden>Qual local? <input name="localOutro" maxlength="80"></label>

      <fieldset>
        <legend>Estudante(s) envolvido(s) ${categoria === 'administrativa' ? '*' : ''}</legend>
        <label>Turma
          <select name="turma_id" id="sel-turma">
            <option value="">— selecione —</option>
            ${estado.turmas.map((t) => `<option value="${t.id}">${esc(t.nome)}${t.periodo ? ` (${esc(t.periodo)})` : ''}</option>`).join('')}
          </select>
        </label>
        <div id="alunos-turma" class="alunos-turma"></div>
        <details class="mais-alunos">
          <summary>Aluno de outra turma ou sem cadastro</summary>
          <div class="grade-2">
            <label>Buscar aluno na escola <input type="search" id="busca-aluno" placeholder="nome ou RA"></label>
            <label>Ou digite o nome <span class="linha-btn"><input id="nome-livre" maxlength="120">
              <button type="button" class="btn" id="add-livre">Adicionar</button></span></label>
          </div>
          <ul id="resultado-busca" class="resultado-busca"></ul>
        </details>
        <div id="selecionados"></div>
      </fieldset>

      <label>Relato dos fatos *
        <textarea name="relato" rows="7" required maxlength="8000"
          placeholder="Descreva o que aconteceu, de forma objetiva."></textarea>
      </label>
      <details class="dicas"><summary>Como escrever um bom relato</summary>
        <ul>
          <li>Diga <b>o que</b> aconteceu, <b>quem</b> estava envolvido, <b>onde</b> e <b>como</b>, na ordem em que ocorreu.</li>
          <li>Descreva fatos que você viu ou ouviu. Evite opiniões e rótulos ("é um aluno problemático").</li>
          <li>Se reproduzir falas, use aspas. Identifique quem relatou o que você não presenciou.</li>
          <li>Registre o que já foi feito na hora (ex.: "pedi três vezes que retirasse o boné; o aluno se recusou").</li>
        </ul>
      </details>

      ${caixaProtocolo()}

      <label>Providências imediatas tomadas
        <textarea name="providencias" rows="3" maxlength="4000" placeholder="Ex.: aluno encaminhado à coordenação; família contatada por telefone às 10h."></textarea>
      </label>

      <div class="acoes">
        <button type="submit" class="btn btn-primario">Registrar ocorrência</button>
        <a href="#/painel" class="btn">Cancelar</a>
      </div>
    </form>`;

  const form = $('#form-occ', etapa);
  $('#voltar2', etapa).addEventListener('click', () => { passo = 2; desenhar(el); });
  form.local.addEventListener('change', () => { $('#local-outro', etapa).hidden = form.local.value !== 'Outro'; });

  // Alunos da turma escolhida
  $('#sel-turma', etapa).addEventListener('change', async (ev) => {
    const caixa = $('#alunos-turma', etapa);
    if (!ev.target.value) { caixa.innerHTML = ''; return; }
    caixa.innerHTML = '<p class="carregando">Carregando alunos…</p>';
    try {
      const alunos = await api(`/alunos?turma_id=${ev.target.value}`);
      const turmaNome = ev.target.selectedOptions[0].textContent;
      caixa.innerHTML = alunos.length
        ? `<input type="search" class="filtro-alunos" placeholder="Filtrar nesta turma…" aria-label="Filtrar alunos">
           <div class="grade-alunos">${alunos.map((a) => `
            <label class="check"><input type="checkbox" data-aluno='${esc(JSON.stringify({ id: a.id, nome: a.nome, ra: a.ra, turma_nome: turmaNome }))}'
              ${selecionados.has('id' + a.id) ? 'checked' : ''}> ${esc(a.nome)}</label>`).join('')}</div>`
        : '<p class="vazio">Esta turma ainda não tem alunos cadastrados. Use "Aluno de outra turma ou sem cadastro".</p>';
      const filtro = $('.filtro-alunos', caixa);
      filtro?.addEventListener('input', () => {
        const q = filtro.value.toLowerCase();
        $$('.grade-alunos label', caixa).forEach((l) => { l.hidden = q && !l.textContent.toLowerCase().includes(q); });
      });
    } catch (e) { avisarErro(e); }
  });
  $('#alunos-turma', etapa).addEventListener('change', (ev) => {
    const cb = ev.target.closest('[data-aluno]');
    if (!cb) return;
    const a = JSON.parse(cb.dataset.aluno);
    if (cb.checked) selecionados.set('id' + a.id, { ...a, papel: 'envolvido' });
    else selecionados.delete('id' + a.id);
    desenharSelecionados(etapa);
  });

  // Busca em toda a escola
  let tempo;
  $('#busca-aluno', etapa).addEventListener('input', (ev) => {
    clearTimeout(tempo);
    tempo = setTimeout(async () => {
      const ul = $('#resultado-busca', etapa);
      const q = ev.target.value.trim();
      if (q.length < 2) { ul.innerHTML = ''; return; }
      try {
        const r = await api(`/alunos?busca=${encodeURIComponent(q)}`);
        ul.innerHTML = r.length ? r.map((a) => `<li><button type="button" data-add='${esc(JSON.stringify({ id: a.id, nome: a.nome, ra: a.ra, turma_nome: a.turma_nome }))}'>
            ${esc(a.nome)} <small>${esc(a.turma_nome || '')}</small></button></li>`).join('') : '<li class="vazio">Nenhum aluno encontrado.</li>';
      } catch (e) { avisarErro(e); }
    }, 300);
  });
  $('#resultado-busca', etapa).addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-add]');
    if (!b) return;
    const a = JSON.parse(b.dataset.add);
    selecionados.set('id' + a.id, { ...a, papel: 'envolvido' });
    desenharSelecionados(etapa);
  });
  $('#add-livre', etapa).addEventListener('click', () => {
    const inp = $('#nome-livre', etapa);
    const nome = inp.value.trim();
    if (!nome) return;
    selecionados.set('livre' + Date.now(), { nome: nome.toUpperCase(), papel: 'envolvido' });
    inp.value = '';
    desenharSelecionados(etapa);
  });

  // Papel de cada aluno / remover
  $('#selecionados', etapa).addEventListener('change', (ev) => {
    const s = ev.target.closest('[data-papel]');
    if (s) selecionados.get(s.dataset.papel).papel = s.value;
  });
  $('#selecionados', etapa).addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-remover]');
    if (!b) return;
    selecionados.delete(b.dataset.remover);
    const cb = $$('[data-aluno]', etapa).find((c) => 'id' + JSON.parse(c.dataset.aluno).id === b.dataset.remover);
    if (cb) cb.checked = false;
    desenharSelecionados(etapa);
  });

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const local = form.local.value === 'Outro' ? form.localOutro.value.trim() : form.local.value;
    const corpo = {
      tipo_id: tipo.id,
      data: form.data.value,
      hora: form.hora.value,
      local,
      turma_id: form.turma_id.value || null,
      relato: form.relato.value,
      providencias: form.providencias.value,
      protocolo: $$('input[name=prot]:checked', form).map((c) => c.value),
      alunos: [...selecionados.values()].map((a) => ({ id: a.id, nome: a.nome, turma_nome: a.turma_nome, papel: a.papel })),
    };
    if (!local) return avisar('Informe o local.', 'erro');
    if (categoria === 'administrativa' && !corpo.alunos.length) return avisar('Selecione pelo menos um aluno.', 'erro');
    if (corpo.relato.trim().length < 15) return avisar('Escreva o relato dos fatos (pelo menos 15 caracteres).', 'erro');
    await comCarregando(form.querySelector('[type=submit]'), async () => {
      try {
        const r = await api('/ocorrencias', { metodo: 'POST', corpo });
        avisar(`Ocorrência ${r.numero} registrada.`);
        navegar(`#/ocorrencia/${r.id}`);
      } catch (e) { avisarErro(e); }
    });
  });
}

function desenharSelecionados(etapa) {
  const caixa = $('#selecionados', etapa);
  if (!selecionados.size) { caixa.innerHTML = ''; return; }
  caixa.innerHTML = `<p class="rotulo">Selecionados (${selecionados.size}) — indique o papel de cada um:</p>
    <ul class="selecionados">${[...selecionados.entries()].map(([k, a]) => `
      <li><span>${esc(a.nome)} <small>${esc(a.turma_nome || '')}</small></span>
        <select data-papel="${esc(k)}" aria-label="Papel de ${esc(a.nome)}">
          ${Object.entries(PAPEIS_ALUNO).map(([v, t]) => `<option value="${v}" ${a.papel === v ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
        <button type="button" class="btn-icone" data-remover="${esc(k)}" aria-label="Remover ${esc(a.nome)}">✕</button></li>`).join('')}
    </ul>`;
}
