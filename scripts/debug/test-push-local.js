#!/usr/bin/env node

/**
 * Script de test local des notifications push (sans credentials Firebase Admin)
 * Vérifie la configuration et le code côté client
 */

const fs = require('fs')
const path = require('path')

// Script may be run from scripts/debug/; resolve repo root
const ROOT_DIR = path.resolve(__dirname, '..', '..')

console.log('\n🔔 Test local des notifications push\n')

// Test 1: Vérifier que la Cloud Function existe
console.log('📋 Test 1: Vérification de la Cloud Function')
console.log('=' .repeat(60))

const functionsIndexPath = path.join(ROOT_DIR, 'functions', 'index.js')
if (fs.existsSync(functionsIndexPath)) {
  const content = fs.readFileSync(functionsIndexPath, 'utf8')
  
  if (content.includes('exports.processPushQueue')) {
    console.log('✅ Cloud Function processPushQueue trouvée')
    
    // Vérifier les améliorations
    if (content.includes('snap.ref.delete()')) {
      console.log('✅ Nettoyage de la queue implémenté')
    } else {
      console.log('⚠️  Nettoyage de la queue manquant')
    }
    
    if (content.includes('console.log') && content.includes('📱')) {
      console.log('✅ Logs améliorés présents')
    } else {
      console.log('⚠️  Logs améliorés manquants')
    }
    
    if (content.includes('try {') && content.includes('catch (error)')) {
      console.log('✅ Gestion d\'erreurs avec try/catch')
    } else {
      console.log('⚠️  Gestion d\'erreurs manquante')
    }
  } else {
    console.log('❌ Cloud Function processPushQueue non trouvée')
  }
} else {
  console.log('❌ Fichier functions/index.js non trouvé')
}

// Test 2: Vérifier le Service Worker
console.log('\n📋 Test 2: Vérification du Service Worker')
console.log('=' .repeat(60))

const swPath = path.join(ROOT_DIR, 'src', 'service-worker.js')
if (fs.existsSync(swPath)) {
  const content = fs.readFileSync(swPath, 'utf8')
  
  if (content.includes('firebase.messaging()')) {
    console.log('✅ Firebase Messaging configuré dans le Service Worker')
  } else {
    console.log('❌ Firebase Messaging manquant')
  }
  
  if (content.includes('onBackgroundMessage')) {
    console.log('✅ Handler onBackgroundMessage présent')
  } else {
    console.log('❌ Handler onBackgroundMessage manquant')
  }
  
  if (content.includes('notificationclick')) {
    console.log('✅ Handler notificationclick présent')
  } else {
    console.log('⚠️  Handler notificationclick manquant')
  }
} else {
  console.log('❌ Fichier src/service-worker.js non trouvé')
}

// Test 3: Vérifier le service de notifications côté client
console.log('\n📋 Test 3: Vérification du service notifications.js')
console.log('=' .repeat(60))

const notifServicePath = path.join(ROOT_DIR, 'src', 'services', 'notifications.js')
if (fs.existsSync(notifServicePath)) {
  const content = fs.readFileSync(notifServicePath, 'utf8')
  
  if (content.includes('requestAndGetToken')) {
    console.log('✅ Fonction requestAndGetToken présente')
  } else {
    console.log('❌ Fonction requestAndGetToken manquante')
  }
  
  if (content.includes('userPushTokens')) {
    console.log('✅ Sauvegarde dans userPushTokens implémentée')
  } else {
    console.log('❌ Sauvegarde dans userPushTokens manquante')
  }
  
  if (content.includes('ensurePushNotificationsActive')) {
    console.log('✅ Health check des notifications présent')
  } else {
    console.log('⚠️  Health check manquant')
  }
} else {
  console.log('❌ Fichier src/services/notifications.js non trouvé')
}

// Test 4: Vérifier le service pushService
console.log('\n📋 Test 4: Vérification du service pushService.js')
console.log('=' .repeat(60))

const pushServicePath = path.join(ROOT_DIR, 'src', 'services', 'pushService.js')
if (fs.existsSync(pushServicePath)) {
  const content = fs.readFileSync(pushServicePath, 'utf8')
  
  if (content.includes('queuePushMessage')) {
    console.log('✅ Fonction queuePushMessage présente')
  } else {
    console.log('❌ Fonction queuePushMessage manquante')
  }
  
  if (content.includes('pushQueue')) {
    console.log('✅ Utilise la collection pushQueue')
  } else {
    console.log('❌ Collection pushQueue non utilisée')
  }
  
  if (content.includes('to: toEmail')) {
    console.log('✅ Format correct (to: email)')
  } else {
    console.log('⚠️  Format potentiellement incorrect')
  }
} else {
  console.log('❌ Fichier src/services/pushService.js non trouvé')
}

// Test 5: Vérifier les règles Firestore
console.log('\n📋 Test 5: Vérification des règles Firestore')
console.log('=' .repeat(60))

const rulesPath = path.join(ROOT_DIR, 'firestore.rules')
if (fs.existsSync(rulesPath)) {
  const content = fs.readFileSync(rulesPath, 'utf8')
  
  if (content.includes('match /pushQueue/')) {
    console.log('✅ Règles pour pushQueue présentes')
    
    if (content.includes('allow write: if request.auth != null')) {
      console.log('✅ Écriture autorisée pour users authentifiés')
    }
  } else {
    console.log('❌ Règles pour pushQueue manquantes')
  }
  
  if (content.includes('match /userPushTokens/')) {
    console.log('✅ Règles pour userPushTokens présentes')
  } else {
    console.log('❌ Règles pour userPushTokens manquantes')
  }
} else {
  console.log('❌ Fichier firestore.rules non trouvé')
}

// Test 6: Vérifier la configuration VAPID
console.log('\n📋 Test 6: Vérification de la clé VAPID')
console.log('=' .repeat(60))

const configServicePath = path.join(ROOT_DIR, 'src', 'services', 'configService.js')
if (fs.existsSync(configServicePath)) {
  const content = fs.readFileSync(configServicePath, 'utf8')
  
  if (content.includes('vapidKey')) {
    console.log('✅ Configuration VAPID présente')
    
    // Compter les occurrences
    const matches = content.match(/vapidKey:\s*['"]BG1NEd8/g)
    if (matches && matches.length >= 3) {
      console.log('✅ VAPID configuré pour tous les environnements')
    } else {
      console.log('⚠️  VAPID peut manquer pour certains environnements')
    }
  } else {
    console.log('❌ Configuration VAPID manquante')
  }
  
  if (content.includes('getVapidKey()')) {
    console.log('✅ Méthode getVapidKey() présente')
  } else {
    console.log('❌ Méthode getVapidKey() manquante')
  }
} else {
  console.log('❌ Fichier src/services/configService.js non trouvé')
}

// Test 7: Vérifier la configuration Firebase
console.log('\n📋 Test 7: Vérification de firebase.json')
console.log('=' .repeat(60))

const firebaseJsonPath = path.join(ROOT_DIR, 'firebase.json')
if (fs.existsSync(firebaseJsonPath)) {
  const content = fs.readFileSync(firebaseJsonPath, 'utf8')
  const config = JSON.parse(content)
  
  if (config.functions) {
    console.log('✅ Configuration functions présente')
    
    if (config.functions.source) {
      console.log(`✅ Source: ${config.functions.source}`)
    }
  } else {
    console.log('❌ Configuration functions manquante')
  }
} else {
  console.log('❌ Fichier firebase.json non trouvé')
}

// Résumé
console.log('\n' + '='.repeat(60))
console.log('📊 RÉSUMÉ')
console.log('='.repeat(60))

console.log('\n✅ = OK  |  ⚠️ = Attention  |  ❌ = Problème\n')

console.log('Pour tester en production, tu dois:')
console.log('1. Déployer les Cloud Functions:')
console.log('   firebase deploy --only functions:processPushQueue')
console.log('')
console.log('2. Vérifier les logs dans Firebase Console:')
console.log('   Firebase Console > Functions > Logs')
console.log('   Rechercher: "processPushQueue"')
console.log('')
console.log('3. Tester avec un utilisateur réel:')
console.log('   - Ouvrir l\'app en navigation privée')
console.log('   - Se connecter avec un email')
console.log('   - Activer les notifications dans les préférences')
console.log('   - Vérifier dans la console: localStorage.fcmToken')
console.log('')
console.log('4. Vérifier la collection Firestore:')
console.log('   - userPushTokens/{email} doit contenir des tokens')
console.log('   - pushQueue doit être vide (ou presque)')
console.log('')

console.log('📚 Documentation complète:')
console.log('   - docs/technical/PUSH_NOTIFICATIONS_TROUBLESHOOTING.md')
console.log('   - PUSH_NOTIFICATIONS_SUMMARY.md')
console.log('   - README_PUSH_TEST.md')
console.log('')


