# Story MIG-3 : Pipeline de migration dispos + compositions V1 → V2 (rejouable)

Status: ready-for-dev

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
7. **Given** un joueur V1 ou un événement absent du manifest, **when** on transforme, **then** la dispo/slot/décline concerné est listé dans `rejects.json` (raison + détail) sans interrompre le run. [Source: ADR-0016 §Decision.4]
8. **Given** le `load.sql` généré, **when** on l'applique, **then** il est **idempotent** (`ON CONFLICT DO UPDATE` / clés naturelles), exécuté dans **une transaction unique**, en **`--dry-run` par défaut** ; cible `production` exige `--confirm-prod=<slug>`, `staging` accepte `--yes` ; sinon le loader refuse. [Source: ADR-0016 §Decision.5]
9. **Given** la boucle de répétition, **when** on enchaîne reset Neon `staging` → load → smoke → ajustement → rejeu, **then** la procédure est documentée et un run loggué (date, counts, écarts) ; gate : **≥ 3 cycles propres** avant tout load production. [Source: ADR-0016 §Decision.6 ; ADR-0014 Proc. C]

**Couverture produit :** N/A (outillage migration). PLAN.md MIG-3.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement sous `apps/web/` ; story 100 % scripts Node + SQL + données V2. Section Material 3 omise volontairement.

---

## Tasks / Subtasks

- [ ] **Périmètre :** `scripts/` (Node) + SQL appliqué sur Neon. Pas d'`apps/web/`, pas de `services/api/` runtime.
- [ ] **Extract** (AC 1) : `migrate:malice:extract` — réutiliser `loadAvailability()` + `loadCasts()` (`scripts/replay/loadSeasonData.js`), dump JSON horodaté. Lecture seule.
- [ ] **Transform dispos** (AC 2, 7) : module pur → `INSERT event_availability` (+ role_keys, comment) idempotents, via manifest.
- [ ] **Transform compositions** (AC 3, 4, 5, 6, 7) : module pur → `event_compositions` + `event_composition_slots` + `event_composition_declines` ; slot_index = position ; self-decline ; mapping `cast.status`.
- [ ] **Load** (AC 8) : loader partagé avec MIG-2 — `psql -f load.sql` en transaction, dry-run par défaut, garde-fou prod (`--confirm-prod`) vs `--yes` staging, résolution de la branche Neon cible.
- [ ] **Runbook reset/replay** (AC 9) : section dans `docs/v2/migration/preprod-reset-and-migrate.md` + format de log des cycles.
- [ ] **Tests** : unitaires du transform (fixtures issues du profil réel : `confirmed/incomplete/pending_confirmation`, `declined`, slot vide), sans Firestore.

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

…

### Completion Notes List

- …

### File List

- …

### Change Log

- 2026-05-29 : Création de la story (ADR-0016).

---

### Validation create-story

- [x] AC métier numérotés et sourcés (ADR-0016 / schéma)
- [x] Section **Material 3** : **UI : N/A** explicite
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` (tests scripts) mentionné
