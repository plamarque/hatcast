import { Injectable } from '@angular/core'

import type { MemberGender } from '../account/member-gender'
import { csrfHeaders } from '../http/hatcast-csrf'

export type TroupeMembershipStatus = 'ACTIVE' | 'INACTIVE'
export type TroupeBaselineRole = 'MEMBER' | 'TROUPE_ADMIN' | 'EXTERNE'

export interface MembershipSummary {
  id: string
  displayName: string
  status: TroupeMembershipStatus
  baselineRole: TroupeBaselineRole
  createdAt: string
  updatedAt: string
}

export interface TroupeCategory {
  slug: string
  label: string
}

export interface CreateTroupeCategoryRequest {
  label: string
  slug?: string
}

export interface UpdateTroupeCategoryLabelRequest {
  label: string
}

export interface CategoryDeletePreview {
  eventCount: number
}

export interface CategoryDeleteResult {
  affectedEventCount: number
}

export interface TroupeListItem {
  id: string
  name: string
  slug: string
  logoUrl?: string | null
  description?: string | null
  isDemo: boolean
  joinPolicy: 'OPEN' | 'INVITE_ONLY'
  membership: MembershipSummary
  activeMemberCount: number
  upcomingEventCount: number
}

/** Public directory card (FR32) — no membership or join policy. */
export interface PublicTroupeDirectoryItem {
  id: string
  name: string
  slug: string
  logoUrl?: string | null
  description?: string | null
  activeMemberCount: number
  upcomingEventCount: number
}

/** Troupe summary for platform-admin navigation (no membership). */
export interface TroupeAdminSummary {
  id: string
  name: string
  slug: string
  isDemo: boolean
  joinPolicy: 'OPEN' | 'INVITE_ONLY'
}

export interface TroupeMemberAdmin {
  id: string
  userId: string | null
  userSlug?: string | null
  email: string | null
  displayName: string
  avatarUrl?: string | null
  gender?: MemberGender | null
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

export interface AddTroupeExterneRequest {
  displayName: string
  email?: string
}

export interface CreateTroupeRequest {
  name: string
}

export interface UpdateTroupeRequest {
  name: string
  description?: string | null
}

export interface UpdateMyMembershipRequest {
  displayName: string
}

export interface UpdateTroupeMemberRequest {
  displayName?: string
  email?: string | null
  status?: TroupeMembershipStatus
  baselineRole?: TroupeBaselineRole
}

export interface MemberConversionSeasonOption {
  seasonId: string
  seasonTitle: string
  seasonSlug: string
}

export interface MemberConversionContext {
  membershipId: string
  baselineRole: TroupeBaselineRole
  activeSeasons: MemberConversionSeasonOption[]
}

export interface ConvertToExterneRequest {
  seasonsToGuestSeason?: string[]
  seasonsToRemove?: string[]
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

type ApiResult<T> = Promise<{ ok: boolean; status: number; data?: T; errorMessage?: string }>

async function readApiErrorMessage(res: Response): Promise<string | undefined> {
  try {
    const body = (await res.json()) as { message?: string }
    const message = body.message?.trim()
    return message || undefined
  } catch {
    return undefined
  }
}

@Injectable({ providedIn: 'root' })
export class TroupeApiService {
  private troupesCache: { ok: boolean; status: number; data?: TroupeListItem[] } | null = null
  private troupesCacheGeneration = 0
  private troupesInFlight: Promise<{ ok: boolean; status: number; data?: TroupeListItem[] }> | null =
    null

  /** Clears session memo for GET /troupes — call after logout or membership change. */
  invalidateCache(): void {
    this.troupesCacheGeneration++
    this.troupesCache = null
    this.troupesInFlight = null
  }

  async listCategories(troupeId: string): ApiResult<TroupeCategory[]> {
    try {
      const res = await fetch(
        `/v1/troupes/${encodeURIComponent(troupeId)}/categories`,
        { credentials: 'include' },
      )
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: (await res.json()) as TroupeCategory[] }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async createCategory(
    troupeId: string,
    body: CreateTroupeCategoryRequest,
  ): ApiResult<TroupeCategory> {
    try {
      const payload: CreateTroupeCategoryRequest = {
        label: body.label.trim(),
        ...(body.slug?.trim() ? { slug: body.slug.trim() } : {}),
      }
      const res = await fetch(
        `/v1/troupes/${encodeURIComponent(troupeId)}/categories`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...csrfHeaders(),
          },
          body: JSON.stringify(payload),
        },
      )
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: (await res.json()) as TroupeCategory }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async updateCategoryLabel(
    troupeId: string,
    slug: string,
    body: UpdateTroupeCategoryLabelRequest,
  ): ApiResult<TroupeCategory> {
    try {
      const res = await fetch(
        `/v1/troupes/${encodeURIComponent(troupeId)}/categories/${encodeURIComponent(slug)}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...csrfHeaders(),
          },
          body: JSON.stringify({ label: body.label.trim() }),
        },
      )
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: (await res.json()) as TroupeCategory }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async previewDeleteCategory(
    troupeId: string,
    slug: string,
  ): ApiResult<CategoryDeletePreview> {
    try {
      const res = await fetch(
        `/v1/troupes/${encodeURIComponent(troupeId)}/categories/${encodeURIComponent(slug)}/delete-preview`,
        { credentials: 'include' },
      )
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: (await res.json()) as CategoryDeletePreview }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async deleteCategory(troupeId: string, slug: string): ApiResult<CategoryDeleteResult> {
    try {
      const res = await fetch(
        `/v1/troupes/${encodeURIComponent(troupeId)}/categories/${encodeURIComponent(slug)}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: { ...csrfHeaders() },
        },
      )
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: (await res.json()) as CategoryDeleteResult }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async createTroupe(body: CreateTroupeRequest): ApiResult<TroupeListItem> {
    try {
      const res = await fetch('/v1/troupes', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify({ name: body.name.trim() }),
      })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as TroupeListItem
      this.invalidateCache()
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async updateTroupe(troupeId: string, body: UpdateTroupeRequest): ApiResult<TroupeListItem> {
    try {
      const res = await fetch(`/v1/troupes/${encodeURIComponent(troupeId)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify({
          name: body.name.trim(),
          ...(Object.prototype.hasOwnProperty.call(body, 'description')
            ? { description: body.description?.trim() || null }
            : {}),
        }),
      })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as TroupeListItem
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async uploadTroupeLogo(troupeId: string, file: File): ApiResult<TroupeListItem> {
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch(`/v1/troupes/${encodeURIComponent(troupeId)}/logo`, {
        method: 'POST',
        credentials: 'include',
        headers: { ...csrfHeaders() },
        body,
      })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as TroupeListItem
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async deleteTroupeLogo(troupeId: string): ApiResult<TroupeListItem> {
    try {
      const res = await fetch(`/v1/troupes/${encodeURIComponent(troupeId)}/logo`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { ...csrfHeaders() },
      })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as TroupeListItem
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async listMyTroupes(options?: { force?: boolean }): ApiResult<TroupeListItem[]> {
    const force = options?.force ?? false

    if (!force && this.troupesCache?.ok) {
      return this.troupesCache
    }

    if (this.troupesInFlight) {
      if (!force) {
        return this.troupesInFlight
      }
      await this.troupesInFlight
    }

    const generation = this.troupesCacheGeneration
    const fetchPromise = this.fetchMyTroupes(generation)
    this.troupesInFlight = fetchPromise.finally(() => {
      this.troupesInFlight = null
    })
    return this.troupesInFlight
  }

  private async fetchMyTroupes(
    cacheGeneration: number,
  ): Promise<{ ok: boolean; status: number; data?: TroupeListItem[] }> {
    try {
      const res = await fetch('/v1/troupes', { credentials: 'include' })
      if (!res.ok) {
        const result = { ok: false as const, status: res.status }
        if (res.status === 401) {
          this.invalidateCache()
        }
        return result
      }
      const data = (await res.json()) as TroupeListItem[]
      const result = { ok: true as const, status: res.status, data }
      if (cacheGeneration === this.troupesCacheGeneration) {
        this.troupesCache = result
      }
      return result
    } catch {
      return { ok: false, status: 0 }
    }
  }

  /** Membre ou invité lié : contexte hub par slug (externe hors liste troupes). */
  async resolveTroupeContextBySlug(slug: string): ApiResult<TroupeListItem> {
    try {
      const res = await fetch(
        `/v1/troupes/by-slug/${encodeURIComponent(slug)}/context`,
        { credentials: 'include' },
      )
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as TroupeListItem
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  /** Annuaire Découvrir élargi pour utilisateur connecté (Démo + troupes admin plateforme). */
  async listDiscoverTroupes(): ApiResult<PublicTroupeDirectoryItem[]> {
    try {
      const res = await fetch('/v1/troupes/discover', { credentials: 'include' })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as PublicTroupeDirectoryItem[]
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  /** Public directory for Découvrir — no session required (FR32). */
  async listPublicTroupes(): ApiResult<PublicTroupeDirectoryItem[]> {
    try {
      const res = await fetch('/v1/public/troupes', { credentials: 'omit' })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as PublicTroupeDirectoryItem[]
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  /** Admin plateforme : résout une troupe par slug sans adhésion (navigation directe par URL). */
  async getAdminTroupeBySlug(slug: string): ApiResult<TroupeAdminSummary> {
    try {
      const res = await fetch(
        `/v1/admin/troupes/by-slug/${encodeURIComponent(slug)}`,
        { credentials: 'include' },
      )
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as TroupeAdminSummary
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

  async updateMyMembership(
    troupeId: string,
    body: UpdateMyMembershipRequest,
  ): ApiResult<MembershipSummary> {
    try {
      const res = await fetch(
        `/v1/troupes/${encodeURIComponent(troupeId)}/memberships/me`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...csrfHeaders(),
          },
          body: JSON.stringify({ displayName: body.displayName.trim() }),
        },
      )
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: (await res.json()) as MembershipSummary }
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

  async addExterne(
    troupeId: string,
    body: AddTroupeExterneRequest,
  ): ApiResult<TroupeMemberAdmin> {
    try {
      const res = await fetch(`/v1/troupes/${encodeURIComponent(troupeId)}/externes`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify({
          displayName: body.displayName.trim(),
          email: body.email?.trim() || undefined,
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

  async getMemberConversionContext(
    troupeId: string,
    membershipId: string,
  ): ApiResult<MemberConversionContext> {
    try {
      const res = await fetch(
        `/v1/troupes/${encodeURIComponent(troupeId)}/members/${encodeURIComponent(membershipId)}/conversion-context`,
        { credentials: 'include' },
      )
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: (await res.json()) as MemberConversionContext }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async convertMemberToExterne(
    troupeId: string,
    membershipId: string,
    body: ConvertToExterneRequest,
  ): ApiResult<TroupeMemberAdmin> {
    try {
      const res = await fetch(
        `/v1/troupes/${encodeURIComponent(troupeId)}/members/${encodeURIComponent(membershipId)}/convert-to-externe`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...csrfHeaders(),
          },
          body: JSON.stringify(body),
        },
      )
      if (!res.ok) {
        return { ok: false, status: res.status, errorMessage: await readApiErrorMessage(res) }
      }
      return { ok: true, status: res.status, data: (await res.json()) as TroupeMemberAdmin }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async convertExterneToMember(
    troupeId: string,
    membershipId: string,
  ): ApiResult<TroupeMemberAdmin> {
    try {
      const res = await fetch(
        `/v1/troupes/${encodeURIComponent(troupeId)}/members/${encodeURIComponent(membershipId)}/convert-to-member`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { ...csrfHeaders() },
        },
      )
      if (!res.ok) {
        return { ok: false, status: res.status, errorMessage: await readApiErrorMessage(res) }
      }
      return { ok: true, status: res.status, data: (await res.json()) as TroupeMemberAdmin }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
