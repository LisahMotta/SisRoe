// telas/carometro.js — fotos dos estudantes por turma.
// Todos os servidores veem; a equipe gestora envia, troca ou remove fotos.
// A foto é reduzida no próprio aparelho (máx. 360 px, JPEG) antes de ir para o servidor.
import { api } from '../api.js';
import { $, $$, esc, avisar, avisarErro, abrirModal, fecharModal, comCarregando } from '../ui.js';
import { estado, ehGestao } from '../app.js';

let turmaAtual = '';
let filtro = '';
let alunosAtuais = [];

const iniciais = (n) => {
  const p = String(n).split(/\s+/).filter((x) => x.length > 2);
  return ((p[0]?.[0] || '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
};

/** Reduz a imagem para no máximo `lado` px e devolve um data URL JPEG. */
function reduzir(arquivo, lado = 360, qualidade = 0.82) {
  return new Promise((ok, falha) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => {
      // Recorte central em retrato 3:4, como foto de documento.
      const alvoProp = 3 / 4;
      let sw = img.naturalWidth, sh = img.naturalHeight, sx = 0, sy = 0;
      if (sw / sh > alvoProp) { const nw = sh * alvoProp; sx = (sw - nw) / 2; sw = nw; }
      else { const nh = sw / alvoProp; sy = (sh - nh) / 2; sh = nh; }
      const h = Math.min(lado / alvoProp, sh), w = h * alvoProp;
      const c = document.createElement('canvas');
      c.width = Math.round(w); c.height = Math.round(h);
      c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      ok(c.toDataURL('image/jpeg', qualidade));
    };
    img.onerror = () => { URL.revokeObjectURL(url); falha(new Error('Não foi possível ler esta imagem.')); };
    img.src = url;
  });
}

export async function render(el, [turmaParam]) {
  if (turmaParam) turmaAtual = turmaParam;
  if (!turmaAtual && estado.turmas.length) turmaAtual = String(estado.turmas[0].id);
  el.innerHTML = `
    <div class="cab-tela"><h1>Carômetro</h1>
      <div class="linha-btn">
        <select id="caro-turma" aria-label="Turma">${estado.turmas.map((t) => `<option value="${t.id}" ${String(t.id) === turmaAtual ? 'selected' : ''}>${esc(t.nome)}</option>`).join('')}</select>
        <input type="search" id="caro-busca" placeholder="Filtrar por nome" aria-label="Filtrar por nome" value="${esc(filtro)}">
      </div></div>
    ${ehGestao() ? '<p class="ajuda">Toque num estudante para enviar ou trocar a foto. No celular, dá para tirar a foto na hora.</p>' : ''}
    <div id="caro-grade"></div>`;
  if (!estado.turmas.length) {
    $('#caro-grade', el).innerHTML = '<div class="cartao vazio">Nenhuma turma cadastrada. A direção pode importar as listas da SED em Administração.</div>';
    return;
  }
  $('#caro-turma', el).addEventListener('change', (e) => { turmaAtual = e.target.value; desenhar(el); });
  // Um único ouvinte de clique para a grade (ela é redesenhada ao trocar de turma).
  if (ehGestao()) {
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

async function desenhar(el) {
  const grade = $('#caro-grade', el);
  grade.innerHTML = '<p class="carregando">Carregando fotos…</p>';
  try {
    const { turma, alunos } = await api(`/turmas/${turmaAtual}/carometro`);
    const comFoto = alunos.filter((a) => a.foto).length;
    grade.innerHTML = alunos.length ? `
      <p class="contagem">${esc(turma.nome)} · ${alunos.length} estudante(s) · ${comFoto} com foto</p>
      <ul class="carometro">${alunos.map((a) => `
        <li class="caro-card" data-nome="${esc(a.nome.toLowerCase())}">
          <${ehGestao() ? 'button type="button"' : 'div'} class="caro-item" data-aluno="${a.id}" ${ehGestao() ? `aria-label="Foto de ${esc(a.nome)}"` : ''}>
            ${a.foto ? `<img src="${a.foto}" alt="Foto de ${esc(a.nome)}" loading="lazy">` : `<span class="caro-sem" aria-hidden="true">${esc(iniciais(a.nome))}</span>`}
            <span class="caro-nome">${esc(a.nome)}</span>
            ${a.ra ? `<span class="caro-ra">RA ${esc(a.ra)}</span>` : ''}
          </${ehGestao() ? 'button' : 'div'}></li>`).join('')}</ul>`
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
      novaFoto = await reduzir(f);
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
