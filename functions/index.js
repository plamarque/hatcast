const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()
const db = admin.firestore()

// Import des services d'audit
const AuditService = require('./auditService')
const auditTriggers = require('./auditTriggers')
const auditQueries = require('./auditQueries')

// Import des fonctions admin
const adminFunctions = require('./adminFunctions')

// Import des fonctions de rôles
const roleFunctions = require('./roleFunctions')

// Callable: crée un custom token Firebase pour un email et le renvoie
exports.createCustomTokenForEmail = functions.https.onCall(async (data, context) => {
  try {
    const email = (data && data.email || '').trim()
    if (!email) {
      return { success: false, error: 'missing_email' }
    }
    
    // Vérifier si l'utilisateur existe
    let user = null
    try {
      user = await admin.auth().getUserByEmail(email)
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        // Créer un utilisateur avec un mot de passe temporaire
        const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'
        user = await admin.auth().createUser({ 
          email,
          password: tempPassword,
          emailVerified: true
        })
      } else {
        throw e
      }
    }
    
    // Créer un custom token
    const token = await admin.auth().createCustomToken(user.uid, {
      email: user.email,
      email_verified: user.emailVerified
    })
    
    return { success: true, token, uid: user.uid }
  } catch (error) {
    console.error('createCustomTokenForEmail error', error)
    return { success: false, error: error.message || 'unknown_error' }
  }
})

// ===== FONCTIONS D'AUDIT =====

// Triggers d'audit
exports.auditAvailabilityChanges = auditTriggers.auditAvailabilityChanges
exports.auditSelectionChanges = auditTriggers.auditSelectionChanges
exports.auditEventChanges = auditTriggers.auditEventChanges
exports.auditPlayerChanges = auditTriggers.auditPlayerChanges

// Requêtes d'audit
exports.getAuditLogs = auditQueries.getAuditLogs
exports.searchAuditLogs = auditQueries.searchAuditLogs
exports.getAuditStats = auditQueries.getAuditStats
exports.getEventHistory = auditQueries.getEventHistory
exports.getPlayerHistory = auditQueries.getPlayerHistory

// ===== FONCTIONS EXISTANTES =====

exports.processPushQueue = functions.firestore
  .document('pushQueue/{pushId}')
  .onCreate(async (snap, context) => {
    const payload = snap.data() || {}
    const toEmail = payload.to
    const title = payload.title || 'Notification'
    const body = payload.body || ''
    const data = payload.data || {}

    if (!toEmail) {
      await snap.ref.set({ status: 'error', error: 'missing_toEmail' }, { merge: true })
      return
    }

    const tokensDoc = await db.collection('userPushTokens').doc(toEmail).get()
    const tokens = tokensDoc.exists ? (tokensDoc.data().tokens || []) : []

    if (!tokens.length) {
      await snap.ref.set({ status: 'no_tokens' }, { merge: true })
      return
    }

    const message = {
      // Data-only message so the Service Worker builds the notification (enables actions)
      data: Object.fromEntries(
        Object.entries({ title, body, ...data }).map(([k, v]) => [k, String(v)])
      ),
      tokens
    }

    const resp = await admin.messaging().sendEachForMulticast(message)

    const invalid = []
    resp.responses.forEach((r, idx) => {
      if (!r.success) {
        const code = r.error?.code || ''
        if (code.includes('registration-token-not-registered') || code.includes('invalid-argument')) {
          invalid.push(tokens[idx])
        }
      }
    })
    if (invalid.length) {
      await db.collection('userPushTokens').doc(toEmail).set({
        tokens: admin.firestore.FieldValue.arrayRemove(...invalid),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true })
    }

    await snap.ref.set({
      status: 'sent',
      successCount: resp.successCount,
      failureCount: resp.failureCount,
      processedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true })
  })

/**
 * Cloud Function pour traiter les rappels automatiques
 * Déclenchée toutes les heures par Cloud Scheduler
 */
exports.processReminders = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = new Date()
    console.log('Traitement des rappels pour:', now.toISOString())
    
    try {
      // Récupérer tous les rappels en attente pour aujourd'hui
      const startOfDay = new Date(now)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(now)
      endOfDay.setHours(23, 59, 59, 999)
      
      const remindersQuery = db.collection('reminderQueue')
        .where('scheduledFor', '>=', startOfDay)
        .where('scheduledFor', '<=', endOfDay)
        .where('status', '==', 'pending')
      
      const remindersSnapshot = await remindersQuery.get()
      
      if (remindersSnapshot.empty) {
        console.log('Aucun rappel à traiter aujourd\'hui')
        return null
      }
      
      console.log(`${remindersSnapshot.docs.length} rappels à traiter`)
      
      const results = []
      
      // Traiter chaque rappel
      for (const reminderDoc of remindersSnapshot.docs) {
        const reminder = reminderDoc.data()
        const reminderId = reminderDoc.id
        
        try {
          console.log('Traitement du rappel:', { reminderId, type: reminder.type, playerEmail: reminder.playerEmail })
          
          // Vérifier que le rappel n'est pas trop ancien (max 24h de retard)
          const scheduledTime = reminder.scheduledFor.toDate()
          const maxDelay = 24 * 60 * 60 * 1000 // 24h en ms
          
          if (now.getTime() - scheduledTime.getTime() > maxDelay) {
            console.log('Rappel trop ancien, marqué comme expiré:', reminderId)
            await reminderDoc.ref.update({
              status: 'expired',
              processedAt: admin.firestore.FieldValue.serverTimestamp(),
              result: 'expired_too_old'
            })
            results.push({ reminderId, status: 'expired', reason: 'too_old' })
            continue
          }
          
          // Créer les URLs pour le désistement
          // Utiliser la configuration Firebase ou une URL par défaut
          const baseUrl = functions.config().app?.base_url || 'https://hatcast.app'
          const eventUrl = `${baseUrl}/season/${reminder.seasonSlug}/event/${reminder.eventId}`
          
          // Créer un magic link pour le désistement (simplifié ici)
          const noUrl = `${eventUrl}?action=desist&player=${encodeURIComponent(reminder.playerName)}`
          
          // Envoyer la notification
          const notificationResult = await sendReminderNotification({
            reminder,
            eventUrl,
            noUrl
          })
          
          // Marquer le rappel comme traité
          await reminderDoc.ref.update({
            status: 'processed',
            processedAt: admin.firestore.FieldValue.serverTimestamp(),
            result: notificationResult
          })
          
          results.push({ reminderId, status: 'processed', result: notificationResult })
          console.log('Rappel traité avec succès:', reminderId)
          
        } catch (error) {
          console.error('Erreur lors du traitement du rappel:', reminderId, error)
          
          // Marquer comme erreur
          await reminderDoc.ref.update({
            status: 'error',
            processedAt: admin.firestore.FieldValue.serverTimestamp(),
            error: error.message
          })
          
          results.push({ reminderId, status: 'error', error: error.message })
        }
      }
      
      console.log('Traitement des rappels terminé:', results)
      return { success: true, processed: results.length, results }
      
    } catch (error) {
      console.error('Erreur générale lors du traitement des rappels:', error)
      throw error
    }
  })

/**
 * Fonction helper pour envoyer une notification de rappel
 */
async function sendReminderNotification({ reminder, eventUrl, noUrl }) {
  try {
    const { playerEmail, playerName, eventTitle, eventDate, reminderType } = reminder
    
    // Récupérer les préférences utilisateur
    const userPrefsDoc = await db.collection('userPreferences').doc(playerEmail).get()
    const userPrefs = userPrefsDoc.exists ? userPrefsDoc.data() : {}
    
    // Vérifier si l'utilisateur veut recevoir ce type de rappel
    const shouldSendEmail = reminderType === 'reminder_7days' 
      ? userPrefs.notifyReminder7Days !== false
      : userPrefs.notifyReminder1Day !== false
    
    const shouldSendPush = userPrefs.notifyReminderPush !== false
    
    if (!shouldSendEmail && !shouldSendPush) {
      return { skipped: true, reason: 'user_preferences_disabled' }
    }
    
    const results = []
    
    // Envoyer l'email si activé
    if (shouldSendEmail) {
      try {
        const { buildReminderEmailTemplate } = require('./emailTemplates')
        const html = buildReminderEmailTemplate({
          playerName,
          eventTitle,
          eventDate: eventDate.toDate().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          eventUrl,
          noUrl,
          reminderType
        })
        
        await db.collection('mail').add({
          to: playerEmail,
          message: {
            subject: `${reminderType === 'reminder_7days' ? '📅' : '⏰'} Rappel : ${eventTitle} dans ${reminderType === 'reminder_7days' ? '7 jours' : '1 jour'}`,
            html
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          meta: { 
            reason: reminderType, 
            eventTitle, 
            eventDate: reminder.eventDate, 
            playerName,
            reminderId: reminder.id 
          }
        })
        
        results.push({ channel: 'email', success: true })
        console.log('Email de rappel envoyé:', playerEmail)
        
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de rappel:', error)
        results.push({ channel: 'email', success: false, error: error.message })
      }
    }
    
    // Envoyer la notification push si activée
    if (shouldSendPush) {
      try {
        const tokensDoc = await db.collection('userPushTokens').doc(playerEmail).get()
        const tokens = tokensDoc.exists ? (tokensDoc.data().tokens || []) : []
        
        if (tokens.length > 0) {
          const message = {
            data: {
              title: `${reminderType === 'reminder_7days' ? '📅' : '⏰'} Rappel spectacle`,
              body: `${playerName}, ${eventTitle} dans ${reminderType === 'reminder_7days' ? '7 jours' : '1 jour'} ! Es-tu prêt(e) ?`,
              url: eventUrl,
              noUrl: noUrl,
              reason: reminderType,
              reminderType: reminderType,
              eventId: reminder.eventId,
              seasonId: reminder.seasonId
            },
            tokens
          }
          
          const resp = await admin.messaging().sendEachForMulticast(message)
          
          // Nettoyer les tokens invalides
          const invalid = []
          resp.responses.forEach((r, idx) => {
            if (!r.success) {
              const code = r.error?.code || ''
              if (code.includes('registration-token-not-registered') || code.includes('invalid-argument')) {
                invalid.push(tokens[idx])
              }
            }
          })
          
          if (invalid.length) {
            await db.collection('userPushTokens').doc(playerEmail).update({
              tokens: admin.firestore.FieldValue.arrayRemove(...invalid)
            })
          }
          
          results.push({ 
            channel: 'push', 
            success: true, 
            successCount: resp.successCount,
            failureCount: resp.failureCount
          })
          
          console.log('Notification push de rappel envoyée:', playerEmail)
        } else {
          results.push({ channel: 'push', success: false, reason: 'no_tokens' })
        }
        
      } catch (error) {
        console.error('Erreur lors de l\'envoi de la notification push de rappel:', error)
        results.push({ channel: 'push', success: false, error: error.message })
      }
    }
    
    return { success: true, results }
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification de rappel:', error)
    throw error
  }
}

// ===== FONCTIONS EMAIL =====

// Import des fonctions email
const emailFunctions = require('./emailFunctions');

// Export des fonctions email
exports.sendEmail = emailFunctions.sendEmail;
exports.sendSelectionNotification = emailFunctions.sendSelectionNotification;
exports.sendAvailabilityNotification = emailFunctions.sendAvailabilityNotification;
exports.sendPasswordResetEmail = emailFunctions.sendPasswordResetEmail;
exports.testEmail = emailFunctions.testEmail;

// ===== FONCTIONS ADMIN =====

// Export des fonctions admin
exports.checkAdminStatus = adminFunctions.checkAdminStatus;
exports.dumpEnvironment = adminFunctions.dumpEnvironment;
exports.checkAdminConfig = adminFunctions.checkAdminConfig;
exports.testAdminAccess = adminFunctions.testAdminAccess;
exports.getLogLevel = adminFunctions.getLogLevel;
exports.setLogLevel = adminFunctions.setLogLevel;
exports.resetPasswordWithCustomToken = adminFunctions.resetPasswordWithCustomToken;

// ===== FONCTIONS RÔLES =====

// Export des fonctions de rôles
exports.checkSuperAdminStatus = roleFunctions.checkSuperAdminStatus;
exports.checkSeasonAdminStatus = roleFunctions.checkSeasonAdminStatus;
exports.grantSeasonAdmin = roleFunctions.grantSeasonAdmin;
exports.revokeSeasonAdmin = roleFunctions.revokeSeasonAdmin;
exports.listSeasonAdmins = roleFunctions.listSeasonAdmins;


