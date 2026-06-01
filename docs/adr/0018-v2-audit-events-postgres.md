# ADR-0018: V2 audit journal (`audit_events` PostgreSQL)

- **Status:** Accepted
- **Context:** FR35 requires an immutable audit trail for significant domain changes (availabilities, events, rosters, membership/organizer rights, composition lifecycle, participation). V1 used Firestore `auditLogs` with client writes and Cloud Function triggers (ADR-0004). V2 runs on PostgreSQL (Neon) with Spring domain services; we need a unified write path before MEP, without a read API (stories 9.1 / 9.2).
- **Decision:** Introduce append-only table `audit_events` (Flyway `V43__audit_events.sql`) and service `AuditEventRecorder` invoked from domain services **inside the same `@Transactional` boundary** as the mutation. JSON snapshots (`before_json`, `after_json`, `metadata_json`) stored as **TEXT** with Jackson `AttributeConverter` (H2 test compatibility). Controlled enum `AuditActionType` (~35 values for MEP scope). No application UPDATE/DELETE on audit rows.
- **Consequences:**
  - **Positive:** Single correlated timeline per `event_id` / `season_id` / `troupe_id`; atomic with domain data (rollback ⇒ no orphan audit); ready for 9.1/9.2 read APIs.
  - **Negative:** Partial columns on domain tables (`recorded_by_user_id`, `declined_by_user_id`) remain for operational queries; full history lives in `audit_events`. No backfill from V1 Firestore.
- **Alternatives considered:**
  - **Outbox / after-commit events:** Rejected for audit (story 6-13 pattern reserved for external side-effects); audit must roll back with failed mutations.
  - **Native `jsonb`:** Rejected for test profile (H2 `MODE=PostgreSQL` without jsonb parity).
  - **Reuse V1 type taxonomy (~30 types):** Rejected; V2 uses a smaller controlled enum aligned to MEP domains.
