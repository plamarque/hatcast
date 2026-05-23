# Story 2.3: Troupe Member CSV Import and Export

Status: backlog

<!-- Correct Course 2026-05-23 — FR42 / NFR-S4. Depends on Story 2.1; UI best after Story 2.2. -->

## Story

As a troupe administrator,
I want to export and import troupe member lists in a documented CSV format,
so that I can migrate members from HatCast V1, initialize a new troupe quickly, or move members between troupes.

## Acceptance Criteria

1. **Given** troupe administrator permissions on `{troupeId}`, **when** the admin requests `GET /v1/troupes/{troupeId}/members/export` (or equivalent documented route), **then** the API returns a CSV file containing **only** the fields defined in the **Member CSV contract** below, with no fields reserved for non-admin readers (NFR-S4). [Source: `_bmad-output/planning-artifacts/prd.md` FR42; NFR-S4]
2. **Given** a CSV file that conforms to the Member CSV contract, **when** the admin submits `POST /v1/troupes/{troupeId}/members/import` with the file (multipart or documented payload), **then** each valid row creates or updates an active membership according to import rules; invalid rows are **not** partially persisted. [Source: FR42]
3. **Given** an import completes, **when** the admin views the import result, **then** the response (and UI when Story 2.2 admin surfaces exist) lists **per-row outcomes**: `success`, `skipped`, or `error` with a stable machine-readable code and human-readable message; no personal data from failed rows is returned to unauthorized users (NFR-S4). [Source: NFR-S4]
4. **Given** a user without troupe admin rights, **when** export or import is attempted, **then** the API returns 403 and the UI does not expose download/upload affordances (NFR-S2). [Source: NFR-S2]
5. **Given** duplicate membership for the same `(troupeId, userId)` on import, **when** the row is otherwise valid, **then** behaviour is **idempotent update** of troupe-scoped fields (display name, baseline role if in scope) rather than duplicate rows — aligned with Story 2.1 uniqueness rules. [Source: Story 2.1]
6. **Given** a row references an unknown user identifier, **when** import rules allow invitation-by-email, **then** behaviour is explicitly documented in the contract (create pending membership vs reject row); if out of scope for this story, reject with clear error code. [Source: Correct Course — V1 migration may require email-keyed rows]
7. **Given** the API contract changes, **when** the story is complete, **then** OpenAPI documents export/import endpoints, CSV field list, error codes, CSRF requirements for import, and example responses for import results. [Source: `architecture.md` implementation patterns]

## Member CSV contract (v1 — story-owned)

Documented format for FR42. Architecture may reference this section; changes require story/PRD alignment.

| Column | Required | Notes |
|--------|----------|-------|
| `email` | Yes | Primary match key for existing users; normalized lowercase |
| `displayName` | No | Troupe-scoped display name; default from account if omitted |
| `baselineRole` | No | Only if Story 2.2 role enum is available; otherwise omit or ignore with warning |
| `status` | No | `active` / `inactive` if deactivation supported; default `active` |

- **Encoding:** UTF-8 with header row.
- **Separator:** comma; quote fields containing commas.
- **Export scope:** active memberships only unless admin selects include-inactive (optional — defer if not needed for V1 migration).
- **V1 migration mapping:** document a separate **V1 export recipe** (manual or script from legacy `users` / troupe member lists) that produces this v1 contract; full Firestore ETL is **not** required in this story if admins can produce CSV manually for cutover.

## Tasks / Subtasks

- [ ] **Backend export** (AC: 1, 4, 7)
  - [ ] Add admin-gated export endpoint under `com.hatcast.api.troupe`.
  - [ ] Stream CSV with documented columns only; avoid loading unbounded rows without pagination/chunking for large troupes (NFR-P1 spirit).
  - [ ] Audit log entry for export (actor, troupe, timestamp) — optional minimal hook for Epic 9 alignment.

- [ ] **Backend import** (AC: 2, 3, 5, 6, 7)
  - [ ] Parse and validate CSV before any write; collect row-level results.
  - [ ] Resolve users by email via existing `UserEntity` lookup; define behaviour when user missing.
  - [ ] Use transactional batches or per-row transactions so one bad row does not corrupt others.
  - [ ] Return structured `ImportResult` DTO: `{ summary: { success, skipped, error }, rows: [...] }`.

- [ ] **Authorization** (AC: 4)
  - [ ] Reuse troupe admin check from Story 2.2 when available; until then, explicit membership-gated admin rule documented in 2.1/2.2 notes.

- [ ] **Frontend admin UI** (AC: 3, 4)
  - [ ] Add export download and import upload + results table on **Membres** admin surface (UX-DR10); may ship API-only first if 2.2 UI not ready — mark partial completion in sprint notes.
  - [ ] Show row-level errors without leaking emails of other users to non-admins.

- [ ] **OpenAPI & docs** (AC: 7)
  - [ ] Extend troupe/membership OpenAPI fragment.
  - [ ] Link contract from `architecture.md` FR42 note.

- [ ] **Tests** (AC: 1–6)
  - [ ] Integration: admin export/import happy path, non-admin 403, invalid CSV rows, duplicate email idempotency.
  - [ ] Unit: CSV parser, validation, row result aggregation.

## Dev Notes

### Scope boundaries

- **In scope:** Durable V2 CSV import/export for troupe members (FR42); migration enabler for prod cutover.
- **Out of scope:** Story 3.6 season participation history CSV; full automated V1 Firestore export pipeline; bulk role matrix beyond baseline role column.

### Dependencies

- **Story 2.1** — `troupe_memberships` table and membership services must exist.
- **Story 2.2** — admin member UI and baseline roles improve UX but API can land earlier.

### References

- PRD: `_bmad-output/planning-artifacts/prd.md` — FR42, NFR-S4, Amira admin journey
- Epics: `_bmad-output/planning-artifacts/epics.md` — Story 2.3
- UX: `_bmad-output/planning-artifacts/ux-design-hatcast-v2.md` — Admin surfaces / Membres
- Validation: `_bmad-output/planning-artifacts/prd-validation-report.md` — FR42 CSV contract pointer
