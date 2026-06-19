---
feature_branch: feat/19-15-spec-formules-politiques-adr
baseline_commit: 6e2b709bd9cee44d7edb6b6e7b1d36fdb05a9de7
---

# Story 19.15 : Draw formulas & policies normative spec (SPEC + DOMAIN + ADR)

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As a **PO / architect**,  
I want a **normative model** for draw **formulas** and **policies**,  
so that **troupe admins, season admins, and organizers** know who configures what and how the **effective formula** is resolved at draw time.

## Acceptance Criteria

### Normative Wave D contract (new technical spec)

1. **Given** a new normative document [`docs/v2/technical/draw-formulas-policies-spec.md`](../../docs/v2/technical/draw-formulas-policies-spec.md) (approved PO), **when** published, **then** it defines at minimum:
   - **`DrawFormula`** — troupe-scoped **catalog** entry: stable `id`, `troupeId`, `name`, optional `description`, `status` (`DRAFT` \| `PUBLISHED` \| `ARCHIVED`), `factorConfig` (ordered list of `{ factorId, enabled, params? }`), `version` / `updatedAt` semantics for audit.
   - **`DrawPolicy`** — scope `TROUPE` \| `SEASON`; shape `{ defaultRule, categoryRules[] }` where each rule has `mode` (`MANDATORY` \| `CHOICE`), optional `mandatoryFormulaId`, and `allowedFormulaIds[]`.
   - **`categoryRules[]` entry** — `{ category: string | null, mode, mandatoryFormulaId?, allowedFormulaIds[] }` where `category` is a **glossary slug** from troupe categories (**17.7**) or `null` for principal / unset events.
   - **Resolution order** — for event E: **season policy** (if any) **overrides** **troupe policy** (if any); match `E.category` against `categoryRules[]` (exact slug match; `null` rule matches events with no category); else apply `defaultRule`; if no explicit policy row exists, apply **implicit MVP default** (see AC 2 / OQ-19-02).
   - **Operator choice moment** — when resolved rule is `CHOICE` with **≥2** allowed formulas, organizer **must** pick `formulaId` **at draw** (`POST …/composition/draw`); **no per-event policy row** persisted in MVP (**OQ-19-02** locked).
   - **Effective formula** — once resolved, the same pipeline instance drives **draw**, Dispos **Tous %**, and Équipe explainability (**OQ-19-04** / ADR 0019 invariant) from story **19.18** onward.
   - **Validation matrix** — document server-side rules: unknown `factorId` → reject formula save; formula id ∉ allowed set → reject draw; `MANDATORY` with missing/foreign formula → reject policy save; unknown category slug at policy save → **warn or reject** (choose one — recommend **reject at save**, **fallback to `defaultRule` at runtime** if category deleted later); archived formula in active policy → reject policy save.
   [Source: epics 19.15 AC1–2 ; SCP Wave D §3 ; PLAN.md § Epic 19 Wave D]

2. **Given** MVP sprint default (no UI **19.20** yet), **when** documented in the spec § **Implicit troupe default**, **then** a troupe **without** explicit policy behaves as: `defaultRule.mode = CHOICE`, `allowedFormulaIds =` all **`PUBLISHED`** formulas in troupe catalogue **plus** implicit **system V1 formula**; empty `categoryRules[]`. Season policy remains optional via API **19.18** only. [Source: **OQ-19-02** locked PLAN.md 2026-06]

3. **Given** policy resolution key, **when** documented, **then** **only** `event.category` (slug, **17.7** / **17.8**) is used — **not** `templateType` / event format. [Source: **OQ-19-01** locked]

### SPEC.md & DOMAIN.md amendments

4. **Given** [`SPEC.md`](../../SPEC.md) updated, **when** read, **then** composition/draw section adds a **Wave D** subsection that:
   - Introduces formulas & policies at product level (who configures, resolution summary, organizer draw choice).
   - Points to [`draw-formulas-policies-spec.md`](../../docs/v2/technical/draw-formulas-policies-spec.md) + ADR 0019 — **does not duplicate** factor math or full JSON schemas.
   - States **FR19 / FR20 / FR24** still satisfied via same calculator pipeline once effective formula is known.
   - Explicitly separates **policy requirements** (e.g. “match category may mandate gender-parity formula”) from **factor implementation** (**19.11** backlog — policy may reference a formula slot; factor may be stubbed/off until shipped).
   [Source: epics 19.15 AC1, AC4]

5. **Given** [`DOMAIN.md`](../../DOMAIN.md) updated, **when** read, **then** new § **Draw formulas & policies (Wave D)** defines domain terms (`DrawFormula`, `DrawPolicy`, `defaultRule`, `categoryRule`, effective rule, system formula) and resolution narrative in plain language; links to technical spec; preserves existing draw/factor sections (**19.8–19.10**) without duplicating formulas. [Source: epics 19.15 AC1 ; AGENTS.md doc-update rule]

### ADR 0019 amendment

6. **Given** [`docs/adr/0019-draw-weight-engine.md`](../../docs/adr/0019-draw-weight-engine.md) amended, **when** read, **then** § Wave D sketch is **promoted to normative summary** with:
   - Link to `draw-formulas-policies-spec.md` as Wave D authority (mirrors V1 spec pattern).
   - Persistence expectations (tables deferred to **19.16** — names illustrative: `draw_formulas`, `draw_policies`).
   - Formula **versioning** intent: edits affect **future** draws only; past draws rely on **19.22** snapshot (formula id + frozen `factorConfig` + policy context).
   - Validation & security summary (troupe isolation, admin gates).
   - Update §3 DEFAULT note: production DEFAULT pipeline unchanged until **19.18** wires runtime to persisted formula; system V1 formula = `[equity_tag, past_participation]` matching [`DrawWeightPipelines.DEFAULT`](../../services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightPipeline.kt).
   [Source: epics 19.15 AC2, AC5 ; ADR 0019 §6]

### Permissions & roles

7. **Given** rights documented in spec § **Authorization**, **when** reviewed against V2 permission patterns, **then**:

   | Action | Who |
   |--------|-----|
   | CRUD troupe formula catalogue | **`TROUPE_ADMIN`** (troupe scope) |
   | PUT troupe draw policy | **`TROUPE_ADMIN`** |
   | PUT season draw policy | **`TROUPE_ADMIN`** for that season’s troupe (**OQ-19-05** locked — *not* delegated `SeasonOrganizer`; aligns with `canManageSeasons` / **3.5** troupe-admin season settings) |
   | GET effective draw rule for event | Organizer with **`canManageComposition`** on event (**3.5**, `OrganizerAccessService`) |
   | Choose `formulaId` at draw | Same as draw today — **`canManageComposition`** when rule = `CHOICE` ≥2 |
   | Read-only effective policy on Équipe tab | Organizers + members per **19.21** (future); spec only notes intent |

   [Source: epics 19.15 AC3 ; `OrganizerAccessService.kt` ; story **3.5**]

### Worked examples (documentation only)

8. **Given** spec § **Examples**, **when** read, **then** includes at least:
   - **Ex. A — MVP implicit default:** troupe with two published formulas (“V1 standard”, “V1 + role request”); no policy row → organizer sees choice between both at draw.
   - **Ex. B — Season category mandatory (future 19.20 UI):** season policy `categoryRules[{ category: "match", mode: MANDATORY, mandatoryFormulaId: <gender-parity-formula> }]` — documents intent for **19.11** without requiring factor code.
   - **Ex. C — Category choice:** `category: "cabaret"`, `mode: CHOICE`, `allowedFormulaIds: [f1, f2]` → selector at draw when ≥2.
   - **Ex. D — Null category:** event without category uses `defaultRule` or `categoryRules` entry with `category: null`.
   [Source: epics 19.15 AC4 ; SCP §3 example PO]

9. **Given** a formula edited after past draws, **when** spec § **Immutability & snapshots** is read, **then** it states **`event_draw_chance_snapshots` (6.14)** remain historical % evidence; **19.22** adds formula id + frozen config as auditable source of truth for “which recipe was used”. [Source: epics 19.15 AC5]

### Factor catalogue reference (MVP editor scope)

10. **Given** spec § **Factor catalogue**, **when** read, **then** lists **implemented** factors with stable ids matching Kotlin (`services/api/.../draw/`):

    | factorId | Class | MVP editor | params (if any) |
    |----------|-------|------------|-----------------|
    | `equity_tag` | `CategoryCompartmentFactor` | Always on (non-disableable) | — |
    | `past_participation` | `PastParticipationFactor` | Toggle | — |
    | `immediate_replay` | `ImmediateReplayFactor` | Toggle | `mode`: `EXCLUDE` \| `MALUS` |
    | `role_request` | `RoleRequestFactor` | Toggle | — (constants in code until **19.16** param wiring) |

    Factors **19.11–19.14** documented as **reserved / not in MVP editor** (“coming soon”). [Source: PLAN.md Wave D sprint § factors exposed]

### Cross-links & index

11. **Given** doc set complete, **when** validated, **then**:
    - [`draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) § Scope table links Wave D to new spec (replace “19.15+” placeholder).
    - [`docs/v2/README.md`](../../docs/v2/README.md) technical index links new spec (if index exists — waivable if no technical index section).
    - [`docs/adr/README.md`](../../docs/adr/README.md) ADR 0019 blurb mentions Wave D normative spec.
    - [`docs/v2/product/draw-chances-explained.md`](../../docs/v2/product/draw-chances-explained.md) § out-of-scope updated to mention formulas/policies **coming** via Wave D (no promise of dates).

12. **Couverture :** FR19, FR20, FR24 (extension). **Priorité :** P2. **Depends :** **19.1** (done), **19.5** (done), **17.7** (done). **UI : N/A** — documentation only; **no** `apps/web/`, **no** `services/api/` code, **no** Flyway in this story.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — no changes under `apps/web/` ; Material 3 section omitted intentionally.

---

## Tasks / Subtasks

**Scope:** documentation only — `docs/v2/technical/`, `docs/adr/`, `SPEC.md`, `DOMAIN.md`, optional `docs/v2/product/` one-liner. **No** Kotlin/Angular/Flyway.

### 0. PO gate — lock remaining OQ in spec (AC 3, 7)

- [x] **OQ-19-05** — document season policy editor = **`TROUPE_ADMIN` only** (not `SeasonOrganizer`); season organizers consume effective policy + choose at draw only. (AC 7)
- [x] **Confirm** OQ-19-01→04 text matches [`PLAN.md`](../../PLAN.md) § Epic 19 Wave D decisions table. (AC 3, implicit AC 2)

### 1. Create normative Wave D spec (AC 1–3, 7–10)

- [x] **Create** [`docs/v2/technical/draw-formulas-policies-spec.md`](../../docs/v2/technical/draw-formulas-policies-spec.md) with sections:
  - [x] Purpose & authority (supplements V1 spec + ADR 0019; does not replace factor math in `draw-weight-engine-v1-spec.md`)
  - [x] Entities: `DrawFormula`, `DrawPolicy`, rule modes, JSON shapes (informative examples — OpenAPI deferred to **19.17** / **19.18**)
  - [x] Resolution algorithm (pseudocode): season → troupe → implicit default; category match; operator choice gates
  - [x] Implicit troupe default (**OQ-19-02**)
  - [x] Authorization table (AC 7)
  - [x] Validation matrix (AC 1)
  - [x] Factor catalogue MVP (AC 10)
  - [x] Versioning & snapshot handoff to **19.22** (AC 9)
  - [x] Worked examples A–D (AC 8)
  - [x] Explicit non-goals: no expression language, no per-event policy row, no UI spec (**19.19–19.21**)
- [x] **Gate:** PO review of spec draft before merge (this story **is** the spec — treat as approval artifact)

### 2. Amend ADR 0019 (AC 6)

- [x] **Update** [`docs/adr/0019-draw-weight-engine.md`](../../docs/adr/0019-draw-weight-engine.md):
  - [x] Replace §6 “Wave D sketch (non-normative)” with normative summary + link to `draw-formulas-policies-spec.md`
  - [x] Add decision bullets: catalogue, policy scopes, resolution via `event.category`, MVP implicit default, snapshot **19.22**
  - [x] Keep §2 invariant and §3 DEFAULT pipeline facts accurate
- [x] **Update** [`docs/adr/README.md`](../../docs/adr/README.md) one-line description if needed

### 3. Amend SPEC.md & DOMAIN.md (AC 4–5)

- [x] **SPEC.md** — add Wave D subsection under V2 composition/draw (≈ after existing 19.9/19.10 bullets): formulas, policies, resolution summary, links; policy vs factor separation for **19.11** example
- [x] **DOMAIN.md** — add § **Draw formulas & policies (Wave D)** with domain language; link technical spec

### 4. Cross-links & product doc touch (AC 11)

- [x] **`draw-weight-engine-v1-spec.md`** — Scope table: Wave D → link new spec
- [x] **`draw-chances-explained.md`** — one paragraph: customizable formulas / policies planned (Wave D), not yet in prod UI until **19.19+**
- [x] **`docs/v2/README.md`** — link if technical doc list exists

### 5. Validation (AC 12)

- [x] **Checklist** — all AC 1–12 traceable to a doc section
- [x] **No code diff** in `services/api/`, `apps/web/`, `legacy/`
- [x] ** `./gradlew test`** unchanged (sanity — no API changes expected)

### Review Findings

#### Decision needed

- [x] [Review][Decision] **System V1 dans l'implicit default quand un catalogue équivalent existe** — **Résolu : A** — toujours inclure system V1 dans `allowedFormulaIds` même si une formule PUBLISHED équivalente existe (pas de dédup ; pas jugé trompeur PO).
- [x] [Review][Decision] **Clé de matching catégorie pour les déplacements legacy** — **Résolu : A** — `event.category` seul ; migration crée le slug déplacements en base (pas d'exception `templateType`). Documenter l'invariant post-migration.
- [x] [Review][Decision] **Fusion politique saison vs troupe** — **Résolu : A** — policy troupe = défaut pour toutes les saisons ; chaque saison peut adopter **sa propre policy complète** qui **remplace** celle de la troupe pour cette saison (pas merge par catégorie).
- [x] [Review][Decision] **Formule ARCHIVED / indisponible après policy save — runtime draw** — **Résolu (PO)** — pas de reject draw : **fallback** vers une autre formule active ; invariant **≥1 formule active** par troupe ; formule effective **visible dans l'UI compo** au tirage ; **traçabilité** formule + contexte policy sur la composition + **journal** (snapshots **19.22** + audit). Détail fallback chain → patch spec + stories **19.17–19.18**.
- [x] [Review][Decision] **Formule effective avant tirage (OQ-19-04 / CHOICE ≥2)** — **Résolu (PO)** — toujours une **formule active par défaut** (résolution policy), **affichée clairement** dans l'UI Équipe ; l'orga peut **changer la formule avant le tirage** ; la formule sélectionnée pilote les **% Dispos / breakdown** (pas de masquage). Choix UI ≠ politique persistée par événement (OQ-19-02 inchangé).

#### Patch

- [x] [Review][Patch] **Compléter validation matrix (CHOICE / DRAFT / foreign / liste vide)** [`docs/v2/technical/draw-formulas-policies-spec.md:204-214`]
- [x] [Review][Patch] **Rejeter doublons dans `categoryRules[]` à policy save** [`docs/v2/technical/draw-formulas-policies-spec.md:116`]
- [x] [Review][Patch] **Rejeter `equity_tag` absent ou `enabled: false`** [`docs/v2/technical/draw-formulas-policies-spec.md:223`]
- [x] [Review][Patch] **Rejeter publish si `factorConfig` vide ou tous `enabled: false`** [`docs/v2/technical/draw-formulas-policies-spec.md:47-51`]
- [x] [Review][Patch] **Promouvoir status rules de « informative » à normatif** [`docs/v2/technical/draw-formulas-policies-spec.md:53-57`]
- [x] [Review][Patch] **Remplacer « Reject (recommendation) » par « Reject » pour facteur enabled non implémenté** [`docs/v2/technical/draw-formulas-policies-spec.md:213`]
- [x] [Review][Patch] **Aligner DOMAIN.md : system V1 toujours dans implicit default (decision 1A) ; retirer « until equivalent » ambigu** [`DOMAIN.md:167`]
- [x] [Review][Patch] **ADR §3 : noter prod DEFAULT inchangée jusqu'à 19.18 + lien system V1** [`docs/adr/0019-draw-weight-engine.md:12`]
- [x] [Review][Patch] **ADR §6 validation : distinguer save vs publish (aligner spec)** [`docs/adr/0019-draw-weight-engine.md:24`]
- [x] [Review][Patch] **Ex. A : system V1 toujours listé (1A) ; retirer note dédup 19.16** [`docs/v2/technical/draw-formulas-policies-spec.md:253-262`]
- [x] [Review][Patch] **Documenter branches implicit default (0 et 1 formule PUBLISHED)** [`docs/v2/technical/draw-formulas-policies-spec.md:145-157`]
- [x] [Review][Patch] **Rejeter `allowedFormulaIds` avec UUID dupliqués à policy save** [`docs/v2/technical/draw-formulas-policies-spec.md:79`]
- [x] [Review][Patch] **SPEC.md : ajouter sous-section `### Wave D` dédiée (AC4)** [`SPEC.md:~262`]
- [x] [Review][Patch] **DOMAIN.md : ajouter terme « effective formula » (AC1/5)** [`DOMAIN.md:164`]
- [x] [Review][Patch] **Spec : invariant ≥1 formule active ; fallback si formule référencée indisponible (decision 4 PO)** [`docs/v2/technical/draw-formulas-policies-spec.md`]
- [x] [Review][Patch] **Spec : formule effective par défaut visible UI compo ; changement orga avant tirage ; % = formule sélectionnée (decision 5 PO)** [`docs/v2/technical/draw-formulas-policies-spec.md`]
- [x] [Review][Patch] **Spec : traçabilité formule + policy sur composition + journal (decision 4 PO → 19.22 / audit)** [`docs/v2/technical/draw-formulas-policies-spec.md`]
- [x] [Review][Patch] **Spec § System V1 : retirer « until equivalent published entry » (decision 1A)** [`docs/v2/technical/draw-formulas-policies-spec.md:59`]
- [x] [Review][Patch] **Spec : note migration — déplacements portent slug glossaire en base (decision 2A)** [`docs/v2/technical/draw-formulas-policies-spec.md`]

#### Defer

- [x] [Review][Defer] **Identité UUID stable de la formule system V1** — deferred, pre-existing → **19.16** seed contract
- [x] [Review][Defer] **`formulaId` pour Simuler / preview % (19.17 AC3)** — deferred, pre-existing → stories **19.17–19.18**
- [x] [Review][Defer] **Epics 19.16 AC3 (system V1 seul) vs OQ-19-02** — deferred, pre-existing → mettre à jour epics lors du grooming Wave D
- [x] [Review][Defer] **Epics 19.18 titre « admin saison » vs OQ-19-05 TROUPE_ADMIN only** — deferred, pre-existing → epics outdated
- [x] [Review][Defer] **PLAN.md résumé résolution tronqué (sans implicit CHOICE)** — deferred, pre-existing → hors scope story 19.15
- [x] [Review][Defer] **Codes HTTP draw (403 vs 400) pour formulaId hors liste** — deferred, pre-existing → OpenAPI **19.18**
- [x] [Review][Defer] **Visibilité effective policy pour membres (Équipe tab)** — deferred, pre-existing → story **19.21**
- [x] [Review][Defer] **Défaut `immediate_replay.params.mode` si absent** — deferred, pre-existing → **19.16** param wiring

---

## Dev Notes

### Product and UX rules

- **Wave D sprint goal (PLAN.md):** Demo 1 = admin composes formulas from **already coded** factors; Demo 2 = organizer chooses among ≥2 formulas at draw. **This story gates all subsequent Wave D dev (**19.16–19.21**).**
- **Policy ≠ factor:** A season policy may **require** a “gender parity — match” formula for `category = match` while factor **19.11** remains parked. The formula entry may exist in catalogue with factor toggled off or placeholder — runtime validation in **19.16+** must define behaviour (recommend: reject publish if enabled factor unknown; allow draft with disabled reserved factors).
- **Category glossary (**17.7**):** Policy rules reference **troupe category slugs** (`SpectacleCategory` / event `category` field). `null` category = principal pool (French UI “Spectacle ordinaire”).
- **French UI terms (for downstream stories):** *Formule de tirage*, *Politique de tirage*, *Règle par défaut*, *Règle par catégorie*, *Choix au tirage*, *Formule imposée*.

### Architecture compliance

| Topic | Rule |
|-------|------|
| V1 parity | System V1 formula must mirror `DrawWeightPipelines.DEFAULT` until troupe configures otherwise |
| Invariant | `% displayed = draw weights` for **effective** formula (**OQ-19-04**) — runtime wiring **19.18**, not this story |
| Snapshots **6.14** | Store `%` only today; **19.22** extends with formula metadata |
| Golden **19.2** | DEFAULT pipeline fixtures must stay green when no custom formula selected |
| Troupe isolation | Formula ids scoped to troupe; cross-troupe reference forbidden |

### File structure requirements

| File | Action |
|------|--------|
| `docs/v2/technical/draw-formulas-policies-spec.md` | **CREATE** — Wave D normative contract |
| `docs/adr/0019-draw-weight-engine.md` | **UPDATE** — Wave D normative |
| `SPEC.md` | **UPDATE** — product-level Wave D |
| `DOMAIN.md` | **UPDATE** — domain terms |
| `docs/v2/technical/draw-weight-engine-v1-spec.md` | **UPDATE** — scope cross-link only |
| `docs/v2/product/draw-chances-explained.md` | **UPDATE** — out-of-scope note |
| `docs/adr/README.md` | **UPDATE** — optional blurb |
| `docs/v2/README.md` | **UPDATE** — optional index link |

**Do not create:** Flyway migrations, OpenAPI paths, Kotlin types, Angular routes — those belong to **19.16–19.21**.

### JSON shape reference (informative — for spec author)

```json
{
  "defaultRule": {
    "mode": "CHOICE",
    "allowedFormulaIds": ["uuid-1", "uuid-2"]
  },
  "categoryRules": [
    {
      "category": "match",
      "mode": "MANDATORY",
      "mandatoryFormulaId": "uuid-parity"
    },
    {
      "category": null,
      "mode": "CHOICE",
      "allowedFormulaIds": ["uuid-1"]
    }
  ]
}
```

```json
{
  "name": "V1 + aspirations rôle",
  "status": "PUBLISHED",
  "factorConfig": [
    { "factorId": "equity_tag", "enabled": true },
    { "factorId": "past_participation", "enabled": true },
    { "factorId": "role_request", "enabled": true }
  ]
}
```

### Explicit non-goals

- Implement persistence (**19.16**), APIs (**19.17–19.18**), UI (**19.19–19.21**), snapshot extension (**19.22**)
- Define OpenAPI paths or HTTP status codes in detail (reference shapes only; OpenAPI owned by implementation stories)
- Ship factors **19.11–19.14**
- Change `DrawWeightPipelines.DEFAULT` or golden fixtures
- UI admin policy editor (**19.20**) — phase 2 sprint; spec must not require it for MVP implicit default

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **19.1** | done | V1 spec + ADR foundation |
| **19.5–19.7** | done | Factor pipeline + breakdown |
| **19.8–19.10** | done | Factors available for catalogue |
| **17.7–17.8** | done | Category slug on events |
| **3.5** | done | Organizer permissions model |
| **19.16** | backlog | **Blocked by this story** — persistence |
| **19.17–19.21** | backlog | **Blocked by 19.16** |

### Previous story intelligence (19.10 — latest Wave C)

- **Docs-before-code pattern:** **19.10** locked metric in DOMAIN/SPEC **before** factor merge — replicate for Wave D entities in this story.
- **DEFAULT unchanged:** Optional factors off in `DrawWeightPipelines.DEFAULT` until formula wiring (**19.16**). System V1 formula must encode same factor set as DEFAULT.
- **Factor ids are stable strings** (`equity_tag`, `past_participation`, `immediate_replay`, `role_request`) — spec must use these exact ids for `factorConfig`.
- **Params example:** `ImmediateReplayFactor` takes `mode: EXCLUDE | MALUS` — document in factor catalogue table.

### Git intelligence

Recent Epic 19 commits on `origin/v2`:

- `6e2b709` — merge **19.10** (role request factor)
- `f6b9dcdb` — PLAN Wave D sprint tracking
- `1593cdea` — merge **19.9** (immediate replay)

Pattern: one story = docs + optional API; this story = **docs only** (like **19.1**, **19.4**).

### Testing requirements

- **No new tests** — documentation story.
- **Sanity:** `./gradlew test` should pass unchanged (no code touched).
- **Review:** PO + architect sign-off on `draw-formulas-policies-spec.md` replaces automated test gate.

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Completion Notes List

- Created normative Wave D spec `docs/v2/technical/draw-formulas-policies-spec.md` covering DrawFormula, DrawPolicy, resolution algorithm, implicit MVP default (OQ-19-02), authorization (OQ-19-05), validation matrix, factor catalogue, versioning/snapshots, examples A–D, and locked OQ table.
- Promoted ADR 0019 §6 from non-normative sketch to normative Wave D summary with link to new spec; updated ADR index blurb.
- Added Wave D product subsection to SPEC.md (composition/draw bullets) and domain § Draw formulas & policies to DOMAIN.md.
- Cross-linked draw-weight-engine-v1-spec scope table, draw-chances-explained out-of-scope note, docs/v2/README index.
- Sanity: `./gradlew test` in `services/api/` passed unchanged (docs-only story).

### File List

- `docs/v2/technical/draw-formulas-policies-spec.md` (CREATE)
- `docs/adr/0019-draw-weight-engine.md` (UPDATE)
- `docs/adr/README.md` (UPDATE)
- `SPEC.md` (UPDATE)
- `DOMAIN.md` (UPDATE)
- `docs/v2/technical/draw-weight-engine-v1-spec.md` (UPDATE)
- `docs/v2/product/draw-chances-explained.md` (UPDATE)
- `docs/v2/README.md` (UPDATE)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (UPDATE)

### Change Log

- 2026-06-15 : Story **19.15** created via `bmad-create-story` — Wave D normative spec gate for formulas & policies.
- 2026-06-15 : Story **19.15** implemented — normative spec + SPEC/DOMAIN/ADR amendments + cross-links (docs only).
- 2026-06-15 : Code review — 5 PO decisions recorded ; 18 doc patches applied ; status **done**.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR)
- [x] Section **Material 3** = **UI : N/A**
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants (factor pipeline, permissions)
- [x] `./gradlew test` mentionné (sanity — no API changes)
