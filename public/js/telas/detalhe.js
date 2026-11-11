// telas/detalhe.js — ficha da ocorrência (pronta para imprimir),
// acompanhamento pela equipe gestora e notas.
import { api } from '../api.js';
import { $, $$, esc, dataBR, dataHoraBR, seloCategoria, seloGravidade, seloStatus, lerForm, avisar, avisarErro,
  comCarregando, abrirModal, fecharModal, hojeISO } from '../ui.js';
import { estado, ehGestao, ehAdmin } from '../app.js';
import { CATEGORIAS, GRAVIDADES, ORDEM_GRAVIDADE, PROCEDIMENTOS, PAPEIS_ALUNO, PERFIS } from '../catalogo.js';

export async function render(el, [id]) {
  const o = await api(`/ocorrencias/${Number(id)}`);
  const e = estado.escola;
  const passos = PROCEDIMENTOS[o.categoria] || [];
  const feitos = new Set(o.protocolo);
  const podeAcompanhar = ehGestao() && o.status !== 'cancelada';

  el.innerHTML = `
    <div class="cab-tela nao-imprimir">
      <a href="#/ocorrencias" class="btn-link">← Voltar</a>
      <div class="linha-btn">
        <button class="btn" id="btn-imprimir">🖨 Imprimir / PDF</button>
        ${ehAdmin() && o.status !== 'cancelada' ? '<button class="btn btn-perigo-claro" id="btn-cancelar">Cancelar registro</button>' : ''}
      </div>
    </div>

    ${o.status === 'cancelada' ? `<div class="alerta alerta-perigo">Registro <b>cancelado</b>. Motivo: ${esc(o.motivo_cancelamento)}</div>` : ''}

    <article class="documento cartao">
      <header class="doc-cab">
        <div>
          <div class="doc-escola">${esc(e.nome)}</div>
          <div class="doc-sub">${[e.cie && `CIE ${e.cie}`, e.municipio, e.diretoria].filter(Boolean).map(esc).join(' · ')}</div>
        </div>
        <div class="doc-num"><small>Ocorrência nº</small><b>${esc(o.numero)}</b></div>
      </header>
      <h1 class="doc-titulo">Registro de Ocorrência Escolar</h1>

      <div class="doc-selos">${seloCategoria(o.categoria)} ${seloGravidade(o.gravidade)} ${seloStatus(o.status)}</div>

      <dl class="doc-campos">
        <div><dt>Tipo</dt><dd>${esc(o.tipo_codigo)} · ${esc(o.tipo_descricao)}</dd></div>
        <div><dt>Data e horário</dt><dd>${dataBR(o.data)} às ${esc(o.hora)}</dd></div>
        <div><dt>Local</dt><dd>${esc(o.local)}</dd></div>
        <div><dt>Turma</dt><dd>${esc(o.turma_nome || '—')}</dd></div>
        <div><dt>Registrado por</dt><dd>${esc(o.registrado_por_nome)} <small>(${esc(PERFIS[o.registrado_por_perfil] || o.registrado_por_perfil)})</small></dd></div>
        <div><dt>Registrado em</dt><dd>${dataHoraBR(o.criado_em)}</dd></div>
      </dl>

      <h2>Estudantes envolvidos</h2>
      ${o.alunos.length ? `<table class="tabela"><thead><tr><th>Nome</th><th>RA</th><th>Turma</th><th>Papel</th></tr></thead><tbody>
        ${o.alunos.map((a) => `<tr><td>${ehGestao() && a.aluno_id ? `<a href="#/alunos/${a.aluno_id}">${esc(a.nome)}</a>` : esc(a.nome)}</td>
          <td>${esc(a.ra || '—')}</td><td>${esc(a.turma_nome || '—')}</td><td>${esc(PAPEIS_ALUNO[a.papel] || a.papel)}</td></tr>`).join('')}
        </tbody></table>` : '<p>Nenhum estudante identificado.</p>'}

      <h2>Relato dos fatos</h2>
      <p class="relato">${esc(o.relato)}</p>

      ${o.providencias ? `<h2>Providências</h2><p class="relato">${esc(o.providencias)}</p>` : ''}

      <h2>${o.categoria === 'administrativa' ? 'Intervenções' : 'Procedimentos — Protocolo 179 · CONVIVA SP'}</h2>
      <ul class="doc-checklist">${passos.map((p) => `<li class="${feitos.has(p.k) ? 'ok' : ''}">${feitos.has(p.k) ? '☑' : '☐'} ${esc(p.t)}</li>`).join('')}</ul>

      <dl class="doc-campos">
        <div><dt>Família comunicada</dt><dd>${o.familia_comunicada
          ? `Sim${o.familia_data ? ` em ${dataBR(o.familia_data)}` : ''}${o.familia_meio ? ` (${esc(o.familia_meio)})` : ''}` : 'Não'}
          ${o.familia_obs ? `<br><small>${esc(o.familia_obs)}</small>` : ''}</dd></div>
        <div><dt>Conselho Tutelar acionado</dt><dd>${o.conselho_tutelar ? 'Sim' : 'Não'}</dd></div>
        <div><dt>Registro na Plataforma CONVIVA</dt><dd>${o.conviva_registrado ? 'Sim' : 'Não'}</dd></div>
        <div><dt>Boletim de Ocorrência</dt><dd>${esc(o.bo_numero || '—')}</dd></div>
        ${o.status === 'encerrada' ? `<div><dt>Encerrada por</dt><dd>${esc(o.encerrado_por_nome || '')} em ${dataHoraBR(o.encerrado_em)}</dd></div>` : ''}
      </dl>

      ${o.notas.length ? `<h2>Acompanhamento</h2><ul class="notas">${o.notas.map((n) => `
        <li><div class="nota-cab"><b>${esc(n.usuario_nome)}</b> · ${dataHoraBR(n.criado_em)}</div><p>${esc(n.texto)}</p></li>`).join('')}</ul>` : ''}

      <div class="assinaturas">
        <div>${esc(o.registrado_por_nome)}<br><small>Responsável pelo registro</small></div>
        <div>&nbsp;<br><small>Ciência do(a) responsável pelo estudante</small></div>
        <div>&nbsp;<br><small>Direção / Equipe gestora</small></div>
      </div>
      <p class="doc-rodape">Documento gerado pelo SisRoe em ${dataHoraBR(new Date().toISOString())}. Arquivar na unidade escolar.
        Contém dados de estudantes: manuseio restrito (ECA e LGPD).</p>
    </article>

    <section class="cartao nao-imprimir">
      <h2>Acrescentar nota</h2>
      <p class="ajuda">O relato original não pode ser alterado. Use as notas para complementar, corrigir ou registrar novidades.</p>
      <form id="form-nota"><textarea name="texto" rows="3" maxlength="4000" required placeholder="Ex.: Conversa com a mãe realizada em 12/03; combinado acompanhamento semanal."></textarea>
        <button class="btn btn-primario" type="submit">Salvar nota</button></form>
    </section>

    ${podeAcompanhar ? formAcompanhamento(o, passos, feitos) : ''}`;

  $('#btn-imprimir', el).addEventListener('click', () => window.print());

  $('#form-nota', el).addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const texto = ev.target.texto.value.trim();
    if (!texto) return avisar('Escreva a nota.', 'erro');
    await comCarregando(ev.target.querySelector('button'), async () => {
      try {
        await api(`/ocorrencias/${o.id}/notas`, { metodo: 'POST', corpo: { texto } });
        avisar('Nota salva.');
        await render(el, [o.id]);
      } catch (err) { avisarErro(err); }
    });
  });

  $('#btn-cancelar', el)?.addEventListener('click', () => {
    const m = abrirModal('Cancelar registro', `
      <p>O registro não é apagado: fica marcado como cancelado, com o motivo, e sai das estatísticas.</p>
      <form id="form-cancelar"><label>Motivo * <textarea name="motivo" rows="3" required maxlength="500"
        placeholder="Ex.: registro duplicado da ocorrência 2026/0012"></textarea></label>
        <div class="acoes"><button class="btn btn-perigo" type="submit">Confirmar cancelamento</button>
        <button class="btn" type="button" data-fechar>Voltar</button></div></form>`);
    $('#form-cancelar', m).addEventListener('submit', async (ev) => {
      ev.preventDefault();
      try {
        await api(`/ocorrencias/${o.id}/cancelar`, { metodo: 'POST', corpo: { motivo: ev.target.motivo.value } });
        fecharModal();
        avisar('Registro cancelado.');
        await render(el, [o.id]);
      } catch (err) { avisarErro(err); }
    });
  });

  const fa = $('#form-acomp', el);
  if (fa) {
    const atualizarFamilia = () => { $('#familia-dados', el).hidden = !fa.familia_comunicada.checked; };
    fa.familia_comunicada.addEventListener('change', atualizarFamilia);
    atualizarFamilia();
    fa.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const d = lerForm(fa);
      const corpo = { ...d, protocolo: $$('input[name=prot]:checked', fa).map((c) => c.value) };
      delete corpo.prot;
      if (d.status === 'encerrada' && o.categoria !== 'administrativa' && !d.conviva_registrado) {
        if (!confirm('Esta ocorrência é do Protocolo 179 e não está marcada como registrada na Plataforma CONVIVA. Encerrar mesmo assim?')) return;
      }
      await comCarregando(fa.querySelector('[type=submit]'), async () => {
        try {
          await api(`/ocorrencias/${o.id}/acompanhamento`, { metodo: 'PUT', corpo });
          avisar('Acompanhamento salvo.');
          await render(el, [o.id]);
        } catch (err) { avisarErro(err); }
      });
    });
  }
}

function formAcompanhamento(o, passos, feitos) {
  const iAtual = ORDEM_GRAVIDADE.indexOf(o.gravidade);
  return `<section class="cartao nao-imprimir">
    <h2>Acompanhamento — equipe gestora</h2>
    <form id="form-acomp">
      <fieldset class="protocolo prot-${o.categoria}">
        <legend>${o.categoria === 'administrativa' ? 'Intervenções realizadas' : 'Procedimentos do Protocolo 179'}</legend>
        ${passos.map((p) => `<label class="check"><input type="checkbox" name="prot" value="${p.k}" ${feitos.has(p.k) ? 'checked' : ''}> ${esc(p.t)}</label>`).join('')}
      </fieldset>

      <fieldset>
        <legend>Família</legend>
        <label class="check"><input type="checkbox" name="familia_comunicada" ${o.familia_comunicada ? 'checked' : ''}> A família foi comunicada</label>
        <div id="familia-dados" class="grade-3">
          <label>Data <input type="date" name="familia_data" value="${esc(o.familia_data || hojeISO())}" max="${hojeISO()}"></label>
          <label>Meio
            <select name="familia_meio">${['', 'Telefone', 'WhatsApp', 'Bilhete / agenda', 'Reunião presencial', 'E-mail', 'Outro']
              .map((m) => `<option ${o.familia_meio === m ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
          <label>Observação <input name="familia_obs" maxlength="1000" value="${esc(o.familia_obs || '')}"></label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Rede de proteção e registros</legend>
        <label class="check"><input type="checkbox" name="conviva_registrado" ${o.conviva_registrado ? 'checked' : ''}> Registrada na Plataforma CONVIVA</label>
        <label class="check"><input type="checkbox" name="conselho_tutelar" ${o.conselho_tutelar ? 'checked' : ''}> Conselho Tutelar acionado</label>
        <label>Nº do Boletim de Ocorrência (se houver) <input name="bo_numero" maxlength="40" value="${esc(o.bo_numero || '')}"></label>
      </fieldset>

      <label>Providências
        <textarea name="providencias" rows="3" maxlength="4000">${esc(o.providencias || '')}</textarea></label>

      <div class="grade-2">
        <label>Gravidade <small>(só pode aumentar)</small>
          <select name="gravidade">${ORDEM_GRAVIDADE.map((g, i) => `<option value="${g}" ${i < iAtual ? 'disabled' : ''} ${g === o.gravidade ? 'selected' : ''}>${GRAVIDADES[g]}</option>`).join('')}</select></label>
        <label>Situação
          <select name="status">
            <option value="aberta" ${o.status === 'aberta' ? 'selected' : ''}>Aberta</option>
            <option value="em_acompanhamento" ${o.status === 'em_acompanhamento' ? 'selected' : ''}>Em acompanhamento</option>
            <option value="encerrada" ${o.status === 'encerrada' ? 'selected' : ''}>Encerrada</option>
          </select></label>
      </div>
      <div class="acoes"><button class="btn btn-primario" type="submit">Salvar acompanhamento</button></div>
      <p class="ajuda">Categoria: ${esc(CATEGORIAS[o.categoria].nome)}. Tudo o que é salvo aqui fica registrado na auditoria.</p>
    </form>
  </section>`;
}
