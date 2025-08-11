<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[90] p-0 md:p-4" @click="onClose">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col" @click.stop>
      <!-- Header -->
      <div class="relative p-5 pb-4 border-b border-white/10">
        <button @click="onClose" title="Fermer" class="absolute right-2.5 top-2.5 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
        <h2 class="text-xl md:text-2xl font-bold text-white pr-10">
          {{ mode === 'selection' ? 'Annoncer la sélection' : 'Annoncer l\'événement' }}
        </h2>
        <p class="text-sm text-purple-300 mt-1" v-if="event">{{ event.title }} — {{ formatDateFull(event.date) }}</p>
      </div>

      <!-- Content scrollable -->
      <div class="px-4 md:px-6 py-4 md:py-6 space-y-6 overflow-y-auto">
        <!-- Message d'information -->
        <div class="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20 p-3">
          <p class="text-blue-200 text-sm">
            {{ mode === 'selection' 
              ? 'Choisis comment annoncer cette sélection aux joueurs :' 
              : 'Choisis comment annoncer cet événement aux joueurs :' 
            }}
          </p>
        </div>

        <!-- Onglets de méthode d'annonce -->
        <div class="flex space-x-1 bg-gray-800 rounded-lg p-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Contenu de l'onglet Email -->
        <div v-if="activeTab === 'email'" class="space-y-4">
          <!-- Prévisualisation du message -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Prévisualisation du message :</label>
            <div class="bg-gray-800 border border-gray-600 rounded-lg p-4 text-white whitespace-pre-line">
              {{ previewMessage }}
            </div>
          </div>

          <!-- Destinataires -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              Destinataires
              <button 
                @click="showDestinatairesHint = !showDestinatairesHint"
                class="text-blue-400 hover:text-blue-300 text-lg cursor-help"
                title="Cliquer pour plus d'information"
              >
                ?
              </button>
            </label>
            
            <!-- Hint pour les destinataires -->
            <div v-if="showDestinatairesHint" class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3">
              <p class="text-blue-200 text-sm">
                {{ mode === 'selection' 
                  ? 'Les destinataires sont les joueurs sélectionnés qui ont renseigné une adresse email en utilisant la fonction Protéger.'
                  : 'Les destinataires sont les joueurs qui ont renseigné une adresse email en utilisant la fonction Protéger.'
                }}
              </p>
            </div>
            
            <div class="bg-gray-800 border border-gray-600 rounded-lg p-3">
              <div v-if="recipientsWithEmail.length > 0" class="space-y-2">
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="player in recipientsWithEmail"
                    :key="player.id"
                    class="px-3 py-1 bg-gray-700 text-white rounded text-sm"
                  >
                    {{ player.name }}
                  </span>
                </div>
              </div>
              <div v-else class="text-amber-400 text-sm">
                ⚠️ {{ mode === 'selection' 
                  ? 'Aucun joueur sélectionné avec email renseigné. Les notifications ne pourront pas être envoyées.'
                  : 'Aucun joueur protégé avec email renseigné. Les notifications ne pourront pas être envoyées.'
                }}
              </div>
            </div>
          </div>


        </div>

        <!-- Contenu de l'onglet Copie -->
        <div v-if="activeTab === 'copy'" class="space-y-4">
          <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20 p-3">
            <p class="text-purple-200 text-sm">📋 Copie du message pour partage manuel</p>
          </div>

          <div class="relative">
            <textarea
              :value="copyMessage"
              class="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
              rows="6"
              readonly
            ></textarea>
            <button
              @click="copyToClipboard"
              class="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg p-2 hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
              :title="copyButtonText"
            >
              <svg v-if="!copied" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </button>
          </div>


        </div>
      </div>

      <!-- Footer sticky -->
      <div class="sticky bottom-0 w-full p-3 bg-gray-900/95 border-t border-white/10 backdrop-blur-sm flex items-center gap-2">
        <!-- Bouton d'action selon l'onglet actif -->
        <button
          v-if="activeTab === 'email'"
          @click="sendEmailNotifications"
          :disabled="recipientsWithEmail.length === 0 || isSending"
          class="h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600 flex-1"
        >
          <span v-if="!isSending">📧 Envoyer les notifications email</span>
          <span v-else>📧 Envoi en cours...</span>
        </button>
        
        <button
          v-if="activeTab === 'copy'"
          @click="copyToClipboard"
          class="h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex-1"
        >
          📋 Copier le message
        </button>
        
        <!-- Bouton fermer -->
        <button @click="onClose" class="h-12 px-4 bg-gray-700 text-white rounded-lg">
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  event: { type: Object, default: null },
  seasonId: { type: String, default: '' },
  seasonSlug: { type: String, default: '' },
  players: { type: Array, default: () => [] },
  // Nouvelle prop pour différencier le mode
  mode: { type: String, default: 'event', validator: (value) => ['event', 'selection'].includes(value) },
  // Pour le mode sélection, on peut passer les joueurs sélectionnés
  selectedPlayers: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'notifications-sent', 'send-email-notifications'])

const activeTab = ref('email')
const copied = ref(false)
const copyButtonText = ref('Copier le message')
const isSending = ref(false)
const showDestinatairesHint = ref(false)

// Onglets disponibles
const tabs = [
  { id: 'email', label: '📧 Email' },
  { id: 'copy', label: '📋 Copie' }
]

// Computed properties
const eventDirectLink = computed(() => {
  if (!props.event || !props.seasonSlug) return ''
  return `${window.location.origin}/season/${props.seasonSlug}/event/${props.event.id}`
})

const copyMessage = computed(() => {
  if (!props.event) return ''
  const eventDate = formatDateFull(props.event.date)
  
  if (props.mode === 'selection') {
    const playersList = props.selectedPlayers.join(', ')
    return `Sélection pour ${props.event.title} du ${eventDate} : ${playersList}`
  } else {
    return `Bonjour !\n\nNouvel événement : ${props.event.title}\nDate : ${eventDate}\n\nLien direct vers l'événement : ${eventDirectLink.value}\n\nMerci de confirmer votre disponibilité.`
  }
})

// Message complet pour la prévisualisation (même logique que l'email)
const previewMessage = computed(() => {
  if (!props.event || !props.selectedPlayers) return ''
  
  if (props.mode === 'selection') {
    const playersList = props.selectedPlayers.join(', ')
    return `Sélection confirmée

Bonjour [Nom du joueur],

Tu as été sélectionné(e) pour ${props.event.title} (${formatDateFull(props.event.date)}).

Sélection complète : ${playersList}.

Tu n'es plus disponible ? Signale le rapidement ici : [Lien de désistement]`
  } else {
    return `Disponibilité demandée

Bonjour [Nom du joueur],

Peux-tu indiquer ta disponibilité pour ${props.event.title} (${formatDateFull(props.event.date)}) ?`
  }
})

const recipientsWithEmail = ref([])

// Charger les emails des destinataires selon le mode
async function loadRecipientsEmails() {
  if (!props.seasonId) return
  
  let targetPlayers = []
  
  if (props.mode === 'selection') {
    // Mode sélection : on prend les joueurs sélectionnés
    targetPlayers = props.players.filter(player => 
      props.selectedPlayers.includes(player.name)
    )
  } else {
    // Mode événement : on prend les joueurs protégés
    targetPlayers = props.players.filter(player => player.isProtected)
  }
  
  const playersWithEmail = []
  
  for (const player of targetPlayers) {
    try {
      // Importer la fonction depuis le service
      const { getPlayerEmail } = await import('../services/playerProtection.js')
      const email = await getPlayerEmail(player.id, props.seasonId)
      if (email) {
        playersWithEmail.push({
          ...player,
          email
        })
      }
    } catch (error) {
      console.warn(`Impossible de charger l'email pour ${player.name}:`, error)
    }
  }
  
  recipientsWithEmail.value = playersWithEmail
}

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
  const textToCopy = copyMessage.value
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

async function sendEmailNotifications() {
  if (!props.event || recipientsWithEmail.value.length === 0) return
  
  isSending.value = true
  
  try {
    if (props.mode === 'selection') {
      // Mode sélection : émettre un événement spécifique
      emit('send-email-notifications', {
        eventId: props.event.id,
        eventData: props.event,
        reason: 'selection',
        selectedPlayers: props.selectedPlayers
      })
    } else {
      // Mode événement : utiliser la logique existante
      emit('send-email-notifications', {
        eventId: props.event.id,
        eventData: props.event,
        reason: 'manual'
      })
    }
    
    // Le modal sera fermé par GridBoard après l'envoi réussi
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erreur lors de l\'envoi des notifications')
    alert('Erreur lors de l\'envoi des notifications. Veuillez réessayer.')
  } finally {
    isSending.value = false
  }
}

// Reset active tab when modal opens and load emails
onMounted(() => {
  if (props.show) {
    activeTab.value = 'email'
    loadRecipientsEmails()
  }
})

// Watch for modal opening to load emails
watch(() => props.show, (newShow) => {
  if (newShow) {
    activeTab.value = 'email'
    loadRecipientsEmails()
  }
})

// Watch for changes in selectedPlayers (mode sélection)
watch(() => props.selectedPlayers, () => {
  if (props.show && props.mode === 'selection') {
    loadRecipientsEmails()
  }
})
</script>
