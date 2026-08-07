import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics, logEvent } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD1Y_PYuBy5dU-PbrxoIzy9TZkLyYGMN8E",
  authDomain: "chinese-talk-master.firebaseapp.com",
  projectId: "chinese-talk-master",
  storageBucket: "chinese-talk-master.firebasestorage.app",
  messagingSenderId: "709360285242",
  appId: "1:709360285242:web:1d4dc42470473a55a32703",
  measurementId: "G-VFQ1WL8PSK",
};

// Initialize Firebase App
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth & Firestore
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

let analyticsInstance: Analytics | null = null;

/**
 * Initialize Analytics safely on client side
 */
export const initAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window !== 'undefined' && (await isSupported())) {
    if (!analyticsInstance) {
      analyticsInstance = getAnalytics(app);
    }
    return analyticsInstance;
  }
  return null;
};

/**
 * Helper function to safely log custom events
 */
export const trackEvent = async (eventName: string, eventParams?: Record<string, any>) => {
  try {
    const analytics = await initAnalytics();
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
    }
  } catch (err) {
    console.warn('Firebase Analytics trackEvent error:', err);
  }
};

export { app, auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged };
export type { User };
