/**
 * Test manuel pour vérifier l'initialisation et le fonctionnement des services Firebase Auth
 * 
 * Ce fichier contient des fonctions de test qui peuvent être exécutées manuellement
 * pour vérifier que les services Firebase sont correctement initialisés et fonctionnent
 * comme prévu.
 */

import { getFirebaseManager } from '../services';
import { firebaseAuth } from '../auth';
import { logger } from '@/core/logger';

const LOG_CATEGORY = 'AuthTest';

/**
 * Vérifie l'initialisation complète des services Firebase
 */
export async function testFirebaseInitialization() {
  try {
    logger.info({
      category: LOG_CATEGORY,
      message: '🧪 Démarrage du test d\'initialisation Firebase'
    });

    // 1. Vérifier l'initialisation du FirebaseManager
    const firebaseManager = await getFirebaseManager();
    logger.info({
      category: LOG_CATEGORY,
      message: '✅ FirebaseManager correctement initialisé'
    });

    // 2. Vérifier l'initialisation explicite d'Auth
    const auth = await firebaseManager.initAuth();
    logger.info({
      category: LOG_CATEGORY,
      message: '✅ Firebase Auth correctement initialisé via FirebaseManager',
      data: {
        authInitialized: !!auth
      }
    });

    // 3. Vérifier le service d'authentification
    const authService = await firebaseAuth.getAuth();
    logger.info({
      category: LOG_CATEGORY,
      message: '✅ Service d\'authentification correctement initialisé',
      data: {
        authServiceInitialized: !!authService
      }
    });

    // 4. Vérifier l'état de l'utilisateur actuel
    const currentUser = authService.currentUser;
    logger.info({
      category: LOG_CATEGORY,
      message: currentUser 
        ? '👤 Utilisateur actuellement connecté'
        : '👤 Aucun utilisateur connecté',
      data: {
        uid: currentUser?.uid,
        email: currentUser?.email,
        isAnonymous: currentUser?.isAnonymous
      }
    });

    logger.info({
      category: LOG_CATEGORY,
      message: '🎉 Test d\'initialisation Firebase réussi'
    });

    return {
      success: true,
      firebaseManager,
      auth,
      authService,
      currentUser
    };
  } catch (error) {
    logger.error({
      category: LOG_CATEGORY,
      message: '❌ Échec du test d\'initialisation Firebase',
      error: error instanceof Error ? error : new Error(String(error))
    });

    return {
      success: false,
      error
    };
  }
}

/**
 * Teste la connexion anonyme
 */
export async function testAnonymousSignIn() {
  try {
    logger.info({
      category: LOG_CATEGORY,
      message: '🧪 Démarrage du test de connexion anonyme'
    });

    const auth = await firebaseAuth.getAuth();
    
    // Déconnexion préalable si nécessaire
    if (auth.currentUser) {
      await auth.signOut();
      logger.info({
        category: LOG_CATEGORY,
        message: '🚪 Déconnexion de l\'utilisateur actuel effectuée'
      });
    }

    // Connexion anonyme
    const userCredential = await auth.signInAnonymously();
    const user = userCredential.user;

    logger.info({
      category: LOG_CATEGORY,
      message: '✅ Connexion anonyme réussie',
      data: {
        uid: user.uid,
        isAnonymous: user.isAnonymous
      }
    });

    return {
      success: true,
      user
    };
  } catch (error) {
    logger.error({
      category: LOG_CATEGORY,
      message: '❌ Échec de la connexion anonyme',
      error: error instanceof Error ? error : new Error(String(error))
    });

    return {
      success: false,
      error
    };
  }
}

/**
 * Teste la déconnexion
 */
export async function testSignOut() {
  try {
    logger.info({
      category: LOG_CATEGORY,
      message: '🧪 Démarrage du test de déconnexion'
    });

    const auth = await firebaseAuth.getAuth();
    
    if (!auth.currentUser) {
      logger.info({
        category: LOG_CATEGORY,
        message: '⚠️ Aucun utilisateur connecté, impossible de tester la déconnexion'
      });
      return {
        success: false,
        reason: 'no-user-signed-in'
      };
    }

    // Déconnexion
    await auth.signOut();
    
    logger.info({
      category: LOG_CATEGORY,
      message: '✅ Déconnexion réussie'
    });

    return {
      success: true
    };
  } catch (error) {
    logger.error({
      category: LOG_CATEGORY,
      message: '❌ Échec de la déconnexion',
      error: error instanceof Error ? error : new Error(String(error))
    });

    return {
      success: false,
      error
    };
  }
}

// Export des fonctions de test
export const AuthTest = {
  testFirebaseInitialization,
  testAnonymousSignIn,
  testSignOut
};

export default AuthTest;
