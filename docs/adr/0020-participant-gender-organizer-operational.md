# ADR-0020: Participant-level gender (organizer operational layer)

- **Status:** Accepted
- **Date:** 2026-06-06
- **Context:** Stories **2.12–2.12c** and **6.21** shipped gender on `users.gender` only. Name-only roster participants (FR45) and linked users without account M/F always resolve to `non_specified`, hiding the mixité pill. Stakeholders require organizers to specify gender for guests and for recognized members without Mon compte M/F, while respecting member self-service when account gender is set.
- **Decision:**
  1. Add nullable `gender` on `season_participants` and `event_participants` (same enum as `users.gender`: `male`, `female`, `non_specified`).
  2. **Effective gender precedence:** account `male`/`female` wins → else participant `male`/`female` → else `non_specified`.
  3. **Write rule:** organizers may set `participant.gender` on create/update when linked account gender is not `male`/`female` (includes name-only, MANAGED pre-link, and account Non spéc./unset).
  4. **Cascade:** on `PATCH /v1/me/preferences` gender change, sync all linked participant rows — set to account M/F, or clear to `non_specified` when member selects Non spéc. (**Option B** — respect member; organizer may re-set on roster).
  5. Centralize reads in an `effectiveGender(participant, user)` helper consumed by `ParticipantGenderResolver`, admin DTOs, availability summary, and season statistics.
- **Consequences:**
  - **Positive:** Mixité and gender-aware labels work for guests; clear split between member identity (account) and organizer operational annotation (participant).
  - **Positive:** User M↔F changes propagate consistently to all roster rows.
  - **Negative:** Two storage locations; implementation must avoid precedence drift across API paths.
  - **Negative:** User → Non spéc. may hide mixité until organizer re-edits participant row (accepted — 6.21 non-blocking).
- **Alternatives considered:**
  - **User-only** — rejected; no row for name-only guests.
  - **Sticky participant gender when user selects Non spéc.** — rejected (Option A); conflicts with self-service privacy.
  - **Client-only / session gender** — rejected; server-side mixité and dispos require persistence.

**References:** [DOMAIN.md](../../DOMAIN.md) · [member-gender.md](../../_bmad-output/specs/spec-member-gender-parity/member-gender.md) · SCP [sprint-change-proposal-2026-06-06-participant-gender-lot-b.md](../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-06-participant-gender-lot-b.md)
