<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4" @click="close">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-6 rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-indigo-400 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">👤</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-1">Mon compte</h2>
        <p class="text-sm text-gray-300">Gérez votre compte et vos joueurs associés</p>
      </div>

      <div class="space-y-3">
        <div class="p-3 rounded-lg border border-white/10 bg-white/5 text-sm text-gray-300">
          <div class="flex items-center justify-between">
            <span class="text-gray-400">Email</span>
            <span class="text-white">{{ email || 'Non défini' }}</span>
          </div>
        </div>

        <div>
          <h3 class="text-white font-semibold mb-2">Mes joueurs associés</h3>
          <div v-if="associations.length === 0" class="text-sm text-gray-400">Aucun joueur associé pour le moment.</div>
          <ul v-else class="space-y-2">
            <li v-for="assoc in associations" :key="assocKey(assoc)" class="p-3 rounded-lg border border-white/10 bg-white/5 text-sm text-gray-300">
              <div class="flex items-center justify-between gap-3">
                <div class="truncate">
                  <div class="text-white">{{ assoc.playerName || assoc.playerId }}</div>
                  <div class="text-gray-400 text-xs">Saison: {{ assoc.seasonName || assoc.seasonId || '—' }}</div>
                </div>
                <button @click="$emit('manage-player', assoc)" class="px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 text-xs">Gérer</button>
              </div>
            </li>
          </ul>
        </div>

        <div class="border-t border-white/10 pt-3 mt-2 flex flex-col gap-2">
          <button @click="$emit('change-password')" class="w-full px-4 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500">Changer mon mot de passe</button>
          <button @click="$emit('logout-device')" class="w-full px-4 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600">Déconnexion de cet appareil</button>
          <button @click="$emit('delete-account')" class="w-full px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-500">Supprimer mon compte</button>
        </div>
      </div>

      <div class="mt-6 text-center">
        <button @click="close" class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { auth } from '../services/firebase.js'
import { listAssociationsForEmail } from '../services/playerProtection.js'

const props = defineProps({
  show: { type: Boolean, default: false },
  seasonId: { type: String, default: null }
})

const emit = defineEmits(['close', 'manage-player', 'change-password', 'logout-device', 'delete-account'])

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
    associations.value = email.value ? await listAssociationsForEmail(email.value) : []
  } catch {
    associations.value = []
  }
}

function close() { emit('close') }

watch(() => props.show, (v) => { if (v) loadData() })
onMounted(() => { if (props.show) loadData() })
</script>


