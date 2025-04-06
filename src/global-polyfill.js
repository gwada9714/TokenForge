// Ce fichier est chargé avant tout le reste de l'application
// Il définit les polyfills essentiels qui doivent être disponibles immédiatement

(function() {
  console.log('Initialisation des polyfills globaux');

  // Fonction pour définir process.stdout.isTTY et process.stderr.isTTY
  function defineProcessStreams() {
    // Vérifier si window existe
    if (typeof window === 'undefined') return;

    // Créer process s'il n'existe pas
    if (typeof window.process === 'undefined') {
      window.process = {};
    }

    // Créer un objet stdout avec isTTY défini à false
    const stdout = {
      isTTY: false,
      columns: 80,
      rows: 24,
      write: function() { return true; },
      on: function() { return this; },
      once: function() { return this; },
      emit: function() { return false; },
      addListener: function() { return this; },
      removeListener: function() { return this; },
      pipe: function() { return this; }
    };

    // Créer un objet stderr avec isTTY défini à false
    const stderr = {
      isTTY: false,
      columns: 80,
      rows: 24,
      write: function() { return true; },
      on: function() { return this; },
      once: function() { return this; },
      emit: function() { return false; },
      addListener: function() { return this; },
      removeListener: function() { return this; },
      pipe: function() { return this; }
    };

    // Définir process.stdout de manière non modifiable
    if (!window.process.stdout) {
      try {
        Object.defineProperty(window.process, 'stdout', {
          value: stdout,
          writable: false,
          configurable: false,
          enumerable: true
        });
      } catch (e) {
        console.warn('Impossible de définir process.stdout:', e);
        // Fallback: essayer d'assigner directement
        try {
          window.process.stdout = stdout;
        } catch (e2) {
          console.error('Impossible d\'assigner process.stdout:', e2);
        }
      }
    } else if (window.process.stdout && typeof window.process.stdout.isTTY === 'undefined') {
      // Si stdout existe mais n'a pas la propriété isTTY, essayer de l'ajouter
      try {
        Object.defineProperty(window.process.stdout, 'isTTY', {
          value: false,
          writable: false,
          configurable: false,
          enumerable: true
        });
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

    // Définir process.stderr de manière non modifiable
    if (!window.process.stderr) {
      try {
        Object.defineProperty(window.process, 'stderr', {
          value: stderr,
          writable: false,
          configurable: false,
          enumerable: true
        });
      } catch (e) {
        console.warn('Impossible de définir process.stderr:', e);
        // Fallback: essayer d'assigner directement
        try {
          window.process.stderr = stderr;
        } catch (e2) {
          console.error('Impossible d\'assigner process.stderr:', e2);
        }
      }
    } else if (window.process.stderr && typeof window.process.stderr.isTTY === 'undefined') {
      // Si stderr existe mais n'a pas la propriété isTTY, essayer de l'ajouter
      try {
        Object.defineProperty(window.process.stderr, 'isTTY', {
          value: false,
          writable: false,
          configurable: false,
          enumerable: true
        });
      } catch (e) {
        console.warn('Impossible de définir process.stderr.isTTY:', e);
        // Fallback: essayer d'assigner directement
        try {
          window.process.stderr.isTTY = false;
        } catch (e2) {
          console.error('Impossible d\'assigner process.stderr.isTTY:', e2);
        }
      }
    }
  }

  // Appliquer le polyfill pour process.stdout.isTTY et process.stderr.isTTY
  defineProcessStreams();

  // Fonction pour définir les polyfills de base
  function defineBasicPolyfills() {
    // Vérifier si window existe
    if (typeof window === 'undefined') return;

    // Polyfill pour Buffer
    if (typeof window.Buffer === 'undefined') {
      window.Buffer = {
        from: function(data, encoding) {
          if (typeof data === 'string') {
            const encoder = new TextEncoder();
            return encoder.encode(data);
          }
          return new Uint8Array(data);
        },
        isBuffer: function(obj) {
          return obj instanceof Uint8Array;
        },
        alloc: function(size) {
          return new Uint8Array(size);
        }
      };
    }

    // Polyfill pour crypto
    if (typeof window.crypto === 'undefined' || !window.crypto.subtle) {
      window.crypto = window.crypto || {};
      window.crypto.subtle = window.crypto.subtle || {};

      if (!window.crypto.getRandomValues) {
        window.crypto.getRandomValues = function(arr) {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
          }
          return arr;
        };
      }
    }

    // Polyfill pour global
    if (typeof window.global === 'undefined') {
      window.global = window;
    }
  }

  // Fonction pour intercepter les erreurs liées à isTTY
  function setupErrorHandlers() {
    // Vérifier si window existe
    if (typeof window === 'undefined') return;

    // Intercepter les erreurs liées à isTTY
    window.addEventListener('error', function(event) {
      if (event.message && event.message.includes('isTTY')) {
        console.warn('Erreur isTTY interceptée dans global-polyfill:', event.message);
        event.preventDefault();
        return true;
      }
    }, true);

    // Intercepter les rejets de promesse non gérés
    window.addEventListener('unhandledrejection', function(event) {
      if (event.reason && typeof event.reason.message === 'string' && event.reason.message.includes('isTTY')) {
        console.warn('Rejet de promesse lié à isTTY intercepté:', event.reason.message);
        event.preventDefault();
        return true;
      }
    }, true);
  }

  // Appliquer tous les polyfills
  defineProcessStreams();
  defineBasicPolyfills();
  setupErrorHandlers();

  console.log('Polyfills globaux initialisés avec succès');
})();
