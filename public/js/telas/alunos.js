// telas/alunos.js — busca de aluno e histórico de ocorrências (equipe gestora).
import { api } from '../api.js';
import { $, esc, dataBR, dataHoraBR, seloCategoria, seloGravidade, seloStatus, avisar, avisarErro, imprimirAvulso, hojeISO, abrirModal, fecharModal, comCarregando, icone, aplicarIcones } from '../ui.js';
import { estado, ehGestao, ehDirecao, navegar } from '../app.js';
import { CATEGORIAS, PAPEIS_ALUNO, NIVEIS, RES68 } from '../catalogo.js';

export async function render(el, [id]) {
  if (!ehGestao()) {
    el.innerHTML = '<div class="cartao">O histórico de alunos é restrito à equipe gestora.</div>';
    return;
  }
  if (id) return historico(el, Number(id));

  let sinalizados = [];
  try { sinalizados = await api('/alunos-atencao'); } catch (e) { avisarErro(e); }
  const idsSinalizados = new Set(sinalizados.map((a) => a.id));
  el.innerHTML = `
    <h1>Alunos</h1>
    <section class="cartao atencao-lista">
      <h2>${icone('alerta')}Alunos com atenção especial (${sinalizados.length})</h2>
      <p class="ajuda">Estudantes que a equipe gestora sinalizou para acompanhamento mais próximo. Só POC, coordenação,
        vice e direção veem esta lista; ela não aparece para professores nem nos documentos impressos.</p>
      ${sinalizados.length ? `<ul class="atencao-itens">${sinalizados.map((a) => `
        <li class="atencao-item">
          <div class="atencao-desc"><b>${esc(a.nome)}</b>
            <small>${esc(a.turma_nome || 'Sem turma')}${a.ra ? ` · RA ${esc(a.ra)}` : ''} · ${a.qtd_ocorrencias} ocorrência(s)</small>
            ${a.atencao_motivo ? `<p><b>Motivo:</b> ${esc(a.atencao_motivo)}</p>` : ''}
            <small>Sinalizado por ${esc(a.atencao_por || '—')} em ${dataHoraBR(a.atencao_em)}</small></div>
          <div class="linha-btn">
            <a class="btn btn-peq" href="#/alunos/${a.id}" data-icone="lista">Ver histórico</a>
            <button class="btn btn-peq btn-perigo-claro" data-remover-atencao="${a.id}" data-nome="${esc(a.nome)}" data-icone="fechar">Remover</button>
          </div></li>`).join('')}</ul>` : '<p class="vazio">Nenhum aluno sinalizado. Use a busca abaixo e clique em "Sinalizar".</p>'}
    </section>
    <h2 class="titulo-secao">Buscar aluno</h2>
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
      ? lista.map((a) => `<li class="aluno-linha"><a href="#/alunos/${a.id}"><span class="desc">${esc(a.nome)}
          <small>${esc(a.turma_nome || 'Sem turma')}${a.ra ? ` · RA ${esc(a.ra)}` : ' · sem RA'}</small></span></a>
          ${idsSinalizados.has(a.id) ? `<span class="selo selo-atencao">${icone('alerta')}Atenção especial</span>`
            : `<button class="btn btn-peq" data-sinalizar="${a.id}" data-nome="${esc(a.nome)}" data-icone="alerta">Sinalizar</button>`}</li>`).join('')
      : '<li class="vazio">Nenhum aluno encontrado.</li>';
    aplicarIcones(res);
  };
  el.addEventListener('click', async (ev) => {
    const s = ev.target.closest('[data-sinalizar]');
    if (s) modalSinalizar(Number(s.dataset.sinalizar), s.dataset.nome, '', () => navegar('#/alunos'));
    const r = ev.target.closest('[data-remover-atencao]');
    if (r) removerSinalizacao(Number(r.dataset.removerAtencao), r.dataset.nome, () => navegar('#/alunos'));
  });
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
    <a href="#/alunos" class="btn-link" data-icone="voltar">Buscar outro aluno</a>
    <h1>${esc(aluno.nome)}</h1>
    <div class="cab-tela"><p>${esc(aluno.turma_nome || 'Sem turma')}${aluno.ra ? ` · RA ${esc(aluno.ra)}` : ' · <span class="selo">sem RA</span>'}
        ${aluno.incluido_por ? `<br><small class="ajuda">Incluído(a) na lista por ${esc(aluno.incluido_por)} em ${dataBR(aluno.incluido_em.slice(0, 10))}, durante um registro. Confira os dados quando atualizar a lista da SED.</small>` : ''}</p>
      <div class="linha-btn">
        ${aluno.atencao_em ? '' : '<button class="btn" id="btn-sinalizar" data-icone="alerta">Sinalizar para atenção especial</button>'}
        ${ehDirecao() && ocorrencias.length ? '<button class="btn" id="btn-relatorio" data-icone="documento">Rascunho do relatório circunstanciado</button>' : ''}</div></div>
    ${aluno.atencao_em ? `<div class="alerta alerta-atencao"><span>${icone('alerta')}<span><b>Atenção especial.</b>
        ${aluno.atencao_motivo ? `Motivo: ${esc(aluno.atencao_motivo.replace(/[.\s]+$/, ''))}.` : ''}
        <small>Sinalizado por ${esc(aluno.atencao_por || '—')} em ${dataHoraBR(aluno.atencao_em)}.</small></span></span>
        <span class="linha-btn"><button class="btn btn-peq" id="btn-editar-atencao">Editar motivo</button>
        <button class="btn btn-peq btn-perigo-claro" id="btn-remover-atencao">Remover sinalização</button></span></div>` : ''}
    <div class="numeros">
      <div class="numero"><span>${ocorrencias.length}</span>ocorrências</div>
      ${porCat.map(([c, n]) => `<div class="numero cat-borda-${c}"><span>${n}</span>${esc(CATEGORIAS[c].nome)}</div>`).join('')}
    </div>
    ${ocorrencias.length >= 3 ? '<div class="alerta alerta-info" data-icone="info"><span><b>Reincidência:</b> avalie conversa com a família, plano de acompanhamento e encaminhamentos.</span></div>' : ''}
    <section class="cartao">
      ${ocorrencias.length ? `<ul class="lista-simples">${ocorrencias.map((o) => `
        <li><a href="#/ocorrencia/${o.id}"><span class="num">${esc(o.numero)}</span>
          <span class="desc">${esc(o.tipo_codigo)} · ${esc(o.tipo_descricao)}
            <small>${dataBR(o.data)} ${esc(o.hora)} · ${esc(PAPEIS_ALUNO[o.papel] || o.papel)}</small></span>
          ${seloCategoria(o.categoria)} ${seloGravidade(o.gravidade)} ${seloStatus(o.status)}</a></li>`).join('')}</ul>`
        : '<p class="vazio">Nenhuma ocorrência registrada para este aluno.</p>'}
    </section>`;
  $('#btn-relatorio', el)?.addEventListener('click', () => api(`/alunos/${id}/relatorio`).then(relatorio).catch(avisarErro));
  const recarregar = () => historico(el, id).then(() => aplicarIcones(el));
  $('#btn-sinalizar', el)?.addEventListener('click', () => modalSinalizar(id, aluno.nome, '', recarregar));
  $('#btn-editar-atencao', el)?.addEventListener('click', () => modalSinalizar(id, aluno.nome, aluno.atencao_motivo || '', recarregar));
  $('#btn-remover-atencao', el)?.addEventListener('click', () => removerSinalizacao(id, aluno.nome, recarregar));
}

/**
 * Rascunho do relatório circunstanciado (Art. 15 da Res. SEDUC nº 68/2026), montado
 * com o que já está registrado. Os itens de análise e justificativa ficam em branco
 * para a Direção redigir.
 */
function relatorio({ aluno, ocorrencias, afastamentos }) {
  const e = estado.escola;
  const passosDe = (o) => (o.passos || []).filter((p) => o.protocolo.includes(p.k))
    .map((p) => (/^[a-z]$/.test(p.k) ? `${p.k}) ${p.t}` : p.t));
  const linhas = (n) => '<div class="linhas-branco">' + '<span></span>'.repeat(n) + '</div>';
  const lista = (itens, vazio) => itens.length ? `<ul>${itens.join('')}</ul>` : `<p><i>${vazio}</i></p>`;

  const fatos = ocorrencias.map((o) => `<li><b>${dataBR(o.data)} ${esc(o.hora)} — ${esc(o.numero)} · ${esc(o.tipo_descricao)}</b>
    (${esc(PAPEIS_ALUNO[o.papel] || o.papel)}${o.nivel ? `, ${esc(NIVEIS[o.nivel].nome)}` : ''})<br>${esc(o.relato)}</li>`);
  const conviva = ocorrencias.filter((o) => o.conviva_registrado).map((o) => `<li>${esc(o.numero)} (${dataBR(o.data)})</li>`)
    .concat(afastamentos.filter((a) => a.conviva_registrado).map((a) => `<li>Afastamento iniciado em ${dataBR(a.data_inicio)}</li>`));
  const medidas = ocorrencias.filter((o) => passosDe(o).length).map((o) => `<li>${esc(o.numero)}: ${passosDe(o).map(esc).join('; ')}</li>`)
    .concat(afastamentos.map((a) => `<li>Afastamento preventivo temporário: ${dataBR(a.data_inicio)}, ${a.dias_letivos} dia(s)
      ${a.prorrogado ? `+ ${a.prorrogacao_dias} (prorrogação)` : ''}. Hipóteses: ${a.hipoteses.join(', ')}. Plano de estudos: ${esc(a.plano_estudos)}</li>`));
  const familia = ocorrencias.filter((o) => o.familia_comunicada || o.bo_orientado).map((o) => `<li>${esc(o.numero)}: ${o.familia_data ? dataBR(o.familia_data) : 'data não informada'}
    ${o.familia_meio ? `(${esc(o.familia_meio)})` : ''}${o.familia_obs ? ` — ${esc(o.familia_obs)}` : ''}${o.bo_orientado ? ' — orientada sobre registro de B.O.' : ''}</li>`)
    .concat(afastamentos.filter((a) => a.familia_comunicada_em).map((a) => `<li>Comunicação formal do afastamento em ${dataBR(a.familia_comunicada_em)}</li>`));
  const notas = ocorrencias.flatMap((o) => o.notas.map((n) => `<li>${dataHoraBR(n.criado_em)} — ${esc(n.usuario_nome)} (${esc(o.numero)}): ${esc(n.texto)}</li>`));
  const rede = ocorrencias.filter((o) => o.conselho_tutelar || o.protocolo.includes('rede') || o.protocolo.includes('conselho'))
    .map((o) => `<li>${esc(o.numero)}: ${o.conselho_tutelar ? 'Conselho Tutelar acionado' : 'articulação com a rede protetiva'}${o.rede_devolutiva ? ` — devolutiva: ${esc(o.rede_devolutiva)}` : ''}</li>`)
    .concat(afastamentos.filter((a) => a.rede_protetiva).map((a) => `<li>Afastamento: ${esc(a.rede_protetiva)}</li>`));
  const ultimaAnalise = [...ocorrencias].reverse().find((o) => o.analise_inicial);

  imprimirAvulso(`
    <p class="marca-rascunho">RASCUNHO — revisar antes de assinar</p>
    <header class="doc-cab"><div><div class="doc-escola">${esc(e.nome)}</div>
      <div class="doc-sub">${[e.cie && `CIE ${e.cie}`, e.municipio, e.diretoria].filter(Boolean).map(esc).join(' · ')}</div></div>
      <div class="doc-num"><small>Data</small><b>${dataBR(hojeISO())}</b></div></header>
    <h1 class="doc-titulo">Relatório circunstanciado</h1>
    <p class="centro"><small>Art. 15 da ${RES68}. Documento reservado. Evitar juízos morais, expressões estigmatizantes,
      exposição da vida privada e informações não verificadas (§ 1º).</small></p>

    <h2>I — Unidade escolar e equipe responsável</h2>
    <p>${esc(e.nome)}${e.cie ? `, CIE ${esc(e.cie)}` : ''}. Equipe responsável pela elaboração:</p>${linhas(2)}
    <h2>II — Identificação do estudante</h2>
    <p>${esc(aluno.nome)}${aluno.ra ? ` · RA ${esc(aluno.ra)}` : ''} · ${esc(aluno.turma_nome || 'sem turma')}</p>
    <h2>III — Descrição objetiva e cronológica dos fatos</h2>${lista(fatos, 'Sem registros.')}
    <h2>IV — Análise da situação atual de risco</h2>
    ${ultimaAnalise ? `<p><small>Última análise registrada (${esc(ultimaAnalise.numero)}):</small> ${esc(ultimaAnalise.analise_inicial)}</p>` : ''}${linhas(4)}
    <h2>V — Registros na Plataforma CONVIVA</h2>${lista(conviva, 'Nenhum registro marcado como feito no SisRoe.')}
    <h2>VI — Medidas pedagógicas, restaurativas, mediadoras, protetivas e protocolares adotadas</h2>${lista(medidas, 'Nenhuma medida marcada.')}
    <h2>VII — Comunicações à família ou responsáveis</h2>${lista(familia, 'Nenhuma comunicação registrada.')}
    <h2>VIII — Reuniões, orientações, pactuações e planos de acompanhamento</h2>${lista(notas, 'Nenhuma nota de acompanhamento.')}
    <h2>IX — Encaminhamentos à rede protetiva ou órgãos competentes</h2>${lista(rede, 'Nenhum encaminhamento registrado.')}
    <h2>X — Justificativa técnica para eventual transferência cautelar</h2>${linhas(5)}
    <h2>XI — Proposta preliminar de continuidade do acompanhamento pedagógico e protetivo</h2>${linhas(4)}
    <h2>XII — Matrícula decorrente de decisão judicial</h2><p>( ) Não &nbsp;&nbsp; ( ) Sim — anexar cópia da ordem ou documentos disponíveis.</p>
    <p><small>O relatório deve demonstrar o cumprimento das ações do Protocolo 179 e o esgotamento ou a insuficiência das estratégias
      anteriores (§ 3º). Imagens, vídeos e mensagens só podem ser juntados observando sigilo e proteção de dados (§ 2º).</small></p>
    <div class="assinaturas assinaturas-2"><div>&nbsp;<br><small>Direção da unidade escolar</small></div>
      <div>&nbsp;<br><small>Equipe responsável</small></div></div>`);
}

/** Janela para sinalizar (ou editar o motivo de) um aluno com atenção especial. */
function modalSinalizar(id, nome, motivoAtual, depois) {
  const m = abrirModal(`Atenção especial — ${nome}`, `
    <p>O aluno passa a aparecer na lista <b>Alunos com atenção especial</b> e com um aviso nas ocorrências.
      Só a equipe gestora vê essa sinalização.</p>
    <label>Motivo <small>(opcional)</small>
      <textarea id="atencao-motivo" rows="3" maxlength="500" placeholder="Ex.: reincidência em agressões; acompanhamento com a família; encaminhado ao CAPS.">${esc(motivoAtual)}</textarea></label>
    <p class="ajuda">Descreva fatos e o acompanhamento necessário, sem rótulos sobre o estudante.</p>
    <div class="acoes"><button class="btn btn-primario" id="atencao-salvar" data-icone="alerta">${motivoAtual ? 'Salvar' : 'Sinalizar'}</button>
      <button class="btn" data-fechar>Cancelar</button></div>`);
  $('#atencao-motivo', m).focus();
  $('#atencao-salvar', m).addEventListener('click', (ev) => comCarregando(ev.currentTarget, async () => {
    try {
      await api(`/alunos/${id}/atencao`, { metodo: 'PUT', corpo: { motivo: $('#atencao-motivo', m).value } });
      fecharModal();
      avisar(`${nome} sinalizado(a) para atenção especial.`);
      await depois();
    } catch (e) { avisarErro(e); }
  }));
}

async function removerSinalizacao(id, nome, depois) {
  if (!confirm(`Remover a sinalização de atenção especial de ${nome}?`)) return;
  try {
    await api(`/alunos/${id}/atencao`, { metodo: 'DELETE' });
    avisar(`Sinalização de ${nome} removida.`);
    await depois();
  } catch (e) { avisarErro(e); }
}
