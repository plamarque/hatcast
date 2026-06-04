import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { describe, expect, it, vi } from 'vitest'

import { emptyRoleSlots } from '../../core/events/event-types'
import { ShareAnnounceDialog } from './share-announce-dialog'
import { openAvailabilityNudgeDialog, openEventAnnounceDialog } from './share-announce-open'

describe('openEventAnnounceDialog', () => {
  it('opens ShareAnnounceDialog with event intent', () => {
    const dialogOpen = vi.fn().mockReturnValue({ afterClosed: () => ({ subscribe: vi.fn() }) })
    const dialog = { open: dialogOpen } as unknown as MatDialog
    const snack = { open: vi.fn() } as unknown as MatSnackBar

    openEventAnnounceDialog(dialog, snack, {
      seasonId: 'season-1',
      seasonSlug: 'saison-a',
      troupeSlug: 'troupe-a',
      event: {
        id: 'event-1',
        seasonId: 'season-1',
        slug: 'event-1',
        title: 'Apérock',
        description: null,
        location: null,
        startsAt: '2026-05-12T19:00:00.000Z',
        archived: false,
        templateType: 'custom',
        roleSlots: emptyRoleSlots(),
        createdAt: '',
        updatedAt: '',
        availabilityOpenedAt: '2026-01-01T00:00:00.000Z',
      },
    })

    expect(dialogOpen).toHaveBeenCalledWith(
      ShareAnnounceDialog,
      expect.objectContaining({
        data: expect.objectContaining({
          intent: 'event',
          eventId: 'event-1',
          eventTitle: 'Apérock',
        }),
      }),
    )
  })
})

describe('openAvailabilityNudgeDialog', () => {
  it('opens ShareAnnounceDialog with availability_nudge intent', () => {
    const dialogOpen = vi.fn().mockReturnValue({ afterClosed: () => ({ subscribe: vi.fn() }) })
    const dialog = { open: dialogOpen } as unknown as MatDialog
    const snack = { open: vi.fn() } as unknown as MatSnackBar

    openAvailabilityNudgeDialog(dialog, snack, {
      seasonId: 'season-1',
      seasonSlug: 'saison-a',
      troupeSlug: 'troupe-a',
      event: {
        id: 'event-1',
        seasonId: 'season-1',
        slug: 'event-1',
        title: 'Apérock',
        description: null,
        location: null,
        startsAt: '2026-05-12T19:00:00.000Z',
        archived: false,
        templateType: 'custom',
        roleSlots: emptyRoleSlots(),
        createdAt: '',
        updatedAt: '',
        availabilityOpenedAt: '2026-01-01T00:00:00.000Z',
      },
    })

    expect(dialogOpen).toHaveBeenCalledWith(
      ShareAnnounceDialog,
      expect.objectContaining({
        data: expect.objectContaining({
          intent: 'availability_nudge',
          eventId: 'event-1',
        }),
      }),
    )
  })
})
