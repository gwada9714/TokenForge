/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { getCSPDirectives } from './security/csp';

clientsClaim();
self.skipWaiting();

// Précache des ressources statiques
precacheAndRoute(self.__WB_MANIFEST);

// Liste des domaines WalletConnect
const walletConnectDomains = [
  'walletconnect.org',
  'walletconnect.com',
  'explorer-api.walletconnect.com',
  'pulse.walletconnect.org',
  'verify.walletconnect.org',
  'verify.walletconnect.com'
];

// Cache pour les ressources statiques
registerRoute(
  ({ request }) => 
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

// Gestion des erreurs
self.addEventListener('error', (event) => {
  // Ignorer les erreurs des extensions Chrome
  if (event.filename?.startsWith('chrome-extension://')) {
    event.preventDefault();
    return;
  }

  // Log détaillé des violations CSP
  if (event.message.includes('Content Security Policy')) {
    console.error('CSP Violation:', {
      violatedDirective: event.message,
      sourceFile: event.filename,
      lineNumber: event.lineno,
      timestamp: new Date().toISOString()
    });
  } else {
    console.error('Service Worker error:', event.error);
  }
});

// Écoute spécifique des violations CSP
self.addEventListener('securitypolicyviolation', (event) => {
  console.error('CSP Violation:', {
    blockedURI: event.blockedURI,
    violatedDirective: event.violatedDirective,
    originalPolicy: event.originalPolicy,
    disposition: event.disposition,
    timestamp: new Date().toISOString()
  });
});

// Gestion des requêtes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorer les requêtes chrome-extension
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Gestion spéciale pour WalletConnect
  if (walletConnectDomains.some(domain => url.hostname.includes(domain))) {
    event.respondWith(
      fetch(event.request, {
        mode: 'cors',
        credentials: 'omit'
      })
      .catch(error => {
        console.error('WalletConnect fetch error:', error);
        return new Response(null, {
          status: 200,
          headers: new Headers({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          })
        });
      })
    );
    return;
  }

  // Pour les autres requêtes
  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return new Response('', {
            status: 200,
            headers: new Headers({
              'Content-Type': event.request.headers.get('Content-Type') || 'text/plain',
              'Access-Control-Allow-Origin': '*'
            })
          });
        })
    );
  }

  // Ajoute les headers CSP à toutes les réponses
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const response = await fetch(event.request);
        const cspConfig = await getCSPDirectives();
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Content-Security-Policy', cspConfig.directives.join('; '));
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
      })()
    );
  }
});
