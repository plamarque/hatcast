<template>
  <div class="mt-4">
    <button
      @click="isExpanded = !isExpanded"
      class="w-full p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all duration-200 flex items-center justify-between"
    >
      <h3 class="text-sm font-semibold text-blue-300">💡 A quoi sert un compte ?</h3>
      <span class="text-blue-300 transition-transform duration-200" :class="{ 'rotate-180': isExpanded }">▼</span>
    </button>
    <div
      v-if="isExpanded"
      class="mt-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg text-sm text-gray-300 space-y-2"
    >
      <div class="text-gray-300">Ça fonctionne très bien sans compte. Mais si vous en créez un, vous aurez quelques trucs sympas en plus :</div>
      <div>• <span class="text-blue-300">Protégez vos saisies :</span> vous êtes sûr que personne n'a changé vos dispos car vous êtes le seul à pouvoir les modifier</div>
      <div>• <span class="text-blue-300">Notifications :</span> nouveaux spectacles, disponibilités et sélections dans votre boite mail</div>
      <div>• <span class="text-blue-300">Saisie simplifiée :</span> votre joueur reste toujours en haut de la liste</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isExpanded = ref(false)
</script>


