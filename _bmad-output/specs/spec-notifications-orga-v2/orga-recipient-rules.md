# Organizer recipient rules (v2 — explicit delegation)

Supersedes 8.4 implicit cascade and “circle” for `COMPOSITION_SHARED`.

## Domain: event organizers at creation (CAP-7)

On **event create**:

1. Copy all **season organizers** → **event organizers**.
2. If no season organizers: promote active **troupe admins** to **season organizers**, then copy to event organizers.
3. Result: **≥1 event organizer** always; list is **visible to members** (contact).

After creation:

- Add/remove event organizers is **manual** (UI/API).
- **Cannot remove the last** event organizer without assigning a replacement first.
- Season organizer list and event organizer list **do not auto-sync** on later changes.

## Per-intent audiences (CAP-5)

| Intent | Pref key | Audience | Rationale |
|--------|----------|----------|-----------|
| `EVENT_DRAFT_CREATED` | `ORG_EVENT_DRAFT_CREATED` | **Season organizers** | New spectacle is a season-level fact |
| `COMPOSITION_SHARED` | `ORG_DRAFT_COMPOSITION` | **Event organizers** | Operational delegation |
| `TEAM_COMPLETE` | `ORG_TEAM_COMPLETE` | **Event organizers** | Operational delegation |
| `TEAM_REGRESSED` | `ORG_TEAM_REGRESSED` | **Event organizers** | Operational delegation |
| `SLA_OPEN_AVAILABILITY` | `ORG_SLA_OPEN_AVAILABILITY` | **Event organizers** + **season organizers** | Escalation — work not done |
| `COMPOSITION_INCOMPLETE_WEEKLY` | `ORG_COMPOSITION_INCOMPLETE` | **Event organizers** + **season organizers** | Escalation |
| `COMPOSITION_INCOMPLETE_DAILY_J7` | `ORG_COMPOSITION_INCOMPLETE` | **Event organizers** + **season organizers** | Escalation |
| `ORGANIZER_SCOPE_GRANTED` | `ORG_SCOPE_GRANTED` (optional push) | **Granted user** | See `role-promotion-alerts.md` |

### Scheduled reminder dedupe

When a user is both event and season organizer, they receive **at most one** email/push per intent per scheduled job tick (same SLA window / same weekly batch).

### Actor exclusion

Retain 8.4 behaviour where `actorUserId` excludes the actor from ops recipients when applicable (e.g. creator on draft-created if they are the acting season orga).

## Retired: 8.4 cascade resolver

```
// OLD — do not use for v2 orga ops intents
event orga → else season orga → else troupe admin
```

Resolver reads **explicit lists** per intent row above. Empty event organizer list **must not occur** (CAP-7 invariant).

## Recette matrix (Pierrick + Charlene)

| Setup | Pierrick (season) | Charlene (event) |
|-------|-------------------|------------------|
| Event created; Pierrick copied to event orgas | `EVENT_DRAFT_CREATED` ✓ (season) | — |
| Pierrick removes self; Charlene sole event orga | — | compo / complete / regression ✓ |
| Pierrick stays co-event orga | `EVENT_DRAFT_CREATED` ✓ | compo / complete / regression ✓ (both if both event orgas) |
| SLA reminder; Charlene inactive | ✓ (season escalation) | ✓ (event) — **one** mail each if both opted in and both roles |

## Platform super-admin

Not in orga recipient lists unless also season/event organizer or `TROUPE_ADMIN` on the troupe.
