<template>
  <div class="w-full bg-gray-900 min-h-full">
    <!-- Tableau avec colonnes de statistiques et événements -->
    <div class="overflow-x-auto casts-view" @scroll="handleScroll">
    <table class="w-full table-auto border-separate border-spacing-0" style="border-spacing: 0;">
      <!-- En-tête de la table -->
      <thead class="sticky top-0 z-[110]">
        <!-- Ligne d'en-tête de groupe -->
        <tr>
          <!-- Cellule vide pour la colonne de gauche -->
          <th 
            class="bg-gray-900 sticky left-0 z-[111]"
            :style="{ 
              width: dynamicLeftColumnWidth, 
              minWidth: windowWidth > 768 ? '6rem' : dynamicLeftColumnWidth, 
              maxWidth: dynamicLeftColumnWidth 
            }"
            style="border: none; padding: 0;"
          ></th>
          
          <!-- En-tête de groupe (affiché seulement quand les détails sont visibles) -->
          <template v-if="showStatsColumns && (showJeuDetails || showDecorumDetails || showDeplacementDetails || showBenevoleDetails)">
            <th 
              :colspan="jeuColumnsCount" 
              class="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1.5 text-center rounded-tl"
              style="border: none; margin: 0;"
            >
              JEU
            </th>
            <th 
              :colspan="decorumColumnsCount" 
              class="bg-violet-100 text-violet-800 text-xs font-bold px-2 py-1.5 text-center"
              style="border: none; margin: 0;"
            >
              DECORUM
            </th>
            <th 
              :colspan="deplacementColumnsCount" 
              class="bg-teal-100 text-teal-800 text-xs font-bold px-2 py-1.5 text-center"
              style="border: none; margin: 0;"
            >
              DEPLACEMENT
            </th>
            <th 
              :colspan="benevoleColumnsCount" 
              class="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1.5 text-center rounded-tr"
              style="border: none; margin: 0;"
            >
              BÉNÉVOLE
            </th>
          </template>
          
          <!-- Cellules vides pour les événements -->
          <th 
            v-for="event in props.events"
            :key="`group-${event.id}`"
            style="border: none; padding: 0;"
          ></th>
        </tr>
        
        <tr>
          <!-- Colonne de gauche (Bouton Exporter) -->
          <th 
            class="col-left bg-gray-900 px-4 py-3 text-center sticky left-0 z-[111]"
            :style="{ 
              width: dynamicLeftColumnWidth, 
              minWidth: windowWidth > 768 ? '6rem' : dynamicLeftColumnWidth, 
              maxWidth: dynamicLeftColumnWidth 
            }"
          >
            <div class="flex flex-col space-y-2">
              <button
                @click="exportToExcel"
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center space-x-1"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
                <span>Exporter</span>
              </button>
              
              <button
                @click="toggleStatsColumns"
                class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center space-x-1"
                :title="showStatsColumns ? 'Masquer les statistiques' : 'Afficher les statistiques'"
              >
                <span>{{ showStatsColumns ? '📊' : '📈' }}</span>
                <span>{{ showStatsColumns ? 'Masquer' : 'Stats' }}</span>
              </button>
            </div>
          </th>
          
          <!-- Colonnes de comptage des rôles -->
          <template v-if="showStatsColumns">
            <!-- JEU - Colonnes de détails (affichées conditionnellement) -->
            <template v-if="showJeuDetails">
              <th class="bg-amber-50 text-amber-700 text-xs px-2 py-2 text-center border-r border-b border-amber-200 cursor-pointer touch-manipulation" style="width: 90px; min-width: 90px;">
                <div class="flex flex-col items-center space-y-0.5">
                  <span>🎭</span>
                  <span>JEU MATCH</span>
                </div>
              </th>
              <th class="bg-amber-50 text-amber-700 text-xs px-2 py-2 text-center border-r border-b border-amber-200 cursor-pointer touch-manipulation" style="width: 85px; min-width: 85px;">
                <div class="flex flex-col items-center space-y-0.5">
                  <span>🎭</span>
                  <span>JEU CAB</span>
                </div>
              </th>
              <th class="bg-amber-50 text-amber-700 text-xs px-2 py-2 text-center border-r border-b border-amber-200 cursor-pointer touch-manipulation" style="width: 90px; min-width: 90px;">
                <div class="flex flex-col items-center space-y-0.5">
                  <span>🎭</span>
                  <span>JEU LONG</span>
                </div>
              </th>
              <th class="bg-amber-50 text-amber-700 text-xs px-2 py-2 text-center border-r border-b border-amber-200 cursor-pointer touch-manipulation" style="width: 90px; min-width: 90px;">
                <div class="flex flex-col items-center space-y-0.5">
                  <span>🎭</span>
                  <span>JEU AUTRE</span>
                </div>
              </th>
            </template>
            <!-- Total Jeu avec lien toggle -->
            <th 
              class="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-2 text-center border-l-2 border-r border-b border-amber-200 cursor-pointer touch-manipulation"
              :class="!showJeuDetails && !showDecorumDetails && !showDeplacementDetails && !showBenevoleDetails ? 'rounded-tl' : ''"
              :style="!showJeuDetails && !showDecorumDetails && !showDeplacementDetails && !showBenevoleDetails ? 'width: 90px; min-width: 90px;' : 'width: 80px; min-width: 80px;'"
            >
              <div class="flex flex-col items-center space-y-0.5">
                <template v-if="showJeuDetails">
                  <span>TOTAL</span>
                  <span>JEU</span>
                  <button
                    @click.stop="toggleJeuDetails"
                    class="text-amber-600 hover:text-amber-800 text-xs underline font-normal mt-0.5"
                    title="Masquer les détails"
                  >
                    masquer les détails
                  </button>
                </template>
                <template v-else>
                  <span>JEU</span>
                  <button
                    @click.stop="toggleJeuDetails"
                    class="text-amber-600 hover:text-amber-800 text-xs underline font-normal"
                    title="Voir les détails"
                  >
                    voir les détails
                  </button>
                </template>
              </div>
            </th>
            
            <!-- DÉCORUM - Colonnes de détails (affichées conditionnellement) -->
            <template v-if="showDecorumDetails">
              <th class="bg-violet-50 text-violet-700 text-xs px-2 py-2 text-center border-r border-b border-violet-200 cursor-pointer touch-manipulation" style="width: 60px; min-width: 60px;">
                <div class="flex flex-col items-center space-y-0.5">
                  <span>🎤</span>
                  <span>MC</span>
                </div>
              </th>
              <th class="bg-violet-50 text-violet-700 text-xs px-2 py-2 text-center border-r border-b border-violet-200 cursor-pointer touch-manipulation" style="width: 60px; min-width: 60px;">
                <div class="flex flex-col items-center space-y-0.5">
                  <span>🎧</span>
                  <span>DJ</span>
                </div>
              </th>
              <th class="bg-violet-50 text-violet-700 text-xs px-2 py-2 text-center border-r border-b border-violet-200 cursor-pointer touch-manipulation" style="width: 80px; min-width: 80px;">
                <div class="flex flex-col items-center space-y-0.5">
                  <span>🙅</span>
                  <span>ARBITRE</span>
                </div>
              </th>
              <th class="bg-violet-50 text-violet-700 text-xs px-2 py-2 text-center border-r border-b border-violet-200 cursor-pointer touch-manipulation" style="width: 75px; min-width: 75px;">
                <div class="flex flex-col items-center space-y-0.5">
                  <span>💁</span>
                  <span>ASSIST.</span>
                </div>
              </th>
              <th class="bg-violet-50 text-violet-700 text-xs px-2 py-2 text-center border-r border-b border-violet-200 cursor-pointer touch-manipulation" style="width: 70px; min-width: 70px;">
                <div class="flex flex-col items-center space-y-0.5">
                  <span>🧢</span>
                  <span>COACH</span>
                </div>
              </th>
            </template>
            <!-- Total Decorum avec lien toggle -->
            <th 
              class="bg-violet-100 text-violet-800 text-xs font-bold px-2 py-2 text-center border-l-2 border-r border-b border-violet-200 cursor-pointer touch-manipulation"
              :style="!showJeuDetails && !showDecorumDetails && !showDeplacementDetails && !showBenevoleDetails ? 'width: 90px; min-width: 90px;' : 'width: 100px; min-width: 100px;'"
            >
              <div class="flex flex-col items-center space-y-0.5">
                <template v-if="showDecorumDetails">
                  <span>TOTAL</span>
                  <span>DECORUM</span>
                  <button
                    @click.stop="toggleDecorumDetails"
                    class="text-violet-600 hover:text-violet-800 text-xs underline font-normal mt-0.5"
                    title="Masquer les détails"
                  >
                    masquer les détails
                  </button>
                </template>
                <template v-else>
                  <span>DECORUM</span>
                  <button
                    @click.stop="toggleDecorumDetails"
                    class="text-violet-600 hover:text-violet-800 text-xs underline font-normal"
                    title="Voir les détails"
                  >
                    voir les détails
                  </button>
                </template>
              </div>
            </th>
            
            <!-- DEPLACEMENT - Colonnes de détails (affichées conditionnellement) -->
            <template v-if="showDeplacementDetails">
              <th class="bg-teal-50 text-teal-700 text-xs px-2 py-2 text-center border-r border-b border-teal-200 cursor-pointer touch-manipulation" style="width: 70px; min-width: 70px;">
                <div class="flex flex-col items-center space-y-0.5">
                  <span>🎭</span>
                  <span>JEU</span>
                </div>
              </th>
              <th class="bg-teal-50 text-teal-700 text-xs px-2 py-2 text-center border-r border-b border-teal-200 cursor-pointer touch-manipulation" style="width: 75px; min-width: 75px;">
                <div class="flex flex-col items-center space-y-0.5">
                  <span>🎤</span>
                  <span>DECORUM</span>
                </div>
              </th>
            </template>
            <!-- Total Déplacement avec lien toggle -->
            <th 
              class="bg-teal-100 text-teal-800 text-xs font-bold px-2 py-2 text-center border-l-2 border-r border-b border-teal-200 cursor-pointer touch-manipulation"
              :style="!showDeplacementDetails ? 'width: 85px; min-width: 85px;' : 'width: 80px; min-width: 80px;'"
            >
              <div class="flex flex-col items-center space-y-0.5">
                <template v-if="showDeplacementDetails">
                  <span>TOTAL</span>
                  <span>DÉPLACEMENT</span>
                  <button
                    @click.stop="toggleDeplacementDetails"
                    class="text-teal-600 hover:text-teal-800 text-xs underline font-normal mt-0.5"
                    title="Masquer les détails"
                  >
                    masquer les détails
                  </button>
                </template>
                <template v-else>
                  <span>DEPLACEMENT</span>
                  <button
                    @click.stop="toggleDeplacementDetails"
                    class="text-teal-600 hover:text-teal-800 text-xs underline font-normal"
                    title="Voir les détails"
                  >
                    voir les détails
                  </button>
                </template>
              </div>
            </th>
            
            <!-- BÉNÉVOLE - Colonnes de détails (affichées conditionnellement) -->
            <template v-if="showBenevoleDetails">
              <th class="bg-slate-50 text-slate-700 text-xs px-2 py-2 text-center border-r border-b border-slate-200 cursor-pointer touch-manipulation" style="width: 70px; min-width: 70px;">
                <div class="flex flex-col items-center space-y-0.5">
                  <span>🎬</span>
                  <span>RÉGISSEUR</span>
                </div>
              </th>
              <th class="bg-slate-50 text-slate-700 text-xs px-2 py-2 text-center border-r border-b border-slate-200 cursor-pointer touch-manipulation" style="width: 65px; min-width: 65px;">
                <div class="flex flex-col items-center space-y-0.5">
                  <span>🔦</span>
                  <span>LUMIÈRE</span>
                </div>
              </th>
              <th class="bg-slate-50 text-slate-700 text-xs px-2 py-2 text-center border-r border-b border-slate-200 cursor-pointer touch-manipulation" style="width: 70px; min-width: 70px;">
                <div class="flex flex-col items-center space-y-0.5">
                  <span>🤝</span>
                  <span>BÉNÉVOLE</span>
                </div>
              </th>
            </template>
            <!-- Total Bénévole avec lien toggle -->
            <th 
              class="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-2 text-center border-l-2 border-r border-b border-slate-200 rounded-tr"
              :style="!showJeuDetails && !showDecorumDetails && !showDeplacementDetails && !showBenevoleDetails ? 'width: 90px; min-width: 90px;' : 'width: 85px; min-width: 85px;'"
            >
              <div class="flex flex-col items-center space-y-0.5">
                <template v-if="showBenevoleDetails">
                  <span>TOTAL</span>
                  <span>BÉNÉVOLE</span>
                  <button
                    @click.stop="toggleBenevoleDetails"
                    class="text-slate-600 hover:text-slate-800 text-xs underline font-normal mt-0.5"
                    title="Masquer les détails"
                  >
                    masquer les détails
                  </button>
                </template>
                <template v-else>
                  <span>BÉNÉVOLE</span>
                  <button
                    @click.stop="toggleBenevoleDetails"
                    class="text-slate-600 hover:text-slate-800 text-xs underline font-normal"
                    title="Voir les détails"
                  >
                    voir les détails
                  </button>
                </template>
              </div>
            </th>
          </template>
          
    <!-- En-têtes des événements -->
          <th
            v-for="event in props.events"
            :key="event.id"
            class="col-header col-event px-2 py-3 text-center"
            :style="{ width: `${eventColumnWidth}px`, minWidth: `${eventColumnWidth}px` }"
          >
      <div
        class="col-event rounded-xl flex items-center justify-center px-2 py-3 transition-all duration-200 cursor-pointer touch-manipulation"
        :class="[
                event._isArchived 
            ? 'bg-gray-600/50 border border-gray-500/30 hover:bg-gray-600/70' 
                  : event._isPast 
              ? 'bg-amber-800/30 border border-amber-600/30 hover:bg-amber-800/50' 
              : 'bg-gray-800 border border-gray-700/30 hover:bg-gray-700'
        ]"
              :style="{ width: `${eventColumnWidth}px`, minWidth: `${eventColumnWidth}px` }"
              @click="openEventModal(event)"
      >
        <div class="flex flex-col items-center space-y-1 w-full">
          <!-- Emoji et titre empilés -->
          <div class="flex flex-col items-center gap-1 w-full">
                  <span class="text-sm">{{ getEventIcon(event) }}</span>
            <span 
              class="font-semibold text-sm text-center leading-tight line-clamp-2 overflow-hidden" 
              :class="[
                      event._isArchived 
                  ? 'text-gray-400' 
                        : event._isPast 
                    ? 'text-amber-200' 
                    : 'text-white'
              ]"
                    :title="event.title + (event._isArchived ? ' (Archivé)' : event._isPast ? ' (Passé)' : '')"
                  >
                    {{ event.title }}
                    <span v-if="event._isArchived" class="text-xs text-gray-500 ml-1">📁</span>
                    <span v-else-if="event._isPast" class="text-xs text-amber-400 ml-1">⏰</span>
            </span>
          </div>
          <!-- Date et statut empilés -->
          <div class="flex flex-col items-center space-y-1">
            <span 
              class="text-xs text-center font-normal"
              :class="[
                      event._isArchived 
                  ? 'text-gray-500' 
                        : event._isPast 
                    ? 'text-amber-300' 
                    : 'text-gray-400'
              ]"
            >
                    {{ formatEventDate(event.date) }}
            </span>
            <StatusBadge 
                    :event-id="event.id" 
                    :event-status="getEventStatus(event)" 
            />
          </div>
        </div>
      </div>
          </th>
        </tr>
      </thead>

      <!-- Corps de la table -->
      <tbody class="relative z-[45]">

        <!-- Lignes de joueurs -->
        <tr v-for="player in props.displayedPlayers" :key="player.id">
        <!-- Cellule joueur -->
        <td 
            class="left-col-td bg-gray-900 px-4 py-3 cursor-pointer touch-manipulation hover:bg-gray-800 transition-colors sticky left-0 z-[50]"
          :style="{ 
            width: dynamicLeftColumnWidth, 
              minWidth: windowWidth > 768 ? '6rem' : dynamicLeftColumnWidth, 
            maxWidth: dynamicLeftColumnWidth 
          }"
          @click="showPlayerDetails(player)"
        >
          <div class="flex items-center space-x-2">
            <PlayerAvatar
              :player-id="player.id"
              :season-id="seasonId"
              :player-name="player.name"
              :player-gender="player.gender || 'non-specified'"
              :show-status-icons="true"
              :size="'lg'"
              :clickable="true"
              class="!w-10 !h-10"
              @click="showPlayerDetails(player)"
            />
            <span class="text-white font-medium text-sm">{{ player.name }}</span>
          </div>
        </td>
          
          <!-- Cellules de comptage des rôles -->
          <template v-if="showStatsColumns" v-for="(stats, index) in [playersRoleStats.get(player.name) || getDefaultStats()]" :key="`stats-${player.id}`">
            <!-- Colonnes de jeu - Détails (affichées conditionnellement) -->
            <template v-if="showJeuDetails">
              <td class="bg-amber-50 text-amber-700 text-center text-sm border-r border-b border-amber-200 cursor-pointer touch-manipulation" style="width: 90px; min-width: 90px;">
                <div class="flex flex-col items-center w-full" @click.stop="openStatPopover(getStatTooltip(stats.jeuMatch || 0, (playersDisposDeclines.get(player.name) || {})['jeuMatch']?.dispos || 0, (playersDisposDeclines.get(player.name) || {})['jeuMatch']?.declines || 0), $event)">
                  <span>{{ stats.jeuMatch || '' }}</span>
                  <span v-if="getEffectiveDispos((playersDisposDeclines.get(player.name) || {}).jeuMatch?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).jeuMatch?.declines || 0) > 0" class="text-xs font-normal text-amber-600/80 cursor-pointer touch-manipulation">({{ getStatPercent(stats.jeuMatch || 0, (playersDisposDeclines.get(player.name) || {}).jeuMatch?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).jeuMatch?.declines || 0) }}%)</span>
                </div>
              </td>
              <td class="bg-amber-50 text-amber-700 text-center text-sm border-r border-b border-amber-200 cursor-pointer touch-manipulation" style="width: 85px; min-width: 85px;">
                <div class="flex flex-col items-center w-full" @click.stop="openStatPopover(getStatTooltip(stats.jeuCab || 0, (playersDisposDeclines.get(player.name) || {})['jeuCab']?.dispos || 0, (playersDisposDeclines.get(player.name) || {})['jeuCab']?.declines || 0), $event)">
                  <span>{{ stats.jeuCab || '' }}</span>
                  <span v-if="getEffectiveDispos((playersDisposDeclines.get(player.name) || {}).jeuCab?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).jeuCab?.declines || 0) > 0" class="text-xs font-normal text-amber-600/80 cursor-pointer touch-manipulation">({{ getStatPercent(stats.jeuCab || 0, (playersDisposDeclines.get(player.name) || {}).jeuCab?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).jeuCab?.declines || 0) }}%)</span>
                </div>
              </td>
              <td class="bg-amber-50 text-amber-700 text-center text-sm border-r border-b border-amber-200 cursor-pointer touch-manipulation" style="width: 90px; min-width: 90px;">
                <div class="flex flex-col items-center w-full" @click.stop="openStatPopover(getStatTooltip(stats.jeuLong || 0, (playersDisposDeclines.get(player.name) || {})['jeuLong']?.dispos || 0, (playersDisposDeclines.get(player.name) || {})['jeuLong']?.declines || 0), $event)">
                  <span>{{ stats.jeuLong || '' }}</span>
                  <span v-if="getEffectiveDispos((playersDisposDeclines.get(player.name) || {}).jeuLong?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).jeuLong?.declines || 0) > 0" class="text-xs font-normal text-amber-600/80 cursor-pointer touch-manipulation">({{ getStatPercent(stats.jeuLong || 0, (playersDisposDeclines.get(player.name) || {}).jeuLong?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).jeuLong?.declines || 0) }}%)</span>
                </div>
              </td>
              <td class="bg-amber-50 text-amber-700 text-center text-sm border-r border-b border-amber-200 cursor-pointer touch-manipulation" style="width: 90px; min-width: 90px;">
                <div class="flex flex-col items-center w-full" @click.stop="openStatPopover(getStatTooltip(stats.jeuAutre || 0, (playersDisposDeclines.get(player.name) || {})['jeuAutre']?.dispos || 0, (playersDisposDeclines.get(player.name) || {})['jeuAutre']?.declines || 0), $event)">
                  <span>{{ stats.jeuAutre || '' }}</span>
                  <span v-if="getEffectiveDispos((playersDisposDeclines.get(player.name) || {}).jeuAutre?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).jeuAutre?.declines || 0) > 0" class="text-xs font-normal text-amber-600/80 cursor-pointer touch-manipulation">({{ getStatPercent(stats.jeuAutre || 0, (playersDisposDeclines.get(player.name) || {}).jeuAutre?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).jeuAutre?.declines || 0) }}%)</span>
                </div>
              </td>
            </template>
            <!-- Total Jeu -->
            <td 
              class="bg-amber-100 text-amber-800 text-center text-sm font-bold border-l-2 border-r border-b border-amber-200 cursor-pointer touch-manipulation"
              :style="!showJeuDetails && !showDecorumDetails && !showDeplacementDetails && !showBenevoleDetails ? 'width: 90px; min-width: 90px;' : 'width: 80px; min-width: 80px;'"
            >
              <div class="flex flex-col items-center w-full" @click.stop="openStatPopover(getStatTooltip(stats.totalJeu || 0, (playersDisposDeclines.get(player.name) || {})['totalJeu']?.dispos || 0, (playersDisposDeclines.get(player.name) || {})['totalJeu']?.declines || 0), $event)">
                <span>{{ stats.totalJeu || '' }}</span>
                <span v-if="getEffectiveDispos((playersDisposDeclines.get(player.name) || {}).totalJeu?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).totalJeu?.declines || 0) > 0" class="text-xs font-normal text-amber-600/80 cursor-pointer touch-manipulation">({{ getStatPercent(stats.totalJeu || 0, (playersDisposDeclines.get(player.name) || {}).totalJeu?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).totalJeu?.declines || 0) }}%)</span>
              </div>
            </td>
            
            <!-- Colonnes de décorum - Détails (affichées conditionnellement) -->
            <template v-if="showDecorumDetails">
              <td class="bg-violet-50 text-violet-700 text-center text-sm border-r border-b border-violet-200 cursor-pointer touch-manipulation" style="width: 60px; min-width: 60px;">
                <div class="flex flex-col items-center w-full" @click.stop="openStatPopover(getStatTooltip(stats.mc || 0, (playersDisposDeclines.get(player.name) || {})['mc']?.dispos || 0, (playersDisposDeclines.get(player.name) || {})['mc']?.declines || 0), $event)">
                  <span>{{ stats.mc || '' }}</span>
                  <span v-if="getEffectiveDispos((playersDisposDeclines.get(player.name) || {}).mc?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).mc?.declines || 0) > 0" class="text-xs font-normal text-violet-600/80 cursor-pointer touch-manipulation">({{ getStatPercent(stats.mc || 0, (playersDisposDeclines.get(player.name) || {}).mc?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).mc?.declines || 0) }}%)</span>
                </div>
              </td>
              <td class="bg-violet-50 text-violet-700 text-center text-sm border-r border-b border-violet-200 cursor-pointer touch-manipulation" style="width: 60px; min-width: 60px;">
                <div class="flex flex-col items-center w-full" @click.stop="openStatPopover(getStatTooltip(stats.dj || 0, (playersDisposDeclines.get(player.name) || {})['dj']?.dispos || 0, (playersDisposDeclines.get(player.name) || {})['dj']?.declines || 0), $event)">
                  <span>{{ stats.dj || '' }}</span>
                  <span v-if="getEffectiveDispos((playersDisposDeclines.get(player.name) || {}).dj?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).dj?.declines || 0) > 0" class="text-xs font-normal text-violet-600/80 cursor-pointer touch-manipulation">({{ getStatPercent(stats.dj || 0, (playersDisposDeclines.get(player.name) || {}).dj?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).dj?.declines || 0) }}%)</span>
                </div>
              </td>
              <td class="bg-violet-50 text-violet-700 text-center text-sm border-r border-b border-violet-200 cursor-pointer touch-manipulation" style="width: 80px; min-width: 80px;">
                <div class="flex flex-col items-center w-full" @click.stop="openStatPopover(getStatTooltip(stats.referee || 0, (playersDisposDeclines.get(player.name) || {})['referee']?.dispos || 0, (playersDisposDeclines.get(player.name) || {})['referee']?.declines || 0), $event)">
                  <span>{{ stats.referee || '' }}</span>
                  <span v-if="getEffectiveDispos((playersDisposDeclines.get(player.name) || {}).referee?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).referee?.declines || 0) > 0" class="text-xs font-normal text-violet-600/80 cursor-pointer touch-manipulation">({{ getStatPercent(stats.referee || 0, (playersDisposDeclines.get(player.name) || {}).referee?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).referee?.declines || 0) }}%)</span>
                </div>
              </td>
              <td class="bg-violet-50 text-violet-700 text-center text-sm border-r border-b border-violet-200 cursor-pointer touch-manipulation" style="width: 75px; min-width: 75px;">
                <div class="flex flex-col items-center w-full" @click.stop="openStatPopover(getStatTooltip(stats.assistantReferee || 0, (playersDisposDeclines.get(player.name) || {})['assistantReferee']?.dispos || 0, (playersDisposDeclines.get(player.name) || {})['assistantReferee']?.declines || 0), $event)">
                  <span>{{ stats.assistantReferee || '' }}</span>
                  <span v-if="getEffectiveDispos((playersDisposDeclines.get(player.name) || {}).assistantReferee?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).assistantReferee?.declines || 0) > 0" class="text-xs font-normal text-violet-600/80 cursor-pointer touch-manipulation">({{ getStatPercent(stats.assistantReferee || 0, (playersDisposDeclines.get(player.name) || {}).assistantReferee?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).assistantReferee?.declines || 0) }}%)</span>
                </div>
              </td>
              <td class="bg-violet-50 text-violet-700 text-center text-sm border-r border-b border-violet-200 cursor-pointer touch-manipulation" style="width: 70px; min-width: 70px;">
                <div class="flex flex-col items-center w-full" @click.stop="openStatPopover(getStatTooltip(stats.coach || 0, (playersDisposDeclines.get(player.name) || {})['coach']?.dispos || 0, (playersDisposDeclines.get(player.name) || {})['coach']?.declines || 0), $event)">
                  <span>{{ stats.coach || '' }}</span>
                  <span v-if="getEffectiveDispos((playersDisposDeclines.get(player.name) || {}).coach?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).coach?.declines || 0) > 0" class="text-xs font-normal text-violet-600/80 cursor-pointer touch-manipulation">({{ getStatPercent(stats.coach || 0, (playersDisposDeclines.get(player.name) || {}).coach?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).coach?.declines || 0) }}%)</span>
                </div>
              </td>
            </template>
            <!-- Total Decorum -->
            <td 
              class="bg-violet-100 text-violet-800 text-center text-sm font-bold border-l-2 border-r border-b border-violet-200 cursor-pointer touch-manipulation"
              :style="!showJeuDetails && !showDecorumDetails && !showDeplacementDetails && !showBenevoleDetails ? 'width: 90px; min-width: 90px;' : 'width: 100px; min-width: 100px;'"
            >
              <div class="flex flex-col items-center w-full" @click.stop="openStatPopover(getStatTooltip((stats.mc + stats.dj + stats.referee + stats.assistantReferee + stats.coach) || 0, (playersDisposDeclines.get(player.name) || {})['totalDecorum']?.dispos || 0, (playersDisposDeclines.get(player.name) || {})['totalDecorum']?.declines || 0), $event)">
                <span>{{ (stats.mc + stats.dj + stats.referee + stats.assistantReferee + stats.coach) || '' }}</span>
                <span v-if="getEffectiveDispos((playersDisposDeclines.get(player.name) || {}).totalDecorum?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).totalDecorum?.declines || 0) > 0" class="text-xs font-normal text-violet-600/80 cursor-pointer touch-manipulation">({{ getStatPercent((stats.mc + stats.dj + stats.referee + stats.assistantReferee + stats.coach) || 0, (playersDisposDeclines.get(player.name) || {}).totalDecorum?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).totalDecorum?.declines || 0) }}%)</span>
              </div>
            </td>
            
            <!-- Colonnes DEPLACEMENT - Détails (affichées conditionnellement) -->
            <template v-if="showDeplacementDetails">
              <td class="bg-teal-50 text-teal-700 text-center text-sm border-r border-b border-teal-200 cursor-pointer touch-manipulation" style="width: 70px; min-width: 70px;">
                <div class="flex flex-col items-center w-full" @click.stop="openStatPopover(getStatTooltip(stats.deplacementJeu || 0, (playersDisposDeclines.get(player.name) || {})['deplacementJeu']?.dispos || 0, (playersDisposDeclines.get(player.name) || {})['deplacementJeu']?.declines || 0), $event)">
                  <span>{{ stats.deplacementJeu || '' }}</span>
                  <span v-if="getEffectiveDispos((playersDisposDeclines.get(player.name) || {}).deplacementJeu?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).deplacementJeu?.declines || 0) > 0" class="text-xs font-normal text-teal-600/80 cursor-pointer touch-manipulation">({{ getStatPercent(stats.deplacementJeu || 0, (playersDisposDeclines.get(player.name) || {}).deplacementJeu?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).deplacementJeu?.declines || 0) }}%)</span>
                </div>
              </td>
              <td class="bg-teal-50 text-teal-700 text-center text-sm border-r border-b border-teal-200 cursor-pointer touch-manipulation" style="width: 75px; min-width: 75px;">
                <div class="flex flex-col items-center w-full" @click.stop="openStatPopover(getStatTooltip(stats.deplacementDecorum || 0, (playersDisposDeclines.get(player.name) || {})['deplacementDecorum']?.dispos || 0, (playersDisposDeclines.get(player.name) || {})['deplacementDecorum']?.declines || 0), $event)">
                  <span>{{ stats.deplacementDecorum || '' }}</span>
                  <span v-if="getEffectiveDispos((playersDisposDeclines.get(player.name) || {}).deplacementDecorum?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).deplacementDecorum?.declines || 0) > 0" class="text-xs font-normal text-teal-600/80 cursor-pointer touch-manipulation">({{ getStatPercent(stats.deplacementDecorum || 0, (playersDisposDeclines.get(player.name) || {}).deplacementDecorum?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).deplacementDecorum?.declines || 0) }}%)</span>
                </div>
              </td>
            </template>
            <!-- Total Déplacement -->
            <td 
              class="bg-teal-100 text-teal-800 text-center text-sm font-bold border-l-2 border-r border-b border-teal-200 cursor-pointer touch-manipulation"
              :style="!showDeplacementDetails ? 'width: 85px; min-width: 85px;' : 'width: 80px; min-width: 80px;'"
            >
              <div class="flex flex-col items-center w-full" @click.stop="openStatPopover(getStatTooltip(stats.totalDeplacement || 0, (playersDisposDeclines.get(player.name) || {})['totalDeplacement']?.dispos || 0, (playersDisposDeclines.get(player.name) || {})['totalDeplacement']?.declines || 0), $event)">
                <span>{{ stats.totalDeplacement || '' }}</span>
                <span v-if="getEffectiveDispos((playersDisposDeclines.get(player.name) || {}).totalDeplacement?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).totalDeplacement?.declines || 0) > 0" class="text-xs font-normal text-teal-600/80 cursor-pointer touch-manipulation">({{ getStatPercent(stats.totalDeplacement || 0, (playersDisposDeclines.get(player.name) || {}).totalDeplacement?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).totalDeplacement?.declines || 0) }}%)</span>
              </div>
            </td>
            
            <!-- Colonnes BÉNÉVOLE - Détails (affichées conditionnellement) -->
            <template v-if="showBenevoleDetails">
              <td class="bg-slate-50 text-slate-700 text-center text-sm border-r border-b border-slate-200 cursor-pointer touch-manipulation" style="width: 70px; min-width: 70px;">
                <div class="flex flex-col items-center w-full" @click.stop="openStatPopover(getStatTooltip(stats.stageManager || 0, (playersDisposDeclines.get(player.name) || {})['stageManager']?.dispos || 0, (playersDisposDeclines.get(player.name) || {})['stageManager']?.declines || 0), $event)">
                  <span>{{ stats.stageManager || '' }}</span>
                  <span v-if="getEffectiveDispos((playersDisposDeclines.get(player.name) || {}).stageManager?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).stageManager?.declines || 0) > 0" class="text-xs font-normal text-slate-600/80 cursor-pointer touch-manipulation">({{ getStatPercent(stats.stageManager || 0, (playersDisposDeclines.get(player.name) || {}).stageManager?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).stageManager?.declines || 0) }}%)</span>
                </div>
              </td>
              <td class="bg-slate-50 text-slate-700 text-center text-sm border-r border-b border-slate-200 cursor-pointer touch-manipulation" style="width: 65px; min-width: 65px;">
                <div class="flex flex-col items-center w-full" @click.stop="openStatPopover(getStatTooltip(stats.lighting || 0, (playersDisposDeclines.get(player.name) || {})['lighting']?.dispos || 0, (playersDisposDeclines.get(player.name) || {})['lighting']?.declines || 0), $event)">
                  <span>{{ stats.lighting || '' }}</span>
                  <span v-if="getEffectiveDispos((playersDisposDeclines.get(player.name) || {}).lighting?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).lighting?.declines || 0) > 0" class="text-xs font-normal text-slate-600/80 cursor-pointer touch-manipulation">({{ getStatPercent(stats.lighting || 0, (playersDisposDeclines.get(player.name) || {}).lighting?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).lighting?.declines || 0) }}%)</span>
                </div>
              </td>
              <td class="bg-slate-50 text-slate-700 text-center text-sm border-r border-b border-slate-200 cursor-pointer touch-manipulation" style="width: 70px; min-width: 70px;">
                <div class="flex flex-col items-center w-full" @click.stop="openStatPopover(getStatTooltip(stats.volunteer || 0, (playersDisposDeclines.get(player.name) || {})['volunteer']?.dispos || 0, (playersDisposDeclines.get(player.name) || {})['volunteer']?.declines || 0), $event)">
                  <span>{{ stats.volunteer || '' }}</span>
                  <span v-if="getEffectiveDispos((playersDisposDeclines.get(player.name) || {}).volunteer?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).volunteer?.declines || 0) > 0" class="text-xs font-normal text-slate-600/80 cursor-pointer touch-manipulation">({{ getStatPercent(stats.volunteer || 0, (playersDisposDeclines.get(player.name) || {}).volunteer?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).volunteer?.declines || 0) }}%)</span>
                </div>
              </td>
            </template>
            <!-- Total Bénévole -->
            <td 
              class="bg-slate-100 text-slate-700 text-center text-sm font-bold border-l-2 border-r border-b border-slate-200 cursor-pointer touch-manipulation"
              :style="!showJeuDetails && !showDecorumDetails && !showDeplacementDetails && !showBenevoleDetails ? 'width: 90px; min-width: 90px;' : 'width: 85px; min-width: 85px;'"
            >
              <div class="flex flex-col items-center w-full" @click.stop="openStatPopover(getStatTooltip(stats.totalBenevole || 0, (playersDisposDeclines.get(player.name) || {})['totalBenevole']?.dispos || 0, (playersDisposDeclines.get(player.name) || {})['totalBenevole']?.declines || 0), $event)">
                <span>{{ stats.totalBenevole || '' }}</span>
                <span v-if="getEffectiveDispos((playersDisposDeclines.get(player.name) || {}).totalBenevole?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).totalBenevole?.declines || 0) > 0" class="text-xs font-normal text-slate-600/80 cursor-pointer touch-manipulation">({{ getStatPercent(stats.totalBenevole || 0, (playersDisposDeclines.get(player.name) || {}).totalBenevole?.dispos || 0, (playersDisposDeclines.get(player.name) || {}).totalBenevole?.declines || 0) }}%)</span>
              </div>
            </td>
          </template>
        
        <!-- Cellules de sélection -->
        <td
            v-for="event in props.events"
          :key="`${player.id}-${event.id}`"
          class="col-event p-2 md:p-1"
            :style="{ width: `${eventColumnWidth}px`, minWidth: `${eventColumnWidth}px`, height: '4rem' }"
        >
          <SelectionCell
            :player-name="player.name"
            :event-id="event.id"
              :is-selected="getPlayerRoleInEvent(player.id, event.id) !== null"
              :is-selection-confirmed="props.isSelectionConfirmed(event.id)"
              :is-selection-confirmed-by-organizer="props.isSelectionConfirmedByOrganizer(event.id)"
              :player-selection-status="props.getPlayerSelectionStatus(player.name, event.id)"
            :season-id="seasonId"
            :can-edit="false"
              :availability-data="props.getAvailabilityData(player.name, event.id)"
            :player-gender="player.gender || 'non-specified'"
              :selection-data="getPlayerRoleInEvent(player.id, event.id) ? { role: getPlayerRoleInEvent(player.id, event.id), roleLabel: getPlayerRoleLabelInEvent(player.id, event.id, player.gender || 'non-specified') } : null"
              :roles-and-chances="getPlayerRolesAndChances(player.id, event.id, player.gender || 'non-specified')"
              :selected-role-chance="getPlayerRoleInEvent(player.id, event.id) && getPlayerSelectionStatusFromCast(player.id, event.id) === 'pending' ? getPlayerChanceForRole(player.id, event.id, getPlayerRoleInEvent(player.id, event.id)) : null"
              :can-edit-events="canEditEvents"
              :is-past-event="event._isPast"
          />
        </td>
        </tr>
        
        <!-- Ligne "Afficher Plus" -->
        <tr v-if="!isAllPlayersView && hiddenPlayersCount > 0">
          <td 
            class="left-col-td bg-gray-800 px-4 py-3 border-r border-gray-700"
            :style="{ 
              width: dynamicLeftColumnWidth, 
              minWidth: windowWidth > 768 ? '6rem' : dynamicLeftColumnWidth, 
              maxWidth: dynamicLeftColumnWidth 
            }"
          >
            <button
              class="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
              @click="addAllPlayersToGrid"
            >
              <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-normal">+</span>
              </div>
              <span class="text-sm">
                voir les {{ hiddenPlayersCount }} autres
              </span>
            </button>
        </td>
        
          <!-- Cellules vides pour les colonnes de rôles et événements -->
          <td :colspan="showMoreColspan - 1" class="bg-gray-800"></td>
          
          <!-- Cellules vides pour "Afficher Plus" -->
        </tr>
      </tbody>
    </table>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import PlayerAvatar from './PlayerAvatar.vue'
import SelectionCell from './SelectionCell.vue'
import StatusBadge from './StatusBadge.vue'
import { formatEventDate } from '../utils/dateUtils.js'
import { EVENT_TYPE_ICONS, ROLE_TEMPLATES, ROLES, getRoleLabel } from '../services/storage.js'
import { getEventStatusWithSelection } from '../services/eventStatusService.js'
import { loadPlayers, loadAvailability } from '../services/storage.js'
import { calculateAllRoleChances } from '../services/chancesService.js'
import { getPlayerCastStatus } from '../services/castService.js'
import logger from '../services/logger.js'

// Props
const props = defineProps({
  events: {
    type: Array,
    required: true
  },
  displayedPlayers: {
    type: Array,
    required: true
  },
  isAllPlayersView: {
    type: Boolean,
    default: false
  },
  hiddenPlayersCount: {
    type: Number,
    default: 0
  },
  hiddenPlayersDisplayText: {
    type: String,
    default: ''
  },
  canEditAvailability: {
    type: Boolean,
    default: false
  },
  canEditEvents: {
    type: Boolean,
    default: false
  },
  getPlayerAvailability: {
    type: Function,
    required: true
  },
  headerOffsetX: {
    type: Number,
    default: 0
  },
  headerScrollX: {
    type: Number,
    default: 0
  },
  // Props supplémentaires pour AvailabilityCell
  seasonId: {
    type: String,
    required: true
  },
  chances: {
    type: Object,
    default: () => ({})
  },
  isAvailable: {
    type: Function,
    required: true
  },
  isSelected: {
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
  isSelectionComplete: {
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
  // Props pour le calcul du statut des événements
  getSelectionPlayers: {
    type: Function,
    required: true
  },
  getTotalRequiredCount: {
    type: Function,
    required: true
  },
  countAvailablePlayers: {
    type: Function,
    required: true
  },
  casts: {
    type: Object,
    default: () => ({})
  },
  // Props pour les événements cachés
  isAllEventsView: {
    type: Boolean,
    default: false
  },
  hiddenEventsCount: {
    type: Number,
    default: 0
  },
  hiddenEventsDisplayText: {
    type: String,
    default: ''
  },
  // Props pour le calcul des chances
  countSelections: {
    type: Function,
    default: null
  },
  isAvailableForRole: {
    type: Function,
    default: null
  },
  availability: {
    type: Object,
    default: () => ({})
  },
  allSeasonPlayers: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'player-selected',
  'availability-changed',
  'scroll',
  'toggle-player-modal',
  'toggle-event-modal',
  'toggle-availability',
  'toggle-selection-status',
  'show-availability-modal',
  'event-click',
  'all-players-loaded',
  'all-events-loaded'
])

// State pour la réactivité de la largeur d'écran
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

// State pour contrôler l'affichage des colonnes de statistiques
const showStatsColumns = ref(true)

// State pour contrôler l'affichage des détails du décorum
const showDecorumDetails = ref(false)

// State pour contrôler l'affichage des détails du jeu
const showJeuDetails = ref(false)

// State pour contrôler l'affichage des détails déplacement
const showDeplacementDetails = ref(false)

// State pour contrôler l'affichage des détails bénévole
const showBenevoleDetails = ref(false)

// Popover stats : DOM natif pour éviter le re-render Vue (CastsView est lourd)
let statPopoverEl = null
const openStatPopover = (text, event) => {
  const close = () => {
    if (statPopoverEl) {
      statPopoverEl.remove()
      statPopoverEl = null
      document.removeEventListener('click', close, true)
    }
  }
  close()
  const padding = 8
  const maxWidth = 280
  let x = event.clientX
  let y = event.clientY + padding
  x = Math.max(padding, Math.min(window.innerWidth - maxWidth - padding, x - maxWidth / 2))
  y = Math.max(padding, Math.min(window.innerHeight - 80, y))
  const overlay = document.createElement('div')
  overlay.className = 'fixed inset-0 z-[2000]'
  overlay.style.touchAction = 'manipulation'
  overlay.setAttribute('aria-label', 'Fermer')
  overlay.addEventListener('click', (e) => { e.stopPropagation(); close() })
  const popover = document.createElement('div')
  popover.className = 'absolute bg-gray-800 text-white rounded-lg shadow-xl px-4 py-3 max-w-[280px] text-center text-sm border border-gray-600'
  popover.style.left = x + 'px'
  popover.style.top = y + 'px'
  popover.textContent = text
  popover.addEventListener('click', (e) => e.stopPropagation())
  overlay.appendChild(popover)
  document.body.appendChild(overlay)
  statPopoverEl = overlay
}

// Écouter les changements de taille d'écran
onMounted(() => {
  const updateWindowWidth = () => {
    windowWidth.value = window.innerWidth
  }
  
  updateWindowWidth()
  window.addEventListener('resize', updateWindowWidth)
  
  onUnmounted(() => {
    window.removeEventListener('resize', updateWindowWidth)
  })
})

// Calculer la largeur dynamique de la colonne des événements
const dynamicLeftColumnWidth = computed(() => {
  const playerCount = props.displayedPlayers?.length || 0
  const hiddenCount = props.hiddenPlayersCount || 0
  const totalPlayers = playerCount + hiddenCount
  
  // Sur mobile (iPhone SE), utiliser des largeurs plus importantes pour la lisibilité
  if (windowWidth.value <= 375) {
    // iPhone SE : largeur fixe plus importante pour la lisibilité
    return '10rem' // 160px - suffisant pour lire noms de joueurs
  }
  // iPhone 16 Plus et écrans moyens
  else if (windowWidth.value <= 430) {
    return '8rem' // 128px
  }
  // Desktop et autres écrans
  else {
    // Si peu de joueurs (1-3), colonne plus étroite
    if (totalPlayers <= 3) {
      return '5rem' // 80px
    }
    // Si nombre moyen de joueurs (4-10), colonne moyenne
    else if (totalPlayers <= 10) {
      return '7rem' // 112px
    }
    // Si beaucoup de joueurs (11+), colonne plus large
    else {
      return '10rem' // 160px
    }
  }
})

// Fonctions de calcul des statistiques de rôles
function calculatePlayerRoleStats(playerName) {
  // Trouver l'ID du joueur à partir de son nom
  const player = props.displayedPlayers.find(p => p.name === playerName)
  if (!player) {
    console.log(`❌ Joueur ${playerName} non trouvé dans displayedPlayers`)
    return { mc: 0, dj: 0, referee: 0, assistantReferee: 0, coach: 0, jeuMatch: 0, jeuCab: 0, jeuLong: 0, jeuAutre: 0, totalJeu: 0, deplacementJeu: 0, deplacementDecorum: 0, totalDeplacement: 0, stageManager: 0, lighting: 0, volunteer: 0, totalBenevole: 0 }
  }
  
  const playerId = player.id
  
  const stats = {
    // Rôles de décorum (spectacles locaux uniquement)
    mc: 0,
    dj: 0,
    referee: 0,
    assistantReferee: 0,
    coach: 0,
    // Rôles de jeu (spectacles locaux uniquement)
    jeuMatch: 0,
    jeuCab: 0,
    jeuLong: 0,
    jeuAutre: 0,
    totalJeu: 0,
    // Déplacement (événements deplacement uniquement)
    deplacementJeu: 0,
    deplacementDecorum: 0,
    totalDeplacement: 0,
    // Bénévoles détaillés (tous événements)
    stageManager: 0,
    lighting: 0,
    volunteer: 0,
    totalBenevole: 0
  }

  // Parcourir tous les événements pour compter les rôles
  props.events.forEach(event => {
    // Règle 1: L'événement ne doit pas être archivé
    if (event.archived === true) {
      return
    }
    
    // Utiliser les données de casts pour obtenir les sélections
    const eventCasts = props.casts[event.id] || {}
    
    // Règle 2: La sélection doit avoir été verrouillée (confirmée par l'organisateur)
    if (!eventCasts || !eventCasts.confirmed) {
      return
    }
    
    // Règle 3: Vérifier si le joueur a décliné
    let hasDeclined = false
    // Vérifier dans la nouvelle structure declined
    if (eventCasts.declined) {
      Object.values(eventCasts.declined).forEach(playerIds => {
        if (Array.isArray(playerIds)) {
          if (playerIds.includes(playerId)) {
            hasDeclined = true
          }
        }
      })
    }
    // Fallback sur l'ancienne structure playerStatuses
    if (!hasDeclined && eventCasts.playerStatuses && eventCasts.playerStatuses[playerId] === 'declined') {
      hasDeclined = true
    }
    
    if (hasDeclined) {
      return
    }
    
    // Trouver le joueur par son ID dans les rôles
    let playerRole = null
    if (eventCasts.roles) {
      // Chercher dans chaque rôle
      Object.entries(eventCasts.roles).forEach(([role, players]) => {
        if (Array.isArray(players)) {
          players.forEach(player => {
            // Comparer avec l'ID du joueur
            const playerIdentifier = typeof player === 'string' ? player : (player.id || player.name || player)
            if (playerIdentifier === playerId) {
              playerRole = role
            }
          })
        }
      })
    }
    
    if (playerRole) {
      const isDeplacement = event.templateType === 'deplacement'

      switch (playerRole) {
        case 'mc':
          if (isDeplacement) stats.deplacementDecorum++
          else stats.mc++
          break
        case 'dj':
          if (isDeplacement) stats.deplacementDecorum++
          else stats.dj++
          break
        case 'referee':
          if (isDeplacement) stats.deplacementDecorum++
          else stats.referee++
          break
        case 'assistant_referee':
          if (isDeplacement) stats.deplacementDecorum++
          else stats.assistantReferee++
          break
        case 'coach':
          if (isDeplacement) stats.deplacementDecorum++
          else stats.coach++
          break
        case 'player':
          if (isDeplacement) {
            stats.deplacementJeu++
          } else {
            switch (event.templateType) {
              case 'match':
                stats.jeuMatch++
                break
              case 'cabaret':
                stats.jeuCab++
                break
              case 'longform':
                stats.jeuLong++
                break
              default:
                stats.jeuAutre++
                break
            }
          }
          break
        case 'stage_manager':
          stats.stageManager++
          break
        case 'lighting':
          stats.lighting++
          break
        case 'volunteer':
          stats.volunteer++
          break
      }
    }
  })

  stats.totalJeu = stats.jeuMatch + stats.jeuCab + stats.jeuLong + stats.jeuAutre
  stats.totalDeplacement = stats.deplacementJeu + stats.deplacementDecorum
  stats.totalBenevole = stats.stageManager + stats.lighting + stats.volunteer

  return stats
}

function getDefaultStats() {
  return { mc: 0, dj: 0, referee: 0, assistantReferee: 0, coach: 0, jeuMatch: 0, jeuCab: 0, jeuLong: 0, jeuAutre: 0, totalJeu: 0, deplacementJeu: 0, deplacementDecorum: 0, totalDeplacement: 0, stageManager: 0, lighting: 0, volunteer: 0, totalBenevole: 0 }
}

// Configuration des colonnes pour le calcul dispos/declines
const COLUMN_KEYS = [
  'jeuMatch', 'jeuCab', 'jeuLong', 'jeuAutre', 'totalJeu',
  'mc', 'dj', 'referee', 'assistantReferee', 'coach', 'totalDecorum',
  'deplacementJeu', 'deplacementDecorum', 'totalDeplacement',
  'stageManager', 'lighting', 'volunteer', 'totalBenevole'
]

function eventMatchesColumn(event, columnKey) {
  const t = event.templateType || 'custom'
  const isDepl = t === 'deplacement'
  switch (columnKey) {
    case 'jeuMatch': return !isDepl && t === 'match'
    case 'jeuCab': return !isDepl && t === 'cabaret'
    case 'jeuLong': return !isDepl && t === 'longform'
    case 'jeuAutre': return !isDepl && ['freeform', 'catch', 'custom', 'survey'].includes(t)
    case 'totalJeu': return !isDepl
    case 'mc':
    case 'dj':
    case 'referee':
    case 'assistantReferee':
    case 'coach': return !isDepl
    case 'totalDecorum': return !isDepl
    case 'deplacementJeu':
    case 'deplacementDecorum':
    case 'totalDeplacement': return isDepl
    case 'stageManager':
    case 'lighting':
    case 'volunteer':
    case 'totalBenevole': return true
    default: return false
  }
}

function getRolesForColumn(columnKey) {
  const DECORUM = ['mc', 'dj', 'referee', 'assistant_referee', 'coach']
  const BENEVOLE = ['stage_manager', 'lighting', 'volunteer']
  switch (columnKey) {
    case 'jeuMatch':
    case 'jeuCab':
    case 'jeuLong':
    case 'jeuAutre':
    case 'totalJeu':
    case 'deplacementJeu': return ['player']
    case 'mc': return ['mc']
    case 'dj': return ['dj']
    case 'referee': return ['referee']
    case 'assistantReferee': return ['assistant_referee']
    case 'coach': return ['coach']
    case 'totalDecorum':
    case 'deplacementDecorum': return DECORUM
    case 'totalDeplacement': return ['player', ...DECORUM]
    case 'stageManager': return ['stage_manager']
    case 'lighting': return ['lighting']
    case 'volunteer': return ['volunteer']
    case 'totalBenevole': return BENEVOLE
    default: return []
  }
}

function isPlayerAvailableForColumn(playerName, event, columnKey) {
  if (!props.isAvailableForRole) return false
  const roles = getRolesForColumn(columnKey)
  const eventRoles = event.roles || (event.playerCount > 0 ? { player: event.playerCount || 6 } : {})
  for (const role of roles) {
    const count = eventRoles[role] || 0
    if (count > 0 && props.isAvailableForRole(playerName, role, event.id)) {
      return true
    }
  }
  return false
}

function isPlayerDeclinedForColumn(cast, playerId, columnKey) {
  if (!cast?.declined) return false
  const roles = getRolesForColumn(columnKey)
  for (const role of roles) {
    const playerIds = cast.declined[role]
    if (Array.isArray(playerIds) && playerIds.includes(playerId)) return true
  }
  if (cast.playerStatuses?.[playerId] === 'declined') {
    return roles.includes('player')
  }
  return false
}

function calculatePlayerDisposAndDeclines(playerName) {
  const player = props.displayedPlayers.find(p => p.name === playerName)
  if (!player) {
    const empty = Object.fromEntries(COLUMN_KEYS.map(k => [k, { dispos: 0, declines: 0 }]))
    return empty
  }
  const playerId = player.id
  const result = {}
  COLUMN_KEYS.forEach(k => { result[k] = { dispos: 0, declines: 0 } })

  props.events.forEach(event => {
    if (event.archived === true) return
    const cast = props.casts[event.id] || {}
    if (!cast.confirmed) return

    COLUMN_KEYS.forEach(columnKey => {
      if (!eventMatchesColumn(event, columnKey)) return
      if (isPlayerAvailableForColumn(playerName, event, columnKey)) {
        result[columnKey].dispos++
      }
      if (isPlayerDeclinedForColumn(cast, playerId, columnKey)) {
        result[columnKey].declines++
      }
    })
  })

  return result
}

function getEffectiveDispos(dispos, declines) {
  return Math.max(0, dispos - declines)
}

// Les « sélections » de calculatePlayerRoleStats excluent déjà les désistements (l.939-941)
// Dénominateur = max(effective, selections) : évite >100% quand dispos sous-estime
// (ex. disponibilité non enregistrée pour un événement où le joueur a joué)
function getStatPercent(selections, dispos, declines) {
  const effective = getEffectiveDispos(dispos, declines)
  if (effective <= 0 && selections <= 0) return null
  const denominator = Math.max(effective, selections)
  if (denominator <= 0) return null
  return Math.min(100, Math.round((selections / denominator) * 100))
}

function getStatTooltip(selections, dispos, declines) {
  if (dispos === 0) return 'Aucune dispo dans cette catégorie'
  if (declines === 0) {
    return `${selections} sélection${selections !== 1 ? 's' : ''} sur ${dispos} dispo${dispos !== 1 ? 's' : ''}`
  }
  return `${selections} sélection${selections !== 1 ? 's' : ''} sur ${dispos} dispos (dont ${declines} désistement${declines !== 1 ? 's' : ''})`
}

// Fonction pour obtenir le rôle d'un joueur dans un événement spécifique
function getPlayerRoleInEvent(playerId, eventId) {
  const eventCasts = props.casts[eventId] || {}
  if (eventCasts.roles) {
    for (const [role, players] of Object.entries(eventCasts.roles)) {
      if (Array.isArray(players)) {
        for (const player of players) {
          const playerIdentifier = typeof player === 'string' ? player : (player.id || player.name || player)
          if (playerIdentifier === playerId) {
            return role
          }
        }
      }
    }
  }
  return null
}

// Fonction pour obtenir le label français du rôle d'un joueur dans un événement
function getPlayerRoleLabelInEvent(playerId, eventId, playerGender = 'non-specified') {
  const role = getPlayerRoleInEvent(playerId, eventId)
  if (role) {
    return getRoleLabel(role, playerGender)
  }
  return null
}

// Fonction pour obtenir directement le statut de sélection d'un joueur depuis le cast
// (sans passer par getPlayerSelectionStatus qui filtre selon les permissions)
function getPlayerSelectionStatusFromCast(playerId, eventId) {
  const cast = props.casts[eventId]
  if (!cast) return null
  
  // Trouver le nom du joueur à partir de l'ID
  const player = props.displayedPlayers.find(p => p.id === playerId)
  if (!player) {
    return null
  }
  
  // Vérifier d'abord si le joueur est dans la section déclinés
  if (cast.declined) {
    for (const [role, playerIds] of Object.entries(cast.declined)) {
      if (Array.isArray(playerIds) && playerIds.includes(playerId)) {
        return 'declined'
      }
    }
  }
  
  // Utiliser getPlayerCastStatus pour obtenir le statut
  // Utiliser allSeasonPlayers pour être sûr d'avoir tous les joueurs
  return getPlayerCastStatus(cast, player.name, props.allSeasonPlayers.length > 0 ? props.allSeasonPlayers : props.displayedPlayers)
}

// Fonction pour calculer le pourcentage de chance pour un rôle spécifique d'un joueur
function getPlayerChanceForRole(playerId, eventId, role) {
  // Trouver le nom du joueur à partir de l'ID
  const player = props.displayedPlayers.find(p => p.id === playerId)
  if (!player) {
    return null
  }
  
  // Trouver l'événement correspondant
  const event = props.events.find(e => e.id === eventId)
  if (!event) {
    return null
  }
  
  // Vérifier que les props nécessaires sont disponibles pour calculer les chances
  if (!props.countSelections || !props.isAvailableForRole || !props.allSeasonPlayers || props.allSeasonPlayers.length === 0) {
    return null
  }
  
  // Créer une fonction countSelections qui exclut l'événement en cours (même logique que EventRoleGroupingView)
  const countSelectionsExcludingCurrentEvent = (playerName, roleKey) => {
    if (!props.countSelections) return 0
    return props.countSelections(playerName, roleKey, eventId, event.templateType)
  }
  
  // Calculer les chances pour tous les rôles (même logique que EventRoleGroupingView)
  const allRoleChances = calculateAllRoleChances(
    event,
    props.allSeasonPlayers,
    props.availability,
    countSelectionsExcludingCurrentEvent,
    props.isAvailableForRole
  )
  
  // Récupérer les chances pour ce rôle spécifique
  const roleData = allRoleChances[role]
  if (!roleData || !roleData.candidates) {
    return null
  }
  
  const candidate = roleData.candidates.find(c => c.name === player.name)
  return candidate ? Math.round(candidate.practicalChance) : null
}

// Fonction pour obtenir les rôles et chances d'un joueur pour un événement
function getPlayerRolesAndChances(playerId, eventId, playerGender = 'non-specified') {
  // Si le joueur est sélectionné ET la composition est validée, on n'affiche pas les chances
  const selectedRole = getPlayerRoleInEvent(playerId, eventId)
  if (selectedRole && props.isSelectionConfirmedByOrganizer(eventId)) {
    return null
  }
  
  // Trouver le nom du joueur à partir de l'ID
  const player = props.displayedPlayers.find(p => p.id === playerId)
  if (!player) {
    return null
  }
  
  // Récupérer les données d'availability avec le nom du joueur
  const availabilityData = props.getAvailabilityData(player.name, eventId)
  
  if (!availabilityData?.available || !availabilityData?.roles || availabilityData.roles.length === 0) {
    return null
  }
  
  // Trouver l'événement correspondant
  const event = props.events.find(e => e.id === eventId)
  if (!event) {
    return null
  }
  
  // Vérifier que les props nécessaires sont disponibles pour calculer les chances
  if (!props.countSelections || !props.isAvailableForRole || !props.allSeasonPlayers || props.allSeasonPlayers.length === 0) {
    // Si les props ne sont pas disponibles, retourner les rôles sans chances
    const rolesWithChances = availabilityData.roles.map(role => {
      const roleLabel = getRoleLabel(role, playerGender)
      return {
        role: role,
        label: roleLabel,
        chance: null
      }
    })
    return rolesWithChances
  }
  
  // Créer une fonction countSelections qui exclut l'événement en cours (même logique que EventRoleGroupingView)
  const countSelectionsExcludingCurrentEvent = (playerName, role) => {
    if (!props.countSelections) return 0
    return props.countSelections(playerName, role, eventId, event.templateType)
  }
  
  // Calculer les chances pour tous les rôles (même logique que EventRoleGroupingView)
  const allRoleChances = calculateAllRoleChances(
    event,
    props.allSeasonPlayers,
    props.availability,
    countSelectionsExcludingCurrentEvent,
    props.isAvailableForRole
  )
  
  // Mapper les rôles avec leurs chances calculées
  const rolesWithChances = availabilityData.roles.map(role => {
    const roleLabel = getRoleLabel(role, playerGender)
    
    // Récupérer les chances pour ce rôle
    const roleData = allRoleChances[role]
    let chance = null
    
    if (roleData && roleData.candidates) {
      const candidate = roleData.candidates.find(c => c.name === player.name)
      if (candidate) {
        chance = Math.round(candidate.practicalChance)
      }
    }
    
    return {
      role: role,
      label: roleLabel,
      chance: chance
    }
  })
  
  return rolesWithChances
}

// Computed property pour les statistiques de tous les joueurs
const playersRoleStats = computed(() => {
  const statsMap = new Map()
  
  props.displayedPlayers.forEach(player => {
    statsMap.set(player.name, calculatePlayerRoleStats(player.name))
  })
  
  return statsMap
})

// Computed property pour dispos et declines par joueur et par colonne
const playersDisposDeclines = computed(() => {
  const map = new Map()
  props.displayedPlayers.forEach(player => {
    map.set(player.name, calculatePlayerDisposAndDeclines(player.name))
  })
  return map
})

// Computed property pour calculer le nombre de colonnes de décorum visibles
const decorumColumnsCount = computed(() => {
  if (!showStatsColumns.value) return 0
  // Total Decorum est toujours visible (1 colonne)
  // + 5 colonnes de détails si showDecorumDetails est true
  return 1 + (showDecorumDetails.value ? 5 : 0)
})

// Computed property pour calculer le nombre de colonnes de jeu visibles
const jeuColumnsCount = computed(() => {
  if (!showStatsColumns.value) return 0
  return 1 + (showJeuDetails.value ? 4 : 0)
})

// Computed property pour calculer le nombre de colonnes déplacement visibles
const deplacementColumnsCount = computed(() => {
  if (!showStatsColumns.value) return 0
  return 1 + (showDeplacementDetails.value ? 2 : 0)
})

// Computed property pour calculer le nombre de colonnes bénévole visibles
const benevoleColumnsCount = computed(() => {
  if (!showStatsColumns.value) return 0
  return 1 + (showBenevoleDetails.value ? 3 : 0)
})

// Computed property pour le colspan de la ligne "Afficher Plus"
const showMoreColspan = computed(() => {
  const baseColumns = 1
  const statsColumns = showStatsColumns.value
    ? jeuColumnsCount.value + decorumColumnsCount.value + deplacementColumnsCount.value + benevoleColumnsCount.value
    : 0
  const eventColumns = props.events.length
  return baseColumns + statsColumns + eventColumns
})

// Fonction pour basculer l'affichage des colonnes de statistiques
function toggleStatsColumns() {
  showStatsColumns.value = !showStatsColumns.value
}

// Fonction pour basculer l'affichage des détails du décorum
function toggleDecorumDetails() {
  showDecorumDetails.value = !showDecorumDetails.value
}

// Fonction pour basculer l'affichage des détails du jeu
function toggleJeuDetails() {
  showJeuDetails.value = !showJeuDetails.value
}

// Fonction pour basculer l'affichage des détails déplacement
function toggleDeplacementDetails() {
  showDeplacementDetails.value = !showDeplacementDetails.value
}

// Fonction pour basculer l'affichage des détails bénévole
function toggleBenevoleDetails() {
  showBenevoleDetails.value = !showBenevoleDetails.value
}

// Fonction d'export vers Excel/Google Sheets
function exportToExcel() {
  try {
    // Créer les données pour l'export
    const exportData = []
    
    // En-têtes
    const headers = [
      'Joueur',
      'JEU MATCH',
      'JEU CAB',
      'JEU LONG',
      'JEU AUTRE',
      'TOTAL JEU',
      'MC',
      'DJ',
      'ARBITRE',
      'ASSIST.',
      'COACH',
      'TOTAL DECORUM',
      'DEPL. JEU',
      'DEPL. DECORUM',
      'TOTAL DÉPLACEMENT',
      'RÉGISSEUR',
      'LUMIÈRE',
      'BÉNÉVOLE',
      'TOTAL BÉNÉVOLE',
      ...props.events.map(event => event.title)
    ]
    exportData.push(headers)
    
    // Données pour chaque joueur
    props.displayedPlayers.forEach(player => {
      const stats = playersRoleStats.value.get(player.name) || getDefaultStats()
      const playerRow = [
        player.name,
        stats.jeuMatch,
        stats.jeuCab,
        stats.jeuLong,
        stats.jeuAutre,
        stats.totalJeu,
        stats.mc,
        stats.dj,
        stats.referee,
        stats.assistantReferee,
        stats.coach,
        stats.mc + stats.dj + stats.referee + stats.assistantReferee + stats.coach,
        stats.deplacementJeu,
        stats.deplacementDecorum,
        stats.totalDeplacement,
        stats.stageManager,
        stats.lighting,
        stats.volunteer,
        stats.totalBenevole,
        ...props.events.map(event => {
          const roleLabel = getPlayerRoleLabelInEvent(player.id, event.id, player.gender || 'non-specified')
          return roleLabel || ''
        })
      ]
      exportData.push(playerRow)
    })
    
    // Convertir en CSV
    const csvContent = exportData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n')
    
    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `compositions-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    logger.debug('✅ Export CSV généré avec succès')
  } catch (error) {
    logger.error('❌ Erreur lors de l\'export:', error)
  }
}

// Computed
const participantsTitle = computed(() => {
  if (!props.displayedPlayers) return 'Participants (0)'
  const count = props.displayedPlayers.length || 0
  
  // Texte plus court sur mobile
  if (window.innerWidth <= 430) {
    return `Part. (${count})`
  }
  
  return `Participants (${count})`
})

const eventColumnWidth = ref(300) // Valeur par défaut

const updateEventColumnWidth = () => {
  if (windowWidth.value <= 375) {
    eventColumnWidth.value = 144 // 9rem pour iPhone 16 et plus petit
  } else if (windowWidth.value <= 430) {
    eventColumnWidth.value = 160 // 10rem pour iPhone 16 Plus
  } else if (windowWidth.value <= 768) {
    eventColumnWidth.value = 160 // 10rem pour écrans moyens
  } else {
    eventColumnWidth.value = 300 // Desktop - plus d'espace pour les titres d'événements
  }
}

// Écouter les changements de taille d'écran
onMounted(() => {
  updateEventColumnWidth()
  window.addEventListener('resize', updateEventColumnWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateEventColumnWidth)
})

// Fonctions utilitaires
const getEventIcon = (event) => {
  return EVENT_TYPE_ICONS[event.templateType] || '❓'
}

const getEventStatus = (event) => {
  return getEventStatusWithSelection(event, {
    getSelectionPlayers: props.getSelectionPlayers,
    getTotalRequiredCount: props.getTotalRequiredCount,
    countAvailablePlayers: props.countAvailablePlayers,
    isSelectionConfirmed: props.isSelectionConfirmed,
    isSelectionConfirmedByOrganizer: props.isSelectionConfirmedByOrganizer,
    casts: props.casts
  })
}

// Methods
const showPlayerDetails = (player) => {
  emit('player-selected', player)
}

const handleAvailabilityChanged = (data) => {
  emit('availability-changed', data)
}

const handleScroll = (event) => {
  emit('scroll', event)
}

const togglePlayerModal = () => {
  emit('toggle-player-modal')
}

const toggleEventModal = () => {
  emit('toggle-event-modal')
}

const toggleAvailability = (playerName, eventId) => {
  emit('toggle-availability', playerName, eventId)
}

const toggleSelectionStatus = (playerName, eventId, status, seasonId) => {
  emit('toggle-selection-status', playerName, eventId, status, seasonId)
}

const openAvailabilityModal = (data) => {
  emit('show-availability-modal', data)
}

const openConfirmationModal = (data) => {
  emit('show-confirmation-modal', data)
}

const openEventModal = (event) => {
  emit('event-click', event)
}

// Fonction pour ajouter tous les joueurs à la grille
async function addAllPlayersToGrid() {
  try {
    logger.debug('🔄 Chargement de tous les joueurs de la saison...')
    
    // Charger tous les joueurs
    const allPlayers = await loadPlayers(props.seasonId)
    
    // Recharger les disponibilités pour tous les joueurs
    const newAvailability = await loadAvailability(allPlayers, props.events, props.seasonId)
    
    logger.debug(`📊 Chargé ${allPlayers.length} joueurs (mode "tous")`)
    logger.debug('✅ Tous les joueurs chargés avec leurs disponibilités')
    
    // Émettre l'événement pour notifier le parent
    emit('all-players-loaded', { players: allPlayers, availability: newAvailability })
  } catch (error) {
    logger.error('❌ Erreur lors du chargement de tous les joueurs:', error)
  }
}

// Fonction pour ajouter tous les événements à la grille
async function addAllEventsToGrid() {
  try {
    logger.debug('🔄 Chargement de tous les événements de la saison...')
    
    // Émettre l'événement pour notifier le parent de charger tous les événements
    emit('all-events-loaded')
    
    logger.debug('✅ Demande de chargement de tous les événements envoyée')
  } catch (error) {
    logger.error('❌ Erreur lors du chargement de tous les événements:', error)
  }
}
</script>

<!-- Styles gérés par BaseGridView.vue -->