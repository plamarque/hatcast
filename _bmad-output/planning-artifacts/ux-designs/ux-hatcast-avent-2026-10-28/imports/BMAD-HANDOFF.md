# Advent Quiz — BMAD design handoff
Status: visual direction approved without reservation, 2026-10-30.
Repository: plamarque/hatcast
Visual references: advent-quiz-design-system-reference.png, confirmation-reference.png

## Objective
Capture the approved festive Advent Quiz art direction as a reusable, testable design system;
apply it consistently to upcoming releases; revisit iteration 25.1 to align its UI.
Do NOT restyle the main HatCast application.

## Approved visual direction
Warm cream (#FFF6E4), Christmas red (#B52235), evergreen (#075441), gold (#DEA537).
These hex codes are provisional approximations, not extracted design tokens.
Playful rounded headline (e.g. Fredoka), readable sans-serif body (e.g. Nunito).
Cheerful expressive elf, presents, holly, snow, stars, golden glows.
Big, legible, joyful headlines; rich warm illustrations; strong contrast. No pale answer text.
Images are **art-direction references**, not pixel-perfect implementation specs or text assets.

## Responsive UI targets (CSS px)
Hero headline 36–44 (fluid mobile adjustments), screen title 28–32,
question 24–28, choice label 18–20, supporting text 18–22,
utility labels 14–16; touch targets >=44 x 44 and preferably >=48 high;
primary CTA 56–64 high; mobile horizontal margins 20–24.
Use actual text nodes for all labels, buttons, questions and quiz results.
WCAG AA: text contrast >=4.5:1 generally; >=3:1 for qualifying large text;
keyboard focus visible; prefers-reduced-motion honoured; semantic radio group.
Test at 320/375/390/430 CSS px and tablet/desktop.

## Screen inventory / variants
1. Welcome/home; 2. Daily question (unselected, selected, invalid and disabled states);
3. Recorded-answer confirmation (keep suspense until reveal);
4. Correct-answer reveal; 5. Incorrect-answer reveal;
6. Daily result with explanation; 7. Calendar/progress;
8. 24 December completion; 9. Not-yet-available/countdown;
10. Network/problem/retry.
IMPORTANT: only implement routes/states that match the ACTUAL functional specification.
Do not inadvertently reveal correctness immediately after answer submission.
Copy and exact business flow should come from existing SPEC/domain/application.
The board is visual exploration, not evidence that all ten screens already exist.

## Non-negotiable isolation from HatCast design system
- Advent design must use a dedicated, explicit component namespace/entrypoint
  (e.g. AdventQuiz* or Advent* components), scoped style root
  (.advent-quiz or [data-theme="advent-quiz"]), and dedicated tokens.
- Scope resets, typography, colors, buttons, radio, card, decorations and animations.
  Do not edit base body, h1, button, input, :root or app-wide Tailwind defaults
  to install the new Advent visual theme.
- Avoid broad selectors and global CSS imports that affect HatCast pages.
  Font loading is permitted but apply font-family ONLY inside the Advent root.
- Preserve existing HatCast tokens/components/appearance; no accidental inheritance
  or collisions. Prefer CSS variables scoped to Advent root; use CSS modules or
  locally scoped styles where existing framework supports them.
- Tests: visual regression for at least one existing HatCast screen,
  before/after Advent; no changed computed styles on unrelated app pages.

## BMAD workflow request
Run the repository's actually installed `bmad-help` entrypoint to identify the appropriate
workflows (do not assume version or command syntax); inspect AGENTS.md, SPEC.md,
DOMAIN.md, ARCH.md, PLAN.md, ADRs and current working branch first.
1. Analysis: inventory Advent screens, current 25.1 scope, existing styling boundaries
   and gaps to approved board.
2. Documentation: record desired UI behavior/design requirements in the appropriate
   specification; add architecture/style-isolation decision as ADR if needed;
   plan tasks and sequencing in PLAN.md, respecting AGENTS.md's separation rules.
3. Delivery: a foundational Advent theme/tokens/components story; one story per
   actual screen/state; dedicated 25.1 visual-alignment pass; visual/regression tests.
4. Validation: compare mobile screenshots with both reference images;
   verify contrast, responsive content, semantics, and HatCast non-regression.
5. Present proposed workflow, epics/stories, acceptance criteria and file changes
   for review before broad UI refactoring.

## Acceptance criteria
- All real Advent screens share consistent colors, headings, cards, illustrations,
  buttons and control states; selected/unselected options remain legible.
- Answer-confirmation screen reproduces the APPROVED visual intent (not image-as-UI).
- Correctness timing and result visibility unchanged unless explicitly specified.
- Mobile experience readable without horizontal scroll.
- Styles never bleed into unrelated HatCast screens.
- 25.1 is separately inventoried and updated without unrelated behavior changes.
- Unit/component, accessibility and E2E/visual regression tests cover key states.
