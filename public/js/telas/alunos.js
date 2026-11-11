// telas/alunos.js — busca de aluno e histórico de ocorrências (equipe gestora).
import { api } from '../api.js';
import { $, esc, dataBR, dataHoraBR, seloCategoria, seloGravidade, seloStatus, avisarErro, imprimirAvulso, hojeISO } from '../ui.js';
import { estado, ehGestao, ehAdmin } from '../app.js';
import { CATEGORIAS, PAPEIS_ALUNO, PROCEDIMENTOS, NIVEIS, RES68 } from '../catalogo.js';

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
    <div class="cab-tela"><p>${esc(aluno.turma_nome || 'Sem turma')}${aluno.ra ? ` · RA ${esc(aluno.ra)}` : ''}</p>
      ${ehAdmin() && ocorrencias.length ? '<button class="btn" id="btn-relatorio">📄 Rascunho do relatório circunstanciado</button>' : ''}</div>
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
  $('#btn-relatorio', el)?.addEventListener('click', () => api(`/alunos/${id}/relatorio`).then(relatorio).catch(avisarErro));
}

/**
 * Rascunho do relatório circunstanciado (Art. 15 da Res. SEDUC nº 68/2026), montado
 * com o que já está registrado. Os itens de análise e justificativa ficam em branco
 * para a Direção redigir.
 */
function relatorio({ aluno, ocorrencias, afastamentos }) {
  const e = estado.escola;
  const passosDe = (o) => (PROCEDIMENTOS[o.categoria] || []).filter((p) => o.protocolo.includes(p.k)).map((p) => p.t);
  const linhas = (n) => '<div class="linhas-branco">' + '<span></span>'.repeat(n) + '</div>';
  const lista = (itens, vazio) => itens.length ? `<ul>${itens.join('')}</ul>` : `<p><i>${vazio}</i></p>`;

  const fatos = ocorrencias.map((o) => `<li><b>${dataBR(o.data)} ${esc(o.hora)} — ${esc(o.numero)} · ${esc(o.tipo_descricao)}</b>
    (${esc(PAPEIS_ALUNO[o.papel] || o.papel)}${o.nivel ? `, ${esc(NIVEIS[o.nivel].nome)}` : ''})<br>${esc(o.relato)}</li>`);
  const conviva = ocorrencias.filter((o) => o.conviva_registrado).map((o) => `<li>${esc(o.numero)} (${dataBR(o.data)})</li>`)
    .concat(afastamentos.filter((a) => a.conviva_registrado).map((a) => `<li>Afastamento iniciado em ${dataBR(a.data_inicio)}</li>`));
  const medidas = ocorrencias.filter((o) => passosDe(o).length).map((o) => `<li>${esc(o.numero)}: ${passosDe(o).map(esc).join('; ')}</li>`)
    .concat(afastamentos.map((a) => `<li>Afastamento preventivo temporário: ${dataBR(a.data_inicio)}, ${a.dias_letivos} dia(s)
      ${a.prorrogado ? `+ ${a.prorrogacao_dias} (prorrogação)` : ''}. Hipóteses: ${a.hipoteses.join(', ')}. Plano de estudos: ${esc(a.plano_estudos)}</li>`));
  const familia = ocorrencias.filter((o) => o.familia_comunicada).map((o) => `<li>${esc(o.numero)}: ${o.familia_data ? dataBR(o.familia_data) : 'data não informada'}
    ${o.familia_meio ? `(${esc(o.familia_meio)})` : ''}${o.familia_obs ? ` — ${esc(o.familia_obs)}` : ''}</li>`)
    .concat(afastamentos.filter((a) => a.familia_comunicada_em).map((a) => `<li>Comunicação formal do afastamento em ${dataBR(a.familia_comunicada_em)}</li>`));
  const notas = ocorrencias.flatMap((o) => o.notas.map((n) => `<li>${dataHoraBR(n.criado_em)} — ${esc(n.usuario_nome)} (${esc(o.numero)}): ${esc(n.texto)}</li>`));
  const rede = ocorrencias.filter((o) => o.conselho_tutelar || o.protocolo.includes('rede') || o.protocolo.includes('conselho'))
    .map((o) => `<li>${esc(o.numero)}: ${o.conselho_tutelar ? 'Conselho Tutelar acionado' : 'articulação com a rede protetiva'}</li>`)
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
