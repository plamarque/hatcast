import { computed, Injectable, inject, signal } from '@angular/core'

import type { UserSummary } from '../auth/auth-api.service'
import type { MemberGender } from './member-gender'
import { effectiveMemberGender } from './member-gender'
import { MePreferencesApiService } from './me-preferences-api.service'

/** Cached global member pseudo — shared by Identité tab and account menu rail. */
@Injectable({ providedIn: 'root' })
export class MemberDisplayNameService {
  private readonly mePreferencesApi = inject(MePreferencesApiService)

  readonly memberDisplayName = signal('')
  readonly memberGender = signal<MemberGender>('non_specified')
  /** Unsaved Mon profil gender — live avatar preview on rail/menu (UX Screen 1). */
  private readonly memberGenderPreview = signal<MemberGender | null>(null)
  readonly avatarGender = computed(
    () => this.memberGenderPreview() ?? this.memberGender(),
  )
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
    this.memberGender.set('non_specified')
    this.memberGenderPreview.set(null)
    this.loaded = false
    this.loadPromise = null
  }

  setGenderPreview(gender: MemberGender | null): void {
    this.memberGenderPreview.set(gender)
  }

  setFromSave(value: string, gender?: MemberGender | null): void {
    const trimmed = value.trim()
    this.memberDisplayName.set(trimmed)
    if (gender !== undefined) {
      this.memberGender.set(effectiveMemberGender(gender))
    }
    this.memberGenderPreview.set(null)
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
      this.memberGender.set(effectiveMemberGender(result.data.gender))
      this.loaded = true
      return true
    } catch {
      return false
    }
  }
}
