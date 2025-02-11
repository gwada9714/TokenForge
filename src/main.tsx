// Polyfills
import './polyfills';

// Vérification de l'environnement
if (typeof window !== 'undefined') {
  // S'assurer que les polyfills sont chargés avant tout
  const ensurePolyfills = async () => {
    try {
      // Attendre que les polyfills soient prêts
      await Promise.all([
        import('buffer').then(({ Buffer }) => {
          window.Buffer = Buffer;
        }),
        import('process').then((process) => {
          window.process = process;
        })
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des polyfills:', error);
    }
  };

  // Initialiser les polyfills avant de démarrer l'application
  ensurePolyfills().then(() => {
    import('./App').then(({ default: App }) => {
      import('react-dom/client').then(({ createRoot }) => {
        import('./providers/Providers').then(({ default: Providers }) => {
          import('react').then(({ StrictMode }) => {
            const container = document.getElementById('root');
            if (container) {
              const root = createRoot(container);
              root.render(
                <StrictMode>
                  <Providers>
                    <App />
                  </Providers>
                </StrictMode>
              );
            }
          });
        });
      });
    });
  });
} else {
  console.error('Environnement non supporté: window n\'est pas défini');
}