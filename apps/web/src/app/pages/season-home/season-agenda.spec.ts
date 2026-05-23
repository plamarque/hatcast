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
        title: 'Apérock Mai',
        description: null,
        location: 'Salle A',
        startsAt: '2026-05-12T19:00:00.000Z',
        archived: false,
        templateType: 'cabaret',
        roleSlots: emptyRoleSlots(),
        createdAt: '',
        updatedAt: '',
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

    expect(spy).toHaveBeenCalledWith('event-1')
  })

  it('emits the event id on keyboard activation', () => {
    const spy = vi.fn()
    fixture.componentInstance.eventClick.subscribe(spy)

    const card = fixture.nativeElement.querySelector('.agenda-card') as HTMLElement
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

    expect(spy).toHaveBeenCalledWith('event-1')
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
