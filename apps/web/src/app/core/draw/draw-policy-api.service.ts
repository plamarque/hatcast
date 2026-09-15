import { Injectable } from '@angular/core'

import { csrfHeaders } from '../http/hatcast-csrf'

export type DrawPolicySource = 'IMPLICIT' | 'TROUPE' | 'SEASON'
export type DrawRuleSource = 'DEFAULT' | 'CATEGORY'
export type DrawRuleMode = 'MANDATORY' | 'CHOICE'

export interface DrawFormulaSummary {
  id: string
  name: string
}

export interface EffectiveDrawPolicy {
  policySource: DrawPolicySource
  resolvedRuleSource: DrawRuleSource
  eventCategory: string | null
  eventCategoryLabel?: string | null
  resolvedMode: DrawRuleMode
  allowedFormulaIds: string[]
  allowedFormulas: DrawFormulaSummary[]
  effectiveFormulaId: string | null
  effectiveFormulaName: string | null
  selectorVisible: boolean
  requiresFormulaIdOnDraw: boolean
}

export interface DrawPolicyRule {
  mode: DrawRuleMode
  allowedFormulaIds?: string[] | null
  mandatoryFormulaId?: string | null
}

export interface DrawCategoryRule {
  category: string | null
  mode: DrawRuleMode
  allowedFormulaIds?: string[] | null
  mandatoryFormulaId?: string | null
}

export interface TroupeDrawPolicy {
  id?: string
  troupeId?: string
  seasonId?: string | null
  scope?: string
  defaultRule: DrawPolicyRule
  categoryRules: DrawCategoryRule[]
  updatedAt?: string
}

export interface UpsertTroupeDrawPolicyRequest {
  defaultRule: DrawPolicyRule
  categoryRules: DrawCategoryRule[]
}

export interface DrawPolicyApiError {
  ok: false
  status: number
  errorMessage?: string
}

type DrawPolicyApiResult<T> =
  | ({ ok: true; status: number; data: T } | DrawPolicyApiError) & {
      errorMessage?: string
    }

@Injectable({ providedIn: 'root' })
export class DrawPolicyApiService {
  async getEffectiveDrawPolicy(
    seasonId: string,
    eventId: string,
  ): Promise<DrawPolicyApiResult<EffectiveDrawPolicy>> {
    try {
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/draw-policy/effective`,
        { credentials: 'include' },
      )
      if (!res.ok) {
        return { ok: false, status: res.status, errorMessage: await readApiErrorMessage(res) }
      }
      const data = (await res.json()) as EffectiveDrawPolicy
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  /**
   * GET troupe policy. 404 is success with `data: null` (no row yet).
   */
  async getTroupeDrawPolicy(
    troupeId: string,
  ): Promise<DrawPolicyApiResult<TroupeDrawPolicy | null>> {
    try {
      const res = await fetch(
        `/v1/troupes/${encodeURIComponent(troupeId)}/draw-policy`,
        { credentials: 'include' },
      )
      if (res.status === 404) {
        return { ok: true, status: 404, data: null }
      }
      if (!res.ok) {
        return { ok: false, status: res.status, errorMessage: await readApiErrorMessage(res) }
      }
      const data = (await res.json()) as TroupeDrawPolicy
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async putTroupeDrawPolicy(
    troupeId: string,
    body: UpsertTroupeDrawPolicyRequest,
  ): Promise<DrawPolicyApiResult<TroupeDrawPolicy>> {
    try {
      const res = await fetch(`/v1/troupes/${encodeURIComponent(troupeId)}/draw-policy`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        return { ok: false, status: res.status, errorMessage: await readApiErrorMessage(res) }
      }
      const data = (await res.json()) as TroupeDrawPolicy
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}

async function readApiErrorMessage(res: Response): Promise<string | undefined> {
  try {
    const body = (await res.json()) as { message?: string }
    const message = body.message?.trim()
    return message || undefined
  } catch {
    return undefined
  }
}
