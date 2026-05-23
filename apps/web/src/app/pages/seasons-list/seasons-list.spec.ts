import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { provideRouter } from '@angular/router'
import { describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { SeasonApiService } from '../../core/seasons/season-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { SeasonsList } from './seasons-list'

async function settle(fixture: ComponentFixture<SeasonsList>): Promise<void> {
  await fixture.componentInstance.ngOnInit()
  fixture.detectChanges()
  await fixture.whenStable()
  fixture.detectChanges()
}

describe('SeasonsList', () => {
  let fixture: ComponentFixture<SeasonsList>
  let troupeApi: { listMyTroupes: ReturnType<typeof vi.fn>; joinTroupe: ReturnType<typeof vi.fn> }
  let seasonApi: { listSeasons: ReturnType<typeof vi.fn> }

  beforeEach(async () => {
    troupeApi = {
      listMyTroupes: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      joinTroupe: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    }
    seasonApi = {
      listSeasons: vi.fn(),
    }

    await TestBed.configureTestingModule({
      imports: [SeasonsList],
      providers: [
        provideRouter([]),
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        {
          provide: AuthApiService,
          useValue: { ensureHatcastSession: vi.fn().mockResolvedValue({ ok: true, data: { user: {} } }) },
        },
        { provide: TroupeApiService, useValue: troupeApi },
        { provide: SeasonApiService, useValue: seasonApi },
      ],
    }).compileComponents()

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
      data: [{
        id: 'troupe-1',
        name: 'La Malice',
        slug: 'la-malice',
        membership: {
          id: 'm-1',
          displayName: 'Test',
          status: 'ACTIVE',
          createdAt: '',
          updatedAt: '',
        },
      }],
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

  it('rejoint la troupe de démonstration puis recharge les troupes', async () => {
    await fixture.componentInstance['joinDemoTroupe']()

    expect(troupeApi.joinTroupe).toHaveBeenCalled()
    expect(troupeApi.listMyTroupes).toHaveBeenCalledWith()
  })
})
