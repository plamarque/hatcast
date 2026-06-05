import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  isProdTarget,
  parseArgs,
  parseDbInfo,
  planLoad,
  resolveExpectHost,
  normalizePostgresUrl,
  buildPostgresConnectionUrl,
  resolveHatcastDatasourceUrl,
} from '../migrate-malice-load.mjs'

const STAGING_URL =
  'postgresql://u:p@ep-cool-bird-123-pooler.eu-central-1.aws.neon.tech/hatcast_staging?sslmode=require'
const PROD_URL =
  'postgresql://u:p@ep-prod-night-999-pooler.eu-central-1.aws.neon.tech/hatcast_prod?sslmode=require'
const NEON_BRANCH_URL =
  'postgresql://u:p@ep-plain-mode-al95cugr-730278491306.eu-west9.aws.neon.tech/neondb?sslmode=require'

describe('migrate-malice-load — parsing', () => {
  it('parses host + database from a Neon URL', () => {
    const info = parseDbInfo(STAGING_URL)
    assert.equal(info.host, 'ep-cool-bird-123-pooler.eu-central-1.aws.neon.tech')
    assert.equal(info.database, 'hatcast_staging')
  })

  it('returns null for an unparseable URL or missing URL', () => {
    assert.equal(parseDbInfo('not a url'), null)
    assert.equal(parseDbInfo(null), null)
  })

  it('detects prod targets', () => {
    assert.equal(isProdTarget('prod'), true)
    assert.equal(isProdTarget('production'), true)
    assert.equal(isProdTarget('staging'), false)
    assert.equal(isProdTarget('staging', true), true)
  })

  it('parseArgs collects multiple --sql and flags', () => {
    const opts = parseArgs(['--sql=a.sql', '--sql=b.sql', '--target=prod', '--confirm-prod=prod'])
    assert.deepEqual(opts.sql, ['a.sql', 'b.sql'])
    assert.equal(opts.target, 'prod')
    assert.equal(opts.confirmProd, 'prod')
  })
})

describe('migrate-malice-load — planLoad (URL↔target guards)', () => {
  const base = parseArgs([])

  it('defaults to dry-run when no confirmation flag', () => {
    const plan = planLoad({ ...base, databaseUrl: STAGING_URL }, parseDbInfo(STAGING_URL))
    assert.equal(plan.willWrite, false)
    assert.equal(plan.errors.length, 0)
  })

  it('writes to staging with --yes and matching --expect-host', () => {
    const opts = { ...base, databaseUrl: STAGING_URL, yes: true, expectHost: 'staging' }
    const plan = planLoad(opts, parseDbInfo(STAGING_URL))
    assert.equal(plan.willWrite, true)
    assert.equal(plan.errors.length, 0)
  })

  it('refuses staging write when --expect-host does not match the URL host', () => {
    const opts = { ...base, databaseUrl: PROD_URL, yes: true, expectHost: 'staging' }
    const plan = planLoad(opts, parseDbInfo(PROD_URL))
    assert.equal(plan.willWrite, false)
    assert.match(plan.errors.join('\n'), /does not contain --expect-host="staging"/)
  })

  it('refuses staging write without --expect-host (URL↔target check mandatory)', () => {
    const opts = { ...base, databaseUrl: STAGING_URL, yes: true }
    const plan = planLoad(opts, parseDbInfo(STAGING_URL))
    assert.equal(plan.willWrite, false)
    assert.match(plan.errors.join('\n'), /requires --expect-host/)
  })

  it('prod write requires --expect-host', () => {
    const opts = {
      ...base,
      target: 'prod',
      confirmProd: 'prod',
      databaseUrl: PROD_URL,
    }
    const plan = planLoad(opts, parseDbInfo(PROD_URL))
    assert.equal(plan.willWrite, false)
    assert.match(plan.errors.join('\n'), /requires --expect-host/)
  })

  it('prod write succeeds with matching confirm + expect-host', () => {
    const opts = {
      ...base,
      target: 'prod',
      confirmProd: 'prod',
      databaseUrl: PROD_URL,
      expectHost: 'prod',
    }
    const plan = planLoad(opts, parseDbInfo(PROD_URL))
    assert.equal(plan.willWrite, true)
    assert.equal(plan.errors.length, 0)
  })

  it('prod write refused when expect-host points at staging URL (mislabelled URL)', () => {
    const opts = {
      ...base,
      target: 'prod',
      confirmProd: 'prod',
      databaseUrl: STAGING_URL,
      expectHost: 'prod',
    }
    const plan = planLoad(opts, parseDbInfo(STAGING_URL))
    assert.equal(plan.willWrite, false)
    assert.match(plan.errors.join('\n'), /does not contain --expect-host="prod"/)
  })

  it('prod confirm slug must equal target', () => {
    const opts = {
      ...base,
      target: 'prod',
      confirmProd: 'staging',
      databaseUrl: PROD_URL,
      expectHost: 'prod',
    }
    const plan = planLoad(opts, parseDbInfo(PROD_URL))
    assert.equal(plan.willWrite, false)
    assert.match(plan.errors.join('\n'), /does not match --target/)
  })

  it('write intent without a database URL errors', () => {
    const opts = { ...base, yes: true, expectHost: 'staging' }
    const plan = planLoad(opts, null)
    assert.equal(plan.willWrite, false)
    assert.match(plan.errors.join('\n'), /No database URL/)
  })
})

describe('migrate-malice-load — normalizePostgresUrl', () => {
  it('strips jdbc: prefix for pg/psql', () => {
    assert.equal(
      normalizePostgresUrl('jdbc:postgresql://user:pass@ep-plain-mode-al95cugr.eu/neondb'),
      'postgresql://user:pass@ep-plain-mode-al95cugr.eu/neondb',
    )
  })

  it('strips channelBinding query param for psql', () => {
    assert.equal(
      normalizePostgresUrl(
        'postgresql://ep-plain-mode-al95cugr-pooler.c-3.eu-central-1.aws.neon.tech/neondb?user=u&password=p&sslmode=require&channelBinding=require',
      ),
      'postgresql://ep-plain-mode-al95cugr-pooler.c-3.eu-central-1.aws.neon.tech/neondb?user=u&password=p&sslmode=require',
    )
  })

  it('strips channel_binding query param', () => {
    assert.equal(
      normalizePostgresUrl(
        'postgresql://neondb_owner:secret@ep-plain-mode-al95cugr-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
      ),
      'postgresql://neondb_owner:secret@ep-plain-mode-al95cugr-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    )
  })
})

describe('migrate-malice-load — buildPostgresConnectionUrl', () => {
  const jdbcHostOnly =
    'jdbc:postgresql://ep-plain-mode-al95cugr-pooler.eu-west9.aws.neon.tech:5432/neondb?sslmode=require'

  it('injects Spring datasource username/password when JDBC URL has no userinfo', () => {
    const url = buildPostgresConnectionUrl(jdbcHostOnly, {
      username: 'neondb_owner',
      password: 'secret',
    })
    assert.match(url, /^postgresql:\/\/neondb_owner:secret@ep-plain-mode/)
    assert.match(url, /sslmode=require/)
  })

  it('leaves URL unchanged when userinfo is already present', () => {
    const withCreds = 'postgresql://u:p@ep-plain-mode-al95cugr.eu/neondb?sslmode=require'
    assert.equal(
      buildPostgresConnectionUrl(withCreds, { username: 'ignored', password: 'ignored' }),
      withCreds,
    )
  })

  it('resolveHatcastDatasourceUrl merges HATCAST_DATASOURCE_* env', () => {
    const url = resolveHatcastDatasourceUrl({
      HATCAST_DATASOURCE_URL: jdbcHostOnly,
      HATCAST_DATASOURCE_USERNAME: 'neondb_owner',
      HATCAST_DATASOURCE_PASSWORD: 'secret',
    })
    assert.match(url, /^postgresql:\/\/neondb_owner:secret@/)
  })
})

describe('migrate-malice-load — resolveExpectHost', () => {
  it('returns explicit marker unchanged', () => {
    assert.equal(resolveExpectHost('staging', STAGING_URL), 'staging')
  })

  it('derives branch name from Neon host when auto', () => {
    assert.equal(resolveExpectHost('auto', NEON_BRANCH_URL), 'plain-mode-al95cugr')
  })

  it('auto marker passes planLoad host check on Neon branch URL', () => {
    const marker = resolveExpectHost('auto', NEON_BRANCH_URL)
    const opts = { ...parseArgs([]), databaseUrl: NEON_BRANCH_URL, yes: true, expectHost: marker }
    const plan = planLoad(opts, parseDbInfo(NEON_BRANCH_URL))
    assert.equal(plan.willWrite, true)
  })

  it('throws when auto cannot parse URL', () => {
    assert.throws(() => resolveExpectHost('auto', 'not-a-url'), /Cannot derive/)
  })
})
