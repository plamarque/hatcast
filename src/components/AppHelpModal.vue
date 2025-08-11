<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[95] p-0 md:p-4" @click="emit('close')">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col" @click.stop>
      <div class="relative p-6 pb-4 border-b border-white/10">
        <button @click="emit('close')" title="Fermer" class="absolute right-3 top-3 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-2xl">🎭</div>
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-white">Bienvenue dans Impro Pick</h2>
            <p class="text-sm text-purple-300">L'appli impro pour organiser saisons, événements et sélections</p>
          </div>
        </div>
      </div>

      <div class="px-4 md:px-6 py-4 md:py-6 overflow-y-auto space-y-4 text-gray-200">
        <div class="bg-white/5 border border-white/10 rounded-lg p-4">
          <h3 class="text-white font-semibold mb-2">À quoi ça sert ?</h3>
          <p>
            Impro Pick vous aide à gérer vos spectacles d'impro&nbsp;: saisons, événements, joueurs, disponibilités,
            tirage au sort équitable et annonces. Fini les prises de tête&nbsp;: indiquez qui est dispo, et laissez le hasard pondéré faire le reste.
          </p>
        </div>

        <div class="space-y-3">
          <h3 class="text-white font-semibold">Fonctionnalités principales</h3>
          <ul class="list-disc list-inside space-y-2 text-gray-300">
            <li><span class="text-white">Saisons</span>&nbsp;: regroupez vos événements par saison pour garder un historique clair.</li>
            <li><span class="text-white">Événements</span>&nbsp;: créez des dates avec un titre et un nombre de joueurs à sélectionner; archivez-les quand ils sont passés.</li>
            <li><span class="text-white">Joueurs</span>&nbsp;: gérez la liste des joueurs et leurs informations.</li>
            <li><span class="text-white">Indication de disponibilité</span>&nbsp;: Oui/Non/Peut‑être via liens magiques ou directement dans la grille.</li>
            <li><span class="text-white">Sélection automatique</span>&nbsp;: tirage au sort pondéré qui favorise l'équité sur la durée.</li>
            <li><span class="text-white">Protection des saisies</span>&nbsp;: PIN de saison pour sécuriser les actions sensibles, mot de passe possible pour certains joueurs.</li>
            <li><span class="text-white">Notifications</span>&nbsp;: annoncez un événement (email/lien) pour collecter facilement les disponibilités.</li>
          </ul>
        </div>

        

        <div class="space-y-2 text-sm text-gray-300">
          <h3 class="text-white font-semibold">Astuces</h3>
          <ul class="list-disc list-inside space-y-1">
            <li>Sur mobile, faites glisser horizontalement pour parcourir les événements.</li>
            <li>Le bouton ⚠️ dans les en-têtes signale qu'un événement est prêt pour une sélection ou nécessite votre attention.</li>
          </ul>
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


