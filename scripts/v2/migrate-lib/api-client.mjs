/**
 * HatCast V2 API client for migration orchestrator (migration API key auth).
 */

import { readFileSync } from 'fs'
import { basename } from 'path'

export const MIGRATION_HEADER = 'X-Hatcast-Migration-Key'

/** Cloud Run serves the Angular SPA at `/`; local `bootRun` is API-only (Spring on 8080). */
export function isLocalApiBase(apiBaseUrl) {
  try {
    const host = new URL(apiBaseUrl).hostname
    return host === 'localhost' || host === '127.0.0.1'
  } catch {
    return false
  }
}

/**
 * Preflight reachability: SPA root on Cloud Run, actuator health on local API-only dev.
 * @param {string} base Normalized API base URL (no trailing slash)
 */
export async function preflightApiBase(base, fetchImpl = fetch) {
  const root = await fetchImpl(`${base}/`)
  if (root.ok) return

  if (isLocalApiBase(base)) {
    const health = await fetchImpl(`${base}/actuator/health`)
    if (health.ok) return
    throw new Error(`API health ${base}/actuator/health → ${health.status}`)
  }

  throw new Error(`SPA root ${base}/ → ${root.status}`)
}

function buildCsvForm(csvPath) {
  const form = new FormData()
  const buf = readFileSync(csvPath)
  form.append('file', new Blob([buf]), basename(csvPath))
  return form
}

export function createApiClient(config) {
  const base = config.apiBaseUrl.replace(/\/$/, '')

  async function request(method, path, { body, json, formData } = {}) {
    /** @type {Record<string, string>} */
    const headers = { [MIGRATION_HEADER]: config.migrationApiKey }
    /** @type {RequestInit} */
    const init = { method, headers }
    if (json !== undefined) {
      headers['Content-Type'] = 'application/json'
      init.body = JSON.stringify(json)
    } else if (formData) {
      init.body = formData
    } else if (body !== undefined) {
      init.body = body
    }
    const res = await fetch(`${base}${path}`, init)
    const text = await res.text()
    let data = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = text
      }
    }
    if (!res.ok) {
      const detail = typeof data === 'object' && data?.message ? data.message : text
      throw new Error(`${method} ${path} → ${res.status}: ${detail}`)
    }
    return data
  }

  return {
    get: (path) => request('GET', path),
    postJson: (path, json) => request('POST', path, { json }),
    postMultipart: (path, filePath, fieldName = 'file') => {
      const buf = readFileSync(filePath)
      const form = new FormData()
      form.append(fieldName, new Blob([buf]), basename(filePath))
      return request('POST', path, { formData: form })
    },
    async preflight() {
      await preflightApiBase(base)
      const me = await fetch(`${base}/v1/auth/me`)
      if (me.status !== 401) {
        throw new Error(`Expected GET /v1/auth/me → 401 without session, got ${me.status}`)
      }
    },
    createTroupe(name) {
      return request('POST', '/v1/troupes', { json: { name } })
    },
    createSeason(troupeId, body) {
      return request('POST', `/v1/troupes/${troupeId}/seasons`, { json: body })
    },
    activateSeason(seasonId) {
      return request('POST', `/v1/seasons/${seasonId}/actions/activate`, { json: {} })
    },
    importUsers(troupeId, csvPath) {
      return request('POST', `/v1/troupes/${troupeId}/users/import`, {
        formData: buildCsvForm(csvPath),
      })
    },
    importMembers(troupeId, csvPath) {
      return request('POST', `/v1/troupes/${troupeId}/members/import`, {
        formData: buildCsvForm(csvPath),
      })
    },
    listSeasonParticipants(seasonId) {
      return request('GET', `/v1/seasons/${seasonId}/participants`)
    },
    listSeasonEvents(seasonId, page = 0, size = 100) {
      return request('GET', `/v1/seasons/${seasonId}/events?page=${page}&size=${size}&scope=all`)
    },
    getSeason(seasonId) {
      return request('GET', `/v1/seasons/${seasonId}`)
    },
  }
}
