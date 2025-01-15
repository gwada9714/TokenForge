import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSvAWCGLD1B4aTGRdasA-Xa-anx4E1E0ZAA0",
  authDomain: "tokenforge-4028e.firebaseapp.com",
  projectId: "tokenforge-4028e",
  storageBucket: "tokenforge-4028e.firebasestorage.app",
  messagingSenderId: "351014652393",
  appId: "1:351014652393:web:0a8b54b03a7293bf22e378",
  measurementId: "G-E79XWLF0XC"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);
