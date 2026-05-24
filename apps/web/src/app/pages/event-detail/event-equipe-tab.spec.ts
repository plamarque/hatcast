import { MatDialog } from '@angular/material/dialog'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { Subject } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

import { CompositionApiService } from '../../core/composition/composition-api.service'
import { emptyRoleSlots } from '../../core/events/event-types'
import type { EventResponse } from '../../core/events/event-api.service'
import { EventEquipeTab } from './event-equipe-tab'

function ev(overrides: Partial<EventResponse> = {}): EventResponse {
  return {
    id: 'event-1',
    seasonId: 'season-1',
    title: 'Spectacle',
    description: null,
    location: null,
    startsAt: '2026-05-12T19:00:00.000Z',
    archived: false,
    templateType: 'custom',
    roleSlots: { ...emptyRoleSlots(), player: 2 },
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

describe('EventEquipeTab', () => {
  let fixture: ComponentFixture<EventEquipeTab>
  let getComposition: ReturnType<typeof vi.fn>
  let publishComposition: ReturnType<typeof vi.fn>
  let drawComposition: ReturnType<typeof vi.fn>
  let getCompositionCandidates: ReturnType<typeof vi.fn>
  let assignCompositionSlot: ReturnType<typeof vi.fn>
  let validateComposition: ReturnType<typeof vi.fn>
  let unlockComposition: ReturnType<typeof vi.fn>
  let dialogOpen: ReturnType<typeof vi.fn>
  let dialogAfterClosed: Subject<{ participantId: string } | undefined>

  beforeEach(async () => {
    getComposition = vi.fn().mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: null,
        visibility: 'none',
        slots: [],
      },
    })
    publishComposition = vi.fn()
    drawComposition = vi.fn()
    getCompositionCandidates = vi.fn().mockResolvedValue({
      ok: true,
      data: {
        roleKey: 'player',
        requiredCount: 2,
        candidates: [
          {
            participantId: 'p-2',
            displayName: 'Bob',
            chancePercent: 50,
            pastSelectionCount: 0,
          },
        ],
      },
    })
    assignCompositionSlot = vi.fn().mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: null,
        visibility: 'organizerDraft',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-2',
            participantDisplayName: 'Bob',
            participationStatus: 'pending',
          },
        ],
      },
    })
    validateComposition = vi.fn()
    unlockComposition = vi.fn()
    dialogAfterClosed = new Subject<{ participantId: string } | undefined>()
    dialogOpen = vi.fn().mockReturnValue({
      componentInstance: {
        updateState: vi.fn(),
      },
      afterClosed: () => dialogAfterClosed.asObservable(),
      close: vi.fn(),
    })

    await TestBed.configureTestingModule({
      imports: [EventEquipeTab, NoopAnimationsModule],
      providers: [
        {
          provide: CompositionApiService,
          useValue: {
            getComposition,
            publishComposition,
            drawComposition,
            getCompositionCandidates,
            assignCompositionSlot,
            validateComposition,
            unlockComposition,
          },
        },
        { provide: MatDialog, useValue: { open: dialogOpen } },
      ],
    }).compileComponents()

    TestBed.overrideProvider(MatDialog, { useValue: { open: dialogOpen } })

    fixture = TestBed.createComponent(EventEquipeTab)
    fixture.componentRef.setInput('seasonId', 'season-1')
    fixture.componentRef.setInput('event', ev())
    fixture.componentRef.setInput('canManageComposition', false)
  })

  it('shows empty state when member has no visible slots', async () => {
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Aucun tirage pour le moment')
    })
  })

  it('shows draft banner and Publier for organizer draft', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: null,
        visibility: 'organizerDraft',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participantDisplayName: 'Alice',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain(
        'Brouillon visible uniquement par les organisateur·ices',
      )
    })
    expect(fixture.nativeElement.textContent).toContain('Alice')
    expect(fixture.nativeElement.textContent).toContain('Publier')
  })

  it('shows slots without Publier for published draft member view', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: '2026-01-01T00:00:00.000Z',
        validatedAt: null,
        visibility: 'publishedDraft',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participantDisplayName: 'Bob',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Bob')
    })
    expect(fixture.nativeElement.querySelector('.event-equipe-tab__publish')).toBeNull()
  })

  it('shows Tirer au sort and dashed placeholders for organizer with empty composition', async () => {
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Tirer au sort')
    })
    expect(fixture.nativeElement.querySelector('.event-equipe-tab__placeholder')).not.toBeNull()
    expect(fixture.nativeElement.textContent).not.toContain('Aucun tirage pour le moment')
  })

  it('populates slots after draw when reduced motion is preferred', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }),
    )
    drawComposition.mockResolvedValue({
      ok: true,
      data: {
        composition: {
          publishedAt: null,
          validatedAt: null,
          visibility: 'organizerDraft',
          slots: [
            {
              roleKey: 'player',
              slotIndex: 0,
              participantId: 'p-1',
              participantDisplayName: 'Alice',
              participationStatus: 'pending',
              chancePercent: 50,
            },
          ],
        },
        steps: [],
      },
    })
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Tirer au sort')
    })

    const drawBtn = fixture.nativeElement.querySelector('.event-equipe-tab__draw') as HTMLButtonElement
    drawBtn.click()
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(drawComposition).toHaveBeenCalledWith('season-1', 'event-1', 'full')
      expect(fixture.nativeElement.textContent).toContain('Alice')
    })
    vi.unstubAllGlobals()
  })

  it('emits compositionPublished after successful publish', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: null,
        visibility: 'organizerDraft',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participantDisplayName: 'Charlie',
            participationStatus: 'pending',
          },
        ],
      },
    })
    publishComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: '2026-01-01T00:00:00.000Z',
        validatedAt: null,
        visibility: 'publishedDraft',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participantDisplayName: 'Charlie',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Publier')
    })

    const emitted = vi.fn()
    fixture.componentInstance.compositionPublished.subscribe(emitted)

    const btn = fixture.nativeElement.querySelector('.event-equipe-tab__publish') as HTMLButtonElement
    btn.click()
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(publishComposition).toHaveBeenCalledWith('season-1', 'event-1')
      expect(emitted).toHaveBeenCalled()
    })
  })

  it('opens picker and assigns on organizer slot click', async () => {
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.event-equipe-tab__slot-button')).not.toBeNull()
    })

    const slotBtn = fixture.nativeElement.querySelector(
      '.event-equipe-tab__slot-button',
    ) as HTMLButtonElement
    slotBtn.click()
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getCompositionCandidates).toHaveBeenCalledWith('season-1', 'event-1', 'player', 0)
    })

    dialogAfterClosed.next({ participantId: 'p-2' })
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(assignCompositionSlot).toHaveBeenCalledWith(
        'season-1',
        'event-1',
        'player',
        0,
        'p-2',
      )
      expect(fixture.nativeElement.textContent).toContain('Bob')
    })
  })

  it('clears slot when organizer clicks clear button', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: null,
        visibility: 'organizerDraft',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participantDisplayName: 'Alice',
            participationStatus: 'pending',
          },
        ],
      },
    })
    assignCompositionSlot.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: null,
        visibility: 'organizerDraft',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: null,
            participantDisplayName: null,
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.event-equipe-tab__clear')).not.toBeNull()
    })

    const clearBtn = fixture.nativeElement.querySelector(
      '.event-equipe-tab__clear',
    ) as HTMLButtonElement
    clearBtn.click()
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(assignCompositionSlot).toHaveBeenCalledWith(
        'season-1',
        'event-1',
        'player',
        0,
        null,
      )
    })
  })

  it('hides edit controls when composition is locked', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participantDisplayName: 'Locked Player',
            participationStatus: 'confirmed',
          },
        ],
      },
    })
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Locked Player')
    })
    expect(fixture.nativeElement.querySelector('.event-equipe-tab__slot-button')).toBeNull()
    expect(fixture.nativeElement.querySelector('.event-equipe-tab__clear')).toBeNull()
    expect(fixture.nativeElement.textContent).toContain('Déverrouiller')
    expect(fixture.nativeElement.querySelector('.event-equipe-tab__validate')).toBeNull()
  })

  it('shows Valider for organizer draft with assigned slot', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: null,
        visibility: 'organizerDraft',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participantDisplayName: 'Ready',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Valider')
      expect(fixture.nativeElement.textContent).toContain('En préparation')
    })
    expect(fixture.nativeElement.querySelector('.event-equipe-tab__unlock')).toBeNull()
  })

  it('emits compositionPublished after successful validate', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: null,
        visibility: 'organizerDraft',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participantDisplayName: 'ToValidate',
            participationStatus: 'pending',
          },
        ],
      },
    })
    validateComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participantDisplayName: 'ToValidate',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Valider')
    })

    const emitted = vi.fn()
    fixture.componentInstance.compositionPublished.subscribe(emitted)

    const btn = fixture.nativeElement.querySelector('.event-equipe-tab__validate') as HTMLButtonElement
    btn.click()
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(validateComposition).toHaveBeenCalledWith('season-1', 'event-1')
      expect(emitted).toHaveBeenCalled()
    })
  })

  it('emits compositionPublished after successful unlock', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participantDisplayName: 'ToUnlock',
            participationStatus: 'pending',
          },
        ],
      },
    })
    unlockComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: null,
        visibility: 'organizerDraft',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participantDisplayName: 'ToUnlock',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Déverrouiller')
    })

    const emitted = vi.fn()
    fixture.componentInstance.compositionPublished.subscribe(emitted)

    const btn = fixture.nativeElement.querySelector('.event-equipe-tab__unlock') as HTMLButtonElement
    btn.click()
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(unlockComposition).toHaveBeenCalledWith('season-1', 'event-1')
      expect(emitted).toHaveBeenCalled()
    })
  })

  it('shows Confirmations en cours badge on validated pending composition', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participantDisplayName: 'Pending Player',
            participationStatus: 'pending',
          },
          {
            roleKey: 'player',
            slotIndex: 1,
            participantId: 'p-2',
            participantDisplayName: 'Other',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Confirmations en cours')
    })
  })
})
