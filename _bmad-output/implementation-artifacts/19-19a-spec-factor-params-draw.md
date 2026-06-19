---
feature_branch: feat/19-19a-spec-factor-params-draw
baseline_commit: 81d2b5f834949be07133d6049c35344b7ed67eee
---

# Story 19.19a : Spec — factor params & malus/bonus catalogue

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As a **PO / architect**,  
I want a **normative factor-params catalogue** with malus/bonus semantics and V1 parity defaults,  
so that **19.19b** (runtime + golden tests) and **19.19c** (admin UI) implement tunable coefficients without reinventing schemas or breaking golden baselines.

**Trigger:** [Sprint Change Proposal 2026-06-16](../planning-artifacts/sprint-change-proposal-2026-06-16-draw-formula-factor-params.md) — story **19.19** superseded; admin must tune **intensity per criterion**, not only on/off toggles.

## Acceptance Criteria

### Normative params catalogue (primary deliverable)

1. **Given** [`docs/v2/technical/draw-formulas-policies-spec.md`](../../docs/v2/technical/draw-formulas-policies-spec.md) amended, **when** § **Factor catalogue** is read, **then** each **implemented** factor documents:
   - `direction` enum for admin UI: `MALUS` | `BONUS` | `NEUTRAL` (read-only in catalogue — not persisted in `factorConfig`)
   - `params` schema: key, JSON type, inclusive range, default, French `effect` plain-language helper
   - **V1 parity gate:** when all params omitted or at documented defaults, assembled pipeline **MUST** produce identical weights to baseline commit `81d2b5f8` hardcoded constants (see § Locked catalogue table below)
   - Reserved factors **19.11–19.14**: `params: null` stub row + « Bientôt » — no tunable keys until factor ships
   [Source: SCP 2026-06-16 §4 ; epics 19.19 AC2 intent ; **19.17** `factorConfig[].params` JSON already persisted]

2. **Given** the locked catalogue table below approved in this story, **when** docs are merged, **then** it is copied verbatim into the spec (as normative) and cross-linked from ADR 0019:

   | factorId | Direction | Param key | Type / range | Default | Runtime formula at default |
   |----------|-----------|-----------|--------------|---------|----------------------------|
   | `equity_tag` | NEUTRAL | — | — | — | `multiplier = 1.0` ; compartment via scoped `pastSelectionCount` |
   | `past_participation` | MALUS | `strength` | number `0.0–2.0` | `1.0` | `mult = (1/(1+n))^strength` where `n = pastSelectionCount` ; `strength=1` → V1 `1/(1+n)` |
   | `immediate_replay` | MALUS | `mode` | `EXCLUDE` \| `MALUS` | `EXCLUDE` | Same as [`ImmediateReplayFactor`](../../services/api/src/main/kotlin/com/hatcast/api/availability/draw/ImmediateReplayFactor.kt) modes |
   | | | `malusMultiplier` | number `0.0–1.0` | `0.25` | When `mode=MALUS` and replay detected: `mult = malusMultiplier` (today `MALUS_MULTIPLIER=0.25`) |
   | `role_request` | BONUS | `bonusPerUnfulfilled` | number `0.0–5.0` | `1.0` | `mult = min(1 + n × bonusPerUnfulfilled, maxBonusMultiplier)` |
   | | | `maxBonusMultiplier` | number `1.0–20.0` | `10.0` | Caps bonus (today `BONUS_PER_UNFULFILLED=1.0`, `MAX_BONUS_MULTIPLIER=10.0`) |

   **Semantics:**
   - Unknown param keys on save → **reject** (document in § Validation matrix — enforcement **19.19b**)
   - Out-of-range values → **reject**
   - `past_participation.strength = 0` → `mult = 1.0` always (effectively off while factor remains enabled)
   - `immediate_replay`: omit `mode` → default `EXCLUDE` (matches [`DrawFormulaPipelineAssembler.resolveImmediateReplayMode`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaPipelineAssembler.kt) today)
   - Omit optional params → use defaults (parity with constants)

3. **Given** § **Validation matrix** in the same spec, **when** extended, **then** document new **REF-P** rules (implementation **19.19b** — this story documents only):

   | Ref | Rule | When |
   |-----|------|------|
   | **REF-P01** | Unknown param key for enabled factor | Formula save/publish → 400 |
   | **REF-P02** | Param value out of documented range | Formula save/publish → 400 |
   | **REF-P03** | `malusMultiplier` present but `mode ≠ MALUS` | Ignore extra key on save (waivable: reject — **choose reject** for strictness) |
   | **REF-P04** | Enabled factor missing required param with no default | Use catalogue default (not 400) |
   | **REF-P05** | `past_participation.strength` out of `0.0–2.0` | 400 |

   Add French error message examples consistent with existing [`DrawFormulaValidationException`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaPipelineAssembler.kt) patterns.

### draw-weight-engine-v1-spec.md amendment

4. **Given** [`docs/v2/technical/draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) amended, **when** factor rows in § History compartment table are read, **then**:
   - `PastParticipationFactor` documents parameterized formula `(1/(1+n))^strength` with default `strength=1.0` restoring V1 `malus = 1/(1+n)`
   - `ImmediateReplayFactor` documents `malusMultiplier` param (default `0.25`) alongside `mode`
   - `RoleRequestFactor` documents `bonusPerUnfulfilled` + `maxBonusMultiplier` params
   - Cross-link to `draw-formulas-policies-spec.md` § Factor catalogue as Wave D param authority
   - **Do not** change golden fixture expectations in this story — **19.19b** owns test updates
   [Source: SCP § Artifact conflicts ; **19.6**, **19.9**, **19.10** factor stories]

### ADR 0019 amendment

5. **Given** [`docs/adr/0019-draw-weight-engine.md`](../../docs/adr/0019-draw-weight-engine.md) amended, **when** § Wave D / §3 factor pipeline is read, **then**:
   - State admin-tunable `params` per factor are **normative from 19.19a** (no longer « deferred to 19.16+ » for tunable coefficients)
   - Link param catalogue to `draw-formulas-policies-spec.md`
   - Note **19.22** snapshot should store resolved `params` at draw time (forward reference — no schema change here)
   [Source: SCP §3 ; ADR 0019 §6 persistence/UI bullets]

### SPEC.md & DOMAIN.md (minor)

6. **Given** [`SPEC.md`](../../SPEC.md) § Draw formulas & policies amended, **when** read, **then** one bullet states troupe admins may tune **factor coefficients** (not only enable/disable) per catalogue — points to amended spec; does not duplicate param table.
   [Source: SCP § PRD/SPEC minor amend]

7. **Given** [`DOMAIN.md`](../../DOMAIN.md) § Draw formulas amended, **when** read, **then** `factorConfig[].params` described in plain French (malus/bonus direction, intensity) with link to technical spec — no formula duplication.

### Planning artifacts sync

8. **Given** [`_bmad-output/planning-artifacts/epics.md`](../planning-artifacts/epics.md) amended, **when** Epic 19 stories are read, **then**:
   - Story **19.19** marked **superseded** with pointer to **19.19a/b/c**
   - **19.19a** (this story), **19.19b**, **19.19c** entries added per SCP §5.2 (user story + AC summary + depends/blocks)
   - **19.20** depends updated to **19.19c** (not 19.19)
   [Source: SCP §5.2 ; PO approved SCP 2026-06-16]

9. **Given** [`PLAN.md`](../../PLAN.md) Epic 19 Wave D table amended, **when** read, **then** rows reflect **19.19a → 19.19b → 19.19c** sequence and Demo 1 gate = **19.19c** (not monolithic 19.19).

### Locked open questions (PO — lock in this story)

10. **Given** Dev Agent Record § Open Questions, **when** this story completes, **then** these are **locked** (no longer open):

    | ID | Decision |
    |----|----------|
    | **OQ-P1** | `past_participation` curve = `(1/(1+n))^strength` — preserves `n=0 → mult=1` |
    | **OQ-P2** | **Per-param** fields for `immediate_replay` + `role_request` ; **single `strength`** slider for `past_participation` |
    | **OQ-P3** | Live preview % in editor **deferred** — static helper text + link [`draw-chances-explained.md`](../../docs/v2/product/draw-chances-explained.md) / **19.7** breakdown ; preview API remains OQ-19-03 waivable |

### Explicit non-goals (this story)

11. **Given** story scope, **when** dev completes, **then** **no** Kotlin/TypeScript/test code changes — docs + planning artifacts only. Runtime wiring, validator implementation, golden extensions → **19.19b**. Admin UI → **19.19c**.

12. **Couverture :** Wave D S4a. **Priorité :** P2. **Depends :** **19.15** (done), **19.17** (done). **Blocks :** **19.19b**.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — no changes under `apps/web/` ; Material 3 section omitted intentionally. UX amendments for coefficient controls are owned by **19.19c** (after this spec freeze).

---

## Tasks / Subtasks

**Scope:** normative docs + `epics.md` + `PLAN.md` only. **No** `services/api/`, **no** `apps/web/`.

### 0. Branch & baseline (mandatory)

- [x] Confirm branch `feat/19-19a-spec-factor-params-draw` ; baseline `81d2b5f834949be07133d6049c35344b7ed67eee`.

### 1. Primary spec — `draw-formulas-policies-spec.md` (AC 1–3)

- [x] Replace § **Factor catalogue (MVP editor scope)** with full param schemas + direction column + locked catalogue table (AC 2).
- [x] Extend § **Validation matrix** with **REF-P01..P05** and French error examples (AC 3).
- [x] Update `factorConfig` entry example in § Entities to show realistic params JSON, e.g.:
  ```json
  { "factorId": "past_participation", "enabled": true, "params": { "strength": 1.0 } }
  ```
- [x] Remove stale wording « constants in code until 19.16 » for `role_request` / `past_participation` params.

### 2. V1 engine spec — `draw-weight-engine-v1-spec.md` (AC 4)

- [x] Amend § History compartment factor table rows for parameterized formulas.
- [x] Add short § **Parameterized factors (Wave D — 19.19a)** cross-linking policies spec.

### 3. ADR 0019 (AC 5)

- [x] Amend §3 / §6 Wave D bullets: tunable params normative ; link catalogue.

### 4. SPEC.md & DOMAIN.md (AC 6–7)

- [x] One SPEC bullet on admin coefficient tuning.
- [x] DOMAIN plain-language `params` + malus/bonus.

### 5. Planning sync (AC 8–9)

- [x] `epics.md` — split 19.19 → 19.19a/b/c ; supersede old 19.19 AC block.
- [x] `PLAN.md` — Wave D story rows + Demo 1 gate note.

### 6. Forward references for downstream stories (AC 10–11)

- [x] In spec, add **Handoff to 19.19b** note: golden files to extend (`validation.json` REF-P*, `pipelines.json` param variants) — list expected fixture ids (**REF-F09** tuned `strength=1.5`, etc.) as documentation stubs only.
- [x] In spec, add **Handoff to 19.19c** note: UI reads direction from shared catalogue constant path TBD (`apps/web/src/app/core/draw/draw-factor-catalog.ts` — file created in **19.19c**, but document expected export shape here).

### 7. Validation (AC all)

- [x] Self-check: at default params, documented formulas match [`PastParticipationFactor`](../../services/api/src/main/kotlin/com/hatcast/api/availability/draw/PastParticipationFactor.kt), [`RoleRequestFactor`](../../services/api/src/main/kotlin/com/hatcast/api/availability/draw/RoleRequestFactor.kt), [`ImmediateReplayFactor`](../../services/api/src/main/kotlin/com/hatcast/api/availability/draw/ImmediateReplayFactor.kt) constants.
- [x] No contradictions with [`pipelines.json`](../../services/api/src/test/resources/draw/golden/formulas/pipelines.json) REF-F01..F08 (defaults must remain valid).
- [x] Record locked OQ-P1..P3 in Dev Agent Record.

---

## Dev Notes

### Product and UX rules

- **Why now:** Pre-dev UX review (2026-06-16) found epic **19.19 AC2** promised « seuils, coefficients » but normative spec + runtime only support toggles + `immediate_replay.mode`. Constants live in Kotlin objects — not admin-tunable.
- **Malus vs bonus legibility:** `direction` is catalogue metadata for UI (**19.19c**); helps organizers understand explainability breakdown (**19.7**) without changing math.
- **V1 parity is non-negotiable:** DEFAULT pipeline + system V1 seed formula unchanged until **19.18**; default params must reproduce today's behavior for golden REF-F01..F08.

### Current runtime state (read before amending — do not change in this story)

| File | Today | This story changes |
|------|-------|-------------------|
| [`DrawFormulaPipelineAssembler.kt`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaPipelineAssembler.kt) | Passes `mode` only to `ImmediateReplayFactor` ; `PastParticipationFactor`/`RoleRequestFactor` are singletons ignoring `params` | Document target contract only |
| [`DrawFormulaValidator`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaPipelineAssembler.kt) | Validates `immediate_replay.params.mode` only | Document REF-P* rules for **19.19b** |
| [`draw-formulas-policies-spec.md`](../../docs/v2/technical/draw-formulas-policies-spec.md) §257–267 | MVP editor = toggles ; `role_request` « constants in code » | Full param catalogue |
| [`DrawModels.kt`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawModels.kt) | `DrawFactorConfigEntry.params: Map<String, Any>?` | Already sufficient — no schema break |

### Architecture compliance

- **Authority chain:** `draw-weight-engine-v1-spec.md` (math) ← `draw-formulas-policies-spec.md` (catalogue/validation) ← ADR 0019 (invariant + Wave D summary) ← SPEC/DOMAIN (product language).
- **No API shape change:** **19.17** CRUD already accepts arbitrary `params` JSON — **19.19b** adds validation + runtime consumption only.
- **Production draw:** Still `DrawWeightPipelines.DEFAULT` until **19.18** — documenting params does not wire runtime.

### File structure requirements

| Action | Path |
|--------|------|
| **UPDATE** | `docs/v2/technical/draw-formulas-policies-spec.md` |
| **UPDATE** | `docs/v2/technical/draw-weight-engine-v1-spec.md` |
| **UPDATE** | `docs/adr/0019-draw-weight-engine.md` |
| **UPDATE** | `SPEC.md`, `DOMAIN.md` |
| **UPDATE** | `_bmad-output/planning-artifacts/epics.md`, `PLAN.md` |
| **OPTIONAL** | `docs/v2/product/draw-chances-explained.md` — one sentence « coefficients réglables par l'admin (Wave D) » if not already clear |
| **DO NOT EDIT** | `services/api/**`, `apps/web/**`, golden JSON ( **19.19b** ) |

### Testing requirements

- **This story:** docs-only — no `./gradlew test` / `npm run test` required.
- **Handoff checklist for 19.19b:** extend [`validation.json`](../../services/api/src/test/resources/draw/golden/policies/validation.json) with REF-P* cases ; extend [`pipelines.json`](../../services/api/src/test/resources/draw/golden/formulas/pipelines.json) with param variants ; verify REF-F01..F08 unchanged at defaults.

### Explicit non-goals

- Kotlin factor refactor, `DrawFormulaValidator` implementation, assembler param wiring
- Angular admin editor, `draw-factor-catalog.ts`
- `epics.md` story **19.19** UI AC implementation
- Preview POST endpoint (**19.17** AC3 / OQ-19-03)
- Runtime draw policy wiring (**19.18**)
- UX mockup HTML/canvas updates ( **19.19c** / Sally after spec freeze)

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **19.15** | done | Parent Wave D spec — amend, do not replace |
| **19.16** | done | `factor_config` JSON column — sufficient |
| **19.17** | done | CRUD persists `params` — validation extended in **19.19b** |
| **19.19b** | backlog | **Blocked by this story** — runtime + golden |
| **19.19c** | backlog | UI — blocked by **19.19b** ; reads catalogue from this spec |
| **19-19-ui-admin-editeur-formules** | superseded | **Do not implement** — see SCP 2026-06-16 |

---

## Previous story intelligence

### From **19.17** (API CRUD — done)

- `DrawFactorConfigEntry` already has `params: Map<String, Any>?` — persistence works; only `immediate_replay.mode` validated today.
- `DrawFormulaPipelineAssembler` default for null `mode` = `EXCLUDE` — spec must document this as default (not `MALUS`).
- Golden **REF-F01..F08** in `pipelines.json` prove assembler parity with `DrawWeightPipelines.DEFAULT` — default params must not invalidate these fixtures.
- **REF-V01..V04b** in `validation.json` — param validation is additive (REF-P*), not a replacement.

### From **19.15** (normative spec — done)

- Factor catalogue table exists but lacks param schemas — this story fills the gap SCP identified.
- Validation matrix pattern established — extend with REF-P* same table format.

### From SCP 2026-06-16 (approved)

- Split **19.19** → **19.19a/b/c** ; Demo 1 gate shifts to **19.19c**.
- Success criterion #1: golden REF-F* unchanged at default params vs baseline `81d2b5f8`.

---

## Git intelligence summary

Recent Epic 19 commits on `origin/v2`:

| Commit | Relevance |
|--------|-----------|
| `81d2b5f8` merge **19.17** | Baseline — CRUD + assembler + REF-F golden enabled |
| `f319d5c0` draw formula API | `DrawFormulaController`, validator, `pipelines.json` |
| `3ed9b7a8` merge **19.16** | Flyway V64/V65, system V1 seed |
| `e6eebeb8` merge **19.15** | `draw-formulas-policies-spec.md` created |

**Pattern:** Wave D stories are docs-first (**19.15**) then API (**16–17**) then UI (**19.19c**). This story continues docs-first before **19.19b** code.

---

## Project context reference

- [project-context.md](../../project-context.md) — story branch rule: all work on `feat/19-19a-spec-factor-params-draw` until merge after review.
- [AGENTS.md](../../AGENTS.md) — update normative docs when product behavior contract changes ; this story **defines** future behavior without changing runtime yet.
- Commit format: `docs(draw): …` per [COMMIT_MESSAGE_GUIDELINES.md](../../docs/shared/technical/COMMIT_MESSAGE_GUIDELINES.md).

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Completion Notes List

- Amended normative **Factor catalogue** in `draw-formulas-policies-spec.md`: direction enum, locked params table, REF-P01..P05 validation matrix + French error examples, handoff stubs for **19.19b** (REF-F09–F11, REF-P*) and **19.19c** (`DrawFactorCatalogEntry` TypeScript shape).
- Updated `draw-weight-engine-v1-spec.md`: `PastParticipationFactor` row with `(1/(1+n))^strength`, parameterized rows for replay/role_request, new § **Parameterized factors (Wave D — 19.19a)**.
- ADR 0019 §3/§6: tunable params normative from **19.19a**; **19.22** note on resolved params in snapshots.
- SPEC.md + DOMAIN.md: admin coefficient tuning + plain-language `params`.
- Planning sync: `epics.md` (19.19 superseded → 19.19a/b/c; **19.20** depends **19.19c**), `PLAN.md` (Wave D sequence + Demo 1 = **19.19c**).
- Self-check: defaults match Kotlin constants (`strength=1` → V1 malus; `BONUS_PER_UNFULFILLED=1.0`; `MALUS_MULTIPLIER=0.25`; `mode` default EXCLUDE). REF-F01..F08 unchanged (no golden edits in this story).
- Locked OQ-P1..P3 confirmed in Dev Agent Record (AC 10).

### Open Questions — locked by this story (AC 10)

| ID | Resolution |
|----|------------|
| OQ-P1 | `(1/(1+n))^strength` |
| OQ-P2 | Per-param for replay/role_request ; single strength for past_participation |
| OQ-P3 | No live preview in editor MVP ; static helpers only |

### File List

- `docs/v2/technical/draw-formulas-policies-spec.md`
- `docs/v2/technical/draw-weight-engine-v1-spec.md`
- `docs/adr/0019-draw-weight-engine.md`
- `SPEC.md`
- `DOMAIN.md`
- `docs/v2/product/draw-chances-explained.md`
- `_bmad-output/planning-artifacts/epics.md`
- `PLAN.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-06-16 : Story created — spec-only split from superseded 19.19 per SCP 2026-06-16.
- 2026-06-16 : Code review — validation matrix header, legacy `OFF` handoff note, commit story branch.

---

### Review Findings

- [x] [Review][Patch] Changements non commités — toute l'implémentation est dans le working tree (`git diff 81d2b5f8..HEAD` vide) ; committer sur `feat/19-19a-spec-factor-params-draw` avant merge.
- [x] [Review][Patch] Fichier story non tracké — `19-19a-spec-factor-params-draw.md` est `??` ; à ajouter au commit de la story.
- [x] [Review][Patch] En-tête § Validation matrix obsolète [`draw-formulas-policies-spec.md`:235] — intro cite encore « enforcement stories **19.16–19.18** » alors que **REF-P01..P05** sont owned par **19.19b**.
- [x] [Review][Patch] `immediate_replay.params.mode` : catalogue normatif = `EXCLUDE | MALUS` (AC 2 verrouillé) mais le runtime accepte aussi `OFF` ([`DrawFormulaValidator`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaPipelineAssembler.kt) L130) ; ajouter une note de compat / handoff **19.19b** (rejeter `OFF` ou documenter sémantique legacy).

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / SCP / **19.17**)
- [x] Section **Material 3** → **UI : N/A**
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants (assembler, factors, golden JSON)
- [x] Tests N/A for docs-only ; handoff to **19.19b** documented
