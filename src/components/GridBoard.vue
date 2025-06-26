<template>
  <table class="table-auto border-collapse border border-gray-400 w-full">
    <thead>
      <tr class="bg-gray-100 text-gray-800 text-sm uppercase tracking-wider">
        <th class="p-3 text-left">Nom</th>
        <th class="p-3 text-center text-sm text-gray-700">📊 Stats</th>
        <th
          v-for="event in events"
          :key="event.id"
          class="p-3 text-center w-48 align-top"
        >
          <div class="flex flex-col items-center space-y-1">
            <div class="font-semibold text-base text-center whitespace-pre-wrap">
              {{ event.title }}
            </div>
            <div class="text-xs text-gray-500">
              {{ formatDate(event.date) }}
            </div>
            <button
              @click="tirer(event.id, 6)" 
              class="mt-1 px-2 py-1 rounded-md text-sm bg-white hover:bg-gray-50 border shadow text-gray-800"
            >
              🎭 Sélectionner
            </button>
          </div>
        </th>
        <th class="p-3 text-center text-gray-500">➕</th>
      </tr>
    </thead>

    <tbody>
      <tr
        v-for="player in players"
        :key="player.id"
        class="odd:bg-white even:bg-gray-50 border-b"
      >
        <td class="p-3 font-medium text-gray-900">{{ player.name }}</td>
        <td class="p-3 text-center text-gray-700 text-sm">
          <span :title="`${countSelections(player.name)} sélection${countSelections(player.name) > 1 ? 's' : ''}, ${countAvailability(player.name)} dispo${countAvailability(player.name) > 1 ? 's' : ''}`">
            {{ countSelections(player.name) }}/{{ countAvailability(player.name) }}
          </span>
        </td>
        <td
          v-for="event in events"
          :key="event.id"
          class="p-3 text-center cursor-pointer hover:bg-blue-100"
          @click="toggleAvailability(player.name, event.id)"
        >
          <span
            v-if="isSelected(player.name, event.id)"
            :title="getTooltipText(player, event.id)"
          >
            🎭
          </span>
          <span
            v-else-if="isAvailable(player.name, event.id)"
            :title="getTooltipText(player, event.id)"
          >
            ✅
          </span>
          <span
            v-else-if="isAvailable(player.name, event.id) === false"
            :title="getTooltipText(player, event.id)"
          >
            ❌
          </span>
          <span
            v-else
            :title="getTooltipText(player, event.id)"
          >
            –
          </span>
        </td>
        <td class="p-3 text-center">
          <!-- bouton de suppression -->
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineOptions({
  name: 'GridBoard'
})  
import { ref, onMounted } from 'vue'
import {
  setStorageMode,
  loadEvents,
  loadPlayers,
  loadAvailability,
  loadSelections,
  saveAvailability,
  saveSelection
} from '../services/storage.js'

const events = ref([])
const players = ref([])
const availability = ref({})
const selections = ref({})
const stats = ref({})
const chances = ref({})

onMounted(async () => {
  const useFirebase = true
  setStorageMode(useFirebase ? 'firebase' : 'mock')

  events.value = await loadEvents()
  const rawPlayers = await loadPlayers()

  // ✅ Filtrer les doublons par name
  const seen = {}
  rawPlayers.forEach(p => {
    if (!seen[p.name]) seen[p.name] = p
  })
  players.value = Object.values(seen)

  console.log('players (deduplicated):', players.value.map(p => ({ id: p.id, name: p.name })))

  availability.value = await loadAvailability(players.value, events.value)
  selections.value = await loadSelections()
  updateAllStats()
  updateAllChances()
})

function toggleAvailability(player, eventId) {
  availability.value[player] = availability.value[player] || {}

  const current = availability.value[player][eventId]
  let next

  if (current === undefined) next = true
  else if (current === true) next = false
  else next = undefined

  availability.value[player][eventId] = next

  saveAvailability(player, availability.value[player])
  updateStatsForPlayer(player)
  updateAllChances()
}

function isAvailable(player, eventId) {
  return availability.value[player]?.[eventId]
}

function isSelected(player, eventId) {
  const selected = selections.value[eventId] || []
  const avail = availability.value[player]?.[eventId]
  return selected.includes(player) && avail === true
}

async function tirer(eventId, count = 6) {
  const candidates = players.value.filter(p => isAvailable(p.name, eventId))

  // Tirage pondéré : moins sélectionné = plus de chances
  const weightedCandidates = candidates.map(player => {
    const s = countSelections(player.name)
    return {
      name: player.name,
      weight: 1 / (1 + s) // poids inverse du nombre de sélections
    }
  })

  const tirage = []
  const pool = [...weightedCandidates]

  while (tirage.length < count && pool.length > 0) {
    const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0)
    let r = Math.random() * totalWeight

    const chosenIndex = pool.findIndex(p => {
      r -= p.weight
      return r <= 0
    })

    if (chosenIndex >= 0) {
      tirage.push(pool[chosenIndex].name)
      pool.splice(chosenIndex, 1)
    }
  }

  selections.value[eventId] = tirage

  await saveSelection(eventId, tirage)
  updateAllStats()
  updateAllChances()
}

function formatDate(dateValue) {
  if (!dateValue) return ''
  const date = typeof dateValue === 'string'
    ? new Date(dateValue)
    : dateValue.toDate?.() || dateValue
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function countSelections(player) {
  return Object.values(selections.value).filter(sel => sel.includes(player)).length
}

function countAvailability(player) {
  const eventsMap = availability.value[player] || {}
  return Object.values(eventsMap).filter(v => v === true).length
}

function ratioSelection(player) {
  const avail = countAvailability(player)
  const sel = countSelections(player)
  return avail === 0 ? 0 : sel / avail
}

function updateStatsForPlayer(player) {
  stats.value[player] = {
    availability: countAvailability(player),
    selection: countSelections(player),
    ratio: ratioSelection(player)
  }
}

function updateAllStats() {
  players.value.forEach(player => updateStatsForPlayer(player.name))
}

function chanceToBeSelected(playerName, eventId, count = 6) {
  const availablePlayers = players.value.filter(p => isAvailable(p.name, eventId) === true)

  if (!availablePlayers.find(p => p.name === playerName)) return 0

  // Calcul du poids basé sur le nombre de sélections déjà faites
  const weights = availablePlayers.map(p => {
    const pastSelections = countSelections(p.name)
    return {
      name: p.name,
      weight: 1 / (1 + pastSelections)
    }
  })

  const totalWeight = weights.reduce((sum, p) => sum + p.weight, 0)
  const playerWeight = weights.find(p => p.name === playerName)?.weight || 0

  const chance = Math.min(1, (playerWeight / totalWeight) * count)
  return Math.round(chance * 100)
}

function updateAllChances(count = 6) {
  const chanceMap = {}
  events.value.forEach(event => {
    const availablePlayers = players.value.filter(p => isAvailable(p.name, event.id) === true)
    const weights = availablePlayers.map(p => {
      const pastSelections = countSelections(p.name)
      return {
        name: p.name,
        weight: 1 / (1 + pastSelections)
      }
    })
    const totalWeight = weights.reduce((sum, p) => sum + p.weight, 0)

    weights.forEach(p => {
      const chance = Math.min(1, (p.weight / totalWeight) * count)
      if (!chanceMap[p.name]) chanceMap[p.name] = {}
      chanceMap[p.name][event.id] = Math.round(chance * 100)
    })
  })

  chances.value = chanceMap
}

function getTooltipText(player, eventId) {
  const name = player.name
  const avail = isAvailable(name, eventId)
  const selected = isSelected(name, eventId)
  const chance = chances.value?.[name]?.[eventId] ?? 0

  if (avail === false) {
    return 'Non disponible – cliquez pour changer'
  }

  if (selected) {
    return `Sélectionné · Chance estimée : ${chance}%`
  }

  if (avail === true) {
    return `Disponible · Chance estimée : ${chance}%`
  }

  return 'Cliquez pour indiquer votre disponibilité'
}

</script>
