// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
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
const functions = getFunctions(app);

// Connect to local emulator if running locally
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

// const analytics = getAnalytics(app); // Disabling analytics for now to avoid SSR/AdBlocker errors

// Initialize App Check (using reCAPTCHA Enterprise)
let appCheck;
const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LehXJotAAAAAMmJv8AOo39KRWH1ilotOzzzO_Iy";

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // Enable the debug token for localhost so Firebase accepts requests
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = "99911826-0CC2-4C06-A3AE-992E5554F355";
}

try {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(recaptchaKey),
    isTokenAutoRefreshEnabled: true
  });
  console.log("App Check initialized.");
} catch (error) {
  console.warn("App Check failed to initialize.", error);
}

export { app, auth, db, appCheck, functions };
