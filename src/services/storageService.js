// src/services/storageService.js
// Service centralisé pour Firebase Storage
// Garantit l'utilisation du bon préfixe selon l'environnement

import { ref, uploadBytes, getDownloadURL, deleteObject, getStorage } from 'firebase/storage'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import configService from './configService.js'
import logger from './logger.js'
import AuditClient from './auditClient.js'

/**
 * Service centralisé pour Firebase Storage
 * Garantit l'utilisation du bon préfixe selon l'environnement
 */
class StorageService {
  constructor() {
    this.storage = null // Sera initialisé plus tard
    this.auth = null // Sera initialisé plus tard
    this.environment = null
    this.prefix = null
    this.isInitialized = false
    // Ne pas appeler configService dans le constructeur
  }

  async initialize() {
    if (this.isInitialized) return this;
    
    try {
      // Attendre que configService soit initialisé
      await configService.initializeConfig();
      
      // Initialiser Firebase Auth
      if (!this.auth) {
        const { app } = await import('./firebase.js')
        this.auth = getAuth(app)
        logger.info('🔐 Firebase Auth initialisé')
      }
      
      // Initialiser Firebase Storage
      if (!this.storage) {
        const { app } = await import('./firebase.js')
        this.storage = getStorage(app)
        logger.info('📦 Firebase Storage initialisé')
      }
      
      // Utiliser configService pour la détection d'environnement
      this.environment = configService.getEnvironment()
      this.prefix = configService.getStoragePrefix()
      
      logger.info('🔧 StorageService initialisé:', {
        environment: this.environment,
        prefix: this.prefix,
        storage: this.storage ? 'OK' : 'ERREUR',
        auth: this.auth ? 'OK' : 'ERREUR'
      })
      
      this.isInitialized = true;
      return this;
    } catch (error) {
      logger.error('❌ Erreur lors de l\'initialisation de StorageService:', error);
      throw error;
    }
  }

  /**
   * Obtenir le chemin complet avec préfixe d'environnement
   * @param {string} path - Le chemin relatif
   * @returns {string} Le chemin complet avec préfixe
   */
  async getFullPath(path) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Nettoyer le chemin (enlever les slashes en début/fin)
    const cleanPath = path.replace(/^\/+|\/+$/g, '')
    return `${this.prefix}/${cleanPath}`
  }

  /**
   * Créer une référence Storage avec préfixe automatique
   * @param {string} path - Le chemin relatif
   * @returns {StorageReference} Référence Storage
   */
  async getStorageRef(path) {
    const fullPath = await this.getFullPath(path)
    return ref(this.storage, fullPath)
  }

  /**
   * S'assurer que l'utilisateur est authentifié
   * @returns {Promise<void>}
   */
  async ensureAuthenticated() {
    logger.info('🔐 Vérification de l\'authentification...', {
      auth: this.auth ? 'OK' : 'NULL',
      currentUser: this.auth?.currentUser ? 'OK' : 'NULL',
      uid: this.auth?.currentUser?.uid
    })
    
    // Si pas d'utilisateur, attendre que Firebase Auth se stabilise
    if (!this.auth.currentUser) {
      logger.info('⏳ Aucun utilisateur connecté, attente de Firebase Auth...')
      
      // Utiliser onAuthStateChanged pour attendre l'état réel
      return new Promise((resolve, reject) => {
        const maxWaitTime = 10000 // 10 secondes max
        const timeoutId = setTimeout(() => {
          logger.error('❌ Timeout: Aucun utilisateur connecté après 10 secondes', {
            auth: this.auth ? 'OK' : 'NULL',
            currentUser: this.auth?.currentUser ? 'OK' : 'NULL'
          })
          reject(new Error('Timeout: Aucun utilisateur connecté après 10 secondes'))
        }, maxWaitTime)
        
        // Écouter les changements d'état d'authentification
        const unsubscribe = onAuthStateChanged(this.auth, (user) => {
          clearTimeout(timeoutId)
          unsubscribe()
          
          if (user) {
            logger.info('✅ Utilisateur authentifié via onAuthStateChanged:', {
              uid: user.uid,
              email: user.email,
              isAnonymous: user.isAnonymous
            })
            resolve()
          } else {
            logger.error('❌ Aucun utilisateur connecté via onAuthStateChanged')
            reject(new Error('Aucun utilisateur connecté'))
          }
        })
      })
    }
    
    logger.info('✅ Utilisateur authentifié:', {
      uid: this.auth.currentUser.uid,
      email: this.auth.currentUser.email,
      isAnonymous: this.auth.currentUser.isAnonymous
    })
  }

  /**
   * Upload une image et retourne l'URL de téléchargement
   * @param {File} file - Le fichier image à uploader
   * @param {string} path - Le chemin de stockage (ex: 'season-logos/season-id')
   * @param {Object} options - Options de redimensionnement
   * @returns {Promise<string>} L'URL de téléchargement
   */
  async uploadImage(file, path, options = {}) {
    try {
      logger.info('🚀 DÉBUT UPLOAD IMAGE', { 
        fileName: file.name, 
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        fileType: file.type,
        path: path,
        options: options
      })
      
      // ÉTAPE 1: Vérification de l'initialisation
      if (!this.isInitialized) {
        logger.info('⏳ Initialisation de StorageService...')
        await this.initialize();
        logger.info('✅ StorageService initialisé')
      }
      
      // ÉTAPE 2: Vérification de la configuration
      logger.info('🔍 Vérification de la configuration', {
        environment: this.environment,
        prefix: this.prefix,
        storage: this.storage ? 'OK' : 'NULL',
        auth: this.auth ? 'OK' : 'NULL'
      })
      
      if (!this.prefix) {
        throw new Error(`Préfixe de stockage non défini. Environment: ${this.environment}`)
      }
      
      // ÉTAPE 3: Test de getFullPath
      let testPath
      try {
        testPath = await this.getFullPath(path)
        logger.info('✅ getFullPath fonctionne:', testPath)
      } catch (pathError) {
        logger.error('❌ ERREUR dans getFullPath:', {
          error: pathError.message,
          stack: pathError.stack,
          path: path,
          prefix: this.prefix
        })
        throw new Error(`Erreur de chemin: ${pathError.message}`)
      }
      
      // ÉTAPE 4: Vérification de l'authentification
      logger.info('🔐 Vérification de l\'authentification...')
      try {
        await this.ensureAuthenticated()
        logger.info('✅ Utilisateur authentifié:', this.auth.currentUser?.uid)
      } catch (authError) {
        logger.error('❌ ERREUR d\'authentification:', {
          error: authError.message,
          stack: authError.stack,
          auth: this.auth ? 'OK' : 'NULL',
          currentUser: this.auth?.currentUser ? 'OK' : 'NULL'
        })
        throw new Error(`Erreur d'authentification: ${authError.message}`)
      }
      
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image')
      }
      
      // Vérifier la taille (max 10MB avant redimensionnement)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('L\'image est trop volumineuse (max 10MB)')
      }
      
      // Redimensionner l'image si nécessaire
      let processedFile = file
      const shouldResize = options.resize !== false && (file.size > 1024 * 1024 || options.forceResize)
      
      if (shouldResize) {
        logger.info('Redimensionnement de l\'image pour optimiser les performances...')
        try {
          processedFile = await this.resizeImage(
            file, 
            options.maxWidth || 800, 
            options.maxHeight || 800, 
            options.quality || 0.8
          )
          logger.info('Image redimensionnée', { 
            newSize: `${(processedFile.size / 1024 / 1024).toFixed(2)}MB`,
            compression: `${((1 - processedFile.size / file.size) * 100).toFixed(1)}%`
          })
        } catch (resizeError) {
          logger.warn('Erreur lors du redimensionnement, utilisation du fichier original:', resizeError)
          processedFile = file
        }
      }
      
      // Créer une référence unique avec timestamp
      const timestamp = Date.now()
      const fileName = `${timestamp}_${file.name}`
      const finalPath = `${path}/${fileName}`
      const fullPath = await this.getFullPath(finalPath)
      const storageRef = ref(this.storage, fullPath)
      
      logger.info('Tentative d\'upload vers Firebase Storage...', { 
        fullPath, 
        user: this.auth.currentUser?.uid,
        isAuthenticated: !!this.auth.currentUser,
        finalSize: `${(processedFile.size / 1024 / 1024).toFixed(2)}MB`
      })
      
      // Upload du fichier avec timeout
      logger.info('🚀 Début de l\'upload...', { 
        storageRef: storageRef ? 'OK' : 'NULL',
        storageRefType: storageRef ? typeof storageRef : 'NULL',
        processedFileSize: processedFile.size
      })
      
      const uploadPromise = uploadBytes(storageRef, processedFile)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Upload trop long')), 30000)
      )
      
      const snapshot = await Promise.race([uploadPromise, timeoutPromise])
      logger.info('✅ Image uploadée avec succès', { 
        fullPath,
        snapshot: snapshot ? 'OK' : 'NULL',
        snapshotType: snapshot ? typeof snapshot : 'NULL',
        snapshotRef: snapshot?.ref ? 'OK' : 'NULL'
      })
      
      // Récupérer l'URL de téléchargement
      if (!snapshot || !snapshot.ref) {
        throw new Error(`Snapshot invalide après upload: snapshot=${!!snapshot}, ref=${!!snapshot?.ref}`)
      }
      
      logger.info('🔗 Récupération de l\'URL...', { 
        snapshotRef: snapshot.ref,
        refType: typeof snapshot.ref
      })
      
      const downloadURL = await getDownloadURL(snapshot.ref)
      logger.info('✅ URL de téléchargement récupérée', { downloadURL })
      
      // Enregistrer l'audit de l'upload
      try {
        await AuditClient.logUserAction({
          type: 'IMAGE_UPLOAD',
          category: 'storage',
          severity: 'info',
          data: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            path: path,
            fullPath: fullPath,
            downloadURL: downloadURL,
            user: this.auth.currentUser?.uid,
            environment: this.environment
          },
          success: true,
          tags: ['storage', 'image', 'upload']
        })
        logger.info('✅ Audit enregistré pour l\'upload d\'image')
      } catch (auditError) {
        logger.warn('⚠️ Erreur lors de l\'enregistrement de l\'audit:', auditError)
        // Ne pas faire échouer l'upload pour une erreur d'audit
      }
      
      return downloadURL
    } catch (error) {
      // GESTION DÉTAILLÉE DES ERREURS
      logger.error('💥 ERREUR CRITIQUE lors de l\'upload de l\'image', {
        // Informations sur l'erreur
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
        
        // Informations sur le fichier
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        fileType: file.type,
        path: path,
        
        // État du service
        isInitialized: this.isInitialized,
        environment: this.environment,
        prefix: this.prefix,
        storage: this.storage ? 'OK' : 'NULL',
        auth: this.auth ? 'OK' : 'NULL',
        currentUser: this.auth?.currentUser ? 'OK' : 'NULL'
      })
      
      // Vérifier si c'est une erreur CORS ou d'authentification
      const isCorsError = error.message.includes('CORS') || 
                         error.message.includes('preflight') || 
                         error.message.includes('permission') ||
                         error.message.includes('unauthenticated') ||
                         error.message.includes('ERR_FAILED') ||
                         error.message.includes('Timeout')
      
      if (isCorsError) {
        logger.warn('⚠️ Erreur d\'accès détectée, tentative de stockage local temporaire', {
          error: error.message,
          type: 'CORS/AUTH_ERROR'
        })
        try {
          return await this.uploadImageToLocalStorage(file, path)
        } catch (localError) {
          logger.error('❌ Échec du stockage local aussi:', {
            error: localError.message,
            stack: localError.stack
          })
          throw new Error(`Upload impossible (Firebase + Local): ${error.message}`)
        }
      }
      
      // Relancer l'erreur avec plus de contexte
      const enhancedError = new Error(`Upload échoué: ${error.message}`)
      enhancedError.originalError = error
      enhancedError.context = {
        fileName: file.name,
        fileSize: file.size,
        path: path,
        environment: this.environment
      }
      
      throw enhancedError
    }
  }

  /**
   * Redimensionne une image pour optimiser les performances
   * @param {File} file - Le fichier image original
   * @param {number} maxWidth - Largeur maximale (défaut: 800px)
   * @param {number} maxHeight - Hauteur maximale (défaut: 800px)
   * @param {number} quality - Qualité JPEG (0.1 à 1.0, défaut: 0.8)
   * @returns {Promise<File>} Le fichier redimensionné
   */
  async resizeImage(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculer les nouvelles dimensions
        let { width, height } = img
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
        
        // Configurer le canvas
        canvas.width = width
        canvas.height = height
        
        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convertir en blob avec compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Créer un nouveau fichier avec le nom original
              const resizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(resizedFile)
            } else {
              reject(new Error('Erreur lors du redimensionnement'))
            }
          },
          'image/jpeg',
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Fallback : Upload vers le stockage local (base64)
   * @param {File} file - Le fichier image
   * @param {string} path - Le chemin (pour la logique)
   * @returns {Promise<string>} L'URL base64
   */
  async uploadImageToLocalStorage(file, path) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64Data = e.target.result
        logger.info('Image stockée localement en base64', { path })
        resolve(base64Data)
      }
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'))
      reader.readAsDataURL(file)
    })
  }

  /**
   * Supprime une image du storage
   * @param {string} imageUrl - L'URL de l'image à supprimer
   * @returns {Promise<void>}
   */
  async deleteImage(imageUrl) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      logger.info('Début suppression image', { imageUrl })
      
      // Si c'est une image base64 locale, rien à supprimer
      if (imageUrl.startsWith('data:image/')) {
        logger.info('Image locale (base64), suppression ignorée')
        return
      }
      
      // S'assurer que l'utilisateur est authentifié
      await this.ensureAuthenticated()
      
      // Extraire le chemin du storage depuis l'URL
      const url = new URL(imageUrl)
      const path = url.pathname.split('/o/')[1]?.split('?')[0]
      
      if (!path) {
        throw new Error('Impossible d\'extraire le chemin de l\'image')
      }
      
      // Décoder le chemin
      const decodedPath = decodeURIComponent(path)
      const storageRef = ref(this.storage, decodedPath)
      
      // Supprimer le fichier
      await deleteObject(storageRef)
      logger.info('Image supprimée avec succès', { decodedPath })
      
      // Enregistrer l'audit de la suppression
      try {
        await AuditClient.logUserAction({
          type: 'IMAGE_DELETE',
          category: 'storage',
          severity: 'info',
          data: {
            imageUrl: imageUrl,
            decodedPath: decodedPath,
            user: this.auth?.currentUser?.uid,
            environment: this.environment
          },
          success: true,
          tags: ['storage', 'image', 'delete']
        })
        logger.info('✅ Audit enregistré pour la suppression d\'image')
      } catch (auditError) {
        logger.warn('⚠️ Erreur lors de l\'enregistrement de l\'audit:', auditError)
        // Ne pas faire échouer la suppression pour une erreur d'audit
      }
    } catch (error) {
      logger.error('Erreur lors de la suppression de l\'image', error)
      throw error
    }
  }

  /**
   * Vérifie si une URL est une image Firebase Storage
   * @param {string} url - L'URL à vérifier
   * @returns {boolean}
   */
  isFirebaseStorageUrl(url) {
    return url && url.includes('firebasestorage.googleapis.com')
  }

  /**
   * Obtenir des informations sur l'environnement actuel
   * @returns {Object} Informations sur l'environnement
   */
  async getEnvironmentInfo() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return {
      environment: this.environment,
      prefix: this.prefix,
      projectId: this.storage?.app?.options?.projectId || 'Non déterminé',
      isInitialized: this.isInitialized
    }
  }
}

// Instance singleton
const storageService = new StorageService()

// Initialiser le service de manière asynchrone
storageService.initialize().catch(error => {
  logger.error('❌ Erreur lors de l\'initialisation de StorageService:', error);
});

// Export de l'instance
export default storageService

// Fonctions utilitaires pour la compatibilité
export const {
  uploadImage,
  deleteImage,
  resizeImage,
  isFirebaseStorageUrl,
  getEnvironmentInfo
} = storageService
