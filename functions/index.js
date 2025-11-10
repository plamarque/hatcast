const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { defineSecret } = require('firebase-functions/params')

admin.initializeApp()
const db = admin.firestore()

// Helper function to generate random tokens
function generateRandomToken(length = 32) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let token = ''
  for (let i = 0; i < length; i++) {
    token += charset[Math.floor(Math.random() * charset.length)]
  }
  return token
}

// Définir le secret Google Maps API Key (optionnel)
// const googleMapsApiKey = defineSecret('GOOGLE_MAPS_API_KEY')

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
    const pushId = context.params.pushId
    const payload = snap.data() || {}
    const toEmail = (payload.to || '').trim() // Nettoyer les espaces/tabs
    const title = payload.title || 'Notification'
    const body = payload.body || ''
    const data = payload.data || {}
    const reason = payload.reason || 'generic'

    console.log(`📱 Traitement notification push ${pushId}:`, { toEmail, title, reason })

    if (!toEmail) {
      console.warn(`⚠️ Email manquant pour ${pushId}`)
      // Supprimer immédiatement (pas besoin de garder les erreurs dans la queue)
      await snap.ref.delete()
      console.log(`🗑️ Document ${pushId} (missing_toEmail) supprimé de la queue`)
      return
    }

    const tokensDoc = await db.collection('userPushTokens').doc(toEmail).get()
    const tokens = tokensDoc.exists ? (tokensDoc.data().tokens || []) : []

    if (!tokens.length) {
      console.warn(`⚠️ Aucun token FCM pour ${toEmail}`)
      // Supprimer immédiatement (l'utilisateur doit activer les notifications)
      await snap.ref.delete()
      console.log(`🗑️ Document ${pushId} (no_tokens) supprimé de la queue`)
      return
    }

    console.log(`📲 Envoi à ${tokens.length} device(s) pour ${toEmail}`)

    const message = {
      // Data-only message so the Service Worker builds the notification (enables actions)
      data: Object.fromEntries(
        Object.entries({ title, body, reason, ...data }).map(([k, v]) => [k, String(v)])
      ),
      tokens
    }

    try {
      const resp = await admin.messaging().sendEachForMulticast(message)
      console.log(`✅ Push envoyée: ${resp.successCount}/${tokens.length} succès`)

      const invalid = []
      resp.responses.forEach((r, idx) => {
        if (!r.success) {
          const code = r.error?.code || ''
          console.warn(`⚠️ Échec token ${idx}:`, code)
          if (code.includes('registration-token-not-registered') || code.includes('invalid-argument')) {
            invalid.push(tokens[idx])
          }
        }
      })
      
      if (invalid.length) {
        console.log(`🧹 Suppression de ${invalid.length} token(s) invalide(s)`)
        await db.collection('userPushTokens').doc(toEmail).set({
          tokens: admin.firestore.FieldValue.arrayRemove(...invalid),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true })
      }

      // Supprimer de la queue une fois traité avec succès
      await snap.ref.delete()
      console.log(`🗑️ Document ${pushId} supprimé de la queue`)
      
    } catch (error) {
      console.error(`❌ Erreur envoi push ${pushId}:`, error)
      // Supprimer immédiatement même en cas d'erreur (garde la queue propre)
      await snap.ref.delete()
      console.log(`🗑️ Document ${pushId} (error: ${error.message}) supprimé de la queue`)
    }
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
              reminder: { ...reminder, id: reminderId },
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
 * Cloud Function pour traiter les rappels de disponibilité hebdomadaires
 * Déclenchée quotidiennement pour envoyer des rappels aux joueurs qui n'ont pas encore répondu
 */
exports.processAvailabilityReminders = functions.pubsub
  .schedule('every day 09:00')
  .timeZone('Europe/Paris')
  .onRun(async (context) => {
    const now = new Date()
    console.log('Traitement des rappels de disponibilité pour:', now.toISOString())

    try {
      // Récupérer tous les événements actifs (non archivés) dans les 21 prochains jours
      const maxDaysAhead = 21
      const minDate = new Date(now)
      minDate.setDate(minDate.getDate() + 1) // À partir de demain
      const maxDate = new Date(now)
      maxDate.setDate(maxDate.getDate() + maxDaysAhead)

      // Parcourir toutes les saisons
      const seasonsSnapshot = await db.collection('seasons').get()
      const results = []
      
      // Map pour regrouper les événements par joueur: playerEmail -> { playerInfo, events[] }
      const playersRemindersMap = new Map()

      for (const seasonDoc of seasonsSnapshot.docs) {
        const seasonId = seasonDoc.id
        const seasonData = seasonDoc.data()

        // Récupérer les événements de la saison
        const eventsSnapshot = await db.collection('seasons').doc(seasonId)
          .collection('events')
          .where('date', '>=', admin.firestore.Timestamp.fromDate(minDate))
          .where('date', '<=', admin.firestore.Timestamp.fromDate(maxDate))
          .where('archived', '==', false)
          .get()

        for (const eventDoc of eventsSnapshot.docs) {
          const eventId = eventDoc.id
          const eventData = eventDoc.data()
          const eventDate = eventData.date.toDate()

          // Calculer J-7 (7 jours avant l'événement)
          const reminderDate = new Date(eventDate)
          reminderDate.setDate(reminderDate.getDate() - 7)

          // Vérifier si on est à J-7 ou après (et avant l'événement)
          const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysUntilEvent < 1 || daysUntilEvent > maxDaysAhead) {
            continue // Ignorer les événements trop proches ou trop lointains
          }

          // Vérifier si on doit envoyer un rappel aujourd'hui (à J-7, puis chaque semaine)
          // On envoie à J-7, puis chaque semaine jusqu'à l'événement
          const daysSinceReminderDate = Math.floor((now.getTime() - reminderDate.getTime()) / (1000 * 60 * 60 * 24))
          const shouldSendToday = daysSinceReminderDate >= 0 && daysSinceReminderDate % 7 === 0 && daysUntilEvent > 0

          if (!shouldSendToday) {
            continue
          }

          // Récupérer les joueurs protégés de la saison
          const playersSnapshot = await db.collection('seasons').doc(seasonId)
            .collection('players')
            .get()

          // Récupérer la composition pour vérifier si elle est validée
          const castDoc = await db.collection('seasons').doc(seasonId)
            .collection('casts')
            .doc(eventId)
            .get()

          const cast = castDoc.exists ? castDoc.data() : null
          const isCastConfirmed = cast?.confirmed === true || cast?.status === 'confirmed'

          // Si la sélection est validée, ne pas envoyer de rappels
          if (isCastConfirmed) {
            console.log(`Événement ${eventId} a une sélection validée, skip`)
            continue
          }

          // Pour chaque joueur protégé, vérifier s'il a répondu
          for (const playerDoc of playersSnapshot.docs) {
            const playerData = playerDoc.data()
            const playerEmail = playerData.email
            const playerName = playerData.name
            const playerId = playerDoc.id

            if (!playerEmail) {
              continue // Pas d'email, pas de rappel
            }

            // Vérifier la disponibilité du joueur
            const availabilityDoc = await db.collection('seasons').doc(seasonId)
              .collection('players')
              .doc(playerId)
              .collection('availability')
              .doc(eventId)
              .get()

            const hasAvailability = availabilityDoc.exists
            const availabilityData = hasAvailability ? availabilityDoc.data() : null
            const hasResponded = availabilityData?.available !== undefined

            // Si le joueur a déjà répondu, ne pas envoyer de rappel
            if (hasResponded) {
              continue
            }

            // Vérifier s'il existe déjà un rappel de disponibilité en attente pour ce joueur/événement
            const existingReminder = await db.collection('reminderQueue')
              .where('seasonId', '==', seasonId)
              .where('eventId', '==', eventId)
              .where('playerEmail', '==', playerEmail)
              .where('reminderType', '==', 'availability_weekly')
              .where('status', '==', 'pending')
              .limit(1)
              .get()

            if (!existingReminder.empty) {
              // Un rappel est déjà en attente, vérifier s'il doit être mis à jour
              const existingReminderDoc = existingReminder.docs[0]
              const existingReminderData = existingReminderDoc.data()
              const existingScheduledFor = existingReminderData.scheduledFor.toDate()

              // Si le rappel existant est pour aujourd'hui ou dans le futur, ne pas en créer un nouveau
              if (existingScheduledFor >= now) {
                continue
              }
            }

            // Ajouter l'événement à la map pour regroupement
            if (!playersRemindersMap.has(playerEmail)) {
              playersRemindersMap.set(playerEmail, {
                playerEmail,
                playerName,
                playerId,
                seasonId,
                seasonSlug: seasonData.slug,
                events: []
              })
            }

            const baseUrl = functions.config().app?.base_url || 'https://hatcast.app'
            const eventUrl = `${baseUrl}/season/${seasonData.slug}/event/${eventId}`

            playersRemindersMap.get(playerEmail).events.push({
              eventId,
              eventTitle: eventData.title,
              eventDate: eventData.date,
              eventUrl,
              seasonId,
              seasonSlug: seasonData.slug
            })
          }
        }
      }

      // Envoyer les notifications groupées pour chaque joueur
      for (const [playerEmail, playerData] of playersRemindersMap.entries()) {
        if (playerData.events.length === 0) {
          continue
        }

        try {
          // Récupérer les préférences utilisateur
          const userPrefsDoc = await db.collection('userPreferences').doc(playerEmail).get()
          const userPrefs = userPrefsDoc.exists ? userPrefsDoc.data() : {}

          // Vérifier les préférences pour les rappels de disponibilité
          const shouldSendEmail = userPrefs.notifyAvailabilityReminderEmail !== false
          const shouldSendPush = userPrefs.notifyAvailabilityReminderPush !== false

          if (!shouldSendEmail && !shouldSendPush) {
            console.log(`Utilisateur ${playerEmail} a désactivé les rappels de disponibilité`)
            continue
          }

          // Envoyer les notifications groupées
          await sendGroupedAvailabilityReminderNotification({
            playerEmail: playerData.playerEmail,
            playerName: playerData.playerName,
            playerId: playerData.playerId,
            events: playerData.events
          })

          results.push({ 
            playerEmail, 
            eventsCount: playerData.events.length, 
            status: 'sent' 
          })

        } catch (error) {
          console.error(`Erreur lors de l'envoi des rappels groupés pour ${playerEmail}:`, error)
          results.push({ 
            playerEmail, 
            status: 'error', 
            error: error.message 
          })
        }
      }

      console.log('Traitement des rappels de disponibilité terminé:', results)
      return { success: true, processed: results.length, results }

    } catch (error) {
      console.error('Erreur générale lors du traitement des rappels de disponibilité:', error)
      throw error
    }
  })

/**
 * Fonction helper pour envoyer des notifications groupées de rappels de disponibilité
 * Envoie un email regroupé avec tous les événements et une push pour le prochain événement
 */
async function sendGroupedAvailabilityReminderNotification({ playerEmail, playerName, playerId, events }) {
  try {
    if (!playerId) {
      console.error('playerId manquant pour la génération des magic links')
      throw new Error('playerId manquant pour générer les magic links')
    }

    if (!events || events.length === 0) {
      return { skipped: true, reason: 'no_events' }
    }

    // Récupérer les préférences utilisateur
    const userPrefsDoc = await db.collection('userPreferences').doc(playerEmail).get()
    const userPrefs = userPrefsDoc.exists ? userPrefsDoc.data() : {}

    const shouldSendEmail = userPrefs.notifyAvailabilityReminderEmail !== false
    const shouldSendPush = userPrefs.notifyAvailabilityReminderPush !== false

    if (!shouldSendEmail && !shouldSendPush) {
      return { skipped: true, reason: 'user_preferences_disabled' }
    }

    const baseUrl = functions.config().app?.base_url || 'https://hatcast.app'
    const expirationDays = 14 // 14 jours d'expiration
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * expirationDays

    // Générer les magic links pour tous les événements
    const eventsWithLinks = []
    for (const event of events) {
      const yesToken = generateRandomToken(40)
      const noToken = generateRandomToken(40)

      // Sauvegarder les magic links dans Firestore
      const yesLinkId = `${event.seasonId}__${playerId}__${event.eventId}__yes`
      const noLinkId = `${event.seasonId}__${playerId}__${event.eventId}__no`

      await db.collection('magicLinks').doc(yesLinkId).set({
        seasonId: event.seasonId,
        playerId: playerId,
        eventId: event.eventId,
        token: yesToken,
        action: 'yes',
        expiresAt
      })

      await db.collection('magicLinks').doc(noLinkId).set({
        seasonId: event.seasonId,
        playerId: playerId,
        eventId: event.eventId,
        token: noToken,
        action: 'no',
        expiresAt
      })

      const yesUrl = `${baseUrl}/magic?sid=${encodeURIComponent(event.seasonId)}&pid=${encodeURIComponent(playerId)}&eid=${encodeURIComponent(event.eventId)}&t=${encodeURIComponent(yesToken)}&a=yes&slug=${encodeURIComponent(event.seasonSlug)}`
      const noUrl = `${baseUrl}/magic?sid=${encodeURIComponent(event.seasonId)}&pid=${encodeURIComponent(playerId)}&eid=${encodeURIComponent(event.eventId)}&t=${encodeURIComponent(noToken)}&a=no&slug=${encodeURIComponent(event.seasonSlug)}`

      eventsWithLinks.push({
        ...event,
        yesUrl,
        noUrl
      })
    }

    // Trier les événements par date (le plus proche en premier)
    eventsWithLinks.sort((a, b) => {
      const dateA = a.eventDate.toDate ? a.eventDate.toDate().getTime() : new Date(a.eventDate).getTime()
      const dateB = b.eventDate.toDate ? b.eventDate.toDate().getTime() : new Date(b.eventDate).getTime()
      return dateA - dateB
    })

    const nextEvent = eventsWithLinks[0] // Le prochain événement (le plus proche)

    const results = []

    // Envoyer l'email regroupé si activé
    if (shouldSendEmail) {
      try {
        const { buildGroupedAvailabilityReminderEmailTemplate } = require('./emailTemplates')
        const html = buildGroupedAvailabilityReminderEmailTemplate({
          playerName,
          events: eventsWithLinks
        })

        await db.collection('mail').add({
          to: playerEmail,
          message: {
            subject: `⏰ Rappel : demande de disponibilité`,
            html
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          meta: { 
            reason: 'availability_reminder_grouped', 
            eventsCount: eventsWithLinks.length,
            playerName
          }
        })

        results.push({ channel: 'email', success: true })
        console.log(`Email de rappel groupé envoyé à ${playerEmail} pour ${eventsWithLinks.length} événement(s)`)

      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de rappel groupé:', error)
        results.push({ channel: 'email', success: false, error: error.message })
      }
    }

    // Envoyer la notification push pour le prochain événement uniquement si activée
    if (shouldSendPush && nextEvent) {
      try {
        const tokensDoc = await db.collection('userPushTokens').doc(playerEmail).get()
        const tokens = tokensDoc.exists ? (tokensDoc.data().tokens || []) : []

        if (tokens.length > 0) {
          const nextEventDateStr = nextEvent.eventDate.toDate 
            ? nextEvent.eventDate.toDate().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
            : new Date(nextEvent.eventDate).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })

          const message = {
            data: {
              title: '⏰ Rappel : demande de disponibilité',
              body: `${playerName}, as-tu répondu pour ${nextEvent.eventTitle} ?`,
              url: nextEvent.eventUrl,
              yesUrl: nextEvent.yesUrl,
              noUrl: nextEvent.noUrl,
              reason: 'availability_reminder',
              eventId: nextEvent.eventId,
              seasonId: nextEvent.seasonId
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
            failureCount: resp.failureCount,
            eventId: nextEvent.eventId
          })

          console.log(`Notification push de rappel envoyée à ${playerEmail} pour le prochain événement: ${nextEvent.eventTitle}`)
        } else {
          results.push({ channel: 'push', success: false, reason: 'no_tokens' })
        }

      } catch (error) {
        console.error('Erreur lors de l\'envoi de la notification push de rappel:', error)
        results.push({ channel: 'push', success: false, error: error.message })
      }
    }

    return { success: true, results, eventsCount: eventsWithLinks.length }

  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications groupées de rappel de disponibilité:', error)
    throw error
  }
}

/**
 * Fonction helper pour envoyer une notification de rappel de disponibilité (single event - deprecated, use sendGroupedAvailabilityReminderNotification)
 */
async function sendAvailabilityReminderNotification({ reminder, eventUrl, seasonSlug, seasonId, eventId }) {
  try {
    const { playerEmail, playerName, playerId, eventTitle, eventDate } = reminder

    // Vérifier que playerId est disponible (requis pour la génération des magic links)
    if (!playerId) {
      console.error('playerId manquant dans le rappel:', reminder)
      throw new Error('playerId manquant pour générer les magic links')
    }

    // Récupérer les préférences utilisateur
    const userPrefsDoc = await db.collection('userPreferences').doc(playerEmail).get()
    const userPrefs = userPrefsDoc.exists ? userPrefsDoc.data() : {}

    const shouldSendEmail = userPrefs.notifyAvailabilityReminderEmail !== false
    const shouldSendPush = userPrefs.notifyAvailabilityReminderPush !== false

    if (!shouldSendEmail && !shouldSendPush) {
      return { skipped: true, reason: 'user_preferences_disabled' }
    }

    // Créer les magic links pour répondre (version serveur)
    // Utiliser playerId (ID du joueur) au lieu de playerName pour cohérence avec le client
    const baseUrl = functions.config().app?.base_url || 'https://hatcast.app'
    const yesToken = generateRandomToken(40)
    const noToken = generateRandomToken(40)
    const expirationDays = 14 // 14 jours d'expiration
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * expirationDays

    // Sauvegarder les magic links dans Firestore
    // Utiliser playerId dans le buildId pour cohérence avec magicLinks.js côté client
    const yesLinkId = `${seasonId}__${playerId}__${eventId}__yes`
    const noLinkId = `${seasonId}__${playerId}__${eventId}__no`

    await db.collection('magicLinks').doc(yesLinkId).set({
      seasonId,
      playerId: playerId, // Utiliser playerId (ID du joueur) au lieu de playerName
      eventId,
      token: yesToken,
      action: 'yes',
      expiresAt
    })

    await db.collection('magicLinks').doc(noLinkId).set({
      seasonId,
      playerId: playerId, // Utiliser playerId (ID du joueur) au lieu de playerName
      eventId,
      token: noToken,
      action: 'no',
      expiresAt
    })

    // Construire les URLs avec playerId (ID du joueur) pour cohérence avec le format côté client
    const yesUrl = `${baseUrl}/magic?sid=${encodeURIComponent(seasonId)}&pid=${encodeURIComponent(playerId)}&eid=${encodeURIComponent(eventId)}&t=${encodeURIComponent(yesToken)}&a=yes&slug=${encodeURIComponent(seasonSlug)}`
    const noUrl = `${baseUrl}/magic?sid=${encodeURIComponent(seasonId)}&pid=${encodeURIComponent(playerId)}&eid=${encodeURIComponent(eventId)}&t=${encodeURIComponent(noToken)}&a=no&slug=${encodeURIComponent(seasonSlug)}`

    const results = []

    // Envoyer l'email si activé
    if (shouldSendEmail) {
      try {
        const { buildAvailabilityReminderEmailTemplate } = require('./emailTemplates')
        const html = buildAvailabilityReminderEmailTemplate({
          playerName,
          eventTitle,
          eventDate: eventDate.toDate().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          eventUrl,
          yesUrl,
          noUrl
        })

        await db.collection('mail').add({
          to: playerEmail,
          message: {
            subject: `⏰ Rappel : demande de disponibilité`,
            html
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          meta: { 
            reason: 'availability_reminder', 
            eventTitle, 
            eventDate: reminder.eventDate, 
            playerName,
            reminderId: reminder.id 
          }
        })

        results.push({ channel: 'email', success: true })
        console.log('Email de rappel de disponibilité envoyé:', playerEmail)

      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de rappel de disponibilité:', error)
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
              title: '⏰ Rappel : demande de disponibilité',
              body: `${playerName}, as-tu répondu pour ${eventTitle} ?`,
              url: eventUrl,
              yesUrl: yesUrl,
              noUrl: noUrl,
              reason: 'availability_reminder',
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

          console.log('Notification push de rappel de disponibilité envoyée:', playerEmail)
        } else {
          results.push({ channel: 'push', success: false, reason: 'no_tokens' })
        }

      } catch (error) {
        console.error('Erreur lors de l\'envoi de la notification push de rappel de disponibilité:', error)
        results.push({ channel: 'push', success: false, error: error.message })
      }
    }

    return { success: true, results }

  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification de rappel de disponibilité:', error)
    throw error
  }
}

/**
 * Fonction helper pour envoyer une notification de rappel
 */
async function sendReminderNotification({ reminder, eventUrl, noUrl }) {
  try {
    const { playerEmail, playerName, eventTitle, eventDate, reminderType, id } = reminder
    // Fix: utiliser reminder.id si disponible pour l'audit
    const reminderId = id
    
    // Récupérer les préférences utilisateur
    const userPrefsDoc = await db.collection('userPreferences').doc(playerEmail).get()
    const userPrefs = userPrefsDoc.exists ? userPrefsDoc.data() : {}
    
    // Vérifier si l'utilisateur veut recevoir ce type de rappel
    // Fix: utiliser reminder.type comme fallback si reminderType n'est pas défini
    const actualReminderType = reminderType || (reminder.type === '7days' ? 'reminder_7days' : 'reminder_1day')
    const shouldSendEmail = actualReminderType === 'reminder_7days' 
      ? userPrefs.notifyReminder7Days !== false
      : userPrefs.notifyReminder1Day !== false
    
    // Fix: utiliser les préférences spécifiques par type de rappel
    const shouldSendPush = actualReminderType === 'reminder_7days'
      ? userPrefs.notifyReminder7DaysPush !== false
      : userPrefs.notifyReminder1DayPush !== false
    
    if (!shouldSendEmail && !shouldSendPush) {
      return { skipped: true, reason: 'user_preferences_disabled' }
    }
    
    const results = []
    
    // Envoyer l'email si activé
    if (shouldSendEmail) {
      try {
        const { buildReminderEmailTemplate } = require('./emailTemplates')
        // Fix: utiliser actualReminderType au lieu de reminderType
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
          reminderType: actualReminderType
        })
        
        await db.collection('mail').add({
          to: playerEmail,
          message: {
            subject: `${actualReminderType === 'reminder_7days' ? '📅' : '⏰'} Rappel : ${eventTitle} dans ${actualReminderType === 'reminder_7days' ? '7 jours' : '1 jour'}`,
            html
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          meta: { 
            reason: actualReminderType, 
            eventTitle, 
            eventDate: reminder.eventDate, 
            playerName,
            reminderId: reminder.id || reminderId
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
              title: `${actualReminderType === 'reminder_7days' ? '📅' : '⏰'} Rappel spectacle`,
              body: `${playerName}, ${eventTitle} dans ${actualReminderType === 'reminder_7days' ? '7 jours' : '1 jour'} ! Es-tu prêt(e) ?`,
              url: eventUrl,
              noUrl: noUrl,
              reason: actualReminderType,
              reminderType: actualReminderType,
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

// Export des fonctions de gestion de l'audit
exports.getAuditConfig = adminFunctions.getAuditConfig;
exports.enableAudit = adminFunctions.enableAudit;
exports.disableAudit = adminFunctions.disableAudit;

// ===== FONCTIONS RÔLES =====

// Export des fonctions de rôles
exports.checkSuperAdminStatus = roleFunctions.checkSuperAdminStatus;
exports.checkSeasonAdminStatus = roleFunctions.checkSeasonAdminStatus;
exports.grantSeasonAdmin = roleFunctions.grantSeasonAdmin;
exports.revokeSeasonAdmin = roleFunctions.revokeSeasonAdmin;
exports.listSeasonAdmins = roleFunctions.listSeasonAdmins;

// ===== FONCTION GOOGLE MAPS API =====

// Fonction pour exposer la clé API Google Maps de manière sécurisée
// Commenté temporairement car le secret GOOGLE_MAPS_API_KEY n'est pas encore créé
/*
exports.getGoogleMapsApiKey = functions
  .runWith({ secrets: [googleMapsApiKey] })
  .https.onCall(async (data, context) => {
    try {
      // Vérifier que l'utilisateur est authentifié
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
      }
      
      // Retourner la clé API (elle sera automatiquement injectée par Firebase)
      return {
        success: true,
        apiKey: googleMapsApiKey.value()
      }
    } catch (error) {
      console.error('Error getting Google Maps API key:', error)
      throw new functions.https.HttpsError('internal', 'Failed to get API key')
    }
  })
*/


