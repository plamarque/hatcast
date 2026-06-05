import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
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
    slug: 'event-1',
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
  let updateSlotParticipation: ReturnType<typeof vi.fn>
  let restoreDeclinedParticipant: ReturnType<typeof vi.fn>
  let dialogOpen: ReturnType<typeof vi.fn>
  let snackOpen: ReturnType<typeof vi.fn>
  let dialogAfterClosed: Subject<
    | { participantId: string }
    | { status: string; note?: string | null }
    | boolean
    | undefined
  >

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
    updateSlotParticipation = vi.fn()
    restoreDeclinedParticipant = vi.fn()
    dialogAfterClosed = new Subject<
      | { participantId: string }
      | { status: string; note?: string | null }
      | boolean
      | undefined
    >()
    dialogOpen = vi.fn().mockReturnValue({
      componentInstance: {
        updateState: vi.fn(),
      },
      afterClosed: () => dialogAfterClosed.asObservable(),
      close: vi.fn(),
    })
    snackOpen = vi.fn()

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
            updateSlotParticipation,
            restoreDeclinedParticipant,
          },
        },
        { provide: MatDialog, useValue: { open: dialogOpen } },
        { provide: MatSnackBar, useValue: { open: snackOpen } },
      ],
    }).compileComponents()

    TestBed.overrideProvider(MatDialog, { useValue: { open: dialogOpen } })
    TestBed.overrideProvider(MatSnackBar, { useValue: { open: snackOpen } })

    fixture = TestBed.createComponent(EventEquipeTab)
    fixture.componentRef.setInput('seasonId', 'season-1')
    fixture.componentRef.setInput('seasonSlug', 'saison-test')
    fixture.componentRef.setInput('troupeSlug', 'troupe-test')
    fixture.componentRef.setInput('troupeId', 'troupe-1')
    fixture.componentRef.setInput('event', ev())
    fixture.componentRef.setInput('canManageComposition', false)
  })

  it('shows empty state when member has no visible slots', async () => {
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Aucun tirage pour le moment')
    })
  })

  it('lists composition slots in V1 draw order (priority, not display order)', async () => {
    fixture.componentRef.setInput(
      'event',
      ev({
        templateType: 'cabaret',
        roleSlots: { ...emptyRoleSlots(), player: 2, mc: 1, dj: 1 },
      }),
    )
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: null,
        visibility: 'organizerDraft',
        slots: [],
      },
    })
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelectorAll('.event-equipe-tab__row').length).toBe(4)
    })

    const roleEmojis = [
      ...fixture.nativeElement.querySelectorAll('.event-equipe-tab__role'),
    ].map((el: Element) => el.textContent?.trim())
    expect(roleEmojis).toEqual(['🎧', '🎤', '🎭', '🎭'])
  })

  it('shows composition draft banner for organizer unvalidated draft', async () => {
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
        'Composition en brouillon',
      )
    })
    expect(fixture.nativeElement.textContent).toContain('Alice')
    expect(fixture.nativeElement.textContent).toContain('Valider')
    expect(fixture.nativeElement.querySelector('.event-equipe-tab__publish')).toBeNull()
  })

  it('shows draft banner for organizer when publishedAt is set but not validated', async () => {
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
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Composition en brouillon')
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
          {
            roleKey: 'player',
            slotIndex: 1,
            participantId: 'p-2',
            participantDisplayName: 'Bob',
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
          {
            roleKey: 'player',
            slotIndex: 1,
            participantId: 'p-2',
            participantDisplayName: 'Bob',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelectorAll('.event-equipe-tab__clear').length).toBe(2)
    })

    const rowsBefore = Array.from(
      fixture.nativeElement.querySelectorAll('.event-equipe-tab__row'),
    ) as HTMLElement[]
    expect(rowsBefore[0].classList.contains('event-equipe-tab__row--pending')).toBe(true)
    expect(rowsBefore[1].classList.contains('event-equipe-tab__row--pending')).toBe(true)

    const clearBtn = rowsBefore[0].querySelector('.event-equipe-tab__clear') as HTMLButtonElement
    clearBtn.click()

    await vi.waitFor(() => {
      expect(assignCompositionSlot).toHaveBeenCalledWith(
        'season-1',
        'event-1',
        'player',
        0,
        null,
      )
    })
    fixture.detectChanges()

    const rowsAfter = Array.from(
      fixture.nativeElement.querySelectorAll('.event-equipe-tab__row'),
    ) as HTMLElement[]
    expect(rowsAfter[0].classList.contains('event-equipe-tab__row--pending')).toBe(false)
    expect(rowsAfter[0].classList.contains('event-equipe-tab__row--empty')).toBe(true)
    expect(rowsAfter[0].classList.contains('event-equipe-tab__row--filled')).toBe(false)
    expect(rowsAfter[1].classList.contains('event-equipe-tab__row--pending')).toBe(true)
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
    expect(fixture.nativeElement.querySelector('.event-equipe-tab__clear')).toBeNull()
    expect(fixture.nativeElement.textContent).toContain('Déverrouiller')
    expect(fixture.nativeElement.querySelector('.event-equipe-tab__validate')).toBeNull()
    expect(fixture.nativeElement.querySelector('.event-equipe-tab__slot-button')).not.toBeNull()
  })

  it('lets organizer open participation modal on own slot when locked', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        viewerParticipantIds: ['p-organizer'],
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-organizer',
            participantDisplayName: 'Organisateur',
            participationStatus: 'pending',
          },
          {
            roleKey: 'player',
            slotIndex: 1,
            participantId: 'p-other',
            participantDisplayName: 'Autre',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Organisateur')
    })

    const rows = fixture.nativeElement.querySelectorAll('.event-equipe-tab__row') as NodeListOf<HTMLElement>
    const ownRow = [...rows].find((row) => row.textContent?.includes('Organisateur'))
    expect(ownRow).toBeDefined()
    const ownBtn = ownRow!.querySelector('.event-equipe-tab__slot-button') as HTMLButtonElement
    ownBtn.click()
    fixture.detectChanges()
    expect(dialogOpen).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: expect.objectContaining({
          mode: 'self',
        }),
      }),
    )
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
    expect(
      fixture.nativeElement.textContent,
    ).not.toContain('Proposition automatique selon les dispos')
  })

  it('puts Partager in overflow menu for organizer draft with validate', async () => {
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
            participantDisplayName: 'ShareMe',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(
        fixture.nativeElement.querySelector('[data-testid="composition-actions-overflow"]'),
      ).not.toBeNull()
    })
    expect(fixture.nativeElement.textContent).not.toContain('Partager')
    expect(fixture.nativeElement.textContent).not.toContain('Annoncer la compo')

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
            participantDisplayName: 'ShareMe',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.componentInstance['composition'].set({
      publishedAt: null,
      validatedAt: '2026-01-01T00:00:00.000Z',
      visibility: 'validated',
      slots: [
        {
          roleKey: 'player',
          slotIndex: 0,
          participantId: 'p-1',
          participantDisplayName: 'ShareMe',
          participationStatus: 'pending',
        },
      ],
    })
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).not.toContain('Partager')
    expect(fixture.nativeElement.textContent).toContain('Annoncer la compo')
  })

  it('hides Partager and Annoncer for member', async () => {
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
            participantDisplayName: 'Hidden',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).not.toContain('Partager')
      expect(fixture.nativeElement.textContent).not.toContain('Annoncer la compo')
    })
  })

  it('opens share dialog when Partager is clicked from overflow menu', async () => {
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
      expect(
        fixture.nativeElement.querySelector('[data-testid="composition-actions-overflow"]'),
      ).not.toBeNull()
    })

    const overflowBtn = fixture.nativeElement.querySelector(
      '[data-testid="composition-actions-overflow"]',
    ) as HTMLButtonElement
    overflowBtn.click()
    fixture.detectChanges()

    const shareItem = document.querySelector(
      '[data-testid="composition-action-share"]',
    ) as HTMLButtonElement
    expect(shareItem).not.toBeNull()
    shareItem.click()

    expect(dialogOpen).toHaveBeenCalled()
    const [, config] = dialogOpen.mock.calls.at(-1) ?? []
    expect((config as { data?: { intent?: string } }).data?.intent).toBe('draw')
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

  it('opens participation modal on own slot when locked for member', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        viewerParticipantIds: ['p-me'],
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-me',
            participantDisplayName: 'Moi',
            participationStatus: 'pending',
          },
          {
            roleKey: 'player',
            slotIndex: 1,
            participantId: 'p-other',
            participantDisplayName: 'Autre',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Moi')
    })

    const slotBtn = fixture.nativeElement.querySelector(
      '.event-equipe-tab__row--participation .event-equipe-tab__slot-button',
    ) as HTMLButtonElement
    expect(slotBtn).not.toBeNull()
    slotBtn.click()
    fixture.detectChanges()

    expect(dialogOpen).toHaveBeenCalled()
  })

  it('auto-opens participation modal when showConfirmPending and own assigned slot', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        viewerParticipantIds: ['p-me'],
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-me',
            participantDisplayName: 'Moi',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.componentRef.setInput('showConfirmPending', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(dialogOpen).toHaveBeenCalled()
    })
  })

  it('auto-opens participation modal when showConfirmPending and own confirmed slot', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        viewerParticipantIds: ['p-me'],
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-me',
            participantDisplayName: 'Moi',
            participationStatus: 'confirmed',
          },
        ],
      },
    })
    fixture.componentRef.setInput('showConfirmPending', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(dialogOpen).toHaveBeenCalled()
    })
  })

  it('opens proxy participation modal when organizer taps foreign locked slot', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        viewerParticipantIds: ['p-organizer'],
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-organizer',
            participantDisplayName: 'Organisateur',
            participationStatus: 'pending',
          },
          {
            roleKey: 'player',
            slotIndex: 1,
            participantId: 'p-other',
            participantDisplayName: 'Autre membre',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Autre membre')
    })

    const rows = fixture.nativeElement.querySelectorAll('.event-equipe-tab__row') as NodeListOf<HTMLElement>
    const foreignRow = [...rows].find((row) => row.textContent?.includes('Autre membre'))
    expect(foreignRow).toBeDefined()
    const foreignBtn = foreignRow!.querySelector('.event-equipe-tab__slot-button') as HTMLButtonElement
    foreignBtn.click()
    fixture.detectChanges()

    expect(dialogOpen).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: expect.objectContaining({
          mode: 'proxy',
          assigneeDisplayName: 'Autre membre',
        }),
      }),
    )
  })

  it('shows proxy decline confirm copy referencing assignee name', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        viewerParticipantIds: ['p-organizer'],
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-organizer',
            participantDisplayName: 'Organisateur',
            participationStatus: 'pending',
          },
          {
            roleKey: 'player',
            slotIndex: 1,
            participantId: 'p-other',
            participantDisplayName: 'Autre membre',
            participationStatus: 'pending',
          },
        ],
      },
    })
    updateSlotParticipation.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        viewerParticipantIds: ['p-organizer'],
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-organizer',
            participantDisplayName: 'Organisateur',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Autre membre')
    })

    const rows = fixture.nativeElement.querySelectorAll('.event-equipe-tab__row') as NodeListOf<HTMLElement>
    const foreignRow = [...rows].find((row) => row.textContent?.includes('Autre membre'))
    const foreignBtn = foreignRow!.querySelector('.event-equipe-tab__slot-button') as HTMLButtonElement
    foreignBtn.click()
    fixture.detectChanges()

    dialogAfterClosed.next({ status: 'declined' })
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(dialogOpen).toHaveBeenCalledTimes(2)
    })
    const confirmCall = dialogOpen.mock.calls[1]
    expect(confirmCall[1]).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          message: 'Confirmer le désistement de Autre membre pour ce rôle ?',
        }),
      }),
    )

    dialogAfterClosed.next(true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(updateSlotParticipation).toHaveBeenCalledWith(
        'season-1',
        'event-1',
        'player',
        1,
        'declined',
        undefined,
      )
    })
  })

  it('shows feedback when tapping another participant slot', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        viewerParticipantIds: ['p-me'],
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-me',
            participantDisplayName: 'Moi',
            participationStatus: 'pending',
          },
          {
            roleKey: 'player',
            slotIndex: 1,
            participantId: 'p-other',
            participantDisplayName: 'Autre',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Autre')
    })

    const readonlyBtn = fixture.nativeElement.querySelector(
      '.event-equipe-tab__slot-button--readonly',
    ) as HTMLButtonElement
    readonlyBtn.click()
    fixture.detectChanges()

    expect(snackOpen).toHaveBeenCalledWith(
      'Vous ne pouvez confirmer que votre propre participation.',
      'OK',
      { duration: 4000 },
    )
  })

  it('shows declined badge and toggles list', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        slots: [],
        declines: [
          {
            id: 'decline-1',
            participantId: 'p-1',
            participantDisplayName: 'Alice',
            roleKey: 'player',
            slotIndex: 0,
            declinedAt: '2026-01-02T00:00:00.000Z',
          },
        ],
      },
    })
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('1 personne a décliné')
    })

    const badge = fixture.nativeElement.querySelector(
      '.event-equipe-tab__declines-badge',
    ) as HTMLButtonElement
    badge.click()
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Personnes ayant décliné')
    expect(fixture.nativeElement.textContent).toContain('Alice')
    expect(
      fixture.nativeElement.querySelector('.event-equipe-tab__row--declined'),
    ).not.toBeNull()
  })

  it('applies confirmed row styling class', async () => {
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
            participantDisplayName: 'Confirmé',
            participationStatus: 'confirmed',
          },
        ],
      },
    })
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(
        fixture.nativeElement.querySelector('.event-equipe-tab__row--confirmed'),
      ).not.toBeNull()
    })
  })

  it('submits participation and emits compositionPublished', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        viewerParticipantIds: ['p-me'],
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-me',
            participantDisplayName: 'Moi',
            participationStatus: 'pending',
          },
        ],
      },
    })
    updateSlotParticipation.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        viewerParticipantIds: ['p-me'],
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-me',
            participantDisplayName: 'Moi',
            participationStatus: 'confirmed',
          },
        ],
      },
    })
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.event-equipe-tab__slot-button')).not.toBeNull()
    })

    const emitted = vi.fn()
    fixture.componentInstance.compositionPublished.subscribe(emitted)

    const slotBtn = fixture.nativeElement.querySelector(
      '.event-equipe-tab__slot-button',
    ) as HTMLButtonElement
    slotBtn.click()
    fixture.detectChanges()

    dialogAfterClosed.next({ status: 'confirmed' })
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(updateSlotParticipation).toHaveBeenCalledWith(
        'season-1',
        'event-1',
        'player',
        0,
        'confirmed',
        undefined,
      )
      expect(emitted).toHaveBeenCalled()
    })
  })

  it('shows Confirmations en cours guideline on validated pending composition', async () => {
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
      expect(fixture.nativeElement.textContent).toContain('Confirmations :')
      expect(fixture.nativeElement.querySelector('.composition-equipe-status__badge')).toBeNull()
    })
  })

  it('shows Compléter and calls fillEmpty draw when locked with empty slot', async () => {
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
            participantDisplayName: 'Occupé',
            participationStatus: 'pending',
          },
        ],
      },
    })
    drawComposition.mockResolvedValue({
      ok: true,
      data: {
        composition: {
          publishedAt: null,
          validatedAt: '2026-01-01T00:00:00.000Z',
          visibility: 'validated',
          slots: [
            {
              roleKey: 'player',
              slotIndex: 0,
              participantId: 'p-1',
              participantDisplayName: 'Occupé',
              participationStatus: 'pending',
            },
            {
              roleKey: 'player',
              slotIndex: 1,
              participantId: 'p-2',
              participantDisplayName: 'Nouveau',
              participationStatus: 'pending',
            },
          ],
        },
        steps: [],
      },
    })
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Compléter')
    })

    const fillBtn = fixture.nativeElement.querySelector(
      '.event-equipe-tab__fill',
    ) as HTMLButtonElement
    fillBtn.click()
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(drawComposition).toHaveBeenCalledWith('season-1', 'event-1', 'fillEmpty')
    })
  })

  it('opens picker on empty locked slot and keeps participation modal on filled slot', async () => {
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
            participantId: 'p-filled',
            participantDisplayName: 'Rempli',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.event-equipe-tab__row--gap-empty')).not.toBeNull()
    })

    const gapBtn = fixture.nativeElement.querySelector(
      '.event-equipe-tab__row--gap-empty .event-equipe-tab__slot-button',
    ) as HTMLButtonElement
    gapBtn.click()
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getCompositionCandidates).toHaveBeenCalled()
      expect(dialogOpen).toHaveBeenCalled()
    })

    dialogOpen.mockClear()
    getCompositionCandidates.mockClear()

    const filledBtn = fixture.nativeElement.querySelector(
      '.event-equipe-tab__row--filled .event-equipe-tab__slot-button',
    ) as HTMLButtonElement
    filledBtn.click()
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(dialogOpen).toHaveBeenCalled()
      expect(getCompositionCandidates).not.toHaveBeenCalled()
      const lastCall = dialogOpen.mock.calls.at(-1)?.[1] as { data?: { mode?: string } } | undefined
      expect(lastCall?.data?.mode).toBe('proxy')
    })
  })

  it('shows restore control only for organizer when empty role slot exists', async () => {
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
            participantDisplayName: 'Occupé',
            participationStatus: 'pending',
          },
        ],
        declines: [
          {
            id: 'decline-restore',
            participantId: 'p-declined',
            participantDisplayName: 'Décliné',
            roleKey: 'player',
            slotIndex: 1,
            declinedAt: '2026-01-02T00:00:00.000Z',
          },
        ],
      },
    })
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('1 personne a décliné')
    })

    const badge = fixture.nativeElement.querySelector(
      '.event-equipe-tab__declines-badge',
    ) as HTMLButtonElement
    badge.click()
    fixture.detectChanges()

    expect(
      fixture.nativeElement.querySelector('.event-equipe-tab__declines-restore'),
    ).not.toBeNull()
    expect(fixture.nativeElement.textContent).toContain('(ne comptent pas dans la composition)')

    fixture.componentRef.setInput('canManageComposition', false)
    fixture.detectChanges()

    expect(
      fixture.nativeElement.querySelector('.event-equipe-tab__declines-restore'),
    ).toBeNull()
  })

  it('shows tab busy overlay while validating', async () => {
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
            participantDisplayName: 'Busy',
            participationStatus: 'pending',
          },
        ],
      },
    })
    let resolveValidate!: (value: unknown) => void
    validateComposition.mockReturnValue(
      new Promise((resolve) => {
        resolveValidate = resolve
      }),
    )
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Valider')
    })

    const btn = fixture.nativeElement.querySelector('.event-equipe-tab__validate') as HTMLButtonElement
    btn.click()
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.event-equipe-tab__busy-overlay')).not.toBeNull()
      expect(fixture.nativeElement.querySelector('.event-equipe-tab')?.getAttribute('aria-busy')).toBe(
        'true',
      )
    })

    resolveValidate({
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
            participantDisplayName: 'Busy',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.event-equipe-tab__busy-overlay')).toBeNull()
    })
  })

  it('styles unlock as Material outlined button while announce is primary', async () => {
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
            participantDisplayName: 'Locked',
            participationStatus: 'pending',
          },
          {
            roleKey: 'player',
            slotIndex: 1,
            participantId: 'p-2',
            participantDisplayName: 'Autre',
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

    const unlockBtn = fixture.nativeElement.querySelector(
      '.event-equipe-tab__unlock',
    ) as HTMLButtonElement
    expect(unlockBtn.classList.contains('mat-mdc-outlined-button')).toBe(true)

    const announcePrimary = fixture.nativeElement.querySelector(
      '[data-testid="composition-action-primary"][data-action="announce"]',
    ) as HTMLButtonElement
    expect(announcePrimary).not.toBeNull()
    expect(announcePrimary.classList.contains('mat-mdc-unelevated-button')).toBe(true)
  })

  it('uses Material filled button for primary validate on draft', async () => {
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
    })

    const validateBtn = fixture.nativeElement.querySelector(
      '[data-testid="composition-action-primary"][data-action="validate"]',
    ) as HTMLButtonElement
    expect(validateBtn.classList.contains('mat-mdc-unelevated-button')).toBe(true)

    const drawBtn = fixture.nativeElement.querySelector(
      '[data-testid="composition-action-draw"]',
    ) as HTMLButtonElement
    expect(drawBtn.classList.contains('mat-mdc-outlined-button')).toBe(true)

    expect(
      fixture.nativeElement.querySelector('[data-testid="composition-actions-toolbar"]'),
    ).not.toBeNull()
  })

  it('uses Material filled button for empty composition draw primary', async () => {
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Tirer au sort')
    })

    const drawBtn = fixture.nativeElement.querySelector(
      '[data-testid="composition-action-primary"][data-action="draw"]',
    ) as HTMLButtonElement
    expect(drawBtn.classList.contains('mat-mdc-unelevated-button')).toBe(true)
  })

  it('omits validate CTA from status hint when actions lead is shown', async () => {
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
      expect(fixture.nativeElement.textContent).toContain(
        'Prêt ? Validez pour rendre la composition visible',
      )
    })

    const guideline = fixture.nativeElement.querySelector(
      '.event-equipe-tab__slots-guideline',
    ) as HTMLElement
    expect(guideline.textContent).toContain('En préparation')
    expect(guideline.textContent).not.toContain('Valider')
  })

  it('shows draw preparing panel while HTTP request is in flight', async () => {
    let resolveDraw!: (value: unknown) => void
    drawComposition.mockReturnValue(
      new Promise((resolve) => {
        resolveDraw = resolve
      }),
    )
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Tirer au sort')
    })

    const drawBtn = fixture.nativeElement.querySelector('.event-equipe-tab__draw') as HTMLButtonElement
    drawBtn.click()
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(drawComposition).toHaveBeenCalled()
      expect(fixture.nativeElement.querySelector('.event-equipe-tab__busy-overlay')).toBeNull()
      expect(fixture.nativeElement.textContent).toContain('Nous préparons le tirage au sort')
    })

    resolveDraw({
      ok: true,
      data: {
        composition: { publishedAt: null, validatedAt: null, visibility: 'organizerDraft', slots: [] },
        steps: [],
      },
    })
    fixture.detectChanges()
  })

  it('does not show busy overlay during draw animation', async () => {
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
              participantId: 'p-drawn',
              participantDisplayName: 'Drawn',
              participationStatus: 'pending',
            },
          ],
        },
        steps: [
          {
            roleKey: 'player',
            slotIndex: 0,
            candidates: [{ participantId: 'p-drawn', displayName: 'Drawn', chancePercent: 100, weight: 1 }],
            selectedParticipantId: 'p-drawn',
            randomValue: 0.5,
            totalWeight: 1,
          },
        ],
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
      expect(drawComposition).toHaveBeenCalled()
      expect(fixture.nativeElement.querySelector('app-composition-draw-animation')).not.toBeNull()
      expect(fixture.nativeElement.querySelector('.event-equipe-tab__busy-overlay')).toBeNull()
      expect(fixture.nativeElement.querySelector('.event-equipe-tab')?.getAttribute('aria-busy')).not.toBe(
        'true',
      )
    })
  })

  it('reveals slot in grid when a draw step animation finishes', async () => {
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
              participantId: 'p-drawn',
              participantDisplayName: 'Drawn',
              participationStatus: 'pending',
            },
          ],
        },
        steps: [
          {
            roleKey: 'player',
            slotIndex: 0,
            candidates: [{ participantId: 'p-drawn', displayName: 'Drawn', chancePercent: 100, weight: 1 }],
            selectedParticipantId: 'p-drawn',
            randomValue: 0.5,
            totalWeight: 1,
          },
        ],
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
      expect(drawComposition).toHaveBeenCalled()
    })

    expect(fixture.nativeElement.textContent).not.toContain('Drawn')

    ;(fixture.componentInstance as unknown as { onDrawStepFinished(): void }).onDrawStepFinished()
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Drawn')
    })
  })

  it('does not refetch composition after draw animation completes', async () => {
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
              participantId: 'p-drawn',
              participantDisplayName: 'Drawn',
              participationStatus: 'pending',
            },
          ],
        },
        steps: [
          {
            roleKey: 'player',
            slotIndex: 0,
            candidates: [],
            selectedParticipantId: 'p-drawn',
            randomValue: 0.5,
            totalWeight: 1,
          },
        ],
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
      expect(drawComposition).toHaveBeenCalled()
    })

    expect(getComposition).toHaveBeenCalledTimes(1)
    getComposition.mockClear()

    ;(fixture.componentInstance as unknown as { onDrawStepFinished(): void }).onDrawStepFinished()
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Drawn')
      expect(getComposition).not.toHaveBeenCalled()
    })
  })

  it('hides Compléter and gap slot picker for member without canManageComposition', async () => {
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
            participantDisplayName: 'Occupé',
            participationStatus: 'pending',
          },
        ],
      },
    })
    fixture.componentRef.setInput('canManageComposition', false)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.event-equipe-tab__fill')).toBeNull()
      expect(fixture.nativeElement.querySelector('.event-equipe-tab__row--gap-empty')).toBeNull()
    })
  })
})
