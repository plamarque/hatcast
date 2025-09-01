// src/services/storageService.js
// Service centralisé pour Firebase Storage
// Garantit l'utilisation du bon préfixe selon l'environnement

import { storage, auth } from './firebase.js'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { signInAnonymously } from 'firebase/auth'
import configService from './configService.js'
import logger from './logger.js'

/**
 * Service centralisé pour Firebase Storage
 * Garantit l'utilisation du bon préfixe selon l'environnement
 */
class StorageService {
  constructor() {
    this.storage = storage
    this.auth = auth
    // Utiliser configService pour la détection d'environnement
    this.environment = configService.getEnvironment()
    this.prefix = configService.getStoragePrefix()
    
    logger.info('🔧 StorageService initialisé:', {
      environment: this.environment,
      prefix: this.prefix,
      instance: this.storage ? 'OK' : 'ERREUR'
    })
  }

  /**
   * Obtenir le chemin complet avec préfixe d'environnement
   * @param {string} path - Le chemin relatif
   * @returns {string} Le chemin complet avec préfixe
   */
  getFullPath(path) {
    // Nettoyer le chemin (enlever les slashes en début/fin)
    const cleanPath = path.replace(/^\/+|\/+$/g, '')
    return `${this.prefix}/${cleanPath}`
  }

  /**
   * Créer une référence Storage avec préfixe automatique
   * @param {string} path - Le chemin relatif
   * @returns {StorageReference} Référence Storage
   */
  getStorageRef(path) {
    const fullPath = this.getFullPath(path)
    return ref(this.storage, fullPath)
  }

  /**
   * S'assurer que l'utilisateur est authentifié
   * @returns {Promise<void>}
   */
  async ensureAuthenticated() {
    if (!this.auth.currentUser) {
      logger.info('Aucun utilisateur connecté, tentative de connexion anonyme...')
      try {
        await signInAnonymously(this.auth)
        logger.info('Connexion anonyme réussie')
      } catch (error) {
        logger.error('Erreur lors de la connexion anonyme:', error)
        throw new Error('Impossible de s\'authentifier: ' + error.message)
      }
    }
    
    // Attendre un peu que l'authentification soit stable
    await new Promise(resolve => setTimeout(resolve, 1000))
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
      logger.info('Début upload image', { 
        fileName: file.name, 
        path,
        fullPath: this.getFullPath(path),
        environment: this.environment,
        originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB` 
      })
      
      // S'assurer que l'utilisateur est authentifié
      await this.ensureAuthenticated()
      
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
      const fullPath = this.getFullPath(`${path}/${fileName}`)
      const storageRef = ref(this.storage, fullPath)
      
      logger.info('Tentative d\'upload vers Firebase Storage...', { 
        fullPath, 
        user: this.auth.currentUser?.uid,
        isAuthenticated: !!this.auth.currentUser,
        finalSize: `${(processedFile.size / 1024 / 1024).toFixed(2)}MB`
      })
      
      // Upload du fichier avec timeout
      const uploadPromise = uploadBytes(storageRef, processedFile)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Upload trop long')), 30000)
      )
      
      const snapshot = await Promise.race([uploadPromise, timeoutPromise])
      logger.info('Image uploadée avec succès', { fullPath })
      
      // Récupérer l'URL de téléchargement
      const downloadURL = await getDownloadURL(snapshot.ref)
      logger.info('URL de téléchargement récupérée', { downloadURL })
      
      return downloadURL
    } catch (error) {
      logger.error('Erreur lors de l\'upload de l\'image', error)
      
      // Vérifier si c'est une erreur CORS ou d'authentification
      const isCorsError = error.message.includes('CORS') || 
                         error.message.includes('preflight') || 
                         error.message.includes('permission') ||
                         error.message.includes('unauthenticated') ||
                         error.message.includes('ERR_FAILED') ||
                         error.message.includes('Timeout')
      
      if (isCorsError) {
        logger.warn('Erreur d\'accès détectée, utilisation du stockage local temporaire', error.message)
        return await this.uploadImageToLocalStorage(file, path)
      }
      
      throw error
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
  getEnvironmentInfo() {
    return {
      environment: this.environment,
      prefix: this.prefix,
      projectId: this.storage?.app?.options?.projectId || 'Non déterminé'
    }
  }
}

// Instance singleton
const storageService = new StorageService()

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
