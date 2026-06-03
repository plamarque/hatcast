import type { FirebaseOptions } from 'firebase/app'

/** Production — valeurs injectées au build (CI / remplacements). */
export const environment = {
  production: true,
  googleOAuthWebClientId: '730278491306-fdsq5i690k45tfvphjtjr2j2iq8bgjjd.apps.googleusercontent.com',
  /** Troupe Démo prod (Flyway V33+, ADR-0015). Les Improbots (…000001) = seed dev local uniquement. */
  demoTroupeId: 'a0000001-0000-4000-8000-000000000099',
  /** Clé VAPID publique Web Push — injectée au build (fallback : GET /v1/config/public). */
  webPushVapidPublicKey: '',
  /** PostHog project API key (public ingest) — empty disables analytics (local, CI). */
  posthogApiKey: '',
  posthogApiHost: 'https://e.hatcast.app',
  posthogUiHost: 'https://eu.posthog.com',
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
  } satisfies FirebaseOptions,
}
