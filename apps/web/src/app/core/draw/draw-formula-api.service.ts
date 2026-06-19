import { Injectable } from '@angular/core'

import { csrfHeaders } from '../http/hatcast-csrf'
import type {
  CreateDrawFormulaRequest,
  DrawFormula,
  UpdateDrawFormulaRequest,
} from './draw-formula-payload'

export interface DrawFormulaApiError {
  status: number
  message: string
}

type ApiSuccess<T> = { ok: true; status: number; data: T }
type ApiFailure = { ok: false; status: number; error: DrawFormulaApiError }
type ApiResult<T> = Promise<ApiSuccess<T> | ApiFailure>

@Injectable({ providedIn: 'root' })
export class DrawFormulaApiService {
  async list(troupeId: string): ApiResult<DrawFormula[]> {
    return this.request<DrawFormula[]>(
      `/v1/troupes/${encodeURIComponent(troupeId)}/draw-formulas`,
    )
  }

  async get(troupeId: string, formulaId: string): ApiResult<DrawFormula> {
    return this.request<DrawFormula>(
      `/v1/troupes/${encodeURIComponent(troupeId)}/draw-formulas/${encodeURIComponent(formulaId)}`,
    )
  }

  async create(troupeId: string, body: CreateDrawFormulaRequest): ApiResult<DrawFormula> {
    return this.request<DrawFormula>(
      `/v1/troupes/${encodeURIComponent(troupeId)}/draw-formulas`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify(body),
      },
    )
  }

  async patch(
    troupeId: string,
    formulaId: string,
    body: UpdateDrawFormulaRequest,
  ): ApiResult<DrawFormula> {
    return this.request<DrawFormula>(
      `/v1/troupes/${encodeURIComponent(troupeId)}/draw-formulas/${encodeURIComponent(formulaId)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify(body),
      },
    )
  }

  async archive(troupeId: string, formulaId: string): ApiResult<DrawFormula> {
    return this.request<DrawFormula>(
      `/v1/troupes/${encodeURIComponent(troupeId)}/draw-formulas/${encodeURIComponent(formulaId)}`,
      {
        method: 'DELETE',
        headers: { ...csrfHeaders() },
      },
    )
  }

  private async request<T>(url: string, init?: RequestInit): ApiResult<T> {
    try {
      const res = await fetch(url, { credentials: 'include', ...init })
      if (!res.ok) {
        return { ok: false, status: res.status, error: await parseErrorResponse(res) }
      }
      return { ok: true, status: res.status, data: (await res.json()) as T }
    } catch {
      return {
        ok: false,
        status: 0,
        error: { status: 0, message: networkErrorMessage(init) },
      }
    }
  }
}

function networkErrorMessage(init?: RequestInit): string {
  const method = init?.method ?? 'GET'
  if (method === 'DELETE') {
    return 'Impossible d’archiver la formule.'
  }
  if (method === 'GET') {
    return 'Impossible de charger les formules de tirage.'
  }
  return 'Impossible d’enregistrer la formule.'
}

export async function parseErrorResponse(res: Response): Promise<DrawFormulaApiError> {
  let message = 'Impossible d’enregistrer la formule.'
  try {
    const body = (await res.json()) as { message?: string; detail?: string }
    if (typeof body.message === 'string' && body.message.trim()) {
      message = body.message.trim()
    } else if (typeof body.detail === 'string' && body.detail.trim()) {
      message = body.detail.trim()
    }
  } catch {
    // keep fallback
  }
  return { status: res.status, message }
}
