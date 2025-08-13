/**
 * Service pour l'ajout d'événements aux agendas
 */

/**
 * Génère un fichier iCalendar (.ics) pour un événement
 */
export function generateICSFile(event, seasonName = '') {
  const eventDate = new Date(event.date)
  const startDate = new Date(eventDate)
  startDate.setHours(19, 0, 0, 0) // 19h00 par défaut
  const endDate = new Date(startDate)
  endDate.setHours(23, 0, 0, 0) // 23h00 par défaut

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Impro Selector//Calendar Event//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@hatcast.app`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || ''}${seasonName ? `\\n\\nSaison : ${seasonName}` : ''}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
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
export function downloadICSFile(event, seasonName = '') {
  const icsContent = generateICSFile(event, seasonName)
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
export function generateGoogleCalendarLink(event, seasonName = '') {
  const eventDate = new Date(event.date)
  const startDate = new Date(eventDate)
  startDate.setHours(19, 0, 0, 0)
  const endDate = new Date(startDate)
  endDate.setHours(23, 0, 0, 0)

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    details: `${event.description || ''}${seasonName ? `\n\nSaison : ${seasonName}` : ''}`,
    location: 'Impro Selector',
    sf: 'true',
    output: 'xml'
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Génère un lien vers Outlook
 */
export function generateOutlookLink(event, seasonName = '') {
  const eventDate = new Date(event.date)
  const startDate = new Date(eventDate)
  startDate.setHours(19, 0, 0, 0)
  const endDate = new Date(startDate)
  endDate.setHours(23, 0, 0, 0)

  const params = new URLSearchParams({
    subject: event.title,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: `${event.description || ''}${seasonName ? `\n\nSaison : ${seasonName}` : ''}`,
    location: 'Impro Selector',
    allday: 'false'
  })

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

/**
 * Ouvre un événement dans Google Calendar
 */
export function openInGoogleCalendar(event, seasonName = '') {
  const url = generateGoogleCalendarLink(event, seasonName)
  window.open(url, '_blank')
}

/**
 * Ouvre un événement dans Outlook
 */
export function openInOutlook(event, seasonName = '') {
  const url = generateOutlookLink(event, seasonName)
  window.open(url, '_blank')
}

/**
 * Fonction principale pour ajouter un événement à l'agenda
 */
export function addToCalendar(type, event, seasonName = '') {
  switch (type) {
    case 'ics':
      downloadICSFile(event, seasonName)
      break
    case 'google':
      openInGoogleCalendar(event, seasonName)
      break
    case 'outlook':
      openInOutlook(event, seasonName)
      break
    default:
      console.warn('Type de calendrier non supporté:', type)
  }
}
