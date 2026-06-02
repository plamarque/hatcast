import { Injectable } from '@angular/core'

import { csrfHeaders } from '../http/hatcast-csrf'

export interface MePushStatus {
  enabled: boolean
  browserPermission?: string | null
  subscriptionCount: number
}

export interface PublicConfig {
  webPushVapidPublicKey?: string | null
}

export type ApiResult<T> = { ok: boolean; status: number; data?: T }

@Injectable({ providedIn: 'root' })
export class MePushApiService {
  async getPublicConfig(): Promise<ApiResult<PublicConfig>> {
    try {
      const res = await fetch('/v1/config/public')
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as PublicConfig
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async getStatus(browserPermission?: NotificationPermission): Promise<ApiResult<MePushStatus>> {
    try {
      const params = browserPermission ? `?browserPermission=${encodeURIComponent(browserPermission)}` : ''
      const res = await fetch(`/v1/me/push${params}`, { credentials: 'include' })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as MePushStatus
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async registerSubscription(subscription: PushSubscriptionJSON): Promise<ApiResult<MePushStatus>> {
    try {
      const res = await fetch('/v1/me/push/subscription', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify(subscription),
      })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as MePushStatus
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async deleteSubscription(endpoint?: string): Promise<ApiResult<MePushStatus>> {
    try {
      const query = endpoint ? `?endpoint=${encodeURIComponent(endpoint)}` : ''
      const res = await fetch(`/v1/me/push/subscription${query}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: csrfHeaders(),
      })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as MePushStatus
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async setEnabled(enabled: boolean): Promise<ApiResult<MePushStatus>> {
    try {
      const res = await fetch('/v1/me/push', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify({ enabled }),
      })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as MePushStatus
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
