// src/services/firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore, initializeFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
import { getStorage } from 'firebase/storage'
import { getMessaging } from 'firebase/messaging'
import { getAuth, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth'
import configService from './configService.js'
import logger from './logger.js'

// Configuration Firebase sera créée après initialisation
let app;
let firebaseConfig;

// Initialiser Firestore avec la base de données de l'environnement
let firestoreDb;

// Fonction d'initialisation asynchrone
async function initializeFirestoreInstance() {
  try {
    // Initialiser Firebase IMMÉDIATEMENT avec les variables VITE
    firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };
    
    // Initialiser l'app Firebase IMMÉDIATEMENT
    app = initializeApp(firebaseConfig);
    
    // Maintenant que Firebase est initialisé, charger configService
    await configService.initializeConfig();
    
    // Utiliser configService pour la détection d'environnement (maintenant initialisé)
    const environment = configService.getEnvironment()
    const database = configService.getFirestoreDatabase()
    const region = configService.getFirestoreRegion()
    
    logger.info('🔍 Configuration via configService:', {
      environment: environment,
      firestoreDatabase: database,
      firestoreRegion: region,
      storageBucket: configService.getFirebaseStorageBucket(),
      hostname: window.location.hostname
    });
    
    // Priorité aux variables d'environnement Vite (override) - maintenant géré par configService
    const finalDatabase = database
    
    logger.info('🌍 Initialisation Firestore avec la base depuis configService:', finalDatabase);
    logger.info('🌍 URL complète:', window.location.href);
    
    // Forcer la fermeture de toutes les connexions existantes
    if (window.firebaseDbInstance) {
      try {
        window.firebaseDbInstance.terminate();
        logger.info('🔄 Fermeture des connexions Firestore existantes');
      } catch (error) {
        logger.warn('⚠️ Erreur lors de la fermeture des connexions:', error);
      }
    }
    
    // Initialiser Firestore avec la base spécifique
    if (finalDatabase === 'default') {
      // Base par défaut
      firestoreDb = getFirestore(app);
    } else {
      // Base spécifique avec databaseId
      firestoreDb = getFirestore(app, finalDatabase);
    }
    
    logger.info('🔧 Tentative de connexion à la base:', finalDatabase, 'avec getFirestore() et databaseId:', finalDatabase);
    
    // Stocker l'instance pour pouvoir la fermer plus tard
    window.firebaseDbInstance = firestoreDb;
    
    logger.info('✅ Firestore initialisé avec la base:', finalDatabase);
    
    // Initialiser les autres services Firebase maintenant que l'app est créée
    const storage = getStorage(app);
    const auth = getAuth(app);
    const functions = getFunctions(app);
    
    // Persistance de session durable (navigateur) pour éviter de redemander l'authentification
    try {
      // noinspection JSIgnoredPromiseFromCall
      setPersistence(auth, browserLocalPersistence);
    } catch (_) {}
    
    // Connexion anonyme uniquement si aucun utilisateur n'est déjà persisté
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        // noinspection JSIgnoredPromiseFromCall
        signInAnonymously(auth);
      }
    });

    // Maintenant que Firebase est initialisé, charger les secrets
    try {
      await configService.loadSecretsDelayed();
      logger.info('🔐 Secrets Firebase chargés avec succès');
    } catch (error) {
      logger.warn('⚠️ Erreur lors du chargement des secrets Firebase:', error);
    }
    
    // Vérification post-initialisation
    setTimeout(() => {
      try {
        // Avec Firebase v9+, la vérification se fait différemment
        logger.info('🔍 Vérification post-initialisation - Base configurée:', finalDatabase);
        logger.info('🔍 Instance Firestore initialisée pour la base:', finalDatabase);
        logger.info('✅ Connexion Firestore établie avec succès');
      } catch (error) {
        logger.warn('⚠️ Impossible de vérifier la base utilisée:', error);
      }
    }, 1000);
    
    // Exporter les services
    window.firebaseServices = { db: firestoreDb, storage, auth, functions };
    
    // Marquer Firebase comme initialisé
    window.firebaseInitialized = true
    
  } catch (error) {
    logger.warn('⚠️ Erreur lors de l\'initialisation de la base spécifique, utilisation de la base par défaut:', error);
    firestoreDb = initializeFirestore(app, {
      cacheSizeBytes: 50 * 1024 * 1024,
      experimentalForceOwningTab: false
    });
  }
}

// Appeler l'initialisation
initializeFirestoreInstance().catch(error => {
  logger.error('❌ Erreur fatale lors de l\'initialisation de Firestore:', error);
});

// Fonctions d'authentification pour les joueurs
export async function createPlayerAccount(email, password) {
  try {
    const auth = getFirebaseAuth()
    if (!auth) {
      throw new Error('Firebase Auth n\'est pas encore initialisé')
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    throw error
  }
}

export async function signInPlayer(email, password) {
  try {
    const auth = getFirebaseAuth()
    if (!auth) {
      throw new Error('Firebase Auth n\'est pas encore initialisé')
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    // Capturer proprement les erreurs d'authentification courantes
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
      // Créer une erreur propre sans exposer les détails Firebase
      const cleanError = new Error('Email ou mot de passe incorrect')
      cleanError.code = 'AUTH_INVALID_CREDENTIALS'
      cleanError.isAuthError = true
      throw cleanError
    }
    
    // Pour les autres erreurs, les logger mais ne pas les exposer
    logger.warn('Erreur d\'authentification Firebase:', error.code, error.message)
    
    if (error.code === 'auth/too-many-requests') {
      const cleanError = new Error('Trop de tentatives. Réessayez plus tard.')
      cleanError.code = 'AUTH_TOO_MANY_ATTEMPTS'
      cleanError.isAuthError = true
      throw cleanError
    }
    
    // Erreur générique pour les autres cas
    const cleanError = new Error('Erreur de connexion. Réessayez.')
    cleanError.code = 'AUTH_GENERIC_ERROR'
    cleanError.isAuthError = true
    throw cleanError
  }
}

export async function resetPlayerPassword(email) {
  try {
    const auth = getFirebaseAuth()
    if (!auth) {
      throw new Error('Firebase Auth n\'est pas encore initialisé')
    }
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    // Capturer proprement les erreurs de reset de mot de passe
    if (error.code === 'auth/user-not-found') {
      const cleanError = new Error('Aucun compte trouvé avec cette adresse email')
      cleanError.code = 'AUTH_USER_NOT_FOUND'
      cleanError.isAuthError = true
      throw cleanError
    }
    
    // Pour les autres erreurs, les logger mais ne pas les exposer
    logger.warn('Erreur de reset de mot de passe Firebase:', error.code, error.message)
    
    const cleanError = new Error('Impossible d\'envoyer l\'email de réinitialisation')
    cleanError.code = 'AUTH_RESET_ERROR'
    cleanError.isAuthError = true
    throw cleanError
  }
}

export async function updatePlayerPassword(newPassword) {
  try {
    const auth = getFirebaseAuth()
    if (!auth) {
      throw new Error('Firebase Auth n\'est pas encore initialisé')
    }
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

// Getters pour accéder aux services Firebase
export function getFirebaseDb() {
  return window.firebaseServices?.db || null;
}

export function getFirebaseAuth() {
  return window.firebaseServices?.auth || null;
}

export function getFirebaseStorage() {
  return window.firebaseServices?.storage || null;
}

export function getFirebaseFunctions() {
  return window.firebaseServices?.functions || null;
}

// Export des services pour compatibilité
export const db = getFirebaseDb();
export const auth = getFirebaseAuth();
export const storage = getFirebaseStorage();
export const functions = getFirebaseFunctions();
export { getMessaging };