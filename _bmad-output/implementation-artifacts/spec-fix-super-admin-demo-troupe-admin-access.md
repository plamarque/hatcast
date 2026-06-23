---
title: 'Fix super-admin admin access on Demo troupe after self-join'
type: 'bugfix'
created: '2026-06-23'
status: 'done'
route: 'plan-code-review'
baseline_commit: 'f9aaa0b7d987f219dcecbd7bd8cf4f377c6f020f'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/spec-fix-super-admin-season-participant-access.md'
  - '{project-root}/_bmad-output/implementation-artifacts/18-3-seed-production-troupe-demo.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Platform super-admins who self-joined the Demo troupe (`slug=demo`) before the admin bootstrap remained `MEMBER` in `troupe_memberships`. The Demo bootstrap only `INSERT`s when no row exists (story 18.3 AC7), so promotion never ran. UI showed no event admin actions; composition mutations could 403 because `canManageComposition` checked DB role only, not platform-admin bypass already used elsewhere.

**Approach:** Align Demo bootstrap with the existing Improbots operator pattern (`UPDATE` MEMBER → `TROUPE_ADMIN` + season organizers). Fix API `canManageComposition` to honor `troupeAccess.isTroupeAdmin` (includes platform admin). Add `platformAdmin` UI fallback on event-detail and season-home (parity with `admin-participants` / `admin-membres`).

## Boundaries & Constraints

**Always:** Self-join on Demo still creates `MEMBER` only (FR61). Platform admin bypass remains email allowlist (`HATCAST_SUPER_ADMIN_EMAILS`). Bootstrap promotion limited to configured operator emails (`patrice.lamarque@gmail.com`, `impropick@gmail.com`). Idempotent Flyway repeatable.

**Ask First:** Expanding promoted operator email list beyond the two AC7 accounts. Changing Demo pedagogical event seed data (Cabaret août preparing state).

**Never:** Grant troupe-admin via self-join. Count Demo memberships in pilot KPIs (FR47). Broad refactor of permission model beyond this gap.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Self-join then bootstrap | User in allowlist, existing `MEMBER` on Demo | Repeatable migration promotes to `TROUPE_ADMIN`, season participant + season organizer ensured | No-op if user row absent |
| Platform admin, MEMBER on Demo | `platformAdmin=true`, no `TROUPE_ADMIN` in DB | `POST …/open-availability` succeeds; UI shows Modify / composition tools | 403 only for non-admin |
| Simple Demo member | Not platform admin, not promoted | No event admin menu; composition read-only per existing rules | Unchanged |
| Fresh operator, no membership | Allowlist email, never joined Demo | `INSERT` creates `TROUPE_ADMIN` membership (existing path) | Unchanged |

</frozen-after-approval>

## Code Map

- `services/api/src/main/resources/db/migration/R__bootstrap_demo_admin_memberships.sql` — repeatable promotion UPDATE + season_organizers (primary runtime fix)
- `services/api/src/main/resources/db/migration/V37__bootstrap_demo_admin_memberships.sql` — same UPDATE for fresh installs
- `services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt` — `canManageComposition` uses `troupeAccess.isTroupeAdmin` first
- `apps/web/src/app/core/permissions/organizer-permissions.ts` — shared helpers with `platformAdmin` option
- `apps/web/src/app/pages/event-detail/event-detail.ts` — `platformAdmin` signal + computed guards
- `apps/web/src/app/pages/season-home/season-home.ts` — same fallback pattern
- `services/api/src/test/kotlin/com/hatcast/api/troupe/PlatformAdminDemoCompositionIntegrationTest.kt` — platform admin + Demo MEMBER can open availability
- `apps/web/src/app/core/permissions/organizer-permissions.spec.ts` — unit tests for platformAdmin helpers

## Tasks & Acceptance

**Execution:**
- [x] `R__bootstrap_demo_admin_memberships.sql` — add UPDATE MEMBER→TROUPE_ADMIN + season_organizers — parité Improbots dev bootstrap
- [x] `V37__bootstrap_demo_admin_memberships.sql` — mirror UPDATE for one-shot migration consistency
- [x] `OrganizerAccessService.kt` — platform-admin path in `canManageComposition`
- [x] `organizer-permissions.ts` — `canManageEvents` / `canManageComposition` with `platformAdmin` option
- [x] `event-detail.ts` + `season-home.ts` — wire `platformAdmin` from session into permission computeds
- [x] `PlatformAdminDemoCompositionIntegrationTest.kt` + `organizer-permissions.spec.ts` — regression coverage

**Acceptance Criteria:**
- Given an allowlisted super-admin with an existing Demo `MEMBER` membership, when Flyway runs the repeatable bootstrap, then `baseline_role` is `TROUPE_ADMIN` and a season organizer row exists for the active Demo season.
- Given a platform admin with Demo `MEMBER` membership only, when opening availability on a preparing Demo event (`demo-cabaret-juin`), then the API returns 200 and sets `availabilityOpenedAt`.
- Given a platform admin session on event-detail or season-home, when permissions API returns member-level flags, then Modify / Nouveau spectacle / composition admin UI remains visible (fallback).
- Given a non-admin Demo member, when viewing the same pages, then admin actions remain hidden (no regression).

## Spec Change Log

- **Review loop 1 (patch):** `loadDisposSummary` guarded on `!perms` before `canManageCompositionForEvent`, blocking relance dispos when platform admin had null permissions payload. Removed redundant `!perms` guard; KEEP platformAdmin option on composition helper.

## Design Notes

Reference implementation: `services/api/src/main/resources/db/seed/R__bootstrap_improbots_dev_operator_memberships.sql` lines 40–49 (UPDATE promotion) and 106–120 (season_organizers).

Cabaret août (`demo-cabaret-aout`) intentionally has no composition rows (preparing pedagogical state per V36). Agenda vs Équipe mismatch for that event is out of scope unless a separate data bug is filed.

## Verification

**Commands:**
- `cd services/api && ./gradlew test --tests "com.hatcast.api.troupe.PlatformAdminDemoCompositionIntegrationTest" --tests "com.hatcast.api.troupe.PlatformAdminTroupeNavigationIntegrationTest"` — expected: all pass
- `cd apps/web && npx vitest run src/app/core/permissions/organizer-permissions.spec.ts` — expected: pass

**Manual checks:**
- Restart `./scripts/start-dev.sh`; open Demo season as `patrice.lamarque@gmail.com`; confirm gear menu **Modifier** on a spectacle and Équipe composition actions on preparing events.

### Review Findings

- [x] [Review][Defer] Branche Git hors convention — travail non commité sur `v2` au lieu de `feat/spec-fix-super-admin-demo-troupe-admin-access` ; créer la branche story avant commit (`./scripts/v2/story-branch.sh start spec-fix-super-admin-demo-troupe-admin-access`).
- [x] [Review][Defer] Fichiers hors scope dans le même working tree — `deferred-work.md` et `spec-fix-breakdown-no-equity-tag-line.md` à exclure du commit de cette story.
- [x] [Review][Defer] AC4 sans test négatif dédié — pas de test d'intégration « Demo MEMBER non admin → open-availability 403 » ; régression couverte implicitement par chemins API/UI inchangés pour les membres simples.

## Suggested Review Order

**Bootstrap promotion (root fix)**

- Repeatable migration promotes self-joined MEMBER to TROUPE_ADMIN for allowlisted operators
  [`R__bootstrap_demo_admin_memberships.sql:41`](../../services/api/src/main/resources/db/migration/R__bootstrap_demo_admin_memberships.sql#L41)

- One-shot migration mirror for fresh installs
  [`V37__bootstrap_demo_admin_memberships.sql:40`](../../services/api/src/main/resources/db/migration/V37__bootstrap_demo_admin_memberships.sql#L40)

- Season organizer rows for notification cascade on Demo
  [`R__bootstrap_demo_admin_memberships.sql:79`](../../services/api/src/main/resources/db/migration/R__bootstrap_demo_admin_memberships.sql#L79)

**API permission bypass**

- Platform admin now honored in composition mutations (parity with mySeasonPermissions)
  [`OrganizerAccessService.kt:341`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt#L341)

**Front permission helpers**

- Shared helpers accept `platformAdmin` session flag
  [`organizer-permissions.ts:3`](../../apps/web/src/app/core/permissions/organizer-permissions.ts#L3)

**UI wiring**

- Event detail admin menu + composition guards use session fallback
  [`event-detail.ts:173`](../../apps/web/src/app/pages/event-detail/event-detail.ts#L173)

- Season workspace admin menu uses same pattern
  [`season-home.ts:340`](../../apps/web/src/app/pages/season-home/season-home.ts#L340)

**Tests & config**

- Integration: platform admin + Demo MEMBER can open availability
  [`PlatformAdminDemoCompositionIntegrationTest.kt:38`](../../services/api/src/test/kotlin/com/hatcast/api/troupe/PlatformAdminDemoCompositionIntegrationTest.kt#L38)

- Unit: platformAdmin helpers
  [`organizer-permissions.spec.ts:1`](../../apps/web/src/app/core/permissions/organizer-permissions.spec.ts#L1)

- Test profile super-admin email for new integration test
  [`application-test.yml:44`](../../services/api/src/test/resources/application-test.yml#L44)
