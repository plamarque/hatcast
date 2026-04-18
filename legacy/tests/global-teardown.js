/**
 * Teardown global pour les tests Playwright
 * S'exécute une fois après tous les tests
 */

const fs = require('fs');
const path = require('path');

async function globalTeardown() {
  console.log('🧹 Teardown global des tests...');
  
  // Vérifier si on est en mode CI ou si on veut forcer le nettoyage
  const shouldCleanup = process.env.CI === 'true' || process.env.CLEANUP_TESTS === 'true';
  
  if (shouldCleanup) {
    console.log('   🗑️ Nettoyage automatique activé...');
    
    // Vérifier s'il y a eu des échecs de tests
    const testResultsDir = 'test-output/test-results';
    const hasFailures = fs.existsSync(testResultsDir) && 
      fs.readdirSync(testResultsDir).some(file => file.includes('failed'));
    
    if (hasFailures) {
      console.log('   ⚠️  Tests échoués détectés - Conservation des artefacts pour diagnostic');
      console.log('   📊 Screenshots/vidéos conservés dans test-output/test-results/');
      console.log('   📧 Emails conservés dans test-output/emails/');
    } else {
      console.log('   ✅ Tous les tests réussis - Nettoyage des artefacts');
      
      const dirsToClean = [
        'test-output/test-results',
        'test-output/emails'
      ];
      
      dirsToClean.forEach(dir => {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
          console.log(`   ✅ Supprimé: ${dir}`);
        }
      });
    }
    
    console.log('   📊 Rapports HTML conservés dans test-output/playwright-report/');
  } else {
    console.log('   📊 Fichiers de test conservés pour inspection');
    console.log('   💡 Pour nettoyage intelligent: CLEANUP_TESTS=true npm run test');
  }
  
  console.log('✅ Teardown global terminé');
}

module.exports = globalTeardown;
