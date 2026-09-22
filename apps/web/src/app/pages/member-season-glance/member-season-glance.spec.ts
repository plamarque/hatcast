import { signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { BehaviorSubject } from 'rxjs'
import { convertToParamMap, provideRouter, Router } from '@angular/router'
import { ActivatedRoute } from '@angular/router'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { PwaInstallService } from '../../core/pwa/pwa-install.service'
import {
  MemberSeasonGlanceApiService,
  type MemberSeasonGlance as MemberSeasonGlanceData,
} from '../../core/member-glance/member-season-glance-api.service'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import { FilterPanelService } from '../../shared/filters/filter-panel.service'
import { MemberSeasonGlance } from './member-season-glance'

const glanceSelf: MemberSeasonGlanceData = {
  userId: 'u1',
  userSlug: 'angie',
  displayName: 'Angie',
  avatarUrl: null,
  isSelf: true,
  resolvedSeasonId: 'season-1',
  troupeId: 'troupe-1',
  preferredRolesTroupeId: 'troupe-1',
  filterBarVisible: false,
  participationFilters: null,
  stats: null,
  monthlyChart: [],
  favoriteRoleCounts: [],
  preferredRoleKeys: ['player', 'volunteer'],
}

const glanceOther: MemberSeasonGlanceData = {
  ...glanceSelf,
  isSelf: false,
  preferredRoleKeys: null,
}

describe('MemberSeasonGlance', () => {
  async function setup(options?: {
    glance?: MemberSeasonGlanceData
    userSlug?: string
    response?: unknown
    seasonPickerResult?: unknown
  }): Promise<{
    fixture: ComponentFixture<MemberSeasonGlance>
    router: Router
    glanceApi: { getSeasonGlance: ReturnType<typeof vi.fn> }
    filterPanel: { openSinglePicker: ReturnType<typeof vi.fn> }
    paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>
  }> {
    const paramMap$ = new BehaviorSubject(
      convertToParamMap({ userSlug: options?.userSlug ?? 'angie' }),
    )
    const glanceApi = {
      getSeasonGlance: vi.fn().mockResolvedValue(
        options?.response ?? {
          ok: true,
          status: 200,
          data: options?.glance ?? glanceSelf,
        },
      ),
    }
    const authApi = {
      ensureHatcastSession: vi.fn().mockResolvedValue({
        ok: true,
        data: {
          user: {
            id: 'u1',
            slug: 'angie',
            email: 'a@example.com',
            displayName: 'Angie',
          },
        },
      }),
      logout: vi.fn(),
    }
    const filterPanel = {
      openSinglePicker: vi.fn().mockResolvedValue(options?.seasonPickerResult),
    }

    await TestBed.configureTestingModule({
      imports: [MemberSeasonGlance, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              get paramMap() {
                return paramMap$.value
              },
              get queryParamMap() {
                return convertToParamMap({})
              },
            },
            paramMap: paramMap$.asObservable(),
          },
        },
        { provide: MemberSeasonGlanceApiService, useValue: glanceApi },
        { provide: AuthApiService, useValue: authApi },
        { provide: FilterPanelService, useValue: filterPanel },
        {
          provide: TroupeSeasonResolverService,
          useValue: { resolveSeasonSlug: vi.fn().mockResolvedValue({ kind: 'not-found' }) },
        },
        {
          provide: PwaInstallService,
          useValue: {
            showBanner: signal(false),
            isPwaInstalled: () => true,
            installFromUserMenu: vi.fn(),
            promptInstall: vi.fn(),
            dismissBanner: vi.fn(),
          },
        },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(MemberSeasonGlance)
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Mes Stats')
    })
    await fixture.whenStable()
    return { fixture, router: TestBed.inject(Router), glanceApi, filterPanel, paramMap$ }
  }

  it('loads glance and shows Mes Stats page title', async () => {
    const { fixture } = await setup()
    const title = fixture.nativeElement.querySelector('.member-glance-page__title')
    expect(title?.textContent).toContain('Mes Stats')
    expect(fixture.nativeElement.textContent).toContain("En un clin d'œil")
  })

  it('does not show cross-nav shortcuts or agenda footer on self glance', async () => {
    const { fixture } = await setup({ glance: glanceSelf })
    expect(fixture.nativeElement.querySelector('app-member-cross-nav-shortcuts')).toBeNull()
    expect(fixture.nativeElement.querySelector('.member-glance-page__footer')).toBeNull()
    expect(fixture.nativeElement.textContent).not.toContain('Voir dans mon agenda')
  })

  it('shows filter bar when API reports filterBarVisible', async () => {
    const { fixture } = await setup({
      glance: {
        ...glanceSelf,
        filterBarVisible: true,
        participationFilters: {
          troupes: [{ id: 'troupe-1', name: 'La BIM', slug: 'la-bim' }],
          seasons: [
            {
              id: 'season-1',
              title: 'Ligue A',
              slug: 'ligue-a',
              troupeId: 'troupe-1',
            },
            {
              id: 'season-2',
              title: 'Ligue B',
              slug: 'ligue-b',
              troupeId: 'troupe-1',
            },
          ],
        },
      },
    })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('[data-testid="filter-trigger"]')).toBeTruthy()
    })
  })

  it('shows Toutes when no scope filter was selected', async () => {
    const { fixture, glanceApi } = await setup({
      glance: {
        ...glanceSelf,
        filterBarVisible: true,
        participationFilters: {
          troupes: [{ id: 'troupe-1', name: 'La BIM', slug: 'la-bim' }],
          seasons: [
            {
              id: 'season-1',
              title: 'Saison 2026-2027',
              slug: 'saison-2026-2027',
              troupeId: 'troupe-1',
            },
          ],
        },
      },
    })

    expect(fixture.componentInstance['hubDimensions']()[0].summary).toBe('Toutes')
    expect(fixture.componentInstance['hubDimensions']()[1].summary).toBe('Toutes')
    expect(glanceApi.getSeasonGlance).toHaveBeenCalledTimes(1)
    expect(fixture.nativeElement.querySelector('[aria-label^="Retirer le filtre Saison 2026-2027"]')).toBeNull()
  })

  it('shows a troupe CTA when the member has no active participation', async () => {
    const { fixture } = await setup({
      response: {
        ok: false,
        status: 404,
        errorMessage: 'Aucune participation active.',
      },
    })

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Aucune saison disponible')
    })
    const cta = fixture.nativeElement.querySelector('a[routerLink="/troupes"]')
    expect(cta?.textContent).toContain('Voir mes troupes')
  })

  it('clears an explicit season scope back to Toutes', async () => {
    const participationFilters = {
      troupes: [{ id: 'troupe-1', name: 'La BIM', slug: 'la-bim' }],
      seasons: [
        { id: 'season-1', title: 'Saison suggérée', slug: 'suggeree', troupeId: 'troupe-1' },
        { id: 'season-2', title: 'Autre saison', slug: 'autre', troupeId: 'troupe-1' },
      ],
    }
    const { fixture, glanceApi, filterPanel } = await setup({
      glance: { ...glanceSelf, filterBarVisible: true, participationFilters },
    })

    await fixture.componentInstance['onSeasonFilterChange']('season-2')
    await fixture.componentInstance['onRemoveFilterDimension']('season')

    expect(filterPanel.openSinglePicker).not.toHaveBeenCalled()
    expect(glanceApi.getSeasonGlance).toHaveBeenCalledTimes(3)
  })

  it('hides filter trigger when API reports filterBarVisible false', async () => {
    const { fixture } = await setup({ glance: glanceSelf })
    expect(fixture.nativeElement.querySelector('[data-testid="filter-trigger"]')).toBeNull()
  })

  it('does not show preferred roles editor on glance page', async () => {
    const { fixture } = await setup({ glance: glanceSelf })
    expect(fixture.nativeElement.textContent).not.toContain('Mes rôles préférés')
    expect(fixture.nativeElement.textContent).not.toContain('Enregistrer')
  })

  it('hides preferred roles editor when viewing another member', async () => {
    const { fixture } = await setup({ glance: glanceOther })
    expect(fixture.nativeElement.textContent).not.toContain('Mes rôles préférés')
    expect(fixture.nativeElement.textContent).toContain('Disponibilités, sélections et rôles')
  })

  it('reloads glance when route userSlug changes', async () => {
    const { fixture, glanceApi, paramMap$ } = await setup({ userSlug: 'angie' })
    expect(glanceApi.getSeasonGlance).toHaveBeenCalledTimes(1)

    glanceApi.getSeasonGlance.mockResolvedValue({
      ok: true,
      status: 200,
      data: { ...glanceOther, userSlug: 'bob', displayName: 'Bob' },
    })
    paramMap$.next(convertToParamMap({ userSlug: 'bob' }))

    await vi.waitFor(() => {
      expect(glanceApi.getSeasonGlance).toHaveBeenCalledTimes(2)
      expect(glanceApi.getSeasonGlance).toHaveBeenLastCalledWith(
        'bob',
        expect.any(Object),
      )
    })
  })
})
