import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'

const workflow = readFileSync(new URL('../../.github/workflows/deploy-v2-cloud-run.yml', import.meta.url), 'utf8')
const match = workflow.match(/          if \[ "\$\{TARGET_ENV\}" = "staging" \].*?\n          fi/s)
assert.ok(match, 'staging mail health condition must exist')
for (const [target, enabled, expected] of [
  ['staging', '', 'MANAGEMENT_HEALTH_MAIL_ENABLED=false'],
  ['staging', 'false', 'MANAGEMENT_HEALTH_MAIL_ENABLED=false'],
  ['staging', 'off', 'MANAGEMENT_HEALTH_MAIL_ENABLED=false'],
  ['staging', 'true', ''],
  ['staging', 'yes', ''],
  ['production', 'false', ''],
  ['development', 'false', ''],
]) {
  test(`mail health ${target} email=${enabled || '(unset)'}`, () => {
    const script = `append_env() { printf '%s=%s' "$1" "$2"; }\n${match[0]}`
    const actual = execFileSync('bash', ['-c', script], {
      encoding: 'utf8', env: { ...process.env, TARGET_ENV: target, HATCAST_NOTIFICATION_EMAIL_ENABLED: enabled },
    })
    assert.equal(actual, expected)
  })
}
