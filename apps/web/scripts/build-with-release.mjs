import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Embed the identity in JS: fetching version.txt at runtime can describe a newer server.
export function parseRelease(text) {
  const [version, , gitLine] = text.trim().split(/\r?\n/)
  const git = /^Git:\s*([a-f0-9]{7,40})$/i.exec(gitLine ?? '')?.[1]
  if (!/^\d+\.\d+\.\d+(?:-rc\.\d+)?$/.test(version ?? '') || !git) return null
  return { release_id: `${version}:${git.toLowerCase()}`, app_version: version }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const release = parseRelease(readFileSync(new URL('../public/version.txt', import.meta.url), 'utf8'))
  if (!release && process.env.HATCAST_VERSION_CHANNEL === 'production') {
    throw new Error('Production requires valid immutable release metadata')
  }
  const require = createRequire(import.meta.url)
  const buildId = randomUUID()
  const ng = join(dirname(require.resolve('@angular/cli/package.json')), 'bin/ng.js')
  const result = spawnSync(process.execPath, [ng, 'build', ...process.argv.slice(2),
    '--define', `HATCAST_RELEASE=${JSON.stringify(release)}`,
    '--define', `HATCAST_BUILD_ID=${JSON.stringify(buildId)}`], { stdio: 'inherit' })
  if (result.status === 0) {
    const manifestPath = new URL('../dist/web/browser/ngsw.json', import.meta.url)
    if (existsSync(manifestPath)) {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
      manifest.appData = { ...manifest.appData, hatcastBuildId: buildId }
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    }
  }
  process.exit(result.status ?? 1)
}
