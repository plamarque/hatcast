// src/services/imageUpload.js
import storageService from './storageService.js'
import logger from './logger.js'

/**
 * Upload une image et retourne l'URL de téléchargement
 * @param {File} file - Le fichier image à uploader
 * @param {string} path - Le chemin de stockage (ex: 'season-logos/season-id')
 * @param {Object} options - Options de redimensionnement
 * @returns {Promise<string>} L'URL de téléchargement
 */
export async function uploadImage(file, path, options = {}) {
  return storageService.uploadImage(file, path, options)
}

/**
 * Supprime une image du storage
 * @param {string} imageUrl - L'URL de l'image à supprimer
 * @returns {Promise<void>}
 */
export async function deleteImage(imageUrl) {
  return storageService.deleteImage(imageUrl)
}

/**
 * Vérifie si une URL est une image Firebase Storage
 * @param {string} url - L'URL à vérifier
 * @returns {boolean}
 */
export function isFirebaseStorageUrl(url) {
  return storageService.isFirebaseStorageUrl(url)
}

/**
 * Redimensionne une image pour optimiser les performances
 * @param {File} file - Le fichier image original
 * @param {number} maxWidth - Largeur maximale (défaut: 800px)
 * @param {number} maxHeight - Hauteur maximale (défaut: 800px)
 * @param {number} quality - Qualité JPEG (0.1 à 1.0, défaut: 0.8)
 * @returns {Promise<File>} Le fichier redimensionné
 */
export async function resizeImage(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
  return storageService.resizeImage(file, maxWidth, maxHeight, quality)
}

/**
 * S'assure que l'utilisateur est authentifié
 * @returns {Promise<void>}
 */
export async function ensureAuthenticated() {
  return storageService.ensureAuthenticated()
}

/**
 * Fallback : Upload vers le stockage local (base64)
 * @param {File} file - Le fichier image
 * @param {string} path - Le chemin (pour la logique)
 * @returns {Promise<string>} L'URL base64
 */
export async function uploadImageToLocalStorage(file, path) {
  return storageService.uploadImageToLocalStorage(file, path)
}
