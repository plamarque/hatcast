import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { describe, expect, it } from 'vitest'

import { ContextBreadcrumb } from './context-breadcrumb'

describe('ContextBreadcrumb', () => {
  async function setup(layout: 'season' | 'event' = 'season') {
    await TestBed.configureTestingModule({
      imports: [ContextBreadcrumb],
      providers: [provideRouter([])],
    }).compileComponents()

    const fixture = TestBed.createComponent(ContextBreadcrumb)
    fixture.componentRef.setInput('troupeName', 'La Malice')
    fixture.componentRef.setInput('troupeSlug', 'la-malice')
    fixture.componentRef.setInput('seasonTitle', 'Saison 2025-26')
    fixture.componentRef.setInput('seasonSlug', 'saison-2025')
    fixture.componentRef.setInput('layout', layout)
    if (layout === 'event') {
      fixture.componentRef.setInput('eventTitle', 'Match BIM')
    }
    fixture.detectChanges()
    return fixture
  }

  it('renders desktop trail with troupe hub and saison workspace links on event layout', async () => {
    const fixture = await setup('event')
    const el = fixture.nativeElement as HTMLElement

    const troupeLink = el.querySelector(
      '.context-breadcrumb__trail--desktop a.context-breadcrumb__troupe',
    ) as HTMLAnchorElement
    expect(troupeLink.getAttribute('href')).toBe('/troupes/la-malice')

    const seasonLink = el.querySelector(
      '.context-breadcrumb__trail--desktop a.context-breadcrumb__link',
    ) as HTMLAnchorElement
    expect(seasonLink.getAttribute('href')).toBe('/saison/saison-2025')

    expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('Match BIM')
    expect(el.querySelectorAll('.context-breadcrumb__sep').length).toBeGreaterThan(0)
  })

  it('marks season title as current page on season layout', async () => {
    const fixture = await setup('season')
    const el = fixture.nativeElement as HTMLElement

    expect(el.querySelector('a.context-breadcrumb__link')).toBeNull()
    const current = el.querySelector('[aria-current="page"]')
    expect(current?.textContent).toContain('Saison 2025-26')
  })

  it('exposes mobile troupe logo link to troupe hub', async () => {
    const fixture = await setup('event')
    const el = fixture.nativeElement as HTMLElement
    const mobile = el.querySelector('.context-breadcrumb__mobile-logo') as HTMLAnchorElement
    expect(mobile).toBeTruthy()
    expect(mobile.getAttribute('href')).toBe('/troupes/la-malice')
    expect(mobile.getAttribute('aria-label')).toContain('La Malice')
    expect(mobile.getAttribute('aria-label')).toContain('Saison 2025-26')
    expect(mobile.getAttribute('aria-label')).toContain('Match BIM')
  })

  it('uses nav with French aria-label', async () => {
    const fixture = await setup()
    const nav = fixture.nativeElement.querySelector('nav.context-breadcrumb')
    expect(nav?.getAttribute('aria-label')).toBe("Fil d'Ariane")
  })

  it('keeps desktop troupe name in trail and exposes a separate mobile logo control', async () => {
    const fixture = await setup('event')
    const el = fixture.nativeElement as HTMLElement

    expect(el.querySelector('.context-breadcrumb__trail--desktop .context-breadcrumb__troupe-name')).toBeTruthy()
    expect(el.querySelector('.context-breadcrumb__mobile-logo')).toBeTruthy()
    expect(el.querySelector('.context-breadcrumb__mobile-logo .context-breadcrumb__troupe-name')).toBeNull()
  })

  it('renders admin leaf on season layout with linked season segment', async () => {
    const fixture = await setup('season')
    fixture.componentRef.setInput('leafTitle', 'Participants')
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement

    const seasonLink = el.querySelector(
      '.context-breadcrumb__trail--desktop a.context-breadcrumb__link',
    ) as HTMLAnchorElement
    expect(seasonLink.getAttribute('href')).toBe('/saison/saison-2025')
    expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('Participants')
  })

  it('renders troupe admin trail with leaf only', async () => {
    await TestBed.configureTestingModule({
      imports: [ContextBreadcrumb],
      providers: [provideRouter([])],
    }).compileComponents()

    const fixture = TestBed.createComponent(ContextBreadcrumb)
    fixture.componentRef.setInput('troupeName', 'La Malice')
    fixture.componentRef.setInput('troupeSlug', 'la-malice')
    fixture.componentRef.setInput('layout', 'troupe')
    fixture.componentRef.setInput('leafTitle', 'Membres')
    fixture.detectChanges()

    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('.context-breadcrumb__link')).toBeNull()
    expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('Membres')
  })

  it('links event title when admin leaf is set on event layout', async () => {
    const fixture = await setup('event')
    fixture.componentRef.setInput('leafTitle', 'Participants')
    fixture.componentRef.setInput('eventSlug', 'match-bim')
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement

    const links = el.querySelectorAll('.context-breadcrumb__trail--desktop a.context-breadcrumb__link')
    expect(links.length).toBe(2)
    expect(links[0]?.getAttribute('href')).toBe('/saison/saison-2025')
    expect(links[1]?.getAttribute('href')).toBe('/saison/saison-2025/event/match-bim')
    expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('Participants')
  })

  it('uses single aria-current when admin leaf is set without event slug', async () => {
    const fixture = await setup('event')
    fixture.componentRef.setInput('leafTitle', 'Participants')
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement

    expect(el.querySelectorAll('[aria-current="page"]').length).toBe(1)
    expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('Participants')
  })

})
