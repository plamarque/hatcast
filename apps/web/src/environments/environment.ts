import type { FirebaseOptions } from 'firebase/app'

/** Production — valeurs injectées au build (CI / remplacements). */
export const environment = {
  production: true,
  googleOAuthWebClientId: '730278491306-fdsq5i690k45tfvphjtjr2j2iq8bgjjd.apps.googleusercontent.com',
  /** Troupe seed dev « Les Improbots » (alignée Flyway V3_1). Prod Démo onboarding : Epic 18 (…000099). */
  demoTroupeId: 'a0000001-0000-4000-8000-000000000001',
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
  } satisfies FirebaseOptions,
}
