<template>
  <div class="space-y-4 message-preview">
    <!-- Message à copier -->
    <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
          {{ mode === 'selection' ? 'Annoncez la compo avec ce message :' : 'Message à copier pour les contacts manuels :' }}
        </label>

      <!-- Message éditable -->
      <div class="space-y-3">
        <!-- Indicateur de copie -->
        <div v-if="showCopyIndicator" class="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          ✅ Copié !
        </div>
        <textarea
          v-model="editableMessage"
          class="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white text-sm resize-none focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-colors"
          rows="12"
          placeholder="Le message sera généré automatiquement..."
          @input="handleMessageEdit"
        ></textarea>
      </div>
      
      <!-- Bouton WhatsApp -->
      <div class="mt-3 flex justify-center">
        <button 
          @click="openWhatsApp" 
          class="h-12 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          title="Ouvrir WhatsApp pour partager le message"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          <span>Envoyer par WhatsApp</span>
        </button>
      </div>
    </div>

    <!-- Personnes à Prévenir -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
        Personnes à Prévenir
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
          Cette liste montre toutes les personnes ciblées: 
          <span class="text-gray-200">ceux notifiables (email/push actifs)</span> et
          <span class="text-yellow-300">ceux en jaune sans canal actif</span>.
          Les personnes en jaune ne peuvent pas être notifiées automatiquement. Utilise le message ci-dessus pour les contacter manuellement.
        </p>
      </div>
      
      <div class="bg-gray-800 border border-gray-600 rounded-lg p-3 max-h-48 overflow-y-auto">
        <div v-if="allDisplayRecipients.length > 0" class="space-y-3">
          <!-- Résumé des destinataires -->
          <div class="text-gray-300 text-sm mb-3">
            <span class="text-white font-medium">{{ allDisplayRecipients.length - 1 }}</span> personnes à prévenir. 
            <span class="text-green-400 font-medium">{{ recipientsWithEmail.length }}</span> peuvent être notifiées, 
            <span class="text-yellow-400 font-medium">{{ nonContactRecipients.length }}</span> devront être prévenues manuellement.
          </div>
          
          <!-- Liste des personnes -->
          <div class="flex flex-wrap gap-2">
            <div
              v-for="player in allDisplayRecipients.filter(p => p.id !== 'ALL')"
              :key="player.id || player.name"
              :class="[
                'px-2 py-1.5 rounded text-sm border flex flex-col gap-0.5 max-w-[200px]',
                player.hasContact
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-yellow-900/20 border-yellow-600/40 text-yellow-200 opacity-75'
              ]"
              :title="player.hasContact ? 'Peut être notifié automatiquement' : 'Aucun canal actif - notification manuelle requise'"
            >
              <div class="flex items-center gap-1">
                <span class="font-medium">{{ player.name }}</span>
                <span v-if="player.hasContact" class="text-green-400 text-xs">✓</span>
                <span v-else class="text-yellow-400 text-xs">⚠️</span>
              </div>
              <div v-if="player.email" class="text-xs text-gray-400">
                {{ obfuscateEmail(player.email) }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-amber-400 text-sm">
          ⚠️ Aucun destinataire disponible.
        </div>
      </div>
      
      <!-- Bouton Envoyer les notifications -->
      <div class="mt-4 flex justify-center">
        <button
          @click="$emit('send-notifications')"
          :disabled="sending"
          class="h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600 flex items-center justify-center gap-2"
        >
          <span v-if="!sending">
            <span>🔔 Envoyer les notifications</span>
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { buildAvailabilityTextTemplate, buildCastTextMessage, buildGlobalCastAnnouncementMessage, buildGlobalConfirmedTeamAnnouncementTemplate } from '../services/emailTemplates.js'
import { obfuscateEmail } from '../utils/obfuscation.js'

const emit = defineEmits(['send-notifications'])

// Fonction pour ouvrir WhatsApp
function openWhatsApp() {
  // Utiliser le message éditable
  const messageText = editableMessage.value
  if (!messageText) return
  
  // Encoder le message pour l'URL WhatsApp
  const encodedMessage = encodeURIComponent(messageText)
  
  // Ouvrir WhatsApp avec le message pré-rempli
  const whatsappUrl = `whatsapp://send?text=${encodedMessage}`
  window.open(whatsappUrl, '_blank')
}

// Fonction pour gérer l'édition du message
function handleMessageEdit() {
  // Le message est automatiquement mis à jour via v-model
}

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: (value) => ['event', 'selection'].includes(value)
  },
  event: {
    type: Object,
    required: true
  },
  seasonId: {
    type: String,
    required: true
  },
  seasonSlug: {
    type: String,
    default: ''
  },
  players: {
    type: Array,
    default: () => []
  },
  selectedPlayers: {
    type: Array,
    default: () => []
  },
  selectedPlayersByRole: {
    type: Object,
    default: () => ({})
  },
  availabilityByPlayer: {
    type: Object,
    default: () => ({})
  },
  // Pour le mode sélection, indique si tous les joueurs ont confirmé
  isSelectionConfirmedByAllPlayers: {
    type: Boolean,
    default: false
  },
  // Props pour le bouton de confirmation
  sending: {
    type: Boolean,
    default: false
  }
})



// État local
const showDestinatairesHint = ref(false)

const recipientsWithEmail = ref([])
const recipients = ref([])

const nonContactRecipients = ref([])

// Message éditable
const editableMessage = ref('')
const originalMessage = ref('')

// Computed properties manquantes
const eventDirectLink = computed(() => {
  if (!props.event || !props.seasonSlug) return ''
  return `${window.location.origin}/season/${props.seasonSlug}/event/${props.event.id}`
})

// URL de confirmation directe pour la composition
const confirmUrl = computed(() => {
  if (!props.event || !props.seasonSlug) return ''
  return `${window.location.origin}/season/${props.seasonSlug}/event/${props.event.id}?tab=compo&showConfirm=true`
})



// Computed properties
const allDisplayRecipients = computed(() => {
  const withFlag = recipients.value.map(p => ({ ...p, hasContact: p.id !== 'ALL', missingReason: '' }))
  const manual = nonContactRecipients.value.map(p => ({ ...p, hasContact: false, missingReason: 'Aucun canal actif' }))
  return [{ id: 'ALL', name: 'Tous', hasContact: true }, ...withFlag.filter(p => p.id !== 'ALL'), ...manual]
})



// Template unifié pour tous les messages
const unifiedMessage = computed(() => {
  if (!props.event) return ''
  
  const dateStr = formatDateFull(props.event?.date)
  const eventTitle = props.event?.title
  const directLink = eventDirectLink.value
  
  
  
      if (props.mode === 'event') {
      return buildAvailabilityTextTemplate({
      playerName: '', // Toujours vide pour "Tous"
      eventTitle,
      eventDate: dateStr,
      eventUrl: directLink
    })
  } else {
    // Mode sélection : utiliser le template approprié selon l'état de confirmation
    if (props.isSelectionConfirmedByAllPlayers) {
      // Équipe confirmée : utiliser le template d'équipe confirmée
      return buildGlobalConfirmedTeamAnnouncementTemplate({
        eventTitle,
        eventDate: dateStr,
        eventUrl: directLink,
        confirmedPlayers: props.selectedPlayers
      })
    } else {
      // Sélection temporaire : utiliser le message d'annonce de cast
      return buildGlobalCastAnnouncementMessage({
        eventTitle,
        eventDate: dateStr,
        selectedPlayersByRole: props.selectedPlayersByRole,
        players: props.players,
        confirmUrl: confirmUrl.value
      })
    }
  }
})

const copyMessage = computed(() => {
  return unifiedMessage.value
})

// Watcher pour initialiser le message éditable
watch(copyMessage, (newMessage) => {
  if (newMessage) {
    originalMessage.value = newMessage
    if (!editableMessage.value) {
      editableMessage.value = newMessage
    }
  }
}, { immediate: true })













// Méthodes



// Utilitaires
function formatDateFull(date) {
  if (!date) return ''
  const d = new Date(date)
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  return d.toLocaleDateString('fr-FR', options)
}

// Initialisation
// Charger les emails des personnes à prévenir selon le mode
async function loadRecipientsEmails() {
  if (!props.seasonId) return
  
  let targetPlayers = []
  
  if (props.mode === 'selection') {
    // Mode sélection : on prend les joueurs sélectionnés
    targetPlayers = props.players.filter(player => 
      props.selectedPlayers.includes(player.name)
    )
  } else {
    // Mode événement : prendre TOUS les joueurs de la saison
    targetPlayers = props.players
  }
  
  const playersWithEmail = []
  
  for (const player of targetPlayers) {
    try {
      // Importer la fonction depuis le service
      const { getPlayerEmail } = await import('../services/players.js')
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
  const allOption = { id: 'ALL', name: 'Tous' }
  recipients.value = [allOption, ...playersWithEmail]
  
  // Calculer les joueurs à joindre manuellement (pas d'email trouvé)
  const playersWithNoEmail = targetPlayers
    .filter(p => !playersWithEmail.find(e => e.id === p.id))
    .map(p => ({ id: p.id, name: p.name }))
  nonContactRecipients.value = playersWithNoEmail
  

}

// Charger les destinataires au montage
onMounted(() => {
  loadRecipientsEmails()
})

// Surveiller les changements de props pour recharger
watch(() => [props.selectedPlayers, props.availabilityByPlayer], () => {
  loadRecipientsEmails()
}, { deep: true })
</script>

<style scoped>
/* Styles pour le mockup téléphone */
.phone-mockup-preview {
  width: 480px;
  height: 360px;
  background: #1a1a1a;
  border-radius: 20px 20px 0 0;
  border-bottom: none;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.phone-screen-preview {
  width: 100%;
  height: 100%;
  background: #000;
  position: relative;
  overflow: hidden;
}

.phone-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  background: #000;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.status-left .time {
  font-weight: 700;
}

.status-right {
  display: flex;
  gap: 4px;
  align-items: center;
}

.notification-preview-area {
  position: absolute;
  top: 30px;
  left: 16px;
  right: 16px;
  z-index: 10;
}

.notification-card {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;
  display: flex;
  flex-direction: column;
}

.notification-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.notification-icon {
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: black;
}

.notification-source {
  font-size: 12px;
  color: #888;
  flex: 1;
}

.notification-content {
  margin-bottom: 12px;
  margin-left: 36px;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-emoji {
  font-size: 18px;
}

.notification-body {
  font-size: 14px;
  color: #ccc;
  line-height: 1.4;
}

.notification-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  margin-left: 36px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-left: 0;
}

.action-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.action-icon {
  font-size: 14px;
}

.action-text {
  font-size: 12px;
  color: #ffa500;
  font-weight: 500;
}

.notification-avatar {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
  font-weight: 600;
}

.notification-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.phone-app-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #f0f0f0;
  padding: 16px;
  text-align: center;
  display: none;
}

.app-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.app-header p {
  font-size: 10px;
  color: #666;
}

/* Styles pour le mockup Gmail web */
.gmail-web-mockup {
  width: 100%;
  max-width: 600px;
  height: 320px;
  background: white;
  border-radius: 8px 8px 0 0;
  margin: 0 auto;
  position: relative;
  box-shadow: none;
  border: 1px solid #e0e0e0;
  border-bottom: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.gmail-top-bar {
  background: #424242;
  color: white;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.gmail-nav-left, .gmail-nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gmail-nav-center {
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-arrow, .action-icon {
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.back-arrow:hover, .action-icon:hover {
  background: rgba(255, 255, 255, 0.1);
}

.email-counter {
  font-size: 12px;
  color: #ccc;
}

.nav-arrows {
  font-size: 12px;
  color: #ccc;
}

.email-content-web {
  flex: 1;
  padding: 20px 20px 8px 20px;
  background: white;
  display: flex;
  flex-direction: column;
  height: 280px;
  overflow: hidden;
}

.email-header-web {
  margin-bottom: 20px;
}

.email-subject-web {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.email-subject-web h1 {
  font-size: 16px;
  font-weight: 600;
  color: #202124;
  margin: 0;
  flex: 1;
}

.inbox-tag-web {
  background: #f1f3f4;
  color: #5f6368;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.close-icon {
  cursor: pointer;
  font-weight: bold;
}

.sender-info-web {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sender-avatar-web {
  flex-shrink: 0;
}

.avatar-circle {
  width: 32px;
  height: 32px;
  background: #4285f4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.avatar-logo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: contain;
}

.sender-details-web {
  flex: 1;
}

.sender-name-web {
  font-size: 14px;
  font-weight: 500;
  color: #202124;
  margin-bottom: 2px;
}

.sender-email {
  font-size: 12px;
  color: #5f6368;
  font-weight: 400;
}

.recipient-info-web {
  font-size: 12px;
  color: #5f6368;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dropdown-arrow {
  font-size: 10px;
}

.sender-time-web {
  font-size: 12px;
  color: #5f6368;
  margin-left: auto;
}

.email-actions-web {
  display: flex;
  gap: 8px;
  margin-left: 12px;
}

.email-body-web {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.email-text-web {
  font-size: 14px;
  color: #202124 !important;
  line-height: 1.5;
  margin-bottom: 12px;
}

.email-text-web p {
  color: #202124 !important;
}

.email-text-web strong {
  color: #202124 !important;
}

.email-text-web a {
  color: #3b82f6 !important;
}

/* Barre de séparation */
.separator-bar {
  height: 30px;
  position: relative;
  margin-bottom: 5px;
}

/* Tabs flottants par-dessus les previews */
.tabs-floating {
  position: absolute;
  top: 25px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
}

/* Animation pour l'indicateur de copie */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Responsive pour mobile */
@media (max-width: 640px) {
  .phone-mockup-preview {
    width: 360px;
    height: 280px;
  }
  
  .gmail-web-mockup {
    height: 280px;
  }
  
  .email-content-web {
    padding: 16px;
    height: 240px;
  }
  
  .email-subject-web h1 {
    font-size: 14px;
  }
  
  .notification-card {
    padding: 10px;
  }
  
  .notification-title {
    font-size: 13px;
  }
  
  .notification-body {
    font-size: 11px;
  }
}
</style>
