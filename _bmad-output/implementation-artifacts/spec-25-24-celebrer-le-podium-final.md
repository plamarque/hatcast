---
title: 'Celebrate the final Advent podium'
type: 'feature'
created: '2026-11-07'
status: 'done'
baseline_commit: '50fdaa0f1f1b18d83f9aefb0cb3ffc724cd3b589'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Christmas recap emphasizes the current player's score and does not celebrate the final top three or distinguish tied players.

**Approach:** Present the approved Christmas podium and apply the agreed multi-level tiebreak cascade consistently to the final ranking, with only the decisive reason briefly explained on the podium.

## Boundaries & Constraints

**Always:** Preserve priority reveal, membership and account exclusions, server authorization, private unrevealed results, scores, French festive tone, Santa and La Malice, navigation, test isolation, and existing Advent visual identity. Count only eligible on-time scored answers; no late answers. Do not infer participation from a zero score. Explain a tie in one short sentence naming only its decisive criterion. Keep player timestamps and answer details server-side. Before December 25 preserve current tied ranks; final ranks are unique and stable. Make anticipated test previews explicitly provisional and maintain their authorization.

**Never:** Change the point formula, unlock content, send notifications, alter global HatCast styling, expose unrevealed data, mutate game answers or deploy.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected behavior |
|----------|---------------|-------------------|
| Podium | At least one positive classified score | Show up to three eligible positive scorers, names, rank and scores; no personal score/rank emphasis; final ranking CTA and calendar remain usable |
| Empty | No positive classified score | Christmas greetings and navigation only, no podium or participation claim for a non-player |
| Tie | Equal points | Descending correct count, descending on-time answer count, longest correct streak (missed day does not break it), earliest time final total was reached, alphabetical display name, stable user ID; apply successively |
| Boundary | Tied player just outside top three | Select exactly three and explain a decisive podium tiebreak even if the opponent is fourth |
| Reveal | Unseen reveal, pending answer, excluded account or session switch | Existing priority, filtering, access and identity protections remain; no stale data |
| Fewer | One or two eligible positive scorers | Render only existing places without inventing players |
| Preview | Authorized isolated test previews future Christmas | Label provisional; obey existing clock and authorization rules |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventTestAnswers.kt` — shared `AdventRankingCalculator`, test query, ranking DTO; isolate final-ranking ordering from current tied ranking and expose only minimal reason metadata.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberGame.kt` — member ranking query, clock and `answered_at`; filter unrevealed and late answers before every derived metric. Test query uses `received_at`; test clock may differ from member clock.
- `services/api/src/test/kotlin/com/hatcast/api/advent/` — ranking calculator, member game/security and PostgreSQL tests; preserve both data paths.
- `apps/web/src/app/pages/advent-test/advent-test.ts`, `.html`, `advent-christmas.scss` — Christmas state and context-checked ranking load, previews, existing Material navigation; clear new state on all account/date/session changes.
- `apps/web/src/app/pages/advent-test/advent-test.spec.ts` and `apps/web/e2e/advent-member.spec.ts` — adapt scenarios while retaining reveal and navigation protection.
- `SPEC.md`, `DOMAIN.md`, Advent `DESIGN.md`, `EXPERIENCE.md`, architecture AD-7 and `docs/v2/technical/FRONTEND_UI.md` — reconcile only superseded Christmas/final-ranking rules and preserve visual isolation.

## Tasks & Acceptance

**Execution:**
- [x] `AdventTestAnswers.kt`, `AdventMemberGame.kt` — implement final-ranking cascade using allowed answers and minimal typed decisive-reason projection, keeping ordinary current-ranking semantics. Define deterministic attainment time for simulated out-of-order responses and test it.
- [ ] Advent API tests — cover every tiebreak level, three/four boundary, ties including duplicate names and stable ID, fewer/no players, final versus current, late/pending/excluded answers, both ranking sources and simulated clocks.
- [x] `advent-test.ts`, `.html`, `advent-christmas.scss` — implement approved responsive podium, one-line decisive reason, zero-player scene, safe preview fixtures, Material actions and navigation.
- [ ] Angular and browser tests — verify variants, long names, 320px/200% text, priority reveal, keyboard, account change, actual final-ranking CTA destination and HatCast styling isolation.
- [x] `SPEC.md`, `DOMAIN.md`, `DESIGN.md`, `EXPERIENCE.md` — update superseded behavior; retain score formula and privacy rules; record Material 3 checklist results.

**Acceptance Criteria:**
- Given Christmas after any priority reveal, when ranking loads, then the same final order appears on the podium and destination ranking, and no protected answers are disclosed.
- Given an equal score affecting a podium position, when the cascade selects an order, then a single short sentence identifies the decisive criterion without listing the rules.
- Given no eligible positive scores, when Christmas opens, then greetings and navigation appear without a podium.
- Given a current ranking before Christmas, when players tie, then existing shared-rank behavior remains unchanged.

## Implementation Notes

- Final ranking breaks score ties on the server; the current ranking keeps shared ranks before Christmas. Test-mode rankings retain their documented isolated-data exception.
- Material 3 and Advent checklist: existing Material navigation buttons and Advent-scoped styles were retained; keyboard activation, long names, 320px with 200% text and a non-Advent style probe were checked. Reduced-motion behavior uses the existing Advent rules; no new animation was added. No additional waiver was recorded. The outside-Advent visual probe covers one control, not every page.
- Patrice validated the six-criterion video on 2026-11-07. The video used the ordinary member API and fictional answers inserted into the isolated H2 database, with the local server date offset to December 25. It is not production, live-device push or day-by-day answer-entry evidence.

## Spec Change Log

## Review Triage Log

- Review corrections: preserve the participant thank-you only for positive personal scores; retain the documented test-mode ranking behavior; use equal scores in fictional previews; show the fictional ranking when leaving a fictional preview.
- Review corrections: identify the specific tiebroken place, compare names using French collation with stable ID fallback, and assert the winner for each criterion. The visual podium was adjusted to the approved 2 / 1 / 3 steps with a narrow/enlarged-text fallback.

## Verification

- Targeted Gradle Advent calculator, member, security and test integration suites passed; the latest closure invocation reported Gradle tasks up to date.
- Angular Advent component suite: 224 tests passed. Web build passed with existing Sass deprecation and component-budget warnings.
- Playwright fictional-response journeys covered 0–3 podium entries, long names, 320px and enlarged text, keyboard and navigation. Six additional local H2 scenarios exercised the ordinary member API and equal-score tiebreaks without test mode; the application clock was offset to Christmas.
- `bash scripts/v2/story-status-sync.test.sh` and `git diff --check` passed.

- Targeted Advent API ranking, member and security tests; run Gradle suite as appropriate.
- Targeted Angular Advent component suite and web build.
- Browser checks with fictional data for each podium state, responsive layout and full CTA navigation; distinguish automated checks from human acceptance.
- `git diff --check` and Material 3 / Advent checklist.
