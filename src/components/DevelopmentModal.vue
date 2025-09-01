<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[160] p-4" @click="closeModal">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" @click.stop>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
          <span class="text-purple-400">🛠️</span>
          Outils de Développement
        </h3>
        <button @click="closeModal" class="text-white/80 hover:text-white">✖️</button>
      </div>



      <!-- Outils de développement -->
      <div class="space-y-6">
          <!-- Section PWA -->
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
          
          <!-- Section Email -->
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
          
          <!-- Section Debug -->
          <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 class="font-semibold mb-3 text-green-200 flex items-center gap-2">
              🔍 Debug
            </h4>
            <div class="space-y-3">
              <!-- Debug des variables d'environnement -->
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div class="text-sm text-gray-300">Debug des variables d'environnement</div>
                <button @click="showEnvironmentDebug = true" class="px-3 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-500 transition-colors">
                  🔍 Debug Env
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    <!-- Modal de test des emails -->
    <EmailTestModal :is-visible="showEmailTest" @close="showEmailTest = false" />

    <!-- Modal de debug des variables d'environnement -->
    <div v-if="showEnvironmentDebug" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[170] p-4" @click="showEnvironmentDebug = false">
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
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div class="flex justify-between">
                <span class="text-blue-300">Environnement:</span>
                <span class="px-2 py-1 rounded text-xs font-medium"
                      :class="{
                        'bg-green-600/30 text-green-300 border border-green-500/30': environmentInfo?.environment === 'production',
                        'bg-yellow-600/30 text-yellow-300 border border-yellow-500/30': environmentInfo?.environment === 'staging',
                        'bg-blue-600/30 text-blue-300 border border-blue-500/30': environmentInfo?.environment === 'development'
                      }">
                  {{ environmentInfo?.environment?.toUpperCase() || 'Non détecté' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-blue-300">URL:</span>
                <span class="text-gray-300 text-xs truncate max-w-48">{{ environmentInfo?.url || 'Non disponible' }}</span>
              </div>
            </div>
          </div>

          <!-- Configuration Environnement (côté client) -->
          <div class="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
            <h4 class="font-semibold mb-3 text-blue-200">⚙️ Configuration Environnement</h4>
            <div class="text-xs text-blue-400 mb-3">
              📝 Configuration déterminée côté client via <code class="bg-blue-800/50 px-1 rounded">configService.getConfig()</code>
              <span class="ml-2 text-yellow-300">Environnement détecté: {{ environmentInfo?.environment || 'Non défini' }}</span>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between items-center">
                <span class="text-blue-300 font-medium">config.firestore.database:</span>
                <span class="px-2 py-1 bg-blue-600/30 text-blue-300 rounded text-xs font-medium border border-blue-500/30">
                  {{ environmentInfo?.firestore?.database || 'Non défini' }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-blue-300 font-medium">config.firestore.region:</span>
                <span class="px-2 py-1 bg-blue-600/30 text-blue-300 rounded text-xs font-medium border border-blue-500/30">
                  {{ environmentInfo?.firestore?.region || 'Non défini' }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-blue-300 font-medium">config.storage.bucket:</span>
                <span class="text-blue-300 text-xs truncate max-w-32">{{ environmentInfo?.storage?.bucket || 'Non défini' }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-blue-300 font-medium">config.storage.prefix:</span>
                <span class="px-2 py-1 bg-green-600/30 text-green-300 rounded text-xs font-medium border border-green-500/30">
                  {{ environmentInfo?.storage?.prefix || 'Non défini' }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-blue-300 font-medium">config.email.service:</span>
                <span class="px-2 py-1 rounded text-xs font-medium border"
                      :class="{
                        'bg-purple-600/30 text-purple-300 border-purple-500/30': environmentInfo?.email?.service === 'ethereal',
                        'bg-red-600/30 text-red-300 border-red-500/30': environmentInfo?.email?.service === 'gmail'
                      }">
                  {{ environmentInfo?.email?.service?.toUpperCase() || 'Non défini' }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-blue-300 font-medium">config.email.capture:</span>
                <span class="px-2 py-1 rounded text-xs font-medium border"
                      :class="{
                        'bg-green-600/30 text-green-300 border-green-500/30': environmentInfo?.email?.capture,
                        'bg-gray-600/30 text-gray-300 border-gray-500/30': !environmentInfo?.email?.capture
                      }">
                  {{ environmentInfo?.email?.capture ? 'OUI' : 'NON' }}
                </span>
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
                  class="px-3 py-1.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-500 transition-colors flex items-center gap-1"
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
          <div v-if="environmentInfo?.firebaseSecrets?.secrets?.secrets && Object.keys(environmentInfo.firebaseSecrets.secrets.secrets).length > 0" class="bg-red-900/30 p-4 rounded-lg border border-red-500/30">
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
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import adminService from '../services/adminService.js';
import EmailTestModal from './EmailTestModal.vue';

const props = defineProps({ show: Boolean });
const emit = defineEmits(['close']);

const auth = getAuth();
const email = ref('');



// Modal states
const showEmailTest = ref(false);
const showEnvironmentDebug = ref(false);

// Development state
const testPushLoading = ref(false);
const testPushSuccess = ref('');
const testPushError = ref('');
const fcmToken = ref(localStorage.getItem('fcmToken') || '');
const vapidKeyPreview = (function maskKey(key) { 
  try { 
    return key ? (key.length > 20 ? key.slice(0,8) + '…' + key.slice(-6) : key) : '' 
  } catch { 
    return '' 
  } 
})(import.meta.env?.VITE_FIREBASE_VAPID_KEY);

// Environment debug state
const environmentInfo = ref(null);
const environmentVars = ref({});

const closeModal = () => {
  emit('close');
  // Reset state
  showEmailTest.value = false;
  showEnvironmentDebug.value = false;
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

// Environment debug functions
async function refreshEnvironmentInfo() {
  try {
    const configService = await import('../services/configService.js');
    const summary = await configService.default.getEnvironmentSummary();
    const fullInfo = await configService.default.dumpEnvironmentInfo();
    
    // Utiliser fullInfo pour avoir toutes les données (envVars + firebaseSecrets)
    environmentInfo.value = {
      ...summary, // Contient firebaseSecrets
      envVars: fullInfo.envVars // Ajouter les variables d'environnement
    };
    environmentVars.value = fullInfo.envVars;
    
    console.log('🔄 Actualisation des informations d\'environnement...');
    console.log('✅ Informations d\'environnement actualisées:', {
      summary: summary,
      vars: fullInfo.envVars
    });
    
  } catch (err) {
    console.error('❌ Erreur lors de l\'actualisation:', err);
  }
}

async function dumpToConsole() {
  try {
    const configService = await import('../services/configService.js');
    const fullInfo = await configService.default.dumpEnvironmentInfo();
    alert('✅ Informations détaillées affichées dans la console (F12)');
  } catch (err) {
    console.error('❌ Erreur lors du dump console:', err);
  }
}



onMounted(() => {
  if (props.show) {
    try {
      email.value = auth?.currentUser?.email || '';
    } catch {}
  }
});

// Watcher pour actualiser les informations quand la modale de debug s'ouvre
watch(showEnvironmentDebug, async (newValue) => {
  if (newValue) {
    console.log('🚀 Ouverture de la modale de debug des variables d\'environnement');
    await refreshEnvironmentInfo();
  }
});
</script>
