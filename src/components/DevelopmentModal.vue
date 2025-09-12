<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1260] p-4" @click="closeModal">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" @click.stop>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
          <span class="text-purple-400">🛠️</span>
          Outils de Développement
        </h3>
        <button @click="closeModal" class="text-white/80 hover:text-white">✖️</button>
      </div>

      <!-- Onglets -->
      <div class="mb-6">
        <div class="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            ]"
          >
            <span class="mr-2">{{ tab.icon }}</span>
            {{ tab.name }}
          </button>
        </div>
      </div>

      <!-- Contenu des onglets -->
      <div class="space-y-6">
        <!-- Onglet PWA -->
        <div v-if="activeTab === 'pwa'" class="space-y-6">
          <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 class="font-semibold mb-3 text-blue-200 flex items-center gap-2">
              📱 PWA (Progressive Web App)
            </h4>
            <div class="space-y-3">
              <!-- Test de notification push -->
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div class="text-sm text-gray-300">Test de notification push</div>
                <button @click="sendTestPush" :disabled="testPushLoading || !email" class="px-3 py-1 rounded bg-emerald-600 text-white text-xs hover:bg-emerald-500 disabled:opacity-50">
                  {{ testPushLoading ? 'Envoi…' : 'Envoyer un test' }}
                </button>
              </div>
              
              <!-- Test de mise à jour PWA -->
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div class="text-sm text-gray-300">Test de mise à jour PWA</div>
                <button @click="testPwaUpdate" class="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-500 transition-colors">
                  🧪 Simuler maj
                </button>
              </div>
              
              <!-- Renvoyer la barre d'installation PWA -->
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div class="text-sm text-gray-300">Renvoyer la barre d'installation PWA</div>
                <button @click="showPwaInstallPrompt" class="px-3 py-1 rounded bg-yellow-600 text-white text-xs hover:bg-yellow-500 transition-colors">
                  📱 Afficher install
                </button>
              </div>
              
              <!-- Informations techniques PWA -->
              <div class="p-3 bg-white/5 rounded-lg border border-white/10 space-y-2">
                <div v-if="testPushSuccess" class="text-sm text-green-300">✅ Notification test envoyée (vérifiez votre appareil)</div>
                <div v-if="testPushError" class="text-sm text-red-300">❌ {{ testPushError }}</div>
                <div v-if="fcmToken" class="text-xs text-gray-400 break-all">🔑 FCM token: {{ fcmToken }}</div>
                <div class="text-xs text-gray-500">🔐 VAPID: {{ vapidKeyPreview || 'indisponible' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Email -->
        <div v-if="activeTab === 'email'" class="space-y-6">
          <div class="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
            <h4 class="font-semibold mb-3 text-purple-200 flex items-center gap-2">
              📧 Email
            </h4>
            <div class="space-y-3">
              <!-- Test des emails sécurisés -->
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div class="text-sm text-gray-300">Test des emails sécurisés</div>
                <button @click="showEmailTest = true" class="px-3 py-1 rounded bg-purple-600 text-white text-xs hover:bg-purple-500 transition-colors">
                  📧 Tester emails
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Debug -->
        <div v-if="activeTab === 'debug'" class="space-y-6">
          <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 class="font-semibold mb-3 text-green-200 flex items-center gap-2">
              🔍 Debug
            </h4>
            <div class="space-y-3">
              <!-- Niveau de log actuel -->
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div class="text-sm text-gray-300">
                  Niveau de log: 
                  <span class="px-2 py-1 rounded text-xs font-medium ml-2"
                        :class="{
                          'bg-green-600/30 text-green-300 border border-green-500/30': currentLogLevel === 'debug',
                          'bg-blue-600/30 text-blue-300 border border-blue-500/30': currentLogLevel === 'info',
                          'bg-yellow-600/30 text-yellow-300 border border-yellow-500/30': currentLogLevel === 'warn',
                          'bg-red-600/30 text-red-300 border border-red-500/30': currentLogLevel === 'error',
                          'bg-gray-600/30 text-gray-300 border border-gray-500/30': currentLogLevel === 'silent'
                        }">
                    {{ currentLogLevel?.toUpperCase() || 'Non défini' }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <select 
                    v-model="selectedLogLevel" 
                    @change="updateLogLevel"
                    class="px-2 py-1 rounded text-xs font-medium border border-green-500/30 bg-green-600/30 text-green-300"
                    :disabled="logLevelUpdating"
                  >
                    <option value="debug">DEBUG</option>
                    <option value="info">INFO</option>
                    <option value="warn">WARN</option>
                    <option value="error">ERROR</option>
                    <option value="silent">SILENT</option>
                  </select>
                  <span v-if="logLevelUpdating" class="text-green-300 text-xs">⏳</span>
                </div>
              </div>
              
              <!-- Debug des variables d'environnement -->
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div class="text-sm text-gray-300">Debug des variables d'environnement</div>
                <button @click="showEnvironmentDebug = true" class="px-3 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-500 transition-colors">
                  🔍 Debug Env
                </button>
              </div>
              
              <!-- Détails de version.txt -->
              <div class="p-3 bg-white/5 rounded-lg border border-white/10 space-y-2">
                <div class="text-sm text-gray-300 font-medium">📄 Contenu de version.txt</div>
                <div class="text-xs text-gray-400 space-y-1">
                  <div v-if="versionInfo.version" class="flex items-center gap-2">
                    <span class="text-green-300">Version:</span>
                    <span class="text-white font-mono">{{ versionInfo.version }}</span>
                  </div>
                  <div v-if="versionInfo.buildType" class="flex items-center gap-2">
                    <span class="text-blue-300">Build:</span>
                    <span class="text-white">{{ versionInfo.buildType }}</span>
                  </div>
                  <div v-if="versionInfo.gitHash" class="flex items-center gap-2">
                    <span class="text-purple-300">Git:</span>
                    <span class="text-white font-mono">{{ versionInfo.gitHash }}</span>
                  </div>
                  <div v-if="versionInfo.buildDate" class="flex items-center gap-2">
                    <span class="text-yellow-300">Date:</span>
                    <span class="text-white font-mono">{{ versionInfo.buildDate }}</span>
                  </div>
                  <div v-if="!versionInfo.version" class="text-red-300">
                    ❌ Impossible de charger version.txt
                  </div>
                </div>
              </div>
              
              <!-- Message de succès -->
              <div v-if="logLevelSuccessMessage" class="p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
                <div class="text-sm text-green-300 flex items-center gap-2">
                  <span>✅</span>
                  <span>{{ logLevelSuccessMessage }}</span>
                </div>
              </div>
              
              <!-- Informations sur les logs -->
              <div class="p-3 bg-white/5 rounded-lg border border-white/10 space-y-2">
                <div class="text-xs text-green-400">
                  💡 <strong>Mode de fonctionnement :</strong>
                  <br>• <strong>Développement local :</strong> Utilise VITE_LOG_LEVEL du .env.local
                  <br>• <strong>Staging/Production :</strong> Niveau configuré via Firebase (max 30s de délai)
                  <br>• <strong>Debugging à distance :</strong> Activez DEBUG, regardez les logs, puis rebasculez
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Performance -->
        <div v-if="activeTab === 'performance'" class="space-y-6">
          <div class="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
            <h4 class="font-semibold mb-3 text-cyan-200 flex items-center gap-2">
              📊 Performance
            </h4>
            <div class="space-y-3">
              <!-- Debug des performances -->
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div class="text-sm text-gray-300">
                  Debug des performances: 
                  <span :class="performanceDebugStatusClass" class="font-mono text-xs px-2 py-1 rounded ml-2">
                    {{ performanceDebugStatusText }}
                  </span>
                </div>
                <button @click="togglePerformanceDebug" :class="performanceDebugToggleButtonClass" class="px-3 py-1 rounded text-white text-xs transition-colors">
                  {{ performanceDebugToggleButtonText }}
                </button>
              </div>
              
              <!-- Export des données de performance -->
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div class="text-sm text-gray-300">Exporter les données de performance</div>
                <button @click="exportPerformanceData" class="px-3 py-1 rounded bg-cyan-600 text-white text-xs hover:bg-cyan-500 transition-colors">
                  📤 Exporter
                </button>
              </div>
              
              <!-- Résumé des performances -->
              <div v-if="performanceSummary" class="p-3 bg-white/5 rounded-lg border border-white/10 space-y-2">
                <div class="text-sm text-gray-300 font-medium">📈 Résumé des performances</div>
                <div class="text-xs text-cyan-400 space-y-1">
                  <div v-if="performanceSummary.gridLoading" class="flex items-center gap-2">
                    <span class="text-green-300">Grille:</span>
                    <span class="text-white font-mono">{{ performanceSummary.gridLoading }}ms</span>
                  </div>
                  <div v-if="performanceSummary.eventDetail" class="flex items-center gap-2">
                    <span class="text-blue-300">Détail événement:</span>
                    <span class="text-white font-mono">{{ performanceSummary.eventDetail }}ms</span>
                  </div>
                  <div v-if="performanceSummary.availability" class="flex items-center gap-2">
                    <span class="text-yellow-300">Disponibilités:</span>
                    <span class="text-white font-mono">{{ performanceSummary.availability }}ms</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-purple-300">Total mesures:</span>
                    <span class="text-white font-mono">{{ performanceSummary.totalMeasurements }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Informations sur le debug des performances -->
              <div class="p-3 bg-white/5 rounded-lg border border-white/10 space-y-2">
                <div class="text-xs text-cyan-400">
                  💡 <strong>Mode de fonctionnement :</strong>
                  <br>• <strong>Activation :</strong> Active le panneau de debug flottant
                  <br>• <strong>Mesures :</strong> Temps de chargement de la grille et des détails
                  <br>• <strong>Export :</strong> Télécharge un fichier JSON avec toutes les données
                  <br>• <strong>Session :</strong> Les données sont conservées pendant la session
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Audit -->
        <div v-if="activeTab === 'audit'" class="space-y-6">
          <div class="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
            <h4 class="font-semibold mb-3 text-orange-200 flex items-center gap-2">
              🔇 Audit
            </h4>
            <div class="space-y-3">
              <!-- Statut de l'audit -->
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div class="text-sm text-gray-300">
                  Statut de l'audit: 
                  <span :class="auditStatusClass" class="font-mono text-xs px-2 py-1 rounded">
                    {{ auditStatusText }}
                  </span>
                </div>
                <button @click="toggleAudit" :class="auditToggleButtonClass" class="px-3 py-1 rounded text-white text-xs transition-colors">
                  {{ auditToggleButtonText }}
                </button>
              </div>
              
              <!-- Informations audit -->
              <div class="p-3 bg-white/5 rounded-lg border border-white/10 space-y-2">
                <div class="text-xs text-gray-400">
                  <div>🔇 Audit désactivé par défaut en développement</div>
                  <div>📝 Activer temporairement pour diagnostiquer</div>
                  <div>🔄 Redémarrer le serveur après changement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de test des emails -->
    <EmailTestModal :is-visible="showEmailTest" @close="showEmailTest = false" />

    <!-- Modal de debug des variables d'environnement -->
    <div v-if="showEnvironmentDebug" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1270] p-4" @click="showEnvironmentDebug = false">
      <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
            <span class="text-blue-400">🔍</span>
            Debug des Variables d'Environnement
          </h3>
          <button @click="showEnvironmentDebug = false" class="text-white/80 hover:text-white">✖️</button>
        </div>
        
        <div class="space-y-4">
          <!-- Informations d'environnement -->
          <div class="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
            <h4 class="font-semibold mb-3 text-blue-200 flex items-center gap-2">
              🌍 Environnement Détecté
            </h4>
            <div class="space-y-3 text-sm">
              <div class="flex items-center gap-3">
                <span class="text-blue-300 font-medium min-w-24">Environnement:</span>
                <span class="px-3 py-1 rounded text-sm font-medium"
                      :class="{
                        'bg-green-600/30 text-green-300 border border-green-500/30': environmentInfo?.environment === 'production',
                        'bg-yellow-600/30 text-yellow-300 border border-yellow-500/30': environmentInfo?.environment === 'staging',
                        'bg-blue-600/30 text-blue-300 border border-blue-500/30': environmentInfo?.environment === 'development'
                      }">
                  {{ environmentInfo?.environment?.toUpperCase() || 'Non détecté' }}
                </span>
              </div>
              <div class="flex items-start gap-3">
                <span class="text-blue-300 font-medium min-w-24">URL:</span>
                <span class="text-gray-300 text-xs break-all bg-gray-800/30 px-2 py-1 rounded border border-gray-600/30">
                  {{ environmentInfo?.url || 'Non disponible' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Configuration Réelle Utilisée par l'App -->
          <div class="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
            <h4 class="font-semibold mb-3 text-blue-200">⚙️ Configuration Réelle de l'App</h4>
            <div class="text-xs text-blue-400 mb-3">
              📝 Configuration actuellement utilisée par l'application (avec sources de chargement)
            </div>
            
            <!-- Configuration Firebase -->
            <div class="mb-4">
              <h5 class="text-sm font-medium text-blue-300 mb-2">🔥 Firebase</h5>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">Project ID:</span>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 bg-blue-600/30 text-blue-300 rounded text-xs font-medium border border-blue-500/30">
                      {{ appConfig?.firebase?.projectId || 'Non défini' }}
                    </span>
                    <span class="text-2xl" :title="getConfigSource('firebase', 'projectId')">
                      {{ getConfigSourceEmoji('firebase', 'projectId') }}
                    </span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">Auth Domain:</span>
                  <div class="flex items-center gap-2">
                    <span class="text-blue-300 text-xs break-all bg-blue-600/20 px-2 py-1 rounded">{{ appConfig?.firebase?.authDomain || 'Non défini' }}</span>
                    <span class="text-2xl" :title="getConfigSource('firebase', 'authDomain')">
                      {{ getConfigSourceEmoji('firebase', 'authDomain') }}
                    </span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">Storage Bucket:</span>
                  <div class="flex items-center gap-2">
                    <span class="text-blue-300 text-xs break-all bg-blue-600/20 px-2 py-1 rounded">{{ appConfig?.firebase?.storageBucket || 'Non défini' }}</span>
                    <span class="text-2xl" :title="getConfigSource('firebase', 'storageBucket')">
                      {{ getConfigSourceEmoji('firebase', 'storageBucket') }}
                    </span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">Messaging Sender ID:</span>
                  <div class="flex items-center gap-2">
                    <span class="text-blue-300 text-xs break-all bg-blue-600/20 px-2 py-1 rounded">{{ appConfig?.firebase?.messagingSenderId || 'Non défini' }}</span>
                    <span class="text-2xl" :title="getConfigSource('firebase', 'messagingSenderId')">
                      {{ getConfigSourceEmoji('firebase', 'messagingSenderId') }}
                    </span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">App ID:</span>
                  <div class="flex items-center gap-2">
                    <span class="text-blue-300 text-xs break-all bg-blue-600/20 px-2 py-1 rounded">{{ appConfig?.firebase?.appId || 'Non défini' }}</span>
                    <span class="text-2xl" :title="getConfigSource('firebase', 'appId')">
                      {{ getConfigSourceEmoji('firebase', 'appId') }}
                    </span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">Measurement ID:</span>
                  <div class="flex items-center gap-2">
                    <span class="text-blue-300 text-xs break-all bg-blue-600/20 px-2 py-1 rounded">{{ appConfig?.firebase?.measurementId || 'Non défini' }}</span>
                    <span class="text-2xl" :title="getConfigSource('firebase', 'measurementId')">
                      {{ getConfigSourceEmoji('firebase', 'measurementId') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Configuration Firestore -->
            <div class="mb-4">
              <h5 class="text-sm font-medium text-blue-300 mb-2">🗄️ Firestore</h5>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">Database:</span>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 bg-blue-600/30 text-blue-300 rounded text-xs font-medium border border-blue-500/30">
                      {{ appConfig?.firestore?.database || 'Non défini' }}
                    </span>
                    <span class="text-2xl" title="SERVICE_CONFIG">
                      🔧
                    </span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">Region:</span>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 bg-blue-600/30 text-blue-300 rounded text-xs font-medium border border-blue-500/30">
                      {{ appConfig?.firestore?.region || 'Non défini' }}
                    </span>
                    <span class="text-2xl" title="SERVICE_CONFIG">
                      🔧
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Configuration Storage -->
            <div class="mb-4">
              <h5 class="text-sm font-medium text-blue-300 mb-2">💾 Storage</h5>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">Prefix:</span>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 bg-green-600/30 text-green-300 rounded text-xs font-medium border border-green-500/30">
                      {{ appConfig?.storage?.prefix || 'Non défini' }}
                    </span>
                    <span class="text-2xl" title="SERVICE_CONFIG">
                      🔧
                    </span>
                  </div>
                </div>
              </div>

            <!-- Configuration Magic Links -->
            <div class="mb-4">
              <h5 class="text-sm font-medium text-blue-300 mb-2">🔗 Magic Links</h5>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">Durée d'expiration:</span>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 rounded text-xs font-medium border border-purple-500/30 bg-purple-600/30 text-purple-300">
                      {{ appConfig?.magicLinks?.expirationDays || 'Non défini' }} jours
                    </span>
                    <span class="text-2xl" :title="getConfigSource('magicLinks', 'expirationDays')">
                      {{ getConfigSourceEmoji('magicLinks', 'expirationDays') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Configuration des Sessions -->
            <div class="mb-4">
              <h5 class="text-sm font-medium text-blue-300 mb-2">⏰ Sessions</h5>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">Durée Session Utilisateur:</span>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 rounded text-xs font-medium border border-purple-500/30 bg-purple-600/30 text-purple-300">
                      {{ appConfig?.sessions?.userSessionDurationMonths || 'Non défini' }} mois
                    </span>
                    <span class="text-2xl" :title="getConfigSource('sessions', 'userSessionDurationMonths')">
                      {{ getConfigSourceEmoji('sessions', 'userSessionDurationMonths') }}
                    </span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">Durée Session PIN (connecté):</span>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 rounded text-xs font-medium border border-purple-500/30 bg-purple-600/30 text-purple-300">
                      {{ appConfig?.sessions?.pinSessionDurationConnectedDays || 'Non défini' }} jours
                    </span>
                    <span class="text-2xl" :title="getConfigSource('sessions', 'pinSessionDurationConnectedDays')">
                      {{ getConfigSourceEmoji('sessions', 'pinSessionDurationConnectedDays') }}
                    </span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">Durée Session PIN (anonyme):</span>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 rounded text-xs font-medium border border-purple-500/30 bg-purple-600/30 text-purple-300">
                      {{ appConfig?.sessions?.pinSessionDurationAnonymousMinutes || 'Non défini' }} minutes
                    </span>
                    <span class="text-2xl" :title="getConfigSource('sessions', 'pinSessionDurationAnonymousMinutes')">
                      {{ getConfigSourceEmoji('sessions', 'pinSessionDurationAnonymousMinutes') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Configuration des Logs -->
            <div class="mb-4">
              <h5 class="text-sm font-medium text-blue-300 mb-2">📝 Logs</h5>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">Niveau actuel:</span>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 rounded text-xs font-medium border"
                          :class="{
                            'bg-green-600/30 text-green-300 border-green-500/30': currentLogLevel === 'debug',
                            'bg-blue-600/30 text-blue-300 border-blue-500/30': currentLogLevel === 'info',
                            'bg-yellow-600/30 text-yellow-300 border-yellow-500/30': currentLogLevel === 'warn',
                            'bg-red-600/30 text-red-300 border-red-500/30': currentLogLevel === 'error',
                            'bg-gray-600/30 text-gray-300 border-gray-500/30': currentLogLevel === 'silent'
                          }">
                      {{ currentLogLevel?.toUpperCase() || 'Non défini' }}
                    </span>
                    <span class="text-2xl" title="FIREBASE_CONFIG">🔐</span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">Changer le niveau:</span>
                  <div class="flex items-center gap-2">
                    <select 
                      v-model="selectedLogLevel" 
                      @change="updateLogLevel"
                      class="px-2 py-1 rounded text-xs font-medium border border-blue-500/30 bg-blue-600/30 text-blue-300"
                      :disabled="logLevelUpdating"
                    >
                      <option value="debug">DEBUG (tout)</option>
                      <option value="info">INFO (important)</option>
                      <option value="warn">WARN (avertissements)</option>
                      <option value="error">ERROR (erreurs uniquement)</option>
                      <option value="silent">SILENT (aucun)</option>
                    </select>
                    <span v-if="logLevelUpdating" class="text-blue-300 text-xs">⏳</span>
                    <span v-else class="text-2xl" title="FIREBASE_CONFIG">🔐</span>
                  </div>
                </div>
                <div class="text-xs text-blue-400 mt-2">
                  💡 Le niveau de log est configuré via Firebase et s'applique à tous les utilisateurs.
                  <br>En développement local, le niveau par défaut est DEBUG.
                </div>
              </div>
            </div>

            <!-- Configuration Email -->
            <div class="mb-4">
              <h5 class="text-sm font-medium text-blue-300 mb-2">📧 Email</h5>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">Service:</span>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 rounded text-xs font-medium border"
                          :class="{
                            'bg-purple-600/30 text-purple-300 border-purple-500/30': appConfig?.email?.service === 'ethereal',
                            'bg-red-600/30 text-red-300 border-red-500/30': appConfig?.email?.service === 'gmail'
                          }">
                      {{ appConfig?.email?.service?.toUpperCase() || 'Non défini' }}
                    </span>
                    <span class="text-2xl" title="SERVICE_CONFIG">
                      🔧
                    </span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">Capture:</span>
                  <div class="flex items-center gap-2">
                    <span class="text-blue-300 text-xs truncate max-w-32">{{ appConfig?.email?.capture ? 'OUI' : 'NON' }}</span>
                    <span class="text-2xl" title="SERVICE_CONFIG">
                      🔧
                    </span>
                  </div>
                </div>
                
                <!-- Informations d'expéditeur -->
                <div v-if="appConfig?.email?.from" class="pt-2 border-t border-blue-500/20">
                  <div class="text-xs text-blue-400 mb-2">📧 Configuration d'expéditeur</div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-blue-300 font-medium text-xs">Nom d'affichage:</span>
                    <div class="flex items-center gap-2">
                      <span class="text-blue-300 text-xs break-all bg-blue-600/20 px-2 py-1 rounded">
                        {{ appConfig?.email?.from?.name || 'Non défini' }}
                      </span>
                      <span class="text-2xl" title="SERVICE_CONFIG">🔧</span>
                    </div>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-blue-300 font-medium text-xs">Email d'expéditeur:</span>
                    <div class="flex items-center gap-2">
                      <span class="text-blue-300 text-xs break-all bg-blue-600/20 px-2 py-1 rounded">
                        {{ appConfig?.email?.from?.email || 'Non défini' }}
                      </span>
                      <span class="text-2xl" title="SERVICE_CONFIG">🔧</span>
                    </div>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-blue-300 font-medium text-xs">Reply-To:</span>
                    <div class="flex items-center gap-2">
                      <span class="text-blue-300 text-xs break-all bg-blue-600/20 px-2 py-1 rounded">
                        {{ appConfig?.email?.replyTo || 'Non défini' }}
                      </span>
                      <span class="text-2xl" title="SERVICE_CONFIG">🔧</span>
                    </div>
                  </div>
                </div>
                
                <!-- Informations SMTP (si disponibles) -->
                <div v-if="appConfig?.secrets?.ETHEREAL_SMTP_USER || appConfig?.secrets?.ETHEREAL_SMTP_PASS" class="pt-2 border-t border-blue-500/20">
                  <div class="text-xs text-blue-400 mb-2">🔐 Informations SMTP (obfusquées)</div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-blue-300 font-medium text-xs">Username SMTP:</span>
                    <div class="flex items-center gap-2">
                      <span class="text-blue-300 text-xs break-all bg-blue-600/20 px-2 py-1 rounded">
                        {{ appConfig?.secrets?.ETHEREAL_SMTP_USER ? obfuscateSecret(appConfig.secrets.ETHEREAL_SMTP_USER) : 'Non défini' }}
                      </span>
                      <span class="text-2xl" title="FIREBASE_SECRETS">🔐</span>
                    </div>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-blue-300 font-medium text-xs">Password SMTP:</span>
                    <div class="flex items-center gap-2">
                      <span class="text-blue-300 text-xs break-all bg-blue-600/20 px-2 py-1 rounded">
                        {{ appConfig?.secrets?.ETHEREAL_SMTP_PASS ? obfuscateSecret(appConfig.secrets.ETHEREAL_SMTP_PASS) : 'Non défini' }}
                      </span>
                      <span class="text-2xl" title="FIREBASE_SECRETS">🔐</span>
                    </div>
                  </div>
                </div>

                <!-- Valeurs de fallback -->
                <div class="pt-2 border-t border-blue-500/20">
                  <div class="text-xs text-blue-400 mb-2">🛡️ Valeurs de fallback (si configuration manquante)</div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-blue-300 font-medium text-xs">From (fallback):</span>
                    <div class="flex items-center gap-2">
                      <span class="text-blue-300 text-xs break-all bg-blue-600/20 px-2 py-1 rounded">
                        HatCast &lt;noreply@hatcast.com&gt;
                      </span>
                      <span class="text-2xl" title="DEFAULT_FALLBACK">🟡</span>
                    </div>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-blue-300 font-medium text-xs">Reply-To (fallback):</span>
                    <div class="flex items-center gap-2">
                      <span class="text-blue-300 text-xs break-all bg-blue-600/20 px-2 py-1 rounded">
                        noreply@hatcast.com
                      </span>
                      <span class="text-2xl" title="DEFAULT_FALLBACK">🟡</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

            <!-- Configuration Hosting -->
            <div class="mb-4">
              <h5 class="text-sm font-medium text-blue-300 mb-2">🌐 Hosting</h5>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">URL:</span>
                  <div class="flex items-center gap-2">
                    <span class="text-blue-300 text-xs break-all bg-blue-600/20 px-2 py-1 rounded">{{ appConfig?.hosting?.url || 'Non défini' }}</span>
                    <span class="text-2xl" :title="getConfigSource('hosting', 'url')">
                      {{ getConfigSourceEmoji('hosting', 'url') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Configuration PWA et Push -->
            <div class="mb-4">
              <h5 class="text-sm font-medium text-blue-300 mb-2">📱 PWA & Push</h5>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">Service Worker:</span>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 rounded text-xs font-medium border border-green-500/30 bg-green-600/30 text-green-300">
                      {{ appConfig?.pwa?.serviceWorkerEnabled ? 'Activé' : 'Désactivé' }}
                    </span>
                    <span class="text-2xl" title="SERVICE_CONFIG">🔧</span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">Notifications Push:</span>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 rounded text-xs font-medium border border-green-500/30 bg-green-600/30 text-green-300">
                      {{ appConfig?.push?.enabled ? 'Activées' : 'Désactivées' }}
                    </span>
                    <span class="text-2xl" title="SERVICE_CONFIG">🔧</span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-blue-300 font-medium">VAPID Key:</span>
                  <div class="flex items-center gap-2">
                    <span class="text-blue-300 text-xs break-all bg-blue-600/20 px-2 py-1 rounded">{{ appConfig?.push?.vapidKey ? obfuscateSecret(appConfig.push.vapidKey) : 'Non défini' }}</span>
                    <span class="text-2xl" title="FIREBASE_SECRETS">🔐</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Légende des sources -->
            <div class="mt-4 p-3 bg-blue-800/20 rounded-lg border border-blue-500/20">
              <h6 class="text-xs font-medium text-blue-300 mb-2">📋 Légende des Sources</h6>
              <div class="grid grid-cols-1 gap-1 text-xs">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">🟢</span>
                  <span class="text-green-300">VITE_ENV</span>
                  <span class="text-blue-400">Variables d'environnement VITE (.env.local)</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-2xl">🔵</span>
                  <span class="text-blue-300">FIREBASE_FUNCTIONS</span>
                  <span class="text-blue-400">Variables d'environnement Firebase</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-2xl">🔐</span>
                  <span class="text-blue-300">FIREBASE_SECRETS</span>
                  <span class="text-blue-400">Secrets Firebase (chiffrés)</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-2xl">🟡</span>
                  <span class="text-blue-300">DEFAULT_FALLBACK</span>
                  <span class="text-blue-400">Valeurs par défaut (fallback)</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-2xl">🔧</span>
                  <span class="text-blue-300">SERVICE_CONFIG</span>
                  <span class="text-blue-400">Configuration des services (code)</span>
                </div>
              </div>
            </div>
          </div>

                    <!-- Secrets Firebase via configService -->
          <div v-if="appConfig?.secrets && Object.keys(appConfig.secrets).length > 0" class="bg-red-900/30 p-4 rounded-lg border border-red-500/30">
            <h4 class="font-semibold mb-3 text-red-200">🔐 Secrets Firebase (via configService)</h4>
            <div class="text-xs text-red-400 mb-3">
              📝 Secrets accessibles via configService (obfusqués pour la sécurité)
            </div>
            <div class="space-y-2 text-sm">
              <div v-for="(secret, key) in appConfig.secrets" :key="key" 
                   class="flex justify-between items-center">
                <span class="text-red-300 font-medium">{{ key }}:</span>
                <div class="flex items-center gap-2">
                  <span class="text-xs px-2 py-1 rounded bg-red-600/30 text-red-200 border border-red-500/30">
                    {{ obfuscateSecret(secret) }}
                  </span>
                  <span class="text-2xl" title="FIREBASE_SECRETS">🔐</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Variables d'environnement -->
          <div class="bg-white/5 p-4 rounded-lg border border-white/10">
            <h4 class="font-semibold mb-3 text-white">🔧 Variables d'Environnement</h4>
            <div class="space-y-2 text-sm">
              <div v-for="(value, key) in formattedEnvironmentVars" :key="key" class="flex justify-between items-center">
                <span class="text-gray-300 font-medium">{{ key }}:</span>
                <span class="text-xs px-2 py-1 rounded border"
                      :class="{
                        'bg-green-600/30 text-green-300 border-green-500/30': value === '✅ Définie',
                        'bg-red-600/30 text-red-300 border-red-500/30': value === '❌ Non définie',
                        'bg-gray-600/30 text-gray-300 border-gray-500/30': value !== '✅ Définie' && value !== '❌ Non définie'
                      }">
                  {{ value }}
                </span>
              </div>
            </div>
          </div>

          <!-- Configuration Firebase Functions (admin uniquement) -->
          <div v-if="environmentInfo?.firebaseSecrets?.functions?.config" class="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
            <h4 class="font-semibold mb-3 text-purple-200">⚙️ Configuration Firebase Functions (Admin)</h4>
            <div class="text-xs text-purple-400 mb-3">
              📝 Configuration accessible via <code class="bg-purple-800/50 px-1 rounded">functions.config()</code> 
              (non chiffrée, accessible aux fonctions déployées)
            </div>
            <div class="space-y-2 text-sm">
              <div v-for="(value, key) in formattedFirebaseConfig" :key="key" class="flex justify-between items-center">
                <span class="text-purple-300 font-medium">{{ key }}:</span>
                <span class="text-xs px-2 py-1 rounded border bg-purple-600/30 text-purple-300 border-purple-500/30">
                  {{ typeof value === 'object' ? JSON.stringify(value, null, 2) : value }}
                </span>
              </div>
            </div>
            
            <!-- Lien vers Ethereal Email si applicable -->
            <div v-if="environmentInfo.firebaseSecrets.functions?.ethereal?.user" class="mt-4 pt-4 border-t border-purple-500/30">
              <div class="flex items-center justify-between">
                <div class="text-xs text-purple-300">
                  📬 Emails capturés par Ethereal Email
                </div>
                <a 
                  href="https://ethereal.email" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="px-3 py-1 rounded bg-purple-600 text-white text-xs hover:bg-purple-500 transition-colors flex items-center gap-1"
                >
                  🌐 Ouvrir Ethereal
                  <span class="text-xs">↗</span>
                </a>
              </div>
              <div class="mt-2 text-xs text-purple-400">
                Connectez-vous avec vos credentials Ethereal pour voir les emails capturés
              </div>
            </div>
          </div>

          <!-- Tous les Secrets Firebase (si disponibles) -->
          <div v-if="environmentInfo?.firebaseSecrets?.secrets && Object.keys(environmentInfo.firebaseSecrets.secrets).length > 0" class="bg-red-900/30 p-4 rounded-lg border border-red-500/30">
            <h4 class="font-semibold mb-3 text-red-200">🔐 Tous les Secrets Firebase (Admin)</h4>
            <div class="text-xs text-red-400 mb-3">
              🚨 Données sensibles chiffrées via Google Cloud Secret Manager
              <span class="ml-2 text-yellow-300">Total: {{ environmentInfo.firebaseSecrets.secrets.total }} secrets</span>
            </div>
            
            <!-- Secrets par catégorie -->
            <div class="space-y-4">
              <!-- Secrets Email -->
              <div v-if="Object.keys(environmentInfo.firebaseSecrets.secrets.categories?.email || {}).length > 0">
                <h5 class="text-sm font-medium text-red-300 mb-2">📧 Email</h5>
                <div class="space-y-2 text-xs">
                  <div v-for="(secret, name) in environmentInfo.firebaseSecrets.secrets.categories.email" :key="name" 
                       class="flex justify-between items-center bg-red-800/20 p-2 rounded border border-red-600/30">
                    <span class="text-red-200 font-medium">{{ secret.name }}:</span>
                    <div class="flex items-center gap-2">
                      <span class="text-xs px-2 py-1 rounded bg-red-600/30 text-red-200 border border-red-500/30">
                        {{ secret.displayValue }}
                      </span>
                      <span class="text-xs text-red-400">({{ secret.length }} chars)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Secrets API -->
              <div v-if="Object.keys(environmentInfo.firebaseSecrets.secrets.categories?.api || {}).length > 0">
                <h5 class="text-sm font-medium text-red-300 mb-2">🔑 API</h5>
                <div class="space-y-2 text-xs">
                  <div v-for="(secret, name) in environmentInfo.firebaseSecrets.secrets.categories.api" :key="name" 
                       class="flex justify-between items-center bg-red-800/20 p-2 rounded border border-red-600/30">
                    <span class="text-red-200 font-medium">{{ secret.name }}:</span>
                    <div class="flex items-center gap-2">
                      <span class="text-xs px-2 py-1 rounded bg-red-600/30 text-red-200 border border-red-500/30">
                        {{ secret.displayValue }}
                      </span>
                      <span class="text-xs text-red-400">({{ secret.length }} chars)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Secrets Firebase -->
              <div v-if="Object.keys(environmentInfo.firebaseSecrets.secrets.categories?.firebase || {}).length > 0">
                <h5 class="text-sm font-medium text-red-300 mb-2">🔥 Firebase</h5>
                <div class="space-y-2 text-xs">
                  <div v-for="(secret, name) in environmentInfo.firebaseSecrets.secrets.categories.firebase" :key="name" 
                       class="flex justify-between items-center bg-red-800/20 p-2 rounded border border-red-600/30">
                    <span class="text-red-200 font-medium">{{ secret.name }}:</span>
                    <div class="flex items-center gap-2">
                      <span class="text-xs px-2 py-1 rounded bg-red-600/30 text-red-200 border border-red-500/30">
                        {{ secret.displayValue }}
                      </span>
                      <span class="text-xs text-red-400">({{ secret.length }} chars)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Autres secrets -->
              <div v-if="Object.keys(environmentInfo.firebaseSecrets.secrets.categories?.other || {}).length > 0">
                <h5 class="text-sm font-medium text-red-300 mb-2">📦 Autres</h5>
                <div class="space-y-2 text-xs">
                  <div v-for="(secret, name) in environmentInfo.firebaseSecrets.secrets.categories.other" :key="name" 
                       class="flex justify-between items-center bg-red-800/20 p-2 rounded border border-red-600/30">
                    <span class="text-red-200 font-medium">{{ secret.name }}:</span>
                    <div class="flex items-center gap-2">
                      <span class="text-xs px-2 py-1 rounded bg-red-600/30 text-red-200 border border-red-500/30">
                        {{ secret.displayValue }}
                      </span>
                      <span class="text-xs text-red-400">({{ secret.length }} chars)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bouton pour afficher les détails complets dans la console -->
          <div class="bg-yellow-900/30 border border-yellow-500/30 p-4 rounded-lg">
            <h4 class="font-semibold text-yellow-200 mb-2">💡 Informations Détaillées</h4>
            <p class="text-yellow-300 text-sm mb-3">
              Pour voir toutes les informations détaillées (y compris les valeurs sensibles), ouvrez la console du navigateur et cliquez sur le bouton ci-dessous.
            </p>
            <button
              @click="dumpToConsole"
              class="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-500 text-sm transition-colors"
            >
              📋 Dumper dans la Console
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import adminService from '../services/adminService.js';
import EmailTestModal from './EmailTestModal.vue';
import performanceService from '../services/performanceService.js';
import logger from '../services/logger.js';

const props = defineProps({ show: Boolean });
const emit = defineEmits(['close']);

const auth = ref(null);
const email = ref('');



// Modal states
const showEmailTest = ref(false);
const showEnvironmentDebug = ref(false);

// Development state
const testPushLoading = ref(false);
const testPushSuccess = ref('');
const testPushError = ref('');
const fcmToken = ref(localStorage.getItem('fcmToken') || '');
const vapidKeyPreview = ref('');

// Fonction pour mettre à jour la VAPID key preview
async function updateVapidKeyPreview() {
  try {
    const configService = await import('../services/configService.js');
    const vapidKey = configService.default.getVapidKey();
    vapidKeyPreview.value = vapidKey ? (vapidKey.length > 20 ? vapidKey.slice(0,8) + '…' + vapidKey.slice(-6) : vapidKey) : '';
  } catch (error) {
    vapidKeyPreview.value = 'indisponible';
  }
}

// Environment debug state
const environmentInfo = ref(null);
const environmentVars = ref({});
const appConfig = ref(null); // Configuration réelle utilisée par l'app

// Audit state
const auditEnabled = ref(false);
const auditStatusText = computed(() => auditEnabled.value ? 'ACTIVÉ' : 'DÉSACTIVÉ');
const auditStatusClass = computed(() => auditEnabled.value 
  ? 'bg-green-600/30 border border-green-500/30 text-green-300' 
  : 'bg-red-600/30 border border-red-500/30 text-red-300'
);
const auditToggleButtonText = computed(() => auditEnabled.value ? '🔇 Désactiver' : '🔊 Activer');
const auditToggleButtonClass = computed(() => auditEnabled.value 
  ? 'bg-red-600 hover:bg-red-500' 
  : 'bg-green-600 hover:bg-green-500'
);

// Performance debug computed properties
const performanceDebugStatusText = computed(() => performanceDebugEnabled.value ? 'ACTIVÉ' : 'DÉSACTIVÉ');
const performanceDebugStatusClass = computed(() => performanceDebugEnabled.value 
  ? 'bg-green-600/30 border border-green-500/30 text-green-300' 
  : 'bg-red-600/30 border border-red-500/30 text-red-300'
);
const performanceDebugToggleButtonText = computed(() => performanceDebugEnabled.value ? '📊 Désactiver' : '📊 Activer');
const performanceDebugToggleButtonClass = computed(() => performanceDebugEnabled.value 
  ? 'bg-red-600 hover:bg-red-500' 
  : 'bg-green-600 hover:bg-green-500'
);

// Log level state
const currentLogLevel = ref('info');
const selectedLogLevel = ref('info');
const logLevelUpdating = ref(false);
const logLevelSuccessMessage = ref('');

// Version info state
const versionInfo = ref({
  version: '',
  buildType: '',
  gitHash: '',
  buildDate: ''
});

// Performance debug state
const performanceDebugEnabled = ref(false);
const performanceSummary = ref(null);

// Onglets state
const activeTab = ref('pwa');
const tabs = ref([
  { id: 'pwa', name: 'PWA', icon: '📱' },
  { id: 'email', name: 'Email', icon: '📧' },
  { id: 'debug', name: 'Debug', icon: '🔍' },
  { id: 'performance', name: 'Performance', icon: '📊' },
  { id: 'audit', name: 'Audit', icon: '🔇' }
]);

const closeModal = () => {
  emit('close');
  // Reset state
  showEmailTest.value = false;
  showEnvironmentDebug.value = false;
  logLevelSuccessMessage.value = '';
};





// Development functions
async function sendTestPush() {
  if (!email.value) return;
  testPushLoading.value = true;
  testPushSuccess.value = '';
  testPushError.value = '';
  try {
    const { queuePushMessage } = await import('../services/pushService.js');
    await queuePushMessage({ 
      toEmail: email.value, 
      title: 'Test HatCast', 
      body: 'Ceci est un test de notification', 
      data: { url: '/' }, 
      reason: 'manual_test' 
    });
    testPushSuccess.value = 'OK';
  } catch (e) {
    testPushError.value = 'Échec de l\'envoi du test';
  } finally {
    testPushLoading.value = false;
  }
}

function testPwaUpdate() {
  // Émettre un événement personnalisé pour déclencher la mise à jour
  const updateEvent = new CustomEvent('pwa-update-test', {
    detail: { 
      type: 'test-update',
      timestamp: Date.now()
    }
  });
  window.dispatchEvent(updateEvent);
  
  // Afficher un message de confirmation
  alert('🧪 Test de mise à jour PWA déclenché !\n\nVérifiez que la notification toast apparaît en bas à droite de l\'interface.');
}

function showPwaInstallPrompt() {
  // Vérifier si l'app est déjà installée
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    alert('📱 Votre application est déjà installée en mode standalone.');
    return;
  }
  
  // Vérifier si on a un deferredPrompt disponible
  if (window.deferredPrompt) {
    // Déclencher l'installation PWA
    window.deferredPrompt.prompt();
    window.deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
      // Installation PWA acceptée
    } else {
      // Installation PWA refusée
    }
      window.deferredPrompt = null;
    });
  } else {
    // Essayer de déclencher la barre d'installation via App.vue
    // Émettre un événement personnalisé pour déclencher l'affichage
    const installEvent = new CustomEvent('show-pwa-install-banner', {
      detail: { 
        type: 'manual-trigger',
        timestamp: Date.now()
      }
    });
    window.dispatchEvent(installEvent);
    
    // Message d'information
    alert('📱 Barre d\'installation PWA déclenchée !\n\nSi elle n\'apparaît pas, essayez de naviguer sur le site pendant quelques minutes pour déclencher les critères d\'installation.');
  }
}

// Computed properties pour formater les variables
const formattedEnvironmentVars = computed(() => {
  if (!environmentVars.value) return {};
  
  const formatted = {};
  Object.entries(environmentVars.value).forEach(([key, value]) => {
    formatted[key] = value;
  });
  return formatted;
});

// Configuration Firebase Functions (functions.config())
const formattedFirebaseConfig = computed(() => {
  if (!environmentInfo.value?.firebaseSecrets?.functions?.config) return {};
  
  const formatted = {};
  
  // Fonction récursive pour aplatir les objets avec notation pointée
  function flattenObject(obj, prefix = '') {
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Si c'est un objet, on continue la récursion
        flattenObject(value, newKey);
      } else {
        // Si c'est une valeur primitive ou un tableau, on l'ajoute
        formatted[newKey] = value;
      }
    });
  }
  
  flattenObject(environmentInfo.value.firebaseSecrets.functions.config);
  return formatted;
});

// Secrets Firebase (Google Cloud Secret Manager)
const formattedFirebaseSecrets = computed(() => {
  if (!environmentInfo.value?.firebaseSecrets?.secrets) return {};
  
  const formatted = {};
  
  // Fonction récursive pour aplatir les objets avec notation pointée
  function flattenObject(obj, prefix = '') {
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Si c'est un objet, on continue la récursion
        flattenObject(value, newKey);
      } else {
        // Si c'est une valeur primitive ou un tableau, on l'ajoute
        formatted[newKey] = value;
      }
    });
  }
  
  flattenObject(environmentInfo.value.firebaseSecrets.secrets);
  return formatted;
});

// Version info functions
async function loadVersionInfo() {
  try {
    const response = await fetch('/version.txt');
    if (response.ok) {
      const content = await response.text();
      const lines = content.split('\n').filter(line => line.trim());
      
      versionInfo.value = {
        version: lines[0] || '',
        buildType: lines[1] || '',
        gitHash: lines[2] ? lines[2].replace('Git: ', '') : '',
        buildDate: lines[3] ? lines[3].replace('Build: ', '') : ''
      };
      
      logger.debug('📄 Version info loaded:', versionInfo.value);
    } else {
      logger.warn('⚠️ Could not load version.txt:', response.status);
      versionInfo.value = {
        version: '',
        buildType: '',
        gitHash: '',
        buildDate: ''
      };
    }
  } catch (error) {
    logger.error('❌ Error loading version info:', error);
    versionInfo.value = {
      version: '',
      buildType: '',
      gitHash: '',
      buildDate: ''
    };
  }
}

// Environment debug functions
async function refreshEnvironmentInfo() {
  try {
    const configService = await import('../services/configService.js');
    
    // Récupérer la configuration réelle utilisée par l'app
    const config = await configService.default.getConfig();
    appConfig.value = config;
    
    const summary = await configService.default.getEnvironmentSummary();
    
    // Utiliser summary qui contient maintenant toutes les données nécessaires
    environmentInfo.value = summary;
    environmentVars.value = summary.envVars;
    
    logger.info('🔄 Actualisation des informations d\'environnement...');
    logger.info('✅ Informations d\'environnement actualisées:', {
      config: config,
      summary: summary,
      vars: summary.envVars
    });
    
  } catch (err) {
    logger.error('❌ Erreur lors de l\'actualisation:', err);
  }
}

// Fonction pour obtenir la source d'une configuration
function getConfigSource(category, key) {
  // Fallback basé sur la logique de priorité
  if (category === 'firestore') return 'SERVICE_CONFIG';
  if (category === 'storage' && key === 'prefix') return 'SERVICE_CONFIG';
  if (category === 'email') return 'SERVICE_CONFIG';
  if (category === 'sessions') return 'SERVICE_CONFIG';
  if (category === 'hosting') return 'SERVICE_CONFIG';
  if (category === 'pwa') return 'SERVICE_CONFIG';
  if (category === 'push') return 'SERVICE_CONFIG';
  if (category === 'firebase') {
    // Pour Firebase, on peut déterminer la source basée sur l'environnement
    const env = environmentInfo.value?.environment;
    if (env === 'development') return 'VITE_ENV';
    if (env === 'staging' || env === 'production') return 'FIREBASE_FUNCTIONS';
    return 'DEFAULT_FALLBACK';
  }
  return 'DEFAULT_FALLBACK'; // Au lieu de 'UNKNOWN'
}

// Fonction pour obtenir l'emoji correspondant à la source
function getConfigSourceEmoji(category, key) {
  const source = getConfigSource(category, key);
  switch (source) {
    case 'VITE_ENV':
      return '🟢';
    case 'FIREBASE_FUNCTIONS':
      return '🔵';
    case 'FIREBASE_SECRETS':
      return '🔐';
    case 'DEFAULT_FALLBACK':
      return '🟡';
    case 'SERVICE_CONFIG':
      return '🔧';
    default:
      return '❓';
  }
}

// Fonction pour obfusquer les secrets
function obfuscateSecret(value) {
  if (!value || typeof value !== 'string') return '***';
  if (value.length <= 4) return '***';
  return value.substring(0, 2) + '***' + value.substring(value.length - 2);
}

async function dumpToConsole() {
  try {
    const configService = await import('../services/configService.js');
    const summary = await configService.default.getEnvironmentSummary();
    console.log('🔍 Informations d\'environnement complètes:', summary);
    alert('✅ Informations détaillées affichées dans la console (F12)');
  } catch (err) {
    console.error('❌ Erreur lors du dump console:', err);
  }
}

// Fonctions pour gérer l'audit
async function checkAuditStatus() {
  try {
    auditEnabled.value = import.meta.env.VITE_AUDIT_ENABLED === 'true';
  } catch (error) {
    console.warn('⚠️ Erreur lors de la vérification du statut audit:', error);
    auditEnabled.value = false;
  }
}

async function toggleAudit() {
  try {
    const newStatus = !auditEnabled.value;
    
    if (newStatus) {
      // Activer l'audit
      alert(`🔊 Audit activé !\n\nPour que le changement prenne effet, vous devez :\n\n1. Créer/modifier le fichier .env.local\n2. Ajouter : VITE_AUDIT_ENABLED=true\n3. Redémarrer le serveur de développement\n\nExemple de commande :\n\necho "VITE_AUDIT_ENABLED=true" >> .env.local\nnpm run dev -- --host`);
    } else {
      // Désactiver l'audit
      alert(`🔇 Audit désactivé !\n\nPour que le changement prenne effet, vous devez :\n\n1. Modifier le fichier .env.local\n2. Commenter ou supprimer : VITE_AUDIT_ENABLED=true\n3. Redémarrer le serveur de développement\n\nExemple de commande :\n\n# VITE_AUDIT_ENABLED=true\nnpm run dev -- --host`);
    }
    
    // Mettre à jour l'état local
    auditEnabled.value = newStatus;
    
  } catch (error) {
    console.error('❌ Erreur lors du toggle audit:', error);
    alert('❌ Erreur lors de la modification du statut audit');
  }
}

// Fonctions pour gérer les logs
async function checkLogLevel() {
  try {
    const configService = await import('../services/configService.js');
    const level = configService.default.getLogLevel();
    
    currentLogLevel.value = level;
    selectedLogLevel.value = level;
    logger.info(`🔧 Niveau de log actuel: ${currentLogLevel.value}`);
  } catch (error) {
    logger.warn('⚠️ Impossible de récupérer le niveau de log:', error);
    // Utiliser le niveau par défaut
    currentLogLevel.value = 'info';
    selectedLogLevel.value = 'info';
  }
}

async function updateLogLevel() {
  if (!selectedLogLevel.value || selectedLogLevel.value === currentLogLevel.value) {
    return;
  }
  
  logLevelUpdating.value = true;
  try {
    const configService = await import('../services/configService.js');
    await configService.default.setLogLevel(selectedLogLevel.value);
    
    currentLogLevel.value = selectedLogLevel.value;
    logger.info(`🔧 Niveau de log mis à jour vers: ${currentLogLevel.value}`);
    
    // Mettre à jour le localStorage directement
    localStorage.setItem('hatcast_log_level', selectedLogLevel.value);
    console.log(`🔧 Niveau de log sauvegardé en localStorage: ${selectedLogLevel.value}`);
    
    // Mettre à jour le logger côté client
    const { updateLogLevel } = await import('../services/logger.js');
    await updateLogLevel();
    
    // Afficher le message de succès dans la modale
    logLevelSuccessMessage.value = `Niveau de log mis à jour vers ${currentLogLevel.value.toUpperCase()}. Les changements s'appliquent immédiatement et sont sauvegardés.`;
    
    // Effacer le message après 5 secondes
    setTimeout(() => {
      logLevelSuccessMessage.value = '';
    }, 5000);
  } catch (error) {
    const errorMessage = error.message || 'Erreur inconnue lors de la mise à jour du niveau de log';
    logger.error('❌ Erreur lors de la mise à jour du niveau de log:', errorMessage);
    alert(`❌ Erreur lors de la mise à jour du niveau de log:\n\n${errorMessage}\n\nVérifiez que vous êtes bien connecté et que vous avez les droits administrateur.`);
    // Remettre la valeur précédente
    selectedLogLevel.value = currentLogLevel.value;
  } finally {
    logLevelUpdating.value = false;
  }
}

// Fonctions pour gérer le debug des performances
function togglePerformanceDebug() {
  performanceDebugEnabled.value = !performanceDebugEnabled.value;
  
  // Mettre à jour le localStorage pour la session
  localStorage.setItem('performance-debug', performanceDebugEnabled.value.toString());
  
  // Émettre un événement pour notifier le composant PerformanceDebug
  const event = new CustomEvent('performance-debug-toggle', {
    detail: { enabled: performanceDebugEnabled.value }
  });
  window.dispatchEvent(event);
  
  // Mettre à jour le résumé des performances
  updatePerformanceSummary();
  
  logger.info(`📊 Debug des performances ${performanceDebugEnabled.value ? 'activé' : 'désactivé'}`);
}

function updatePerformanceSummary() {
  const measurements = performanceService.getAllMeasurements();
  const gridMeasurement = performanceService.getMeasurement('grid_loading');
  const eventDetailMeasurement = performanceService.getMeasurement('event_detail_loading');
  const availabilityMeasurement = performanceService.getMeasurement('load_availability');
  
  performanceSummary.value = {
    gridLoading: gridMeasurement ? Math.round(gridMeasurement.duration) : null,
    eventDetail: eventDetailMeasurement ? Math.round(eventDetailMeasurement.duration) : null,
    availability: availabilityMeasurement ? Math.round(availabilityMeasurement.duration) : null,
    totalMeasurements: measurements.length
  };
}

function exportPerformanceData() {
  try {
    const data = {
      timestamp: new Date().toISOString(),
      measurements: performanceService.getAllMeasurements(),
      summary: performanceService.getSummary()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logger.info('📤 Données de performance exportées');
  } catch (error) {
    logger.error('❌ Erreur lors de l\'export des données de performance:', error);
  }
}

onMounted(async () => {
  try {
    // Initialiser Firebase de manière sécurisée
    const { getAuth } = await import('firebase/auth');
    auth.value = getAuth();
    
    if (props.show && auth.value?.currentUser) {
      email.value = auth.value.currentUser.email || '';
    }
  } catch (error) {
    logger.warn('⚠️ Firebase Auth non disponible:', error);
  }
  
  // Mettre à jour la VAPID key preview
  await updateVapidKeyPreview();
  
  // Vérifier le statut de l'audit
  await checkAuditStatus();
  
  // Vérifier le niveau de log
  await checkLogLevel();
  
  // Charger les informations de version
  await loadVersionInfo();
  
  // Initialiser le debug des performances
  performanceDebugEnabled.value = localStorage.getItem('performance-debug') === 'true';
  updatePerformanceSummary();
  
  // Restaurer l'onglet actif
  const savedTab = localStorage.getItem('dev-modal-active-tab');
  if (savedTab && tabs.value.find(tab => tab.id === savedTab)) {
    activeTab.value = savedTab;
  }
});

// Watcher pour actualiser les informations quand la modale de debug s'ouvre
watch(showEnvironmentDebug, async (newValue) => {
  if (newValue) {
    console.log('🚀 Ouverture de la modale de debug des variables d\'environnement');
    await refreshEnvironmentInfo();
  }
});

// Watcher pour mettre à jour le résumé des performances
watch(() => props.show, (newValue) => {
  if (newValue) {
    updatePerformanceSummary();
  }
});

// Watcher pour sauvegarder l'onglet actif
watch(activeTab, (newTab) => {
  localStorage.setItem('dev-modal-active-tab', newTab);
});
</script>
