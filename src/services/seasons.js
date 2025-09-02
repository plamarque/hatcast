import firestoreService from './firestoreService.js'
import logger from './logger.js'

const SEASONS_COLLECTION = 'seasons'

// Helper function to ensure firestoreService is initialized
async function ensureFirestoreService() {
  if (!firestoreService.isInitialized) {
    await firestoreService.initialize();
  }
  return firestoreService;
}

// Add a season
export async function addSeason(name, slug, pinCode, description = '', logoUrl = '') {
  logger.info('🔧 addSeason: création depuis Firestore')
  const service = await ensureFirestoreService();
  return await service.addDocument(SEASONS_COLLECTION, {
    name,
    slug,
    pinCode,
    description,
    logoUrl
  })
}

// Delete a season
export async function deleteSeason(seasonId) {
  const service = await ensureFirestoreService();
  return await service.deleteDocument(SEASONS_COLLECTION, seasonId)
}

// List all seasons (sorted by creation date desc)
export async function getSeasons() {
  try {
    const service = await ensureFirestoreService();
    logger.info('🔧 getSeasons: chargement depuis Firestore')
    const q = service.createQuery(SEASONS_COLLECTION, [service.orderBy('createdAt', 'desc')])
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
  const service = await ensureFirestoreService();
  const q = service.createQuery(SEASONS_COLLECTION, [service.where('slug', '==', slug)])
  const seasons = await service.executeQuery(q)
  return seasons.length > 0 ? seasons[0] : null
}

// Verify PIN code for a season
export async function verifySeasonPin(seasonId, pinCode) {
  const service = await ensureFirestoreService();
  const season = await service.getDocument(SEASONS_COLLECTION, seasonId)
  return season ? season.pinCode === pinCode : false
}

// Get PIN code for a season
export async function getSeasonPin(seasonId) {
  try {
    logger.info('🔍 getSeasonPin: début', { seasonId })
    const service = await ensureFirestoreService();
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
  const service = await ensureFirestoreService();
  await service.updateDocument(SEASONS_COLLECTION, seasonId, { sortOrder: validSortOrder })
}
// Update season name (slug remains unchanged)
export async function updateSeasonName(seasonId, newName) {
  const service = await ensureFirestoreService();
  await service.updateDocument(SEASONS_COLLECTION, seasonId, { name: newName })
}

// Update season (name, description and logo)
export async function updateSeason(seasonId, updates) {
  const service = await ensureFirestoreService();
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
