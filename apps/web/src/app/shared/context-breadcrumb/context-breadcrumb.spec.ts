import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { describe, expect, it, vi } from 'vitest'

import { ContextSwitcherDataService } from '../../core/navigation/context-switcher-data.service'
import { ContextBreadcrumb } from './context-breadcrumb'

function switcherDataStub(options?: {
  initialized?: boolean
  showSwitcher?: boolean
  loadError?: boolean
}) {
  return {
    initialized: vi.fn(() => options?.initialized ?? false),
    showSwitcher: vi.fn(() => options?.showSwitcher ?? false),
    loadError: vi.fn(() => options?.loadError ?? false),
    ensureReady: vi.fn().mockResolvedValue(undefined),
    loading: vi.fn(() => false),
    troupes: vi.fn(() => []),
    seasonsForTroupe: vi.fn(() => []),
    prepareMenuOpen: vi.fn().mockResolvedValue(undefined),
  }
}

describe('ContextBreadcrumb', () => {
  async function setup(
    layout: 'season' | 'event' = 'season',
    switcherOptions?: Parameters<typeof switcherDataStub>[0],
  ) {
    await TestBed.configureTestingModule({
      imports: [ContextBreadcrumb, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: ContextSwitcherDataService, useValue: switcherDataStub(switcherOptions) },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(ContextBreadcrumb)
    fixture.componentRef.setInput('troupeId', 'troupe-1')
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
      imports: [ContextBreadcrumb, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: ContextSwitcherDataService, useValue: switcherDataStub() },
      ],
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

  it('renders context switcher on desktop when multiple contexts are available', async () => {
    const fixture = await setup('season', { initialized: true, showSwitcher: true })
    const el = fixture.nativeElement as HTMLElement

    expect(el.querySelector('app-context-switcher .context-switcher__trigger')).toBeTruthy()
    expect(el.querySelector('.context-breadcrumb__current')).toBeNull()
    const troupeLink = el.querySelector('a.context-breadcrumb__troupe') as HTMLAnchorElement
    expect(troupeLink.getAttribute('href')).toBe('/troupes/la-malice')
  })

  it('renders compact context switcher on mobile row when enabled', async () => {
    const fixture = await setup('season', { initialized: true, showSwitcher: true })
    const mobileRow = fixture.nativeElement.querySelector('.context-breadcrumb__mobile-row')
    expect(mobileRow?.querySelector('app-context-switcher.context-switcher__trigger--compact, app-context-switcher')).toBeTruthy()
  })

  it('keeps hub link when switcher data fails to load', async () => {
    const fixture = await setup('season', { initialized: true, loadError: true })
    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('app-context-switcher')).toBeNull()
    expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('Saison 2025-26')
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
