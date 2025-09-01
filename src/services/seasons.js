import firestoreService from './firestoreService.js'

const SEASONS_COLLECTION = 'seasons'

// Add a season
export async function addSeason(name, slug, pinCode, description = '', logoUrl = '') {
  console.log('🔧 addSeason: création depuis Firestore')
  return await firestoreService.addDocument(SEASONS_COLLECTION, {
    name,
    slug,
    pinCode,
    description,
    logoUrl
  })
}

// Delete a season
export async function deleteSeason(seasonId) {
  return await firestoreService.deleteDocument(SEASONS_COLLECTION, seasonId)
}

// List all seasons (sorted by creation date desc)
export async function getSeasons() {
  try {
    console.log('🔧 getSeasons: chargement depuis Firestore')
    const q = firestoreService.createQuery(SEASONS_COLLECTION, [firestoreService.orderBy('createdAt', 'desc')])
    const seasons = await firestoreService.executeQuery(q)
    console.log('🔧 getSeasons: saisons chargées depuis Firebase:', seasons.length)
    
    // Vérifier si des saisons n'ont pas de sortOrder et les initialiser
    const needSortOrder = seasons.some(s => typeof s.sortOrder !== 'number' || isNaN(s.sortOrder))
    if (needSortOrder) {
      console.log('🔧 getSeasons: des saisons n\'ont pas de sortOrder, initialisation...')
      // On initialise en arrière-plan et on retourne les saisons actuelles
      initializeMissingSortOrders(seasons).catch(error => {
        console.error('❌ Erreur lors de l\'initialisation des sortOrder:', error)
      })
    }
    
    return seasons
  } catch (error) {
    // Gestion robuste des erreurs : collection inexistante = base vide
    if (error.code === 'permission-denied' || error.code === 'not-found') {
      console.log('🔍 Collection seasons non trouvée ou vide, retour d\'un tableau vide')
      return []
    }
    console.error('Erreur lors du chargement des saisons:', error)
    return []
  }
}

// Get season by slug
export async function getSeasonBySlug(slug) {
  const q = firestoreService.createQuery(SEASONS_COLLECTION, [firestoreService.where('slug', '==', slug)])
  const seasons = await firestoreService.executeQuery(q)
  return seasons.length > 0 ? seasons[0] : null
}

// Verify PIN code for a season
export async function verifySeasonPin(seasonId, pinCode) {
  const season = await firestoreService.getDocument(SEASONS_COLLECTION, seasonId)
  return season ? season.pinCode === pinCode : false
}

// Get PIN code for a season
export async function getSeasonPin(seasonId) {
  const season = await firestoreService.getDocument(SEASONS_COLLECTION, seasonId)
  return season ? season.pinCode : null
}

// Update only the sort order of a season
export async function setSeasonSortOrder(seasonId, sortOrder) {
  // Valider que sortOrder est un nombre valide
  const validSortOrder = typeof sortOrder === 'number' && !isNaN(sortOrder) ? sortOrder : 0
  console.log('🔧 setSeasonSortOrder: seasonId =', seasonId, 'sortOrder =', sortOrder, 'validSortOrder =', validSortOrder)
  await firestoreService.updateDocument(SEASONS_COLLECTION, seasonId, { sortOrder: validSortOrder })
}
// Update season name (slug remains unchanged)
export async function updateSeasonName(seasonId, newName) {
  await firestoreService.updateDocument(SEASONS_COLLECTION, seasonId, { name: newName })
}

// Update season (name, description and logo)
export async function updateSeason(seasonId, updates) {
  await firestoreService.updateDocument(SEASONS_COLLECTION, seasonId, updates)
}

// Initialize missing sortOrder values for provided seasons array
export async function initializeMissingSortOrders(seasons) {
  try {
    console.log('🔧 initializeMissingSortOrders: début avec', seasons.length, 'saisons')
    
    // Trouver l'ordre max existant
    const existingOrders = seasons
      .map(s => (typeof s.sortOrder === 'number' ? s.sortOrder : null))
      .filter(v => v !== null)
    let maxOrder = existingOrders.length ? Math.max(...existingOrders) : 0
    
    console.log('🔧 initializeMissingSortOrders: maxOrder existant =', maxOrder)
    
    // Affecter un sortOrder aux saisons qui n'en ont pas
    for (const season of seasons) {
      if (typeof season.sortOrder !== 'number' || isNaN(season.sortOrder)) {
        maxOrder += 1
        console.log('🔧 initializeMissingSortOrders: affectation sortOrder =', maxOrder, 'à la saison', season.name)
        await setSeasonSortOrder(season.id, maxOrder)
      }
    }
    
    console.log('🔧 initializeMissingSortOrders: terminé')
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des sortOrder:', error)
  }
}
