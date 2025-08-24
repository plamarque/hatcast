#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const TEST_EMAILS_DIR = path.join(__dirname, '..', 'test-output', 'emails');
const TEST_MODE = true;

console.log('🧪 Lancement des tests HatCast avec intercepteur d\'emails');
console.log('==================================================');

// Créer le dossier des emails de test
if (!fs.existsSync(TEST_EMAILS_DIR)) {
  fs.mkdirSync(TEST_EMAILS_DIR, { recursive: true });
  console.log('📁 Dossier des emails de test créé');
}

// Configuration des variables d'environnement pour les tests
const env = {
  ...process.env,
  NODE_ENV: 'test',
  TEST_EMAILS: 'true',
  PLAYWRIGHT_HEADLESS: 'false' // Pour voir les tests en action
};

// Fonction pour lancer les tests
function runTests(headed = false) {
  console.log('🚀 Lancement de TOUS les tests Playwright (incluant la protection des joueurs)...');
  
  // Arguments de base pour Playwright
  const testArgs = ['playwright', 'test'];
  if (headed) {
    testArgs.push('--headed');
  }
  
  const testProcess = spawn('npx', testArgs, {
    stdio: 'inherit',
    env: env,
    cwd: process.cwd()
  });

  testProcess.on('close', (code) => {
    console.log(`\n📊 Tests terminés avec le code: ${code}`);
    
    if (code === 0) {
      console.log('✅ Tous les tests ont réussi !');
    } else {
      console.log('❌ Certains tests ont échoué');
    }
    
    // Afficher les emails interceptés
    showInterceptedEmails();
  });

  testProcess.on('error', (error) => {
    console.error('❌ Erreur lors du lancement des tests:', error);
  });
}

// Fonction pour afficher les emails interceptés
function showInterceptedEmails() {
  console.log('\n📧 Emails interceptés pendant les tests:');
  console.log('=====================================');
  
  if (!fs.existsSync(TEST_EMAILS_DIR)) {
    console.log('📭 Aucun email intercepté');
    return;
  }
  
  const files = fs.readdirSync(TEST_EMAILS_DIR)
    .filter(file => file.endsWith('.json'))
    .sort();
  
  if (files.length === 0) {
    console.log('📭 Aucun email intercepté');
    return;
  }
  
  files.forEach((file, index) => {
    const emailPath = path.join(TEST_EMAILS_DIR, file);
    const email = JSON.parse(fs.readFileSync(emailPath, 'utf8'));
    
    console.log(`\n📬 Email ${index + 1}:`);
    console.log(`   Fichier: ${file}`);
    console.log(`   À: ${email.to}`);
    console.log(`   Sujet: ${email.subject}`);
    console.log(`   Intercepté: ${email.interceptedAt}`);
    
    // Extraire les liens si présents
    if (email.html) {
      const links = email.html.match(/href="([^"]*)"/g);
      if (links) {
        console.log(`   Liens trouvés: ${links.length}`);
        links.forEach((link, linkIndex) => {
          const url = link.replace('href="', '').replace('"', '');
          console.log(`     ${linkIndex + 1}. ${url}`);
        });
      }
    }
  });
}

// Fonction pour nettoyer les emails de test
function cleanupTestEmails() {
  if (fs.existsSync(TEST_EMAILS_DIR)) {
    fs.rmSync(TEST_EMAILS_DIR, { recursive: true, force: true });
    console.log('🧹 Emails de test nettoyés');
  }
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);

if (args.includes('--cleanup')) {
  cleanupTestEmails();
  process.exit(0);
}

if (args.includes('--show-emails')) {
  showInterceptedEmails();
  process.exit(0);
}

if (args.includes('--headed')) {
  console.log('🔒 Lancement des tests en mode visible');
  runTests(true);
} else {
  // Lancer les tests par défaut
  runTests(false);
}
