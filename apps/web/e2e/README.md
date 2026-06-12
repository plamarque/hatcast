# E2E V2 (Playwright)

Tests de bout en bout Angular V2 contre l'API Spring en profil **`e2e`** (H2 + seeds Flyway + auth Google mockée).

## Prérequis

- JDK 21, Node 20+, dépendances racine (`npm ci`).

## Lancer localement

Depuis `apps/web/` :

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright démarre automatiquement :

1. API : `HATCAST_SPRING_PROFILE=e2e ./gradlew bootRun` → `http://127.0.0.1:8080`
2. Front : `ng serve --ssl` → `https://localhost:4200`

Par défaut, les serveurs sont **toujours démarrés par Playwright** (profil `e2e`, CSRF désactivé côté API).

- Réutiliser des processus déjà lancés : par défaut en local (si `4200` / `8080` occupés). Forcer un boot complet : `PLAYWRIGHT_REUSE_SERVERS=0 npm run test:e2e`. L'API réutilisée **doit** être en profil `e2e` si tu bypasses le boot Playwright côté API.
- Cibler un projet : `npm run test:e2e -- --project=e1-mobile-member`

## Projets Playwright

| Projet | Device | Auth | Specs |
|--------|--------|------|-------|
| `setup-admin` | — | `e2e-admin` + reset 3.19 & E1 | `auth.setup.ts` |
| `setup-member` | — | `e2e-member` (Angie) + reset E1 | `auth-member.setup.ts` |
| `e1-mobile-member` | Pixel 5 | membre | `e1/*.mobile.spec.ts` |
| `e1-desktop-orga` | Desktop Chrome | admin | `e1/*.desktop.spec.ts` |
| `chromium-3-19` | Desktop Chrome | admin | `recette-3.19.spec.ts` |
| `chromium-3-8d` | Desktop Chrome | admin | `recette-3.8d.spec.ts` |
| `chromium-3-25` | Desktop Chrome | guest personas (per spec) | `recette-3.25.spec.ts` |
| `chromium-1-8` | Desktop Chrome | guest (no storageState) | `recette-1-8.spec.ts` |

Gate **E1 cutover** (design : `_bmad-output/test-artifacts/test-design-e1-cutover-preprod-gate.md`) : mobile membre + desktop orga en parallèle après les setups.

## Auth & fixtures

- **Auth mock** : `POST /v1/auth/google` avec `{ "idToken": "e2e-admin" }` ou `"e2e-member"` (voir `E2eGoogleIdTokenService`).
- **Fixtures** :
  - `POST /v1/e2e/fixtures/story-3-19/reset`
  - `POST /v1/e2e/fixtures/story-3-8d/reset` (Ruben / Laetitia carnet, Angie, Match vs Bruxelles)
  - `POST /v1/e2e/fixtures/story-3-25/reset` (guest scoped access — Laetitia, Ruben, Piotrix, multi)
  - `POST /v1/e2e/fixtures/e1-cutover/reset` (MVP pilot Les Improbots, Angie, audit seed)
- En-tête : `X-Hatcast-E2E-Key: e2e-fixtures-secret`
- États auth : `e2e/.auth/admin.json`, `e2e/.auth/member.json` (gitignored)

## Smoke / recette 3.19

`recette-3.19.spec.ts` — cahier manuel `scripts/v2/RECETTE-3.19-RETRAIT-ROSTER-SAISON.md` (S1–S9).

## Smoke / recette 3.8d

`recette-3.8d.spec.ts` — cahier manuel `_bmad-output/test-artifacts/recette-manuelle-story-3-8d.md` (scénarios A, C, D, F, H). Fixture : `POST /v1/e2e/fixtures/story-3-8d/reset`.

```bash
cd apps/web && npm run test:e2e -- --project=chromium-3-8d
```

## Smoke / recette 1.8 (auth signup recovery)

`recette-1-8.spec.ts` — story **1.8** / DW-104 : échec transient `POST /v1/auth/idp` après inscription Firebase, redirect `/connexion`, login finalise le lien. Mock Identity Toolkit côté navigateur + tokens `e2e-idp|…` (profil API `e2e`).

```bash
cd apps/web && npm run test:e2e -- --project=chromium-1-8
```

## Smoke / recette 3.25

`recette-3-25.spec.ts` — matrice complète accès invité (18 scénarios). Fixture : `POST /v1/e2e/fixtures/story-3-25/reset`. Design : `_bmad-output/test-artifacts/test-design-story-3-25.md`.

```bash
cd apps/web && npm run test:e2e -- --project=chromium-3-25
```

### Staging (T2) — non couvert

Les recettes **3.19** et **3.8d** supposent le seed **Les Improbots** et les fixtures `POST /v1/e2e/fixtures/*` (profil API **`e2e`** uniquement). Sur **staging** (Neon), seules **La Malice** (migrée) et la troupe **Démo** existent — pas de Ruben/Angie/`match-vs-bruxelles` seedés.

Le gate staging (`e1-preprod-gate.yml`, `PLAYWRIGHT_STAGING_E2E=1`) n’exécute **que** les specs `e1/*.spec.ts` (découverte dynamique via `staging-event-discovery.ts`). Pour porter 3.8d en staging : voir §10 du cahier `_bmad-output/test-artifacts/recette-manuelle-story-3-8d.md`.

## E1 cutover nominal

Specs sous `e2e/e1/` — stats perso, activité spectacle (membre), stats saison, audit (orga), composition MVP, sondage Dispos unifié (5.8) et pool explainability (5.9).

| Spec | IDs | Stories |
|------|-----|---------|
| `member-troupe-nav.mobile.spec.ts` | E1-MEM-040 (**P0**) …042 (P1) | 17.41 nav Ma troupe — gate T2 mobile |
| `member-troupe-hub.mobile.spec.ts` | E1-MEM-043…045 (**P1**) | 17.42 hub dashboard collectif — tuiles, Personnes, teaser |
| `member-dispos-poll.mobile.spec.ts` | E1-MEM-030…033 | 5.8 sondage unifié ; 5.9 pool % + breakdown sans onglet Équipe (E1-MEM-033) |

### T1 — CI local / `e2e-smoke.yml`

Profil API `e2e`, fixtures `POST /v1/e2e/fixtures/e1-cutover/reset`, tokens `e2e-admin` / `e2e-member`.

```bash
cd apps/web && npm run test:e2e
```

### T2 — Gate préprod staging (`e1-preprod-gate.yml`)

Cible **Cloud Run staging** (La Malice migrée), pas de profil `e2e`. Auth email/mot de passe ; slugs saison + membre en env ; **spectacles découverts via API** (dispos ouvertes, passé accepté).

```bash
export PLAYWRIGHT_STAGING_E2E=1
export PLAYWRIGHT_BASE_URL="https://hatcast-v2-staging-….run.app"
# … voir docs/v2/technical/DEPLOYMENT_WORKFLOW.md § 2.6
# HATCAST_E2E_EVENT_*_SLUG optionnels (pin manuel)

cd apps/web
npm run test:e2e -- --project=e1-mobile-member --project=e1-desktop-orga
```

Migration §6 (hors Playwright) — sanity structurel (pas de comptes figés 55/7) :

```bash
node scripts/v2/e1-staging-migration-assert.mjs
```

**CI manuelle :** Actions → **E1 preprod gate (staging)** → Run workflow (environnement `staging`).

**Compte membre inactif :** le setup réactive automatiquement adhésion troupe + roster saison via l’orga E2E (`staging-member-bootstrap.ts`).
