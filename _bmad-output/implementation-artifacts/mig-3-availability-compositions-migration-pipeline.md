# Story MIG-3 : Pipeline de migration dispos + compositions V1 → V2 (rejouable)

Status: done

**Type :** Migration / outillage (PLAN.md § Pre-prod V2 + migration V1). Pas de feature produit.
**ADR :** [docs/adr/0016-…-migration-pipeline.md](../../docs/adr/0016-v1-v2-availability-compositions-migration-pipeline.md)

## Story

En tant qu'**opérateur de migration (Patrice)**,
je veux **un pipeline rejouable `extract → transform → load` qui récupère en lecture seule les disponibilités et compositions (casts) de La Malice depuis la prod V1, les transforme via le `manifest.json` de MIG-2, et les charge en V2 derrière un garde-fou de confirmation**,
afin de **tester la migration à de multiples reprises (reset de la branche Neon `staging` entre chaque) puis de la rejouer sur la prod V2 fermée jusqu'à l'ouverture aux utilisateurs**.

## Acceptance Criteria

1. **Given** la saison V1 `o0kD2IJekMdGdiJeIg4O` sur Firestore `(default)`, **when** on lance l'extraction, **then** seuls des `.get()` sont effectués (jamais d'écriture V1) ; les 1227 dispos (`players/{pid}/availability/{eventId}`) et 32 casts (`casts/{eventId}`) sont dumpés en JSON horodaté sous `export/malice/<ts>/`. [Source: ADR-0016 §Decision.2]
2. **Given** une dispo V1 `{ available, roles[], comment }`, **when** on transforme avec le manifest, **then** une ligne `event_availability(event_id, user_id, status)` est produite avec `status = available ? 'AVAILABLE' : 'UNAVAILABLE'`, les `roles[]` → `event_availability_role_keys`, et `comment` (si non null) → `event_availability_comment`. [Source: V15/V16/V29 ; ADR-0016 §Decision.4]
3. **Given** un cast V1 `roles{ role_key: [playerId,…] }`, **when** on transforme, **then** chaque entrée produit une ligne `event_composition_slots(event_id, role_key, slot_index=position, season_participant_id)` où `season_participant_id` vient du manifest (`v1PlayerId → v2SeasonParticipantId`). [Source: V18/V20 ; ADR-0016 §Decision.4]
4. **Given** `cast.playerStatuses[pid] ∈ {confirmed, declined, pending}`, **when** on fixe le statut du slot, **then** `participation_status` = `CONFIRMED | DECLINED | PENDING` (mapping 1:1). [Source: V18__event_composition_lifecycle.sql ; ADR-0016]
5. **Given** `cast.declined{ role_key: [playerId,…] }`, **when** on transforme, **then** une ligne `event_composition_declines` est produite par joueur décliné, avec `declined_by_user_id` = **self-decline** (l'`v2UserId` du joueur décliné). [Source: V21__composition_participation_declines.sql ; ADR-0016 §Decision.4]
6. **Given** `cast.status ∈ {confirmed, pending_confirmation, incomplete}` et `confirmedAt`, **when** on transforme la composition, **then** `event_compositions` : `confirmed` → `validated_at` + `published_at` (depuis `confirmedAt`) ; `pending_confirmation` → `validated_at` seul ; `incomplete` → brouillon (`validated_at` NULL). [Source: V18 ; ADR-0016 §Decision.4]
7. **Given** un joueur V1 ou un événement absent du manifest, **when** on transforme, **then** la dispo/slot/décline concerné est listé dans le fichier de rejets (raison + détail) sans interrompre le run. _Nom de fichier MIG-3 : `rejects-ac.json` (suffixe `-ac` pour le distinguer du `rejects.json` de MIG-2)._ [Source: ADR-0016 §Decision.4]
8. **Given** le SQL de chargement généré (MIG-3 : `load-ac.sql`, appliqué après le `load.sql` de MIG-2 dans la même transaction via `--sql=load.sql --sql=load-ac.sql`), **when** on l'applique, **then** il est **idempotent** (`ON CONFLICT DO UPDATE` / clés naturelles), exécuté dans **une transaction unique**, en **`--dry-run` par défaut** ; cible `production` exige `--confirm-prod=<slug>`, `staging` exige `--yes` ; **toute écriture (staging comme prod) exige `--expect-host=<marker>`** (vérif URL↔target) ; sinon le loader refuse. [Source: ADR-0016 §Decision.5]
9. **Given** la boucle de répétition, **when** on enchaîne reset Neon `staging` → load → smoke → ajustement → rejeu, **then** la procédure est documentée et un run loggué (date, counts, écarts) ; gate : **≥ 3 cycles propres** avant tout load production. [Source: ADR-0016 §Decision.6 ; ADR-0014 Proc. C]

**Couverture produit :** N/A (outillage migration). PLAN.md MIG-3.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement sous `apps/web/` ; story 100 % scripts Node + SQL + données V2. Section Material 3 omise volontairement.

---

## Tasks / Subtasks

- [x] **Périmètre :** `scripts/` (Node) + SQL appliqué sur Neon. Pas d'`apps/web/`, pas de `services/api/` runtime.
- [x] **Extract** (AC 1) : `migrate:malice:extract` — réutiliser `loadAvailability()` + `loadCasts()` (`scripts/replay/loadSeasonData.js`), dump JSON horodaté. Lecture seule.
- [x] **Transform dispos** (AC 2, 7) : module pur → `INSERT event_availability` (+ role_keys, comment) idempotents, via manifest.
- [x] **Transform compositions** (AC 3, 4, 5, 6, 7) : module pur → `event_compositions` + `event_composition_slots` + `event_composition_declines` ; slot_index = position ; self-decline ; mapping `cast.status`.
- [x] **Load** (AC 8) : loader partagé avec MIG-2 — `psql -f load.sql` en transaction, dry-run par défaut, garde-fou prod (`--confirm-prod`) vs `--yes` staging, résolution de la branche Neon cible.
- [x] **Runbook reset/replay** (AC 9) : section dans `docs/v2/migration/preprod-reset-and-migrate.md` + format de log des cycles.
- [x] **Tests** : unitaires du transform (fixtures issues du profil réel : `confirmed/incomplete/pending_confirmation`, `declined`, slot vide), sans Firestore.

## Dev Notes

### Contexte migration (profil réel V1)

Mesuré 2026-05-29 (`scripts/v1-inspect-season.js`) sur `Malice 2025-2026` :

- 31 joueurs, **tous avec email** (0 rejet attendu côté joueur). Casts/dispos référencent les joueurs par **player doc id** (clé identique dans `playerStatuses`).
- `cast.status` : `confirmed`:28, `incomplete`:3, `pending_confirmation`:1.
- `playerStatuses` : `confirmed`:257, `declined`:35, `pending`:6 → mapping **1:1** `participation_status`.
- Forme dispo : `{ available:boolean, roles:string[] (ex ["mc"]), comment:null, updatedAt }`.
- Forme cast : `{ roles:{role_key:playerId[]}, declined:{role_key:playerId[]}, confirmed, confirmedAt, status, playerStatuses:{playerId:status} }`.

### Contrat de transform (verrouillé, ADR-0016)

| V1 | V2 | Règle |
|----|----|-------|
| `availability.available` | `event_availability.status` | `true→AVAILABLE` / `false→UNAVAILABLE` |
| `availability.roles[]` | `event_availability_role_keys` | verbatim |
| `availability.comment` | `event_availability_comment` | si non null |
| `cast.roles[role][i]` | `event_composition_slots(role_key, slot_index=i, season_participant_id)` | participant via manifest |
| `cast.playerStatuses[pid]` | `slot.participation_status` | `confirmed/declined/pending → CONFIRMED/DECLINED/PENDING` |
| `cast.declined[role][i]` | `event_composition_declines` | `declined_by_user_id` = self-decline |
| `cast.status` + `confirmedAt` | `event_compositions.validated_at` / `published_at` | voir AC 6 |

### Schéma V2 cible (référence)

| Table | Fichier |
|-------|---------|
| `event_availability` (+ role keys, comment) | `V15__event_availability.sql`, `V16__event_availability_role_keys.sql`, `V29__event_availability_comment.sql` |
| `event_compositions`, `event_composition_slots` | `V18__event_composition_lifecycle.sql`, `V20__composition_slot_event_participants.sql` |
| `event_composition_declines` | `V21__composition_participation_declines.sql` |

### Patterns à réutiliser

- Lecture Firestore read-only : `scripts/replay/loadSeasonData.js` (`loadAvailability`, `loadCasts`).
- SQL idempotent + tests : `scripts/v2/generate-improbots-seed-sql.js`, `V19__seed_malice_composition_drafts.sql` (exemple de forme cible compositions).
- Inspecteur : `scripts/v1-inspect-season.js`.

### Explicit non-goals

- Pas de migration saisons/events ni du manifest (→ MIG-2, prérequis).
- Pas de `deplacement` → `equity_tag` (→ MIG-4).
- Pas de bascule prod / Auth import.

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| MIG-2 | ready-for-dev | **Bloquant** : fournit `manifest.json` (players + events) |
| 2.3 import membres | done | `season_participants` peuplés |
| MIG-1 reset Neon staging | done | Boucle reset/replay |
| MIG-4 | backlog | Suit MIG-2/3 sur données réelles |

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Completion Notes List

- Extract étendu (`raw@2`) : `loadAvailabilityRecords` + `loadCasts(database)` → `availability[]` + `casts[]` dans `raw.json`.
- Module pur `scripts/v1/maliceAvailabilityCompositions.js` : transform dispos/compositions, UUID déterministes, SQL idempotent (`ON CONFLICT DO UPDATE`).
- CLI `migrate:malice:transform:ac` → `load-ac.sql` + `rejects-ac.json` ; load partagé MIG-2 (`--sql=load.sql --sql=load-ac.sql`).
- Runbook B5 + format `replay-log.jsonl` (gate ≥ 3 cycles) dans `preprod-reset-and-migrate.md`.
- Tests : `node --test scripts/v1/*.test.js` → 50 tests verts (dont 17 sur le transform MIG-3 `maliceAvailabilityCompositions.test.js`).

### File List

- `scripts/replay/loadSeasonData.js` — `loadAvailabilityRecords`, `loadCasts(databaseId)`
- `scripts/migrate-malice-extract.js` — dump availability + casts (MIG-3)
- `scripts/v1/maliceAvailabilityCompositions.js` — transform pur MIG-3
- `scripts/v1/maliceAvailabilityCompositions.test.js` — tests unitaires AC 2–8
- `scripts/migrate-malice-transform-ac.js` — CLI transform MIG-3
- `package.json` — `migrate:malice:transform:ac`
- `docs/v2/migration/preprod-reset-and-migrate.md` — procédure B5 + cycle log

### Change Log

- 2026-05-29 : Création de la story (ADR-0016).
- 2026-05-29 : Implémentation pipeline MIG-3 (extract étendu, transform AC, runbook, tests).

---

### Validation create-story

- [x] AC métier numérotés et sourcés (ADR-0016 / schéma)
- [x] Section **Material 3** : **UI : N/A** explicite
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` (tests scripts) mentionné

---

### Review Findings

_Code review 2026-05-29 (bmad-code-review, 3 couches adversariales × 7 fichiers). Périmètre : pipeline MIG-3 complet (extract/transform/load + tests)._

#### Decision needed

- [x] [Review][Decision] (résolu → patch appliqué) Garde-fou prod du loader contournable par mauvais label — une URL **prod** passée avec `--target=staging` écrit avec le seul `--yes`, sans assertion d'hôte (`--expect-host` optionnel hors prod). Un fat-finger d'URL peut donc écrire en prod sans `--confirm-prod`. Décision : rendre `--expect-host` (vérif URL↔target) **obligatoire aussi pour staging**, ou laisser en l'état ? [scripts/migrate-malice-load.js:119,139-146]
- [x] [Review][Decision] (résolu → patch appliqué) `cast.status='confirmed'` avec `confirmedAt` null → composition rétrogradée en brouillon — `mapCompositionLifecycle` renvoie `validated_at`/`published_at` = NULL si `confirmedAt` est absent, alors que les slots peuvent rester `CONFIRMED` (état contradictoire) et que l'AC 6 exige `validated_at`+`published_at`. Décision : fallback souhaité (`updatedAt` ? `now()` ? laisser brouillon ?). Profil Malice probablement non touché (28 confirmed ont `confirmedAt`). [scripts/v1/maliceAvailabilityCompositions.js:140-151]
- [x] [Review][Decision] (résolu → patch appliqué) Identité de décline = position dans le tableau — `deterministicDeclineUuid(event, role, slotIndex, playerId)` inclut `slotIndex` (index dans `declined[role]`). Si V1 réordonne ce tableau entre deux extractions, le rejeu crée une **ligne de décline en double** (l'ancienne n'est pas supprimée, conflit sur `id`). Atténué par le reset-entre-cycles (staging) mais impacte un ré-apply prod. Décision : clé d'identité décline = `event+role+player` (sans `slotIndex`) ? [scripts/v1/maliceAvailabilityCompositions.js:60-62,298]

#### Patch

- [x] [Review][Patch] (corrigé) CLI transform sans gestion d'erreur autour de `JSON.parse(readFileSync())` (raw + manifest) ni `main().catch` → `ENOENT`/`SyntaxError` brut, sans dire quel fichier ; même incohérence : `main()` du loader n'entoure pas `readFileSync` [scripts/migrate-malice-transform-ac.js:57-58,106 ; scripts/migrate-malice-load.js:178]
- [x] [Review][Patch] (corrigé) CLI transform : `--out-dir` jamais créé avant écriture (l'extract fait `mkdirSync`) → `ENOENT` si le dossier n'existe pas [scripts/migrate-malice-transform-ac.js:78-81]
- [x] [Review][Patch] (corrigé) CLI transform : extract vide → avertit mais écrit un `load-ac.sql` vide et sort 0 (faux succès) ; devrait sortir non-zéro [scripts/migrate-malice-transform-ac.js:63-70]
- [x] [Review][Patch] (corrigé) `resolvePlayer` ne rejette pas un `v2SeasonParticipantId` absent (seul `v2UserId` est gardé) → slot/décline inséré avec `season_participant_id` NULL ; le CHECK XOR autorise les deux colonnes NULL → **slot orphelin sans participant** (perte silencieuse de l'assignation). Lien AC 3. [scripts/v1/maliceAvailabilityCompositions.js:120-131,282,302]
- [x] [Review][Patch] (corrigé) `loadAvailabilityRecords` : `catch {}` vide avale les erreurs de lecture par joueur → perte silencieuse de dispos, sans avertissement ni code retour. Surfacer un compteur d'échecs. [scripts/replay/loadSeasonData.js:165-167]
- [x] [Review][Patch] (corrigé) CLI transform : `dump.availability`/`dump.casts` non-tableau → `TypeError: not iterable` (bypass du check de vacuité). Valider la forme du dump. [scripts/migrate-malice-transform-ac.js:61-65]
- [x] [Review][Patch] (corrigé) Test « derives stable slot **and decline** UUIDs » n'assert que le déterminisme du slot ; `deterministicDeclineUuid` n'est appelé qu'une fois (format only) [scripts/v1/maliceAvailabilityCompositions.test.js:282-290]
- [x] [Review][Patch] (corrigé) Lacunes de couverture des tests : regex UUID tautologique à resserrer (forme v5) + branches non testées — `PLAYER_NO_V2_USER`, `v2SeasonParticipantId` absent, `confirmed` sans `confirmedAt`, fallback `declined_at`, champ `detail` des rejects (AC 7), mapping `season_participant_id` du slot (AC 3) [scripts/v1/maliceAvailabilityCompositions.test.js]
- [x] [Review][Patch] (corrigé) Doc : AC 7/8 et ADR-0016 mentionnent `rejects.json`/`load.sql` ; l'implémentation écrit `rejects-ac.json`/`load-ac.sql` (suffixe `-ac` volontaire vs MIG-2). Aligner le libellé des AC/ADR. [scripts/migrate-malice-transform-ac.js:78-79]
- [x] [Review][Patch] (corrigé) Doc : Completion Notes annoncent « 44 tests verts (+12 MIG-3) » mais le fichier de test ne contient que 11 blocs `it()`. Réconcilier le décompte. [Completion Notes List]

#### Deferred

- [x] [Review][Defer] `comment` > VARCHAR(500) / `role_key` > VARCHAR(64) non validés → ferait échouer toute la transaction unique ; non routé vers rejects. Profil Malice : `comment=null`, role_keys courts. [scripts/v1/maliceAvailabilityCompositions.js:196,283] — deferred, non déclenché par les données réelles
- [x] [Review][Defer] Rejeu laisse des lignes orphelines si un joueur est retiré d'un rôle entre deux runs (`ON CONFLICT DO UPDATE` ne supprime jamais). Atténué par reset-entre-cycles (staging) + apply prod unique. — deferred, par conception
- [x] [Review][Defer] AC 9 : gate « ≥ 3 cycles propres » + run loggué (date/counts/écarts) documenté mais aucune entrée `replay-log.jsonl` réelle fournie. — deferred, opérationnel (à exécuter avant load prod)
- [x] [Review][Defer] Finitions mineures : URL Postgres passée en `argv` à `psql` (visible dans `ps`) ; sortie « Wrote… » sur stderr ; flags mal orthographiés ignorés silencieusement ; garde mort `!casts` ; écrasement silencieux des sorties existantes. [migrate-malice-load.js:208 ; migrate-malice-transform-ac.js:30-33,63-65] — deferred, polish
