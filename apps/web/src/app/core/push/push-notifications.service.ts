import { Injectable, inject } from '@angular/core'

import { environment } from '../../../environments/environment'
import { MePushApiService, type MePushStatus } from './me-push-api.service'

export type PushUiState =
  | 'unsupported'
  | 'loading'
  | 'denied'
  | 'disabled'
  | 'enabled'
  | 'error'

@Injectable({ providedIn: 'root' })
export class PushNotificationsService {
  private readonly api = inject(MePushApiService)

  canUsePush(): boolean {
    return typeof window !== 'undefined' && 'PushManager' in window && 'serviceWorker' in navigator
  }

  getPermission(): NotificationPermission {
    if (typeof Notification === 'undefined') {
      return 'denied'
    }
    return Notification.permission
  }

  async loadStatus(): Promise<{ state: PushUiState; status?: MePushStatus }> {
    if (!this.canUsePush()) {
      return { state: 'unsupported' }
    }

    const permission = this.getPermission()
    const result = await this.api.getStatus(permission)
    if (!result.ok || !result.data) {
      return { state: 'error' }
    }

    const status = result.data
    if (permission === 'denied') {
      await this.syncCurrentDeviceDisabled()
      return { state: 'denied', status }
    }

    const localSub = await this.getLocalSubscription()
    const enabled = status.enabled && permission === 'granted' && localSub != null
    return { state: enabled ? 'enabled' : 'disabled', status }
  }

  async enable(): Promise<{ ok: boolean; state: PushUiState; message?: string }> {
    if (!this.canUsePush()) {
      return { ok: false, state: 'unsupported' }
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      await this.syncDeniedState()
      return {
        ok: false,
        state: permission === 'denied' ? 'denied' : 'disabled',
        message:
          permission === 'denied'
            ? 'Autorisation refusée. Réactivez les notifications dans les paramètres du navigateur.'
            : undefined,
      }
    }

    try {
      const vapidKey = await this.resolveVapidPublicKey()
      if (!vapidKey) {
        return {
          ok: false,
          state: 'error',
          message: 'Configuration push indisponible (clé VAPID manquante).',
        }
      }

      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })
      }

      const json = subscription.toJSON()
      if (!json.endpoint || !json.keys?.['p256dh'] || !json.keys?.['auth']) {
        return { ok: false, state: 'error', message: 'Abonnement push invalide.' }
      }

      const result = await this.api.registerSubscription(json)
      if (!result.ok || !result.data) {
        return { ok: false, state: 'error', message: 'Enregistrement serveur impossible.' }
      }

      return { ok: true, state: 'enabled' }
    } catch {
      return { ok: false, state: 'error', message: 'Activation des notifications impossible.' }
    }
  }

  async disable(): Promise<{ ok: boolean; state: PushUiState }> {
    const registration = await navigator.serviceWorker.ready.catch(() => null)
    const subscription = registration ? await registration.pushManager.getSubscription() : null
    const endpoint = subscription?.endpoint

    const result = endpoint ? await this.api.deleteSubscription(endpoint) : { ok: true, status: 200 }

    if (!result.ok) {
      return { ok: false, state: 'error' }
    }

    if (subscription) {
      await subscription.unsubscribe().catch(() => undefined)
    }

    return { ok: true, state: 'disabled' }
  }

  private async syncDeniedState(): Promise<void> {
    await this.syncCurrentDeviceDisabled()
  }

  private async syncCurrentDeviceDisabled(): Promise<void> {
    const registration = await navigator.serviceWorker.ready.catch(() => null)
    const subscription = registration ? await registration.pushManager.getSubscription() : null
    if (subscription) {
      const endpoint = subscription.endpoint
      await this.api.deleteSubscription(endpoint)
      await subscription.unsubscribe().catch(() => undefined)
    }
  }

  private async getLocalSubscription(): Promise<PushSubscription | null> {
    if (!this.canUsePush()) {
      return null
    }
    try {
      const registration = await navigator.serviceWorker.ready
      return registration.pushManager.getSubscription()
    } catch {
      return null
    }
  }

  private async resolveVapidPublicKey(): Promise<string | null> {
    const fromEnv = environment.webPushVapidPublicKey?.trim()
    if (fromEnv) {
      return fromEnv
    }
    const config = await this.api.getPublicConfig()
    const fromApi = config.data?.webPushVapidPublicKey?.trim()
    return fromApi || null
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const outputArray = new Uint8Array(buffer)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
