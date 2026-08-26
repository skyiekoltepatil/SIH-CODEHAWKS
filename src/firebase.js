// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC82BwKZz36prRrDiRAAeJgc1rnXMt5QEI",
  authDomain: "sih-codehawks.firebaseapp.com",
  projectId: "sih-codehawks",
  storageBucket: "sih-codehawks.firebasestorage.app",
  messagingSenderId: "911165781838",
  appId: "1:911165781838:web:de85e971501445953dd01f",
  measurementId: "G-ZSMKR549NQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// const analytics = getAnalytics(app); // Disabling analytics for now to avoid SSR/AdBlocker errors

export { app, auth, db };
