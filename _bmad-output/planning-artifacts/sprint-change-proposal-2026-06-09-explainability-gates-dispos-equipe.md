# Sprint Change Proposal — Explainability gates: Dispos vs Équipe decouple

**Date:** 2026-06-09  
**Author:** Correct Course (BMad) — `/bmad-correct-course`  
**Approver:** Patrice (product) — **approved 2026-06-09**  
**Trigger:** Conflation of `CompositionExplainabilityAccess` and Dispos `includeChances` — members lose pool / % / breakdown on Dispos until composition is validated, while product intent is: **published spectacle → Dispos explainability always**; **draft composition → hidden on Équipe only**.  
**Change scope:** **Moderate** (normative doc amendments + one focused implementation story; no epic restructure)

---

## 1. Issue Summary

### Problem statement

A **single access gate** (`CompositionExplainabilityAccess.canShowExplainability`) currently governs:

1. Dispos `GET …/availability/summary?includeChances=true`
2. Dispos `chance-breakdown` (via same service gate)
3. Équipe composition slot `chancePercent` / breakdown
4. Front `disposExplainabilityEnabled` (`canShowCompositionExplainability`)

That gate requires **composition validated** or **organizer `canManageComposition`**, and also `CompositionVisibilityRules.canViewSlotAssignments` (validated or orga). **Members therefore cannot see Dispos pool segments, %, or breakdown** during the normal availability-collection phase on a **published event**, before any composition exists or is validated.

### Discovery context

| Evidence | Location |
|----------|----------|
| Shared gate object | `CompositionExplainabilityAccess.kt` |
| Dispos summary delegates to composition gate | `AvailabilityService.resolveExplainabilityForSummary()` |
| Breakdown endpoint same gate | `CompositionExplainabilityService` |
| Front mirrors backend | `composition-explainability.ts` → `event-detail.disposExplainabilityEnabled` |
| Test helper documents conflation | `AvailabilityControllerIntegrationTest.enableExplainabilityForChances()` sets `validatedAt` |
| Deferred follow-up named | `deferred-work.md` — « Fix `enableExplainabilityForChances` hors scope PERF-07 — autre story (19.7) » |
| UX spec assumes explainability on published Dispos poll | `ux-design-dispos-poll-2026-06-09.md` D12, story **5.8** AC-07 |
| Product doc contradicts desired Dispos timing | `19-4` table: Dispos % tied to composition validated for members |

### Desired product rules (PO)

| Surface | Audience | Gate | Content |
|---------|----------|------|---------|
| **Dispos** (sondage) | Member + orga with Dispos access | **Event published** (availability open per **3.21**); **not** gated on composition | Pool dépliable, `%`, breakdown sheet — **always** when event is published and draw-mode applies |
| **Équipe** — slot assignments | Member | **Composition published (FR22)** or **validated (FR23)**; hidden while orga-only draft | Assignee names / grid only |
| **Équipe** — odds on assigned slots | Orga | Any draft with content | `chancePercent` on filled slots |
| **Équipe** — odds on assigned slots | Member | Composition **published or validated** | `chancePercent` on filled slots (FR24 on composition view) |
| **Breakdown API** | Follows surface | Dispos path → Dispos gate; Équipe path → Équipe gate | No cross-leak |

**Invariant preserved (ADR 0019):** same calculator pipeline for draw, Dispos %, and Équipe odds — only **visibility gates** change, not the formula.

---

## 2. Impact Analysis

### Epic impact

| Epic | Impact |
|------|--------|
| **5** (Dispos) | Amend story **5.8** AC; add story **5.9** (implementation) |
| **6** (Composition) | Clarify **6.3** / **6.4** — slot visibility unchanged; Équipe explainability gate stays composition-scoped |
| **19** (Draw engine) | Amend **19.7** AC6–7 + normative spec § Explainability API; no pipeline refactor |
| **PERF-03** | Dispos tab may **stop requiring composition prefetch** solely for explainability gate (optional perf win in **5.9**) |

No new epic. **19.8–19.22** unaffected.

### Artifact conflicts

| Artifact | Conflict | Action |
|----------|----------|--------|
| **PRD FR24** | Wording ties odds to « composition view » only; silent on Dispos during availability | **Amend** — split Dispos vs Équipe |
| **PRD FR19** | Organizer-only eligibility view | **Clarify** — members see collective pool/% on Dispos (FR19 scope extension via FR24) |
| **epics.md** | Stories **5.8**, **6.4**, **19.7** AC assume single gate | **Amend** AC text |
| **ADR 0019** | Invariant §2 lists Dispos + Équipe but not dual gates | **Add** decision bullet on visibility gates |
| **draw-weight-engine-v1-spec.md** | § Explainability API: « same gates as Dispos includeChances / Équipe » | **Replace** with two-gate table |
| **ux-design-dispos-poll-2026-06-09.md** | D12 silent on gate source | **Amend** D12 — gate = published event |
| **ux-design-factor-breakdown-19-7.md** | W8/W11 assume composition-validated for member Dispos | **Amend** W8 for Dispos path |
| **draw-chances-explained.md** | « Où voir les % » table wrong for Dispos timing | **Update** visibility table |
| **19-4 doc** | Table rows 71–72 | **Update** after PO approval |
| **openapi/availability.yaml** | `includeChances` description may reference composition | **Update** param description in **5.9** |

### Technical impact

| Layer | Change |
|-------|--------|
| **API** | New `DisposExplainabilityAccess` (or equivalent) keyed on `event.isAvailabilityOpen()` + troupe membership + draw-mode event; `CompositionExplainabilityAccess` restricted to Équipe / assigned-slot context |
| **Front** | `disposExplainabilityEnabled` derived from **event published**, not composition; remove or narrow composition prefetch on Dispos tab |
| **Tests** | Replace `enableExplainabilityForChances` pattern; add member Dispos `includeChances=true` **without** validated composition; regression: member still blocked on Équipe draft slots |
| **CI** | `./gradlew test` + availability integration + composition visibility tests |

---

## 3. Recommended Approach

**Selected: Option 1 — Direct adjustment** (modify stories + one implementation story within existing epics)

| Criterion | Assessment |
|-----------|------------|
| Effort | **Medium** — ~1 story (API gate split + front signal + tests + doc sync) |
| Risk | **Low** — visibility-only; golden draw suite unchanged |
| Timeline | No epic reorder; **5.9** can start after doc approval |
| Rollback | Not needed — no shipped behaviour matches PO intent for Dispos |
| MVP | **Clarifies** MVP fairness UX; no scope cut |

**Not chosen:** Rollback **19.7** / **5.8** (would lose breakdown UI). MVP review (Option 3) — not applicable.

---

## 4. Detailed Change Proposals

### 4.1 PRD (`prd.md`)

**Section:** Functional Requirements — Composition & draw

**OLD (FR24):**
> FR24: For events using weighted draw, included participants can view **per-role selection odds** (or equivalent explainability summary) on the event composition view **after the organizer publishes the draft (FR22)** or **after validation (FR23)**. Odds are not shown for events or roles excluded from the draw model (e.g. direct-assignment slots).

**NEW (FR24):**
> FR24: For events using weighted draw, included participants can view **per-role selection odds** and **factor breakdown** (explainability) subject to surface-specific visibility:
>
> - **Dispos (availability view):** On **published events** (availability open per FR31 / story 3.21), members and organizers with Dispos access see per-role odds and breakdown for eligible candidates **regardless of composition draft state**. Odds are not shown for draft **events**, archived events, or roles excluded from the draw model.
> - **Équipe (composition view):** Members see odds on **assigned slots** only **after the organizer publishes the composition draft (FR22)** or **after validation (FR23)**. Draft slot assignments remain hidden from ordinary members per FR22 until publish. Organizers see odds on Équipe during draft composition.
>
> **Invariant:** Displayed % use the same weight pipeline as the server draw (ADR 0019).

**Rationale:** Separates availability-phase transparency (Dispos) from composition-draft confidentiality (Équipe slots).

---

### 4.2 Epics (`epics.md`)

#### Story 5.8 — amend AC-07 footnote

**OLD:** `[Source: D12 ; FR24]`

**NEW:** `[Source: D12 ; FR24 Dispos path — explainability when event published, not composition-gated]`

Add **AC-17 (new):**
> **AC-17 — Explainability sur spectacle publié** — **Given** un membre sur un spectacle **publié** (dispos ouvertes) en mode tirage, **when** il déplie le pool d’un rôle, **then** les segments `%` et le breakdown sont disponibles **sans** composition validée ni publiée. **Given** un spectacle **brouillon** (membre sans droit orga), **then** pas de sondage / pas de chances (story **3.21**).

#### Story 6.4 — amend second AC

**OLD:**
> **Given** un participant autorisé, **when** il consulte l’info de cotes **après publication du brouillon ou validation**, **then** les données affichées correspondent aux règles d’explainability (FR24).

**NEW:**
> **Given** un participant autorisé, **when** il consulte les cotes sur **Dispos**, **then** elles sont visibles sur spectacle publié (FR24 Dispos). **When** il consulte les cotes sur **Équipe** (slots assignés), **then** elles suivent publication ou validation de la composition (FR24 Équipe).

#### Story 19.7 — amend AC6–7

**OLD AC6:**
> **Given** droits explainability **6.3 / 6.4** … **when** utilisateur **sans** droit … **403** …

**NEW AC6:**
> **Given** les **deux portes** explainability (Dispos vs Équipe), **when** un utilisateur **sans** droit sur la surface appelée, **then** **403** ou absence de champs breakdown — aucune fuite.

**OLD AC7:**
> **Given** orga … brouillon … **Given** membre … composition **non validée** … pas de breakdown. **Given** membre … **validée** … breakdown autorisé.

**NEW AC7:**
> **Given** orga avec `canManageComposition`, **when** GET breakdown depuis **Équipe** ou **Dispos**, **then** accès autorisé. **Given** membre ordinaire et spectacle **publié**, **when** GET breakdown / `includeChances` depuis **Dispos**, **then** autorisé **sans** composition. **Given** membre, **when** composition **non publiée** (slots masqués FR22), **then** pas de breakdown **Équipe** ni fuite de slots via Dispos. **Given** membre, **when** composition **publiée ou validée**, **then** breakdown **Équipe** autorisé sur slots visibles.

---

### 4.3 ADR 0019 (`docs/adr/0019-draw-weight-engine.md`)

**Add to Decision (after item 2):**

> **2b. Dual explainability visibility gates (2026-06-09):** The **calculator pipeline is shared**, but **visibility is surface-specific:**
>
> - **Dispos gate** — published event (availability open); independent of `event_compositions` draft state.
> - **Composition gate** — Équipe slot assignments and slot-level odds; members after `publishedAt` or `validatedAt`; organizers with `canManageComposition` on draft.
>
> Implementations: `DisposExplainabilityAccess` + `CompositionExplainabilityAccess` (names illustrative). Amending gates requires PRD FR24 alignment, not formula changes.

---

### 4.4 Normative spec (`docs/v2/technical/draw-weight-engine-v1-spec.md`)

**Replace § Explainability API gate paragraph (line ~472):**

**OLD:**
> **403** when explainability is not allowed (same gates as Dispos `includeChances` / Équipe slot odds — stories **6.3**, **6.4**).

**NEW:**

> **403** when explainability is not allowed for the **requested surface**:
>
> | Surface | Parameter / endpoint | Member gate | Organizer gate |
> |---------|---------------------|-------------|----------------|
> | Dispos | `includeChances=true` on availability summary; breakdown from Dispos context | Published event (`availabilityOpenedAt` set, not draft/archived) + troupe membership | Same + `canManageComposition` on draft **events** per **3.21** |
> | Équipe | Composition GET slot odds; `chance-breakdown` from Équipe | Composition `publishedAt` or `validatedAt` | `canManageComposition` |
>
> **Do not** use composition slot visibility to gate Dispos `includeChances` (SCP 2026-06-09).

Update endpoint table audience row for `chance-breakdown`:
> Orga always (draft); member on **Dispos** when event published; member on **Équipe** when composition published or validated.

---

### 4.5 UX — Dispos poll (`ux-design-dispos-poll-2026-06-09.md`)

**D12 — append:**

> **Gate:** `explainabilityEnabled` when the **event is published** (availability open — **3.21**), **not** when composition is validated. Composition draft state does **not** affect Dispos pool / %.

---

### 4.6 UX — Factor breakdown (`ux-design-factor-breakdown-19-7.md`)

**W8 — amend member rule:**

> Membre : breakdown depuis **Dispos** dès spectacle publié ; depuis **Équipe** seulement après publication ou validation de la composition (slots visibles).

---

### 4.7 Product doc (`docs/v2/product/draw-chances-explained.md`)

**Replace « Où voir les % » table rows for Dispos / Équipe member** to match Section 1 table in this proposal.

---

### 4.8 New implementation story — **5.9**

See **Appendix A** (story file to create at `_bmad-output/implementation-artifacts/5-9-dispos-explainability-gate-decouple.md` upon approval).

**sprint-status.yaml** (after approval):

```yaml
  5-9-dispos-explainability-gate-decouple: backlog  # SCP 2026-06-09 — split Dispos vs Équipe gates
```

---

## 5. Implementation Handoff

### Scope classification: **Moderate**

| Role | Responsibility |
|------|----------------|
| **PO (Patrice)** | Approve this SCP; confirm FR24 wording |
| **Dev agent** | Implement story **5.9**; apply normative doc edits in same PR or preceding doc commit |
| **Paige (tech writer)** | Optional polish on `draw-chances-explained.md` after merge |

### Success criteria

1. Member on **published** future event, **no composition row**: `GET summary?includeChances=true` returns `chancePercent` on candidates.
2. Same member: `GET composition` returns **empty slots** (no draft leak).
3. Member after orga **publish** composition: Équipe slots + odds visible; Dispos unchanged.
4. Member after **unlock** (FR23): Équipe slots hidden; Dispos pool/% **still visible**.
5. Golden suite **19.2** green without fixture changes.
6. Front Dispos poll shows interactive pool segments without loading composition for gate (or composition load decoupled from explainability flag).

### Sequencing

1. Approve SCP + doc amendments (**this document**).
2. Create story file **5.9** from Appendix A.
3. Implement API gates → front signal → tests → openapi description.
4. Update **19-4** visibility table if still referenced by help dialog.

---

## Appendix A — Story 5.9 draft

**File:** `_bmad-output/implementation-artifacts/5-9-dispos-explainability-gate-decouple.md`  
**Epic:** 5  
**Status:** backlog  
**Depends:** 5.8 (done), 19.7 (done), 6.3 (done)

### Story

En tant que **membre** sur un spectacle publié,  
je veux **voir le pool, les % et le breakdown sur l’onglet Dispos** pendant la collecte des dispos,  
afin de **comprendre mes chances avant que la composition ne soit publiée**, sans voir les assignations brouillon sur Équipe.

### Acceptance Criteria

1. **Given** un spectacle **publié** (dispos ouvertes) sans ligne `event_compositions`, **when** un membre appelle `GET …/availability/summary?includeChances=true`, **then** `chancePercent` (et champs breakdown si demandés) sont renvoyés pour les candidats éligibles — **403/empty not used as substitute**.
2. **Given** le même membre, **when** `GET …/composition`, **then** slots vides / visibilité `none` (FR22 inchangé).
3. **Given** orga avec brouillon non publié, **when** Dispos `includeChances=true`, **then** autorisé ; **when** Équipe slot odds, **then** autorisé (comportement orga inchangé).
4. **Given** membre et composition **publiée** non validée, **when** Équipe, **then** slots visibles + odds sur assignés ; **when** Dispos, **then** pool/% toujours visibles.
5. **Given** membre après **déverrouillage** (FR23, slots masqués), **when** Dispos, **then** pool/% **restent** visibles.
6. **Given** spectacle **brouillon** ou archivé, **when** membre `includeChances=true`, **then** **403** ou pas de chances (parité **3.21**).
7. **Given** `CompositionExplainabilityAccess`, **when** utilisé pour Équipe / breakdown depuis contexte composition, **then** règles FR22/FR24 Équipe **inchangées** ; **when** Dispos, **then** utiliser la **nouvelle** porte événement publié uniquement.
8. **Given** `./gradlew test` + tests intégration availability/composition explainability, **when** CI, **then** green ; supprimer le pattern test `enableExplainabilityForChances` (= `validatedAt` forcé) au profit de scénarios Dispos sans composition.

### UI (Material 3)

**M3-1–M3-5:** Pas de nouveau composant — `disposExplainabilityEnabled` alimenté par **event published** ; vérifier pool dépliable + breakdown sheet sur membre sans composition chargée pour le gate.

### API / code touchpoints

| File | Action |
|------|--------|
| `DisposExplainabilityAccess.kt` | **NEW** |
| `CompositionExplainabilityAccess.kt` | **Narrow** to Équipe / composition breakdown context |
| `AvailabilityService.resolveExplainabilityForSummary` | Use Dispos gate |
| `CompositionExplainabilityService` | Route gate by caller context or split endpoints |
| `composition-explainability.ts` | Split `canShowDisposExplainability(event)` vs composition helper |
| `event-detail.ts` | Decouple `disposExplainabilityEnabled` from composition ; optional remove composition prefetch on Dispos-only explainability |
| `AvailabilityControllerIntegrationTest.kt` | New member scenarios without `validatedAt` |
| `openapi/availability.yaml` | Update `includeChances` description |

### Non-goals

- Changing draw formula, pipeline, or golden fixtures.
- Changing FR22 slot visibility rules on Équipe (publish still does not expose draft slots to members until product says otherwise — **confirm:** current code hides slots until validation; if PO wants publish → slots visible, that is a **separate** SCP).

---

## Checklist status (Correct Course)

| Section | Status |
|---------|--------|
| 1 Understand trigger | [x] Done |
| 2 Epic impact | [x] Done |
| 3 Artifact conflicts | [x] Done |
| 4 Path forward | [x] Done — Option 1 |
| 5 Proposal components | [x] Done |
| 6 Final review | [x] Done — PO approved 2026-06-09 |
| 6.4 sprint-status.yaml | [x] Done — story **5.9** `ready-for-dev` |
| 6.5 Handoff | [x] Done — Dev story **5.9** |

---

**Review:** Approved — story **5.9** created ; sprint-status updated ; normative docs amended.
