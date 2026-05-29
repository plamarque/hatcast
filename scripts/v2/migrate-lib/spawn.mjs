/**
 * Spawn npm migration scripts from repo root.
 */

import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

export function runNpmScript(scriptName, args = [], env = {}) {
  const res = spawnSync('npm', ['run', scriptName, '--', ...args], {
    cwd: repoRoot,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (res.stdout) process.stdout.write(res.stdout)
  if (res.stderr) process.stderr.write(res.stderr)
  if (res.status !== 0) {
    throw new Error(`npm run ${scriptName} failed (exit ${res.status})`)
  }
  return res
}

export { repoRoot }
