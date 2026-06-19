import { Injectable } from '@angular/core'

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
