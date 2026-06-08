import { Injectable } from '@angular/core'

import { csrfHeaders } from '../http/hatcast-csrf'

export type NotificationPreferenceKey =
  | 'AVAILABILITY_REQUEST'
  | 'COMPOSITION_SHARED'
  | 'CONFIRMATION_REQUEST'
  | 'TEAM_CONFIRMED'
  | 'EVENT_DETAILS_CHANGED'
  | 'EVENT_ARCHIVED'
  | 'REMINDER_7_DAYS'
  | 'REMINDER_1_DAY'
  | 'AVAILABILITY_WEEKLY_REMINDER'

export type NotificationPreferenceGroup = 'NOTIFICATIONS' | 'AUTOMATIC_REMINDERS'

export interface NotificationPreferenceCategory {
  key: NotificationPreferenceKey
  label: string
  group: NotificationPreferenceGroup
  pushEnabled: boolean
  emailEnabled: boolean
}

export interface NotificationPreferencesResponse {
  categories: NotificationPreferenceCategory[]
}

export type NotificationPreferencePatch = {
  preferences: Partial<
    Record<NotificationPreferenceKey, { push?: boolean; email?: boolean }>
  >
}

export type ApiResult<T> = { ok: boolean; status: number; data?: T }

@Injectable({ providedIn: 'root' })
export class MeNotificationPreferencesApiService {
  async getPreferences(): Promise<ApiResult<NotificationPreferencesResponse>> {
    try {
      const res = await fetch('/v1/me/notification-preferences', { credentials: 'include' })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as NotificationPreferencesResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async patchPreferences(
    body: NotificationPreferencePatch,
  ): Promise<ApiResult<NotificationPreferencesResponse>> {
    try {
      const res = await fetch('/v1/me/notification-preferences', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as NotificationPreferencesResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
