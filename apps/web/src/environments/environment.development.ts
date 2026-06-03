import type { FirebaseOptions } from 'firebase/app'

/** Développement local (`ng serve`). Renseigner le Client ID OAuth Web (même valeur que `HATCAST_GOOGLE_OAUTH_WEB_CLIENT_ID` côté API). */
export const environment = {
  production: false,
  googleOAuthWebClientId: '730278491306-fdsq5i690k45tfvphjtjr2j2iq8bgjjd.apps.googleusercontent.com',
  /** Troupe Démo prod (…000099, migration V33+). Les Improbots (…000001) = seed dev local distinct. */
  demoTroupeId: 'a0000001-0000-4000-8000-000000000099',
  /** Clé VAPID publique Web Push — optionnel en local (sinon GET /v1/config/public). */
  webPushVapidPublicKey: '',
  /** Optional local PostHog key — leave empty to disable analytics (no network calls). */
  posthogApiKey: '',
  posthogApiHost: '',
  posthogUiHost: 'https://eu.posthog.com',
  /**
   * Config Web du projet GCP avec Identity Platform (Console : paramètres projet → applications Web,
   * ou console Firebase liée au même projet). Laisser vide pour masquer email/mot de passe en local.
   */
  firebase: {
    apiKey: 'AIzaSyDCqJRmxKiIzuAhgXsmXICCx_O65aujNa0',
    authDomain: 'impro-selector.firebaseapp.com',
    projectId: 'impro-selector',
  } satisfies FirebaseOptions,
}
