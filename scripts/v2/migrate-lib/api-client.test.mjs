import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { isLocalApiBase, preflightApiBase } from './api-client.mjs'

describe('migrate-lib api-client preflight', () => {
  it('detects local API base URLs', () => {
    assert.equal(isLocalApiBase('http://127.0.0.1:8080'), true)
    assert.equal(isLocalApiBase('http://localhost:8080'), true)
    assert.equal(isLocalApiBase('https://hatcast-v2-staging.example.run.app'), false)
  })

  it('accepts SPA root 200 on Cloud Run', async () => {
    await preflightApiBase('https://example.run.app', async (url) => ({
      ok: url.endsWith('/'),
      status: 200,
    }))
  })

  it('falls back to actuator health when local root is 401', async () => {
    await preflightApiBase('http://127.0.0.1:8080', async (url) => ({
      ok: url.endsWith('/actuator/health'),
      status: url.endsWith('/actuator/health') ? 200 : 401,
    }))
  })

  it('fails when Cloud Run root is not ok', async () => {
    await assert.rejects(
      () =>
        preflightApiBase('https://example.run.app', async () => ({
          ok: false,
          status: 503,
        })),
      /SPA root/,
    )
  })
})
