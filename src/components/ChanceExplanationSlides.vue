<template>
  <div class="chance-explanation-slides">
    <!-- Zone d'animation principale -->
    <div class="relative bg-gray-800/50 rounded-lg p-4 sm:p-6 min-h-[200px] sm:min-h-[300px] flex items-end justify-center mb-4 pb-2 sm:pb-4">
      <!-- Slide 1 : Mise en place du sac -->
      <div v-if="currentSlide === 0" class="w-full h-full flex flex-col">
        <div class="flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6 flex-1">
          <!-- Urne en bas à gauche -->
          <div class="flex-shrink-0 relative self-end">
            <!-- Urne SVG avec plat en dessous -->
            <svg 
              viewBox="0 0 200 280" 
              class="w-32 h-44 sm:w-40 sm:h-52"
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- Cordelette (ligne qui resserre le haut) -->
              <path
                d="M 50 50 Q 50 40 100 40 Q 150 40 150 50"
                fill="none"
                stroke="#9CA3AF"
                stroke-width="2"
                stroke-linecap="round"
              />
              
              <!-- Corps de l'urne (se termine sur un plat horizontal, base légèrement plus petite) -->
              <path
                d="M 50 50 Q 30 50 30 80 Q 30 200 60 220 L 140 220 Q 170 200 170 80 Q 170 50 150 50"
                fill="#4B5563"
                stroke="#6B7280"
                stroke-width="2"
              />
              
              <!-- Ouverture de l'urne (légèrement ouverte pour y mettre les papiers) -->
              <ellipse
                cx="100"
                cy="55"
                rx="45"
                ry="8"
                fill="#374151"
              />
            </svg>
            
            <!-- Point d'entrée dans l'urne (pour l'animation) - au niveau de l'ouverture -->
            <div 
              class="absolute top-[20%] left-1/2 transform -translate-x-1/2 w-2 h-2"
              ref="bagEntryPoint"
            />
          </div>
          
          <!-- Zone d'apparition puis déplacement vers le sac -->
          <div class="relative flex-1 min-h-[200px] sm:min-h-[250px] flex items-start justify-center">
            <transition-group
              name="paper-slide"
              tag="div"
              class="relative w-full h-full flex flex-wrap items-center justify-center gap-2"
            >
              <div
                v-for="(candidate, index) in visiblePapers"
                :key="getPaperKey(candidate, index)"
                class="paper-item"
                :class="{ 
                  'stacking': animationPhase === 'stacking',
                  'moving': animationPhase === 'moving',
                  'entering': animationPhase === 'entering',
                  'hidden': papersInBag.has(getPaperKey(candidate, index))
                }"
                :style="{
                  ...getPaperStyle(index),
                  zIndex: getPaperZIndex(index)
                }"
              >
                <div
                  class="bg-white rounded shadow-lg p-1 transform"
                  :style="{
                    width: `${paperSize}px`,
                    height: `${paperSize}px`,
                    transform: getPaperTransform(index),
                    opacity: getPaperOpacity(index),
                    transition: animationPhase === 'idle' ? 'none' : 'transform 0.05s linear, opacity 0.05s linear',
                    boxShadow: getPaperShadow(index),
                    filter: getPaperFilter(index)
                  }"
                >
                  <PlayerAvatar
                    v-if="candidate.id"
                    :player-id="candidate.id"
                    :season-id="seasonId"
                    :player-name="candidate.name"
                    size="xs"
                    class="w-full h-full"
                  />
                </div>
              </div>
            </transition-group>
          </div>
        </div>
      </div>

      <!-- Slide 2 : Tirage simple théorique -->
      <div v-if="currentSlide === 1" class="w-full">
        <div class="text-center">
          <div class="relative inline-block">
            <!-- Urne avec papiers -->
            <svg 
              viewBox="0 0 200 280" 
              class="w-32 h-44 sm:w-48 sm:h-64 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- Cordelette (ligne qui resserre le haut) -->
              <path
                d="M 50 50 Q 50 40 100 40 Q 150 40 150 50"
                fill="none"
                stroke="#9CA3AF"
                stroke-width="2"
                stroke-linecap="round"
              />
              
              <!-- Corps de l'urne (se termine sur un plat horizontal, base légèrement plus petite) -->
              <path
                d="M 50 50 Q 30 50 30 80 Q 30 200 60 220 L 140 220 Q 170 200 170 80 Q 170 50 150 50"
                fill="#4B5563"
                stroke="#6B7280"
                stroke-width="2"
              />
              
              <!-- Ouverture de l'urne (légèrement ouverte pour y mettre les papiers) -->
              <ellipse
                cx="100"
                cy="55"
                rx="45"
                ry="8"
                fill="#374151"
              />
              
              <!-- Papiers dans l'urne -->
              <circle cx="80" cy="120" r="8" fill="#9CA3AF" opacity="0.6" />
              <circle cx="100" cy="130" r="8" fill="#9CA3AF" opacity="0.6" />
              <circle cx="120" cy="125" r="8" fill="#9CA3AF" opacity="0.6" />
            </svg>
            
            <!-- Main qui plonge -->
            <div class="relative">
              <svg
                viewBox="0 0 200 200"
                class="w-24 h-24 sm:w-32 sm:h-32 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                <!-- Bras -->
                <path
                  d="M 100 20 L 100 60 L 90 70 L 100 80 L 110 70 L 100 60 Z"
                  fill="#D97706"
                  :style="{ 
                    transform: handAnimating ? 'translateY(40px)' : 'translateY(0)',
                    transition: 'transform 1s ease-in-out'
                  }"
                />
                <!-- Main -->
                <ellipse
                  cx="100"
                  cy="75"
                  rx="15"
                  ry="20"
                  fill="#F59E0B"
                  :style="{ 
                    transform: handAnimating ? 'translateY(40px) rotate(10deg)' : 'translateY(0) rotate(0deg)',
                    transition: 'transform 1s ease-in-out'
                  }"
                />
                <!-- Papier saisi -->
                <rect
                  v-if="handAnimating"
                  x="85"
                  y="95"
                  width="30"
                  height="20"
                  rx="2"
                  fill="#FFFFFF"
                  :style="{ 
                    transform: handAnimating ? 'translateY(40px)' : 'translateY(0)',
                    transition: 'transform 1s ease-in-out'
                  }"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Slide 3 : Rééquilibrage par équité -->
      <div v-if="currentSlide === 2" class="w-full">
        <div class="text-center">
          <div class="flex items-end justify-center gap-2 sm:gap-4 mb-4">
            <transition-group name="paper-resize" tag="div" class="flex items-end gap-2 sm:gap-4">
              <div
                v-for="(candidate, index) in sortedCandidates"
                :key="candidate.id || candidate.name"
                class="paper-container"
                :style="{
                  transitionDelay: `${index * 50}ms`
                }"
              >
                <div
                  class="bg-white rounded shadow-lg p-1 flex flex-col items-center justify-center transition-all duration-1000"
                  :style="{
                    width: `${getPaperSize(candidate.weight)}px`,
                    height: `${getPaperSize(candidate.weight)}px`,
                    transform: `scale(${papersResized ? 1 : 0.8})`
                  }"
                >
                  <PlayerAvatar
                    v-if="candidate.id"
                    :player-id="candidate.id"
                    :season-id="seasonId"
                    :player-name="candidate.name"
                    size="xs"
                    class="w-full h-full"
                  />
                  <div class="text-xs text-gray-600 mt-1">
                    {{ candidate.pastSelections }}
                  </div>
                </div>
              </div>
            </transition-group>
          </div>
        </div>
      </div>

      <!-- Slide 4 : Avantage des gros papiers -->
      <div v-if="currentSlide === 3" class="w-full">
        <div class="text-center">
          <div class="relative inline-block">
            <!-- Grand papier mis en évidence -->
            <div class="mb-4">
              <div class="flex items-center justify-center gap-4">
                <!-- Petit papier -->
                <div class="bg-white rounded shadow p-2 w-16 h-16 opacity-50">
                  <div class="w-full h-full bg-gray-300 rounded"></div>
                </div>
                <!-- Grand papier -->
                <div
                  class="bg-white rounded shadow-lg p-2 w-24 h-24 border-2 border-yellow-400 transition-all duration-500"
                  :style="{
                    transform: largePaperHighlighted ? 'scale(1.1)' : 'scale(1)'
                  }"
                >
                  <div class="w-full h-full bg-blue-400 rounded flex items-center justify-center text-white font-bold">
                    +
                  </div>
                </div>
                <!-- Petit papier -->
                <div class="bg-white rounded shadow p-2 w-16 h-16 opacity-50">
                  <div class="w-full h-full bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
            
            <!-- Main qui saisit le grand papier -->
            <div class="relative">
              <svg
                viewBox="0 0 200 200"
                class="w-24 h-24 sm:w-32 sm:h-32 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 100 20 L 100 60 L 90 70 L 100 80 L 110 70 L 100 60 Z"
                  fill="#D97706"
                  :style="{ 
                    transform: handReaching ? 'translateY(30px) translateX(-10px)' : 'translateY(0)',
                    transition: 'transform 1s ease-in-out'
                  }"
                />
                <ellipse
                  cx="100"
                  cy="75"
                  rx="15"
                  ry="20"
                  fill="#F59E0B"
                  :style="{ 
                    transform: handReaching ? 'translateY(30px) translateX(-10px) rotate(-15deg)' : 'translateY(0) rotate(0deg)',
                    transition: 'transform 1s ease-in-out'
                  }"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Slide 5 : Tirages multiples -->
      <div v-if="currentSlide === 4" class="w-full">
        <div class="text-center">
          <div class="relative inline-block">
            <!-- Urne avec papiers qui diminuent -->
            <svg 
              viewBox="0 0 200 280" 
              class="w-32 h-44 sm:w-48 sm:h-64 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- Cordelette (ligne qui resserre le haut) -->
              <path
                d="M 50 50 Q 50 40 100 40 Q 150 40 150 50"
                fill="none"
                stroke="#9CA3AF"
                stroke-width="2"
                stroke-linecap="round"
              />
              
              <!-- Corps de l'urne (se termine sur un plat horizontal, base légèrement plus petite) -->
              <path
                d="M 50 50 Q 30 50 30 80 Q 30 200 60 220 L 140 220 Q 170 200 170 80 Q 170 50 150 50"
                fill="#4B5563"
                stroke="#6B7280"
                stroke-width="2"
              />
              
              <!-- Ouverture de l'urne (légèrement ouverte pour y mettre les papiers) -->
              <ellipse
                cx="100"
                cy="55"
                rx="45"
                ry="8"
                fill="#374151"
              />
              
              <!-- Papiers restants (diminuent au fur et à mesure) -->
              <circle 
                v-for="(paper, index) in remainingPapers" 
                :key="index"
                :cx="80 + index * 20"
                :cy="120 + index * 5"
                :r="8 - (drawCount * 2)"
                fill="#9CA3AF"
                :opacity="0.8 - (drawCount * 0.2)"
              />
            </svg>
            
            <!-- Main qui fait plusieurs tirages -->
            <div class="relative">
              <svg
                viewBox="0 0 200 200"
                class="w-24 h-24 sm:w-32 sm:h-32 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 100 20 L 100 60 L 90 70 L 100 80 L 110 70 L 100 60 Z"
                  fill="#D97706"
                  :style="{ 
                    transform: `translateY(${drawingHand ? 40 : 0}px)`,
                    transition: 'transform 0.8s ease-in-out'
                  }"
                />
                <ellipse
                  cx="100"
                  cy="75"
                  rx="15"
                  ry="20"
                  fill="#F59E0B"
                  :style="{ 
                    transform: `translateY(${drawingHand ? 40 : 0}px) rotate(${drawingHand ? 10 : 0}deg)`,
                    transition: 'transform 0.8s ease-in-out'
                  }"
                />
                <!-- Papiers tirés empilés -->
                <g v-if="drawCount > 0">
                  <rect
                    v-for="i in drawCount"
                    :key="i"
                    :x="70"
                    :y="100 + (i - 1) * 3"
                    width="60"
                    height="15"
                    rx="2"
                    fill="#FFFFFF"
                    :opacity="0.9 - (i - 1) * 0.1"
                  />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Texte explicatif -->
    <div class="text-gray-300 text-sm sm:text-xs mb-4 min-h-[60px]">
      <div v-if="currentSlide === 0" class="text-center">
        Pour tirer au sort parmi les <span class="text-green-400 font-semibold">{{ explanationData.availableCount }}</span> personnes disponibles, l'algorithme fait un peu comme si on mettait tous les noms sur un papier dans un sac et qu'on tirait au hasard...
      </div>
      <div v-if="currentSlide === 1" class="text-center">
        Si on faisait un tirage au sort simple, tout le monde aurait environ <span class="text-blue-400 font-semibold">{{ explanationData.requiredCount }}</span>/<span class="text-green-400 font-semibold">{{ explanationData.availableCount }}</span> = <span class="text-yellow-400 font-semibold">{{ Math.round(explanationData.theoreticalSimpleChance) }}%</span> de chance d'être tiré au sort
      </div>
      <div v-if="currentSlide === 2" class="text-center">
        Mais par souci d'équité, on modifie la taille des bouts de papier en fonction du nombre de sélections passées.
      </div>
      <div v-if="currentSlide === 3" class="text-center">
        Les plus gros papiers ont plus de chances d'être tirés au hasard que les petits.
      </div>
      <div v-if="currentSlide === 4" class="text-center">
        On fait <span class="text-blue-400 font-semibold">{{ explanationData.requiredCount }}</span> tirage{{ explanationData.requiredCount > 1 ? 's' : '' }} dans le sac sans remettre les papiers tirés
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex items-center justify-between">
      <!-- Bouton précédent -->
      <button
        @click="prevSlide"
        :disabled="currentSlide === 0"
        class="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
      >
        ← Précédent
      </button>

      <!-- Indicateurs de progression -->
      <div class="flex gap-2">
        <button
          v-for="(slide, index) in 5"
          :key="index"
          @click="goToSlide(index)"
          class="w-2 h-2 rounded-full transition-all"
          :class="currentSlide === index ? 'bg-blue-400 w-6' : 'bg-gray-600 hover:bg-gray-500'"
        />
      </div>

      <!-- Bouton suivant -->
      <button
        @click="nextSlide"
        :disabled="currentSlide === 4"
        class="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
      >
        Suivant →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import PlayerAvatar from './PlayerAvatar.vue'

const props = defineProps({
  explanationData: {
    type: Object,
    required: true
  },
  seasonId: {
    type: String,
    required: true
  }
})

const currentSlide = ref(0)
const visiblePapers = ref([])
const animationPhase = ref('idle') // 'idle', 'stacking', 'moving', 'entering'
const stackProgress = ref(0) // 0-1 pour le regroupement
const moveProgress = ref(0) // 0-1 pour le déplacement
const enterProgress = ref(0) // 0-1 pour l'entrée dans l'urne
const papersInBag = ref(new Set())
const bagEntryPoint = ref(null)
const papersResized = ref(false)
const handAnimating = ref(false)
const handReaching = ref(false)
const largePaperHighlighted = ref(false)
const drawingHand = ref(false)
const drawCount = ref(0)
const remainingPapers = ref([])

// Candidats triés par poids (décroissant) pour la slide 3
const sortedCandidates = computed(() => {
  if (!props.explanationData?.candidates) return []
  return [...props.explanationData.candidates].sort((a, b) => b.weight - a.weight)
})

// Calculer la taille des papiers en fonction du nombre (max 12 papiers)
const paperSize = computed(() => {
  const maxPapers = 12
  const count = Math.min(visiblePapers.value.length, maxPapers)
  if (count === 0) return 48
  
  // Ajuster la taille pour que 12 papiers rentrent bien
  // Base: 48px pour 10 papiers, plus petit si plus de papiers
  if (count <= 10) return 48
  if (count === 11) return 44
  return 40 // 12 papiers
})

// Fonction pour calculer la taille d'un papier basée sur son poids
function getPaperSize(weight) {
  if (!props.explanationData?.candidates || props.explanationData.candidates.length === 0) return 40
  const maxWeight = Math.max(...props.explanationData.candidates.map(c => c.weight))
  const minWeight = Math.min(...props.explanationData.candidates.map(c => c.weight))
  const range = maxWeight - minWeight || 1
  const normalizedWeight = (weight - minWeight) / range
  // Taille entre 30px (petit) et 60px (grand)
  return 30 + (normalizedWeight * 30)
}

// Fonction pour générer une clé unique pour chaque papier (évite les doublons)
function getPaperKey(candidate, index) {
  // Utiliser l'ID si disponible, sinon le nom, avec l'index comme fallback
  return candidate.id || `${candidate.name}-${index}`
}

// Fonction pour obtenir le style d'un papier (position initiale)
function getPaperStyle(index) {
  return {
    transitionDelay: `${index * 100}ms`
  }
}

// Fonction pour obtenir le z-index d'un papier (les cartes du dessus ont un z-index plus élevé)
function getPaperZIndex(index) {
  // Les cartes avec un index plus élevé sont au-dessus (z-index plus grand)
  // Cela permet de voir la carte du dessus et les bords des autres
  return 1000 + index
}

// Fonction pour obtenir l'ombre d'un papier (plus prononcée pour les cartes du dessous)
function getPaperShadow(index) {
  if (index === undefined || index === null) {
    return '0 2px 4px rgba(0, 0, 0, 0.2)'
  }
  // Plus l'index est élevé (carte du dessous), plus l'ombre est prononcée
  const depth = index
  const shadowBlur = 2 + depth * 0.2
  return `0 ${1 + depth * 0.15}px ${shadowBlur}px rgba(0, 0, 0, ${Math.min(0.25 + depth * 0.015, 0.5)})`
}

// Fonction pour obtenir le filtre (légèrement plus sombre pour les cartes du dessous)
function getPaperFilter(index) {
  if (index === undefined || index === null) {
    return 'brightness(1)'
  }
  // Plus l'index est élevé (carte du dessous), légèrement plus sombre
  const depth = index
  const brightness = Math.max(0.95 - (depth * 0.005), 0.85)
  return `brightness(${brightness})`
}

// Calculer la position du centre de l'ouverture de l'urne (en pixels relatifs)
// L'urne est maintenant en bas à gauche, l'ouverture est à cy="55" dans le viewBox de 280
// Le SVG fait w-40 (160px) et h-52 (208px) sur desktop
// En coordonnées relatives au conteneur flex, on calcule depuis le centre
// L'urne est à gauche et en bas, donc l'ouverture est à environ -60px à gauche et +40px vers le bas
const URN_OPENING_X = -60 // À gauche du centre (vers l'urne)
const URN_OPENING_Y = 40 // Vers le bas (niveau de l'ouverture, urne en bas)
const STACK_CENTER_X = 0 // Point central pour le regroupement (au centre, pas à droite)
const STACK_CENTER_Y = -40 // Légèrement au-dessus du centre pour les cartes

// Fonction pour calculer une position sur une courbe de Bézier quadratique
function bezierQuadratic(t, p0, p1, p2) {
  const mt = 1 - t
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y
  }
}

// Fonction pour obtenir la transformation d'un papier
function getPaperTransform(index) {
  if (!visiblePapers.value || !visiblePapers.value[index]) {
    return 'translate(0, 0) scale(1) rotate(0deg)'
  }
  
  const paperKey = getPaperKey(visiblePapers.value[index], index)
  
  // Si le papier est déjà dans l'urne, le cacher complètement
  if (papersInBag.value.has(paperKey)) {
    return 'translate(0, 0) scale(0) rotate(0deg)'
  }
  
  // Fonction pour obtenir les décalages d'empilement (superposition visuelle)
  function getStackOffsets(index) {
    // Décalages très petits en X/Y pour créer l'effet de tas superposé
    // On utilise des valeurs déterministes basées sur l'index pour la cohérence
    const offsets = [
      { x: 0, y: 0, rot: 0 },           // Carte du dessus (parfaitement alignée)
      { x: -0.5, y: 0.5, rot: -1.5 },   // Légèrement décalée
      { x: 0.4, y: 0.4, rot: 1.2 },     // Légèrement décalée
      { x: -0.3, y: 0.6, rot: -0.8 },   // Légèrement décalée
      { x: 0.5, y: 0.5, rot: 1.5 },     // Légèrement décalée
      { x: -0.4, y: 0.7, rot: -1.0 },   // Légèrement décalée
      { x: 0.3, y: 0.6, rot: 0.9 },     // Légèrement décalée
      { x: -0.3, y: 0.8, rot: -0.6 },   // Légèrement décalée
      { x: 0.4, y: 0.7, rot: 1.1 },     // Légèrement décalée
      { x: -0.3, y: 0.9, rot: -0.9 },   // Légèrement décalée
      { x: 0.3, y: 0.8, rot: 0.7 },     // Légèrement décalée
      { x: -0.2, y: 1.0, rot: -0.5 }    // Légèrement décalée
    ]
    return offsets[index % offsets.length]
  }
  
  // Phase 1 : Regroupement avec empilement en tas superposé
  if (animationPhase.value === 'stacking') {
    const progress = stackProgress.value
    const offsets = getStackOffsets(index)
    
    // Toutes les cartes se regroupent au même point central avec petits décalages
    const finalX = STACK_CENTER_X + offsets.x
    const finalY = STACK_CENTER_Y + offsets.y
    
    return `translate(${finalX * progress}px, ${finalY * progress}px) scale(${1 - 0.2 * (1 - progress)}) rotate(${offsets.rot * progress}deg)`
  }
  
  // Phase 2 : Déplacement du tas comme un seul objet selon une courbe vers l'ouverture
  if (animationPhase.value === 'moving') {
    const progress = moveProgress.value
    const offsets = getStackOffsets(index)
    
    // Position de base du tas (toutes les cartes au même endroit)
    const stackBaseX = STACK_CENTER_X
    const stackBaseY = STACK_CENTER_Y
    
    // Point de contrôle : point intermédiaire pour la courbe (légèrement au-dessus)
    const control = { x: (STACK_CENTER_X + URN_OPENING_X) / 2, y: (STACK_CENTER_Y + URN_OPENING_Y) / 2 - 20 }
    // Point d'arrivée : ouverture de l'urne (position de base du tas)
    const end = { x: URN_OPENING_X, y: URN_OPENING_Y }
    
    // Calculer la position du tas sur la courbe
    const start = { x: stackBaseX, y: stackBaseY }
    const pos = bezierQuadratic(progress, start, control, end)
    
    // Ajouter les décalages d'empilement
    return `translate(${pos.x + offsets.x}px, ${pos.y + offsets.y}px) scale(0.8) rotate(${offsets.rot}deg)`
  }
  
  // Phase 3 : Entrée dans l'urne avec masquage progressif
  if (animationPhase.value === 'entering') {
    const progress = enterProgress.value
    const offsets = getStackOffsets(index)
    
    // Position de départ : ouverture de l'urne (position de base du tas)
    const startX = URN_OPENING_X
    const startY = URN_OPENING_Y
    
    // Descend dans l'urne (vers le bas) et légèrement vers la gauche
    const finalX = startX - progress * 15 // Légèrement plus à gauche
    const finalY = startY + progress * 25 // Descend dans l'urne
    
    // Ajouter les décalages d'empilement
    return `translate(${finalX + offsets.x}px, ${finalY + offsets.y}px) scale(${0.8 - progress * 0.2}) rotate(${offsets.rot}deg)`
  }
  
  // Position normale (apparition instantanée) - position initiale visible
  return 'translate(0, 0) scale(1) rotate(0deg)'
}

// Fonction pour obtenir l'opacité d'un papier (pour masquer progressivement quand il entre dans l'urne)
function getPaperOpacity(index) {
  if (!visiblePapers.value || !visiblePapers.value[index]) {
    return 0
  }
  
  const paperKey = getPaperKey(visiblePapers.value[index], index)
  
  // Si le papier est déjà dans l'urne, complètement transparent
  if (papersInBag.value.has(paperKey)) {
    return 0
  }
  
  // Phase 3 : Masquage progressif lors de l'entrée dans l'urne
  if (animationPhase.value === 'entering') {
    // L'opacité diminue progressivement pour simuler le passage sous l'encolure
    return 1 - enterProgress.value
  }
  
  return 1
}

// Navigation
function nextSlide() {
  if (currentSlide.value < 4) {
    currentSlide.value++
    resetAnimations()
    triggerSlideAnimation()
  }
}

function prevSlide() {
  if (currentSlide.value > 0) {
    currentSlide.value--
    resetAnimations()
    triggerSlideAnimation()
  }
}

function goToSlide(index) {
  currentSlide.value = index
  resetAnimations()
  triggerSlideAnimation()
}

function resetAnimations() {
  visiblePapers.value = []
  animationPhase.value = 'idle'
  stackProgress.value = 0
  moveProgress.value = 0
  enterProgress.value = 0
  papersInBag.value = new Set()
  papersResized.value = false
  handAnimating.value = false
  handReaching.value = false
  largePaperHighlighted.value = false
  drawingHand.value = false
  drawCount.value = 0
  remainingPapers.value = []
}

function triggerSlideAnimation() {
  // Slide 1 : Apparition instantanée puis regroupement, déplacement et entrée dans l'urne
  if (currentSlide.value === 0) {
    visiblePapers.value = []
    animationPhase.value = 'idle'
    stackProgress.value = 0
    moveProgress.value = 0
    enterProgress.value = 0
    papersInBag.value = new Set()
    
    if (props.explanationData?.candidates) {
      // Éviter les doublons en utilisant un Set pour tracker les candidats déjà ajoutés
      const addedCandidates = new Set()
      const uniqueCandidates = props.explanationData.candidates.filter(candidate => {
        const key = candidate.id || candidate.name
        if (addedCandidates.has(key)) {
          return false // Doublon, on l'ignore
        }
        addedCandidates.add(key)
        return true
      })
      
      // Limiter à 12 papiers maximum
      const limitedCandidates = uniqueCandidates.slice(0, 12)
      
      // Phase 1 : Apparition instantanée de tous les papiers
      visiblePapers.value = [...limitedCandidates]
      
      // Phase 2 : Après un court délai, regroupement avec empilement
      setTimeout(() => {
        animateStacking()
      }, 300) // Délai après l'apparition
    }
  }
  
  // Slide 2 : Animation de la main
  if (currentSlide.value === 1) {
    setTimeout(() => {
      handAnimating.value = true
    }, 300)
  }
  
  // Slide 3 : Changement de taille des papiers
  if (currentSlide.value === 2) {
    setTimeout(() => {
      papersResized.value = true
    }, 300)
  }
  
  // Slide 4 : Main qui atteint le grand papier
  if (currentSlide.value === 3) {
    setTimeout(() => {
      largePaperHighlighted.value = true
      handReaching.value = true
    }, 300)
  }
  
  // Slide 5 : Tirages multiples
  if (currentSlide.value === 4) {
    const totalDraws = props.explanationData?.requiredCount || 3
    const maxPapers = props.explanationData?.availableCount || 5
    remainingPapers.value = Array.from({ length: maxPapers }, (_, i) => i)
    drawCount.value = 0
    
    // Simuler les tirages successifs
    for (let i = 0; i < totalDraws; i++) {
      setTimeout(() => {
        drawingHand.value = true
        setTimeout(() => {
          drawingHand.value = false
          drawCount.value++
          if (remainingPapers.value.length > 0) {
            remainingPapers.value.pop()
          }
        }, 800)
      }, i * 1500)
    }
  }
}

// Fonction pour animer le regroupement avec empilement
function animateStacking() {
  // Vérifier si on est toujours sur la slide 1
  if (currentSlide.value !== 0) {
    return
  }
  
  animationPhase.value = 'stacking'
  stackProgress.value = 0
  const duration = 800 // 800ms pour le regroupement
  const startTime = Date.now()
  
  const animate = () => {
    // Vérifier si on est toujours sur la slide 1
    if (currentSlide.value !== 0) {
      return
    }
    
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    // Utiliser une fonction d'easing pour une animation plus fluide
    const easedProgress = progress * progress * (3 - 2 * progress) // Smoothstep
    stackProgress.value = easedProgress
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      stackProgress.value = 1
      // Petit délai avant de passer à la phase de déplacement
      setTimeout(() => {
        if (currentSlide.value === 0) {
          animateMoving()
        }
      }, 200)
    }
  }
  
  requestAnimationFrame(animate)
}

// Fonction pour animer le déplacement du tas vers l'urne
function animateMoving() {
  // Vérifier si on est toujours sur la slide 1
  if (currentSlide.value !== 0) {
    return
  }
  
  animationPhase.value = 'moving'
  moveProgress.value = 0
  const duration = 1000 // 1000ms pour le déplacement
  const startTime = Date.now()
  
  const animate = () => {
    // Vérifier si on est toujours sur la slide 1
    if (currentSlide.value !== 0) {
      return
    }
    
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    // Utiliser une fonction d'easing pour une courbe plus naturelle
    const easedProgress = progress * progress * (3 - 2 * progress) // Smoothstep
    moveProgress.value = easedProgress
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      moveProgress.value = 1
      // Petit délai avant de passer à la phase d'entrée
      setTimeout(() => {
        if (currentSlide.value === 0) {
          animateEntering()
        }
      }, 200)
    }
  }
  
  requestAnimationFrame(animate)
}

// Fonction pour animer l'entrée dans l'urne avec masquage progressif
function animateEntering() {
  animationPhase.value = 'entering'
  enterProgress.value = 0
  const duration = 800 // 800ms pour l'entrée
  const startTime = Date.now()
  
  const animate = () => {
    // Vérifier si on est toujours sur la slide 1, sinon arrêter l'animation
    if (currentSlide.value !== 0) {
      return
    }
    
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    // Utiliser une fonction d'easing pour un masquage plus progressif
    const easedProgress = progress * progress // Easing quadratique pour un masquage plus rapide à la fin
    enterProgress.value = easedProgress
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      enterProgress.value = 1
      // Marquer tous les papiers comme dans l'urne seulement à la fin
      setTimeout(() => {
        // Vérifier à nouveau si on est toujours sur la slide 1
        if (currentSlide.value !== 0) {
          return
        }
        
        visiblePapers.value.forEach((candidate, index) => {
          const key = getPaperKey(candidate, index)
          papersInBag.value.add(key)
        })
        animationPhase.value = 'idle'
        
        // Relancer l'animation depuis le début après un court délai
        setTimeout(() => {
          if (currentSlide.value === 0) {
            // Réinitialiser l'état et relancer
            visiblePapers.value = []
            papersInBag.value = new Set()
            animationPhase.value = 'idle'
            stackProgress.value = 0
            moveProgress.value = 0
            enterProgress.value = 0
            
            // Relancer l'animation
            triggerSlideAnimation()
          }
        }, 500) // Délai avant de relancer
      }, 100)
    }
  }
  
  requestAnimationFrame(animate)
}

// Déclencher l'animation au montage et quand on change de slide
watch(currentSlide, () => {
  triggerSlideAnimation()
})

onMounted(() => {
  triggerSlideAnimation()
})
</script>

<style scoped>
.paper-slide-enter-active {
  transition: all 0.5s ease;
}

.paper-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.8);
}

.paper-slide-leave-active {
  transition: all 0.3s ease;
}

.paper-slide-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

.paper-item {
  transition: all 0.7s ease;
}

.paper-item.stacking,
.paper-item.moving,
.paper-item.entering {
  z-index: 10;
  transition: transform 0.1s linear, opacity 0.1s linear;
}

.paper-item.hidden {
  opacity: 0;
  pointer-events: none;
}

.paper-resize-enter-active,
.paper-resize-leave-active {
  transition: all 1s ease;
}

.paper-resize-enter-from {
  opacity: 0;
  transform: scale(0.5);
}

.paper-resize-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>

