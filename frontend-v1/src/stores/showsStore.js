import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { showsService } from '@/services/api/showsService'

export const useShowsStore = defineStore('shows', () => {
  // State
  const shows = ref([])
  const currentShow = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const activeShows = computed(() => 
    shows.value.filter(show => show.active)
  )
  
  const showsBySeason = computed(() => {
    const grouped = {}
    shows.value.forEach(show => {
      if (!grouped[show.seasonId]) {
        grouped[show.seasonId] = []
      }
      grouped[show.seasonId].push(show)
    })
    return grouped
  })
  
  const showsByStatus = computed(() => {
    const grouped = {}
    shows.value.forEach(show => {
      if (!grouped[show.status]) {
        grouped[show.status] = []
      }
      grouped[show.status].push(show)
    })
    return grouped
  })

  // Actions
  const setShows = (showsData) => {
    shows.value = showsData
    error.value = null
  }

  const setCurrentShow = (show) => {
    currentShow.value = show
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

  // Récupération de tous les spectacles
  const fetchShows = async (filters = {}) => {
    try {
      setLoading(true)
      clearError()
      
      const showsData = await showsService.getAllShows(filters)
      setShows(showsData)
      
      return showsData
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Récupération d'un spectacle par ID
  const fetchShowById = async (id) => {
    try {
      setLoading(true)
      clearError()
      
      const show = await showsService.getShowById(id)
      setCurrentShow(show)
      
      return show
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Création d'un spectacle
  const createShow = async (showData) => {
    try {
      setLoading(true)
      clearError()
      
      const newShow = await showsService.createShow(showData)
      
      // Ajouter à la liste locale
      shows.value.push(newShow)
      
      return newShow
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Mise à jour d'un spectacle
  const updateShow = async (id, showData) => {
    try {
      setLoading(true)
      clearError()
      
      const updatedShow = await showsService.updateShow(id, showData)
      
      // Mettre à jour dans la liste locale
      const index = shows.value.findIndex(show => show.id === id)
      if (index !== -1) {
        shows.value[index] = updatedShow
      }
      
      // Mettre à jour le spectacle courant si c'est le même
      if (currentShow.value?.id === id) {
        setCurrentShow(updatedShow)
      }
      
      return updatedShow
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Suppression d'un spectacle
  const deleteShow = async (id) => {
    try {
      setLoading(true)
      clearError()
      
      await showsService.deleteShow(id)
      
      // Supprimer de la liste locale
      shows.value = shows.value.filter(show => show.id !== id)
      
      // Vider le spectacle courant si c'est le même
      if (currentShow.value?.id === id) {
        setCurrentShow(null)
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
    shows,
    currentShow,
    loading,
    error,
    
    // Getters
    activeShows,
    showsBySeason,
    showsByStatus,
    
    // Actions
    setShows,
    setCurrentShow,
    setLoading,
    setError,
    clearError,
    fetchShows,
    fetchShowById,
    createShow,
    updateShow,
    deleteShow
  }
})