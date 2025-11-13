<template>
  <div v-if="selectedEvent" class="space-y-2 sm:space-y-4">

    <!-- Affichage de tous les joueurs si pas de rôles définis -->
    <div v-if="availableRoles.length === 0" class="space-y-2">
      <div class="bg-gray-800/50 rounded-lg p-2 sm:p-3 border border-gray-700/50">
        <!-- En-tête -->
        <div class="flex items-center justify-between mb-1 sm:mb-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">👥</span>
            <span class="font-medium text-white">Tous les joueurs</span>
            <span class="text-sm text-gray-400">
              ({{ getAvailablePlayersCount() }}/{{ props.players.length }})
            </span>
          </div>
        </div>

        <!-- Liste de tous les joueurs -->
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-0.5 sm:gap-1.5">
          <div
            v-for="player in props.players"
            :key="player.id"
            class="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-lg border transition-all duration-200 hover:bg-gray-700/50 border-transparent"
          >
            <!-- Avatar du joueur -->
            <div class="relative flex-shrink-0">
              <PlayerAvatar 
                :player-id="player.id"
                :season-id="seasonId"
                :player-name="player.name"
                :player-gender="player.gender || 'non-specified'"
                size="sm"
              />
              <!-- Statuts superposés -->
              <span
                v-if="preferredPlayerIdsSet.has(player.id)"
                class="absolute -top-1 -right-1 text-yellow-400 text-xs bg-gray-900 rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center border border-gray-700"
                title="Ma personne"
              >
                ⭐
              </span>
            </div>

            <!-- Nom du joueur -->
            <span class="text-white text-xs sm:text-sm font-medium flex-1 min-w-0 truncate">
              {{ player.name }}
            </span>

            <!-- Disponibilité du joueur -->
            <div class="flex-shrink-0 w-20 h-20 aspect-square">
              <AvailabilityCell
                :player-name="player.name"
                :event-id="selectedEvent.id"
                :is-available="isAvailable(player.name, selectedEvent.id)"
                :is-selected="isPlayerSelected(player.name, selectedEvent.id)"
                :is-selection-confirmed="isSelectionConfirmed(selectedEvent.id)"
                :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer(selectedEvent.id)"
                :player-selection-status="getPlayerSelectionStatus(player.name, selectedEvent.id)"
                :season-id="seasonId"
                :player-gender="player.gender || 'non-specified'"
                :show-selected-chance="false"
                :disabled="selectedEvent.archived === true"
                :availability-data="getAvailabilityData(player.name, selectedEvent.id)"
                :event-title="selectedEvent.title"
                :event-date="selectedEvent.date"
                :is-protected="isPlayerProtectedInGrid(player.id)"
                :compact="true"
                :simplified-display="true"
                @toggle="handleAvailabilityToggle"
                @toggle-selection-status="handlePlayerSelectionStatusToggle"
                @show-availability-modal="openAvailabilityModal"
                @show-confirmation-modal="openConfirmationModal"
              />
            </div>
          </div>
        </div>
        
        <div 
          v-if="props.players.length === 0"
          class="col-span-full text-center py-4 text-gray-400 text-sm"
        >
          Aucun joueur dans la saison
        </div>
      </div>
    </div>

    <!-- Affichage par rôles -->
    <div v-else class="space-y-1 sm:space-y-2">
      <div 
        v-for="role in availableRoles" 
        :key="role"
        class="bg-gray-800/50 rounded-lg p-2 sm:p-3 border border-gray-700/50"
      >
        <!-- En-tête du rôle -->
        <div class="flex items-center justify-between mb-1 sm:mb-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ ROLE_EMOJIS[role] }}</span>
            <span class="font-medium text-white">{{ getRoleLabel(role) }}</span>
            <span class="text-sm text-gray-400">
              ({{ getAvailableCountForRole(role) }}/{{ getRequiredCountForRole(role) }})
            </span>
          </div>
          <div class="flex items-center gap-2">
            <div v-if="showRoleStatus" class="flex items-center gap-2">
              <!-- Indicateur de statut du rôle -->
              <div 
                class="w-3 h-3 rounded-full"
                :class="getRoleStatusClass(role)"
                :title="getRoleStatusTooltip(role)"
              ></div>
              <span class="text-xs text-gray-400">
                {{ getRoleStatusText(role) }}
              </span>
            </div>
            <!-- Chevron pour collapse/expand -->
            <button
              @click="toggleRoleExpanded(role)"
              class="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
              :title="isRoleExpanded(role) ? 'Réduire la section' : 'Agrandir la section'"
            >
              <svg 
                class="w-4 h-4 transition-transform duration-200" 
                :class="{ 'rotate-180': !isRoleExpanded(role) }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Liste des joueurs disponibles pour ce rôle -->
        <div v-if="isRoleExpanded(role)" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-0.5 sm:gap-1.5">
          <div
            v-for="player in getPlayersForRole(role)"
            :key="player.id"
            :class="[
              isPlayerSelectedForRole(player.name, role, selectedEvent.id) && isSelectionConfirmedByOrganizer(selectedEvent.id)
                ? 'rounded-lg transition-all duration-200 p-0 bg-transparent border-transparent'
                : 'p-3 rounded-lg border transition-all duration-200 flex items-center gap-3 rounded-md hover:bg-gray-700/50 border-transparent'
            ]"
          >
            <!-- Use CompositionSlot for selected players only if composition is validated by organizer -->
            <div v-if="isPlayerSelectedForRole(player.name, role, selectedEvent.id) && isSelectionConfirmedByOrganizer(selectedEvent.id)">
              <CompositionSlot
                :player-id="player.id"
                :player-name="player.name"
                :player-gender="player.gender || 'non-specified'"
                :role-key="role"
                :role-label="getRoleLabel(role)"
                :role-emoji="ROLE_EMOJIS[role]"
                :selection-status="getPlayerSelectionStatus(player.name, selectedEvent.id)"
                :available="isAvailable(player.name, selectedEvent.id)"
                :unavailable="isAvailable(player.name, selectedEvent.id) === false"
                :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer(selectedEvent.id)"
                :season-id="seasonId"
                :right-text="getPlayerChanceForRole(player.name, role, selectedEvent.id) || 0"
                :right-bruno-text="showBrunoAlgorithm ? getPlayerChanceForRoleBruno(player.name, role, selectedEvent.id) || 0 : null"
                :right-class="getChanceColorClass(getPlayerChanceForRole(player.name, role, selectedEvent.id))"
                :right-title="'Cliquer pour voir le détail du calcul'"
                :show-role-info="false"
                @right-click="(e) => showChanceDetails(e, player.name, role, false)"
                @right-bruno-click="(e) => showChanceDetails(e, player.name, role, true)"
                @slot-click="() => handleSlotClick(player, role)"
              />
            </div>

            <!-- Design classique pour joueurs non sélectionnés OU sélectionnés mais non validés -->
            <template v-else>
              <div class="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-lg border transition-all duration-200 hover:bg-gray-700/50 border-transparent">
                <!-- Avatar du joueur -->
                <div class="relative flex-shrink-0">
                  <PlayerAvatar 
                    :player-id="player.id"
                    :season-id="seasonId"
                    :player-name="player.name"
                    :player-gender="player.gender || 'non-specified'"
                    size="sm"
                  />
                  <!-- Statuts superposés -->
                  <span
                    v-if="preferredPlayerIdsSet.has(player.id)"
                    class="absolute -top-1 -right-1 text-yellow-400 text-xs bg-gray-900 rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center border border-gray-700"
                    title="Ma personne"
                  >
                    ⭐
                  </span>
                  <div class="absolute -top-1 -right-1">
                    <CustomTooltip
                      v-if="!isPlayerProtectedInGrid(player.id)"
                      :content="getUnprotectedPlayerTooltip(player)"
                      position="bottom"
                    >
                      <span class="text-orange-400 text-xs">
                        ⚠️
                      </span>
                    </CustomTooltip>
                  </div>
                </div>

                <!-- Conteneur vertical pour nom et pourcentages -->
                <div class="flex-1 min-w-0 flex flex-col gap-0.5">
                  <!-- Nom du joueur -->
                  <span class="text-white text-xs sm:text-sm font-medium truncate">
                    {{ player.name }}
                  </span>

                  <!-- Pourcentage de chances -->
                  <div class="flex items-center gap-1">
                    <span 
                      @click="showChanceDetails($event, player.name, role, false)"
                      data-chance-element
                      class="px-1 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                      :class="getChanceColorClass(getPlayerChanceForRole(player.name, role, selectedEvent.id))"
                      :title="`Cliquer pour voir le détail du calcul`"
                    >
                      {{ getPlayerChanceForRole(player.name, role, selectedEvent.id) || 0 }}%
                    </span>
                    <span 
                      v-if="showBrunoAlgorithm" 
                      @click="showChanceDetails($event, player.name, role, true)"
                      data-chance-element
                      class="text-gray-400 text-xs cursor-pointer hover:text-gray-300 transition-colors hidden sm:inline" 
                      title="Algorithme Bruno - Cliquer pour voir le détail"
                    >
                      ({{ getPlayerChanceForRoleBruno(player.name, role, selectedEvent.id) || 0 }}%)
                    </span>
                  </div>
                </div>

                <!-- Disponibilité du joueur -->
                <div class="flex-shrink-0 w-20 h-20 aspect-square">
                  <AvailabilityCell
                    :player-name="player.name"
                    :event-id="selectedEvent.id"
                    :is-available="isAvailable(player.name, selectedEvent.id)"
                    :is-selected="isPlayerSelectedForRole(player.name, role, selectedEvent.id)"
                    :is-selection-confirmed="isSelectionConfirmed(selectedEvent.id)"
                    :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer(selectedEvent.id)"
                    :player-selection-status="getPlayerSelectionStatusForRole(player.name, role, selectedEvent.id)"
                    :season-id="seasonId"
                    :player-gender="player.gender || 'non-specified'"
                    :chance-percent="getPlayerChanceForRole(player.name, role, selectedEvent.id)"
                    :show-selected-chance="false"
                    :disabled="selectedEvent.archived === true"
                    :availability-data="getAvailabilityData(player.name, selectedEvent.id)"
                    :event-title="selectedEvent.title"
                    :event-date="selectedEvent.date"
                    :is-protected="isPlayerProtectedInGrid(player.id)"
                    :compact="true"
                    :simplified-display="true"
                    :assigned-role="role"
                    @toggle="handleAvailabilityToggle"
                    @toggle-selection-status="handlePlayerSelectionStatusToggle"
                    @show-availability-modal="openAvailabilityModal"
                    @show-confirmation-modal="openConfirmationModal"
                  />
                </div>
              </div>
            </template>
          </div>

          <!-- Message si aucun joueur disponible -->
          <div 
            v-if="getPlayersForRole(role).length === 0"
            class="col-span-full text-center py-4 text-gray-400 text-sm"
          >
            Aucun joueur disponible pour ce rôle
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Mini-popup des explications de chances (algorithme par défaut) -->
  <div v-if="showChanceExplanation && explanationData && !showBrunoExplanation" 
       data-explanation-popup
       class="fixed z-[1600] bg-gray-900 border border-gray-600 rounded-lg shadow-xl p-3 sm:p-4 w-[calc(100%-32px)] max-w-xs sm:max-w-md sm:w-auto mx-4 sm:mx-0"
       :style="{
         left: isMobile ? `${explanationPosition.x}px` : '50%',
         top: isMobile ? `${explanationPosition.y}px` : '50%',
         transform: 'translate(-50%, -50%)',
         maxHeight: isMobile ? 'calc(100vh - 32px)' : 'calc(100vh - 64px)',
         overflowY: 'auto'
       }"
       @click.stop>
    <div class="text-sm sm:text-xs">
      <div class="font-medium text-white mb-2">Comment sont estimées les chances ?</div>
      <div class="space-y-2">
        <!-- Version ultra-simplifiée : un seul candidat -->
        <template v-if="explanationData.onlyOneCandidate">
          <div>
            <span class="text-gray-300">Il y a </span>
            <span class="text-blue-400 font-semibold">{{ explanationData.requiredCount }}</span>
            <span class="text-gray-300"> place{{ explanationData.requiredCount > 1 ? 's' : '' }} pour </span>
            <span class="text-green-400 font-semibold">{{ explanationData.availableCount }}</span>
            <span class="text-gray-300"> candidat.</span>
          </div>
          
          <div class="mt-2">
            <span class="text-gray-300">Comme tu es le seul candidat, il n'y a pas de tirage au sort. Tu es automatiquement sélectionné{{ explanationData.requiredCount > 1 ? 'e' : '' }}.</span>
          </div>
          
          <div class="mt-2">
            <span class="text-gray-300 font-semibold">Tes chances d'être sélectionné{{ explanationData.requiredCount > 1 ? 'e' : '' }}s sont de </span>
            <span class="font-semibold text-emerald-400">100%</span>
            <span class="text-gray-300">.</span>
          </div>
        </template>
        
        <!-- Version ultra-simplifiée : autant de places que de candidats -->
        <template v-else-if="explanationData.allCandidatesSelected">
          <div>
            <span class="text-gray-300">Il y a </span>
            <span class="text-blue-400 font-semibold">{{ explanationData.requiredCount }}</span>
            <span class="text-gray-300"> place{{ explanationData.requiredCount > 1 ? 's' : '' }} pour </span>
            <span class="text-green-400 font-semibold">{{ explanationData.availableCount }}</span>
            <span class="text-gray-300"> candidat{{ explanationData.availableCount > 1 ? 's' : '' }}.</span>
          </div>
          
          <div class="mt-2">
            <span class="text-gray-300">Comme il y a une place pour chaque candidat, il n'y a pas de tirage au sort. Tous les candidats sont automatiquement sélectionnés.</span>
          </div>
          
          <div class="mt-2">
            <span class="text-gray-300 font-semibold">Tes chances d'être sélectionné{{ explanationData.requiredCount > 1 ? 'e' : '' }}s sont de </span>
            <span class="font-semibold text-emerald-400">100%</span>
            <span class="text-gray-300">.</span>
          </div>
        </template>
        
        <!-- Version simplifiée : tous les candidats ont le même nombre de sélections -->
        <template v-else-if="explanationData.allCandidatesHaveSameSelections">
          <div>
            <span class="text-gray-300">Il y a </span>
            <span class="text-blue-400 font-semibold">{{ explanationData.requiredCount }}</span>
            <span class="text-gray-300"> place{{ explanationData.requiredCount > 1 ? 's' : '' }} pour </span>
            <span class="text-green-400 font-semibold">{{ explanationData.availableCount }}</span>
            <span class="text-gray-300"> candidats.</span>
          </div>
          <div class="mt-1">
            <span v-if="explanationData.pastSelections === 0" class="text-gray-300">
              Comme personne n'a de sélections passées, il n'y a pas de rééquilibrage. Tout le monde a les mêmes chances.
            </span>
            <span v-else class="text-gray-300">
              Comme tout le monde a <span class="text-purple-400">{{ explanationData.pastSelections }}</span> sélection{{ explanationData.pastSelections > 1 ? 's' : '' }} passée{{ explanationData.pastSelections > 1 ? 's' : '' }}, il n'y a pas de rééquilibrage. Tout le monde a les mêmes chances.
            </span>
          </div>
          
          <div class="mt-2">
            <span class="text-gray-300 font-semibold">Tes chances d'être sélectionné{{ explanationData.requiredCount > 1 ? 'e' : '' }}s sont de </span>
            <span class="font-semibold" :class="explanationData.chance >= 20 ? 'text-emerald-400' : explanationData.chance >= 10 ? 'text-amber-400' : 'text-rose-400'">{{ Math.round(explanationData.chance) }}%</span>
            <span class="text-gray-300">.</span>
          </div>
          
          <!-- Explication simplifiée avec la métaphore -->
          <div class="text-gray-400 text-sm sm:text-xs mt-2 pt-2 border-t border-gray-600">
            <div class="mb-2 text-gray-300 font-medium">Comment ça fonctionne ?</div>
            
            <div class="mb-2 text-gray-300">
              Imagine qu'on tire à l'aveugle des noms écrits sur des bouts de papier dans un chapeau. Comme tout le monde a le même nombre de sélections passées, tous les bouts de papier ont la même taille.
            </div>
            
            <div class="mb-2 text-gray-300">
              On réalise <span class="text-blue-400">{{ explanationData.requiredCount }}</span> tirages successifs à l'aveugle dans le sac. Après chaque tirage, on ne remet pas le bout de papier de la personne sélectionnée. Donc, proportionnellement, chaque tirage augmente la probabilité de chacun d'être tiré.
            </div>
            
            <div class="text-gray-300">
              <span class="font-semibold">Résultat :</span> Avec <span class="text-blue-400">{{ explanationData.requiredCount }}</span> places parmi <span class="text-green-400">{{ explanationData.availableCount }}</span> candidats, tu as <span class="text-blue-400">{{ explanationData.requiredCount }}</span>/<span class="text-green-400">{{ explanationData.availableCount }}</span> = <span class="font-semibold" :class="explanationData.chance >= 20 ? 'text-emerald-400' : explanationData.chance >= 10 ? 'text-amber-400' : 'text-rose-400'">{{ Math.round(explanationData.chance) }}%</span> de chances d'être sélectionné{{ explanationData.requiredCount > 1 ? 'e' : '' }}s.
            </div>
          </div>
        </template>
        
        <!-- Version complète : rééquilibrage nécessaire -->
        <template v-else>
          <!-- Probabilité théorique si tous avaient le même nombre de sélections -->
          <div>
            <span class="text-gray-300">Il y a </span>
            <span class="text-blue-400 font-semibold">{{ explanationData.requiredCount }}</span>
            <span class="text-gray-300"> place{{ explanationData.requiredCount > 1 ? 's' : '' }} pour </span>
            <span class="text-green-400 font-semibold">{{ explanationData.availableCount }}</span>
            <span class="text-gray-300"> candidats et tu as </span>
            <span class="text-purple-400 font-semibold">{{ explanationData.pastSelections }}</span>
            <span class="text-gray-300"> sélection{{ explanationData.pastSelections > 1 ? 's' : '' }} passée{{ explanationData.pastSelections > 1 ? 's' : '' }}.</span>
          </div>
          <div class="mt-1">
            <span v-if="explanationData.pastSelections === 0" class="text-gray-300">
              Si personne n'avait eu de sélections passées, vous auriez tous 
            </span>
            <span v-else class="text-gray-300">
              Si tout le monde avait eu <span class="text-purple-400">{{ explanationData.pastSelections }}</span> sélection{{ explanationData.pastSelections > 1 ? 's' : '' }} passée{{ explanationData.pastSelections > 1 ? 's' : '' }}, vous auriez tous 
            </span>
            <span class="text-blue-400 font-semibold">{{ explanationData.requiredCount }}</span>
            <span class="text-gray-400">/</span>
            <span class="text-green-400 font-semibold">{{ explanationData.availableCount }}</span>
            <span class="text-gray-400"> = </span>
            <span class="text-gray-300 font-semibold">{{ Math.round(explanationData.theoreticalChance) }}%</span>
            <span class="text-gray-300"> de chances d'être sélectionné{{ explanationData.requiredCount > 1 ? 'e' : '' }}s.</span>
          </div>
          
          <!-- Application du rééquilibrage d'équité -->
          <div class="mt-2">
            <span class="text-gray-300">Par souci d'équité, on réalise un rééquilibrage en se basant sur les sélections passées de tout le monde. Après rééquilibrage, tes chances d'être sélectionné{{ explanationData.requiredCount > 1 ? 'e' : '' }}s sont de </span>
            <span class="font-semibold" :class="explanationData.chance >= 20 ? 'text-emerald-400' : explanationData.chance >= 10 ? 'text-amber-400' : 'text-rose-400'">{{ Math.round(explanationData.chance) }}%</span>
            <span class="text-gray-300">.</span>
          </div>
          
          <!-- Explication détaillée du calcul -->
          <div class="text-gray-400 text-sm sm:text-xs mt-2 pt-2 border-t border-gray-600">
            <div class="mb-2 text-gray-300 font-medium">Comment ça fonctionne ?</div>
            
            <div class="mb-2 text-gray-300">
              Imagine qu'on tire à l'aveugle des noms écrits sur des bouts de papier dans un chapeau. La taille de ces bouts de papier diminue pour chaque sélection passée. On a donc plus de chances d'attraper un papier plus grand qu'un papier plus petit. La taille de ton bout de papier est calculée comme suit :
            </div>
            
            <div class="mb-1"><strong>1. Calcul de la taille de ton bout de papier :</strong></div>
            <div class="mb-2 text-gray-300">
              Taille = (1 / (1 + sélections passées)) × nombre de places = (1 / (1 + <span class="text-purple-400">{{ explanationData.pastSelections }}</span>)) × <span class="text-blue-400">{{ explanationData.requiredCount }}</span> = <span class="text-cyan-400">{{ formatNumber(explanationData.weightedChances) }}</span> cm de côté
            </div>
            <div class="mb-2 text-gray-300">
              Remarque qu'au fil des sélections, la taille du papier diminue, donc plus difficile à attraper ! Ça diminue donc les chances. Mais c'est pareil pour tout le monde !
            </div>
            
            <div class="mb-1"><strong>2. Tirages :</strong></div>
            <div class="mb-2 text-gray-300">
              Dans le sac, on trouve donc autant de bouts de papier que de candidats (<span class="text-green-400">{{ explanationData.availableCount }}</span>). On réalise <span class="text-blue-400">{{ explanationData.requiredCount }}</span> tirages successifs à l'aveugle dans le sac. Après chaque tirage, on ne remet pas le bout de papier de la personne sélectionnée. Donc, proportionnellement, chaque tirage augmente la probabilité de chacun d'être tiré.
            </div>
            <div class="mb-2 text-gray-300">
              Ainsi, comme ton bout de papier a une taille de <span class="text-cyan-400">{{ formatNumber(explanationData.playerWeight) }}</span> cm de côté, et celle des autres candidats de 
              <template v-for="(other, index) in explanationData.otherCandidatesWeights" :key="other.name">
                <span class="text-cyan-400">{{ formatNumber(other.weight) }}</span> cm<span v-if="index < explanationData.otherCandidatesWeights.length - 1">, </span>
              </template>
              , la taille totale de tous les papiers est de <span class="text-indigo-400">{{ formatNumber(explanationData.totalWeight) }}</span> cm.
            </div>
            <div class="mb-2 text-gray-300">
              En considérant ces tailles et les probabilités réajustées à chaque tirage, on évalue à <span class="font-semibold" :class="explanationData.chance >= 20 ? 'text-emerald-400' : explanationData.chance >= 10 ? 'text-amber-400' : 'text-rose-400'">{{ Math.round(explanationData.chance) }}%</span>. C'est une approximation, bien sûr, car c'est un tirage fait au hasard.
            </div>
            
            <div class="text-gray-300">
              <span class="font-semibold">Résultat :</span> <span class="font-semibold" :class="explanationData.chance >= 20 ? 'text-emerald-400' : explanationData.chance >= 10 ? 'text-amber-400' : 'text-rose-400'">{{ Math.round(explanationData.chance) }}%</span> de chances d'être sélectionné{{ explanationData.requiredCount > 1 ? 'e' : '' }}s
              <span v-if="explanationData.pastSelections > 0 && Math.abs(explanationData.theoreticalChance - explanationData.chance) >= 1">
                <span v-if="explanationData.chance > explanationData.theoreticalChance" class="text-emerald-400">
                  (+{{ Math.round(explanationData.chance - explanationData.theoreticalChance) }}% par rapport au scénario où tout le monde aurait eu {{ explanationData.pastSelections }} sélection{{ explanationData.pastSelections > 1 ? 's' : '' }})
                </span>
                <span v-else class="text-purple-400">
                  (-{{ Math.round(explanationData.theoreticalChance - explanationData.chance) }}% par rapport au scénario où tout le monde aurait eu {{ explanationData.pastSelections }} sélection{{ explanationData.pastSelections > 1 ? 's' : '' }})
                </span>
              </span>
            </div>
          </div>
        </template>
      </div>
    </div>
    
    <!-- Bouton de fermeture -->
    <button @click="hideChanceExplanation" 
            class="absolute top-1 right-1 text-gray-400 hover:text-white text-xs">
      ×
    </button>
  </div>

  <!-- Mini-popup des explications de chances (algorithme Bruno) -->
  <div v-if="showChanceExplanation && explanationData && showBrunoExplanation" 
       data-explanation-popup
       class="fixed z-[1600] bg-gray-900 border border-gray-600 rounded-lg shadow-xl p-3 sm:p-4 w-[calc(100%-32px)] max-w-xs sm:max-w-md sm:w-auto mx-4 sm:mx-0"
       :style="{
         left: isMobile ? `${explanationPosition.x}px` : '50%',
         top: isMobile ? `${explanationPosition.y}px` : '50%',
         transform: 'translate(-50%, -50%)',
         maxHeight: isMobile ? 'calc(100vh - 32px)' : 'calc(100vh - 64px)',
         overflowY: 'auto'
       }"
       @click.stop>
    <div class="text-sm sm:text-xs">
      <div class="font-medium text-white mb-2">Comment fonctionne l'algorithme Bruno ?</div>
      <div class="space-y-2">
        <!-- Introduction -->
        <div class="text-gray-300 italic">
          L'algorithme Bruno privilégie l'équité en donnant la priorité aux joueurs moins expérimentés.
        </div>
        
        <!-- Places et candidats -->
        <div>
          <span class="text-gray-300">Il y a </span>
          <span class="text-blue-400 font-semibold">{{ explanationData.requiredCount }}</span> 
          <span class="text-gray-300"> place{{ explanationData.requiredCount > 1 ? 's' : '' }} pour </span>
          <span class="text-green-400 font-semibold">{{ explanationData.availableCount }}</span> 
          <span class="text-gray-300"> candidats</span>
        </div>
        
        <!-- Groupement par niveau -->
        <div class="text-gray-400 text-sm sm:text-xs mt-2 pt-2 border-t border-gray-600">
          <div class="mb-1"><strong>L'algorithme groupe les candidats par expérience :</strong></div>
          <div v-for="levelDetail in explanationData.levelDetails" :key="levelDetail.level" class="ml-2">
            • <span class="text-purple-400">{{ levelDetail.level }}</span> sélection{{ levelDetail.level > 1 ? 's' : '' }} passée{{ levelDetail.level > 1 ? 's' : '' }} : 
            <span class="text-green-400">{{ levelDetail.candidatesCount }}</span> candidat{{ levelDetail.candidatesCount > 1 ? 's' : '' }} → 
            <span class="text-blue-400">{{ levelDetail.placesAvailable }}</span> place{{ levelDetail.placesAvailable > 1 ? 's' : '' }} disponible{{ levelDetail.placesAvailable > 1 ? 's' : '' }}
          </div>
        </div>
        
        <!-- Situation du joueur -->
        <div class="mt-2 pt-2 border-t border-gray-600">
          <div>
            <span class="text-gray-300">Tu as </span>
            <span class="text-purple-400 font-semibold">{{ explanationData.pastSelections }}</span>
            <span class="text-gray-300"> sélection{{ explanationData.pastSelections > 1 ? 's' : '' }} passée{{ explanationData.pastSelections > 1 ? 's' : '' }}, tu es dans le groupe "</span>
            <span class="text-purple-400">{{ explanationData.playerLevel }} sélection{{ explanationData.playerLevel > 1 ? 's' : '' }}</span>
            <span class="text-gray-300">"</span>
          </div>
          <div class="mt-1">
            <span class="text-gray-300">Dans ce groupe, il y a </span>
            <span class="text-green-400 font-semibold">{{ explanationData.candidatesAtPlayerLevel }}</span>
            <span class="text-gray-300"> candidat{{ explanationData.candidatesAtPlayerLevel > 1 ? 's' : '' }} pour </span>
            <span class="text-blue-400 font-semibold">{{ explanationData.placesAtPlayerLevel }}</span>
            <span class="text-gray-300"> place{{ explanationData.placesAtPlayerLevel > 1 ? 's' : '' }} restante{{ explanationData.placesAtPlayerLevel > 1 ? 's' : '' }}</span>
          </div>
        </div>
        
        <!-- Résultat -->
        <div class="mt-2 pt-2 border-t border-gray-600">
          <div>
            <span class="text-gray-300">Tes chances Bruno : </span>
            <span class="text-blue-400">{{ explanationData.placesAtPlayerLevel }}</span>
            <span class="text-gray-400">/</span>
            <span class="text-green-400">{{ explanationData.candidatesAtPlayerLevel }}</span>
            <span class="text-gray-400"> = </span>
            <span class="font-semibold" :class="explanationData.chance >= 20 ? 'text-emerald-400' : explanationData.chance >= 10 ? 'text-amber-400' : 'text-rose-400'">{{ Math.round(explanationData.chance) }}%</span>
          </div>
        </div>
        
        <!-- Calcul détaillé -->
        <div class="text-gray-400 text-sm sm:text-xs mt-2 pt-2 border-t border-gray-600">
          <div class="mb-1"><strong>Calcul détaillé :</strong></div>
          <div v-for="(levelDetail, index) in explanationData.levelDetails" :key="levelDetail.level" class="ml-2">
            • Niveau <span class="text-purple-400">{{ levelDetail.level }}</span> ({{ levelDetail.level === 0 ? 'jamais castés' : levelDetail.level === 1 ? '1 sélection' : levelDetail.level + '+ sélections' }}) : 
            <span class="text-blue-400">{{ levelDetail.placesAvailable }}</span> place{{ levelDetail.placesAvailable > 1 ? 's' : '' }} pour 
            <span class="text-green-400">{{ levelDetail.candidatesCount }}</span> candidat{{ levelDetail.candidatesCount > 1 ? 's' : '' }} = 
            <span v-if="levelDetail.placesAvailable > 0">
              <span class="text-blue-400">{{ levelDetail.placesAvailable }}</span>/<span class="text-green-400">{{ levelDetail.candidatesCount }}</span> = 
              <span class="font-semibold" :class="levelDetail.chancePerCandidate >= 20 ? 'text-emerald-400' : levelDetail.chancePerCandidate >= 10 ? 'text-amber-400' : 'text-rose-400'">{{ Math.round(levelDetail.chancePerCandidate) }}%</span> chacun
            </span>
            <span v-else class="text-gray-500">0% chacun</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Bouton de fermeture -->
    <button @click="hideChanceExplanation" 
            class="absolute top-1 right-1 text-gray-400 hover:text-white text-xs">
      ×
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import PlayerAvatar from './PlayerAvatar.vue'
import AvailabilityCell from './AvailabilityCell.vue'
import CompositionSlot from './CompositionSlot.vue'
import CustomTooltip from './CustomTooltip.vue'
import { 
  ROLES, 
  ROLE_EMOJIS, 
  ROLE_LABELS_SINGULAR, 
  ROLE_DISPLAY_ORDER,
  ROLE_PRIORITY_ORDER,
  getRoleLabel 
} from '../services/storage.js'
import { getChanceColorClass } from '../services/chancesService.js'
import { calculateAllRoleChances, calculateAllRoleChancesBruno, calculateExactSelectionProbability, calculateMalus, calculateWeightedChances } from '../services/chancesService.js'
import configService from '../services/configService.js'

const props = defineProps({
  selectedEvent: {
    type: Object,
    default: null
  },
  seasonId: {
    type: String,
    required: true
  },
  players: {
    type: Array,
    default: () => []
  },
  availability: {
    type: Object,
    default: () => ({})
  },
  casts: {
    type: Object,
    default: () => ({})
  },
  chances: {
    type: Object,
    default: () => ({})
  },
  preferredPlayerIdsSet: {
    type: Set,
    default: () => new Set()
  },
  // Fonctions passées depuis le composant parent
  isAvailable: {
    type: Function,
    required: true
  },
  isPlayerSelected: {
    type: Function,
    required: true
  },
  isPlayerSelectedForRole: {
    type: Function,
    required: true
  },
  isSelectionConfirmed: {
    type: Function,
    required: true
  },
  isSelectionConfirmedByOrganizer: {
    type: Function,
    required: true
  },
  getPlayerSelectionStatus: {
    type: Function,
    required: true
  },
  getAvailabilityData: {
    type: Function,
    required: true
  },
  isPlayerProtectedInGrid: {
    type: Function,
    required: true
  },
  isPlayerLoading: {
    type: Function,
    required: true
  },
  isPlayerAvailabilityLoaded: {
    type: Function,
    required: true
  },
  isPlayerError: {
    type: Function,
    required: true
  },
  getEventStatus: {
    type: Function,
    required: true
  },
  getEventTooltip: {
    type: Function,
    required: true
  },
  handleAvailabilityToggle: {
    type: Function,
    required: true
  },
  handlePlayerSelectionStatusToggle: {
    type: Function,
    required: true
  },
  openAvailabilityModal: {
    type: Function,
    required: true
  },
  isAvailableForRole: {
    type: Function,
    required: true
  },
  isSelectionComplete: {
    type: Function,
    required: true
  },
  getPlayerRoleChances: {
    type: Function,
    required: true
  },
  countSelections: {
    type: Function,
    required: true
  },
  // Ouvrir la modale de confirmation depuis le parent (gère protections et droits)
  openConfirmationModal: {
    type: Function,
    required: true
  },
  // Rôles filtrés (optionnel, si non fourni utilise availableRoles)
  filteredRoles: {
    type: Array,
    default: null
  },
  // Afficher les indicateurs de statut des rôles (par défaut true)
  showRoleStatus: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

// État de la mini-popup des explications de chances
const showChanceExplanation = ref(false)
const explanationData = ref(null)
const explanationPosition = ref({ x: 0, y: 0 })
const isMobile = ref(window.innerWidth < 640)

// État pour suivre quelles sections de rôle sont ouvertes/fermées
const expandedRoles = ref(new Set())

// Computed pour afficher l'algorithme Bruno seulement en dev/staging
const showBrunoAlgorithm = computed(() => {
  const environment = configService.getEnvironment()
  return environment === 'development' || environment === 'staging'
})

// Computed properties
const availableRoles = computed(() => {
  // Si des rôles filtrés sont fournis, les utiliser
  if (props.filteredRoles) {
    return props.filteredRoles
  }
  
  // Sinon, utiliser la logique par défaut
  if (!props.selectedEvent?.roles) return []
  
  return ROLE_PRIORITY_ORDER.filter(role => {
    const count = props.selectedEvent.roles[role] || 0
    return count > 0
  })
})

// Initialiser expandedRoles avec tous les rôles disponibles (par défaut tous ouverts)
watch(availableRoles, (newRoles) => {
  if (newRoles.length > 0) {
    // Ajouter les nouveaux rôles qui ne sont pas déjà dans le Set
    newRoles.forEach(role => {
      if (!expandedRoles.value.has(role)) {
        expandedRoles.value.add(role)
      }
    })
    // Retirer les rôles qui ne sont plus disponibles
    const rolesToRemove = []
    expandedRoles.value.forEach(role => {
      if (!newRoles.includes(role)) {
        rolesToRemove.push(role)
      }
    })
    rolesToRemove.forEach(role => expandedRoles.value.delete(role))
  }
}, { immediate: true })

// Fonction pour toggle l'état expanded d'un rôle
function toggleRoleExpanded(role) {
  if (expandedRoles.value.has(role)) {
    expandedRoles.value.delete(role)
  } else {
    expandedRoles.value.add(role)
  }
}

// Fonction pour vérifier si un rôle est expanded
function isRoleExpanded(role) {
  return expandedRoles.value.has(role)
}


const eventStatus = computed(() => {
  if (!props.selectedEvent) return null
  return props.getEventStatus(props.selectedEvent.id)
})

// Fonctions utilitaires
function formatEventDate(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getRequiredCountForRole(role) {
  return props.selectedEvent?.roles?.[role] || 0
}

function getAvailableCountForRole(role) {
  return getPlayersForRole(role).length
}

function getAvailablePlayersCount() {
  if (!props.selectedEvent) return 0
  return props.players.filter(player => {
    return props.isAvailable(player.name, props.selectedEvent.id) === true
  }).length
}

function getPlayersForRole(role) {
  if (!props.selectedEvent) return []
  
  return props.players.filter(player => {
    return props.isAvailableForRole(player.name, role, props.selectedEvent.id)
  })
}

// Fonction helper pour obtenir le statut de sélection seulement si le joueur est sélectionné pour ce rôle spécifique
function getPlayerSelectionStatusForRole(playerName, role, eventId) {
  // Vérifier d'abord si le joueur est sélectionné pour ce rôle spécifique
  if (!props.isPlayerSelectedForRole(playerName, role, eventId)) {
    // Si le joueur n'est pas sélectionné pour ce rôle, retourner null
    // Cela permettra d'afficher "Dispo" en vert au lieu du statut pending_confirmation
    return null
  }
  
  // Si le joueur est sélectionné pour ce rôle, retourner son statut de sélection
  return props.getPlayerSelectionStatus(playerName, eventId)
}

function getPlayerChanceForRole(playerName, role, eventId) {
  // Créer une fonction countSelections qui exclut l'événement en cours
  const countSelectionsExcludingCurrentEvent = (playerName, role) => {
    if (!props.countSelections) return 0
    return props.countSelections(playerName, role, eventId, props.selectedEvent?.templateType)
  }
  
  // Utiliser le même calcul que dans la popup d'explication
  // Calculer les chances pour tous les rôles (même logique que GridBoard)
  const allRoleChances = calculateAllRoleChances(
    props.selectedEvent, 
    props.players, 
    props.availability, 
    countSelectionsExcludingCurrentEvent,
    props.isAvailableForRole
  )
  
  const roleData = allRoleChances[role]
  if (!roleData || !roleData.candidates) {
    return null
  }
  
  const candidate = roleData.candidates.find(c => c.name === playerName)
  return candidate ? Math.round(candidate.practicalChance) : null
}

function getPlayerChanceForRoleBruno(playerName, role, eventId) {
  // Créer une fonction countSelections qui exclut l'événement en cours
  const countSelectionsExcludingCurrentEvent = (playerName, role) => {
    if (!props.countSelections) return 0
    return props.countSelections(playerName, role, eventId, props.selectedEvent?.templateType)
  }
  
  // Calculer les chances selon l'algorithme Bruno
  const allRoleChancesBruno = calculateAllRoleChancesBruno(
    props.selectedEvent, 
    props.players, 
    props.availability, 
    countSelectionsExcludingCurrentEvent,
    props.isAvailableForRole
  )
  
  console.log('🔍 Bruno debug pour', playerName, role, ':', allRoleChancesBruno[role])
  
  const roleData = allRoleChancesBruno[role]
  if (!roleData || !roleData.candidates) {
    return null
  }
  
  const candidate = roleData.candidates.find(c => c.name === playerName)
  console.log('🔍 Candidat Bruno trouvé:', candidate)
  
  return candidate ? Math.round(candidate.brunoChance) : null
}

function getChanceExplanationBruno(playerName, role) {
  // Créer une fonction countSelections qui exclut l'événement en cours
  const countSelectionsExcludingCurrentEvent = (playerName, role) => {
    if (!props.countSelections) return 0
    return props.countSelections(playerName, role, props.selectedEvent.id, props.selectedEvent?.templateType)
  }
  
  // Calculer les chances selon l'algorithme Bruno
  const allRoleChancesBruno = calculateAllRoleChancesBruno(
    props.selectedEvent, 
    props.players, 
    props.availability, 
    countSelectionsExcludingCurrentEvent,
    props.isAvailableForRole
  )
  
  const roleData = allRoleChancesBruno[role]
  if (!roleData || !roleData.candidates) {
    return null
  }
  
  const candidate = roleData.candidates.find(c => c.name === playerName)
  if (!candidate) {
    return null
  }
  
  // Grouper les candidats par niveau d'expérience
  const candidatesByLevel = {}
  roleData.candidates.forEach(c => {
    const level = c.experience || 0
    if (!candidatesByLevel[level]) {
      candidatesByLevel[level] = []
    }
    candidatesByLevel[level].push(c)
  })
  
  // Trier les niveaux
  const sortedLevels = Object.keys(candidatesByLevel).sort((a, b) => parseInt(a) - parseInt(b))
  
  // Calculer les places attribuées à chaque niveau
  const levelDetails = []
  let remainingPlaces = roleData.requiredCount
  
  sortedLevels.forEach(level => {
    const candidatesAtLevel = candidatesByLevel[level]
    const placesAtLevel = Math.min(remainingPlaces, candidatesAtLevel.length)
    const chanceAtLevel = placesAtLevel > 0 ? (placesAtLevel / candidatesAtLevel.length) * 100 : 0
    
    levelDetails.push({
      level: parseInt(level),
      candidatesCount: candidatesAtLevel.length,
      placesAvailable: placesAtLevel,
      chancePerCandidate: chanceAtLevel
    })
    
    remainingPlaces -= placesAtLevel
  })
  
  return {
    playerName,
    role,
    chance: candidate.brunoChance || 0,
    requiredCount: roleData.requiredCount || 0,
    availableCount: roleData.availableCount || 0,
    pastSelections: candidate.experience || 0,
    playerLevel: candidate.experience || 0,
    levelDetails,
    placesAtPlayerLevel: candidate.remainingPlacesAtLevel || 0,
    candidatesAtPlayerLevel: candidatesByLevel[candidate.experience]?.length || 0
  }
}


function getChanceBadgeClass(chance) {
  // Utiliser le même style que dans la modale des chances
  if (chance >= 20) return 'bg-green-500/20 text-green-300'
  if (chance >= 10) return 'bg-yellow-500/20 text-yellow-300'
  return 'bg-red-500/20 text-red-300'
}

// Fonctions pour la mini-popup des explications
const showBrunoExplanation = ref(false)

function showChanceDetails(event, playerName, role, isBruno = false) {
  console.log('🖱️ Click on percentage:', { playerName, role, event, isBruno })
  
  // Empêcher la propagation pour éviter que handleClickOutside ne ferme immédiatement
  if (event) {
    event.stopPropagation()
  }
  
  // En mobile, centrer la popup sur l'écran
  // En desktop, la popup sera centrée via CSS (50% avec transform)
  if (isMobile.value) {
    explanationPosition.value = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    }
  } else {
    // En desktop, on centre toujours sur l'écran, donc on n'a pas besoin de calculer la position
    // On garde juste des valeurs par défaut pour éviter les erreurs
    explanationPosition.value = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    }
  }
  
  // Récupérer les données d'explication selon l'algorithme
  if (isBruno) {
    explanationData.value = getChanceExplanationBruno(playerName, role)
    showBrunoExplanation.value = true
  } else {
    explanationData.value = getChanceExplanation(playerName, role)
    showBrunoExplanation.value = false
  }
  console.log('📊 Explanation data set:', explanationData.value)
  
  showChanceExplanation.value = true
  console.log('👁️ Show explanation:', showChanceExplanation.value)
}

function hideChanceExplanation() {
  showChanceExplanation.value = false
  showBrunoExplanation.value = false
  explanationData.value = null
}

// Helper function to format numbers: show decimals only if they're not zero
function formatNumber(num) {
  const rounded = Math.round(num * 100) / 100 // Round to 2 decimal places
  if (rounded % 1 === 0) {
    return rounded.toString() // No decimals if it's a whole number
  }
  return rounded.toFixed(2) // Show 2 decimals if needed
}

function getChanceExplanation(playerName, role) {
  console.log('🔍 Debug getChanceExplanation:', { playerName, role, selectedEvent: props.selectedEvent })
  
  if (!props.selectedEvent) {
    console.log('❌ Missing selectedEvent')
    return null
  }
  
  // Utiliser la même logique que dans la modale de chances
  const event = props.selectedEvent
  const eventId = event.id
  
  // Créer une fonction countSelections qui exclut l'événement en cours
  // pour utiliser les sélections historiques au moment du tirage
  const countSelectionsExcludingCurrentEvent = (playerName, role) => {
    if (!props.countSelections) return 0
    return props.countSelections(playerName, role, eventId, event?.templateType)
  }
  
  // Calculer les chances pour tous les rôles (même logique que GridBoard)
  const allRoleChances = calculateAllRoleChances(
    event, 
    props.players, 
    props.availability, 
    countSelectionsExcludingCurrentEvent,
    props.isAvailableForRole
  )
  
  console.log('🔍 Calculated role chances:', allRoleChances)
  
  const roleData = allRoleChances[role]
  if (!roleData || !roleData.candidates) {
    console.log('❌ No role data found for role:', role)
    return null
  }
  
  const candidate = roleData.candidates.find(c => c.name === playerName)
  console.log('🔍 Candidate found:', candidate)
  console.log('🔍 Candidate pastSelections:', candidate?.pastSelections)
  console.log('🔍 Candidate malus:', candidate?.malus)
  console.log('🔍 Candidate practicalChance:', candidate?.practicalChance)
  
  // Debug des données de base
  console.log('🔍 Props countSelections function:', typeof props.countSelections)
  
  // Tester la fonction countSelections directement
  if (props.countSelections) {
    const directCount = props.countSelections(playerName, role)
    console.log('🔍 Direct countSelections call:', directCount)
    console.log('🔍 Expected pastSelections should match directCount:', directCount)
  }
  
  if (!candidate) {
    console.log('❌ No candidate found for player:', playerName)
    return null
  }
  
  // Calculer la probabilité théorique en supposant que tous les candidats
  // ont le même nombre de sélections passées que le candidat actuel
  let theoreticalChance = 0
  if (roleData.availableCount > 0 && roleData.requiredCount > 0) {
    // Créer une liste de candidats théoriques où tous ont le même poids que le candidat actuel
    const theoreticalCandidates = roleData.candidates.map((c, index) => ({
      name: c.name,
      weight: candidate.weight, // Tous ont le même poids que le candidat actuel
      pastSelections: candidate.pastSelections,
      malus: candidate.malus,
      weightedChances: candidate.weightedChances
    }))
    
    // Trouver l'index du candidat cible dans la liste théorique
    const targetIndex = theoreticalCandidates.findIndex(c => c.name === playerName)
    
    if (targetIndex >= 0) {
      // Calculer la probabilité avec tous les candidats ayant le même poids
      const theoreticalProbability = calculateExactSelectionProbability(
        roleData.requiredCount,
        theoreticalCandidates,
        targetIndex
      )
      theoreticalChance = theoreticalProbability * 100
    } else {
      // Fallback : si on ne trouve pas le candidat, utiliser la formule simple
      theoreticalChance = (roleData.requiredCount / roleData.availableCount) * 100
    }
  }
  
  // Calculer les informations pour l'explication détaillée
  const otherCandidates = roleData.candidates.filter(c => c.name !== playerName)
  const otherCandidatesTotalWeight = otherCandidates.reduce((sum, c) => sum + c.weight, 0)
  const averageOtherWeight = otherCandidates.length > 0 ? otherCandidatesTotalWeight / otherCandidates.length : 0
  
  // Liste des poids des autres candidats pour l'explication détaillée
  const otherCandidatesWeights = otherCandidates.map(c => ({
    name: c.name,
    weight: c.weight,
    pastSelections: c.pastSelections
  })).sort((a, b) => b.weight - a.weight) // Trier par poids décroissant
  
  // Vérifier si tous les candidats ont le même nombre de sélections passées
  const allCandidatesHaveSameSelections = roleData.candidates.every(c => 
    c.pastSelections === candidate.pastSelections
  )
  
  // Vérifier s'il n'y a qu'un seul candidat
  const onlyOneCandidate = roleData.availableCount === 1
  
  // Vérifier s'il y a autant de places que de candidats (tous sont automatiquement sélectionnés)
  const allCandidatesSelected = roleData.requiredCount === roleData.availableCount && roleData.availableCount > 0
  
  const explanation = {
    playerName,
    role,
    chance: candidate.practicalChance || 0,
    requiredCount: roleData.requiredCount || 0,
    availableCount: roleData.availableCount || 0,
    malus: candidate.malus || 0,
    pastSelections: candidate.pastSelections || 0,
    weightedChances: candidate.weightedChances || 0,
    totalWeight: roleData.totalWeight || 0,
    theoreticalChance: theoreticalChance,
    // Informations supplémentaires pour l'explication
    playerWeight: candidate.weight || 0,
    otherCandidatesCount: otherCandidates.length,
    otherCandidatesTotalWeight: otherCandidatesTotalWeight,
    averageOtherWeight: averageOtherWeight,
    otherCandidatesWeights: otherCandidatesWeights, // Liste des poids des autres candidats
    allCandidatesHaveSameSelections: allCandidatesHaveSameSelections, // Flag pour simplifier l'explication
    onlyOneCandidate: onlyOneCandidate, // Flag pour le cas d'un seul candidat
    allCandidatesSelected: allCandidatesSelected // Flag pour le cas où tous les candidats sont sélectionnés
  }
  
  console.log('✅ Explanation data:', explanation)
  return explanation
}

// Gestion des événements pour fermer la popup
function handleClickOutside(event) {
  // Ne pas fermer si on clique sur un élément qui ouvre une popup (pourcentage, etc.)
  const target = event.target
  
  // Vérifier si on clique sur un élément qui ouvre la popup
  const isClickingOnChanceElement = target.closest('[data-chance-element]') !== null
  
  if (showChanceExplanation.value && !event.target.closest('[data-explanation-popup]')) {
    // Si on clique sur un autre pourcentage, laisser showChanceDetails gérer le remplacement
    // (showChanceDetails appelle event.stopPropagation() donc cette fonction ne sera pas appelée)
    // Si on clique ailleurs, fermer la popup
    if (!isClickingOnChanceElement) {
      hideChanceExplanation()
    }
  }
}

// Gestion du redimensionnement pour détecter mobile/desktop
function handleResize() {
  isMobile.value = window.innerWidth < 640
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  handleResize() // Initialiser la valeur
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
})

function getRoleStatusClass(role) {
  const available = getAvailableCountForRole(role)
  const required = getRequiredCountForRole(role)
  
  if (available >= required) {
    return 'bg-green-500'
  } else if (available > 0) {
    return 'bg-yellow-500'
  } else {
    return 'bg-red-500'
  }
}

function getRoleStatusTooltip(role) {
  const available = getAvailableCountForRole(role)
  const required = getRequiredCountForRole(role)
  
  if (available >= required) {
    return `Rôle complet : ${available}/${required} joueurs`
  } else if (available > 0) {
    return `Rôle incomplet : ${available}/${required} joueurs (manque ${required - available})`
  } else {
    return `Aucun joueur disponible : 0/${required} joueurs`
  }
}

function getRoleStatusText(role) {
  const available = getAvailableCountForRole(role)
  const required = getRequiredCountForRole(role)
  
  if (available >= required) {
    return 'Complet'
  } else if (available > 0) {
    return `Manque ${required - available}`
  } else {
    return 'Aucun'
  }
}

// Handle slot click to open confirmation modal
async function handleSlotClick(player, role) {
  if (!props.selectedEvent) return
  
  const event = props.selectedEvent
  const eventId = event.id
  const playerName = player.name
  const playerId = player.id

  // Get current availability data to pass the comment
  const availabilityData = props.getAvailabilityData(playerName, eventId)
  
  // Build confirmation modal data similar to AvailabilityCell
  const data = {
    playerName,
    playerId,
    playerGender: player.gender || 'non-specified',
    eventId,
    eventTitle: event.title,
    eventDate: event.date,
    assignedRole: role,
    availabilityComment: availabilityData?.comment || null,
    currentStatus: props.getPlayerSelectionStatus(playerName, eventId),
    seasonId: props.seasonId
  }

  // Use the openConfirmationModal function passed from parent
  if (typeof props.openConfirmationModal === 'function') {
    props.openConfirmationModal(data)
  } else {
    console.warn('openConfirmationModal function not available')
  }
}

// Fonction pour générer le tooltip d'avertissement pour les joueurs non-protégés
function getUnprotectedPlayerTooltip(player) {
  return `⚠️ ${player.name} non protégé
Disponibilités modifiables par tous`
}

</script>
