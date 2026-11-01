import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseRelease } from '../../apps/web/scripts/build-with-release.mjs'
import { marker, promotionPayload, capturePromotion, provision, insights, main } from './posthog-lifecycle-dashboard.mjs'

test('capture accepts documented EU success and legacy success without quota limits', async () => {
  const payload = promotionPayload('fake-token', { release_id: '2.7.0:20d972b0', app_version: '2.7.0' }, '2026-10-23T06:20:55Z')
  for (const status of ['Ok', 1]) {
    for (const quota of [undefined, []]) {
      const logs = []
      await capturePromotion(payload, { report: value => logs.push(value), request: async (url, options) => {
        assert.equal(url, 'https://eu.i.posthog.com/i/v0/e/')
        assert.equal(options.method, 'POST')
        assert.deepEqual(JSON.parse(options.body), payload)
        return { ok: true, status: 200, json: async () => ({ status, quota_limited: quota }) }
      } })
      assert.match(logs[0], /http=200, status=(ok|legacy_ok), quota_limited=(absent|count:0)/)
      assert.ok(!logs[0].includes('fake-token'))
    }
  }
})

test('capture rejects errors and malformed replies with only bounded diagnostics', async () => {
  const secret = 'sensitive-token-in-untrusted-response'
  const cases = [
    [{ status: 'Ok', quota_limited: [secret] }, /quota limited.*count:1/],
    [{ status: 1, quota_limited: ['events'] }, /quota limited.*count:1/],
    [{ status: 'Ok', quota_limited: secret }, /invalid quota metadata/],
    [{ status: 'Ok', quota_limited: null }, /invalid quota metadata/],
    [{ status: secret }, /unexpected status/],
    [{ status: '1' }, /unexpected status/],
    [{ status: 0 }, /unexpected status/],
    [{}, /unexpected status/], [null, /unexpected status/],
    [[], /unexpected status/], ['Ok', /unexpected status/],
  ]
  for (const [result, expected] of cases) {
    const logs = []
    await assert.rejects(capturePromotion({ api_key: secret }, { report: value => logs.push(value),
      request: async () => ({ ok: true, status: 200, json: async () => result }),
    }), error => {
      assert.match(error.message, expected)
      assert.ok(!error.message.includes(secret))
      return true
    })
    assert.ok(!logs.join().includes(secret))
  }
  for (const [request, expected] of [
    [async () => { throw new Error(secret) }, /transport failed/],
    ...[400, 401, 429, 500].map(status => [
      async () => ({ ok: false, status, json: () => { throw new Error(secret) } }),
      new RegExp(`failed \\(http=${status}\\)`),
    ]),
    [async () => ({ ok: true, status: 200, json: () => { throw new Error(secret) } }), /invalid JSON/],
  ]) {
    await assert.rejects(capturePromotion({ api_key: secret }, { request }), error => {
      assert.match(error.message, expected)
      assert.ok(!error.message.includes(secret))
      return true
    })
  }
})

test('apply provisions after accepted capture and stops before provisioning on rejection', async () => {
  const previousFetch = globalThis.fetch, previousLog = console.log
  const names = ['HATCAST_POSTHOG_PROJECT_API_KEY', 'HATCAST_POSTHOG_PERSONAL_API_KEY', 'HATCAST_POSTHOG_PROJECT_ID', 'HATCAST_PROMOTED_AT']
  const previousEnv = names.map(name => process.env[name])
  for (const [i, value] of ['fake-token', 'fake-private', '123', '2026-10-23T06:20:55Z'].entries()) process.env[names[i]] = value
  console.log = () => {}
  try {
    for (const result of [{ status: 'Ok' }, { status: 'Ok', quota_limited: ['events'] }, { status: 'rejected' }]) {
      const calls = []
      globalThis.fetch = async (url, options) => {
        calls.push(String(url))
        if (calls.length === 1) return { ok: true, status: 200, json: async () => result }
        assert.equal(url.origin, 'https://eu.posthog.com')
        return { ok: true, json: async () => options.method === 'GET' ? { results: [], next: null } : { id: 42 } }
      }
      if (result.quota_limited || result.status !== 'Ok') {
        await assert.rejects(main(['--apply']))
        assert.equal(calls.length, 1)
      } else {
        await main(['--apply'])
        assert.equal(calls.length, 1 + 2 + 1 + insights.length)
      }
    }
    let calls = 0
    globalThis.fetch = async () => {
      calls++
      return calls === 1
        ? { ok: true, status: 200, json: async () => ({ status: 'Ok' }) }
        : { ok: false, status: 403 }
    }
    await assert.rejects(main(['--apply']), /PostHog GET .* failed \(403\)/)
    assert.equal(calls, 2, 'dashboard permission failures still fail the job')
  } finally {
    globalThis.fetch = previousFetch
    console.log = previousLog
    names.forEach((name, i) => {
      if (previousEnv[i] === undefined) delete process.env[name]
      else process.env[name] = previousEnv[i]
    })
  }
})

test('bundle and promotion derive the same immutable identity', () => {
  const release = parseRelease('2.6.2\nProduction build\nGit: 5009b980\nBuild: ignored')
  assert.deepEqual(release, { release_id: '2.6.2:5009b980', app_version: '2.6.2' })
  const a = promotionPayload('fake', release, '2026-10-18T12:00:00Z')
  const b = promotionPayload('fake', release, '2026-10-18T13:00:00Z')
  assert.equal(a.uuid, b.uuid)
  assert.equal(a.properties.$process_person_profile, false)
  assert.equal(parseRelease('<html>fallback</html>'), null)
})

test('provisioning creates once, then patches only its own insights', async () => {
  const dashboards = [], savedInsights = [], writes = []
  const request = async (url, options) => {
    assert.equal(url.origin, 'https://eu.posthog.com')
    const body = options.body ? JSON.parse(options.body) : null
    const path = url.pathname
    if (options.method === 'GET' && path.endsWith('insights/')) {
      assert.deepEqual(JSON.parse(url.searchParams.get('dashboards')), [42])
    }
    let result
    if (options.method === 'GET') result = { results: path.endsWith('dashboards/') ? dashboards : savedInsights, next: null }
    else {
      writes.push(options.method)
      if (path.endsWith('dashboards/')) { result = { id: 42, ...body }; dashboards.push(result) }
      else if (options.method === 'POST') { result = { id: savedInsights.length + 1, ...body }; savedInsights.push(result) }
      else result = body
    }
    return { ok: true, json: async () => result }
  }
  const opts = { projectId: '123', key: 'fake', request }
  assert.equal(await provision(opts), 42)
  const first = writes.length
  assert.equal(await provision(opts), 42)
  assert.equal(dashboards.length, 1)
  assert.equal(savedInsights.length, insights.length)
  assert.deepEqual(writes.slice(first), Array(insights.length).fill('PATCH'))
})

test('duplicate ownership and cross-origin pagination stop before writes', async () => {
  for (const response of [
    { results: [{ id: 1, description: marker }, { id: 2, description: marker }], next: null },
    { results: [], next: 'https://other.example/api/steal' },
  ]) {
    let calls = 0
    await assert.rejects(provision({ projectId: '123', key: 'fake', request: async (_, options) => {
      calls++
      assert.equal(options.method, 'GET')
      return { ok: true, json: async () => response }
    } }))
    assert.equal(calls, 1)
  }
})

test('validation computes every saved insight without an ingestion request or logged rows', async () => {
  const previous = { fetch: globalThis.fetch, log: console.log, project: process.env.HATCAST_POSTHOG_PROJECT_ID, key: process.env.HATCAST_POSTHOG_PERSONAL_API_KEY }
  const computed = [], logs = []
  let id = 0
  globalThis.fetch = async (url, options) => {
    assert.equal(url.origin, 'https://eu.posthog.com')
    assert.ok(url.pathname.startsWith('/api/projects/123/'))
    assert.ok(!url.pathname.includes('/i/v0/e'))
    if (url.searchParams.get('refresh')) {
      assert.equal(url.searchParams.get('refresh'), 'force_blocking')
      computed.push(url.pathname)
      return { ok: true, json: async () => ({ result: [] }) }
    }
    if (options.method === 'GET') return { ok: true, json: async () => ({ results: [], next: null }) }
    return { ok: true, json: async () => ({ id: ++id, ...JSON.parse(options.body) }) }
  }
  console.log = (value) => logs.push(value)
  process.env.HATCAST_POSTHOG_PROJECT_ID = '123'
  process.env.HATCAST_POSTHOG_PERSONAL_API_KEY = 'fake'
  try {
    await main(['--validate'])
    assert.equal(computed.length, insights.length)
    assert.equal(logs.length, insights.length + 1)
    assert.ok(logs.at(-1).includes('no promotion event sent'))
    await assert.rejects(main(['--validate', '--apply']))
  } finally {
    globalThis.fetch = previous.fetch
    console.log = previous.log
    if (previous.project === undefined) delete process.env.HATCAST_POSTHOG_PROJECT_ID
    else process.env.HATCAST_POSTHOG_PROJECT_ID = previous.project
    if (previous.key === undefined) delete process.env.HATCAST_POSTHOG_PERSONAL_API_KEY
    else process.env.HATCAST_POSTHOG_PERSONAL_API_KEY = previous.key
  }
})

test('validation rejects a saved insight that has no computed result', async () => {
  await assert.rejects(provision({ projectId: '123', key: 'fake', validate: true,
    request: async (url, options) => {
      if (url.searchParams.get('refresh')) return { ok: true, json: async () => ({ result: null }) }
      return { ok: true, json: async () => options.method === 'GET' ? { results: [], next: null } : { id: 1 } }
    },
  }), /did not return a computed result/)
})
