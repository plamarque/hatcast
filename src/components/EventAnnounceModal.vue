<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[1390] p-0 md:p-4" @click="onClose">
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
        <!-- Section Mes Dispos (si showAvailability est true) -->
        <div v-if="showAvailability && currentUserPlayer" class="bg-gray-800/50 rounded-lg p-4 border border-white/10">
          <h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span>📅</span>
            <span>Mes Dispos</span>
          </h3>
          
          <!-- Affichage de la disponibilité actuelle -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-300">{{ currentUserPlayer.name }}</span>
              <AvailabilityCell
                :player-name="currentUserPlayer.name"
                :player-id="currentUserPlayer.id"
                :player-gender="currentUserPlayer.gender"
                :event-id="event?.id"
                :event-title="event?.title"
                :event-date="event?.date"
                :current-availability="getCurrentUserAvailability()"
                :is-read-only="false"
                :season-id="seasonId"
                :chance-percent="null"
                :is-protected="false"
                :event-roles="eventRoles"
                @availability-changed="handleAvailabilityChanged"
                @show-availability-modal="openAvailabilityModal"
              />
            </div>
            <button
              @click="openAvailabilityModal"
              class="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Modifier
            </button>
          </div>
        </div>

        <!-- Composant de preview partagé -->
        <MessagePreview
          :mode="mode"
          :event="event"
          :season-id="seasonId"
          :season-slug="seasonSlug"
          :players="players"
          :selected-players="selectedPlayers"
          :selected-players-by-role="selectedPlayersByRole"
          :availability-by-player="availabilityByPlayer"
          :is-selection-confirmed-by-all-players="isSelectionConfirmedByAllPlayers"
          :sending="computedSending"
          @send-notifications="confirmAndSend"
        />

        <!-- Section Copie supprimée: bouton de copie présent dans le footer -->
      </div>

    </div>
  </div>

  <!-- Modal de disponibilité superposée -->
  <AvailabilityModal
    :show="showAvailabilityModal"
    :player-name="availabilityModalData.playerName"
    :player-id="availabilityModalData.playerId"
    :player-gender="availabilityModalData.playerGender"
    :event-id="availabilityModalData.eventId"
    :event-title="availabilityModalData.eventTitle"
    :event-date="availabilityModalData.eventDate"
    :current-availability="availabilityModalData.availabilityData"
    :is-read-only="availabilityModalData.isReadOnly"
    :season-id="seasonId"
    :chance-percent="availabilityModalData.chancePercent"
    :is-protected="availabilityModalData.isProtected"
    :event-roles="availabilityModalData.eventRoles"
    @close="showAvailabilityModal = false"
    @save="handleAvailabilitySave"
    @not-available="handleAvailabilityNotAvailable"
    @clear="handleAvailabilityClear"
    @request-edit="handleAvailabilityRequestEdit"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import MessagePreview from './MessagePreview.vue'
import AvailabilityModal from './AvailabilityModal.vue'
import AvailabilityCell from './AvailabilityCell.vue'


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
  // Pour le mode sélection, structure par rôles
  selectedPlayersByRole: { type: Object, default: () => ({}) },
  // Contrôle du spinner depuis le parent pendant l'envoi
  sending: { type: Boolean, default: false },
  // Map des disponibilités pour l'événement courant: { [playerName]: true|false|undefined }
  availabilityByPlayer: { type: Object, default: () => ({}) },
  // Pour le mode sélection, indique si tous les joueurs ont confirmé
  isSelectionConfirmedByAllPlayers: { type: Boolean, default: false },
  // Nouveau paramètre pour afficher la modale de disponibilité
  showAvailability: { type: Boolean, default: false },
  // Données pour la modale de disponibilité
  currentUserPlayer: { type: Object, default: null },
  // Rôles attendus pour l'événement
  eventRoles: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'notifications-sent', 'send-notifications', 'availability-changed'])

// État local - on utilise seulement l'état parent
const computedSending = computed(() => props.sending)

// État pour la modale de disponibilité
const showAvailabilityModal = ref(false)
const availabilityModalData = ref({
  playerName: '',
  playerId: '',
  playerGender: 'non-specified',
  eventId: '',
  eventTitle: '',
  eventDate: '',
  availabilityData: { available: null, roles: [], comment: null },
  isReadOnly: false,
  chancePercent: null,
  isProtected: false,
  eventRoles: {}
})

// Onglets supprimés





// Functions
function onClose() {
  emit('close')
}

function getModalTitle() {
  if (props.mode === 'selection') {
    // Mode sélection : titre selon l'état de confirmation
    return props.isSelectionConfirmedByAllPlayers ? 'Annoncer l\'équipe' : 'Annoncer Compo'
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

// Fonctions pour la modale de disponibilité
function getCurrentUserAvailability() {
  if (!props.currentUserPlayer || !props.event) {
    return { available: null, roles: [], comment: null }
  }
  
  const playerName = props.currentUserPlayer.name
  const eventId = props.event.id
  
  // Récupérer depuis availabilityByPlayer
  const availability = props.availabilityByPlayer[playerName]
  if (availability === undefined) {
    return { available: null, roles: [], comment: null }
  }
  
  return {
    available: availability,
    roles: [], // TODO: récupérer les rôles depuis les données
    comment: null // TODO: récupérer le commentaire depuis les données
  }
}

function openAvailabilityModal() {
  if (!props.currentUserPlayer || !props.event) return
  
  availabilityModalData.value = {
    playerName: props.currentUserPlayer.name,
    playerId: props.currentUserPlayer.id,
    playerGender: props.currentUserPlayer.gender || 'non-specified',
    eventId: props.event.id,
    eventTitle: props.event.title,
    eventDate: props.event.date,
    availabilityData: getCurrentUserAvailability(),
    isReadOnly: false,
    chancePercent: null,
    isProtected: false,
    eventRoles: props.eventRoles
  }
  
  showAvailabilityModal.value = true
}

function handleAvailabilityChanged(data) {
  emit('availability-changed', data)
}

function handleAvailabilitySave(data) {
  emit('availability-changed', data)
  // Fermer par défaut, sauf si keepOpen est demandé (cas Dispo)
  if (!data.keepOpen) {
    showAvailabilityModal.value = false
  }
}

function handleAvailabilityNotAvailable(data) {
  emit('availability-changed', data)
  showAvailabilityModal.value = false
}

function handleAvailabilityClear(data) {
  emit('availability-changed', data)
  showAvailabilityModal.value = false
}

function handleAvailabilityRequestEdit() {
  availabilityModalData.value.isReadOnly = false
}

// Plus besoin de watcher - on utilise seulement l'état parent
</script>

<style scoped>
/* Styles spécifiques à EventAnnounceModal - les styles de preview sont maintenant dans MessagePreview.vue */
</style>
