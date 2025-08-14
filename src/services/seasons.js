import { db } from './firebase'
import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
  getDoc,
  updateDoc
} from 'firebase/firestore'

const SEASONS_COLLECTION = 'seasons'

// Add a season
export async function addSeason(name, slug, pinCode, description = '') {
  return await addDoc(collection(db, SEASONS_COLLECTION), {
    name,
    slug,
    pinCode,
    description,
    createdAt: serverTimestamp(),
  })
}

// Delete a season
export async function deleteSeason(seasonId) {
  return await deleteDoc(doc(db, SEASONS_COLLECTION, seasonId))
}

// List all seasons (sorted by creation date desc)
export async function getSeasons() {
  const q = query(collection(db, SEASONS_COLLECTION), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// Get season by slug
export async function getSeasonBySlug(slug) {
  const q = query(collection(db, SEASONS_COLLECTION), where('slug', '==', slug))
  const snapshot = await getDocs(q)
  if (!snapshot.empty) {
    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() }
  }
  return null
}

// Verify PIN code for a season
export async function verifySeasonPin(seasonId, pinCode) {
  const seasonDoc = await getDoc(doc(db, SEASONS_COLLECTION, seasonId))
  if (seasonDoc.exists()) {
    const seasonData = seasonDoc.data()
    return seasonData.pinCode === pinCode
  }
  return false
}

// Get PIN code for a season
export async function getSeasonPin(seasonId) {
  const seasonDoc = await getDoc(doc(db, SEASONS_COLLECTION, seasonId))
  if (seasonDoc.exists()) {
    const seasonData = seasonDoc.data()
    return seasonData.pinCode
  }
  return null
}

// Update only the sort order of a season
export async function setSeasonSortOrder(seasonId, sortOrder) {
  const seasonRef = doc(db, SEASONS_COLLECTION, seasonId)
  await updateDoc(seasonRef, { sortOrder })
}

// Update season name (slug remains unchanged)
export async function updateSeasonName(seasonId, newName) {
  const seasonRef = doc(db, SEASONS_COLLECTION, seasonId)
  await updateDoc(seasonRef, { name: newName })
}

// Update season (name and description)
export async function updateSeason(seasonId, updates) {
  const seasonRef = doc(db, SEASONS_COLLECTION, seasonId)
  await updateDoc(seasonRef, updates)
}
