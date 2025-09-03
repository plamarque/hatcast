// src/services/notificationsService.js
import { queueAvailabilityEmail, sendSelectionEmailsForEvent as sendSelectionEmailsViaEmail } from './emailService.js'
import { queuePushMessage } from './pushService.js'
import firestoreService from './firestoreService.js'
import logger from './logger.js'
import { buildNotificationPayloads } from './notificationTemplates.js'

/**
 * Send notifications to one recipient across all active channels, respecting user preferences.
 * channels currently: email (via Firestore mail queue), push (via pushQueue)
 */
export async function notifyRecipientAcrossChannels({
  reason,
  recipientEmail,
  recipientName,
  eventTitle,
  eventDate,
  urls = {}, // { yesUrl?, noUrl?, eventUrl? }
  extra = {} // any additional data needed by templates
}) {
  if (!recipientEmail) {
    logger.warn('Tentative de notification sans email', { reason })
    return { success: false, skipped: true, reason: 'missing_email' }
  }
  
  // Récupérer les préférences utilisateur avec fallback vers les valeurs par défaut
  let prefs = {}
  try {
    const prefsData = await firestoreService.getDocument('userPreferences', recipientEmail)
    prefs = prefsData || {}
  } catch (error) {
    // En cas d'erreur (permissions, réseau, etc.), utiliser les préférences par défaut
    logger.warn('Impossible de récupérer les préférences utilisateur, utilisation des valeurs par défaut', {
      email: recipientEmail,
      error: error.message,
      reason: 'fallback_to_defaults'
    })
    
    // Préférences par défaut pour assurer la continuité du service
    prefs = {
      emailNotifications: true,
      pushNotifications: true,
      availabilityReminders: true,
      selectionNotifications: true
    }
  }

  const payloads = buildNotificationPayloads({
    reason,
    recipientName,
    eventTitle,
    eventDate,
    urls,
    prefs,
    extra
  })

  const results = []

  // Email
  if (payloads.email && payloads.email.enabled) {
    if (reason === 'availability_request' || reason === 'availability_reminder') {
      await queueAvailabilityEmail({
        toEmail: recipientEmail,
        playerName: recipientName,
        eventTitle,
        eventDate,
        yesUrl: urls.yesUrl,
        noUrl: urls.noUrl,
        eventUrl: urls.eventUrl,
        reason: reason === 'availability_reminder' ? 'reminder' : 'new_event'
      }).then(() => results.push({ channel: 'email', success: true })).catch((e) => {
        logger.error('notifyRecipientAcrossChannels email error', e)
        results.push({ channel: 'email', success: false })
      })
    } else if (reason === 'selection') {
      // Selection emails are sent in batch by another helper; skip single send here
      // The batch path will still use templates from notificationTemplates
      results.push({ channel: 'email', success: true, skipped: true, note: 'batch_handled_elsewhere' })
    }
  }

  // Push
  if (payloads.push && payloads.push.enabled) {
    await queuePushMessage({
      toEmail: recipientEmail,
      title: payloads.push.title,
      body: payloads.push.body,
      data: payloads.push.data || {},
      reason
    }).then(() => {
      logger.info('Notification push envoyée avec succès', { reason, recipientEmail })
      results.push({ channel: 'push', success: true })
    }).catch((e) => {
      logger.error('notifyRecipientAcrossChannels push error', e)
      results.push({ channel: 'push', success: false })
    })
  }

  const success = results.some(r => r.success)
  return { success, results }
}

/**
 * Send availability request notifications to protected players for an event.
 * Uses multi-channel delivery; email is handled via queueAvailabilityEmail, push mirrored based on prefs.
 */
export async function sendAvailabilityNotificationsForEvent({
  eventId,
  eventData,
  players,
  seasonId,
  seasonSlug,
  createMagicLink,
  reminder = false,
  getAvailabilityForEvent = null // optional function (playerName, eventId) => true|false|undefined
}) {
  const failures = []
  const eventUrl = `${window.location.origin}/season/${seasonSlug}/event/${eventId}`

  for (const player of players) {
    try {
      // Si rappel: ne notifier que ceux qui n'ont pas répondu (availability === undefined)
      if (reminder && typeof getAvailabilityForEvent === 'function') {
        const status = await Promise.resolve(getAvailabilityForEvent(player.name, eventId))
        if (status === true || status === false) {
          // a déjà répondu, on saute
          continue
        }
      }
      // Only players with protection are eligible; emailService call enforces prefs
      // We rely on caller to filter protected players if needed
      const urls = {}
      if (typeof createMagicLink === 'function') {
        const yes = await createMagicLink({ seasonId, playerId: player.id, eventId, action: 'yes' })
        const no = await createMagicLink({ seasonId, playerId: player.id, eventId, action: 'no' })
        urls.yesUrl = `${yes.url}&slug=${encodeURIComponent(seasonSlug)}`
        urls.noUrl = `${no.url}&slug=${encodeURIComponent(seasonSlug)}`
      }
      urls.eventUrl = eventUrl

      const res = await notifyRecipientAcrossChannels({
        reason: reminder ? 'availability_reminder' : 'availability_request',
        recipientEmail: player.email,
        recipientName: player.name,
        eventTitle: eventData.title,
        eventDate: formatDateFull(eventData.date),
        urls
      })
      if (!res.success) failures.push(player.id)
    } catch (e) {
      failures.push(player.id)
    }
  }
  return { success: true, failures }
}

/**
 * Send selection notifications using existing batch email helper (emails + push mirror handled there).
 * This function delegates to email service for now, keeping a single source of truth.
 */
export async function sendSelectionNotificationsForEvent(args) {
  // Ajouter le paramètre isConfirmedTeam si pas déjà présent
  const argsWithConfirmedTeam = {
    ...args,
    isConfirmedTeam: args.isConfirmedTeam || false
  }
  return sendSelectionEmailsViaEmail(argsWithConfirmedTeam)
}

function formatDateFull(dateValue) {
  if (!dateValue) return ''
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue.toDate?.() || dateValue
  return date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}


