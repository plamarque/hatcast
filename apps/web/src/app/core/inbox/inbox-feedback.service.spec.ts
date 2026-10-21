import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest'
import { InboxFeedbackService } from './inbox-feedback.service'
import { MemberInboxBadgeService } from './member-inbox-badge.service'
import { MeInboxApiService, type MeInboxResponse } from './me-inbox-api.service'

const empty: MeInboxResponse = {
  actions: [],
  nextEvent: null,
  noParticipation: false,
  shortcuts: { lastSeasonSlug: null, seasonGlanceQuery: {} },
}

describe('InboxFeedbackService', () => {
  beforeEach(() => {
    sessionStorage.clear()
    TestBed.configureTestingModule({})
  })

  it('suppresses repeated empty confirmations and rearms when tasks are observed', () => {
    const feedback = TestBed.inject(InboxFeedbackService)
    expect(feedback.confirmationPending()).toBe(true)
    feedback.markPresented()
    feedback.observeInbox(empty)
    expect(feedback.confirmationPending()).toBe(false)
    feedback.observeInbox({ ...empty, actions: [{} as MeInboxResponse['actions'][number]] })
    expect(feedback.confirmationPending()).toBe(true)
  })

  afterEach(() => vi.unstubAllGlobals())

  it('resets presentation on logout and account switch', () => {
    const api = TestBed.inject(MeInboxApiService)
    const feedback = TestBed.inject(InboxFeedbackService)
    api.bindSessionUser('A')
    feedback.markPresented()
    api.bindSessionUser('A')
    expect(feedback.confirmationPending()).toBe(false)
    api.bindSessionUser('B')
    expect(feedback.confirmationPending()).toBe(true)
    feedback.markPresented()
    api.invalidateCache()
    expect(feedback.confirmationPending()).toBe(true)
  })
  it('ignores a response from a previous account before cache or feedback updates', async () => {
    const api = TestBed.inject(MeInboxApiService)
    const badge = TestBed.inject(MemberInboxBadgeService)
    const feedback = TestBed.inject(InboxFeedbackService)
    let resolve!: (value: Response) => void
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(
        new Promise<Response>((r) => {
          resolve = r
        }),
      ),
    )
    api.bindSessionUser('A')
    const request = badge.refresh({ force: true })
    api.bindSessionUser('B')
    feedback.markPresented()
    resolve(new Response(JSON.stringify({ ...empty, actions: [{}] }), { status: 200 }))
    expect((await request).ok).toBe(false)
    expect(api.peekFreshCache()).toBeNull()
    expect(feedback.confirmationPending()).toBe(false)
    expect(badge.pendingActionCount()).toBe(0)
  })
})
