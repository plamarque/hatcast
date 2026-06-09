import { describe, expect, it } from 'vitest'

import { buildAuditEventsQueryString } from './audit-api.service'
import {
  auditParticipationStatusLabel,
  auditRoleDisplay,
  auditRoleKeysList,
} from './audit-display-labels'
import { formatAuditLine } from './audit-line-formatter'
import { buildAuditLineViewModel } from './audit-line-view-model'
import { AUDIT_ACTION_LABELS } from './audit-labels'
import type { AuditEventRow } from './audit-api.service'
import { expandDrawAuditLines } from './audit-draw-expander'

describe('audit-api.service', () => {
  it('serializes pagination and scope filters', () => {
    const qs = buildAuditEventsQueryString({
      troupeId: 't1',
      seasonId: 's1',
      eventId: 'e1',
      actionType: 'AVAILABILITY_UPDATED',
      page: 2,
      size: 50,
    })
    expect(qs).toContain('troupeId=t1')
    expect(qs).toContain('seasonId=s1')
    expect(qs).toContain('eventId=e1')
    expect(qs).toContain('actionType=AVAILABILITY_UPDATED')
    expect(qs).toContain('page=2')
    expect(qs).toContain('size=50')
  })
})

describe('audit-display-labels', () => {
  it('maps participation statuses to French UX labels', () => {
    expect(auditParticipationStatusLabel('confirmed')).toBe('Confirmé 👍')
    expect(auditParticipationStatusLabel('pending')).toBe('À confirmer ⏳')
    expect(auditParticipationStatusLabel('declined')).toBe('Retrait 👎')
  })

  it('maps withdrawal audit action labels per story 6.24', () => {
    expect(AUDIT_ACTION_LABELS.PARTICIPATION_DECLINED).toBe('Retrait de la compo')
    expect(AUDIT_ACTION_LABELS.DECLINE_RESTORED).toBe('Réintégration après retrait')
  })

  it('maps role keys to emoji + French label', () => {
    expect(auditRoleDisplay('player')).toBe('🎭 Comédien·ne')
    expect(auditRoleKeysList(['mc', 'player'])).toBe('🎭 Comédien·ne, 🎤 MC')
  })
})

describe('audit-line-formatter', () => {
  it('formats system lifecycle row without actor', () => {
    const row: AuditEventRow = {
      id: '1',
      occurredAt: '2032-06-01T14:41:02Z',
      actionType: 'COMPOSITION_LIFECYCLE_CHANGED',
      actionLabel: 'Statut équipe',
      actor: null,
      subject: null,
      scope: { troupeId: 't', seasonId: 's', eventId: 'e' },
      before: { compositionLifecycle: 'awaitingConfirmations' },
      after: { compositionLifecycle: 'complete' },
      metadata: null,
    }
    const line = formatAuditLine(row)
    expect(line).toContain('Statut équipe')
    expect(line).toContain('Préparation → Confirmé')
    expect(line).not.toContain('undefined')
  })

  it('shows actor badge for composition validated without subject', () => {
    const row: AuditEventRow = {
      id: '1b',
      occurredAt: '2032-06-01T12:12:01Z',
      actionType: 'COMPOSITION_VALIDATED',
      actionLabel: 'Composition validée',
      actor: { displayName: 'Patrice Lamarque' },
      subject: null,
      scope: { troupeId: 't', seasonId: 's', eventId: 'e' },
      before: { validatedAt: null },
      after: { validatedAt: '2032-06-01T12:12:01Z' },
      metadata: null,
    }
    const vm = buildAuditLineViewModel(row)
    expect(vm.showActorBadge).toBe(true)
    expect(vm.actorBadgeMode).toBe('direct')
    expect(vm.actorBadge?.displayName).toBe('Patrice Lamarque')
    expect(vm.fullText).toContain('Patrice Lamarque')
  })

  it('prefixes event title on admin season journal rows', () => {
    const row: AuditEventRow = {
      id: '5',
      occurredAt: '2032-06-01T14:32:08Z',
      actionType: 'AVAILABILITY_UPDATED',
      actionLabel: 'Disponibilité modifiée',
      actor: { displayName: 'Camille' },
      subject: { displayName: 'Léa' },
      scope: { troupeId: 't', seasonId: 's', eventId: 'e', eventTitle: 'Impro du 12 juin' },
      before: { status: 'unavailable' },
      after: { status: 'available' },
      metadata: null,
    }
    const vm = buildAuditLineViewModel(row, { showEventPrefix: true })
    expect(vm.fullText).toContain('Impro du 12 juin')
    expect(vm.pills[0]?.text).toBe('Impro du 12 juin')
  })

  it('formats explicit row with trailing actor when proxy', () => {
    const row: AuditEventRow = {
      id: '2',
      occurredAt: '2032-06-01T14:32:08Z',
      actionType: 'AVAILABILITY_UPDATED',
      actionLabel: 'Disponibilité modifiée',
      actor: { displayName: 'Camille' },
      subject: { displayName: 'Léa' },
      scope: { troupeId: 't', seasonId: 's', eventId: 'e' },
      before: { status: 'unavailable' },
      after: { status: 'available', roleKeys: ['mc'] },
      metadata: null,
    }
    const line = formatAuditLine(row)
    expect(line.endsWith('Camille')).toBe(true)
    expect(line).toContain('Léa')
    expect(line).toContain('Pas dispo → Dispo')
    expect(line).not.toContain('PLAYER')
    expect(line).not.toContain('confirmed')
  })

  it('formats availability roles with emoji labels', () => {
    const row: AuditEventRow = {
      id: '2b',
      occurredAt: '2032-06-01T14:32:08Z',
      actionType: 'AVAILABILITY_CREATED',
      actionLabel: 'Disponibilité créée',
      actor: { displayName: 'Patrice Lamarque' },
      subject: { displayName: 'Nicolas N.' },
      scope: { troupeId: 't', seasonId: 's', eventId: 'e' },
      before: null,
      after: { status: 'available', roleKeys: ['dj', 'player', 'mc'] },
      metadata: null,
    }
    const line = formatAuditLine(row)
    expect(line).toContain('Dispo')
    expect(line).toContain('🎭 Comédien·ne')
    expect(line).toContain('🎧 DJ')
    expect(line).toContain('🎤 MC')
    expect(line).toContain('Par Patrice Lamarque')
    expect(line).not.toContain('player')
  })

  it('formats participation row in French UX language', () => {
    const row: AuditEventRow = {
      id: '4',
      occurredAt: '2032-06-01T12:12:00Z',
      actionType: 'PARTICIPATION_CONFIRMED',
      actionLabel: 'Participation confirmée',
      actor: { displayName: 'Patrice Lamarque' },
      subject: { displayName: 'Nicolas N.' },
      scope: { troupeId: 't', seasonId: 's', eventId: 'e' },
      before: { participationStatus: 'pending', roleKey: 'player' },
      after: { participationStatus: 'confirmed', roleKey: 'player' },
      metadata: null,
    }
    const line = formatAuditLine(row)
    expect(line).toContain('À confirmer ⏳ → Confirmé 👍')
    expect(line).toContain('🎭 Comédien·ne')
    expect(line).not.toContain('pending')
    expect(line).not.toContain('PLAYER')
  })
})

describe('audit-draw-expander', () => {
  it('expands draw assignments into child lines', () => {
    const row: AuditEventRow = {
      id: '3',
      occurredAt: '2032-06-01T14:36:41Z',
      actionType: 'COMPOSITION_DRAW_COMPLETED',
      actionLabel: 'Tirage',
      actor: { displayName: 'Camille' },
      subject: null,
      scope: { troupeId: 't', seasonId: 's', eventId: 'e', eventTitle: 'Impro' },
      before: { assignmentsByRole: {} },
      after: {
        assignmentsByRole: {
          player: [{ slotIndex: 0, participantId: 'p1' }],
        },
      },
      metadata: null,
      relatedParticipantLabels: { p1: 'Léa' },
    }
    const lines = expandDrawAuditLines(row)
    expect(lines.length).toBeGreaterThan(1)
    expect(lines[1]?.fullText).toContain('🎭 Comédien·ne')
    expect(lines[1]?.fullText).toContain('Créneau assigné')
    expect(lines[1]?.fullText).toContain('Léa')
    expect(lines[1]?.fullText).not.toContain('PLAYER')
  })
})
