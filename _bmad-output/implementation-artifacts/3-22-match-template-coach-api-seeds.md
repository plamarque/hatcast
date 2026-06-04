# Story 3.22 — Template Match : aligner coach (API + seeds)

---
baseline_commit: bd842b8a4565556d62260da3f1d7259e5d527615
---

**Status:** done

**PLAN / triage :** [deferred-work.md](deferred-work.md) **DW-101**, **DW-102**, **DW-103** ; one-shot front [spec-match-default-coach-v2.md](spec-match-default-coach-v2.md) (2026-06-04, front seul)  
**Predecessor :** [3-4-types-devenement-et-roles-requis-optionnels.md](3-4-types-devenement-et-roles-requis-optionnels.md) (presets globaux) ; [spec-match-default-coach-v2.md](spec-match-default-coach-v2.md) (`ROLE_TEMPLATES.match.coach = 1` côté web)

---

## Story

En tant qu’**organisateur** créant ou modifiant un spectacle **Match** via l’API ou la recette dev,  
je veux que le **preset serveur** et les **seeds** incluent **1 slot Coach** comme le front V2,  
afin d’**éviter des dispos/compositions sans rôle Coach** quand `roleSlots` n’est pas envoyé explicitement, et de **ne plus diverger** entre UI, API et données de démo.

---

## Acceptance Criteria

1. **Given** `RoleTemplates.slotsFor("match")` côté API, **when** aucun `roleSlots` n’est fourni à la création d’événement (`POST` avec `templateType: match` seul), **then** la map normalisée inclut **`coach: 1`** et reste alignée sur le preset front [`ROLE_TEMPLATES.match`](../../apps/web/src/app/core/events/event-types.ts) (player 5, mc 1, referee 1, assistant_referee 2, volunteer 5, coach 1, autres clés à 0). [Source: DW-101, story 3.4, FR14]

2. **Given** les tests unitaires API `EventRoleSlotsTest`, **when** la suite `./gradlew test` s’exécute, **then** un test `slotsFor match` (ou équivalent) **échoue avant** le correctif et **passe après**, avec les mêmes effectifs que le test front `applyTemplate('match')` / `rolesRequiredForEvent`. [Source: DW-101]

3. **Given** les seeds dev Improbots / Malice (`V17__seed_malice_members_events_availability.sql` et sortie de [`generate-improbots-seed-sql.js`](../../scripts/v2/generate-improbots-seed-sql.js)), **when** un événement seed a `template_type = 'match'`, **then** le JSON `role_slots` contient **`"coach": 1`** (pas `0`). Regénérer le SQL via `npm run generate:improbots-events-seed` si le repo expose ce script. [Source: DW-102]

4. **Given** un événement **Match déjà persisté** avec `coach: 0` (import V1, ancien seed, ou one-shot front-only), **when** l’admin ouvre le formulaire sans changer les slots, **then** **aucune migration Flyway de masse** n’est exigée par cette story ; les lignes existantes restent telles quelles jusqu’à édition manuelle ou script ops optionnel documenté en Dev Notes. [Source: DW-103]

5. **Given** un admin modifie uniquement le compteur Coach sur un match historique (`coach: 0` → `1`), **when** le front appelle `detectTemplateFromRoles`, **then** le type peut passer à **`custom`** tant que la map complète ne correspond plus au template — comportement **documenté** (pas de régression bloquante) ; optionnel : note dans Dev Notes ou commentaire `event-types.ts` sur la divergence V1 legacy (`coach: 0` sur match). [Source: DW-103, legacy `storage.js`]

6. **Given** story **3.22** done, **when** hygiene deferred est mise à jour, **then** **DW-101** et **DW-102** sont référencés en Completion Notes ; **DW-103** reste ouvert ou « accepté » selon décision PO sur backfill prod. [Source: DOC-1]

**Couverture produit :** **FR14** (types et rôles) — alignement preset, pas nouvelle capacité métier.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement visuel requis. Seule exception admise : **commentaire** en tête de `event-types.ts` (clarifier que le preset Match V2 inclut 1 coach, divergent du legacy V1 `coach: 0`).

---

## Tasks / Subtasks

- [x] **Périmètre :** `services/api/` + `scripts/v2/generate-improbots-seed-sql.js` + seed Flyway `V17` (et tout autre seed match listé en Dev Notes) ; **pas** de migration de données prod importées.
- [x] **AC1** — Ajouter `"coach" to 1` dans le preset `match` de [`EventRoleSlots.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventRoleSlots.kt) (`RoleTemplates`), en gardant les autres clés implicites à 0 via `emptySlots()`.
- [x] **AC2** — Test Kotlin `slotsFor match includes coach and matches V2 front preset` dans [`EventRoleSlotsTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/event/EventRoleSlotsTest.kt) (table de référence partagée ou constantes dupliquées documentées).
- [x] **AC2** — Vérifier [`AvailabilityControllerIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityControllerIntegrationTest.kt) seed match si assertions sur `roleSlots` — ajuster uniquement si nécessaire.
- [x] **AC3** — Mettre à jour `ROLE_PRESETS.match` dans `generate-improbots-seed-sql.js` ; regénérer / patcher `V17` (6+ lignes `template_type = 'match'`).
- [x] **AC3** — Grep `template_type = 'match'` dans `db/seed/` et `db/migration/` : aligner `coach` sur les seeds **dev** concernés (ex. `V36__bootstrap_demo_compositions.sql` si presets match y sont définis).
- [x] **AC5** — Ajuster le commentaire « V1 parity » en tête de [`event-types.ts`](../../apps/web/src/app/core/events/event-types.ts) : preset Match V2 ≠ legacy pour `coach`.
- [x] **AC6** — `./gradlew test` ; `ng test` sur `event-types.spec.ts` (régression nulle attendue).
- [x] Mettre à jour `sprint-status.yaml`, [deferred-work.md](deferred-work.md) (DW-101/102), [deferred-triage-2026-06.md](deferred-triage-2026-06.md).

### Review Findings

- [x] [Review][Patch] **`AvailabilityRoleRulesTest` obsolète** — corrigé : liste attendue inclut `coach`.
- [x] [Review][Patch] **Seeds demo V34 sans slots coach dans V36** — corrigé : slots `coach` ajoutés pour `c0000002`, `c0000011`, `c0000013` dans `V36__bootstrap_demo_compositions.sql`.
- [x] [Review][Patch] **Commentaire API encore « V1 parity »** — corrigé en tête de `EventRoleSlots.kt`.
- [x] [Review][Defer] **Checksum Flyway sur Neon persistant** — documenté en Dev Notes, hors scope correctif code.

---

## Dev Notes

### Problem statement

- One-shot **spec-match-default-coach-v2** (2026-06-04) a fixé le front : `ROLE_TEMPLATES.match.coach = 1`.
- L’API utilise encore `RoleTemplates.slotsFor("match")` **sans** coach → `EventService` ligne ~171 applique l’ancien preset sur create.
- Seeds Malice / générateur Improbots : `"coach": 0` sur tous les matchs → recette dev ≠ nouveau match créé via UI V2.

### Preset cible (source de vérité V2)

Aligner API + seeds sur le front :

| Rôle | Count |
|------|-------|
| player | 5 |
| mc | 1 |
| referee | 1 |
| assistant_referee | 2 |
| volunteer | 5 |
| coach | **1** |
| dj, lighting, stage_manager | 0 |

### Technical guardrails

| Topic | Action |
|--------|--------|
| Create event | `EventService` → `RoleTemplates.slotsFor(templateType)` quand `roleSlots` absent |
| PATCH | Inchangé : si `roleSlots` fourni, pas de réapplication template |
| Legacy V1 | `legacy/src/services/storage.js` — match a **`COACH: 0`** ; ne pas « réaligner » legacy ; documenter divergence |
| Prod import V1 | Pas de backfill automatique dans cette story (DW-103) |
| Flyway checksum | Modifier `V17` peut exiger `repair` sur Neon dev persistant — pattern ops connu (cf. archive 18-0) |

### Explicit non-goals

- Catalogue de rôles **par troupe** (G-006).
- Migration SQL massif des événements match importés depuis Firestore.
- Changer les defaults **catch/cabaret** ou autres templates.
- Story 6-17 / NFR-R2 annonces (hors scope).

### Dependencies

| Story / artefact | Status | Relationship |
|------------------|--------|----------------|
| 3.4 | done | Introduit `RoleTemplates` API |
| spec-match-default-coach-v2 | done (front) | Prérequis produit |
| MIG-2 | done | Events importés peuvent garder coach:0 — accepté |

## Dev Agent Record

### Agent Model Used

Composer (dev story 3.22)

### Completion Notes List

- **DW-101** fermé : `RoleTemplates.slotsFor("match")` inclut `coach: 1`, aligné sur `ROLE_TEMPLATES.match` front.
- **DW-102** fermé : seeds dev Malice (`V17`, 6 lignes), historique (`V26`, 2 matchs), demo bootstrap (`V34`, 6 matchs) et générateur Improbots (`ROLE_PRESETS.match`) passés à `coach: 1`.
- **DW-103** accepté ouvert : pas de backfill Flyway des matchs historiques importés V1 (`coach: 0`) ; commentaire `event-types.ts` documente la divergence legacy ; édition d'un slot sur match historique peut basculer en `custom` via `detectTemplateFromRoles`.
- Tests : `EventRoleSlotsTest`, `AvailabilityControllerIntegrationTest`, `AvailabilityRoleRulesTest`, `DemoBootstrapIntegrationTest`, `event-types.spec.ts` ; `./gradlew test` (610 tests) vert après correctifs review.

### File List

- `services/api/src/main/kotlin/com/hatcast/api/event/EventRoleSlots.kt`
- `services/api/src/test/kotlin/com/hatcast/api/event/EventRoleSlotsTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityControllerIntegrationTest.kt`
- `scripts/v2/generate-improbots-seed-sql.js`
- `services/api/src/main/resources/db/seed/V17__seed_malice_members_events_availability.sql`
- `services/api/src/main/resources/db/seed/V26__seed_malice_past_events_historique.sql`
- `services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityRoleRulesTest.kt`
- `services/api/src/main/resources/db/migration/V34__bootstrap_demo_events.sql`
- `services/api/src/main/resources/db/migration/V36__bootstrap_demo_compositions.sql`
- `apps/web/src/app/core/events/event-types.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/deferred-work.md`
- `_bmad-output/implementation-artifacts/deferred-triage-2026-06.md`

### Change Log

- 2026-06-04 : Story créée (DOC-1 / DW-101–103).
- 2026-06-04 : Correctifs code review — `AvailabilityRoleRulesTest`, slots coach V36, commentaire API.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (FR14, DW-101–103)
- [x] **UI : N/A** explicite
- [x] Tasks référencent les AC
- [x] Liens fichiers code existants
- [x] `./gradlew test` / `ng test` mentionnés
