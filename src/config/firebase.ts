// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASRfqvwx6PIHJZ01o5gUD0Kem29hFadaI",
  authDomain: "sdcahris.firebaseapp.com",
  projectId: "sdcahris",
  storageBucket: "sdcahris.firebasestorage.app",
  messagingSenderId: "569053144992",
  appId: "1:569053144992:web:73ff5b63d4155f32ec26c5",
  measurementId: "G-4BD5TW22TS"
};

// Import types
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseStorage } from 'firebase/storage';
import { Analytics } from 'firebase/analytics';

// Initialize Firebase with error handling
let app: FirebaseApp;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Create a placeholder app object to prevent crashes
  app = {} as FirebaseApp;
}

// Initialize Firebase services with error handling
export let db: Firestore;
export let auth: Auth;
export let storage: FirebaseStorage;
export let analytics: Analytics;

try {
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  
  // Analytics can cause issues in some environments, so add extra error handling
  try {
    analytics = getAnalytics(app);
  } catch (analyticsError) {
    console.warn("Failed to initialize Firebase Analytics:", analyticsError);
    analytics = {} as any;
  }
  
  console.log("Firebase services initialized");
} catch (serviceError) {
  console.error("Error initializing Firebase services:", serviceError);
  
  // Create placeholder objects to prevent crashes
  db = {} as any;
  auth = {} as any;
  storage = {} as any;
  analytics = {} as any;
}

export default app;