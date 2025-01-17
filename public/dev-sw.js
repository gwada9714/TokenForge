// Service Worker pour le mode développement
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Gestion des requêtes avec CORS
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'cors') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cloner la réponse car elle ne peut être utilisée qu'une fois
          const clonedResponse = response.clone();
          
          // Ajouter les headers CORS nécessaires
          const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          };
          
          // Créer une nouvelle réponse avec les headers CORS
          const corsResponse = new Response(clonedResponse.body, {
            status: clonedResponse.status,
            statusText: clonedResponse.statusText,
            headers: new Headers({
              ...Object.fromEntries(clonedResponse.headers),
              ...corsHeaders
            })
          });
          
          return corsResponse;
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
