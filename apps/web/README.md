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

**Recette prod locale (`./scripts/start-dev.sh --with-push`)** : le script injecte `environment.ts` depuis le `.env` racine (`HATCAST_GOOGLE_OAUTH_WEB_CLIENT_ID`, `HATCAST_FIREBASE_*`, `HATCAST_WEB_PUSH_VAPID_PUBLIC_KEY`) via [`scripts/inject-google-client-id.mjs`](scripts/inject-google-client-id.mjs) avant le build production — ne pas committer `environment.ts` après recette.

**Build Docker / CI** : même script `inject-google-client-id.mjs` au build image (secrets GitHub) — voir [`docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md).

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

```bash
ng build
# ou depuis la racine du monorepo :
npm run build -w @hatcast/web
```

Le build production écrit les artefacts dans `dist/web/`. Configuration : `angular.json` → `configurations.production` (service worker, budgets, hashing).

### Baseline bundle (production)

Point de référence pour un futur chantier perf — comparer un nouveau `ng build` à ces chiffres pour mesurer la dérive.

| Mesure | Baseline (2026-06-02) | Budget warning | Budget error |
|--------|----------------------:|----------------|--------------|
| Bundle **initial** (raw) | **2,16 MB** | 2,25 MB | 3 MB |
| Bundle **initial** (transfer estimé) | **~398 kB** | — | — |
| Styles composant (`anyComponentStyle`, max observé) | **10,55 kB** | 9 kB | 12 kB |

Fichiers SCSS les plus lourds à la baseline (candidats prioritaires si on réduit les styles) :

| Fichier | Taille |
|---------|-------:|
| `pages/event-detail/event-equipe-tab.scss` | 10,55 kB |
| `pages/member-home-todo/member-home-todo.scss` | 6,42 kB |
| `shared/member-nav/member-nav.scss` | 5,47 kB |
| `shared/audit-journal-list/audit-line-view.scss` | 5,33 kB |
| `shared/member-profile/member-profile-dialog.scss` | 4,67 kB |
| `shared/context-breadcrumb/context-breadcrumb.scss` | 4,47 kB |

**Reproduire la mesure :** `npm run build -w @hatcast/web` — le résumé Angular CLI affiche « Initial total » (raw + transfer estimé). Les dépassements de budget par fichier SCSS n’apparaissent qu’en warning si le seuil est dépassé.

**Contexte stack à la baseline :** Angular 21, Material 3, Firebase client, service worker (`ngsw`), recette `--with-push` = même build production.

**Quand mettre à jour cette section :** après un chantier perf volontaire, ou si les seuils `angular.json` sont recalibrés — noter la date et les nouvelles mesures.

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
