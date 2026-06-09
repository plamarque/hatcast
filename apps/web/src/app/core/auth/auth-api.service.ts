import { inject, Injectable, signal } from '@angular/core'
import { signOut } from 'firebase/auth'

import { MePreferencesApiService } from '../account/me-preferences-api.service'
import { MeInboxApiService } from '../inbox/me-inbox-api.service'
import { ProductAnalyticsService } from '../analytics/product-analytics.service'
import { TroupeApiService } from '../troupes/troupe-api.service'
import { csrfHeaders } from '../http/hatcast-csrf'
import { FirebaseAuthService } from './firebase-auth.service'
import {
  clearHatcastRememberMePreference,
  getHatcastRememberMePreference,
} from './hatcast-remember-me-storage'
import {
  delayMs,
  IDP_SIGNUP_RETRY_BACKOFF_MS,
  IDP_SIGNUP_RETRY_MAX_ATTEMPTS,
  isTransientIdpFailure,
} from './idp-transient-retry'

export interface UserSummary {
  id: string
  slug: string
  email: string | null
  displayName: string | null
  avatarUrl?: string | null
  hasGoogleAccount?: boolean
}

export interface AuthSessionBody {
  user: UserSummary
  googlePictureUrl?: string | null
  platformAdmin?: boolean
}

export type AuthSessionResult = { ok: boolean; status: number; data?: AuthSessionBody }

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly firebaseAuth = inject(FirebaseAuthService)
  private readonly mePreferencesApi = inject(MePreferencesApiService)
  private readonly meInboxApi = inject(MeInboxApiService)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly productAnalytics = inject(ProductAnalyticsService)
  private readonly sessionUserSignal = signal<UserSummary | null>(null)
  private sessionCache: AuthSessionResult | null = null
  private sessionCacheGeneration = 0
  private ensureInFlight: Promise<AuthSessionResult> | null = null

  /** Utilisateur HatCast en session (mis à jour par ensureHatcastSession et les flux auth). */
  readonly sessionUser = this.sessionUserSignal.asReadonly()

  /**
   * GET /v1/auth/me ; si 401 et « se souvenir de moi » + session Firebase encore présente,
   * rééchange un ID token Identity Platform → session HatCast (redémarrage API / perte cookie serveur).
   * Session memo until logout / 401 / force refresh (PERF-04).
   */
  async ensureHatcastSession(options?: { force?: boolean }): Promise<AuthSessionResult> {
    const force = options?.force ?? false

    if (!force && this.sessionCache?.ok) {
      return this.sessionCache
    }

    if (this.ensureInFlight) {
      if (!force) {
        return this.ensureInFlight
      }
      await this.ensureInFlight
    }

    const generation = this.sessionCacheGeneration
    this.ensureInFlight = this.resolveEnsureHatcastSession()
    try {
      const result = await this.ensureInFlight
      this.applySessionCacheResult(result, generation)
      return result
    } finally {
      this.ensureInFlight = null
    }
  }

  /** Clears session memo — call after logout or failed auth. */
  invalidateSessionCache(): void {
    this.sessionCacheGeneration++
    this.sessionCache = null
    this.ensureInFlight = null
  }

  private writeSessionCache(result: AuthSessionResult, generation: number): void {
    if (result.ok && generation === this.sessionCacheGeneration) {
      this.sessionCache = result
    }
  }

  private applySessionCacheResult(result: AuthSessionResult, generation?: number): void {
    const gen = generation ?? this.sessionCacheGeneration
    if (result.ok) {
      this.writeSessionCache(result, gen)
      return
    }
    if (result.status === 401) {
      this.sessionUserSignal.set(null)
      this.invalidateSessionCache()
      this.troupeApi.invalidateCache()
    }
  }

  private async resolveEnsureHatcastSession(): Promise<AuthSessionResult> {
    const first = await this.getMe()
    if (first.ok) {
      return first
    }

    if (!getHatcastRememberMePreference()) {
      return first
    }

    const auth = this.firebaseAuth.getAuthOrNull()
    const user = auth?.currentUser
    if (!user) {
      return first
    }

    try {
      const idToken = await user.getIdToken(true)
      const exchanged = await this.signInWithIdentityPlatformIdToken(idToken, true)
      if (!exchanged.ok) {
        return first
      }
      return await this.getMe()
    } catch {
      return first
    }
  }

  private applySessionBody(data?: AuthSessionBody, cacheGeneration?: number): void {
    if (data?.user) {
      const previousUserId = this.sessionUserSignal()?.id
      if (previousUserId != null && previousUserId !== data.user.id) {
        this.mePreferencesApi.invalidateCache()
        this.troupeApi.invalidateCache()
      }
      this.meInboxApi.bindSessionUser(data.user.id)
      this.sessionUserSignal.set(data.user)
      this.productAnalytics.identifyUser(data.user.id)
      const gen = cacheGeneration ?? this.sessionCacheGeneration
      this.writeSessionCache({ ok: true, status: 200, data }, gen)
    }
  }

  async getMe(): Promise<AuthSessionResult> {
    const generation = this.sessionCacheGeneration
    const result = await this.fetchMe(generation)
    this.applySessionCacheResult(result, generation)
    return result
  }

  private async fetchMe(cacheGeneration: number): Promise<AuthSessionResult> {
    try {
      const res = await fetch('/v1/auth/me', { credentials: 'include' })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as AuthSessionBody
      this.applySessionBody(data, cacheGeneration)
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async signInWithGoogleIdToken(
    idToken: string,
    rememberMe = true,
  ): Promise<{ ok: boolean; status: number; data?: AuthSessionBody }> {
    try {
      const res = await fetch('/v1/auth/google', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, rememberMe }),
      })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as AuthSessionBody
      this.applySessionBody(data)
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  /** Après inscription ou connexion Firebase Auth (Identity Platform) : échange ID token → session HatCast. */
  async signInWithIdentityPlatformIdToken(
    idToken: string,
    rememberMe = true,
  ): Promise<{ ok: boolean; status: number; data?: AuthSessionBody }> {
    try {
      const res = await fetch('/v1/auth/idp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, rememberMe }),
      })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as AuthSessionBody
      this.applySessionBody(data)
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  /**
   * Signup path only: retry transient failures (0 / 500 / 503) with exponential backoff.
   * Reuses the same idToken for all attempts within one signup flow.
   */
  async signInWithIdentityPlatformIdTokenWithRetry(
    idToken: string,
    rememberMe = true,
    options?: {
      maxAttempts?: number
      backoffMs?: readonly number[]
    },
  ): Promise<{ ok: boolean; status: number; data?: AuthSessionBody }> {
    const maxAttempts = options?.maxAttempts ?? IDP_SIGNUP_RETRY_MAX_ATTEMPTS
    const backoffMs = options?.backoffMs ?? IDP_SIGNUP_RETRY_BACKOFF_MS

    let last = await this.signInWithIdentityPlatformIdToken(idToken, rememberMe)
    for (let attempt = 1; attempt < maxAttempts && !last.ok && isTransientIdpFailure(last.status); attempt++) {
      const delay = backoffMs[attempt - 1] ?? backoffMs[backoffMs.length - 1] ?? 0
      if (delay > 0) {
        await delayMs(delay)
      }
      last = await this.signInWithIdentityPlatformIdToken(idToken, rememberMe)
    }
    return last
  }

  /**
   * Invalide la session HatCast (cookie), puis le client Identity Platform (`signOut`).
   * En cas d’échec du POST, `signOut` est quand même tenté pour limiter un état incohérent (IdP seul).
   * Efface la préférence « se souvenir de moi » uniquement si le serveur a répondu OK.
   */
  async logout(): Promise<boolean> {
    let apiOk = false
    try {
      const res = await fetch('/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      apiOk = res.ok
    } catch {
      apiOk = false
    }

    const auth = this.firebaseAuth.getAuthOrNull()
    if (auth) {
      try {
        await signOut(auth)
      } catch {
        /* éviter un état IdP persistant même si le serveur a échoué */
      }
    }

    if (apiOk) {
      clearHatcastRememberMePreference()
    }

    this.sessionUserSignal.set(null)
    this.productAnalytics.resetSession()
    this.invalidateSessionCache()
    this.mePreferencesApi.invalidateCache()
    this.meInboxApi.invalidateCache()
    this.troupeApi.invalidateCache()

    return apiOk
  }

  async deleteAccount(
    idToken: string,
  ): Promise<{ ok: boolean; status: number; message?: string }> {
    try {
      const res = await fetch('/v1/auth/me', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify({ idToken }),
      })
      if (res.status === 204) {
        this.sessionUserSignal.set(null)
        this.invalidateSessionCache()
        this.meInboxApi.invalidateCache()
        this.troupeApi.invalidateCache()
        return { ok: true, status: res.status }
      }
      let message: string | undefined
      try {
        const body = (await res.json()) as { message?: string }
        message = body.message
      } catch {
        message = undefined
      }
      return { ok: false, status: res.status, message }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async uploadAvatar(file: File): Promise<{ ok: boolean; status: number; data?: AuthSessionBody }> {
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/v1/auth/me/avatar', {
        method: 'POST',
        credentials: 'include',
        headers: { ...csrfHeaders() },
        body,
      })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as AuthSessionBody
      this.applySessionBody(data)
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async importGoogleAvatar(
    pictureUrl?: string,
  ): Promise<{ ok: boolean; status: number; data?: AuthSessionBody }> {
    try {
      const res = await fetch('/v1/auth/me/avatar/google', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify(pictureUrl ? { pictureUrl } : {}),
      })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as AuthSessionBody
      this.applySessionBody(data)
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async deleteAvatar(): Promise<{ ok: boolean; status: number; data?: AuthSessionBody }> {
    try {
      const res = await fetch('/v1/auth/me/avatar', {
        method: 'DELETE',
        credentials: 'include',
        headers: { ...csrfHeaders() },
      })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as AuthSessionBody
      this.applySessionBody(data)
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
