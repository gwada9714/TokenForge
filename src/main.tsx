// Polyfills
import './polyfills';
import { app, auth } from './config/firebase-init';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { logger, LogLevel } from './utils/firebase-logger';
import App from './App';

// Vérification de l'environnement
if (typeof window !== 'undefined') {
  const startApp = async () => {
    try {
      // Attendre que le DOM soit complètement chargé
      await new Promise<void>((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', () => resolve());
        }
      });

      logger.log(LogLevel.INFO, 'Chargement de l\'application');

      logger.log(LogLevel.INFO, 'Rendu de l\'application');
      const container = document.getElementById('root');
      if (!container) {
        throw new Error('Container #root non trouvé dans le DOM');
      }

      const root = createRoot(container);
      root.render(
        <StrictMode>
          <App />
        </StrictMode>
      );

      logger.log(LogLevel.INFO, 'Application initialisée avec succès');
    } catch (error) {
      logger.log(LogLevel.ERROR, 'Erreur fatale lors de l\'initialisation:', error);
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