<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1390] p-4" @click="closeModal">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" @click.stop>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
          <span class="text-purple-400">📧</span>
          Test des Services Email
        </h2>
        <button @click="closeModal" class="text-white/80 hover:text-white">✖️</button>
      </div>

      <!-- Onglet unique : Test Email -->
      <div class="border-b border-white/20 mb-4">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'test'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              'border-purple-400 text-purple-300'
            ]"
          >
            🧪 Test Email
          </button>
        </nav>
      </div>

      <!-- Contenu principal : Test Email -->
      <div class="space-y-4">
        <div class="bg-white/5 p-4 rounded-lg border border-white/10">
          <h3 class="font-semibold mb-2 text-white">📊 Statut du Service</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium text-gray-300">Statut:</span>
              <span :class="serviceStatus ? 'text-green-400' : 'text-red-400'" class="ml-2">
                {{ serviceStatus ? '✅ Disponible' : '❌ Non disponible' }}
              </span>
            </div>
            <div>
              <span class="font-medium text-gray-300">Dernier Test:</span>
              <span class="text-gray-400 ml-2">{{ lastTestTime || 'Jamais' }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <button
            @click="testEmailService"
            :disabled="isTesting"
            class="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-500 disabled:opacity-50 transition-colors"
          >
            {{ isTesting ? '🔄 Test en cours...' : '🧪 Tester le Service Email' }}
          </button>
          
          <!-- Message de résultat pour le test du service -->
          <div v-if="testResult" class="bg-green-900/20 border border-green-500/30 p-3 rounded-lg">
            <div class="flex items-center gap-2 text-green-300 text-sm">
              <span>✅</span>
              <span>{{ testResult.message || 'Test réussi' }}</span>
            </div>
            <details class="mt-2">
              <summary class="cursor-pointer text-xs text-green-400 hover:text-green-300">
                📊 Voir les détails complets
              </summary>
              <pre class="text-xs bg-green-900/20 p-2 rounded border border-green-500/30 overflow-x-auto text-green-300 mt-2">{{ JSON.stringify(testResult, null, 2) }}</pre>
            </details>
          </div>
          
          <button
            @click="checkServiceAvailability"
            :disabled="isChecking"
            class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-500 disabled:opacity-50 transition-colors"
          >
            {{ isChecking ? '🔍 Vérification...' : '🔍 Vérifier la Disponibilité' }}
          </button>
          
          <!-- Message de résultat pour la vérification de disponibilité -->
          <div v-if="availabilityResult" class="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg">
            <div class="flex items-center gap-2 text-blue-300 text-sm">
              <span>✅</span>
              <span>{{ availabilityResult.message || 'Vérification terminée' }}</span>
            </div>
            <details class="mt-2">
              <summary class="cursor-pointer text-xs text-blue-400 hover:text-blue-300">
                📊 Voir les détails complets
              </summary>
              <pre class="text-xs bg-blue-900/20 p-2 rounded border border-blue-500/30 overflow-x-auto text-blue-300 mt-2">{{ JSON.stringify(availabilityResult, null, 2) }}</pre>
            </details>
          </div>
          
          <!-- Bouton de diagnostic avancé -->
          <button
            @click="runAdvancedDiagnostic"
            :disabled="isRunningDiagnostic"
            class="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-500 disabled:opacity-50 transition-colors"
          >
            {{ isRunningDiagnostic ? '🔬 Diagnostic en cours...' : '🔬 Diagnostic Avancé' }}
          </button>
          
          <!-- Résultats du diagnostic -->
          <div v-if="diagnosticResults" class="bg-orange-900/20 border border-orange-500/30 p-3 rounded-lg">
            <div class="flex items-center gap-2 text-orange-300 text-sm">
              <span>🔬</span>
              <span>Résultats du diagnostic</span>
            </div>
            <details class="mt-2">
              <summary class="cursor-pointer text-xs text-orange-400 hover:text-orange-300">
                📊 Voir les détails complets
              </summary>
              <pre class="text-xs bg-orange-900/20 p-2 rounded border border-orange-500/30 overflow-x-auto text-orange-300 mt-2">{{ JSON.stringify(diagnosticResults, null, 2) }}</pre>
            </details>
          </div>
        </div>

        <!-- Messages d'erreur individuels -->
        <div v-if="testError" class="bg-red-900/20 border border-red-500/30 p-3 rounded-lg">
          <div class="flex items-center gap-2 text-red-300 text-sm">
            <span>❌</span>
            <span>Erreur lors du test du service</span>
          </div>
          <p class="text-red-400 text-sm mt-2">{{ testError }}</p>
        </div>
        
        <div v-if="availabilityError" class="bg-red-900/20 border border-red-500/30 p-3 rounded-lg">
          <div class="flex items-center gap-2 text-red-300 text-sm">
            <span>❌</span>
            <span>Erreur lors de la vérification de disponibilité</span>
          </div>
          <p class="text-red-400 text-sm mt-2">{{ availabilityError }}</p>
        </div>

        <!-- Instructions de debug -->
        <div class="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
          <h3 class="font-semibold mb-2 text-blue-200">💡 Comment tester les emails ?</h3>
          <div class="text-sm text-gray-300 space-y-2">
            <p>1. <strong>Cliquez sur "Tester le Service Email"</strong> pour envoyer un email de test</p>
            <p>2. <strong>Vérifiez la console</strong> pour voir les détails du test</p>
            <p>3. <strong>En développement</strong>, les emails sont interceptés et non envoyés</p>
            <p>4. <strong>Vérifiez les logs</strong> dans la console pour diagnostiquer</p>
          </div>
        </div>

        <!-- Configuration Email Actuelle -->
        <div class="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg">
          <h3 class="font-semibold mb-2 text-purple-200">🔧 Configuration Email Actuelle</h3>
          <div class="space-y-3 text-sm">
            <!-- Environnement -->
            <div class="flex justify-between items-center">
              <span class="font-medium text-gray-300">🌍 Environnement:</span>
              <span class="px-2 py-1 rounded text-xs font-medium"
                    :class="{
                      'bg-green-600/30 border border-green-500/30 text-green-300': emailConfig.environment === 'production',
                      'bg-yellow-600/30 border border-yellow-500/30 text-yellow-300': emailConfig.environment === 'staging',
                      'bg-blue-600/30 border border-blue-500/30 text-blue-300': emailConfig.environment === 'development'
                    }">
                {{ emailConfig.environment?.toUpperCase() || 'INCONNU' }}
              </span>
            </div>
            
            <!-- Service Email -->
            <div class="flex justify-between items-center">
              <span class="font-medium text-gray-300">📧 Service Email:</span>
              <span class="px-2 py-1 rounded text-xs font-medium"
                    :class="{
                      'bg-purple-600/30 border border-purple-500/30 text-purple-300': emailConfig.service === 'ethereal',
                      'bg-red-600/30 border border-red-500/30 text-red-300': emailConfig.service === 'gmail',
                      'bg-gray-600/30 border border-gray-500/30 text-gray-300': !emailConfig.service
                    }">
                {{ emailConfig.service?.toUpperCase() || 'NON CONFIGURÉ' }}
              </span>
            </div>
            
            <!-- Credentials Ethereal -->
            <div class="flex justify-between items-center">
              <span class="font-medium text-gray-300">🔐 Credentials Ethereal:</span>
              <span class="px-2 py-1 rounded text-xs font-medium"
                    :class="{
                      'bg-green-600/30 border border-green-500/30 text-green-300': emailConfig.etherealConfigured,
                      'bg-red-600/30 border border-red-500/30 text-red-300': !emailConfig.etherealConfigured
                    }">
                {{ emailConfig.etherealConfigured ? '✅ CONFIGURÉ' : '❌ NON CONFIGURÉ' }}
              </span>
            </div>
            
            <!-- Source des Credentials -->
            <div v-if="emailConfig.etherealSource" class="flex justify-between items-center">
              <span class="font-medium text-gray-300">📁 Source des Credentials:</span>
              <span class="px-2 py-1 rounded text-xs font-medium"
                    :class="{
                      'bg-blue-600/30 border border-blue-500/30 text-blue-300': emailConfig.etherealSource === 'local_env',
                      'bg-orange-600/30 border border-orange-500/30 text-orange-300': emailConfig.etherealSource === 'firebase_secrets',
                      'bg-gray-600/30 border border-gray-500/30 text-gray-300': emailConfig.etherealSource === 'default'
                    }">
                {{ emailConfig.etherealSource === 'local_env' ? '📁 .env.local' : 
                   emailConfig.etherealSource === 'firebase_secrets' ? '☁️ Firebase Secrets' : 
                   '⚙️ Valeurs par défaut' }}
              </span>
            </div>
            
            <!-- Capture des Emails -->
            <div class="flex justify-between items-center">
              <span class="font-medium text-gray-300">📥 Capture des Emails:</span>
              <span class="px-2 py-1 rounded text-xs font-medium"
                    :class="{
                      'bg-green-600/30 border border-green-500/30 text-green-300': emailConfig.captureEnabled,
                      'bg-red-600/30 border border-red-500/30 text-red-300': !emailConfig.captureEnabled
                    }">
                {{ emailConfig.captureEnabled ? '✅ ACTIVÉE' : '❌ DÉSACTIVÉE' }}
              </span>
            </div>
            
            <!-- URL Ethereal -->
            <div v-if="emailConfig.etherealConfigured" class="flex justify-between items-center">
              <span class="font-medium text-gray-300">🌐 URL Ethereal:</span>
              <span class="text-xs text-gray-400">
                <a href="https://ethereal.email" target="_blank" class="text-blue-400 hover:text-blue-300 underline">
                  https://ethereal.email
                </a>
              </span>
            </div>
            
            <!-- Credentials Ethereal Détail -->
            <div v-if="emailConfig.etherealConfigured" class="mt-3 p-3 bg-white/5 border border-white/10 rounded-lg">
              <h4 class="font-medium text-gray-200 mb-2 text-xs">🔐 Détails des Credentials Ethereal</h4>
              <div class="space-y-2 text-xs">
                <!-- Username -->
                <div class="flex justify-between items-center">
                  <span class="text-gray-400">Username:</span>
                  <span class="font-mono text-gray-300">
                    {{ obfuscateEmail(emailConfig.etherealUser) }}
                  </span>
                </div>
                
                <!-- Password -->
                <div class="flex justify-between items-center">
                  <span class="font-medium text-gray-400">Password:</span>
                  <span class="font-mono text-gray-300">
                    {{ obfuscatePassword(emailConfig.etherealPass) }}
                  </span>
                </div>
                
                <!-- Source -->
                <div class="flex justify-between items-center">
                  <span class="text-gray-400">Source:</span>
                  <span class="text-xs px-2 py-1 rounded"
                        :class="{
                          'bg-blue-600/30 border border-blue-500/30 text-blue-300': emailConfig.etherealSource === 'local_env',
                          'bg-orange-600/30 border border-orange-500/30 text-orange-300': emailConfig.etherealSource === 'firebase_secrets',
                          'bg-gray-600/30 border border-gray-500/30 text-gray-300': emailConfig.etherealSource === 'default'
                        }">
                    {{ emailConfig.etherealSource === 'local_env' ? '📁 .env.local' : 
                       emailConfig.etherealSource === 'firebase_secrets' ? '☁️ Firebase Secrets' : 
                       '⚙️ Valeurs par défaut' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Bouton de rafraîchissement -->
          <div class="mt-3">
            <button
              @click="refreshEmailConfig"
              class="bg-purple-600 text-white py-1 px-3 rounded text-xs hover:bg-purple-500 transition-colors"
            >
              🔄 Actualiser la config
            </button>
          </div>
        </div>

        <div v-if="testResult" class="bg-white/5 p-4 rounded-lg border border-white/10">
          <h3 class="font-semibold mb-2 text-white">📋 Résultat du Test</h3>
          <pre class="text-sm bg-gray-800 p-3 rounded border border-white/10 overflow-x-auto text-gray-300">{{ JSON.stringify(testResult, null, 2) }}</pre>
        </div>

        <div v-if="error" class="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
          <h3 class="font-semibold text-red-300 mb-2">❌ Erreur</h3>
          <p class="text-red-200 text-sm">{{ error }}</p>
        </div>
      </div>

      <!-- Onglet Debug Environnement supprimé - redondant avec DevelopmentModal -->
      <!-- Utilisez la modale de développement pour les informations d'environnement -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import secureEmailService from '../services/secureEmailService.js';
import configService from '../services/configService.js';
import { getAuth } from 'firebase/auth';

const props = defineProps({ isVisible: Boolean });
const emit = defineEmits(['close']);


const isTesting = ref(false);
const isChecking = ref(false);
const serviceStatus = ref(false);
const lastTestTime = ref(null);
const testResult = ref(null);
const error = ref(null);

// Configuration email actuelle
const emailConfig = ref({
  environment: 'development',
  service: 'ethereal',
  etherealConfigured: false,
  etherealSource: 'default',
  etherealUser: '',
  etherealPass: '',
  captureEnabled: true
});

// Messages individuels pour chaque action
const testError = ref(null);
const availabilityResult = ref(null);
const availabilityError = ref(null);

// Diagnostic avancé
const isRunningDiagnostic = ref(false);
const diagnosticResults = ref(null);

// Ne pas initialiser auth au niveau du module
let auth = null;

const closeModal = () => {
  emit('close');
  // Reset state
  testResult.value = null;
  error.value = null;
};

const testEmailService = async () => {
  isTesting.value = true;
  testError.value = null;
  testResult.value = null;
  
  try {
    console.log('🧪 Début du test du service email...');
    console.log('🔧 Configuration actuelle:', emailConfig.value);
    
    const result = await secureEmailService.testEmail();
    console.log('✅ Test réussi, résultat:', result);
    
    testResult.value = result;
    lastTestTime.value = new Date().toLocaleString();
    serviceStatus.value = true;
    
    // Mettre à jour le statut du service
    console.log('📊 Statut du service mis à jour: disponible');
  } catch (err) {
    console.error('❌ Erreur détaillée lors du test email:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      developmentContext: err.developmentContext
    });
    
    // Créer un message d'erreur plus informatif
    let errorMessage = err.message || 'Erreur inconnue lors du test';
    
    if (err.developmentContext) {
      errorMessage += `\n\nContexte développement:\n- Environnement: ${err.developmentContext.environment}\n- Suggestion: ${err.developmentContext.suggestion}\n- Note: ${err.developmentContext.note}`;
    }
    
    testError.value = errorMessage;
    serviceStatus.value = false;
    
    console.log('📊 Statut du service mis à jour: non disponible');
  } finally {
    isTesting.value = false;
  }
};

const checkServiceAvailability = async () => {
  isChecking.value = true;
  availabilityError.value = null;
  availabilityResult.value = null;
  
  try {
    console.log('🔍 Début de la vérification de disponibilité du service email...');
    console.log('🔧 Configuration actuelle:', emailConfig.value);
    
    const available = await secureEmailService.isAvailable();
    console.log('📊 Résultat de la vérification:', available);
    
    serviceStatus.value = available;
    lastTestTime.value = new Date().toLocaleString();
    
    if (available) {
      const result = { status: 'success', message: 'Service email disponible' };
      availabilityResult.value = result;
      console.log('✅ Service disponible, résultat:', result);
    } else {
      const errorMsg = 'Service email non disponible';
      availabilityError.value = errorMsg;
      console.log('❌ Service non disponible:', errorMsg);
    }
  } catch (err) {
    console.error('❌ Erreur détaillée lors de la vérification:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      developmentContext: err.developmentContext
    });
    
    // Créer un message d'erreur plus informatif
    let errorMessage = err.message || 'Erreur lors de la vérification';
    
    if (err.developmentContext) {
      errorMessage += `\n\nContexte développement:\n- Environnement: ${err.developmentContext.environment}\n- Suggestion: ${err.developmentContext.suggestion}\n- Note: ${err.developmentContext.note}`;
    }
    
    availabilityError.value = errorMessage;
    serviceStatus.value = false;
  } finally {
    isChecking.value = false;
  }
};



const refreshEmailConfig = async () => {
  try {
    console.log('🔄 Actualisation de la configuration email...');
    
    // Récupérer la configuration email depuis le configService
    const etherealCredentials = configService.getEtherealCredentials();
    const environment = configService.detectEnvironment();
    
    emailConfig.value = {
      environment: environment,
      service: environment === 'development' || environment === 'staging' ? 'ethereal' : 'gmail',
      etherealConfigured: configService.isEtherealConfigured(),
      etherealSource: etherealCredentials ? etherealCredentials.source : 'none',
      etherealUser: etherealCredentials ? etherealCredentials.user : null,
      etherealPass: etherealCredentials ? etherealCredentials.pass : null,
      captureEnabled: environment === 'development' || environment === 'staging'
    };
    
    console.log('✅ Configuration email actualisée:', emailConfig.value);
  } catch (err) {
    console.error('❌ Erreur lors de l\'actualisation de la config email:', err);
    error.value = `Erreur lors de l'actualisation de la config email: ${err.message}`;
  }
};

// Fonctions d'obfuscation pour les credentials
const obfuscateEmail = (email) => {
  if (!email) return 'Non défini';
  const [username, domain] = email.split('@');
  if (username.length <= 3) return email;
  return `${username.slice(0, 3)}***@${domain}`;
};

const obfuscatePassword = (password) => {
  if (!password) return 'Non défini';
  if (password.length <= 4) return '***';
  return `${password.slice(0, 2)}***${password.slice(-2)}`;
};

const runAdvancedDiagnostic = async () => {
  isRunningDiagnostic.value = true;
  diagnosticResults.value = null;
  
  try {
    console.log('🔬 Début du diagnostic avancé...');
    
    const results = {
      timestamp: new Date().toISOString(),
      context: {
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        port: window.location.port,
        origin: window.location.origin,
        userAgent: navigator.userAgent,
        platform: navigator.platform
      },
      tests: {}
    };
    
    // Test 1: Connectivité réseau
    console.log('🔬 Test 1: Connectivité réseau...');
    try {
      const testResponse = await fetch('https://httpbin.org/get');
      results.tests.connectivity = {
        status: 'success',
        code: testResponse.status,
        message: 'Connectivité réseau OK'
      };
      console.log('✅ Test de connectivité réussi:', testResponse.status);
    } catch (error) {
      results.tests.connectivity = {
        status: 'error',
        message: error.message,
        details: error
      };
      console.log('❌ Test de connectivité échoué:', error.message);
    }
    
    // Test 2: URL sans headers
    console.log('🔬 Test 2: URL sans headers...');
    const url = 'https://us-central1-impro-selector.cloudfunctions.net/testEmail?environment=development';
    try {
      const response = await fetch(url);
      results.tests.noHeaders = {
        status: 'success',
        code: response.status,
        message: 'URL accessible sans headers'
      };
      console.log('✅ Test sans headers réussi:', response.status);
    } catch (error) {
      results.tests.noHeaders = {
        status: 'error',
        message: error.message,
        details: error
      };
      console.log('❌ Test sans headers échoué:', error.message);
    }
    
    // Test 3: URL avec Content-Type
    console.log('🔬 Test 3: URL avec Content-Type...');
    try {
      const response = await fetch(url, { 
        method: 'GET', 
        headers: { 'Content-Type': 'application/json' }
      });
      results.tests.contentType = {
        status: 'success',
        code: response.status,
        message: 'URL accessible avec Content-Type'
      };
      console.log('✅ Test avec Content-Type réussi:', response.status);
    } catch (error) {
      results.tests.contentType = {
        status: 'error',
        message: error.message,
        details: error
      };
      console.log('❌ Test avec Content-Type échoué:', error.message);
    }
    
    // Test 4: URL avec nos credentials dans les query parameters
    console.log('🔬 Test 4: URL avec nos credentials dans les query parameters...');
    try {
      // Récupérer les credentials depuis configService
      const etherealCredentials = configService.getEtherealCredentials();
      console.log('🔐 Credentials récupérés dans le diagnostic:', etherealCredentials);
      
      if (!etherealCredentials.user || !etherealCredentials.pass) {
        throw new Error(`Credentials incomplets: user=${!!etherealCredentials.user}, pass=${!!etherealCredentials.pass}`);
      }
      
      const urlWithCredentials = url + `&ethereal_user=${encodeURIComponent(etherealCredentials.user)}&ethereal_pass=${encodeURIComponent(etherealCredentials.pass)}`;
      console.log('🌐 URL avec credentials:', urlWithCredentials);
      
      const response = await fetch(urlWithCredentials);
      const responseData = await response.json();
      
      results.tests.ourCredentials = {
        status: 'success',
        code: response.status,
        message: 'URL accessible avec nos credentials dans les query parameters',
        credentials: {
          source: etherealCredentials ? etherealCredentials.source : 'none',
          user: etherealCredentials ? etherealCredentials.user : null,
          hasUser: etherealCredentials ? !!etherealCredentials.user : false,
          hasPass: etherealCredentials ? !!etherealCredentials.pass : false
        },
        url: urlWithCredentials,
        response: responseData
      };
      console.log('✅ Test avec nos credentials réussi:', response.status, responseData);
    } catch (error) {
      results.tests.ourCredentials = {
        status: 'error',
        message: error.message,
        details: error
      };
      console.log('❌ Test avec nos credentials échoué:', error.message);
    }
    
    // Test 5: Test de l'URL depuis la console
    console.log('🔬 Test 5: Test depuis la console...');
    try {
      // Simuler un test depuis la console
      const consoleTest = await new Promise((resolve) => {
        const testUrl = 'https://us-central1-impro-selector.cloudfunctions.net/testEmail?environment=development';
        fetch(testUrl)
          .then(response => response.json())
          .then(data => resolve({ status: 'success', data }))
          .catch(error => resolve({ status: 'error', message: error.message }));
      });
      
      results.tests.consoleTest = consoleTest;
    } catch (error) {
      results.tests.consoleTest = {
        status: 'error',
        message: error.message,
        details: error
      };
    }
    
    diagnosticResults.value = results;
    console.log('🔬 Diagnostic terminé:', results);
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    diagnosticResults.value = {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    isRunningDiagnostic.value = false;
  }
};



onMounted(() => {
  console.log('🚀 EmailTestModal monté, initialisation...');
  try {
    // Initialiser auth seulement quand Firebase est prêt
    auth = getAuth();
    console.log('✅ Auth Firebase initialisé');
  } catch (error) {
    console.warn('⚠️ Auth Firebase non disponible:', error);
  }
  
  // Initialiser seulement la configuration email de base
  refreshEmailConfig();
});


</script>
