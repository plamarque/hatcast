import type { FirebaseOptions } from 'firebase/app'

/** Production — valeurs injectées au build (CI / remplacements). */
export const environment = {
  production: true,
  googleOAuthWebClientId: '730278491306-fdsq5i690k45tfvphjtjr2j2iq8bgjjd.apps.googleusercontent.com',
  /** Troupe Démo prod (Flyway V33+, ADR-0015). Les Improbots (…000001) = seed dev local uniquement. */
  demoTroupeId: 'a0000001-0000-4000-8000-000000000099',
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
  } satisfies FirebaseOptions,
}
