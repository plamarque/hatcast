<template>
  <div
      class="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
      :class="[
        { 'h-screen': isEventFullScreen },
        isEventFullScreen ? '' : 'pb-20'
      ]"
    >
    <!-- Contenu principal -->
    <div class="w-full flex-1 flex flex-col min-h-0">
      <!-- Header de saison partagé -->
    <SeasonHeader 
      :season-name="seasonName"
      :is-scrolled="isScrolled"
      :season-slug="props.slug"
      :season-id="seasonId"
      :is-connected="!!currentUser?.email"
      :show-view-toggle="showViewToggle"
      :current-view-mode="validCurrentView"
      :season-meta="seasonMeta"
      :is-composition-view="isCompositionView"
      :is-event-screen="!!isEventFullScreen"
      :event-title="selectedEvent?.title"
      :event-date="selectedEvent?.date"
      :event-icon="getEventTypeIcon(selectedEvent)"
      @go-back="goBack"
      @open-account-menu="openAccountMenu"
      @open-help="() => {}"
      @open-preferences="openPreferences"
      @open-administration="openAdministration"
      @open-players="openPlayers"
      @logout="handleAccountLogoutDevice"
      @open-login="openAccount"
      @open-account="openAccount"
      @open-account-creation="openAccountCreation"
      @open-development="openDevelopment"
      @return-to-full-view="returnToFullView"
    />

    <!-- Season grid / timeline (hidden when on event full-screen) -->
    <template v-if="!isEventFullScreen">
    <ViewHeader
      v-if="validCurrentView === 'events' || validCurrentView === 'participants' || validCurrentView === 'timeline' || validCurrentView === 'casts'"
      :current-view="validCurrentView"
      :show-player-selector="true"
      :selected-player="selectedPlayer"
      :season-id="seasonId"
      :show-event-selector="true"
      :selected-event="selectedEventForFilter"
      :events="events"
      :is-sticky="true"
      @view-change="selectView"
      @player-modal-toggle="togglePlayerModal"
      @event-modal-toggle="toggleEventModal"
    />
    </template>

    <!-- Modal de sélection de joueur (global pour toutes les vues) -->
    <PlayerSelectorModal
      :show="showPlayerModal"
      :players="allSeasonPlayers"
      :season-id="seasonId"
      :selected-player-id="selectedPlayerId"
      :preferred-player-ids-set="preferredPlayerIdsSet"
      :is-player-protected="isPlayerProtectedInGrid"
      :is-player-already-displayed="isPlayerAlreadyDisplayed"
      :events="events"
      :is-available="isAvailable"
      :get-selection-players="getSelectionPlayers"
      @close="closePlayerModal"
      @player-selected="handlePlayerSelected"
      @all-players-selected="handleAllPlayersSelected"
      @add-new-player="(name) => openNewPlayerForm(name)"
    />

    <!-- Modal de sélection de joueur pour l'onglet Disponibilités -->
    <PlayerSelectorModal
      :show="showAvailabilityPlayerSelector"
      :players="allSeasonPlayers"
      :season-id="seasonId"
      :selected-player-id="selectedTeamPlayer && selectedTeamPlayer.id !== 'all' ? selectedTeamPlayer.id : null"
      :preferred-player-ids-set="preferredPlayerIdsSet"
      :is-player-protected="isPlayerProtectedInGrid"
      :is-player-already-displayed="isPlayerAlreadyDisplayed"
      :events="events"
      :is-available="isAvailable"
      :get-selection-players="getSelectionPlayers"
      @close="() => showAvailabilityPlayerSelector = false"
      @player-selected="selectAvailabilityPlayer"
      @all-players-selected="selectAllAvailabilityPlayers"
      @add-new-player="(name) => openNewPlayerForm(name)"
    />

    <!-- Modal de sélection d'événement -->
    <EventSelectorModal
      :show="showEventModal"
      :events="allEvents"
      :selected-event-id="selectedEventId"
      :get-selection-players="getSelectionPlayers"
      :get-total-required-count="getTotalRequiredCount"
      :count-available-players="countAvailablePlayers"
      :count-players-with-response="countPlayersWithResponse"
      :is-selection-confirmed="isSelectionConfirmed"
      :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer"
      :casts="casts"
      :is-available="isAvailable"
      :players="allSeasonPlayers"
      :is-player-protected="isPlayerProtectedInGrid"
      @close="closeEventModal"
      @event-selected="handleEventSelected"
      @all-events-selected="handleAllEventsSelected"
    />

    <template v-if="!isEventFullScreen">
    <!-- Vue grille (lignes ou colonnes) -->
    <div v-if="validCurrentView === 'events' || validCurrentView === 'participants' || validCurrentView === 'casts'" class="w-full px-0 md:px-0 pb-0 bg-gray-900">
      
      <!-- Modal de sélection supprimé d'ici - déplacé au niveau global -->
      
      <!-- Composants de vue séparés -->
      <ParticipantsView
        v-if="validCurrentView === 'participants'"
        key="participants-view"
        :events="displayedEvents"
        :displayed-players="displayedPlayers"
        :is-all-players-view="isAllPlayersView"
        :hidden-players-count="hiddenPlayersCount"
        :hidden-players-display-text="hiddenPlayersDisplayText"
        :is-all-events-view="isAllEventsView"
        :hidden-events-count="hiddenEventsCount"
        :hidden-events-display-text="hiddenEventsDisplayText"
        :can-edit-availability="canEditAvailability"
        :get-player-availability="getPlayerAvailability"
                          :season-id="seasonId"
        :chances="chances"
        :is-available="isAvailable"
        :is-selected="isSelected"
        :is-selection-confirmed="isSelectionConfirmed"
        :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer"
        :can-edit-events="canEditEvents"
        :get-player-selection-status="getPlayerSelectionStatus"
        :is-selection-complete="isSelectionComplete"
        :get-availability-data="getAvailabilityData"
        :is-player-protected-in-grid="isPlayerProtectedInGrid"
        :get-selection-players="getSelectionPlayers"
        :get-total-required-count="getTotalRequiredCount"
        :count-available-players="countAvailablePlayers"
        :casts="casts"
        :header-offset-x="0"
        :header-scroll-x="0"
        @player-selected="showPlayerDetails"
        @availability-changed="handleAvailabilityChanged"
        @scroll="handleGridScroll"
        @toggle-player-modal="togglePlayerModal"
        @toggle-availability="toggleAvailability"
        @toggle-selection-status="toggleSelectionStatus"
        @show-availability-modal="openAvailabilityModal"
        @show-confirmation-modal="openConfirmationModal"
        @event-click="openEventModal"
        @all-players-loaded="handleAllPlayersLoaded"
        @all-events-loaded="handleAllEventsLoaded"
      />
      
      <EventsView
        v-if="validCurrentView === 'events'"
        key="events-view"
        :events="displayedEvents"
        :displayed-players="displayedPlayers"
        :is-all-players-view="isAllPlayersView"
        :hidden-players-count="hiddenPlayersCount"
        :hidden-players-display-text="hiddenPlayersDisplayText"
        :is-all-events-view="isAllEventsView"
        :hidden-events-count="hiddenEventsCount"
        :hidden-events-display-text="hiddenEventsDisplayText"
        :can-edit-availability="canEditAvailability"
        :get-player-availability="getPlayerAvailability"
        :season-id="seasonId"
        :chances="chances"
        :is-available="isAvailable"
        :is-selected="isSelected"
        :is-selection-confirmed="isSelectionConfirmed"
        :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer"
        :can-edit-events="canEditEvents"
        :get-player-selection-status="getPlayerSelectionStatus"
        :is-selection-complete="isSelectionComplete"
        :get-availability-data="getAvailabilityData"
        :is-player-protected-in-grid="isPlayerProtectedInGrid"
        :get-selection-players="getSelectionPlayers"
        :get-total-required-count="getTotalRequiredCount"
        :count-available-players="countAvailablePlayers"
        :casts="casts"
        :header-offset-x="0"
        :header-scroll-x="0"
        @player-selected="showPlayerDetails"
        @availability-changed="handleAvailabilityChanged"
        @scroll="handleGridScroll"
        @toggle-player-modal="togglePlayerModal"
        @toggle-availability="toggleAvailability"
        @toggle-selection-status="toggleSelectionStatus"
        @show-availability-modal="openAvailabilityModal"
        @show-confirmation-modal="openConfirmationModal"
        @event-click="openEventModal"
        @all-players-loaded="handleAllPlayersLoaded"
        @all-events-loaded="handleAllEventsLoaded"
      />

      <CastsView
        v-if="validCurrentView === 'casts'"
        key="casts-view"
        :events="displayedEvents"
        :displayed-players="displayedPlayers"
        :is-all-players-view="isAllPlayersView"
        :hidden-players-count="hiddenPlayersCount"
        :hidden-players-display-text="hiddenPlayersDisplayText"
        :is-all-events-view="isAllEventsView"
        :hidden-events-count="hiddenEventsCount"
        :hidden-events-display-text="hiddenEventsDisplayText"
        :can-edit-availability="canEditAvailability"
        :get-player-availability="getPlayerAvailability"
        :season-id="seasonId"
        :chances="chances"
        :is-available="isAvailable"
        :is-selected="isSelected"
        :is-selection-confirmed="isSelectionConfirmed"
        :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer"
        :can-edit-events="canEditEvents"
        :get-player-selection-status="getPlayerSelectionStatus"
        :is-selection-complete="isSelectionComplete"
        :get-availability-data="getAvailabilityData"
        :is-player-protected-in-grid="isPlayerProtectedInGrid"
        :get-selection-players="getSelectionPlayers"
        :get-total-required-count="getTotalRequiredCount"
        :count-available-players="countAvailablePlayers"
        :casts="casts"
        :header-offset-x="0"
        :header-scroll-x="0"
        :count-selections="countSelections"
        :is-available-for-role="isAvailableForRole"
        :availability="availability"
        :all-season-players="allSeasonPlayers"
        @player-selected="showPlayerDetails"
        @availability-changed="handleAvailabilityChanged"
        @scroll="handleGridScroll"
        @toggle-player-modal="togglePlayerModal"
        @toggle-availability="toggleAvailability"
        @toggle-selection-status="toggleSelectionStatus"
        @show-availability-modal="openAvailabilityModal"
        @show-confirmation-modal="openConfirmationModal"
        @event-click="openEventModal"
        @all-players-loaded="handleAllPlayersLoaded"
        @all-events-loaded="handleAllEventsLoaded"
      />
                </div>
                
    <div v-if="validCurrentView === 'timeline' && events.length > 0" class="w-full bg-gray-900">
      
      <!-- Modal de sélection supprimé d'ici - déplacé au niveau global -->
      
      <TimelineView
        :events="displayedEvents"
        :players="allSeasonPlayers"
        :availability="availability"
        :casts="casts"
        :season-id="seasonId"
        :selected-player-id="selectedPlayerId"
        :selected-event-id="selectedEventId"
        :preferred-player-ids-set="preferredPlayerIdsSet"
        :is-available="isAvailable"
        :is-player-selected="isPlayerSelected"
        :is-selection-confirmed="isSelectionConfirmed"
        :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer"
        :get-player-selection-status="getPlayerSelectionStatus"
        :get-availability-data="getAvailabilityData"
        :is-player-protected-in-grid="isPlayerProtectedInGrid"
        :chances="chances"
        :is-selection-complete="isSelectionComplete"
        :can-edit-events="canEditEvents"
        :get-selection-players="getSelectionPlayers"
        :get-total-required-count="getTotalRequiredCount"
        :count-available-players="countAvailablePlayers"
        :count-players-with-response="countPlayersWithResponse"
        :is-all-events-view="isAllEventsView"
        :hidden-events-count="hiddenEventsCount"
        :hidden-events-display-text="hiddenEventsDisplayText"
        :is-available-for-role="isAvailableForRole"
        @event-click="handleEventClickFromTimeline"
        @player-click="showPlayerDetails"
        @view-change="selectView"
        @availability-toggle="handleAvailabilityToggle"
        @selection-status-toggle="handlePlayerSelectionStatusToggle"
        @show-availability-modal="openAvailabilityModal"
        @show-confirmation-modal="openConfirmationModal"
        @show-composition-modal="showCompositionModal"
        @player-selected="handlePlayerSelected"
        @all-players-selected="handleAllPlayersSelected"
        @all-events-loaded="handleAllEventsLoaded"
      />
    </div>
    <!-- Message de chargement pour la vue chronologique -->
    <div v-if="validCurrentView === 'timeline' && events.length === 0" class="w-full px-4 py-6 bg-gray-900 text-center"
         style="padding-top: calc(max(64px, env(safe-area-inset-top) + 32px)); margin-top: calc(-1 * max(64px, env(safe-area-inset-top) + 32px));">
      <div class="text-white text-lg">Chargement des événements...</div>
  </div>
    </template>

    <!-- Event full-screen (canonical URL /season/:slug/event/:eventId). flex-1 pour occuper toute la hauteur sous le header. -->
    <div v-if="isEventFullScreen" class="w-full flex-1 min-h-0 flex flex-col bg-gray-900">
      <div v-if="events.length === 0" class="flex-1 flex items-center justify-center p-8">
        <div class="text-white/80">Chargement…</div>
      </div>
      <div v-else-if="!selectedEvent" class="flex-1 flex flex-col items-center justify-center p-8 gap-4">
        <p class="text-white/80">Événement introuvable</p>
        <a :href="`/season/${props.slug}`" class="text-purple-300 hover:text-purple-200 underline">Retour à la saison</a>
      </div>
      <!-- Same content as event-details modal, in-page (no overlay), full-width black like participants/agenda -->
      <div v-else class="flex flex-col flex-1 min-h-0 w-full bg-gray-900">
        <div class="px-2 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-5 pb-1 sm:pb-2 md:pb-2 space-y-2 sm:space-y-4 overflow-y-auto flex-1 min-h-0 max-w-6xl mx-auto w-full">
          <div v-if="currentUser" class="mt-0">
            <div class="flex justify-center mb-1">
              <div class="inline-flex bg-gray-800/50 rounded-lg p-1 gap-0.5">
                <button @click="setEventDetailsTab('info')" :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors', eventDetailsActiveTab === 'info' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50']"><span>ℹ️</span><span>Infos</span></button>
                <button @click="setEventDetailsTab('team')" :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors', eventDetailsActiveTab === 'team' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50']"><span>🧩</span><span>Dispos</span></button>
                <button @click="setEventDetailsTab('composition')" :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors', eventDetailsActiveTab === 'composition' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50']"><span>🎭</span><span>Équipe</span></button>
              </div>
            </div>
            <div class="pt-2 px-1 pb-1 sm:p-2 md:p-3">
              <div v-if="eventDetailsActiveTab === 'info'" class="w-full space-y-6">
                <div class="flex items-center justify-between gap-2 mb-4">
                  <div class="flex-none">
                    <SelectionStatusBadge v-if="selectedEvent && eventStatus" :status="eventStatus.type" :show="true" :clickable="false" :reason="eventWarningText" class="text-xs" />
                  </div>
                  <div class="relative flex-shrink-0">
                    <button @click="showEventActionsDropdown = !showEventActionsDropdown" class="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10" title="Actions de l'événement">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                    </button>
                    <div v-if="showEventActionsDropdown" class="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 min-w-[180px]">
                      <button @click="copyEventLinkToClipboard(selectedEvent); showEventActionsDropdown = false" class="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded flex items-center gap-2"><span>🔗</span><span>Partager</span></button>
                      <button @click="isEventMonitoredState ? disableEventNotifications(selectedEvent) : promptForNotifications(selectedEvent); showEventActionsDropdown = false" class="w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2" :class="isEventMonitoredState ? 'text-green-400' : 'text-purple-400'"><span>{{ isEventMonitoredState ? '🔕' : '🔔' }}</span><span>{{ isEventMonitoredState ? 'Désactiver les notifications' : 'Activer les notifications' }}</span></button>
                      <template v-if="canEditEvents">
                        <div class="border-t border-gray-600 my-1"></div>
                        <div class="px-3 py-1 text-xs text-gray-400 font-medium">Actions administrateur</div>
                        <button @click="openEventAnnounceModal(selectedEvent); showEventActionsDropdown = false" :disabled="selectedEvent?.archived" class="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded flex items-center gap-2 disabled:opacity-50"><span>📢</span><span>Annoncer</span></button>
                        <button @click="startEditingFromDetails(); showEventActionsDropdown = false" class="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded flex items-center gap-2"><span>✏️</span><span>Modifier</span></button>
                        <button @click="toggleEventArchived(); showEventActionsDropdown = false" class="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-700 rounded flex items-center gap-2"><span>📁</span><span>{{ selectedEvent?.archived ? 'Désarchiver' : 'Archiver' }}</span></button>
                        <button @click="confirmDeleteEvent(selectedEvent?.id); showEventActionsDropdown = false" class="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded flex items-center gap-2"><span>🗑️</span><span>Supprimer</span></button>
                      </template>
                    </div>
                  </div>
                </div>
                <section class="space-y-1"><h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide">Titre</h3><div class="text-sm text-gray-300 bg-gray-800/30 p-3 rounded-lg border border-gray-600/30">{{ selectedEvent?.title || '—' }}</div></section>
                <section class="space-y-1"><h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</h3><div v-if="selectedEvent?.description" class="text-sm text-gray-300 bg-gray-800/30 p-3 rounded-lg border border-gray-600/30"><div class="whitespace-pre-wrap">{{ selectedEvent.description }}</div></div><p v-else class="text-sm text-gray-500 italic">Aucune description</p></section>
                <section class="space-y-1"><h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</h3><div class="relative inline-block"><button @click="showCalendarDropdown = !showCalendarDropdown" class="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer bg-gray-800/30 px-3 py-2 rounded-lg border border-gray-600/30" title="Ajouter à votre agenda"><span>📆</span><span>{{ formatDateFull(selectedEvent?.date) }}</span><svg class="w-3 h-3 transform transition-transform duration-200" :class="{ 'rotate-180': showCalendarDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button><div v-if="showCalendarDropdown" class="absolute z-50 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg min-w-[150px] left-0"><div class="p-2"><div class="text-xs text-gray-400 mb-2">Ajouter à votre agenda :</div><button @click="addToGoogleCalendar(selectedEvent); showCalendarDropdown = false" class="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded flex items-center gap-2"><span>📅</span><span>Google</span></button><button @click="addToOutlookCalendar(selectedEvent); showCalendarDropdown = false" class="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded flex items-center gap-2"><span>📧</span><span>Outlook</span></button><button @click="addToAppleCalendar(selectedEvent); showCalendarDropdown = false" class="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded flex items-center gap-2"><span>🍎</span><span>Apple</span></button></div></div></div></section>
                <section class="space-y-2"><h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide">Lieu</h3><div v-if="selectedEvent?.location" class="space-y-3"><div class="relative inline-block min-w-0 max-w-full"><button @click="showGoogleMapsDropdown = !showGoogleMapsDropdown" class="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer bg-gray-800/30 px-3 py-2 rounded-lg border border-gray-600/30 min-w-0" :title="`Ouvrir ${selectedEvent.location} dans Google Maps`"><span>📍</span><span class="truncate">{{ selectedEvent.location }}</span><svg class="w-3 h-3 flex-shrink-0 transform transition-transform duration-200" :class="{ 'rotate-180': showGoogleMapsDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button><div v-if="showGoogleMapsDropdown" class="absolute left-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 min-w-[200px]"><div class="p-2"><a :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.location)}`" target="_blank" rel="noopener noreferrer" @click="showGoogleMapsDropdown = false" class="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded flex items-center gap-2">Ouvrir dans Google Maps</a><a :href="`https://waze.com/ul?q=${encodeURIComponent(selectedEvent.location)}`" target="_blank" rel="noopener noreferrer" @click="showGoogleMapsDropdown = false" class="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded flex items-center gap-2">Ouvrir dans Waze</a></div></div></div><div class="w-full overflow-hidden rounded-lg border border-gray-600/30 h-48"><iframe :src="getGoogleMapsEmbedUrl(selectedEvent.location)" width="100%" height="100%" style="border:0; border-radius: 8px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" class="rounded-lg w-full h-full" title="Carte" /></div></div><p v-else class="text-sm text-gray-500 italic">Aucun lieu renseigné</p></section>
              </div>
              <div v-if="eventDetailsActiveTab === 'composition'" class="min-h-0 flex flex-col">
                <div v-if="!hasCompositionForSelectedEvent && !canEditSelectedEvent" class="text-center py-8"><div class="text-gray-400 text-lg mb-2">🎭</div><div class="text-gray-300 text-sm">Aucun tirage pour le moment</div><div class="text-gray-500 text-xs mt-1">La composition s'affichera ici une fois le tirage effectué</div></div>
                <SelectionModal v-else-if="selectedEvent" ref="inlineSelectionModalRef" :inline="true" :show="true" :event="selectedEvent" :current-selection="casts[selectedEvent?.id] || []" :available-count="countAvailablePlayers(selectedEvent?.id)" :selected-count="countSelectedPlayers(selectedEvent?.id)" :availability="availability" :is-available-for-role="isAvailableForRole" :count-selections="countSelections" :season-id="seasonId" :season-slug="seasonSlug" :players="enrichedAllSeasonPlayers" :all-season-players="allSeasonPlayers" :sending="isSendingNotifications" :is-selection-confirmed="isSelectionConfirmed(selectedEvent?.id)" :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer(selectedEvent?.id)" :can-edit-events="canEditEvents" @selection="handleSelectionFromModal" @perfect="handlePerfectFromModal" @send-notifications="handleSendNotifications" @updateCast="handleUpdateCastFromModal" @confirm-selection="handleConfirmSelectionFromModal" @unconfirm-selection="handleUnconfirmCastFromModal" @reset-selection="handleResetSelectionFromModal" @confirm-reselect="handleConfirmReselectFromModal" @fill-cast="handleFillCastFromModal" @slot-confirmation-click="handleSelectionModalSlotConfirmationClick" />
              </div>
              <div v-if="eventDetailsActiveTab === 'team'">
                <div class="flex items-center justify-between mb-2 sm:mb-4"><div class="flex items-center gap-2"><div class="relative flex-shrink-0"><button @click="toggleAvailabilityPlayerSelector" class="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white hover:bg-gray-700/50 transition-colors min-w-24 md:min-w-32"><div v-if="selectedTeamPlayer && selectedTeamPlayer.id !== 'all'" class="flex-shrink-0"><PlayerAvatar :player-id="selectedTeamPlayer.id" :player-name="selectedTeamPlayer.name" :season-id="seasonId" :player-gender="selectedTeamPlayer.gender || 'non-specified'" size="sm" class="w-5 h-5" /></div><div v-else class="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-gray-600 rounded-full"><span class="text-xs">👥</span></div><span class="flex-1 text-left text-xs md:text-sm truncate">{{ selectedTeamPlayer && selectedTeamPlayer.id !== 'all' ? selectedTeamPlayer.name : 'Tous' }}</span><svg class="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg></button></div><div class="flex items-center gap-1.5"><button @click="selectAllAvailabilityPlayers" :class="['px-2 md:px-3 py-1.5 text-xs md:text-sm rounded-lg transition-colors', selectedTeamPlayer?.id === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white']" title="Afficher tous les joueurs">👥 Tous</button><button v-if="currentUserPlayer || (preferredPlayerIdsSet.size > 0)" @click="selectFirstFavoriteAvailabilityPlayer" :class="['px-2 md:px-3 py-1.5 text-xs md:text-sm rounded-lg transition-colors', (selectedTeamPlayer?.id === currentUserPlayer?.id || selectedTeamPlayer?.id === getFirstFavoritePlayerId()) ? 'bg-purple-600 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white']" title="Afficher mes disponibilités">👤 Moi</button></div></div></div>
                <div v-if="selectedTeamPlayer && selectedTeamPlayer.id !== 'all'" class="space-y-3 p-3"><div v-if="canModifySelectedPlayerAvailability === null" class="bg-gray-800/50 rounded-lg p-4 border border-gray-600/50"><div class="flex items-center justify-center gap-3"><svg class="animate-spin h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span class="text-sm text-gray-300">Vérification des permissions...</span></div></div><AvailabilityForm v-else :player-gender="selectedTeamPlayer.gender" :player-id="selectedTeamPlayer.id" :current-availability="getAvailabilityData(selectedTeamPlayer.name, selectedEvent?.id)" :is-read-only="!canModifySelectedPlayerAvailability" :season-id="seasonId" :event-roles="selectedEvent?.roles || {}" :available-roles="getEventAvailableRoles()" :self-persist="canModifySelectedPlayerAvailability" :player-name="selectedTeamPlayer.name" :event-id="selectedEvent?.id" @update:availability="handleAvailabilityFormUpdate" @availability-saved="handleAvailabilitySaved" /><div v-if="!selectedEvent?.roles || Object.keys(selectedEvent.roles).length === 0" class="bg-gray-700/30 rounded-lg p-4"><div class="text-center"><div class="text-2xl mb-2">🎯</div><p class="text-sm text-gray-300">Événement sans rôles spécifiques</p><p class="text-xs text-gray-400 mt-1">Vous serez assigné selon les besoins de l'équipe</p></div></div></div>
                <div v-if="selectedEvent && (selectedTeamPlayer?.id === 'all' || !selectedTeamPlayer) && allSeasonPlayers.length === 0" class="text-center py-8 text-gray-400"><div class="text-lg mb-2">⏳</div><div class="text-sm">Chargement des joueurs...</div></div>
                <div v-else-if="selectedEvent && (selectedTeamPlayer?.id === 'all' || !selectedTeamPlayer) && (!selectedEvent.roles || Object.keys(selectedEvent.roles).length === 0)" class="text-center py-8 text-gray-400"><div class="text-lg mb-2">🎯</div><div class="text-sm">Aucun rôle défini pour cet événement</div></div>
                <EventRoleGroupingView v-else-if="selectedEvent && (selectedTeamPlayer?.id === 'all' || !selectedTeamPlayer)" :selected-event="selectedEvent" :season-id="seasonId" :players="allSeasonPlayers" :show-role-status="!selectedTeamPlayer" :availability="availability" :casts="casts" :chances="chances" :preferred-player-ids-set="preferredPlayerIdsSet" :is-available="isAvailable" :is-player-selected="isPlayerSelected" :is-player-selected-for-role="isPlayerSelectedForRole" :is-selection-confirmed="isSelectionConfirmed" :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer" :get-player-selection-status="getPlayerSelectionStatus" :get-availability-data="getAvailabilityData" :is-player-protected-in-grid="isPlayerProtectedInGrid" :is-player-loading="isPlayerLoading" :is-player-availability-loaded="isPlayerAvailabilityLoaded" :is-player-error="isPlayerError" :get-event-status="getEventStatus" :get-event-tooltip="getEventTooltip" :handle-availability-toggle="handleAvailabilityToggle" :handle-player-selection-status-toggle="handlePlayerSelectionStatusToggle" :open-availability-modal="openAvailabilityModal" :is-available-for-role="isAvailableForRole" :is-selection-complete="isSelectionComplete" :get-player-role-chances="getPlayerRoleChances" :count-selections="countSelections" :open-confirmation-modal="openConfirmationModal" />
              </div>
            </div>
          </div>
        </div>
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


  <!-- Popin Afficher Tous avec autocomplete -->
  <div v-if="showShowMoreModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1400] p-4" @click="closeShowMoreModal">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
      <!-- Header -->
      <div class="p-6 border-b border-white/10">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-white">Afficher plus de joueurs</h2>
          <button @click="closeShowMoreModal" class="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">
            ✖️
          </button>
        </div>
      </div>
      
      <!-- Content -->
      <div class="p-6">
        <!-- Input de recherche -->
        <div class="mb-4">
          <input
            v-model="showMoreSearchQuery"
            type="text"
            placeholder="Rechercher un joueur..."
            class="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            @keyup.escape="closeShowMoreModal"
            ref="showMoreSearchInput"
          />
        </div>
        
        <!-- Liste des joueurs -->
        <div class="max-h-80 overflow-y-auto">
          <!-- Option "Tous" -->
          <div
            @click="selectAllPlayers"
            class="px-4 py-3 hover:bg-gray-700 cursor-pointer flex items-center gap-3 rounded-lg transition-colors duration-200"
          >
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
              <span class="text-white text-lg font-bold">👥</span>
            </div>
            <div>
              <div class="text-white font-medium">Tous</div>
              <div class="text-gray-400 text-sm">Charger tous les joueurs de la saison</div>
            </div>
          </div>
          
          <!-- Séparateur -->
          <div class="border-t border-gray-600 my-2"></div>
          
                 <!-- Liste des joueurs filtrés -->
                 <div
                   v-for="player in filteredShowMorePlayers"
                   :key="player.id"
                   @click="selectExistingPlayer(player)"
                   class="px-4 py-3 hover:bg-gray-700 cursor-pointer flex items-center gap-3 rounded-lg transition-colors duration-200 relative"
                 >
                  <PlayerAvatar 
                    v-bind="getPlayerAvatarProps(player)"
                    :show-status-icons="true"
                  />
                   <div class="flex-1">
                     <div class="text-white font-medium">{{ player.name }}</div>
                   </div>
                   
                   <!-- Icônes à droite -->
                   <div class="flex items-center">
                     <!-- Icône étoile (joueur favori) -->
                     <span v-if="preferredPlayerIdsSet.has(player.id)" class="text-yellow-400 text-lg" title="Favori">
                       ⭐
                     </span>
                     <!-- Icône d'avertissement (joueur non-protégé) avec tooltip personnalisé -->
                     <CustomTooltip
                       v-else-if="!isPlayerProtectedInGrid(player.id)"
                       :content="getUnprotectedPlayerTooltip(player)"
                       position="bottom"
                     >
                       <span class="text-orange-400 text-lg cursor-help">
                         ⚠️
                       </span>
                     </CustomTooltip>
                   </div>
                 </div>
          
          <!-- Séparateur -->
          <div class="border-t border-gray-600 my-2"></div>
          
          <!-- Option "Ajouter" -->
          <div
            @click="addNewPlayerFromShowMore"
            class="px-4 py-3 hover:bg-gray-700 cursor-pointer flex items-center gap-3 rounded-lg transition-colors duration-200"
          >
            <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <span class="text-white text-lg font-bold">+</span>
            </div>
            <div>
              <div class="text-white font-medium">Ajouter</div>
              <div class="text-gray-400 text-sm">Créer un nouveau joueur</div>
            </div>
          </div>
        </div>
      </div>
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
      <h2 class="text-2xl font-bold mb-6 text-white text-center">👤 Nouveau Participant</h2>
      
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
        <label class="block text-sm font-medium text-gray-300 mb-3">Quel genre utiliser pour la désigner ?</label>
        <div class="space-y-3">
          <label class="flex items-center space-x-3 cursor-pointer group">
            <input
              v-model="newPlayerGender"
              type="radio"
              value="female"
              class="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 focus:ring-purple-500 focus:ring-2"
            >
            <span class="text-white group-hover:text-purple-300 transition-colors">Féminin (ex: une joueuse, une improvisatrice)</span>
          </label>
          <label class="flex items-center space-x-3 cursor-pointer group">
            <input
              v-model="newPlayerGender"
              type="radio"
              value="male"
              class="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 focus:ring-purple-500 focus:ring-2"
            >
            <span class="text-white group-hover:text-purple-300 transition-colors">Masculin (ex: un joueur, un improvisateur)</span>
          </label>
          <label class="flex items-center space-x-3 cursor-pointer group">
            <input
              v-model="newPlayerGender"
              type="radio"
              value="non-specified"
              class="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 focus:ring-purple-500 focus:ring-2"
            >
            <span class="text-white group-hover:text-purple-300 transition-colors">Non spécifié (ex: un.e joueur.se, un.e improvisateur.trice)</span>
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
  <!-- Popin de détails de l'événement (masquée quand on est sur l'URL canonique /event/:id) -->
  <div v-if="showEventDetailsModal && !isEventFullScreen" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[1360] p-0 sm:p-2 md:p-4" @click="closeEventDetailsAndUpdateUrl">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-[100vw] sm:max-w-lg md:max-w-6xl h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem)] sm:h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-4rem)] md:max-h-[92vh] flex flex-col mb-0 sm:mb-4 md:mb-0" @click.stop>
      <!-- Header -->
      <div class="relative p-1 sm:p-2 md:p-3 pb-1 sm:pb-2">
        <button @click="closeEventDetailsAndUpdateUrl" title="Fermer" class="absolute right-2 top-2 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 z-10">✖️</button>
        
        <!-- Titre avec pastille intégrée et icône 3-dots pour actions - Pleine largeur -->
        <div class="flex flex-col gap-2 mb-2">
          <!-- Ligne principale : Pastille + Titre + Icône 3-dots -->
          <div class="flex items-center gap-2">
            <span class="text-lg text-gray-300 bg-gray-700/50 px-2 py-1 rounded-md border border-gray-600/50">{{ getEventTypeIcon(selectedEvent) }}</span>
            <!-- Titre avec dropdown intégré -->
            <div class="relative flex-1 min-w-0">
              <h2 
                @click="showEventActionsDropdown = !showEventActionsDropdown"
                class="text-xl font-bold text-white leading-tight cursor-pointer hover:text-purple-300 transition-colors flex items-center gap-2"
                title="Cliquer pour les actions de l'événement"
              >
                {{ selectedEvent?.title }}
                <!-- Icône 3-dots pour indiquer les actions disponibles -->
                <button
                  @click.stop="showEventActionsDropdown = !showEventActionsDropdown"
                  class="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 flex-shrink-0"
                  title="Actions de l'événement"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </button>
              </h2>
              <p v-if="selectedEvent?.date" class="text-xs text-gray-400 mt-0.5">{{ formatDateFull(selectedEvent.date) }}</p>
              
              <!-- Menu dropdown -->
              <div v-if="showEventActionsDropdown" class="absolute left-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 min-w-[180px]">
                
                <!-- Actions utilisateur -->
                <!-- Action Partager -->
                <button
                  @click="copyEventLinkToClipboard(selectedEvent); showEventActionsDropdown = false"
                  class="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded flex items-center gap-2"
                >
                  <span>🔗</span>
                  <span>Partager</span>
                </button>
                
                <!-- Action Notifications -->
                <button
                  @click="isEventMonitoredState ? disableEventNotifications(selectedEvent) : promptForNotifications(selectedEvent); showEventActionsDropdown = false"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded flex items-center gap-2"
                  :class="isEventMonitoredState ? 'text-green-400' : 'text-purple-400'"
                  :title="`État: ${isEventMonitoredState ? 'notifications activées' : 'notifications désactivées'}`"
                >
                  <span>{{ isEventMonitoredState ? '🔕' : '🔔' }}</span>
                  <span>{{ isEventMonitoredState ? 'Désactiver les notifications' : 'Activer les notifications' }}</span>
                </button>
                
                <!-- Actions admin (avec PIN) -->
                <template v-if="canEditEvents">
                  <!-- Séparateur -->
                  <div class="border-t border-gray-600 my-1"></div>
                  
                  <!-- En-tête admin -->
                  <div class="px-3 py-1 text-xs text-gray-400 font-medium">
                    Actions administrateur
                  </div>
                  
                  <!-- Action Annoncer -->
                  <button
                    @click="openEventAnnounceModal(selectedEvent); showEventActionsDropdown = false"
                    :disabled="selectedEvent?.archived"
                    class="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    :title="selectedEvent?.archived ? 'Impossible d\'annoncer un événement inactif' : 'Annoncer l\'événement aux personnes (email, copie, WhatsApp)'"
                  >
                    <span>📢</span>
                    <span>Annoncer</span>
                  </button>
                  
                  <!-- Action Modifier -->
                  <button
                    @click="startEditingFromDetails(); showEventActionsDropdown = false"
                    class="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded flex items-center gap-2"
                  >
                    <span>✏️</span>
                    <span>Modifier</span>
                  </button>
                  
                  <!-- Action Archiver -->
                  <button
                    @click="toggleEventArchived(); showEventActionsDropdown = false"
                    class="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-700 rounded flex items-center gap-2"
                  >
                    <span>📁</span>
                    <span>{{ selectedEvent?.archived ? 'Désarchiver' : 'Archiver' }}</span>
                  </button>
                  
                  <!-- Action Supprimer -->
                  <button
                    @click="confirmDeleteEvent(selectedEvent?.id); showEventActionsDropdown = false"
                    class="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded flex items-center gap-2"
                  >
                    <span>🗑️</span>
                    <span>Supprimer</span>
                  </button>
                </template>
              </div>
            </div>
          </div>
          
          <!-- Status de l'événement (badge seul ; détails dans l'onglet Info) -->
          <div v-if="selectedEvent && eventStatus" class="flex items-center justify-between pl-1">
            <SelectionStatusBadge
              :status="eventStatus.type"
              :show="true"
              :clickable="false"
              :reason="eventWarningText"
              class="text-xs"
            />
          </div>
        </div>
        
      </div>
      
      <!-- Content scrollable (margins minimisées sur mobile pour maximiser la place, ex. iPhone SE) -->
      <div class="px-1 sm:px-4 md:px-6 py-1 sm:py-2 md:py-3 space-y-2 sm:space-y-4 overflow-y-auto flex-1 min-h-0">
        <div v-if="currentUser" class="mt-0">
          <!-- Onglets style pilules centrées (comme Tous/Moi et ViewHeader) -->
          <div class="flex justify-center mb-2 sm:mb-3">
            <div class="inline-flex bg-gray-800/50 rounded-lg p-1 gap-0.5">
              <button
                @click="setEventDetailsTab('info')"
                :class="[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors',
                  eventDetailsActiveTab === 'info'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                ]"
              >
                <span>ℹ️</span>
                <span>Infos</span>
              </button>
              <button
                @click="setEventDetailsTab('team')"
                :class="[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors',
                  eventDetailsActiveTab === 'team'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                ]"
              >
                <span>🧩</span>
                <span>Dispos</span>
              </button>
              <button
                @click="setEventDetailsTab('composition')"
                :class="[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors',
                  eventDetailsActiveTab === 'composition'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                ]"
              >
                <span>🎭</span>
                <span>Équipe</span>
              </button>
            </div>
          </div>
          
          <!-- Contenu des onglets (padding réduit sur mobile, plus d’air en haut sur mobile) -->
          <div class="pt-4 px-1 pb-1 sm:p-2 md:p-3">

            <!-- Onglet Info : Titre, Description, Date, Lieu -->
            <div v-if="eventDetailsActiveTab === 'info'" class="w-full space-y-6">
              <!-- 1. Section Titre -->
              <section class="space-y-1">
                <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide">Titre</h3>
                <div class="text-sm text-gray-300 bg-gray-800/30 p-3 rounded-lg border border-gray-600/30">{{ selectedEvent?.title || '—' }}</div>
              </section>

              <!-- 2. Section Description -->
              <section class="space-y-1">
                <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</h3>
                <div v-if="selectedEvent?.description" class="text-sm text-gray-300 bg-gray-800/30 p-3 rounded-lg border border-gray-600/30">
                  <div class="whitespace-pre-wrap">{{ selectedEvent.description }}</div>
                </div>
                <p v-else class="text-sm text-gray-500 italic">Aucune description</p>
              </section>

              <!-- 3. Section Date -->
              <section class="space-y-1">
                <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</h3>
                <div class="relative inline-block">
                  <button
                    @click="showCalendarDropdown = !showCalendarDropdown"
                    class="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer bg-gray-800/30 px-3 py-2 rounded-lg border border-gray-600/30"
                    title="Ajouter à votre agenda"
                  >
                    <span>📆</span>
                    <span>{{ formatDateFull(selectedEvent?.date) }}</span>
                    <svg class="w-3 h-3 transform transition-transform duration-200" :class="{ 'rotate-180': showCalendarDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  <div v-if="showCalendarDropdown" class="absolute z-50 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg min-w-[150px] left-0">
                    <div class="p-2">
                      <div class="text-xs text-gray-400 mb-2">Ajouter à votre agenda :</div>
                      <button @click="addToGoogleCalendar(selectedEvent); showCalendarDropdown = false" class="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded flex items-center gap-2"><span>📅</span><span>Google</span></button>
                      <button @click="addToOutlookCalendar(selectedEvent); showCalendarDropdown = false" class="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded flex items-center gap-2"><span>📧</span><span>Outlook</span></button>
                      <button @click="addToAppleCalendar(selectedEvent); showCalendarDropdown = false" class="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded flex items-center gap-2"><span>🍎</span><span>Apple</span></button>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 4. Section Lieu (adresse + carte) -->
              <section class="space-y-2">
                <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide">Lieu</h3>
                <div v-if="selectedEvent?.location" class="space-y-3">
                  <div class="relative inline-block min-w-0 max-w-full">
                    <button
                      @click="showGoogleMapsDropdown = !showGoogleMapsDropdown"
                      class="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer bg-gray-800/30 px-3 py-2 rounded-lg border border-gray-600/30 min-w-0"
                      :title="`Ouvrir ${selectedEvent.location} dans Google Maps`"
                    >
                      <span>📍</span>
                      <span class="truncate">{{ selectedEvent.location }}</span>
                      <svg class="w-3 h-3 flex-shrink-0 transform transition-transform duration-200" :class="{ 'rotate-180': showGoogleMapsDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    <div v-if="showGoogleMapsDropdown" class="absolute left-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 min-w-[200px]">
                      <div class="p-2">
                        <a :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.location)}`" target="_blank" rel="noopener noreferrer" @click="showGoogleMapsDropdown = false" class="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded flex items-center gap-2"><span>Ouvrir dans Google Maps</span></a>
                        <a :href="`https://waze.com/ul?q=${encodeURIComponent(selectedEvent.location)}`" target="_blank" rel="noopener noreferrer" @click="showGoogleMapsDropdown = false" class="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded flex items-center gap-2"><span>Ouvrir dans Waze</span></a>
                      </div>
                    </div>
                  </div>
                  <div class="w-full overflow-hidden rounded-lg border border-gray-600/30 h-48">
                    <iframe
                      :src="getGoogleMapsEmbedUrl(selectedEvent.location)"
                      width="100%" height="100%"
                      style="border:0; border-radius: 8px;"
                      allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
                      class="rounded-lg w-full h-full"
                      @click="showGoogleMapsDropdown = !showGoogleMapsDropdown"
                      title="Cliquer pour voir les options de navigation"
                    ></iframe>
                  </div>
                </div>
                <p v-else class="text-sm text-gray-500 italic">Aucun lieu renseigné</p>
              </section>
            </div>

            <!-- Onglet Composition : état vide ou UI complète (inline) -->
            <div v-if="eventDetailsActiveTab === 'composition'" class="min-h-0 flex flex-col">
              <!-- État vide : aucun tirage et utilisateur ne peut pas gérer la composition -->
              <div v-if="!hasCompositionForSelectedEvent && !canEditSelectedEvent" class="text-center py-8">
                <div class="text-gray-400 text-lg mb-2">🎭</div>
                <div class="text-gray-300 text-sm">
                  Aucun tirage pour le moment
                </div>
                <div class="text-gray-500 text-xs mt-1">
                  La composition s'affichera ici une fois le tirage effectué
                </div>
              </div>

              <!-- UI complète de composition (inline, pas de popup) -->
              <SelectionModal
                v-else-if="selectedEvent"
                ref="inlineSelectionModalRef"
                :inline="true"
                :show="true"
                :event="selectedEvent"
                :current-selection="casts[selectedEvent?.id] || []"
                :available-count="countAvailablePlayers(selectedEvent?.id)"
                :selected-count="countSelectedPlayers(selectedEvent?.id)"
                :availability="availability"
                :is-available-for-role="isAvailableForRole"
                :count-selections="countSelections"
                :season-id="seasonId"
                :season-slug="seasonSlug"
                :players="enrichedAllSeasonPlayers"
                :all-season-players="allSeasonPlayers"
                :sending="isSendingNotifications"
                :is-selection-confirmed="isSelectionConfirmed(selectedEvent?.id)"
                :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer(selectedEvent?.id)"
                :can-edit-events="canEditEvents"
                @selection="handleSelectionFromModal"
                @perfect="handlePerfectFromModal"
                @send-notifications="handleSendNotifications"
                @updateCast="handleUpdateCastFromModal"
                @confirm-selection="handleConfirmSelectionFromModal"
                @unconfirm-selection="handleUnconfirmCastFromModal"
                @reset-selection="handleResetSelectionFromModal"
                @confirm-reselect="handleConfirmReselectFromModal"
                @fill-cast="handleFillCastFromModal"
                @slot-confirmation-click="handleSelectionModalSlotConfirmationClick"
              />
            </div>
            
            <!-- Onglet Disponibilités -->
            <div v-if="eventDetailsActiveTab === 'team'">
              <!-- Header des disponibilités -->
              <div class="flex items-center justify-between mb-2 sm:mb-4">
                <div class="flex items-center gap-2">
                  <!-- Sélecteur de joueur avec PlayerSelectorModal -->
                  <div class="relative flex-shrink-0">
                    <button
                      @click="toggleAvailabilityPlayerSelector"
                      class="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white hover:bg-gray-700/50 transition-colors min-w-24 md:min-w-32"
                    >
                      <!-- Avatar du joueur sélectionné -->
                      <div v-if="selectedTeamPlayer && selectedTeamPlayer.id !== 'all'" class="flex-shrink-0">
                        <PlayerAvatar
                          :player-id="selectedTeamPlayer.id"
                          :player-name="selectedTeamPlayer.name"
                          :season-id="seasonId"
                          :player-gender="selectedTeamPlayer.gender || 'non-specified'"
                          size="sm"
                          class="w-5 h-5"
                        />
                      </div>
                      <!-- Icône "Tous les joueurs" quand aucun joueur spécifique sélectionné -->
                      <div v-else class="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-gray-600 rounded-full">
                        <span class="text-xs">👥</span>
                      </div>
                      <span class="flex-1 text-left text-xs md:text-sm truncate">
                        {{ selectedTeamPlayer && selectedTeamPlayer.id !== 'all' ? selectedTeamPlayer.name : 'Tous' }}
                      </span>
                      <svg class="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Boutons raccourcis -->
                  <div class="flex items-center gap-1.5">
                    <!-- Bouton "Tous" -->
                    <button
                      @click="selectAllAvailabilityPlayers"
                      :class="[
                        'px-2 md:px-3 py-1.5 text-xs md:text-sm rounded-lg transition-colors',
                        selectedTeamPlayer?.id === 'all' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                      ]"
                      title="Afficher tous les joueurs"
                    >
                      👥 Tous
                    </button>
                    
                    <!-- Bouton "Moi" (uniquement si joueur connecté) -->
                    <button
                      v-if="currentUserPlayer || (preferredPlayerIdsSet.size > 0)"
                      @click="selectFirstFavoriteAvailabilityPlayer"
                      :class="[
                        'px-2 md:px-3 py-1.5 text-xs md:text-sm rounded-lg transition-colors',
                        (selectedTeamPlayer?.id === currentUserPlayer?.id || selectedTeamPlayer?.id === getFirstFavoritePlayerId()) 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                      ]"
                      title="Afficher mes disponibilités"
                    >
                      👤 Moi
                    </button>
                  </div>
                  
                </div>
              </div>
              
              
              

              <!-- Vue individuelle : disponibilités de la personne sélectionnée -->
              <div v-if="selectedTeamPlayer && selectedTeamPlayer.id !== 'all'" class="space-y-3 p-3">
                <!-- Message d'attente pendant la vérification des permissions -->
                <div v-if="canModifySelectedPlayerAvailability === null" class="bg-gray-800/50 rounded-lg p-4 border border-gray-600/50">
                  <div class="flex items-center justify-center gap-3">
                    <svg class="animate-spin h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-sm text-gray-300">Vérification des permissions...</span>
                  </div>
                </div>
                
                <!-- Toujours afficher le formulaire de disponibilités (onglet dédié aux dispos uniquement) -->
                <AvailabilityForm
                  v-else
                  :player-gender="selectedTeamPlayer.gender"
                  :player-id="selectedTeamPlayer.id"
                  :current-availability="getAvailabilityData(selectedTeamPlayer.name, selectedEvent?.id)"
                  :is-read-only="!canModifySelectedPlayerAvailability"
                  :season-id="seasonId"
                  :event-roles="selectedEvent?.roles || {}"
                  :available-roles="getEventAvailableRoles()"
                  :self-persist="canModifySelectedPlayerAvailability"
                  :player-name="selectedTeamPlayer.name"
                  :event-id="selectedEvent?.id"
                  @update:availability="handleAvailabilityFormUpdate"
                  @availability-saved="handleAvailabilitySaved"
                />
                
                <!-- Message si aucun rôle dans l'événement -->
                <div v-if="!selectedEvent?.roles || Object.keys(selectedEvent.roles).length === 0" class="bg-gray-700/30 rounded-lg p-4">
                  <div class="text-center">
                    <div class="text-2xl mb-2">🎯</div>
                    <p class="text-sm text-gray-300">
                      Événement sans rôles spécifiques
                    </p>
                    <p class="text-xs text-gray-400 mt-1">
                      Vous serez assigné selon les besoins de l'équipe
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Vue par rôles normale -->
              <div v-if="selectedEvent && (selectedTeamPlayer?.id === 'all' || !selectedTeamPlayer) && allSeasonPlayers.length === 0" class="text-center py-8 text-gray-400">
                <div class="text-lg mb-2">⏳</div>
                <div class="text-sm">Chargement des joueurs...</div>
              </div>
              <div v-else-if="selectedEvent && (selectedTeamPlayer?.id === 'all' || !selectedTeamPlayer) && (!selectedEvent.roles || Object.keys(selectedEvent.roles).length === 0)" class="text-center py-8 text-gray-400">
                <div class="text-lg mb-2">🎯</div>
                <div class="text-sm">Aucun rôle défini pour cet événement</div>
              </div>
              <EventRoleGroupingView
                v-else-if="selectedEvent && (selectedTeamPlayer?.id === 'all' || !selectedTeamPlayer)"
                :selected-event="selectedEvent"
                :season-id="seasonId"
                :players="allSeasonPlayers"
                :show-role-status="!selectedTeamPlayer"
                :availability="availability"
                :casts="casts"
                :chances="chances"
                :preferred-player-ids-set="preferredPlayerIdsSet"
                :is-available="isAvailable"
                :is-player-selected="isPlayerSelected"
                :is-player-selected-for-role="isPlayerSelectedForRole"
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
                :get-player-role-chances="getPlayerRoleChances"
                :count-selections="countSelections"
                :open-confirmation-modal="openConfirmationModal"
              />
            </div>
          </div>
        </div>


        <!-- More actions (mobile) - Supprimé, remplacé par un dropdown flottant -->
      </div>

      <!-- Footer sticky (desktop) -->
      <div class="hidden md:block sticky bottom-0 w-full p-3 bg-gray-900/95 border-t border-white/10 backdrop-blur-sm">
        <div class="flex justify-center flex-wrap gap-3">
          <!-- Boutons principaux -->
          <button 
            v-if="canEditSelectedEvent"
            @click="switchToCompositionTab" 
            class="px-5 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2" 
            title="Ouvrir l’onglet Composition"
          >
            <span>🎭</span><span>Composition Équipe</span>
          </button>
          
          <!-- Bouton Fermer -->
          <button @click="closeEventDetailsAndUpdateUrl" class="px-5 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300">Fermer</button>
        </div>
      </div>

      <!-- Footer sticky (mobile) -->
      <div class="md:hidden sticky bottom-0 w-full p-2 sm:p-3 bg-gray-900/95 border-t border-white/10 backdrop-blur-sm">
        <div class="flex items-center gap-1 sm:gap-2 min-w-0">
          <button 
            v-if="canEditSelectedEvent"
            @click="switchToCompositionTab" 
            class="h-10 sm:h-12 px-2 sm:px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex-1 min-w-0 text-xs sm:text-sm"
          >
            Composition
          </button>
          <button @click="closeEventDetailsAndUpdateUrl" class="h-10 sm:h-12 px-2 sm:px-4 bg-gray-700 text-white rounded-lg flex-1 min-w-0 text-xs sm:text-sm">Fermer</button>
        </div>
      </div>
    </div>
    </div>


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
    :show="showPlayerDetailsModal"
    :player="selectedPlayerForDetails"
    :stats="getPlayerStats(selectedPlayerForDetails)"
    :availability="availability"
    :season-id="seasonId"
    :season-slug="props.slug"
    :onboarding-step="playerTourStep"
    :onboarding-player-id="guidedPlayerId"
    :is-protected="selectedPlayerForDetails ? protectedPlayers.has(selectedPlayerForDetails.id) : false"
    :is-preferred="selectedPlayerForDetails ? preferredPlayerIdsSet.has(selectedPlayerForDetails.id) : false"
    @close="closePlayerDetailsModal"
    @update="handlePlayerUpdate"
    @delete="handlePlayerDelete"
    @refresh="handlePlayerRefresh"
    @avatar-updated="handleAvatarUpdated"
    @advance-onboarding="(s) => { try { if (typeof playerTourStep !== 'undefined') playerTourStep.value = s } catch {} }"
    @show-availability-grid="handleShowAvailabilityGrid"
  />

  <!-- Modal d'annonce d'événement -->
  <EventAnnounceModal
    :show="showEventAnnounceModal"
    :event="eventToAnnounce"
    :season-id="seasonId"
    :season-slug="seasonSlug"
    :players="enrichedAllSeasonPlayers"
    :sending="isSendingNotifications"
    :availability-by-player="getPlayerAvailabilityForEvent(eventToAnnounce?.id)"
    :show-availability="showAvailabilityInEventModal"
    :current-user-player="currentUserPlayer"
    :event-roles="getEventRoles(eventToAnnounce?.id)"
    @close="closeEventAnnounceModal"
    @send-notifications="handleSendNotifications"
    @availability-changed="handleAvailabilityChangedFromEventModal"
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
  <!-- Modal de confirmation -->
  <ConfirmationModal
    :show="showConfirmationModal"
    :player-name="confirmationModalData.playerName"
    :player-gender="confirmationModalData.playerGender"
    :event-id="confirmationModalData.eventId"
    :event-title="confirmationModalData.eventTitle"
    :event-date="confirmationModalData.eventDate"
    :assigned-role="confirmationModalData.assignedRole"
    :availability-comment="confirmationModalData.availabilityComment"
    :current-status="confirmationModalData.currentStatus"
    @close="showConfirmationModal = false"
    @confirm="handleConfirmationConfirm"
    @decline="handleConfirmationDecline"
    @pending="handleConfirmationPending"
  />

  <!-- Modal de développement -->
  <DevelopmentModal 
    :show="showDevelopmentModal"
    @close="showDevelopmentModal = false"
  />

  <!-- Chevrons de navigation flottants au milieu de l'écran -->
  <button
    v-show="showLeftHint"
    @click.prevent="onChevronClick(-1, $event)"
    @mousedown.prevent="startHoldScroll(-1, $event)"
    @mouseup="stopHoldScroll($event)"
    @mouseleave="stopHoldScroll($event)"
    @touchstart.prevent="startHoldScroll(-1, $event)"
    @touchend="stopHoldScroll($event)"
    @touchcancel="stopHoldScroll($event)"
    class="fixed left-2 top-1/2 transform -translate-y-1/2 w-16 h-16 rounded-full border border-white/20 bg-gray-900/60 hover:bg-white/15 text-white flex items-center justify-center z-[110] backdrop-blur-sm shadow-xl"
    title="Événements précédents — cliquez pour défiler"
  >
    <span class="text-2xl font-bold">‹</span>
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
    class="fixed right-2 top-1/2 transform -translate-y-1/2 w-16 h-16 rounded-full border border-white/20 bg-gray-900/60 hover:bg-white/15 text-white flex items-center justify-center z-[110] backdrop-blur-sm shadow-xl"
    title="Événements suivants — cliquez pour défiler"
  >
    <span class="text-2xl font-bold">›</span>
  </button>
  </div>

  

  <!-- Footer (desktop seulement) -->
  <div class="hidden md:block">
    <AppFooter @open-help="() => {}" />
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

.line-clamp-6 {
  display: -webkit-box;
  -webkit-line-clamp: 6;
  line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  position: sticky !important;
  left: 0 !important;
  z-index: 105 !important;
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
  
  /* Colonne atténuée pour événements inactifs */
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
.col-left { width: 5rem; }
/* .col-event width gérée dynamiquement via :style dans les composants */
.col-right { width: 4.5rem; }

@media (max-width: 768px) {
  /* Largeurs gérées dynamiquement via :style dans les composants */
  
  /* Largeurs gérées dynamiquement via :style dans les composants */
  
  /* S'assurer que l'header des événements a la même largeur que les cellules */
  .col-event.flex-shrink-0 {
    width: 5rem !important;
  }
}

/* Responsive mobile - iPhone 16 Plus et plus */
@media (max-width: 430px) {
  /* Largeurs gérées dynamiquement via :style dans les composants */
  
  /* Vue Spectacles : largeur gérée dynamiquement via :style dans les composants */
  
  /* Vue Participants : largeur gérée dynamiquement via :style dans les composants */
  
  .col-player {
    width: 20rem !important;
    min-width: 20rem !important;
    max-width: 20rem !important;
  }
  
  .col-event {
    width: 10rem !important;
    min-width: 10rem !important;
    max-width: 10rem !important;
  }
}

/* Responsive mobile - iPhone 16 et plus petit */
@media (max-width: 375px) {
  /* Largeurs gérées dynamiquement via :style dans les composants */
  
  /* Vue Spectacles : largeur gérée dynamiquement via :style dans les composants */
  
  .col-player {
    width: 18rem !important;
    min-width: 18rem !important;
    max-width: 18rem !important;
  }
  
  .col-event {
    width: 9rem !important;
    min-width: 9rem !important;
    max-width: 9rem !important;
  }
}


@media (min-width: 640px) { /* sm */
  .col-left { width: 5rem; }
  .left-col-td { 
    width: 5rem; 
    max-width: 5rem; 
    min-width: 5rem; 
    position: sticky !important;
    left: 0 !important;
    z-index: 105 !important;
  }
  /* .col-event width gérée dynamiquement via :style dans les composants */
  .col-player { width: 6rem; min-width: 6rem; max-width: 6rem; }
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
  
  /* Largeurs gérées dynamiquement via :style dans les composants */
  
  .col-event { 
    width: 5rem !important; /* Colonnes joueurs compactes */
  }
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
import { ref, computed, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue'
import CustomTooltip from './CustomTooltip.vue'
import { ROLES, ROLE_EMOJIS, ROLE_LABELS, ROLE_LABELS_SINGULAR, ROLE_DISPLAY_ORDER, ROLE_PRIORITY_ORDER, ROLE_TEMPLATES, TEMPLATE_DISPLAY_ORDER, EVENT_TYPE_ICONS, ROLE_LABELS_BY_GENDER, ROLE_LABELS_PLURAL_BY_GENDER } from '../services/storage.js'
import { canDisableRole } from '../services/rolePreferencesService.js'
import { isMobileOrPWA } from '../utils/deviceDetection.js'
import { getPlayerCastStatus, getPlayerCastRole, movePlayerToDeclined } from '../services/castService.js'
import { isAvailableForRole as checkAvailableForRole, getAvailabilityData as getAvailabilityDataFromService, countAvailablePlayers as countAvailablePlayersFromService } from '../services/playerAvailabilityService.js'
import { calculateAllRoleChances, calculateRoleChances, performWeightedDraw, calculatePlayerChanceForRole, formatChancePercentage, getChanceColorClass, getMalusColorClass } from '../services/chancesService.js'
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
import { listAssociationsForEmail } from '../services/players.js'
import { signOut } from 'firebase/auth'
import { isPlayerProtected, isPlayerPasswordCached, listProtectedPlayers, getPlayerEmail } from '../services/players.js'
import { 
  setEventArchived,
  loadPlayers,
  loadEvents,
  loadActiveEvents,
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
import { sendDecastEmailsForEvent } from '../services/emailService.js'
import { sendAvailabilityNotificationsForEvent, sendCastNotificationsForEvent } from '../services/notificationsService.js'
import { addToCalendar } from '../services/calendarService.js'
import { shouldPromptForNotifications, checkEmailExists } from '../services/notificationActivation.js'
import { verifySeasonPin, getSeasonPin } from '../services/seasons.js'
import pinSessionManager from '../services/pinSession.js'
import permissionService from '../services/permissionService.js'
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
import AvailabilityForm from './AvailabilityForm.vue'
import CreatorOnboardingModal from './CreatorOnboardingModal.vue'
import PlayerOnboardingModal from './PlayerOnboardingModal.vue'
import AccountMenu from './AccountMenu.vue'
import AccountClaimModal from './AccountClaimModal.vue'
import AccountLoginModal from './AccountLoginModal.vue'
import AppFooter from './AppFooter.vue'
import SeasonHeader from './SeasonHeader.vue'
import PreferencesModal from './PreferencesModal.vue'
import PlayersModal from './PlayersModal.vue'
import NotificationPromptModal from './NotificationPromptModal.vue'
import NotificationSuccessModal from './NotificationSuccessModal.vue'
import AccountCreationModal from './AccountCreationModal.vue'
import SelectionStatusBadge from './SelectionStatusBadge.vue'
import CompositionSlot from './CompositionSlot.vue'
import PlayerAvatar from './PlayerAvatar.vue'
import EventRoleGroupingView from './EventRoleGroupingView.vue'
import AvailabilityModal from './AvailabilityModal.vue'
import ConfirmationModal from './ConfirmationModal.vue'
import EventModal from './EventModal.vue'
import DevelopmentModal from './DevelopmentModal.vue'
import PerformanceDebug from './PerformanceDebug.vue'
import TimelineView from './TimelineView.vue'
import ParticipantsView from './ParticipantsView.vue'
import EventsView from './EventsView.vue'
import CastsView from './CastsView.vue'
import PlayerSelectorModal from './PlayerSelectorModal.vue'
import EventSelectorModal from './EventSelectorModal.vue'
import ViewHeader from './ViewHeader.vue'

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

// Redirect old event URL (?event=...&modal=event_details|selection) to canonical /season/:slug/event/:eventId
watch(
  () => ({ path: route.path, query: route.query }),
  ({ path, query }) => {
    if (route.params.eventId) return // already on canonical event path
    const eventId = query.event
    const modal = query.modal
    if (!eventId || (modal !== 'event_details' && modal !== 'selection')) return
    const slug = route.params.slug
    if (!slug) return
    const preserved = { ...query }
    delete preserved.event
    delete preserved.modal
    if (modal === 'selection') preserved.tab = 'compo'
    router.replace({ path: `/season/${slug}/event/${eventId}`, query: preserved })
  },
  { immediate: true }
)

// Initialiser Firebase Auth
const auth = getFirebaseAuth()

// Gestion de l'état d'authentification
async function onAuthStateChanged(user) {
  // Mettre à jour currentUser
  currentUser.value = user
  
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
  
  // Recharger les joueurs selon l'état de connexion
  if (seasonId.value) {
    try {
      if (user?.email) {
        // Utilisateur connecté : charger les joueurs protégés
        await loadUserOwnedPlayers()
        if (userOwnedPlayers.value.size > 0) {
          const allPlayers = await loadPlayers(seasonId.value)
          const filteredPlayers = allPlayers.filter(player => userOwnedPlayers.value.has(player.id))
          players.value = filteredPlayers
          logger.debug(`📊 Utilisateur connecté: chargé ${filteredPlayers.length} joueurs protégés`)
        } else {
          // Pas de joueurs protégés, charger tous les joueurs
          players.value = await loadPlayers(seasonId.value)
          logger.debug('📊 Utilisateur connecté sans joueurs protégés: chargé tous les joueurs')
        }
      } else {
        // Utilisateur déconnecté : charger tous les joueurs
        players.value = await loadPlayers(seasonId.value)
        logger.debug('📊 Utilisateur déconnecté: chargé tous les joueurs')
      }
      
      // Recharger les disponibilités
      const newAvailability = await loadAvailabilityForAllPlayers()
      availability.value = newAvailability
      
      // Mettre à jour les états de chargement
      players.value.forEach(player => {
        playerLoadingStates.value.set(player.id, 'loaded')
      })
      
    } catch (error) {
      logger.error('❌ Erreur lors du rechargement des joueurs après changement d\'auth:', error)
    }
  }
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

// Variables pour la gestion des disponibilités dans l'onglet Ma Dispo
const selectedRoles = ref([])
const commentText = ref('')
const isSaving = ref(false)
const availabilityFormData = ref({
  available: null,
  roles: [],
  comment: null
})

// Fonction pour initialiser les données de disponibilité
function initializeAvailabilityData() {
  if (!currentUserPlayer.value || !selectedEvent.value) return
  
  const availability = getCurrentUserAvailabilityForEvent()
  selectedRoles.value = [...(availability?.roles || [])]
  commentText.value = availability?.comment || ''
  
  // S'assurer que le rôle bénévole est toujours inclus s'il existe dans l'événement
  // ET que le joueur est disponible (available: true)
  if (selectedEvent.value.roles && 
      selectedEvent.value.roles[ROLES.VOLUNTEER] > 0 && 
      availability?.available === true) {
    // Forcer l'ajout du rôle bénévole s'il n'est pas déjà présent
    if (!selectedRoles.value.includes(ROLES.VOLUNTEER)) {
      selectedRoles.value.push(ROLES.VOLUNTEER)
    }
  }
}

// Fonction pour basculer la sélection d'un rôle
function toggleRoleSelection(role) {
  // Le rôle bénévole ne peut pas être décoché
  if (role === ROLES.VOLUNTEER) {
    return
  }
  
  const index = selectedRoles.value.indexOf(role)
  if (index > -1) {
    selectedRoles.value.splice(index, 1)
  } else {
    selectedRoles.value.push(role)
  }
  
  // Si on a au moins un rôle coché et qu'il y a un rôle bénévole dans l'événement,
  // l'ajouter automatiquement (obligatoire dès qu'on est disponible)
  if (selectedRoles.value.length > 0 && 
      selectedEvent.value?.roles?.[ROLES.VOLUNTEER] > 0 && 
      !selectedRoles.value.includes(ROLES.VOLUNTEER)) {
    selectedRoles.value.push(ROLES.VOLUNTEER)
  }
}

// Fonction pour sauvegarder toutes les disponibilités
async function saveAllAvailability() {
  if (!currentUserPlayer.value || !selectedEvent.value || isSaving.value) return
  
  isSaving.value = true
  
  try {
    const playerName = currentUserPlayer.value.name
    const eventId = selectedEvent.value.id
    
    const newAvailabilityData = {
      available: selectedRoles.value.length > 0,
      roles: selectedRoles.value,
      comment: commentText.value.trim() || null
    }
    
    // Sauvegarder via le service de disponibilité (même logique que la modale)
    const { saveAvailabilityWithRoles } = await import('../services/storage.js')
    await saveAvailabilityWithRoles({
      seasonId: seasonId.value,
      playerName: playerName,
      eventId: eventId,
      available: newAvailabilityData.available,
      roles: newAvailabilityData.roles,
      comment: newAvailabilityData.comment
    })
    
    // Mettre à jour les données locales (même logique que la modale)
    if (!availability.value[playerName]) {
      availability.value[playerName] = {}
    }
    availability.value[playerName][eventId] = newAvailabilityData
    
    // Forcer le rechargement des disponibilités pour synchroniser avec le service
    const newAvailability = await loadAvailability(allSeasonPlayers.value, events.value, seasonId.value)
    availability.value = newAvailability
    
    // Forcer le re-render de AvailabilityCell
    availabilityCellRefreshKey.value++
    
    console.log('✅ Disponibilités sauvegardées:', newAvailabilityData)
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error)
  } finally {
    isSaving.value = false
  }
}

// Fonction pour obtenir les rôles disponibles pour l'événement sélectionné
function getEventAvailableRoles() {
  if (!selectedEvent.value?.roles) return []
  
  // Filtrer les rôles pour ne garder que ceux attendus (nombre > 0)
  // et les trier par ordre de priorité du tirage
  const rolesWithSlots = ROLE_PRIORITY_ORDER.filter(role => {
    const count = selectedEvent.value.roles[role] || 0
    return count > 0
  })
  
  // Ajouter les rôles non définis dans ROLE_PRIORITY_ORDER à la fin (tri alphabétique)
  const undefinedRoles = Object.keys(selectedEvent.value.roles)
    .filter(role => selectedEvent.value.roles[role] > 0 && !ROLE_PRIORITY_ORDER.includes(role))
    .sort()
  
  return [...rolesWithSlots, ...undefinedRoles]
}

// Gérer les mises à jour depuis AvailabilityForm
function handleAvailabilityFormUpdate(updatedData) {
  availabilityFormData.value = updatedData
}

// Sauvegarder la disponibilité depuis le formulaire
async function handleAvailabilitySaved(payload) {
  try {
    // Mettre à jour les données locales
    const playerName = currentUserPlayer.value?.name
    const eventId = selectedEvent.value?.id
    if (playerName && eventId) {
      if (!availability.value[playerName]) {
        availability.value[playerName] = {}
      }
      availability.value[playerName][eventId] = {
        available: payload.available,
        roles: payload.roles || [],
        comment: payload.comment
      }
    }
    // Recharger pour synchroniser
    const newAvailability = await loadAvailability(allSeasonPlayers.value, events.value, seasonId.value)
    availability.value = newAvailability
    
    // Reload casts to reflect any auto-decline changes
    const { loadCasts } = await import('../services/storage.js')
    const updatedCasts = await loadCasts(seasonId.value)
    casts.value = updatedCasts
    
    availabilityCellRefreshKey.value++
  } catch (error) {
    console.error('❌ Erreur post-sauvegarde (refresh):', error)
  }
}

const seasonId = ref('')
const seasonMeta = ref({})

// État du scroll pour le header sticky
const isScrolled = ref(false)

// Vues valides disponibles
const VALID_VIEWS = ['events', 'participants', 'timeline', 'casts']
const DEFAULT_VIEW = 'events'

// Clé de migration pour marquer la migration vers agenda sur mobile/PWA
const MIGRATION_KEY = 'hatcast-view-migrated-to-agenda-mobile-v1'

// Fonction pour obtenir la vue par défaut selon le contexte
function getDefaultView() {
  if (isMobileOrPWA()) {
    return 'timeline' // Agenda sur mobile/PWA
  }
  return 'events' // Spectacles sur desktop
}

// Fonction utilitaire pour valider et obtenir une vue valide
const getValidView = (view) => {
  if (VALID_VIEWS.includes(view)) {
    return view
  }
  return getDefaultView()
}

// Supprimé - on utilise directement validCurrentView maintenant
const showViewToggle = ref(false)

// État de la vue (lignes, colonnes, chronologique)
const currentView = ref((() => {
  // Logique de migration ponctuelle pour mobile/PWA
  const isMobile = isMobileOrPWA()
  const migrationDone = localStorage.getItem(MIGRATION_KEY) === 'true'
  const savedView = localStorage.getItem('hatcast-view-preference')
  
  if (isMobile && !migrationDone) {
    // Migration ponctuelle : forcer 'timeline' sur mobile/PWA une seule fois
    const migratedView = 'timeline'
    localStorage.setItem('hatcast-view-preference', migratedView)
    localStorage.setItem(MIGRATION_KEY, 'true')
    logger.debug('✅ Migration vers vue agenda effectuée sur mobile/PWA')
    return migratedView
  }
  
  // Comportement normal : charger la préférence sauvegardée ou utiliser la vue par défaut
  if (savedView && VALID_VIEWS.includes(savedView)) {
    return savedView
  }
  
  return getDefaultView()
})())

// Computed pour s'assurer qu'on a toujours une vue valide
const validCurrentView = computed(() => {
  const view = getValidView(currentView.value)
  console.log('🔍 validCurrentView computed:', { currentView: currentView.value, validView: view })
  return view
})
// showViewDropdown supprimé - maintenant géré par ViewHeader

// Variables pour la vue chronologique
const selectedPlayerId = ref(null)

// Variables pour le filtrage des événements
const selectedEventId = ref(null)
const isAllEventsView = ref(false)
const eventFilters = ref({
  showPastEvents: false,
  showInactiveEvents: false
})

// Filtres spécifiques pour la vue casts
const castsEventFilters = computed(() => ({
  showPastEvents: true,  // Afficher les événements passés
  showInactiveEvents: false  // Ne pas afficher les événements inactifs/archivés
}))

// Debug watcher pour tracer qui modifie selectedPlayerId
watch(selectedPlayerId, (newValue, oldValue) => {
  console.log('🔍 selectedPlayerId changed:', {
    from: oldValue,
    to: newValue,
    stack: new Error().stack?.split('\n').slice(1, 4) // 3 premières lignes de la stack
  })
}, { immediate: true })
const showPlayerModal = ref(false)
const showEventModal = ref(false)
const showPlayerDetailsModal = ref(false)
const selectedPlayerForDetails = ref(null)

// Computed pour le joueur sélectionné (utilise toujours allSeasonPlayers)
const selectedPlayer = computed(() => {
  console.log('🔍 selectedPlayer computed:', {
    selectedPlayerId: selectedPlayerId.value,
    allSeasonPlayersLength: allSeasonPlayers.value?.length || 0,
    currentView: validCurrentView.value
  })
  
  if (!selectedPlayerId.value) {
    console.log('🔍 selectedPlayer: no selectedPlayerId, returning null')
    return null
  }
  
  // Toujours utiliser allSeasonPlayers car c'est la liste complète
  if (!allSeasonPlayers.value) {
    console.log('🔍 selectedPlayer: no allSeasonPlayers, returning null')
    return null
  }
  
  const found = allSeasonPlayers.value.find(p => p.id === selectedPlayerId.value) || null
  console.log('🔍 selectedPlayer found:', found ? { id: found.id, name: found.name } : null)
  return found
})

// Le provide sera déplacé plus tard après la définition de dropdownDisplayText

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

// Variables pour le popin Afficher Tous
const showShowMoreModal = ref(false)
const showMoreSearchQuery = ref('')
const showMoreSearchInput = ref(null)
const allSeasonPlayers = ref([]) // Tous les joueurs de la saison pour l'autocomplete
const manuallyAddedPlayers = ref(new Set()) // Joueurs ajoutés manuellement via "Afficher Tous"
const isFocusedView = ref(false) // Indique si on est en vue focalisée (favoris + joueur sélectionné)
const originalPlayers = ref([]) // Sauvegarde des joueurs originaux pour revenir à la vue complète
const isAllPlayersView = ref(false) // Indique si on affiche tous les joueurs (via "Tous")

// Fonction pour ouvrir le formulaire avec focus
async function openNewPlayerForm(prefilledName = '') {
  console.log('🔍 openNewPlayerForm appelé')
  newPlayerForm.value = true
  newPlayerGender.value = 'non-specified'
  newPlayerNameError.value = ''
  
  // Pré-remplir avec le nom fourni ou le pseudo de l'utilisateur s'il existe
  if (prefilledName) {
    newPlayerName.value = prefilledName
    console.log('🔍 Nom pré-rempli depuis la recherche:', prefilledName)
  } else {
  try {
    const { getUserPseudo } = await import('../services/userProfileService.js')
    const pseudo = await getUserPseudo()
    newPlayerName.value = pseudo || ''
    console.log('🔍 Pseudo récupéré pour pré-remplissage:', pseudo)
  } catch (error) {
    console.warn('Erreur lors de la récupération du pseudo:', error)
    newPlayerName.value = ''
    }
  }
  
  // Focus automatique sur le champ nom après que le DOM soit mis à jour
  nextTick(() => {
    console.log('🔍 nextTick - newPlayerNameInput.value:', newPlayerNameInput.value)
    if (newPlayerNameInput.value) {
      newPlayerNameInput.value.focus()
      console.log('🔍 Focus appliqué sur le champ nom')
    }
  })
}

// Fonctions pour le popin Afficher Tous
async function toggleShowMoreModal() {
  showShowMoreModal.value = !showShowMoreModal.value
  if (showShowMoreModal.value) {
    showMoreSearchQuery.value = ''
    
    // Charger tous les joueurs de la saison pour l'autocomplete
    try {
      allSeasonPlayers.value = await loadPlayers(seasonId.value)
      logger.debug(`📊 Chargé ${allSeasonPlayers.value.length} joueurs pour l'autocomplete`)
    } catch (error) {
      logger.error('❌ Erreur lors du chargement des joueurs pour l\'autocomplete:', error)
      allSeasonPlayers.value = []
    }
    
    nextTick(() => {
      if (showMoreSearchInput.value) {
        showMoreSearchInput.value.focus()
      }
    })
  }
}

function closeShowMoreModal() {
  showShowMoreModal.value = false
  showMoreSearchQuery.value = ''
}

async function selectAllPlayers() {
  // Charger tous les joueurs de la saison dans la grille
  try {
    logger.debug('🔄 Chargement de tous les joueurs de la saison...')
    
    // Sauvegarder les joueurs originaux si ce n'est pas déjà fait
    if (!isAllPlayersView.value) {
      originalPlayers.value = [...players.value]
    }
    
    // Charger tous les joueurs
    const allPlayers = await loadPlayers(seasonId.value)
    players.value = allPlayers
    
    // Marquer tous les joueurs comme ajoutés manuellement
    allPlayers.forEach(player => {
      manuallyAddedPlayers.value.add(player.id)
    })
    
    // Activer le mode "tous les joueurs"
    isAllPlayersView.value = true
    isFocusedView.value = false // Désactiver la vue focalisée si elle était active
    
    logger.debug(`📊 Chargé ${allPlayers.length} joueurs (mode "tous")`)
    logger.debug('🔍 isAllPlayersView activé:', isAllPlayersView.value)
    
    // Recharger les disponibilités pour tous les joueurs
    const newAvailability = await loadAvailability(allPlayers, events.value, seasonId.value)
    availability.value = newAvailability
    
    // Mettre à jour les états de chargement
    allPlayers.forEach(player => {
      playerLoadingStates.value.set(player.id, 'loaded')
    })
    
    logger.debug('✅ Tous les joueurs chargés avec leurs disponibilités')
  } catch (error) {
    logger.error('❌ Erreur lors du chargement de tous les joueurs:', error)
  }
  
  closeShowMoreModal()
}

async function selectExistingPlayer(player) {
  // Vérifier si le joueur est déjà dans la grille
  const isAlreadyInGrid = players.value.some(p => p.id === player.id)
  
  if (isAlreadyInGrid) {
    logger.debug('Joueur déjà dans la grille:', player.name)
    closeShowMoreModal()
    return
  }
  
  // Ajouter le joueur à la grille
  try {
    logger.debug('🔄 Ajout du joueur à la grille:', player.name)
    
    // Ajouter le joueur à la liste
    players.value.push(player)
    
    // Marquer comme joueur ajouté manuellement
    manuallyAddedPlayers.value.add(player.id)
    
    // Charger les disponibilités pour ce joueur
    const playerAvailability = await loadAvailability([player], events.value, seasonId.value)
    
    // Fusionner avec les disponibilités existantes
    Object.keys(playerAvailability).forEach(key => {
      if (!availability.value[key]) {
        availability.value[key] = playerAvailability[key]
      } else {
        // Fusionner les disponibilités existantes avec les nouvelles
        Object.assign(availability.value[key], playerAvailability[key])
      }
    })
    
    // Marquer le joueur comme chargé
    playerLoadingStates.value.set(player.id, 'loaded')
    
    logger.debug('✅ Joueur ajouté à la grille avec ses disponibilités')
  } catch (error) {
    logger.error('❌ Erreur lors de l\'ajout du joueur:', error)
  }
  
  closeShowMoreModal()
}

function addNewPlayerFromShowMore() {
  // Ouvrir la modale de création avec le nom prérempli
  const name = showMoreSearchQuery.value.trim()
  closeShowMoreModal()
  openNewPlayerForm(name)
}
// Fonction pour gérer l'affichage des disponibilités d'un joueur
async function handleShowAvailabilityGrid(playerId) {
  try {
    logger.debug('🔄 Affichage de l\'agenda du joueur:', playerId)
    
    // Trouver le joueur sélectionné
    const selectedPlayer = allSeasonPlayers.value.find(p => p.id === playerId)
    if (!selectedPlayer) {
      logger.error('Joueur non trouvé:', playerId)
      return
    }
    
    // Changer vers la vue Agenda (timeline)
    selectView('timeline')
    
    // Définir le joueur sélectionné pour la vue Agenda
    selectedPlayerId.value = playerId
    
    // Fermer la modale de joueur
    closePlayerDetailsModal()
    
    logger.debug('✅ Vue Agenda activée pour le joueur:', {
      joueur: selectedPlayer?.name,
      joueurId: playerId
    })
    
  } catch (error) {
    logger.error('❌ Erreur lors de l\'affichage de l\'agenda:', error)
  }
}
// Fonction pour revenir à la vue complète
async function returnToFullView() {
  try {
    logger.debug('🔄 Retour à la vue complète')
    
    // Restaurer les joueurs originaux
    players.value = [...originalPlayers.value]
    
    // Recharger les disponibilités pour tous les joueurs
    const newAvailability = await loadAvailabilityForAllPlayers()
    availability.value = newAvailability
    
    // Mettre à jour les états de chargement
    players.value.forEach(player => {
      playerLoadingStates.value.set(player.id, 'loaded')
    })
    
    // Désactiver les modes spéciaux
    isFocusedView.value = false
    isAllPlayersView.value = false
    isCompositionView.value = false
    highlightedPlayer.value = null
    
    logger.debug('✅ Vue complète restaurée')
    
  } catch (error) {
    logger.error('❌ Erreur lors du retour à la vue complète:', error)
  }
}

// Fonction pour revenir aux favoris seulement
async function showFavoritesOnly() {
  try {
    logger.debug('🔄 Retour aux favoris seulement')
    
    // Filtrer pour ne garder que les favoris
    const favoritesOnly = originalPlayers.value.filter(p => preferredPlayerIdsSet.value.has(p.id))
    
    // Mettre à jour la liste des joueurs affichés
    players.value = favoritesOnly
    
    // Recharger les disponibilités pour les favoris seulement
    const newAvailability = await loadAvailability(favoritesOnly, events.value, seasonId.value)
    availability.value = newAvailability
    
    // Mettre à jour les états de chargement
    favoritesOnly.forEach(player => {
      playerLoadingStates.value.set(player.id, 'loaded')
    })
    
    // Désactiver les modes spéciaux
    isAllPlayersView.value = false
    isFocusedView.value = false
    highlightedPlayer.value = null
    
    logger.debug('✅ Vue favoris seulement activée:', {
      totalJoueurs: favoritesOnly.length,
      favoris: favoritesOnly.map(p => p.name)
    })
    
  } catch (error) {
    logger.error('❌ Erreur lors du retour aux favoris:', error)
  }
}

// Fonction pour afficher la grille avec uniquement les joueurs de la composition
async function showCompositionInGrid() {
  try {
    if (!selectedEvent.value) return
    
    logger.debug('🔄 Affichage de la composition dans la grille')
    
    // Sauvegarder l'état actuel si ce n'est pas déjà fait
    if (!isCompositionView.value) {
      originalPlayers.value = [...players.value]
      originalAvailability.value = { ...availability.value }
    }
    
    // Récupérer les joueurs de la composition
    const selectedPlayers = getSelectionPlayers(selectedEvent.value.id)
    if (selectedPlayers.length === 0) {
      logger.warn('Aucun joueur dans la composition')
      return
    }
    
    // Trouver les objets joueurs correspondants
    const compositionPlayers = originalPlayers.value.filter(player => 
      selectedPlayers.includes(player.name)
    )
    
    if (compositionPlayers.length === 0) {
      logger.warn('Aucun joueur de la composition trouvé dans la liste des joueurs')
      return
    }
    
    // Mettre à jour la liste des joueurs affichés
    players.value = compositionPlayers
    
    // Recharger les disponibilités pour les joueurs de la composition
    const newAvailability = await loadAvailability(compositionPlayers, events.value, seasonId.value)
    availability.value = newAvailability
    
    // Mettre à jour les états de chargement
    compositionPlayers.forEach(player => {
      playerLoadingStates.value.set(player.id, 'loaded')
    })
    
    // Activer le mode composition
    isCompositionView.value = true
    
    // Désactiver les autres modes spéciaux
    isFocusedView.value = false
    isAllPlayersView.value = false
    highlightedPlayer.value = null
    
    // Fermer la modale de détail d'événement
    closeEventDetailsAndUpdateUrl()
    
    logger.debug('✅ Vue composition activée:', {
      event: selectedEvent.value.title,
      joueursComposition: compositionPlayers.map(p => p.name),
      totalJoueurs: compositionPlayers.length
    })
    
  } catch (error) {
    logger.error('❌ Erreur lors de l\'affichage de la composition:', error)
  }
}
const highlightedPlayer = ref(null)
const guidedPlayerId = ref(null)
const guidedEventId = ref(null)
const addPlayerCoachmark = ref({ position: null, side: null })
const availabilityCoachmark = ref({ position: null })
const playerNameCoachmark = ref({ position: null })

// Variables pour le modal joueur
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

// Variables pour la gestion des rôles
const canEditEvents = ref(false)
const isSuperAdmin = ref(false)
const canEditEventMap = reactive({}) // Objet réactif eventId -> boolean (permissions par événement)
const eventPermissionsLoading = reactive({}) // Objet réactif eventId -> boolean (en cours de chargement)

// Variables pour l'affichage de la composition
const isCompositionView = ref(false)
const originalAvailability = ref({})




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
    const eventUrl = `${window.location.origin}/season/${props.slug}/event/${event.id}`;
    
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
      textArea.value = `${window.location.origin}/season/${props.slug}/event/${event.id}`;
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
    // Note: Le backfill des préférences est maintenant géré par updatePreferredPlayersSet()
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
const inlineSelectionModalRef = ref(null)

// Variables pour le modal d'annonce d'événement
const showEventAnnounceModal = ref(false)
const eventToAnnounce = ref(null)
const showAnnouncePrompt = ref(false)
const announcePromptEvent = ref(null)
const showAvailabilityInEventModal = ref(false)
const currentUserPlayer = ref(null)
const showAvailabilityInEventDetails = ref(false)
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

// Compteur pour forcer le re-render de AvailabilityCell
const availabilityCellRefreshKey = ref(0)

// Onglet actif dans la modale de détails d'événement (Info par défaut)
const eventDetailsActiveTab = ref('info')

// État du modal de sélection de joueur pour l'onglet Disponibilités
const selectedTeamPlayer = ref(null)

// Refs réactifs pour l'état des permissions de modification des disponibilités
const canModifyCurrentUserAvailability = ref(null) // null = vérification en cours, true/false = résultat
const canModifySelectedPlayerAvailability = ref(null) // null = vérification en cours, true/false = résultat
const isCheckingPermissions = ref(false)


// Onglet par défaut à l'ouverture des détails (sans paramètre tab dans l'URL)
function getDefaultTabForEvent(event) {
  if (!event) return 'info'
  return 'info'
}


// Watcher pour initialiser les données quand l'onglet Disponibilités est ouvert
watch([eventDetailsActiveTab, selectedEvent], () => {
  if (eventDetailsActiveTab.value === 'team' && selectedEvent.value) {
    // Initialiser selectedTeamPlayer selon les règles :
    // - Si connecté : afficher les disponibilités de l'utilisateur connecté
    // - Si pas connecté : afficher EventRoleGroupingView avec tous les joueurs
    if (!selectedTeamPlayer.value) {
      if (currentUserPlayer.value) {
        selectedTeamPlayer.value = currentUserPlayer.value
      } else {
        selectedTeamPlayer.value = { id: 'all', name: 'Tous' }
      }
    }
    
    nextTick(() => {
      initializeAvailabilityData()
    })
  }
}, { immediate: true })

// Watcher pour charger l'URL de la carte Google Maps quand l'événement change
watch(selectedEvent, (newEvent) => {
  if (newEvent?.location) {
    loadGoogleMapsEmbedUrl(newEvent.location)
  }
}, { immediate: true })

// Watcher pour charger les permissions de l'événement sélectionné si elles ne sont pas en cache
watch(selectedEvent, async (newEvent) => {
  if (newEvent?.id && currentUser.value?.email) {
    // Vérifier si les permissions ne sont pas encore en cache
    if (!(newEvent.id in canEditEventMap)) {
      // Charger les permissions pour cet événement spécifique
      await canEditSpecificEvent(newEvent.id)
    }
  }
}, { immediate: true })


// Onglet Composition: computed helpers
const hasCompositionForSelectedEvent = computed(() => {
  if (!selectedEvent.value || !casts.value) return false
  const cast = casts.value[selectedEvent.value.id]
  if (!cast || !cast.roles) return false
  // True if any role has at least one assigned player id
  return Object.values(cast.roles).some(arr => Array.isArray(arr) && arr.length > 0)
})

// Computed pour obtenir les permissions d'édition pour l'événement sélectionné
const canEditSelectedEvent = computed(() => {
  if (!selectedEvent.value) return false
  // Vérifier que l'utilisateur est connecté
  if (!currentUser.value?.email) return false
  
  const eventId = selectedEvent.value.id
  // Si les permissions ne sont pas en cache, déclencher le chargement
  if (!(eventId in canEditEventMap) && !eventPermissionsLoading[eventId]) {
    // Déclencher le chargement de manière asynchrone
    eventPermissionsLoading[eventId] = true
    canEditSpecificEvent(eventId).then(() => {
      delete eventPermissionsLoading[eventId]
    })
    // Retourner canEditEvents en attendant (pour les super admins et admins de saison)
    return canEditEvents.value
  }
  
  return canEditEventMap[eventId] ?? canEditEvents.value
})

// Helper pour obtenir les permissions d'édition d'un événement (utilisé dans les computed)
function getCanEditEvent(eventId) {
  if (!eventId || !currentUser.value?.email) return false
  
  // Si les permissions ne sont pas en cache, déclencher le chargement
  if (!(eventId in canEditEventMap) && !eventPermissionsLoading[eventId]) {
    // Déclencher le chargement de manière asynchrone
    eventPermissionsLoading[eventId] = true
    canEditSpecificEvent(eventId).then(() => {
      delete eventPermissionsLoading[eventId]
    })
    // Retourner canEditEvents en attendant (pour les super admins et admins de saison)
    return canEditEvents.value
  }
  
  return canEditEventMap[eventId] ?? canEditEvents.value
}

const compositionSlots = computed(() => {
  if (!selectedEvent.value?.roles) return []
  const eventId = selectedEvent.value.id
  
  // Ne pas afficher les slots de composition si elle n'est pas validée par l'organisateur
  // SAUF pour les admins qui peuvent voir la composition même non validée
  const canEditThisEvent = getCanEditEvent(eventId)
  if (!isSelectionConfirmedByOrganizer(eventId) && !canEditThisEvent) {
    return []
  }
  
  const roles = selectedEvent.value.roles
  const cast = casts.value[eventId] || { roles: {} }
  const playersById = new Map((allSeasonPlayers.value || []).map(p => [p.id, p]))
  const slots = []
  let idx = 0
  for (const role of ROLE_PRIORITY_ORDER) {
    const count = roles[role] || 0
    if (count <= 0) continue
    const assigned = cast.roles?.[role] || []
    for (let i = 0; i < count; i++) {
      const playerId = assigned[i] || null
      const player = playerId ? playersById.get(playerId) || null : null
      const playerName = player?.name || null
      const selectionStatus = playerName ? getPlayerSelectionStatus(playerName, eventId) : null
      const available = playerName ? isAvailableForRole(playerName, role, eventId) : null
      const unavailable = playerName ? (available === false) : null
      slots.push({
        key: `${role}-${i}`,
        playerId,
        playerName,
        playerGender: player?.gender || 'non-specified',
        roleKey: role,
        roleLabel: player ? getRoleLabelByGender(role, player.gender || 'non-specified', false) : (ROLE_LABELS_SINGULAR[role] || role),
        roleEmoji: ROLE_EMOJIS[role] || '🎭',
        selectionStatus,
        available,
        unavailable,
        index: idx++
      })
    }
  }
  return slots
})

const hasDeclinedPlayersInComposition = computed(() => {
  return compositionSlots.value.some(s => s.selectionStatus === 'declined')
})

const hasEmptySlotsInComposition = computed(() => {
  return compositionSlots.value.some(s => !s.playerName)
})

// If the current user player disappears, reset the selection to "Tous"
watch(currentUserPlayer, (player) => {
  if (!player && selectedTeamPlayer.value?.id === currentUserPlayer?.id) {
    selectedTeamPlayer.value = { id: 'all', name: 'Tous' }
  }
})

// Watcher pour initialiser la sélection de joueur par défaut
watch([selectedEvent, currentUserPlayer], () => {
  if (selectedEvent.value && eventDetailsActiveTab.value === 'team') {
    // Si on a un utilisateur connecté, le sélectionner par défaut
    if (currentUserPlayer.value && !selectedTeamPlayer.value) {
      selectedTeamPlayer.value = currentUserPlayer.value
    }
    // Sinon, sélectionner "Tous" par défaut
    else if (!currentUserPlayer.value && !selectedTeamPlayer.value) {
      selectedTeamPlayer.value = { id: 'all', name: 'Tous' }
    }
  }
})

// Watcher pour mettre à jour les permissions de modification pour l'utilisateur courant
watch([currentUserPlayer, selectedEvent], async () => {
  if (currentUserPlayer.value && selectedEvent.value) {
    isCheckingPermissions.value = true
    canModifyCurrentUserAvailability.value = null
    try {
    const canModify = await canModifyPlayerAvailability(currentUserPlayer.value.id, selectedEvent.value.id)
      canModifyCurrentUserAvailability.value = canModify
    } catch (error) {
      logger.error('Erreur lors de la vérification des permissions pour currentUserPlayer:', error)
      canModifyCurrentUserAvailability.value = false
    } finally {
      isCheckingPermissions.value = false
    }
  } else {
    canModifyCurrentUserAvailability.value = null
  }
})

// Watcher pour mettre à jour les permissions de modification pour le joueur sélectionné
watch([selectedTeamPlayer, selectedEvent], async () => {
  if (selectedTeamPlayer.value && selectedTeamPlayer.value.id !== 'all' && selectedEvent.value) {
    isCheckingPermissions.value = true
    canModifySelectedPlayerAvailability.value = null
    try {
    const canModify = await canModifyPlayerAvailability(selectedTeamPlayer.value.id, selectedEvent.value.id)
      canModifySelectedPlayerAvailability.value = canModify
    } catch (error) {
      logger.error('Erreur lors de la vérification des permissions pour selectedTeamPlayer:', error)
      canModifySelectedPlayerAvailability.value = false
    } finally {
      isCheckingPermissions.value = false
    }
  } else {
    canModifySelectedPlayerAvailability.value = null
  }
})

// État du menu déroulant d'agenda
const showCalendarDropdown = ref(false)

// État du dropdown des actions d'événement
const showEventActionsDropdown = ref(false)

// État de l'affichage des détails de l'événement
// État du dropdown Google Maps
const showGoogleMapsDropdown = ref(false)

// État du modal de sélection de joueur pour l'onglet Disponibilités
const showAvailabilityPlayerSelector = ref(false)

// État d'expansion du header de l'événement
const isEventHeaderExpanded = ref(false)

// Variables pour la modale de confirmation
const showConfirmationModal = ref(false)
const confirmationModalData = ref({
  playerName: '',
  playerId: '',
  playerGender: 'non-specified',
  eventId: '',
  eventTitle: '',
  eventDate: '',
  assignedRole: 'player',
  availabilityComment: null,
  currentStatus: 'pending'
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
  // Logique de migration ponctuelle pour mobile/PWA
  const isMobile = isMobileOrPWA()
  const migrationDone = localStorage.getItem(MIGRATION_KEY) === 'true'
  const savedView = localStorage.getItem('hatcast-view-preference')
  
  if (isMobile && !migrationDone) {
    // Migration ponctuelle : forcer 'timeline' sur mobile/PWA une seule fois
    currentView.value = 'timeline'
    localStorage.setItem('hatcast-view-preference', 'timeline')
    localStorage.setItem(MIGRATION_KEY, 'true')
    logger.debug('✅ Migration vers vue agenda effectuée sur mobile/PWA')
  } else if (savedView && VALID_VIEWS.includes(savedView)) {
    // Charger la préférence sauvegardée
    currentView.value = savedView
    logger.debug('✅ Mode de vue restauré depuis localStorage:', savedView)
  } else {
    // Vue par défaut selon le contexte (mobile/PWA ou desktop)
    currentView.value = getDefaultView()
    logger.debug(`✅ Mode de vue par défaut: ${getDefaultView()} (${isMobile ? 'mobile/PWA' : 'desktop'})`)
  }
  
  showViewToggle.value = true
}


// toggleViewDropdown supprimé - maintenant géré par ViewHeader


// Fonction de sélection de vue
function selectView(view) {
  console.log('🔍 selectView called with:', view)
  // Valider la vue avant de l'appliquer
  const validView = getValidView(view)
  
  currentView.value = validView
  
  // Sauvegarder la préférence dans le localStorage
  localStorage.setItem('hatcast-view-preference', validView)
  
  console.log('🔍 selectView result:', { originalView: view, validView, currentView: currentView.value })
  logger.debug(`Vue sélectionnée: ${validView}`)
}

// Fonction pour obtenir le label de la vue
function getViewLabel(view) {
  switch (view) {
    case 'events': return 'Spectacles'
    case 'participants': return 'Participants'
    case 'timeline': return 'Agenda'
    case 'casts': return 'Compositions'
    default: return 'Lignes'
  }
}

// Fonctions pour la vue chronologique
async function togglePlayerModal() {
  if (!showPlayerModal.value) {
    // S'assurer que allSeasonPlayers est chargé avant d'ouvrir le modal
    if (allSeasonPlayers.value.length === 0 && seasonId.value) {
      try {
        allSeasonPlayers.value = await loadPlayers(seasonId.value)
        logger.debug(`📊 Chargé ${allSeasonPlayers.value.length} joueurs pour le modal`)
      } catch (error) {
        logger.error('❌ Erreur lors du chargement des joueurs pour le modal:', error)
        allSeasonPlayers.value = []
      }
    }
  }
  showPlayerModal.value = !showPlayerModal.value
}

async function handlePlayerSelected(player) {
  console.log('🎯 handlePlayerSelected called with:', player ? { id: player.id, name: player.name } : null)
  console.log('🎯 Before: selectedPlayerId =', selectedPlayerId.value)
  console.log('🎯 Current view =', validCurrentView.value)
  
  // Pour la vue chronologique : changer le joueur sélectionné et charger ses disponibilités
  if (validCurrentView.value === 'timeline') {
    selectedPlayerId.value = player.id
    showPlayerModal.value = false
    
    console.log('🎯 After: selectedPlayerId =', selectedPlayerId.value)
    
    // Charger les disponibilités pour ce joueur spécifique
    try {
      logger.debug('🔄 Chargement des disponibilités pour le joueur sélectionné (timeline):', player.name)
      const playerAvailability = await loadAvailability([player], events.value, seasonId.value)
      availability.value = playerAvailability
      logger.debug('🎯 Joueur sélectionné pour la vue chronologique:', player.name, player.id)
    } catch (error) {
      logger.error('Erreur lors du chargement des disponibilités pour la timeline:', error)
    }
  } else {
    // Pour les vues lignes/colonnes : remplacer la liste des joueurs par le joueur sélectionné
    selectedPlayerId.value = player.id
    
    // Désactiver le mode "tous les joueurs" et la vue focalisée
    isAllPlayersView.value = false
    isFocusedView.value = false
    
    // Remplacer complètement la liste des joueurs
    players.value = [player]
    
    // Réinitialiser les joueurs ajoutés manuellement
    manuallyAddedPlayers.value.clear()
    manuallyAddedPlayers.value.add(player.id)
    
    // Charger les disponibilités pour ce joueur uniquement
    try {
      logger.debug('🔄 Chargement des disponibilités pour le joueur sélectionné:', player.name)
      const playerAvailability = await loadAvailability([player], events.value, seasonId.value)
      availability.value = playerAvailability
      
      showPlayerModal.value = false
      logger.debug('🎯 Joueur sélectionné pour la vue grille:', player.name, player.id)
    } catch (error) {
      logger.error('Erreur lors du chargement des disponibilités:', error)
    }
  }
}
async function handleAllPlayersSelected() {
  // Pour la vue chronologique : afficher tous les joueurs et recharger toutes les disponibilités
  if (validCurrentView.value === 'timeline') {
    selectedPlayerId.value = null
    showPlayerModal.value = false
    
    // Recharger toutes les disponibilités
    try {
      logger.debug('🔄 Rechargement de toutes les disponibilités pour la timeline')
      const allAvailability = await loadAvailability(allSeasonPlayers.value, events.value, seasonId.value)
      availability.value = allAvailability
      logger.debug('🎯 Affichage de tous les joueurs pour la vue chronologique')
    } catch (error) {
      logger.error('Erreur lors du rechargement des disponibilités pour la timeline:', error)
    }
  } else {
    // Pour les vues lignes/colonnes : ajouter tous les joueurs à la grille et réinitialiser selectedPlayerId
    selectedPlayerId.value = null
    await addAllPlayersToGrid()
    logger.debug('🎯 Affichage de tous les joueurs pour la vue grille')
  }
}

// Fonction pour ajouter un joueur à la grille (vues lignes/colonnes)
async function addPlayerToGrid(player) {
  // Vérifier si le joueur est déjà dans la grille
  const isAlreadyInGrid = players.value.some(p => p.id === player.id)
  
  if (isAlreadyInGrid) {
    logger.debug('Joueur déjà dans la grille:', player.name)
    showPlayerModal.value = false
    return
  }
  
  // Ajouter le joueur à la grille
  try {
    logger.debug('🔄 Ajout du joueur à la grille:', player.name)
    
    // Ajouter le joueur à la liste
    players.value.push(player)
    
    // Marquer comme joueur ajouté manuellement
    manuallyAddedPlayers.value.add(player.id)
    
    // Charger les disponibilités pour ce joueur
    const playerAvailability = await loadAvailability([player], events.value, seasonId.value)
    
    // Fusionner avec les disponibilités existantes
    Object.keys(playerAvailability).forEach(key => {
      if (!availability.value[key]) {
        availability.value[key] = playerAvailability[key]
      } else {
        // Fusionner les disponibilités existantes avec les nouvelles
        Object.assign(availability.value[key], playerAvailability[key])
      }
    })
    
    // Marquer le joueur comme chargé
    playerLoadingStates.value.set(player.id, 'loaded')
    
    logger.debug('✅ Joueur ajouté à la grille avec ses disponibilités')
  } catch (error) {
    logger.error('❌ Erreur lors de l\'ajout du joueur:', error)
  }
  
  showPlayerModal.value = false
}

// Fonction pour ajouter tous les joueurs à la grille (vues lignes/colonnes)
async function addAllPlayersToGrid() {
  try {
    logger.debug('🔄 Chargement de tous les joueurs de la saison...')
    
    // Sauvegarder les joueurs originaux si ce n'est pas déjà fait
    if (!isAllPlayersView.value) {
      originalPlayers.value = [...players.value]
    }
    
    // Charger tous les joueurs
    const allPlayers = await loadPlayers(seasonId.value)
    players.value = allPlayers
    
    // Marquer tous les joueurs comme ajoutés manuellement
    allPlayers.forEach(player => {
      manuallyAddedPlayers.value.add(player.id)
    })
    
    // Activer le mode "tous les joueurs"
    isAllPlayersView.value = true
    isFocusedView.value = false // Désactiver la vue focalisée si elle était active
    
    logger.debug(`📊 Chargé ${allPlayers.length} joueurs (mode "tous")`)
    logger.debug('🔍 isAllPlayersView activé:', isAllPlayersView.value)
    
    // Recharger les disponibilités pour tous les joueurs
    const newAvailability = await loadAvailability(allPlayers, events.value, seasonId.value)
    availability.value = newAvailability
    
    // Mettre à jour les états de chargement
    allPlayers.forEach(player => {
      playerLoadingStates.value.set(player.id, 'loaded')
    })
    
    logger.debug('✅ Tous les joueurs chargés avec leurs disponibilités')
  } catch (error) {
    logger.error('❌ Erreur lors du chargement de tous les joueurs:', error)
  }
  
  showPlayerModal.value = false
}
// Fonction pour gérer l'événement all-players-loaded des composants enfants
async function handleAllPlayersLoaded(data) {
  try {
    logger.debug('🔄 Réception de l\'événement all-players-loaded:', data)
    
    // Sauvegarder les joueurs originaux si ce n'est pas déjà fait
    if (!isAllPlayersView.value) {
      originalPlayers.value = [...players.value]
    }
    
    // Mettre à jour les joueurs et disponibilités
    players.value = data.players
    availability.value = data.availability
    
    // Marquer tous les joueurs comme ajoutés manuellement
    data.players.forEach(player => {
      manuallyAddedPlayers.value.add(player.id)
    })
    
    // Activer le mode "tous les joueurs"
    isAllPlayersView.value = true
    isFocusedView.value = false // Désactiver la vue focalisée si elle était active
    
    // Réinitialiser la sélection de joueur pour que le dropdown affiche "Tous"
    selectedPlayerId.value = null
    
    // Mettre à jour les états de chargement
    data.players.forEach(player => {
      playerLoadingStates.value.set(player.id, 'loaded')
    })
    
    logger.debug(`📊 Mis à jour avec ${data.players.length} joueurs (mode "tous")`)
    logger.debug('✅ Tous les joueurs chargés via l\'événement des composants enfants')
  } catch (error) {
    logger.error('❌ Erreur lors du traitement de l\'événement all-players-loaded:', error)
  }
}

// Fonction pour gérer l'événement all-events-loaded des composants enfants
async function handleAllEventsLoaded() {
  try {
    logger.debug('🔄 Réception de l\'événement all-events-loaded')
    
    // Charger TOUS les événements (y compris archivés et passés)
    if (seasonId.value) {
      logger.debug('🔄 Chargement de tous les événements (y compris archivés et passés)')
      const allEvents = await firestoreService.getDocuments('seasons', seasonId.value, 'events')
      events.value = allEvents
      logger.debug(`📊 Chargé ${allEvents.length} événements (tous, y compris archivés et passés)`)
    }
    
    // Activer le mode "tous les événements" (afficher tous les événements, y compris archivés et passés)
    isAllEventsView.value = true
    
    // Réinitialiser la sélection d'événement pour afficher tous les événements
    selectedEventId.value = null
    
    logger.debug('✅ Mode "tous les événements" activé via l\'événement des composants enfants')
  } catch (error) {
    logger.error('❌ Erreur lors du traitement de l\'événement all-events-loaded:', error)
  }
}

// Fonction pour vérifier si un joueur est déjà affiché dans la grille
function isPlayerAlreadyDisplayed(playerId) {
  return players.value.some(p => p.id === playerId)
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

function openAdministration() {
  logger.debug('🛡️ openAdministration() appelée dans GridBoard');
  logger.debug('🛡️ props.slug:', props.slug);
  logger.debug('🛡️ URL de navigation:', `/season/${props.slug}/admin`);
  
  // Naviguer vers la page d'administration de la saison
  router.push(`/season/${props.slug}/admin`);
}

// Fonction pour vérifier les permissions d'édition
async function checkEditPermissions(force = false) {
  try {
    if (!seasonId.value) return;
    
    logger.info('🔐 Vérification des permissions d\'édition pour la saison', seasonId.value, force ? '(FORCE REFRESH)' : '');
    
    // Vérifier que permissionService est initialisé
    if (!permissionService.isInitialized) {
      console.log('🔍 GridBoard: Initialisation de permissionService');
      await permissionService.initialize();
    }
    
    // Utiliser la fonction centralisée d'authState
    const superAdminStatus = await permissionService.isSuperAdmin(force);
    isSuperAdmin.value = superAdminStatus;
    
    // Si Super Admin, raccourci : pas besoin de vérifier les rôles de saison
    if (superAdminStatus) {
      canEditEvents.value = true;
      logger.info('🔐 Raccourci Super Admin: permissions d\'édition accordées');
    } else {
      // Sinon, vérifier si peut éditer les événements (Admin de saison)
      console.log('🔍 GridBoard: Pas Super Admin, vérification Season Admin pour:', seasonId.value);
      const canEdit = await permissionService.isSeasonAdmin(seasonId.value, force);
      console.log('🔍 GridBoard: Résultat isSeasonAdmin:', canEdit);
      canEditEvents.value = canEdit;
    }
    
    logger.info('🔐 Permissions vérifiées:', {
      seasonId: seasonId.value,
      isSuperAdmin: superAdminStatus,
      canEditEvents: canEditEvents.value,
      forceRefresh: force
    });
  } catch (error) {
    logger.warn('⚠️ Erreur lors de la vérification des permissions, utilisation du fallback:', error.message);
    
    // Fallback en cas d'erreur
    logger.warn('⚠️ Utilisation du fallback en cas d\'erreur');
    canEditEvents.value = false;
    isSuperAdmin.value = false;
  }
}

// Fonction pour vérifier les permissions d'édition pour un événement spécifique
async function canEditSpecificEvent(eventId, force = false) {
  try {
    if (!eventId || !seasonId.value) return false;
    
    // Vérifier le cache d'abord
    if (!force && eventId in canEditEventMap) {
      return canEditEventMap[eventId];
    }
    
    // Vérifier que permissionService est initialisé
    if (!permissionService.isInitialized) {
      await permissionService.initialize();
    }
    
    // Utiliser canManageComposition qui vérifie Super Admin OU Admin de saison OU Admin d'événement OU Caster
    // (canEditEvent ne vérifie pas les casters, donc on utilise canManageComposition pour les compositions)
    const canEdit = await permissionService.canManageComposition(eventId, seasonId.value, force);
    
    logger.info(`🔐 [GridBoard] canEditSpecificEvent pour ${eventId}: ${canEdit ? '✅ OUI' : '❌ NON'}`);
    
    // Mettre en cache
    canEditEventMap[eventId] = canEdit;
    
    return canEdit;
  } catch (error) {
    logger.warn(`⚠️ Erreur lors de la vérification des permissions pour l'événement ${eventId}:`, error);
    // Fallback : utiliser les permissions globales
    return canEditEvents.value;
  }
}

// Fonction pour charger les permissions pour tous les événements
async function loadEventPermissions() {
  try {
    if (!seasonId.value || !events.value || events.value.length === 0) return;
    
    // Vérifier que permissionService est initialisé
    if (!permissionService.isInitialized) {
      await permissionService.initialize();
    }
    
    // Charger les permissions pour chaque événement en parallèle
    // Utiliser canManageComposition qui vérifie Super Admin OU Admin de saison OU Admin d'événement OU Caster
    const permissionPromises = events.value.map(async (event) => {
      try {
        const canEdit = await permissionService.canManageComposition(event.id, seasonId.value);
        canEditEventMap[event.id] = canEdit;
      } catch (error) {
        logger.warn(`⚠️ Erreur lors du chargement des permissions pour l'événement ${event.id}:`, error);
        // Fallback : utiliser les permissions globales
        canEditEventMap[event.id] = canEditEvents.value;
      }
    });
    
    await Promise.all(permissionPromises);
    logger.debug(`✅ Permissions chargées pour ${events.value.length} événements`);
  } catch (error) {
    logger.error('❌ Erreur lors du chargement des permissions d\'événement:', error);
  }
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
  
  // Vérifier les permissions d'édition
  await checkEditPermissions()
  
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
      const showAvailability = urlParams.get('showAvailability') === 'true'
      const tabParam = urlParams.get('tab')
      const showConfirm = urlParams.get('showConfirm') === 'true'
      const targetEvent = events.value.find(e => e.id === eventId)
      if (targetEvent) {
        nextTick(() => {
          showEventDetails(targetEvent, showAvailability, false, false, tabParam, showConfirm) // Ne pas mettre à jour l'URL
        })
      }
    }
    
    // Gérer le paramètre showAvailability pour les routes /event/:eventId
    console.log('🔍 DEBUG onMounted: vérification showAvailability:', {
      eventId: props.eventId,
      showAvailabilityParam: urlParams.get('showAvailability'),
      allUrlParams: Object.fromEntries(urlParams.entries()),
      currentUrl: window.location.href
    })
    
    if (props.eventId && urlParams.get('showAvailability') === 'true') {
      console.log('🎯 DEBUG onMounted: showAvailability détecté pour eventId:', props.eventId)
      // Attendre que les événements soient chargés
      const checkForEvent = () => {
        const targetEvent = events.value.find(e => e.id === props.eventId)
        if (targetEvent) {
          console.log('🎯 DEBUG onMounted: événement trouvé, ouverture des détails avec showAvailability')
          showEventDetails(targetEvent, true, false) // Ne pas mettre à jour l'URL
        } else if (events.value.length > 0) {
          console.log('❌ DEBUG onMounted: événement non trouvé dans la liste')
        } else {
          // Réessayer dans 100ms
          setTimeout(checkForEvent, 100)
        }
      }
      checkForEvent()
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

// Variables pour l'optimisation mobile - chargement sélectif des joueurs
const userOwnedPlayers = ref(new Set()) // Joueurs protégés de l'utilisateur connecté
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

// Debug: Log de chargement du composant
console.log('🚀 DEBUG GridBoard chargé avec props:', {
  slug: props.slug,
  eventId: props.eventId,
  url: window.location.href,
  showAvailability: new URLSearchParams(window.location.search).get('showAvailability'),
  allSearchParams: window.location.search
})

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
// Computed property pour enrichir tous les joueurs de la saison (pour les modals)
const enrichedAllSeasonPlayers = computed(() => {
  return allSeasonPlayers.value.map(player => ({
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
  } catch {}
}

// Gérer le scroll de la grille
function handleGridScroll(event) {
  updateScrollHints()
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

// Fonction pour charger les joueurs protégés de l'utilisateur connecté
async function loadUserOwnedPlayers() {
  if (!currentUser.value?.email || !seasonId.value) {
    userOwnedPlayers.value = new Set()
    return
  }
  
  try {
    logger.debug('🔍 Chargement des joueurs protégés de l\'utilisateur connecté')
    const associations = await listAssociationsForEmail(currentUser.value.email)
    const seasonalAssociations = associations.filter(a => a.seasonId === seasonId.value)
    
    const ownedPlayerIds = new Set()
    seasonalAssociations.forEach(assoc => {
      if (assoc.isProtected) {
        ownedPlayerIds.add(assoc.playerId)
      }
    })
    
    userOwnedPlayers.value = ownedPlayerIds
    logger.debug(`✅ ${ownedPlayerIds.size} joueurs protégés trouvés pour l'utilisateur`, Array.from(ownedPlayerIds))
  } catch (error) {
    logger.error('Erreur lors du chargement des joueurs de l\'utilisateur:', error)
    userOwnedPlayers.value = new Set()
  }
}

// Fonction utilitaire pour charger les disponibilités pour tous les joueurs de la saison
async function loadAvailabilityForAllPlayers() {
  const allPlayers = allSeasonPlayers.value.length > 0 ? allSeasonPlayers.value : players.value
  return await loadAvailability(allPlayers, events.value, seasonId.value)
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
      loadActiveEvents(seasonId.value),
      loadAvailabilityForAllPlayers(),
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
        const { createRemindersForSelection, removeRemindersForEvent, removeAvailabilityRemindersForEvent } = await import('../services/reminderService.js')
        
        // Supprimer tous les anciens rappels pour cet événement (sélection + disponibilité)
        await Promise.all([
          removeRemindersForEvent({
            seasonId: seasonId.value,
            eventId: editingEvent.value
          }),
          removeAvailabilityRemindersForEvent({
            seasonId: seasonId.value,
            eventId: editingEvent.value
          })
        ])
        
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
      loadActiveEvents(seasonId.value),
      loadAvailabilityForAllPlayers(),
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
      loadAvailabilityForAllPlayers(),
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
    
    // Mettre à jour allSeasonPlayers avec les nouveaux joueurs
    allSeasonPlayers.value = [...newPlayers]
    
    // Charger les disponibilités avec les nouveaux joueurs
    const newAvailabilityData = await loadAvailabilityForAllPlayers()
    
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
      
      // S'assurer qu'on est en vue grille pour afficher le nouveau joueur
      if (validCurrentView.value === 'timeline') {
        currentView.value = 'spectacles'
      }
      
      // Sélectionner automatiquement le nouveau joueur pour l'afficher dans la vue
      await handlePlayerSelected(newPlayer)
      
      // Fermer le formulaire de création
      newPlayerForm.value = false

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

// Removed selectedEventTotalTeamSize (badge removed)

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
// Removed chances-related state (no longer used)

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
const allEventsData = ref([]) // Tous les événements (y compris passés et archivés)
const players = ref([])
const availability = ref({})
const casts = ref({})
const stats = ref({})
const chances = ref({})

// Fonction pour récupérer la disponibilité de l'utilisateur connecté pour l'événement courant
function getCurrentUserAvailabilityForEvent() {
  if (!currentUserPlayer.value || !selectedEvent.value) {
    return { available: null, roles: [], comment: null }
  }
  
  const playerName = currentUserPlayer.value.name
  const eventId = selectedEvent.value.id
  
  // Toujours utiliser getAvailabilityData qui a accès aux données de sélection
  // et peut gérer correctement les cas où on est sélectionné mais pas encore confirmé par l'organisateur
  const availabilityData = getAvailabilityData(playerName, eventId, availability.value, {
    getPlayerSelectionRole: getPlayerSelectionRole,
    getPlayerDeclinedRole: getPlayerDeclinedRole,
    getPlayerSelectionStatus: getPlayerSelectionStatus,
    isSelectionConfirmedByOrganizer: isSelectionConfirmedByOrganizer
  })
  
  return availabilityData || { available: null, roles: [], comment: null }
}

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

// Initialiser selectedPlayerId avec le premier joueur favori quand les données sont chargées
// (Initialisation déplacée dans onMounted pour éviter les erreurs de watcher)


// Surveiller les changements d'état d'authentification pour recharger les joueurs protégés
watch(() => getFirebaseAuth()?.currentUser?.email, async (newEmail, oldEmail) => {
  if (newEmail !== oldEmail && seasonId.value) {
    logger.debug('🔄 Changement d\'état d\'authentification, rechargement des joueurs protégés')
    
    // Réinitialiser les états d'affichage lors du changement d'authentification
    isAllPlayersView.value = false
    isFocusedView.value = false
    highlightedPlayer.value = null
    manuallyAddedPlayers.value = new Set()
    
    await loadProtectedPlayers()
    await updatePreferredPlayersSet()
    
    // FORCER le refresh des permissions d'édition (ignorer le cache)
    logger.info('🔐 Forçage du refresh des permissions après changement d\'authentification')
    await checkEditPermissions(true) // Force refresh
  }
})

// Watcher pour mettre à jour currentUserPlayer quand currentUser ou allSeasonPlayers changent
watch([() => currentUser.value, () => allSeasonPlayers.value], () => {
  console.log('🔄 DEBUG watcher currentUser/allSeasonPlayers:', {
    currentUser: currentUser.value ? { email: currentUser.value.email } : null,
    allSeasonPlayersCount: allSeasonPlayers.value.length
  })
  
  currentUserPlayer.value = getCurrentUserPlayer()
  
  console.log('🔄 DEBUG currentUserPlayer mis à jour:', currentUserPlayer.value ? { 
    id: currentUserPlayer.value.id, 
    name: currentUserPlayer.value.name 
  } : null)
}, { immediate: true })

// Surveiller les changements de saison pour re-vérifier les permissions
watch(() => seasonId.value, async (newSeasonId, oldSeasonId) => {
  if (newSeasonId && newSeasonId !== oldSeasonId) {
    logger.info('🔄 Changement de saison détecté, re-vérification des permissions')
    await checkEditPermissions(true) // Force refresh lors du changement de saison
  }
})

// Watcher pour gérer le paramètre showAvailability dans l'URL
const showAvailabilityProcessed = ref(false)
watch(() => [props.eventId, events.value], ([eventId, eventsList]) => {
  console.log('🔍 DEBUG showAvailability watcher déclenché:', {
    eventId,
    eventsCount: eventsList?.length || 0,
    hasEventId: !!eventId,
    alreadyProcessed: showAvailabilityProcessed.value,
    url: window.location.href,
    searchParams: window.location.search
  })
  
  if (eventId && eventsList.length > 0 && !showAvailabilityProcessed.value) {
    // Vérifier si showAvailability=true est dans l'URL
    const urlParams = new URLSearchParams(window.location.search)
    const showAvailability = urlParams.get('showAvailability') === 'true'
    
    console.log('🔍 DEBUG showAvailability watcher:', {
      eventId,
      eventsCount: eventsList.length,
      urlParams: window.location.search,
      showAvailability,
      hasEventId: !!eventId
    })
    
    if (showAvailability) {
      showAvailabilityProcessed.value = true // Marquer comme traité pour éviter les boucles
      const targetEvent = eventsList.find(e => e.id === eventId)
      console.log('🎯 DEBUG showAvailability: targetEvent trouvé:', {
        targetEvent: targetEvent ? { id: targetEvent.id, title: targetEvent.title } : null,
        eventId
      })
      
      if (targetEvent) {
        // Ouvrir les détails de l'événement avec showAvailability=true
        console.log('🚀 DEBUG showAvailability: ouverture de showEventDetails avec showAvailability=true')
        nextTick(() => {
          showEventDetails(targetEvent, true, false) // Ne pas mettre à jour l'URL
        })
      }
    }
  }
}, { immediate: true })

// Initialiser les données au montage
onMounted(async () => {
  // Détecter si on est sur mobile (simplifié)
  isMobile.value = window.innerWidth < 768
  
  // Ajouter un listener pour la redimensionnement
  const handleResize = () => {
    isMobile.value = window.innerWidth < 768
  }
  window.addEventListener('resize', handleResize)
  
  // Listener pour fermer les menus déroulants (géré par ViewHeader maintenant)
  // const handleClickOutside = (event) => {
  //   if (showViewDropdown.value && !event.target.closest('.view-dropdown-container')) {
  //     showViewDropdown.value = false
  //   }
  // }
  // document.addEventListener('click', handleClickOutside)
  
  // Nettoyer les listeners au démontage
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    // document.removeEventListener('click', handleClickOutside) // Géré par ViewHeader maintenant
  })
  
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
      // Terminer le marqueur de performance avant de sortir
      if (performanceService.markers.has('grid_loading')) {
        performanceService.end('grid_loading', {
          playersCount: 0,
          eventsCount: 0,
          seasonId: null,
          error: 'season_not_found'
        })
      }
      return
    }

    // Fonction de debug pour charger TOUS les événements
    window.loadAllEventsForDebug = async function() {
      if (!seasonId.value) return
      
      try {
        console.log('🔍 Debug: Chargement de TOUS les événements (y compris archivés et passés)')
        const allEvents = await firestoreService.getDocuments('seasons', seasonId.value, 'events')
        console.log('🔍 Debug: Événements trouvés:', allEvents.length)
        
        // Afficher les détails de chaque événement
        allEvents.forEach(event => {
          console.log(`  - ${event.title} (${event.date}): archived=${event.archived}, confirmed=${event.confirmed}`)
        })
        
        // Remplacer temporairement la liste des événements
        events.value = allEvents
        console.log('🔍 Debug: Liste des événements mise à jour avec tous les événements')
        
      } catch (error) {
        console.error('❌ Erreur lors du chargement de tous les événements:', error)
      }
    }

    // Fonction pour restaurer la vue normale (événements actifs seulement)
    window.restoreNormalEventsView = async function() {
      if (!seasonId.value) return
      
      try {
        console.log('🔍 Debug: Restauration de la vue normale (événements actifs seulement)')
        const activeEvents = await loadActiveEvents(seasonId.value)
        events.value = activeEvents
        console.log('🔍 Debug: Vue normale restaurée avec', activeEvents.length, 'événements actifs')
        
      } catch (error) {
        console.error('❌ Erreur lors de la restauration de la vue normale:', error)
      }
    }

    // Fonction pour tester le comptage des sélections
    window.testSelectionCounting = function() {
      console.log('🔍 Debug: Test du comptage des sélections')
      console.log('📊 Événements disponibles:', events.value.length)
      console.log('📊 Casts disponibles:', Object.keys(casts.value).length)
      
      // Tester avec quelques joueurs
      const testPlayers = ['Rachid', 'Patrice', 'Véro', 'Marjo']
      const testRoles = ['player', 'volunteer', 'mc', 'referee']
      
      testPlayers.forEach(playerName => {
        console.log(`\n👤 ${playerName}:`)
        testRoles.forEach(role => {
          const count = countSelections(playerName, role)
          console.log(`  ${role}: ${count} sélections`)
        })
      })
    }

    // Fonction pour tester le comptage avec tous les événements
    window.testSelectionCountingWithAllEvents = function() {
      console.log('🔍 Debug: Test du comptage avec TOUS les événements')
      
      // Sauvegarder la liste actuelle
      const originalEvents = [...events.value]
      
      // Charger tous les événements
      loadAllEventsForDebug().then(() => {
        console.log('📊 Événements avec tous:', events.value.length)
        
        // Tester le comptage
        const testPlayers = ['Rachid', 'Patrice', 'Véro', 'Marjo']
        const testRoles = ['player', 'volunteer', 'mc', 'referee']
        
        testPlayers.forEach(playerName => {
          console.log(`\n👤 ${playerName}:`)
          testRoles.forEach(role => {
            const count = countSelections(playerName, role)
            console.log(`  ${role}: ${count} sélections`)
          })
        })
        
        // Restaurer la liste originale
        events.value = originalEvents
        console.log('✅ Liste des événements restaurée')
      })
    }

    // Charger les données de la saison
    if (seasonId.value) {
      // Étape 1: événements
      currentLoadingLabel.value = 'Chargement des événements de la saison'
      loadingProgress.value = 20
      
      // Charger TOUS les événements (y compris passés et archivés)
      allEventsData.value = await performanceService.measureStep('load_all_events', async () => {
        return await firestoreService.getDocuments('seasons', seasonId.value, 'events')
      }, { seasonId: seasonId.value, count: 'unknown' })
      
      // Filtrer pour ne garder que les événements actifs dans events.value
      events.value = await performanceService.measureStep('load_events', async () => {
        return await loadActiveEvents(seasonId.value)
      }, { seasonId: seasonId.value, count: 'unknown' })
      
      // Charger les permissions pour chaque événement
      await loadEventPermissions()

      // Étape 2: joueurs (optimisation mobile - chargement sélectif)
      currentLoadingLabel.value = 'Chargement des joueurs'
      loadingProgress.value = 45
      
      // Charger tous les joueurs de la saison
      players.value = await performanceService.measureStep('load_players', async () => {
        return await loadPlayers(seasonId.value)
      }, { seasonId: seasonId.value, count: 'unknown' })
      
      // Charger aussi tous les joueurs pour les modals (EventRoleGroupingView, etc.)
      allSeasonPlayers.value = [...players.value]
      
      logger.debug(`📊 Chargé ${players.value.length} joueurs de la saison`)
      
      // OPTIMISATION MOBILE : Si l'utilisateur est connecté, charger ses joueurs protégés
      if (currentUser.value?.email) {
        try {
          // Charger les joueurs protégés de l'utilisateur connecté
          await loadUserOwnedPlayers()
          
          if (userOwnedPlayers.value.size > 0) {
            // Filtrer pour ne garder que les joueurs protégés de l'utilisateur
            const allPlayers = players.value
            const filteredPlayers = allPlayers.filter(player => userOwnedPlayers.value.has(player.id))
            players.value = filteredPlayers
            
            // Mettre à jour allSeasonPlayers avec tous les joueurs (pas seulement les protégés)
            allSeasonPlayers.value = [...allPlayers]
            
            logger.debug(`📊 OPTIMISATION MOBILE: Filtré vers ${filteredPlayers.length} joueurs protégés sur ${allPlayers.length} total`)
          } else {
            logger.debug('📊 Pas de joueurs protégés trouvés, affichage de tous les joueurs')
            // Mettre à jour allSeasonPlayers avec tous les joueurs
            allSeasonPlayers.value = [...players.value]
          }
        } catch (error) {
          logger.error('Erreur lors du chargement sélectif:', error)
          // Les joueurs sont déjà chargés, pas besoin de recharger
        }
      } else {
        // Utilisateur non connecté : allSeasonPlayers est déjà rempli
        logger.debug('📊 Utilisateur non connecté, allSeasonPlayers déjà rempli')
      }

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
      
      // Étape 3: disponibilités (optimisation mobile - chargement sélectif)
      currentLoadingLabel.value = 'Chargement des disponibilités'
      loadingProgress.value = 70
      
      // OPTIMISATION MOBILE : Charger les disponibilités de manière sélective
      logger.debug('🚀 Chargement sélectif des disponibilités (optimisation mobile)')
      
      // Charger les disponibilités pour tous les joueurs de la saison (pas seulement ceux visibles dans la grille)
      const allPlayers = allSeasonPlayers.value
      logger.debug(`📊 Chargement des disponibilités pour ${allPlayers.length} joueurs (tous)`)
      
      availability.value = await performanceService.measureStep('load_availability_all', async () => {
        return await loadAvailability(allPlayers, events.value, seasonId.value)
      }, { 
        seasonId: seasonId.value, 
        playersCount: allPlayers.length, 
        eventsCount: events.value.length 
      })
      
      logger.debug('✅ Disponibilités chargées avec succès (tous les joueurs)')
      
      // Initialiser les états de chargement pour tous les joueurs
      allPlayers.forEach(player => {
        playerLoadingStates.value.set(player.id, 'loaded')
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
      
      // Étape 6: joueurs protégés déjà chargés dans l'étape 2 (optimisation mobile)
      
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
      
      // Appliquer également le filtre d'événement comme si choisi dans le ViewHeader
      // Cela limite la grille à cet événement pour permettre de déposer ses disponibilités directement
      selectedEventId.value = eventIdFromUrl
      isAllEventsView.value = false

              // Si modal=event_details est demandé, ouvrir automatiquement la modal
        if (route.query.modal === 'event_details') {
          const tabParam = route.query.tab || null
          const showConfirm = route.query.showConfirm === 'true'
          const showAvailability = route.query.showAvailability === 'true'
          showEventDetails(targetEvent, showAvailability, false, false, tabParam, showConfirm)
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
  } finally {
    // S'assurer que le marqueur de performance est toujours terminé
    if (performanceService.markers.has('grid_loading')) {
      const totalGridLoadingTime = performanceService.end('grid_loading', {
        playersCount: players.value?.length || 0,
        eventsCount: events.value?.length || 0,
        seasonId: seasonId.value,
        error: true
      })
      logger.info(`🚀 Grille chargée (avec erreur) en ${totalGridLoadingTime.toFixed(2)}ms`)
    }
  }

  // Désistement: plus de modal/route dédiée, on utilise les magic links "no"
})

// Watch for authentication state changes to update view mode
watch(() => currentUser.value?.email, async (newEmail, oldEmail) => {
  logger.debug('Changement d\'état d\'authentification détecté:', newEmail ? 'connecté' : 'déconnecté')
  initializeViewMode()
  
  // Invalider le cache des permissions d'événement lors du changement d'utilisateur
  if (newEmail !== oldEmail) {
    logger.info('🔐 [GridBoard] Invalidation du cache des permissions d\'événement suite au changement d\'utilisateur')
    // Vider le cache
    Object.keys(canEditEventMap).forEach(key => delete canEditEventMap[key])
    // Recharger les permissions si on a des événements
    if (seasonId.value && events.value && events.value.length > 0) {
      await loadEventPermissions()
    }
  }
  
  // Nettoyer l’URL (ex. modal=selection) à la déconnexion
  if (!newEmail) {
    closeSelectionModal()
  }
}, { immediate: false })
// Full-screen event view: when route is /season/:slug/event/:eventId, show event details in-page (no modal)
const isEventFullScreen = computed(() => !!route.params.eventId)

// Sync state from event route (selectedEvent, tab, etc.) without opening modal or pushing URL
async function syncStateFromEventRoute(event, { showAvailability = false, forceTab = null, showConfirm = false, fromAllPlayersFilter = false } = {}) {
  if (!event) return
  if (currentUser.value) currentUserPlayer.value = getCurrentUserPlayer()
  const defaultTab = getDefaultTabForEvent(event)
  const normalizedForceTab = forceTab == null ? null : String(forceTab).toLowerCase() === 'compo' ? 'composition' : String(forceTab).toLowerCase()
  if (fromAllPlayersFilter) {
    selectedTeamPlayer.value = { id: 'all', name: 'Tous' }
    eventDetailsActiveTab.value = 'team'
  } else if (normalizedForceTab === 'info') {
    eventDetailsActiveTab.value = 'info'
  } else if (normalizedForceTab === 'team') {
    eventDetailsActiveTab.value = 'team'
    if (showAvailability && currentUserPlayer.value) selectedTeamPlayer.value = currentUserPlayer.value
    else if (!selectedTeamPlayer.value) selectedTeamPlayer.value = currentUserPlayer.value || { id: 'all', name: 'Tous' }
  } else if (normalizedForceTab === 'composition') {
    eventDetailsActiveTab.value = 'composition'
  } else if (showAvailability && currentUserPlayer.value) {
    selectedTeamPlayer.value = currentUserPlayer.value
    eventDetailsActiveTab.value = 'team'
  } else if (showAvailability && !currentUserPlayer.value) {
    selectedTeamPlayer.value = { id: 'all', name: 'Tous' }
    eventDetailsActiveTab.value = defaultTab
  } else {
    eventDetailsActiveTab.value = defaultTab
  }
  selectedEvent.value = event
  editingDescription.value = event.description || ''
  editingArchived.value = !!event.archived
  showAvailabilityInEventDetails.value = showAvailability
  try {
    const [newAvailability, newSelections] = await Promise.all([loadAvailabilityForAllPlayers(), loadCasts(seasonId.value)])
    availability.value = newAvailability
    casts.value = newSelections
  } catch (e) {
    console.warn('Impossible de rafraîchir les données pour l\'écran événement:', e)
  }
  if (showConfirm) {
    await nextTick()
    setTimeout(async () => { await checkAndOpenConfirmationModal(event.id) }, 300)
  }
}

// When on event route, sync state from route (no modal)
watch(() => route.params.eventId, (newEventId) => {
  if (!newEventId) return
  const apply = () => {
    const targetEvent = events.value.find(e => e.id === newEventId)
    if (targetEvent) {
      const showAvailability = route.query.showAvailability === 'true'
      const showConfirm = route.query.showConfirm === 'true'
      const tabParam = route.query.tab || null
      syncStateFromEventRoute(targetEvent, { showAvailability, forceTab: tabParam, showConfirm })
      return true
    }
    return false
  }
  if (events.value.length > 0) {
    apply()
  } else {
    const unwatch = watch(events, (newEvents) => {
      if (newEvents.length > 0 && apply()) unwatch()
    }, { immediate: true })
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

// Exposer l'ensemble des joueurs préférés pour la surbrillance légère
const preferredPlayerIdsSet = ref(new Set())

const sortedPlayers = computed(() => {
  const base = [...players.value].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' }))
  
  // Pour les utilisateurs connectés, organiser l'ordre : favoris -> ajoutés manuellement -> autres
  if (currentUser.value?.email) {
    logger.debug('🔄 Tri des joueurs avec favoris en premier, puis ajoutés manuellement')
    
    const favorites = base.filter(p => preferredPlayerIdsSet.value.has(p.id))
    const manuallyAdded = base.filter(p => manuallyAddedPlayers.value.has(p.id) && !preferredPlayerIdsSet.value.has(p.id))
    const others = base.filter(p => !preferredPlayerIdsSet.value.has(p.id) && !manuallyAddedPlayers.value.has(p.id))
    
    // Trier chaque catégorie par ordre alphabétique
    const sortedFavorites = favorites.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' }))
    const sortedManuallyAdded = manuallyAdded.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' }))
    const sortedOthers = others.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' }))
    
    logger.debug('⭐ Favoris:', sortedFavorites.map(p => p.name))
    logger.debug('➕ Ajoutés manuellement:', sortedManuallyAdded.map(p => p.name))
    logger.debug('📝 Autres joueurs:', sortedOthers.map(p => p.name))
    
    return [...sortedFavorites, ...sortedManuallyAdded, ...sortedOthers]
  }
  
  return base
})

// Computed pour les joueurs affichés
const displayedPlayers = computed(() => {
  // Si un joueur spécifique est sélectionné, ne montrer que ce joueur
  if (selectedPlayerId.value) {
    const selectedPlayer = sortedPlayers.value.find(p => p.id === selectedPlayerId.value)
    return selectedPlayer ? [selectedPlayer] : []
  }
  // Sinon, montrer tous les joueurs (option "Tous")
  return sortedPlayers.value
})

// Computed pour le nombre de participants masqués (pour les vues lignes/colonnes)
const hiddenPlayersCount = computed(() => {
  // Seulement pour les vues lignes et colonnes
  if (validCurrentView.value === 'timeline') {
    return 0
  }
  
  // Si on est en mode "tous les joueurs", aucun n'est masqué
  if (isAllPlayersView.value) {
    return 0
  }
  
  // Calculer la différence entre tous les joueurs de la saison et ceux affichés
  const totalSeasonPlayers = allSeasonPlayers.value.length
  const displayedCount = players.value.length
  
  return Math.max(0, totalSeasonPlayers - displayedCount)
})

// Computed pour l'affichage sous "Afficher Tous" (nombre de joueurs masqués)
const hiddenPlayersDisplayText = computed(() => {
  // Seulement pour les vues lignes et colonnes
  if (validCurrentView.value === 'timeline') {
    return null
  }
  
  const displayedCount = players.value.length
  const totalCount = allSeasonPlayers.value.length
  const hiddenCount = totalCount - displayedCount
  
  if (displayedCount === 0) return null
  
  // Si tous les participants sont affichés, afficher "Tous"
  if (hiddenCount === 0) {
    return 'Tous'
  }
  
  // Si des participants sont masqués, afficher le nombre
  if (hiddenCount > 0) {
    return `${hiddenCount} masqué${hiddenCount > 1 ? 's' : ''}`
  }
  
  return null
})

// Computed pour les événements cachés (similaire aux joueurs cachés)
const hiddenEventsCount = computed(() => {
  // Si on est en mode "tous les événements", aucun n'est masqué
  if (isAllEventsView.value) {
    return 0
  }
  
  // Si un événement spécifique est sélectionné, calculer les événements masqués
  if (selectedEventId.value) {
    const totalEvents = events.value.length
    const displayedCount = displayedEvents.value.length
    return Math.max(0, totalEvents - displayedCount)
  }
  
  // Si aucun événement n'est sélectionné, calculer les événements masqués (archivés/passés)
  const totalEvents = events.value.length
  const displayedCount = displayedEvents.value.length
  return Math.max(0, totalEvents - displayedCount)
})

// Computed pour l'affichage sous "Afficher Tous" (nombre d'événements masqués)
const hiddenEventsDisplayText = computed(() => {
  const displayedCount = displayedEvents.value.length
  const totalCount = events.value.length
  const hiddenCount = totalCount - displayedCount
  
  if (displayedCount === 0) return null
  
  // Si tous les événements sont affichés, afficher "Tous"
  if (hiddenCount === 0) {
    return 'Tous'
  }
  
  // Si des événements sont masqués, afficher le nombre
  if (hiddenCount > 0) {
    return `${hiddenCount} masqué${hiddenCount > 1 ? 's' : ''}`
  }
  
  return null
})


// Computed dropdownDisplayText supprimé - logique déplacée dans ViewHeader

// Debug: surveiller les changements d'état de manière plus sûre
watch([selectedPlayerId, validCurrentView], ([newSelectedPlayerId, newView]) => {
  console.log('🔍 GridBoard: player selection changed:', {
    selectedPlayerId: newSelectedPlayerId,
    selectedPlayer: selectedPlayer.value,
    currentView: newView
  })
}, { immediate: true })

// Watcher pour initialiser selectedPlayerId avec le premier favori
watch(() => [preferredPlayerIdsSet.value.size, allSeasonPlayers.value.length], ([favoritesSize, seasonPlayersLength]) => {
  try {
    // Ne pas initialiser automatiquement le joueur favori pour la vue "casts"
    if (validCurrentView.value === 'casts') {
      return
    }
    
    // Seulement si on a des favoris, des joueurs de saison, et pas encore de joueur sélectionné
    if (favoritesSize > 0 && seasonPlayersLength > 0 && !selectedPlayerId.value) {
      const firstFavoriteId = preferredPlayerIdsSet.value.values().next().value
      const firstFavorite = allSeasonPlayers.value.find(p => p.id === firstFavoriteId)
      
      if (firstFavorite) {
        selectedPlayerId.value = firstFavoriteId
        logger.debug('🎯 Joueur par défaut initialisé avec le premier favori:', firstFavorite.name)
      }
    }
  } catch (error) {
    logger.error('❌ Erreur dans le watcher selectedPlayerId:', error)
  }
}, { immediate: true })

// Watcher pour réinitialiser selectedPlayerId quand on passe à la vue "casts"
watch(validCurrentView, async (newView, oldView) => {
  console.log('🔍 Vue changée:', { from: oldView, to: newView })
  
  // Si on passe à la vue "casts", réinitialiser selectedPlayerId et charger tous les joueurs
  if (newView === 'casts' && oldView !== 'casts') {
    console.log('🎯 Activation de la vue casts')
    selectedPlayerId.value = null
    
    // Charger tous les joueurs pour la vue "casts"
    try {
      const allPlayers = await loadPlayers(seasonId.value)
      console.log('📊 Joueurs chargés pour casts:', allPlayers.length, allPlayers.map(p => p.name))
      
      players.value = allPlayers
      console.log('📊 players.value après mise à jour:', players.value.length)
      
      // Recharger les disponibilités pour tous les joueurs
      const newAvailability = await loadAvailability(allPlayers, events.value, seasonId.value)
      availability.value = newAvailability
      
      logger.debug('🎯 Vue "casts" activée, chargement de tous les joueurs:', allPlayers.length)
    } catch (error) {
      logger.error('❌ Erreur lors du chargement de tous les joueurs pour la vue casts:', error)
    }
  }
})

// Watcher pour recharger les joueurs protégés de l'utilisateur quand l'authentification change
watch(() => currentUser.value?.email, async (newEmail) => {
  if (newEmail && seasonId.value) {
    await loadUserOwnedPlayers()
  } else {
    userOwnedPlayers.value = new Set()
  }
})

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

// Fonction de chargement progressif optimisée pour les joueurs filtrés (optimisation mobile)
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
      ? players.find(p => normalizeEmail(p.email) === normalizeEmail(currentUser.value.email))
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
    const currentEmailNormalized = normalizeEmail(currentUser.value?.email)
    const favoritePlayers = currentUser.value?.email && preferredPlayerIdsSet.value.size > 0
      ? players.filter(p => preferredPlayerIdsSet.value.has(p.id) && normalizeEmail(p.email) !== currentEmailNormalized)
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
      const isCurrentPlayer = currentUser.value?.email && normalizeEmail(p.email) === normalizeEmail(currentUser.value.email)
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

// Fonction de chargement progressif optimisée pour les joueurs filtrés (optimisation mobile)
async function loadAvailabilityProgressivelyOptimized(players, events, seasonId) {
  logger.debug('🚀 APPEL de loadAvailabilityProgressivelyOptimized - Début (version optimisée)')
  return await performanceService.measureStep('load_availability_progressive_optimized', async () => {
    logger.debug('🚀 DANS performanceService.measureStep - Début du chargement progressif optimisé')
    isProgressiveLoading.value = true
    totalPlayersCount.value = players.length
    loadedPlayersCount.value = 0
    
    // Initialiser tous les joueurs comme "loading"
    players.forEach(player => {
      playerLoadingStates.value.set(player.id, 'loading')
    })
    
    logger.debug(`📊 Initialisation: ${players.length} joueurs à charger, ${events.length} événements`)
  
    try {
      // OPTIMISATION MOBILE : Chargement séquentiel simple des joueurs filtrés
      logger.debug('🚀 Chargement séquentiel des joueurs filtrés')
      
      for (const player of players) {
        const playerAvailability = await loadPlayerAvailability(player, seasonId)
        
        // Mettre à jour availability immédiatement pour ce joueur
        availability.value[player.name] = playerAvailability
        
        // Forcer la réactivité après chaque joueur
        await nextTick()
        
        loadedPlayersCount.value++
        logger.debug(`✅ Joueur chargé: ${player.name} (${Object.keys(playerAvailability).length} disponibilités) - ${loadedPlayersCount.value}/${players.length}`)
      }
      
      logger.debug('🚀 PHASE FINALE: Finalisation')
      // Finaliser le chargement
      isProgressiveLoading.value = false
      
      // Jalon final : Tous les joueurs chargés
      performanceService.milestone('load_availability_progressive_optimized', 'filtered_players_loaded', {
        totalPlayersCount: totalPlayersCount.value,
        description: 'Toutes les disponibilités des joueurs filtrés chargées'
      })
      
      // Retourner availability.value pour compatibilité
      logger.debug('🚀 FIN de loadAvailabilityProgressivelyOptimized - Retour de availability.value')
      return availability.value
    } catch (error) {
      logger.error('❌ Erreur lors du chargement progressif optimisé:', error)
      isProgressiveLoading.value = false
      throw error
    }
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

// Fonction helper pour normaliser un email (lowercase + trim)
function normalizeEmail(email) {
  return email?.toLowerCase().trim() || ''
}

// Fonction helper pour vérifier si un joueur appartient à l'utilisateur connecté
async function isPlayerOwnedByCurrentUser(playerId) {
  // Si pas d'utilisateur connecté, retourner false
  if (!currentUser.value?.email) return false
  
  try {
    // Vérifier directement si ce joueur est protégé par l'utilisateur connecté
    const { getPlayerData } = await import('../services/players.js')
    const protectionData = await getPlayerData(playerId, seasonId.value)
    
    // Le joueur appartient à l'utilisateur si :
    // 1. Il est protégé
    // 2. L'email de protection correspond à l'email de l'utilisateur connecté
    // Normaliser les emails avant comparaison pour éviter les problèmes de casse
    const currentEmail = normalizeEmail(currentUser.value.email)
    const protectionEmail = normalizeEmail(protectionData?.email)
    return protectionData?.isProtected && protectionEmail === currentEmail
  } catch (error) {
    logger.warn('Erreur lors de la vérification de propriété du joueur:', error)
    return false
  }
}

// Fonction générique pour vérifier si l'utilisateur courant peut modifier les disponibilités d'un joueur
async function canModifyPlayerAvailability(playerId, eventId) {
  try {
    // Si le joueur n'est pas protégé, toujours permettre la modification
    const isProtected = isPlayerProtectedInGrid(playerId)
    if (!isProtected) {
      return true
    }
    
    // Si le joueur est protégé, vérifier les permissions
    const userEmail = currentUser.value?.email
    if (!userEmail) {
      logger.warn('🔐 canModifyPlayerAvailability: pas d\'email utilisateur')
      return false
    }
    
    logger.debug('🔐 canModifyPlayerAvailability: vérification permissions:', {
      playerId,
      eventId,
      userEmail,
      isProtected
    })
    
    // Vérifier si l'utilisateur est le propriétaire
    const isOwned = await isPlayerOwnedByCurrentUser(playerId)
    if (isOwned) {
      return true
    }
    
    // Vérifier si l'utilisateur est admin
    if (!permissionService.isInitialized) {
      await permissionService.initialize()
    }
    
    const isAdmin = await permissionService.isUserAdmin(userEmail, seasonId.value, eventId)
    if (isAdmin) {
      return true
    }
    
    logger.debug('🔐 canModifyPlayerAvailability: aucune permission trouvée')
    return false
  } catch (error) {
    logger.error('Erreur lors de la vérification des permissions de modification:', error)
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

// Computed pour tous les événements (y compris passés et archivés) - utilisé par EventSelectorModal
const allEvents = computed(() => {
  // Utiliser allEventsData qui contient tous les événements
  return [...allEventsData.value].sort((a, b) => {
    const da = toDateObject(a.date)
    const db = toDateObject(b.date)
    const ta = da ? da.getTime() : Number.POSITIVE_INFINITY
    const tb = db ? db.getTime() : Number.POSITIVE_INFINITY
    if (ta !== tb) return ta - tb
    return (a.title || '').localeCompare(b.title || '', 'fr', { sensitivity: 'base' })
  })
})


const displayedEvents = computed(() => {
  let filteredEvents
  
  // Si un événement spécifique est sélectionné, utiliser tous les événements pour le trouver
  if (selectedEventId.value) {
    filteredEvents = allEvents.value
    filteredEvents = filteredEvents.filter(event => event.id === selectedEventId.value)
  } else if (isAllEventsView.value) {
    // Mode "tous les événements" : afficher tous les événements selon les filtres
    filteredEvents = allEvents.value
    const now = new Date()
    
    // Utiliser les filtres appropriés selon la vue active
    const currentFilters = validCurrentView.value === 'casts' ? castsEventFilters.value : eventFilters.value
    
    filteredEvents = filteredEvents.filter(event => {
      // Appliquer le filtre des événements inactifs/archivés (inversé : si NON coché, on masque)
      if (!currentFilters.showInactiveEvents && event.archived === true) return false
      
      // Appliquer le filtre des événements passés (inversé : si NON coché, on masque)
      if (!currentFilters.showPastEvents && event.date) {
        const eventDate = (() => {
          if (event.date instanceof Date) return event.date
          if (typeof event.date?.toDate === 'function') return event.date.toDate()
          const d = new Date(event.date)
          return isNaN(d.getTime()) ? null : d
        })()
        
        if (eventDate && eventDate < now) return false
      }
      
      return true
    })
  } else {
    // Mode normal : afficher seulement les événements actifs
    filteredEvents = sortedEvents.value
    const now = new Date()
    
    // Utiliser les filtres appropriés selon la vue active
    const currentFilters = validCurrentView.value === 'casts' ? castsEventFilters.value : eventFilters.value
    
    filteredEvents = filteredEvents.filter(event => {
      // Appliquer le filtre des événements inactifs/archivés
      if (!currentFilters.showInactiveEvents && event.archived === true) return false
      
      // Appliquer le filtre des événements passés
      if (!currentFilters.showPastEvents && event.date) {
        const eventDate = (() => {
          if (event.date instanceof Date) return event.date
          if (typeof event.date?.toDate === 'function') return event.date.toDate()
          const d = new Date(event.date)
          return isNaN(d.getTime()) ? null : d
        })()
        
        if (eventDate && eventDate < now) return false
      }
      
      return true
    })
  }
  
  // Enrichir les événements avec les propriétés _isPast et _isArchived
  const now = new Date()
  return filteredEvents.map(event => {
    const eventDate = (() => {
      if (event.date instanceof Date) return event.date
      if (typeof event.date?.toDate === 'function') return event.date.toDate()
      const d = new Date(event.date)
      return isNaN(d.getTime()) ? null : d
    })()
    
    return {
      ...event,
      _isArchived: event.archived === true,
      _isPast: eventDate ? eventDate < now : false
    }
  })
})

// Computed pour l'événement sélectionné pour le filtre
const selectedEventForFilter = computed(() => {
  if (!selectedEventId.value || !events.value) return null
  return events.value.find(event => event.id === selectedEventId.value)
})


// Computed properties pour l'affichage inversé
const displayRows = computed(() => {
  return validCurrentView.value === 'participants' ? displayedEvents.value : displayedPlayers.value
})

const displayColumns = computed(() => {
  return validCurrentView.value === 'participants' ? displayedPlayers.value : displayedEvents.value
})

// Computed properties pour le popin Afficher Tous
const filteredShowMorePlayers = computed(() => {
  if (!showMoreSearchQuery.value.trim()) {
    return allSeasonPlayers.value
  }
  
  const query = showMoreSearchQuery.value.toLowerCase().trim()
  return allSeasonPlayers.value.filter(player => 
    player.name.toLowerCase().includes(query)
  )
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
  // Empêcher toute modification sur un événement inactif
  if (eventItem.archived) {
    showSuccessMessage.value = true
    successMessage.value = 'Événement inactif — activez pour modifier'
    setTimeout(() => { showSuccessMessage.value = false }, 3000)
    return
  }

  // Vérifier si le joueur est protégé (utiliser la même logique que la grille)
  const isProtected = isPlayerProtectedInGrid(player.id);
  
  // Si le joueur est protégé, vérifier les permissions AVANT d'ouvrir la modale
  if (isProtected) {
    const canModify = await canModifyPlayerAvailability(player.id, eventItem.id)
    if (!canModify) {
      // Afficher un message d'erreur si l'utilisateur n'a pas les permissions
      showErrorMessage.value = true
      errorMessage.value = `Vous n'avez pas les permissions de modifier les disponibilités de ${player.name}.`
      setTimeout(() => {
        showErrorMessage.value = false
      }, 5000)
      return
    }
  }
  
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
    await openAvailabilityModalForPlayer(player, eventItem);
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
  
  // Récupérer les rôles attendus pour cet événement
  let eventRoles = {}
  if (eventItem && eventItem.roles) {
    eventRoles = eventItem.roles
  }
  
  // Ouvrir directement la modale sans passer par openAvailabilityModal pour éviter la boucle infinie
  availabilityModalData.value = {
    playerName: player.name,
    playerId: player.id,
    playerGender: player.gender || 'non-specified',
    eventId: eventItem.id,
    eventTitle: eventItem.title,
    eventDate: eventItem.date,
    availabilityData: currentAvailabilityData,
    isReadOnly: false,
    chancePercent: playerChancePercent,
    isProtected: isProtected,
    eventRoles: eventRoles
  }
  
  showAvailabilityModal.value = true
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
    
    // Si le joueur décline, le déplacer automatiquement vers la section déclinés
    if (newStatus === 'declined') {
      await movePlayerToDeclinedInCast(playerName, eventId, seasonId)
    } else if (newStatus === 'pending' || newStatus === 'confirmed') {
      // Si le joueur reconfirme, le remettre en composition s'il était décliné
      await movePlayerFromDeclinedToCast(playerName, eventId, seasonId)
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
  if (!selection) return []
  
  // Nouvelle structure : vérifier dans declined
  if (selection.declined) {
    const declinedPlayers = []
    Object.values(selection.declined).forEach(playerIds => {
      if (Array.isArray(playerIds)) {
        playerIds.forEach(playerId => {
          const player = allSeasonPlayers.value.find(p => p.id === playerId)
          if (player) {
            declinedPlayers.push(player.name)
          }
        })
      }
    })
    return declinedPlayers
  }
  
  // Fallback sur l'ancienne structure playerStatuses
  if (selection.playerStatuses) {
    return Object.entries(selection.playerStatuses)
      .filter(([playerId, status]) => status === 'declined')
      .map(([playerId]) => {
        const player = allSeasonPlayers.value.find(p => p.id === playerId)
        return player ? player.name : playerId
      })
  }
  
  return []
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

// Fonction pour déplacer un joueur vers la section déclinés quand il décline
async function movePlayerToDeclinedInCast(playerName, eventId, seasonId) {
  try {
    const player = allSeasonPlayers.value.find(p => p.name === playerName)
    if (!player) return
    
    // Use the centralized service function
    const result = await movePlayerToDeclined(player.id, eventId, seasonId)
    
    if (result.success) {
      console.log('Joueur déplacé vers les déclinés:', playerName)
    }
  } catch (error) {
    console.error('Erreur lors du déplacement vers les déclinés:', error)
  }
}

// Fonction pour remettre un joueur en composition quand il reconfirme
async function movePlayerFromDeclinedToCast(playerName, eventId, seasonId) {
  try {
    const player = allSeasonPlayers.value.find(p => p.name === playerName)
    if (!player) return
    
    const currentSelection = casts.value[eventId]
    if (!currentSelection) return
    
    // Trouver le rôle du joueur dans les déclinés
    let playerRole = null
    if (currentSelection.declined) {
      for (const [role, playerIds] of Object.entries(currentSelection.declined)) {
        if (Array.isArray(playerIds) && playerIds.includes(player.id)) {
          playerRole = role
          break
        }
      }
    }
    
    if (!playerRole) return
    
    // Retirer le joueur des déclinés
    const newDeclined = { ...currentSelection.declined }
    if (newDeclined[playerRole]) {
      newDeclined[playerRole] = newDeclined[playerRole].filter(id => id !== player.id)
      if (newDeclined[playerRole].length === 0) {
        delete newDeclined[playerRole]
      }
    }
    
    // Remettre le joueur dans la composition normale
    const newRoles = { ...currentSelection.roles }
    if (!newRoles[playerRole]) {
      newRoles[playerRole] = []
    }
    if (!newRoles[playerRole].includes(player.id)) {
      newRoles[playerRole].push(player.id)
    }
    
    // Sauvegarder avec la nouvelle structure
    const { saveCast } = await import('../services/storage.js')
    await saveCast(eventId, newRoles, seasonId, { 
      declined: newDeclined,
      preserveConfirmed: true 
    })
    
    console.log('Joueur remis en composition:', playerName)
  } catch (error) {
    console.error('Erreur lors du retour en composition:', error)
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
  return checkAvailableForRole(playerName, role, eventId, availability.value)
}

function getAvailabilityData(player, eventId) {
  return getAvailabilityDataFromService(player, eventId, availability.value, {
    getPlayerSelectionRole,
    getPlayerDeclinedRole,
    getPlayerSelectionStatus,
    isSelectionConfirmedByOrganizer,
    canEditEvents: canEditEvents.value
  })
}

function isSelected(player, eventId) {
  const selection = casts.value[eventId]
  if (!selection) {
    return false
  }
  
  // Pour les admins, afficher les sélections même si la composition n'est pas validée
  // Pour les utilisateurs normaux, ne pas afficher les sélections si la composition n'est pas validée
  const canEditThisEvent = canEditEventMap[eventId] ?? canEditEvents.value
  if (!isSelectionConfirmedByOrganizer(eventId) && !canEditThisEvent) {
    return false
  }
  
  // Trouver l'ID du joueur avec une recherche plus robuste
  let playerObj = players.value.find(p => p.name === player)
  
  // Si pas trouvé, essayer une recherche insensible à la casse et aux espaces
  if (!playerObj) {
    playerObj = players.value.find(p => 
      p.name && player && 
      p.name.trim().toLowerCase() === player.trim().toLowerCase()
    )
  }
  
  if (!playerObj) {
    return false
  }
  
  // Vérifier si le joueur est dans un des rôles de la composition normale
  if (selection.roles) {
    for (const rolePlayers of Object.values(selection.roles)) {
      if (Array.isArray(rolePlayers) && rolePlayers.includes(playerObj.id)) {
        return true
      }
    }
  }
  
  // Vérifier aussi si le joueur est dans la section déclinés
  if (selection.declined) {
    for (const rolePlayers of Object.values(selection.declined)) {
      if (Array.isArray(rolePlayers) && rolePlayers.includes(playerObj.id)) {
        return true
      }
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

// Fonction pour remplir uniquement les slots vides d'une composition
async function fillEmptyCastSlots(eventId) {
  logger.debug('🔧 fillEmptyCastSlots appelé:', { eventId })
  
  const event = events.value.find(e => e.id === eventId)
  if (!event) {
    throw new Error('Événement non trouvé')
  }
  
  const currentSelection = casts.value[eventId]
  if (!currentSelection) {
    throw new Error('Aucune composition trouvée')
  }
  
  logger.debug('🔧 Événement trouvé:', { title: event.title, roles: event.roles })
  logger.debug('🔧 Composition actuelle:', currentSelection)
  
  // Récupérer les rôles requis
  const roles = event.roles || { player: event.playerCount || 6 }
  
  // Construire la nouvelle composition en gardant les joueurs existants et en complétant les vides
  const newSelections = {}
  
  // Récupérer TOUS les joueurs déjà compositionnés pour TOUS les rôles (depuis la composition actuelle)
  // Convertir les IDs en noms pour la compatibilité avec drawForRole
  const initialAlreadySelectedIds = Object.values(currentSelection.roles || {}).flat().filter(Boolean)
  let allAlreadySelected = initialAlreadySelectedIds.map(playerId => {
    const player = allSeasonPlayers.value.find(p => p.id === playerId)
    return player ? player.name : playerId // Fallback sur l'ID si nom non trouvé
  })
  
  for (const role of ROLE_PRIORITY_ORDER) {
    const requiredCount = roles[role] || 0
    
    if (requiredCount > 0) {
      // Récupérer les joueurs déjà compositionnés pour ce rôle
      const currentRoleSelection = currentSelection.roles?.[role] || []
      const declinedForRole = currentSelection.declined?.[role] || []
      
      // Compléter seulement les slots vraiment vides (null/undefined) et exclure les déclinés
      const filledSlots = currentRoleSelection.filter(player => 
        player != null && !declinedForRole.includes(player)
      )
      const remainingSlots = requiredCount - filledSlots.length
      
      logger.debug(`🔧 Rôle ${role}:`, { 
        requiredCount, 
        currentRoleSelection, 
        filledSlots, 
        remainingSlots 
      })
      
      if (remainingSlots > 0) {
        // Convertir les slots remplis en noms pour la compatibilité avec drawForRole
        const filledSlotsNames = filledSlots.map(playerId => {
          const player = allSeasonPlayers.value.find(p => p.id === playerId)
          return player ? player.name : playerId // Fallback sur l'ID si nom non trouvé
        })
        
        // Tirage pour les slots manquants uniquement
        const newPlayerNames = await drawForRole(role, remainingSlots, eventId, [...filledSlotsNames, ...allAlreadySelected])
        
        logger.debug(`🔧 Tirage pour ${role}:`, { 
          newPlayerNames, 
          filledSlotsNames, 
          allAlreadySelected 
        })
        
        // Convertir les noms en IDs pour la sauvegarde
        const newPlayerIds = newPlayerNames.map(playerName => {
          const player = allSeasonPlayers.value.find(p => p.name === playerName)
          return player ? player.id : playerName // Fallback sur le nom si ID non trouvé
        })
        
        logger.debug(`🔧 IDs convertis pour ${role}:`, { newPlayerIds })
        
        newSelections[role] = [...filledSlots, ...newPlayerIds]
        
        // Mettre à jour la liste d'exclusion avec les joueurs nouvellement tirés
        allAlreadySelected = [...allAlreadySelected, ...newPlayerNames]
        logger.debug(`🔧 Liste d'exclusion mise à jour pour les rôles suivants:`, allAlreadySelected)
      } else {
        // Rôle déjà complet
        newSelections[role] = [...currentRoleSelection]
      }
    }
  }
  
  // Calculer le nombre total de joueurs pour les logs
  const allPlayers = Object.values(newSelections).flat().filter(Boolean)
  
  logger.debug('🔧 Nouvelle composition à sauvegarder:', newSelections)
  
  // Sauvegarder en base avec recalcul du statut et préserver les joueurs déclinés
  await saveCast(eventId, newSelections, seasonId.value, { 
    preserveConfirmed: true,
    declined: currentSelection.declined || {} // Préserver la section déclinés
  })
  
  logger.debug('🔧 Composition sauvegardée avec succès')
  
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
      const addedPlayer = allSeasonPlayers.value.find(p => p.id === addedPlayerId)
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
// Fonction helper pour calculer les chances d'un rôle avec les candidats filtrés
function calculateRoleChancesForFill(role, candidates, eventId) {
  const event = events.value.find(e => e.id === eventId)
  if (!event) {
    logger.warn(`⚠️ Événement non trouvé pour le calcul des chances: ${eventId}`)
    return []
  }
  
  const requiredCount = event?.roles?.[role] || 1
  
  // Utiliser le service officiel pour le calcul des chances
  const roleData = { role, requiredCount, eventId, eventType: event.templateType }
  const roleChances = calculateRoleChances(roleData, candidates, countSelections, isAvailableForRole)
  
  return roleChances.candidates || []
}

// Fonction helper pour draw des joueurs pour un rôle spécifique
async function drawForRole(role, count, eventId, excludedPlayers = []) {
  logger.debug(`🎭 drawForRole appelé:`, { role, count, eventId, alreadySelected: excludedPlayers })
  
  // Exclure les joueurs qui ont décliné cette composition
  const declinedPlayers = getDeclinedPlayers(eventId)
  
  // Filtrer les candidats disponibles pour ce rôle
  const candidates = allSeasonPlayers.value.filter(p => {
    // Vérifier la disponibilité pour ce rôle spécifique
    const isAvailableForThisRole = isAvailableForRole(p.name, role, eventId)
    const notDeclined = !declinedPlayers.includes(p.name)
    const notExcluded = !excludedPlayers.includes(p.name)
    // Exclure aussi les joueurs marqués comme indisponibles pour cet événement
    const isNotUnavailable = isAvailable(p.name, eventId) !== false
    
    return isAvailableForThisRole && notDeclined && notExcluded && isNotUnavailable
  })
  
  if (candidates.length === 0) {
    logger.warn(`⚠️ Aucun candidat disponible pour le rôle ${role}`)
    return []
  }
  
  // Utiliser le service officiel pour calculer les poids des candidats
  const weightedCandidates = calculateRoleChancesForFill(role, candidates, eventId)
  
  logger.debug(`🎭 Candidats avec poids calculés par chancesService:`, weightedCandidates)
  
  // Utiliser le service pour le tirage avec logs détaillés
  const draw = []
  const pool = [...weightedCandidates]
  
  while (draw.length < count && pool.length > 0) {
    const selectedCandidate = performWeightedDraw(pool, role, { logDetails: true })
    
    if (selectedCandidate) {
      draw.push(selectedCandidate.name)
      // Retirer le candidat sélectionné du pool
      const index = pool.findIndex(c => c.name === selectedCandidate.name)
      if (index >= 0) {
        pool.splice(index, 1)
      }
    } else {
      break
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

  const wasReselection = getSelectionPlayers(eventId).length > 0
  const oldSelection = wasReselection ? [...getSelectionPlayers(eventId)] : []

  logger.debug('🎲 Appel de drawMultiRoles...')
  await drawMultiRoles(eventId)

  const isCompositionTabOpen = showEventDetailsModal.value && selectedEvent.value?.id === eventId && eventDetailsActiveTab.value === 'composition'

  if (isCompositionTabOpen && inlineSelectionModalRef.value?.showSuccess) {
    await nextTick()
    const newSelection = getSelectionPlayers(eventId)
    const keptPlayers = oldSelection.filter(player => newSelection.includes(player))
    const isPartialUpdate = keptPlayers.length > 0 && keptPlayers.length < oldSelection.length
    inlineSelectionModalRef.value.showSuccess(wasReselection, isPartialUpdate)
  } else {
    showSuccessMessage.value = true
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

function formatDateShort(dateValue) {
  if (!dateValue) return ''
  const date = typeof dateValue === 'string'
    ? new Date(dateValue)
    : dateValue.toDate?.() || dateValue
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).toUpperCase()
}

function formatDateForCalendar(dateValue) {
  if (!dateValue) return ''
  const date = typeof dateValue === 'string'
    ? new Date(dateValue)
    : dateValue.toDate?.() || dateValue
  
  // Format ISO pour Google Calendar: YYYYMMDDTHHMMSSZ
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

// Variable pour stocker la clé API en cache
let cachedApiKey = null

// Ref réactive pour stocker l'URL de la carte
const mapEmbedUrl = ref('')
const mobileMapEmbedUrl = ref('')

async function loadGoogleMapsEmbedUrl(location) {
  if (!location) {
    mapEmbedUrl.value = ''
    mobileMapEmbedUrl.value = ''
    return
  }
  
  // En développement, utiliser la variable d'environnement
  if (import.meta.env.DEV) {
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not found in environment variables')
      mapEmbedUrl.value = ''
      mobileMapEmbedUrl.value = ''
      return
    }
    
    const encodedLocation = encodeURIComponent(location)
    const baseUrl = `https://www.google.com/maps/embed/v1/search?key=${GOOGLE_MAPS_API_KEY}&q=${encodedLocation}&zoom=15`
    
    // URL pour desktop (plus grande)
    mapEmbedUrl.value = baseUrl
    // URL pour mobile (optimisée pour plus petite taille)
    mobileMapEmbedUrl.value = `${baseUrl}&maptype=roadmap`
    
    console.log('🗺️ DEBUG: Map URLs loaded:', { 
      desktop: mapEmbedUrl.value, 
      mobile: mobileMapEmbedUrl.value 
    })
    return
  }
  
  // En production, utiliser Firebase Functions
  try {
    if (!cachedApiKey) {
      const { getFunctions, httpsCallable } = await import('firebase/functions')
      const functions = getFunctions()
      const getApiKey = httpsCallable(functions, 'getGoogleMapsApiKey')
      
      const result = await getApiKey()
      if (result.data.success) {
        cachedApiKey = result.data.apiKey
      } else {
        console.error('Failed to get Google Maps API key from Firebase')
        mapEmbedUrl.value = ''
        mobileMapEmbedUrl.value = ''
        return
      }
    }
    
    const encodedLocation = encodeURIComponent(location)
    const baseUrl = `https://www.google.com/maps/embed/v1/search?key=${cachedApiKey}&q=${encodedLocation}&zoom=15`
    
    // URL pour desktop (plus grande)
    mapEmbedUrl.value = baseUrl
    // URL pour mobile (optimisée pour plus petite taille)
    mobileMapEmbedUrl.value = `${baseUrl}&maptype=roadmap`
    
    console.log('🗺️ DEBUG: Map URLs loaded (prod):', { 
      desktop: mapEmbedUrl.value, 
      mobile: mobileMapEmbedUrl.value 
    })
  } catch (error) {
    console.error('Error getting Google Maps API key:', error)
    mapEmbedUrl.value = ''
    mobileMapEmbedUrl.value = ''
  }
}

// Fonction synchrone pour compatibilité (retourne l'URL mise en cache)
function getGoogleMapsEmbedUrl(location) {
  return mapEmbedUrl.value
}

function countSelections(playerName, role = 'player', excludeEventId = null, currentEventType = null) {
  // Trouver l'ID du joueur à partir de son nom
  const player = allSeasonPlayers.value.find(p => p.name === playerName)
  if (!player) {
    return 0;
  }
  
  const selectedEvents = Object.keys(casts.value).filter(eventId => {
    // Exclure l'événement spécifié si fourni
    if (excludeEventId && eventId === excludeEventId) {
      return false
    }
    // Vérifier que l'événement existe encore
    const event = events.value.find(e => e.id === eventId)
    if (!event) {
      return false
    }
    
    // Règle 1: L'événement ne doit pas être archivé
    if (event.archived === true) {
      return false
    }
    
    // Règle 2: La sélection doit avoir été verrouillée (confirmée par l'organisateur)
    // Vérifier le statut de confirmation dans la collection casts
    const cast = casts.value[eventId]
    if (!cast || !cast.confirmed) {
      return false
    }
    
    // Règle 3: Le joueur ne doit pas avoir décliné
    const declinedPlayers = getDeclinedPlayers(eventId)
    if (declinedPlayers.includes(playerName)) {
      return false
    }
    
    // Règle 4: Filtrage par type d'événement pour pools séparés
    // Si l'événement en cours est un déplacement, compter uniquement les déplacements
    // Sinon, exclure les déplacements du comptage
    if (currentEventType) {
      const eventType = event.templateType || 'custom'
      if (currentEventType === 'deplacement') {
        // Pour les déplacements: ne compter que les déplacements
        if (eventType !== 'deplacement') return false
      } else {
        // Pour les autres spectacles: exclure les déplacements
        if (eventType === 'deplacement') return false
      }
    }
    
    // Nouvelle structure multi-rôles
    if (cast.roles && cast.roles[role]) {
      return cast.roles[role].includes(player.id)
    }
    
    // Ancienne structure (tous considérés comme "player")
    if (role === 'player' && Array.isArray(cast)) {
      return cast.includes(player.id)
    }
    
    return false
  })
  
  return selectedEvents.length;
}

// Nouvelle fonction pour compter les sélections par rôle spécifique
function countSelectionsForRole(playerName, role) {
  return Object.keys(casts.value).filter(eventId => {
    const cast = casts.value[eventId]
    if (!cast) return false
    
    // Vérifier que l'événement existe encore
    const event = events.value.find(e => e.id === eventId)
    if (!event) {
      return false
    }
    
    // Règle 1: L'événement ne doit pas être archivé
    if (event.archived === true) {
      return false
    }
    
    // Règle 2: La sélection doit avoir été verrouillée (confirmée par l'organisateur)
    // Vérifier le statut de confirmation dans la collection casts
    if (!cast.confirmed) {
      return false
    }
    
    // Règle 3: Le joueur ne doit pas avoir décliné
    const declinedPlayers = getDeclinedPlayers(eventId)
    if (declinedPlayers.includes(playerName)) {
      return false
    }
    
    // Vérifier que le joueur était sélectionné pour ce rôle spécifique
    // Nouvelle structure multi-rôles
    if (cast.roles && cast.roles[role]) {
      return cast.roles[role].includes(playerName)
    }
    
    // Ancienne structure (tous considérés comme "player")
    if (role === 'player' && Array.isArray(cast)) {
      return cast.includes(playerName)
    }
    
    return false
  }).length
}

// Fonction pour compter les participations finales d'un joueur (sélections confirmées non déclinées)
function countFinalParticipations(playerName) {
  // Trouver l'ID du joueur à partir de son nom
  const player = allSeasonPlayers.value.find(p => p.name === playerName)
  if (!player) {
    return 0;
  }
  
  const selectedEvents = Object.keys(casts.value).filter(eventId => {
    // Vérifier que l'événement existe encore
    const event = events.value.find(e => e.id === eventId)
    if (!event) {
      return false
    }
    
    // Règle 1: L'événement ne doit pas être archivé
    if (event.archived === true) {
      return false
    }
    
    // Règle 2: La sélection doit avoir été verrouillée (confirmée par l'organisateur)
    const cast = casts.value[eventId]
    if (!cast || !cast.confirmed) {
      return false
    }
    
    // Règle 3: Le joueur ne doit pas avoir décliné
    const declinedPlayers = getDeclinedPlayers(eventId)
    if (declinedPlayers.includes(playerName)) {
      return false
    }
    
    // Vérifier dans tous les rôles (nouvelle structure multi-rôles)
    if (cast.roles && typeof cast.roles === 'object') {
      return Object.values(cast.roles).some(rolePlayers => 
        Array.isArray(rolePlayers) && rolePlayers.includes(player.id)
      )
    }
    
    // Ancienne structure (tous considérés comme "player")
    if (Array.isArray(cast)) {
      return cast.includes(player.id)
    }
    
    return false
  })
  
  return selectedEvents.length;
}

// Fonction pour compter TOUTES les sélections initiales d'un joueur (participations + désistements)
function countAllInitialSelections(playerName) {
  // Trouver l'ID du joueur à partir de son nom
  const player = allSeasonPlayers.value.find(p => p.name === playerName)
  if (!player) {
    return 0;
  }
  
  const selectedEvents = Object.keys(casts.value).filter(eventId => {
    // Vérifier que l'événement existe encore
    const event = events.value.find(e => e.id === eventId)
    if (!event) {
      return false
    }
    
    // Règle 1: L'événement ne doit pas être archivé
    if (event.archived === true) {
      return false
    }
    
    // Règle 2: La sélection doit avoir été verrouillée (confirmée par l'organisateur)
    const cast = casts.value[eventId]
    if (!cast || !cast.confirmed) {
      return false
    }
    
    // Vérifier si le joueur était initialement sélectionné (peu importe s'il a décliné après)
    let wasInitiallySelected = false
    
    // Vérifier dans tous les rôles (nouvelle structure multi-rôles)
    if (cast.roles && typeof cast.roles === 'object') {
      wasInitiallySelected = Object.values(cast.roles).some(rolePlayers => 
        Array.isArray(rolePlayers) && rolePlayers.includes(player.id)
      )
    }
    
    // Ancienne structure (tous considérés comme "player")
    if (!wasInitiallySelected && Array.isArray(cast)) {
      wasInitiallySelected = cast.includes(player.id)
    }
    
    // Vérifier aussi dans les déclinés (car ils étaient initialement sélectionnés)
    if (!wasInitiallySelected && cast.declined && typeof cast.declined === 'object') {
      wasInitiallySelected = Object.values(cast.declined).some(rolePlayers => 
        Array.isArray(rolePlayers) && rolePlayers.includes(player.id)
      )
    }
    
    return wasInitiallySelected
  })
  
  return selectedEvents.length;
}
function countAvailability(playerName) {
  const eventsMap = availability.value[playerName] || {}
  
  // Ne compter que les "disponible" pour les événements non archivés
  let count = 0;
  Object.keys(eventsMap).forEach(eventId => {
    // Vérifier que l'événement existe et n'est pas archivé
    const event = events.value.find(e => e.id === eventId);
    if (!event || event.archived === true) return;
    
    const response = eventsMap[eventId];
    if (typeof response === 'boolean') {
      if (response === true) {
        count++;
      }
    } else if (typeof response === 'object' && response !== null) {
      if (response.available === true) {
        count++;
      }
    }
  });
  
  return count;
}

// Fonction pour compter les disponibilités effectives (disponibilités + sélections non déclinées)
function countEffectiveAvailability(playerName) {
  const eventsMap = availability.value[playerName] || {}
  
  // Trouver l'ID du joueur à partir de son nom
  const player = allSeasonPlayers.value.find(p => p.name === playerName)
  if (!player) return 0;
  
  let count = 0;
  
  // Parcourir tous les événements non archivés
  events.value.forEach(event => {
    if (!event || event.archived === true) return;
    
    // Vérifier la disponibilité dans la base de données
    const playerAvailability = eventsMap[event.id];
    let hasAvailabilityResponse = false;
    
    if (playerAvailability) {
      if (typeof playerAvailability === 'boolean') {
        hasAvailabilityResponse = playerAvailability === true;
      } else if (typeof playerAvailability === 'object' && playerAvailability !== null) {
        hasAvailabilityResponse = playerAvailability.available === true;
      }
    }
    
    // Vérifier si le joueur est sélectionné et non décliné
    let isSelectedNotDeclined = false;
    const cast = casts.value[event.id];
    if (cast && cast.confirmed) {
      // Vérifier dans tous les rôles (nouvelle structure multi-rôles)
      if (cast.roles && typeof cast.roles === 'object') {
        isSelectedNotDeclined = Object.values(cast.roles).some(rolePlayers => 
          Array.isArray(rolePlayers) && rolePlayers.includes(player.id)
        );
      }
      // Ancienne structure (tous considérés comme "player")
      if (!isSelectedNotDeclined && Array.isArray(cast)) {
        isSelectedNotDeclined = cast.includes(player.id);
      }
    }
    
    // Compter si le joueur était disponible OU sélectionné (mais pas décliné)
    if (hasAvailabilityResponse || isSelectedNotDeclined) {
      count++;
    }
  });
  
  return count;
}

// Fonction pour compter toutes les réponses de disponibilité (disponible + indisponible) pour les événements non archivés uniquement
function countAllAvailabilityResponses(playerName) {
  const eventsMap = availability.value[playerName] || {}
  
  // Ne compter que les réponses pour les événements non archivés
  let count = 0;
  Object.keys(eventsMap).forEach(eventId => {
    // Vérifier que l'événement existe et n'est pas archivé
    const event = events.value.find(e => e.id === eventId);
    if (!event || event.archived === true) return;
    
    const response = eventsMap[eventId];
    if (typeof response === 'boolean') {
      if (response !== undefined && response !== null) {
        count++;
      }
    } else if (typeof response === 'object' && response !== null) {
      if (response.available !== undefined && response.available !== null) {
        count++;
      }
    }
  });
  
  return count;
}

function countAvailablePlayers(eventId) {
  if (!eventId) return 0;
  
  const event = events.value.find(e => e.id === eventId);
  if (!event) return 0;
  
  return countAvailablePlayersFromService(event, allSeasonPlayers.value, availability.value);
}

function countPlayersWithResponse(eventId) {
  if (!eventId || !availability.value) return 0;
  
  let count = 0;
  for (const [playerName, playerAvailability] of Object.entries(availability.value)) {
    if (playerAvailability[eventId]) {
      const eventAvailability = playerAvailability[eventId];
      // Compter si le joueur a donné une réponse (disponible ou indisponible)
      const hasResponse = typeof eventAvailability === 'object' 
        ? eventAvailability.available !== undefined && eventAvailability.available !== null
        : eventAvailability !== undefined && eventAvailability !== null;
      
      if (hasResponse) {
        count++;
      }
    }
  }
  
  return count;
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

function ratioSelection(playerName) {
  const totalEvents = events.value.length
  const timesAvailable = countAvailability(playerName)
  const participations = countSelections(playerName)
  
  // Taux de disponibilité : (fois dispo / total événements) × 100
  const availabilityRate = totalEvents === 0 ? 0 : Math.round((timesAvailable / totalEvents) * 100)
  
  // Taux de sélection : (fois retenu / fois dispo) × 100
  const selectionRate = timesAvailable === 0 ? 0 : Math.round((participations / timesAvailable) * 100)
  
  return { availabilityRate, participations, selectionRate }
}

function updateStatsForPlayer(playerName) {
  const totalEvents = events.value.length
  const timesAvailable = countAvailability(playerName)
  const participations = countSelections(playerName)
  
  // Taux de disponibilité : (fois dispo / total événements) × 100
  const availabilityRate = totalEvents === 0 ? 0 : Math.round((timesAvailable / totalEvents) * 100)
  
  // Taux de sélection : (fois retenu / fois dispo) × 100
  const selectionRate = timesAvailable === 0 ? 0 : Math.round((participations / timesAvailable) * 100)
  
  stats.value[playerName] = {
    availability: availabilityRate,
    selection: participations,
    ratio: selectionRate
  }
}

function updateAllStats() {
  players.value.forEach(player => updateStatsForPlayer(player.name))
}

function chanceToBeSelected(playerName, eventId, count = null) {
  const availablePlayers = players.value.filter(p => isAvailableForPlayerRole(p.name, eventId))

  if (!availablePlayers.find(p => p.name === playerName)) return 0

  // Si count n'est pas fourni, utiliser le nombre de joueurs de l'événement
  const event = events.value.find(e => e.id === eventId)
  if (count === null) {
    count = event?.playerCount || 6
  }

  // Calcul du poids basé sur le nombre de compositions déjà faites
  const weights = availablePlayers.map(p => {
    const pastSelections = countSelections(p.name, 'player', null, event?.templateType)
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
      const pastSelections = countSelections(p.name, 'player', null, event.templateType)
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
  closePlayerDetailsModal();
  
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
    fillCast: 'Remplissage de composition - Code PIN requis'
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
          successMessage.value = newArchivedState ? 'Événement désactivé avec succès !' : 'Événement activé avec succès !'
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
              await sendDecastEmailsForEvent({
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
          // Feedback via l’onglet Composition si ouvert pour cet événement
          try {
            if (showEventDetailsModal.value && selectedEvent.value?.id === eventId && eventDetailsActiveTab.value === 'composition') {
              inlineSelectionModalRef.value?.showSuccess(true, true)
            }
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
      case 'fillCast':
        // Remplir les slots vides d'une composition verrouillée
        {
          const { eventId } = data
          try {
            await fillEmptyCastSlots(eventId)
            
            showSuccessMessage.value = true
            successMessage.value = 'Composition remplie !'
            setTimeout(() => {
              showSuccessMessage.value = false
            }, 3000)
          } catch (error) {
            console.error('Erreur lors du remplissage de la composition:', error)
            showSuccessMessage.value = true
            successMessage.value = 'Erreur lors du remplissage de la composition'
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
  if (route.params.eventId) {
    router.push(`/season/${props.slug}`)
  } else {
    router.push('/seasons')
  }
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

// Navigate to canonical event URL; watch(route.params.eventId) will call syncStateFromEventRoute
function showEventDetails(event, showAvailability = false, updateUrl = true, fromAllPlayersFilter = false, forceTab = null, showConfirm = false) {
  if (!event) return
  const defaultTab = getDefaultTabForEvent(event)
  const normalizedForceTab = forceTab == null ? null : String(forceTab).toLowerCase() === 'compo' ? 'composition' : String(forceTab).toLowerCase()
  let tabForUrl = 'info'
  if (fromAllPlayersFilter) tabForUrl = 'team'
  else if (normalizedForceTab === 'info') tabForUrl = 'info'
  else if (normalizedForceTab === 'team') tabForUrl = 'team'
  else if (normalizedForceTab === 'composition') tabForUrl = 'compo'
  else if (showAvailability && currentUser.value) tabForUrl = 'team'
  else tabForUrl = defaultTab === 'composition' ? 'compo' : defaultTab === 'team' ? 'team' : 'info'
  const query = { tab: tabForUrl }
  if (showAvailability) query.showAvailability = 'true'
  if (showConfirm) query.showConfirm = 'true'
  if (updateUrl) {
    router.push({ path: `/season/${props.slug}/event/${event.id}`, query })
  } else {
    router.replace({ path: `/season/${props.slug}/event/${event.id}`, query })
  }
}

function closeEventDetails() {
  showEventDetailsModal.value = false;
  selectedEvent.value = null;
  editingDescription.value = '';
  
  // Fermer les menus d'agenda
  closeCalendarMenuDetails();
  
  // Fermer le dropdown des actions d'événement
  showEventActionsDropdown.value = false;
  
  // Fermer le dropdown Google Maps
  showGoogleMapsDropdown.value = false;
  
  // Fermer le sélecteur de joueur dans l'équipe
  showAvailabilityPlayerSelector.value = false;
  
  // Réinitialiser l'état du partage de lien
  showShareLinkCopied.value = false;
  // Cache fix: removed eventMoreActionsStyle references
}

// Changer l'onglet des détails événement et synchroniser l'URL (partage / bookmark)
function setEventDetailsTab(tab) {
  if (!selectedEvent.value) return
  showEventActionsDropdown.value = false
  const t = tab === 'composition' ? 'composition' : tab === 'team' ? 'team' : 'info'
  eventDetailsActiveTab.value = t
  const tabForUrl = t === 'composition' ? 'compo' : t
  if (route.params.eventId) {
    // Full-screen event: update query tab only (canonical URL)
    const query = { ...route.query, tab: tabForUrl }
    router.replace({ path: route.path, query })
  } else {
    const params = new URLSearchParams(router.currentRoute.value.query)
    params.set('event', selectedEvent.value.id)
    params.set('modal', 'event_details')
    params.set('tab', tabForUrl)
    router.replace({ path: router.currentRoute.value.path, query: Object.fromEntries(params) })
  }
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
    
    await addToCalendar(type, targetEvent, seasonName.value, castData, players.value, seasonSlug)
    
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
  
  // Nettoyer les variables de disponibilité
  showAvailabilityInEventDetails.value = false
  currentUserPlayer.value = null
  
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
  // Empêcher toute modification sur un événement inactif
  const evt = events.value.find(e => e.id === eventId)
  if (evt?.archived) {
    showSuccessMessage.value = true
    successMessage.value = 'Événement inactif — activez pour modifier'
    setTimeout(() => { showSuccessMessage.value = false }, 3000)
    return
  }

  // Vérifier si le joueur est protégé (utiliser la même logique que la grille)
  const isProtected = isPlayerProtectedInGrid(player.id);
  
  // Si le joueur est protégé, vérifier les permissions AVANT d'ouvrir la modale
  if (isProtected) {
    const canModify = await canModifyPlayerAvailability(player.id, evt.id)
    if (!canModify) {
      // Afficher un message d'erreur si l'utilisateur n'a pas les permissions
      showErrorMessage.value = true
      errorMessage.value = `Vous n'avez pas les permissions de modifier les disponibilités de ${player.name}.`
      setTimeout(() => {
        showErrorMessage.value = false
      }, 5000)
      return
    }
  }
  
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
    await openAvailabilityModalForPlayer(player, evt);
    return;
  } else {
    // Joueur non protégé, ouvrir directement la modale
    await openAvailabilityModalForPlayer(player, evt);
  }
}

// Fonction pour vérifier si un joueur est compositionné pour un événement spécifique
function isPlayerSelected(playerName, eventId) {
  const selection = casts.value[eventId]
  if (!selection) {
    return false
  }
  
  // Trouver l'ID du joueur dans tous les joueurs de la saison
  const player = allSeasonPlayers.value.find(p => p.name === playerName)
  if (!player) {
    return false
  }
  
  // Vérifier si le joueur est dans un des rôles de la composition finale
  if (selection.roles) {
    for (const [role, rolePlayers] of Object.entries(selection.roles)) {
      if (Array.isArray(rolePlayers) && rolePlayers.includes(player.id)) {
        return true
      }
    }
  }
  
  // Vérifier aussi si le joueur a un statut de sélection (même s'il a décliné)
  if (selection.playerStatuses && selection.playerStatuses[player.id]) {
    return true
  }
  
  // Vérifier l'ancienne structure avec des noms comme clés
  if (selection.playerStatuses && selection.playerStatuses[playerName]) {
    return true
  }
  
  return false
}

// Fonction pour vérifier si un joueur est sélectionné pour un rôle spécifique
function isPlayerSelectedForRole(playerName, role, eventId) {
  console.log('🔍 DEBUG isPlayerSelectedForRole:', {
    playerName,
    role,
    eventId,
    hasCasts: !!casts.value,
    hasEventCast: !!casts.value[eventId],
    castsKeys: Object.keys(casts.value || {})
  })
  
  const selection = casts.value[eventId]
  if (!selection || !selection.roles) {
    console.log('❌ DEBUG isPlayerSelectedForRole: pas de sélection ou de rôles')
    return false
  }
  
  // Trouver l'ID du joueur dans tous les joueurs de la saison
  const player = allSeasonPlayers.value.find(p => p.name === playerName)
  if (!player) {
    console.log('❌ DEBUG isPlayerSelectedForRole: joueur non trouvé')
    return false
  }
  
  // Vérifier si le joueur est dans le rôle spécifique
  const rolePlayers = selection.roles[role]
  console.log('🔍 DEBUG isPlayerSelectedForRole: vérification rôle:', {
    role,
    rolePlayers,
    playerId: player.id,
    isInRole: Array.isArray(rolePlayers) && rolePlayers.includes(player.id)
  })
  
  if (Array.isArray(rolePlayers) && rolePlayers.includes(player.id)) {
    console.log('✅ DEBUG isPlayerSelectedForRole: joueur sélectionné pour le rôle')
    return true
  }
  
  console.log('❌ DEBUG isPlayerSelectedForRole: joueur non sélectionné pour le rôle')
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
  
  // Demander le PIN code avant de désactiver/activer
  await requirePin({
    type: 'toggleArchive',
    data: { 
      eventId: selectedEvent.value.id, 
      archived: !selectedEvent.value.archived 
    }
  })
}

// Fonctions pour le modal joueur
async function showPlayerDetails(player) {
  selectedPlayerForDetails.value = player;
  
  // Recharger les données pour avoir les stats à jour
  try {
    const [newAvailability, newSelections] = await Promise.all([
      loadAvailabilityForAllPlayers(),
      loadCasts(seasonId.value)
    ]);
    availability.value = newAvailability;
    casts.value = newSelections;
  } catch (error) {
    console.warn('Impossible de recharger les données pour les stats:', error);
  }

  // 1. Mettre à jour l'URL pour refléter l'état de navigation
  const newUrl = `/season/${props.slug}?player=${player.id}&modal=player_details`
  await router.push(newUrl)
  
  // 2. Ouvrir la modale après la navigation
  showPlayerDetailsModal.value = true;

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
  console.log('🚪 closePlayerModal called')
  showPlayerModal.value = false;
  
  // Ne pas remettre selectedPlayerId à null si on a un joueur sélectionné
  // (que ce soit pour la vue timeline ou les autres vues)
  if (!selectedPlayerId.value) {
    console.log('🚪 No player selected, keeping selectedPlayerId as null')
  } else {
    console.log('🚪 Keeping selectedPlayerId for selected player:', selectedPlayerId.value)
  }
}

// Fonctions pour le modal d'événements
function toggleEventModal() {
  console.log('🎭 toggleEventModal called')
  try {
    showEventModal.value = !showEventModal.value
  } catch (error) {
    console.error('❌ Erreur lors de l\'ouverture/fermeture de la modale:', error)
  }
}

function closeEventModal() {
  console.log('🚪 closeEventModal called')
  try {
    showEventModal.value = false
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture de la modale:', error)
  }
}
function handleEventSelected(event) {
  console.log('🎭 handleEventSelected:', event)
  
  try {
    // Fermer la modale d'abord
    closeEventModal()
    
    // Changer l'ID de l'événement sélectionné directement
    // sans délai pour éviter les conflits de réactivité
    selectedEventId.value = event.id
  } catch (error) {
    console.error('❌ Erreur lors de la sélection d\'événement:', error)
  }
}

function handleAllEventsSelected(filters = {}) {
  console.log('🎭 handleAllEventsSelected', filters)
  console.log('🎭 Filtres reçus:', {
    showPastEvents: filters.showPastEvents,
    showInactiveEvents: filters.showInactiveEvents,
    condition: filters.showPastEvents || filters.showInactiveEvents
  })
  
  // Stocker les filtres pour les appliquer dans displayedEvents
  eventFilters.value = {
    showPastEvents: filters.showPastEvents || false,
    showInactiveEvents: filters.showInactiveEvents || false
  }
  
  // Si les filtres permettent d'afficher les événements passés/inactifs, charger tous les événements
  if (filters.showPastEvents || filters.showInactiveEvents) {
    // Charger TOUS les événements (y compris passés et archivés)
    if (seasonId.value) {
      console.log('🔄 Chargement de tous les événements (y compris passés et inactifs)')
      firestoreService.getDocuments('seasons', seasonId.value, 'events').then(allEvents => {
        events.value = allEvents
        console.log(`📊 Chargé ${allEvents.length} événements (tous, y compris passés et inactifs)`)
      }).catch(error => {
        console.error('❌ Erreur lors du chargement de tous les événements:', error)
      })
    }
  }
  
  // Activer le mode "tous les événements"
  isAllEventsView.value = true
  selectedEventId.value = null
  closeEventModal()
}

function closePlayerDetailsModal() {
  showPlayerDetailsModal.value = false;
  selectedPlayerForDetails.value = null;
  
  // Retourner à l'URL de base de la saison
  const baseUrl = `/season/${props.slug}`
  if (route.path !== baseUrl) {
    router.push(baseUrl)
  }
}

async function handlePlayerUpdate({ playerId, newName, newGender }) {
  try {
    await updatePlayer(playerId, newName, seasonId.value, newGender);
    
    // Recharger les données
    await Promise.all([
      loadPlayers(seasonId.value),
      loadAvailabilityForAllPlayers(),
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
      loadAvailabilityForAllPlayers(),
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

// Fonction pour calculer la répartition mensuelle des sélections et disponibilités d'un joueur
function getMonthlyActivityWithDetails(playerName) {
  // Trouver l'ID du joueur à partir de son nom
  const player = allSeasonPlayers.value.find(p => p.name === playerName)
  if (!player) {
    return Array(12).fill(null).map(() => []);
  }
  
  const monthlyData = Array(12).fill(null).map(() => []);
  
  // Parcourir tous les événements non archivés pour collecter l'activité par mois
  allEvents.value.forEach(event => {
    if (!event.date || event.archived === true) return
    
    const eventDate = event.date.toDate ? event.date.toDate() : new Date(event.date)
    const month = eventDate.getMonth() // 0-11
    
    // Vérifier la disponibilité du joueur
    const playerAvailability = availability.value[playerName]?.[event.id]
    let availabilityStatus = null
    
    if (playerAvailability) {
      if (typeof playerAvailability === 'boolean') {
        availabilityStatus = playerAvailability ? 'available' : 'unavailable'
      } else if (typeof playerAvailability === 'object' && playerAvailability.available !== undefined) {
        availabilityStatus = playerAvailability.available ? 'available' : 'unavailable'
      }
    }
    
    // Vérifier si le joueur est sélectionné et son statut de confirmation
    const cast = casts.value[event.id]
    let selectionStatus = null
    let role = null
    
    if (cast) {
      // D'abord vérifier s'il y a des déclins dans la nouvelle structure declined
      let hasDeclined = false
      if (cast.declined) {
        Object.entries(cast.declined).forEach(([roleKey, playerIds]) => {
          if (Array.isArray(playerIds) && playerIds.includes(player.id)) {
            hasDeclined = true
            selectionStatus = 'declined'
            role = roleKey
          }
        })
      }
      
      // Fallback sur l'ancienne structure playerStatuses
      if (!hasDeclined && cast.playerStatuses && cast.playerStatuses[player.id] === 'declined') {
        hasDeclined = true
        selectionStatus = 'declined'
        role = 'player' // Rôle par défaut pour les déclins
      }
      
      // Sinon vérifier dans la nouvelle structure multi-rôles
      if (!hasDeclined && cast.roles) {
        Object.entries(cast.roles).forEach(([roleKey, playerIds]) => {
          if (Array.isArray(playerIds) && playerIds.includes(player.id)) {
            role = roleKey
            // Vérifier le statut de confirmation
            const playerStatus = cast.playerStatuses?.[player.id]
            if (playerStatus === 'confirmed') {
              selectionStatus = 'confirmed'
            } else if (playerStatus === 'declined') {
              selectionStatus = 'declined'
            } else {
              selectionStatus = 'pending'
            }
          }
        })
      }
      // Fallback sur l'ancienne structure
      else if (Array.isArray(cast) && cast.includes(player.id)) {
        role = 'player'
        const playerStatus = cast.playerStatuses?.[player.id]
        if (playerStatus === 'confirmed') {
          selectionStatus = 'confirmed'
        } else if (playerStatus === 'declined') {
          selectionStatus = 'declined'
        } else {
          selectionStatus = 'pending'
        }
      }
    }
    
    // Priorité aux sélections : si le joueur est sélectionné, on affiche la sélection
    if (selectionStatus) {
      monthlyData[month].push({
        type: 'selection',
        status: selectionStatus,
        role: role,
        eventTitle: event.title,
        eventDate: eventDate,
        eventId: event.id,
        eventType: event.templateType || 'custom'
      })
    } else if (availabilityStatus) {
      // Sinon, on affiche la disponibilité si renseignée
      monthlyData[month].push({
        type: 'availability',
        status: availabilityStatus,
        role: null, // Pas de rôle pour les disponibilités
        eventTitle: event.title,
        eventDate: eventDate,
        eventId: event.id,
        eventType: event.templateType || 'custom'
      })
    } else {
      // Si aucune réponse de disponibilité, afficher comme "non renseigné"
      monthlyData[month].push({
        type: 'availability',
        status: 'unanswered',
        role: null,
        eventTitle: event.title,
        eventDate: eventDate,
        eventId: event.id,
        eventType: event.templateType || 'custom'
      })
    }
  })
  
  // Trier par date dans chaque mois
  monthlyData.forEach(monthActivity => {
    monthActivity.sort((a, b) => a.eventDate - b.eventDate)
  })
  
  // Debug: Afficher les données pour octobre (index 9)
  console.log('Debug getMonthlyActivityWithDetails pour', playerName)
  console.log('Octobre (index 9):', monthlyData[9])
  console.log('Toutes les données mensuelles:', monthlyData)
  
  return monthlyData;
}

// Fonction pour calculer les rôles favoris d'un joueur
function getFavoriteRoles(playerName) {
  // Trouver l'ID du joueur à partir de son nom
  const player = allSeasonPlayers.value.find(p => p.name === playerName)
  if (!player) {
    return [];
  }
  
  const roleCounts = {};
  
  // Parcourir tous les casts pour compter les rôles
  Object.keys(casts.value).forEach(eventId => {
    const cast = casts.value[eventId]
    if (!cast) return
    
    // Vérifier que l'événement existe encore
    const event = events.value.find(e => e.id === eventId)
    if (!event) return
    
    // Règle 1: L'événement ne doit pas être archivé
    if (event.archived === true) return
    
    // Règle 2: La sélection doit avoir été verrouillée (confirmée par l'organisateur)
    if (!cast.confirmed) return
    
    // Règle 3: Le joueur ne doit pas avoir décliné
    const declinedPlayers = getDeclinedPlayers(eventId)
    if (declinedPlayers.includes(playerName)) return
    
    // Compter les rôles dans la nouvelle structure multi-rôles
    if (cast.roles) {
      Object.entries(cast.roles).forEach(([role, playerIds]) => {
        if (Array.isArray(playerIds) && playerIds.includes(player.id)) {
          roleCounts[role] = (roleCounts[role] || 0) + 1
        }
      })
    }
    
    // Fallback sur l'ancienne structure (tous considérés comme "player")
    if (Array.isArray(cast) && cast.includes(player.id)) {
      roleCounts['player'] = (roleCounts['player'] || 0) + 1
    }
  })
  
  // Trier par fréquence et prendre les 2 premiers
  return Object.entries(roleCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([role, count]) => ({ role, count }))
}

// Fonction pour compter les désistements d'un joueur
function countDeclines(playerName) {
  // Trouver l'ID du joueur à partir de son nom
  const player = allSeasonPlayers.value.find(p => p.name === playerName)
  if (!player) {
    return 0;
  }
  
  let declineCount = 0;
  
  // Debug pour Rachid
  if (playerName === 'Rachid') {
    console.log('🔍 DEBUG RACHID - Recherche des désistements pour:', playerName, 'ID:', player.id)
  }
  
  // Parcourir tous les casts pour compter les désistements
  Object.keys(casts.value).forEach(eventId => {
    const cast = casts.value[eventId]
    if (!cast) return
    
    // Vérifier que l'événement existe encore
    const event = events.value.find(e => e.id === eventId)
    if (!event) return
    
    // Règle 1: L'événement ne doit pas être archivé
    if (event.archived === true) return
    
    // Règle 2: La sélection doit avoir été verrouillée (confirmée par l'organisateur)
    if (!cast.confirmed) return
    
    // Vérifier si le joueur a décliné (dans declined OU dans playerStatuses)
    let hasDeclined = false
    
    // Vérifier dans la nouvelle structure declined
    if (cast.declined) {
      Object.values(cast.declined).forEach(playerIds => {
        if (Array.isArray(playerIds) && playerIds.includes(player.id)) {
          hasDeclined = true
          if (playerName === 'Rachid') {
            console.log('🔍 DEBUG RACHID - Trouvé dans declined pour event:', eventId, 'rôle:', Object.keys(cast.declined).find(role => cast.declined[role].includes(player.id)))
          }
        }
      })
    }
    
    // Fallback sur l'ancienne structure playerStatuses
    if (!hasDeclined && cast.playerStatuses && cast.playerStatuses[player.id] === 'declined') {
      hasDeclined = true
      if (playerName === 'Rachid') {
        console.log('🔍 DEBUG RACHID - Trouvé dans playerStatuses pour event:', eventId)
      }
    }
    
    if (hasDeclined) {
      declineCount++
      if (playerName === 'Rachid') {
        console.log('🔍 DEBUG RACHID - Désistement compté pour event:', eventId, 'Total:', declineCount)
      }
    }
  })
  
  if (playerName === 'Rachid') {
    console.log('🔍 DEBUG RACHID - Total desistements:', declineCount)
  }
  
  return declineCount;
}

function getPlayerStats(player) {
  if (!player) return { availability: 0, selection: 0, ratio: 0, declines: 0, declineRate: 0, favoriteRoles: [], monthlySelections: Array(12).fill(0) };
  
  // Nombre total d'événements non archivés
  const totalNonArchivedEvents = events.value.filter(event => event.archived !== true).length;
  
  // Nombre de fois marqué "Dispo" (disponibilités effectives = dispo + sélections initiales)
  const timesAvailable = countEffectiveAvailability(player.name);
  
  // Nombre total de réponses de disponibilité (disponible + indisponible)
  const totalAvailabilityResponses = countAllAvailabilityResponses(player.name);
  
  // Participations finales (sélections confirmées non déclinées)
  const participations = countFinalParticipations(player.name);
  
  // Nombre total de sélections initiales (participations + désistements)
  const totalInitialSelections = countAllInitialSelections(player.name);
  
  // Nombre de désistements
  const declines = totalInitialSelections - participations;
  
  // Rôles favoris
  const favoriteRoles = getFavoriteRoles(player.name);
  
  // Répartition mensuelle avec détails (sélections + disponibilités)
  const monthlyActivityWithDetails = getMonthlyActivityWithDetails(player.name);
  
  // Taux de disponibilité : (fois dispo / total événements non archivés) × 100
  const availabilityRate = totalNonArchivedEvents === 0 ? 0 : Math.round((timesAvailable / totalNonArchivedEvents) * 100);
  
  // Taux de sélection : (sélections initiales / fois dispo) × 100
  const selectionRate = timesAvailable === 0 ? 0 : Math.round((totalInitialSelections / timesAvailable) * 100);
  
  // Taux de désistement : (désistements / sélections initiales) × 100
  const declineRate = totalInitialSelections === 0 ? 0 : Math.round((declines / totalInitialSelections) * 100);
  
  return { 
    availability: availabilityRate, 
    timesAvailable: timesAvailable,
    totalAvailabilityResponses: totalAvailabilityResponses,
    totalNonArchivedEvents: totalNonArchivedEvents,
    selection: participations, 
    totalInitialSelections: totalInitialSelections,
    ratio: selectionRate,
    declines: declines,
    declineRate: declineRate,
    favoriteRoles: favoriteRoles,
    monthlyActivityWithDetails: monthlyActivityWithDetails
  };
}

// Fonction helper pour calculer le nombre total requis d'un événement
function getTotalRequiredCount(event) {
  if (!event) return 6
  
  // Si l'événement a des rôles définis, calculer le total
  if (event.roles && typeof event.roles === 'object') {
    const total = Object.values(event.roles).reduce((sum, count) => sum + (count || 0), 0)
    
    
    return total
  }
  
  // Fallback pour les anciens événements
  return event.playerCount || 6
}
// Fonctions pour détecter l'état des événements
function getEventStatus(eventId) {
  // Protection contre les eventId null ou undefined
  if (!eventId) {
    return {
      type: 'ready',
      availableCount: 0,
      requiredCount: 0,
      isConfirmedByOrganizer: false,
      isConfirmedByAllPlayers: false
    }
  }
  
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
    const declinedPlayers = selectedPlayers.filter(playerName => 
      selection?.playerStatuses?.[playerName] === 'declined'
    )
    const hasDeclinedPlayers = declinedPlayers.length > 0
    
    // Vérifier s'il y a des slots vides : compter les joueurs non-déclinés
    const nonDeclinedPlayers = selectedPlayers.filter(playerName => 
      selection?.playerStatuses?.[playerName] !== 'declined'
    )
    const hasEmptySlots = nonDeclinedPlayers.length < requiredCount
    
    // Ne considérer hasDeclinedPlayers comme un problème que s'il y a des slots vides
    // Si tous les slots sont remplis, l'équipe n'est pas incomplète même avec des déclinés
    if (hasUnavailablePlayers || hasInsufficientPlayers || hasEmptySlots) {
      return {
        type: 'incomplete',
        hasUnavailablePlayers,
        hasInsufficientPlayers,
        hasDeclinedPlayers: hasDeclinedPlayers && hasEmptySlots, // Seulement si slots vides
        hasEmptySlots,
        unavailablePlayers: selectedPlayers.filter(playerName => !isAvailable(playerName, eventId)),
        declinedPlayers,
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
function openEventAnnounceModal(event, showAvailability = false) {
  if (event?.archived) {
    showSuccessMessage.value = true
    successMessage.value = 'Impossible d\'annoncer un événement inactif'
    setTimeout(() => { showSuccessMessage.value = false }, 3000)
    return
  }
  
  // Fermer le dialogue de confirmation avant d'ouvrir la modale d'annonce
  closeAnnouncePrompt()
  
  eventToAnnounce.value = event
  showAvailabilityInEventModal.value = showAvailability
  
  // Si showAvailability est true, récupérer le joueur de l'utilisateur connecté
  if (showAvailability) {
    currentUserPlayer.value = getCurrentUserPlayer()
  }
  
  showEventAnnounceModal.value = true
  // Mémoriser dans l'URL pour restauration après refresh
  try {
    const params = new URLSearchParams(window.location.search)
    params.set('modal', 'announce')
    params.set('event', event?.id || '')
    if (showAvailability) {
      params.set('showAvailability', 'true')
    }
    history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
  } catch {}
}

function closeEventAnnounceModal() {
  showEventAnnounceModal.value = false
  eventToAnnounce.value = null
  showAvailabilityInEventModal.value = false
  currentUserPlayer.value = null
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('modal') === 'announce') {
      params.delete('modal')
      params.delete('event')
      params.delete('showAvailability')
      history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    }
  } catch {}
}

function closeAnnouncePrompt() {
  showAnnouncePrompt.value = false
  announcePromptEvent.value = null
}

// Fonction pour récupérer le joueur de l'utilisateur connecté
function getCurrentUserPlayer() {
  const user = currentUser.value
  console.log('🔍 DEBUG getCurrentUserPlayer:', {
    user: user ? { email: user.email, uid: user.uid } : null,
    allSeasonPlayersCount: allSeasonPlayers.value.length,
    playersWithEmail: allSeasonPlayers.value.filter(p => p.email).length
  })
  
  if (!user?.email) {
    console.log('❌ DEBUG getCurrentUserPlayer: pas d\'email utilisateur')
    return null
  }
  
  // Chercher le joueur correspondant à l'email de l'utilisateur
  const foundPlayer = allSeasonPlayers.value.find(player => player.email === user.email)
  console.log('🔍 DEBUG getCurrentUserPlayer: joueur trouvé:', foundPlayer ? { id: foundPlayer.id, name: foundPlayer.name, email: foundPlayer.email } : null)
  
  return foundPlayer || null
}

// Fonction utilitaire pour les props standard de PlayerAvatar
function getPlayerAvatarProps(player) {
  return {
    'player-id': player.id,
    'season-id': seasonId.value,
    'player-name': player.name,
    size: 'sm',
    'player-gender': player.gender || 'non-specified',
    'show-status-icons': true
  }
}

// Fonction pour récupérer les rôles d'un événement
function getEventRoles(eventId) {
  if (!eventId) return {}
  const event = events.value.find(e => e.id === eventId)
  return event?.roles || {}
}

// Fonction pour gérer les changements de disponibilité depuis la modale d'événement
function handleAvailabilityChangedFromEventModal(data) {
  // Déléguer à la fonction existante
  handleAvailabilityChanged(data)
}


// Fonction pour ouvrir la modale de disponibilité depuis les détails d'événement
async function openAvailabilityModalFromEventDetails() {
  console.log('🎭 DEBUG openAvailabilityModalFromEventDetails appelée:', {
    currentUserPlayer: currentUserPlayer.value ? { id: currentUserPlayer.value.id, name: currentUserPlayer.value.name } : null,
    selectedEvent: selectedEvent.value ? { id: selectedEvent.value.id, title: selectedEvent.value.title } : null
  })
  
  if (!currentUserPlayer.value || !selectedEvent.value) {
    console.log('❌ DEBUG openAvailabilityModalFromEventDetails: conditions non remplies, sortie')
    return
  }
  
  // Vérifier les permissions AVANT d'ouvrir la modale
  const canModify = await canModifyPlayerAvailability(currentUserPlayer.value.id, selectedEvent.value.id)
  if (!canModify) {
    console.log('❌ DEBUG openAvailabilityModalFromEventDetails: permissions insuffisantes, sortie silencieuse')
    return
  }
  
  // Utiliser openAvailabilityModalForPlayer qui vérifie correctement les permissions
  // au lieu de définir directement availabilityModalData avec isProtected: false
  // Cela garantit que les permissions sont vérifiées même quand l'utilisateur arrive via les URLs avec &modal=event_details
  await openAvailabilityModalForPlayer(currentUserPlayer.value, selectedEvent.value)
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
        await sendCastNotificationsForEvent({
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
        await sendCastNotificationsForEvent({ 
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

// Fonction pour obtenir les données de disponibilité d'un joueur pour un événement
function getPlayerAvailability(playerId, eventId) {
  const player = players.value.find(p => p.id === playerId)
  if (!player) return null
  
  return getAvailabilityData(player.name, eventId)
}

// Fonction pour vérifier si l'utilisateur peut modifier les disponibilités
const canEditAvailability = computed(() => {
  return canEditEvents.value
})

// Fonction pour gérer les changements de disponibilité
function handleAvailabilityChanged(data) {
  const { playerId, eventId, availability: newAvailability } = data
  const player = players.value.find(p => p.id === playerId)
  if (!player) return
  
  // Mettre à jour les données de disponibilité
  if (!availability.value[player.name]) {
    availability.value[player.name] = {}
  }
  availability.value[player.name][eventId] = newAvailability
}

// Fonction pour basculer le statut de sélection d'un joueur
function toggleSelectionStatus(playerName, eventId, status, seasonId) {
  handlePlayerSelectionStatusToggle(playerName, eventId, status, seasonId)
}

function getPlayerAvailabilityForEvent(eventId) {
  if (!eventId) return {}
  
  const availabilityMap = {}
  const event = events.value.find(e => e.id === eventId)
  const selectedPlayers = getSelectionPlayers(eventId)
  
  allSeasonPlayers.value.forEach(player => {
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
  
  // Utiliser le service pour calculer les chances de tous les rôles
  const allRoleChances = calculateAllRoleChances(
    event, 
    allSeasonPlayers.value, 
    availability.value, 
    countSelections,
    isAvailableForRole
  )
  
  const roleChances = {}
  
  // Extraire les chances par joueur et par rôle
  Object.entries(allRoleChances).forEach(([role, roleData]) => {
    if (roleData.candidates) {
      roleData.candidates.forEach(candidate => {
        if (!roleChances[candidate.name]) roleChances[candidate.name] = {}
        roleChances[candidate.name][role] = Math.round(candidate.practicalChance || 0)
      })
    }
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

// Fonction pour récupérer le pourcentage de chance pour un rôle spécifique d'un joueur
function getPlayerRoleChance(playerName, eventId, role) {
  const allRoleChances = getPlayerRoleChances(eventId)
  const playerChances = allRoleChances[playerName] || {}
  const chance = playerChances[role] || 0
  
  return chance
}

// Fonction pour obtenir les rôles de l'événement triés par ordre de priorité
function getSortedEventRoles() {
  if (!selectedEvent.value?.roles) return []
  
  const eventRoles = Object.keys(selectedEvent.value.roles).filter(role => selectedEvent.value.roles[role] > 0)
  
  // Trier selon l'ordre de priorité défini dans ROLE_PRIORITY_ORDER
  return eventRoles.sort((a, b) => {
    const indexA = ROLE_PRIORITY_ORDER.indexOf(a)
    const indexB = ROLE_PRIORITY_ORDER.indexOf(b)
    
    // Si un rôle n'est pas dans la liste de priorité, le mettre à la fin
    if (indexA === -1 && indexB === -1) return a.localeCompare(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    
    return indexA - indexB
  })
}

// Fonction pour calculer les chances théoriques d'un joueur pour tous les rôles
// (indépendamment de sa disponibilité actuelle)
function getPlayerTheoreticalChances(playerName, eventId, role) {
  if (!selectedEvent.value || !allSeasonPlayers.value) return 0
  
  const event = selectedEvent.value
  
  // Créer une copie des disponibilités en forçant le joueur à être disponible pour ce rôle
  const theoreticalAvailability = JSON.parse(JSON.stringify(availability.value))
  if (!theoreticalAvailability[playerName]) {
    theoreticalAvailability[playerName] = {}
  }
  if (!theoreticalAvailability[playerName][eventId]) {
    theoreticalAvailability[playerName][eventId] = {}
  }
  
  // Forcer la disponibilité pour ce rôle spécifique
  theoreticalAvailability[playerName][eventId] = {
    available: true,
    roles: [role],
    comment: null
  }
  
  // Créer une fonction isAvailableForRole théorique qui considère le joueur comme disponible pour ce rôle
  const theoreticalIsAvailableForRole = (name, roleName, eventId) => {
    if (name === playerName && roleName === role) {
      return true // Le joueur est forcé disponible pour ce rôle
    }
    // Pour les autres cas, utiliser la logique normale
    return isAvailableForRole(name, roleName, eventId)
  }
  
  // Calculer les chances avec cette disponibilité théorique
  const allRoleChances = calculateAllRoleChances(
    event, 
    allSeasonPlayers.value, 
    theoreticalAvailability, 
    countSelections,
    theoreticalIsAvailableForRole
  )
  
  const roleChances = allRoleChances[role]
  if (roleChances && roleChances.candidates) {
    const playerChance = roleChances.candidates.find(candidate => candidate.name === playerName)
    const chance = playerChance ? Math.round(playerChance.practicalChance || 0) : 0
    
    // Debug temporaire
    console.log('🔍 DEBUG getPlayerTheoreticalChances:', {
      playerName,
      role,
      roleChances: roleChances.candidates.length,
      playerChance,
      chance
    })
    
    return chance
  }
  
  return 0
}

// Fonction pour basculer la disponibilité d'un rôle spécifique
async function toggleRoleAvailability(role) {
  if (!currentUserPlayer.value || !selectedEvent.value) return
  
  const playerName = currentUserPlayer.value.name
  const eventId = selectedEvent.value.id
  
  // Récupérer les disponibilités actuelles
  const currentAvailability = getCurrentUserAvailabilityForEvent()
  const currentRoles = currentAvailability?.roles || []
  
  // Basculer le rôle
  let newRoles
  if (currentRoles.includes(role)) {
    // Retirer le rôle
    newRoles = currentRoles.filter(r => r !== role)
  } else {
    // Ajouter le rôle
    newRoles = [...currentRoles, role]
  }
  
  // Mettre à jour la disponibilité
  const newAvailabilityData = {
    available: newRoles.length > 0,
    roles: newRoles,
    comment: currentAvailability?.comment || null
  }
  
  try {
    // Sauvegarder via le service de disponibilité
    const { savePlayerAvailability } = await import('../services/storage.js')
    await savePlayerAvailability(playerName, eventId, newAvailabilityData)
    
    // Rafraîchir les données
    await loadAvailabilityData()
    
    console.log('✅ Disponibilité mise à jour pour le rôle:', role, newAvailabilityData)
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la disponibilité:', error)
  }
}

// Fonction pour obtenir le label d'un rôle selon le genre du joueur
function getRoleLabelByGender(role, userGender, plural = false) {
  // Rétro-compatibilité : si userGender n'est pas défini ou invalide, utiliser 'non-specified'
  const validGenders = ['male', 'female', 'non-specified']
  const gender = validGenders.includes(userGender) ? userGender : 'non-specified'
  
  if (plural) {
    return ROLE_LABELS_PLURAL_BY_GENDER[gender]?.[role] || ROLE_LABELS[role] || role
  } else {
    return ROLE_LABELS_BY_GENDER[gender]?.[role] || ROLE_LABELS_SINGULAR[role] || role
  }
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
  if (!cast) return null
  
  // Pour les admins, afficher le statut même si la composition n'est pas validée
  // Pour les utilisateurs normaux, ne pas afficher le statut si la composition n'est pas validée
  const canEditThisEvent = canEditEventMap[eventId] ?? canEditEvents.value
  if (!isSelectionConfirmedByOrganizer(eventId) && !canEditThisEvent) {
    return null
  }
  
  // Vérifier d'abord si le joueur est dans la section déclinés
  const declinedRole = getPlayerDeclinedRole(playerName, eventId)
  if (declinedRole) {
    return 'declined'
  }
  
  // Sinon, utiliser la logique normale
  return getPlayerCastStatus(cast, playerName, allSeasonPlayers.value)
}

// Fonction helper pour obtenir le rôle de composition d'un joueur
function getPlayerSelectionRole(playerName, eventId) {
  const cast = casts.value[eventId]
  if (!cast) return null
  
  // Vérifier d'abord si la composition est validée par l'organisateur
  if (!isSelectionConfirmedByOrganizer(eventId)) {
    return null
  }
  
  return getPlayerCastRole(cast, playerName, allSeasonPlayers.value)
}

// Fonction helper pour obtenir les données de sélection d'un joueur
function getSelectionData(playerName, eventId) {
  const cast = casts.value[eventId]
  if (!cast) {
    return null
  }
  
  // Obtenir le rôle du joueur
  const role = getPlayerCastRole(cast, playerName, allSeasonPlayers.value)
  
  if (!role) {
    return null
  }
  
  return {
    roles: [role],
    comment: null
  }
}

// Fonction helper pour obtenir le rôle d'un joueur dans la section déclinés
function getPlayerDeclinedRole(playerName, eventId) {
  const cast = casts.value[eventId]
  if (!cast || !cast.declined) return null
  
  const player = allSeasonPlayers.value.find(p => p.name === playerName)
  if (!player) return null
  
  // Chercher le joueur dans les déclinés
  for (const [role, playerIds] of Object.entries(cast.declined)) {
    if (Array.isArray(playerIds) && playerIds.includes(player.id)) {
      return role
    }
  }
  
  return null
}

// Fonction pour obtenir l'instruction contextuelle du joueur (identique à TimelineView)
function getPlayerInstruction(playerName, eventId) {
  if (!eventId || !playerName) return ''
  
  const isSelected = isPlayerSelected(playerName, eventId)
  const isSelectionConfirmedByOrganizer = isSelectionConfirmedByOrganizer(eventId)
  const playerSelectionStatus = getPlayerSelectionStatus(playerName, eventId)
  const availabilityData = getAvailabilityData(playerName, eventId)
  const player = allSeasonPlayers.value.find(p => p.name === playerName)
  const playerGender = player?.gender || 'non-specified'
  
  // Déterminer si on a une composition (équipe en préparation ou confirmée)
  const hasComposition = isSelected || isSelectionConfirmedByOrganizer
  
  // Phase 1: Collecte des dispos (pas de composition)
  if (!hasComposition) {
    if (availabilityData?.available === true) {
      return 'tu es disponible'
    } else if (availabilityData?.available === false) {
      return 'tu n\'es pas disponible'
    } else {
      return 'clique pour indiquer ta dispo'
    }
  }
  
  // Phase 2: Équipe en préparation ou confirmée (composition existe)
  if (isSelected) {
    // Joueur sélectionné
    if (playerSelectionStatus === 'confirmed') {
      return 'tu es dans l\'équipe!'
    } else if (playerSelectionStatus === 'declined') {
      return 'tu as décliné'
    } else {
      // Status 'pending' - à confirmer
      const selectedText = playerGender === 'female' ? 'tu es sélectionnée' : 'tu es sélectionné'
      return `${selectedText}, clique pour confirmer`
    }
  } else {
    // Joueur non sélectionné
    const notSelectedText = playerGender === 'female' ? 'tu n\'es pas sélectionnée' : 'tu n\'es pas sélectionné'
    return notSelectedText
  }
}

function closeSelectionModal() {
  // No-op: composition is now inline in the event-details tab; kept for backward compatibility / URL cleanup
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('modal') === 'selection') {
      params.delete('modal'); params.delete('event')
      history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    }
  } catch {}
}

// Fonction pour gérer le clic sur un événement depuis TimelineView
function handleEventClickFromTimeline(event, fromAllPlayersFilter = false) {
  // Appeler showEventDetails avec les bons paramètres
  showEventDetails(event, false, true, fromAllPlayersFilter)
}

// Passer à l’onglet Composition dans le détail événement (boutons du footer)
function switchToCompositionTab() {
  eventDetailsActiveTab.value = 'composition'
  if (route.params.eventId) {
    router.replace({ path: route.path, query: { ...route.query, tab: 'compo' } })
  } else {
    try {
      const params = new URLSearchParams(window.location.search)
      params.set('tab', 'compo')
      if (params.get('modal') !== 'event_details') params.set('modal', 'event_details')
      if (!params.has('event') && selectedEvent.value?.id) params.set('event', selectedEvent.value.id)
      history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    } catch {}
  }
}

// Ouvre le détail événement avec l’onglet Composition (plus de popup de composition)
async function openSelectionModal(event) {
  if (event?.archived) {
    showSuccessMessage.value = true
    successMessage.value = 'Impossible d\'ouvrir la composition sur un événement inactif'
    setTimeout(() => { showSuccessMessage.value = false }, 3000)
    return
  }
  showEventDetails(event, false, true, false, 'composition')
}

// Fonction pour afficher la composition depuis TimelineView (ouvre le détail avec onglet Composition)
function showCompositionModal(event, fromAllPlayersFilter = false) {
  if (fromAllPlayersFilter) {
    selectedTeamPlayer.value = { id: 'all', name: 'Tous' }
  }
  openSelectionModal(event)
}

// Fonctions pour le sélecteur de joueur dans l'onglet équipe

// Fonctions pour le PlayerSelectorModal de l'onglet Disponibilités
function toggleAvailabilityPlayerSelector() {
  showAvailabilityPlayerSelector.value = !showAvailabilityPlayerSelector.value
}

function selectAvailabilityPlayer(player) {
  selectedTeamPlayer.value = player
  showAvailabilityPlayerSelector.value = false
}

function selectAllAvailabilityPlayers() {
  selectedTeamPlayer.value = { id: 'all', name: 'Tous' }
  showAvailabilityPlayerSelector.value = false
}

function selectFirstFavoriteAvailabilityPlayer() {
  // Prioriser le joueur connecté s'il existe
  if (currentUserPlayer.value) {
    selectedTeamPlayer.value = currentUserPlayer.value
  } 
  // Sinon, prendre le premier joueur favori
  else if (preferredPlayerIdsSet.value.size > 0) {
    const firstFavoriteId = preferredPlayerIdsSet.value.values().next().value
    const firstFavorite = allSeasonPlayers.value.find(p => p.id === firstFavoriteId)
    if (firstFavorite) {
      selectedTeamPlayer.value = firstFavorite
    }
  }
  showAvailabilityPlayerSelector.value = false
}

function getFirstFavoritePlayerId() {
  if (currentUserPlayer.value) {
    return currentUserPlayer.value.id
  }
  if (preferredPlayerIdsSet.value.size > 0) {
    return preferredPlayerIdsSet.value.values().next().value
  }
  return null
}

// Fonction pour toggle l'expansion du header
function toggleEventHeaderExpansion() {
  isEventHeaderExpanded.value = !isEventHeaderExpanded.value
}

// Computed pour le joueur sélectionné dans l'équipe (par défaut le joueur courant)
const currentTeamPlayer = computed(() => {
  if (selectedTeamPlayer.value) {
    return selectedTeamPlayer.value
  }
  return currentUserPlayer.value
})

// Computed pour le texte d'affichage du sélecteur
const teamPlayerDisplayText = computed(() => {
  if (selectedTeamPlayer.value) {
    return selectedTeamPlayer.value.name
  }
  // Par défaut, afficher toutes les disponibilités
  return 'Personnes Disponibles'
})

// Computed pour savoir si on affiche l'avatar (uniquement si une personne spécifique est choisie)
const showTeamPlayerAvatar = computed(() => {
  return !!selectedTeamPlayer.value
})

// Computed pour filtrer les joueurs selon la sélection dans l'équipe
const filteredTeamPlayers = computed(() => {
  if (selectedTeamPlayer.value) {
    return [selectedTeamPlayer.value]
  }
  return allSeasonPlayers.value
})

// Computed pour filtrer les rôles selon la sélection dans l'équipe
const filteredTeamRoles = computed(() => {
  if (!selectedEvent.value?.roles) return []
  
  const allRoles = ROLE_PRIORITY_ORDER.filter(role => {
    const count = selectedEvent.value.roles[role] || 0
    return count > 0
  })
  
  // Si un joueur spécifique est sélectionné, filtrer les rôles où il est disponible
  if (selectedTeamPlayer.value) {
    return allRoles.filter(role => {
      return isAvailableForRole(selectedTeamPlayer.value.name, role, selectedEvent.value.id)
    })
  }
  
  // Sinon, afficher tous les rôles
  return allRoles
})

// Computed pour filtrer les joueurs disponibles dans le dropdown
const availablePlayersForDropdown = computed(() => {
  if (!selectedEvent.value) return []
  
  return allSeasonPlayers.value.filter(player => {
    return isAvailable(player.name, selectedEvent.value.id)
  })
})


// Removed chances modal logic

// Désistement helpers supprimés

async function handleSelectionFromModal() {
  const event = selectedEvent.value
  if (!event) return
  
  const eventId = event.id
  const count = event.playerCount || 6
  
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
  if (!selectedEvent.value) return
  
  const eventId = selectedEvent.value.id
  
  try {
    // Lancer directement la composition (le PIN a déjà été validé)
    await drawProtected(eventId)
  } catch (error) {
    console.error('Erreur lors de la confirmation du tirage:', error)
  }
  // Ne pas fermer la popin de composition, elle restera ouverte avec la nouvelle composition
}

async function handleConfirmSelectionFromModal() {
  if (!selectedEvent.value) return
  
  const eventId = selectedEvent.value.id
  
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
    await loadAvailabilityForAllPlayers()
    
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
  if (!selectedEvent.value) return
  
  const eventId = selectedEvent.value.id
  
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
  if (!selectedEvent.value) return
  
  // Recharger les données pour refléter les changements
  try {
    const { loadCasts } = await import('../services/storage.js')
    const newSelections = await loadCasts(seasonId.value)
    casts.value = newSelections
    
    // Recharger aussi les disponibilités pour s'assurer que l'affichage est à jour
    await loadAvailabilityForAllPlayers()
  } catch (error) {
    console.error('Erreur lors du rechargement des compositions:', error)
  }
}

async function handleFillCastFromModal() {
  if (!selectedEvent.value) return
  
  const eventId = selectedEvent.value.id
  
  try {
    // Demander le PIN code avant de remplir la composition
    await requirePin({
      type: 'fillCast',
      data: { eventId }
    })
  } catch (error) {
    console.error('Erreur lors de la demande de remplissage:', error)
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
    const newAvailability = await loadAvailabilityForAllPlayers()
    availability.value = newAvailability
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
    const showAvailability = params.get('showAvailability') === 'true'
    const tabParam = params.get('tab')
    const showConfirm = params.get('showConfirm') === 'true'
    if (eventId) {
      const t = list.find(e => e.id === eventId)
      if (t) {
        // Appliquer le filtre d'événement issu de l'URL si présent
        selectedEventId.value = eventId
        isAllEventsView.value = false
      }
    }
    if (!modal || !eventId) return
    const t = list.find(e => e.id === eventId)
    if (!t) return
    if (modal === 'announce') openEventAnnounceModal(t, showAvailability)
    if (modal === 'selection') showEventDetails(t, false, true, false, 'composition')
    if (modal === 'event_details') {
      showEventDetails(t, showAvailability, false, false, tabParam, showConfirm)
    }
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
    // Gérer spécifiquement les erreurs de permissions Firestore
    if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
      logger.debug('Permissions Firestore insuffisantes pour lire userPreferences, utilisation du fallback')
      return false
    }
    
    logger.warn('Erreur lors de la vérification de surveillance:', error)
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

// Fonction pour désactiver les notifications d'un événement
async function disableEventNotifications(event) {
  if (!event) return
  
  try {
    // Supprimer le token FCM du localStorage
    localStorage.removeItem('fcmToken')
    
    // Supprimer les préférences de notifications
    localStorage.removeItem('notificationPreferences')
    
    // Mettre à jour l'état local
    await updateEventMonitoredState()
    
    // Afficher un message de succès
    showSuccessMessage.value = true
    successMessage.value = 'Notifications désactivées pour cet événement'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
    
    logger.debug('✅ Notifications désactivées pour l\'événement:', event.title)
  } catch (error) {
    logger.error('❌ Erreur lors de la désactivation des notifications:', error)
    showSuccessMessage.value = true
    successMessage.value = 'Erreur lors de la désactivation des notifications'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  }
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
async function openAvailabilityModal(data) {
  // Si les données contiennent isProtected, vérifier les permissions avant d'ouvrir
  if (data.isProtected && data.eventId) {
    // Récupérer le joueur depuis playerId si présent, sinon depuis playerName
    // Chercher dans players.value d'abord (liste actuelle), puis dans allSeasonPlayers.value (liste complète)
    let player = null
    if (data.playerId) {
      player = players.value.find(p => p.id === data.playerId) || allSeasonPlayers.value.find(p => p.id === data.playerId)
    } else if (data.playerName) {
      player = players.value.find(p => p.name === data.playerName) || allSeasonPlayers.value.find(p => p.name === data.playerName)
    }
    
    const eventItem = events.value.find(e => e.id === data.eventId)
    
    if (!player) {
      // Si le joueur n'est pas trouvé mais qu'il est protégé, ne pas ouvrir la modale
      showErrorMessage.value = true
      errorMessage.value = `Impossible de vérifier les permissions pour ${data.playerName || 'ce joueur'}.`
      setTimeout(() => {
        showErrorMessage.value = false
      }, 5000)
      return
    }
    
    if (!eventItem) {
      return
    }
    
    // Vérifier les permissions avant d'ouvrir la modale
    const canModify = await canModifyPlayerAvailability(player.id, eventItem.id)
    if (!canModify) {
      // Afficher un message d'erreur si l'utilisateur n'a pas les permissions
      showErrorMessage.value = true
      errorMessage.value = `Vous n'avez pas les permissions de modifier les disponibilités de ${player.name}.`
      setTimeout(() => {
        showErrorMessage.value = false
      }, 5000)
      return
    }
    // Utiliser la fonction qui vérifie les permissions
    await openAvailabilityModalForPlayer(player, eventItem)
    return
  }
  
  // Sinon, ouvrir directement la modale (pour les joueurs non protégés ou si les données sont incomplètes)
  // Récupérer les rôles attendus pour cet événement
  let eventRoles = {}
  if (data.eventId) {
    const event = events.value.find(e => e.id === data.eventId)
    if (event && event.roles) {
      eventRoles = event.roles
    }
  }
  
  // Récupérer playerId si non présent mais playerName est présent
  let playerId = data.playerId
  if (!playerId && data.playerName) {
    const player = allSeasonPlayers.value.find(p => p.name === data.playerName)
    if (player) {
      playerId = player.id
    }
  }
  
  availabilityModalData.value = {
    playerName: data.playerName,
    playerId: playerId,
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

function openEventModal(event, fromAllPlayersFilter = false) {
  // Ouvrir la modale d'événement et mettre à jour l'URL
  showEventDetails(event, false, true, fromAllPlayersFilter) // showAvailability=false, updateUrl=true, fromAllPlayersFilter
}

async function handleAvailabilitySave(availabilityData) {
  try {
    // Vérification de sécurité minimale : vérifier que l'utilisateur est connecté
    const isUserConnected = !!currentUser.value?.email;
    if (!isUserConnected) {
      console.error('❌ Tentative de sauvegarde sans authentification');
      showErrorMessage.value = true;
      errorMessage.value = 'Vous devez être connecté pour modifier les disponibilités.';
      setTimeout(() => {
        showErrorMessage.value = false;
      }, 5000);
      return;
    }
    
    // Les permissions ont déjà été vérifiées avant d'autoriser la modification
    // via canModifyPlayerAvailability() dans les watchers et openAvailabilityModalFromEventDetails()
    
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
    
    // Forcer le rechargement des disponibilités pour synchroniser avec le service
    const newAvailability = await loadAvailability(allSeasonPlayers.value, events.value, seasonId.value)
    availability.value = newAvailability
    
    // Reload casts to reflect any auto-decline changes
    const { loadCasts } = await import('../services/storage.js')
    const updatedCasts = await loadCasts(seasonId.value)
    casts.value = updatedCasts
    
    // Forcer le re-render de AvailabilityCell
    availabilityCellRefreshKey.value++
    
    // Ne fermer la modale que si keepOpen n'est pas demandé
    if (!availabilityData.keepOpen) {
      showAvailabilityModal.value = false
    }
    
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
    // Vérification de sécurité : bloquer seulement si utilisateur non connecté ET joueur protégé
    const isUserConnected = !!currentUser.value?.email;
    const isPlayerProtected = availabilityModalData.value?.isProtected || false;
    
    if (!isUserConnected && isPlayerProtected) {
      console.error('❌ Tentative de modification d\'un joueur protégé sans authentification');
      showErrorMessage.value = true;
      errorMessage.value = 'Vous devez être connecté pour modifier la disponibilité d\'un joueur protégé.';
      setTimeout(() => {
        showErrorMessage.value = false;
      }, 5000);
      return;
    }
    
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
    
    // Reload casts to reflect any auto-decline changes
    const { loadCasts } = await import('../services/storage.js')
    const updatedCasts = await loadCasts(seasonId.value)
    casts.value = updatedCasts
    
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
    // Vérification de sécurité : bloquer seulement si utilisateur non connecté ET joueur protégé
    const isUserConnected = !!currentUser.value?.email;
    const isPlayerProtected = availabilityModalData.value?.isProtected || false;
    
    if (!isUserConnected && isPlayerProtected) {
      console.error('❌ Tentative de modification d\'un joueur protégé sans authentification');
      showErrorMessage.value = true;
      errorMessage.value = 'Vous devez être connecté pour modifier la disponibilité d\'un joueur protégé.';
      setTimeout(() => {
        showErrorMessage.value = false;
      }, 5000);
      return;
    }
    
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
    
    // Reload casts to keep data in sync
    const { loadCasts } = await import('../services/storage.js')
    const updatedCasts = await loadCasts(seasonId.value)
    casts.value = updatedCasts
    
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

// Handlers pour la modal de confirmation
async function handleConfirmationConfirm(data) {
  try {
    // Récupérer playerId depuis confirmationModalData si non présent dans data
    const playerId = data.playerId || confirmationModalData.value.playerId
    
    // Vérification de sécurité : vérifier que l'utilisateur peut modifier ce statut
    const canModify = await canModifyConfirmationStatus(
      data.playerName, 
      playerId, 
      data.eventId
    );
    
    if (!canModify) {
      console.error('❌ Tentative de confirmation non autorisée');
      showErrorMessage.value = true;
      errorMessage.value = 'Vous devez être connecté et être le propriétaire de ce slot ou un administrateur pour modifier le statut de confirmation.';
      setTimeout(() => {
        showErrorMessage.value = false;
      }, 5000);
      return;
    }

    await handlePlayerSelectionStatusToggle(data.playerName, data.eventId, 'confirmed', seasonId.value)

    // Save/update availability comment alongside confirmation
    if (typeof data.comment === 'string') {
      const { saveAvailabilityWithRoles } = await import('../services/storage.js')
      
      // Get the selection role for this player
      const selectionRole = getPlayerSelectionRole(data.playerName, data.eventId)
      
      // PRESERVE all existing roles and ensure selection role is included
      // Don't overwrite existing roles with only the selection role
      const existingRoles = availability.value?.[data.playerName]?.[data.eventId]?.roles || []
      const rolesToSave = [...new Set([...existingRoles, ...(selectionRole ? [selectionRole] : [])])]
      
      await saveAvailabilityWithRoles({
        seasonId: seasonId.value,
        playerName: data.playerName,
        eventId: data.eventId,
        available: true,
        roles: rolesToSave,
        comment: data.comment || null
      })

      // Update local cache preserving all roles
      if (!availability.value[data.playerName]) availability.value[data.playerName] = {}
      const prev = availability.value[data.playerName][data.eventId] || { available: true, roles: [], comment: null }
      availability.value[data.playerName][data.eventId] = { 
        ...prev, 
        available: true, 
        roles: rolesToSave, // Use the same preserved roles
        comment: data.comment || null 
      }
    }

    showConfirmationModal.value = false
    
    // Afficher un message de succès
    showSuccessMessage.value = true
    successMessage.value = 'Participation confirmée ! 👍'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
    
  } catch (error) {
    console.error('Erreur lors de la confirmation:', error)
    showErrorMessage.value = true
    errorMessage.value = 'Erreur lors de la confirmation. Veuillez réessayer.'
    setTimeout(() => {
      showErrorMessage.value = false
    }, 5000)
  }
}

async function handleConfirmationDecline(data) {
  try {
    // Récupérer playerId depuis confirmationModalData si non présent dans data
    const playerId = data.playerId || confirmationModalData.value.playerId
    
    // Vérification de sécurité : vérifier que l'utilisateur peut modifier ce statut
    const canModify = await canModifyConfirmationStatus(
      data.playerName, 
      playerId, 
      data.eventId
    );
    
    if (!canModify) {
      console.error('❌ Tentative de déclin non autorisée');
      showErrorMessage.value = true;
      errorMessage.value = 'Vous devez être connecté et être le propriétaire de ce slot ou un administrateur pour modifier le statut de confirmation.';
      setTimeout(() => {
        showErrorMessage.value = false;
      }, 5000);
      return;
    }

    await handlePlayerSelectionStatusToggle(data.playerName, data.eventId, 'declined', seasonId.value)

    // Save/update availability comment when declining
    // IMPORTANT: Preserve existing availability roles - declining a selection should NOT delete availability data
    // The player is still available for other roles, they just declined THIS specific selection
    if (typeof data.comment === 'string') {
      const { saveAvailabilityWithRoles } = await import('../services/storage.js')
      
      // PRESERVE all existing roles - don't delete them when declining
      const existingRoles = availability.value?.[data.playerName]?.[data.eventId]?.roles || []
      const existingAvailable = availability.value?.[data.playerName]?.[data.eventId]?.available ?? true
      
      // Save availability with preserved roles and availability status
      // Only update the comment, don't change availability or roles
      await saveAvailabilityWithRoles({
        seasonId: seasonId.value,
        playerName: data.playerName,
        eventId: data.eventId,
        available: existingAvailable, // Preserve existing availability status
        roles: existingRoles, // Preserve all existing roles
        comment: data.comment || null
      })

      // Update local cache preserving all roles
      if (!availability.value[data.playerName]) availability.value[data.playerName] = {}
      availability.value[data.playerName][data.eventId] = {
        available: existingAvailable, // Preserve existing availability status
        roles: existingRoles, // Preserve all existing roles
        comment: data.comment || null
      }
    }

    showConfirmationModal.value = false
    
    // Afficher un message de succès
    showSuccessMessage.value = true
    successMessage.value = 'Participation déclinée 👎'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
    
  } catch (error) {
    console.error('Erreur lors du déclin:', error)
    showErrorMessage.value = true
    errorMessage.value = 'Erreur lors du déclin. Veuillez réessayer.'
    setTimeout(() => {
      showErrorMessage.value = false
    }, 5000)
  }
}

async function handleConfirmationPending(data) {
  try {
    // Récupérer playerId depuis confirmationModalData si non présent dans data
    const playerId = data.playerId || confirmationModalData.value.playerId
    
    // Vérification de sécurité : vérifier que l'utilisateur peut modifier ce statut
    const canModify = await canModifyConfirmationStatus(
      data.playerName, 
      playerId, 
      data.eventId
    );
    
    if (!canModify) {
      console.error('❌ Tentative de mise en attente non autorisée');
      showErrorMessage.value = true;
      errorMessage.value = 'Vous devez être connecté et être le propriétaire de ce slot ou un administrateur pour modifier le statut de confirmation.';
      setTimeout(() => {
        showErrorMessage.value = false;
      }, 5000);
      return;
    }

    await handlePlayerSelectionStatusToggle(data.playerName, data.eventId, 'pending', seasonId.value)

    // Save/update availability comment for pending (no explicit availability change, keep previous available state if any)
    if (typeof data.comment === 'string') {
      const { saveAvailabilityWithRoles } = await import('../services/storage.js')
      const prev = availability.value?.[data.playerName]?.[data.eventId]
      await saveAvailabilityWithRoles({
        seasonId: seasonId.value,
        playerName: data.playerName,
        eventId: data.eventId,
        available: prev?.available ?? true,
        roles: prev?.roles || [],
        comment: data.comment || null
      })

      // Update local cache
      if (!availability.value[data.playerName]) availability.value[data.playerName] = {}
      availability.value[data.playerName][data.eventId] = {
        available: prev?.available ?? true,
        roles: prev?.roles || [],
        comment: data.comment || null
      }
    }

    showConfirmationModal.value = false
    
    // Afficher un message de succès
    showSuccessMessage.value = true
    successMessage.value = 'Statut remis à "À confirmer" ⏳'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
    
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error)
    showErrorMessage.value = true
    errorMessage.value = 'Erreur lors du changement de statut. Veuillez réessayer.'
    setTimeout(() => {
      showErrorMessage.value = false
    }, 5000)
  }
}

// Fonction pour ouvrir la modal de confirmation
function openConfirmationModal(data) {
  confirmationModalData.value = { ...data }
  showConfirmationModal.value = true
}

// Fonction pour vérifier si l'utilisateur peut modifier le statut de confirmation d'un joueur
async function canModifyConfirmationStatus(playerName, playerId, eventId) {
  // Vérifier si l'utilisateur est connecté
  if (!currentUser.value?.email) {
    return false
  }

  // Vérifier si c'est le slot de l'utilisateur connecté
  if (currentUserPlayer.value) {
    const isOwnSlot = currentUserPlayer.value.id === playerId || 
                      currentUserPlayer.value.name === playerName
    if (isOwnSlot) {
      return true
    }
  }

  // Si ce n'est pas son propre slot, vérifier si l'utilisateur est admin
  if (eventId && seasonId.value) {
    const canEdit = await canEditSpecificEvent(eventId, false)
    if (canEdit) {
      return true
    }
  }

  return false
}

// Fonction pour vérifier et ouvrir automatiquement la modale de confirmation
// si l'utilisateur est logué et présent dans la composition
async function checkAndOpenConfirmationModal(eventId) {
  // Vérifier si l'utilisateur est logué
  if (!currentUser.value || !currentUserPlayer.value) {
    return false
  }

  // Vérifier que l'événement sélectionné correspond bien
  if (!selectedEvent.value || selectedEvent.value.id !== eventId) {
    return false
  }

  // Attendre que les données soient chargées
  await nextTick()
  
  // Vérifier si l'utilisateur est dans la composition
  const userSlot = compositionSlots.value.find(slot => 
    slot.playerId === currentUserPlayer.value.id || 
    slot.playerName === currentUserPlayer.value.name
  )

  if (!userSlot) {
    return false
  }

  // Vérifier les permissions avant d'ouvrir la modale
  const canModify = await canModifyConfirmationStatus(
    userSlot.playerName, 
    userSlot.playerId, 
    eventId
  )
  
  if (!canModify) {
    return false
  }

  // Ouvrir la modale de confirmation pour l'utilisateur
  await handleCompositionSlotClick(userSlot)
  return true
}

// Handle slot click from composition modal (SelectionModal overlay or inline tab) – open confirmation popup
async function handleSelectionModalSlotConfirmationClick(slotData) {
  const event = selectionModalEvent.value || selectedEvent.value
  if (!event || !slotData?.playerName) return

  const eventId = event.id
  const playerName = slotData.playerName
  const playerId = slotData.playerId

  const canModify = await canModifyConfirmationStatus(playerName, playerId, eventId)

  if (!canModify) {
    showErrorMessage.value = true
    errorMessage.value = 'Vous devez être connecté et être le propriétaire de ce slot ou un administrateur pour modifier le statut de confirmation.'
    setTimeout(() => {
      showErrorMessage.value = false
    }, 5000)
    return
  }

  const availabilityData = getAvailabilityData(playerName, eventId)
  const data = {
    playerName,
    playerId,
    playerGender: slotData.playerGender || 'non-specified',
    eventId,
    eventTitle: event.title,
    eventDate: event.date,
    assignedRole: slotData.roleKey,
    availabilityComment: availabilityData?.comment || null,
    currentStatus: slotData.selectionStatus,
    seasonId: seasonId.value
  }
  openConfirmationModal(data)
}

// Handle composition slot click from composition tab
async function handleCompositionSlotClick(slot) {
  if (!selectedEvent.value || !slot.playerName) return
  
  const event = selectedEvent.value
  const eventId = event.id
  const playerName = slot.playerName
  const playerId = slot.playerId

  // Vérifier les permissions avant d'ouvrir la modale
  const canModify = await canModifyConfirmationStatus(playerName, playerId, eventId)
  
  if (!canModify) {
    // Afficher un message d'erreur si l'utilisateur n'est pas autorisé
    showErrorMessage.value = true
    errorMessage.value = 'Vous devez être connecté et être le propriétaire de ce slot ou un administrateur pour modifier le statut de confirmation.'
    setTimeout(() => {
      showErrorMessage.value = false
    }, 5000)
    return
  }

  // Get current availability data to pass the comment
  const availabilityData = getAvailabilityData(playerName, eventId)
  
  // Build confirmation modal data similar to AvailabilityCell
  const data = {
    playerName,
    playerId,
    playerGender: slot.playerGender || 'non-specified',
    eventId,
    eventTitle: event.title,
    eventDate: event.date,
    assignedRole: slot.roleKey,
    availabilityComment: availabilityData?.comment || null,
    currentStatus: slot.selectionStatus,
    seasonId: seasonId.value
  }

  // Use the same openConfirmationModal function
  openConfirmationModal(data)
}

// Fonction pour gérer le bouton "Modifier" dans l'onglet "Ma Dispo"
function handleModifyAvailabilityFromEventDetails() {
  if (!selectedEvent.value || !currentUserPlayer.value) {
    console.warn('Impossible de modifier: événement ou joueur manquant')
    return
  }
  
  // Vérifier si l'utilisateur est sélectionné pour cet événement
  const isSelected = isPlayerSelected(currentUserPlayer.value.name, selectedEvent.value.id)
  
  if (isSelected) {
    // Si sélectionné → ouvrir la modale de confirmation
    openConfirmationModalFromEventDetails()
  } else {
    // Si pas sélectionné → ouvrir la modale de disponibilités
    openAvailabilityModalFromEventDetails()
  }
}

// Fonction pour ouvrir la modal de confirmation depuis l'onglet "Ma Dispo"
function openConfirmationModalFromEventDetails() {
  if (!selectedEvent.value || !currentUserPlayer.value) {
    console.warn('Impossible d\'ouvrir la modale de confirmation: événement ou joueur manquant')
    return
  }
  
  const data = {
    playerName: currentUserPlayer.value.name,
    playerId: currentUserPlayer.value.id,
    eventId: selectedEvent.value.id,
    eventTitle: selectedEvent.value.title,
    eventDate: selectedEvent.value.date,
    seasonId: seasonId.value,
    seasonSlug: props.slug
  }
  
  openConfirmationModal(data)
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

// Fonction pour générer le tooltip d'avertissement pour les joueurs non-protégés
function getUnprotectedPlayerTooltip(player) {
  return `⚠️ ${player.name} non protégé
Disponibilités modifiables par tous`
}

// end of script setup
</script>