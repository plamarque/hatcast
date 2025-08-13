<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[95] p-0 md:p-4" @click="emit('close')">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col" @click.stop>
      <div class="relative p-6 pb-4 border-b border-white/10">
        <button @click="emit('close')" title="Fermer" class="absolute right-3 top-3 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-2xl">❓</div>
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-white">Kezako ?</h2>
            <p class="text-sm text-purple-300">L'appli pour sélectionner les joueurs d'impro de manière simple et apaisée</p>
          </div>
        </div>
      </div>

      <div class="px-4 md:px-6 py-4 md:py-6 overflow-y-auto space-y-4 text-gray-200">
        <div class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
          <h3 class="text-white font-semibold">C'est quoi ?</h3>
          <p>
            Tu joues quand ? est une appli conçue pour faciliter <span class="text-white">la sélection des joueurs d'impro</span> pour les spectacles.
            L'idée est née au sein de <span class="text-purple-300">La Malice</span> pour <span class="text-white">dépersonnaliser une tâche délicate</span> qui créait des tensions depuis des années.
          </p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
          <h3 class="text-white font-semibold">Comment ça marche</h3>
          <p>
            L'asso déclare ses dates et le nombre de personnes nécessaires. Les joueurs indiquent leurs disponibilités. L'appli propose des sélections.
          </p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
          <h3 class="text-white font-semibold">Sélection auto ou manuelle</h3>
          <p>
            Le <span class="text-white">mode sélection auto</span> s'appuie sur le hasard (pondéré) pour simplifier la vie. Vous pouvez aussi repasser en mode <span class="text-white">manuel</span> si besoin.
          </p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
          <h3 class="text-white font-semibold">Pensée mobile • Libre d'utilisation</h3>
          <p>
            L'appli est <span class="text-white">pensée pour le mobile</span> et peut être utilisée librement par La Malice ou <span class="text-white">toute autre troupe</span>.
          </p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
          <h3 class="text-white font-semibold">Comptes (facultatif)</h3>
          <p>
            Les joueurs qui le souhaitent peuvent créer un compte via leur email pour <span class="text-white">recevoir des notifications</span>,
            <span class="text-white">protéger leurs saisies</span> et bénéficier d'un meilleur confort d'utilisation.
          </p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2 text-sm">
          <h3 class="text-white font-semibold">Statut & licence</h3>
          <p>
            Application <span class="text-white">en cours de développement</span>, <span class="text-white">sans garanties</span> à ce stade. Licence libre <span class="text-white">MIT</span>.
          </p>
          <p>Contact & retours : <a href="mailto:contact@hatcast.app" class="text-blue-300 underline">contact@hatcast.app</a></p>
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


