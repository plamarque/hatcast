<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center z-[1260] p-0 md:p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="v2-cutover-title"
  >
    <div
      class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 shadow-2xl w-full max-w-lg rounded-t-2xl md:rounded-2xl flex flex-col"
      @click.stop
    >
      <div class="text-center p-6 md:p-8 border-b border-white/10">
        <div class="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-3xl">🎭</span>
        </div>
        <h2 id="v2-cutover-title" class="text-2xl font-bold text-white mb-3">
          HatCast évolue
        </h2>
        <p class="text-base text-gray-300 leading-relaxed">
          Nous migrons vers une nouvelle version de HatCast, plus moderne et pensée pour votre troupe.
          Découvrez-la dès maintenant sur hatcast.app.
        </p>
      </div>

      <div class="p-6 md:p-8 flex flex-col gap-4">
        <button
          type="button"
          class="h-12 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold text-base hover:from-pink-600 hover:to-purple-700 transition-all"
          @click="onPrimaryClick"
        >
          Découvrir HatCast V2
        </button>
        <button
          type="button"
          class="text-sm text-gray-400 hover:text-gray-200 underline transition-colors py-2"
          @click="onDismissClick"
        >
          Continuer sur cette version
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  buildV2CutoverUrl,
  captureCutoverEvent,
  dismissModal,
  getPostHogDistinctId,
  V1_CUTOVER_CTA_CLICKED,
  V1_CUTOVER_MODAL_DISMISSED,
  V1_CUTOVER_SRC,
} from '../services/posthogCutover.js'

defineProps({
  show: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

function onPrimaryClick() {
  const phRef = getPostHogDistinctId()
  const url = buildV2CutoverUrl(phRef)
  captureCutoverEvent(
    V1_CUTOVER_CTA_CLICKED,
    {
      destination: 'hatcast.app',
      src: V1_CUTOVER_SRC,
    },
    () => window.location.assign(url),
  )
}

function onDismissClick() {
  captureCutoverEvent(V1_CUTOVER_MODAL_DISMISSED)
  dismissModal()
  emit('close')
}
</script>
