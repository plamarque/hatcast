# ADR-0016: V1 → V2 availability & compositions migration pipeline (MIG-3) with a mapping manifest

- **Status:** Accepted
- **Date:** 2026-05-29
- **Context:**
  - [PLAN.md](../../PLAN.md) tracks **MIG-2** (export V1 → V2: seasons + events) and **MIG-3** (export availability / compositions) as backlog slices, after members import (Story 2.3) and troupe creation (Story 2.11 / **MIG-0**).
  - The cutover from V1 (Firebase Hosting) to V2 is **not fixed**. Per [ADR-0014](0014-v2-preprod-migration-no-seed.md), pre-prod must support **resetting Neon `staging` and replaying** the migration until go-live; the same mechanics must run against the **closed** production DB during a final tuning phase before opening to users.
  - V1 production is Firestore database id **`(default)`** ([ADR-0002](0002-multi-database-firestore.md), [ADR-0014](0014-v2-preprod-migration-no-seed.md)). La Malice = real migration only ([ADR-0015](0015-v2-demo-troupe-product-bootstrap.md)).
  - **Profiled source data** (season `Malice 2025-2026`, read-only inspection 2026-05-29 via `scripts/v1-inspect-season.js`):
    - 31 players (**all with email**, 0 rejects), 55 events, 32 casts, 1227 availability docs.
    - `cast.status` ∈ {`confirmed`:28, `incomplete`:3, `pending_confirmation`:1}; `playerStatuses` ∈ {`confirmed`, `declined`, `pending`}.
    - Casts and availability reference players by **V1 player document id** (e.g. `5kxLttJYXQwHOtc2VbC8`), not by name; `playerStatuses` uses the same key.
  - Today's playbook ([preprod-reset-and-migrate.md](../v2/migration/preprod-reset-and-migrate.md)) automates only users + members (CSV → V2 admin UI). Events, availability and compositions are an explicit gap ([ADR-0014](0014-v2-preprod-migration-no-seed.md)).
- **Decision:**
  1. **Three-phase, file-based, replayable pipeline** for MIG-3: `extract → transform → load`, each producing an on-disk, diffable, timestamped artifact under `export/malice/<ts>/` (kept **out of git**, contains PII).
  2. **Extract (strictly read-only):** read V1 Firestore `(default)` via Firebase Admin (`.get()` only; never writes V1). A dedicated **`roles/datastore.viewer`** service account is recommended over personal ADC. Output: `raw.json`.
  3. **Mapping manifest (the pivot contract):** **MIG-2 produces** a `manifest.json`; **MIG-3 consumes** it. It is the only authoritative V1→V2 identity bridge:
     - `players[]`: `{ v1PlayerId, email, v2UserId, v2SeasonParticipantId }` (join on **email**).
     - `events[]`: `{ v1EventId, v2EventId, slug, date }`.
     - Migration is **deterministic** only with this manifest; on-the-fly natural-key resolution is rejected (see Alternatives).
  4. **Transform (V1 → V2 mapping, locked):**

     | V1 (Firestore) | V2 (Postgres) | Rule |
     |---|---|---|
     | `players/{pid}/availability/{evt}.available` | `event_availability.status` | `true→AVAILABLE`, `false→UNAVAILABLE` |
     | `…availability.roles[]` | `event_availability_role_keys` | role keys verbatim |
     | `…availability.comment` | `event_availability_comment` | only when non-null |
     | `casts/{evt}.roles[role][i]` (playerId) | `event_composition_slots(role_key, slot_index=i, season_participant_id)` | `slot_index` = array position |
     | `casts/{evt}.playerStatuses[pid]` | `event_composition_slots.participation_status` | **1:1**: `confirmed→CONFIRMED`, `declined→DECLINED`, `pending→PENDING` |
     | `casts/{evt}.declined[role][i]` (playerId) | `event_composition_declines` | one row per declined player |
     | `casts/{evt}.status` + `confirmedAt` | `event_compositions.validated_at` / `published_at` | see rules below |

     - **`cast.status` → composition lifecycle:** `confirmed` → set `validated_at` + `published_at` (from `confirmedAt`); `pending_confirmation` → `validated_at` only; `incomplete` → draft (`validated_at` NULL).
     - **`event_composition_declines.declined_by_user_id` (NOT NULL):** V1 stores no actor → default to **self-decline** (the declined player's own `v2UserId`).
     - Output: `load.sql` (idempotent) + `rejects.json` (unmapped player/event, etc.).
  5. **Load (write, guarded):** apply `load.sql` via `psql` inside a **single transaction**, all statements idempotent (`INSERT … ON CONFLICT DO UPDATE`). **`--dry-run` is the default** (prints SQL + report, writes nothing). The loader resolves the target Neon branch and **refuses** a production target unless an explicit typed confirmation is given (`--confirm-prod=<slug>`); `staging` accepts `--yes`.
  6. **Reset / replay loop:** rehearse via [ADR-0014](0014-v2-preprod-migration-no-seed.md) Procedure C — reset Neon `staging` → load → smoke → adjust transform → repeat. Gate: **≥ 3 clean cycles** before any production load.
  7. **Sequencing / dependencies:** MIG-3 requires (a) members import (Story 2.3) and (b) **MIG-2** emitting the manifest. MIG-4 (`template_type=deplacement` → `category`) runs after MIG-2/3 on real data.
- **Consequences:**
  - **Positive:** Repeatable, auditable rehearsals; read-only V1 by construction; deterministic identity mapping; production write gated behind explicit confirmation; matches the existing SQL-generation pattern (`scripts/v2/generate-*-seed-sql.js`).
  - **Negative:** MIG-3 cannot ship standalone — blocked on the MIG-2 manifest contract; the manifest adds a new MIG-2 deliverable.
  - **Operational:** Extract needs production-grade Firebase Admin read credentials; `load.sql` and dumps hold PII and must stay out of git with restricted permissions.
  - **Doc defect found:** `preprod-reset-and-migrate.md` and the V1 export scripts pass `--database=default`, but `firebase-admin` requires **`(default)`** (literal `default` → `5 NOT_FOUND`). To be logged in [ISSUES.md](../../ISSUES.md) and fixed.
- **Alternatives considered:**
  - **CSV → new V2 admin import endpoints** (like users/members): rejected — no availability/composition import endpoints exist; more surface for a one-off migration.
  - **On-the-fly natural-key mapping** (email + event slug/date instead of a manifest): rejected — fragile (renamed/moved events, e.g. `"Aperock Mai (déplacé)"`), non-deterministic across replays.
  - **Single combined MIG-2+MIG-3 script:** deferred — possible later, but the manifest boundary keeps each slice testable in isolation.
