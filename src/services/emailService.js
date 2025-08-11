// src/services/emailService.js
// Service d'envoi d'emails – version Trigger Email (Firebase Extension)
import { db } from './firebase.js'
import logger from './logger.js'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

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
  reason = 'new_event',
  fromEmail = undefined // optionnel, sinon valeur par défaut de l'extension
}) {
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
      <h2>Disponibilité demandée</h2>
      <p>Bonjour ${playerName},</p>
      <p>Peux-tu indiquer ta disponibilité pour <strong>${eventTitle}</strong> (${eventDate}) ?</p>
      <p>
        <a href="${yesUrl}" style="display:inline-block;padding:10px 16px;margin-right:8px;background:#16a34a;color:#fff;border-radius:8px;text-decoration:none;">Je suis dispo ✅</a>
        <a href="${noUrl}" style="display:inline-block;padding:10px 16px;background:#dc2626;color:#fff;border-radius:8px;text-decoration:none;">Pas dispo ❌</a>
      </p>
      <p style="font-size:12px;color:#6b7280;">Motif: ${reason}</p>
    </div>
  `

  const subject = `Disponibilité demandée · ${eventTitle}`

  const docData = {
    to: toEmail,
    message: {
      subject,
      html
    },
    createdAt: serverTimestamp(),
    meta: { reason, eventTitle, eventDate, playerName }
  }
  if (fromEmail) {
    docData.from = fromEmail
    docData.replyTo = fromEmail
  }

  await addDoc(collection(db, 'mail'), docData)
  return { success: true }
}

// Envoi d'un email de vérification pour activer la protection
export async function queueProtectionVerificationEmail({ toEmail, playerName, verifyUrl, fromEmail = undefined }) {
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
      <h2>Vérification de votre email</h2>
      <p>Bonjour ${playerName},</p>
      <p>Pour sécuriser votre joueur, merci de confirmer que vous avez accès à cette adresse email.</p>
      <p>
        <a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#3b82f6;color:#fff;border-radius:8px;text-decoration:none;">Vérifier mon email</a>
      </p>
      <p style="font-size:12px;color:#6b7280;">Ce lien expirera dans 7 jours.</p>
    </div>
  `
  const subject = 'Confirmez votre email pour activer la protection'
  const docData = {
    to: toEmail,
    message: { subject, html },
    createdAt: serverTimestamp(),
    meta: { reason: 'protection_email_verification', playerName }
  }
  if (fromEmail) {
    docData.from = fromEmail
    docData.replyTo = fromEmail
  }
  await addDoc(collection(db, 'mail'), docData)
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
  fromEmail = undefined
}) {
  logger.debug('queueSelectionEmail', { forPlayer: playerName, hasCustomHtml: !!html, hasCustomSubject: !!subject })
  
  // Si HTML et sujet personnalisés sont fournis, les utiliser
  // Sinon, utiliser le template par défaut
  const emailHtml = html || `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
      <h2>🎭 Tu as été sélectionné(e) !</h2>
      <p>Bonjour ${playerName},</p>
      <p>Félicitations ! Tu as été sélectionné(e) pour <strong>${eventTitle}</strong> (${eventDate}).</p>
      <p>
        <a href="${eventUrl}" style="display:inline-block;padding:10px 16px;background:#8b5cf6;color:#fff;border-radius:8px;text-decoration:none;">Voir les détails de l'événement</a>
      </p>
      <p style="font-size:12px;color:#6b7280;">Tu recevras bientôt plus d'informations sur l'organisation.</p>
    </div>
  `

  const emailSubject = subject || `🎭 Sélection confirmée · ${eventTitle}`
  
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
  if (fromEmail) {
    docData.from = fromEmail
    docData.replyTo = fromEmail
  }

  logger.debug('queueSelectionEmail firestore payload ready')
  
  try {
    await addDoc(collection(db, 'mail'), docData)
    logger.info('Email ajouté à la queue Firestore', { playerName })
    return { success: true }
  } catch (error) {
    logger.error('Erreur lors de l\'ajout à Firestore', { playerName, error })
    throw error
  }
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
  
  const subject = `🎭 Sélection confirmée · ${eventData.title}`

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
      
      // Créer un magic link "no" pour le désistement
      const noMagicLink = await createMagicLink({ 
        seasonId, 
        playerId: player.id, 
        eventId, 
        action: 'no' 
      })
      const notAvailableUrl = `${noMagicLink.url}&slug=${encodeURIComponent(seasonSlug)}`
      
      // Créer le contenu HTML personnalisé pour ce joueur
      const html = `
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
          <h2>🎭 Sélection confirmée</h2>
          <p>Bonjour <strong>${playerName}</strong>,</p>
          <p>Tu as été sélectionné(e) pour <strong>${eventData.title}</strong> (${formatDateFull(eventData.date)}).</p>
          <p>Sélection complète : <strong>${playersList}</strong>.</p>
          <p>Tu n'es plus disponible ? Signale le rapidement ici :</p>
          <p>
            <a href="${notAvailableUrl}" style="display:inline-block;padding:10px 16px;background:#dc2626;color:#fff;border-radius:8px;text-decoration:none;">Signaler que je ne suis plus disponible</a>
          </p>
          <p>
            <a href="${eventUrl}" style="display:inline-block;padding:10px 16px;background:#8b5cf6;color:#fff;border-radius:8px;text-decoration:none;">Voir les détails de l'événement</a>
          </p>
        </div>
      `
      logger.debug('HTML généré pour joueur')
      
      // Envoyer l'email de sélection personnalisé
      const emailPromise = queueSelectionEmail({
        toEmail: email,
        playerName,
        eventTitle: eventData.title,
        eventDate: formatDateFull(eventData.date),
        eventUrl,
        html, // Utiliser le HTML personnalisé
        subject // Utiliser le sujet personnalisé
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

// Fonction utilitaire pour formater la date
function formatDateFull(dateValue) {
  if (!dateValue) return ''
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue.toDate?.() || dateValue
  return date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}
