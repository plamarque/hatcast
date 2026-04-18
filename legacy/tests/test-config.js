/**
 * Configuration des tests HatCast
 * Gère les variables d'environnement pour différents environnements de test
 */

// URL de base pour les tests
// Peut être surchargée par la variable d'environnement BASE_URL
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// Configuration par environnement
const config = {
  // URL de base
  baseUrl: BASE_URL,
  
  // Timeouts
  timeouts: {
    pageLoad: 30000,
    elementWait: 5000,
    navigation: 10000,
  },
  
  // Configuration des emails de test
  testEmails: {
    enabled: process.env.TEST_EMAILS_ENABLED === 'true',
    outputDir: 'test-output/emails',
  },
  
  // Configuration des screenshots
  screenshots: {
    enabled: true,
    outputDir: 'test-output/screenshots',
  },
  
  // Configuration des vidéos
  videos: {
    enabled: true,
    outputDir: 'test-output/videos',
  },
};

// Fonction utilitaire pour obtenir l'URL complète
function getFullUrl(path = '') {
  return `${config.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

// Fonction utilitaire pour vérifier si on est en mode CI
function isCI() {
  return process.env.CI === 'true';
}

// Fonction utilitaire pour vérifier si on est en mode développement local
function isLocalDev() {
  return config.baseUrl.includes('localhost') || config.baseUrl.includes('127.0.0.1');
}

module.exports = {
  config,
  getFullUrl,
  isCI,
  isLocalDev,
};
