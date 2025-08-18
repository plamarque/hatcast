<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[90] p-0 md:p-4" @click="onClose">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col" @click.stop>
      <!-- Header -->
      <div class="relative p-5 pb-4 border-b border-white/10">
        <button @click="onClose" title="Fermer" class="absolute right-2.5 top-2.5 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
        <h2 class="text-xl md:text-2xl font-bold text-white pr-10 flex items-center gap-2">
          <span class="hidden sm:inline">{{ mode === 'selection' ? '📣' : '📢' }}</span>
          <span>{{ getModalTitle() }}</span>
        </h2>
        <p class="text-sm text-purple-300 mt-1" v-if="event">{{ event.title }} — {{ formatDateFull(event.date) }}</p>
      </div>

      <!-- Content scrollable -->
      <div class="px-4 md:px-6 py-4 md:py-6 space-y-6 overflow-y-auto">
        <!-- Message d'information supprimé pour alléger l'UI -->

        <!-- Composant de preview partagé -->
        <MessagePreview
          :mode="mode"
          :event="event"
          :season-id="seasonId"
          :season-slug="seasonSlug"
          :players="players"
          :selected-players="selectedPlayers"
          :availability-by-player="availabilityByPlayer"
          :is-selection-confirmed-by-all-players="isSelectionConfirmedByAllPlayers"
        />

        <!-- Section Copie supprimée: bouton de copie présent dans le footer -->
      </div>

      <!-- Footer sticky -->
      <div class="sticky bottom-0 w-full p-3 bg-gray-900/95 border-t border-white/10 backdrop-blur-sm flex items-center gap-2">
        <!-- Action principale: Confirmer et envoyer -->
        <div class="flex items-center gap-2 w-full">
          <button
            @click="confirmAndSend"
            :disabled="computedSending"
            class="h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600 flex-1"
          >
            <span v-if="!computedSending">
              <span class="hidden sm:inline">🔔 Notifier</span>
              <span class="sm:hidden">🔔 Notifier</span>
            </span>
            <span v-else class="inline-flex items-center gap-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Envoi en cours...
            </span>
          </button>
        </div>
        
        <!-- Bouton fermer -->
        <button @click="onClose" class="h-12 px-4 bg-gray-700 text-white rounded-lg">
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import MessagePreview from './MessagePreview.vue'


const props = defineProps({
  show: { type: Boolean, default: false },
  event: { type: Object, default: null },
  seasonId: { type: String, default: '' },
  seasonSlug: { type: String, default: '' },
  players: { type: Array, default: () => [] },
  // Nouvelle prop pour différencier le mode
  mode: { type: String, default: 'event', validator: (value) => ['event', 'selection'].includes(value) },
  // Pour le mode sélection, on peut passer les joueurs sélectionnés
  selectedPlayers: { type: Array, default: () => [] },
  // Contrôle du spinner depuis le parent pendant l'envoi
  sending: { type: Boolean, default: false },
  // Map des disponibilités pour l'événement courant: { [playerName]: true|false|undefined }
  availabilityByPlayer: { type: Object, default: () => ({}) },
  // Pour le mode sélection, indique si tous les joueurs ont confirmé
  isSelectionConfirmedByAllPlayers: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'notifications-sent', 'send-notifications'])

// État local - on utilise seulement l'état parent
const computedSending = computed(() => props.sending)

// Onglets supprimés





// Functions
function onClose() {
  emit('close')
}

function getModalTitle() {
  if (props.mode === 'selection') {
    // Mode sélection : titre selon l'état de confirmation
    return props.isSelectionConfirmedByAllPlayers ? 'Annoncer l\'équipe' : 'Annoncer la sélection'
  } else {
    // Mode événement : titre classique
    return 'Confirmer l\'événement'
  }
}

function formatDateFull(dateValue) {
  if (!dateValue) return ''
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue.toDate?.() || dateValue
  return date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}







async function confirmAndSend() {
  if (!props.event) return
  
  try {
    // Émettre l'événement pour déclencher l'envoi automatique des notifications
    emit('send-notifications', {
      eventId: props.event.id,
      eventData: props.event,
      reason: props.mode === 'selection' ? 'selection' : 'event',
      selectedPlayers: props.selectedPlayers,
      scope: 'all' // Toujours envoyer à tous les destinataires
    })
    
    // La modale reste ouverte pour afficher les résultats
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error)
    alert('Erreur lors de l\'envoi des notifications. Veuillez réessayer.')
  }
}

// Plus besoin de watcher - on utilise seulement l'état parent
</script>

<style scoped>
/* Styles spécifiques à EventAnnounceModal - les styles de preview sont maintenant dans MessagePreview.vue */
</style>
