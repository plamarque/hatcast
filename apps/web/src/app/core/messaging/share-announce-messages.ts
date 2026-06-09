import { ROLE_DISPLAY_ORDER, type RoleKey } from '../events/event-types'
import type { MemberGender } from '../account/member-gender'
import { effectiveMemberGender } from '../account/member-gender'
import { getRoleLabel, roleEmoji } from '../../shared/event-roles/event-roles'
import { buildEventUrls } from './event-urls'

export type ShareAnnounceIntent = 'draw' | 'composition' | 'event' | 'availability_nudge'

export interface RoleAssignmentLine {
  roleKey: RoleKey
  displayNames: string[]
  participantGenders?: (MemberGender | unknown | undefined)[]
}

function resolvePluralGender(
  genders: (MemberGender | unknown | undefined)[] | undefined,
  count: number,
): MemberGender | unknown {
  if (!genders?.length) {
    return 'non_specified'
  }
  const resolved = genders.map((g) => effectiveMemberGender(g))
  if (count === 1) {
    return resolved[0]
  }
  const unique = new Set(resolved)
  if (unique.size === 1 && !unique.has('non_specified')) {
    return resolved[0]
  }
  return 'non_specified'
}

export function buildRoleListText(lines: RoleAssignmentLine[]): string[] {
  const result: string[] = []
  const byRole = new Map(lines.map((l) => [l.roleKey, l]))
  for (const roleKey of ROLE_DISPLAY_ORDER) {
    const line = byRole.get(roleKey)
    const rawNames = line?.displayNames ?? []
    const rawGenders = line?.participantGenders
    const paired = rawNames
      .map((name, index) => ({ name: name?.trim(), gender: rawGenders?.[index] }))
      .filter((entry) => Boolean(entry.name))
    const names = paired.map((entry) => entry.name as string)
    if (names.length === 0) continue
    const emoji = roleEmoji(roleKey)
    const gender = resolvePluralGender(
      paired.map((entry) => entry.gender),
      names.length,
    )
    const label = getRoleLabel(roleKey, gender, names.length > 1)
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

export function buildAvailabilityReminderMessage(params: {
  eventTitle: string
  eventDate: string
  eventUrl: string
}): string {
  return `⏰ Rappel disponibilité

N'oublie pas de donner tes dispos pour ${params.eventTitle} le ${params.eventDate}

✅ Dispo ❌ Pas dispo

Lien direct : ${params.eventUrl}`
}

export function buildDefaultShareMessage(params: {
  intent: ShareAnnounceIntent
  origin: string
  troupeSlug: string
  seasonSlug: string
  eventSlug: string
  eventTitle: string
  eventDateIso: string
  roleLines: RoleAssignmentLine[]
}): string {
  const eventDate = formatShareEventDate(params.eventDateIso)
  const { eventUrl, confirmUrl } = buildEventUrls(
    params.origin,
    params.troupeSlug,
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
    case 'availability_nudge':
      return buildAvailabilityReminderMessage({
        eventTitle: params.eventTitle,
        eventDate,
        eventUrl: `${eventUrl}?tab=dispos`,
      })
  }
}

export function buildWhatsAppSendUrl(message: string): string {
  return `whatsapp://send?text=${encodeURIComponent(message)}`
}
