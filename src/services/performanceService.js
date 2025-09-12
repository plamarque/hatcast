/**
 * Service de mesure de performance pour l'application
 * Permet de mesurer précisément les temps de chargement et d'identifier les goulots d'étranglement
 */

import logger from './logger.js'

class PerformanceService {
  constructor() {
    this.markers = new Map()
    this.measurements = new Map()
    this.isEnabled = true
  }

  /**
   * Marquer le début d'une opération
   * @param {string} name - Nom de l'opération
   * @param {Object} metadata - Métadonnées optionnelles
   */
  start(name, metadata = {}) {
    if (!this.isEnabled) return

    const marker = {
      name,
      startTime: performance.now(),
      startTimestamp: Date.now(),
      metadata
    }
    
    this.markers.set(name, marker)
    logger.debug(`⏱️ Performance: Début de "${name}"`, metadata)
  }

  /**
   * Marquer la fin d'une opération et calculer la durée
   * @param {string} name - Nom de l'opération
   * @param {Object} metadata - Métadonnées optionnelles
   * @returns {number} Durée en millisecondes
   */
  end(name, metadata = {}) {
    if (!this.isEnabled) return 0

    const marker = this.markers.get(name)
    if (!marker) {
      logger.warn(`⚠️ Performance: Marqueur "${name}" non trouvé`)
      return 0
    }

    const duration = performance.now() - marker.startTime
    const endTimestamp = Date.now()
    
    const measurement = {
      name,
      duration,
      startTime: marker.startTime,
      endTime: performance.now(),
      startTimestamp: marker.startTimestamp,
      endTimestamp,
      metadata: { ...marker.metadata, ...metadata }
    }

    this.measurements.set(name, measurement)
    this.markers.delete(name)

    logger.debug(`⏱️ Performance: Fin de "${name}" - ${duration.toFixed(2)}ms`, metadata)
    return duration
  }

  /**
   * Mesurer une opération asynchrone
   * @param {string} name - Nom de l'opération
   * @param {Function} operation - Fonction à mesurer
   * @param {Object} metadata - Métadonnées optionnelles
   * @returns {Promise} Résultat de l'opération
   */
  async measure(name, operation, metadata = {}) {
    this.start(name, metadata)
    try {
      const result = await operation()
      this.end(name, { success: true, ...metadata })
      return result
    } catch (error) {
      this.end(name, { success: false, error: error.message, ...metadata })
      throw error
    }
  }

  /**
   * Obtenir une mesure spécifique
   * @param {string} name - Nom de la mesure
   * @returns {Object|null} Mesure ou null
   */
  getMeasurement(name) {
    return this.measurements.get(name) || null
  }

  /**
   * Obtenir toutes les mesures
   * @returns {Array} Toutes les mesures
   */
  getAllMeasurements() {
    return Array.from(this.measurements.values())
  }

  /**
   * Obtenir un résumé des performances
   * @returns {Object} Résumé des performances
   */
  getSummary() {
    const measurements = this.getAllMeasurements()
    const totalDuration = measurements.reduce((sum, m) => sum + m.duration, 0)
    
    return {
      totalMeasurements: measurements.length,
      totalDuration: totalDuration.toFixed(2) + 'ms',
      measurements: measurements.map(m => ({
        name: m.name,
        duration: m.duration.toFixed(2) + 'ms',
        metadata: m.metadata
      }))
    }
  }

  /**
   * Afficher un résumé dans la console
   */
  logSummary() {
    const summary = this.getSummary()
    console.group('📊 Résumé des performances')
    console.log(`Total: ${summary.totalDuration}`)
    console.table(summary.measurements)
    console.groupEnd()
  }

  /**
   * Nettoyer les mesures anciennes
   * @param {number} maxAge - Âge maximum en millisecondes
   */
  cleanup(maxAge = 300000) { // 5 minutes par défaut
    const now = Date.now()
    for (const [name, measurement] of this.measurements.entries()) {
      if (now - measurement.endTimestamp > maxAge) {
        this.measurements.delete(name)
      }
    }
  }

  /**
   * Activer/désactiver le service
   * @param {boolean} enabled - État du service
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
  }

  /**
   * Mesurer le temps de chargement de la grille complète
   * @param {Function} gridLoadingFunction - Fonction de chargement de la grille
   * @returns {Promise} Résultat du chargement
   */
  async measureGridLoading(gridLoadingFunction) {
    return this.measure('grid_loading', gridLoadingFunction, {
      type: 'grid_loading',
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Mesurer le temps de chargement d'un écran détail événement
   * @param {Function} eventDetailFunction - Fonction de chargement du détail
   * @param {string} eventId - ID de l'événement
   * @returns {Promise} Résultat du chargement
   */
  async measureEventDetailLoading(eventDetailFunction, eventId) {
    return this.measure('event_detail_loading', eventDetailFunction, {
      type: 'event_detail_loading',
      eventId,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Mesurer une étape spécifique du chargement
   * @param {string} stepName - Nom de l'étape
   * @param {Function} stepFunction - Fonction de l'étape
   * @param {Object} metadata - Métadonnées
   * @returns {Promise} Résultat de l'étape
   */
  async measureStep(stepName, stepFunction, metadata = {}) {
    return this.measure(`step_${stepName}`, stepFunction, {
      type: 'loading_step',
      step: stepName,
      ...metadata
    })
  }
}

// Instance singleton
const performanceService = new PerformanceService()

// Nettoyage automatique toutes les 5 minutes
setInterval(() => {
  performanceService.cleanup()
}, 300000)

export default performanceService
