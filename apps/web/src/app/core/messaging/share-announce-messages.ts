import { ROLE_DISPLAY_ORDER, type RoleKey } from '../events/event-types'
import { roleEmoji, roleLabelSingular } from '../../shared/event-roles/event-roles'
import { buildEventUrls } from './event-urls'

export type ShareAnnounceIntent = 'draw' | 'composition' | 'event'

export interface RoleAssignmentLine {
  roleKey: RoleKey
  displayNames: string[]
}

function pluralizeRoleLabel(label: string, count: number): string {
  if (count <= 1) return label
  if (label.endsWith('.e')) return label.replace('.e', '.es')
  return `${label}s`
}

export function buildRoleListText(lines: RoleAssignmentLine[]): string[] {
  const result: string[] = []
  const byRole = new Map(lines.map((l) => [l.roleKey, l.displayNames.filter(Boolean)]))
  for (const roleKey of ROLE_DISPLAY_ORDER) {
    const names = byRole.get(roleKey) ?? []
    if (names.length === 0) continue
    const emoji = roleEmoji(roleKey)
    const label = pluralizeRoleLabel(roleLabelSingular(roleKey), names.length)
    result.push(`${emoji} ${label} : ${names.join(', ')}`)
  }
  return result
}

export function formatShareEventDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function buildDrawAnnouncementMessage(params: {
  eventTitle: string
  eventDate: string
  roleLines: RoleAssignmentLine[]
}): string {
  const roleLines = buildRoleListText(params.roleLines)
  return `🎲 🎲 🎲  TIRAGE 🎲 🎲 🎲 

📆 ${params.eventTitle} du ${params.eventDate}

${roleLines.join('\n')}`
}

export function buildCompositionAnnouncementMessage(params: {
  eventTitle: string
  eventDate: string
  roleLines: RoleAssignmentLine[]
  confirmUrl?: string
}): string {
  const roleLines = buildRoleListText(params.roleLines)
  let confirmText = "Un petit 👍 habituel pour confirmer que c'est OK pour vous."
  if (params.confirmUrl) {
    confirmText += ` OU mieux directement sur l'appli ici : ${params.confirmUrl}`
  }
  return `🎊 🎊 🎊  COMPO 🎊 🎊 🎊 

📆 ${params.eventTitle} du ${params.eventDate}

${roleLines.join('\n')}


${confirmText}`
}

export function buildAvailabilityAnnouncementMessage(params: {
  eventTitle: string
  eventDate: string
  eventUrl: string
}): string {
  return `Hello,

🎯 Nouvel événement à l'horizon ! 

Es-tu dispo le ${params.eventDate} pour ${params.eventTitle} ?

🎭 On a besoin de toi pour que ça brille ! ✨

✅ Dispo ❌ Pas dispo

Lien direct : ${params.eventUrl}`
}

export function buildDefaultShareMessage(params: {
  intent: ShareAnnounceIntent
  origin: string
  seasonSlug: string
  eventSlug: string
  eventTitle: string
  eventDateIso: string
  roleLines: RoleAssignmentLine[]
}): string {
  const eventDate = formatShareEventDate(params.eventDateIso)
  const { eventUrl, confirmUrl } = buildEventUrls(
    params.origin,
    params.seasonSlug,
    params.eventSlug,
  )
  switch (params.intent) {
    case 'draw':
      return buildDrawAnnouncementMessage({
        eventTitle: params.eventTitle,
        eventDate,
        roleLines: params.roleLines,
      })
    case 'composition':
      return buildCompositionAnnouncementMessage({
        eventTitle: params.eventTitle,
        eventDate,
        roleLines: params.roleLines,
        confirmUrl,
      })
    case 'event':
      return buildAvailabilityAnnouncementMessage({
        eventTitle: params.eventTitle,
        eventDate,
        eventUrl,
      })
  }
}

export function buildWhatsAppSendUrl(message: string): string {
  return `whatsapp://send?text=${encodeURIComponent(message)}`
}
