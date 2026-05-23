import { ComponentFixture, TestBed } from '@angular/core/testing'
import { WritableSignal } from '@angular/core'
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router'
import { BehaviorSubject } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { EventApiService, type EventResponse } from '../../core/events/event-api.service'
import { SeasonApiService } from '../../core/seasons/season-api.service'
import { EventDetailPlaceholder } from './event-detail-placeholder'
import { emptyRoleSlots } from '../../core/events/event-types'

type EventDetailHarness = {
  event: WritableSignal<EventResponse | null>
  formatStart(iso: string): string
}

function ev(id: string, startsAt = '2026-05-12T19:00:00.000Z'): EventResponse {
  return {
    id,
    seasonId: 'season-1',
    title: `Spectacle ${id}`,
    description: null,
    location: null,
    startsAt,
    archived: false,
    templateType: 'custom',
    roleSlots: emptyRoleSlots(),
    createdAt: '',
    updatedAt: '',
  }
}

function page(content: EventResponse[], pageNumber: number, totalElements: number) {
  return {
    ok: true,
    status: 200,
    data: {
      content,
      page: pageNumber,
      size: 100,
      totalElements,
      totalPages: Math.ceil(totalElements / 100),
    },
  }
}

describe('EventDetailPlaceholder', () => {
  let fixture: ComponentFixture<EventDetailPlaceholder>
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>
  let listEvents: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ slug: 'season-a', eventId: 'event-2' }))
    listEvents = vi.fn()

    await TestBed.configureTestingModule({
      imports: [EventDetailPlaceholder],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
        { provide: AuthApiService, useValue: { ensureHatcastSession: vi.fn().mockResolvedValue({ ok: true }) } },
        {
          provide: SeasonApiService,
          useValue: {
            listTroupes: vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              data: [{ id: 'troupe-1', name: 'Troupe', slug: 'troupe' }],
            }),
            getSeasonBySlug: vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              data: {
                id: 'season-1',
                troupeId: 'troupe-1',
                slug: 'season-a',
                title: 'Saison',
                description: null,
                startDate: null,
                endDate: null,
                archived: false,
                active: true,
                eventCount: 2,
                participantCount: 0,
                createdAt: '',
                updatedAt: '',
              },
            }),
          },
        },
        { provide: EventApiService, useValue: { listEvents } },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(EventDetailPlaceholder)
  })

  it('finds an event beyond the first detail page', async () => {
    listEvents.mockImplementation((_seasonId: string, pageNumber: number) =>
      Promise.resolve(
        page(pageNumber === 0 ? [ev('event-1')] : [ev('event-2')], pageNumber, 101),
      ),
    )

    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(listEvents).toHaveBeenCalledTimes(2)
    })

    expect(listEvents).toHaveBeenNthCalledWith(1, 'season-1', 0, 100, 'all')
    expect(listEvents).toHaveBeenNthCalledWith(2, 'season-1', 1, 100, 'all')
    expect((fixture.componentInstance as unknown as EventDetailHarness).event()?.id).toBe('event-2')
  })

  it('reloads when the event id route parameter changes', async () => {
    listEvents.mockResolvedValue(page([ev('event-2'), ev('event-3')], 0, 2))

    fixture.detectChanges()
    await vi.waitFor(() => {
      expect((fixture.componentInstance as unknown as EventDetailHarness).event()?.id).toBe('event-2')
    })

    paramMap$.next(convertToParamMap({ slug: 'season-a', eventId: 'event-3' }))

    await vi.waitFor(() => {
      expect((fixture.componentInstance as unknown as EventDetailHarness).event()?.id).toBe('event-3')
    })
  })

  it('formats dates in the Paris timezone', () => {
    const formatted = (fixture.componentInstance as unknown as EventDetailHarness).formatStart(
      '2026-05-31T22:30:00.000Z',
    )

    expect(formatted).toContain('1 juin 2026')
  })
})
