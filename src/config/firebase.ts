import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyAWCGLD1B4aTGRdasA-Xa-anx4EjE0ZAA0",
  authDomain: "tokenforge-4028e.firebaseapp.com",
  projectId: "tokenforge-4028e",
  storageBucket: "tokenforge-4028e.firebasestorage.app",
  messagingSenderId: "351014652393",
  appId: "1:351014465239:web:ca7600eae9b1c32a22e378",
  measurementId: "G-VDPGL09402"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);
