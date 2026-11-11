// telas/painel.js — tela inicial com números e gráficos simples de barras.
import { api } from '../api.js';
import { esc, seloCategoria, seloStatus, dataBR } from '../ui.js';
import { estado, ehGestao, ehAdmin } from '../app.js';
import { CATEGORIAS } from '../catalogo.js';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function barras(itens, rotulo, valor, classe = '') {
  if (!itens.length || itens.every((i) => !valor(i))) return '<p class="vazio">Sem registros ainda.</p>';
  const max = Math.max(...itens.map(valor), 1);
  return `<ul class="barras ${classe}">${itens.map((i) => `
      <li><span class="barra-rotulo" title="${esc(rotulo(i))}">${esc(rotulo(i))}</span>
        <span class="barra-trilho"><span class="barra" style="width:${(valor(i) / max) * 100}%"></span></span>
        <span class="barra-valor">${valor(i)}</span></li>`).join('')}</ul>`;
}

export async function render(el) {
  const ano = new Date().getFullYear();
  const [p, recentes] = await Promise.all([
    api(`/painel?ano=${ano}`),
    api(ehGestao() ? '/ocorrencias?limite=6&status=aberta' : '/ocorrencias?limite=6'),
  ]);
  const gestao = ehGestao();
  const semTurmas = !estado.turmas.length;

  el.innerHTML = `
    <div class="cab-tela">
      <h1>${gestao ? 'Painel da escola' : 'Minhas ocorrências'} <small>${ano}</small></h1>
      <a class="btn btn-primario" href="#/nova">+ Nova ocorrência</a>
    </div>

    ${semTurmas && ehAdmin() ? `<div class="alerta alerta-info">
        <b>Primeiros passos:</b> cadastre as turmas, os alunos e os servidores da escola.
        <a href="#/admin/primeiros-passos">Ir para a administração →</a></div>` : ''}
    ${p.urgentesAbertas && gestao ? `<a class="alerta alerta-perigo" href="#/ocorrencias">
        <b>${p.urgentesAbertas}</b> ocorrência(s) do Protocolo 179 (urgência/grave) ainda não encerrada(s). Ver lista →</a>` : ''}

    <div class="numeros">
      <div class="numero"><span>${p.mes}</span>no mês</div>
      <div class="numero"><span>${p.total}</span>no ano</div>
      <div class="numero n-aberta"><span>${p.abertas}</span>abertas</div>
      <div class="numero n-acomp"><span>${p.acompanhamento}</span>em acompanhamento</div>
      <div class="numero n-enc"><span>${p.encerradas}</span>encerradas</div>
    </div>

    <div class="grade-2 grade-painel">
      <section class="cartao">
        <h2>Por categoria</h2>
        ${barras(p.porCategoria, (i) => CATEGORIAS[i.categoria].nome, (i) => i.qtd, 'barras-cat')}
      </section>
      <section class="cartao">
        <h2>Por mês</h2>
        ${barras(p.porMes, (i) => MESES[i.mes - 1], (i) => i.qtd)}
      </section>
      <section class="cartao">
        <h2>Tipos mais frequentes</h2>
        ${barras(p.porTipo, (i) => i.nome, (i) => i.qtd)}
      </section>
      <section class="cartao">
        <h2>Turmas com mais ocorrências</h2>
        ${barras(p.porTurma, (i) => i.nome, (i) => i.qtd)}
      </section>
    </div>

    <section class="cartao">
      <h2>${gestao ? 'Abertas, aguardando providências' : 'Registradas recentemente'}</h2>
      ${recentes.length ? `<ul class="lista-simples">${recentes.map((o) => `
        <li><a href="#/ocorrencia/${o.id}">
          <span class="num">${esc(o.numero)}</span>
          <span class="desc">${esc(o.tipo_descricao)}<small>${dataBR(o.data)} · ${esc(o.turma_nome || 'Sem turma')}
            ${o.alunos.length ? ' · ' + esc(o.alunos.map((a) => a.nome).join(', ')) : ''}</small></span>
          ${seloCategoria(o.categoria)} ${seloStatus(o.status)}</a></li>`).join('')}</ul>`
        : '<p class="vazio">Nada por aqui. 🎉</p>'}
      <p><a href="#/ocorrencias">Ver todas →</a></p>
    </section>`;
}
