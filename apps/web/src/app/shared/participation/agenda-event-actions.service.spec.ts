import { TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { of } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthApiService } from '../../core/auth/auth-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { EventApiService } from '../../core/events/event-api.service'
import { AvailabilityApiService } from '../../core/availability/availability-api.service'
import { AgendaEventActionsService } from './agenda-event-actions.service'
import type { UserAgendaItem } from '../../core/agenda/user-agenda-api.service'

const item: UserAgendaItem = { eventId: 'e', seasonId: 's', troupeId: 't', title: 'Spectacle', startsAt: '2030-01-01T18:00:00Z', eventSlug: 'e', seasonSlug: 's', seasonTitle: 'Saison', troupeSlug: 't', troupeName: 'Troupe', location: null, myAvailabilityStatus: 'unknown' }

describe('AgendaEventActionsService', () => {
  let service: AgendaEventActionsService
  const getEvent = vi.fn()
  const getMyAvailability = vi.fn()
  const open = vi.fn()
  const snack = vi.fn()
  const activeTroupes = vi.fn()
  beforeEach(() => {
    vi.resetAllMocks()
    getEvent.mockResolvedValue({ ok: true, data: { roleSlots: { player: 1 }, archived: false } })
    getMyAvailability.mockResolvedValue({ ok: true, data: { status: 'available', roleKeys: ['player'], comment: 'Saved' } })
    open.mockReturnValue({ afterClosed: () => of(undefined) })
    activeTroupes.mockReturnValue([{ id: 't', membership: { status: 'ACTIVE' } }])
    TestBed.configureTestingModule({ providers: [
      { provide: AuthApiService, useValue: { sessionUser: () => ({ displayName: 'Patrice' }) } },
      { provide: TroupeContextService, useValue: { activeTroupes, currentUserDisplayLabel: () => 'Patrice' } },
      { provide: EventApiService, useValue: { getEvent } },
      { provide: AvailabilityApiService, useValue: { getMyAvailability } },
      { provide: MatDialog, useValue: { open } },
      { provide: MatSnackBar, useValue: { open: snack } },
    ] })
    service = TestBed.inject(AgendaEventActionsService)
  })

  it('loads persisted response and returns false on cancellation', async () => {
    expect(await service.openAvailability(item)).toBe(false)
    expect(open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ data: expect.objectContaining({ initialStatus: 'available', initialRoleKeys: ['player'], initialComment: 'Saved' }) }))
  })

  it('reports saved changes for parent refresh', async () => {
    open.mockReturnValue({ afterClosed: () => of({ status: 'available', roleKeys: ['player'] }) })
    expect(await service.openAvailability(item)).toMatchObject({ kind: 'saved', item: { myAvailabilityStatus: 'available' } })
  })

  it.each(['event', 'availability'])('does not open a misleading editor when %s loading fails', async source => {
    if (source === 'event') getEvent.mockResolvedValue({ ok: false })
    else getMyAvailability.mockResolvedValue({ ok: false })
    expect(await service.openAvailability(item)).toBe(false)
    expect(open).not.toHaveBeenCalled()
    expect(snack).toHaveBeenCalled()
  })

  it('blocks archived events and team changes fetched after card load', async () => {
    getEvent.mockResolvedValueOnce({ ok: true, data: { archived: true } })
    expect(await service.openAvailability(item)).toBe(false)
    getEvent.mockResolvedValueOnce({ ok: true, data: { archived: false, participantFocus: { inTeam: true, compositionRoleKey: 'player', availabilityStatus: 'available' } } })
    expect(await service.openAvailability(item)).toMatchObject({ kind: 'refresh', item: { participantFocus: { inTeam: true } } })
    expect(snack).toHaveBeenLastCalledWith(expect.stringContaining('participation a changé'), 'OK', expect.anything())
    expect(open).not.toHaveBeenCalled()
  })

  it('preserves active membership and withdrawn restrictions', () => {
    activeTroupes.mockReturnValue([])
    expect(service.canEditAvailability(item)).toBe(false)
    activeTroupes.mockReturnValue([{ id: 't', membership: { status: 'ACTIVE' } }])
    expect(service.canEditAvailability({ ...item, participantFocus: { inTeam: false, availabilityStatus: 'available', compositionRoleKey: 'player', slotParticipationStatus: 'declined' } })).toBe(false)
    expect(service.canConfirmParticipation({ ...item, participantFocus: { inTeam: true, availabilityStatus: 'available', compositionRoleKey: 'player' } })).toBe(true)
  })
})
