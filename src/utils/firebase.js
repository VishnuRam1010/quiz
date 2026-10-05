import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  doc,
  deleteDoc,
  where,
} from 'firebase/firestore';

const CONFIG_STORAGE_KEY = 'classroom_firebase_config';

/**
 * Get active Firebase configuration from environment or localStorage
 */
export function getFirebaseConfig() {
  // Check localStorage first (allows in-app configuration without rebuilding)
  try {
    const custom = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed?.projectId && parsed?.apiKey) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse stored firebase config:', e);
  }

  // Check Vite environment variables (for Netlify deploy settings)
  const env = import.meta.env;
  if (env?.VITE_FIREBASE_API_KEY && env?.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || `${env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: env.VITE_FIREBASE_APP_ID || '',
    };
  }

  return null;
}

export function saveStoredFirebaseConfig(config) {
  if (!config) {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  } else {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }
}

let dbInstance = null;
let appInstance = null;

export function getDb() {
  if (dbInstance) return dbInstance;
  const config = getFirebaseConfig();
  if (!config) return null;

  try {
    appInstance = getApps().length ? getApp() : initializeApp(config);
    dbInstance = getFirestore(appInstance);
    return dbInstance;
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return null;
  }
}

export function isFirebaseConfigured() {
  return !!getFirebaseConfig();
}

/**
 * Add a quiz attempt to Firestore
 */
export async function addAttemptToFirestore(attempt, room = 'default') {
  const db = getDb();
  if (!db) return false;
  try {
    const col = collection(db, 'classroom_attempts');
    await addDoc(col, {
      ...attempt,
      room,
      syncedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('Firestore addAttempt error:', err);
    return false;
  }
}

/**
 * Subscribe to real-time classroom attempts in Firestore
 */
export function subscribeFirestoreAttempts(room = 'default', callback) {
  const db = getDb();
  if (!db) return null;

  try {
    const col = collection(db, 'classroom_attempts');
    const q = query(col, orderBy('date', 'desc'), limit(150));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const attempts = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (!room || room === 'all' || data.room === room || !data.room) {
            attempts.push({ id: docSnap.id, ...data });
          }
        });
        callback(attempts);
      },
      (err) => {
        console.warn('Firestore snapshot error:', err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Firestore subscribe error:', err);
    return null;
  }
}

/**
 * Delete a specific attempt from Firestore
 */
export async function deleteAttemptFromFirestore(docId) {
  const db = getDb();
  if (!db || !docId) return false;
  try {
    await deleteDoc(doc(db, 'classroom_attempts', docId));
    return true;
  } catch (err) {
    console.warn('Firestore deleteDoc error:', err);
    return false;
  }
}

/**
 * Delete all attempts of a user from Firestore
 */
export async function deleteUserFromFirestore(userName, room = 'default') {
  const db = getDb();
  if (!db || !userName) return false;
  try {
    const col = collection(db, 'classroom_attempts');
    const q = query(col, where('name', '==', userName.trim()));
    const snapshot = await getDocs(q);
    const promises = [];
    snapshot.forEach((d) => {
      promises.push(deleteDoc(d.ref));
    });
    await Promise.all(promises);
    return true;
  } catch (err) {
    console.warn('Firestore deleteUser error:', err);
    return false;
  }
}

