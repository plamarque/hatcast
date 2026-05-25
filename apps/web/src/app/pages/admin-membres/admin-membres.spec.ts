import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router'
import { BehaviorSubject } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { OrganizerApiService, type MySeasonPermissions } from '../../core/permissions/organizer-api.service'
import { SeasonApiService, type SeasonResponse } from '../../core/seasons/season-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { AdminMembres } from './admin-membres'

describe('AdminMembres', () => {
  const paramMap$ = new BehaviorSubject(convertToParamMap({}))
  const queryParamMap$ = new BehaviorSubject(convertToParamMap({}))

  async function setup(
    permissions: MySeasonPermissions,
    query: Record<string, string> = {},
    options: {
      troupes?: Array<{
        id: string
        name: string
        slug: string
        membership: {
          id: string
          displayName: string
          status: 'ACTIVE'
          baselineRole: 'MEMBER' | 'TROUPE_ADMIN'
          createdAt: string
          updatedAt: string
        }
      }>
      seasons?: SeasonResponse[]
      slug?: string
      troupeSlug?: string
      getSeasonBySlug?: ReturnType<typeof vi.fn>
    } = {},
  ) {
    const router = { navigate: vi.fn().mockResolvedValue(true) }
    const snack = { open: vi.fn() }
    const queryMap = convertToParamMap(query)
    if (options.slug) {
      paramMap$.next(convertToParamMap({ slug: options.slug }))
    } else if (options.troupeSlug) {
      paramMap$.next(convertToParamMap({ troupeSlug: options.troupeSlug }))
    } else {
      paramMap$.next(convertToParamMap({ troupeSlug: 't1' }))
    }
    const route = {
      paramMap: paramMap$.asObservable(),
      queryParamMap: queryParamMap$.asObservable(),
      snapshot: { queryParamMap: queryMap },
    }
    const troupeApi = {
      listMyTroupes: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: options.troupes ?? [troupe('t1', 'Ma Troupe')],
      }),
      listMembers: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: { content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 },
      }),
    }
    const seasonsApi = {
      listSeasons: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: {
          content: options.seasons ?? [season('s1')],
          page: 0,
          size: 100,
          totalElements: 1,
          totalPages: 1,
        },
      }),
      getSeasonBySlug: options.getSeasonBySlug ?? vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: season('s1'),
      }),
    }
    const organizerApi = {
      mySeasonPermissions: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: permissions,
      }),
      listSeasonOrganizers: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    }

    await TestBed.configureTestingModule({
      imports: [AdminMembres, NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
        { provide: MatSnackBar, useValue: snack },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              data: { user: { email: 'a@example.com', displayName: 'Admin' } },
            }),
          },
        },
        { provide: SeasonApiService, useValue: seasonsApi },
        { provide: TroupeApiService, useValue: troupeApi },
        { provide: OrganizerApiService, useValue: organizerApi },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(AdminMembres)
    fixture.detectChanges()
    await fixture.whenStable()
    await waitForPageLoad(fixture)
    fixture.detectChanges()
    return { fixture, router, snack, seasonsApi, organizerApi, troupeApi }
  }

  it('redirects unauthorized users to seasons list', async () => {
    const { router, organizerApi } = await setup(noPermissions(), {}, {
      troupeSlug: 'troupe',
      troupes: [{
        id: 't1',
        name: 'Ma Troupe',
        slug: 'troupe',
        membership: {
          id: 'm-1',
          displayName: 'Membre',
          status: 'ACTIVE',
          baselineRole: 'MEMBER',
          createdAt: '',
          updatedAt: '',
        },
      }],
    })

    await vi.waitFor(() => {
      expect(organizerApi.mySeasonPermissions).toHaveBeenCalled()
    })
    await vi.waitFor(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/seasons'])
    })
  })

  it('refuse la route troupe à un organisateur saison sans rôle admin troupe', async () => {
    const { router } = await setup(bothPermissions(), { onglet: 'organisateurs' }, {
      troupeSlug: 'troupe',
      troupes: [{
        id: 't1',
        name: 'Ma Troupe',
        slug: 'troupe',
        membership: {
          id: 'm-1',
          displayName: 'Orga',
          status: 'ACTIVE',
          baselineRole: 'MEMBER',
          createdAt: '',
          updatedAt: '',
        },
      }],
    })

    await vi.waitFor(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/seasons'])
    })
  })

  it('shows Membres title when troupe admin only', async () => {
    const { fixture } = await setup(membersOnly())

    expect(text(fixture)).toContain('Membres')
    expect(text(fixture)).toContain('Ma Troupe')
  })

  it('shows tab bar when both permissions granted', async () => {
    const { fixture } = await setup(bothPermissions())
    const cmp = fixture.componentInstance as AdminMembres & { showTabBar: () => boolean }

    expect(cmp.showTabBar()).toBe(true)
  })

  it('selects organisateurs tab from query param', async () => {
    queryParamMap$.next(convertToParamMap({ onglet: 'organisateurs' }))
    const { fixture } = await setup(bothPermissions(), { onglet: 'organisateurs' })

    const cmp = fixture.componentInstance as AdminMembres & { activeTab: () => string }
    expect(cmp.activeTab()).toBe('organisateurs')
  })

  it('loads membres without season when troupe has no seasons', async () => {
    const { fixture, router } = await setup(membersOnly(), {}, { seasons: [] })

    expect(router.navigate).not.toHaveBeenCalledWith(['/seasons'])
    expect(text(fixture)).toContain('Membres')
  })

  it('résout la troupe depuis le slug de route', async () => {
    const { fixture } = await setup(membersOnly(), {}, {
      troupeSlug: 't2',
      troupes: [troupe('t1', 'Première troupe'), troupe('t2', 'Troupe propriétaire')],
    })

    expect((fixture.componentInstance as unknown as { troupeId: () => string | null }).troupeId()).toBe('t2')
    expect(text(fixture)).toContain('Troupe propriétaire')
  })

  it('résout une route legacy slug dans la troupe propriétaire', async () => {
    localStorage.setItem('hatcast.selectedTroupeId', 't1')
    const getSeasonBySlug = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: true, status: 200, data: season('s2', 't2') })

    const { fixture, organizerApi } = await setup(bothPermissions(), {}, {
      slug: 'season-a',
      troupes: [troupe('t1', 'Première troupe'), troupe('t2', 'Troupe propriétaire')],
      getSeasonBySlug,
    })

    await vi.waitFor(() => {
      expect(organizerApi.mySeasonPermissions).toHaveBeenCalledWith('s2')
    })
    expect((fixture.componentInstance as unknown as { troupeId: () => string | null }).troupeId()).toBe('t2')
  })
})

async function waitForPageLoad(fixture: ComponentFixture<unknown>): Promise<void> {
  for (let i = 0; i < 30; i++) {
    await fixture.whenStable()
    await new Promise((r) => setTimeout(r, 0))
    const cmp = fixture.componentInstance as { loading: () => boolean }
    if (!cmp.loading()) {
      return
    }
  }
}

function text(fixture: ComponentFixture<unknown>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? ''
}

function troupe(id: string, name: string) {
  return {
    id,
    name,
    slug: id,
    activeMemberCount: 1,
    upcomingEventCount: 0,
    membership: {
      id: `membership-${id}`,
      displayName: name,
      status: 'ACTIVE' as const,
      baselineRole: 'TROUPE_ADMIN' as const,
      createdAt: '',
      updatedAt: '',
    },
  }
}

function season(id: string, troupeId = 't1'): SeasonResponse {
  return {
    id,
    troupeId,
    slug: 'season-a',
    title: 'Saison A',
    description: null,
    startDate: null,
    endDate: null,
    archived: false,
    active: true,
    eventCount: 0,
    participantCount: 0,
    createdAt: '',
    updatedAt: '',
  }
}

function noPermissions(): MySeasonPermissions {
  return {
    canManageSeasonOrganizers: false,
    canManageEventOrganizers: false,
    canManageMembers: false,
    canManageSeasons: false,
    canManageEvents: false,
    canManageSeasonParticipants: false,
    canManageEventParticipants: false,
    isTroupeAdmin: false,
    isSeasonOrganizer: false,
    eventOrganizerFor: [],
    eventParticipantAdminFor: [],
  }
}

function membersOnly(): MySeasonPermissions {
  return { ...noPermissions(), canManageMembers: false, canManageSeasonOrganizers: false }
}

function bothPermissions(): MySeasonPermissions {
  return {
    ...noPermissions(),
    canManageSeasonOrganizers: true,
  }
}
