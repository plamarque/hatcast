import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter, Router } from '@angular/router'
import { of } from 'rxjs'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { TroupeApiService, type TroupeListItem } from '../../core/troupes/troupe-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { TroupesList } from './troupes-list'

const mockTroupe: TroupeListItem = {
  id: 't-1',
  name: 'Les Improbots',
  slug: 'les-improbots',
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

async function settle(fixture: ComponentFixture<TroupesList>): Promise<void> {
  fixture.detectChanges()
  for (let i = 0; i < 20; i++) {
    await fixture.whenStable()
    await new Promise((resolve) => setTimeout(resolve, 0))
    if (!fixture.componentInstance['loadingSession']() && !fixture.componentInstance['loadingList']()) {
      break
    }
  }
  fixture.detectChanges()
}

describe('TroupesList', () => {
  let fixture: ComponentFixture<TroupesList>
  let troupeApi: {
    listMyTroupes: ReturnType<typeof vi.fn>
    joinTroupe: ReturnType<typeof vi.fn>
    createTroupe: ReturnType<typeof vi.fn>
  }
  let dialog: { open: ReturnType<typeof vi.fn> }
  let auth: { ensureHatcastSession: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  beforeEach(async () => {
    dialog = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(undefined) }),
    }
    troupeApi = {
      listMyTroupes: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [mockTroupe] }),
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

    await TestBed.configureTestingModule({
      imports: [TroupesList, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: AuthApiService, useValue: auth },
        { provide: TroupeApiService, useValue: troupeApi },
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

  it('affiche les cartes troupe avec lien Ouvrir vers le hub', async () => {
    await settle(fixture)

    const openLink = fixture.nativeElement.querySelector('a[href="/troupes/les-improbots"]')
    expect(openLink?.textContent?.trim()).toBe('Ouvrir')
    expect(fixture.nativeElement.textContent).toContain('3 membres')
    expect(fixture.nativeElement.textContent).toContain('2 spectacles à venir')
  })

  it('n’affiche pas le menu admin par scope', async () => {
    await settle(fixture)

    expect(fixture.nativeElement.querySelector('.scope-admin-menu__trigger')).toBeNull()
  })

  it('affiche la section Découvrir avec ancre decouvrir', async () => {
    await settle(fixture)

    expect(fixture.nativeElement.querySelector('#decouvrir')).not.toBeNull()
    expect(fixture.nativeElement.textContent).toContain('annuaire public')
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
})

describe('TroupesList session gate', () => {
  it('redirige vers connexion sans session', async () => {
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
          useValue: { listMyTroupes: vi.fn(), joinTroupe: vi.fn(), createTroupe: vi.fn() },
        },
        { provide: MatDialog, useValue: { open: vi.fn() } },
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

    expect(navigate).toHaveBeenCalledWith(['/connexion'], { replaceUrl: true })
  })
})
