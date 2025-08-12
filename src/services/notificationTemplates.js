// src/services/notificationTemplates.js

/**
 * Centralized templates for multi-channel notifications.
 * Build per-channel payloads from a single input.
 */
export function buildNotificationPayloads({ reason, recipientName, eventTitle, eventDate, urls = {}, prefs = {}, extra = {} }) {
  const payloads = { email: null, push: null }

  if (reason === 'availability_request' || reason === 'availability_reminder') {
    const emailEnabled = prefs?.notifyAvailability !== false
    const pushEnabled = prefs?.notifyAvailabilityPush !== false

    payloads.email = {
      enabled: emailEnabled,
      subject: (reason === 'availability_reminder' ? `Rappel disponibilité · ${eventTitle} (${eventDate})` : `Disponibilité demandée · ${eventTitle} (${eventDate})`),
      // HTML est construit dans emailService.queueAvailabilityEmail pour garder l’implémentation existante
    }
    payloads.push = {
      enabled: pushEnabled,
      title: reason === 'availability_reminder' ? '⏰ Rappel disponibilité' : '🗓️ Disponibilité demandée',
      body: `${recipientName}, ${eventTitle} (${eventDate})`,
      data: { url: urls.eventUrl, yesUrl: urls.yesUrl, noUrl: urls.noUrl, reason }
    }
  }

  if (reason === 'selection') {
    const emailEnabled = prefs?.notifySelection !== false
    const pushEnabled = prefs?.notifySelectionPush !== false
    payloads.email = {
      enabled: emailEnabled,
      subject: `🎭 Sélection confirmée · ${eventTitle}`
      // HTML sélection géré dans emailService.queueSelectionEmail / batch helper
    }
    payloads.push = {
      enabled: pushEnabled,
      title: '🎭 Sélection confirmée',
      body: `${recipientName}, tu as été sélectionné(e) pour ${eventTitle} (${eventDate}) 🎉`,
      data: { url: urls.eventUrl }
    }
  }

  return payloads
}

/**
 * Message brut pour copier-coller dans la modale (texte simple)
 */
export function buildCopyMessage({ mode = 'event', eventTitle, eventDate, eventUrl, selectedPlayers = [] }) {
  if (mode === 'selection') {
    const playersList = (selectedPlayers || []).join(', ')
    return `Sélection pour ${eventTitle} du ${eventDate} : ${playersList}`
  }
  return `Bonjour !\n\nNouvel événement : ${eventTitle}\nDate : ${eventDate}\n\nLien direct vers l'événement : ${eventUrl}\n\nMerci de confirmer votre disponibilité.`
}

/**
 * Texte de prévisualisation (personnalisé par destinataire) aligné avec les notifications envoyées
 */
export function buildPreviewText({ mode = 'event', recipientName = '[Nom du joueur]', eventTitle, eventDate, eventUrl, selectedPlayers = [] }) {
  if (mode === 'selection') {
    const playersList = (selectedPlayers || []).join(', ')
    return `Sélection confirmée\n\nBonjour ${recipientName},\n\nTu as été sélectionné(e) pour ${eventTitle} (${eventDate}).\n\nSélection complète : ${playersList}.\n\nPlus d'infos : ${eventUrl}`
  }
  return `Disponibilité demandée\n\nBonjour ${recipientName},\n\nPeux-tu indiquer ta disponibilité pour ${eventTitle} (${eventDate}) ?\n\nLien de l'événement : ${eventUrl}`
}


