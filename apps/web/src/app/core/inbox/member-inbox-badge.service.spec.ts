import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MeInboxApiService } from './me-inbox-api.service'
import {
  inboxBadgeDisplayLabel,
  MemberInboxBadgeService,
} from './member-inbox-badge.service'

describe('inboxBadgeDisplayLabel', () => {
  it('formats badge labels', () => {
    expect(inboxBadgeDisplayLabel(0)).toBe('')
    expect(inboxBadgeDisplayLabel(3)).toBe('3')
    expect(inboxBadgeDisplayLabel(9)).toBe('9')
    expect(inboxBadgeDisplayLabel(10)).toBe('9+')
    expect(inboxBadgeDisplayLabel(12)).toBe('9+')
  })
})

describe('MemberInboxBadgeService', () => {
  let inboxApi: {
    getInbox: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    inboxApi = { getInbox: vi.fn() }
    TestBed.configureTestingModule({
      providers: [
        MemberInboxBadgeService,
        { provide: MeInboxApiService, useValue: inboxApi },
      ],
    })
  })

  it('sets pending count from inbox actions', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        actions: [{}, {}, {}],
        nextEvent: null,
        shortcuts: { lastSeasonSlug: null, seasonGlanceQuery: {} },
        noParticipation: false,
      },
    })

    const service = TestBed.inject(MemberInboxBadgeService)
    await service.refresh()

    expect(inboxApi.getInbox).toHaveBeenCalledWith({ force: undefined })
    expect(service.pendingActionCount()).toBe(3)
  })

  it('returns inbox API result from refresh', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        actions: [{}, {}],
        nextEvent: null,
        shortcuts: { lastSeasonSlug: null, seasonGlanceQuery: {} },
        noParticipation: false,
      },
    })

    const service = TestBed.inject(MemberInboxBadgeService)
    const result = await service.refresh({ force: true })

    expect(result.ok).toBe(true)
    expect(result.data?.actions.length).toBe(2)
  })

  it('passes force option through to inbox API', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        actions: [{}],
        nextEvent: null,
        shortcuts: { lastSeasonSlug: null, seasonGlanceQuery: {} },
        noParticipation: false,
      },
    })

    const service = TestBed.inject(MemberInboxBadgeService)
    await service.refresh({ force: true })

    expect(inboxApi.getInbox).toHaveBeenCalledWith({ force: true })
  })

  it('resets count when inbox fails', async () => {
    inboxApi.getInbox.mockResolvedValue({ ok: false, status: 500 })

    const service = TestBed.inject(MemberInboxBadgeService)
    await service.refresh()

    expect(service.pendingActionCount()).toBe(0)
  })

  it('preserves count when inbox fails with preserveBadgeOnError', async () => {
    inboxApi.getInbox.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        actions: [{}, {}],
        nextEvent: null,
        shortcuts: { lastSeasonSlug: null, seasonGlanceQuery: {} },
        noParticipation: false,
      },
    })

    const service = TestBed.inject(MemberInboxBadgeService)
    await service.refresh()
    expect(service.pendingActionCount()).toBe(2)

    inboxApi.getInbox.mockResolvedValue({ ok: false, status: 500 })
    await service.refresh({ force: true, preserveBadgeOnError: true })

    expect(service.pendingActionCount()).toBe(2)
  })
})
