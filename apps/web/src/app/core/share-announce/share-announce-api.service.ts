import { Injectable } from '@angular/core'

import { csrfHeaders } from '../http/hatcast-csrf'
import type { ShareAnnounceIntent } from '../messaging/share-announce-messages'

export interface ShareRecipientChannelStatus {
  eligible: boolean
  notified: boolean
}

export interface ShareRecipientChannels {
  email: ShareRecipientChannelStatus
  push: ShareRecipientChannelStatus
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
  lastManualNotifyAt?: string | null
  guardDays?: number | null
}

/** Accepts nested DTO (6.16+) or legacy flat booleans from a stale API. */
export function normalizeShareRecipientChannelStatus(value: unknown): ShareRecipientChannelStatus {
  if (typeof value === 'boolean') {
    return { eligible: value, notified: false }
  }
  if (value && typeof value === 'object') {
    const obj = value as { eligible?: unknown; notified?: unknown }
    return {
      eligible: obj.eligible === true,
      notified: obj.notified === true,
    }
  }
  return { eligible: false, notified: false }
}

function normalizeShareRecipient(raw: ShareRecipient): ShareRecipient {
  return {
    ...raw,
    channels: {
      email: normalizeShareRecipientChannelStatus(raw.channels?.email),
      push: normalizeShareRecipientChannelStatus(raw.channels?.push),
    },
  }
}

export function normalizeShareRecipientsResponse(data: ShareRecipientsResponse): ShareRecipientsResponse {
  const recipients = data.recipients.map(normalizeShareRecipient)
  const notifiableCount = recipients.filter(
    (r) => r.channels.email.eligible || r.channels.push.eligible,
  ).length
  return {
    ...data,
    recipients,
    notifiableCount,
    manualCount: recipients.length - notifiableCount,
  }
}

export interface ShareNotifyResponse {
  accepted: boolean
  notifiedCount: number
  manualCount: number
  intent: ShareAnnounceIntent
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
      const data = normalizeShareRecipientsResponse((await res.json()) as ShareRecipientsResponse)
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
  ): Promise<ShareApiResult<ShareNotifyResponse>> {
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
      const data = (await res.json()) as ShareNotifyResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
