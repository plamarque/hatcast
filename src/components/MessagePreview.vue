<template>
  <div class="space-y-4">
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
          Les personnes en jaune ne peuvent pas être notifiées automatiquement. Utilise le message ci-dessous pour les contacter manuellement.
        </p>
      </div>
      
      <div class="bg-gray-800 border border-gray-600 rounded-lg p-3">
        <div v-if="allDisplayRecipients.length > 0" class="space-y-3">
          <!-- Résumé des destinataires -->
          <div class="text-gray-300 text-sm mb-3">
            <span class="text-white font-medium">{{ allDisplayRecipients.length - 1 }}</span> personnes à prévenir. 
            <span class="text-green-400 font-medium">{{ recipientsWithEmail.length }}</span> seront notifiées, 
            <span class="text-yellow-400 font-medium">{{ nonContactRecipients.length }}</span> devront être prévenues manuellement.
          </div>
          
          <!-- Liste des personnes -->
          <div class="flex flex-wrap gap-2">
            <div
              v-for="player in allDisplayRecipients.filter(p => p.id !== 'ALL')"
              :key="player.id || player.name"
              :class="[
                'px-3 py-2 rounded text-sm border flex flex-col gap-1',
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
                {{ player.email }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-amber-400 text-sm">
          ⚠️ Aucun destinataire disponible.
        </div>
      </div>
    </div>

    <!-- Message à copier -->
    <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
          {{ mode === 'selection' ? 'Message à copier pour présélection à confirmer (WhatsApp) :' : 'Message à copier pour les contacts manuels :' }}
        </label>

      <!-- Message à copier -->
      <div class="space-y-3">
        <!-- Indicateur de copie -->
        <div v-if="showCopyIndicator" class="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          ✅ Copié !
        </div>
        <div 
          class="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white text-sm cursor-pointer hover:bg-gray-700 transition-colors"
          @click="handleCopyTextClick"
          title="Cliquer pour copier le texte"
        >
          <pre class="whitespace-pre-wrap font-sans">{{ copyMessage }}</pre>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { buildAvailabilityTextTemplate, buildCastTextMessage, buildGlobalCastAnnouncementMessage, buildGlobalConfirmedTeamAnnouncementTemplate } from '../services/emailTemplates.js'

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
  }
})



// État local
const showDestinatairesHint = ref(false)

const showCopyIndicator = ref(false)
const recipientsWithEmail = ref([])
const recipients = ref([])

const nonContactRecipients = ref([])

// Computed properties manquantes
const eventDirectLink = computed(() => {
  if (!props.event || !props.seasonSlug) return ''
  return `${window.location.origin}/season/${props.seasonSlug}/event/${props.event.id}`
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
        players: props.players
      })
    }
  }
})

const copyMessage = computed(() => {
  return unifiedMessage.value
})













// Méthodes


function handleCopyTextClick() {
  navigator.clipboard.writeText(copyMessage.value)
  showCopyIndicator.value = true
  setTimeout(() => {
    showCopyIndicator.value = false
  }, 2000)
}

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
