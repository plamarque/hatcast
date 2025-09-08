<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1370] p-4" @click="close">
    <div class="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-6 rounded-2xl shadow-2xl w-full max-w-xl" @click.stop>
      <button @click="close" class="absolute right-3 top-3 text-white/80 hover:text-white" aria-label="Fermer" title="Fermer">✖️</button>
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-indigo-400 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">👥</span>
        </div>
              <h2 class="text-2xl font-bold text-white mb-1">Mes personnes</h2>
      <p class="text-sm text-gray-300">Gérez vos associations de personnes</p>
      </div>

      <div class="space-y-3">
        <h3 class="text-white font-semibold mb-2">Mes personnes associées</h3>
        <div v-if="associations.length === 0" class="text-sm text-gray-400">Aucune personne associée pour le moment.</div>
        <ul v-else class="space-y-2">
          <li v-for="assoc in associations" :key="assocKey(assoc)" class="p-3 rounded-lg border border-white/10 bg-white/5 text-sm text-gray-300">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <!-- Avatar du joueur -->
                <div class="flex-shrink-0">
                  <PlayerAvatar 
                    :player-id="assoc.playerId"
                    :season-id="assoc.seasonId"
                    :player-name="assoc.playerName"
                    size="md"
                  />
                </div>
                <!-- Informations du joueur -->
                <div class="truncate">
                  <div class="text-white font-semibold">{{ assoc.seasonName || assoc.seasonId || '—' }}</div>
                  <div class="text-gray-400 text-xs">Personne : {{ assoc.playerName || '—' }}</div>
                </div>
              </div>
              <button @click="managePlayer(assoc)" class="px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 text-xs flex-shrink-0">Gérer</button>
            </div>
          </li>
        </ul>
      </div>

      <div class="mt-6 text-center">
        <button @click="close" class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { auth, db } from '../services/firebase.js'
import { doc, getDoc } from 'firebase/firestore'
import { listAssociationsForEmail } from '../services/playerProtection.js'
import PlayerAvatar from './PlayerAvatar.vue'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'manage-player'])

const email = ref('')
const associations = ref([])

function assocKey(a) {
  return `${a.seasonId || 'global'}__${a.playerId}`
}

async function loadData() {
  try {
    email.value = auth?.currentUser?.email || ''
  } catch {}
  try {
    const raw = email.value ? await listAssociationsForEmail(email.value) : []
    // Enrichir avec le nom réel du joueur depuis la saison
    const enriched = []
    for (const a of raw) {
      let playerName = a.playerId
      try {
        if (a.seasonId) {
          const playerRef = doc(db, 'seasons', a.seasonId, 'players', a.playerId)
          const snap = await getDoc(playerRef)
          if (snap.exists()) playerName = snap.data().name || playerName
        }
      } catch {}
      enriched.push({ ...a, playerName })
    }
    associations.value = enriched
  } catch {
    associations.value = []
  }
}

function managePlayer(assoc) {
  emit('manage-player', assoc)
  close()
}

function close() { emit('close') }

watch(() => props.show, (v) => { if (v) { loadData() } })
onMounted(() => { if (props.show) { loadData() } })
</script>
