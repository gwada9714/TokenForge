import { app } from '@/config/firebase';
import { getFirebaseAuth } from '@/lib/firebase/auth';
import { firebaseManager } from './services';
import { getFirestore } from 'firebase/firestore';
import { getStorage as getFirebaseStorage } from 'firebase/storage';

// Exporter les services modulaires
// Remarque: nous ne réexportons pas directement les instances car elles doivent
// être initialisées de manière asynchrone via les fonctions get* correspondantes
export { app };
export { firebaseManager as default };

// Fonctions d'accès aux services initialisés
export async function getAuth() {
  return getFirebaseAuth();
}

export function getDb() {
  return getFirestore(app);
}

export function getStorage() {
  return getFirebaseStorage(app);
}
