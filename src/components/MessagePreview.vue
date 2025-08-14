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
          Cette liste montre tous les joueurs ciblés: <span class="text-purple-300">« Tous »</span>,
          <span class="text-gray-200">ceux notifiables (email/push actifs)</span> et
          <span class="text-yellow-300">ceux en jaune sans canal actif</span>.
          Les joueurs en jaune ne peuvent pas être notifiés automatiquement. Utilise « Copier le message » pour leur écrire via un autre moyen (l'URL de l'événement est incluse).
        </p>
      </div>
      
      <div class="bg-gray-800 border border-gray-600 rounded-lg p-3">
        <div v-if="allDisplayRecipients.length > 0" class="space-y-2">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="player in allDisplayRecipients"
              :key="player.id || player.name"
              type="button"
              @click="selectRecipient(player)"
              :class="[
                'px-3 py-1 rounded text-sm border transition-colors',
                selectedRecipient && selectedRecipient.id === player.id
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : player.hasContact
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    : 'bg-yellow-900/20 border-yellow-600/40 text-yellow-200 hover:bg-yellow-900/30 opacity-75 cursor-not-allowed'
              ]"
              :title="player.hasContact ? ('Prévisualiser pour ' + player.name) : (player.missingReason || 'Aucun canal actif')"
            >
              {{ player.name }}
            </button>
          </div>
        </div>
        <div v-else class="text-amber-400 text-sm">
          ⚠️ Aucun destinataire disponible.
        </div>
      </div>
    </div>

    <!-- Aperçu du message -->
    <div class="relative">
      <label class="block text-sm font-medium text-gray-300 mb-2">Aperçu du message :</label>
      
      <!-- Barre de séparation avec toggle flottant -->
      <div class="separator-bar">
        <div class="tabs-floating">
          <div class="inline-flex bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
            <button
              class="px-3 py-1.5 text-sm transition-colors"
              :class="activePreviewTab === 'email' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'"
              @click="activePreviewTab = 'email'"
              title="Prévisualiser l'email"
            >📧</button>
            <button
              class="px-3 py-1.5 text-sm transition-colors"
              :class="activePreviewTab === 'push' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'"
              @click="activePreviewTab = 'push'"
              title="Prévisualiser la notification push"
            >📱</button>
            <button
              class="px-3 py-1.5 text-sm transition-colors"
              :class="activePreviewTab === 'copy' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'"
              @click="activePreviewTab = 'copy'"
              title="Prévisualiser le texte à copier"
              style="font-size: 16px;"
            >📋</button>
          </div>
        </div>
      </div>

      <!-- Email preview avec style Gmail web -->
      <div v-if="activePreviewTab === 'email'" :class="(hasSelectedRecipientContact || selectedRecipient?.id === 'ALL') ? '' : 'space-y-3'">
        <template v-if="hasSelectedRecipientContact || selectedRecipient?.id === 'ALL'">
          <!-- Mockup Gmail web -->
          <div class="gmail-web-mockup">
            <!-- Barre de titre Gmail -->
            <div class="gmail-top-bar">
              <div class="gmail-nav-left">
                <span class="back-arrow">←</span>
              </div>
              <div class="gmail-nav-center">
                <span class="nav-arrows">←</span>
                <span class="email-counter">1 sur 1</span>
                <span class="nav-arrows">→</span>
              </div>
              <div class="gmail-nav-right">
                <span class="action-icon">▼</span>
                <span class="action-icon">⋮</span>
              </div>
            </div>
            
            <!-- Contenu de l'email -->
            <div class="email-content-web">
              <!-- En-tête de l'email -->
              <div class="email-header-web">
                <div class="email-subject-web">
                  <h1>{{ emailSubject }}</h1>
                  <div class="inbox-tag-web">
                    Boîte de réception <span class="close-icon">×</span>
                  </div>
                </div>
                
                <div class="sender-info-web">
                  <div class="sender-avatar-web">
                    <img src="/logos/hatcast-mask.png" alt="HatCast" class="avatar-logo" />
                  </div>
                  <div class="sender-details-web">
                    <div class="sender-name-web">{{ emailFrom }} <span class="sender-email">&lt;noreply@hatcast.app&gt;</span></div>
                    <div class="recipient-info-web">
                      à moi <span class="dropdown-arrow">▼</span>
                    </div>
                  </div>
                  <div class="sender-time-web">5:23 PM (il y a 25 minutes)</div>
                  <div class="email-actions-web">
                    <span class="action-icon">☆</span>
                    <span class="action-icon">⋮</span>
                  </div>
                </div>
              </div>
              
              <!-- Corps de l'email -->
              <div class="email-body-web">
                <div class="email-text-web" v-html="emailHtml"></div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 rounded-md p-3 text-sm">
            Ce joueur n'a pas configuré d'email. Utilise la fonction « Copier le message » et envoie-lui ces informations par un autre canal.
          </div>
          <textarea class="w-full mt-2 p-3 bg-gray-900 border border-gray-700 rounded-md text-white text-sm" :value="nonContactCopyText" rows="5" readonly></textarea>
        </template>
      </div>

      <!-- Push preview avec style téléphone -->
      <div v-else-if="activePreviewTab === 'push'" :class="(selectedRecipient && selectedRecipient.id !== 'ALL' && !hasSelectedRecipientContact) ? 'text-white' : ''">
        <template v-if="!(selectedRecipient && selectedRecipient.id !== 'ALL' && !hasSelectedRecipientContact)">
          <!-- Mockup de téléphone pour la prévisualisation -->
          <div class="phone-mockup-preview">
            <div class="phone-screen-preview">
              <!-- Barre de statut du téléphone -->
              <div class="phone-status-bar">
                <div class="status-left">
                  <span class="time">9:41</span>
                </div>
                <div class="status-right">
                  <span class="signal">📶</span>
                  <span class="battery">🔋</span>
                  <span class="notification-dot">🔔</span>
                </div>
              </div>
              
              <!-- Zone de notification -->
              <div class="notification-preview-area">
                <div class="notification-card">
                  <!-- Header de la notification -->
                  <div class="notification-header">
                    <div class="notification-icon">🔔</div>
                    <div class="notification-source">HatCast • 16 min</div>
                  </div>
                  
                  <!-- Contenu de la notification -->
                  <div class="notification-content">
                    <div class="notification-title">
                      {{ pushTitle }}
                    </div>
                    <div class="notification-body">{{ pushBody }}</div>
                  </div>
                  
                  <!-- Actions de la notification -->
                  <div class="notification-actions">
                    <template v-if="mode === 'event'">
                      <div class="action-item">
                        <span class="action-icon">✅</span>
                        <span class="action-text">Dispo</span>
                      </div>
                      <div class="action-item">
                        <span class="action-icon">❌</span>
                        <span class="action-text">Pas dispo</span>
                      </div>
                    </template>
                    <template v-else>
                      <div class="action-item">
                        <span class="action-icon">❌</span>
                        <span class="action-text">Plus dispo</span>
                      </div>
                    </template>
                  </div>
                  
                  <!-- Avatar/Compteur à droite -->
                  <div class="notification-avatar">
                    <img src="/logos/hatcast-mask.png" alt="HatCast" class="notification-logo" />
                  </div>
                </div>
              </div>
              
              <!-- Contenu de l'app en arrière-plan -->
              <div class="phone-app-content">
                <div class="app-header">
                  <h3>📱 HatCast</h3>
                  <p>Votre application en arrière-plan</p>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 rounded-md p-3 text-sm mb-2">
            {{ selectedRecipient?.name }} n'a pas installé l'appli. Envoie-lui ce message manuellement.
          </div>
          <textarea class="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white text-sm" :value="nonContactCopyText" rows="5" readonly></textarea>
        </template>
      </div>

      <!-- Copy preview (pour les joueurs sans compte) -->
      <div v-else-if="activePreviewTab === 'copy'" class="space-y-3">
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
import { buildAvailabilityEmailPreview, buildSelectionEmailPreview, buildAvailabilityPushPreview, buildSelectionPushPreview } from '../services/notificationTemplates.js'
import { buildAvailabilityTextTemplate, buildSelectionTextTemplate, buildNoEmailTemplate } from '../services/emailTemplates.js'

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
  availabilityByPlayer: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:selectedRecipient'])

// État local
const showDestinatairesHint = ref(false)
const activePreviewTab = ref('email')
const showCopyIndicator = ref(false)
const recipientsWithEmail = ref([])
const recipients = ref([])
const selectedRecipient = ref(null)
const nonContactRecipients = ref([])

// Computed properties manquantes
const eventDirectLink = computed(() => {
  if (!props.event || !props.seasonSlug) return ''
  return `${window.location.origin}/season/${props.seasonSlug}/event/${props.event.id}`
})

const deselectMagicLinkText = computed(() => {
  try {
    const player = selectedRecipient.value?.id && selectedRecipient.value.id !== 'ALL'
      ? props.players.find(p => p.id === selectedRecipient.value.id)
      : null
    if (!player || !props.event?.id || !props.seasonId) return '[lien désistement]'
    return `${window.location.origin}/magic?auto=no&season=${encodeURIComponent(props.seasonId)}&player=${encodeURIComponent(player.id)}&event=${encodeURIComponent(props.event.id)}&slug=${encodeURIComponent(props.seasonSlug || '')}`
  } catch {
    return '[lien désistement]'
  }
})

// Computed properties
const allDisplayRecipients = computed(() => {
  const withFlag = recipients.value.map(p => ({ ...p, hasContact: p.id !== 'ALL', missingReason: '' }))
  const manual = nonContactRecipients.value.map(p => ({ ...p, hasContact: false, missingReason: 'Aucun canal actif' }))
  return [{ id: 'ALL', name: 'Tous', hasContact: true }, ...withFlag.filter(p => p.id !== 'ALL'), ...manual]
})

const hasSelectedRecipientContact = computed(() => {
  if (!selectedRecipient.value || selectedRecipient.value.id === 'ALL') return true
  const rec = allDisplayRecipients.value.find(p => (p.id || p.name) === (selectedRecipient.value.id || selectedRecipient.value.name))
  return !!rec?.hasContact
})

// Template unifié pour tous les messages
const unifiedMessage = computed(() => {
  if (!props.event) return ''
  
  const playerName = selectedRecipient.value?.id === 'ALL' ? '' : (selectedRecipient.value?.name || '[Nom du joueur]')
  const dateStr = formatDateFull(props.event?.date)
  const eventTitle = props.event?.title
  const directLink = eventDirectLink.value
  
  if (props.mode === 'event') {
    return buildAvailabilityTextTemplate({
      playerName,
      eventTitle,
      eventDate: dateStr,
      eventUrl: directLink
    })
  } else {
    return buildSelectionTextTemplate({
      playerName,
      eventTitle,
      eventDate: dateStr,
      eventUrl: directLink
    })
  }
})

const copyMessage = computed(() => {
  return unifiedMessage.value
})

const nonContactCopyText = computed(() => {
  return unifiedMessage.value
})

// Email preview content
const emailSubject = computed(() => {
  if (!props.event) return ''
  const dateStr = formatDateFull(props.event?.date)
  const playerName = selectedRecipient.value?.id === 'ALL' ? '' : (selectedRecipient.value?.name || '[Nom du joueur]')
  
  if (props.mode === 'event') {
    return buildAvailabilityEmailPreview({ 
      recipientName: playerName, 
      eventTitle: props.event?.title, 
      eventDate: dateStr,
      eventUrl: eventDirectLink.value,
      yesUrl: `${eventDirectLink.value}?action=available`,
      noUrl: `${eventDirectLink.value}?action=unavailable`
    }).subject
  } else {
    return buildSelectionEmailPreview({
      recipientName: playerName,
      eventTitle: props.event?.title,
      eventDate: dateStr,
      eventUrl: eventDirectLink.value,
      noUrl: deselectMagicLinkText.value
    }).subject
  }
})

const emailFrom = computed(() => {
  return 'HatCast'
})

const emailHtml = computed(() => {
  if (!props.event) return ''
  const dateStr = formatDateFull(props.event?.date)
  const playerName = selectedRecipient.value?.id === 'ALL' ? '' : (selectedRecipient.value?.name || '[Nom du joueur]')
  
  if (selectedRecipient.value && selectedRecipient.value.id && selectedRecipient.value.id !== 'ALL' && !allDisplayRecipients.value.find(p => p.id === selectedRecipient.value.id)?.hasContact) {
    return buildNoEmailTemplate({
      playerName,
      eventTitle: props.event?.title,
      eventDate: dateStr,
      eventUrl: eventDirectLink.value
    })
  }
  
  if (props.mode === 'event') {
    return buildAvailabilityEmailPreview({
      recipientName: playerName,
      eventTitle: props.event?.title,
      eventDate: dateStr,
      eventUrl: eventDirectLink.value,
      yesUrl: `${eventDirectLink.value}?action=available`,
      noUrl: `${eventDirectLink.value}?action=unavailable`
    }).html
  } else {
    return buildSelectionEmailPreview({
      recipientName: playerName,
      eventTitle: props.event?.title,
      eventDate: dateStr,
      eventUrl: eventDirectLink.value,
      noUrl: deselectMagicLinkText.value
    }).html
  }
})

// Push preview content
const pushTitle = computed(() => {
  if (!props.event) return ''
  const dateStr = formatDateFull(props.event?.date)
  const playerName = selectedRecipient.value?.id === 'ALL' ? '' : (selectedRecipient.value?.name || '[Nom du joueur]')
  
  if (props.mode === 'event') {
    return buildAvailabilityPushPreview({ recipientName: playerName, eventTitle: props.event?.title, eventDate: dateStr }).title
  } else {
    return buildSelectionPushPreview({ recipientName: playerName, eventTitle: props.event?.title, eventDate: dateStr }).title
  }
})

const pushBody = computed(() => {
  if (!props.event) return ''
  const dateStr = formatDateFull(props.event?.date)
  const playerName = selectedRecipient.value?.id === 'ALL' ? '' : (selectedRecipient.value?.name || '[Nom du joueur]')
  const selected = selectedRecipient.value && selectedRecipient.value.id && selectedRecipient.value.id !== 'ALL'
  const selectedHasContact = selected ? !!allDisplayRecipients.value.find(p => p.id === selectedRecipient.value.id)?.hasContact : true
  
  if (selected && !selectedHasContact) {
    return unifiedMessage.value
  }
  
  if (props.mode === 'event') {
    return buildAvailabilityPushPreview({ recipientName: playerName, eventTitle: props.event?.title, eventDate: dateStr }).body
  } else {
    return buildSelectionPushPreview({ recipientName: playerName, eventTitle: props.event?.title, eventDate: dateStr }).body
  }
})

// Méthodes
function selectRecipient(player) {
  selectedRecipient.value = player
  emit('update:selectedRecipient', player)
}

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
    console.log('Mode sélection - targetPlayers:', targetPlayers)
  } else {
    // Mode événement : prendre tous les joueurs dont la dispo est indéfinie
    targetPlayers = props.players.filter(player => {
      const status = props.availabilityByPlayer?.[player.name]
      return typeof status === 'undefined'
    })
    console.log('Mode événement - targetPlayers:', targetPlayers)
  }
  
  const playersWithEmail = []
  
  for (const player of targetPlayers) {
    try {
      // Importer la fonction depuis le service
      const { getPlayerEmail } = await import('../services/playerProtection.js')
      const email = await getPlayerEmail(player.id, props.seasonId)
      console.log(`Email pour ${player.name}:`, email)
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
  
  console.log('Players avec email:', playersWithEmail)
  
  recipientsWithEmail.value = playersWithEmail
  const allOption = { id: 'ALL', name: 'Tous' }
  recipients.value = [allOption, ...playersWithEmail]
  
  // Calculer les joueurs à joindre manuellement (pas d'email trouvé)
  const playersWithNoEmail = targetPlayers
    .filter(p => !playersWithEmail.find(e => e.id === p.id))
    .map(p => ({ id: p.id, name: p.name }))
  nonContactRecipients.value = playersWithNoEmail
  
  console.log('Recipients finaux:', {
    recipients: recipients.value,
    nonContactRecipients: nonContactRecipients.value,
    allDisplayRecipients: allDisplayRecipients.value
  })
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
