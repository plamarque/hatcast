<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[1400] p-0 md:p-4" @click="emit('close')">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col" @click.stop>
      <div class="relative p-6 pb-4 border-b border-white/10">
        <button @click="emit('close')" title="Fermer" class="absolute right-3 top-3 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-2xl">❓</div>
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-white">Comment fonctionne la composition automatique ?</h2>
            <p class="text-sm text-blue-300">Tirage au sort pondéré pour favoriser l'équité</p>
          </div>
        </div>
      </div>

      <div class="px-4 md:px-6 py-4 md:py-6 overflow-y-auto space-y-4 text-gray-200">
        <div class="bg-white/5 border border-white/10 rounded-lg p-4">
          <h3 class="text-white font-semibold mb-2">En bref</h3>
          <p>On tire au sort uniquement parmi les personnes <span class="text-green-300">disponibles</span> pour chaque rôle. Ceux qui ont <span class="text-purple-300">moins joué</span> ont plus de chances d'être tirés. Les rôles critiques (Arbitre, DJ, MC) sont tirés en priorité.</p>
        </div>

        <div class="space-y-3">
          <h3 class="text-white font-semibold">Détails du tirage multi-rôles</h3>
          <ol class="list-decimal list-inside space-y-2 text-gray-300">
            <li><span class="text-white">Qui participe ?</span> Toutes les personnes marquées « ✅ Disponible » pour l'événement et le rôle concerné.</li>
            <li><span class="text-white">Ordre de priorité</span> : Les rôles sont tirés dans l'ordre : Arbitre → DJ → MC → Joueurs → Assistants → Coach → Régisseur → Éclairagiste → Bénévoles.</li>
            <li><span class="text-white">Un coup de pouce aux moins joués</span> : si vous avez moins joué récemment pour ce rôle, le tirage vous favorise un peu plus.</li>
            <li><span class="text-white">Comment se fait le tirage ?</span> Pour chaque rôle, on tire au hasard en tenant compte de cet avantage, on met de côté, puis on passe au rôle suivant.</li>
            <li><span class="text-white">Une personne, un rôle</span> : Une fois sélectionnée pour un rôle, la personne n'est plus disponible pour les autres rôles.</li>
            <li><span class="text-white">Si on relance</span> : on garde les joueurs encore disponibles et on complète seulement les places manquantes.</li>
            <li><span class="text-white">Indisponibles</span> : ils ne sont jamais tirés au sort.</li>
          </ol>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
          <h3 class="text-white font-semibold">Pourquoi cet ordre de priorité ?</h3>
          <p>Les rôles critiques sont tirés en premier pour garantir que le spectacle puisse avoir lieu :</p>
          <ul class="list-disc list-inside space-y-1 text-gray-300">
            <li><span class="text-white">Arbitre</span> : Essentiel pour les matchs</li>
            <li><span class="text-white">DJ et MC</span> : Critiques pour l'ambiance du spectacle</li>
            <li><span class="text-white">Joueurs</span> : Le cœur du spectacle</li>
            <li><span class="text-white">Autres rôles</span> : Importants mais moins critiques</li>
          </ul>
          <p class="text-sm text-gray-400">Même si certains rôles secondaires ne peuvent pas être pourvus, le spectacle peut toujours avoir lieu grâce aux rôles prioritaires.</p>
        </div>

        <div class="space-y-2">
          <h3 class="text-white font-semibold">Estimation des chances</h3>
          <p>L'application peut afficher un pourcentage indicatif pour aider à comprendre : si Alice a moins joué que Bob pour un rôle, elle aura un pourcentage plus élevé. C'est une indication, pas une promesse : deux tirages peuvent donner des résultats différents.</p>
        </div>

        <div class="space-y-2">
          <h3 class="text-white font-semibold">Pourquoi c'est juste</h3>
          <ul class="list-disc list-inside space-y-1 text-gray-300">
            <li>Ceux qui ont moins joué pour un rôle ont automatiquement plus de chances pour ce rôle.</li>
            <li>Après une composition, vos chances diminuent un peu pour ce rôle spécifique, mais pas pour les autres rôles.</li>
            <li>Chaque rôle a sa propre logique de tirage : être sélectionné comme DJ n'affecte pas tes chances d'être sélectionné comme Joueur.</li>
            <li>Sur la durée, les compositions s'<span class="text-green-300">équilibrent naturellement</span> pour chaque rôle.</li>
          </ul>
        </div>

        <div class="space-y-2">
          <h3 class="text-white font-semibold">Exemples rapides</h3>
          <p>
            • <span class="text-white">Pour le rôle DJ</span> : Alice n'a jamais été DJ, Bob l'a été une fois, Charlie plusieurs fois. Pour 1 place DJ : Alice 57 %, Bob 29 %, Charlie 14 %.<br/>
            • <span class="text-white">Ordre de tirage</span> : D'abord l'Arbitre (si nécessaire), puis le DJ, puis le MC, puis les Joueurs, etc.<br/>
            • <span class="text-white">Une personne, un rôle</span> : Si Alice est tirée comme DJ, elle ne peut plus être tirée pour les autres rôles de ce spectacle.
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


