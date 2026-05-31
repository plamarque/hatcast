import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter, Router } from '@angular/router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ContextSwitcherDataService } from '../../core/navigation/context-switcher-data.service'
import { rememberLastVisitedSeasonSlug } from '../../core/navigation/last-visited-season-storage'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { ContextSwitcher } from './context-switcher'

describe('ContextSwitcher', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  async function setup(options?: {
    showSwitcher?: boolean
    loading?: boolean
    loadError?: boolean
  }) {
    const data = {
      showSwitcher: vi.fn(() => options?.showSwitcher ?? true),
      loading: vi.fn(() => options?.loading ?? false),
      loadError: vi.fn(() => options?.loadError ?? false),
      troupes: vi.fn(() => [
        { id: 't-a', name: 'Troupe A', slug: 'troupe-a' },
        { id: 't-b', name: 'Troupe B', slug: 'troupe-b' },
      ]),
      seasonsForTroupe: vi.fn(() => [
        { id: 's1', slug: 'saison-1', title: 'Saison 1', troupeId: 't-a' },
        { id: 's2', slug: 'saison-2', title: 'Saison 2', troupeId: 't-a' },
      ]),
      ensureReady: vi.fn().mockResolvedValue(undefined),
      prepareMenuOpen: vi.fn().mockResolvedValue(undefined),
    }

    const resolver = { resolveSeasonSlug: vi.fn() }
    const troupeContext = { selectTroupe: vi.fn() }

    await TestBed.configureTestingModule({
      imports: [ContextSwitcher, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: ContextSwitcherDataService, useValue: data },
        { provide: TroupeSeasonResolverService, useValue: resolver },
        { provide: TroupeContextService, useValue: troupeContext },
      ],
    }).compileComponents()

    const router = TestBed.inject(Router)
    vi.spyOn(router, 'navigate').mockResolvedValue(true)

    const fixture = TestBed.createComponent(ContextSwitcher)
    fixture.componentRef.setInput('troupeId', 't-a')
    fixture.componentRef.setInput('troupeSlug', 'troupe-a')
    fixture.componentRef.setInput('troupeName', 'Troupe A')
    fixture.componentRef.setInput('seasonSlug', 'saison-1')
    fixture.componentRef.setInput('seasonTitle', 'Saison 1')
    fixture.detectChanges()

    return { fixture, router, resolver, troupeContext, data }
  }

  it('renders trigger with French aria-label when switcher is active', async () => {
    const { fixture } = await setup()
    const trigger = fixture.nativeElement.querySelector('.context-switcher__trigger') as HTMLButtonElement
    expect(trigger).toBeTruthy()
    expect(trigger.getAttribute('aria-label')).toBe('Changer de troupe ou de saison')
    expect(trigger.textContent).toContain('Saison 1')
  })

  it('navigates to another season and remembers slug', async () => {
    const { fixture, router } = await setup()
    const component = fixture.componentInstance as unknown as {
      selectSeason: (season: { slug: string }) => void
    }
    component.selectSeason({ slug: 'saison-2' } as never)

    expect(router.navigate).toHaveBeenCalledWith(['/saison', 'saison-2'])
    expect(localStorage.getItem('lastVisitedSeason')).toBe('saison-2')
  })

  it('navigates to troupe hub when troupe change has no valid stored season', async () => {
    const { fixture, router, resolver, troupeContext } = await setup()
    resolver.resolveSeasonSlug.mockResolvedValue({ kind: 'not-found' })

    const component = fixture.componentInstance as unknown as {
      selectTroupe: (troupe: { id: string; slug: string }) => Promise<void>
    }
    await component.selectTroupe({ id: 't-b', slug: 'troupe-b' } as never)

    expect(troupeContext.selectTroupe).toHaveBeenCalledWith('t-b')
    expect(router.navigate).toHaveBeenCalledWith(['/', 'troupes', 'troupe-b'])
  })

  it('navigates to resolved season when changing troupe', async () => {
    rememberLastVisitedSeasonSlug('festibask', 't-b')
    const { fixture, router, resolver, troupeContext } = await setup()
    resolver.resolveSeasonSlug.mockResolvedValue({
      kind: 'resolved',
      troupe: { id: 't-b', slug: 'troupe-b' },
      season: { slug: 'festibask' },
    })

    const component = fixture.componentInstance as unknown as {
      selectTroupe: (troupe: { id: string; slug: string }) => Promise<void>
    }
    await component.selectTroupe({ id: 't-b', slug: 'troupe-b' } as never)

    expect(troupeContext.selectTroupe).toHaveBeenCalledWith('t-b')
    expect(router.navigate).toHaveBeenCalledWith(['/saison', 'festibask'])
  })

  it('disables trigger while loading', async () => {
    const { fixture } = await setup({ loading: true })
    const trigger = fixture.nativeElement.querySelector('.context-switcher__trigger') as HTMLButtonElement
    expect(trigger.disabled).toBe(true)
  })

  it('does not render trigger when switcher is hidden', async () => {
    const { fixture } = await setup({ showSwitcher: false })
    expect(fixture.nativeElement.querySelector('.context-switcher__trigger')).toBeNull()
  })
})
