// src/services/notificationTemplates.js

/**
 * Centralized templates for multi-channel notifications.
 * Build per-channel payloads from a single input.
 */

import { buildAvailabilityEmailTemplate, buildSelectionEmailTemplate } from './emailTemplates.js'

export function buildNotificationPayloads({ reason, recipientName, eventTitle, eventDate, urls = {}, prefs = {}, extra = {} }) {
  const payloads = { email: null, push: null }

  if (reason === 'availability_request' || reason === 'availability_reminder') {
    const emailEnabled = prefs?.notifyAvailability !== false
    const pushEnabled = prefs?.notifyAvailabilityPush !== false

    payloads.email = {
      enabled: emailEnabled,
      subject: (reason === 'availability_reminder' ? `Rappel disponibilité · ${eventTitle} (${eventDate})` : `Disponibilité demandée · ${eventTitle} (${eventDate})`),
      // HTML est construit dans emailService.queueAvailabilityEmail pour garder l'implémentation existante
    }
    payloads.push = {
      enabled: pushEnabled,
      title: reason === 'availability_reminder' ? '⏰ Rappel disponibilité' : `🎯 Nouveau spectacle !`,
      body: reason === 'availability_reminder' ? `${recipientName}, ${eventTitle} (${eventDate})` : `🎭 On a besoin de toi pour ${eventTitle} le ${eventDate} !`,
      data: { url: urls.eventUrl, yesUrl: urls.yesUrl, noUrl: urls.noUrl, reason }
    }
    
    // Log de débogage pour les URLs
    console.log('URLs pour notifications de disponibilité:', {
      eventUrl: urls.eventUrl,
      yesUrl: urls.yesUrl,
      noUrl: urls.noUrl,
      urls
    })
  }

  if (reason === 'selection') {
    const emailEnabled = prefs?.notifySelection !== false
    const pushEnabled = prefs?.notifySelectionPush !== false

    payloads.email = {
      enabled: emailEnabled,
      subject: `🎭 Equipe pour ${eventTitle}`
      // HTML sélection géré dans emailService.queueAvailabilityEmail pour garder l'implémentation existante
    }
    payloads.push = {
      enabled: pushEnabled,
      title: `🎭 Tu es sélectionné(e) !`,
      body: `🕺 Prépares-toi à briller pour ${eventTitle} le ${eventDate}!`,
      data: { url: urls.eventUrl, noUrl: urls.noUrl, reason }
    }
    
    // Log de débogage pour les URLs de sélection
    console.log('URLs pour notifications de sélection:', {
      eventUrl: urls.eventUrl,
      noUrl: urls.noUrl,
      urls
    })
  }

  // Log de débogage
  console.log('buildNotificationPayloads', { 
    reason, 
    recipientName, 
    prefs, 
    payloads,
    emailEnabled: payloads.email?.enabled,
    pushEnabled: payloads.push?.enabled
  })

  return payloads
}

/**
 * Templates de preview unifiés - utilisés à la fois pour le preview ET l'envoi
 * Élimine la duplication de code entre EventAnnounceModal.vue et l'envoi réel
 */

/**
 * Preview/Envoi push pour disponibilité
 */
export function buildAvailabilityPushPreview({ recipientName, eventTitle, eventDate }) {
  return {
    title: `🎯 Nouveau spectacle !`,
    body: `🎭 On a besoin de toi pour ${eventTitle} le ${eventDate} !`
  }
}

/**
 * Preview/Envoi push pour sélection
 */
export function buildSelectionPushPreview({ recipientName, eventTitle, eventDate }) {
  return {
    title: `🎭 Tu es sélectionné(e) !`,
    body: `🕺 Prépares-toi à briller pour ${eventTitle} le ${eventDate}!`
  }
}

/**
 * Preview/Envoi email pour disponibilité
 */
export function buildAvailabilityEmailPreview({ recipientName, eventTitle, eventDate, eventUrl, yesUrl, noUrl }) {
  return {
    subject: `🎭 ${eventTitle} · ${eventDate}`,
    from: 'HatCast',
    to: recipientName,
    html: buildAvailabilityEmailTemplate({ playerName: recipientName, eventTitle, eventDate, eventUrl, yesUrl, noUrl })
  }
}

/**
 * Preview/Envoi email pour sélection
 */
export function buildSelectionEmailPreview({ recipientName, eventTitle, eventDate, eventUrl, noUrl }) {
  return {
    subject: `🎭 Tu es dans la sélection pour ${eventTitle}!`,
    from: 'HatCast',
    to: recipientName,
    html: buildSelectionEmailTemplate({ playerName: recipientName, eventTitle, eventDate, eventUrl, noUrl })
  }
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


