<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <!-- Header de saison partagé -->
    <SeasonHeader 
      :season-name="seasonName"
      :is-scrolled="isScrolled"
      :season-slug="props.slug"
      :is-connected="!!currentUser?.email"
      :show-view-toggle="showViewToggle"
      :current-view-mode="currentViewMode"
      @go-back="goBack"
      @open-account-menu="openAccountMenu"
      @open-help="() => {}"
      @open-preferences="openPreferences"
      @open-players="openPlayers"
      @logout="handleAccountLogoutDevice"
      @open-login="openAccount"
      @open-account="openAccount"
      @open-account-creation="openAccountCreation"
      @open-development="openDevelopment"
      @toggle-view-mode="toggleViewMode"
    />

    <!-- Vue grille (classique ou inversée) -->
    <div class="w-full px-0 md:px-0 pb-0 pt-[64px] md:pt-[80px] -mt-[64px] md:-mt-[80px] bg-gray-900">
      <!-- Sticky header bar outside horizontal scroller (sync with scrollLeft) -->
      <div ref="headerBarRef" class="sticky top-0 z-[100] overflow-hidden bg-gray-900/80 backdrop-blur-sm">
        <div class="flex items-stretch relative">
          <!-- Left sticky cell (masqué pendant l'étape 1 pour éviter le doublon avec l'onboarding) -->
          <div v-if="(events.length === 0 && players.length === 0) ? false : true" class="col-left flex-shrink-0 p-3 md:p-4 sticky left-0 z-[101] bg-gray-900 h-full">
            <div class="flex flex-col items-center justify-between h-full gap-3">
              <!-- Bouton ajouter événement -->
              <button
                @click="openNewEventForm"
                class="flex items-center space-x-2 px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base font-medium"
                title="Ajouter un nouvel événement"
              >
                <span class="text-lg">➕</span>
                <span class="hidden sm:inline">Ajouter un événement</span>
                <span class="sm:hidden">Événement</span>
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
          <!-- Headers (événements en mode normal, joueurs en mode inversé) -->
          <div class="flex-1 overflow-hidden">
            <div ref="headerEventsRef" class="flex relative z-[60] bg-transparent" :style="{ transform: `translateX(-${headerScrollX}px)` }">
              <div
                v-for="(headerItem, index) in displayColumns"
                :key="'h-'+headerItem.id"
                :data-event-id="currentViewMode === 'normal' ? headerItem.id : undefined"
                :data-player-id="currentViewMode === 'inverted' ? headerItem.id : undefined"
                class="col-event flex-shrink-0 p-3 text-center flex flex-col justify-between bg-transparent"
                :class="{ 
                  'archived-header': currentViewMode === 'normal' && headerItem.archived,
                  'preferred-player-header': currentViewMode === 'inverted' && preferredPlayerIdsSet.has(headerItem.id)
                }"
              >
                <!-- Mode normal : affichage des événements -->
                <div v-if="currentViewMode === 'normal'">
                  <!-- Zone cliquable complète (titre + date + type) -->
                  <div 
                    class="flex flex-col items-center justify-between p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 cursor-pointer group h-24 w-full"
                    :title="headerItem.title + ' - Cliquez pour voir les détails'"
                    @click.stop="showEventDetails(headerItem)"
                  >
                    <div class="flex flex-col items-center flex-1 justify-center w-full">
                      <!-- Ligne 1 : Titre du spectacle -->
                      <div class="header-title text-[22px] md:text-2xl leading-snug text-white text-center clamp-2 group-hover:text-purple-300 transition-colors duration-200 mb-1">
                        {{ headerItem.title || 'Sans titre' }}
                      </div>
                      
                      <!-- Ligne 2 : Date du spectacle -->
                      <div class="header-date text-[16px] md:text-base text-gray-300 group-hover:text-purple-200 transition-colors duration-200 px-2 py-1 rounded" 
                           :title="formatDateFull(headerItem.date)">
                        {{ formatDate(headerItem.date) }}
                      </div>
                    </div>
                    
                    <!-- Section basse : badge de type d'événement -->
                    <div class="flex flex-col items-center mt-2">
                      <!-- Indicateur de statut archivé (priorité sur les autres) -->
                      <div 
                        v-if="headerItem.archived"
                        class="px-2 py-1 bg-gray-500/20 border border-gray-400/30 rounded-md mx-auto flex items-center justify-center"
                        title="Événement archivé"
                      >
                        <span class="text-xs text-gray-300 font-medium">📁</span>
                        <span class="text-xs text-gray-200 font-medium ml-1">Archivé</span>
                      </div>
                      
                      <!-- Badge de type d'événement (seulement si pas archivé) -->
                      <div 
                        v-else-if="headerItem.roles"
                        class="px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded-md mx-auto flex items-center justify-center"
                        :title="getEventTypeName(headerItem)"
                      >
                        <span class="text-xs text-gray-300 font-medium">{{ getEventTypeIcon(headerItem) }}</span>
                        <span class="text-xs text-gray-200 font-medium ml-1">{{ getEventTypeName(headerItem) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Mode inversé : affichage des joueurs -->
                <div v-else>
                  <!-- Zone cliquable complète (avatar + nom + badges) -->
                  <div 
                    class="flex flex-col items-center justify-between p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 cursor-pointer group h-24 w-full"
                    :title="headerItem.name + ' - Cliquez pour voir les détails'"
                    @click.stop="showPlayerDetails(headerItem)"
                  >
                    <div class="flex flex-col items-center flex-1 justify-center w-full">
                      <!-- Avatar sur la première ligne -->
                      <div class="mb-2">
                        <PlayerAvatar 
                          :player-id="headerItem.id"
                          :season-id="seasonId"
                          :player-name="headerItem.name"
                          :player-gender="headerItem.gender || 'non-specified'"
                          size="sm"
                        />
                      </div>
                      <!-- Nom sur la deuxième ligne -->
                      <div class="header-title text-[22px] md:text-2xl leading-snug text-white text-center clamp-2 group-hover:text-purple-300 transition-colors duration-200">
                        {{ headerItem.name }}
                      </div>
                    </div>
                    
                    <!-- Section basse : badges de statut du joueur -->
                    <div class="flex flex-col items-center mt-2">
                      <!-- Badge joueur favori -->
                      <div 
                        v-if="preferredPlayerIdsSet.has(headerItem.id)"
                        class="px-2 py-1 bg-yellow-500/20 border border-yellow-400/30 rounded-md mx-auto flex items-center justify-center"
                        title="Ma personne"
                      >
                        <span class="text-xs text-yellow-300 font-medium">⭐</span>
                        <span class="text-xs text-yellow-200 font-medium ml-1">Moi</span>
                      </div>
                      
                      <!-- Badge joueur protégé -->
                      <div 
                        v-else-if="isPlayerProtectedInGrid(headerItem.id)"
                        class="px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded-md mx-auto flex items-center justify-center"
                        title="Personne protégée par mot de passe"
                      >
                        <span class="text-xs text-gray-300 font-medium">🔒</span>
                        <span class="text-xs text-gray-200 font-medium ml-1">Protégé</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Right spacer (keeps end alignment) -->
          <div class="col-right flex-shrink-0 p-3 sticky right-0 z-[101] h-full"></div>

          <!-- Toggle archived events (top-right, above right chevron) -->
          <div class="absolute right-2 top-2 z-[150] hidden md:block">
            <!-- Bouton de filtres -->
            <button
              @click="toggleFiltersDropdown"
              data-filters-button
              class="w-9 h-9 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all duration-200 relative"
              :class="{ 'bg-white/20 border-white/40': showFiltersDropdown }"
              title="Filtres d'affichage"
              aria-label="Filtres d'affichage"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"/>
              </svg>
              
              <!-- Indicateur de filtres actifs -->
              <div
                v-if="showArchived || showPast"
                class="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-gray-900"
              ></div>
            </button>
          </div>

          <!-- Dropdown des filtres (positionnement simple) -->
          <div
            v-if="showFiltersDropdown"
            data-filters-dropdown
            class="absolute top-12 right-0 w-48 bg-gray-900 border border-white/20 rounded-xl shadow-2xl z-[1200] overflow-hidden"
          >
              <div class="p-3 border-b border-white/10">
                <h3 class="text-sm font-medium text-white mb-2">Filtres d'affichage</h3>
              </div>
              
              <!-- Option Archivés -->
              <label class="flex items-center px-3 py-2 hover:bg-white/10 cursor-pointer transition-colors duration-150">
                <input
                  v-model="showArchived"
                  type="checkbox"
                  class="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                >
                <span class="ml-3 text-sm text-white">Archivés</span>
                <span class="ml-auto text-xs text-gray-400">📁</span>
              </label>
              
              <!-- Option Passés -->
              <label class="flex items-center px-3 py-2 hover:bg-white/10 cursor-pointer transition-colors duration-150">
                <input
                  v-model="showPast"
                  type="checkbox"
                  class="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                >
                <span class="ml-3 text-sm text-white">Passés</span>
                <span class="ml-auto text-xs text-gray-400">📅</span>
              </label>
          </div>

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
            class="absolute left-2 bottom-2 w-9 h-9 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-[110] backdrop-blur-sm"
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
            class="absolute right-2 bottom-2 w-9 h-9 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-[110] backdrop-blur-sm"
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
            class="fixed z-[600]"
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
            class="fixed z-[600]"
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
            class="fixed z-[600]"
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
            <col v-for="(item, index) in displayColumns" :key="'c'+index" class="col-event" />
            <col class="col-right" />
          </colgroup>
          <thead class="hidden"></thead>
          <tbody>
            <tr
              v-for="(rowItem, index) in displayRows"
              :key="currentViewMode === 'inverted' ? rowItem.id : rowItem.id"
              class="border-b border-white/10 hover:bg-white/5 transition-all duration-200"
              :data-player-id="currentViewMode === 'normal' ? rowItem.id : undefined"
              :data-event-id="currentViewMode === 'inverted' ? rowItem.id : undefined"
              :class="{ 
                'highlighted-player': currentViewMode === 'normal' && rowItem.id === highlightedPlayer, 
                'preferred-player': currentViewMode === 'normal' && preferredPlayerIdsSet.has(rowItem.id) 
              }"
            >
              <td class="px-0 py-4 md:py-5 font-medium text-white relative group text-xl md:text-2xl sticky left-0 z-40 bg-gray-900 left-col-td">
                <div class="px-4 md:px-5 font-bold text-xl md:text-2xl flex items-center w-full min-w-0">
                  <!-- Mode normal : affichage des joueurs -->
                  <div 
                    v-if="currentViewMode === 'normal'"
                    @click="showPlayerDetails(rowItem)" 
                    class="player-name hover:bg-white/10 rounded-lg p-2 cursor-pointer transition-colors duration-200 text-[22px] md:text-2xl leading-tight block truncate max-w-full flex-1 min-w-0 group"
                    :class="{ 'inline-block rounded px-1 ring-2 ring-yellow-400 animate-pulse': playerTourStep === 3 && rowItem.id === (guidedPlayerId || (sortedPlayers[0]?.id)) }"
                    :title="'Cliquez pour voir les détails : ' + rowItem.name"
                  >
                    <div class="flex items-center gap-2">
                      <div class="relative">
                        <PlayerAvatar 
                          :player-id="rowItem.id"
                          :season-id="seasonId"
                          :player-name="rowItem.name"
                          :player-gender="rowItem.gender || 'non-specified'"
                          size="sm"
                        />
                        <!-- Superposed status icons -->
                        <span 
                          v-if="preferredPlayerIdsSet.has(rowItem.id)"
                          class="absolute -top-1 -right-1 text-yellow-400 text-xs bg-gray-900 rounded-full w-4 h-4 flex items-center justify-center border border-gray-700"
                          title="Ma personne"
                        >
                          ⭐
                        </span>
                        <span 
                          v-else-if="isPlayerProtectedInGrid(rowItem.id)"
                          class="absolute -top-1 -right-1 text-yellow-400 text-xs bg-gray-900 rounded-full w-4 h-4 flex items-center justify-center border border-gray-700"
                          :title="preferredPlayerIdsSet.has(rowItem.id) ? 'Ma personne protégée' : 'Personne protégée par mot de passe'"
                        >
                          🔒
                        </span>
                      </div>
                      <span class="group-hover:text-purple-300 transition-colors duration-200 flex-1 min-w-0 truncate">{{ rowItem.name }}</span>
                    </div>
                  </div>
                  
                  <!-- Mode inversé : affichage des événements -->
                  <div 
                    v-else
                    @click.stop="showEventDetails(rowItem)" 
                    class="event-name hover:bg-white/10 rounded-lg p-2 cursor-pointer transition-colors duration-200 text-[22px] md:text-2xl leading-tight block max-w-full flex-1 min-w-0 group w-full"
                    :title="'Cliquez pour voir les détails : ' + rowItem.title"
                  >
                    <div class="flex flex-col items-center gap-2 w-full">
                      <!-- Ligne 1 : Titre du spectacle -->
                      <div class="text-[18px] md:text-xl leading-snug text-white text-center group-hover:text-purple-300 transition-colors duration-200 w-full" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        {{ rowItem.title || 'Sans titre' }}
                      </div>
                      
                      <!-- Ligne 2 : Date du spectacle -->
                      <div class="text-[16px] md:text-base text-gray-300 group-hover:text-purple-200 transition-colors duration-200 px-2 py-1 rounded" 
                           :title="formatDateFull(rowItem.date)">
                        {{ formatDate(rowItem.date) }}
                      </div>
                      
                      <!-- Ligne 3 : Badge de type d'événement -->
                      <div class="flex flex-col items-center">
                        <!-- Indicateur de statut archivé (priorité sur les autres) -->
                        <div 
                          v-if="rowItem.archived"
                          class="px-2 py-1 bg-gray-500/20 border border-gray-400/30 rounded-md flex items-center justify-center"
                          title="Événement archivé"
                        >
                          <span class="text-xs text-gray-300 font-medium">📁</span>
                          <span class="text-xs text-gray-200 font-medium ml-1">Archivé</span>
                        </div>
                        
                        <!-- Badge de type d'événement (seulement si pas archivé) -->
                        <div 
                          v-else-if="rowItem.roles"
                          class="px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded-md flex items-center justify-center"
                          :title="getEventTypeName(rowItem)"
                        >
                          <span class="text-xs text-gray-300 font-medium">{{ getEventTypeIcon(rowItem) }}</span>
                          <span class="text-xs text-gray-200 font-medium ml-1">{{ getEventTypeName(rowItem) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>

              <td
                v-for="(columnItem, colIndex) in displayColumns"
                :key="columnItem.id"
                :data-event-id="currentViewMode === 'normal' ? columnItem.id : undefined"
                :data-player-id="currentViewMode === 'inverted' ? columnItem.id : undefined"
                :class="[
                  'p-0',
                  currentViewMode === 'normal' && columnItem.archived ? 'archived-col' : '',
                  { 'relative ring-2 ring-pink-400 rounded-md animate-pulse': playerTourStep === 2 && rowItem.id === (guidedPlayerId || (sortedPlayers[0]?.id)) && columnItem.id === (guidedEventId || (displayedEvents[0]?.id)) }
                ]"
              >
                <AvailabilityCell
                  :player-name="currentViewMode === 'normal' ? rowItem.name : columnItem.name"
                  :event-id="currentViewMode === 'normal' ? columnItem.id : rowItem.id"
                  :is-available="currentViewMode === 'normal' ? isAvailable(rowItem.name, columnItem.id) : isAvailable(columnItem.name, rowItem.id)"
                  :is-selected="currentViewMode === 'normal' ? isSelected(rowItem.name, columnItem.id) : isSelected(columnItem.name, rowItem.id)"
                  :is-selection-confirmed="currentViewMode === 'normal' ? isSelectionConfirmed(columnItem.id) : isSelectionConfirmed(rowItem.id)"
                  :is-selection-confirmed-by-organizer="currentViewMode === 'normal' ? isSelectionConfirmedByOrganizer(columnItem.id) : isSelectionConfirmedByOrganizer(rowItem.id)"
                  :player-selection-status="currentViewMode === 'normal' ? getPlayerSelectionStatus(rowItem.name, columnItem.id) : getPlayerSelectionStatus(columnItem.name, rowItem.id)"
                  :season-id="seasonId"
                  :chance-percent="currentViewMode === 'normal' ? (chances[rowItem.name]?.[columnItem.id] ?? null) : (chances[columnItem.name]?.[rowItem.id] ?? null)"
                  :show-selected-chance="currentViewMode === 'normal' ? isSelectionComplete(columnItem.id) : isSelectionComplete(rowItem.id)"
                  :disabled="currentViewMode === 'normal' ? (columnItem.archived === true) : (rowItem.archived === true)"
                  :availability-data="currentViewMode === 'normal' ? getAvailabilityData(rowItem.name, columnItem.id) : getAvailabilityData(columnItem.name, rowItem.id)"
                  :event-title="currentViewMode === 'normal' ? columnItem.title : rowItem.title"
                  :event-date="currentViewMode === 'normal' ? columnItem.date : rowItem.date"
                  :is-protected="currentViewMode === 'normal' ? isPlayerProtectedInGrid(rowItem.id) : isPlayerProtectedInGrid(columnItem.id)"
                  :player-gender="currentViewMode === 'normal' ? (rowItem.gender || 'non-specified') : (columnItem.gender || 'non-specified')"
                  :is-loading="currentViewMode === 'normal' ? isPlayerLoading(rowItem.id) : isPlayerLoading(columnItem.id)"
                  :is-loaded="currentViewMode === 'normal' ? isPlayerAvailabilityLoaded(rowItem.id) : isPlayerAvailabilityLoaded(columnItem.id)"
                  :is-error="currentViewMode === 'normal' ? isPlayerError(rowItem.id) : isPlayerError(columnItem.id)"
                  @toggle="toggleAvailability"
                  @toggle-selection-status="handlePlayerSelectionStatusToggle"
                  @show-availability-modal="openAvailabilityModal"
                />
              </td>
              <td class="p-3 md:p-4"></td>
            </tr>
            <!-- Dernière ligne: ajouter une personne (toujours visible pour éviter blocage quand 0 personne) -->
            <tr class="border-t border-white/10">
              <td class="px-0 py-4 md:py-5 sticky left-0 z-40 bg-gray-900 left-col-td">
                <div class="px-4 md:px-5 flex items-center">
                  <button
                    @click="openNewPlayerForm"
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


  <!-- Indicateur de chargement progressif (en bas à droite) -->
  <div v-if="isProgressiveLoading" class="fixed bottom-4 right-4 z-[100] bg-gray-900/90 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-xl">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
        <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
      </div>
      <div class="text-white text-sm">
        <div class="font-medium">Chargement des disponibilités</div>
        <div class="text-xs text-gray-400">{{ loadedPlayersCount }}/{{ totalPlayersCount }} joueurs ({{ availabilityLoadingProgress }}%)</div>
      </div>
      <div class="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300" :style="{ width: availabilityLoadingProgress + '%' }"></div>
      </div>
    </div>
  </div>

  <CreatorOnboardingModal
    v-if="!isLoadingGrid && seasonMeta"
    :season-id="seasonId"
    :season-slug="seasonSlug"
    :players-count="players.length"
    :events-count="events.length"
    :onboarding-done="seasonMeta?.onboardingCreatorDone === true"
    @create-event="openNewEventForm"
    @add-player="openNewPlayerForm"
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
  <div v-if="showSuccessMessage" class="fixed bottom-4 left-4 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-2xl border border-green-400/30 backdrop-blur-sm z-[9999]">
    <div class="flex items-center space-x-2">
      <span class="text-xl">✨</span>
      <span>{{ successMessage }}</span>
    </div>
  </div>

  <!-- Message d'erreur -->
  <div v-if="showErrorMessage" class="fixed bottom-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl shadow-2xl border border-red-400/30 backdrop-blur-sm z-[9999]">
    <div class="flex items-center space-x-2">
      <span class="text-xl">⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>
  </div>


  <!-- Modales -->
  <EventModal
    :mode="'create'"
    :is-visible="newEventForm"
    @save="handleCreateEvent"
    @cancel="cancelNewEvent"
  />

  <EventModal
    :mode="'edit'"
    :is-visible="!!editingEvent"
    :event-data="editingEvent ? events.find(e => e.id === editingEvent) : null"
    @save="handleEditEvent"
    @cancel="cancelEdit"
  />

  <!-- Modale de création de joueur -->
  <div v-if="newPlayerForm" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1300] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-white text-center">✨ Nouvelle personne</h2>
      
      <!-- Nom -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Nom</label>
        <input
          ref="newPlayerNameInput"
          v-model="newPlayerName"
          type="text"
          :class="[
            'w-full p-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400',
            newPlayerNameError ? 'border-red-500' : 'border-gray-600'
          ]"
          placeholder="Nom de la personne"
          @input="validateNewPlayerName"
        >
        <div v-if="newPlayerNameError" class="mt-2 text-sm text-red-400">
          {{ newPlayerNameError }}
        </div>
      </div>

      <!-- Comment on t'appelle ? -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-3">Qu'est-ce qui désigne le mieux cette personne ?</label>
        <div class="space-y-3">
          <label class="flex items-center space-x-3 cursor-pointer group">
            <input
              v-model="newPlayerGender"
              type="radio"
              value="non-specified"
              class="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 focus:ring-purple-500 focus:ring-2"
            >
            <span class="text-white group-hover:text-purple-300 transition-colors">C'est un.e improvisateur.trice</span>
          </label>
          <label class="flex items-center space-x-3 cursor-pointer group">
            <input
              v-model="newPlayerGender"
              type="radio"
              value="female"
              class="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 focus:ring-purple-500 focus:ring-2"
            >
            <span class="text-white group-hover:text-purple-300 transition-colors">C'est une improvisatrice</span>
          </label>
          <label class="flex items-center space-x-3 cursor-pointer group">
            <input
              v-model="newPlayerGender"
              type="radio"
              value="male"
              class="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 focus:ring-purple-500 focus:ring-2"
            >
            <span class="text-white group-hover:text-purple-300 transition-colors">C'est un improvisateur</span>
          </label>
        </div>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          @click="closeNewPlayerForm"
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
  <div v-if="confirmDelete" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1380] p-4">
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
  <div v-if="confirmPlayerDelete" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1320] p-4">
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




  <!-- Popin de détails de l'événement -->
  <div v-if="showEventDetailsModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[1360] p-0 md:p-4" @click="closeEventDetailsAndUpdateUrl">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col" @click.stop>
      <!-- Header -->
      <div class="relative p-4 md:p-6 border-b border-white/10">
        <button @click="closeEventDetailsAndUpdateUrl" title="Fermer" class="absolute right-3 top-3 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
        
        <!-- Layout horizontal compact -->
        <div class="flex items-start gap-4 md:gap-6">
          <!-- Icône illustrative du type d'événement -->
          <div class="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex-shrink-0 flex items-center justify-center">
            <span class="text-xl md:text-2xl">{{ getEventTypeIcon(selectedEvent) }}</span>
          </div>
          
                     <!-- Informations principales -->
           <div class="flex-1 min-w-0">
             <div class="flex items-center gap-3 mb-2">
               <h2 class="text-xl md:text-2xl font-bold text-white leading-tight">{{ selectedEvent?.title }}</h2>
               
               <!-- Icône Modifier -->
               <button
                 @click="startEditingFromDetails"
                 class="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                 title="Modifier cet événement"
               >
                 <span class="text-lg">✏️</span>
               </button>
               
               <!-- Icône Supprimer -->
               <button
                 @click="confirmDeleteEvent(selectedEvent?.id)"
                 class="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 group"
                 title="Supprimer cet événement"
               >
                 <span class="text-lg">🗑️</span>
               </button>
             </div>
             

             <!-- Date sur sa propre ligne -->
             <div class="mb-3">
               <p class="text-base md:text-lg text-purple-300">{{ formatDateFull(selectedEvent?.date) }}</p>
             </div>
             
             <!-- Lieu sur sa propre ligne si défini -->
             <div v-if="selectedEvent?.location" class="mb-3">
               <a 
                 :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.location)}`"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="text-sm text-blue-300 hover:text-blue-200 flex items-center gap-2 transition-colors duration-200 cursor-pointer"
                 :title="`Ouvrir ${selectedEvent.location} dans Google Maps`"
               >
                 <span>📍</span>
                 <span class="underline">{{ selectedEvent.location }}</span>
               </a>
             </div>
             
             <!-- Boutons agenda, partage et notifications sur la même ligne -->
             <div class="flex items-center gap-3 mb-3 pl-0 md:pl-0">
               <div class="relative">
                 <button 
                   @click="toggleCalendarMenuDetails()"
                   class="px-3 py-1.5 bg-purple-500/20 border border-purple-400/30 rounded text-sm flex items-center gap-2 hover:bg-purple-500/30 transition-colors duration-200 cursor-pointer"
                   title="Ajouter à votre agenda"
                 >
                   <span class="text-purple-300">📅</span>
                   <span class="text-purple-200">
                     <span class="hidden md:inline">Ajouter à mon Agenda</span>
                     <span class="md:hidden">Agenda</span>
                   </span>
                 </button>
                 
                 <!-- Menu déroulant d'agenda pour la modal -->
                 <div 
                   v-if="showCalendarMenuDetails"
                   class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-gray-900 border border-white/20 rounded-lg shadow-xl z-[1370] overflow-hidden"
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
               
               <!-- Bouton de partage de lien -->
               <div class="relative">
                 <button 
                   @click="copyEventLinkToClipboard(selectedEvent)"
                   class="px-3 py-1.5 bg-purple-500/20 border border-purple-400/30 rounded text-sm flex items-center gap-2 hover:bg-purple-500/30 transition-colors duration-200 cursor-pointer"
                   title="Copier le lien direct vers cet événement pour le partager"
                 >
                   <span class="text-purple-300">🔗</span>
                   <span class="text-purple-200">
                     <span class="hidden md:inline">Partager le lien</span>
                     <span class="md:hidden">Partager</span>
                   </span>
                 </button>
                 <div v-if="showShareLinkCopied" class="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs text-green-400 whitespace-nowrap">
                   ✓ Lien copié !
                 </div>
               </div>
               
               <!-- Bouton notifications -->
               <div v-if="isEventMonitoredState" class="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-400/30 rounded text-sm">
                 <span class="text-purple-300">✅</span>
                 <span class="text-purple-200">
                   <span class="hidden md:inline">Notifications activées</span>
                   <span class="md:hidden">Notifié</span>
                 </span>
               </div>
               <button 
                 v-else 
                 @click="promptForNotifications(selectedEvent)"
                 class="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-400/30 rounded text-sm hover:bg-purple-500/30 transition-colors duration-200 cursor-pointer"
                 title="Reçois des alertes en temps réel : compositions, changements d'horaires, et plus !"
               >
                 <span class="text-purple-300">🔔</span>
                 <span class="text-purple-200">
                   <span class="hidden md:inline">Notifiez-moi</span>
                   <span class="md:hidden">Notifier</span>
                 </span>
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
  <div class="px-4 md:px-6 py-4 md:py-6 space-y-6 overflow-y-auto flex-1 min-h-0">
        <!-- Section Équipe à Constituer -->
        <div class="mb-4 md:mb-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
              <span class="hidden md:inline">🎭</span>
              <span v-if="!selectedEvent || getSelectionPlayers(selectedEvent.id).length === 0">Disponibilités</span>
              <span v-else class="flex items-center gap-2">
                <span>Équipe:</span>
                <SelectionStatusBadge
                  :status="eventStatus?.type"
                  :show="true"
                  :clickable="false"
                  :reason="eventWarningText"
                  class="text-sm"
                />
              </span>
            </h3>
            <div class="flex items-center gap-2">
              <!-- Bouton toggle pour basculer entre disponibilités et pourcentages (masqué si sélection) -->
              <button 
                v-if="!selectedEvent || getSelectionPlayers(selectedEvent.id).length === 0"
                @click="showRoleChances = !showRoleChances"
                class="flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors duration-200 cursor-pointer"
                :class="showRoleChances 
                  ? 'bg-emerald-500/20 border border-emerald-400/30 hover:bg-emerald-500/30' 
                  : 'bg-gray-500/20 border border-gray-400/30 hover:bg-gray-500/30'"
                :title="showRoleChances ? 'Voir les disponibilités' : 'Voir les pourcentages de chances'"
              >
                <span :class="showRoleChances ? 'text-emerald-300' : 'text-gray-300'">📊</span>
                <span :class="showRoleChances ? 'text-emerald-200' : 'text-gray-200'">
                  {{ showRoleChances ? 'Dispos' : 'Chances' }}
                </span>
              </button>
              
              <button 
                @click="showRoleDetails = !showRoleDetails"
                class="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded text-sm hover:bg-blue-500/30 transition-colors duration-200 cursor-pointer"
                title="Cliquer pour voir le détail des rôles"
              >
                <span class="text-blue-300">👥</span>
                <span class="text-blue-200">
                  {{ selectedEventTotalTeamSize }} <span class="hidden md:inline">personnes</span><span class="md:hidden">pers.</span>
                </span>
              </button>
            </div>
          </div>
          
          <!-- Détails des rôles -->
          <div v-if="showRoleDetails" class="text-sm text-gray-400">
            <div v-if="selectedEvent?.roles">
              <span v-for="(role, index) in Object.keys(selectedEvent.roles)" :key="role">
                <span>{{ ROLE_LABELS[role] }}: </span>
                <span 
                  class="font-semibold"
                  :class="{
                    'text-cyan-400': role === 'player',
                    'text-purple-400': role === 'dj',
                    'text-pink-400': role === 'mc',
                    'text-orange-400': role === 'volunteer',
                    'text-yellow-400': role === 'referee',
                    'text-green-400': role === 'assistant_referee',
                    'text-blue-400': role === 'lighting',
                    'text-indigo-400': role === 'coach'
                  }"
                >
                  {{ selectedEvent.roles[role] }}
                </span>
                <span v-if="index < Object.keys(selectedEvent.roles).length - 1">, </span>
              </span>
            </div>
            <div v-else>
              <span class="text-cyan-400 font-semibold">{{ selectedEvent?.playerCount || 6 }}</span> comédiens
            </div>
          </div>
        </div>

        <!-- Nouvelle vue par rôles -->
        <EventRoleGroupingView
          v-if="selectedEvent"
          :selected-event="selectedEvent"
          :season-id="seasonId"
          :players="players"
          :availability="availability"
          :casts="casts"
          :chances="chances"
          :preferred-player-ids-set="preferredPlayerIdsSet"
          :is-available="isAvailable"
          :is-player-selected="isPlayerSelected"
          :is-selection-confirmed="isSelectionConfirmed"
          :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer"
          :get-player-selection-status="getPlayerSelectionStatus"
          :get-availability-data="getAvailabilityData"
          :is-player-protected-in-grid="isPlayerProtectedInGrid"
          :is-player-loading="isPlayerLoading"
          :is-player-availability-loaded="isPlayerAvailabilityLoaded"
          :is-player-error="isPlayerError"
          :get-event-status="getEventStatus"
          :get-event-tooltip="getEventTooltip"
          :handle-availability-toggle="handleAvailabilityToggle"
          :handle-player-selection-status-toggle="handlePlayerSelectionStatusToggle"
          :open-availability-modal="openAvailabilityModal"
          :is-available-for-role="isAvailableForRole"
          :is-selection-complete="isSelectionComplete"
        />

        <!-- More actions (mobile) - Supprimé, remplacé par un dropdown flottant -->
      </div>

      <!-- Footer sticky (desktop) -->
      <div class="hidden md:block sticky bottom-0 w-full p-3 bg-gray-900/95 border-t border-white/10 backdrop-blur-sm">
        <div class="flex justify-center flex-wrap gap-3">
          <!-- Boutons principaux -->
          <button 
            @click="openEventAnnounceModal(selectedEvent)" 
            :disabled="selectedEvent?.archived"
            class="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600" 
            :title="selectedEvent?.archived ? 'Impossible d\'annoncer un événement archivé' : 'Annoncer l\'événement aux personnes (email, copie, WhatsApp)'"
          >
            <span>📢</span><span>Annoncer</span>
          </button>
          <button @click="openSelectionModal(selectedEvent)" class="px-5 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2" title="Gérer la composition">
            <span>🎭</span><span>Composition Équipe</span>
          </button>
          
          <!-- Bouton Fermer -->
          <button @click="closeEventDetailsAndUpdateUrl" class="px-5 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300">Fermer</button>
        </div>
      </div>

      <!-- Footer sticky (mobile) -->
      <div class="md:hidden sticky bottom-0 w-full p-3 bg-gray-900/95 border-t border-white/10 backdrop-blur-sm flex items-center gap-2">
        <button @click="openEventAnnounceModal(selectedEvent)" :disabled="selectedEvent?.archived" class="h-12 px-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 flex-[1.4] disabled:opacity-50 disabled:cursor-not-allowed">Annoncer</button>
        <button @click="openSelectionModal(selectedEvent)" class="h-12 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex-[1.4]">Composition</button>
        <button @click="closeEventDetailsAndUpdateUrl" class="h-12 px-4 bg-gray-700 text-white rounded-lg flex-1">Fermer</button>
      </div>
    </div>
  </div>

  <!-- Footer principal -->
  <AppFooter @open-help="goToHelpPage" />

  <!-- Composant de debug des performances -->
  <PerformanceDebug v-if="performanceService.isEnabled" />


  <!-- Modal de vérification du mot de passe pour joueur protégé -->
  <PasswordVerificationModal
    :show="showPasswordVerification"
    :player="passwordVerificationPlayer"
    :seasonId="seasonId"
    @close="showPasswordVerification = false"
    @verified="handlePasswordVerified"
  />



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
  <div v-if="showPlayerPasswordModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1340] p-4">
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
  <div v-if="showAvailabilityPasswordModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[1350] p-0 md:p-4">
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
  <div v-if="showAvailabilityForgotPassword" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1410] p-4" @click="showAvailabilityForgotPassword = false">
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
  <div v-if="showPlayerForgotPassword" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1400] p-4" @click="showPlayerForgotPassword = false">
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
    :season-id="seasonId"
    :onboarding-step="playerTourStep"
    :onboarding-player-id="guidedPlayerId"
    :is-protected="selectedPlayer ? protectedPlayers.has(selectedPlayer.id) : false"
    :is-preferred="selectedPlayer ? preferredPlayerIdsSet.has(selectedPlayer.id) : false"
    @close="closePlayerModal"
    @update="handlePlayerUpdate"
    @delete="handlePlayerDelete"
    @refresh="handlePlayerRefresh"
    @avatar-updated="handleAvatarUpdated"
    @advance-onboarding="(s) => { try { if (typeof playerTourStep !== 'undefined') playerTourStep.value = s } catch {} }"
  />

  <!-- Modal de composition -->
  <SelectionModal
    ref="selectionModalRef"
    :key="selectionModalKey"
    :show="showSelectionModal"
    :event="selectionModalEvent"
    :current-selection="casts[selectionModalEvent?.id] || []"
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
    @updateCast="handleUpdateCastFromModal"
    @confirm-selection="handleConfirmSelectionFromModal"
    @unconfirm-selection="handleUnconfirmCastFromModal"
    @reset-selection="handleResetSelectionFromModal"
    @confirm-reselect="handleConfirmReselectFromModal"
    @complete-selection="handleCompleteSelectionFromModal"
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
  
  <!-- Modale Préférences -->
  <PreferencesModal
    :show="showPreferences"
    @close="closePreferences"
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
  <div v-if="showAnnouncePrompt" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1370] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-6 rounded-2xl shadow-2xl max-w-md">
              <h3 class="text-xl font-bold text-white mb-4 text-center">Voulez-vous annoncer cet événement ?</h3>
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

  <!-- Modal de disponibilité avec rôles -->
  <AvailabilityModal
    :show="showAvailabilityModal"
    :player-name="availabilityModalData.playerName"
    :player-id="availabilityModalData.playerId"
    :player-gender="availabilityModalData.playerGender"
    :event-id="availabilityModalData.eventId"
    :event-title="availabilityModalData.eventTitle"
    :event-date="availabilityModalData.eventDate"
    :current-availability="availabilityModalData.availabilityData"
    :is-read-only="availabilityModalData.isReadOnly"
    :season-id="seasonId"
    :chance-percent="availabilityModalData.chancePercent"
    :is-protected="availabilityModalData.isProtected"
    :event-roles="availabilityModalData.eventRoles"
    @close="showAvailabilityModal = false"
    @save="handleAvailabilitySave"
    @not-available="handleAvailabilityNotAvailable"
    @clear="handleAvailabilityClear"
    @request-edit="handleAvailabilityRequestEdit"
  />

  <!-- Modal de développement -->
  <DevelopmentModal 
    :show="showDevelopmentModal"
    @close="showDevelopmentModal = false"
  />

  
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
.col-left { width: 13rem; }
.col-event { width: 12.5rem; background: transparent !important; }
.col-right { width: 4.5rem; }

@media (min-width: 640px) { /* sm */
  .col-left { width: 13rem; }
  .left-col-td { width: 13rem; max-width: 13rem; min-width: 13rem; }
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
  .col-left { width: 13rem; }
  .col-event { width: 10.5rem; }
  .left-col-td { width: 13rem; max-width: 13rem; min-width: 13rem; }
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
import { ROLES, ROLE_EMOJIS, ROLE_LABELS, ROLE_DISPLAY_ORDER, ROLE_PRIORITY_ORDER, ROLE_TEMPLATES, TEMPLATE_DISPLAY_ORDER, EVENT_TYPE_ICONS } from '../services/storage.js'
import { getPlayerCastStatus, getPlayerCastRole } from '../services/castService.js'
// Navigation tracking supprimé - remplacé par seasonPreferences
import { useRouter, useRoute } from 'vue-router'
import firestoreService from '../services/firestoreService.js'

// Fonction simple pour récupérer l'ID utilisateur actuel
function getCurrentUserId() {
  try {
    // Essayer de récupérer depuis localStorage (fallback)
    const storedUserId = localStorage.getItem('hatcast_current_user_id')
    if (storedUserId) {
      return storedUserId
    }
    
    // Essayer de récupérer depuis l'URL (pour les liens de reset)
    const urlParams = new URLSearchParams(window.location.search)
    const email = urlParams.get('email')
    if (email) {
      return email
    }
    
    return null
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID utilisateur', error)
    return null
  }
}
import { getFirebaseAuth } from '../services/firebase.js'
import { currentUser } from '../services/authState.js'
import { listAssociationsForEmail } from '../services/playerProtection.js'
import { signOut } from 'firebase/auth'
import { isPlayerProtected, isPlayerPasswordCached, listProtectedPlayers, getPlayerEmail } from '../services/playerProtection.js'
import { 
  setEventArchived,
  loadPlayers,
  loadEvents,
  loadAvailability,
  loadCasts,
  addPlayer,
  deletePlayer,
  deleteEvent,
  updateEvent,
  saveEvent,
  updatePlayer,
  saveCast
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
import performanceService from '../services/performanceService.js'
import AnnounceModal from './AnnounceModal.vue'
import EventAnnounceModal from './EventAnnounceModal.vue'
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
import PreferencesModal from './PreferencesModal.vue'
import PlayersModal from './PlayersModal.vue'
import NotificationPromptModal from './NotificationPromptModal.vue'
import NotificationSuccessModal from './NotificationSuccessModal.vue'
import AccountCreationModal from './AccountCreationModal.vue'
import SelectionStatusBadge from './SelectionStatusBadge.vue'
import PlayerAvatar from './PlayerAvatar.vue'
import EventRoleGroupingView from './EventRoleGroupingView.vue'
import AvailabilityModal from './AvailabilityModal.vue'
import EventModal from './EventModal.vue'
import DevelopmentModal from './DevelopmentModal.vue'
import PerformanceDebug from './PerformanceDebug.vue'
import AppFooter from './AppFooter.vue'

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

// Initialiser Firebase Auth
const auth = getFirebaseAuth()

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
        logger.debug('🔄 Chargement des favoris pour utilisateur connecté:', user.email)
        await updatePreferredPlayersSet()
      } else {
        // Utilisateur déconnecté : vider les favoris
        logger.debug('🔄 Utilisateur déconnecté, effacement des favoris')
        preferredPlayerIdsSet.value = new Set()
      }
    }
  } catch (error) {
    logger.error('❌ Erreur lors de la synchronisation des favoris:', error)
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
    logger.error('Erreur lors de la mise à jour de l\'état de surveillance:', error)
    isEventMonitoredState.value = false
  }
}

const seasonSlug = props.slug
const seasonName = ref('')
const seasonId = ref('')
const seasonMeta = ref({})

// État du scroll pour le header sticky
const isScrolled = ref(false)

// État de la vue (normal ou inversée)
const currentViewMode = ref('normal')
const showViewToggle = ref(false)

const confirmDelete = ref(false)
const eventToDelete = ref(null)
const editingEvent = ref(null)
const editingTitle = ref('')
const editingDate = ref('')
const editingPlayerCount = ref(6)
const editingRoles = ref({
  [ROLES.PLAYER]: 6,
  [ROLES.DJ]: 1,
  [ROLES.MC]: 1,
  [ROLES.VOLUNTEER]: 5,
  [ROLES.REFEREE]: 1,
  [ROLES.ASSISTANT_REFEREE]: 2,
  [ROLES.LIGHTING]: 0,
  [ROLES.COACH]: 0
})
const editingShowAllRoles = ref(false)

const newPlayerForm = ref(false)
const newPlayerName = ref('')
const newPlayerGender = ref('non-specified')
const newPlayerNameError = ref('')
const newPlayerNameInput = ref(null)

// Fonction pour ouvrir le formulaire avec focus
function openNewPlayerForm() {
  console.log('🔍 openNewPlayerForm appelé')
  newPlayerForm.value = true
  newPlayerName.value = ''
  newPlayerGender.value = 'non-specified'
  newPlayerNameError.value = ''
  
  // Focus automatique sur le champ nom après que le DOM soit mis à jour
  nextTick(() => {
    console.log('🔍 nextTick - newPlayerNameInput.value:', newPlayerNameInput.value)
    if (newPlayerNameInput.value) {
      newPlayerNameInput.value.focus()
      console.log('🔍 Focus appliqué sur le champ nom')
    }
  })
}
const highlightedPlayer = ref(null)
const guidedPlayerId = ref(null)
const guidedEventId = ref(null)
const addPlayerCoachmark = ref({ position: null, side: null })
const availabilityCoachmark = ref({ position: null })
const playerNameCoachmark = ref({ position: null })

// Variables pour le modal joueur
const showPlayerModal = ref(false)
const selectedPlayer = ref(null)
const playerModalRef = ref(null)

// Variables pour la protection par PIN
const showPinModal = ref(false)
const pendingOperation = ref(null)
const pinErrorMessage = ref('')
const sessionInfo = ref(null)

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

// Variables pour les détails de l'événement
const showEventDetailsModal = ref(false)
const selectedEvent = ref(null)
const editingDescription = ref('')
const editingArchived = ref(false)

// Variables pour les menus d'agenda
const showCalendarMenuDetails = ref(false)

// Variables pour le partage de lien
const showShareLinkCopied = ref(false)

// Variables pour l'incitation aux notifications
const showNotificationPrompt = ref(false)
const notificationPromptData = ref(null)

// État pour la modale de succès des notifications
const showNotificationSuccess = ref(false)
const notificationSuccessData = ref(null)

// Variables pour la modale de protection des saisies
const showPlayerClaim = ref(false)
const playerClaimData = ref(null)

// Variables pour la modale de développement
const showDevelopmentModal = ref(false)




// Fonctions pour gérer les menus d'agenda
function toggleCalendarMenuDetails() {
  showCalendarMenuDetails.value = !showCalendarMenuDetails.value
}

function closeCalendarMenuDetails() {
  showCalendarMenuDetails.value = false
}

// Fonction pour copier le lien direct de l'événement
async function copyEventLinkToClipboard(event) {
  if (!event) return;
  
  try {
    // Générer le lien direct vers l'événement
    const eventUrl = `${window.location.origin}/season/${props.slug}?event=${event.id}&modal=event_details`;
    
    // Copier dans le presse-papiers
    await navigator.clipboard.writeText(eventUrl);
    
    // Afficher le message de confirmation
    showShareLinkCopied.value = true;
    
    // Masquer le message après 2 secondes
    setTimeout(() => {
      showShareLinkCopied.value = false;
    }, 2000);
    
  } catch (error) {
    console.error('Erreur lors de la copie du lien:', error);
    
    // Fallback pour les navigateurs qui ne supportent pas l'API Clipboard
    try {
      const textArea = document.createElement('textarea');
      textArea.value = `${window.location.origin}/season/${props.slug}?event=${event.id}&modal=event_details`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      showShareLinkCopied.value = true;
      setTimeout(() => {
        showShareLinkCopied.value = false;
      }, 2000);
    } catch (fallbackError) {
      console.error('Erreur lors de la copie du lien (fallback):', fallbackError);
    }
  }
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

// Variables pour la nouvelle popin de composition
const showSelectionModal = ref(false)
const selectionModalEvent = ref(null)
const selectionModalRef = ref(null)
const selectionModalKey = ref(0)

// Variables pour le modal d'annonce d'événement
const showEventAnnounceModal = ref(false)
const eventToAnnounce = ref(null)
const showAnnouncePrompt = ref(false)
const announcePromptEvent = ref(null)
const showAccountMenu = ref(false)
const showAccountAuth = ref(false)
const showAccountLogin = ref(false)
const showAccountCreation = ref(false)
const showPreferences = ref(false)
const showPlayers = ref(false)

// Fonction pour rediriger vers la page d'aide
function goToHelpPage() {
  window.location.href = '/help'
}
const accountAuthPlayer = ref(null)

// Variables pour la modale de disponibilité avec rôles
const showAvailabilityModal = ref(false)
const availabilityModalData = ref({
  playerName: '',
  playerId: '',
  eventId: '',
  eventTitle: '',
  eventDate: '',
  availabilityData: {
    available: false,
    roles: [],
    comment: null
  },
  isReadOnly: false,
  chancePercent: null
})
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

async function openPreferences() {
  showPreferences.value = true
  
  // Logger l'audit d'ouverture de modale
  try {
    const { default: AuditClient } = await import('../services/auditClient.js')
    await AuditClient.logModalOpen('preferences', { seasonSlug: props.slug })
  } catch (auditError) {
    console.warn('Erreur audit modal:', auditError)
  }
}

// Fonction d'initialisation du mode de vue
function initializeViewMode() {
  if (currentUser.value?.email) {
    // Pour les utilisateurs connectés, commencer en mode inversé
    currentViewMode.value = 'inverted'
    showViewToggle.value = true
    logger.debug('✅ Mode de vue initialisé: inversé (utilisateur connecté)')
  } else {
    // Utilisateur non connecté - toggle visible mais mode normal par défaut
    currentViewMode.value = 'normal'
    showViewToggle.value = true
    logger.debug('✅ Toggle visible pour utilisateur non connecté, mode normal par défaut')
  }
}

// Fonction de basculement de vue
function toggleViewMode() {
  currentViewMode.value = currentViewMode.value === 'normal' ? 'inverted' : 'normal'
  logger.debug(`Mode de vue changé vers: ${currentViewMode.value}`)
}
function closePreferences() { 
  showPreferences.value = false 
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
    logger.debug('🔑 GridBoard: openAccount() appelé')
    logger.debug('🔑 showAccountLogin avant:', showAccountLogin.value)
    
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
      logger.debug('🔑 showAccountLogin après:', showAccountLogin.value)
      // Mémoriser un joueur si l'utilisateur choisit l'association ensuite
      if (target) accountAuthPlayer.value = target
      return
    }
    
    // Si l'utilisateur est déjà connecté, ne rien faire
    // Il peut accéder à son compte via le bouton avatar
    logger.debug('🔐 Utilisateur déjà connecté, pas d\'action automatique')
    return
  } catch (error) {
    logger.error('❌ Erreur dans openAccount:', error)
  }
}

function openAccountCreation() {
  showAccountCreation.value = true
}

function openDevelopment() {
  logger.debug('🚀 openDevelopment() appelée dans GridBoard');
  logger.debug('🔧 showDevelopmentModal avant:', showDevelopmentModal.value);
  showDevelopmentModal.value = true;
  logger.debug('🔧 showDevelopmentModal après:', showDevelopmentModal.value);
}

async function handleAccountChangePassword() {
  try {
    const email = auth?.currentUser?.email
    if (!email) return
    const { resetPlayerPassword } = await import('../services/firebase.js')
    await resetPlayerPassword(email)
    showSuccessMessage.value = true
    successMessage.value = 'Email de réinitialisation envoyé. Si vous ne recevez pas l\'email dans quelques minutes, vérifiez vos dossiers de spam/courrier indésirable.'
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
    // S'assurer que firestoreService est initialisé
    if (!firestoreService.isInitialized) {
      await firestoreService.initialize()
    }
    
    if (assoc.seasonId && assoc.seasonId !== seasonId.value) {
      const seasons = await firestoreService.getDocuments('seasons')
      const match = seasons.find(d => d.id === assoc.seasonId)
      const slug = match?.slug
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
  } catch (error) {
    console.error('❌ Erreur dans onManageAccountPlayer:', error)
  }
}

  // Onboarding créateur (multi-étapes)
  // Onboarding créateur: géré par CreatorOnboardingModal
// Si l'utilisateur vient du /join, masquer l'onboarding créateur
onMounted(async () => {
  // Initialiser l'état d'authentification
        currentUser.value = getFirebaseAuth()?.currentUser
  
  // Initialiser les rôles avec le template par défaut (après le prochain tick)
  nextTick(() => {
    applyRoleTemplate('cabaret')
  })
  
  // Écouter les changements d'état d'authentification
      const unsubscribe = getFirebaseAuth()?.onAuthStateChanged(onAuthStateChanged)
  
  // Stocker la fonction de cleanup pour onUnmounted
  window._gridBoardUnsubscribe = unsubscribe
  

  
  // Tracking de navigation pour les utilisateurs non connectés
  try {
    const currentPath = window.location.pathname
    if (currentPath && currentPath !== '/') {
      // Essayer de récupérer l'email depuis l'URL ou localStorage
      const urlParams = new URLSearchParams(window.location.search)
      const email = urlParams.get('email') || localStorage.getItem('hatcast_last_email')
      
      // Navigation tracking supprimé - remplacé par seasonPreferences
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
          
          // Si action=protect, ouvrir directement la modale de protection
          if (urlParams.get('action') === 'protect') {
            // Attendre que la modale de joueur soit ouverte, puis ouvrir la protection
            setTimeout(() => {
              // Déclencher l'ouverture de la modale de protection
              const playerModal = document.querySelector('[data-testid="player-modal"]')
              if (playerModal) {
                // Simuler un clic sur le bouton de protection
                const protectButton = playerModal.querySelector('button[data-testid="protect-button"]')
                if (protectButton) {
                  protectButton.click()
                }
              }
            }, 500)
          }
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
          logger.debug('🔄 Favoris mis à jour après activation de la protection')
          
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
          
          logger.debug('✅ Joueur ajouté en favoris après activation de la protection:', playerId)
          
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
          logger.error('Erreur lors de l\'ajout en favoris:', error)
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
  
  // Initialiser le mode de vue pour les utilisateurs connectés
  initializeViewMode()
  
  // Retourner la fonction de cleanup
  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
})

// Quand le modal onboarding se ferme, synchroniser la grille et mettre à jour seasonMeta
function afterCloseOnboarding() {
  // Mettre à jour seasonMeta pour refléter que l'onboarding est terminé
  if (seasonMeta.value) {
    seasonMeta.value = { ...seasonMeta.value, onboardingCreatorDone: true }
  }
  
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

// Variables pour le chargement progressif
const isProgressiveLoading = ref(false)
const loadedPlayersCount = ref(0)
const totalPlayersCount = ref(0)
const playerLoadingStates = ref(new Map()) // playerId -> 'loading' | 'loaded' | 'error'
const availabilityLoadingProgress = ref(0)

// Détection mobile pour optimisations
const isMobile = ref(false)
const isEssentialDataLoaded = ref(false) // Événements + joueurs + favoris chargés

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
  // Vérifier s'il y a une composition existante
  if (!casts.value[eventId]) {
    showSuccessMessage.value = true
    successMessage.value = 'Aucune composition à réinitialiser pour cet événement'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
    return
  }
  
  // Demander le PIN code avant de réinitialiser la composition
  await requirePin({
    type: 'resetCast',
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
      loadCasts(seasonId.value)
    ]).then(([newEvents, newAvailability, newSelections]) => {
      events.value = newEvents
      availability.value = newAvailability
      casts.value = newSelections
    })
    
    // Fermer la modal de confirmation
    confirmDelete.value = false
    eventToDelete.value = null
    
    // Fermer la modale de détails de l'événement
    closeEventDetailsAndUpdateUrl()
    
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

async function startEditing(event) {
  // Demander le PIN code avant d'ouvrir l'édition
  await requirePin({
    type: 'editEvent',
    data: { eventId: event.id }
  })
}

async function saveEdit() {
  if (!editingEvent.value || !editingTitle.value.trim() || !editingDate.value) return

  // Calculer le total des rôles (peut être 0 pour les événements sans rôles)
  const totalRoles = Object.values(editingRoles.value).reduce((sum, count) => sum + count, 0)
  const playerCount = editingRoles.value[ROLES.PLAYER] || 0
  
  // Permettre les événements sans rôles, mais vérifier la cohérence si des rôles sont définis
  if (totalRoles > 0 && playerCount === 0) {
    alert('Il doit y avoir au moins un comédien dans l\'équipe si des rôles sont définis')
    return
  }

  // Utiliser handleEditEvent pour éviter la duplication de code
  await handleEditEvent({
    title: editingTitle.value,
    date: editingDate.value,
    description: editingDescription.value,
    archived: editingArchived.value,
    roles: editingRoles.value,
    templateType: editingSelectedRoleTemplate.value // Ajouter le type de template
  })
}

// Nouvelle fonction pour gérer l'édition via EventModal
async function handleEditEvent(eventData) {
  if (!editingEvent.value) return

  // Calculer le total des rôles (peut être 0 pour les événements sans rôles)
  const totalRoles = Object.values(eventData.roles).reduce((sum, count) => sum + count, 0)
  const playerCount = eventData.roles[ROLES.PLAYER] || 0
  
  // Permettre les événements sans rôles, mais vérifier la cohérence si des rôles sont définis
  if (totalRoles > 0 && playerCount === 0) {
    alert('Il doit y avoir au moins un comédien dans l\'équipe si des rôles sont définis')
    return
  }

  try {
    const eventDataToSave = {
      title: eventData.title.trim(),
      date: eventData.date,
      description: eventData.description.trim() || '',
      location: eventData.location?.trim() || '',
      playerCount: playerCount, // Garder pour compatibilité avec l'ancien système
      roles: eventData.roles, // Nouveau champ pour les rôles
      templateType: eventData.templateType, // Sauvegarder le type de template
      archived: !!eventData.archived
    }
    
    // Récupérer l'ancienne date pour comparer
    const oldEvent = events.value.find(e => e.id === editingEvent.value)
    const oldDate = oldEvent?.date
    const dateChanged = oldDate !== eventData.date
    
    await updateEvent(editingEvent.value, eventDataToSave, seasonId.value)
    
    // Si la date a changé et qu'il y a des joueurs compositionnés, recréer les rappels
    if (dateChanged && !eventData.archived) {
      try {
        const { createRemindersForSelection, removeRemindersForEvent } = await import('../services/reminderService.js')
        
        // Supprimer tous les anciens rappels pour cet événement
        await removeRemindersForEvent({
          seasonId: seasonId.value,
          eventId: editingEvent.value
        })
        
        // Récupérer les joueurs compositionnés (toujours un tableau)
        const selectedPlayers = getSelectionPlayers(editingEvent.value)
        
        // Recréer les rappels pour chaque joueur compositionné
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
        
        logger.debug('🎯 Rappels mis à jour pour la nouvelle date:', {
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
        // Gestion spécifique des erreurs de permissions sur reminderQueue
        if (error.code === 'permission-denied' || error.message?.includes('insufficient permissions')) {
          logger.info('⚠️ Accès refusé à reminderQueue (normal pour utilisateurs anonymes)', {
            eventId: editingEvent.value,
            error: error.message
          })
          // Message informatif pour l'utilisateur sans exposer les détails techniques
          showSuccessMessage.value = true
          successMessage.value = 'Événement mis à jour avec succès ! (Rappels automatiques non disponibles)'
          setTimeout(() => {
            showSuccessMessage.value = false
          }, 5000)
        } else {
          console.error('Erreur lors de la mise à jour des rappels:', error)
          logger.error('Erreur lors de la mise à jour des rappels:', error)
        }
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
      loadCasts(seasonId.value)
    ]).then(([newEvents, newAvailability, newSelections]) => {
      events.value = newEvents
      availability.value = newAvailability
      casts.value = newSelections
      
      // Mettre à jour selectedEvent avec les nouvelles données si la modale de détails est ouverte
      if (selectedEvent.value) {
        const updatedEvent = newEvents.find(e => e.id === selectedEvent.value.id)
        if (updatedEvent) {
          selectedEvent.value = updatedEvent
        }
      }
    })
    
    // Réinitialiser l'état d'édition
    editingEvent.value = null
    editingTitle.value = ''
    editingDate.value = ''
    editingDescription.value = ''
    editingPlayerCount.value = 6
    editingArchived.value = false
    editingSelectedRoleTemplate.value = 'cabaret'
    editingRoles.value = {
      [ROLES.PLAYER]: 6,
      [ROLES.DJ]: 1,
      [ROLES.MC]: 1,
      [ROLES.VOLUNTEER]: 5,
      [ROLES.REFEREE]: 1,
      [ROLES.ASSISTANT_REFEREE]: 2,
      [ROLES.LIGHTING]: 0,
      [ROLES.COACH]: 0,
      [ROLES.STAGE_MANAGER]: 1
    }
    editingShowRoleInputs.value = false
    editingShowAllRoles.value = false
    
    // Message de succès final
    showSuccessMessage.value = true
    successMessage.value = 'Événement mis à jour avec succès !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erreur lors de la modification de l\'événement')
    alert('Erreur lors de la modification de l\'événement. Veuillez réessayer.')
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
      loadCasts(seasonId.value)
    ]).then(([newPlayers, newAvailability, newSelections]) => {
      players.value = newPlayers
      availability.value = newAvailability
      casts.value = newSelections
      
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

// Fonction de validation du nom de joueur
function validateNewPlayerName() {
  const name = newPlayerName.value.trim()
  
  if (!name) {
    newPlayerNameError.value = ''
    return
  }
  
  const existingPlayer = players.value.find(player => player.name.toLowerCase() === name.toLowerCase())
  if (existingPlayer) {
    newPlayerNameError.value = `Une personne nommée "${name}" existe déjà dans cette saison.`
  } else {
    newPlayerNameError.value = ''
  }
}

// Fonction pour fermer la modale de nouvelle personne
function closeNewPlayerForm() {
  newPlayerForm.value = false
  newPlayerName.value = ''
  newPlayerGender.value = 'non-specified'
  newPlayerNameError.value = ''
}

async function addNewPlayer() {
  console.log('🔍 addNewPlayer appelé:', { 
    name: newPlayerName.value, 
    gender: newPlayerGender.value,
    nameError: newPlayerNameError.value,
    inputElement: newPlayerNameInput.value,
    inputValue: newPlayerNameInput.value?.value
  })
  
  if (!newPlayerName.value.trim()) {
    console.log('❌ Nom vide - newPlayerName.value:', JSON.stringify(newPlayerName.value))
    return
  }

  const newName = newPlayerName.value.trim()
  
  // Vérifier si un joueur avec ce nom existe déjà (validation côté client)
  const existingPlayer = players.value.find(player => player.name.toLowerCase() === newName.toLowerCase())
  if (existingPlayer) {
    console.log('❌ Nom déjà existant:', existingPlayer)
    newPlayerNameError.value = `Une personne nommée "${newName}" existe déjà dans cette saison.`
    return
  }

  try {
    const newId = await addPlayer(newName, seasonId.value, newPlayerGender.value)
    
    // Recharger les données
    const [newPlayers, newSelections] = await Promise.all([
      loadPlayers(seasonId.value),
      loadCasts(seasonId.value)
    ])
    
    // Charger les disponibilités avec les nouveaux joueurs
    const newAvailabilityData = await loadAvailability(newPlayers, events.value, seasonId.value)
    
    // Mettre à jour les données
    players.value = newPlayers
    availability.value = newAvailabilityData
    casts.value = newSelections
      
    // Recharger l'état de protection des joueurs
    loadProtectedPlayers()
    
    // Trouver le nouveau joueur et le mettre en évidence
    const newPlayer = players.value.find(p => p.id === newId)
    if (newPlayer) {
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
    }

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
    
    newPlayerForm.value = false
    newPlayerName.value = ''
    newPlayerGender.value = 'non-specified'
    newPlayerNameError.value = ''
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erreur lors de l\'ajout du joueur:', error)
    alert('Erreur lors de l\'ajout de la personne. Veuillez réessayer.')
  }
}

function cancelEdit() {
  editingEvent.value = null
  editingTitle.value = ''
  editingDate.value = ''
  editingDescription.value = ''
  editingPlayerCount.value = 5
  editingRoles.value = { ...ROLE_TEMPLATES.cabaret.roles }
  editingShowAllRoles.value = false
}

const isHovered = ref(null)

const newEventForm = ref(false)
const newEventTitle = ref('')
const newEventDate = ref('')
const newEventDescription = ref('')
const newEventPlayerCount = ref(5)
const newEventArchived = ref(false)
const newEventRoles = ref({ ...ROLE_TEMPLATES.cabaret.roles })
const showAllRoles = ref(false)
const selectedRoleTemplate = ref('cabaret') // Type par défaut (premier de la liste)
const editingSelectedRoleTemplate = ref('cabaret') // Type par défaut pour l'édition
const showRoleInputs = ref(false) // Contrôler l'affichage des champs de saisie des rôles
const editingShowRoleInputs = ref(false) // Contrôler l'affichage des champs de saisie des rôles en édition

// Computed properties pour l'affichage des rôles
const visibleRoles = computed(() => {
  return ROLE_DISPLAY_ORDER.slice(0, 4) // Premiers 4 rôles (2 lignes de 2)
})

const hiddenRoles = computed(() => {
  return ROLE_DISPLAY_ORDER.slice(4) // Rôles restants
})

const totalTeamSize = computed(() => {
  return Object.values(newEventRoles.value).reduce((sum, count) => sum + count, 0)
})

const editingTotalTeamSize = computed(() => {
  return Object.values(editingRoles.value).reduce((sum, count) => sum + count, 0)
})

// Computed property pour vérifier que les constantes sont disponibles
const isRoleDataReady = computed(() => {
  const ready = ROLE_DISPLAY_ORDER && ROLE_DISPLAY_ORDER.length > 0 && 
                ROLE_LABELS && Object.keys(ROLE_LABELS).length > 0
  
  if (!ready) {
    logger.warn('🔍 Rôles non prêts:', {
      ROLE_DISPLAY_ORDER: ROLE_DISPLAY_ORDER,
      ROLE_LABELS: ROLE_LABELS,
      newEventRoles: newEventRoles.value
    })
  }
  
  return ready
})

// Calculer le total de l'équipe pour un événement existant
const selectedEventTotalTeamSize = computed(() => {
  if (!selectedEvent.value) return 0
  if (selectedEvent.value.roles) {
    // Si l'événement a des rôles définis, calculer le total
    return Object.values(selectedEvent.value.roles).reduce((sum, count) => sum + count, 0)
  } else {
    // Fallback vers l'ancien système (playerCount)
    return selectedEvent.value.playerCount || 6
  }
})

// Computed property pour les données de l'événement en cours d'édition
const editingEventData = computed(() => {
  // Retourner les données même si editingEvent.value est falsy
  // car les données peuvent être assignées avant que editingEvent.value soit défini
  return {
    title: editingTitle.value,
    date: editingDate.value,
    description: editingDescription.value,
    archived: editingArchived.value,
    roles: editingRoles.value,
    templateType: editingSelectedRoleTemplate.value
  }
})

// État pour afficher/masquer les détails des rôles
const showRoleDetails = ref(false)
const showRoleChances = ref(false)

// Fonction pour appliquer un type de rôles
function applyRoleTemplate(templateId) {
  selectedRoleTemplate.value = templateId
  const template = ROLE_TEMPLATES[templateId]
  
  // Appliquer les rôles du type
  Object.keys(newEventRoles.value).forEach(role => {
    newEventRoles.value[role] = template.roles[role] || 0
  })
}

// Fonction pour appliquer un type de rôles lors de l'édition
function applyRoleTemplateForEdit(templateId) {
  editingSelectedRoleTemplate.value = templateId
  const template = ROLE_TEMPLATES[templateId]
  
  // Appliquer les rôles du type
  Object.keys(editingRoles.value).forEach(role => {
    editingRoles.value[role] = template.roles[role] || 0
  })
}

// Fonction pour déterminer quel type correspond aux rôles actuels
// SUPPRIMÉE : On ne devine plus le type, on utilise le type sauvegardé ou 'autre' comme fallback

// Fonction pour obtenir l'icône du type d'événement
function getEventTypeIcon(event) {
  if (!event?.roles) {
    return '🎭' // Icône par défaut
  }
  const templateId = event.templateType || 'custom'
  return EVENT_TYPE_ICONS[templateId] || '❓'
}

// Fonction pour obtenir le nom du type d'événement
function getEventTypeName(event) {
  if (!event?.roles) {
    return 'Autre' // Nom par défaut
  }
  const templateId = event.templateType || 'custom'
  const template = ROLE_TEMPLATES[templateId]
  return template?.name || 'Autre'
}

// Fonction pour obtenir la couleur du compteur de rôle selon le détail événement
function getRoleCountColor(count) {
  if (count === 0) return 'text-blue-500' // Bleu pour 0
  if (count === 1) return 'text-purple-500' // Violet pour 1
  if (count === 2) return 'text-orange-500' // Orange pour 2
  if (count === 6) return 'text-cyan-400' // Cyan pour 6
  if (count === 15) return 'text-orange-500' // Orange pour 15
  if (count >= 10) return 'text-green-500' // Vert pour les grands effectifs
  if (count >= 5) return 'text-blue-400' // Bleu clair pour les effectifs moyens
  return 'text-pink-500' // Rose pour les autres
}

// Fonction pour annuler la création d'événement


async function createEvent() {
  if (!newEventTitle.value.trim() || !newEventDate.value) {
    alert('Veuillez remplir le titre et la date de l\'événement')
    return
  }

  // Calculer le total des rôles (peut être 0 pour les événements sans rôles)
  const totalRoles = Object.values(newEventRoles.value).reduce((sum, count) => sum + count, 0)
  const playerCount = newEventRoles.value[ROLES.PLAYER] || 0
  
  // Permettre les événements sans rôles, mais vérifier la cohérence si des rôles sont définis
  if (totalRoles > 0 && playerCount === 0) {
    alert('Il doit y avoir au moins un comédien dans l\'équipe si des rôles sont définis')
    return
  }

  const newEvent = {
    title: newEventTitle.value.trim(),
    date: newEventDate.value,
    description: newEventDescription.value.trim() || '',
    location: newEventLocation.value?.trim() || '',
    playerCount: playerCount, // Garder pour compatibilité avec l'ancien système
    roles: newEventRoles.value, // Nouveau champ pour les rôles
    templateType: selectedRoleTemplate.value, // Ajouter le type de template
    archived: !!newEventArchived.value
  }

  // Créer l'événement directement après validation du PIN
  await createEventProtected(newEvent)
}

// Nouvelle fonction pour gérer la création via EventModal
async function handleCreateEvent(eventData) {
  // Calculer le total des rôles (peut être 0 pour les événements sans rôles)
  const totalRoles = Object.values(eventData.roles).reduce((sum, count) => sum + count, 0)
  const playerCount = eventData.roles[ROLES.PLAYER] || 0
  
  // Permettre les événements sans rôles, mais vérifier la cohérence si des rôles sont définis
  if (totalRoles > 0 && playerCount === 0) {
    alert('Il doit y avoir au moins un comédien dans l\'équipe si des rôles sont définis')
    return
  }

  const newEvent = {
    title: eventData.title.trim(),
    date: eventData.date,
    description: eventData.description.trim() || '',
    location: eventData.location?.trim() || '',
    playerCount: playerCount, // Garder pour compatibilité avec l'ancien système
    roles: eventData.roles, // Nouveau champ pour les rôles
    templateType: eventData.templateType, // Ajouter le type de template
    archived: !!eventData.archived
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
    
    // Réinitialiser le formulaire
    newEventTitle.value = ''
    newEventDate.value = ''
    newEventDescription.value = ''
    newEventPlayerCount.value = 5
    newEventArchived.value = false
    newEventRoles.value = { ...ROLE_TEMPLATES.cabaret.roles }
    showAllRoles.value = false
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
    console.error('Erreur lors de la création de l\'événement:', error)
    alert('Erreur lors de la création de l\'événement. Veuillez réessayer.')
  }
}

function cancelNewEvent() {
  newEventTitle.value = ''
  newEventDate.value = ''
  newEventDescription.value = ''
  newEventPlayerCount.value = 6
  newEventRoles.value = {
    [ROLES.PLAYER]: 6,
    [ROLES.DJ]: 1,
    [ROLES.MC]: 1,
    [ROLES.VOLUNTEER]: 5,
    [ROLES.REFEREE]: 1,
    [ROLES.ASSISTANT_REFEREE]: 2,
    [ROLES.LIGHTING]: 0,
    [ROLES.COACH]: 0,
    [ROLES.STAGE_MANAGER]: 1
  }
  showAllRoles.value = false
  newEventForm.value = false
}

// Nouvelle fonction pour demander le PIN avant d'ouvrir la modal
async function openNewEventForm() {
  try {
    logger.debug('🔍 GridBoard: openNewEventForm appelé')
    // Demander le PIN code avant d'ouvrir la modal de création
    await requirePin({
      type: 'addEvent',
      data: {}
    })
    logger.debug('✅ GridBoard: PIN validé, modal devrait s\'ouvrir')
  } catch (error) {
    logger.error('❌ GridBoard: Erreur dans openNewEventForm:', error)
    // En cas d'erreur, ne pas ouvrir la modal automatiquement
    // L'utilisateur devra réessayer ou la modal de PIN s'affichera
    logger.debug('🔄 GridBoard: Erreur lors de la vérification du PIN, modal non ouverte')
  }
}

const events = ref([])
const players = ref([])
const availability = ref({})
const casts = ref({})
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
watch(() => getFirebaseAuth()?.currentUser?.email, async (newEmail, oldEmail) => {
  if (newEmail !== oldEmail && seasonId.value) {
    logger.debug('🔄 Changement d\'état d\'authentification, rechargement des joueurs protégés')
    await loadProtectedPlayers()
    await updatePreferredPlayersSet()
  }
})

// Initialiser les données au montage
onMounted(async () => {
  // Détecter si on est sur mobile (simplifié)
  isMobile.value = window.innerWidth < 768
  
  // Démarrer la mesure de performance globale de la grille
  performanceService.start('grid_loading', {
    seasonSlug: props.slug,
    timestamp: new Date().toISOString()
  })

  try {
    // Le mode de stockage est maintenant géré par les variables d'environnement
    // setStorageMode(useFirebase ? 'firebase' : 'mock') // SUPPRIMÉ

    // Attendre que firestoreService soit initialisé
    logger.debug('⏳ Attente de l\'initialisation de firestoreService...')
    await performanceService.measureStep('firestore_init', async () => {
      await firestoreService.initialize()
    })
    logger.debug('✅ firestoreService initialisé')

    // Charger la saison par slug
    logger.debug('🔍 Recherche de la saison avec le slug:', props.slug)
    let seasons = []
    try {
      seasons = await performanceService.measureStep('season_lookup', async () => {
        return await firestoreService.queryDocuments('seasons', [
          firestoreService.where('slug', '==', props.slug)
        ])
      }, { seasonSlug: props.slug })
      logger.debug('🔍 Saisons trouvées:', seasons.length, seasons.map(s => ({ id: s.id, name: s.name, slug: s.slug })))
    } catch (error) {
      logger.error('❌ Erreur lors de la recherche de la saison:', error)
      throw error
    }
    
    if (seasons.length > 0) {
      const seasonDoc = seasons[0]
      seasonId.value = seasonDoc.id
      seasonName.value = seasonDoc.name
      seasonMeta.value = seasonDoc
      document.title = `Saison : ${seasonName.value}`
      logger.debug('✅ Saison chargée:', seasonDoc.name, 'ID:', seasonDoc.id)
      
      // Mémoriser cette saison comme dernière visitée
      rememberLastVisitedSeason(props.slug)
    } else {
      // Saison introuvable: rediriger vers la page des saisons
      logger.error('❌ Saison introuvable avec le slug:', props.slug)
      router.push('/seasons')
      return
    }

    // Charger les données de la saison
    if (seasonId.value) {
      // Étape 1: événements
      currentLoadingLabel.value = 'Chargement des événements de la saison'
      loadingProgress.value = 20
      events.value = await performanceService.measureStep('load_events', async () => {
        return await loadEvents(seasonId.value)
      }, { seasonId: seasonId.value, count: 'unknown' })

      // Étape 2: joueurs
      currentLoadingLabel.value = 'Chargement des joueurs'
      loadingProgress.value = 45
      players.value = await performanceService.measureStep('load_players', async () => {
        return await loadPlayers(seasonId.value)
      }, { seasonId: seasonId.value, count: 'unknown' })

      // Étape 3: disponibilités (le plus critique) - Chargement progressif intelligent
      currentLoadingLabel.value = 'Chargement des disponibilités'
      loadingProgress.value = 70
      
      // Marquer les données essentielles comme chargées (événements + joueurs + favoris)
      isEssentialDataLoaded.value = true
      
      // Jalon : Grille visible pour l'utilisateur
      performanceService.milestone('grid_loading', 'grid_visible', {
        playersCount: players.value.length,
        eventsCount: events.value.length,
        seasonId: seasonId.value,
        description: 'Grille visible avec événements et joueurs'
      })
      
      // Interrompre le loading principal et afficher la grille IMMÉDIATEMENT
      isLoadingGrid.value = false
      
      
      // Forcer le rendu immédiat pour mobile
      if (isMobile.value) {
        await nextTick()
        requestAnimationFrame(() => {
          // Force le re-render pour éviter la page blanche
          updateScrollHints()
        })
      }
      
      // Initialiser availability comme objet vide pour commencer l'affichage
      availability.value = {}
      
      // Lancer le chargement progressif en arrière-plan
      logger.debug('🚀 Lancement du chargement progressif en arrière-plan')
      loadAvailabilityProgressively(players.value, events.value, seasonId.value)
        .then(result => {
          logger.debug('✅ Chargement progressif terminé avec succès')
          // Mettre à jour availability quand tout est chargé
          availability.value = result
        })
        .catch(error => {
          logger.error('❌ Erreur lors du chargement progressif:', error)
        })

      // Étape 4: compositions (en arrière-plan)
      try {
        casts.value = await performanceService.measureStep('load_casts', async () => {
          return await loadCasts(seasonId.value)
        }, { seasonId: seasonId.value, count: 'unknown' })
      } catch (error) {
        logger.debug('🔍 Collection casts non trouvée ou vide (normal pour une nouvelle saison)')
        casts.value = {}
      }

      // Étape 5: protections (en arrière-plan)
      try {
        const protections = await performanceService.measureStep('load_protections', async () => {
          return await listProtectedPlayers(seasonId.value)
        }, { seasonId: seasonId.value })
        const protSet = new Set()
        if (Array.isArray(protections)) {
          protections.forEach(p => { if (p.isProtected) protSet.add(p.playerId || p.id) })
        }
        protectedPlayers.value = protSet
      } catch (error) {
        logger.debug('🔍 Collection protections non trouvée ou vide (normal pour une nouvelle saison)')
        protectedPlayers.value = new Set()
      }
      
      // Initialiser les joueurs préférés si l'utilisateur est connecté (déjà fait dans l'étape 3)
      if (getFirebaseAuth()?.currentUser?.email) {
        try {
          // Charger les favoris en parallèle avec les autres données
          const favoritesPromise = performanceService.measureStep('load_favorites', async () => {
            await updatePreferredPlayersSet()
          }, { seasonId: seasonId.value })
          
          // Ne pas attendre les favoris pour afficher la grille
          favoritesPromise.catch(error => {
            logger.debug('🔍 Erreur lors du chargement des favoris (normal pour une nouvelle saison):', error.message)
          })
        } catch (error) {
          logger.debug('🔍 Erreur lors du chargement des favoris (normal pour une nouvelle saison):', error.message)
        }
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
    
    // Mesurer les calculs lourds
    scheduleIdle(() => { 
      performanceService.measureStep('heavy_calculations', () => {
        updateAllStats()
        updateAllChances()
      }, { 
        playersCount: players.value.length, 
        eventsCount: events.value.length 
      })
    })
    
    // Logs allégés
    // eslint-disable-next-line no-console
    // Données chargées

    // init scroll hints
    await nextTick()

  // Terminer la mesure de performance globale de la grille
  const totalGridLoadingTime = performanceService.end('grid_loading', {
    playersCount: players.value.length,
    eventsCount: events.value.length,
    seasonId: seasonId.value
  })
  
  // Afficher le résumé des performances dans la console
  logger.info(`🚀 Grille chargée en ${totalGridLoadingTime.toFixed(2)}ms (${players.value.length} joueurs, ${events.value.length} événements)`)
  performanceService.logSummary()
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
    // Forcer le rechargement des compositions pour cet événement
    await loadCasts(seasonId.value)
    // Mettre à jour les compositions locales
    casts.value = await loadCasts(seasonId.value)
    console.debug('✅ Compositions rechargées après magic link')
    // Nettoyer l'URL
    router.replace({ query: { ...route.query, a: undefined, eid: undefined } })
  }

  // Gérer le paramètre notificationSuccess (APRÈS tous les autres traitements d'URL)
  // Essayer d'abord route.query, puis fallback sur window.location.search
  let notificationSuccess = route.query.notificationSuccess
  let email = route.query.email
  let playerName = route.query.playerName
  let eventId = route.query.eventId
  
  // Si route.query est vide, essayer window.location.search
  if (!notificationSuccess && !email && !playerName && !eventId) {
    const urlParams = new URLSearchParams(window.location.search)
    notificationSuccess = urlParams.get('notificationSuccess')
    email = urlParams.get('email')
    playerName = urlParams.get('playerName')
    eventId = urlParams.get('eventId')
  }
  
  console.debug('🔍 Vérification des paramètres notificationSuccess...', {
    routeQuery: route.query,
    windowLocationSearch: window.location.search,
    notificationSuccess,
    email,
    playerName,
    eventId
  })
  
  if (notificationSuccess === '1') {
    console.debug('✅ Paramètres notificationSuccess détectés')
    
    // Fermer d'abord la modal de prompt des notifications si elle est ouverte
    if (showNotificationPrompt.value) {
      showNotificationPrompt.value = false
      console.debug('🔒 Fermeture de NotificationPromptModal avant affichage de NotificationSuccessModal')
    }
    
    notificationSuccessData.value = {
      email: decodeURIComponent(email || ''),
      playerName: decodeURIComponent(playerName || ''),
      eventId: eventId || null
    }
    
    console.debug('📝 Données de notificationSuccess préparées:', notificationSuccessData.value)
    
    // Délai pour s'assurer que la modal d'activation soit fermée et que l'interface soit prête
    setTimeout(() => {
      showNotificationSuccess.value = true
      console.debug('🎉 Ouverture de NotificationSuccessModal')
    }, 300)
    
    // Nettoyer l'URL en utilisant window.location.search comme source de vérité
    const urlParams = new URLSearchParams(window.location.search)
    urlParams.delete('notificationSuccess')
    urlParams.delete('email')
    urlParams.delete('playerName')
    urlParams.delete('eventId')
    
    const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '')
    window.history.replaceState({}, '', newUrl)
    
    console.debug('🧹 URL nettoyée:', newUrl)
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

// Watch for authentication state changes to update view mode
watch(() => currentUser.value?.email, (newEmail) => {
  logger.debug('Changement d\'état d\'authentification détecté:', newEmail ? 'connecté' : 'déconnecté')
  initializeViewMode()
}, { immediate: false })

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
    logger.debug('🔄 Tri des joueurs avec favoris en premier')
    const favoritesFirst = base.filter(p => preferredPlayerIdsSet.value.has(p.id))
    const rest = base.filter(p => !preferredPlayerIdsSet.value.has(p.id))
    
    // Trier les favoris par ordre alphabétique
    const sortedFavorites = favoritesFirst.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' }))
    
    logger.debug('⭐ Favoris en premier:', sortedFavorites.map(p => p.name))
    logger.debug('📝 Reste des joueurs:', rest.map(p => p.name))
    
    return [...sortedFavorites, ...rest]
  }
  
  return base
})

// Exposer l'ensemble des joueurs préférés pour la surbrillance légère
const preferredPlayerIdsSet = ref(new Set())

// Fonctions utilitaires pour le chargement progressif
function isPlayerAvailabilityLoaded(playerId) {
  return playerLoadingStates.value.get(playerId) === 'loaded'
}

function getPlayerLoadingState(playerId) {
  return playerLoadingStates.value.get(playerId) || 'loading'
}

function isPlayerLoading(playerId) {
  return playerLoadingStates.value.get(playerId) === 'loading'
}

function isPlayerError(playerId) {
  return playerLoadingStates.value.get(playerId) === 'error'
}

// Fonction pour charger les disponibilités d'un joueur individuellement
async function loadPlayerAvailability(player, seasonId) {
  try {
    const playerAvailabilityDocs = await firestoreService.getDocuments('seasons', seasonId, 'players', player.id, 'availability')
    const playerAvailability = {}
    playerAvailabilityDocs.forEach(doc => {
      const { id, ...data } = doc
      playerAvailability[id] = data
    })
    
    // Mettre à jour l'état de chargement
    playerLoadingStates.value.set(player.id, 'loaded')
    loadedPlayersCount.value++
    
    logger.debug(`✅ Joueur "${player.name}" chargé: ${Object.keys(playerAvailability).length} disponibilités`)
    
    return playerAvailability
  } catch (error) {
    logger.debug(`⏱️ Joueur "${player.name}": erreur lors du chargement (${error.message})`)
    playerLoadingStates.value.set(player.id, 'error')
    loadedPlayersCount.value++
    return {}
  }
}

// Fonction de chargement progressif intelligent avec mise à jour en temps réel
async function loadAvailabilityProgressively(players, events, seasonId) {
  logger.debug('🚀 APPEL de loadAvailabilityProgressively - Début')
  return await performanceService.measureStep('load_availability_progressive', async () => {
    logger.debug('🚀 DANS performanceService.measureStep - Début du chargement progressif des disponibilités')
    isProgressiveLoading.value = true
    totalPlayersCount.value = players.length
    loadedPlayersCount.value = 0
    
    // Initialiser tous les joueurs comme "loading"
    players.forEach(player => {
      playerLoadingStates.value.set(player.id, 'loading')
    })
    
    logger.debug(`📊 Initialisation: ${players.length} joueurs, ${events.length} événements`)
  
  try {
    logger.debug('🚀 PHASE 1: Recherche du joueur connecté')
    // Phase 1: Charger le joueur connecté en priorité absolue
    const currentPlayer = currentUser.value?.email 
      ? players.find(p => p.email === currentUser.value.email)
      : null
    
    if (currentPlayer) {
      logger.debug(`🚀 Chargement prioritaire du joueur connecté: ${currentPlayer.name}`)
      
      const playerAvailability = await loadPlayerAvailability(currentPlayer, seasonId)
      
      // Mettre à jour availability immédiatement pour ce joueur
      availability.value[currentPlayer.name] = playerAvailability
      
      // Forcer la réactivité
      await nextTick()
      
      logger.debug(`✅ Joueur connecté chargé: ${Object.keys(playerAvailability).length} disponibilités`)
      
      // Jalon : Joueur connecté chargé
      performanceService.milestone('load_availability_progressive', 'current_player_loaded', {
        playerName: currentPlayer.name,
        description: 'Joueur connecté chargé en priorité'
      })
    } else {
      logger.debug('ℹ️ Aucun joueur connecté détecté')
    }
    
    logger.debug('🚀 PHASE 2: Recherche des joueurs favoris')
    // Phase 2: Charger les joueurs favoris (si connecté et différents du joueur courant)
    const favoritePlayers = currentUser.value?.email && preferredPlayerIdsSet.value.size > 0
      ? players.filter(p => preferredPlayerIdsSet.value.has(p.id) && p.email !== currentUser.value.email)
      : []
    
    if (favoritePlayers.length > 0) {
      logger.debug(`⭐ Chargement prioritaire des ${favoritePlayers.length} joueurs favoris`)
      
      for (const player of favoritePlayers) {
        const playerAvailability = await loadPlayerAvailability(player, seasonId)
        
        // Mettre à jour availability immédiatement pour ce joueur
        availability.value[player.name] = playerAvailability
        
        // Forcer la réactivité
        await nextTick()
      }
      
      logger.debug(`✅ Joueurs favoris chargés: ${favoritePlayers.length} joueurs`)
      
      // Jalon : Joueurs favoris chargés
      performanceService.milestone('load_availability_progressive', 'favorites_loaded', {
        favoritesCount: favoritePlayers.length,
        description: 'Joueurs favoris chargés'
      })
    } else {
      logger.debug('ℹ️ Aucun joueur favori à charger')
    }
    
    logger.debug('🚀 PHASE 3: Chargement des autres joueurs')
    // Phase 3: Charger les autres joueurs par petits batches
    const remainingPlayers = players.filter(p => {
      // Exclure le joueur connecté et les favoris déjà chargés
      const isCurrentPlayer = currentUser.value?.email && p.email === currentUser.value.email
      const isFavorite = preferredPlayerIdsSet.value.has(p.id)
      return !isCurrentPlayer && !isFavorite
    })
    const batchSize = 3 // Charger 3 joueurs à la fois
    const totalBatches = Math.ceil(remainingPlayers.length / batchSize)
    
    logger.debug(`📦 Chargement des autres joueurs: ${remainingPlayers.length} joueurs en ${totalBatches} batches`)
    
    for (let i = 0; i < totalBatches; i++) {
      const batch = remainingPlayers.slice(i * batchSize, (i + 1) * batchSize)
      
      logger.debug(`📦 Chargement du batch ${i + 1}/${totalBatches} (${batch.length} joueurs)`)
      
      // Charger le batch en parallèle mais mettre à jour availability au fur et à mesure
      const batchPromises = batch.map(async (player) => {
        const playerAvailability = await loadPlayerAvailability(player, seasonId)
        
        // Mettre à jour availability immédiatement pour ce joueur
        availability.value[player.name] = playerAvailability
        
        // Forcer la réactivité
        await nextTick()
      })
      
      await Promise.all(batchPromises)
      
      // Mettre à jour la progression
      availabilityLoadingProgress.value = Math.round((loadedPlayersCount.value / totalPlayersCount.value) * 100)
      
      logger.debug(`✅ Batch ${i + 1} terminé: ${loadedPlayersCount.value}/${totalPlayersCount.value} joueurs chargés`)
      
      // Petite pause pour laisser l'UI respirer
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    logger.info(`✅ Chargement progressif terminé: ${loadedPlayersCount.value}/${totalPlayersCount.value} joueurs chargés`)
    
  } catch (error) {
    logger.error('❌ Erreur lors du chargement progressif:', error)
    
    // Jalon : Erreur de chargement
    performanceService.milestone('load_availability_progressive', 'availability_error', {
      error: error.message,
      loadedPlayersCount: loadedPlayersCount.value,
      description: 'Erreur lors du chargement des disponibilités'
    })
  } finally {
    isProgressiveLoading.value = false
  }
  
  // Jalon : Chargement complet des disponibilités
  performanceService.milestone('load_availability_progressive', 'availability_complete', {
    loadedPlayersCount: loadedPlayersCount.value,
    totalPlayersCount: totalPlayersCount.value,
    description: 'Toutes les disponibilités chargées'
  })
  
  // Retourner availability.value pour compatibilité
  logger.debug('🚀 FIN de loadAvailabilityProgressively - Retour de availability.value')
  return availability.value
  }, { 
    seasonId: seasonId, 
    playersCount: players.length, 
    eventsCount: events.length 
  })
}

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
      logger.debug('✅ Favoris chargés depuis Firebase:', playerIds)
    } else {
      preferredPlayerIdsSet.value = new Set()
      logger.debug('ℹ️ Aucun favori trouvé pour cette saison')
      
      // Si on vient de vérifier un email et qu'on n'a pas trouvé de favoris,
      // réessayer après un délai (problème de propagation Firestore)
      if (localStorage.getItem('protectionActivated') === 'true') {
        logger.debug('🔄 Retry après 1s pour la propagation Firestore...')
        setTimeout(async () => {
          try {
            const retryAssocs = await listAssociationsForEmail(currentUser.value.email)
            const retrySeasonal = retryAssocs.filter(a => a.seasonId === seasonId.value)
            if (retrySeasonal.length > 0) {
              const retryPlayerIds = retrySeasonal.map(a => a.playerId)
              preferredPlayerIdsSet.value = new Set(retryPlayerIds)
              logger.debug('✅ Favoris trouvés au retry:', retryPlayerIds)
            }
          } catch (retryError) {
            logger.warn('❌ Erreur lors du retry:', retryError)
          }
        }, 1000)
      }
    }
  } catch (error) {
    logger.error('❌ Erreur lors du chargement des favoris:', error)
    preferredPlayerIdsSet.value = new Set()
  }
}

// Fonction helper pour vérifier si l'utilisateur est connecté (y compris les utilisateurs anonymes avec email)
function isUserConnected() {
      return !!getFirebaseAuth()?.currentUser?.email || !!localStorage.getItem('userEmail')
}

// Fonction helper pour vérifier si un joueur appartient à l'utilisateur connecté
async function isPlayerOwnedByCurrentUser(playerId) {
  // Si pas d'utilisateur connecté, retourner false
  if (!currentUser.value?.email) return false
  
  try {
    // Vérifier directement si ce joueur est protégé par l'utilisateur connecté
    const { getPlayerProtectionData } = await import('../services/playerProtection.js')
    const protectionData = await getPlayerProtectionData(playerId, seasonId.value)
    
    // Le joueur appartient à l'utilisateur si :
    // 1. Il est protégé
    // 2. L'email de protection correspond à l'email de l'utilisateur connecté
    return protectionData?.isProtected && protectionData?.email === currentUser.value.email
  } catch (error) {
    logger.warn('Erreur lors de la vérification de propriété du joueur:', error)
    return false
  }
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
const showPast = ref(false)
const showFiltersDropdown = ref(false)

const displayedEvents = computed(() => {
  const list = sortedEvents.value
  return list.filter(e => {
    const eventDate = toDateObject(e.date)
    const isArchived = !!e.archived
    const isPast = eventDate && eventDate < new Date()
    
    // Si les deux filtres sont cochés, afficher tout
    if (showArchived.value && showPast.value) {
      return true
    }
    // Si seulement Archivés est coché, afficher les archivés
    else if (showArchived.value) {
      return isArchived
    }
    // Si seulement Passés est coché, afficher les passés
    else if (showPast.value) {
      return isPast
    }
    // Par défaut (aucun coché) : afficher ni archivés ni passés
    else {
      return !isArchived && !isPast
    }
  })
})

function toggleFiltersDropdown() {
  showFiltersDropdown.value = !showFiltersDropdown.value
}

// Computed properties pour l'affichage inversé
const displayRows = computed(() => {
  return currentViewMode.value === 'inverted' ? displayedEvents.value : sortedPlayers.value
})

const displayColumns = computed(() => {
  return currentViewMode.value === 'inverted' ? sortedPlayers.value : displayedEvents.value
})

// Positionnement simple du dropdown des filtres (plus de calcul dynamique)

// Fermer le dropdown si on clique ailleurs
function closeFiltersDropdown() {
  showFiltersDropdown.value = false
}

// Gérer le clic en dehors du dropdown
onMounted(() => {
  document.addEventListener('click', (event) => {
    const filtersButton = document.querySelector('[data-filters-button]')
    const filtersDropdown = document.querySelector('[data-filters-dropdown]')
    
    if (filtersButton && !filtersButton.contains(event.target) && 
        filtersDropdown && !filtersDropdown.contains(event.target)) {
      closeFiltersDropdown()
    }
  })
})



  // Avertissements pour l'événement compositionné
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
  
  // Vérifier si le joueur est compositionné ET la composition est confirmée par l'organisateur
  const playerIsSelected = isSelected(playerName, eventId)
  const playerIsAvailable = isAvailable(playerName, eventId)
  const playerSelectionConfirmedByOrganizer = isSelectionConfirmedByOrganizer(eventId)
  
  if (playerIsSelected && playerIsAvailable === true && playerSelectionConfirmedByOrganizer) {
    // Cycle de confirmation : pending → confirmed → declined → pending
    if (isProtected) {
      // Joueur protégé : toujours ouvrir la modale en lecture seule
      await openAvailabilityModalForPlayer(player, eventItem);
      return;
    } else {
      // Joueur non protégé, basculer directement le statut
      const currentStatus = getPlayerSelectionStatus(playerName, eventId)
      const nextStatus = getNextSelectionStatus(currentStatus)
      await handlePlayerSelectionStatusToggle(playerName, eventId, nextStatus, seasonId.value)
      return
    }
  }

  // Sinon, gérer la disponibilité normale
  if (isProtected) {
    // Joueur protégé : toujours ouvrir la modale en lecture seule
    openAvailabilityModalForPlayer(player, eventItem);
    return;
  } else {
    // Joueur non protégé, ouvrir directement la modale
    await openAvailabilityModalForPlayer(player, eventItem);
  }
}

async function openAvailabilityModalForPlayer(player, eventItem) {
  const currentAvailabilityData = getAvailabilityData(player.name, eventItem.id)
  const playerChancePercent = chances.value[player.name]?.[eventItem.id] ?? null
  const isProtected = isPlayerProtectedInGrid(player.id)
  const isOwnedByCurrentUser = await isPlayerOwnedByCurrentUser(player.id)
  
  // Si c'est le joueur de l'utilisateur connecté, ouvrir directement en mode édition
  // Sinon, suivre la logique de protection normale
  const shouldBeReadOnly = isProtected && !isOwnedByCurrentUser
  
  openAvailabilityModal({
    playerName: player.name,
    playerId: player.id,
    playerGender: player.gender || 'non-specified',
    eventId: eventItem.id,
    eventTitle: eventItem.title,
    eventDate: eventItem.date,
    availabilityData: currentAvailabilityData,
    isReadOnly: shouldBeReadOnly,
    chancePercent: playerChancePercent,
    isProtected: isProtected
  })
}

// Fonction performToggleAvailability supprimée - toutes les disponibilités passent maintenant par la modale

// Fonction pour gérer le changement de statut individuel d'un joueur dans une composition
async function handlePlayerSelectionStatusToggle(playerName, eventId, newStatus, seasonId) {
  try {
    // Convertir le nom du joueur en ID
    const { loadPlayers } = await import('../services/storage.js')
    const allPlayers = await loadPlayers(seasonId)
    const player = allPlayers.find(p => p.name === playerName)
    
    if (!player) {
      throw new Error(`Joueur non trouvé: ${playerName}`)
    }
    
    // Mettre à jour le statut dans le stockage avec l'ID
    const { updatePlayerCastStatus } = await import('../services/storage.js')
    const result = await updatePlayerCastStatus(eventId, player.id, newStatus, seasonId)
    
    // Logger l'audit de confirmation de participation
    try {
      const { logPlayerStatusChange } = await import('../services/selectionAuditService.js')
      const event = events.value.find(e => e.id === eventId)
      const oldStatus = getPlayerSelectionStatus(playerName, eventId)
      
      await logPlayerStatusChange({
        playerName,
        eventId,
        eventTitle: event?.title || 'Unknown',
        seasonSlug,
        oldStatus,
        newStatus,
        source: 'event_modal'
      })
    } catch (auditError) {
      console.warn('Erreur audit playerCastStatus:', auditError)
    }
    
    // Recharger les compositions depuis la base pour avoir les données à jour avec le statut recalculé
    const { loadCasts } = await import('../services/storage.js')
    const updatedSelections = await loadCasts(seasonId)
    casts.value = updatedSelections
    
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
  const selection = casts.value[eventId]
  if (!selection || !selection.playerStatuses) return []
  
  return Object.entries(selection.playerStatuses)
    .filter(([playerName, status]) => status === 'declined')
    .map(([playerName]) => playerName)
}

// Fonction helper pour obtenir le prochain statut de confirmation
function getNextSelectionStatus(currentStatus) {
  switch (currentStatus) {
    case 'pending':
      return 'confirmed'
    case 'confirmed':
      return 'declined'
    case 'declined':
      return 'pending'
    default:
      return 'pending'
  }
}

function isAvailable(player, eventId) {
  // Utiliser getAvailabilityData pour avoir les données complètes (disponibilité + sélection)
  const availabilityData = getAvailabilityData(player, eventId)
  return availabilityData.available
}

// Nouvelle fonction pour vérifier si un joueur est disponible pour le rôle "Joueur"
function isAvailableForPlayerRole(player, eventId) {
  const availabilityData = availability.value[player]?.[eventId]
  
  // Gestion du nouveau format avec rôles
  if (availabilityData && typeof availabilityData === 'object' && availabilityData.available !== undefined) {
    // Le joueur doit être disponible ET avoir le rôle "Joueur"
    return availabilityData.available && availabilityData.roles && availabilityData.roles.includes('player')
  }
  
  // Fallback pour l'ancien format (boolean direct)
  // Dans l'ancien format, true signifiait "disponible en tant que joueur"
  return availabilityData === true
}

// Fonction pour vérifier si un joueur est disponible pour un rôle spécifique
function isAvailableForRole(playerName, role, eventId) {
  const availabilityData = availability.value[playerName]?.[eventId]
  
  // Gestion du nouveau format avec rôles
  if (availabilityData && typeof availabilityData === 'object' && availabilityData.available !== undefined) {
    // Le joueur doit être disponible ET avoir le rôle demandé
    if (availabilityData.available && availabilityData.roles) {
      // Vérifier si le joueur a le rôle spécifique demandé
      if (availabilityData.roles.includes(role)) {
        return true
      }
      // Vérifier si le joueur est disponible "en général" (pas de rôles spécifiques)
      if (availabilityData.roles.length === 0) {
        return true
      }
    }
    return false
  }
  
  // Fallback pour l'ancien format (boolean direct)
  // Dans l'ancien format, true signifiait "disponible en tant que joueur"
  // Donc on ne peut vérifier que pour le rôle "player"
  if (role === 'player') {
    return availabilityData === true
  }
  
  // Pour les autres rôles, on ne peut pas vérifier dans l'ancien format
  return false
}

function getAvailabilityData(player, eventId) {
  const availabilityData = availability.value[player]?.[eventId]
  
  // Vérifier s'il y a une sélection ET si elle est validée par l'organisateur
  const selectionRole = getPlayerSelectionRole(player, eventId)
  const cast = casts.value[eventId]
  const isSelectionValidated = cast ? isSelectionConfirmedByOrganizer(eventId) : false
  
  if (selectionRole && isSelectionValidated) {
    const selectionStatus = getPlayerSelectionStatus(player, eventId)
    return {
      available: true, // Toujours disponible s'il est dans une sélection validée
      roles: [selectionRole],
      comment: availabilityData?.comment || null,
      isSelectionDisplay: true,
      selectionStatus: selectionStatus
    }
  }
  
  // Pas de sélection, afficher la disponibilité normale
  if (availabilityData && typeof availabilityData === 'object' && availabilityData.available !== undefined) {
    return {
      ...availabilityData,
      isSelectionDisplay: false
    }
  }
  
  // Fallback pour l'ancien format (boolean direct)
  if (availabilityData === true) {
    return {
      available: true,
      roles: ['player'],
      comment: null,
      isSelectionDisplay: false
    }
  } else if (availabilityData === false) {
    return {
      available: false,
      roles: [],
      comment: null,
      isSelectionDisplay: false
    }
  } else {
    // Pas de disponibilité définie (undefined/null)
    return {
      available: undefined,
      roles: [],
      comment: null,
      isSelectionDisplay: false
    }
  }
}

function isSelected(player, eventId) {
  const selection = casts.value[eventId]
  if (!selection || !selection.roles) {
    return false
  }
  
  // Trouver l'ID du joueur
  const playerObj = players.value.find(p => p.name === player)
  if (!playerObj) {
    return false
  }
  
  // Vérifier si le joueur est dans un des rôles
  for (const rolePlayers of Object.values(selection.roles)) {
    if (Array.isArray(rolePlayers) && rolePlayers.includes(playerObj.id)) {
      return true
    }
  }
  
  return false
}

async function drawMultiRoles(eventId) {
  logger.debug('🎲 drawMultiRoles appelé:', { eventId })
  const event = events.value.find(e => e.id === eventId)
  
  if (!event) {
    logger.error('❌ Événement non trouvé:', eventId)
    return
  }
  
  // Récupérer les rôles attendus pour cet événement
  const roles = event.roles || { player: event.playerCount || 6 }
  logger.debug('📅 Événement trouvé:', { eventTitle: event.title, roles })
  
  // Récupérer la composition actuelle
  const currentSelection = casts.value[eventId]
  logger.debug('👥 Composition actuelle:', currentSelection)
  
  // Nouvelle structure de composition par rôle
  const newSelections = {}
  
  // Pour chaque rôle dans l'ordre de priorité (rôles critiques en premier)
  for (const role of ROLE_PRIORITY_ORDER) {
    const requiredCount = roles[role] || 0
    
    if (requiredCount > 0) {
      logger.debug(`🎭 Draw pour le rôle ${role}: ${requiredCount} personnes`)
      
      // Récupérer les joueurs déjà compositionnés pour ce rôle
      const currentRoleSelection = currentSelection?.roles?.[role] || []
      
      // Récupérer TOUS les joueurs déjà compositionnés pour TOUS les rôles
      const allAlreadySelected = Object.values(newSelections).flat().filter(Boolean)
      
      // Déterminer si on refait un tirage complet ou si on complète
      const isRoleComplete = currentRoleSelection.length >= requiredCount
      
      if (isRoleComplete) {
        // Draw complet pour ce rôle - exclure les joueurs déjà sélectionnés pour les autres rôles
        // Convertir les IDs en noms pour la compatibilité avec drawForRole
        const allAlreadySelectedNames = allAlreadySelected.map(playerId => {
          const player = players.value.find(p => p.id === playerId)
          return player ? player.name : playerId
        })
        newSelections[role] = await drawForRole(role, requiredCount, eventId, allAlreadySelectedNames)
      } else {
        // Garder les joueurs existants et compléter
        const remainingSlots = requiredCount - currentRoleSelection.length
        if (remainingSlots > 0) {
          // Combiner les joueurs gardés et les nouveaux
          // Convertir les IDs en noms pour la compatibilité avec drawForRole
          const currentRoleSelectionNames = currentRoleSelection.map(playerId => {
            const player = players.value.find(p => p.id === playerId)
            return player ? player.name : playerId
          })
          const allAlreadySelectedNames = allAlreadySelected.map(playerId => {
            const player = players.value.find(p => p.id === playerId)
            return player ? player.name : playerId
          })
          const newPlayers = await drawForRole(role, remainingSlots, eventId, [...currentRoleSelectionNames, ...allAlreadySelectedNames])
          newSelections[role] = [...currentRoleSelection, ...newPlayers]
        } else {
          newSelections[role] = [...currentRoleSelection]
        }
      }
    }
  }
  
  // Sauvegarder la nouvelle composition
  const allPlayers = Object.values(newSelections).flat().filter(Boolean)
  casts.value[eventId] = {
    // Ancien format (rétrocompatible)
    players: allPlayers,
    
    // Nouveau format (par rôle)
    roles: newSelections,
    
    confirmed: false,
    confirmedAt: null,
    updatedAt: new Date()
  }
  
  logger.debug('💾 Nouvelle composition sauvegardée:', casts.value[eventId])
  logger.debug('👥 Nombre total de joueurs:', allPlayers.length)
  logger.debug('🎭 Rôles et joueurs:', newSelections)
  
  // Sauvegarder en base
  await saveCast(eventId, newSelections, seasonId.value)
  
  updateAllStats()
  updateAllChances()
}

// Fonction pour compléter uniquement les slots vides d'une composition
async function completeCastSlots(eventId) {
  logger.debug('🔧 completeCastSlots appelé:', { eventId })
  
  const event = events.value.find(e => e.id === eventId)
  if (!event) {
    throw new Error('Événement non trouvé')
  }
  
  const currentSelection = casts.value[eventId]
  if (!currentSelection) {
    throw new Error('Aucune composition trouvée')
  }
  
  // Récupérer les rôles requis
  const roles = event.roles || { player: event.playerCount || 6 }
  
  // Construire la nouvelle composition en gardant les joueurs existants et en complétant les vides
  const newSelections = {}
  
  for (const role of ROLE_DISPLAY_ORDER) {
    const requiredCount = roles[role] || 0
    
    if (requiredCount > 0) {
      // Récupérer les joueurs déjà compositionnés pour ce rôle
      const currentRoleSelection = currentSelection.roles?.[role] || []
      
      // Récupérer TOUS les joueurs déjà compositionnés pour TOUS les rôles (depuis la composition actuelle)
      // Convertir les IDs en noms pour la compatibilité avec drawForRole
      const allAlreadySelectedIds = Object.values(currentSelection.roles || {}).flat().filter(Boolean)
      const allAlreadySelected = allAlreadySelectedIds.map(playerId => {
        const player = players.value.find(p => p.id === playerId)
        return player ? player.name : playerId // Fallback sur l'ID si nom non trouvé
      })
      
      // Compléter seulement les slots vraiment vides (null/undefined)
      const filledSlots = currentRoleSelection.filter(player => player != null)
      const remainingSlots = requiredCount - filledSlots.length
      
      if (remainingSlots > 0) {
        // Convertir les slots remplis en noms pour la compatibilité avec drawForRole
        const filledSlotsNames = filledSlots.map(playerId => {
          const player = players.value.find(p => p.id === playerId)
          return player ? player.name : playerId // Fallback sur l'ID si nom non trouvé
        })
        
        // Tirage pour les slots manquants uniquement
        const newPlayerIds = await drawForRole(role, remainingSlots, eventId, [...filledSlotsNames, ...allAlreadySelected])
        newSelections[role] = [...filledSlots, ...newPlayerIds]
      } else {
        // Rôle déjà complet
        newSelections[role] = [...currentRoleSelection]
      }
    }
  }
  
  // Calculer le nombre total de joueurs pour les logs
  const allPlayers = Object.values(newSelections).flat().filter(Boolean)
  
  // Sauvegarder en base avec recalcul du statut
  await saveCast(eventId, newSelections, seasonId.value, { 
    preserveConfirmed: true
  })
  
  // Logger l'audit de complétion de composition
  try {
    const { logCastCompletion } = await import('../services/selectionAuditService.js')
    const event = events.value.find(e => e.id === eventId)
    
    // Trouver le joueur ajouté (comparer avec l'ancienne composition)
    const oldPlayerIds = Object.values(currentSelection.roles || {}).flat().filter(Boolean)
    const newPlayerIds = allPlayers
    const addedPlayerId = newPlayerIds.find(playerId => !oldPlayerIds.includes(playerId))
    
    if (addedPlayerId) {
      // Trouver le rôle du joueur ajouté
      const addedPlayerRole = Object.entries(newSelections).find(([role, playerIds]) => 
        playerIds.includes(addedPlayerId)
      )?.[0] || 'player'
      
      // Convertir l'ID en nom pour le logging
      const addedPlayer = players.value.find(p => p.id === addedPlayerId)
      const addedPlayerName = addedPlayer ? addedPlayer.name : addedPlayerId
      
      await logCastCompletion({
        eventId,
        eventTitle: event?.title || 'Unknown',
        seasonSlug,
        addedPlayer: addedPlayerName,
        role: addedPlayerRole,
        source: 'selection_modal'
      })
    }
  } catch (auditError) {
    console.warn('Erreur audit complétion composition:', auditError)
  }
  
  // Recharger depuis la base pour avoir les données à jour
  const { loadCasts } = await import('../services/storage.js')
  const updatedSelections = await loadCasts(seasonId.value)
  casts.value = updatedSelections
  
  updateAllStats()
  updateAllChances()
}


// Fonction helper pour draw des joueurs pour un rôle spécifique
async function drawForRole(role, count, eventId, alreadySelected = []) {
  logger.debug(`🎭 drawForRole appelé:`, { role, count, eventId, alreadySelected })
  
  // Exclure les joueurs qui ont décliné cette composition
  const declinedPlayers = getDeclinedPlayers(eventId)
  
  // Filtrer les candidats disponibles pour ce rôle
  const candidates = players.value.filter(p => {
    // Vérifier la disponibilité pour ce rôle spécifique
    const isAvailableForThisRole = isAvailableForRole(p.name, role, eventId)
    const notDeclined = !declinedPlayers.includes(p.name)
    const notAlreadySelected = !alreadySelected.includes(p.name)
    // Exclure aussi les joueurs marqués comme indisponibles pour cet événement
    const isNotUnavailable = isAvailable(p.name, eventId) !== false
    
    return isAvailableForThisRole && notDeclined && notAlreadySelected && isNotUnavailable
  })
  
  if (candidates.length === 0) {
    logger.warn(`⚠️ Aucun candidat disponible pour le rôle ${role}`)
    return []
  }
  
  // Draw pondéré : moins compositionné = plus de chances
  const weightedCandidates = candidates.map(player => {
    const s = countSelections(player.name)
    return {
      name: player.name,
      weight: 1 / (1 + s) // poids inverse du nombre de compositions
    }
  })
  
  const draw = []
  const pool = [...weightedCandidates]
  
  while (draw.length < count && pool.length > 0) {
    const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0)
    let r = Math.random() * totalWeight
    
    const chosenIndex = pool.findIndex(p => {
      r -= p.weight
      return r <= 0
    })
    
    if (chosenIndex >= 0) {
      draw.push(pool[chosenIndex].name)
      pool.splice(chosenIndex, 1)
    }
  }
  
  logger.debug(`✅ Draw pour le rôle ${role}:`, draw)
  
  // Convertir les noms en IDs pour la nouvelle structure
  const drawWithIds = draw.map(playerName => {
    const player = players.value.find(p => p.name === playerName)
    return player ? player.id : playerName // Fallback sur le nom si ID non trouvé
  })
  
  return drawWithIds
}

async function drawProtected(eventId) {
  logger.debug('🛡️ drawProtected appelé:', { eventId })
  // Tirage protégé
  // État de la modal de composition avant
  
  // Sauvegarder l'état de la popin avant le tirage
  const wasSelectionModalOpen = showSelectionModal.value
  const selectionModalEventId = selectionModalEvent.value?.id
  
  // Vérifier si c'est une reselection avant de faire le draw
  const wasReselection = getSelectionPlayers(eventId).length > 0
  
  // Sauvegarder l'ancienne composition pour comparer
  const oldSelection = wasReselection ? [...getSelectionPlayers(eventId)] : []
  
  logger.debug('🎲 Appel de drawMultiRoles...')
  await drawMultiRoles(eventId)
  
  
  // État de la modal de composition après
  
  // S'assurer que la popin de composition reste ouverte si elle était ouverte
  if (wasSelectionModalOpen && !showSelectionModal.value) {
    // Restauration de la popin de composition
    showSelectionModal.value = true
    selectionModalEvent.value = events.value.find(e => e.id === selectionModalEventId)
  }
  
  // Mettre à jour les données de la popin de composition si elle est ouverte
  if (showSelectionModal.value && selectionModalEvent.value?.id === eventId) {
    // Popin de composition ouverte, mise à jour
    // Forcer la mise à jour des données
    await nextTick()
    
    // Afficher le message de succès dans la popin de composition
    if (selectionModalRef.value && selectionModalRef.value.showSuccess) {
      // Appel de showSuccess sur la popin de composition
      const newSelection = getSelectionPlayers(eventId)
      const keptPlayers = oldSelection.filter(player => newSelection.includes(player))
      const isPartialUpdate = keptPlayers.length > 0 && keptPlayers.length < oldSelection.length
      selectionModalRef.value.showSuccess(wasReselection, isPartialUpdate)
    } else {
      // showSuccess indisponible
    }
  } else {
    // Popin de composition fermée, affichage message global
    // Afficher un message de succès global si la popin n'est pas ouverte
    showSuccessMessage.value = true
    const event = events.value.find(e => e.id === eventId)
    const selectedPlayers = getSelectionPlayers(eventId)
    
    if (wasReselection) {
      successMessage.value = 'Composition mise à jour avec succès !'
    } else {
      successMessage.value = 'Composition effectuée avec succès !'
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
  return Object.keys(casts.value).filter(eventId => {
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
  return players.value.filter(player => 
    isAvailableForPlayerRole(player.name, eventId)
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
  const availablePlayers = players.value.filter(p => isAvailableForPlayerRole(p.name, eventId))

  if (!availablePlayers.find(p => p.name === playerName)) return 0

  // Si count n'est pas fourni, utiliser le nombre de joueurs de l'événement
  if (count === null) {
    const event = events.value.find(e => e.id === eventId)
    count = event?.playerCount || 6
  }

  // Calcul du poids basé sur le nombre de compositions déjà faites
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
    const availablePlayers = players.value.filter(p => isAvailableForPlayerRole(p.name, event.id))
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
      type: 'launchCast',
      data: { eventId, count }
    })
  } else {
    // Demander le PIN code avant de lancer la composition
    await requirePin({
      type: 'launchCast',
      data: { eventId, count }
    })
  }
}

// Fonctions pour la protection par PIN
function getPinModalMessage() {
  if (!pendingOperation.value) return 'Veuillez saisir le code PIN à 4 chiffres'
  
  const messages = {
    deleteEvent: 'Suppression d\'événement - Code PIN requis',
    addEvent: 'Ajout d\'événement - Code PIN requis',
    editEvent: 'Modification d\'événement - Code PIN requis',
    deletePlayer: 'Suppression de joueur - Code PIN requis',
    launchCast: 'Lancement de composition - Code PIN requis',
    toggleArchive: 'Archivage d\'événement - Code PIN requis',
    updateCast: 'Mise à jour de composition - Code PIN requis',
    resetCast: 'Réinitialisation de composition - Code PIN requis',
    unconfirmCast: 'Déverrouillage de composition - Code PIN requis',
    completeCast: 'Complétion de composition - Code PIN requis'
  }
  
  return messages[pendingOperation.value.type] || 'Code PIN requis'
}

async function requirePin(operation) {
  try {
    // Vérifier si le PIN est déjà en cache pour cette saison
    if (await pinSessionManager.isPinCached(seasonId.value)) {
      const cachedPin = await pinSessionManager.getCachedPin(seasonId.value)
      if (cachedPin) {
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
    }
    
    // Afficher la modal de saisie du PIN
    pendingOperation.value = operation
    showPinModal.value = true
    // Mettre à jour les informations de session
    await updateSessionInfo()
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du PIN en cache:', error)
    // En cas d'erreur, afficher la modal de saisie du PIN
    pendingOperation.value = operation
    showPinModal.value = true
    // Mettre à jour les informations de session
    await updateSessionInfo()
  }
}

async function requirePlayerPassword(operation) {
  const playerId = operation.data.playerId
  
  // Si un PIN de saison valide est déjà en cache, ne pas redemander
  try {
    if (await pinSessionManager.isPinCached(seasonId.value)) {
              // PIN de saison en cache — saut de la demande de mot de passe joueur
      await executePendingOperation(operation)
      return
    }
  } catch {}

  // Vérifier si le mot de passe du joueur est déjà en cache ET que l'utilisateur est connecté
  const isConnected = !!currentUser.value?.email
  if (isConnected && isPlayerPasswordCached(playerId)) {
            // Mot de passe du joueur en cache trouvé ET utilisateur connecté, utilisation automatique
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
      const isConnected = !!getFirebaseAuth()?.currentUser?.email
      pinSessionManager.saveSession(seasonId.value, pinCode, isConnected)
      
      showPinModal.value = false
      const operationToExecute = pendingOperation.value
      pendingOperation.value = null
      
      // Mettre à jour les informations de session
      await updateSessionInfo()
      
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
      const isConnected = !!getFirebaseAuth()?.currentUser?.email
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
      const isConnected = !!getFirebaseAuth()?.currentUser?.email
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
    availabilityResetSuccess.value = result.message || 'Email de réinitialisation envoyé ! Si vous ne recevez pas l\'email dans quelques minutes, vérifiez vos dossiers de spam/courrier indésirable.'
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
    playerResetSuccess.value = result.message || 'Email de réinitialisation envoyé ! Si vous ne recevez pas l\'email dans quelques minutes, vérifiez vos dossiers de spam/courrier indésirable.'
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur lors de l\'envoi de l\'email')
    playerResetError.value = 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.'
  } finally {
    playerResetLoading.value = false
  }
}

async function updateSessionInfo() {
  try {
    if (await pinSessionManager.isPinCached(seasonId.value)) {
      sessionInfo.value = {
        timeRemaining: await pinSessionManager.getTimeRemaining(),
        isExpiringSoon: await pinSessionManager.isExpiringSoon()
      }
    } else {
      sessionInfo.value = null
    }
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des informations de session:', error)
    sessionInfo.value = null
  }
}

// Fonction synchrone pour le template
function getSessionInfo() {
  return sessionInfo.value
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
      case 'editEvent':
        // Ouvrir la modal d'édition d'événement après validation du PIN
        {
          const event = events.value.find(e => e.id === data.eventId)
          if (event) {
            editingEvent.value = event.id
            editingTitle.value = event.title
            editingDate.value = event.date
            editingDescription.value = event.description || ''
            editingArchived.value = !!event.archived
            
            // Initialiser le type de template
            editingSelectedRoleTemplate.value = event.templateType || 'custom'
            logger.debug('🔍 Editing event template type:', event.templateType, '->', editingSelectedRoleTemplate.value)
            
            // Initialiser les rôles avec les valeurs existantes ou par défaut
            logger.debug('🔍 Editing event roles initialization:', event.roles)
            logger.debug('🔍 Event playerCount:', event.playerCount)
            
            if (event.roles) {
              editingRoles.value = {
                [ROLES.PLAYER]: event.roles[ROLES.PLAYER] ?? event.playerCount ?? 6,
                [ROLES.DJ]: event.roles[ROLES.DJ] ?? 1,
                [ROLES.MC]: event.roles[ROLES.MC] ?? 1,
                [ROLES.VOLUNTEER]: event.roles[ROLES.VOLUNTEER] ?? 5,
                [ROLES.REFEREE]: event.roles[ROLES.REFEREE] ?? 1,
                [ROLES.ASSISTANT_REFEREE]: event.roles[ROLES.ASSISTANT_REFEREE] ?? 2,
                [ROLES.LIGHTING]: event.roles[ROLES.LIGHTING] ?? 0,
                [ROLES.COACH]: event.roles[ROLES.COACH] ?? 0,
                [ROLES.STAGE_MANAGER]: event.roles[ROLES.STAGE_MANAGER] ?? 1
              }
              logger.debug('🔍 Initialized editingRoles with event.roles:', editingRoles.value)
            } else {
              // Fallback pour les anciens événements sans rôles
              logger.debug('🔍 No event.roles found, using fallback initialization')
              editingRoles.value = {
                [ROLES.PLAYER]: event.playerCount ?? 6,
                [ROLES.DJ]: 1,
                [ROLES.MC]: 1,
                [ROLES.VOLUNTEER]: 5,
                [ROLES.REFEREE]: 1,
                [ROLES.ASSISTANT_REFEREE]: 2,
                [ROLES.LIGHTING]: 0,
                [ROLES.COACH]: 0,
                [ROLES.STAGE_MANAGER]: 1
              }
              logger.debug('🔍 Initialized editingRoles with fallback values:', editingRoles.value)
            }
            
            editingShowAllRoles.value = false
            
            // Debug: Log the final state
            logger.debug('🔍 Final editing state after initialization:')
            logger.debug('🔍 - editingEvent:', editingEvent.value)
            logger.debug('🔍 - editingTitle:', editingTitle.value)
            logger.debug('🔍 - editingRoles:', editingRoles.value)
            logger.debug('🔍 - selectedEvent:', selectedEvent.value)
          }
        }
        break
      case 'deletePlayer':
        // Afficher la modal de confirmation après validation du PIN
        playerToDelete.value = data.playerId
        confirmPlayerDelete.value = true
        break
      case 'launchCast':
        logger.debug('🚀 launchCast appelé:', { eventId: data.eventId, count: data.count })
        
        // Logger l'audit de composition automatique
        try {
          const { default: AuditClient } = await import('../services/auditClient.js')
          const event = events.value.find(e => e.id === data.eventId)
          await AuditClient.logAutoCastTriggered(seasonSlug, {
            eventId: data.eventId,
            eventTitle: event?.title || 'Unknown',
            count: data.count,
            hasExistingSelection: getSelectionPlayers(data.eventId).length > 0
          })
        } catch (auditError) {
          logger.warn('Erreur audit launchCast:', auditError)
        }
        
        // Vérifier si une composition complète existe déjà pour afficher la confirmation
        const currentSelection = getSelectionPlayers(data.eventId)
        const event = events.value.find(e => e.id === data.eventId)
        const requiredCount = event?.playerCount || 6
        const isSelectionComplete = currentSelection.length >= requiredCount
        
        // Lancer directement la composition (la confirmation est maintenant gérée dans SelectionModal)
        await drawProtected(data.eventId)
        // Fermer seulement la popin de détails, garder la popin de composition
        showEventDetailsModal.value = false
        break
      case 'toggleAvailability':
        // Cette action n'est plus utilisée - toutes les disponibilités passent par la modale
        console.warn('toggleAvailability action is deprecated')
        break
      case 'toggleArchive':
        {
          const newArchivedState = data.archived
          const eventData = {
            ...selectedEvent.value,
            archived: newArchivedState
          }
          
          await updateEvent(data.eventId, eventData, seasonId.value)
          
          // Mettre à jour l'événement localement
          selectedEvent.value.archived = newArchivedState
          
          // Mettre à jour la liste des événements
          const eventIndex = events.value.findIndex(e => e.id === data.eventId)
          if (eventIndex !== -1) {
            events.value[eventIndex].archived = newArchivedState
          }
          
          editingArchived.value = !!newArchivedState
          
          // Logger l'audit
          try {
            const { default: AuditClient } = await import('../services/auditClient.js')
            if (newArchivedState) {
              await AuditClient.logEventArchived(selectedEvent.value.title, props.slug, {
                eventId: data.eventId,
                action: 'archive',
                timestamp: new Date().toISOString()
              })
            } else {
              await AuditClient.logEventUnarchived(selectedEvent.value.title, props.slug, {
                eventId: data.eventId,
                action: 'unarchive',
                timestamp: new Date().toISOString()
              })
            }
          } catch (auditError) {
            console.warn('Erreur audit toggleEventArchived:', auditError)
          }
          
          // Message de succès
          showSuccessMessage.value = true
          successMessage.value = newArchivedState ? 'Événement archivé avec succès !' : 'Événement désarchivé avec succès !'
          setTimeout(() => {
            showSuccessMessage.value = false
          }, 3000)
        }
        break
      case 'updateCast':
        // Persister la composition manuelle après validation du PIN
        {
          const { eventId, players } = data
          // Détecter les joueurs retirés avant de sauvegarder
          const oldSelection = [...getSelectionPlayers(eventId)]
          const nextSelection = Array.isArray(players) ? players : []
          // Convertir en format par rôle
          const roles = { player: nextSelection }
          await saveCast(eventId, roles, seasonId.value)
          
          // Mettre à jour la structure locale (avec protection)
          if (casts.value && casts.value[eventId]) {
            if (typeof casts.value[eventId] === 'object' && casts.value[eventId].players) {
              // Utiliser nextTick pour éviter les problèmes de démontage
              await nextTick()
              if (casts.value && casts.value[eventId]) {
                casts.value[eventId].players = nextSelection
                casts.value[eventId].updatedAt = new Date()
              }
            } else {
              // Migration de l'ancienne structure
              await nextTick()
              if (casts.value) {
                casts.value[eventId] = {
                  players: nextSelection,
                  confirmed: false,
                  confirmedAt: null,
                  updatedAt: new Date()
                }
              }
            }
          } else {
            await nextTick()
            if (casts.value) {
              casts.value[eventId] = {
                players: nextSelection,
                confirmed: false,
                confirmedAt: null,
                updatedAt: new Date()
              }
            }
          }
          // Emails de décomposition si applicable
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
          // Feedback via la modale de composition si ouverte
          try {
            selectionModalRef.value?.showSuccess(true, true)
          } catch {}
        }
        break
      case 'unconfirmCast':
        // Déverrouiller une composition confirmée (admin uniquement)
        {
          const { eventId } = data
          try {
            const { unconfirmCast, loadCasts } = await import('../services/storage.js')
            await unconfirmCast(eventId, seasonId.value)
            
            // Recharger les compositions depuis Firestore pour avoir les données à jour
            const newSelections = await loadCasts(seasonId.value)
            casts.value = newSelections
            
            showSuccessMessage.value = true
            successMessage.value = 'Composition déverrouillée !'
            setTimeout(() => {
              showSuccessMessage.value = false
            }, 3000)
          } catch (error) {
            console.error('Erreur lors du déverrouillage de la composition:', error)
            showSuccessMessage.value = true
            successMessage.value = 'Erreur lors du déverrouillage de la composition'
            setTimeout(() => {
              showSuccessMessage.value = false
            }, 3000)
          }
        }
        break
      case 'resetCast':
        // Réinitialiser complètement une composition (admin uniquement)
        {
          const { eventId } = data
          try {
            const { deleteCast, loadCasts } = await import('../services/storage.js')
            await deleteCast(eventId, seasonId.value)
            
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
              console.warn('Erreur audit resetCast:', auditError)
            }
            
            // Recharger les compositions depuis Firestore pour avoir les données à jour
            const newSelections = await loadCasts(seasonId.value)
            casts.value = newSelections
            
            showSuccessMessage.value = true
            successMessage.value = 'Composition réinitialisée ! Le statut est maintenant "Nouveau"'
            setTimeout(() => {
              showSuccessMessage.value = false
            }, 3000)
          } catch (error) {
            console.error('Erreur lors de la réinitialisation de la composition:', error)
            showSuccessMessage.value = true
            successMessage.value = 'Erreur lors de la réinitialisation de la composition'
            setTimeout(() => {
              showSuccessMessage.value = false
            }, 3000)
          }
        }
        break
      case 'completeCast':
        // Compléter les slots vides d'une composition verrouillée
        {
          const { eventId } = data
          try {
            await completeCastSlots(eventId)
            
            showSuccessMessage.value = true
            successMessage.value = 'Composition complétée !'
            setTimeout(() => {
              showSuccessMessage.value = false
            }, 3000)
          } catch (error) {
            console.error('Erreur lors de la complétion de la composition:', error)
            showSuccessMessage.value = true
            successMessage.value = 'Erreur lors de la complétion de la composition'
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
  // Démarrer la mesure de performance pour l'écran détail événement
  performanceService.start('event_detail_loading', {
    eventId: event.id,
    eventTitle: event.title,
    timestamp: new Date().toISOString()
  })

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
      // Navigation tracking supprimé - remplacé par seasonPreferences
      }
    } catch (error) {
      // Log silencieux pour les erreurs de tracking non critiques
      if (error.code !== 'permission-denied') {
        logger.error('Erreur lors du tracking de l\'état de navigation:', error)
      }
    }

  // Rafraîchir les données avant d'afficher pour refléter les changements récents (ex: magic link)
  try {
    const [newAvailability, newSelections] = await performanceService.measureStep('event_detail_data_refresh', async () => {
      return await Promise.all([
        loadAvailability(players.value, events.value, seasonId.value),
        loadCasts(seasonId.value)
      ])
    }, { 
      eventId: event.id, 
      playersCount: players.value.length, 
      eventsCount: events.value.length 
    })
    availability.value = newAvailability
    casts.value = newSelections
  } catch (e) {
    console.warn('Impossible de rafraîchir les données avant ouverture des détails:', e)
  }

  // S'assurer que la modale s'ouvre après que les données soient assignées
  await nextTick()
  showEventDetailsModal.value = true

  // Terminer la mesure de performance pour l'écran détail événement
  const eventDetailLoadingTime = performanceService.end('event_detail_loading', {
    eventId: event.id,
    eventTitle: event.title,
    playersCount: players.value.length,
    eventsCount: events.value.length
  })
  
  logger.info(`📋 Détail événement chargé en ${eventDetailLoadingTime.toFixed(2)}ms (${event.title})`)
  
  // Mettre à jour l'état de surveillance de l'événement
  nextTick(() => {
    updateEventMonitoredState()
  })
}

function closeEventDetails() {
  showEventDetailsModal.value = false;
  selectedEvent.value = null;
  editingDescription.value = '';
  
  // Fermer les menus d'agenda
  closeCalendarMenuDetails();
  
  // Réinitialiser l'état du partage de lien
  showShareLinkCopied.value = false;
  // Cache fix: removed eventMoreActionsStyle references
}

// Fonction pour ajouter un événement à l'agenda
async function handleAddToCalendar(type, event = null) {
  const targetEvent = event || selectedEvent.value
  if (!targetEvent) return
  
  try {
    // Récupérer les données de sélection pour cet événement
    const castData = casts.value[targetEvent.id] || null
    console.log('🎭 Données de sélection pour l\'agenda:', castData)
    console.log('👥 Liste des joueurs:', players.value)
    
    await addToCalendar(type, targetEvent, seasonName.value, castData, players.value, seasonSlug.value)
    
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
      // Navigation tracking supprimé - remplacé par seasonPreferences
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
  
  // Vérifier si le joueur est compositionné ET la composition est confirmée par l'organisateur
  const playerIsSelected = isSelected(playerName, eventId)
  const playerIsAvailable = isAvailable(playerName, eventId)
  const playerSelectionConfirmedByOrganizer = isSelectionConfirmedByOrganizer(eventId)
  
  if (playerIsSelected && playerIsAvailable === true && playerSelectionConfirmedByOrganizer) {
    // Cycle de confirmation : pending → confirmed → declined → pending
    if (isProtected) {
      // Joueur protégé : toujours ouvrir la modale en lecture seule
      await openAvailabilityModalForPlayer(player, evt);
      return;
    } else {
      // Joueur non protégé, basculer directement le statut
      const currentStatus = getPlayerSelectionStatus(playerName, eventId)
      const nextStatus = getNextSelectionStatus(currentStatus)
      await handlePlayerSelectionStatusToggle(playerName, eventId, nextStatus, seasonId.value)
      return
    }
  }
  
  // Sinon, gérer la disponibilité normale
  if (isProtected) {
    // Joueur protégé : toujours ouvrir la modale en lecture seule
    openAvailabilityModalForPlayer(player, evt);
    return;
  } else {
    // Joueur non protégé, ouvrir directement la modale
    await openAvailabilityModalForPlayer(player, evt);
  }
}

// Fonction pour vérifier si un joueur est compositionné pour un événement spécifique
function isPlayerSelected(playerName, eventId) {
  const selection = casts.value[eventId]
  if (!selection || !selection.roles) {
    return false
  }
  
  // Trouver l'ID du joueur
  const player = players.value.find(p => p.name === playerName)
  if (!player) {
    return false
  }
  
  // Vérifier si le joueur est dans un des rôles
  for (const [role, rolePlayers] of Object.entries(selection.roles)) {
    if (Array.isArray(rolePlayers) && rolePlayers.includes(player.id)) {
      return true
    }
  }
  
  return false
}

// Fonction pour gérer la vérification de mot de passe réussie
async function handlePasswordVerified(verificationData) {
        // Mot de passe vérifié
  
  // Marquer le joueur comme récemment vérifié pour éviter la boucle
  if (passwordVerificationPlayer.value) {
    recentlyVerifiedPlayer.value = passwordVerificationPlayer.value.id;
    // Joueur marqué comme récemment vérifié
  }
  
  // Procéder à l'action en attente
  if (pendingAvailabilityAction.value) {
    const { playerName, eventId, action } = pendingAvailabilityAction.value;
    
    const player = players.value.find(p => p.name === playerName);
    const event = events.value.find(e => e.id === eventId);
    
    if (player && event) {
      if (action === 'toggleSelectionStatus') {
        // Basculer le statut de confirmation
        const currentStatus = getPlayerSelectionStatus(playerName, eventId)
        const nextStatus = getNextSelectionStatus(currentStatus)
        await handlePlayerSelectionStatusToggle(playerName, eventId, nextStatus, seasonId.value)
      } else if (action === 'openAvailabilityModal') {
        // Ouvrir la modale de disponibilité
        await openAvailabilityModalForPlayer(player, event)
      } else if (action === 'enableEditMode') {
        // Basculer la modale en mode édition
        availabilityModalData.value.isReadOnly = false
      }
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

async function startEditingFromDetails() {
  // Demander le PIN code avant d'ouvrir l'édition
  await requirePin({
    type: 'editEvent',
    data: { eventId: selectedEvent.value.id }
  })
}

async function toggleEventArchived() {
  if (!selectedEvent.value) return;
  
  // Demander le PIN code avant d'archiver/désarchiver
  await requirePin({
    type: 'toggleArchive',
    data: { 
      eventId: selectedEvent.value.id, 
      archived: !selectedEvent.value.archived 
    }
  })
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
        // Navigation tracking supprimé - remplacé par seasonPreferences
      }
    } catch (error) {
      // Log silencieux pour les erreurs de tracking non critiques
      if (error.code !== 'permission-denied') {
        logger.error('Erreur lors du tracking du retour à la vue d\'ensemble:', error)
      }
    }
  }
}

async function handlePlayerUpdate({ playerId, newName, newGender }) {
  try {
    await updatePlayer(playerId, newName, seasonId.value, newGender);
    
    // Recharger les données
    await Promise.all([
      loadPlayers(seasonId.value),
      loadAvailability(players.value, events.value, seasonId.value),
      loadCasts(seasonId.value)
    ]).then(([newPlayers, newAvailability, newSelections]) => {
      players.value = newPlayers;
      availability.value = newAvailability;
      casts.value = newSelections;
      
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
    
    // Fermer le mode d'édition seulement en cas de succès
    if (playerModalRef.value) {
      playerModalRef.value.closeEditMode()
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erreur lors de l\'édition du joueur');
    
    // Passer l'erreur au modal pour affichage (modal reste ouvert)
    if (playerModalRef.value) {
      playerModalRef.value.setEditError(error.message || 'Erreur lors de l\'édition du joueur. Veuillez réessayer.')
    }
  }
}

async function handlePlayerRefresh() {
  try {
    // Recharger les données
    const [newPlayers, newAvailability, newSelections] = await Promise.all([
      loadPlayers(seasonId.value),
      loadAvailability(players.value, events.value, seasonId.value),
      loadCasts(seasonId.value)
    ]);
    
    players.value = newPlayers;
    availability.value = newAvailability;
    casts.value = newSelections;
    
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

async function handleAvatarUpdated({ playerId, seasonId: eventSeasonId }) {
  try {
    console.log('🔄 Avatar mis à jour, rechargement des avatars...', { playerId, eventSeasonId })
    
    // Vider le cache des avatars pour ce joueur
    const { clearPlayerAvatarCacheForPlayer } = await import('../services/playerAvatars.js')
    clearPlayerAvatarCacheForPlayer(playerId)
    
    // Forcer le rechargement des composants PlayerAvatar
    // En déclenchant un événement global ou en utilisant une clé de réactivité
    nextTick(() => {
      // Déclencher un événement personnalisé pour forcer le rechargement
      window.dispatchEvent(new CustomEvent('avatar-cache-cleared', { 
        detail: { playerId, seasonId: eventSeasonId } 
      }))
    })
    
    console.log('✅ Cache des avatars vidé pour le joueur', playerId)
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des avatars:', error)
  }
}

function getPlayerStats(player) {
  if (!player) return { availability: 0, selection: 0, ratio: 0 };
  
  const availability = countAvailability(player.name);
  const selection = countSelections(player.name);
  const ratio = availability === 0 ? 0 : Math.round((selection / availability) * 100);
  
  return { availability, selection, ratio };
}

// Fonction helper pour calculer le nombre total requis d'un événement
function getTotalRequiredCount(event) {
  if (!event) return 6
  
  // Si l'événement a des rôles définis, calculer le total
  if (event.roles && typeof event.roles === 'object') {
    return Object.values(event.roles).reduce((sum, count) => sum + (count || 0), 0)
  }
  
  // Fallback pour les anciens événements
  return event.playerCount || 6
}

// Fonctions pour détecter l'état des événements
function getEventStatus(eventId) {
  const selectedPlayers = getSelectionPlayers(eventId)
  const event = events.value.find(e => e.id === eventId)
  const requiredCount = getTotalRequiredCount(event)
  const availableCount = countAvailablePlayers(eventId)
  const isConfirmedByOrganizer = isSelectionConfirmedByOrganizer(eventId)
  const isConfirmedByAllPlayers = isSelectionConfirmed(eventId)
  
  // Cas 0: Aucune composition → afficher "Nouveau" (prioritaire)
  if (selectedPlayers.length === 0) {
    return {
      type: 'ready',
      availableCount,
      requiredCount,
      isConfirmedByOrganizer: false,
      isConfirmedByAllPlayers: false
    }
  }
  
  // Priorité : utiliser le statut calculé stocké en base (comme SelectionModal.vue)
  const selection = casts.value[eventId]
  if (selection?.status && selection?.statusDetails) {
    return {
      type: selection.status,
      availableCount: selection.statusDetails.availableCount || availableCount,
      requiredCount: selection.statusDetails.requiredCount || requiredCount,
      isConfirmedByOrganizer,
      isConfirmedByAllPlayers,
      ...selection.statusDetails
    }
  }

  // Cas 1: Composition incomplète (composition existante avec problèmes)
  if (selectedPlayers.length > 0) {
    const hasUnavailablePlayers = selectedPlayers.some(playerName => !isAvailable(playerName, eventId))
    const hasInsufficientPlayers = availableCount < requiredCount
    
    // Vérifier si des joueurs sélectionnés ont décliné
    const selection = casts.value[eventId]
    const hasDeclinedPlayers = selectedPlayers.some(playerName => {
      return selection?.playerStatuses?.[playerName] === 'declined'
    })
    
    if (hasUnavailablePlayers || hasInsufficientPlayers || hasDeclinedPlayers) {
      return {
        type: 'incomplete',
        hasUnavailablePlayers,
        hasInsufficientPlayers,
        hasDeclinedPlayers,
        unavailablePlayers: selectedPlayers.filter(playerName => !isAvailable(playerName, eventId)),
        declinedPlayers: selectedPlayers.filter(playerName => 
          selection?.playerStatuses?.[playerName] === 'declined'
        ),
        availableCount,
        requiredCount,
        isConfirmedByOrganizer,
        isConfirmedByAllPlayers
      }
    }
  }
  
  // Cas 2: Pas assez de joueurs pour faire une composition (si une composition existe)
  if (availableCount < requiredCount) {
    return {
      type: 'insufficient',
      availableCount,
      requiredCount,
      isConfirmedByOrganizer: false,
      isConfirmedByAllPlayers: false
    }
  }
  
  // Cas 4: Composition confirmée par l'organisateur ET par tous les joueurs
  if (isConfirmedByAllPlayers) {
    return {
      type: 'confirmed',
      availableCount,
      requiredCount,
      isConfirmedByOrganizer,
      isConfirmedByAllPlayers
    }
  }
  
  // Cas 5: Composition confirmée par l'organisateur mais pas encore par tous les joueurs
  if (isConfirmedByOrganizer) {
    return {
      type: 'pending_confirmation',
      availableCount,
      requiredCount,
      isConfirmedByOrganizer,
      isConfirmedByAllPlayers
    }
  }
  
  // Cas 6: Composition complète mais non confirmée par l'organisateur
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
      if (status.hasDeclinedPlayers) {
        if (status.declinedPlayers.length === 1) {
          return `Composition incomplète : ${status.declinedPlayers[0]} a décliné`
        } else {
          return `Composition incomplète : ${status.declinedPlayers.length} joueurs ont décliné`
        }
      } else if (status.hasUnavailablePlayers) {
        if (status.unavailablePlayers.length === 1) {
          return `Composition incomplète : ${status.unavailablePlayers[0]} n'est plus disponible`
        } else {
          return `Composition incomplète : ${status.unavailablePlayers.length} joueurs ne sont plus disponibles`
        }
      } else {
        return `Composition incomplète : ${status.availableCount} joueurs disponibles pour ${status.requiredCount} requis`
      }
    case 'insufficient':
      return `Pas assez de joueurs : ${status.availableCount} disponibles pour ${status.requiredCount} requis`
    case 'ready':
      return `Prêt pour la composition : ${status.availableCount} joueurs disponibles`
    case 'complete':
      return `Composition complète : ${status.availableCount} joueurs disponibles (non confirmée)`
    case 'pending_confirmation':
      return `Composition à confirmer : ${status.availableCount} joueurs disponibles (en attente de confirmation des joueurs)`
    case 'confirmed':
      return `Composition confirmée : ${status.availableCount} joueurs disponibles (tous ont confirmé)`
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
      // Vérifier que l'organisateur a validé la composition avant d'envoyer les notifications
      if (!isSelectionConfirmedByOrganizer(eventId)) {
        showSuccessMessage.value = true
        successMessage.value = 'Impossible d\'envoyer les notifications : la composition n\'est pas encore validée par l\'organisateur'
        setTimeout(() => { showSuccessMessage.value = false }, 3000)
        isSendingNotifications.value = false
        return
      }
      
      if (scope === 'single' && recipient?.email) {
        // Envoi ciblé pour un joueur compositionné
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
        // Batch pour tous les compositionnés
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
          : 'Notifications de composition envoyées à tous les joueurs compositionnés !'
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
  const event = events.value.find(e => e.id === eventId)
  const selectedPlayers = getSelectionPlayers(eventId)
  
  players.value.forEach(player => {
    // Si le joueur est sélectionné, il est considéré comme disponible par défaut
    if (selectedPlayers.includes(player.name)) {
      availabilityMap[player.name] = true
      return
    }
    
    // Sinon, vérifier la disponibilité normale
    let isAvailable = false
    
    if (event?.roles && typeof event.roles === 'object') {
      // Pour les événements multi-rôles, vérifier si le joueur est disponible pour au moins un rôle requis
      for (const role of Object.keys(event.roles)) {
        if (event.roles[role] > 0 && isAvailableForRole(player.name, role, eventId)) {
          isAvailable = true
          break
        }
      }
    } else {
      // Pour les anciens événements, utiliser la logique existante
      isAvailable = isAvailableForPlayerRole(player.name, eventId)
    }
    
    availabilityMap[player.name] = isAvailable
  })
  
  return availabilityMap
}

// Fonction pour calculer les chances par rôle pour chaque joueur
function getPlayerRoleChances(eventId) {
  if (!eventId) return {}
  
  const event = events.value.find(e => e.id === eventId)
  if (!event || !event.roles) return {}
  
  const roleChances = {}
  
  // Pour chaque rôle requis dans l'événement
  Object.entries(event.roles).forEach(([role, requiredCount]) => {
    if (requiredCount <= 0) return
    
    // Récupérer les joueurs disponibles pour ce rôle
    const availablePlayers = players.value.filter(p => isAvailableForRole(p.name, role, eventId))
    
    if (availablePlayers.length === 0) return
    
    // Calculer les poids basés sur le nombre de compositions déjà faites
    const weights = availablePlayers.map(player => {
      const pastSelections = countSelections(player.name)
      return {
        name: player.name,
        weight: 1 / (1 + pastSelections)
      }
    })
    
    const totalWeight = weights.reduce((sum, p) => sum + p.weight, 0)
    
    // Calculer les chances pour chaque joueur pour ce rôle
    weights.forEach(player => {
      if (!roleChances[player.name]) roleChances[player.name] = {}
      
      const chance = Math.min(1, (player.weight / totalWeight) * requiredCount)
      roleChances[player.name][role] = Math.round(chance * 100)
    })
  })
  
  return roleChances
}

// Fonction pour récupérer les chances par rôle seulement pour les rôles choisis par le joueur
function getPlayerSelectedRoleChances(playerName, eventId) {
  const allRoleChances = getPlayerRoleChances(eventId)
  const playerChances = allRoleChances[playerName] || {}
  
  // Récupérer les rôles choisis par le joueur dans sa disponibilité
  const availabilityData = getAvailabilityData(playerName, eventId)
  const selectedRoles = availabilityData?.roles || []
  
  // Retourner seulement les chances pour les rôles choisis par le joueur
  return selectedRoles
    .filter(role => playerChances[role] !== undefined)
    .map(role => ({
      role,
      chance: playerChances[role]
    }))
    .sort((a, b) => b.chance - a.chance) // Trier par pourcentage décroissant
}

// Fonction helper pour extraire les joueurs d'une composition
function getSelectionPlayers(eventId) {
  const selection = casts.value[eventId]
  
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
  
  // Nouvelle structure multi-rôles : extraire tous les joueurs de tous les rôles
  if (selection.roles && typeof selection.roles === 'object') {
    const allPlayers = []
    for (const rolePlayers of Object.values(selection.roles)) {
      if (Array.isArray(rolePlayers)) {
        allPlayers.push(...rolePlayers)
      }
    }
    // Retourner un tableau unique (sans doublons)
    const uniquePlayers = [...new Set(allPlayers)]
    return uniquePlayers
  }
  
  return []
}

// Fonction helper pour vérifier si une composition est confirmée
function isSelectionConfirmed(eventId) {
  const selection = casts.value[eventId]
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

// Fonction helper pour vérifier si l'organisateur a confirmé la composition (sans vérifier les confirmations individuelles)
function isSelectionConfirmedByOrganizer(eventId) {
  const selection = casts.value[eventId]
  if (!selection) return false
  
  // Si c'est la nouvelle structure avec confirmed
  if (typeof selection.confirmed === 'boolean') {
    return selection.confirmed
  }
  
  // Si c'est l'ancienne structure, considérer comme non confirmée
  return false
}

// Fonction helper pour obtenir le statut individuel d'un joueur dans une composition
function getPlayerSelectionStatus(playerName, eventId) {
  const cast = casts.value[eventId]
  return getPlayerCastStatus(cast, playerName, players.value)
}

// Fonction helper pour obtenir le rôle de composition d'un joueur
function getPlayerSelectionRole(playerName, eventId) {
  const cast = casts.value[eventId]
  return getPlayerCastRole(cast, playerName, players.value)
}

// Fonctions pour la nouvelle popin de composition
function openSelectionModal(event) {
  if (event?.archived) {
    showSuccessMessage.value = true
    successMessage.value = 'Impossible d\'ouvrir la composition sur un événement archivé'
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
  
  // Demander le PIN code avant de lancer la composition
  await requirePin({
    type: 'launchCast',
    data: { eventId, count }
  })
}

async function handlePerfectFromModal() {
  closeSelectionModal()
  showSuccessMessage.value = true
  successMessage.value = 'Composition validée !'
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

async function handleConfirmReselectFromModal() {
  if (!selectionModalEvent.value) return
  
  const eventId = selectionModalEvent.value.id
  
  try {
    // Lancer directement la composition (le PIN a déjà été validé)
    await drawProtected(eventId)
  } catch (error) {
    console.error('Erreur lors de la confirmation du tirage:', error)
  }
  // Ne pas fermer la popin de composition, elle restera ouverte avec la nouvelle composition
}

async function handleConfirmSelectionFromModal() {
  if (!selectionModalEvent.value) return
  
  const eventId = selectionModalEvent.value.id
  
  try {
    // Confirmer la composition
    const { confirmCast } = await import('../services/storage.js')
    await confirmCast(eventId, seasonId.value)
    
    // Logger l'audit de validation de composition
    try {
      const { logCastValidation } = await import('../services/selectionAuditService.js')
      const event = events.value.find(e => e.id === eventId)
      
      await logCastValidation({
        eventId,
        eventTitle: event?.title || 'Unknown',
        seasonSlug,
        action: 'validate',
        source: 'selection_modal'
      })
    } catch (auditError) {
      console.warn('Erreur audit confirmCast:', auditError)
    }
    
    // Recharger les compositions depuis la base pour avoir les données à jour
    const { loadCasts } = await import('../services/storage.js')
    const updatedSelections = await loadCasts(seasonId.value)
    casts.value = updatedSelections
    
    // Recharger aussi les disponibilités pour s'assurer que l'affichage est à jour
    await loadAvailability(players.value, events.value, seasonId.value)
    
    // Ne pas fermer la modale, la laisser ouverte pour afficher les nouveaux boutons
    // closeSelectionModal()
    
    // Afficher un message de succès
    showSuccessMessage.value = true
    successMessage.value = 'Composition validée !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    console.error('Erreur lors de la confirmation de la composition:', error)
    showSuccessMessage.value = true
    successMessage.value = 'Erreur lors de la confirmation de la composition'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  }
}

async function handleUnconfirmCastFromModal() {
  if (!selectionModalEvent.value) return
  
  const eventId = selectionModalEvent.value.id
  
  try {
    // Demander le PIN code avant de déverrouiller la composition
    await requirePin({
      type: 'unconfirmCast',
      data: { eventId }
    })
  } catch (error) {
    console.error('Erreur lors de la demande de déverrouillage:', error)
  }
}

async function handleResetSelectionFromModal() {
  // La logique de réinitialisation est maintenant dans SelectionModal
  // Cette fonction ne fait que gérer la mise à jour de l'interface parent
  if (!selectionModalEvent.value) return
  
  // Recharger les données pour refléter les changements
  try {
    const { loadCasts } = await import('../services/storage.js')
    const newSelections = await loadCasts(seasonId.value)
    casts.value = newSelections
    
    // Recharger aussi les disponibilités pour s'assurer que l'affichage est à jour
    await loadAvailability(players.value, events.value, seasonId.value)
  } catch (error) {
    console.error('Erreur lors du rechargement des compositions:', error)
  }
}

async function handleCompleteSelectionFromModal() {
  if (!selectionModalEvent.value) return
  
  const eventId = selectionModalEvent.value.id
  
  try {
    // Demander le PIN code avant de compléter la composition
    await requirePin({
      type: 'completeCast',
      data: { eventId }
    })
  } catch (error) {
    console.error('Erreur lors de la demande de complétion:', error)
  }
}


// Sauvegarde d'une composition manuelle via PIN
async function handleUpdateCastFromModal() {
  // Recharger les compositions depuis la base pour avoir les données à jour
  try {
    const { loadCasts } = await import('../services/storage.js')
    const updatedSelections = await loadCasts(seasonId.value)
    casts.value = updatedSelections
    
    // Recharger aussi les disponibilités pour s'assurer que l'affichage est à jour
    await loadAvailability(players.value, events.value, seasonId.value)
    
    // Forcer la mise à jour de la modale en changeant sa clé
    if (showSelectionModal.value) {
      selectionModalKey.value++
    }
  } catch (error) {
    console.error('Erreur lors du rechargement des compositions:', error)
  }
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
    
    // S'assurer que firestoreService est initialisé
    if (!firestoreService.isInitialized) {
      await firestoreService.initialize()
    }
    
    // Récupérer les préférences de notification depuis Firestore
    const prefs = await firestoreService.getDocument('userPreferences', currentUser.value.email)
    
    if (prefs) {
      
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
    eventTitle: event.title || 'cet événement',
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
    successMessage.value = `Email envoyé à ${data.email} pour activer les notifications ! Si vous ne recevez pas l'email dans quelques minutes, vérifiez vos dossiers de spam/courrier indésirable.`
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
    // Connexion normale, ne pas afficher automatiquement le menu du compte
    // L'utilisateur peut y accéder via le bouton de son avatar s'il le souhaite
    console.log('🔐 Connexion réussie, utilisateur connecté')
    
    // Afficher un message de succès discret
    showSuccessMessage.value = true
    successMessage.value = 'Connexion réussie !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 2000)
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

// Fonctions pour la modale de disponibilité avec rôles
function openAvailabilityModal(data) {
  // Récupérer les rôles attendus pour cet événement
  let eventRoles = {}
  if (data.eventId) {
    const event = events.value.find(e => e.id === data.eventId)
    if (event && event.roles) {
      eventRoles = event.roles
    }
  }
  
  availabilityModalData.value = {
    playerName: data.playerName,
    playerId: data.playerId,
    playerGender: data.playerGender || 'non-specified',
    eventId: data.eventId,
    eventTitle: data.eventTitle,
    eventDate: data.eventDate,
    availabilityData: data.availabilityData,
    isReadOnly: data.isReadOnly || false,
    chancePercent: data.chancePercent,
    isProtected: data.isProtected || false,
    eventRoles: eventRoles
  }
  
  showAvailabilityModal.value = true
}

async function handleAvailabilitySave(availabilityData) {
  try {
    const { saveAvailabilityWithRoles } = await import('../services/storage.js')
    await saveAvailabilityWithRoles({
      seasonId: seasonId.value,
      playerName: availabilityModalData.value.playerName,
      eventId: availabilityModalData.value.eventId,
      available: availabilityData.available,
      roles: availabilityData.roles,
      comment: availabilityData.comment
    })
    
    // Mettre à jour les données locales
    if (!availability.value[availabilityModalData.value.playerName]) {
      availability.value[availabilityModalData.value.playerName] = {}
    }
    availability.value[availabilityModalData.value.playerName][availabilityModalData.value.eventId] = availabilityData
    
    showAvailabilityModal.value = false
    
    // Afficher un message de succès
    showSuccessMessage.value = true
    successMessage.value = 'Disponibilité mise à jour avec succès !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la disponibilité:', error)
    showErrorMessage.value = true
    errorMessage.value = 'Erreur lors de la sauvegarde. Veuillez réessayer.'
    setTimeout(() => {
      showErrorMessage.value = false
    }, 5000)
  }
}

async function handleAvailabilityNotAvailable(availabilityData) {
  try {
    const { saveAvailabilityWithRoles } = await import('../services/storage.js')
    await saveAvailabilityWithRoles({
      seasonId: seasonId.value,
      playerName: availabilityModalData.value.playerName,
      eventId: availabilityModalData.value.eventId,
      available: false,
      roles: [],
      comment: availabilityData.comment
    })
    
    // Mettre à jour les données locales
    if (!availability.value[availabilityModalData.value.playerName]) {
      availability.value[availabilityModalData.value.playerName] = {}
    }
    availability.value[availabilityModalData.value.playerName][availabilityModalData.value.eventId] = {
      available: false,
      roles: [],
      comment: availabilityData.comment
    }
    
    showAvailabilityModal.value = false
    
    // Afficher un message de succès
    showSuccessMessage.value = true
    successMessage.value = 'Disponibilité mise à jour avec succès !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la disponibilité:', error)
    showErrorMessage.value = true
    errorMessage.value = 'Erreur lors de la sauvegarde. Veuillez réessayer.'
    setTimeout(() => {
      showErrorMessage.value = false
    }, 5000)
  }
}

async function handleAvailabilityClear(availabilityData) {
  try {
    const { saveAvailabilityWithRoles } = await import('../services/storage.js')
    await saveAvailabilityWithRoles({
      seasonId: seasonId.value,
      playerName: availabilityModalData.value.playerName,
      eventId: availabilityModalData.value.eventId,
      available: null,
      roles: [],
      comment: availabilityData.comment
    })
    
    // Mettre à jour les données locales - sauvegarder avec available: null et le commentaire
    if (!availability.value[availabilityModalData.value.playerName]) {
      availability.value[availabilityModalData.value.playerName] = {}
    }
    availability.value[availabilityModalData.value.playerName][availabilityModalData.value.eventId] = {
      available: null,
      roles: [],
      comment: availabilityData.comment
    }
    
    showAvailabilityModal.value = false
    
    // Afficher un message de succès
    showSuccessMessage.value = true
    successMessage.value = 'Disponibilité effacée avec succès !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
    
  } catch (error) {
    console.error('Erreur lors de l\'effacement de la disponibilité:', error)
    showErrorMessage.value = true
    errorMessage.value = 'Erreur lors de l\'effacement. Veuillez réessayer.'
    setTimeout(() => {
      showErrorMessage.value = false
    }, 5000)
  }
}



// Fonction pour gérer la demande de modification depuis la modale en lecture seule
async function handleAvailabilityRequestEdit() {
  const playerName = availabilityModalData.value.playerName
  const eventId = availabilityModalData.value.eventId
  
  // Trouver le joueur et l'événement
  const player = players.value.find(p => p.name === playerName)
  const event = events.value.find(e => e.id === eventId)
  
  if (!player || !event) {
    console.error('Joueur ou événement non trouvé')
    return
  }
  
  // Vérifier si le joueur est protégé
  const isProtected = isPlayerProtectedInGrid(player.id)
  
  if (isProtected) {
    // Demander la vérification du mot de passe ou PIN
    pendingAvailabilityAction.value = { playerName, eventId, action: 'enableEditMode' }
    passwordVerificationPlayer.value = player
    showPasswordVerification.value = true
  } else {
    // Joueur non protégé, basculer directement en mode édition
    availabilityModalData.value.isReadOnly = false
  }
}

// end of script setup
</script>
