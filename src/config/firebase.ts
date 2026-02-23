// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKKijdNk3qmVaWQT5coebKx27ThulAZ5E",
  authDomain: "sdcahris.firebaseapp.com",
  projectId: "sdcahris",
  storageBucket: "sdcahris.firebasestorage.app",
  messagingSenderId: "569053144992",
  appId: "1:569053144992:web:382b02aaae993faeec26c5",
  measurementId: "G-X4F3L1EYF7"
};

// VAPID key for FCM push notifications
export const VAPID_KEY = "BC1ZiLeRr_7F_zXH4ouzy65Q7S9lXPo4fKxpNA5GchPi5N7tQbTHFPffNTl9hPsmknf-sJRuDUn1Ce9AJZ4JmbI";

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
export let messaging: Messaging | null = null;

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

  // Initialize FCM – only works in browsers that support it
  try {
    messaging = getMessaging(app);
    console.log("Firebase Cloud Messaging initialized");
  } catch (messagingError) {
    console.warn("Failed to initialize Firebase Messaging:", messagingError);
    messaging = null;
  }
  
  console.log("Firebase services initialized");
} catch (serviceError) {
  console.error("Error initializing Firebase services:", serviceError);
  
  // Create placeholder objects to prevent crashes
  db = {} as any;
  auth = {} as any;
  storage = {} as any;
  analytics = {} as any;
  messaging = null;
}

/**
 * Request FCM permission and return the device token.
 * Stores nothing – callers are responsible for persisting the token.
 */
export async function requestFCMToken(): Promise<string | null> {
  if (!messaging) {
    console.warn("Messaging not available");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return null;
    }

    // Register the service worker explicitly so getToken can always find it
    let swRegistration: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator) {
      try {
        swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log("Firebase messaging SW registered:", swRegistration.scope);
      } catch (swError) {
        console.warn("Could not register messaging SW:", swError);
      }
    }

    const tokenOptions: any = { vapidKey: VAPID_KEY };
    if (swRegistration) {
      tokenOptions.serviceWorkerRegistration = swRegistration;
    }

    const token = await getToken(messaging, tokenOptions);
    console.log("FCM token obtained:", token?.substring(0, 20) + "...");
    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
}

/**
 * Listen for foreground messages. Returns an unsubscribe function.
 */
export function onForegroundMessage(callback: (payload: any) => void) {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}

export default app;