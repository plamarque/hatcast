// Until launch, do not let the service worker claim or cache authenticated API routes.
const assert = require('node:assert/strict')
const path = require('node:path')
const config = require(path.resolve(__dirname, '../../ngsw-config.json'))
assert.ok(config.navigationUrls?.includes('!/v1/**'), 'API routes must be excluded from navigation fallback')
assert.equal((config.dataGroups ?? []).length, 0, 'data groups require a privacy review before Advent launch')
for (const group of config.assetGroups ?? []) {
  for (const file of group.resources?.files ?? []) {
    assert.ok(!file.startsWith('/v1/') && !file.startsWith('/**'), `asset pattern can include private API paths: ${file}`)
  }
  assert.equal((group.resources?.urls ?? []).length, 0, 'external URL caches require a privacy review before Advent launch')
}
console.log('PASS: service-worker configuration excludes private API data')
