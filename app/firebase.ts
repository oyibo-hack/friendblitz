import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
  // FIREBASE_CONFIGURATION
  apiKey: "AIzaSyAVjZ6fG6l0XuMDZoMP4_y2WdLOZIkBrS8",
  authDomain: "friendblitz-app.firebaseapp.com",
  projectId: "friendblitz-app",
  storageBucket: "friendblitz-app.firebasestorage.app",
  messagingSenderId: "225931254834",
  appId: "1:225931254834:web:ea7de4fda5cbff4628b02b",
  measurementId: "G-GFSEQND4NJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

const auth = getAuth(app);

export { db, auth };
