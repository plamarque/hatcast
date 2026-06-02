---
stepsCompleted: [1]
inputDocuments:
  - _bmad-output/planning-artifacts/epics.md (Epic 8, 17.21)
  - _bmad-output/planning-artifacts/ux-hub-a-faire.md
  - _bmad-output/implementation-artifacts/8-1-opt-in-aux-notifications-navigateur-et-categories.md
  - _bmad-output/implementation-artifacts/8-2-preferences-de-notification.md
session_topic: 'Extension et structuration du système notifications HatCast (Epic 8) — rappels admin, refonte annonce, auto aux jalons, email vs push, lien inbox À faire'
session_goals: 'Générer des options (pas décisions finales) ; clarifier pull vs push, auto vs manuel, membre vs orga ; repérer périmètre 8.3 MEP vs post-MVP ; éviter mélange spec/UX/implémentation trop tôt'
selected_approach: 'ai-recommended'
techniques_used:
  - 'Phase 1: Morphological matrix / First principles'
  - 'Phase 2: Role storming (membre, orga, PO)'
  - 'Phase 3: Reverse brainstorming (anti-patterns)'
ideas_generated:
  - 'Draft-before-publish lifecycle'
  - 'Publish = open availability (member notif gate)'
  - 'Organizer create-alert (opt-in)'
  - 'Availability-open SLA nudge (T-1 month)'
  - 'Composition completion cadence (weekly → daily J-7)'
  - 'Draft compo = orga-only channel'
  - 'Validate = dual-audience split (assignees vs roster FYI)'
  - 'Roster FYI opt-out category'
  - 'Organizer cascade for ops alerts'
  - 'Complete = orga closure signal only'
  - 'Participant notification ends at confirm'
  - 'Assignee presence reminders (J-7, J-1)'
  - 'Inbox badge on PWA icon'
  - 'Removal-from-composition alert'
  - 'Re-confirmation on remodel'
  - 'Per-event orga notifs (no digest)'
  - 'Manual availability nudge (6.10+)'
  - 'Recent-reminder guard'
  - 'MEP scope Q1-Q3 confirmed (PO)'
stepsCompleted: [1, 2, '2-personas-complete', 3]
session_status: complete
context_file: 'Prior bmad-help conversation (2026-06-01)'
facilitator: Patrice
date: '2026-06-01'
---

# Brainstorming Session Results

**Facilitator:** Patrice  
**Date:** 2026-06-01  
**Project:** HatCast — Epic 8 notifications

## Session Overview

**Topic:** Extension et structuration du système notifications (Epic 8) : rappels admins, refonte écran Partager/Annoncer (6.10), notifications auto aux jalons (dont publication événement), cohérence email/push, proximité avec inbox `/accueil`.

**Goals:**
- Générer des options et variantes produit
- Clarifier les modèles mentaux (pull/push, auto/manuel, membre/orga)
- Identifier ce qui appartient à 8.3 MEP vs nouvelles stories
- Préparer un futur `correct-course` sans figer l'implémentation

### Context Guidance

- **8.1** done (opt-in push global) ; **8.2** ready-for-dev (catégories post-MVP) ; **8.3** backlog P0 MEP (FR31)
- **Inbox** Epic 17 done (`GET /me/inbox`) — hub membre pull, orga tasks hors hub
- **6.10** ShareAnnounceDialog — broadcast manuel orga
- FR31 : 4 intents auto (dispos, brouillon publié, confirmation, recap équipe)

### Session Setup

Cadrage validé par le participant (2026-06-01). Approche : techniques recommandées par l'IA (option 2).

## Technique Selection

**Approach:** AI-Recommended Techniques  
**Analysis context:** Epic 8 extension with MEP 8.3 constraint; inbox vs notification distinction.

**Recommended sequence:**

1. **Morphological matrix / First principles** — map Intent × Audience × Channel × Trigger × In-app surface before UI/code.
2. **Role storming** — member, organizer, PO lenses.
3. **Reverse brainstorming** — worst-case scenarios → normative principles.

**AI rationale:** Complex product/architecture topic needs structured divergence first, then empathy, then guardrails. Avoids premature convergence on 8.3 scope.

---

## Ideation Log

### Phase 1 — Morphological matrix (in progress)

#### First principles — 4 surfaces (confirmed)

| Surface | Role |
|---------|------|
| Inbox (pull) | Member actions required in-app |
| Auto notif (push/email) | Remind at domain milestone |
| Manual announce (6.10) | Organizer chooses message + channels |
| Org signal (new) | Notify organizers/admins of ops gaps |

#### Row 1 — Availability opening (participant-facing)

**Decision (Patrice):** Notify members **only at publication** = event opened to availability deposits, not at draft creation.

**New domain concept:** Event **draft / preparatory** state:
- Not visible for availability (or not accepting deposits) until organizer publishes/opens dispos
- Prep window: configure venue, description, specifics, roster adjustments
- Can pre-seed composition (e.g. external musician → DJ role removed/unavailable)
- **Auto member notification** fires on **publish/open dispos**, not on create

| Cell | Value |
|------|-------|
| Push auto (member) | On **publish / open availability** |
| Email auto (member) | Same trigger |
| Inbox | When event visible + dispos expected + status unknown (independent of push) |
| Manual announce | Orga can still use 6.10 after publish |
| Signal orga | On **create (draft)** — optional pref; small audience |

#### Row 1b — Organizer signals (new — Patrice)

| Trigger | Audience | Intent |
|---------|----------|--------|
| Event **created (draft)** | Organizers (opt-in pref) | Awareness, catch errors, sync between orgas |
| Date < **1 month** + dispos **not open** | Organizers/admins | « Ouvrir les dispos — spectacle dans 1 mois » |
| Approaching date + **compo incomplete** | Organizers | **Weekly** reminders |
| **J-7** + compo still incomplete (gaps, unconfirmed) | Organizers/admins | **Daily** escalation until resolved or event passes |

---

### Ideas captured

**[Category #1]**: Draft-before-publish lifecycle
_Concept_: Add explicit event preparatory/draft phase: no availability deposits until organizer publishes. Supports configuration (venue, description, roster, pre-seeded compo slots e.g. external musician without DJ role).
_Novelty_: Separates « event exists in system » from « members may act » — avoids member spam and matches orga mental model.

**[Category #2]**: Publish = open availability (member notif gate)
_Concept_: Automatic member notifications (push/email) only when organizer opens event to availability deposits, not at creation.
_Novelty_: Single clear trigger for FR31 availability intent; inbox can still show unknown dispos once visible without requiring notif history.

**[Category #3]**: Organizer create-alert (opt-in)
_Concept_: On draft event creation, notify organizers (small set) — optional preference — for error correction and coordination between organizers.
_Novelty_: Inverse of member rule: orgas want early signal, members want late signal.

**[Category #4]**: Availability-open SLA nudge (T-1 month)
_Concept_: If event date is in future but availability not yet opened, notify organizers when within 1 month: « open dispos, event in 1 month ».
_Novelty_: Admin/organizer **ops** notification — not covered by FR31 member intents; new intent family.

#### Row 2 — Draft composition shared (FR22 — « brouillon / bruit orga »)

**Decision (Patrice):** Draft/noisy composition is **organizer-only** visibility — not roster, not assignees.

| Cell | Value |
|------|-------|
| Audience | **Event organizers** (if any) + **season admins** (always fallback responsibility) |
| Push/email auto | Notify orga circle only — draft shared for internal coordination |
| Inbox (member) | **No** — assignees must not see pending slots at draft stage |
| Manual announce (6.10) | Orga may still manually share externally if needed |
| Roster / assignees | **Excluded** until validate |

**Routing rule:** Event organizers optional → season admins are default organizers; troupe admins as ultimate fallback (domain convention).

#### Row 3 — Composition validated (FR23 — two parallel member intents)

**Decision (Patrice):** Validate button triggers **split notifications**:

| Audience | Message | Opt-out |
|----------|---------|---------|
| **Assigned slots** | « Confirme / décline ta participation » — action required | Category pref (8.2) |
| **Rest of roster** | FYI — compo validée, liste des participants | **Opt-out pref** (anti-spam when not concerned) |

| Cell | Assignees | Roster (non-assigned) |
|------|-----------|------------------------|
| Push/email auto | Confirmation request | Informational recap (names listed) |
| Inbox | `composition_confirm_pending` | Optional — FYI only, no required action |
| Signal orga (J-7 incomplete) | Event organizers first; **fallback season/troupe admins** if no event organizers | — |

**Escalation J-7 (confirmed):** Daily orga nag when compo incomplete → **event organizers**; cascade to **admins** when event organizers absent.

---

### Ideas captured (continued)

**[Category #6]**: Draft compo = orga-only channel
_Concept_: Sharing draft composition notifies only event organizers + season admins; roster and assignees excluded until validate.
_Novelty_: « Publish draft » ≠ « notify members » — internal coordination signal, not FR31 member intent as commonly read.

**[Category #7]**: Validate = dual-audience split
_Concept_: On validate: (A) assignees get confirmation-request notif; (B) remaining roster gets informational validated-team listing.
_Novelty_: Same domain transition, two intents, two templates, two eligibility filters.

**[Category #8]**: Roster FYI opt-out
_Concept_: Informational « team validated » notif to non-assigned roster members is category-opt-out (FR30/8.2) to avoid spam for uninvolved members.
_Novelty_: Opt-out on *informational* not *action-required* — distinct pref from confirmation request.

#### Row 4 — Team complete / all confirmations in (FR28 → complete)

**Decision (Patrice):** « Équipe confirmée / bouclée » is an **organizer ops** signal — not a member broadcast.

| Cell | Value |
|------|-------|
| Audience | **Event organizers** + **season admins** (+ troupe admins in cascade if needed) |
| Assignees who already confirmed | **No further notif** — they can revisit app for compo changes |
| Rest of roster | **No** — would be spam; orgas own the « is team complete? » concern |
| Push/email auto | Orga-only intent `TEAM_COMPLETE` (ops), distinct from member intents |
| Inbox (member) | N/A at complete transition |

**Contrast with Row 3:** At **validate**, non-assigned roster may get optional FYI listing. At **complete**, silence for members — closure is for orgas only.

---

### Ideas captured (continued)

**[Category #10]**: Complete = orga closure signal only
_Concept_: When composition reaches complete (all required confirmations/waivers), notify organizer circle only — not assignees, not roster.
_Novelty_: Reverses typical « everyone gets recap » pattern; confirmed participants explicitly excluded from further push.

#### Persona 1 — Léa (membre roster) — insights

**New member intents (Patrice):**
- **J-7 + J-1 reminders** for assignees who already confirmed: « N'oublie pas, tu es sélectionné(e) le [date] — voici les infos compo ; si impossible, décline. »
- Not « spam lifecycle » but **presence reminders** with comp context — distinct from orga ops nags.

**FYI validate clarified:** At validate, non-assigned roster members receive informational push/email listing who made the team (optional category pref). Léa not assigned → she may receive this listing; opt-out avoids noise when uninvolved.

**Tension B — no push:**
- Inbox remains source of truth
- Email as second channel (prefs 8.2)
- **App icon badge** = inbox action count (PWA) — less intrusive than push; technical feasibility TBD (badging API varies iOS/Android)

**Tension C — compo changes (Patrice rules):**
| Situation | Notify Léa? |
|-----------|-------------|
| Confirmed; someone else declines; gap filled elsewhere | **No** — her confirmation stands |
| Removed from composition by organizer | **Yes** — « tu n'es plus dans l'équipe » |
| Re-added / must confirm again after remodel | **Yes** — standard confirmation request |

**Uninstall trigger (Léa):** TBD in session — likely FYI spam if opt-out hidden; missing removal-notif if dropped from compo silently.

---

### Ideas captured (Phase 2 — Persona 1)

**[Category #12]**: Assignee presence reminders (J-7, J-1)
_Concept_: Even after confirmation, send readiness reminders with event/comp info and decline CTA — life happens, people forget shows.
_Novelty_: Extends « notif ends at confirm » with time-based **reminder** family, not status recap.

**[Category #13]**: Inbox badge on PWA icon
_Concept_: Badge count mirrors `/me/inbox` actions — alternative/supplement when push denied.
_Novelty_: Third « surface » between pull (open app) and push — OS-level affordance without notification permission.

**[Category #14]**: Removal-from-composition alert
_Concept_: Mandatory member notif when assignee slot deleted / participant removed from validated compo — prevent false belief of still being selected.
_Novelty_: Exception to silence-after-confirm; event-driven not schedule-driven.

#### Persona 2 — Marc (admin saison / orga) — insights

**P1 Saturation (Patrice):** **Status quo** — separate notifs per event, no digest. Realistic load ~1 compo/week, 3–4/month max; distributing work across orgas is intentional.

**P2 Manual re-releases (Patrice):**
- Keep **manual** alongside automatic — different deadlines, comm team timing, orga availability windows.
- Manual ≠ duplicate of auto cron — complementary.
- **6.10 extension:** one-click **manual availability reminder** (« on attend ta dispo ») with customizable message, when roster response insufficient.
- **Anti-spam guard:** if reminder sent recently, UI warns: « Un rappel a déjà été envoyé il y a X jours — confirmer l'envoi ? »

---

### Ideas captured (Phase 2 — Persona 2)

**[Category #16]**: Per-event orga notifs (no digest)
_Concept_: Each event generates its own orga ops signals; no rollup digest — acceptable given ~1 compo/week typical load.
_Novelty_: Rejects consolidation pattern; trusts frequency stays low in practice.

**[Category #17]**: Manual availability nudge (6.10+)
_Concept_: Organizer-triggered « waiting for your availability » reminder — editable template, one click from event context, additive to automatic SLA/cron reminders.
_Novelty_: New manual intent distinct from Share/Announce compo — targets dispo gap not composition news.

#### Persona 3 — PO (Patrice) — MEP scope decisions

| Question | Decision |
|----------|----------|
| **Q1** Draft/publication event state | **P0 MEP** — blocks 8.3; cannot simulate publish=create |
| **Q2** Validate notifications | **MEP = assignees only**; roster FYI → **P1** (with 8.2 opt-out) |
| **Q3** Auto orga reminders (SLA, J-7 daily, etc.) | **P2** — Epic 8.x / 8.4+ post-MEP |

### MEP slice (confirmed)

**P0 MEP:** event draft→publish domain; member notif on open dispos; assignee confirmation on validate; unified push+email dispatcher; 8.1 global opt-in; inbox 17.21 unchanged.

**P1 post-MEP:** roster FYI opt-out; assignee J-7/J-1 presence reminders; removal-from-compo + re-confirm; manual dispo nudge 6.10 + recent-send guard.

**P2 post-MVP:** all OrganizerIntent ops family; PWA inbox badge; full announce hub refonte.

### Phase 3 — Reverse brainstorming (complete)

**Anti-patterns → principles (validated 2026-06-01):**

| ID | Anti-pattern | Principle |
|----|--------------|-----------|
| R1 | Push creates persistent inbox log | Inbox = derived domain state, not send log |
| R2 | Notify whole roster at every milestone | Intent → audience matrix (orga vs assignees vs roster FYI) |
| R3 | Remove from compo silently | Mandatory removal alert |
| R4 | Open dispos at draft create | Publish gate before member ping |
| R5 | Manual reminder spam without warning | Recent-send guard on manual path |
| R6 | Divergent push/email category models | One intent enum, N channels filtered per pref |
| R7 | Post-confirm status recap spam | Participant budget: action + presence reminders only |
| R8 | No push = invisible member | Fallback: inbox + email + badge (P1/P2) |

**Normative principles (SPEC / ADR candidates):**
1. Pull/push separation — shared domain source, different UX surfaces
2. Intent → audience → channels — stable enum, no broadcast-by-default
3. Publish before ping (members)
4. Orga early, member late
5. Silence after confirm, except presence reminders / removal / re-confirm
6. Manual sends guarded — auto + manual coexist; manual throttled in UX
7. MEP honesty — 8.3 = P0 slice; orga ops auto = explicit Epic 8.x

---

## Session summary

**Total ideas:** 18 + MEP scope + 8 principles  
**Key domain addition:** event `draft` → `open_for_availability` → member notifications  
**Epic impact:** Epic 3 (lifecycle) + Epic 8 split (8.3 MEP, 8.2 P1 categories, 8.4+ orga ops, 6.10 manual nudge)  
**FR31 drift:** draft compo = orga-only; complete recap = orga-only; new member intents (presence J-7/J-1, removal)

**Recommended next step:** `bmad-correct-course` → sprint change proposal updating epics, PLAN, FR31 split, story breakdown.

**Session status:** complete — ready for correct-course handoff



_Concept_: Before manual nudge send, surface last-sent timestamp and require explicit confirm if within N days — reduces orga accidental spam.
_Novelty_: UX guardrail only on manual path; auto reminders exempt or use separate throttle policy.

_Concept_: If organizer reshuffles and assignee must confirm again, treat as fresh CONFIRMATION_REQUEST.
_Novelty_: Explicit re-entry rule for dispatcher eligibility.


_Concept_: Once an assignee confirms participation, no further lifecycle notifs unless re-assigned or gap-fill; app is source of truth for compo changes.
_Novelty_: « Notification budget » per participant — action notifs only, no status recap spam.

