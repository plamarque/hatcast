import apiClient from './apiClient'

export const seasonsService = {
  // Récupération de toutes les saisons
  async getAllSeasons(active = null) {
    try {
      const params = active !== null ? { active } : {}
      const response = await apiClient.get('/seasons', { params })
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch seasons: ' + error.message)
    }
  },

  // Récupération d'une saison par ID
  async getSeasonById(id) {
    try {
      const response = await apiClient.get(`/seasons/${id}`)
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch season: ' + error.message)
    }
  },

  // Création d'une saison (ADMIN)
  async createSeason(seasonData) {
    try {
      const response = await apiClient.post('/seasons', seasonData)
      return response.data
    } catch (error) {
      throw new Error('Failed to create season: ' + error.message)
    }
  },

  // Mise à jour d'une saison (ADMIN)
  async updateSeason(id, seasonData) {
    try {
      const response = await apiClient.put(`/seasons/${id}`, seasonData)
      return response.data
    } catch (error) {
      throw new Error('Failed to update season: ' + error.message)
    }
  },

  // Suppression d'une saison (ADMIN)
  async deleteSeason(id) {
    try {
      await apiClient.delete(`/seasons/${id}`)
      return true
    } catch (error) {
      throw new Error('Failed to delete season: ' + error.message)
    }
  }
}