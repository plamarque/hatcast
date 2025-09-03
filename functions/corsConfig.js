/**
 * Configuration CORS centralisée pour toutes les Cloud Functions
 * Évite la duplication de code entre adminFunctions.js et emailFunctions.js
 */

const functions = require('firebase-functions');

/**
 * Récupère les origines CORS autorisées
 * Priorité : Configuration Firebase > URLs par défaut
 */
function getAllowedOrigins() {
  try {
    const config = functions.config();
    
    // URLs de production
    const productionUrls = config.urls?.production?.split(',') || [];
    
    // URLs de staging
    const stagingUrls = config.urls?.staging?.split(',') || [];
    
    // URLs de développement
    const developmentUrls = config.urls?.development?.split(',') || [];
    
    // Combiner toutes les URLs configurées
    const configuredUrls = [...productionUrls, ...stagingUrls, ...developmentUrls];
    
    if (configuredUrls.length > 0) {
      console.log('🌍 URLs CORS chargées depuis la config Firebase:', configuredUrls);
      return configuredUrls;
    }
  } catch (error) {
    console.warn('⚠️ Erreur lors du chargement de la config CORS:', error.message);
  }
  
  // Fallback vers des URLs exactes si pas de config
  console.log('🌍 Utilisation des URLs CORS par défaut');
  return [
    // Firebase Hosting (sites spécifiques)
    'https://impro-selector.web.app',
    'https://impro-selector.firebaseapp.com',
    'https://hatcast-staging.web.app',
    'https://hatcast-staging.firebaseapp.com',
    
    // Développement local
    'https://localhost:5173',
    'http://localhost:5173',
    'https://192.168.1.134:5173',
    'http://192.168.1.134:5173'
  ];
}

/**
 * Configuration CORS standard pour toutes les Cloud Functions
 */
const cors = require('cors')({
  origin: getAllowedOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

module.exports = {
  getAllowedOrigins,
  cors
};
