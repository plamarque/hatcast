import { Injectable } from '@angular/core'

import { csrfHeaders } from '../http/hatcast-csrf'

export type TroupeMembershipStatus = 'ACTIVE' | 'INACTIVE'

export interface MembershipSummary {
  id: string
  displayName: string
  status: TroupeMembershipStatus
  createdAt: string
  updatedAt: string
}

export interface TroupeListItem {
  id: string
  name: string
  slug: string
  membership: MembershipSummary
}

@Injectable({ providedIn: 'root' })
export class TroupeApiService {
  async listMyTroupes(): Promise<{ ok: boolean; status: number; data?: TroupeListItem[] }> {
    try {
      const res = await fetch('/v1/troupes', { credentials: 'include' })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as TroupeListItem[]
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async joinTroupe(
    troupeId: string,
  ): Promise<{ ok: boolean; status: number; data?: MembershipSummary }> {
    try {
      const res = await fetch(`/v1/troupes/${encodeURIComponent(troupeId)}/memberships/me`, {
        method: 'POST',
        credentials: 'include',
        headers: { ...csrfHeaders() },
      })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as MembershipSummary
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
