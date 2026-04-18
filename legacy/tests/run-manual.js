#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧪 Tests manuels HatCast (serveur déjà démarré)');
console.log('==============================================');

// Configuration des variables d'environnement pour les tests
const env = {
  ...process.env,
  NODE_ENV: 'test',
  TEST_EMAILS: 'true',
  PLAYWRIGHT_HEADLESS: 'false'
};

// Vérifier que le serveur est accessible
async function checkServer() {
  const https = require('https');
  
  // Utiliser la baseURL de Playwright ou la valeur par défaut
  const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
  
  return new Promise((resolve) => {
    const req = https.get(baseUrl, {
      rejectUnauthorized: false
    }, (res) => {
      console.log(`✅ Serveur accessible sur ${baseUrl}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
          console.log(`❌ Serveur non accessible sur ${baseUrl}`);
    console.log('   Assurez-vous que le serveur de développement est démarré avec: npm run dev -- --host');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Timeout lors de la connexion au serveur');
      resolve(false);
    });
  });
}

// Fonction pour lancer les tests
async function runManualTests() {
  console.log('🔍 Vérification du serveur...');
  
  const serverAvailable = await checkServer();
  if (!serverAvailable) {
    console.log('\n💡 Pour démarrer le serveur:');
    console.log('   npm run dev -- --host');
    console.log('\n💡 Puis relancez les tests:');
    console.log('   node tests/run-manual.js');
    process.exit(1);
  }
  
  console.log('\n🚀 Lancement des tests manuels...');
  
  const testProcess = spawn('npx', ['playwright', 'test', 'tests/manual.spec.js', '--headed'], {
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
  const TEST_EMAILS_DIR = path.join(__dirname, '..', 'test-output', 'emails');
  
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
  });
}

// Lancer les tests
runManualTests();
