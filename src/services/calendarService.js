/**
 * Service pour l'ajout d'événements aux agendas
 */

import { EVENT_TYPE_ICONS, ROLE_TEMPLATES } from './storage.js'

/**
 * Extrait les joueurs confirmés d'un objet de sélection
 * @param {Object} castData - Données de la sélection
 * @param {Array} playersList - Liste des joueurs avec leurs IDs et noms
 * @returns {Array} - Liste des noms des joueurs confirmés
 */
function extractConfirmedPlayers(castData, playersList = []) {
  console.log('🔍 extractConfirmedPlayers - castData:', castData)
  console.log('👥 playersList:', playersList)
  
  if (!castData) {
    console.log('❌ Aucune donnée de sélection')
    return []
  }
  
  console.log('✅ confirmedByAllPlayers:', castData.confirmedByAllPlayers)
  console.log('✅ confirmed:', castData.confirmed)
  
  // Vérifier si la sélection est confirmée (nouvelle ou ancienne structure)
  const isConfirmed = castData.confirmedByAllPlayers || castData.confirmed
  if (!isConfirmed) {
    console.log('❌ Sélection non confirmée')
    return []
  }
  
  // Extraire les IDs des joueurs confirmés selon la structure
  let playerIds = []
  if (castData.players && Array.isArray(castData.players)) {
    // Ancienne structure : array de noms ou IDs
    console.log('👥 Joueurs (ancienne structure):', castData.players)
    playerIds = castData.players
  } else if (castData.roles) {
    // Nouvelle structure multi-rôles : extraire tous les joueurs
    console.log('🎭 Structure multi-rôles détectée:', castData.roles)
    for (const [roleName, roleData] of Object.entries(castData.roles)) {
      console.log(`🎪 Rôle ${roleName}:`, roleData)
      console.log(`🎪 Array.isArray(roleData):`, Array.isArray(roleData))
      if (Array.isArray(roleData)) {
        console.log(`✅ Ajout des joueurs du rôle ${roleName}:`, roleData)
        playerIds.push(...roleData)
      } else {
        console.log(`❌ Pas de joueurs valides pour le rôle ${roleName}`)
      }
    }
  }
  console.log('🆔 IDs de joueurs extraits:', playerIds)
  
  // Convertir les IDs en noms avec leurs rôles
  const confirmedPlayers = []
  for (const [roleName, roleData] of Object.entries(castData.roles)) {
    if (Array.isArray(roleData)) {
      for (const playerId of roleData) {
        const player = playersList.find(p => p.id === playerId)
        if (player) {
          // Ajouter le rôle entre parenthèses pour les rôles non-joueurs
          const roleSuffix = roleName !== 'player' ? ` (${roleName.toUpperCase()})` : ''
          confirmedPlayers.push(player.name + roleSuffix)
        } else {
          console.warn('⚠️ Joueur non trouvé pour l\'ID:', playerId)
        }
      }
    }
  }
  
  console.log('👥 Noms des joueurs confirmés:', confirmedPlayers)
  return confirmedPlayers
}

/**
 * Génère un fichier iCalendar (.ics) pour un événement
 */
export async function generateICSFile(event, seasonName = '', castData = null, playersList = [], seasonSlug = '') {
  const eventDate = new Date(event.date)
  const startDate = new Date(eventDate)
  startDate.setHours(19, 0, 0, 0) // 19h00 par défaut
  const endDate = new Date(startDate)
  endDate.setHours(23, 0, 0, 0) // 23h00 par défaut

  // Récupérer l'équipe confirmée si disponible
  const confirmedPlayers = extractConfirmedPlayers(castData, playersList)

  // Construire la description avec l'équipe confirmée si disponible
  let description = event.description || ''
  if (confirmedPlayers.length > 0) {
    description += `\\n\\n✅ ÉQUIPE CONFIRMÉE : ${confirmedPlayers.join(', ')}`
  }
  // Récupérer l'emoji et le libellé du type d'événement
  const eventType = event.templateType
  const eventTypeIcon = EVENT_TYPE_ICONS[eventType] || '❓'
  const eventTypeName = ROLE_TEMPLATES[eventType]?.name || 'Autre'
  const eventUrl = `https://selections.la-malice.fr/season/${seasonSlug}?event=${event.id}&modal=event_details`
  description += `\\n\\nType : ${eventTypeIcon} ${eventTypeName}\\n🔗 Détails : ${eventUrl}`

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HatCast//Calendar Event//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@impropick.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${description}`,
    ...(event.location ? [`LOCATION:${event.location}`] : []),
    'CATEGORIES:ENTERTAINMENT,PERFORMANCE,SHOW,THEATRE',
    'CLASS:PUBLIC',
    'TRANSP:OPAQUE',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'X-MICROSOFT-CDO-BUSYSTATUS:BUSY',
    'X-MICROSOFT-CDO-IMPORTANCE:1',
    'X-MICROSOFT-CDO-INTENDEDSTATUS:BUSY',
    `X-ALT-DESC;FMTTYPE=text/html:${description.replace(/\\n/g, '<br>')}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Rappel : ${event.title}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  return icsContent
}

/**
 * Télécharge un fichier iCalendar
 */
export async function downloadICSFile(event, seasonName = '', castData = null, playersList = [], seasonSlug = '') {
  const icsContent = await generateICSFile(event, seasonName, castData, playersList, seasonSlug)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_${event.date}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Génère un lien vers Google Calendar
 */
export async function generateGoogleCalendarLink(event, seasonName = '', castData = null, playersList = [], seasonSlug = '') {
  const eventDate = new Date(event.date)
  const startDate = new Date(eventDate)
  startDate.setHours(19, 0, 0, 0)
  const endDate = new Date(startDate)
  endDate.setHours(23, 0, 0, 0)

  // Récupérer l'équipe confirmée si disponible
  const confirmedPlayers = extractConfirmedPlayers(castData, playersList)

  // Construire la description avec l'équipe confirmée si disponible
  let description = event.description || ''
  if (confirmedPlayers.length > 0) {
    description += `\n\n✅ ÉQUIPE CONFIRMÉE : ${confirmedPlayers.join(', ')}`
  }
  // Récupérer l'emoji et le libellé du type d'événement
  const eventType = event.templateType
  const eventTypeIcon = EVENT_TYPE_ICONS[eventType] || '❓'
  const eventTypeName = ROLE_TEMPLATES[eventType]?.name || 'Autre'
  const eventUrl = `https://selections.la-malice.fr/season/${seasonSlug}?event=${event.id}&modal=event_details`
  description += `\n\nType : ${eventTypeIcon} ${eventTypeName}\n🔗 Détails : ${eventUrl}`

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    details: description,
    ...(event.location ? { location: event.location } : {}),
    sf: 'true',
    output: 'xml'
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Génère un lien vers Outlook
 */
export async function generateOutlookLink(event, seasonName = '', castData = null, playersList = [], seasonSlug = '') {
  const eventDate = new Date(event.date)
  const startDate = new Date(eventDate)
  startDate.setHours(19, 0, 0, 0)
  const endDate = new Date(startDate)
  endDate.setHours(23, 0, 0, 0)

  // Récupérer l'équipe confirmée si disponible
  const confirmedPlayers = extractConfirmedPlayers(castData, playersList)

  // Construire la description avec l'équipe confirmée si disponible
  let description = event.description || ''
  if (confirmedPlayers.length > 0) {
    description += `\n\n✅ ÉQUIPE CONFIRMÉE : ${confirmedPlayers.join(', ')}`
  }
  // Récupérer l'emoji et le libellé du type d'événement
  const eventType = event.templateType
  const eventTypeIcon = EVENT_TYPE_ICONS[eventType] || '❓'
  const eventTypeName = ROLE_TEMPLATES[eventType]?.name || 'Autre'
  const eventUrl = `https://selections.la-malice.fr/season/${seasonSlug}?event=${event.id}&modal=event_details`
  description += `\n\nType : ${eventTypeIcon} ${eventTypeName}\n🔗 Détails : ${eventUrl}`

  const params = new URLSearchParams({
    subject: event.title,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: description,
    ...(event.location ? { location: event.location } : {}),
    allday: 'false'
  })

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

/**
 * Ouvre un événement dans Google Calendar
 */
export async function openInGoogleCalendar(event, seasonName = '', castData = null, playersList = [], seasonSlug = '') {
  const url = await generateGoogleCalendarLink(event, seasonName, castData, playersList, seasonSlug)
  window.open(url, '_blank')
}

/**
 * Ouvre un événement dans Outlook
 */
export async function openInOutlook(event, seasonName = '', castData = null, playersList = [], seasonSlug = '') {
  const url = await generateOutlookLink(event, seasonName, castData, playersList, seasonSlug)
  window.open(url, '_blank')
}

/**
 * Fonction principale pour ajouter un événement à l'agenda
 */
export async function addToCalendar(type, event, seasonName = '', castData = null, playersList = [], seasonSlug = '') {
  switch (type) {
    case 'ics':
      await downloadICSFile(event, seasonName, castData, playersList, seasonSlug)
      break
    case 'google':
      await openInGoogleCalendar(event, seasonName, castData, playersList, seasonSlug)
      break
    case 'outlook':
      await openInOutlook(event, seasonName, castData, playersList, seasonSlug)
      break
    default:
      console.warn('Type de calendrier non supporté:', type)
  }
}
