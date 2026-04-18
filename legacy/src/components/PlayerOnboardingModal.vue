<template>
  <div v-if="isActive && showModal" class="fixed inset-0 z-[1110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="w-full max-w-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl text-center">
      <div class="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
        <span class="text-3xl">🧑‍🎤</span>
      </div>
      <h2 class="text-2xl md:text-3xl font-bold text-white mb-3">{{ titleText }}</h2>
      <p class="text-gray-300 mb-6">{{ subtitleText }}</p>

      <div class="flex flex-col gap-3">
        <template v-if="step === 1">
          <button @click="handleAddSelf" class="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all">➕ Ajouter mon nom</button>
          <button @click="nextStep" class="px-5 py-3 bg-transparent text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 transition-all">Passer</button>
        </template>
        <template v-else-if="step === 2">
          <button @click="handleFocusAvailability" class="px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all">✅ Indiquer mes disponibilités</button>
          <button @click="nextStep" class="px-5 py-3 bg-transparent text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 transition-all">J'ai fait / Passer</button>
        </template>
        <template v-else-if="step === 3">
          <button @click="handleOpenProtection" class="px-5 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all">🔒 Protéger mon compte</button>
          <div class="flex gap-3 justify-center">
            <button @click="finish" class="px-5 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all">Terminer</button>
            <button @click="skipAll" class="px-5 py-3 bg-transparent text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 transition-all">Ignorer</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  seasonId: { type: String, default: '' },
  playersCount: { type: Number, default: 0 },
  eventsCount: { type: Number, default: 0 },
  creatorOnboardingDone: { type: Boolean, default: false }
})

const emit = defineEmits(['add-self', 'focus-availability', 'open-protection', 'done'])

const step = ref(1)

// Afficher uniquement si: onboarding créateur OK, 1 event et 1 joueur, et pas déjà terminé localement
const isActive = computed(() => {
  if (!props.creatorOnboardingDone) return false
  if (props.eventsCount === 0 || props.playersCount === 0) return false
  try { if (props.seasonId && localStorage.getItem(`playerTourDone:${props.seasonId}`)) return false } catch {}
  return true
})

const showModal = ref(isActive.value)
watch(isActive, (v) => { showModal.value = v })

const titleText = computed(() => {
  switch (step.value) {
    case 1: return 'Bienvenue !'
    case 2: return 'Indiquez vos disponibilités'
    case 3: return 'Sécurisez votre profil'
    default: return ''
  }
})

const subtitleText = computed(() => {
  switch (step.value) {
    case 1: return 'Ajoutez votre nom à la saison pour apparaître dans la grille.'
    case 2: return 'Cliquez dans la cellule pour vous déclarer disponible ou non.'
    case 3: return 'Protégez vos actions sensibles avec un mot de passe.'
    default: return ''
  }
})

function nextStep() { step.value = Math.min(3, step.value + 1) }

function handleAddSelf() {
  emit('add-self')
  nextStep()
}
function handleFocusAvailability() {
  emit('focus-availability')
}
function handleOpenProtection() {
  emit('open-protection')
}

function markDone() {
  try { if (props.seasonId) localStorage.setItem(`playerTourDone:${props.seasonId}`, '1') } catch {}
}
function finish() {
  markDone()
  showModal.value = false
  emit('done')
}
function skipAll() {
  markDone()
  showModal.value = false
  emit('done')
}
</script>


