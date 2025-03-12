// Polyfills
import './polyfills';

// Styles
import './index.css';

// React imports
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

// Firebase imports
import 'firebase/auth';
import { firebaseAuth } from './lib/firebase/auth';
import { getFirebaseManager } from './lib/firebase/services';

// App imports
import App from './App';
import { store } from './store';
import { logger } from './utils/firebase-logger';
import { ErrorMonitoring } from './utils/error-monitoring';
import { SessionService } from './services/session/sessionService';
import { serviceManager } from '@/core/services/ServiceManager';
import { firebaseInitializer } from '@/lib/firebase/initialization';

const LOG_CATEGORY = 'Application';

async function initializeServices() {
  try {
    // 1. Initialiser Firebase Manager
    const firebaseManager = await getFirebaseManager();
    logger.info({
      category: 'Firebase',
      message: 'Firebase core services initialized'
    });
    
    // 2. Initialiser Auth explicitement en utilisant la méthode directe
    // Cette approche évite les dépendances circulaires
    await firebaseManager.initAuth();
    logger.info({
      category: 'Firebase',
      message: 'Firebase Auth est complètement initialisé'
    });
    
    // 3. Initialiser le service d'authentification qui utilise Firebase Auth
    await firebaseAuth.getAuth();
    logger.info({
      category: 'Firebase',
      message: 'FirebaseAuth service est prêt à être utilisé'
    });
    
    // 4. Initialiser les autres services qui peuvent dépendre de Auth
    serviceManager.registerService(firebaseInitializer);
    await serviceManager.initialize();

    // 5. Initialiser le monitoring d'erreur
    ErrorMonitoring.getInstance().initialize();

    // 6. Initialiser la session en dernier
    const sessionService = SessionService.getInstance();
    await sessionService.startSession();

    logger.info({
      category: LOG_CATEGORY,
      message: 'Services initialized successfully'
    });
  } catch (error) {
    logger.error({
      category: LOG_CATEGORY,
      message: '❌ Services initialization failed',
      error: error as Error
    });
    throw error;
  }
}

async function startApp() {
  try {
    logger.info({ category: LOG_CATEGORY, message: '🚀 Starting TokenForge application' });

    // Validate environment variables
    const requiredEnvVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID'
    ];

    requiredEnvVars.forEach(varName => {
      if (!import.meta.env[varName]) {
        throw new Error(`Missing environment variable: ${varName}`);
      }
    });

    // Initialize all services
    await initializeServices();

    // Render the application
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Container #root not found in DOM');
    }

    const root = createRoot(container);
    root.render(
      <StrictMode>
        <Provider store={store}>
          <App />
        </Provider>
      </StrictMode>
    );

    logger.info({ category: LOG_CATEGORY, message: '🎉 Application started successfully' });
  } catch (error) {
    logger.error({ 
      category: LOG_CATEGORY,
      message: '❌ Application initialization failed',
      error: error as Error
    });
    
    // Display user-friendly error
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
          <h1>Oops! Une erreur est survenue</h1>
          <p>Nous rencontrons un problème au démarrage de l'application. Veuillez réessayer plus tard.</p>
          <p style="font-size: 0.8em; margin-top: 20px;">Détails techniques: ${(error as Error).message}</p>
        </div>
      `;
    }
  }
}

// Start the application
startApp();