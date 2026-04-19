#!/usr/bin/env node
/**
 * Écrit `src/environments/environment.ts` pour un build production avec le Client ID Web public.
 * Utilisation (depuis la racine du repo ou `apps/web`) :
 *   GOOGLE_OAUTH_WEB_CLIENT_ID=xxx.apps.googleusercontent.com node apps/web/scripts/inject-google-client-id.mjs
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const id = process.env.GOOGLE_OAUTH_WEB_CLIENT_ID?.trim()
if (!id) {
  console.error('GOOGLE_OAUTH_WEB_CLIENT_ID est requis pour ce build.')
  process.exit(1)
}

const content = `/** Généré par scripts/inject-google-client-id.mjs au build Docker/CI — ne pas y mettre de secret. */
export const environment = {
  production: true,
  googleOAuthWebClientId: ${JSON.stringify(id)},
}
`

const target = join(__dirname, '../src/environments/environment.ts')
writeFileSync(target, content, 'utf8')
console.log('environment.ts mis à jour pour la production (Client ID Web public).')
