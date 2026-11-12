// push.js — notificações do sistema (Web Push) para celular e computador.
//
// Para ligar, defina as variáveis de ambiente VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY.
// Gere o par de chaves uma vez com:   npx web-push generate-vapid-keys
// Sem as chaves, as notificações do sistema ficam desligadas e o SisRoe continua
// avisando por pop-up dentro da própria página.
//
// Privacidade (ECA/LGPD): a notificação aparece na tela bloqueada do aparelho, então
// o texto NÃO leva nome de estudante — só número, tipo e turma da ocorrência.
import webpush from 'web-push';
import * as db from './db.js';

const PUB = process.env.VAPID_PUBLIC_KEY || '';
const PRIV = process.env.VAPID_PRIVATE_KEY || '';
export const pushAtivo = !!(PUB && PRIV);
if (pushAtivo) {
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:sisroe@example.org', PUB, PRIV);
}
export const chavePublica = () => PUB;

/**
 * Envia uma notificação para os usuários indicados (mesma escola).
 * Espera o envio terminar (em hospedagem serverless a função congela após responder),
 * mas nunca demora mais que ~4 s nem derruba a requisição em caso de falha.
 */
export async function notificar(escolaId, usuarioIds, { titulo, corpo, url, tag }) {
  if (!pushAtivo || !usuarioIds.length) return;
  const ids = [...new Set(usuarioIds)];
  const inscricoes = await db.all(
    `SELECT id, endpoint, p256dh, auth FROM push_inscricoes
     WHERE escola_id = ? AND usuario_id IN (${ids.map(() => '?').join(',')})`,
    [escolaId, ...ids]);
  const payload = JSON.stringify({ titulo, corpo, url, tag });
  const envios = inscricoes.map(async (i) => {
    try {
      await webpush.sendNotification({ endpoint: i.endpoint, keys: { p256dh: i.p256dh, auth: i.auth } }, payload, { TTL: 3600 });
    } catch (e) {
      // 404/410: o aparelho cancelou a inscrição — remove do banco.
      if (e.statusCode === 404 || e.statusCode === 410) {
        await db.run('DELETE FROM push_inscricoes WHERE id = ?', [i.id]).catch(() => {});
      } else {
        console.warn('[push] falha ao enviar:', e.statusCode || e.message);
      }
    }
  });
  await Promise.race([Promise.allSettled(envios), new Promise((ok) => setTimeout(ok, 4000))]);
}

/** IDs da equipe gestora ativa da escola (exceto quem disparou a ação). */
export async function idsGestao(escolaId, excetoId) {
  const r = await db.all(
    "SELECT id FROM usuarios WHERE escola_id = ? AND ativo = 1 AND perfil IN ('poc','coordenador','vice','diretor') AND id <> ?",
    [escolaId, excetoId ?? 0]);
  return r.map((x) => x.id);
}
