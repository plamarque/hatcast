<template>
  <span :class="statusColorClass" class="text-xs px-2 py-1 rounded-full font-normal flex items-center justify-center text-center leading-tight">
    {{ statusLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { getStatusColor, getStatusLabel, getShortStatusLabel } from '../services/eventStatusService.js'

const props = defineProps({
  eventId: {
    type: String,
    required: true
  },
  eventStatus: {
    type: String,
    required: true
  },
  short: {
    type: Boolean,
    default: false
  }
})

const statusColorClass = computed(() => {
  return getStatusColor(props.eventStatus)
})

const statusLabel = computed(() => {
  return props.short ? getShortStatusLabel(props.eventStatus) : getStatusLabel(props.eventStatus)
})
</script>
