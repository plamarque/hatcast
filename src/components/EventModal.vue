<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <!-- Header -->
      <h2 class="text-2xl font-bold mb-6 text-white text-center">
        {{ mode === 'create' ? '✨ Nouveau spectacle' : '✏️ Modifier le spectacle' }}
      </h2>

      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit">
        <!-- Titre -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">Titre</label>
          <input
            v-model="formData.title"
            type="text"
            class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
            placeholder="Titre du spectacle"
            @keydown.esc="handleCancel"
            @keydown.enter="handleSubmit"
            ref="titleInput"
            required
          >
        </div>

        <!-- Date -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">Date</label>
          <input
            v-model="formData.date"
            type="date"
            class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
            @keydown.esc="handleCancel"
            @keydown.enter="handleSubmit"
            required
          >
        </div>

        <!-- Description -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            v-model="formData.description"
            class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
            rows="3"
            placeholder="Description du spectacle (optionnel)"
            @keydown.esc="handleCancel"
          ></textarea>
        </div>

        <!-- Archivé -->
        <div class="mb-6 flex items-center gap-3">
          <input 
            :id="`${mode}-archived`" 
            type="checkbox" 
            v-model="formData.archived" 
            class="w-4 h-4" 
          />
          <label :for="`${mode}-archived`" class="text-sm font-medium text-gray-300">
            {{ mode === 'create' ? 'Créer comme archivé' : 'Archiver ce spectacle' }}
          </label>
        </div>

        <!-- Section Équipe -->
        <div class="mb-6">
          <!-- Sélecteur de type d'événement avec nombre de personnes -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-2">Type d'événement</label>
            <div class="flex items-center justify-between">
              <select
                v-model="selectedRoleTemplate"
                @change="applyRoleTemplate(selectedRoleTemplate)"
                :disabled="mode === 'edit' && !showRoleInputs"
                class="w-36 p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option
                  v-for="templateId in TEMPLATE_DISPLAY_ORDER"
                  :key="templateId"
                  :value="templateId"
                >
                  {{ ROLE_TEMPLATES[templateId].name }}
                </option>
              </select>
              <div class="inline-flex items-center gap-2 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg">
                <span class="text-gray-300">👥</span>
                <span class="text-sm text-gray-200 font-medium">{{ totalTeamSize }} personnes</span>
              </div>
            </div>
          </div>
          
          <!-- Affichage permanent des rôles attendus (filtrés) -->
          <div class="mb-4" v-if="isRoleDataReady">
            <div class="text-sm text-gray-200 leading-relaxed flex flex-wrap gap-2 mb-3">
              <span v-for="role in displayRoles" :key="role.name" class="inline-flex items-center gap-1">
                <span class="text-gray-400">{{ role.label }}:</span>
                <span class="font-medium" :class="role.color">{{ role.count }}</span>
              </span>
            </div>
            <div class="text-center" v-if="!showRoleInputs">
              <button
                @click="showRoleInputs = true"
                type="button"
                class="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors flex items-center gap-1 mx-auto"
              >
                <span>✏️</span>
                <span>Personnaliser</span>
              </button>
            </div>
          </div>
          
          <!-- Champs de saisie des rôles (révélés sur demande) -->
          <div v-if="showRoleInputs && isRoleDataReady" class="mb-4">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium text-gray-300">Personnalisation des rôles :</span>
              <button
                @click="showRoleInputs = false"
                type="button"
                class="text-gray-400 hover:text-gray-300 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span>👁️</span>
                <span>Voir résumé</span>
              </button>
            </div>
            
            <!-- Rôles principaux (disposition horizontale compacte) -->
            <div class="grid grid-cols-2 gap-3 mb-3">
              <div v-for="roleName in visibleRoles" :key="roleName" class="flex items-center gap-2">
                <span class="text-lg">{{ safeRoleEmojis[roleName] }}</span>
                <span class="text-sm text-gray-300 flex-1">{{ safeRoleLabels[roleName] }}</span>
                <input
                  v-model="formData.roles[roleName]"
                  type="number"
                  min="0"
                  max="20"
                  class="w-16 p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-center"
                  @keydown.esc="handleCancel"
                >
              </div>
            </div>
            
            <!-- Rôles supplémentaires (disposition horizontale compacte) -->
            <div v-if="showAllRoles" class="grid grid-cols-2 gap-3 mb-3">
              <div v-for="roleName in hiddenRoles" :key="roleName" class="flex items-center gap-2">
                <span class="text-lg">{{ safeRoleEmojis[roleName] }}</span>
                <span class="text-sm text-gray-300 flex-1">{{ safeRoleLabels[roleName] }}</span>
                <input
                  v-model="formData.roles[roleName]"
                  type="number"
                  min="0"
                  max="20"
                  class="w-16 p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-center"
                  @keydown.esc="handleCancel"
                >
              </div>
            </div>
            
            <!-- Bouton "Plus de rôles" -->
            <div v-if="!showAllRoles && hiddenRoles.length > 0" class="text-center">
              <button
                @click="showAllRoles = true"
                type="button"
                class="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
              >
                Plus de rôles...
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <button
            @click="handleCancel"
            type="button"
            class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
          >
            {{ mode === 'create' ? 'Créer' : 'Sauvegarder' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { 
  ROLES, 
  ROLE_EMOJIS, 
  ROLE_LABELS, 
  ROLE_DISPLAY_ORDER, 
  ROLE_TEMPLATES, 
  TEMPLATE_DISPLAY_ORDER 
} from '../services/storage.js'

// Props
const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: (value) => ['create', 'edit'].includes(value)
  },
  isVisible: {
    type: Boolean,
    default: false
  },
  eventData: {
    type: Object,
    default: null
  }
})

// Événements
const emit = defineEmits(['save', 'cancel'])

// Références
const titleInput = ref(null)

// État local
const selectedRoleTemplate = ref('cabaret')
const showRoleInputs = ref(false)
const showAllRoles = ref(false)

// Données du formulaire
const formData = ref({
  title: '',
  date: '',
  description: '',
  archived: false,
  roles: {
    [ROLES.PLAYER]: 6,
    [ROLES.DJ]: 1,
    [ROLES.MC]: 1,
    [ROLES.VOLUNTEER]: 5,
    [ROLES.REFEREE]: 1,
    [ROLES.ASSISTANT_REFEREE]: 2,
    [ROLES.LIGHTING]: 0,
    [ROLES.COACH]: 0,
    [ROLES.STAGE_MANAGER]: 1
  }
})

// Computed properties
const safeRoleDisplayOrder = computed(() => {
  return ROLE_DISPLAY_ORDER || []
})

const safeRoleLabels = computed(() => {
  return ROLE_LABELS || {}
})

const safeRoleEmojis = computed(() => {
  return ROLE_EMOJIS || {}
})

const visibleRoles = computed(() => {
  return safeRoleDisplayOrder.value.slice(0, 4) // Premiers 4 rôles (2 lignes de 2)
})

const hiddenRoles = computed(() => {
  return safeRoleDisplayOrder.value.slice(4) // Rôles restants
})

const totalTeamSize = computed(() => {
  return Object.values(formData.value.roles).reduce((sum, count) => sum + count, 0)
})

const isRoleDataReady = computed(() => {
  const ready = safeRoleDisplayOrder.value.length > 0 && 
                Object.keys(safeRoleLabels.value).length > 0
  
  if (!ready) {
    console.log('🔍 Rôles non prêts:', {
      safeRoleDisplayOrder: safeRoleDisplayOrder.value,
      safeRoleLabels: safeRoleLabels.value,
      roles: formData.value.roles
    })
  }
  
  return ready
})

// Computed property pour les rôles affichés (filtrés et avec labels)
const displayRoles = computed(() => {
  if (!isRoleDataReady.value) return []
  
  return safeRoleDisplayOrder.value
    .filter(roleName => formData.value.roles[roleName] > 0)
    .map(roleName => ({
      name: roleName,
      label: safeRoleLabels.value[roleName] || roleName,
      count: formData.value.roles[roleName],
      color: getRoleCountColor(formData.value.roles[roleName])
    }))
})

// Fonctions
function applyRoleTemplate(templateId) {
  selectedRoleTemplate.value = templateId
  const template = ROLE_TEMPLATES[templateId]
  
  // Appliquer les rôles du type
  Object.keys(formData.value.roles).forEach(role => {
    formData.value.roles[role] = template.roles[role] || 0
  })
}

function determineRoleTemplate(roles) {
  if (!roles) return 'custom'
  
  // Comparer avec chaque template
  for (const [templateId, template] of Object.entries(ROLE_TEMPLATES)) {
    if (templateId === 'custom') continue
    
    let matches = true
    for (const [role, count] of Object.entries(template.roles)) {
      if (roles[role] !== count) {
        matches = false
        break
      }
    }
    
    if (matches) return templateId
  }
  
  return 'custom'
}

function getRoleCountColor(count) {
  if (count === 0) return 'text-blue-500' // Bleu pour 0
  if (count === 1) return 'text-purple-500' // Violet pour 1
  if (count === 2) return 'text-orange-500' // Orange pour 2
  if (count === 6) return 'text-cyan-400' // Cyan pour 6
  if (count === 15) return 'text-orange-500' // Orange pour 15
  if (count >= 10) return 'text-green-500' // Vert pour les grands effectifs
  if (count >= 5) return 'text-blue-400' // Bleu clair pour les effectifs moyens
  return 'text-pink-500' // Rose pour les autres
}

function handleSubmit() {
  if (!formData.value.title.trim() || !formData.value.date) return
  
  emit('save', {
    ...formData.value,
    roles: { ...formData.value.roles }
  })
}

function handleCancel() {
  emit('cancel')
}

// Watchers
watch(() => props.isVisible, (visible) => {
  if (visible) {
    // Réinitialiser le formulaire si on est en mode création
    if (props.mode === 'create') {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowFormatted = tomorrow.toISOString().split('T')[0] // Format YYYY-MM-DD
      formData.value = {
        title: '',
        date: tomorrowFormatted,
        description: '',
        archived: false,
        roles: {
          [ROLES.PLAYER]: 6,
          [ROLES.DJ]: 1,
          [ROLES.MC]: 1,
          [ROLES.VOLUNTEER]: 5,
          [ROLES.REFEREE]: 1,
          [ROLES.ASSISTANT_REFEREE]: 2,
          [ROLES.LIGHTING]: 0,
          [ROLES.COACH]: 0,
          [ROLES.STAGE_MANAGER]: 1
        }
      }
      
      // Réinitialiser le template de rôles
      selectedRoleTemplate.value = 'cabaret'
      
      // Réinitialiser l'affichage des rôles
      showRoleInputs.value = false
      showAllRoles.value = false
    }
    
    nextTick(() => {
      titleInput.value?.focus()
    })
  }
})

watch(() => props.eventData, (data) => {
  if (data && props.mode === 'edit') {
    // Initialiser le formulaire avec les données existantes
    formData.value = {
      title: data.title || '',
      date: data.date || '',
      description: data.description || '',
      archived: data.archived || false,
      roles: { ...data.roles } || {}
    }
    
    // Déterminer le template de rôles
    const templateId = determineRoleTemplate(data.roles)
    selectedRoleTemplate.value = templateId
    
    // Réinitialiser l'affichage des rôles
    showRoleInputs.value = false
    showAllRoles.value = false
  }
}, { immediate: true })

// Initialisation
onMounted(() => {
  if (props.mode === 'create') {
    nextTick(() => {
      applyRoleTemplate('cabaret')
    })
  }
})
</script>
