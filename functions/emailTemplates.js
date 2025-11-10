/**
 * Email templates for Cloud Functions
 * Shared templates for server-side email generation
 */

/**
 * Template for availability requests (initial notifications)
 */
function buildAvailabilityEmailTemplate({ playerName, eventTitle, eventDate, eventUrl, yesUrl, noUrl }) {
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
 * Template for availability reminder notifications (weekly reminders)
 * Distinct from initial availability requests
 */
function buildAvailabilityReminderEmailTemplate({ playerName, eventTitle, eventDate, eventUrl, yesUrl, noUrl }) {
  const greeting = playerName ? `<strong>${playerName}</strong>` : '<strong>Hello</strong>'
  return `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
      <p>${greeting},</p>
      <p>⏰ <strong>Rappel : demande de disponibilité</strong></p>
      <p>Tu n'as pas encore répondu à la demande de disponibilité pour <a href="${eventUrl}" style="color:#3b82f6;text-decoration:underline;font-weight:600;">${eventTitle}</a> le ${eventDate}.</p>
      <p>🎭 <em>N'oublie pas de nous dire si tu es disponible ! ✨</em></p>
      <p style="margin-top: 12px; text-align: center;">
        <a href="${yesUrl}" style="display:inline-block;padding:10px 12px;margin-right:8px;border:2px solid #16a34a;color:#16a34a;border-radius:8px;text-decoration:none;">✅ Dispo</a>
        <a href="${noUrl}" style="display:inline-block;padding:10px 12px;border:2px solid #dc2626;color:#dc2626;border-radius:8px;text-decoration:none;">❌ Pas dispo</a>
      </p>
      <p style="margin-top: 16px; color:#6b7280;">Détails : <a href="${eventUrl}" style="color:#3b82f6;text-decoration:underline;">${eventUrl}</a></p>
    </div>
  `
}

/**
 * Template for event reminders (7 days / 1 day before event)
 */
function buildReminderEmailTemplate({
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

module.exports = {
  buildAvailabilityEmailTemplate,
  buildAvailabilityReminderEmailTemplate,
  buildReminderEmailTemplate
}
