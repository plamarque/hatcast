import firestoreService from './firestoreService.js'
import { orderBy, where } from 'firebase/firestore'

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
    const q = firestoreService.createQuery(SEASONS_COLLECTION, [orderBy('createdAt', 'desc')])
    const seasons = await firestoreService.executeQuery(q)
    console.log('🔧 getSeasons: saisons chargées depuis Firebase:', seasons.length)
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
  const q = firestoreService.createQuery(SEASONS_COLLECTION, [where('slug', '==', slug)])
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
  await firestoreService.updateDocument(SEASONS_COLLECTION, seasonId, { sortOrder })
}

// Update season name (slug remains unchanged)
export async function updateSeasonName(seasonId, newName) {
  await firestoreService.updateDocument(SEASONS_COLLECTION, seasonId, { name: newName })
}

// Update season (name, description and logo)
export async function updateSeason(seasonId, updates) {
  await firestoreService.updateDocument(SEASONS_COLLECTION, seasonId, updates)
}
