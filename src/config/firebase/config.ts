import { FirebaseOptions } from 'firebase/app';

export const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

if (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
  firebaseConfig.measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;
}

export const firebaseSettings = {
  sessionPersistence: true,
  emulatorMode: process.env.NODE_ENV === 'development',
  authEmulatorHost: 'http://localhost:9099',
  firestoreEmulatorHost: 'localhost:8080',
  functionsEmulatorHost: 'localhost:5001'
};

export default firebaseConfig;
