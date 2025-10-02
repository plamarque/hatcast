<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 safe-area-all">
    <!-- Header de saison partagé -->
    <SeasonHeader 
      :season-name="seasonName"
      :is-scrolled="false"
      :season-slug="seasonSlug"
      :is-connected="!!currentUser?.email"
      :is-admin-mode="true"
      @go-back="goBack"
      @open-account-menu="openAccountMenu"
      @open-help="openHelp"
      @open-preferences="openPreferences"
      @open-players="openPlayers"
      @logout="handleLogout"
      @open-login="openAccount"
      @open-account="openAccount"
      @open-account-creation="openAccountCreation"
      @open-development="openDevelopment"
    />

    <!-- Contenu principal -->
    <div class="pb-16 px-4" style="padding-top: calc(2rem + env(safe-area-inset-top));">
      <div class="max-w-4xl mx-auto">
        <!-- Message d'erreur -->
        <div v-if="errorMessage" class="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-xl">⚠️</span>
              <p class="text-red-200">{{ errorMessage }}</p>
            </div>
            <button 
              @click="errorMessage = ''"
              class="text-red-400 hover:text-red-300 text-lg"
              title="Fermer"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Système d'onglets -->
        <div class="bg-gray-800/50 rounded-lg overflow-hidden">
          <!-- Navigation des onglets -->
          <div class="flex border-b border-white/10">
            <button
              @click="activeTab = 'info'"
              :class="activeTab === 'info' ? 'bg-gray-700 text-white border-b-2 border-purple-400' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
              class="flex-1 px-6 py-4 text-center font-medium transition-all duration-200"
            >
              📊 Informations
            </button>
            <button
              @click="activeTab = 'events'"
              :class="activeTab === 'events' ? 'bg-gray-700 text-white border-b-2 border-purple-400' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
              class="flex-1 px-6 py-4 text-center font-medium transition-all duration-200"
            >
              📅 Événements
            </button>
            <button
              @click="switchToUsersTab"
              :class="activeTab === 'users' ? 'bg-gray-700 text-white border-b-2 border-purple-400' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
              class="flex-1 px-6 py-4 text-center font-medium transition-all duration-200"
            >
              🏃‍♂️ Participants
            </button>
          </div>

          <!-- Contenu des onglets -->
          <div class="p-6">
            <!-- Onglet Informations -->
            <div v-if="activeTab === 'info'" class="space-y-6">
              <!-- Carte de saison -->
              <div>
                <h2 class="text-2xl font-bold text-white mb-4">📋 Informations de la saison</h2>
                <div class="flex justify-center">
                  <SeasonCard 
                    :season="seasonCardData"
                    :show-availabilities="true"
                    :show-id="true"
                    :show-menu="false"
                    :clickable="false"
                  >
                    <template #actions>
                      <button
                        @click="showSeasonEditModal = true"
                        class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105"
                      >
                        <span>✏️</span>
                        Modifier
                      </button>
                      
                      <button
                        @click="exportAvailabilities"
                        class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105"
                      >
                        <span>📊</span>
                        Exporter CSV
                      </button>
                      
                      <button
                        @click="deleteSeason"
                        class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105"
                      >
                        <span>🗑️</span>
                        Supprimer
                      </button>
                    </template>
                  </SeasonCard>
                </div>
              </div>

              <!-- Outils d'administration -->
              <div>
                <h2 class="text-2xl font-bold text-white mb-4">🔧 Outils d'administration</h2>
                <div class="bg-gray-700/50 rounded-lg p-4 mb-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-lg font-semibold text-white mb-2">Migration des données de protection</h3>
                      <p class="text-gray-300 text-sm mb-3">
                        Synchronise les données de protection des joueurs vers les documents players pour améliorer les performances.
                      </p>
                      <div v-if="migrationStatus" class="text-sm" :class="migrationStatus.success ? 'text-green-400' : 'text-red-400'">
                        {{ migrationStatus.message }}
                      </div>
                    </div>
                    <button
                      @click="runMigration"
                      :disabled="isMigrationRunning"
                      class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 text-white text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 disabled:scale-100"
                    >
                      <span v-if="isMigrationRunning">⏳</span>
                      <span v-else>🚀</span>
                      {{ isMigrationRunning ? 'Migration...' : 'Migrer' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Statistiques de la saison -->
              <div>
                <h2 class="text-2xl font-bold text-white mb-4">📊 Statistiques de la saison</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="bg-gray-700/50 rounded-lg p-4">
                    <div class="flex items-center gap-3 mb-2">
                      <span class="text-2xl">👥</span>
                      <div>
                        <div class="text-2xl font-bold text-blue-300">{{ playersCount }}</div>
                        <div class="text-sm text-gray-400">Joueurs</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="bg-gray-700/50 rounded-lg p-4">
                    <div class="flex items-center gap-3 mb-2">
                      <span class="text-2xl">📅</span>
                      <div>
                        <div class="text-2xl font-bold text-purple-300">{{ totalEventsCount }}</div>
                        <div class="text-sm text-gray-400">Événements</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="bg-gray-700/50 rounded-lg p-4">
                    <div class="flex items-center gap-3 mb-2">
                      <span class="text-2xl">✅</span>
                      <div>
                        <div class="text-2xl font-bold text-green-300">{{ availabilitiesCount }}</div>
                        <div class="text-sm text-gray-400">Disponibilités</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Onglet Événements -->
            <div v-if="activeTab === 'events'" class="space-y-6">
              <!-- Section Gestion des événements -->
            <div class="space-y-4 mb-6">
              <!-- Titre et statistiques -->
              <div>
                <h2 class="text-2xl font-bold text-white mb-2">📅 Gestion des événements</h2>
                <!-- Nombre total d'événements -->
                <div class="text-sm text-purple-300 mb-2">
                  {{ totalEventsCount }} événement{{ totalEventsCount > 1 ? 's' : '' }} au total
                </div>
                <!-- Indicateur des résultats -->
                <div v-if="searchTerm.trim() || showInactiveEvents || showPastEvents" class="text-sm text-purple-300 mt-1">
                  {{ filteredEvents.length }} événement{{ filteredEvents.length > 1 ? 's' : '' }} affiché{{ filteredEvents.length > 1 ? 's' : '' }}
                  <span v-if="events.length > filteredEvents.length">
                    sur {{ events.length }} total
                  </span>
                </div>
              </div>
              
              <!-- Contrôles - responsive -->
              <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                <!-- Champ de recherche rapide -->
                <div class="relative flex-1">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>
                  <input
                    v-model="searchTerm"
                    type="text"
                    placeholder="Rechercher un événement..."
                    class="pl-10 pr-4 py-2 w-full sm:w-64 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                  <!-- Bouton de réinitialisation -->
                  <button
                    v-if="searchTerm"
                    @click="searchTerm = ''"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                    title="Effacer la recherche"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                
                <!-- Boutons d'action -->
                <div class="flex items-center gap-3">
                  <!-- Bouton de filtres -->
                  <div class="relative">
                    <button
                      @click="toggleFiltersDropdown"
                      class="text-white hover:text-purple-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10 relative"
                      :class="{ 'bg-white/20': showFiltersDropdown }"
                      title="Filtres d'affichage"
                      aria-label="Filtres d'affichage"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"/>
                      </svg>
                      
                      <!-- Indicateur de filtres actifs -->
                      <div
                        v-if="showInactiveEvents || showPastEvents"
                        class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full border border-gray-900"
                      ></div>
                    </button>
                    
                    <!-- Dropdown des filtres -->
                    <div
                      v-if="showFiltersDropdown"
                      class="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-white/20 rounded-xl shadow-2xl z-[1200] overflow-hidden"
                    >
                      <div class="p-3 border-b border-white/10">
                        <h3 class="text-sm font-medium text-white mb-2">Filtres d'affichage</h3>
                        <p class="text-xs text-gray-400">Futurs actifs affichés par défaut</p>
                      </div>
                      
                      <!-- Option Inactifs -->
                      <label class="flex items-center px-3 py-2 hover:bg-white/10 cursor-pointer transition-colors duration-150">
                        <input
                          v-model="showInactiveEvents"
                          type="checkbox"
                          class="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                        >
                        <span class="ml-3 text-sm text-white">Inactifs</span>
                        <span class="ml-auto text-xs text-gray-400">📁</span>
                      </label>
                      
                      <!-- Option Passés -->
                      <label class="flex items-center px-3 py-2 hover:bg-white/10 cursor-pointer transition-colors duration-150">
                        <input
                          v-model="showPastEvents"
                          type="checkbox"
                          class="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                        >
                        <span class="ml-3 text-sm text-white">Passés</span>
                        <span class="ml-auto text-xs text-gray-400">📅</span>
                      </label>
                    </div>
                  </div>
                  
                  <button
                    @click="showAddEventModal = true"
                    class="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
                  >
                    ➕ Ajouter un événement
                  </button>
                </div>
              </div>
            </div>

            <!-- Liste des événements -->
            <div v-if="filteredEvents.length === 0" class="text-center py-8 text-gray-400">
              <span class="text-4xl mb-3 block">📅</span>
              <p v-if="events.length === 0">Aucun événement créé pour cette saison</p>
              <p v-else-if="searchTerm.trim()">Aucun événement ne correspond à la recherche "{{ searchTerm }}"</p>
              <p v-else>Aucun événement ne correspond aux filtres sélectionnés</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="event in filteredEvents"
                :key="event.id"
                class="bg-gray-700/50 rounded-lg p-4 cursor-pointer hover:bg-gray-600/50 transition-colors"
                @click="openEventDetails(event)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-white">{{ event.title }}</h3>
                    <p class="text-gray-400 text-sm">{{ formatDate(event.date) }}</p>
                    <p v-if="event.description" class="text-gray-300 text-sm mt-1">{{ event.description }}</p>
                    <div class="flex items-center gap-2 mt-2">
                      <span 
                        :class="event.archived ? 'bg-orange-600' : 'bg-green-600'"
                        class="px-2 py-1 text-xs rounded-full text-white"
                      >
                        {{ event.archived ? 'Inactif' : 'Actif' }}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      @click.stop="editEvent(event)"
                      class="px-3 py-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                      title="Modifier cet événement"
                    >
                      ✏️
                    </button>
                    <button
                      @click.stop="toggleEventArchive(event)"
                      class="px-3 py-1.5 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg transition-all duration-200"
                      :title="event.archived ? 'Activer' : 'Désactiver'"
                    >
                      {{ event.archived ? '📤' : '📦' }}
                    </button>
                    <button
                      @click.stop="deleteEvent(event)"
                      class="px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      title="Supprimer cet événement"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </div>

            <!-- Onglet Participants -->
            <div v-if="activeTab === 'users'" class="space-y-6">
              <!-- Section Participants et Invitations -->
              <div>
                <div class="mb-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <h2 class="text-2xl font-bold text-white mb-2">🏃‍♂️ Participants de la saison</h2>
                      <p class="text-gray-300">
                        Gestion des participants actifs et des invitations en cours
                      </p>
                    </div>
                    <button
                      @click="showCreateInviteModal = true"
                      class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      Créer & Inviter
                    </button>
                  </div>
                </div>


                <!-- Filtre de recherche -->
                <div class="mb-6 space-y-4">
                  <!-- Barre de recherche -->
                  <div class="relative">
                    <input
                      v-model="searchFilter"
                      type="text"
                      placeholder="Rechercher par nom ou email..."
                      class="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  
                  <!-- Filtres par type -->
                  <div class="flex gap-2">
                    <button
                      @click="filterType = 'all'"
                      :class="filterType === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
                      class="px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      Tous
                    </button>
                    <button
                      @click="filterType = 'users'"
                      :class="filterType === 'users' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
                      class="px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      Participants
                    </button>
                    <button
                      @click="filterType = 'invitations'"
                      :class="filterType === 'invitations' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
                      class="px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      Invitations
                    </button>
                    <button
                      @click="filterType = 'admins'"
                      :class="filterType === 'admins' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
                      class="px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      Admins
                    </button>
                  </div>
                </div>

                <!-- Liste unifiée des utilisateurs et invitations -->
                <div v-if="filteredUsersList.length === 0" class="text-center py-8 text-gray-400">
                  <span class="text-4xl mb-3 block">🔍</span>
                  <p v-if="searchFilter || filterType !== 'all'">Aucun résultat trouvé</p>
                  <p v-else>Aucun participant ou invitation dans cette saison</p>
                  <p class="text-sm mt-2" v-if="!searchFilter && filterType === 'all'">Utilise le bouton "Créer & Inviter" pour commencer</p>
                </div>

                <div v-else class="space-y-3">
                  <div
                    v-for="item in filteredUsersList"
                    :key="item.id"
                    class="bg-gray-700/50 rounded-lg p-4"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-3">
                          <!-- Icône pour les invitations seulement (les utilisateurs ont PlayerAvatar) -->
                          <span v-if="item.type === 'invitation'" class="text-2xl">
                            {{ getInvitationIcon(item.status) }}
                          </span>
                          
                          <div class="flex-1">
                            <!-- Nom du participant (joueur) avec avatar -->
                            <div class="flex items-center gap-3">
                              <!-- Avatar du joueur -->
                              <PlayerAvatar
                                :player-id="getPlayerId(item)"
                                :season-id="seasonId"
                                :player-name="getPlayerName(item)"
                                :player-gender="getPlayerGender(item)"
                                size="sm"
                                rounded="full"
                              />
                              
                              <!-- Nom du joueur à côté de l'avatar -->
                              <div class="text-white font-medium">
                                {{ getPlayerName(item) }}
                              </div>
                              
                              <!-- Actions pour les utilisateurs actifs -->
                              <div v-if="item.type === 'user'" class="flex items-center gap-3 ml-auto">
                                <!-- Email de l'utilisateur -->
                                <span class="text-sm text-gray-400">
                                  {{ getPlayerEmail(item) }}
                                </span>
                                <!-- Date de dernière connexion -->
                                <span class="text-xs text-gray-500">
                                  {{ getLastConnectionText(item) }}
                                </span>
                                <!-- Switch Admin -->
                                <label class="flex items-center gap-2">
                                  <span class="text-sm text-gray-300">Admin</span>
                                  <div class="relative">
                                    <input
                                      type="checkbox"
                                      :checked="item.isAdmin"
                                      @change="handleMakeAdmin(item.email, $event.target.checked)"
                                      class="sr-only"
                                    />
                                    <div 
                                      :class="[
                                        'w-11 h-6 rounded-full transition-colors duration-200 ease-in-out',
                                        item.isAdmin ? 'bg-blue-600' : 'bg-gray-600'
                                      ]"
                                    >
                                      <div 
                                        :class="[
                                          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out',
                                          item.isAdmin ? 'transform translate-x-5' : 'transform translate-x-0'
                                        ]"
                                      ></div>
                                    </div>
                                  </div>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Actions selon le type et statut -->
                      <div class="flex items-center gap-2 ml-4">
                        <!-- Actions pour les invitations -->
                        <template v-if="item.type === 'invitation'">
                          <!-- Copier le lien -->
                          <button
                            @click="copyInviteLink(item.id)"
                            class="p-2 text-gray-400 hover:text-white transition-colors"
                            :title="'Copier le lien d\'invitation'"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                          </button>
                          
                          <!-- Renvoyer (si pending ou expired) -->
                          <button
                            v-if="item.status === 'pending' || item.status === 'expired'"
                            @click="handleResendInvite(item.id)"
                            class="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                            :title="'Renvoyer l\'invitation'"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                          </button>
                          
                          <!-- Révoquer (si pending ou expired) -->
                          <button
                            v-if="item.status === 'pending' || item.status === 'expired'"
                            @click="handleRevokeInvite(item.id)"
                            class="p-2 text-red-400 hover:text-red-300 transition-colors"
                            :title="'Révoquer l\'invitation'"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                          
                          <!-- Supprimer définitivement -->
                          <button
                            @click="handleDeleteInvitation(item.id)"
                            class="p-2 text-gray-400 hover:text-red-400 transition-colors"
                            :title="'Supprimer définitivement l\'invitation'"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </template>
                        
                        <!-- Actions pour les utilisateurs actifs -->
                        <template v-else-if="item.type === 'user'">
                          <!-- Pas d'actions pour l'instant, juste le switcher admin -->
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <ModalManager
      :show-account-login="showAccountLogin"
      :show-account-creation="showAccountCreation"
      :show-account-menu="showAccountMenu"
      :show-preferences="showPreferences"
      :show-players="showPlayers"
      :show-development-modal="showDevelopmentModal"
      @post-login-navigation="handlePostLoginNavigation"
      @account-created="handlePostLoginNavigation"
      @open-help="() => {}"
      @logout="handleLogout"
      @close-account-login="showAccountLogin = false"
      @close-account-creation="showAccountCreation = false"
      @close-account-menu="showAccountMenu = false"
      @close-preferences="showPreferences = false"
      @close-players="showPlayers = false"
      @close-development-modal="showDevelopmentModal = false"
    />

    <!-- Modal de création d'invitation -->
    <CreateInviteModal
      :show="showCreateInviteModal"
      :season-id="seasonId"
      :season-name="seasonName"
      :created-by="currentUser?.email || 'system'"
      @close="showCreateInviteModal = false"
      @invitation-created="handleInvitationCreated"
    />

    <!-- Modal d'ajout d'admin -->
    <div
      v-if="showAddAdminModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showAddAdminModal = false"
    >
      <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold text-white mb-4">Ajouter un admin</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Adresse email
            </label>
            <input
              v-model="newAdminEmail"
              type="email"
              placeholder="admin@example.com"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div class="flex gap-3">
            <button
              @click="addAdmin"
              :disabled="!newAdminEmail || isLoading"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isLoading ? 'Ajout...' : 'Ajouter' }}
            </button>
            <button
              @click="showAddAdminModal = false"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout d'utilisateur -->
    <div
      v-if="showAddUserModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showAddUserModal = false"
    >
      <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold text-white mb-4">Ajouter un utilisateur</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Adresse email
            </label>
            <input
              v-model="newUserEmail"
              type="email"
              placeholder="user@example.com"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div class="flex gap-3">
            <button
              @click="addUser"
              :disabled="!newUserEmail || isLoading"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isLoading ? 'Ajout...' : 'Ajouter' }}
            </button>
            <button
              @click="showAddUserModal = false"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- EventModal pour créer/éditer des événements -->
    <EventModal
      :mode="'create'"
      :is-visible="showAddEventModal"
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


    <!-- Modales partagées -->
    <SeasonDeleteConfirmationModal
      :show="showDeleteConfirmationModal"
      :season="seasonToDelete"
      @confirm="confirmSeasonDelete"
      @cancel="cancelSeasonDelete"
    />

    <SeasonEditModal
      :show="showSeasonEditModal"
      :season="seasonInfo"
      :is-connected="!!currentUser"
      @save="handleSeasonEditSave"
      @cancel="cancelSeasonEdit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getFirebaseAuth } from '../services/firebase.js'
import { currentUser } from '../services/authState.js'
import { signOut } from 'firebase/auth'
import permissionService from '../services/permissionService.js'
// seasonRoleService fusionné dans permissionService
import logger from '../services/logger.js'
import SeasonHeader from '../components/SeasonHeader.vue'
import ModalManager from '../components/ModalManager.vue'
import EventModal from '../components/EventModal.vue'
import SeasonCard from '../components/SeasonCard.vue'
import SeasonDeleteConfirmationModal from '../components/SeasonDeleteConfirmationModal.vue'
import SeasonEditModal from '../components/SeasonEditModal.vue'
import CreateInviteModal from '../components/CreateInviteModal.vue'
import PlayerAvatar from '../components/PlayerAvatar.vue'
import { loadEvents, saveEvent, updateEvent, deleteEvent as deleteEventService, loadPlayers, countAvailabilities } from '../services/storage.js'
import firestoreService from '../services/firestoreService.js'
import { updateSeason, getSeasons, exportSeasonAvailabilitiesCsv, deleteSeasonDirect } from '../services/seasons.js'
import { uploadImage, deleteImage, isFirebaseStorageUrl } from '../services/imageUpload.js'
import { migratePlayerProtectionToPlayers } from '../services/players.js'
import { 
  listUsersWithInviteStatus, 
  resendInvite, 
  revokeInvite, 
  getShareableInviteLink,
  linkExistingUserToSeasonAndPlayers
} from '../services/users.js'

// Props et route
const router = useRouter()
const route = useRoute()
const seasonSlug = computed(() => route.params.slug)
const seasonId = ref(null)
const seasonName = ref('')
const seasonInfo = ref(null)

// État d'authentification
const auth = getFirebaseAuth()

// Modales
const showAccountLogin = ref(false)
const showAccountCreation = ref(false)
const showAccountMenu = ref(false)
const showPreferences = ref(false)
const showPlayers = ref(false)
const showDevelopmentModal = ref(false)

// Gestion des rôles
const seasonAdmins = ref([])
const seasonUsers = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

// Gestion des onglets
const activeTab = ref('info')

// Gestion des événements
const events = ref([])
const showAddEventModal = ref(false)
const editingEvent = ref(null)

// Gestion des utilisateurs et invitations
const usersWithPlayers = ref([])
const unifiedUsersList = ref([])
// showUserActionsDropdown supprimé - plus utilisé avec le nouveau switcher
const showAddAdminModal = ref(false)
const showAddUserModal = ref(false)
const showCreateInviteModal = ref(false)
const newAdminEmail = ref('')
const newUserEmail = ref('')
const usersLoaded = ref(false)


// Statistiques
const players = ref([])
const availabilitiesCount = ref(0)
const totalEventsCount = ref(0)

// Filtres pour les événements
const showInactiveEvents = ref(false)
const showPastEvents = ref(false)
const showFiltersDropdown = ref(false)

// Variables pour le feedback des changements de rôles
const roleChangeSuccess = ref(null)
const searchTerm = ref('')

// Variables pour le filtre des participants
const searchFilter = ref('')
const filterType = ref('all') // 'all', 'users', 'invitations'

// Gestion de l'édition de saison
const showSeasonEditModal = ref(false)
const showDeleteConfirmationModal = ref(false)
const seasonToDelete = ref(null)

// Gestion de la migration
const isMigrationRunning = ref(false)
const migrationStatus = ref(null)

// Événements filtrés selon les critères
const filteredEvents = computed(() => {
  if (!events.value || events.value.length === 0) return []
  
  return events.value.filter(event => {
    const eventDate = new Date(event.date)
    const isInactive = !!event.archived
    const isPast = eventDate < new Date()
    
    // Par défaut : afficher les événements futurs actifs
    let shouldShow = !isInactive && !isPast
    
    // Si on coche "Inactifs", ajouter les événements inactifs
    if (showInactiveEvents.value) {
      shouldShow = shouldShow || isInactive
    }
    
    // Si on coche "Passés", ajouter les événements passés
    if (showPastEvents.value) {
      shouldShow = shouldShow || isPast
    }
    
    // Filtrage par terme de recherche
    if (searchTerm.value.trim()) {
      const searchLower = searchTerm.value.toLowerCase().trim()
      const titleMatch = event.title?.toLowerCase().includes(searchLower) || false
      const descriptionMatch = event.description?.toLowerCase().includes(searchLower) || false
      
      // Si aucun match sur le nom ou la description, exclure l'événement
      if (!titleMatch && !descriptionMatch) {
        shouldShow = false
      }
    }
    
    return shouldShow
  })
})

// Computed
const totalMembers = computed(() => seasonAdmins.value.length + seasonUsers.value.length)
const playersCount = computed(() => players.value.length)

const seasonCardData = computed(() => ({
  ...seasonInfo.value,
  id: seasonSlug.value,
  slug: seasonSlug.value,
  eventsCount: events.value.length,
  playersCount: playersCount.value,
  availabilitiesCount: availabilitiesCount.value
}))

// Liste filtrée des participants
const filteredUsersList = computed(() => {
  let filtered = unifiedUsersList.value

  // Filtre par type
  if (filterType.value !== 'all') {
    if (filterType.value === 'users') {
      // Filtrer pour les utilisateurs actifs
      filtered = filtered.filter(item => item.type === 'user')
    } else if (filterType.value === 'invitations') {
      // Filtrer pour les invitations
      filtered = filtered.filter(item => item.type === 'invitation')
    } else if (filterType.value === 'admins') {
      // Filtrer pour les admins (utilisateurs avec rôle admin)
      filtered = filtered.filter(item => item.type === 'user' && item.isAdmin)
    }
  }

  // Filtre par recherche
  if (searchFilter.value.trim()) {
    const search = searchFilter.value.toLowerCase().trim()
    filtered = filtered.filter(item => {
      const name = getPlayerName(item).toLowerCase()
      const email = getPlayerEmail(item).toLowerCase()
      return name.includes(search) || email.includes(search)
    })
  }

  return filtered
})

// Fonctions de navigation
function goBack() {
  router.push(`/season/${seasonSlug.value}`)
}

// Changer vers l'onglet utilisateurs et charger les données si nécessaire
async function switchToUsersTab() {
  activeTab.value = 'users'
  await ensureUsersLoaded()
}

// Charger les informations de la saison
async function loadSeasonInfo() {
  try {
    const seasons = await getSeasons()
    const currentSeason = seasons.find(s => s.id === seasonId.value || s.slug === seasonSlug.value)
    if (currentSeason) {
      // Définir le vrai ID de la saison
      seasonId.value = currentSeason.id
      
      // Charger les données complètes de la saison (comme dans SeasonsPage)
      const [eventsData, playersData] = await Promise.all([
        loadEvents(currentSeason.id),
        loadPlayers(currentSeason.id)
      ])
      
      // Filtrer les événements actifs pour le comptage
      const activeEvents = (eventsData || []).filter(event => !event.archived)
      
      // Compter les disponibilités
      const availabilitiesTotal = await countAvailabilities(currentSeason.id)
      
      // Stocker toutes les données
      seasonInfo.value = {
        ...currentSeason,
        events: activeEvents,
        players: playersData || []
      }
      seasonName.value = currentSeason.name
      
      // Mettre à jour les variables pour les statistiques
      events.value = activeEvents
      players.value = playersData || []
      availabilitiesCount.value = availabilitiesTotal
      totalEventsCount.value = eventsData?.length || 0
      
      
      logger.info(`Informations de la saison chargées: ${activeEvents.length} événements actifs, ${totalEventsCount.value} événements total (${totalEventsCount.value - activeEvents.length} inactifs), ${playersData?.length || 0} joueurs, ${availabilitiesTotal} disponibilités`)
    } else {
      logger.error('Saison introuvable:', seasonSlug.value)
      errorMessage.value = 'Saison introuvable'
    }
  } catch (error) {
    logger.error('Erreur lors du chargement des informations de la saison:', error)
  }
}


// Exporter les disponibilités en CSV
async function exportAvailabilities() {
  const season = {
    id: seasonId.value,
    name: seasonInfo.value?.name || seasonName.value,
    slug: seasonSlug.value
  }

  await exportSeasonAvailabilitiesCsv(season, {
    onSuccess: () => {
      showModal('success', 'Export réussi', 'Les disponibilités ont été exportées avec succès !')
    },
    onError: (error) => {
      showModal('error', 'Erreur d\'export', 'Une erreur est survenue lors de l\'export des disponibilités.')
    }
  })
}

// Supprimer la saison
function deleteSeason() {
  seasonToDelete.value = {
    id: seasonId.value,
    name: seasonInfo.value?.name || seasonName.value,
    slug: seasonSlug.value,
    logoUrl: seasonInfo.value?.logoUrl
  }
  showDeleteConfirmationModal.value = true
}

async function confirmSeasonDelete() {
  if (!seasonToDelete.value) return
  
  await deleteSeasonDirect(seasonToDelete.value, {
    onSuccess: () => {
      showModal('success', 'Saison supprimée', 'La saison a été supprimée avec succès.')
      // Rediriger vers la liste des saisons
      router.push('/seasons')
    },
    onError: (error) => {
      showModal('error', 'Erreur de suppression', 'Une erreur est survenue lors de la suppression de la saison.')
    }
  })
}

function cancelSeasonDelete() {
  showDeleteConfirmationModal.value = false
  seasonToDelete.value = null
}

// Charger les utilisateurs avec leurs joueurs protégés (si pas déjà chargé)
async function ensureUsersLoaded() {
  if (usersLoaded.value) {
    logger.debug('Utilisateurs déjà chargés, pas de rechargement nécessaire')
    return
  }
  
  await loadUnifiedUsersList()
  usersLoaded.value = true
}

// Charger les utilisateurs avec leurs joueurs protégés
async function loadUsersWithPlayers() {
  // Déclarer les variables en dehors du try/catch pour y accéder dans le catch
  let playersData = null
  
  try {
    logger.debug('🚀 Début de loadUsersWithPlayers()')
    
    // Utiliser les joueurs déjà chargés dans loadSeasonInfo()
    playersData = players.value
    logger.debug('📊 players.value:', playersData)
    logger.debug(`📊 Nombre de joueurs: ${playersData?.length || 0}`)
    
    if (!playersData || playersData.length === 0) {
      logger.info('Aucun joueur chargé, pas d\'utilisateurs à afficher')
      usersWithPlayers.value = []
      return
    }
    
    // Charger les données de protection des joueurs
    logger.debug('🔐 Chargement des données de protection des joueurs...')
    
    // PRIORITY: Lire d'abord dans la collection players
    const playersFromDb = await firestoreService.getDocuments('seasons', seasonId.value, 'players')
    const protectedPlayers = playersFromDb.filter(player => player.email && player.isProtected !== false)
    
    let protectionData = protectedPlayers.map(player => ({
      playerId: player.id,
      email: player.email,
      isProtected: player.isProtected !== false,
      firebaseUid: player.firebaseUid || null,
      photoURL: player.photoURL || null,
      emailVerifiedAt: player.emailVerifiedAt || null,
      createdAt: player.createdAt || null,
      updatedAt: player.updatedAt || null
    }))
    
    // Note: Toutes les données de protection sont maintenant dans la collection players
    
    logger.debug('🔐 Données de protection chargées:', protectionData)
    
    // Créer une map des protections par playerId
    const protectionMap = new Map()
    protectionData.forEach(protection => {
      protectionMap.set(protection.playerId, protection)
    })
    logger.debug(`🔐 ${protectionMap.size} joueurs avec données de protection`)
    
    // Enrichir les joueurs avec leurs données de protection
    const enrichedPlayers = playersData.map(player => {
      const protection = protectionMap.get(player.id)
      return {
        ...player,
        email: protection?.email || null,
        protected: protection?.isProtected || false,
        firebaseUid: protection?.firebaseUid || null
      }
    })
    
    logger.debug('🔍 Joueurs enrichis avec données de protection:')
    enrichedPlayers.forEach((player, index) => {
      logger.debug(`  Joueur ${index + 1}:`, {
        id: player.id,
        name: player.name,
        email: player.email || 'AUCUN EMAIL',
        protected: player.protected,
        hasEmail: !!player.email,
        isProtected: !!player.protected
      })
    })
    
    logger.debug('🔍 seasonAdmins.value:', seasonAdmins.value)
    logger.debug(`🔍 Nombre d'admins: ${seasonAdmins.value?.length || 0}`)
    logger.debug('🔍 Type de seasonAdmins.value:', typeof seasonAdmins.value)
    logger.debug('🔍 Premier élément de seasonAdmins:', seasonAdmins.value?.[0])
    logger.debug('🔍 Type du premier élément:', typeof seasonAdmins.value?.[0])
    
    // Grouper les joueurs par utilisateur (email)
    logger.debug('🔄 Début du groupement des joueurs par email')
    const userMap = new Map()
    let playersWithEmail = 0
    let protectedPlayersCount = 0
    
    enrichedPlayers.forEach((player, index) => {
      logger.debug(`🔄 Traitement du joueur ${index + 1}/${enrichedPlayers.length}:`, {
        id: player.id,
        name: player.name,
        email: player.email,
        protected: player.protected
      })
      
      if (player.email) {
        playersWithEmail++
        if (player.protected) protectedPlayersCount++
        
        logger.debug(`📧 Joueur avec email trouvé: ${player.email}, protégé: ${player.protected}`)
        
        if (!userMap.has(player.email)) {
          logger.debug(`🆕 Nouvel utilisateur créé pour: ${player.email}`)
          const isAdmin = (seasonAdmins.value || []).includes(player.email)
          logger.debug(`👑 ${player.email} est admin: ${isAdmin}`)
          
          userMap.set(player.email, {
            email: player.email,
            players: [],
            isAdmin: isAdmin
          })
        }
        
        const user = userMap.get(player.email)
        user.players.push({
          id: player.id,
          name: player.name,
          protected: player.protected || false
        })
        logger.debug(`➕ Joueur ajouté à l'utilisateur ${player.email}`)
      } else {
        logger.debug(`❌ Joueur sans email ignoré: ${player.name}`)
      }
    })
    
    logger.debug(`📊 Résumé du groupement: ${playersWithEmail} joueurs avec email, ${protectedPlayersCount} joueurs protégés`)
    logger.debug(`📊 Nombre d'utilisateurs uniques: ${userMap.size}`)
    
    // Filtrer pour ne garder que les utilisateurs avec des joueurs protégés
    logger.debug('🔍 Début du filtrage des utilisateurs avec joueurs protégés')
    const allUsers = Array.from(userMap.values())
    logger.debug('👥 Tous les utilisateurs:', allUsers)
    
    const usersWithProtectedPlayers = allUsers.filter(user => {
      const hasProtected = user.players.some(player => player.protected)
      const protectedPlayers = user.players.filter(player => player.protected)
      logger.debug(`🔍 Utilisateur ${user.email}: ${user.players.length} joueurs total, ${protectedPlayers.length} joueurs protégés`)
      logger.debug(`  Joueurs protégés:`, protectedPlayers.map(p => ({ name: p.name, protected: p.protected })))
      return hasProtected
    })
    
    logger.debug(`🔍 Utilisateurs avec joueurs protégés: ${usersWithProtectedPlayers.length}`)
    
    usersWithPlayers.value = usersWithProtectedPlayers.sort((a, b) => a.email.localeCompare(b.email))
    
    logger.info(`✅ ${usersWithPlayers.value.length} utilisateurs avec joueurs protégés trouvés sur ${allUsers.length} utilisateurs total`)
    logger.debug('✅ loadUsersWithPlayers() terminé avec succès')
    
  } catch (error) {
    logger.error('❌ Erreur détaillée dans loadUsersWithPlayers():', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    })
    logger.error('❌ Contexte de l\'erreur:', {
      playersDataLength: playersData?.length,
      seasonAdminsLength: seasonAdmins.value?.length,
      usersWithPlayersLength: usersWithPlayers.value?.length
    })
    errorMessage.value = 'Erreur lors du chargement des utilisateurs'
  }
}

// ===== FONCTIONS DE GESTION DES INVITATIONS =====

/**
 * Charger la liste unifiée des utilisateurs et invitations
 */
async function loadUnifiedUsersList() {
  try {
    logger.debug('Chargement de la liste unifiée des utilisateurs et invitations')
    unifiedUsersList.value = await listUsersWithInviteStatus(seasonId.value)
    logger.info(`Liste unifiée chargée: ${unifiedUsersList.value.length} éléments`)
  } catch (error) {
    logger.error('Erreur lors du chargement de la liste unifiée', error)
    errorMessage.value = 'Erreur lors du chargement des utilisateurs et invitations'
  }
}

/**
 * Gérer la création d'une invitation
 */
async function handleInvitationCreated() {
  await loadUnifiedUsersList()
  logger.info('Liste unifiée mise à jour après création d\'invitation')
}

/**
 * Obtenir l'icône pour une invitation selon son statut
 */
function getInvitationIcon(status) {
  switch (status) {
    case 'pending': return '📧'
    case 'accepted': return '✅'
    case 'expired': return '⏰'
    case 'revoked': return '❌'
    default: return '📧'
  }
}

/**
 * Obtenir la classe CSS pour le statut
 */
function getStatusClass(item) {
  if (item.type === 'user') {
    return 'bg-green-600/20 text-green-300'
  }
  
  switch (item.status) {
    case 'pending': return 'bg-blue-600/20 text-blue-300'
    case 'accepted': return 'bg-green-600/20 text-green-300'
    case 'expired': return 'bg-orange-600/20 text-orange-300'
    case 'revoked': return 'bg-red-600/20 text-red-300'
    default: return 'bg-gray-600/20 text-gray-400'
  }
}

/**
 * Obtenir le texte du statut
 */
function getStatusText(item) {
  if (item.type === 'user') {
    return 'Actif'
  }
  
  switch (item.status) {
    case 'pending': return 'Invité'
    case 'accepted': return 'Accepté'
    case 'expired': return 'Expiré'
    case 'revoked': return 'Révoqué'
    default: return 'Inconnu'
  }
}

/**
 * Obtenir le nom d'un joueur par son ID
 */
function getPlayerNameById(playerId) {
  const player = players.value.find(p => p.id === playerId)
  return player ? player.name : `Joueur ${playerId}`
}

/**
 * Obtenir le nom du participant (joueur) pour l'affichage
 */
function getPlayerName(item) {
  if (item.type === 'user') {
    // Pour un utilisateur actif, chercher le nom du joueur associé
    const player = players.value.find(p => p.id === item.playerId)
    return player ? player.name : `${item.firstName} ${item.lastName}`
  } else {
    // Pour une invitation, utiliser les informations de l'invitation
    return `${item.firstName} ${item.lastName}`
  }
}

/**
 * Obtenir le nom d'affichage principal (pour le titre)
 */
function getPlayerDisplayName(item) {
  if (item.type === 'user') {
    // Pour un utilisateur actif, chercher le nom du joueur associé
    const player = players.value.find(p => p.id === item.playerId)
    return player ? player.name : `${item.firstName} ${item.lastName}`
  } else {
    // Pour une invitation, utiliser les informations de l'invitation
    return `${item.firstName} ${item.lastName}`
  }
}

/**
 * Obtenir l'ID du joueur
 */
function getPlayerId(item) {
  if (item.type === 'user') {
    // Pour un utilisateur actif, retourner l'ID du joueur associé
    return item.playerId || null
  } else {
    // Pour une invitation, on n'a pas encore d'ID de joueur
    return null
  }
}

/**
 * Obtenir l'email du participant
 */
function getPlayerEmail(item) {
  if (item.type === 'user') {
    return item.email
  } else {
    return item.email
  }
}

/**
 * Obtenir le texte de dernière connexion
 */
function getLastConnectionText(item) {
  if (item.type !== 'user') {
    return ''
  }
  
  // Pour l'instant, on affiche une valeur par défaut
  // TODO: Récupérer la vraie date de dernière connexion depuis Firebase Auth
  if (item.lastActiveAt) {
    const date = new Date(item.lastActiveAt)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Aujourd\'hui'
    } else if (diffDays === 1) {
      return 'Hier'
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    }
  }
  
  return 'Jamais connecté'
}


/**
 * Obtenir le genre du joueur pour PlayerAvatar
 */
function getPlayerGender(item) {
  if (item.type === 'user') {
    // Pour un utilisateur actif, chercher le genre du joueur associé
    const player = players.value.find(p => p.id === item.playerId)
    return player?.gender || 'non-specified'
  } else {
    // Pour une invitation, utiliser le genre de l'invitation
    return item.gender || 'non-specified'
  }
}


/**
 * Copier le lien d'invitation
 */
async function copyInviteLink(invitationId) {
  try {
    const link = await getShareableInviteLink(invitationId)
    await navigator.clipboard.writeText(link)
    logger.info('Lien d\'invitation copié dans le presse-papiers')
    // TODO: Afficher un message de succès
  } catch (error) {
    logger.error('Erreur lors de la copie du lien', error)
    errorMessage.value = 'Erreur lors de la copie du lien'
  }
}

/**
 * Renvoyer une invitation
 */
async function handleResendInvite(invitationId) {
  try {
    isLoading.value = true
    await resendInvite(invitationId)
    await loadUnifiedUsersList()
    logger.info('Invitation renvoyée avec succès')
    errorMessage.value = ''
  } catch (error) {
    logger.error('Erreur lors du renvoi de l\'invitation', error)
    errorMessage.value = 'Erreur lors du renvoi de l\'invitation'
  } finally {
    isLoading.value = false
  }
}

/**
 * Révoquer une invitation
 */
async function handleRevokeInvite(invitationId) {
  if (!confirm('Êtes-vous sûr de vouloir révoquer cette invitation ?')) return
  
  try {
    isLoading.value = true
    await revokeInvite(invitationId)
    await loadUnifiedUsersList()
    logger.info('Invitation révoquée avec succès')
    errorMessage.value = ''
  } catch (error) {
    logger.error('Erreur lors de la révocation de l\'invitation', error)
    errorMessage.value = 'Erreur lors de la révocation de l\'invitation'
  } finally {
    isLoading.value = false
  }
}

/**
 * Supprimer définitivement une invitation
 */
async function handleDeleteInvitation(invitationId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cette invitation ?')) {
    return
  }
  
  try {
    isLoading.value = true
    await firestoreService.deleteDocument('invitations', invitationId)
    await loadUnifiedUsersList()
    logger.info('Invitation supprimée avec succès')
    errorMessage.value = ''
  } catch (error) {
    logger.error('Erreur lors de la suppression de l\'invitation', error)
    errorMessage.value = 'Erreur lors de la suppression de l\'invitation'
  } finally {
    isLoading.value = false
  }
}

/**
 * Gérer l'attribution/révocation du rôle admin
 */
async function handleMakeAdmin(userEmail, makeAdmin) {
  if (!confirm(makeAdmin ? 
    `Êtes-vous sûr de vouloir donner le rôle admin à ${userEmail} ?` :
    `Êtes-vous sûr de vouloir retirer le rôle admin à ${userEmail} ?`)) {
    return
  }
  
  try {
    isLoading.value = true
    
    if (makeAdmin) {
      await permissionService.addSeasonAdmin(seasonId.value, userEmail, currentUser.value.email)
      logger.info(`Rôle admin accordé à ${userEmail}`)
    } else {
      await permissionService.removeSeasonAdmin(seasonId.value, userEmail, currentUser.value.email)
      logger.info(`Rôle admin retiré à ${userEmail}`)
    }
    
    // Recharger les données
    await loadSeasonRoles()
    await loadUnifiedUsersList()
    
    logger.info('🔐 Rôles mis à jour avec succès')
  } catch (error) {
    logger.error('Erreur lors de la modification du rôle admin:', error)
    alert('Erreur lors de la modification du rôle admin')
  } finally {
    isLoading.value = false
  }
}

function openAccountMenu() {
  showAccountMenu.value = true
}

function openHelp() {
  // TODO: Implémenter l'aide
}

function openPreferences() {
  showPreferences.value = true
}

function openPlayers() {
  showPlayers.value = true
}

function openAccount() {
  showAccountLogin.value = true
}

function openAccountCreation() {
  showAccountCreation.value = true
}

function openDevelopment() {
  showDevelopmentModal.value = true
}

async function handleLogout() {
  try {
    await signOut(auth)
    router.push('/')
  } catch (error) {
    logger.error('Erreur lors de la déconnexion:', error)
  }
}

function handlePostLoginNavigation() {
  // Rediriger vers la page admin après connexion
  router.push(`/season/${seasonSlug.value}/admin`)
}

// Fonctions de gestion des rôles

async function loadSeasonRoles() {
  try {
    isLoading.value = true
    const roles = await permissionService.listSeasonRoles(seasonId.value)
    seasonAdmins.value = roles.admins
    seasonUsers.value = roles.users
  } catch (error) {
    logger.error('Erreur lors du chargement des rôles:', error)
  } finally {
    isLoading.value = false
  }
}

async function addAdmin() {
  if (!newAdminEmail.value.trim()) return
  
  try {
    isLoading.value = true
    errorMessage.value = '' // Effacer les erreurs précédentes
    
    await permissionService.addSeasonAdmin(seasonId.value, newAdminEmail.value.trim(), currentUser.value?.email || 'system')
    await loadSeasonRoles()
    
    const email = newAdminEmail.value.trim()
    newAdminEmail.value = ''
    showAddAdminModal.value = false
    
    logger.info(`✅ Admin ${email} ajouté avec succès`)
  } catch (error) {
    logger.error('Erreur lors de l\'ajout de l\'admin:', error)
    
    // Afficher un message d'erreur utilisateur
    if (error.code === 'not-found') {
      errorMessage.value = 'Erreur : La saison n\'existe pas dans la base de données. Veuillez réessayer.'
    } else if (error.code === 'permission-denied') {
      errorMessage.value = 'Erreur : Vous n\'avez pas les permissions pour effectuer cette action.'
    } else {
      errorMessage.value = `Erreur lors de l'ajout de l'admin : ${error.message || 'Erreur inconnue'}`
    }
  } finally {
    isLoading.value = false
  }
}

async function removeAdmin(adminEmail) {
  if (!confirm(`Êtes-vous sûr de vouloir retirer ${adminEmail} des admins ?`)) return
  
  try {
    isLoading.value = true
    await permissionService.removeSeasonAdmin(seasonId.value, adminEmail, currentUser.value?.email || 'system')
    await loadSeasonRoles()
    logger.info(`Admin ${adminEmail} retiré avec succès`)
  } catch (error) {
    logger.error('Erreur lors du retrait de l\'admin:', error)
  } finally {
    isLoading.value = false
  }
}

async function addUser() {
  if (!newUserEmail.value.trim()) return
  
  try {
    isLoading.value = true
    await permissionService.addSeasonUser(seasonId.value, newUserEmail.value.trim(), currentUser.value?.email || 'system')
    await loadSeasonRoles()
    newUserEmail.value = ''
    showAddUserModal.value = false
    logger.info(`Utilisateur ${newUserEmail.value} ajouté avec succès`)
  } catch (error) {
    logger.error('Erreur lors de l\'ajout de l\'utilisateur:', error)
  } finally {
    isLoading.value = false
  }
}

async function removeUser(userEmail) {
  if (!confirm(`Êtes-vous sûr de vouloir retirer ${userEmail} des utilisateurs ?`)) return
  
  try {
    isLoading.value = true
    await permissionService.removeSeasonUser(seasonId.value, userEmail, currentUser.value?.email || 'system')
    await loadSeasonRoles()
    logger.info(`Utilisateur ${userEmail} retiré avec succès`)
  } catch (error) {
    logger.error('Erreur lors du retrait de l\'utilisateur:', error)
  } finally {
    isLoading.value = false
  }
}

// Fonctions de gestion des événements

async function loadSeasonEvents() {
  try {
    isLoading.value = true
    const loadedEvents = await loadEvents(seasonId.value)
    events.value = loadedEvents || []
    logger.info(`Événements chargés: ${events.value.length}`)
  } catch (error) {
    logger.error('Erreur lors du chargement des événements:', error)
    errorMessage.value = 'Erreur lors du chargement des événements'
  } finally {
    isLoading.value = false
  }
}

function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

function editEvent(event) {
  editingEvent.value = event
}

function openEventDetails(event) {
  // Ouvrir la page de l'événement dans un nouvel onglet
  const eventUrl = `/season/${seasonSlug.value}?event=${event.id}&modal=event_details`
  window.open(eventUrl, '_blank')
}

// Handlers pour EventModal
async function handleCreateEvent(eventData) {
  try {
    isLoading.value = true
    await saveEvent(eventData, seasonId.value)
    logger.info('Nouvel événement créé avec succès')
    await loadSeasonEvents()
    showAddEventModal.value = false
    errorMessage.value = ''
  } catch (error) {
    logger.error('Erreur lors de la création de l\'événement:', error)
    errorMessage.value = 'Erreur lors de la création de l\'événement'
  } finally {
    isLoading.value = false
  }
}

async function handleEditEvent(eventData) {
  try {
    isLoading.value = true
    await updateEvent(editingEvent.value.id, eventData, seasonId.value)
    logger.info(`Événement ${editingEvent.value.id} modifié avec succès`)
    await loadSeasonEvents()
    editingEvent.value = null
    errorMessage.value = ''
  } catch (error) {
    logger.error('Erreur lors de la modification de l\'événement:', error)
    errorMessage.value = 'Erreur lors de la modification de l\'événement'
  } finally {
    isLoading.value = false
  }
}

function cancelNewEvent() {
  showAddEventModal.value = false
}

function cancelEdit() {
  editingEvent.value = null
}

// Fonctions pour l'édition de saison
function cancelSeasonEdit() {
  showSeasonEditModal.value = false
}

async function handleSeasonEditSave(updates) {
  if (!seasonInfo.value) return
  
  try {
    isLoading.value = true
    
    // Si un nouveau logo a été sélectionné, l'uploader
    if (updates.logoFile) {
      try {
        logger.info('Upload du nouveau logo...')
        const logoUrl = await uploadImage(updates.logoFile, `season-logos/${seasonInfo.value.id}`, {
          resize: true,
          maxWidth: 64,
          maxHeight: 64,
          quality: 0.6
        })
        updates.logoUrl = logoUrl
        
        // Supprimer l'ancien logo s'il existe
        if (seasonInfo.value.logoUrl && isFirebaseStorageUrl(seasonInfo.value.logoUrl)) {
          try {
            await deleteImage(seasonInfo.value.logoUrl)
            logger.info('Ancien logo supprimé')
          } catch (deleteError) {
            logger.warn('Erreur lors de la suppression de l\'ancien logo:', deleteError)
          }
        }
      } catch (uploadError) {
        logger.error('Erreur lors de l\'upload du logo:', uploadError)
        throw new Error('Impossible d\'uploader le logo. Veuillez réessayer.')
      }
    }
    
    // Nettoyer les données avant la mise à jour
    const cleanUpdates = {
      name: updates.name,
      description: updates.description
    }
    if (updates.logoUrl) {
      cleanUpdates.logoUrl = updates.logoUrl
    }
    
    await updateSeason(seasonInfo.value.id, cleanUpdates)
    logger.info('Saison modifiée avec succès')
    
    // Recharger les informations de la saison
    await loadSeasonInfo()
    
    // Fermer la modale
    cancelSeasonEdit()
    errorMessage.value = ''
  } catch (error) {
    logger.error('Erreur lors de la modification de la saison:', error)
    errorMessage.value = 'Erreur lors de la modification de la saison'
  } finally {
    isLoading.value = false
  }
}

function handleLogoFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return
  
  // Vérifier le type de fichier
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Veuillez sélectionner un fichier image'
    return
  }
  
  // Vérifier la taille (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'Le fichier est trop volumineux (max 5MB)'
    return
  }
  
  editSeasonLogo.value = file
  
  // Créer un aperçu
  const reader = new FileReader()
  reader.onload = (e) => {
    editSeasonLogoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function triggerLogoFileInput() {
  logoFileInput.value?.click()
}

// Actions sur les utilisateurs
// Fonctions dropdown supprimées - plus utilisées avec le nouveau switcher

// Fonctions pour les filtres d'événements
function toggleFiltersDropdown() {
  showFiltersDropdown.value = !showFiltersDropdown.value
}

function closeFiltersDropdown() {
  showFiltersDropdown.value = false
}

async function toggleAdminRole(userEmail) {
  const user = usersWithPlayers.value.find(u => u.email === userEmail)
  if (!user) return
  
  try {
    isLoading.value = true
    
    // Debug: vérifier l'état de currentUser
    logger.debug('🔍 État de currentUser:', {
      hasCurrentUser: !!currentUser.value,
      email: currentUser.value?.email,
      uid: currentUser.value?.uid
    })
    
    // Fallback: utiliser l'email de l'utilisateur actuel ou 'system'
    const performedBy = currentUser.value?.email || userEmail || 'system'
    logger.debug('🔍 performedBy utilisé:', performedBy)
    
    if (user.isAdmin) {
      // Retirer le rôle admin
      await permissionService.removeSeasonAdmin(seasonId.value, userEmail, performedBy)
      logger.info(`Rôle admin retiré pour ${userEmail}`)
    } else {
      // Accorder le rôle admin
      await permissionService.addSeasonAdmin(seasonId.value, userEmail, performedBy)
      logger.info(`Rôle admin accordé à ${userEmail}`)
    }
    
    // Recharger les données
    await loadSeasonRoles()
    await loadUnifiedUsersList() // Rechargement forcé après modification
    
    // FORCER le refresh des permissions pour tous les utilisateurs connectés
    // Cela va invalider le cache des rôles et forcer une nouvelle vérification
    logger.info('🔐 Forçage du refresh des permissions après modification de rôle')
    
    // Si l'utilisateur modifié est l'utilisateur actuel, forcer le refresh immédiatement
    if (userEmail === currentUser.value?.email) {
      try {
        // Importer le service de rôles et forcer le refresh
        const { default: roleService } = await import('../services/permissionService.js')
        await permissionService.refreshAllRoles()
        logger.info('🔐 Permissions de l\'utilisateur actuel rafraîchies')
      } catch (roleError) {
        logger.warn('⚠️ Erreur lors du refresh des permissions:', roleError)
      }
    }
    
    errorMessage.value = ''
    
    // Afficher un feedback de succès
    roleChangeSuccess.value = userEmail
    setTimeout(() => {
      roleChangeSuccess.value = null
    }, 2000)
  } catch (error) {
    logger.error('Erreur lors de la modification du rôle admin:', error)
    errorMessage.value = 'Erreur lors de la modification du rôle admin'
  } finally {
    isLoading.value = false
  }
}

async function toggleEventArchive(event) {
  const action = event.archived ? 'activer' : 'désactiver'
  if (!confirm(`Êtes-vous sûr de vouloir ${action} l'événement "${event.title}" ?`)) return
  
  try {
    isLoading.value = true
    await updateEvent(event.id, { archived: !event.archived }, seasonId.value)
    await loadSeasonEvents()
    logger.info(`Événement ${event.id} ${action} avec succès`)
  } catch (error) {
    logger.error(`Erreur lors de l'${action} de l'événement:`, error)
    errorMessage.value = `Erreur lors de l'${action} de l'événement`
  } finally {
    isLoading.value = false
  }
}

async function deleteEvent(event) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'événement "${event.title}" ? Cette action est irréversible.`)) return
  
  try {
    isLoading.value = true
    await deleteEventService(event.id, seasonId.value)
    await loadSeasonEvents()
    logger.info(`Événement ${event.id} supprimé avec succès`)
  } catch (error) {
    logger.error('Erreur lors de la suppression de l\'événement:', error)
    errorMessage.value = 'Erreur lors de la suppression de l\'événement'
  } finally {
    isLoading.value = false
  }
}

// Gestionnaire pour fermer les dropdowns au clic extérieur
function handleClickOutside(event) {
  // Fermer le dropdown des filtres si on clique ailleurs
  if (!event.target.closest('.relative')) {
    closeFiltersDropdown()
  }
}

// Initialisation
onMounted(async () => {
  // Récupérer l'ID de la saison depuis l'URL
  const slug = route.params.slug
  logger.info('🛡️ SeasonAdminPage: Initialisation avec slug:', slug)
  
  // Pour l'instant, utiliser le slug comme ID (à améliorer plus tard)
  seasonId.value = slug
  seasonName.value = `Saison ${slug}`
  
  // Charger les informations de la saison
  await loadSeasonInfo()
  
  // Charger les rôles (les permissions sont déjà vérifiées par le routeur)
  await loadSeasonRoles()
  
  // Charger la liste unifiée des utilisateurs et invitations
  await loadUnifiedUsersList()
  
  // Ajouter l'écouteur pour fermer les dropdowns au clic extérieur
  document.addEventListener('click', handleClickOutside)
})

// Fonction pour exécuter la migration des données de protection
async function runMigration() {
  if (!seasonId.value) {
    migrationStatus.value = { success: false, message: 'Aucune saison sélectionnée' }
    return
  }
  
  try {
    isMigrationRunning.value = true
    migrationStatus.value = null
    
    logger.info('Début de la migration des données de protection', { seasonId: seasonId.value })
    
    const result = await migratePlayerProtectionToPlayers(seasonId.value)
    
    if (result.errors === 0) {
      migrationStatus.value = { 
        success: true, 
        message: `Migration réussie : ${result.migrated} joueurs migrés sur ${result.total}` 
      }
      logger.info('Migration terminée avec succès', result)
    } else {
      migrationStatus.value = { 
        success: false, 
        message: `Migration partielle : ${result.migrated} joueurs migrés, ${result.errors} erreurs` 
      }
      logger.warn('Migration terminée avec des erreurs', result)
    }
  } catch (error) {
    migrationStatus.value = { 
      success: false, 
      message: `Erreur lors de la migration : ${error.message}` 
    }
    logger.error('Erreur lors de la migration', error)
  } finally {
    isMigrationRunning.value = false
  }
}

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
