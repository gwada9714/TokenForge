// Service Worker pour le mode développement
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Gestion des requêtes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorer les requêtes chrome-extension
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Ignorer les requêtes vers Google Fonts
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    return;
  }

  // Pour les requêtes WalletConnect
  if (url.hostname.includes('walletconnect')) {
    event.respondWith(
      fetch(event.request)
        .catch(error => {
          console.error('WalletConnect fetch error:', error);
          return new Response(null, {
            status: 500,
            statusText: 'WalletConnect Error'
          });
        })
    );
    return;
  }

  // Pour les autres requêtes CORS
  if (event.request.mode === 'cors') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clonedResponse = response.clone();
          
          const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          };
          
          return new Response(clonedResponse.body, {
            status: clonedResponse.status,
            statusText: clonedResponse.statusText,
            headers: new Headers({
              ...Object.fromEntries(clonedResponse.headers),
              ...corsHeaders
            })
          });
        })
        .catch(error => {
          console.error('Fetch error:', error);
          return new Response(null, {
            status: 500,
            statusText: 'Service Worker Fetch Error'
          });
        })
    );
  }
});
