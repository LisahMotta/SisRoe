// telas/backup.js — cópia de segurança dos dados da escola, em Excel (.xlsx) e JSON (equipe gestora).
import { api } from '../api.js';
import { $, esc, avisar, avisarErro, icone, dataHoraBR } from '../ui.js';
import { estado, ehGestao, ehAdmin } from '../app.js';
import { PERFIS } from '../catalogo.js';
import { gerarXlsx } from '../planilha.js';

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
    </section>`;

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
