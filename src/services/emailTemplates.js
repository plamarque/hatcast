// src/services/emailTemplates.js

/**
 * Templates centralisés pour tous les emails
 * Utilisés à la fois pour la prévisualisation et l'envoi réel
 */

/**
 * Template pour les demandes de disponibilité (événements)
 */
export function buildAvailabilityEmailTemplate({ playerName, eventTitle, eventDate, eventUrl, yesUrl, noUrl }) {
  const greeting = playerName ? `<strong>Bonjour ${playerName}</strong>` : '<strong>Bonjour</strong>'
  return `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
      <p>${greeting}, un nouvel événement est programmé :</p>
      <p style="margin: 12px 0 2px 0;">
        <a href="${eventUrl}" style="color:#3b82f6;text-decoration:underline;font-weight:600;">${eventTitle}</a>
      </p>
      <p style="margin: 0 0 16px 0; color:#374151;">${eventDate}</p>
      <p>Nous avons besoin de savoir si tu es disponible.</p>
      <p style="margin-top: 12px;">
        <a href="${yesUrl}" style="display:inline-block;padding:10px 12px;margin-right:8px;border:2px solid #16a34a;color:#16a34a;border-radius:8px;text-decoration:none;">✅ Dispo</a>
        <a href="${noUrl}" style="display:inline-block;padding:10px 12px;border:2px solid #dc2626;color:#dc2626;border-radius:8px;text-decoration:none;">❌ Pas dispo</a>
      </p>
      <p style="margin-top: 16px;">Merci!!</p>
    </div>
  `
}

/**
 * Template pour les notifications de sélection
 */
export function buildSelectionEmailTemplate({ playerName, eventTitle, eventDate, eventUrl, noUrl }) {
  const greeting = playerName ? `<strong>${playerName}</strong>` : '<strong>tous</strong>'
  return `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
      <p>Bonjour ${greeting}, tu fais partie de l'équipe pour <a href="${eventUrl}" style="color:#8b5cf6;text-decoration:underline;font-weight:600;">${eventTitle}</a> (${eventDate}).</p>
      <p>Un imprévu ?</p>
      <p style="margin-top: 8px;">
        <a href="${noUrl}" style="display:inline-block;padding:10px 12px;border:2px solid #dc2626;color:#dc2626;border-radius:8px;text-decoration:none;">❌ Plus dispo</a>
      </p>
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
  const greeting = playerName ? `Bonjour ${playerName}` : 'Bonjour'
  return `${greeting}, un nouvel événement est programmé.

${eventTitle} le ${eventDate}   
Dispo ou pas ?

Merci de renseigner ta disponibilité ici : ${eventUrl}`
}

export function buildSelectionTextTemplate({ playerName, eventTitle, eventDate, eventUrl }) {
  const greeting = playerName ? `Bonjour ${playerName}` : 'Bonjour tous'
  return `${greeting},

Tu fais partie de l'équipe pour ${eventTitle} (${eventDate}).

Un imprévu ?

❌ Plus dispo

Lien direct: ${eventUrl}`
}
