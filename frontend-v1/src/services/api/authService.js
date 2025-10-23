import apiClient from './apiClient'

export const authService = {
  // Vérification du token Firebase
  async verifyToken(token) {
    try {
      const response = await apiClient.post('/auth/verify-token', { token })
      return response.data
    } catch (error) {
      throw new Error('Token verification failed: ' + error.message)
    }
  },

  // Récupération de l'utilisateur connecté
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/current-user')
      return response.data
    } catch (error) {
      throw new Error('Failed to get current user: ' + error.message)
    }
  },

  // Mise à jour du profil utilisateur
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/auth/update-profile', profileData)
      return response.data
    } catch (error) {
      throw new Error('Failed to update profile: ' + error.message)
    }
  }
}