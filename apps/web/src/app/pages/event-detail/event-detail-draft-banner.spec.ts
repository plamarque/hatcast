import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { EventApiService, type EventResponse } from '../../core/events/event-api.service'
import { emptyRoleSlots } from '../../core/events/event-types'
import { EventDetailDraftBanner } from './event-detail-draft-banner'

function draftEvent(): EventResponse {
  return {
    id: 'ev-draft',
    seasonId: 'season-1',
    slug: 'brouillon',
    title: 'Spectacle brouillon',
    description: null,
    location: null,
    startsAt: '2031-05-01T19:00:00.000Z',
    archived: false,
    templateType: 'custom',
    roleSlots: emptyRoleSlots(),
    createdAt: '',
    updatedAt: '',
    availabilityOpenedAt: null,
  }
}

describe('EventDetailDraftBanner', () => {
  let fixture: ComponentFixture<EventDetailDraftBanner>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventDetailDraftBanner, NoopAnimationsModule],
      providers: [
        {
          provide: EventApiService,
          useValue: { openAvailability: vi.fn() },
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(EventDetailDraftBanner)
    fixture.componentRef.setInput('event', draftEvent())
    fixture.componentRef.setInput('seasonId', 'season-1')
    fixture.componentRef.setInput('seasonSlug', 'saison-a')
    fixture.componentRef.setInput('canPublish', true)
    fixture.detectChanges()
  })

  it('affiche le bandeau brouillon et le CTA publier au-dessus des onglets', () => {
    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).toContain('Brouillon')
    expect(el.textContent).toContain('Publier le spectacle')
    const btn = el.querySelector('.event-draft-banner__cta')
    expect(btn).toBeTruthy()
  })
})
