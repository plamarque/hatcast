# Draw formulas & policies — normative Wave D specification

**Status:** Normative for Wave D (Epic 19 stories **19.15–19.22**).  
**Authority:** Supplements [draw-weight-engine-v1-spec.md](draw-weight-engine-v1-spec.md) (factor math, golden tests) and [ADR 0019](../../adr/0019-draw-weight-engine.md). Does **not** replace factor formulas or V1 parity baseline.  
**Product context:** [Sprint Change Proposal Epic 19](../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-04-epic19-draw-weight-engine.md) § Wave D; [PLAN.md](../../../PLAN.md) § Epic 19 Wave D decisions.

This document defines **troupe-scoped draw formula catalogues**, **draw policies** (troupe and season scope), **resolution** of the effective rule for an event, and **organizer choice at draw time**. Persistence, HTTP APIs, UI, and runtime wiring are owned by follow-on stories (**19.16–19.21**); snapshot extension by **19.22**.

---

## Purpose & authority

| Topic | Authoritative document |
|-------|------------------------|
| Weight math (`malus`, `exactSelectionProbability`, factor multipliers) | [draw-weight-engine-v1-spec.md](draw-weight-engine-v1-spec.md) |
| `% displayed = draw weights` invariant | [ADR 0019](../../adr/0019-draw-weight-engine.md) §2 |
| Formula catalogue, policy scopes, resolution, operator choice | **This spec** |
| OpenAPI paths, HTTP status codes, DB migrations | Stories **19.16–19.18** (implementation) |

**Policy ≠ factor:** A season policy may **require** a formula that references a factor not yet shipped (e.g. gender parity for `category = match` while factor **19.11** is parked). The formula entry may exist in the catalogue with the reserved factor disabled or absent from MVP editor. Runtime publish validation (**19.16+**) should reject publishing a formula with an unknown **enabled** factor; draft formulas may reference reserved factors in disabled state.

---

## Entities

### `DrawFormula` (troupe-scoped catalogue entry)

A reusable **recipe** for composing draw weight factors. Formulas belong to exactly one troupe.

| Field | Type | Required | Semantics |
|-------|------|----------|-----------|
| `id` | UUID | yes | Stable identifier within troupe |
| `troupeId` | UUID | yes | Owning troupe — cross-troupe references forbidden |
| `name` | string | yes | Admin-facing label (e.g. « V1 standard », « V1 + aspirations rôle ») |
| `description` | string | no | Optional admin note |
| `status` | enum | yes | `DRAFT` \| `PUBLISHED` \| `ARCHIVED` |
| `factorConfig` | array | yes | Ordered list of factor slots (see below) |
| `version` | integer | yes | Monotonic audit counter; incremented on each save |
| `updatedAt` | timestamp | yes | Last mutation time |

**`factorConfig` entry:**

```json
{ "factorId": "past_participation", "enabled": true, "params": { "strength": 1.0 } }
```

| Subfield | Semantics |
|----------|-----------|
| `factorId` | Stable string matching Kotlin factor registry (see § Factor catalogue) |
| `enabled` | When `false`, factor is skipped in pipeline assembly |
| `params` | Factor-specific JSON map; keys and ranges defined in § **Factor catalogue** (normative from **19.19a**). Omitted keys use catalogue defaults. Unknown keys → **reject** on save (**REF-P01**, enforcement **19.19b**). |

**Status rules (normative — enforced from 19.16+):**

- Only `PUBLISHED` formulas appear in implicit default allowed sets and active policy references.
- `ARCHIVED` formulas cannot be referenced by active policies at policy save.
- `DRAFT` formulas are editable and invisible to draw resolution except in admin editor previews.
- A troupe must always have **≥1 usable formula** at draw time: implicit **system V1** counts as usable; catalogue must not leave the troupe with zero active recipes (see § Active catalogue invariant).

**System V1 formula:** Every troupe has an implicit **system** formula matching [`DrawWeightPipelines.DEFAULT`](../../../services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightPipeline.kt): `[equity_tag, past_participation]`. It is **always** available for resolution and choice — **even when** the catalogue contains a published equivalent (no deduplication). Seeded concretely in **19.16** (stable id contract owned by that story).

### `DrawPolicy` (troupe or season scope)

Defines **which formula(s)** apply when drawing for events, optionally varying by **spectacle category**.

| Field | Type | Required | Semantics |
|-------|------|----------|-----------|
| `scope` | enum | yes | `TROUPE` \| `SEASON` |
| `troupeId` | UUID | yes | Owning troupe |
| `seasonId` | UUID | conditional | Required when `scope = SEASON` |
| `defaultRule` | rule object | yes | Fallback when no category rule matches |
| `categoryRules` | array | yes | May be empty `[]` |

**Rule object** (`defaultRule` or category rule body):

| Field | Type | Required | Semantics |
|-------|------|----------|-----------|
| `mode` | enum | yes | `MANDATORY` \| `CHOICE` |
| `mandatoryFormulaId` | UUID | when `MANDATORY` | Exactly one formula |
| `allowedFormulaIds` | UUID[] | when `CHOICE` | Ordered list of permitted formulas (may be length 1) |

**Category rule entry:**

```json
{
  "category": "match",
  "mode": "MANDATORY",
  "mandatoryFormulaId": "uuid-parity"
}
```

| Field | Semantics |
|-------|-----------|
| `category` | Troupe glossary slug from **17.7** (`SpectacleCategory`), or `null` for principal / unset events (French UI: « Spectacle ordinaire ») |
| `mode`, `mandatoryFormulaId`, `allowedFormulaIds` | Same as `defaultRule` |

**Resolution key:** **Only** `event.category` (slug) is used — **not** `templateType` or event format (**OQ-19-01** locked). Post-migration, events in the déplacements bucket carry the glossary slug (e.g. `deplacements`) on `event.category`; policy rules target that slug like any other category (**17.7** / MIG-4).

**Formula selection vs per-event policy (OQ-19-02):** There is **no** persisted **draw-policy row per event**. The organizer may **select or change the effective formula** in the Équipe UI **before** running draw when the resolved rule allows choice; that selection drives `%` display and the draw request. It is **not** a troupe/season policy document — only the formula choice for the current composition session (traceability at draw: § Versioning & snapshots).

---

## Resolution algorithm

For event **E** in season **S** (troupe **T**):

```
1. policy ← seasonDrawPolicy(S) if exists
           else troupeDrawPolicy(T) if exists
           else null

2. if policy is null:
     return implicitTroupeDefault(T)   // see § Implicit troupe default

3. category ← E.category   // slug or null; NOT templateType

4. rule ← first categoryRules[] entry where entry.category === category
         (exact slug match; entry with category null matches events with no category)

5. if rule is null:
     rule ← policy.defaultRule

6. if rule.mode == MANDATORY:
     effectiveFormulaId ← rule.mandatoryFormulaId

7. if rule.mode == CHOICE:
     if |rule.allowedFormulaIds| == 1:
       effectiveFormulaId ← rule.allowedFormulaIds[0]
     else if |rule.allowedFormulaIds| >= 2:
       effectiveFormulaId ← organizerChoiceAtDraw(request.formulaId)
       // POST draw MUST include formulaId; reject if missing or not in allowed set
     else:
       reject — invalid policy configuration

8. effectiveFormulaId ← resolveFormulaAvailability(effectiveFormulaId)
     // if id is ARCHIVED, deleted, or missing: fallback cascade (§ Active catalogue invariant)
     // never fail draw solely because a previously referenced catalogue row disappeared

9. assemble DrawWeightPipeline from DrawFormula(effectiveFormulaId).factorConfig
10. run AvailabilityChanceCalculator + CompositionDrawService with that pipeline
    // invariant OQ-19-04: same pipeline for draw, Dispos %, Équipe explainability (19.18+)
```

**Runtime fallback when category deleted later:** If `E.category` no longer exists in troupe glossary at draw time, **fall back to `defaultRule`** (do not fail draw solely for stale slug). At **policy save**, unknown category slugs are **rejected** (see § Validation matrix).

**Duplicate `categoryRules`:** Resolution uses the **first** matching entry; policy save **rejects** duplicate `category` values in `categoryRules[]`.

**Season vs troupe policy:** Troupe policy is the **default for all seasons** without their own policy. When a season has an explicit `DrawPolicy` row, that **complete policy replaces** the troupe policy for events in that season (not a per-category merge with troupe).

---

## Implicit troupe default (OQ-19-02)

When **no** explicit `DrawPolicy` row exists for troupe **T**:

| Field | MVP behaviour |
|-------|---------------|
| `defaultRule.mode` | `CHOICE` |
| `defaultRule.allowedFormulaIds` | All **`PUBLISHED`** formulas in troupe catalogue **plus** implicit **system V1 formula** |
| `categoryRules` | `[]` (empty) |

Season policy remains **optional** — creatable via API **19.18** only (no admin UI **19.20** in MVP sprint).

**Branches by catalogue size** (implicit default `allowedFormulaIds` = all `PUBLISHED` + system V1):

| `PUBLISHED` count | Allowed set size | UI at draw |
|-------------------|------------------|------------|
| 0 | 1 (system V1 only) | No selector — system V1 applied |
| 1 | 2 (F1 + system V1) | Selector — organizer picks one |
| ≥2 | n + 1 (all published + system V1) | Selector when ≥2 entries |

Organizer sees a formula selector when **≥2** formulas are in the allowed set.

---

## Operator choice & composition UI

| Resolved rule | Default effective formula | Organizer action |
|---------------|---------------------------|------------------|
| `MANDATORY` | `mandatoryFormulaId` (with fallback if unavailable) | No choice — shown read-only in Équipe UI (**19.21**) |
| `CHOICE`, 1 allowed formula | The sole id | No selector — shown read-only |
| `CHOICE`, ≥2 allowed formulas | Server default (e.g. first in `allowedFormulaIds` or system V1 — **19.18** documents tie-break) | **May change** formula in Équipe UI **before** draw; **must** pass `formulaId` on `POST …/composition/draw` |

The **active formula** is **displayed clearly** in the Équipe tab for organizers with **`canManageComposition`** (**19.21**). Same permission gate as draw today (`OrganizerAccessService`, story **3.5**).

**Not a per-event policy row:** UI formula selection is scoped to the **composition session**; it does not create a troupe/season `DrawPolicy` row (**OQ-19-02**).

---

## Effective formula & calculator invariant

Once `effectiveFormulaId` is resolved (including organizer UI selection when permitted), a **single pipeline instance** drives:

1. Weighted draw selection (`CompositionDrawService`)
2. Dispos **Tous %** (`AvailabilityChanceCalculator`)
3. Équipe explainability / factor breakdown (**FR19**, **FR20**, **FR24**)

When the resolved rule is `CHOICE` with ≥2 allowed formulas, **`%` and breakdown use the currently selected formula** in the Équipe UI (default applied on load); the organizer may change it before draw (**OQ-19-04**).

This wiring lands in **19.18**; this spec locks the contract. Until **19.18**, production continues to use `DrawWeightPipelines.DEFAULT` regardless of catalogue state.

---

## Active catalogue invariant & runtime fallback

**Invariant:** A troupe always has **≥1 usable formula** at draw time. Implicit **system V1** satisfies this even with an empty catalogue.

**When a resolved formula id is unavailable** at draw (`ARCHIVED`, deleted, or missing after policy was saved):

1. If the resolved rule was `CHOICE`, try the next **`PUBLISHED`** id in `allowedFormulaIds`, then **system V1**.
2. Else re-resolve using **`defaultRule`** for the event.
3. Else use **system V1 formula**.

Draw **must not fail** solely because a catalogue row referenced by policy was archived later. Policy save still **rejects** binding to `ARCHIVED` or `DRAFT` formulas (see § Validation matrix).

---

## Authorization

| Action | Who |
|--------|-----|
| CRUD troupe formula catalogue | **`TROUPE_ADMIN`** (troupe scope) |
| PUT troupe draw policy | **`TROUPE_ADMIN`** |
| PUT season draw policy | **`TROUPE_ADMIN`** for that season's troupe (**OQ-19-05** — *not* delegated `SeasonOrganizer`; aligns with `canManageSeasons` / story **3.5** troupe-admin season settings) |
| GET effective draw rule for event | Organizer with **`canManageComposition`** on event |
| Choose `formulaId` at draw | Same as draw — **`canManageComposition`** when rule = `CHOICE` ≥2 |
| Read-only effective policy on Équipe tab | Organizers + members per **19.21** (future); spec notes intent only |

**OQ-19-05:** Season organizers **consume** effective policy and choose at draw when permitted; they do **not** edit season draw policy. Only troupe admins configure policies.

---

## Validation matrix

Server-side rules (enforcement stories **19.16–19.18** ; param key/range rules **REF-P01..P05** in **19.19b**):

| Condition | When | Action |
|-----------|------|--------|
| Unknown `factorId` in `factorConfig` | Formula save | **Reject** |
| `equity_tag` missing or `enabled: false` in `factorConfig` | Formula save / publish | **Reject** |
| `factorConfig` empty or all entries `enabled: false` | Formula publish | **Reject** |
| Enabled factor not implemented | Formula publish | **Reject**; draft with disabled reserved factor **allowed** |
| Unknown category slug in `categoryRules` | Policy save | **Reject** |
| Duplicate `category` in `categoryRules[]` | Policy save | **Reject** |
| `CHOICE` with empty `allowedFormulaIds` | Policy save | **Reject** |
| Duplicate UUID in `allowedFormulaIds` | Policy save | **Reject** |
| `MANDATORY` with missing `mandatoryFormulaId` | Policy save | **Reject** |
| `MANDATORY` or `CHOICE` referencing formula from another troupe | Policy save | **Reject** |
| `MANDATORY` or `CHOICE` referencing `DRAFT` formula | Policy save | **Reject** |
| `ARCHIVED` formula referenced in active policy | Policy save | **Reject** |
| Formula id ∉ allowed set | Draw request | **Reject** |
| Category slug deleted from glossary after policy saved | Draw runtime | **Fallback** to `defaultRule` |
| Resolved formula `ARCHIVED` / deleted after policy saved | Draw runtime | **Fallback** cascade (§ Active catalogue invariant) |
| Unknown param key for enabled factor | Formula save / publish | **Reject** (**REF-P01**) |
| Param value out of documented range | Formula save / publish | **Reject** (**REF-P02**, **REF-P05**) |
| `malusMultiplier` present but `immediate_replay.params.mode ≠ MALUS` | Formula save / publish | **Reject** (**REF-P03**) |
| Enabled factor missing required param with no default | Formula save / publish | Use catalogue default (**REF-P04**) — not 400 |

**REF-P error message examples (French — enforcement **19.19b**, pattern aligned with [`DrawFormulaValidationException`](../../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaPipelineAssembler.kt)):**

| Ref | Example message |
|-----|-----------------|
| **REF-P01** | `Paramètre inconnu pour past_participation : intensity` |
| **REF-P02** | `role_request.params.maxBonusMultiplier doit être entre 1.0 et 20.0` |
| **REF-P03** | `immediate_replay.params.malusMultiplier n'est autorisé que si mode=MALUS` |
| **REF-P05** | `past_participation.params.strength doit être entre 0.0 et 2.0` |

---

## Factor catalogue

Implemented factors — stable ids matching Kotlin under `services/api/.../draw/`. Each row documents **`direction`** (catalogue metadata for admin UI **19.19c** — read-only, **not** persisted in `factorConfig`), **`params` schema**, and **V1 parity** at documented defaults (baseline commit `81d2b5f8` hardcoded constants).

**Pipeline composition:** `finalWeight = base × Π factorMultiplier` (ADR 0019 §3). Factor order in `factorConfig` determines pipeline order.

### Normative params table (locked **19.19a**)

| factorId | Direction | Param key | Type / range | Default | Runtime formula at default |
|----------|-----------|-----------|--------------|---------|----------------------------|
| `equity_tag` | NEUTRAL | — | — | — | `multiplier = 1.0` ; compartment via scoped `pastSelectionCount` |
| `past_participation` | MALUS | `strength` | number `0.0–2.0` | `1.0` | `mult = (1/(1+n))^strength` where `n = pastSelectionCount` ; `strength=1` → V1 `1/(1+n)` |
| `immediate_replay` | MALUS | `mode` | `EXCLUDE` \| `MALUS` | `EXCLUDE` | Same as [`ImmediateReplayFactor`](../../../services/api/src/main/kotlin/com/hatcast/api/availability/draw/ImmediateReplayFactor.kt) modes |
| | | `malusMultiplier` | number `0.0–1.0` | `0.25` | When `mode=MALUS` and replay detected: `mult = malusMultiplier` (today `MALUS_MULTIPLIER=0.25`) |
| `role_request` | BONUS | `bonusPerUnfulfilled` | number `0.0–5.0` | `1.0` | `mult = min(1 + n × bonusPerUnfulfilled, maxBonusMultiplier)` |
| | | `maxBonusMultiplier` | number `1.0–20.0` | `10.0` | Caps bonus (today `BONUS_PER_UNFULFILLED=1.0`, `MAX_BONUS_MULTIPLIER=10.0`) |

**Semantics:**

- **`direction`** — `MALUS` \| `BONUS` \| `NEUTRAL` for admin UI legibility only; does not change math.
- **Unknown param keys on save** → **reject** (**REF-P01**).
- **Out-of-range values** → **reject** (**REF-P02**, **REF-P05**).
- **`past_participation.strength = 0`** → `mult = 1.0` always (effectively off while factor remains enabled).
- **`immediate_replay`:** omit `mode` → default `EXCLUDE` (matches [`DrawFormulaPipelineAssembler.resolveImmediateReplayMode`](../../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaPipelineAssembler.kt) today).
- **`immediate_replay.params.mode` enum (normative):** `EXCLUDE` \| `MALUS` only — MVP editor and catalogue. Runtime **19.17** still accepts legacy `OFF` (no penalty when replay detected, factor remains enabled); **19.19b** will **reject** `OFF` on save/publish — use `enabled: false` or remove the factor slot instead.
- **`malusMultiplier` when `mode ≠ MALUS`** → **reject** on save (**REF-P03** — strict).
- **Omit optional params** → use defaults (parity with Kotlin constants).
- **V1 parity gate:** when all params omitted or at documented defaults, assembled pipeline **MUST** produce identical weights to baseline commit `81d2b5f8` hardcoded constants. Golden **REF-F01..F08** remain valid at defaults (**19.19b** verifies).

**Plain-language `effect` helpers (French — admin UI **19.19c**):**

| factorId | Param | `effect` (helper text) |
|----------|-------|------------------------|
| `past_participation` | `strength` | Plus la valeur est haute, plus les participations passées pèsent sur les cotes ; `0` = pas d'effet ; `1` = comportement V1 |
| `immediate_replay` | `mode` | Exclure ou pénaliser un candidat qui occupait le même rôle au spectacle précédent (même compartiment) |
| `immediate_replay` | `malusMultiplier` | Si mode MALUS : multiplicateur appliqué au poids (ex. `0.25` = forte pénalité) |
| `role_request` | `bonusPerUnfulfilled` | Bonus ajouté par demande de rôle non satisfaite dans le passé |
| `role_request` | `maxBonusMultiplier` | Plafond du multiplicateur de bonus |

### Per-factor catalogue rows

| factorId | Class | MVP editor | Notes |
|----------|-------|------------|-------|
| `equity_tag` | `CategoryCompartmentFactor` | Always on (non-disableable) | `params: null` — no tunable keys |
| `past_participation` | `PastParticipationFactor` | Toggle + `strength` | See normative table |
| `immediate_replay` | `ImmediateReplayFactor` | Toggle + `mode`, `malusMultiplier` | See normative table |
| `role_request` | `RoleRequestFactor` | Toggle + `bonusPerUnfulfilled`, `maxBonusMultiplier` | See normative table |

**Reserved / not in MVP editor** (stories **19.11–19.14** — « Bientôt »):

| factorId | Story | Direction | params |
|----------|-------|-----------|--------|
| `gender_parity` | 19.11 | — | `null` (stub — no tunable keys until factor ships) |
| `volunteer_bonus` | 19.12 | — | `null` |
| `class_mix` | 19.13 | — | `null` |
| `prestige` | 19.14 | — | `null` |

Policy may reference formulas containing reserved factor slots; runtime publish rejects enabled reserved factors until shipped.

### Handoff to **19.19b** (runtime + golden — not this story)

Extend golden fixtures under `services/api/src/test/resources/draw/golden/`:

| Fixture id | Purpose |
|------------|---------|
| **REF-P01** | Unknown param key → 400 on save |
| **REF-P02** | Out-of-range `maxBonusMultiplier` → 400 |
| **REF-P03** | `malusMultiplier` with `mode=EXCLUDE` → 400 |
| **REF-P04** | Omitted `strength` → assembler uses default `1.0` (parity REF-F01) |
| **REF-P05** | `strength=2.5` → 400 |
| **REF-F09** | Tuned `past_participation.params.strength=1.5` — pipeline weight variant |
| **REF-F10** | Tuned `role_request` params (`bonusPerUnfulfilled=0.5`, `maxBonusMultiplier=5.0`) |
| **REF-F11** | Tuned `immediate_replay` (`mode=MALUS`, `malusMultiplier=0.5`) |

**Also in 19.19b:** reject legacy `immediate_replay.params.mode=OFF` on save (not in normative enum — see § Semantics above).

**Invariant:** **REF-F01..F08** unchanged at default params vs baseline `81d2b5f8`.

### Handoff to **19.19c** (admin UI — not this story)

UI reads **`direction`** and param schemas from a shared catalogue constant (file created in **19.19c**):

```typescript
// Expected export shape — apps/web/src/app/core/draw/draw-factor-catalog.ts (19.19c)
export type DrawFactorDirection = 'MALUS' | 'BONUS' | 'NEUTRAL';

export interface DrawFactorParamSpec {
  key: string;
  type: 'number' | 'enum';
  range?: { min: number; max: number };
  enumValues?: string[];
  default: number | string;
  effect: string; // French plain-language helper
}

export interface DrawFactorCatalogEntry {
  factorId: string;
  direction: DrawFactorDirection;
  params: DrawFactorParamSpec[] | null; // null = reserved / no tunable keys
  reserved?: boolean; // true → « Bientôt » in editor
}
```

Live preview % in editor **deferred** (**OQ-P3**) — static helper text + link [`draw-chances-explained.md`](../product/draw-chances-explained.md) / **19.7** breakdown.

---

## Versioning & snapshots

**Formula edits affect future draws only.** Changing a published formula's `factorConfig` increments `version`; past draws are not retroactively recomputed.

**Draw-time snapshots today (6.14):** `event_draw_chance_snapshots` store `%` odds only — not formula id.

**Story 19.22 extension:** Snapshots will add **formula id + frozen `factorConfig` + policy context** as auditable source of truth for « which recipe was used ». Historical `%` in existing snapshots remain valid evidence; new metadata is additive.

**Composition traceability (PO):** At draw, persist which **effective formula** and **policy context** (troupe/season policy ids, resolved rule) were used on the composition. Surface in the **audit journal** alongside existing composition events. UI (**19.21**) shows the active formula clearly before and at draw. Implementation split: metadata on composition + snapshots (**19.22**), journal wiring with existing audit patterns (**19.18** / **19.21**).

---

## Worked examples

### Ex. A — MVP implicit default

Troupe **T** has two published formulas:

- **F1** — « V1 standard » (`equity_tag`, `past_participation`)
- **F2** — « V1 + aspirations rôle » (+ `role_request`)

No `DrawPolicy` row exists.

→ Implicit default: `defaultRule.mode = CHOICE`, `allowedFormulaIds = [F1, F2, systemV1]`. Organizer sees a **three-option** selector (system V1 always listed, even though F1 is equivalent — **PO decision 1A**). Selected formula drives `%` in Équipe before draw (**19.21** / **19.18**).

### Ex. B — Season category mandatory (future 19.20 UI)

Season policy for league season **S**:

```json
{
  "scope": "SEASON",
  "defaultRule": { "mode": "CHOICE", "allowedFormulaIds": ["f-standard"] },
  "categoryRules": [
    {
      "category": "match",
      "mode": "MANDATORY",
      "mandatoryFormulaId": "f-gender-parity"
    }
  ]
}
```

Event **E** with `category = match` → draw **must** use `f-gender-parity` without organizer choice. Factor **19.11** may still be parked; formula **f-gender-parity** documents intent for PO/demo.

### Ex. C — Category choice

```json
{
  "category": "cabaret",
  "mode": "CHOICE",
  "allowedFormulaIds": ["f1", "f2"]
}
```

Event with `category = cabaret` → organizer **must** pick `f1` or `f2` at draw (selector in **19.21**).

### Ex. D — Null category

Event with `category = null` (principal pool):

- If policy has `{ "category": null, "mode": "CHOICE", "allowedFormulaIds": ["f1"] }` → that rule matches.
- Else → `defaultRule` applies.

---

## Persistence expectations (19.16)

Tables (Flyway **V64** / seed **V65**):

| Table | Holds |
|-------|-------|
| `draw_formulas` | Troupe catalogue rows (`id`, `troupe_id`, `name`, `description`, `status`, `factor_config` JSON, `version`, `is_system`, `system_troupe_key` nullable unique when system, timestamps) |
| `draw_policies` | Troupe + season policy JSON (`default_rule`, `category_rules`); scope uniqueness via nullable `troupe_scope_key` / `season_scope_key`; season index on PostgreSQL uses `WHERE season_id IS NOT NULL` (Flyway placeholder) |

**System V1 id contract:** `DrawFormulaIds.systemV1(troupeId)` = `UUID.nameUUIDFromBytes("hatcast:draw:system-v1:" + troupeId)` — seeded per troupe (`is_system = true`, `status = PUBLISHED`, `factor_config` = `[equity_tag, past_participation]`). Golden alias `"system-v1"` maps to this id in tests.

Troupe isolation: all queries scoped by `troupe_id`; season policies additionally scoped by `season_id`.

---

## Explicit non-goals

- Expression language or scripting for custom formulas
- Per-event persisted policy row
- Admin policy editor UI (**19.20**) — phase 2 sprint; MVP uses implicit default + API **19.18**
- OpenAPI path definitions (owned by **19.17–19.18**)
- Changing `DrawWeightPipelines.DEFAULT` or golden **19.2** fixtures in this story
- Shipping factors **19.11–19.14**

---

## Cross-links

| Document | Relationship |
|----------|--------------|
| [draw-weight-engine-v1-spec.md](draw-weight-engine-v1-spec.md) | Factor math, golden contract |
| [ADR 0019](../../adr/0019-draw-weight-engine.md) | Architecture decision + invariant |
| [SPEC.md](../../../SPEC.md) | Product-level Wave D summary |
| [DOMAIN.md](../../../DOMAIN.md) | Domain terms (plain language) |
| [draw-chances-explained.md](../product/draw-chances-explained.md) | User-facing French guide |

---

## Locked open questions (PLAN.md Epic 19 Wave D)

| ID | Decision |
|----|----------|
| **OQ-19-01** | Resolution key = **`event.category`** (slug glossary **17.7**) |
| **OQ-19-02** | MVP implicit default = **`CHOICE`** + all published formulas + system V1; season policy optional via API **19.18**; no per-event policy row |
| **OQ-19-03** | Preview % in formula editor (**19.17** AC3) waivable for Demo 1 |
| **OQ-19-04** | **`% displayed = same pipeline as draw`** from **19.18** onward |
| **OQ-19-05** | Season policy editor = **`TROUPE_ADMIN` only** (not `SeasonOrganizer`) |
