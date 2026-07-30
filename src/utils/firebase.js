import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBe2PMPnRg-t0Epop6kCsFT_s8O732Jwv8",
  authDomain: "studentfees-22d17.firebaseapp.com",
  projectId: "studentfees-22d17",
  storageBucket: "studentfees-22d17.firebasestorage.app",
  messagingSenderId: "838884465703",
  appId: "1:838884465703:web:1d53e0ca20996d221ac202",
  measurementId: "G-QECNEF1ZP0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (Safe for all browser environments)
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics fallback if blocked by ad-blocker or browser settings
  });
}

export { app, analytics, firebaseConfig };
