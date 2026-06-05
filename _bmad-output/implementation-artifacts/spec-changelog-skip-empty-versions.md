---
title: 'Changelog skip empty versions'
type: 'feature'
created: '2026-06-06'
status: 'done'
route: 'one-shot'
baseline_commit: HEAD
---

# Changelog skip empty versions

## Intent

**Problem:** The « Nouveautés » dialog listed technical-only releases (empty `changes[]` in `changelog.json`) with a placeholder message, adding noise for users who expect only meaningful product updates.

**Approach:** Filter out versions with no user-facing lines at transform time, and skip PWA auto-open when the installed version has no notes (while still marking it as seen).

## Suggested Review Order

**Filtering logic**

- Single gate: drop versions whose `changes` array is empty after parse.
  [`changelog.service.ts:90`](../../apps/web/src/app/core/app/changelog.service.ts#L90)

- Pure helper to detect whether a semver entry has notes (auto-open gate).
  [`changelog.service.ts:72`](../../apps/web/src/app/core/app/changelog.service.ts#L72)

**PWA auto-open**

- Skip dialog when current version has no notes; mark seen to unblock push prompt.
  [`changelog-dialog.service.ts:48`](../../apps/web/src/app/shared/changelog/changelog-dialog.service.ts#L48)

**UI simplification**

- Template no longer renders empty-version placeholder (filtered upstream).
  [`changelog-dialog.html:33`](../../apps/web/src/app/shared/changelog/changelog-dialog/changelog-dialog.html#L33)

**Tests**

- Transform filter, version helper, auto-open skip path.
  [`changelog.service.spec.ts:56`](../../apps/web/src/app/core/app/changelog.service.spec.ts#L56)

## Review Findings

- [x] [Review][Patch] Fetch error conflated with empty changelog — fixed: `currentVersionHasUserFacingNotes` returns `null` on failure; auto-open keeps reload flag and does not mark seen. [`changelog.service.ts:58`](../../apps/web/src/app/core/app/changelog.service.ts#L58), [`changelog-dialog.service.ts:52`](../../apps/web/src/app/shared/changelog/changelog-dialog.service.ts#L52)
- [x] [Review][Patch] No test for fetch-failure path in auto-open — fixed: test `does not mark version seen when changelog fetch fails`. [`changelog-dialog.service.spec.ts`](../../apps/web/src/app/shared/changelog/changelog-dialog.service.spec.ts)
- [x] [Review][Defer] Duplicate `/changelog.json` fetch on auto-open success path — `currentVersionHasUserFacingNotes` fetches once, then `loadChangelog` fetches again when the dialog opens; acceptable for now, optimize later if needed. [`changelog.service.ts:50`](../../apps/web/src/app/core/app/changelog.service.ts#L50) — deferred, pre-existing pattern extended by this change

## Completion

- **2026-06-06:** Shipped. Manual recette OK. Code review patches applied (fetch-failure tri-state, tests).
