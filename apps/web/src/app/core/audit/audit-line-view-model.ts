import type { MemberGender } from '../account/member-gender'
import type { AuditEventRow, AuditIdentity } from './audit-api.service'
import {
  auditAvailabilityPillTone,
  auditLifecycleLabel,
  auditLifecyclePillTone,
  auditParticipationPillTone,
  auditParticipationStatusLabel,
  auditAvailabilityStatusLabel,
  auditRoleDisplay,
  auditRoleKeysList,
  type AuditPillTone,
} from './audit-display-labels'
import { auditActionLabel } from './audit-labels'
import type { AuditLineFormatOptions } from './audit-line-formatter'

export type { AuditPillTone }

export interface AuditPersonView {
  displayName: string
  avatarUrl: string | null
  gender: MemberGender | null
}

export interface AuditVisualPill {
  text: string
  tone: AuditPillTone
}

export type AuditActorBadgeMode = 'proxy' | 'direct'

export interface AuditLineViewModel {
  key: string
  rowId: string
  occurredAt: string
  timeLabel: string
  actionHint: string
  subject: AuditPersonView | null
  showSubject: boolean
  pills: AuditVisualPill[]
  transition: { before: AuditVisualPill; after: AuditVisualPill } | null
  /** Compact avatar badge — proxy (for someone else) or direct (organizer action, no subject). */
  showActorBadge: boolean
  actorBadge: AuditPersonView | null
  actorBadgeMode: AuditActorBadgeMode | null
  indent?: boolean
  fullText: string
}

function formatTime(iso: string, precision: 'minutes' | 'seconds'): string {
  const d = new Date(iso)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  if (precision === 'minutes') {
    return `${h}:${m}`
  }
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

function toPerson(identity: AuditIdentity | null | undefined): AuditPersonView | null {
  if (!identity?.displayName) return null
  return {
    displayName: identity.displayName,
    avatarUrl: identity.avatarUrl ?? null,
    gender: identity.gender ?? null,
  }
}

function shouldShowSubject(row: AuditEventRow, options: AuditLineFormatOptions): boolean {
  const subjectName = row.subject?.displayName
  if (!subjectName) return false
  if (options.moiMode && options.viewerParticipantName && subjectName === options.viewerParticipantName) {
    return false
  }
  return true
}

function resolveActorBadge(
  row: AuditEventRow,
): { actor: AuditPersonView; mode: AuditActorBadgeMode } | null {
  const actor = toPerson(row.actor)
  if (!actor) return null

  const subjectName = row.subject?.displayName
  if (!subjectName) {
    return { actor, mode: 'direct' }
  }

  if (row.actor?.userId && row.subject?.userId && row.actor.userId === row.subject.userId) {
    return null
  }
  if (row.actor?.displayName === subjectName) {
    return null
  }

  return { actor, mode: 'proxy' }
}

function pill(text: string, tone: AuditPillTone): AuditVisualPill {
  return { text, tone }
}

function lifecyclePill(raw: unknown): AuditVisualPill {
  const key = typeof raw === 'string' ? raw : ''
  return pill(auditLifecycleLabel(raw), auditLifecyclePillTone(key))
}

function buildAvailabilityVisuals(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): { pills: AuditVisualPill[]; transition: AuditLineViewModel['transition'] } {
  const beforeStatus = before?.['status'] as string | undefined
  const afterStatus = after?.['status'] as string | undefined
  if (beforeStatus && afterStatus && beforeStatus !== afterStatus) {
    return {
      pills: [],
      transition: {
        before: pill(auditAvailabilityStatusLabel(beforeStatus), auditAvailabilityPillTone(beforeStatus)),
        after: pill(auditAvailabilityStatusLabel(afterStatus), auditAvailabilityPillTone(afterStatus)),
      },
    }
  }
  const pills: AuditVisualPill[] = []
  if (afterStatus) {
    pills.push(pill(auditAvailabilityStatusLabel(afterStatus), auditAvailabilityPillTone(afterStatus)))
  }
  const roles = (after?.['roleKeys'] as string[] | undefined) ?? []
  if (roles.length > 0) {
    for (const roleText of auditRoleKeysList(roles).split(', ')) {
      pills.push(pill(roleText, 'role'))
    }
  }
  return { pills, transition: null }
}

function buildLifecycleVisuals(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): { pills: AuditVisualPill[]; transition: AuditLineViewModel['transition'] } {
  const beforeRaw = before?.['compositionLifecycle'] ?? before?.['teamStatusBadgeKey']
  const afterRaw = after?.['compositionLifecycle'] ?? after?.['teamStatusBadgeKey']
  const beforeLabel = auditLifecycleLabel(beforeRaw)
  const afterLabel = auditLifecycleLabel(afterRaw)
  if (beforeLabel === afterLabel) {
    return { pills: afterRaw ? [lifecyclePill(afterRaw)] : [], transition: null }
  }
  if (beforeRaw || afterRaw) {
    return {
      pills: [],
      transition: {
        before: lifecyclePill(beforeRaw),
        after: lifecyclePill(afterRaw),
      },
    }
  }
  return { pills: [], transition: null }
}

function buildParticipationVisuals(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): { pills: AuditVisualPill[]; transition: AuditLineViewModel['transition'] } {
  const roleKey = (after?.['roleKey'] ?? before?.['roleKey']) as string | undefined
  const beforeStatus = before?.['participationStatus'] as string | undefined
  const afterStatus = after?.['participationStatus'] as string | undefined
  const pills: AuditVisualPill[] = []
  let transition: AuditLineViewModel['transition'] = null

  if (beforeStatus && afterStatus && beforeStatus !== afterStatus) {
    transition = {
      before: pill(auditParticipationStatusLabel(beforeStatus), auditParticipationPillTone(beforeStatus)),
      after: pill(auditParticipationStatusLabel(afterStatus), auditParticipationPillTone(afterStatus)),
    }
  } else if (afterStatus) {
    pills.push(pill(auditParticipationStatusLabel(afterStatus), auditParticipationPillTone(afterStatus)))
  }
  if (roleKey) {
    pills.push(pill(auditRoleDisplay(roleKey), 'role'))
  }
  return { pills, transition }
}

function buildSlotVisuals(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): { pills: AuditVisualPill[]; transition: AuditLineViewModel['transition'] } {
  const roleKey = (after?.['roleKey'] ?? before?.['roleKey']) as string | undefined
  if (!roleKey) return { pills: [], transition: null }
  return { pills: [pill(auditRoleDisplay(roleKey), 'role')], transition: null }
}

function buildVisuals(row: AuditEventRow): { pills: AuditVisualPill[]; transition: AuditLineViewModel['transition'] } {
  switch (row.actionType) {
    case 'AVAILABILITY_CREATED':
    case 'AVAILABILITY_UPDATED':
    case 'AVAILABILITY_DELETED':
      return buildAvailabilityVisuals(row.before, row.after)
    case 'COMPOSITION_LIFECYCLE_CHANGED':
      return buildLifecycleVisuals(row.before, row.after)
    case 'PARTICIPATION_CONFIRMED':
    case 'PARTICIPATION_DECLINED':
    case 'PARTICIPATION_RESET':
      return buildParticipationVisuals(row.before, row.after)
    case 'SLOT_ASSIGNED':
    case 'SLOT_CLEARED':
      return buildSlotVisuals(row.before, row.after)
    case 'COMPOSITION_DRAW_COMPLETED':
      return {
        pills: row.scope.eventTitle ? [pill(row.scope.eventTitle, 'lifecycle-info')] : [],
        transition: null,
      }
    default:
      return { pills: [], transition: null }
  }
}

function joinFullText(parts: string[]): string {
  return parts.filter(Boolean).join(' · ')
}

export function buildAuditLineViewModel(
  row: AuditEventRow,
  options: AuditLineFormatOptions = {},
  lineKeySuffix = '',
): AuditLineViewModel {
  const precision = options.moiMode ? 'minutes' : (options.timePrecision ?? 'seconds')
  const timeLabel = formatTime(row.occurredAt, precision)
  const actionHint = auditActionLabel(row.actionType)
  const showSubject = shouldShowSubject(row, options)
  const subject = showSubject ? toPerson(row.subject) : null
  const actorBadgeInfo = resolveActorBadge(row)
  const { pills, transition } = buildVisuals(row)
  const displayPills =
    options.showEventPrefix && row.scope.eventTitle
      ? [pill(row.scope.eventTitle, 'lifecycle-info'), ...pills]
      : pills

  const fullParts: string[] = []
  if (options.showEventPrefix && row.scope.eventTitle) {
    fullParts.push(row.scope.eventTitle)
  }
  fullParts.push(timeLabel)
  if (subject) fullParts.push(subject.displayName)
  fullParts.push(actionHint)
  if (transition) {
    fullParts.push(`${transition.before.text} → ${transition.after.text}`)
  }
  fullParts.push(...displayPills.map((p) => p.text))
  if (actorBadgeInfo) {
    fullParts.push(
      actorBadgeInfo.mode === 'proxy'
        ? `Par ${actorBadgeInfo.actor.displayName}`
        : actorBadgeInfo.actor.displayName,
    )
  }

  return {
    key: `${row.id}${lineKeySuffix}`,
    rowId: row.id,
    occurredAt: row.occurredAt,
    timeLabel,
    actionHint,
    subject,
    showSubject,
    pills: displayPills,
    transition,
    showActorBadge: actorBadgeInfo != null,
    actorBadge: actorBadgeInfo?.actor ?? null,
    actorBadgeMode: actorBadgeInfo?.mode ?? null,
    fullText: joinFullText(fullParts),
  }
}

export function buildSimpleAuditLineViewModel(
  row: AuditEventRow,
  detailText: string,
  options: { lineKeySuffix?: string; indent?: boolean; pills?: AuditVisualPill[] } = {},
): AuditLineViewModel {
  const timeLabel = formatTime(row.occurredAt, 'seconds')
  const pills = options.pills ?? (detailText ? [pill(detailText, 'role')] : [])
  return {
    key: `${row.id}${options.lineKeySuffix ?? ''}`,
    rowId: row.id,
    occurredAt: row.occurredAt,
    timeLabel,
    actionHint: '',
    subject: null,
    showSubject: false,
    pills,
    transition: null,
    showActorBadge: false,
    actorBadge: null,
    actorBadgeMode: null,
    indent: options.indent,
    fullText: joinFullText([timeLabel, ...pills.map((p) => p.text)]),
  }
}
