// src/services/firestoreService.js
// Service centralisé pour tous les accès Firestore
// Garantit l'utilisation de la bonne base de données selon l'environnement

import { getFirebaseDb } from './firebase.js'
import configService from './configService.js'
import logger from './logger.js'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  serverTimestamp,
  onSnapshot,
  runTransaction
} from 'firebase/firestore'

/**
 * Service centralisé pour tous les accès Firestore
 * Garantit l'utilisation de la bonne base de données selon l'environnement
 */
class FirestoreService {
  constructor() {
    this.db = null
    this.environment = null
    this.database = null
    this.region = null
    this.isInitialized = false
  }

  async initialize() {
    if (this.isInitialized) return this;
    
    try {
      // Attendre que Firebase soit complètement initialisé
      let attempts = 0;
      const maxAttempts = 20;
      
      while (attempts < maxAttempts) {
        // Vérifier si Firebase est initialisé
        if (window.firebaseInitialized && window.firebaseServices?.db) {
          this.db = window.firebaseServices.db;
          break;
        }
        
        logger.info(`⏳ Tentative ${attempts + 1}/${maxAttempts}: Firebase pas encore prêt, attente...`);
        await new Promise(resolve => setTimeout(resolve, 250));
        attempts++;
      }
      
      if (!this.db) {
        throw new Error('Firebase Firestore n\'est pas encore initialisé après plusieurs tentatives');
      }
      
      // Maintenant que Firebase est prêt, initialiser configService
      await configService.initializeConfig();
      
      // Utiliser configService pour la détection d'environnement
      this.environment = configService.getEnvironment()
      this.database = configService.getFirestoreDatabase()
      this.region = configService.getFirestoreRegion()
      
      logger.info('🔧 FirestoreService initialisé:')
      logger.info('  - Environnement:', this.environment)
      logger.info('  - Base de données:', this.database)
      logger.info('  - Région:', this.region)
      logger.info('  - Instance Firestore:', this.db ? 'OK' : 'ERREUR')
      logger.info('  - Projet Firebase:', this.db?.app?.options?.projectId || 'Non déterminé')
      
      this.isInitialized = true;
      return this;
    } catch (error) {
      logger.error('❌ Erreur lors de l\'initialisation de FirestoreService:', error);
      throw error;
    }
  }

  /**
   * Obtenir une référence de collection
   * @param {string} collectionName - Nom de la collection
   * @param {...string} pathSegments - Segments de chemin pour les sous-collections
   * @returns {CollectionReference} Référence de collection
   */
  getCollection(collectionName, ...pathSegments) {
    if (pathSegments.length === 0) {
      return collection(this.db, collectionName)
    } else {
      return collection(this.db, collectionName, ...pathSegments)
    }
  }

  /**
   * Obtenir une référence de document
   * @param {string} collectionName - Nom de la collection
   * @param {string} docId - ID du document
   * @param {...string} pathSegments - Segments de chemin pour les sous-collections
   * @returns {DocumentReference} Référence de document
   */
  getDocumentRef(collectionName, docId, ...pathSegments) {
    if (pathSegments.length === 0) {
      return doc(this.db, collectionName, docId)
    } else {
      return doc(this.db, collectionName, docId, ...pathSegments)
    }
  }

  /**
   * Lire tous les documents d'une collection
   * @param {string} collectionName - Nom de la collection
   * @param {...string} pathSegments - Segments de chemin pour les sous-collections
   * @returns {Promise<Array>} Documents avec leurs IDs
   */
  async getDocuments(collectionName, ...pathSegments) {
    try {
      const colRef = this.getCollection(collectionName, ...pathSegments)
      const snapshot = await getDocs(colRef)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error(`❌ Erreur lors de la lecture de la collection ${collectionName}:`, error)
      throw error
    }
  }

  /**
   * Lire un document spécifique
   * @param {string} collectionName - Nom de la collection
   * @param {string} docId - ID du document
   * @param {...string} pathSegments - Segments de chemin pour les sous-collections
   * @returns {Promise<Object|null>} Document avec son ID ou null
   */
  async getDocument(collectionName, docId, ...pathSegments) {
    try {
      const docRef = this.getDocumentRef(collectionName, docId, ...pathSegments)
      const snapshot = await getDoc(docRef)
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() }
      }
      return null
    } catch (error) {
      console.error(`❌ Erreur lors de la lecture du document ${docId} dans ${collectionName}:`, error)
      throw error
    }
  }

  /**
   * Créer un nouveau document avec ID auto-généré
   * @param {string} collectionName - Nom de la collection
   * @param {Object} data - Données du document
   * @param {...string} pathSegments - Segments de chemin pour les sous-collections
   * @returns {Promise<string>} ID du document créé
   */
  async addDocument(collectionName, data, ...pathSegments) {
    try {
      const colRef = this.getCollection(collectionName, ...pathSegments)
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp()
      })
      console.log(`✅ Document créé dans ${collectionName} avec l'ID:`, docRef.id)
      return docRef.id
    } catch (error) {
      console.error(`❌ Erreur lors de la création du document dans ${collectionName}:`, error)
      throw error
    }
  }

  /**
   * Créer ou mettre à jour un document avec ID spécifique
   * @param {string} collectionName - Nom de la collection
   * @param {string} docId - ID du document
   * @param {Object} data - Données du document
   * @param {boolean} merge - Fusionner avec les données existantes
   * @param {...string} pathSegments - Segments de chemin pour les sous-collections
   * @returns {Promise<void>}
   */
  async setDocument(collectionName, docId, data, merge = false, ...pathSegments) {
    try {
      // Vérifier que le service est initialisé
      if (!this.isInitialized || !this.db) {
        console.log('⏳ FirestoreService pas encore initialisé, attente...')
        await this.initialize()
      }
      
      if (!this.db) {
        throw new Error('FirestoreService.db est null après initialisation')
      }
      
      const docRef = this.getDocumentRef(collectionName, docId, ...pathSegments)
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge })
      console.log(`✅ Document ${docId} ${merge ? 'mis à jour' : 'créé'} dans ${collectionName}`)
    } catch (error) {
      console.error(`❌ Erreur lors de la sauvegarde du document ${docId} dans ${collectionName}:`, error)
      throw error
    }
  }

  /**
   * Mettre à jour un document existant
   * @param {string} collectionName - Nom de la collection
   * @param {string} docId - ID du document
   * @param {Object} data - Données à mettre à jour
   * @param {...string} pathSegments - Segments de chemin pour les sous-collections
   * @returns {Promise<void>}
   */
  async updateDocument(collectionName, docId, data, ...pathSegments) {
    try {
      const docRef = this.getDocumentRef(collectionName, docId, ...pathSegments)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      })
      console.log(`✅ Document ${docId} mis à jour dans ${collectionName}`)
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour du document ${docId} dans ${collectionName}:`, error)
      throw error
    }
  }

  /**
   * Supprimer un document
   * @param {string} collectionName - Nom de la collection
   * @param {string} docId - ID du document
   * @param {...string} pathSegments - Segments de chemin pour les sous-collections
   * @returns {Promise<void>}
   */
  async deleteDocument(collectionName, docId, ...pathSegments) {
    try {
      const docRef = this.getDocumentRef(collectionName, docId, ...pathSegments)
      await deleteDoc(docRef)
      console.log(`✅ Document ${docId} supprimé de ${collectionName}`)
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression du document ${docId} dans ${collectionName}:`, error)
      throw error
    }
  }

  /**
   * Créer une requête
   * @param {string} collectionName - Nom de la collection
   * @param {...QueryConstraint} constraints - Contraintes de requête
   * @param {...string} pathSegments - Segments de chemin pour les sous-collections
   * @returns {Query} Requête Firestore
   */
  createQuery(collectionName, constraints = []) {
    const colRef = this.getCollection(collectionName)
    return query(colRef, ...constraints)
  }

  /**
   * Exécuter une requête avec contraintes
   * @param {string} collectionName - Nom de la collection
   * @param {Array} constraints - Contraintes de requête
   * @param {...string} pathSegments - Segments de chemin pour les sous-collections
   * @returns {Promise<Array>} Documents avec leurs IDs
   */
  async queryDocuments(collectionName, constraints = [], ...pathSegments) {
    try {
      const colRef = this.getCollection(collectionName, ...pathSegments)
      const queryRef = query(colRef, ...constraints)
      const snapshot = await getDocs(queryRef)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error(`❌ Erreur lors de l'exécution de la requête sur ${collectionName}:`, error)
      throw error
    }
  }

  /**
   * Exécuter une requête
   * @param {Query} queryRef - Requête Firestore
   * @returns {Promise<Array>} Documents avec leurs IDs
   */
  async executeQuery(queryRef) {
    try {
      const snapshot = await getDocs(queryRef)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution de la requête:', error)
      throw error
    }
  }


  /**
   * Créer un batch pour les opérations multiples
   * @returns {WriteBatch} Batch Firestore
   */
  createBatch() {
    return writeBatch(this.db)
  }

  /**
   * Exécuter une transaction
   * @param {Function} updateFunction - Fonction de mise à jour
   * @returns {Promise<any>} Résultat de la transaction
   */
  async executeTransaction(updateFunction) {
    try {
      return await runTransaction(this.db, updateFunction)
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution de la transaction:', error)
      throw error
    }
  }

  /**
   * Écouter les changements d'une collection
   * @param {string} collectionName - Nom de la collection
   * @param {Function} callback - Fonction de callback
   * @param {...string} pathSegments - Segments de chemin pour les sous-collections
   * @returns {Function} Fonction de désabonnement
   */
  onCollectionSnapshot(collectionName, callback, ...pathSegments) {
    const colRef = this.getCollection(collectionName, ...pathSegments)
    return onSnapshot(colRef, (snapshot) => {
      const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(documents)
    })
  }

  /**
   * Écouter les changements d'un document
   * @param {string} collectionName - Nom de la collection
   * @param {string} docId - ID du document
   * @param {Function} callback - Fonction de callback
   * @param {...string} pathSegments - Segments de chemin pour les sous-collections
   * @returns {Function} Fonction de désabonnement
   */
  onDocumentSnapshot(collectionName, docId, callback, ...pathSegments) {
    const docRef = this.getDocumentRef(collectionName, docId, ...pathSegments)
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() })
      } else {
        callback(null)
      }
    })
  }

  /**
   * Obtenir des informations sur l'environnement actuel
   * @returns {Object} Informations sur l'environnement
   */
  getEnvironmentInfo() {
    if (!this.isInitialized) {
      return {
        environment: 'Non initialisé',
        database: 'Non initialisé',
        region: 'Non initialisé',
        projectId: 'Non déterminé',
        config: null,
        _databaseId: 'Non initialisé'
      };
    }
    
    return {
      environment: this.environment,
      database: this.database,
      region: this.region,
      projectId: this.db?.app?.options?.projectId || 'Non déterminé',
      // Informations complètes depuis configService
      config: configService.getFullConfig(),
      // Compatibilité avec l'ancienne API
      _databaseId: this.database
    }
  }
}

// Instance singleton
const firestoreService = new FirestoreService()

// Initialiser le service de manière asynchrone
firestoreService.initialize().catch(error => {
  logger.error('❌ Erreur lors de l\'initialisation de FirestoreService:', error);
});

// Exposer les fonctions de requête Firestore
firestoreService.where = where
firestoreService.orderBy = orderBy
firestoreService.limit = limit
firestoreService.startAfter = startAfter

// Export de l'instance et des fonctions utilitaires
export default firestoreService

// Fonctions utilitaires pour la compatibilité
export const {
  getCollection,
  getDocument,
  getDocuments,
  addDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  createQuery,
  queryDocuments,
  executeQuery,
  createBatch,
  executeTransaction,
  onCollectionSnapshot,
  onDocumentSnapshot,
  getEnvironmentInfo
} = firestoreService

// Export des fonctions Firestore pour la compatibilité
export {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  serverTimestamp,
  onSnapshot
}
