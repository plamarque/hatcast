<template>
  <div class="relative">
    <!-- Overlay affiché pendant le chargement du chunk GridBoard et jusqu'à son premier paint -->
    <div
      v-show="!gridReady"
      class="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#030712]"
    >
      <div class="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 animate-pulse flex items-center justify-center shadow-2xl mb-6">
        <span class="text-3xl">🎭</span>
      </div>
      <p class="text-white text-lg mb-3">Chargement des données de la saison…</p>
      <div class="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300" style="width: 20%"></div>
      </div>
      <p class="text-white/60 text-xs mt-2">20%</p>
    </div>
    <!-- GridBoard chargé dynamiquement ; onReady appelé après premier paint -->
    <component
      :is="GridBoardComponent"
      :slug="props.slug"
      :event-id="props.eventId"
      :on-ready="onGridReady"
    />
  </div>
</template>

<script setup>
import { ref, shallowRef, nextTick, onMounted, defineAsyncComponent } from 'vue'

const props = defineProps({
  slug: { type: String, required: true },
  eventId: { type: String, default: undefined }
})

const gridReady = ref(false)

onMounted(() => {
  nextTick(() => {
    document.getElementById('app-loading')?.style.setProperty('display', 'none')
  })
})

const GridBoardComponent = shallowRef(
  defineAsyncComponent(() => import('./GridBoard.vue'))
)

function onGridReady() {
  nextTick().then(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => { gridReady.value = true }, 200)
      })
    })
  })
}
</script>
