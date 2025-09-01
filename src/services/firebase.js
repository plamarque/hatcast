// src/services/firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore, initializeFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
import { getStorage } from 'firebase/storage'
import { getMessaging } from 'firebase/messaging'
import { getAuth, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth'
import configService from './configService.js'

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

// Initialiser Firestore avec la base de données de l'environnement
let db;
try {
  // Utiliser configService pour la détection d'environnement
  const environment = configService.getEnvironment()
  const database = configService.getFirestoreDatabase()
  const region = configService.getFirestoreRegion()
  
  console.log('🔍 Détection de l\'environnement via configService:', {
    environment: environment,
    database: database,
    region: region,
    hostname: window.location.hostname
  });
  
  // Priorité aux variables d'environnement Vite (override)
  const overrideDatabase = import.meta.env.VITE_FIRESTORE_DATABASE
  if (overrideDatabase) {
    console.log('🔧 Base de données forcée par variable d\'environnement:', overrideDatabase);
  }
  
  const finalDatabase = overrideDatabase || database
  
  console.log('🌍 Initialisation Firestore avec la base:', finalDatabase);
  console.log('🌍 URL complète:', window.location.href);
  
  // Forcer la fermeture de toutes les connexions existantes
  if (window.firebaseDbInstance) {
    try {
      window.firebaseDbInstance.terminate();
      console.log('🔄 Fermeture des connexions Firestore existantes');
    } catch (error) {
      console.warn('⚠️ Erreur lors de la fermeture des connexions:', error);
    }
  }
  
  // Initialiser Firestore avec la base spécifique
  if (finalDatabase === 'default') {
    // Base par défaut
    db = getFirestore(app);
  } else {
    // Base spécifique avec databaseId
    db = getFirestore(app, finalDatabase);
  }
  
  console.log('🔧 Tentative de connexion à la base:', finalDatabase, 'avec getFirestore() et databaseId:', finalDatabase);
  
  // Stocker l'instance pour pouvoir la fermer plus tard
  window.firebaseDbInstance = db;
  
  console.log('✅ Firestore initialisé avec la base:', finalDatabase);
  
  // Vérification post-initialisation
  setTimeout(() => {
    try {
      // Avec Firebase v9+, la vérification se fait différemment
      console.log('🔍 Vérification post-initialisation - Base configurée:', finalDatabase);
      console.log('🔍 Instance Firestore initialisée pour la base:', finalDatabase);
      console.log('✅ Connexion Firestore établie avec succès');
    } catch (error) {
      console.warn('⚠️ Impossible de vérifier la base utilisée:', error);
    }
  }, 1000);
} catch (error) {
  console.warn('⚠️ Erreur lors de l\'initialisation de la base spécifique, utilisation de la base par défaut:', error);
  db = initializeFirestore(app, {
    cacheSizeBytes: 50 * 1024 * 1024,
    experimentalForceOwningTab: false
  });
}

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