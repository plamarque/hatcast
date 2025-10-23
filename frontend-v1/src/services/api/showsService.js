import apiClient from './apiClient'

export const showsService = {
  // Récupération de tous les spectacles
  async getAllShows(filters = {}) {
    try {
      const { seasonId, status, active } = filters
      const params = {}
      
      if (seasonId) params.seasonId = seasonId
      if (status) params.status = status
      if (active !== undefined) params.active = active
      
      const response = await apiClient.get('/shows', { params })
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch shows: ' + error.message)
    }
  },

  // Récupération d'un spectacle par ID
  async getShowById(id) {
    try {
      const response = await apiClient.get(`/shows/${id}`)
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch show: ' + error.message)
    }
  },

  // Création d'un spectacle
  async createShow(showData) {
    try {
      const response = await apiClient.post('/shows', showData)
      return response.data
    } catch (error) {
      throw new Error('Failed to create show: ' + error.message)
    }
  },

  // Mise à jour d'un spectacle
  async updateShow(id, showData) {
    try {
      const response = await apiClient.put(`/shows/${id}`, showData)
      return response.data
    } catch (error) {
      throw new Error('Failed to update show: ' + error.message)
    }
  },

  // Suppression d'un spectacle
  async deleteShow(id) {
    try {
      await apiClient.delete(`/shows/${id}`)
      return true
    } catch (error) {
      throw new Error('Failed to delete show: ' + error.message)
    }
  }
}