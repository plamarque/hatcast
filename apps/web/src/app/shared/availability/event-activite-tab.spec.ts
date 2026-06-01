import { TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { AuditApiService } from '../../core/audit/audit-api.service'
import { ParticipantApiService } from '../../core/participants/participant-api.service'
import { ROLE_TEMPLATES } from '../../core/events/event-types'
import { EventActiviteTab } from './event-activite-tab'

const mockEvent = {
  id: 'event-1',
  title: 'Match',
  startsAt: '2030-06-15T18:00:00Z',
  templateType: 'cabaret',
  roleSlots: ROLE_TEMPLATES.cabaret,
  archived: false,
}

async function setup(options: { canViewAuditEvent?: boolean; canSwitchSubject?: boolean } = {}) {
  const listEvents = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: {
      content: [
        {
          id: 'a1',
          occurredAt: '2032-06-01T12:00:00Z',
          actionType: 'AVAILABILITY_UPDATED',
          actionLabel: 'Disponibilité modifiée',
          actor: null,
          subject: null,
          scope: { troupeId: 'troupe-1', seasonId: 'season-1', eventId: 'event-1' },
          before: null,
          after: null,
          metadata: null,
        },
      ],
      totalElements: 1,
      page: 0,
      size: 25,
      totalPages: 1,
    },
  })
  const listSeasonParticipantSelectors = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: [
      { id: 'p1', displayName: 'Patrice', avatarUrl: null, kind: 'MEMBER' },
      { id: 'p2', displayName: 'Camille', avatarUrl: null, kind: 'MEMBER' },
    ],
  })

  await TestBed.configureTestingModule({
    imports: [EventActiviteTab, NoopAnimationsModule],
    providers: [
      { provide: AuditApiService, useValue: { listEvents } },
      { provide: ParticipantApiService, useValue: { listSeasonParticipantSelectors } },
    ],
  }).compileComponents()

  const fixture = TestBed.createComponent(EventActiviteTab)
  fixture.componentRef.setInput('seasonId', 'season-1')
  fixture.componentRef.setInput('troupeId', 'troupe-1')
  fixture.componentRef.setInput('event', mockEvent)
  fixture.componentRef.setInput('currentUserId', 'user-1')
  fixture.componentRef.setInput('canViewAuditEvent', options.canViewAuditEvent ?? true)
  fixture.componentRef.setInput('canSwitchSubject', options.canSwitchSubject ?? true)
  fixture.componentRef.setInput('linkedParticipantId', 'p1')
  fixture.componentRef.setInput('linkedParticipantName', 'Patrice')
  fixture.detectChanges()
  await fixture.whenStable()
  let firstCallArgs: Record<string, unknown> | undefined
  await vi.waitFor(() => {
    expect(listEvents).toHaveBeenCalled()
    firstCallArgs = listEvents.mock.calls[0]?.[0] as Record<string, unknown>
  })
  listEvents.mockClear()
  return { fixture, listEvents, firstCallArgs }
}

describe('EventActiviteTab', () => {
  it('loads full event journal in Tous mode without participant filter', async () => {
    const { firstCallArgs } = await setup()
    expect(firstCallArgs).toEqual(
      expect.objectContaining({
        eventId: 'event-1',
        participantSeasonParticipantId: undefined,
      }),
    )
  })

  it('reloads with participant filter when organizer picks another subject in Moi mode', async () => {
    const { fixture, listEvents } = await setup()
    const comp = fixture.componentInstance as unknown as {
      setViewMode: (mode: 'moi' | 'tous') => void
      onSubjectChange: (id: string) => void
    }

    comp.setViewMode('moi')
    await fixture.whenStable()
    listEvents.mockClear()

    comp.onSubjectChange('p2')
    await fixture.whenStable()
    await vi.waitFor(() => expect(listEvents).toHaveBeenCalled())

    expect(listEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        participantSeasonParticipantId: 'p2',
      }),
    )
  })

  it('does not send participant filter when switching back to Tous', async () => {
    const { fixture, listEvents } = await setup()
    const comp = fixture.componentInstance as unknown as {
      setViewMode: (mode: 'moi' | 'tous') => void
    }

    comp.setViewMode('moi')
    await fixture.whenStable()
    listEvents.mockClear()

    comp.setViewMode('tous')
    await fixture.whenStable()
    await vi.waitFor(() => expect(listEvents).toHaveBeenCalled())

    expect(listEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        participantSeasonParticipantId: undefined,
      }),
    )
  })
})
