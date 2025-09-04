// src/services/emailTemplates.js

/**
 * Templates centralisés pour tous les emails
 * Utilisés à la fois pour la prévisualisation et l'envoi réel
 */

/**
 * Template pour les demandes de disponibilité (événements)
 */
export function buildAvailabilityEmailTemplate({ playerName, eventTitle, eventDate, eventUrl, yesUrl, noUrl }) {
  const greeting = playerName ? `<strong>${playerName}</strong>` : '<strong>Hello</strong>'
  return `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
      <p>${greeting},</p>
      <p>🎯 <strong>Nouvel événement à l'horizon !</strong></p>
      <p>Es-tu dispo le ${eventDate} pour <a href="${eventUrl}" style="color:#3b82f6;text-decoration:underline;font-weight:600;">${eventTitle}</a> ?</p>
      <p>🎭 <em>On a besoin de toi pour que ça brille ! ✨</em></p>
      <p style="margin-top: 12px; text-align: center;">
        <a href="${yesUrl}" style="display:inline-block;padding:10px 12px;margin-right:8px;border:2px solid #16a34a;color:#16a34a;border-radius:8px;text-decoration:none;">✅ Dispo</a>
        <a href="${noUrl}" style="display:inline-block;padding:10px 12px;border:2px solid #dc2626;color:#dc2626;border-radius:8px;text-decoration:none;">❌ Pas dispo</a>
      </p>
      <p style="margin-top: 16px; color:#6b7280;">Détails : <a href="${eventUrl}" style="color:#3b82f6;text-decoration:underline;">${eventUrl}</a></p>
    </div>
  `
}

/**
 * Template pour les notifications de sélection
 */
export function buildSelectionEmailTemplate({ playerName, eventTitle, eventDate, eventUrl, declineUrl, confirmUrl, selectedPlayers }) {
  const greeting = playerName ? `<strong>${playerName}</strong>` : '<strong>Hello</strong>'
  const playersList = selectedPlayers ? selectedPlayers.join(', ') : ''
  return `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
      <p>${greeting}, tu es <strong>PRÉSÉLECTIONNÉ(E)</strong> pour faire partie de l'équipe pour <a href="${eventUrl}" style="color:#8b5cf6;text-decoration:underline;font-weight:600;">${eventTitle}</a> le ${eventDate}!</p>
      
      <p>Voici la <strong>présélection temporaire</strong> : <strong>${playersList}</strong></p>
      
      <div style="margin: 20px 0; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
        <strong>⚠️ IMPORTANT</strong><br>
        ⚠️ L'équipe sera confirmée uniquement quand TOUS auront validé leur participation.
      </div>
      
      <div style="margin: 20px 0; text-align: center;">
        <a href="${confirmUrl || eventUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg, #10b981, #059669);color:white;border-radius:8px;text-decoration:none;font-weight:600;box-shadow:0 4px 12px rgba(16, 185, 129, 0.3);margin-right: 10px;">✅ Confirmer ma participation</a>
        
        <a href="${declineUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg, #dc2626, #b91c1c);color:white;border-radius:8px;text-decoration:none;font-weight:600;box-shadow:0 4px 12px rgba(220, 38, 38, 0.3);margin-right: 10px;">❌ Décliner</a>
        
        <a href="${eventUrl}" style="display:inline-block;padding:10px 16px;border:2px solid #8b5cf6;color:#8b5cf6;border-radius:8px;text-decoration:none;font-weight:500;">📋 Afficher les détails</a>
      </div>
    </div>
  `
}

/**
 * Template pour les joueurs sans email configuré
 */
export function buildNoEmailTemplate({ playerName, eventTitle, eventDate, eventUrl }) {
  const greeting = playerName ? `<strong>Bonjour ${playerName}</strong>` : '<strong>Bonjour</strong>'
  return `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
      <p>${greeting}, tu n'as pas configuré d'email. Utilise la fonction « Copier le message » et envoie-lui ces informations par un autre canal.</p>
      <p style="margin-top: 8px; font-weight: 600;">${eventTitle}</p>
      <p style="color:#374151;">${eventDate}</p>
      <p style="margin-top: 8px;">Lien direct : ${eventUrl}</p>
    </div>
  `
}

/**
 * Version texte simple des templates (pour copier-coller)
 */
export function buildAvailabilityTextTemplate({ playerName, eventTitle, eventDate, eventUrl }) {
  const greeting = playerName ? `${playerName}` : 'Hello'
  return `${greeting},

🎯 Nouvel événement à l'horizon ! 

Es-tu dispo le ${eventDate} pour ${eventTitle} ?

🎭 On a besoin de toi pour que ça brille ! ✨

✅ Dispo ❌ Pas dispo

Lien direct : ${eventUrl}`
}

export function buildSelectionTextTemplate({ playerName, eventTitle, eventDate, eventUrl, confirmUrl }) {
  const greeting = playerName ? `Bonjour ${playerName}` : 'Hello'
  return `${greeting},

Tu es PRÉSÉLECTIONNÉ(E) pour ${eventTitle} le ${eventDate}!

⚠️ IMPORTANT
⚠️ L'équipe sera confirmée uniquement quand TOUS auront validé leur participation.

✅ Confirmer ma participation : ${confirmUrl || eventUrl}
📋 Détails : ${eventUrl}

Un imprévu ?😬 
Pas de souci, signales vite ton indisponibilité ici pour qu'on relance la sélection de l'événement : ${eventUrl}`
}

/**
 * Template pour l'annonce globale de sélection (à copier-coller pour WhatsApp)
 */
export function buildGlobalSelectionAnnouncementTemplate({ eventTitle, eventDate, eventUrl, selectedPlayers }) {
  const playersList = selectedPlayers.length > 0 ? selectedPlayers.join(', ') : 'les personnes sélectionnées'
  
  return `🎭 PRÉSÉLECTION À CONFIRMER pour ${eventTitle} 🎭

📅 ${eventDate}

Équipe proposée : ${playersList}

⚠️ L'équipe sera confirmée uniquement quand TOUS auront validé leur participation.

🔗 Pour confirmer ou suivre les confirmations : ${eventUrl}`
}

/**
 * Template pour l'activation des notifications
 */
export function buildNotificationActivationTemplate({ playerName, eventTitle, eventUrl, activationUrl, seasonTitle }) {
  const greeting = playerName ? `<strong>${playerName}</strong>` : '<strong>Hello</strong>'
  return `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
      <p>${greeting},</p>
      <p>🔔 <strong>Active tes notifications pour ne rien rater !</strong></p>
      <p>Tu veux être informé(e) en temps réel de <strong>tous tes événements</strong> de la saison <strong>${seasonTitle}</strong> ?</p>
      <p>🎯 <em>Clique sur le bouton ci-dessous pour activer tes notifications et recevoir des alertes pour tes événements !</em></p>
      <p style="margin-top: 16px; text-align: center;">
        <a href="${activationUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg, #8b5cf6, #ec4899);color:white;border-radius:8px;text-decoration:none;font-weight:600;box-shadow:0 4px 12px rgba(139, 92, 246, 0.3);">🔔 Activer mes notifications</a>
      </p>
      <p style="margin-top: 16px; color:#6b7280; font-size: 14px;">
        <em>En activant tes notifications, tu recevras des alertes pour :</em><br>
        • Les demandes de disponibilité<br>
        • Les sélections de joueurs<br>
        • Les changements d'horaires<br>
        • Les annonces importantes
      </p>
      <p style="margin-top: 16px; color:#6b7280;">Détails de l'événement : <a href="${eventUrl}" style="color:#3b82f6;text-decoration:underline;">${eventUrl}</a></p>
    </div>
  `
}

/**
 * Version texte simple du template d'activation des notifications
 */
export function buildNotificationActivationTextTemplate({ playerName, eventTitle, eventUrl, activationUrl, seasonTitle }) {
  const greeting = playerName ? `${playerName}` : 'Hello'
  return `${greeting},

🔔 Active tes notifications pour ne rien rater !

Tu veux être informé(e) en temps réel de tous tes événements de la saison ${seasonTitle} ?

🎯 Clique sur le lien ci-dessous pour activer tes notifications et recevoir des alertes pour tes événements !

🔔 Activer mes notifications : ${activationUrl}

En activant tes notifications, tu recevras des alertes pour :
• Les demandes de disponibilité
• Les sélections de joueurs  
• Les changements d'horaires
• Les annonces importantes

Détails de l'événement : ${eventUrl}`
}

/**
 * Template pour les emails de rappel automatique
 */
export function buildReminderEmailTemplate({
  playerName,
  eventTitle,
  eventDate,
  eventUrl,
  noUrl,
  reminderType
}) {
  const is7Days = reminderType === 'reminder_7days'
  const daysText = is7Days ? '7 jours' : '1 jour'
  const emoji = is7Days ? '📅' : '⏰'
  const urgencyText = is7Days ? 'Prépares-toi bien !' : 'C\'est pour demain !'
  
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rappel événement - ${eventTitle}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .button.secondary { background: #6c757d; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${emoji} Rappel événement</h1>
          <p>${eventTitle}</p>
        </div>
        
        <div class="content">
          <h2>Salut ${playerName} ! 👋</h2>
          
          <div class="highlight">
            <strong>${urgencyText}</strong><br>
            Ton événement <strong>${eventTitle}</strong> a lieu dans <strong>${daysText}</strong> !
          </div>
          
          <p>Date : <strong>${eventDate}</strong></p>
          
          <p>Es-tu toujours disponible pour cet événement ?</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${eventUrl}" class="button">📋 Voir les détails</a>
            <a href="${noUrl}" class="button secondary">❌ Se désister</a>
          </div>
          
          <p><em>Si tu n'es plus disponible, n'oublie pas de te désister pour laisser ta place à quelqu'un d'autre !</em></p>
        </div>
        
        <div class="footer">
          <p>Ce message est envoyé automatiquement par HatCast</p>
          <p>Tu peux gérer tes préférences de notification dans l'application</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Template pour l'annonce de l'équipe confirmée (quand tous les joueurs ont confirmé)
 */
export function buildConfirmedTeamEmailTemplate({ playerName, eventTitle, eventDate, eventUrl, confirmedPlayers }) {
  const greeting = playerName ? `<strong>${playerName}</strong>` : '<strong>Hello</strong>'
  const playersList = confirmedPlayers ? confirmedPlayers.join(', ') : ''
  return `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
      <p>${greeting},</p>
      <p>🎉 <strong>Félicitations ! L'équipe est confirmée !</strong></p>
      <p>L'équipe pour <a href="${eventUrl}" style="color:#10b981;text-decoration:underline;font-weight:600;">${eventTitle}</a> le ${eventDate} est maintenant <strong>définitive</strong> !</p>
      
      <div style="margin: 20px 0; padding: 15px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 8px; color: white;">
        <h3 style="margin: 0 0 10px 0; color: white;">✅ ÉQUIPE CONFIRMÉE</h3>
        <p style="margin: 0; color: white;"><strong>${playersList}</strong></p>
      </div>
      
      <p>🎭 <em>Préparez-vous à briller sur scène ! ✨</em></p>
      
      <div style="margin: 20px 0; text-align: center;">
        <a href="${eventUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg, #10b981, #059669);color:white;border-radius:8px;text-decoration:none;font-weight:600;box-shadow:0 4px 12px rgba(16, 185, 129, 0.3);">📋 Voir les détails de l'événement</a>
      </div>
    </div>
  `
}

/**
 * Version texte simple pour l'équipe confirmée (à copier-coller)
 */
export function buildConfirmedTeamTextTemplate({ playerName, eventTitle, eventDate, eventUrl, confirmedPlayers }) {
  const greeting = playerName ? `Bonjour ${playerName}` : 'Hello'
  const playersList = confirmedPlayers ? confirmedPlayers.join(', ') : ''
  return `${greeting},

🎉 FÉLICITATIONS ! L'ÉQUIPE EST CONFIRMÉE !

L'équipe pour ${eventTitle} le ${eventDate} est maintenant DÉFINITIVE !

✅ ÉQUIPE CONFIRMÉE : ${playersList}

🎭 Préparez-vous à briller sur scène ! ✨

📋 Détails de l'événement : ${eventUrl}`
}

/**
 * Template pour l'annonce globale de l'équipe confirmée (à copier-coller pour WhatsApp)
 */
export function buildGlobalConfirmedTeamAnnouncementTemplate({ eventTitle, eventDate, eventUrl, confirmedPlayers }) {
  const playersList = confirmedPlayers.length > 0 ? confirmedPlayers.join(', ') : 'l\'équipe'
  
  return `🎉 ÉQUIPE CONFIRMÉE ! 🎉

${eventTitle}
📅 ${eventDate}

✅ ÉQUIPE DÉFINITIVE : ${playersList}

🎭 Préparez-vous à briller sur scène ! ✨

🔗 Détails de l'événement : ${eventUrl}`
}

/**
 * Template pour les notifications push de l'équipe confirmée
 */
export function buildConfirmedTeamPushTemplate({ playerName, eventTitle, eventDate, confirmedPlayers }) {
  const playersList = confirmedPlayers ? confirmedPlayers.join(', ') : 'l\'équipe'
  return {
    title: '🎉 Équipe confirmée !',
    body: playersList,
    data: {
      confirmedPlayers,
      eventTitle,
      eventDate
    }
  }
}
