// telas/nova.js — registro de uma nova ocorrência em 3 passos:
// 1) categoria  2) tipo  3) dados, alunos e relato.
import { api } from '../api.js';
import { $, $$, esc, avisar, avisarErro, comCarregando, hojeISO, agoraHora, seloGravidade } from '../ui.js';
import { estado, navegar } from '../app.js';
import { CATEGORIAS, LOCAIS, PAPEIS_ALUNO, RES68, ATIVIDADES_ESTUDO_DIRIGIDO } from '../catalogo.js';
import { htmlPassos, htmlRegraBO, nomeMacro } from '../passos.js';

// Estado desta tela (zera a cada abertura).
let passo, categoria, tipo, tipoDet, selecionados;

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
  // Agrupa pelas macrocategorias do Protocolo 179 (a–j); tipos sem macro ficam em "Outros".
  const grupos = {};
  for (const t of tipos) (grupos[t.macro || 'z'] ||= []).push(t);
  const ordem = Object.keys(grupos).sort();
  const item = (t) => `<li><button data-tipo="${t.id}"
      data-busca="${esc((t.codigo + ' ' + t.descricao + ' ' + (t.definicao || '')).toLowerCase())}">
      <span class="cod">${esc(t.codigo)}</span>
      <span class="tipo-txt">${esc(t.descricao)}${t.definicao ? `<small>${esc(t.definicao.slice(0, 160))}${t.definicao.length > 160 ? '…' : ''}</small>` : ''}</span>
      ${seloGravidade(t.gravidade)}</button></li>`;
  etapa.innerHTML = `
    <div class="cartao">
      <div class="cab-tela"><h2>${esc(CATEGORIAS[categoria].nome)}</h2>
        <button class="btn-link" id="voltar1">← trocar categoria</button></div>
      <input type="search" id="busca-tipo" placeholder="Digite para filtrar (ex.: boné, celular, arma, bullying)…" aria-label="Filtrar tipos">
      <div id="lista-tipos">
        ${ordem.map((m) => `<section class="grupo-tipos">
          ${ordem.length > 1 || m !== 'z' ? `<h3>${m === 'z' ? 'Outros' : esc(nomeMacro(m))}</h3>` : ''}
          <ul class="lista-tipos">${grupos[m].map(item).join('')}</ul></section>`).join('')}
      </div>
      ${tipos.length ? '' : '<p class="vazio">Nenhum tipo ativo nesta categoria. A direção pode cadastrar em Administração.</p>'}
    </div>`;
  $('#voltar1', etapa).addEventListener('click', () => { passo = 1; desenhar(el); });
  const busca = $('#busca-tipo', etapa);
  busca.focus();
  const semAcento = (x) => x.normalize('NFD').replace(/[̀-ͯ]/g, '');
  busca.addEventListener('input', () => {
    const q = semAcento(busca.value.toLowerCase());
    $$('[data-tipo]', etapa).forEach((b) => { b.parentElement.hidden = q && !semAcento(b.dataset.busca).includes(q); });
    $$('.grupo-tipos', etapa).forEach((g) => { g.hidden = !$$('li:not([hidden])', g).length; });
  });
  $$('[data-tipo]', etapa).forEach((b) => b.addEventListener('click', async () => {
    try {
      tipoDet = await api(`/tipos/${Number(b.dataset.tipo)}`);
      tipo = estado.tipos.find((t) => t.id === Number(b.dataset.tipo));
      passo = 3; desenhar(el);
    } catch (e) { avisarErro(e); }
  }));
}

// ─── 3. Formulário ───────────────────────────────────────────────────────────
function caixaProtocolo() {
  const passos = tipoDet.passos;
  const urg = categoria === 'urgencia';
  const titulo = tipoDet.passos_proprios
    ? `Protocolo 179 — ${tipo.codigo} ${tipo.descricao}: marque o que já foi feito`
    : `Intervenções pedagógicas já realizadas — Art. 7º, ${RES68}`;
  return `<fieldset class="protocolo prot-${categoria}">
      <legend>${titulo}</legend>
      ${urg ? `<div class="telefones">
          <a href="tel:190">🚓 PM <b>190</b></a><a href="tel:192">🚑 SAMU <b>192</b></a><a href="tel:193">🚒 Bombeiros <b>193</b></a></div>` : ''}
      ${htmlPassos(passos)}
      ${!tipoDet.passos_proprios ? `<div id="aviso-estudo" class="aviso-norma" hidden>
          <b>Estudo dirigido (Art. 7º, IX e Art. 8º):</b> sempre sob supervisão de integrante da equipe gestora, com atividades
          pedagógicas e sem prejuízo da aprendizagem. É vedado usá-lo como castigo ou segregação (§ 6º). Se for reiterado,
          comunique a família e inclua no plano individual de acompanhamento (§ 5º).
          <br>Atividades possíveis: ${ATIVIDADES_ESTUDO_DIRIGIDO.map(esc).join(' · ')}.</div>
        <small>As intervenções não são respostas automáticas: escolha a partir da análise da situação (Art. 7º, § 1º).</small>`
        : '<small>Passos do Protocolo 179 — 3ª versão. A equipe gestora completa os demais na tela de acompanhamento.</small>'}
    </fieldset>`;
}

function etapaForm(etapa, el) {
  etapa.innerHTML = `
    <form id="form-occ" class="cartao" novalidate>
      <div class="tipo-escolhido cat-borda-${categoria}">
        <div><small>${esc(CATEGORIAS[categoria].nome)}</small>
          <strong>${esc(tipo.codigo)} · ${esc(tipo.descricao)}</strong>
          ${tipo.macro ? `<small>Macrocategoria ${esc(nomeMacro(tipo.macro))}</small>` : ''}</div>
        <button type="button" class="btn-link" id="voltar2">trocar</button>
      </div>
      ${tipoDet.definicao ? `<p class="definicao">${esc(tipoDet.definicao)}</p>` : ''}
      ${categoria !== 'administrativa' ? htmlRegraBO(tipoDet.bo) : ''}

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
      <details class="mais-alunos">
        <summary>A escola soube do fato depois (ciência tardia)?</summary>
        <label>Data em que a escola tomou conhecimento
          <input type="date" name="data_conhecimento" max="${hojeISO()}">
          <small>A ciência tardia não dispensa o registro, que deve ser feito assim que o fato é conhecido (Art. 9º, § 3º, ${RES68}).</small>
        </label>
      </details>

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
  form.addEventListener('change', (ev) => {
    if (ev.target.name === 'prot' && ev.target.value === 'estudo_dirigido') $('#aviso-estudo', etapa).hidden = !ev.target.checked;
  });

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
      data_conhecimento: form.data_conhecimento.value || null,
      local,
      turma_id: form.turma_id.value || null,
      relato: form.relato.value,
      providencias: form.providencias.value,
      protocolo: $$('input[name=prot]:checked', form).map((c) => c.value),
      alunos: [...selecionados.values()].map((a) => ({ id: a.id, nome: a.nome, turma_nome: a.turma_nome, papel: a.papel })),
    };
    if (!local) return avisar('Informe o local.', 'erro');
    if (corpo.data_conhecimento && corpo.data_conhecimento < corpo.data) {
      return avisar('A data em que a escola soube não pode ser anterior à data do fato.', 'erro');
    }
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
