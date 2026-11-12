// telas/detalhe.js — ficha da ocorrência (pronta para imprimir),
// acompanhamento pela equipe gestora, notas e afastamento preventivo
// temporário (Cap. IV da Res. SEDUC nº 68/2026).
import { api, baixar } from '../api.js';
import { montarChat } from '../chat.js';
import { fecharPopupsDa } from '../notificacoes.js';
import { $, $$, esc, dataBR, dataHoraBR, seloCategoria, seloGravidade, seloStatus, lerForm, avisar, avisarErro,
  comCarregando, abrirModal, fecharModal, hojeISO, imprimirAvulso } from '../ui.js';
import { estado, ehGestao, ehAdmin } from '../app.js';
import { CATEGORIAS, GRAVIDADES, ORDEM_GRAVIDADE, PAPEIS_ALUNO, PERFIS, NIVEIS, RES68,
  HIPOTESES_AFASTAMENTO, AFASTAMENTO_MAX_DIAS } from '../catalogo.js';
import { htmlPassos, htmlPassosDoc, htmlRegraBO, nomeMacro } from '../passos.js';

export async function render(el, [id]) {
  const o = await api(`/ocorrencias/${Number(id)}`);
  const e = estado.escola;
  const passos = o.passos || [];
  const feitos = new Set(o.protocolo);
  const podeAcompanhar = ehGestao() && o.status !== 'cancelada';
  const reincidente = o.alunos.some((a) => a.anteriores >= 2);
  // Acabou de registrar (vindo da tela de nova ocorrência): mostra o aviso e foca o chat.
  const recemCriada = sessionStorage.getItem('sisroe_recem') === String(o.id);
  try { sessionStorage.removeItem('sisroe_recem'); } catch { /* sem armazenamento */ }

  el.innerHTML = `
    <div class="cab-tela nao-imprimir">
      <a href="#/ocorrencias" class="btn-link" data-icone="voltar">Voltar às ocorrências</a>
      <div class="linha-btn">
        <button class="btn btn-primario" id="btn-pdf" data-icone="documento">Baixar PDF</button>
        <button class="btn" id="btn-imprimir" data-icone="imprimir">Imprimir</button>
        ${ehAdmin() && o.status !== 'cancelada' ? '<button class="btn btn-perigo-claro" id="btn-cancelar" data-icone="lixeira">Cancelar registro</button>' : ''}
      </div>
    </div>

    ${o.status === 'cancelada' ? `<div class="alerta alerta-perigo" data-icone="alerta"><span>Registro <b>cancelado</b>. Motivo: ${esc(o.motivo_cancelamento)}</span></div>` : ''}
    ${ehGestao() && reincidente ? `<div class="alerta alerta-info nao-imprimir" data-icone="info"><span>Há estudante com 2 ou mais ocorrências anteriores.
      Considere o histórico na classificação do nível de resposta (Art. 5º, § 1º, ${RES68}).</span></div>` : ''}
    ${recemCriada ? `<div class="alerta alerta-info nao-imprimir" data-icone="ok"><span><b>Ocorrência registrada.</b> A equipe gestora foi avisada.
      Use a conversa abaixo para combinar as providências.</span></div>` : ''}
    <div id="chat-caixa"></div>

    <article class="documento cartao">
      <header class="doc-cab">
        <div>
          <div class="doc-escola">${esc(e.nome)}</div>
          <div class="doc-sub">${[e.cie && `CIE ${e.cie}`, e.municipio, e.diretoria].filter(Boolean).map(esc).join(' · ')}</div>
        </div>
        <div class="doc-num"><small>Ocorrência nº</small><b>${esc(o.numero)}</b></div>
      </header>
      <h1 class="doc-titulo">Registro de Ocorrência Escolar</h1>

      <div class="doc-selos">${seloCategoria(o.categoria)} ${seloGravidade(o.gravidade)} ${seloStatus(o.status)}
        ${o.nivel ? `<span class="selo nivel-${o.nivel}">${esc(NIVEIS[o.nivel].nome)}</span>` : ''}</div>

      <dl class="doc-campos">
        <div><dt>Tipo</dt><dd>${esc(o.tipo_codigo)} · ${esc(o.tipo_descricao)}</dd></div>
        ${o.macro ? `<div><dt>Macrocategoria (Protocolo 179)</dt><dd>${esc(nomeMacro(o.macro))}</dd></div>` : ''}
        <div><dt>Data e horário do fato</dt><dd>${dataBR(o.data)} às ${esc(o.hora)}</dd></div>
        ${o.data_conhecimento ? `<div><dt>Escola tomou conhecimento em</dt><dd>${dataBR(o.data_conhecimento)}</dd></div>` : ''}
        <div><dt>Local</dt><dd>${esc(o.local)}</dd></div>
        <div><dt>Turma</dt><dd>${esc(o.turma_nome || '—')}</dd></div>
        <div><dt>Registrado por</dt><dd>${esc(o.registrado_por_nome)} <small>(${esc(PERFIS[o.registrado_por_perfil] || o.registrado_por_perfil)})</small></dd></div>
        <div><dt>Registrado em</dt><dd>${dataHoraBR(o.criado_em)}</dd></div>
        ${o.nivel ? `<div><dt>Nível de resposta (Art. 5º, ${RES68})</dt><dd>${esc(NIVEIS[o.nivel].nome)}</dd></div>` : ''}
      </dl>

      <h2>Estudantes envolvidos</h2>
      ${o.alunos.length ? `<table class="tabela"><thead><tr><th>Nome</th><th>RA</th><th>Turma</th><th>Papel</th>
          ${ehGestao() ? '<th class="nao-imprimir">Ocorr. anteriores</th>' : ''}</tr></thead><tbody>
        ${o.alunos.map((a) => `<tr><td>${ehGestao() && a.aluno_id ? `<a href="#/alunos/${a.aluno_id}">${esc(a.nome)}</a>` : esc(a.nome)}</td>
          <td>${esc(a.ra || '—')}</td><td>${esc(a.turma_nome || '—')}</td><td>${esc(PAPEIS_ALUNO[a.papel] || a.papel)}</td>
          ${ehGestao() ? `<td class="nao-imprimir">${a.anteriores ?? '—'}</td>` : ''}</tr>`).join('')}
        </tbody></table>` : '<p>Nenhum estudante identificado.</p>'}

      <h2>Relato dos fatos</h2>
      <p class="relato">${esc(o.relato)}</p>

      ${o.analise_inicial ? `<h2>Síntese da análise inicial</h2><p class="relato">${esc(o.analise_inicial)}</p>` : ''}
      ${o.manifestacao_estudante ? `<h2>Manifestação do(a) estudante</h2><p class="relato">${esc(o.manifestacao_estudante)}</p>` : ''}
      ${o.providencias ? `<h2>Providências</h2><p class="relato">${esc(o.providencias)}</p>` : ''}

      <h2>${tituloPassos(o)}</h2>
      ${htmlPassosDoc(passos, feitos)}

      <dl class="doc-campos">
        <div><dt>Família comunicada</dt><dd>${o.familia_comunicada
          ? `Sim${o.familia_data ? ` em ${dataBR(o.familia_data)}` : ''}${o.familia_meio ? ` (${esc(o.familia_meio)})` : ''}` : 'Não'}
          ${o.familia_obs ? `<br><small>${esc(o.familia_obs)}</small>` : ''}</dd></div>
        <div><dt>Conselho Tutelar acionado</dt><dd>${o.conselho_tutelar ? 'Sim' : 'Não'}</dd></div>
        <div><dt>Registro na Plataforma CONVIVA</dt><dd>${o.conviva_registrado ? 'Sim' : 'Não'}</dd></div>
        <div><dt>Boletim de Ocorrência</dt><dd>${esc(o.bo_numero || '—')}${o.bo_orientado ? '<br><small>Família orientada sobre o direito de registrar B.O.</small>' : ''}</dd></div>
        ${o.rede_devolutiva ? `<div><dt>Devolutiva da rede protetiva</dt><dd>${esc(o.rede_devolutiva)}</dd></div>` : ''}
        ${o.status === 'encerrada' ? `<div><dt>Encerrada por</dt><dd>${esc(o.encerrado_por_nome || '')} em ${dataHoraBR(o.encerrado_em)}</dd></div>` : ''}
      </dl>

      ${o.afastamentos.length ? `<h2>Afastamento preventivo temporário (Cap. IV, ${RES68})</h2>
        ${o.afastamentos.map((a) => `<p><b>${esc(a.aluno_nome)}</b>: a partir de ${dataBR(a.data_inicio)}, ${a.dias_letivos} dia(s) letivo(s)
          ${a.prorrogado ? `+ prorrogação de ${a.prorrogacao_dias} dia(s) (Conselho de Escola em ${dataBR(a.prorrogacao_conselho_data)})` : ''}
          — ${a.status === 'vigente' ? 'vigente' : 'encerrado'}.</p>`).join('')}` : ''}

      ${o.notas.length ? `<h2>Acompanhamento</h2><ul class="notas">${o.notas.map((n) => `
        <li><div class="nota-cab"><b>${esc(n.usuario_nome)}</b> · ${dataHoraBR(n.criado_em)}</div><p>${esc(n.texto)}</p></li>`).join('')}</ul>` : ''}

      <div class="assinaturas">
        <div>${esc(o.registrado_por_nome)}<br><small>Responsável pelo registro</small></div>
        <div>&nbsp;<br><small>Ciência do(a) responsável pelo estudante</small></div>
        <div>&nbsp;<br><small>Direção / Equipe gestora</small></div>
      </div>
      <p class="doc-rodape">Documento gerado pelo SisRoe em ${dataHoraBR(new Date().toISOString())}. Arquivar na unidade escolar, em caráter reservado.
        Contém dados de estudantes: manuseio restrito (ECA, LGPD e Art. 9º, § 2º da ${RES68}).</p>
    </article>

    <section class="cartao nao-imprimir">
      <h2>Acrescentar nota</h2>
      <p class="ajuda">O relato original não pode ser alterado. Use as notas para complementar, corrigir ou registrar novidades.</p>
      <form id="form-nota"><textarea name="texto" rows="3" maxlength="4000" required placeholder="Ex.: Conversa com a mãe realizada em 12/03; combinado acompanhamento semanal."></textarea>
        <button class="btn btn-primario" type="submit" data-icone="enviar">Salvar nota</button></form>
    </section>

    ${podeAcompanhar ? formAcompanhamento(o, passos, feitos) : ''}
    ${ehGestao() ? secaoAfastamentos(o) : ''}`;

  $('#btn-imprimir', el).addEventListener('click', () => window.print());
  $('#btn-pdf', el).addEventListener('click', (ev) => comCarregando(ev.currentTarget, () =>
    baixar(`/ocorrencias/${o.id}/pdf`, `ocorrencia-${o.numero.replace('/', '-')}.pdf`).catch(avisarErro)));
  montarChat($('#chat-caixa', el), o, { aberto: recemCriada });
  fecharPopupsDa(o.id);
  const recarregar = () => render(el, [o.id]);

  $('#form-nota', el).addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const texto = ev.target.texto.value.trim();
    if (!texto) return avisar('Escreva a nota.', 'erro');
    await comCarregando(ev.target.querySelector('button'), async () => {
      try {
        await api(`/ocorrencias/${o.id}/notas`, { metodo: 'POST', corpo: { texto } });
        avisar('Nota salva.');
        await recarregar();
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
        await recarregar();
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
      const nivelEl = $('input[name=nivel]:checked', fa);
      const corpo = { ...d, nivel: nivelEl ? nivelEl.value : '', protocolo: $$('input[name=prot]:checked', fa).map((c) => c.value) };
      delete corpo.prot;
      const pendentes = passos.length - corpo.protocolo.length;
      if (d.status === 'encerrada' && o.status !== 'encerrada' && pendentes > 0) {
        if (!confirm(`Há ${pendentes} passo(s) não marcado(s). O Protocolo 179 orienta encerrar só depois de concluídas todas as providências. Encerrar mesmo assim?`)) return;
      }
      if (d.status === 'encerrada' && !d.conviva_registrado) {
        if (!confirm('A ocorrência não está marcada como registrada na Plataforma CONVIVA (o Protocolo 179 pede o registro de todas as situações de convivência, inclusive indisciplina). Encerrar mesmo assim?')) return;
      }
      await comCarregando(fa.querySelector('[type=submit]'), async () => {
        try {
          await api(`/ocorrencias/${o.id}/acompanhamento`, { metodo: 'PUT', corpo });
          avisar('Acompanhamento salvo.');
          await recarregar();
        } catch (err) { avisarErro(err); }
      });
    });
  }

  ligarAfastamentos(el, o, recarregar);
}

function tituloPassos(o) {
  const proprios = o.passos?.some((p) => /^[a-z]$/.test(p.k));
  return proprios ? `Procedimentos — Protocolo 179 (3ª versão), ${o.tipo_codigo}` : `Intervenções pedagógicas (Art. 7º, ${RES68})`;
}

function formAcompanhamento(o, passos, feitos) {
  const iAtual = ORDEM_GRAVIDADE.indexOf(o.gravidade);
  return `<section class="cartao nao-imprimir">
    <h2>Acompanhamento — equipe gestora</h2>
    <form id="form-acomp">
      <fieldset>
        <legend>Análise inicial e classificação (${RES68})</legend>
        <label>Síntese da análise inicial
          <textarea name="analise_inicial" rows="3" maxlength="4000"
            placeholder="O que se compreendeu da situação: contexto, causas, riscos identificados, histórico.">${esc(o.analise_inicial || '')}</textarea>
          <small>Art. 9º, § 1º: o registro contém a síntese da análise inicial. Use elementos objetivos, sem juízos morais.</small>
        </label>
        <label>Manifestação do(a) estudante
          <textarea name="manifestacao_estudante" rows="3" maxlength="4000"
            placeholder="A versão dos fatos apresentada pelo(a) estudante, em ambiente adequado.">${esc(o.manifestacao_estudante || '')}</textarea>
          <small>Art. 3º, V: direito de apresentar sua versão e ter a opinião considerada.</small>
        </label>
        <p class="rotulo">Nível de resposta (Art. 5º)</p>
        <div class="niveis">
          ${Object.entries(NIVEIS).map(([n, v]) => `<label class="check nivel-opcao"><input type="radio" name="nivel" value="${n}"
            ${Number(o.nivel) === Number(n) ? 'checked' : ''}> <span><b>${esc(v.nome)}</b> — ${esc(v.desc)}</span></label>`).join('')}
        </div>
        <small>Considere a natureza da ocorrência, a faixa etária, o contexto, o histórico e as intervenções já adotadas (§ 1º).</small>
      </fieldset>

      <fieldset class="protocolo prot-${o.categoria}">
        <legend>${tituloPassos(o)}</legend>
        ${htmlPassos(passos, feitos)}
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
        <label>Devolutiva recebida do Conselho Tutelar / rede protetiva
          <textarea name="rede_devolutiva" rows="2" maxlength="2000" placeholder="O que o serviço acionado respondeu, e quando.">${esc(o.rede_devolutiva || '')}</textarea>
          <small>Protocolo 179, seção 1.2: o registro só é encerrado com a evidência da comunicação e a devolutiva do serviço acionado.</small></label>
        ${htmlRegraBO(o.bo_regra)}
        <label class="check"><input type="checkbox" name="bo_orientado" ${o.bo_orientado ? 'checked' : ''}> A família/vítima foi orientada sobre a possibilidade de registrar B.O.</label>
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

// ─── Afastamento preventivo temporário ───────────────────────────────────────
function pendencias(a) {
  const p = [];
  if (!a.familia_comunicada_em) p.push('comunicação formal à família (Art. 12, I)');
  if (!a.ure_comunicada_em) p.push('comunicação à URE (Art. 12, II)');
  if (!a.conviva_registrado) p.push('registro na Plataforma CONVIVA (Art. 12, § 2º)');
  return p;
}

function secaoAfastamentos(o) {
  const podeCriar = ehAdmin() && o.status !== 'cancelada' && o.alunos.length;
  return `<section class="cartao nao-imprimir" id="sec-afastamentos">
    <div class="cab-tela"><h2>Afastamento preventivo temporário <small>Cap. IV, ${RES68}</small></h2>
      ${podeCriar && Number(o.nivel) === 3 ? '<button class="btn btn-perigo-claro" id="btn-afastar">Registrar afastamento</button>' : ''}</div>
    <p class="ajuda">Medida cautelar, excepcional e protetiva, decidida pela Direção pelo menor tempo necessário. <b>Não é punição</b>
      (Art. 11, § 2º) e não pode prejudicar frequência, avaliação ou vínculo escolar (§ 4º).</p>
    ${Number(o.nivel) !== 3 && podeCriar ? `<p class="ajuda">Só pode ser avaliada em situação classificada no <b>Nível III</b> (Art. 5º, III).
      Classifique a ocorrência no acompanhamento acima, com a análise inicial registrada.</p>` : ''}
    ${o.afastamentos.map((a) => {
      const pend = pendencias(a);
      const vigente = a.status === 'vigente';
      return `<div class="afastamento ${vigente ? 'vigente' : ''}" data-afast="${a.id}">
        <div class="cab-tela"><h3>${esc(a.aluno_nome)} <span class="selo ${vigente ? 'st-aberta' : 'st-encerrada'}">${vigente ? 'Vigente' : 'Encerrado'}</span></h3>
          <button class="btn btn-peq" data-carta="${a.id}" data-icone="imprimir">Comunicação à família</button></div>
        <dl class="doc-campos">
          <div><dt>Início e prazo</dt><dd>${dataBR(a.data_inicio)} · ${a.dias_letivos} dia(s) letivo(s)
            ${a.prorrogado ? `<br>Prorrogado por ${a.prorrogacao_dias} dia(s) — Conselho de Escola em ${dataBR(a.prorrogacao_conselho_data)}` : ''}</dd></div>
          <div><dt>Decidido por</dt><dd>${esc(a.criado_por_nome)} em ${dataHoraBR(a.criado_em)}</dd></div>
        </dl>
        <p><b>Hipóteses (Art. 11, § 1º):</b> ${a.hipoteses.map((h) => esc(HIPOTESES_AFASTAMENTO[h])).join('; ')}</p>
        <p><b>Motivação:</b> ${esc(a.motivacao)}</p>
        <p><b>Plano de estudos:</b> ${esc(a.plano_estudos)}</p>
        ${a.educacao_especial ? `<p><b>Adaptações e apoios (Art. 31):</b> ${esc(a.adaptacoes)}</p>` : ''}
        ${a.prorrogacao_fundamento ? `<p><b>Fundamento da prorrogação:</b> ${esc(a.prorrogacao_fundamento)}</p>` : ''}
        ${a.encerramento_obs ? `<p><b>Encerramento:</b> ${esc(a.encerramento_obs)}</p>` : ''}
        ${pend.length ? `<div class="alerta alerta-perigo">Pendente: ${pend.join('; ')}.</div>` : ''}
        ${ehAdmin() ? `<form class="form-afast-com" data-id="${a.id}">
          <div class="grade-3">
            <label>Família comunicada em <input type="date" name="familia_comunicada_em" value="${esc(a.familia_comunicada_em || '')}"></label>
            <label>URE comunicada em <input type="date" name="ure_comunicada_em" value="${esc(a.ure_comunicada_em || '')}"></label>
            <label>Rede protetiva acionada <input name="rede_protetiva" maxlength="500" value="${esc(a.rede_protetiva || '')}" placeholder="ex.: Conselho Tutelar, CRAS"></label>
          </div>
          <label class="check"><input type="checkbox" name="conviva_registrado" ${a.conviva_registrado ? 'checked' : ''}> Medida registrada na Plataforma CONVIVA</label>
          <label>Manifestação do estudante e da família sobre a medida (Art. 12, § 3º)
            <textarea name="manifestacao" rows="2" maxlength="4000">${esc(a.manifestacao || '')}</textarea></label>
          <div class="acoes">
            <button class="btn btn-primario" type="submit">Salvar comunicações</button>
            ${vigente && !a.prorrogado ? `<button class="btn" type="button" data-prorrogar="${a.id}" data-dias="${a.dias_letivos}">Prorrogar</button>` : ''}
            ${vigente ? `<button class="btn" type="button" data-encerrar="${a.id}">Encerrar / retorno</button>` : ''}
          </div>
        </form>` : ''}
      </div>`;
    }).join('') || '<p class="vazio">Nenhum afastamento registrado nesta ocorrência.</p>'}
  </section>`;
}

function ligarAfastamentos(el, o, recarregar) {
  const sec = $('#sec-afastamentos', el);
  if (!sec) return;
  const salvar = async (id, corpo, msg) => {
    try {
      await api(`/afastamentos/${id}`, { metodo: 'PUT', corpo });
      fecharModal();
      avisar(msg);
      await recarregar();
    } catch (err) { avisarErro(err); }
  };

  $('#btn-afastar', sec)?.addEventListener('click', () => modalNovoAfastamento(o, recarregar));

  sec.addEventListener('submit', (ev) => {
    const f = ev.target.closest('.form-afast-com');
    if (!f) return;
    ev.preventDefault();
    salvar(f.dataset.id, lerForm(f), 'Comunicações salvas.');
  });

  sec.addEventListener('click', (ev) => {
    const carta = ev.target.closest('[data-carta]');
    if (carta) return modalCarta(o, o.afastamentos.find((a) => a.id === Number(carta.dataset.carta)));

    const pr = ev.target.closest('[data-prorrogar]');
    if (pr) {
      const m = abrirModal('Prorrogar afastamento', `
        <p>A prorrogação ocorre <b>uma única vez</b>, por até igual período (${pr.dataset.dias} dia(s) letivo(s)), com reavaliação formal
          da Direção, acompanhamento da URE, apreciação do Conselho de Escola e comunicação formal à família (Art. 11, §§ 6º e 7º).</p>
        <form id="form-prorrogar">
          <div class="grade-2">
            <label>Dias letivos * <input type="number" name="prorrogacao_dias" min="1" max="${pr.dataset.dias}" value="${pr.dataset.dias}" required></label>
            <label>Apreciação do Conselho de Escola em * <input type="date" name="prorrogacao_conselho_data" required max="${hojeISO()}"></label>
          </div>
          <label>Reavaliação fundamentada * <textarea name="prorrogacao_fundamento" rows="4" required maxlength="4000"
            placeholder="Por que o risco persiste: fatos novos, elementos objetivos, providências em curso."></textarea></label>
          <div class="acoes"><button class="btn btn-primario" type="submit">Prorrogar</button><button class="btn" type="button" data-fechar>Voltar</button></div>
        </form>`);
      $('#form-prorrogar', m).addEventListener('submit', (e2) => {
        e2.preventDefault();
        salvar(pr.dataset.prorrogar, { acao: 'prorrogar', ...lerForm(e2.target) }, 'Afastamento prorrogado.');
      });
      return;
    }

    const enc = ev.target.closest('[data-encerrar]');
    if (enc) {
      const m = abrirModal('Encerrar afastamento', `
        <p>Encerrado o prazo sem deliberação fundamentada por prorrogação ou transferência cautelar, o estudante retorna às
          atividades presenciais, com plano de acompanhamento quando necessário (Art. 11, § 8º).</p>
        <form id="form-encerrar"><label>Encaminhamento / plano de retorno * <textarea name="encerramento_obs" rows="3" required maxlength="2000"
          placeholder="Ex.: retorno em 15/04 com plano individual de acompanhamento e adulto de referência."></textarea></label>
          <div class="acoes"><button class="btn btn-primario" type="submit">Encerrar</button><button class="btn" type="button" data-fechar>Voltar</button></div></form>`);
      $('#form-encerrar', m).addEventListener('submit', (e2) => {
        e2.preventDefault();
        salvar(enc.dataset.encerrar, { acao: 'encerrar', ...lerForm(e2.target) }, 'Afastamento encerrado.');
      });
    }
  });
}

function modalNovoAfastamento(o, recarregar) {
  const m = abrirModal('Registrar afastamento preventivo temporário', `
    <form id="form-afastar">
      <div class="aviso-norma">É vedado adotar a medida com base apenas em receios genéricos, percepções não documentadas,
        pressão da comunidade ou recorrência sem análise contextualizada (Art. 5º, § 3º).</div>
      <label>Estudante *
        <select name="aluno" required>${o.alunos.map((a, i) => `<option value="${i}">${esc(a.nome)}</option>`).join('')}</select></label>
      <fieldset><legend>Hipótese(s) — Art. 11, § 1º *</legend>
        ${Object.entries(HIPOTESES_AFASTAMENTO).map(([k, t]) => `<label class="check"><input type="checkbox" name="hip" value="${k}"> ${esc(t)}</label>`).join('')}
      </fieldset>
      <label>Motivação expressa * <textarea name="motivacao" rows="4" required maxlength="4000"
        placeholder="Elementos objetivos que demonstram o risco ou o esgotamento das estratégias (fatos, datas, registros)."></textarea></label>
      <div class="grade-2">
        <label>Início * <input type="date" name="data_inicio" required value="${hojeISO()}"></label>
        <label>Dias letivos * <input type="number" name="dias_letivos" min="1" max="${AFASTAMENTO_MAX_DIAS}" value="1" required>
          <small>Máximo de ${AFASTAMENTO_MAX_DIAS} dias letivos consecutivos (Art. 11, § 5º).</small></label>
      </div>
      <label>Plano de estudos * <textarea name="plano_estudos" rows="3" required maxlength="4000"
        placeholder="Atividades orientadas que garantem a continuidade da aprendizagem durante o afastamento (Art. 11, § 3º)."></textarea></label>
      <label class="check"><input type="checkbox" name="educacao_especial"> Estudante elegível à Educação Especial, em sofrimento psíquico ou com necessidades específicas de apoio</label>
      <label id="lbl-adapt" hidden>Adaptações razoáveis e apoios já adotados * <textarea name="adaptacoes" rows="3" maxlength="4000"></textarea>
        <small>Art. 31, parágrafo único: devem estar documentadas antes da medida, salvo risco imediato fundamentado.</small></label>
      <label class="check"><input type="checkbox" name="declara_nao_discriminatorio"> Declaro que a medida <b>não</b> decorre de deficiência,
        condição de saúde, sofrimento psíquico, vulnerabilidade social, raça, etnia, nacionalidade, origem territorial, religião,
        orientação sexual, identidade ou expressão de gênero ou qualquer forma de discriminação (Art. 28, VI).</label>
      <p class="ajuda">Depois de registrar: comunique imediatamente a família e a URE, registre na Plataforma CONVIVA e garanta a
        manifestação do estudante e da família (Art. 12).</p>
      <div class="acoes"><button class="btn btn-perigo" type="submit">Registrar afastamento</button>
        <button class="btn" type="button" data-fechar>Cancelar</button></div>
    </form>`);
  const f = $('#form-afastar', m);
  f.educacao_especial.addEventListener('change', () => { $('#lbl-adapt', m).hidden = !f.educacao_especial.checked; });
  f.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const d = lerForm(f);
    const aluno = o.alunos[Number(d.aluno)];
    const corpo = {
      aluno_id: aluno.aluno_id, aluno_nome: aluno.nome,
      hipoteses: $$('input[name=hip]:checked', f).map((c) => c.value),
      motivacao: d.motivacao, data_inicio: d.data_inicio, dias_letivos: Number(d.dias_letivos),
      plano_estudos: d.plano_estudos, educacao_especial: d.educacao_especial, adaptacoes: d.adaptacoes,
      declara_nao_discriminatorio: d.declara_nao_discriminatorio,
    };
    await comCarregando(f.querySelector('[type=submit]'), async () => {
      try {
        await api(`/ocorrencias/${o.id}/afastamentos`, { metodo: 'POST', corpo });
        fecharModal();
        avisar('Afastamento registrado. Comunique a família e a URE.');
        await recarregar();
      } catch (err) { avisarErro(err); }
    });
  });
}

// Comunicação formal à família — conteúdo mínimo do Art. 12, § 1º.
function modalCarta(o, a) {
  const e = estado.escola;
  const m = abrirModal('Comunicação formal à família', `
    <p class="ajuda">Revise os textos. Não inclua nomes ou dados de outros estudantes (sigilo, Art. 4º, VIII).</p>
    <form id="form-carta">
      <label>Responsável (nome) <input name="responsavel" maxlength="120"></label>
      <label>I — Descrição objetiva da situação * <textarea name="descricao" rows="4" required>${esc(a.motivacao)}</textarea></label>
      <label>IV — Próximos procedimentos <textarea name="proximos" rows="3">Reunião com a família para escuta e definição do plano de acompanhamento; retorno às atividades presenciais ao final do prazo, com acompanhamento pedagógico.</textarea></label>
      <label>V — Canais de manifestação da família <textarea name="canais" rows="2">Secretaria da escola${e.telefone ? `, telefone ${esc(e.telefone)}` : ''}, ou por escrito à Direção. A família pode apresentar manifestação escrita ou oral e documentos.</textarea></label>
      <div class="acoes"><button class="btn btn-primario" type="submit" data-icone="imprimir">Imprimir</button><button class="btn" type="button" data-fechar>Fechar</button></div>
    </form>`);
  $('#form-carta', m).addEventListener('submit', (ev) => {
    ev.preventDefault();
    const d = lerForm(ev.target);
    fecharModal();
    const total = a.dias_letivos + (a.prorrogado ? a.prorrogacao_dias : 0);
    imprimirAvulso(`
      <header class="doc-cab"><div><div class="doc-escola">${esc(e.nome)}</div>
        <div class="doc-sub">${[e.cie && `CIE ${e.cie}`, e.municipio, e.diretoria, e.endereco].filter(Boolean).map(esc).join(' · ')}</div></div>
        <div class="doc-num"><small>Ref. ocorrência</small><b>${esc(o.numero)}</b></div></header>
      <h1 class="doc-titulo">Comunicação de afastamento preventivo temporário</h1>
      <p>${esc(e.municipio || '')}${e.municipio ? ', ' : ''}${dataBR(hojeISO())}.</p>
      <p>Prezado(a) responsável${d.responsavel ? ` <b>${esc(d.responsavel)}</b>` : ''},</p>
      <p>Comunicamos que o(a) estudante <b>${esc(a.aluno_nome)}</b> está em afastamento preventivo temporário das atividades presenciais
        a partir de <b>${dataBR(a.data_inicio)}</b>, pelo prazo de <b>${total} dia(s) letivo(s)</b>${a.prorrogado ? ' (já incluída a prorrogação apreciada pelo Conselho de Escola)' : ''},
        nos termos do Capítulo IV da Resolução SEDUC nº 68, de 19 de junho de 2026.</p>
      <h2>I — Situação que motivou a medida</h2><p class="relato">${esc(d.descricao)}</p>
      <h2>II — Natureza da medida</h2><p>Trata-se de medida <b>cautelar, excepcional e temporária</b>, de caráter protetivo. Não constitui
        punição, sanção definitiva nem decisão automática de transferência (Art. 11, § 2º), e não acarreta prejuízo injustificado à
        frequência, à avaliação ou ao vínculo escolar (Art. 11, § 4º).</p>
      <h2>III — Continuidade das atividades pedagógicas</h2><p class="relato">${esc(a.plano_estudos)}</p>
      <h2>IV — Próximos procedimentos</h2><p class="relato">${esc(d.proximos)}</p>
      <h2>V — Canais para manifestação</h2><p class="relato">${esc(d.canais)}</p>
      <p>Ao estudante e à família é assegurada a oportunidade de manifestação sobre a medida (Art. 12, § 3º).</p>
      <div class="assinaturas assinaturas-2">
        <div>&nbsp;<br><small>Direção da unidade escolar</small></div>
        <div>&nbsp;<br><small>Ciente — responsável legal · data: ___/___/______</small></div>
      </div>`);
  });
}
