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
  getDoc
} from 'firebase/firestore'

const SEASONS_COLLECTION = 'seasons'

// Add a season
export async function addSeason(name, slug, pinCode) {
  return await addDoc(collection(db, SEASONS_COLLECTION), {
    name,
    slug,
    pinCode,
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
