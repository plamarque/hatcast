import { inject, Injectable, signal } from '@angular/core'
import { signOut } from 'firebase/auth'

import { ProductAnalyticsService } from '../analytics/product-analytics.service'
import { csrfHeaders } from '../http/hatcast-csrf'
import { FirebaseAuthService } from './firebase-auth.service'
import {
  clearHatcastRememberMePreference,
  getHatcastRememberMePreference,
} from './hatcast-remember-me-storage'

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

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly firebaseAuth = inject(FirebaseAuthService)
  private readonly productAnalytics = inject(ProductAnalyticsService)
  private readonly sessionUserSignal = signal<UserSummary | null>(null)
  private ensureInFlight: Promise<{ ok: boolean; status: number; data?: AuthSessionBody }> | null =
    null

  /** Utilisateur HatCast en session (mis à jour par ensureHatcastSession et les flux auth). */
  readonly sessionUser = this.sessionUserSignal.asReadonly()

  /**
   * GET /v1/auth/me ; si 401 et « se souvenir de moi » + session Firebase encore présente,
   * rééchange un ID token Identity Platform → session HatCast (redémarrage API / perte cookie serveur).
   */
  async ensureHatcastSession(): Promise<{ ok: boolean; status: number; data?: AuthSessionBody }> {
    if (this.ensureInFlight) {
      return this.ensureInFlight
    }

    this.ensureInFlight = this.resolveEnsureHatcastSession()
    try {
      return await this.ensureInFlight
    } finally {
      this.ensureInFlight = null
    }
  }

  private async resolveEnsureHatcastSession(): Promise<{
    ok: boolean
    status: number
    data?: AuthSessionBody
  }> {
    const first = await this.getMe()
    if (first.ok) {
      this.applySessionBody(first.data)
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
      const refreshed = await this.getMe()
      if (refreshed.ok) {
        this.applySessionBody(refreshed.data)
      }
      return refreshed
    } catch {
      return first
    }
  }

  private applySessionBody(data?: AuthSessionBody): void {
    if (data?.user) {
      this.sessionUserSignal.set(data.user)
      this.productAnalytics.identifyUser(data.user.id)
    }
  }

  async getMe(): Promise<{ ok: boolean; status: number; data?: AuthSessionBody }> {
    try {
      const res = await fetch('/v1/auth/me', { credentials: 'include' })
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
