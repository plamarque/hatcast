# Story MIG-2 : Export V1 saisons + événements vers V2 et manifest de mapping

Status: done

**Type :** Migration / outillage (PLAN.md § Pre-prod V2 + migration V1). Pas de feature produit.
**ADR :** [docs/adr/0016-…-migration-pipeline.md](../../docs/adr/0016-v1-v2-availability-compositions-migration-pipeline.md) · [0014](../../docs/adr/0014-v2-preprod-migration-no-seed.md) · [0015](../../docs/adr/0015-v2-demo-troupe-product-bootstrap.md)

## Story

En tant qu'**opérateur de migration (Patrice)**,
je veux **exporter en lecture seule la saison + les événements de La Malice depuis la prod V1 (Firestore `(default)`) et les charger dans la troupe/saison V2 cible, en produisant un `manifest.json` de mapping (joueurs + événements)**,
afin de **disposer du pont d'identités V1→V2 déterministe dont MIG-3 (dispos/compositions) a besoin, et de pouvoir rejouer la migration autant que nécessaire avant la bascule**.

## Acceptance Criteria

1. **Given** la saison V1 `o0kD2IJekMdGdiJeIg4O` ("Malice 2025-2026") sur Firestore `(default)`, **when** on lance l'extraction, **then** seuls des `.get()` sont effectués (jamais d'écriture V1) et un dump JSON horodaté est écrit sous `export/malice/<ts>/` (hors git). [Source: ADR-0016 §Decision.2]
2. **Given** le dump V1 des événements (55 attendus ; champs `date` string `YYYY-MM-DD`, `title`, `location`, `description`, `templateType`, `roles{role_key:count}`, `archived`), **when** on transforme, **then** chaque événement non supprimé mappe vers une ligne `events` V2 : `title`, `starts_at` (date V1 + heure par défaut documentée, ex. `19:00` local), `location`, `description`, `template_type` ← `templateType`, `role_slots` (JSON `{role_key:count}`), `archived`, `season_id` = saison V2 cible. [Source: V5__events.sql, V7__event_types_and_role_slots.sql ; ADR-0016]
3. **Given** les événements chargés, **when** la génération du slug s'applique, **then** chaque `events.slug` est renseigné selon la convention V2 (V24/ADR-0013), unique par saison. [Source: V24__events_slug.sql, ADR-0013]
4. **Given** que les membres V1 sont déjà importés en V2 (Story 2.3, `season_participants` peuplés), **when** on construit le manifest, **then** `manifest.json` contient `players[] = { v1PlayerId, email, v2UserId, v2SeasonParticipantId }` résolus **par email normalisé** contre `users` + `season_participants` de la saison cible. [Source: ADR-0016 §Decision.3 ; V14__season_and_event_participants.sql]
5. **Given** les événements chargés en V2, **when** on construit le manifest, **then** `manifest.json` contient `events[] = { v1EventId, v2EventId, slug, date }` couvrant tous les événements migrés. [Source: ADR-0016 §Decision.3]
6. **Given** un joueur V1 sans correspondance V2 (email absent des `season_participants`) ou un événement non résolu, **when** on construit le manifest, **then** la ligne est listée dans un rapport `rejects.json` (raison + détail) et **n'interrompt pas** le run. [Source: ADR-0016 §Decision.4]
7. **Given** le chargement en base, **when** on applique le SQL généré, **then** il est **idempotent** (`INSERT … ON CONFLICT DO UPDATE`), exécuté dans **une transaction**, en **`--dry-run` par défaut** ; une cible production exige `--confirm-prod=<slug>`, `staging` accepte `--yes`. [Source: ADR-0016 §Decision.5]
8. **Given** la commande `--database=default` historiquement documentée, **when** on cible la prod V1, **then** la base réelle `(default)` est utilisée (BUG-DOC-001 corrigé : `getDb` normalise `default`/vide → `(default)`). [Source: ISSUES.md BUG-DOC-001]

**Couverture produit :** N/A (outillage migration). PLAN.md MIG-2.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement sous `apps/web/` ; story 100 % scripts Node + SQL + données V2. Section Material 3 omise volontairement.

---

## Tasks / Subtasks

- [x] **Périmètre :** `scripts/` (Node) + SQL appliqué sur Neon. Pas d'`apps/web/`, pas de `services/api/` runtime (réutilise le schéma existant).
- [x] **Extract** (AC 1, 8) : `getDb` normalise `default`/vide → `(default)` (`normalizeDatabaseId`) ; commande `migrate:malice:extract` qui dump season meta + **tous** les events + players en JSON horodaté sous `export/malice/<ts>/raw.json`. (Dump brut plutôt que `loadEvents()` qui filtre les archivés et cible la base dev — voir notes.)
- [x] **Transform events** (AC 2, 3) : module pur testable `scripts/v1/maliceEventsManifest.js` qui produit les `INSERT events` (+ slug V24, unique/saison) idempotents.
- [x] **Manifest** (AC 4, 5, 6) : résolution joueurs par email normalisé contre l'export `season_participants` (camelCase ou snake_case Neon), résolution events par `v1EventId` ; écrit `manifest.json` + `rejects.json`.
- [x] **Load** (AC 7) : `migrate:malice:load` (partagé avec MIG-3, accepte plusieurs `--sql`) — `psql -f` en transaction unique (`--single-transaction`, `ON_ERROR_STOP`), dry-run par défaut, garde-fou prod (`--confirm-prod=<slug>`), staging `--yes`.
- [x] **npm scripts** : `migrate:malice:extract`(+`:prod`), `migrate:malice:transform`, `migrate:malice:load`(+`:prod`) dans `package.json`.
- [x] **Tests** : tests unitaires du transform events + résolution manifest (fixtures, sans Firestore) dans `scripts/v1/maliceEventsManifest.test.js`.
- [x] **Doc** : `docs/v2/migration/preprod-reset-and-migrate.md` mis à jour (étape B4 events + manifest, note `(default)`).

## Dev Notes

### Contexte migration (V1 → V2)

- Source V1 profilée 2026-05-29 (`scripts/v1-inspect-season.js`, lecture seule) : saison `o0kD2IJekMdGdiJeIg4O`, 31 joueurs (tous avec email), 55 events, 32 casts, 1227 dispos.
- V1 `events.date` est une **string `YYYY-MM-DD` sans heure** → choisir une heure par défaut pour `starts_at` (à documenter ; ne pas inventer une heure par event).
- Le manifest est **le livrable nouveau** de MIG-2 imposé par ADR-0016 ; MIG-3 en dépend strictement.

### Schéma V2 cible (référence)

| Table | Fichier |
|-------|---------|
| `events` (+ `template_type`, `role_slots`) | `services/api/src/main/resources/db/migration/V5__events.sql`, `V7__event_types_and_role_slots.sql` |
| `events.slug` | `V24__events_slug.sql` |
| `season_participants` / `event_participants` | `V14__season_and_event_participants.sql` |
| equity tags (MIG-4, hors scope) | `V25__equity_tags.sql` |

### Patterns à réutiliser

- Lecture Firestore read-only : `scripts/replay/loadSeasonData.js` (`getDb`, `loadEvents`).
- Génération SQL idempotente : `scripts/v2/generate-improbots-seed-sql.js` (+ son test).
- Mapping pur + tests : `scripts/v1/troupeMembersCsv.js` (+ `troupeMembersCsv.test.js`).
- Inspecteur déjà créé : `scripts/v1-inspect-season.js` (base de l'extract).

### Explicit non-goals

- Pas de migration des dispos/compositions (→ MIG-3).
- Pas de mapping `template_type=deplacement` → `equity_tag` (→ MIG-4).
- Pas de bascule prod / DNS / Hosting (checklist séparée, ADR-0014 §6).
- Pas d'import Firebase Auth (séparé).

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 2.3 import membres CSV | done | Prérequis : `season_participants` peuplés pour résoudre le manifest |
| 2.11 / MIG-0 création troupe | done | Prérequis : troupe + saison V2 cibles existent |
| MIG-1 reset Neon staging | done | Boucle reset/replay (ADR-0014 Proc. C) |
| MIG-3 | ready-for-dev | Consommateur du `manifest.json` |

## Dev Agent Record

### Agent Model Used

Claude Opus 4.8 (Cursor, bmad-dev-story workflow).

### Completion Notes List

- **AC1, AC8 (Extract)** : `scripts/migrate-malice-extract.js` lit la saison en lecture seule (`.get()` uniquement) et écrit `export/malice/<ts>/raw.json` (season meta + events + players). `normalizeDatabaseId()` dans `loadSeasonData.js` corrige BUG-DOC-001 (`default`/vide → `(default)`). `export/` ajouté au `.gitignore` (PII, hors git).
- **Choix technique (Extract)** : dump **brut de tous les events** (y compris archivés) au lieu de réutiliser `loadEvents()`, car celui-ci filtre `archived !== true` et cible la base `development`. AC2 migre le champ `archived`, donc les events archivés doivent être présents dans le dump.
- **AC2, AC3 (Transform)** : `transformEvents()` mappe chaque event valide → ligne V2 (`title`, `starts_at` = date V1 + heure par défaut **19:00 local**, `location`, `description`, `template_type` ← `templateType`, `role_slots` JSON fidèle aux `roles` V1, `archived`, `season_id`). Slug généré comme V24 (translit. accents, `-`, unique par saison via suffixe `-2`, `-3`). `v2EventId` = UUID v5 déterministe du `v1EventId` (replay-safe).
- **AC4, AC5, AC6 (Manifest)** : `buildManifest()` résout `players[]` par email normalisé contre l'export `season_participants`, `events[]` par `v1EventId`. Les non-résolus (player sans email / sans participant, event sans date valide) vont dans `rejects.json` sans interrompre le run.
- **AC7 (Load)** : `migrate-malice-load.js` applique le(s) `--sql` via `psql --single-transaction -v ON_ERROR_STOP=1` ; **dry-run par défaut** (imprime le SQL, n'écrit rien) ; staging exige `--yes`, prod exige `--confirm-prod=<slug>` (doit égaler `--target`). SQL idempotent `INSERT … ON CONFLICT (id) DO UPDATE`. Partagé avec MIG-3 (accepte plusieurs `--sql`). **La cible réelle = l'URL `--database-url`** ; le même `load.sql` se rejoue tel quel sur la branche staging puis production.
- **Garde-fou URL↔cible (renforcement demandé en revue)** : `--expect-host=<marker>` vérifie que l'hôte **ou** le nom de branche/base de l'URL contient le marqueur (Neon met souvent l'env dans la branche/db). **Obligatoire pour une écriture prod**, recommandé en staging ; refuse l'écriture si l'URL ne correspond pas à l'étiquette `--target`. Logique pure extraite (`parseDbInfo`, `planLoad`, `isProdTarget`) et couverte par `scripts/v1/maliceLoadGuard.test.js` (13 tests).
- **Tests** : `node --test scripts/v1/*.test.js` → 32 tests verts (12 transform/manifest + 13 garde-fou load + existants). Aucune régression.
- **BUG-DOC-001** déplacé en *Fixed* dans `ISSUES.md` (code + runbook corrigés).

### File List

- `scripts/replay/loadSeasonData.js` (modifié : `normalizeDatabaseId` + normalisation dans `getDb`)
- `scripts/v1/maliceEventsManifest.js` (nouveau : module pur transform + manifest)
- `scripts/v1/maliceEventsManifest.test.js` (nouveau : tests unitaires)
- `scripts/migrate-malice-extract.js` (nouveau : CLI extract read-only)
- `scripts/migrate-malice-transform.js` (nouveau : CLI transform → load.sql + manifest + rejects)
- `scripts/migrate-malice-load.js` (nouveau : CLI load psql, dry-run + garde-fous URL↔cible ; helpers purs exportés)
- `scripts/v1/maliceLoadGuard.test.js` (nouveau : tests garde-fou load)
- `package.json` (modifié : npm scripts `migrate:malice:*`)
- `.gitignore` (modifié : `/export/`)
- `docs/v2/migration/preprod-reset-and-migrate.md` (modifié : procédure B4 + note `(default)`)
- `ISSUES.md` (modifié : BUG-DOC-001 → Fixed)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modifié : statut story)

### Change Log

- 2026-05-29 : Création de la story (ADR-0016).
- 2026-05-29 : Implémentation MIG-2 — extract/transform/load + manifest, fix BUG-DOC-001, 12 tests unitaires. Statut → review.
- 2026-05-29 : Renforcement load — garde-fou URL↔cible (`--expect-host`, obligatoire prod), helpers purs + 13 tests, runbook B4 mis à jour.
- 2026-05-29 : Code review — doublons email V2 dans manifest, retrait alias npm `migrate:malice:load:prod`. Statut → done.

---

### Review Findings

*Code review 2026-05-29 — cible : changements non commités (file list story).*

- [x] [Review][Patch] Emails V2 dupliqués dans `participants.json` — `buildPlayersManifest` garde le premier `season_participant` (tri par id) et signale les doublons dans `rejects.json` (`V2_DUPLICATE_PARTICIPANT_EMAIL`). [`scripts/v1/maliceEventsManifest.js`]

- [x] [Review][Patch] Script npm `migrate:malice:load:prod` trompeur — alias retiré ; prod documenté dans le runbook B4 (`--confirm-prod` + `--expect-host`). [`package.json`]

- [x] [Review][Defer] `getDb()` ré-appelle `initializeApp()` pour chaque nouvel id de base — risque `Firebase App already exists` si un même process mélange `(default)` et `development` (pattern pré-existant dans `loadSeasonData.js`, hors périmètre MIG-2). [`scripts/replay/loadSeasonData.js:33-68`]

- [x] [Review][Defer] `starts_at` naïf (`YYYY-MM-DD HH:mm:ss`) sans fuseau — cohérent avec `TIMESTAMP` V5 et documenté (19:00 « local ») ; l’interprétation dépend du fuseau session Postgres / app (assumption opérationnelle acceptable pour la migration). [`scripts/v1/maliceEventsManifest.js:20-21`, `docs/v2/migration/preprod-reset-and-migrate.md`]

- [x] [Review][Defer] ADR-0016 §Consequences mentionne encore le défaut doc `--database=default` comme ouvert — corrigé dans le code/runbook (ISSUES Fixed) ; mise à jour ADR hors scope story. [`docs/adr/0016-v1-v2-availability-compositions-migration-pipeline.md:43`]

### Validation create-story

- [x] AC métier numérotés et sourcés (ADR-0016 / schéma / ISSUES)
- [x] Section **Material 3** : **UI : N/A** explicite
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` (tests scripts) mentionné
