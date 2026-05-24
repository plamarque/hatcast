import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
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

    await TestBed.configureTestingModule({
      imports: [EventEquipeTab, NoopAnimationsModule],
      providers: [
        {
          provide: CompositionApiService,
          useValue: { getComposition, publishComposition },
        },
      ],
    }).compileComponents()

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
})
