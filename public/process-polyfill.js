// Polyfill pour process.stdout et process.stderr
(function() {
  console.log('Initialisation du polyfill process.stdout.isTTY');
  
  // Créer un objet process s'il n'existe pas
  if (typeof window.process === 'undefined') {
    window.process = {};
  }
  
  // Créer stdout s'il n'existe pas
  if (!window.process.stdout) {
    Object.defineProperty(window.process, 'stdout', {
      value: {
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
      },
      writable: false,
      configurable: false,
      enumerable: true
    });
  } else if (window.process.stdout && typeof window.process.stdout.isTTY === 'undefined') {
    // Si stdout existe mais n'a pas la propriété isTTY, l'ajouter
    Object.defineProperty(window.process.stdout, 'isTTY', {
      value: false,
      writable: false,
      configurable: false,
      enumerable: true
    });
  }
  
  // Créer stderr s'il n'existe pas
  if (!window.process.stderr) {
    Object.defineProperty(window.process, 'stderr', {
      value: {
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
      },
      writable: false,
      configurable: false,
      enumerable: true
    });
  } else if (window.process.stderr && typeof window.process.stderr.isTTY === 'undefined') {
    // Si stderr existe mais n'a pas la propriété isTTY, l'ajouter
    Object.defineProperty(window.process.stderr, 'isTTY', {
      value: false,
      writable: false,
      configurable: false,
      enumerable: true
    });
  }
  
  // Intercepter les erreurs liées à isTTY
  window.addEventListener('error', function(event) {
    if (event.message && event.message.includes('isTTY')) {
      console.warn('Erreur isTTY interceptée:', event.message);
      event.preventDefault();
      return true;
    }
  }, true);
  
  console.log('Polyfill process.stdout.isTTY initialisé avec succès');
})();
