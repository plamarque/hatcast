import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter, Router } from '@angular/router'
import { of } from 'rxjs'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { environment } from '../../../environments/environment'
import { AuthApiService } from '../../core/auth/auth-api.service'
import { DemoTroupeJoinService } from '../../core/troupes/demo-troupe-join.service'
import {
  DEMO_ACTIVE_SEASON_SLUG,
  DEMO_TROUPE_ID,
} from '../../core/troupes/demo-troupe.constants'
import {
  TroupeApiService,
  type PublicTroupeDirectoryItem,
  type TroupeListItem,
} from '../../core/troupes/troupe-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import { TroupesList } from './troupes-list'

const mockTroupe: TroupeListItem = {
  id: 't-1',
  name: 'Les Improbots',
  slug: 'les-improbots',
  isDemo: false,
  joinPolicy: 'OPEN',
  activeMemberCount: 3,
  upcomingEventCount: 2,
  membership: {
    id: 'm-1',
    displayName: 'Patrice',
    status: 'ACTIVE',
    baselineRole: 'MEMBER',
    createdAt: '',
    updatedAt: '',
  },
}

const publicTroupe: PublicTroupeDirectoryItem = {
  id: 't-public',
  name: 'La Malice',
  slug: 'la-malice',
  activeMemberCount: 5,
  upcomingEventCount: 1,
}

async function settle(fixture: ComponentFixture<TroupesList>): Promise<void> {
  fixture.detectChanges()
  for (let i = 0; i < 30; i++) {
    await fixture.whenStable()
    await new Promise((resolve) => setTimeout(resolve, 0))
    if (
      !fixture.componentInstance['loadingSession']() &&
      !fixture.componentInstance['loadingList']() &&
      !fixture.componentInstance['loadingDiscover']()
    ) {
      break
    }
  }
  fixture.detectChanges()
}

describe('TroupesList', () => {
  let fixture: ComponentFixture<TroupesList>
  let troupeApi: {
    listMyTroupes: ReturnType<typeof vi.fn>
    listPublicTroupes: ReturnType<typeof vi.fn>
    joinTroupe: ReturnType<typeof vi.fn>
    createTroupe: ReturnType<typeof vi.fn>
  }
  let dialog: { open: ReturnType<typeof vi.fn> }
  let auth: { ensureHatcastSession: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> }
  let demoJoin: { join: ReturnType<typeof vi.fn>; joining: ReturnType<typeof vi.fn> }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  beforeEach(async () => {
    dialog = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(undefined) }),
    }
    troupeApi = {
      listMyTroupes: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [mockTroupe] }),
      listPublicTroupes: vi
        .fn()
        .mockResolvedValue({ ok: true, status: 200, data: [publicTroupe, mockTroupe] }),
      joinTroupe: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
      createTroupe: vi.fn(),
    }
    auth = {
      ensureHatcastSession: vi.fn().mockResolvedValue({
        ok: true,
        data: { user: { id: 'u1', email: 'a@b.c', displayName: 'Test' } },
      }),
      logout: vi.fn().mockResolvedValue(undefined),
    }
    demoJoin = {
      join: vi.fn().mockResolvedValue({ ok: true }),
      joining: vi.fn(() => false),
    }

    await TestBed.configureTestingModule({
      imports: [TroupesList, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: AuthApiService, useValue: auth },
        { provide: TroupeApiService, useValue: troupeApi },
        { provide: DemoTroupeJoinService, useValue: demoJoin },
        { provide: MatDialog, useValue: dialog },
        {
          provide: TroupeContextService,
          useValue: {
            currentUserDisplayLabel: (u: { displayName?: string; email?: string }) =>
              u.displayName ?? u.email ?? 'Compte',
          },
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(TroupesList)
  })

  it('affiche le fil d’Ariane Accueil › Troupes', async () => {
    await settle(fixture)

    const breadcrumb = fixture.nativeElement.querySelector('.troupes-list__breadcrumb')
    expect(breadcrumb?.textContent).toContain('Troupes')
    expect(breadcrumb?.textContent).not.toContain('Mon agenda')
    const homeLink = breadcrumb?.querySelector('a[href="/accueil"]')
    expect(homeLink).not.toBeNull()
    expect(homeLink?.getAttribute('aria-label')).toBe('Accueil')
    expect(homeLink?.querySelector('mat-icon')?.textContent?.trim()).toBe('home')
  })

  it('affiche les cartes troupe avec CTA Material vers le hub', async () => {
    await settle(fixture)

    const card = fixture.nativeElement.querySelector('app-troupe-card') as HTMLElement
    const openLink = card.querySelector('a[mat-flat-button][href="/troupes/les-improbots"]')
    expect(openLink).not.toBeNull()
    expect(openLink?.getAttribute('aria-label')).toBe('Ouvrir Les Improbots')
    expect(fixture.nativeElement.textContent).toContain('3 membres')
    expect(fixture.nativeElement.textContent).toContain('2 spectacles à venir')
  })

  it('n’affiche pas le menu admin par scope', async () => {
    await settle(fixture)

    expect(fixture.nativeElement.querySelector('.scope-admin-menu__trigger')).toBeNull()
  })

  it('affiche la section Découvrir avec ancre decouvrir et cartes publiques', async () => {
    await settle(fixture)

    expect(fixture.nativeElement.querySelector('#decouvrir')).not.toBeNull()
    expect(fixture.nativeElement.textContent).toContain('La Malice')
    expect(fixture.nativeElement.textContent).not.toContain('annuaire public arrive bientôt')
  })

  it('exclut les troupes déjà rejointes de Découvrir', async () => {
    await settle(fixture)

    const discoverCards = Array.from(
      fixture.nativeElement.querySelectorAll('#decouvrir app-troupe-card') as NodeListOf<HTMLElement>,
    )
    expect(discoverCards.length).toBe(1)
    expect(discoverCards[0].textContent).toContain('La Malice')
    expect(discoverCards[0].textContent).not.toContain('Les Improbots')
  })

  it('gère l’état sans adhésion', async () => {
    troupeApi.listMyTroupes.mockResolvedValue({ ok: true, status: 200, data: [] })

    await settle(fixture)

    expect(fixture.componentInstance['troupes']().length).toBe(0)
    expect(fixture.nativeElement.textContent).toContain('troupe de démonstration')
    expect(fixture.nativeElement.textContent).toContain('Créer une troupe')
  })

  it('ouvre le dialogue de création et navigue vers le hub après succès', async () => {
    const router = TestBed.inject(Router)
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true)
    dialog.open.mockReturnValue({ afterClosed: () => of('ma-troupe') })

    await settle(fixture)
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>
    const createBtn = Array.from(buttons).find((b) => b.textContent?.includes('Créer une troupe'))
    expect(createBtn).toBeDefined()
    createBtn?.click()
    fixture.detectChanges()
    await fixture.whenStable()

    expect(dialog.open).toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith(['/', 'troupes', 'ma-troupe'])
  })

  it('délègue le join Démo au service partagé', async () => {
    troupeApi.listMyTroupes.mockResolvedValue({ ok: true, status: 200, data: [] })
    await settle(fixture)

    await fixture.componentInstance['joinDemoTroupe']()

    expect(demoJoin.join).toHaveBeenCalled()
  })
})

describe('TroupesList — join Démo UUID', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('appelle joinTroupe avec DEMO_TROUPE_ID …000099', async () => {
    localStorage.clear()
    environment.demoTroupeId = DEMO_TROUPE_ID
    const troupeContext = { reloadAndSelect: vi.fn().mockResolvedValue(true) }
    const resolver = {
      resolveSeasonSlug: vi.fn().mockResolvedValue({ kind: 'resolved', troupe: {}, season: {} }),
    }
    const api = {
      listMyTroupes: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      listPublicTroupes: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      joinTroupe: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
      createTroupe: vi.fn(),
    }

    await TestBed.configureTestingModule({
      imports: [TroupesList, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        DemoTroupeJoinService,
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({
              ok: true,
              data: { user: { id: 'u1', email: 'a@b.c', displayName: 'Test' } },
            }),
          },
        },
        { provide: TroupeApiService, useValue: api },
        { provide: TroupeContextService, useValue: troupeContext },
        { provide: TroupeSeasonResolverService, useValue: resolver },
      ],
    }).compileComponents()

    const router = TestBed.inject(Router)
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true)
    const integrationFixture = TestBed.createComponent(TroupesList)
    await integrationFixture.componentInstance['joinDemoTroupe']()

    expect(api.joinTroupe).toHaveBeenCalledWith(DEMO_TROUPE_ID)
    expect(troupeContext.reloadAndSelect).toHaveBeenCalledWith(DEMO_TROUPE_ID)
    expect(navigate).toHaveBeenCalledWith(['/saison', DEMO_ACTIVE_SEASON_SLUG])
  })
})

describe('TroupesList session gate', () => {
  it('ne redirige pas vers connexion sans session et affiche Découvrir', async () => {
    await TestBed.configureTestingModule({
      imports: [TroupesList, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({ ok: false, status: 401 }),
          },
        },
        {
          provide: TroupeApiService,
          useValue: {
            listMyTroupes: vi.fn(),
            listPublicTroupes: vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              data: [publicTroupe],
            }),
            joinTroupe: vi.fn(),
            createTroupe: vi.fn(),
          },
        },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: DemoTroupeJoinService, useValue: { join: vi.fn(), joining: vi.fn(() => false) } },
        {
          provide: TroupeContextService,
          useValue: { currentUserDisplayLabel: () => 'Compte' },
        },
      ],
    }).compileComponents()

    const router = TestBed.inject(Router)
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true)
    const fixture = TestBed.createComponent(TroupesList)
    await settle(fixture)

    expect(navigate).not.toHaveBeenCalledWith(['/connexion'], { replaceUrl: true })
    expect(fixture.nativeElement.textContent).toContain('Se connecter')
    expect(fixture.nativeElement.textContent).toContain('La Malice')
    const voirButton = fixture.nativeElement.querySelector(
      '#decouvrir button[mat-flat-button]',
    ) as HTMLButtonElement | null
    expect(voirButton?.getAttribute('aria-label')).toBe('Voir La Malice')
    expect(voirButton?.textContent?.trim()).toBe('Voir')
  })
})
