// chat.js — conversa da ocorrência entre quem registrou e a equipe gestora.
// Atualiza a cada 6 s enquanto a ficha está aberta e a aba visível (sem servidor
// ligado o tempo todo, a página pergunta se há mensagens novas).
import { api } from './api.js';
import { $, esc, dataHoraBR, avisarErro, icone } from './ui.js';
import { PERFIS } from './catalogo.js';
import { atualizarAvisos } from './notificacoes.js';

export function montarChat(caixa, ocorrencia, { aberto = true } = {}) {
  let ultimo = 0;
  let timer = null;
  const fechado = ocorrencia.status === 'cancelada';
  caixa.innerHTML = `
    <section class="cartao chat nao-imprimir" aria-label="Conversa com a equipe gestora">
      <div class="chat-topo">
        <h2>${icone('nota')} Conversa com a equipe gestora</h2>
        <span class="ajuda">Visível para quem registrou e para a equipe gestora.</span>
      </div>
      <div class="chat-msgs" id="chat-msgs" role="log" aria-live="polite"><p class="carregando">Carregando conversa…</p></div>
      ${fechado ? '<p class="ajuda">Ocorrência cancelada: o chat está fechado.</p>' : `
      <form class="chat-form" id="chat-form">
        <textarea name="texto" rows="2" maxlength="2000" placeholder="Escreva uma mensagem… (Enter envia, Shift+Enter quebra linha)" aria-label="Mensagem"></textarea>
        <button class="btn btn-primario" type="submit" aria-label="Enviar">${icone('enviar')}<span>Enviar</span></button>
      </form>`}
    </section>`;
  const lista = $('#chat-msgs', caixa);
  let primeira = true;

  function desenhar(msgs) {
    if (primeira) { lista.innerHTML = ''; primeira = false; }
    if (!msgs.length && !lista.children.length) {
      lista.innerHTML = '<p class="chat-vazio">Nenhuma mensagem ainda. Use este espaço para avisar a equipe gestora e combinar as providências.</p>';
      return;
    }
    if (msgs.length) lista.querySelector('.chat-vazio')?.remove();
    const estavaNoFim = lista.scrollHeight - lista.scrollTop - lista.clientHeight < 40;
    for (const m of msgs) {
      ultimo = Math.max(ultimo, m.id);
      lista.insertAdjacentHTML('beforeend', `
        <div class="chat-msg ${m.minha ? 'minha' : ''}">
          <div class="chat-balao"><p>${esc(m.texto)}</p></div>
          <div class="chat-meta">${m.minha ? 'Você' : `${esc(m.usuario_nome)} · ${esc(PERFIS[m.usuario_perfil] || m.usuario_perfil)}`} · ${dataHoraBR(m.criado_em)}</div>
        </div>`);
    }
    if (msgs.length && (estavaNoFim || msgs.some((m) => m.minha))) lista.scrollTop = lista.scrollHeight;
  }

  async function buscar() {
    if (!caixa.isConnected) { clearInterval(timer); return; } // saiu da tela
    if (document.hidden) return;
    try {
      const msgs = await api(`/ocorrencias/${ocorrencia.id}/chat?depois=${ultimo}`);
      desenhar(msgs);
      if (msgs.length) atualizarAvisos(); // atualiza o contador de não lidas no menu
    } catch (e) { if (primeira) lista.innerHTML = `<p class="vazio">${esc(e.message)}</p>`; }
  }

  const form = $('#chat-form', caixa);
  if (form) {
    const enviar = async () => {
      const texto = form.texto.value.trim();
      if (!texto) return;
      const botao = form.querySelector('button');
      botao.disabled = true;
      try {
        await api(`/ocorrencias/${ocorrencia.id}/chat`, { metodo: 'POST', corpo: { texto } });
        form.texto.value = '';
        await buscar();
      } catch (e) { avisarErro(e); }
      finally { botao.disabled = false; form.texto.focus(); }
    };
    form.addEventListener('submit', (ev) => { ev.preventDefault(); enviar(); });
    form.texto.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); enviar(); }
    });
    if (aberto) setTimeout(() => form.texto.focus({ preventScroll: true }), 50);
  }
  buscar();
  timer = setInterval(buscar, 6000);
}
