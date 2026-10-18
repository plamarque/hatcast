import { TestBed } from '@angular/core/testing'
import { BreakpointObserver } from '@angular/cdk/layout'
import { MatBottomSheet } from '@angular/material/bottom-sheet'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { of } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

import { CompositionApiService } from '../../core/composition/composition-api.service'
import { ProductAnalyticsService } from '../../core/analytics/product-analytics.service'
import { CompositionOverlayGateService } from './composition-overlay-gate.service'
import { ChanceBreakdownService } from './chance-breakdown.service'

const breakdown = {
  participantId: 'participant-private',
  roleKey: 'player',
  displayName: 'Private name',
  chancePercent: 50,
  referencePercent: 50,
  adjustments: [],
}

type BreakdownResult =
  | { ok: true; data: typeof breakdown }
  | { ok: false; errorMessage?: string }

async function setup(
  desktop: boolean,
  result: BreakdownResult = { ok: true, data: breakdown },
) {
  const getChanceBreakdown = vi.fn().mockResolvedValue(result)
  const dialogOpen = vi.fn().mockReturnValue({ afterClosed: () => of(undefined) })
  const sheetOpen = vi.fn().mockReturnValue({ afterDismissed: () => of(undefined) })
  const captureChanceBreakdownOpened = vi.fn()
  const snackOpen = vi.fn()

  await TestBed.configureTestingModule({
    providers: [
      ChanceBreakdownService,
      { provide: BreakpointObserver, useValue: { isMatched: () => desktop } },
      { provide: CompositionApiService, useValue: { getChanceBreakdown } },
      { provide: MatDialog, useValue: { open: dialogOpen } },
      { provide: MatBottomSheet, useValue: { open: sheetOpen } },
      { provide: MatSnackBar, useValue: { open: snackOpen } },
      { provide: ProductAnalyticsService, useValue: { captureChanceBreakdownOpened } },
    ],
  }).compileComponents()

  return {
    service: TestBed.inject(ChanceBreakdownService),
    gate: TestBed.inject(CompositionOverlayGateService),
    getChanceBreakdown,
    dialogOpen,
    sheetOpen,
    captureChanceBreakdownOpened,
    snackOpen,
  }
}

const context = {
  seasonId: 'season-1',
  eventId: 'event-1',
  roleKey: 'player',
  participantId: 'participant-private',
  formulaId: 'formula-private',
  viewerParticipantIds: ['viewer-private'],
  analyticsContext: {
    event_id: 'event-1',
    season_id: 'season-1',
    troupe_id: 'troupe-1',
    is_demo_troupe: false,
    actor_scope: 'event_organizer' as const,
  },
  entryPoint: 'equipe_draw_step' as const,
}

describe('ChanceBreakdownService', () => {
  it.each([
    [false, 'bottom_sheet', 'sheetOpen'],
    [true, 'dialog', 'dialogOpen'],
  ] as const)('captures once after the successful %s overlay opens', async (desktop, presentation, overlay) => {
    const harness = await setup(desktop)

    await harness.service.open(context)

    expect(harness[overlay]).toHaveBeenCalledTimes(1)
    expect(harness.captureChanceBreakdownOpened).toHaveBeenCalledTimes(1)
    expect(harness.captureChanceBreakdownOpened).toHaveBeenCalledWith(context.analyticsContext, {
      entry_point: 'equipe_draw_step',
      presentation,
    })
    expect(harness.captureChanceBreakdownOpened.mock.calls[0][0]).not.toHaveProperty('participantId')
  })

  it('does not capture when the breakdown API fails', async () => {
    const harness = await setup(false, { ok: false, errorMessage: 'No access' })

    await harness.service.open(context)

    expect(harness.sheetOpen).not.toHaveBeenCalled()
    expect(harness.captureChanceBreakdownOpened).not.toHaveBeenCalled()
    expect(harness.snackOpen).toHaveBeenCalled()
  })

  it('does not capture when the overlay gate refuses the opening', async () => {
    const harness = await setup(false)
    expect(harness.gate.tryAcquireBreakdown()).toBe(true)

    await harness.service.open(context)

    expect(harness.getChanceBreakdown).not.toHaveBeenCalled()
    expect(harness.sheetOpen).not.toHaveBeenCalled()
    expect(harness.captureChanceBreakdownOpened).not.toHaveBeenCalled()
    harness.gate.release()
  })

  it('keeps the opened overlay usable if analytics capture fails', async () => {
    const harness = await setup(false)
    harness.captureChanceBreakdownOpened.mockImplementation(() => { throw new Error('analytics') })

    await expect(harness.service.open(context)).resolves.toBeUndefined()
    expect(harness.sheetOpen).toHaveBeenCalledTimes(1)
  })
})
