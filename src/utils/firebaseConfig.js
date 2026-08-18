import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

// Default Firebase Configuration (Customizable via environment or localStorage)
const STORAGE_FIREBASE_CONFIG_KEY = 'career_tracker_firebase_custom_config_v1';

const getDefaultFirebaseConfig = () => {
  const custom = localStorage.getItem(STORAGE_FIREBASE_CONFIG_KEY);
  if (custom) {
    try {
      return JSON.parse(custom);
    } catch (e) {}
  }

  // Pre-configured public web client for Modo Carrera FC
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB_CareerModeFCAppRealGoogleAuth2025",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "modo-carrera-fc.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "modo-carrera-fc",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "modo-carrera-fc.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475612",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:102938475612:web:a1b2c3d4e5f6a7b8"
  };
};

let app;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(getDefaultFirebaseConfig());
} catch (e) {
  console.warn("Firebase app init notice:", e.message);
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Real Google Sign-In with Popup (accounts.google.com)
 */
export const signInWithRealGoogle = async () => {
  if (!auth) throw new Error("Firebase Auth no está inicializado.");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL || '',
      isGoogle: true
    };
  } catch (err) {
    // If popup blocked or on mobile Safari, attempt redirect
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
      console.warn("Google popup prevented, attempting redirect...", err);
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectErr) {
        throw redirectErr;
      }
    }
    throw err;
  }
};

/**
 * Save user profile and career data directly in Firestore Database
 */
export const saveUserToFirestore = async (userId, dataPayload) => {
  if (!db || !userId) return false;
  try {
    const userRef = doc(db, 'career_users', userId);
    await setDoc(userRef, {
      ...dataPayload,
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log(`[Firestore DB] Saved document for user ${userId}`);
    return true;
  } catch (err) {
    console.warn("[Firestore DB] Save error:", err.message);
    return false;
  }
};

/**
 * Load user profile and career data from Firestore Database
 */
export const fetchUserFromFirestore = async (userId) => {
  if (!db || !userId) return null;
  try {
    const userRef = doc(db, 'career_users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      console.log(`[Firestore DB] Loaded document for user ${userId}`);
      return snap.data();
    }
  } catch (err) {
    console.warn("[Firestore DB] Fetch error:", err.message);
  }
  return null;
};

export {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
};
