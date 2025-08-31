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

// Initialiser Firestore avec la base de données de l'environnement
let db;
try {
  // Détecter l'environnement depuis l'URL
  const hostname = window.location.hostname;
  let database = 'default'; // production par défaut
  
  console.log('🔍 Détection de l\'environnement:', {
    hostname: hostname,
    includesStaging: hostname.includes('staging'),
    includesHatcastStaging: hostname.includes('hatcast-staging'),
    includesLocalhost: hostname.includes('localhost'),
    includesLocalIP: hostname.includes('192.168.1.134')
  });
  
  if (hostname.includes('staging') || hostname.includes('hatcast-staging')) {
    database = 'staging';
  } else if (hostname.includes('localhost') || hostname.includes('192.168.1.134')) {
    database = 'development';
  }
  
  console.log('🌍 Initialisation Firestore avec la base:', database);
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
  
  db = initializeFirestore(app, {
    cacheSizeBytes: 50 * 1024 * 1024, // 50MB de cache
    experimentalForceOwningTab: false, // Permettre le partage entre onglets
    databaseId: database // Spécifier la base de données
  });
  
  // Stocker l'instance pour pouvoir la fermer plus tard
  window.firebaseDbInstance = db;
  
  console.log('✅ Firestore initialisé avec la base:', database);
  
  // Vérification post-initialisation
  setTimeout(() => {
    try {
      const actualDatabase = db.app.options.databaseId || 'default';
      console.log('🔍 Vérification post-initialisation - Base réellement utilisée:', actualDatabase);
      if (actualDatabase !== database) {
        console.warn('⚠️ ATTENTION: La base utilisée ne correspond pas à la base configurée!');
        console.warn('⚠️ Configurée:', database, 'Utilisée:', actualDatabase);
      }
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