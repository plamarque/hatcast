<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1400] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-6 rounded-2xl shadow-2xl w-full max-w-2xl">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-white">🧪 Test des rappels automatiques</h2>
        <button @click="close" class="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
      </div>
      
      <div class="space-y-6">
        <!-- Informations sur l'événement -->
        <div class="p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 class="text-lg font-semibold text-white mb-3">Événement de test</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-400">Titre :</span>
              <span class="text-white ml-2">{{ testEvent.title }}</span>
            </div>
            <div>
              <span class="text-gray-400">Date :</span>
              <span class="text-white ml-2">{{ formatDate(testEvent.date) }}</span>
            </div>
            <div>
              <span class="text-gray-400">Joueurs :</span>
              <span class="text-white ml-2">{{ testEvent.playerCount }}</span>
            </div>
            <div>
              <span class="text-gray-400">Saison :</span>
              <span class="text-white ml-2">{{ seasonSlug }}</span>
            </div>
          </div>
        </div>
        
        <!-- Configuration des rappels -->
        <div class="p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 class="text-lg font-semibold text-white mb-3">Configuration des rappels</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="reminder7Days" class="w-4 h-4">
                <span class="text-white">Rappel 7 jours avant</span>
              </label>
              <span class="text-sm text-gray-400">{{ formatDate(computedDates.reminder7DaysDate) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="reminder1Day" class="w-4 h-4">
                <span class="text-white">Rappel 1 jour avant</span>
              </label>
              <span class="text-sm text-gray-400">{{ formatDate(computedDates.reminder1DayDate) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Actions de test -->
        <div class="p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 class="text-lg font-semibold text-white mb-3">Actions de test</h3>
          <div class="space-y-3">
            <button 
              @click="createTestReminders" 
              :disabled="testLoading"
              class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
            >
              {{ testLoading ? '⏳ Création...' : '🚀 Créer les rappels de test' }}
            </button>
            
            <button 
              @click="checkReminders" 
              :disabled="checkLoading"
              class="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50"
            >
              {{ checkLoading ? '⏳ Vérification...' : '🔍 Vérifier les rappels existants' }}
            </button>
            
            <button 
              @click="clearTestReminders" 
              :disabled="clearLoading"
              class="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50"
            >
              {{ clearLoading ? '⏳ Suppression...' : '🗑️ Supprimer tous les rappels de test' }}
            </button>
          </div>
        </div>
        
        <!-- Résultats -->
        <div v-if="testResults.length > 0" class="p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 class="text-lg font-semibold text-white mb-3">Résultats des tests</h3>
          <div class="space-y-2 max-h-40 overflow-y-auto">
            <div 
              v-for="result in testResults" 
              :key="result.id"
              class="p-2 rounded text-sm"
              :class="{
                'bg-green-500/20 text-green-300': result.success,
                'bg-red-500/20 text-red-300': !result.success
              }"
            >
              <span class="font-mono">{{ result.timestamp }}</span>
              <span class="ml-2">{{ result.message }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-6 flex justify-end">
        <button @click="close" class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800">
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { createRemindersForSelection, removeRemindersForEvent } from '../services/reminderService.js'
import firestoreService from '../services/firestoreService.js'

const props = defineProps({
  show: { type: Boolean, default: false },
  seasonId: { type: String, default: '' },
  seasonSlug: { type: String, default: '' }
})

const emit = defineEmits(['close'])

// État local
const testLoading = ref(false)
const checkLoading = ref(false)
const clearLoading = ref(false)
const testResults = ref([])

// Configuration de test
const testEvent = ref({
  id: 'test-event',
  title: 'Événement de test - Rappels automatiques',
  date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 jours dans le futur
  playerCount: 6
})

// Variables réactives pour les checkboxes
const reminder7Days = ref(true)
const reminder1Day = ref(true)

// Dates calculées pour les rappels
const computedDates = computed(() => {
  const eventDate = new Date(testEvent.value.date)
  const reminder7DaysDate = new Date(eventDate)
  reminder7DaysDate.setDate(eventDate.getDate() - 7)
  
  const reminder1DayDate = new Date(eventDate)
  reminder1DayDate.setDate(eventDate.getDate() - 1)
  
  return {
    reminder7DaysDate,
    reminder1DayDate
  }
})

// Fonctions
function close() {
  emit('close')
}

function addResult(message, success = true) {
  const timestamp = new Date().toLocaleTimeString('fr-FR')
  testResults.value.unshift({
    id: Date.now(),
    timestamp,
    message,
    success
  })
  
  // Garder seulement les 10 derniers résultats
  if (testResults.value.length > 10) {
    testResults.value = testResults.value.slice(0, 10)
  }
}

async function createTestReminders() {
  if (!props.seasonId) {
    addResult('Erreur : ID de saison manquant', false)
    return
  }
  
  testLoading.value = true
  
  try {
    // Créer des rappels pour un joueur de test
    const result = await createRemindersForSelection({
      seasonId: props.seasonId,
      eventId: testEvent.value.id,
      playerEmail: 'test@hatcast.app',
      playerName: 'Joueur de test',
      eventTitle: testEvent.value.title,
      eventDate: testEvent.value.date,
      seasonSlug: props.seasonSlug
    })
    
    if (result.success) {
      addResult(`✅ Rappels créés avec succès : ${result.results.length} rappels`)
      result.results.forEach(r => {
        if (r.success) {
          addResult(`  - ${r.type} : ${r.id}`)
        } else {
          addResult(`  - ${r.type} : erreur - ${r.error}`, false)
        }
      })
    } else {
      addResult('❌ Erreur lors de la création des rappels', false)
    }
    
  } catch (error) {
    console.error('Erreur lors de la création des rappels de test:', error)
    addResult(`❌ Erreur : ${error.message}`, false)
  } finally {
    testLoading.value = false
  }
}

async function checkReminders() {
  if (!props.seasonId) {
    addResult('Erreur : ID de saison manquant', false)
    return
  }
  
  checkLoading.value = true
  
  try {
    // Vérifier les rappels existants pour cet événement
    const reminders = await firestoreService.queryDocuments('reminderQueue', [
      firestoreService.where('seasonId', '==', props.seasonId),
      firestoreService.where('eventId', '==', testEvent.value.id)
    ])
    
    if (reminders.length === 0) {
      addResult('ℹ️ Aucun rappel trouvé pour cet événement de test')
    } else {
      addResult(`✅ ${reminders.length} rappel(s) trouvé(s) :`)
      reminders.forEach(reminder => {
        const status = reminder.status || 'pending'
        const scheduledFor = reminder.scheduledFor?.toDate?.() || reminder.scheduledFor
        const dateStr = scheduledFor ? scheduledFor.toLocaleDateString('fr-FR') : 'date inconnue'
        addResult(`  - ${reminder.type} (${status}) : ${dateStr}`)
      })
    }
    
  } catch (error) {
    console.error('Erreur lors de la vérification des rappels:', error)
    addResult(`❌ Erreur : ${error.message}`, false)
  } finally {
    checkLoading.value = false
  }
}

async function clearTestReminders() {
  if (!props.seasonId) {
    addResult('Erreur : ID de saison manquant', false)
    return
  }
  
  clearLoading.value = true
  
  try {
    const result = await removeRemindersForEvent({
      seasonId: props.seasonId,
      eventId: testEvent.value.id
    })
    
    if (result.success) {
      addResult(`✅ ${result.deletedCount} rappel(s) supprimé(s)`)
    } else {
      addResult('❌ Erreur lors de la suppression des rappels', false)
    }
    
  } catch (error) {
    console.error('Erreur lors de la suppression des rappels de test:', error)
    addResult(`❌ Erreur : ${error.message}`, false)
  } finally {
    clearLoading.value = false
  }
}

function formatDate(date) {
  if (!date) return 'Date inconnue'
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Réinitialiser les résultats quand la modal s'ouvre
watch(() => props.show, (newValue) => {
  if (newValue) {
    testResults.value = []
  }
})
</script>
