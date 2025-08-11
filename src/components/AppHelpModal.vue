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
          <h3 class="text-white font-semibold">Par où commencer</h3>
          <ol class="list-decimal list-inside space-y-2 text-gray-300">
            <li><span class="text-white">Créer une saison</span>&nbsp;: depuis l'accueil, cliquez «&nbsp;Nouvelle saison&nbsp;» et définissez un code PIN (4 chiffres) pour protéger les actions sensibles.</li>
            <li><span class="text-white">Ajouter des joueurs</span>&nbsp;: dans la grille, utilisez «&nbsp;Ajouter un joueur&nbsp;».</li>
            <li><span class="text-white">Créer des événements</span>&nbsp;: «&nbsp;Ajouter un événement&nbsp;», choisissez la date, le titre et le nombre de joueurs.</li>
            <li><span class="text-white">Inviter les joueurs</span>&nbsp;: ouvrez un événement et cliquez «&nbsp;Annoncer&nbsp;» pour envoyer des liens magiques (email/copie) afin qu'ils indiquent leur disponibilité.</li>
            <li><span class="text-white">Lancer la sélection</span>&nbsp;: quand il y a assez de «&nbsp;✅ Disponible&nbsp;», cliquez «&nbsp;Sélection Auto&nbsp;» pour tirer au sort de façon équitable.</li>
          </ol>
        </div>

        <div class="space-y-2">
          <h3 class="text-white font-semibold">Liens magiques et disponibilités</h3>
          <p>
            Les joueurs reçoivent un lien unique pour répondre «&nbsp;Oui/Non/Peut-être&nbsp;». Vous pouvez aussi mettre à jour leurs disponibilités directement dans la grille.
          </p>
        </div>

        <div class="space-y-2">
          <h3 class="text-white font-semibold">Sécurité et protections</h3>
          <ul class="list-disc list-inside space-y-1 text-gray-300">
            <li><span class="text-white">PIN de saison</span>&nbsp;: requis pour supprimer/modifier des éléments sensibles.</li>
            <li><span class="text-white">Protection joueur</span>&nbsp;: vous pouvez protéger un joueur par mot de passe pour éviter les modifications non souhaitées.</li>
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


