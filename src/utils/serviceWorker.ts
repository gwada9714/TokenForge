export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        import.meta.env.MODE === 'production' 
          ? '/sw.js'
          : '/dev-sw.js?dev-sw',
        {
          type: import.meta.env.MODE === 'production' ? 'classic' : 'module',
        }
      );

      if (registration.installing) {
        console.log('Service worker installing');
      } else if (registration.waiting) {
        console.log('Service worker installed');
      } else if (registration.active) {
        console.log('Service worker active');
      }
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }
};
