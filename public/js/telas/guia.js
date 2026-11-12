// telas/guia.js — guia ilustrado: como registrar uma ocorrência, passo a passo.
// Aberto pelo menu "Tutorial", pela tela "Nova ocorrência" e pelo tutorial de cada perfil.
// As imagens (public/img/guia) são de uma escola fictícia, sem dados reais.
import { $, esc, icone, imprimirAvulso } from '../ui.js';
import { estado, ehMaster } from '../app.js';

// Tocar na imagem abre em tamanho real (útil no celular).
const img = (arq, alt) => `<figure class="guia-fig"><a href="/img/guia/${arq}.png" target="_blank" rel="noopener" title="Abrir a imagem em tamanho real">
  <img src="/img/guia/${arq}.png" alt="${esc(alt)}"></a></figure>`;

// Cada seção: título, ícone e conteúdo em HTML (texto fixo, escrito aqui; nada vem do usuário).
const SECOES = [
  {
    id: 'emergencia', icone: 'sirene', titulo: 'Antes de tudo: há risco agora?',
    html: `<div class="alerta alerta-perigo"><span>Se alguém corre perigo, <b>não comece pelo sistema</b>.
        Acione o socorro (<b>PM 190</b> · <b>SAMU 192</b> · <b>Bombeiros 193</b>) e avise a direção.
        Registre depois, assim que a situação estiver sob controle.</span></div>
      <p>O registro documenta o que aconteceu. Ele não substitui o atendimento.</p>`,
  },
  {
    id: 'abrir', icone: 'mais', titulo: 'Clique em “Nova ocorrência”',
    html: `<p>O botão azul fica no alto do menu, à esquerda. No celular, toque em ☰ para abrir o menu.</p>
      ${img('01-menu', 'Menu lateral com o botão Nova ocorrência em destaque')}`,
  },
  {
    id: 'categoria', icone: 'livro', titulo: 'Escolha a categoria',
    html: `${img('02-categoria', 'As três categorias: Emergência, Protocolo 179 e Indisciplina / Administrativa')}
      <table class="guia-tabela">
        <thead><tr><th>Categoria</th><th>Quando usar</th><th>Exemplos</th></tr></thead>
        <tbody>
          <tr><td><b>Emergência</b></td><td>Há risco imediato à vida ou à segurança.</td><td>Pessoa armada, mal súbito grave, incêndio, ameaça de ataque.</td></tr>
          <tr><td><b>Protocolo 179</b></td><td>Situações de violência ou de risco previstas no Protocolo 179 (Conviva SP).</td><td>Agressão física, bullying, violência sexual, drogas, dano ao patrimônio, automutilação.</td></tr>
          <tr><td><b>Indisciplina / Administrativa</b></td><td>Descumprimento das normas da escola, sem violência.</td><td>Saiu da sala sem permissão, não abriu o caderno, recusou-se a tirar o boné, incidente no intervalo, celular.</td></tr>
        </tbody>
      </table>
      <p class="ajuda">Ficou em dúvida entre duas? Escolha a mais grave e explique no relato. Depois de registrada, a categoria e o tipo não mudam.</p>`,
  },
  {
    id: 'tipo', icone: 'busca', titulo: 'Encontre o tipo',
    html: `<p>Digite uma palavra no campo de busca: <i>boné</i>, <i>celular</i>, <i>intervalo</i>, <i>briga</i>, <i>bullying</i>.
        A lista mostra só os tipos que combinam. Clique no tipo certo.</p>
      ${img('03-tipo-busca', 'Busca pela palavra boné mostrando o tipo A3')}
      <p>Os tipos estão agrupados pelas macrocategorias do Protocolo 179 (a até j). Abaixo do nome aparece a definição:
        leia antes de escolher. Na Indisciplina, se nada se encaixa, use <b>“Outra indisciplina (descrever no relato)”</b>.</p>
      <p>Escolheu errado? Clique em <b>“trocar”</b> no alto do formulário. Faça isso <b>antes</b> de registrar: depois, o tipo não pode ser alterado.</p>`,
  },
  {
    id: 'quando', icone: 'calendario', titulo: 'Data, horário e local',
    html: `${img('04-cabecalho', 'Tipo escolhido, definição e campos de data, horário e local')}
      <p>Data e horário já vêm preenchidos com o momento atual. <b>Corrija para quando o fato aconteceu</b>, não para quando você está registrando.</p>
      <p>Se a escola soube do fato dias depois (por exemplo, uma família contou na segunda algo que ocorreu na sexta),
        abra <b>“A escola soube do fato depois?”</b> e informe a data em que a escola tomou conhecimento.</p>
      <p>Algumas situações do Protocolo 179 mostram um aviso sobre <b>boletim de ocorrência</b>. Leia: ele diz se o B.O. é obrigatório.</p>`,
  },
  {
    id: 'alunos', icone: 'pessoa', titulo: 'Estudantes e o papel de cada um',
    html: `<p>Escolha a turma e marque os estudantes. Depois, ao lado de cada nome, indique o papel:</p>
      <ul class="guia-lista">
        <li><b>Autor(a)</b>: quem praticou o ato.</li>
        <li><b>Vítima</b>: quem sofreu o ato.</li>
        <li><b>Testemunha</b>: quem viu, sem participar.</li>
        <li><b>Envolvido(a)</b>: quando não está claro, ou quando todos participaram (por exemplo, uma briga entre dois).</li>
      </ul>
      ${img('05-alunos', 'Turma 7º ano A com dois alunos marcados: um como autor e outro como testemunha')}
      <p>Estudante de outra turma? Abra <b>“Aluno de outra turma ou sem cadastro”</b> e busque pelo nome ou RA.
        Se ele não estiver cadastrado, digite o nome e clique em <b>Adicionar</b>.</p>
      <p>Não lembra o nome? Consulte o <b>Carômetro</b> (menu à esquerda) para reconhecer o estudante pela foto.</p>
      <p class="ajuda">Na Indisciplina é obrigatório indicar pelo menos um estudante. Nas outras categorias, pode ficar em branco se ninguém foi identificado.</p>`,
  },
  {
    id: 'relato', icone: 'nota', titulo: 'Escreva o relato',
    html: `<p>O relato é a parte mais importante. Ele pode ser lido pela família, pelo Conselho Tutelar ou pela Diretoria de Ensino.
        <b>Depois de registrado, não pode ser alterado</b> (correções e complementos entram como notas).</p>
      ${img('06-relato', 'Campo do relato preenchido e a caixa Como escrever um bom relato aberta')}
      <ul class="guia-lista">
        <li>Conte <b>o que</b> aconteceu, <b>quem</b> estava, <b>onde</b> e <b>como</b>, na ordem em que ocorreu.</li>
        <li>Escreva o que você <b>viu ou ouviu</b>. Se outra pessoa contou, diga quem.</li>
        <li>Falas entre aspas, do jeito que foram ditas.</li>
        <li>Diga o que você já fez na hora.</li>
        <li>Nada de rótulos ou opiniões sobre o estudante.</li>
      </ul>
      <div class="guia-comparar">
        <div class="guia-ruim"><b>${icone('fechar')}Evite</b>
          <p>“O Bruno, sempre problemático, mais uma vez desrespeitou a professora e não quis tirar o boné. Ele não tem limites.”</p>
          <small>Opinião (“problemático”, “não tem limites”), sem horário, sem o que foi dito, sem o que foi feito.</small></div>
        <div class="guia-bom"><b>${icone('check')}Prefira</b>
          <p>“Às 9h10, na aula de Matemática do 7º ano A, o aluno Bruno estava de boné. Pedi três vezes que retirasse, explicando a regra da escola.
            Na terceira vez ele respondeu: ‘Não vou tirar’. A aluna Carla presenciou. Encaminhei o aluno à coordenação às 9h20.”</p>
          <small>Horário, local, falas entre aspas, testemunha e providência.</small></div>
      </div>`,
  },
  {
    id: 'procedimentos', icone: 'check', titulo: 'Marque o que já foi feito',
    html: `${img('07-procedimentos', 'Lista de procedimentos com o primeiro item marcado')}
      <p>Abaixo do relato aparece uma lista de procedimentos. Nas situações do Protocolo 179 são os passos do próprio Protocolo;
        na Indisciplina, as intervenções pedagógicas do Art. 7º da Res. SEDUC nº 68/2026.</p>
      <p><b>Marque só o que você já fez.</b> O restante fica para a equipe gestora concluir no acompanhamento.
        Use o campo <b>“Providências imediatas”</b> para contar, em poucas palavras, o que fez e a que horas.</p>
      <p>Confira tudo e clique em <b>“Registrar ocorrência”</b> (uma vez só: o botão fica em “Aguarde…” enquanto salva).</p>`,
  },
  {
    id: 'depois', icone: 'lista', titulo: 'Depois de registrar',
    html: `${img('08-registrada', 'Ocorrência registrada, com o número 2026/0001 e a conversa com a equipe gestora')}
      <ul class="guia-lista">
        <li>A ocorrência recebe um <b>número</b> (ex.: 2026/0001) e a equipe gestora é avisada na hora.</li>
        <li>No alto aparece a <b>conversa com a equipe gestora</b>. Use-a para dizer onde o estudante está e combinar o que fazer.</li>
        <li>Precisa corrigir ou acrescentar algo? Use <b>“Notas”</b>, na própria ocorrência. O relato original não muda.</li>
        <li><b>Baixar PDF</b> gera o documento para imprimir ou arquivar.</li>
        <li>Em <b>“Ocorrências”</b> você acompanha a situação (aberta, em acompanhamento, encerrada) e vê as mensagens novas.</li>
      </ul>`,
  },
  {
    id: 'duvidas', icone: 'info', titulo: 'Dúvidas comuns',
    html: `<dl class="guia-faq">
        <dt>Escrevi algo errado no relato.</dt><dd>Acrescente uma nota explicando a correção. O relato não é editado, para preservar o registro original.</dd>
        <dt>Registrei a mesma ocorrência duas vezes.</dt><dd>Peça à direção (diretor ou vice) que cancele a duplicada, informando o motivo. Ocorrências não são apagadas, só canceladas.</dd>
        <dt>Não encontro o estudante.</dt><dd>Busque em “Aluno de outra turma ou sem cadastro”. Se não aparecer, digite o nome. Avise a direção para atualizar a lista da turma.</dd>
        <dt>Não sei qual tipo escolher.</dt><dd>Busque por uma palavra do que aconteceu. Na dúvida, escolha o mais grave ou “Outra indisciplina” e explique no relato. Se perceber o erro depois de registrar, escreva uma nota e avise a equipe gestora pela conversa.</dd>
        <dt>Mais de uma situação ao mesmo tempo (ex.: briga e dano ao patrimônio).</dt><dd>Registre pela mais grave e descreva tudo no relato.</dd>
        <dt>Esqueci a senha.</dt><dd>Procure a direção ou a coordenação da escola para gerar uma senha provisória.</dd>
      </dl>`,
  },
];

export async function render(el) {
  el.innerHTML = `
    <div class="cab-tela">
      <h1>Como registrar uma ocorrência</h1>
      <div class="linha-btn">
        ${ehMaster() ? '' : '<a class="btn btn-primario" href="#/nova" data-icone="mais">Registrar agora</a>'}
        <button class="btn" id="guia-imprimir" data-icone="imprimir">Imprimir</button>
      </div>
    </div>
    <section class="cartao guia-intro">
      <p>Registrar leva poucos minutos e segue três etapas: <b>categoria</b>, <b>tipo</b> e <b>formulário</b>.
        Este guia mostra cada tela. As imagens são de uma escola de exemplo, com nomes fictícios.</p>
      <nav class="guia-indice" aria-label="Seções do guia">
        ${SECOES.map((s, i) => `<button type="button" data-ir="${s.id}">${i + 1}. ${esc(s.titulo)}</button>`).join('')}
      </nav>
    </section>
    <ol class="tutorial guia">
      ${SECOES.map((s, i) => `
        <li class="cartao tut-passo" id="guia-${s.id}">
          <span class="tut-num" aria-hidden="true">${i + 1}</span>
          <div class="tut-corpo guia-corpo"><h2>${icone(s.icone)}${esc(s.titulo)}</h2>${s.html}</div>
        </li>`).join('')}
    </ol>
    <div class="acoes tut-fim">
      ${ehMaster() ? '' : '<a class="btn btn-primario" href="#/nova" data-icone="mais">Registrar uma ocorrência</a>'}
      <a class="btn" href="#/tutorial" data-icone="voltar">Voltar ao tutorial</a>
    </div>`;

  // Índice: botões (não links) rolam até a seção sem mexer no endereço, que o "#" usa para as telas.
  el.querySelector('.guia-indice').addEventListener('click', (e) => {
    const a = e.target.closest('[data-ir]');
    if (!a) return;
    $(`#guia-${a.dataset.ir}`, el)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  $('#guia-imprimir', el).addEventListener('click', () => {
    const e = estado.escola;
    imprimirAvulso(`
      <header class="doc-cab"><div><div class="doc-escola">${esc(e.nome)}</div><div class="doc-sub">SisRoe · Registro de Ocorrências Escolares</div></div>
        <div class="doc-num"><small>Código da escola</small><b>${esc(e.codigo)}</b></div></header>
      <h1 class="doc-titulo">Como registrar uma ocorrência</h1>
      <div class="guia guia-impresso">${SECOES.map((s, i) => `<section><h2>${i + 1}. ${esc(s.titulo)}</h2>${s.html}</section>`).join('')}</div>
      <p class="doc-rodape">Endereço do sistema: ${esc(location.origin)} · Imagens de uma escola de exemplo, com nomes fictícios.</p>`);
  });
}
