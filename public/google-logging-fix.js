// Polyfill spécifique pour google-logging-utils
(function() {
  console.log('Initialisation du polyfill pour google-logging-utils');

  // Vérifier si le polyfill global a déjà été appliqué
  if (typeof window !== 'undefined' && window.process && window.process.stdout && window.process.stdout.isTTY === false) {
    console.log('process.stdout.isTTY déjà défini par le polyfill global');
  } else {
    // Vérifier si process.stdout.isTTY est défini
    if (typeof window !== 'undefined' && window.process && window.process.stdout) {
      if (typeof window.process.stdout.isTTY === 'undefined') {
        try {
          Object.defineProperty(window.process.stdout, 'isTTY', {
            value: false,
            writable: false,
            configurable: false,
            enumerable: true
          });
          console.log('process.stdout.isTTY défini avec succès dans google-logging-fix.js');
        } catch (e) {
          console.warn('Impossible de définir process.stdout.isTTY:', e);
          // Fallback: essayer d'assigner directement
          try {
            window.process.stdout.isTTY = false;
          } catch (e2) {
            console.error('Impossible d\'assigner process.stdout.isTTY:', e2);
          }
        }
      }
    }
  }

  // Patch spécifique pour google-logging-utils
  if (typeof window !== 'undefined') {
    // Patch pour _Colours.isEnabled si la classe existe déjà
    if (window._Colours && window._Colours.prototype && window._Colours.prototype.isEnabled) {
      const originalIsEnabled = window._Colours.prototype.isEnabled;
      window._Colours.prototype.isEnabled = function() {
        try {
          return originalIsEnabled.apply(this);
        } catch (error) {
          // Si l'erreur est liée à process.stdout.isTTY, retourner false
          if (error instanceof TypeError && error.message.includes('isTTY')) {
            console.warn('Erreur isTTY interceptée dans _Colours.isEnabled:', error.message);
            return false;
          }
          throw error;
        }
      };
      console.log('Patch appliqué à _Colours.isEnabled');
    }
  }

  console.log('Polyfill pour google-logging-utils initialisé avec succès');
})();
