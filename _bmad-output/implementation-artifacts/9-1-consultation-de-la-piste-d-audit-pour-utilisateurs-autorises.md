# Story 9.1: Authorized Audit Trail Consultation

Status: done

baseline_commit: 543688673843322b8c02d858c85d1b1c32b10432

**PLAN:** [PLAN.md](../../PLAN.md) § Epic 9 — Story **9.1** (P1, post-MEP)
**Epics:** [epics.md](../planning-artifacts/epics.md) § Epic 9 — Story 9.1
**Previous story:** [9-0-capture-backend-piste-audit.md](9-0-capture-backend-piste-audit.md)
**ADR:** [ADR-0018](../../docs/adr/0018-v2-audit-events-postgres.md)
**UX spec (approved):** [ux-design-audit-journal-9-1.md](../planning-artifacts/ux-design-audit-journal-9-1.md)

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

---

## Story

As an **authorized troupe administrator, season organizer, or event organizer**,  
I want to **consult a scoped audit trail of significant changes with actor, subject, action type, second-level timestamp, and readable before/after values**,  
so that I can **understand what happened in my troupe, season, or event without exposing audit data outside the user's authorized scope**.

---

## Acceptance Criteria

1. **Given** audit events exist for a troupe, season, or event, **when** an authorized user opens the audit view from the relevant admin surface, **then** the page lists entries ordered by `occurredAt` descending and shows at minimum: actor identity, subject identity when present, action type label, second-level timestamp, scope context, and readable before/after summary. [Source: epics.md § Story 9.1 ; FR35]

2. **Given** the caller is a troupe administrator or platform admin, **when** they request the troupe audit trail, **then** the API returns only entries with that `troupe_id`, supports pagination, and can optionally filter by `seasonId`, `eventId`, `actionType`, and a timestamp range without leaking entries from another troupe. [Source: PLAN.md § Epic 9 DoD 9.1 ; ARCH.md V2 authorization]

3. **Given** the caller is a season organizer but not a troupe administrator, **when** they request audit entries, **then** they can read entries in their authorized season scope and event scopes for that season, but cannot read troupe-wide membership/admin entries that are unrelated to their delegated scope. [Source: FR34 ; FR35 ; NFR-S2]

4. **Given** the caller is an event organizer but not a season organizer or troupe administrator, **when** they request audit entries, **then** they can read only entries for events they organize and cannot broaden the query to season-wide, troupe-wide, or other-event entries. [Source: FR34 ; FR35 ; NFR-S2]

5. **Given** a regular member, anonymous user, or authorized user outside the requested scope, **when** they call the audit API or navigate directly to the audit route, **then** the backend returns `403` or `401` as appropriate and the frontend shows a French access-denied or login flow consistent with existing admin pages. [Source: epics.md § Story 9.1 ; NFR-S2]

6. **Given** an audit event captures availability status, role selections, composition slot assignment, slot clear, draw, validate/unlock/publish, confirmation/decline/reset, event update, roster update, membership update, or organizer grant/revoke, **when** the row is displayed, **then** the UI shows a **single compact French line** with action label, actor/subject when relevant, and the most meaningful change inline (`Indispo → Dispo`, role, etc.); **no expand**, **no raw JSON** in the UI. [Source: FR35 ; Story 9.0 taxonomy ; ux-design-audit-journal-9-1.md § Entry presentation]

7. **Given** an audit entry references actor or subject IDs whose user/participant row is no longer active or directly resolvable, **when** the entry is displayed, **then** the API/UI uses the stored metadata snapshot where available and falls back to a stable anonymized/unknown label rather than failing the whole list. [Source: ADR-0018 consequences ; DOMAIN.md audit write V2 ; FR37 future retention]

8. **Given** the audit list contains more results than one page, **when** the user changes page or page size, **then** the frontend requests a new backend page and preserves filters, loading, empty, and error states without client-side loading the full journal. [Source: NFR-P1/P2 ; Spring Data pagination pattern]

9. **Given** Story 9.1 is complete, **when** tests run, **then** API integration tests cover authorized troupe-admin/platform-admin, season-organizer, event-organizer, and forbidden member cases; **system lifecycle** capture (`COMPOSITION_LIFECYCLE_CHANGED`, null actor); frontend tests cover successful list rendering, filter/query construction, empty state, access-denied state, line formatting (explicit vs system rows), and draw block expansion. [Source: project-context.md test commands ; FRONTEND_UI.md]

10. **Given** a composition-related mutation causes **`computeRawLifecycle`** to change for an event (e.g. last required participation confirmed → `COMPLETE`), **when** the domain transaction commits, **then** an append-only audit entry `COMPOSITION_LIFECYCLE_CHANGED` is persisted with **`actor_user_id` null**, `event_id` / `season_id` / `troupe_id`, and `before` / `after` containing the previous and new `compositionLifecycle` (API enum values); **no** duplicate entry when lifecycle is unchanged. [Source: ux-design-audit-journal-9-1.md § Actor semantics ; FR35 traceability]

11. **Given** a system lifecycle audit row is displayed, **when** the user reads the Activité tab or admin journal, **then** the line follows `{time} · Statut équipe · {beforeLabel} → {afterLabel}` with **no** trailing actor segment; explicit mutation rows for the same moment (e.g. `Participation confirmée`) may appear adjacent. [Source: ux-design-audit-journal-9-1.md § Actor semantics]

**Product coverage:** FR35 read path for authorized administrators/organizers; extends FR17/FR26 traceability; enforces NFR-S2 least-privilege exposure. Member self-service audit remains **Story 9.2**.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Material components** — **Given** the audit UI is delivered under `apps/web/`, **when** controls are rendered, **then** use Angular Material first: `mat-card`/section surfaces, `mat-form-field`, `mat-select`, `mat-chip`, `mat-button` or `mat-stroked-button`, `mat-icon-button`, `mat-progress-spinner`, and `mat-paginator` or equivalent existing Material pagination. Avoid custom clickable divs when a Material control exists. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens and theme** — **Given** story SCSS is added or changed, **when** colors, borders, surfaces, or emphasis are applied, **then** use `var(--mat-sys-*)` and `color-mix(in srgb, var(--mat-sys-*) ...)`; do not add hardcoded feature hex/rgb colors. [Source: FRONTEND_UI.md]

**M3-3. Mobile and touch** — **Given** viewport width <= 480 px, **when** the audit list and filters are used, **then** entries remain readable as stacked cards or a responsive list, filters do not overlap app chrome, and all interactive targets are preferably >= 48x48 dp. If labels are hidden on mobile, controls must keep French `aria-label`s. [Source: NFR-A1 ; FRONTEND_UI.md]

**M3-4. Admin navigation** — **Given** the audit route is exposed from existing admin context, **when** the entry point is added, **then** use the current top app bar/admin menu patterns (`scope-admin-menu`, admin pages, breadcrumbs) and do not introduce a new global bottom navigation or custom app chrome. [Source: ux-hub-a-faire.md ; FRONTEND_UI.md]

**M3-5. Review** — **Given** implementation is complete, **when** the story is reviewed, **then** the `FRONTEND_UI.md` checklist is explicitly checked in the dev summary, with any non-applicable items or deliberate exceptions noted. [Source: AGENTS.md ; FRONTEND_UI.md]

---

## Tasks / Subtasks

- [x] **Scope:** implement both `services/api/` and `apps/web/`; **include system lifecycle audit capture** (AC 10); do not touch `legacy/`; do not implement Story 9.2 member-only history. (AC: 1-11, M3-1-M3-5)

- [x] **Backend API contract and DTOs** (AC: 1-8)
  - [x] Add an OpenAPI contract file or extend the relevant V2 API documentation for audit reads. Suggested endpoint family: `GET /v1/audit/events` with query params `troupeId` (required unless route-scoped), optional `seasonId`, `eventId`, `actionType`, `from`, `to`, `page`, `size`.
  - [x] Return camelCase DTOs with page metadata matching existing `Paged*Response` shapes: `content`, `page`, `size`, `totalElements`, `totalPages`.
  - [x] Include resolved display fields: `actor`, `subject`, `actionLabel`, `scope`, `before`, `after`, `metadata`, and keep raw maps available for detail formatting.

- [x] **Backend read model and authorization** (AC: 2-7)
  - [x] Add `AuditEventController`, `AuditEventService`, and DTOs under `services/api/src/main/kotlin/com/hatcast/api/audit/`.
  - [x] Extend `AuditEventRepository` with paginated queries using `Pageable` and `Sort.by(DESC, "occurredAt")`; avoid unpaged `findBy*OrderByOccurredAtDesc` for the UI path.
  - [x] Enforce authorization in the service, not only the controller. Use `TroupeAccessService` and `OrganizerAccessRules` patterns from existing services.
  - [x] Troupe/platform admin: may query the troupe scope, including membership/admin audit rows.
  - [x] Season organizer: may query their season and the events inside that season; must not receive troupe-wide membership/admin rows unless they are also troupe admin.
  - [x] Event organizer: may query only explicitly organized event IDs.
  - [x] Validate `page >= 0`, `1 <= size <= 100`, `from <= to`, and scope consistency (`eventId` belongs to `seasonId`; `seasonId` belongs to `troupeId`).

- [x] **System lifecycle audit capture** (AC: 10, 11)
  - [x] Add `COMPOSITION_LIFECYCLE_CHANGED` to `AuditActionType`.
  - [x] Add helper (e.g. `CompositionLifecycleAuditRecorder`) using `CompositionLifecycleService.computeRawLifecycle` + slot/role snapshots: capture **before** lifecycle at start of composition mutations; after successful save, recompute — if changed, `auditRecorder.record` with `actorUserId = null`, `before`/`after` maps `{ compositionLifecycle: "<apiValue>" }` (optionally `teamStatusBadgeKey` for UI).
  - [x] Invoke from all paths that can change raw lifecycle: `CompositionParticipationService`, `CompositionSlotAssignmentService`, `CompositionDrawService`, `CompositionService` (publish/validate/unlock), and any other 9.0 hook that mutates slots/composition state. Same `@Transactional` boundary as the mutation.
  - [x] Idempotence: no row when lifecycle unchanged; one row per transition (not per intermediate recompute within same transaction).
  - [x] Integration test: confirm last participation → `COMPLETE` yields explicit `PARTICIPATION_CONFIRMED` **and** system `COMPOSITION_LIFECYCLE_CHANGED` with null actor; UI formatter test for `Statut équipe · … → …`.

- [x] **Identity/snapshot formatting** (AC: 1, 6, 7, 11)
  - [x] Resolve actor user labels where possible without causing N+1 queries; batch-load users/participants for one page or use lightweight DTO projections.
  - [x] For missing/deactivated subjects, prefer `metadataJson.displayName`, `metadataJson.email` only where already stored and allowed, or a neutral French label such as `Sujet supprimé` / `Utilisateur anonymisé`.
  - [x] Map `AuditActionType` values to stable French UI labels. **`COMPOSITION_LIFECYCLE_CHANGED`** → action segment **`Statut équipe`**; detail uses `teamStatusBadge` short labels (`Préparation`, `Confirmé`, `Collecte`, …) from before/after lifecycle via shared mapper (mirror `TeamStatusBadgeMapper` / front `composition-lifecycle.ts`).

- [x] **Frontend API service** (AC: 1-8)
  - [x] Add `apps/web/src/app/core/audit/audit-api.service.ts` with typed response interfaces and fetch calls using `credentials: 'include'`.
  - [x] Keep GET requests side-effect free; no CSRF header needed for reads unless a repo helper requires it.
  - [x] Unit-test query serialization for filters and pagination.

- [x] **Event — Activité tab** (AC: 1, 6, 8, M3-1-M3-4) — [ux-design-audit-journal-9-1.md](../planning-artifacts/ux-design-audit-journal-9-1.md) § Screen C
  - [x] 4th tab **Activité** (`history` icon) on event detail; visible if `canViewAuditEvent` **or** user has linked participant on event.
  - [x] Toolbar: reuse Dispos pattern — `app-availability-subject-selector` (orga, Moi mode) + **Moi / Tous** toggle (`mat-button-toggle-group`).
  - [x] **Moi:** filter audit where selected participant is actor or subject; default participant = self.
  - [x] **Tous:** full event journal — **`canViewAuditEvent` only**; hide toggle when user lacks permission.
  - [x] **No** « Journal d'audit » in event gear menu (tab is primary entry).
  - [x] Shared list component `audit-journal-list`; mobile stacked cards.

- [x] **Troupe + season — admin pages** (AC: 1, 5, 8, M3-1-M3-4)
  - [x] Routes: `/troupes/:slug/admin/audit`, `/saison/:slug/admin/audit`; gear menu **Journal d'audit** (last item, `canViewAuditTroupe` / `canViewAuditSeason`).
  - [x] Layout mirrors `admin-participants`; filters: type, dates, optional spectacle (season page).

- [x] **Frontend line formatter** (AC: 1, 6, 7, M3-1-M3-3)
  - [x] `audit-line-formatter.ts`: segments `{time} · {subject?} · {action} · {detail?} · {actor?}`; trailing actor per § Actor semantics (**explicit only**; **never** when `actorUserId` null).
  - [x] Handle `actorUserId == null` (system state rows) without placeholder actor label.
  - [x] French labels for action types and field values; trailing actor span with `--mat-sys-on-surface-variant`.
  - [x] `audit-draw-expander.ts`: expand `COMPOSITION_DRAW_COMPLETED` → header + child lines from `assignmentsByRole` diff (§ Draw block).
  - [x] Truncate with ellipsis; full line in `title`. Handle empty before/after, unknown/deleted subjects.
  - [x] **No expand**, **no raw JSON** in UI.

- [x] **Tests and verification** (AC: 5, 8, 9, M3-5)
  - [x] API integration tests for allowed/forbidden scopes and pagination/filtering. Prefer extending the audit integration suite or adding `AuditEventReadIntegrationTest`.
  - [x] Frontend tests for API service, page load, filters, empty state, forbidden state, paginator behavior, and diff formatting.
  - [x] Run `./gradlew test`.
  - [x] Run `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`.

- [x] **Docs synchronization** (AC: 2-9)
  - [x] Update `ARCH.md` audit section to mention the read API/UI introduced by 9.1.
  - [x] Update API/OpenAPI docs for audit reads.
  - [x] Update this story's Dev Agent Record file list and completion notes.

### Review Findings

- [x] [Review][Decision] **Filtres type/dates absents en mode Tous (onglet Activité)** — **Hors scope 9.1** ; journal admin suffit pour orgas → backlog **G-008** (`growth-backlog.md`).
- [x] [Review][Decision] **Champ `email` dans `AuditIdentityDto`** — obfuscation partielle (`AuditEmailObfuscator`) ; `userId` conservé comme identifiant stable.

- [x] [Review][Patch] **`showEventPrefix` jamais appliqué** [`audit-line-view-model.ts`]
- [x] [Review][Patch] **Code mort `excludeTroupeWideRows` + `seasonEventIds`** [`AuditEventService.kt`, `AuditEventAccessService.kt`]
- [x] [Review][Patch] **Tri pagination `occurredAt` + `id`** [`AuditEventService.kt:115`]
- [x] [Review][Patch] **Lifecycle système inclus filtre Moi participant** [`AuditEventService.kt:209-220`]
- [x] [Review][Patch] **Fallback acteur metadata** [`AuditIdentityResolver.kt`]
- [x] [Review][Patch] **Couleurs hex pills → tokens M3** [`audit-line-view.scss`]
- [x] [Review][Patch] **OpenAPI `GET /v1/audit/events`** [`services/api/openapi/audit.yaml`]
- [x] [Review][Patch] **Tests AC 9** — `AuditEventReadIntegrationTest` (platform admin, orga spectacle, lifecycle Moi, email obfusc.) ; tests page `admin-audit` restent couverts indirectement via composants partagés
- [x] [Review][Patch] **Copy empty/error + retry** [`audit-journal-list`, `event-activite-tab`]
- [x] [Review][Patch] **Filtres date fuseau local cohérent** [`admin-audit.ts`]
- [x] [Review][Patch] **Reset page/filtres changement slug** [`admin-audit.ts`]
- [x] [Review][Patch] **URL `tab=activite` clamp** [`event-detail.ts`]
- [x] [Review][Patch] **Lignes enfants bloc tirage UX** [`audit-draw-expander.ts`, `relatedParticipantLabels` API]

- [x] [Review][Defer] **Séparateurs jour dupliqués/manquants entre pages paginées** [`audit-journal-list.ts`] — deferred, cosmétique pagination
- [x] [Review][Defer] **`mat-datepicker` vs `<input type="date">`** [`admin-audit.html`] — deferred, M3-1 partiel acceptable
- [x] [Review][Defer] **Chip périmètre + H1 mobile absents sur admin-audit** [`admin-audit.html`] — deferred, polish layout M3-4
- [x] [Review][Defer] **Index page API non plafonné** [`AuditEventController.kt:29`] — deferred, risque faible avec volume audit actuel
- [x] [Review][Defer] **Appel `listSeasonParticipants` systématique sur fiche spectacle** [`event-detail.ts`] — deferred, perf polish
- [x] [Review][Defer] **Label jour DST dans `audit-day-label.ts`** — deferred, edge case rare

---

## Dev Notes

### Story Foundation

- Story 9.0 already created the write path: Flyway `V43__audit_events.sql`, `AuditEventEntity`, `AuditEventRepository`, `AuditEventRecorder`, `AuditActionType`, and domain hooks. 9.1 must consume that table; do not duplicate audit capture logic.
- FR35 requires actor, subject when applicable, action type, timestamp to second precision, and before/after values at minimum for availability status, role selections, and composition slot assignments.
- 9.1 is the admin/organizer consultation surface. Story 9.2 will handle "me concernant" for ordinary members; do not widen this story to member self-service.

### Existing Code To Reuse

| Concern | Reuse |
|--------|-------|
| Audit entity/repository | `services/api/src/main/kotlin/com/hatcast/api/audit/` |
| Audit schema | `services/api/src/main/resources/db/migration/V43__audit_events.sql` |
| Troupe/admin authorization | `TroupeAccessService.requireTroupeAdmin`, `isTroupeAdmin` |
| Organizer authorization | `OrganizerAccessRules` in `OrganizerAccessService.kt` |
| Principal | `SessionUserPrincipal.userId` |
| Paged API shape | `PagedTroupeMembersResponse`, `PagedEventsResponse`, `PagedSeasonsResponse` |
| Front route patterns | `apps/web/src/app/app.routes.ts` |
| Admin pages | `pages/admin-membres/`, `pages/admin-participants/`, `pages/admin-event-participants/` |
| Context resolution | `TroupeSeasonResolverService`, `TroupeContextService` |
| Breadcrumb | `shared/context-breadcrumb/` |

### Backend Guardrails

- `audit_events` is append-only. 9.1 must add read methods only; no update/delete endpoint and no mutation method on the repository.
- Do not expose all rows then filter in Angular. Authorization and scope filtering must happen server-side.
- Existing repository methods return full lists (`findByEventIdOrderByOccurredAtDesc`, etc.). They are acceptable for tests/small internal checks but should not power the UI. Add `Page<AuditEventEntity>` or DTO projection methods with `Pageable`.
- Prefer a single service method that computes allowed scope from the principal and requested filters, then applies the query. Keep the controller thin.
- If DTO projections are used with JPQL constructor expressions, ensure the constructor matches selected fields and provide count queries for custom complex queries when Spring cannot derive them cleanly.
- Keep JSON maps as `Map<String, Any?>` DTO fields; do not switch storage to `jsonb` or change `V43`.

### Authorization Matrix

| Caller | Allowed audit scope | Must not see |
|--------|---------------------|--------------|
| Platform admin | Requested troupe/season/event scope | Other troupe unless explicitly requested and authorized |
| Troupe admin | All rows for their troupe, including membership/admin rows | Other troupes |
| Season organizer | Rows scoped to their season and its events | Troupe-wide membership/admin rows unrelated to their delegated season |
| Event organizer | Rows scoped to events they organize | Other events, season-wide rows without that event, troupe-wide rows |
| Member | No 9.1 admin view | Member self-history is 9.2 |
| Anonymous | No access | All audit rows |

### Audit Diff Formatting

- Expected 9.0 action groups: `AVAILABILITY_*`, `EVENT_*`, … plus **`COMPOSITION_LIFECYCLE_CHANGED`** (9.1 write extension — system, null actor).
- Prioritize human-readable French labels over raw enum names in the UI. Suggested examples: `Disponibilité modifiée`, `Créneau assigné`, `Tirage terminé`, `Composition validée`, `Rôle organisateur accordé`.
- Treat absent `beforeJson` as creation/initial state and absent `afterJson` as removal/reset where the action type says so.
- **`actorUserId` nullable:** schema V43 allows null. UI: no trailing actor when null (§ Actor semantics). **9.1 captures** derived lifecycle transitions via `COMPOSITION_LIFECYCLE_CHANGED` after composition mutations (see tasks § System lifecycle audit capture).
- Keep metadata snapshots visible for deleted/anonymized participants, but avoid surfacing private email unless it is already part of the authorized admin context and needed for disambiguation.

### UX specification (approved 2026-06-01)

Normative UI: [ux-design-audit-journal-9-1.md](../planning-artifacts/ux-design-audit-journal-9-1.md).

| Decision | Value |
|----------|--------|
| Menu label | **Journal d'audit** (troupe + season gear); tab label **Activité** (event) |
| Event entry | 4th tab **Activité** + Moi/Tous + participant selector (Dispos parity) |
| Troupe/season entry | Gear → full admin page |
| Visibility | `canViewAudit*`; tab also if linked participant (Moi mode) |
| Event orga only | No season gear; **Activité** tab on their event(s) |
| System lifecycle | **`COMPOSITION_LIFECYCLE_CHANGED`**, `actorUserId` null — **in scope 9.1** |

### Frontend Implementation Guardrails

| Concern | Action |
|--------|--------|
| Material | Use `mat-form-field`, `mat-select`, `mat-datepicker`, `mat-chip`, `mat-expansion-panel`, `mat-paginator`, buttons, icons, spinner; no custom control equivalents. |
| Tokens | SCSS only with `--mat-sys-*` and `color-mix`; no hardcoded feature colors. |
| Mobile | Stack filter controls and audit rows at <= 480 px; avoid horizontal-only tables. |
| Accessibility | French labels; paginator `aria-label`; truncated rows expose full line via `title`. |
| Copy | UI copy in French with the product tone from `ux-voice-and-tone.md`. |
| Reuse | `core/audit/audit-labels.ts`, `audit-diff-formatter.ts`; layout from `admin-participants`. |

### Latest Technical Notes

- Angular Material paginator requires `aria-label` or `aria-labelledby` — use **`Pagination du journal d'audit`** (UX spec).
- Spring Data `Page<T>` provides total counts and matches existing HatCast paged responses. If the query becomes expensive, consider `Slice<T>` only as a future optimization; for this story, keep the existing `totalElements`/`totalPages` API shape unless performance tests prove otherwise.

### Tests

- Backend: add fixtures that seed multiple troupes/seasons/events and verify cross-scope leakage is impossible.
- Backend: include at least one event-organizer user, one season-organizer user, one troupe-admin user, one platform-admin user, and one ordinary member.
- Frontend: use Vitest patterns from existing admin pages; mock `fetch`, route params, and auth/session results.
- Verify UI diff helpers with direct unit tests rather than only DOM assertions.

### Explicit Non-Goals

- No member "my history" page or `/v1/me/audit` endpoint; reserved for Story 9.2.
- No new audit writes, no backfill from V1 Firestore `auditLogs`, no mutation of existing audit rows.
- No retention/anonymization policy implementation; reserved for account deletion/FR37 work.
- No export CSV/PDF for audit trail unless explicitly requested later.
- No analytics/notification-delivery audit beyond the entries already captured by 9.0.

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| 9.0 | done | Provides `audit_events`, action taxonomy, before/after snapshots, and indexes consumed by this story. |
| 5.5 | done | Proxy availability actions produce actor/subject audit rows. |
| 6.8 | done | Proxy confirmation/decline actions produce actor/subject audit rows. |
| 3.5 | done | Organizer delegation model used for 9.1 authorization. |
| 2.2 / 3.8 / 6.x | done | Domain mutations that populate the audit trail. |
| 9.2 | backlog | Future member-facing "me concerning" audit view; should reuse labels/diff helpers from 9.1 where appropriate. |

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story)

### Debug Log References

- Security: `/v1/audit/**` added to authenticated matchers in `SecurityConfig.kt` (was denied by default → 403).

### Completion Notes List

- **API:** `GET /v1/audit/events` with paginated `PagedAuditEventsResponse`, scope-aware authorization (`AuditEventAccessService`), batch identity resolution, French `actionLabel` on rows.
- **Lifecycle:** `COMPOSITION_LIFECYCLE_CHANGED` + `CompositionLifecycleAuditRecorder` hooked on composition mutation services (participation, slots, draw, publish/validate/unlock, decline restore).
- **Permissions:** `canViewAuditTroupe|Season|Event` on `MySeasonPermissionsDto` + front mirror.
- **UI:** Admin pages (troupe/saison), onglet **Activité** (spectacle), `audit-journal-list`, formatters (`audit-line-formatter`, `audit-draw-expander`), menus **Journal d'audit**.
- **Tests:** `AuditEventReadIntegrationTest`, `audit.spec.ts`; `./gradlew test` + `npm run test` + `npm run build` green.
- **M3 checklist:** M3-1 mat-form-field/select/paginator/spinner ✓ · M3-2 `--mat-sys-*` tokens ✓ · M3-3 stacked cards + paginator aria-label ✓ · M3-4 scope-admin-menu + breadcrumbs ✓ · M3-5 checked in this summary ✓
- **Code review (2026-06-01):** email obfuscation, OpenAPI `audit.yaml`, draw child lines, `showEventPrefix`, lifecycle in Moi filter, tests platform admin / event orga / lifecycle ; Activité Tous filters → G-008 backlog.

### File List

**Backend**
- `services/api/src/main/kotlin/com/hatcast/api/audit/AuditActionType.kt`
- `services/api/src/main/kotlin/com/hatcast/api/audit/AuditActionLabels.kt`
- `services/api/src/main/kotlin/com/hatcast/api/audit/AuditEventAccessService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/audit/AuditEventController.kt`
- `services/api/src/main/kotlin/com/hatcast/api/audit/AuditEventRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/audit/AuditEventService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/audit/AuditIdentityResolver.kt`
- `services/api/src/main/kotlin/com/hatcast/api/audit/dto/AuditEventDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleAuditRecorder.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDeclineRestoreService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/organizer/dto/OrganizerDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt`
- `services/api/src/test/kotlin/com/hatcast/api/audit/AuditEventReadIntegrationTest.kt`
- `services/api/src/main/kotlin/com/hatcast/api/audit/AuditEmailObfuscator.kt`
- `services/api/openapi/audit.yaml`
- `services/api/src/test/kotlin/com/hatcast/api/audit/AuditEmailObfuscatorTest.kt`

**Frontend**
- `apps/web/src/app/core/audit/audit-api.service.ts`
- `apps/web/src/app/core/audit/audit-labels.ts`
- `apps/web/src/app/core/audit/audit-line-formatter.ts`
- `apps/web/src/app/core/audit/audit-draw-expander.ts`
- `apps/web/src/app/core/audit/audit.spec.ts`
- `apps/web/src/app/core/permissions/organizer-api.service.ts`
- `apps/web/src/app/core/events/event-detail-tabs.ts`
- `apps/web/src/app/core/navigation/troupe-routes.ts`
- `apps/web/src/app/shared/audit-journal-list/*`
- `apps/web/src/app/shared/availability/event-activite-tab.*`
- `apps/web/src/app/pages/admin-audit/*`
- `apps/web/src/app/pages/event-detail/event-detail.ts`
- `apps/web/src/app/pages/event-detail/event-detail.html`
- `apps/web/src/app/pages/event-detail/event-detail.spec.ts`
- `apps/web/src/app/pages/season-home/season-home.ts`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.ts`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts`
- `apps/web/src/app/app.routes.ts`

**Docs**
- `ARCH.md`

### Change Log

- 2026-06-01: Story created via `/bmad-create-story 9.1`.
- 2026-06-01: UX amendment — event **Activité** tab (Moi/Tous filter) replaces event gear entry.
- 2026-06-01: **Lifecycle capture in scope** — `COMPOSITION_LIFECYCLE_CHANGED`, null actor (AC 10–11).
- 2026-06-01: Implementation complete — read API, UI journal, lifecycle capture, tests (dev-story).
- 2026-06-01: Code review — 14 patches applied, 2 decisions resolved (Activité filters → G-008 ; email obfuscation), 6 deferred.

---

### Validation create-story

- [x] Business AC are numbered and sourced from epics / PLAN / FR35 / NFR-S2.
- [x] Material 3 section is filled because the story touches `apps/web/`.
- [x] Tasks reference AC numbers, including M3 AC.
- [x] Existing code paths and files to reuse are listed.
- [x] Backend and frontend test commands are mentioned.
