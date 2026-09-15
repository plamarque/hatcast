# Epic 19 Context: Moteur de tirage pondéré (parité V1, facteurs, formules & politiques)

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Lock V1-parity weighted draw (already delivered by Epic 6), prove it with golden tests, refactor weights into a pluggable factor pipeline, then let troupe/season admins compose named formulas and policies (mandatory vs organizer choice, including per spectacle category). Organizers apply the resolved rule at draw time without breaking the existing draw flow. Displayed odds must always use the same pipeline as the server draw. Wave A–B is P1 hardening; Wave C–D is product-gated growth (not V2.0.0 MEP). Completes Epic 6 delivery; does not replace 6.4 / 6.14.

## Stories

- Story 19.1: Spec V1 + ADR 0019
- Story 19.2: Golden V1 JS ↔ Kotlin
- Story 19.3: Orchestration fixtures
- Story 19.4: Odds documentation (orga/membre)
- Story 19.5: DrawWeightFactor pipeline
- Story 19.6: PastParticipationFactor (= V1)
- Story 19.7: Factor breakdown explainability
- Story 19.8: History partitioned by category
- Story 19.9: Immediate replay factor
- Story 19.10: Unfulfilled role-request bonus
- Story 19.11: Gender parity factor
- Story 19.12: Team-mix factor
- Story 19.13: Prestige history factor
- Story 19.14: Volunteer bonus/malus
- Story 19.15: Formulas & policies spec
- Story 19.16: Persist formulas + system V1
- Story 19.17: Admin CRUD formulas API
- Story 19.18: Admin troupe/season policy API
- Story 19.19: Superseded — use 19.19a–c
- Story 19.19a: Factor params catalogue spec
- Story 19.19b: Parameterized factors + golden
- Story 19.19c: Admin formula editor UI
- Story 19.20: Admin draw-policy UI
- Story 19.21: Organizer formula overflow (Équipe)
- Story 19.22: Formula snapshot on draw

## Requirements & Constraints

- Organizers see eligible available candidates per role and run a weighted random draw (eligibility + troupe/event rules). Members and organizers see per-role odds and factor breakdown only on the allowed surfaces: Dispos on published events regardless of composition draft; Équipe odds for members only after publish or validate; organizers see Équipe odds in draft. Draft events, archived events, and non-draw roles show no odds.
- Displayed % must equal the server draw pipeline (invariant “% = tirage”).
- V1 baseline (do not invent): `malus = 1/(1+pastSelectionCount)`, `weight = malus × requiredCountForRole`, cumulative random walk; displayed % from exact multi-place probability (documented ±1 point tolerance vs V1). History counts validated, non-archived, non-declined, same season, same role key. Intra-role without replacement; cross-role exclusion; full vs partial redraw semantics unchanged from 6.4.
- Default pipeline must stay V1: only past-participation malus active unless a formula enables more factors. New factors off → golden suite unchanged.
- Wave D: multiple named formulas per troupe (catalogued factors + params, no free-form scripts). Policies: troupe or season; default rule + per-category rules (`MANDATORY` one formula or `CHOICE` ≥1). Season overrides troupe. Resolve from `event.category` (glossary); unknown category → default; no policy → system V1 formula. No persisted per-event policy in MVP.
- Draw API: mandatory or single-choice applies server-side; CHOICE ≥2 requires a valid `formulaId` in the allowed list. Troupe admin owns formulas + troupe policy; season admin owns season policy; organizer chooses formula only when CHOICE ≥2.
- Explainability APIs must not leak breakdown without the same gates as composition/odds (403 or omit fields). Golden tests and CI on weight/draw code; no formula change without ADR + regression.
- Out of scope: `legacy/` edits; draw animation (Epic 6); custom formula language.

## Technical Decisions

- Pipeline: `finalWeight = base × Π factorMultiplier` (or documented log-sum); one code path for draw and candidate scoring. Factors read formula `params`; invalid params rejected with French validation codes. Equity/category partition stays payload-on even when hidden in admin UI.
- Persistence: formula catalog + policies (`default_rule` + `category_rules` JSON); seed system V1. Soft-archive or 409 when a formula is still referenced by an active policy.
- Effective-rule GET for an event; draw POST validates `formulaId` against that rule. Snapshots store formula id/version, policy scope/mode, event category, whether the organizer chose, plus existing chance %.
- Golden fixtures compare V1 JS replay vs Kotlin; seeded Random for deterministic draws. Category partition (ex-17.9) is a pipeline factor, not a SQL rewrite without green goldens.
- 19.13 consumes season prestige totals from Epic 20 (after 20.6); malus curve is calibrated in 19.13, not Epic 20.

## UX & Interaction Patterns

- Odds: tap % opens a human “chance scale” sheet (gained/lost points), not formula jargon. Same sheet from Dispos (members) and Équipe (orgas). No client-side weight math.
- Admin formulas: second troupe-settings tab (Material 3 pill tabs). Copy as named “recipe”. Direction badges + intensity sliders; reserved factors coming soon. No % preview. `equity_tag` hidden in UI, always on in payload. Donut = ON criteria with intensity > 0.
- Admin policies: default + category table (glossary autocomplete); season inherits troupe with category override. Mandatory → no formula UI on Équipe.
- Organizer Équipe: immediate draw, no modal/banner/chip. CHOICE ≥2 only: formula names in overflow `⋮` with check; change refreshes % without persisting policy. Draw animation / reduced-motion unchanged.

## Cross-Story Dependencies

- Epic 6.4 / 6.14 done; 19.1–19.3 before 19.5; 19.5–19.6 before other factors and Wave D.
- 19.7 needs composition/odds gates (5.9). 19.8 after 17.7/17.9 partition. 19.10 needs 19.8 + availability role data (5.2). 19.11 needs member gender (2.12). 19.13 after 19.6 + 20.6. 19.14 after 19.6 + volunteer stats (3.6).
- Wave D: 19.15 → 19.16 → 19.17 → 19.19a → 19.19b → 19.19c; 19.18 after 19.17 + event category (17.8); 19.20 after 19.18 + 19.19c; 19.21 after 19.18 + 6.4; 19.22 after 19.21 + 6.14.
- Admin chrome 17.2 recommended for formula/policy screens. Consecutive-show warning (6.20) shares “previous event” definition with 19.9 but does not affect weights.
