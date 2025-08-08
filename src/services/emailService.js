// src/services/emailService.js
// Service d'envoi d'emails – version Trigger Email (Firebase Extension)
import { db } from './firebase.js'
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
