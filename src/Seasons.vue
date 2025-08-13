<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            <!-- Barre de navigation sticky -->
        <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300" :class="isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg' : 'bg-gray-900/20 backdrop-blur-sm'">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo HatCast à gauche -->
          <div class="flex items-center">
            <a href="/" class="flex items-center">
              <div class="relative w-48 h-12 md:w-56 md:h-14">
                <img 
                  src="/logos/hatcast-logo-mobile.png" 
                  alt="Logo HatCast - Retour à l'accueil" 
                  class="w-full h-full drop-shadow-lg transform hover:scale-105 transition-all duration-300 md:hidden"
                />
                <img 
                  src="/logos/hatcast-logo-desktop.png" 
                  alt="Logo HatCast - Retour à l'accueil" 
                  class="w-full h-full drop-shadow-lg transform hover:scale-105 transition-all duration-300 hidden md:block"
                />
              </div>
            </a>
          </div>
          
                         <!-- Navigation à droite -->
               <div class="flex items-center">
                 <!-- Bouton Connexion ou Mon Compte selon l'état -->
                 <button 
                   v-if="!currentUser"
                   @click="openAccountLogin"
                   class="px-4 py-2 rounded-lg transition-all duration-300 border transition-colors"
                   :class="isScrolled ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700' : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40'"
                 >
                   Connexion
                 </button>
                 <!-- Icône Mon Compte si connecté (même style que GridBoard) -->
                 <button 
                   v-else
                   @click="openAccountMenu"
                   class="text-white hover:text-purple-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
                   title="Mon compte"
                   aria-label="Mon compte"
                 >
                   <span class="text-2xl">👤</span>
                 </button>
               </div>
        </div>
      </nav>
    </header>

    <!-- Section Hero -->
    <section class="hero-section relative overflow-hidden pt-24">



      <!-- Contenu du Hero à 2 colonnes -->
      <div class="hero-content py-16 md:py-24 px-4 relative z-10">
        <div class="container mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            <!-- Colonne gauche : Contenu principal -->
            <div class="text-center order-2 lg:order-1">
              <div class="hero-content-wrapper">
                
                <!-- Illustration avec mockup de l'app (masquée sur mobile) -->
                <div class="hero-illustration relative hidden lg:block">
                  <!-- Mockup principal avec screenshot de la grille -->
                  <div class="relative mx-auto lg:mx-0 w-full max-w-lg">
                    <!-- Fond du mockup avec effet de profondeur -->
                    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-4 shadow-2xl border border-white/10 relative overflow-hidden">
                      <!-- Halo lumineux en arrière-plan -->
                      <div class="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
                      <!-- Contenu du mockup -->
                      <div class="relative z-10">
                        <!-- Barre de titre du mockup -->
                        <div class="flex items-center gap-3 mb-4">
                          <div class="flex gap-2">
                            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                          <div class="text-gray-400 text-sm">HatCast - Grille des disponibilités</div>
                        </div>
                      </div>
                      
                      <!-- Screenshot simulé de la grille -->
                      <div class="bg-gray-700 rounded-2xl p-4 min-h-[300px]">
                        <!-- En-tête avec événements -->
                        <div class="grid grid-cols-4 gap-2 mb-4">
                          <div class="text-center text-xs text-gray-300 bg-gray-600 rounded p-2">15 Jan</div>
                          <div class="text-center text-xs text-gray-300 bg-gray-600 rounded p-2">22 Jan</div>
                          <div class="text-center text-xs text-gray-300 bg-gray-600 rounded p-2">29 Jan</div>
                          <div class="text-center text-xs text-gray-300 bg-gray-600 rounded p-2">5 Fév</div>
                        </div>
                        
                        <!-- Lignes des joueurs -->
                        <div class="space-y-2">
                          <div class="flex items-center gap-2">
                            <div class="w-16 text-xs text-gray-300">Marie</div>
                            <div class="grid grid-cols-4 gap-2 flex-1">
                              <div class="h-6 bg-green-500/20 border border-green-500/30 rounded"></div>
                              <div class="h-6 bg-red-500/20 border border-red-500/30 rounded"></div>
                              <div class="h-6 bg-green-500/20 border border-green-500/30 rounded"></div>
                              <div class="h-6 bg-gray-500/20 border border-gray-500/30 rounded"></div>
                            </div>
                          </div>
                          <div class="flex items-center gap-2">
                            <div class="w-16 text-xs text-gray-300">Pierre</div>
                            <div class="grid grid-cols-4 gap-2 flex-1">
                              <div class="h-6 bg-green-500/20 border border-green-500/30 rounded"></div>
                              <div class="h-6 bg-green-500/20 border border-green-500/30 rounded"></div>
                              <div class="h-6 bg-red-500/20 border border-red-500/30 rounded"></div>
                              <div class="h-6 bg-green-500/20 border border-green-500/30 rounded"></div>
                            </div>
                          </div>
                          <div class="flex items-center gap-2">
                            <div class="w-16 text-xs text-gray-300">Sophie</div>
                            <div class="grid grid-cols-4 gap-2 flex-1">
                              <div class="h-6 bg-red-500/20 border border-red-500/30 rounded"></div>
                              <div class="h-6 bg-green-500/20 border border-green-500/30 rounded"></div>
                              <div class="h-6 bg-green-500/20 border border-green-500/30 rounded"></div>
                              <div class="h-6 bg-green-500/20 border border-green-500/30 rounded"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                    
                  <!-- Éléments flottants décoratifs -->
                  <div class="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl shadow-xl transform rotate-12 z-30"></div>
                  <div class="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl shadow-xl transform -rotate-12 z-30 flex items-center justify-center">
                    <img src="/logos/hatcast-mask.png" alt="Masque HatCast" class="w-10 h-10 object-contain transform rotate-12" />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Colonne droite : Contenu et CTA -->
            <div class="text-center lg:text-left order-1 lg:order-2">
              <!-- Titre principal -->
              <div class="hero-title mb-8">
                <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                  Faites vos équipes d'impro…<br>en un clin d'œil
                </h1>
              </div>
              
              <!-- Sous-titre -->
              <div class="hero-subtitle mb-10">
                <p class="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                  Plus de casse-tête pour savoir qui joue quand. Chacun indique ses dispos, 
                  <strong class="text-white">HatCast compose l'équipe pour vous</strong>, équitablement et sans tension.
                </p>
              </div>
              
              <!-- Call-to-action principal -->
              <div class="hero-cta mb-10">
                <div class="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <button 
                    @click="showCreateModal = true"
                    class="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-5 px-10 rounded-full shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105 text-lg md:text-xl"
                  >
                    🚀 Démarrez
                  </button>
                  
                  <!-- CTA secondaire discret -->
                  <button
                    @click="scrollToHelp"
                    class="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 font-medium py-3 px-6 rounded-lg hover:bg-cyan-500/10 transition-all duration-300 border border-cyan-500/30 hover:border-cyan-400/50"
                  >
                    <span>ℹ️</span>
                    En savoir plus
                  </button>
                </div>
              </div>
              
              <!-- Indication cliquable vers les saisons -->
              <div class="hero-hint text-center">
                <button
                  @click="scrollToSeasons"
                  class="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-300 transition-all duration-300 text-sm cursor-pointer group"
                >
                  <span class="group-hover:animate-bounce">↓</span>
                  <span>Vos saisons ci-dessous</span>
                  <span class="group-hover:animate-bounce">↓</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Effets visuels du hero -->
      <div class="hero-background absolute inset-0 z-0">
        <!-- Cercles décoratifs -->
        <div class="absolute top-20 left-10 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>
    </section>

    <!-- Section des saisons -->
    <section class="seasons-section py-16">
      <div class="container mx-auto px-4">
        <!-- Titre de section -->
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Saisons en cours
          </h2>
          <p class="text-xl text-gray-300 max-w-2xl mx-auto">
            Sélectionnez une saison pour gérer les disponibilités et équipes.
          </p>
        </div>

        <div class="pb-16" :aria-busy="isLoading">
          <!-- Grille des saisons (chargement) -->
          <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto justify-items-center place-content-center animate-pulse">
            <div v-for="n in 8" :key="'skeleton-'+n" class="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-sm">
              <div class="w-16 h-16 bg-white/10 rounded-full mx-auto mb-6"></div>
              <div class="h-6 bg-white/10 rounded mb-4 w-2/3 mx-auto"></div>
              <div class="h-px bg-white/10 mb-4"></div>
              <div class="h-4 bg-white/10 rounded w-1/2 mx-auto"></div>
            </div>
          </div>

          <!-- Grille des saisons (données) -->
          <div v-else-if="seasons.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto justify-items-center place-content-center">
            <div
              v-for="(season, index) in sortedSeasons"
              :key="season.id"
              class="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 w-full max-w-sm"
            >
              <div @click="goToSeason(season.slug)" class="text-center cursor-pointer">
                <div class="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <span class="text-2xl">🎭</span>
                </div>
                <h2 class="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
                  {{ season.name }}
                </h2>
                <div class="w-full bg-gradient-to-r from-transparent via-white/20 to-transparent h-px mb-4"></div>
                <!-- Statistiques de la saison -->
                <div class="flex justify-center gap-6 text-sm">
                  <div class="text-center">
                    <div class="text-white font-semibold">{{ season.events?.length || 0 }}</div>
                    <div class="text-gray-400 text-xs">Événements</div>
                  </div>
                  <div class="text-center">
                    <div class="text-white font-semibold">{{ season.players?.length || 0 }}</div>
                    <div class="text-gray-400 text-xs">Joueurs</div>
                  </div>
                </div>

              </div>

              <!-- Menu 3 points -->
              <div class="absolute top-4 right-4">
                <div class="relative" @click.stop>
                  <button
                    @click="toggleMenu(index)"
                    class="p-1 rounded-full text-gray-300 hover:text-white hover:bg-white/10"
                    :aria-expanded="openMenuIndex === index"
                    aria-haspopup="true"
                    title="Options"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.75a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                    </svg>
                  </button>
                  <div
                    v-if="openMenuIndex === index"
                    class="absolute right-0 mt-2 w-44 bg-gray-900 border border-white/10 rounded-lg shadow-xl py-1 z-10"
                    role="menu"
                  >
                    <button @click="exportSeasonAvailabilityCsv(season); closeMenu()" class="w-full text-left px-4 py-2 text-sm text-emerald-300 hover:bg-white/10" role="menuitem">
                      Exporter CSV
                    </button>
                    <div class="border-t border-white/10 my-1"></div>
                    <button @click="moveSeasonUp(index)" class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10" role="menuitem">
                      Monter
                    </button>
                    <button @click="moveSeasonDown(index)" class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10" role="menuitem">
                      Descendre
                    </button>
                    <div class="border-t border-white/10 my-1"></div>
                    <button @click="confirmDeleteSeason(season)" class="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10" role="menuitem">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

                  <!-- Bouton Nouvelle saison -->
        <div class="text-center mt-12">
          <button
            @click="showCreateModal = true"
            class="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-pink-500/25"
          >
            <span>➕</span>
            Nouvelle saison
          </button>
        </div>

          <!-- Message si aucune saison -->
          <div v-if="!isLoading && seasons.length === 0" class="text-center py-16">
            <div class="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <span class="text-4xl">🎪</span>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Aucune saison créée</h3>
            <p class="text-gray-300 mb-8">Commencez par créer votre première saison de spectacles !</p>
            <button 
              @click="showCreateModal = true"
              class="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-xl hover:shadow-pink-500/25 transition-all duration-300"
            >
              Créer ma première saison
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal de création de saison -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-white text-center">✨ Nouvelle saison</h2>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">Nom de la saison</label>
          <input
            v-model="newSeasonName"
            type="text"
            class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
            placeholder="Ex: La Malice 2025-2026"
            @input="generateSlug"
          >
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">Slug (URL)</label>
          <input
            v-model="newSeasonSlug"
            type="text"
            class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
            placeholder="Ex: malice-2025-2026"
          >
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">Code PIN (4 chiffres)</label>
          <input
            v-model="newSeasonPin"
            type="text"
            inputmode="numeric"
            maxlength="4"
            pattern="[0-9]{4}"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
            placeholder="1234"
            @input="validatePin"
          >
          <p class="text-xs text-gray-400 mt-1">Ce code protégera les opérations sensibles (suppressions, sélections)</p>
        </div>
        <div class="flex justify-end space-x-3">
          <button
            @click="cancelCreate"
            class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            @click="createSeason"
            :disabled="!newSeasonName.trim() || !newSeasonSlug.trim() || !newSeasonPin.trim() || newSeasonPin.length !== 4"
            class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300"
          >
            Créer
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span class="text-2xl">⚠️</span>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2>
          <p class="text-gray-300">Êtes-vous sûr de vouloir supprimer la saison "{{ seasonToDelete?.name }}" ?</p>
        </div>
        <p class="mb-6 text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-500/20">
          ⚠️ Cette action est irréversible et supprimera toutes les données de cette saison.
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="cancelDelete"
            class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            @click="deleteSeasonWithPin"
            class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
          >
            Supprimer
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

    <!-- Section d'aide - Kezako ? -->
    <section class="help-section py-20 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-t border-white/10">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <!-- Titre principal -->
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Qu'est-ce que HatCast ?
            </h2>
            <p class="text-xl text-purple-300 max-w-3xl mx-auto">
              L'appli pour sélectionner vos joueurs d'impro simplement, équitablement et sans prise de tête
            </p>
          </div>

          <!-- Grille 2×3 des fonctionnalités -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <!-- Gestion des saisons -->
            <div class="text-center p-6 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl border border-white/10">
              <div class="w-20 h-20 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-pink-500/30">
                <span class="text-4xl">🎭</span>
              </div>
              <h3 class="text-xl font-bold text-white mb-3">Gestion des saisons</h3>
              <p class="text-gray-300 text-sm leading-relaxed">
                Déclarez tous vos spectacles et indiquez combien de joueurs vous aurez besoin. 
                Organisez votre saison d'impro de A à Z.
              </p>
            </div>

            <!-- Sondage de disponibilités -->
            <div class="text-center p-6 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl border border-white/10">
              <div class="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-cyan-600/20 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-purple-500/30">
                <span class="text-4xl">📅</span>
              </div>
              <h3 class="text-xl font-bold text-white mb-3">Sondage de disponibilités</h3>
              <p class="text-gray-300 text-sm leading-relaxed">
                Créez des sondages pour vos événements. Chaque joueur indique ses disponibilités 
                et HatCast optimise la composition des équipes.
              </p>
            </div>

            <!-- Sélection auto ou manuelle -->
            <div class="text-center p-6 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl border border-white/10">
              <div class="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-pink-600/20 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-cyan-500/30">
                <span class="text-4xl">🎲</span>
              </div>
              <h3 class="text-xl font-bold text-white mb-3">Sélection auto ou manuelle</h3>
              <p class="text-gray-300 text-sm leading-relaxed">
                Laissez le hasard pondéré décider ou reprenez la main à tout moment.
              </p>
            </div>

            <!-- Pensé pour le mobile -->
            <div class="text-center p-6 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl border border-white/10">
              <div class="w-20 h-20 bg-gradient-to-br from-green-500/20 to-blue-600/20 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-green-500/30">
                <span class="text-4xl">📱</span>
              </div>
              <h3 class="text-xl font-bold text-white mb-3">Pensé pour le mobile</h3>
              <p class="text-gray-300 text-sm leading-relaxed">
                Utilisez HatCast facilement sur smartphone ou tablette, où que vous soyez.
              </p>
            </div>

            <!-- Comptes facultatifs -->
            <div class="text-center p-6 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl border border-white/10">
              <div class="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-blue-500/30">
                <span class="text-4xl">🔐</span>
              </div>
              <h3 class="text-xl font-bold text-white mb-3">Comptes facultatifs</h3>
              <p class="text-gray-300 text-sm leading-relaxed">
                Créez un compte pour recevoir des rappels et sécuriser vos infos.
              </p>
            </div>

            <!-- Notifications intelligentes -->
            <div class="text-center p-6 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl border border-white/10">
              <div class="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-emerald-500/30">
                <span class="text-4xl">🔔</span>
              </div>
              <h3 class="text-xl font-bold text-white mb-3">Notifications intelligentes</h3>
              <p class="text-gray-300 text-sm leading-relaxed">
                Recevez des alertes par email et push pour les événements et sélections. 
                Restez informé sans être submergé.
              </p>
            </div>
          </div>


        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-white/10 bg-gradient-to-br from-gray-900/50 to-gray-800/50">
      <div class="container mx-auto px-4 py-12">
        <!-- Section principale du footer -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <!-- Logo et description -->
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center gap-3 mb-4">
              <div class="relative w-32 h-8">
                <img 
                  src="/logos/hatcast-logo-mobile.png" 
                  alt="Logo HatCast" 
                  class="w-full h-full opacity-80"
                />
              </div>
            </div>
            <p class="text-gray-400 text-sm leading-relaxed max-w-md">
              L'appli pour sélectionner vos joueurs d'impro simplement, équitablement et sans prise de tête.
            </p>
          </div>
          
          <!-- Contact -->
          <div>
            <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <div class="space-y-2">
              <a href="mailto:contact@hatcast.app" class="block text-gray-400 hover:text-blue-300 transition-colors text-sm">
                📧 contact@hatcast.app
              </a>
              <p class="text-gray-500 text-xs">Retours et suggestions bienvenus</p>
            </div>
          </div>
          
          <!-- Ressources -->
          <div>
            <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Ressources</h4>
            <div class="space-y-2">
              <a href="#" class="block text-gray-400 hover:text-blue-300 transition-colors text-sm">
                📚 Guide utilisateur
              </a>
              <a href="https://github.com/plamarque/hatcast" target="_blank" rel="noopener noreferrer" class="block text-gray-400 hover:text-blue-300 transition-colors text-sm">
                🔗 Code source
              </a>
              <p class="text-gray-500 text-xs">Documentation en cours</p>
            </div>
          </div>
        </div>
        
        <!-- Séparateur -->
        <div class="border-t border-white/10 mb-6"></div>
        
        <!-- Copyright et licence -->
        <div class="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <div class="flex items-center gap-4 mb-4 sm:mb-0">
            <span>© Patrice Lamarque 2025</span>
            <span class="hidden sm:inline">•</span>
            <span>Licence MIT</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-gray-600">En cours de développement</span>
            <a
              href="https://github.com/plamarque/hatcast"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-400 hover:text-blue-300 transition-colors underline decoration-gray-600 hover:decoration-blue-300"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>

    <!-- Modal de connexion -->
    <AccountLoginModal
      :show="showAccountLogin"
      @close="closeAccountLogin"
      @success="onLoginSuccess"
    />

    <!-- Menu Mon Compte -->
    <AccountMenu
      :show="showAccountMenu"
      @close="closeAccountMenu"
      @logout-device="handleLogout"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getSeasons, addSeason, deleteSeason, verifySeasonPin, setSeasonSortOrder } from './services/seasons.js'
import pinSessionManager from './services/pinSession.js'
import { useRouter } from 'vue-router'
import PinModal from './components/PinModal.vue'
import AccountLoginModal from './components/AccountLoginModal.vue'
import AccountMenu from './components/AccountMenu.vue'
import logger from './services/logger.js'
import { loadEvents, loadPlayers, loadAvailability, loadSelections, setStorageMode, initializeStorage } from './services/storage.js'
import { auth } from './services/firebase.js'
import { getLastVisitedSeason } from './services/seasonPreferences.js'

const seasons = ref([])
const isLoading = ref(true)
const router = useRouter()
const openMenuIndex = ref(null)

// État des modals
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const newSeasonName = ref('')
const newSeasonSlug = ref('')
const newSeasonPin = ref('')
const seasonToDelete = ref(null)

// Variables pour la protection par PIN
const showPinModal = ref(false)
const pendingOperation = ref(null)
const pinErrorMessage = ref('')

// Variables pour la gestion de compte
const currentUser = ref(null)
const showAccountLogin = ref(false)
const showAccountMenu = ref(false)

// État du scroll pour le header sticky
const isScrolled = ref(false)




onMounted(async () => {
  try {
    // Initialiser le mode de stockage Firebase
    setStorageMode('firebase')
    await initializeStorage()
    
    // Charger vite les saisons pour afficher rapidement
    seasons.value = await getSeasons()
    logger.info('Saisons chargées', { count: seasons.value?.length || 0 })
    
    // Charger les événements et joueurs pour chaque saison
    if (seasons.value.length > 0) {
      const seasonsWithData = await Promise.all(
        seasons.value.map(async (season) => {
          try {
            const [events, players] = await Promise.all([
              loadEvents(season.id),
              loadPlayers(season.id)
            ])
            logger.debug(`Saison ${season.name}: ${events?.length || 0} événements, ${players?.length || 0} joueurs`)
            return {
              ...season,
              events: events || [],
              players: players || []
            }
          } catch (error) {
            logger.warn(`Erreur lors du chargement des données pour la saison ${season.id}`, error)
            return {
              ...season,
              events: [],
              players: []
            }
          }
        })
      )
      seasons.value = seasonsWithData
      logger.info('Données des saisons chargées', { count: seasons.value.length })
    }
    
    // Lancer les migrations en arrière-plan
    migrateMissingSortOrders().catch(err => logger.error('Migration sortOrder échouée', err))
  } finally {
    isLoading.value = false
  }

  // Détecter le scroll pour le header sticky
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 10
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  // Cleanup lors de la destruction du composant
  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
})

// Tri contrôlé: par sortOrder croissant, puis createdAt desc, puis nom
const sortedSeasons = computed(() => {
  return [...seasons.value].sort((a, b) => {
    const aOrder = typeof a.sortOrder === 'number' ? a.sortOrder : Number.MAX_SAFE_INTEGER
    const bOrder = typeof b.sortOrder === 'number' ? b.sortOrder : Number.MAX_SAFE_INTEGER
    if (aOrder !== bOrder) return aOrder - bOrder

    // fallback: createdAt (Timestamp Firestore) desc
    const aCreated = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
    const bCreated = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
    if (aCreated !== bCreated) return bCreated - aCreated

    // dernier secours: nom asc
    return (a.name || '').localeCompare(b.name || '')
  })
})

function goToSeason(slug) {
  router.push(`/season/${slug}`)
}

function toggleMenu(index) {
  openMenuIndex.value = openMenuIndex.value === index ? null : index
}

function closeMenu() {
  openMenuIndex.value = null
}

function scrollToHelp() {
  const helpSection = document.querySelector('.help-section')
  if (helpSection) {
    helpSection.scrollIntoView({ behavior: 'smooth' })
  }
}

function scrollToSeasons() {
  const seasonsSection = document.querySelector('.seasons-section')
  if (seasonsSection) {
    seasonsSection.scrollIntoView({ behavior: 'smooth' })
  }
}

async function migrateMissingSortOrders() {
  // Si aucune saison, rien à faire
  if (!seasons.value.length) return
  // Trouver l'ordre max existant
  const existingOrders = seasons.value
    .map(s => (typeof s.sortOrder === 'number' ? s.sortOrder : null))
    .filter(v => v !== null)
  let maxOrder = existingOrders.length ? Math.max(...existingOrders) : 0

  // Affecter un sortOrder aux saisons qui n'en ont pas, en les plaçant après
  for (const s of seasons.value) {
    if (typeof s.sortOrder !== 'number') {
      maxOrder += 1
      try {
        await setSeasonSortOrder(s.id, maxOrder)
        s.sortOrder = maxOrder
      } catch (e) {
        logger.error('Erreur migration sortOrder', { seasonName: s?.name, error: e })
      }
    }
  }
}

// -------- Export CSV (saison) --------
async function exportSeasonAvailabilityCsv(season) {
  try {
    if (!season?.id) {
      alert('Saison introuvable')
      return
    }

    // Charger données de la saison
    const [events, players] = await Promise.all([
      loadEvents(season.id),
      loadPlayers(season.id)
    ])
    const [availability, selections] = await Promise.all([
      loadAvailability(players, events, season.id),
      loadSelections(season.id)
    ])

    // Construire l'en-tête
    const header = ['Joueur', ...events.map(e => formatCsvHeaderForEvent(e))]

    // Lignes
    const rows = []
    for (const player of players) {
      const name = player?.name || ''
      const availMap = availability?.[name] || {}
      const line = [name, ...events.map(e => cellValue(availMap[e.id], selections?.[e.id], name))]
      rows.push(line)
    }

    // Générer CSV (avec BOM pour Excel)
    const csv = toCsvString([header, ...rows])
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const base = season?.name || season?.slug || 'saison'
    const fileName = `${sanitizeFilename(base)}-disponibilites.csv`

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    logger.info('Export CSV saison', { seasonId: season.id, events: events.length, players: players.length })
  } catch (err) {
    logger.error('Erreur export CSV', err)
    alert('Erreur lors de l\'export CSV. Veuillez réessayer.')
  }
}

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

function formatCsvHeaderForEvent(event) {
  const dateObj = toDateObject(event?.date)
  const iso = dateObj ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}` : ''
  const title = event?.title || 'Sans titre'
  return `${iso} · ${title}`.trim()
}

function availabilityToString(value) {
  if (value === true || value === 'oui') return 'disponible'
  if (value === false || value === 'non') return 'non disponible'
  return ''
}

function toCsvString(matrix) {
  return matrix.map(row => row.map(csvEscape).join(',')).join('\n')
}

function csvEscape(value) {
  const str = String(value ?? '')
  if (/[",\n\r]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

function sanitizeFilename(name) {
  return String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\-_. ]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$|^\.+|\.+$/g, '')
    || 'fichier'
}

function cellValue(availabilityValue, selectedList, playerName) {
  const isSelected = Array.isArray(selectedList) && selectedList.includes(playerName)
  if (isSelected) {
    if (availabilityValue === false || availabilityValue === 'non') return 'non disponible'
    return 'sélectionné'
  }
  return availabilityToString(availabilityValue)
}

async function moveSeasonUp(index) {
  closeMenu()
  if (index <= 0) return
  const list = [...sortedSeasons.value]
  const current = list[index]
  const prev = list[index - 1]
  const temp = current.sortOrder
  current.sortOrder = prev.sortOrder
  prev.sortOrder = temp
  try {
    await Promise.all([
      setSeasonSortOrder(current.id, current.sortOrder),
      setSeasonSortOrder(prev.id, prev.sortOrder)
    ])
  } catch (e) {
    logger.error('Erreur lors du déplacement vers le haut', e)
  }
}

async function moveSeasonDown(index) {
  closeMenu()
  const list = [...sortedSeasons.value]
  if (index >= list.length - 1) return
  const current = list[index]
  const next = list[index + 1]
  const temp = current.sortOrder
  current.sortOrder = next.sortOrder
  next.sortOrder = temp
  try {
    await Promise.all([
      setSeasonSortOrder(current.id, current.sortOrder),
      setSeasonSortOrder(next.id, next.sortOrder)
    ])
  } catch (e) {
    logger.error('Erreur lors du déplacement vers le bas', e)
  }
}

// Génération automatique du slug
function generateSlug() {
  if (newSeasonName.value) {
    newSeasonSlug.value = newSeasonName.value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }
}

// Validation du PIN
function validatePin() {
  // Garder seulement les chiffres
  newSeasonPin.value = newSeasonPin.value.replace(/[^0-9]/g, '')
  // Limiter à 4 chiffres
  if (newSeasonPin.value.length > 4) {
    newSeasonPin.value = newSeasonPin.value.slice(0, 4)
  }
}

// Création de saison
async function createSeason() {
  if (!newSeasonName.value.trim() || !newSeasonSlug.value.trim() || !newSeasonPin.value.trim()) {
    alert('Veuillez remplir tous les champs, y compris le code PIN à 4 chiffres')
    return
  }

  if (newSeasonPin.value.length !== 4) {
    alert('Le code PIN doit contenir exactement 4 chiffres')
    return
  }

  try {
    await addSeason(newSeasonName.value.trim(), newSeasonSlug.value.trim(), newSeasonPin.value.trim())
    seasons.value = await getSeasons() // Recharger la liste
    await migrateMissingSortOrders() // Assigner un ordre si manquant (nouvelles saisons en dernier)
    cancelCreate()
  } catch (error) {
    logger.error('Erreur lors de la création de la saison', error)
    alert('Erreur lors de la création de la saison. Veuillez réessayer.')
  }
}

function cancelCreate() {
  showCreateModal.value = false
  newSeasonName.value = ''
  newSeasonSlug.value = ''
  newSeasonPin.value = ''
}

// Suppression de saison
function confirmDeleteSeason(season) {
  seasonToDelete.value = season
  showDeleteModal.value = true
}

async function deleteSeasonWithPin() {
  // Fermer la modal de confirmation
  showDeleteModal.value = false
  
  // Demander le PIN code avant de supprimer
  await requirePin({
    type: 'deleteSeason',
    data: { seasonId: seasonToDelete.value.id, seasonName: seasonToDelete.value.name }
  })
}

async function deleteSeasonConfirmed() {
  logger.debug('deleteSeasonConfirmed appelé', { hasSeason: !!seasonToDelete.value })
  if (!seasonToDelete.value) {
    logger.warn('Aucune saison à supprimer')
    return
  }

  try {
    logger.info('Suppression de la saison', { seasonId: seasonToDelete.value.id })
    await deleteSeason(seasonToDelete.value.id)
    logger.info('Saison supprimée, rechargement de la liste')
    seasons.value = await getSeasons() // Recharger la liste
    logger.info('Liste des saisons rechargée', { count: seasons.value?.length || 0 })
    cancelDelete()
  } catch (error) {
    logger.error('Erreur lors de la suppression de la saison', error)
    alert('Erreur lors de la suppression de la saison. Veuillez réessayer.')
  }
}

function cancelDelete() {
  showDeleteModal.value = false
  seasonToDelete.value = null
}

// Fonctions pour la protection par PIN
function getPinModalMessage() {
  if (!pendingOperation.value) return 'Veuillez saisir le code PIN à 4 chiffres'
  
  const messages = {
    deleteSeason: 'Suppression de saison - Code PIN requis'
  }
  
  return messages[pendingOperation.value.type] || 'Code PIN requis'
}

async function requirePin(operation) {
  // Vérifier si le PIN est déjà en cache pour cette saison
  if (pinSessionManager.isPinCached(seasonToDelete.value.id)) {
    const cachedPin = pinSessionManager.getCachedPin(seasonToDelete.value.id)
    logger.debug('PIN en cache trouvé, utilisation automatique')
    
    // Vérifier que le PIN est toujours valide
    const isValid = await verifySeasonPin(seasonToDelete.value.id, cachedPin)
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

async function handlePinSubmit(pinCode) {
  logger.debug('PIN soumis pour l\'opération', { operationType: pendingOperation.value?.type })
  try {
    const seasonId = pendingOperation.value?.data?.seasonId || seasonToDelete.value?.id
    const isValid = await verifySeasonPin(seasonId, pinCode)
    logger.debug('PIN validé', { valid: isValid })
    
    if (isValid) {
      // Sauvegarder le PIN en session
      pinSessionManager.saveSession(seasonId, pinCode)
      
      logger.debug('PIN correct, fermeture de la modal et exécution de l\'opération')
      showPinModal.value = false
      const operationToExecute = pendingOperation.value
      pendingOperation.value = null
      
      // Exécuter l'opération en attente
      logger.debug('Appel de executePendingOperation', { operationType: operationToExecute?.type })
      await executePendingOperation(operationToExecute)
    } else {
      pinErrorMessage.value = 'Code PIN incorrect'
      // Réinitialiser le message d'erreur après 3 secondes
      setTimeout(() => {
        pinErrorMessage.value = ''
      }, 3000)
    }
  } catch (error) {
    logger.error('Erreur lors de la vérification du PIN', error)
    pinErrorMessage.value = 'Erreur lors de la vérification du code PIN'
  }
}

function handlePinCancel() {
  showPinModal.value = false
  pendingOperation.value = null
  pinErrorMessage.value = ''
}

function getSessionInfo() {
  if (seasonToDelete.value && pinSessionManager.isPinCached(seasonToDelete.value.id)) {
    return {
      timeRemaining: pinSessionManager.getTimeRemaining(),
      isExpiringSoon: pinSessionManager.isExpiringSoon()
    }
  }
  return null
}

async function executePendingOperation(operation) {
  logger.debug('executePendingOperation appelé', { hasOperation: !!operation })
  if (!operation) {
    logger.warn('Aucune opération à exécuter')
    return
  }
  
  const { type, data } = operation
  logger.info('Exécution de l\'opération', { type })
  
  try {
    switch (type) {
      case 'deleteSeason':
        logger.info('Suppression de la saison', { seasonId: data.seasonId })
        await deleteSeason(data.seasonId)
        logger.info('Saison supprimée, rechargement de la liste')
        seasons.value = await getSeasons() // Recharger la liste
        logger.info('Liste des saisons rechargée', { count: seasons.value?.length || 0 })
        break
      default:
        logger.warn('Type d\'opération non reconnu', { type })
    }
  } catch (error) {
    logger.error('Erreur lors de l\'exécution de l\'opération', error)
    alert('Erreur lors de l\'opération. Veuillez réessayer.')
  }
}

// Gestion de l'état de connexion
function onAuthStateChanged(user) {
  currentUser.value = user
  logger.debug('État de connexion changé', { 
    isLoggedIn: !!user, 
    email: user?.email || 'non connecté' 
  })
}

// Fonctions de gestion de compte
function openAccountLogin() {
  showAccountLogin.value = true
}

function closeAccountLogin() {
  showAccountLogin.value = false
}

function onLoginSuccess() {
  showAccountLogin.value = false
  // Rediriger vers la saison préférée ou scroll vers les saisons
  handlePostLoginNavigation()
}

function openAccountMenu() {
  showAccountMenu.value = true
}

function closeAccountMenu() {
  showAccountMenu.value = false
}

async function handleLogout() {
  try {
    await auth.signOut()
    showAccountMenu.value = false
    currentUser.value = null
    logger.info('Utilisateur déconnecté avec succès')
  } catch (error) {
    logger.error('Erreur lors de la déconnexion', error)
    alert('Erreur lors de la déconnexion. Veuillez réessayer.')
  }
}

async function handlePostLoginNavigation() {
  try {
    // Essayer de récupérer la saison préférée
    const lastSeason = await getLastVisitedSeason()
    if (lastSeason) {
      // Rediriger vers la saison préférée
      router.push(`/season/${lastSeason}`)
      return
    }
  } catch (error) {
    logger.warn('Impossible de récupérer la saison préférée', error)
  }
  
  // Sinon, scroll vers la section des saisons
  scrollToSeasons()
}

// Initialisation de l'écouteur d'état d'authentification
onMounted(() => {
  // Initialiser l'état de connexion
  currentUser.value = auth.currentUser
  
  // Écouter les changements d'état d'authentification
  const unsubscribe = auth.onAuthStateChanged(onAuthStateChanged)
  
  // Cleanup lors de la destruction du composant
  return () => {
    unsubscribe()
  }
})
</script>
