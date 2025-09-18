<template>
  <span :class="statusColorClass" class="text-xs px-2 py-1 rounded-full font-normal">
    {{ statusLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { getStatusColor, getStatusLabel } from '../services/eventStatusService.js'

const props = defineProps({
  eventId: {
    type: String,
    required: true
  },
  eventStatus: {
    type: String,
    required: true
  }
})

const statusColorClass = computed(() => {
  return getStatusColor(props.eventStatus)
})

const statusLabel = computed(() => {
  return getStatusLabel(props.eventStatus)
})
</script>
