# ADR-0004: Audit via Firestore triggers and auditLogs collection

- **Status:** Observed
- **Context:** Need an audit trail of important actions (who did what, when) for compliance and debugging.
- **Decision:** Store audit entries in a top-level Firestore collection `auditLogs`. Write from (1) client via `auditClient.js` for user-driven actions and global errors, and (2) Cloud Functions via Firestore triggers (e.g. `auditTriggers.js`) for data changes (availability, selection, events, players). Rules allow write from anyone (so triggers and client can write) and read for authenticated users. Indexes support queries by eventType, severity, seasonSlug, userEmail, etc. (`firestore.indexes.json`).
- **Consequences:**
  - Centralised, queryable history. Triggers capture server-side consistency without trusting client-only logs.
  - Write-open rule on auditLogs is intentional for triggers; read is restricted. No client-side delete of audit logs in app logic.
  - Retention and cost are unbounded unless a separate retention or archival process is added.
- **Alternatives considered:** Client-only audit could be tampered with; server-only would miss client-only actions. Hybrid (client + triggers) was chosen. External log service (e.g. Logtail) could be added later without changing this pattern.
