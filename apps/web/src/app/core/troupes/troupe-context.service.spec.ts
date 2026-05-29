import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { TroupeListItem } from './troupe-api.service'
import { TroupeApiService } from './troupe-api.service'
import { TroupeContextService } from './troupe-context.service'

describe('TroupeContextService', () => {
  let api: { listMyTroupes: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    localStorage.clear()
    api = { listMyTroupes: vi.fn() }
    TestBed.configureTestingModule({
      providers: [
        TroupeContextService,
        { provide: TroupeApiService, useValue: api },
      ],
    })
  })

  afterEach(() => {
    localStorage.clear()
    TestBed.resetTestingModule()
  })

  it('restaure une troupe préférée encore active', async () => {
    localStorage.setItem('hatcast.selectedTroupeId', 'troupe-2')
    api.listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [troupe('troupe-1', 'La Malice'), troupe('troupe-2', 'Les Impros')],
    })

    const loaded = await service().load()

    expect(loaded).toBe(true)
    expect(service().selectedTroupe()?.id).toBe('troupe-2')
    expect(localStorage.getItem('hatcast.selectedTroupeId')).toBe('troupe-2')
  })

  it('retombe sur la première troupe active quand la préférence est invalide', async () => {
    localStorage.setItem('hatcast.selectedTroupeId', 'ancienne-troupe')
    api.listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [troupe('troupe-1', 'La Malice'), troupe('troupe-2', 'Les Impros')],
    })

    await service().load()

    expect(service().selectedTroupe()?.id).toBe('troupe-1')
    expect(localStorage.getItem('hatcast.selectedTroupeId')).toBe('troupe-1')
  })

  it('sélectionne explicitement une troupe active et persiste uniquement son id', async () => {
    api.listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [troupe('troupe-1', 'La Malice'), troupe('troupe-2', 'Les Impros')],
    })
    await service().load()

    const selected = service().selectTroupe('troupe-2')

    expect(selected).toBe(true)
    expect(service().selectedTroupe()?.name).toBe('Les Impros')
    expect(localStorage.getItem('hatcast.selectedTroupeId')).toBe('troupe-2')
  })

  it('ignore les adhésions inactives', async () => {
    api.listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [troupe('troupe-1', 'Inactive', 'INACTIVE'), troupe('troupe-2', 'Active')],
    })

    await service().load()

    expect(service().activeTroupes().map((t) => t.id)).toEqual(['troupe-2'])
    expect(service().selectedTroupe()?.id).toBe('troupe-2')
  })

  it('priorise le pseudo troupe pour le libellé utilisateur courant', async () => {
    api.listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [troupe('troupe-1', 'La Malice', 'ACTIVE', 'Patou')],
    })
    await service().load()

    expect(
      service().currentUserDisplayLabel({
        displayName: 'Account Name',
        email: 'a@example.com',
      }),
    ).toBe('Patou')
  })

  it('met à jour localement le pseudo après patchMembershipDisplayName', async () => {
    api.listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [troupe('troupe-1', 'La Malice', 'ACTIVE', 'Avant')],
    })
    await service().load()

    service().patchMembershipDisplayName('troupe-1', 'Après')

    expect(service().selectedTroupe()?.membership.displayName).toBe('Après')
    expect(service().activeTroupes()[0].membership.displayName).toBe('Après')
  })

  function service(): TroupeContextService {
    return TestBed.inject(TroupeContextService)
  }
})

function troupe(
  id: string,
  name: string,
  status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE',
  displayName = name,
): TroupeListItem {
  return {
    id,
    name,
    slug: id,
    isDemo: false,
    joinPolicy: 'OPEN',
    activeMemberCount: 1,
    upcomingEventCount: 0,
    membership: {
      id: `membership-${id}`,
      displayName,
      status,
      baselineRole: 'MEMBER',
      createdAt: '',
      updatedAt: '',
    },
  }
}
