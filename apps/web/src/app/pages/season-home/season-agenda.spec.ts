import { ComponentFixture, TestBed } from '@angular/core/testing'
import { describe, expect, it, vi } from 'vitest'

import { SeasonAgenda } from './season-agenda'
import type { MonthEventGroup } from './season-events.utils'
import { emptyRoleSlots } from '../../core/events/event-types'

const monthGroups: MonthEventGroup[] = [
  {
    monthKey: '2026-05',
    monthLabel: 'mai 2026',
    events: [
      {
        id: 'event-1',
        seasonId: 'season-1',
        slug: 'aperock-mai',
        title: 'Apérock Mai',
        description: null,
        location: 'Salle A',
        startsAt: '2026-05-12T19:00:00.000Z',
        archived: false,
        templateType: 'cabaret',
        roleSlots: emptyRoleSlots(),
        createdAt: '',
        updatedAt: '',
        compositionLifecycle: 'preparing',
        teamStatusBadge: {
          key: 'collecting',
          label: 'Collecte des dispos',
          tone: 'collecting',
          shortLabel: 'Collecte',
        },
        dayNumber: 12,
        dayName: 'mardi',
      },
    ],
  },
]

describe('SeasonAgenda', () => {
  let fixture: ComponentFixture<SeasonAgenda>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeasonAgenda],
    }).compileComponents()

    fixture = TestBed.createComponent(SeasonAgenda)
    fixture.componentRef.setInput('monthGroups', monthGroups)
    fixture.detectChanges()
  })

  it('emits the event id when a card is clicked', () => {
    const spy = vi.fn()
    fixture.componentInstance.eventClick.subscribe(spy)

    const card = fixture.nativeElement.querySelector('.agenda-card') as HTMLElement
    card.click()

    expect(spy).toHaveBeenCalledWith('aperock-mai')
  })

  it('emits the event slug on keyboard activation', () => {
    const spy = vi.fn()
    fixture.componentInstance.eventClick.subscribe(spy)

    const card = fixture.nativeElement.querySelector('.agenda-card') as HTMLElement
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

    expect(spy).toHaveBeenCalledWith('aperock-mai')
  })

  it('shows an equity tag badge when the event has a tag', () => {
    const withTag: MonthEventGroup[] = [
      {
        ...monthGroups[0],
        events: [
          {
            ...monthGroups[0].events[0],
            equityTag: 'deplacements',
          },
        ],
      },
    ]
    fixture.componentRef.setInput('monthGroups', withTag)
    fixture.componentRef.setInput('equityTagLabels', { deplacements: 'Dépl.' })
    fixture.detectChanges()

    const badge = fixture.nativeElement.querySelector('.agenda-card__badge--equity')
    expect(badge?.textContent?.trim()).toBe('Dépl.')
  })

  it('renders composition team status badge on agenda cards', () => {
    const badge = fixture.nativeElement.querySelector('.composition-status-badge--collecting')
    expect(badge?.textContent?.trim()).toBe('Collecte')
  })

  it('shows a read-only dispo badge when availability editing is disabled', () => {
    fixture.componentRef.setInput('canEditAvailability', false)
    fixture.detectChanges()

    const badge = fixture.nativeElement.querySelector('.agenda-card__badge--dispo')
    expect(badge?.tagName).toBe('SPAN')
    expect(badge?.textContent?.trim()).toBe('Non renseigné')
  })

  it('shows read-only dispo on history cards', () => {
    fixture.componentRef.setInput('variant', 'history')
    fixture.componentRef.setInput('canEditAvailability', true)
    fixture.detectChanges()

    const badge = fixture.nativeElement.querySelector('.agenda-card__badge--dispo')
    expect(badge?.tagName).toBe('SPAN')
  })

  it('shows in-team focus label on history cards when participantFocus is set', () => {
    const withFocus: MonthEventGroup[] = [
      {
        ...monthGroups[0],
        events: [
          {
            ...monthGroups[0].events[0],
            participantFocus: {
              availabilityStatus: 'available',
              compositionRoleKey: 'player',
              inTeam: true,
            },
          },
        ],
      },
    ]
    fixture.componentRef.setInput('monthGroups', withFocus)
    fixture.componentRef.setInput('variant', 'history')
    fixture.detectChanges()

    const badge = fixture.nativeElement.querySelector('.agenda-card__badge--dispo')
    expect(badge?.textContent?.trim()).toBe("Comédien·ne · dans l'équipe")
    const card = fixture.nativeElement.querySelector('.agenda-card') as HTMLElement
    expect(card.getAttribute('aria-label')).toContain("Comédien·ne · dans l'équipe")
  })

  it('emits availabilityClick without opening the event when the badge is clicked', () => {
    const eventSpy = vi.fn()
    const availabilitySpy = vi.fn()
    fixture.componentRef.setInput('canEditAvailability', true)
    fixture.detectChanges()
    fixture.componentInstance.eventClick.subscribe(eventSpy)
    fixture.componentInstance.availabilityClick.subscribe(availabilitySpy)

    const badge = fixture.nativeElement.querySelector('.agenda-card__badge--dispo') as HTMLElement
    badge.click()

    expect(availabilitySpy).toHaveBeenCalledWith({ eventId: 'event-1', status: 'unknown' })
    expect(eventSpy).not.toHaveBeenCalled()
  })

  it('emits availabilityClick without opening the event when the badge is activated by keyboard', () => {
    const eventSpy = vi.fn()
    const availabilitySpy = vi.fn()
    fixture.componentRef.setInput('canEditAvailability', true)
    fixture.detectChanges()
    fixture.componentInstance.eventClick.subscribe(eventSpy)
    fixture.componentInstance.availabilityClick.subscribe(availabilitySpy)

    const badge = fixture.nativeElement.querySelector('.agenda-card__badge--dispo') as HTMLElement
    badge.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    badge.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))

    expect(availabilitySpy).toHaveBeenCalledTimes(2)
    expect(availabilitySpy).toHaveBeenCalledWith({ eventId: 'event-1', status: 'unknown' })
    expect(eventSpy).not.toHaveBeenCalled()
  })

  it('keeps cards visible and disables load more while refreshing', () => {
    fixture.componentRef.setInput('loading', true)
    fixture.componentRef.setInput('truncated', true)
    fixture.componentRef.setInput('loadedEventsCount', 200)
    fixture.componentRef.setInput('totalElements', 250)
    fixture.detectChanges()

    const el = fixture.nativeElement as HTMLElement
    const button = el.querySelector('.season-agenda__notice button') as HTMLButtonElement

    expect(el.querySelector('.agenda-card')).toBeTruthy()
    expect(el.textContent).toContain('200 prochains spectacles')
    expect(button.disabled).toBe(true)
  })
})
