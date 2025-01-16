import { Workbox } from 'workbox-window';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/sw.ts');

    wb.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        console.log('Une nouvelle version est disponible');
      } else {
        console.log('Service worker installé pour la première fois');
      }
    });

    wb.addEventListener('activated', () => {
      console.log('Service worker active');
    });

    wb.addEventListener('controlling', () => {
      console.log('Service worker contrôle la page');
    });

    wb.register().catch((error) => {
      console.error('Erreur lors de l\'enregistrement du service worker:', error);
    });

    return wb;
  }
  return null;
}
