<template>
  <div 
    v-if="show"
    class="px-2 py-1 rounded-md border text-[11px] md:text-xs flex items-center gap-1 transition-colors duration-200"
    :class="badgeClasses"
    :title="tooltip"
    @click="$emit('click', $event)"
  >
    <span :class="iconClasses">{{ icon }}</span>
    <span :class="textClasses">{{ text }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['complete', 'pending_confirmation', 'confirmed', 'incomplete', 'insufficient', 'ready'].includes(value)
  },
  show: {
    type: Boolean,
    default: true
  },
  clickable: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const badgeClasses = computed(() => {
  let baseClasses = 'border'
  
  if (props.clickable) {
    baseClasses += ' cursor-pointer hover:bg-opacity-30 group'
  }
  
  switch (props.status) {
    case 'complete':
      return `${baseClasses} bg-green-500/20 border-green-400/30 ${props.clickable ? 'hover:bg-green-500/30' : ''}`
    case 'pending_confirmation':
      return `${baseClasses} bg-orange-500/20 border-orange-400/30 ${props.clickable ? 'hover:bg-orange-500/30' : ''}`
    case 'confirmed':
      return `${baseClasses} bg-purple-500/20 border-purple-400/30 ${props.clickable ? 'hover:bg-purple-500/30' : ''}`
    case 'incomplete':
      return `${baseClasses} bg-yellow-500/20 border-yellow-400/30 ${props.clickable ? 'hover:bg-yellow-500/30' : ''}`
    case 'insufficient':
      return `${baseClasses} bg-red-500/20 border-red-400/30 ${props.clickable ? 'hover:bg-red-500/30' : ''}`
    case 'ready':
      return `${baseClasses} bg-blue-500/20 border-blue-400/30 ${props.clickable ? 'hover:bg-blue-500/30' : ''}`
    default:
      return `${baseClasses} bg-gray-500/20 border-gray-400/30 ${props.clickable ? 'hover:bg-gray-500/30' : ''}`
  }
})

const iconClasses = computed(() => {
  const baseClasses = 'font-medium'
  
  switch (props.status) {
    case 'complete':
      return `${baseClasses} text-green-300 ${props.clickable ? 'group-hover:text-green-200' : ''}`
    case 'pending_confirmation':
      return `${baseClasses} text-orange-300 ${props.clickable ? 'group-hover:text-orange-200' : ''}`
    case 'confirmed':
      return `${baseClasses} text-purple-300 ${props.clickable ? 'group-hover:text-purple-200' : ''}`
    case 'incomplete':
      return `${baseClasses} text-yellow-300 ${props.clickable ? 'group-hover:text-yellow-200' : ''}`
    case 'insufficient':
      return `${baseClasses} text-red-300 ${props.clickable ? 'group-hover:text-red-200' : ''}`
    case 'ready':
      return `${baseClasses} text-blue-300 ${props.clickable ? 'group-hover:text-blue-200' : ''}`
    default:
      return `${baseClasses} text-gray-300 ${props.clickable ? 'group-hover:text-gray-200' : ''}`
  }
})

const textClasses = computed(() => {
  const baseClasses = 'font-medium'
  
  switch (props.status) {
    case 'complete':
      return `${baseClasses} text-green-200 ${props.clickable ? 'group-hover:text-green-100' : ''}`
    case 'pending_confirmation':
      return `${baseClasses} text-orange-200 ${props.clickable ? 'group-hover:text-orange-100' : ''}`
    case 'confirmed':
      return `${baseClasses} text-purple-200 ${props.clickable ? 'group-hover:text-purple-100' : ''}`
    case 'incomplete':
      return `${baseClasses} text-yellow-200 ${props.clickable ? 'group-hover:text-yellow-100' : ''}`
    case 'insufficient':
      return `${baseClasses} text-red-200 ${props.clickable ? 'group-hover:text-red-100' : ''}`
    case 'ready':
      return `${baseClasses} text-blue-200 ${props.clickable ? 'group-hover:text-blue-100' : ''}`
    default:
      return `${baseClasses} text-gray-200 ${props.clickable ? 'group-hover:text-gray-100' : ''}`
  }
})

const icon = computed(() => {
  switch (props.status) {
    case 'complete':
      return '✅'
    case 'pending_confirmation':
      return '⏳'
    case 'confirmed':
      return '🎯'
    case 'incomplete':
      return '⚠️'
    case 'insufficient':
      return '❌'
    case 'ready':
      return '🎲'
    default:
      return '❓'
  }
})

const text = computed(() => {
  switch (props.status) {
    case 'complete':
      return 'Complète'
    case 'pending_confirmation':
      return 'À confirmer'
    case 'confirmed':
      return 'Confirmée'
    case 'incomplete':
      return 'Incomplète'
    case 'insufficient':
      return 'Manque'
    case 'ready':
      return 'Prêt'
    default:
      return 'Inconnu'
  }
})

const tooltip = computed(() => {
  switch (props.status) {
    case 'complete':
      return 'Sélection complète (non confirmée)'
    case 'pending_confirmation':
      return 'Sélection à confirmer - En attente de confirmation des joueurs'
    case 'confirmed':
      return 'Sélection confirmée - Tous les joueurs ont confirmé'
    case 'incomplete':
      return 'Sélection incomplète - Problèmes détectés'
    case 'insufficient':
      return 'Pas assez de joueurs disponibles'
    case 'ready':
      return 'Prêt pour la sélection'
    default:
      return 'Statut inconnu'
  }
})
</script>
