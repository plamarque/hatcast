<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">🧪 Test des Services Email</h2>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Onglets -->
      <div class="border-b border-gray-200 mb-4">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'test'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'test'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            🧪 Test Email
          </button>
          <button
            @click="activeTab = 'debug'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'debug'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            🔍 Debug Environnement
          </button>
        </nav>
      </div>

      <!-- Onglet Test Email -->
      <div v-if="activeTab === 'test'" class="space-y-4">
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="font-semibold mb-2">📊 Statut du Service</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium">Statut:</span>
              <span :class="serviceStatus ? 'text-green-600' : 'text-red-600'">
                {{ serviceStatus ? '✅ Disponible' : '❌ Non disponible' }}
              </span>
            </div>
            <div>
              <span class="font-medium">Dernier Test:</span>
              <span class="text-gray-600">{{ lastTestTime || 'Jamais' }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <button
            @click="testEmailService"
            :disabled="isTesting"
            class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {{ isTesting ? '🔄 Test en cours...' : '🧪 Tester le Service Email' }}
          </button>

          <button
            @click="checkServiceAvailability"
            :disabled="isChecking"
            class="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {{ isChecking ? '🔍 Vérification...' : '🔍 Vérifier la Disponibilité' }}
          </button>
        </div>

        <div v-if="testResult" class="bg-gray-50 p-4 rounded-lg">
          <h3 class="font-semibold mb-2">📋 Résultat du Test</h3>
          <pre class="text-sm bg-white p-3 rounded border overflow-x-auto">{{ JSON.stringify(testResult, null, 2) }}</pre>
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h3 class="font-semibold text-red-800 mb-2">❌ Erreur</h3>
          <p class="text-red-700 text-sm">{{ error }}</p>
        </div>
      </div>

      <!-- Onglet Debug Environnement -->
      <div v-if="activeTab === 'debug'" class="space-y-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="font-semibold mb-2">🔍 Informations d'Environnement</h3>
          <p class="text-sm text-blue-700 mb-3">
            Ces informations vous permettent de vérifier que la configuration est correcte pour l'environnement actuel.
          </p>
          <button
            @click="refreshEnvironmentInfo"
            class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-sm"
          >
            🔄 Actualiser
          </button>
        </div>

        <!-- Résumé de l'environnement -->
        <div v-if="environmentSummary" class="bg-white border rounded-lg p-4">
          <h4 class="font-semibold mb-3 text-gray-800">📋 Résumé de l'Environnement</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="font-medium">Environnement:</span>
                <span class="px-2 py-1 rounded text-xs font-medium"
                      :class="{
                        'bg-green-100 text-green-800': environmentSummary.environment === 'production',
                        'bg-yellow-100 text-yellow-800': environmentSummary.environment === 'staging',
                        'bg-blue-100 text-blue-800': environmentSummary.environment === 'development'
                      }">
                  {{ environmentSummary.environment.toUpperCase() }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">URL:</span>
                <span class="text-gray-600 text-xs truncate max-w-48">{{ environmentSummary.url }}</span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="font-medium">Firebase Project:</span>
                <span class="text-gray-600 text-xs">{{ environmentSummary.firebase.projectId }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Auth Domain:</span>
                <span class="text-gray-600 text-xs">{{ environmentSummary.firebase.authDomain }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Configuration Firestore -->
        <div v-if="environmentSummary" class="bg-white border rounded-lg p-4">
          <h4 class="font-semibold mb-3 text-gray-800">🗄️ Configuration Firestore</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="flex justify-between">
              <span class="font-medium">Base de données:</span>
              <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                {{ environmentSummary.firestore.database }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Région:</span>
              <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                {{ environmentSummary.firestore.region }}
              </span>
            </div>
          </div>
        </div>

        <!-- Configuration Storage -->
        <div v-if="environmentSummary" class="bg-white border rounded-lg p-4">
          <h4 class="font-semibold mb-3 text-gray-800">📁 Configuration Storage</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="flex justify-between">
              <span class="font-medium">Bucket:</span>
              <span class="text-gray-600 text-xs truncate max-w-32">{{ environmentSummary.storage.bucket }}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Préfixe:</span>
              <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                {{ environmentSummary.storage.prefix }}
              </span>
            </div>
          </div>
        </div>

        <!-- Configuration Email -->
        <div v-if="environmentSummary" class="bg-white border rounded-lg p-4">
          <h4 class="font-semibold mb-3 text-gray-800">📧 Configuration Email</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="flex justify-between">
              <span class="font-medium">Service:</span>
              <span class="px-2 py-1 rounded text-xs font-medium"
                    :class="{
                      'bg-purple-100 text-purple-800': environmentSummary.email.service === 'ethereal',
                      'bg-red-100 text-red-800': environmentSummary.email.service === 'gmail'
                    }">
                {{ environmentSummary.email.service.toUpperCase() }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Capture:</span>
              <span class="px-2 py-1 rounded text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': environmentSummary.email.capture,
                      'bg-gray-100 text-gray-800': !environmentSummary.email.capture
                    }">
                {{ environmentSummary.email.capture ? 'OUI' : 'NON' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Variables d'environnement -->
        <div class="bg-white border rounded-lg p-4">
          <h4 class="font-semibold mb-3 text-gray-800">🔧 Variables d'Environnement</h4>
          <div class="space-y-2 text-sm">
            <div v-for="(value, key) in environmentVars" :key="key" class="flex justify-between items-center">
              <span class="font-medium text-gray-700">{{ key }}:</span>
              <span class="text-xs px-2 py-1 rounded"
                    :class="{
                      'bg-green-100 text-green-800': value === '✅ Définie',
                      'bg-red-100 text-red-800': value === '❌ Non définie',
                      'bg-gray-100 text-gray-800': value !== '✅ Définie' && value !== '❌ Non définie'
                    }">
                {{ value }}
              </span>
            </div>
          </div>
        </div>

        <!-- Bouton pour afficher les détails complets dans la console -->
        <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h4 class="font-semibold text-yellow-800 mb-2">💡 Informations Détaillées</h4>
          <p class="text-yellow-700 text-sm mb-3">
            Pour voir toutes les informations détaillées (y compris les valeurs sensibles), ouvrez la console du navigateur et cliquez sur le bouton ci-dessous.
          </p>
          <button
            @click="dumpToConsole"
            class="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 text-sm"
          >
            📋 Dumper dans la Console
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import secureEmailService from '../services/secureEmailService.js';
import configService from '../services/configService.js';
import { getAuth } from 'firebase/auth';

const props = defineProps({ isVisible: Boolean });
const emit = defineEmits(['close']);

const activeTab = ref('test');
const isTesting = ref(false);
const isChecking = ref(false);
const serviceStatus = ref(false);
const lastTestTime = ref(null);
const testResult = ref(null);
const error = ref(null);
const environmentSummary = ref(null);
const environmentVars = ref({});

// Ne pas initialiser auth au niveau du module
let auth = null;

const closeModal = () => {
  emit('close');
  // Reset state
  activeTab.value = 'test';
  testResult.value = null;
  error.value = null;
};

const testEmailService = async () => {
  isTesting.value = true;
  error.value = null;
  testResult.value = null;
  
  try {
    const result = await secureEmailService.testEmail();
    testResult.value = result;
    lastTestTime.value = new Date().toLocaleString();
    serviceStatus.value = true;
  } catch (err) {
    error.value = err.message || 'Erreur inconnue lors du test';
    serviceStatus.value = false;
  } finally {
    isTesting.value = false;
  }
};

const checkServiceAvailability = async () => {
  isChecking.value = true;
  error.value = null;
  
  try {
    const available = await secureEmailService.isAvailable();
    serviceStatus.value = available;
    lastTestTime.value = new Date().toLocaleString();
    
    if (available) {
      testResult.value = { status: 'success', message: 'Service email disponible' };
    } else {
      error.value = 'Service email non disponible';
    }
  } catch (err) {
    error.value = err.message || 'Erreur lors de la vérification';
    serviceStatus.value = false;
  } finally {
    isChecking.value = false;
  }
};

const refreshEnvironmentInfo = () => {
  try {
    console.log('🔄 Actualisation des informations d\'environnement...');
    environmentSummary.value = configService.getEnvironmentSummary();
    const fullInfo = configService.dumpEnvironmentInfo();
    environmentVars.value = fullInfo.envVars;
    console.log('✅ Informations d\'environnement actualisées:', {
      summary: environmentSummary.value,
      vars: environmentVars.value
    });
  } catch (err) {
    console.error('❌ Erreur lors de l\'actualisation:', err);
    error.value = `Erreur lors de l'actualisation: ${err.message}`;
  }
};

const dumpToConsole = () => {
  try {
    const fullInfo = configService.dumpEnvironmentInfo();
    console.log('🔍 DEBUG COMPLET - HatCast Environment Info:', fullInfo);
    console.log('📋 Résumé formaté:', configService.getEnvironmentSummary());
    alert('✅ Informations détaillées affichées dans la console (F12)');
  } catch (err) {
    console.error('❌ Erreur lors du dump console:', err);
    error.value = `Erreur lors du dump console: ${err.message}`;
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
  refreshEnvironmentInfo();
});

// Surveiller le changement d'onglet pour actualiser les infos
watch(activeTab, (newTab) => {
  if (newTab === 'debug') {
    console.log('🔍 Onglet debug activé, actualisation des infos...');
    refreshEnvironmentInfo();
  }
});
</script>
