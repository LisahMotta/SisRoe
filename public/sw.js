// sw.js — service worker do SisRoe: recebe as notificações do aparelho (Web Push).
// Não guarda páginas em cache (o sistema sempre busca a versão mais nova).

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { titulo: 'SisRoe', corpo: e.data?.text() }; }
  e.waitUntil(self.registration.showNotification(d.titulo || 'SisRoe', {
    body: d.corpo || '',
    tag: d.tag,
    renotify: !!d.tag,
    icon: '/icons/icone-192.png',
    badge: '/icons/icone-192.png',
    data: { url: d.url || '/' },
  }));
});

// Ao tocar na notificação: abre (ou foca) o SisRoe na ocorrência.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const alvo = new URL(e.notification.data?.url || '/', self.location.origin).href;
  e.waitUntil((async () => {
    const janelas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const j of janelas) {
      if (new URL(j.url).origin === self.location.origin) {
        await j.focus();
        return j.navigate(alvo);
      }
    }
    return self.clients.openWindow(alvo);
  })());
});
