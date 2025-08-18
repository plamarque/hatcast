<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[90] p-0 md:p-4" @click="emit('close')">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col" @click.stop>
      <div class="relative p-6 pb-4 border-b border-white/10">
        <button @click="emit('close')" title="Fermer" class="absolute right-3 top-3 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-2xl">❓</div>
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-white">Comment fonctionne la sélection automatique ?</h2>
            <p class="text-sm text-blue-300">Tirage au sort pondéré pour favoriser l'équité</p>
          </div>
        </div>
      </div>

      <div class="px-4 md:px-6 py-4 md:py-6 overflow-y-auto space-y-4 text-gray-200">
        <div class="bg-white/5 border border-white/10 rounded-lg p-4">
          <h3 class="text-white font-semibold mb-2">En bref</h3>
          <p>On tire au sort uniquement parmi les personnes <span class="text-green-300">disponibles</span>. Ceux qui ont <span class="text-purple-300">moins joué</span> ont plus de chances d'être tirés. À long terme, tout le monde joue à peu près autant.</p>
        </div>

        <div class="space-y-3">
          <h3 class="text-white font-semibold">Détails du tirage</h3>
          <ol class="list-decimal list-inside space-y-2 text-gray-300">
            <li><span class="text-white">Qui participe ?</span> Toutes les personnes marquées « ✅ Disponible » pour l’événement.</li>
            <li><span class="text-white">Un coup de pouce aux moins joués</span> : si vous avez moins joué récemment, le tirage vous favorise un peu plus.</li>
            <li><span class="text-white">Comment se fait le tirage ?</span> On tire un nom au hasard en tenant compte de cet avantage, on le met de côté, puis on recommence jusqu’à avoir assez de joueurs.</li>
            <li><span class="text-white">Si on relance</span> : on garde les joueurs encore disponibles et on complète seulement les places manquantes.</li>
            <li><span class="text-white">Indisponibles</span> : ils ne sont jamais tirés au sort.</li>
          </ol>
        </div>

        <div class="space-y-2">
          <h3 class="text-white font-semibold">Estimation des chances</h3>
          <p>L’application peut afficher un pourcentage indicatif pour aider à comprendre : si Alice a moins joué que Bob, elle aura un pourcentage plus élevé. C’est une indication, pas une promesse : deux tirages peuvent donner des résultats différents.</p>
        </div>

        <div class="space-y-2">
          <h3 class="text-white font-semibold">Pourquoi c’est juste</h3>
          <ul class="list-disc list-inside space-y-1 text-gray-300">
            <li>Ceux qui ont moins joué ont automatiquement plus de chances.</li>
            <li>Après une sélection, vos chances diminuent un peu pour laisser la place aux autres.</li>
            <li>Sur la durée, les sélections s’<span class="text-green-300">équilibrent naturellement</span>.</li>
          </ul>
        </div>

        <div class="space-y-2">
          <h3 class="text-white font-semibold">Exemples rapides</h3>
          <p>
            • Alice n’a encore jamais été sélectionnée, Bob a été sélectionné une fois, Charlie plusieurs fois. Pour 1 place, on aura environ : Alice 57 %, Bob 29 %, Charlie 14 %.<br/>
            • S’il y a 2 places, les chances de chacun augmentent, mais l’ordre reste aléatoire : un tirage peut donner Alice + Bob, un autre Alice + Charlie.
          </p>
        </div>

        <div class="text-xs text-gray-400">
          Remarque : l’algorithme favorise l’équité à long terme, mais <span class="text-gray-300">n’assure pas</span> une rotation parfaite à chaque événement.
        </div>
      </div>

      <div class="sticky bottom-0 p-3 bg-gray-900/95 border-t border-white/10 backdrop-blur-sm flex justify-end">
        <button @click="emit('close')" class="h-10 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600">Compris</button>
      </div>
    </div>
  </div>
  
</template>

<script setup>
const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])
</script>


