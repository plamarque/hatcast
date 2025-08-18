// src/services/emailService.js
// Service d'envoi d'emails – version Trigger Email (Firebase Extension)
import { db } from './firebase.js'
import logger from './logger.js'
import { addDoc, collection, serverTimestamp, getDoc, doc } from 'firebase/firestore'
import { queuePushMessage } from './pushService'
import { buildAvailabilityEmailTemplate, buildNotificationActivationTemplate } from './emailTemplates.js'

// Configuration centralisée de l'expéditeur
const DEFAULT_FROM_EMAIL = 'HatCast <impropick@gmail.com>'
const DEFAULT_REPLY_TO = 'impropick@gmail.com'

// Fonction utilitaire pour configurer l'expéditeur
function getFromEmailConfig(customFromEmail = null) {
  return {
    from: customFromEmail || DEFAULT_FROM_EMAIL,
    replyTo: customFromEmail || DEFAULT_REPLY_TO
  }
}

// Pour utiliser EmailJS, il faut :
// 1. Créer un compte sur https://www.emailjs.com/
// 2. Configurer un service d'email (Gmail, Outlook, etc.)
// 3. Créer un template d'email
// 4. Installer le package : npm install @emailjs/browser

// Ancienne fonction EmailJS retirée – la réinitialisation passe par Firebase Auth directement ailleurs

// Fonction pour générer un lien de réinitialisation
export function generateResetLink(playerId, token) {
  // En production, utilisez votre domaine
  return `${window.location.origin}/reset-password?player=${playerId}&token=${token}`
}

// Enqueue email for Firebase Trigger Email (SendGrid/SMTP) via Firestore
export async function queueAvailabilityEmail({
  toEmail,
  playerName,
  eventTitle,
  eventDate,
  yesUrl,
  noUrl,
  eventUrl = undefined,
  reason = 'new_event',
  fromEmail = undefined // optionnel, sinon valeur par défaut de l'extension
}) {
  // Respecter préférences notification
  try {
    const prefRef = doc(db, 'userPreferences', toEmail)
    const prefSnap = await getDoc(prefRef)
    if (prefSnap.exists()) {
      const prefs = prefSnap.data()
      if (prefs?.notifyAvailability === false) {
        return { success: true, skipped: true }
      }
    }
  } catch {}
  const html = buildAvailabilityEmailTemplate({
    playerName,
    eventTitle,
    eventDate,
    eventUrl,
    yesUrl,
    noUrl
  })

  const subject = `${reason === 'reminder' ? 'Rappel: ' : ''}${eventTitle} (${eventDate})`

  const docData = {
    to: toEmail,
    message: {
      subject,
      html
    },
    createdAt: serverTimestamp(),
    meta: { reason, eventTitle, eventDate, playerName }
  }
  
  // Configurer l'expéditeur (HatCast par défaut)
  const fromConfig = getFromEmailConfig(fromEmail)
  docData.from = fromConfig.from
  docData.replyTo = fromConfig.replyTo

  await addDoc(collection(db, 'mail'), docData)

  // Mirror push (expérimental) si activé dans préférences
  try {
    const prefRef = doc(db, 'userPreferences', toEmail)
    const prefSnap = await getDoc(prefRef)
    const prefs = prefSnap.exists() ? prefSnap.data() : {}
    if (prefs?.notifyAvailabilityPush !== false) {
      const title = `${reason === 'reminder' ? 'Rappel: ' : ''}${eventTitle} (${eventDate})`
      const body = `${playerName}, t'es dispo ?`
      await queuePushMessage({
        toEmail,
        title,
        body,
        data: { url: eventUrl || window.location.origin, yesUrl, noUrl, reason },
        reason: reason === 'reminder' ? 'availability_reminder' : 'availability_request'
      })
    }
  } catch {}
  return { success: true }
}

// Envoi d'un email de vérification pour activer la protection
// Nouveau: email de vérification générique (protection joueur ou mise à jour email compte)
export async function queueVerificationEmail({ toEmail, verifyUrl, purpose = 'player_protection', displayName = 'utilisateur', fromEmail = undefined }) {
  const isAccount = purpose === 'account_email_update'
  const title = isAccount ? 'Vérification de votre nouvelle adresse email' : 'Vérification de votre email'
  const line1 = `Bonjour ${displayName},`
  const body = isAccount
    ? "Pour sécuriser votre compte, merci de confirmer que vous avez accès à cette nouvelle adresse email."
    : "Pour sécuriser votre joueur, merci de confirmer que vous avez accès à cette adresse email."
  const cta = isAccount ? 'Confirmer mon adresse email' : 'Vérifier mon email'
  const subject = isAccount ? 'Confirmez votre nouvelle adresse email' : 'Confirmez votre email pour activer la protection'
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
      <h2>${title}</h2>
      <p>${line1}</p>
      <p>${body}</p>
      <p>
        <a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#3b82f6;color:#fff;border-radius:8px;text-decoration:none;">${cta}</a>
      </p>
      <p style="font-size:12px;color:#6b7280;">Ce lien expirera dans 7 jours.</p>
    </div>
  `
  const docData = {
    to: toEmail,
    message: { subject, html },
    createdAt: serverTimestamp(),
    meta: { reason: purpose, displayName }
  }
  
  // Configurer l'expéditeur (HatCast par défaut)
  const fromConfig = getFromEmailConfig(fromEmail)
  docData.from = fromConfig.from
  docData.replyTo = fromConfig.replyTo
  await addDoc(collection(db, 'mail'), docData)
}

// Ancien alias conservé pour compat: protection joueur
export async function queueProtectionVerificationEmail({ toEmail, playerName, verifyUrl, fromEmail = undefined }) {
  return queueVerificationEmail({ toEmail, verifyUrl, purpose: 'player_protection', displayName: playerName, fromEmail })
}

// Fonction pour envoyer des emails de notification de sélection
export async function queueSelectionEmail({
  toEmail,
  playerName,
  eventTitle,
  eventDate,
  eventUrl,
  html = undefined,
  subject = undefined,
  fromEmail = undefined,
  noUrl = undefined // Ajout de noUrl
}) {
  // Respecter préférences notification
  try {
    const prefRef = doc(db, 'userPreferences', toEmail)
    const prefSnap = await getDoc(prefRef)
    if (prefSnap.exists()) {
      const prefs = prefSnap.data()
      if (prefs?.notifySelection === false) {
        return { success: true, skipped: true }
      }
    }
  } catch {}
  logger.debug('queueSelectionEmail', { forPlayer: playerName, hasCustomHtml: !!html, hasCustomSubject: !!subject })
  
  // Si HTML et sujet personnalisés sont fournis, les utiliser
  // Sinon, utiliser le template par défaut
  const emailHtml = html || `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
      <p>Bonjour ${playerName},</p>
      <p>Félicitations ! Tu as été sélectionné(e) pour <strong>${eventTitle}</strong> (${eventDate}).</p>
      <p>
        <a href="${eventUrl}" style="display:inline-block;padding:10px 12px;border:2px solid #8b5cf6;color:#8b5cf6;border-radius:8px;text-decoration:none;">Afficher les Détails</a>
      </p>
      <p style="font-size:12px;color:#6b7280;">Tu recevras bientôt plus d'informations sur l'organisation.</p>
    </div>
  `

  const emailSubject = subject || `🎭 Confirme ta participation pour · ${eventTitle}`
  
  logger.debug('queueSelectionEmail html/subject ready')

  const docData = {
    to: toEmail,
    message: {
      subject: emailSubject,
      html: emailHtml
    },
    createdAt: serverTimestamp(),
    meta: { reason: 'selection', eventTitle, eventDate, playerName }
  }
  
  // Configurer l'expéditeur (HatCast par défaut)
  const fromConfig = getFromEmailConfig(fromEmail)
  docData.from = fromConfig.from
  docData.replyTo = fromConfig.replyTo

  logger.debug('queueSelectionEmail firestore payload ready')
  
  try {
    await addDoc(collection(db, 'mail'), docData)
    // Enqueue push mirror si préférences l'autorisent
    try {
      const prefRef = doc(db, 'userPreferences', toEmail)
      const prefSnap = await getDoc(prefRef)
      const prefs = prefSnap.exists() ? prefSnap.data() : {}
      console.log('Préférences utilisateur pour notifications push', { 
        toEmail, 
        prefs, 
        notifySelectionPush: prefs?.notifySelectionPush,
        shouldSendPush: prefs?.notifySelectionPush !== false 
      })
      if (prefs?.notifySelectionPush !== false) {
        console.log('Envoi notification push de sélection', { toEmail, playerName, eventTitle })
        await queuePushMessage({
          toEmail: toEmail,
          title: '🎭 Confirme ta participation !',
          body: `${playerName}, tu as été sélectionné(e) pour ${eventTitle} (${eventDate}) 🎉`,
          data: { url: eventUrl || window.location.origin, noUrl }, // Ajout de noUrl aux données push
          reason: 'selection'
        })
        console.log('Notification push de sélection envoyée avec succès')
      } else {
        console.log('Notification push de sélection désactivée par préférences utilisateur')
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification push de sélection', error)
    }
    logger.info('Email ajouté à la queue Firestore', { playerName })
    return { success: true }
  } catch (error) {
    logger.error('Erreur lors de l\'ajout à Firestore', { playerName, error })
    throw error
  }
}

// Nouveau: email lorsqu'un joueur n'est plus sélectionné
export async function queueDeselectionEmail({
  toEmail,
  playerName,
  eventTitle,
  eventDate,
  eventUrl,
  newSelectedPlayers = [],
  html = undefined,
  subject = undefined,
  fromEmail = undefined
}) {
  // Respecter préférences notification (on réutilise notifySelection)
  try {
    const prefRef = doc(db, 'userPreferences', toEmail)
    const prefSnap = await getDoc(prefRef)
    if (prefSnap.exists()) {
      const prefs = prefSnap.data()
      if (prefs?.notifySelection === false) {
        return { success: true, skipped: true }
      }
    }
  } catch {}

  const playersList = Array.isArray(newSelectedPlayers) ? newSelectedPlayers.join(', ') : ''

  const emailHtml = html || `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
      <h2>🎭 Sélection mise à jour</h2>
      <p>Bonjour ${playerName},</p>
      <p>La sélection pour <strong>${eventTitle}</strong> (${eventDate}) a été mise à jour et tu n'en fais plus partie 😔.</p>
      ${playersList ? `<p>Nouvelle sélection: <strong>${playersList}</strong>.</p>` : ''}
      <p>
        <a href="${eventUrl}" style="display:inline-block;padding:10px 16px;background:#6b7280;color:#fff;border-radius:8px;text-decoration:none;">Voir les détails de l'événement</a>
      </p>
      <p style="font-size:12px;color:#6b7280;">Motif: mise à jour de sélection (relance auto ou ajustement manuel).</p>
    </div>
  `

  const emailSubject = subject || `🎭 Tu n'es plus dans la sélection · ${eventTitle}`

  const docData = {
    to: toEmail,
    message: {
      subject: emailSubject,
      html: emailHtml
    },
    createdAt: serverTimestamp(),
    meta: { reason: 'deselection', eventTitle, eventDate, playerName, newSelectedPlayers }
  }
  
  // Configurer l'expéditeur (HatCast par défaut)
  const fromConfig = getFromEmailConfig(fromEmail)
  docData.from = fromConfig.from
  docData.replyTo = fromConfig.replyTo

  await addDoc(collection(db, 'mail'), docData)

  // Mirror push notification si autorisé (on réutilise notifySelectionPush)
  try {
    const prefRef = doc(db, 'userPreferences', toEmail)
    const prefSnap = await getDoc(prefRef)
    const prefs = prefSnap.exists() ? prefSnap.data() : {}
    if (prefs?.notifySelectionPush !== false) {
      await queuePushMessage({
        toEmail,
        title: '🎭 Sélection mise à jour',
        body: `${playerName}, tu n'es plus sélectionné(e) pour ${eventTitle} (${eventDate}) 😔`,
        data: {
          url: eventUrl || window.location.origin,
          noUrl: eventUrl && eventUrl.includes('/event/') ? eventUrl.replace('/event/', '/magic?auto=no&event=') : undefined
        },
        reason: 'deselection'
      })
    }
  } catch {}
  return { success: true }
}

// Fonction pour envoyer des emails de notification de sélection pour un événement
export async function sendSelectionEmailsForEvent({ eventId, eventData, selectedPlayers, seasonId, seasonSlug, players }) {
  logger.info('sendSelectionEmailsForEvent', { eventId, seasonId, seasonSlug, playersCount: players?.length, selectedCount: selectedPlayers?.length })
  
  if (!eventData || !selectedPlayers || selectedPlayers.length === 0) {
    throw new Error('Données manquantes pour l\'envoi des emails de sélection')
  }

  const { getPlayerEmail } = await import('./playerProtection.js')
  const { createMagicLink } = await import('./magicLinks.js')
  const eventUrl = `${window.location.origin}/season/${seasonSlug}/event/${eventId}`
  
  // Créer la liste des joueurs sélectionnés
  const playersList = selectedPlayers.join(', ')
  
  const subject = `🎭 Confirme ta participation pour · ${eventData.title}`

  // Envoyer un email personnalisé à chaque joueur sélectionné
  const emailPromises = []
  
  for (const playerName of selectedPlayers) {
    logger.debug('Traitement du joueur', { playerName })
    try {
      // Trouver le joueur dans la liste des joueurs
      const player = players?.find(p => p.name === playerName)
      if (!player) {
        logger.warn('Joueur non trouvé', { playerName })
        continue
      }
      logger.debug('Joueur trouvé')
      
      // Récupérer l'email du joueur
      const email = await getPlayerEmail(player.id, seasonId)
      if (!email) {
        logger.warn('Pas d\'email pour le joueur', { playerName })
        continue
      }
      logger.debug('Email trouvé pour joueur')
      
      // Créer un magic link "decline" pour le déclin de la sélection
      const declineMagicLink = await createMagicLink({ 
        seasonId, 
        playerId: player.id, 
        eventId, 
        action: 'decline' 
      })
      const declineUrl = `${declineMagicLink.url}&slug=${encodeURIComponent(seasonSlug)}`
      
      // Utiliser le nouveau template avec warning important et bouton de confirmation
      let html
      try {
        const { buildSelectionEmailTemplate } = await import('./emailTemplates.js')
        
        // Créer un magic link "confirm" pour la confirmation
        const confirmMagicLink = await createMagicLink({ 
          seasonId, 
          playerId: player.id, 
          eventId, 
          action: 'confirm' 
        })
        const confirmUrl = `${confirmMagicLink.url}&slug=${encodeURIComponent(seasonSlug)}`
        
        html = buildSelectionEmailTemplate({
          playerName,
          eventTitle: eventData.title,
          eventDate: formatDateFull(eventData.date),
          eventUrl,
          declineUrl: declineUrl, // Magic link de déclin
          confirmUrl: confirmUrl, // Magic link de confirmation
          selectedPlayers: selectedPlayers // Liste des joueurs sélectionnés
        })
        logger.debug('HTML généré avec le nouveau template')
      } catch (templateError) {
        logger.error('Erreur lors de l\'import du template, utilisation du template de fallback', { error: templateError })
        // Template de fallback en cas d'erreur
        const playersList = selectedPlayers.join(', ')
        // Créer les magic links pour le fallback
        const { createMagicLink } = await import('./magicLinks.js')
        const confirmMagicLink = await createMagicLink({ 
          seasonId, 
          playerId: player.id, 
          eventId, 
          action: 'confirm' 
        })
        const confirmUrl = `${confirmMagicLink.url}&slug=${encodeURIComponent(seasonSlug)}`
        html = `
          <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
            <p>Bonjour <strong>${playerName}</strong>,</p>
            <p>Tu es en lice pour faire partie de l'équipe pour <strong>${eventData.title}</strong> (${formatDateFull(eventData.date)}).</p>
            <p>Voici la sélection temporaire : <strong>${playersList}</strong></p>
            <p>⚠️ IMPORTANT : Tu dois confirmer ta participation !</p>
            <p>L'équipe ne sera confirmée que lorsque tous les joueurs sélectionnés auront confirmé leur disponibilité.</p>
            <p>
              <a href="${confirmUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg, #10b981, #059669);color:white;border-radius:8px;text-decoration:none;font-weight:600;box-shadow:0 4px 12px rgba(16, 185, 129, 0.3);margin-right: 10px;">✅ Confirmer ma participation</a>
              <a href="${declineUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg, #dc2626, #b91c1c);color:white;border-radius:8px;text-decoration:none;font-weight:600;box-shadow:0 4px 12px rgba(220, 38, 38, 0.3);margin-right: 10px;">❌ Décliner</a>
              <a href="${eventUrl}" style="display:inline-block;padding:10px 16px;border:2px solid #8b5cf6;color:#8b5cf6;border-radius:8px;text-decoration:none;font-weight:500;">📋 Afficher les détails</a>
            </p>
          </div>
        `
        logger.debug('HTML généré avec le template de fallback')
      }
      logger.debug('HTML généré pour joueur')
      
      // Envoyer l'email de sélection personnalisé
      const emailPromise = queueSelectionEmail({
        toEmail: email,
        playerName,
        eventTitle: eventData.title,
        eventDate: formatDateFull(eventData.date),
        eventUrl,
        html, // Utiliser le HTML personnalisé
        subject, // Utiliser le sujet personnalisé
        noUrl: notAvailableUrl // Ajouter l'URL de désistement pour les notifications push
      })
      
      emailPromises.push(emailPromise)
      logger.info('Email ajouté à la queue', { playerName })
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de l\'email de sélection', { playerName, error })
    }
  }
  
  logger.info('Nombre total d\'emails à envoyer', { count: emailPromises.length })
  
  // Attendre que tous les emails soient envoyés
  await Promise.all(emailPromises)
  
  logger.info('Tous les emails ont été envoyés avec succès')
  return { success: true, count: emailPromises.length }
}

// Envoi des emails quand des joueurs sont retirés de la sélection
export async function sendDeselectionEmailsForEvent({ eventId, eventData, removedPlayers, newSelectedPlayers, seasonId, seasonSlug, players }) {
  logger.info('sendDeselectionEmailsForEvent', { eventId, seasonId, removedCount: removedPlayers?.length })

  if (!eventData || !removedPlayers || removedPlayers.length === 0) {
    return { success: true, count: 0 }
  }

  const { getPlayerEmail } = await import('./playerProtection.js')
  const eventUrl = `${window.location.origin}/season/${seasonSlug}/event/${eventId}`

  const emailPromises = []
  const playersList = Array.isArray(newSelectedPlayers) ? newSelectedPlayers.join(', ') : ''

  for (const playerName of removedPlayers) {
    try {
      const player = players?.find(p => p.name === playerName)
      if (!player) {
        logger.warn('Joueur retiré non trouvé', { playerName })
        continue
      }
      const email = await getPlayerEmail(player.id, seasonId)
      if (!email) {
        logger.warn('Pas d\'email pour le joueur retiré', { playerName })
        continue
      }

      const html = `
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
          <h2>🎭 Sélection mise à jour</h2>
          <p>Bonjour <strong>${playerName}</strong>,</p>
          <p>Tu n'es plus sélectionné(e) pour <strong>${eventData.title}</strong> (${formatDateFull(eventData.date)}) 😔.</p>
          ${playersList ? `<p>Nouvelle sélection: <strong>${playersList}</strong>.</p>` : ''}
          <p>
            <a href="${eventUrl}" style="display:inline-block;padding:10px 12px;border:2px solid #6b7280;color:#6b7280;border-radius:8px;text-decoration:none;">Voir les détails de l'événement</a>
          </p>
        </div>
      `

      emailPromises.push(queueDeselectionEmail({
        toEmail: email,
        playerName,
        eventTitle: eventData.title,
        eventDate: formatDateFull(eventData.date),
        eventUrl,
        newSelectedPlayers,
        html
      }))
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de l\'email de désélection', { playerName, error })
    }
  }

  await Promise.all(emailPromises)
  logger.info('Emails de désélection envoyés', { count: emailPromises.length })
  return { success: true, count: emailPromises.length }
}

// Fonction utilitaire pour formater la date
function formatDateFull(dateValue) {
  if (!dateValue) return ''
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue.toDate?.() || dateValue
  return date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * Envoie un email d'activation des notifications
 */
export async function queueNotificationActivationEmail({
  toEmail,
  playerName,
  eventTitle,
  eventUrl,
  activationUrl,
  seasonTitle,
  fromEmail = undefined
}) {
  const html = buildNotificationActivationTemplate({
    playerName,
    eventTitle,
    eventUrl,
    activationUrl,
    seasonTitle
  })

  const subject = `🔔 Active tes notifications pour ${seasonTitle}`

  const docData = {
    to: toEmail,
    message: {
      subject,
      html
    },
    createdAt: serverTimestamp(),
    meta: { reason: 'notification_activation', eventTitle, playerName }
  }
  
  // Configurer l'expéditeur
  const fromConfig = getFromEmailConfig(fromEmail)
  docData.from = fromConfig.from
  docData.replyTo = fromConfig.replyTo

  try {
    await addDoc(collection(db, 'mail'), docData)
    logger.info('Email d\'activation des notifications ajouté à la queue', { toEmail, playerName })
    return { success: true }
  } catch (error) {
    logger.error('Erreur lors de l\'ajout de l\'email d\'activation à la queue', error)
    throw error
  }
}
