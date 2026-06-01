import type { AuditEventRow } from './audit-api.service'
import { auditRoleDisplay } from './audit-display-labels'
import type { AuditLineFormatOptions } from './audit-line-formatter'
import {
  buildAuditLineViewModel,
  type AuditLineViewModel,
  type AuditPersonView,
} from './audit-line-view-model'

type AssignmentsByRole = Record<string, Array<{ slotIndex?: number; participantId?: string }>>

function readAssignments(map: Record<string, unknown> | null): AssignmentsByRole {
  const raw = map?.['assignmentsByRole']
  if (!raw || typeof raw !== 'object') return {}
  return raw as AssignmentsByRole
}

function assignmentKey(roleKey: string, slotIndex: number): string {
  return `${roleKey}:${slotIndex}`
}

function resolveDrawSubject(
  participantId: string | undefined,
  row: AuditEventRow,
): AuditPersonView | null {
  if (!participantId) return null
  const label = row.relatedParticipantLabels?.[participantId]
  if (!label) return null
  return { displayName: label, avatarUrl: null }
}

export function expandDrawAuditLines(
  row: AuditEventRow,
  options: AuditLineFormatOptions = {},
): AuditLineViewModel[] {
  const lines: AuditLineViewModel[] = [buildAuditLineViewModel(row, options, ':draw-header')]
  const before = readAssignments(row.before)
  const after = readAssignments(row.after)
  const allRoles = new Set([...Object.keys(before), ...Object.keys(after)])
  let childIndex = 0
  for (const roleKey of [...allRoles].sort()) {
    const beforeSlots = before[roleKey] ?? []
    const afterSlots = after[roleKey] ?? []
    const beforeByIndex = new Map(beforeSlots.map((s) => [s.slotIndex ?? 0, s.participantId]))
    const afterByIndex = new Map(afterSlots.map((s) => [s.slotIndex ?? 0, s.participantId]))
    const indices = new Set([...beforeByIndex.keys(), ...afterByIndex.keys()])
    for (const slotIndex of [...indices].sort((a, b) => a - b)) {
      const beforeId = beforeByIndex.get(slotIndex)
      const afterId = afterByIndex.get(slotIndex)
      if (beforeId === afterId) continue
      const roleLabel = auditRoleDisplay(roleKey)
      const slotLabel = `${roleLabel} (${slotIndex + 1})`
      const subject = resolveDrawSubject(afterId ?? beforeId, row)
      const childRow: AuditEventRow = {
        ...row,
        subject: subject
          ? {
              displayName: subject.displayName,
              seasonParticipantId: afterId ?? beforeId ?? null,
            }
          : null,
      }
      lines.push(
        buildAuditLineViewModel(childRow, options, `:draw-${childIndex++}`),
      )
      const last = lines[lines.length - 1]
      if (last) {
        lines[lines.length - 1] = {
          ...last,
          actionHint: 'Créneau assigné',
          pills: [{ text: slotLabel, tone: 'role' }],
          indent: true,
          showActorBadge: false,
          actorBadge: null,
          actorBadgeMode: null,
          fullText: [last.timeLabel, subject?.displayName, 'Créneau assigné', slotLabel]
            .filter(Boolean)
            .join(' · '),
        }
      }
    }
  }
  return lines
}

export function assignmentKeyForTest(roleKey: string, slotIndex: number): string {
  return assignmentKey(roleKey, slotIndex)
}
