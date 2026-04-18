// Configuration locale pour Playwright (exemple)
// Copier ce fichier vers playwright.config.local.js et ajuster les valeurs

const { defineConfig } = require('@playwright/test');

// Configuration personnelle
const LOCAL_CONFIG = {
  baseURL: 'http://localhost:5173', // Remplacer par ton URL personnelle
  // Autres configurations personnelles si nécessaire
  // timeout: 30000,
  // retries: 1,
};

module.exports = LOCAL_CONFIG;
