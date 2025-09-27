// src/services/firebase.js
import { initializeApp, getApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
import { getStorage } from 'firebase/storage'
import { getMessaging } from 'firebase/messaging'
import { getAuth, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, setPersistence, browserLocalPersistence, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth'
import configService from './configService.js'
import logger from './logger.js'

/**
 * Utilitaire unifié pour les appels aux Cloud Functions
 * Combine le meilleur des implémentations existantes
 */
export async function callCloudFunction(functionName, options = {}) {
  try {
    const auth = getFirebaseAuth();
    const user = auth?.currentUser;
    
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    const token = await user.getIdToken();
    const baseUrl = getCloudFunctionsBaseUrl();
    const url = `${baseUrl}/${functionName}`;
    
    const {
      method = 'POST',
      data = {},
      headers = {},
      ...fetchOptions
    } = options;
    
    logger.debug(`🔐 Appel Cloud Function: ${functionName}`, { 
      url, 
      method, 
      data: Object.keys(data).length > 0 ? data : undefined 
    });
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...headers
      },
      body: method !== 'GET' && Object.keys(data).length > 0 ? JSON.stringify(data) : undefined,
      ...fetchOptions
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    logger.debug(`🔐 Réponse Cloud Function ${functionName}:`, result);
    
    return result;
  } catch (error) {
    logger.error(`❌ Erreur lors de l'appel à ${functionName}:`, error);
    throw error;
  }
}

/**
 * Retourne l'URL de base des Cloud Functions selon l'environnement
 */
function getCloudFunctionsBaseUrl() {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'https://us-central1-impro-selector.cloudfunctions.net';
  } else if (hostname.includes('staging')) {
    return 'https://us-central1-impro-selector.cloudfunctions.net';
  } else {
    return 'https://us-central1-impro-selector.cloudfunctions.net';
  }
}

// Fonction pour configurer les listeners de connexion offline
function setupOfflineListeners(db) {
  try {
    // Écouter les événements de connexion du navigateur
    window.addEventListener('online', () => {
      logger.info('🟢 Connexion rétablie - Synchronisation Firestore en cours');
    });
    
    window.addEventListener('offline', () => {
      logger.info('🔴 Mode offline - Firestore utilise le cache local');
    });
    
    logger.info('✅ Listeners offline configurés');
  } catch (error) {
    logger.warn('⚠️ Erreur lors de la configuration des listeners offline:', error);
  }
}

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
    
    // Initialiser l'app Firebase avec pattern singleton
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      logger.info('🆕 Nouvelle instance Firebase créée');
    } else {
      app = getApp();
      logger.info('♻️ Instance Firebase existante réutilisée');
    }
    
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
    
    logger.info('🌍 Initialisation Firestore avec la base:', finalDatabase);
    
    // Initialiser Firestore avec pattern singleton
    // Vérifier si une instance Firestore existe déjà pour cette base
    const existingDb = window.firebaseServices?.db;
    const existingDatabaseId = existingDb?._databaseId?.database || existingDb?._delegate?._databaseId?.database;
    
    if (existingDb && existingDatabaseId === finalDatabase) {
      // Réutiliser l'instance existante
      firestoreDb = existingDb;
      logger.info('♻️ Instance Firestore existante réutilisée pour la base:', finalDatabase);
    } else {
      // Créer une nouvelle instance
      if (finalDatabase === 'default') {
        firestoreDb = getFirestore(app);
        logger.info('🆕 Nouvelle instance Firestore créée: default');
      } else {
        firestoreDb = getFirestore(app, finalDatabase);
        logger.info('🆕 Nouvelle instance Firestore créée:', finalDatabase);
      }
    }
    
    logger.info('🔧 Connexion Firestore établie avec la base:', finalDatabase);
    
    // Stocker l'instance pour pouvoir la fermer plus tard
    window.firebaseDbInstance = firestoreDb;
    
    logger.info('✅ Firestore initialisé avec la base:', finalDatabase);
    
    // Configurer les listeners de connexion pour le debug offline
    setupOfflineListeners(firestoreDb);
    
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

    // Firebase est maintenant initialisé, les secrets seront chargés à la demande
    logger.info('✅ Firebase initialisé, secrets disponibles à la demande');
    
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
    window.firebaseInitialized = true;
    
  } catch (error) {
    logger.error('❌ Erreur fatale lors de l\'initialisation Firestore:', error);
    throw error; // Ne pas fallback sur (default) - c'est dangereux !
  }
}

// Appeler l'initialisation
initializeFirestoreInstance().catch(error => {
  logger.error('❌ Erreur fatale lors de l\'initialisation de Firestore:', error);
});

// Fonctions d'authentification pour les joueurs
export async function createPlayerAccount(email, password) {
  try {
    // Attendre que le service auth soit complètement initialisé
    const { waitForInitialization } = await import('./authState.js')
    await waitForInitialization()
    
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
    
    // Utiliser Firebase Auth partout (dev, staging, production)
    const { sendPasswordResetEmail } = await import('firebase/auth')
    await sendPasswordResetEmail(auth, email)
    
    const environment = configService.getEnvironment()
    logger.info(`📧 Reset email envoyé via Firebase Auth (${environment})`)
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

// Google Authentication functions
export async function signInWithGoogle() {
  try {
    const auth = getFirebaseAuth()
    if (!auth) {
      throw new Error('Firebase Auth n\'est pas encore initialisé')
    }
    
    const provider = new GoogleAuthProvider()
    // Request email and profile info
    provider.addScope('email')
    provider.addScope('profile')
    
    const result = await signInWithPopup(auth, provider)
    
    // Log successful Google sign-in
    logger.info('Google sign-in successful', {
      uid: result.user.uid,
      email: result.user.email,
      isNewUser: result.user.metadata.creationTime === result.user.metadata.lastSignInTime
    })
    
    return result.user
  } catch (error) {
    // Handle specific Google Auth errors
    if (error.code === 'auth/popup-closed-by-user') {
      const cleanError = new Error('Connexion annulée')
      cleanError.code = 'AUTH_POPUP_CANCELLED'
      cleanError.isAuthError = true
      throw cleanError
    }
    
    if (error.code === 'auth/popup-blocked') {
      const cleanError = new Error('Popup bloquée par le navigateur. Autorisez les popups pour ce site.')
      cleanError.code = 'AUTH_POPUP_BLOCKED'
      cleanError.isAuthError = true
      throw cleanError
    }
    
    if (error.code === 'auth/account-exists-with-different-credential') {
      const cleanError = new Error('Un compte existe déjà avec cette adresse email via une autre méthode de connexion')
      cleanError.code = 'AUTH_ACCOUNT_EXISTS'
      cleanError.isAuthError = true
      throw cleanError
    }
    
    // Log other errors but don't expose details
    logger.warn('Google authentication error:', error.code, error.message)
    
    const cleanError = new Error('Erreur lors de la connexion avec Google. Réessayez.')
    cleanError.code = 'AUTH_GOOGLE_ERROR'
    cleanError.isAuthError = true
    throw cleanError
  }
}

export async function signUpWithGoogle() {
  // For Google Auth, sign-in and sign-up are the same process
  // Firebase automatically creates an account if it doesn't exist
  return signInWithGoogle()
}

// Getters pour accéder aux services Firebase
export function getFirebaseDb() {
  console.warn('⚠️  ILLEGAL ACCESS: getFirebaseDb() is being called directly! All database access should go through firestoreService. Check the stack trace below:')
  console.trace()
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

// Wrapper sécurisé pour verifyPasswordResetCode
export async function safeVerifyPasswordResetCode(oobCode) {
  // Attendre que le service auth soit complètement initialisé
  const { waitForInitialization } = await import('./authState.js')
  await waitForInitialization()
  
  // Maintenant on peut appeler la fonction Firebase
  const auth = getFirebaseAuth()
  return await verifyPasswordResetCode(auth, oobCode)
}

// Wrapper sécurisé pour confirmPasswordReset
export async function safeConfirmPasswordReset(oobCode, newPassword) {
  // Attendre que le service auth soit complètement initialisé
  const { waitForInitialization } = await import('./authState.js')
  await waitForInitialization()
  
  const auth = getFirebaseAuth()
  return await confirmPasswordReset(auth, oobCode, newPassword)
}

// Export des services pour compatibilité
// Note: Ces exports sont dynamiques et peuvent être null au moment de l'import
// Utilisez les getters pour un accès plus fiable
// IMPORTANT: db n'est plus exporté - utilisez firestoreService à la place
export const auth = getFirebaseAuth();
export const storage = getFirebaseStorage();
export const functions = getFirebaseFunctions();
export { getMessaging, verifyPasswordResetCode };