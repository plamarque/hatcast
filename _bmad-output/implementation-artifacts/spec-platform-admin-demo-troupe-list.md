---
title: 'Demo troupe in Découvrir for authenticated users'
type: 'bugfix'
created: '2026-06-03'
status: 'done'
route: 'one-shot'
---

# Demo troupe in Découvrir for authenticated users

## Intent

**Problem:** The Démo troupe (`is_demo = true`, slug `demo`) is excluded from `GET /v1/public/troupes` by design (FR32 / KPI analytics). Platform super-admins without membership could not see it in **Découvrir** on `/troupes`, even though they can administer it via direct slug navigation. **Mes troupes** must remain membership-only.

**Approach:** Add authenticated `GET /v1/troupes/discover` returning the public directory plus supplemental troupes: Démo for any signed-in non-member; all non-member troupes for platform admins. Frontend uses this endpoint when the session is active, keeping the anonymous public endpoint unchanged.

## Suggested Review Order

1. [Discover aggregation](../../services/api/src/main/kotlin/com/hatcast/api/troupe/PublicTroupeService.kt) — `listDiscoverForViewer`, shared `mapToDirectoryItems`
2. [API route](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt) — `GET /v1/troupes/discover` (session required)
3. [Integration tests](../../services/api/src/test/kotlin/com/hatcast/api/troupe/PlatformAdminTroupeNavigationIntegrationTest.kt) — demo in discover, not in mes troupes
4. [Troupes list page](../../apps/web/src/app/pages/troupes-list/troupes-list.ts) — authenticated discover vs public fallback
