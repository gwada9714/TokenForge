import { logger } from '@/utils/logger';
import { firebaseManager } from './services';

export const initializeFirebase = async () => {
    try {
        logger.debug('FirebaseInit', 'Démarrage initialisation Firebase');
        // Initialisation via le manager unique
        await firebaseManager.getAuth();
        logger.info('FirebaseInit', 'Firebase initialisé avec succès');
        return true;
    } catch (error) {
        logger.error('FirebaseInit', error instanceof Error ? error.message : String(error));
        throw error;
    }
};
