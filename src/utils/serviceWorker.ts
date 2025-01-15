export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.workbox !== undefined) {
    const wb = window.workbox;
    
    // Add event listeners to handle any notifications and updates
    wb.addEventListener('installed', (event: any) => {
      console.log(`Event ${event.type} is triggered.`);
      console.log(event);
    });

    wb.addEventListener('controlling', (event: any) => {
      console.log(`Event ${event.type} is triggered.`);
      console.log(event);
    });

    wb.addEventListener('activated', (event: any) => {
      console.log(`Event ${event.type} is triggered.`);
      console.log(event);
    });

    // Register the service worker after event listeners are added
    wb.register();
  }
}
