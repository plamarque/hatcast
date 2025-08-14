<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[90] p-0 md:p-4" @click="onClose">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col" @click.stop>
      <!-- Header -->
      <div class="relative p-5 pb-4 border-b border-white/10">
        <button @click="onClose" title="Fermer" class="absolute right-2.5 top-2.5 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
        <h2 class="text-xl md:text-2xl font-bold text-white pr-10 flex items-center gap-2">
          <span class="hidden sm:inline">{{ mode === 'selection' ? '📣' : '📢' }}</span>
          <span>{{ mode === 'selection' ? 'Annoncer la sélection' : 'Annoncer l\'événement' }}</span>
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
          @update:selected-recipient="updateSelectedRecipient"
        />

        <!-- Section Copie supprimée: bouton de copie présent dans le footer -->
      </div>

      <!-- Footer sticky -->
      <div class="sticky bottom-0 w-full p-3 bg-gray-900/95 border-t border-white/10 backdrop-blur-sm flex items-center gap-2">
        <!-- Actions principales: Envoyer + Copier le message -->
        <div class="flex items-center gap-2 w-full">
          <button
            @click="sendNotifications"
            :disabled="computedSending"
            class="h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600 flex-1"
          >
            <span v-if="!computedSending">
              <span class="hidden sm:inline">🔔 Envoyer les notifications</span>
              <span class="sm:hidden">🔔 Envoyer</span>
            </span>
            <span v-else class="inline-flex items-center gap-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Envoi en cours...
            </span>
          </button>
          <button
            @click="copyToClipboard"
            class="h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
            :title="copyButtonText"
          >
            <span v-if="!copied">
              <span class="hidden sm:inline">📋 Copier le message</span>
              <span class="sm:hidden">📋 Copier</span>
            </span>
            <span v-else>✅ Copié</span>
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
  availabilityByPlayer: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'notifications-sent', 'send-notifications'])

// État local
const copied = ref(false)
const copyButtonText = ref('Copier le message')
const isSending = ref(false)
const computedSending = computed(() => props.sending || isSending.value)
const selectedRecipient = ref(null)

// Onglets supprimés





// Functions
function onClose() {
  emit('close')
}

function formatDateFull(dateValue) {
  if (!dateValue) return ''
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue.toDate?.() || dateValue
  return date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function copyToClipboard() {
  // TODO: Récupérer le message depuis MessagePreview
  const textToCopy = 'Message à copier depuis MessagePreview'
  navigator.clipboard.writeText(textToCopy).then(() => {
    copied.value = true
    copyButtonText.value = 'Copié !'
    setTimeout(() => {
      copied.value = false
      copyButtonText.value = 'Copier le message'
    }, 2000)
  }).catch(err => {
    // Silence en prod
    // eslint-disable-next-line no-console
    console.warn('Erreur lors de la copie du texte')
    alert('Impossible de copier le message.')
  })
}



function selectRecipient(player) {
  selectedRecipient.value = player
}

function updateSelectedRecipient(player) {
  selectedRecipient.value = player
}

async function sendNotifications() {
  if (!props.event) return
  
  isSending.value = true
  
  try {
    const scope = selectedRecipient.value && selectedRecipient.value.id !== 'ALL' ? 'single' : 'all'
    const recipient = scope === 'single' ? { id: selectedRecipient.value.id, name: selectedRecipient.value.name, email: selectedRecipient.value.email } : null
    if (props.mode === 'selection') {
      // Mode sélection : émettre un événement spécifique
      emit('send-notifications', {
        eventId: props.event.id,
        eventData: props.event,
        reason: 'selection',
        selectedPlayers: props.selectedPlayers,
        scope,
        recipient
      })
    } else {
      // Mode événement : utiliser la logique existante
      emit('send-notifications', {
        eventId: props.event.id,
        eventData: props.event,
        reason: 'manual',
        scope,
        recipient
      })
    }
    
    // Le parent contrôle la fin via la prop `sending`. On ne ferme plus la modale automatiquement.
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erreur lors de l\'envoi des notifications')
    alert('Erreur lors de l\'envoi des notifications. Veuillez réessayer.')
  } finally {
    // Remettre isSending à false après un délai pour permettre au parent de traiter
    setTimeout(() => {
      isSending.value = false
    }, 1000)
  }
}

// Synchroniser le spinner local avec l'état parent
watch(() => props.sending, (now) => {
  if (!now) {
    isSending.value = false
  }
})
</script>

<style scoped>
/* Styles spécifiques à EventAnnounceModal - les styles de preview sont maintenant dans MessagePreview.vue */
</style>
