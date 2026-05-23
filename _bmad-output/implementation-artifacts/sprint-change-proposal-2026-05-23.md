# Sprint Change Proposal — 2026-05-23

**Type:** Direct adjustment (Correct Course)  
**Trigger:** Stakeholder requirement — troupe member CSV import/export for V1→V2 migration and ongoing admin  
**Status:** **Approved** — 2026-05-23  
**Approved by:** Patrice  
**Approval mode:** Incremental (proposals 1–2 applied, then sign-off)

## Summary

Add **FR42** and **NFR-S4** to the PRD; schedule delivery as **Epic 2, Story 2.3**, renumbering former stories 2.3–2.6 → **2.4–2.7**.

## Changes applied

| Artifact | Change |
|----------|--------|
| `prd.md` | FR42, NFR-S4, MVP admin, Amira journey, migration note; typo fix |
| `epics.md` | FR42/NFR-S4 inventory; Story **2.3** CSV; renumber 2.4–2.7 |
| `2-3-import-export-csv-des-membres-de-troupe.md` | Story file with CSV contract v1 |
| `sprint-status.yaml` | Story keys 2-3 … 2-7 |
| `ux-design-hatcast-v2.md` | Admin Membres — CSV import/export |
| `architecture.md` | FR42 / NFR-S4 pointer to Story 2.3 contract |
| `prd-validation-report.md` | Full validation (Warning — usable) |

## Epic 2 story order (after change)

| Story | Title | FR |
|-------|-------|-----|
| 2.1 | Adhésion et profil minimal | FR6 |
| 2.2 | Administration membres et rôles | FR7 |
| **2.3** | **Import/export CSV membres** | **FR42** |
| 2.4 | Navigation entre troupes | FR8 |
| 2.5 | Pseudo par troupe | FR9 |
| 2.6 | Avatar / Google | FR10 |
| 2.7 | Popover profil membre | UX-DR8 |

## Dependencies

- **2.3** requires **2.1** (membership Postgres).
- **2.3** UI best after **2.2**; API-only slice acceptable earlier.

## Out of scope (explicit)

- Story **3.6** — CSV export of season participation history (unchanged).
- Automated V1 Firestore bulk ETL (manual/scripted CSV to v1 contract is acceptable for cutover).

## Post-approval follow-ups (implementation, not blocking)

- [x] Stakeholder sign-off on this proposal (2026-05-23)
- [x] Fix PRD typo `non-meimportmbers` (validation warning)
- [ ] Set story 2-3 to `ready-for-dev` when Story 2.1 is done
- [ ] Implement Story 2.3 after 2.1 (and preferably 2.2 for admin UI)

## Decision record

**Approach:** Direct adjustment — extend Epic 2; no rollback; no new epic.  
**Rationale:** Requirement supports prod V1→V2 cutover and durable admin capability; aligns with membership work already in progress (2.1).
