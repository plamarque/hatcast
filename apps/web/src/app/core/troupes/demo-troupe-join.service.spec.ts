import { TestBed } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { environment } from '../../../environments/environment'
import { DEMO_ACTIVE_SEASON_SLUG, DEMO_TROUPE_ID } from './demo-troupe.constants'
import { DemoTroupeJoinService } from './demo-troupe-join.service'
import { TroupeApiService } from './troupe-api.service'
import { TroupeContextService } from './troupe-context.service'
import { TroupeSeasonResolverService } from './troupe-season-resolver.service'

describe('DemoTroupeJoinService', () => {
  let troupeApi: { joinTroupe: ReturnType<typeof vi.fn> }
  let troupeContext: { reloadAndSelect: ReturnType<typeof vi.fn> }
  let resolver: { resolveSeasonSlug: ReturnType<typeof vi.fn> }
  let router: { navigate: ReturnType<typeof vi.fn> }
  let snack: { open: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    localStorage.clear()
    environment.demoTroupeId = DEMO_TROUPE_ID
    troupeApi = { joinTroupe: vi.fn().mockResolvedValue({ ok: true, status: 200 }) }
    troupeContext = { reloadAndSelect: vi.fn().mockResolvedValue(true) }
    resolver = {
      resolveSeasonSlug: vi.fn().mockResolvedValue({ kind: 'resolved', troupe: {}, season: {} }),
    }
    router = { navigate: vi.fn().mockResolvedValue(true) }
    snack = { open: vi.fn() }

    TestBed.configureTestingModule({
      providers: [
        DemoTroupeJoinService,
        { provide: TroupeApiService, useValue: troupeApi },
        { provide: TroupeContextService, useValue: troupeContext },
        { provide: TroupeSeasonResolverService, useValue: resolver },
        { provide: Router, useValue: router },
        { provide: MatSnackBar, useValue: snack },
      ],
    })
  })

  afterEach(() => {
    localStorage.clear()
    TestBed.resetTestingModule()
    vi.restoreAllMocks()
  })

  it('rejoint la troupe Démo, recharge le contexte et navigue vers la saison active', async () => {
    const result = await service().join()

    expect(result).toEqual({ ok: true })
    expect(troupeApi.joinTroupe).toHaveBeenCalledWith(DEMO_TROUPE_ID)
    expect(troupeContext.reloadAndSelect).toHaveBeenCalledWith(DEMO_TROUPE_ID)
    expect(snack.open).toHaveBeenCalledWith(
      'Tu as rejoint la troupe de démonstration.',
      'OK',
      { duration: 4000 },
    )
    expect(router.navigate).toHaveBeenCalledWith(['/saison', DEMO_ACTIVE_SEASON_SLUG])
    expect(localStorage.getItem('lastVisitedSeason')).toBe(DEMO_ACTIVE_SEASON_SLUG)
  })

  it('retombe sur le hub Démo si la saison active est introuvable', async () => {
    resolver.resolveSeasonSlug.mockResolvedValue({ kind: 'not-found' })

    const result = await service().join()

    expect(result).toEqual({ ok: true })
    expect(router.navigate).toHaveBeenCalledWith(['/', 'troupes', 'demo'])
  })

  it('signale indisponibilité quand demoTroupeId est vide', async () => {
    environment.demoTroupeId = ''

    const result = await service().join()

    expect(result).toEqual({ ok: false, reason: 'unavailable' })
    expect(snack.open).toHaveBeenCalledWith('Troupe de démonstration indisponible.', 'OK', {
      duration: 6000,
    })
    expect(troupeApi.joinTroupe).not.toHaveBeenCalled()
  })

  it('signale une erreur API de join', async () => {
    troupeApi.joinTroupe.mockResolvedValue({ ok: false, status: 403 })

    const result = await service().join()

    expect(result).toEqual({ ok: false, reason: 'join-failed' })
    expect(snack.open).toHaveBeenCalledWith(
      'Impossible de rejoindre la troupe de démonstration.',
      'OK',
      { duration: 6000 },
    )
  })

  it('signale une erreur de rechargement du contexte', async () => {
    troupeContext.reloadAndSelect.mockResolvedValue(false)

    const result = await service().join()

    expect(result).toEqual({ ok: false, reason: 'reload-failed' })
    expect(snack.open).toHaveBeenCalledWith(
      'Adhésion enregistrée, mais le rechargement des troupes a échoué.',
      'OK',
      { duration: 6000 },
    )
    expect(snack.open).not.toHaveBeenCalledWith(
      'Tu as rejoint la troupe de démonstration.',
      'OK',
      { duration: 4000 },
    )
    expect(router.navigate).not.toHaveBeenCalled()
  })
})

function service(): DemoTroupeJoinService {
  return TestBed.inject(DemoTroupeJoinService)
}
