const CACHE_NAME = 'tokenforge-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json'
];

// Helper to check if a request should be handled
const shouldHandleRequest = (request) => {
  const url = new URL(request.url);
  
  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return false;
  }

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return false;
  }

  // Only handle GET requests
  if (request.method !== 'GET') {
    return false;
  }

  return true;
};

// Helper to create a network-first response with timeout
const timeoutResponse = () => {
  return new Response('Network timeout occurred', {
    status: 408,
    headers: new Headers({
      'Content-Type': 'text/plain'
    })
  });
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        );
      })
      .catch(error => {
        console.error('Cache cleanup failed:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip if request shouldn't be handled
  if (!shouldHandleRequest(event.request)) {
    return;
  }

  event.respondWith(
    Promise.race([
      fetch(event.request.clone())
        .then(response => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the response
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache)
                .catch(error => {
                  console.error('Cache put failed:', error);
                });
            })
            .catch(error => {
              console.error('Cache open failed:', error);
            });

          return response;
        })
        .catch(() => {
          // On network failure, try cache
          return caches.match(event.request)
            .then(response => {
              if (response) {
                return response;
              }
              // If not in cache, return a fallback
              return timeoutResponse();
            })
            .catch(() => timeoutResponse());
        }),
      // Timeout after 10 seconds
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), 10000);
      }).catch(() => timeoutResponse())
    ]).catch(() => timeoutResponse())
  );
});
