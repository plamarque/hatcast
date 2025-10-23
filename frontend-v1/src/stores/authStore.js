import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { auth } from '@/services/firestore/firestoreService'
import { authService } from '@/services/api/authService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role || 'GUEST')
  const isAdmin = computed(() => userRole.value === 'ADMIN')

  // Actions
  const setUser = (userData) => {
    user.value = userData
    error.value = null
  }

  const setLoading = (isLoading) => {
    loading.value = isLoading
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  // Connexion avec email/mot de passe
  const loginWithEmail = async (email, password) => {
    try {
      setLoading(true)
      clearError()
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      
      // Récupérer les données utilisateur depuis l'API
      const userData = await authService.getCurrentUser()
      setUser(userData)
      
      return userData
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Connexion avec Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true)
      clearError()
      
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      const firebaseUser = userCredential.user
      
      // Récupérer les données utilisateur depuis l'API
      const userData = await authService.getCurrentUser()
      setUser(userData)
      
      return userData
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Déconnexion
  const logout = async () => {
    try {
      setLoading(true)
      await signOut(auth)
      setUser(null)
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Mise à jour du profil
  const updateProfile = async (profileData) => {
    try {
      setLoading(true)
      clearError()
      
      const updatedUser = await authService.updateProfile(profileData)
      setUser(updatedUser)
      
      return updatedUser
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Récupération du token Firebase
  const getFirebaseToken = async () => {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken()
    }
    return null
  }

  // Initialisation de l'état d'authentification
  const initializeAuth = () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          console.error('Failed to get user data:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
    })
  }

  return {
    // State
    user,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    userRole,
    isAdmin,
    
    // Actions
    setUser,
    setLoading,
    setError,
    clearError,
    loginWithEmail,
    loginWithGoogle,
    logout,
    updateProfile,
    getFirebaseToken,
    initializeAuth
  }
})