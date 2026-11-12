// telas/backup.js — cópia de segurança dos dados da escola, em Excel (.xlsx) e JSON (equipe gestora).
import { api } from '../api.js';
import { $, esc, avisar, avisarErro, icone, dataHoraBR, aplicarIcones } from '../ui.js';
import { estado, ehGestao, ehAdmin, ehDirecao, recarregarCadastros } from '../app.js';
import { PERFIS } from '../catalogo.js';
import { gerarXlsx } from '../planilha.js';
import { ETAPAS, TITULOS_FILHOS, prepararBackup, restaurar } from '../restauracao.js';

export async function render(el) {
  if (!ehGestao()) {
    el.innerHTML = '<div class="cartao">O backup é restrito à equipe gestora (POC, coordenação, vice e direção).</div>';
    return;
  }
  const info = await api('/backup');
  const total = info.tabelas.reduce((s, t) => s + t.registros, 0);
  el.innerHTML = `
    <div class="cab-tela"><h1>Backup dos dados</h1></div>
    <section class="cartao">
      <p>Baixe uma cópia de segurança com os dados da escola <b>${esc(info.escola.nome)}</b>. Guarde o arquivo em local
        seguro (computador da escola, pen drive ou drive institucional): ele tem dados pessoais de estudantes.</p>
      <div class="backup-botoes">
        <button class="btn btn-primario" data-formato="xlsx">${icone('grafico')}Baixar em Excel (.xlsx)</button>
        <button class="btn" data-formato="json">${icone('documento')}Baixar em JSON</button>
        <span class="ajuda" id="backup-progresso" aria-live="polite"></span>
      </div>
      <ul class="guia-lista ajuda">
        <li><b>Excel:</b> uma aba para cada tipo de dado, para abrir no Excel, no LibreOffice ou no Google Planilhas.</li>
        <li><b>JSON:</b> o mesmo conteúdo num formato que outros sistemas leem; útil para guardar ou migrar.</li>
      </ul>
    </section>
    <section class="cartao">
      <h2>O que entra no backup (${total} registro(s))</h2>
      <table class="tabela"><thead><tr><th>Dados</th><th>Registros</th></tr></thead><tbody>
        ${info.tabelas.map((t) => `<tr><td>${esc(t.titulo)}</td><td>${t.registros}</td></tr>`).join('')}
      </tbody></table>
      <p class="ajuda">Não entram: senhas, fotos e arquivos do carômetro (são pesados; continuam guardados no sistema).
        ${ehAdmin() ? '' : 'A lista da equipe entra só no backup feito pela vice-direção ou pela direção.'}
        Cada backup fica registrado na auditoria, com quem baixou.</p>
    </section>
    ${ehDirecao() ? `<section class="cartao restaurar">
      <h2>${icone('pasta')}Restaurar um backup</h2>
      <p>Envie um backup <b>JSON</b> desta escola. O sistema <b>só acrescenta o que estiver faltando</b>:
        nada do que já existe é alterado ou apagado. Antes de gravar, você vê uma prévia.</p>
      <ul class="guia-lista ajuda">
        <li>Reconhece o que já existe: turmas pelo nome, alunos pelo RA (ou nome e turma), ocorrências pela data e pelo relato.</li>
        <li>Se o número de uma ocorrência já estiver em uso por outra, a restaurada recebe o próximo número livre.</li>
        <li>Não restaura a equipe e as senhas (cadastre de novo quem precisar), nem fotos e arquivos do carômetro.</li>
      </ul>
      <label>Arquivo de backup (.json) <input type="file" id="rest-arquivo" accept="application/json,.json"></label>
      <div id="rest-previa"></div>
    </section>` : ''}`;

  ligarRestauracao(el);
  el.querySelector('.backup-botoes').addEventListener('click', async (ev) => {
    const b = ev.target.closest('[data-formato]');
    if (!b) return;
    const botoes = el.querySelectorAll('[data-formato]');
    botoes.forEach((x) => { x.disabled = true; });
    const prog = $('#backup-progresso', el);
    try {
      const dados = await baixarTudo(info, (txt) => { prog.textContent = txt; });
      const nome = `backup-${info.escola.codigo}-${new Date().toISOString().slice(0, 10)}`;
      if (b.dataset.formato === 'json') salvar(new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' }), `${nome}.json`);
      else salvar(planilhaDoBackup(dados, info), `${nome}.xlsx`);
      await api('/backup/registrar', { metodo: 'POST', corpo: { formato: b.dataset.formato } });
      prog.textContent = 'Pronto: o arquivo foi baixado.';
      avisar('Backup baixado.');
    } catch (e) { prog.textContent = ''; avisarErro(e); }
    finally { botoes.forEach((x) => { x.disabled = false; }); }
  });
}

// ─── Restauração (vice e direção) ────────────────────────────────────────────
function tabelaResumo(res, simular) {
  const linhas = ETAPAS.map((e) => {
    const x = res.etapas[e.nome];
    return `<tr><td>${esc(e.titulo)}</td><td><b>${x.novos}</b></td><td>${x.existentes}</td><td>${x.ignorados || ''}</td></tr>`;
  }).join('');
  const filhos = Object.entries(res.filhos).filter(([, n]) => n).map(([k, n]) => `${n} ${esc(TITULOS_FILHOS[k] || k)}`).join(', ');
  const renum = res.etapas.ocorrencias.renumeradas;
  return `<div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Dados</th>
      <th>${simular ? 'Serão acrescentados' : 'Acrescentados'}</th><th>Já existiam (não mexidos)</th><th>Ignorados</th></tr></thead>
      <tbody>${linhas}</tbody></table></div>
    ${filhos ? `<p class="ajuda">Junto com as ocorrências e casos novos: ${filhos}.</p>` : ''}
    ${renum ? `<p class="ajuda"><b>${renum}</b> ocorrência(s) ${simular ? 'receberão' : 'receberam'} um número novo, porque o número original já estava em uso.</p>` : ''}`;
}

function ligarRestauracao(el) {
  const inp = $('#rest-arquivo', el);
  if (!inp) return;
  const caixa = $('#rest-previa', el);
  let backup = null;
  inp.addEventListener('change', async () => {
    const f = inp.files[0];
    caixa.innerHTML = '';
    backup = null;
    if (!f) return;
    try {
      backup = prepararBackup(await f.text(), estado.escola.codigo);
      caixa.innerHTML = '<p class="carregando" id="rest-prog">Conferindo o backup…</p>';
      const prev = await restaurar(backup, { simular: true, progresso: (t) => { const p = $('#rest-prog', caixa); if (p) p.textContent = t; } });
      caixa.innerHTML = `<h3>Prévia</h3>
        <p class="ajuda">Backup de ${esc(dataHoraBR(backup.gerado_em))}${backup.gerado_por?.nome ? `, feito por ${esc(backup.gerado_por.nome)}` : ''}.</p>
        ${tabelaResumo(prev, true)}
        ${prev.novosTotal
          ? `<div class="linha-btn"><button class="btn btn-primario" id="rest-confirmar" data-icone="check">Restaurar: acrescentar ${prev.novosTotal} registro(s)</button>
              <button class="btn" id="rest-cancelar">Cancelar</button><span class="ajuda" id="rest-prog"></span></div>`
          : '<div class="alerta alerta-info"><span>Nada a restaurar: tudo o que está neste backup já existe no sistema.</span></div>'}`;
      aplicarIcones(caixa);
    } catch (e) { caixa.innerHTML = ''; inp.value = ''; avisarErro(e); }
  });
  caixa.addEventListener('click', async (ev) => {
    if (ev.target.closest('#rest-cancelar')) { caixa.innerHTML = ''; inp.value = ''; backup = null; return; }
    const b = ev.target.closest('#rest-confirmar');
    if (!b || !backup) return;
    if (!confirm('Restaurar o backup? Só serão acrescentados os registros que faltam; nada do que existe será alterado.')) return;
    b.disabled = true;
    inp.disabled = true;
    try {
      const res = await restaurar(backup, { simular: false, progresso: (t) => { $('#rest-prog', caixa).textContent = t; } });
      const resumo = Object.fromEntries(ETAPAS.map((e) => [e.nome, res.etapas[e.nome].novos]));
      await api('/restaurar-concluido', { metodo: 'POST', corpo: { resumo: { ...resumo, ...res.filhos, renumeradas: res.etapas.ocorrencias.renumeradas } } });
      await recarregarCadastros();
      caixa.innerHTML = `<div class="alerta alerta-info"><span><b>Restauração concluída.</b> ${res.novosTotal} registro(s) acrescentado(s).</span></div>
        ${tabelaResumo(res, false)}`;
      avisar('Backup restaurado.');
    } catch (e) {
      avisarErro(e);
      caixa.insertAdjacentHTML('beforeend', '<p class="ajuda">A restauração parou no meio. Pode enviar o mesmo arquivo de novo: o que já entrou é reconhecido e não se repete.</p>');
    } finally { inp.disabled = false; inp.value = ''; }
  });
}


async function baixarTudo(info, progresso) {
  const tabelas = {};
  for (const t of info.tabelas) {
    const linhas = [];
    let depois = 0;
    for (;;) {
      progresso(`Baixando ${t.titulo.toLowerCase()}… ${linhas.length}/${t.registros}`);
      const pagina = await api(`/backup/${t.nome}?depois=${depois}`);
      linhas.push(...pagina.linhas);
      if (pagina.fim || !pagina.linhas.length) break;
      depois = pagina.linhas[pagina.linhas.length - 1].id;
    }
    tabelas[t.nome] = linhas;
  }
  progresso('Montando o arquivo…');
  return {
    sistema: 'SisRoe',
    formato: 1,
    gerado_em: new Date().toISOString(),
    gerado_por: { nome: estado.usuario.nome, perfil: PERFIS[estado.usuario.perfil] || estado.usuario.perfil },
    escola: info.escola,
    tabelas,
  };
}

function planilhaDoBackup(dados, info) {
  const leiame = [
    { campo: 'Sistema', valor: 'SisRoe — Registro de Ocorrências Escolares' },
    { campo: 'Escola', valor: info.escola.nome },
    { campo: 'Código da escola', valor: info.escola.codigo },
    { campo: 'Gerado em', valor: dataHoraBR(dados.gerado_em) },
    { campo: 'Gerado por', valor: `${dados.gerado_por.nome} (${dados.gerado_por.perfil})` },
    { campo: 'Atenção', valor: 'Contém dados pessoais de estudantes (ECA e LGPD). Guarde em local seguro e não compartilhe.' },
    ...info.tabelas.map((t) => ({ campo: `Aba "${t.titulo}"`, valor: `${dados.tabelas[t.nome].length} registro(s)` })),
  ];
  return gerarXlsx([{ nome: 'Leia-me', linhas: leiame },
    ...info.tabelas.map((t) => ({ nome: t.titulo, linhas: dados.tabelas[t.nome] }))]);
}

function salvar(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nome;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
