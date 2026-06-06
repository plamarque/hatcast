---
title: 'Fix PostHog $pageview installation health check'
type: 'bugfix'
created: '2026-06-06'
status: 'done'
route: 'one-shot'
---

# Fix PostHog $pageview installation health check

## Intent

**Problem:** PostHog Web Analytics "Installation Health" reports `$pageview` as failed (5/6 checks pass). `$pageleave` and scroll depth already work, indicating the SDK loads correctly but pageviews are not emitted.

**Approach:** Enable SPA pageview autocapture by setting `capture_pageview: 'history_change'` in `posthog-browser.client.ts` instead of `false`. Angular routing uses the History API; this is PostHog's recommended SPA mode and satisfies the health check without manual router hooks.

## Suggested Review Order

1. [posthog-browser.client.ts](../../apps/web/src/app/core/analytics/posthog-browser.client.ts) — init options: confirm `capture_pageview: 'history_change'` and that `person_profiles: 'identified_only'` is unchanged (NFR-S2).
2. [ops-9-posthog-hatcast-app.md](ops-9-posthog-hatcast-app.md) — original story noted pageviews disabled "optional: enable later"; this change is an intentional scope extension for web analytics baseline.
3. [product-analytics.service.spec.ts](../../apps/web/src/app/core/analytics/product-analytics.service.spec.ts) — regression guard: existing FR47 tests still pass (7/7).
