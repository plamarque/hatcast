// src/services/emailService.js
// Service d'envoi d'emails – version Trigger Email (Firebase Extension)
import firestoreService from './firestoreService.js'
import configService from './configService.js'
import logger from './logger.js'
import { queuePushMessage } from './pushService'
import { buildAvailabilityEmailTemplate, buildNotificationActivationTemplate } from './emailTemplates.js'
import { serverTimestamp } from 'firebase/firestore'
import AuditClient from './auditClient.js'

// Fonction utilitaire pour configurer l'expéditeur selon l'environnement
function getFromEmailConfig(customFromEmail = null) {
  const emailConfig = configService.getEmailConfig()
  
  // Utiliser la configuration centralisée depuis configService
  if (emailConfig.from && emailConfig.replyTo) {
    return {
      from: customFromEmail || emailConfig.from.displayName,
      replyTo: customFromEmail || emailConfig.replyTo
    }
  }
  
  // Fallback pour compatibilité (ne devrait plus arriver)
  logger.warn('⚠️ Configuration email incomplète, utilisation des valeurs de fallback depuis configService')
  const fallbackConfig = configService.getEmailFallbackConfig()
  return {
    from: customFromEmail || fallbackConfig.from,
    replyTo: customFromEmail || fallbackConfig.replyTo
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
  return `${window.location.origin}/reset-password?player=${encodeURIComponent(playerId)}&token=${encodeURIComponent(token)}`
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
    const prefs = await firestoreService.getDocument('userPreferences', toEmail)
    if (prefs?.notifyAvailability === false) {
      return { success: true, skipped: true }
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

  const emailConfig = configService.getEmailConfig()
  
  // En développement/staging avec capture, simuler l'envoi
  if (emailConfig.service === 'ethereal' && emailConfig.capture) {
    logger.info('📧 Email capturé en mode développement:', {
      to: toEmail,
      subject: docData.message.subject,
      reason: docData.meta.reason
    })
    return { success: true, captured: true }
  }
  
  // En production ou sans capture, envoyer via Firebase Trigger Email
  await firestoreService.addDocument('mail', docData)

  // Mirror push (expérimental) si activé dans préférences
  try {
    const prefs = await firestoreService.getDocument('userPreferences', toEmail) || {}
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
  const greeting = displayName && displayName !== 'utilisateur' ? `Salut ${displayName} !` : 'Salut !'
  const body = isAccount
    ? "Pour sécuriser ton compte, on a besoin de vérifier que tu as bien accès à cette adresse email."
    : "Pour protéger tes saisies de disponibilités, on a besoin de vérifier que tu as bien accès à cette adresse email."
  const cta = isAccount ? 'Confirmer mon email' : 'Vérifier mon email'
  const subject = isAccount ? 'Confirme ton email' : '🔒 Vérifie ton email pour protéger tes saisies'
  
  // Récupérer la durée d'expiration depuis la configuration
  const expirationDays = configService.getMagicLinkExpirationDays()
  const expirationText = expirationDays === 1 ? '1 jour' : `${expirationDays} jours`
  
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
      <p>${greeting}</p>
      <p>${body}</p>
      <p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg, #3b82f6, #1d4ed8);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;box-shadow:0 4px 12px rgba(59, 130, 246, 0.3);">${cta}</a>
      </p>
      <p style="font-size:12px;color:#6b7280;">Ce lien expirera dans ${expirationText}.</p>
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
  
  const emailConfig = configService.getEmailConfig()
  logger.info('🔧 Configuration email détectée:', { 
    service: emailConfig.service, 
    capture: emailConfig.capture,
    environment: configService.getEnvironment()
  })
  
  // En mode Ethereal avec capture, on écrit quand même dans Firestore
  // pour que l'extension soit déclenchée, mais on log que c'est capturé
  if (emailConfig.service === 'ethereal' && emailConfig.capture) {
    logger.info('📧 Email capturé en mode développement (écriture dans Firestore)', {
      to: toEmail,
      subject: docData.message.subject,
      reason: docData.meta.reason
    })
  }
  
  // Toujours écrire dans Firestore pour déclencher l'extension
  logger.info('🚀 Ajout du document email dans Firestore', { 
    collection: 'mail', 
    to: toEmail, 
    subject: docData.message.subject,
    database: 'development'
  })
  
  const documentRef = await firestoreService.addDocument('mail', docData)
  const documentId = documentRef.id || 'unknown'
  
  logger.info('✅ Document email ajouté avec succès dans Firestore', {
    documentId: documentId,
    recipient: AuditClient.obfuscateEmail(toEmail),
    purpose: purpose
  })
  
  if (emailConfig.service === 'ethereal' && emailConfig.capture) {
    return { success: true, captured: true }
  }
  
  return { success: true }
}

// Ancien alias conservé pour compat: protection joueur
export async function queueProtectionVerificationEmail({ toEmail, playerName, verifyUrl, fromEmail = undefined }) {
  return queueVerificationEmail({ toEmail, verifyUrl, purpose: 'player_protection', displayName: playerName, fromEmail })
}

// Envoi d'un email de réinitialisation de mot de passe via la queue Firestore (pour Ethereal en dev)
export async function queuePasswordResetEmail({ toEmail, resetUrl, displayName = 'utilisateur', fromEmail = undefined }) {
  const greeting = displayName && displayName !== 'utilisateur' ? `Salut ${displayName} !` : 'Salut !'
  const subject = '🔑 Réinitialise ton mot de passe'
  
  // Récupérer la durée d'expiration depuis la configuration
  const expirationDays = configService.getMagicLinkExpirationDays()
  const expirationText = expirationDays === 1 ? '1 jour' : `${expirationDays} jours`
  
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
      <p>${greeting}</p>
      <p>Tu as demandé à réinitialiser ton mot de passe. Clique sur le bouton ci-dessous pour créer un nouveau mot de passe.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg, #dc2626, #b91c1c);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;box-shadow:0 4px 12px rgba(220, 38, 38, 0.3);">Réinitialiser mon mot de passe</a>
      </p>
      <p style="font-size:12px;color:#6b7280;">Ce lien expirera dans ${expirationText}.</p>
      <p style="font-size:12px;color:#6b7280;">Si tu n'as pas demandé cette réinitialisation, tu peux ignorer cet email.</p>
    </div>
  `
  const docData = {
    to: toEmail,
    message: { subject, html },
    createdAt: serverTimestamp(),
    meta: { reason: 'password_reset', displayName }
  }
  
  // Configurer l'expéditeur (HatCast par défaut)
  const fromConfig = getFromEmailConfig(fromEmail)
  docData.from = fromConfig.from
  docData.replyTo = fromConfig.replyTo
  
  try {
    logger.info('🔍 DEBUG: Tentative d\'ajout du document', {
      collection: 'mail',
      hasFirestoreService: !!firestoreService,
      to: toEmail,
      subject: docData.message.subject,
      database: 'development'
    })
    
    // Ajouter à la collection mail pour traitement par les Firebase Functions
    const documentRef = await firestoreService.addDocument('mail', docData)
    const documentId = documentRef.id || 'unknown'
    
    // Logger l'ID du document pour debug
    logger.info('📧 Email de reset ajouté à la queue Firestore', {
      documentId: documentId,
      recipient: AuditClient.obfuscateEmail(toEmail),
      reason: 'password_reset'
    })
    
    // Logger à des fins d'audit (anonymisé)
    try {
      await AuditClient.logUserAction({
        type: 'password_reset_email_queued',
        category: 'email',
        severity: 'info',
        data: {
          recipient: AuditClient.obfuscateEmail(toEmail),
          reason: 'password_reset',
          documentId: documentId,
          timestamp: new Date().toISOString()
        },
        success: true,
        tags: ['email', 'password_reset']
      })
    } catch (auditError) {
      logger.warn('Impossible de logger l\'audit:', auditError.message)
    }
  } catch (error) {
    logger.error('❌ Erreur lors de l\'ajout de l\'email de reset à la queue:', error)
    throw error
  }
  return { success: true }
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
  noUrl = undefined, // Ajout de noUrl (compat)
  confirmUrl = undefined,
  declineUrl = undefined
}) {
  // Respecter préférences notification
  try {
    const prefs = await firestoreService.getDocument('userPreferences', toEmail)
    if (prefs?.notifySelection === false) {
      return { success: true, skipped: true }
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
    const emailConfig = configService.getEmailConfig()
    
    // En développement/staging avec capture, simuler l'envoi
    if (emailConfig.service === 'ethereal' && emailConfig.capture) {
      logger.info('📧 Email de sélection capturé en mode développement:', {
        to: toEmail,
        subject: docData.message.subject,
        reason: docData.meta.reason
      })
      return { success: true, captured: true }
    }
    
    // En production ou sans capture, envoyer via Firebase Trigger Email
    await firestoreService.addDocument('mail', docData)
    
    // Enqueue push mirror si préférences l'autorisent
    try {
      const prefs = await firestoreService.getDocument('userPreferences', toEmail) || {}
      console.log('Préférences utilisateur pour notifications push', { 
        toEmail, 
        prefs, 
        notifySelectionPush: prefs?.notifySelectionPush,
        shouldSendPush: prefs?.notifySelectionPush !== false 
      })
      if (prefs?.notifySelectionPush !== false) {
        console.log('Envoi notification push de sélection', { toEmail, playerName, eventTitle })
        {
          const pushData = { url: eventUrl || window.location.origin }
          if (typeof confirmUrl !== 'undefined') pushData.confirmUrl = confirmUrl
          if (typeof declineUrl !== 'undefined') pushData.declineUrl = declineUrl
          if (typeof noUrl !== 'undefined') pushData.noUrl = noUrl
          
          // Déterminer le titre et le message selon le type de notification
          const isConfirmedTeam = subject.includes('Équipe confirmée')
          const pushTitle = isConfirmedTeam ? '🎉 Équipe confirmée !' : '🎭 Confirme ta participation !'
          const pushBody = isConfirmedTeam 
            ? selectedPlayers.join(', ')
            : `${playerName}, tu es en lice pour faire partie de l'équipe pour ${eventTitle} (${eventDate}) 🎉`
          
          await queuePushMessage({
            toEmail: toEmail,
            title: pushTitle,
            body: pushBody,
            data: pushData,
            reason: 'selection'
          })
        }
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
    const prefs = await firestoreService.getDocument('userPreferences', toEmail)
    if (prefs?.notifySelection === false) {
      return { success: true, skipped: true }
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

  const emailConfig = configService.getEmailConfig()
  
  // En développement/staging avec capture, simuler l'envoi
  if (emailConfig.service === 'ethereal' && emailConfig.capture) {
    logger.info('📧 Email de désélection capturé en mode développement:', {
      to: toEmail,
      subject: docData.message.subject,
      reason: docData.meta.reason
    })
    return { success: true, captured: true }
  }
  
  // En production ou sans capture, envoyer via Firebase Trigger Email
  await firestoreService.addDocument('mail', docData)

  // Mirror push notification si autorisé (on réutilise notifySelectionPush)
  try {
    const prefs = await firestoreService.getDocument('userPreferences', toEmail) || {}
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
export async function sendSelectionEmailsForEvent({ eventId, eventData, selectedPlayers, seasonId, seasonSlug, players, isConfirmedTeam = false }) {
  logger.info('sendSelectionEmailsForEvent', { eventId, seasonId, seasonSlug, playersCount: players?.length, selectedCount: selectedPlayers?.length })
  
  if (!eventData || !selectedPlayers || selectedPlayers.length === 0) {
    throw new Error('Données manquantes pour l\'envoi des emails de sélection')
  }

  const { getPlayerEmail } = await import('./playerProtection.js')
  const { createMagicLink } = await import('./magicLinks.js')
  const eventUrl = `${window.location.origin}/season/${seasonSlug}/event/${eventId}`
  
  // Créer la liste des joueurs sélectionnés
  const playersList = selectedPlayers.join(', ')
  
  const subject = isConfirmedTeam 
    ? `🎉 Équipe confirmée pour · ${eventData.title}`
    : `🎭 Confirme ta participation pour · ${eventData.title}`

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
      // Créer un magic link "confirm" pour la confirmation (en dehors du try-catch pour être sûr qu'il soit défini)
      const confirmMagicLink = await createMagicLink({ 
        seasonId, 
        playerId: player.id, 
        eventId, 
        action: 'confirm' 
      })
      const confirmUrl = `${confirmMagicLink.url}&slug=${encodeURIComponent(seasonSlug)}`
      
      try {
        const { buildSelectionEmailTemplate, buildConfirmedTeamEmailTemplate } = await import('./emailTemplates.js')
        
        logger.debug('Magic links générés pour sélection', { 
          playerName, 
          confirmUrl: confirmUrl.substring(0, 100) + '...', 
          declineUrl: declineUrl.substring(0, 100) + '...' 
        })
        
        // Utiliser le template approprié selon le type de notification
        if (isConfirmedTeam) {
          html = buildConfirmedTeamEmailTemplate({
            playerName,
            eventTitle: eventData.title,
            eventDate: formatDateFull(eventData.date),
            eventUrl,
            confirmedPlayers: selectedPlayers // Liste des joueurs confirmés
          })
        } else {
          html = buildSelectionEmailTemplate({
            playerName,
            eventTitle: eventData.title,
            eventDate: formatDateFull(eventData.date),
            eventUrl,
            declineUrl: declineUrl, // Magic link de déclin
            confirmUrl: confirmUrl, // Magic link de confirmation
            selectedPlayers: selectedPlayers // Liste des joueurs sélectionnés
          })
        }
        logger.debug('HTML généré avec le template approprié')
      } catch (templateError) {
        logger.error('Erreur lors de l\'import du template, utilisation du template de fallback', { error: templateError })
        // Template de fallback en cas d'erreur
        const playersList = selectedPlayers.join(', ')
        if (isConfirmedTeam) {
          html = `
            <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
              <p>Bonjour <strong>${playerName}</strong>,</p>
              <p>🎉 <strong>Félicitations ! L'équipe est confirmée !</strong></p>
              <p>L'équipe pour <strong>${eventData.title}</strong> (${formatDateFull(eventData.date)}) est maintenant <strong>définitive</strong> !</p>
              <div style="margin: 20px 0; padding: 15px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 8px; color: white;">
                <h3 style="margin: 0 0 10px 0; color: white;">✅ ÉQUIPE CONFIRMÉE</h3>
                <p style="margin: 0; color: white;"><strong>${playersList}</strong></p>
              </div>
              <p>🎭 <em>Préparez-vous à briller sur scène ! ✨</em></p>
              <p style="text-align: center;">
                <a href="${eventUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg, #10b981, #059669);color:white;border-radius:8px;text-decoration:none;font-weight:600;box-shadow:0 4px 12px rgba(16, 185, 129, 0.3);">📋 Voir les détails de l'événement</a>
              </p>
            </div>
          `
        } else {
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
        }
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
        noUrl: declineUrl, // Utiliser l'URL de déclin pour compat push
        confirmUrl,
        declineUrl
      })
      
      emailPromises.push(emailPromise)
      logger.info('Email ajouté à la queue', { playerName })
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de l\'email de sélection', { playerName, error: error.message, stack: error.stack })
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

  const emailConfig = configService.getEmailConfig()
  
  // En développement/staging avec capture, simuler l'envoi
  if (emailConfig.service === 'ethereal' && emailConfig.capture) {
    logger.info('📧 Email d\'activation des notifications capturé en mode développement:', {
      to: toEmail,
      subject: docData.message.subject,
      reason: docData.meta.reason
    })
    return { success: true, captured: true }
  }
  
  // En production ou sans capture, envoyer via Firebase Trigger Email
  await firestoreService.addDocument('mail', docData)
  logger.info('Email d\'activation des notifications ajouté à la queue', { toEmail, playerName })
  return { success: true }
}
