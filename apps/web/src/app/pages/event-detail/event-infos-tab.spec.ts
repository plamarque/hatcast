import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { describe, expect, it, vi } from 'vitest'

import { EventApiService, type EventResponse } from '../../core/events/event-api.service'
import { emptyRoleSlots } from '../../core/events/event-types'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { EventInfosTab } from './event-infos-tab'
import { EventEquityTagDialog } from './event-equity-tag-dialog'

function baseEvent(overrides: Partial<EventResponse> = {}): EventResponse {
  return {
    id: 'event-1',
    seasonId: 'season-1',
    slug: 'spectacle',
    title: 'Spectacle',
    description: null,
    location: null,
    startsAt: '2026-05-12T19:00:00.000Z',
    archived: false,
    templateType: 'custom',
    roleSlots: emptyRoleSlots(),
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

const glossary = [
  { slug: 'deplacements', label: 'Déplacements' },
  { slug: 'aperock', label: 'Apérock' },
]

async function setup(options: {
  canManageEvents?: boolean
  equityTag?: string | null
  updateEvent?: ReturnType<typeof vi.fn>
  dialogResult?: string | null | undefined
}) {
  const updateEvent =
    options.updateEvent ??
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: baseEvent({ equityTag: 'deplacements' }),
    })
  const listEquityTags = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: glossary,
  })
  const snackOpen = vi.fn()
  const dialogOpen = vi.fn().mockReturnValue({
    afterClosed: () => ({
      subscribe: (fn: (v: string | null | undefined) => void) => {
        fn(options.dialogResult)
      },
    }),
  })

  await TestBed.configureTestingModule({
    imports: [EventInfosTab, NoopAnimationsModule],
    providers: [
      { provide: EventApiService, useValue: { updateEvent } },
      { provide: TroupeApiService, useValue: { listEquityTags } },
      { provide: MatSnackBar, useValue: { open: snackOpen } },
      { provide: MatDialog, useValue: { open: dialogOpen } },
    ],
  }).compileComponents()
  TestBed.overrideProvider(MatDialog, { useValue: { open: dialogOpen } })

  const fixture = TestBed.createComponent(EventInfosTab)
  fixture.componentRef.setInput('event', baseEvent({ equityTag: options.equityTag ?? null }))
  fixture.componentRef.setInput('seasonId', 'season-1')
  fixture.componentRef.setInput('troupeId', 'troupe-1')
  fixture.componentRef.setInput('canManageEvents', options.canManageEvents ?? true)
  fixture.detectChanges()
  await fixture.whenStable()

  return { fixture, updateEvent, listEquityTags, snackOpen, dialogOpen }
}

describe('EventInfosTab equity tag', () => {
  it('hides the equity section when the user cannot manage and no tag is set', async () => {
    const { fixture } = await setup({ canManageEvents: false, equityTag: null })

    expect(fixture.nativeElement.querySelector('.event-infos__equity')).toBeNull()
  })

  it('shows a read-only chip when a tag is set but the user cannot manage', async () => {
    const { fixture } = await setup({ canManageEvents: false, equityTag: 'deplacements' })

    await vi.waitFor(() => {
      const chip = fixture.nativeElement.querySelector('.event-infos__equity-chip')
      expect(chip?.textContent?.trim()).toBe('Déplacements')
    })
    expect(fixture.nativeElement.querySelector('.event-infos__add-tag')).toBeNull()
  })

  it('shows add-tag control when the user can manage and no tag is set', async () => {
    const { fixture } = await setup({ canManageEvents: true, equityTag: null })

    expect(fixture.nativeElement.querySelector('.event-infos__add-tag')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('.event-infos__equity-chip')).toBeNull()
  })

  it('shows a removable chip when a tag is set', async () => {
    const { fixture } = await setup({ canManageEvents: true, equityTag: 'deplacements' })

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.event-infos__equity-chip')).toBeTruthy()
    })
  })

  it('calls updateEvent with equityTag null when removing the chip', async () => {
    const updateEvent = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: baseEvent({ equityTag: null }),
    })
    const { fixture } = await setup({ equityTag: 'deplacements', updateEvent })
    const cmp = fixture.componentInstance as unknown as { removeTag: () => void }

    cmp.removeTag()
    await vi.waitFor(() => {
      expect(updateEvent).toHaveBeenCalledWith('season-1', 'event-1', { equityTag: null })
    })
  })

  it('opens the tag dialog and persists the result', async () => {
    const updateEvent = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: baseEvent({ equityTag: 'deplacements' }),
    })
    const { fixture, dialogOpen } = await setup({
      updateEvent,
      dialogResult: 'Déplacements',
    })
    const cmp = fixture.componentInstance as unknown as { openTagDialog: () => void }

    cmp.openTagDialog()
    await vi.waitFor(() => {
      expect(dialogOpen).toHaveBeenCalledWith(
        EventEquityTagDialog,
        expect.objectContaining({
          data: expect.objectContaining({ troupeId: 'troupe-1' }),
        }),
      )
      expect(updateEvent).toHaveBeenCalledWith('season-1', 'event-1', { equityTag: 'Déplacements' })
    })
  })

  it('emits eventUpdated after a successful save from the dialog', async () => {
    const updated = baseEvent({ equityTag: 'aperock' })
    const updateEvent = vi.fn().mockResolvedValue({ ok: true, status: 200, data: updated })
    const { fixture } = await setup({ updateEvent, dialogResult: 'Apérock' })
    const spy = vi.fn()
    fixture.componentInstance.eventUpdated.subscribe(spy)
    const cmp = fixture.componentInstance as unknown as { openTagDialog: () => void }

    cmp.openTagDialog()
    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalledWith(updated)
    })
  })

  it('places the equity section after the location field', async () => {
    const { fixture } = await setup({ equityTag: 'deplacements' })
    const labels = [...fixture.nativeElement.querySelectorAll('.event-infos__label')].map(
      (el: Element) => el.textContent?.trim(),
    )
    const lieuIdx = labels.indexOf('Lieu')
    const tagIdx = labels.indexOf('Tag d’équité')
    expect(lieuIdx).toBeGreaterThanOrEqual(0)
    expect(tagIdx).toBeGreaterThan(lieuIdx)
  })
})
