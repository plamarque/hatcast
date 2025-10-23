import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firestoreService'

const COLLECTION_NAME = 'availabilities'

export const availabilitiesService = {
  // Récupération des disponibilités d'un utilisateur
  async getUserAvailabilities(userId) {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId))
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      throw new Error('Failed to fetch user availabilities: ' + error.message)
    }
  },

  // Récupération des disponibilités pour un spectacle
  async getShowAvailabilities(showId) {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('showId', '==', showId))
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      throw new Error('Failed to fetch show availabilities: ' + error.message)
    }
  },

  // Récupération d'une disponibilité spécifique
  async getAvailability(userId, showId) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('userId', '==', userId),
        where('showId', '==', showId)
      )
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return null
      }
      
      const doc = querySnapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data()
      }
    } catch (error) {
      throw new Error('Failed to fetch availability: ' + error.message)
    }
  },

  // Mise à jour d'une disponibilité
  async updateAvailability(userId, showId, availabilityData) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('userId', '==', userId),
        where('showId', '==', showId)
      )
      const querySnapshot = await getDocs(q)
      
      const data = {
        ...availabilityData,
        userId,
        showId,
        updatedAt: serverTimestamp()
      }
      
      if (querySnapshot.empty) {
        // Créer une nouvelle disponibilité
        const docRef = doc(collection(db, COLLECTION_NAME))
        await setDoc(docRef, {
          ...data,
          createdAt: serverTimestamp()
        })
        return { id: docRef.id, ...data }
      } else {
        // Mettre à jour l'existante
        const docRef = querySnapshot.docs[0].ref
        await updateDoc(docRef, data)
        return { id: docRef.id, ...data }
      }
    } catch (error) {
      throw new Error('Failed to update availability: ' + error.message)
    }
  },

  // Suppression d'une disponibilité
  async deleteAvailability(userId, showId) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('userId', '==', userId),
        where('showId', '==', showId)
      )
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref
        await deleteDoc(docRef)
        return true
      }
      
      return false
    } catch (error) {
      throw new Error('Failed to delete availability: ' + error.message)
    }
  },

  // Écoute en temps réel des disponibilités d'un utilisateur
  subscribeToUserAvailabilities(userId, callback) {
    const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId))
    
    return onSnapshot(q, (querySnapshot) => {
      const availabilities = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(availabilities)
    })
  },

  // Écoute en temps réel des disponibilités d'un spectacle
  subscribeToShowAvailabilities(showId, callback) {
    const q = query(collection(db, COLLECTION_NAME), where('showId', '==', showId))
    
    return onSnapshot(q, (querySnapshot) => {
      const availabilities = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(availabilities)
    })
  }
}