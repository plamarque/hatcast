# HatCast — client V2 (`@hatcast/web`)

SPA **Angular 21** + **Angular Material** (OAuth Google + session API, voir [`docs/v2/technical/V2_GOOGLE_OAUTH_SETUP.md`](../../docs/v2/technical/V2_GOOGLE_OAUTH_SETUP.md)).  
**UI / theming / mobile-first :** [`docs/v2/technical/FRONTEND_UI.md`](../../docs/v2/technical/FRONTEND_UI.md).  
**Déploiement** (Docker + Cloud Run, même image que l’API) : [`docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md).

Depuis la racine du monorepo : `npm run dev:web:v2` (équivalent à `npm run dev` dans ce workspace).

## Development server

```bash
npm run dev
# ou : ng serve
```

Ouvrir **`https://localhost:4200/`** (TLS activé dans `angular.json` pour coller aux exigences Google OAuth en local). Le navigateur peut afficher un avertissement de certificat auto-signé : normal en dev. `proxy.conf.json` proxifie `/v1` et `/actuator` vers l’API sur `http://127.0.0.1:8080`.

Pour Google Identity Services : renseigner `googleOAuthWebClientId` dans `src/environments/environment.development.ts` (profil `development` ; voir `angular.json` → `fileReplacements`). Pour **email / mot de passe (Identity Platform)**, renseigner aussi le bloc `firebase` dans ce fichier.

**Build Docker / CI** : [`scripts/inject-google-client-id.mjs`](scripts/inject-google-client-id.mjs) régénère `environment.ts` avec `GOOGLE_OAUTH_WEB_CLIENT_ID` et, si présents, `HATCAST_FIREBASE_*`, `HATCAST_WEB_PUSH_VAPID_PUBLIC_KEY` (voir [`docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md)).

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
