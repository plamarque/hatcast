import { BreakpointObserver } from '@angular/cdk/layout'
import { TestBed } from '@angular/core/testing'
import { MatBottomSheet } from '@angular/material/bottom-sheet'
import { MatDialog } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { of, NEVER } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FilterPanelService } from './filter-panel.service'

describe('FilterPanelService', () => {
  let service: FilterPanelService
  let bottomSheet: { open: ReturnType<typeof vi.fn> }
  let dialog: { open: ReturnType<typeof vi.fn> }
  let breakpointObserver: { isMatched: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    bottomSheet = {
      open: vi.fn().mockReturnValue({ afterDismissed: () => of(undefined) }),
    }
    dialog = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(undefined) }),
    }
    breakpointObserver = {
      isMatched: vi.fn().mockReturnValue(false),
    }

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        FilterPanelService,
        { provide: MatBottomSheet, useValue: bottomSheet },
        { provide: MatDialog, useValue: dialog },
        { provide: BreakpointObserver, useValue: breakpointObserver },
      ],
    })

    service = TestBed.inject(FilterPanelService)
  })

  it('opens filter hub via MatDialog on desktop breakpoint', async () => {
    breakpointObserver.isMatched.mockReturnValue(false)

    await service.openHub({ dimensions: [] })

    expect(dialog.open).toHaveBeenCalled()
    expect(bottomSheet.open).not.toHaveBeenCalled()
  })

  it('opens MatDialog on desktop breakpoint (legacy panel)', async () => {
    breakpointObserver.isMatched.mockReturnValue(false)

    await service.openPanel({
      dimensions: [],
      values: {},
      categoryGlossarySlugs: [],
      categoryLabels: {},
    })

    expect(dialog.open).toHaveBeenCalled()
  })

  it('opens filter hub via MatBottomSheet on mobile breakpoint', async () => {
    breakpointObserver.isMatched.mockReturnValue(true)

    await service.openHub({ dimensions: [] })

    expect(bottomSheet.open).toHaveBeenCalled()
    expect(dialog.open).not.toHaveBeenCalled()
  })

  it('opens participant picker sheet with capped height on mobile', async () => {
    breakpointObserver.isMatched.mockReturnValue(true)

    await service.openParticipantPicker({ options: [], selectedIds: [] })

    expect(bottomSheet.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        panelClass: 'filter-picker-sheet',
        maxHeight: 'min(28rem, 55dvh)',
      }),
    )
  })

  it('opens MatBottomSheet on mobile breakpoint (legacy panel)', async () => {
    breakpointObserver.isMatched.mockReturnValue(true)

    await service.openPanel({
      dimensions: [],
      values: {},
      categoryGlossarySlugs: [],
      categoryLabels: {},
    })

    expect(bottomSheet.open).toHaveBeenCalled()
    expect(dialog.open).not.toHaveBeenCalled()
  })

  it('ignores concurrent openPanel calls while a panel is open', async () => {
    breakpointObserver.isMatched.mockReturnValue(false)
    dialog.open.mockReturnValue({
      afterClosed: () => NEVER,
    })

    void service.openPanel({
      dimensions: [],
      values: {},
      categoryGlossarySlugs: [],
      categoryLabels: {},
    })
    await Promise.resolve()

    const second = await service.openPanel({
      dimensions: [],
      values: {},
      categoryGlossarySlugs: [],
      categoryLabels: {},
    })

    expect(second).toBeUndefined()
    expect(dialog.open).toHaveBeenCalledTimes(1)
  })
})
