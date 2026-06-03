import { TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { describe, expect, it, vi } from 'vitest'

import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { SeasonCard } from './season-card'

describe('SeasonCard', () => {
  async function setup(
    inputs: {
      title?: string
      slug?: string
      troupeSlug?: string | null
      startDate?: string | null
      endDate?: string | null
      eventCount?: number
      participantCount?: number
      archived?: boolean
    } = {},
  ) {
    const troupeContext = { selectTroupe: vi.fn() }
    await TestBed.configureTestingModule({
      imports: [SeasonCard],
      providers: [
        provideRouter([]),
        { provide: TroupeContextService, useValue: troupeContext },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(SeasonCard)
    fixture.componentRef.setInput('title', inputs.title ?? 'Saison 2025')
    fixture.componentRef.setInput('slug', inputs.slug ?? '2025-26')
    fixture.componentRef.setInput('eventCount', inputs.eventCount ?? 2)
    fixture.componentRef.setInput('participantCount', inputs.participantCount ?? 8)
    if (inputs.troupeSlug !== undefined) {
      fixture.componentRef.setInput('troupeSlug', inputs.troupeSlug)
    }
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
    return { fixture, troupeContext }
  }

  it('links the full card surface to saison workspace', async () => {
    const { fixture } = await setup({ slug: '2025-26' })
    const link = fixture.nativeElement.querySelector(
      'a.season-card__surface',
    ) as HTMLAnchorElement
    expect(link).toBeTruthy()
    expect(link.getAttribute('href')).toBe('/saison/2025-26')
    expect(link.getAttribute('aria-label')).toBe('Ouvrir Saison 2025')
    expect(fixture.nativeElement.querySelector('a[mat-flat-button]')).toBeNull()
  })

  it('scopes navigation to troupe when troupeId is set', async () => {
    const { fixture, troupeContext } = await setup({
      slug: 'saison-a',
      troupeSlug: 'troupe-demo',
    })
    const router = TestBed.inject(Router)
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true)

    const link = fixture.nativeElement.querySelector(
      'a.season-card__surface',
    ) as HTMLAnchorElement
    link.click()

    expect(troupeContext.selectTroupe).toHaveBeenCalledWith('troupe-demo')
    expect(navigate).toHaveBeenCalledWith(['/saison', 'troupe-demo', 'saison-a'])
  })

  it('shows period line when dates are set', async () => {
    const { fixture } = await setup({
      startDate: '2025-09-01',
      endDate: '2026-06-30',
    })
    const period = fixture.nativeElement.querySelector('.season-card__period')
    expect(period?.textContent).toMatch(/2025/)
    expect(period?.textContent).toMatch(/2026/)
  })
})
