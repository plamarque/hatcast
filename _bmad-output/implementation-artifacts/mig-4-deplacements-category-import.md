# Story MIG-4 : Import V1 — `deplacement` → `category=deplacements`

Status: done

**Type:** Migration / tooling (PLAN.md § Pre-prod V2 + migration V1, **iso-V1 gate**). Not a product feature story.
**ADR:** [0013 — spectacle categories](../../docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md) · [0016 — migration pipeline](../../docs/adr/0016-v1-v2-availability-compositions-migration-pipeline.md) §Decision.7

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

En tant qu'**opérateur de migration (Patrice)**,
je veux **que les événements V1 `templateType=deplacement` soient importés en V2 avec `category=deplacements` et le glossaire troupe correspondant**,
afin que **stats (17.10), tirage (17.9) et filtres « Déplacements » s'appuient sur des données persistées — pas uniquement sur la règle de lecture legacy — après cutover prod**.

## Acceptance Criteria

1. **Given** un événement V1 avec `templateType = deplacement`, **when** `transformEvents()` s'exécute (MIG-2), **then** la ligne V2 produite inclut `category: 'deplacements'` ; les autres champs (`template_type`, `role_slots`, slug, dates…) restent inchangés par rapport à MIG-2. [Source: PLAN MIG-4 ; DOMAIN § Déplacement ; ADR-0013 §3]
2. **Given** un événement V1 avec `templateType ≠ deplacement`, **when** transformé, **then** `category` reste `null` (compartiment **principal**). [Source: ADR-0013]
3. **Given** le SQL `load.sql` généré, **when** appliqué, **then** les `INSERT INTO events` incluent la colonne `category` ; `ON CONFLICT (id) DO UPDATE` met à jour `category` (idempotent, replay-safe). [Source: V25_1__rename_equity_tag_to_category.sql ; MIG-2 AC7]
4. **Given** au moins un événement `deplacement` migré pour une saison, **when** le load s'exécute, **then** un `INSERT INTO troupe_categories` idempotent crée `{ slug: 'deplacements', label: 'Déplacements' }` pour le `troupe_id` de la saison cible (`seasons.troupe_id`), sans doublon `(troupe_id, slug)`. [Source: V26 seed pattern ; TroupeCategoryIntegrationTest]
5. **Given** la saison Malice 2025-2026 (`o0kD2IJekMdGdiJeIg4O`, 55 events profilés ADR-0016), **when** extract + transform + load complets, **then** `COUNT(*) FROM events WHERE season_id = :v2 AND category = 'deplacements'` = nombre d'événements V1 `templateType=deplacement` dans `raw.json` (attendu **7** d'après seed dev V17 ; re-vérifier sur dump prod). [Source: ADR-0016 profile ; seed V17]
6. **Given** le filtre stats **Déplacements** seul (`equityCompartments=deplacements`, story **17.10**), **when** chargé après migration, **then** les totaux incluent les événements migrés **via `category` persistée** — comportement identique à la règle legacy `template_type=deplacement` + `category IS NULL`, mais sans dépendre du fallback. [Source: 17-10 AC7 ; `SpectacleCategory.kt`]
7. **Given** le pipeline orchestré (`migrate:v2:run`, MIG-5/6), **when** B4 transform/load rejoue, **then** aucun changement de config obligatoire ; le `load.sql` enrichi suffit. Documenter le smoke SQL de vérif catégorie dans le runbook. [Source: `scripts/v2/migrate-lib/pipeline.mjs` step b4]
8. **Given** une branche Neon déjà migrée **sans** `category` (staging pré-MIG-4), **when** on rejoue Procedure C (reset + `./scripts/migrate-from-v1.sh`), **then** les données post-load ont `category=deplacements` ; pas de script de backfill séparé requis si le replay complet est le gate prod. [Source: PLAN § Replay prod gate]

**Couverture produit :** N/A (outillage migration). PLAN.md MIG-4 ; iso-V1 gate.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement sous `apps/web/` ; story 100 % scripts Node + SQL + données V2. Section Material 3 omise volontairement.

---

## Tasks / Subtasks

- [x] **Périmètre :** `scripts/v1/maliceEventsManifest.js` (+ tests), `scripts/migrate-malice-transform.mjs` (si nouveaux params), `docs/v2/migration/preprod-reset-and-migrate.md`. Pas de `services/api/` runtime sauf tests existants si régression.
- [x] **Transform** (AC 1–2) : dans `transformEvents()`, si `templateType === 'deplacement'` → `category: 'deplacements'`, sinon `category: null`.
- [x] **SQL events** (AC 3) : étendre `buildEventsLoadSql()` — colonne `category` dans INSERT/UPDATE ; conserver reconcile `seasons.event_count`.
- [x] **SQL glossaire** (AC 4) : ajouter `buildTroupeDeplacementsCategorySqlLines(seasonV2Id)` (ou équivalent) — `INSERT … SELECT … FROM seasons WHERE id = …` + `WHERE NOT EXISTS` sur `(troupe_id, slug)` ; UUID déterministe (v5 namespace `hatcast:mig-4:troupe-category`) pour replay.
- [x] **Manifest / counts** (optionnel, AC 5) : ajouter `counts.deplacements` dans `manifest.json` pour smoke automatisé.
- [x] **Tests** (AC 1–5) : `scripts/v1/maliceEventsManifest.test.js` — fixture `deplacement` assert `category` ; SQL généré contient `deplacements` ; glossaire SQL présent quand ≥1 déplacement.
- [x] **Runbook** (AC 6–8) : retirer MIG-4 de la table « Out of scope » ; ajouter smoke B4 : requête count `category='deplacements'` ; note replay gate post-MIG-4.
- [x] **Validation** : `node --test scripts/v1/*.test.js` ; 1 cycle `./scripts/migrate-from-v1.sh --dry-run` ou replay staging documenté.

## Dev Notes

### Contexte métier (pourquoi MIG-4)

Stories **17.9** (tirage) et **17.10** (stats) implémentent déjà une **règle de lecture legacy** : `template_type = deplacement` + `category IS NULL` → compartiment `deplacements` via [`SpectacleCategory.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/SpectacleCategory.kt). Cette règle permet la recette staging **avant** MIG-4, mais :

- L'onglet **Infos** (17.8) et le glossaire API n'exposent pas la catégorie persistée sur les rows migrées.
- Le **gate iso-V1 / prod** (PLAN 2026-06-01) exige la **persistance** `category=deplacements` à l'import, alignée ADR-0013 et DOMAIN.

**Référence cible (seed dev) :** [`V26__seed_malice_past_events_historique.sql`](../../services/api/src/main/resources/db/seed/V26__seed_malice_past_events_historique.sql) — event `hist-deplacement-valenciennes` : `template_type='deplacement'`, `category='deplacements'`, plus entrée glossaire `troupe_categories`.

### Contrat transform (verrouillé)

| V1 `templateType` | V2 `template_type` | V2 `category` |
|-------------------|-------------------|---------------|
| `deplacement` | `deplacement` (inchangé) | `'deplacements'` |
| autre | copie fidèle V1 | `NULL` |

**Ne pas** changer `template_type` vers `match`/`cabaret` dans cette story — le « retrait progressif du format `deplacement` » (PLAN) est un **follow-up produit** distinct (17-10 non-goals : ne pas retirer `deplacement` de l'API/UI).

### Schéma V2 cible

| Objet | Fichier |
|-------|---------|
| `events.category` | `V25__equity_tags.sql` → `V25_1__rename_equity_tag_to_category.sql` |
| `troupe_categories` | `V25_1` (ex `troupe_equity_tags`) |
| Règle runtime compartiment | `SpectacleCategory.kt`, `SeasonStatisticsCategoryFilter.kt`, `EventCompositionSlotRepository.kt` JPQL |

### Patterns à réutiliser (ne pas réinventer)

- Module pur + tests : [`scripts/v1/maliceEventsManifest.js`](../../scripts/v1/maliceEventsManifest.js) (MIG-2 — **étendre**, ne pas dupliquer).
- UUID déterministe : `deterministicEventUuid()` — même approche v5 pour l'id glossaire troupe.
- SQL idempotent + escaping : `sqlString()`, `buildSeasonEventCountReconcileSqlLines()`.
- Glossaire idempotent : pattern `INSERT … WHERE NOT EXISTS` de V26 lignes 174–185.
- Loader / garde-fous : [`scripts/migrate-malice-load.mjs`](../../scripts/migrate-malice-load.mjs) — **aucun changement** attendu si tout est dans `load.sql`.
- Orchestrateur : [`scripts/v2/migrate-lib/pipeline.mjs`](../../scripts/v2/migrate-lib/pipeline.mjs) step **b4** appelle `migrate:malice:transform` puis load — enrichir le transform suffit.

### Résolution `troupe_id` pour le glossaire

Préférer une sous-requête SQL depuis `seasonV2Id` (déjà passé au transform) :

```sql
INSERT INTO troupe_categories (id, troupe_id, slug, label)
SELECT :deterministicUuid, s.troupe_id, 'deplacements', 'Déplacements'
FROM seasons s
WHERE s.id = :seasonV2Id
  AND EXISTS (SELECT 1 FROM events e WHERE e.season_id = s.id AND e.category = 'deplacements')
  AND NOT EXISTS (
    SELECT 1 FROM troupe_categories tc
    WHERE tc.troupe_id = s.troupe_id AND tc.slug = 'deplacements'
  );
```

Alternative acceptable : param CLI `--troupe-id=` (déjà dans migrate config) si la sous-requête complique les tests — documenter le choix.

### Smoke / gate prod

Après load B4 :

```sql
SELECT COUNT(*)::int FROM events
WHERE season_id = '<V2_SEASON_UUID>' AND category = 'deplacements';
```

Comparer au décompte V1 :

```bash
node -e "const r=require('./export/malice/<ts>/raw.json'); console.log(r.events.filter(e=>e.templateType==='deplacement').length)"
```

Gate iso-V1 (PLAN) : **replay frais ≥3 cycles** post-MIG-4 via `migrate:v2:validate-replay --min=3`.

### Explicit non-goals

- Retirer `deplacement` de [`EventType`](../../apps/web/src/app/core/events/event-types.ts) / formulaire création — story produit ultérieure.
- Modifier MIG-3 (`maliceAvailabilityCompositions.js`) — les dispos/compositions référencent `event_id`, pas la catégorie.
- Import CSV admin (Story 2.3) — hors périmètre migration Firestore.
- Changer les règles JPQL/stats/tirage — déjà correctes ; MIG-4 ne fait que **persister** ce qu'elles inféraient.
- Flyway migration schema — colonnes existent (V25/V25_1).

### Dependencies

| Story / slice | Status | Relationship |
|---------------|--------|--------------|
| MIG-2 | done | **Étendre** `maliceEventsManifest.js` + `load.sql` |
| MIG-3 | done | Inchangé ; s'exécute après B4 |
| MIG-5 / MIG-6 | done | Replay orchestré consomme le nouveau `load.sql` |
| 17.7 | done | Schéma `category` + glossaire |
| 17.9 | done | Tirage par compartiment — legacy read jusqu'à MIG-4 |
| 17.10 | done | Filtre stats — legacy read jusqu'à MIG-4 |

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Implementation Plan

1. Extend `transformEvents()` with `category` mapping (`deplacement` → `deplacements`, else `null`).
2. Add `category` to `buildEventsLoadSql()` INSERT/ON CONFLICT columns.
3. Add `buildTroupeDeplacementsCategorySqlLines(seasonV2Id)` with v5 UUID namespace `hatcast:mig-4:troupe-category`, appended when ≥1 deplacement event.
4. Add `counts.deplacements` to manifest for smoke automation.
5. Unit tests + runbook B4 smoke SQL/checklist.

### Completion Notes List

- `transformEvents()` now sets `category: 'deplacements'` when `templateType === 'deplacement'`, else `null` (AC1–2).
- `buildEventsLoadSql()` persists `category` in INSERT/UPDATE and appends idempotent `troupe_categories` glossaire via subquery from `seasons.troupe_id` (AC3–4).
- `buildManifest()` exposes `counts.deplacements` for automated smoke (AC5).
- Runbook updated: MIG-4 in scope, B4 smoke SQL + replay gate note (AC6–8).
- `node --test scripts/v1/maliceEventsManifest.test.js` — 19/19 pass. Full `scripts/v1/*.test.js` — 3 pre-existing failures in `maliceLoadGuard.test.js` (channelBinding URL stripping), unrelated to MIG-4.
- Dry-run `./scripts/migrate-from-v1.sh --dry-run` not executed locally (no `export/malice/*/raw.json` artifact); transform path covered by unit tests + existing CLI wiring unchanged except log output.

### File List

- `scripts/v1/maliceEventsManifest.js` (modified)
- `scripts/v1/maliceEventsManifest.test.js` (modified)
- `scripts/migrate-malice-transform.mjs` (modified — log output)
- `docs/v2/migration/preprod-reset-and-migrate.md` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)

### Review Findings

- [x] [Review][Patch] En-tête `load.sql` généré mentionne uniquement « MIG-2 » — ajouter « MIG-4 » dans le commentaire d’en-tête de `buildEventsLoadSql()` [`scripts/v1/maliceEventsManifest.js:194`]
- [x] [Review][Patch] Banner CLI `migrate-malice-transform.mjs` décrit uniquement « MIG-2 transform » — mentionner mapping `category` / glossaire MIG-4 [`scripts/migrate-malice-transform.mjs:4`]
- [x] [Review][Defer] Gate Malice AC5 non exécuté (count=7 non prouvé sur dump prod) — dry-run/replay documenté mais absent des preuves ; bloquant gate prod, pas défaut code — deferred, gate prod
- [x] [Review][Defer] Replay Procedure C post-MIG-4 non démontré (AC8, ≥3 cycles) — deferred, gate prod
- [x] [Review][Defer] `smokeCounts()` pipeline (`neon.mjs`) n’asserte pas `category='deplacements'` — runbook manuel couvre AC7 ; automatisation recommandée avant cutover — deferred, follow-up ops
- [x] [Review][Defer] `sprint-status.yaml` inclut des changements hors MIG-4 (3-20→done, epic-14 superseded) — deferred, hygiene sprint séparée

### Change Log

- 2026-06-01 : Story créée (gate iso-V1 / prod, PLAN MIG-4).
- 2026-06-01 : Implemented MIG-4 transform, load SQL, glossaire, manifest counts, tests, runbook smoke.
- 2026-06-01 : Code review — 2 patch (doc headers) applied, 4 defer (gate prod / ops), 12 dismissed.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (PLAN / ADR-0013 / 17.10 / DOMAIN)
- [x] Section **Material 3** : **UI : N/A** explicite
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `node --test scripts/v1/*.test.js` mentionné
