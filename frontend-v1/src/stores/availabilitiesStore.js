import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { availabilitiesService } from '@/services/firestore/availabilitiesService'

export const useAvailabilitiesStore = defineStore('availabilities', () => {
  // State
  const userAvailabilities = ref([])
  const showAvailabilities = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const availableShows = computed(() => 
    userAvailabilities.value.filter(av => av.available)
  )
  
  const unavailableShows = computed(() => 
    userAvailabilities.value.filter(av => !av.available)
  )
  
  const availabilityStats = computed(() => {
    const total = userAvailabilities.value.length
    const available = availableShows.value.length
    const unavailable = unavailableShows.value.length
    
    return {
      total,
      available,
      unavailable,
      percentage: total > 0 ? Math.round((available / total) * 100) : 0
    }
  })

  // Actions
  const setUserAvailabilities = (availabilities) => {
    userAvailabilities.value = availabilities
    error.value = null
  }

  const setShowAvailabilities = (availabilities) => {
    showAvailabilities.value = availabilities
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

  // Récupération des disponibilités d'un utilisateur
  const fetchUserAvailabilities = async (userId) => {
    try {
      setLoading(true)
      clearError()
      
      const availabilities = await availabilitiesService.getUserAvailabilities(userId)
      setUserAvailabilities(availabilities)
      
      return availabilities
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Récupération des disponibilités pour un spectacle
  const fetchShowAvailabilities = async (showId) => {
    try {
      setLoading(true)
      clearError()
      
      const availabilities = await availabilitiesService.getShowAvailabilities(showId)
      setShowAvailabilities(availabilities)
      
      return availabilities
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Mise à jour d'une disponibilité
  const updateAvailability = async (userId, showId, availabilityData) => {
    try {
      setLoading(true)
      clearError()
      
      const availability = await availabilitiesService.updateAvailability(
        userId, 
        showId, 
        availabilityData
      )
      
      // Mettre à jour dans la liste locale
      const index = userAvailabilities.value.findIndex(av => 
        av.userId === userId && av.showId === showId
      )
      
      if (index !== -1) {
        userAvailabilities.value[index] = availability
      } else {
        userAvailabilities.value.push(availability)
      }
      
      return availability
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Suppression d'une disponibilité
  const deleteAvailability = async (userId, showId) => {
    try {
      setLoading(true)
      clearError()
      
      await availabilitiesService.deleteAvailability(userId, showId)
      
      // Supprimer de la liste locale
      userAvailabilities.value = userAvailabilities.value.filter(av => 
        !(av.userId === userId && av.showId === showId)
      )
      
      return true
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Écoute en temps réel des disponibilités d'un utilisateur
  const subscribeToUserAvailabilities = (userId) => {
    return availabilitiesService.subscribeToUserAvailabilities(
      userId, 
      (availabilities) => {
        setUserAvailabilities(availabilities)
      }
    )
  }

  // Écoute en temps réel des disponibilités d'un spectacle
  const subscribeToShowAvailabilities = (showId) => {
    return availabilitiesService.subscribeToShowAvailabilities(
      showId, 
      (availabilities) => {
        setShowAvailabilities(availabilities)
      }
    )
  }

  return {
    // State
    userAvailabilities,
    showAvailabilities,
    loading,
    error,
    
    // Getters
    availableShows,
    unavailableShows,
    availabilityStats,
    
    // Actions
    setUserAvailabilities,
    setShowAvailabilities,
    setLoading,
    setError,
    clearError,
    fetchUserAvailabilities,
    fetchShowAvailabilities,
    updateAvailability,
    deleteAvailability,
    subscribeToUserAvailabilities,
    subscribeToShowAvailabilities
  }
})