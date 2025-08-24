<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <!-- Header de saison partagé -->
    <SeasonHeader 
      :season-name="seasonName"
      :is-scrolled="isScrolled"
      :season-slug="props.slug"
      @go-back="goBack"
      @open-account-menu="openAccountMenu"
      @open-help="showHowItWorksGlobal = true"
      @open-notifications="openNotifications"
      @open-players="openPlayers"
      @logout="handleAccountLogoutDevice"
      @open-login="openAccount"
      @open-account="openAccount"
      @open-account-creation="openAccountCreation"
    />

    <div class="w-full px-0 md:px-0 pb-0 pt-[64px] md:pt-[80px] -mt-[64px] md:-mt-[80px] bg-gray-900">
      <!-- Sticky header bar outside horizontal scroller (sync with scrollLeft) -->
      <div ref="headerBarRef" class="sticky top-0 z-[100] bg-gray-900 overflow-hidden">
        <div class="flex items-stretch relative">
          <!-- Left sticky cell (masqué pendant l'étape 1 pour éviter le doublon avec l'onboarding) -->
          <div v-if="(events.length === 0 && players.length === 0) ? false : true" class="col-left flex-shrink-0 p-3 md:p-4 sticky left-0 z-[101] bg-gray-900 h-full">
            <div class="flex flex-col items-center justify-between h-full gap-3">
              <!-- Bouton ajouter spectacle -->
              <button
                @click="openNewEventForm"
                class="flex items-center space-x-2 px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base font-medium"
                title="Ajouter un nouveau spectacle"
              >
                <span class="text-lg">➕</span>
                <span class="hidden sm:inline">Ajouter un spectacle</span>
                <span class="sm:hidden">Spectacle</span>
              </button>
              
              <!-- Icône de la saison - cliquable pour rafraîchir -->
              <div 
                @click="refreshSeason"
                class="flex items-center justify-center p-1 relative z-[102] cursor-pointer hover:bg-white/10 rounded-lg transition-colors duration-200"
                :title="`Cliquer pour rafraîchir ${seasonName}`"
              >
                <div v-if="seasonMeta?.logoUrl" class="w-16 h-16 md:w-14 md:h-14 rounded-lg overflow-hidden shadow-lg">
                  <img 
                    :src="seasonMeta.logoUrl" 
                    :alt="`Logo de ${seasonName}`"
                    class="w-full h-full object-cover"
                  >
                </div>
                <span v-else class="w-16 h-16 md:w-14 md:h-14 text-3xl md:text-2xl flex items-center justify-center text-white">🎭</span>
              </div>
              

            </div>
          </div>
          <!-- Event headers -->
          <div class="flex-1 overflow-hidden">
            <div ref="headerEventsRef" class="flex relative z-[60]" :style="{ transform: `translateX(-${headerScrollX}px)` }">
              <div
                v-for="event in displayedEvents"
                :key="'h-'+event.id"
                :data-event-id="event.id"
                class="col-event flex-shrink-0 p-3 text-center flex flex-col justify-between"
                :class="{ 'archived-header': event.archived }"
              >
                <!-- Zone cliquable principale (titre + date) -->
                <div 
                  class="flex flex-col items-center justify-between p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 cursor-pointer group h-24"
                  :title="event.title + ' - Cliquez pour voir les détails'"
                  @click.stop="showEventDetails(event)"
                >
                  <div class="flex flex-col items-center flex-1 justify-center">
                    <div class="header-title text-[22px] md:text-2xl leading-snug text-white text-center clamp-2 group-hover:text-purple-300 transition-colors duration-200">
                      {{ event.title || 'Sans titre' }}
                    </div>
                    <div v-if="event.archived" class="mt-1 text-xs text-gray-400">(Archivé)</div>
                  </div>
                  
                  <div class="relative">
                    <div 
                      class="header-date text-[16px] md:text-base text-gray-300 group-hover:text-purple-200 transition-colors duration-200 px-2 py-1 rounded" 
                      :title="formatDateFull(event.date)"
                    >
                      {{ formatDate(event.date) }}
                    </div>
                  </div>
                </div>
                
                <!-- Section basse : indicateur de statut -->
                <div class="flex flex-col items-center mt-2">
                  
                  <!-- Indicateur de statut archivé (priorité sur les autres) -->
                  <div 
                    v-if="event.archived"
                    class="px-2 py-1 bg-gray-500/20 border border-gray-400/30 rounded-md mx-auto flex items-center justify-center"
                    title="Événement archivé"
                  >
                    <span class="text-xs text-gray-300 font-medium">📁</span>
                    <span class="text-xs text-gray-200 font-medium ml-1">Archivé</span>
                  </div>
                  
                  <!-- Indicateur de statut de sélection (seulement si pas archivé) -->
                  <div 
                    v-else-if="getEventStatus(event.id).type === 'ready'"
                    class="px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded-md mx-auto flex items-center justify-center hover:bg-blue-500/30 transition-colors duration-200 cursor-pointer group"
                    :title="getEventTooltip(event.id) + ' - Cliquez pour ouvrir la sélection'"
                    @click.stop="openSelectionModal(event)"
                  >
                    <span class="text-xs text-blue-300 font-medium group-hover:text-blue-200">🆕</span>
                    <span class="text-xs text-blue-200 font-medium ml-1 group-hover:text-blue-100">Nouveau</span>
                  </div>
                  
                  <SelectionStatusBadge
                    v-else-if="getEventStatus(event.id).type"
                    :status="getEventStatus(event.id).type"
                    :show="true"
                    :clickable="true"
                    class="mx-auto cursor-pointer group"
                    :title="getEventTooltip(event.id) + ' - Cliquez pour ouvrir la sélection'"
                    @click.stop="openSelectionModal(event)"
                  />
                </div>
              </div>
            </div>
          </div>
          <!-- Right spacer (keeps end alignment) -->
          <div class="col-right flex-shrink-0 p-3 sticky right-0 z-[101] bg-gray-900 h-full"></div>

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
                      <!-- Étape 1: coachmark bouton Ajouter une personne -->
          <div
            v-if="addPlayerCoachmark.position"
            class="fixed z-[400]"
            :style="{ left: addPlayerCoachmark.position.x + 'px', top: addPlayerCoachmark.position.y + 'px' }"
          >
            <div id="coachmark-add" class="coachmark pointer-events-auto max-w-sm bg-gray-900 border border-purple-500/40 rounded-xl shadow-2xl p-3 text-white relative" :class="{ 'coachmark-right': addPlayerCoachmark.side === 'right', 'coachmark-left': addPlayerCoachmark.side === 'left' }">
              <div class="text-lg md:text-base font-semibold mb-1">Ajoutez votre nom</div>
              <div class="text-base md:text-sm text-gray-300 mb-2">Cliquez sur "Ajouter une personne" pour vous inscrire</div>
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
                    title="Ma personne"
                  >
                    ⭐
                  </span>
                  <span 
                    v-else-if="isPlayerProtectedInGrid(player.id)"
                    class="text-yellow-400 mr-1 text-sm"
                    :title="preferredPlayerIdsSet.has(player.id) ? 'Ma personne protégée' : 'Personne protégée par mot de passe'"
                  >
                    {{ preferredPlayerIdsSet.has(player.id) ? '⭐' : '🔒' }}
                  </span>
                                    <div 
                    @click="showPlayerDetails(player)" 
                    class="player-name hover:bg-white/10 rounded-lg p-2 cursor-pointer transition-colors duration-200 text-[22px] md:text-2xl leading-tight block truncate max-w-full flex-1 min-w-0 group"
                    :class="{ 'inline-block rounded px-1 ring-2 ring-yellow-400 animate-pulse': playerTourStep === 3 && player.id === (guidedPlayerId || (sortedPlayers[0]?.id)) }"
                    :title="'Cliquez pour voir les détails : ' + player.name"
                  >
                    <span class="group-hover:text-purple-300 transition-colors duration-200">{{ player.name }}</span>
                  </div>
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
                  :is-selection-confirmed="isSelectionConfirmed(event.id)"
                  :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer(event.id)"
                  :player-selection-status="getPlayerSelectionStatus(player.name, event.id)"
                  :season-id="seasonId"
                  :chance-percent="chances[player.name]?.[event.id] ?? null"
                  :show-selected-chance="isSelectionComplete(event.id)"
                  :disabled="event.archived === true"
                  @toggle="toggleAvailability"
                  @toggle-selection-status="handlePlayerSelectionStatusToggle"
                />
              </td>
              <td class="p-3 md:p-4"></td>
            </tr>
            <!-- Dernière ligne: ajouter une personne (toujours visible pour éviter blocage quand 0 personne) -->
            <tr class="border-t border-white/10">
              <td class="px-0 py-4 md:py-5 sticky left-0 z-40 bg-gray-900 left-col-td">
                <div class="px-4 md:px-5 flex items-center">
                  <button
                    @click="newPlayerForm = true"
                    class="w-full md:w-auto flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 text-sm md:text-base font-medium"
                    title="Ajouter une nouvelle personne"
                    data-onboarding="add-player"
                  >
                    <span class="text-lg">➕</span>
                    <span class="hidden sm:inline">Ajouter une personne</span>
                    <span class="sm:hidden">Personne</span>
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
      <h2 class="text-2xl font-bold mb-6 text-white text-center">✨ Nouveau spectacle</h2>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Titre</label>
        <input
          v-model="newEventTitle"
          type="text"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
          placeholder="Titre du spectacle"
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
          placeholder="Description du spectacle (optionnel)"
        ></textarea>
      </div>
      <div class="mb-6 flex items-center gap-3">
        <input id="new-archived" type="checkbox" v-model="newEventArchived" class="w-4 h-4" />
        <label for="new-archived" class="text-sm font-medium text-gray-300">Créer comme archivé</label>
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Nombre de personnes à sélectionner</label>
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
      <h2 class="text-2xl font-bold mb-6 text-white text-center">✨ Nouvelle personne</h2>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Nom</label>
        <input
          v-model="newPlayerName"
          type="text"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
          placeholder="Nom de la personne"
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
        <p class="text-gray-300">Êtes-vous sûr de vouloir supprimer ce spectacle ?</p>
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
        <p class="text-gray-300">Êtes-vous sûr de vouloir supprimer cette personne ?</p>
      </div>
      <div class="flex justify-end space-x-3">
        <button @click="cancelPlayerDelete" class="px-6 py-3 text-gray-300 hover:text-white transition-colors">Annuler</button>
        <button @click="() => deletePlayerConfirmed()" class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300">Supprimer</button>
      </div>
    </div>
  </div>

  <!-- Modale de confirmation de relance de sélection -->
  <div v-if="confirmReselect" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">🎭</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2>
        <p class="text-gray-300">
          <span v-if="eventIdToReselect && getSelectionPlayers(eventIdToReselect).every(playerName => isAvailable(playerName, eventIdToReselect))">Attention, toute la sélection sera refaite en fonction des disponibilités actuelles.</span>
          <span v-else>La sélection sera mise à jour : les personnes disponibles seront conservées, les slots vides seront complétés.</span>
        </p>
      </div>

      <div class="flex justify-end space-x-3">
        <button @click="cancelTirage" class="px-6 py-3 text-gray-300 hover:text-white transition-colors">Annuler</button>
        <button @click="confirmTirage" class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300">Confirmer</button>
      </div>
    </div>
  </div>



  <!-- Popin de détails de l'événement -->
  <div v-if="showEventDetailsModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[80] p-0 md:p-4" @click="closeEventDetailsAndUpdateUrl">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col" @click.stop>
      <!-- Header -->
      <div class="relative p-4 md:p-6 border-b border-white/10">
        <button @click="closeEventDetailsAndUpdateUrl" title="Fermer" class="absolute right-3 top-3 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
        
        <!-- Layout horizontal compact -->
        <div class="flex items-start gap-4 md:gap-6">
          <!-- Icône illustrative -->
          <div class="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex-shrink-0 flex items-center justify-center">
            <span class="text-xl md:text-2xl">🎭</span>
          </div>
          
                     <!-- Informations principales -->
           <div class="flex-1 min-w-0">
             <div class="flex items-center gap-3 mb-2">
               <h2 class="text-xl md:text-2xl font-bold text-white leading-tight">{{ selectedEvent?.title }}</h2>
               <div class="flex items-center gap-2 px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded text-sm">
                 <span class="text-blue-300 hidden md:inline">👥</span>
                 <span class="text-blue-200">{{ selectedEvent?.playerCount || 6 }} personnes</span>
               </div>
             </div>
             

             <!-- Date sur sa propre ligne -->
             <div class="mb-3">
               <p class="text-base md:text-lg text-purple-300">{{ formatDateFull(selectedEvent?.date) }}</p>
             </div>
             
             <!-- Boutons agenda et notifications sur la même ligne -->
             <div class="flex items-center gap-3 mb-3 pl-0 md:pl-0">
               <div class="relative">
                 <button 
                   @click="toggleCalendarMenuDetails()"
                   class="px-3 py-1.5 bg-purple-500/20 border border-purple-400/30 rounded text-sm flex items-center gap-2 hover:bg-purple-500/30 transition-colors duration-200 cursor-pointer"
                   title="Ajouter à votre agenda"
                 >
                   <span class="text-purple-300">📅</span>
                   <span class="text-purple-200">Ajouter à l'agenda</span>
                 </button>
                 
                 <!-- Menu déroulant d'agenda pour la modal -->
                 <div 
                   v-if="showCalendarMenuDetails"
                   class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-gray-900 border border-white/20 rounded-lg shadow-xl z-[99999] overflow-hidden"
                 >
                   <div class="p-2">
                     <button 
                       @click="handleAddToCalendar('google'); closeCalendarMenuDetails()"
                       class="w-full text-left px-3 py-2 text-white hover:bg-white/10 flex items-center gap-2 rounded text-sm"
                       title="Ouvrir dans Google Calendar"
                     >
                       <span>🌐</span>
                       <span>Google Calendar</span>
                     </button>
                     <button 
                       @click="handleAddToCalendar('outlook'); closeCalendarMenuDetails()"
                       class="w-full text-left px-3 py-2 text-white hover:bg-white/10 flex items-center gap-2 rounded text-sm"
                       title="Ouvrir dans Outlook"
                     >
                       <span>📧</span>
                       <span>Outlook</span>
                     </button>
                     <button 
                       @click="handleAddToCalendar('ics'); closeCalendarMenuDetails()"
                       class="w-full text-left px-3 py-2 text-white hover:bg-white/10 flex items-center gap-2 rounded text-sm border-t border-white/10 pt-2 mt-2"
                       title="Télécharger un fichier .ics compatible avec tous les agendas"
                     >
                       <span>📥</span>
                       <span>Télécharger (.ics)</span>
                     </button>
                   </div>
                 </div>
               </div>
               
               <!-- Bouton notifications -->
               <div v-if="isEventMonitoredState" class="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-400/30 rounded text-sm">
                 <span class="text-purple-300">✅</span>
                 <span class="text-purple-200">Notifications activées</span>
               </div>
               <button 
                 v-else 
                 @click="promptForNotifications(selectedEvent)"
                 class="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-400/30 rounded text-sm hover:bg-purple-500/30 transition-colors duration-200 cursor-pointer"
                 title="Reçois des alertes en temps réel : sélections, changements d'horaires, et plus !"
               >
                 <span class="text-purple-300">🔔</span>
                 <span class="text-purple-200">Activer les notifications</span>
               </button>
             </div>
            
            <!-- Description intégrée dans le header si elle existe -->
            <div v-if="selectedEvent?.description" class="text-sm text-gray-300 bg-gray-800/30 p-3 rounded-lg border border-gray-600/30 ml-0 md:ml-0">
              {{ selectedEvent.description }}
            </div>
            

          </div>
        </div>
      </div>

        <!-- Content scrollable -->
  <div class="px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
    <!-- Stats directes sans titre -->
        <div class="grid grid-cols-3 gap-3 md:gap-4 mb-2 md:mb-4">
          <div class="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-3 md:p-4 rounded-lg border border-cyan-500/30 text-center">
            <div class="text-xl md:text-2xl font-bold text-white">{{ countAvailablePlayers(selectedEvent?.id) }}</div>
            <div class="text-xs md:text-sm text-gray-300">Disponibles</div>
          </div>
          <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-3 md:p-4 rounded-lg border border-purple-500/30 text-center">
            <div class="text-xl md:text-2xl font-bold text-white">{{ countSelectedPlayers(selectedEvent?.id) }}</div>
            <div class="text-xs md:text-sm text-gray-300">Sélectionnés</div>
          </div>
          <div class="p-3 md:p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-center">
            <div class="text-xl md:text-2xl font-bold text-yellow-300">{{ Math.max((selectedEvent?.playerCount || 6) - countSelectedPlayers(selectedEvent?.id), 0) }}</div>
            <div class="text-xs md:text-sm text-yellow-300">Manquants</div>
          </div>
        </div>

        <!-- Section des disponibilités des joueurs (style allégé, filtres) -->
        <div v-if="selectedEvent" class="mb-4 md:mb-6">
          <!-- Alerte + Filtres + Badge statut -->
          <div class="mb-3 flex items-center gap-3">
            <div
              v-if="hasEventWarningForSelectedEvent"
              class="flex items-center gap-2 px-2 py-1 rounded-md border text-[11px] md:text-xs max-w-[50%] truncate"
              :class="eventStatus?.type === 'incomplete' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200' : 'bg-orange-500/10 border-orange-500/30 text-orange-200'"
              :title="eventWarningText"
            >
              <span>⚠️</span>
              <span class="truncate">{{ eventWarningText }}</span>
            </div>

            <!-- Badge statut de la sélection -->
            <SelectionStatusBadge
              v-if="selectedEvent && getSelectionPlayers(selectedEvent.id).length > 0"
              :status="eventStatus?.type"
              :show="true"
              :clickable="false"
            />

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

          <!-- Liste des joueurs (2 par ligne) -->
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="player in filteredPlayers"
              :key="player.id"
              class="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-800/40 transition-colors"
            >
              <div class="flex items-center min-w-0 gap-1.5">
                <span
                  v-if="preferredPlayerIdsSet.has(player.id)"
                  class="text-yellow-400 mr-1 text-xs"
                  title="Ma personne"
                >
                  ⭐
                </span>
                <span
                  v-else-if="isPlayerProtectedInGrid(player.id)"
                  class="text-yellow-400 mr-1 text-xs"
                  title="Personne protégée par mot de passe"
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
                  :is-selection-confirmed="isSelectionConfirmed(selectedEvent.id)"
                  :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer(selectedEvent.id)"
                  :player-selection-status="getPlayerSelectionStatus(player.name, selectedEvent.id)"
                  :season-id="seasonId"
                  :chance-percent="chances[player.name]?.[selectedEvent.id] ?? null"
                  :show-selected-chance="isSelectionComplete(selectedEvent.id)"
                  :disabled="selectedEvent?.archived === true"
                  :compact="true"
                  @toggle="handleAvailabilityToggle"
                  @toggle-selection-status="handlePlayerSelectionStatusToggle"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Actions desktop -->
        <div class="hidden md:flex justify-center flex-wrap gap-3 mt-4">
          <!-- Boutons principaux -->
          <button 
            @click="openEventAnnounceModal(selectedEvent)" 
            :disabled="selectedEvent?.archived"
            class="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600" 
            :title="selectedEvent?.archived ? 'Impossible d\'annoncer un événement archivé' : 'Annoncer l\'événement aux personnes (email, copie, WhatsApp)'"
          >
            <span>📢</span><span>Annoncer</span>
          </button>
          <button @click="openSelectionModal(selectedEvent)" class="px-5 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2" title="Gérer la sélection">
            <span>🎭</span><span>Sélection Équipe</span>
          </button>
          
          <!-- Menu 3-points pour actions secondaires -->
          <div class="relative" ref="eventMoreActionsRef">
            <button 
              @click="toggleEventMoreActionsDesktop()"
              class="px-5 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 flex items-center gap-2"
              title="Plus d'actions"
            >
              <span>⋯</span>
            </button>
          </div>
          
          <!-- Bouton Fermer -->
          <button @click="closeEventDetailsAndUpdateUrl" class="px-5 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300">Fermer</button>
          
          <!-- Dropdown des actions secondaires (positionné absolument) -->
          <teleport to="body">
            <div 
              v-if="showEventMoreActionsDesktop"
              ref="eventMoreActionsDropdownRef"
              class="w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-[400] overflow-hidden"
              :style="eventMoreActionsStyle"
            >
              <button 
                @click="startEditingFromDetails(); showEventMoreActionsDesktop = false" 
                class="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center gap-2 border-b border-white/10"
              >
                <span>✏️</span><span>Modifier</span>
              </button>
              <button 
                @click="toggleEventArchived(); showEventMoreActionsDesktop = false" 
                class="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center gap-2 border-b border-white/10"
                :title="selectedEvent?.archived ? 'Désarchiver cet événement' : 'Archiver cet événement'"
              >
                <span>{{ selectedEvent?.archived ? '📂' : '📁' }}</span><span>{{ selectedEvent?.archived ? 'Désarchiver' : 'Archiver' }}</span>
              </button>
              <button 
                @click="handleResetEventSelection(selectedEvent?.id); showEventMoreActionsDesktop = false" 
                class="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center gap-2 border-b border-white/10"
                title="Supprimer complètement la sélection et remettre le statut à 'Nouveau'"
              >
                <span>🔄</span><span>Réinitialiser</span>
              </button>
              <button 
                @click="confirmDeleteEvent(selectedEvent?.id); showEventMoreActionsDesktop = false" 
                class="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center gap-2"
              >
                <span>🗑️</span><span>Supprimer</span>
              </button>
            </div>
          </teleport>
        </div>

        <!-- More actions (mobile) - Supprimé, remplacé par un dropdown flottant -->
      </div>

      <!-- Footer sticky (mobile) -->
      <div class="md:hidden sticky bottom-0 w-full p-3 bg-gray-900/95 border-t border-white/10 backdrop-blur-sm flex items-center gap-2">
        <button @click="openEventAnnounceModal(selectedEvent)" :disabled="selectedEvent?.archived" class="h-12 px-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 flex-[1.4] disabled:opacity-50 disabled:cursor-not-allowed">📢 Annoncer</button>
        <button @click="openSelectionModal(selectedEvent)" class="h-12 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex-[1.4]">🎭 Sélection Équipe</button>
        <button @click="closeEventDetailsAndUpdateUrl" class="h-12 px-4 bg-gray-700 text-white rounded-lg flex-1">Fermer</button>
        <button @click="toggleEventMoreActionsMobile()" class="h-12 px-4 bg-gray-700 text-white rounded-lg flex items-center justify-center w-12">⋯</button>
      </div>
    </div>
  </div>

  <!-- Dropdown mobile pour actions d'événements (positionné absolument) -->
  <teleport to="body">
    <div 
      v-if="showEventMoreActions"
      ref="eventMoreActionsMobileDropdownRef"
      class="w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-[400] overflow-hidden md:hidden"
      :style="eventMoreActionsMobileStyle"
    >
      <!-- Boutons principaux en premier -->
      <button 
        @click="openEventAnnounceModal(selectedEvent); showEventMoreActions = false" 
        :disabled="selectedEvent?.archived"
        class="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center gap-2 border-b border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        :title="selectedEvent?.archived ? 'Impossible d\'annoncer un événement archivé' : 'Annoncer l\'événement aux personnes (email, copie, WhatsApp)'"
      >
        <span>📢</span><span>Annoncer</span>
      </button>
      
      <!-- Actions secondaires -->
      <button @click="startEditingFromDetails(); showEventMoreActions = false" class="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center gap-2 border-b border-white/10">
        <span>✏️</span><span>Modifier</span>
      </button>
      <button @click="toggleEventArchived(); showEventMoreActions = false" class="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center gap-2 border-b border-white/10">
        <span>{{ selectedEvent?.archived ? '📂' : '📁' }}</span><span>{{ selectedEvent?.archived ? 'Désarchiver' : 'Archiver' }}</span>
      </button>
      <button 
        @click="handleResetEventSelection(selectedEvent?.id); showEventMoreActions = false" 
        class="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center gap-2 border-b border-white/10"
        title="Supprimer complètement la sélection et remettre le statut à 'Nouveau'"
      >
        <span>🔄</span><span>Réinitialiser</span>
      </button>
      <button @click="confirmDeleteEvent(selectedEvent?.id); showEventMoreActions = false" class="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center gap-2">
        <span>🗑️</span><span>Supprimer</span>
      </button>
    </div>
  </teleport>

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
      <h2 class="text-2xl font-bold mb-6 text-white text-center">✏️ Modifier le spectacle</h2>
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
          placeholder="Description du spectacle (optionnel)"
          @keydown.esc="cancelEdit"
        ></textarea>
      </div>
      <div class="mb-6 flex items-center gap-3">
        <input id="edit-archived" type="checkbox" v-model="editingArchived" class="w-4 h-4" />
        <label for="edit-archived" class="text-sm font-medium text-gray-300">Archiver ce spectacle</label>
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Nombre de personnes à sélectionner</label>
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
    :season-slug="props.slug"
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
        <p class="text-lg text-gray-300">Suppression de personne protégée</p>
        <p class="text-sm text-gray-400 mt-2">Cette personne est protégée par mot de passe</p>
      </div>

      <!-- Formulaire de vérification -->
      <div class="mb-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Mot de passe de la personne</label>
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
        <p class="text-sm text-gray-400 mt-1">Cette personne est protégée par mot de passe</p>
      </div>

      <!-- Contenu scrollable -->
      <div class="px-4 pt-3 pb-16 md:px-6 md:pt-4 md:pb-20 overflow-y-auto">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Mot de passe de la personne</label>
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
          Un email de réinitialisation sera envoyé à l'adresse associée à cette personne.
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
        <p class="text-lg text-gray-300">Suppression de personne protégée</p>
      </div>

      <div class="mb-6">
        <p class="text-sm text-gray-300 mb-4">
          Un email de réinitialisation sera envoyé à l'adresse associée à cette personne.
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
    :is-protected="selectedPlayer ? protectedPlayers.has(selectedPlayer.id) : false"
    :is-preferred="selectedPlayer ? preferredPlayerIdsSet.has(selectedPlayer.id) : false"
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
    :sending="isSendingNotifications"
    :is-selection-confirmed="isSelectionConfirmed(selectionModalEvent?.id)"
    :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer(selectionModalEvent?.id)"
    @close="closeSelectionModal"
    @selection="handleSelectionFromModal"
    @perfect="handlePerfectFromModal"
    @send-notifications="handleSendNotifications"
    @update-selection="handleUpdateSelectionFromModal"
    @confirm-selection="handleConfirmSelectionFromModal"
    @unconfirm-selection="handleUnconfirmSelectionFromModal"
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
  
  <!-- Modale Notifications -->
  <NotificationsModal
    :show="showNotifications"
    @close="closeNotifications"
  />
  
  <!-- Modale Mes Joueurs -->
  <PlayersModal
    :show="showPlayers"
    @close="closePlayers"
    @manage-player="onManageAccountPlayer"
  />

  <!-- Modal d'incitation aux notifications -->
  <NotificationPromptModal
    :show="showNotificationPrompt"
    :player-name="notificationPromptData?.playerName || ''"
    :event-title="notificationPromptData?.eventTitle || ''"
    :season-id="seasonId"
    :season-slug="seasonSlug"
    :event-id="notificationPromptData?.eventId || ''"
    @close="showNotificationPrompt = false"
    @success="handleNotificationPromptSuccess"
    @show-login="handleShowLogin"
  />

  <!-- Modal de protection des saisies -->
  <PlayerClaimModal
    :show="showPlayerClaim"
    :player="playerClaimData?.player || null"
    :season-id="seasonId"
    @close="showPlayerClaim = false"
    @update="handlePlayerClaimUpdate"
  />
  
  <!-- Modale de succès des notifications -->
  <NotificationSuccessModal
    :show="showNotificationSuccess"
    :player-name="notificationSuccessData?.playerName || ''"
    :email="notificationSuccessData?.email || ''"
    :season-slug="seasonSlug"
    :event-id="notificationSuccessData?.eventId || null"

    @close="showNotificationSuccess = false"
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
    @success="handleAccountLoginSuccess"
    @open-account-creation="showAccountCreation = true"
  />

  <!-- Modal de création de compte -->
  <AccountCreationModal
    :show="showAccountCreation"
    @close="showAccountCreation = false"
    @success="() => { showAccountCreation = false; showAccountMenu = true }"
  />

  <!-- Modal de prompt pour annoncer après création/modification -->
  <div v-if="showAnnouncePrompt" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-6 rounded-2xl shadow-2xl max-w-md">
              <h3 class="text-xl font-bold text-white mb-4 text-center">Voulez-vous annoncer ce spectacle ?</h3>
              <p class="text-gray-300 text-center mb-6">Envoyer des notifications aux personnes pour qu'elles indiquent leur disponibilité</p>
      
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
import { trackPageVisit, trackModalInteraction } from '../services/navigationTracker.js'
import { useRouter, useRoute } from 'vue-router'
import { collection, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase.js'
import { auth } from '../services/firebase.js'
import { currentUser } from '../services/authState.js'
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
import { addToCalendar } from '../services/calendarService.js'
import { shouldPromptForNotifications, checkEmailExists } from '../services/notificationActivation.js'
import { verifySeasonPin, getSeasonPin } from '../services/seasons.js'
import pinSessionManager from '../services/pinSession.js'
import playerPasswordSessionManager from '../services/playerPasswordSession.js'
import { rememberLastVisitedSeason } from '../services/seasonPreferences.js'
import logger from '../services/logger.js'
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
import SeasonHeader from './SeasonHeader.vue'
import NotificationsModal from './NotificationsModal.vue'
import PlayersModal from './PlayersModal.vue'
import NotificationPromptModal from './NotificationPromptModal.vue'
import NotificationSuccessModal from './NotificationSuccessModal.vue'
import AccountCreationModal from './AccountCreationModal.vue'
import SelectionStatusBadge from './SelectionStatusBadge.vue'

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

// Gestion de l'état d'authentification
function onAuthStateChanged(user) {
  // currentUser est maintenant importé depuis authState.js
  
  // Mettre à jour l'état de surveillance quand l'authentification change
  nextTick(() => {
    updateEventMonitoredState()
  })
  
  // Forcer la mise à jour de l'interface pour les joueurs protégés
  // quand l'état d'authentification change
  nextTick(() => {
    // Forcer la réactivité en déclenchant un changement sur protectedPlayers
    // Cela va faire que isPlayerProtectedInGrid() retourne le bon état
    const currentProtected = new Set(protectedPlayers.value)
    protectedPlayers.value = new Set()
    nextTick(() => {
      protectedPlayers.value = currentProtected
    })
  })
  
  // Synchroniser les favoris avec l'état de connexion Firebase
  nextTick(async () => {
    await syncFavoritesWithAuthState(user)
  })
}

// Fonction pour synchroniser les favoris avec l'état de connexion Firebase
async function syncFavoritesWithAuthState(user) {
  try {
    if (seasonId.value) {
      if (user?.email) {
        // Utilisateur connecté : charger les favoris depuis Firebase
        console.log('🔄 Chargement des favoris pour utilisateur connecté:', user.email)
        await updatePreferredPlayersSet()
      } else {
        // Utilisateur déconnecté : vider les favoris
        console.log('🔄 Utilisateur déconnecté, effacement des favoris')
        preferredPlayerIdsSet.value = new Set()
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation des favoris:', error)
  }
}

// État réactif pour la surveillance des événements
const isEventMonitoredState = ref(false)

// Fonction pour mettre à jour l'état de surveillance
async function updateEventMonitoredState() {
  if (!selectedEvent.value?.id) {
    isEventMonitoredState.value = false
    return
  }
  
  try {
    isEventMonitoredState.value = await isEventMonitored(selectedEvent.value.id)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'état de surveillance:', error)
    isEventMonitoredState.value = false
  }
}

const seasonSlug = props.slug
const seasonName = ref('')
const seasonId = ref('')
const seasonMeta = ref({})

// État du scroll pour le header sticky
const isScrolled = ref(false)

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
const showEventMoreActionsDesktop = ref(false)
const eventMoreActionsRef = ref(null)
const eventMoreActionsDropdownRef = ref(null)
const eventMoreActionsStyle = ref({ position: 'fixed', top: '0px', left: '0px' })
const eventMoreActionsMobileDropdownRef = ref(null)
const eventMoreActionsMobileStyle = ref({ position: 'fixed', top: '0px', left: '0px' })

// Variables pour les menus d'agenda
const showCalendarMenuDetails = ref(false)

// Variables pour l'incitation aux notifications
const showNotificationPrompt = ref(false)
const notificationPromptData = ref(null)

// État pour la modale de succès des notifications
const showNotificationSuccess = ref(false)
const notificationSuccessData = ref(null)

// Variables pour la modale de protection des saisies
const showPlayerClaim = ref(false)
const playerClaimData = ref(null)

// Fonctions pour gérer le dropdown des actions d'événements
function updateEventMoreActionsPosition() {
  try {
    const anchor = eventMoreActionsRef.value
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    const gap = 8
    
    // Sur desktop, positionner au-dessus du bouton
    if (window.innerWidth > 768) {
      const top = Math.max(gap, Math.round(rect.top - gap))
      const left = Math.max(gap, Math.round(rect.left))
      eventMoreActionsStyle.value = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 400
      }
    } else {
      // Sur mobile, positionner en dessous (pull-up style)
      const top = Math.min(window.innerHeight - gap, Math.round(rect.bottom + gap))
      const left = Math.max(gap, Math.round(rect.left))
      eventMoreActionsStyle.value = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 400
      }
    }
  } catch {}
}

function updateEventMoreActionsMobilePosition() {
  try {
    // Pour mobile, positionner le dropdown au-dessus du bouton 3-points du footer
    const gap = 8
    const buttonHeight = 48 // hauteur du bouton 3-points (h-12)
    const dropdownHeight = 200 // estimation de la hauteur du dropdown
    
    // Positionner au-dessus du footer (pull-up style)
    const top = Math.max(gap, window.innerHeight - gap - buttonHeight - dropdownHeight)
    const left = Math.max(gap, Math.round(window.innerWidth - 200 - gap)) // 200 = largeur du dropdown (w-48)
    
    eventMoreActionsMobileStyle.value = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 400
    }
  } catch {}
}

function toggleEventMoreActionsDesktop() {
  showEventMoreActionsDesktop.value = !showEventMoreActionsDesktop.value
  if (showEventMoreActionsDesktop.value) {
    nextTick(() => updateEventMoreActionsPosition())
  }
}

function toggleEventMoreActionsMobile() {
  showEventMoreActions.value = !showEventMoreActions.value
  if (showEventMoreActions.value) {
    nextTick(() => updateEventMoreActionsMobilePosition())
  }
}

// Fonctions pour gérer les menus d'agenda
function toggleCalendarMenuDetails() {
  showCalendarMenuDetails.value = !showCalendarMenuDetails.value
}

function closeCalendarMenuDetails() {
  showCalendarMenuDetails.value = false
}

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
      // Positionner le coachmark près du bouton Ajouter une personne (scroll si hors vue)
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
const showAccountCreation = ref(false)
const showNotifications = ref(false)
const showPlayers = ref(false)
const accountAuthPlayer = ref(null)
async function openAccountMenu() {
  showAccountMenu.value = true
  
  // Logger l'audit d'ouverture de modale
  try {
    const { default: AuditClient } = await import('../services/auditClient.js')
    await AuditClient.logModalOpen('account_menu', { seasonSlug: props.slug })
  } catch (auditError) {
    console.warn('Erreur audit modal:', auditError)
  }
  
  // Synchroniser l'URL avec l'état de la modale "Mon Compte"
  // Éviter la duplication du paramètre open=account
  const currentPath = `/season/${props.slug}`
  const currentSearch = new URLSearchParams(window.location.search)
  
  // Nettoyer les paramètres existants et ajouter open=account
  currentSearch.delete('open')
  currentSearch.set('open', 'account')
  
  const newUrl = `${currentPath}?${currentSearch.toString()}`
  router.push(newUrl)
}
function closeAccountMenu() { 
  showAccountMenu.value = false
  
  // Nettoyer l'URL en retirant le paramètre open=account
  // Préserver les autres paramètres (event, player, etc.)
  const currentPath = `/season/${props.slug}`
  const currentSearch = new URLSearchParams(window.location.search)
  
  // Supprimer seulement le paramètre open
  currentSearch.delete('open')
  
  const newUrl = currentSearch.toString() ? `${currentPath}?${currentSearch.toString()}` : currentPath
  router.push(newUrl)
}

async function openNotifications() {
  showNotifications.value = true
  
  // Logger l'audit d'ouverture de modale
  try {
    const { default: AuditClient } = await import('../services/auditClient.js')
    await AuditClient.logModalOpen('notifications', { seasonSlug: props.slug })
  } catch (auditError) {
    console.warn('Erreur audit modal:', auditError)
  }
}
function closeNotifications() { 
  showNotifications.value = false 
}

async function openPlayers() {
  showPlayers.value = true
  
  // Logger l'audit d'ouverture de modale
  try {
    const { default: AuditClient } = await import('../services/auditClient.js')
    await AuditClient.logModalOpen('players', { seasonSlug: props.slug })
  } catch (auditError) {
    console.warn('Erreur audit modal:', auditError)
  }
}
function closePlayers() { 
  showPlayers.value = false 
}
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
  
  // Synchroniser l'URL avec l'état de la modale "Mon Compte"
  // Éviter la duplication du paramètre open=account
  const currentPath = `/season/${props.slug}`
  const currentSearch = new URLSearchParams(window.location.search)
  
  // Nettoyer les paramètres existants et ajouter open=account
  currentSearch.delete('open')
  currentSearch.set('open', 'account')
  
  const newUrl = `${currentPath}?${currentSearch.toString()}`
  router.push(newUrl)
}

function openAccountCreation() {
  showAccountCreation.value = true
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
    

    
    // Nettoyer l'URL après déconnexion
    // Préserver les autres paramètres (event, player, etc.)
    const currentPath = `/season/${props.slug}`
    const currentSearch = new URLSearchParams(window.location.search)
    
    // Supprimer seulement le paramètre open
    currentSearch.delete('open')
    
    const newUrl = currentSearch.toString() ? `${currentPath}?${currentSearch.toString()}` : currentPath
    router.push(newUrl)
    
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
onMounted(async () => {
  // Initialiser l'état d'authentification
  currentUser.value = auth.currentUser
  
  // Écouter les changements d'état d'authentification
  const unsubscribe = auth.onAuthStateChanged(onAuthStateChanged)
  
  // Stocker la fonction de cleanup pour onUnmounted
  window._gridBoardUnsubscribe = unsubscribe
  
  try {
    if (seasonId.value) {
      const dismiss = localStorage.getItem(`dismissCreatorOnboarding:${seasonId.value}`)
      if (dismiss) {
        onboardingDismissedShare.value = true
      }
    }
  } catch {}
  
  // Tracking de navigation pour les utilisateurs non connectés
  try {
    const currentPath = window.location.pathname
    if (currentPath && currentPath !== '/') {
      // Essayer de récupérer l'email depuis l'URL ou localStorage
      const urlParams = new URLSearchParams(window.location.search)
      const email = urlParams.get('email') || localStorage.getItem('hatcast_last_email')
      
      if (email) {
        await trackPageVisit(email, currentPath, {
          seasonSlug: props.slug,
          source: 'grid_board'
        })
      }
    }
  } catch (error) {
    // Log silencieux pour les erreurs de tracking non critiques
    if (error.code !== 'permission-denied') {
      logger.error('Erreur lors du tracking de navigation:', error)
    }
  }
  
  // Détection automatique des modales selon l'URL
  try {
    const urlParams = new URLSearchParams(window.location.search)
    
    // Ouvrir automatiquement "Mon Compte" si demandé
    if (urlParams.get('open') === 'account') {
      nextTick(() => {
        showAccountMenu.value = true
      })
    }
    
    // Ouvrir automatiquement la protection si demandé (sauf si on vient de vérifier l'email)
    if (urlParams.get('open') === 'protection' && urlParams.get('player') && !urlParams.get('verified')) {
      const playerId = urlParams.get('player')
      const targetPlayer = players.value.find(p => p.id === playerId)
      if (targetPlayer) {
        nextTick(() => {
          showPlayerDetails(targetPlayer)
        })
      }
    }
    
    // Ouvrir automatiquement les détails d'événement si demandé
    if (urlParams.get('modal') === 'event_details' && urlParams.get('event')) {
      const eventId = urlParams.get('event')
      const targetEvent = events.value.find(e => e.id === eventId)
      if (targetEvent) {
        nextTick(() => {
          showEventDetails(targetEvent)
        })
      }
    }
    
    // Ouvrir automatiquement les détails de joueur si demandé (sauf si on vient de vérifier l'email)
    if (urlParams.get('modal') === 'player_details' && urlParams.get('player') && !urlParams.get('verified')) {
      const playerId = urlParams.get('player')
      const targetPlayer = players.value.find(p => p.id === playerId)
      if (targetPlayer) {
        nextTick(() => {
          showPlayerDetails(targetPlayer)
        })
      }
    }
    
    // Gestion de la protection activée après vérification d'email
    if (urlParams.get('verified') === '1' && urlParams.get('player')) {
      const playerId = urlParams.get('player')
      const protectionActivated = localStorage.getItem('protectionActivated')
      const protectedPlayerId = localStorage.getItem('protectedPlayerId')
      
      if (protectionActivated === 'true' && protectedPlayerId === playerId) {
        // Protection activée avec succès, mettre à jour les favoris
        try {
          // Mettre à jour l'état des favoris pour déclencher la réactivité
          await updatePreferredPlayersSet()
          console.log('🔄 Favoris mis à jour après activation de la protection')
          
                            // Afficher un message de succès
                  showSuccessMessage.value = true
                  const playerName = players.value.find(p => p.id === playerId)?.name || 'le joueur'
                  successMessage.value = `Protection activée ! ${playerName} est maintenant dans vos ⭐️ favoris`
                  setTimeout(() => {
                    showSuccessMessage.value = false
                  }, 5000)
          
          // Nettoyer le localStorage
          localStorage.removeItem('protectionActivated')
          localStorage.removeItem('protectedPlayerId')
          localStorage.removeItem('protectedSeasonId')
          
          console.log('✅ Joueur ajouté en favoris après activation de la protection:', playerId)
          
          // Si l'URL contient aussi open=protection, ouvrir les détails du joueur après un délai
          if (urlParams.get('open') === 'protection') {
            const targetPlayer = players.value.find(p => p.id === playerId)
            if (targetPlayer) {
              setTimeout(() => {
                showPlayerDetails(targetPlayer)
              }, 1000) // Délai pour laisser le temps au message de succès de s'afficher
            }
          }
          
          // Note: La connexion automatique se fait maintenant directement dans MagicLink.vue
          // via la Cloud Function createCustomTokenForEmail, donc pas besoin d'afficher
          // la modale de connexion ici
        } catch (error) {
          console.error('Erreur lors de l\'ajout en favoris:', error)
        }
      }
    }
  } catch (error) {
    logger.error('Erreur lors de la détection automatique des modales:', error)
  }
  
  // Gestionnaire de scroll pour le header sticky
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 10
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  // Gestionnaire de clic en dehors du dropdown desktop pour fermer automatiquement
  document.addEventListener('click', (event) => {
    // Gestion du dropdown desktop
    if (showEventMoreActionsDesktop.value) {
      const anchorEl = eventMoreActionsRef.value
      const dropdownEl = eventMoreActionsDropdownRef.value
      const clickedInsideAnchor = anchorEl && anchorEl.contains(event.target)
      const clickedInsideDropdown = dropdownEl && dropdownEl.contains(event.target)
      if (!clickedInsideAnchor && !clickedInsideDropdown) {
        showEventMoreActionsDesktop.value = false
      }
    }
    
    // Gestion du dropdown mobile
    if (showEventMoreActions.value) {
      const dropdownEl = eventMoreActionsMobileDropdownRef.value
      const clickedInsideDropdown = dropdownEl && dropdownEl.contains(event.target)
      if (!clickedInsideDropdown) {
        showEventMoreActions.value = false
      }
    }
  })
  
  // Gestionnaire de la touche Échap pour fermer le dropdown desktop
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (showEventMoreActionsDesktop.value) {
        showEventMoreActionsDesktop.value = false
      }
      if (showEventMoreActions.value) {
        showEventMoreActions.value = false
      }
    }
  })
  
  // Gestionnaires pour repositionner le dropdown des actions d'événements
  // Gestionnaires pour repositionner les dropdowns des actions d'événements
  window.addEventListener('resize', () => {
    if (showEventMoreActionsDesktop.value) {
      updateEventMoreActionsPosition()
    }
    if (showEventMoreActions.value) {
      updateEventMoreActionsMobilePosition()
    }
  })
  
  window.addEventListener('scroll', () => {
    if (showEventMoreActionsDesktop.value) {
      updateEventMoreActionsPosition()
    }
    if (showEventMoreActions.value) {
      updateEventMoreActionsMobilePosition()
    }
  }, { passive: true })
  
  // Retourner la fonction de cleanup
  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
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
          successMessage.value = 'Nouvelle personne ajoutée !'
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
  // Cleanup de l'écouteur d'authentification
  if (window._gridBoardUnsubscribe) {
    window._gridBoardUnsubscribe()
    delete window._gridBoardUnsubscribe
  }
  
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
  // Retourner true si le joueur est dans la liste des joueurs protégés
  // Peu importe si l'utilisateur est connecté ou non
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

async function handleResetEventSelection(eventId) {
  // Vérifier s'il y a une sélection existante
  if (!selections.value[eventId]) {
    showSuccessMessage.value = true
    successMessage.value = 'Aucune sélection à réinitialiser pour cet événement'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
    return
  }
  
  // Demander le PIN code avant de réinitialiser la sélection
  await requirePin({
    type: 'resetSelection',
    data: { eventId }
  })
}

async function deleteEventConfirmed(eventId = null) {
  const eventIdToDelete = eventId || eventToDelete.value
  // eslint-disable-next-line no-console
  // Suppression d'événement confirmée
  
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
    alert('Le nombre de personnes doit être un nombre entier entre 1 et 20')
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
    
    // Récupérer l'ancienne date pour comparer
    const oldEvent = events.value.find(e => e.id === editingEvent.value)
    const oldDate = oldEvent?.date
    const dateChanged = oldDate !== editingDate.value
    
    await updateEvent(editingEvent.value, eventData, seasonId.value)
    
    // Si la date a changé et qu'il y a des joueurs sélectionnés, recréer les rappels
    if (dateChanged && !eventData.archived) {
      try {
        const { createRemindersForSelection, removeRemindersForEvent } = await import('../services/reminderService.js')
        
        // Supprimer tous les anciens rappels pour cet événement
        await removeRemindersForEvent({
          seasonId: seasonId.value,
          eventId: editingEvent.value
        })
        
        // Récupérer les joueurs sélectionnés (toujours un tableau)
        const selectedPlayers = getSelectionPlayers(editingEvent.value)
        
        // Recréer les rappels pour chaque joueur sélectionné
        const reminderResults = []
        for (const playerName of selectedPlayers) {
          try {
            const player = players.value.find(p => p.name === playerName)
            if (player?.email) {
              const result = await createRemindersForSelection({
                seasonId: seasonId.value,
                eventId: editingEvent.value,
                playerEmail: player.email,
                playerName: player.name,
                eventTitle: eventData.title,
                eventDate: eventData.date,
                seasonSlug: props.slug
              })
              if (result.success) {
                reminderResults.push(...result.results)
              }
            }
          } catch (error) {
            console.error('Erreur lors de la recréation des rappels pour', playerName, error)
          }
        }
        
        console.log('🎯 Rappels mis à jour pour la nouvelle date:', {
          eventId: editingEvent.value,
          eventTitle: eventData.title,
          newDate: eventData.date,
          selectedPlayers: selectedPlayers.length,
          remindersCreated: reminderResults.filter(r => r.success).length
        })
        
        // Afficher un message de succès plus détaillé pour les rappels
        if (reminderResults.length > 0) {
          const successCount = reminderResults.filter(r => r.success).length
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour des rappels:', error)
      }
    }
    
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
    
    // Message de succès final
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
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette personne ?')) return

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
    successMessage.value = 'Personne supprimée avec succès !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erreur lors de la suppression du joueur')
    alert('Erreur lors de la suppression de la personne. Veuillez réessayer.')
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
      successMessage.value = 'Personne ajoutée avec succès ! Vous pouvez maintenant indiquer sa disponibilité.'
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
    alert('Erreur lors de l\'ajout de la personne. Veuillez réessayer.')
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
    alert('Le nombre de personnes doit être un nombre entier entre 1 et 20')
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

// Surveiller les changements d'état d'authentification pour recharger les joueurs protégés
watch(() => auth.currentUser?.email, async (newEmail, oldEmail) => {
  if (newEmail !== oldEmail && seasonId.value) {
    console.log('🔄 Changement d\'état d\'authentification, rechargement des joueurs protégés')
    await loadProtectedPlayers()
    await updatePreferredPlayersSet()
  }
})

// Initialiser les données au montage
onMounted(async () => {
  try {
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
      
      selSnap.docs.forEach(doc => { 
        const data = doc.data()
        
        // Préserver la nouvelle structure complète ou migrer l'ancienne
        if (data.players && Array.isArray(data.players)) {
          // Nouvelle structure avec playerStatuses, confirmed, etc.
          selObj[doc.id] = data
        } else if (Array.isArray(data)) {
          // Ancienne structure : migrer vers la nouvelle
          selObj[doc.id] = {
            players: data,
            confirmed: false,
            confirmedByAllPlayers: false,
            playerStatuses: {},
            updatedAt: new Date()
          }
        } else {
          // Structure inconnue, utiliser un tableau vide
          selObj[doc.id] = {
            players: [],
            confirmed: false,
            confirmedByAllPlayers: false,
            playerStatuses: {},
            updatedAt: new Date()
          }
        }
      })
      
      selections.value = selObj

      const protections = await listProtectedPlayers(seasonId.value)
      const protSet = new Set()
      if (Array.isArray(protections)) {
        protections.forEach(p => { if (p.isProtected) protSet.add(p.playerId || p.id) })
      }
      protectedPlayers.value = protSet
      
      // Initialiser les joueurs préférés si l'utilisateur est connecté
      if (auth.currentUser?.email) {
        await updatePreferredPlayersSet()
      }
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
    // Données chargées

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
      // Événement trouvé depuis l'URL
      
      // Utiliser la fonction améliorée de focus
      await focusOnEventFromUrl(eventIdFromUrl, targetEvent)
      
              // Si modal=event_details est demandé, ouvrir automatiquement la modal
        if (route.query.modal === 'event_details') {
          showEventDetails(targetEvent)
        }
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
        successMessage.value = 'Personne associée à votre compte.'
        setTimeout(() => { showSuccessMessage.value = false }, 2500)
      }
    }
  }

  // Détecter si on arrive depuis un magic link (pour forcer le rechargement des données)
  const urlParams = new URLSearchParams(window.location.search)
  const magicLinkAction = urlParams.get('a') || route.query.a
  const magicLinkEventId = urlParams.get('eid') || route.query.eid
  
  if (magicLinkAction === 'confirm' && magicLinkEventId) {
    console.debug('🔄 Détection d\'un magic link de confirmation, rechargement des données...')
    // Forcer le rechargement des sélections pour cet événement
    await loadSelections(seasonId.value)
    // Mettre à jour les sélections locales
    selections.value = await loadSelections(seasonId.value)
    console.debug('✅ Sélections rechargées après magic link')
    // Nettoyer l'URL
    router.replace({ query: { ...route.query, a: undefined, eid: undefined } })
  }

  // Gérer le paramètre notificationSuccess (APRÈS tous les autres traitements d'URL)
  console.debug('🔍 Vérification des paramètres notificationSuccess...', {
    routeQuery: route.query,
    notificationSuccess: route.query.notificationSuccess,
    email: route.query.email,
    playerName: route.query.playerName,
    eventId: route.query.eventId
  })
  
  if (route.query.notificationSuccess === '1') {
    console.debug('✅ Paramètres notificationSuccess détectés dans route.query')
    
    // Fermer d'abord la modal de prompt des notifications si elle est ouverte
    if (showNotificationPrompt.value) {
      showNotificationPrompt.value = false
      console.debug('🔒 Fermeture de NotificationPromptModal avant affichage de NotificationSuccessModal')
    }
    
    notificationSuccessData.value = {
      email: decodeURIComponent(route.query.email || ''),
      playerName: decodeURIComponent(route.query.playerName || ''),
      eventId: route.query.eventId || null
    }
    
    console.debug('📝 Données de notificationSuccess préparées:', notificationSuccessData.value)
    
    // Délai pour s'assurer que la modal d'activation soit fermée et que l'interface soit prête
    setTimeout(() => {
      showNotificationSuccess.value = true
      console.debug('🎉 Ouverture de NotificationSuccessModal')
    }, 300)
    
    // Nettoyer l'URL
    router.replace({ query: { ...route.query, notificationSuccess: undefined, email: undefined, playerName: undefined, eventId: undefined } })
  } else {
    // Fallback : essayer de parser manuellement window.location.search
    const urlParams = new URLSearchParams(window.location.search)
    const notificationSuccess = urlParams.get('notificationSuccess')
    const email = urlParams.get('email')
    const playerName = urlParams.get('playerName')
    const eventId = urlParams.get('eventId')
    
    console.debug('🔍 Fallback - Paramètres détectés via window.location.search:', {
      notificationSuccess,
      email,
      playerName,
      eventId
    })
    
    if (notificationSuccess === '1') {
      console.debug('✅ Paramètres détectés via fallback')
      
      // Fermer d'abord la modal de prompt des notifications si elle est ouverte
      if (showNotificationPrompt.value) {
        showNotificationPrompt.value = false
        console.debug('🔒 Fermeture de NotificationPromptModal avant affichage de NotificationSuccessModal (fallback)')
      }
      
      notificationSuccessData.value = {
        email: decodeURIComponent(email || ''),
        playerName: decodeURIComponent(playerName || ''),
        eventId: eventId || null
      }
      
      console.debug('📝 Données de notificationSuccess préparées (fallback):', notificationSuccessData.value)
      
      // Délai pour s'assurer que la modal d'activation soit fermée et que l'interface soit prête
      setTimeout(() => {
        showNotificationSuccess.value = true
        console.debug('🎉 Ouverture de NotificationSuccessModal (fallback)')
      }, 300)
      
      // Nettoyer l'URL
      router.replace({ query: { ...route.query, notificationSuccess: undefined, email: undefined, playerName: undefined, eventId: undefined } })
    }
  }

  } catch (error) {
    // En cas d'erreur, afficher un message et continuer
    console.error('Erreur lors du chargement de la grille:', error)
    showErrorMessage.value = true
    errorMessage.value = 'Erreur lors du chargement des données'
    setTimeout(() => {
      showErrorMessage.value = false
    }, 5000)
    
    // Forcer la fermeture du loading même en cas d'erreur
    isLoadingGrid.value = false
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
  const base = [...players.value].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' }))
  
  // Pour les utilisateurs connectés, remonter leurs joueurs favoris en haut
  if (currentUser.value?.email && preferredPlayerIdsSet.value.size > 0) {
    console.log('🔄 Tri des joueurs avec favoris en premier')
    const favoritesFirst = base.filter(p => preferredPlayerIdsSet.value.has(p.id))
    const rest = base.filter(p => !preferredPlayerIdsSet.value.has(p.id))
    
    // Trier les favoris par ordre alphabétique
    const sortedFavorites = favoritesFirst.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' }))
    
    console.log('⭐ Favoris en premier:', sortedFavorites.map(p => p.name))
    console.log('📝 Reste des joueurs:', rest.map(p => p.name))
    
    return [...sortedFavorites, ...rest]
  }
  
  return base
})

// Exposer l'ensemble des joueurs préférés pour la surbrillance légère
const preferredPlayerIdsSet = ref(new Set())

// Fonction pour mettre à jour les joueurs préférés depuis Firebase
async function updatePreferredPlayersSet() {
  try {
    // Seulement si l'utilisateur est connecté
    if (!currentUser.value?.email || !seasonId.value) {
      preferredPlayerIdsSet.value = new Set()
      return
    }
    
    // Charger les associations depuis Firebase
    const assocs = await listAssociationsForEmail(currentUser.value.email)
    const seasonal = assocs.filter(a => a.seasonId === seasonId.value)
    
    if (seasonal.length > 0) {
      const playerIds = seasonal.map(a => a.playerId)
      preferredPlayerIdsSet.value = new Set(playerIds)
      console.log('✅ Favoris chargés depuis Firebase:', playerIds)
    } else {
      preferredPlayerIdsSet.value = new Set()
      console.log('ℹ️ Aucun favori trouvé pour cette saison')
      
      // Si on vient de vérifier un email et qu'on n'a pas trouvé de favoris,
      // réessayer après un délai (problème de propagation Firestore)
      if (localStorage.getItem('protectionActivated') === 'true') {
        console.log('🔄 Retry après 1s pour la propagation Firestore...')
        setTimeout(async () => {
          try {
            const retryAssocs = await listAssociationsForEmail(currentUser.value.email)
            const retrySeasonal = retryAssocs.filter(a => a.seasonId === seasonId.value)
            if (retrySeasonal.length > 0) {
              const retryPlayerIds = retrySeasonal.map(a => a.playerId)
              preferredPlayerIdsSet.value = new Set(retryPlayerIds)
              console.log('✅ Favoris trouvés au retry:', retryPlayerIds)
            }
          } catch (retryError) {
            console.warn('❌ Erreur lors du retry:', retryError)
          }
        }, 1000)
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement des favoris:', error)
    preferredPlayerIdsSet.value = new Set()
  }
}

// Fonction helper pour vérifier si l'utilisateur est connecté (y compris les utilisateurs anonymes avec email)
function isUserConnected() {
  return !!auth.currentUser?.email || !!localStorage.getItem('userEmail')
}

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
    const selectionSet = new Set(getSelectionPlayers(eventId))

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
    // Joueur protégé : vérifier s'il y a une session active
    const hasCachedPassword = isPlayerPasswordCached(player.id);
    const hasCachedPin = pinSessionManager.isPinCached(seasonId.value);
    
    if (hasCachedPassword || hasCachedPin) {
      // Session active ou PIN de saison en cache, procéder au toggle
      await performToggleAvailability(player, eventId);
      
      // Pour les joueurs protégés, ne pas afficher de popup de connexion
      return;
    } else {
      // Pas de session, demander le mot de passe
      pendingAvailabilityAction.value = { playerName, eventId };
      passwordVerificationPlayer.value = player;
      showPasswordVerification.value = true;
      return; // Attendre la vérification
    }
  } else {
    // Joueur non protégé, procéder directement
    await performToggleAvailability(player, eventId);
    
    
  }
}

async function performToggleAvailability(player, eventId) {
  // Récupérer l'état actuel depuis availability.value
  const current = availability.value[player.name]?.[eventId];
  // Toggle de disponibilité
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
  
  // Logger l'audit de modification de disponibilité
  try {
    const { default: AuditClient } = await import('../services/auditClient.js')
    const event = events.value.find(e => e.id === eventId)
    await AuditClient.logUserAction({
      type: 'availability_changed',
      category: 'availability',
      severity: 'info',
      data: {
        playerName: player.name,
        eventTitle: event?.title || 'Unknown',
        seasonSlug: props.slug,
        eventId: eventId,
        oldValue: current,
        newValue: newValue,
        action: 'toggle_availability'
      },
      success: true,
      tags: ['availability', 'toggle']
    })
  } catch (auditError) {
    console.warn('Erreur audit toggleAvailability:', auditError)
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

// Fonction pour gérer le changement de statut individuel d'un joueur dans une sélection
async function handlePlayerSelectionStatusToggle(playerName, eventId, newStatus, seasonId) {
  try {
    // Mettre à jour le statut dans le stockage
    const { updatePlayerSelectionStatus } = await import('../services/storage.js')
    const result = await updatePlayerSelectionStatus(eventId, playerName, newStatus, seasonId)
    
    // Logger l'audit de confirmation de participation
    try {
      const { default: AuditClient } = await import('../services/auditClient.js')
      const event = events.value.find(e => e.id === eventId)
      
      if (newStatus === 'confirmed') {
        await AuditClient.logPlayerConfirmed(playerName, event?.title || 'Unknown', seasonSlug, {
          eventId,
          status: newStatus,
          confirmedByAllPlayers: result.confirmedByAllPlayers
        })
      } else if (newStatus === 'declined') {
        await AuditClient.logPlayerWithdrawn(playerName, event?.title || 'Unknown', seasonSlug, {
          eventId,
          status: newStatus
        })
      }
    } catch (auditError) {
      console.warn('Erreur audit playerSelectionStatus:', auditError)
    }
    
    // Mettre à jour la structure locale
    if (selections.value[eventId]) {
      if (selections.value[eventId].playerStatuses) {
        selections.value[eventId].playerStatuses[playerName] = newStatus
      } else {
        selections.value[eventId].playerStatuses = { [playerName]: newStatus }
      }
      
      // Mettre à jour l'état global de la sélection
      if (typeof result.confirmedByAllPlayers === 'boolean') {
        selections.value[eventId].confirmedByAllPlayers = result.confirmedByAllPlayers
      }
      
      // Forcer la réactivité en restructurant l'objet
      const updatedSelection = { ...selections.value[eventId] }
      selections.value[eventId] = updatedSelection
    }
    
    // Afficher un message de succès avec l'état global
    let successMessageText = `Statut de ${playerName} mis à jour : ${getStatusDisplayText(newStatus)}`
    if (result.confirmedByAllPlayers) {
      successMessageText += ' - Tous les joueurs ont confirmé ! 🎉'
    }
    
    showSuccessMessage.value = true
    successMessage.value = successMessageText
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
    

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du statut du joueur:', error)
    
    // Afficher un message d'erreur
    showErrorMessage.value = true
    errorMessage.value = 'Erreur lors de la mise à jour du statut. Veuillez réessayer.'
    setTimeout(() => {
      showErrorMessage.value = false
    }, 3000)
  }
}

// Fonction helper pour afficher le texte du statut
function getStatusDisplayText(status) {
  switch (status) {
    case 'pending':
      return 'À confirmer'
    case 'confirmed':
      return 'Confirmé'
    case 'declined':
      return 'Décliné'
    default:
      return 'Inconnu'
  }
}

// Fonction helper pour récupérer les joueurs qui ont décliné
function getDeclinedPlayers(eventId) {
  const selection = selections.value[eventId]
  if (!selection || !selection.playerStatuses) return []
  
  return Object.entries(selection.playerStatuses)
    .filter(([playerName, status]) => status === 'declined')
    .map(([playerName]) => playerName)
}

function isAvailable(player, eventId) {
  return availability.value[player]?.[eventId]
}

function isSelected(player, eventId) {
  const selected = getSelectionPlayers(eventId)
  const avail = availability.value[player]?.[eventId]
  return selected.includes(player) && avail === true
}

async function tirer(eventId, count = 6) {
  console.log('🎲 tirer appelé:', { eventId, count })
  const event = events.value.find(e => e.id === eventId)
  const requiredCount = event?.playerCount || 6
  
  console.log('📅 Événement trouvé:', { eventTitle: event?.title, requiredCount })
  
  // Récupérer la sélection actuelle
  const currentSelection = getSelectionPlayers(eventId)
  console.log('👥 Sélection actuelle:', currentSelection)
  
  // Vérifier si TOUS les joueurs de la sélection sont encore disponibles
  const allSelectedStillAvailable = currentSelection.length > 0 && 
    currentSelection.every(playerName => isAvailable(playerName, eventId))
  
  if (allSelectedStillAvailable) {
    // Cas exceptionnel : tous les joueurs sont disponibles, on refait un tirage complet
    // Nouveau tirage complet nécessaire
    
    // Exclure les joueurs qui ont décliné cette sélection
    const declinedPlayers = getDeclinedPlayers(eventId)
    const candidates = players.value.filter(p => 
      isAvailable(p.name, eventId) && !declinedPlayers.includes(p.name)
    )

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

    // Utiliser la nouvelle structure de données
    selections.value[eventId] = {
      players: tirage,
      confirmed: false,
      confirmedAt: null,
      updatedAt: new Date()
    }
  } else {
    // Logique normale : garder les joueurs disponibles et compléter
    const keepSelectedPlayers = currentSelection.filter(playerName => isAvailable(playerName, eventId))
    
    // Calculer combien de places il reste à pourvoir
    const remainingSlots = requiredCount - keepSelectedPlayers.length
    
    if (remainingSlots <= 0) {
      // Si on a déjà assez de joueurs sélectionnés et disponibles, on garde la sélection actuelle
      selections.value[eventId] = {
        players: keepSelectedPlayers,
        confirmed: false,
        confirmedAt: null,
        updatedAt: new Date()
      }
    } else {
      // Tirage pour les places manquantes
      const alreadySelected = new Set(keepSelectedPlayers)
      const declinedPlayers = getDeclinedPlayers(eventId)
      const candidates = players.value.filter(p => 
        isAvailable(p.name, eventId) && 
        !alreadySelected.has(p.name) && 
        !declinedPlayers.includes(p.name)
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
      selections.value[eventId] = {
        players: [...keepSelectedPlayers, ...newTirage],
        confirmed: false,
        confirmedAt: null,
        updatedAt: new Date()
      }
    }
  }

  console.log('💾 Sauvegarde de la sélection:', { eventId, players: selections.value[eventId].players, seasonId: seasonId.value })
  await saveSelection(eventId, selections.value[eventId].players, seasonId.value)
  
  
  updateAllStats()
  updateAllChances()
}

async function tirerProtected(eventId, count = 6) {
  console.log('🛡️ tirerProtected appelé:', { eventId, count })
  // Tirage protégé
  // État de la modal de sélection avant
  
  // Sauvegarder l'état de la popin avant le tirage
  const wasSelectionModalOpen = showSelectionModal.value
  const selectionModalEventId = selectionModalEvent.value?.id
  
  // Vérifier si c'est une reselection avant de faire le tirage
  const wasReselection = getSelectionPlayers(eventId).length > 0
  
  // Sauvegarder l'ancienne sélection pour comparer
  const oldSelection = wasReselection ? [...getSelectionPlayers(eventId)] : []
  
  console.log('🎲 Appel de tirer...')
  await tirer(eventId, count)
  
  
  // État de la modal de sélection après
  
  // S'assurer que la popin de sélection reste ouverte si elle était ouverte
  if (wasSelectionModalOpen && !showSelectionModal.value) {
    // Restauration de la popin de sélection
    showSelectionModal.value = true
    selectionModalEvent.value = events.value.find(e => e.id === selectionModalEventId)
  }
  
  // Mettre à jour les données de la popin de sélection si elle est ouverte
  if (showSelectionModal.value && selectionModalEvent.value?.id === eventId) {
    // Popin de sélection ouverte, mise à jour
    // Forcer la mise à jour des données
    await nextTick()
    
    // Afficher le message de succès dans la popin de sélection
    if (selectionModalRef.value && selectionModalRef.value.showSuccess) {
      // Appel de showSuccess sur la popin de sélection
      const newSelection = getSelectionPlayers(eventId)
      const keptPlayers = oldSelection.filter(player => newSelection.includes(player))
      const isPartialUpdate = keptPlayers.length > 0 && keptPlayers.length < oldSelection.length
      selectionModalRef.value.showSuccess(wasReselection, isPartialUpdate)
    } else {
      // showSuccess indisponible
    }
  } else {
    // Popin de sélection fermée, affichage message global
    // Afficher un message de succès global si la popin n'est pas ouverte
    showSuccessMessage.value = true
    const event = events.value.find(e => e.id === eventId)
    const selectedPlayers = getSelectionPlayers(eventId)
    
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
  return Object.keys(selections.value).filter(eventId => {
    const players = getSelectionPlayers(eventId)
    return players.includes(player)
  }).length
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
  const eventSelections = getSelectionPlayers(eventId);
  return eventSelections.length;
}

function isSelectionComplete(eventId) {
  const event = events.value.find(e => e.id === eventId)
  const required = event?.playerCount || 6
  const hasEnoughPlayers = countSelectedPlayers(eventId) >= required
  const isConfirmed = isSelectionConfirmed(eventId)
  return hasEnoughPlayers && isConfirmed
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
            successMessage.value = 'Personne supprimée avec succès !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erreur lors de la suppression du joueur')
            alert("Erreur lors de la suppression de la personne. Veuillez réessayer.")
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
  
  if (getSelectionPlayers(eventId).length > 0) {
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
    try {
      // Lancer directement la sélection (le PIN a déjà été validé)
      const event = events.value.find(e => e.id === eventIdToReselect.value)
      const count = event?.playerCount || 6
      await tirerProtected(eventIdToReselect.value, count)
    } catch (error) {
      console.error('Erreur lors de la confirmation du tirage:', error)
    } finally {
      // Toujours fermer le dialogue de confirmation, même en cas d'erreur
      confirmReselect.value = false
      eventIdToReselect.value = null
    }
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
    updateSelection: 'Mise à jour de sélection - Code PIN requis',
    resetSelection: 'Réinitialisation de sélection - Code PIN requis',
    unconfirmSelection: 'Déverrouillage de sélection - Code PIN requis'
  }
  
  return messages[pendingOperation.value.type] || 'Code PIN requis'
}

async function requirePin(operation) {
  // Vérifier si le PIN est déjà en cache pour cette saison
  if (pinSessionManager.isPinCached(seasonId.value)) {
    const cachedPin = pinSessionManager.getCachedPin(seasonId.value)
    // PIN en cache trouvé, utilisation automatique
    
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
              // PIN de saison en cache — saut de la demande de mot de passe joueur
      await executePendingOperation(operation)
      return
    }
  } catch {}

  // Vérifier si le mot de passe du joueur est déjà en cache
  if (isPlayerPasswordCached(playerId)) {
            // Mot de passe du joueur en cache trouvé, utilisation automatique
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
      // Sauvegarder le PIN en session avec état de connexion
      const isConnected = !!auth.currentUser?.email
      pinSessionManager.saveSession(seasonId.value, pinCode, isConnected)
      
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
      // Mémoriser le PIN de saison (session PIN avec état de connexion)
      const isConnected = !!auth.currentUser?.email
      try { pinSessionManager.saveSession(seasonId.value, password, isConnected) } catch {}
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
      // Mémoriser le PIN de saison (session PIN avec état de connexion)
      const isConnected = !!auth.currentUser?.email
      try { pinSessionManager.saveSession(seasonId.value, password, isConnected) } catch {}
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
          // Exécution de l'opération en attente
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
        console.log('🚀 launchSelection appelé:', { eventId: data.eventId, count: data.count })
        
        // Logger l'audit de sélection automatique
        try {
          const { default: AuditClient } = await import('../services/auditClient.js')
          const event = events.value.find(e => e.id === data.eventId)
          await AuditClient.logAutoSelectionTriggered(seasonSlug, {
            eventId: data.eventId,
            eventTitle: event?.title || 'Unknown',
            count: data.count,
            hasExistingSelection: getSelectionPlayers(data.eventId).length > 0
          })
        } catch (auditError) {
          console.warn('Erreur audit launchSelection:', auditError)
        }
        
        // Vérifier si une sélection existe déjà pour afficher la confirmation
        if (getSelectionPlayers(data.eventId).length > 0) {
          console.log('🔄 Sélection existante, affichage confirmation')
          // Afficher la modal de confirmation de relance
          eventIdToReselect.value = data.eventId
          confirmReselect.value = true
          // Fermer seulement la popin de détails, garder la popin de sélection
          showEventDetailsModal.value = false
        } else {
          console.log('🎯 Pas de sélection existante, lancement direct')
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
          const oldSelection = [...getSelectionPlayers(eventId)]
          const nextSelection = Array.isArray(players) ? players : []
          await saveSelection(eventId, nextSelection, seasonId.value)
          
          // Mettre à jour la structure locale
          if (selections.value[eventId]) {
            if (typeof selections.value[eventId] === 'object' && selections.value[eventId].players) {
              selections.value[eventId].players = nextSelection
              selections.value[eventId].updatedAt = new Date()
            } else {
              // Migration de l'ancienne structure
              selections.value[eventId] = {
                players: nextSelection,
                confirmed: false,
                confirmedAt: null,
                updatedAt: new Date()
              }
            }
          } else {
            selections.value[eventId] = {
              players: nextSelection,
              confirmed: false,
              confirmedAt: null,
              updatedAt: new Date()
            }
          }
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
      case 'unconfirmSelection':
        // Déverrouiller une sélection confirmée (admin uniquement)
        {
          const { eventId } = data
          try {
            const { unconfirmSelection, loadSelections } = await import('../services/storage.js')
            await unconfirmSelection(eventId, seasonId.value)
            
            // Recharger les sélections depuis Firestore pour avoir les données à jour
            const newSelections = await loadSelections(seasonId.value)
            selections.value = newSelections
            
            showSuccessMessage.value = true
            successMessage.value = 'Sélection déverrouillée !'
            setTimeout(() => {
              showSuccessMessage.value = false
            }, 3000)
          } catch (error) {
            console.error('Erreur lors du déverrouillage de la sélection:', error)
            showSuccessMessage.value = true
            successMessage.value = 'Erreur lors du déverrouillage de la sélection'
            setTimeout(() => {
              showSuccessMessage.value = false
            }, 3000)
          }
        }
        break
      case 'resetSelection':
        // Réinitialiser complètement une sélection (admin uniquement)
        {
          const { eventId } = data
          try {
            const { deleteSelection, loadSelections } = await import('../services/storage.js')
            await deleteSelection(eventId, seasonId.value)
            
            // Logger l'audit de réinitialisation
            try {
              const { default: AuditClient } = await import('../services/auditClient.js')
              const event = events.value.find(e => e.id === eventId)
              if (event) {
                await AuditClient.logEventReset(event.title, props.slug, {
                  eventId: eventId,
                  action: 'reset_selection',
                  timestamp: new Date().toISOString()
                })
              }
            } catch (auditError) {
              console.warn('Erreur audit resetSelection:', auditError)
            }
            
            // Recharger les sélections depuis Firestore pour avoir les données à jour
            const newSelections = await loadSelections(seasonId.value)
            selections.value = newSelections
            
            showSuccessMessage.value = true
            successMessage.value = 'Sélection réinitialisée ! Le statut est maintenant "Nouveau"'
            setTimeout(() => {
              showSuccessMessage.value = false
            }, 3000)
          } catch (error) {
            console.error('Erreur lors de la réinitialisation de la sélection:', error)
            showSuccessMessage.value = true
            successMessage.value = 'Erreur lors de la réinitialisation de la sélection'
            setTimeout(() => {
              showSuccessMessage.value = false
            }, 3000)
          }
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

function refreshSeason() {
  window.location.href = `/season/${props.slug}`
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

  // 1. Mettre à jour l'URL pour refléter l'état de navigation
  const newUrl = `/season/${props.slug}?event=${event.id}&modal=event_details`
  router.push(newUrl)

  // 2. Tracker l'état de navigation (pas l'interaction modale)
  try {
    const userId = getCurrentUserId()
    if (userId) {
      await trackPageVisit(userId, newUrl, {
        seasonSlug: props.slug,
        eventId: event.id,
        eventTitle: event.title,
        navigationType: 'event_details',
        context: {
          currentPage: newUrl,
          timestamp: new Date().toISOString()
        }
              })
      }
    } catch (error) {
      // Log silencieux pour les erreurs de tracking non critiques
      if (error.code !== 'permission-denied') {
        logger.error('Erreur lors du tracking de l\'état de navigation:', error)
      }
    }

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
  
  // Mettre à jour l'état de surveillance de l'événement
  nextTick(() => {
    updateEventMonitoredState()
  })
}

function closeEventDetails() {
  showEventDetailsModal.value = false;
  selectedEvent.value = null;
  editingDescription.value = '';
  showEventMoreActions.value = false;
  showEventMoreActionsDesktop.value = false;
  
  // Fermer les menus d'agenda
  closeCalendarMenuDetails();
  
  // Nettoyer les styles des dropdowns
  eventMoreActionsStyle.value = { position: 'fixed', top: '0px', left: '0px' };
  eventMoreActionsMobileStyle.value = { position: 'fixed', top: '0px', left: '0px' };
}

// Fonction pour ajouter un événement à l'agenda
function handleAddToCalendar(type, event = null) {
  const targetEvent = event || selectedEvent.value
  if (!targetEvent) return
  
  try {
    addToCalendar(type, targetEvent, seasonName.value)
    
    // Afficher un message de succès
    showSuccessMessage.value = true
    if (type === 'ics') {
      successMessage.value = 'Fichier .ics téléchargé ! Importez-le dans votre agenda'
    } else if (type === 'google') {
      successMessage.value = 'Google Calendar ouvert dans un nouvel onglet'
    } else if (type === 'outlook') {
      successMessage.value = 'Outlook ouvert dans un nouvel onglet'
    }
    
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    console.error('Erreur lors de l\'ajout au calendrier:', error)
    showSuccessMessage.value = true
    successMessage.value = 'Erreur lors de l\'ajout au calendrier'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  }
}

function closeEventDetailsAndUpdateUrl() {
  // Fermer la popup
  closeEventDetails();
  
  // Forcer la mise à jour de l'URL pour revenir à la vue d'ensemble de la saison
  const baseUrl = `/season/${props.slug}`
  router.push(baseUrl)
  
  // Tracker le retour à la vue d'ensemble
  try {
    const userId = getCurrentUserId()
    if (userId) {
      trackPageVisit(userId, baseUrl, {
        seasonSlug: props.slug,
        navigationType: 'season_overview',
        context: {
          previousPage: route.path,
          timestamp: new Date().toISOString()
        }
      })
    }
  } catch (error) {
    // Log silencieux pour les erreurs de tracking non critiques
    if (error.code !== 'permission-denied') {
      logger.error('Erreur lors du tracking du retour à la vue d\'ensemble:', error)
    }
  }
}

// Fonction pour gérer le toggle des disponibilités depuis la popup de détails
async function handleAvailabilityToggle(playerName, eventId) {
  // Gestion du toggle de disponibilité
  
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
  
  // Vérifier si le joueur est protégé (utiliser la même logique que la grille)
  const isProtected = isPlayerProtectedInGrid(player.id);
  
  if (isProtected) {
    // Joueur protégé : vérifier s'il y a une session active
    const hasCachedPassword = isPlayerPasswordCached(player.id);
    const hasCachedPin = pinSessionManager.isPinCached(seasonId.value);
    
    if (hasCachedPassword || hasCachedPin) {
      // Session active ou PIN de saison en cache, procéder au toggle
      await performToggleAvailability(player, eventId);
      
      // Pour les joueurs protégés, ne pas afficher de popup de connexion
      return;
    } else {
      // Pas de session, demander le mot de passe
      pendingAvailabilityAction.value = { playerName, eventId };
      passwordVerificationPlayer.value = player;
      showPasswordVerification.value = true;
      return; // Attendre la vérification
    }
  } else {
    // Joueur non protégé, procéder directement
    await performToggleAvailability(player, eventId);
    

  }
}

// Fonction pour vérifier si un joueur est sélectionné pour un événement spécifique
function isPlayerSelected(playerName, eventId) {
  const selected = getSelectionPlayers(eventId);
  return selected.includes(playerName);
}

// Fonction pour gérer la vérification de mot de passe réussie
async function handlePasswordVerified(verificationData) {
        // Mot de passe vérifié
  
  // Marquer le joueur comme récemment vérifié pour éviter la boucle
  if (passwordVerificationPlayer.value) {
    recentlyVerifiedPlayer.value = passwordVerificationPlayer.value.id;
    // Joueur marqué comme récemment vérifié
  }
  
  // Procéder à l'action de disponibilité en attente
  if (pendingAvailabilityAction.value) {
    const { playerName, eventId } = pendingAvailabilityAction.value;
    // Exécution de l'action en attente
    
    // Procéder au toggle de disponibilité
    const player = players.value.find(p => p.name === playerName);
    if (player) {
      await performToggleAvailability(player, eventId);
    }
    
    // Réinitialiser l'action en attente
    pendingAvailabilityAction.value = null;
  } else {
    // Aucune action en attente trouvée
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
    
    // Logger l'audit
    try {
      const { default: AuditClient } = await import('../services/auditClient.js')
      if (newArchivedState) {
        await AuditClient.logEventArchived(selectedEvent.value.title, props.slug, {
          eventId: selectedEvent.value.id,
          action: 'archive',
          timestamp: new Date().toISOString()
        })
      } else {
        await AuditClient.logEventUnarchived(selectedEvent.value.title, props.slug, {
          eventId: selectedEvent.value.id,
          action: 'unarchive',
          timestamp: new Date().toISOString()
        })
      }
    } catch (auditError) {
      console.warn('Erreur audit toggleEventArchived:', auditError)
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

  // 1. Mettre à jour l'URL pour refléter l'état de navigation
  const newUrl = `/season/${props.slug}?player=${player.id}&modal=player_details`
  router.push(newUrl)

  // 2. Tracker l'état de navigation (pas l'interaction modale)
  try {
    const userId = getCurrentUserId()
    if (userId) {
      trackPageVisit(userId, newUrl, {
        seasonSlug: props.slug,
        playerId: player.id,
        playerName: player.name,
        navigationType: 'player_details',
        context: {
          currentPage: newUrl,
          timestamp: new Date().toISOString()
        }
      })
    }
  } catch (error) {
    // Log silencieux pour les erreurs de tracking non critiques
    if (error.code !== 'permission-denied') {
      logger.error('Erreur lors du tracking de l\'état de navigation joueur:', error)
    }
  }

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
  
  // Retourner à l'URL de base de la saison
  const baseUrl = `/season/${props.slug}`
  if (route.path !== baseUrl) {
    router.push(baseUrl)
    
    // Tracker le retour à la vue d'ensemble
    try {
      const userId = getCurrentUserId()
      if (userId) {
        trackPageVisit(userId, baseUrl, {
          seasonSlug: props.slug,
          navigationType: 'season_overview',
          context: {
            previousPage: route.path,
            timestamp: new Date().toISOString()
          }
        })
      }
    } catch (error) {
      // Log silencieux pour les erreurs de tracking non critiques
      if (error.code !== 'permission-denied') {
        logger.error('Erreur lors du tracking du retour à la vue d\'ensemble:', error)
      }
    }
  }
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
    const [newPlayers, newAvailability, newSelections] = await Promise.all([
      loadPlayers(seasonId.value),
      loadAvailability(players.value, events.value, seasonId.value),
      loadSelections(seasonId.value)
    ]);
    
    players.value = newPlayers;
    availability.value = newAvailability;
    selections.value = newSelections;
    
    // Recharger l'état de protection des joueurs
    loadProtectedPlayers()
    
    // Recharger les favoris si l'utilisateur est connecté
    if (currentUser.value?.email) {
      console.log('🔄 Rechargement des favoris dans handlePlayerRefresh...')
      await updatePreferredPlayersSet()
      console.log('✅ Favoris rechargés dans handlePlayerRefresh')
    }
    
    // Mettre à jour le selectedPlayer dans le modal
    if (selectedPlayer.value) {
      const updatedPlayer = newPlayers.find(p => p.id === selectedPlayer.value.id);
      if (updatedPlayer) {
        selectedPlayer.value = updatedPlayer;
      }
    }
    
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
  const selectedPlayers = getSelectionPlayers(eventId)
  const event = events.value.find(e => e.id === eventId)
  const requiredCount = event?.playerCount || 6
  const availableCount = countAvailablePlayers(eventId)
  const isConfirmedByOrganizer = isSelectionConfirmedByOrganizer(eventId)
  const isConfirmedByAllPlayers = isSelectionConfirmed(eventId)
  
  // Cas 0: Aucune sélection → afficher "Nouveau" (prioritaire)
  if (selectedPlayers.length === 0) {
    return {
      type: 'ready',
      availableCount,
      requiredCount,
      isConfirmedByOrganizer: false,
      isConfirmedByAllPlayers: false
    }
  }

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
        requiredCount,
        isConfirmedByOrganizer,
        isConfirmedByAllPlayers
      }
    }
  }
  
  // Cas 2: Pas assez de joueurs pour faire une sélection (si une sélection existe)
  if (availableCount < requiredCount) {
    return {
      type: 'insufficient',
      availableCount,
      requiredCount,
      isConfirmedByOrganizer: false,
      isConfirmedByAllPlayers: false
    }
  }
  
  // Cas 4: Sélection confirmée par l'organisateur ET par tous les joueurs
  if (isConfirmedByAllPlayers) {
    return {
      type: 'confirmed',
      availableCount,
      requiredCount,
      isConfirmedByOrganizer,
      isConfirmedByAllPlayers
    }
  }
  
  // Cas 5: Sélection confirmée par l'organisateur mais pas encore par tous les joueurs
  if (isConfirmedByOrganizer) {
    return {
      type: 'pending_confirmation',
      availableCount,
      requiredCount,
      isConfirmedByOrganizer,
      isConfirmedByAllPlayers
    }
  }
  
  // Cas 6: Sélection complète mais non confirmée par l'organisateur
  return {
    type: 'complete',
    availableCount,
    requiredCount,
    isConfirmedByOrganizer,
    isConfirmedByAllPlayers
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
      return `Sélection complète : ${status.availableCount} joueurs disponibles (non confirmée)`
    case 'pending_confirmation':
      return `Sélection à confirmer : ${status.availableCount} joueurs disponibles (en attente de confirmation des joueurs)`
    case 'confirmed':
      return `Sélection confirmée : ${status.availableCount} joueurs disponibles (tous ont confirmé)`
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
  let success = false
  try {
    if (reason === 'selection') {
      // Vérifier que l'organisateur a validé la sélection avant d'envoyer les notifications
      if (!isSelectionConfirmedByOrganizer(eventId)) {
        showSuccessMessage.value = true
        successMessage.value = 'Impossible d\'envoyer les notifications : la sélection n\'est pas encore validée par l\'organisateur'
        setTimeout(() => { showSuccessMessage.value = false }, 3000)
        isSendingNotifications.value = false
        return
      }
      
      if (scope === 'single' && recipient?.email) {
        // Envoi ciblé pour un joueur sélectionné
        await sendSelectionNotificationsForEvent({
          eventId,
          eventData,
          selectedPlayers: [recipient.name],
          seasonId: seasonId.value,
          seasonSlug: seasonSlug,
          players: enrichedPlayers.value,
          isConfirmedTeam: isSelectionConfirmed(eventId)
        })
      } else {
        // Batch pour tous les sélectionnés
        await sendSelectionNotificationsForEvent({ 
          eventId, 
          eventData, 
          selectedPlayers,
          seasonId: seasonId.value,
          seasonSlug: seasonSlug,
          players: enrichedPlayers.value,
          isConfirmedTeam: isSelectionConfirmed(eventId)
        })
      }
      
      success = true
      showSuccessMessage.value = true
      const isConfirmedTeam = isSelectionConfirmed(eventId)
      successMessage.value = scope === 'single'
        ? `Notification envoyée à ${recipient?.name || '1 joueur'}`
        : isConfirmedTeam 
          ? 'Notifications d\'équipe confirmée envoyées à tous les joueurs !'
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
      
      success = true
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
  } finally {
    isSendingNotifications.value = false
    // Fermer automatiquement la modale après un envoi réussi
    if (success) {
      setTimeout(() => {
        closeEventAnnounceModal()
      }, 1000) // Délai pour laisser le temps de voir le message de succès
    }
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

// Fonction helper pour extraire les joueurs d'une sélection
function getSelectionPlayers(eventId) {
  const selection = selections.value[eventId]
  
  if (!selection) {
    return []
  }
  
  // Si c'est la nouvelle structure avec confirmed
  if (selection.players && Array.isArray(selection.players)) {
    return selection.players
  }
  
  // Si c'est l'ancienne structure (array direct)
  if (Array.isArray(selection)) {
    return selection
  }
  
  return []
}

// Fonction helper pour vérifier si une sélection est confirmée
function isSelectionConfirmed(eventId) {
  const selection = selections.value[eventId]
  if (!selection) return false
  
  // Si c'est la nouvelle structure avec confirmedByAllPlayers
  if (typeof selection.confirmedByAllPlayers === 'boolean') {
    // Utiliser le champ pré-calculé pour de meilleures performances
    return selection.confirmedByAllPlayers
  }
  
  // Fallback pour l'ancienne structure ou si confirmedByAllPlayers n'existe pas
  if (typeof selection.confirmed === 'boolean' && selection.confirmed && selection.playerStatuses && selection.players) {
    // Vérifier que tous les joueurs ont le statut 'confirmed'
    const allPlayersConfirmed = selection.players.every(playerName => 
      selection.playerStatuses[playerName] === 'confirmed'
    )
    return allPlayersConfirmed
  }
  
  // Si c'est l'ancienne structure, considérer comme non confirmée
  return false
}

// Fonction helper pour vérifier si l'organisateur a confirmé la sélection (sans vérifier les confirmations individuelles)
function isSelectionConfirmedByOrganizer(eventId) {
  const selection = selections.value[eventId]
  if (!selection) return false
  
  // Si c'est la nouvelle structure avec confirmed
  if (typeof selection.confirmed === 'boolean') {
    return selection.confirmed
  }
  
  // Si c'est l'ancienne structure, considérer comme non confirmée
  return false
}

// Fonction helper pour obtenir le statut individuel d'un joueur dans une sélection
function getPlayerSelectionStatus(playerName, eventId) {
  const selection = selections.value[eventId]
  
  if (!selection) {
    return 'pending'
  }
  
  // Si c'est la nouvelle structure avec playerStatuses
  if (selection.playerStatuses && selection.playerStatuses[playerName]) {
    return selection.playerStatuses[playerName]
  }
  
  // Si c'est l'ancienne structure ou pas de statut, retourner 'pending'
  return 'pending'
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

async function handlePerfectFromModal() {
  closeSelectionModal()
  showSuccessMessage.value = true
  successMessage.value = 'Sélection validée !'
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

async function handleConfirmSelectionFromModal() {
  if (!selectionModalEvent.value) return
  
  const eventId = selectionModalEvent.value.id
  
  try {
    // Confirmer la sélection
    const { confirmSelection } = await import('../services/storage.js')
    await confirmSelection(eventId, seasonId.value)
    
    // Logger l'audit de validation de sélection
    try {
      const { default: AuditClient } = await import('../services/auditClient.js')
      const event = events.value.find(e => e.id === eventId)
      const selectedPlayers = getSelectionPlayers(eventId)
      await AuditClient.logSelectionValidated(seasonSlug, {
        eventId,
        eventTitle: event?.title || 'Unknown',
        selectedPlayers,
        playerCount: selectedPlayers.length
      })
    } catch (auditError) {
      console.warn('Erreur audit confirmSelection:', auditError)
    }
    
    // Mettre à jour la structure locale
    if (selections.value[eventId]) {
      if (typeof selections.value[eventId] === 'object' && selections.value[eventId].players) {
        selections.value[eventId].confirmed = true
        selections.value[eventId].confirmedAt = new Date()
      } else {
        // Migration de l'ancienne structure
        const players = Array.isArray(selections.value[eventId]) ? selections.value[eventId] : []
        selections.value[eventId] = {
          players,
          confirmed: true,
          confirmedAt: new Date(),
          updatedAt: new Date()
        }
      }
    }
    
    // Ne pas fermer la modale, la laisser ouverte pour afficher les nouveaux boutons
    // closeSelectionModal()
    
    // Afficher un message de succès
    showSuccessMessage.value = true
    successMessage.value = 'Sélection validée !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    console.error('Erreur lors de la confirmation de la sélection:', error)
    showSuccessMessage.value = true
    successMessage.value = 'Erreur lors de la confirmation de la sélection'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  }
}

async function handleUnconfirmSelectionFromModal() {
  if (!selectionModalEvent.value) return
  
  const eventId = selectionModalEvent.value.id
  
  try {
    // Demander le PIN code avant de déverrouiller la sélection
    await requirePin({
      type: 'unconfirmSelection',
      data: { eventId }
    })
  } catch (error) {
    console.error('Erreur lors de la demande de déverrouillage:', error)
  }
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

// Fonction pour vérifier si un événement est surveillé par l'utilisateur actuel
async function isEventMonitored(eventId) {
  if (!eventId) return false
  
  try {
    // Utiliser l'état d'authentification réactif du composant
    if (!currentUser.value?.email) return false
    
    // Récupérer les préférences de notification depuis Firestore
    const { db } = await import('../services/firebase.js')
    const { doc, getDoc } = await import('firebase/firestore')
    
    const userPrefsDoc = await getDoc(doc(db, 'userPreferences', currentUser.value.email))
    
    if (userPrefsDoc.exists()) {
      const prefs = userPrefsDoc.data()
      
      // Vérifier les notifications email (préférences uniquement)
      const hasEmailNotifications = (
        prefs.notifyAvailability === true || prefs.notifySelection === true
      )
      
      // Vérifier les notifications push (préférences + FCM token)
      const hasPushNotifications = (
        (prefs.notifyAvailabilityPush === true || prefs.notifySelectionPush === true) &&
        !!localStorage.getItem('fcmToken') // FCM token requis pour le canal push
      )
      
      // Retourner true si au moins un canal est activé
      return hasEmailNotifications || hasPushNotifications
    }
    
    // Pas de préférences trouvées
    return false
  } catch (error) {
    console.error('Erreur lors de la vérification de surveillance:', error)
    return false
  }
}

// Fonction pour inciter à activer les notifications depuis l'entête de l'événement
function promptForNotifications(event) {
  if (!event) return
  
  // Préparer les données pour la modal d'incitation
  notificationPromptData.value = {
    playerName: 'Vous', // Utilisateur générique
    eventTitle: event.title || 'ce spectacle',
    seasonId: seasonId.value,
    seasonSlug: props.slug,
    eventId: event.id
  }
  
  // Afficher la modal d'incitation avec un délai pour éviter les conflits visuels
  setTimeout(() => {
    showNotificationPrompt.value = true
  }, 500); // Délai court pour l'entête d'événement
}

// Fonction pour gérer le succès de l'incitation aux notifications
async function handleNotificationPromptSuccess(data) {
  showNotificationPrompt.value = false
  notificationPromptData.value = null
  
  // Logger l'audit de notification
  try {
    const { default: AuditClient } = await import('../services/auditClient.js')
    await AuditClient.logNotificationAction('sent', data.playerName, data.eventTitle, props.slug, {
      eventId: data.eventId,
      email: data.email,
      directActivation: data.directActivation
    })
  } catch (auditError) {
    console.warn('Erreur audit notification:', auditError)
  }
  
  // Afficher un message de succès adapté au type d'activation
  showSuccessMessage.value = true
  if (data.directActivation) {
    successMessage.value = `Notifications activées directement pour ${data.playerName} !`
  } else {
    successMessage.value = `Email envoyé à ${data.email} pour activer les notifications !`
  }
  
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 4000)
  
  logger.info('Activation des notifications terminée avec succès', data)
}

// Fonction pour gérer la demande d'affichage du popup de connexion
function handleShowLogin(data) {
  showNotificationPrompt.value = false
  notificationPromptData.value = null
  
  // Stocker les données de notification dans localStorage pour les récupérer après connexion
  localStorage.setItem('pendingNotificationData', JSON.stringify({
    email: data.email,
    playerName: data.playerName,
    eventId: data.eventId,
    seasonId: data.seasonId,
    seasonSlug: data.seasonSlug,
    eventTitle: data.eventTitle
  }))
  
  // Pré-remplir l'email dans la modal de connexion
  if (data.email) {
    localStorage.setItem('prefilledEmail', data.email)
  }
  
  // Afficher la modal de connexion
  showAccountLogin.value = true
  
  logger.info('Affichage du popup de connexion pour utilisateur existant', data)
}

// Fonction pour gérer le succès de la connexion
async function handleAccountLoginSuccess(data) {
  showAccountLogin.value = false
  
  // Vérifier s'il y a des données de notification en attente
  const pendingNotificationData = localStorage.getItem('pendingNotificationData')
  
  if (data.action === 'login_success' && pendingNotificationData) {
    console.log('🎯 Connexion réussie, activation des notifications...')
    
    try {
      // Récupérer les données de notification depuis localStorage
      const notificationData = JSON.parse(pendingNotificationData)
      
      // Activer les notifications pour l'utilisateur connecté
      const { activateNotificationsForConnectedUser } = await import('../services/notificationActivation.js')
      const result = await activateNotificationsForConnectedUser({
        seasonId: notificationData.seasonId,
        eventId: notificationData.eventId,
        playerName: notificationData.playerName,
        email: data.email,
        eventTitle: notificationData.eventTitle,
        seasonSlug: notificationData.seasonSlug
      })
      
  
      
      // Afficher le toast de succès
      showSuccessMessage.value = true
      successMessage.value = `Notifications activées avec succès pour ${notificationData.playerName} !`
      setTimeout(() => {
        showSuccessMessage.value = false
      }, 4000)
      
      // Nettoyer localStorage
      localStorage.removeItem('pendingNotificationData')
      
      logger.info('Notifications activées avec succès après connexion', result)
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'activation des notifications après connexion:', error)
      
      // Afficher un message d'erreur
      showErrorMessage.value = true
      errorMessage.value = 'Erreur lors de l\'activation des notifications. Veuillez réessayer.'
      setTimeout(() => {
        showErrorMessage.value = false
      }, 5000)
      
      // Nettoyer localStorage même en cas d'erreur
      localStorage.removeItem('pendingNotificationData')
    }
  } else {
    // Connexion normale, afficher le menu du compte
    console.log('🔐 Connexion normale, affichage du menu du compte')
    showAccountMenu.value = true
  }
}

// Fonction pour gérer la mise à jour de la protection des saisies
function handlePlayerClaimUpdate(data) {
  showPlayerClaim.value = false
  playerClaimData.value = null
  
  // Afficher un message de succès
  showSuccessMessage.value = true
  if (data?.action === 'protection_activated') {
    successMessage.value = 'Protection activée et compte connecté !'
    logger.info('Protection activée et utilisateur connecté automatiquement', data)
  } else {
    successMessage.value = 'Protection activée avec succès !'
    logger.info('Protection des saisies activée avec succès', data)
  }
  
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 4000)
}

// end of script setup
</script>
