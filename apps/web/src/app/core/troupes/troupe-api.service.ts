import { Injectable } from '@angular/core'

import { csrfHeaders } from '../http/hatcast-csrf'

export type TroupeMembershipStatus = 'ACTIVE' | 'INACTIVE'
export type TroupeBaselineRole = 'MEMBER' | 'TROUPE_ADMIN'

export interface MembershipSummary {
  id: string
  displayName: string
  status: TroupeMembershipStatus
  baselineRole: TroupeBaselineRole
  createdAt: string
  updatedAt: string
}

export interface TroupeListItem {
  id: string
  name: string
  slug: string
  membership: MembershipSummary
}

export interface TroupeMemberAdmin {
  id: string
  userId: string
  email: string | null
  displayName: string
  status: TroupeMembershipStatus
  baselineRole: TroupeBaselineRole
  createdAt: string
  updatedAt: string
}

export interface PagedTroupeMembersResponse {
  content: TroupeMemberAdmin[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface AddTroupeMemberRequest {
  email: string
  displayName?: string
  baselineRole?: TroupeBaselineRole
}

export interface UpdateTroupeMemberRequest {
  displayName?: string
  status?: TroupeMembershipStatus
  baselineRole?: TroupeBaselineRole
}

export type MemberImportRowOutcome = 'SUCCESS' | 'SKIPPED' | 'ERROR'

export type MemberImportErrorCode =
  | 'INVALID_EMAIL'
  | 'USER_NOT_FOUND'
  | 'INVALID_BASELINE_ROLE'
  | 'INVALID_STATUS'
  | 'LAST_ADMIN_VIOLATION'
  | 'PARSE_ERROR'

export interface MemberImportRowResult {
  rowNumber: number
  outcome: MemberImportRowOutcome
  email: string | null
  code: MemberImportErrorCode | null
  message: string | null
}

export interface MemberImportResult {
  summary: {
    success: number
    skipped: number
    error: number
  }
  rows: MemberImportRowResult[]
}

export type UserImportRowOutcome = 'SUCCESS' | 'SKIPPED' | 'ERROR'

export type UserImportErrorCode = 'INVALID_EMAIL' | 'PARSE_ERROR'

export interface UserImportRowResult {
  rowNumber: number
  outcome: UserImportRowOutcome
  email: string | null
  code: UserImportErrorCode | null
  message: string | null
}

export interface UserImportResult {
  summary: {
    success: number
    skipped: number
    error: number
  }
  rows: UserImportRowResult[]
}

type ApiResult<T> = Promise<{ ok: boolean; status: number; data?: T }>

@Injectable({ providedIn: 'root' })
export class TroupeApiService {
  async listMyTroupes(): ApiResult<TroupeListItem[]> {
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
  ): ApiResult<MembershipSummary> {
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

  async listMembers(
    troupeId: string,
    page = 0,
    size = 25,
  ): ApiResult<PagedTroupeMembersResponse> {
    try {
      const params = new URLSearchParams({ page: String(page), size: String(size) })
      const res = await fetch(
        `/v1/troupes/${encodeURIComponent(troupeId)}/members?${params.toString()}`,
        { credentials: 'include' },
      )
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: (await res.json()) as PagedTroupeMembersResponse }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async addMember(
    troupeId: string,
    body: AddTroupeMemberRequest,
  ): ApiResult<TroupeMemberAdmin> {
    try {
      const res = await fetch(`/v1/troupes/${encodeURIComponent(troupeId)}/members`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify({
          ...body,
          email: body.email.trim(),
          displayName: body.displayName?.trim() || undefined,
        }),
      })
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: (await res.json()) as TroupeMemberAdmin }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async updateMember(
    troupeId: string,
    membershipId: string,
    body: UpdateTroupeMemberRequest,
  ): ApiResult<TroupeMemberAdmin> {
    try {
      const res = await fetch(
        `/v1/troupes/${encodeURIComponent(troupeId)}/members/${encodeURIComponent(membershipId)}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...csrfHeaders(),
          },
          body: JSON.stringify(body),
        },
      )
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: (await res.json()) as TroupeMemberAdmin }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async deactivateMember(
    troupeId: string,
    membershipId: string,
  ): ApiResult<void> {
    try {
      const res = await fetch(
        `/v1/troupes/${encodeURIComponent(troupeId)}/members/${encodeURIComponent(membershipId)}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: { ...csrfHeaders() },
        },
      )
      return { ok: res.ok, status: res.status }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async exportMembersCsv(troupeId: string): ApiResult<Blob> {
    try {
      const res = await fetch(
        `/v1/troupes/${encodeURIComponent(troupeId)}/members/export`,
        { credentials: 'include' },
      )
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: await res.blob() }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async importMembersCsv(
    troupeId: string,
    file: File,
  ): ApiResult<MemberImportResult> {
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch(
        `/v1/troupes/${encodeURIComponent(troupeId)}/members/import`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { ...csrfHeaders() },
          body,
        },
      )
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: (await res.json()) as MemberImportResult }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async importUsersCsv(
    troupeId: string,
    file: File,
  ): ApiResult<UserImportResult> {
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch(
        `/v1/troupes/${encodeURIComponent(troupeId)}/users/import`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { ...csrfHeaders() },
          body,
        },
      )
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: (await res.json()) as UserImportResult }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
