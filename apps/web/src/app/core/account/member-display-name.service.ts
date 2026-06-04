import { Injectable, inject, signal } from '@angular/core'

import type { UserSummary } from '../auth/auth-api.service'
import { MePreferencesApiService } from './me-preferences-api.service'

/** Cached global member pseudo — shared by Identité tab and account menu rail. */
@Injectable({ providedIn: 'root' })
export class MemberDisplayNameService {
  private readonly mePreferencesApi = inject(MePreferencesApiService)

  readonly memberDisplayName = signal('')
  private loaded = false
  private loadPromise: Promise<boolean> | null = null
  private sessionUserKey: string | null = null

  railLabel(user: UserSummary | null): string {
    const pseudo = this.memberDisplayName().trim()
    if (pseudo) {
      return pseudo
    }
    return user?.email?.trim() || 'Compte'
  }

  /** Clears cached pseudo — call when session user changes or on logout. */
  syncSessionUser(sessionKey: string | null | undefined): void {
    const key = sessionKey?.trim() || null
    if (key === this.sessionUserKey) {
      return
    }
    this.reset()
    this.sessionUserKey = key
  }

  reset(): void {
    this.memberDisplayName.set('')
    this.loaded = false
    this.loadPromise = null
  }

  setFromSave(value: string): void {
    const trimmed = value.trim()
    this.memberDisplayName.set(trimmed)
    this.loaded = true
  }

  async loadFromApi(force = false): Promise<boolean> {
    if (this.loaded && !force) {
      return true
    }
    if (this.loadPromise && !force) {
      return this.loadPromise
    }
    this.loadPromise = this.fetchFromApi(force).finally(() => {
      this.loadPromise = null
    })
    return this.loadPromise
  }

  private async fetchFromApi(force: boolean): Promise<boolean> {
    if (this.loaded && !force) {
      return true
    }
    try {
      const result = await this.mePreferencesApi.getPreferences()
      if (!result.ok || !result.data) {
        return false
      }
      this.memberDisplayName.set(result.data.memberDisplayName.trim())
      this.loaded = true
      return true
    } catch {
      return false
    }
  }
}
