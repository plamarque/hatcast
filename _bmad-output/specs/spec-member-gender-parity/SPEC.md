---
id: SPEC-member-gender-parity
companions:
  - member-gender.md
  - ../planning-artifacts/sprint-change-proposal-2026-06-05-member-gender-parity.md
  - ../planning-artifacts/ux-design-member-gender-parity.md
  - ../planning-artifacts/ux-designs/ux-member-gender-parity-2026-06-05/EXPERIENCE.md
  - ../planning-artifacts/ux-designs/ux-member-gender-parity-2026-06-05/DESIGN.md
sources:
  - ../../planning-artifacts/sprint-change-proposal-2026-06-05-member-gender-parity.md
  - ../../legacy/src/services/storage.js
  - ../../legacy/src/services/playerAvatars.js
---

> **Canonical contract** for member gender profile and team gender parity (V1 parity, Waves A–C). Root [SPEC.md](../../../SPEC.md) and [DOMAIN.md](../../../DOMAIN.md) are amended to reference this folder. Implementation order: [PLAN.md](../../../PLAN.md) stories **2.12–2.12c**, **6.21**, **16.3**; draw factor **19.11** is Wave D.

# Member gender & team parity

## Why

V1 let members optionally declare gender so the product could show **natural role labels** (e.g. Comédienne), **distinct fallback avatars**, and later support **gender balance** awareness at composition time. V2 shipped without this field, forcing inclusive middot notation everywhere and blocking planned parity hints and draw factors (**19.11**). Restoring optional gender closes a **V1 parity gap** without making gender mandatory or blocking any workflow.

## Capabilities

- id: CAP-1
  intent: A signed-in member can optionally set or clear their gender on the account profile so the product can personalize presentation.
  success: From Mon compte → Mon profil, saving Homme / Femme / Non précisé persists and reloads correctly; default is Non précisé when never set.

- id: CAP-2
  intent: The product displays role labels and selection wording adapted to a participant's declared gender when known, and inclusive middot forms when gender is not specified.
  success: A member with `female` + `player` role sees « Comédienne » (not « Comédien·ne ») in dispos, équipe, and confirmation surfaces; `non_specified` keeps current inclusive labels.

- id: CAP-3
  intent: When no custom or Google avatar exists, the product shows a gender-distinct letter fallback (initial + M3 tone) for linked users with known gender.
  success: Fallback avatars use tone by gender (male → purple, female → orange, non_specified → grey per `member-gender.md`) without overriding uploaded or Google photos.

- id: CAP-4
  intent: Organizers composing a team see a non-blocking summary of female/male counts among filled `player` slots with known gender.
  success: On the Équipe tab draft, changing `player` assignments updates the parity strip; no assign/draw/validate action is blocked by imbalance.

- id: CAP-5
  intent: Authorized users can view season-level aggregate gender balance for `player` participations on validated compositions.
  success: Season stats (or agreed surface) show F/M counts and female share excluding `non_specified` from the ratio denominator; no per-person gender is exposed on the aggregate view.

## Constraints

- Gender is **optional**; no workflow (availability, draw, validate, confirm) may require it.
- Storage is **account-level** on `users.gender`, not troupe- or season-scoped.
- API enum values: `male` | `female` | `non_specified` (JSON); UI labels in French: Homme / Femme / Non précisé.
- Parity counting applies to role key **`player` only**; decorum and volunteer slots are out of scope for parity metrics in Waves A–C.
- Participants with `non_specified` or unlinked accounts are **excluded from F/M ratio**; they may be noted separately in organizer copy (see companion).
- Gender is **not** shown as a public profile field to other members in Wave A; only derived labels/avatars reflect it.
- Draw weighting by gender is **out of scope** for this spec (Epic **19.11**, separate ADR/formula gate).

## Non-goals

- Mandatory gender collection or verification.
- Blocking composition, draw, or validation on gender imbalance.
- Troupe-admin editing of another member's gender (self-service only in Wave A).
- Parity metrics on non-`player` roles in Waves A–C.
- Implementing **19.11** draw factor (referenced only as downstream consumer).

## Success signal

A troupe member sets **Femme** on Mon profil; on the next spectacle their `player` slot shows **Comédienne**, their letter fallback avatar uses the orange tone, and an organizer sees an updated F/M strip on the Équipe tab — while a member who keeps **Non précisé** sees unchanged inclusive labels and is never prompted to choose.

## Open Questions

- **OQ-1:** Should the composition parity hint appear only for events whose category is `match`, or for all events with `player` slots? *Assumption: all events until UX spec narrows.*
- **OQ-2:** Season parity stats on **Statistiques ligue** only, or also on `/membre/:userSlug`? *Assumption: Statistiques ligue for **16.3** MVP.*
- **OQ-3:** Should admins see raw gender in the member admin list? *Assumption: no in Wave A.*
