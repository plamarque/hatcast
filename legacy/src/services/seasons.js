import firestoreService from './firestoreService.js'
import logger from './logger.js'
import { loadEvents, loadPlayers, loadAvailability, loadCasts } from './storage.js'
import { deleteImage, isFirebaseStorageUrl } from './imageUpload.js'

const SEASONS_COLLECTION = 'seasons'

// firestoreService s'initialise automatiquement au chargement du module

// Add a season
export async function addSeason(name, slug, pinCode, description = '', logoUrl = '') {
  logger.info('🔧 addSeason: création depuis Firestore')
  const service = firestoreService;
  const seasonId = await service.addDocument(SEASONS_COLLECTION, {
    name,
    slug,
    pinCode,
    description,
    logoUrl
  })
  
  logger.info('🔧 addSeason: saison créée avec ID:', seasonId)
  return seasonId
}

// Delete a season
export async function deleteSeason(seasonId) {
  const service = firestoreService;
  return await service.deleteDocument(SEASONS_COLLECTION, seasonId)
}

// List all seasons (sorted by creation date desc)
export async function getSeasons() {
  try {
    const service = firestoreService;
    logger.info('🔧 getSeasons: chargement depuis Firestore')
    const q = await service.createQuery(SEASONS_COLLECTION, [service.orderBy('createdAt', 'desc')])
    
    const seasons = await service.executeQuery(q)
    logger.info('🔧 getSeasons: saisons chargées depuis Firebase:', seasons.length)
    
    // Vérifier si des saisons n'ont pas de sortOrder et les initialiser
    const needSortOrder = seasons.some(s => typeof s.sortOrder !== 'number' || isNaN(s.sortOrder))
    if (needSortOrder) {
      logger.info('🔧 getSeasons: des saisons n\'ont pas de sortOrder, initialisation...')
      // On initialise en arrière-plan et on retourne les saisons actuelles
      initializeMissingSortOrders(seasons).catch(error => {
        logger.error('❌ Erreur lors de l\'initialisation des sortOrder:', error)
      })
    }
    
    return seasons
  } catch (error) {
    // Gestion robuste des erreurs : collection inexistante = base vide
    if (error.code === 'permission-denied' || error.code === 'not-found') {
      logger.info('🔍 Collection seasons non trouvée ou vide, retour d\'un tableau vide')
      return []
    }
    logger.error('Erreur lors du chargement des saisons:', error)
    return []
  }
}

// Get season by slug
export async function getSeasonBySlug(slug) {
  const service = firestoreService;
  const q = service.createQuery(SEASONS_COLLECTION, [service.where('slug', '==', slug)])
  const seasons = await service.executeQuery(q)
  return seasons.length > 0 ? seasons[0] : null
}

// Verify PIN code for a season
export async function verifySeasonPin(seasonId, pinCode) {
  const service = firestoreService;
  const season = await service.getDocument(SEASONS_COLLECTION, seasonId)
  return season ? season.pinCode === pinCode : false
}

// Get PIN code for a season
export async function getSeasonPin(seasonId) {
  try {
    logger.info('🔍 getSeasonPin: début', { seasonId })
    const service = firestoreService;
    logger.info('🔍 getSeasonPin: service initialisé')
    const season = await service.getDocument(SEASONS_COLLECTION, seasonId)
    logger.info('🔍 getSeasonPin: document récupéré', { season: season ? { id: season.id, pinCode: season.pinCode } : null })
    return season ? season.pinCode : null
  } catch (error) {
    logger.error('🔍 getSeasonPin: erreur', error)
    throw error
  }
}

// Update only the sort order of a season
export async function setSeasonSortOrder(seasonId, sortOrder) {
  // Valider que sortOrder est un nombre valide
  const validSortOrder = typeof sortOrder === 'number' && !isNaN(sortOrder) ? sortOrder : 0
  logger.info('🔧 setSeasonSortOrder: seasonId =', seasonId, 'sortOrder =', sortOrder, 'validSortOrder =', validSortOrder)
  const service = firestoreService;
  await service.updateDocument(SEASONS_COLLECTION, seasonId, { sortOrder: validSortOrder })
}
// Update season name (slug remains unchanged)
export async function updateSeasonName(seasonId, newName) {
  const service = firestoreService;
  await service.updateDocument(SEASONS_COLLECTION, seasonId, { name: newName })
}

// Update season (name, description and logo)
export async function updateSeason(seasonId, updates) {
  const service = firestoreService;
  await service.updateDocument(SEASONS_COLLECTION, seasonId, updates)
}

// Initialize missing sortOrder values for provided seasons array
export async function initializeMissingSortOrders(seasons) {
  try {
    logger.info('🔧 initializeMissingSortOrders: début avec', seasons.length, 'saisons')
    
    // Trouver l'ordre max existant
    const existingOrders = seasons
      .map(s => (typeof s.sortOrder === 'number' ? s.sortOrder : null))
      .filter(v => v !== null)
    let maxOrder = existingOrders.length ? Math.max(...existingOrders) : 0
    
    logger.info('🔧 initializeMissingSortOrders: maxOrder existant =', maxOrder)
    
    // Affecter un sortOrder aux saisons qui n'en ont pas
    for (const season of seasons) {
      if (typeof season.sortOrder !== 'number' || isNaN(season.sortOrder)) {
        maxOrder += 1
        logger.info('🔧 initializeMissingSortOrders: affectation sortOrder =', maxOrder, 'à la saison', season.name)
        await setSeasonSortOrder(season.id, maxOrder)
      }
    }
    
    logger.info('🔧 initializeMissingSortOrders: terminé')
  } catch (error) {
    logger.error('❌ Erreur lors de l\'initialisation des sortOrder:', error)
  }
}

// ===== FONCTIONS D'EXPORT CSV =====

/**
 * Exporte les disponibilités d'une saison en CSV
 * @param {Object} season - Objet saison avec id, name, slug
 * @param {Object} options - Options d'export
 * @returns {Promise<void>}
 */
export async function exportSeasonAvailabilitiesCsv(season, options = {}) {
  try {
    if (!season?.id) {
      throw new Error('Saison introuvable')
    }

    logger.info('Export des disponibilités en cours...', { seasonId: season.id })

    // Charger toutes les données nécessaires
    const [eventsData, playersData] = await Promise.all([
      loadEvents(season.id),
      loadPlayers(season.id)
    ])
    
    const [availabilityData, castsData] = await Promise.all([
      loadAvailability(playersData, eventsData, season.id),
      loadCasts(season.id)
    ])

    // Construire le contenu CSV
    const csvContent = buildCsvContent(eventsData, playersData, availabilityData, castsData)
    
    // Créer et télécharger le fichier
    const fileName = generateCsvFileName(season)
    downloadCsvFile(csvContent, fileName)

    logger.info('Export des disponibilités terminé', { 
      seasonId: season.id, 
      events: eventsData.length, 
      players: playersData.length 
    })

    // Callback de succès si fourni
    if (options.onSuccess) {
      options.onSuccess()
    }

  } catch (error) {
    logger.error('Erreur lors de l\'export des disponibilités:', error)
    
    // Callback d'erreur si fourni
    if (options.onError) {
      options.onError(error)
    } else {
      throw error
    }
  }
}

/**
 * Construit le contenu CSV à partir des données
 */
function buildCsvContent(events, players, availability, casts) {
  // Construire l'en-tête
  const header = ['Joueur', ...events.map(event => formatCsvHeaderForEvent(event))]

  // Construire les lignes
  const rows = []
  for (const player of players) {
    const name = player?.name || ''
    const availMap = availability?.[name] || {}
    const line = [name, ...events.map(event => getCellValue(availMap[event.id], casts?.[event.id], name))]
    rows.push(line)
  }

  // Générer le CSV (avec BOM pour Excel)
  const csv = toCsvString([header, ...rows])
  return '\ufeff' + csv
}

/**
 * Formate l'en-tête CSV pour un événement
 */
function formatCsvHeaderForEvent(event) {
  const dateObj = toDateObject(event?.date)
  const iso = dateObj ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}` : ''
  const title = event?.title || event?.name || 'Sans titre'
  return `${iso} · ${title}`.trim()
}

/**
 * Obtient la valeur d'une cellule pour l'export
 */
function getCellValue(availability, cast, playerName) {
  if (cast && cast.players && cast.players.includes(playerName)) {
    return 'sélectionné'
  }
  return availabilityToString(availability?.status)
}

/**
 * Convertit une disponibilité en string
 */
function availabilityToString(value) {
  if (value === true || value === 'oui' || value === 'disponible') return 'disponible'
  if (value === false || value === 'non' || value === 'indisponible') return 'non disponible'
  if (value === 'peut-être' || value === 'peut-etre') return 'peut-être'
  return 'non défini'
}

/**
 * Convertit une valeur en objet Date
 */
function toDateObject(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === 'function') return value.toDate()
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

/**
 * Convertit une matrice en string CSV
 */
function toCsvString(matrix) {
  return matrix.map(row => row.map(csvEscape).join(',')).join('\n')
}

/**
 * Échappe une valeur pour le CSV
 */
function csvEscape(value) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Génère le nom de fichier pour l'export
 */
function generateCsvFileName(season) {
  const base = season?.name || season?.slug || 'saison'
  const sanitized = sanitizeFilename(base)
  const date = new Date().toISOString().split('T')[0]
  return `${sanitized}-disponibilites-${date}.csv`
}

/**
 * Nettoie un nom de fichier
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

/**
 * Télécharge un fichier CSV
 */
function downloadCsvFile(content, fileName) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ===== FONCTIONS DE SUPPRESSION AVANCÉE =====

/**
 * Supprime une saison avec confirmation
 * @param {Object} season - Objet saison à supprimer
 * @param {Object} options - Options de suppression
 * @returns {Promise<boolean>} true si supprimé, false si annulé
 */
export async function deleteSeasonWithConfirmation(season, options = {}) {
  try {
    if (!season?.id) {
      throw new Error('Saison introuvable')
    }

    // Demander confirmation
    const confirmed = await requestDeletionConfirmation(season, options)
    if (!confirmed) {
      return false
    }

    // Supprimer la saison
    await performSeasonDeletion(season, options)

    logger.info('Saison supprimée avec succès', { seasonId: season.id })

    // Callback de succès si fourni
    if (options.onSuccess) {
      options.onSuccess(season)
    }

    return true

  } catch (error) {
    logger.error('Erreur lors de la suppression de la saison:', error)
    
    // Callback d'erreur si fourni
    if (options.onError) {
      options.onError(error)
    } else {
      throw error
    }
    
    return false
  }
}

/**
 * Supprime une saison directement (sans confirmation)
 * @param {Object} season - Saison à supprimer
 * @param {Object} options - Options
 */
export async function deleteSeasonDirect(season, options = {}) {
  try {
    if (!season?.id) {
      throw new Error('Saison introuvable')
    }

    await performSeasonDeletion(season, options)

    logger.info('Saison supprimée directement', { seasonId: season.id })

    if (options.onSuccess) {
      options.onSuccess(season)
    }

  } catch (error) {
    logger.error('Erreur lors de la suppression directe de la saison:', error)
    
    if (options.onError) {
      options.onError(error)
    } else {
      throw error
    }
  }
}

/**
 * Demande confirmation à l'utilisateur
 */
async function requestDeletionConfirmation(season, options = {}) {
  const message = options.confirmationMessage || 
    `Êtes-vous sûr de vouloir supprimer la saison "${season.name}" ?\n\nCette action est irréversible et supprimera :\n• Tous les événements\n• Toutes les disponibilités\n• Tous les joueurs\n• Le logo de la saison`
  
  return confirm(message)
}

/**
 * Effectue la suppression de la saison
 */
async function performSeasonDeletion(season, options = {}) {
  logger.info('Suppression de la saison en cours...', { seasonId: season.id })

  // Supprimer le logo du storage s'il existe
  await deleteSeasonLogo(season)

  // Supprimer la saison de Firestore
  await deleteSeason(season.id)

  // Callback de suppression si fourni
  if (options.onDeleted) {
    options.onDeleted(season)
  }
}

/**
 * Supprime le logo de la saison du storage
 */
async function deleteSeasonLogo(season) {
  if (season?.logoUrl && isFirebaseStorageUrl(season.logoUrl)) {
    try {
      await deleteImage(season.logoUrl)
      logger.info('Logo de la saison supprimé du storage')
    } catch (deleteError) {
      logger.warn('Erreur lors de la suppression du logo du storage:', deleteError)
      // Continuer même si la suppression du fichier échoue
    }
  }
}
