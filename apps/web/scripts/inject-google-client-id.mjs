#!/usr/bin/env node
/**
 * Écrit `src/environments/environment.ts` pour un build production (Client ID Web + config Firebase / Identity Platform).
 * Utilisation (depuis la racine du repo ou `apps/web`) :
 *   GOOGLE_OAUTH_WEB_CLIENT_ID=xxx.apps.googleusercontent.com node apps/web/scripts/inject-google-client-id.mjs
 *
 * Optionnel (même projet GCP que l’API / Identity Platform) :
 *   HATCAST_FIREBASE_WEB_API_KEY, HATCAST_FIREBASE_AUTH_DOMAIN, HATCAST_FIREBASE_PROJECT_ID
 * Optionnel (Web Push story 8.1 — sinon GET /v1/config/public) :
 *   HATCAST_WEB_PUSH_VAPID_PUBLIC_KEY
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

const apiKey = process.env.HATCAST_FIREBASE_WEB_API_KEY?.trim() ?? ''
const authDomain = process.env.HATCAST_FIREBASE_AUTH_DOMAIN?.trim() ?? ''
const projectId = process.env.HATCAST_FIREBASE_PROJECT_ID?.trim() ?? ''
const vapidPublicKey = process.env.HATCAST_WEB_PUSH_VAPID_PUBLIC_KEY?.trim() ?? ''

const content = `import type { FirebaseOptions } from 'firebase/app'
/** Généré par scripts/inject-google-client-id.mjs au build Docker/CI — ne pas y mettre de secret serveur. */
export const environment = {
  production: true,
  googleOAuthWebClientId: ${JSON.stringify(id)},
  /** Troupe Démo prod (Flyway V33+, ADR-0015). Les Improbots (…000001) = seed dev local uniquement. */
  demoTroupeId: 'a0000001-0000-4000-8000-000000000099',
  /** Clé VAPID publique Web Push — injectée au build (fallback : GET /v1/config/public). */
  webPushVapidPublicKey: ${JSON.stringify(vapidPublicKey)},
  firebase: {
    apiKey: ${JSON.stringify(apiKey)},
    authDomain: ${JSON.stringify(authDomain)},
    projectId: ${JSON.stringify(projectId)},
  } satisfies FirebaseOptions,
}
`

const target = join(__dirname, '../src/environments/environment.ts')
writeFileSync(target, content, 'utf8')
console.log(
  'environment.ts mis à jour pour la production (Client ID Web' +
    (apiKey && authDomain && projectId ? ' + Firebase / Identity Platform' : '') +
    ').',
)
