import { TestBed } from '@angular/core/testing'
import { describe, expect, it, vi } from 'vitest'

import { MePreferencesApiService } from './me-preferences-api.service'
import { MemberDisplayNameService } from './member-display-name.service'

async function setupService(getPreferences = vi.fn()) {
  await TestBed.configureTestingModule({
    providers: [
      MemberDisplayNameService,
      {
        provide: MePreferencesApiService,
        useValue: { getPreferences },
      },
    ],
  }).compileComponents()

  return {
    service: TestBed.inject(MemberDisplayNameService),
    getPreferences,
  }
}

describe('MemberDisplayNameService', () => {
  it('railLabel prefers pseudo over email', async () => {
    const { service } = await setupService()
    service.setFromSave('Alice Membre')
    expect(service.railLabel({ email: 'alice@example.com' } as never)).toBe('Alice Membre')
  })

  it('railLabel falls back to email then Compte', async () => {
    const { service } = await setupService()
    service.setFromSave('')
    expect(service.railLabel({ email: 'alice@example.com' } as never)).toBe('alice@example.com')
    expect(service.railLabel(null)).toBe('Compte')
  })

  it('loadFromApi caches memberDisplayName', async () => {
    const getPreferences = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: { memberDisplayName: '  Léa  ', preferredRoleKeys: [] },
    })
    const { service } = await setupService(getPreferences)

    expect(await service.loadFromApi()).toBe(true)
    expect(service.memberDisplayName()).toBe('Léa')
    expect(getPreferences).toHaveBeenCalledTimes(1)

    expect(await service.loadFromApi()).toBe(true)
    expect(getPreferences).toHaveBeenCalledTimes(1)
  })

  it('loadFromApi coalesces concurrent callers', async () => {
    let resolveFetch!: (value: unknown) => void
    const getPreferences = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    const { service } = await setupService(getPreferences)

    const first = service.loadFromApi()
    const second = service.loadFromApi()
    resolveFetch({
      ok: true,
      status: 200,
      data: { memberDisplayName: 'Léa', preferredRoleKeys: [] },
    })

    expect(await first).toBe(true)
    expect(await second).toBe(true)
    expect(getPreferences).toHaveBeenCalledTimes(1)
  })

  it('syncSessionUser clears cache when user changes', async () => {
    const getPreferences = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: { memberDisplayName: 'Alice', preferredRoleKeys: [] },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: { memberDisplayName: 'Bob', preferredRoleKeys: [] },
      })
    const { service } = await setupService(getPreferences)

    service.syncSessionUser('alice')
    expect(await service.loadFromApi()).toBe(true)
    expect(service.memberDisplayName()).toBe('Alice')

    service.syncSessionUser('bob')
    expect(await service.loadFromApi()).toBe(true)
    expect(service.memberDisplayName()).toBe('Bob')
    expect(getPreferences).toHaveBeenCalledTimes(2)
  })

  it('syncSessionUser clears pseudo on logout', async () => {
    const getPreferences = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: { memberDisplayName: 'Alice', preferredRoleKeys: [] },
    })
    const { service } = await setupService(getPreferences)

    service.syncSessionUser('alice')
    expect(await service.loadFromApi()).toBe(true)
    expect(service.memberDisplayName()).toBe('Alice')

    service.syncSessionUser(null)
    expect(service.memberDisplayName()).toBe('')
  })
})
