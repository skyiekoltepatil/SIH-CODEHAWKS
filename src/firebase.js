// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Web app's Firebase configuration loaded from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase and App Check before accessing Firebase services.
const app = initializeApp(firebaseConfig);

const isLocalHost =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const auth = getAuth(app);
// Initialize Firestore with offline persistence enabled
const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});
const storage = getStorage(app);
const functions = getFunctions(app);

// Connect to local emulator if running locally
if (isLocalHost) {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

export { app, auth, db, storage, functions };
