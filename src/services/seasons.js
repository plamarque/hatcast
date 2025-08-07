import { db } from './firebase'
import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  doc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore'

const SEASONS_COLLECTION = 'seasons'

// Add a season
export async function addSeason(name, slug) {
  return await addDoc(collection(db, SEASONS_COLLECTION), {
    name,
    slug,
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
