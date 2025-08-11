<template>
  <div v-if="isActive && showModal" class="fixed inset-0 z-[130] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="w-full max-w-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl text-center">
      <div class="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
        <span class="text-3xl">🎬</span>
      </div>
      <h2 class="text-2xl md:text-3xl font-bold text-white mb-3">{{ titleText }}</h2>
      <p class="text-gray-300 mb-6">{{ subtitleText }}</p>

      <div class="flex flex-col items-stretch justify-center gap-3">
        <template v-if="step === 1">
          <button @click="handleCreateEvent" class="px-5 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all">
            ✨ Créer un événement
          </button>
        </template>
        <template v-else-if="step === 2">
          <button @click="handleAddPlayer" class="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all">
            👤 Ajouter un joueur
          </button>
        </template>
        <template v-else-if="step === 3">
          <input
            :value="seasonLink"
            type="text"
            readonly
            class="w-full px-3 py-2 bg-gray-800 border border-white/20 rounded-lg text-white text-sm select-all"
            @focus="$event.target.select()"
          />
          <div class="flex gap-3 justify-center">
            <button @click="handleCopyLink" class="px-5 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all">
              🔗 Copier le lien
            </button>
            <button @click="handleDismiss" class="px-5 py-3 bg-transparent text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 transition-all">
              J’ai compris
            </button>
          </div>
        </template>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  seasonId: { type: String, default: '' },
  seasonSlug: { type: String, default: '' },
  playersCount: { type: Number, default: 0 },
  eventsCount: { type: Number, default: 0 },
  onboardingDone: { type: Boolean, default: false }
})

const emit = defineEmits(['create-event', 'add-player', 'copy-link', 'dismissed'])

const origin = window.location.origin
const seasonLink = computed(() => `${origin}/season/${props.seasonSlug}`)

const dismissedShare = ref(false)
// Lire éventuel masquage pour cet utilisateur
try {
  if (props.seasonId) {
    dismissedShare.value = !!localStorage.getItem(`dismissCreatorOnboarding:${props.seasonId}`)
  }
} catch {}

const step = computed(() => {
  if (props.onboardingDone) return 0
  if (props.eventsCount === 0 && props.playersCount === 0) return 1
  if (props.eventsCount > 0 && props.playersCount === 0) return 2
  if (props.eventsCount > 0 && props.playersCount > 0 && !dismissedShare.value) return 3
  return 0
})

const isActive = computed(() => step.value > 0)
const showModal = ref(isActive.value)
watch(step, (s) => { showModal.value = s > 0 })

const titleText = computed(() => {
  switch (step.value) {
    case 1: return 'Commençons par créer votre premier événement'
    case 2: return 'Super ! Ajoutez votre premier joueur'
    case 3: return 'Vous y êtes presque! Maintenant, invitez vos joueurs.'
    default: return ''
  }
})
const subtitleText = computed(() => {
  switch (step.value) {
    case 1: return 'Un titre, une date... et c\’est parti.'
    case 2: return 'Ajoutez au moins un joueur pour commencer à saisir des disponibilités.'
    case 3: return 'Laissez vos membres s’inscrire eux-même et indiquer leurs disponibilités en leur envoyant le lien direct.'
    default: return ''
  }
})

function handleCreateEvent() {
  showModal.value = false
  emit('create-event')
}
function handleAddPlayer() {
  showModal.value = false
  emit('add-player')
}
function handleCopyLink() {
  try { navigator.clipboard?.writeText(seasonLink.value) } catch {}
  emit('copy-link')
}
async function handleDismiss() {
  try {
    if (props.seasonId) {
      const { db } = await import('../services/firebase.js')
      const { doc, updateDoc } = await import('firebase/firestore')
      await updateDoc(doc(db, 'seasons', props.seasonId), { onboardingCreatorDone: true })
    } else {
      // Fallback localStorage si pas d'ID
      localStorage.setItem('dismissCreatorOnboarding', '1')
    }
  } catch {}
  dismissedShare.value = true
  showModal.value = false
  emit('dismissed')
}
</script>


