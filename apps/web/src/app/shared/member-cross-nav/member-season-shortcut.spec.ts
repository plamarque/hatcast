import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { SeasonResponse } from '../../core/seasons/season-api.service'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import { rememberLastVisitedSeasonSlug } from '../../core/navigation/last-visited-league-storage'
import { MemberSeasonShortcut } from './member-season-shortcut'

describe('MemberSeasonShortcut', () => {
  let fixture: ComponentFixture<MemberSeasonShortcut>
  let resolver: { resolveSeasonSlug: ReturnType<typeof vi.fn> }

  beforeEach(async () => {
    localStorage.clear()
    resolver = { resolveSeasonSlug: vi.fn() }
    await TestBed.configureTestingModule({
      imports: [MemberSeasonShortcut],
      providers: [
        provideRouter([]),
        { provide: TroupeSeasonResolverService, useValue: resolver },
      ],
    }).compileComponents()
    fixture = TestBed.createComponent(MemberSeasonShortcut)
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('links to troupes when no slug is stored', async () => {
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement
    expect(link).toBeTruthy()
    expect(link.getAttribute('href')).toBe('/troupes')
    expect(link.textContent).toContain('Choisir une saison')
  })

  it('links to saison workspace when slug resolves', async () => {
    rememberLastVisitedSeasonSlug('festibask')
    resolver.resolveSeasonSlug.mockResolvedValue({
      kind: 'resolved',
      troupe: { id: 't1', name: 'Troupe' },
      season: { id: 's1', slug: 'festibask', title: 'Ligue 2026' } as SeasonResponse,
    })

    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/saison/festibask')
    expect(link.textContent).toContain('Ligue 2026')
    expect(link.getAttribute('aria-label')).toBe('Ma saison : Ligue 2026')
  })
})
