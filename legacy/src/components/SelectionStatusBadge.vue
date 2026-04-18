<template>
  <div 
    v-if="show"
    class="px-2 py-1 rounded-full text-xs font-normal transition-colors duration-200"
    :class="[getStatusColor(status), clickable ? 'cursor-pointer hover:opacity-80' : '']"
    :title="tooltip"
    @click="$emit('click', $event)"
  >
    <span>{{ getStatusLabel(status) }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getStatusLabel, getStatusColor } from '../services/eventStatusService.js'

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
  },
  reason: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])



const tooltip = computed(() => {
  // Si une raison personnalisée est fournie, l'utiliser
  if (props.reason) {
    return props.reason
  }
  
  // Sinon, utiliser les tooltips par défaut
  switch (props.status) {
    case 'complete':
      return 'Sélection complète (non confirmée)'
    case 'pending_confirmation':
      return 'Sélection à confirmer - En attente de confirmation des personnes'
    case 'confirmed':
      return 'Sélection confirmée - Toutes les personnes ont confirmé'
    case 'incomplete':
      return 'Sélection incomplète - Problèmes détectés'
    case 'insufficient':
      return 'Pas assez de personnes disponibles'
    case 'ready':
      return 'Prêt pour la sélection'
    default:
      return 'Statut inconnu'
  }
})
</script>
