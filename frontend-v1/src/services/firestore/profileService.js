import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firestoreService'

const COLLECTION_NAME = 'users'

export const profileService = {
  // Récupération du profil utilisateur
  async getUserProfile(userId) {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        }
      }
      
      return null
    } catch (error) {
      throw new Error('Failed to fetch user profile: ' + error.message)
    }
  },

  // Mise à jour du profil utilisateur (champs limités)
  async updateUserProfile(userId, profileData) {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId)
      
      // Seuls certains champs peuvent être mis à jour directement
      const allowedFields = ['displayName', 'photoURL', 'phone', 'preferences']
      const updateData = {}
      
      allowedFields.forEach(field => {
        if (profileData[field] !== undefined) {
          updateData[field] = profileData[field]
        }
      })
      
      updateData.updatedAt = serverTimestamp()
      
      await updateDoc(docRef, updateData)
      
      // Récupérer le profil mis à jour
      const updatedDoc = await getDoc(docRef)
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    } catch (error) {
      throw new Error('Failed to update user profile: ' + error.message)
    }
  }
}