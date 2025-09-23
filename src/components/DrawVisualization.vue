<template>
  <div v-if="show" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div class="bg-gray-900 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- En-tête -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-white">
          🎲 Tirage en cours - {{ role }} ({{ selectedCount }}/{{ totalCount }})
        </h3>
        <button 
          @click="skipAnimation" 
          class="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          :disabled="isAnimating"
        >
          {{ isAnimating ? 'Accélérer' : 'Fermer' }}
        </button>
      </div>

      <!-- Canvas de visualisation -->
      <div class="mb-6">
        <canvas 
          ref="canvasRef" 
          :width="canvasWidth" 
          :height="canvasHeight"
          class="border border-gray-600 rounded bg-gray-800"
        ></canvas>
      </div>

      <!-- Informations des candidats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <div 
          v-for="candidate in candidates" 
          :key="candidate.name"
          class="p-3 rounded border-2 transition-all duration-300"
          :class="getCandidateClass(candidate)"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium">{{ candidate.name }}</span>
            <span class="text-sm">{{ candidate.practicalChance.toFixed(1) }}%</span>
          </div>
          <div class="text-xs text-gray-400 mt-1">
            Poids: {{ candidate.weight.toFixed(3) }} | Sélections: {{ candidate.pastSelections }}
          </div>
        </div>
      </div>

      <!-- Résultat du tirage -->
      <div v-if="lastSelected" class="text-center">
        <div class="text-2xl font-bold text-green-400 mb-2">
          ✨ {{ lastSelected.name }} sélectionné ! ✨
        </div>
        <div class="text-sm text-gray-400">
          Chance: {{ lastSelected.practicalChance.toFixed(1) }}% | 
          Position: {{ lastSelected.position.toFixed(3) }}
        </div>
      </div>

      <!-- Boutons de contrôle -->
      <div class="flex justify-center gap-4 mt-6">
        <button 
          v-if="!isAnimating && !isComplete"
          @click="startDraw" 
          class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
        >
          {{ selectedCount === 0 ? 'Commencer le tirage' : 'Tirage suivant' }}
        </button>
        <button 
          v-if="isComplete"
          @click="$emit('complete')" 
          class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
        >
          Terminer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    required: true
  },
  candidates: {
    type: Array,
    required: true
  },
  totalCount: {
    type: Number,
    required: true
  },
  selectedCount: {
    type: Number,
    default: 0
  },
  onDraw: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['complete'])

// Références
const canvasRef = ref(null)
const isAnimating = ref(false)
const lastSelected = ref(null)
const animationId = ref(null)

// Dimensions du canvas
const canvasWidth = 800
const canvasHeight = 120

// État de l'animation
const animationProgress = ref(0)
const targetPosition = ref(0)
const currentPosition = ref(0)

// Calculs
const totalWeight = computed(() => {
  return props.candidates.reduce((sum, c) => sum + c.weight, 0)
})

const isComplete = computed(() => {
  return props.selectedCount >= props.totalCount
})

// Classes CSS pour les candidats
function getCandidateClass(candidate) {
  if (lastSelected.value?.name === candidate.name) {
    return 'border-green-400 bg-green-900/20 text-green-300'
  }
  return 'border-gray-600 bg-gray-800/50 text-gray-300'
}

// Dessiner la bande de tirage
function drawBand() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // Couleurs pour chaque candidat
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ]

  // Dessiner la bande
  let currentX = 0
  const bandHeight = 60
  const bandY = (canvasHeight - bandHeight) / 2

  props.candidates.forEach((candidate, index) => {
    const segmentWidth = (candidate.weight / totalWeight.value) * canvasWidth
    const color = colors[index % colors.length]

    // Dessiner le segment
    ctx.fillStyle = color
    ctx.fillRect(currentX, bandY, segmentWidth, bandHeight)

    // Dessiner le nom du candidat
    ctx.fillStyle = 'white'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(
      candidate.name, 
      currentX + segmentWidth / 2, 
      bandY + bandHeight / 2 + 4
    )

    // Dessiner le pourcentage
    ctx.font = '10px Arial'
    ctx.fillText(
      `${candidate.practicalChance.toFixed(1)}%`, 
      currentX + segmentWidth / 2, 
      bandY + bandHeight / 2 + 18
    )

    currentX += segmentWidth
  })

  // Dessiner le pointeur
  const pointerX = currentPosition.value * canvasWidth
  ctx.fillStyle = '#FCD34D'
  ctx.beginPath()
  ctx.moveTo(pointerX, bandY - 10)
  ctx.lineTo(pointerX - 8, bandY - 20)
  ctx.lineTo(pointerX + 8, bandY - 20)
  ctx.closePath()
  ctx.fill()

  // Dessiner la ligne de position
  ctx.strokeStyle = '#FCD34D'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(pointerX, bandY - 10)
  ctx.lineTo(pointerX, bandY + bandHeight + 10)
  ctx.stroke()

  // Dessiner les étiquettes de position
  ctx.fillStyle = '#FCD34D'
  ctx.font = 'bold 14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(
    currentPosition.value.toFixed(3), 
    pointerX, 
    bandY + bandHeight + 30
  )
}

// Animation du pointeur
function animatePointer() {
  if (!isAnimating.value) return

  const speed = 0.02
  const easing = 0.1

  // Mouvement vers la position cible
  const diff = targetPosition.value - currentPosition.value
  currentPosition.value += diff * easing

  drawBand()

  // Vérifier si l'animation est terminée
  if (Math.abs(diff) < 0.001) {
    isAnimating.value = false
    showSelectionResult()
  } else {
    animationId.value = requestAnimationFrame(animatePointer)
  }
}

// Afficher le résultat de la sélection
function showSelectionResult() {
  // Trouver le candidat sélectionné
  let currentX = 0
  for (const candidate of props.candidates) {
    const segmentWidth = (candidate.weight / totalWeight.value) * canvasWidth
    const segmentEnd = currentX + segmentWidth

    if (targetPosition.value * canvasWidth <= segmentEnd) {
      lastSelected.value = {
        ...candidate,
        position: targetPosition.value
      }
      break
    }
    currentX = segmentEnd
  }

  // Effet sparkly
  setTimeout(() => {
    if (lastSelected.value) {
      // Ici on pourrait ajouter un effet de particules
      console.log('✨ Effet sparkly pour', lastSelected.value.name)
    }
  }, 500)
}

// Démarrer le tirage
async function startDraw() {
  if (isAnimating.value) return

  // Générer le nombre aléatoire
  const randomNumber = Math.random() * totalWeight.value
  targetPosition.value = randomNumber / totalWeight.value

  isAnimating.value = true
  lastSelected.value = null

  // Démarrer l'animation
  animatePointer()
}

// Accélérer l'animation
function skipAnimation() {
  if (isAnimating.value) {
    isAnimating.value = false
    if (animationId.value) {
      cancelAnimationFrame(animationId.value)
    }
    currentPosition.value = targetPosition.value
    drawBand()
    showSelectionResult()
  } else {
    emit('complete')
  }
}

// Watchers
watch(() => props.candidates, () => {
  if (canvasRef.value) {
    drawBand()
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  nextTick(() => {
    drawBand()
  })
})
</script>
