// src/services/firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore, initializeFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
import { getStorage } from 'firebase/storage'
import { getMessaging } from 'firebase/messaging'
import { getAuth, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig)

// Initialiser Firestore avec la nouvelle approche de cache
const db = initializeFirestore(app, {
  cacheSizeBytes: 50 * 1024 * 1024, // 50MB de cache
  experimentalForceOwningTab: false // Permettre le partage entre onglets
})

const storage = getStorage(app)
const auth = getAuth(app)
const functions = getFunctions(app)

// Persistance de session durable (navigateur) pour éviter de redemander l'authentification
try {
  // noinspection JSIgnoredPromiseFromCall
  setPersistence(auth, browserLocalPersistence)
} catch (_) {}

// Connexion anonyme uniquement si aucun utilisateur n'est déjà persisté
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // noinspection JSIgnoredPromiseFromCall
    signInAnonymously(auth)
  }
})

// Fonctions d'authentification pour les joueurs
export async function createPlayerAccount(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    throw error
  }
}

export async function signInPlayer(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    throw error
  }
}

export async function resetPlayerPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    throw error
  }
}

export async function updatePlayerPassword(newPassword) {
  try {
    const user = auth.currentUser
    if (user) {
      await updatePassword(user, newPassword)
    } else {
      throw new Error('Aucun utilisateur connecté')
    }
  } catch (error) {
    throw error
  }
}

export { db, auth, storage, getMessaging, functions }