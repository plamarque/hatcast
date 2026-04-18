<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[1400] p-0 md:p-4" @click="emit('close')">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col" @click.stop>
      <div class="relative p-6 pb-4 border-b border-white/10">
        <button @click="emit('close')" title="Fermer" class="absolute right-3 top-3 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-2xl">❓</div>
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-white">Comment fonctionne le tirage au sort ?</h2>
          </div>
        </div>
      </div>

      <div class="px-4 md:px-6 py-4 md:py-6 overflow-y-auto space-y-4 text-gray-200">
        <div class="bg-white/5 border border-white/10 rounded-lg p-4">
          <h3 class="text-white font-semibold mb-2">En bref</h3>
          <p>On tire au sort parmi les personnes disponibles pour chaque place disponible, avec un petit ajustement des chances pour l'équité.</p>
        </div>

        <div class="space-y-3">
          <p class="text-gray-300">Pour illustrer le principe en 5 étapes, voici un exemple avec 5 personnes disponibles et 2 places à pourvoir.</p>
          <ChanceExplanationSlides :explanation-data="exampleExplanationData" />
        </div>

        <div class="space-y-3">
          <h3 class="text-white font-semibold">Détails du tirage multi-rôles</h3>
          <ol class="list-decimal list-inside space-y-2 text-gray-300">
            <li><span class="text-white">Qui participe ?</span> Toutes les personnes marquées « ✅ Disponible » pour l'événement et le rôle concerné.</li>
            <li><span class="text-white">Ordre de priorité</span> : Les rôles sont tirés dans l'ordre : Arbitre → DJ → MC → Joueurs → Assistants → Coach → Régisseur → Lumière → Bénévoles.</li>
            <li><span class="text-white">Ajustement pour l'équité</span> : dans le but de renforcer l'équité dans le temps, les personnes qui ont le moins occupé le rôle par le passé reçoivent un petit bonus pour le tirage au sort.</li>
            <li><span class="text-white">Comment se fait le tirage ?</span> Pour chaque rôle, on tire au hasard une personne disponible en tenant compte de cet avantage, puis on passe au rôle suivant.</li>
            <li><span class="text-white">Une personne, un rôle</span> : Une fois sélectionnée pour un rôle, la personne n'est plus disponible pour les autres rôles.</li>
            <li><span class="text-white">En cas de relance du tirage</span> : on efface toute la sélection et on recommence un tirage.</li>
            <li><span class="text-white">Les déplacements comptent à part</span> : si vous avez fait un déplacement, ça ne compte pas dans vos participations pour un spectacle local.</li>
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
          <p class="text-sm text-gray-400">Bénévole est un rôle obligatoire : si t'es dispo pour jouer, t'es dispo pour aider.</p>
        </div>

        <div class="space-y-2">
          <h3 class="text-white font-semibold">Estimation des chances</h3>
          <p>L'application affiche un % à côté des noms des personnes disponibles. C'est une estimation des chances qu'elles ont d'être tirées au sort. Comme il y a une part de hasard, ce n'est qu'une indication, pas une promesse : deux tirages peuvent donner des résultats différents.</p>
        </div>

        <div class="space-y-2">
          <h3 class="text-white font-semibold">Pourquoi c'est équitable ?</h3>
          <ul class="list-disc list-inside space-y-1 text-gray-300">
            <li>Après une sélection, vos chances peuvent baisser pour ce rôle spécifique par rapport aux autres personnes, mais pas pour les autres rôles.</li>
            <li>Chaque rôle a son propre compteur de sélection : être sélectionné comme DJ n'affecte pas tes chances d'être sélectionné comme Joueur.</li>
            <li>Sur la durée, les nombres de participations tendent à s'équilibrer naturellement pour chaque rôle.</li>
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
import ChanceExplanationSlides from './ChanceExplanationSlides.vue'

defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const exampleExplanationData = {
  availableCount: 5,
  requiredCount: 2,
  theoreticalSimpleChance: 40
}
</script>


