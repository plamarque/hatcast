import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { rememberLastVisitedTroupeSlug } from './last-visited-troupe-storage'
import { LastVisitedTroupeShortcutService } from './last-visited-troupe-shortcut.service'

describe('LastVisitedTroupeShortcutService', () => {
  beforeEach(() => {
    localStorage.clear()
    TestBed.configureTestingModule({
      providers: [LastVisitedTroupeShortcutService],
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('resolves link from stored troupe slug', () => {
    rememberLastVisitedTroupeSlug('malice')

    const service = TestBed.inject(LastVisitedTroupeShortcutService)
    service.refresh()

    expect(service.troupeSlug()).toBe('malice')
    expect(service.link()).toBe('/troupes/malice')
  })

  it('falls back to troupes list when no slug stored', () => {
    const service = TestBed.inject(LastVisitedTroupeShortcutService)
    service.refresh()

    expect(service.troupeSlug()).toBeNull()
    expect(service.link()).toBe('/troupes')
  })

  it('marks troupe tab active on hub and admin routes', () => {
    const service = TestBed.inject(LastVisitedTroupeShortcutService)

    expect(service.isTroupeTabActive('/troupes/malice')).toBe(true)
    expect(service.isTroupeTabActive('/troupes/malice/admin/membres')).toBe(true)
    expect(service.isTroupeTabActive('/troupes')).toBe(false)
    expect(service.isTroupeTabActive('/accueil')).toBe(false)
  })
})
