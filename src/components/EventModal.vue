<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1370] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
      <!-- Header fixe -->
      <div class="p-6 pb-4 border-b border-gray-700/50">
        <h2 class="text-2xl font-bold text-white text-center">
          {{ mode === 'create' ? '✨ Nouvel événement' : '✏️ Modifier l\'événement' }}
        </h2>
      </div>

      <!-- Contenu scrollable -->
      <div class="flex-1 overflow-y-auto p-6 pt-4">
        <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Titre et Date sur une seule ligne -->
        <div>
          <div class="grid grid-cols-3 gap-4">
            <!-- Titre (prend 2/3 de l'espace) -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-300 mb-2">Titre</label>
              <input
                v-model="formData.title"
                type="text"
                class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="Titre de l'événement"
                @keydown.esc="handleCancel"
                @keydown.enter="handleSubmit"
                ref="titleInput"
                required
              >
            </div>
            
            <!-- Date (prend 1/3 de l'espace) -->
            <div class="col-span-1">
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
          </div>
        </div>

        <!-- Section Type d'événement -->
        <div>
          <!-- Sélecteur de type d'événement avec nombre de personnes -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-2">Type d'événement</label>
            <div class="flex items-center justify-between">
              <select
                v-model="selectedRoleTemplate"
                @change="applyRoleTemplate(selectedRoleTemplate)"
                class="w-52 p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
              >
                <option
                  v-for="templateId in TEMPLATE_DISPLAY_ORDER"
                  :key="templateId"
                  :value="templateId"
                >
                  {{ EVENT_TYPE_ICONS[templateId] }} {{ ROLE_TEMPLATES[templateId].name }}
                </option>
              </select>
              <div class="inline-flex items-center gap-2 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg">
                <span class="text-gray-300">👥</span>
                <span class="text-sm text-gray-200 font-medium">
                  {{ totalTeamSize }} <span class="hidden md:inline">personnes</span><span class="md:hidden">pers.</span>
                </span>
              </div>
            </div>
          </div>
          
          <!-- Confirmation de changement de template -->
          <div v-if="showTemplateChangeConfirmation" class="mb-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <div class="flex items-start gap-3">
              <div class="text-yellow-400 text-xl">⚠️</div>
              <div class="flex-1">
                <h4 class="text-yellow-300 font-medium mb-2">Changement de type d'événement</h4>
                <p class="text-gray-300 text-sm mb-3">
                  Les rôles actuels ont été personnalisés et diffèrent du template "{{ ROLE_TEMPLATES[pendingTemplateId]?.name }}".
                </p>
                
                <!-- Comparaison des rôles -->
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <!-- Rôles actuels -->
                  <div>
                    <h5 class="text-gray-400 text-xs font-medium mb-2">Configuration actuelle :</h5>
                    <div class="space-y-1">
                      <div v-for="role in getRoleComparison(currentRolesSnapshot)" :key="role.name" class="flex justify-between text-sm">
                        <span class="text-gray-300">{{ role.label }}:</span>
                        <span class="font-medium text-blue-400">{{ role.count }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Nouveaux rôles -->
                  <div>
                    <h5 class="text-gray-400 text-xs font-medium mb-2">Avec le template "{{ ROLE_TEMPLATES[pendingTemplateId]?.name }}" :</h5>
                    <div class="space-y-1">
                      <div v-for="role in getRoleComparison(newRolesSnapshot)" :key="role.name" class="flex justify-between text-sm">
                        <span class="text-gray-300">{{ role.label }}:</span>
                        <span class="font-medium text-green-400">{{ role.count }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Boutons d'action -->
                <div class="flex gap-2">
                  <button
                    @click="confirmTemplateChange"
                    type="button"
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Appliquer
                  </button>
                  <button
                    @click="cancelTemplateChange"
                    type="button"
                    class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Ignorer
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Affichage permanent des rôles attendus (filtrés) -->
          <div class="mb-4" v-if="isRoleDataReady && !showTemplateChangeConfirmation">
            <div class="text-sm text-gray-200 leading-relaxed flex flex-wrap gap-2 mb-3">
              <span v-for="role in displayRoles" :key="role.name" class="inline-flex items-center gap-1">
                <span class="text-gray-400">{{ role.label }}:</span>
                <span class="font-medium" :class="role.color">{{ role.count }}</span>
              </span>
            </div>
            <div class="text-center" v-if="!showRoleInputs">
              <button
                @click="enableCustomization"
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
            
            <!-- Rôles principaux (responsive: 1 colonne mobile, 2 colonnes desktop) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
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
            
            <!-- Rôles supplémentaires (responsive: 1 colonne mobile, 2 colonnes desktop) -->
            <div v-if="showAllRoles" class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
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

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            v-model="formData.description"
            class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
            rows="3"
            placeholder="Description de l'événement (optionnel)"
            @keydown.esc="handleCancel"
          ></textarea>
        </div>

        <!-- Lieu -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">📍 Lieu</label>
          <input
            v-model="formData.location"
            type="text"
            class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
            placeholder="Lieu de l'événement (optionnel)"
            @keydown.esc="handleCancel"
          >
        </div>

        <!-- Archivé -->
        <div class="flex items-center gap-3">
          <input 
            :id="`${mode}-archived`" 
            type="checkbox" 
            v-model="formData.archived" 
            class="w-4 h-4" 
          />
          <label :for="`${mode}-archived`" class="text-sm font-medium text-gray-300">
            {{ mode === 'create' ? 'Créer comme archivé' : 'Archiver cet événement' }}
          </label>
        </div>
        </form>
      </div>

      <!-- Boutons fixes en bas -->
      <div class="p-6 pt-4 border-t border-gray-700/50">
        <div class="flex justify-end space-x-3">
          <button
            @click="handleCancel"
            type="button"
            class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            @click="handleSubmit"
            type="button"
            class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
          >
            {{ mode === 'create' ? 'Créer' : 'Sauvegarder' }}
          </button>
        </div>
      </div>
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
  TEMPLATE_DISPLAY_ORDER,
  EVENT_TYPE_ICONS 
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
const hasBeenCustomized = ref(false) // Track si les rôles ont été personnalisés

// État pour la confirmation de changement de template
const showTemplateChangeConfirmation = ref(false)
const pendingTemplateId = ref(null)
const currentRolesSnapshot = ref({})
const newRolesSnapshot = ref({})

// Données du formulaire
const formData = ref({
  title: '',
  date: '',
  description: '',
  location: '',
  archived: false,
  roles: {
    [ROLES.PLAYER]: 5,
    [ROLES.DJ]: 1,
    [ROLES.MC]: 1,
    [ROLES.VOLUNTEER]: 0,
    [ROLES.REFEREE]: 0,
    [ROLES.ASSISTANT_REFEREE]: 0,
    [ROLES.LIGHTING]: 0,
    [ROLES.COACH]: 0,
    [ROLES.STAGE_MANAGER]: 0
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
function enableCustomization() {
  showRoleInputs.value = true
  hasBeenCustomized.value = true
}

function applyRoleTemplate(templateId) {
  const template = ROLE_TEMPLATES[templateId]
  
  // En mode création, appliquer directement sans confirmation
  if (props.mode === 'create') {
    applyTemplateDirectly(templateId)
    return
  }
  
  // En mode édition, vérifier si les rôles ont été personnalisés
  const previousTemplate = ROLE_TEMPLATES[selectedRoleTemplate.value]
  const hasCustomizations = previousTemplate && Object.keys(previousTemplate.roles).some(role => {
    return formData.value.roles[role] !== (previousTemplate.roles[role] || 0)
  })
  
  // Si les rôles ont été personnalisés (soit explicitement, soit implicitement), afficher la confirmation
  if (hasBeenCustomized.value || hasCustomizations) {
    // Sauvegarder l'état actuel et le nouveau template
    pendingTemplateId.value = templateId
    currentRolesSnapshot.value = { ...formData.value.roles }
    
    // Calculer les nouveaux rôles
    const newRoles = { ...formData.value.roles }
    Object.keys(newRoles).forEach(role => {
      newRoles[role] = template.roles[role] || 0
    })
    newRolesSnapshot.value = newRoles
    
    // Afficher la confirmation
    showTemplateChangeConfirmation.value = true
    return
  }
  
  // Appliquer directement si pas de personnalisation
  applyTemplateDirectly(templateId)
}

function applyTemplateDirectly(templateId) {
  const template = ROLE_TEMPLATES[templateId]
  selectedRoleTemplate.value = templateId
  
  // Créer un nouvel objet pour forcer la réactivité
  const newRoles = { ...formData.value.roles }
  Object.keys(newRoles).forEach(role => {
    newRoles[role] = template.roles[role] || 0
  })
  formData.value.roles = newRoles
  
  // Réinitialiser le flag de personnalisation si on applique un template
  hasBeenCustomized.value = false
  showRoleInputs.value = false
}

function confirmTemplateChange() {
  // Appliquer le template
  applyTemplateDirectly(pendingTemplateId.value)
  
  // Masquer la confirmation
  showTemplateChangeConfirmation.value = false
  pendingTemplateId.value = null
  currentRolesSnapshot.value = {}
  newRolesSnapshot.value = {}
}

function cancelTemplateChange() {
  // Revenir au template précédent
  selectedRoleTemplate.value = selectedRoleTemplate.value
  
  // Masquer la confirmation
  showTemplateChangeConfirmation.value = false
  pendingTemplateId.value = null
  currentRolesSnapshot.value = {}
  newRolesSnapshot.value = {}
}

function getRoleComparison(roles) {
  if (!isRoleDataReady.value) return []
  
  return safeRoleDisplayOrder.value
    .filter(roleName => roles[roleName] > 0)
    .map(roleName => ({
      name: roleName,
      label: safeRoleLabels.value[roleName] || roleName,
      count: roles[roleName]
    }))
}

// Fonction pour déterminer quel type correspond aux rôles actuels
// SUPPRIMÉE : On ne devine plus le type, on utilise le type sauvegardé ou 'autre' comme fallback

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
    roles: { ...formData.value.roles },
    templateType: selectedRoleTemplate.value // Sauvegarder le type de template
  })
}

function handleCancel() {
  // Réinitialiser la confirmation si elle est ouverte
  showTemplateChangeConfirmation.value = false
  pendingTemplateId.value = null
  currentRolesSnapshot.value = {}
  newRolesSnapshot.value = {}
  
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
      
      // Réinitialiser le template de rôles
      selectedRoleTemplate.value = 'cabaret'
      
      // Appliquer le template cabaret par défaut
      const cabaretTemplate = ROLE_TEMPLATES.cabaret
      formData.value = {
        title: '',
        date: tomorrowFormatted,
        description: '',
        archived: false,
        roles: { ...cabaretTemplate.roles }
      }
      
      // Réinitialiser l'affichage des rôles
      showRoleInputs.value = false
      showAllRoles.value = false
      hasBeenCustomized.value = false
    }
    
    nextTick(() => {
      titleInput.value?.focus()
    })
  }
})

watch(() => props.eventData, (data) => {
  if (data && props.mode === 'edit') {
    console.log('🔍 EventModal: Initializing form with event data:', data)
    console.log('🔍 EventModal: Event roles:', data.roles)
    console.log('🔍 EventModal: Event templateType:', data.templateType)
    
    // Initialiser le formulaire avec les données existantes
    formData.value = {
      title: data.title || '',
      date: data.date || '',
      description: data.description || '',
      location: data.location || '',
      archived: data.archived || false,
      roles: { ...data.roles } || {}
    }
    
    console.log('🔍 EventModal: Form data initialized:', formData.value)
    
    // Utiliser le type de template sauvegardé, ou fallback sur 'custom'
    const templateId = data.templateType || 'custom'
    console.log('🔍 EventModal: Using template ID:', templateId, '(saved:', data.templateType, 'fallback: custom)')
    selectedRoleTemplate.value = templateId
    
    console.log('🔍 EventModal: Selected role template set to:', selectedRoleTemplate.value)
    
    // Réinitialiser l'affichage des rôles
    showRoleInputs.value = false
    showAllRoles.value = false
    hasBeenCustomized.value = false
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
