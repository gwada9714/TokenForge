// Force le chargement du module auth avant tout
import 'firebase/auth';

// Polyfills
import './polyfills';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { logger } from './utils/firebase-logger';
import App from './App';
import { ErrorMonitoring } from './utils/error-monitoring';
import { SessionService } from './features/auth/services/sessionService';
import { store } from './store';
import { Provider } from 'react-redux';
import { getFirebaseManager } from './lib/firebase/services';
import { initializeAuth } from './lib/firebase/auth';
import { serviceManager } from '@/core/services/ServiceManager';
import { firebaseInitializer } from '@/lib/firebase/initialization';

const LOG_CATEGORY = 'Application';

// Vérification de l'environnement
if (typeof window !== 'undefined') {
  const startApp = async () => {
    try {
      logger.info(LOG_CATEGORY, { message: 'Chargement de l\'application' });
      logger.info(LOG_CATEGORY, { message: '🚀 Démarrage de l\'application TokenForge' });

      // Attendre que le DOM soit complètement chargé
      await new Promise<void>((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', () => resolve());
        }
      });

      logger.debug(LOG_CATEGORY, { message: '📝 Vérification des variables d\'environnement' });
      const requiredEnvVars = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID'
      ];

      requiredEnvVars.forEach(varName => {
        if (!import.meta.env[varName]) {
          const error = `Variable d'environnement manquante: ${varName}`;
          logger.error(LOG_CATEGORY, { message: '❌ ' + error });
          throw new Error(error);
        }
      });

      logger.info(LOG_CATEGORY, { message: '✅ Variables d\'environnement validées' });

      // Initialisation du monitoring des erreurs
      ErrorMonitoring.getInstance().initialize();

      // Initialisation du service de session
      logger.debug(LOG_CATEGORY, { message: '🔐 Initialisation du service de session' });
      SessionService.getInstance().startSession();
      logger.info(LOG_CATEGORY, { message: '✅ Service de session initialisé' });

      // Initialisation Firebase avant le rendu
      logger.debug(LOG_CATEGORY, { message: '🔄 Initialisation de Firebase' });
      
      // Initialiser Auth en premier
      await initializeAuth();
      
      // Puis initialiser les autres services Firebase
      await getFirebaseManager();
      
      logger.info(LOG_CATEGORY, { message: '✅ Firebase initialisé avec succès' });

      logger.info(LOG_CATEGORY, { message: 'Rendu de l\'application' });
      logger.info(LOG_CATEGORY, { message: '🎨 Rendu de l\'application' });
      const container = document.getElementById('root');
      if (!container) {
        throw new Error('Container #root non trouvé dans le DOM');
      }

      const root = createRoot(container);
      root.render(
        <StrictMode>
          <Provider store={store}>
            <App />
          </Provider>
        </StrictMode>
      );

      logger.info(LOG_CATEGORY, { message: '🎉 Application démarrée avec succès' });
    } catch (error) {
      logger.error(LOG_CATEGORY, { 
        message: '❌ Erreur lors de l\'initialisation de l\'application',
        error
      });
      
      // Afficher une erreur utilisateur
      const errorContainer = document.getElementById('root');
      if (errorContainer) {
        errorContainer.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            text-align: center;
            font-family: system-ui, -apple-system, sans-serif;
            color: #ff4444;
            padding: 20px;
          ">
            <h1>Erreur de chargement</h1>
            <p>Une erreur est survenue lors du chargement de l'application.</p>
            <p>Veuillez rafraîchir la page ou contacter le support si le problème persiste.</p>
          </div>
        `;
      }
    }
  };

  // Démarrer l'application
  startApp();
} else {
  console.error('Environnement non supporté: window n\'est pas défini');
}

async function initializeApp() {
  try {
    // Register core services
    serviceManager.registerService(firebaseInitializer);
    
    // Initialize all services
    await serviceManager.initialize();

    logger.info({
      category: 'App',
      message: 'Application initialized successfully'
    });
  } catch (error) {
    logger.error({
      category: 'App',
      message: 'Application initialization failed',
      error: error as Error
    });
  }
}

initializeApp();