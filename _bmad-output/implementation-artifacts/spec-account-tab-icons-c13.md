---
title: 'Account tab icons (C13)'
type: 'feature'
created: '2026-06-08'
status: 'done'
route: 'one-shot'
baseline_commit: '8d45541f20f8f809060a3b4e9a6f93fb45c6ce46'
context:
  - '{project-root}/_bmad-output/planning-artifacts/ux-design-mon-compte.md'
---

# Account tab icons (C13)

## Intent

**Problem:** The Mon compte tab bar showed text-only labels, making sections harder to scan and diverging from the approved UX spec (C13) and member-nav icon patterns.

**Approach:** Add inline Material icons (`person`, `tune`, `notifications`, `info`) beside each French tab label in `account-placeholder`, with responsive sizing and unit tests asserting icon order and labels.

## Suggested Review Order

**Tab markup (C13 entry point)**

- Inline icon + label wrapper on each `mat-tab-link`
  [`account-placeholder.html:43`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.html#L43)

**Layout & responsive sizing**

- Flex row for icon + label; 20 px mobile, 24 px from 481 px
  [`account-placeholder.scss:38`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.scss#L38)

**Regression guard**

- Asserts four icons, DOM order, French labels per tab
  [`account-placeholder.spec.ts:265`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts#L265)

**UX spec alignment**

- C13 marked delivered; links this spec from sign-off
  [`ux-design-mon-compte.md:91`](../../_bmad-output/planning-artifacts/ux-design-mon-compte.md#L91)
