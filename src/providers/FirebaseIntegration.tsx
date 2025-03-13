import React, { useEffect, useState } from 'react';
import { logger } from '@/core/logger';
import { getFirebaseManager } from '@/lib/firebase/services';
import { initializeAuth } from '@/lib/firebase/auth';
import { firestoreService } from '@/lib/firebase/firestore';

interface FirebaseIntegrationProps {
  children: React.ReactNode;
}

/**
 * Composant qui intègre progressivement les services Firebase
 * dans l'application en mode diagnostic
 */
export const FirebaseIntegration: React.FC<FirebaseIntegrationProps> = ({ children }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        logger.info({
          category: 'FirebaseIntegration',
          message: '🚀 Démarrage de l\'initialisation progressive de Firebase'
        });

        // Étape 1: Initialiser le FirebaseManager (services.ts)
        await getFirebaseManager();
        logger.info({
          category: 'FirebaseIntegration',
          message: '✅ FirebaseManager initialisé avec succès'
        });

        // Étape 2: Initialiser Auth (auth.ts)
        await initializeAuth();
        logger.info({
          category: 'FirebaseIntegration',
          message: '✅ Service Auth initialisé avec succès'
        });

        // Étape 3: Initialiser Firestore (firestore.ts)
        await firestoreService.ensureInitialized();
        logger.info({
          category: 'FirebaseIntegration',
          message: '✅ Service Firestore initialisé avec succès'
        });

        logger.info({
          category: 'FirebaseIntegration',
          message: '🎉 Tous les services Firebase ont été initialisés avec succès'
        });
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        logger.error({
          category: 'FirebaseIntegration',
          message: '❌ Erreur lors de l\'initialisation des services Firebase',
          error: errorObj
        });
        setInitError(errorObj);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeFirebase();

    // Nettoyage lors du démontage du composant
    return () => {
      logger.info({
        category: 'FirebaseIntegration',
        message: 'Nettoyage des ressources Firebase'
      });
    };
  }, []);

  if (isInitializing) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Initialisation des services Firebase...</h2>
        <p>Veuillez patienter pendant le chargement des services.</p>
      </div>
    );
  }

  if (initError) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h2>Erreur d'initialisation</h2>
        <p>Une erreur s'est produite lors de l'initialisation des services Firebase:</p>
        <pre>{initError.message}</pre>
        <p>Consultez la console pour plus de détails.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default FirebaseIntegration;
