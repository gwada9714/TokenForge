/// <reference lib="webworker" />
/// <reference lib="es2017" />

// @ts-ignore
import { precacheAndRoute } from 'workbox-precaching/precacheAndRoute';
// @ts-ignore
import { registerRoute } from 'workbox-routing/registerRoute';
// @ts-ignore
import { StaleWhileRevalidate } from 'workbox-strategies/StaleWhileRevalidate';

declare const self: ServiceWorkerGlobalScope;
declare const __WB_MANIFEST: Array<{
  revision: string | null;
  url: string;
}>;

// Précache tous les assets générés par Vite
precacheAndRoute(__WB_MANIFEST);

// Cache les requêtes d'API avec une stratégie StaleWhileRevalidate
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache'
  })
);

// Gestion des mises à jour du service worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
