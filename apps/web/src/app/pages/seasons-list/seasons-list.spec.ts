import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSelectChange } from '@angular/material/select'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { of } from 'rxjs'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { SeasonApiService } from '../../core/seasons/season-api.service'
import { TroupeApiService, type TroupeListItem } from '../../core/troupes/troupe-api.service'
import { SeasonsList } from './seasons-list'

async function settle(fixture: ComponentFixture<SeasonsList>): Promise<void> {
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

describe('SeasonsList', () => {
  let fixture: ComponentFixture<SeasonsList>
  let troupeApi: { listMyTroupes: ReturnType<typeof vi.fn>; joinTroupe: ReturnType<typeof vi.fn> }
  let seasonApi: { listSeasons: ReturnType<typeof vi.fn> }
  let dialog: { open: ReturnType<typeof vi.fn>; closeAll: ReturnType<typeof vi.fn> }

  afterEach(() => {
    localStorage.clear()
  })

  beforeEach(async () => {
    localStorage.clear()
    troupeApi = {
      listMyTroupes: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      joinTroupe: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    }
    seasonApi = {
      listSeasons: vi.fn(),
    }
    dialog = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(false) }),
      closeAll: vi.fn(),
    }

    await TestBed.configureTestingModule({
      imports: [SeasonsList, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        {
          provide: AuthApiService,
          useValue: { ensureHatcastSession: vi.fn().mockResolvedValue({ ok: true, data: { user: {} } }) },
        },
        { provide: TroupeApiService, useValue: troupeApi },
        { provide: SeasonApiService, useValue: seasonApi },
      ],
    }).compileComponents()
    TestBed.overrideProvider(MatDialog, { useValue: dialog })

    fixture = TestBed.createComponent(SeasonsList)
  })

  it('gère l’état sans adhésion quand aucune troupe', async () => {
    await settle(fixture)

    expect(troupeApi.listMyTroupes).toHaveBeenCalled()
    expect(fixture.componentInstance['loadingList']()).toBe(false)
    expect(fixture.componentInstance['loadError']()).toBe(false)
    expect(fixture.componentInstance['hasMembership']()).toBe(false)
    expect(seasonApi.listSeasons).not.toHaveBeenCalled()
  })

  it('distingue une erreur de chargement de l’absence d’adhésion', async () => {
    troupeApi.listMyTroupes.mockResolvedValue({ ok: false, status: 500 })

    await settle(fixture)

    expect(fixture.componentInstance['loadingList']()).toBe(false)
    expect(fixture.componentInstance['loadError']()).toBe(true)
    expect(seasonApi.listSeasons).not.toHaveBeenCalled()
  })

  it('charge les saisons quand l’utilisateur a une adhésion', async () => {
    troupeApi.listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [troupe('troupe-1', 'La Malice', 'TROUPE_ADMIN')],
    })
    seasonApi.listSeasons.mockResolvedValue({
      ok: true,
      status: 200,
      data: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 },
    })

    await settle(fixture)

    expect(seasonApi.listSeasons).toHaveBeenCalledWith('troupe-1', 0, 20)
    expect(fixture.componentInstance['loadError']()).toBe(false)
    expect(fixture.nativeElement.textContent).not.toContain('Aucune troupe pour l’instant')
  })

  it('masque les actions admin pour un membre sans TROUPE_ADMIN', async () => {
    troupeApi.listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [troupe('troupe-1', 'La Malice', 'MEMBER')],
    })
    seasonApi.listSeasons.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        content: [{
          id: 'season-1',
          troupeId: 'troupe-1',
          slug: 'saison-a',
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
        }],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      },
    })

    await settle(fixture)

    expect(fixture.componentInstance['canManageSeasons']()).toBe(false)
    expect(fixture.nativeElement.textContent).not.toContain('Nouvelle saison')
  })

  it('rejoint la troupe de démonstration puis recharge les troupes', async () => {
    await fixture.componentInstance['joinDemoTroupe']()

    expect(troupeApi.joinTroupe).toHaveBeenCalled()
    expect(troupeApi.listMyTroupes).toHaveBeenCalledWith()
  })

  it('affiche un switcher seulement quand plusieurs troupes actives existent', async () => {
    troupeApi.listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [troupe('troupe-1', 'La Malice'), troupe('troupe-2', 'Les Impros')],
    })
    seasonApi.listSeasons.mockResolvedValue({
      ok: true,
      status: 200,
      data: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 },
    })

    await settle(fixture)

    expect(fixture.nativeElement.textContent).toContain('Troupe')
    expect(fixture.nativeElement.textContent).toContain('La Malice')
    expect(fixture.nativeElement.textContent).toContain('Changer de troupe')
  })

  it('masque le contrôle de changement quand une seule troupe active existe', async () => {
    troupeApi.listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [troupe('troupe-1', 'La Malice')],
    })
    seasonApi.listSeasons.mockResolvedValue({
      ok: true,
      status: 200,
      data: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 },
    })

    await settle(fixture)

    expect(fixture.nativeElement.textContent).toContain('La Malice')
    expect(fixture.nativeElement.textContent).not.toContain('Changer de troupe')
  })

  it('recharge la liste avec la troupe sélectionnée et remet la pagination au début', async () => {
    troupeApi.listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [troupe('troupe-1', 'La Malice'), troupe('troupe-2', 'Les Impros', 'TROUPE_ADMIN')],
    })
    seasonApi.listSeasons.mockResolvedValue({
      ok: true,
      status: 200,
      data: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 },
    })
    await settle(fixture)

    fixture.componentInstance['pageIndex'].set(3)
    fixture.componentInstance['onTroupeChange']({ value: 'troupe-2' } as MatSelectChange)
    await fixture.whenStable()

    expect(dialog.closeAll).toHaveBeenCalled()
    expect(fixture.componentInstance['pageIndex']()).toBe(0)
    expect(fixture.componentInstance['canManageSeasons']()).toBe(true)
    expect(seasonApi.listSeasons).toHaveBeenLastCalledWith('troupe-2', 0, 20)
  })

  it('ouvre la création avec la troupe sélectionnée', async () => {
    troupeApi.listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [troupe('troupe-1', 'La Malice'), troupe('troupe-2', 'Les Impros', 'TROUPE_ADMIN')],
    })
    seasonApi.listSeasons.mockResolvedValue({
      ok: true,
      status: 200,
      data: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 },
    })
    localStorage.setItem('hatcast.selectedTroupeId', 'troupe-2')
    await settle(fixture)

    fixture.componentInstance['openCreate']()

    expect(dialog.open).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({
      data: expect.objectContaining({ mode: 'create', troupeId: 'troupe-2' }),
    }))
  })
})

function troupe(
  id: string,
  name: string,
  baselineRole: 'MEMBER' | 'TROUPE_ADMIN' = 'MEMBER',
): TroupeListItem {
  return {
    id,
    name,
    slug: id,
    membership: {
      id: `membership-${id}`,
      displayName: name,
      status: 'ACTIVE',
      baselineRole,
      createdAt: '',
      updatedAt: '',
    },
  }
}
