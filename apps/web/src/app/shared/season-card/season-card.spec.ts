import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { describe, expect, it } from 'vitest'

import { SeasonCard } from './season-card'

describe('SeasonCard', () => {
  async function setup(
    inputs: {
      title?: string
      slug?: string
      startDate?: string | null
      endDate?: string | null
      eventCount?: number
      participantCount?: number
      archived?: boolean
    } = {},
  ) {
    await TestBed.configureTestingModule({
      imports: [SeasonCard],
      providers: [provideRouter([])],
    }).compileComponents()

    const fixture = TestBed.createComponent(SeasonCard)
    fixture.componentRef.setInput('title', inputs.title ?? 'Saison 2025')
    fixture.componentRef.setInput('slug', inputs.slug ?? '2025-26')
    fixture.componentRef.setInput('eventCount', inputs.eventCount ?? 2)
    fixture.componentRef.setInput('participantCount', inputs.participantCount ?? 8)
    if (inputs.startDate !== undefined) {
      fixture.componentRef.setInput('startDate', inputs.startDate)
    }
    if (inputs.endDate !== undefined) {
      fixture.componentRef.setInput('endDate', inputs.endDate)
    }
    if (inputs.archived !== undefined) {
      fixture.componentRef.setInput('archived', inputs.archived)
    }
    fixture.detectChanges()
    return fixture
  }

  it('links the full card surface to saison workspace', async () => {
    const fixture = await setup({ slug: '2025-26' })
    const link = fixture.nativeElement.querySelector(
      'a.season-card__surface',
    ) as HTMLAnchorElement
    expect(link).toBeTruthy()
    expect(link.getAttribute('href')).toBe('/saison/2025-26')
    expect(link.getAttribute('aria-label')).toBe('Ouvrir Saison 2025')
    expect(fixture.nativeElement.querySelector('a[mat-flat-button]')).toBeNull()
  })

  it('shows period line when dates are set', async () => {
    const fixture = await setup({
      startDate: '2025-09-01',
      endDate: '2026-06-30',
    })
    const period = fixture.nativeElement.querySelector('.season-card__period')
    expect(period?.textContent).toMatch(/2025/)
    expect(period?.textContent).toMatch(/2026/)
  })
})
