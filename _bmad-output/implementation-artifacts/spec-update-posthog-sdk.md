---
title: 'Update PostHog browser SDK'
type: 'chore'
created: '2026-10-16'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** HatCast V2 declares `posthog-js` `^1.379.2`, while the latest published SDK is `1.438.12`; PostHog reports the integration as outdated.

**Approach:** Update the monorepo dependency declaration and lockfile to the current stable `posthog-js` release, retaining the existing analytics façade and verifying the V2 production build and analytics unit tests.

</frozen-after-approval>

## Implementation Notes

- Updated `apps/web` from `posthog-js` `^1.379.2` to `^1.438.12`; the shared lockfile now resolves the compatible V1 and V2 workspace ranges to `1.438.12`.
- Retained the existing browser façade and initialization options because the current SDK type-checks and the integration APIs remain unchanged.
- `npm run build -w @hatcast/web` passed. The targeted `ProductAnalyticsService` suite passed all 18 tests when the Node test runner was given a local-storage file. The complete V2 unit suite has unrelated existing failures in storage-dependent and troupe-context tests.
- Reproducible targeted check: `NODE_OPTIONS=--localstorage-file=/private/tmp/hatcast-posthog-test-localstorage npx ng test --include='src/app/core/analytics/product-analytics.service.spec.ts'` from `apps/web`.
- `npm run build -w hatcast-legacy` passed, and `npm ls posthog-js --all` confirms `1.438.12` is deduplicated for both workspaces.

## Review Triage Log

- false — `.claude/` is untracked local content that was not part of this change and is excluded from the commit.
- false — the untracked `.posthog-wizard` marker is likewise not included or modified.
- false — adopting the untracked local skill is out of scope; no repository asset was introduced.
- low, rejected — recording an ignore rule for unrelated local-agent files would broaden this dependency update without changing application behavior.
- false — no third-party operational instructions are added to the dependency patch.
- false — no setup report is introduced or made authoritative by this change.
- false — a replayable targeted-test command, including the required local-storage setup, is recorded above.
- false — V2 build and the targeted 18-test analytics suite were executed after the actual dependency installation.
- low, rejected — adding a dedicated runtime test for the dynamic SDK import is not necessary for this mechanical update: the current build resolves the production lazy import and the existing façade API type-checks unchanged.
- false — the shared lockfile impact was verified by a successful V1 build and `npm ls`; both V1 and V2 resolve `posthog-js@1.438.12`.
