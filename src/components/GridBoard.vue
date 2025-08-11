<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <!-- Header avec titre de la saison -->
    <div ref="pageHeaderRef" class="sticky top-0 z-[70] text-center py-4 md:py-6 px-4 relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900/95 backdrop-blur-sm border-b border-white/10">
      <!-- Flèche de retour -->
      <button 
        @click="goBack"
        class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
        title="Retour à l'accueil"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      
      <h1 class="text-4xl font-bold text-white mb-0 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
        {{ seasonName ? seasonName : 'Chargement...' }}
      </h1>
      
      <!-- Bouton d'affichage des événements archivés -->
      <button
        @click="toggleShowArchived"
        class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
        :title="showArchived ? 'Masquer les événements archivés' : 'Afficher les événements archivés'"
      >
        <span class="text-2xl">{{ showArchived ? '📂' : '📁' }}</span>
      </button>
    </div>

    <div class="w-full px-0 md:px-0 pb-0 pt-[72px] md:pt-[80px] -mt-[72px] md:-mt-[80px] bg-gray-900">
      <!-- Sticky header bar outside horizontal scroller (sync with scrollLeft) -->
      <div ref="headerBarRef" class="sticky top-0 z-[80] bg-gray-900 overflow-hidden">
        <div class="flex items-stretch relative">
          <!-- Left sticky cell -->
          <div class="col-left flex-shrink-0 p-3 md:p-4 sticky left-0 z-[81] bg-gray-900 h-full">
            <div class="flex items-center justify-center h-full gap-2">
              <button
                @click="openNewEventForm"
                class="flex items-center space-x-2 px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base font-medium"
                title="Ajouter un nouvel événement"
              >
                <span class="text-lg">➕</span>
                <span class="hidden sm:inline">Ajouter un événement</span>
                <span class="sm:hidden">Événement</span>
              </button>
            </div>
          </div>
          <!-- Event headers -->
          <div class="flex-1 overflow-hidden">
            <div ref="headerEventsRef" class="flex relative z-[60]" :style="{ transform: `translateX(-${headerScrollX}px)` }">
              <div
                v-for="event in displayedEvents"
                :key="'h-'+event.id"
                :data-event-id="event.id"
                class="col-event flex-shrink-0 p-3 text-center cursor-pointer"
                @click="showEventDetails(event)"
              >
                <div class="header-date text-[16px] md:text-base text-gray-300" :title="formatDateFull(event.date)">{{ formatDate(event.date) }}</div>
                <div class="header-title text-[22px] md:text-2xl leading-snug text-white text-center clamp-2" :title="event.title">
                  {{ event.title || 'Sans titre' }}
                </div>
                <div v-if="event.archived" class="mt-1 text-xs text-gray-400">(Archivé)</div>
                <div 
                  v-if="hasEventWarning(event.id)"
                  class="mt-1 w-4 h-4 bg-yellow-500 rounded-full mx-auto flex items-center justify-center hover:bg-yellow-400 transition-colors duration-200"
                  :title="getEventTooltip(event.id) + ' - Cliquez pour ouvrir la sélection'"
                  @click.stop="openSelectionModal(event)"
                >
                  <span class="text-xs text-white font-bold">⚠️</span>
                </div>
                <div 
                  v-else-if="getEventStatus(event.id).type === 'ready'"
                  class="mt-1 w-4 h-4 bg-green-500 rounded-full mx-auto flex items-center justify-center hover:bg-green-400 transition-colors duration-200"
                  :title="getEventTooltip(event.id) + ' - Cliquez pour ouvrir la sélection'"
                  @click.stop="openSelectionModal(event)"
                >
                  <span class="text-xs text-white font-bold">🎲</span>
                </div>
              </div>
            </div>
          </div>
          <!-- Right spacer (keeps end alignment) -->
          <div class="col-right flex-shrink-0 p-3 sticky right-0 z-[81] bg-gray-900 h-full"></div>

          <!-- Horizontal scroll chevrons -->
          <button
            v-show="showLeftHint"
            @click.prevent="scrollHeaderBy(-1)"
            class="absolute left-2 bottom-2 w-9 h-9 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-[85] backdrop-blur-sm"
            title="Événements précédents — cliquez pour défiler"
          >
            ‹
          </button>
          <button
            v-show="showRightHint"
            @click.prevent="scrollHeaderBy(1)"
            class="absolute right-2 bottom-2 w-9 h-9 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-[85] backdrop-blur-sm"
            title="Événements suivants — cliquez pour défiler"
          >
            ›
          </button>
        </div>
      </div>

      <div
        v-show="!isLoadingGrid"
        ref="gridboardRef"
        class="gridboard overflow-x-auto bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-indigo-900/50"
      >
        <table class="table-auto border-separate border-spacing-0 table-fixed w-full min-w-max">
          <colgroup>
            <col class="col-left" />
            <col v-for="(event, index) in displayedEvents" :key="'c'+index" class="col-event" />
            <col class="col-right" />
          </colgroup>
          <thead class="hidden"></thead>
          <tbody>
            <tr
              v-for="player in sortedPlayers"
              :key="player.id"
              class="border-b border-white/10 hover:bg-white/5 transition-all duration-200"
              :data-player-id="player.id"
              :class="{ 'highlighted-player': player.id === highlightedPlayer }"
            >
              <td class="p-4 md:p-5 font-medium text-white relative group text-xl md:text-2xl sticky left-0 z-40 bg-gray-900">
                <div class="font-bold text-xl md:text-2xl whitespace-pre-wrap flex items-center">
                  <span 
                    v-if="isPlayerProtectedInGrid(player.id)"
                    class="text-yellow-400 mr-1 text-sm"
                    title="Joueur protégé par mot de passe"
                  >
                    🔒
                  </span>
                  <span 
                    @click="showPlayerDetails(player)" 
                     class="player-name hover:border-b-2 hover:border-dashed hover:border-purple-400 cursor-pointer transition-colors duration-200 text-[22px] md:text-2xl leading-tight"
                    :title="'Cliquez pour voir les détails : ' + player.name"
                  >
                    {{ player.name }}
                  </span>
                </div>
              </td>

              <td
                v-for="event in displayedEvents"
                :key="event.id"
                :data-event-id="event.id"
                class="p-0"
              >
                <AvailabilityCell
                  :player-name="player.name"
                  :event-id="event.id"
                  :is-available="isAvailable(player.name, event.id)"
                   :is-selected="isSelected(player.name, event.id)"
                   :chance-percent="chances[player.name]?.[event.id] ?? null"
                   :show-selected-chance="isSelectionComplete(event.id)"
                  @toggle="toggleAvailability"
                />
              </td>
              <td class="p-3 md:p-4"></td>
            </tr>
            <!-- Dernière ligne: ajouter un joueur -->
            <tr class="border-t border-white/10">
              <td class="p-4 md:p-5 sticky left-0 z-40 bg-gray-900">
                <div class="flex items-center">
                  <button
                    @click="newPlayerForm = true"
                    class="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 text-sm md:text-base font-medium"
                    title="Ajouter un nouveau joueur"
                  >
                    <span class="text-lg">➕</span>
                    <span class="hidden sm:inline">Ajouter un joueur</span>
                    <span class="sm:hidden">Joueur</span>
                  </button>
                </div>
              </td>
              <td
                v-for="event in displayedEvents"
                :key="'add-row-'+event.id"
                :data-event-id="event.id"
                class="p-3 md:p-5"
              ></td>
              <td class="p-3 md:p-4"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Indicateurs legacy supprimés (remplacés par chevrons flottants) -->
    </div>
  </div>

  <!-- Overlay de chargement pleine page -->
  <div v-if="isLoadingGrid" class="fixed inset-0 z-[120] flex items-center justify-center bg-gray-950/80 backdrop-blur-sm">
    <div class="text-center">
      <div class="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 animate-pulse mx-auto mb-6 flex items-center justify-center shadow-2xl">
        <span class="text-3xl">🎭</span>
      </div>
      <p class="text-white text-lg">Préparation de la grille…</p>
      <p class="text-white/70 text-sm mt-1">Un instant</p>
    </div>
  </div>

  

  <!-- Message de succès -->
  <div v-if="showSuccessMessage" class="fixed bottom-4 left-4 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-2xl border border-green-400/30 backdrop-blur-sm z-50">
    <div class="flex items-center space-x-2">
      <span class="text-xl">✨</span>
      <span>{{ successMessage }}</span>
    </div>
  </div>

  <!-- Message d'erreur -->
  <div v-if="showErrorMessage" class="fixed bottom-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl shadow-2xl border border-red-400/30 backdrop-blur-sm z-50">
    <div class="flex items-center space-x-2">
      <span class="text-xl">⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>
  </div>

  <!-- Modales -->
  <div v-if="newEventForm" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-white text-center">✨ Nouvel événement</h2>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Titre</label>
        <input
          v-model="newEventTitle"
          type="text"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
          placeholder="Titre de l'événement"
        >
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Date</label>
        <input
          v-model="newEventDate"
          type="date"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
        >
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          v-model="newEventDescription"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
          rows="3"
          placeholder="Description de l'événement (optionnel)"
        ></textarea>
      </div>
      <div class="mb-6 flex items-center gap-3">
        <input id="new-archived" type="checkbox" v-model="newEventArchived" class="w-4 h-4" />
        <label for="new-archived" class="text-sm font-medium text-gray-300">Créer comme archivé</label>
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Nombre de joueurs à sélectionner</label>
        <input
          v-model="newEventPlayerCount"
          type="number"
          min="1"
          max="20"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          placeholder="6"
        >
      </div>
      <div class="flex justify-end space-x-3">
        <button
          @click="cancelNewEvent"
          class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
        >
          Annuler
        </button>
        <button
          @click="createEvent"
          class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
        >
          Créer
        </button>
      </div>
    </div>
  </div>

  <!-- Modale de création de joueur -->
  <div v-if="newPlayerForm" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-white text-center">✨ Nouveau joueur</h2>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Nom</label>
        <input
          v-model="newPlayerName"
          type="text"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
          placeholder="Nom du joueur"
        >
      </div>
      <div class="flex justify-end space-x-3">
        <button
          @click="newPlayerForm = false"
          class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
        >
          Annuler
        </button>
        <button
          @click="addNewPlayer"
          class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
        >
          Ajouter
        </button>
      </div>
    </div>
  </div>

  <!-- Modale de confirmation de suppression -->
  <div v-if="confirmDelete" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">⚠️</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2>
        <p class="text-gray-300">Êtes-vous sûr de vouloir supprimer cet événement ?</p>
      </div>
      <div class="flex justify-end space-x-3">
        <button
          @click="cancelDelete"
          class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
        >
          Annuler
        </button>
        <button
          @click="() => deleteEventConfirmed()"
          class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>

  <!-- Modale de confirmation de suppression de joueur -->
  <div v-if="confirmPlayerDelete" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">⚠️</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2>
        <p class="text-gray-300">Êtes-vous sûr de vouloir supprimer ce joueur ?</p>
      </div>
      <div class="flex justify-end space-x-3">
        <button @click="cancelPlayerDelete" class="px-6 py-3 text-gray-300 hover:text-white transition-colors">Annuler</button>
        <button @click="() => deletePlayerConfirmed()" class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300">Supprimer</button>
      </div>
    </div>
  </div>

  <!-- Modale de confirmation de relance de sélection -->
  <div v-if="confirmReselect" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[95] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">🎭</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2>
        <p class="text-gray-300">Attention, toute la sélection sera refaite en fonction des disponibilités actuelles.</p>
      </div>
      <p class="mb-6 text-sm text-yellow-400 bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/20">
        ⚠️ Pensez à prévenir les gens du changement !
      </p>
      <div class="flex justify-end space-x-3">
        <button @click="cancelTirage" class="px-6 py-3 text-gray-300 hover:text-white transition-colors">Annuler</button>
        <button @click="confirmTirage" class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300">Confirmer</button>
      </div>
    </div>
  </div>



  <!-- Popin de détails de l'événement -->
  <div v-if="showEventDetailsModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[80] p-0 md:p-4" @click="closeEventDetails">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col" @click.stop>
      <!-- Header -->
      <div class="relative text-center p-6 pb-4 border-b border-white/10">
        <button @click="closeEventDetails" title="Fermer" class="absolute right-3 top-3 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
        <div class="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center">
          <span class="text-2xl md:text-3xl">🎭</span>
        </div>
        <h2 class="text-2xl md:text-3xl font-bold text-white mb-1">{{ selectedEvent?.title }}</h2>
        <p class="text-sm md:text-base text-purple-300">{{ formatDateFull(selectedEvent?.date) }}</p>
      </div>

      <!-- Content scrollable -->
      <div class="px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
        <div v-if="selectedEvent?.description" class="mb-4 md:mb-6">
          <p class="text-gray-300 bg-gray-800/50 p-4 rounded-lg border border-gray-600/50">
            {{ selectedEvent.description }}
          </p>
        </div>

        <!-- Stats directes sans titre -->
        <div class="grid grid-cols-3 gap-3 md:gap-4 mb-2 md:mb-4">
          <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-3 md:p-4 rounded-lg border border-purple-500/30">
            <div class="text-xl md:text-2xl font-bold text-white">{{ countAvailablePlayers(selectedEvent?.id) }}</div>
            <div class="text-xs md:text-sm text-gray-300">Disponibles</div>
          </div>
          <div class="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-3 md:p-4 rounded-lg border border-cyan-500/30">
            <div class="text-xl md:text-2xl font-bold text-white">{{ countSelectedPlayers(selectedEvent?.id) }}</div>
            <div class="text-xs md:text-sm text-gray-300">Sélectionnés</div>
          </div>
          <div class="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-3 md:p-4 rounded-lg border border-green-500/30">
            <div class="text-xl md:text-2xl font-bold text-white">{{ selectedEvent?.playerCount || 6 }}</div>
            <div class="text-xs md:text-sm text-gray-300">À sélectionner</div>
          </div>
        </div>

        <!-- Section des disponibilités des joueurs -->
        <div v-if="selectedEvent" class="mb-4 md:mb-6">
          <h3 class="text-lg font-semibold text-white mb-3">Disponibilités des joueurs</h3>
          
          <div class="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
            <!-- En-tête du tableau -->
            <div class="grid grid-cols-12 gap-0 bg-gray-700 border-b border-gray-600">
              <div class="col-span-4 p-3 font-medium text-gray-300">Joueur</div>
              <div class="col-span-8 p-3 font-medium text-gray-300 text-center">Disponibilité</div>
            </div>
            
            <!-- Lignes des joueurs -->
            <div 
              v-for="player in sortedPlayers" 
              :key="player.id"
              class="grid grid-cols-12 gap-0 border-b border-gray-600 last:border-b-0 hover:bg-gray-700/50 transition-colors"
            >
              <div class="col-span-4 p-3 flex items-center">
                <span class="font-medium text-white">{{ player.name }}</span>
                <span v-if="isPlayerProtectedInGrid(player.id)" class="text-yellow-400 ml-2 text-lg" title="Joueur protégé">🔒</span>
              </div>
              
              <div class="col-span-8 p-0">
                <AvailabilityCell
                  :player-name="player.name"
                  :event-id="selectedEvent.id"
                  :is-available="getPlayerAvailabilityForEvent(selectedEvent.id)[player.name]"
                  :is-selected="isPlayerSelected(player.name, selectedEvent.id)"
                  :chance-percent="chances[player.name]?.[selectedEvent.id] ?? null"
                  :show-selected-chance="isSelectionComplete(selectedEvent.id)"
                  @toggle="handleAvailabilityToggle"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Actions desktop -->
        <div class="hidden md:flex justify-center flex-wrap gap-3 mt-4">
          <button @click="startEditingFromDetails" class="px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 flex items-center gap-2">
            <span>✏️</span><span>Modifier</span>
          </button>
          <button 
            @click="openEventAnnounceModal(selectedEvent)" 
            :disabled="selectedEvent?.archived"
            class="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600" 
            :title="selectedEvent?.archived ? 'Impossible d\'annoncer un événement archivé' : 'Annoncer l\'événement aux joueurs (email, copie, WhatsApp)'"
          >
            <span>📢</span><span>Annoncer</span>
          </button>
          <button @click="toggleEventArchived" class="px-5 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg hover:from-indigo-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2" :title="selectedEvent?.archived ? 'Désarchiver cet événement' : 'Archiver cet événement'">
            <span>{{ selectedEvent?.archived ? '📂' : '📁' }}</span><span>{{ selectedEvent?.archived ? 'Désarchiver' : 'Archiver' }}</span>
          </button>
          <button @click="openSelectionModal(selectedEvent)" class="px-5 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2" title="Gérer la sélection">
            <span>🎭</span><span>Sélectionner</span>
          </button>
          <button @click="confirmDeleteEvent(selectedEvent?.id)" class="px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2">
            <span>🗑️</span><span>Supprimer</span>
          </button>
          <button @click="closeEventDetailsAndUpdateUrl" class="px-5 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300">Fermer</button>
        </div>

        <!-- More actions (mobile) -->
        <div v-if="showEventMoreActions" class="md:hidden mt-3 space-y-2">
          <button @click="startEditingFromDetails(); showEventMoreActions=false" class="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-white/10">✏️ Modifier</button>
          <button 
            @click="openEventAnnounceModal(selectedEvent); showEventMoreActions=false" 
            :disabled="selectedEvent?.archived"
            class="w-full px-4 py-3 rounded-lg bg-amber-600/20 text-amber-200 border border-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600" 
            :title="selectedEvent?.archived ? 'Impossible d\'annoncer un événement archivé' : 'Annoncer l\'événement aux joueurs (email, copie, WhatsApp)'"
          >
            <span>📢</span><span>Annoncer</span>
          </button>
          <button @click="toggleEventArchived(); showEventMoreActions=false" class="w-full px-4 py-3 rounded-lg bg-indigo-600/20 text-indigo-200 border border-indigo-500/30">{{ selectedEvent?.archived ? '📂 Désarchiver' : '📁 Archiver' }}</button>
          <button @click="confirmDeleteEvent(selectedEvent?.id); showEventMoreActions=false" class="w-full px-4 py-3 rounded-lg bg-red-600/20 text-red-200 border border-red-500/30">🗑️ Supprimer</button>
        </div>
      </div>

      <!-- Footer sticky (mobile) -->
      <div class="md:hidden sticky bottom-0 w-full p-3 bg-gray-900/95 border-t border-white/10 backdrop-blur-sm flex items-center gap-2">
        <button @click="openSelectionModal(selectedEvent)" class="h-12 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex-[1.4]">🎭 Sélectionner</button>
        <button @click="closeEventDetailsAndUpdateUrl" class="h-12 px-4 bg-gray-700 text-white rounded-lg flex-1">Fermer</button>
        <button @click="showEventMoreActions = !showEventMoreActions" class="h-12 px-4 bg-gray-700 text-white rounded-lg flex items-center justify-center w-12">⋯</button>
      </div>
    </div>
  </div>

  <!-- Modal de vérification du mot de passe pour joueur protégé -->
  <PasswordVerificationModal
    :show="showPasswordVerification"
    :player="passwordVerificationPlayer"
    :seasonId="seasonId"
    @close="showPasswordVerification = false"
    @verified="handlePasswordVerified"
  />

  <!-- Modal d'édition d'événement -->
  <div v-if="editingEvent" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-white text-center">✏️ Modifier l'événement</h2>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Titre</label>
        <input
          v-model="editingTitle"
          type="text"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
          @keydown.esc="cancelEdit"
          @keydown.enter="saveEdit"
          ref="editTitleInput"
        >
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Date</label>
        <input
          v-model="editingDate"
          type="date"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          @keydown.esc="cancelEdit"
          @keydown.enter="saveEdit"
        >
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          v-model="editingDescription"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
          rows="3"
          placeholder="Description de l'événement (optionnel)"
          @keydown.esc="cancelEdit"
        ></textarea>
      </div>
      <div class="mb-6 flex items-center gap-3">
        <input id="edit-archived" type="checkbox" v-model="editingArchived" class="w-4 h-4" />
        <label for="edit-archived" class="text-sm font-medium text-gray-300">Archiver cet événement</label>
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Nombre de joueurs à sélectionner</label>
        <input
          v-model="editingPlayerCount"
          type="number"
          min="1"
          max="20"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          @keydown.esc="cancelEdit"
        >
      </div>
      <div class="flex justify-end space-x-3">
        <button
          @click="cancelEdit"
          class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
        >
          Annuler
        </button>
        <button
          @click="saveEdit"
          class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de saisie du PIN -->
  <PinModal
    :show="showPinModal"
    :message="getPinModalMessage()"
    :error="pinErrorMessage"
    :session-info="getSessionInfo()"
    @submit="handlePinSubmit"
    @cancel="handlePinCancel"
  />

  <!-- Modal de vérification du mot de passe du joueur -->
  <div v-if="showPlayerPasswordModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">🔐</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Vérification requise</h2>
        <p class="text-lg text-gray-300">Suppression de joueur protégé</p>
        <p class="text-sm text-gray-400 mt-2">Ce joueur est protégé par mot de passe</p>
      </div>

      <!-- Formulaire de vérification -->
      <div class="mb-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Mot de passe du joueur</label>
            <input
              v-model="playerPasswordInput"
              type="password"
              class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="Entrez le mot de passe"
              @keydown.enter="handlePlayerPasswordSubmit(playerPasswordInput)"
              ref="playerPasswordInputRef"
            >
          </div>
          

        </div>
        
        <button
          @click="handlePlayerPasswordSubmit(playerPasswordInput)"
          :disabled="!playerPasswordInput || playerPasswordLoading"
          class="w-full mt-4 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <span v-if="playerPasswordLoading" class="animate-spin">⏳</span>
          <span v-else>🔓</span>
          <span>{{ playerPasswordLoading ? 'Vérification...' : 'Vérifier et supprimer' }}</span>
        </button>
      </div>

      <!-- Mot de passe oublié -->
      <div class="mb-6 text-center">
        <button
          @click="showPlayerForgotPassword = true"
          class="text-sm text-red-400 hover:text-red-300 transition-colors underline"
        >
          Mot de passe oublié ?
        </button>
      </div>

      <!-- Messages d'erreur -->
      <div v-if="playerPasswordErrorMessage" class="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
        <div class="text-red-300 text-sm">{{ playerPasswordErrorMessage }}</div>
      </div>

      <!-- Actions -->
      <div class="flex justify-center">
        <button
          @click="handlePlayerPasswordCancel"
          class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de vérification du mot de passe pour les disponibilités -->
  <div v-if="showAvailabilityPasswordModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[110] p-0 md:p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 shadow-2xl w-full max-w-md rounded-t-2xl md:rounded-2xl flex flex-col max-h-[90vh]">
      <!-- En-tête -->
      <div class="text-center p-6 pb-4 border-b border-white/10">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center">
          <span class="text-2xl">🔐</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-1">Vérification requise</h2>
        <p class="text-base text-gray-300">Modification de disponibilité</p>
        <p class="text-sm text-gray-400 mt-1">Ce joueur est protégé par mot de passe</p>
      </div>

      <!-- Contenu scrollable -->
      <div class="px-4 pt-3 pb-16 md:px-6 md:pt-4 md:pb-20 overflow-y-auto">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Mot de passe du joueur</label>
            <input
              v-model="availabilityPasswordInput"
              type="password"
              class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="Entrez le mot de passe"
              @keydown.enter="handleAvailabilityPasswordSubmit(availabilityPasswordInput)"
              ref="availabilityPasswordInputRef"
            >
          </div>
        </div>

        <!-- Mot de passe oublié -->
        <div class="mt-2 text-center">
          <button
            @click="showAvailabilityForgotPassword = true"
            class="text-sm text-blue-400 hover:text-blue-300 transition-colors underline"
          >
            Mot de passe oublié ?
          </button>
        </div>

        <!-- Messages d'erreur -->
        <div v-if="availabilityPasswordErrorMessage" class="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div class="text-red-300 text-sm">{{ availabilityPasswordErrorMessage }}</div>
        </div>
      </div>

      <!-- Pied (sticky) -->
      <div class="sticky bottom-0 w-full p-3 md:p-4 bg-gray-900/95 border-t border-white/10 backdrop-blur-sm flex items-center gap-2 pb-[env(safe-area-inset-bottom)]">
        <button
          @click="handleAvailabilityPasswordCancel"
          class="h-12 px-3 md:px-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex-1 text-sm md:text-base whitespace-nowrap"
        >
          Annuler
        </button>
        <button
          @click="handleAvailabilityPasswordSubmit(availabilityPasswordInput)"
          :disabled="!availabilityPasswordInput || availabilityPasswordLoading"
          class="h-12 px-3 md:px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-1 text-sm md:text-base whitespace-nowrap"
        >
          <span v-if="availabilityPasswordLoading" class="animate-spin">⏳</span>
          <span v-else>🔓</span>
          <span>
            {{ availabilityPasswordLoading ? 'Vérification...' : 'Vérifier' }}<span class="hidden sm:inline"> et modifier</span>
          </span>
        </button>
      </div>
    </div>
  </div>

  <!-- Modal mot de passe oublié pour les disponibilités -->
  <div v-if="showAvailabilityForgotPassword" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[120] p-4" @click="showAvailabilityForgotPassword = false">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">📧</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Mot de passe oublié</h2>
        <p class="text-lg text-gray-300">Modification de disponibilité</p>
      </div>

      <div class="mb-6">
        <p class="text-sm text-gray-300 mb-4">
          Un email de réinitialisation sera envoyé à l'adresse associée à ce joueur.
        </p>
        
        <button
          @click="sendAvailabilityResetEmail"
          :disabled="availabilityResetLoading"
          class="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <span v-if="availabilityResetLoading" class="animate-spin">⏳</span>
          <span v-else>📧</span>
          <span>{{ availabilityResetLoading ? 'Envoi...' : 'Envoyer l\'email' }}</span>
        </button>
      </div>

      <!-- Messages -->
      <div v-if="availabilityResetError" class="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
        <div class="text-red-300 text-sm">{{ availabilityResetError }}</div>
      </div>

      <div v-if="availabilityResetSuccess" class="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
        <div class="text-green-300 text-sm">{{ availabilityResetSuccess }}</div>
      </div>

      <!-- Actions -->
      <div class="flex justify-center">
        <button
          @click="showAvailabilityForgotPassword = false"
          class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>

  <!-- Modal mot de passe oublié pour la suppression de joueur -->
  <div v-if="showPlayerForgotPassword" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[120] p-4" @click="showPlayerForgotPassword = false">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">📧</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Mot de passe oublié</h2>
        <p class="text-lg text-gray-300">Suppression de joueur protégé</p>
      </div>

      <div class="mb-6">
        <p class="text-sm text-gray-300 mb-4">
          Un email de réinitialisation sera envoyé à l'adresse associée à ce joueur.
        </p>
        
        <button
          @click="sendPlayerResetEmail"
          :disabled="playerResetLoading"
          class="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <span v-if="playerResetLoading" class="animate-spin">⏳</span>
          <span v-else>📧</span>
          <span>{{ playerResetLoading ? 'Envoi...' : 'Envoyer l\'email' }}</span>
        </button>
      </div>

      <!-- Messages -->
      <div v-if="playerResetError" class="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
        <div class="text-red-300 text-sm">{{ playerResetError }}</div>
      </div>

      <div v-if="playerResetSuccess" class="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
        <div class="text-green-300 text-sm">{{ playerResetSuccess }}</div>
      </div>

      <!-- Actions -->
      <div class="flex justify-center">
        <button
          @click="showPlayerForgotPassword = false"
          class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de détails du joueur -->
  <PlayerModal
    :show="showPlayerModal"
    :player="selectedPlayer"
    :stats="getPlayerStats(selectedPlayer)"
    :seasonId="seasonId"
    @close="closePlayerModal"
    @update="handlePlayerUpdate"
    @delete="handlePlayerDelete"
    @refresh="handlePlayerRefresh"
  />

  <!-- Modal de sélection -->
  <SelectionModal
    ref="selectionModalRef"
    :show="showSelectionModal"
    :event="selectionModalEvent"
    :current-selection="selections[selectionModalEvent?.id] || []"
    :available-count="countAvailablePlayers(selectionModalEvent?.id)"
    :selected-count="countSelectedPlayers(selectionModalEvent?.id)"
    :player-availability="getPlayerAvailabilityForEvent(selectionModalEvent?.id)"
    :season-id="seasonId"
    :season-slug="seasonSlug"
    :players="enrichedPlayers"
    @close="closeSelectionModal"
    @selection="handleSelectionFromModal"
    @perfect="handlePerfectFromModal"
    @send-email-notifications="handleSendEmailNotifications"
  />

  <!-- Modal d'annonce d'événement -->
  <EventAnnounceModal
    :show="showEventAnnounceModal"
    :event="eventToAnnounce"
    :season-id="seasonId"
    :season-slug="seasonSlug"
    :players="enrichedPlayers"
    @close="closeEventAnnounceModal"
    @send-email-notifications="handleSendEmailNotifications"
  />

  <!-- Modal de prompt pour annoncer après création/modification -->
  <div v-if="showAnnouncePrompt" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-6 rounded-2xl shadow-2xl max-w-md">
      <h3 class="text-xl font-bold text-white mb-4 text-center">Voulez-vous annoncer cet événement ?</h3>
      <p class="text-gray-300 text-center mb-6">Envoyer des notifications aux joueurs pour qu'ils indiquent leur disponibilité</p>
      
      <div class="flex gap-3">
        <button
          @click="openEventAnnounceModal(announcePromptEvent)"
          class="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
        >
          📢 Oui
        </button>
        <button
          @click="closeAnnouncePrompt"
          class="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
        >
          Plus tard
        </button>
      </div>
    </div>
  </div>

  
</template>

<style>
.highlighted-player {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3)) !important;
  border: 2px solid rgba(139, 92, 246, 0.5) !important;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3) !important;
}
.highlighted-player * {
  color: white !important;
}

.grid-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.grid-table th,
.grid-table td {
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  word-wrap: break-word;
}

/* Responsivité: adaptation des cellules sur écran réduit */
@media (max-width: 768px) {
  .grid-table th,
  .grid-table td {
    padding: 6px;
    font-size: 0.9em;
  }
}

/* Utilité de clamp multi-lignes si Tailwind line-clamp n'est pas activé */
.clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Largeurs adaptées mobile-first, avec fallback CSS pour Safari iOS */
.col-left { width: 11rem; }
.col-event { width: 15rem; }
.col-right { width: 4.5rem; }

@media (min-width: 640px) { /* sm */
  .col-left { width: 12rem; }
  .col-event { width: 7.5rem; }
  .col-right { width: 3rem; }
}

/* Optimisations de rendu pour grandes grilles */
.gridboard {
  content-visibility: auto;
  contain-intrinsic-size: 800px 600px; /* taille de réserve pour éviter les sauts */
}

/* Forcer des tailles encore plus grandes en très petit viewport (<= 430px) */
@media (max-width: 430px) {
  .header-date { font-size: 18px; }
  .header-title { font-size: 24px; line-height: 1.1; }
  .player-name { font-size: 22px; line-height: 1.1; }
  .col-left { width: 9rem; }
  .col-event { width: 12rem; }
}

/* Mise en évidence de l'événement ciblé - Halo subtil sur toute la colonne */
.focused-event-highlight {
  /* Halo subtil qui entoure chaque élément */
  box-shadow: 0 0 25px rgba(236, 72, 153, 0.4), 0 0 50px rgba(139, 92, 246, 0.3);
  border: 2px solid rgba(236, 72, 153, 0.6);
  border-radius: 8px;
  position: relative;
  z-index: 10;
  /* FORCER LE RECHARGEMENT CSS */
}

/* Effet de halo qui entoure visuellement toute la colonne */
.focused-event-column-start {
  /* Premier élément (en-tête) : halo plus prononcé */
  box-shadow: 0 0 30px rgba(236, 72, 153, 0.5), 0 0 60px rgba(139, 92, 246, 0.4);
  border: 3px solid rgba(236, 72, 153, 0.8);
}

.focused-event-column-end {
  /* Dernier élément (dernière cellule) : halo plus prononcé */
  border: 3px solid rgba(236, 72, 153, 0.8);
}





/* Largeurs adaptées mobile-first, avec fallback CSS pour Safari iOS */
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { collection, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase.js'
import { isPlayerProtected, isPlayerPasswordCached, listProtectedPlayers, getPlayerEmail } from '../services/playerProtection.js'
import { 
  initializeStorage, 
  setStorageMode,
  loadPlayers,
  loadEvents,
  loadAvailability,
  loadSelections,
  deleteEvent,
  updateEvent,
  saveEvent,
  saveAvailability,
  saveSelection
} from '../services/storage.js'

import { createMagicLink } from '../services/magicLinks.js'
import { queueAvailabilityEmail, sendSelectionEmailsForEvent } from '../services/emailService.js'
import { verifySeasonPin, getSeasonPin } from '../services/seasons.js'
import pinSessionManager from '../services/pinSession.js'
import playerPasswordSessionManager from '../services/playerPasswordSession.js'
import AnnounceModal from './AnnounceModal.vue'
import EventAnnounceModal from './EventAnnounceModal.vue'
import PasswordResetModal from './PasswordResetModal.vue'
import PasswordVerificationModal from './PasswordVerificationModal.vue'
import PinModal from './PinModal.vue'
import PlayerModal from './PlayerModal.vue'
import PlayerProtectionModal from './PlayerProtectionModal.vue'
import SelectionModal from './SelectionModal.vue'
import AvailabilityCell from './AvailabilityCell.vue'

// Déclarer les props
const props = defineProps({
  slug: {
    type: String,
    required: true
  },
  eventId: {
    type: String,
    required: false
  }
})

const router = useRouter()
const route = useRoute()

const seasonSlug = props.slug
const seasonName = ref('')
const seasonId = ref('')

const confirmDelete = ref(false)
const eventToDelete = ref(null)
const editingEvent = ref(null)
const editingTitle = ref('')
const editingDate = ref('')
const editingPlayerCount = ref(6)

const newPlayerForm = ref(false)
const newPlayerName = ref('')
const highlightedPlayer = ref(null)
const confirmReselect = ref(false)
const eventIdToReselect = ref(null)

// Variables pour le modal joueur
const showPlayerModal = ref(false)
const selectedPlayer = ref(null)

// Variables pour la protection par PIN
const showPinModal = ref(false)
const pendingOperation = ref(null)
const pinErrorMessage = ref('')

// Variables pour la protection par mot de passe de joueur
const showPlayerPasswordModal = ref(false)
const pendingPlayerOperation = ref(null)
const playerPasswordErrorMessage = ref('')
const playerPasswordInput = ref('')
const playerPasswordLoading = ref(false)
const playerPasswordInputRef = ref(null)

// Variables pour la protection des disponibilités
const showAvailabilityPasswordModal = ref(false)
const pendingAvailabilityOperation = ref(null)
const availabilityPasswordErrorMessage = ref('')
const availabilityPasswordInput = ref('')
const availabilityPasswordLoading = ref(false)
const availabilityPasswordInputRef = ref(null)
const showAvailabilityForgotPassword = ref(false)
const availabilityResetLoading = ref(false)
const availabilityResetError = ref('')
const availabilityResetSuccess = ref('')
const showPlayerForgotPassword = ref(false)
const playerResetLoading = ref(false)
const playerResetError = ref('')
const playerResetSuccess = ref('')

// Variables pour les détails du spectacle
const showEventDetailsModal = ref(false)
const selectedEvent = ref(null)
const editingDescription = ref('')
const editingArchived = ref(false)
const showEventMoreActions = ref(false)

// Variables pour la vérification de mot de passe des joueurs protégés
const showPasswordVerification = ref(false)
const passwordVerificationPlayer = ref(null)
const pendingAvailabilityAction = ref(null) // { playerName, eventId }
const recentlyVerifiedPlayer = ref(null) // Pour éviter la boucle de vérification



// plus de popover pour les en-têtes (on ouvre directement la popin de détails)

// Variables pour la nouvelle popin de sélection
const showSelectionModal = ref(false)
const selectionModalEvent = ref(null)
const selectionModalRef = ref(null)

// Variables pour le modal d'annonce d'événement
const showEventAnnounceModal = ref(false)
const eventToAnnounce = ref(null)
const showAnnouncePrompt = ref(false)
const announcePromptEvent = ref(null)

// Variables pour le modal de désistement
// Désistement modal supprimé: on utilise les magic links "no"

// Variables pour la protection des joueurs
const protectedPlayers = ref(new Set())
const isLoadingGrid = ref(true)

// Variables pour le focus sur un événement spécifique
const focusedEventId = ref(props.eventId || null)
const showFocusedEventHighlight = ref(false)
const focusedEventScrollTimeout = ref(null)

// Watcher pour la prop eventId
watch(() => props.eventId, (newEventId) => {
  if (newEventId) {
    focusedEventId.value = newEventId
    // Attendre que les événements soient chargés avant de faire le focus
    if (events.value.length > 0) {
      focusOnEvent(newEventId)
    } else {
      // Si les événements ne sont pas encore chargés, attendre
      const unwatch = watch(events, (newEvents) => {
        if (newEvents.length > 0) {
          focusOnEvent(newEventId)
          unwatch() // Arrêter de surveiller
        }
      }, { immediate: true })
    }
  }
})

// Computed property pour enrichir les joueurs avec leur statut de protection et email
const enrichedPlayers = computed(() => {
  return players.value.map(player => ({
    ...player,
    isProtected: protectedPlayers.value.has(player.id),
    email: null // Sera chargé à la demande
  }))
})

// Computed property pour l'index de l'événement ciblé
const focusedEventIndex = computed(() => {
  if (!focusedEventId.value) return -1
  return displayedEvents.value.findIndex(e => e.id === focusedEventId.value)
})

// Computed property pour vérifier si l'événement ciblé est visible
const isFocusedEventVisible = computed(() => {
  if (!focusedEventId.value || focusedEventIndex.value === -1) return false
  
  // Sur mobile, vérifier si l'événement ciblé est dans la vue actuelle
  if (window.innerWidth <= 768) {
    const eventElement = document.querySelector(`[data-event-id="${focusedEventId.value}"]`)
    if (eventElement) {
      const rect = eventElement.getBoundingClientRect()
      return rect.left >= 0 && rect.right <= window.innerWidth
    }
  }
  
  return true
})

// Refs et états pour scroll hints et sticky col gauche
const gridboardRef = ref(null)
const showLeftHint = ref(false)
const showRightHint = ref(false)
  const headerScrollX = ref(0)
  const headerBarRef = ref(null)
  const headerEventsRef = ref(null)

function updateScrollHints() {
  const el = gridboardRef.value
  if (!el) return
  const { scrollLeft, scrollWidth, clientWidth } = el
  showLeftHint.value = scrollLeft > 2
  showRightHint.value = scrollLeft < scrollWidth - clientWidth - 2
}

// Fonction pour mettre en évidence un joueur
function highlightPlayer(playerId) {
  highlightedPlayer.value = playerId
  // Scroller automatiquement vers le joueur
  const row = document.querySelector(`[data-player-id="${playerId}"]`)
  if (row) {
    row.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  showSuccessMessage.value = true
  successMessage.value = 'Nouveau joueur ajouté !'
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

// Fonction pour cacher la mise en évidence
function hideHighlight() {
  highlightedPlayer.value = null
}

// Fonction pour vérifier si un joueur est protégé
function isPlayerProtectedInGrid(playerId) {
  return protectedPlayers.value.has(playerId)
}

// Fonction pour charger l'état de protection de tous les joueurs
async function loadProtectedPlayers() {
  if (!seasonId.value) return
  try {
    const protections = await listProtectedPlayers(seasonId.value)
    const next = new Set()
    protections.forEach(p => { if (p.isProtected) next.add(p.playerId || p.id) })
    protectedPlayers.value = next
  } catch (e) {
    // fallback lent mais sûr
    const protectedSet = new Set()
    for (const player of players.value) {
      const isProt = await isPlayerProtected(player.id, seasonId.value)
      if (isProt) protectedSet.add(player.id)
    }
    protectedPlayers.value = protectedSet
  }
}



















const showSuccessMessage = ref(false)
const successMessage = ref('')
const showErrorMessage = ref(false)
const errorMessage = ref('')

async function confirmDeleteEvent(eventId) {
  // Demander le PIN code avant d'afficher la confirmation
  await requirePin({
    type: 'deleteEvent',
    data: { eventId }
  })
}

async function deleteEventConfirmed(eventId = null) {
  const eventIdToDelete = eventId || eventToDelete.value
  console.log('deleteEventConfirmed - eventId param:', eventId)
  console.log('deleteEventConfirmed - eventToDelete.value:', eventToDelete.value)
  console.log('deleteEventConfirmed - eventIdToDelete:', eventIdToDelete)
  console.log('deleteEventConfirmed - type de eventIdToDelete:', typeof eventIdToDelete)
  
  if (!eventIdToDelete) {
    console.error('Aucun événement à supprimer')
    return
  }

  try {
    await deleteEvent(eventIdToDelete, seasonId.value)
    events.value = events.value.filter(event => event.id !== eventIdToDelete)
    // Recharger les données pour s'assurer que tout est à jour
    await Promise.all([
      loadEvents(seasonId.value),
      loadAvailability(players.value, events.value, seasonId.value),
      loadSelections(seasonId.value)
    ]).then(([newEvents, newAvailability, newSelections]) => {
      events.value = newEvents
      availability.value = newAvailability
      selections.value = newSelections
    })
    
    // Fermer la modal de confirmation
    confirmDelete.value = false
    eventToDelete.value = null
    
    showSuccessMessage.value = true
    successMessage.value = 'Événement supprimé avec succès !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error)
    alert('Erreur lors de la suppression de l\'événement. Veuillez réessayer.')
  }
}

function cancelDelete() {
  confirmDelete.value = false
  eventToDelete.value = null
}

function startEditing(event) {
  editingEvent.value = event.id
  editingTitle.value = event.title
  editingDate.value = event.date
  editingDescription.value = event.description || ''
  editingArchived.value = !!event.archived
}

async function saveEdit() {
  if (!editingEvent.value || !editingTitle.value.trim() || !editingDate.value) return

  const playerCount = parseInt(editingPlayerCount.value)
  if (isNaN(playerCount) || playerCount < 1 || playerCount > 20) {
    alert('Le nombre de joueurs doit être un nombre entier entre 1 et 20')
    return
  }

  try {
    const eventData = {
      title: editingTitle.value.trim(),
      date: editingDate.value,
      description: editingDescription.value.trim() || '',
      playerCount: playerCount,
      archived: !!editingArchived.value
    }
    await updateEvent(editingEvent.value, eventData, seasonId.value)
    // Après modification, proposer d'annoncer l'événement
    if (!eventData.archived) {
      announcePromptEvent.value = { id: editingEvent.value, ...eventData }
      showAnnouncePrompt.value = true
    }
    
    // Recharger les données pour s'assurer que le tri est appliqué
    await Promise.all([
      loadEvents(seasonId.value),
      loadAvailability(players.value, events.value, seasonId.value),
      loadSelections(seasonId.value)
    ]).then(([newEvents, newAvailability, newSelections]) => {
      events.value = newEvents
      availability.value = newAvailability
      selections.value = newSelections
    })
    
    editingEvent.value = null
    editingTitle.value = ''
    editingDate.value = ''
    editingDescription.value = ''
    editingPlayerCount.value = 6
    editingArchived.value = false
    showSuccessMessage.value = true
    successMessage.value = 'Événement mis à jour avec succès !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    console.error('Erreur lors de l\'édition de l\'événement:', error)
    alert('Erreur lors de l\'édition de l\'événement. Veuillez réessayer.')
  }
}



async function confirmDeletePlayer(playerId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) return

  try {
    await deletePlayer(playerId, seasonId.value)
    
    // Recharger les données pour s'assurer que le tri est appliqué
    await Promise.all([
      loadPlayers(seasonId.value),
      loadAvailability(players.value, events.value, seasonId.value),
      loadSelections(seasonId.value)
    ]).then(([newPlayers, newAvailability, newSelections]) => {
      players.value = newPlayers
      availability.value = newAvailability
      selections.value = newSelections
      
      // Recharger l'état de protection des joueurs
      loadProtectedPlayers()
    })
    showSuccessMessage.value = true
    successMessage.value = 'Joueur supprimé avec succès !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    console.error('Erreur lors de la suppression du joueur:', error)
    alert('Erreur lors de la suppression du joueur. Veuillez réessayer.')
  }
}

async function addNewPlayer() {
  if (!newPlayerName.value.trim()) return

  try {
    const newName = newPlayerName.value.trim()
    const newId = await addPlayer(newName, seasonId.value)
    
    // Recharger les données
    await Promise.all([
      loadPlayers(seasonId.value),
      loadAvailability(players.value, events.value, seasonId.value),
      loadSelections(seasonId.value)
    ]).then(([newPlayers, newAvailability, newSelections]) => {
      players.value = newPlayers
      availability.value = newAvailability
      selections.value = newSelections
      
      // Recharger l'état de protection des joueurs
      loadProtectedPlayers()
      
      // Trouver le nouveau joueur et le mettre en évidence
      const newPlayer = players.value.find(p => p.id === newId)
      highlightPlayer(newId)

      // Scroller automatiquement vers le joueur
      const row = document.querySelector(`[data-player-id="${newId}"]`)
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }

      // Afficher le message de succès
      showSuccessMessage.value = true
      successMessage.value = 'Joueur ajouté avec succès ! Vous pouvez maintenant indiquer sa disponibilité.'
      setTimeout(() => {
        showSuccessMessage.value = false
      }, 3000)     // Masquer le message après 5 secondes
      setTimeout(() => {
        showSuccessMessage.value = false
        successMessage.value = ''
      }, 5000)
    })
    
    newPlayerForm.value = false
    newPlayerName.value = ''
  } catch (error) {
    console.error('Erreur lors de l\'ajout du joueur:', error)
    alert('Erreur lors de l\'ajout du joueur. Veuillez réessayer.')
  }
}

function cancelEdit() {
  editingEvent.value = null
  editingTitle.value = ''
  editingDate.value = ''
  editingDescription.value = ''
  editingPlayerCount.value = 6
}

const isHovered = ref(null)

const newEventForm = ref(false)
const newEventTitle = ref('')
const newEventDate = ref('')
const newEventDescription = ref('')
const newEventPlayerCount = ref(6)
const newEventArchived = ref(false)

// Fonction pour annuler la création d'événement


async function createEvent() {
  if (!newEventTitle.value.trim() || !newEventDate.value) {
    alert('Veuillez remplir le titre et la date de l\'événement')
    return
  }

  const playerCount = parseInt(newEventPlayerCount.value)
  if (isNaN(playerCount) || playerCount < 1 || playerCount > 20) {
    alert('Le nombre de joueurs doit être un nombre entier entre 1 et 20')
    return
  }

  const newEvent = {
    title: newEventTitle.value.trim(),
    date: newEventDate.value,
    description: newEventDescription.value.trim() || '',
    playerCount: playerCount,
    archived: !!newEventArchived.value
  }

  // Créer l'événement directement après validation du PIN
  await createEventProtected(newEvent)
}

async function createEventProtected(eventData) {
  try {
    // D'abord sauvegarder l'événement
    const eventId = await saveEvent(eventData, seasonId.value)
    
    // Mettre à jour la liste des événements
    events.value = [...events.value, { id: eventId, ...eventData }]
    
    // Mettre à jour la disponibilité pour le nouvel événement
    const newAvailability = {}
    // Utiliser une boucle for...of pour gérer les promesses
    for (const player of players.value) {
      newAvailability[player.name] = availability.value[player.name] || {}
      newAvailability[player.name][eventId] = null // Utiliser null au lieu de undefined
      // Sauvegarder la disponibilité pour chaque joueur
      await saveAvailability(player.name, newAvailability[player.name], seasonId.value)
    }
    
    // Réinitialiser le formulaire
    newEventTitle.value = ''
    newEventDate.value = ''
    newEventDescription.value = ''
    newEventPlayerCount.value = 6
    newEventArchived.value = false
    newEventForm.value = false
    
    // Forcer la mise à jour de l'interface
    await Promise.resolve()
    
    showSuccessMessage.value = true
    successMessage.value = 'Événement créé avec succès !'
    // Après création, proposer d'annoncer l'événement
    if (!eventData.archived) {
      announcePromptEvent.value = { id: eventId, ...eventData }
      showAnnouncePrompt.value = true
    }
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error?.message || error)
    alert('Erreur lors de la création de l\'événement. Veuillez réessayer.')
  }
}

function cancelNewEvent() {
  newEventTitle.value = ''
  newEventDate.value = ''
  newEventDescription.value = ''
  newEventPlayerCount.value = 6
  newEventForm.value = false
}

// Nouvelle fonction pour demander le PIN avant d'ouvrir la modal
async function openNewEventForm() {
  // Demander le PIN code avant d'ouvrir la modal de création
  await requirePin({
    type: 'addEvent',
    data: {}
  })
}

const events = ref([])
const players = ref([])
const availability = ref({})
const selections = ref({})
const stats = ref({})
const chances = ref({})

// Initialiser les données au montage
onMounted(async () => {
  const useFirebase = true
  setStorageMode(useFirebase ? 'firebase' : 'mock')

  // Migration automatique si besoin
  await initializeStorage()

  // Charger la saison par slug
  const q = query(collection(db, 'seasons'), where('slug', '==', props.slug))
  const snap = await getDocs(q)
  if (!snap.empty) {
    const seasonDoc = snap.docs[0]
    seasonId.value = seasonDoc.id
    seasonName.value = seasonDoc.data().name
    document.title = `Saison : ${seasonName.value}`
  } else {
    // Saison introuvable: rediriger vers l'accueil
    router.push('/')
    return
  }

  // Charger les données de la saison
  if (seasonId.value) {
    // Requêtes parallèles
    const [playersSnap, eventsSnap, availSnap, selSnap, protections] = await Promise.all([
      getDocs(collection(db, 'seasons', seasonId.value, 'players')),
      getDocs(collection(db, 'seasons', seasonId.value, 'events')),
      getDocs(collection(db, 'seasons', seasonId.value, 'availability')),
      getDocs(collection(db, 'seasons', seasonId.value, 'selections')),
      listProtectedPlayers(seasonId.value)
    ])

    players.value = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    const protSet = new Set()
    if (Array.isArray(protections)) {
      protections.forEach(p => { if (p.isProtected) protSet.add(p.playerId || p.id) })
    }
    protectedPlayers.value = protSet

    events.value = eventsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      playerCount: doc.data().playerCount || 6
    }))

    const availObj = {}
    availSnap.docs.forEach(doc => {
      const data = doc.data()
      const cleanedData = {}
      Object.keys(data).forEach(eventId => {
        const value = data[eventId]
        cleanedData[eventId] = value === 'oui' ? true : value === 'non' ? false : value
      })
      availObj[doc.id] = cleanedData
    })
    availability.value = availObj

    const selObj = {}
    selSnap.docs.forEach(doc => { selObj[doc.id] = doc.data().players || [] })
    selections.value = selObj
  }
  
  // Déplacer les calculs lourds en idle
  const scheduleIdle = (fn) => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => fn())
    } else {
      setTimeout(fn, 0)
    }
  }
  scheduleIdle(() => { updateAllStats(); updateAllChances() })
  
  console.log('players (deduplicated):', players.value.map(p => ({ id: p.id, name: p.name })))
  console.log('availability loaded:', availability.value)

  // init scroll hints
  await nextTick()
  isLoadingGrid.value = false
  nextTick(() => {
    updateScrollHints()
    const el = gridboardRef.value
    if (el) {
      el.addEventListener('scroll', (e) => {
        updateScrollHints()
        headerScrollX.value = el.scrollLeft || 0
      }, { passive: true })
      window.addEventListener('resize', updateScrollHints)
    }
  })

  // Gérer le focus sur un événement spécifique depuis l'URL
  const eventIdFromUrl = route.query.event
  if (eventIdFromUrl && events.value.length > 0) {
    const targetEvent = events.value.find(e => e.id === eventIdFromUrl)
    if (targetEvent) {
      console.log('Événement trouvé depuis l\'URL:', targetEvent.title)
      
      // Utiliser la fonction améliorée de focus
      await focusOnEventFromUrl(eventIdFromUrl, targetEvent)
    } else {
      console.warn('Événement non trouvé avec l\'ID:', eventIdFromUrl)
      // Afficher un message d'erreur à l'utilisateur
      showErrorMessage.value = true
      errorMessage.value = `Événement non trouvé`
      setTimeout(() => {
        showErrorMessage.value = false
      }, 3000)
    }
  }

  // Désistement: plus de modal/route dédiée, on utilise les magic links "no"

  function scrollHeaderBy(direction) {
    const el = gridboardRef.value
    if (!el) return
    const step = el.clientWidth * 0.6
    el.scrollTo({ left: el.scrollLeft + direction * step, behavior: 'smooth' })
  }
})

// Surveiller les changements de route pour ouvrir automatiquement la popup d'événement
watch(() => route.params.eventId, (newEventId) => {
  if (newEventId) {
    const openWhenReady = () => {
      const targetEvent = events.value.find(e => e.id === newEventId)
      if (targetEvent) {
        showEventDetails(targetEvent)
        return true
      }
      return false
    }

    if (events.value.length > 0) {
      openWhenReady()
    } else {
      const unwatch = watch(events, (newEvents) => {
        if (newEvents.length > 0) {
          const done = openWhenReady()
          if (done) unwatch()
        }
      }, { immediate: true })
    }
  }
}, { immediate: true })

// Helpers de tri
function toDateObject(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === 'function') return value.toDate()
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

const sortedPlayers = computed(() => {
  // Tri strictement alphabétique A→Z sur le nom affiché
  return [...players.value].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' }))
})

const sortedEvents = computed(() => {
  // Tri chronologique gauche→droite, puis titre en cas d'égalité
  return [...events.value].sort((a, b) => {
    const da = toDateObject(a.date)
    const db = toDateObject(b.date)
    const ta = da ? da.getTime() : Number.POSITIVE_INFINITY
    const tb = db ? db.getTime() : Number.POSITIVE_INFINITY
    if (ta !== tb) return ta - tb
    return (a.title || '').localeCompare(b.title || '', 'fr', { sensitivity: 'base' })
  })
})

// Affichage conditionnel des évènements archivés
const showArchived = ref(false)
const displayedEvents = computed(() => {
  const list = sortedEvents.value
  return showArchived.value ? list : list.filter(e => !e.archived)
})

function toggleShowArchived() {
  showArchived.value = !showArchived.value
}

async function toggleAvailability(playerName, eventId) {
  const player = players.value.find(p => p.name === playerName);
  if (!player) {
    console.error('Joueur non trouvé:', playerName);
    return;
  }
  const eventItem = events.value.find(e => e.id === eventId);
  if (!eventItem) {
    console.error('Événement non trouvé:', eventId);
    return;
  }
  
  // Vérifier si le joueur est protégé (utiliser la même logique que la grille)
  const isProtected = isPlayerProtectedInGrid(player.id);
  
  if (isProtected) {
    // Vérifier s'il y a une session active OU si le joueur vient d'être vérifié
    const hasCachedPassword = isPlayerPasswordCached(player.id);
    const wasRecentlyVerified = recentlyVerifiedPlayer.value === player.id;
    
    console.log('Joueur protégé:', { 
      playerId: player.id, 
      hasCachedPassword, 
      wasRecentlyVerified,
      recentlyVerifiedPlayer: recentlyVerifiedPlayer.value 
    });
    
    if (hasCachedPassword || wasRecentlyVerified) {
      // Session active ou joueur récemment vérifié, procéder directement
      console.log('Session active ou joueur récemment vérifié, procéder au toggle');
      if (wasRecentlyVerified) {
        // Nettoyer le flag après utilisation
        console.log('Nettoyage du flag recentlyVerifiedPlayer');
        recentlyVerifiedPlayer.value = null;
      }
      performToggleAvailability(player, eventId);
    } else {
      // Pas de session, demander le mot de passe
      console.log('Pas de session, affichage de la modal de vérification');
      // Utiliser la même logique que dans handleAvailabilityToggle
      pendingAvailabilityAction.value = { playerName, eventId };
      passwordVerificationPlayer.value = player;
      showPasswordVerification.value = true;
    }
    return;
  }
  
  // Si non protégé, procéder directement
  performToggleAvailability(player, eventId);
}

function performToggleAvailability(player, eventId) {
  // Récupérer l'état actuel depuis availability.value
  const current = availability.value[player.name]?.[eventId];
  console.log(`toggleAvailability - ${player.name} pour ${eventId}:`, current)
  let newValue;
  
  // Logique de basculement : undefined -> true -> false -> undefined
  if (current === true) {
    newValue = false;
  } else if (current === false) {
    newValue = undefined;
  } else {
    // État undefined -> passe à true
    newValue = true;
  }
  
  // Mettre à jour availability.value
  if (newValue === undefined) {
    // Si on revient à l'état indéfini, supprimer la clé
    if (availability.value[player.name]) {
      delete availability.value[player.name][eventId];
    }
  } else {
    // Sinon, mettre à jour la valeur
    if (!availability.value[player.name]) {
      availability.value[player.name] = {};
    }
    availability.value[player.name][eventId] = newValue;
  }
  
  // Sauvegarder les disponibilités pour ce joueur
  saveAvailability(player.name, availability.value[player.name], seasonId.value)
    .then(async () => {
      // Forcer la réactivité de l'interface
      await nextTick();
      
      // Recalculer les chances car la disponibilité a changé
      updateAllChances()

      showSuccessMessage.value = true;
      successMessage.value = 'Disponibilité mise à jour avec succès !';
      setTimeout(() => {
        showSuccessMessage.value = false;
      }, 3000);
    })
    .catch((error) => {
      console.error('Erreur lors de la mise à jour de la disponibilité:', error);
      alert('Erreur lors de la mise à jour de la disponibilité. Veuillez réessayer.');
    });
}

function isAvailable(player, eventId) {
  return availability.value[player]?.[eventId]
}

function isSelected(player, eventId) {
  const selected = selections.value[eventId] || []
  const avail = availability.value[player]?.[eventId]
  return selected.includes(player) && avail === true
}

async function tirer(eventId, count = 6) {
  const event = events.value.find(e => e.id === eventId)
  const requiredCount = event?.playerCount || 6
  
  // Récupérer la sélection actuelle
  const currentSelection = selections.value[eventId] || []
  
  // Vérifier si TOUS les joueurs de la sélection sont encore disponibles
  const allSelectedStillAvailable = currentSelection.length > 0 && 
    currentSelection.every(playerName => isAvailable(playerName, eventId))
  
  if (allSelectedStillAvailable) {
    // Cas exceptionnel : tous les joueurs sont disponibles, on refait un tirage complet
    console.log('Tous les joueurs sélectionnés sont disponibles, nouveau tirage complet')
    
    const candidates = players.value.filter(p => isAvailable(p.name, eventId))

    // Tirage pondéré : moins sélectionné = plus de chances
    const weightedCandidates = candidates.map(player => {
      const s = countSelections(player.name)
      return {
        name: player.name,
        weight: 1 / (1 + s) // poids inverse du nombre de sélections
      }
    })

    const tirage = []
    const pool = [...weightedCandidates]

    while (tirage.length < requiredCount && pool.length > 0) {
      const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0)
      let r = Math.random() * totalWeight

      const chosenIndex = pool.findIndex(p => {
        r -= p.weight
        return r <= 0
      })

      if (chosenIndex >= 0) {
        tirage.push(pool[chosenIndex].name)
        pool.splice(chosenIndex, 1)
      }
    }

    selections.value[eventId] = tirage
  } else {
    // Logique normale : garder les joueurs disponibles et compléter
    const keepSelectedPlayers = currentSelection.filter(playerName => isAvailable(playerName, eventId))
    
    // Calculer combien de places il reste à pourvoir
    const remainingSlots = requiredCount - keepSelectedPlayers.length
    
    if (remainingSlots <= 0) {
      // Si on a déjà assez de joueurs sélectionnés et disponibles, on garde la sélection actuelle
      selections.value[eventId] = keepSelectedPlayers
    } else {
      // Tirage pour les places manquantes
      const alreadySelected = new Set(keepSelectedPlayers)
      const candidates = players.value.filter(p => 
        isAvailable(p.name, eventId) && !alreadySelected.has(p.name)
      )

      // Tirage pondéré : moins sélectionné = plus de chances
      const weightedCandidates = candidates.map(player => {
        const s = countSelections(player.name)
        return {
          name: player.name,
          weight: 1 / (1 + s) // poids inverse du nombre de sélections
        }
      })

      const newTirage = []
      const pool = [...weightedCandidates]

      while (newTirage.length < remainingSlots && pool.length > 0) {
        const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0)
        let r = Math.random() * totalWeight

        const chosenIndex = pool.findIndex(p => {
          r -= p.weight
          return r <= 0
        })

        if (chosenIndex >= 0) {
          newTirage.push(pool[chosenIndex].name)
          pool.splice(chosenIndex, 1)
        }
      }

      // Combiner les joueurs gardés et les nouveaux tirés
      selections.value[eventId] = [...keepSelectedPlayers, ...newTirage]
    }
  }

  await saveSelection(eventId, selections.value[eventId], seasonId.value)
  updateAllStats()
  updateAllChances()
}

async function tirerProtected(eventId, count = 6) {
  console.log('tirerProtected appelé avec eventId:', eventId)
  console.log('showSelectionModal.value AVANT:', showSelectionModal.value)
  console.log('selectionModalEvent.value?.id AVANT:', selectionModalEvent.value?.id)
  
  // Sauvegarder l'état de la popin avant le tirage
  const wasSelectionModalOpen = showSelectionModal.value
  const selectionModalEventId = selectionModalEvent.value?.id
  
  // Vérifier si c'est une reselection avant de faire le tirage
  const wasReselection = selections.value[eventId] && selections.value[eventId].length > 0
  
  // Sauvegarder l'ancienne sélection pour comparer
  const oldSelection = wasReselection ? [...selections.value[eventId]] : []
  
  await tirer(eventId, count)
  
  console.log('showSelectionModal.value APRÈS tirage:', showSelectionModal.value)
  console.log('selectionModalEvent.value?.id APRÈS tirage:', selectionModalEvent.value?.id)
  
  // S'assurer que la popin de sélection reste ouverte si elle était ouverte
  if (wasSelectionModalOpen && !showSelectionModal.value) {
    console.log('Restauration de la popin de sélection...')
    showSelectionModal.value = true
    selectionModalEvent.value = events.value.find(e => e.id === selectionModalEventId)
  }
  
  // Mettre à jour les données de la popin de sélection si elle est ouverte
  if (showSelectionModal.value && selectionModalEvent.value?.id === eventId) {
    console.log('Popin de sélection ouverte, mise à jour...')
    // Forcer la mise à jour des données
    await nextTick()
    
    // Afficher le message de succès dans la popin de sélection
    if (selectionModalRef.value && selectionModalRef.value.showSuccess) {
      console.log('Appel de showSuccess sur la popin de sélection')
      const newSelection = selections.value[eventId] || []
      const keptPlayers = oldSelection.filter(player => newSelection.includes(player))
      const isPartialUpdate = keptPlayers.length > 0 && keptPlayers.length < oldSelection.length
      selectionModalRef.value.showSuccess(wasReselection, isPartialUpdate)
    } else {
      console.log('selectionModalRef.value:', selectionModalRef.value)
      console.log('showSuccess disponible:', selectionModalRef.value?.showSuccess)
    }
  } else {
    console.log('Popin de sélection fermée, affichage message global')
    // Afficher un message de succès global si la popin n'est pas ouverte
    showSuccessMessage.value = true
    const event = events.value.find(e => e.id === eventId)
    const selectedPlayers = selections.value[eventId] || []
    
    if (wasReselection) {
      successMessage.value = 'Sélection mise à jour avec succès !'
    } else {
      successMessage.value = 'Sélection effectuée avec succès !'
    }
    
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  }
}

function formatDate(dateValue) {
  if (!dateValue) return ''
  const date = typeof dateValue === 'string'
    ? new Date(dateValue)
    : dateValue.toDate?.() || dateValue
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function formatDateFull(dateValue) {
  if (!dateValue) return ''
  const date = typeof dateValue === 'string'
    ? new Date(dateValue)
    : dateValue.toDate?.() || dateValue
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function countSelections(player) {
  return Object.values(selections.value).filter(sel => sel.includes(player)).length
}

function countAvailability(player) {
  const eventsMap = availability.value[player] || {}
  return Object.values(eventsMap).filter(v => v === true).length
}

function countAvailablePlayers(eventId) {
  if (!eventId) return 0;
  return Object.values(availability.value).filter(playerAvail => 
    playerAvail[eventId] === true
  ).length;
}

function countSelectedPlayers(eventId) {
  if (!eventId) return 0;
  const eventSelections = selections.value[eventId] || [];
  return eventSelections.length;
}

function isSelectionComplete(eventId) {
  const event = events.value.find(e => e.id === eventId)
  const required = event?.playerCount || 6
  return countSelectedPlayers(eventId) >= required
}

function ratioSelection(player) {
  const avail = countAvailability(player)
  const sel = countSelections(player)
  return avail === 0 ? 0 : sel / avail
}

function updateStatsForPlayer(player) {
  stats.value[player] = {
    availability: countAvailability(player),
    selection: countSelections(player),
    ratio: ratioSelection(player)
  }
}

function updateAllStats() {
  players.value.forEach(player => updateStatsForPlayer(player.name))
}

function chanceToBeSelected(playerName, eventId, count = null) {
  const availablePlayers = players.value.filter(p => isAvailable(p.name, eventId) === true)

  if (!availablePlayers.find(p => p.name === playerName)) return 0

  // Si count n'est pas fourni, utiliser le nombre de joueurs de l'événement
  if (count === null) {
    const event = events.value.find(e => e.id === eventId)
    count = event?.playerCount || 6
  }

  // Calcul du poids basé sur le nombre de sélections déjà faites
  const weights = availablePlayers.map(p => {
    const pastSelections = countSelections(p.name)
    return {
      name: p.name,
      weight: 1 / (1 + pastSelections)
    }
  })

  const totalWeight = weights.reduce((sum, p) => sum + p.weight, 0)
  const playerWeight = weights.find(p => p.name === playerName)?.weight || 0

  const chance = Math.min(1, (playerWeight / totalWeight) * count)
  return Math.round(chance * 100)
}

function updateAllChances() {
  const chanceMap = {}
  events.value.forEach(event => {
    const eventPlayerCount = event.playerCount || 6
    const availablePlayers = players.value.filter(p => isAvailable(p.name, event.id) === true)
    const weights = availablePlayers.map(p => {
      const pastSelections = countSelections(p.name)
      return {
        name: p.name,
        weight: 1 / (1 + pastSelections)
      }
    })
    const totalWeight = weights.reduce((sum, p) => sum + p.weight, 0)

    weights.forEach(p => {
      const chance = Math.min(1, (p.weight / totalWeight) * eventPlayerCount)
      if (!chanceMap[p.name]) chanceMap[p.name] = {}
      chanceMap[p.name][event.id] = Math.round(chance * 100)
    })
  })

  chances.value = chanceMap
}



const playerToDelete = ref(null)
const confirmPlayerDelete = ref(false)

async function deletePlayerConfirmed(playerId = null) {
  const playerIdToDelete = playerId || playerToDelete.value
  if (!playerIdToDelete) {
    console.error('Aucun joueur à supprimer')
    return
  }

  try {
    await deletePlayer(playerIdToDelete, seasonId.value)
    players.value = players.value.filter(p => p.id !== playerIdToDelete)
    
    // Fermer la modal de confirmation
    confirmPlayerDelete.value = false
    playerToDelete.value = null
    
    showSuccessMessage.value = true
    successMessage.value = 'Joueur supprimé avec succès !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    console.error("Erreur lors de la suppression du joueur :", error)
    alert("Erreur lors de la suppression du joueur. Veuillez réessayer.")
  }
}

function cancelPlayerDelete() {
  confirmPlayerDelete.value = false
  playerToDelete.value = null
}

async function handlePlayerDelete(playerId) {
  // Fermer la popup du joueur d'abord
  closePlayerModal();
  
  // Vérifier si le joueur est protégé
  const isProtected = await isPlayerProtected(playerId, seasonId.value)
  
  if (isProtected) {
    // Le joueur est protégé, demander son mot de passe d'abord
    await requirePlayerPassword({
      type: 'deletePlayer',
      data: { playerId }
    })
  } else {
    // Le joueur n'est pas protégé, demander le PIN de saison
    await requirePin({
      type: 'deletePlayer',
      data: { playerId }
    })
  }
}

async function handleTirage(eventId, count = null) {
  // Si count n'est pas fourni, utiliser le nombre de joueurs de l'événement
  if (count === null) {
    const event = events.value.find(e => e.id === eventId)
    count = event?.playerCount || 6
  }
  
  if (selections.value[eventId] && selections.value[eventId].length > 0) {
    // Demander le PIN code avant d'afficher la confirmation de relance
    await requirePin({
      type: 'launchSelection',
      data: { eventId, count }
    })
  } else {
    // Demander le PIN code avant de lancer la sélection
    await requirePin({
      type: 'launchSelection',
      data: { eventId, count }
    })
  }
}
async function confirmTirage() {
  if (eventIdToReselect.value) {
    // Lancer directement la sélection (le PIN a déjà été validé)
    const event = events.value.find(e => e.id === eventIdToReselect.value)
    const count = event?.playerCount || 6
    await tirerProtected(eventIdToReselect.value, count)
    confirmReselect.value = false
    eventIdToReselect.value = null
    // Ne pas fermer la popin de sélection, elle restera ouverte avec la nouvelle sélection
  }
}
function cancelTirage() {
  confirmReselect.value = false
  eventIdToReselect.value = null
  // La popin de sélection reste ouverte
}

// Fonctions pour la protection par PIN
function getPinModalMessage() {
  if (!pendingOperation.value) return 'Veuillez saisir le code PIN à 4 chiffres'
  
  const messages = {
    deleteEvent: 'Suppression d\'événement - Code PIN requis',
    addEvent: 'Ajout d\'événement - Code PIN requis',
    deletePlayer: 'Suppression de joueur - Code PIN requis',
    launchSelection: 'Lancement de sélection - Code PIN requis',
    toggleArchive: 'Archivage d\'événement - Code PIN requis'
  }
  
  return messages[pendingOperation.value.type] || 'Code PIN requis'
}

async function requirePin(operation) {
  // Vérifier si le PIN est déjà en cache pour cette saison
  if (pinSessionManager.isPinCached(seasonId.value)) {
    const cachedPin = pinSessionManager.getCachedPin(seasonId.value)
    console.log('PIN en cache trouvé, utilisation automatique')
    
    // Vérifier que le PIN est toujours valide
    const isValid = await verifySeasonPin(seasonId.value, cachedPin)
    if (isValid) {
      // Exécuter directement l'opération
      await executePendingOperation(operation)
      return
    } else {
      // PIN invalide, effacer le cache
      pinSessionManager.clearSession()
    }
  }
  
  // Afficher la modal de saisie du PIN
  pendingOperation.value = operation
  showPinModal.value = true
}

async function requirePlayerPassword(operation) {
  const playerId = operation.data.playerId
  
  // Vérifier si le mot de passe du joueur est déjà en cache
  if (isPlayerPasswordCached(playerId)) {
    console.log('Mot de passe du joueur en cache trouvé, utilisation automatique')
    // Exécuter directement l'opération
    await executePendingOperation(operation)
    return
  }
  
  // Afficher la modal de saisie du mot de passe du joueur
  pendingPlayerOperation.value = operation
  showPlayerPasswordModal.value = true
}



async function handlePinSubmit(pinCode) {
  try {
    const isValid = await verifySeasonPin(seasonId.value, pinCode)
    
    if (isValid) {
      // Sauvegarder le PIN en session
      pinSessionManager.saveSession(seasonId.value, pinCode)
      
      showPinModal.value = false
      const operationToExecute = pendingOperation.value
      pendingOperation.value = null
      
      // Exécuter l'opération en attente
      await executePendingOperation(operationToExecute)
    } else {
      pinErrorMessage.value = 'Code PIN incorrect'
      // Réinitialiser le message d'erreur après 3 secondes
      setTimeout(() => {
        pinErrorMessage.value = ''
      }, 3000)
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du PIN:', error)
    pinErrorMessage.value = 'Erreur lors de la vérification du code PIN'
  }
}

function handlePinCancel() {
  showPinModal.value = false
  pendingOperation.value = null
  pinErrorMessage.value = ''
}

async function handlePlayerPasswordSubmit(password) {
  if (!password) return
  
  playerPasswordLoading.value = true
  playerPasswordErrorMessage.value = ''
  
  try {
    const playerId = pendingPlayerOperation.value.data.playerId
    
    // Vérifier si c'est le PIN de saison
    const seasonPin = await getSeasonPin(seasonId.value)
    if (password === seasonPin) {
      // PIN de saison accepté
      // Mémoriser la session mot de passe pour ce joueur afin d'éviter de redemander pendant 10 minutes
      try {
        playerPasswordSessionManager.saveSession(pendingPlayerOperation.value.data.playerId, password)
      } catch {}
      showPlayerPasswordModal.value = false
      const operationToExecute = pendingPlayerOperation.value
      pendingPlayerOperation.value = null
      playerPasswordInput.value = ''
      
      // Exécuter l'opération
      await executePendingOperation(operationToExecute)
      return
    }
    
    // Vérifier le mot de passe du joueur
    const isValid = await verifyPlayerPassword(playerId, password, seasonId.value)
    
    if (isValid) {
      showPlayerPasswordModal.value = false
      const operationToExecute = pendingPlayerOperation.value
      pendingPlayerOperation.value = null
      playerPasswordInput.value = ''
      
      // Exécuter l'opération
      await executePendingOperation(operationToExecute)
    } else {
      playerPasswordErrorMessage.value = 'Mot de passe incorrect'
      // Réinitialiser le message d'erreur après 3 secondes
      setTimeout(() => {
        playerPasswordErrorMessage.value = ''
      }, 3000)
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du mot de passe:', error)
    playerPasswordErrorMessage.value = 'Erreur lors de la vérification du mot de passe'
  } finally {
    playerPasswordLoading.value = false
  }
}

function handlePlayerPasswordCancel() {
  showPlayerPasswordModal.value = false
  pendingPlayerOperation.value = null
  playerPasswordErrorMessage.value = ''
  playerPasswordInput.value = ''
  playerPasswordLoading.value = false
}

async function handleAvailabilityPasswordSubmit(password) {
  if (!password) return
  
  availabilityPasswordLoading.value = true
  availabilityPasswordErrorMessage.value = ''
  
  try {
    const player = pendingAvailabilityOperation.value.data.player
    
    // Vérifier si c'est le PIN de saison
    const seasonPin = await getSeasonPin(seasonId.value)
    if (password === seasonPin) {
      // PIN de saison accepté
      // Mémoriser la session mot de passe pour ce joueur afin d'éviter de redemander pendant 10 minutes
      try {
        playerPasswordSessionManager.saveSession(pendingAvailabilityOperation.value.data.player.id, password)
      } catch {}
      showAvailabilityPasswordModal.value = false
      const operationToExecute = pendingAvailabilityOperation.value
      pendingAvailabilityOperation.value = null
      availabilityPasswordInput.value = ''
      
      // Exécuter l'opération
      await executePendingOperation(operationToExecute)
      return
    }
    
    // Vérifier le mot de passe du joueur
    const isValid = await verifyPlayerPassword(player.id, password, seasonId.value)
    
    if (isValid) {
      showAvailabilityPasswordModal.value = false
      const operationToExecute = pendingAvailabilityOperation.value
      pendingAvailabilityOperation.value = null
      availabilityPasswordInput.value = ''
      
      // Exécuter l'opération
      await executePendingOperation(operationToExecute)
    } else {
      availabilityPasswordErrorMessage.value = 'Mot de passe incorrect'
      // Réinitialiser le message d'erreur après 3 secondes
      setTimeout(() => {
        availabilityPasswordErrorMessage.value = ''
      }, 3000)
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du mot de passe:', error)
    availabilityPasswordErrorMessage.value = 'Erreur lors de la vérification du mot de passe'
  } finally {
    availabilityPasswordLoading.value = false
  }
}

function handleAvailabilityPasswordCancel() {
  showAvailabilityPasswordModal.value = false
  pendingAvailabilityOperation.value = null
  availabilityPasswordErrorMessage.value = ''
  availabilityPasswordInput.value = ''
  availabilityPasswordLoading.value = false
}

async function sendAvailabilityResetEmail() {
  availabilityResetLoading.value = true
  availabilityResetError.value = ''
  availabilityResetSuccess.value = ''
  
  try {
    const player = pendingAvailabilityOperation.value.data.player
    const result = await sendPasswordResetEmail(player.id, seasonId.value)
    availabilityResetSuccess.value = result.message || 'Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.'
  } catch (err) {
    console.error('Erreur lors de l\'envoi de l\'email:', err)
    availabilityResetError.value = 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.'
  } finally {
    availabilityResetLoading.value = false
  }
}

async function sendPlayerResetEmail() {
  playerResetLoading.value = true
  playerResetError.value = ''
  playerResetSuccess.value = ''
  
  try {
    const playerId = pendingPlayerOperation.value.data.playerId
    const result = await sendPasswordResetEmail(playerId, seasonId.value)
    playerResetSuccess.value = result.message || 'Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.'
  } catch (err) {
    console.error('Erreur lors de l\'envoi de l\'email:', err)
    playerResetError.value = 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.'
  } finally {
    playerResetLoading.value = false
  }
}

function getSessionInfo() {
  if (pinSessionManager.isPinCached(seasonId.value)) {
    return {
      timeRemaining: pinSessionManager.getTimeRemaining(),
      isExpiringSoon: pinSessionManager.isExpiringSoon()
    }
  }
  return null
}

async function executePendingOperation(operation) {
  if (!operation) return
  
  const { type, data } = operation
  
  try {
    switch (type) {
      case 'deleteEvent':
        // Afficher la modal de confirmation après validation du PIN
        console.log('executePendingOperation - data.eventId:', data.eventId)
        console.log('executePendingOperation - type de data.eventId:', typeof data.eventId)
        eventToDelete.value = data.eventId
        confirmDelete.value = true
        break
      case 'addEvent':
        // Ouvrir la modal de création d'événement après validation du PIN
        newEventForm.value = true
        break
      case 'deletePlayer':
        // Afficher la modal de confirmation après validation du PIN
        playerToDelete.value = data.playerId
        confirmPlayerDelete.value = true
        break
      case 'launchSelection':
        // Vérifier si une sélection existe déjà pour afficher la confirmation
        if (selections.value[data.eventId] && selections.value[data.eventId].length > 0) {
          // Afficher la modal de confirmation de relance
          eventIdToReselect.value = data.eventId
          confirmReselect.value = true
          // Fermer seulement la popin de détails, garder la popin de sélection
          showEventDetailsModal.value = false
        } else {
          // Lancer directement la sélection
          await tirerProtected(data.eventId, data.count)
          // Fermer seulement la popin de détails, garder la popin de sélection
          showEventDetailsModal.value = false
        }
        break
      case 'toggleAvailability':
        // Exécuter directement la modification de disponibilité
        performToggleAvailability(data.player, data.eventId)
        break
      case 'toggleArchive':
        await setEventArchived(data.eventId, data.archived, seasonId.value)
        {
          const idx = events.value.findIndex(e => e.id === data.eventId)
          if (idx !== -1) {
            events.value[idx] = { ...events.value[idx], archived: !!data.archived }
          }
          editingArchived.value = !!data.archived
        }
        break
    }
  } catch (error) {
    console.error('Erreur lors de l\'exécution de l\'opération:', error)
    showSuccessMessage.value = true
    successMessage.value = 'Erreur lors de l\'opération. Veuillez réessayer.'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  }
}

function goBack() {
  router.push('/')
}

// Nettoyage listeners
onUnmounted(() => {
  const el = gridboardRef.value
  if (el) el.removeEventListener('scroll', updateScrollHints)
  window.removeEventListener('resize', updateScrollHints)
})

async function showEventDetails(event) {
  selectedEvent.value = event
  editingDescription.value = event.description || ''
  editingArchived.value = !!event.archived

  // Rafraîchir les données avant d'afficher pour refléter les changements récents (ex: magic link)
  try {
    const [newAvailability, newSelections] = await Promise.all([
      loadAvailability(players.value, events.value, seasonId.value),
      loadSelections(seasonId.value)
    ])
    availability.value = newAvailability
    selections.value = newSelections
  } catch (e) {
    console.warn('Impossible de rafraîchir les données avant ouverture des détails:', e)
  }

  showEventDetailsModal.value = true
}

function closeEventDetails() {
  showEventDetailsModal.value = false;
  selectedEvent.value = null;
  editingDescription.value = '';
  showEventMoreActions.value = false;
}

function closeEventDetailsAndUpdateUrl() {
  // Fermer la popup
  closeEventDetails();
  
  // Mettre à jour l'URL pour revenir à la liste des événements
  if (route.params.eventId) {
    router.push(`/season/${props.slug}`);
  }
}

// Fonction pour gérer le toggle des disponibilités depuis la popup de détails
async function handleAvailabilityToggle(playerName, eventId) {
  console.log('handleAvailabilityToggle appelé avec:', { playerName, eventId });
  
  const player = players.value.find(p => p.name === playerName);
  if (!player) {
    console.error('Joueur non trouvé:', playerName);
    return;
  }
  
  console.log('Joueur trouvé:', player);
  
  // Vérifier si le joueur est protégé (utiliser la même logique que la grille)
  const isProtected = isPlayerProtectedInGrid(player.id);
  console.log('Joueur protégé:', isProtected);
  
  if (isProtected) {
    // Vérifier s'il y a une session active
    const hasCachedPassword = isPlayerPasswordCached(player.id);
    if (hasCachedPassword) {
      // Session active, procéder directement
      console.log('Session active, procéder au toggle');
      await toggleAvailability(playerName, eventId);
    } else {
      // Pas de session, demander le mot de passe
      console.log('Demande du mot de passe pour joueur protégé');
      pendingAvailabilityAction.value = { playerName, eventId };
      passwordVerificationPlayer.value = player;
      showPasswordVerification.value = true;
    }
    return;
  }
  
  // Si non protégé, procéder directement
  console.log('Joueur non protégé, procéder au toggle');
  await toggleAvailability(playerName, eventId);
}

// Fonction pour vérifier si un joueur est sélectionné pour un événement spécifique
function isPlayerSelected(playerName, eventId) {
  const selected = selections.value[eventId] || [];
  return selected.includes(playerName);
}

// Fonction pour gérer la vérification de mot de passe réussie
async function handlePasswordVerified(verificationData) {
  console.log('Mot de passe vérifié:', verificationData);
  
  // Marquer le joueur comme récemment vérifié pour éviter la boucle
  if (passwordVerificationPlayer.value) {
    recentlyVerifiedPlayer.value = passwordVerificationPlayer.value.id;
    console.log('Joueur marqué comme récemment vérifié:', passwordVerificationPlayer.value.id);
  }
  
  // Procéder à l'action de disponibilité en attente
  if (pendingAvailabilityAction.value) {
    const { playerName, eventId } = pendingAvailabilityAction.value;
    console.log('Exécution de l\'action en attente:', { playerName, eventId });
    
    // Procéder au toggle de disponibilité
    await toggleAvailability(playerName, eventId);
    
    // Réinitialiser l'action en attente
    pendingAvailabilityAction.value = null;
  } else {
    console.log('Aucune action en attente trouvée');
  }
  
  // Fermer la modal de vérification
  showPasswordVerification.value = false;
  passwordVerificationPlayer.value = null;
}

function startEditingFromDetails() {
  editingEvent.value = selectedEvent.value.id;
  editingTitle.value = selectedEvent.value.title;
  editingDate.value = selectedEvent.value.date;
  editingDescription.value = selectedEvent.value.description || '';
  editingPlayerCount.value = selectedEvent.value.playerCount || 6;
  showEventDetailsModal.value = false; // Fermer le popin
}

async function toggleEventArchived() {
  if (!selectedEvent.value) return;
  
  try {
    const newArchivedState = !selectedEvent.value.archived;
    const eventData = {
      ...selectedEvent.value,
      archived: newArchivedState
    };
    
    await updateEvent(selectedEvent.value.id, eventData, seasonId.value);
    
    // Mettre à jour l'événement localement
    selectedEvent.value.archived = newArchivedState;
    
    // Mettre à jour la liste des événements
    const eventIndex = events.value.findIndex(e => e.id === selectedEvent.value.id);
    if (eventIndex !== -1) {
      events.value[eventIndex].archived = newArchivedState;
    }
    
    showSuccessMessage.value = true;
    successMessage.value = newArchivedState ? 'Événement archivé avec succès !' : 'Événement désarchivé avec succès !';
    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 3000);
    
  } catch (error) {
    console.error('Erreur lors de la modification de l\'archivage:', error);
    alert('Erreur lors de la modification de l\'archivage. Veuillez réessayer.');
  }
}

// Fonctions pour le modal joueur
function showPlayerDetails(player) {
  selectedPlayer.value = player;
  showPlayerModal.value = true;
}

function closePlayerModal() {
  showPlayerModal.value = false;
  selectedPlayer.value = null;
}

async function handlePlayerUpdate({ playerId, newName }) {
  try {
    await updatePlayer(playerId, newName, seasonId.value);
    
    // Recharger les données
    await Promise.all([
      loadPlayers(seasonId.value),
      loadAvailability(players.value, events.value, seasonId.value),
      loadSelections(seasonId.value)
    ]).then(([newPlayers, newAvailability, newSelections]) => {
      players.value = newPlayers;
      availability.value = newAvailability;
      selections.value = newSelections;
      
      // Recharger l'état de protection des joueurs
      loadProtectedPlayers()
      
      // Mettre à jour le selectedPlayer dans le modal
      if (selectedPlayer.value && selectedPlayer.value.id === playerId) {
        const updatedPlayer = newPlayers.find(p => p.id === playerId);
        if (updatedPlayer) {
          selectedPlayer.value = updatedPlayer;
        }
      }
    });
    
    showSuccessMessage.value = true;
    successMessage.value = 'Joueur mis à jour avec succès !';
    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 3000);
  } catch (error) {
    console.error('Erreur lors de l\'édition du joueur:', error);
    alert('Erreur lors de l\'édition du joueur. Veuillez réessayer.');
  }
}

async function handlePlayerRefresh() {
  try {
    // Recharger les données
    await Promise.all([
      loadPlayers(seasonId.value),
      loadAvailability(players.value, events.value, seasonId.value),
      loadSelections(seasonId.value)
    ]).then(([newPlayers, newAvailability, newSelections]) => {
      players.value = newPlayers;
      availability.value = newAvailability;
      selections.value = newSelections;
      
      // Recharger l'état de protection des joueurs
      loadProtectedPlayers()
      
      // Mettre à jour le selectedPlayer dans le modal
      if (selectedPlayer.value) {
        const updatedPlayer = newPlayers.find(p => p.id === selectedPlayer.value.id);
        if (updatedPlayer) {
          selectedPlayer.value = updatedPlayer;
        }
      }
    });
    
    showSuccessMessage.value = true;
    successMessage.value = 'Données mises à jour !';
    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 3000);
  } catch (error) {
    console.error('Erreur lors du rafraîchissement:', error);
  }
}

function getPlayerStats(player) {
  if (!player) return { availability: 0, selection: 0, ratio: 0 };
  
  const availability = countAvailability(player.name);
  const selection = countSelections(player.name);
  const ratio = availability === 0 ? 0 : Math.round((selection / availability) * 100);
  
  return { availability, selection, ratio };
}

// Fonctions pour détecter l'état des événements
function getEventStatus(eventId) {
  const selectedPlayers = selections.value[eventId] || []
  const event = events.value.find(e => e.id === eventId)
  const requiredCount = event?.playerCount || 6
  const availableCount = countAvailablePlayers(eventId)
  
  // Cas 1: Sélection incomplète (sélection existante avec problèmes)
  if (selectedPlayers.length > 0) {
    const hasUnavailablePlayers = selectedPlayers.some(playerName => !isAvailable(playerName, eventId))
    const hasInsufficientPlayers = availableCount < requiredCount
    
    if (hasUnavailablePlayers || hasInsufficientPlayers) {
      return {
        type: 'incomplete',
        hasUnavailablePlayers,
        hasInsufficientPlayers,
        unavailablePlayers: selectedPlayers.filter(playerName => !isAvailable(playerName, eventId)),
        availableCount,
        requiredCount
      }
    }
  }
  
  // Cas 2: Pas assez de joueurs pour faire une sélection
  if (availableCount < requiredCount) {
    return {
      type: 'insufficient',
      availableCount,
      requiredCount
    }
  }
  
  // Cas 3: Assez de joueurs mais pas de sélection
  if (selectedPlayers.length === 0) {
    return {
      type: 'ready',
      availableCount,
      requiredCount
    }
  }
  
  // Cas 4: Sélection complète (tous les joueurs sélectionnés sont disponibles)
  return {
    type: 'complete',
    availableCount,
    requiredCount
  }
}

function hasEventWarning(eventId) {
  const status = getEventStatus(eventId)
  return status.type === 'incomplete' || status.type === 'insufficient'
}

function getEventTooltip(eventId) {
  const status = getEventStatus(eventId)
  
  switch (status.type) {
    case 'incomplete':
      if (status.hasUnavailablePlayers) {
        if (status.unavailablePlayers.length === 1) {
          return `Sélection incomplète : ${status.unavailablePlayers[0]} n'est plus disponible`
        } else {
          return `Sélection incomplète : ${status.unavailablePlayers.length} joueurs ne sont plus disponibles`
        }
      } else {
        return `Sélection incomplète : ${status.availableCount} joueurs disponibles pour ${status.requiredCount} requis`
      }
    case 'insufficient':
      return `Pas assez de joueurs : ${status.availableCount} disponibles pour ${status.requiredCount} requis`
    case 'ready':
      return `Prêt pour la sélection : ${status.availableCount} joueurs disponibles`
    case 'complete':
      return `Sélection complète : ${status.availableCount} joueurs disponibles`
    default:
      return ''
  }
}

// Envoi d'emails de disponibilité aux joueurs protégés (avec liens magiques)
async function sendAvailabilityEmailsForEvent({ eventId, eventData, reason }) {
  if (!seasonId.value) return
  
  // Vérifier si l'événement est archivé
  const event = { id: eventId, ...eventData }
  if (event.archived) {
    console.log('Événement archivé, aucune notification envoyée:', event.title)
    showSuccessMessage.value = true
    successMessage.value = 'Aucune notification envoyée : événement archivé'
    setTimeout(() => { showSuccessMessage.value = false }, 3000)
    return
  }
  
  const failures = []
  for (const player of players.value) {
    const protectedFlag = await isPlayerProtected(player.id, seasonId.value)
    if (!protectedFlag) continue
    const email = await getPlayerEmail(player.id, seasonId.value)
    if (!email) continue
    try {
      const yes = await createMagicLink({ seasonId: seasonId.value, playerId: player.id, eventId: event.id, action: 'yes' })
      const no = await createMagicLink({ seasonId: seasonId.value, playerId: player.id, eventId: event.id, action: 'no' })
      const urlYes = `${yes.url}&slug=${encodeURIComponent(seasonSlug)}`
      const urlNo = `${no.url}&slug=${encodeURIComponent(seasonSlug)}`
      await queueAvailabilityEmail({
        toEmail: email,
        playerName: player.name,
        eventTitle: event.title,
        eventDate: formatDateFull(event.date),
        yesUrl: urlYes,
        noUrl: urlNo,
        reason
      })
    } catch (e) {
      console.error('Email non envoyé pour', player.name, e?.message || e)
      failures.push(player.id)
    }
  }
  showSuccessMessage.value = true
  successMessage.value = failures.length > 0
    ? `Emails envoyés (avec ${failures.length} échec(s))`
    : 'Emails envoyés aux joueurs protégés.'
  setTimeout(() => { showSuccessMessage.value = false }, 3000)
}

// Fonctions pour le modal d'annonce d'événement
function openEventAnnounceModal(event) {
  if (event?.archived) {
    showSuccessMessage.value = true
    successMessage.value = 'Impossible d\'annoncer un événement archivé'
    setTimeout(() => { showSuccessMessage.value = false }, 3000)
    return
  }
  
  // Fermer le dialogue de confirmation avant d'ouvrir la modale d'annonce
  closeAnnouncePrompt()
  
  eventToAnnounce.value = event
  showEventAnnounceModal.value = true
}

function closeEventAnnounceModal() {
  showEventAnnounceModal.value = false
  eventToAnnounce.value = null
}

function closeAnnouncePrompt() {
  showAnnouncePrompt.value = false
  announcePromptEvent.value = null
}

async function handleSendEmailNotifications({ eventId, eventData, reason, selectedPlayers }) {
  try {
    if (reason === 'selection') {
      // Mode sélection : envoyer des emails de notification de sélection
      await sendSelectionEmailsForEvent({ 
        eventId, 
        eventData, 
        selectedPlayers,
        seasonId: seasonId.value,
        seasonSlug: seasonSlug,
        players: enrichedPlayers.value
      })
      
      // Fermer le modal de sélection et afficher le message de succès
      closeSelectionModal()
      showSuccessMessage.value = true
      successMessage.value = 'Notifications de sélection envoyées avec succès !'
      setTimeout(() => { showSuccessMessage.value = false }, 3000)
    } else {
      // Mode événement : utiliser la logique existante
      await sendAvailabilityEmailsForEvent({ eventId, eventData, reason })
      
      // Fermer le modal et afficher le message de succès
      closeEventAnnounceModal()
      showSuccessMessage.value = true
      successMessage.value = 'Notifications envoyées avec succès !'
      setTimeout(() => { showSuccessMessage.value = false }, 3000)
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error)
    showSuccessMessage.value = true
    successMessage.value = 'Erreur lors de l\'envoi des notifications'
    setTimeout(() => { showSuccessMessage.value = false }, 3000)
  }
}

function getPlayerAvailabilityForEvent(eventId) {
  if (!eventId) return {}
  
  const availabilityMap = {}
  players.value.forEach(player => {
    availabilityMap[player.name] = isAvailable(player.name, eventId)
  })
  
  return availabilityMap
}

// Fonctions pour la nouvelle popin de sélection
function openSelectionModal(event) {
  selectionModalEvent.value = event
  showSelectionModal.value = true
}

function closeSelectionModal() {
  showSelectionModal.value = false
  selectionModalEvent.value = null
}

// Désistement helpers supprimés

async function handleSelectionFromModal() {
  if (!selectionModalEvent.value) return
  
  const eventId = selectionModalEvent.value.id
  const count = selectionModalEvent.value.playerCount || 6
  
  // Vérifier s'il y a des joueurs disponibles
  const availableCount = countAvailablePlayers(eventId)
  if (availableCount === 0) {
    showSuccessMessage.value = true
    successMessage.value = 'Aucun joueur disponible pour cet événement'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
    return
  }
  
  // Demander le PIN code avant de lancer la sélection
  await requirePin({
    type: 'launchSelection',
    data: { eventId, count }
  })
}

function handlePerfectFromModal() {
  closeSelectionModal()
  showSuccessMessage.value = true
  successMessage.value = 'Sélection validée !'
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

// Fonction pour gérer le focus sur un événement spécifique depuis l'URL
async function focusOnEventFromUrl(eventId, targetEvent) {
  if (!eventId || !targetEvent) return
  
  // Nettoyer l'ancien focus
  clearEventFocus()
  
  // Définir le nouvel événement ciblé
  focusedEventId.value = eventId
  showFocusedEventHighlight.value = true
  
  // Attendre que le DOM soit rendu
  await nextTick()
  
  const eventElement = document.querySelector(`[data-event-id="${eventId}"]`)
  if (!eventElement) {
    console.warn('Élément événement non trouvé dans le DOM')
    return
  }
  
  // Retirer l'ancienne mise en évidence
  document.querySelectorAll('.focused-event-highlight').forEach(el => {
    el.classList.remove('focused-event-highlight')
  })
  
  // Appliquer la mise en évidence sur TOUTE la colonne (en-tête + cellules de disponibilité)
  const allEventElements = document.querySelectorAll(`[data-event-id="${eventId}"]`)
  allEventElements.forEach(el => {
    el.classList.add('focused-event-highlight')
  })
  
  // Ajouter une classe spéciale pour créer l'effet de colonne entourée
  const firstElement = allEventElements[0]
  const lastElement = allEventElements[allEventElements.length - 1]
  
  if (firstElement) firstElement.classList.add('focused-event-column-start')
  if (lastElement) lastElement.classList.add('focused-event-column-end')
  
  // Scroll optimisé pour mobile et desktop
  await scrollToEvent(eventElement)
  
  // Message informatif
  showSuccessMessage.value = true
  successMessage.value = `Événement ciblé : ${targetEvent.title}`
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 4000)
  
  // Arrêter le highlight après 8 secondes
  focusedEventScrollTimeout.value = setTimeout(() => {
    clearEventFocus()
  }, 8000)
}

// Fonction pour gérer le focus sur un événement spécifique (générique)
function focusOnEvent(eventId) {
  if (!eventId) return
  
  const targetEvent = events.value.find(e => e.id === eventId)
  if (!targetEvent) {
    console.warn(`Événement ${eventId} non trouvé dans la liste des événements`)
    // Attendre un peu et réessayer
    setTimeout(() => {
      const retryEvent = events.value.find(e => e.id === eventId)
      if (retryEvent) {
        focusOnEventFromUrl(eventId, retryEvent)
      } else {
        console.error(`Événement ${eventId} toujours introuvable après retry`)
      }
    }, 500)
    return
  }
  
  // Utiliser la fonction spécialisée pour l'URL
  focusOnEventFromUrl(eventId, targetEvent)
}

// Fonction pour faire défiler vers un événement avec logique mobile/desktop
async function scrollToEvent(eventElement) {
  if (!eventElement) return
  
  // Attendre un peu pour s'assurer que le DOM est stable
  await new Promise(resolve => setTimeout(resolve, 100))
  
  if (window.innerWidth <= 768) {
    // Logique mobile : centrer l'événement dans la vue
    const container = gridboardRef.value
    if (container) {
      // Calculer la position optimale pour centrer l'événement
      const eventLeft = eventElement.offsetLeft
      const eventWidth = eventElement.offsetWidth
      const containerWidth = container.clientWidth
      
      // Position pour centrer l'événement
      const targetScrollLeft = eventLeft - (containerWidth / 2) + (eventWidth / 2)
      
      // Appliquer le scroll avec des limites
      const maxScrollLeft = container.scrollWidth - containerWidth
      const finalScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft))
      
      container.scrollTo({
        left: finalScrollLeft,
        behavior: 'smooth'
      })
      
      // Vérifier que l'événement est bien visible après le scroll
      setTimeout(() => {
        const rect = eventElement.getBoundingClientRect()
        if (rect.left < 0 || rect.right > window.innerWidth) {
          // Si l'événement n'est pas complètement visible, ajuster
          const adjustedScrollLeft = eventLeft - 20 // Laisser une marge
          container.scrollTo({
            left: Math.max(0, adjustedScrollLeft),
            behavior: 'smooth'
          })
        }
      }, 500)
    }
  } else {
    // Logique desktop : centrer l'événement
    eventElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'center'
    })
  }
  
  // Centrer aussi la zone de disponibilités (gridboard) si elle existe
  const gridboardContainer = gridboardRef.value
  if (gridboardContainer) {
    // Attendre que le scroll de l'en-tête soit terminé
    setTimeout(() => {
      // Trouver la première cellule de disponibilité pour cet événement
      const firstAvailabilityCell = document.querySelector(`[data-event-id="${focusedEventId.value}"]`)
      if (firstAvailabilityCell && firstAvailabilityCell.closest('tbody')) {
        // C'est une cellule de disponibilité, centrer la vue
        const cellLeft = firstAvailabilityCell.offsetLeft
        const cellWidth = firstAvailabilityCell.offsetWidth
        const containerWidth = gridboardContainer.clientWidth
        
        // Position pour centrer la cellule
        const targetScrollLeft = cellLeft - (containerWidth / 2) + (cellWidth / 2)
        
        // Appliquer le scroll avec des limites
        const maxScrollLeft = gridboardContainer.scrollWidth - containerWidth
        const finalScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft))
        
        gridboardContainer.scrollTo({
          left: finalScrollLeft,
          behavior: 'smooth'
        })
      }
    }, 300) // Attendre 300ms pour que le scroll de l'en-tête soit terminé
  }
}

// Fonction pour nettoyer le focus
function clearEventFocus() {
  // Nettoyer le timeout de scroll si il existe
  if (focusedEventScrollTimeout.value) {
    clearTimeout(focusedEventScrollTimeout.value)
    focusedEventScrollTimeout.value = null
  }
  
  focusedEventId.value = null
  showFocusedEventHighlight.value = false
  
  // Retirer la classe CSS de mise en évidence
  document.querySelectorAll('.focused-event-highlight').forEach(el => {
    el.classList.remove('focused-event-highlight')
  })
  
  // Retirer les classes de colonne
  document.querySelectorAll('.focused-event-column-start, .focused-event-column-end').forEach(el => {
    el.classList.remove('focused-event-column-start', 'focused-event-column-end')
  })
}

// end of script setup
</script>
