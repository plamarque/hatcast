---
title: Prepare Advent databases independently of deployment
type: feature
created: 2026-11-01
status: done
route: dispatch
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent">

## Intent

Prepare staging and production for later selective Advent content synchronization without deploying the calendar or synchronizing contributions. Use the common private bucket by default and keep databases distinct. Target and source verification must remain effective; deployed runtime readiness is a separate concern.

</frozen-after-approval>

## Implementation Notes

- The user approved preparation of both cloud databases without deployment or contribution synchronization.
- Backed up staging and production as Neon branches and used standalone Flyway to apply and validate migrations 70–82. Each destination had no preexisting Advent tables and was empty of quizzes, reservations and answers afterward.
- Tested old-runtime Flyway validation on both upgraded databases, and ran the read-only readiness check against all three cloud targets.
- Active traffic, reconciliation, database separation and ETag remain checked even when a newer inactive revision exists.
- The runtime bucket default is prepared locally; the workflow marker remains automatic and runtime availability is reported independently.

## Review Triage Log

- Valid: runtime layout alone must not gate database preparation; now reported separately.
- Valid: readiness must verify catalogue metadata, database permissions, migrations and lock rows; added without reading contributions.
- Valid: inactive newer revisions need not prevent verification of a stable active revision; changed for target and other services while preserving traffic and identity checks.
- Valid: documentation incorrectly described a bucket override as blocking synchronization; corrected.
