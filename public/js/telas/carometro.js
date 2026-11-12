// telas/carometro.js — fotos dos estudantes por turma.
// Todos os servidores veem; a equipe gestora envia, troca ou remove fotos.
// A foto é reduzida no próprio aparelho (máx. 360 px, JPEG) antes de ir para o servidor.
import { api } from '../api.js';
import { $, $$, esc, avisar, avisarErro, abrirModal, fecharModal, comCarregando, icone, dataHoraBR } from '../ui.js';
import { estado, ehGestao, ehAdmin } from '../app.js';
import { reduzirFoto, abrirCarometro, baixarArquivoCarometro, tamanhoLegivel } from '../imagem.js';

const podeEnviarFoto = () => ehGestao() || ehAdmin();

let turmaAtual = '';
let filtro = '';
let alunosAtuais = [];
let arquivos = []; // carômetros em PDF/JPG enviados pela administração

const iniciais = (n) => {
  const p = String(n).split(/\s+/).filter((x) => x.length > 2);
  return ((p[0]?.[0] || '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
};

export async function render(el, [turmaParam]) {
  if (turmaParam) turmaAtual = turmaParam;
  if (!turmaAtual && estado.turmas.length) turmaAtual = String(estado.turmas[0].id);
  el.innerHTML = `
    <div class="cab-tela"><h1>Carômetro</h1>
      <div class="linha-btn">
        <select id="caro-turma" aria-label="Turma">${estado.turmas.map((t) => `<option value="${t.id}" ${String(t.id) === turmaAtual ? 'selected' : ''}>${esc(t.nome)}</option>`).join('')}</select>
        <input type="search" id="caro-busca" placeholder="Filtrar por nome" aria-label="Filtrar por nome" value="${esc(filtro)}">
      </div></div>
    ${podeEnviarFoto() ? `<p class="ajuda">Toque num estudante para enviar ou trocar a foto. No celular, dá para tirar a foto na hora.
      ${ehAdmin() ? ' Para enviar muitas fotos de uma vez ou o carômetro em PDF/JPG, use <a href="#/admin/carometro">Administração › Carômetro</a>.' : ''}</p>` : ''}
    <div id="caro-arquivos"></div>
    <div id="caro-grade"></div>`;
  try { arquivos = await api('/carometros'); } catch { arquivos = []; }
  // Abrir/baixar o carômetro em arquivo (ouvinte único; a lista é redesenhada ao trocar de turma).
  $('#caro-arquivos', el).addEventListener('click', async (ev) => {
    const b = ev.target.closest('[data-abrir], [data-baixar]');
    if (!b) return;
    const c = arquivos.find((x) => x.id === Number(b.dataset.abrir || b.dataset.baixar));
    const original = b.innerHTML;
    b.disabled = true;
    const progresso = (p) => { b.textContent = `Carregando… ${Math.round(p * 100)}%`; };
    try {
      if (b.dataset.abrir) await abrirCarometro(c, progresso);
      else await baixarArquivoCarometro(c, progresso);
    } catch (e) { avisarErro(e); }
    finally { b.disabled = false; b.innerHTML = original; }
  });
  if (!estado.turmas.length) {
    desenharArquivos(el);
    $('#caro-grade', el).innerHTML = '<div class="cartao vazio">Nenhuma turma cadastrada. A direção pode importar as listas da SED em Administração.</div>';
    return;
  }
  $('#caro-turma', el).addEventListener('change', (e) => { turmaAtual = e.target.value; desenhar(el); });
  // Um único ouvinte de clique para a grade (ela é redesenhada ao trocar de turma).
  if (podeEnviarFoto()) {
    $('#caro-grade', el).addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-aluno]');
      if (b) modalFoto(el, alunosAtuais.find((a) => a.id === Number(b.dataset.aluno)));
    });
  }
  $('#caro-busca', el).addEventListener('input', (e) => {
    filtro = e.target.value.toLowerCase();
    $$('.caro-card', el).forEach((c) => { c.hidden = filtro && !c.dataset.nome.includes(filtro); });
  });
  await desenhar(el);
}

function desenharArquivos(el) {
  const caixa = $('#caro-arquivos', el);
  const daqui = arquivos.filter((c) => !c.turma_id || String(c.turma_id) === turmaAtual);
  caixa.innerHTML = daqui.map((c) => `
    <div class="cartao caro-arquivo">
      <span class="caro-arquivo-ico">${icone(c.mime === 'application/pdf' ? 'documento' : 'camera')}</span>
      <div><b>Carômetro ${c.turma_id ? `da turma ${esc(c.turma_nome || '')}` : 'da escola'} (${c.mime === 'application/pdf' ? 'PDF' : 'imagem'})</b>
        <small>${esc(c.nome_arquivo)} · ${tamanhoLegivel(c.tamanho)} · enviado por ${esc(c.enviado_por_nome || '—')} em ${dataHoraBR(c.criado_em)}</small></div>
      <div class="linha-btn">
        <button type="button" class="btn btn-primario btn-peq" data-abrir="${c.id}">${icone('olho')}Abrir</button>
        <button type="button" class="btn btn-peq" data-baixar="${c.id}">${icone('baixar')}Baixar</button>
      </div>
    </div>`).join('');
}

async function desenhar(el) {
  desenharArquivos(el);
  const grade = $('#caro-grade', el);
  grade.innerHTML = '<p class="carregando">Carregando fotos…</p>';
  try {
    const { turma, alunos } = await api(`/turmas/${turmaAtual}/carometro`);
    const comFoto = alunos.filter((a) => a.foto).length;
    grade.innerHTML = alunos.length ? `
      <p class="contagem">${esc(turma.nome)} · ${alunos.length} estudante(s) · ${comFoto} com foto</p>
      <ul class="carometro">${alunos.map((a) => `
        <li class="caro-card" data-nome="${esc(a.nome.toLowerCase())}">
          <${podeEnviarFoto() ? 'button type="button"' : 'div'} class="caro-item" data-aluno="${a.id}" ${podeEnviarFoto() ? `aria-label="Foto de ${esc(a.nome)}"` : ''}>
            ${a.foto ? `<img src="${a.foto}" alt="Foto de ${esc(a.nome)}" loading="lazy">` : `<span class="caro-sem" aria-hidden="true">${esc(iniciais(a.nome))}</span>`}
            <span class="caro-nome">${esc(a.nome)}</span>
            ${a.ra ? `<span class="caro-ra">RA ${esc(a.ra)}</span>` : ''}
          </${podeEnviarFoto() ? 'button' : 'div'}></li>`).join('')}</ul>`
      : '<div class="cartao vazio">Esta turma ainda não tem estudantes.</div>';
    if (filtro) $$('.caro-card', el).forEach((c) => { c.hidden = !c.dataset.nome.includes(filtro); });
    alunosAtuais = alunos;
  } catch (e) { grade.innerHTML = ''; avisarErro(e); }
}

function modalFoto(el, aluno) {
  let novaFoto = null;
  const m = abrirModal(`Foto — ${aluno.nome}`, `
    <div class="foto-edicao">
      <div class="foto-previa" id="foto-previa">${aluno.foto ? `<img src="${aluno.foto}" alt="">` : `<span class="caro-sem">${esc(iniciais(aluno.nome))}</span>`}</div>
      <div>
        <label class="btn" for="foto-arquivo" data-icone="pessoa">Escolher ou tirar foto</label>
        <input type="file" id="foto-arquivo" accept="image/*" capture="user" class="visualmente-oculto">
        <p class="ajuda">A foto é recortada em retrato e reduzida antes do envio. Use apenas fotos autorizadas pela escola
          (uso restrito à identificação do estudante — ECA e LGPD).</p>
      </div>
    </div>
    <div class="acoes">
      <button class="btn btn-primario" id="foto-salvar" disabled>Salvar foto</button>
      ${aluno.foto ? '<button class="btn btn-perigo-claro" id="foto-remover">Remover foto</button>' : ''}
      <button class="btn" data-fechar>Cancelar</button>
    </div>`);
  $('#foto-arquivo', m).addEventListener('change', async (ev) => {
    const f = ev.target.files[0];
    if (!f) return;
    try {
      novaFoto = await reduzirFoto(f);
      $('#foto-previa', m).innerHTML = `<img src="${novaFoto}" alt="Prévia da nova foto">`;
      $('#foto-salvar', m).disabled = false;
    } catch (e) { avisarErro(e); }
  });
  $('#foto-salvar', m).addEventListener('click', (ev) => comCarregando(ev.currentTarget, async () => {
    try {
      await api(`/alunos/${aluno.id}/foto`, { metodo: 'PUT', corpo: { imagem: novaFoto } });
      fecharModal(); avisar('Foto salva.'); await desenhar(el);
    } catch (e) { avisarErro(e); }
  }));
  $('#foto-remover', m)?.addEventListener('click', async () => {
    if (!confirm(`Remover a foto de ${aluno.nome}?`)) return;
    try { await api(`/alunos/${aluno.id}/foto`, { metodo: 'DELETE' }); fecharModal(); avisar('Foto removida.'); await desenhar(el); }
    catch (e) { avisarErro(e); }
  });
}
