import { Injectable, signal } from '@angular/core'
import type { MeInboxResponse } from './me-inbox-api.service'

/** Presentation memory only; never suppresses inbox data or requests. */
@Injectable({ providedIn: 'root' })
export class InboxFeedbackService {
  private readonly pending = signal(true)
  private generation = 0
  get scopeRevision(): number {
    return this.generation
  }
  readonly confirmationPending = this.pending.asReadonly()

  observeInbox(data: MeInboxResponse): void {
    if (data.actions.length > 0) this.pending.set(true)
  }

  markPresented(): void {
    this.pending.set(false)
  }

  reset(): void {
    this.generation++
    this.pending.set(true)
  }
}
