import { Auth, getAuth } from 'firebase/auth';
import { app } from '../../config/firebase-init';
import { logger } from '../../utils/firebase-logger';

const LOG_CATEGORY = 'FirebaseAuth';

let _auth: Auth | null = null;

export async function initializeAuth(): Promise<Auth> {
  if (_auth) {
    return _auth;
  }

  try {
    logger.debug(LOG_CATEGORY, { message: '🔐 Initialisation de Firebase Auth' });
    
    // Import dynamique de firebase/auth pour s'assurer que le module est chargé
    await import('firebase/auth');
    
    // Initialiser Auth
    _auth = getAuth(app);
    logger.info(LOG_CATEGORY, { message: '✅ Service Auth initialisé' });
    
    return _auth;
  } catch (error) {
    logger.error(LOG_CATEGORY, { message: '❌ Erreur lors de l\'initialisation de Auth', error });
    throw error;
  }
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    throw new Error('Firebase Auth n\'est pas encore initialisé. Assurez-vous d\'avoir appelé initializeAuth().');
  }
  return _auth;
}
