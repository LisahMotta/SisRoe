// versao.js — avisa quando uma nova versão do SisRoe foi publicada.
//
// O SisRoe troca de tela sem recarregar a página. Quem estava com ele aberto durante uma
// atualização continuaria usando a versão antiga (menus e permissões desatualizados).
// A cada minuto (com a aba visível) a página compara a versão do servidor com a que
// carregou e, se mudou, mostra um aviso com o botão "Atualizar".
let carregada = null;
let avisado = false;

async function versaoDoServidor() {
  const r = await fetch('/api/config', { cache: 'no-store' });
  if (!r.ok) throw new Error('sem resposta');
  return (await r.json()).versao || null;
}

function mostrarAviso() {
  if (avisado) return;
  avisado = true;
  const el = document.createElement('div');
  el.className = 'aviso-versao';
  el.setAttribute('role', 'alert');
  el.innerHTML = `<span><b>Nova versão do SisRoe disponível.</b> Atualize para ver as novidades e as correções.</span>
    <button class="btn btn-primario btn-peq" type="button">Atualizar agora</button>`;
  el.querySelector('button').addEventListener('click', () => location.reload());
  document.body.append(el);
  document.body.classList.add('tem-aviso-versao');
}

async function conferir() {
  if (document.hidden || avisado) return;
  try {
    const v = await versaoDoServidor();
    if (!v) return;
    if (carregada === null) carregada = v;
    else if (v !== carregada) mostrarAviso();
  } catch { /* sem conexão: tenta na próxima volta */ }
}

export function iniciarVerificacaoVersao() {
  conferir();
  setInterval(conferir, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) conferir(); });
}
