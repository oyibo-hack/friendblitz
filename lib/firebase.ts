// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Firestore import
import { getAuth } from "firebase/auth"; // Authentication import

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "friend-blitz.firebaseapp.com",
  projectId: "friend-blitz",
  storageBucket: "friend-blitz.firebasestorage.app",
  messagingSenderId: "946059517072",
  appId: "1:946059517072:web:690b1b9e6af8403ea3cc15",
  measurementId: "G-PB7NFRPDHE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if running in a browser
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth, analytics };
