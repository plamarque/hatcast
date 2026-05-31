import { ComponentFixture, TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

  it('shows a category badge when the event has a category', () => {
    const withTag: MonthEventGroup[] = [
      {
        ...monthGroups[0],
        events: [
          {
            ...monthGroups[0].events[0],
            category: 'deplacements',
          },
        ],
      },
    ]
    fixture.componentRef.setInput('monthGroups', withTag)
    fixture.componentRef.setInput('categoryLabels', { deplacements: 'Dépl.' })
    fixture.detectChanges()

    const badge = fixture.nativeElement.querySelector('.agenda-card__badge--category')
    expect(badge?.textContent?.trim()).toBe('Dépl.')
  })

  it('renders composition team status badge on agenda cards', () => {
    const badge = fixture.nativeElement.querySelector('.composition-status-badge--collecting')
    expect(badge?.textContent?.trim()).toBe('Collecte')
  })

  it('n’affiche pas le lieu sur les cartes agenda et historique', () => {
    expect(fixture.nativeElement.querySelector('.agenda-card__loc')).toBeNull()

    fixture.componentRef.setInput('variant', 'history')
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.agenda-card__loc')).toBeNull()
  })

  it('shows participation status cell when availability editing is disabled', () => {
    fixture.componentRef.setInput('canEditAvailability', false)
    fixture.detectChanges()

    const cell = fixture.nativeElement.querySelector('.participation-event-cell--neutral')
    expect(cell).toBeTruthy()
    expect(fixture.nativeElement.querySelector('.agenda-participation-status__hint')).toBeNull()
  })

  it('shows selected participation cell on history cards when participantFocus is set', () => {
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
              slotParticipationStatus: 'confirmed',
            },
          },
        ],
      },
    ]
    fixture.componentRef.setInput('monthGroups', withFocus)
    fixture.componentRef.setInput('variant', 'history')
    fixture.detectChanges()

    const cell = fixture.nativeElement.querySelector('.participation-event-cell--selected')
    expect(cell?.textContent).toContain('Comédien·ne')
    const card = fixture.nativeElement.querySelector('.agenda-card') as HTMLElement
    expect(card.getAttribute('aria-label')).toContain('Comédien·ne')
  })

  it('emits availabilityClick without opening the event when the status cell is clicked', () => {
    const eventSpy = vi.fn()
    const availabilitySpy = vi.fn()
    fixture.componentRef.setInput('canEditAvailability', true)
    fixture.detectChanges()
    fixture.componentInstance.eventClick.subscribe(eventSpy)
    fixture.componentInstance.availabilityClick.subscribe(availabilitySpy)

    const trigger = fixture.nativeElement.querySelector(
      '.agenda-participation-status__trigger',
    ) as HTMLButtonElement
    trigger.click()

    expect(availabilitySpy).toHaveBeenCalledWith({ eventId: 'event-1', status: 'unknown' })
    expect(eventSpy).not.toHaveBeenCalled()
  })

  it('does not render agenda card overflow menu when user can manage events', () => {
    fixture.componentRef.setInput('canManageEvents', true)
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector('.agenda-card__menu')).toBeNull()
    expect(fixture.nativeElement.querySelector('[aria-label="Actions spectacle"]')).toBeNull()
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
