#!/usr/bin/env node

/**
 * Script de diagnostic des notifications push
 * Vérifie tous les composants du système de notifications push
 * 
 * Usage:
 *   node test-push-notifications.js --email user@example.com
 *   node test-push-notifications.js --check-all
 */

const admin = require('firebase-admin')
const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(emoji, color, message, data = null) {
  console.log(`${emoji} ${color}${message}${colors.reset}`)
  if (data) {
    console.log(JSON.stringify(data, null, 2))
  }
}

function success(message, data) {
  log('✅', colors.green, message, data)
}

function error(message, data) {
  log('❌', colors.red, message, data)
}

function warn(message, data) {
  log('⚠️', colors.yellow, message, data)
}

function info(message, data) {
  log('ℹ️', colors.blue, message, data)
}

function section(title) {
  console.log('\n' + '='.repeat(60))
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`)
  console.log('='.repeat(60) + '\n')
}

// Initialiser Firebase Admin
let db
try {
  // Chercher les credentials Firebase
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  
  if (!serviceAccountPath) {
    error('Variable GOOGLE_APPLICATION_CREDENTIALS non définie')
    process.exit(1)
  }
  
  const serviceAccount = require(serviceAccountPath)
  
  initializeApp({
    credential: cert(serviceAccount)
  })
  
  db = getFirestore()
  success('Firebase Admin initialisé')
} catch (err) {
  error('Erreur initialisation Firebase Admin:', err.message)
  process.exit(1)
}

/**
 * Vérifie si un utilisateur a des tokens FCM enregistrés
 */
async function checkUserTokens(email) {
  section(`Vérification des tokens FCM pour: ${email}`)
  
  try {
    const tokenDoc = await db.collection('userPushTokens').doc(email).get()
    
    if (!tokenDoc.exists) {
      warn(`Aucun document userPushTokens pour ${email}`)
      return { hasTokens: false, tokens: [] }
    }
    
    const data = tokenDoc.data()
    const tokens = data.tokens || []
    
    if (tokens.length === 0) {
      warn(`Document existe mais aucun token enregistré pour ${email}`)
      return { hasTokens: false, tokens: [] }
    }
    
    success(`${tokens.length} token(s) FCM trouvé(s)`, {
      tokens: tokens.map(t => t.substring(0, 20) + '...'),
      lastToken: data.lastToken?.substring(0, 20) + '...',
      updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || 'N/A',
      userAgent: data.userAgent
    })
    
    return { hasTokens: true, tokens, data }
    
  } catch (err) {
    error('Erreur lors de la vérification des tokens:', err.message)
    return { hasTokens: false, tokens: [], error: err.message }
  }
}

/**
 * Vérifie les préférences de notification de l'utilisateur
 */
async function checkUserPreferences(email) {
  section(`Vérification des préférences pour: ${email}`)
  
  try {
    const prefDoc = await db.collection('userPreferences').doc(email).get()
    
    if (!prefDoc.exists) {
      warn(`Aucune préférence trouvée pour ${email}`)
      info('Les préférences par défaut seront utilisées: push activé')
      return { hasPrefs: false, pushEnabled: true }
    }
    
    const prefs = prefDoc.data()
    const pushEnabled = prefs.pushNotifications !== false
    
    if (!pushEnabled) {
      warn('Notifications push désactivées dans les préférences utilisateur')
    } else {
      success('Notifications push activées dans les préférences')
    }
    
    info('Préférences complètes:', {
      emailNotifications: prefs.emailNotifications,
      pushNotifications: prefs.pushNotifications,
      availabilityReminders: prefs.availabilityReminders,
      selectionNotifications: prefs.selectionNotifications
    })
    
    return { hasPrefs: true, pushEnabled, prefs }
    
  } catch (err) {
    error('Erreur lors de la vérification des préférences:', err.message)
    return { hasPrefs: false, pushEnabled: true, error: err.message }
  }
}

/**
 * Vérifie l'état de la queue push
 */
async function checkPushQueue() {
  section('Vérification de la queue push')
  
  try {
    const queueSnapshot = await db.collection('pushQueue').limit(10).get()
    
    if (queueSnapshot.empty) {
      success('Queue push vide (normal)')
      return { queueSize: 0, documents: [] }
    }
    
    warn(`${queueSnapshot.size} document(s) dans la queue`, {
      note: 'La queue devrait être vide ou presque. Documents non traités ?'
    })
    
    const docs = []
    queueSnapshot.forEach(doc => {
      const data = doc.data()
      docs.push({
        id: doc.id,
        to: data.to,
        title: data.title,
        reason: data.reason,
        status: data.status,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || 'N/A',
        error: data.error
      })
    })
    
    info('Documents dans la queue:', docs)
    
    return { queueSize: queueSnapshot.size, documents: docs }
    
  } catch (err) {
    error('Erreur lors de la vérification de la queue:', err.message)
    return { queueSize: -1, error: err.message }
  }
}

/**
 * Envoie une notification push de test
 */
async function sendTestPush(email) {
  section(`Envoi d'une notification push de test à: ${email}`)
  
  try {
    // Vérifier que l'utilisateur a des tokens
    const { hasTokens, tokens } = await checkUserTokens(email)
    
    if (!hasTokens || tokens.length === 0) {
      error('Impossible d\'envoyer une notification: aucun token FCM')
      return { success: false, reason: 'no_tokens' }
    }
    
    // Créer le message de test
    const testMessage = {
      to: email,
      title: '🧪 Test Push',
      body: `Test de notification push (${new Date().toLocaleTimeString('fr-FR')})`,
      data: {
        url: '/',
        reason: 'test'
      },
      reason: 'test',
      createdAt: new Date()
    }
    
    info('Ajout à la queue push...')
    
    const docRef = await db.collection('pushQueue').add(testMessage)
    
    success(`Document ajouté à la queue: ${docRef.id}`)
    info('La Cloud Function processPushQueue devrait le traiter automatiquement')
    
    // Attendre quelques secondes et vérifier
    info('Attente de 5 secondes pour le traitement...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    const docSnap = await docRef.get()
    
    if (!docSnap.exists) {
      success('Document supprimé de la queue (traité avec succès)')
      return { success: true, processed: true }
    }
    
    const docData = docSnap.data()
    
    if (docData.status === 'no_tokens') {
      error('Traitement échoué: aucun token FCM trouvé')
      return { success: false, reason: 'no_tokens', data: docData }
    }
    
    if (docData.status === 'error') {
      error('Traitement échoué avec erreur', { error: docData.error })
      return { success: false, reason: 'error', data: docData }
    }
    
    warn('Document toujours dans la queue après 5 secondes', {
      status: docData.status,
      note: 'La Cloud Function n\'est peut-être pas déployée ou activée'
    })
    
    return { success: false, reason: 'not_processed', data: docData }
    
  } catch (err) {
    error('Erreur lors de l\'envoi du test:', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Vérifie tous les utilisateurs avec tokens
 */
async function checkAllUsers() {
  section('Vérification de tous les utilisateurs avec tokens FCM')
  
  try {
    const tokensSnapshot = await db.collection('userPushTokens').get()
    
    if (tokensSnapshot.empty) {
      warn('Aucun utilisateur n\'a de token FCM enregistré')
      return { userCount: 0, users: [] }
    }
    
    success(`${tokensSnapshot.size} utilisateur(s) avec tokens FCM`)
    
    const users = []
    tokensSnapshot.forEach(doc => {
      const data = doc.data()
      users.push({
        email: doc.id,
        tokenCount: (data.tokens || []).length,
        lastUpdate: data.updatedAt?.toDate?.()?.toISOString?.() || 'N/A',
        lastToken: data.lastToken?.substring(0, 20) + '...'
      })
    })
    
    info('Liste des utilisateurs:', users)
    
    return { userCount: tokensSnapshot.size, users }
    
  } catch (err) {
    error('Erreur lors de la vérification des utilisateurs:', err.message)
    return { userCount: -1, error: err.message }
  }
}

/**
 * Résumé de la configuration
 */
async function showConfigSummary() {
  section('Configuration du système de notifications push')
  
  info('Collections Firestore')
  console.log('  - userPushTokens: Tokens FCM par utilisateur')
  console.log('  - pushQueue: Queue de notifications à traiter')
  console.log('  - userPreferences: Préférences de notification')
  
  info('Cloud Function')
  console.log('  - processPushQueue: Traite la queue (trigger onCreate)')
  
  info('Service Worker')
  console.log('  - src/service-worker.js: Affiche les notifications')
  console.log('  - Firebase Messaging configuré')
  
  info('Configuration VAPID')
  console.log('  - Clé VAPID configurée dans configService.js')
  console.log('  - Même clé pour dev, staging et production')
}

// Main
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('Usage:')
    console.log('  node test-push-notifications.js --email user@example.com')
    console.log('  node test-push-notifications.js --check-all')
    console.log('  node test-push-notifications.js --queue')
    console.log('  node test-push-notifications.js --send-test user@example.com')
    console.log('  node test-push-notifications.js --config')
    process.exit(0)
  }
  
  const command = args[0]
  
  try {
    if (command === '--email') {
      const email = args[1]
      if (!email) {
        error('Email requis: --email user@example.com')
        process.exit(1)
      }
      await checkUserTokens(email)
      await checkUserPreferences(email)
    } else if (command === '--check-all') {
      await checkAllUsers()
      await checkPushQueue()
    } else if (command === '--queue') {
      await checkPushQueue()
    } else if (command === '--send-test') {
      const email = args[1]
      if (!email) {
        error('Email requis: --send-test user@example.com')
        process.exit(1)
      }
      await sendTestPush(email)
    } else if (command === '--config') {
      await showConfigSummary()
    } else {
      error(`Commande inconnue: ${command}`)
      process.exit(1)
    }
    
    success('Diagnostic terminé')
    process.exit(0)
    
  } catch (err) {
    error('Erreur fatale:', err.message)
    console.error(err)
    process.exit(1)
  }
}

main()


