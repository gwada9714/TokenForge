export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.ts')
        .then((registration) => {
          console.log('ServiceWorker registration successful');
          
          registration.addEventListener('statechange', (e) => {
            console.log('ServiceWorker state changed:', e);
          });
        })
        .catch((error) => {
          console.error('ServiceWorker registration failed:', error);
        });
    });
  }
}
