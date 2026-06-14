# E2E V2 (Playwright)

Tests de bout en bout Angular V2 contre l'API Spring en profil **`e2e`** (H2 + seeds Flyway + auth Google mockée).

## Prérequis

- JDK 21, Node 20+, dépendances racine (`npm ci`).
- Navigateur Playwright : `npx playwright install chromium` (depuis `apps/web/`).
- **Ports 8080 et 4200 libres**, ou API déjà en profil **`e2e`** si réutilisation (voir [Dépannage local](#dépannage-local)).

## Sélecteurs E2E (convention)

Les specs ne doivent **pas** s’appuyer sur des libellés UI (copy FR) pour localiser un élément ou vérifier un comportement — sauf quand le test porte **explicitement** sur ce texte. Les changements de wording ne doivent pas casser le gate E2E.

### Pyramide (priorité décroissante)

| Priorité | Mécanisme | Usage |
| -------- | --------- | ----- |
| 1 | `data-testid` | Points d’ancrage stables : sections, boutons d’action, lignes de liste, onglets, dialogs |
| 2 | Classes BEM / `data-state` | État visuel (pending, declined, expanded…) — déjà utilisé sur les cellules participation |
| 3 | `getByRole` + `aria-label` stable | Contrôles accessibles dont le texte visible change souvent |
| 4 | `getByText` / `getByRole({ name })` | **Uniquement** si l’AC vérifie le copy (snackbar, empty state, message d’erreur) |
| 5 | Assertion API | Métier / persistance (`GET /v1/me/agenda`, etc.) plutôt que le libellé affiché |

### `data-testid`

- Attribut HTML : `data-testid` (pas d’`id` HTML pour les tests).
- Format : **`{domaine}-{élément}[-{variante}]`** en kebab-case.
  - Ex. : `troupe-hub-personnes-section`, `dispos-poll-row`, `composition-draw-button`.
- Un testid = **un comportement** testé, pas chaque mot de l’interface.
- Préférer le composant le plus proche du DOM testé (pas un wrapper générique unique).

Dans Playwright :

```typescript
page.getByTestId('troupe-hub-personnes-section')
// ou, dans un helper :
page.locator('[data-testid="troupe-hub-personnes-section"]')
```

### Où placer les sélecteurs

- **Specs** (`e2e/**/*.spec.ts`) : scénario et assertions métier uniquement.
- **Helpers** (`e2e/helpers/*.ui.ts`) : tous les sélecteurs et interactions réutilisables.
- **Tests unitaires Angular** : `data-testid` déjà utilisé dans `*.spec.ts` — réutiliser le **même** id quand l’élément est couvert en E2E.

### Migration

Incrémentale, zone par zone (gate E1 en priorité). À chaque casse sur un libellé : ajouter le `data-testid` côté template + mettre à jour le helper — pas de refonte massive d’un coup.

Référence design : `_bmad-output/test-artifacts/test-design-e1-cutover-preprod-gate.md` (R-E04).

## Lancer localement

Raccourci (depuis la racine du dépôt) :

```bash
./scripts/run_e2e.sh              # suite complète (parité CI e2e-smoke)
./scripts/run_e2e.sh --gate       # gate E1 uniquement (plus rapide)
./scripts/run_e2e.sh --smoke      # auth + fixtures
```

Le script vérifie JDK et ports libres, installe Chromium si besoin, et force `PLAYWRIGHT_REUSE_SERVERS=0` (boot API H2 `e2e` + front). **Arrêtez `start-dev.sh` avant.**

Équivalent manuel depuis `apps/web/` :

```bash
npx playwright install chromium
PLAYWRIGHT_REUSE_SERVERS=0 npm run test:e2e
```

Playwright démarre automatiquement :

1. API : `HATCAST_SPRING_PROFILE=e2e ./gradlew bootRun` → `http://127.0.0.1:8080`
2. Front : `ng serve --ssl` → `https://localhost:4200`

Par défaut, les serveurs sont **toujours démarrés par Playwright** (profil `e2e`, CSRF désactivé côté API).

- Réutiliser des processus déjà lancés : **par défaut en local** si `4200` / `8080` sont occupés (`reuseExistingServer: true`). L'API réutilisée **doit** être en profil **`e2e`** — `./scripts/start-dev.sh` (Neon / offline) **n’est pas** ce profil.
- Forcer un boot Playwright complet (API H2 + front) : `PLAYWRIGHT_REUSE_SERVERS=0 npm run test:e2e` — **nécessite des ports libres** (voir Dépannage).
- Smoke minimal (auth + fixtures) : `npm run test:e2e -- --project=setup-admin`
- Cibler un projet : `npm run test:e2e -- --project=e1-mobile-member`
- UI mode (debug) : `npm run test:e2e:ui`

## Dépannage local

### Symptôme : `Fixture reset failed (401)`

**Cause la plus fréquente** : `./scripts/start-dev.sh` (ou API manuelle Neon) tourne déjà sur `8080`, Playwright **réutilise** ce serveur, et les endpoints `/v1/e2e/fixtures/*` ne sont actifs **que** sous le profil Spring **`e2e`**.

Vérification :

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST http://127.0.0.1:8080/v1/e2e/fixtures/story-3-19/reset \
  -H "X-Hatcast-E2E-Key: e2e-fixtures-secret"
# Attendu en profil e2e : 200 — avec start-dev / Neon : 401
```

**Correctif** :

1. Arrêter le dev server habituel (Ctrl+C sur `start-dev.sh`, ou libérer les ports).
2. Lancer Playwright seul (il démarre API `e2e` + `ng serve`) :

```bash
cd apps/web
PLAYWRIGHT_REUSE_SERVERS=0 npm run test:e2e -- --project=setup-admin
```

3. Gate E1 complet une fois le smoke OK :

```bash
PLAYWRIGHT_REUSE_SERVERS=0 npm run test:e2e
```

### Symptôme : `… is already used` (port 8080 ou 4200)

Playwright ne peut pas booter l’API **`e2e`** tant qu’un autre processus occupe le port. Libérer les ports :

```bash
lsof -i :8080 -i :4200
# puis arrêter le processus (PID) ou fermer le terminal start-dev
```

Ne pas mélanger `PLAYWRIGHT_REUSE_SERVERS=0` avec `start-dev` sur les mêmes ports.

### Symptôme : `Unable to locate a Java Runtime`

Les E2E locaux (T1) démarrent l’API via Gradle → **JDK 21+** requis (`java -version`). Sur macOS avec plusieurs JDK :

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
```

### Symptôme : Playwright / Chromium manquant

```bash
cd apps/web && npx playwright install chromium
```

### Workflow recommandé avant push

| Étape | Commande | Durée indicative |
| ----- | -------- | ---------------- |
| Smoke auth + fixtures | `./scripts/run_e2e.sh --smoke` | ~1–2 min (+ boot Gradle 1re fois) |
| Gate E1 (T1) | `./scripts/run_e2e.sh --gate` | ~1 min |
| Suite complète (CI) | `./scripts/run_e2e.sh` | variable |
| Avant staging / prod | `./scripts/deploy_staging.sh` / `./scripts/deploy_prod.sh` (E2E intégrés) | idem suite complète |

**Alternative** : gate CI sur la branche (`e2e-smoke.yml`) — plus lent pour détecter une casse copy.

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
| `member-troupe-hub.mobile.spec.ts` | E1-MEM-043…048 (**P1**) | 17.42 hub dashboard collectif ; 17.44 mini-chart saison |
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
