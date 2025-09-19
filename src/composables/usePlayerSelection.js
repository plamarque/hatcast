import { ref, computed } from 'vue'
import logger from '../utils/logger.js'

/**
 * Composable pour gérer l'état de sélection des joueurs
 * Centralise la logique de sélection et fournit un état réactif partagé
 */
export function usePlayerSelection() {
  // État de sélection
  const selectedPlayerId = ref(null)
  const showPlayerModal = ref(false)
  
  // Computed pour obtenir l'objet joueur complet
  const selectedPlayer = computed(() => {
    // Cette fonction sera injectée par le composant parent qui a accès à la liste des joueurs
    return null // Sera surchargée par le parent
  })
  
  // Computed pour l'affichage du texte dans le dropdown
  const participantsDisplayText = computed(() => {
    if (selectedPlayerId.value && selectedPlayer.value) {
      // Un joueur spécifique est sélectionné
      return null // Le nom du joueur sera affiché via selectedPlayer.name
    } else {
      // Aucun joueur sélectionné = tous les joueurs
      return 'Tous'
    }
  })
  
  // Actions
  const selectPlayer = (player) => {
    selectedPlayerId.value = player?.id || null
    logger.debug('🎯 Joueur sélectionné:', player?.name || 'Tous', player?.id || null)
  }
  
  const selectAllPlayers = () => {
    selectedPlayerId.value = null
    logger.debug('🎯 Sélection de tous les joueurs')
  }
  
  const togglePlayerModal = () => {
    showPlayerModal.value = !showPlayerModal.value
  }
  
  const closePlayerModal = () => {
    showPlayerModal.value = false
  }
  
  // Initialisation avec un joueur par défaut si nécessaire
  const initializeWithDefaultPlayer = (defaultPlayerId) => {
    if (defaultPlayerId && !selectedPlayerId.value) {
      selectedPlayerId.value = defaultPlayerId
    }
  }
  
  return {
    // État
    selectedPlayerId,
    showPlayerModal,
    selectedPlayer,
    participantsDisplayText,
    
    // Actions
    selectPlayer,
    selectAllPlayers,
    togglePlayerModal,
    closePlayerModal,
    initializeWithDefaultPlayer
  }
}
