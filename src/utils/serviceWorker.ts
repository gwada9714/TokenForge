export const registerServiceWorker = async () => {
  // Désactiver et nettoyer le service worker en développement
  if (import.meta.env.DEV) {
    console.log('Mode développement détecté - Désactivation du service worker');
    
    if ('serviceWorker' in navigator) {
      try {
        // Récupérer tous les service workers enregistrés
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        // Désinscrire chaque service worker
        for (const registration of registrations) {
          await registration.unregister();
          console.log('Service worker désinscrit avec succès');
        }
      } catch (error) {
        console.error('Erreur lors de la désinscription du service worker:', error);
      }
    }
    return;
  }

  // En production, enregistrer le service worker normalement
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        type: 'classic',
        scope: '/'
      });

      if (registration.installing) {
        console.log('Service worker en cours d\'installation');
      } else if (registration.waiting) {
        console.log('Service worker installé');
      } else if (registration.active) {
        console.log('Service worker actif');
      }
    } catch (error) {
      console.error('Échec de l\'enregistrement du service worker:', error);
    }
  }
};
