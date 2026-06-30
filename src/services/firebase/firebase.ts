import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const app = (() => {
  try {
    console.log('Firebase API Key 확인:', import.meta.env.VITE_FIREBASE_API_KEY);
    
    if (!firebaseConfig.apiKey) throw new Error("Missing API Key");
    const a = initializeApp(firebaseConfig);
    console.log('✅ Firebase Connected');
    return a;
  } catch (error) {
    console.error('Firebase Connection Failed');
    console.error(error);
    return null;
  }
})();

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
