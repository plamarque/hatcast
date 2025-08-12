<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <!-- Header avec titre de la saison -->
    <div ref="pageHeaderRef" class="sticky top-0 z-[60] text-center py-4 md:py-6 px-4 relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900/95 backdrop-blur-sm border-b border-white/10">
      <!-- Flèche de retour -->
      <button 
        @click="goBack"
        class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
        title="Retour aux saisons"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      
      <h1 class="text-4xl font-bold text-white mb-0 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
        {{ seasonName ? seasonName : 'Chargement...' }}
      </h1>
      
      <!-- Actions à droite -->
      <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <!-- Desktop: actions visibles -->
        <div class="hidden md:flex items-center gap-2">
          <button
            @click="openAccount"
            class="text-white hover:text-purple-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
            title="Mon compte"
            aria-label="Mon compte"
          >
            <span class="text-2xl">👤</span>
          </button>
          
          <button
            @click="showHowItWorksGlobal = true"
            class="text-white hover:text-purple-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
            title="Kezako ?"
            aria-label="Kezako ?"
          >
            <span class="text-2xl">❓</span>
          </button>
        </div>

        <!-- Mobile: menu 3 points -->
        <div class="relative md:hidden" ref="headerMenuRef">
            <button
              @click.stop="toggleHeaderMenu(); updateHeaderMenuPosition()"
              class="text-white hover:text-purple-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
              title="Menu"
              aria-label="Menu"
            >
              <span class="text-2xl">⋯</span>
            </button>
        </div>
        <teleport to="body">
          <div
            v-if="showHeaderMenu"
            ref="headerMenuDropdownRef"
            class="w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-[400] overflow-hidden"
            :style="headerMenuStyle"
          >
            
            <button
              @click="openAccount(); closeHeaderMenu()"
              class="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center gap-2"
            >
              <span>👤</span>
              <span class="text-sm">Mon compte</span>
            </button>
            
            <button
              @click="showHowItWorksGlobal = true; closeHeaderMenu()"
              class="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center gap-2"
            >
              <span>❓</span>
              <span class="text-sm">Kezako ?</span>
            </button>
          </div>
        </teleport>
      </div>
    </div>

    <div class="w-full px-0 md:px-0 pb-0 pt-[72px] md:pt-[80px] -mt-[72px] md:-mt-[80px] bg-gray-900">
      <!-- Sticky header bar outside horizontal scroller (sync with scrollLeft) -->
      <div ref="headerBarRef" class="sticky top-0 z-[80] bg-gray-900 overflow-hidden">
        <div class="flex items-stretch relative">
          <!-- Left sticky cell (masqué pendant l'étape 1 pour éviter le doublon avec l'onboarding) -->
          <div v-if="(events.length === 0 && players.length === 0) ? false : true" class="col-left flex-shrink-0 p-3 md:p-4 sticky left-0 z-[81] bg-gray-900 h-full">
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
                :class="{ 'archived-header': event.archived }"
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

          <!-- Toggle archived events (top-right, above right chevron) -->
          <button
            @click="toggleShowArchived"
            class="absolute right-2 top-2 w-9 h-9 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-[86] backdrop-blur-sm"
            :title="showArchived ? 'Masquer les événements archivés' : 'Afficher les événements archivés'"
            :aria-label="showArchived ? 'Masquer les événements archivés' : 'Afficher les événements archivés'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.25 12c1.5-4 5.25-7.5 9.75-7.5S20.25 8 21.75 12c-1.5 4-5.25 7.5-9.75 7.5S3.75 16 2.25 12z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path v-if="!showArchived" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18"/>
            </svg>
          </button>

          <!-- Horizontal scroll chevrons -->
          <button
            v-show="showLeftHint"
            @click.prevent="onChevronClick(-1, $event)"
            @mousedown.prevent="startHoldScroll(-1, $event)"
            @mouseup="stopHoldScroll($event)"
            @mouseleave="stopHoldScroll($event)"
            @touchstart.prevent="startHoldScroll(-1, $event)"
            @touchend="stopHoldScroll($event)"
            @touchcancel="stopHoldScroll($event)"
            class="absolute left-2 bottom-2 w-9 h-9 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-[85] backdrop-blur-sm"
            title="Événements précédents — cliquez pour défiler"
          >
            ‹
          </button>
          <button
            v-show="showRightHint"
            @click.prevent="onChevronClick(1, $event)"
            @mousedown.prevent="startHoldScroll(1, $event)"
            @mouseup="stopHoldScroll($event)"
            @mouseleave="stopHoldScroll($event)"
            @touchstart.prevent="startHoldScroll(1, $event)"
            @touchend="stopHoldScroll($event)"
            @touchcancel="stopHoldScroll($event)"
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
        <!-- Coachmarks d'onboarding (mini-fenêtres contextuelles) -->
        <div v-if="playerTourStep === 1" class="pointer-events-none">
          <!-- Étape 1: coachmark bouton Ajouter un joueur -->
          <div
            v-if="addPlayerCoachmark.position"
            class="fixed z-[400]"
            :style="{ left: addPlayerCoachmark.position.x + 'px', top: addPlayerCoachmark.position.y + 'px' }"
          >
            <div id="coachmark-add" class="coachmark pointer-events-auto max-w-sm bg-gray-900 border border-purple-500/40 rounded-xl shadow-2xl p-3 text-white relative" :class="{ 'coachmark-right': addPlayerCoachmark.side === 'right', 'coachmark-left': addPlayerCoachmark.side === 'left' }">
              <div class="text-lg md:text-base font-semibold mb-1">Ajoutez votre nom</div>
              <div class="text-base md:text-sm text-gray-300 mb-2">Cliquez sur "Ajouter un joueur" pour vous inscrire</div>
              <div class="flex items-center justify-between">
                <span class="text-purple-300 text-base md:text-sm">Étape 1/4</span>
                <button @click="dismissCoachmarkStep(0)" class="text-base md:text-sm text-white/80 hover:text-white">Suivant ></button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="playerTourStep === 2 && guidedPlayerId && guidedEventId" class="pointer-events-none">
          <!-- Étape 2: coachmark cellule disponibilité -->
          <div
            v-if="availabilityCoachmark.position"
            class="fixed z-[400]"
            :style="{ position: 'absolute', left: availabilityCoachmark.position.x + 'px', top: availabilityCoachmark.position.y + 'px' }"
          >
            <div id="coachmark-avail" class="coachmark pointer-events-auto max-w-sm bg-gray-900 border border-pink-500/40 rounded-xl shadow-2xl p-3 text-white relative">
              <div class="text-lg md:text-base font-semibold mb-1">Indiquez vos disponibilités</div>
              <div class="text-base md:text-sm text-gray-300 mb-2">Cliquez cette case pour alterner Oui / Non / Vide</div>
              <div class="flex items-center justify-between">
                <span class="text-pink-300 text-base md:text-sm">Étape 2/4</span>
                <button @click="dismissCoachmarkStep(1)" class="text-base md:text-sm text-white/80 hover:text-white">Suivant</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="playerTourStep === 3 && guidedPlayerId" class="pointer-events-none">
          <!-- Étape 3: coachmark nom joueur -->
          <div
            v-if="playerNameCoachmark.position"
            class="fixed z-[400]"
            :style="{ position: 'absolute', left: playerNameCoachmark.position.x + 'px', top: playerNameCoachmark.position.y + 'px' }"
          >
            <div id="coachmark-name" class="coachmark pointer-events-auto max-w-sm bg-gray-900 border border-yellow-500/40 rounded-xl shadow-2xl p-3 text-white relative">
              <div class="text-lg md:text-base font-semibold mb-1">Ouvrez votre fiche</div>
              <div class="text-base md:text-sm text-gray-300 mb-2">Cliquez sur votre nom pour voir les détails et la protection</div>
              <div class="flex items-center justify-between">
                <span class="text-yellow-300 text-base md:text-sm">Étape 3/4</span>
                <button @click="dismissCoachmarkStep(2)" class="text-base md:text-sm text-white/80 hover:text-white">Suivant</button>
              </div>
            </div>
          </div>
        </div>

        <table class="table-auto border-separate border-spacing-0 table-fixed w-auto min-w-max">
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
              :class="{ 'highlighted-player': player.id === highlightedPlayer, 'preferred-player': preferredPlayerIdsSet.has(player.id) }"
            >
              <td class="px-0 py-4 md:py-5 font-medium text-white relative group text-xl md:text-2xl sticky left-0 z-40 bg-gray-900 left-col-td">
                <div class="px-4 md:px-5 font-bold text-xl md:text-2xl flex items-center w-full min-w-0">
                  <span 
                    v-if="preferredPlayerIdsSet.has(player.id)"
                    class="text-yellow-400 mr-1 text-sm"
                    title="Mon joueur"
                  >
                    ⭐
                  </span>
                  <span 
                    v-else-if="isPlayerProtectedInGrid(player.id)"
                    class="text-yellow-400 mr-1 text-sm"
                    title="Joueur protégé par mot de passe"
                  >
                    🔒
                  </span>
                  <span 
                    @click="showPlayerDetails(player)" 
                     class="player-name hover:border-b-2 hover:border-dashed hover:border-purple-400 cursor-pointer transition-colors duration-200 text-[22px] md:text-2xl leading-tight block truncate max-w-full flex-1 min-w-0"
                    :class="{ 'inline-block rounded px-1 ring-2 ring-yellow-400 animate-pulse': playerTourStep === 3 && player.id === (guidedPlayerId || (sortedPlayers[0]?.id)) }"
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
                :class="[
                  'p-0',
                  event.archived ? 'archived-col' : '',
                  { 'relative ring-2 ring-pink-400 rounded-md animate-pulse': playerTourStep === 2 && player.id === (guidedPlayerId || (sortedPlayers[0]?.id)) && event.id === (guidedEventId || (displayedEvents[0]?.id)) }
                ]"
              >
                <AvailabilityCell
                  :player-name="player.name"
                  :event-id="event.id"
                  :is-available="isAvailable(player.name, event.id)"
                   :is-selected="isSelected(player.name, event.id)"
                   :chance-percent="chances[player.name]?.[event.id] ?? null"
                   :show-selected-chance="isSelectionComplete(event.id)"
                   :disabled="event.archived === true"
                   @toggle="toggleAvailability"
                />
              </td>
              <td class="p-3 md:p-4"></td>
            </tr>
            <!-- Dernière ligne: ajouter un joueur (toujours visible pour éviter blocage quand 0 joueur) -->
            <tr class="border-t border-white/10">
              <td class="px-0 py-4 md:py-5 sticky left-0 z-40 bg-gray-900 left-col-td">
                <div class="px-4 md:px-5 flex items-center">
                  <button
                    @click="newPlayerForm = true"
                    class="w-full md:w-auto flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 text-sm md:text-base font-medium"
                    title="Ajouter un nouveau joueur"
                    data-onboarding="add-player"
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
                :class="['p-3 md:p-5', event.archived ? 'archived-col' : '']"
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
      <p class="text-white text-lg">{{ currentLoadingLabel }}…</p>
      <div class="mt-3 w-64 h-2 bg-white/10 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300" :style="{ width: loadingProgress + '%' }"></div>
      </div>
      <p class="text-white/60 text-xs mt-2">{{ loadingProgress }}%</p>
    </div>
  </div>

  <CreatorOnboardingModal
    v-if="!isLoadingGrid"
    :season-id="seasonId"
    :season-slug="seasonSlug"
    :players-count="players.length"
    :events-count="events.length"
    :onboarding-done="seasonMeta?.onboardingCreatorDone === true"
    @create-event="openNewEventForm"
    @add-player="() => { newPlayerForm = true }"
    @copy-link="copyJoinLink"
    @dismissed="afterCloseOnboarding"
  />

  <!-- Ancienne modale d'onboarding joueur désactivée au profit de coachmarks interactifs -->
  <PlayerOnboardingModal
    v-if="false && !isLoadingGrid"
    :season-id="seasonId"
    :players-count="players.length"
    :events-count="events.length"
    :creator-onboarding-done="seasonMeta?.onboardingCreatorDone === true"
  />

  

  <!-- Message de succès -->
  <div v-if="showSuccessMessage" class="fixed bottom-4 left-4 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-2xl border border-green-400/30 backdrop-blur-sm z-[200]">
    <div class="flex items-center space-x-2">
      <span class="text-xl">✨</span>
      <span>{{ successMessage }}</span>
    </div>
  </div>

  <!-- Message d'erreur -->
  <div v-if="showErrorMessage" class="fixed bottom-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl shadow-2xl border border-red-400/30 backdrop-blur-sm z-[200]">
    <div class="flex items-center space-x-2">
      <span class="text-xl">⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>
  </div>

  <!-- Modales -->
  <div v-if="newEventForm" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
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
  <div v-if="newPlayerForm" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
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
          <div class="p-3 md:p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-center">
            <div class="text-xl md:text-2xl font-bold text-yellow-300">{{ Math.max((selectedEvent?.playerCount || 6) - countSelectedPlayers(selectedEvent?.id), 0) }}</div>
            <div class="text-xs md:text-sm text-yellow-300">manquants</div>
          </div>
        </div>

        <!-- Section des disponibilités des joueurs (style allégé, filtres) -->
        <div v-if="selectedEvent" class="mb-4 md:mb-6">
          <!-- Alerte + Filtres -->
          <div class="mb-3 flex items-center">
            <div
              v-if="hasEventWarningForSelectedEvent"
              class="flex items-center gap-2 px-2 py-1 rounded-md border text-[11px] md:text-xs max-w-[70%] truncate"
              :class="eventStatus?.type === 'incomplete' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200' : 'bg-orange-500/10 border-orange-500/30 text-orange-200'"
              :title="eventWarningText"
            >
              <span>⚠️</span>
              <span class="truncate">{{ eventWarningText }}</span>
            </div>

            <select
              v-model="availabilityFilter"
              class="ml-auto bg-gray-800 text-white rounded-md px-3 py-2 border border-white/10 focus:outline-none text-sm"
              title="Filtrer les joueurs par statut"
            >
              <option value="selected">Sélectionnés</option>
              <option value="available">Disponibles</option>
              <option value="unavailable">Non Disponibles</option>
              <option value="unknown">Pas de réponse</option>
              <option value="all">Tous</option>
            </select>
          </div>

          <!-- Liste des joueurs (sans contour/table header) -->
          <div class="space-y-0.5">
            <div
              v-for="player in filteredPlayers"
              :key="player.id"
              class="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-800/40 transition-colors"
            >
              <div class="flex items-center min-w-0 gap-1.5">
                <span
                  v-if="preferredPlayerIdsSet.has(player.id)"
                  class="text-yellow-400 mr-1 text-xs"
                  title="Mon joueur"
                >
                  ⭐
                </span>
                <span
                  v-else-if="isPlayerProtectedInGrid(player.id)"
                  class="text-yellow-400 mr-1 text-xs"
                  title="Joueur protégé par mot de passe"
                >
                  🔒
                </span>
                <span
                  class="text-white text-sm md:text-base block truncate max-w-full flex-1 min-w-0"
                  :title="player.name"
                >
                  {{ player.name }}
                </span>
              </div>

              <div class="flex-0 p-0">
                <AvailabilityCell
                  :player-name="player.name"
                  :event-id="selectedEvent.id"
                  :is-available="getPlayerAvailabilityForEvent(selectedEvent.id)[player.name]"
                  :is-selected="isPlayerSelected(player.name, selectedEvent.id)"
                  :chance-percent="chances[player.name]?.[selectedEvent.id] ?? null"
                  :show-selected-chance="isSelectionComplete(selectedEvent.id)"
                  :disabled="selectedEvent?.archived === true"
                  :compact="true"
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
    ref="playerModalRef"
    :show="showPlayerModal"
    :player="selectedPlayer"
    :stats="getPlayerStats(selectedPlayer)"
    :seasonId="seasonId"
    :onboarding-step="playerTourStep"
    :onboarding-player-id="guidedPlayerId"
    @close="closePlayerModal"
    @update="handlePlayerUpdate"
    @delete="handlePlayerDelete"
    @refresh="handlePlayerRefresh"
    @advance-onboarding="(s) => { try { if (typeof playerTourStep !== 'undefined') playerTourStep.value = s } catch {} }"
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
    @send-notifications="handleSendNotifications"
    @update-selection="handleUpdateSelectionFromModal"
  />

  <!-- Modal d'annonce d'événement -->
  <EventAnnounceModal
    :show="showEventAnnounceModal"
    :event="eventToAnnounce"
    :season-id="seasonId"
    :season-slug="seasonSlug"
    :players="enrichedPlayers"
    :sending="isSendingNotifications"
    :availability-by-player="getPlayerAvailabilityForEvent(eventToAnnounce?.id)"
    @close="closeEventAnnounceModal"
    @send-notifications="handleSendNotifications"
  />

  <!-- Popin Aide (global) -->
  <AppHelpModal :show="showHowItWorksGlobal" @close="showHowItWorksGlobal = false" />

  <!-- Menu Compte (global) -->
  <AccountMenu
    :show="showAccountMenu"
    :season-id="seasonId"
    @close="closeAccountMenu"
    @manage-player="onManageAccountPlayer"
    @change-password="handleAccountChangePassword"
    @logout-device="handleAccountLogoutDevice"
    @delete-account="handleAccountDeleteAccount"
  />

  <!-- Auth/Association pour ouvrir Mon compte -->
  <AccountClaimModal
    :show="showAccountAuth"
    :player="accountAuthPlayer"
    :season-id="seasonId"
    @close="showAccountAuth = false"
    @success="() => { showAccountAuth = false; showAccountMenu = true }"
  />

  <AccountLoginModal
    :show="showAccountLogin"
    @close="showAccountLogin = false"
    @success="() => { showAccountLogin = false; showAccountMenu = true }"
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

/* Surbrillance légère pour le joueur préféré localement */
.preferred-player {
  background: linear-gradient(90deg, rgba(234, 179, 8, 0.10), rgba(234, 179, 8, 0.05)) !important; /* jaune doux */
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

/* Empêcher la cellule gauche sticky de s'élargir plus que la colonne prévue */
.left-col-td {
  width: 11rem;
  max-width: 11rem;
  min-width: 11rem;
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
  
  /* Colonne atténuée pour événements archivés */
  .archived-header {
    filter: grayscale(25%);
    opacity: 0.7;
    background: linear-gradient(180deg, rgba(148,163,184,0.12), rgba(148,163,184,0.08));
  }
  td.archived-col {
    background: linear-gradient(180deg, rgba(148,163,184,0.10), rgba(148,163,184,0.06)); /* slate tint */
    position: relative;
  }
  td.archived-col::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(100,116,139,0.08); /* extra veil */
    pointer-events: none;
  }
.col-left { width: 11rem; }
.col-event { width: 15rem; }
.col-right { width: 4.5rem; }

@media (min-width: 640px) { /* sm */
  .col-left { width: 12rem; }
  .left-col-td { width: 12rem; max-width: 12rem; min-width: 12rem; }
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
  .col-left { width: 9.25rem; }
  .col-event { width: 12.25rem; }
  .left-col-td { width: 9.25rem; max-width: 9.25rem; min-width: 9.25rem; }
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

  /* Coachmarks: petite flèche vers l'élément ciblé (optionnelle, simple) */
  .coachmark:after {
    content: '';
    position: absolute;
    top: -8px;
    left: 16px;
    border-width: 0 8px 8px 8px;
    border-style: solid;
    border-color: transparent transparent rgba(17,24,39,1) transparent; /* bg-gray-900 */
  }

/* Variante flèche à gauche */
.coachmark-left:after {
  top: 16px;
  left: auto;
  right: -8px;
  border-width: 8px 0 8px 8px;
  border-color: transparent transparent transparent rgba(17,24,39,1);
}

/* Variante flèche à droite */
.coachmark-right:after {
  top: 16px;
  left: -8px;
  right: auto;
  border-width: 8px 8px 8px 0;
  border-color: transparent rgba(17,24,39,1) transparent transparent;
}

/* Largeurs adaptées mobile-first, avec fallback CSS pour Safari iOS */
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { collection, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase.js'
import { auth } from '../services/firebase.js'
import { listAssociationsForEmail } from '../services/playerProtection.js'
import { signOut } from 'firebase/auth'
import { isPlayerProtected, isPlayerPasswordCached, listProtectedPlayers, getPlayerEmail } from '../services/playerProtection.js'
import { 
  initializeStorage, 
  setStorageMode,
  loadPlayers,
  loadEvents,
  loadAvailability,
  loadSelections,
  addPlayer,
  deletePlayer,
  deleteEvent,
  updateEvent,
  saveEvent,
  saveAvailability,
  updatePlayer,
  saveSelection
} from '../services/storage.js'

import { createMagicLink } from '../services/magicLinks.js'
import { sendDeselectionEmailsForEvent } from '../services/emailService.js'
import { sendAvailabilityNotificationsForEvent, sendSelectionNotificationsForEvent } from '../services/notificationsService.js'
import { verifySeasonPin, getSeasonPin } from '../services/seasons.js'
import pinSessionManager from '../services/pinSession.js'
import playerPasswordSessionManager from '../services/playerPasswordSession.js'
import { rememberLastVisitedSeason } from '../services/seasonPreferences.js'
import AnnounceModal from './AnnounceModal.vue'
import EventAnnounceModal from './EventAnnounceModal.vue'
import AppHelpModal from './AppHelpModal.vue'
import PasswordResetModal from './PasswordResetModal.vue'
import PasswordVerificationModal from './PasswordVerificationModal.vue'
import PinModal from './PinModal.vue'
import PlayerModal from './PlayerModal.vue'
import PlayerClaimModal from './PlayerClaimModal.vue'
import SelectionModal from './SelectionModal.vue'
import AvailabilityCell from './AvailabilityCell.vue'
import CreatorOnboardingModal from './CreatorOnboardingModal.vue'
import PlayerOnboardingModal from './PlayerOnboardingModal.vue'
import AccountMenu from './AccountMenu.vue'
import AccountClaimModal from './AccountClaimModal.vue'
import AccountLoginModal from './AccountLoginModal.vue'

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
const seasonMeta = ref({})

const confirmDelete = ref(false)
const eventToDelete = ref(null)
const editingEvent = ref(null)
const editingTitle = ref('')
const editingDate = ref('')
const editingPlayerCount = ref(6)

const newPlayerForm = ref(false)
const newPlayerName = ref('')
const highlightedPlayer = ref(null)
const guidedPlayerId = ref(null)
const guidedEventId = ref(null)
const addPlayerCoachmark = ref({ position: null, side: null })
const availabilityCoachmark = ref({ position: null })
const playerNameCoachmark = ref({ position: null })
const confirmReselect = ref(false)
const eventIdToReselect = ref(null)

// Variables pour le modal joueur
const showPlayerModal = ref(false)
const selectedPlayer = ref(null)
const playerModalRef = ref(null)

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

// Mini-tutoriel joueur: déclenché après Join
const playerTourStep = ref(0) // 0=off, 1=toggle dispo, 2=ouvrir fiche, 3=done
function evaluatePlayerTourStart() {
  try {
    if (!seasonId.value) return
    // Ne pas démarrer l'onboarding joueur tant que l'onboarding créateur n'est pas terminé
    if (!seasonMeta.value || seasonMeta.value.onboardingCreatorDone !== true) return
    // Démarrer uniquement quand on a au moins 1 player et 1 event (utiliser events pour éviter dépendance précoce)
    if (events.value.length === 0) return
    const alreadyCompleted = localStorage.getItem(`playerTourCompleted:${seasonId.value}`)
    // Backfill préférences: si utilisateur connecté avec associations, peupler les préférés pour cette saison
    try {
      const userEmail = auth?.currentUser?.email || ''
      if (userEmail) {
        listAssociationsForEmail(userEmail).then(async (assocs) => {
          const seasonal = assocs.filter(a => a.seasonId === seasonId.value)
          if (seasonal.length > 0) {
            const key = `seasonPreferredPlayer:${seasonId.value}`
            const raw = localStorage.getItem(key)
            let current = []
            if (raw) {
              if (raw.startsWith('[')) { try { current = JSON.parse(raw) || [] } catch {} }
              else { current = [raw] }
            }
            const set = new Set(current)
            seasonal.forEach(a => set.add(a.playerId))
            const updated = Array.from(set)
            localStorage.setItem(key, JSON.stringify(updated))
          }
        }).catch(() => {})
      }
    } catch {}
    const startFlag = localStorage.getItem(`startPlayerTour:${seasonId.value}`)
    if (!alreadyCompleted && startFlag) {
      // Toujours démarrer par l'étape 1 (ajout) même si un joueur existe déjà
      playerTourStep.value = 1
      localStorage.removeItem(`startPlayerTour:${seasonId.value}`)
      // Positionner le coachmark près du bouton Ajouter un joueur (scroll si hors vue)
      nextTick(() => {
        const addBtn = document.querySelector('button[data-onboarding="add-player"]')
        if (addBtn) {
          // Faire remonter le bas du bouton dans le viewport pour garantir la place au-dessus
          addBtn.scrollIntoView({ behavior: 'smooth', block: 'end' })
          const rect = addBtn.getBoundingClientRect()
          const coachEl = document.getElementById('coachmark-add')
          const estimatedWidth = 280
          const estimatedHeight = 100
          const coachWidth = coachEl?.offsetWidth || estimatedWidth
          const coachHeight = coachEl?.offsetHeight || estimatedHeight
          const rightX = Math.round(rect.right + 12)
          const canRight = (rightX + coachWidth) <= (window.innerWidth - 12)
          if (canRight) {
            // Centrer verticalement dans le viewport (sans scrollY) + offset optique vers le haut
            const centerY = rect.top + rect.height / 2 - coachHeight / 2
            const opticalOffset = -14
            const minY = 12
            const maxY = window.innerHeight - coachHeight - 12
            const y = Math.max(minY, Math.min(Math.round(centerY + opticalOffset), maxY))
            addPlayerCoachmark.value = {
              position: { x: rightX, y },
              side: 'right'
            }
          } else {
            // Fallback: au-dessus centré horizontalement
            const centerX = Math.round(rect.left + rect.width / 2 - coachWidth / 2)
            const y = Math.round(rect.top - coachHeight - 8)
            const minX = 8
            const maxX = window.innerWidth - coachWidth - 8
            addPlayerCoachmark.value = { position: { x: Math.max(minX, Math.min(centerX, maxX)), y }, side: null }
          }
        }
      })
    }
  } catch {}
}

// Variables pour la nouvelle popin de sélection
const showSelectionModal = ref(false)
const selectionModalEvent = ref(null)
const selectionModalRef = ref(null)

// Variables pour le modal d'annonce d'événement
const showEventAnnounceModal = ref(false)
const eventToAnnounce = ref(null)
const showAnnouncePrompt = ref(false)
const announcePromptEvent = ref(null)
const showHowItWorksGlobal = ref(false)
const showAccountMenu = ref(false)
const showAccountAuth = ref(false)
const showAccountLogin = ref(false)
const accountAuthPlayer = ref(null)
function openAccountMenu() { showAccountMenu.value = true }
function closeAccountMenu() { showAccountMenu.value = false }
// Ouvrir compte avec flow d'association si anonyme
function openAccount() {
  try {
    const user = auth?.currentUser
    if (!user || user.isAnonymous) {
      // Choisir un joueur par défaut (préféré ou premier)
      let target = null
      if (preferredPlayerIdsSet.value && preferredPlayerIdsSet.value.size > 0) {
        const firstPreferredId = preferredPlayerIdsSet.value.values().next().value
        target = players.value.find(p => p.id === firstPreferredId) || null
      }
      if (!target) target = players.value[0] || null
      // Ouvrir login classique (email + mot de passe)
      showAccountLogin.value = true
      // Mémoriser un joueur si l'utilisateur choisit l'association ensuite
      if (target) accountAuthPlayer.value = target
      return
    }
  } catch {}
  showAccountMenu.value = true
}

async function handleAccountChangePassword() {
  try {
    const email = auth?.currentUser?.email
    if (!email) return
    const { resetPlayerPassword } = await import('../services/firebase.js')
    await resetPlayerPassword(email)
    showSuccessMessage.value = true
    successMessage.value = 'Email de réinitialisation envoyé.'
    setTimeout(() => { showSuccessMessage.value = false }, 3000)
  } catch (e) {
    showErrorMessage.value = true
    errorMessage.value = 'Impossible d\'envoyer l\'email de réinitialisation.'
    setTimeout(() => { showErrorMessage.value = false }, 3000)
  }
}

async function handleAccountLogoutDevice() {
  try {
    await signOut(auth)
    closeAccountMenu()
    showSuccessMessage.value = true
    successMessage.value = 'Déconnecté de cet appareil.'
    setTimeout(() => { showSuccessMessage.value = false }, 2500)
  } catch (e) {
    showErrorMessage.value = true
    errorMessage.value = 'Déconnexion impossible.'
    setTimeout(() => { showErrorMessage.value = false }, 3000)
  }
}

async function handleAccountDeleteAccount() {
  alert('Suppression de compte: contactez l\'organisateur pour dissocier vos joueurs. Fonction complète à venir.')
}

async function onManageAccountPlayer(assoc) {
  closeAccountMenu()
  try {
    if (assoc.seasonId && assoc.seasonId !== seasonId.value) {
      const seasonRef = doc(db, 'seasons', assoc.seasonId)
      const seasonSnap = await getDocs(collection(db, 'seasons'))
      const match = seasonSnap.docs.find(d => d.id === assoc.seasonId)
      const slug = match?.data()?.slug
      if (slug) {
        router.push(`/season/${slug}?player=${encodeURIComponent(assoc.playerId)}&open=protection`)
        return
      }
    } else {
      const player = players.value.find(p => p.id === assoc.playerId)
      if (player) {
        showPlayerDetails(player)
        return
      }
      // Fallback: ouvrir via URL
      router.push(`?player=${encodeURIComponent(assoc.playerId)}&open=protection`)
    }
  } catch (_) {}
}

  // Onboarding créateur (multi-étapes)
  // Onboarding créateur: géré par CreatorOnboardingModal
// Si l'utilisateur vient du /join, masquer l'onboarding créateur
onMounted(() => {
  try {
    if (seasonId.value) {
      const dismiss = localStorage.getItem(`dismissCreatorOnboarding:${seasonId.value}`)
      if (dismiss) {
        onboardingDismissedShare.value = true
      }
    }
  } catch {}
})

// Quand le modal onboarding se ferme, synchroniser la grille
function afterCloseOnboarding() {
  // Laisser le DOM s'actualiser puis forcer la sync
  nextTick(() => {
    forceGridLayoutSync()
  })
}

// Variables pour le modal de désistement
// Désistement modal supprimé: on utilise les magic links "no"

// Variables pour la protection des joueurs
const protectedPlayers = ref(new Set())
const isLoadingGrid = ref(true)
// Chargement multi-étapes de la grille
const loadingProgress = ref(0)
const currentLoadingLabel = ref('Préparation de la grille')

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
  const gridResizeObserver = ref(null)

function updateScrollHints() {
  const el = gridboardRef.value
  if (!el) return
  const { scrollLeft, scrollWidth, clientWidth } = el
  showLeftHint.value = scrollLeft > 2
  showRightHint.value = scrollLeft < scrollWidth - clientWidth - 2
}

// Forcer un recalcul des largeurs et synchronisation header/grille
function forceGridLayoutSync() {
  try {
    // Déclencher un reflow et resync des hints/header
    updateScrollHints()
    headerScrollX.value = gridboardRef.value?.scrollLeft || 0
  } catch {}
}

// (déplacé plus bas après déclaration de players/events)

// Scroll horizontal: défiler d'exactement une colonne par clic
function scrollHeaderBy(direction) {
  const container = gridboardRef.value
  if (!container) return

  // Mesurer la largeur d'une colonne d'événement
  let oneColumnWidth = 0

  // 1) Mesure d'une vraie cellule du tableau (plus fiable pour le scroll)
  const firstEventCell = container.querySelector('tbody tr td[data-event-id]')
  if (firstEventCell) {
    oneColumnWidth = firstEventCell.getBoundingClientRect().width
  } else if (headerEventsRef?.value) {
    // 2) Repli: mesure d'une colonne d'en-tête
    const firstHeaderCol = headerEventsRef.value.querySelector('.col-event')
    if (firstHeaderCol) {
      oneColumnWidth = firstHeaderCol.getBoundingClientRect().width
    }
  }

  // 3) Repli final
  if (!oneColumnWidth || !isFinite(oneColumnWidth)) {
    oneColumnWidth = container.clientWidth * 0.6
  }

  const target = container.scrollLeft + direction * oneColumnWidth
  container.scrollTo({ left: target, behavior: 'smooth' })
}

// Gestion du maintien (mobile/desktop) pour défilement continu à rythme lisible
const holdScrollTimer = ref(null)
const holdScrollRaf = ref(0)
const isHolding = ref(false)
const holdStarted = ref(false)
const currentHoldDirection = ref(0)

function onChevronClick(direction, evt) {
  // Sur mobile, un tap doit avancer d'une colonne.
  // Si un maintien avait démarré, on l'annule pour éviter double mouvement.
  if (evt && typeof evt.preventDefault === 'function') evt.preventDefault()
  stopHoldScroll()
  scrollHeaderBy(direction)
}

function startHoldScroll(direction, evt) {
  // Éviter le ghost click sur mobile
  if (evt && typeof evt.preventDefault === 'function') evt.preventDefault()

  // Si déjà en maintien, ignorer
  if (isHolding.value) return
  isHolding.value = true
  currentHoldDirection.value = direction
  holdStarted.value = false

  const container = gridboardRef.value
  if (!container) return

  // Mesure de base pour étapes incrémentales
  let oneColumnWidth = 0
  const firstEventCell = container.querySelector('tbody tr td[data-event-id]')
  if (firstEventCell) {
    oneColumnWidth = firstEventCell.getBoundingClientRect().width
  } else if (headerEventsRef?.value) {
    const firstHeaderCol = headerEventsRef.value.querySelector('.col-event')
    if (firstHeaderCol) oneColumnWidth = firstHeaderCol.getBoundingClientRect().width
  }
  if (!oneColumnWidth || !isFinite(oneColumnWidth)) {
    oneColumnWidth = container.clientWidth * 0.6
  }

  // Défilement progressif: ~1/6 de colonne tous les ~120ms (lisible)
  const stepPerTick = oneColumnWidth / 6
  const tickMs = 120

  const tick = () => {
    if (!isHolding.value || currentHoldDirection.value === 0) return
    if (!holdStarted.value) holdStarted.value = true
    const next = container.scrollLeft + currentHoldDirection.value * stepPerTick
    container.scrollTo({ left: next, behavior: 'auto' })
    holdScrollTimer.value = window.setTimeout(tick, tickMs)
  }

  // Petit délai avant de démarrer (distinction clic vs maintien)
  holdScrollTimer.value = window.setTimeout(tick, 250)
}

// (watcher déplacé plus bas après la déclaration de events/players)

function stopHoldScroll(evt) {
  if (evt && typeof evt.preventDefault === 'function') evt.preventDefault()
  const wasHolding = isHolding.value
  const wasHoldStarted = holdStarted.value

  isHolding.value = false
  if (holdScrollTimer.value) {
    clearTimeout(holdScrollTimer.value)
    holdScrollTimer.value = null
  }

  // Si c'est un touchend et que le maintien n'a pas démarré, on interprète comme un tap: 1 colonne
  if (evt && typeof evt.type === 'string' && evt.type.startsWith('touch') && !wasHoldStarted) {
    const dir = currentHoldDirection.value || 0
    if (dir !== 0) {
      scrollHeaderBy(dir)
    }
    currentHoldDirection.value = 0
    return
  }

  currentHoldDirection.value = 0

  // Si un maintien a réellement eu lieu, on snap à la colonne la plus proche
  if (wasHolding && wasHoldStarted) {
    snapToNearestColumn()
  }
}

function snapToNearestColumn() {
  const container = gridboardRef.value
  if (!container) return

  // Mesurer la largeur d'une colonne
  let colWidth = 0
  const firstEventCell = container.querySelector('tbody tr td[data-event-id]')
  if (firstEventCell) {
    colWidth = firstEventCell.getBoundingClientRect().width
  } else if (headerEventsRef?.value) {
    const firstHeaderCol = headerEventsRef.value.querySelector('.col-event')
    if (firstHeaderCol) colWidth = firstHeaderCol.getBoundingClientRect().width
  }
  if (!colWidth || !isFinite(colWidth) || colWidth <= 0) return

  const left = container.scrollLeft
  const idx = Math.round(left / colWidth)
  const target = idx * colWidth
  container.scrollTo({ left: target, behavior: 'smooth' })
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

// Repositionner la coachmark de l'étape 1 (ajout joueur) de façon robuste
function positionAddCoachmark() {
  if (playerTourStep.value !== 1) return
  const addBtn = document.querySelector('button[data-onboarding="add-player"]')
  if (!addBtn) return
  const rect = addBtn.getBoundingClientRect()
  const coachEl = document.getElementById('coachmark-add')
  const estimatedWidth = 280
  const estimatedHeight = 100
  const coachWidth = (coachEl?.offsetWidth && coachEl.offsetWidth > 0) ? coachEl.offsetWidth : estimatedWidth
  const coachHeight = (coachEl?.offsetHeight && coachEl.offsetHeight > 0) ? coachEl.offsetHeight : estimatedHeight
  const rightX = Math.round(rect.right + 12)
  const canRight = (rightX + coachWidth) <= (window.innerWidth - 12)
  if (canRight) {
    const centerY = rect.top + rect.height / 2 - coachHeight / 2
    const opticalOffset = -14
    const y = clampYWithHeader(centerY + opticalOffset, coachHeight)
    addPlayerCoachmark.value = { position: { x: rightX, y }, side: 'right' }
  } else {
    const centerX = Math.round(rect.left + rect.width / 2 - coachWidth / 2)
    const y = clampYWithHeader(rect.top - coachHeight - 8, coachHeight)
    const minX = 8
    const maxX = window.innerWidth - coachWidth - 8
    addPlayerCoachmark.value = { position: { x: Math.max(minX, Math.min(centerX, maxX)), y }, side: null }
  }
}

// Calcule un top sécurisé en tenant compte du header sticky visible
function clampYWithHeader(y, coachHeight) {
  const headerEl = pageHeaderRef?.value
  const headerH = headerEl ? Math.max(0, Math.round(headerEl.getBoundingClientRect().height || 0)) : 0
  const minY = Math.max(12, headerH + 8)
  const maxY = window.innerHeight - coachHeight - 12
  return Math.max(minY, Math.min(Math.round(y), maxY))
}

// Menu d'actions (mobile)
const showHeaderMenu = ref(false)
const headerMenuRef = ref(null)
const headerMenuDropdownRef = ref(null)
const headerMenuStyle = ref({ position: 'fixed', top: '0px', right: '0px' })

function updateHeaderMenuPosition() {
  try {
    const anchor = headerMenuRef.value
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    const gap = 8
    const top = Math.max(gap, Math.round(rect.bottom + gap))
    const right = Math.max(gap, Math.round(window.innerWidth - rect.right))
    headerMenuStyle.value = {
      position: 'fixed',
      top: `${top}px`,
      right: `${right}px`,
      zIndex: 400
    }
  } catch {}
}

function toggleHeaderMenu() {
  showHeaderMenu.value = !showHeaderMenu.value
  if (showHeaderMenu.value) nextTick(() => updateHeaderMenuPosition())
}
function closeHeaderMenu() { showHeaderMenu.value = false }
function onClickOutsideHeaderMenu(e) {
  if (!showHeaderMenu.value) return
  const anchorEl = headerMenuRef.value
  const dropdownEl = headerMenuDropdownRef.value
  const clickedInsideAnchor = anchorEl && anchorEl.contains(e.target)
  const clickedInsideDropdown = dropdownEl && dropdownEl.contains(e.target)
  if (!clickedInsideAnchor && !clickedInsideDropdown) showHeaderMenu.value = false
}
function onKeydownHeaderMenu(e) {
  if (e.key === 'Escape') closeHeaderMenu()
}
function repositionHeaderMenuIfOpen() {
  if (showHeaderMenu.value) updateHeaderMenuPosition()
}
onMounted(() => {
  document.addEventListener('click', onClickOutsideHeaderMenu)
  document.addEventListener('keydown', onKeydownHeaderMenu)
  window.addEventListener('scroll', repositionHeaderMenuIfOpen, { passive: true })
  window.addEventListener('resize', repositionHeaderMenuIfOpen)
})
onUnmounted(() => {
  document.removeEventListener('click', onClickOutsideHeaderMenu)
  document.removeEventListener('keydown', onKeydownHeaderMenu)
  window.removeEventListener('scroll', repositionHeaderMenuIfOpen)
  window.removeEventListener('resize', repositionHeaderMenuIfOpen)
})

// Repositionner la coachmark à l'étape 1 lors des scroll/resize et des changements de joueurs
function maybeRepositionCoachmark() {
  if (playerTourStep.value === 1 && addPlayerCoachmark.value?.position) {
    positionAddCoachmark()
  }
}
onMounted(() => {
  window.addEventListener('scroll', maybeRepositionCoachmark, { passive: true })
  window.addEventListener('resize', maybeRepositionCoachmark)
})
onUnmounted(() => {
  window.removeEventListener('scroll', maybeRepositionCoachmark)
  window.removeEventListener('resize', maybeRepositionCoachmark)
})

// Lancer immédiatement le tutoriel joueur (bouton en haut à droite)
function startPlayerTourNow() {
  try {
    if (seasonId.value) {
      localStorage.removeItem(`playerTourCompleted:${seasonId.value}`)
      localStorage.setItem(`startPlayerTour:${seasonId.value}`, '1')
    }
  } catch {}
  // Réinitialiser l'état de guidage
  guidedPlayerId.value = guidedPlayerId.value || (players.value[0]?.id || null)
  guidedEventId.value = displayedEvents.value[0]?.id || null
  addPlayerCoachmark.value.position = null
  availabilityCoachmark.value.position = null
  playerNameCoachmark.value.position = null
  // Démarrer à l'étape 1
  playerTourStep.value = 1
  // Positionner le coachmark sur le bouton Ajouter un joueur
  nextTick(() => {
    const addBtn = document.querySelector('button[data-onboarding="add-player"]')
    if (addBtn) {
      // Assurer que le bas du bouton est visible, puis mesurer après reflow
      addBtn.scrollIntoView({ behavior: 'smooth', block: 'end' })
      requestAnimationFrame(() => {
        const rect = addBtn.getBoundingClientRect()
        const coachEl = document.getElementById('coachmark-add')
        const estimatedWidth = 280
        const estimatedHeight = 100
        const coachWidth = coachEl?.offsetWidth || estimatedWidth
        const coachHeight = coachEl?.offsetHeight || estimatedHeight
        const rightX = Math.round(rect.right + 12)
        const canRight = (rightX + coachWidth) <= (window.innerWidth - 12)
        if (canRight) {
          const centerY = rect.top + rect.height / 2 - coachHeight / 2
          const opticalOffset = -14
          const minY = 12
          const maxY = window.innerHeight - coachHeight - 12
          const y = Math.max(minY, Math.min(Math.round(centerY + opticalOffset), maxY))
          addPlayerCoachmark.value = {
            position: { x: rightX, y },
            side: 'right'
          }
        } else {
          const centerX = Math.round(rect.left + rect.width / 2 - coachWidth / 2)
          const y = Math.round(rect.top - coachHeight - 8)
          const minX = 8
          const maxX = window.innerWidth - coachWidth - 8
          addPlayerCoachmark.value = { position: { x: Math.max(minX, Math.min(centerX, maxX)), y }, side: null }
        }
      })
    }
  })
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

// Helper: copier le lien d'inscription publique
function copyJoinLink() {
  try {
    const url = `${window.location.origin}/season/${seasonSlug}`
    navigator.clipboard.writeText(url)
    showSuccessMessage.value = true
    successMessage.value = 'Lien copié dans le presse-papiers'
    setTimeout(() => { showSuccessMessage.value = false }, 2500)
  } catch (e) {
    showErrorMessage.value = true
    errorMessage.value = 'Impossible de copier le lien'
    setTimeout(() => { showErrorMessage.value = false }, 2500)
  }
}

async function confirmDeleteEvent(eventId) {
  // Demander le PIN code avant d'afficher la confirmation
  await requirePin({
    type: 'deleteEvent',
    data: { eventId }
  })
}

async function deleteEventConfirmed(eventId = null) {
  const eventIdToDelete = eventId || eventToDelete.value
  // eslint-disable-next-line no-console
  console.debug('deleteEventConfirmed')
  
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
    // eslint-disable-next-line no-console
    console.error('Erreur lors de la suppression de l\'événement')
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
    // Après modification, proposer d'annoncer uniquement s'il y a des joueurs protégés
    if (!eventData.archived && players.value.length > 0 && protectedPlayers.value.size > 0) {
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
    // eslint-disable-next-line no-console
    console.error('Erreur lors de l\'édition de l\'événement')
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
    // eslint-disable-next-line no-console
    console.error('Erreur lors de la suppression du joueur')
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

      // Avancer à l'étape 2 (disponibilités) et définir les cibles du guidage
      guidedPlayerId.value = newId
      guidedEventId.value = (displayedEvents.value && displayedEvents.value[0] && displayedEvents.value[0].id) ? displayedEvents.value[0].id : null
      try { if (seasonId.value) localStorage.setItem(`lastAddedPlayerId:${seasonId.value}`, newId) } catch {}
      // Passer à l'étape 2 du tutoriel (indication des dispos)
      try { if (typeof playerTourStep !== 'undefined') playerTourStep.value = 2 } catch {}

      // Scroller automatiquement vers le joueur
      const row = document.querySelector(`[data-player-id="${newId}"]`)
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      // Positionner le coachmark de disponibilité
      nextTick(() => {
        const selector = `[data-player-id="${guidedPlayerId.value}"] td[data-event-id="${guidedEventId.value}"]`
        const cell = document.querySelector(selector)
        if (cell) {
          const rect = cell.getBoundingClientRect()
          availabilityCoachmark.value.position = {
            x: Math.round(rect.left),
            y: Math.round(rect.top + window.scrollY - 48)
          }
        }
      })

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
    // eslint-disable-next-line no-console
    console.error('Erreur lors de l\'ajout du joueur')
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
    // Après création, proposer d'annoncer uniquement s'il y a des joueurs protégés
    if (!eventData.archived && players.value.length > 0 && protectedPlayers.value.size > 0) {
      announcePromptEvent.value = { id: eventId, ...eventData }
      showAnnouncePrompt.value = true
    }
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erreur lors de la création de l\'événement')
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

// Resynchroniser header/grille quand la structure change (1er event/joueur)
watch([() => events.value.length, () => players.value.length, isLoadingGrid], () => {
  if (isLoadingGrid.value) return
  nextTick(() => {
    forceGridLayoutSync()
  })
})

// Lancer l'évaluation du mini-tutoriel joueur après la première charge de données
watch([() => players.value.length, () => events.value.length, seasonId], () => {
  evaluatePlayerTourStart()
})

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
    const data = seasonDoc.data()
    seasonName.value = data.name
    seasonMeta.value = data
    document.title = `Saison : ${seasonName.value}`
    
    // Mémoriser cette saison comme dernière visitée
    rememberLastVisitedSeason(props.slug)
  } else {
    // Saison introuvable: rediriger vers la page des saisons
    router.push('/seasons')
    return
  }

  // Charger les données de la saison
  if (seasonId.value) {
    // Étape 1: événements
    currentLoadingLabel.value = 'Chargement des événements de la saison'
    loadingProgress.value = 20
    const eventsSnap = await getDocs(collection(db, 'seasons', seasonId.value, 'events'))
    events.value = eventsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      playerCount: doc.data().playerCount || 6
    }))

    // Étape 2: joueurs
    currentLoadingLabel.value = 'Chargement des joueurs'
    loadingProgress.value = 45
    const playersSnap = await getDocs(collection(db, 'seasons', seasonId.value, 'players'))
    players.value = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Étape 3: disponibilités
    currentLoadingLabel.value = 'Chargement des disponibilités'
    loadingProgress.value = 70
    const availSnap = await getDocs(collection(db, 'seasons', seasonId.value, 'availability'))
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

    // Étape 4: sélections + protections
    currentLoadingLabel.value = 'Chargement des sélections'
    loadingProgress.value = 85
    const selSnap = await getDocs(collection(db, 'seasons', seasonId.value, 'selections'))
    const selObj = {}
    selSnap.docs.forEach(doc => { selObj[doc.id] = doc.data().players || [] })
    selections.value = selObj

    const protections = await listProtectedPlayers(seasonId.value)
    const protSet = new Set()
    if (Array.isArray(protections)) {
      protections.forEach(p => { if (p.isProtected) protSet.add(p.playerId || p.id) })
    }
    protectedPlayers.value = protSet
  }
  
  // Déplacer les calculs lourds en idle
  const scheduleIdle = (fn) => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => fn())
    } else {
      setTimeout(fn, 0)
    }
  }
  currentLoadingLabel.value = 'Préparation de l\'interface'
  loadingProgress.value = 95
  scheduleIdle(() => { updateAllStats(); updateAllChances() })
  
  // Logs allégés
  // eslint-disable-next-line no-console
  console.debug('players (deduplicated)')
  // eslint-disable-next-line no-console
  console.debug('availability loaded')

  // init scroll hints
  await nextTick()
  loadingProgress.value = 100
  isLoadingGrid.value = false
  nextTick(() => {
    // Recalcule immédiat + raf + délai pour capter les changements de layout (mobile)
    updateScrollHints()
    requestAnimationFrame(() => updateScrollHints())
    setTimeout(() => updateScrollHints(), 250)
    const el = gridboardRef.value
    if (el) {
      el.addEventListener('scroll', (e) => {
        updateScrollHints()
        headerScrollX.value = el.scrollLeft || 0
      }, { passive: true })
      window.addEventListener('resize', updateScrollHints)
      // Observer les changements de taille/contenu pour mettre à jour les chevrons
      if (typeof ResizeObserver !== 'undefined') {
        gridResizeObserver.value = new ResizeObserver(() => {
          updateScrollHints()
        })
        gridResizeObserver.value.observe(el)
      }
    }

  // (onboarding créateur désormais géré par CreatorOnboardingModal)
  })

  // Gérer le focus sur un événement spécifique depuis l'URL
  const eventIdFromUrl = route.query.event
  if (eventIdFromUrl && events.value.length > 0) {
    const targetEvent = events.value.find(e => e.id === eventIdFromUrl)
    if (targetEvent) {
      // eslint-disable-next-line no-console
      console.debug('Événement trouvé depuis l\'URL')
      
      // Utiliser la fonction améliorée de focus
      await focusOnEventFromUrl(eventIdFromUrl, targetEvent)
    } else {
      // eslint-disable-next-line no-console
      console.warn('Événement non trouvé avec l\'ID')
      // Afficher un message d'erreur à l'utilisateur
      showErrorMessage.value = true
      errorMessage.value = `Événement non trouvé`
      setTimeout(() => {
        showErrorMessage.value = false
      }, 3000)
    }
  }

  // Ouvrir automatiquement la fiche joueur depuis l'URL (?player=...)
  const playerIdFromUrl = route.query.player
  if (playerIdFromUrl && players.value.length > 0) {
    const target = players.value.find(p => p.id === playerIdFromUrl)
    if (target) {
      showPlayerDetails(target)
      await nextTick()
      // Si retour depuis verification email (verified=1), afficher un toast de succès
      if (route.query.verified === '1') {
        showSuccessMessage.value = true
        successMessage.value = 'Joueur associé à votre compte.'
        setTimeout(() => { showSuccessMessage.value = false }, 2500)
      }
    }
  }

  // Désistement: plus de modal/route dédiée, on utilise les magic links "no"
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
  // Charger la(les) préférence(s) locale(s): joueurs privilégiés pour cette saison
  let preferredRaw = null
  try {
    if (seasonId.value) {
      preferredRaw = localStorage.getItem(`seasonPreferredPlayer:${seasonId.value}`)
    }
  } catch (_) {}

  const base = [...players.value].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' }))
  if (!preferredRaw) return base

  // Support compat: soit un ID simple, soit un tableau JSON d'IDs
  let preferredIds = []
  try {
    if (preferredRaw.startsWith('[')) preferredIds = JSON.parse(preferredRaw)
    else if (preferredRaw) preferredIds = [preferredRaw]
  } catch (_) {
    preferredIds = []
  }
  const preferredSet = new Set(preferredIds)
  if (preferredSet.size === 0) return base

  const preferredFirst = base.filter(p => preferredSet.has(p.id))
  const rest = base.filter(p => !preferredSet.has(p.id))
  return [...preferredFirst, ...rest]
})

// Exposer l'ensemble des joueurs préférés pour la surbrillance légère
const preferredPlayerIdsSet = computed(() => {
  try {
    if (seasonId.value) {
      const raw = localStorage.getItem(`seasonPreferredPlayer:${seasonId.value}`)
      if (!raw) return new Set()
      if (raw.startsWith('[')) {
        const arr = JSON.parse(raw)
        return new Set(Array.isArray(arr) ? arr : [])
      }
      return new Set([raw])
    }
  } catch (_) {}
  return new Set()
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

  // Filtre pour la liste de disponibilités dans le détail d'événement
  const availabilityFilter = ref('selected') // selected | available | unavailable | unknown | all
  const filteredPlayers = computed(() => {
    if (!selectedEvent.value) return sortedPlayers.value
    const eventId = selectedEvent.value.id
    const selectionSet = new Set((selections.value?.[eventId] || []))

    return sortedPlayers.value.filter(player => {
      const name = player.name
      const avail = availability.value[name]?.[eventId]
      const isSel = selectionSet.has(name)

      switch (availabilityFilter.value) {
        case 'selected':
          return isSel
        case 'available':
          return avail === true && !isSel
        case 'unavailable':
          return avail === false
        case 'unknown':
          return avail !== true && avail !== false
        case 'all':
        default:
          return true
      }
    })
  })

  // Avertissements pour l'événement sélectionné
  const eventStatus = computed(() => selectedEvent.value ? getEventStatus(selectedEvent.value.id) : null)
  const hasEventWarningForSelectedEvent = computed(() => {
    if (!selectedEvent.value) return false
    const status = getEventStatus(selectedEvent.value.id)
    return status.type === 'incomplete' || status.type === 'insufficient'
  })
  const eventWarningText = computed(() => {
    if (!selectedEvent.value) return ''
    return getEventTooltip(selectedEvent.value.id)
  })

async function toggleAvailability(playerName, eventId) {
  const player = players.value.find(p => p.name === playerName);
  if (!player) {
    // eslint-disable-next-line no-console
    console.error('Joueur non trouvé')
    return;
  }
  const eventItem = events.value.find(e => e.id === eventId);
  if (!eventItem) {
    // eslint-disable-next-line no-console
    console.error('Événement non trouvé')
    return;
  }
  // Empêcher toute modification sur un événement archivé
  if (eventItem.archived) {
    showSuccessMessage.value = true
    successMessage.value = 'Événement archivé — désarchivez pour modifier'
    setTimeout(() => { showSuccessMessage.value = false }, 3000)
    return
  }
  
  // Vérifier si le joueur est protégé (utiliser la même logique que la grille)
  const isProtected = isPlayerProtectedInGrid(player.id);
  
  if (isProtected) {
    // Vérifier s'il y a une session active OU si le joueur vient d'être vérifié
    const hasCachedPassword = isPlayerPasswordCached(player.id);
    const wasRecentlyVerified = recentlyVerifiedPlayer.value === player.id;
    
    // eslint-disable-next-line no-console
    console.debug('Joueur protégé:', { 
      playerId: player.id, 
      hasCachedPassword, 
      wasRecentlyVerified,
      recentlyVerifiedPlayer: recentlyVerifiedPlayer.value 
    });
    
    if (hasCachedPassword || wasRecentlyVerified) {
      // Session active ou joueur récemment vérifié, procéder directement
      // eslint-disable-next-line no-console
      console.debug('Session active ou joueur récemment vérifié, procéder au toggle');
      if (wasRecentlyVerified) {
        // Nettoyer le flag après utilisation
        // eslint-disable-next-line no-console
        console.debug('Nettoyage du flag recentlyVerifiedPlayer');
        recentlyVerifiedPlayer.value = null;
      }
      performToggleAvailability(player, eventId);
    } else {
      // Pas de session, demander le mot de passe
      // eslint-disable-next-line no-console
      console.debug('Pas de session, affichage de la modal de vérification');
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
  // eslint-disable-next-line no-console
  console.debug('toggleAvailability')
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
  
  // Avancer le mini-tutoriel joueur: étape 1 -> 2 au premier toggle
  try {
    if (typeof playerTourStep !== 'undefined' && playerTourStep.value === 1) {
      const isGuidedCell = (player.id === (guidedPlayerId.value || (sortedPlayers.value[0]?.id))) && (eventId === (guidedEventId.value || (displayedEvents.value[0]?.id)))
      if (isGuidedCell) {
        playerTourStep.value = 3
        // Positionner le coachmark près du nom du joueur
        nextTick(() => {
          const row = document.querySelector(`[data-player-id="${player.id}"]`)
          if (row) {
            const nameEl = row.querySelector('.player-name')
            if (nameEl) {
              const rect = nameEl.getBoundingClientRect()
              playerNameCoachmark.value.position = {
                x: Math.round(rect.right + 8),
                y: Math.round(rect.top + window.scrollY - 4)
              }
            }
          }
        })

// Nettoyage listeners/observers
onUnmounted(() => {
  try { window.removeEventListener('resize', updateScrollHints) } catch {}
  try { if (gridResizeObserver.value) gridResizeObserver.value.disconnect() } catch {}
})
      }
    }
  } catch {}

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
      // eslint-disable-next-line no-console
      console.error('Erreur lors de la mise à jour de la disponibilité')
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
    // eslint-disable-next-line no-console
    console.debug('Tous les joueurs sélectionnés sont disponibles, nouveau tirage complet')
    
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
  // eslint-disable-next-line no-console
  console.debug('tirerProtected appelé')
  // eslint-disable-next-line no-console
  console.debug('etat modal selection avant')
  
  // Sauvegarder l'état de la popin avant le tirage
  const wasSelectionModalOpen = showSelectionModal.value
  const selectionModalEventId = selectionModalEvent.value?.id
  
  // Vérifier si c'est une reselection avant de faire le tirage
  const wasReselection = selections.value[eventId] && selections.value[eventId].length > 0
  
  // Sauvegarder l'ancienne sélection pour comparer
  const oldSelection = wasReselection ? [...selections.value[eventId]] : []
  
  await tirer(eventId, count)
  
  // eslint-disable-next-line no-console
  console.debug('etat modal selection apres')
  
  // S'assurer que la popin de sélection reste ouverte si elle était ouverte
  if (wasSelectionModalOpen && !showSelectionModal.value) {
    // eslint-disable-next-line no-console
    console.debug('Restauration de la popin de sélection...')
    showSelectionModal.value = true
    selectionModalEvent.value = events.value.find(e => e.id === selectionModalEventId)
  }
  
  // Mettre à jour les données de la popin de sélection si elle est ouverte
  if (showSelectionModal.value && selectionModalEvent.value?.id === eventId) {
    // eslint-disable-next-line no-console
    console.debug('Popin de sélection ouverte, mise à jour...')
    // Forcer la mise à jour des données
    await nextTick()
    
    // Afficher le message de succès dans la popin de sélection
    if (selectionModalRef.value && selectionModalRef.value.showSuccess) {
      // eslint-disable-next-line no-console
      console.debug('Appel de showSuccess sur la popin de sélection')
      const newSelection = selections.value[eventId] || []
      const keptPlayers = oldSelection.filter(player => newSelection.includes(player))
      const isPartialUpdate = keptPlayers.length > 0 && keptPlayers.length < oldSelection.length
      selectionModalRef.value.showSuccess(wasReselection, isPartialUpdate)
    } else {
      // eslint-disable-next-line no-console
      console.debug('showSuccess indisponible')
    }
  } else {
    // eslint-disable-next-line no-console
    console.debug('Popin de sélection fermée, affichage message global')
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

// Démarrer la mise en avant de la cellule de dispo du joueur
function startAvailabilityGuidance() {
  // Essayer de cibler le dernier joueur ajouté pour cette saison
  let targetPlayerId = null
  try { if (seasonId.value) targetPlayerId = localStorage.getItem(`lastAddedPlayerId:${seasonId.value}`) } catch {}
  if (!targetPlayerId && players.value.length > 0) {
    // On veut quand même montrer l'étape 1 même si un joueur existe déjà
    // Donc ne pas passer automatiquement à l'étape 2 ici
    targetPlayerId = players.value[0]?.id || null
  }
  guidedPlayerId.value = targetPlayerId
  guidedEventId.value = displayedEvents.value[0]?.id || null
  try { if (typeof playerTourStep !== 'undefined') playerTourStep.value = 2 } catch {}
  // S'assurer que l'élément est dans le viewport
  if (guidedPlayerId.value) {
    const row = document.querySelector(`[data-player-id="${guidedPlayerId.value}"]`)
    row?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  // Positionner le coachmark près de la cellule, en restant dans le viewport
  nextTick(() => {
    const selector = `[data-player-id="${guidedPlayerId.value}"] td[data-event-id="${guidedEventId.value}"]`
    const cell = document.querySelector(selector)
    if (cell) {
      const rect = cell.getBoundingClientRect()
      // Ajuster pour rester dans le viewport (éviter scroll intempestif)
      const proposedX = Math.round(rect.left)
      const proposedY = Math.round(rect.top + window.scrollY - 72)
      const minY = window.scrollY + 16
      const y = Math.max(proposedY, minY)
      availabilityCoachmark.value.position = { x: proposedX, y }
    }
  })
}

// Ouvrir directement la protection sur la fiche du joueur guidé
function openProtectionGuidance() {
  // Choisir le joueur cible
  let targetPlayer = null
  const targetId = guidedPlayerId.value || (players.value[0]?.id || null)
  if (targetId) {
    targetPlayer = players.value.find(p => p.id === targetId) || null
  }
  if (!targetPlayer && players.value.length > 0) targetPlayer = players.value[0]
  if (!targetPlayer) return

  selectedPlayer.value = targetPlayer
  showPlayerModal.value = true
  nextTick(() => {
    if (playerModalRef?.value?.openProtection) {
      playerModalRef.value.openProtection()
    }
  })
}

// Cacher un coachmark d'étape (permet à l'utilisateur de cliquer ensuite)
function dismissCoachmarkStep(stepNumber) {
  if (stepNumber === 0) {
    addPlayerCoachmark.value.position = null
  } else if (stepNumber === 1) {
    availabilityCoachmark.value.position = null
  } else if (stepNumber === 2) {
    playerNameCoachmark.value.position = null
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
    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.error('Erreur lors de la suppression du joueur')
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
    toggleArchive: 'Archivage d\'événement - Code PIN requis',
    updateSelection: 'Mise à jour de sélection - Code PIN requis'
  }
  
  return messages[pendingOperation.value.type] || 'Code PIN requis'
}

async function requirePin(operation) {
  // Vérifier si le PIN est déjà en cache pour cette saison
  if (pinSessionManager.isPinCached(seasonId.value)) {
    const cachedPin = pinSessionManager.getCachedPin(seasonId.value)
    // eslint-disable-next-line no-console
    console.debug('PIN en cache trouvé, utilisation automatique')
    
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
  
  // Si un PIN de saison valide est déjà en cache, ne pas redemander
  try {
    if (pinSessionManager.isPinCached(seasonId.value)) {
      // eslint-disable-next-line no-console
      console.debug('PIN de saison en cache — saut de la demande de mot de passe joueur')
      await executePendingOperation(operation)
      return
    }
  } catch {}

  // Vérifier si le mot de passe du joueur est déjà en cache
  if (isPlayerPasswordCached(playerId)) {
    // eslint-disable-next-line no-console
    console.debug('Mot de passe du joueur en cache trouvé, utilisation automatique')
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
    // eslint-disable-next-line no-console
    console.error('Erreur lors de la vérification du PIN')
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
      // Mémoriser le PIN de saison (session PIN long terme)
      try { pinSessionManager.saveSession(seasonId.value, password) } catch {}
      // Optionnel: marquer l'appareil de confiance pour ce joueur
      try { playerPasswordSessionManager.saveSession(pendingPlayerOperation.value.data.playerId) } catch {}
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
    // eslint-disable-next-line no-console
    console.error('Erreur lors de la vérification du mot de passe')
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
      // Mémoriser le PIN de saison (session PIN long terme)
      try { pinSessionManager.saveSession(seasonId.value, password) } catch {}
      // Optionnel: marquer l'appareil de confiance pour ce joueur
      try { playerPasswordSessionManager.saveSession(pendingAvailabilityOperation.value.data.player.id) } catch {}
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
    // eslint-disable-next-line no-console
    console.error('Erreur lors de la vérification du mot de passe')
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
    // eslint-disable-next-line no-console
    console.error('Erreur lors de l\'envoi de l\'email')
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
    // eslint-disable-next-line no-console
    console.error('Erreur lors de l\'envoi de l\'email')
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
        // eslint-disable-next-line no-console
        console.debug('executePendingOperation - data.eventId reçu')
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
      case 'updateSelection':
        // Persister la sélection manuelle après validation du PIN
        {
          const { eventId, players } = data
          // Détecter les joueurs retirés avant de sauvegarder
          const oldSelection = [...(selections.value[eventId] || [])]
          const nextSelection = Array.isArray(players) ? players : []
          await saveSelection(eventId, nextSelection, seasonId.value)
          selections.value[eventId] = nextSelection
          // Emails de désélection si applicable
          try {
            const removedPlayers = oldSelection.filter(name => !nextSelection.includes(name))
            if (removedPlayers.length > 0) {
              const event = events.value.find(e => e.id === eventId)
              await sendDeselectionEmailsForEvent({
                eventId,
                eventData: event,
                removedPlayers,
                newSelectedPlayers: nextSelection,
                seasonId: seasonId.value,
                seasonSlug,
                players: enrichedPlayers.value
              })
            }
          } catch {}
          // Feedback via la modale de sélection si ouverte
          try {
            selectionModalRef.value?.showSuccess(true, true)
          } catch {}
        }
        break
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erreur lors de l\'exécution de l\'opération')
    showSuccessMessage.value = true
    successMessage.value = 'Erreur lors de l\'opération. Veuillez réessayer.'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  }
}

function goBack() {
  router.push('/seasons')
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
  // eslint-disable-next-line no-console
  console.debug('handleAvailabilityToggle appelé')
  
  const player = players.value.find(p => p.name === playerName);
  if (!player) {
    // eslint-disable-next-line no-console
    console.error('Joueur non trouvé');
    return;
  }
  // Empêcher toute modification sur un événement archivé
  const evt = events.value.find(e => e.id === eventId)
  if (evt?.archived) {
    showSuccessMessage.value = true
    successMessage.value = 'Événement archivé — désarchivez pour modifier'
    setTimeout(() => { showSuccessMessage.value = false }, 3000)
    return
  }
  
  // eslint-disable-next-line no-console
  console.debug('Joueur trouvé');
  
  // Vérifier si le joueur est protégé (utiliser la même logique que la grille)
  const isProtected = isPlayerProtectedInGrid(player.id);
  // eslint-disable-next-line no-console
  console.debug('Joueur protégé');
  
  if (isProtected) {
    // Vérifier s'il y a une session active
    const hasCachedPassword = isPlayerPasswordCached(player.id);
    if (hasCachedPassword) {
      // Session active, procéder directement
      // eslint-disable-next-line no-console
      console.debug('Session active, procéder au toggle');
      await toggleAvailability(playerName, eventId);
    } else {
      // Pas de session, demander le mot de passe
      // eslint-disable-next-line no-console
      console.debug('Demande du mot de passe pour joueur protégé');
      pendingAvailabilityAction.value = { playerName, eventId };
      passwordVerificationPlayer.value = player;
      showPasswordVerification.value = true;
    }
    return;
  }
  
  // Si non protégé, procéder directement
  // eslint-disable-next-line no-console
  console.debug('Joueur non protégé, procéder au toggle');
  await toggleAvailability(playerName, eventId);
}

// Fonction pour vérifier si un joueur est sélectionné pour un événement spécifique
function isPlayerSelected(playerName, eventId) {
  const selected = selections.value[eventId] || [];
  return selected.includes(playerName);
}

// Fonction pour gérer la vérification de mot de passe réussie
async function handlePasswordVerified(verificationData) {
  // eslint-disable-next-line no-console
  console.debug('Mot de passe vérifié');
  
  // Marquer le joueur comme récemment vérifié pour éviter la boucle
  if (passwordVerificationPlayer.value) {
    recentlyVerifiedPlayer.value = passwordVerificationPlayer.value.id;
    // eslint-disable-next-line no-console
    console.debug('Joueur marqué comme récemment vérifié');
  }
  
  // Procéder à l'action de disponibilité en attente
  if (pendingAvailabilityAction.value) {
    const { playerName, eventId } = pendingAvailabilityAction.value;
    // eslint-disable-next-line no-console
    console.debug('Exécution de l\'action en attente');
    
    // Procéder au toggle de disponibilité
    await toggleAvailability(playerName, eventId);
    
    // Réinitialiser l'action en attente
    pendingAvailabilityAction.value = null;
  } else {
    // eslint-disable-next-line no-console
    console.debug('Aucune action en attente trouvée');
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
    // eslint-disable-next-line no-console
    console.error('Erreur lors de la modification de l\'archivage');
    alert('Erreur lors de la modification de l\'archivage. Veuillez réessayer.');
  }
}

// Fonctions pour le modal joueur
function showPlayerDetails(player) {
  selectedPlayer.value = player;
  showPlayerModal.value = true;

    // Avancer le mini-tutoriel joueur (étape 3 -> protection)
    try {
      if (typeof playerTourStep !== 'undefined' && playerTourStep.value === 3) {
        // La suite (mise en avant du bouton Protection) se fera dans le modal
      }
    } catch {}
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
    // eslint-disable-next-line no-console
    console.error('Erreur lors de l\'édition du joueur');
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
    // eslint-disable-next-line no-console
    console.error('Erreur lors du rafraîchissement');
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

// Construction de la liste des joueurs protégés avec email pour l'envoi multi-canal
async function buildProtectedPlayersWithEmails() {
  const result = []
  for (const player of players.value) {
    const protectedFlag = await isPlayerProtected(player.id, seasonId.value)
    if (!protectedFlag) continue
    const email = await getPlayerEmail(player.id, seasonId.value)
    if (!email) continue
    result.push({ ...player, email })
  }
  return result
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
  // Mémoriser dans l'URL pour restauration après refresh
  try {
    const params = new URLSearchParams(window.location.search)
    params.set('modal', 'announce')
    params.set('event', event?.id || '')
    history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
  } catch {}
}

function closeEventAnnounceModal() {
  showEventAnnounceModal.value = false
  eventToAnnounce.value = null
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('modal') === 'announce') {
      params.delete('modal'); params.delete('event')
      history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    }
  } catch {}
}

function closeAnnouncePrompt() {
  showAnnouncePrompt.value = false
  announcePromptEvent.value = null
}

const isSendingNotifications = ref(false)

async function handleSendNotifications({ eventId, eventData, reason, selectedPlayers, scope = 'all', recipient = null }) {
  isSendingNotifications.value = true
  try {
    if (reason === 'selection') {
      if (scope === 'single' && recipient?.email) {
        // Envoi ciblé pour un joueur sélectionné
        await sendSelectionNotificationsForEvent({
          eventId,
          eventData,
          selectedPlayers: [recipient.name],
          seasonId: seasonId.value,
          seasonSlug: seasonSlug,
          players: enrichedPlayers.value
        })
      } else {
        // Batch pour tous les sélectionnés
        await sendSelectionNotificationsForEvent({ 
          eventId, 
          eventData, 
          selectedPlayers,
          seasonId: seasonId.value,
          seasonSlug: seasonSlug,
          players: enrichedPlayers.value
        })
      }
      
      showSuccessMessage.value = true
      successMessage.value = scope === 'single'
        ? `Notification envoyée à ${recipient?.name || '1 joueur'}`
        : 'Notifications de sélection envoyées à tous les joueurs sélectionnés !'
      setTimeout(() => { showSuccessMessage.value = false }, 3000)
    } else {
      // Mode événement : envoi multi-canal
      if (scope === 'single' && recipient?.email) {
        // Ciblé: construire une "liste" d'un seul destinataire
        await sendAvailabilityNotificationsForEvent({
          eventId,
          eventData,
          players: [recipient],
          seasonId: seasonId.value,
          seasonSlug: seasonSlug,
          createMagicLink,
          reminder: false,
          getAvailabilityForEvent: (name, eId) => isAvailable(name, eId)
        })
      } else {
        await sendAvailabilityNotificationsForEvent({
          eventId,
          eventData,
          players: await buildProtectedPlayersWithEmails(),
          seasonId: seasonId.value,
          seasonSlug: seasonSlug,
          createMagicLink,
          reminder: false,
          getAvailabilityForEvent: (name, eId) => isAvailable(name, eId)
        })
      }
      
      showSuccessMessage.value = true
      successMessage.value = scope === 'single'
        ? `Notification envoyée à ${recipient?.name || '1 joueur'}`
        : 'Notifications envoyées à tous les joueurs protégés !'
      setTimeout(() => { showSuccessMessage.value = false }, 3000)
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erreur lors de l\'envoi des notifications')
    showSuccessMessage.value = true
    successMessage.value = 'Erreur lors de l\'envoi des notifications'
    setTimeout(() => { showSuccessMessage.value = false }, 3000)
  }
  isSendingNotifications.value = false
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
  if (event?.archived) {
    showSuccessMessage.value = true
    successMessage.value = 'Impossible d\'ouvrir la sélection sur un événement archivé'
    setTimeout(() => { showSuccessMessage.value = false }, 3000)
    return
  }
  selectionModalEvent.value = event
  showSelectionModal.value = true
  try {
    const params = new URLSearchParams(window.location.search)
    params.set('modal', 'selection')
    params.set('event', event?.id || '')
    history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
  } catch {}
 }

function closeSelectionModal() {
  showSelectionModal.value = false
  selectionModalEvent.value = null
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('modal') === 'selection') {
      params.delete('modal'); params.delete('event')
      history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    }
  } catch {}
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

// Sauvegarde d'une sélection manuelle via PIN
async function handleUpdateSelectionFromModal(payload) {
  if (!payload || !payload.eventId) return
  const { eventId, players } = payload
  // Demander le PIN avant enregistrement
  await requirePin({
    type: 'updateSelection',
    data: { eventId, players }
  })
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
    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.warn('Événement non trouvé dans la liste des événements')
    // Attendre un peu et réessayer
    setTimeout(() => {
      const retryEvent = events.value.find(e => e.id === eventId)
      if (retryEvent) {
        focusOnEventFromUrl(eventId, retryEvent)
      } else {
        // eslint-disable-next-line no-console
        console.error('Événement toujours introuvable après retry')
      }
    }, 500)
    return
  }
  
  // Utiliser la fonction spécialisée pour l'URL
  focusOnEventFromUrl(eventId, targetEvent)
}

// Restaurer les modales depuis l'URL après chargement des événements
watch(events, (list) => {
  try {
    const params = new URLSearchParams(window.location.search)
    const modal = params.get('modal')
    const eventId = params.get('event')
    if (!modal || !eventId) return
    const t = list.find(e => e.id === eventId)
    if (!t) return
    if (modal === 'announce') openEventAnnounceModal(t)
    if (modal === 'selection') openSelectionModal(t)
  } catch {}
}, { immediate: true })

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
