import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { seasonsService } from '@/services/api/seasonsService'

export const useSeasonsStore = defineStore('seasons', () => {
  // State
  const seasons = ref([])
  const currentSeason = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const activeSeasons = computed(() => 
    seasons.value.filter(season => season.active)
  )
  
  const seasonsByYear = computed(() => {
    const grouped = {}
    seasons.value.forEach(season => {
      const year = new Date(season.startDate).getFullYear()
      if (!grouped[year]) {
        grouped[year] = []
      }
      grouped[year].push(season)
    })
    return grouped
  })

  // Actions
  const setSeasons = (seasonsData) => {
    seasons.value = seasonsData
    error.value = null
  }

  const setCurrentSeason = (season) => {
    currentSeason.value = season
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

  // Récupération de toutes les saisons
  const fetchSeasons = async (active = null) => {
    try {
      setLoading(true)
      clearError()
      
      const seasonsData = await seasonsService.getAllSeasons(active)
      setSeasons(seasonsData)
      
      return seasonsData
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Récupération d'une saison par ID
  const fetchSeasonById = async (id) => {
    try {
      setLoading(true)
      clearError()
      
      const season = await seasonsService.getSeasonById(id)
      setCurrentSeason(season)
      
      return season
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Création d'une saison
  const createSeason = async (seasonData) => {
    try {
      setLoading(true)
      clearError()
      
      const newSeason = await seasonsService.createSeason(seasonData)
      
      // Ajouter à la liste locale
      seasons.value.push(newSeason)
      
      return newSeason
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Mise à jour d'une saison
  const updateSeason = async (id, seasonData) => {
    try {
      setLoading(true)
      clearError()
      
      const updatedSeason = await seasonsService.updateSeason(id, seasonData)
      
      // Mettre à jour dans la liste locale
      const index = seasons.value.findIndex(season => season.id === id)
      if (index !== -1) {
        seasons.value[index] = updatedSeason
      }
      
      // Mettre à jour la saison courante si c'est la même
      if (currentSeason.value?.id === id) {
        setCurrentSeason(updatedSeason)
      }
      
      return updatedSeason
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Suppression d'une saison
  const deleteSeason = async (id) => {
    try {
      setLoading(true)
      clearError()
      
      await seasonsService.deleteSeason(id)
      
      // Supprimer de la liste locale
      seasons.value = seasons.value.filter(season => season.id !== id)
      
      // Vider la saison courante si c'est la même
      if (currentSeason.value?.id === id) {
        setCurrentSeason(null)
      }
      
      return true
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    seasons,
    currentSeason,
    loading,
    error,
    
    // Getters
    activeSeasons,
    seasonsByYear,
    
    // Actions
    setSeasons,
    setCurrentSeason,
    setLoading,
    setError,
    clearError,
    fetchSeasons,
    fetchSeasonById,
    createSeason,
    updateSeason,
    deleteSeason
  }
})