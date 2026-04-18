import { Injectable } from '@angular/core'

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
  ): Promise<{ ok: boolean; status: number; data?: AuthSessionBody }> {
    try {
      const res = await fetch('/v1/auth/google', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
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

  async logout(): Promise<boolean> {
    try {
      const res = await fetch('/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      return res.ok
    } catch {
      return false
    }
  }
}
