import { inject, Injectable, signal } from '@angular/core'
import { InboxFeedbackService } from './inbox-feedback.service'

import {
  MeInboxApiService,
  type MeInboxApiResult,
  type MeInboxResponse,
} from './me-inbox-api.service'

/** Display label for the Accueil nav badge (empty when count is 0). */
export function inboxBadgeDisplayLabel(count: number): string {
  if (count <= 0) {
    return ''
  }
  if (count > 9) {
    return '9+'
  }
  return String(count)
}

@Injectable({ providedIn: 'root' })
export class MemberInboxBadgeService {
  private readonly inboxApi = inject(MeInboxApiService)
  private readonly feedback = inject(InboxFeedbackService)

  readonly pendingActionCount = signal(0)

  peekFreshCache(): MeInboxResponse | null {
    return this.inboxApi.peekFreshCache()
  }

  async refresh(options?: {
    force?: boolean
    preserveBadgeOnError?: boolean
  }): Promise<MeInboxApiResult> {
    const scope = this.feedback.scopeRevision
    const res = await this.inboxApi.getInbox({ force: options?.force })
    if (scope !== this.feedback.scopeRevision) return { ok: false, status: 0 }
    if (res.ok && res.data) {
      this.feedback.observeInbox(res.data)
      this.pendingActionCount.set(res.data.actions.length)
      return res
    }
    if (!options?.preserveBadgeOnError) {
      this.pendingActionCount.set(0)
    }
    return res
  }
}
