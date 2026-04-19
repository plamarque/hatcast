import { inject, Injectable } from '@angular/core'
import { signOut } from 'firebase/auth'

import { FirebaseAuthService } from './firebase-auth.service'
import {
  clearHatcastRememberMePreference,
  getHatcastRememberMePreference,
} from './hatcast-remember-me-storage'

export interface UserSummary {
  id: string
  email: string | null
  displayName: string | null
}

export interface AuthSessionBody {
  user: UserSummary
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly firebaseAuth = inject(FirebaseAuthService)

  /**
   * GET /v1/auth/me ; si 401 et « se souvenir de moi » + session Firebase encore présente,
   * rééchange un ID token Identity Platform → session HatCast (redémarrage API / perte cookie serveur).
   */
  async ensureHatcastSession(): Promise<{ ok: boolean; status: number; data?: AuthSessionBody }> {
    const first = await this.getMe()
    if (first.ok) return first

    if (!getHatcastRememberMePreference()) return first

    const auth = this.firebaseAuth.getAuthOrNull()
    const user = auth?.currentUser
    if (!user) return first

    try {
      const idToken = await user.getIdToken(true)
      const exchanged = await this.signInWithIdentityPlatformIdToken(idToken, true)
      if (!exchanged.ok) return first
      return await this.getMe()
    } catch {
      return first
    }
  }

  async getMe(): Promise<{ ok: boolean; status: number; data?: AuthSessionBody }> {
    try {
      const res = await fetch('/v1/auth/me', { credentials: 'include' })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as AuthSessionBody
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

    return apiOk
  }
}
