---
id: SPEC-notifications-orga-v2
companions:
  - orga-notification-catalog.md
  - orga-recipient-rules.md
  - role-promotion-alerts.md
  - ../../docs/v2/technical/NOTIFICATIONS_CATALOG.md
  - ../../planning-artifacts/ux-notification-prefs-orga-section-brief.md
  - ../../implementation-artifacts/8-4-notifications-ops-organisateurs.md
sources:
  - session:debug-8-4-orga-notifications-2026-06-08
  - session:elicitation-notifications-orga-v2-2026-06-08
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability only.

# Organizer ops notifications — v2 refinements

## Why

Story 8.4 shipped working dispatch (opt-in prefs, Mailpit-verified `SENT`) but used an **implicit cascade** that diverged from operator mental models: the UI could show no event organizer while season organizers were notified via fallback, and season organizers felt “blind” once someone else was delegated. Recette also exposed label confusion (“brouillon” twice), narrow decline-only regression alerts, and no onboarding when roles are granted. v2 replaces implicit cascade with **explicit delegation** (event organizers list is always populated and visible — including for members who need a contact), per-intent notification audiences, clearer French copy, broader team-regression signals, transactional email on role grant, and scheduled reminders as escalation to season organizers.

## Capabilities

- id: CAP-1
  intent: Organizer notification preference rows and push/email copy use distinct, unambiguous French labels that separate **event draft** from **proposed composition**, and describe draft state in the message body where needed.
  success: On `/compte/notifications` → **Alertes organisateur**, a user can distinguish “new draft event” from “proposed composition” without reading technical keys; catalogue companion lists approved title + description per pref row; no row title contains “Brouillon partagé” or “Nouveau brouillon” as shipped in 8.4.

- id: CAP-2
  intent: All organizer **ops** alert categories remain **opt-in with push and email OFF by default**; no automatic pre-enable of any `ORG_*` channel when a user gains organizer scope.
  success: New or promoted organizer opens prefs: every `ORG_*` ops row shows OFF/OFF until explicitly toggled; promotion grant does not flip ops prefs; `ORG_EVENT_DRAFT_CREATED` is not a default-ON exception.

- id: CAP-3
  intent: When a user is newly granted **event organizer**, **season organizer**, or **troupe admin** (`TROUPE_ADMIN`), they receive a **one-shot transactional email** (exempt from ops opt-in) naming the role and linking to `/compte/notifications` so they can enable ops alerts.
  success: Each distinct grant fires at most one transactional email per user + role + scope id; idempotent re-grant does not re-send; push for repeat grants only if optional pref `ORG_SCOPE_GRANTED` is ON; documented in `role-promotion-alerts.md`.

- id: CAP-4
  intent: Event organizers receive an immediate ops alert on each lifecycle edge where a **validated** composition goes from `COMPLETE` to not `COMPLETE`, regardless of cause, with the **cause** in the message body.
  success: Each distinct `COMPLETE → ¬COMPLETE` edge produces exactly one `TEAM_REGRESSED` dispatch per opted-in event organizer (no daily dedupe); companion recette scenarios pass; pref row **Équipe plus complète** replaces **Déclin immédiat**; `ASSIGNEE_DECLINED` retired for orga ops.

- id: CAP-5
  intent: Organizer ops notification **audiences follow per-intent rules** on explicit event/season organizer lists — not the 8.4 implicit cascade resolver.
  success: `orga-recipient-rules.md` matrix is implemented; immediate event signals go to **current event organizers** only; `EVENT_DRAFT_CREATED` goes to **season organizers**; scheduled reminders go to **event + season organizers** with per-recipient dedupe per scheduled tick; Pierrick/Charlene recette behaves deterministically per matrix.

- id: CAP-6
  intent: Dev/local recette can sign in as Improbots seed organizers (`@seed.improbots.test`, password = `users.slug`) and enable prefs per account to validate end-to-end orga email in Mailpit.
  success: Documented in DEVELOPMENT.md; login works on localhost including `--with-push` build; Charlene and Pierrick paths in recette checklist.

- id: CAP-7
  intent: Every event always has **at least one event organizer**, initialized explicitly at creation, visible to members; an organizer cannot remove themselves as the **last** event organizer without naming a replacement first.
  success: On event create, season organizers are copied to event organizers (if no season organizers, troupe admins become season organizers then copied); API/UI rejects removing the last event organizer; members can see who organizes the event; manual add/remove/co-org afterward does not auto-resync season ↔ event lists.

## Constraints

- **Opt-in orga ops model** from UX brief: ops intents distinct from member opt-out prefs (`ORG_*` ≠ `TEAM_CONFIRMED`).
- **Member `TEAM_COMPLETE_MEMBER`** unchanged: event organizers may still receive member “Équipe au complet” when `TEAM_CONFIRMED` is ON; orga **Équipe bouclée** remains separate.
- **8.4 cascade resolver superseded** for orga ops intents; audiences come from explicit lists per `orga-recipient-rules.md`.
- **`COMPOSITION_SHARED` audience** is **event organizers only** (8.4 “circle” retired).
- **Scheduled reminders**: union of event + season organizers; **one delivery per user per intent per scheduled tick** even if user holds both roles.
- **Promotion transactional email** is service/account notification, not marketing; ops prefs remain OFF until user opts in.
- **No brownfield backfill** of event organizers on existing events (OQ-5c); greenfield next season.
- **Material 3** prefs UI per `docs/v2/technical/FRONTEND_UI.md`.
- **NFR-R2**: notification failure must not roll back domain mutations.

## Non-goals

- Inbox/history UI on `/accueil`.
- Per-season or per-troupe notification preference matrices.
- Auto-enabling ops `ORG_*` prefs on role grant (transactional email only for CAP-3).
- In-app member→organizer messaging (organizer list visibility only).
- Changing member availability or confirmation notification semantics.
- Automatic removal of season organizers from event organizers when a new delegate is added.
- Backfill migration of event organizers on pre-existing events.

## Success signal

Season organizer Pierrick and event organizer Charlene on the same troupe complete recette: (1) French labels clear on `/compte/notifications`; (2) ops prefs OFF until toggled; (3) newly promoted user receives transactional email with prefs link; (4) each team regression edge emails event organizers with cause; (5) season organizer removed from event organizers no longer gets compo/complete/regression but still gets new-spectacle and reminder escalation when opted in; (6) last event organizer cannot self-remove without replacement; (7) Mailpit `SENT` for opted-in recipients per audience matrix.

## Resolved decisions

| ID | Decision |
|----|----------|
| OQ-1 | **Explicit delegation** — not cascade, not full union. Per-intent audiences in companion. Season orgas copied to event orgas at creation; manual delegate/co-org afterward. |
| OQ-2 | Ops prefs OFF → no ops email; **transactional email on role grant** is exempt and always sent once. |
| OQ-3 | **One regression alert per lifecycle edge**, cause in body; no daily dedupe. |
| OQ-4 | No auto-removal on delegate add; creator removes self manually or stays as co-organizer. |
| OQ-5 | **(c)** No backfill on existing events; acceptable pre-prod / empty next season. |

## Assumptions

- “Pas précoché” means default OFF on ops pref toggles.
- CAP-4 supersedes catalogue D5:B (`ASSIGNEE_DECLINED` only).
- Event organizer list shown to members is already or will be surfaced in event detail UI (exact surface delegated to implementation story).
