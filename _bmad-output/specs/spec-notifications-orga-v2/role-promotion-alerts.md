# Role promotion alerts

## Intent

`ORGANIZER_SCOPE_GRANTED` — one-shot when coordination scope is newly granted.

## When to fire

| Grant action | Scope | Dedupe key |
|--------------|-------|------------|
| `grantEventOrganizer` | event `{eventId}` | user + eventId |
| `grantSeasonOrganizer` | season `{seasonId}` | user + seasonId |
| Troupe membership promoted to `TROUPE_ADMIN` | troupe `{troupeId}` | user + troupeId |

Do **not** re-fire on idempotent grant (existing membership row unchanged).

## Recipient

Always the **granted user**.

## Delivery model (OQ-2 resolved)

| Channel | Rule |
|---------|------|
| **Email** | **Transactional** — always sent once on grant, **exempt** from ops `ORG_*` opt-in. Service/account notification with CTA to `/compte/notifications`. |
| **Push** | Only if optional pref `ORG_SCOPE_GRANTED` push is ON (default OFF). |

Ops prefs (`ORG_TEAM_COMPLETE`, etc.) are **not** auto-enabled on grant (CAP-2).

## Preference row (optional push repeat)

- Title: **Nouveau rôle orga**
- Description: Me prévenir par notification push quand on m’ajoute comme orga de spectacle, orga de saison ou admin de troupe.
- Default: push OFF, email OFF for **this pref** — transactional grant email is independent.

## Copy (French)

**Transactional email**

- Subject: `Tu es {roleLabel} sur HatCast`
- Body: `Tu viens d’être nommé·e {roleLabel} pour {scopeName}. Active les alertes organisateur qui t’intéressent dans Mon compte → Notifications : {prefsUrl}`

`roleLabel`: `organisateur du spectacle`, `organisateur de saison`, `admin de la troupe`.

## Non-goals

- Notify other orgas that someone was promoted.
- Revocation alerts.
- Repeat transactional email on every co-org add if user already had scope on that troupe/season (dedupe).
