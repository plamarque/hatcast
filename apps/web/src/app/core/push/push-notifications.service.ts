import { Injectable, inject, signal } from '@angular/core'

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
  private readonly uiStateSignal = signal<PushUiState>('loading')

  /** Shared push gate state — siblings (prefs grid) react without page reload. */
  readonly uiState = this.uiStateSignal.asReadonly()

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
      return this.publishState('unsupported')
    }

    const permission = this.getPermission()
    const result = await this.api.getStatus(permission)
    if (!result.ok || !result.data) {
      return this.publishState('error')
    }

    const status = result.data
    if (permission === 'denied') {
      await this.syncCurrentDeviceDisabled()
      return this.publishState('denied', status)
    }

    const localSub = await this.getLocalSubscription()
    const enabled = status.enabled && permission === 'granted' && localSub != null
    return this.publishState(enabled ? 'enabled' : 'disabled', status)
  }

  async enable(): Promise<{ ok: boolean; state: PushUiState; message?: string }> {
    if (!this.canUsePush()) {
      return { ok: false, ...this.publishState('unsupported') }
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      await this.syncDeniedState()
      const state = permission === 'denied' ? 'denied' : 'disabled'
      return {
        ok: false,
        ...this.publishState(state),
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
          ...this.publishState('error'),
          message: 'Configuration push indisponible (clé VAPID manquante).',
        }
      }

      const registration = await this.waitForServiceWorkerRegistration()
      if (!registration) {
        return {
          ok: false,
          ...this.publishState('error'),
          message:
            'Service worker indisponible. En local, lancez le front en build production (ng serve --configuration=production) ; l’installation PWA n’est pas requise.',
        }
      }

      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })
      }

      const json = subscription.toJSON()
      if (!json.endpoint || !json.keys?.['p256dh'] || !json.keys?.['auth']) {
        return { ok: false, ...this.publishState('error'), message: 'Abonnement push invalide.' }
      }

      const result = await this.api.registerSubscription(json)
      if (!result.ok || !result.data) {
        return { ok: false, ...this.publishState('error'), message: 'Enregistrement serveur impossible.' }
      }

      return { ok: true, ...this.publishState('enabled') }
    } catch {
      return { ok: false, ...this.publishState('error'), message: 'Activation des notifications impossible.' }
    }
  }

  async disable(): Promise<{ ok: boolean; state: PushUiState }> {
    const registration = await this.getServiceWorkerRegistration()
    const subscription = registration ? await registration.pushManager.getSubscription() : null
    const endpoint = subscription?.endpoint

    const result = endpoint ? await this.api.deleteSubscription(endpoint) : { ok: true, status: 200 }

    if (!result.ok) {
      return { ok: false, ...this.publishState('error') }
    }

    if (subscription) {
      await subscription.unsubscribe().catch(() => undefined)
    }

    return { ok: true, ...this.publishState('disabled') }
  }

  private publishState(state: PushUiState, status?: MePushStatus): { state: PushUiState; status?: MePushStatus } {
    this.uiStateSignal.set(state)
    return status === undefined ? { state } : { state, status }
  }

  private async syncDeniedState(): Promise<void> {
    await this.syncCurrentDeviceDisabled()
  }

  private async syncCurrentDeviceDisabled(): Promise<void> {
    const registration = await this.getServiceWorkerRegistration()
    const subscription = registration ? await registration.pushManager.getSubscription() : null
    if (subscription) {
      const endpoint = subscription.endpoint
      await this.api.deleteSubscription(endpoint)
      await subscription.unsubscribe().catch(() => undefined)
    }
  }

  private async getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (!this.canUsePush()) {
      return null
    }
    try {
      return (await navigator.serviceWorker.getRegistration()) ?? null
    } catch {
      return null
    }
  }

  /** Waits for SW registration (prod PWA) without hanging when none exists (ng serve dev). */
  private async waitForServiceWorkerRegistration(
    timeoutMs = 3_000,
  ): Promise<ServiceWorkerRegistration | null> {
    const existing = await this.getServiceWorkerRegistration()
    if (existing?.active) {
      return existing
    }

    try {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
      ])
      return registration ?? null
    } catch {
      return null
    }
  }

  private async getLocalSubscription(): Promise<PushSubscription | null> {
    const registration = await this.getServiceWorkerRegistration()
    if (!registration) {
      return null
    }
    try {
      return await registration.pushManager.getSubscription()
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
