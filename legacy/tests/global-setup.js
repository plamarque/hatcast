/**
 * Setup global pour les tests Playwright
 * S'exécute une fois avant tous les tests
 */

const fs = require('fs');
const path = require('path');

async function globalSetup() {
  console.log('🧹 Setup global des tests...');
  
  // Créer les dossiers de sortie s'ils n'existent pas
  const outputDirs = [
    'test-output',
    'test-output/test-results',
    'test-output/playwright-report',
    'test-output/emails'
  ];
  
  outputDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`   📁 Créé: ${dir}`);
    }
  });
  
  console.log('✅ Setup global terminé');
}

module.exports = globalSetup;
