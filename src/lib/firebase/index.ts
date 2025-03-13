// Export des services Firebase conformément à la structure modulaire
export { getFirebaseManager } from './services';
export { 
  getFirebaseAuth, 
  firebaseAuth, 
  initializeAuth 
} from './auth';
export { firestoreService } from './firestore';
export { addCommit, getUserCommits, deleteCommit, updateCommit } from './commits';

// Export du module d'optimisation Firestore
export {
  getDocumentOptimized,
  queryOptimized,
  invalidateDocumentCache,
  invalidateCollectionCache,
  clearCache,
  unsubscribeAll
} from './firestore-optimized';

// Déprécié: Ces exports sont maintenus pour la compatibilité 
// mais devraient être remplacés par firebaseAuth depuis './auth'
// @deprecated
export { firebaseAuth as authService } from './auth';
export { firebaseAuth as legacyFirebaseAuth } from './auth';
export { firebaseService } from '@/features/auth/services/firebaseService';
