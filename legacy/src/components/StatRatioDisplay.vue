<template>
  <div v-if="denominator > 0" class="flex flex-col items-center w-full">
    <span class="inline-flex items-baseline justify-center whitespace-nowrap">
      <span :class="xClass">{{ selections }}</span>
      <span :class="yClass"> / {{ denominator }}</span>
    </span>
    <span v-if="percent !== null" :class="percentClass">({{ percent }}%)</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  selections: {
    type: Number,
    default: 0
  },
  dispos: {
    type: Number,
    default: 0
  },
  declines: {
    type: Number,
    default: 0
  },
  /** 'default' hérite des couleurs parent ; 'indigo' pour colonnes mois */
  variant: {
    type: String,
    default: 'default'
  }
})

const effectiveDispos = computed(() => Math.max(0, props.dispos - props.declines))

// Même dénominateur que getStatPercent (CastsView) : cohérent avec le %
const denominator = computed(() => {
  const effective = effectiveDispos.value
  if (effective <= 0 && props.selections <= 0) return 0
  return Math.max(effective, props.selections)
})

const percent = computed(() => {
  if (denominator.value <= 0) return null
  return Math.min(100, Math.round((props.selections / denominator.value) * 100))
})

const xClass = computed(() => {
  if (props.variant === 'indigo') return 'font-semibold text-indigo-200'
  return 'font-bold'
})

const yClass = computed(() => {
  if (props.variant === 'indigo') return 'font-normal text-indigo-200'
  return 'font-normal'
})

const percentClass = computed(() => {
  if (props.variant === 'indigo') return 'text-xs font-normal text-indigo-400/90'
  return 'text-xs font-normal opacity-75'
})
</script>
