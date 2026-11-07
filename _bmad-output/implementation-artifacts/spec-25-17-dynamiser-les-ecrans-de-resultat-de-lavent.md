---
title: 'Bring Advent result screens closer to the reference'
type: 'feature'
created: '2026-11-03'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
feature_branch: feat/25-17-dynamiser-les-ecrans-de-resultat-de-lavent
baseline_commit: 3c2f7a86a828a6b9dca21dca6c04b2a375164911
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The correct and incorrect Advent result screens are less expressive than the approved reference and the current answer confirmation.

**Approach:** Recompose both results as distinct festive illustrated scenes, using reference tiles 4 and 5 and the confirmation as visual guides. Make the elf and title prominent while preserving actual result data and navigation.

## Boundaries & Constraints

**Always:** The correct scene evokes the joyful raised-fist elf, green luminous background, gifts, stars and curved cream banner; the incorrect scene evokes a disappointed elf, red luminous background, shooting stars, snowy cream panel and foliage. Keep the result encouraging. Keep the API portrait in its upper-right medallion, and all existing date, points, answers, explanation and preview notices readable. Use real accessible text, including for any curved heading. Respect Advent DESIGN, EXPERIENCE and AD-7; keep styles isolated, touch targets at least 44px, motion reduction and keyboard focus. Compare real views at mobile size to the confirmed references.

**Never:** Copy reference buttons or illustrative text as new behavior; change scoring, reveal timing, privacy, navigation, answer data, or server-side seen semantics. Do not replay celebration for historic results, embed textual information or personal portraits in generic artwork, change the global HatCast theme, or operate on production data.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected behavior | Error handling |
|---|---|---|---|
| Correct or incorrect | Authorized result | Distinct reference-inspired composition, accessible heading and existing details | Preserve existing error handling |
| Historical or late result | Previously revealed or late response | Existing navigation and points, including zero for late answers; no replayed historic celebration | Preserve existing handling |
| Priority, test or private preview | Existing permitted context | Preserve reveal priority, visible notices, current actions and focus-driven seen acknowledgment | Preserve server authority and retry behavior |
| Small screen, zoom or reduced motion | Long content, 320px, enlarged text or motion preference | All content and controls remain readable and reachable; no dependence on animation | Allow vertical scrolling |

</frozen-after-approval>

## Detailed UX composition and visual acceptance

The authoritative visual references are the existing Advent board, specifically [tile 4 — correct and tile 5 — incorrect](../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/imports/advent-quiz-design-system-reference.png). Patrice supplied close-up crops of those same two tiles on 3 November. The [confirmation reference](../planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/imports/confirmation-reference.png) and the current real confirmation provide the coherence check. Reference captions and actions are illustrative; story 25.17 and the existing experience determine real content and behavior.

### Correct result — tile 4

- At first glance, the upper scene is dominated by a large, joyful elf, winking or similarly jubilant, with a raised fist. The character emerges behind the title banner, rather than appearing as a small isolated icon above a separate card.
- The backdrop is deep luminous green with golden stars, scattered gifts and festive highlights; the bottom of the scene transitions into snow and Christmas greenery.
- A broad warm cream/gold curved banner overlaps the elf's lower foreground. Its prominent green title and large gold stars on either side create the reference's celebratory focal point. Use the existing accessible result heading and preserve focus, even if its lettering follows a curve.
- Beneath the banner, a light readable content area carries the real points, false anecdote and optional explanation, then existing controls. Preserve the actual personal portrait as an upper-right medallion without hiding the elf, title or information.

### Incorrect result — tile 5

- A large front-facing elf with a visibly disappointed or concerned expression emerges behind a snowy cream foreground. The current smiling encouragement elf does not reproduce this expression; adapt or replace the decorative asset while retaining the established Advent illustration style.
- Use a strong luminous red backdrop with golden shooting stars and festive highlights. Pine foliage and red berries frame the transition to the pale snowy panel.
- The red, expressive « Bien tenté ! » heading remains real accessible text, visually integrated into the light foreground. Place the existing choice, false anecdote, score and explanation in readable light surfaces below it, followed by the existing action. Keep the personal portrait in the upper-right medallion.

### Fit, evidence and fidelity gate

- Preserve the hierarchy on phone: dominant upper illustration, overlapping title/panel, then readable result details and action. Do not squeeze real content into the reference's shorter illustrative copy; let the page scroll. Do not crop the elf's face or raised gesture, obscure the portrait or cover the button.
- Produce equivalent viewport captures of each actual result and its reference crop, plus the actual confirmation, with fictional data and fixed viewport. Inspect at 375 or 390px first, then 320 and 430px and larger widths. Compare elf scale, expression and pose; red/green background and scenery; overlap and silhouette of the cream foreground; title treatment, stars and portrait; spacing and readable content. Record concrete discrepancies, correct them, then recapture.
- A passing automated test alone does not establish visual fidelity. Present the resulting real screens side by side with both references for Patrice's human review before closing the story; report any intentional deviation and any accessibility or device check not performed. Historical, late, preview and reduced-motion variants must remain usable without changing their established behavior.

## Code Map

- `apps/web/src/app/pages/advent-test/advent-test.html`: shared `result()` view, `#resultHeading`, conditional confetti, score, answers, reminder and CTA; confirmation uses accessible SVG text paths.
- `apps/web/src/app/pages/advent-test/advent-result.scss`: result layouts, portrait, banner, cards, confetti and reduced motion; `advent-illustrated.scss` holds confirmation styling.
- `apps/web/src/app/pages/advent-test/advent-test.ts`: preserve focus and visible-result acknowledgment, historical navigation and continuation.
- `apps/web/public/advent/elf-celebration-v1.webp`, `elf-encouragement-v1.webp`: current generic art; celebration is close to the reference, encouragement currently smiles. Assess reuse or create suitable Advent-only decorative art.
- `apps/web/src/app/pages/advent-test/advent-test.spec.ts`, `apps/web/e2e/advent-answer.spec.ts`, Advent isolation and motion tests: existing behavioral and browser coverage.
- Story 25.17, Advent DESIGN and EXPERIENCE, architecture AD-7, frontend M3 checklist and visual isolation test strategy define the contracts and reference links.

## Tasks & Acceptance

**Execution:**
- [x] `advent-test.html`, `advent-result.scss`, `apps/web/public/advent/` — build both distinctive scenes; keep a focusable real heading, existing portrait, information and actions.
- [x] `advent-test.spec.ts` and appropriate Advent browser tests — verify correct/incorrect, priority, historical and late variants, focus, reduced motion and unchanged navigation; adapt image assertions if needed.
- [x] Advent UX contracts if needed — record any durable visual decision without altering behavior.
- [x] Capture real UI with fictional data at 320, 375, 390 and 430px and larger widths; compare both references and confirmation, check zoom, contrast, keyboard, touch targets and an equivalent HatCast page outside Advent; record evidence and omissions.

**Acceptance Criteria:**
- Given an authorized correct or incorrect result, when displayed, then its scene visibly follows the corresponding confirmed reference and all result data and controls remain available.
- Given historic, late, test or private-preview results, when displayed, then existing privacy, scoring, focus, animations and navigation remain intact.
- Given small screens, zoom or reduced motion, when using either result, then its content and actions remain legible and accessible without affecting HatCast outside Advent.

## Implementation Notes

- Patrice approved both result compositions and declared his human review complete. His requested refinement removes stacked gold panels while retaining the correct-answer ribbon.
- Targeted Angular: 162 passed. Isolated browser suite: 21 passed before the enlarged-text adjustment; the two affected result journeys passed afterward at normal and 200% text on 320px, with additional captures at 375, 390, 430 and 768px. Browser fixtures intercept API responses; these do not prove a real-device or production API journey.
- Inspected 200% text captures and portrait positioning. Screen-reader testing and exhaustive measured contrast were not performed. The M3 review retains Material controls and isolated Advent styling. No production deployment was performed.

## Spec Change Log

## Review Triage Log

- Medium: enlarged result layouts were not verified and the title did not scale with text preferences. Added browser checks and a narrow effective-width layout; inspected both resulting captures.
- Low: an absent portrait leaves reserved decorative space. Existing behavior remains usable and no data or action is hidden.
- Rejected: concerns about removing gold result panels conflict with Patrice’s explicit approved visual refinement.
- Human review was declared complete by Patrice; comparison screenshots used fictional data and do not establish live API or phone behavior.

## Verification

- Run targeted Angular tests with the repository's `npm run test` conventions and targeted Advent browser coverage; report selection, counts and limitations.
- Compare captures with reference tiles 4 and 5 and the current confirmation using fictional data. Check keyboard, focus, contrasts, motion reduction, responsive layout and M3 checklist; report any unverified items.
- Run `git diff --check`; provide a full-stack offline human smoke from the story worktree according to DEVELOPMENT.md.
