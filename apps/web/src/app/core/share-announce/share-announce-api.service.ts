import { Injectable } from '@angular/core'

import { csrfHeaders } from '../http/hatcast-csrf'
import type { ShareAnnounceIntent } from '../messaging/share-announce-messages'

export interface ShareRecipientChannels {
  email: boolean
  push: boolean
}

export interface ShareRecipient {
  participantId: string
  displayName: string
  emailObfuscated: string | null
  channels: ShareRecipientChannels
}

export interface ShareRecipientsResponse {
  total: number
  notifiableCount: number
  manualCount: number
  recipients: ShareRecipient[]
}

type ShareApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; errorMessage?: string }

async function readApiErrorMessage(res: Response): Promise<string | undefined> {
  try {
    const body = (await res.json()) as { message?: string }
    return body.message?.trim() || undefined
  } catch {
    return undefined
  }
}

@Injectable({ providedIn: 'root' })
export class ShareAnnounceApiService {
  async getRecipients(
    seasonId: string,
    eventId: string,
    intent: ShareAnnounceIntent,
  ): Promise<ShareApiResult<ShareRecipientsResponse>> {
    try {
      const url =
        `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/share-recipients` +
        `?intent=${encodeURIComponent(intent)}`
      const res = await fetch(url, { credentials: 'include' })
      if (!res.ok) {
        return { ok: false, status: res.status, errorMessage: await readApiErrorMessage(res) }
      }
      const data = (await res.json()) as ShareRecipientsResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async sendNotifications(
    seasonId: string,
    eventId: string,
    intent: ShareAnnounceIntent,
    messageText: string,
  ): Promise<ShareApiResult<{ accepted: boolean }>> {
    try {
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/share-recipients/notify`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            ...csrfHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ intent, messageText }),
        },
      )
      if (!res.ok) {
        return { ok: false, status: res.status, errorMessage: await readApiErrorMessage(res) }
      }
      const data = (await res.json()) as { accepted: boolean }
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
