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
import { MemberSeasonGlance } from './member-season-glance'

const glanceSelf: MemberSeasonGlanceData = {
  userId: 'u1',
  userSlug: 'angie',
  displayName: 'Angie',
  avatarUrl: null,
  isSelf: true,
  resolvedSeasonId: 'season-1',
  troupeId: 'troupe-1',
  leagueId: 'season-1',
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
  }): Promise<{
    fixture: ComponentFixture<MemberSeasonGlance>
    router: Router
    glanceApi: { getSeasonGlance: ReturnType<typeof vi.fn> }
    paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>
  }> {
    const paramMap$ = new BehaviorSubject(
      convertToParamMap({ userSlug: options?.userSlug ?? 'angie' }),
    )
    const glanceApi = {
      getSeasonGlance: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: options?.glance ?? glanceSelf,
      }),
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
      expect(fixture.nativeElement.textContent).toContain('Angie')
    })
    return { fixture, router: TestBed.inject(Router), glanceApi, paramMap$ }
  }

  it('loads glance and shows self title', async () => {
    const { fixture } = await setup()
    expect(fixture.nativeElement.textContent).toContain("Ma saison en un clin d'œil")
  })

  it('navigates to filtered agenda from Planning CTA', async () => {
    const { fixture, router } = await setup()
    const navigateSpy = vi.spyOn(router, 'navigate')
    const btn = fixture.nativeElement.querySelector(
      '.member-glance-page__footer button',
    ) as HTMLButtonElement
    btn.click()
    expect(navigateSpy).toHaveBeenCalledWith(
      ['/agenda'],
      expect.objectContaining({
        queryParams: expect.objectContaining({ troupeId: 'troupe-1', leagueId: 'season-1' }),
      }),
    )
  })

  it('shows filter bar when API reports filterBarVisible', async () => {
    const { fixture } = await setup({
      glance: {
        ...glanceSelf,
        filterBarVisible: true,
        participationFilters: {
          troupes: [{ id: 'troupe-1', name: 'La BIM', slug: 'la-bim' }],
          leagues: [
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
    expect(fixture.nativeElement.querySelector('app-user-agenda-filter-bar')).toBeTruthy()
  })

  it('hides filter bar when API reports filterBarVisible false', async () => {
    const { fixture } = await setup({ glance: glanceSelf })
    expect(fixture.nativeElement.querySelector('app-user-agenda-filter-bar')).toBeNull()
  })

  it('does not show preferred roles editor on glance page', async () => {
    const { fixture } = await setup({ glance: glanceSelf })
    expect(fixture.nativeElement.textContent).not.toContain('Mes rôles préférés')
    expect(fixture.nativeElement.textContent).not.toContain('Enregistrer')
  })

  it('hides preferred roles editor when viewing another member', async () => {
    const { fixture } = await setup({ glance: glanceOther })
    expect(fixture.nativeElement.textContent).not.toContain('Mes rôles préférés')
    expect(fixture.nativeElement.textContent).toContain('Saison en un clin d')
  })

  it('reloads glance when route userSlug changes', async () => {
    const { glanceApi, paramMap$ } = await setup({ userSlug: 'angie' })
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
