<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[1390] p-0 md:p-4" @click="onClose">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col" @click.stop>
      <!-- Header -->
      <div class="relative p-5 pb-4 border-b border-white/10">
        <button @click="onClose" title="Fermer" class="absolute right-2.5 top-2.5 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
        <h2 class="text-xl md:text-2xl font-bold text-white pr-10 flex items-center gap-2">
          <span>📱</span>
          <span>Envoyer le tirage par WhatsApp</span>
        </h2>
        <p class="text-sm text-purple-300 mt-1" v-if="event">{{ event.title }} — {{ formatDateFull(event.date) }}</p>
      </div>

      <!-- Content scrollable -->
      <div class="px-4 md:px-6 py-4 md:py-6 space-y-6 overflow-y-auto">
        <!-- Message à copier -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Message à envoyer à la PEDA :
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { buildGlobalDrawAnnouncementMessage } from '../services/emailTemplates.js'

const props = defineProps({
  show: { type: Boolean, default: false },
  event: { type: Object, default: null },
  selectedPlayersByRole: { type: Object, default: () => ({}) },
  players: { type: Array, default: () => [] }
})

const emit = defineEmits(['close'])

// État local
const showCopyIndicator = ref(false)

// Message éditable
const editableMessage = ref('')
const originalMessage = ref('')

// Computed properties
const drawMessage = computed(() => {
  if (!props.event) return ''
  
  const dateStr = formatDateFull(props.event?.date)
  const eventTitle = props.event?.title
  
  return buildGlobalDrawAnnouncementMessage({
    eventTitle,
    eventDate: dateStr,
    selectedPlayersByRole: props.selectedPlayersByRole,
    players: props.players
  })
})

// Watcher pour initialiser le message éditable
watch(drawMessage, (newMessage) => {
  if (newMessage) {
    originalMessage.value = newMessage
    if (!editableMessage.value) {
      editableMessage.value = newMessage
    }
  }
}, { immediate: true })

// Watcher pour réinitialiser le message quand la modale s'ouvre
watch(() => props.show, (isOpen) => {
  if (isOpen && drawMessage.value) {
    editableMessage.value = drawMessage.value
    originalMessage.value = drawMessage.value
  }
})

// Fonctions
function onClose() {
  emit('close')
}

function formatDateFull(dateValue) {
  if (!dateValue) return ''
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue.toDate?.() || dateValue
  return date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

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
</script>

<style scoped>
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
</style>

