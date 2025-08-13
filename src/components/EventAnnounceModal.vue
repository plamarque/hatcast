<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[90] p-0 md:p-4" @click="onClose">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col" @click.stop>
      <!-- Header -->
      <div class="relative p-5 pb-4 border-b border-white/10">
        <button @click="onClose" title="Fermer" class="absolute right-2.5 top-2.5 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
        <h2 class="text-xl md:text-2xl font-bold text-white pr-10 flex items-center gap-2">
          <span>{{ mode === 'selection' ? '📣' : '📢' }}</span>
          <span>{{ mode === 'selection' ? 'Annoncer la sélection' : 'Annoncer l\'événement' }}</span>
        </h2>
        <p class="text-sm text-purple-300 mt-1" v-if="event">{{ event.title }} — {{ formatDateFull(event.date) }}</p>
      </div>

      <!-- Content scrollable -->
      <div class="px-4 md:px-6 py-4 md:py-6 space-y-6 overflow-y-auto">
        <!-- Message d'information supprimé pour alléger l'UI -->

        <!-- Contenu Notifications (sans onglets) -->
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
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Aperçu du message :</label>
            <!-- Tabs Email/Push -->
            <div class="inline-flex bg-gray-800 rounded-lg overflow-hidden border border-gray-700 mb-3">
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
              >🔔</button>
            </div>

            <!-- Email preview -->
            <div v-if="activePreviewTab === 'email'" :class="(hasSelectedRecipientContact || selectedRecipient?.id === 'ALL') ? 'bg-gray-800 border border-gray-600 rounded-lg p-4 text-white space-y-3' : 'space-y-3'">
              <template v-if="hasSelectedRecipientContact || selectedRecipient?.id === 'ALL'">
                <div class="text-sm text-gray-300"><span class="font-semibold">De:</span> {{ emailFrom }}</div>
                <div class="text-sm text-gray-300"><span class="font-semibold">À:</span> {{ selectedRecipient?.id === 'ALL' ? '<joueur>' : (selectedRecipient?.name || '[Nom du joueur]') }}</div>
                <div class="text-sm text-gray-300"><span class="font-semibold">Objet:</span> {{ emailSubject }}</div>
                <div class="bg-white text-black rounded-md p-4" v-html="emailHtml"></div>
              </template>
              <template v-else>
                <div class="bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 rounded-md p-3 text-sm">
                  Ce joueur  n'a pas configuré d'email. Utilise la fonction « Copier le message » et envoie-lui ces informations par un autre canal.
                </div>
                <textarea class="w-full mt-2 p-3 bg-gray-900 border border-gray-700 rounded-md text-white text-sm" :value="nonContactCopyText" rows="5" readonly></textarea>
              </template>
            </div>

            <!-- Push preview (closer to Android notification) -->
            <div v-else :class="(selectedRecipient && selectedRecipient.id !== 'ALL' && !hasSelectedRecipientContact) ? 'text-white' : 'bg-gray-900 border border-gray-700 rounded-xl p-4 text-white'">
              <template v-if="!(selectedRecipient && selectedRecipient.id !== 'ALL' && !hasSelectedRecipientContact)">
              <!-- Header line: app + time + bell -->
              <div class="flex items-center justify-between text-xs text-white/70">
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">🔔</div>
                  <div class="truncate">Impropick</div>
                  <span class="opacity-60">•</span>
                  <span>il y a 1 min</span>
                </div>
                <img src="/icons/manifest-icon-192.maskable.png" alt="App icon" class="w-10 h-10 rounded-full shadow" />
              </div>

              <!-- Body -->
              <div class="mt-3">
                <div class="text-lg font-semibold leading-snug">{{ pushTitle }}</div>
                <div class="mt-2 text-base whitespace-pre-line text-white/90">{{ pushBody }}</div>
              </div>

              <!-- Actions (chips) -->
              <div class="mt-4 flex items-center gap-4 text-base">
                <template v-if="props.mode === 'event'">
                  <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-600/20 text-green-300 border border-green-600/40">✅ Dispo</span>
                  <span class="text-red-600/20 text-red-300 border border-red-600/40">❌ Pas dispo</span>
                </template>
                <template v-else>
                  <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 text-gray-900 border border-white/20">Ouvrir</span>
                </template>
              </div>
              </template>
              <template v-else>
                <div class="bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 rounded-md p-3 text-sm mb-2">
                  {{ selectedRecipient?.name }} n'a pas installé l'appli. Envoie-lui ce message manuellement.
                </div>
                <textarea class="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white text-sm" :value="nonContactCopyText" rows="5" readonly></textarea>
              </template>
            </div>
          </div>


        </div>

        <!-- Section Copie supprimée: bouton de copie présent dans le footer -->
      </div>

      <!-- Footer sticky -->
      <div class="sticky bottom-0 w-full p-3 bg-gray-900/95 border-t border-white/10 backdrop-blur-sm flex items-center gap-2">
        <!-- Actions principales: Envoyer + Copier le message -->
        <div class="flex items-center gap-2 w-full">
          <button
            @click="sendNotifications"
            :disabled="recipients.length === 0 || computedSending || (selectedRecipient && selectedRecipient.id !== 'ALL' && !hasSelectedRecipientContact)"
            class="h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600 flex-1"
          >
            <span v-if="!computedSending">
              <template v-if="selectedRecipient && selectedRecipient.id !== 'ALL'">
                <span :class="!hasSelectedRecipientContact ? 'opacity-60' : ''">
                  <span class="hidden sm:inline">🔔 Notifier {{ selectedRecipient.name }}</span>
                  <span class="sm:hidden">🔔 Notifier</span>
                </span>
              </template>
              <template v-else>
                <span class="hidden sm:inline">🔔 Envoyer les notifications</span>
                <span class="sm:hidden">🔔 Envoyer</span>
              </template>
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
import { ref, computed, onMounted, watch } from 'vue'
import { buildCopyMessage, buildPreviewText, buildNotificationPayloads } from '../services/notificationTemplates.js'

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

// Suppression des onglets, on conserve un seul écran
const activeTab = ref('notify')
const copied = ref(false)
const copyButtonText = ref('Copier le message')
const isSending = ref(false)
const computedSending = computed(() => props.sending || isSending.value)
const showDestinatairesHint = ref(false)
const activePreviewTab = ref('email')

// Onglets supprimés

// Computed properties
const eventDirectLink = computed(() => {
  if (!props.event || !props.seasonSlug) return ''
  return `${window.location.origin}/season/${props.seasonSlug}/event/${props.event.id}`
})

const copyMessage = computed(() => {
  if (!props.event) return ''
  if (activePreviewTab.value === 'push') {
    const header = pushTitle.value
    const bodyLine = pushBody.value
    if (props.mode === 'event') {
      const footerUrl = `\n\nLien direct: ${eventDirectLink.value}`
      return `${header}\n${bodyLine}\n✅ Dispo\n❌ Pas dispo${footerUrl}`
    }
    return `${header}\n${bodyLine}\nOuvrir`
  }
  const footerUrl = `\n\nLien direct: ${eventDirectLink.value}`
  return `Objet: ${emailSubject.value}\n\n${emailTextContent.value}${footerUrl}`
})

// Email preview content
const emailSubject = computed(() => {
  const dateStr = formatDateFull(props.event?.date)
  if (props.mode === 'event') {
    return `${props.event?.title} (${dateStr})`
  }
  return `🎭 Sélectionné pour ${props.event?.title}`
})

const emailFrom = computed(() => {
  // Adresse d'expéditeur pour la prévisualisation
  return 'impropick@gmail.com'
})

const emailHtml = computed(() => {
  const playerName = selectedRecipient.value?.id === 'ALL' ? '<joueur>' : (selectedRecipient.value?.name || '[Nom du joueur]')
  const dateStr = formatDateFull(props.event?.date)
  // Si le joueur cliqué n'a pas de canal actif, afficher un message de remplacement encourageant la copie
  if (selectedRecipient.value && selectedRecipient.value.id && selectedRecipient.value.id !== 'ALL' && !allDisplayRecipients.value.find(p => p.id === selectedRecipient.value.id)?.hasContact) {
    return `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
        <p><strong>${playerName}</strong> n'a pas configuré d'email. Utilise la fonction « Copier le message » et envoie-lui ces informations par un autre canal.</p>
        <p style="margin-top: 8px; font-weight: 600;">${props.event?.title}</p>
        <p style="color:#374151;">${dateStr}</p>
        <p style="margin-top: 8px;">Lien direct : ${eventDirectLink.value}</p>
      </div>
    `
  }
  if (props.mode === 'event') {
    return `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
        <p><strong>${playerName}</strong>, un nouvel événement est prévu.</p>
        <p style="margin: 12px 0 2px 0; font-weight: 600;">${props.event?.title}</p>
        <p style="margin: 0 0 16px 0; color:#374151;">${dateStr}</p>
        <p>Nous avons besoin de savoir si tu es disponible.</p>
        <p style="margin-top: 12px;">
          <a href="#yes" style="display:inline-block;padding:10px 12px;margin-right:8px;border:2px solid #16a34a;color:#16a34a;border-radius:8px;text-decoration:none;">✅ Dispo</a>
          <a href="#no" style="display:inline-block;padding:10px 12px;border:2px solid #dc2626;color:#dc2626;border-radius:8px;text-decoration:none;">❌ Pas dispo</a>
        </p>
        <p style="margin-top: 16px;">Merci!!</p>
      </div>
    `
  }
  return `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
      <p><strong>${playerName}</strong>, tu as été sélectionné pour <strong>${props.event?.title}</strong> le <strong>${dateStr}</strong>!</p>
      <p style="margin-top: 16px; font-weight: 600;">Actions rapides :</p>
      <p style="margin-top: 8px;">
        <a href="#no" style="display:inline-block;padding:10px 12px;border:2px solid #dc2626;color:#dc2626;border-radius:8px;text-decoration:none;">❌ Pas dispo</a>
      </p>
    </div>
  `
})

const emailTextContent = computed(() => {
  const html = emailHtml.value
  return html
    .replace(/<\/?div[^>]*>/g, '\n')
    .replace(/<\/?p[^>]*>/g, '\n')
    .replace(/<br\s*\/?>(\n)?/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
})

// Push preview content
const pushTitle = computed(() => {
  if (props.mode === 'event') return `${props.event?.title} (${formatDateFull(props.event?.date)})`
  return '🎭 Sélectionné pour'
})

const pushBody = computed(() => {
  const dateStr = formatDateFull(props.event?.date)
  const playerName = selectedRecipient.value?.id === 'ALL' ? '<joueur>' : (selectedRecipient.value?.name || '[Nom du joueur]')
  const selected = selectedRecipient.value && selectedRecipient.value.id && selectedRecipient.value.id !== 'ALL'
  const selectedHasContact = selected ? !!allDisplayRecipients.value.find(p => p.id === selectedRecipient.value.id)?.hasContact : true
  if (selected && !selectedHasContact) {
    return `${playerName} n'a pas installé l'appli. Envoie-lui ce message manuellement.\n${props.event?.title} (${dateStr})\nLien: ${eventDirectLink.value}`
  }
  if (props.mode === 'event') {
    return `${playerName}, t'es dispo ?`
  }
  return `${playerName}, tu as été sélectionné pour ${props.event?.title} le ${dateStr}!\n\n[ Afficher les Détails]\n\nUn imprévu ?\n❌ Pas dispo`
})

const recipientsWithEmail = ref([])
const recipients = ref([])
const selectedRecipient = ref(null)
const nonContactRecipients = ref([])
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

const nonContactCopyText = computed(() => {
  const playerName = selectedRecipient.value?.id === 'ALL' ? '<joueur>' : (selectedRecipient.value?.name || '[Nom du joueur]')
  const dateStr = formatDateFull(props.event?.date)
  if (props.mode === 'selection') {
    return `Bonjour ${playerName},\nTu as été sélectionné(e) pour ${props.event?.title} (${dateStr})\nUn imprévu ? ${deselectMagicLinkText.value}\nDétails : ${eventDirectLink.value}`
  }
  return `Bonjour ${playerName},\n${props.event?.title} (${dateStr})\nPeux-tu indiquer ta disponibilité ?\nLien : ${eventDirectLink.value}`
})

const deselectMagicLinkText = computed(() => {
  // Génère un texte de lien (ou une URL si disponible) pour le désistement
  // On ne peut pas générer ici le vrai magic link sans playerId; on met un placeholder s'il manque
  try {
    const player = selectedRecipient.value?.id && selectedRecipient.value.id !== 'ALL'
      ? props.players.find(p => p.id === selectedRecipient.value.id)
      : null
    if (!player || !props.event?.id || !props.seasonId) return '[lien désistement]'
    // importer paresseusement pour éviter coût initial
    // NOTE: pas d'appel async dans computed; retourner placeholder si indispo
    return `${window.location.origin}/magic?auto=no&season=${encodeURIComponent(props.seasonId)}&player=${encodeURIComponent(player.id)}&event=${encodeURIComponent(props.event.id)}&slug=${encodeURIComponent(props.seasonSlug || '')}`
  } catch {
    return '[lien désistement]'
  }
})

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
    // Mode événement : prendre tous les joueurs dont la dispo est indéfinie,
    // puis on filtrera réellement sur la présence d'un email plus bas.
    targetPlayers = props.players.filter(player => {
      const status = props.availabilityByPlayer?.[player.name]
      return typeof status === 'undefined'
    })
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
  if (!selectedRecipient.value) {
    selectedRecipient.value = allOption
  }
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

function selectRecipient(player) {
  selectedRecipient.value = player
}

async function sendNotifications() {
  if (!props.event || recipients.value.length === 0) return
  
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
  }
}

// Load recipients when modal opens
onMounted(() => {
  if (props.show) {
    loadRecipientsEmails()
  }
})

// Watch for modal opening to load emails
watch(() => props.show, (newShow) => {
  if (newShow) {
    loadRecipientsEmails()
  }
})

// Watch for changes in selectedPlayers (mode sélection)
watch(() => props.selectedPlayers, () => {
  if (props.show && props.mode === 'selection') {
    loadRecipientsEmails()
  }
})

// Watch for availability changes to refresh recipients (mode événement)
watch(() => props.availabilityByPlayer, () => {
  if (props.show && props.mode === 'event') {
    loadRecipientsEmails()
  }
}, { deep: true })

// Synchroniser le spinner local avec l'état parent
watch(() => props.sending, (now) => {
  if (!now) {
    isSending.value = false
  }
})
</script>
