import { TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'
import { AgendaEventCard } from './agenda-event-card'

const item = { eventId: 'e', eventSlug: 'e', title: 'Cabaret', startsAt: '2030-01-01T18:00:00Z', location: 'Salle', description: 'Description', seasonId: 's', seasonSlug: 's', seasonTitle: 'Saison', troupeId: 't', troupeSlug: 't', troupeName: 'Troupe', myAvailabilityStatus: 'unknown' }

describe('AgendaEventCard', () => {
  it.each([false, true])('preserves metadata and separates badge action from body navigation (featured=%s)', async featured => {
    await TestBed.configureTestingModule({ imports: [AgendaEventCard, NoopAnimationsModule] }).compileComponents()
    const fixture = TestBed.createComponent(AgendaEventCard)
    fixture.componentRef.setInput('item', item)
    fixture.componentRef.setInput('featured', featured)
    fixture.componentRef.setInput('viewerGender', 'non_specified')
    fixture.componentRef.setInput('canEditAvailability', true)
    fixture.detectChanges()
    const navigate = vi.fn()
    const availability = vi.fn()
    fixture.componentInstance.openEvent.subscribe(navigate)
    fixture.componentInstance.availabilityClick.subscribe(availability)
    fixture.nativeElement.querySelector('.agenda-participation-status__trigger').click()
    expect(availability).toHaveBeenCalledTimes(1)
    expect(navigate).not.toHaveBeenCalled()
    fixture.nativeElement.querySelector('.agenda-card__clickable').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(navigate).toHaveBeenCalledTimes(1)
    expect(fixture.nativeElement.textContent).toContain('Salle')
    expect(fixture.nativeElement.textContent).toContain('Description')
  })
})
